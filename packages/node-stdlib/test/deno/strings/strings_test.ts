import * as testing from "../testing.ts";
import { strings } from "../../../dist/deno/mod.ts";

Deno.test("strings.indexAny", () => {
  const tests: [string, string, number][] = [
    ["a", "a", 0],
    ["aaa", "a", 0],
    ["abc", "xcz", 2],
    // Failure cases
    ["", "", -1],
    ["", "a", -1],
    ["a", "", -1],
    ["abc", "xyz", -1],
  ];

  for (const [str, chars, expectedIndex] of tests) {
    testing.assertEquals(strings.indexAny(str, chars), expectedIndex);
  }
});

Deno.test("strings.lastIndexAny", () => {
  const tests: [string, string, number][] = [
    ["a", "a", 0],
    ["aaa", "a", 2],
    ["abc", "xcz", 2],
    // Failure cases
    ["", "", -1],
    ["", "a", -1],
    ["a", "", -1],
    ["abc", "xyz", -1],
  ];

  for (const [str, chars, expectedIndex] of tests) {
    testing.assertEquals(strings.lastIndexAny(str, chars), expectedIndex);
  }
});

Deno.test("strings.trimPrefix", () => {
  const tests: [string, string, string][] = [
    ["abcd", "ab", "cd"],
    ["abcd", "cd", "abcd"],
  ];

  for (const [str, prefix, expected] of tests) {
    testing.assertEquals(strings.trimPrefix(str, prefix), expected);
  }
});

Deno.test("strings.trimSuffix", () => {
  const tests: [string, string, string][] = [
    ["abcd", "cd", "ab"],
    ["abcd", "ab", "abcd"],
  ];

  for (const [str, prefix, expected] of tests) {
    testing.assertEquals(strings.trimSuffix(str, prefix), expected);
  }
});
