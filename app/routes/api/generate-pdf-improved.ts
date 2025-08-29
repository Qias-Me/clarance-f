/**
 * PDF Template API Route - Improved Version
 * 
 * Secure PDF template serving with proper error handling, logging, and security
 */

import type { LoaderFunctionArgs } from "react-router";
import { getCorsHeaders } from "../../../api/middleware/cors";
import { rateLimitMiddleware } from "../../../api/middleware/rateLimiter";
import { logger } from "../../services/Logger";
import { AppError } from "../../utils/error-handler";

const PDF_CACHE_DURATION = 3600; // 1 hour
const PDF_MAX_SIZE = 10 * 1024 * 1024; // 10MB max

export async function loader({ request, context }: LoaderFunctionArgs) {
  // Apply rate limiting
  const rateLimitResponse = await rateLimitMiddleware(request, {
    windowMs: 60 * 1000,
    maxRequests: 30 // 30 requests per minute for PDF loading
  });
  
  if (rateLimitResponse) {
    return rateLimitResponse;
  }

  const requestId = crypto.randomUUID();
  const startTime = Date.now();
  
  try {
    logger.info('PDF template request', 'GeneratePDF', { 
      requestId, 
      url: request.url 
    });

    // Validate request method
    if (request.method !== 'GET') {
      throw new AppError(
        'Method not allowed',
        'METHOD_NOT_ALLOWED',
        405
      );
    }

    // Access the ASSETS binding from the Cloudflare environment
    const assets = context?.cloudflare?.env?.ASSETS;

    if (!assets) {
      logger.error('ASSETS binding not available', undefined, 'GeneratePDF');
      throw new AppError(
        'Service configuration error',
        'ASSETS_NOT_CONFIGURED',
        503
      );
    }

    // Create a request for the clean.pdf file
    const assetRequest = new Request(new URL("/clean.pdf", request.url));
    const response = await assets.fetch(assetRequest);

    if (!response.ok) {
      if (response.status === 404) {
        throw new AppError(
          'PDF template not found',
          'PDF_NOT_FOUND',
          404
        );
      }
      
      throw new AppError(
        'Failed to load PDF template',
        'PDF_LOAD_ERROR',
        response.status
      );
    }

    const pdfBytes = await response.arrayBuffer();
    
    // Validate PDF size
    if (pdfBytes.byteLength > PDF_MAX_SIZE) {
      throw new AppError(
        'PDF template exceeds maximum size',
        'PDF_TOO_LARGE',
        413
      );
    }

    const duration = Date.now() - startTime;
    logger.info('PDF template loaded successfully', 'GeneratePDF', {
      requestId,
      size: pdfBytes.byteLength,
      duration
    });

    // Get CORS headers
    const corsHeaders = getCorsHeaders(request);

    // Return the PDF with security headers
    return new Response(pdfBytes, {
      status: 200,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/pdf',
        'Content-Length': String(pdfBytes.byteLength),
        'Cache-Control': `public, max-age=${PDF_CACHE_DURATION}, immutable`,
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'DENY',
        'X-Request-ID': requestId,
        'X-Response-Time': `${duration}ms`
      }
    });
  } catch (error) {
    const duration = Date.now() - startTime;
    
    if (error instanceof AppError) {
      logger.warn('PDF request failed', 'GeneratePDF', {
        requestId,
        error: error.message,
        code: error.code,
        duration
      });
      
      return createErrorResponse(error, requestId, request);
    }
    
    // Log unexpected errors without exposing details
    logger.error('Unexpected error in PDF generation', error, 'GeneratePDF');
    
    const genericError = new AppError(
      'An error occurred while loading the PDF template',
      'INTERNAL_ERROR',
      500
    );
    
    return createErrorResponse(genericError, requestId, request);
  }
}

function createErrorResponse(
  error: AppError,
  requestId: string,
  request: Request
): Response {
  const corsHeaders = getCorsHeaders(request);
  
  return new Response(
    JSON.stringify({
      error: {
        message: error.message,
        code: error.code,
        requestId
      },
      timestamp: new Date().toISOString()
    }),
    {
      status: error.statusCode,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
        'X-Request-ID': requestId
      }
    }
  );
}

// Handle OPTIONS requests for CORS
export async function options({ request }: LoaderFunctionArgs) {
  const corsHeaders = getCorsHeaders(request);
  
  return new Response(null, {
    status: 200,
    headers: corsHeaders
  });
}