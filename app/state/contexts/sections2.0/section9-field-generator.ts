/**
 * Section 9 Field Generator - Following Section 29 Pattern
 *
 * This module provides field generation utilities for Section 9 (Citizenship)
 * that map generic interface field names to actual PDF field names from sections-reference.
 *
 * Based on the successful Section 29 implementation pattern.
 */

import { getSectionFields, findFieldByName } from "../../../../api/utils/sections-references-loader";

// ============================================================================
// SECTION 9 FIELD MAPPING CONSTANTS
// ============================================================================

/**
 * PDF Field Names for Section 9 from sections-reference
 * These are the actual field names that exist in the SF-86 PDF
 * Based on the 'name' field in sections-reference JSON
 */
export const SECTION9_PDF_FIELD_NAMES = {
  // Main citizenship status radio button
  STATUS: "form1[0].Sections7-9[0].RadioButtonList[3]",

  // 9.1 Born to US Parents fields (based on sections-reference analysis)
  BORN_TO_US_DOCUMENT_TYPE: "form1[0].Sections7-9[0].RadioButtonList[3]", // Maps to FS 240, DS 1350, etc.
  BORN_TO_US_OTHER_EXPLAIN: "form1[0].Sections7-9[0].TextField11[3]", // sect9.1OtherExplain
  BORN_TO_US_DOCUMENT_NUMBER: "form1[0].Sections7-9[0].TextField11[4]", // DocumentNumber9.1
  BORN_TO_US_ISSUE_CITY: "form1[0].Sections7-9[0].TextField11[5]", // sect9.1City
  BORN_TO_US_CERT_MIDDLE_NAME: "form1[0].Sections7-9[0].TextField11[9]", // sect9.1CertificateMName
  BORN_TO_US_CERT_LAST_NAME: "form1[0].Sections7-9[0].TextField11[10]", // sect9.1CertificateLName
  BORN_TO_US_CERT_FIRST_NAME: "form1[0].Sections7-9[0].TextField11[11]", // sect9.1CertificateLFName
  BORN_TO_US_CERT_SUFFIX: "form1[0].Sections7-9[0].suffix[2]", // sect9.1certificateSuffix
  BORN_TO_US_CERT_NUMBER: "form1[0].Sections7-9[0].TextField11[12]", // sect9.1CertificateNumber
  BORN_TO_US_CERT_ISSUE_DATE: "form1[0].Sections7-9[0].From_Datefield_Name_2[2]", // sect9.1DateCertificateIssued
  BORN_TO_US_MILITARY_BASE: "form1[0].Sections7-9[0].TextField11[18]", // sect9.1Military Installation Base

  // 9.2 Naturalized Citizen fields (to be mapped from sections-reference)
  NATURALIZED_CERT_NUMBER: "form1[0].Sections7-9[0].TextField11[19]", // Placeholder
  NATURALIZED_COURT_NAME: "form1[0].Sections7-9[0].TextField11[20]", // Placeholder
  NATURALIZED_COURT_CITY: "form1[0].Sections7-9[0].TextField11[21]", // Placeholder
  NATURALIZED_COURT_STATE: "form1[0].Sections7-9[0].TextField11[22]", // Placeholder

  // 9.3 Derived Citizen fields (to be mapped from sections-reference)
  DERIVED_CERT_NUMBER: "form1[0].Sections7-9[0].TextField11[23]", // Placeholder
  DERIVED_NAME_FIRST: "form1[0].Sections7-9[0].TextField11[24]", // Placeholder
  DERIVED_NAME_LAST: "form1[0].Sections7-9[0].TextField11[25]", // Placeholder
  DERIVED_BASIS_PARENT: "form1[0].Sections7-9[0].TextField11[26]", // Placeholder
  DERIVED_BASIS_OTHER: "form1[0].Sections7-9[0].TextField11[27]", // Placeholder
  DERIVED_OTHER_EXPLAIN: "form1[0].Sections7-9[0].TextField11[28]", // Placeholder

  // 9.4 Non-US Citizen fields
  NON_US_DOCUMENT_NUMBER: "form1[0].Section9\\.1-9\\.4[0].TextField11[13]", // 9.4DocumentNumber
  NON_US_ENTRY_DATE: "form1[0].Sections7-9[0].TextField11[29]", // Placeholder
  NON_US_ALIEN_NUMBER: "form1[0].Sections7-9[0].TextField11[30]", // Placeholder
  NON_US_EXPIRATION_DATE: "form1[0].Sections7-9[0].TextField11[31]", // Placeholder
} as const;

/**
 * Default values from sections-reference for Section 9 fields
 * Based on the 'value' field in sections-reference JSON
 */
export const SECTION9_DEFAULT_VALUES = {
  STATUS: "I am a U.S. citizen or national by birth in the U.S. or U.S. territory/commonwealth. (Proceed to Section 10)   ",
  BORN_TO_US_DOCUMENT_TYPE: "FS 240 ",
  BORN_TO_US_OTHER_EXPLAIN: "sect9.1OtherExplain",
  BORN_TO_US_DOCUMENT_NUMBER: "DocumentNumber9.1",
  BORN_TO_US_ISSUE_CITY: "sect9.1City",
  BORN_TO_US_CERT_MIDDLE_NAME: "sect9.1CertificateMName",
  BORN_TO_US_CERT_LAST_NAME: "sect9.1CertificateLName",
  BORN_TO_US_CERT_FIRST_NAME: "sect9.1CertificateLFName",
  BORN_TO_US_CERT_SUFFIX: "sect9.1certificateSuffix",
  BORN_TO_US_CERT_NUMBER: "sect9.1CertificateNumber",
  BORN_TO_US_CERT_ISSUE_DATE: "sect9.1DateCertificateIssued",
  BORN_TO_US_MILITARY_BASE: "sect9.1Military Installation Base",
  NATURALIZED_CERT_NUMBER: "",
  NATURALIZED_COURT_NAME: "",
  NATURALIZED_COURT_CITY: "",
  NATURALIZED_COURT_STATE: "",
  DERIVED_CERT_NUMBER: "",
  DERIVED_NAME_FIRST: "",
  DERIVED_NAME_LAST: "",
  DERIVED_BASIS_PARENT: "",
  DERIVED_BASIS_OTHER: "",
  DERIVED_OTHER_EXPLAIN: "",
  NON_US_ENTRY_DATE: "",
  NON_US_ALIEN_NUMBER: "",
  NON_US_DOCUMENT_NUMBER: "9.4DocumentNumber",
  NON_US_EXPIRATION_DATE: "",
} as const;

// ============================================================================
// FIELD MAPPING FUNCTIONS
// ============================================================================

/**
 * Maps generic interface field names to actual PDF field names
 */
export const mapInterfaceFieldToPDFField = (
  subsection: string,
  fieldName: string
): string => {
  const key = `${subsection.toUpperCase()}_${fieldName.toUpperCase()}`;

  // Handle special cases for nested fields
  if (fieldName.includes('.')) {
    const parts = fieldName.split('.');
    const baseField = parts[0];
    const nestedField = parts[1];

    if (baseField === 'courtAddress') {
      if (nestedField === 'city') return SECTION9_PDF_FIELD_NAMES.NATURALIZED_COURT_CITY;
      if (nestedField === 'state') return SECTION9_PDF_FIELD_NAMES.NATURALIZED_COURT_STATE;
    }

    if (baseField === 'nameOnDocument') {
      if (nestedField === 'firstName') return SECTION9_PDF_FIELD_NAMES.DERIVED_NAME_FIRST;
      if (nestedField === 'lastName') return SECTION9_PDF_FIELD_NAMES.DERIVED_NAME_LAST;
    }
  }

  // Direct field mappings
  const fieldMappings: Record<string, string> = {
    'BORNTOUSPPARENTS_DOCUMENTTYPE': SECTION9_PDF_FIELD_NAMES.BORN_TO_US_DOCUMENT_TYPE,
    'BORNTOUSPPARENTS_OTHEREXPLANATION': SECTION9_PDF_FIELD_NAMES.BORN_TO_US_OTHER_EXPLAIN,
    'BORNTOUSPPARENTS_DOCUMENTNUMBER': SECTION9_PDF_FIELD_NAMES.BORN_TO_US_DOCUMENT_NUMBER,
    'BORNTOUSPPARENTS_DOCUMENTISSUEDATE': SECTION9_PDF_FIELD_NAMES.BORN_TO_US_CERT_ISSUE_DATE,
    'NATURALIZEDCITIZEN_NATURALIZEDCERTIFICATENUMBER': SECTION9_PDF_FIELD_NAMES.NATURALIZED_CERT_NUMBER,
    'NATURALIZEDCITIZEN_COURTNAME': SECTION9_PDF_FIELD_NAMES.NATURALIZED_COURT_NAME,
    'NATURALIZEDCITIZEN_CERTIFICATEISSUEDATE': SECTION9_PDF_FIELD_NAMES.NATURALIZED_CERT_NUMBER, // Placeholder
    'DERIVEDCITIZEN_CERTIFICATEOFCITIZENSHPNUMBER': SECTION9_PDF_FIELD_NAMES.DERIVED_CERT_NUMBER,
    'DERIVEDCITIZEN_BASIS': SECTION9_PDF_FIELD_NAMES.DERIVED_BASIS_PARENT,
    'DERIVEDCITIZEN_OTHEREXPLANATION': SECTION9_PDF_FIELD_NAMES.DERIVED_OTHER_EXPLAIN,
    'NONUSCITIZEN_ENTRYDATE': SECTION9_PDF_FIELD_NAMES.NON_US_ENTRY_DATE,
    'NONUSCITIZEN_ALIENREGISTRATIONNUMBER': SECTION9_PDF_FIELD_NAMES.NON_US_ALIEN_NUMBER,
    'NONUSCITIZEN_DOCUMENTNUMBER': SECTION9_PDF_FIELD_NAMES.NON_US_DOCUMENT_NUMBER,
    'NONUSCITIZEN_DOCUMENTEXPIRATIONDATE': SECTION9_PDF_FIELD_NAMES.NON_US_EXPIRATION_DATE,
  };

  return fieldMappings[key] || `UNMAPPED_${key}`;
};

/**
 * Gets the default value for a field from sections-reference
 */
export const getFieldDefaultValue = (
  subsection: string,
  fieldName: string
): string => {
  const pdfFieldName = mapInterfaceFieldToPDFField(subsection, fieldName);

  // Find the corresponding default value
  const defaultKey = Object.entries(SECTION9_PDF_FIELD_NAMES)
    .find(([_, value]) => value === pdfFieldName)?.[0];

  if (defaultKey && defaultKey in SECTION9_DEFAULT_VALUES) {
    return SECTION9_DEFAULT_VALUES[defaultKey as keyof typeof SECTION9_DEFAULT_VALUES];
  }

  return "";
};

/**
 * Generates field ID from sections-reference data
 */
export const generateSection9FieldId = (
  subsection: string,
  fieldName: string
): string => {
  const pdfFieldName = mapInterfaceFieldToPDFField(subsection, fieldName);

  try {
    const sectionFields = getSectionFields(9);
    const field = sectionFields.find(f => f.name === pdfFieldName);

    if (field) {
      // Extract numeric ID from field.id (e.g., "16435 0 R" -> "16435")
      const numericId = field.id.split(' ')[0];
      return numericId;
    }
  } catch (error) {
    console.warn(`Could not find field ID for ${pdfFieldName}:`, error);
  }

  return `UNKNOWN_ID_${subsection}_${fieldName}`;
};

/**
 * Generates field label for display
 */
export const generateSection9FieldLabel = (
  _subsection: string,
  fieldName: string
): string => {
  const labelMappings: Record<string, string> = {
    'documentType': 'Document Type',
    'otherExplanation': 'Other Document Type Explanation',
    'documentNumber': 'Document Number',
    'documentIssueDate': 'Document Issue Date',
    'naturalizedCertificateNumber': 'Certificate Number',
    'courtName': 'Court Name',
    'certificateIssueDate': 'Certificate Issue Date',
    'certificateOfCitizenshipNumber': 'Certificate of Citizenship Number',
    'basis': 'Basis of Derived Citizenship',
    'entryDate': 'Entry Date to United States',
    'alienRegistrationNumber': 'Alien Registration Number',
    'documentExpirationDate': 'Document Expiration Date',
  };

  return labelMappings[fieldName] || fieldName;
};

/**
 * Gets field input type for form rendering
 */
export const getSection9FieldInputType = (fieldName: string): string => {
  const typeMap: Record<string, string> = {
    'documentType': 'select',
    'basis': 'select',
    'status': 'select',
    'documentNumber': 'text',
    'naturalizedCertificateNumber': 'text',
    'certificateOfCitizenshipNumber': 'text',
    'courtName': 'text',
    'alienRegistrationNumber': 'text',
    'otherExplanation': 'text',
    'documentIssueDate': 'date',
    'certificateIssueDate': 'date',
    'entryDate': 'date',
    'documentExpirationDate': 'date',
  };

  return typeMap[fieldName] || 'text';
};

/**
 * Component field name to context field path mapper
 * Maps component field names to the correct context paths for updateFieldValue
 */
export const mapComponentFieldToContextPath = (
  subsection: string,
  fieldName: string
): string => {
  // Handle nested field paths
  if (fieldName.includes('.')) {
    return `${subsection}.${fieldName}`;
  }

  // Direct field mappings
  return `${subsection}.${fieldName}`;
};