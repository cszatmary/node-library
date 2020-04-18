// Copyright (c) 2020 Christopher Szatmary <cs@christopherszatmary.com>
// All rights reserved. MIT License.

/*
This file contains any global types that are accessable without importing
It also contains any functions that can be imported from the top level of
the package and are not associated with any module.

This file should not import any other files from this library since it
should be able to be imported by any other file.
*/

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

/**
 * Allows the program to be terminated with a message and a stack trace
 * when the program reaches an unrecoverable state.
 * @param msg A message to display when the program terminates.
 */
export function panic(msg: string): never {
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
