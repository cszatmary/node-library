// Copyright (c) 2020 Christopher Szatmary <cs@christopherszatmary.com>
// All rights reserved. MIT License.

/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable max-classes-per-file */

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
   * Terminates the program if the result is a `Failure`.
   * @param msg An optional message to print if the result is a `Failure`.
   */
  unwrap(msg?: string): S;

  /**
   * Unwraps the result and returns the `Failure`'s value.
   * Terminates the program if the result is a `Success`.
   * @param msg An optional message to print if the result is a `Success`.
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
    if (msg) {
      console.error(`${msg}:`, this.#value);
    } else {
      console.error(this.#value);
    }

    process.exit(1);
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
    if (msg) {
      console.error(`${msg}:`, this.#cause);
    } else {
      console.error(this.#cause);
    }

    process.exit(1);
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
