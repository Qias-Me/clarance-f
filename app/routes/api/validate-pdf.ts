/**
 * PDF Validation API Route
 *
 * This route handles PDF field mapping validation for the SF-86 form architecture.
 * It validates that form data can be properly mapped to PDF fields.
 */

import type { ActionFunctionArgs } from "react-router";
import type { ApplicantFormValues } from "../../../api/interfaces/formDefinition2.0";
import { clientPdfService2 } from "../../../api/service/clientPdfService";

export async function action({ request }: ActionFunctionArgs) {
  if (request.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    // Parse the form data from the request
    const formData: ApplicantFormValues = await request.json();

    console.log("Validating PDF field mapping for SF-86 form data...");

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

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (error) {
    console.error("Error validating PDF mapping:", error);

    return new Response(
      JSON.stringify({
        success: false,
        error: `PDF validation failed: ${
          error instanceof Error ? error.message : String(error)
        }`,
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}

/**
 * Generate recommendations based on validation results
 */
function generateRecommendations(invalidFields: any[], stats: any): string[] {
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
export async function options() {
  return new Response(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}
