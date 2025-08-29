/**
 * Structured Logger
 * 
 * Replaces console.log statements with structured, production-safe logging.
 * Provides different log levels and automatic sanitization.
 */

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  NONE = 4
}

export interface LogContext {
  component?: string;
  section?: string;
  action?: string;
  userId?: string;
  timestamp?: string;
  [key: string]: any;
}

export interface LogEntry {
  level: LogLevel;
  message: string;
  context?: LogContext;
  error?: Error;
  timestamp: Date;
}

class StructuredLogger {
  private static instance: StructuredLogger;
  private logLevel: LogLevel;
  private isDevelopment: boolean;
  private logHistory: LogEntry[] = [];
  private maxHistorySize = 100;

  private constructor() {
    this.isDevelopment = process.env.NODE_ENV === 'development';
    this.logLevel = this.isDevelopment ? LogLevel.DEBUG : LogLevel.WARN;
  }

  static getInstance(): StructuredLogger {
    if (!StructuredLogger.instance) {
      StructuredLogger.instance = new StructuredLogger();
    }
    return StructuredLogger.instance;
  }

  /**
   * Sanitize sensitive data from logs
   */
  private sanitize(data: any): any {
    if (typeof data !== 'object' || data === null) {
      return data;
    }

    const sensitiveKeys = [
      'password',
      'ssn',
      'socialSecurityNumber',
      'creditCard',
      'token',
      'apiKey',
      'secret'
    ];

    const sanitized = Array.isArray(data) ? [...data] : { ...data };

    for (const key in sanitized) {
      const lowerKey = key.toLowerCase();
      
      if (sensitiveKeys.some(sensitive => lowerKey.includes(sensitive))) {
        sanitized[key] = '[REDACTED]';
      } else if (typeof sanitized[key] === 'object') {
        sanitized[key] = this.sanitize(sanitized[key]);
      }
    }

    return sanitized;
  }

  /**
   * Format log entry for output
   */
  private formatEntry(entry: LogEntry): string {
    const levelStr = LogLevel[entry.level];
    const timestamp = entry.timestamp.toISOString();
    const contextStr = entry.context 
      ? JSON.stringify(this.sanitize(entry.context))
      : '';

    return `[${timestamp}] [${levelStr}] ${entry.message}${contextStr ? ' ' + contextStr : ''}`;
  }

  /**
   * Add entry to history
   */
  private addToHistory(entry: LogEntry): void {
    this.logHistory.push(entry);
    if (this.logHistory.length > this.maxHistorySize) {
      this.logHistory.shift();
    }
  }

  /**
   * Core logging method
   */
  private log(level: LogLevel, message: string, context?: LogContext, error?: Error): void {
    if (level < this.logLevel) {
      return;
    }

    const entry: LogEntry = {
      level,
      message,
      context: context ? this.sanitize(context) : undefined,
      error,
      timestamp: new Date()
    };

    this.addToHistory(entry);

    // In development, use console methods
    if (this.isDevelopment) {
      const formattedMessage = this.formatEntry(entry);
      
      switch (level) {
        case LogLevel.DEBUG:
          console.debug(formattedMessage);
          break;
        case LogLevel.INFO:
          console.info(formattedMessage);
          break;
        case LogLevel.WARN:
          console.warn(formattedMessage);
          break;
        case LogLevel.ERROR:
          console.error(formattedMessage, error);
          break;
      }
    } else {
      // In production, could send to monitoring service
      // For now, only log errors and warnings
      if (level >= LogLevel.WARN) {
        const formattedMessage = this.formatEntry(entry);
        if (level === LogLevel.ERROR) {
          console.error(formattedMessage, error);
        } else {
          console.warn(formattedMessage);
        }
      }
    }
  }

  /**
   * Public logging methods
   */
  debug(message: string, context?: LogContext): void {
    this.log(LogLevel.DEBUG, message, context);
  }

  info(message: string, context?: LogContext): void {
    this.log(LogLevel.INFO, message, context);
  }

  warn(message: string, context?: LogContext): void {
    this.log(LogLevel.WARN, message, context);
  }

  error(message: string, error?: Error, context?: LogContext): void {
    this.log(LogLevel.ERROR, message, context, error);
  }

  /**
   * Set log level
   */
  setLogLevel(level: LogLevel): void {
    this.logLevel = level;
  }

  /**
   * Get log history
   */
  getHistory(): LogEntry[] {
    return [...this.logHistory];
  }

  /**
   * Clear log history
   */
  clearHistory(): void {
    this.logHistory = [];
  }

  /**
   * Create a child logger with default context
   */
  createChildLogger(defaultContext: LogContext): {
    debug: (message: string, context?: LogContext) => void;
    info: (message: string, context?: LogContext) => void;
    warn: (message: string, context?: LogContext) => void;
    error: (message: string, error?: Error, context?: LogContext) => void;
  } {
    return {
      debug: (message: string, context?: LogContext) => 
        this.debug(message, { ...defaultContext, ...context }),
      info: (message: string, context?: LogContext) => 
        this.info(message, { ...defaultContext, ...context }),
      warn: (message: string, context?: LogContext) => 
        this.warn(message, { ...defaultContext, ...context }),
      error: (message: string, error?: Error, context?: LogContext) => 
        this.error(message, error, { ...defaultContext, ...context })
    };
  }
}

// Export singleton instance
export const logger = StructuredLogger.getInstance();

// Export factory for component-specific loggers
export function createLogger(component: string, section?: string) {
  return logger.createChildLogger({ component, section });
}