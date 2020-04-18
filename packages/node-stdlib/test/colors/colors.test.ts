import { colors } from "../../src";

describe("colors/colors.ts", () => {
  describe("setColorEnabled()", () => {
    it("toggles colors being enabled", () => {
      expect(colors.isColorEnabled()).toBe(true);
      colors.setColorEnabled(false);
      expect(colors.isColorEnabled()).toBe(false);
      colors.setColorEnabled(true);
      expect(colors.isColorEnabled()).toBe(true);
    });
  });
});
