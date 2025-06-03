// /**
//  * Section 9: Citizenship of Your Parents - Field Generator
//  * 
//  * This file contains utility functions to generate field structures for
//  * Section 9 of the SF-86 form.
//  */

// import type { Field } from "../../../../api/interfaces/formDefinition2.0";
// import type { 
//   BornInUSInfo, 
//   NaturalizedCitizenInfo, 
//   DerivedCitizenInfo, 
//   NonUSCitizenInfo 
// } from "../../../../api/interfaces/sections2.0/section9";
// import { SECTION9_FIELD_IDS } from "../../../../api/interfaces/sections2.0/section9";

// /**
//  * Creates a standard Field<T> object with default values
//  */

// type Rect = {
//   x: number;
//   y: number;
//   width: number;
//   height: number;
// }

// export function createField<T>(
//   id: string,
//   type: string,
//   label: string,
//   options: string[],
//   rect: Rect,
//   defaultValue: T
// ): Field<T> {
//   return {
//     id,
//     type,
//     label,
//     options,
//     rect,
//     value: defaultValue,
//     isDirty: false,
//     isValid: true,
//     errors: []
//   };
// }

// /**
//  * Create a BornInUSInfo structure with default values
//  */
// export function createBornInUSInfo(): BornInUSInfo {
//   return {
//     documentType: createField(
//       SECTION9_FIELD_IDS.DOCUMENT_TYPE,
//       "radio",
//       "Select the document that qualifies you as a U.S. Citizen",
//       "FS240"
//     ),
//     documentNumber: createField(
//       SECTION9_FIELD_IDS.DOCUMENT_NUMBER,
//       "text",
//       "Document number",
//       ""
//     ),
//     documentIssueDate: createField(
//       SECTION9_FIELD_IDS.DOCUMENT_ISSUE_DATE,
//       "date",
//       "Document issue date",
//       ""
//     ),
//     isIssueDateEstimated: createField(
//       SECTION9_FIELD_IDS.IS_ISSUE_DATE_ESTIMATED,
//       "checkbox",
//       "Estimated",
//       false
//     ),
//     issueCity: createField(
//       SECTION9_FIELD_IDS.ISSUE_CITY,
//       "text",
//       "City of issuance",
//       ""
//     ),
//     issueState: createField(
//       SECTION9_FIELD_IDS.ISSUE_STATE,
//       "select",
//       "State",
//       ""
//     ),
//     issueCountry: createField(
//       SECTION9_FIELD_IDS.ISSUE_COUNTRY,
//       "select",
//       "Country",
//       ""
//     ),
//     nameOnDocument: {
//       lastName: createField(
//         SECTION9_FIELD_IDS.NAME_LAST,
//         "text",
//         "Last name",
//         ""
//       ),
//       firstName: createField(
//         SECTION9_FIELD_IDS.NAME_FIRST,
//         "text",
//         "First name",
//         ""
//       ),
//       middleName: createField(
//         SECTION9_FIELD_IDS.NAME_MIDDLE,
//         "text",
//         "Middle name",
//         ""
//       ),
//       suffix: createField(
//         SECTION9_FIELD_IDS.NAME_SUFFIX,
//         "select",
//         "Suffix",
//         ""
//       )
//     },
//     certificateNumber: createField(
//       SECTION9_FIELD_IDS.CERTIFICATE_NUMBER,
//       "text",
//       "Certificate number",
//       ""
//     ),
//     certificateIssueDate: createField(
//       SECTION9_FIELD_IDS.CERTIFICATE_ISSUE_DATE,
//       "date",
//       "Certificate issue date",
//       ""
//     ),
//     isCertificateDateEstimated: createField(
//       SECTION9_FIELD_IDS.IS_CERTIFICATE_DATE_ESTIMATED,
//       "checkbox",
//       "Estimated",
//       false
//     ),
//     nameOnCertificate: {
//       lastName: createField(
//         SECTION9_FIELD_IDS.CERTIFICATE_NAME_LAST,
//         "text",
//         "Last name",
//         ""
//       ),
//       firstName: createField(
//         SECTION9_FIELD_IDS.CERTIFICATE_NAME_FIRST,
//         "text",
//         "First name",
//         ""
//       ),
//       middleName: createField(
//         SECTION9_FIELD_IDS.CERTIFICATE_NAME_MIDDLE,
//         "text",
//         "Middle name",
//         ""
//       ),
//       suffix: createField(
//         SECTION9_FIELD_IDS.CERTIFICATE_NAME_SUFFIX,
//         "select",
//         "Suffix",
//         ""
//       )
//     },
//     wasBornOnMilitaryInstallation: createField(
//       SECTION9_FIELD_IDS.BORN_ON_MILITARY_INSTALLATION,
//       "radio",
//       "Were you born on a U.S. military installation?",
//       "NO"
//     ),
//     militaryBaseName: createField(
//       SECTION9_FIELD_IDS.MILITARY_BASE_NAME,
//       "text",
//       "Name of military installation",
//       ""
//     )
//   };
// }

// /**
//  * Create a NaturalizedCitizenInfo structure with default values
//  */
// export function createNaturalizedCitizenInfo(): NaturalizedCitizenInfo {
//   return {
//     naturalizedCertificateNumber: createField(
//       SECTION9_FIELD_IDS.NATURALIZED_CERTIFICATE_NUMBER,
//       "text",
//       "Certificate of Naturalization number (N550 or N570)",
//       ""
//     ),
//     nameOnCertificate: {
//       lastName: createField(
//         SECTION9_FIELD_IDS.NATURALIZED_NAME_LAST,
//         "text",
//         "Last name",
//         ""
//       ),
//       firstName: createField(
//         SECTION9_FIELD_IDS.NATURALIZED_NAME_FIRST,
//         "text",
//         "First name",
//         ""
//       ),
//       middleName: createField(
//         SECTION9_FIELD_IDS.NATURALIZED_NAME_MIDDLE,
//         "text",
//         "Middle name",
//         ""
//       ),
//       suffix: createField(
//         SECTION9_FIELD_IDS.NATURALIZED_NAME_SUFFIX,
//         "select",
//         "Suffix",
//         ""
//       )
//     },
//     courtAddress: {
//       street: createField(
//         SECTION9_FIELD_IDS.COURT_STREET,
//         "text",
//         "Street address",
//         ""
//       ),
//       city: createField(
//         SECTION9_FIELD_IDS.COURT_CITY,
//         "text",
//         "City",
//         ""
//       ),
//       state: createField(
//         SECTION9_FIELD_IDS.COURT_STATE,
//         "select",
//         "State",
//         ""
//       ),
//       zipCode: createField(
//         SECTION9_FIELD_IDS.COURT_ZIP,
//         "text",
//         "ZIP Code",
//         ""
//       )
//     },
//     certificateIssueDate: createField(
//       SECTION9_FIELD_IDS.NATURALIZED_CERTIFICATE_DATE,
//       "date",
//       "Certificate issue date",
//       ""
//     ),
//     isCertificateDateEstimated: createField(
//       SECTION9_FIELD_IDS.IS_NATURALIZED_DATE_ESTIMATED,
//       "checkbox",
//       "Estimated",
//       false
//     ),
//     otherExplanation: createField(
//       SECTION9_FIELD_IDS.NATURALIZED_OTHER_EXPLANATION,
//       "text",
//       "Explanation",
//       ""
//     )
//   };
// }

// /**
//  * Create a DerivedCitizenInfo structure with default values
//  */
// export function createDerivedCitizenInfo(): DerivedCitizenInfo {
//   return {
//     alienRegistrationNumber: createField(
//       SECTION9_FIELD_IDS.DERIVED_ALIEN_NUMBER,
//       "text",
//       "Alien Registration Number",
//       ""
//     ),
//     permanentResidentCardNumber: createField(
//       SECTION9_FIELD_IDS.DERIVED_RESIDENT_CARD,
//       "text",
//       "Permanent Resident Card Number (I-551)",
//       ""
//     ),
//     certificateOfCitizenshipNumber: createField(
//       SECTION9_FIELD_IDS.DERIVED_CERTIFICATE_NUMBER,
//       "text",
//       "Certificate of Citizenship Number (N560 or N561)",
//       ""
//     ),
//     nameOnDocument: {
//       lastName: createField(
//         SECTION9_FIELD_IDS.DERIVED_NAME_LAST,
//         "text",
//         "Last name",
//         ""
//       ),
//       firstName: createField(
//         SECTION9_FIELD_IDS.DERIVED_NAME_FIRST,
//         "text",
//         "First name",
//         ""
//       ),
//       middleName: createField(
//         SECTION9_FIELD_IDS.DERIVED_NAME_MIDDLE,
//         "text",
//         "Middle name",
//         ""
//       ),
//       suffix: createField(
//         SECTION9_FIELD_IDS.DERIVED_NAME_SUFFIX,
//         "select",
//         "Suffix",
//         ""
//       )
//     },
//     basis: createField(
//       SECTION9_FIELD_IDS.DERIVED_BASIS_OTHER,
//       "radio",
//       "Basis of citizenship",
//       "By operation of law through my U.S. citizen parent"
//     ),
//     otherExplanation: createField(
//       SECTION9_FIELD_IDS.DERIVED_OTHER_EXPLANATION,
//       "text",
//       "Explanation",
//       ""
//     )
//   };
// }

// /**
//  * Create a NonUSCitizenInfo structure with default values
//  */
// export function createNonUSCitizenInfo(): NonUSCitizenInfo {
//   return {
//     entryDate: createField(
//       SECTION9_FIELD_IDS.ENTRY_DATE,
//       "date",
//       "Date of entry into the U.S.",
//       ""
//     ),
//     isEntryDateEstimated: createField(
//       SECTION9_FIELD_IDS.IS_ENTRY_DATE_ESTIMATED,
//       "checkbox",
//       "Estimated",
//       false
//     ),
//     entryLocation: {
//       city: createField(
//         SECTION9_FIELD_IDS.ENTRY_CITY,
//         "text",
//         "City of entry",
//         ""
//       ),
//       state: createField(
//         SECTION9_FIELD_IDS.ENTRY_STATE,
//         "select",
//         "State",
//         ""
//       )
//     },
//     countryOfCitizenship: {
//       country1: createField(
//         SECTION9_FIELD_IDS.CITIZENSHIP_COUNTRY_1,
//         "select",
//         "Country of citizenship #1",
//         ""
//       ),
//       country2: createField(
//         SECTION9_FIELD_IDS.CITIZENSHIP_COUNTRY_2,
//         "select",
//         "Country of citizenship #2",
//         ""
//       )
//     },
//     hasAlienRegistration: createField(
//       SECTION9_FIELD_IDS.HAS_ALIEN_REGISTRATION,
//       "radio",
//       "Do you have an Alien Registration Number?",
//       "NO"
//     ),
//     alienRegistrationNumber: createField(
//       SECTION9_FIELD_IDS.ALIEN_REGISTRATION_NUMBER,
//       "text",
//       "Alien Registration Number",
//       ""
//     ),
//     alienRegistrationExpiration: createField(
//       SECTION9_FIELD_IDS.ALIEN_REGISTRATION_EXPIRATION,
//       "date",
//       "Expiration date",
//       ""
//     ),
//     isAlienExpDateEstimated: createField(
//       SECTION9_FIELD_IDS.IS_ALIEN_EXP_DATE_ESTIMATED,
//       "checkbox",
//       "Estimated",
//       false
//     )
//   };
// }

// /**
//  * Get US states for dropdown
//  */
// export function getUSStates(): string[] {
//   return [
//     "AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "DC", "FL",
//     "GA", "HI", "ID", "IL", "IN", "IA", "KS", "KY", "LA", "ME",
//     "MD", "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH",
//     "NJ", "NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA", "RI",
//     "SC", "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV", "WI", "WY"
//   ];
// }

// /**
//  * Get common suffixes for dropdown
//  */
// export function getSuffixes(): string[] {
//   return ["", "Jr.", "Sr.", "I", "II", "III", "IV", "V"];
// }

// /**
//  * Format date for display MM/DD/YYYY
//  */
// export function formatDate(date: string): string {
//   if (!date) return '';
//   try {
//     const dateObj = new Date(date);
//     const month = String(dateObj.getMonth() + 1).padStart(2, '0');
//     const day = String(dateObj.getDate()).padStart(2, '0');
//     const year = dateObj.getFullYear();
//     return `${month}/${day}/${year}`;
//   } catch (e) {
//     return date;
//   }
// } 