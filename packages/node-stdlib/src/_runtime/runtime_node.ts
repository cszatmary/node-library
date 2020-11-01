// Copyright (c) 2020 Christopher Szatmary <cs@christopherszatmary.com>
// All rights reserved. MIT License.

/* eslint-disable @typescript-eslint/no-explicit-any */

// This file contains the Node specific implementation of the runtime API.

import { inspect } from "util";
import type { Runtime } from "./runtime";

const env = {
  get(key: string): string | undefined {
    return process.env[key];
  },
  set(key: string, value: string): void {
    process.env[key] = value;
  },
  delete(key: string): void {
    delete process.env[key];
  },
};

export const runtime: Runtime = {
  env,
  exit: process.exit,
  // TS doesn't like assigning a unique symbol
  customInspect: inspect.custom as any,
  // TS doesn't like the inspect has multiple signatures
  // The interface required is a subset of what inspect offers so this is fine
  inspect: inspect as any,
};
