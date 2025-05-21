/**
 * Consolidated Logging Module
 * 
 * This module provides standardized logging functions for the sectionizer
 * with consistent formatting, timestamp support, and log level control.
 */

import chalk from 'chalk';
import { getFormattedTimestamp } from './commonHelpers.js';

/**
 * Log level type for controlling verbosity
 */
export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'success' | 'none';

/**
 * Current log level - can be set through setLogLevel
 */
let currentLogLevel: LogLevel = 'info';

/**
 * Map of log levels to numeric values for comparison
 */
const LOG_LEVEL_VALUES: Record<LogLevel, number> = {
  'debug': 0,
  'info': 1,
  'success': 2,
  'warn': 3,
  'error': 4,
  'none': 5
};

/**
 * Set the current log level
 * @param level New log level to set
 */
export function setLogLevel(level: LogLevel): void {
  currentLogLevel = level;
}

/**
 * Get the current log level
 * @returns Current log level
 */
export function getLogLevel(): LogLevel {
  return currentLogLevel;
}

/**
 * Check if the given log level should be displayed
 * @param level Log level to check
 * @returns True if the level should be displayed
 */
function shouldLog(level: LogLevel): boolean {
  return LOG_LEVEL_VALUES[level] >= LOG_LEVEL_VALUES[currentLogLevel];
}

/**
 * Log a message with the specified level and optional timestamp
 * @param level Log level
 * @param message Message to log
 * @param includeTimestamp Whether to include a timestamp
 */
export function log(
  level: LogLevel,
  message: string,
  includeTimestamp: boolean = true
): void {
  if (!shouldLog(level)) return;
  
  // Skip logging for 'none' level
  if (level === 'none') return;
  
  let formattedMessage: string;
  
  if (includeTimestamp) {
    const timestamp = getFormattedTimestamp();
    formattedMessage = `[${timestamp}] ${message}`;
  } else {
    formattedMessage = message;
  }
  
  // Apply color based on level
  switch (level) {
    case 'debug':
      console.log(chalk.gray(`[DEBUG] ${formattedMessage}`));
      break;
    case 'info':
      console.log(chalk.blue(`[INFO] ${formattedMessage}`));
      break;
    case 'success':
      console.log(chalk.green(`[SUCCESS] ${formattedMessage}`));
      break;
    case 'warn':
      console.log(chalk.yellow(`[WARN] ${formattedMessage}`));
      break;
    case 'error':
      console.error(chalk.red(`[ERROR] ${formattedMessage}`));
      break;
  }
}

/**
 * Log a debug message
 * @param message Message to log
 * @param includeTimestamp Whether to include a timestamp
 */
export function debug(message: string, includeTimestamp: boolean = true): void {
  log('debug', message, includeTimestamp);
}

/**
 * Log an info message
 * @param message Message to log
 * @param includeTimestamp Whether to include a timestamp
 */
export function info(message: string, includeTimestamp: boolean = true): void {
  log('info', message, includeTimestamp);
}

/**
 * Log a success message
 * @param message Message to log
 * @param includeTimestamp Whether to include a timestamp
 */
export function success(message: string, includeTimestamp: boolean = true): void {
  log('success', message, includeTimestamp);
}

/**
 * Log a warning message
 * @param message Message to log
 * @param includeTimestamp Whether to include a timestamp
 */
export function warn(message: string, includeTimestamp: boolean = true): void {
  log('warn', message, includeTimestamp);
}

/**
 * Log an error message
 * @param message Message to log
 * @param includeTimestamp Whether to include a timestamp
 */
export function error(message: string, includeTimestamp: boolean = true): void {
  log('error', message, includeTimestamp);
}

/**
 * Log a message with a progress bar
 * @param message Message to log
 * @param current Current progress value
 * @param total Total progress value
 * @param width Width of the progress bar in characters
 */
export function progress(
  message: string,
  current: number,
  total: number,
  width: number = 30
): void {
  if (!shouldLog('info')) return;
  
  const percent = Math.min(100, Math.round((current / total) * 100));
  const barWidth = Math.floor((width * percent) / 100);
  
  const bar = '█'.repeat(barWidth) + '░'.repeat(width - barWidth);
  const formattedMessage = `${message} [${bar}] ${percent}% (${current}/${total})`;
  
  // Clear the line and rewrite
  process.stdout.write('\r\x1b[K');
  process.stdout.write(formattedMessage);
  
  // Move to next line if complete
  if (current >= total) {
    process.stdout.write('\n');
  }
}

/**
 * Create a table from an array of objects and log it
 * @param data Array of objects to display as a table
 * @param title Optional title for the table
 * @param level Log level for the table
 */
export function table<T extends Record<string, any>>(
  data: T[],
  title?: string,
  level: LogLevel = 'info'
): void {
  if (!shouldLog(level) || data.length === 0) return;
  
  if (title) {
    log(level, title, false);
  }
  
  console.table(data);
}

/**
 * Log a separator line for visual organization
 * @param level Log level for the separator
 * @param char Character to use for the separator
 * @param length Length of the separator line
 */
export function separator(
  level: LogLevel = 'info',
  char: string = '=',
  length: number = 80
): void {
  if (!shouldLog(level)) return;
  
  log(level, char.repeat(length), false);
}

/**
 * Log the start of a section with a header
 * @param title Section title
 * @param level Log level for the section
 */
export function section(title: string, level: LogLevel = 'info'): void {
  if (!shouldLog(level)) return;
  
  separator(level);
  log(level, title, true);
  separator(level);
}

// Export a logger object for simpler usage
export const logger = {
  setLogLevel,
  getLogLevel,
  log,
  debug,
  info,
  success,
  warn,
  error,
  progress,
  table,
  separator,
  section
};

// Default export for easier importing
export default logger; 