import fs from "fs";
import path from "path";

import { Result } from "../core/mod";

function findExecutableUnix(file: string): Error | undefined {
  const r = Result.of(() => {
    return fs.statSync(file);
  });

  if (r.isFailure) {
    return r.error();
  }

  const s = r.get();
  // eslint-disable-next-line no-bitwise
  if (!s.isDirectory() && (s.mode & 0o111) !== 0) {
    return undefined;
  }

  return new Error(`permission denied: ${file}`);
}

function lookPathUnix(file: string): Result<string, Error> {
  if (file.includes("/")) {
    const err = findExecutableUnix(file);
    if (err) {
      return Result.failure(err);
    }

    return Result.success(file);
  }

  const envPath = process.env.PATH ?? "";
  for (let dir of envPath.split(path.delimiter)) {
    if (dir === "") {
      // In unix "" means "."
      dir = ".";
    }

    const p = path.join(dir, file);
    const err = findExecutableUnix(p);
    if (!err) {
      return Result.success(p);
    }
  }

  return Result.failure(new Error(`${file} not found in PATH`));
}

function chkStatWin(file: string): Error | undefined {
  const r = Result.of(() => {
    return fs.statSync(file);
  });

  if (r.isFailure) {
    return r.error();
  }

  if (r.get().isDirectory()) {
    return new Error(`permission denied: ${file}`);
  }

  return undefined;
}

function findExecutableWin(
  file: string,
  exts: string[],
): Result<string, Error> {
  if (exts.length === 0) {
    const err = chkStatWin(file);
    return err ? Result.failure(err) : Result.success(file);
  }

  if (path.win32.extname(file) !== "") {
    if (!chkStatWin(file)) {
      return Result.success(file);
    }
  }

  for (const e of exts) {
    const f = file + e;
    if (!chkStatWin(f)) {
      return Result.success(f);
    }
  }

  return Result.failure(new Error(`file ${file} does not exist`));
}

function lookPathWin(file: string): Result<string, Error> {
  let exts: string[] = [];
  const pathExt = process.env.PATHEXT ?? "";

  if (pathExt !== "") {
    for (let e of pathExt.toLowerCase().split(";")) {
      if (e === "") {
        continue;
      }

      if (e[0] !== ".") {
        e = `.${e}`;
      }

      exts.push(e);
    }
  } else {
    exts = [".com", ".exe", ".bat", ".cmd"];
  }

  if ([":", "\\", "/"].some((c) => file.includes(c))) {
    return findExecutableWin(file, exts);
  }

  const res = findExecutableWin(path.join(".", file), exts);
  if (res.isSuccess) {
    return res;
  }

  const envPath = process.env.path ?? "";
  for (const dir of envPath.split(path.delimiter)) {
    const r = findExecutableWin(path.join(dir, file), exts);
    if (r.isSuccess) {
      return r;
    }
  }

  return Result.failure(new Error(`${file} not found in PATH`));
}

/**
 * Searches for an executable in the directories named by the PATH environment variable.
 * On Windows it also takes PATHEXT environment variable into account.
 * @param file The file to get the path of.
 * @returns A Result with the path or an error.
 */
export function lookPath(file: string): Result<string, Error> {
  if (/^win/i.test(process.platform)) {
    return lookPathWin(file);
  }

  return lookPathUnix(file);
}

/**
 * Checks if the given command is available to run.
 * @param command The command to check the existance of.
 */
export function isCommandAvailable(command: string): boolean {
  return lookPath(command).isSuccess;
}
