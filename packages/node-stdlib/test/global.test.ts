import { inspect } from "util";
import { Ref, errors, panic, recover, util } from "../src";

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

  describe("Ref", () => {
    it("creates a ref to the value", () => {
      const ref1 = new Ref(10);
      const ref2 = ref1;
      ref2.set(20);

      expect(ref1.deref()).toBe(20);
      expect(ref2.deref()).toBe(20);
    });

    describe("inspect", () => {
      it("returns just the type when depth is zero", () => {
        const ref = new Ref(10);
        const s = inspect(ref, { depth: -1 });
        expect(s).toBe("Ref {}");
      });

      it("returns a string representation of the ref", () => {
        const ref = new Ref(10);
        const s = inspect(ref);
        expect(s).toBe("Ref { 10 }");
      });
    });
  });
});
