/**
 * Logs a message and error to stderr, then terminates the process with code 1.
 * @param err The error to log.
 * @param message The message to log.
 * @param optionalParams Any additional parameters to log.
 */
export function exitErr(
  err: Error,
  message: string,
  ...optionalParams: unknown[]
): never {
  console.error(message, ...optionalParams);
  console.error(err);
  process.exit(1);
}

/**
 * Logs a message to stderr, then terminates the process with code 1.
 * @param message The message to log.
 * @param optionalParams Any additional parameters to log.
 */
export function exit(message: string, ...optionalParams: unknown[]): never {
  console.error(message, ...optionalParams);
  process.exit(1);
}
