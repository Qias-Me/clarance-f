/**
 * Section 22: Police Record
 *
 * TypeScript interface definitions for SF-86 Section 22 (Police Record) data structure.
 * Based on the established Field<T> interface patterns and PDF field ID mappings from section-22.json.
 *
 * This section covers criminal history, arrests, court proceedings, citations, convictions,
 * probation/parole, and domestic violence restraining orders in the last 7 years.
 */

import type { Field } from '../formDefinition2.0';
import type { USState, Country } from './base';
import { createFieldFromReference } from '../../utils/sections-references-loader';

// ============================================================================
// LOCAL TYPE DEFINITIONS
// ============================================================================

/**
 * Address structure used across multiple sections
 */
export interface Address {
  street: Field<string>;
  city: Field<string>;
  state: Field<USState>;
  zipCode: Field<string>;
  county: Field<string>;
  country: Field<Country>;
}

/**
 * Date information with estimation flag
 */
export interface DateInfo {
  date: Field<string>;
  estimated: Field<boolean>;
}

/**
 * Date range structure used across multiple sections
 */
export interface DateRange {
  from: DateInfo;
  to: DateInfo;
  present: Field<boolean>;
}

// ============================================================================
// SECTION 22 CORE INTERFACES
// ============================================================================

/**
 * Types of police record incidents
 */
export type PoliceRecordType =
  | 'summons_citation_ticket'
  | 'arrest'
  | 'charged_convicted_sentenced'
  | 'probation_parole'
  | 'trial_awaiting_trial'
  | 'domestic_violence_order'
  | 'other';

/**
 * Court types
 */
export type CourtType =
  | 'federal'
  | 'state'
  | 'local'
  | 'military'
  | 'non_us'
  | 'traffic'
  | 'criminal'
  | 'civil'
  | 'other';

/**
 * Case status options
 */
export type CaseStatus =
  | 'pending'
  | 'dismissed'
  | 'convicted'
  | 'acquitted'
  | 'plea_bargain'
  | 'deferred'
  | 'completed'
  | 'ongoing'
  | 'other';

/**
 * Police record entry for criminal incidents
 */
export interface PoliceRecordEntry {
  _id: Field<string | number>;
  recordType: Field<PoliceRecordType>;

  // Incident Details
  offenseDate: DateInfo;
  offenseDescription: Field<string>;
  specificCharges: Field<string>;

  // Location Information
  incidentLocation: Address;

  // Court Information
  courtName: Field<string>;
  courtType: Field<CourtType>;
  courtAddress: Address;

  // Case Details
  caseNumber: Field<string>;
  caseStatus: Field<CaseStatus>;

  // Law Enforcement
  arrestingAgency: Field<string>;
  arrestingOfficer: Field<string>;
  bookingNumber: Field<string>;

  // Legal Proceedings
  arraignmentDate: DateInfo;
  trialDate: DateInfo;
  sentenceDate: DateInfo;

  // Sentencing
  sentence: Field<string>;
  fineAmount: Field<string>;
  communityService: Field<string>;
  probationParole: Field<boolean>;
  probationParoleDetails: Field<string>;
  probationParoleDuration: DateRange;

  // Current Status
  currentlyOnTrial: Field<boolean>;
  awaitingTrial: Field<boolean>;
  currentlyOnProbation: Field<boolean>;
  currentlyOnParole: Field<boolean>;

  // Documentation
  courtDocumentsAvailable: Field<boolean>;
  additionalDetails: Field<string>;
}

/**
 * Domestic violence restraining order entry
 */
export interface DomesticViolenceOrderEntry {
  _id: Field<string | number>;

  // Order Details
  orderType: Field<string>;
  orderDate: DateInfo;
  expirationDate: DateInfo;
  isCurrentlyActive: Field<boolean>;

  // Court Information
  issuingCourt: Field<string>;
  courtAddress: Address;

  // Protected Parties
  protectedPersonName: Field<string>;
  protectedPersonRelationship: Field<string>;

  // Order Details
  orderRestrictions: Field<string>;
  violationHistory: Field<boolean>;
  violationDetails: Field<string>;

  // Current Status
  orderStatus: Field<'active' | 'expired' | 'dismissed' | 'modified' | 'other'>;
  additionalNotes: Field<string>;
}

/**
 * Section 22 subsection keys
 */
export type Section22SubsectionKey =
  | 'criminalHistory'
  | 'domesticViolenceOrders'
  | 'militaryCourtProceedings'
  | 'foreignCourtProceedings';

/**
 * Criminal history subsection structure
 */
export interface CriminalHistorySubsection {
  // Main questions
  hasSummonsOrCitation: Field<'YES' | 'NO'>;
  hasArrest: Field<'YES' | 'NO'>;
  hasChargedOrConvicted: Field<'YES' | 'NO'>;
  hasProbationOrParole: Field<'YES' | 'NO'>;
  hasCurrentTrial: Field<'YES' | 'NO'>;

  // Entries
  entries: PoliceRecordEntry[];
  entriesCount: number;
}

/**
 * Domestic violence orders subsection structure
 */
export interface DomesticViolenceSubsection {
  hasCurrentOrder: Field<'YES' | 'NO'>;
  entries: DomesticViolenceOrderEntry[];
  entriesCount: number;
}

/**
 * Military court proceedings subsection structure
 */
export interface MilitaryCourtSubsection {
  hasMilitaryCourtProceedings: Field<'YES' | 'NO'>;
  entries: PoliceRecordEntry[];
  entriesCount: number;
}

/**
 * Foreign court proceedings subsection structure
 */
export interface ForeignCourtSubsection {
  hasForeignCourtProceedings: Field<'YES' | 'NO'>;
  entries: PoliceRecordEntry[];
  entriesCount: number;
}

/**
 * Main Section 22 interface
 */
export interface Section22 {
  _id: number;
  section22: {
    criminalHistory: CriminalHistorySubsection;
    domesticViolenceOrders: DomesticViolenceSubsection;
    militaryCourtProceedings: MilitaryCourtSubsection;
    foreignCourtProceedings: ForeignCourtSubsection;
  };
}

// ============================================================================
// VALIDATION INTERFACES
// ============================================================================

/**
 * Police record validation context
 */
export interface Section22ValidationContext {
  currentDate: Date;
  rules: {
    timeframeYears: number; // Typically 7 years
    trafficFineThreshold: number; // $300 threshold for traffic citations
    requiresCourtInfo: boolean;
    requiresIncidentDetails: boolean;
    requiresLocationInfo: boolean;
    allowsEstimatedDates: boolean;
    maxDescriptionLength: number;
    requiresDocumentation: boolean;
  };
}

/**
 * Police record validation result
 */
export interface PoliceRecordValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  missingRequiredFields: string[];
  dateRangeIssues: string[];
  inconsistencies: string[];
}

// ============================================================================
// FIELD UPDATE INTERFACES
// ============================================================================

/**
 * Section 22 field update structure
 */
export interface Section22FieldUpdate {
  subsectionKey: Section22SubsectionKey;
  entryIndex?: number;
  fieldPath: string;
  newValue: any;
}

// ============================================================================
// FIELD ID MAPPINGS (From section-22.json)
// ============================================================================

/**
 * PDF field ID mappings for Section 22 (Police Record)
 * Based on the actual field IDs from section-22.json
 */
export const SECTION22_FIELD_IDS = {
  // Main Questions (22.1)
  HAS_SUMMONS_CITATION: "16617", // form1[0].Section22_1[0].RadioButtonList[0]
  HAS_ARREST_COURT: "16618", // form1[0].Section22_1[0].RadioButtonList[1]

  // Entry Details
  COURT_NAME: "14922", // form1[0].Section22_1[0].TextField11[0]
  OFFENSE_DATE: "14921", // form1[0].Section22_1[0].From_Datefield_Name_2[0]
  DATE_ESTIMATED: "14920", // form1[0].Section22_1[0].#field[4]
  OFFENSE_DESCRIPTION: "14919", // form1[0].Section22_1[0].From_Datefield_Name_2[1]

  // Location Fields
  INCIDENT_CITY: "14918", // form1[0].Section22_1[0].#area[0].TextField11[1]
  INCIDENT_STATE: "14917", // form1[0].Section22_1[0].#area[0].School6_State[0]
  INCIDENT_COUNTRY: "14916", // form1[0].Section22_1[0].#area[0].#field[8]

  // Additional subsections - IDs would continue based on pattern
  // Section22_2, Section22_3, etc. for different question types
} as const;

/**
 * Field name mappings for Section 22
 * Full field paths from section-22.json
 */
export const SECTION22_FIELD_NAMES = {
  // Main Questions
  HAS_SUMMONS_CITATION: "form1[0].Section22_1[0].RadioButtonList[0]",
  HAS_ARREST_COURT: "form1[0].Section22_1[0].RadioButtonList[1]",

  // Entry Details
  COURT_NAME: "form1[0].Section22_1[0].TextField11[0]",
  OFFENSE_DATE: "form1[0].Section22_1[0].From_Datefield_Name_2[0]",
  DATE_ESTIMATED: "form1[0].Section22_1[0].#field[4]",
  OFFENSE_DESCRIPTION: "form1[0].Section22_1[0].From_Datefield_Name_2[1]",

  // Location Fields
  INCIDENT_CITY: "form1[0].Section22_1[0].#area[0].TextField11[1]",
  INCIDENT_STATE: "form1[0].Section22_1[0].#area[0].School6_State[0]",
  INCIDENT_COUNTRY: "form1[0].Section22_1[0].#area[0].#field[8]"
} as const;

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Creates a default police record entry using sections-references
 */
export const createDefaultPoliceRecordEntry = (): PoliceRecordEntry => ({
  _id: createFieldFromReference(22, 'entry_id', Date.now()),
  recordType: createFieldFromReference(22, 'record_type', 'summons_citation_ticket'),

  // Incident Details
  offenseDate: {
    date: createFieldFromReference(22, SECTION22_FIELD_NAMES.OFFENSE_DATE, ''),
    estimated: createFieldFromReference(22, SECTION22_FIELD_NAMES.DATE_ESTIMATED, false)
  },
  offenseDescription: createFieldFromReference(22, SECTION22_FIELD_NAMES.OFFENSE_DESCRIPTION, ''),
  specificCharges: createFieldFromReference(22, 'specific_charges', ''),

  // Location Information
  incidentLocation: {
    street: createFieldFromReference(22, 'incident_street', ''),
    city: createFieldFromReference(22, SECTION22_FIELD_NAMES.INCIDENT_CITY, ''),
    state: createFieldFromReference(22, SECTION22_FIELD_NAMES.INCIDENT_STATE, ''),
    zipCode: createFieldFromReference(22, 'incident_zip', ''),
    county: createFieldFromReference(22, 'incident_county', ''),
    country: createFieldFromReference(22, SECTION22_FIELD_NAMES.INCIDENT_COUNTRY, '')
  },

  // Court Information
  courtName: createFieldFromReference(22, SECTION22_FIELD_NAMES.COURT_NAME, ''),
  courtType: createFieldFromReference(22, 'court_type', 'criminal'),
  courtAddress: {
    street: createFieldFromReference(22, 'court_street', ''),
    city: createFieldFromReference(22, 'court_city', ''),
    state: createFieldFromReference(22, 'court_state', ''),
    zipCode: createFieldFromReference(22, 'court_zip', ''),
    county: createFieldFromReference(22, 'court_county', ''),
    country: createFieldFromReference(22, 'court_country', '')
  },

  // Case Details
  caseNumber: createFieldFromReference(22, 'case_number', ''),
  caseStatus: createFieldFromReference(22, 'case_status', 'pending'),

  // Law Enforcement
  arrestingAgency: createFieldFromReference(22, 'arresting_agency', ''),
  arrestingOfficer: createFieldFromReference(22, 'arresting_officer', ''),
  bookingNumber: createFieldFromReference(22, 'booking_number', ''),

  // Legal Proceedings
  arraignmentDate: {
    date: createFieldFromReference(22, 'arraignment_date', ''),
    estimated: createFieldFromReference(22, 'arraignment_estimated', false)
  },
  trialDate: {
    date: createFieldFromReference(22, 'trial_date', ''),
    estimated: createFieldFromReference(22, 'trial_estimated', false)
  },
  sentenceDate: {
    date: createFieldFromReference(22, 'sentence_date', ''),
    estimated: createFieldFromReference(22, 'sentence_estimated', false)
  },

  // Sentencing
  sentence: createFieldFromReference(22, 'sentence', ''),
  fineAmount: createFieldFromReference(22, 'fine_amount', ''),
  communityService: createFieldFromReference(22, 'community_service', ''),
  probationParole: createFieldFromReference(22, 'has_probation_parole', false),
  probationParoleDetails: createFieldFromReference(22, 'probation_details', ''),
  probationParoleDuration: {
    from: {
      date: createFieldFromReference(22, 'probation_start', ''),
      estimated: createFieldFromReference(22, 'probation_start_estimated', false)
    },
    to: {
      date: createFieldFromReference(22, 'probation_end', ''),
      estimated: createFieldFromReference(22, 'probation_end_estimated', false)
    },
    present: createFieldFromReference(22, 'probation_present', false)
  },

  // Current Status
  currentlyOnTrial: createFieldFromReference(22, 'currently_on_trial', false),
  awaitingTrial: createFieldFromReference(22, 'awaiting_trial', false),
  currentlyOnProbation: createFieldFromReference(22, 'currently_on_probation', false),
  currentlyOnParole: createFieldFromReference(22, 'currently_on_parole', false),

  // Documentation
  courtDocumentsAvailable: createFieldFromReference(22, 'court_documents', false),
  additionalDetails: createFieldFromReference(22, 'additional_details', '')
});

/**
 * Creates a default domestic violence order entry
 */
export const createDefaultDomesticViolenceEntry = (): DomesticViolenceOrderEntry => ({
  _id: createFieldFromReference(22, 'dv_entry_id', Date.now()),

  // Order Details
  orderType: createFieldFromReference(22, 'order_type', ''),
  orderDate: {
    date: createFieldFromReference(22, 'order_date', ''),
    estimated: createFieldFromReference(22, 'order_date_estimated', false)
  },
  expirationDate: {
    date: createFieldFromReference(22, 'expiration_date', ''),
    estimated: createFieldFromReference(22, 'expiration_estimated', false)
  },
  isCurrentlyActive: createFieldFromReference(22, 'is_active', false),

  // Court Information
  issuingCourt: createFieldFromReference(22, 'issuing_court', ''),
  courtAddress: {
    street: createFieldFromReference(22, 'dv_court_street', ''),
    city: createFieldFromReference(22, 'dv_court_city', ''),
    state: createFieldFromReference(22, 'dv_court_state', ''),
    zipCode: createFieldFromReference(22, 'dv_court_zip', ''),
    county: createFieldFromReference(22, 'dv_court_county', ''),
    country: createFieldFromReference(22, 'dv_court_country', '')
  },

  // Protected Parties
  protectedPersonName: createFieldFromReference(22, 'protected_person', ''),
  protectedPersonRelationship: createFieldFromReference(22, 'protected_relationship', ''),

  // Order Details
  orderRestrictions: createFieldFromReference(22, 'order_restrictions', ''),
  violationHistory: createFieldFromReference(22, 'violation_history', false),
  violationDetails: createFieldFromReference(22, 'violation_details', ''),

  // Current Status
  orderStatus: createFieldFromReference(22, 'order_status', 'active'),
  additionalNotes: createFieldFromReference(22, 'dv_additional_notes', '')
});

/**
 * Creates a default Section 22 data structure using sections-references
 * FIXED: Using actual PDF field names from section-22.json instead of hardcoded names
 */
export const createDefaultSection22 = (): Section22 => ({
  _id: 22,
  section22: {
    criminalHistory: {
      // Using actual PDF field names from section-22.json
      hasSummonsOrCitation: createFieldFromReference(22, SECTION22_FIELD_NAMES.HAS_SUMMONS_CITATION, 'NO'),
      hasArrest: createFieldFromReference(22, SECTION22_FIELD_NAMES.HAS_ARREST_COURT, 'NO'),
      // Note: Only 2 RadioButtonList fields exist in section-22.json, so we'll use text fields for additional questions
      hasChargedOrConvicted: createFieldFromReference(22, 'form1[0].Section22_1[0].TextField11[8]', 'NO'), // "If NO, provide explanation" field
      hasProbationOrParole: createFieldFromReference(22, 'form1[0].Section22_1[0].#area[2].RadioButtonList[2]', 'NO'), // RadioButtonList[2]
      hasCurrentTrial: createFieldFromReference(22, 'form1[0].Section22_1[0].#area[5].RadioButtonList[3]', 'NO'), // RadioButtonList[3]
      entries: [],
      entriesCount: 0
    },
    domesticViolenceOrders: {
      // Using Section 22.2 field for domestic violence orders
      hasCurrentOrder: createFieldFromReference(22, 'form1[0].Section22_2[0].RadioButtonList[0]', 'NO'),
      entries: [],
      entriesCount: 0
    },
    militaryCourtProceedings: {
      // Using available checkbox fields for military court proceedings
      hasMilitaryCourtProceedings: createFieldFromReference(22, 'form1[0].Section22_1[0].#field[23]', 'NO'),
      entries: [],
      entriesCount: 0
    },
    foreignCourtProceedings: {
      // Using available checkbox fields for foreign court proceedings
      hasForeignCourtProceedings: createFieldFromReference(22, 'form1[0].Section22_1[0].#field[24]', 'NO'),
      entries: [],
      entriesCount: 0
    }
  }
});

/**
 * Updates a specific field in the Section 22 data structure
 */
export const updateSection22Field = (
  section22Data: Section22,
  update: Section22FieldUpdate
): Section22 => {
  const { subsectionKey, entryIndex, fieldPath, newValue } = update;
  const newData = { ...section22Data };

  // Handle subsection field updates
  if (entryIndex !== undefined && entryIndex >= 0) {
    // Update specific entry field
    const entries = newData.section22[subsectionKey].entries as any[];
    if (entries[entryIndex]) {
      // Use lodash set or similar to update nested field path
      const fieldParts = fieldPath.split('.');
      let target = entries[entryIndex];
      for (let i = 0; i < fieldParts.length - 1; i++) {
        target = target[fieldParts[i]];
      }
      target[fieldParts[fieldParts.length - 1]] = newValue;
    }
  } else {
    // Update subsection-level field (Field<T> structure)
    const subsection = newData.section22[subsectionKey] as any;
    if (subsection[fieldPath] && typeof subsection[fieldPath] === 'object' && 'value' in subsection[fieldPath]) {
      // Update Field<T>.value property
      subsection[fieldPath].value = newValue;
    } else {
      // Fallback for non-Field structures
      subsection[fieldPath] = newValue;
    }
  }

  return newData;
};

/**
 * Validates a police record entry
 */
export function validatePoliceRecordEntry(
  entry: PoliceRecordEntry,
  context: Section22ValidationContext
): PoliceRecordValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const missingRequiredFields: string[] = [];
  const dateRangeIssues: string[] = [];
  const inconsistencies: string[] = [];

  // Required field validation
  if (!entry.offenseDescription.value?.trim()) {
    missingRequiredFields.push('Offense description is required');
  }

  if (!entry.offenseDate.date.value?.trim()) {
    missingRequiredFields.push('Offense date is required');
  }

  if (context.rules.requiresCourtInfo && !entry.courtName.value?.trim()) {
    missingRequiredFields.push('Court name is required');
  }

  if (context.rules.requiresLocationInfo && !entry.incidentLocation.city.value?.trim()) {
    missingRequiredFields.push('Incident location is required');
  }

  // Date validation
  if (entry.offenseDate.date.value) {
    const offenseDate = new Date(entry.offenseDate.date.value);
    const cutoffDate = new Date(context.currentDate);
    cutoffDate.setFullYear(cutoffDate.getFullYear() - context.rules.timeframeYears);

    if (offenseDate < cutoffDate) {
      warnings.push(`Offense date is older than ${context.rules.timeframeYears} years`);
    }

    if (offenseDate > context.currentDate) {
      dateRangeIssues.push('Offense date cannot be in the future');
    }
  }

  // Traffic citation validation
  if (entry.recordType.value === 'summons_citation_ticket' && entry.fineAmount.value) {
    const fineAmount = parseFloat(entry.fineAmount.value);
    if (fineAmount < context.rules.trafficFineThreshold) {
      warnings.push(`Traffic citations under $${context.rules.trafficFineThreshold} may not need to be reported`);
    }
  }

  // Consistency checks
  if (entry.currentlyOnProbation.value && !entry.probationParole.value) {
    inconsistencies.push('Currently on probation but probation/parole not indicated');
  }

  return {
    isValid: errors.length === 0 && missingRequiredFields.length === 0 && dateRangeIssues.length === 0,
    errors,
    warnings,
    missingRequiredFields,
    dateRangeIssues,
    inconsistencies
  };
}

/**
 * Validates a domestic violence order entry
 */
export function validateDomesticViolenceOrderEntry(
  entry: DomesticViolenceOrderEntry,
  context: Section22ValidationContext
): PoliceRecordValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const missingRequiredFields: string[] = [];
  const dateRangeIssues: string[] = [];
  const inconsistencies: string[] = [];

  if (!entry.issuingCourt.value?.trim()) {
    missingRequiredFields.push('Issuing court is required');
  }

  if (!entry.orderType.value?.trim()) {
    missingRequiredFields.push('Order type is required');
  }

  // Add other domestic violence specific validations here if needed
  // For example, date validations for orderDate and expirationDate:
  if (entry.orderDate.date.value) {
    const orderDate = new Date(entry.orderDate.date.value);
    if (orderDate > context.currentDate && !entry.orderDate.estimated.value) {
      dateRangeIssues.push('Order date cannot be in the future unless estimated');
    }
  }

  if (entry.expirationDate.date.value && entry.orderDate.date.value) {
    const orderDate = new Date(entry.orderDate.date.value);
    const expirationDate = new Date(entry.expirationDate.date.value);
    if (expirationDate < orderDate && !entry.expirationDate.estimated.value) {
      dateRangeIssues.push('Expiration date cannot be before the order date unless estimated');
    }
  }

  return {
    isValid: errors.length === 0 && missingRequiredFields.length === 0 && dateRangeIssues.length === 0,
    errors,
    warnings,
    missingRequiredFields,
    dateRangeIssues,
    inconsistencies
  };
}

/**
 * Validates the entire Section 22
 */
export function validateSection22(
  section22: Section22,
  context: Section22ValidationContext
): PoliceRecordValidationResult {
  const allErrors: string[] = [];
  const allWarnings: string[] = [];
  const allMissingFields: string[] = [];
  const allDateIssues: string[] = [];
  const allInconsistencies: string[] = [];

  // Validate criminal history entries
  section22.section22.criminalHistory.entries.forEach((entry, index) => {
    const entryResult = validatePoliceRecordEntry(entry, context);
    allErrors.push(...entryResult.errors.map(e => `Criminal History Entry ${index + 1}: ${e}`));
    allWarnings.push(...entryResult.warnings.map(w => `Criminal History Entry ${index + 1}: ${w}`));
    allMissingFields.push(...entryResult.missingRequiredFields.map(f => `Criminal History Entry ${index + 1}: ${f}`));
    allDateIssues.push(...entryResult.dateRangeIssues.map(d => `Criminal History Entry ${index + 1}: ${d}`));
    allInconsistencies.push(...entryResult.inconsistencies.map(i => `Criminal History Entry ${index + 1}: ${i}`));
  });

  // Validate domestic violence entries
  section22.section22.domesticViolenceOrders.entries.forEach((entry, index) => {
    const entryResult = validateDomesticViolenceOrderEntry(entry, context);
    allErrors.push(...entryResult.errors.map(e => `Domestic Violence Entry ${index + 1}: ${e}`));
    allWarnings.push(...entryResult.warnings.map(w => `Domestic Violence Entry ${index + 1}: ${w}`));
    allMissingFields.push(...entryResult.missingRequiredFields.map(f => `Domestic Violence Entry ${index + 1}: ${f}`));
    allDateIssues.push(...entryResult.dateRangeIssues.map(d => `Domestic Violence Entry ${index + 1}: ${d}`));
    allInconsistencies.push(...entryResult.inconsistencies.map(i => `Domestic Violence Entry ${index + 1}: ${i}`));
  });

  // Section-level consistency checks
  if (section22.section22.criminalHistory.hasSummonsOrCitation.value === 'YES' &&
      section22.section22.criminalHistory.entries.length === 0) {
    allInconsistencies.push('Indicated having summons/citation but no entries provided');
  }

  if (section22.section22.domesticViolenceOrders.hasCurrentOrder.value === 'YES' &&
      section22.section22.domesticViolenceOrders.entries.length === 0) {
    allInconsistencies.push('Indicated having domestic violence order but no entries provided');
  }

  return {
    isValid: allErrors.length === 0 && allMissingFields.length === 0 && allDateIssues.length === 0,
    errors: allErrors,
    warnings: allWarnings,
    missingRequiredFields: allMissingFields,
    dateRangeIssues: allDateIssues,
    inconsistencies: allInconsistencies
  };
}

/**
 * Gets total number of police record entries across all subsections
 */
export const getTotalPoliceRecordEntries = (section22: Section22): number => {
  return section22.section22.criminalHistory.entries.length +
         section22.section22.domesticViolenceOrders.entries.length +
         section22.section22.militaryCourtProceedings.entries.length +
         section22.section22.foreignCourtProceedings.entries.length;
};

/**
 * Checks if any police record issues are present
 */
export const hasAnyPoliceRecordIssues = (section22: Section22): boolean => {
  return section22.section22.criminalHistory.hasSummonsOrCitation.value === 'YES' ||
         section22.section22.criminalHistory.hasArrest.value === 'YES' ||
         section22.section22.criminalHistory.hasChargedOrConvicted.value === 'YES' ||
         section22.section22.criminalHistory.hasProbationOrParole.value === 'YES' ||
         section22.section22.criminalHistory.hasCurrentTrial.value === 'YES' ||
         section22.section22.domesticViolenceOrders.hasCurrentOrder.value === 'YES' ||
         section22.section22.militaryCourtProceedings.hasMilitaryCourtProceedings.value === 'YES' ||
         section22.section22.foreignCourtProceedings.hasForeignCourtProceedings.value === 'YES';
};

/**
 * Checks if entry involves serious criminal activity requiring additional documentation
 */
export const requiresAdditionalDocumentation = (entry: PoliceRecordEntry): boolean => {
  const seriousOffenses = ['felony', 'murder', 'assault', 'robbery', 'burglary', 'fraud', 'embezzlement'];
  const description = entry.offenseDescription.value?.toLowerCase() || '';

  return seriousOffenses.some(offense => description.includes(offense)) ||
         entry.sentence.value?.toLowerCase().includes('prison') ||
         entry.sentence.value?.toLowerCase().includes('jail') ||
         entry.currentlyOnProbation.value ||
         entry.currentlyOnParole.value;
};

/**
 * Gets the most recent offense date across all entries
 */
export const getMostRecentOffenseDate = (section22: Section22): Date | null => {
  let mostRecent: Date | null = null;

  const allEntries = [
    ...section22.section22.criminalHistory.entries,
    ...section22.section22.militaryCourtProceedings.entries,
    ...section22.section22.foreignCourtProceedings.entries
  ];

  allEntries.forEach(entry => {
    if (entry.offenseDate.date.value) {
      const date = new Date(entry.offenseDate.date.value);
      if (!mostRecent || date > mostRecent) {
        mostRecent = date;
      }
    }
  });

  return mostRecent;
};