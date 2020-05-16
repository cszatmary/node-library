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
    it("returns the duration as nanoseconds", () => {
      expect(time.toNanoseconds(-1000)).toBe(-1000);
      expect(time.toNanoseconds(1000)).toBe(1000);
      expect(time.toNanoseconds(-1)).toBe(-1);
      expect(time.toNanoseconds(1)).toBe(1);
    });

    it("returns the duration as microseconds", () => {
      expect(time.toMicroseconds(-1000)).toBe(-1);
      expect(time.toMicroseconds(1000)).toBe(1);
    });

    it("returns the duration as milliseconds", () => {
      expect(time.toMilliseconds(-1000000)).toBe(-1);
      expect(time.toMilliseconds(1000000)).toBe(1);
    });

    it("returns the duration as seconds", () => {
      expect(time.toSeconds(300000000)).toBe(0.3);
    });

    it("returns the duration as minutes", () => {
      expect(time.toMinutes(-60000000000)).toBe(-1);
      expect(time.toMinutes(60000000000)).toBe(1);
      expect(time.toMinutes(-1)).toBe(-1 / 60e9);
      expect(time.toMinutes(1)).toBe(1 / 60e9);
      expect(time.toMinutes(3000)).toBe(5e-8);
    });

    it("returns the duration as hours", () => {
      expect(time.toHours(-3600000000000)).toBe(-1);
      expect(time.toHours(3600000000000)).toBe(1);
      expect(time.toHours(-1)).toBe(-1 / 3600e9);
      expect(time.toHours(1)).toBe(1 / 3600e9);
      expect(time.toHours(36)).toBe(1e-11);
    });

    it("returns a string representation of the duration", () => {
      expect(time.durationString(0)).toBe("0s");
      expect(time.durationString(1 * time.nanosecond)).toBe("1ns");
      expect(time.durationString(1100 * time.nanosecond)).toBe("1.1µs");
      expect(time.durationString(-1100 * time.nanosecond)).toBe("-1.1µs");
      expect(time.durationString(2200 * time.microsecond)).toBe("2.2ms");
      expect(time.durationString(3300 * time.millisecond)).toBe("3.3s");
      expect(time.durationString(4 * time.minute + 5 * time.second)).toBe(
        "4m5s",
      );
      expect(
        time.durationString(4 * time.minute + 5001 * time.millisecond),
      ).toBe("4m5.001s");
      expect(
        time.durationString(
          5 * time.hour + 6 * time.minute + 7001 * time.millisecond,
        ),
      ).toBe("5h6m7.001s");
      expect(time.durationString(8 * time.minute + 1 * time.nanosecond)).toBe(
        "8m0.000000001s",
      );
    });
  });
});
