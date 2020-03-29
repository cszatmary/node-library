import { sets } from "../../src";

describe("sets.ts", () => {
  describe("union()", () => {
    it("combines both sets when they have no intersection", () => {
      const a = new Set([1, 2, 3]);
      const b = new Set([4, 5, 6]);
      const c = sets.union(a, b);

      expect(c).toEqual(new Set([1, 2, 3, 4, 5, 6]));
    });

    it("returns the union of the two sets", () => {
      const a = new Set([1, 2, 3, 4]);
      const b = new Set([2, 4, 5, 6]);
      const c = sets.union(a, b);

      expect(c).toEqual(new Set([1, 2, 3, 4, 5, 6]));
    });
  });

  describe("intersection()", () => {
    it("returns the intersection of the two sets", () => {
      const a = new Set([1, 2, 3, 4]);
      const b = new Set([2, 4, 5, 6]);
      const c = sets.intersection(a, b);

      expect(c).toEqual(new Set([2, 4]));
    });

    it("returns an empty set if the intersection is the null set", () => {
      const a = new Set([1, 2, 3]);
      const b = new Set([4, 5, 6]);
      const c = sets.intersection(a, b);

      expect(c).toEqual(new Set());
    });
  });

  describe("difference()", () => {
    it("returns the difference of the two sets", () => {
      const a = new Set([1, 2, 3, 4]);
      const b = new Set([2, 4, 5, 6]);
      const c = sets.difference(a, b);

      expect(c).toEqual(new Set([1, 3]));
    });

    it("returns an empty set if a is a subset of b", () => {
      const a = new Set([1, 2, 3]);
      const b = new Set([1, 2, 3, 4, 5, 6]);
      const c = sets.difference(a, b);

      expect(c).toEqual(new Set());
    });
  });

  describe("isSubset()", () => {
    it("returns true when a is a subset of b", () => {
      const a = new Set([1, 2, 3]);
      const b = new Set([1, 2, 3, 4, 5, 6]);
      const c = sets.isSubset(a, b);

      expect(c).toBe(true);
    });

    it("returns false when a is not a subset of b", () => {
      const a = new Set([1, 2, 3]);
      const b = new Set([1, 2, 4]);
      const c = sets.isSubset(a, b);

      expect(c).toBe(false);
    });
  });

  describe("map()", () => {
    it("maps the set using the given function", () => {
      const a = new Set([1, 2, 3]);
      const r = sets.map(a, (v) => v * v);

      expect(r.sort()).toEqual([1, 4, 9]);
    });
  });
});
