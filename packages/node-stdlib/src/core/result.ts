/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable max-classes-per-file */

interface ResultCase<S, E extends Error> {
  readonly isSuccess: boolean;
  readonly isFailure: boolean;

  get(): S;
  getOrUndefined(): S | undefined;
  getOrElse(defaultValue: S): S;
  error(): E;
  map<NewS>(transform: (value: S) => NewS): Result<NewS, E>;
  mapError<NewE extends Error>(transform: (error: E) => NewE): Result<S, NewE>;
  flatMap<NewS>(transform: (value: S) => Result<NewS, E>): Result<NewS, E>;
  flatMapError<NewE extends Error>(
    transform: (error: E) => Result<S, NewE>,
  ): Result<S, NewE>;
  fold<NewS>(
    onSuccess: (value: S) => NewS,
    onFailure: (error: E) => NewS,
  ): NewS;
}

class Success<S, E extends Error> implements ResultCase<S, E> {
  private value: S;

  constructor(value: S) {
    this.value = value;
  }

  get isSuccess(): boolean {
    return true;
  }

  get isFailure(): boolean {
    return false;
  }

  get(): S {
    return this.value;
  }

  getOrUndefined(): S | undefined {
    return this.value;
  }

  getOrElse(defaultValue: S): S {
    return this.value;
  }

  error(): E {
    throw new TypeError("Success has no error");
  }

  map<NewS>(transform: (value: S) => NewS): Result<NewS, E> {
    return new Success(transform(this.value));
  }

  mapError<NewE extends Error>(transform: (error: E) => NewE): Result<S, NewE> {
    return new Success(this.value);
  }

  flatMap<NewS>(transform: (value: S) => Result<NewS, E>): Result<NewS, E> {
    return transform(this.value);
  }

  flatMapError<NewE extends Error>(
    transform: (error: E) => Result<S, NewE>,
  ): Result<S, NewE> {
    return new Success(this.value);
  }

  fold<NewS>(
    onSuccess: (value: S) => NewS,
    onFailure: (error: E) => NewS,
  ): NewS {
    return onSuccess(this.value);
  }
}

class Failure<S, E extends Error> implements ResultCase<S, E> {
  private cause: E;

  constructor(cause: E) {
    this.cause = cause;
  }

  get isSuccess(): boolean {
    return false;
  }

  get isFailure(): boolean {
    return true;
  }

  get(): S {
    throw this.cause;
  }

  getOrUndefined(): S | undefined {
    return undefined;
  }

  getOrElse(defaultValue: S): S {
    return defaultValue;
  }

  error(): E {
    return this.cause;
  }

  map<NewS>(transform: (value: S) => NewS): Result<NewS, E> {
    return new Failure(this.cause);
  }

  mapError<NewE extends Error>(transform: (error: E) => NewE): Result<S, NewE> {
    return new Failure(transform(this.cause));
  }

  flatMap<NewS>(transform: (value: S) => Result<NewS, E>): Result<NewS, E> {
    return new Failure(this.cause);
  }

  flatMapError<NewE extends Error>(
    transform: (error: E) => Result<S, NewE>,
  ): Result<S, NewE> {
    return transform(this.cause);
  }

  fold<NewS>(
    onSuccess: (value: S) => NewS,
    onFailure: (error: E) => NewS,
  ): NewS {
    return onFailure(this.cause);
  }
}

export type Result<S, E extends Error> = Success<S, E> | Failure<S, E>;

// "static methods" for Result type
export const Result = {
  success<S, E extends Error>(value: S): Result<S, E> {
    return new Success(value);
  },
  failure<S, E extends Error>(cause: E): Result<S, E> {
    return new Failure(cause);
  },
  of<S, E extends Error>(catching: () => S): Result<S, E> {
    try {
      return new Success(catching());
    } catch (error) {
      return new Failure(error);
    }
  },
};
