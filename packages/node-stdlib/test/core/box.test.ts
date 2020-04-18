import { core } from "../../src";

describe("core/box.ts", () => {
  it("boxes the value", () => {
    const box1 = new core.Box(10);
    const box2 = box1;
    box2.box(20);

    expect(box1.unbox()).toBe(20);
    expect(box2.unbox()).toBe(20);
  });
});
