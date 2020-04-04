// Copyright (c) 2020 Christopher Szatmary <cs@christopherszatmary.com>
// All rights reserved. MIT License.

/**
 * Checks if the given environment variable is set.
 *
 * **NOTE:** Empty values are considered set.
 */
export function isEnvSet(name: string): boolean {
  // If an env is not set it will be `undefined` in node world
  return typeof process.env[name] !== "undefined";
}

/**
 * Gets the value of the environment variable or returns `defaultValue`
 * if it isn't set.
 * @param defaultValue The value to return if the environment variable is not set.
 * Defaults to `""`.
 */
export function getEnv(name: string, defaultValue = ""): string {
  const val = process.env[name];
  if (typeof val === "undefined") {
    return defaultValue;
  }

  return val;
}

/**
 * Sets an environment variable to the given value.
 */
export function setEnv(name: string, value: string): void {
  process.env[name] = value;
}

/**
 * Unsets the given environment variable.
 */
export function unsetEnv(name: string): void {
  delete process.env[name];
}
