/**
 * SF-86 Sectionizer - Enhanced PDF Validation
 * 
 * This utility provides field enrichment and validation functionality
 * to enhance PDF field data with page and label heuristics.
 */

import type { FieldMetadata, EnhancedField } from '../src/sectionizer/types.js';
import * as bridge from '../src/sectionizer/utils/bridgeAdapter.js';
import { detectSectionFromFieldValue } from './page-categorization-bridge.js';

/**
 * Enhances field metadata with validation and heuristics
 */
export class EnhancedPdfValidator {
  /**
   * Enriches a batch of fields with validation and heuristics
   * @param fields Array of field metadata to enrich
   * @returns Array of enhanced fields
   */
  public enrichFields(fields: FieldMetadata[]): EnhancedField[] {
    return fields.map(field => this.enrichField(field));
  }
  
  /**
   * Enriches a single field with validation and heuristics
   * @param field Field metadata to enrich
   * @returns Enhanced field
   */
  private enrichField(field: FieldMetadata): EnhancedField {
    // Start with basic field data
    const enhanced: EnhancedField = { 
      ...field,
      confidence: 0 // Initialize confidence
    };
    
    try {
      // Apply bridge heuristics - since the bridge doesn't have an explicit
      // enrichFieldWithLabelHeuristics method, we'll use the available methods
      
      // Try to get section information from the bridge
      const sectionInfo = bridge.extractSectionInfoFromName(field.name);
      if (sectionInfo) {
        enhanced.section = sectionInfo.section;
        enhanced.subsection = sectionInfo.subsection;
        enhanced.entryIndex = sectionInfo.entry;
        enhanced.confidence = sectionInfo.confidence || 0.7;
      }
      
      // If no section info found from the name, try page-based lookup
      if (!enhanced.section && field.page > 0) {
        // Create a proper PDFField object with the minimal required properties
        const pdfField = {
          id: field.id,
          name: field.name,
          page: field.page,
          label: field.label
        };

        // Use applyPageCategorization with the full field object
        const result = bridge.applyPageCategorization(pdfField);
        if (result && result.section > 0) {
          enhanced.section = result.section;
          enhanced.confidence = result.confidence;
        }
      }
      
      // Try to extract section info from field value if available and it's a string
      if (field.value && typeof field.value === 'string' && (!enhanced.section || (enhanced.confidence !== undefined && enhanced.confidence < 0.7))) {
        const valueResult = detectSectionFromFieldValue(field.value);
        if (valueResult && valueResult.section > 0) {
          enhanced.section = valueResult.section;
          enhanced.subsection = valueResult.subsection;
          enhanced.entryIndex = valueResult.entry;
          enhanced.confidence = valueResult.confidence;
        }
      }
      
      // Try fallback categorization if still no section or low confidence
      if (!enhanced.section || (enhanced.confidence !== undefined && enhanced.confidence < 0.6)) {
        // Create a proper PDFField object with all available properties
        // Use type assertion to handle potentially missing properties in the type definition
        const pdfField: any = {
          id: field.id,
          name: field.name,
          page: field.page || 0,
          label: field.label,
          value: field.value
        };
        
        // Add coordinates if available in any format
        // This safely handles properties that might exist at runtime but not in type definition
        if ('rect' in field && field.rect) {
          pdfField.rect = field.rect;
        } else if ('x' in field && 'y' in field) {
          pdfField.rect = {
            x: Number((field as any).x) || 0,
            y: Number((field as any).y) || 0,
            width: Number((field as any).width) || 0,
            height: Number((field as any).height) || 0
          };
        }

        // Use advancedCategorization which implements multidimensional analysis
        // with several fallback techniques built in
        const advancedResult = bridge.advancedCategorization(pdfField);
        if (advancedResult && advancedResult.section > 0) {
          enhanced.section = advancedResult.section;
          enhanced.subsection = advancedResult.subsection;
          enhanced.entryIndex = advancedResult.entry;
          enhanced.confidence = advancedResult.confidence;
        }
      }
      
      // If field has a label, extract potential section/subsection hints
      if (field.label) {
        const sectionMatch = field.label.match(/section\s*(\d+)([a-z])?/i);
        if (sectionMatch) {
          // Only use label-based section if confidence is currently low or missing
          if (!enhanced.section || (enhanced.confidence !== undefined && enhanced.confidence < 0.5)) {
            enhanced.section = parseInt(sectionMatch[1]);
            if (sectionMatch[2]) {
              enhanced.subsection = sectionMatch[2].toUpperCase();
            }
            enhanced.confidence = 0.75; // Higher confidence for explicit section label
          }
        }
      }
    } catch (error) {
      console.warn(`Error enriching field ${field.name}:`, error);
    }
    
    return enhanced;
  }
  
  /**
   * Validates a batch of fields for consistency
   * @param fields Array of fields to validate
   * @returns Validation report
   */
  public validateFields(fields: FieldMetadata[]): {
    valid: boolean;
    duplicateIds: string[];
    missingPages: string[];
    missingLabels: string[];
    report: string;
  } {
    const ids = new Set<string>();
    const duplicateIds: string[] = [];
    const missingPages: string[] = [];
    const missingLabels: string[] = [];
    
    for (const field of fields) {
      // Check for duplicate IDs
      if (ids.has(field.id)) {
        duplicateIds.push(field.id);
      } else {
        ids.add(field.id);
      }
      
      // Check for missing page numbers
      if (!field.page || field.page < 1) {
        missingPages.push(field.id);
      }
      
      // Check for missing labels on important fields
      if (!field.label && field.type !== 'PDFCheckBox' && field.type !== 'PDFSignatureField') {
        missingLabels.push(field.id);
      }
    }
    
    // Generate validation report
    const valid = duplicateIds.length === 0 && missingPages.length === 0;
    const report = `Validation Report:\n` +
                  `- Total fields: ${fields.length}\n` +
                  `- Duplicate IDs: ${duplicateIds.length}\n` +
                  `- Missing page numbers: ${missingPages.length}\n` +
                  `- Missing labels: ${missingLabels.length}\n` +
                  `- Valid: ${valid ? 'Yes' : 'No'}`;
    
    return {
      valid,
      duplicateIds,
      missingPages,
      missingLabels,
      report
    };
  }
  
  /**
   * Generates a detailed quality report for the field data
   * @param fields Array of enhanced fields
   * @returns Detailed quality report
   */
  public generateQualityReport(fields: EnhancedField[]): {
    totalFields: number;
    sectionCoverage: Record<string, { count: number, percentage: number, confidence: number }>;
    confidenceDistribution: Record<string, number>;
    report: string;
  } {
    const totalFields = fields.length;
    const sectionCoverage: Record<string, { count: number, percentage: number, confidence: number }> = {};
    const confidenceDistribution: Record<string, number> = {
      'high (0.8-1.0)': 0,
      'medium (0.5-0.8)': 0,
      'low (0-0.5)': 0,
      'unknown': 0
    };
    
    // Calculate section coverage and confidence distribution
    for (const field of fields) {
      const sectionKey = field.section ? String(field.section) : 'unknown';
      
      // Update section coverage
      if (!sectionCoverage[sectionKey]) {
        sectionCoverage[sectionKey] = { count: 0, percentage: 0, confidence: 0 };
      }
      sectionCoverage[sectionKey].count++;
      sectionCoverage[sectionKey].confidence += (field.confidence || 0);
      
      // Update confidence distribution
      const confidence = field.confidence || 0;
      if (confidence >= 0.8) {
        confidenceDistribution['high (0.8-1.0)']++;
      } else if (confidence >= 0.5) {
        confidenceDistribution['medium (0.5-0.8)']++;
      } else if (confidence > 0) {
        confidenceDistribution['low (0-0.5)']++;
      } else {
        confidenceDistribution['unknown']++;
      }
    }
    
    // Calculate percentages and average confidence
    for (const section of Object.keys(sectionCoverage)) {
      sectionCoverage[section].percentage = (sectionCoverage[section].count / totalFields) * 100;
      sectionCoverage[section].confidence = sectionCoverage[section].count > 0 
        ? sectionCoverage[section].confidence / sectionCoverage[section].count 
        : 0;
    }
    
    // Generate quality report
    const reportLines = [
      'Field Quality Report:',
      `- Total fields: ${totalFields}`,
      '- Section Coverage:',
      ...Object.entries(sectionCoverage)
        .sort(([a], [b]) => a.localeCompare(b, undefined, { numeric: true }))
        .map(([section, data]) => 
          `  - Section ${section}: ${data.count} fields (${data.percentage.toFixed(2)}%), avg. confidence: ${data.confidence.toFixed(2)}`
        ),
      '- Confidence Distribution:',
      ...Object.entries(confidenceDistribution)
        .map(([level, count]) => 
          `  - ${level}: ${count} fields (${((count / totalFields) * 100).toFixed(2)}%)`
        )
    ];
    
    return {
      totalFields,
      sectionCoverage,
      confidenceDistribution,
      report: reportLines.join('\n')
    };
  }
}

// Export a singleton instance
export const validator = new EnhancedPdfValidator(); 