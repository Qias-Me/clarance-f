/**
 * Input Validation Middleware
 * 
 * Provides schema validation and sanitization for API inputs
 */

import { z } from 'zod';
import { AppError } from '../../app/utils/error-handler';

export interface ValidationOptions {
  stripUnknown?: boolean;
  abortEarly?: boolean;
  context?: Record<string, unknown>;
}

export class ValidationError extends AppError {
  constructor(
    message: string,
    public errors: z.ZodIssue[]
  ) {
    super(message, 'VALIDATION_ERROR', 400, true);
  }
}

/**
 * Validate request body against a Zod schema
 */
export async function validateBody<T>(
  request: Request,
  schema: z.ZodSchema<T>,
  options: ValidationOptions = {}
): Promise<T> {
  try {
    const body = await request.json();
    
    const result = schema.safeParse(body);
    
    if (!result.success) {
      throw new ValidationError(
        'Validation failed',
        result.error.issues
      );
    }
    
    return result.data;
  } catch (error) {
    if (error instanceof ValidationError) {
      throw error;
    }
    
    if (error instanceof SyntaxError) {
      throw new AppError('Invalid JSON in request body', 'INVALID_JSON', 400);
    }
    
    throw new AppError('Failed to validate request', 'VALIDATION_ERROR', 400);
  }
}

/**
 * Validate query parameters against a Zod schema
 */
export function validateQuery<T>(
  request: Request,
  schema: z.ZodSchema<T>,
  options: ValidationOptions = {}
): T {
  const url = new URL(request.url);
  const params = Object.fromEntries(url.searchParams.entries());
  
  const result = schema.safeParse(params);
  
  if (!result.success) {
    throw new ValidationError(
      'Query parameter validation failed',
      result.error.issues
    );
  }
  
  return result.data;
}

/**
 * Validate route parameters against a Zod schema
 */
export function validateParams<T>(
  params: Record<string, string | undefined>,
  schema: z.ZodSchema<T>,
  options: ValidationOptions = {}
): T {
  const result = schema.safeParse(params);
  
  if (!result.success) {
    throw new ValidationError(
      'Route parameter validation failed',
      result.error.issues
    );
  }
  
  return result.data;
}

/**
 * Common validation schemas
 */
export const commonSchemas = {
  uuid: z.string().uuid(),
  email: z.string().email(),
  url: z.string().url(),
  dateString: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  
  pagination: z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
    sort: z.string().optional(),
    order: z.enum(['asc', 'desc']).default('asc')
  }),
  
  idParam: z.object({
    id: z.string().uuid()
  })
};

/**
 * Sanitize string input
 */
export function sanitizeString(input: string): string {
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .replace(/[\x00-\x1F\x7F]/g, ''); // Remove control characters
}

/**
 * Sanitize object recursively
 */
export function sanitizeObject<T extends Record<string, unknown>>(obj: T): T {
  const sanitized: any = {};
  
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string') {
      sanitized[key] = sanitizeString(value);
    } else if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      sanitized[key] = sanitizeObject(value as Record<string, unknown>);
    } else if (Array.isArray(value)) {
      sanitized[key] = value.map(item => 
        typeof item === 'string' ? sanitizeString(item) : item
      );
    } else {
      sanitized[key] = value;
    }
  }
  
  return sanitized;
}

/**
 * Create a validation middleware for API routes
 */
export function createValidationMiddleware<T>(
  schema: z.ZodSchema<T>,
  type: 'body' | 'query' | 'params' = 'body'
) {
  return async (request: Request, params?: Record<string, string | undefined>) => {
    switch (type) {
      case 'body':
        return validateBody(request, schema);
      case 'query':
        return validateQuery(request, schema);
      case 'params':
        if (!params) {
          throw new AppError('No params provided for validation', 'VALIDATION_ERROR', 400);
        }
        return validateParams(params, schema);
      default:
        throw new AppError('Invalid validation type', 'VALIDATION_ERROR', 400);
    }
  };
}