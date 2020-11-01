// Copyright (c) 2020 Christopher Szatmary <cs@christopherszatmary.com>
// All rights reserved. MIT License.

// This file describes the common runtime API exposed to this library.
// This allows these APIs to be used independently of what environment
// the code is running in, either Node or Deno.

// In Node most of these APIs will map to the global `process` object.
// In Deno most of these APIs will map to the global `Deno` object.

interface Env {
  get(key: string): string | undefined;
  set(key: string, value: string): void;
  delete(key: string): void;
}

interface InspectOptions {
  colors?: boolean;
  compact?: boolean;
  depth?: number;
  showProxy?: boolean;
  sorted?: boolean;
  getters?: boolean;
}

export interface Runtime {
  readonly env: Env;
  exit(code?: number): never;
  readonly customInspect: unique symbol;
  inspect(value: unknown, options?: InspectOptions): string;
}

export declare const runtime: Runtime;
