/**
 * Section 21: Psychological and Emotional Health (SIMPLIFIED)
 *
 * Simplified TypeScript interface following Section 1 gold standard pattern.
 * This approach eliminates the complex field mapping system and uses direct
 * createFieldFromReference() calls for proven reliability.
 * 
 * DESIGN PRINCIPLES:
 * - Follow Section 1 pattern exactly
 * - Use actual PDF field names from section-21.json
 * - Simple, flat structure for better maintainability
 * - Direct field mapping without custom generators
 * - Proven data persistence patterns
 */

import type { Field } from '../formDefinition2.0';
import { createFieldFromReference } from '../../utils/sections-references-loader';

// ============================================================================
// SIMPLIFIED SECTION 21 INTERFACE (Section 1 Pattern)
// ============================================================================

/**
 * Section 21 main data structure (simplified)
 */
export interface Section21Simple {
  _id: number;
  section21: {
    // Main radio button flags for each subsection
    mentalHealthConsultation: Field<'YES' | 'NO'>;
    courtOrderedTreatment: Field<'YES' | 'NO'>;
    hospitalization: Field<'YES' | 'NO'>;
    mentalHealthDiagnosis: Field<'YES' | 'NO'>;
    
    // Entry fields for mental health consultation (when YES is selected)
    // Using actual PDF field names from section-21.json
    consultationReason: Field<string>;
    consultationDiagnosis: Field<string>;
    consultationTreatment: Field<string>;
    consultationDateFrom: Field<string>;
    consultationDateTo: Field<string>;
    consultationPresent: Field<boolean>;
    
    // Professional information
    professionalFirstName: Field<string>;
    professionalLastName: Field<string>;
    professionalTitle: Field<string>;
    professionalOrganization: Field<string>;
    professionalStreet: Field<string>;
    professionalCity: Field<string>;
    professionalState: Field<string>;
    professionalZipCode: Field<string>;
    professionalCountry: Field<string>;
    professionalPhone: Field<string>;
  };
}

/**
 * Section 21 validation result
 */
export interface Section21ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  missingRequiredFields: string[];
}

// ============================================================================
// FIELD UPDATE INTERFACES (Section 1 Pattern)
// ============================================================================

/**
 * Section 21 field update structure
 */
export interface Section21FieldUpdate {
  fieldPath: string;
  newValue: any;
  fieldType?: string;
}

// ============================================================================
// DEFAULT DATA CREATION (Section 1 Pattern)
// ============================================================================

/**
 * Creates default Section 21 data structure using DRY approach with sections-references
 * Following Section 1 gold standard pattern
 */
export const createDefaultSection21Simple = (): Section21Simple => {
  // Note: Field validation will be handled by createFieldFromReference

  return {
    _id: 21,
    section21: {
      // Use actual PDF field names from section-21.json for direct mapping
      mentalHealthConsultation: createFieldFromReference(
        21,
        'form1[0].Section21a[0].RadioButtonList[0]',
        'NO' as 'YES' | 'NO'
      ),
      courtOrderedTreatment: createFieldFromReference(
        21,
        'form1[0].Section21b[0].RadioButtonList[0]',
        'NO' as 'YES' | 'NO'
      ),
      hospitalization: createFieldFromReference(
        21,
        'form1[0].Section21c[0].RadioButtonList[0]',
        'NO' as 'YES' | 'NO'
      ),
      mentalHealthDiagnosis: createFieldFromReference(
        21,
        'form1[0].section21d1[0].RadioButtonList[0]',
        'NO' as 'YES' | 'NO'
      ),
      
      // Entry fields using actual PDF field names
      consultationReason: createFieldFromReference(
        21,
        'form1[0].Section21a[0].TextField11[0]',
        ''
      ),
      consultationDiagnosis: createFieldFromReference(
        21,
        'form1[0].Section21a[0].TextField11[1]',
        ''
      ),
      consultationTreatment: createFieldFromReference(
        21,
        'form1[0].Section21a[0].TextField11[2]',
        ''
      ),
      consultationDateFrom: createFieldFromReference(
        21,
        'form1[0].Section21a[0].From_Datefield_Name_2[0]',
        ''
      ),
      consultationDateTo: createFieldFromReference(
        21,
        'form1[0].Section21a[0].From_Datefield_Name_2[1]',
        ''
      ),
      consultationPresent: createFieldFromReference(
        21,
        'form1[0].Section21a[0].#field[3]',
        false
      ),
      
      // Professional information using actual PDF field names
      professionalFirstName: createFieldFromReference(
        21,
        'form1[0].Section21a[0].TextField11[4]',
        ''
      ),
      professionalLastName: createFieldFromReference(
        21,
        'form1[0].Section21a[0].TextField11[5]',
        ''
      ),
      professionalTitle: createFieldFromReference(
        21,
        'form1[0].Section21a[0].TextField11[6]',
        ''
      ),
      professionalOrganization: createFieldFromReference(
        21,
        'form1[0].Section21a[0].TextField11[7]',
        ''
      ),
      professionalStreet: createFieldFromReference(
        21,
        'form1[0].Section21a[0].TextField11[8]',
        ''
      ),
      professionalCity: createFieldFromReference(
        21,
        'form1[0].Section21a[0].TextField11[9]',
        ''
      ),
      professionalState: createFieldFromReference(
        21,
        'form1[0].Section21a[0].School6_State[0]',
        ''
      ),
      professionalZipCode: createFieldFromReference(
        21,
        'form1[0].Section21a[0].TextField11[10]',
        ''
      ),
      professionalCountry: createFieldFromReference(
        21,
        'form1[0].Section21a[0].#field[8]',
        'United States'
      ),
      professionalPhone: createFieldFromReference(
        21,
        'form1[0].Section21a[0].TextField11[11]',
        ''
      )
    }
  };
};

/**
 * Updates a specific field in the Section 21 data structure
 * Following Section 1 pattern
 */
export const updateSection21Field = (
  section21Data: Section21Simple,
  update: Section21FieldUpdate
): Section21Simple => {
  const { fieldPath, newValue } = update;
  const newData = { ...section21Data };

  // Update the specified field using simple field path mapping
  if (fieldPath.includes('mentalHealthConsultation')) {
    newData.section21.mentalHealthConsultation.value = newValue;
  } else if (fieldPath.includes('courtOrderedTreatment')) {
    newData.section21.courtOrderedTreatment.value = newValue;
  } else if (fieldPath.includes('hospitalization')) {
    newData.section21.hospitalization.value = newValue;
  } else if (fieldPath.includes('mentalHealthDiagnosis')) {
    newData.section21.mentalHealthDiagnosis.value = newValue;
  } else if (fieldPath.includes('consultationReason')) {
    newData.section21.consultationReason.value = newValue;
  } else if (fieldPath.includes('consultationDiagnosis')) {
    newData.section21.consultationDiagnosis.value = newValue;
  } else if (fieldPath.includes('consultationTreatment')) {
    newData.section21.consultationTreatment.value = newValue;
  } else if (fieldPath.includes('consultationDateFrom')) {
    newData.section21.consultationDateFrom.value = newValue;
  } else if (fieldPath.includes('consultationDateTo')) {
    newData.section21.consultationDateTo.value = newValue;
  } else if (fieldPath.includes('consultationPresent')) {
    newData.section21.consultationPresent.value = newValue;
  } else if (fieldPath.includes('professionalFirstName')) {
    newData.section21.professionalFirstName.value = newValue;
  } else if (fieldPath.includes('professionalLastName')) {
    newData.section21.professionalLastName.value = newValue;
  } else if (fieldPath.includes('professionalTitle')) {
    newData.section21.professionalTitle.value = newValue;
  } else if (fieldPath.includes('professionalOrganization')) {
    newData.section21.professionalOrganization.value = newValue;
  } else if (fieldPath.includes('professionalStreet')) {
    newData.section21.professionalStreet.value = newValue;
  } else if (fieldPath.includes('professionalCity')) {
    newData.section21.professionalCity.value = newValue;
  } else if (fieldPath.includes('professionalState')) {
    newData.section21.professionalState.value = newValue;
  } else if (fieldPath.includes('professionalZipCode')) {
    newData.section21.professionalZipCode.value = newValue;
  } else if (fieldPath.includes('professionalCountry')) {
    newData.section21.professionalCountry.value = newValue;
  } else if (fieldPath.includes('professionalPhone')) {
    newData.section21.professionalPhone.value = newValue;
  }

  return newData;
};

/**
 * Validates Section 21 data
 * Following Section 1 pattern
 */
export function validateSection21Simple(section21Data: Section21Simple): Section21ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const missingRequiredFields: string[] = [];

  // Basic validation - if mental health consultation is YES, require reason
  if (section21Data.section21.mentalHealthConsultation.value === 'YES') {
    if (!section21Data.section21.consultationReason.value.trim()) {
      errors.push('Consultation reason is required when mental health consultation is YES');
      missingRequiredFields.push('consultationReason');
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    missingRequiredFields
  };
}
