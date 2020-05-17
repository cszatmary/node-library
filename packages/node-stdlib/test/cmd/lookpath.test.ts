import { cmd } from "../../src";

describe("cmd.ts", () => {
  describe("lookPath()", () => {
    if (/^win/i.test(process.platform)) {
      // TODO write windows tests
    } else {
      it("returns a Result with the path to the executable", () => {
        const r = cmd.lookPath("sh");
        expect(r.success()).toBe("/bin/sh");
      });

      it("returns a Result with an error when the executable was not found", () => {
        const r = cmd.lookPath("notacommandyo");
        const err = r.failure() as cmd.LookUpError;

        expect(err).toBeInstanceOf(cmd.LookUpError);
        expect(err.fileName).toBe("notacommandyo");
        expect(err.err).toBe(cmd.errNotFound);
        expect(err.error()).toBe("LookUpError: notacommandyo: executable file not found in PATH");
        expect(err.detailedError()).toBe(
          "LookUpError: notacommandyo: executable file not found in PATH",
        );
        expect(err.cause()).toBe(cmd.errNotFound);
      });
    }
  });

  describe("isCommandAvailable()", () => {
    if (/^win/i.test(process.platform)) {
      // TODO write windows tests
    } else {
      it("returns a Result with the path to the executable", () => {
        const b = cmd.isCommandAvailable("sh");
        expect(b).toBe(true);
      });

      it("returns a Result with an error when the executable was not found", () => {
        const b = cmd.isCommandAvailable("notacommandyo");
        expect(b).toBe(false);
      });
    }
  });
});
