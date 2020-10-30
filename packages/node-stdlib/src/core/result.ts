// Copyright (c) 2020 Christopher Szatmary <cs@christopherszatmary.com>
// All rights reserved. MIT License.

import { inspect, InspectOptions } from "util";
import { panic } from "../global";

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

function isJSError(v: unknown): v is Error {
  if (v instanceof Error) {
    return true;
  }

  if (typeof v !== "object" || v == null) {
    return false;
  }

  // instanceof fails in jest: https://github.com/facebook/jest/issues/2549
  // this handles that case, it's hacky but it works
  const o = v as Record<string, unknown>;
  if (
    o.constructor.name === "Error" &&
    typeof o.name === "string" &&
    typeof o.message === "string"
  ) {
    return true;
  }

  return false;
}

interface ResultCase<S, F> {
  /**
   * Returns `true` if the a `Success`.
   */
  isSuccess(): this is Success<S, F>;

  /**
   * Returns `true` if the a `Failure`.
   */
  isFailure(): this is Failure<S, F>;

  /**
   * Unwraps the result and returns the `Success`'s value.
   * Panics with the failure value if the result is a `Failure`.
   * @param msg An optional message to panic with if the result is a `Failure`.
   */
  unwrap(msg?: string): S;

  /**
   * Unwraps the result and returns the `Failure`'s value.
   * Panics with the success value if the result is a `Success`.
   * @param msg An optional message to panic with if the result is a `Success`.
   */
  unwrapFailure(msg?: string): F;

  /**
   * Returns the success value or `undefined` if the result is a `Failure`.
   */
  success(): S | undefined;

  /**
   * Returns the failure value or `undefined` if the result is a `Success`.
   */
  failure(): F | undefined;

  /**
   * Returns a new result, mapping the `Success` value using the given `transform` closure.
   */
  map<T>(transform: (value: S) => T): Result<T, F>;

  /**
   * Returns a new result, mapping the `Failure` value using the given `transform` closure.
   */
  mapFailure<E>(transform: (err: F) => E): Result<S, E>;

  /**
   * Returns a new result, mapping the `Success` value using the given `transform` closure
   * and unwrapping the produced result.
   */
  flatMap<T>(transform: (value: S) => Result<T, F>): Result<T, F>;

  /**
   * Returns a new result, mapping the `Failure` value using the given `transform` closure
   * and unwrapping the produced result.
   */
  flatMapFailure<E>(transform: (err: F) => Result<S, E>): Result<S, E>;

  /**
   * Custom inspect implementation for use with node's `util.inspect`.
   */
  [inspect.custom](depth?: number | null, options?: InspectOptions): string;
}

class Success<S, F> implements ResultCase<S, F> {
  #value: S;

  constructor(value: S) {
    this.#value = value;
  }

  isSuccess(): this is Success<S, F> {
    return true;
  }

  isFailure(): this is Failure<S, F> {
    return false;
  }

  unwrap(_msg?: string): S {
    return this.#value;
  }

  unwrapFailure(msg?: string): never {
    if (msg === undefined) {
      panic(this.#value);
    }

    panic(`${msg}: ${toString(this.#value)}`);
  }

  success(): S {
    return this.#value;
  }

  failure(): undefined {
    return undefined;
  }

  map<T>(transform: (value: S) => T): Result<T, F> {
    return new Success(transform(this.#value));
  }

  mapFailure<E>(_transform: (err: F) => E): Result<S, E> {
    return new Success(this.#value);
  }

  flatMap<T>(transform: (value: S) => Result<T, F>): Result<T, F> {
    return transform(this.#value);
  }

  flatMapFailure<E>(_transform: (err: F) => Result<S, E>): Result<S, E> {
    return new Success(this.#value);
  }

  [inspect.custom](depth?: number | null, options?: InspectOptions): string {
    if (depth == null || depth < 0) {
      return "Result.success {}";
    }

    const newOpts = {
      ...options,
      depth: options?.depth == null ? null : options.depth - 1,
    };

    const value = inspect(this.#value, newOpts);
    return `Result.success { ${value} }`;
  }
}

class Failure<S, F> implements ResultCase<S, F> {
  #cause: F;

  constructor(cause: F) {
    this.#cause = cause;
  }

  isSuccess(): this is Success<S, F> {
    return false;
  }

  isFailure(): this is Failure<S, F> {
    return true;
  }

  unwrap(msg?: string): never {
    if (msg === undefined) {
      panic(this.#cause);
    }

    panic(`${msg}: ${toString(this.#cause)}`);
  }

  unwrapFailure(_msg?: string): F {
    return this.#cause;
  }

  success(): undefined {
    return undefined;
  }

  failure(): F {
    return this.#cause;
  }

  map<T>(_transform: (value: S) => T): Result<T, F> {
    return new Failure(this.#cause);
  }

  mapFailure<E>(transform: (err: F) => E): Result<S, E> {
    return new Failure(transform(this.#cause));
  }

  flatMap<T>(_transform: (value: S) => Result<T, F>): Result<T, F> {
    return new Failure(this.#cause);
  }

  flatMapFailure<E>(transform: (err: F) => Result<S, E>): Result<S, E> {
    return transform(this.#cause);
  }

  [inspect.custom](depth?: number | null, options?: InspectOptions): string {
    if (depth == null || depth < 0) {
      return "Result.failure {}";
    }

    const newOpts = {
      ...options,
      depth: options?.depth == null ? null : options.depth - 1,
    };

    const cause = inspect(this.#cause, newOpts);
    return `Result.failure { ${cause} }`;
  }
}

/**
 * A type that represents either success or failure.
 */
export type Result<S, F> = Success<S, F> | Failure<S, F>;

type ExtractPromise<P> = P extends Promise<infer T> ? T : never;

// "static methods" for Result type
// eslint-disable-next-line @typescript-eslint/naming-convention
export const Result = {
  /**
   * Creates a new result of type Success with the given value.
   */
  success<S, F>(value: S): Result<S, F> {
    return new Success(value);
  },

  /**
   * Creates a new result of type Failure with the given error value.
   */
  failure<S, F>(cause: F): Result<S, F> {
    return new Failure(cause);
  },

  /**
   * Creates a new result by evaluating a throwing closure,
   * capturing the returned value as a success, or any thrown error as a failure.
   * @param catching A throwing closure to evaluate.
   */
  of<S>(catching: () => S): Result<S, Error> {
    try {
      return new Success(catching());
    } catch (err: unknown) {
      if (isJSError(err)) {
        return new Failure(err);
      }

      return new Failure(new Error(toString(err)));
    }
  },

  /**
   * ofPromise is like `Result.of` but takes a closure that returns a promise.
   * The returned promise will always resolve to a Result.
   * @param catching A closure that returns a promise.
   */
  async ofPromise<S>(catching: () => Promise<S>): Promise<Result<S, Error>> {
    try {
      return new Success(await catching());
    } catch (err: unknown) {
      if (isJSError(err)) {
        return new Failure(err);
      }

      return new Failure(new Error(toString(err)));
    }
  },

  /**
   * Takes a function that can throw an error and returns a version
   * that returns a `Result`.
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  resultify<F extends (...args: any) => any>(
    fn: F,
  ): (...args: Parameters<F>) => Result<ReturnType<F>, Error> {
    return (...args): Result<ReturnType<F>, Error> => {
      try {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        return new Success(fn(...args));
      } catch (err: unknown) {
        if (isJSError(err)) {
          return new Failure(err);
        }

        return new Failure(new Error(toString(err)));
      }
    };
  },

  /**
   * Takes a function that returns a promise and returns a version
   * that always resolves to a `Result`.
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  resultifyPromise<F extends (...args: any) => Promise<any>>(
    fn: F,
  ): (...args: Parameters<F>) => Promise<Result<ExtractPromise<ReturnType<F>>, Error>> {
    return (...args): Promise<Result<ExtractPromise<ReturnType<F>>, Error>> => {
      return new Promise((resolve) => {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        fn(...args)
          .then((val) => {
            return resolve(new Success(val));
          })
          .catch((err: unknown) => {
            if (isJSError(err)) {
              resolve(new Failure(err));
            }

            resolve(new Failure(new Error(toString(err))));
          });
      });
    };
  },
};
