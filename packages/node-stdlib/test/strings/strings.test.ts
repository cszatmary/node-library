import { strings } from "../../src";

describe("strings/strings.ts", () => {
  describe("indexAny()", () => {
    test.each([
      ["a", "a", 0],
      ["aaa", "a", 0],
      ["abc", "xcz", 2],
    ])(`returns the first index of any matching char: "%s", "%s"`, (str, chars, expectedIndex) => {
      expect(strings.indexAny(str, chars)).toBe(expectedIndex);
    });

    test.each([
      ["", ""],
      ["", "a"],
      ["a", ""],
      ["abc", "xyz"],
    ])(`returns -1 when no chars are present: "%s", "%s"`, (str, chars) => {
      expect(strings.indexAny(str, chars)).toBe(-1);
    });
  });

  describe("lastIndexAny()", () => {
    test.each([
      ["a", "a", 0],
      ["aaa", "a", 2],
      ["abc", "xcz", 2],
    ])(`returns the last index of any matching char: "%s", "%s"`, (str, chars, expectedIndex) => {
      expect(strings.lastIndexAny(str, chars)).toBe(expectedIndex);
    });

    test.each([
      ["", ""],
      ["", "a"],
      ["a", ""],
      ["abc", "xyz"],
    ])(`returns -1 when no chars are present: "%s", "%s"`, (str, chars) => {
      expect(strings.lastIndexAny(str, chars)).toBe(-1);
    });
  });

  describe("trimPrefix()", () => {
    it("trims the prefix from the string", () => {
      expect(strings.trimPrefix("abcd", "ab")).toBe("cd");
    });

    it("returns the string unchanged when there is no prefix", () => {
      expect(strings.trimPrefix("abcd", "cd")).toBe("abcd");
    });
  });

  describe("trimSuffix()", () => {
    it("trims the suffix from the string", () => {
      expect(strings.trimSuffix("abcd", "cd")).toBe("ab");
    });

    it("returns the string unchanged when there is no suffix", () => {
      expect(strings.trimSuffix("abcd", "ab")).toBe("abcd");
    });
  });
});
