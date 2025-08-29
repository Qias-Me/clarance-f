/**
 * Rate Limiting Middleware
 * 
 * Provides API rate limiting to prevent abuse
 */

import { AppError } from '../../app/utils/error-handler';

interface RateLimitOptions {
  windowMs?: number; // Time window in milliseconds
  maxRequests?: number; // Max requests per window
  keyGenerator?: (request: Request) => string; // Generate unique key per client
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
  message?: string;
}

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

class RateLimiter {
  private store = new Map<string, RateLimitEntry>();
  private cleanupInterval: NodeJS.Timeout;

  constructor(private options: Required<RateLimitOptions>) {
    // Cleanup expired entries every minute
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, 60000);
  }

  async checkLimit(request: Request): Promise<void> {
    const key = this.options.keyGenerator(request);
    const now = Date.now();
    
    let entry = this.store.get(key);
    
    if (!entry || entry.resetTime <= now) {
      // Create new entry or reset expired one
      entry = {
        count: 1,
        resetTime: now + this.options.windowMs
      };
      this.store.set(key, entry);
      return;
    }
    
    entry.count++;
    
    if (entry.count > this.options.maxRequests) {
      const retryAfter = Math.ceil((entry.resetTime - now) / 1000);
      
      throw new RateLimitError(
        this.options.message,
        retryAfter,
        entry.resetTime
      );
    }
    
    this.store.set(key, entry);
  }

  getRemainingRequests(request: Request): number {
    const key = this.options.keyGenerator(request);
    const entry = this.store.get(key);
    
    if (!entry || entry.resetTime <= Date.now()) {
      return this.options.maxRequests;
    }
    
    return Math.max(0, this.options.maxRequests - entry.count);
  }

  getResetTime(request: Request): number {
    const key = this.options.keyGenerator(request);
    const entry = this.store.get(key);
    
    if (!entry || entry.resetTime <= Date.now()) {
      return Date.now() + this.options.windowMs;
    }
    
    return entry.resetTime;
  }

  reset(request: Request): void {
    const key = this.options.keyGenerator(request);
    this.store.delete(key);
  }

  private cleanup(): void {
    const now = Date.now();
    
    for (const [key, entry] of this.store.entries()) {
      if (entry.resetTime <= now) {
        this.store.delete(key);
      }
    }
  }

  destroy(): void {
    clearInterval(this.cleanupInterval);
    this.store.clear();
  }
}

export class RateLimitError extends AppError {
  constructor(
    message: string,
    public retryAfter: number,
    public resetTime: number
  ) {
    super(message, 'RATE_LIMIT_EXCEEDED', 429, true);
  }
}

// Default key generators
export const keyGenerators = {
  ip: (request: Request): string => {
    return request.headers.get('cf-connecting-ip') || 
           request.headers.get('x-forwarded-for') || 
           request.headers.get('x-real-ip') || 
           'unknown';
  },
  
  user: (request: Request): string => {
    // Extract user ID from authorization header or session
    const auth = request.headers.get('authorization');
    if (auth && auth.startsWith('Bearer ')) {
      // In production, decode JWT to get user ID
      return auth.substring(7, 20); // Simplified for example
    }
    return keyGenerators.ip(request);
  },
  
  apiKey: (request: Request): string => {
    return request.headers.get('x-api-key') || keyGenerators.ip(request);
  }
};

// Rate limiter instances
const limiters = new Map<string, RateLimiter>();

/**
 * Create or get a rate limiter instance
 */
export function getRateLimiter(
  name: string,
  options?: Partial<RateLimitOptions>
): RateLimiter {
  if (!limiters.has(name)) {
    const defaultOptions: Required<RateLimitOptions> = {
      windowMs: 60 * 1000, // 1 minute
      maxRequests: 60, // 60 requests per minute
      keyGenerator: keyGenerators.ip,
      skipSuccessfulRequests: false,
      skipFailedRequests: false,
      message: 'Too many requests, please try again later'
    };
    
    limiters.set(name, new RateLimiter({ ...defaultOptions, ...options } as Required<RateLimitOptions>));
  }
  
  return limiters.get(name)!;
}

/**
 * Rate limit middleware for API routes
 */
export async function rateLimitMiddleware(
  request: Request,
  options?: Partial<RateLimitOptions>
): Promise<Response | null> {
  const limiter = getRateLimiter('default', options);
  
  try {
    await limiter.checkLimit(request);
    
    // Add rate limit headers to response
    const headers = new Headers();
    headers.set('X-RateLimit-Limit', String(options?.maxRequests || 60));
    headers.set('X-RateLimit-Remaining', String(limiter.getRemainingRequests(request)));
    headers.set('X-RateLimit-Reset', String(limiter.getResetTime(request)));
    
    return null; // Continue to next middleware
  } catch (error) {
    if (error instanceof RateLimitError) {
      return new Response(
        JSON.stringify({
          error: error.message,
          retryAfter: error.retryAfter
        }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'Retry-After': String(error.retryAfter),
            'X-RateLimit-Limit': String(options?.maxRequests || 60),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': String(error.resetTime)
          }
        }
      );
    }
    
    throw error;
  }
}

/**
 * Cleanup all rate limiters (call on app shutdown)
 */
export function cleanupRateLimiters(): void {
  for (const limiter of limiters.values()) {
    limiter.destroy();
  }
  limiters.clear();
}