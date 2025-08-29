"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logger = exports.LogLevel = void 0;
exports.getLogger = getLogger;
exports.configureLogger = configureLogger;
exports.logPerformance = logPerformance;
exports.logUserAction = logUserAction;
exports.logApiCall = logApiCall;
var LogLevel;
(function (LogLevel) {
    LogLevel[LogLevel["DEBUG"] = 0] = "DEBUG";
    LogLevel[LogLevel["INFO"] = 1] = "INFO";
    LogLevel[LogLevel["WARN"] = 2] = "WARN";
    LogLevel[LogLevel["ERROR"] = 3] = "ERROR";
    LogLevel[LogLevel["FATAL"] = 4] = "FATAL";
})(LogLevel || (exports.LogLevel = LogLevel = {}));
class Logger {
    constructor(config = {}) {
        this.buffer = [];
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
    generateSessionId() {
        return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    shouldLog(level) {
        return level >= this.config.level;
    }
    formatMessage(entry) {
        const levelName = LogLevel[entry.level];
        const timestamp = entry.timestamp.toISOString();
        const context = entry.context ? `[${entry.context}]` : '';
        return `${timestamp} ${levelName} ${context} ${entry.message}`;
    }
    addToBuffer(entry) {
        this.buffer.push(entry);
        if (this.buffer.length >= this.config.maxBufferSize) {
            this.flush();
        }
    }
    startFlushTimer() {
        if (this.config.enableRemote && this.config.flushInterval > 0) {
            this.flushTimer = setInterval(() => {
                this.flush();
            }, this.config.flushInterval);
        }
    }
    async sendToRemote(entries) {
        if (!this.config.remoteEndpoint)
            return;
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
        }
        catch (error) {
            // Fallback to console if remote logging fails
            if (this.config.enableConsole) {
                console.error('Failed to send logs to remote:', error);
            }
        }
    }
    flush() {
        if (this.buffer.length === 0)
            return;
        const entriesToFlush = [...this.buffer];
        this.buffer = [];
        if (this.config.enableRemote) {
            this.sendToRemote(entriesToFlush);
        }
    }
    log(level, message, context, data) {
        if (!this.shouldLog(level))
            return;
        const entry = {
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
    debug(message, context, data) {
        this.log(LogLevel.DEBUG, message, context, data);
    }
    info(message, context, data) {
        this.log(LogLevel.INFO, message, context, data);
    }
    warn(message, context, data) {
        this.log(LogLevel.WARN, message, context, data);
    }
    error(message, error, context) {
        const errorObj = error instanceof Error ? error : new Error(String(error));
        const entry = {
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
    fatal(message, error, context) {
        this.error(message, error, context);
        // In a real application, you might want to trigger additional actions for fatal errors
        this.flush(); // Immediately flush for fatal errors
    }
    setLevel(level) {
        this.config.level = level;
    }
    setUserId(userId) {
        // Add userId to all future log entries
        this.buffer.forEach(entry => entry.userId = userId);
    }
    destroy() {
        if (this.flushTimer) {
            clearInterval(this.flushTimer);
        }
        this.flush();
    }
}
// Singleton instance
let loggerInstance = null;
function getLogger(config) {
    if (!loggerInstance) {
        loggerInstance = new Logger(config);
    }
    return loggerInstance;
}
// Convenience functions
exports.logger = getLogger();
function configureLogger(config) {
    if (loggerInstance) {
        loggerInstance.destroy();
    }
    loggerInstance = new Logger(config);
}
// Structured logging helpers
function logPerformance(operation, duration, metadata) {
    exports.logger.info(`Performance: ${operation}`, 'Performance', {
        operation,
        duration,
        ...metadata
    });
}
function logUserAction(action, details) {
    exports.logger.info(`User Action: ${action}`, 'UserAction', details);
}
function logApiCall(method, endpoint, status, duration) {
    const level = status >= 400 ? LogLevel.ERROR : LogLevel.INFO;
    exports.logger.log(level, `API ${method} ${endpoint} - ${status}`, 'API', {
        method,
        endpoint,
        status,
        duration
    });
}
