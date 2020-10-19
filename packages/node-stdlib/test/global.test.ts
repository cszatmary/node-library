import { errors, panic, range, recover, util } from "../src";

describe("global.ts", () => {
  describe("panic()", () => {
    test.each([
      ["string", "something broke", "something broke"],
      ["error", errors.errorString("something broke"), "something broke"],
      ["number", 10, "10"],
      ["object", { error: "oops" }, "{ error: 'oops' }"],
      ["undefined", undefined, "undefined"],
      ["null", null, "null"],
      ["value that implements Stringer", new util.SemVer(1, 5, 12), "1.5.12"],
    ])("panics with the given %s", (_name, v, expected) => {
      expect(() => {
        panic(v);
      }).toPanic(expected);
    });
  });

  describe("recover()", () => {
    test.each([
      ["string", "something broke"],
      ["error", errors.errorString("something broke")],
      ["number", 10],
      ["object", { error: "oops" }],
      ["undefined", undefined],
      ["null", null],
      ["value that implements Stringer", new util.SemVer(1, 5, 12)],
    ])("recovers the panic reason that was a %s", (_name, v) => {
      try {
        panic(v);
      } catch (e) {
        const cause = recover(e);
        // TODO(@cszatmary): This feels brittle because it relies on
        // reference equality. See if there's a better way to do this.
        expect(cause).toBe(v);
        return;
      }

      fail("no panic was recovered");
    });

    it("returns undefined if called with undefined", () => {
      expect(recover(undefined)).toBeUndefined();
    });

    it("panics if caught error was not a panic", () => {
      expect(() => {
        const e = new Error("some error");
        recover(e);
      }).toPanic("Error: some error");
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
