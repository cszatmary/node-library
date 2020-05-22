// Copyright (c) 2020 Christopher Szatmary <cs@christopherszatmary.com>
// All rights reserved. MIT License.

/**
 * Returns the index of of the first instance of any char from `chars`
 * in `s`, or -1 if none are present.
 */
export function indexAny(s: string, chars: string): number {
  if (s === "" || chars === "") {
    return -1;
  }

  const charSet = new Set<string>();
  for (const c of chars) {
    charSet.add(c);
  }

  for (let i = 0; i < s.length; i++) {
    if (charSet.has(s[i])) {
      return i;
    }
  }

  return -1;
}

/**
 * Returns the index of the last instance of any char from `chars`
 * in `s`, or -1 if none are present.
 */
export function lastIndexAny(s: string, chars: string): number {
  if (s === "" || chars === "") {
    return -1;
  }

  const charSet = new Set<string>();
  for (const c of chars) {
    charSet.add(c);
  }

  for (let i = s.length - 1; i >= 0; i--) {
    if (charSet.has(s[i])) {
      return i;
    }
  }

  return -1;
}

/**
 * Removes the leading `prefix` string from `s`.
 * If `s` doesn't start with `prefix`, `s` is returned unchanged.
 */
export function trimPrefix(s: string, prefix: string): string {
  if (s.startsWith(prefix)) {
    return s.slice(prefix.length);
  }

  return s;
}

/**
 * Removes the trailing `suffix` string from `s`.
 * If `s` doesn't end with `suffix`, `s` is returned unchanged.
 */
export function trimSuffix(s: string, suffix: string): string {
  if (s.endsWith(suffix)) {
    return s.slice(0, s.length - suffix.length);
  }

  return s;
}
