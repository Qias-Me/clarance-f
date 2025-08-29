/**
 * Universal Section Field Mapping Utility
 * 
 * Scalable field mapping system for all SF-86 sections
 * Provides consistent mapping between UI paths and PDF field IDs
 * 
 * @module utils/section-field-mapping
 */

import { getSectionLogger } from './section-logger';
import { SectionFieldMappingError } from './section-errors';

/**
 * Field mapping configuration for a section
 */
export interface SectionFieldMapping {
  sectionId: number;
  uiToPdf: Map<string, string>;
  pdfToUi: Map<string, string>;
  fieldMetadata: Map<string, FieldMetadata>;
  confidence: Map<string, number>;
}

/**
 * Field metadata
 */
export interface FieldMetadata {
  id: string;
  name: string;
  type: string;
  label?: string;
  required?: boolean;
  maxLength?: number;
  options?: string[];
  validation?: RegExp;
  page?: number;
  rect?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

/**
 * Universal field mapper for all sections
 */
export class UniversalFieldMapper {
  private sectionMappings: Map<number, SectionFieldMapping> = new Map();
  private cache: Map<string, string> = new Map();

  /**
   * Register field mappings for a section
   */
  registerSection(mapping: SectionFieldMapping): void {
    this.sectionMappings.set(mapping.sectionId, mapping);
    
    // Clear cache for this section
    this.clearSectionCache(mapping.sectionId);
    
    const logger = getSectionLogger(mapping.sectionId);
    logger.info('Field mappings registered', {
      action: 'register',
      metadata: {
        uiFieldCount: mapping.uiToPdf.size,
        pdfFieldCount: mapping.pdfToUi.size,
        metadataCount: mapping.fieldMetadata.size
      }
    });
  }

  /**
   * Map UI path to PDF field ID
   */
  mapUiToPdf(sectionId: number, uiPath: string): string {
    const cacheKey = `${sectionId}:ui:${uiPath}`;
    
    // Check cache first
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)!;
    }

    const mapping = this.sectionMappings.get(sectionId);
    if (!mapping) {
      throw new SectionFieldMappingError(
        sectionId,
        uiPath,
        undefined,
        'UI_TO_PDF'
      );
    }

    const pdfFieldId = mapping.uiToPdf.get(uiPath);
    if (!pdfFieldId) {
      // Try with variations (e.g., with/without .value suffix)
      const variations = this.generatePathVariations(uiPath);
      for (const variation of variations) {
        const found = mapping.uiToPdf.get(variation);
        if (found) {
          this.cache.set(cacheKey, found);
          return found;
        }
      }
      
      throw new SectionFieldMappingError(
        sectionId,
        uiPath,
        undefined,
        'UI_TO_PDF'
      );
    }

    this.cache.set(cacheKey, pdfFieldId);
    return pdfFieldId;
  }

  /**
   * Map PDF field ID to UI path
   */
  mapPdfToUi(sectionId: number, pdfFieldId: string): string {
    const cacheKey = `${sectionId}:pdf:${pdfFieldId}`;
    
    // Check cache first
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)!;
    }

    const mapping = this.sectionMappings.get(sectionId);
    if (!mapping) {
      throw new SectionFieldMappingError(
        sectionId,
        '',
        pdfFieldId,
        'PDF_TO_UI'
      );
    }

    const uiPath = mapping.pdfToUi.get(pdfFieldId);
    if (!uiPath) {
      throw new SectionFieldMappingError(
        sectionId,
        '',
        pdfFieldId,
        'PDF_TO_UI'
      );
    }

    this.cache.set(cacheKey, uiPath);
    return uiPath;
  }

  /**
   * Get field metadata
   */
  getFieldMetadata(sectionId: number, fieldPath: string): FieldMetadata | undefined {
    const mapping = this.sectionMappings.get(sectionId);
    if (!mapping) {
      return undefined;
    }

    // Try direct lookup
    let metadata = mapping.fieldMetadata.get(fieldPath);
    
    // If not found, try mapping to PDF field first
    if (!metadata) {
      try {
        const pdfFieldId = this.mapUiToPdf(sectionId, fieldPath);
        metadata = mapping.fieldMetadata.get(pdfFieldId);
      } catch {
        // Ignore mapping errors for metadata lookup
      }
    }

    return metadata;
  }

  /**
   * Get field confidence score
   */
  getFieldConfidence(sectionId: number, fieldPath: string): number {
    const mapping = this.sectionMappings.get(sectionId);
    if (!mapping) {
      return 0;
    }

    return mapping.confidence.get(fieldPath) || 0;
  }

  /**
   * Validate all mappings for a section
   */
  validateSection(sectionId: number): {
    isValid: boolean;
    errors: string[];
    warnings: string[];
    statistics: {
      totalFields: number;
      mappedFields: number;
      highConfidence: number;
      lowConfidence: number;
    };
  } {
    const mapping = this.sectionMappings.get(sectionId);
    if (!mapping) {
      return {
        isValid: false,
        errors: [`No mappings registered for Section ${sectionId}`],
        warnings: [],
        statistics: {
          totalFields: 0,
          mappedFields: 0,
          highConfidence: 0,
          lowConfidence: 0
        }
      };
    }

    const errors: string[] = [];
    const warnings: string[] = [];
    let highConfidence = 0;
    let lowConfidence = 0;

    // Validate bidirectional mappings
    mapping.uiToPdf.forEach((pdfFieldId, uiPath) => {
      const reverseMapping = mapping.pdfToUi.get(pdfFieldId);
      if (!reverseMapping) {
        warnings.push(`No reverse mapping for ${uiPath} -> ${pdfFieldId}`);
      } else if (reverseMapping !== uiPath) {
        errors.push(`Mapping mismatch: ${uiPath} -> ${pdfFieldId} -> ${reverseMapping}`);
      }

      // Check confidence
      const confidence = mapping.confidence.get(uiPath) || 0;
      if (confidence >= 0.8) {
        highConfidence++;
      } else if (confidence < 0.5) {
        lowConfidence++;
        warnings.push(`Low confidence (${confidence}) for field ${uiPath}`);
      }
    });

    const logger = getSectionLogger(sectionId);
    const result = {
      isValid: errors.length === 0,
      errors,
      warnings,
      statistics: {
        totalFields: mapping.uiToPdf.size,
        mappedFields: mapping.uiToPdf.size,
        highConfidence,
        lowConfidence
      }
    };

    logger.validation(result.isValid, errors, warnings);
    return result;
  }

  /**
   * Generate path variations for fuzzy matching
   */
  private generatePathVariations(path: string): string[] {
    const variations: string[] = [];
    
    // Add/remove .value suffix
    if (path.endsWith('.value')) {
      variations.push(path.slice(0, -6));
    } else {
      variations.push(`${path}.value`);
    }

    // Try with section prefix
    if (!path.startsWith('section')) {
      const match = path.match(/^(\d+)\./);
      if (match) {
        variations.push(`section${path}`);
      }
    }

    // Try without section prefix
    if (path.startsWith('section')) {
      variations.push(path.replace(/^section\d+\./, ''));
    }

    return variations;
  }

  /**
   * Clear cache for a specific section
   */
  private clearSectionCache(sectionId: number): void {
    const keysToDelete: string[] = [];
    this.cache.forEach((_, key) => {
      if (key.startsWith(`${sectionId}:`)) {
        keysToDelete.push(key);
      }
    });
    keysToDelete.forEach(key => this.cache.delete(key));
  }

  /**
   * Clear entire cache
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * Get statistics for all registered sections
   */
  getStatistics(): {
    registeredSections: number[];
    totalMappings: number;
    cacheSize: number;
  } {
    return {
      registeredSections: Array.from(this.sectionMappings.keys()),
      totalMappings: Array.from(this.sectionMappings.values())
        .reduce((sum, mapping) => sum + mapping.uiToPdf.size, 0),
      cacheSize: this.cache.size
    };
  }
}

/**
 * Global instance of the field mapper
 */
export const fieldMapper = new UniversalFieldMapper();

/**
 * Helper function to create section field mapping
 */
export function createSectionFieldMapping(
  sectionId: number,
  mappings: Record<string, string>,
  metadata?: Record<string, FieldMetadata>,
  confidence?: Record<string, number>
): SectionFieldMapping {
  const uiToPdf = new Map(Object.entries(mappings));
  const pdfToUi = new Map<string, string>();
  
  // Create reverse mappings
  uiToPdf.forEach((pdfFieldId, uiPath) => {
    pdfToUi.set(pdfFieldId, uiPath);
  });

  return {
    sectionId,
    uiToPdf,
    pdfToUi,
    fieldMetadata: new Map(Object.entries(metadata || {})),
    confidence: new Map(Object.entries(confidence || {}))
  };
}

/**
 * Register field mappings from a configuration object
 */
export function registerSectionMappings(
  sectionId: number,
  config: {
    mappings: Record<string, string>;
    metadata?: Record<string, FieldMetadata>;
    confidence?: Record<string, number>;
  }
): void {
  const mapping = createSectionFieldMapping(
    sectionId,
    config.mappings,
    config.metadata,
    config.confidence
  );
  fieldMapper.registerSection(mapping);
}