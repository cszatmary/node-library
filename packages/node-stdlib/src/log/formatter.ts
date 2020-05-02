// Copyright (c) 2020 Christopher Szatmary <cs@christopherszatmary.com>
// All rights reserved. MIT License.

// This code has been ported largely from the Go library logrus
// Copyright (c) 2014 Simon Eskildsen
// https://github.com/sirupsen/logrus/blob/master/LICENSE

import type { WriteStream } from "tty";
import { inspect } from "util";
import { blue, red, white, yellow } from "../colors/mod";
import { DynamicBuffer, Result } from "../core/mod";
import { fromJSError } from "../errors/mod";
import { Fields, Log, Level, levelString, allLevels } from "./log";

/**
 * The key names for the default fields.
 */
export enum FieldKey {
  msg = "msg",
  level = "level",
  time = "time",
}

/**
 * Represents a type that can format logs.
 */
export interface Formatter {
  format(log: Log): Result<Buffer, error>;
}

function resolveKey(key: string, f: Map<string, string>): string {
  return f.get(key) ?? key;
}

// This prevents silently overwriting default fields.
function prefixFieldClashes(data: Fields, fieldMap: Map<string, string>): void {
  const msgKey = resolveKey(FieldKey.msg, fieldMap);
  const msg = data[msgKey];
  if (msg !== undefined) {
    data[`fields.${msgKey}`] = msg;
    delete data[msgKey];
  }

  const levelKey = resolveKey(FieldKey.level, fieldMap);
  const level = data[levelKey];
  if (level !== undefined) {
    data[`fields.${levelKey}`] = level;
    delete data[levelKey];
  }

  const timeKey = resolveKey(FieldKey.time, fieldMap);
  const time = data[timeKey];
  if (time !== undefined) {
    data[`fields.${timeKey}`] = time;
    delete data[timeKey];
  }
}

/**
 * A `Formatter` that formats logs as `JSON`.
 */
export class JSONFormatter implements Formatter {
  disableTimestamp: boolean;
  prettyPrint: boolean;
  /**
   * Allows for customizing the names of keys for default fields.
   */
  fieldMap: Map<string, string>;

  constructor(opts?: {
    disableTimestamp?: boolean;
    prettyPrint?: boolean;
    fieldMap?: Map<string, string>;
  }) {
    this.disableTimestamp = opts?.disableTimestamp ?? false;
    this.prettyPrint = opts?.prettyPrint ?? false;
    this.fieldMap = opts?.fieldMap ?? new Map();
  }

  format(log: Log): Result<Buffer, error> {
    const data = { ...log.data };
    prefixFieldClashes(data, this.fieldMap);

    if (!this.disableTimestamp) {
      const timeKey = resolveKey(FieldKey.time, this.fieldMap);
      data[timeKey] = log.date.toISOString();
    }

    const msgKey = resolveKey(FieldKey.msg, this.fieldMap);
    data[msgKey] = log.msg;
    const levelKey = resolveKey(FieldKey.level, this.fieldMap);
    data[levelKey] = levelString(log.level);

    const indent = this.prettyPrint ? 2 : undefined;
    return Result.of(() => JSON.stringify(data, null, indent))
      .map((json) => Buffer.from(json))
      .mapFailure((err) => fromJSError(err));
  }
}

const baseTimestamp = new Date();

/**
 * A `Formatter` that formats logs as text.
 */
export class TextFormatter implements Formatter {
  #isTerminal = false;
  #initCalled = false;
  #levelTextMaxLength = 0;
  forceColors: boolean;
  disableColors: boolean;
  forceQuote: boolean;
  disableQuote: boolean;
  disableTimestamp: boolean;
  fullTimestamp: boolean;
  disableSorting: boolean;
  sortFn?: (a: string, b: string) => number;
  disableLevelTruncation: boolean;
  padLevelText: boolean;
  quoteEmptyFields: boolean;
  /**
   * Allows for customizing the names of keys for default fields.
   */
  fieldMap: Map<string, string>;

  constructor(opts?: {
    forceColors?: boolean;
    disableColors?: boolean;
    forceQuote?: boolean;
    disableQuote?: boolean;
    disableTimestamp?: boolean;
    fullTimestamp?: boolean;
    disableSorting?: boolean;
    sortFn?: (a: string, b: string) => number;
    disableLevelTruncation?: boolean;
    padLevelText?: boolean;
    quoteEmptyFields?: boolean;
    fieldMap?: Map<string, string>;
  }) {
    this.forceColors = opts?.forceColors ?? false;
    this.disableColors = opts?.disableColors ?? false;
    this.forceQuote = opts?.forceQuote ?? false;
    this.disableQuote = opts?.disableQuote ?? false;
    this.disableTimestamp = opts?.disableTimestamp ?? false;
    this.fullTimestamp = opts?.fullTimestamp ?? false;
    this.disableSorting = opts?.disableSorting ?? false;
    this.sortFn = opts?.sortFn;
    this.disableLevelTruncation = opts?.disableLevelTruncation ?? false;
    this.padLevelText = opts?.padLevelText ?? false;
    this.quoteEmptyFields = opts?.quoteEmptyFields ?? false;
    this.fieldMap = opts?.fieldMap ?? new Map();
  }

  #init = (log: Log): void => {
    if (log.out) {
      this.#isTerminal = (log.out as WriteStream).isTTY ?? false;
    }

    for (const level of allLevels) {
      const l = levelString(level).length;
      if (l > this.#levelTextMaxLength) {
        this.#levelTextMaxLength = l;
      }
    }

    this.#initCalled = true;
  };

  #isColored = (): boolean => {
    const isColored =
      this.forceColors || (this.#isTerminal && process.platform !== "win32");
    return isColored && !this.disableColors;
  };

  #needsQuoting = (text: string): boolean => {
    if (this.forceQuote) {
      return true;
    }

    if (this.quoteEmptyFields && text.length === 0) {
      return true;
    }

    if (this.disableQuote) {
      return false;
    }

    for (let i = 0; i < text.length; i++) {
      const c = text.charCodeAt(i);
      const s = text.charAt(i);
      if (
        !(
          (c >= 48 && c <= 57) || // 0-9
          (c >= 65 && c <= 90) || // A-Z
          (c >= 97 && c <= 122) || // a-z
          s === "-" ||
          s === "." ||
          s === "_" ||
          s === "/" ||
          s === "@" ||
          s === "^" ||
          s === "+"
        )
      ) {
        return true;
      }
    }

    return false;
  };

  #appendValue = (b: DynamicBuffer, value: unknown): void => {
    const str = typeof value === "string" ? value : inspect(value);
    if (!this.#needsQuoting(str)) {
      b.writeString(str);
    } else {
      b.writeString(`"${str}"`);
    }
  };

  #appendKeyValue = (b: DynamicBuffer, key: string, value: unknown): void => {
    if (b.length > 0) {
      b.writeString(" ");
    }

    b.writeString(`${key}=`);
    this.#appendValue(b, value);
  };

  #printColored = (
    b: DynamicBuffer,
    log: Log,
    keys: string[],
    data: Fields,
  ): void => {
    let colorFn: (str: string) => string;
    switch (log.level) {
      case Level.debug:
        colorFn = white;
        break;
      case Level.warn:
        colorFn = yellow;
        break;
      case Level.error:
      case Level.fatal:
      case Level.panic:
        colorFn = red;
        break;
      default:
        colorFn = blue;
        break;
    }

    let levelText = levelString(log.level).toUpperCase();
    if (!this.disableLevelTruncation && !this.padLevelText) {
      levelText = levelText.slice(0, 4);
    }

    if (this.padLevelText) {
      const diff = this.#levelTextMaxLength - levelText.length;
      levelText = `${levelText}${" ".repeat(diff)}`;
    }

    // Remove a single newline if it already exists in the message
    // since a newline is added at the end
    log.msg = log.msg.replace(/\n$/, "");

    if (this.disableTimestamp) {
      b.writeString(`${colorFn(levelText)} ${log.msg}`);
    } else if (!this.fullTimestamp) {
      const timestamp = Math.floor(
        (log.date.getTime() - baseTimestamp.getTime()) / 1000,
      );
      b.writeString(`${colorFn(levelText)} [${timestamp}] ${log.msg}`);
    } else {
      b.writeString(
        `${colorFn(levelText)} [${log.date.toISOString()}] ${log.msg}`,
      );
    }

    for (const k of keys) {
      b.writeString(` ${colorFn(k)}=`);
      this.#appendValue(b, data[k]);
    }
  };

  format(log: Log): Result<Buffer, error> {
    const data = { ...log.data };
    prefixFieldClashes(data, this.fieldMap);

    const keys: string[] = [];
    for (const k of Object.keys(data)) {
      keys.push(k);
    }

    const fixedKeys: string[] = [];
    if (!this.disableTimestamp) {
      const timeKey = resolveKey(FieldKey.time, this.fieldMap);
      fixedKeys.push(timeKey);
    }

    const levelKey = resolveKey(FieldKey.level, this.fieldMap);
    fixedKeys.push(levelKey);

    if (log.msg !== "") {
      const msgKey = resolveKey(FieldKey.msg, this.fieldMap);
      fixedKeys.push(msgKey);
    }

    if (!this.disableSorting) {
      if (!this.sortFn) {
        keys.sort();
        fixedKeys.push(...keys);
      } else if (!this.#isColored()) {
        fixedKeys.push(...keys);
        fixedKeys.sort(this.sortFn);
      } else {
        keys.sort(this.sortFn);
      }
    } else {
      fixedKeys.push(...keys);
    }

    const b = new DynamicBuffer();

    if (!this.#initCalled) {
      this.#init(log);
    }

    if (this.#isColored()) {
      this.#printColored(b, log, keys, data);
    } else {
      for (const key of fixedKeys) {
        let value: unknown;

        if (key === resolveKey(FieldKey.time, this.fieldMap)) {
          value = log.date.toISOString();
        } else if (key === resolveKey(FieldKey.level, this.fieldMap)) {
          value = levelString(log.level);
        } else if (key === resolveKey(FieldKey.msg, this.fieldMap)) {
          value = log.msg;
        } else {
          value = data[key];
        }

        this.#appendKeyValue(b, key, value);
      }
    }

    b.writeString("\n");
    return Result.success(b.bytes());
  }
}
