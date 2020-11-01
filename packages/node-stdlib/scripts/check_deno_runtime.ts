/* eslint-disable import/no-extraneous-dependencies */

import cp from "child_process";
import fs from "fs";
import path from "path";
import ts from "typescript";

function red(s: string): string {
  return `\x1b[31m${s}\x1b[39m`;
}

function yellow(s: string): string {
  return `\x1b[33m${s}\x1b[39m`;
}

function cyan(s: string): string {
  return `\x1b[36m${s}\x1b[39m`;
}

const rootDir = path.resolve(__dirname, "../");
const runtimeDir = path.join(rootDir, "src", "_runtime");
const denoRuntimePath = path.join(runtimeDir, "runtime_deno.ts");
const denoDeclarationsPath = path.join(runtimeDir, "deno.d.ts");

// Generate the deno declarations
const fd = fs.openSync(denoDeclarationsPath, "w");
cp.spawnSync("deno", ["types"], { stdio: ["ignore", fd, "inherit"] });
fs.closeSync(fd);

const program = ts.createProgram([denoRuntimePath], {
  noEmit: true,
});
const emitResult = program.emit();
let numErrors = 0;

const diagnostics = ts.getPreEmitDiagnostics(program).concat(emitResult.diagnostics);
for (const diagnostic of diagnostics) {
  if (diagnostic.file !== undefined) {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const positions = diagnostic.file.getLineAndCharacterOfPosition(diagnostic.start!);
    const line = `${positions.line + 1}`;
    const char = `${positions.character + 1}`;
    const message = ts.flattenDiagnosticMessageText(diagnostic.messageText, "\n");

    const fileText = `${cyan(diagnostic.file.fileName)}:${yellow(line)}:${yellow(char)}`;
    let typeText = "";
    switch (diagnostic.category) {
      case ts.DiagnosticCategory.Error:
        numErrors++;
        typeText = red("error");
        break;
      case ts.DiagnosticCategory.Warning:
        typeText = yellow("warning");
        break;
      case ts.DiagnosticCategory.Suggestion:
        typeText = "suggestion";
        break;
      default:
        typeText = "message";
        break;
    }

    console.log(`${fileText} - ${typeText}: ${message}`);
  } else {
    console.log(ts.flattenDiagnosticMessageText(diagnostic.messageText, "\n"));
  }
}

if (numErrors > 0) {
  if (numErrors === 1) {
    console.log("\nFound 1 error.");
  } else {
    console.log(`\nFound ${numErrors} errors.`);
  }

  process.exit(1);
}
