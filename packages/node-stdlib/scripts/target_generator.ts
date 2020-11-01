/* eslint-disable import/no-extraneous-dependencies */

import fs from "fs";
import path from "path";
import rimraf from "rimraf";
import ts from "typescript";

function fail(msg: string): never {
  console.error(msg);
  process.exit(1);
}

interface TargetConfig {
  entrypoint?: {
    name: string;
    includeExtension: boolean;
  };
  deleteImports?: string[];
  replace?: Record<string, string>;
}

interface Config {
  targets: Record<string, TargetConfig | undefined>;
  global: string[];
  modules: Record<string, string>;
}

interface Target {
  name: string;
  entrypoint?: {
    name: string;
    includeExtension: boolean;
  };
  deleteImports: string[];
  replace: Map<string, string>;
  globals: string[];
  modules: string[];
}

function parseConfig(rootDir: string, targetName: string): Target {
  const data = fs.readFileSync(path.join(rootDir, "targets.json"), { encoding: "utf-8" });
  const config: Config = JSON.parse(data);
  const targetConfig = config.targets[targetName];
  if (targetConfig === undefined) {
    fail(`No such target: ${targetName}`);
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

  return {
    name: targetName,
    entrypoint: targetConfig.entrypoint,
    deleteImports: targetConfig.deleteImports ?? [],
    replace,
    globals: config.global,
    modules,
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

        if (target.deleteImports.includes(module)) {
          return undefined;
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

      if (ts.isComputedPropertyName(node)) {
        // TODO: This is hardcoded for inspect.custom, make this generic
        if (ts.isPropertyAccessExpression(node.expression)) {
          if (ts.isIdentifier(node.expression.expression)) {
            const propertyName = `${node.expression.expression.text}.${node.expression.name.text}`;
            const replaceName = target.replace.get(propertyName);
            if (replaceName !== undefined) {
              const parts = replaceName.split(".");
              return context.factory.createComputedPropertyName(
                context.factory.createPropertyAccessExpression(
                  context.factory.createIdentifier(parts[0]),
                  parts[1],
                ),
              );
            }
          }
        }

        return node;
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

// Generate target files
const program = ts.createProgram([path.join(srcDir, "index.ts")], {});
const printer = ts.createPrinter();
const header = "// THIS IS AN AUTOGENERATED FILE. DO NOT EDIT THIS FILE DIRECTLY\n";

rimraf.sync(dstDir);
fs.mkdirSync(dstDir, { recursive: true });
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

// Create entrypoint if needed
if (target.entrypoint !== undefined) {
  const lines = [header];
  const extension = target.entrypoint.includeExtension ? ".ts" : "";
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
