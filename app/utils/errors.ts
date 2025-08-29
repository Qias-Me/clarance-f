/**
 * Custom Error Types for Application
 * 
 * Provides structured error handling with specific error types
 * for different failure scenarios across the application.
 * 
 * @module utils/errors
 */

/**
 * Base custom error class with additional context
 */
export class AppError extends Error {
  public readonly code: string;
  public readonly statusCode?: number;
  public readonly context?: Record<string, any>;
  public readonly timestamp: Date;

  constructor(
    message: string,
    code: string,
    statusCode?: number,
    context?: Record<string, any>
  ) {
    super(message);
    this.name = this.constructor.name;
    this.code = code;
    this.statusCode = statusCode;
    this.context = context;
    this.timestamp = new Date();

    // Maintains proper stack trace for where error was thrown
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

/**
 * Validation error for field validation failures
 */
export class ValidationError extends AppError {
  public readonly field?: string;
  public readonly value?: any;

  constructor(
    message: string,
    field?: string,
    value?: any,
    context?: Record<string, any>
  ) {
    super(message, 'VALIDATION_ERROR', 400, context);
    this.field = field;
    this.value = value;
  }
}

/**
 * Field mapping error for PDF-to-UI mapping issues
 */
export class FieldMappingError extends AppError {
  public readonly uiPath?: string;
  public readonly pdfFieldId?: string;

  constructor(
    message: string,
    uiPath?: string,
    pdfFieldId?: string,
    context?: Record<string, any>
  ) {
    super(message, 'FIELD_MAPPING_ERROR', 500, context);
    this.uiPath = uiPath;
    this.pdfFieldId = pdfFieldId;
  }
}

/**
 * Data integrity error for inconsistent data states
 */
export class DataIntegrityError extends AppError {
  public readonly expectedValue?: any;
  public readonly actualValue?: any;

  constructor(
    message: string,
    expectedValue?: any,
    actualValue?: any,
    context?: Record<string, any>
  ) {
    super(message, 'DATA_INTEGRITY_ERROR', 500, context);
    this.expectedValue = expectedValue;
    this.actualValue = actualValue;
  }
}

/**
 * PDF generation error
 */
export class PdfGenerationError extends AppError {
  public readonly section?: number;
  public readonly operation?: string;

  constructor(
    message: string,
    section?: number,
    operation?: string,
    context?: Record<string, any>
  ) {
    super(message, 'PDF_GENERATION_ERROR', 500, context);
    this.section = section;
    this.operation = operation;
  }
}

/**
 * Configuration error for missing or invalid configuration
 */
export class ConfigurationError extends AppError {
  public readonly configKey?: string;

  constructor(
    message: string,
    configKey?: string,
    context?: Record<string, any>
  ) {
    super(message, 'CONFIGURATION_ERROR', 500, context);
    this.configKey = configKey;
  }
}

/**
 * Network error for API or external service failures
 */
export class NetworkError extends AppError {
  public readonly url?: string;
  public readonly method?: string;

  constructor(
    message: string,
    url?: string,
    method?: string,
    statusCode?: number,
    context?: Record<string, any>
  ) {
    super(message, 'NETWORK_ERROR', statusCode || 503, context);
    this.url = url;
    this.method = method;
  }
}

/**
 * Helper function to determine if an error is a known AppError
 */
export function isAppError(error: unknown): error is AppError {
  return error instanceof AppError;
}

/**
 * Helper function to safely extract error message
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  return 'An unknown error occurred';
}

/**
 * Helper function to safely extract error details
 */
export function getErrorDetails(error: unknown): {
  message: string;
  code?: string;
  statusCode?: number;
  context?: Record<string, any>;
} {
  if (isAppError(error)) {
    return {
      message: error.message,
      code: error.code,
      statusCode: error.statusCode,
      context: error.context
    };
  }
  
  if (error instanceof Error) {
    return {
      message: error.message,
      code: 'UNKNOWN_ERROR'
    };
  }
  
  return {
    message: getErrorMessage(error),
    code: 'UNKNOWN_ERROR'
  };
}