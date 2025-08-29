/**
 * Structured Logger Utility
 * 
 * Provides consistent logging across the application with proper log levels,
 * structured output, and environment-aware configuration.
 * 
 * @module utils/logger
 */

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  NONE = 4
}

interface LogContext {
  component?: string;
  action?: string;
  fieldPath?: string;
  metadata?: Record<string, any>;
}

class Logger {
  private logLevel: LogLevel;
  private isDevelopment: boolean;

  constructor() {
    this.isDevelopment = process.env.NODE_ENV !== 'production';
    this.logLevel = this.isDevelopment ? LogLevel.DEBUG : LogLevel.INFO;
  }

  private shouldLog(level: LogLevel): boolean {
    return level >= this.logLevel;
  }

  private formatMessage(level: string, message: string, context?: LogContext): string {
    const timestamp = new Date().toISOString();
    const contextStr = context ? ` [${context.component}]` : '';
    return `[${timestamp}] ${level}${contextStr}: ${message}`;
  }

  private log(level: LogLevel, levelStr: string, message: string, context?: LogContext, data?: any) {
    if (!this.shouldLog(level)) return;

    const formattedMessage = this.formatMessage(levelStr, message, context);
    
    switch (level) {
      case LogLevel.ERROR:
        console.error(formattedMessage, data || '');
        break;
      case LogLevel.WARN:
        console.warn(formattedMessage, data || '');
        break;
      default:
        console.log(formattedMessage, data || '');
    }

    // In production, you could send logs to a monitoring service here
    if (!this.isDevelopment && level >= LogLevel.ERROR) {
      // this.sendToMonitoring(formattedMessage, data);
    }
  }

  debug(message: string, context?: LogContext, data?: any) {
    this.log(LogLevel.DEBUG, 'DEBUG', message, context, data);
  }

  info(message: string, context?: LogContext, data?: any) {
    this.log(LogLevel.INFO, 'INFO', message, context, data);
  }

  warn(message: string, context?: LogContext, data?: any) {
    this.log(LogLevel.WARN, 'WARN', message, context, data);
  }

  error(message: string, context?: LogContext, error?: Error | any) {
    this.log(LogLevel.ERROR, 'ERROR', message, context, error);
  }

  fieldMapping(uiPath: string, pdfFieldId: string, metadata?: any) {
    if (this.isDevelopment) {
      this.debug(`Field Mapping: ${uiPath} → ${pdfFieldId}`, 
        { component: 'FieldMapping', fieldPath: uiPath },
        metadata
      );
    }
  }

  setLogLevel(level: LogLevel) {
    this.logLevel = level;
  }
}

// Export singleton instance
export const logger = new Logger();

// Export convenience functions
export const logDebug = logger.debug.bind(logger);
export const logInfo = logger.info.bind(logger);
export const logWarn = logger.warn.bind(logger);
export const logError = logger.error.bind(logger);
export const logFieldMapping = logger.fieldMapping.bind(logger);