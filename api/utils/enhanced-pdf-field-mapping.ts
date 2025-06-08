/**
 * Enhanced PDF Field Mapping System
 * 
 * This module provides advanced utilities for handling complex PDF field structures
 * including #field[x] references, nested paths, dynamic indices, and array-based mappings.
 */

import { getSectionFields, findFieldById, findFieldByName, findFieldByUniqueId } from './sections-references-loader';

// ============================================================================
// TYPES AND INTERFACES
// ============================================================================

export interface FieldPathComponents {
  basePath: string;
  arrayIndex?: number;
  fieldIndex?: number;
  areaIndex?: number;
  subPath?: string;
  isComplex: boolean;
}

export interface DynamicFieldMapping {
  template: string;
  variables: Record<string, number>;
  resolvedPath: string;
}

export interface FieldMappingResult {
  success: boolean;
  fieldPath: string;
  fieldData?: any;
  error?: string;
  suggestions?: string[];
}

// ============================================================================
// FIELD PATH PARSING UTILITIES
// ============================================================================

/**
 * Parse complex PDF field paths with #field[x], #area[x], and array indices
 */
export function parseFieldPath(fieldPath: string): FieldPathComponents {
  const components: FieldPathComponents = {
    basePath: fieldPath,
    isComplex: false
  };

  // Check for complex patterns
  const complexPatterns = [
    /#field\[(\d+)\]/,
    /#area\[(\d+)\]/,
    /\[(\d+)\]/,
    /TextField11\[(\d+)\]/,
    /From_Datefield_Name_2\[(\d+)\]/,
    /To_Datefield_Name_2\[(\d+)\]/
  ];

  let hasComplexPattern = false;

  // Extract array indices
  const arrayMatch = fieldPath.match(/^([^[]+)\[(\d+)\]/);
  if (arrayMatch) {
    components.basePath = arrayMatch[1];
    components.arrayIndex = parseInt(arrayMatch[2], 10);
    hasComplexPattern = true;
  }

  // Extract #field[x] references
  const fieldMatch = fieldPath.match(/#field\[(\d+)\]/);
  if (fieldMatch) {
    components.fieldIndex = parseInt(fieldMatch[1], 10);
    hasComplexPattern = true;
  }

  // Extract #area[x] references
  const areaMatch = fieldPath.match(/#area\[(\d+)\]/);
  if (areaMatch) {
    components.areaIndex = parseInt(areaMatch[1], 10);
    hasComplexPattern = true;
  }

  // Extract sub-path after complex patterns
  const subPathMatch = fieldPath.match(/(?:#field\[\d+\]|#area\[\d+\]|TextField11\[\d+\])\.(.+)/);
  if (subPathMatch) {
    components.subPath = subPathMatch[1];
    hasComplexPattern = true;
  }

  components.isComplex = hasComplexPattern;
  return components;
}

/**
 * Resolve dynamic field paths with variable substitution
 */
export function resolveDynamicFieldPath(
  template: string, 
  variables: Record<string, number>
): DynamicFieldMapping {
  let resolvedPath = template;
  
  // Replace variables in the template
  Object.entries(variables).forEach(([varName, value]) => {
    const patterns = [
      new RegExp(`\\{${varName}\\}`, 'g'),
      new RegExp(`\\$\\{${varName}\\}`, 'g'),
      new RegExp(`%${varName}%`, 'g')
    ];
    
    patterns.forEach(pattern => {
      resolvedPath = resolvedPath.replace(pattern, value.toString());
    });
  });

  return {
    template,
    variables,
    resolvedPath
  };
}

/**
 * Generate field paths for array-based structures
 */
export function generateArrayFieldPaths(
  baseTemplate: string,
  arraySize: number,
  startIndex: number = 0
): string[] {
  const paths: string[] = [];
  
  for (let i = startIndex; i < startIndex + arraySize; i++) {
    const resolvedPath = resolveDynamicFieldPath(baseTemplate, { index: i, i }).resolvedPath;
    paths.push(resolvedPath);
  }
  
  return paths;
}

// ============================================================================
// ENHANCED FIELD LOOKUP UTILITIES
// ============================================================================

/**
 * Enhanced field lookup with fallback strategies
 */
export function enhancedFieldLookup(
  sectionId: number,
  fieldPath: string,
  fallbackStrategies: boolean = true
): FieldMappingResult {
  const components = parseFieldPath(fieldPath);
  
  // Strategy 1: Direct lookup
  let fieldData = findFieldById(sectionId, fieldPath) ||
                  findFieldByName(sectionId, fieldPath) ||
                  findFieldByUniqueId(sectionId, fieldPath);

  if (fieldData) {
    return {
      success: true,
      fieldPath,
      fieldData
    };
  }

  if (!fallbackStrategies) {
    return {
      success: false,
      fieldPath,
      error: 'Field not found and fallback strategies disabled'
    };
  }

  // Strategy 2: Pattern-based lookup for complex paths
  if (components.isComplex) {
    const suggestions = findSimilarFieldPaths(sectionId, fieldPath);
    if (suggestions.length > 0) {
      // Try the most similar suggestion
      fieldData = findFieldByName(sectionId, suggestions[0]);
      if (fieldData) {
        return {
          success: true,
          fieldPath: suggestions[0],
          fieldData,
          suggestions
        };
      }
    }
  }

  // Strategy 3: Fuzzy matching for typos and variations
  const fuzzyMatches = findFuzzyFieldMatches(sectionId, fieldPath);
  if (fuzzyMatches.length > 0) {
    fieldData = findFieldByName(sectionId, fuzzyMatches[0]);
    if (fieldData) {
      return {
        success: true,
        fieldPath: fuzzyMatches[0],
        fieldData,
        suggestions: fuzzyMatches
      };
    }
  }

  return {
    success: false,
    fieldPath,
    error: 'Field not found after all lookup strategies',
    suggestions: [...findSimilarFieldPaths(sectionId, fieldPath), ...fuzzyMatches]
  };
}

/**
 * Find similar field paths based on pattern matching
 */
export function findSimilarFieldPaths(sectionId: number, targetPath: string): string[] {
  const allFields = getSectionFields(sectionId);
  const components = parseFieldPath(targetPath);
  
  const similarities: Array<{ path: string; score: number }> = [];
  
  allFields.forEach(field => {
    const fieldComponents = parseFieldPath(field.name);
    let score = 0;
    
    // Base path similarity
    if (fieldComponents.basePath === components.basePath) score += 50;
    else if (fieldComponents.basePath.includes(components.basePath) || 
             components.basePath.includes(fieldComponents.basePath)) score += 25;
    
    // Array index similarity
    if (fieldComponents.arrayIndex === components.arrayIndex) score += 20;
    
    // Field index similarity
    if (fieldComponents.fieldIndex === components.fieldIndex) score += 20;
    
    // Area index similarity
    if (fieldComponents.areaIndex === components.areaIndex) score += 20;
    
    // Sub-path similarity
    if (fieldComponents.subPath === components.subPath) score += 15;
    
    if (score > 30) { // Minimum threshold
      similarities.push({ path: field.name, score });
    }
  });
  
  return similarities
    .sort((a, b) => b.score - a.score)
    .slice(0, 5)
    .map(s => s.path);
}

/**
 * Find fuzzy matches for field names (handles typos and variations)
 */
export function findFuzzyFieldMatches(sectionId: number, targetPath: string): string[] {
  const allFields = getSectionFields(sectionId);
  const matches: Array<{ path: string; distance: number }> = [];
  
  allFields.forEach(field => {
    const distance = levenshteinDistance(targetPath.toLowerCase(), field.name.toLowerCase());
    const maxLength = Math.max(targetPath.length, field.name.length);
    const similarity = 1 - (distance / maxLength);
    
    if (similarity > 0.7) { // 70% similarity threshold
      matches.push({ path: field.name, distance });
    }
  });
  
  return matches
    .sort((a, b) => a.distance - b.distance)
    .slice(0, 3)
    .map(m => m.path);
}

/**
 * Calculate Levenshtein distance between two strings
 */
function levenshteinDistance(str1: string, str2: string): number {
  const matrix = Array(str2.length + 1).fill(null).map(() => Array(str1.length + 1).fill(null));
  
  for (let i = 0; i <= str1.length; i++) matrix[0][i] = i;
  for (let j = 0; j <= str2.length; j++) matrix[j][0] = j;
  
  for (let j = 1; j <= str2.length; j++) {
    for (let i = 1; i <= str1.length; i++) {
      const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
      matrix[j][i] = Math.min(
        matrix[j][i - 1] + 1,     // deletion
        matrix[j - 1][i] + 1,     // insertion
        matrix[j - 1][i - 1] + indicator // substitution
      );
    }
  }
  
  return matrix[str2.length][str1.length];
}

// ============================================================================
// FIELD VALIDATION AND DEBUGGING
// ============================================================================

/**
 * Validate field path structure and provide detailed feedback
 */
export function validateFieldPath(fieldPath: string): {
  isValid: boolean;
  issues: string[];
  suggestions: string[];
} {
  const issues: string[] = [];
  const suggestions: string[] = [];
  
  // Check for common issues
  if (fieldPath.includes('..')) {
    issues.push('Double dots (..) found in path');
    suggestions.push('Remove double dots from the path');
  }
  
  if (fieldPath.includes(' ')) {
    issues.push('Spaces found in field path');
    suggestions.push('Remove spaces or replace with underscores');
  }
  
  if (fieldPath.match(/\[\d+\].*\[\d+\]/)) {
    const components = parseFieldPath(fieldPath);
    if (!components.isComplex) {
      issues.push('Multiple array indices detected but not properly parsed');
      suggestions.push('Check array index syntax: [0], [1], etc.');
    }
  }
  
  // Check for unmatched brackets
  const openBrackets = (fieldPath.match(/\[/g) || []).length;
  const closeBrackets = (fieldPath.match(/\]/g) || []).length;
  if (openBrackets !== closeBrackets) {
    issues.push('Unmatched brackets in field path');
    suggestions.push('Ensure all [ have matching ]');
  }
  
  return {
    isValid: issues.length === 0,
    issues,
    suggestions
  };
}

/**
 * Debug field mapping issues with detailed analysis
 */
export function debugFieldMapping(
  sectionId: number,
  fieldPath: string
): {
  originalPath: string;
  components: FieldPathComponents;
  validation: ReturnType<typeof validateFieldPath>;
  lookupResult: FieldMappingResult;
  recommendations: string[];
} {
  const components = parseFieldPath(fieldPath);
  const validation = validateFieldPath(fieldPath);
  const lookupResult = enhancedFieldLookup(sectionId, fieldPath);

  const recommendations: string[] = [];

  if (!lookupResult.success) {
    recommendations.push('Field not found in PDF structure');

    if (components.isComplex) {
      recommendations.push('Try simplifying the field path');
      recommendations.push('Check if array indices are correct');
    }

    if (validation.issues.length > 0) {
      recommendations.push('Fix validation issues first');
    }

    if (lookupResult.suggestions && lookupResult.suggestions.length > 0) {
      recommendations.push(`Consider these similar fields: ${lookupResult.suggestions.slice(0, 3).join(', ')}`);
    }
  }

  return {
    originalPath: fieldPath,
    components,
    validation,
    lookupResult,
    recommendations
  };
}

// ============================================================================
// FIELD MAPPING CONFIGURATION SYSTEM
// ============================================================================

export interface FieldMappingConfig {
  sectionId: number;
  subsections: Record<string, SubsectionConfig>;
  globalPatterns: Record<string, string>;
  arrayMappings: Record<string, ArrayMappingConfig>;
}

export interface SubsectionConfig {
  basePath: string;
  fields: Record<string, FieldConfig>;
  arrayFields?: Record<string, ArrayFieldConfig>;
}

export interface FieldConfig {
  path: string;
  type?: string;
  label?: string;
  validation?: FieldValidationConfig;
}

export interface ArrayFieldConfig {
  template: string;
  maxEntries: number;
  startIndex?: number;
  indexVariable?: string;
}

export interface ArrayMappingConfig {
  template: string;
  dimensions: number[];
  variables: string[];
}

export interface FieldValidationConfig {
  required?: boolean;
  pattern?: string;
  minLength?: number;
  maxLength?: number;
}

/**
 * Enhanced field mapping configuration for complex sections
 */
export const ENHANCED_FIELD_MAPPINGS: Record<number, FieldMappingConfig> = {
  18: {
    sectionId: 18,
    subsections: {
      '18_1': {
        basePath: 'form1[0].Section18_1[{entryIndex}]',
        fields: {
          firstName: { path: '.TextField11[1]', type: 'PDFTextField', label: 'First Name' },
          middleName: { path: '.TextField11[2]', type: 'PDFTextField', label: 'Middle Name' },
          lastName: { path: '.TextField11[0]', type: 'PDFTextField', label: 'Last Name' },
          suffix: { path: '.suffix[0]', type: 'PDFDropdown', label: 'Suffix' },
          relationship: { path: '.DropDownList15[0]', type: 'PDFDropdown', label: 'Relationship' },
          citizenship: { path: '.DropDownList15[1]', type: 'PDFDropdown', label: 'Citizenship' },
          birthDate: { path: '.From_Datefield_Name_2[0]', type: 'PDFTextField', label: 'Birth Date' },
          birthDateEstimate: { path: '.#field[1]', type: 'PDFCheckBox', label: 'Birth Date Estimated' },
          birthPlace: { path: '.TextField11[3]', type: 'PDFTextField', label: 'Birth Place' },
        },
        arrayFields: {
          otherNames: {
            template: '.TextField11[{nameFieldIndex}]',
            maxEntries: 4,
            startIndex: 0,
            indexVariable: 'nameFieldIndex'
          }
        }
      },
      '18_2': {
        basePath: 'form1[0].Section18_2[{entryIndex}]',
        fields: {
          streetAddress: { path: '.TextField11[0]', type: 'PDFTextField', label: 'Street Address' },
          streetAddress2: { path: '.TextField11[1]', type: 'PDFTextField', label: 'Street Address 2' },
          city: { path: '.TextField11[2]', type: 'PDFTextField', label: 'City' },
          state: { path: '.School6_State[0]', type: 'PDFDropdown', label: 'State' },
          zipCode: { path: '.TextField11[3]', type: 'PDFTextField', label: 'ZIP Code' },
          country: { path: '.DropDownList15[0]', type: 'PDFDropdown', label: 'Country' },
          fromDate: { path: '.From_Datefield_Name_2[0]', type: 'PDFTextField', label: 'From Date' },
          fromDateEstimate: { path: '.#field[1]', type: 'PDFCheckBox', label: 'From Date Estimated' },
          toDate: { path: '.To_Datefield_Name_2[0]', type: 'PDFTextField', label: 'To Date' },
          toDateEstimate: { path: '.#field[2]', type: 'PDFCheckBox', label: 'To Date Estimated' },
          isPresent: { path: '.#field[3]', type: 'PDFCheckBox', label: 'Present' },
          apoFpoType: { path: '.DropDownList15[1]', type: 'PDFDropdown', label: 'APO/FPO Type' },
          apoFpoCode: { path: '.TextField11[4]', type: 'PDFTextField', label: 'APO/FPO Code' },
        }
      },
      '18_3': {
        basePath: 'form1[0].Section18_3[{entryIndex}]',
        fields: {
          // Contact methods
          contactInPerson: { path: '.#field[4]', type: 'PDFCheckBox', label: 'Contact In Person' },
          contactTelephone: { path: '.#field[2]', type: 'PDFCheckBox', label: 'Contact Telephone' },
          contactElectronic: { path: '.#field[3]', type: 'PDFCheckBox', label: 'Contact Electronic' },
          contactWritten: { path: '.#field[5]', type: 'PDFCheckBox', label: 'Contact Written' },
          contactOther: { path: '.#field[6]', type: 'PDFCheckBox', label: 'Contact Other' },
          contactOtherExplanation: { path: '.TextField11[5]', type: 'PDFTextField', label: 'Contact Other Explanation' },
          // Contact frequency
          frequencyDaily: { path: '.#field[9]', type: 'PDFCheckBox', label: 'Frequency Daily' },
          frequencyWeekly: { path: '.#field[10]', type: 'PDFCheckBox', label: 'Frequency Weekly' },
          frequencyMonthly: { path: '.#field[7]', type: 'PDFCheckBox', label: 'Frequency Monthly' },
          frequencyQuarterly: { path: '.#field[13]', type: 'PDFCheckBox', label: 'Frequency Quarterly' },
          frequencyAnnually: { path: '.#field[8]', type: 'PDFCheckBox', label: 'Frequency Annually' },
          frequencyOther: { path: '.#field[12]', type: 'PDFCheckBox', label: 'Frequency Other' },
          frequencyOtherExplanation: { path: '.TextField11[0]', type: 'PDFTextField', label: 'Frequency Other Explanation' },
          // Documentation types (18.4 functionality)
          docI551: { path: '.#field[30]', type: 'PDFCheckBox', label: 'I-551 Permanent Resident' },
          docI766: { path: '.#field[29]', type: 'PDFCheckBox', label: 'I-766 Employment Authorization' },
          docUSVisa: { path: '.#field[32]', type: 'PDFCheckBox', label: 'US Visa' },
          docI94: { path: '.#field[35]', type: 'PDFCheckBox', label: 'I-94 Arrival-Departure' },
          docI20: { path: '.#field[33]', type: 'PDFCheckBox', label: 'I-20 Student Certificate' },
          docDS2019: { path: '.#field[34]', type: 'PDFCheckBox', label: 'DS-2019 Exchange Visitor' },
          docOther: { path: '.#field[31]', type: 'PDFCheckBox', label: 'Other Documentation' },
          docNumber: { path: '.TextField11[7]', type: 'PDFTextField', label: 'Document Number' },
          docExpiration: { path: '.From_Datefield_Name_2[4]', type: 'PDFTextField', label: 'Document Expiration' },
          // Contact dates (18.5 functionality)
          firstContactDate: { path: '.#area[1].From_Datefield_Name_2[0]', type: 'PDFTextField', label: 'First Contact Date' },
          lastContactDate: { path: '.#area[1].From_Datefield_Name_2[1]', type: 'PDFTextField', label: 'Last Contact Date' },
        }
      }
    },
    globalPatterns: {
      entryIndex: '{entryIndex}',
      fieldIndex: '{fieldIndex}',
      areaIndex: '{areaIndex}'
    },
    arrayMappings: {
      otherNames: {
        template: 'form1[0].Section18_1[{entryIndex}].TextField11[{nameFieldIndex}]',
        dimensions: [4], // 4 other names per relative
        variables: ['entryIndex', 'nameFieldIndex']
      }
    }
  }
};

/**
 * Resolve field path using enhanced configuration
 */
export function resolveFieldPathFromConfig(
  sectionId: number,
  subsection: string,
  fieldName: string,
  variables: Record<string, number> = {}
): string | null {
  const config = ENHANCED_FIELD_MAPPINGS[sectionId];
  if (!config) return null;

  const subsectionConfig = config.subsections[subsection];
  if (!subsectionConfig) return null;

  const fieldConfig = subsectionConfig.fields[fieldName];
  if (!fieldConfig) return null;

  // Resolve base path
  let resolvedPath = subsectionConfig.basePath + fieldConfig.path;

  // Apply variable substitutions
  Object.entries(variables).forEach(([varName, value]) => {
    resolvedPath = resolvedPath.replace(new RegExp(`\\{${varName}\\}`, 'g'), value.toString());
  });

  return resolvedPath;
}
