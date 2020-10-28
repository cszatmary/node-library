// Copyright (c) 2020 Christopher Szatmary <cs@christopherszatmary.com>
// All rights reserved. MIT License.

// This code has been ported almost directly from Go's src/bytes/buffer.go
// Copyright 2009 The Go Authors. All rights reserved. BSD license.
// https://github.com/golang/go/blob/master/LICENSE

import { inspect } from "util";
import { panic, symbols } from "../global";
import { Result } from "../core/mod";
import { errorString } from "../errors/mod";
import { copy } from "./bytes";

// Minimum capacity for a new DynamicBuffer
const minSize = 64;
// Node limit for the size of ArrayBuffers
const maxSize = 2 ** 31 - 1;

export const eof = errorString("EOF");

function isByte(c: number): boolean {
  return Number.isInteger(c) && c >= 0 && c < 256;
}

/**
 * A DynamicBuffer is a variable-sized buffer of bytes.
 * It will automatically grow as needed.
 */
export class DynamicBuffer implements Iterable<number> {
  #buf: Buffer; // contents are the bytes #buf[#off : #buf.byteLength]
  #off = 0; // read at #buf[#off], write at #buf[#buf.byteLength]

  constructor();
  constructor(buf: ArrayBuffer);
  constructor(buf: Buffer);
  constructor(s: string, encoding?: BufferEncoding);
  constructor(src?: ArrayBuffer | Buffer | string, encoding?: BufferEncoding) {
    if (src === undefined) {
      this.#buf = Buffer.from(new ArrayBuffer(minSize), 0, 0);
      return;
    }

    if (src instanceof ArrayBuffer) {
      this.#buf = Buffer.from(src);
      return;
    }

    // We need to make sure it doesn't allocate a buffer from the shared pool
    // Otherwise when we grow the buffer we could overwrite bytes in the shared
    // pool that belongs to other buffers
    // Future thought: consider using Buffer.allocUnsafeSlow() if speed is
    // a concern. This works fine for now though.

    if (typeof src === "string") {
      const ab = new ArrayBuffer(Buffer.byteLength(src, encoding));
      this.#buf = Buffer.from(ab);
      this.#buf.write(src, encoding);
      return;
    }

    this.#buf = Buffer.from(new ArrayBuffer(src.byteLength));
    copy(this.#buf, src);
  }

  // Functions like the slice operator in go, i.e. #buf[low:high]
  #slice = (low: number, high: number): Buffer => {
    // Want to panic instead of node throwing some other type of error
    if (high > this.capacity) {
      panic(`out of index in buffer: ${high}`);
    }

    return Buffer.from(this.#buf.buffer, low, high);
  };

  /**
   * For the fast-case where the internal buffer only needs to be resliced,
   * i.e. no reallocation is needed.
   * Returns the index where bytes should be written or -1 if the buffer
   * couldn't be resliced.
   */
  #tryGrowByReslice = (n: number): number => {
    const l = this.#buf.byteLength;
    if (n <= this.capacity - l) {
      this.#buf = this.#slice(0, l + n);
      return l;
    }

    return -1;
  };

  /**
   * Grows the buffer to guarantee space for `n` more bytes.
   * It returns the index where bytes should be written.
   * If the buffer can't grow it will panic.
   */
  #grow = (n: number): number => {
    const m = this.length;

    // If buffer is empty, reset to recover space from read portion.
    if (m === 0 && this.#off !== 0) {
      this.reset();
    }

    // Try to grow by means of a reslice.
    const i = this.#tryGrowByReslice(n);
    if (i >= 0) {
      return i;
    }

    const c = this.capacity;
    if (n <= Math.floor(c / 2) - m) {
      // We can slide things down instead of allocating a new
      // slice. We only need m+n <= c to slide, but
      // we instead let capacity get twice as large so we
      // don't spend all our time copying.
      copy(this.#buf, this.#buf.subarray(this.#off));
    } else if (c > maxSize - c - n) {
      panic("DynamicBuffer: too large");
    } else {
      // Not enough space anywhere, we need to allocate.
      const buf = Buffer.alloc(2 * c + n);
      copy(buf, this.#buf.subarray(this.#off));
      this.#buf = buf;
    }

    this.#off = 0;
    this.#buf = this.#slice(0, m + n);
    return m;
  };

  /**
   * #readSlice is like readBytes but returns a reference to internal buffer data.
   */
  #readSlice = (delim: number): [Buffer, error | undefined] => {
    const i = this.#buf.indexOf(delim, this.#off);
    let end = this.#off + i + 1;
    let err: error | undefined;
    if (i < 0) {
      end = this.#buf.byteLength;
      err = eof;
    }

    const line = this.#buf.subarray(this.#off, end);
    this.#off = end;
    return [line, err];
  };

  /**
   * Returns whether or not the unread portion of the buffer is empty.
   */
  get isEmpty(): boolean {
    return this.#buf.byteLength <= this.#off;
  }

  /**
   * Returns the number of bytes in the unread portion of the buffer.
   */
  get length(): number {
    return this.#buf.byteLength - this.#off;
  }

  /**
   * Returns the capacity of the buffer, that is,
   * the total space allocated for the buffer's data.
   */
  get capacity(): number {
    return this.#buf.buffer.byteLength;
  }

  /**
   * Returns a `Buffer` holding the unread portion of the buffer.
   * The returned Buffer shares the underlying memory of the DynamicBuffer instance.
   */
  bytes(): Buffer {
    return this.#buf.subarray(this.#off);
  }

  /**
   * Returns the contents of the unread portion of the buffer as a string.
   */
  toString(encoding?: BufferEncoding): string {
    return this.#buf.toString(encoding, this.#off);
  }

  /**
   * Discards all but the first n unread bytes from the buffer
   * but continues to use the same allocated storage.
   * It panics if n is negative or greater than the length of the buffer.
   */
  truncate(n: number): void {
    if (n === 0) {
      this.reset();
      return;
    }

    if (n < 0 || n > this.length) {
      panic("DynamicBuffer: truncation out of range");
    }

    this.#buf = this.#slice(0, this.#off + n);
  }

  /**
   * Resets the buffer to be empty, but it retains the
   * underlying storage for use by future writes.
   * Reset is the same as truncate(0).
   */
  reset(): void {
    this.#buf = this.#slice(0, 0);
    this.#off = 0;
  }

  /**
   * Grows the buffer's capacity, if necessary, to guarantee space for
   * another `n` bytes. After `grow(n)`, at least `n` bytes can be written to the
   * buffer without another allocation.
   * If `n` is negative or the buffer can't grow, it will panic.
   */
  grow(n: number): void {
    if (n < 0) {
      panic("DynamicBuffer.grow: negative count");
    }

    const m = this.#grow(n);
    this.#buf = this.#slice(0, m);
  }

  /**
   * Appends the contents of `p` to the buffer, growing the buffer as needed.
   * If the buffer becomes too large, write will panic.
   * @returns The number of bytes written, i.e. the length of `p`.
   */
  write(p: Uint8Array): number {
    const m = this.#grow(p.byteLength);
    return copy(this.#buf.subarray(m), p);
  }

  /**
   *  Appends the contents of `s` to the buffer, growing the buffer as needed.
   * If the buffer becomes too large, writeString will panic..
   * @param encoding An optional encoding for the `s`.
   * @returns The number of bytes written, i.e. the byte length of `s`.
   */
  writeString(s: string, encoding?: BufferEncoding): number {
    const l = Buffer.byteLength(s, encoding);
    const m = this.#grow(l);
    return this.#buf.write(s, m, encoding);
  }

  /**
   * Appends the byte `c` to the buffer, growing the buffer as needed.
   * If `c` is not a valid byte, or if the buffer becomes too large,
   * writeByte will panic.
   */
  writeByte(c: number): void {
    if (!isByte(c)) {
      panic("DynamicBuffer.writeByte: c is not a valid byte");
    }

    const m = this.#grow(1);
    this.#buf.writeUInt8(c, m);
  }

  /**
   * Reads the next `p.byteLength` bytes from the buffer
   * or until the buffer is drained.
   * @param p A buffer to read the data into.
   * @returns A `Result` with the number of bytes read
   * or an eof error if the buffer has no data.
   */
  read(p: Uint8Array): Result<number, error> {
    if (this.isEmpty) {
      // Buffer is empty, reset to recover space.
      this.reset();
      if (p.byteLength === 0) {
        return Result.success(0);
      }

      return Result.failure(eof);
    }

    const n = copy(p, this.#buf.subarray(this.#off));
    this.#off += n;
    return Result.success(n);
  }

  /**
   * Returns a buffer containing the next `n` bytes from the buffer,
   * advancing the buffer as if the bytes had been returned by read.
   * If there are fewer than `n` bytes in the buffer, the entire buffer is returned.
   * The returned buffer is only valid until the next call to a read or write method.
   */
  next(n: number): Buffer {
    const l = this.length;
    const m = n > l ? l : n;
    const data = this.#buf.subarray(this.#off, this.#off + m);
    this.#off += m;
    return data;
  }

  /**
   * Reads the next byte from the buffer.
   * @returns A `Result` with the read byte
   * or an eof error if the buffer has no data.
   */
  readByte(): Result<number, error> {
    if (this.isEmpty) {
      // Buffer is empty, reset to recover space.
      this.reset();
      return Result.failure(eof);
    }

    const c = this.#buf.readUInt8(this.#off);
    this.#off++;
    return Result.success(c);
  }

  /**
   * Reads until the first occurrence of delim in the input,
   * returning a buffer containing the data up to and including the delimiter.
   * If an error is encountered before finding a delimiter,
   * the data read before the error and the error itself (often eof) are returned.
   */
  readBytes(delim: number): [Buffer, error | undefined] {
    if (!isByte(delim)) {
      panic("DynamicBuffer.readBytes: delim is not a valid byte");
    }

    const [slice, err] = this.#readSlice(delim);
    // return a copy of slice. #buf may be overwritten by later calls.
    const line = Buffer.from(slice);
    return [line, err];
  }

  /**
   * Reads until the first occurrence of delim in the input,
   * returning a string containing the data up to and including the delimiter.
   * If an error is encountered before finding a delimiter,
   * the data read before the error and the error itself (often eof) are returned.
   * @param encoding An optional encoding to use for the string.
   */
  readString(delim: number, encoding?: BufferEncoding): [string, error | undefined] {
    if (!isByte(delim)) {
      panic("DynamicBuffer.readBytes: delim is not a valid byte");
    }

    const [slice, err] = this.#readSlice(delim);
    return [slice.toString(encoding), err];
  }

  /**
   * Creates an iterator to iterate over the DynamicBuffer
   * using the `for of` syntax.
   * Iterating over the DynamicBuffer will cause the bytes to be read
   * just like if a read method was called.
   */
  *[Symbol.iterator](): Iterator<number> {
    while (this.#off < this.#buf.byteLength) {
      yield this.#buf[this.#off];
      this.#off++;
    }
  }

  /**
   * Returns a new DynamicBuffer with the unread bytes copied.
   */
  [symbols.copy](): this {
    const buf = new DynamicBuffer(new ArrayBuffer(this.length));
    for (let i = 0; i < this.length; i++) {
      buf.#buf[i] = this.#buf[i + this.#off];
    }
    return buf as this;
  }

  /**
   * Custom inspect implementation for use with node's `util.inspect`.
   */
  [inspect.custom](depth?: number | null): string {
    if (depth == null || depth < 0) {
      return "DynamicBuffer {}";
    }

    // Limit to a max of 50 bytes to display
    const max = 50;
    const actualMax = Math.min(max, this.length);
    const remaining = this.length - max;

    let bytes = this.#buf
      .toString("hex", this.#off, actualMax + this.#off)
      .replace(/(.{2})/g, "$1 ")
      .trim();

    if (remaining > 0) {
      bytes += ` ... ${remaining} more byte${remaining > 1 ? "s" : ""}`;
    }

    return `DynamicBuffer { ${bytes} }`;
  }
}
