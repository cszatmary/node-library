import { inspect } from "util";
import { Box } from "../../src";

describe("core/box.ts", () => {
  it("boxes the value", () => {
    const box1 = new Box(10);
    const box2 = box1;
    box2.box(20);

    expect(box1.unbox()).toBe(20);
    expect(box2.unbox()).toBe(20);
  });

  describe("inspect", () => {
    it("returns just the type when depth is zero", () => {
      const box = new Box(10);
      const s = inspect(box, { depth: -1 });
      expect(s).toBe("Box {}");
    });

    it("returns a string representation of the box", () => {
      const box = new Box(10);
      const s = inspect(box);
      expect(s).toBe("Box { 10 }");
    });
  });
});
