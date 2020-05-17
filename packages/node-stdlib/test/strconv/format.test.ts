import { strconv } from "../../src";

describe("strconv/format.ts", () => {
  describe("formatBool()", () => {
    it("formats the bool as a string", () => {
      expect(strconv.formatBool(true)).toBe("true");
      expect(strconv.formatBool(false)).toBe("false");
    });
  });

  describe("formatInt()", () => {
    it("formats the int in base 10", () => {
      expect(strconv.formatInt(0)).toBe("0");
      expect(strconv.formatInt(1)).toBe("1");
      expect(strconv.formatInt(-1)).toBe("-1");
      expect(strconv.formatInt(12345678)).toBe("12345678");
      expect(strconv.formatInt(-98765432)).toBe("-98765432");
    });

    it("formats the int in base 2", () => {
      expect(strconv.formatInt(0, 2)).toBe("0");
      expect(strconv.formatInt(10, 2)).toBe("1010");
      expect(strconv.formatInt(-1, 2)).toBe("-1");
    });

    it("formats the int in base 8", () => {
      expect(strconv.formatInt(-8, 8)).toBe("-10");
      expect(strconv.formatInt(0o57635, 8)).toBe("57635");
      expect(strconv.formatInt(14, 8)).toBe("16");
    });

    it("formats the int in base 16", () => {
      expect(strconv.formatInt(16, 16)).toBe("10");
      expect(strconv.formatInt(-0x12345abcdef, 16)).toBe("-12345abcdef");
      expect(strconv.formatInt(95, 16)).toBe("5f");
    });

    it("panics if i is not an integer", () => {
      expect(() => {
        strconv.formatInt(1.1);
      }).toPanic("formatInt: i must be a valid integer");
    });

    it("panics if base is not an integer", () => {
      expect(() => {
        strconv.formatInt(5, 2.1);
      }).toPanic("formatInt: base must be a valid integer");
    });

    it("panics if base < 2 or base > 36", () => {
      expect(() => {
        strconv.formatInt(5, 1);
      }).toPanic("formatInt: illegal number base: 1");

      expect(() => {
        strconv.formatInt(5, 50);
      }).toPanic("formatInt: illegal number base: 50");
    });
  });

  describe("formatFloat()", () => {
    it("formats the float with fixed format", () => {
      expect(strconv.formatFloat(1, "f", 5)).toBe("1.00000");
      expect(strconv.formatFloat(0, "f", 5)).toBe("0.00000");
      expect(strconv.formatFloat(-1, "f", 5)).toBe("-1.00000");
      expect(strconv.formatFloat(12, "f", 5)).toBe("12.00000");
      expect(strconv.formatFloat(123456700, "f", 5)).toBe("123456700.00000");
      expect(strconv.formatFloat(1.2345e6, "f", 5)).toBe("1234500.00000");
      expect(strconv.formatFloat(0.9, "f", 1)).toBe("0.9");
      expect(strconv.formatFloat(0.09, "f", 1)).toBe("0.1");
      expect(strconv.formatFloat(0.0999, "f", 1)).toBe("0.1");
      expect(strconv.formatFloat(0.05, "f", 1)).toBe("0.1");
      expect(strconv.formatFloat(0.05, "f", 0)).toBe("0");
      expect(strconv.formatFloat(0.5, "f", 1)).toBe("0.5");
      expect(strconv.formatFloat(0.5, "f", 0)).toBe("1");
      expect(strconv.formatFloat(1.5, "f", 0)).toBe("2");

      expect(strconv.formatFloat(123456, "f")).toBe("123456");
      expect(strconv.formatFloat(12345.6789, "f")).toBe("12345.6789");
      expect(strconv.formatFloat(12345.6789, "f", 0)).toBe("12346");
      expect(strconv.formatFloat(12345.6789, "f", 1)).toBe("12345.7");
      expect(strconv.formatFloat(12345.6789, "f", 6)).toBe("12345.678900");
    });

    it("formats the float with exponential format", () => {
      expect(strconv.formatFloat(1, "e", 5)).toBe("1.00000e+0");
      expect(strconv.formatFloat(0, "e", 5)).toBe("0.00000e+0");
      expect(strconv.formatFloat(-1, "e", 5)).toBe("-1.00000e+0");
      expect(strconv.formatFloat(12, "e", 5)).toBe("1.20000e+1");
      expect(strconv.formatFloat(123456700, "e", 5)).toBe("1.23457e+8");
      expect(strconv.formatFloat(1.2345e6, "e", 5)).toBe("1.23450e+6");
      expect(strconv.formatFloat(1e23, "e", 17)).toBe(
        "9.99999999999999916e+22",
      );
      expect(strconv.formatFloat(1e23, "e")).toBe("1e+23");
      expect(strconv.formatFloat(123456, "e", 2)).toBe("1.23e+5");
      expect(strconv.formatFloat(12345.6789, "e")).toBe("1.23456789e+4");
      expect(strconv.formatFloat(12345.6789, "e", 0)).toBe("1e+4");
    });

    it("panics if fmt isn't f or e", () => {
      expect(() => {
        // @ts-expect-error
        strconv.formatFloat(1.1, "h");
      }).toPanic(`formatFloat: invalid fmt "h", must be either "f" or "e"`);
    });
  });
});
