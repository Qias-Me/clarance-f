/**
 * Section 9: Citizenship of Your Parents
 *
 * TypeScript interface definitions for SF-86 Section 9 citizenship data structure.
 * Based on the established Field<T> interface patterns and PDF field ID mappings.
 */

import type { Field } from '../formDefinition2.0';

// ============================================================================
// CORE INTERFACES
// ============================================================================

/**
 * Born in US or territory (Section 9.1) information
 */
export interface BornInUSInfo {
  documentType: Field<"FS240" | "DS1350" | "FS545" | "Other (Provide explanation)">;
  otherExplanation?: Field<string>;
  documentNumber: Field<string>;
  documentIssueDate: Field<string>;
  isIssueDateEstimated: Field<boolean>;
  issueCity: Field<string>;
  issueState?: Field<string>;
  issueCountry?: Field<string>;
  nameOnDocument: {
    lastName: Field<string>;
    firstName: Field<string>;
    middleName?: Field<string>;
    suffix?: Field<string>;
  };
  certificateNumber?: Field<string>;
  certificateIssueDate?: Field<string>;
  isCertificateDateEstimated?: Field<boolean>;
  nameOnCertificate?: {
    lastName: Field<string>;
    firstName: Field<string>;
    middleName?: Field<string>;
    suffix?: Field<string>;
  };
  wasBornOnMilitaryInstallation: Field<"YES" | "NO">;
  militaryBaseName?: Field<string>;
}

/**
 * Naturalized US Citizen (Section 9.2) information
 */
export interface NaturalizedCitizenInfo {
  naturalizedCertificateNumber: Field<string>;
  nameOnCertificate: {
    lastName: Field<string>;
    firstName: Field<string>;
    middleName?: Field<string>;
    suffix?: Field<string>;
  };
  courtAddress: {
    street: Field<string>;
    city: Field<string>;
    state?: Field<string>;
    zipCode?: Field<string>;
  };
  certificateIssueDate: Field<string>;
  isCertificateDateEstimated: Field<boolean>;
  otherExplanation?: Field<string>;
}

/**
 * Derived US Citizen (Section 9.3) information
 */
export interface DerivedCitizenInfo {
  alienRegistrationNumber?: Field<string>;
  permanentResidentCardNumber?: Field<string>;
  certificateOfCitizenshipNumber?: Field<string>;
  nameOnDocument: {
    lastName: Field<string>;
    firstName: Field<string>;
    middleName?: Field<string>;
    suffix?: Field<string>;
  };
  basis: Field<"By operation of law through my U.S. citizen parent" | "Other">;
  otherExplanation?: Field<string>;
}

/**
 * Non-US Citizen (Section 9.4) information
 */
export interface NonUSCitizenInfo {
  entryDate: Field<string>;
  isEntryDateEstimated: Field<boolean>;
  entryLocation: {
    city: Field<string>;
    state?: Field<string>;
  };
  countryOfCitizenship: {
    country1: Field<string>;
    country2?: Field<string>;
  };
  hasAlienRegistration: Field<"YES" | "NO">;
  alienRegistrationNumber?: Field<string>;
  alienRegistrationExpiration?: Field<string>;
  isAlienExpDateEstimated?: Field<boolean>;
  visaType?: Field<string>;
  visaNumber?: Field<string>;
  visaIssueDate?: Field<string>;
  isVisaIssueDateEstimated?: Field<boolean>;
  location?: Field<string>;
  i94Number?: Field<string>;
}

/**
 * Section 9 main data structure
 */
export interface Section9 {
  _id: number;
  citizenshipStatus: {
    status: Field<
      | "I am a U.S. citizen or national by birth in the U.S. or U.S. territory/commonwealth"
      | "I am a U.S. citizen or national by birth, born to U.S. parent(s), in a foreign country"
      | "I am a naturalized U.S. citizen"
      | "I am a derived U.S. citizen"
      | "I am not a U.S. citizen"
    >;
    bornToUSParents?: BornInUSInfo;
    naturalizedCitizen?: NaturalizedCitizenInfo;
    derivedCitizen?: DerivedCitizenInfo;
    nonUSCitizen?: NonUSCitizenInfo;
  };
}

// ============================================================================
// SUBSECTION TYPES
// ============================================================================

/**
 * Section 9 subsection keys for type safety
 */
export type Section9SubsectionKey = 'citizenshipStatus';

// ============================================================================
// FIELD ID MAPPINGS
// ============================================================================

/**
 * PDF field ID patterns for Section 9
 * Based on the Sections7-9 pattern from the JSON reference
 */
export const SECTION9_FIELD_IDS = {
  // Main citizenship status options
  CITIZENSHIP_STATUS: "form1[0].Sections7-9[0].RadioButtonList[1]",
  
  // Section 9.1 - Born to US Parents
  DOCUMENT_TYPE: "form1[0].Sections7-9[0].RadioButtonList[3]",
  OTHER_EXPLANATION: "form1[0].Sections7-9[0].TextField11[3]",
  DOCUMENT_NUMBER: "form1[0].Sections7-9[0].TextField11[4]",
  DOCUMENT_ISSUE_DATE: "form1[0].Sections7-9[0].From_Datefield_Name_2[1]",
  IS_ISSUE_DATE_ESTIMATED: "form1[0].Sections7-9[0].#field[25]",
  ISSUE_CITY: "form1[0].Sections7-9[0].TextField11[5]",
  ISSUE_STATE: "form1[0].Sections7-9[0].School6_State[0]",
  ISSUE_COUNTRY: "form1[0].Sections7-9[0].DropDownList12[0]",
  NAME_LAST: "form1[0].Sections7-9[0].TextField11[7]",
  NAME_FIRST: "form1[0].Sections7-9[0].TextField11[8]",
  NAME_MIDDLE: "form1[0].Sections7-9[0].TextField11[6]",
  NAME_SUFFIX: "form1[0].Sections7-9[0].suffix[1]",
  CERTIFICATE_NUMBER: "form1[0].Sections7-9[0].TextField11[12]",
  CERTIFICATE_ISSUE_DATE: "form1[0].Sections7-9[0].From_Datefield_Name_2[2]",
  IS_CERTIFICATE_DATE_ESTIMATED: "form1[0].Sections7-9[0].#field[28]",
  CERTIFICATE_NAME_LAST: "form1[0].Sections7-9[0].TextField11[10]",
  CERTIFICATE_NAME_FIRST: "form1[0].Sections7-9[0].TextField11[11]",
  CERTIFICATE_NAME_MIDDLE: "form1[0].Sections7-9[0].TextField11[9]",
  CERTIFICATE_NAME_SUFFIX: "form1[0].Sections7-9[0].suffix[2]",
  BORN_ON_MILITARY_INSTALLATION: "form1[0].Sections7-9[0].RadioButtonList[2]",
  MILITARY_BASE_NAME: "form1[0].Sections7-9[0].TextField11[18]",
  
  // Section 9.2 - Naturalized Citizen
  NATURALIZED_CERTIFICATE_NUMBER: "form1[0].Section9\\.1-9\\.4[0].TextField11[6]",
  NATURALIZED_NAME_LAST: "form1[0].Section9\\.1-9\\.4[0].TextField11[2]",
  NATURALIZED_NAME_FIRST: "form1[0].Section9\\.1-9\\.4[0].TextField11[3]",
  NATURALIZED_NAME_MIDDLE: "form1[0].Section9\\.1-9\\.4[0].TextField11[1]",
  NATURALIZED_NAME_SUFFIX: "form1[0].Section9\\.1-9\\.4[0].suffix[0]",
  COURT_STREET: "form1[0].Section9\\.1-9\\.4[0].TextField11[4]",
  COURT_CITY: "form1[0].Section9\\.1-9\\.4[0].TextField11[0]",
  COURT_STATE: "form1[0].Section9\\.1-9\\.4[0].School6_State[0]",
  COURT_ZIP: "form1[0].Section9\\.1-9\\.4[0].TextField11[5]",
  NATURALIZED_CERTIFICATE_DATE: "form1[0].Section9\\.1-9\\.4[0].From_Datefield_Name_2[0]",
  IS_NATURALIZED_DATE_ESTIMATED: "form1[0].Section9\\.1-9\\.4[0].#field[10]",
  NATURALIZED_OTHER_EXPLANATION: "form1[0].Section9\\.1-9\\.4[0].TextField11[7]",
  
  // Section 9.3 - Derived Citizen
  DERIVED_ALIEN_NUMBER: "form1[0].Section9\\.1-9\\.4[0].TextField11[19]",
  DERIVED_RESIDENT_CARD: "form1[0].Section9\\.1-9\\.4[0].TextField11[20]",
  DERIVED_CERTIFICATE_NUMBER: "form1[0].Section9\\.1-9\\.4[0].TextField11[21]",
  DERIVED_NAME_LAST: "form1[0].Section9\\.1-9\\.4[0].TextField11[23]",
  DERIVED_NAME_FIRST: "form1[0].Section9\\.1-9\\.4[0].TextField11[24]",
  DERIVED_NAME_MIDDLE: "form1[0].Section9\\.1-9\\.4[0].TextField11[22]",
  DERIVED_NAME_SUFFIX: "form1[0].Section9\\.1-9\\.4[0].suffix[2]",
  DERIVED_BASIS_OTHER: "form1[0].Section9\\.1-9\\.4[0].#field[50]",
  DERIVED_OTHER_EXPLANATION: "form1[0].Section9\\.1-9\\.4[0].TextField11[25]",
  
  // Section 9.4 - Non-US Citizen
  ENTRY_DATE: "form1[0].Section9\\.1-9\\.4[0].From_Datefield_Name_2[1]",
  IS_ENTRY_DATE_ESTIMATED: "form1[0].Section9\\.1-9\\.4[0].#field[21]",
  ENTRY_CITY: "form1[0].Section9\\.1-9\\.4[0].TextField11[18]",
  ENTRY_STATE: "form1[0].Section9\\.1-9\\.4[0].School6_State[1]",
  CITIZENSHIP_COUNTRY_1: "form1[0].Section9\\.1-9\\.4[0].DropDownList15[2]",
  CITIZENSHIP_COUNTRY_2: "form1[0].Section9\\.1-9\\.4[0].DropDownList15[3]",
  HAS_ALIEN_REGISTRATION: "form1[0].Section9\\.1-9\\.4[0].RadioButtonList[0]",
  ALIEN_REGISTRATION_NUMBER: "form1[0].Section9\\.1-9\\.4[0].TextField11[14]",
  ALIEN_REGISTRATION_EXPIRATION: "form1[0].Section9\\.1-9\\.4[0].From_Datefield_Name_2[2]",
  IS_ALIEN_EXP_DATE_ESTIMATED: "form1[0].Section9\\.1-9\\.4[0].#field[25]"
} as const;

// ============================================================================
// UTILITY TYPES
// ============================================================================

/**
 * Type for creating new citizenship entries
 */
export type CreateCitizenshipEntryParams = {
  entryIndex: number;
};

/**
 * Type for citizenship entry updates
 */
export type CitizenshipEntryUpdate = {
  entryIndex: number;
  fieldPath: string;
  newValue: any;
};

/**
 * Type for bulk citizenship entry operations
 */
export type BulkCitizenshipOperation = {
  operation: 'add' | 'remove' | 'update' | 'move';
  entryIndex?: number;
  targetIndex?: number;
  data?: Partial<BornInUSInfo | NaturalizedCitizenInfo | DerivedCitizenInfo | NonUSCitizenInfo>;
}; 