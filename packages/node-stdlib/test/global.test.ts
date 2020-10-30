import { inspect } from "util";
import { Ref, Result, errors, panic, recover, util } from "../src";

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
      it("returns a string representation of the ref", () => {
        const ref = new Ref(10);
        const s = inspect(ref);
        expect(s).toBe("Ref(10)");
      });
    });
  });

  describe("Result", () => {
    describe("creation functions", () => {
      it("returns a new result of type Success", () => {
        const r = Result.success(10);
        expect(r.isSuccess()).toBe(true);
        expect(r.isFailure()).toBe(false);
      });

      it("returns a new result of type Failure", () => {
        const r = Result.failure(new Error("Oh no!"));
        expect(r.isFailure()).toBe(true);
        expect(r.isSuccess()).toBe(false);
      });

      it("converts a throwing function to a Success", () => {
        const r = Result.of(() => {
          return 2;
        });
        expect(r).toBeSuccess();
      });

      it("converts a throwing function to a Failure", () => {
        const r = Result.of(() => {
          throw new Error("Oh no!");
        });
        expect(r).toBeFailure();
      });

      it("converts a throwing async function to a Success", async () => {
        const r = await Result.ofPromise(async () => {
          return 2;
        });
        expect(r).toBeSuccess();
      });

      it("converts a throwing async function to a Failure", async () => {
        const r = await Result.ofPromise(async () => {
          throw new Error("Oh no!");
        });
        expect(r).toBeFailure();
      });
    });

    describe("unwrap()", () => {
      it("returns the value when the result a Success", () => {
        const r = Result.success(10);
        expect(r.unwrap()).toBe(10);
      });

      it("panics with the given message when the result is a Failure", () => {
        const r = Result.failure("Oh no!");
        expect(() => {
          r.unwrap("Something broke");
        }).toPanic("Something broke: Oh no!");
      });

      it("panics when the result is a Failure", () => {
        const r = Result.failure("Oh no!");
        expect(() => {
          r.unwrap();
        }).toPanic("Oh no!");
      });

      it("panics with the given message and stringified failure value", () => {
        const r = Result.failure(errors.errorString("oops"));
        expect(() => {
          r.unwrap("Something broke");
        }).toPanic("Something broke: oops");
      });
    });

    describe("unwrapFailure()", () => {
      it("panics with the given message when the result is a Success", () => {
        const r = Result.success(10);
        expect(() => {
          r.unwrapFailure("Something broke");
        }).toPanic("Something broke: 10");
      });

      it("panics when the result is a Success", () => {
        const r = Result.success(10);
        expect(() => {
          r.unwrapFailure();
        }).toPanic("10");
      });

      it("returns the error when the result a Failure", () => {
        const r = Result.failure("Oh no!");
        expect(r.unwrapFailure()).toBe("Oh no!");
      });

      it("panics with the given message and stringified success value", () => {
        const r = Result.success(new util.SemVer(1, 5, 12));
        expect(() => {
          r.unwrapFailure("Something broke");
        }).toPanic("Something broke: 1.5.12");
      });
    });

    describe("success()", () => {
      it("returns the value when the result a Success", () => {
        const r = Result.success(10);
        expect(r.success()).toBe(10);
      });

      it("returns undefined when the result is Failure", () => {
        const r = Result.failure("Oh no!");
        expect(r.success()).toBeUndefined();
      });
    });

    describe("failure()", () => {
      it("returns undefined when the result a Success", () => {
        const r = Result.success(10);
        expect(r.failure()).toBeUndefined();
      });

      it("returns the error when the result is Failure", () => {
        const r = Result.failure("Oh no!");
        expect(r.failure()).toBe("Oh no!");
      });
    });

    describe("map()", () => {
      it("creates a new result mapping the success value", () => {
        const r = Result.success(10);
        const newR = r.map((v) => v + 10);
        expect(newR).not.toBe(r);
        expect(newR.success()).toBe(20);
      });

      it("returns a new result with the same failure value", () => {
        const err = "Oh no!";
        const r = Result.failure<number, string>(err);
        const newR = r.map((v) => v + 10);
        expect(newR).not.toBe(r);
        expect(newR.failure()).toBe(err);
      });
    });

    describe("mapFailure()", () => {
      it("returns a new result with the same success value", () => {
        const r = Result.success<number, string>(10);
        const newR = r.mapFailure((e) => errors.newError(e));
        expect(newR).not.toBe(r);
        expect(newR.success()).toBe(10);
      });

      it("creates a new result mapping the failure value", () => {
        const err = "Oh no!";
        const r = Result.failure<number, string>(err);
        const newR = r.mapFailure((e) => errors.newError(e));
        expect(newR).not.toBe(r);
        expect(newR.failure()?.error()).toBe(err);
      });
    });

    describe("flatMap()", () => {
      it("creates a new result mapping the success value and unwrapping the result", () => {
        const r = Result.success(10);
        const newR = r.flatMap((v) => Result.success(v + 10));
        expect(newR).not.toBe(r);
        expect(newR.success()).toBe(20);
      });

      it("returns a new result with the same failure value", () => {
        const err = "Oh no!";
        const r = Result.failure<number, string>(err);
        const newR = r.flatMap((v) => Result.success(v + 10));
        expect(newR).not.toBe(r);
        expect(newR.failure()).toBe(err);
      });
    });

    describe("flatMapFailure()", () => {
      it("returns a new result with the same success value", () => {
        const r = Result.success<number, string>(10);
        const newR = r.flatMapFailure((e) => Result.failure(errors.newError(e)));
        expect(newR).not.toBe(r);
        expect(newR.success()).toBe(10);
      });

      it("creates a new result mapping the failure value and unwrapping the result", () => {
        const err = "Oh no!";
        const r = Result.failure<number, string>(err);
        const newR = r.flatMapFailure((e) => Result.failure(errors.newError(e)));
        expect(newR).not.toBe(r);
        expect(newR.failure()?.error()).toBe(err);
      });
    });

    describe("resultify()", () => {
      it("converts the throwing function into one that returns a Result", () => {
        function divide(a: number, b: number): number {
          if (b === 0) {
            throw new Error("Cannot divide by zero!");
          }

          return a / b;
        }

        const resultifiedDivide = Result.resultify(divide);
        const s = resultifiedDivide(6, 3);
        const f = resultifiedDivide(6, 0);

        expect(s.success()).toEqual(2);
        expect(f.failure()?.message).toBe("Cannot divide by zero!");
      });
    });

    describe("resultifyPromise()", () => {
      it("converts the function into one that returns a promise to a result", async () => {
        function divide(a: number, b: number): Promise<number> {
          if (b === 0) {
            return Promise.reject(new Error("Cannot divide by zero!"));
          }

          return Promise.resolve(a / b);
        }

        const resultifiedDivide = Result.resultifyPromise(divide);
        const s = await resultifiedDivide(6, 3);
        const f = await resultifiedDivide(6, 0);

        expect(s.success()).toEqual(2);
        expect(f.failure()?.message).toBe("Cannot divide by zero!");
      });
    });

    describe("inspect", () => {
      it("returns a string representation of the Result", () => {
        const success = Result.success(10);
        const failure = Result.failure("oh no!");
        const s1 = inspect(success);
        const s2 = inspect(failure);
        expect(s1).toBe("Result.success(10)");
        expect(s2).toBe("Result.failure(oh no!)");
      });

      it("handles errors specially", () => {
        const failure = Result.failure(errors.errorString("err something blew up"));
        const s = inspect(failure);
        expect(s).toBe("Result.failure(err something blew up)");
      });
    });
  });
});
