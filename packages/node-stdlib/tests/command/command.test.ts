import { command } from "../../src";

describe("command.ts", () => {
  describe("lookPath()", () => {
    if (/^win/i.test(process.platform)) {
      // TODO write windows tests
    } else {
      it("returns a Result with the path to the executable", () => {
        const r = command.lookPath("sh");
        expect(r.get()).toBe("/bin/sh");
      });

      it("returns a Result with an error when the executable was not found", () => {
        const r = command.lookPath("notacommandyo");
        expect(r.isFailure).toBe(true);
      });
    }
  });

  describe("lookPath()", () => {
    if (/^win/i.test(process.platform)) {
      // TODO write windows tests
    } else {
      it("returns a Result with the path to the executable", () => {
        const b = command.isCommandAvailable("sh");
        expect(b).toBe(true);
      });

      it("returns a Result with an error when the executable was not found", () => {
        const b = command.isCommandAvailable("notacommandyo");
        expect(b).toBe(false);
      });
    }
  });
});
