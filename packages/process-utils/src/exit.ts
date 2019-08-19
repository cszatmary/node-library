import { logError, logSuccess } from './log';

/**
 * Logs a message to stderr in red, then terminates the process.
 * @param message The message to log.
 * @param statusCode The status code the process should terminate with. Defaults to `1`.
 * @param optionalParams Any additional parameters to log.
 */
export function exitFailure(
  message?: any,
  statusCode = 1,
  ...optionalParams: any[]
): never {
  logError(message, ...optionalParams);
  return process.exit(statusCode);
}

/**
 * Logs a message to stdout in green, then terminates the process with status 0.
 * @param message The message to log.
 * @param optionalParams Any additional parameters to log.
 */
export function exitSuccess(message?: any, ...optionalParams: any[]): never {
  logSuccess(message, ...optionalParams);
  return process.exit(0);
}
