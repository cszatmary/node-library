// Copyright (c) 2020 Christopher Szatmary <cs@christopherszatmary.com>
// All rights reserved. MIT License.

import fs from "fs";
import { Result } from "../core/mod";

export function fileExists(path: fs.PathLike): Promise<boolean> {
  return fs.promises
    .access(path, fs.constants.F_OK)
    .then(() => true)
    .catch(() => false);
}

export function fileExistsSync(path: fs.PathLike): boolean {
  try {
    fs.accessSync(path, fs.constants.F_OK);
    return true;
  } catch {
    return false;
  }
}
