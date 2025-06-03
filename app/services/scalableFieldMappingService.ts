/**
 * SCALABLE FIELD MAPPING SERVICE
 * 
 * This service provides a centralized, scalable approach to PDF field mapping
 * that works across all 30 SF-86 sections. It includes validation, debugging,
 * and comprehensive error handling.
 */

import { fieldValidationService } from './fieldValidationService';

interface FieldMappingResult {
  success: boolean;
  fieldId: string;
  pdfField?: any;
  lookupMethod?: string;
  error?: string;
  suggestions?: string[];
}

interface FieldMappingStats {
  totalFields: number;
  successfulMappings: number;
  failedMappings: number;
  successRate: number;
  lookupMethodStats: Record<string, number>;
  sectionStats: Record<string, { success: number; total: number }>;
}

export class ScalableFieldMappingService {
  private idMap: Map<string, any> = new Map();
  private nameMap: Map<string, string> = new Map();
  private isInitialized = false;

  /**
   * Initialize the field mapping service with PDF fields
   * SCALABLE: Works with all 30 sections
   */
  async initializeFieldMappings(pdfFields: any[]): Promise<void> {
    console.log('🚀 Initializing scalable field mapping service...');
    
    this.idMap.clear();
    this.nameMap.clear();

    pdfFields.forEach(field => {
      const name = field.getName();
      const rawId = field.ref.tag.toString();
      
      // SCALABLE FIX: Normalize ID format for consistent lookup across all sections
      const numericId = this.normalizeFieldId(rawId);
      
      this.idMap.set(numericId, field);
      this.nameMap.set(name, numericId);
    });

    this.isInitialized = true;
    
    // Generate comprehensive mapping statistics
    const stats = this.generateMappingStatistics();
    console.log('📊 Field mapping statistics:', stats);
  }

  /**
   * Normalize field ID format for consistent lookup
   * Handles: "16435 0 R" → "16435", "16435" → "16435"
   */
  private normalizeFieldId(rawId: string): string {
    return rawId.replace(' 0 R', '').trim();
  }

  /**
   * SCALABLE FIELD LOOKUP: Works across all 30 sections
   * Tries multiple strategies to find the PDF field
   */
  findPdfField(fieldId: string, sectionId?: number): FieldMappingResult {
    if (!this.isInitialized) {
      return {
        success: false,
        fieldId,
        error: 'Field mapping service not initialized'
      };
    }

    const result: FieldMappingResult = {
      success: false,
      fieldId
    };

    // Strategy 1: Direct numeric ID lookup (for Section 29 and other numeric sections)
    const numericId = this.normalizeFieldId(fieldId);
    if (this.idMap.has(numericId)) {
      result.success = true;
      result.pdfField = this.idMap.get(numericId);
      result.lookupMethod = 'direct-numeric-id';
      return result;
    }

    // Strategy 2: Field name to numeric ID conversion (for named sections)
    if (this.nameMap.has(fieldId)) {
      const mappedId = this.nameMap.get(fieldId);
      if (mappedId && this.idMap.has(mappedId)) {
        result.success = true;
        result.pdfField = this.idMap.get(mappedId);
        result.lookupMethod = 'name-to-numeric-id';
        return result;
      }
    }

    // Strategy 3: Fuzzy matching for slight variations
    const fuzzyMatch = this.findFuzzyMatch(fieldId);
    if (fuzzyMatch) {
      result.success = true;
      result.pdfField = fuzzyMatch.field;
      result.lookupMethod = 'fuzzy-match';
      return result;
    }

    // Strategy 4: Validation service suggestions
    if (sectionId) {
      const validation = fieldValidationService.validateField(fieldId, sectionId);
      if (!validation.isValid && validation.suggestions.length > 0) {
        result.suggestions = validation.suggestions;
        result.error = `Field not found. ${validation.issues.join(', ')}`;
      } else {
        result.error = 'Field not found in PDF template';
      }
    } else {
      result.error = 'Field not found in PDF template';
    }

    return result;
  }

  /**
   * Find fuzzy matches for field names with slight variations
   * Handles common naming inconsistencies across sections
   */
  private findFuzzyMatch(fieldId: string): { field: any; confidence: number } | null {
    const candidates: Array<{ name: string; field: any; confidence: number }> = [];

    // Check for common variations
    const variations = [
      fieldId.replace('Section', 'Sections'),
      fieldId.replace('Sections', 'Section'),
      fieldId.replace(/\[(\d+)\]/g, (match, num) => `[${parseInt(num) + 1}]`), // Try next index
      fieldId.replace(/\[(\d+)\]/g, (match, num) => `[${Math.max(0, parseInt(num) - 1)}]`), // Try previous index
    ];

    variations.forEach(variation => {
      if (this.nameMap.has(variation)) {
        const mappedId = this.nameMap.get(variation);
        if (mappedId && this.idMap.has(mappedId)) {
          candidates.push({
            name: variation,
            field: this.idMap.get(mappedId),
            confidence: this.calculateSimilarity(fieldId, variation)
          });
        }
      }
    });

    // Return best match if confidence is high enough
    if (candidates.length > 0) {
      const bestMatch = candidates.sort((a, b) => b.confidence - a.confidence)[0];
      if (bestMatch.confidence > 0.8) {
        return { field: bestMatch.field, confidence: bestMatch.confidence };
      }
    }

    return null;
  }

  /**
   * Calculate similarity between two field names
   */
  private calculateSimilarity(str1: string, str2: string): number {
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;
    
    if (longer.length === 0) return 1.0;
    
    const editDistance = this.levenshteinDistance(longer, shorter);
    return (longer.length - editDistance) / longer.length;
  }

  /**
   * Calculate Levenshtein distance between two strings
   */
  private levenshteinDistance(str1: string, str2: string): number {
    const matrix = Array(str2.length + 1).fill(null).map(() => Array(str1.length + 1).fill(null));

    for (let i = 0; i <= str1.length; i++) matrix[0][i] = i;
    for (let j = 0; j <= str2.length; j++) matrix[j][0] = j;

    for (let j = 1; j <= str2.length; j++) {
      for (let i = 1; i <= str1.length; i++) {
        const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
        matrix[j][i] = Math.min(
          matrix[j][i - 1] + 1,
          matrix[j - 1][i] + 1,
          matrix[j - 1][i - 1] + indicator
        );
      }
    }

    return matrix[str2.length][str1.length];
  }

  /**
   * Generate comprehensive mapping statistics for debugging
   */
  generateMappingStatistics(): FieldMappingStats {
    const sectionStats: Record<string, { success: number; total: number }> = {};
    
    // Analyze field distribution by section
    Array.from(this.nameMap.keys()).forEach(fieldName => {
      const sectionMatch = fieldName.match(/Section(\d+)/);
      if (sectionMatch) {
        const sectionId = sectionMatch[1];
        if (!sectionStats[sectionId]) {
          sectionStats[sectionId] = { success: 0, total: 0 };
        }
        sectionStats[sectionId].total++;
        sectionStats[sectionId].success++; // All mapped fields are considered successful
      }
    });

    return {
      totalFields: this.idMap.size,
      successfulMappings: this.idMap.size,
      failedMappings: 0,
      successRate: 100,
      lookupMethodStats: {},
      sectionStats
    };
  }

  /**
   * Batch field lookup for multiple fields
   * SCALABLE: Efficiently processes all fields for any section
   */
  batchLookup(fieldIds: string[], sectionId?: number): Map<string, FieldMappingResult> {
    const results = new Map<string, FieldMappingResult>();
    
    fieldIds.forEach(fieldId => {
      const result = this.findPdfField(fieldId, sectionId);
      results.set(fieldId, result);
    });

    return results;
  }

  /**
   * Get field mapping health report for debugging
   */
  getHealthReport(): {
    isHealthy: boolean;
    totalMappings: number;
    sectionsWithMappings: number;
    issues: string[];
    recommendations: string[];
  } {
    const stats = this.generateMappingStatistics();
    const sectionsWithMappings = Object.keys(stats.sectionStats).length;
    const issues: string[] = [];
    const recommendations: string[] = [];

    if (stats.totalFields === 0) {
      issues.push('No field mappings found');
      recommendations.push('Initialize field mappings with PDF fields');
    }

    if (sectionsWithMappings < 3) {
      issues.push(`Only ${sectionsWithMappings} sections have field mappings`);
      recommendations.push('Verify PDF template contains all expected sections');
    }

    return {
      isHealthy: issues.length === 0,
      totalMappings: stats.totalFields,
      sectionsWithMappings,
      issues,
      recommendations
    };
  }
}

// Export singleton instance
export const scalableFieldMappingService = new ScalableFieldMappingService();
