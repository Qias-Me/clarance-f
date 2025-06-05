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
// TYPE DEFINITIONS
// ============================================================================

export type Section17SubsectionKey = 'currentSpouse' | 'formerSpouses' | 'cohabitants';
export type SubsectionType = 'currentSpouse' | 'formerSpouse' | 'cohabitant';
export type EntryIndex = 0 | 1;
export type NameFieldType = 'middle' | 'last' | 'first' | 'ssn';

// ============================================================================
// FIELD OPTIONS
// ============================================================================

export const MARITAL_STATUS_OPTIONS = [
  'Never married',
  'Married',
  'Civil union or domestic partnership',
  'Separated',
  'Divorced',
  'Widowed'
] as const;

export const SUFFIX_OPTIONS = [
  'Jr', 'Sr', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'Other'
] as const;

export const DOCUMENT_TYPE_OPTIONS = [
  'DS 1350',
  'FS 240 or 545',
  'Naturalized: Alien Registration',
  'I-551 Permanent Resident',
  'I-766 Employment Authorization',
  'Other'
] as const;

export const YES_NO_OPTIONS = ['YES', 'NO'] as const;

// ============================================================================
// CORE INTERFACES
// ============================================================================

export interface DateField {
  month: Field<string>;
  year: Field<string>;
  estimated: Field<boolean>;
}

export interface FullNameField {
  lastName: Field<string>;
  firstName: Field<string>;
  middleName: Field<string>;
  suffix: FieldWithOptions<string>;
}

export interface PlaceOfBirth {
  city: Field<string>;
  county: Field<string>;
  state: FieldWithOptions<string>;
  country: FieldWithOptions<string>;
}

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

// ============================================================================
// MAIN ENTRY INTERFACES
// ============================================================================

export interface CurrentSpouseEntry {
  maritalStatus: FieldWithOptions<string>;
  hasSpousePartner: FieldWithOptions<string>;
  fullName: FullNameField;
  dateOfBirth: DateField;
  placeOfBirth: PlaceOfBirth;
  ssn: Field<string>;
  citizenship: FieldWithOptions<string>;
  citizenship2?: FieldWithOptions<string>;
  hasDocumentation: FieldWithOptions<string>;
  documentType: FieldWithOptions<string>;
  documentNumber: Field<string>;
  documentExplanation?: Field<string>;
  notApplicable: Field<boolean>;
  marriageDate: Field<string>;
  marriageEstimated: Field<boolean>;
  hasOtherNames: FieldWithOptions<string>;
  otherNames: OtherNameEntry[];
}

export interface FormerSpouseEntry {
  hasFormerSpouse: FieldWithOptions<string>;
  fullName: FullNameField;
  dateOfBirth: DateField;
  placeOfBirth: PlaceOfBirth;
  ssn: Field<string>;
  citizenship: FieldWithOptions<string>;
  citizenship2?: FieldWithOptions<string>;
  hasDocumentation: FieldWithOptions<string>;
  documentType: FieldWithOptions<string>;
  documentNumber: Field<string>;
  documentExplanation?: Field<string>;
  notApplicable: Field<boolean>;
  marriageDate: Field<string>;
  marriageEstimated: Field<boolean>;
  marriageLocation: PlaceOfBirth;
  endDate: Field<string>;
  endEstimated: Field<boolean>;
  endLocation: PlaceOfBirth;
  reasonForEnd: FieldWithOptions<string>;
  hasOtherNames: FieldWithOptions<string>;
  otherNames: OtherNameEntry[];
}

export interface CohabitantEntry {
  hasCohabitant: FieldWithOptions<string>;
  fullName: FullNameField;
  dateOfBirth: DateField;
  placeOfBirth: PlaceOfBirth;
  ssn: Field<string>;
  citizenship: FieldWithOptions<string>;
  citizenship2?: FieldWithOptions<string>;
  hasDocumentation: FieldWithOptions<string>;
  documentType: FieldWithOptions<string>;
  documentNumber: Field<string>;
  documentExplanation?: Field<string>;
  notApplicable: Field<boolean>;
  startDate: Field<string>;
  startEstimated: Field<boolean>;
  endDate?: Field<string>;
  endEstimated?: Field<boolean>;
  isCurrentlyCohabitating: Field<boolean>;
  hasOtherNames: FieldWithOptions<string>;
  otherNames: OtherNameEntry[];
}

export interface Section17 {
  _id: number;
  section17: {
    currentSpouse: CurrentSpouseEntry[];
    formerSpouses: FormerSpouseEntry[];
    cohabitants: CohabitantEntry[];
  };
}

// ============================================================================
// FIELD MAPPING CONFIGURATION
// ============================================================================

const FIELD_PATTERNS = {
  currentSpouse: { middle: 6, last: 7, first: 8, ssn: 9 },
  formerSpouse: { middle: 0, last: 1, first: 2 }, // No SSN field
  cohabitant: { middle: 6, last: 7, first: 8, ssn: 16 }
} as const;

const SUBSECTION_IDS = {
  currentSpouse: 1,
  formerSpouse: 2,
  cohabitant: 3
} as const;

// ============================================================================
// FIELD REFERENCE UTILITIES
// ============================================================================

function createFieldRef(subsectionType: SubsectionType, entryIndex: EntryIndex, fieldName: string): string {
  const subsectionId = SUBSECTION_IDS[subsectionType];
  const entryPattern = entryIndex === 0 ? '' : '_2';
  return `form1[0].Section17_${subsectionId}${entryPattern}[0].${fieldName}`;
}

function createNameFieldRef(subsectionType: SubsectionType, entryIndex: EntryIndex, fieldType: NameFieldType): string {
  if (subsectionType === 'formerSpouse' && fieldType === 'ssn') {
    // Former spouses don't have SSN fields - use placeholder
    return createFieldRef(subsectionType, entryIndex, 'suffix[0]');
  }
  
  const fieldIndex = FIELD_PATTERNS[subsectionType][fieldType as keyof typeof FIELD_PATTERNS[typeof subsectionType]];
  return createFieldRef(subsectionType, entryIndex, `TextField11[${fieldIndex}]`);
}

function createField<T>(subsectionType: SubsectionType, entryIndex: EntryIndex, fieldName: string, defaultValue: T): Field<T> {
  return createFieldFromReference(17, createFieldRef(subsectionType, entryIndex, fieldName), defaultValue);
}

function createFieldWithOptions<T>(
  subsectionType: SubsectionType, 
  entryIndex: EntryIndex, 
  fieldName: string, 
  defaultValue: T, 
  options: readonly T[]
): FieldWithOptions<T> {
  return {
    ...createField(subsectionType, entryIndex, fieldName, defaultValue),
    options
  };
}

// ============================================================================
// FACTORY FUNCTIONS
// ============================================================================

function createFullName(subsectionType: SubsectionType, entryIndex: EntryIndex): FullNameField {
  return {
    lastName: createFieldFromReference(17, createNameFieldRef(subsectionType, entryIndex, 'last'), ''),
    firstName: createFieldFromReference(17, createNameFieldRef(subsectionType, entryIndex, 'first'), ''),
    middleName: createFieldFromReference(17, createNameFieldRef(subsectionType, entryIndex, 'middle'), ''),
    suffix: createFieldWithOptions(subsectionType, entryIndex, 'suffix[0]', '', SUFFIX_OPTIONS)
  };
}

function createDateField(subsectionType: SubsectionType, entryIndex: EntryIndex, dateIndex: number = 0): DateField {
  const dateFieldName = `From_Datefield_Name_2[${dateIndex}]`;
  const estimatedFieldName = `#field[${10 + dateIndex}]`;
  
  return {
    month: createField(subsectionType, entryIndex, dateFieldName, ''),
    year: createField(subsectionType, entryIndex, dateFieldName, ''),
    estimated: createField(subsectionType, entryIndex, estimatedFieldName, false)
  };
}

function createPlaceOfBirth(
  subsectionType: SubsectionType, 
  entryIndex: EntryIndex,
  config: {
    cityField: string;
    countyField: string;
    stateField: string;
    countryField: string;
  }
): PlaceOfBirth {
  return {
    city: createField(subsectionType, entryIndex, config.cityField, ''),
    county: createField(subsectionType, entryIndex, config.countyField, ''),
    state: createFieldWithOptions(subsectionType, entryIndex, config.stateField, '', []),
    country: createFieldWithOptions(subsectionType, entryIndex, config.countryField, '', [])
  };
}

// ============================================================================
// ENTRY CREATORS
// ============================================================================

export const createDefaultCurrentSpouseEntry = (entryIndex: EntryIndex = 0): CurrentSpouseEntry => ({
  maritalStatus: createFieldWithOptions('currentSpouse', entryIndex, '#area[2].#field[26]', '', MARITAL_STATUS_OPTIONS),
  hasSpousePartner: createFieldWithOptions('currentSpouse', entryIndex, 'RadioButtonList[0]', '', YES_NO_OPTIONS),
  fullName: createFullName('currentSpouse', entryIndex),
  dateOfBirth: createDateField('currentSpouse', entryIndex),
  placeOfBirth: createPlaceOfBirth('currentSpouse', entryIndex, {
    cityField: 'TextField11[0]',
    countyField: 'TextField11[1]',
    stateField: 'TextField11[2]',
    countryField: 'DropDownList12[0]'
  }),
  ssn: createFieldFromReference(17, createNameFieldRef('currentSpouse', entryIndex, 'ssn'), ''),
  citizenship: createFieldWithOptions('currentSpouse', entryIndex, 'DropDownList12[0]', '', []),
  hasDocumentation: createFieldWithOptions('currentSpouse', entryIndex, 'RadioButtonList[0]', '', YES_NO_OPTIONS),
  documentType: createFieldWithOptions('currentSpouse', entryIndex, '#field[10]', '', DOCUMENT_TYPE_OPTIONS),
  documentNumber: createField('currentSpouse', entryIndex, 'TextField11[0]', ''),
  notApplicable: createField('currentSpouse', entryIndex, '#field[11]', false),
  marriageDate: createField('currentSpouse', entryIndex, 'From_Datefield_Name_2[0]', ''),
  marriageEstimated: createField('currentSpouse', entryIndex, '#field[10]', false),
  hasOtherNames: createFieldWithOptions('currentSpouse', entryIndex, 'RadioButtonList[0]', '', YES_NO_OPTIONS),
  otherNames: []
});

export const createDefaultFormerSpouseEntry = (entryIndex: EntryIndex = 0): FormerSpouseEntry => ({
  hasFormerSpouse: createFieldWithOptions('formerSpouse', entryIndex, '#field[23]', '', YES_NO_OPTIONS),
  fullName: createFullName('formerSpouse', entryIndex),
  dateOfBirth: createDateField('formerSpouse', entryIndex, 2),
  placeOfBirth: createPlaceOfBirth('formerSpouse', entryIndex, {
    cityField: '#area[4].TextField11[3]',
    countyField: '#area[4].TextField11[4]',
    stateField: '#area[5].TextField11[5]',
    countryField: 'DropDownList12[0]'
  }),
  ssn: createField('formerSpouse', entryIndex, 'suffix[0]', ''), // Placeholder - no SSN for former spouses
  citizenship: createFieldWithOptions('formerSpouse', entryIndex, 'DropDownList12[0]', '', []),
  hasDocumentation: createFieldWithOptions('formerSpouse', entryIndex, 'RadioButtonList[0]', '', YES_NO_OPTIONS),
  documentType: createFieldWithOptions('formerSpouse', entryIndex, '#field[9]', '', DOCUMENT_TYPE_OPTIONS),
  documentNumber: createField('formerSpouse', entryIndex, '#area[7].TextField11[6]', ''),
  notApplicable: createField('formerSpouse', entryIndex, '#field[9]', false),
  marriageDate: createField('formerSpouse', entryIndex, 'From_Datefield_Name_2[2]', ''),
  marriageEstimated: createField('formerSpouse', entryIndex, '#field[26]', false),
  marriageLocation: createPlaceOfBirth('formerSpouse', entryIndex, {
    cityField: '#area[5].TextField11[5]',
    countyField: '#area[7].TextField11[6]',
    stateField: '#area[7].TextField11[7]',
    countryField: 'DropDownList12[1]'
  }),
  endDate: createField('formerSpouse', entryIndex, 'From_Datefield_Name_2[1]', ''),
  endEstimated: createField('formerSpouse', entryIndex, '#field[27]', false),
  endLocation: createPlaceOfBirth('formerSpouse', entryIndex, {
    cityField: '#area[6].Address_Full_short_line[0].#area[0].TextField11[0]',
    countyField: '#area[6].Address_Full_short_line[0].TextField11[1]',
    stateField: '#area[6].Address_Full_short_line[0].#area[0].School6_State[0]',
    countryField: '#area[6].Address_Full_short_line[0].#area[0].DropDownList17[0]'
  }),
  reasonForEnd: createFieldWithOptions('formerSpouse', entryIndex, '#field[23]', '', ['Divorced/Dissolved', 'Annulled', 'Widowed', 'Separated']),
  hasOtherNames: createFieldWithOptions('formerSpouse', entryIndex, 'RadioButtonList[1]', '', YES_NO_OPTIONS),
  otherNames: []
});

export const createDefaultCohabitantEntry = (entryIndex: EntryIndex = 0): CohabitantEntry => ({
  hasCohabitant: createFieldWithOptions('cohabitant', entryIndex, '#field[10]', '', YES_NO_OPTIONS),
  fullName: createFullName('cohabitant', entryIndex),
  dateOfBirth: {
    month: createField('cohabitant', entryIndex, '#area[0].From_Datefield_Name_2[0]', ''),
    year: createField('cohabitant', entryIndex, '#area[0].From_Datefield_Name_2[0]', ''),
    estimated: createField('cohabitant', entryIndex, '#field[10]', false)
  },
  placeOfBirth: createPlaceOfBirth('cohabitant', entryIndex, {
    cityField: '#area[2].TextField11[9]',
    countyField: 'TextField11[10]',
    stateField: 'TextField11[11]',
    countryField: 'DropDownList12[0]'
  }),
  ssn: createField('cohabitant', entryIndex, 'TextField11[16]', ''),
  citizenship: createFieldWithOptions('cohabitant', entryIndex, 'DropDownList12[0]', '', []),
  hasDocumentation: createFieldWithOptions('cohabitant', entryIndex, 'RadioButtonList[0]', '', YES_NO_OPTIONS),
  documentType: createFieldWithOptions('cohabitant', entryIndex, '#field[17]', '', DOCUMENT_TYPE_OPTIONS),
  documentNumber: createField('cohabitant', entryIndex, 'TextField11[17]', ''),
  notApplicable: createField('cohabitant', entryIndex, '#field[18]', false),
  startDate: createField('cohabitant', entryIndex, '#area[0].From_Datefield_Name_2[0]', ''),
  startEstimated: createField('cohabitant', entryIndex, '#field[19]', false),
  endDate: createField('cohabitant', entryIndex, '#area[0].To_Datefield_Name_2[0]', ''),
  endEstimated: createField('cohabitant', entryIndex, '#field[27]', false),
  isCurrentlyCohabitating: createField('cohabitant', entryIndex, '#field[32]', false),
  hasOtherNames: createFieldWithOptions('cohabitant', entryIndex, 'RadioButtonList[0]', '', YES_NO_OPTIONS),
  otherNames: []
});

export const createDefaultOtherNameEntry = (
  subsectionType: SubsectionType = 'currentSpouse',
  entryIndex: EntryIndex = 0,
  nameIndex: number = 0
): OtherNameEntry => ({
  lastName: createField(subsectionType, entryIndex, `TextField11[${nameIndex + 2}]`, ''),
  firstName: createField(subsectionType, entryIndex, `TextField11[${nameIndex + 1}]`, ''),
  middleName: createField(subsectionType, entryIndex, `TextField11[${nameIndex}]`, ''),
  suffix: createFieldWithOptions(subsectionType, entryIndex, `suffix[${nameIndex}]`, '', SUFFIX_OPTIONS),
  fromDate: createField(subsectionType, entryIndex, `#area[0].From_Datefield_Name_2[${nameIndex + 1}]`, ''),
  toDate: createField(subsectionType, entryIndex, `#area[0].To_Datefield_Name_2[${nameIndex}]`, ''),
  fromEstimated: createField(subsectionType, entryIndex, `#field[${10 + nameIndex}]`, false),
  toEstimated: createField(subsectionType, entryIndex, `#field[${11 + nameIndex}]`, false),
  present: createField(subsectionType, entryIndex, `#field[${12 + nameIndex}]`, false),
  notApplicable: createFieldWithOptions(subsectionType, entryIndex, `RadioButtonList[${nameIndex + 1}]`, '', YES_NO_OPTIONS)
});

export const createDefaultSection17 = (): Section17 => ({
  _id: 17,
  section17: {
    currentSpouse: [],
    formerSpouses: [],
    cohabitants: []
  }
});

// ============================================================================
// VALIDATION & UTILITY FUNCTIONS
// ============================================================================

export type Section17FieldUpdate = {
  fieldPath: string;
  newValue: any;
  entryIndex?: number;
  subsection: Section17SubsectionKey;
};

export type Section17ValidationResult = {
  isValid: boolean;
  errors: string[];
  warnings: string[];
};

export function validateSection17(section17Data: Section17): Section17ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  const { currentSpouse, formerSpouses, cohabitants } = section17Data.section17;

  if (currentSpouse.length === 0 && formerSpouses.length === 0 && cohabitants.length === 0) {
    errors.push('At least one marital status entry is required');
  }

  currentSpouse.forEach((entry, index) => {
    if (!entry.maritalStatus.value) {
      errors.push(`Current spouse entry ${index + 1}: Marital status is required`);
    }
    if (entry.hasSpousePartner.value === 'YES' && (!entry.fullName.firstName.value || !entry.fullName.lastName.value)) {
      errors.push(`Current spouse entry ${index + 1}: Full name is required`);
    }
  });

  return { isValid: errors.length === 0, errors, warnings };
}

export function isSection17Complete(section17Data: Section17): boolean {
  const { currentSpouse, formerSpouses, cohabitants } = section17Data.section17;
  
  return currentSpouse.some(entry => entry.maritalStatus.value) ||
         formerSpouses.some(entry => entry.hasFormerSpouse.value) ||
         cohabitants.some(entry => entry.hasCohabitant.value);
}


