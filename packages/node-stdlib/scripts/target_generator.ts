import cp from "child_process";
import fs from "fs";
import path from "path";
import rimraf from "rimraf";
import ts from "typescript";

function fail(msg: string): never {
  console.error(msg);
  process.exit(1);
}

enum Action {
  compile,
  transform,
}

interface TargetConfig {
  action: string;
  requiresRuntime?: boolean;
  entrypoint?: {
    name: string;
    includeExtension: boolean;
  };
  deleteImports?: string[];
  replace?: Record<string, string>;
  tsconfigPath?: string;
}

interface Config {
  targets: Record<string, TargetConfig | undefined>;
  global: string[];
  modules: Record<string, string>;
}

interface Target {
  name: string;
  action: Action;
  requiresRuntime: boolean;
  entrypoint?: {
    name: string;
    includeExtension: boolean;
  };
  deleteImports: string[];
  replace: Map<string, string>;
  globals: string[];
  modules: string[];
  tsconfigPath?: string;
}

function parseConfig(rootDir: string, targetName: string): Target {
  const data = fs.readFileSync(path.join(rootDir, "targets.json"), { encoding: "utf-8" });
  const config: Config = JSON.parse(data);
  const targetConfig = config.targets[targetName];
  if (targetConfig === undefined) {
    fail(`No such target: ${targetName}`);
  }

  let action: Action;
  switch (targetConfig.action) {
    case "compile":
      action = Action.compile;
      break;
    case "transform":
      action = Action.transform;
      break;
    default:
      fail(`Unrecognized action: "${targetConfig.action}"`);
  }

  const modules: string[] = [];
  for (const [m, t] of Object.entries(config.modules)) {
    // Make sure module is supported by target
    if (t === "*" || t.includes(targetName)) {
      modules.push(m);
    }
  }

  const replace = new Map<string, string>();
  for (const [k, v] of Object.entries(targetConfig.replace ?? {})) {
    replace.set(k, v);
  }

  let tsconfigPath: string | undefined;
  if (targetConfig.tsconfigPath !== undefined) {
    tsconfigPath = path.resolve(rootDir, targetConfig.tsconfigPath);
  }

  return {
    name: targetName,
    action,
    requiresRuntime: targetConfig.requiresRuntime ?? false,
    entrypoint: targetConfig.entrypoint,
    deleteImports: targetConfig.deleteImports ?? [],
    replace,
    globals: config.global,
    modules,
    tsconfigPath,
  };
}

class Source {
  file: string;
  module?: string;

  constructor(file: string, module?: string) {
    this.file = file;
    this.module = module;
  }

  path(root: string): string {
    return path.join(root, this.module ?? "", this.file);
  }

  toString(): string {
    if (this.module === undefined) {
      return this.file;
    }
    return `${this.module}/${this.file}`;
  }
}

// BEGIN SCRIPT //

const args = process.argv.slice(2);
if (args.length === 0) {
  fail("target name required as the first argument");
}

const targetName = args[0];
const rootDir = path.resolve(__dirname, "../");
const srcDir = path.join(rootDir, "src");
const dstDir = path.join(rootDir, "dist", targetName);
const runtimeDir = path.join(srcDir, "_runtime");
const target = parseConfig(rootDir, targetName);

const srcs: Source[] = [];

for (const g of target.globals) {
  srcs.push(new Source(g));
}

for (const m of target.modules) {
  // Module is a dir, need to get all files
  const files = fs.readdirSync(path.join(srcDir, m));
  for (const f of files) {
    srcs.push(new Source(f, m));
  }
}

const transformer: ts.TransformerFactory<ts.SourceFile> = (context) => {
  return (sourceFile): ts.SourceFile => {
    const visitor = (node: ts.Node): ts.Node | undefined => {
      // Add .ts extension to imports
      if (ts.isImportDeclaration(node)) {
        if (node.moduleSpecifier == null || !ts.isStringLiteral(node.moduleSpecifier)) {
          return node;
        }

        const module = node.moduleSpecifier.text;

        // Check if any matching imports to delete
        for (const im of target.deleteImports) {
          if (module.includes(im)) {
            return undefined;
          }
        }

        return context.factory.updateImportDeclaration(
          node,
          node.decorators,
          node.modifiers,
          node.importClause,
          context.factory.createStringLiteral(`${module}.ts`, false),
        );
      }

      // Add .ts extension to re-exports
      if (ts.isExportDeclaration(node)) {
        if (node.moduleSpecifier == null || !ts.isStringLiteral(node.moduleSpecifier)) {
          return node;
        }

        const module = node.moduleSpecifier.text;
        return context.factory.updateExportDeclaration(
          node,
          node.decorators,
          node.modifiers,
          false,
          node.exportClause,
          context.factory.createStringLiteral(`${module}.ts`, false),
        );
      }

      if (ts.isIdentifier(node)) {
        const replaceName = target.replace.get(node.text);
        if (replaceName !== undefined) {
          return context.factory.createIdentifier(replaceName);
        }
      }

      return ts.visitEachChild(node, visitor, context);
    };

    return ts.visitNode(sourceFile, visitor);
  };
};

// Delete any old files
rimraf.sync(dstDir);
fs.mkdirSync(dstDir, { recursive: true });

const header = "// THIS IS AN AUTOGENERATED FILE. DO NOT EDIT THIS FILE DIRECTLY\n";

// Generate target files
if (target.action === Action.compile) {
  const tscArgs = ["--outDir", dstDir];
  if (target.tsconfigPath !== undefined) {
    tscArgs.push("-p", target.tsconfigPath);
  }
  const result = cp.spawnSync("tsc", tscArgs, { stdio: "inherit" });
  if (result.status !== 0) {
    console.error(`Failed to compile ${target.name} target`);
    if (result.error != null) {
      console.error(result.error);
    }
    process.exit(1);
  }
} else {
  const program = ts.createProgram([path.join(srcDir, "index.ts")], {});
  const printer = ts.createPrinter();

  for (const s of srcs) {
    const source = program.getSourceFile(s.path(srcDir));
    if (source === undefined) {
      fail(`Could not find source file ${s}`);
    }

    const result = ts.transform(source, [transformer]);

    const dstPath = s.path(dstDir);
    fs.mkdirSync(path.dirname(dstPath), { recursive: true });
    const contents = `${header}\n${printer.printFile(result.transformed[0])}`;
    fs.writeFileSync(dstPath, contents);
  }
}

// Create entrypoint if needed
if (target.entrypoint !== undefined) {
  const lines = [header];
  let extension = "";
  if (target.entrypoint.includeExtension) {
    extension = ".ts";
  }

  for (const g of target.globals) {
    lines.push(`export * from "./${path.basename(g, ".ts")}${extension}"`);
  }

  for (const m of target.modules) {
    lines.push(`export * as ${m} from "./${m}/mod${extension}"`);
  }

  // Add trailing newline
  lines.push("");

  const filename = path.join(dstDir, target.entrypoint.name);
  fs.writeFileSync(filename, lines.join("\n"));
}

// Create runtime if required
if (target.requiresRuntime) {
  const dstRuntimeDir = path.join(dstDir, "_runtime");
  fs.mkdirSync(dstRuntimeDir, { recursive: true });

  const declarationFiles: string[] = [];
  // _target.ts suffix stripped
  const runtimeFiles: string[] = [];
  for (const f of fs.readdirSync(runtimeDir)) {
    if (f.endsWith(".d.ts")) {
      declarationFiles.push(path.basename(f));
    }

    // Runtime file names are of the form *_target.ts
    const parts = path.basename(f, ".ts").split("_");
    if (parts.pop() === target.name) {
      runtimeFiles.push(parts.join("_"));
    }
  }

  // If compile we need to copy all .d.ts files and remove any existing ones
  if (target.action === Action.compile) {
    for (const f of fs.readdirSync(dstRuntimeDir)) {
      const srcPath = path.join(dstRuntimeDir, f);
      if (f.endsWith(".d.ts")) {
        // Remove *_target.d.ts
        fs.unlinkSync(srcPath);
        continue;
      }

      // Remove _target suffix from file name
      const parts = path.basename(f, ".js").split("_");
      if (parts.pop() === target.name) {
        const fileName = `${parts.join("_")}.js`;
        fs.renameSync(srcPath, path.join(dstRuntimeDir, fileName));
      }
    }

    for (const df of declarationFiles) {
      const dstPath = path.join(dstRuntimeDir, df);
      fs.copyFileSync(path.join(runtimeDir, df), dstPath);
    }
  } else {
    for (const rf of runtimeFiles) {
      const srcPath = path.join(runtimeDir, `${rf}_${target.name}.ts`);
      // If transform we just need to copy the TS file as is
      const dstPath = path.join(dstRuntimeDir, `${rf}.ts`);
      fs.copyFileSync(srcPath, dstPath);
    }
  }
}
