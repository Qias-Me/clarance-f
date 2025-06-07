/**
 * Section 21: Psychological and Emotional Health - Field Mapping
 * 
 * This file provides the correct field mappings for Section 21 based on the actual
 * field names found in sections-references/section-21.json.
 * 
 * Field Pattern Analysis:
 * - Section21a[0] - Mental incompetence declarations (RadioButtonList[0])
 * - Section21b[0] - Court-ordered mental health consultations (RadioButtonList[0]) 
 * - Section21c[0] - Hospitalization for mental health (RadioButtonList[0])
 * - Section21d[0] - Current treatment (RadioButtonList[0])
 * - Section21e[0] - Other mental health conditions (RadioButtonList[0])
 */

import { createFieldFromReference } from '../../../../api/utils/sections-references-loader';

// ============================================================================
// SECTION 21 FIELD MAPPINGS - Based on actual section-21.json analysis
// ============================================================================

/**
 * Main question field mappings for each subsection
 */
export const SECTION21_MAIN_QUESTIONS = {
  // Mental incompetence declaration question
  mentalIncompetence: 'form1[0].Section21a[0].RadioButtonList[0]',
  
  // Court-ordered mental health consultation question  
  courtOrderedTreatment: 'form1[0].Section21b[0].RadioButtonList[0]',
  
  // Hospitalization for mental health question
  hospitalization: 'form1[0].Section21c[0].RadioButtonList[0]',
  
  // Current treatment question
  currentTreatment: 'form1[0].Section21d[0].RadioButtonList[0]',
  
  // Other mental health conditions question
  otherMentalHealth: 'form1[0].Section21e[0].RadioButtonList[0]'
} as const;

/**
 * Entry field patterns for each subsection type
 */
export const SECTION21_ENTRY_PATTERNS = {
  // Section21a - Mental incompetence entries
  mentalIncompetence: {
    date: (entryIndex: number) => `form1[0].Section21a${entryIndex > 0 ? '2' : ''}[0].From_Datefield_Name_2[${entryIndex > 1 ? entryIndex - 1 : 0}]`,
    dateEstimate: (entryIndex: number) => `form1[0].Section21a${entryIndex > 0 ? '2' : ''}[0].#field[${entryIndex > 1 ? 25 + (entryIndex - 2) * 22 : 3}]`,
    courtName: (entryIndex: number) => `form1[0].Section21a${entryIndex > 0 ? '2' : ''}[0].TextField11[${entryIndex > 1 ? 14 + (entryIndex - 2) * 14 : 0}]`,
    courtStreet: (entryIndex: number) => `form1[0].Section21a${entryIndex > 0 ? '2' : ''}[0].TextField11[${entryIndex > 1 ? 15 + (entryIndex - 2) * 14 : 1}]`,
    courtCity: (entryIndex: number) => `form1[0].Section21a${entryIndex > 0 ? '2' : ''}[0].TextField11[${entryIndex > 1 ? 16 + (entryIndex - 2) * 14 : 2}]`,
    courtState: (entryIndex: number) => `form1[0].Section21a${entryIndex > 0 ? '2' : ''}[0].School6_State[${entryIndex > 1 ? 3 + (entryIndex - 2) * 3 : 0}]`,
    courtCountry: (entryIndex: number) => `form1[0].Section21a${entryIndex > 0 ? '2' : ''}[0].#field[${entryIndex > 1 ? 30 + (entryIndex - 2) * 22 : 8}]`,
    courtZip: (entryIndex: number) => `form1[0].Section21a${entryIndex > 0 ? '2' : ''}[0].TextField11[${entryIndex > 1 ? 17 + (entryIndex - 2) * 14 : 3}]`
  },
  
  // Section21b - Court-ordered treatment entries
  courtOrderedTreatment: {
    date: (entryIndex: number) => `form1[0].Section21b${entryIndex > 0 ? '2' : ''}[0].From_Datefield_Name_2[0]`,
    dateEstimate: (entryIndex: number) => `form1[0].Section21b${entryIndex > 0 ? '2' : ''}[0].#field[3]`,
    courtName: (entryIndex: number) => `form1[0].Section21b${entryIndex > 0 ? '2' : ''}[0].TextField11[0]`,
    courtStreet: (entryIndex: number) => `form1[0].Section21b${entryIndex > 0 ? '2' : ''}[0].TextField11[1]`,
    courtCity: (entryIndex: number) => `form1[0].Section21b${entryIndex > 0 ? '2' : ''}[0].TextField11[2]`,
    courtState: (entryIndex: number) => `form1[0].Section21b${entryIndex > 0 ? '2' : ''}[0].School6_State[0]`,
    courtCountry: (entryIndex: number) => `form1[0].Section21b${entryIndex > 0 ? '2' : ''}[0].#field[8]`,
    courtZip: (entryIndex: number) => `form1[0].Section21b${entryIndex > 0 ? '2' : ''}[0].TextField11[3]`
  },
  
  // Section21c - Hospitalization entries
  hospitalization: {
    facilityName: (entryIndex: number) => `form1[0].Section21c[0].TextField11[${entryIndex * 6}]`,
    facilityStreet: (entryIndex: number) => `form1[0].Section21c[0].TextField11[${1 + entryIndex * 6}]`,
    facilityCity: (entryIndex: number) => `form1[0].Section21c[0].TextField11[${2 + entryIndex * 6}]`,
    facilityState: (entryIndex: number) => `form1[0].Section21c[0].School6_State[${entryIndex}]`,
    facilityCountry: (entryIndex: number) => `form1[0].Section21c[0].#field[${6 + entryIndex * 15}]`,
    facilityZip: (entryIndex: number) => `form1[0].Section21c[0].TextField11[${3 + entryIndex * 6}]`,
    fromDate: (entryIndex: number) => `form1[0].Section21c[0].From_Datefield_Name_2[${entryIndex * 2}]`,
    fromDateEstimate: (entryIndex: number) => `form1[0].Section21c[0].#field[${9 + entryIndex * 15}]`,
    toDate: (entryIndex: number) => `form1[0].Section21c[0].From_Datefield_Name_2[${1 + entryIndex * 2}]`,
    toDateEstimate: (entryIndex: number) => `form1[0].Section21c[0].#field[${12 + entryIndex * 15}]`,
    isPresent: (entryIndex: number) => `form1[0].Section21c[0].#field[${11 + entryIndex * 15}]`,
    isVoluntary: (entryIndex: number) => `form1[0].Section21c[0].#field[${13 + entryIndex * 15}]`,
    isInvoluntary: (entryIndex: number) => `form1[0].Section21c[0].#field[${14 + entryIndex * 15}]`
  },
  
  // Section21d - Current treatment entries (multiple subsections d, d2, d3)
  currentTreatment: {
    professionalName: (entryIndex: number) => {
      const subsection = entryIndex < 1 ? 'd' : entryIndex < 2 ? 'd2' : 'd3';
      const fieldIndex = entryIndex % 1 === 0 ? 0 : (entryIndex - 1) * 5;
      return `form1[0].Section21${subsection}[0].TextField11[${fieldIndex}]`;
    },
    professionalStreet: (entryIndex: number) => {
      const subsection = entryIndex < 1 ? 'd' : entryIndex < 2 ? 'd2' : 'd3';
      const fieldIndex = entryIndex % 1 === 0 ? 1 : (entryIndex - 1) * 5 + 1;
      return `form1[0].Section21${subsection}[0].TextField11[${fieldIndex}]`;
    },
    professionalCity: (entryIndex: number) => {
      const subsection = entryIndex < 1 ? 'd' : entryIndex < 2 ? 'd2' : 'd3';
      const fieldIndex = entryIndex % 1 === 0 ? 2 : (entryIndex - 1) * 5 + 2;
      return `form1[0].Section21${subsection}[0].TextField11[${fieldIndex}]`;
    },
    professionalState: (entryIndex: number) => {
      const subsection = entryIndex < 1 ? 'd' : entryIndex < 2 ? 'd2' : 'd3';
      const stateIndex = entryIndex % 1;
      return `form1[0].Section21${subsection}[0].School6_State[${stateIndex}]`;
    },
    professionalCountry: (entryIndex: number) => {
      const subsection = entryIndex < 1 ? 'd' : entryIndex < 2 ? 'd2' : 'd3';
      const fieldIndex = entryIndex < 1 ? 6 : entryIndex < 2 ? 17 : 28;
      return `form1[0].Section21${subsection}[0].#field[${fieldIndex}]`;
    },
    professionalZip: (entryIndex: number) => {
      const subsection = entryIndex < 1 ? 'd' : entryIndex < 2 ? 'd2' : 'd3';
      const fieldIndex = entryIndex % 1 === 0 ? 3 : (entryIndex - 1) * 5 + 3;
      return `form1[0].Section21${subsection}[0].TextField11[${fieldIndex}]`;
    }
  },
  
  // Section21e - Other mental health entries
  otherMentalHealth: {
    professionalName: (entryIndex: number) => {
      const subsection = entryIndex > 0 ? 'e1' : 'e';
      return `form1[0].Section21${subsection}[0].TextField11[0]`;
    },
    professionalStreet: (entryIndex: number) => {
      const subsection = entryIndex > 0 ? 'e1' : 'e';
      return `form1[0].Section21${subsection}[0].TextField11[1]`;
    },
    professionalCity: (entryIndex: number) => {
      const subsection = entryIndex > 0 ? 'e1' : 'e';
      return `form1[0].Section21${subsection}[0].TextField11[2]`;
    },
    professionalState: (entryIndex: number) => {
      const subsection = entryIndex > 0 ? 'e1' : 'e';
      return `form1[0].Section21${subsection}[0].School6_State[0]`;
    },
    professionalCountry: (entryIndex: number) => {
      const subsection = entryIndex > 0 ? 'e1' : 'e';
      return `form1[0].Section21${subsection}[0].#field[6]`;
    },
    professionalZip: (entryIndex: number) => {
      const subsection = entryIndex > 0 ? 'e1' : 'e';
      return `form1[0].Section21${subsection}[0].TextField11[3]`;
    },
    fromDate: (entryIndex: number) => {
      const subsection = entryIndex > 0 ? 'e1' : 'e';
      return `form1[0].Section21${subsection}[0].From_Datefield_Name_2[0]`;
    },
    fromDateEstimate: (entryIndex: number) => {
      const subsection = entryIndex > 0 ? 'e1' : 'e';
      return `form1[0].Section21${subsection}[0].#field[15]`;
    },
    toDate: (entryIndex: number) => {
      const subsection = entryIndex > 0 ? 'e1' : 'e';
      return `form1[0].Section21${subsection}[0].From_Datefield_Name_2[1]`;
    },
    toDateEstimate: (entryIndex: number) => {
      const subsection = entryIndex > 0 ? 'e1' : 'e';
      return `form1[0].Section21${subsection}[0].#field[18]`;
    },
    isPresent: (entryIndex: number) => {
      const subsection = entryIndex > 0 ? 'e1' : 'e';
      return `form1[0].Section21${subsection}[0].#field[17]`;
    }
  }
} as const;

/**
 * Generate field for Section 21 main questions
 */
export function createSection21MainQuestionField<T>(
  subsectionKey: keyof typeof SECTION21_MAIN_QUESTIONS,
  defaultValue: T
) {
  const fieldName = SECTION21_MAIN_QUESTIONS[subsectionKey];
  return createFieldFromReference(21, fieldName, defaultValue);
}

/**
 * Generate field for Section 21 entry fields
 */
export function createSection21EntryField<T>(
  subsectionKey: keyof typeof SECTION21_ENTRY_PATTERNS,
  fieldType: string,
  entryIndex: number,
  defaultValue: T
) {
  const patterns = SECTION21_ENTRY_PATTERNS[subsectionKey];
  const fieldGenerator = patterns[fieldType as keyof typeof patterns];
  
  if (!fieldGenerator) {
    console.warn(`Unknown field type: ${fieldType} for subsection: ${subsectionKey}`);
    return createFieldFromReference(21, `unknown_${fieldType}`, defaultValue);
  }
  
  const fieldName = fieldGenerator(entryIndex);
  return createFieldFromReference(21, fieldName, defaultValue);
}
