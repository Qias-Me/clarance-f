/**
 * SCALABLE FIELD VALIDATION SERVICE
 * 
 * This service provides validation and debugging tools for SF-86 form field mapping
 * across all 30 sections. It validates field IDs against the sections-references
 * data to ensure accurate PDF field mapping.
 */

interface SectionReference {
  metadata: {
    sectionId: number;
    sectionName: string;
    totalFields: number;
  };
  fields: Array<{
    id: string;
    name: string;
    type: string;
    page: number;
    label: string;
    options?: string[];
  }>;
}

interface FieldValidationResult {
  isValid: boolean;
  expectedFieldName?: string;
  actualFieldName: string;
  sectionId: number;
  issues: string[];
  suggestions: string[];
}

interface SectionValidationSummary {
  sectionId: number;
  sectionName: string;
  totalFields: number;
  validFields: number;
  invalidFields: number;
  validationRate: number;
  issues: string[];
}

export class FieldValidationService {
  private sectionReferences: Map<number, SectionReference> = new Map();
  private fieldNameIndex: Map<string, { sectionId: number; fieldData: any }> = new Map();
  private fieldIdIndex: Map<string, { sectionId: number; fieldData: any }> = new Map();

  constructor() {
    this.initializeReferences();
  }

  /**
   * Initialize section references from the sections-references directory
   * This loads the source of truth for all 30 sections
   */
  private async initializeReferences(): Promise<void> {
    try {
      // Load section references dynamically
      for (let sectionId = 1; sectionId <= 30; sectionId++) {
        try {
          const sectionData = await import(`../../api/sections-references/section-${sectionId}.json`);
          this.sectionReferences.set(sectionId, sectionData);
          
          // Build field indexes for fast lookup
          sectionData.fields.forEach((field: any) => {
            this.fieldNameIndex.set(field.name, { sectionId, fieldData: field });
            this.fieldIdIndex.set(field.id, { sectionId, fieldData: field });
          });
        } catch (error) {
          console.warn(`Could not load section ${sectionId} reference data:`, error);
        }
      }
      
      console.log(`✅ Field validation service initialized with ${this.sectionReferences.size} sections`);
    } catch (error) {
      console.error('Failed to initialize field validation service:', error);
    }
  }

  /**
   * Validate a single field ID against the reference data
   */
  validateField(fieldId: string, sectionId: number): FieldValidationResult {
    const result: FieldValidationResult = {
      isValid: false,
      actualFieldName: fieldId,
      sectionId,
      issues: [],
      suggestions: []
    };

    const sectionRef = this.sectionReferences.get(sectionId);
    if (!sectionRef) {
      result.issues.push(`Section ${sectionId} reference data not found`);
      return result;
    }

    // Check if field ID exists in reference data
    const fieldLookup = this.fieldIdIndex.get(fieldId) || this.fieldNameIndex.get(fieldId);
    
    if (fieldLookup) {
      if (fieldLookup.sectionId === sectionId) {
        result.isValid = true;
        result.expectedFieldName = fieldLookup.fieldData.name;
      } else {
        result.issues.push(`Field belongs to section ${fieldLookup.sectionId}, not ${sectionId}`);
        result.suggestions.push(`Move field to section ${fieldLookup.sectionId}`);
      }
    } else {
      result.issues.push(`Field ID not found in reference data`);
      
      // Provide suggestions based on similar field names
      const suggestions = this.findSimilarFields(fieldId, sectionId);
      result.suggestions.push(...suggestions);
    }

    return result;
  }

  /**
   * Validate all fields for a specific section
   */
  validateSection(sectionId: number, fieldIds: string[]): SectionValidationSummary {
    const sectionRef = this.sectionReferences.get(sectionId);
    const summary: SectionValidationSummary = {
      sectionId,
      sectionName: sectionRef?.metadata.sectionName || `Section ${sectionId}`,
      totalFields: fieldIds.length,
      validFields: 0,
      invalidFields: 0,
      validationRate: 0,
      issues: []
    };

    fieldIds.forEach(fieldId => {
      const validation = this.validateField(fieldId, sectionId);
      if (validation.isValid) {
        summary.validFields++;
      } else {
        summary.invalidFields++;
        summary.issues.push(`${fieldId}: ${validation.issues.join(', ')}`);
      }
    });

    summary.validationRate = (summary.validFields / summary.totalFields) * 100;
    return summary;
  }

  /**
   * Find similar field names to help with debugging
   */
  private findSimilarFields(fieldId: string, sectionId: number): string[] {
    const suggestions: string[] = [];
    const sectionRef = this.sectionReferences.get(sectionId);
    
    if (!sectionRef) return suggestions;

    // Look for fields with similar patterns
    const fieldPattern = fieldId.replace(/\[\d+\]/g, '[X]'); // Normalize indices
    
    sectionRef.fields.forEach(field => {
      const refPattern = field.name.replace(/\[\d+\]/g, '[X]');
      if (refPattern === fieldPattern) {
        suggestions.push(`Try: ${field.name} (ID: ${field.id})`);
      }
    });

    return suggestions.slice(0, 3); // Limit to top 3 suggestions
  }

  /**
   * Get expected field pattern for a section
   */
  getExpectedFieldPattern(sectionId: number): string | null {
    const sectionRef = this.sectionReferences.get(sectionId);
    if (!sectionRef || sectionRef.fields.length === 0) return null;

    // Extract common pattern from first field
    const firstField = sectionRef.fields[0].name;
    const match = firstField.match(/^(form1\[0\]\.Section[^\.]+)/);
    return match ? match[1] : null;
  }

  /**
   * Generate comprehensive validation report for debugging
   */
  generateValidationReport(formData: Map<string, any>): {
    overallValidation: number;
    sectionSummaries: SectionValidationSummary[];
    criticalIssues: string[];
    recommendations: string[];
  } {
    const sectionSummaries: SectionValidationSummary[] = [];
    const criticalIssues: string[] = [];
    const recommendations: string[] = [];

    // Group fields by section
    const fieldsBySection = new Map<number, string[]>();
    
    formData.forEach((value, fieldId) => {
      const sectionMatch = fieldId.match(/Section(\d+)/);
      if (sectionMatch) {
        const sectionId = parseInt(sectionMatch[1]);
        if (!fieldsBySection.has(sectionId)) {
          fieldsBySection.set(sectionId, []);
        }
        fieldsBySection.get(sectionId)!.push(fieldId);
      }
    });

    // Validate each section
    fieldsBySection.forEach((fieldIds, sectionId) => {
      const summary = this.validateSection(sectionId, fieldIds);
      sectionSummaries.push(summary);

      if (summary.validationRate < 50) {
        criticalIssues.push(`Section ${sectionId} has low validation rate: ${summary.validationRate.toFixed(1)}%`);
      }

      if (summary.invalidFields > 0) {
        const pattern = this.getExpectedFieldPattern(sectionId);
        if (pattern) {
          recommendations.push(`Section ${sectionId} should use pattern: ${pattern}`);
        }
      }
    });

    const overallValidation = sectionSummaries.reduce((acc, s) => acc + s.validationRate, 0) / sectionSummaries.length;

    return {
      overallValidation,
      sectionSummaries,
      criticalIssues,
      recommendations
    };
  }
}

// Export singleton instance
export const fieldValidationService = new FieldValidationService();
