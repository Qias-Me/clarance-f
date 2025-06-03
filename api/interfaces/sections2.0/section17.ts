/**
 * Section 17: Marital Status - Interface Definition
 *
 * TypeScript interface definitions for SF-86 Section 17 (Marital Status) data structure.
 * Based on the actual field structure from sections-references/section-17.json (332 fields).
 * Follows the Section 1 gold standard pattern for simplicity and reliability.
 *
 * Section 17 covers:
 * - Current marital status and relationship information
 * - Former spouse information
 * - Cohabitant information
 *
 * Data Flow Integration:
 * startForm.tsx → SF86FormContext → Section17Provider → section17.ts → sections-references/section-17.json
 */

import type { Field, FieldWithOptions } from '../formDefinition2.0';
import { createFieldFromReference } from '../../utils/sections-references-loader';

// ============================================================================
// CORE FIELD STRUCTURES (Based on sections-references/section-17.json)
// ============================================================================

/**
 * Date field structure - simplified to match actual PDF fields
 */
export interface DateField {
  month: Field<string>;
  year: Field<string>;
  estimated: Field<boolean>;
}

/**
 * Full name structure - matches PDF field structure
 */
export interface FullNameField {
  lastName: Field<string>;
  firstName: Field<string>;
  middleName: Field<string>;
  suffix: FieldWithOptions<string>;
}

/**
 * Other names entry - simplified to match actual PDF structure
 */
export interface OtherNameEntry {
  lastName: Field<string>;
  firstName: Field<string>;
  middleName: Field<string>;
  suffix: FieldWithOptions<string>;
  fromDate: Field<string>;
  toDate: Field<string>;
  fromEstimated: Field<boolean>;
  toEstimated: Field<boolean>;
  present: Field<boolean>;
  notApplicable: FieldWithOptions<string>;
}

/**
 * Place of birth structure
 */
export interface PlaceOfBirth {
  city: Field<string>;
  county: Field<string>;
  state: FieldWithOptions<string>;
  country: FieldWithOptions<string>;
}

// ============================================================================
// CORE MARITAL STATUS INTERFACES
// ============================================================================

/**
 * Current spouse/partner information - based on actual PDF fields
 * Simplified to match sections-references/section-17.json structure
 */
export interface CurrentSpouseEntry {
  // Basic marital status selection
  maritalStatus: FieldWithOptions<string>; // Never married, Married, Civil union, Separated, Divorced, Widowed
  hasSpousePartner: FieldWithOptions<string>; // YES/NO

  // Personal information
  fullName: FullNameField;
  dateOfBirth: DateField;
  placeOfBirth: PlaceOfBirth;
  ssn: Field<string>;

  // Citizenship information
  citizenship: FieldWithOptions<string>; // Country dropdown
  citizenship2?: FieldWithOptions<string>; // Second citizenship if applicable

  // Documentation fields
  hasDocumentation: FieldWithOptions<string>; // YES/NO
  documentType: FieldWithOptions<string>; // DS 1350, FS 240/545, Naturalized, I-551, I-766, Other
  documentNumber: Field<string>;
  documentExplanation?: Field<string>; // For "Other" document type
  notApplicable: Field<boolean>;

  // Marriage information
  marriageDate: Field<string>;
  marriageEstimated: Field<boolean>;

  // Other names used
  hasOtherNames: FieldWithOptions<string>; // YES/NO via radio button
  otherNames: OtherNameEntry[]; // Up to 3 entries based on PDF structure
}

/**
 * Former spouse information - simplified to match actual PDF structure
 */
export interface FormerSpouseEntry {
  hasFormerSpouse: FieldWithOptions<string>; // YES/NO

  // Personal information
  fullName: FullNameField;
  dateOfBirth: DateField;
  placeOfBirth: PlaceOfBirth;
  ssn: Field<string>;

  // Citizenship information
  citizenship: FieldWithOptions<string>;
  citizenship2?: FieldWithOptions<string>;

  // Documentation fields
  hasDocumentation: FieldWithOptions<string>;
  documentType: FieldWithOptions<string>;
  documentNumber: Field<string>;
  documentExplanation?: Field<string>;
  notApplicable: Field<boolean>;

  // Marriage details
  marriageDate: Field<string>;
  marriageEstimated: Field<boolean>;
  marriageLocation: PlaceOfBirth;

  // End of marriage details
  endDate: Field<string>;
  endEstimated: Field<boolean>;
  endLocation: PlaceOfBirth;
  reasonForEnd: FieldWithOptions<string>; // Divorce, Annulment, Death

  // Other names during marriage
  hasOtherNames: FieldWithOptions<string>;
  otherNames: OtherNameEntry[];
}

/**
 * Cohabitant information - simplified to match actual PDF structure
 */
export interface CohabitantEntry {
  hasCohabitant: FieldWithOptions<string>; // YES/NO

  // Personal information
  fullName: FullNameField;
  dateOfBirth: DateField;
  placeOfBirth: PlaceOfBirth;
  ssn: Field<string>;

  // Citizenship information
  citizenship: FieldWithOptions<string>;
  citizenship2?: FieldWithOptions<string>;

  // Documentation fields
  hasDocumentation: FieldWithOptions<string>;
  documentType: FieldWithOptions<string>;
  documentNumber: Field<string>;
  documentExplanation?: Field<string>;
  notApplicable: Field<boolean>;

  // Cohabitation details
  startDate: Field<string>;
  startEstimated: Field<boolean>;
  endDate?: Field<string>;
  endEstimated?: Field<boolean>;
  isCurrentlyCohabitating: Field<boolean>;

  // Other names used
  hasOtherNames: FieldWithOptions<string>;
  otherNames: OtherNameEntry[];
}

/**
 * Section 17 main data structure - simplified and focused
 */
export interface Section17 {
  _id: number;
  section17: {
    currentSpouse: CurrentSpouseEntry[];
    formerSpouses: FormerSpouseEntry[];
    cohabitants: CohabitantEntry[];
  };
}

// ============================================================================
// SUBSECTION TYPES & UTILITIES
// ============================================================================

/**
 * Section 17 subsection keys for type safety
 */
export type Section17SubsectionKey = 'currentSpouse' | 'formerSpouses' | 'cohabitants';

/**
 * Field update type for Section 17
 */
export type Section17FieldUpdate = {
  fieldPath: string;
  newValue: any;
  entryIndex?: number;
  subsection: Section17SubsectionKey;
};

// ============================================================================
// FIELD OPTIONS (Based on sections-references/section-17.json)
// ============================================================================

/**
 * Marital status options from PDF
 */
export const MARITAL_STATUS_OPTIONS = [
  'Never married',
  'Married',
  'Civil union or domestic partnership',
  'Separated',
  'Divorced',
  'Widowed'
] as const;

/**
 * Suffix options from PDF
 */
export const SUFFIX_OPTIONS = [
  'Jr',
  'Sr',
  'II',
  'III',
  'IV',
  'V',
  'VI',
  'VII',
  'VIII',
  'IX',
  'X',
  'Other'
] as const;

/**
 * Document type options from PDF
 */
export const DOCUMENT_TYPE_OPTIONS = [
  'DS 1350',
  'FS 240 or 545',
  'Naturalized: Alien Registration',
  'I-551 Permanent Resident',
  'I-766 Employment Authorization',
  'Other'
] as const;

/**
 * Yes/No options
 */
export const YES_NO_OPTIONS = ['YES', 'NO'] as const;

// ============================================================================
// FIELD MAPPING PATTERNS (Based on sections-reference/section-17.json)
// ============================================================================

/**
 * Field patterns for each subsection type - CRITICAL for correct PDF mapping
 * Based on comprehensive analysis of sections-reference/section-17.json
 */
const FIELD_PATTERNS = {
  currentSpouse: { middle: 6, last: 7, first: 8, ssn: 9 },
  formerSpouse: { middle: 0, last: 1, first: 2, ssn: 3 },
  cohabitant: { middle: 6, last: 7, first: 8, ssn: 9 }
} as const;

/**
 * Creates dynamic field reference for multi-entry subsections
 * Supports all 6 entry combinations: Current/Former/Cohabitant × Entry1/Entry2
 */
function createSubsectionFieldReference(
  subsectionType: 'currentSpouse' | 'formerSpouse' | 'cohabitant',
  entryIndex: 0 | 1,
  fieldName: string
): string {
  const subsectionId = subsectionType === 'currentSpouse' ? 1 :
                      subsectionType === 'formerSpouse' ? 2 : 3;
  const entryPattern = entryIndex === 0 ? '' : '_2';

  return `form1[0].Section17_${subsectionId}${entryPattern}[0].${fieldName}`;
}

/**
 * Creates field reference for name fields with correct patterns
 */
function createNameFieldReference(
  subsectionType: 'currentSpouse' | 'formerSpouse' | 'cohabitant',
  entryIndex: 0 | 1,
  fieldType: 'middle' | 'last' | 'first' | 'ssn'
): string {
  const fieldIndex = FIELD_PATTERNS[subsectionType][fieldType];
  return createSubsectionFieldReference(subsectionType, entryIndex, `TextField11[${fieldIndex}]`);
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Creates a default Section 17 data structure
 */
export const createDefaultSection17 = (): Section17 => {
  return {
    _id: 17,
    section17: {
      currentSpouse: [],
      formerSpouses: [],
      cohabitants: []
    }
  };
};

/**
 * Creates a default current spouse entry with correct field mapping
 * Uses Section17_1[0] pattern with field indices 6,7,8,9
 */
export const createDefaultCurrentSpouseEntry = (entryIndex: 0 | 1 = 0): CurrentSpouseEntry => {
  return {
    // Using actual marital status checkbox - "Currently in a civil marriage"
    maritalStatus: {
      ...createFieldFromReference(17, createSubsectionFieldReference('currentSpouse', entryIndex, '#area[2].#field[26]'), ''),
      options: MARITAL_STATUS_OPTIONS
    },
    hasSpousePartner: {
      ...createFieldFromReference(17, createSubsectionFieldReference('currentSpouse', entryIndex, 'RadioButtonList[0]'), ''),
      options: YES_NO_OPTIONS
    },
    fullName: {
      // Using correct current spouse name field pattern (6,7,8)
      lastName: createFieldFromReference(17, createNameFieldReference('currentSpouse', entryIndex, 'last'), ''),
      firstName: createFieldFromReference(17, createNameFieldReference('currentSpouse', entryIndex, 'first'), ''),
      middleName: createFieldFromReference(17, createNameFieldReference('currentSpouse', entryIndex, 'middle'), ''),
      suffix: {
        ...createFieldFromReference(17, createSubsectionFieldReference('currentSpouse', entryIndex, 'suffix[0]'), ''),
        options: SUFFIX_OPTIONS
      }
    },
    dateOfBirth: {
      // Using correct date field references for current spouse
      month: createFieldFromReference(17, createSubsectionFieldReference('currentSpouse', entryIndex, 'From_Datefield_Name_2[0]'), ''),
      year: createFieldFromReference(17, createSubsectionFieldReference('currentSpouse', entryIndex, 'From_Datefield_Name_2[0]'), ''),
      estimated: createFieldFromReference(17, createSubsectionFieldReference('currentSpouse', entryIndex, '#field[10]'), false)
    },
    placeOfBirth: {
      // Using correct place of birth field references for current spouse
      city: createFieldFromReference(17, createSubsectionFieldReference('currentSpouse', entryIndex, 'TextField11[0]'), ''),
      county: createFieldFromReference(17, createSubsectionFieldReference('currentSpouse', entryIndex, 'TextField11[1]'), ''),
      state: {
        ...createFieldFromReference(17, createSubsectionFieldReference('currentSpouse', entryIndex, 'TextField11[2]'), ''),
        options: []
      },
      country: {
        ...createFieldFromReference(17, createSubsectionFieldReference('currentSpouse', entryIndex, 'DropDownList12[0]'), ''),
        options: []
      }
    },
    ssn: createFieldFromReference(17, createNameFieldReference('currentSpouse', entryIndex, 'ssn'), ''),
    citizenship: {
      ...createFieldFromReference(17, createSubsectionFieldReference('currentSpouse', entryIndex, 'DropDownList12[0]'), ''),
      options: []
    },
    hasDocumentation: {
      ...createFieldFromReference(17, createSubsectionFieldReference('currentSpouse', entryIndex, 'RadioButtonList[0]'), ''),
      options: YES_NO_OPTIONS
    },
    documentType: {
      ...createFieldFromReference(17, createSubsectionFieldReference('currentSpouse', entryIndex, '#field[10]'), ''),
      options: DOCUMENT_TYPE_OPTIONS
    },
    documentNumber: createFieldFromReference(17, createSubsectionFieldReference('currentSpouse', entryIndex, 'TextField11[0]'), ''),
    notApplicable: createFieldFromReference(17, createSubsectionFieldReference('currentSpouse', entryIndex, '#field[11]'), false),
    marriageDate: createFieldFromReference(17, createSubsectionFieldReference('currentSpouse', entryIndex, 'From_Datefield_Name_2[0]'), ''),
    marriageEstimated: createFieldFromReference(17, createSubsectionFieldReference('currentSpouse', entryIndex, '#field[10]'), false),
    hasOtherNames: {
      ...createFieldFromReference(17, createSubsectionFieldReference('currentSpouse', entryIndex, 'RadioButtonList[0]'), ''),
      options: YES_NO_OPTIONS
    },
    otherNames: []
  };
};

/**
 * Creates a default other name entry with correct field mapping
 * Supports dynamic subsection and entry index for proper field routing
 */
export const createDefaultOtherNameEntry = (
  subsectionType: 'currentSpouse' | 'formerSpouse' | 'cohabitant' = 'currentSpouse',
  entryIndex: 0 | 1 = 0,
  nameIndex: number = 0
): OtherNameEntry => {
  return {
    // Using correct field identifiers for "other names" based on subsection
    lastName: createFieldFromReference(17, createSubsectionFieldReference(subsectionType, entryIndex, `TextField11[${nameIndex + 2}]`), ''),
    firstName: createFieldFromReference(17, createSubsectionFieldReference(subsectionType, entryIndex, `TextField11[${nameIndex + 1}]`), ''),
    middleName: createFieldFromReference(17, createSubsectionFieldReference(subsectionType, entryIndex, `TextField11[${nameIndex}]`), ''),
    suffix: {
      ...createFieldFromReference(17, createSubsectionFieldReference(subsectionType, entryIndex, `suffix[${nameIndex}]`), ''),
      options: SUFFIX_OPTIONS
    },
    fromDate: createFieldFromReference(17, createSubsectionFieldReference(subsectionType, entryIndex, `#area[0].From_Datefield_Name_2[${nameIndex + 1}]`), ''),
    toDate: createFieldFromReference(17, createSubsectionFieldReference(subsectionType, entryIndex, `#area[0].To_Datefield_Name_2[${nameIndex}]`), ''),
    fromEstimated: createFieldFromReference(17, createSubsectionFieldReference(subsectionType, entryIndex, `#field[${10 + nameIndex}]`), false),
    toEstimated: createFieldFromReference(17, createSubsectionFieldReference(subsectionType, entryIndex, `#field[${11 + nameIndex}]`), false),
    present: createFieldFromReference(17, createSubsectionFieldReference(subsectionType, entryIndex, `#field[${12 + nameIndex}]`), false),
    notApplicable: {
      ...createFieldFromReference(17, createSubsectionFieldReference(subsectionType, entryIndex, `RadioButtonList[${nameIndex + 1}]`), ''),
      options: YES_NO_OPTIONS
    }
  };
};

/**
 * Creates a default former spouse entry with correct field mapping
 * Uses Section17_2[0] pattern with field indices 0,1,2,3
 */
export const createDefaultFormerSpouseEntry = (entryIndex: 0 | 1 = 0): FormerSpouseEntry => {
  return {
    hasFormerSpouse: {
      // Using correct former spouse checkbox field
      ...createFieldFromReference(17, createSubsectionFieldReference('formerSpouse', entryIndex, '#area[2].#field[23]'), ''),
      options: YES_NO_OPTIONS
    },
    fullName: {
      // Using correct former spouse name field pattern (0,1,2) - CRITICAL DIFFERENCE
      lastName: createFieldFromReference(17, createNameFieldReference('formerSpouse', entryIndex, 'last'), ''),
      firstName: createFieldFromReference(17, createNameFieldReference('formerSpouse', entryIndex, 'first'), ''),
      middleName: createFieldFromReference(17, createNameFieldReference('formerSpouse', entryIndex, 'middle'), ''),
      suffix: {
        ...createFieldFromReference(17, createSubsectionFieldReference('formerSpouse', entryIndex, 'suffix[0]'), ''),
        options: SUFFIX_OPTIONS
      }
    },
    dateOfBirth: {
      // Using correct date field for former spouse
      month: createFieldFromReference(17, createSubsectionFieldReference('formerSpouse', entryIndex, '#area[1].From_Datefield_Name_2[2]'), ''),
      year: createFieldFromReference(17, createSubsectionFieldReference('formerSpouse', entryIndex, '#area[1].From_Datefield_Name_2[2]'), ''),
      estimated: createFieldFromReference(17, createSubsectionFieldReference('formerSpouse', entryIndex, '#field[19]'), false)
    },
    placeOfBirth: {
      // Using correct place of birth fields for former spouse
      city: createFieldFromReference(17, createSubsectionFieldReference('formerSpouse', entryIndex, 'TextField11[3]'), ''),
      county: createFieldFromReference(17, createSubsectionFieldReference('formerSpouse', entryIndex, 'TextField11[4]'), ''),
      state: {
        ...createFieldFromReference(17, createSubsectionFieldReference('formerSpouse', entryIndex, 'TextField11[5]'), ''),
        options: []
      },
      country: {
        ...createFieldFromReference(17, createSubsectionFieldReference('formerSpouse', entryIndex, 'DropDownList12[0]'), ''),
        options: []
      }
    },
    ssn: createFieldFromReference(17, createNameFieldReference('formerSpouse', entryIndex, 'ssn'), ''),
    citizenship: {
      ...createFieldFromReference(17, createSubsectionFieldReference('formerSpouse', entryIndex, 'DropDownList12[0]'), ''),
      options: []
    },
    hasDocumentation: {
      ...createFieldFromReference(17, createSubsectionFieldReference('formerSpouse', entryIndex, 'RadioButtonList[0]'), ''),
      options: YES_NO_OPTIONS
    },
    documentType: {
      ...createFieldFromReference(17, createSubsectionFieldReference('formerSpouse', entryIndex, '#field[10]'), ''),
      options: DOCUMENT_TYPE_OPTIONS
    },
    documentNumber: createFieldFromReference(17, createSubsectionFieldReference('formerSpouse', entryIndex, 'TextField11[6]'), ''),
    notApplicable: createFieldFromReference(17, createSubsectionFieldReference('formerSpouse', entryIndex, '#field[11]'), false),
    marriageDate: createFieldFromReference(17, createSubsectionFieldReference('formerSpouse', entryIndex, 'From_Datefield_Name_2[0]'), ''),
    marriageEstimated: createFieldFromReference(17, createSubsectionFieldReference('formerSpouse', entryIndex, '#field[20]'), false),
    marriageLocation: {
      // Using correct marriage location fields for former spouse
      city: createFieldFromReference(17, createSubsectionFieldReference('formerSpouse', entryIndex, 'TextField11[7]'), ''),
      county: createFieldFromReference(17, createSubsectionFieldReference('formerSpouse', entryIndex, 'TextField11[8]'), ''),
      state: {
        ...createFieldFromReference(17, createSubsectionFieldReference('formerSpouse', entryIndex, 'TextField11[9]'), ''),
        options: []
      },
      country: {
        ...createFieldFromReference(17, createSubsectionFieldReference('formerSpouse', entryIndex, 'DropDownList12[1]'), ''),
        options: []
      }
    },
    endDate: createFieldFromReference(17, createSubsectionFieldReference('formerSpouse', entryIndex, '#area[1].To_Datefield_Name_2[1]'), ''),
    endEstimated: createFieldFromReference(17, createSubsectionFieldReference('formerSpouse', entryIndex, '#field[21]'), false),
    endLocation: {
      // Using correct end location fields for former spouse
      city: createFieldFromReference(17, createSubsectionFieldReference('formerSpouse', entryIndex, 'TextField11[10]'), ''),
      county: createFieldFromReference(17, createSubsectionFieldReference('formerSpouse', entryIndex, 'TextField11[11]'), ''),
      state: {
        ...createFieldFromReference(17, createSubsectionFieldReference('formerSpouse', entryIndex, 'TextField11[12]'), ''),
        options: []
      },
      country: {
        ...createFieldFromReference(17, createSubsectionFieldReference('formerSpouse', entryIndex, 'DropDownList12[2]'), ''),
        options: []
      }
    },
    reasonForEnd: {
      // Using correct reason for end field for former spouse
      ...createFieldFromReference(17, createSubsectionFieldReference('formerSpouse', entryIndex, '#area[2].#field[23]'), ''),
      options: ['Divorced/Dissolved', 'Annulled', 'Widowed', 'Separated']
    },
    hasOtherNames: {
      ...createFieldFromReference(17, createSubsectionFieldReference('formerSpouse', entryIndex, 'RadioButtonList[1]'), ''),
      options: YES_NO_OPTIONS
    },
    otherNames: []
  };
};

/**
 * Creates a default cohabitant entry with correct field mapping
 * Uses Section17_3[0] pattern with field indices 6,7,8,9 (same as current spouse)
 */
export const createDefaultCohabitantEntry = (entryIndex: 0 | 1 = 0): CohabitantEntry => {
  return {
    hasCohabitant: {
      // Using correct cohabitant checkbox field
      ...createFieldFromReference(17, createSubsectionFieldReference('cohabitant', entryIndex, '#field[10]'), ''),
      options: YES_NO_OPTIONS
    },
    fullName: {
      // Using correct cohabitant name field pattern (6,7,8) - same as current spouse
      lastName: createFieldFromReference(17, createNameFieldReference('cohabitant', entryIndex, 'last'), ''),
      firstName: createFieldFromReference(17, createNameFieldReference('cohabitant', entryIndex, 'first'), ''),
      middleName: createFieldFromReference(17, createNameFieldReference('cohabitant', entryIndex, 'middle'), ''),
      suffix: {
        ...createFieldFromReference(17, createSubsectionFieldReference('cohabitant', entryIndex, 'suffix[0]'), ''),
        options: SUFFIX_OPTIONS
      }
    },
    dateOfBirth: {
      // Using correct date field for cohabitant
      month: createFieldFromReference(17, createSubsectionFieldReference('cohabitant', entryIndex, 'From_Datefield_Name_2[0]'), ''),
      year: createFieldFromReference(17, createSubsectionFieldReference('cohabitant', entryIndex, 'From_Datefield_Name_2[0]'), ''),
      estimated: createFieldFromReference(17, createSubsectionFieldReference('cohabitant', entryIndex, '#field[10]'), false)
    },
    placeOfBirth: {
      // Using correct place of birth fields for cohabitant
      city: createFieldFromReference(17, createSubsectionFieldReference('cohabitant', entryIndex, 'TextField11[0]'), ''),
      county: createFieldFromReference(17, createSubsectionFieldReference('cohabitant', entryIndex, 'TextField11[1]'), ''),
      state: {
        ...createFieldFromReference(17, createSubsectionFieldReference('cohabitant', entryIndex, 'TextField11[2]'), ''),
        options: []
      },
      country: {
        ...createFieldFromReference(17, createSubsectionFieldReference('cohabitant', entryIndex, 'DropDownList12[0]'), ''),
        options: []
      }
    },
    ssn: createFieldFromReference(17, createNameFieldReference('cohabitant', entryIndex, 'ssn'), ''),
    citizenship: {
      ...createFieldFromReference(17, createSubsectionFieldReference('cohabitant', entryIndex, 'DropDownList12[0]'), ''),
      options: []
    },
    hasDocumentation: {
      ...createFieldFromReference(17, createSubsectionFieldReference('cohabitant', entryIndex, 'RadioButtonList[0]'), ''),
      options: YES_NO_OPTIONS
    },
    documentType: {
      ...createFieldFromReference(17, createSubsectionFieldReference('cohabitant', entryIndex, '#field[11]'), ''),
      options: DOCUMENT_TYPE_OPTIONS
    },
    documentNumber: createFieldFromReference(17, createSubsectionFieldReference('cohabitant', entryIndex, 'TextField11[3]'), ''),
    notApplicable: createFieldFromReference(17, createSubsectionFieldReference('cohabitant', entryIndex, '#field[12]'), false),
    startDate: createFieldFromReference(17, createSubsectionFieldReference('cohabitant', entryIndex, 'From_Datefield_Name_2[0]'), ''),
    startEstimated: createFieldFromReference(17, createSubsectionFieldReference('cohabitant', entryIndex, '#field[10]'), false),
    endDate: createFieldFromReference(17, createSubsectionFieldReference('cohabitant', entryIndex, '#area[0].To_Datefield_Name_2[0]'), ''),
    endEstimated: createFieldFromReference(17, createSubsectionFieldReference('cohabitant', entryIndex, '#field[11]'), false),
    isCurrentlyCohabitating: createFieldFromReference(17, createSubsectionFieldReference('cohabitant', entryIndex, '#field[12]'), false),
    hasOtherNames: {
      ...createFieldFromReference(17, createSubsectionFieldReference('cohabitant', entryIndex, 'RadioButtonList[0]'), ''),
      options: YES_NO_OPTIONS
    },
    otherNames: []
  };
};

// ============================================================================
// VALIDATION & UTILITY FUNCTIONS
// ============================================================================

/**
 * Validation result structure - simplified
 */
export type Section17ValidationResult = {
  isValid: boolean;
  errors: string[];
  warnings: string[];
};

/**
 * Validates Section 17 data - simplified validation
 */
export function validateSection17(section17Data: Section17): Section17ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Basic validation - check if at least one marital status is provided
  const { currentSpouse, formerSpouses, cohabitants } = section17Data.section17;

  if (currentSpouse.length === 0 && formerSpouses.length === 0 && cohabitants.length === 0) {
    errors.push('At least one marital status entry is required');
  }

  // Validate current spouse entries
  currentSpouse.forEach((entry, index) => {
    if (!entry.maritalStatus.value) {
      errors.push(`Current spouse entry ${index + 1}: Marital status is required`);
    }

    if (entry.hasSpousePartner.value === 'YES') {
      if (!entry.fullName.firstName.value || !entry.fullName.lastName.value) {
        errors.push(`Current spouse entry ${index + 1}: Full name is required`);
      }
    }
  });

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Checks if Section 17 is complete
 */
export function isSection17Complete(section17Data: Section17): boolean {
  const { currentSpouse, formerSpouses, cohabitants } = section17Data.section17;

  // Check if at least one marital status question has been answered
  const hasCurrentSpouseResponse = currentSpouse.some(entry => entry.maritalStatus.value);
  const hasFormerSpouseResponse = formerSpouses.some(entry => entry.hasFormerSpouse.value);
  const hasCohabitantResponse = cohabitants.some(entry => entry.hasCohabitant.value);

  return hasCurrentSpouseResponse || hasFormerSpouseResponse || hasCohabitantResponse;
}


