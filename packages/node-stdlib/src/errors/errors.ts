// Copyright (c) 2020 Christopher Szatmary <cs@christopherszatmary.com>
// All rights reserved. MIT License.

// This code has been ported largely from the Go library pkg/errors
// Copyright (c) 2015, Dave Cheney <dave@cheney.net>
// All rights reserved.
// https://github.com/pkg/errors/blob/master/LICENSE

/* eslint-disable max-classes-per-file */

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

export interface Causer {
  cause(): error;
}

function isCauser(err: unknown): err is Causer {
  return typeof (err as Causer).cause === "function";
}

/**
 * A trivial implementation of error. A string message.
 */
class ErrorString implements error {
  str: string;

  constructor(str: string) {
    this.str = str;
  }

  error(): string {
    return this.str;
  }

  detailedError(): string {
    return this.str;
  }
}

// JS unfortunately doesn't have structs so this will have to do
// A class seems overkill for this
/**
 * Returns a new error from the given text.
 */
export function errorString(str: string): error {
  return new ErrorString(str);
}

/**
 * A fundamental error type implementing the `error` interface.
 * Contains a message and a stack trace.
 */
class FundamentalError implements error {
  msg: string;
  stack: string;

  constructor(msg: string, stack: string) {
    this.msg = msg;
    this.stack = stack;
  }

  error(): string {
    return this.msg;
  }

  detailedError(): string {
    return `${this.msg}\n${this.stack}`;
  }
}

class ErrorWithStack implements error, Causer {
  err: error;
  stack: string;

  constructor(err: error, stack: string) {
    this.err = err;
    this.stack = stack;
  }

  error(): string {
    return this.err.error();
  }

  detailedError(): string {
    return `${this.cause().detailedError()}\n${this.stack}`;
  }

  cause(): error {
    return this.err;
  }
}

class ErrorWithMessage implements error, Causer {
  err: error;
  msg: string;

  constructor(err: error, msg: string) {
    this.err = err;
    this.msg = msg;
  }

  error(): string {
    return `${this.msg}: ${this.err.error()}`;
  }

  detailedError(): string {
    return `${this.cause().detailedError()}\n${this.msg}`;
  }

  cause(): error {
    return this.err;
  }
}

/**
 * Creates a new error with the given message.
 * It also records the stack trace at the point it was called.
 * @param msg The message to create the error with.
 */
export function newError(msg: string): error {
  // Stack is lazily computed when first accessed so it should never be undefined
  // This makes TS happy though
  /* istanbul ignore next */
  const stack = new Error().stack ?? "";

  // Remove first 2 lines from stack trace
  // First line is `Error:`
  // second line is where the error was created
  const i = stack.indexOf("\n", stack.indexOf("\n") + 1) + 1;

  return new FundamentalError(msg, stack.slice(i));
}

/**
 * Creates a new error from the given JS Error.
 * @param err A JS error to convert to an error.
 */
export function fromJSError(err: Error): error {
  /* istanbul ignore next */
  const stack = err.stack ?? "";
  const i = stack.indexOf("\n") + 1;
  return new FundamentalError(`${err.name}: ${err.message}`, stack.slice(i));
}

/**
 * Annotates err with a stack trace at the point withStack was called.
 * If err is undefined, withStack returns undefined.
 * @param err The error to annotate.
 */
export function withStack(err: undefined): undefined;
export function withStack(err: error): error;
export function withStack(err: error | undefined): error | undefined {
  if (err === undefined) {
    return undefined;
  }

  /* istanbul ignore next */
  const stack = new Error().stack ?? "";
  const i = stack.indexOf("\n", stack.indexOf("\n") + 1) + 1;

  return new ErrorWithStack(err, stack.slice(i));
}

/**
 * Annotates an error with a given message.
 * @param err The error to annotate.
 * @param msg The message to annotate the error with.
 */
export function withMessage(err: undefined, msg: string): undefined;
export function withMessage(err: error, msg: string): error;
export function withMessage(
  err: error | undefined,
  msg: string,
): error | undefined {
  if (err === undefined) {
    return undefined;
  }

  return new ErrorWithMessage(err, msg);
}

/**
 * Returns an error annotating err with a stack trace at the point
 * Wrap is called and the given message.
 * @param err The error to annotate.
 * @param msg The message to annotate the error with.
 */
export function wrap(err: undefined, msg: string): undefined;
export function wrap(err: error, msg: string): error;
export function wrap(err: error | undefined, msg: string): error | undefined {
  if (err === undefined) {
    return undefined;
  }

  /* istanbul ignore next */
  const stack = new Error().stack ?? "";
  const i = stack.indexOf("\n", stack.indexOf("\n") + 1) + 1;

  const newErr = new ErrorWithMessage(err, msg);
  return new ErrorWithStack(newErr, stack.slice(i));
}

/**
 * Returns the underlying cause of the error if it exists.
 * If the error does not implement the Cause interface the original error will be returned.
 * @param err The error to get the cause of.
 */
export function cause(err: undefined): undefined;
export function cause(err: error): error;
export function cause(err: error | undefined): error | undefined {
  let e = err;

  while (e !== undefined) {
    if (isCauser(e)) {
      e = e.cause();
    } else {
      break;
    }
  }

  return e;
}
