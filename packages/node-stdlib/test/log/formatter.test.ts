import { colors, errors, log, util } from "../../src";

const isoRegex = `\\d{4}-[01]\\d-[0-3]\\dT[0-2]\\d:[0-5]\\d:[0-5]\\d\\.\\d+([+-][0-2]\\d:[0-5]\\d|Z)`;

function createLogFixture(l?: Partial<log.Log>): log.Log {
  return {
    data: l?.data ?? {},
    date: l?.date ?? new Date(),
    level: l?.level ?? log.Level.debug,
    msg: l?.msg ?? "log message",
    out: l?.out,
  };
}

describe("log/formatter.ts", () => {
  describe("JSONFormatter", () => {
    it("formats the log as json", () => {
      const l = createLogFixture({
        data: { foo: "bar" },
      });
      const f = new log.JSONFormatter();
      const s = f.format(l).unwrap().toString();
      const json = JSON.parse(s);

      expect(json).toEqual({
        time: l.date.toISOString(),
        level: "debug",
        msg: "log message",
        foo: "bar",
      });
    });

    it("prevents clashes with default fields", () => {
      const l = createLogFixture({
        data: {
          time: "noon",
          level: 56,
          msg: "some stuff",
        },
      });
      const f = new log.JSONFormatter();
      const s = f.format(l).unwrap().toString();
      const json = JSON.parse(s);

      expect(json).toEqual({
        time: l.date.toISOString(),
        level: "debug",
        msg: "log message",
        "fields.time": "noon",
        "fields.level": 56,
        "fields.msg": "some stuff",
      });
    });

    it("renames default fields", () => {
      const l = createLogFixture({
        data: {
          time: "noon",
          level: 56,
          msg: "some stuff",
        },
      });
      const f = new log.JSONFormatter({
        fieldMap: new Map([
          [log.FieldKey.time, "@time"],
          [log.FieldKey.level, "@level"],
          [log.FieldKey.msg, "@msg"],
        ]),
      });
      const s = f.format(l).unwrap().toString();
      const json = JSON.parse(s);

      expect(json).toEqual({
        "@time": l.date.toISOString(),
        "@level": "debug",
        "@msg": "log message",
        time: "noon",
        level: 56,
        msg: "some stuff",
      });
    });

    it("formats errors properly", () => {
      const l = createLogFixture({
        data: {
          err1: errors.errorString("oops"),
          err2: errors.newError("boom!"),
        },
      });
      const f = new log.JSONFormatter();
      const s = f.format(l).unwrap().toString();
      const json = JSON.parse(s);

      expect(json).toEqual({
        time: l.date.toISOString(),
        level: "debug",
        msg: "log message",
        err1: "oops",
        err2: "boom!",
      });
    });

    it("nests fields under the specified key", () => {
      const l = createLogFixture({
        data: {
          foo: "bar",
          baz: 2,
        },
      });
      const f = new log.JSONFormatter({
        dataKey: "props",
      });
      const s = f.format(l).unwrap().toString();
      const json = JSON.parse(s);

      expect(json).toEqual({
        time: l.date.toISOString(),
        level: "debug",
        msg: "log message",
        props: {
          foo: "bar",
          baz: 2,
        },
      });
    });
  });

  describe("TextFormatter", () => {
    it("formats the log as text", () => {
      const l = createLogFixture({
        data: { foo: "bar" },
      });
      const f = new log.TextFormatter();
      const s = f.format(l).unwrap().toString();

      const regex = new RegExp(`time="${isoRegex}" level=debug msg="log message" foo=bar`);
      expect(s).toMatch(regex);
    });

    it("prevents clashes with default fields", () => {
      const l = createLogFixture({
        data: {
          time: "noon",
          level: 56,
          msg: "some stuff",
        },
      });
      const f = new log.TextFormatter();
      const s = f.format(l).unwrap().toString();

      const regex = new RegExp(
        `time="${isoRegex}" level=debug msg="log message" fields.level=56 fields.msg="some stuff" fields.time=noon`,
      );
      expect(s).toMatch(regex);
    });

    it("renames default fields", () => {
      const l = createLogFixture({
        data: {
          time: "noon",
          level: 56,
          msg: "some stuff",
        },
      });
      const f = new log.TextFormatter({
        fieldMap: new Map([
          [log.FieldKey.time, "@time"],
          [log.FieldKey.level, "@level"],
          [log.FieldKey.msg, "@msg"],
        ]),
      });
      const s = f.format(l).unwrap().toString();

      const regex = new RegExp(
        `@time="${isoRegex}" @level=debug @msg="log message" level=56 msg="some stuff" time=noon`,
      );
      expect(s).toMatch(regex);
    });

    it("forces quotes", () => {
      const l = createLogFixture({
        data: { foo: "bar" },
      });
      const f = new log.TextFormatter({
        forceQuote: true,
      });
      const s = f.format(l).unwrap().toString();

      const regex = new RegExp(`time="${isoRegex}" level="debug" msg="log message" foo="bar"`);
      expect(s).toMatch(regex);
    });

    it("disables quoting", () => {
      const l = createLogFixture({
        data: { foo: "bar" },
      });
      const f = new log.TextFormatter({
        disableQuote: true,
      });
      const s = f.format(l).unwrap().toString();

      const regex = new RegExp(`time=${isoRegex} level=debug msg=log message foo=bar`);
      expect(s).toMatch(regex);
    });

    it("formats the text with color", () => {
      const l = createLogFixture({
        data: { foo: "bar" },
      });
      const f = new log.TextFormatter({
        forceColors: true,
        disableTimestamp: true,
      });
      const s = f.format(l).unwrap().toString();

      expect(s).toBe(`${colors.white("DEBU")} log message ${colors.white("foo")}=bar\n`);
    });

    it("disables level truncation", () => {
      const l = createLogFixture({
        data: { foo: "bar" },
        level: log.Level.error,
      });
      const f = new log.TextFormatter({
        forceColors: true,
        disableTimestamp: true,
        disableLevelTruncation: true,
      });
      const s = f.format(l).unwrap().toString();

      expect(s).toBe(`${colors.red("ERROR")} log message ${colors.red("foo")}=bar\n`);
    });

    it("pads the level", () => {
      const l = createLogFixture({
        data: { foo: "bar" },
        level: log.Level.info,
      });
      const f = new log.TextFormatter({
        forceColors: true,
        disableTimestamp: true,
        padLevelText: true,
      });
      const s = f.format(l).unwrap().toString();

      expect(s).toBe(`${colors.blue("INFO ")} log message ${colors.blue("foo")}=bar\n`);
    });

    it("stringifies values according to util.toString semantics", () => {
      const l = createLogFixture({
        data: {
          bool: true,
          error: errors.errorString("oh no"),
          nil: null,
          num: 10.5,
          obj: { a: 1, b: "prop" },
          semver: new util.SemVer(1, 12, 5),
          str: "hello",
          undef: undefined,
        },
      });
      const f = new log.TextFormatter({
        disableColors: true,
        disableTimestamp: true,
      });
      const s = f.format(l).unwrap().toString();

      const e = `level=debug msg="log message" bool=true error="oh no" nil=null num=10.5 obj="{ a: 1, b: 'prop' }" semver=1.12.5 str=hello undef=undefined\n`;
      expect(s).toBe(e);
    });
  });
});
