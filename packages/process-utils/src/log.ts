import chalk from "chalk";

/**
 * Logs a message to stderr in red.
 * @param message The message to log.
 * @param optionalParams Any additional parameters to log.
 */
export function logError(message?: any, ...optionalParams: any[]): void {
  console.error(chalk.red(message, ...optionalParams));
}

/**
 * Logs a message to stdout in green.
 * @param message The message to log.
 * @param optionalParams Any additional parameters to log.
 */
export function logSuccess(message?: any, ...optionalParams: any[]): void {
  console.log(chalk.green(message, ...optionalParams));
}
