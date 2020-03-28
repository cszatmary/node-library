import { core, errors } from "../../src";

const { Result } = core;

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
      expect(r.isSuccess()).toBe(true);
    });

    it("converts a throwing function to a Failure", () => {
      const r = Result.of(() => {
        throw new Error("Oh no!");
      });
      expect(r.isFailure()).toBe(true);
    });
  });

  describe("unwrap() / unwrapFailure()", () => {
    let stderrData: string;
    let didExit: boolean;
    let spyError: jest.SpyInstance;
    let spyExit: jest.SpyInstance;

    beforeEach(() => {
      stderrData = "";
      didExit = false;
      spyError = jest
        .spyOn(console, "error")
        .mockImplementation((input: string, ...rest: unknown[]) => {
          if (rest.length > 0) {
            stderrData += `${input} ${rest.join(" ")}\n`;
          } else {
            stderrData += `${input}\n`;
          }
        });
      spyExit = jest.spyOn(process, "exit").mockImplementation((() => {
        didExit = true;
      }) as () => never);
    });

    afterEach(() => {
      spyError.mockRestore();
      spyExit.mockRestore();
    });

    it("returns the value when the result a Success", () => {
      const r = Result.success(10);
      expect(r.unwrap()).toBe(10);
      expect(stderrData).toBe("");
      expect(didExit).toBe(false);
    });

    it("prints the message and exits the program when the result is a Failure", () => {
      const r = Result.failure("Oh no!");
      expect(r.unwrap("panic!")).toBeUndefined();
      expect(stderrData).toBe("panic!: Oh no!\n");
      expect(didExit).toBe(true);
    });

    it("exits the program when the result is a Failure", () => {
      const r = Result.failure("Oh no!");
      expect(r.unwrap()).toBeUndefined();
      expect(stderrData).toBe("Oh no!\n");
      expect(didExit).toBe(true);
    });

    it("prints the message and exits the program when the result is a Success", () => {
      const r = Result.success(10);
      expect(r.unwrapFailure("panic!")).toBeUndefined();
      expect(stderrData).toBe("panic!: 10\n");
      expect(didExit).toBe(true);
    });

    it("exits the program when the result is a Success", () => {
      const r = Result.success(10);
      expect(r.unwrapFailure()).toBeUndefined();
      expect(stderrData).toBe("10\n");
      expect(didExit).toBe(true);
    });

    it("returns the error when the result a Failure", () => {
      const r = Result.failure("Oh no!");
      expect(r.unwrapFailure()).toBe("Oh no!");
      expect(stderrData).toBe("");
      expect(didExit).toBe(false);
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

  describe("error()", () => {
    it("returns undefined when the result a Success", () => {
      const r = Result.success(10);
      expect(r.failure()).toBeUndefined();
    });

    it("returns the error when the result is Failure", () => {
      const r = Result.failure("Oh no!");
      expect(r.failure()).toBe("Oh no!");
    });
  });

  describe("orElse()", () => {
    it("returns the value when the result a Success", () => {
      const r = Result.success(10);
      expect(r.orElse(2)).toBe(10);
    });

    it("returns the default value when the result is Failure", () => {
      const r = Result.failure("Oh no!");
      expect(r.orElse(2)).toBe(2);
    });
  });

  describe("map()", () => {
    it("creates a new result mapping the success value", () => {
      const r = Result.success(10);
      const newR = r.map((v) => v + 10);
      expect(newR).not.toBe(r);
      expect(newR.success()).toBe(20);
    });

    it("returns a new result with the same error value", () => {
      const err = "Oh no!";
      const r = Result.failure<number, string>(err);
      const newR = r.map((v) => v + 10);
      expect(newR).not.toBe(r);
      expect(newR.failure()).toBe(err);
    });
  });

  describe("mapError()", () => {
    it("returns a new result with the same success value", () => {
      const r = Result.success<number, string>(10);
      const newR = r.mapFailure((e) => errors.newError(e));
      expect(newR).not.toBe(r);
      expect(newR.success()).toBe(10);
    });

    it("creates a new result mapping the error value", () => {
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

    it("returns a new result with the same error value", () => {
      const err = "Oh no!";
      const r = Result.failure<number, string>(err);
      const newR = r.flatMap((v) => Result.success(v + 10));
      expect(newR).not.toBe(r);
      expect(newR.failure()).toBe(err);
    });
  });

  describe("flatMapError()", () => {
    it("returns a new result with the same success value", () => {
      const r = Result.success<number, string>(10);
      const newR = r.flatMapFailure((e) => Result.failure(errors.newError(e)));
      expect(newR).not.toBe(r);
      expect(newR.success()).toBe(10);
    });

    it("creates a new result mapping the error value and unwrapping the result", () => {
      const err = "Oh no!";
      const r = Result.failure<number, string>(err);
      const newR = r.flatMapFailure((e) => Result.failure(errors.newError(e)));
      expect(newR).not.toBe(r);
      expect(newR.failure()?.error()).toBe(err);
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
      const r = Result.failure<number, string>("Oh no!");
      const val = r.fold(
        (s) => s + 10,
        (_e) => 100,
      );
      expect(val).toBe(100);
    });
  });
});
