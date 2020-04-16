import { panic } from "../src";

describe("src/global.ts", () => {
  describe("panic()", () => {
    it("panics with the given message and a stack trace", () => {
      expect(() => {
        panic("something broke");
      }).toPanic("something broke");
    });
  });
});
