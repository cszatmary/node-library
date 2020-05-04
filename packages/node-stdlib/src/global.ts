// Copyright (c) 2020 Christopher Szatmary <cs@christopherszatmary.com>
// All rights reserved. MIT License.

/*
This file contains any global types that are accessable without importing
It also contains any functions that can be imported from the top level of
the package and are not associated with any module.

This file should not import any other files from this library since it
should be able to be imported by any other file.
*/

import { inspect } from "util";

declare global {
  /**
   * An interface representing an error condition.
   */
  // eslint-disable-next-line @typescript-eslint/class-name-casing
  interface error {
    error(): string;
    detailedError(): string;
  }
}

// Copy isError here so we don't need to import from the errors module
function isError(err: unknown): err is error {
  const e = err as error;
  return typeof e.error === "function" && typeof e.detailedError === "function";
}

/**
 * Allows the program to be terminated with a message and a stack trace
 * when the program reaches an unrecoverable state.
 * @param msg A message to display when the program terminates.
 */
export function panic(v: unknown): never {
  let msg: string;
  if (typeof v === "string") {
    msg = v;
  } else if (isError(v)) {
    msg = v.error();
  } else {
    msg = inspect(v);
  }

  const exception = new Error(msg);
  exception.name = "panic";
  // Remove first line of stack trace since it is in this function
  Error.captureStackTrace(exception, panic);
  throw exception;
}

/**
 * Creates a range from `lower` up to, but not including, `upper`.
 * @param step The amount by which the range increases at each step.
 * Defaults to `1`.
 */
export function* range(
  lower: number,
  upper: number,
  step = 1,
): Generator<number, void> {
  for (let i = lower; i < upper; i += step) {
    yield i;
  }
}

/**
 * Asynchronously waits for `ms` milliseconds.
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

/**
 * Synchronously waits for `ms` milliseconds.
 *
 * **NOTE:** This will block the NodeJS thread. Use with care!
 */
export function sleepSync(ms: number): void {
  Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms);
}
