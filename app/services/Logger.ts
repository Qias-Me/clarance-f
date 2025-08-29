export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  FATAL = 4
}

export interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: Date;
  context?: string;
  data?: unknown;
  error?: Error;
  userId?: string;
  sessionId?: string;
}

export interface LoggerConfig {
  level: LogLevel;
  enableConsole: boolean;
  enableRemote: boolean;
  remoteEndpoint?: string;
  maxBufferSize: number;
  flushInterval: number;
}

class Logger {
  private config: LoggerConfig;
  private buffer: LogEntry[] = [];
  private flushTimer?: NodeJS.Timeout;
  private sessionId: string;

  constructor(config: Partial<LoggerConfig> = {}) {
    this.config = {
      level: LogLevel.INFO,
      enableConsole: process.env.NODE_ENV !== 'production',
      enableRemote: process.env.NODE_ENV === 'production',
      maxBufferSize: 100,
      flushInterval: 5000,
      ...config
    };

    this.sessionId = this.generateSessionId();
    this.startFlushTimer();
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private shouldLog(level: LogLevel): boolean {
    return level >= this.config.level;
  }

  private formatMessage(entry: LogEntry): string {
    const levelName = LogLevel[entry.level];
    const timestamp = entry.timestamp.toISOString();
    const context = entry.context ? `[${entry.context}]` : '';
    
    return `${timestamp} ${levelName} ${context} ${entry.message}`;
  }

  private addToBuffer(entry: LogEntry): void {
    this.buffer.push(entry);

    if (this.buffer.length >= this.config.maxBufferSize) {
      this.flush();
    }
  }

  private startFlushTimer(): void {
    if (this.config.enableRemote && this.config.flushInterval > 0) {
      this.flushTimer = setInterval(() => {
        this.flush();
      }, this.config.flushInterval);
    }
  }

  private async sendToRemote(entries: LogEntry[]): Promise<void> {
    if (!this.config.remoteEndpoint) return;

    try {
      await fetch(this.config.remoteEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          sessionId: this.sessionId,
          entries
        })
      });
    } catch (error) {
      // Fallback to console if remote logging fails
      if (this.config.enableConsole) {
        console.error('Failed to send logs to remote:', error);
      }
    }
  }

  flush(): void {
    if (this.buffer.length === 0) return;

    const entriesToFlush = [...this.buffer];
    this.buffer = [];

    if (this.config.enableRemote) {
      this.sendToRemote(entriesToFlush);
    }
  }

  private log(level: LogLevel, message: string, context?: string, data?: unknown): void {
    if (!this.shouldLog(level)) return;

    const entry: LogEntry = {
      level,
      message,
      timestamp: new Date(),
      context,
      data,
      sessionId: this.sessionId
    };

    // Console logging
    if (this.config.enableConsole) {
      const formattedMessage = this.formatMessage(entry);
      
      switch (level) {
        case LogLevel.DEBUG:
          console.debug(formattedMessage, data || '');
          break;
        case LogLevel.INFO:
          console.info(formattedMessage, data || '');
          break;
        case LogLevel.WARN:
          console.warn(formattedMessage, data || '');
          break;
        case LogLevel.ERROR:
        case LogLevel.FATAL:
          console.error(formattedMessage, data || '');
          break;
      }
    }

    // Remote logging
    if (this.config.enableRemote) {
      this.addToBuffer(entry);
    }
  }

  debug(message: string, context?: string, data?: unknown): void {
    this.log(LogLevel.DEBUG, message, context, data);
  }

  info(message: string, context?: string, data?: unknown): void {
    this.log(LogLevel.INFO, message, context, data);
  }

  warn(message: string, context?: string, data?: unknown): void {
    this.log(LogLevel.WARN, message, context, data);
  }

  error(message: string, error?: Error | unknown, context?: string): void {
    const errorObj = error instanceof Error ? error : new Error(String(error));
    
    const entry: LogEntry = {
      level: LogLevel.ERROR,
      message,
      timestamp: new Date(),
      context,
      error: errorObj,
      sessionId: this.sessionId,
      data: {
        stack: errorObj.stack,
        name: errorObj.name,
        message: errorObj.message
      }
    };

    if (this.config.enableConsole) {
      console.error(this.formatMessage(entry), errorObj);
    }

    if (this.config.enableRemote) {
      this.addToBuffer(entry);
    }
  }

  fatal(message: string, error?: Error, context?: string): void {
    this.error(message, error, context);
    // In a real application, you might want to trigger additional actions for fatal errors
    this.flush(); // Immediately flush for fatal errors
  }

  setLevel(level: LogLevel): void {
    this.config.level = level;
  }

  setUserId(userId: string): void {
    // Add userId to all future log entries
    this.buffer.forEach(entry => entry.userId = userId);
  }

  destroy(): void {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
    }
    this.flush();
  }
}

// Singleton instance
let loggerInstance: Logger | null = null;

export function getLogger(config?: Partial<LoggerConfig>): Logger {
  if (!loggerInstance) {
    loggerInstance = new Logger(config);
  }
  return loggerInstance;
}

// Convenience functions
export const logger = getLogger();

export function configureLogger(config: Partial<LoggerConfig>): void {
  if (loggerInstance) {
    loggerInstance.destroy();
  }
  loggerInstance = new Logger(config);
}

// Structured logging helpers
export function logPerformance(operation: string, duration: number, metadata?: Record<string, unknown>): void {
  logger.info(`Performance: ${operation}`, 'Performance', {
    operation,
    duration,
    ...metadata
  });
}

export function logUserAction(action: string, details?: Record<string, unknown>): void {
  logger.info(`User Action: ${action}`, 'UserAction', details);
}

export function logApiCall(method: string, endpoint: string, status: number, duration: number): void {
  const level = status >= 400 ? LogLevel.ERROR : LogLevel.INFO;
  logger.log(level, `API ${method} ${endpoint} - ${status}`, 'API', {
    method,
    endpoint,
    status,
    duration
  });
}