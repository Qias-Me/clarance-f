import {type Field } from "../formDefinition";

/**
 * Main interface for Section 9: Citizenship Information
 * 
 * Contains fields for the person's citizenship status and specific information
 * based on their status (by birth, naturalized, derived, non-citizen)
 */
interface CitizenshipInfo {
  /** 
   * The person's citizenship status
   * - birth: U.S. citizen by birth
   * - naturalized: Naturalized U.S. citizen
   * - derived: Derived U.S. citizen
   * - nonCitizen: Not a U.S. citizen
   * - citizen: U.S. citizen by birth abroad
   */
  citizenship_status_code: Field<'birth' | 'naturalized' | 'derived' | 'nonCitizen' | 'citizen' | string>;
  
  /** Information for citizens born abroad to U.S. parents */
  section9_1?: CitizenshipByBirthInfo;
  
  /** Information for naturalized citizens */
  section9_2?: NaturalizedCitizenInfo;
  
  /** Information for derived citizens */
  section9_3?: DerivedCitizenInfo;
  
  /** Information for non-citizens */
  section9_4?: NonCitizenInfo;
  
  /** Additional metadata about the citizenship section */
  sectionMetadata?: SectionMetadata;
}

/**
 * Metadata about the Citizenship section
 */
interface SectionMetadata {
  /** Section number (9) */
  sectionNumber: number;
  
  /** Section title */
  sectionTitle: string;
  
  /** Last updated timestamp */
  lastUpdated?: string;
}

// Specific Information Interfaces for Each Citizenship Status
/**
 * Interface for information about citizens born abroad to U.S. parents
 */
interface CitizenshipByBirthInfo {
  doc_type: Field<"FS240" | "DS1350" | "FS545" | "Other (Provide explanation)">;
  other_doc?: Field<string>;
  doc_num: Field<string>;
  doc_issue_date: Field<string>;
  is_issue_date_est: Field<"Yes" | "No">;
  issue_city: Field<string>;
  issued_state?: Field<string>;
  issued_country?: Field<string>;
  issued_fname: Field<string>;
  issued_lname: Field<string>;
  issued_mname?: Field<string>;
  issued_suffix?: Field<string>;
  citizenship_num?: Field<string>;
  certificate_issue_date?: Field<string>;
  is_certificate_date_est?: Field<"Yes" | "No">;
  certificate_fname?: Field<string>;
  certificate_lname?: Field<string>;
  certificate_mname?: Field<string>;
  certificate_suffix?: Field<string>;
  is_born_installation?: Field<"YES" | "NO (If NO, proceed to Section 10)">;
  base_name?: Field<string>;
}

/**
 * Interface for information about naturalized U.S. citizens
 */
interface NaturalizedCitizenInfo {
  us_entry_date: Field<string>;
  is_us_entry_date_est: Field<"Yes" | "No">;
  entry_city: Field<string>;
  entry_state: Field<string>;
  country_of_citizenship_1: Field<string>; // Country #1
  country_of_citizenship_2: Field<string>; // Country #2
  has_alien_registration: Field<"YES" | "NO">;
  alien_registration_num?: Field<string>;
  naturalization_num: Field<string>;
  naturalization_issue_date: Field<string>;
  is_natural_issue_est: Field<"Yes" | "No">;
  court_issued_date: Field<string>;
  court_name: Field<string>;
  court_street: Field<string>;
  court_city: Field<string>;
  court_state: Field<string>;
  court_zip: Field<string>;
  court_issued_fname: Field<string>;
  court_issued_lname: Field<string>;
  court_issued_mname?: Field<string>;
  court_issued_suffix?: Field<string>;
  other_basis_detail?: Field<string>;
  is_other: Field<string>;
  is_basedOn_naturalization: Field<string>;
}

/**
 * Interface for information about derived U.S. citizens
 */
interface DerivedCitizenInfo {
  alien_registration_num?: Field<string>;
  permanent_resident_num?: Field<string>;
  certificate_of_citizenship_num?: Field<string>;
  doc_fname: Field<string>;
  doc_lname: Field<string>;
  doc_mname?: Field<string>;
  doc_suffix?: Field<string>;
  doc_issue_date: Field<string>;
  is_doc_date_est: Field<"Yes" | "No">;
  basis_of_citizenship_explanation?: Field<string>;
  is_other: Field<string>;
  is_basedOn_naturalization: Field<string>;
}

/**
 * Interface for information about non-U.S. citizens
 */
interface NonCitizenInfo {
  residence_status: Field<string>;
  us_entry_date: Field<string>;
  is_entry_date_est: Field<"Yes" | "No">;
  country_of_citizenship1: Field<string>;
  country_of_citizenship2?: Field<string>;
  entry_city: Field<string>;
  entry_state: Field<string>;
  alien_registration_num: Field<string>;
  expiration_date: Field<string>;
  is_expiration_est: Field<"Yes" | "No">;
  document_issued: Field<"1" | "2" | "3" | "4" | "5">;
  other_doc?: Field<string>;
  doc_num: Field<string>;
  doc_issued_date: Field<string>;
  is_doc_date_est: Field<"Yes" | "No">;
  doc_expire_date: Field<string>;
  is_doc_expiration_est: Field<"Yes" | "No">;
  doc_fname: Field<string>;
  doc_lname: Field<string>;
  doc_mname?: Field<string>;
  doc_suffix?: Field<string>;
}

export type {
  CitizenshipInfo,
  CitizenshipByBirthInfo,
  NaturalizedCitizenInfo,
  DerivedCitizenInfo,
  NonCitizenInfo,
  SectionMetadata
};

/**
 * Citizenship status options from the form
 */
export const CITIZENSHIP_STATUS_OPTIONS = [
  "I am a U.S. citizen or national by birth in the U.S. or U.S. territory/commonwealth. (Proceed to Section 10)   ",
  "I am a U.S. citizen or national by birth, born to U.S. parent(s), in a foreign country. (Complete 9.1) ",
  "I am a naturalized U.S. citizen. (Complete 9.2) ",
  "I am a derived U.S. citizen. (Complete 9.3) ",
  "I am not a U.S. citizen. (Complete 9.4) ",
];

/**
 * Document issued code meanings:
 * 1: I-94 
 * 2: U.S. Visa (red foil number) 
 * 3: I-20 
 * 4: DS-2019
 * 5: Other (Provide explanation)
 */
