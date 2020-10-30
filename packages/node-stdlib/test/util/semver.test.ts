import { inspect } from "util";
import { util } from "../../src";

describe("util/semver.ts", () => {
  describe("constructor()", () => {
    it("creates a semver instance from the version numbers", () => {
      const sv = new util.SemVer(1, 5, 12);
      expect(sv.major).toBe(1);
      expect(sv.minor).toBe(5);
      expect(sv.patch).toBe(12);
      expect(sv.toString()).toBe("1.5.12");
    });

    it("panics if major is not an integer", () => {
      expect(() => {
        // eslint-disable-next-line no-new
        new util.SemVer(1.2, 5, 12);
      }).toPanic("SemVer.new: major version is not a valid integer: 1.2");
    });

    it("panics if minor is not an integer", () => {
      expect(() => {
        // eslint-disable-next-line no-new
        new util.SemVer(1, 5.2, 12);
      }).toPanic("SemVer.new: minor version is not a valid integer: 5.2");
    });

    it("panics if patch is not an integer", () => {
      expect(() => {
        // eslint-disable-next-line no-new
        new util.SemVer(1, 5, 12.2);
      }).toPanic("SemVer.new: patch version is not a valid integer: 12.2");
    });
  });

  describe("compare()", () => {
    it("returns -1 when the instance is less than the given semver", () => {
      const sv = new util.SemVer(1, 5, 12);
      const svMajor = new util.SemVer(2, 5, 12);
      const svMinor = new util.SemVer(1, 7, 12);
      const svPatch = new util.SemVer(1, 5, 20);
      expect(sv.compare(svMajor)).toBe(-1);
      expect(sv.compare(svMinor)).toBe(-1);
      expect(sv.compare(svPatch)).toBe(-1);
    });

    it("returns 1 when the instance is greater than the given semver", () => {
      const sv = new util.SemVer(1, 5, 12);
      const svMajor = new util.SemVer(0, 5, 12);
      const svMinor = new util.SemVer(1, 3, 12);
      const svPatch = new util.SemVer(1, 5, 8);
      expect(sv.compare(svMajor)).toBe(1);
      expect(sv.compare(svMinor)).toBe(1);
      expect(sv.compare(svPatch)).toBe(1);
    });

    it("returns 0 when the semvers are equal", () => {
      const sv = new util.SemVer(1, 5, 12);
      const svOther = new util.SemVer(1, 5, 12);
      expect(sv.compare(svOther)).toBe(0);
    });
  });

  describe("increment*()", () => {
    it("increments the major version", () => {
      const sv = new util.SemVer(1, 5, 12);
      const incSv = sv.incrementMajor();
      expect(incSv.major).toBe(2);
      expect(incSv.minor).toBe(0);
      expect(incSv.patch).toBe(0);
      expect(incSv.toString()).toBe("2.0.0");
    });

    it("increments the minor version", () => {
      const sv = new util.SemVer(1, 5, 12);
      const incSv = sv.incrementMinor();
      expect(incSv.major).toBe(1);
      expect(incSv.minor).toBe(6);
      expect(incSv.patch).toBe(0);
      expect(incSv.toString()).toBe("1.6.0");
    });

    it("increments the patch version", () => {
      const sv = new util.SemVer(1, 5, 12);
      const incSv = sv.incrementPatch();
      expect(incSv.major).toBe(1);
      expect(incSv.minor).toBe(5);
      expect(incSv.patch).toBe(13);
      expect(incSv.toString()).toBe("1.5.13");
    });
  });

  describe("parse()", () => {
    it("creates a SemVer from the given string", () => {
      const r = util.SemVer.parse("1.5.12");
      const sv = r.unwrap();
      expect(sv.major).toBe(1);
      expect(sv.minor).toBe(5);
      expect(sv.patch).toBe(12);
    });

    it("fails with an error if the string is not a valid semver", () => {
      const r = util.SemVer.parse("1.10.10.3");
      const err = r.unwrapFailure();
      expect(err.error()).toBe("SemVer.Parse: Invalid semver string: 1.10.10.3");
    });
  });

  describe("mustParse()", () => {
    it("creates a SemVer from the given string", () => {
      const sv = util.SemVer.mustParse("1.5.12");
      expect(sv.major).toBe(1);
      expect(sv.minor).toBe(5);
      expect(sv.patch).toBe(12);
    });

    it("panics if the string is not a valid semver", () => {
      expect(() => {
        util.SemVer.mustParse("1.10.10.3");
      }).toPanic("SemVer.Parse: Invalid semver string: 1.10.10.3");
    });
  });

  describe("inspect", () => {
    it("returns a string representation of the semver", () => {
      const sv = new util.SemVer(1, 5, 12);
      const s = inspect(sv);
      expect(s).toBe("SemVer(1.5.12)");
    });
  });
});
