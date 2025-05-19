/**
 * Bridge Adapter for Page Categorization
 * 
 * This adapter connects the Sectionizer with the page categorization system
 * from utilities/page-categorization-bridge.ts to leverage advanced
 * categorization logic.
 */

import {
  enhancedMultiDimensionalCategorization,
  identifySectionByPage,
  enhancedSectionCategorization,
  updateFieldWithPageData,
  extractSectionInfoFromName,
  sectionClassifications,
  initPageCategorization as initPageCategorizationBridge,
  getNeighborFieldContext,
  refinedSectionPageRanges
} from '../../../utilities/page-categorization-bridge.js';
import type { CategorizedField, PDFField } from './extractFieldsBySection.js';
import { 
  extractSpatialInfo, 
  calculateSpatialConfidenceBoost,
  getPositionalSectionScore 
} from './spatialAnalysis.js';

/**
 * Initialize page categorization system
 */
export async function initializePageCategorization(): Promise<void> {
  // Just pass through to the bridge's init function
  const result = initPageCategorizationBridge();
  if (!result) {
    console.warn('Page categorization system initialization may have failed');
  } else {
    console.log('Page categorization system initialized successfully');
  }
}

/**
 * Apply page-based categorization to determine a field's section
 * @param field The field to categorize based on page number
 * @returns Categorized field with section and confidence
 */
export function applyPageCategorization(field: PDFField): CategorizedField {
  // Initialize with default values
  const result: CategorizedField = {
    ...field,
    section: 0,
    confidence: 0
  };
  
  if (!field.page || field.page <= 0) {
    return result;
  }
  
  // Use the bridge's identifySectionByPage function
  const sectionId = identifySectionByPage(field.page);
  if (sectionId && sectionId > 0) {
    result.section = sectionId;
    result.confidence = 0.85; // Moderate confidence for page-based categorization
  }
  
  return result;
}

/**
 * Apply heuristic rules for specific section patterns
 * @param field The field to apply heuristics to
 * @returns Categorized field with section and confidence
 */
export function applyHeuristicRules(field: PDFField): CategorizedField {
  // Initialize with default values
  const result: CategorizedField = {
    ...field,
    section: 0,
    confidence: 0
  };
  
  if (!field.name) {
    return result;
  }
  
  // Check for section-specific patterns using sectionClassifications from the bridge
  for (const sectionClassification of sectionClassifications) {
    if (!sectionClassification.fieldPathPatterns) continue;
    
    // Check if field name matches any pattern for this section
    const matchFound = sectionClassification.fieldPathPatterns.some(pattern => 
      pattern.test(field.name)
    );
    
    if (matchFound && sectionClassification.confidence > result.confidence) {
      result.section = sectionClassification.sectionId;
      result.confidence = sectionClassification.confidence;
    }
  }
  
  // Extract section info from field name
  const sectionInfo = extractSectionInfoFromName(field.name);
  if (sectionInfo && 
      sectionInfo.section !== undefined && 
      sectionInfo.section > 0 && 
      sectionInfo.confidence !== undefined && 
      sectionInfo.confidence > result.confidence) {
    
    result.section = sectionInfo.section;  // Now guaranteed to be defined
    result.confidence = sectionInfo.confidence;  // Now guaranteed to be defined
    if (sectionInfo.subsection) {
      result.subsection = sectionInfo.subsection;
    }
    if (sectionInfo.entry) {
      result.entry = sectionInfo.entry;
    }
  }
  
  return result;
}

/**
 * Advanced categorization using multiple techniques from the page categorization bridge
 * @param field Field to categorize 
 * @param neighborFields Optional array of neighboring field names for context
 * @returns Categorized field with section and confidence
 */
export function advancedCategorization(field: PDFField, neighborFields?: string[]): CategorizedField {
  // Initialize with default values
  const result: CategorizedField = {
    ...field,
    section: 0,
    confidence: 0
  };
  
  try {
    // First, extract spatial information if available
    const spatialInfo = extractSpatialInfo(field);
    
    if (spatialInfo) {
      // We have coordinate data, use it for dimensional analysis
      
      // Method 1: Enhanced multi-dimensional categorization with coordinates
      let fieldValueWithCoords = typeof field.value === 'string' ? field.value : '';
      
      // Add position hint to the field value for analysis
      if (spatialInfo.positionHint) {
        // Just for dimensional analysis hint, not modifying the actual value
        fieldValueWithCoords = fieldValueWithCoords ? 
          `${fieldValueWithCoords} [${spatialInfo.positionHint}]` : 
          `[${spatialInfo.positionHint}]`;
      }
      
      const enhancedResult = enhancedMultiDimensionalCategorization(
        field.name,
        field.label || '',
        field.page || 0,
        fieldValueWithCoords,
        neighborFields || []
      );
      
      if (enhancedResult && enhancedResult.section > 0) {
        // Apply spatial confidence boost based on field position
        const spatialBoost = calculateSpatialConfidenceBoost(field, enhancedResult.section);
        
        // Boost the confidence based on spatial information
        result.section = enhancedResult.section;
        result.confidence = Math.min(1.0, enhancedResult.confidence + spatialBoost);
        
        if (enhancedResult.subsection) {
          result.subsection = enhancedResult.subsection;
        }
        
        if (enhancedResult.entry) {
          result.entry = enhancedResult.entry;
        }
        
        // Return early if we have high confidence
        if (result.confidence > 0.85) {
          return result;
        }
      }
    } else {
      // No coordinate data, use standard approach
      
      // Method 1: Use the most advanced multi-dimensional categorization first
      const enhancedResult = enhancedMultiDimensionalCategorization(
        field.name,
        field.label || '',
        field.page || 0,
        typeof field.value === 'string' ? field.value : undefined,
        neighborFields || []
      );
      
      if (enhancedResult && enhancedResult.section > 0 && enhancedResult.confidence > result.confidence) {
        result.section = enhancedResult.section;
        result.confidence = enhancedResult.confidence;
        
        if (enhancedResult.subsection) {
          result.subsection = enhancedResult.subsection;
        }
        
        if (enhancedResult.entry) {
          result.entry = enhancedResult.entry;
        }
        
        // Return early only if confidence is very strong
        if (result.confidence > 0.85) {
          return result;
        }
      }
    }
    
    // Method 2: Try page-based categorization
    if (field.page && field.page > 0 && result.confidence < 0.7) {
      const pageBasedResult = applyPageCategorization(field);
      if (pageBasedResult && pageBasedResult.section > 0 && pageBasedResult.confidence > result.confidence) {
        // Use the page-based result if it has better confidence
        result.section = pageBasedResult.section;
        result.confidence = pageBasedResult.confidence;
      }
    }
    
    // Method 3: Apply heuristic rules for specific sections
    if (result.confidence < 0.8) {
      const heuristicResult = applyHeuristicRules(field);
      if (heuristicResult && heuristicResult.section > 0 && heuristicResult.confidence > result.confidence) {
        result.section = heuristicResult.section;
        result.confidence = heuristicResult.confidence;
        if (heuristicResult.subsection) result.subsection = heuristicResult.subsection;
        if (heuristicResult.entry) result.entry = heuristicResult.entry;
      }
    }
    
    // Method 4: Fall back to enhanced section categorization only if all other methods failed
    if (result.section === 0 || result.confidence < 0.5) {
      const fallbackResult = enhancedSectionCategorization(
        field.name,
        field.label || '',
        field.page || 0,
        field.value
      );
      
      if (fallbackResult && fallbackResult.section > 0 && fallbackResult.confidence > result.confidence) {
        result.section = fallbackResult.section;
        result.confidence = fallbackResult.confidence;
      }
    }
  } catch (error) {
    console.error('Error in advancedCategorization:', error);
  }
  
  return result;
}

/**
 * Limit neighbor field context to just a few fields before and after
 * to prevent overwhelming the categorization system
 * 
 * @param fieldName Current field name
 * @param allFieldNames All field names in the document
 * @param contextSize Number of fields before/after to include (default: 2)
 * @returns Limited array of neighboring field names
 */
export function getLimitedNeighborContext(fieldName: string, allFieldNames: string[], contextSize: number = 2): string[] {
  // First get the original neighbors from the bridge function
  const allNeighbors = getNeighborFieldContext(fieldName, allFieldNames);
  
  if (!allNeighbors || allNeighbors.length <= contextSize * 2) {
    // If we already have few enough neighbors, return them all
    return allNeighbors || [];
  }
  
  // Find the current field index in the neighbors
  const currentIndex = allNeighbors.indexOf(fieldName);
  
  if (currentIndex === -1) {
    // Field not found in neighbors, just take first and last few
    return [
      ...allNeighbors.slice(0, contextSize),
      ...allNeighbors.slice(-contextSize)
    ];
  }
  
  // Take contextSize fields before and after the current field
  const beforeFields = allNeighbors.slice(
    Math.max(0, currentIndex - contextSize),
    currentIndex
  );
  
  const afterFields = allNeighbors.slice(
    currentIndex + 1,
    Math.min(allNeighbors.length, currentIndex + 1 + contextSize)
  );
  
  // Return the limited context
  return [...beforeFields, fieldName, ...afterFields];
}

// Export utility functions directly from bridge
export { 
  extractSectionInfoFromName,
  updateFieldWithPageData,
  getNeighborFieldContext,
  refinedSectionPageRanges,
  sectionClassifications
}; 