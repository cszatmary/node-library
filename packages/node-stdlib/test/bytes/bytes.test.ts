import { bytes } from "../../src";

describe("bytes/bytes.ts", () => {
  describe("copyBytes()", () => {
    it("copys src to dest", () => {
      const src = new Uint8Array([0x10, 0xff, 0xab, 0x23]);
      const dest = new Uint8Array(4);
      const n = bytes.copy(dest, src);

      expect(n).toBe(4);
      expect(dest).toEqual(new Uint8Array([0x10, 0xff, 0xab, 0x23]));
    });

    it("only copies up to the length of dest", () => {
      const src = new Uint8Array([0x10, 0xff, 0xab, 0x23, 0xef, 0x5d]);
      const dest = new Uint8Array(4);
      const n = bytes.copy(dest, src);

      expect(n).toBe(4);
      expect(dest).toEqual(new Uint8Array([0x10, 0xff, 0xab, 0x23]));
    });
  });

  describe("equal()", () => {
    it("returns false if the byte arrays have different lengths", () => {
      const a = new Uint8Array([0x10, 0xff, 0xab, 0x23]);
      const b = new Uint8Array([0x10, 0xff, 0xab, 0x23, 0xef, 0x5d]);

      expect(bytes.equal(a, b)).toBe(false);
    });

    it("returns false if the byte arrays are not equal", () => {
      const a = new Uint8Array([0x10, 0xff, 0xab, 0x23]);
      const b = new Uint8Array([0x10, 0xff, 0xab, 0x54]);

      expect(bytes.equal(a, b)).toBe(false);
    });

    it("returns true if the byte arrays are equal", () => {
      const a = new Uint8Array([0x10, 0xff, 0xab, 0x23]);
      const b = new Uint8Array([0x10, 0xff, 0xab, 0x23]);

      expect(bytes.equal(a, b)).toBe(true);
    });
  });

  describe("hasPrefix()", () => {
    it("returns true if the bytes have the given prefix", () => {
      const b = new Uint8Array([0x10, 0xff, 0xab, 0x23, 0xef, 0x5d]);
      const prefix = new Uint8Array([0x10, 0xff]);

      expect(bytes.hasPrefix(b, prefix)).toBe(true);
    });

    it("returns false if the bytes don't have the given prefix", () => {
      const b = new Uint8Array([0x10, 0xff, 0xab, 0x23, 0xef, 0x5d]);
      const prefix = new Uint8Array([0xdc, 0xff]);

      expect(bytes.hasPrefix(b, prefix)).toBe(false);
    });

    it("returns false if the prefix is longer than the bytes", () => {
      const b = new Uint8Array([0xdc]);
      const prefix = new Uint8Array([0xdc, 0xff]);

      expect(bytes.hasPrefix(b, prefix)).toBe(false);
    });
  });

  describe("hasSuffix()", () => {
    it("returns true if the bytes have the given suffix", () => {
      const b = new Uint8Array([0x10, 0xff, 0xab, 0x23, 0xef, 0x5d]);
      const suffix = new Uint8Array([0xef, 0x5d]);

      expect(bytes.hasSuffix(b, suffix)).toBe(true);
    });

    it("returns false if the bytes don't have the given suffix", () => {
      const b = new Uint8Array([0x10, 0xff, 0xab, 0x23, 0xef, 0x5d]);
      const suffix = new Uint8Array([0xef, 0xdc]);

      expect(bytes.hasSuffix(b, suffix)).toBe(false);
    });

    it("returns false if the suffix is longer than the bytes", () => {
      const b = new Uint8Array([0xdc]);
      const suffix = new Uint8Array([0xdc, 0xff]);

      expect(bytes.hasSuffix(b, suffix)).toBe(false);
    });
  });

  describe("join()", () => {
    it("returns an empty byte array if the length is 0", () => {
      const s: Uint8Array[] = [];
      const sep = new Uint8Array([0xac, 0xdb]);

      expect(bytes.join(s, sep)).toEqual(new Uint8Array());
    });

    it("returns a copy of the byte array if only one is provided", () => {
      const s: Uint8Array[] = [new Uint8Array([0x10, 0xff, 0xab])];
      const sep = new Uint8Array([0xac, 0xdb]);

      expect(bytes.join(s, sep)).toEqual(new Uint8Array([0x10, 0xff, 0xab]));
    });

    it("joins the byte arrays with the given separator", () => {
      const s: Uint8Array[] = [
        new Uint8Array([0x10, 0xff, 0xab]),
        new Uint8Array([0x23, 0xef, 0x5d]),
        new Uint8Array([0x3b, 0x1f, 0x9c]),
      ];
      const sep = new Uint8Array([0xac, 0xdb]);

      const expected = new Uint8Array([
        0x10,
        0xff,
        0xab,
        0xac,
        0xdb,
        0x23,
        0xef,
        0x5d,
        0xac,
        0xdb,
        0x3b,
        0x1f,
        0x9c,
      ]);
      expect(bytes.join(s, sep)).toEqual(expected);
    });
  });

  describe("repeat()", () => {
    it("returns an empty byte array if count is 0", () => {
      const b = new Uint8Array([0x10, 0xff, 0xab]);

      expect(bytes.repeat(b, 0)).toEqual(new Uint8Array());
    });

    it("repeats the byte sequence count times", () => {
      const b = new Uint8Array([0x10, 0xff, 0xab]);
      const expected = new Uint8Array([0x10, 0xff, 0xab, 0x10, 0xff, 0xab, 0x10, 0xff, 0xab]);

      expect(bytes.repeat(b, 3)).toEqual(expected);
    });

    it("panics if count is negative", () => {
      const b = new Uint8Array([0x10, 0xff, 0xab]);

      expect(() => {
        bytes.repeat(b, -2);
      }).toPanic("bytes: negative repeat count");
    });

    it("panics if count is not an integer", () => {
      const b = new Uint8Array([0x10, 0xff, 0xab]);

      expect(() => {
        bytes.repeat(b, 1.2);
      }).toPanic("bytes: count must be an integer");
    });
  });

  describe("trimPrefix()", () => {
    it("trims the prefix from the bytes", () => {
      const b = new Uint8Array([0x10, 0xff, 0xab, 0x23, 0xef, 0x5d]);
      const prefix = new Uint8Array([0x10, 0xff]);

      expect(bytes.trimPrefix(b, prefix)).toEqual(new Uint8Array([0xab, 0x23, 0xef, 0x5d]));
    });

    it("returns the bytes unchanged when there is no prefix", () => {
      const b = new Uint8Array([0x10, 0xff, 0xab, 0x23, 0xef, 0x5d]);
      const prefix = new Uint8Array([0xdc, 0xff]);

      const expected = new Uint8Array([0x10, 0xff, 0xab, 0x23, 0xef, 0x5d]);
      expect(bytes.trimPrefix(b, prefix)).toEqual(expected);
    });
  });

  describe("trimSuffix()", () => {
    it("trims the suffix from the bytes", () => {
      const b = new Uint8Array([0x10, 0xff, 0xab, 0x23, 0xef, 0x5d]);
      const suffix = new Uint8Array([0xef, 0x5d]);

      expect(bytes.trimSuffix(b, suffix)).toEqual(new Uint8Array([0x10, 0xff, 0xab, 0x23]));
    });

    it("returns the string unchanged when there is no suffix", () => {
      const b = new Uint8Array([0x10, 0xff, 0xab, 0x23, 0xef, 0x5d]);
      const suffix = new Uint8Array([0xef, 0xdc]);

      const expected = new Uint8Array([0x10, 0xff, 0xab, 0x23, 0xef, 0x5d]);
      expect(bytes.trimSuffix(b, suffix)).toEqual(expected);
    });
  });
});
