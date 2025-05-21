/**
 * Field Parsing Utilities
 * 
 * Consolidated functions for parsing field names and extracting section information.
 * This replaces multiple implementations found throughout the codebase.
 */

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
        ...matchDetails && { matchDetails }
      };
    }
  }
  
  // Pattern: explicit section=21 in field name
  const explicitPattern = /\bsection[=:](\d+)\b/i;
  const explicitMatch = normalizedName.match(explicitPattern);
  if (explicitMatch) {
    const section = parseInt(explicitMatch[1]);
    if (section > 0 && section <= 30) {
      matchDetails = verbose ? `Explicit section pattern: ${explicitMatch[0]}` : undefined;
      return {
        section,
        confidence: 0.98,
        ...matchDetails && { matchDetails }
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
      ...matchDetails && { matchDetails }
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
      ...matchDetails && { matchDetails }
    };
  }
  
  // Pattern: section_21_2 (section 21, entry 2)
  const sectionEntryPattern = /section[_\s]?(\d+)[_\s]?(\d+)/i;
  const sectionEntryMatch = normalizedName.match(sectionEntryPattern);
  if (sectionEntryMatch) {
    const section = parseInt(sectionEntryMatch[1]);
    const entry = parseInt(sectionEntryMatch[2]);
    
    matchDetails = verbose ? `Section entry pattern: ${sectionEntryMatch[0]}` : undefined;
    return {
      section,
      entry,
      confidence: 0.95,
      ...matchDetails && { matchDetails }
    };
  }
  
  // Pattern: Section17_1_2 (section 17, subsection 1, entry 2)
  const sectionSubEntryPattern = /section(\d+)_(\d+)_(\d+)/i;
  const sectionSubEntryMatch = normalizedName.match(sectionSubEntryPattern);
  if (sectionSubEntryMatch) {
    const section = parseInt(sectionSubEntryMatch[1]);
    const subsection = sectionSubEntryMatch[2];
    const entry = parseInt(sectionSubEntryMatch[3]);
    
    matchDetails = verbose ? `Section subentry pattern: ${sectionSubEntryMatch[0]}` : undefined;
    return {
      section,
      subsection,
      entry,
      confidence: 0.95,
      ...matchDetails && { matchDetails }
    };
  }
  
  // Pattern: Section17_1 (section 17, subsection 1)
  const sectionSubPattern = /section(\d+)_(\d+)(?![_\d])/i;
  const sectionSubMatch = normalizedName.match(sectionSubPattern);
  if (sectionSubMatch) {
    const section = parseInt(sectionSubMatch[1]);
    const subsection = sectionSubMatch[2];
    
    matchDetails = verbose ? `Section sub pattern: ${sectionSubMatch[0]}` : undefined;
    return {
      section,
      subsection,
      entry: 1, // Default entry value
      confidence: 0.9,
      ...matchDetails && { matchDetails }
    };
  }
  
  // Pattern for camelCase field names with embedded section/subsection/entry
  // Example: section13aEntry2Date or section13SubAEntry2StartDate
  const camelCasePattern = /section(\d+)(?:Sub)?([A-Za-z])(?:Entry|Instance)?(\d+)/i;
  const camelCaseMatch = normalizedName.match(camelCasePattern);
  if (camelCaseMatch) {
    const section = parseInt(camelCaseMatch[1]);
    const subsection = camelCaseMatch[2].toUpperCase();
    const entry = parseInt(camelCaseMatch[3]);
    
    matchDetails = verbose ? `Camel case pattern: ${camelCaseMatch[0]}` : undefined;
    return {
      section,
      subsection,
      entry,
      confidence: 0.92,
      ...matchDetails && { matchDetails }
    };
  }
  
  // Pattern: sect13A.1Entry2StartDate
  const sectDotPattern = /sect(\d+)([A-Za-z])(?:\.(\d+))?(?:Entry|Instance)(\d+)/i;
  const sectDotMatch = normalizedName.match(sectDotPattern);
  if (sectDotMatch) {
    const section = parseInt(sectDotMatch[1]);
    const subsectionLetter = sectDotMatch[2].toUpperCase();
    const subsectionNumber = sectDotMatch[3] ? `.${sectDotMatch[3]}` : '';
    const subsection = `${subsectionLetter}${subsectionNumber}`;
    const entry = parseInt(sectDotMatch[4]);
    
    matchDetails = verbose ? `Section dot pattern: ${sectDotMatch[0]}` : undefined;
    return {
      section,
      subsection,
      entry,
      confidence: 0.93,
      ...matchDetails && { matchDetails }
    };
  }
  
  // Pattern: s_21 or s-21
  const sPrefixPattern = /\bs[_\-]?(\d+)/i;
  const sPrefixMatch = normalizedName.match(sPrefixPattern);
  if (sPrefixMatch) {
    const section = parseInt(sPrefixMatch[1]);
    if (section > 0 && section <= 30) {
      matchDetails = verbose ? `S-prefix pattern: ${sPrefixMatch[0]}` : undefined;
      return {
        section,
        confidence: 0.85,
        ...matchDetails && { matchDetails }
      };
    }
  }
  
  // Most basic pattern: just looking for "Section X" anywhere in the field name
  const basicSectionPattern = /\bsection\s*(\d+)\b/i;
  const basicSectionMatch = normalizedName.match(basicSectionPattern);
  if (basicSectionMatch) {
    const section = parseInt(basicSectionMatch[1]);
    if (section > 0 && section <= 30) {
      matchDetails = verbose ? `Basic section pattern: ${basicSectionMatch[0]}` : undefined;
      return {
        section,
        confidence: 0.8,
        ...matchDetails && { matchDetails }
      };
    }
  }
  
  // Pattern specifically for SSN fields which should be assigned to Section 4
  const ssnPattern = /\.SSN\[(\d+)\]/i;
  const ssnMatch = normalizedName.match(ssnPattern);
  if (ssnMatch) {
    // SSN fields are part of Section 4
    const section = 4;
    // Use the bracket index as the entry number
    const entryIdx = parseInt(ssnMatch[1]);
    const entry = entryIdx;
    matchDetails = verbose ? `SSN pattern (Section 4): ${ssnMatch[0]}` : undefined;
    return {
      section,
      entry,
      confidence: 0.97, // High confidence for this specific pattern
      ...matchDetails && { matchDetails }
    };
  }
  
  // Pattern specifically for "Sections1-6" which is a common pattern in Section 1
  const sectionsRangePattern = /form\d+\[\d+\][._]sections1-6/i;
  const sectionsRangeMatch = normalizedName.match(sectionsRangePattern);
  if (sectionsRangeMatch) {
    // This is explicitly for Section 1
    const section = 1;
    
    // Don't automatically assign entry for Section 1 based on bracket index
    // Section 1 is generally not a repeating entry section
    matchDetails = verbose ? `Sections range pattern (Section 1): ${sectionsRangeMatch[0]}` : undefined;
    return {
      section,
      confidence: 0.98, // High confidence for this explicit pattern
      ...matchDetails && { matchDetails }
    };
  }
  
  // Pattern: formX[entry].SectionY or similar – capture entry index from bracket notation
  const formEntryPattern = /form\d+\[(\d+)\][._].*?(?:section(?:s)?(\d+)|sections(\d+)-\d+)/i;
  const formEntryMatch = normalizedName.match(formEntryPattern);
  if (formEntryMatch) {
    const entryIdx = parseInt(formEntryMatch[1]);
    // Handle both regular "section1" and "sections1-6" formats
    const section = parseInt(formEntryMatch[2] || formEntryMatch[3]);
    if (section > 0 && section <= 30) {
      // Only assign entries for sections that have repeating entries
      // Sections 1-4, 6, 8-9 typically don't have entries
      const result: SectionInfo = {
        section,
        confidence: 0.96,
      };
      
      // Assign entry only for sections that typically have repeating entries
      // Based on domain knowledge of the form structure
      if (![1, 2, 3, 4, 6, 8, 9].includes(section)) {
        // Treat the bracket index as 1-based entry (PDF forms often start at 0)
        result.entry = entryIdx + 1;
      }
      
      if (verbose) {
        matchDetails = `Form entry pattern: ${formEntryMatch[0]}`;
      }
      
      return {
        ...result,
        ...matchDetails && { matchDetails }
      };
    }
  }
  
  // Pattern for Section 5 fields with TextField11 pattern (from the samples provided)
  const section5TextFieldPattern = /\.section5\[(\d+)\]\.TextField11\[(\d+)\]/i;
  const section5TextFieldMatch = normalizedName.match(section5TextFieldPattern);
  if (section5TextFieldMatch) {
    const section = 5;
    const containerIdx = parseInt(section5TextFieldMatch[1]);
    const fieldIdx = parseInt(section5TextFieldMatch[2]);
    
    // Each numbered TextField for section 5 represents a distinct entry
    // This handles the pattern seen in the samples
    const entry = fieldIdx;
    
    matchDetails = verbose ? `Section 5 TextField pattern: ${section5TextFieldMatch[0]}` : undefined;
    return {
      section,
      entry,
      confidence: 0.99, // Highest confidence for exact pattern match
      ...matchDetails && { matchDetails }
    };
  }

  // Pattern for section5 date fields (From_Datefield_Name_2 pattern in the samples)
  const section5DateFieldPattern = /\.section5\[(\d+)\]\.#area\[(\d+)\]\.From_Datefield_Name_2\[(\d+)\]/i;
  const section5DateFieldMatch = normalizedName.match(section5DateFieldPattern);
  if (section5DateFieldMatch) {
    const section = 5;
    const containerIdx = parseInt(section5DateFieldMatch[1]);
    const areaIdx = parseInt(section5DateFieldMatch[2]);
    const fieldIdx = parseInt(section5DateFieldMatch[3]);
    
    // Date fields entry matches the field index
    const entry = fieldIdx;
    
    matchDetails = verbose ? `Section 5 Date Field pattern: ${section5DateFieldMatch[0]}` : undefined;
    return {
      section,
      entry,
      confidence: 0.99,
      ...matchDetails && { matchDetails }
    };
  }
  
  // Also handle fields from Sections1-6 that are specific to Section 5
  const sections16Section5Pattern = /Sections1-6\[\d+\]\.section5\[(\d+)\]\.([^[]+)(?:\[(\d+)\])?/i;
  const sections16Section5Match = normalizedName.match(sections16Section5Pattern);
  if (sections16Section5Match) {
    const section = 5;
    const fieldName = sections16Section5Match[2];
    
    // For radio buttons that control the yes/no response, assign entry 0
    if (fieldName.toLowerCase().includes('radio') || fieldName.toLowerCase().includes('checkbox')) {
      matchDetails = verbose ? `Sections1-6 Section 5 radio/checkbox field: ${sections16Section5Match[0]}` : undefined;
      return {
        section,
        entry: 0, // Entry 0 for control fields
        confidence: 0.98,
        ...matchDetails && { matchDetails },
        subsection: 'control'
      };
    }
    
    // For other fields, use field index as entry
    const fieldIdx = sections16Section5Match[3] ? parseInt(sections16Section5Match[3]) : 0;
    
    // Entry number depends on field position
    const entry = fieldIdx;
    
    matchDetails = verbose ? `Sections1-6 Section 5 pattern: ${sections16Section5Match[0]}` : undefined;
    return {
      section,
      entry,
      confidence: 0.98,
      ...matchDetails && { matchDetails }
    };
  }
  
  // Pattern for Section 5 fields in Sections1-6 format with TextField11 (from sample)
  const section5Sections16Pattern = /Sections1-6\[\d+\]\.section5\[\d+\]\.TextField11\[(\d+)\]/i;
  const section5Sections16Match = normalizedName.match(section5Sections16Pattern);
  if (section5Sections16Match) {
    const section = 5;
    const fieldIdx = parseInt(section5Sections16Match[1]);
    
    // Each numbered TextField in section 5 represents a distinct entry
    const entry = fieldIdx;
    
    matchDetails = verbose ? `Section 5 in Sections1-6 TextField pattern: ${section5Sections16Match[0]}` : undefined;
    return {
      section,
      entry,
      confidence: 0.99,
      ...matchDetails && { matchDetails }
    };
  }

  // Pattern for section5 date fields in Sections1-6 format (from sample)
  const section5Sections16DatePattern = /Sections1-6\[\d+\]\.section5\[\d+\]\.#area\[\d+\]\.From_Datefield_Name_2\[(\d+)\]/i;
  const section5Sections16DateMatch = normalizedName.match(section5Sections16DatePattern);
  if (section5Sections16DateMatch) {
    const section = 5;
    const fieldIdx = parseInt(section5Sections16DateMatch[1]);
    
    // Date fields entry matches the field index
    const entry = fieldIdx;
    
    matchDetails = verbose ? `Section 5 in Sections1-6 Date Field pattern: ${section5Sections16DateMatch[0]}` : undefined;
    return {
      section,
      entry,
      confidence: 0.99,
      ...matchDetails && { matchDetails }
    };
  }
  
  // Pattern for Section 5 yes/no radio control field
  const section5RadioPattern = /(Sections1-6|\.)section5[\[\.].*?(Radio|YES|NO)/i;
  const section5RadioMatch = normalizedName.match(section5RadioPattern);
  if (section5RadioMatch) {
    const section = 5;
    
    // Radio buttons that control yes/no are always entry 0
    matchDetails = verbose ? `Section 5 Radio/Yes/No control: ${section5RadioMatch[0]}` : undefined;
    return {
      section,
      entry: 0,
      confidence: 0.97,
      ...matchDetails && { matchDetails },
      subsection: 'control'
    };
  }
  
  // Pattern specifically for RadioButtonList in Sections1-6 format (Section 4)
  const radioButtonListPattern = /Sections1-6\[\d+\]\.RadioButtonList\[\d+\]/i;
  const radioButtonListMatch = normalizedName.match(radioButtonListPattern);
  if (radioButtonListMatch) {
    // These RadioButtonList fields are part of Section 4
    const section = 4;
    matchDetails = verbose ? `RadioButtonList pattern (Section 4): ${radioButtonListMatch[0]}` : undefined;
    return {
      section,
      confidence: 0.97, // High confidence for this specific pattern
      ...matchDetails && { matchDetails }
    };
  }
  
  // No clear match found
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
  switch (sectionNumber) {
    case 17: // Marital Status
      return [
        { pattern: /Section17_1/i, subsection: "1", description: "Current marriage" },
        { pattern: /Section17_2/i, subsection: "2", description: "Former spouse" },
        { pattern: /Section17_3/i, subsection: "3", description: "Cohabitants" }
      ];
      
    case 21: // Mental Health
      return [
        { pattern: /section21a/i, subsection: "a", description: "Mental health treatment" },
        { pattern: /section21c/i, subsection: "c", description: "Mental health disorders" },
        { pattern: /section21d/i, subsection: "d", description: "Mental health hospitalizations" },
        { pattern: /section21e/i, subsection: "e", description: "Mental health conditions not covered" }
      ];
      
    case 13: // Employment
      return [
        { pattern: /section13A/i, subsection: "A", description: "Employment activities" },
        { pattern: /section13B/i, subsection: "B", description: "Unemployment periods" },
        { pattern: /section13C/i, subsection: "C", description: "Employment record" }
      ];
      
    default:
      return [];
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