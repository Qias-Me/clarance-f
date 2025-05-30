/**
 * Section 30: General Remarks / Continuation Sheets - Field Generator
 * 
 * This file contains utility functions to generate field structures for
 * Section 30 of the SF-86 form.
 */

import type { Field } from "../../../api/interfaces/formDefinition2.0";
import type { ContinuationEntry } from "../../../api/interfaces/sections2.0/section30";
import { SECTION30_FIELD_IDS } from "../../../api/interfaces/sections2.0/section30";

/**
 * Creates a standard Field<T> object with default values
 */
export function createField<T>(
  id: string,
  type: string,
  label: string,
  defaultValue: T
): Field<T> {
  return {
    id,
    type,
    label,
    value: defaultValue,
    isDirty: false,
    isValid: true,
    errors: []
  };
}

/**
 * Create a new continuation entry with default values
 */
export function createContinuationEntry(entryIndex: number): ContinuationEntry {
  return {
    _id: Date.now() + Math.random(),
    remarks: createField(
      SECTION30_FIELD_IDS.REMARKS,
      "textarea",
      "Use the space below to continue answers or a blank sheet(s) of paper. Include your name and SSN at the top of each blank sheet(s). Before each answer, identify the number of the item and attempt to maintain sequential order and question format.",
      ""
    ),
    personalInfo: {
      fullName: createField(
        SECTION30_FIELD_IDS.FULL_NAME_PAGE2,
        "text",
        "Full Name (Type or Print legibly)",
        ""
      ),
      otherNamesUsed: createField(
        SECTION30_FIELD_IDS.OTHER_NAMES_USED_PAGE2,
        "text",
        "Other names used",
        ""
      ),
      dateOfBirth: createField(
        SECTION30_FIELD_IDS.DATE_OF_BIRTH_PAGE2,
        "date",
        "Date of Birth (mm/dd/yyyy)",
        ""
      ),
      dateSigned: createField(
        SECTION30_FIELD_IDS.DATE_SIGNED_PAGE2,
        "date",
        "Date signed (mm/dd/yyyy)",
        ""
      ),
      currentAddress: {
        street: createField(
          SECTION30_FIELD_IDS.STREET_PAGE2,
          "text",
          "Current Street Address, Apt #",
          ""
        ),
        city: createField(
          SECTION30_FIELD_IDS.CITY_PAGE2,
          "text",
          "City (Country)",
          ""
        ),
        state: createField(
          SECTION30_FIELD_IDS.STATE_PAGE2,
          "select",
          "State",
          ""
        ),
        zipCode: createField(
          SECTION30_FIELD_IDS.ZIP_CODE_PAGE2,
          "text",
          "ZIP Code",
          ""
        ),
        telephoneNumber: createField(
          SECTION30_FIELD_IDS.TELEPHONE_PAGE2,
          "text",
          "Telephone number",
          ""
        )
      }
    },
    additionalInfo1: {
      radioButtonOption: createField(
        SECTION30_FIELD_IDS.RADIO_BUTTON_PAGE3,
        "radio",
        "RadioButtonList",
        ""
      ),
      whatIsPrognosis: createField(
        SECTION30_FIELD_IDS.PROGNOSIS_PAGE3,
        "text",
        "What is the prognosis?",
        ""
      ),
      natureOfCondition: createField(
        SECTION30_FIELD_IDS.NATURE_CONDITION_PAGE3,
        "text",
        "If so, describe the nature of the condition and the extent and duration of the impairment or treatment.",
        ""
      ),
      datesOfTreatment: createField(
        SECTION30_FIELD_IDS.DATES_TREATMENT_PAGE3,
        "text",
        "Dates of treatment?",
        ""
      )
    }
  };
}

/**
 * Get US states for dropdown
 */
export function getUSStates(): string[] {
  return [
    "AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "DC", "FL",
    "GA", "HI", "ID", "IL", "IN", "IA", "KS", "KY", "LA", "ME",
    "MD", "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH",
    "NJ", "NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA", "RI",
    "SC", "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV", "WI", "WY"
  ];
}

/**
 * Format phone number for display (XXX) XXX-XXXX
 */
export function formatPhoneNumber(phone: string): string {
  if (!phone) return '';
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length !== 10) return phone;
  return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
}

/**
 * Format date for display MM/DD/YYYY
 */
export function formatDate(date: string): string {
  if (!date) return '';
  try {
    const dateObj = new Date(date);
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const day = String(dateObj.getDate()).padStart(2, '0');
    const year = dateObj.getFullYear();
    return `${month}/${day}/${year}`;
  } catch (e) {
    return date;
  }
} 