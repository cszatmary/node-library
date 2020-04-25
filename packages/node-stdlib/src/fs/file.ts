// Copyright (c) 2020 Christopher Szatmary <cs@christopherszatmary.com>
// All rights reserved. MIT License.

import * as fs from "./fs";
import { rimraf, rimrafSync } from "./rm";
import { Result } from "../core/mod";

/**
 * Asynchronously checks if the given path exists.
 */
export async function fileExists(path: fs.PathLike): Promise<boolean> {
  const r = await fs.access(path);
  return r.isSuccess();
}

/**
 * Synchronously checks if the given path exists.
 */
export function fileExistsSync(path: fs.PathLike): boolean {
  return fs.accessSync(path).isSuccess();
}

/**
 * Asynchronously removes the file or empty directory at the given path.
 */
export async function remove(path: fs.PathLike): Promise<Result<void, Error>> {
  const unlinkRes = await fs.unlink(path);
  if (unlinkRes.isSuccess()) {
    return unlinkRes;
  }

  const rmdirRes = await fs.rmdir(path);
  if (rmdirRes.isSuccess()) {
    return rmdirRes;
  }

  // Both failed, figure out which error to return
  const rmdirErr = rmdirRes.failure() as NodeJS.ErrnoException;
  return rmdirErr.code !== "ENOTDIR" ? rmdirRes : unlinkRes;
}

/**
 * Synchronously removes the file or empty directory at the given path.
 */
export function removeSync(path: fs.PathLike): Result<void, Error> {
  const unlinkRes = fs.unlinkSync(path);
  if (unlinkRes.isSuccess()) {
    return unlinkRes;
  }

  const rmdirRes = fs.rmdirSync(path);
  if (rmdirRes.isSuccess()) {
    return rmdirRes;
  }

  // Both failed, figure out which error to return
  const rmdirErr = rmdirRes.failure() as NodeJS.ErrnoException;
  return rmdirErr.code !== "ENOTDIR" ? rmdirRes : unlinkRes;
}

/**
 * Asynchronously removes path and any children it contains.
 * It removes everything it can but returns the first error it encounters.
 * If the path does not exist, `removeAll` does nothing.
 */
export function removeAll(path: fs.PathLike): Promise<Result<void, Error>> {
  return new Promise((resolve) => {
    rimraf(path, (e) => {
      if (e) {
        resolve(Result.failure(e));
      }

      resolve(Result.success(undefined));
    });
  });
}

/**
 * Synchronously removes path and any children it contains.
 * It removes everything it can but returns the first error it encounters.
 * If the path does not exist, `removeAll` does nothing.
 */
export function removeAllSync(path: fs.PathLike): Result<void, Error> {
  try {
    rimrafSync(path);
    return Result.success(undefined);
  } catch (e) {
    return Result.failure(e);
  }
}
