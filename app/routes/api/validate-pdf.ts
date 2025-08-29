/**
 * PDF Validation API Route
 *
 * This route handles PDF field mapping validation for the SF-86 form architecture.
 * It validates that form data can be properly mapped to PDF fields.
 */

import type { ActionFunctionArgs } from "react-router";
import type { ApplicantFormValues } from "../../../api/interfaces/formDefinition2.0";
import { clientPdfService2 } from "api/service/clientPdfService2.0";
import { logger } from "../../services/Logger";
import { AppError } from "../../utils/error-handler";
import { rateLimitMiddleware } from "../../../api/middleware/rateLimiter";
import { getCorsHeaders } from "../../../api/middleware/cors";

export async function action({ request }: ActionFunctionArgs) {
  // Apply rate limiting
  const rateLimitResponse = await rateLimitMiddleware(request, {
    windowMs: 60 * 1000,
    maxRequests: 50 // 50 validation requests per minute
  });
  
  if (rateLimitResponse) {
    return rateLimitResponse;
  }

  if (request.method !== "POST") {
    throw new AppError(
      'Method not allowed',
      'METHOD_NOT_ALLOWED',
      405
    );
  }

  try {
    // Parse the form data from the request
    const formData: ApplicantFormValues = await request.json();

    logger.info('Validating PDF field mapping', 'ValidatePDF', {
      requestId: crypto.randomUUID(),
      dataSize: JSON.stringify(formData).length
    });

    // Validate field mapping using our PDF service
    const validationResults = await clientPdfService2.validateFieldMapping(formData);
    const stats = clientPdfService2.getFieldMappingStats();

    // Analyze validation results
    const invalidFields = validationResults.filter(r => !r.isValid);
    const validFields = validationResults.filter(r => r.isValid);

    const response = {
      success: true,
      validation: {
        isValid: invalidFields.length === 0,
        totalFields: validationResults.length,
        validFields: validFields.length,
        invalidFields: invalidFields.length,
        validationResults: validationResults.map(r => ({
          fieldName: r.fieldName,
          fieldId: r.fieldId,
          isValid: r.isValid,
          expectedValue: r.expectedValue,
          actualValue: r.actualValue,
          error: r.error
        }))
      },
      statistics: {
        totalPdfFields: stats.totalFields,
        mappedFields: stats.mappedFields,
        unmappedFields: stats.unmappedFields,
        mappingAccuracy: stats.totalFields > 0 ? (stats.mappedFields / stats.totalFields) * 100 : 0
      },
      recommendations: generateRecommendations(invalidFields, stats)
    };

    const corsHeaders = getCorsHeaders(request);
    
    return new Response(JSON.stringify(response), {
      status: 200,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
        "X-Request-ID": crypto.randomUUID(),
        "Cache-Control": "private, no-cache"
      },
    });
  } catch (error) {
    logger.error('PDF validation failed', error as Error, 'ValidatePDF');

    return new Response(
      JSON.stringify({
        success: false,
        error: {
          message: error instanceof AppError ? error.message : 'An error occurred during validation',
          code: error instanceof AppError ? error.code : 'VALIDATION_ERROR',
          requestId: crypto.randomUUID()
        },
        timestamp: new Date().toISOString()
      }),
      {
        status: error instanceof AppError ? error.statusCode : 500,
        headers: {
          ...getCorsHeaders(request),
          "Content-Type": "application/json"
        },
      }
    );
  }
}

/**
 * Generate recommendations based on validation results
 */
interface ValidationResult {
  fieldName: string;
  fieldId: string;
  isValid: boolean;
  expectedValue?: unknown;
  actualValue?: unknown;
  error?: string;
}

interface FieldMappingStats {
  totalFields: number;
  mappedFields: number;
  unmappedFields: number;
}

function generateRecommendations(invalidFields: ValidationResult[], stats: FieldMappingStats): string[] {
  const recommendations: string[] = [];

  if (invalidFields.length > 0) {
    recommendations.push(`${invalidFields.length} fields failed validation. Review field values and formats.`);
  }

  if (stats.unmappedFields > 0) {
    recommendations.push(`${stats.unmappedFields} PDF fields are not mapped. Consider implementing additional form sections.`);
  }

  const mappingAccuracy = stats.totalFields > 0 ? (stats.mappedFields / stats.totalFields) * 100 : 0;
  if (mappingAccuracy < 95) {
    recommendations.push(`PDF mapping accuracy is ${mappingAccuracy.toFixed(1)}%. Target 95%+ for production.`);
  }

  if (recommendations.length === 0) {
    recommendations.push("PDF validation passed successfully. Form is ready for PDF generation.");
  }

  return recommendations;
}

// Handle OPTIONS requests for CORS
export async function options({ request }: ActionFunctionArgs) {
  const corsHeaders = getCorsHeaders(request);
  
  return new Response(null, {
    status: 200,
    headers: corsHeaders
  });
}
