/**
 * Section 18 Field Generator (REDESIGNED)
 * 
 * Generates Field<T> objects for Section 18 based on the actual PDF form structure.
 * The form has 6 relative entries with subsections 18.1-18.5, totaling 964 fields.
 * 
 * STRUCTURE:
 * - 6 Relative Entries (Entry #1-6)
 * - Section 18.1: Basic relative information
 * - Section 18.2: Current address for living relatives
 * - Section 18.3: Citizenship documentation for US citizens
 * - Section 18.4: Documentation for non-US citizens with US address
 * - Section 18.5: Contact info for non-US citizens with foreign address
 */

import { createFieldFromReference } from '../../../../api/utils/sections-references-loader';
import { generateAdvancedField, generateSection18FieldPattern } from '../../../../api/utils/advanced-field-generators';
import { resolveFieldPathFromConfig, debugFieldMapping } from '../../../../api/utils/enhanced-pdf-field-mapping';
import type { Field, FieldWithOptions } from '../../../../api/interfaces/formDefinition2.0';
import type {
  RelativeEntry,
  Section18_1,
  Section18_2,
  Section18_3,
  Section18_4,
  Section18_5,
  DateField,
  FullNameField,
  AddressField,
  APOFPOAddressField,
  ContactMethodsField,
  ContactFrequencyField,
  EmploymentInfoField,
  ForeignGovernmentRelationsField,
  ContactDatesField,
  DocumentationTypesField,
  OtherNameField,
  EmploymentField
} from '../../../../api/interfaces/sections2.0/Section18';

// ============================================================================
// FIELD OPTIONS
// ============================================================================

export const SECTION18_OPTIONS = {
  YES_NO: ['YES', 'NO'] as const,
  YES_NO_DONT_KNOW: ['YES', 'NO', "I don't know"] as const,
  SUFFIX: ['Jr', 'Sr', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'Other'] as const,

  RELATIVE_TYPES: [
    'Mother',
    'Father',
    'Stepmother',
    'Stepfather',
    'Foster parent',
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

  CITIZENSHIP_DOCUMENTATION: [
    'FS 240 or 545',
    'Certificate of Naturalization',
    'Certificate of Citizenship',
    'U.S. Passport',
    'Other'
  ] as const,

  NON_US_DOCUMENTATION: [
    'I-551 Permanent Resident',
    'I-94 Arrival/Departure Record',
    'Visa',
    'Other'
  ] as const,

  CONTACT_FREQUENCY: [
    'Daily',
    'Weekly',
    'Monthly',
    'Quarterly',
    'Annually',
    'Other'
  ] as const,

  STATES: [
    'AK', 'AL', 'AR', 'AS', 'AZ', 'CA', 'CO', 'CT', 'DC', 'DE', 'FL', 'FM',
    'GA', 'GU', 'HI', 'IA', 'ID', 'IL', 'IN', 'KS', 'KY', 'LA', 'MA', 'MD',
    'ME', 'MH', 'MI', 'MN', 'MO', 'MP', 'MS', 'MT', 'NC', 'ND', 'NE', 'NH',
    'NJ', 'NM', 'NV', 'NY', 'OH', 'OK', 'OR', 'PA', 'PR', 'PW', 'RI', 'SC',
    'SD', 'TN', 'TX', 'UT', 'VA', 'VI', 'VT', 'WA', 'WI', 'WV', 'WY'
  ] as const,

  COUNTRIES: [
    'United States',
    'Afghanistan',
    'Albania',
    'Algeria',
    'Andorra',
    'Angola',
    // ... (full list would be expanded from reference data)
  ] as const
};

// ============================================================================
// FIELD GENERATION UTILITIES
// ============================================================================

/**
 * Generate a basic field with enhanced mapping and fallback
 */
function generateField<T = any>(
  fieldName: string,
  defaultValue: T,
  options?: readonly string[]
): FieldWithOptions<T> {
  console.log(`🔄 Section18: Generating field for: ${fieldName}`);

  // Try enhanced field generation first
  try {
    const enhancedField = generateAdvancedField(18, fieldName, defaultValue, options);
    console.log(`✅ Section18: Enhanced field generation successful for: ${fieldName}`);

    // Ensure the field has options property
    return {
      ...enhancedField,
      options: options || []
    } as FieldWithOptions<T>;
  } catch (enhancedError) {
    console.warn(`⚠️ Section18: Enhanced field generation failed for ${fieldName}:`, enhancedError);
  }

  // Fallback to original method
  try {
    const field = createFieldFromReference(18, fieldName, defaultValue);
    console.log(`✅ Section18: Original field generation successful for: ${fieldName}`);

    return {
      ...field,
      options: options || []
    } as FieldWithOptions<T>;
  } catch (error) {
    console.warn(`❌ Section18: All field generation methods failed for ${fieldName}:`, error);

    // Debug the field mapping issue
    const debugInfo = debugFieldMapping(18, fieldName);
    console.warn(`🔍 Section18: Debug info for ${fieldName}:`, debugInfo);

    // Enhanced fallback field with better metadata
    const fallbackField: FieldWithOptions<T> = {
      id: generateFallbackId(fieldName),
      name: fieldName,
      type: inferFieldType(fieldName, defaultValue),
      label: generateFieldLabel(fieldName),
      value: defaultValue,
      rect: { x: 0, y: 0, width: 0, height: 0 },
      options: options || []
    };

    console.log(`🔄 Section18: Using enhanced fallback field for ${fieldName}:`, fallbackField);

    return fallbackField;
  }
}

/**
 * Generate fallback ID for fields not found in PDF
 */
function generateFallbackId(fieldPath: string): string {
  let hash = 0;
  for (let i = 0; i < fieldPath.length; i++) {
    const char = fieldPath.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString().padStart(4, '0');
}

/**
 * Infer field type from path and default value
 */
function inferFieldType(fieldPath: string, defaultValue: any): string {
  if (typeof defaultValue === 'boolean') return 'PDFCheckBox';
  if (fieldPath.includes('Date') || fieldPath.includes('date')) return 'PDFTextField';
  if (fieldPath.includes('DropDown') || fieldPath.includes('dropdown')) return 'PDFDropdown';
  if (fieldPath.includes('RadioButton') || fieldPath.includes('radio')) return 'PDFRadioGroup';
  return 'PDFTextField';
}

/**
 * Generate human-readable label from field path
 */
function generateFieldLabel(fieldPath: string): string {
  const pathParts = fieldPath.split(/[.\[\]]/);
  const meaningfulParts = pathParts.filter(part =>
    part &&
    !part.match(/^\d+$/) &&
    !part.includes('form1') &&
    !part.includes('#field') &&
    !part.includes('#area')
  );

  if (meaningfulParts.length > 0) {
    const lastPart = meaningfulParts[meaningfulParts.length - 1];
    return lastPart.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
  }

  return `Field ${fieldPath}`;
}

/**
 * Generate a date field
 */
function generateDateField(baseName: string): DateField {
  return {
    month: generateField(`${baseName}_month`, ''),
    year: generateField(`${baseName}_year`, '')
  };
}

/**
 * Generate a full name field
 */
function generateFullNameField(baseName: string): FullNameField {
  return {
    lastName: generateField(`${baseName}_lastName`, ''),
    firstName: generateField(`${baseName}_firstName`, ''),
    middleName: generateField(`${baseName}_middleName`, ''),
    suffix: generateField(`${baseName}_suffix`, '', SECTION18_OPTIONS.SUFFIX)
  };
}

/**
 * Generate an address field
 */
function generateAddressField(baseName: string): AddressField {
  return {
    street: generateField(`${baseName}_street`, ''),
    city: generateField(`${baseName}_city`, ''),
    state: generateField(`${baseName}_state`, '', SECTION18_OPTIONS.STATES),
    zipCode: generateField(`${baseName}_zipCode`, ''),
    country: generateField(`${baseName}_country`, '', SECTION18_OPTIONS.COUNTRIES)
  };
}

/**
 * Generate other name field (4 entries per relative)
 * Based on actual PDF field structure analysis
 */
function generateOtherNameField(entryNumber: number, otherNameIndex: number): OtherNameField {
  // Entry numbers in PDF are 0-based: Entry #1 = [0], Entry #2 = [1], etc.
  const pdfEntryIndex = entryNumber - 1;

  // Other name indices: #1 = index 0, #2 = index 1, #3 = index 2, #4 = index 3
  const otherNamePdfIndex = otherNameIndex - 1;

  // PDF field mapping based on section-18.json analysis:
  // Other Name #1: TextField11[6,4,9], suffix[1], #area[0], #field[22,23,24]
  // Other Name #2: TextField11[11,10,12], suffix[3], #area[1], #field[31,32,33]
  // Other Name #3: TextField11[14,13,15], suffix[4], #area[2], #field[40,41,42]
  // Other Name #4: TextField11[17,16,18], suffix[5], #area[3], #field[49,50,51]

  const fieldMappings = [
    // Other Name #1
    {
      firstName: 6, middleName: 4, lastName: 9, suffix: 1, area: 0,
      fromEstimate: 22, toEstimate: 23, present: 24, reasonIndex: 19
    },
    // Other Name #2
    {
      firstName: 11, middleName: 10, lastName: 12, suffix: 3, area: 1,
      fromEstimate: 31, toEstimate: 32, present: 33, reasonIndex: 20
    },
    // Other Name #3
    {
      firstName: 14, middleName: 13, lastName: 15, suffix: 4, area: 2,
      fromEstimate: 40, toEstimate: 41, present: 42, reasonIndex: 21
    },
    // Other Name #4
    {
      firstName: 17, middleName: 16, lastName: 18, suffix: 5, area: 3,
      fromEstimate: 49, toEstimate: 50, present: 51, reasonIndex: 22
    }
  ];

  const mapping = fieldMappings[otherNamePdfIndex];

  return {
    fullName: {
      firstName: generateField(`form1[0].Section18_1[${pdfEntryIndex}].TextField11[${mapping.firstName}]`, ''),
      middleName: generateField(`form1[0].Section18_1[${pdfEntryIndex}].TextField11[${mapping.middleName}]`, ''),
      lastName: generateField(`form1[0].Section18_1[${pdfEntryIndex}].TextField11[${mapping.lastName}]`, ''),
      suffix: generateField(`form1[0].Section18_1[${pdfEntryIndex}].suffix[${mapping.suffix}]`, '', SECTION18_OPTIONS.SUFFIX)
    },
    timeUsed: {
      from: {
        month: generateField(`form1[0].Section18_1[${pdfEntryIndex}].#area[${mapping.area}].From_Datefield_Name_2[${otherNamePdfIndex}]`, ''),
        year: generateField(`form1[0].Section18_1[${pdfEntryIndex}].#area[${mapping.area}].From_Datefield_Name_2[${otherNamePdfIndex}]`, ''),
        isEstimated: generateField(`form1[0].Section18_1[${pdfEntryIndex}].#field[${mapping.fromEstimate}]`, false)
      },
      to: {
        month: generateField(`form1[0].Section18_1[${pdfEntryIndex}].#area[${mapping.area}].To_Datefield_Name_2[${otherNamePdfIndex}]`, ''),
        year: generateField(`form1[0].Section18_1[${pdfEntryIndex}].#area[${mapping.area}].To_Datefield_Name_2[${otherNamePdfIndex}]`, ''),
        isEstimated: generateField(`form1[0].Section18_1[${pdfEntryIndex}].#field[${mapping.toEstimate}]`, false)
      },
      isPresent: generateField(`form1[0].Section18_1[${pdfEntryIndex}].#field[${mapping.present}]`, false),
      isEstimated: generateField(`form1[0].Section18_1[${pdfEntryIndex}].#field[${mapping.fromEstimate}]`, false) // Use from estimate as general estimate
    },
    reasonForChange: generateField(`form1[0].Section18_1[${pdfEntryIndex}].TextField11[${mapping.reasonIndex}]`, ''),
    isApplicable: generateField(`form1[0].Section18_1[${pdfEntryIndex}].#field[2]`, false) // "Not applicable" checkbox
  };
}

/**
 * Generate employment field
 */
function generateEmploymentField(baseName: string): EmploymentField {
  return {
    employer: generateField(`${baseName}_employer`, ''),
    position: generateField(`${baseName}_position`, ''),
    address: generateAddressField(`${baseName}_address`),
    phone: generateField(`${baseName}_phone`, ''),
    isCurrentlyEmployed: generateField(`${baseName}_isCurrentlyEmployed`, '', SECTION18_OPTIONS.YES_NO),
    dontKnow: generateField(`${baseName}_dontKnow`, false)
  };
}

// ============================================================================
// SUBSECTION GENERATORS
// ============================================================================

/**
 * Generate Section 18.1 fields (Basic relative information)
 */
function generateSection18_1(entryNumber: number): Section18_1 {
  // Use actual PDF field names from section-18.json
  // Entry numbers in PDF are 0-based: Entry #1 = [0], Entry #2 = [1], etc.
  const pdfEntryIndex = entryNumber - 1;

  // Determine the correct section path based on entry number
  let relativeTypeFieldPath: string;
  if (entryNumber === 1) {
    relativeTypeFieldPath = `form1[0].Section18_1[0].DropDownList5[0]`;
  } else {
    // Entries 2-6 use Section18_1_1[x] pattern
    relativeTypeFieldPath = `form1[0].Section18_1_1[${pdfEntryIndex - 1}].DropDownList5[0]`;
  }

  return {
    relativeType: generateField(relativeTypeFieldPath, '', SECTION18_OPTIONS.RELATIVE_TYPES),
    fullName: {
      firstName: generateField(`form1[0].Section18_1[${pdfEntryIndex}].TextField11[3]`, ''),
      middleName: generateField(`form1[0].Section18_1[${pdfEntryIndex}].TextField11[1]`, ''),
      lastName: generateField(`form1[0].Section18_1[${pdfEntryIndex}].TextField11[2]`, ''),
      suffix: generateField(`form1[0].Section18_1[${pdfEntryIndex}].suffix[0]`, '', ['Jr', 'Sr', 'II', 'III', 'IV', 'V'])
    },
    mothersMaidenName: {
      sameAsListed: generateField(`form1[0].Section18_1[${pdfEntryIndex}].#field[3]`, false),
      dontKnow: generateField(`form1[0].Section18_1[${pdfEntryIndex}].#field[4]`, false),
      maidenName: {
        firstName: generateField(`form1[0].Section18_1[${pdfEntryIndex}].TextField11[4]`, ''),
        middleName: generateField(`form1[0].Section18_1[${pdfEntryIndex}].TextField11[5]`, ''),
        lastName: generateField(`form1[0].Section18_1[${pdfEntryIndex}].TextField11[6]`, ''),
        suffix: generateField(`form1[0].Section18_1[${pdfEntryIndex}].suffix[1]`, '', ['Jr', 'Sr', 'II', 'III', 'IV', 'V'])
      }
    },
    otherNames: [
      generateOtherNameField(entryNumber, 1),
      generateOtherNameField(entryNumber, 2),
      generateOtherNameField(entryNumber, 3),
      generateOtherNameField(entryNumber, 4)
    ],
    dateOfBirth: {
      month: generateField(`form1[0].Section18_1[${pdfEntryIndex}].From_Datefield_Name_2[0]`, ''),
      year: generateField(`form1[0].Section18_1[${pdfEntryIndex}].From_Datefield_Name_2[1]`, '')
    },
    dateOfBirthEstimated: generateField(`form1[0].Section18_1[${pdfEntryIndex}].#field[1]`, false),
    placeOfBirth: {
      city: generateField(`form1[0].Section18_1[${pdfEntryIndex}].TextField11[0]`, ''),
      state: generateField(`form1[0].Section18_1[${pdfEntryIndex}].School6_State[0]`, '', SECTION18_OPTIONS.STATES),
      country: generateField(`form1[0].Section18_1[${pdfEntryIndex}].DropDownList24[0]`, '', SECTION18_OPTIONS.COUNTRIES)
    },
    citizenship: {
      countries: [
        generateField(`form1[0].Section18_1[${pdfEntryIndex}].DropDownList24[0]`, '', SECTION18_OPTIONS.COUNTRIES),
        generateField(`form1[0].Section18_1[${pdfEntryIndex}].DropDownList24[1]`, '', SECTION18_OPTIONS.COUNTRIES)
      ]
    }
  };
}

/**
 * Generate Section 18.2 fields (Current address for living relatives)
 */
function generateSection18_2(entryNumber: number): Section18_2 {
  // Use actual PDF field names from section-18.json
  // Entry numbers in PDF are 0-based: Entry #1 = [0], Entry #2 = [1], etc.
  const pdfEntryIndex = entryNumber - 1;

  return {
    isApplicable: generateField(`form1[0].Section18_2[${pdfEntryIndex}].RadioButtonList[0]`, false),
    currentAddress: {
      street: generateField(`form1[0].Section18_2[${pdfEntryIndex}].TextField11[6]`, ''),
      city: generateField(`form1[0].Section18_2[${pdfEntryIndex}].TextField11[7]`, ''),
      state: generateField(`form1[0].Section18_2[${pdfEntryIndex}].School6_State[2]`, '', SECTION18_OPTIONS.STATES),
      zipCode: generateField(`form1[0].Section18_2[${pdfEntryIndex}].TextField11[8]`, ''),
      country: generateField(`form1[0].Section18_2[${pdfEntryIndex}].DropDownList26[0]`, '', SECTION18_OPTIONS.COUNTRIES)
    },
    hasAPOFPOAddress: generateField(`form1[0].Section18_2[${pdfEntryIndex}].RadioButtonList[1]`, '', SECTION18_OPTIONS.YES_NO),
    apoFpoAddress: {
      address: generateField(`form1[0].Section18_2[${pdfEntryIndex}].TextField11[4]`, ''),
      apoFpo: generateField(`form1[0].Section18_2[${pdfEntryIndex}].TextField11[5]`, ''),
      stateCode: generateField(`form1[0].Section18_2[${pdfEntryIndex}].School6_State[1]`, '', SECTION18_OPTIONS.STATES),
      zipCode: generateField(`form1[0].Section18_2[${pdfEntryIndex}].TextField11[3]`, '')
    }
  };
}

/**
 * Generate Section 18.3 fields (Contact Information and Foreign Relations)
 */
function generateSection18_3(entryNumber: number): Section18_3 {
  // Use actual PDF field names from section-18.json
  // Entry numbers in PDF are 0-based: Entry #1 = [0], Entry #2 = [1], etc.
  const pdfEntryIndex = entryNumber - 1;

  return {
    isApplicable: generateField(`form1[0].Section18_3[${pdfEntryIndex}].RadioButtonList[0]`, false),
    contactMethods: {
      inPerson: generateField(`form1[0].Section18_3[${pdfEntryIndex}].#field[4]`, false),
      telephone: generateField(`form1[0].Section18_3[${pdfEntryIndex}].#field[2]`, false),
      electronic: generateField(`form1[0].Section18_3[${pdfEntryIndex}].#field[3]`, false),
      writtenCorrespondence: generateField(`form1[0].Section18_3[${pdfEntryIndex}].#field[5]`, false),
      other: generateField(`form1[0].Section18_3[${pdfEntryIndex}].#field[6]`, false),
      otherExplanation: generateField(`form1[0].Section18_3[${pdfEntryIndex}].TextField11[5]`, '')
    },
    contactFrequency: {
      daily: generateField(`form1[0].Section18_3[${pdfEntryIndex}].#field[9]`, false),
      weekly: generateField(`form1[0].Section18_3[${pdfEntryIndex}].#field[10]`, false),
      monthly: generateField(`form1[0].Section18_3[${pdfEntryIndex}].#field[7]`, false),
      quarterly: generateField(`form1[0].Section18_3[${pdfEntryIndex}].#field[13]`, false),
      annually: generateField(`form1[0].Section18_3[${pdfEntryIndex}].#field[8]`, false),
      other: generateField(`form1[0].Section18_3[${pdfEntryIndex}].#field[12]`, false),
      otherExplanation: generateField(`form1[0].Section18_3[${pdfEntryIndex}].TextField11[0]`, '')
    },
    employmentInfo: {
      employerName: generateField(`form1[0].Section18_3[${pdfEntryIndex}].TextField11[1]`, ''),
      dontKnowEmployer: generateField(`form1[0].Section18_3[${pdfEntryIndex}].#field[15]`, false),
      employerAddress: {
        street: generateField(`form1[0].Section18_3[${pdfEntryIndex}].#area[0].TextField11[2]`, ''),
        city: generateField(`form1[0].Section18_3[${pdfEntryIndex}].#area[0].TextField11[3]`, ''),
        state: generateField(`form1[0].Section18_3[${pdfEntryIndex}].#area[0].School6_State[0]`, '', SECTION18_OPTIONS.STATES),
        country: generateField(`form1[0].Section18_3[${pdfEntryIndex}].#area[0].DropDownList28[0]`, '', SECTION18_OPTIONS.COUNTRIES),
        zipCode: generateField(`form1[0].Section18_3[${pdfEntryIndex}].#area[0].TextField11[4]`, ''),
        dontKnowAddress: generateField(`form1[0].Section18_3[${pdfEntryIndex}].#area[0].#field[21]`, false)
      }
    },
    foreignGovernmentRelations: {
      hasRelations: generateField(`form1[0].Section18_3[${pdfEntryIndex}].RadioButtonList[0]`, '', ['YES', 'NO', "I don't know"]),
      description: generateField(`form1[0].Section18_3[${pdfEntryIndex}].TextField11[6]`, '')
    },
    contactDates: {
      firstContact: {
        date: generateField(`form1[0].Section18_3[${pdfEntryIndex}].#area[1].From_Datefield_Name_2[0]`, ''),
        isEstimate: generateField(`form1[0].Section18_3[${pdfEntryIndex}].#area[1].#field[25]`, false)
      },
      lastContact: {
        date: generateField(`form1[0].Section18_3[${pdfEntryIndex}].#area[1].From_Datefield_Name_2[1]`, ''),
        isEstimate: generateField(`form1[0].Section18_3[${pdfEntryIndex}].#area[1].#field[28]`, false),
        isPresent: generateField(`form1[0].Section18_3[${pdfEntryIndex}].#area[1].#field[27]`, false)
      }
    },
    documentationTypes: {
      i551PermanentResident: generateField(`form1[0].Section18_3[${pdfEntryIndex}].#field[30]`, false),
      i766EmploymentAuth: generateField(`form1[0].Section18_3[${pdfEntryIndex}].#field[29]`, false),
      usVisa: generateField(`form1[0].Section18_3[${pdfEntryIndex}].#field[32]`, false),
      i94ArrivalDeparture: generateField(`form1[0].Section18_3[${pdfEntryIndex}].#field[35]`, false),
      i20StudentCertificate: generateField(`form1[0].Section18_3[${pdfEntryIndex}].#field[33]`, false),
      ds2019ExchangeVisitor: generateField(`form1[0].Section18_3[${pdfEntryIndex}].#field[34]`, false),
      other: generateField(`form1[0].Section18_3[${pdfEntryIndex}].#field[31]`, false),
      otherExplanation: generateField(`form1[0].Section18_3[${pdfEntryIndex}].TextField11[14]`, ''),
      documentNumber: generateField(`form1[0].Section18_3[${pdfEntryIndex}].TextField11[7]`, ''),
      expirationDate: generateField(`form1[0].Section18_3[${pdfEntryIndex}].From_Datefield_Name_2[4]`, ''),
      expirationIsEstimate: generateField(`form1[0].Section18_3[${pdfEntryIndex}].#field[65]`, false)
    }
  };
}

/**
 * Generate Section 18.4 fields (Documentation for non-US citizens with US address)
 */
function generateSection18_4(entryNumber: number): Section18_4 {
  // Use actual PDF field names from section-18.json
  const pdfEntryIndex = entryNumber - 1;

  return {
    isApplicable: generateField(`form1[0].Section18_3[${pdfEntryIndex}].#field[30]`, false),
    documentationType: generateField(`form1[0].Section18_3[${pdfEntryIndex}].#field[20]`, '', SECTION18_OPTIONS.NON_US_DOCUMENTATION),
    documentNumber: generateField(`form1[0].Section18_3[${pdfEntryIndex}].TextField11[10]`, '')
  };
}

/**
 * Generate Section 18.5 fields (Contact info for non-US citizens with foreign address)
 * Based on actual PDF field structure from section-18.json
 */
function generateSection18_5(entryNumber: number): Section18_5 {
  // Use actual PDF field names from section-18.json
  const pdfEntryIndex = entryNumber - 1;

  return {
    // Contact dates
    firstContactDate: {
      month: generateField(`form1[0].Section18_3[${pdfEntryIndex}].#area[1].From_Datefield_Name_2[0]`, ''),
      year: generateField(`form1[0].Section18_3[${pdfEntryIndex}].#area[1].From_Datefield_Name_2[1]`, '')
    },
    firstContactDateEstimated: generateField(`form1[0].Section18_3[${pdfEntryIndex}].#field[25]`, false),
    lastContactDate: {
      month: generateField(`form1[0].Section18_3[${pdfEntryIndex}].From_Datefield_Name_2[3]`, ''),
      year: generateField(`form1[0].Section18_3[${pdfEntryIndex}].From_Datefield_Name_2[3]`, '')
    },
    lastContactDateEstimated: generateField(`form1[0].Section18_3[${pdfEntryIndex}].#field[26]`, false),
    lastContactDatePresent: generateField(`form1[0].Section18_3[${pdfEntryIndex}].#field[27]`, false),

    // Contact methods (Check all that apply)
    contactMethods: {
      inPerson: generateField(`form1[0].Section18_3[${pdfEntryIndex}].#field[4]`, false),
      telephone: generateField(`form1[0].Section18_3[${pdfEntryIndex}].#field[5]`, false),
      electronic: generateField(`form1[0].Section18_3[${pdfEntryIndex}].#field[6]`, false),
      writtenCorrespondence: generateField(`form1[0].Section18_3[${pdfEntryIndex}].#field[7]`, false),
      other: generateField(`form1[0].Section18_3[${pdfEntryIndex}].#field[8]`, false),
      otherExplanation: generateField(`form1[0].Section18_3[${pdfEntryIndex}].TextField11[0]`, '')
    },

    // Contact frequency
    contactFrequency: {
      daily: generateField(`form1[0].Section18_3[${pdfEntryIndex}].#field[9]`, false),
      weekly: generateField(`form1[0].Section18_3[${pdfEntryIndex}].#field[10]`, false),
      monthly: generateField(`form1[0].Section18_3[${pdfEntryIndex}].#field[11]`, false),
      quarterly: generateField(`form1[0].Section18_3[${pdfEntryIndex}].#field[12]`, false),
      annually: generateField(`form1[0].Section18_3[${pdfEntryIndex}].#field[13]`, false),
      other: generateField(`form1[0].Section18_3[${pdfEntryIndex}].#field[14]`, false),
      otherExplanation: generateField(`form1[0].Section18_3[${pdfEntryIndex}].TextField11[1]`, '')
    },

    // Employment information
    employerName: generateField(`form1[0].Section18_3[${pdfEntryIndex}].TextField11[1]`, ''),
    employerNameDontKnow: generateField(`form1[0].Section18_3[${pdfEntryIndex}].#field[15]`, false),

    // Employer address
    employerAddress: {
      street: generateField(`form1[0].Section18_3[${pdfEntryIndex}].#area[0].TextField11[2]`, ''),
      city: generateField(`form1[0].Section18_3[${pdfEntryIndex}].#area[0].TextField11[3]`, ''),
      state: generateField(`form1[0].Section18_3[${pdfEntryIndex}].#area[0].DropDownList11[0]`, '', SECTION18_OPTIONS.STATES),
      zipCode: generateField(`form1[0].Section18_3[${pdfEntryIndex}].#area[0].TextField11[4]`, ''),
      country: generateField(`form1[0].Section18_3[${pdfEntryIndex}].#area[0].DropDownList11[1]`, '', SECTION18_OPTIONS.COUNTRIES),
      dontKnow: generateField(`form1[0].Section18_3[${pdfEntryIndex}].#area[0].#field[21]`, false)
    },

    // Foreign government affiliation
    foreignGovernmentAffiliation: generateField(`form1[0].Section18_3[${pdfEntryIndex}].DropDownList11[0]`, '', SECTION18_OPTIONS.YES_NO_DONT_KNOW),
    foreignGovernmentDescription: generateField(`form1[0].Section18_3[${pdfEntryIndex}].TextField11[6]`, '')
  };
}

// ============================================================================
// MAIN ENTRY GENERATOR
// ============================================================================

/**
 * Generate a complete relative entry (Entry #1-6)
 */
export function generateRelativeEntry(entryNumber: number): RelativeEntry {
  return {
    entryNumber,
    section18_1: generateSection18_1(entryNumber),
    section18_2: generateSection18_2(entryNumber),
    section18_3: generateSection18_3(entryNumber),
    section18_4: generateSection18_4(entryNumber),
    section18_5: generateSection18_5(entryNumber)
  };
}

/**
 * Generate all 6 relative entries for Section 18
 */
export function generateAllRelativeEntries(): RelativeEntry[] {
  return [
    generateRelativeEntry(1),
    generateRelativeEntry(2),
    generateRelativeEntry(3),
    generateRelativeEntry(4),
    generateRelativeEntry(5),
    generateRelativeEntry(6)
  ];
}

/**
 * Generate relative type selection dropdown for a specific entry
 * Based on actual PDF field structure: form1[0].Section18_1[x].DropDownList5[0]
 *
 * @param entryNumber - The relative entry number (1-6)
 * @returns A dropdown field with relative type options
 */
export function generateRelativeTypeSelection(entryNumber: number = 1) {
  // Entry numbers in PDF are 0-based: Entry #1 = [0], Entry #2 = [1], etc.
  const pdfEntryIndex = entryNumber - 1;

  // Determine the correct section path based on entry number
  let sectionPath: string;
  if (entryNumber === 1) {
    sectionPath = `form1[0].Section18_1[0].DropDownList5[0]`;
  } else {
    // Entries 2-6 use Section18_1_1[x] pattern
    sectionPath = `form1[0].Section18_1_1[${pdfEntryIndex - 1}].DropDownList5[0]`;
  }

  console.log(`🎯 Section18: Generating relative type dropdown for Entry #${entryNumber} using field: ${sectionPath}`);

  return generateField(sectionPath, '', SECTION18_OPTIONS.RELATIVE_TYPES);
}

/**
 * Generate all relative type selections for all 6 entries
 * Returns an array of dropdown fields for each relative entry
 */
export function generateAllRelativeTypeSelections() {
  return {
    entry1: generateRelativeTypeSelection(1),
    entry2: generateRelativeTypeSelection(2),
    entry3: generateRelativeTypeSelection(3),
    entry4: generateRelativeTypeSelection(4),
    entry5: generateRelativeTypeSelection(5),
    entry6: generateRelativeTypeSelection(6)
  };
}

