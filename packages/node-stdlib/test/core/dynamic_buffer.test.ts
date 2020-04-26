import { inspect } from "util";
import { core } from "../../src";

describe("core/dynamic_buffer.ts", () => {
  describe("constructor()", () => {
    it("creates an empty buffer", () => {
      const buf = new core.DynamicBuffer();
      expect(buf.isEmpty).toBe(true);
      expect(buf.length).toBe(0);
      expect(buf.capacity).toBe(64);
      expect(buf.bytes()).toEqual(Buffer.alloc(0));
      expect(buf.toString()).toBe("");
    });

    it("creates a DynamicBuffer from the given Buffer", () => {
      const b = Buffer.from("abc");
      const buf = new core.DynamicBuffer(b);
      expect(buf.isEmpty).toBe(false);
      expect(buf.length).toBe(3);
      expect(buf.capacity).toBe(3);
      expect(buf.bytes()).toEqual(b);
      expect(buf.toString()).toBe("abc");
    });

    it("creates a DynamicBuffer from the given string", () => {
      const buf = new core.DynamicBuffer("10ff", "hex");
      expect(buf.isEmpty).toBe(false);
      expect(buf.length).toBe(2);
      expect(buf.capacity).toBe(2);
      expect(buf.bytes()).toEqual(Buffer.from("10ff", "hex"));
      expect(buf.toString("hex")).toBe("10ff");
    });
  });

  describe("truncate()", () => {
    it("resets the buffer when n is 0", () => {
      const b = Buffer.from(new ArrayBuffer(8));
      b.write("10ffab23ef5d", "hex");
      const buf = new core.DynamicBuffer(b.buffer);
      expect(buf.length).toBe(8);
      expect(buf.capacity).toBe(8);
      buf.truncate(0);
      expect(buf.length).toBe(0);
      expect(buf.capacity).toBe(8);
    });

    it("truncates all but the first byte", () => {
      const b = Buffer.from(new ArrayBuffer(8));
      b.write("10ffab23ef5d", "hex");
      const buf = new core.DynamicBuffer(b.buffer);
      expect(buf.length).toBe(8);
      expect(buf.capacity).toBe(8);
      buf.truncate(3);
      expect(buf.length).toBe(3);
      expect(buf.toString("hex")).toBe("10ffab");
      expect(buf.capacity).toBe(8);
    });

    it("panics if n is out of range", () => {
      const b = Buffer.from(new ArrayBuffer(8));
      b.write("10ffab23ef5d", "hex");
      const buf = new core.DynamicBuffer(b.buffer);
      expect(() => {
        buf.truncate(9);
      }).toPanic("DynamicBuffer: truncation out of range");
    });
  });

  describe("reset()", () => {
    it("resets the buffer", () => {
      const b = Buffer.from(new ArrayBuffer(8));
      b.write("10ffab23ef5d", "hex");
      const buf = new core.DynamicBuffer(b.buffer);
      expect(buf.length).toBe(8);
      expect(buf.capacity).toBe(8);
      buf.reset();
      expect(buf.length).toBe(0);
      expect(buf.capacity).toBe(8);
    });
  });

  describe("grow()", () => {
    it("grows the buffer to the specified capacity", () => {
      const b = Buffer.from(new ArrayBuffer(8));
      b.write("10ffab23ef5d", "hex");
      const buf = new core.DynamicBuffer(b.buffer);
      expect(buf.length).toBe(8);
      expect(buf.capacity).toBe(8);
      buf.grow(8);
      expect(buf.length).toBe(8);
      expect(buf.capacity).toBeGreaterThanOrEqual(16);
    });

    it("panics if n is negative", () => {
      const b = Buffer.from(new ArrayBuffer(8));
      b.write("10ffab23ef5d", "hex");
      const buf = new core.DynamicBuffer(b.buffer);
      expect(() => {
        buf.grow(-1);
      }).toPanic("DynamicBuffer.grow: negative count");
    });
  });

  describe("write()/writeString()/writeByte()", () => {
    it("writes the buffer contents to the DynamicBuffer", () => {
      const buf = new core.DynamicBuffer("10ffab23ef5d", "hex");
      buf.write(Buffer.from("10ffab", "hex"));
      expect(buf.length).toBe(9);
      expect(buf.toString("hex")).toBe("10ffab23ef5d10ffab");
    });

    it("writes the string to the DynamicBuffer", () => {
      const buf = new core.DynamicBuffer("Hello");
      buf.writeString(" world!");
      expect(buf.toString()).toBe("Hello world!");
    });

    it("writes the hex string to the DynamicBuffer", () => {
      const buf = new core.DynamicBuffer("10ffab23ef5d", "hex");
      buf.writeString("10ffab", "hex");
      expect(buf.length).toBe(9);
      expect(buf.toString("hex")).toBe("10ffab23ef5d10ffab");
    });

    it("writes the byte to the DynamicBuffer", () => {
      const buf = new core.DynamicBuffer("10ffab23ef5d", "hex");
      buf.writeByte(0x10);
      expect(buf.length).toBe(7);
      expect(buf.toString("hex")).toBe("10ffab23ef5d10");
    });

    it("panics if c isn't a valid byte", () => {
      const buf = new core.DynamicBuffer("10ffab23ef5d", "hex");
      expect(() => {
        buf.writeByte(1.1);
      }).toPanic("DynamicBuffer.writeByte: c is not a valid byte");
    });
  });

  describe("read()", () => {
    it("reads bytes and puts them in the buffer", () => {
      const buf = new core.DynamicBuffer("10ffab23ef5d", "hex");
      const b = Buffer.alloc(4);
      const r = buf.read(b);
      expect(r.isSuccess());
      expect(r.success()).toBe(4);
      expect(b.toString("hex")).toBe("10ffab23");
      expect(buf.length).toBe(2);
    });

    it("reads all the bytes if the buffer is larger than the DynamicBuffer", () => {
      const buf = new core.DynamicBuffer("10ffab23ef5d", "hex");
      const b = Buffer.alloc(10);
      const r = buf.read(b);
      expect(r.isSuccess());
      expect(r.success()).toBe(6);
      expect(b.toString("hex")).toBe("10ffab23ef5d00000000");
      expect(buf.length).toBe(0);
    });

    it("returns eof if the buffer is empty", () => {
      const buf = new core.DynamicBuffer();
      const b = Buffer.alloc(10);
      const r = buf.read(b);
      expect(r.isFailure());
      expect(r.failure()).toBe(core.eof);
    });
  });

  describe("next()", () => {
    it("returns a buffer with the next n bytes", () => {
      const buf = new core.DynamicBuffer("10ffab23ef5d", "hex");
      const b = buf.next(4);
      expect(b.length).toBe(4);
      expect(b.toString("hex")).toBe("10ffab23");
      expect(buf.length).toBe(2);
    });

    it("returns all the bytes when n is greater then the buffer length", () => {
      const buf = new core.DynamicBuffer("10ffab23ef5d", "hex");
      const b = buf.next(10);
      expect(b.length).toBe(6);
      expect(b.toString("hex")).toBe("10ffab23ef5d");
      expect(buf.length).toBe(0);
    });
  });

  describe("readByte()", () => {
    it("reads the next byte", () => {
      const buf = new core.DynamicBuffer("10ffab23ef5d", "hex");
      const r = buf.readByte();
      expect(r.isSuccess());
      expect(r.success()).toBe(0x10);
      expect(buf.length).toBe(5);
    });

    it("returns eof if the buffer is empty", () => {
      const buf = new core.DynamicBuffer();
      const r = buf.readByte();
      expect(r.isFailure());
      expect(r.failure()).toBe(core.eof);
    });
  });

  describe("readBytes()", () => {
    it("reads bytes until the delim", () => {
      const buf = new core.DynamicBuffer("10ffab23ef5d", "hex");
      const [b, err] = buf.readBytes(0xab);
      expect(err).toBeUndefined();
      expect(b.toString("hex")).toBe("10ffab");
      expect(buf.length).toBe(3);
    });

    it("reads the whole buffer and returns eof if delim doesn't exist", () => {
      const buf = new core.DynamicBuffer("10ffab23ef5d", "hex");
      const [b, err] = buf.readBytes(0xcc);
      expect(err).toBe(core.eof);
      expect(b.toString("hex")).toBe("10ffab23ef5d");
      expect(buf.length).toBe(0);
    });

    it("panics if delim is not a valid byte", () => {
      const buf = new core.DynamicBuffer("10ffab23ef5d", "hex");
      expect(() => {
        buf.readBytes(1.1);
      }).toPanic("DynamicBuffer.readBytes: delim is not a valid byte");
    });
  });

  describe("readString()", () => {
    it("reads bytes until the delim as a string", () => {
      const buf = new core.DynamicBuffer("10ffab23ef5d", "hex");
      const [s, err] = buf.readString(0xab, "hex");
      expect(err).toBeUndefined();
      expect(s).toBe("10ffab");
      expect(buf.length).toBe(3);
    });

    it("panics if delim is not a valid byte", () => {
      const buf = new core.DynamicBuffer("10ffab23ef5d", "hex");
      expect(() => {
        buf.readString(1.1);
      }).toPanic("DynamicBuffer.readBytes: delim is not a valid byte");
    });
  });

  describe("@@iterator()", () => {
    it("reads the buffer by using for of", () => {
      const buf = new core.DynamicBuffer("10ffab23ef5d", "hex");
      const arr: number[] = [];
      for (const b of buf) {
        arr.push(b);
      }

      expect(arr).toEqual([0x10, 0xff, 0xab, 0x23, 0xef, 0x5d]);
      expect(buf.length).toBe(0);
    });
  });

  describe("copy()", () => {
    it("creates a copy of the DynamicBuffer", () => {
      const buf = new core.DynamicBuffer("10ffab23ef5d", "hex");
      const bufCopy = buf.copy();
      expect(buf).not.toBe(bufCopy);
      expect(buf.toString("hex")).toBe(bufCopy.toString("hex"));
    });
  });

  describe("inspect", () => {
    it("returns just the type when depth is zero", () => {
      const buf = new core.DynamicBuffer("10ffab23ef5d", "hex");
      const s = inspect(buf, { depth: -1 });
      expect(s).toBe("DynamicBuffer {}");
    });

    it("returns a string representation of the box", () => {
      const buf = new core.DynamicBuffer("10ffab23ef5d", "hex");
      const s = inspect(buf);
      expect(s).toBe("DynamicBuffer { 10 ff ab 23 ef 5d }");
    });
  });
});
