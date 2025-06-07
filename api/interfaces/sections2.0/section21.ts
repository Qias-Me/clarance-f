/**
 * Section 21: Psychological and Emotional Health
 *
 * TypeScript interface definitions for SF-86 Section 21 (Psychological and Emotional Health) data structure.
 * Based on the established Field<T> interface patterns and PDF field ID mappings from section-21.json.
 * 
 * This section covers mental health consultations, diagnoses, treatments, hospitalizations,
 * and other psychological/emotional health issues.
 */

import type { Field } from '../formDefinition2.0';
import { createFieldFromReference } from '../../utils/sections-references-loader';

// ============================================================================
// LOCAL TYPE DEFINITIONS (avoiding import path issues)
// ============================================================================

/**
 * Address structure used across multiple sections
 */
export interface Address {
  street: Field<string>;
  city: Field<string>;
  state: Field<string>;
  zipCode: Field<string>;
  country: Field<string>;
}

/**
 * Date range structure used across multiple sections
 */
export interface DateRange {
  from: DateInfo;
  to: DateInfo;
  present: Field<boolean>;
}

/**
 * Date information with estimation flag
 */
export interface DateInfo {
  date: Field<string>;
  estimated: Field<boolean>;
}

/**
 * Name structure used across multiple sections
 */
export interface NameInfo {
  first: Field<string>;
  middle: Field<string>;
  last: Field<string>;
  suffix: Field<string>;
}

// ============================================================================
// SECTION 21 CORE INTERFACES
// ============================================================================

/**
 * Types of mental health consultations/treatments
 */
export type MentalHealthConsultationType = 
  | 'consultation'
  | 'treatment' 
  | 'counseling'
  | 'hospitalization'
  | 'court_ordered'
  | 'other';

/**
 * Mental health consultation entry
 */
export interface MentalHealthEntry {
  _id: Field<string | number>;
  consultationType: Field<MentalHealthConsultationType>;
  reason: Field<string>;
  diagnosis: Field<string>;
  treatmentDetails: Field<string>;
  dateRange: DateRange;
  professionalInfo: {
    name: NameInfo;
    title: Field<string>;
    organization: Field<string>;
    address: Address;
    phone: Field<string>;
  };
  wasVoluntary: Field<boolean>;
  currentlyReceivingTreatment: Field<boolean>;
  medicationPrescribed: Field<boolean>;
  medicationDetails: Field<string>;
  additionalComments: Field<string>;
}

/**
 * Court-ordered mental health treatment entry
 */
export interface CourtOrderedTreatmentEntry {
  _id: Field<string | number>;
  courtName: Field<string>;
  courtAddress: Address;
  orderDate: DateInfo;
  treatmentType: Field<string>;
  reason: Field<string>;
  treatmentProvider: {
    name: NameInfo;
    organization: Field<string>;
    address: Address;
  };
  treatmentDuration: DateRange;
  wasCompleted: Field<boolean>;
  currentStatus: Field<string>;
}

/**
 * Section 21 subsection keys
 */
export type Section21SubsectionKey = 
  | 'mentalHealthConsultations'
  | 'courtOrderedTreatment'
  | 'hospitalization'
  | 'otherMentalHealth';

/**
 * Mental health subsection structure
 */
export interface MentalHealthSubsection {
  hasConsultation: Field<'YES' | 'NO'>;
  entries: MentalHealthEntry[];
  entriesCount: number;
}

/**
 * Court-ordered treatment subsection structure
 */
export interface CourtOrderedSubsection {
  hasCourtOrdered: Field<'YES' | 'NO'>;
  entries: CourtOrderedTreatmentEntry[];
  entriesCount: number;
}

/**
 * Main Section 21 interface
 */
export interface Section21 {
  _id: number;
  section21: {
    mentalHealthConsultations: MentalHealthSubsection;
    courtOrderedTreatment: CourtOrderedSubsection;
    hospitalization: MentalHealthSubsection;
    otherMentalHealth: MentalHealthSubsection;
  };
}

// ============================================================================
// VALIDATION INTERFACES
// ============================================================================

/**
 * Mental health validation context
 */
export interface Section21ValidationContext {
  currentDate: Date;
  rules: {
    requiresReason: boolean;
    requiresProfessionalInfo: boolean;
    requiresDateRange: boolean;
    requiresTreatmentDetails: boolean;
    maxReasonLength: number;
    maxTreatmentLength: number;
    allowsFutureDate: boolean;
  };
  requiresDocumentation: boolean;
}

/**
 * Mental health validation result
 */
export interface MentalHealthValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  missingRequiredFields: string[];
}

// ============================================================================
// FIELD UPDATE INTERFACES
// ============================================================================

/**
 * Section 21 field update structure
 */
export interface Section21FieldUpdate {
  subsectionKey: Section21SubsectionKey;
  entryIndex?: number;
  fieldPath: string;
  newValue: any;
}

// ============================================================================
// FACTORY FUNCTIONS
// ============================================================================

/**
 * Creates a default mental health entry using actual PDF field names
 * Following Section 1 gold standard pattern
 */
export const createDefaultMentalHealthEntry = (): MentalHealthEntry => {
  console.log('🔧 Creating mental health entry with actual PDF field names');

  // Use actual PDF field names from section-21.json for Entry 1 (Section21a)
  return {
    _id: createFieldFromReference(21, 'form1[0].Section21a[0].#field[0]', Date.now()),
    consultationType: createFieldFromReference(21, 'form1[0].Section21a[0].#field[1]', 'consultation'),
    reason: createFieldFromReference(21, 'form1[0].Section21a[0].TextField11[0]', ''),
    diagnosis: createFieldFromReference(21, 'form1[0].Section21a[0].TextField11[1]', ''),
    treatmentDetails: createFieldFromReference(21, 'form1[0].Section21a[0].TextField11[2]', ''),
    dateRange: {
      from: {
        date: createFieldFromReference(21, 'form1[0].Section21a[0].From_Datefield_Name_2[0]', ''),
        estimated: createFieldFromReference(21, 'form1[0].Section21a[0].#field[3]', false)
      },
      to: {
        date: createFieldFromReference(21, 'form1[0].Section21a[0].From_Datefield_Name_2[1]', ''),
        estimated: createFieldFromReference(21, 'form1[0].Section21a[0].#field[4]', false)
      },
      present: createFieldFromReference(21, 'form1[0].Section21a[0].#field[5]', false)
    },
    professionalInfo: {
      name: {
        first: createFieldFromReference(21, 'form1[0].Section21a[0].TextField11[4]', ''),
        middle: createFieldFromReference(21, 'form1[0].Section21a[0].TextField11[5]', ''),
        last: createFieldFromReference(21, 'form1[0].Section21a[0].TextField11[6]', ''),
        suffix: createFieldFromReference(21, 'form1[0].Section21a[0].TextField11[7]', '')
      },
      title: createFieldFromReference(21, 'form1[0].Section21a[0].TextField11[8]', ''),
      organization: createFieldFromReference(21, 'form1[0].Section21a[0].TextField11[9]', ''),
      address: {
        street: createFieldFromReference(21, 'form1[0].Section21a[0].TextField11[10]', ''),
        city: createFieldFromReference(21, 'form1[0].Section21a[0].TextField11[11]', ''),
        state: createFieldFromReference(21, 'form1[0].Section21a[0].School6_State[0]', ''),
        zipCode: createFieldFromReference(21, 'form1[0].Section21a[0].TextField11[12]', ''),
        country: createFieldFromReference(21, 'form1[0].Section21a[0].#field[8]', 'United States')
      },
      phone: createFieldFromReference(21, 'form1[0].Section21a[0].TextField11[13]', '')
    },
    wasVoluntary: createFieldFromReference(21, 'form1[0].Section21a[0].#field[6]', true),
    currentlyReceivingTreatment: createFieldFromReference(21, 'form1[0].Section21a[0].#field[7]', false),
    medicationPrescribed: createFieldFromReference(21, 'form1[0].Section21a[0].#field[9]', false),
    medicationDetails: createFieldFromReference(21, 'form1[0].Section21a[0].TextField11[14]', ''),
    additionalComments: createFieldFromReference(21, 'form1[0].Section21a[0].TextField11[15]', '')
  };
};

/**
 * Creates a default court-ordered treatment entry
 */
export const createDefaultCourtOrderedEntry = (): CourtOrderedTreatmentEntry => {
  return {
    _id: createFieldFromReference(21, 'court_entry_id', Date.now()),
    courtName: createFieldFromReference(21, 'court_name', ''),
    courtAddress: {
      street: createFieldFromReference(21, 'court_street', ''),
      city: createFieldFromReference(21, 'court_city', ''),
      state: createFieldFromReference(21, 'court_state', ''),
      zipCode: createFieldFromReference(21, 'court_zip', ''),
      country: createFieldFromReference(21, 'court_country', 'United States')
    },
    orderDate: {
      date: createFieldFromReference(21, 'order_date', ''),
      estimated: createFieldFromReference(21, 'order_date_estimated', false)
    },
    treatmentType: createFieldFromReference(21, 'court_treatment_type', ''),
    reason: createFieldFromReference(21, 'court_reason', ''),
    treatmentProvider: {
      name: {
        first: createFieldFromReference(21, 'provider_first_name', ''),
        middle: createFieldFromReference(21, 'provider_middle_name', ''),
        last: createFieldFromReference(21, 'provider_last_name', ''),
        suffix: createFieldFromReference(21, 'provider_suffix', '')
      },
      organization: createFieldFromReference(21, 'provider_organization', ''),
      address: {
        street: createFieldFromReference(21, 'provider_street', ''),
        city: createFieldFromReference(21, 'provider_city', ''),
        state: createFieldFromReference(21, 'provider_state', ''),
        zipCode: createFieldFromReference(21, 'provider_zip', ''),
        country: createFieldFromReference(21, 'provider_country', 'United States')
      }
    },
    treatmentDuration: {
      from: {
        date: createFieldFromReference(21, 'treatment_date_from', ''),
        estimated: createFieldFromReference(21, 'treatment_date_from_estimated', false)
      },
      to: {
        date: createFieldFromReference(21, 'treatment_date_to', ''),
        estimated: createFieldFromReference(21, 'treatment_date_to_estimated', false)
      },
      present: createFieldFromReference(21, 'treatment_present', false)
    },
    wasCompleted: createFieldFromReference(21, 'was_completed', true),
    currentStatus: createFieldFromReference(21, 'current_status', '')
  };
};

/**
 * Creates default Section 21 data structure using actual field names from sections-references
 * Following Section 1 gold standard pattern with proper PDF field names
 */
export const createDefaultSection21 = (): Section21 => {
  console.log('🔧 Creating Section 21 default data with actual PDF field names from sections-references');

  // Use actual PDF field names from section-21.json (following Section 1 pattern)
  const mentalHealthField = createFieldFromReference(21, 'form1[0].Section21a[0].RadioButtonList[0]', 'NO' as 'YES' | 'NO');
  const courtOrderedField = createFieldFromReference(21, 'form1[0].Section21b[0].RadioButtonList[0]', 'NO' as 'YES' | 'NO');
  const hospitalizationField = createFieldFromReference(21, 'form1[0].Section21c[0].RadioButtonList[0]', 'NO' as 'YES' | 'NO');
  const otherMentalHealthField = createFieldFromReference(21, 'form1[0].section21d1[0].RadioButtonList[0]', 'NO' as 'YES' | 'NO');

  console.log('🔧 Section 21 field creation results:', {
    mentalHealthField: mentalHealthField ? 'SUCCESS' : 'FAILED',
    courtOrderedField: courtOrderedField ? 'SUCCESS' : 'FAILED',
    hospitalizationField: hospitalizationField ? 'SUCCESS' : 'FAILED',
    otherMentalHealthField: otherMentalHealthField ? 'SUCCESS' : 'FAILED'
  });

  console.log('🔍 Section 21 field details:', {
    mentalHealthField: {
      id: mentalHealthField?.id,
      name: mentalHealthField?.name,
      value: mentalHealthField?.value
    },
    courtOrderedField: {
      id: courtOrderedField?.id,
      name: courtOrderedField?.name,
      value: courtOrderedField?.value
    }
  });

  return {
    _id: 21,
    section21: {
      mentalHealthConsultations: {
        hasConsultation: mentalHealthField,
        entries: [],
        entriesCount: 0
      },
      courtOrderedTreatment: {
        hasCourtOrdered: courtOrderedField,
        entries: [],
        entriesCount: 0
      },
      hospitalization: {
        hasConsultation: hospitalizationField,
        entries: [],
        entriesCount: 0
      },
      otherMentalHealth: {
        hasConsultation: otherMentalHealthField,
        entries: [],
        entriesCount: 0
      }
    }
  };
};

// ============================================================================
// VALIDATION FUNCTIONS
// ============================================================================

/**
 * Validates a mental health entry
 */
export const validateMentalHealthEntry = (
  entry: MentalHealthEntry, 
  context: Section21ValidationContext
): MentalHealthValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];
  const missingFields: string[] = [];

  // Required field validations
  if (context.rules.requiresReason && !entry.reason?.value?.trim()) {
    errors.push('Reason for consultation is required');
    missingFields.push('reason');
  }

  if (context.rules.requiresProfessionalInfo) {
    if (!entry.professionalInfo?.name?.last?.value?.trim()) {
      errors.push('Professional\'s last name is required');
      missingFields.push('professionalInfo.name.last');
    }
  }

  if (context.rules.requiresDateRange) {
    if (!entry.dateRange?.from?.date?.value) {
      errors.push('Start date is required');
      missingFields.push('dateRange.from.date');
    }
  }

  // Length validations
  if (entry.reason?.value && entry.reason.value.length > context.rules.maxReasonLength) {
    errors.push(`Reason exceeds maximum length of ${context.rules.maxReasonLength} characters`);
  }

  if (entry.treatmentDetails?.value && entry.treatmentDetails.value.length > context.rules.maxTreatmentLength) {
    errors.push(`Treatment details exceed maximum length of ${context.rules.maxTreatmentLength} characters`);
  }

  // Date validations
  if (entry.dateRange?.from?.date?.value) {
    const fromDate = new Date(entry.dateRange.from.date.value);
    if (!context.rules.allowsFutureDate && fromDate > context.currentDate) {
      warnings.push('Start date is in the future');
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    missingRequiredFields: missingFields
  };
};

/**
 * Validates entire Section 21
 */
export const validateSection21 = (
  section21: Section21,
  context: Section21ValidationContext
): MentalHealthValidationResult => {
  const allErrors: string[] = [];
  const allWarnings: string[] = [];
  const allMissingFields: string[] = [];

  // Validate each subsection
  Object.entries(section21.section21).forEach(([subsectionKey, subsection]) => {
    if ('hasConsultation' in subsection && subsection.hasConsultation?.value === 'YES') {
      subsection.entries.forEach((entry: any, index: number) => {
        const entryValidation = validateMentalHealthEntry(entry, context);
        
        entryValidation.errors.forEach(error => {
          allErrors.push(`${subsectionKey} Entry ${index + 1}: ${error}`);
        });
        
        entryValidation.warnings.forEach(warning => {
          allWarnings.push(`${subsectionKey} Entry ${index + 1}: ${warning}`);
        });
        
        entryValidation.missingRequiredFields.forEach(field => {
          allMissingFields.push(`${subsectionKey}[${index}].${field}`);
        });
      });
    }
  });

  return {
    isValid: allErrors.length === 0,
    errors: allErrors,
    warnings: allWarnings,
    missingRequiredFields: allMissingFields
  };
};

// ============================================================================
// UPDATE FUNCTIONS
// ============================================================================

/**
 * Updates a field in Section 21
 */
export const updateSection21Field = (
  section21: Section21,
  update: Section21FieldUpdate
): Section21 => {
  const newSection21 = { ...section21 };
  const subsection = newSection21.section21[update.subsectionKey];

  if (update.entryIndex !== undefined && subsection.entries[update.entryIndex]) {
    // Update entry field
    const entry = { ...subsection.entries[update.entryIndex] };
    
    // Handle nested field paths
    const pathParts = update.fieldPath.split('.');
    let current = entry as any;
    
    for (let i = 0; i < pathParts.length - 1; i++) {
      if (!current[pathParts[i]]) {
        current[pathParts[i]] = {};
      }
      current = current[pathParts[i]];
    }
    
    current[pathParts[pathParts.length - 1]] = update.newValue;
    subsection.entries[update.entryIndex] = entry;
  } else if (update.fieldPath === 'hasConsultation' || update.fieldPath === 'hasCourtOrdered') {
    // Update subsection flag
    if ('hasConsultation' in subsection) {
      subsection.hasConsultation = { ...subsection.hasConsultation, value: update.newValue };
    }
    if ('hasCourtOrdered' in subsection) {
      (subsection as any).hasCourtOrdered = { ...(subsection as any).hasCourtOrdered, value: update.newValue };
    }
  }

  return newSection21;
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Calculates the total number of mental health consultations across all subsections
 */
export const getTotalMentalHealthEntries = (section21: Section21): number => {
  return Object.values(section21.section21).reduce((total, subsection) => {
    return total + (subsection.entries?.length || 0);
  }, 0);
};

/**
 * Checks if any mental health issues are reported
 */
export const hasAnyMentalHealthIssues = (section21: Section21): boolean => {
  return Object.values(section21.section21).some(subsection => {
    if ('hasConsultation' in subsection) {
      return subsection.hasConsultation?.value === 'YES';
    }
    if ('hasCourtOrdered' in subsection) {
      return (subsection as any).hasCourtOrdered?.value === 'YES';
    }
    return false;
  });
}; 