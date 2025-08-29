import { logger } from '../services/Logger';

export interface ErrorContext {
  component?: string;
  operation?: string;
  userId?: string;
  data?: unknown;
}

export class AppError extends Error {
  public readonly code: string;
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public readonly context?: ErrorContext;

  constructor(
    message: string,
    code: string = 'UNKNOWN_ERROR',
    statusCode: number = 500,
    isOperational: boolean = true,
    context?: ErrorContext
  ) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.context = context;

    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  constructor(message: string, context?: ErrorContext) {
    super(message, 'VALIDATION_ERROR', 400, true, context);
    this.name = 'ValidationError';
  }
}

export class NetworkError extends AppError {
  constructor(message: string, context?: ErrorContext) {
    super(message, 'NETWORK_ERROR', 503, true, context);
    this.name = 'NetworkError';
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string, context?: ErrorContext) {
    super(message, 'AUTH_ERROR', 401, true, context);
    this.name = 'AuthenticationError';
  }
}

export class AuthorizationError extends AppError {
  constructor(message: string, context?: ErrorContext) {
    super(message, 'AUTHZ_ERROR', 403, true, context);
    this.name = 'AuthorizationError';
  }
}

export function handleError(error: unknown, context?: ErrorContext): void {
  const err = normalizeError(error);
  
  // Log the error
  logger.error(err.message, err, context?.component);
  
  // Handle operational errors differently from programming errors
  if (err instanceof AppError && err.isOperational) {
    // These are expected errors that we can recover from
    handleOperationalError(err);
  } else {
    // These are unexpected errors that indicate bugs
    handleProgrammingError(err);
  }
}

function normalizeError(error: unknown): Error {
  if (error instanceof Error) {
    return error;
  }
  
  if (typeof error === 'string') {
    return new Error(error);
  }
  
  if (typeof error === 'object' && error !== null) {
    return new Error(JSON.stringify(error));
  }
  
  return new Error('Unknown error occurred');
}

function handleOperationalError(error: AppError): void {
  // For operational errors, we can show user-friendly messages
  // and potentially retry the operation
  
  switch (error.code) {
    case 'VALIDATION_ERROR':
      // Show validation feedback to user
      break;
    case 'NETWORK_ERROR':
      // Offer retry option
      break;
    case 'AUTH_ERROR':
      // Redirect to login
      break;
    default:
      // Show generic error message
      break;
  }
}

function handleProgrammingError(error: Error): void {
  // For programming errors, we should:
  // 1. Log comprehensive error details
  // 2. Send to error tracking service (e.g., Sentry)
  // 3. Show generic error message to user
  // 4. Potentially restart the affected component
  
  logger.fatal('Programming error detected', error);
}

export function createErrorHandler(defaultContext?: ErrorContext) {
  return (error: unknown) => handleError(error, defaultContext);
}

export async function withErrorHandling<T>(
  operation: () => Promise<T>,
  context?: ErrorContext
): Promise<T | null> {
  try {
    return await operation();
  } catch (error) {
    handleError(error, context);
    return null;
  }
}

export function errorBoundary<T extends (...args: any[]) => any>(
  fn: T,
  context?: ErrorContext
): T {
  return ((...args: Parameters<T>) => {
    try {
      const result = fn(...args);
      
      if (result instanceof Promise) {
        return result.catch(error => {
          handleError(error, context);
          throw error;
        });
      }
      
      return result;
    } catch (error) {
      handleError(error, context);
      throw error;
    }
  }) as T;
}