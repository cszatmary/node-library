import chalk from "chalk";

import { logError, logSuccess } from "../src";

describe("src/log.ts tests", () => {
  let stdoutData: string;
  let stderrData: string;
  let spyLog: jest.SpyInstance;
  let spyError: jest.SpyInstance;

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
  });

  afterEach(() => {
    spyLog.mockRestore();
    spyError.mockRestore();
  });

  describe("logError", () => {
    it("should console.error the message", () => {
      // Setup
      logError("Error message");

      // Assert
      expect(spyError.mock.calls).toHaveLength(1);
      expect(spyError.mock.calls[0][0]).toBe(chalk.red("Error message"));
      expect(stderrData).toBe(chalk.red("Error message"));
    });

    it("should console.error multiple messages", () => {
      // Setup
      logError("Error message", "Another error message");

      // Assert
      expect(spyError.mock.calls).toHaveLength(1);
      expect(spyError.mock.calls[0][0]).toBe(
        chalk.red("Error message Another error message"),
      );
      expect(stderrData).toBe(chalk.red("Error message Another error message"));
    });
  });

  describe("logSuccess", () => {
    it("should console.log the message", () => {
      // Setup
      logSuccess("Success message");

      // Assert
      expect(spyLog.mock.calls).toHaveLength(1);
      expect(spyLog.mock.calls[0][0]).toBe(chalk.green("Success message"));
      expect(stdoutData).toBe(chalk.green("Success message"));
    });

    it("should console.error multiple messages", () => {
      // Setup
      logSuccess("Success message", "Another success message");
      // Assert
      expect(spyLog.mock.calls).toHaveLength(1);
      expect(spyLog.mock.calls[0][0]).toBe(
        chalk.green("Success message Another success message"),
      );
      expect(stdoutData).toBe(
        chalk.green("Success message Another success message"),
      );
    });
  });
});
