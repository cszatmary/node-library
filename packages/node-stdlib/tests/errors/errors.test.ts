import { errors } from "../../src";

describe("errors", () => {
  const ioErr = errors.errorString("IO Error");

  describe("errorString()", () => {
    it("creates a new error from the given string", () => {
      const err = errors.errorString("foo");
      expect(err.error()).toBe("foo");
      expect(err.detailedError()).toBe("foo");
    });
  });

  describe("newError", () => {
    it("creates a new error with the given message", () => {
      const err = errors.newError("foo");
      expect(err.error()).toBe("foo");
    });

    it("creates errors with the same values", () => {
      const err = errors.newError("foo");
      const otherErr = errors.newError("foo");
      expect(err.error()).toBe(otherErr.error());
    });
  });

  describe("fromJSError", () => {
    it("creates a new error from the given JS error", () => {
      const jsErr = new TypeError("invalid type");
      const err = errors.fromJSError(jsErr);
      expect(err.error()).toBe("TypeError: invalid type");
    });
  });

  describe("withStack", () => {
    it("returns undefined if the error is undefined", () => {
      const err = errors.withStack(undefined);
      expect(err).toBeUndefined();
    });

    it("creates a new error with a stack trace", () => {
      const err = errors.withStack(ioErr);
      expect(err.error()).toBe("IO Error");
    });

    it("creates another error wrapping the previous one", () => {
      const err = errors.withStack(errors.withStack(ioErr));
      expect(err.error()).toBe("IO Error");
    });
  });

  describe("withMessage", () => {
    it("returns undefined if the error is undefined", () => {
      const err = errors.withMessage(undefined, "no error");
      expect(err).toBeUndefined();
    });

    it("creates a new error with a message", () => {
      const err = errors.withMessage(ioErr, "error reading file");
      expect(err.error()).toBe("error reading file: IO Error");
    });

    it("creates another error wrapping the previous one", () => {
      const err = errors.withMessage(
        errors.withMessage(ioErr, "error reading file"),
        "error loading config",
      );
      expect(err.error()).toBe(
        "error loading config: error reading file: IO Error",
      );
    });
  });

  describe("wrap", () => {
    it("returns undefined if the error is undefined", () => {
      const err = errors.wrap(undefined, "no error");
      expect(err).toBeUndefined();
    });

    it("wraps the given error", () => {
      const err = errors.wrap(ioErr, "error reading file");
      expect(err.error()).toBe("error reading file: IO Error");
    });

    it("wraps nested errors", () => {
      const err = errors.wrap(
        errors.wrap(ioErr, "error reading file"),
        "error loading config",
      );
      expect(err.error()).toBe(
        "error loading config: error reading file: IO Error",
      );
      // Check that the error is printed with a stack trace
      expect(err.detailedError()).toMatch(
        /^IO Error\nerror reading file\n\s+at\s(?:.+?)\s\(.*packages\/node-stdlib\/tests\/errors\/errors\.test\.ts/m,
      );
    });
  });

  describe("cause", () => {
    it("returns undefined if the error is undefined", () => {
      const err = errors.cause(undefined);
      expect(err).toBeUndefined();
    });

    it("returns the same error if there is no cause", () => {
      const err = errors.newError("oops");
      const cause = errors.cause(err);
      expect(cause).toBe(err);
    });

    it("returns the cause after wrap", () => {
      const err = errors.wrap(ioErr, "wrapped");
      const cause = errors.cause(err);
      expect(cause).toBe(ioErr);
    });

    it("returns the cause after withStack", () => {
      const err = errors.withStack(ioErr);
      const cause = errors.cause(err);
      expect(cause).toBe(ioErr);
    });

    it("returns the cause after withMessage", () => {
      const err = errors.withMessage(ioErr, "wrapped");
      const cause = errors.cause(err);
      expect(cause).toBe(ioErr);
    });
  });
});
