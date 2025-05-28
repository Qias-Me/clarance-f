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
import { EncapsulatedFieldParser, FieldHierarchy } from './encapsulated-field-parser.js';

/**
 * Result of section information extraction
 */
export interface SectionInfo {
  /** Section number (1-30) */
  section: number;
  /** Subsection identifier (e.g., "A", "B", "C", "1", "2", "3", "a", "b", "c" .. "h", "H") */
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

  // 🎯 DEBUG: Track our target field
  const isTargetField = fieldName.includes("Section11[0].From_Datefield_Name_2[2]");

  if (isTargetField) {
    console.log(`\n🔍 FIELD PARSING - extractSectionInfo DEBUG:`);
    console.log(`   Field Name: "${fieldName}"`);
  }

  const { verbose = false, minConfidence = 0 } = options;
  let matchDetails: string | undefined;

  // Normalize the field name for consistent pattern matching
  const normalizedName = fieldName.toLowerCase().trim();

  if (isTargetField) {
    console.log(`   Normalized Name: "${normalizedName}"`);
    console.log(`   Min Confidence: ${minConfidence}`);
    console.log(`   Calling EncapsulatedFieldParser...`);
  }

  // FIRST PRIORITY: Try the new encapsulated field parser (highest accuracy)
  const encapsulatedResult = EncapsulatedFieldParser.parseFieldHierarchy(fieldName, verbose);

  if (isTargetField) {
    console.log(`   EncapsulatedFieldParser Result: ${encapsulatedResult ? JSON.stringify(encapsulatedResult) : 'null'}`);
    if (encapsulatedResult) {
      console.log(`   Confidence Check: ${encapsulatedResult.confidence} >= ${minConfidence} = ${encapsulatedResult.confidence >= minConfidence}`);
    }
  }

  if (encapsulatedResult && encapsulatedResult.confidence >= minConfidence) {
    // Convert FieldHierarchy to SectionInfo format
    const result = {
      section: encapsulatedResult.section,
      ...(encapsulatedResult.subsection !== -1 && { subsection: String(encapsulatedResult.subsection) }),
      ...(encapsulatedResult.entry !== -1 && { entry: encapsulatedResult.entry }),
      confidence: encapsulatedResult.confidence,
      ...(encapsulatedResult.matchDetails && { matchDetails: encapsulatedResult.matchDetails })
    };

    if (isTargetField) {
      console.log(`   ✅ ENCAPSULATED PARSER SUCCESS: ${JSON.stringify(result)}`);
    }

    return result;
  }

  if (isTargetField) {
    console.log(`   ❌ ENCAPSULATED PARSER FAILED: Continuing to other methods...`);
  }

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

  // Enhanced pattern matching for complex field structures

  // Pattern: form1[0].Section16_1[0].#area[0].From_Datefield_Name_2[0] -> Section 16 entry 1
  const formSectionEntryPattern = /form\d+\[\d+\]\.section(\d+)_(\d+)\[\d+\]/i;
  const formSectionEntryMatch = normalizedName.match(formSectionEntryPattern);
  if (formSectionEntryMatch) {
    const section = parseInt(formSectionEntryMatch[1]);
    const entry = parseInt(formSectionEntryMatch[2]);

    matchDetails = verbose ? `Form section entry pattern: ${formSectionEntryMatch[0]}` : undefined;
    return {
      section,
      entry,
      confidence: 0.98,
      ...(matchDetails && { matchDetails })
    };
  }

  // Pattern: form1[0].Section17_1[0] -> Section 17 subsection 1 entry 1
  // Pattern: form1[0].Section17_1_2[0] -> Section 17 subsection 1 entry 2
  const formSectionSubsectionPattern = /form\d+\[\d+\]\.section(\d+)_(\d+)(?:_(\d+))?\[\d+\]/i;
  const formSectionSubsectionMatch = normalizedName.match(formSectionSubsectionPattern);
  if (formSectionSubsectionMatch) {
    const section = parseInt(formSectionSubsectionMatch[1]);
    const subsection = formSectionSubsectionMatch[2];
    const entry = formSectionSubsectionMatch[3] ? parseInt(formSectionSubsectionMatch[3]) : 1;

    matchDetails = verbose ? `Form section subsection pattern: ${formSectionSubsectionMatch[0]}` : undefined;
    return {
      section,
      subsection,
      entry,
      confidence: 0.97,
      ...(matchDetails && { matchDetails })
    };
  }

  // Pattern: form1[0].Sections7-9[0] -> Requires specific field analysis (NO DEFAULT ASSIGNMENT)
  const formSectionRangePattern = /form\d+\[\d+\]\.sections(\d+)-(\d+)\[\d+\]/i;
  const formSectionRangeMatch = normalizedName.match(formSectionRangePattern);
  if (formSectionRangeMatch) {
    const startSection = parseInt(formSectionRangeMatch[1]);
    const endSection = parseInt(formSectionRangeMatch[2]);

    // ONLY assign if we have SPECIFIC indicators - no default assignment based on range
    let targetSection: number | null = null;

    // Look for SPECIFIC and UNAMBIGUOUS indicators in the field name
    if (normalizedName.includes('passport') || normalizedName.includes('p3-t68') || normalizedName.includes('travel') || normalizedName.includes('document')) {
      targetSection = 8; // Passport info typically in section 8
    } else if (normalizedName.includes('citizenship') || normalizedName.includes('citizen') || normalizedName.includes('naturalization')) {
      targetSection = 9; // Citizenship questions typically in section 9
    } else if (normalizedName.includes('contact') || normalizedName.includes('email') || normalizedName.includes('phone') || normalizedName.includes('address')) {
      targetSection = 7; // Contact info typically in section 7
    }

    // Only return a result if we found a specific indicator
    if (targetSection !== null && targetSection >= startSection && targetSection <= endSection) {
      matchDetails = verbose ? `Form section range pattern: ${formSectionRangeMatch[0]} -> Section ${targetSection} (specific indicator found)` : undefined;
      return {
        section: targetSection,
        confidence: 0.85,
        ...(matchDetails && { matchDetails })
      };
    }

    // If no specific indicator found, return null to let other patterns handle it
    return null;
  }

  // Pattern: section21c -> section 21 subsection c (needs deeper analysis)
  const sectionLetterPattern = /section(\d+)([a-zA-Z])(\d*)/i;
  const sectionLetterMatch = normalizedName.match(sectionLetterPattern);
  if (sectionLetterMatch) {
    const section = parseInt(sectionLetterMatch[1]);
    const subsection = sectionLetterMatch[2].toUpperCase();
    const entryNum = sectionLetterMatch[3] ? parseInt(sectionLetterMatch[3]) : undefined;

    // Special handling for section 21c which needs deeper analysis
    if (section === 21 && subsection === 'C') {
      // Look for TextField11 patterns to determine entry number
      const textFieldPattern = /textfield11\[(\d+)\]/i;
      const textFieldMatch = normalizedName.match(textFieldPattern);
      if (textFieldMatch) {
        const fieldIndex = parseInt(textFieldMatch[1]);
        // Map field indices to entries: [0,6,12,18] -> entries [1,2,3,4]
        const entryMapping = { 0: 1, 6: 2, 12: 3, 18: 4 };
        const mappedEntry = entryMapping[fieldIndex as keyof typeof entryMapping];
        if (mappedEntry) {
          matchDetails = verbose ? `Section 21c deep analysis: TextField11[${fieldIndex}] -> Entry ${mappedEntry}` : undefined;
          return {
            section,
            subsection,
            entry: mappedEntry,
            confidence: 0.96,
            ...(matchDetails && { matchDetails })
          };
        }
      }
    }

    matchDetails = verbose ? `Section letter pattern: ${sectionLetterMatch[0]}` : undefined;
    return {
      section,
      subsection,
      ...(entryNum && { entry: entryNum }),
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
 * Handle Section14 edge case where some fields with "Section14" in their names
 * actually belong to Section 15. This is similar to the "Sections1-6" and "Sections7-9" patterns.
 *
 * @param fieldName The field name to analyze
 * @param detectedSection The section detected by standard parsing
 * @returns Corrected section number if edge case applies, otherwise original section
 */
export function handleSection14EdgeCase(fieldName: string, detectedSection: number): number {
  if (detectedSection !== 14 || !fieldName.includes('Section14')) {
    return detectedSection; // No edge case applies
  }

  const normalizedName = fieldName.toLowerCase();

  // Analyze field patterns to determine if this Section14 field should actually go to Section 15
  // Based on SF-86 form structure, some Section14 fields are continuation fields for Section 15

  // Look for specific indicators that suggest this field belongs to Section 15
  const section15Indicators = [
    'continuation',
    'additional',
    'other',
    'specify',
    'details',
    'explanation',
    'textfield11[3]', // Higher index text fields often continue to next section
    'textfield11[4]',
    'textfield11[5]'
  ];

  const hasSection15Indicator = section15Indicators.some(indicator =>
    normalizedName.includes(indicator)
  );

  if (hasSection15Indicator) {
    return 15; // This Section14 field actually belongs to Section 15
  }

  return detectedSection; // Keep original section assignment
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