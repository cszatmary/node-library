// Copyright (c) 2020 Christopher Szatmary <cs@christopherszatmary.com>
// All rights reserved. MIT License.

import { inspect, InspectOptions } from "util";

/**
 * `Box` provides a way to wrap a value so that it can be used as a reference.
 * This allows functionality similar to that of references or pointers from
 * other languages.
 */
export class Box<T> {
  #value: T;

  constructor(value: T) {
    this.#value = value;
  }

  /**
   * Replaces the value in the Box with the given `value`.
   */
  box(value: T): void {
    this.#value = value;
  }

  /**
   * Returns the value stored inside the box.
   */
  unbox(): T {
    return this.#value;
  }

  /**
   * Custom inspect implementation for use with node's `util.inspect`.
   */
  [inspect.custom](depth?: number | null, options?: InspectOptions): string {
    if (depth == null || depth < 0) {
      return "Box {}";
    }

    const newOpts = {
      ...options,
      depth: options?.depth == null ? null : options.depth - 1,
    };

    const value = inspect(this.#value, newOpts);
    return `Box { ${value} }`;
  }
}
