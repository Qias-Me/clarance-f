/**
 * Section 9: Citizenship of Your Parents - Field Mapping
 * 
 * This file contains the mapping between the form fields and the PDF fields
 * for SF-86 Section 9 (Citizenship).
 */

/**
 * Field ID mappings for Section 9
 */
export const SECTION9_FIELD_MAPPINGS: Record<string, string> = {
  // Main citizenship status fields
  "citizenshipStatus.status": "form1[0].Sections7-9[0].RadioButtonList[1]",
  
  // Section 9.1 - Born to US Parents
  "citizenshipStatus.bornToUSParents.documentType": "form1[0].Sections7-9[0].RadioButtonList[3]",
  "citizenshipStatus.bornToUSParents.otherExplanation": "form1[0].Sections7-9[0].TextField11[3]",
  "citizenshipStatus.bornToUSParents.documentNumber": "form1[0].Sections7-9[0].TextField11[4]",
  "citizenshipStatus.bornToUSParents.documentIssueDate": "form1[0].Sections7-9[0].From_Datefield_Name_2[1]",
  "citizenshipStatus.bornToUSParents.isIssueDateEstimated": "form1[0].Sections7-9[0].#field[25]",
  "citizenshipStatus.bornToUSParents.issueCity": "form1[0].Sections7-9[0].TextField11[5]",
  "citizenshipStatus.bornToUSParents.issueState": "form1[0].Sections7-9[0].School6_State[0]",
  "citizenshipStatus.bornToUSParents.issueCountry": "form1[0].Sections7-9[0].DropDownList12[0]",
  "citizenshipStatus.bornToUSParents.nameOnDocument.lastName": "form1[0].Sections7-9[0].TextField11[7]",
  "citizenshipStatus.bornToUSParents.nameOnDocument.firstName": "form1[0].Sections7-9[0].TextField11[8]",
  "citizenshipStatus.bornToUSParents.nameOnDocument.middleName": "form1[0].Sections7-9[0].TextField11[6]",
  "citizenshipStatus.bornToUSParents.nameOnDocument.suffix": "form1[0].Sections7-9[0].suffix[1]",
  "citizenshipStatus.bornToUSParents.certificateNumber": "form1[0].Sections7-9[0].TextField11[12]",
  "citizenshipStatus.bornToUSParents.certificateIssueDate": "form1[0].Sections7-9[0].From_Datefield_Name_2[2]",
  "citizenshipStatus.bornToUSParents.isCertificateDateEstimated": "form1[0].Sections7-9[0].#field[28]",
  "citizenshipStatus.bornToUSParents.nameOnCertificate.lastName": "form1[0].Sections7-9[0].TextField11[10]",
  "citizenshipStatus.bornToUSParents.nameOnCertificate.firstName": "form1[0].Sections7-9[0].TextField11[11]",
  "citizenshipStatus.bornToUSParents.nameOnCertificate.middleName": "form1[0].Sections7-9[0].TextField11[9]",
  "citizenshipStatus.bornToUSParents.nameOnCertificate.suffix": "form1[0].Sections7-9[0].suffix[2]",
  "citizenshipStatus.bornToUSParents.wasBornOnMilitaryInstallation": "form1[0].Sections7-9[0].RadioButtonList[2]",
  "citizenshipStatus.bornToUSParents.militaryBaseName": "form1[0].Sections7-9[0].TextField11[18]",
  
  // Section 9.2 - Naturalized Citizen
  "citizenshipStatus.naturalizedCitizen.naturalizedCertificateNumber": "form1[0].Section9\\.1-9\\.4[0].TextField11[6]",
  "citizenshipStatus.naturalizedCitizen.nameOnCertificate.lastName": "form1[0].Section9\\.1-9\\.4[0].TextField11[2]",
  "citizenshipStatus.naturalizedCitizen.nameOnCertificate.firstName": "form1[0].Section9\\.1-9\\.4[0].TextField11[3]",
  "citizenshipStatus.naturalizedCitizen.nameOnCertificate.middleName": "form1[0].Section9\\.1-9\\.4[0].TextField11[1]",
  "citizenshipStatus.naturalizedCitizen.nameOnCertificate.suffix": "form1[0].Section9\\.1-9\\.4[0].suffix[0]",
  "citizenshipStatus.naturalizedCitizen.courtAddress.street": "form1[0].Section9\\.1-9\\.4[0].TextField11[4]",
  "citizenshipStatus.naturalizedCitizen.courtAddress.city": "form1[0].Section9\\.1-9\\.4[0].TextField11[0]",
  "citizenshipStatus.naturalizedCitizen.courtAddress.state": "form1[0].Section9\\.1-9\\.4[0].School6_State[0]",
  "citizenshipStatus.naturalizedCitizen.courtAddress.zipCode": "form1[0].Section9\\.1-9\\.4[0].TextField11[5]",
  "citizenshipStatus.naturalizedCitizen.certificateIssueDate": "form1[0].Section9\\.1-9\\.4[0].From_Datefield_Name_2[0]",
  "citizenshipStatus.naturalizedCitizen.isCertificateDateEstimated": "form1[0].Section9\\.1-9\\.4[0].#field[10]",
  "citizenshipStatus.naturalizedCitizen.otherExplanation": "form1[0].Section9\\.1-9\\.4[0].TextField11[7]",
  
  // Section 9.3 - Derived Citizen
  "citizenshipStatus.derivedCitizen.alienRegistrationNumber": "form1[0].Section9\\.1-9\\.4[0].TextField11[19]",
  "citizenshipStatus.derivedCitizen.permanentResidentCardNumber": "form1[0].Section9\\.1-9\\.4[0].TextField11[20]",
  "citizenshipStatus.derivedCitizen.certificateOfCitizenshipNumber": "form1[0].Section9\\.1-9\\.4[0].TextField11[21]",
  "citizenshipStatus.derivedCitizen.nameOnDocument.lastName": "form1[0].Section9\\.1-9\\.4[0].TextField11[23]",
  "citizenshipStatus.derivedCitizen.nameOnDocument.firstName": "form1[0].Section9\\.1-9\\.4[0].TextField11[24]",
  "citizenshipStatus.derivedCitizen.nameOnDocument.middleName": "form1[0].Section9\\.1-9\\.4[0].TextField11[22]",
  "citizenshipStatus.derivedCitizen.nameOnDocument.suffix": "form1[0].Section9\\.1-9\\.4[0].suffix[2]",
  "citizenshipStatus.derivedCitizen.basis": "form1[0].Section9\\.1-9\\.4[0].#field[50]",
  "citizenshipStatus.derivedCitizen.otherExplanation": "form1[0].Section9\\.1-9\\.4[0].TextField11[25]",
  
  // Section 9.4 - Non-US Citizen
  "citizenshipStatus.nonUSCitizen.entryDate": "form1[0].Section9\\.1-9\\.4[0].From_Datefield_Name_2[1]",
  "citizenshipStatus.nonUSCitizen.isEntryDateEstimated": "form1[0].Section9\\.1-9\\.4[0].#field[21]",
  "citizenshipStatus.nonUSCitizen.entryLocation.city": "form1[0].Section9\\.1-9\\.4[0].TextField11[18]",
  "citizenshipStatus.nonUSCitizen.entryLocation.state": "form1[0].Section9\\.1-9\\.4[0].School6_State[1]",
  "citizenshipStatus.nonUSCitizen.countryOfCitizenship.country1": "form1[0].Section9\\.1-9\\.4[0].DropDownList15[2]",
  "citizenshipStatus.nonUSCitizen.countryOfCitizenship.country2": "form1[0].Section9\\.1-9\\.4[0].DropDownList15[3]",
  "citizenshipStatus.nonUSCitizen.hasAlienRegistration": "form1[0].Section9\\.1-9\\.4[0].RadioButtonList[0]",
  "citizenshipStatus.nonUSCitizen.alienRegistrationNumber": "form1[0].Section9\\.1-9\\.4[0].TextField11[14]",
  "citizenshipStatus.nonUSCitizen.alienRegistrationExpiration": "form1[0].Section9\\.1-9\\.4[0].From_Datefield_Name_2[2]",
  "citizenshipStatus.nonUSCitizen.isAlienExpDateEstimated": "form1[0].Section9\\.1-9\\.4[0].#field[25]"
};

/**
 * Field validation mappings for Section 9
 */
export const SECTION9_VALIDATION_RULES: Record<string, any> = {
  "citizenshipStatus.status": {
    required: true,
    errorMessage: "Citizenship status is required"
  },
  "citizenshipStatus.bornToUSParents.documentNumber": {
    required: true,
    minLength: 1,
    maxLength: 20,
    errorMessage: "Document number is required"
  },
  "citizenshipStatus.bornToUSParents.documentIssueDate": {
    required: true,
    isDate: true,
    errorMessage: "Valid date is required (MM/DD/YYYY format)"
  },
  "citizenshipStatus.naturalizedCitizen.naturalizedCertificateNumber": {
    required: true,
    minLength: 1,
    maxLength: 20,
    errorMessage: "Certificate number is required"
  },
  "citizenshipStatus.derivedCitizen.nameOnDocument.lastName": {
    required: true,
    minLength: 1,
    maxLength: 100,
    errorMessage: "Last name is required"
  }
};

/**
 * Generate dynamic field mappings based on citizenship type
 */
export function getCitizenshipFieldMappings(citizenshipType: string): Record<string, string> {
  const mappings: Record<string, string> = {};
  
  for (const [key, value] of Object.entries(SECTION9_FIELD_MAPPINGS)) {
    if (key.startsWith(`citizenshipStatus.${citizenshipType}`)) {
      mappings[key] = value;
    }
  }
  
  return mappings;
}

/**
 * Get PDF field ID for a specific form field
 */
export function getSection9PdfFieldId(formFieldPath: string): string | null {
  return SECTION9_FIELD_MAPPINGS[formFieldPath] || null;
}

/**
 * Field transformation helpers for Section 9
 */
export const SECTION9_FIELD_TRANSFORMERS = {
  // Format dates as MM/DD/YYYY
  formatDate: (value: string): string => {
    if (!value) return '';
    try {
      const date = new Date(value);
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const year = date.getFullYear();
      return `${month}/${day}/${year}`;
    } catch (e) {
      return value;
    }
  },
  
  // Format document numbers (standardize format)
  formatDocumentNumber: (value: string): string => {
    if (!value) return '';
    // Remove any spaces or hyphens
    return value.replace(/[\s-]/g, '').toUpperCase();
  }
}; 