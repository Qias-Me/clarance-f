import {type Field } from "../formDefinition";

interface CitizenshipInfo {
citizenship_status_code: Field<'birth' | 'naturalized' | 'derived' | 'nonCitizen' | 'citizen' | string>;
section9_1?: CitizenshipByBirthInfo;
section9_2?: NaturalizedCitizenInfo;
section9_3?:DerivedCitizenInfo;
section9_4?: NonCitizenInfo;
}

// Specific Information Interfaces for Each Citizenship Status
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
};

[
  "I am a U.S. citizen or national by birth in the U.S. or U.S. territory/commonwealth. (Proceed to Section 10)   ",
  "I am a U.S. citizen or national by birth, born to U.S. parent(s), in a foreign country. (Complete 9.1) ",
  "I am a naturalized U.S. citizen. (Complete 9.2) ",
  "I am a derived U.S. citizen. (Complete 9.3) ",
  "I am not a U.S. citizen. (Complete 9.4) ",
];



// document_issued: 
// 1: I-94 
// 2: U.S. Visa (red foil number) 
// 3: I-20 
// 4: DS-2019
// 5: Other (Provide explanation)
