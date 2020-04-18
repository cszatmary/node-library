import { errors, fatal } from "../../src";

describe("src/exit.ts tests", () => {
  let stderrData: string;
  let exitCode: number | undefined;
  let spyError: jest.SpyInstance;
  let spyExit: jest.SpyInstance;

  beforeEach(() => {
    stderrData = "";
    exitCode = 0;
    spyError = jest
      .spyOn(console, "error")
      .mockImplementation((inputs: string) => {
        stderrData += inputs;
        stderrData += "\n";
      });
    spyExit = jest.spyOn(process, "exit").mockImplementation(((code) => {
      exitCode = code;
    }) as (code?: number) => never);
  });

  afterEach(() => {
    spyError.mockRestore();
    spyExit.mockRestore();
  });

  describe("exitErr", () => {
    it("should log the error then exit with status code 1", () => {
      fatal.showErrDetail(false);
      fatal.exitErr(errors.newError("Shoot"), "Error message");
      expect(stderrData).toBe("Error message\nError: Shoot\n");
      expect(exitCode).toBe(1);
    });

    it("should log the error details then exit with status code 1", () => {
      fatal.showErrDetail(true);
      fatal.exitErr(errors.newError("Shoot"), "Error message");
      // Check that the error is printed with a stack trace
      expect(stderrData).toMatch(
        /^Error message\nError: Shoot\n\s+at\s(?:.+?)\s\(.*packages\/node-stdlib\/test\/fatal\/fatal\.test\.ts/m,
      );
      expect(exitCode).toBe(1);
    });
  });

  describe("exit", () => {
    it("should print the message to stderr then exit", () => {
      fatal.exit("Something went wrong");
      expect(stderrData).toBe("Something went wrong\n");
      expect(exitCode).toBe(1);
    });
  });
});
