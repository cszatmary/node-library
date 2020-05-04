import { strconv } from "../../src";

function getNumErr(s: string, base: number): strconv.NumError {
  return strconv.parseInt(s, base).unwrapFailure() as strconv.NumError;
}

describe("strconv/parse.ts", () => {
  describe("parseBool()", () => {
    it("parses the string as true", () => {
      expect(strconv.parseBool("1").unwrap()).toBe(true);
      expect(strconv.parseBool("t").unwrap()).toBe(true);
      expect(strconv.parseBool("T").unwrap()).toBe(true);
      expect(strconv.parseBool("true").unwrap()).toBe(true);
      expect(strconv.parseBool("TRUE").unwrap()).toBe(true);
      expect(strconv.parseBool("True").unwrap()).toBe(true);
    });

    it("parses the string as false", () => {
      expect(strconv.parseBool("0").unwrap()).toBe(false);
      expect(strconv.parseBool("f").unwrap()).toBe(false);
      expect(strconv.parseBool("F").unwrap()).toBe(false);
      expect(strconv.parseBool("false").unwrap()).toBe(false);
      expect(strconv.parseBool("FALSE").unwrap()).toBe(false);
      expect(strconv.parseBool("False").unwrap()).toBe(false);
    });

    it("returns a NumError if the string is not a valid bool", () => {
      const err = strconv.parseBool("abc").unwrapFailure() as strconv.NumError;
      expect(strconv.isNumError(err)).toBe(true);
      expect(err.func).toBe("parseBool");
      expect(err.num).toBe("abc");
      expect(err.cause()).toBe(strconv.errSyntax);
    });
  });

  describe("parseInt()", () => {
    it("parses the int using the fast method", () => {
      expect(strconv.parseInt("0").unwrap()).toBe(0);
      expect(strconv.parseInt("-0").unwrap()).toBe(-0);
      expect(strconv.parseInt("1").unwrap()).toBe(1);
      expect(strconv.parseInt("-1").unwrap()).toBe(-1);
      expect(strconv.parseInt("12345").unwrap()).toBe(12345);
      expect(strconv.parseInt("-12345").unwrap()).toBe(-12345);
      expect(strconv.parseInt("012345").unwrap()).toBe(12345);
      expect(strconv.parseInt("-012345").unwrap()).toBe(-12345);
    });

    it("infers the base when it is 0", () => {
      expect(strconv.parseInt("0", 0).unwrap()).toBe(0);
      expect(strconv.parseInt("-0", 0).unwrap()).toBe(-0);
      expect(strconv.parseInt("1", 0).unwrap()).toBe(1);
      expect(strconv.parseInt("-1", 0).unwrap()).toBe(-1);
      expect(strconv.parseInt("12345", 0).unwrap()).toBe(12345);
      expect(strconv.parseInt("-12345", 0).unwrap()).toBe(-12345);
      expect(strconv.parseInt("012345", 0).unwrap()).toBe(0o12345);
      expect(strconv.parseInt("-012345", 0).unwrap()).toBe(-0o12345);
      expect(strconv.parseInt("0x12345", 0).unwrap()).toBe(0x12345);
      expect(strconv.parseInt("-0X12345", 0).unwrap()).toBe(-0x12345);
      expect(strconv.parseInt("98765432100", 0).unwrap()).toBe(98765432100);
      expect(strconv.parseInt("-98765432100", 0).unwrap()).toBe(-98765432100);
      expect(strconv.parseInt("922337203685477", 0).unwrap()).toBe(
        922337203685477,
      );
      expect(strconv.parseInt("-922337203685477", 0).unwrap()).toBe(
        -922337203685477,
      );
      expect(strconv.parseInt("0b101", 0).unwrap()).toBe(5);
      expect(strconv.parseInt("0B101", 0).unwrap()).toBe(5);
      expect(strconv.parseInt("0o377", 0).unwrap()).toBe(255);
      expect(strconv.parseInt("0O377", 0).unwrap()).toBe(255);
    });

    it("parses the int with base 2", () => {
      expect(strconv.parseInt("0", 2).unwrap()).toBe(0);
      expect(strconv.parseInt("-1", 2).unwrap()).toBe(-1);
      expect(strconv.parseInt("1010", 2).unwrap()).toBe(10);
      expect(strconv.parseInt("1000000000000000", 2).unwrap()).toBe(
        0b1000000000000000,
      );
    });

    it("parses the int with base 8", () => {
      expect(strconv.parseInt("0", 8).unwrap()).toBe(0);
      expect(strconv.parseInt("-10", 8).unwrap()).toBe(-8);
      expect(strconv.parseInt("57635436545", 8).unwrap()).toBe(0o57635436545);
      expect(strconv.parseInt("100000000", 8).unwrap()).toBe(0o100000000);
    });

    it("parses the int with base 16", () => {
      expect(strconv.parseInt("0", 16).unwrap()).toBe(0);
      expect(strconv.parseInt("10", 16).unwrap()).toBe(16);
      expect(strconv.parseInt("-12345abcdef", 16).unwrap()).toBe(
        -0x12345abcdef,
      );
      expect(strconv.parseInt("ab20ef", 16).unwrap()).toBe(0xab20ef);
    });

    it("parses the int with the given base", () => {
      expect(strconv.parseInt("25", 10).unwrap()).toBe(25);
      expect(strconv.parseInt("g", 17).unwrap()).toBe(16);
    });

    it("parses the int with underscores", () => {
      expect(strconv.parseInt("0x_1_2_3_4_5", 0).unwrap()).toBe(0x12345);
      expect(strconv.parseInt("-0x_1_2_3_4_5", 0).unwrap()).toBe(-0x12345);
      expect(strconv.parseInt("0_1_2_3_4_5", 0).unwrap()).toBe(0o12345);
      expect(strconv.parseInt("-0_1_2_3_4_5", 0).unwrap()).toBe(-0o12345);
      expect(strconv.parseInt("0o1_2_3_4_5", 0).unwrap()).toBe(0o12345);
      expect(strconv.parseInt("-0o1_2_3_4_5", 0).unwrap()).toBe(-0o12345);
      expect(strconv.parseInt("1_2_3_4_5", 0).unwrap()).toBe(12345);
      expect(strconv.parseInt("-1_2_3_4_5", 0).unwrap()).toBe(-12345);
      expect(strconv.parseInt("0b_1_0_1", 0).unwrap()).toBe(5);
      expect(strconv.parseInt("-0b_1_0_1", 0).unwrap()).toBe(-5);
    });

    it("returns a range error if the number is to large", () => {
      expect(getNumErr("9223372036854775809", 0).err).toBe(strconv.errRange);
      expect(getNumErr("-9223372036854775809", 0).err).toBe(strconv.errRange);
      expect(getNumErr("18446744073709551616", 0).err).toBe(strconv.errRange);
      expect(getNumErr("18446744073709551620", 0).err).toBe(strconv.errRange);
      expect(getNumErr("0x10000000000000000", 0).err).toBe(strconv.errRange);
      expect(getNumErr("02000000000000000000000", 0).err).toBe(
        strconv.errRange,
      );
      expect(
        getNumErr(
          "1000000000000000000000000000000000000000000000000000000000000000",
          0,
        ).err,
      ).toBe(strconv.errRange);
      expect(
        getNumErr(
          "1000000000000000000000000000000000000000000000000000000000000001",
          0,
        ).err,
      ).toBe(strconv.errRange);
    });

    it("returns a synatx error if the string is not a valid number", () => {
      expect(getNumErr("", 0).err).toBe(strconv.errSyntax);
      expect(getNumErr("12345x", 0).err).toBe(strconv.errSyntax);
      expect(getNumErr("-12345x", 0).err).toBe(strconv.errSyntax);
      expect(getNumErr("0x", 0).err).toBe(strconv.errSyntax);
      expect(getNumErr("0X", 0).err).toBe(strconv.errSyntax);
      expect(getNumErr("0xabcdefg123", 0).err).toBe(strconv.errSyntax);
      expect(getNumErr("123456789abc", 0).err).toBe(strconv.errSyntax);
      expect(getNumErr("0b", 0).err).toBe(strconv.errSyntax);
      expect(getNumErr("0B", 0).err).toBe(strconv.errSyntax);
      expect(getNumErr("0o", 0).err).toBe(strconv.errSyntax);
      expect(getNumErr("0O", 0).err).toBe(strconv.errSyntax);
      expect(getNumErr("-_0x12345", 0).err).toBe(strconv.errSyntax);
      expect(getNumErr("_-0x12345", 0).err).toBe(strconv.errSyntax);
      expect(getNumErr("_0x12345", 0).err).toBe(strconv.errSyntax);
      expect(getNumErr("0x__12345", 0).err).toBe(strconv.errSyntax);
      expect(getNumErr("0x1__2345", 0).err).toBe(strconv.errSyntax);
      expect(getNumErr("0x1234__5", 0).err).toBe(strconv.errSyntax);
      expect(getNumErr("0x12345_", 0).err).toBe(strconv.errSyntax);
      expect(getNumErr("1__2345", 0).err).toBe(strconv.errSyntax);
      expect(getNumErr("1234__5", 0).err).toBe(strconv.errSyntax);
      expect(getNumErr("12345_", 0).err).toBe(strconv.errSyntax);
      expect(getNumErr("1_2_3", 10).err).toBe(strconv.errSyntax);
      expect(getNumErr("_123", 10).err).toBe(strconv.errSyntax);
      expect(getNumErr("1__23", 10).err).toBe(strconv.errSyntax);
      expect(getNumErr("123_", 10).err).toBe(strconv.errSyntax);
      expect(getNumErr("1_2_3", 16).err).toBe(strconv.errSyntax);
      expect(getNumErr("_123", 16).err).toBe(strconv.errSyntax);
      expect(getNumErr("1__23", 16).err).toBe(strconv.errSyntax);
      expect(getNumErr("123_", 16).err).toBe(strconv.errSyntax);
      expect(getNumErr("1_2_3", 8).err).toBe(strconv.errSyntax);
      expect(getNumErr("_123", 8).err).toBe(strconv.errSyntax);
      expect(getNumErr("1__23", 8).err).toBe(strconv.errSyntax);
      expect(getNumErr("123_", 8).err).toBe(strconv.errSyntax);
      expect(getNumErr("1_2_3", 2).err).toBe(strconv.errSyntax);
      expect(getNumErr("_123", 2).err).toBe(strconv.errSyntax);
      expect(getNumErr("1__23", 2).err).toBe(strconv.errSyntax);
      expect(getNumErr("123_", 2).err).toBe(strconv.errSyntax);
    });

    it("returns an error if an invalid base is given", () => {
      const err = getNumErr("123", 40);
      expect(err.error()).toBe(
        `strconv.parseInt: parsing "123": invalid base 40`,
      );
      expect(err.detailedError()).toBe(
        `strconv.parseInt: parsing "123": invalid base 40`,
      );
    });
  });

  describe("parseFloat()", () => {
    it("parses the string as a float", () => {
      expect(strconv.parseFloat("1.11").unwrap()).toBe(1.11);
      expect(strconv.parseFloat("+1.11").unwrap()).toBe(1.11);
      expect(strconv.parseFloat("-1.11").unwrap()).toBe(-1.11);
    });

    it("returns a NumError if the string is not a valid float", () => {
      const err = strconv
        .parseFloat("1.111abc")
        .unwrapFailure() as strconv.NumError;
      expect(strconv.isNumError(err)).toBe(true);
      expect(err.func).toBe("parseFloat");
      expect(err.num).toBe("1.111abc");
      expect(err.cause()).toBe(strconv.errSyntax);

      const err2 = strconv.parseFloat("").unwrapFailure() as strconv.NumError;
      expect(strconv.isNumError(err2)).toBe(true);
      expect(err2.func).toBe("parseFloat");
      expect(err2.num).toBe("");
      expect(err2.cause()).toBe(strconv.errSyntax);
    });

    it("parses the string as NaN", () => {
      expect(strconv.parseFloat("NaN").unwrap()).toBeNaN();
      expect(strconv.parseFloat("nan").unwrap()).toBeNaN();
      expect(strconv.parseFloat("NAN").unwrap()).toBeNaN();
    });

    it("parses the string as infinity", () => {
      expect(strconv.parseFloat("infinity").unwrap()).toBe(Infinity);
      expect(strconv.parseFloat("+infinity").unwrap()).toBe(Infinity);
      expect(strconv.parseFloat("Infinity").unwrap()).toBe(Infinity);
      expect(strconv.parseFloat("INFINITY").unwrap()).toBe(Infinity);
    });

    it("parses the string as negative infinity", () => {
      expect(strconv.parseFloat("-infinity").unwrap()).toBe(-Infinity);
      expect(strconv.parseFloat("-Infinity").unwrap()).toBe(-Infinity);
      expect(strconv.parseFloat("-INFINITY").unwrap()).toBe(-Infinity);
    });
  });
});
