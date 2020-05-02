// Copyright (c) 2020 Christopher Szatmary <cs@christopherszatmary.com>
// All rights reserved. MIT License.

import util from "util";
import { panic } from "../global";

/**
 * Returns a boolean indication whether or not
 * `v` is a proper object and not an array.
 */
export function isObject(v: unknown): v is object {
  return v != null && typeof v === "object" && !Array.isArray(v);
}

/**
 * Returns a boolean indicating whether or not `v`
 * implements the `Copyable` interface.
 * A value implements `Copyable` if it has a `copy` method.
 */
export function isCopyable(v: unknown): v is Copyable {
  return v != null && typeof (v as Copyable).copy === "function";
}

/**
 * Returns a deep copy of the given value.
 */
export function copy<T>(v: T): T {
  if (v == null) {
    return v;
  }

  // Arrays are special and should be handled before checking
  // it's an object
  if (Array.isArray(v)) {
    return (v.map((e) => copy(e)) as unknown) as T;
  }

  // Handle primatives
  if (!isObject(v)) {
    return v;
  }

  if (v instanceof Date) {
    return (new Date(v.getTime()) as unknown) as T;
  }

  if (v instanceof Map) {
    const m = new Map();
    for (const [k, val] of v) {
      m.set(k, copy(val));
    }
    return (m as unknown) as T;
  }

  if (v instanceof Set) {
    const s = new Set();
    for (const e of v) {
      s.add(copy(e));
    }
    return (s as unknown) as T;
  }

  if (Buffer.isBuffer(v)) {
    return (Buffer.from(v) as unknown) as T;
  }

  if (util.types.isTypedArray(v)) {
    return (v.slice() as unknown) as T;
  }

  if (isCopyable(v)) {
    return v.copy();
  }

  const o: Record<string, unknown> = {};
  for (const [k, val] of Object.entries(v)) {
    o[k] = copy(val);
  }
  return o as T;
}

/**
 * Merges the given objects or arrays and returns a deep copy.
 */
export function merge<T extends Record<string, unknown>>(
  x: Partial<T>,
  y: Partial<T>,
): T;
export function merge<
  T extends Record<string, unknown>,
  S extends Record<string, unknown>
>(x: T, y: S): T & S;
export function merge<T>(x: T[], y: T[]): T[];
export function merge<
  T extends Record<string, unknown>,
  S extends Record<string, unknown>
>(x: T, y: S): T & S {
  if (Array.isArray(x) !== Array.isArray(y)) {
    panic("merge: Cannot merge an object and an array");
  }

  // Do lazy way for now. Can optimize later to remove the intermediate shallow copy.
  if (Array.isArray(x) && Array.isArray(y)) {
    return (copy([...x, ...y]) as unknown) as T & S;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const dest: any = copy(x);
  for (const [k, v] of Object.entries(y)) {
    // Prevent overwriting property in prototype
    if (
      k in x &&
      !(
        Object.hasOwnProperty.call(x, k) &&
        Object.propertyIsEnumerable.call(x, k)
      )
    ) {
      continue;
    }

    if (k in x && (isObject(v) || Array.isArray(v))) {
      dest[k] = merge(x[k] as object, v);
      continue;
    }

    dest[k] = copy(v);
  }
  return dest;
}