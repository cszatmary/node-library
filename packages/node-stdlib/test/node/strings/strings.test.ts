import { strings } from "../../../src";

describe("strings/strings.ts", () => {
  test.each([
    ["a", "a", 0],
    ["aaa", "a", 0],
    ["abc", "xcz", 2],
    // Failure cases
    ["", "", -1],
    ["", "a", -1],
    ["a", "", -1],
    ["abc", "xyz", -1],
  ])(`strings.indexAny: "%s", "%s"`, (str, chars, expectedIndex) => {
    expect(strings.indexAny(str, chars)).toBe(expectedIndex);
  });

  test.each([
    ["a", "a", 0],
    ["aaa", "a", 2],
    ["abc", "xcz", 2],
    // Failure cases
    ["", "", -1],
    ["", "a", -1],
    ["a", "", -1],
    ["abc", "xyz", -1],
  ])(`strings.lastIndexAny: "%s", "%s"`, (str, chars, expectedIndex) => {
    expect(strings.lastIndexAny(str, chars)).toBe(expectedIndex);
  });

  test.each([
    ["abcd", "ab", "cd"],
    ["abcd", "cd", "abcd"],
  ])(`strings.trimPrefix: "%s", "%s"`, (str, prefix, expected) => {
    expect(strings.trimPrefix(str, prefix)).toBe(expected);
  });

  test.each([
    ["abcd", "cd", "ab"],
    ["abcd", "ab", "abcd"],
  ])(`strings.trimSuffix: "%s", "%s"`, (str, prefix, expected) => {
    expect(strings.trimSuffix(str, prefix)).toBe(expected);
  });
});
