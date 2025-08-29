/**
 * Debug Logger Utility
 * 
 * Provides centralized logging with environment-aware output.
 * Only logs in debug mode to avoid console pollution in production.
 */

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface LoggerConfig {
  enableInProduction?: boolean;
  prefix?: string;
}

class DebugLogger {
  private isDebugMode: boolean;
  private config: LoggerConfig;

  constructor(config: LoggerConfig = {}) {
    this.config = config;
    this.isDebugMode = this.checkDebugMode();
  }

  private checkDebugMode(): boolean {
    if (typeof window === 'undefined') return false;
    
    // Check for debug query parameter or environment
    return (
      window.location.search.includes('debug=true') ||
      process.env.NODE_ENV === 'development' ||
      Boolean(this.config.enableInProduction)
    );
  }

  private formatMessage(level: LogLevel, message: string, ...args: unknown[]): void {
    if (!this.isDebugMode) return;

    const prefix = this.config.prefix ? `[${this.config.prefix}] ` : '';
    const timestamp = new Date().toISOString();
    
    const logMethods = {
      debug: console.debug,
      info: console.info,
      warn: console.warn,
      error: console.error
    };

    const logMethod = logMethods[level] || console.log;
    logMethod(`[${timestamp}] ${prefix}${message}`, ...args);
  }

  debug(message: string, ...args: unknown[]): void {
    this.formatMessage('debug', message, ...args);
  }

  info(message: string, ...args: unknown[]): void {
    this.formatMessage('info', message, ...args);
  }

  warn(message: string, ...args: unknown[]): void {
    this.formatMessage('warn', message, ...args);
  }

  error(message: string, ...args: unknown[]): void {
    // Always log errors, even in production
    const prefix = this.config.prefix ? `[${this.config.prefix}] ` : '';
    console.error(`${prefix}${message}`, ...args);
  }

  group(label: string): void {
    if (this.isDebugMode) {
      console.group(label);
    }
  }

  groupEnd(): void {
    if (this.isDebugMode) {
      console.groupEnd();
    }
  }

  table(data: unknown): void {
    if (this.isDebugMode) {
      console.table(data);
    }
  }

  time(label: string): void {
    if (this.isDebugMode) {
      console.time(label);
    }
  }

  timeEnd(label: string): void {
    if (this.isDebugMode) {
      console.timeEnd(label);
    }
  }
}

// Export factory function for creating loggers with specific configurations
export function createLogger(config?: LoggerConfig): DebugLogger {
  return new DebugLogger(config);
}

// Export default logger instance
export const logger = new DebugLogger();

// Export specific loggers for different contexts
export const formLogger = new DebugLogger({ prefix: 'SF86Form' });
export const sectionLogger = new DebugLogger({ prefix: 'Section' });
export const validationLogger = new DebugLogger({ prefix: 'Validation' });
export const pdfLogger = new DebugLogger({ prefix: 'PDF' });