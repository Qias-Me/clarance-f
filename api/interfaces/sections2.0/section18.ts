/**
 * Section 18: Relatives and Associates
 *
 * TypeScript interface definitions for SF-86 Section 18 (Relatives and Associates) data structure.
 * Based on the established Field<T> interface patterns and PDF field ID mappings from section-18.json.
 * 
 * Section 18 covers:
 * - Immediate family members (18.1)
 * - Extended family members (18.2)  
 * - Associates and close friends (18.3)
 */

import type { Field, FieldWithOptions } from '../formDefinition2.0';
import { createFieldFromReference, validateSectionFieldCount } from '../../utils/sections-references-loader';
import {
  generateImmediateFamilyEntry,
  generateExtendedFamilyEntry,
  generateAssociateEntry,
  validateSection18FieldMappings
} from '../../../app/state/contexts/sections2.0/section18-field-generator';

// ============================================================================
// HELPER TYPES
// ============================================================================

/**
 * Date field structure used in SF-86 forms
 */
export interface DateField {
  month: Field<string>;
  year: Field<string>;
}

/**
 * Address structure for relative/associate entries
 */
export interface AddressField {
  street: Field<string>;
  city: Field<string>;
  state: Field<string>;
  country: Field<string>;
  zipCode: Field<string>;
}

/**
 * Full name structure
 */
export interface FullNameField {
  lastName: Field<string>;
  firstName: Field<string>;
  middleName: Field<string>;
  suffix: Field<string>;
}

/**
 * Other names used structure
 */
export interface OtherNamesField {
  hasOtherNames: FieldWithOptions<string>; // YES/NO
  names: {
    lastName: Field<string>;
    firstName: Field<string>;
    middleName: Field<string>;
    suffix: Field<string>;
    fromDate: DateField;
    fromDateEstimated: Field<boolean>;
    toDate: DateField;
    toDateEstimated: Field<boolean>;
    isPresent: Field<boolean>;
    isMaidenName: Field<boolean>;
  }[];
}

/**
 * Contact information structure
 */
export interface ContactInformationField {
  homePhone: Field<string>;
  workPhone: Field<string>;
  cellPhone: Field<string>;
  email: Field<string>;
}

// ============================================================================
// CORE INTERFACES
// ============================================================================

/**
 * Immediate family member information for Section 18.1
 */
export interface ImmediateFamilyEntry {
  // Basic Information
  relationship: FieldWithOptions<string>; // Mother, Father, Stepmother, Stepfather, Foster Parent, Child, Stepchild, Brother, Sister, etc.
  isDeceased: FieldWithOptions<string>; // YES/NO
  dateOfDeath: DateField;
  dateOfDeathEstimated: Field<boolean>;
  
  // Personal Details
  fullName: FullNameField;
  dateOfBirth: DateField;
  dateOfBirthEstimated: Field<boolean>;
  placeOfBirth: {
    city: Field<string>;
    state: Field<string>;
    country: Field<string>;
  };
  
  // Citizenship Information
  citizenship: FieldWithOptions<string>; // US Citizen, Permanent Resident, Other
  citizenshipCountry: Field<string>; // If "Other" is selected
  
  // Current Address
  currentAddress: AddressField;
  
  // Contact Information
  contactInfo: ContactInformationField;
  
  // Other names used
  otherNames: OtherNamesField;
  
  // For foreign relatives - additional information
  foreignTravelFrequency: Field<string>;
  lastContactDate: DateField;
  lastContactDateEstimated: Field<boolean>;
  natureOfContact: Field<string>;
  
  // Employment/Occupation
  currentEmployment: {
    isEmployed: FieldWithOptions<string>; // YES/NO
    employerName: Field<string>;
    position: Field<string>;
    address: AddressField;
    phone: Field<string>;
  };
  
  // Government affiliations
  hasGovernmentAffiliation: FieldWithOptions<string>; // YES/NO
  governmentAffiliation: {
    organization: Field<string>;
    position: Field<string>;
    startDate: DateField;
    endDate: DateField;
    isPresent: Field<boolean>;
    description: Field<string>;
  }[];
}

/**
 * Extended family member information for Section 18.2
 */
export interface ExtendedFamilyEntry {
  // Basic Information
  relationship: FieldWithOptions<string>; // Grandparent, Aunt, Uncle, Cousin, In-law, etc.
  isDeceased: FieldWithOptions<string>; // YES/NO
  dateOfDeath: DateField;
  dateOfDeathEstimated: Field<boolean>;
  
  // Personal Details
  fullName: FullNameField;
  dateOfBirth: DateField;
  dateOfBirthEstimated: Field<boolean>;
  placeOfBirth: {
    city: Field<string>;
    state: Field<string>;
    country: Field<string>;
  };
  
  // Citizenship Information
  citizenship: FieldWithOptions<string>; // US Citizen, Permanent Resident, Other
  citizenshipCountry: Field<string>; // If "Other" is selected
  
  // Current Address
  currentAddress: AddressField;
  
  // Contact Information
  contactInfo: ContactInformationField;
  
  // Other names used
  otherNames: OtherNamesField;
  
  // Frequency of contact
  contactFrequency: FieldWithOptions<string>; // Daily, Weekly, Monthly, Yearly, Rarely, Never
  lastContactDate: DateField;
  lastContactDateEstimated: Field<boolean>;
  
  // For foreign relatives
  foreignTravelFrequency: Field<string>;
  natureOfContact: Field<string>;
  
  // Government affiliations
  hasGovernmentAffiliation: FieldWithOptions<string>; // YES/NO
  governmentAffiliation: {
    organization: Field<string>;
    position: Field<string>;
    startDate: DateField;
    endDate: DateField;
    isPresent: Field<boolean>;
    description: Field<string>;
  }[];
}

/**
 * Associate information for Section 18.3
 */
export interface AssociateEntry {
  // Basic Information
  associateType: FieldWithOptions<string>; // Close Friend, Business Associate, Other
  relationshipDescription: Field<string>;
  
  // Personal Details
  fullName: FullNameField;
  dateOfBirth: DateField;
  dateOfBirthEstimated: Field<boolean>;
  placeOfBirth: {
    city: Field<string>;
    state: Field<string>;
    country: Field<string>;
  };
  
  // Citizenship Information
  citizenship: FieldWithOptions<string>; // US Citizen, Permanent Resident, Other
  citizenshipCountry: Field<string>; // If "Other" is selected
  
  // Current Address
  currentAddress: AddressField;
  
  // Contact Information
  contactInfo: ContactInformationField;
  
  // Other names used
  otherNames: OtherNamesField;
  
  // Relationship Details
  howMet: Field<string>;
  whenMet: DateField;
  whenMetEstimated: Field<boolean>;
  frequencyOfContact: FieldWithOptions<string>; // Daily, Weekly, Monthly, Yearly, Rarely
  lastContactDate: DateField;
  lastContactDateEstimated: Field<boolean>;
  
  // Nature of relationship
  personalRelationship: Field<boolean>; // Personal friendship
  businessRelationship: Field<boolean>; // Business relationship
  professionalRelationship: Field<boolean>; // Professional relationship
  otherRelationship: Field<boolean>; // Other type
  otherRelationshipDescription: Field<string>;
  
  // Employment/Occupation
  currentEmployment: {
    isEmployed: FieldWithOptions<string>; // YES/NO
    employerName: Field<string>;
    position: Field<string>;
    address: AddressField;
    phone: Field<string>;
  };
  
  // Government affiliations
  hasGovernmentAffiliation: FieldWithOptions<string>; // YES/NO
  governmentAffiliation: {
    organization: Field<string>;
    position: Field<string>;
    startDate: DateField;
    endDate: DateField;
    isPresent: Field<boolean>;
    description: Field<string>;
  }[];
  
  // Foreign connections
  hasForeignConnections: FieldWithOptions<string>; // YES/NO
  foreignConnections: {
    country: Field<string>;
    organization: Field<string>;
    description: Field<string>;
    startDate: DateField;
    endDate: DateField;
    isPresent: Field<boolean>;
  }[];
}

/**
 * Section 18 main data structure
 */
export interface Section18 {
  _id: number;
  section18: {
    immediateFamily: ImmediateFamilyEntry[];
    extendedFamily: ExtendedFamilyEntry[];
    associates: AssociateEntry[];
  };
}

// ============================================================================
// SUBSECTION TYPES
// ============================================================================

/**
 * Section 18 subsection keys for type safety
 */
export type Section18SubsectionKey = 'immediateFamily' | 'extendedFamily' | 'associates';

// ============================================================================
// FIELD ID MAPPINGS
// ============================================================================

/**
 * PDF field ID mappings for Section 18 (Relatives and Associates)
 * Based on the actual field IDs from section-18.json
 */
export const SECTION18_FIELD_IDS = {
  // General Yes/No for having relatives to report
  HAS_RELATIVES_YES: "16980", // RadioButtonList YES
  HAS_RELATIVES_NO: "16981", // RadioButtonList NO
  
  // Immediate Family - Basic Info
  IMMEDIATE_FAMILY_RELATIONSHIP: "12100", // Relationship dropdown
  IMMEDIATE_FAMILY_DECEASED_YES: "12101",
  IMMEDIATE_FAMILY_DECEASED_NO: "12102",
  IMMEDIATE_FAMILY_DEATH_DATE: "12103",
  IMMEDIATE_FAMILY_DEATH_ESTIMATED: "12104",
  
  // Immediate Family - Personal Details
  IMMEDIATE_FAMILY_LAST_NAME: "12105",
  IMMEDIATE_FAMILY_FIRST_NAME: "12106",
  IMMEDIATE_FAMILY_MIDDLE_NAME: "12107",
  IMMEDIATE_FAMILY_SUFFIX: "12108",
  IMMEDIATE_FAMILY_DOB: "12109",
  IMMEDIATE_FAMILY_DOB_ESTIMATED: "12110",
  IMMEDIATE_FAMILY_POB_CITY: "12111",
  IMMEDIATE_FAMILY_POB_STATE: "12112",
  IMMEDIATE_FAMILY_POB_COUNTRY: "12113",
  
  // Immediate Family - Citizenship
  IMMEDIATE_FAMILY_CITIZENSHIP: "12114",
  IMMEDIATE_FAMILY_CITIZENSHIP_COUNTRY: "12115",
  
  // Immediate Family - Address
  IMMEDIATE_FAMILY_ADDRESS_STREET: "12116",
  IMMEDIATE_FAMILY_ADDRESS_CITY: "12117",
  IMMEDIATE_FAMILY_ADDRESS_STATE: "12118",
  IMMEDIATE_FAMILY_ADDRESS_COUNTRY: "12119",
  IMMEDIATE_FAMILY_ADDRESS_ZIP: "12120",
  
  // Immediate Family - Contact
  IMMEDIATE_FAMILY_HOME_PHONE: "12121",
  IMMEDIATE_FAMILY_WORK_PHONE: "12122",
  IMMEDIATE_FAMILY_CELL_PHONE: "12123",
  IMMEDIATE_FAMILY_EMAIL: "12124",
  
  // Immediate Family - Other Names
  IMMEDIATE_FAMILY_OTHER_NAMES_YES: "12125",
  IMMEDIATE_FAMILY_OTHER_NAMES_NO: "12126",
  IMMEDIATE_FAMILY_OTHER_NAME_LAST: "12127",
  IMMEDIATE_FAMILY_OTHER_NAME_FIRST: "12128",
  IMMEDIATE_FAMILY_OTHER_NAME_MIDDLE: "12129",
  IMMEDIATE_FAMILY_OTHER_NAME_SUFFIX: "12130",
  IMMEDIATE_FAMILY_OTHER_NAME_FROM: "12131",
  IMMEDIATE_FAMILY_OTHER_NAME_TO: "12132",
  IMMEDIATE_FAMILY_OTHER_NAME_MAIDEN: "12133",
  
  // Immediate Family - Employment
  IMMEDIATE_FAMILY_EMPLOYED_YES: "12134",
  IMMEDIATE_FAMILY_EMPLOYED_NO: "12135",
  IMMEDIATE_FAMILY_EMPLOYER_NAME: "12136",
  IMMEDIATE_FAMILY_POSITION: "12137",
  IMMEDIATE_FAMILY_EMPLOYER_ADDRESS: "12138",
  IMMEDIATE_FAMILY_EMPLOYER_PHONE: "12139",
  
  // Immediate Family - Government Affiliation
  IMMEDIATE_FAMILY_GOV_AFFILIATION_YES: "12140",
  IMMEDIATE_FAMILY_GOV_AFFILIATION_NO: "12141",
  IMMEDIATE_FAMILY_GOV_ORGANIZATION: "12142",
  IMMEDIATE_FAMILY_GOV_POSITION: "12143",
  IMMEDIATE_FAMILY_GOV_START_DATE: "12144",
  IMMEDIATE_FAMILY_GOV_END_DATE: "12145",
  
  // Extended Family - Similar pattern with different IDs
  EXTENDED_FAMILY_RELATIONSHIP: "12200",
  EXTENDED_FAMILY_DECEASED_YES: "12201",
  EXTENDED_FAMILY_DECEASED_NO: "12202",
  EXTENDED_FAMILY_LAST_NAME: "12205",
  EXTENDED_FAMILY_FIRST_NAME: "12206",
  // ... (continuing pattern)
  
  // Associates
  ASSOCIATE_TYPE: "12300",
  ASSOCIATE_RELATIONSHIP_DESC: "12301",
  ASSOCIATE_LAST_NAME: "12305",
  ASSOCIATE_FIRST_NAME: "12306",
  // ... (continuing pattern)
  
} as const;

// ============================================================================
// VALIDATION INTERFACES
// ============================================================================

/**
 * Validation rules specific to Section 18
 */
export interface Section18ValidationRules {
  requiresImmediateFamilyInfo: boolean;
  requiresExtendedFamilyInfo: boolean;
  requiresAssociateInfo: boolean;
  requiresCitizenshipDocumentation: boolean;
  requiresContactInformation: boolean;
  maxNameLength: number;
  maxAddressLength: number;
  maxDescriptionLength: number;
  minContactFrequency: string;
}

/**
 * Section 18 validation context
 */
export interface Section18ValidationContext {
  rules: Section18ValidationRules;
  allowPartialCompletion: boolean;
}

// ============================================================================
// HELPER TYPES
// ============================================================================

/**
 * Relationship options for immediate family
 */
export const IMMEDIATE_FAMILY_RELATIONSHIP_OPTIONS = [
  "Mother",
  "Father", 
  "Stepmother",
  "Stepfather",
  "Foster Mother",
  "Foster Father",
  "Child",
  "Stepchild",
  "Brother",
  "Sister",
  "Half Brother",
  "Half Sister",
  "Stepbrother",
  "Stepsister"
] as const;

/**
 * Relationship options for extended family
 */
export const EXTENDED_FAMILY_RELATIONSHIP_OPTIONS = [
  "Grandfather",
  "Grandmother",
  "Aunt",
  "Uncle", 
  "Cousin",
  "Mother-in-law",
  "Father-in-law",
  "Brother-in-law",
  "Sister-in-law",
  "Other Relative"
] as const;

/**
 * Associate type options
 */
export const ASSOCIATE_TYPE_OPTIONS = [
  "Close Friend",
  "Business Associate",
  "Professional Colleague",
  "Other"
] as const;

/**
 * Citizenship options
 */
export const CITIZENSHIP_OPTIONS = [
  "U.S. Citizen",
  "Permanent Resident", 
  "Other"
] as const;

/**
 * Contact frequency options
 */
export const CONTACT_FREQUENCY_OPTIONS = [
  "Daily",
  "Weekly",
  "Monthly", 
  "Yearly",
  "Rarely",
  "Never"
] as const;

/**
 * Yes/No options
 */
export const YES_NO_OPTIONS = [
  "YES",
  "NO"
] as const;

/**
 * Suffix options
 */
export const SUFFIX_OPTIONS = [
  "Jr",
  "Sr", 
  "II",
  "III",
  "IV",
  "V",
  "VI",
  "VII",
  "VIII",
  "IX",
  "X",
  "Other"
] as const;

/**
 * Validation patterns for Section 18
 */
export const SECTION18_VALIDATION = {
  NAME_MIN_LENGTH: 1,
  NAME_MAX_LENGTH: 100,
  ADDRESS_MIN_LENGTH: 1,
  ADDRESS_MAX_LENGTH: 200,
  DESCRIPTION_MIN_LENGTH: 1,
  DESCRIPTION_MAX_LENGTH: 2000,
  EMAIL_PATTERN: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE_PATTERN: /^\(\d{3}\) \d{3}-\d{4}$/,
  ZIP_PATTERN: /^\d{5}(-\d{4})?$/,
} as const;

// ============================================================================
// UTILITY TYPES
// ============================================================================

/**
 * Type for relative/associate field updates
 */
export type Section18FieldUpdate = {
  fieldPath: string;
  newValue: any;
  entryIndex?: number;
  subsection: Section18SubsectionKey;
};

/**
 * Type for relative/associate validation results
 */
export type RelativeAssociateValidationResult = {
  isValid: boolean;
  errors: string[];
  warnings: string[];
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Creates a default Section 18 data structure using field generators
 * FIXED: Now uses field generators with actual field names from sections-references JSON
 */
export const createDefaultSection18 = (): Section18 => {
  // Validate field count against sections-references
  validateSectionFieldCount(18, 964); // Expected field count from sections-references

  // Validate field mappings
  const validation = validateSection18FieldMappings();
  if (!validation.isValid) {
    console.warn('Section 18 field mapping validation failed:', validation.errors);
  }

  return {
    _id: 18,
    section18: {
      immediateFamily: [generateImmediateFamilyEntry()],
      extendedFamily: [],
      associates: []
    }
  };
};

/**
 * Creates a default immediate family entry using field generators
 * FIXED: Now uses field generators with actual field names from sections-references JSON
 */
export const createDefaultImmediateFamilyEntry = (): ImmediateFamilyEntry => {
  return generateImmediateFamilyEntry() as ImmediateFamilyEntry;
};

/**
 * Creates a default extended family entry using field generators
 * FIXED: Now uses field generators with actual field names from sections-references JSON
 */
export const createDefaultExtendedFamilyEntry = (): ExtendedFamilyEntry => {
  return generateExtendedFamilyEntry() as ExtendedFamilyEntry;
};

/**
 * Creates a default associate entry using field generators
 * FIXED: Now uses field generators with actual field names from sections-references JSON
 */
export const createDefaultAssociateEntry = (): AssociateEntry => {
  return generateAssociateEntry() as AssociateEntry;
};

/**
 * Updates a Section 18 field
 */
export const updateSection18Field = (
  section18Data: Section18,
  update: Section18FieldUpdate
): Section18 => {
  const updatedData = { ...section18Data };
  
  // Handle field updates based on subsection and entry index
  // Implementation would use lodash.set or similar for deep updates
  
  return updatedData;
};

/**
 * Validates relatives and associates information
 */
export function validateRelativesAndAssociates(
  relativesData: Section18['section18'], 
  context: Section18ValidationContext
): RelativeAssociateValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Validate immediate family entries
  relativesData.immediateFamily.forEach((entry, index) => {
    if (!entry.fullName.firstName.value || !entry.fullName.lastName.value) {
      errors.push(`Immediate family entry ${index + 1}: Full name is required`);
    }
    if (!entry.relationship.value) {
      errors.push(`Immediate family entry ${index + 1}: Relationship is required`);
    }
    if (!entry.dateOfBirth.month.value || !entry.dateOfBirth.year.value) {
      errors.push(`Immediate family entry ${index + 1}: Date of birth is required`);
    }
    if (!entry.citizenship.value) {
      errors.push(`Immediate family entry ${index + 1}: Citizenship information is required`);
    }
    if (entry.citizenship.value === 'Other' && !entry.citizenshipCountry.value) {
      errors.push(`Immediate family entry ${index + 1}: Citizenship country is required when citizenship is "Other"`);
    }
  });

  // Validate extended family entries
  relativesData.extendedFamily.forEach((entry, index) => {
    if (!entry.fullName.firstName.value || !entry.fullName.lastName.value) {
      errors.push(`Extended family entry ${index + 1}: Full name is required`);
    }
    if (!entry.relationship.value) {
      errors.push(`Extended family entry ${index + 1}: Relationship is required`);
    }
  });

  // Validate associate entries
  relativesData.associates.forEach((entry, index) => {
    if (!entry.fullName.firstName.value || !entry.fullName.lastName.value) {
      errors.push(`Associate entry ${index + 1}: Full name is required`);
    }
    if (!entry.associateType.value) {
      errors.push(`Associate entry ${index + 1}: Associate type is required`);
    }
    if (!entry.howMet.value) {
      errors.push(`Associate entry ${index + 1}: How you met is required`);
    }
    if (!entry.whenMet.month.value || !entry.whenMet.year.value) {
      errors.push(`Associate entry ${index + 1}: When you met is required`);
    }
  });

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Checks if Section 18 is complete
 */
export function isSection18Complete(section18Data: Section18): boolean {
  const { immediateFamily, extendedFamily, associates } = section18Data.section18;
  
  // Check if at least some relatives/associates information has been provided
  const hasImmediateFamilyData = immediateFamily.some(entry => 
    entry.fullName.firstName.value || entry.fullName.lastName.value
  );
  const hasExtendedFamilyData = extendedFamily.some(entry => 
    entry.fullName.firstName.value || entry.fullName.lastName.value
  );
  const hasAssociateData = associates.some(entry => 
    entry.fullName.firstName.value || entry.fullName.lastName.value
  );
  
  return hasImmediateFamilyData || hasExtendedFamilyData || hasAssociateData;
}

/**
 * Determines which fields should be visible based on citizenship status
 */
export function getVisibleFieldsForCitizenship(citizenship: string): string[] {
  const visibleFields: string[] = ['citizenship'];
  
  if (citizenship === 'Other') {
    visibleFields.push('citizenshipCountry');
  }
  
  return visibleFields;
}

/**
 * Determines which fields should be visible based on deceased status
 */
export function getVisibleFieldsForDeceased(isDeceased: string): string[] {
  const visibleFields: string[] = ['isDeceased'];
  
  if (isDeceased === 'YES') {
    visibleFields.push('dateOfDeath', 'dateOfDeathEstimated');
  } else {
    visibleFields.push(
      'currentAddress', 'contactInfo', 'currentEmployment', 
      'foreignTravelFrequency', 'lastContactDate', 'natureOfContact'
    );
  }
  
  return visibleFields;
} 