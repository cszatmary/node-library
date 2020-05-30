import { errors, strconv } from "../../src";

describe("strconv/parse.ts", () => {
  describe("parseBool()", () => {
    test.each([
      ["1", true],
      ["t", true],
      ["T", true],
      ["true", true],
      ["TRUE", true],
      ["True", true],
      ["0", false],
      ["f", false],
      ["F", false],
      ["false", false],
      ["FALSE", false],
      ["False", false],
    ])("parses the string %s as %s", (str, expected) => {
      expect(strconv.parseBool(str).unwrap()).toBe(expected);
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
    test.each([
      ["0", 0],
      ["-0", -0],
      ["1", 1],
      ["-1", -1],
      ["12345", 12345],
      ["-12345", -12345],
      ["012345", 12345],
      ["-012345", -12345],
    ])("parses the int %s using the fast method", (str, expected) => {
      expect(strconv.parseInt(str).unwrap()).toBe(expected);
    });

    test.each([
      ["0", 0],
      ["-0", -0],
      ["1", 1],
      ["-1", -1],
      ["12345", 12345],
      ["-12345", -12345],
      ["012345", 0o12345],
      ["-012345", -0o12345],
      ["0x12345", 0x12345],
      ["-0X12345", -0x12345],
      ["98765432100", 98765432100],
      ["-98765432100", -98765432100],
      ["922337203685477", 922337203685477],
      ["-922337203685477", -922337203685477],
      ["0b101", 5],
      ["0B101", 5],
      ["0o377", 255],
      ["0O377", 255],
    ])("infers the best when it is 0: %s", (str, expected) => {
      expect(strconv.parseInt(str, 0).unwrap()).toBe(expected);
    });

    test.each([
      ["0", 2, 0],
      ["-1", 2, -1],
      ["1010", 2, 10],
      ["1000000000000000", 2, 0b1000000000000000],
      ["0", 8, 0],
      ["-10", 8, -8],
      ["57635436545", 8, 0o57635436545],
      ["100000000", 8, 0o100000000],
      ["0", 16, 0],
      ["10", 16, 16],
      ["-12345abcdef", 16, -0x12345abcdef],
      ["ab20ef", 16, 0xab20ef],
      ["25", 10, 25],
      ["g", 17, 16],
    ])("parses the int %s with base %d", (str, base, expected) => {
      expect(strconv.parseInt(str, base).unwrap()).toBe(expected);
    });

    test.each([
      ["0x_1_2_3_4_5", 0x12345],
      ["-0x_1_2_3_4_5", -0x12345],
      ["0_1_2_3_4_5", 0o12345],
      ["-0_1_2_3_4_5", -0o12345],
      ["0o1_2_3_4_5", 0o12345],
      ["-0o1_2_3_4_5", -0o12345],
      ["1_2_3_4_5", 12345],
      ["-1_2_3_4_5", -12345],
      ["0b_1_0_1", 5],
      ["-0b_1_0_1", -5],
    ])("parses the int %s with underscores", (str, expected) => {
      expect(strconv.parseInt(str, 0).unwrap()).toBe(expected);
    });

    test.each([
      ["9223372036854775809"],
      ["-9223372036854775809"],
      ["18446744073709551616"],
      ["18446744073709551620"],
      ["0x10000000000000000"],
      ["02000000000000000000000"],
      ["1000000000000000000000000000000000000000000000000000000000000000"],
      ["1000000000000000000000000000000000000000000000000000000000000001"],
    ])("returns a range error if the number is too large: %s", (str) => {
      const err = strconv.parseInt(str, 0).unwrapFailure();
      expect(errors.cause(err)).toBe(strconv.errRange);
    });

    test.each([
      ["", 0],
      ["12345x", 0],
      ["-12345x", 0],
      ["0x", 0],
      ["0X", 0],
      ["0xabcdefg123", 0],
      ["123456789abc", 0],
      ["0b", 0],
      ["0B", 0],
      ["0o", 0],
      ["0O", 0],
      ["-_0x12345", 0],
      ["_-0x12345", 0],
      ["_0x12345", 0],
      ["0x__12345", 0],
      ["0x1__2345", 0],
      ["0x1234__5", 0],
      ["0x12345_", 0],
      ["1__2345", 0],
      ["1234__5", 0],
      ["12345_", 0],
      ["1_2_3", 10],
      ["_123", 10],
      ["1__23", 10],
      ["123_", 10],
      ["1_2_3", 16],
      ["_123", 16],
      ["1__23", 16],
      ["123_", 16],
      ["1_2_3", 8],
      ["_123", 8],
      ["1__23", 8],
      ["123_", 8],
      ["1_2_3", 2],
      ["_123", 2],
      ["1__23", 2],
      ["123_", 2],
    ])("returns a syntax error if the string is not a valid number: %s, %d", (str, base) => {
      const err = strconv.parseInt(str, base).unwrapFailure();
      expect(errors.cause(err)).toBe(strconv.errSyntax);
    });

    it("returns an error if an invalid base is given", () => {
      const err = strconv.parseInt("123", 40).unwrapFailure();
      expect(err.error()).toBe(`strconv.parseInt: parsing "123": invalid base 40`);
      expect(err.detailedError()).toBe(`strconv.parseInt: parsing "123": invalid base 40`);
    });
  });

  describe("parseFloat()", () => {
    test.each([
      ["1.11", 1.11],
      ["+1.11", 1.11],
      ["-1.11", -1.11],
    ])("parses the string %s as a float", (str, expected) => {
      expect(strconv.parseFloat(str).unwrap()).toBe(expected);
    });

    test.each([["1.111abc"], [""]])(
      "returns a NumError if the string %s is not a valid float",
      (str) => {
        const err = strconv.parseFloat(str).unwrapFailure() as strconv.NumError;
        expect(strconv.isNumError(err)).toBe(true);
        expect(err.func).toBe("parseFloat");
        expect(err.num).toBe(str);
        expect(err.cause()).toBe(strconv.errSyntax);
      },
    );

    test.each([["NaN"], ["nan"], ["NAN"]])("parses the string %s as NaN", (str) => {
      expect(strconv.parseFloat(str).unwrap()).toBeNaN();
    });

    test.each([["infinity"], ["+infinity"], ["Infinity"], ["INFINITY"]])(
      "parses the string %s as infinity",
      (str) => {
        expect(strconv.parseFloat(str).unwrap()).toBe(Infinity);
      },
    );

    test.each([["-infinity"], ["-Infinity"], ["-INFINITY"]])(
      "parses the string %s as negative infinity",
      (str) => {
        expect(strconv.parseFloat(str).unwrap()).toBe(-Infinity);
      },
    );
  });
});
