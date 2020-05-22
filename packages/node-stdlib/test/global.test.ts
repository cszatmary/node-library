import { errors, panic, range, util } from "../src";

describe("global.ts", () => {
  describe("panic()", () => {
    it("panics with the given message and a stack trace", () => {
      expect(() => {
        panic("something broke");
      }).toPanic("something broke");
    });

    it("panics with the given error", () => {
      expect(() => {
        panic(errors.errorString("something broke"));
      }).toPanic("something broke");
    });

    it("panics with the given number", () => {
      expect(() => {
        panic(10);
      }).toPanic("10");
    });

    it("panics with the given object", () => {
      expect(() => {
        panic({ error: "oops" });
      }).toPanic("{ error: 'oops' }");
    });

    it("panics with undefined", () => {
      expect(() => {
        panic(undefined);
      }).toPanic("undefined");
    });

    it("panics with null", () => {
      expect(() => {
        panic(null);
      }).toPanic("null");
    });

    it("panics with a value that implements Stringer", () => {
      expect(() => {
        panic(new util.SemVer(1, 5, 12));
      }).toPanic("1.5.12");
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
