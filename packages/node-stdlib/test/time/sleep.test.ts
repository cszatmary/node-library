import { time } from "../../src";

describe("time/sleep.ts", () => {
  describe("sleep()", () => {
    it("sleeps asynchronously", async () => {
      const start = new Date();
      const amount = 100;
      await time.sleep(amount * time.millisecond);
      const end = new Date();

      const epsilon = 100;
      const duration = end.getTime() - start.getTime();
      const diff = duration - amount;

      expect(diff).toBeLessThan(epsilon);
      expect(diff).toBeGreaterThan(-epsilon);
    });
  });

  describe("sleepSync()", () => {
    it("sleeps synchronously", () => {
      const start = new Date();
      const amount = 100;
      time.sleepSync(amount * time.millisecond);
      const end = new Date();

      const epsilon = 100;
      const duration = end.getTime() - start.getTime();
      const diff = duration - amount;

      expect(diff).toBeLessThan(epsilon);
      expect(diff).toBeGreaterThan(-epsilon);
    });
  });
});
