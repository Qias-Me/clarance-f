/**
 * CORS Middleware Configuration
 * 
 * Provides secure CORS handling for API routes with environment-specific settings
 */

export interface CorsOptions {
  origin: string | string[] | ((origin: string) => boolean);
  methods?: string[];
  allowedHeaders?: string[];
  exposedHeaders?: string[];
  credentials?: boolean;
  maxAge?: number;
}

const DEFAULT_ALLOWED_ORIGINS = {
  development: ['http://localhost:3000', 'http://localhost:5173'],
  staging: ['https://staging.sf86form.gov'],
  production: ['https://sf86form.gov']
};

export function getCorsHeaders(
  request: Request,
  options?: Partial<CorsOptions>
): HeadersInit {
  const env = process.env.NODE_ENV || 'development';
  const origin = request.headers.get('origin') || '';
  
  const defaultOptions: CorsOptions = {
    origin: DEFAULT_ALLOWED_ORIGINS[env as keyof typeof DEFAULT_ALLOWED_ORIGINS] || [],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-ID'],
    exposedHeaders: ['X-Request-ID', 'X-Response-Time'],
    credentials: true,
    maxAge: 86400 // 24 hours
  };

  const mergedOptions = { ...defaultOptions, ...options };
  
  // Check if origin is allowed
  const isAllowedOrigin = checkOrigin(origin, mergedOptions.origin);
  
  if (!isAllowedOrigin && env === 'production') {
    // In production, don't add CORS headers for disallowed origins
    return {};
  }

  const headers: HeadersInit = {
    'Access-Control-Allow-Origin': isAllowedOrigin ? origin : 'null',
    'Access-Control-Allow-Methods': mergedOptions.methods?.join(', ') || '',
    'Access-Control-Allow-Headers': mergedOptions.allowedHeaders?.join(', ') || '',
    'Access-Control-Expose-Headers': mergedOptions.exposedHeaders?.join(', ') || '',
    'Access-Control-Max-Age': String(mergedOptions.maxAge),
    'Vary': 'Origin'
  };

  if (mergedOptions.credentials) {
    headers['Access-Control-Allow-Credentials'] = 'true';
  }

  return headers;
}

function checkOrigin(
  origin: string,
  allowedOrigin: string | string[] | ((origin: string) => boolean)
): boolean {
  if (typeof allowedOrigin === 'function') {
    return allowedOrigin(origin);
  }
  
  if (typeof allowedOrigin === 'string') {
    return origin === allowedOrigin;
  }
  
  if (Array.isArray(allowedOrigin)) {
    return allowedOrigin.includes(origin);
  }
  
  return false;
}

export function createCorsResponse(request: Request, options?: Partial<CorsOptions>): Response {
  return new Response(null, {
    status: 200,
    headers: getCorsHeaders(request, options)
  });
}