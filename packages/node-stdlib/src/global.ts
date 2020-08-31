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
  // eslint-disable-next-line @typescript-eslint/naming-convention
  interface error {
    error(): string;
    detailedError(): string;
  }
}

/**
 * Globally available symbols.
 */
export const symbols = Object.freeze({
  copy: Symbol.for("node-stdlib.copy"),
}) as {
  readonly copy: unique symbol;
};

// Copy toString so we don't need to import from the util module
function toString(v: unknown): string {
  if (v === undefined) {
    return "undefined";
  } else if (v === null) {
    return "null";
  } else if (typeof v === "string") {
    return v;
  } else if (typeof v === "boolean" || typeof v === "number") {
    return v.toString();
  }

  // Inline isError so we don't need to import from the errors module
  const err = v as error;
  if (typeof err.error === "function" && typeof err.detailedError === "function") {
    return err.error();
  }

  // Inline Stringer
  const s = v as { toString(): string };
  if (typeof s.toString === "function" && s.toString !== Object.prototype.toString) {
    return s.toString();
  }

  return inspect(v);
}

/**
 * Allows the program to be terminated with a message and a stack trace
 * when the program reaches an unrecoverable state.
 * @param msg A message to display when the program terminates.
 */
export function panic(v: unknown): never {
  const exception = new Error(toString(v));
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
export function* range(lower: number, upper: number, step = 1): Generator<number, void> {
  for (let i = lower; i < upper; i += step) {
    yield i;
  }
}
