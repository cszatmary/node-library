import { colors, env } from "../../src";

describe("colors/colors.ts", () => {
  let noColor: string | undefined;
  beforeAll(() => {
    if (env.isEnvSet("NO_COLOR")) {
      noColor = env.getEnv("NO_COLOR");
      env.unsetEnv("NO_COLOR");
    }
  });

  afterAll(() => {
    if (noColor !== undefined) {
      env.setEnv("NO_COLOR", noColor);
    }
  });

  beforeEach(() => {
    colors.setColorEnabled(true);
  });

  describe("setColorEnabled()", () => {
    it("toggles colors being enabled", () => {
      expect(colors.isColorEnabled()).toBe(true);
      colors.setColorEnabled(false);
      expect(colors.isColorEnabled()).toBe(false);
      colors.setColorEnabled(true);
      expect(colors.isColorEnabled()).toBe(true);
    });
  });

  describe("color functions", () => {
    it("does nothing if color is disabled", () => {
      colors.setColorEnabled(false);
      expect(colors.red("foo bar")).toBe("foo bar");
    });

    it("resets the colored string", () => {
      const s = colors.red("foo bar");
      expect(colors.reset(s)).toBe("\x1b[0m\x1b[31mfoo bar\x1b[39m\x1b[0m");
    });

    it("creates a bold string", () => {
      expect(colors.bold("foo bar")).toBe("\x1b[1mfoo bar\x1b[22m");
    });

    it("creates a dim string", () => {
      expect(colors.dim("foo bar")).toBe("\x1b[2mfoo bar\x1b[22m");
    });

    it("creates an italic string", () => {
      expect(colors.italic("foo bar")).toBe("\x1b[3mfoo bar\x1b[23m");
    });

    it("creates a underlined string", () => {
      expect(colors.underline("foo bar")).toBe("\x1b[4mfoo bar\x1b[24m");
    });

    it("creates a inverted string", () => {
      expect(colors.invert("foo bar")).toBe("\x1b[7mfoo bar\x1b[27m");
    });

    it("creates a hidden string", () => {
      expect(colors.hidden("foo bar")).toBe("\x1b[8mfoo bar\x1b[28m");
    });

    it("creates a strikethrough string", () => {
      expect(colors.strikethrough("foo bar")).toBe("\x1b[9mfoo bar\x1b[29m");
    });

    it("creates a black string", () => {
      expect(colors.black("foo bar")).toBe("\x1b[30mfoo bar\x1b[39m");
    });

    it("creates a red string", () => {
      expect(colors.red("foo bar")).toBe("\x1b[31mfoo bar\x1b[39m");
    });

    it("creates a green string", () => {
      expect(colors.green("foo bar")).toBe("\x1b[32mfoo bar\x1b[39m");
    });

    it("creates a yellow string", () => {
      expect(colors.yellow("foo bar")).toBe("\x1b[33mfoo bar\x1b[39m");
    });

    it("creates a blue string", () => {
      expect(colors.blue("foo bar")).toBe("\x1b[34mfoo bar\x1b[39m");
    });

    it("creates a magenta string", () => {
      expect(colors.magenta("foo bar")).toBe("\x1b[35mfoo bar\x1b[39m");
    });

    it("creates a cyan string", () => {
      expect(colors.cyan("foo bar")).toBe("\x1b[36mfoo bar\x1b[39m");
    });

    it("creates a white string", () => {
      expect(colors.white("foo bar")).toBe("\x1b[37mfoo bar\x1b[39m");
    });

    it("creates a black background string", () => {
      expect(colors.bgBlack("foo bar")).toBe("\x1b[40mfoo bar\x1b[49m");
    });

    it("creates a red background string", () => {
      expect(colors.bgRed("foo bar")).toBe("\x1b[41mfoo bar\x1b[49m");
    });

    it("creates a green background string", () => {
      expect(colors.bgGreen("foo bar")).toBe("\x1b[42mfoo bar\x1b[49m");
    });

    it("creates a yellow background string", () => {
      expect(colors.bgYellow("foo bar")).toBe("\x1b[43mfoo bar\x1b[49m");
    });

    it("creates a blue background string", () => {
      expect(colors.bgBlue("foo bar")).toBe("\x1b[44mfoo bar\x1b[49m");
    });

    it("creates a magenta background string", () => {
      expect(colors.bgMagenta("foo bar")).toBe("\x1b[45mfoo bar\x1b[49m");
    });

    it("creates a cyan background string", () => {
      expect(colors.bgCyan("foo bar")).toBe("\x1b[46mfoo bar\x1b[49m");
    });

    it("creates a white background string", () => {
      expect(colors.bgWhite("foo bar")).toBe("\x1b[47mfoo bar\x1b[49m");
    });
  });
});
