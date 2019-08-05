import { exitFailure } from './exit';

/**
 * Returns the current working directory of the process.
 * npm scripts always set the cwd to the directory where the package.json is located.
 * This function will ensure that the real cwd is returned in all situations.
 */
export const cwd = (): string => process.env.INIT_CWD || process.cwd();

/**
 * Ensures that a status code from a child process is 0 (success).
 * If not it terminates the process with the given status code.
 * @param status The status of the child process.
 * @param command The name of the child process.
 * @param failureStatus The status to terminate the current process with
 * if the child process failed. Defaults to `status`.
 */
export function ensureChildSucceeded(
  status: number,
  command: string,
  failureStatus = status,
): void {
  if (status !== 0) {
    exitFailure(`${command} exited with code ${status}`, failureStatus);
  }
}
