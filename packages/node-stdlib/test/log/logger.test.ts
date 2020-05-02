import { core, log } from "../../src";

describe("log/logger.ts", () => {
  describe("isLevelEnabled()", () => {
    it("returns true if the log level is enabled", () => {
      const logger = new log.StandardLogger({
        level: log.Level.info,
      });
      expect(logger.isLevelEnabled(log.Level.info)).toBe(true);
      expect(logger.isLevelEnabled(log.Level.error)).toBe(true);
    });

    it("returns false if the log level is not enabled", () => {
      const logger = new log.StandardLogger({
        level: log.Level.warn,
      });
      expect(logger.isLevelEnabled(log.Level.debug)).toBe(false);
      expect(logger.isLevelEnabled(log.Level.info)).toBe(false);
    });
  });

  describe("logging methods", () => {
    it("writes a log at debug level", () => {
      const b = new core.DynamicBuffer();
      const logger = new log.StandardLogger({
        out: b,
        formatter: new log.TextFormatter({ disableTimestamp: true }),
        level: log.Level.debug,
      });
      logger.debug("log message");

      expect(b.toString()).toBe(`level=debug msg="log message"\n`);
    });

    it("writes a log at info level", () => {
      const b = new core.DynamicBuffer();
      const logger = new log.StandardLogger({
        out: b,
        formatter: new log.TextFormatter({ disableTimestamp: true }),
        level: log.Level.info,
      });
      logger.info("log message");

      expect(b.toString()).toBe(`level=info msg="log message"\n`);
    });

    it("writes a log at warn level", () => {
      const b = new core.DynamicBuffer();
      const logger = new log.StandardLogger({
        out: b,
        formatter: new log.TextFormatter({ disableTimestamp: true }),
        level: log.Level.warn,
      });
      logger.warn("log message");

      expect(b.toString()).toBe(`level=warn msg="log message"\n`);
    });

    it("writes a log at error level", () => {
      const b = new core.DynamicBuffer();
      const logger = new log.StandardLogger({
        out: b,
        formatter: new log.TextFormatter({ disableTimestamp: true }),
        level: log.Level.error,
      });
      logger.error("log message");

      expect(b.toString()).toBe(`level=error msg="log message"\n`);
    });

    it("writes a log at fatal level then exists", () => {
      let exitCode = 0;
      const spyExit = jest.spyOn(process, "exit").mockImplementation(((
        code,
      ) => {
        exitCode = code as number;
      }) as (code?: number) => never);

      const b = new core.DynamicBuffer();
      const logger = new log.StandardLogger({
        out: b,
        formatter: new log.TextFormatter({ disableTimestamp: true }),
        level: log.Level.fatal,
      });
      logger.fatal("log message");

      expect(b.toString()).toBe(`level=fatal msg="log message"\n`);
      expect(exitCode).toBe(1);
      spyExit.mockRestore();
    });

    it("writes a log at panic level, then panics", () => {
      const b = new core.DynamicBuffer();
      const logger = new log.StandardLogger({
        out: b,
        formatter: new log.TextFormatter({ disableTimestamp: true }),
        level: log.Level.panic,
      });

      expect(() => {
        logger.panic("log message");
      }).toPanic();

      expect(b.toString()).toBe(`level=panic msg="log message"\n`);
    });

    it("doesn't log anything if the log level isn't enabled", () => {
      const b = new core.DynamicBuffer();
      const logger = new log.StandardLogger({
        out: b,
        formatter: new log.TextFormatter({ disableTimestamp: true }),
        level: log.Level.info,
      });
      logger.debug("log message");

      expect(b.toString()).toBe("");
    });
  });

  describe("fields", () => {
    it("logs the message with the fields", () => {
      const b = new core.DynamicBuffer();
      const logger = new log.StandardLogger({
        out: b,
        formatter: new log.TextFormatter({ disableTimestamp: true }),
        level: log.Level.info,
      });
      logger.info("log message", { foo: "bar", baz: 1 });

      expect(b.toString()).toBe(`level=info msg="log message" baz=1 foo=bar\n`);
    });

    it("adds a global field that will be included in all logs", () => {
      const b = new core.DynamicBuffer();
      const logger = new log.StandardLogger({
        out: b,
        formatter: new log.TextFormatter({ disableTimestamp: true }),
        level: log.Level.info,
      });
      logger.addField("foo", "bar");
      logger.info("log message", { baz: 1 });

      expect(b.toString()).toBe(`level=info msg="log message" baz=1 foo=bar\n`);
    });

    it("adds global fields that will be included in all logs", () => {
      const b = new core.DynamicBuffer();
      const logger = new log.StandardLogger({
        out: b,
        formatter: new log.TextFormatter({ disableTimestamp: true }),
        level: log.Level.info,
      });
      logger.addFields({ foo: "bar", baz: 1 });
      logger.info("log message");

      expect(b.toString()).toBe(`level=info msg="log message" baz=1 foo=bar\n`);
    });

    it("overwrites the global field with the local field", () => {
      const b = new core.DynamicBuffer();
      const logger = new log.StandardLogger({
        out: b,
        formatter: new log.TextFormatter({ disableTimestamp: true }),
        level: log.Level.info,
      });
      logger.addFields({ foo: "bar", baz: 1 });
      logger.info("log message", { baz: "foo" });

      expect(b.toString()).toBe(
        `level=info msg="log message" baz=foo foo=bar\n`,
      );
    });
  });
});
