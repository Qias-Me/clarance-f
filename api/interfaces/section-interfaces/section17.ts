/**
 * Section 17: Marital Status Interface
 * SF-86 Section 17 - Marital Status and Relationship History
 */

import type { Field, FieldWithOptions } from '../formDefinition2.0';

/**
 * Marital Status Options
 */
export type MaritalStatusType = 
  | 'Single'
  | 'Married' 
  | 'Separated'
  | 'Divorced'
  | 'Widowed'
  | 'Cohabiting';

/**
 * Citizenship Types for Spouse
 */
export type CitizenshipType = 
  | 'U.S. Citizen'
  | 'Dual Citizenship' 
  | 'Foreign National';

/**
 * Address Information Interface
 */
export interface AddressInfo {
  street: Field<string>;
  city: Field<string>;
  state: Field<string>;
  zipcode: Field<string>;
  country: Field<string>;
}

/**
 * Person Name Interface
 */
export interface PersonName {
  first: Field<string>;
  middle: Field<string>;
  last: Field<string>;
  suffix?: Field<string>;
}

/**
 * Spouse/Partner Information
 */
export interface SpouseInfo {
  name: PersonName;
  birthDate: Field<string>;
  birthPlace: {
    city: Field<string>;
    state: Field<string>;
    country: Field<string>;
  };
  citizenship: FieldWithOptions<CitizenshipType>;
  ssn: Field<string>;
  otherNames?: PersonName[];
  currentAddress?: AddressInfo;
  phoneNumbers?: {
    home?: Field<string>;
    work?: Field<string>;
    cell?: Field<string>;
  };
  email?: Field<string>;
  employer?: {
    name: Field<string>;
    address: AddressInfo;
    position: Field<string>;
    supervisor: Field<string>;
    phone: Field<string>;
  };
}

/**
 * Marriage Information
 */
export interface MarriageInfo {
  date: Field<string>;
  location: {
    city: Field<string>;
    state: Field<string>;
    country: Field<string>;
  };
  type?: Field<string>; // Civil, Religious, Common Law
  officiant?: Field<string>;
}

/**
 * Separation/Divorce Information
 */
export interface SeparationInfo {
  separated: Field<boolean>;
  separationDate?: Field<string>;
  divorced: Field<boolean>;
  divorceDate?: Field<string>;
  divorceLocation?: {
    city: Field<string>;
    state: Field<string>;
    country: Field<string>;
  };
  reason?: Field<string>;
  courtRecord?: Field<string>;
}

/**
 * Previous Marriage Entry
 */
export interface PreviousMarriage {
  formerSpouse: SpouseInfo;
  marriageInfo: MarriageInfo;
  separationInfo: SeparationInfo;
  children?: {
    hasChildren: Field<boolean>;
    childrenDetails?: Array<{
      name: PersonName;
      birthDate: Field<string>;
      currentAddress?: AddressInfo;
    }>;
  };
}

/**
 * Cohabitation Information
 */
export interface CohabitationInfo {
  partner: SpouseInfo;
  relationshipStart: Field<string>;
  relationshipEnd?: Field<string>;
  livingTogether: Field<boolean>;
  cohabitationStart?: Field<string>;
  cohabitationEnd?: Field<string>;
  reason?: Field<string>;
}

/**
 * Section 17 Main Interface
 */
export interface Section17 {
  // Current Marital Status
  currentMaritalStatus: FieldWithOptions<MaritalStatusType>;
  
  // Current Spouse/Partner Information (if married/cohabiting)
  currentSpouse?: SpouseInfo;
  currentMarriage?: MarriageInfo;
  
  // Cohabitation Information (if applicable)
  cohabitation?: CohabitationInfo;
  
  // Previous Marriages
  hasPreviousMarriages: Field<boolean>;
  previousMarriages?: PreviousMarriage[];
  
  // Relationship History
  relationshipHistory?: {
    hasSignificantRelationships: Field<boolean>;
    relationships?: Array<{
      partner: {
        name: PersonName;
        birthDate: Field<string>;
        currentAddress?: AddressInfo;
      };
      relationshipType: Field<string>;
      startDate: Field<string>;
      endDate?: Field<string>;
      reason?: Field<string>;
    }>;
  };
  
  // Additional Information
  additionalInfo?: {
    legalName: Field<string>; // If different from current name
    nameChangeDocuments?: Field<string>;
    courtRecords?: Field<string>;
    otherRelevantInfo?: Field<string>;
  };
}

/**
 * Default Section 17 Data
 */
export const defaultSection17: Section17 = {
  currentMaritalStatus: {
    value: 'Single',
    required: true,
    options: ['Single', 'Married', 'Separated', 'Divorced', 'Widowed', 'Cohabiting']
  },
  hasPreviousMarriages: {
    value: false,
    required: true
  }
};

/**
 * Section 17 Validation Rules
 */
export const section17ValidationRules = {
  currentMaritalStatus: {
    required: true
  },
  currentSpouse: {
    requiredIf: (data: Section17) => 
      ['Married', 'Separated'].includes(data.currentMaritalStatus.value as string)
  },
  currentMarriage: {
    requiredIf: (data: Section17) => 
      ['Married', 'Separated', 'Divorced', 'Widowed'].includes(data.currentMaritalStatus.value as string)
  },
  cohabitation: {
    requiredIf: (data: Section17) => 
      data.currentMaritalStatus.value === 'Cohabiting'
  },
  previousMarriages: {
    requiredIf: (data: Section17) => 
      data.hasPreviousMarriages.value === true,
    minLength: 1
  }
};

/**
 * Field Path Constants for Section 17
 */
export const SECTION17_FIELD_PATHS = {
  CURRENT_MARITAL_STATUS: 'section17.currentMaritalStatus',
  HAS_PREVIOUS_MARRIAGES: 'section17.hasPreviousMarriages',
  CURRENT_SPOUSE_NAME_FIRST: 'section17.currentSpouse.name.first',
  CURRENT_SPOUSE_NAME_MIDDLE: 'section17.currentSpouse.name.middle',
  CURRENT_SPOUSE_NAME_LAST: 'section17.currentSpouse.name.last',
  CURRENT_SPOUSE_BIRTH_DATE: 'section17.currentSpouse.birthDate',
  CURRENT_SPOUSE_SSN: 'section17.currentSpouse.ssn',
  CURRENT_SPOUSE_CITIZENSHIP: 'section17.currentSpouse.citizenship',
  MARRIAGE_DATE: 'section17.currentMarriage.date',
  MARRIAGE_LOCATION_CITY: 'section17.currentMarriage.location.city',
  MARRIAGE_LOCATION_STATE: 'section17.currentMarriage.location.state',
  MARRIAGE_LOCATION_COUNTRY: 'section17.currentMarriage.location.country',
  SEPARATION_DATE: 'section17.separationInfo.separationDate',
  DIVORCE_DATE: 'section17.separationInfo.divorceDate',
  DIVORCE_LOCATION_CITY: 'section17.separationInfo.divorceLocation.city',
  DIVORCE_LOCATION_STATE: 'section17.separationInfo.divorceLocation.state',
  DIVORCE_LOCATION_COUNTRY: 'section17.separationInfo.divorceLocation.country'
} as const;

export type Section17FieldPath = typeof SECTION17_FIELD_PATHS[keyof typeof SECTION17_FIELD_PATHS];