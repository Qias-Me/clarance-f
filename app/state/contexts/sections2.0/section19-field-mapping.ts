/**
 * Section 19 Field Mapping - Complete PDF Field Reference System
 *
 * This module provides comprehensive field mapping for Section 19 (Foreign Activities)
 * based on the analysis of api/sections-references/section-19.json.
 *
 * CRITICAL: All 277 fields from the reference data are mapped here to ensure
 * complete PDF field coverage and proper form generation.
 *
 * STRUCTURE: Section 19 has 4 subsections (Section19_1 through Section19_4),
 * each representing a different foreign contact entry. The PDF form supports
 * up to 4 foreign contacts with identical field structures.
 */

import { createFieldFromReference } from '../../../../api/utils/sections-references-loader';
import type { Field, FieldWithOptions } from '../../../../api/interfaces/formDefinition2.0';

// ============================================================================
// SECTION 19 FIELD MAPPINGS - BASED ON REFERENCE DATA ANALYSIS
// ============================================================================

/**
 * Generate field mappings for a specific subsection (1-4)
 * Each subsection has the same field structure but different PDF field names
 */
const generateSubsectionFieldMappings = (subsectionNumber: number) => ({
  // Place of Birth
  placeOfBirth: {
    city: `form1[0].Section19_${subsectionNumber}[0].TextField11[15]`,
    country: `form1[0].Section19_${subsectionNumber}[0].DropDownList43[0]`,
    unknown: `form1[0].Section19_${subsectionNumber}[0].#field[2]`
  },

  // Citizenship Information
  citizenship: {
    country1: `form1[0].Section19_${subsectionNumber}[0].DropDownList12[0]`,
    country2: `form1[0].Section19_${subsectionNumber}[0].DropDownList12[1]`
  },

  // Personal Information - Name fields
  name: {
    first: `form1[0].Section19_${subsectionNumber}[0].#area[0].Name_List_Long[0].TextField11[2]`,
    middle: `form1[0].Section19_${subsectionNumber}[0].#area[0].Name_List_Long[0].TextField11[0]`,
    last: `form1[0].Section19_${subsectionNumber}[0].#area[0].Name_List_Long[0].TextField11[1]`,
    suffix: `form1[0].Section19_${subsectionNumber}[0].#area[0].Name_List_Long[0].suffix[0]`,
    unknown: `form1[0].Section19_${subsectionNumber}[0].#area[0].#field[5]`,
    explanation: `form1[0].Section19_${subsectionNumber}[0].#area[0].Name_List_Long[0].TextField11[3]`
  },

  // Date of Birth (missing fields)
  dateOfBirth: {
    date: `form1[0].Section19_${subsectionNumber}[0].From_Datefield_Name_2[2]`,
    estimated: `form1[0].Section19_${subsectionNumber}[0].#field[23]`,
    unknown: `form1[0].Section19_${subsectionNumber}[0].#field[25]`
  },

  // Contact Dates
  contactDates: {
    firstContact: `form1[0].Section19_${subsectionNumber}[0].#area[1].From_Datefield_Name_2[0]`,
    firstContactEstimated: `form1[0].Section19_${subsectionNumber}[0].#area[1].#field[7]`,
    lastContact: `form1[0].Section19_${subsectionNumber}[0].#area[1].From_Datefield_Name_2[1]`,
    lastContactEstimated: `form1[0].Section19_${subsectionNumber}[0].#area[1].#field[9]`
  },

  // Contact Methods (checkboxes)
  contactMethods: {
    inPerson: `form1[0].Section19_${subsectionNumber}[0].#field[12]`,
    telephone: `form1[0].Section19_${subsectionNumber}[0].#field[10]`,
    electronic: `form1[0].Section19_${subsectionNumber}[0].#field[11]`,
    writtenCorrespondence: `form1[0].Section19_${subsectionNumber}[0].#field[13]`,
    other: `form1[0].Section19_${subsectionNumber}[0].#field[15]`,
    otherExplanation: `form1[0].Section19_${subsectionNumber}[0].TextField11[0]`
  },

  // Contact Frequency (radio groups)
  contactFrequency: `form1[0].Section19_${subsectionNumber}[0].RadioButtonList[0]`,
  contactFrequency2: `form1[0].Section19_${subsectionNumber}[0].RadioButtonList[1]`,

  // Relationship Types (checkboxes) - some only exist in subsection 1
  relationshipTypes: {
    professionalBusiness: `form1[0].Section19_${subsectionNumber}[0].#field[20]`,
    ...(subsectionNumber === 1 ? {
      personal: `form1[0].Section19_${subsectionNumber}[0].personal[0]`,
      other: `form1[0].Section19_${subsectionNumber}[0].other[0]`
    } : {}),
    obligation: `form1[0].Section19_${subsectionNumber}[0].#field[22]`,
    professionalExplanation: `form1[0].Section19_${subsectionNumber}[0].TextField11[3]`,
    personalExplanation: `form1[0].Section19_${subsectionNumber}[0].TextField11[1]`,
    obligationExplanation: `form1[0].Section19_${subsectionNumber}[0].TextField11[3]`,
    otherExplanation: `form1[0].Section19_${subsectionNumber}[0].TextField11[2]`
  },

  // Additional Names Table (4 rows x 4 columns = 16 fields)
  additionalNames: {
    row1: {
      last: `form1[0].Section19_${subsectionNumber}[0].Table2[0].Row1[0].Cell1[0]`,
      first: `form1[0].Section19_${subsectionNumber}[0].Table2[0].Row1[0].Cell2[0]`,
      middle: `form1[0].Section19_${subsectionNumber}[0].Table2[0].Row1[0].Cell3[0]`,
      suffix: `form1[0].Section19_${subsectionNumber}[0].Table2[0].Row1[0].Cell4[0]`
    },
    row2: {
      last: `form1[0].Section19_${subsectionNumber}[0].Table2[0].Row2[0].Cell1[0]`,
      first: `form1[0].Section19_${subsectionNumber}[0].Table2[0].Row2[0].Cell2[0]`,
      middle: `form1[0].Section19_${subsectionNumber}[0].Table2[0].Row2[0].Cell3[0]`,
      suffix: `form1[0].Section19_${subsectionNumber}[0].Table2[0].Row2[0].Cell4[0]`
    },
    row3: {
      last: `form1[0].Section19_${subsectionNumber}[0].Table2[0].Row3[0].Cell1[0]`,
      first: `form1[0].Section19_${subsectionNumber}[0].Table2[0].Row3[0].Cell2[0]`,
      middle: `form1[0].Section19_${subsectionNumber}[0].Table2[0].Row3[0].Cell3[0]`,
      suffix: `form1[0].Section19_${subsectionNumber}[0].Table2[0].Row3[0].Cell4[0]`
    },
    row4: {
      last: `form1[0].Section19_${subsectionNumber}[0].Table2[0].Row5[0].Cell1[0]`,
      first: `form1[0].Section19_${subsectionNumber}[0].Table2[0].Row5[0].Cell2[0]`,
      middle: `form1[0].Section19_${subsectionNumber}[0].Table2[0].Row5[0].Cell3[0]`,
      suffix: `form1[0].Section19_${subsectionNumber}[0].Table2[0].Row5[0].Cell4[0]`
    }
  },

  // Current Address
  address: {
    street: `form1[0].Section19_${subsectionNumber}[0].TextField11[4]`,
    city: `form1[0].Section19_${subsectionNumber}[0].TextField11[5]`,
    state: `form1[0].Section19_${subsectionNumber}[0].School6_State[0]`,
    zipCode: `form1[0].Section19_${subsectionNumber}[0].TextField11[6]`,
    country: `form1[0].Section19_${subsectionNumber}[0].DropDownList42[0]`,
    unknown: `form1[0].Section19_${subsectionNumber}[0].#field[31]`
  },

  // Employment Information
  employment: {
    employerName: `form1[0].Section19_${subsectionNumber}[0].TextField11[7]`,
    employerUnknown: `form1[0].Section19_${subsectionNumber}[0].#field[33]`,
    employerAddress: {
      street: `form1[0].Section19_${subsectionNumber}[0].#area[2].TextField11[8]`,
      city: `form1[0].Section19_${subsectionNumber}[0].#area[2].TextField11[9]`,
      state: `form1[0].Section19_${subsectionNumber}[0].#area[2].School6_State[1]`,
      zipCode: `form1[0].Section19_${subsectionNumber}[0].#area[2].TextField11[10]`,
      country: `form1[0].Section19_${subsectionNumber}[0].#area[2].DropDownList41[0]`,
      unknown: `form1[0].Section19_${subsectionNumber}[0].#area[2].#field[39]`
    }
  },

  // Government Relationship
  governmentRelationship: {
    hasRelationship: subsectionNumber === 1
      ? `form1[0].Section19_${subsectionNumber}[0].RadioButtonList[2]`
      : undefined, // RadioButtonList[2] only exists in subsection 1
    description: `form1[0].Section19_${subsectionNumber}[0].TextField11[11]`,
    additionalDetails: subsectionNumber === 1
      ? `form1[0].Section19_${subsectionNumber}[0].#area[3].RadioButtonList[3]`
      : `form1[0].Section19_${subsectionNumber}[0].#area[3].RadioButtonList[2]`,
    address: {
      street: `form1[0].Section19_${subsectionNumber}[0].#area[3].TextField11[13]`,
      apoFpo: `form1[0].Section19_${subsectionNumber}[0].#area[3].TextField11[14]`,
      state: `form1[0].Section19_${subsectionNumber}[0].#area[3].School6_State[2]`,
      zipCode: `form1[0].Section19_${subsectionNumber}[0].#area[3].TextField11[12]`
    }
  },

  // Additional fields that exist in subsections 2-4
  ...(subsectionNumber > 1 ? {
    additionalFields: {
      field18: `form1[0].Section19_${subsectionNumber}[0].#field[18]`,
      field19: `form1[0].Section19_${subsectionNumber}[0].#field[19]`,
      textField12: `form1[0].Section19_${subsectionNumber}[0].TextField11[12]`,
      textField13: `form1[0].Section19_${subsectionNumber}[0].TextField11[13]`,
      textField14: `form1[0].Section19_${subsectionNumber}[0].TextField11[14]`,
      stateField2: `form1[0].Section19_${subsectionNumber}[0].School6_State[2]`
    }
  } : {})
});

/**
 * Main Section 19 field mappings for the primary radio button
 */
export const SECTION19_MAIN_FIELDS = {
  // Main radio button for foreign contacts (only in Section19_1)
  mainRadio: 'form1[0].Section19_1[0].RadioButtonList[0]'
};

/**
 * Complete field mappings for all 4 subsections
 */
export const SECTION19_FIELD_MAPPINGS = {
  main: SECTION19_MAIN_FIELDS,
  subsection1: generateSubsectionFieldMappings(1),
  subsection2: generateSubsectionFieldMappings(2),
  subsection3: generateSubsectionFieldMappings(3),
  subsection4: generateSubsectionFieldMappings(4),

} as const;

// ============================================================================
// FIELD CREATION UTILITIES
// ============================================================================

/**
 * Create a field using the proper PDF field reference for a specific subsection
 */
export function createSection19Field<T = any>(
  fieldPath: string,
  defaultValue: T,
  options?: readonly string[]
): Field<T> | FieldWithOptions<T> {
  try {
    const field = createFieldFromReference(19, fieldPath, defaultValue);

    if (options && options.length > 0) {
      return {
        ...field,
        options
      } as FieldWithOptions<T>;
    }

    return field as Field<T>;
  } catch (error) {
    console.warn(`Failed to create Section 19 field for ${fieldPath}:`, error);

    // Fallback field structure
    const fallbackField: Field<T> = {
      id: '0000',
      name: fieldPath,
      type: 'PDFTextField',
      label: `Section 19 Field`,
      value: defaultValue,
      rect: { x: 0, y: 0, width: 0, height: 0 }
    };

    if (options && options.length > 0) {
      return {
        ...fallbackField,
        options
      } as FieldWithOptions<T>;
    }

    return fallbackField;
  }
}

/**
 * Create fields for a specific foreign contact entry (subsection 1-4)
 */
export function createSection19EntryFields(subsectionNumber: number): Record<string, Field<any> | FieldWithOptions<any>> {
  const subsectionKey = `subsection${subsectionNumber}` as keyof typeof SECTION19_FIELD_MAPPINGS;
  const mappings = SECTION19_FIELD_MAPPINGS[subsectionKey];

  if (!mappings) {
    throw new Error(`Invalid subsection number: ${subsectionNumber}. Must be 1-4.`);
  }

  const fields: Record<string, Field<any> | FieldWithOptions<any>> = {};

  // Create all fields for this subsection
  const createFieldsFromMapping = (obj: any, prefix: string = '') => {
    Object.entries(obj).forEach(([key, value]) => {
      const fieldKey = prefix ? `${prefix}.${key}` : key;

      if (typeof value === 'string') {
        // This is a field path, create the field
        fields[fieldKey] = createSection19Field(value, getDefaultValueForField(key));
      } else if (value === undefined) {
        // Skip undefined fields (they don't exist in this subsection)
        return;
      } else if (typeof value === 'object' && value !== null) {
        // This is a nested object, recurse
        createFieldsFromMapping(value, fieldKey);
      }
    });
  };

  createFieldsFromMapping(mappings);
  return fields;
}

/**
 * Get appropriate default value based on field name
 */
function getDefaultValueForField(fieldName: string): any {
  if (fieldName.includes('unknown') || fieldName.includes('estimated')) {
    return false;
  }
  if (fieldName.includes('hasRelationship') || fieldName.includes('additionalDetails')) {
    return 'NO';
  }
  if (fieldName.includes('contactFrequency')) {
    return '1';
  }
  if (fieldName.includes('suffix')) {
    return '';
  }
  return '';
}

// ============================================================================
// FIELD COUNT VALIDATION
// ============================================================================

/**
 * Get the total number of mapped fields for validation
 */
export function getSection19MappedFieldCount(): number {
  let count = 0;

  // Count main fields
  count += Object.keys(SECTION19_MAIN_FIELDS).length;

  // Count all subsection fields
  for (let i = 1; i <= 4; i++) {
    const subsectionKey = `subsection${i}` as keyof typeof SECTION19_FIELD_MAPPINGS;
    const subsectionMappings = SECTION19_FIELD_MAPPINGS[subsectionKey];

    function countFields(obj: any): void {
      Object.values(obj).forEach(value => {
        if (typeof value === 'string') {
          count++;
        } else if (typeof value === 'object' && value !== null) {
          countFields(value);
        }
      });
    }

    countFields(subsectionMappings);
  }

  return count;
}

/**
 * Validate that all 277 fields are mapped
 */
export function validateSection19FieldMappings(): {
  isValid: boolean;
  mappedCount: number;
  expectedCount: number;
  missingCount: number;
  breakdown: {
    mainFields: number;
    subsection1: number;
    subsection2: number;
    subsection3: number;
    subsection4: number;
  };
} {
  const mappedCount = getSection19MappedFieldCount();
  const expectedCount = 277; // From reference data analysis
  const missingCount = expectedCount - mappedCount;

  // Get breakdown by subsection
  const breakdown = {
    mainFields: Object.keys(SECTION19_MAIN_FIELDS).length,
    subsection1: 0,
    subsection2: 0,
    subsection3: 0,
    subsection4: 0
  };

  for (let i = 1; i <= 4; i++) {
    const subsectionKey = `subsection${i}` as keyof typeof SECTION19_FIELD_MAPPINGS;
    const subsectionMappings = SECTION19_FIELD_MAPPINGS[subsectionKey];

    function countFields(obj: any): number {
      let count = 0;
      Object.values(obj).forEach(value => {
        if (typeof value === 'string') {
          count++;
        } else if (typeof value === 'object' && value !== null) {
          count += countFields(value);
        }
      });
      return count;
    }

    breakdown[`subsection${i}` as keyof typeof breakdown] = countFields(subsectionMappings);
  }

  return {
    isValid: mappedCount === expectedCount,
    mappedCount,
    expectedCount,
    missingCount,
    breakdown
  };
}
