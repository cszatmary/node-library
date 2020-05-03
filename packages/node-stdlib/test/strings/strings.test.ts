import { strings } from "../../src";

describe("strings/strings.ts", () => {
  describe("indexAny()", () => {
    it("returns the first index of any matching char", () => {
      expect(strings.indexAny("a", "a")).toBe(0);
      expect(strings.indexAny("aaa", "a")).toBe(0);
      expect(strings.indexAny("abc", "xcz")).toBe(2);
    });

    it("returns -1 when no chars are present", () => {
      expect(strings.indexAny("", "")).toBe(-1);
      expect(strings.indexAny("", "a")).toBe(-1);
      expect(strings.indexAny("a", "")).toBe(-1);
      expect(strings.indexAny("abc", "xyz")).toBe(-1);
    });
  });

  describe("lastIndexAny()", () => {
    it("returns the last index of any matching char", () => {
      expect(strings.lastIndexAny("a", "a")).toBe(0);
      expect(strings.lastIndexAny("aaa", "a")).toBe(2);
      expect(strings.lastIndexAny("abc", "xcz")).toBe(2);
    });

    it("returns -1 when no chars are present", () => {
      expect(strings.lastIndexAny("", "")).toBe(-1);
      expect(strings.lastIndexAny("", "a")).toBe(-1);
      expect(strings.lastIndexAny("a", "")).toBe(-1);
      expect(strings.lastIndexAny("abc", "xyz")).toBe(-1);
    });
  });

  describe("trimPrefix()", () => {
    it("trims the prefix from the string", () => {
      expect(strings.trimPrefx("abcd", "ab")).toBe("cd");
    });

    it("returns the string unchanged when there is no prefix", () => {
      expect(strings.trimPrefx("abcd", "cd")).toBe("abcd");
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
