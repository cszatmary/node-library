import { core } from "../../src";

const { Result } = core;

describe("Result", () => {
  describe("creation functions", () => {
    it("returns a new result of type Success", () => {
      const r = Result.success(10);
      expect(r.isSuccess).toBe(true);
      expect(r.isFailure).toBe(false);
    });

    it("returns a new result of type Failure", () => {
      const r = Result.failure(new Error("Oh no!"));
      expect(r.isFailure).toBe(true);
      expect(r.isSuccess).toBe(false);
    });

    it("converts a throwing function to a Success", () => {
      const r = Result.of(() => {
        return 2;
      });
      expect(r.isSuccess).toBe(true);
    });

    it("converts a throwing function to a Failure", () => {
      const r = Result.of(() => {
        throw new Error("Oh no!");
      });
      expect(r.isFailure).toBe(true);
    });
  });

  describe("get()", () => {
    it("returns the value when the result a Success", () => {
      const r = Result.success(10);
      expect(r.get()).toBe(10);
    });

    it("throws the causing error when the result is Failure", () => {
      const r = Result.failure(new Error("Oh no!"));
      expect(() => {
        r.get();
      }).toThrow();
    });
  });

  describe("getOrUndefined()", () => {
    it("returns the value when the result a Success", () => {
      const r = Result.success(10);
      expect(r.getOrUndefined()).toBe(10);
    });

    it("returns undefined when the result is Failure", () => {
      const r = Result.failure(new Error("Oh no!"));
      expect(r.getOrUndefined()).toBeUndefined();
    });
  });

  describe("getOrElse()", () => {
    it("returns the value when the result a Success", () => {
      const r = Result.success(10);
      expect(r.getOrElse(2)).toBe(10);
    });

    it("returns the default value when the result is Failure", () => {
      const r = Result.failure(new Error("Oh no!"));
      expect(r.getOrElse(2)).toBe(2);
    });
  });

  describe("error()", () => {
    it("throws an error if the result is a Success", () => {
      const r = Result.success(10);
      expect(() => {
        r.error();
      }).toThrow();
    });

    it("returns the error when the result is a Failure", () => {
      const err = new Error("Oh no!");
      const r = Result.failure(err);
      expect(r.error()).toBe(err);
    });
  });

  describe("map()", () => {
    it("creates a new result mapping the success value", () => {
      const r = Result.success(10);
      const newR = r.map((v) => v + 10);
      expect(newR).not.toBe(r);
      expect(newR.get()).toBe(20);
    });

    it("returns a new result with the same error value", () => {
      const err = new Error("Oh no!");
      const r = Result.failure<number, Error>(err);
      const newR = r.map((v) => v + 10);
      expect(newR).not.toBe(r);
      expect(newR.error()).toBe(err);
    });
  });

  describe("mapError()", () => {
    it("returns a new result with the same success value", () => {
      const r = Result.success(10);
      const newR = r.mapError((e) => new Error(e.message));
      expect(newR).not.toBe(r);
      expect(newR.get()).toBe(10);
    });

    it("creates a new result mapping the error value", () => {
      const err = new Error("Oh no!");
      const r = Result.failure<number, Error>(err);
      const newR = r.mapError((e) => new Error(e.message));
      expect(newR).not.toBe(r);
      expect(newR.error()).not.toBe(err);
    });
  });

  describe("flatMap()", () => {
    it("creates a new result mapping the success value and unwrapping the result", () => {
      const r = Result.success(10);
      const newR = r.flatMap((v) => Result.success(v + 10));
      expect(newR).not.toBe(r);
      expect(newR.get()).toBe(20);
    });

    it("returns a new result with the same error value", () => {
      const err = new Error("Oh no!");
      const r = Result.failure<number, Error>(err);
      const newR = r.flatMap((v) => Result.success(v + 10));
      expect(newR).not.toBe(r);
      expect(newR.error()).toBe(err);
    });
  });

  describe("flatMapError()", () => {
    it("returns a new result with the same success value", () => {
      const r = Result.success(10);
      const newR = r.flatMapError((e) => Result.failure(new Error(e.message)));
      expect(newR).not.toBe(r);
      expect(newR.get()).toBe(10);
    });

    it("creates a new result mapping the error value and unwrapping the result", () => {
      const err = new Error("Oh no!");
      const r = Result.failure<number, Error>(err);
      const newR = r.flatMapError((e) => Result.failure(new Error(e.message)));
      expect(newR).not.toBe(r);
      expect(newR.error()).not.toBe(err);
    });
  });

  describe("fold()", () => {
    it("returns the result of onSuccess when the result is a Success", () => {
      const r = Result.success(10);
      const val = r.fold(
        (s) => s + 10,
        (_e) => 100,
      );
      expect(val).toBe(20);
    });

    it("returns the result of onFailure when the result is a Failure", () => {
      const r = Result.failure<number, Error>(new Error("Oh no!"));
      const val = r.fold(
        (s) => s + 10,
        (_e) => 100,
      );
      expect(val).toBe(100);
    });
  });
});
