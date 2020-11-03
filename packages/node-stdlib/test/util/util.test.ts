import { errors, util } from "../../src";

describe("util/util.ts", () => {
  describe("toString()", () => {
    test.each([
      [10, "10"],
      [-12.5, "-12.5"],
      [true, "true"],
      [false, "false"],
      ["hello", "hello"],
      [undefined, "undefined"],
      [null, "null"],
    ])("returns a strnig representation of the primitive value: %s", (v, expected) => {
      expect(util.toString(v)).toBe(expected);
    });

    it("returns a string representation of the error", () => {
      const err = errors.errorString("oh no");
      expect(util.toString(err)).toBe("oh no");
    });

    it("returns a string representation of a type that implements Stringer", () => {
      const semver = new util.SemVer(1, 5, 12);
      expect(util.toString(semver)).toBe("1.5.12");
    });

    it("returns a string representation of the object", () => {
      const obj = { a: 1, b: "hello" };
      expect(util.toString(obj)).toBe("{ a: 1, b: 'hello' }");
    });
  });

  describe("isObject()", () => {
    it("returns true if the value is an object", () => {
      expect(util.isObject({ hello: "world" })).toBe(true);
    });

    it("returns false for null", () => {
      expect(util.isObject(null)).toBe(false);
    });

    it("returns false if the value is an array", () => {
      expect(util.isObject([1, 2])).toBe(false);
    });
  });

  describe("isTypedArray()", () => {
    test.each([
      ["Uint8Array", new Uint8Array(), true],
      ["Uint8ClampedArray", new Uint8ClampedArray(), true],
      ["Uint16Array", new Uint16Array(), true],
      ["Uint32Array", new Uint32Array(), true],
      ["Int8Array", new Int8Array(), true],
      ["Int16Array", new Int16Array(), true],
      ["Int32Array", new Int32Array(), true],
      ["Float32Array", new Float32Array(), true],
      ["Float64Array", new Float64Array(), true],
      ["DataView", new DataView(new ArrayBuffer(0)), false],
      ["Array", [], false],
    ])("isTypedArray: %s", (_name, v, expected) => {
      expect(util.isTypedArray(v)).toBe(expected);
    });
  });

  describe("copy", () => {
    it("returns null if the value is null", () => {
      const v = null;
      const copy = util.copy(v);
      expect(copy).toBeNull();
    });

    it("creates a copy of the date", () => {
      const date = new Date();
      const dateCopy = util.copy(date);
      expect(dateCopy).toEqual(date);
      expect(dateCopy).not.toBe(date);
    });

    it("creates a copy of the map", () => {
      const map = new Map([
        ["a", { b: "hello" }],
        ["b", { b: "world" }],
      ]);
      const mapCopy = util.copy(map);
      expect(mapCopy).toEqual(map);
      expect(mapCopy).not.toBe(map);
    });

    it("creates a copy of the set", () => {
      const set = new Set([
        ["a", { b: "hello" }],
        ["b", { b: "world" }],
      ]);
      const setCopy = util.copy(set);
      expect(setCopy).toEqual(set);
      expect(setCopy).not.toBe(set);
    });

    it("creates a copy of the typed array", () => {
      const arr = new Int32Array([21, 31, 41]);
      const arrCopy = util.copy(arr);
      expect(arrCopy).toEqual(arr);
      expect(arrCopy).not.toBe(arr);
    });
  });

  describe("merge()", () => {
    it("merges the objects", () => {
      const obj1 = {
        a: 1,
        b: {
          c: "hello",
        },
      };
      const obj2 = {
        b: {
          d: true,
        },
        e: [1, 2, 3],
      };
      const merged = util.merge(obj1, obj2);

      expect(merged).toEqual({
        a: 1,
        b: {
          c: "hello",
          d: true,
        },
        e: [1, 2, 3],
      });
      expect(merged.b).not.toBe(obj1.b);
      expect(merged.b).not.toBe(obj2.b);
      expect(merged.e).not.toBe(obj2.e);
    });

    it("merges the arrays", () => {
      const arr1 = [{ a: 1, b: true }];
      const arr2 = [{ a: 2, b: false }];
      const merged = util.merge(arr1, arr2);

      expect(merged).toEqual([
        { a: 1, b: true },
        { a: 2, b: false },
      ]);
      expect(merged[0]).not.toBe(arr1[0]);
      expect(merged[1]).not.toBe(arr2[0]);
    });
  });
});
