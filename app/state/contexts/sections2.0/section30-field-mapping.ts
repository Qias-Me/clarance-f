/**
 * Section 30: General Remarks / Continuation Sheets - Field Mapping
 *
 * This file contains the mapping between the form fields and the PDF fields
 * for SF-86 Section 30 (Continuation Sheets).
 */

/**
 * Field ID mappings for Section 30
 */
export const SECTION30_FIELD_MAPPINGS = {
  // Main continuation fields - Page 1 (page 133)
  "continuationSheets.entries[].remarks": "form1[0].continuation1[0].p15-t28[0]",
  "continuationSheets.entries[].personalInfo.dateSigned.page1": "form1[0].continuation1[0].p17-t2[0]",

  // Personal info fields - Page 2 (page 134)
  "continuationSheets.entries[].personalInfo.fullName.page2": "form1[0].continuation2[0].p17-t1[0]",
  "continuationSheets.entries[].personalInfo.dateSigned.page2": "form1[0].continuation2[0].p17-t2[0]",
  "continuationSheets.entries[].personalInfo.dateOfBirth": "form1[0].continuation2[0].p17-t4[0]",
  "continuationSheets.entries[].personalInfo.otherNamesUsed.page2": "form1[0].continuation2[0].p17-t3[0]",
  "continuationSheets.entries[].personalInfo.currentAddress.street.page2": "form1[0].continuation2[0].p17-t6[0]",
  "continuationSheets.entries[].personalInfo.currentAddress.city.page2": "form1[0].continuation2[0].p17-t8[0]",
  "continuationSheets.entries[].personalInfo.currentAddress.state.page2": "form1[0].continuation2[0].p17-t9[0]",
  "continuationSheets.entries[].personalInfo.currentAddress.zipCode.page2": "form1[0].continuation2[0].p17-t10[0]",
  "continuationSheets.entries[].personalInfo.currentAddress.telephoneNumber.page2": "form1[0].continuation2[0].p17-t11[0]",

  // Additional info fields - Page 3 (page 135)
  "continuationSheets.entries[].additionalInfo1.radioButtonOption": "form1[0].continuation3[0].RadioButtonList[0]",
  "continuationSheets.entries[].additionalInfo1.whatIsPrognosis": "form1[0].continuation3[0].TextField1[0]",
  "continuationSheets.entries[].additionalInfo1.natureOfCondition": "form1[0].continuation3[0].TextField1[1]",
  "continuationSheets.entries[].additionalInfo1.datesOfTreatment": "form1[0].continuation3[0].TextField1[2]",

  // Personal info fields - Page 3 (page 135)
  "continuationSheets.entries[].personalInfo.fullName.page3": "form1[0].continuation3[0].p17-t1[0]",
  "continuationSheets.entries[].personalInfo.dateSigned.page3": "form1[0].continuation3[0].p17-t2[0]",
  "continuationSheets.entries[].personalInfo.otherNamesUsed.page3": "form1[0].continuation3[0].p17-t3[0]",
  "continuationSheets.entries[].personalInfo.currentAddress.street.page3": "form1[0].continuation3[0].p17-t6[0]",
  "continuationSheets.entries[].personalInfo.currentAddress.city.page3": "form1[0].continuation3[0].p17-t8[0]",
  "continuationSheets.entries[].personalInfo.currentAddress.state.page3": "form1[0].continuation3[0].p17-t9[0]",
  "continuationSheets.entries[].personalInfo.currentAddress.zipCode.page3": "form1[0].continuation3[0].p17-t10[0]",
  "continuationSheets.entries[].personalInfo.currentAddress.telephoneNumber.page3": "form1[0].continuation3[0].p17-t11[0]",

  // Personal info fields - Page 4 (page 136)
  "continuationSheets.entries[].personalInfo.fullName.page4": "form1[0].continuation4[0].p17-t1[0]",
  "continuationSheets.entries[].personalInfo.dateSigned.page4": "form1[0].continuation4[0].p17-t2[0]"
};

/**
 * Field validation mappings
 */
export const SECTION30_VALIDATION_RULES = {
  "continuationSheets.entries[].remarks": {
    required: true,
    minLength: 1,
    maxLength: 5000,
    errorMessage: "Remarks are required"
  },
  "continuationSheets.entries[].personalInfo.fullName": {
    required: true,
    minLength: 1,
    maxLength: 100,
    errorMessage: "Full name is required"
  },
  "continuationSheets.entries[].personalInfo.dateSigned": {
    required: true,
    isDate: true,
    errorMessage: "Valid date is required (MM/DD/YYYY format)"
  }
};

/**
 * Generate dynamic field mappings based on entry index
 */
export function getSection30FieldMappings(entryIndex: number): Record<string, string> {
  const mappings: Record<string, string> = {};

  for (const [key, value] of Object.entries(SECTION30_FIELD_MAPPINGS)) {
    const newKey = key.replace('[]', `[${entryIndex}]`);
    mappings[newKey] = value;
  }

  return mappings;
}

/**
 * Get PDF field ID for a specific form field in a specific entry
 */
export function getSection30PdfFieldId(formFieldPath: string, entryIndex: number): string | null {
  const mappings = getSection30FieldMappings(entryIndex);
  return mappings[formFieldPath] || null;
}

/**
 * Field transformation helpers for Section 30
 */
export const SECTION30_FIELD_TRANSFORMERS = {
  // Format dates as MM/DD for 5-character fields or MM/DD/YYYY for longer fields
  formatDate: (value: string, maxLength?: number): string => {
    if (!value) return '';
    try {
      // Handle both YYYY-MM-DD and MM/DD/YYYY input formats
      let date: Date;
      if (value.includes('-')) {
        // YYYY-MM-DD format
        date = new Date(value);
      } else if (value.includes('/')) {
        // MM/DD/YYYY format
        date = new Date(value);
      } else {
        return value; // Return as-is if format is unrecognized
      }

      if (isNaN(date.getTime())) {
        return value; // Return original if invalid date
      }

      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const year = date.getFullYear();

      // If maxLength is 5, return MM/DD format
      if (maxLength === 5) {
        return `${month}/${day}`;
      }

      // Otherwise return full MM/DD/YYYY format
      return `${month}/${day}/${year}`;
    } catch (e) {
      console.warn('🚨 Date formatting error:', e);
      return value;
    }
  },

  // Format phone numbers as (XXX) XXX-XXXX
  formatPhoneNumber: (value: string): string => {
    if (!value) return '';
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length !== 10) return value;
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  }
};