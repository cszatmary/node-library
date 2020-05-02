import { log } from "../../src";

describe("log/log.ts", () => {
  describe("levelString()", () => {
    it("converts the level to a string representation", () => {
      expect(log.levelString(log.Level.debug)).toBe("debug");
      expect(log.levelString(log.Level.info)).toBe("info");
      expect(log.levelString(log.Level.warn)).toBe("warn");
      expect(log.levelString(log.Level.error)).toBe("error");
      expect(log.levelString(log.Level.fatal)).toBe("fatal");
      expect(log.levelString(log.Level.panic)).toBe("panic");
    });
  });

  describe("parseLevel()", () => {
    it("returns the level matching the given string", () => {
      expect(log.parseLevel("debug").unwrap()).toBe(log.Level.debug);
      expect(log.parseLevel("info").unwrap()).toBe(log.Level.info);
      expect(log.parseLevel("warn").unwrap()).toBe(log.Level.warn);
      expect(log.parseLevel("error").unwrap()).toBe(log.Level.error);
      expect(log.parseLevel("fatal").unwrap()).toBe(log.Level.fatal);
      expect(log.parseLevel("panic").unwrap()).toBe(log.Level.panic);
    });

    it("returns an error if the string is an invalid level", () => {
      const err = log.parseLevel("oops").unwrapFailure();
      expect(err.error()).toBe("not a valid log level: oops");
    });
  });
});
