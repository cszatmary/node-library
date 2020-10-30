// Copyright (c) 2020 Christopher Szatmary <cs@christopherszatmary.com>
// All rights reserved. MIT License.

/*
This file contains any global types that are accessable without importing
It also contains any functions that can be imported from the top level of
the package and are not associated with any module.

This file should not import any other files from this library since it
should be able to be imported by any other file.
*/

import { inspect, InspectOptions } from "util";

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

class Panic extends Error {
  reason: unknown;

  constructor(reason: unknown) {
    super(toString(reason));
    this.name = "panic";
    this.reason = reason;
  }
}

/**
 * Allows the program to be terminated with a message and a stack trace
 * when the program reaches an unrecoverable state.
 * @param msg A message to display when the program terminates.
 */
export function panic(v: unknown): never {
  const p = new Panic(v);
  // Remove first line of stack trace since it is in this function
  Error.captureStackTrace(p, panic);
  // The rare case where throw is allowed
  throw p;
}

/**
 * recover takes an error that was caused by a panic and returns the cause
 * of the panic. This can be useful if you wish to recover from a panic.
 * Recovering from a panic can be done by using a try/catch block.
 * If `e` is `undefined`, `undefined` will be returned. If `e` was
 * not caused by a panic, recover will panic with `e`.
 * @param e The error caught with a catch statement.
 */
export function recover(e: unknown): unknown {
  if (e === undefined) {
    return undefined;
  }

  if (e instanceof Panic) {
    return e.reason;
  }

  panic(e);
}

/**
 * `Ref` provides a way to wrap a value so that it can be used as a reference.
 * This allows functionality similar to that of references or pointers from
 * other languages.
 */
export class Ref<T> {
  #value: T;

  constructor(value: T) {
    this.#value = value;
  }

  /**
   * Sets the value in the Ref to the given `value`.
   */
  set(value: T): void {
    this.#value = value;
  }

  /**
   * Returns the value stored inside the Ref.
   */
  deref(): T {
    return this.#value;
  }

  /**
   * Custom inspect implementation for use with node's `util.inspect`.
   */
  [inspect.custom](depth?: number | null, options?: InspectOptions): string {
    if (depth == null || depth < 0) {
      return "Ref {}";
    }

    const newOpts = {
      ...options,
      depth: options?.depth == null ? null : options.depth - 1,
    };

    const value = inspect(this.#value, newOpts);
    return `Ref { ${value} }`;
  }
}
