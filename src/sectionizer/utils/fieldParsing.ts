/**
 * Field Parsing Utilities
 * 
 * Consolidated functions for parsing field names and extracting section information.
 * This replaces multiple implementations found throughout the codebase.
 */
import { 
  subsectionPatterns, 
  entryPatterns, 
  sectionFieldPatterns, 
  sectionEntryPrefixes,
  expectedFieldCounts
} from './field-clusterer.js';

/**
 * Result of section information extraction
 */
export interface SectionInfo {
  /** Section number (1-30) */
  section: number;
  /** Subsection identifier (e.g., "A", "B", "C") */
  subsection?: string;
  /** Entry index within subsection */
  entry?: number;
  /** Sub-entry index */
  subEntry?: number;
  /** Confidence score of extraction (0-1) */
  confidence: number;
  /** Match details (only when verbose option is true) */
  matchDetails?: string;
}

/**
 * Unified function to extract section information from field name or label
 * Consolidates logic from multiple implementations across the codebase
 * 
 * @param fieldName The field name or label to parse
 * @param options Additional options for extraction
 * @returns Section information or null if no information could be extracted
 */
export function extractSectionInfo(
  fieldName: string,
  options: {
    /** Include detailed pattern matching information */
    verbose?: boolean;
    /** Minimum confidence threshold (0-1) */
    minConfidence?: number;
  } = {}
): SectionInfo | null {
  if (!fieldName) return null;
  
  const { verbose = false, minConfidence = 0 } = options;
  let matchDetails: string | undefined;
  
  // Normalize the field name for consistent pattern matching
  const normalizedName = fieldName.toLowerCase().trim();
  
  // Try to identify section number first
  let sectionMatch = normalizedName.match(/[Ss]ection(\d+)/);
  let sectionHint = sectionMatch ? parseInt(sectionMatch[1], 10) : 0;
  
  // Match against section field patterns first
  for (const [sectionStr, patterns] of Object.entries(sectionFieldPatterns)) {
    const section = parseInt(sectionStr, 10);
    if (isNaN(section)) continue;
    
    for (const pattern of patterns) {
      if (pattern.test(normalizedName)) {
        // Found a section match
        matchDetails = verbose ? `Section field pattern match: ${pattern}` : undefined;
        
        // Now try to extract subsection and entry
        let subsection: string | undefined;
        let entry: number | undefined;
        
        // Try to extract subsection using section-specific subsection patterns
        if (subsectionPatterns[section]) {
          for (const subPattern of subsectionPatterns[section]) {
            const subMatch = normalizedName.match(subPattern);
            if (subMatch && subMatch.length > 1) {
              subsection = subMatch[1];
              break;
            }
          }
        }
        
        // If no section-specific subsection pattern matched, try generic patterns
        if (!subsection && subsectionPatterns[0]) {
          for (const subPattern of subsectionPatterns[0]) {
            const subMatch = normalizedName.match(subPattern);
            if (subMatch && subMatch.length > 2) {
              subsection = subMatch[2];
              break;
            } else if (subMatch && subMatch.length > 1 && String(subPattern).includes('Subsection')) {
              subsection = subMatch[1];
              break;
            }
          }
        }
        
        // Try to extract entry using section-specific entry patterns
        if (entryPatterns[section]) {
          for (const entryPattern of entryPatterns[section]) {
            const entryMatch = normalizedName.match(entryPattern);
            if (entryMatch && entryMatch.length > 1) {
              const parsedEntry = parseInt(entryMatch[1], 10);
              if (!isNaN(parsedEntry)) {
                entry = parsedEntry;
                break;
              }
            }
          }
        }
        
        // If no section-specific entry pattern matched, try generic patterns
        if (entry === undefined && entryPatterns[0]) {
          for (const entryPattern of entryPatterns[0]) {
            const entryMatch = normalizedName.match(entryPattern);
            if (entryMatch && entryMatch.length > 1) {
              const parsedEntry = parseInt(entryMatch[1], 10);
              if (!isNaN(parsedEntry)) {
                entry = parsedEntry;
                break;
              }
            }
          }
        }
        
        return {
          section,
          ...(subsection && { subsection }),
          ...(entry !== undefined && { entry }),
          confidence: 0.97,
          ...(matchDetails && { matchDetails })
        };
      }
    }
  }
  
  // If we didn't find a match using section field patterns, try the specialized pattern logic
  
  // Pattern: form1[0].#subform[0].Section21[0].ControlField
  const formSectionPattern = /form\d+\[\d+\][._]#?subform\[\d+\][._]section(\d+)\[/i;
  const formSectionMatch = normalizedName.match(formSectionPattern);
  if (formSectionMatch) {
    const section = parseInt(formSectionMatch[1]);
    if (section > 0 && section <= 30) {
      matchDetails = verbose ? `Form section pattern: ${formSectionMatch[0]}` : undefined;
      return {
        section,
        confidence: 0.98,
        ...(matchDetails && { matchDetails })
      };
    }
  }
  
  // Pattern: section_21_subset_2_field
  const sectionSubsetPattern = /section[_\s]?(\d+)[_\s]?subset[_\s]?(\d+)/i;
  const sectionSubsetMatch = normalizedName.match(sectionSubsetPattern);
  if (sectionSubsetMatch) {
    const section = parseInt(sectionSubsetMatch[1]);
    const subsection = sectionSubsetMatch[2];
    
    matchDetails = verbose ? `Section subset pattern: ${sectionSubsetMatch[0]}` : undefined;
    return {
      section,
      subsection,
      confidence: 0.95,
      ...(matchDetails && { matchDetails })
    };
  }
  
  // Pattern: section21A or section21a
  const sectionLetterPattern = /section(\d+)([a-zA-Z])/i;
  const sectionLetterMatch = normalizedName.match(sectionLetterPattern);
  if (sectionLetterMatch) {
    const section = parseInt(sectionLetterMatch[1]);
    const subsection = sectionLetterMatch[2].toUpperCase();
    
    matchDetails = verbose ? `Section letter pattern: ${sectionLetterMatch[0]}` : undefined;
    return {
      section,
      subsection,
      confidence: 0.95,
      ...(matchDetails && { matchDetails })
    };
  }
  
  // Try section entry prefix patterns
  for (const [sectionStr, prefixes] of Object.entries(sectionEntryPrefixes)) {
    const section = parseInt(sectionStr);
    if (isNaN(section)) continue;
    
    for (const prefix of prefixes) {
      if (normalizedName.includes(prefix.toLowerCase())) {
        // Try to extract entry number
        const entryMatch = normalizedName.match(new RegExp(`${prefix}[_-]?(\\d+)`, 'i'));
        if (entryMatch && entryMatch.length > 1) {
          const entry = parseInt(entryMatch[1], 10);
          matchDetails = verbose ? `Section entry prefix match: ${prefix}` : undefined;
          return {
            section,
            entry,
            confidence: 0.93,
            ...(matchDetails && { matchDetails })
          };
        }
        
        // No entry number found, but section match is confident
        return {
          section,
          confidence: 0.91,
          ...(matchDetails && { matchDetails })
        };
      }
    }
  }

  // No match found with confidence above threshold
  return null;
}



/**
 * Extract section information from multiple field properties
 * Tries name first, then label, falls back to other properties if available
 * 
 * @param field The field object to extract section info from
 * @returns Section information or null if no information could be extracted
 */
export function extractSectionInfoFromField(field: any): SectionInfo | null {
  if (!field) return null;
  
  // Try extracting from name first
  if (field.name) {
    const infoFromName = extractSectionInfo(field.name);
    if (infoFromName && infoFromName.confidence >= 0.8) {
      return infoFromName;
    }
  }
  
  // Try extracting from label if available
  if (field.label) {
    const infoFromLabel = extractSectionInfo(field.label);
    if (infoFromLabel && infoFromLabel.confidence >= 0.7) { // Lower confidence threshold for label
      return {
        ...infoFromLabel,
        confidence: infoFromLabel.confidence * 0.9 // Slightly reduce confidence for label-based extraction
      };
    }
  }
  
  // If field already has section info, return it with high confidence
  if (typeof field.section === 'number' && field.section > 0) {
    return {
      section: field.section,
      subsection: field.subsection,
      entry: field.entry,
      confidence: 0.99 // Direct field properties have highest confidence
    };
  }
  
  // Fallback to any other properties that might contain section info
  if (field.value && typeof field.value === 'string') {
    const infoFromValue = extractSectionInfo(field.value);
    if (infoFromValue && infoFromValue.confidence >= 0.7) {
      return {
        ...infoFromValue,
        confidence: infoFromValue.confidence * 0.8 // Further reduce confidence for value-based extraction
      };
    }
  }
  
  return null;
}

/**
 * Special case handling for form sections known to have specific patterns
 * 
 * @param sectionNumber The section number to get special patterns for
 * @returns Array of special patterns for this section or empty array if none
 */
export function getSpecialSectionPatterns(sectionNumber: number): { pattern: RegExp, subsection?: string, description: string }[] {
  // Use subsection patterns from field-clusterer for the specified section
  const sectionSpecificPatterns = subsectionPatterns[sectionNumber] || [];
  
  // Convert to the expected format
  const specialPatterns = sectionSpecificPatterns.map(pattern => {
    return {
      pattern,
      description: `Subsection pattern for section ${sectionNumber}`
    };
  });
  
  // Add any additional special case patterns
  switch (sectionNumber) {
    case 17: // Marital Status
      return [
        ...specialPatterns,
        { pattern: /Section17_1/i, subsection: "1", description: "Current marriage" },
        { pattern: /Section17_2/i, subsection: "2", description: "Former spouse" },
        { pattern: /Section17_3/i, subsection: "3", description: "Cohabitants" }
      ];
      
    case 21: // Mental Health
      return [
        ...specialPatterns,
        { pattern: /section21a/i, subsection: "a", description: "Mental health treatment" },
        { pattern: /section21c/i, subsection: "c", description: "Mental health disorders" },
        { pattern: /section21d/i, subsection: "d", description: "Mental health hospitalizations" },
        { pattern: /section21e/i, subsection: "e", description: "Mental health conditions not covered" }
      ];
      
    case 13: // Employment
      return [
        ...specialPatterns,
        { pattern: /section13A/i, subsection: "A", description: "Employment activities" },
        { pattern: /section13B/i, subsection: "B", description: "Employment unemployment periods" },
        { pattern: /section13C/i, subsection: "C", description: "Employment record" }
      ];
      
    default:
      return specialPatterns;
  }
}


// Re-export necessary functions from bridge adapter for cleaner imports
export { 
  identifySectionByPage, 
  sectionClassifications,
  getSectionPageRange,
  refinedSectionPageRanges,
  identifySectionByPageWithConfidence,
  enhancedMultiDimensionalCategorization,
  detectSectionFromFieldValue,
  extractSectionInfoFromName,
  getNeighborFieldContext,
  initPageCategorization,
  enhancedSectionCategorization,
  updateFieldWithPageData
} from '../../../utilities/page-categorization-bridge.js'; 