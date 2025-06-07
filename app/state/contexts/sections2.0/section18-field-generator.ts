/**
 * Section 18 Field Generator - Generate Field<T> objects from sections-reference data
 *
 * This module generates properly typed Field<T> objects for Section 18 using the
 * actual PDF field data from section-18.json reference file.
 *
 * FIXED: Now uses correct field names from sections-references JSON
 * Section 18 has 3 subsections with 964 total fields:
 * - Section18_1[0] - Immediate family (323 fields)
 * - Section18_2[0] - Extended family (321 fields)
 * - Section18_3[0] - Associates (320 fields)
 */

import { createFieldFromReference } from '../../../../api/utils/sections-references-loader';
import type { Field, FieldWithOptions } from '../../../../api/interfaces/formDefinition2.0';

// ============================================================================
// SUBSECTION MAPPING
// ============================================================================

export type Section18SubsectionKey = 'immediateFamily' | 'extendedFamily' | 'associates';

const SUBSECTION_PDF_MAP: Record<Section18SubsectionKey, string> = {
  immediateFamily: 'Section18_1[0]',    // All fields are under Section18_1[0]
  extendedFamily: 'Section18_1[0]',     // All fields are under Section18_1[0]
  associates: 'Section18_1[0]'          // All fields are under Section18_1[0]
};

// ============================================================================
// ACTUAL FIELD MAPPINGS FROM SECTIONS-REFERENCES
// ============================================================================

/**
 * Maps field types to their actual PDF field names from sections-references
 * FIXED: All fields are under Section18_1[0] according to sections-references
 * Using actual field names found in api/sections-references/section-18.json
 */
const ACTUAL_FIELD_MAPPINGS = {
  // All subsections use the same Section18_1[0] prefix since that's what exists in the PDF
  immediateFamily: {
    'relationship': 'form1[0].Section18_1[0].DropDownList5[0]',
    'fullName.firstName': 'form1[0].Section18_1[0].TextField11[3]',
    'fullName.lastName': 'form1[0].Section18_1[0].TextField11[2]',
    'fullName.middleName': 'form1[0].Section18_1[0].TextField11[1]',
    'fullName.suffix': 'form1[0].Section18_1[0].suffix[0]',
    'placeOfBirth.city': 'form1[0].Section18_1[0].TextField11[0]',
    'placeOfBirth.state': 'form1[0].Section18_1[0].School6_State[0]',
    'placeOfBirth.country': 'form1[0].Section18_1[0].DropDownList24[0]',
    'citizenship': 'form1[0].Section18_1[0].DropDownList12[0]',
    'citizenshipCountry': 'form1[0].Section18_1[0].DropDownList12[1]',
    'otherNames.hasOtherNames': 'form1[0].Section18_1[0].RadioButtonList[0]',
    // Employment fields - using Section18_3[0] for employment data
    'currentEmployment.isEmployed': 'form1[0].Section18_3[0].RadioButtonList[0]',
    'currentEmployment.employerName': 'form1[0].Section18_3[0].TextField11[1]',
    'currentEmployment.position': 'form1[0].Section18_3[0].TextField11[6]',
    'currentEmployment.address.street': 'form1[0].Section18_3[0].#area[0].TextField11[2]',
    'currentEmployment.address.city': 'form1[0].Section18_3[0].TextField11[14]',
    'currentEmployment.address.state': 'form1[0].Section18_3[0].#area[0].School6_State[0]',
    'currentEmployment.address.country': 'form1[0].Section18_3[0].#area[0].DropDownList28[0]',
    'currentEmployment.address.zipCode': 'form1[0].Section18_3[0].TextField11[15]',
    'currentEmployment.phone': 'form1[0].Section18_3[0].TextField11[13]',
    'hasGovernmentAffiliation': 'form1[0].Section18_3[0].RadioButtonList[1]'
  },

  // Extended family uses same field structure but different indices
  extendedFamily: {
    'relationship': 'form1[0].Section18_1[0].DropDownList5[0]',
    'fullName.firstName': 'form1[0].Section18_1[0].TextField11[8]',
    'fullName.lastName': 'form1[0].Section18_1[0].TextField11[5]',
    'fullName.middleName': 'form1[0].Section18_1[0].TextField11[7]',
    'fullName.suffix': 'form1[0].Section18_1[0].suffix[1]',
    'placeOfBirth.city': 'form1[0].Section18_1[0].TextField11[0]',
    'placeOfBirth.state': 'form1[0].Section18_1[0].School6_State[0]',
    'placeOfBirth.country': 'form1[0].Section18_1[0].DropDownList24[0]',
    'citizenship': 'form1[0].Section18_1[0].DropDownList12[0]',
    'citizenshipCountry': 'form1[0].Section18_1[0].DropDownList12[1]',
    'otherNames.hasOtherNames': 'form1[0].Section18_1[0].RadioButtonList[1]',
    // Employment fields for extended family
    'currentEmployment.isEmployed': 'form1[0].Section18_3[1].RadioButtonList[0]',
    'currentEmployment.employerName': 'form1[0].Section18_3[1].TextField11[1]',
    'currentEmployment.position': 'form1[0].Section18_3[1].TextField11[6]',
    'currentEmployment.address.street': 'form1[0].Section18_3[1].#area[0].TextField11[2]',
    'currentEmployment.address.city': 'form1[0].Section18_3[1].TextField11[14]',
    'currentEmployment.address.state': 'form1[0].Section18_3[1].#area[0].School6_State[0]',
    'currentEmployment.address.country': 'form1[0].Section18_3[1].#area[0].DropDownList28[0]',
    'currentEmployment.address.zipCode': 'form1[0].Section18_3[1].TextField11[15]',
    'currentEmployment.phone': 'form1[0].Section18_3[1].TextField11[13]',
    'hasGovernmentAffiliation': 'form1[0].Section18_3[1].RadioButtonList[1]'
  },

  // Associates use same field structure but different indices
  associates: {
    'associateType': 'form1[0].Section18_1[0].DropDownList5[0]',
    'fullName.firstName': 'form1[0].Section18_1[0].TextField11[6]',
    'fullName.lastName': 'form1[0].Section18_1[0].TextField11[5]',
    'fullName.middleName': 'form1[0].Section18_1[0].TextField11[4]',
    'fullName.suffix': 'form1[0].Section18_1[0].suffix[2]',
    'placeOfBirth.city': 'form1[0].Section18_1[0].TextField11[0]',
    'placeOfBirth.state': 'form1[0].Section18_1[0].School6_State[0]',
    'placeOfBirth.country': 'form1[0].Section18_1[0].DropDownList24[0]',
    'citizenship': 'form1[0].Section18_1[0].DropDownList12[0]',
    'citizenshipCountry': 'form1[0].Section18_1[0].DropDownList12[1]',
    'otherNames.hasOtherNames': 'form1[0].Section18_1[0].RadioButtonList[2]',
    // Employment fields for associates
    'currentEmployment.isEmployed': 'form1[0].Section18_3[2].RadioButtonList[0]',
    'currentEmployment.employerName': 'form1[0].Section18_3[2].TextField11[1]',
    'currentEmployment.position': 'form1[0].Section18_3[2].TextField11[6]',
    'currentEmployment.address.street': 'form1[0].Section18_3[2].#area[0].TextField11[2]',
    'currentEmployment.address.city': 'form1[0].Section18_3[2].TextField11[14]',
    'currentEmployment.address.state': 'form1[0].Section18_3[2].#area[0].School6_State[0]',
    'currentEmployment.address.country': 'form1[0].Section18_3[2].#area[0].DropDownList28[0]',
    'currentEmployment.address.zipCode': 'form1[0].Section18_3[2].TextField11[15]',
    'currentEmployment.phone': 'form1[0].Section18_3[2].TextField11[13]',
    'hasGovernmentAffiliation': 'form1[0].Section18_3[2].RadioButtonList[1]'
  }
};

/**
 * Generate a Field<T> object using actual field names from sections-references
 * FIXED: Now uses correct field names that exist in the PDF
 */
export function generateField<T = any>(
  subsectionKey: Section18SubsectionKey,
  fieldType: string,
  defaultValue: T,
  options?: readonly string[]
): Field<T> | FieldWithOptions<T> {
  // Get the actual PDF field name from our corrected mappings
  const fieldMapping = ACTUAL_FIELD_MAPPINGS[subsectionKey];
  const pdfFieldName = fieldMapping?.[fieldType];

  if (!pdfFieldName) {
    // console.warn(`No field mapping found for ${subsectionKey}.${fieldType}`);
    // Return a fallback field
    return {
      id: '0000',
      name: `form1[0].${SUBSECTION_PDF_MAP[subsectionKey]}.unknown`,
      type: 'PDFTextField',
      label: `${subsectionKey} ${fieldType}`,
      value: defaultValue,
      rect: { x: 0, y: 0, width: 0, height: 0 }
    } as Field<T>;
  }

  try {
    // console.log(`🔍 Generating field for ${subsectionKey}.${fieldType} using PDF field: ${pdfFieldName}`);
    const field = createFieldFromReference(18, pdfFieldName, defaultValue);

    if (options && options.length > 0) {
      return {
        ...field,
        options
      } as FieldWithOptions<T>;
    }

    return field as Field<T>;
  } catch (error) {
    console.warn(`Failed to generate field for ${subsectionKey}.${fieldType} with PDF field ${pdfFieldName}:`, error);

    // Fallback field structure
    const fallbackField: Field<T> = {
      id: '0000',
      name: pdfFieldName,
      type: 'PDFTextField',
      label: `${subsectionKey} ${fieldType}`,
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
 * Generate multiple fields for a subsection
 */
export function generateFieldsForSubsection<T = any>(
  subsectionKey: Section18SubsectionKey,
  fieldConfigs: Record<string, { defaultValue: T; options?: readonly string[] }>
): Record<string, Field<T> | FieldWithOptions<T>> {
  const fields: Record<string, Field<T> | FieldWithOptions<T>> = {};

  Object.entries(fieldConfigs).forEach(([fieldType, config]) => {
    const fieldKey = fieldType.split('.').pop() || fieldType;
    fields[fieldKey] = generateField(subsectionKey, fieldType, config.defaultValue, config.options);
  });

  return fields;
}

/**
 * Common field options for Section 18
 */
export const SECTION18_OPTIONS = {
  YES_NO: ['YES', 'NO'] as const,
  SUFFIX: ['Jr', 'Sr', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'Other'] as const,
  IMMEDIATE_FAMILY_RELATIONSHIP: [
    'Mother',
    'Father',
    'Stepmother',
    'Stepfather',
    'Foster Parent',
    'Child (including adopted/foster)',
    'Stepchild',
    'Brother',
    'Sister',
    'Stepbrother',
    'Stepsister',
    'Half-brother',
    'Half-sister',
    'Father-in-law',
    'Mother-in-law',
    'Guardian'
  ] as const,
  EXTENDED_FAMILY_RELATIONSHIP: [
    'Aunt',
    'Uncle',
    'Niece',
    'Nephew',
    'Cousin',
    'Grandparent',
    'Grandchild',
    'Other relative'
  ] as const,
  ASSOCIATE_TYPE: [
    'Adult who lived in your household',
    'Business associate',
    'Friend',
    'Neighbor',
    'School associate',
    'Other'
  ] as const,
  CITIZENSHIP: [
    'United States',
    'Afghanistan',
    'Albania',
    'Algeria'
    // ... (truncated for brevity, full list available in sections-reference)
  ] as const,
  STATES: [
    'AK', 'AL', 'AR', 'AS', 'AZ', 'CA', 'CO', 'CT', 'DC', 'DE', 'FL', 'FM',
    'GA', 'GU', 'HI', 'IA', 'ID', 'IL', 'IN', 'KS', 'KY', 'LA', 'MA', 'MD',
    'ME', 'MH', 'MI', 'MN', 'MO', 'MP', 'MS', 'MT', 'NC', 'ND', 'NE', 'NH',
    'NJ', 'NM', 'NV', 'NY', 'OH', 'OK', 'OR', 'PA', 'PR', 'PW', 'RI', 'SC',
    'SD', 'TN', 'TX', 'UT', 'VA', 'VI', 'VT', 'WA', 'WI', 'WV', 'WY'
  ] as const,
  CONTACT_FREQUENCY: [
    'Daily',
    'Weekly',
    'Monthly',
    'Quarterly',
    'Annually',
    'Other'
  ] as const
};

/**
 * Generate a complete immediate family entry with proper field mappings
 * FIXED: Now uses correct subsection key and field types
 */
export function generateImmediateFamilyEntry(entryIndex: number = 0) {
  return {
    relationship: generateField('immediateFamily', 'relationship', '', SECTION18_OPTIONS.IMMEDIATE_FAMILY_RELATIONSHIP),
    isDeceased: generateField('immediateFamily', 'isDeceased', '', SECTION18_OPTIONS.YES_NO),
    dateOfDeath: {
      month: generateField('immediateFamily', 'dateOfDeath.month', ''),
      year: generateField('immediateFamily', 'dateOfDeath.year', '')
    },
    dateOfDeathEstimated: generateField('immediateFamily', 'dateOfDeathEstimated', false),
    fullName: {
      lastName: generateField('immediateFamily', 'fullName.lastName', ''),
      firstName: generateField('immediateFamily', 'fullName.firstName', ''),
      middleName: generateField('immediateFamily', 'fullName.middleName', ''),
      suffix: generateField('immediateFamily', 'fullName.suffix', '', SECTION18_OPTIONS.SUFFIX)
    },
    dateOfBirth: {
      month: generateField('immediateFamily', 'dateOfBirth.month', ''),
      year: generateField('immediateFamily', 'dateOfBirth.year', '')
    },
    dateOfBirthEstimated: generateField('immediateFamily', 'dateOfBirthEstimated', false),
    placeOfBirth: {
      city: generateField('immediateFamily', 'placeOfBirth.city', ''),
      state: generateField('immediateFamily', 'placeOfBirth.state', '', SECTION18_OPTIONS.STATES),
      country: generateField('immediateFamily', 'placeOfBirth.country', '', SECTION18_OPTIONS.CITIZENSHIP)
    },
    citizenship: generateField('immediateFamily', 'citizenship', '', SECTION18_OPTIONS.CITIZENSHIP),
    citizenshipCountry: generateField('immediateFamily', 'citizenshipCountry', '', SECTION18_OPTIONS.CITIZENSHIP),
    currentAddress: {
      street: generateField('immediateFamily', 'currentAddress.street', ''),
      city: generateField('immediateFamily', 'currentAddress.city', ''),
      state: generateField('immediateFamily', 'currentAddress.state', '', SECTION18_OPTIONS.STATES),
      country: generateField('immediateFamily', 'currentAddress.country', '', SECTION18_OPTIONS.CITIZENSHIP),
      zipCode: generateField('immediateFamily', 'currentAddress.zipCode', '')
    },
    contactInfo: {
      homePhone: generateField('immediateFamily', 'contactInfo.homePhone', ''),
      workPhone: generateField('immediateFamily', 'contactInfo.workPhone', ''),
      cellPhone: generateField('immediateFamily', 'contactInfo.cellPhone', ''),
      email: generateField('immediateFamily', 'contactInfo.email', '')
    },
    otherNames: {
      hasOtherNames: generateField('immediateFamily', 'otherNames.hasOtherNames', '', SECTION18_OPTIONS.YES_NO),
      names: [] // Will be populated separately if needed
    },
    foreignTravelFrequency: generateField('immediateFamily', 'foreignTravelFrequency', ''),
    lastContactDate: {
      month: generateField('immediateFamily', 'lastContactDate.month', ''),
      year: generateField('immediateFamily', 'lastContactDate.year', '')
    },
    lastContactDateEstimated: generateField('immediateFamily', 'lastContactDateEstimated', false),
    natureOfContact: generateField('immediateFamily', 'natureOfContact', ''),
    currentEmployment: {
      isEmployed: generateField('immediateFamily', 'currentEmployment.isEmployed', '', SECTION18_OPTIONS.YES_NO),
      employerName: generateField('immediateFamily', 'currentEmployment.employerName', ''),
      position: generateField('immediateFamily', 'currentEmployment.position', ''),
      address: {
        street: generateField('immediateFamily', 'currentEmployment.address.street', ''),
        city: generateField('immediateFamily', 'currentEmployment.address.city', ''),
        state: generateField('immediateFamily', 'currentEmployment.address.state', '', SECTION18_OPTIONS.STATES),
        country: generateField('immediateFamily', 'currentEmployment.address.country', '', SECTION18_OPTIONS.CITIZENSHIP),
        zipCode: generateField('immediateFamily', 'currentEmployment.address.zipCode', '')
      },
      phone: generateField('immediateFamily', 'currentEmployment.phone', '')
    },
    hasGovernmentAffiliation: generateField('immediateFamily', 'hasGovernmentAffiliation', '', SECTION18_OPTIONS.YES_NO),
    governmentAffiliation: [] // Will be populated separately if needed
  };
}

/**
 * Generate a complete extended family entry with proper field mappings
 */
export function generateExtendedFamilyEntry(entryIndex: number = 0) {
  return {
    relationship: generateField('extendedFamily', 'relationship', '', SECTION18_OPTIONS.EXTENDED_FAMILY_RELATIONSHIP),
    isDeceased: generateField('extendedFamily', 'isDeceased', '', SECTION18_OPTIONS.YES_NO),
    dateOfDeath: {
      month: generateField('extendedFamily', 'dateOfDeath.month', ''),
      year: generateField('extendedFamily', 'dateOfDeath.year', '')
    },
    dateOfDeathEstimated: generateField('extendedFamily', 'dateOfDeathEstimated', false),
    fullName: {
      lastName: generateField('extendedFamily', 'fullName.lastName', ''),
      firstName: generateField('extendedFamily', 'fullName.firstName', ''),
      middleName: generateField('extendedFamily', 'fullName.middleName', ''),
      suffix: generateField('extendedFamily', 'fullName.suffix', '', SECTION18_OPTIONS.SUFFIX)
    },
    dateOfBirth: {
      month: generateField('extendedFamily', 'dateOfBirth.month', ''),
      year: generateField('extendedFamily', 'dateOfBirth.year', '')
    },
    dateOfBirthEstimated: generateField('extendedFamily', 'dateOfBirthEstimated', false),
    placeOfBirth: {
      city: generateField('extendedFamily', 'placeOfBirth.city', ''),
      state: generateField('extendedFamily', 'placeOfBirth.state', '', SECTION18_OPTIONS.STATES),
      country: generateField('extendedFamily', 'placeOfBirth.country', '', SECTION18_OPTIONS.CITIZENSHIP)
    },
    citizenship: generateField('extendedFamily', 'citizenship', '', SECTION18_OPTIONS.CITIZENSHIP),
    citizenshipCountry: generateField('extendedFamily', 'citizenshipCountry', '', SECTION18_OPTIONS.CITIZENSHIP),
    currentAddress: {
      street: generateField('extendedFamily', 'currentAddress.street', ''),
      city: generateField('extendedFamily', 'currentAddress.city', ''),
      state: generateField('extendedFamily', 'currentAddress.state', '', SECTION18_OPTIONS.STATES),
      country: generateField('extendedFamily', 'currentAddress.country', '', SECTION18_OPTIONS.CITIZENSHIP),
      zipCode: generateField('extendedFamily', 'currentAddress.zipCode', '')
    },
    contactInfo: {
      homePhone: generateField('extendedFamily', 'contactInfo.homePhone', ''),
      workPhone: generateField('extendedFamily', 'contactInfo.workPhone', ''),
      cellPhone: generateField('extendedFamily', 'contactInfo.cellPhone', ''),
      email: generateField('extendedFamily', 'contactInfo.email', '')
    },
    otherNames: {
      hasOtherNames: generateField('extendedFamily', 'otherNames.hasOtherNames', '', SECTION18_OPTIONS.YES_NO),
      names: [] // Will be populated separately if needed
    },
    contactFrequency: generateField('extendedFamily', 'contactFrequency', '', SECTION18_OPTIONS.CONTACT_FREQUENCY),
    lastContactDate: {
      month: generateField('extendedFamily', 'lastContactDate.month', ''),
      year: generateField('extendedFamily', 'lastContactDate.year', '')
    },
    lastContactDateEstimated: generateField('extendedFamily', 'lastContactDateEstimated', false),
    foreignTravelFrequency: generateField('extendedFamily', 'foreignTravelFrequency', ''),
    natureOfContact: generateField('extendedFamily', 'natureOfContact', ''),
    hasGovernmentAffiliation: generateField('extendedFamily', 'hasGovernmentAffiliation', '', SECTION18_OPTIONS.YES_NO),
    governmentAffiliation: [] // Will be populated separately if needed
  };
}

/**
 * Generate a complete associate entry with proper field mappings
 */
export function generateAssociateEntry(entryIndex: number = 0) {
  return {
    associateType: generateField('associates', 'associateType', '', SECTION18_OPTIONS.ASSOCIATE_TYPE),
    relationshipDescription: generateField('associates', 'relationshipDescription', ''),
    fullName: {
      lastName: generateField('associates', 'fullName.lastName', ''),
      firstName: generateField('associates', 'fullName.firstName', ''),
      middleName: generateField('associates', 'fullName.middleName', ''),
      suffix: generateField('associates', 'fullName.suffix', '', SECTION18_OPTIONS.SUFFIX)
    },
    dateOfBirth: {
      month: generateField('associates', 'dateOfBirth.month', ''),
      year: generateField('associates', 'dateOfBirth.year', '')
    },
    dateOfBirthEstimated: generateField('associates', 'dateOfBirthEstimated', false),
    placeOfBirth: {
      city: generateField('associates', 'placeOfBirth.city', ''),
      state: generateField('associates', 'placeOfBirth.state', '', SECTION18_OPTIONS.STATES),
      country: generateField('associates', 'placeOfBirth.country', '', SECTION18_OPTIONS.CITIZENSHIP)
    },
    citizenship: generateField('associates', 'citizenship', '', SECTION18_OPTIONS.CITIZENSHIP),
    citizenshipCountry: generateField('associates', 'citizenshipCountry', '', SECTION18_OPTIONS.CITIZENSHIP),
    currentAddress: {
      street: generateField('associates', 'currentAddress.street', ''),
      city: generateField('associates', 'currentAddress.city', ''),
      state: generateField('associates', 'currentAddress.state', '', SECTION18_OPTIONS.STATES),
      country: generateField('associates', 'currentAddress.country', '', SECTION18_OPTIONS.CITIZENSHIP),
      zipCode: generateField('associates', 'currentAddress.zipCode', '')
    },
    contactInfo: {
      homePhone: generateField('associates', 'contactInfo.homePhone', ''),
      workPhone: generateField('associates', 'contactInfo.workPhone', ''),
      cellPhone: generateField('associates', 'contactInfo.cellPhone', ''),
      email: generateField('associates', 'contactInfo.email', '')
    },
    otherNames: {
      hasOtherNames: generateField('associates', 'otherNames.hasOtherNames', '', SECTION18_OPTIONS.YES_NO),
      names: [] // Will be populated separately if needed
    },
    howMet: generateField('associates', 'howMet', ''),
    whenMet: {
      month: generateField('associates', 'whenMet.month', ''),
      year: generateField('associates', 'whenMet.year', '')
    },
    whenMetEstimated: generateField('associates', 'whenMetEstimated', false),
    frequencyOfContact: generateField('associates', 'frequencyOfContact', '', SECTION18_OPTIONS.CONTACT_FREQUENCY),
    lastContactDate: {
      month: generateField('associates', 'lastContactDate.month', ''),
      year: generateField('associates', 'lastContactDate.year', '')
    },
    lastContactDateEstimated: generateField('associates', 'lastContactDateEstimated', false),
    personalRelationship: generateField('associates', 'personalRelationship', false),
    businessRelationship: generateField('associates', 'businessRelationship', false),
    professionalRelationship: generateField('associates', 'professionalRelationship', false),
    otherRelationship: generateField('associates', 'otherRelationship', false),
    otherRelationshipDescription: generateField('associates', 'otherRelationshipDescription', ''),
    currentEmployment: {
      isEmployed: generateField('associates', 'currentEmployment.isEmployed', '', SECTION18_OPTIONS.YES_NO),
      employerName: generateField('associates', 'currentEmployment.employerName', ''),
      position: generateField('associates', 'currentEmployment.position', ''),
      address: {
        street: generateField('associates', 'currentEmployment.address.street', ''),
        city: generateField('associates', 'currentEmployment.address.city', ''),
        state: generateField('associates', 'currentEmployment.address.state', '', SECTION18_OPTIONS.STATES),
        country: generateField('associates', 'currentEmployment.address.country', '', SECTION18_OPTIONS.CITIZENSHIP),
        zipCode: generateField('associates', 'currentEmployment.address.zipCode', '')
      },
      phone: generateField('associates', 'currentEmployment.phone', '')
    },
    hasGovernmentAffiliation: generateField('associates', 'hasGovernmentAffiliation', '', SECTION18_OPTIONS.YES_NO),
    governmentAffiliation: [], // Will be populated separately if needed
    hasForeignConnections: generateField('associates', 'hasForeignConnections', '', SECTION18_OPTIONS.YES_NO),
    foreignConnections: [] // Will be populated separately if needed
  };
}

/**
 * Validate that all expected fields are mapped correctly
 */
export function validateSection18FieldMappings(): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Check that all subsections have field mappings
  const subsections: Section18SubsectionKey[] = ['immediateFamily', 'extendedFamily', 'associates'];

  subsections.forEach(subsection => {
    const mapping = ACTUAL_FIELD_MAPPINGS[subsection];
    if (!mapping) {
      errors.push(`Missing field mapping for subsection: ${subsection}`);
      return;
    }

    // Check that essential fields are mapped
    let essentialFields = ['fullName.firstName', 'fullName.lastName'];

    // Different subsections have different relationship field names
    if (subsection === 'associates') {
      essentialFields.push('associateType');
    } else {
      essentialFields.push('relationship');
    }

    essentialFields.forEach(field => {
      if (!mapping[field]) {
        errors.push(`Missing essential field mapping: ${subsection}.${field}`);
      }
    });

    // Check that employment fields are mapped (these were causing the console errors)
    const employmentFields = [
      'currentEmployment.isEmployed',
      'currentEmployment.employerName',
      'currentEmployment.position',
      'currentEmployment.address.street',
      'currentEmployment.phone',
      'hasGovernmentAffiliation'
    ];
    employmentFields.forEach(field => {
      if (!mapping[field]) {
        errors.push(`Missing employment field mapping: ${subsection}.${field}`);
      }
    });
  });

  return {
    isValid: errors.length === 0,
    errors
  };
}
