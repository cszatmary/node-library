// Copyright (c) 2020 Christopher Szatmary <cs@christopherszatmary.com>
// All rights reserved. MIT License.

/* eslint-disable @typescript-eslint/no-unused-vars */

import { inspect, InspectOptions } from "util";
import { panic } from "../global";

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
   * Returns the success value or `defaultValue` if the result is a `Failure`.
   */
  orElse(defaultValue: S): S;

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
   * Returns the result of calling `onSuccess` if the result is a `Success`
   * or `onFailure` if the result is a `Failure`.
   */
  fold<T>(onSuccess: (value: S) => T, onFailure: (err: F) => T): T;

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

  unwrap(msg?: string): S {
    return this.#value;
  }

  unwrapFailure(msg?: string): never {
    let m: string;
    if (msg) {
      m = `${msg}: ${this.#value}`;
    } else {
      m = `${this.#value}`;
    }

    panic(m);
  }

  success(): S {
    return this.#value;
  }

  failure(): undefined {
    return undefined;
  }

  orElse(defaultValue: S): S {
    return this.#value;
  }

  map<T>(transform: (value: S) => T): Result<T, F> {
    return new Success(transform(this.#value));
  }

  mapFailure<E>(transform: (err: F) => E): Result<S, E> {
    return new Success(this.#value);
  }

  flatMap<T>(transform: (value: S) => Result<T, F>): Result<T, F> {
    return transform(this.#value);
  }

  flatMapFailure<E>(transform: (err: F) => Result<S, E>): Result<S, E> {
    return new Success(this.#value);
  }

  fold<T>(onSuccess: (value: S) => T, onFailure: (err: F) => T): T {
    return onSuccess(this.#value);
  }

  [inspect.custom](depth?: number | null, options?: InspectOptions): string {
    if (depth && depth < 0) {
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
    let m: string;
    if (msg) {
      m = `${msg}: ${this.#cause}`;
    } else {
      m = `${this.#cause}`;
    }

    panic(m);
  }

  unwrapFailure(msg?: string): F {
    return this.#cause;
  }

  success(): undefined {
    return undefined;
  }

  failure(): F {
    return this.#cause;
  }

  orElse(defaultValue: S): S {
    return defaultValue;
  }

  map<T>(transform: (value: S) => T): Result<T, F> {
    return new Failure(this.#cause);
  }

  mapFailure<E>(transform: (err: F) => E): Result<S, E> {
    return new Failure(transform(this.#cause));
  }

  flatMap<T>(transform: (value: S) => Result<T, F>): Result<T, F> {
    return new Failure(this.#cause);
  }

  flatMapFailure<E>(transform: (err: F) => Result<S, E>): Result<S, E> {
    return transform(this.#cause);
  }

  fold<T>(onSuccess: (value: S) => T, onFailure: (err: F) => T): T {
    return onFailure(this.#cause);
  }

  [inspect.custom](depth?: number | null, options?: InspectOptions): string {
    if (depth && depth < 0) {
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

// "static methods" for Result type
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
   * captyrubg the returned value as a success, or any thrown error as a failure.
   * @param catching A throwing closure to evaluate.
   */
  of<S, F extends Error = Error>(catching: () => S): Result<S, F> {
    try {
      return new Success(catching());
    } catch (err) {
      return new Failure(err);
    }
  },
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function resultify<F extends (...args: any) => any>(
  fn: F,
): (...args: Parameters<F>) => Result<ReturnType<F>, Error> {
  return (...args): Result<ReturnType<F>, Error> => {
    try {
      // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
      // @ts-ignore
      return new Success(fn(...args));
    } catch (err) {
      return new Failure(err);
    }
  };
}

type ExtractPromise<P> = P extends Promise<infer T> ? T : never;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function resultifyPromise<F extends (...args: any) => Promise<any>>(
  fn: F,
): (...args: Parameters<F>) => Promise<Result<ExtractPromise<ReturnType<F>>, Error>> {
  return (...args): Promise<Result<ExtractPromise<ReturnType<F>>, Error>> => {
    return new Promise((resolve) => {
      // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
      // @ts-ignore
      fn(...args)
        .then((val) => resolve(new Success(val)))
        .catch((err) => resolve(new Failure(err)));
    });
  };
}
