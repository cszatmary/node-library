import { time } from "../../src";

describe("time/duration.ts", () => {
  describe("month", () => {
    it("returns the english name of the month", () => {
      const s = time.monthString(time.Month.july);
      expect(s).toBe("July");
    });

    it("returns the month of the given date", () => {
      const d = new Date(2020, 5);
      expect(time.dateMonth(d)).toBe(time.Month.june);
    });
  });

  describe("weekday", () => {
    it("returns the english name of the weekday", () => {
      const s = time.weekdayString(time.Weekday.thursday);
      expect(s).toBe("Thursday");
    });

    it("returns the weekday of the given date", () => {
      const d = new Date(2020, 5, 4);
      expect(time.dateWeekday(d)).toBe(time.Weekday.thursday);
    });
  });

  describe("duration", () => {
    test.each([
      [-1000, -1000],
      [1000, 1000],
      [-1, -1],
      [1, 1],
    ])("returns the duration %d as nanoseconds", (d, expected) => {
      expect(time.toNanoseconds(d)).toBe(expected);
    });

    test.each([
      [-1000, -1],
      [1000, 1],
    ])("returns the duration %d as microseconds", (d, expected) => {
      expect(time.toMicroseconds(d)).toBe(expected);
    });

    test.each([
      [-1000000, -1],
      [1000000, 1],
    ])("returns the duration %d as milliseconds", (d, expected) => {
      expect(time.toMilliseconds(d)).toBe(expected);
    });

    test.each([[300000000, 0.3]])("returns the duration %d as seconds", (d, expected) => {
      expect(time.toSeconds(d)).toBe(expected);
    });

    test.each([
      [-60000000000, -1],
      [60000000000, 1],
      [-1, -1 / 60e9],
      [1, 1 / 60e9],
      [3000, 5e-8],
    ])("returns the duration %d as minutes", (d, expected) => {
      expect(time.toMinutes(d)).toBe(expected);
    });

    test.each([
      [-3600000000000, -1],
      [3600000000000, 1],
      [-1, -1 / 3600e9],
      [1, 1 / 3600e9],
      [36, 1e-11],
    ])("returns the duration %d as hours", (d, expected) => {
      expect(time.toHours(d)).toBe(expected);
    });

    test.each([
      [0, "0s"],
      [1 * time.nanosecond, "1ns"],
      [1100 * time.nanosecond, "1.1µs"],
      [-1100 * time.nanosecond, "-1.1µs"],
      [2200 * time.microsecond, "2.2ms"],
      [3300 * time.millisecond, "3.3s"],
      [4 * time.minute + 5 * time.second, "4m5s"],
      [4 * time.minute + 5001 * time.millisecond, "4m5.001s"],
      [5 * time.hour + 6 * time.minute + 7001 * time.millisecond, "5h6m7.001s"],
      [8 * time.minute + 1 * time.nanosecond, "8m0.000000001s"],
    ])("returns a string representation of the duration %d, %s", (d, expected) => {
      expect(time.durationString(d)).toBe(expected);
    });
  });
});
