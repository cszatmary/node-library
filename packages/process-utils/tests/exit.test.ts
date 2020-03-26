import chalk from "chalk";

import { exitFailure, exitSuccess } from "../src";

describe("src/exit.ts tests", () => {
  let stdoutData: string;
  let stderrData: string;
  let spyLog: jest.SpyInstance;
  let spyError: jest.SpyInstance;
  let spyExit: jest.SpyInstance;

  beforeEach(() => {
    stdoutData = "";
    stderrData = "";
    spyLog = jest.spyOn(console, "log").mockImplementation((inputs: string) => {
      stdoutData += inputs;
    });
    spyError = jest
      .spyOn(console, "error")
      .mockImplementation((inputs: string) => {
        stderrData += inputs;
      });
    spyExit = jest
      .spyOn(process, "exit")
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      .mockImplementation((() => {}) as () => never);
  });

  afterEach(() => {
    spyLog.mockRestore();
    spyError.mockRestore();
    spyExit.mockRestore();
  });

  describe("exitFailure", () => {
    it("should call logError then exit with status code 1", () => {
      exitFailure("Error message");
      expect(stderrData).toBe(chalk.red("Error message"));
      expect(spyExit).toHaveBeenCalledWith(1);
    });
  });

  describe("exitSuccess", () => {
    it("should call logSuccess then exit with status code 0", () => {
      exitSuccess("Success message");
      expect(stdoutData).toBe(chalk.green("Success message"));
      expect(spyExit).toHaveBeenCalledWith(0);
    });
  });
});
