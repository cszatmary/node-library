import { command } from "../../src";

describe("command.ts", () => {
  describe("lookPath()", () => {
    if (/^win/i.test(process.platform)) {
      // TODO write windows tests
    } else {
      it("returns a Result with the path to the executable", () => {
        const r = command.lookPath("sh");
        expect(r.success()).toBe("/bin/sh");
      });

      it("returns a Result with an error when the executable was not found", () => {
        const r = command.lookPath("notacommandyo");
        const err = r.failure() as command.LookUpError;

        expect(err).toBeInstanceOf(command.LookUpError);
        expect(err.fileName).toBe("notacommandyo");
        expect(err.err).toBe(command.errNotFound);
        expect(err.error()).toBe(
          "LookUpError: notacommandyo: executable file not found in PATH",
        );
        expect(err.detailedError()).toBe(
          "LookUpError: notacommandyo: executable file not found in PATH",
        );
        expect(err.cause()).toBe(command.errNotFound);
      });
    }
  });

  describe("isCommandAvailable()", () => {
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
