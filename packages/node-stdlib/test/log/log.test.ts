import { log } from "../../src";

describe("log/log.ts", () => {
  describe("levelString()", () => {
    test.each([
      [log.Level.debug, "debug"],
      [log.Level.info, "info"],
      [log.Level.warn, "warn"],
      [log.Level.error, "error"],
      [log.Level.fatal, "fatal"],
      [log.Level.panic, "panic"],
    ])("converts the level %d to a string representation: %s", (level, expected) => {
      expect(log.levelString(level)).toBe(expected);
    });
  });

  describe("parseLevel()", () => {
    test.each([
      ["debug", log.Level.debug],
      ["info", log.Level.info],
      ["warn", log.Level.warn],
      ["error", log.Level.error],
      ["fatal", log.Level.fatal],
      ["panic", log.Level.panic],
    ])("returns the level matching the string: %s", (str, expectedLevel) => {
      expect(log.parseLevel(str).unwrap()).toBe(expectedLevel);
    });

    it("returns an error if the string is an invalid level", () => {
      const err = log.parseLevel("oops").unwrapFailure();
      expect(err.error()).toBe("not a valid log level: oops");
    });
  });
});
