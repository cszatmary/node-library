import { panic, range } from "../src";

describe("src/global.ts", () => {
  describe("panic()", () => {
    it("panics with the given message and a stack trace", () => {
      expect(() => {
        panic("something broke");
      }).toPanic("something broke");
    });
  });

  describe("range()", () => {
    it("creates a range that can be iterated over", () => {
      const vals: number[] = [];
      for (const i of range(0, 10)) {
        vals.push(i);
      }
      expect(vals).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
    });

    it("creates an array from the range with the given step", () => {
      const vals = [...range(0, 10, 2)];
      expect(vals).toEqual([0, 2, 4, 6, 8]);
    });
  });
});
