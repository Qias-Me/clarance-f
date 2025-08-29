/**
 * Section 13 JSON Field Loader
 * 
 * Simplified JSON loading functionality. Most functionality has been consolidated
 * into section13-field-mapping.ts to reduce redundancy.
 */

import {
  loadSection13JsonMappings,
  getFieldsByEmploymentType,
  validateFieldCoverage,
  getFieldMappingStatistics,
  clearFieldMappingCache,
  initializeFieldMapping,
  type JsonFieldMapping,
  type FieldMapping
} from './section13-field-mapping';

// Re-export types for backward compatibility
export { type JsonFieldMapping, type FieldMapping };

// Re-export functions with original names for backward compatibility
export const initializeJsonLoader = initializeFieldMapping;
export const getAllFieldMappings = async (): Promise<FieldMapping[]> => {
  const mappings = await loadSection13JsonMappings();
  return mappings.map(m => ({
    uiPath: m.uiPath,
    pdfField: m.pdfFieldId,
    fieldType: m.type,
    metadata: {
      label: m.label,
      page: m.page,
      confidence: m.confidence,
      processingSource: m.processingSource
    }
  }));
};

export const clearJsonMappingCache = clearFieldMappingCache;
export { getFieldsByEmploymentType, validateFieldCoverage as getCoverageReport };

// Backward compatibility for loadSection13JsonMappings
export { loadSection13JsonMappings };

/**
 * Get field mapping by PDF field ID (backward compatibility)
 */
export const getFieldByPdfId = async (pdfFieldId: string): Promise<JsonFieldMapping | undefined> => {
  const mappings = await loadSection13JsonMappings();
  return mappings.find(m => m.pdfFieldId === pdfFieldId);
};

/**
 * Get field mapping by UI path (backward compatibility)
 */
export const getFieldByUiPath = async (uiPath: string): Promise<JsonFieldMapping | undefined> => {
  const mappings = await loadSection13JsonMappings();
  return mappings.find(m => m.uiPath === uiPath);
};

/**
 * Get field statistics by type (backward compatibility)
 */
export const getFieldStatistics = async (): Promise<Record<string, number>> => {
  const stats = await getFieldMappingStatistics();
  return stats.subsectionCounts;
};

/**
 * Convert JSON mapping to FieldMapping format (backward compatibility)
 */
export const convertToFieldMapping = (jsonMapping: JsonFieldMapping): FieldMapping => {
  return {
    uiPath: jsonMapping.uiPath,
    pdfField: jsonMapping.pdfFieldId,
    fieldType: jsonMapping.type,
    metadata: {
      label: jsonMapping.label,
      page: jsonMapping.page,
      confidence: jsonMapping.confidence,
      processingSource: jsonMapping.processingSource
    }
  };
};
