/**
 * Section 23: Illegal Use of Drugs or Drug Activity
 *
 * TypeScript interface definitions for SF-86 Section 23 (Illegal Use of Drugs or Drug Activity) data structure.
 * Based on the established Field<T> interface patterns and PDF field ID mappings from section-23.json.
 * 
 * This section covers illegal drug use, drug activity, drug-related arrests, convictions, and other
 * drug-related incidents within specific timeframes as required by security clearance investigations.
 * Includes both federal illegal drugs and substances that may be legal under state law but illegal federally.
 */

import type { Field } from '../formDefinition2.0';
import type { USState, Country } from './base';

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
// SECTION 23 CORE INTERFACES
// ============================================================================

/**
 * Types of illegal drug substances
 */
export type DrugType = 
  | 'marijuana_cannabis'
  | 'cocaine'
  | 'crack_cocaine'
  | 'heroin'
  | 'opium'
  | 'morphine'
  | 'codeine'
  | 'other_opiates'
  | 'methadone'
  | 'oxycodone'
  | 'percocet'
  | 'vicodin'
  | 'other_prescription_drugs'
  | 'amphetamines'
  | 'methamphetamine'
  | 'mdma_ecstasy'
  | 'lsd'
  | 'pcp'
  | 'hallucinogens'
  | 'psilocybin_mushrooms'
  | 'barbiturates'
  | 'quaaludes'
  | 'ghb'
  | 'rohypnol'
  | 'ketamine'
  | 'steroids'
  | 'inhalants'
  | 'synthetic_drugs'
  | 'other'
  | '';

/**
 * Drug use context/circumstances
 */
export type DrugUseContext = 
  | 'recreational'
  | 'experimental'
  | 'peer_pressure'
  | 'medical_self_medication'
  | 'addiction'
  | 'prescription_misuse'
  | 'other';

/**
 * Frequency of drug use
 */
export type DrugUseFrequency = 
  | 'once'
  | 'few_times'
  | 'occasional'
  | 'regular'
  | 'frequent'
  | 'daily'
  | 'other';

/**
 * Sources of drugs
 */
export type DrugSource = 
  | 'friends'
  | 'acquaintances'
  | 'dealers'
  | 'prescription'
  | 'internet'
  | 'other_means'
  | 'unknown';

/**
 * Drug involvement activities
 */
export type DrugActivity = 
  | 'purchase'
  | 'sale'
  | 'distribution'
  | 'manufacturing'
  | 'trafficking'
  | 'possession'
  | 'cultivation'
  | 'transportation'
  | 'other';

/**
 * Drug use entry for illegal substance use
 */
export interface DrugUseEntry {
  _id: Field<string | number>;
  
  // Drug Information
  drugType: Field<DrugType>;
  drugName: Field<string>;
  otherDrugDescription: Field<string>;
  
  // Use Details
  firstUse: DateInfo;
  mostRecentUse: DateInfo;
  useFrequency: Field<DrugUseFrequency>;
  numberOfTimes: Field<string>;
  natureOfUse: Field<string>;
  
  // Context and Circumstances
  useContext: Field<DrugUseContext>;
  circumstances: Field<string>;
  reasonForUse: Field<string>;
  
  // Location Information
  primaryUseLocation: Address;
  otherUseLocations: Field<string>;
  
  // Social Context
  usedAlone: Field<boolean>;
  usedWithOthers: Field<boolean>;
  otherUsersKnown: Field<boolean>;
  socialCircleInvolvement: Field<string>;
  
  // Acquisition Details
  drugSource: Field<DrugSource>;
  sourceDetails: Field<string>;
  costInformation: Field<string>;
  
  // Current Status
  currentlyUsing: Field<boolean>;
  intentToContinue: Field<boolean>;
  treatmentSought: Field<boolean>;
  treatmentDetails: Field<string>;
  
  // Impact Assessment
  workImpact: Field<boolean>;
  workImpactDetails: Field<string>;
  healthImpact: Field<boolean>;
  healthImpactDetails: Field<string>;
  legalIssues: Field<boolean>;
  legalIssuesDetails: Field<string>;
  
  // Additional Information
  additionalDetails: Field<string>;
  witnessesKnown: Field<boolean>;
  witnessInformation: Field<string>;
}

/**
 * Drug activity entry for drug-related activities beyond personal use
 */
export interface DrugActivityEntry {
  _id: Field<string | number>;
  
  // Activity Information
  activityType: Field<DrugActivity>;
  activityDescription: Field<string>;
  drugTypesInvolved: Field<DrugType[]>;
  
  // Timeline
  activityDates: DateRange;
  frequencyOfActivity: Field<string>;
  
  // Location and Context
  activityLocation: Address;
  organizationInvolvement: Field<boolean>;
  organizationDetails: Field<string>;
  
  // Financial Aspects
  moneyInvolved: Field<boolean>;
  financialDetails: Field<string>;
  profitMade: Field<boolean>;
  profitAmount: Field<string>;
  
  // Legal Consequences
  arrestsRelated: Field<boolean>;
  arrestDetails: Field<string>;
  convictionsRelated: Field<boolean>;
  convictionDetails: Field<string>;
  
  // Other Participants
  othersInvolved: Field<boolean>;
  participantDetails: Field<string>;
  leadershipRole: Field<boolean>;
  roleDescription: Field<string>;
  
  // Current Status
  activityStopped: Field<boolean>;
  reasonForStopping: Field<string>;
  likelihoodOfRecurrence: Field<string>;
  
  // Additional Information
  additionalDetails: Field<string>;
  cooperationWithAuthorities: Field<boolean>;
  cooperationDetails: Field<string>;
}

/**
 * Drug-related treatment entry
 */
export interface DrugTreatmentEntry {
  _id: Field<string | number>;
  
  // Treatment Information
  treatmentType: Field<'inpatient' | 'outpatient' | 'counseling' | 'support_group' | 'detox' | 'rehabilitation' | 'other'>;
  treatmentDescription: Field<string>;
  
  // Timeline
  treatmentDates: DateRange;
  treatmentDuration: Field<string>;
  
  // Provider Information
  providerName: Field<string>;
  providerAddress: Address;
  providerType: Field<string>;
  
  // Treatment Details
  voluntaryTreatment: Field<boolean>;
  courtOrdered: Field<boolean>;
  employmentRequired: Field<boolean>;
  reasonForTreatment: Field<string>;
  
  // Outcomes
  treatmentCompleted: Field<boolean>;
  treatmentSuccessful: Field<boolean>;
  currentlyInTreatment: Field<boolean>;
  ongoingSupport: Field<boolean>;
  
  // Relapse Information
  relapsedAfterTreatment: Field<boolean>;
  relapseDetails: Field<string>;
  additionalTreatmentSought: Field<boolean>;
  
  // Additional Information
  additionalDetails: Field<string>;
  contactInformation: Field<string>;
}

/**
 * Section 23 subsection keys
 */
export type Section23SubsectionKey = 
  | 'drugUse'
  | 'drugActivity'
  | 'drugTreatment'
  | 'foreignDrugUse';

/**
 * Drug use subsection structure
 */
export interface DrugUseSubsection {
  // Main questions (7-year timeframe)
  hasUsedIllegalDrugs: Field<'YES' | 'NO'>;
  hasUsedPrescriptionDrugsIllegally: Field<'YES' | 'NO'>;
  hasUsedMarijuana: Field<'YES' | 'NO'>;
  
  // Specific timeframe questions
  drugUseInLast7Years: Field<'YES' | 'NO'>;
  drugUseWhileEmployed: Field<'YES' | 'NO'>;
  drugUseWithClearance: Field<'YES' | 'NO'>;
  
  // Intent and future use
  intentToContinueUse: Field<'YES' | 'NO'>;
  intentExplanation: Field<string>;
  
  // Entries
  entries: DrugUseEntry[];
  entriesCount: number;
}

/**
 * Drug activity subsection structure
 */
export interface DrugActivitySubsection {
  // Main questions
  hasEngagedInDrugActivity: Field<'YES' | 'NO'>;
  hasSoldDrugs: Field<'YES' | 'NO'>;
  hasDistributedDrugs: Field<'YES' | 'NO'>;
  hasManufacturedDrugs: Field<'YES' | 'NO'>;
  hasTransportedDrugs: Field<'YES' | 'NO'>;
  
  // Entries
  entries: DrugActivityEntry[];
  entriesCount: number;
}

/**
 * Drug treatment subsection structure
 */
export interface DrugTreatmentSubsection {
  // Main questions
  hasReceivedDrugTreatment: Field<'YES' | 'NO'>;
  hasVoluntaryTreatment: Field<'YES' | 'NO'>;
  hasCourtOrderedTreatment: Field<'YES' | 'NO'>;
  currentlyInTreatment: Field<'YES' | 'NO'>;
  
  // Entries
  entries: DrugTreatmentEntry[];
  entriesCount: number;
}

/**
 * Foreign drug use subsection structure
 */
export interface ForeignDrugUseSubsection {
  // Main questions
  hasUsedDrugsAbroad: Field<'YES' | 'NO'>;
  hasUsedLegalDrugsAbroad: Field<'YES' | 'NO'>;
  awareOfLocalLaws: Field<'YES' | 'NO'>;
  
  // Entries (reuses DrugUseEntry structure)
  entries: DrugUseEntry[];
  entriesCount: number;
}

/**
 * Main Section 23 interface
 */
export interface Section23 {
  _id: number;
  section23: {
    drugUse: DrugUseSubsection;
    drugActivity: DrugActivitySubsection;
    drugTreatment: DrugTreatmentSubsection;
    foreignDrugUse: ForeignDrugUseSubsection;
  };
}

// ============================================================================
// VALIDATION INTERFACES
// ============================================================================

/**
 * Section 23 validation context
 */
export interface Section23ValidationContext {
  currentDate: Date;
  rules: {
    timeframeYears: number; // Typically 7 years for most drug-related questions
    requiresFrequencyDetails: boolean;
    requiresUseContext: boolean;
    requiresLocationInfo: boolean;
    allowsEstimatedDates: boolean;
    maxDescriptionLength: number;
    requiresTreatmentInfo: boolean;
    requiresCurrentStatusInfo: boolean;
    foreignUseTimeframeYears: number; // May differ for foreign use
  };
}

/**
 * Drug use validation result
 */
export interface DrugUseValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  missingRequiredFields: string[];
  dateRangeIssues: string[];
  inconsistencies: string[];
}

/**
 * Section 23 field update interface
 */
export interface Section23FieldUpdate {
  subsectionKey: Section23SubsectionKey;
  entryIndex?: number;
  fieldPath: string;
  newValue: any;
}

// ============================================================================
// UTILITY FUNCTIONS AND FACTORIES
// ============================================================================

/**
 * Helper function to create a Field object
 */
const createField = <T>(id: string, value: T, name?: string, type = "PDFTextField", label = ""): Field<T> => ({
  id,
  name: name || id,
  type,
  label,
  value,
  rect: { x: 0, y: 0, width: 0, height: 0 }
});

/**
 * Create a default drug use entry
 */
export const createDefaultDrugUseEntry = (): DrugUseEntry => ({
  _id: createField('section_23_entry_id', Math.random()),
  
  // Drug Information
  drugType: createField('section_23_drug_type', 'marijuana_cannabis' as DrugType),
  drugName: createField('section_23_drug_name', ''),
  otherDrugDescription: createField('section_23_other_drug_description', ''),
  
  // Use Details
  firstUse: {
    date: createField('section_23_first_use_date', ''),
    estimated: createField('section_23_first_use_estimated', false, undefined, 'PDFCheckBox')
  },
  mostRecentUse: {
    date: createField('section_23_most_recent_use_date', ''),
    estimated: createField('section_23_most_recent_use_estimated', false, undefined, 'PDFCheckBox')
  },
  useFrequency: createField('section_23_use_frequency', 'few_times' as DrugUseFrequency),
  numberOfTimes: createField('section_23_number_of_times', ''),
  natureOfUse: createField('section_23_nature_of_use', ''),
  
  // Context and Circumstances
  useContext: createField('section_23_use_context', 'recreational' as DrugUseContext),
  circumstances: createField('section_23_circumstances', ''),
  reasonForUse: createField('section_23_reason_for_use', ''),
  
  // Location Information
  primaryUseLocation: {
    street: createField('section_23_use_location_street', ''),
    city: createField('section_23_use_location_city', ''),
    state: createField('section_23_use_location_state', '' as USState),
    zipCode: createField('section_23_use_location_zip', ''),
    county: createField('section_23_use_location_county', ''),
    country: createField('section_23_use_location_country', '' as Country)
  },
  otherUseLocations: createField('section_23_other_use_locations', ''),
  
  // Social Context
  usedAlone: createField('section_23_used_alone', false, undefined, 'PDFCheckBox'),
  usedWithOthers: createField('section_23_used_with_others', false, undefined, 'PDFCheckBox'),
  otherUsersKnown: createField('section_23_other_users_known', false, undefined, 'PDFCheckBox'),
  socialCircleInvolvement: createField('section_23_social_circle_involvement', ''),
  
  // Acquisition Details
  drugSource: createField('section_23_drug_source', 'friends' as DrugSource),
  sourceDetails: createField('section_23_source_details', ''),
  costInformation: createField('section_23_cost_information', ''),
  
  // Current Status
  currentlyUsing: createField('section_23_currently_using', false, undefined, 'PDFCheckBox'),
  intentToContinue: createField('section_23_intent_to_continue', false, undefined, 'PDFCheckBox'),
  treatmentSought: createField('section_23_treatment_sought', false, undefined, 'PDFCheckBox'),
  treatmentDetails: createField('section_23_treatment_details', ''),
  
  // Impact Assessment
  workImpact: createField('section_23_work_impact', false, undefined, 'PDFCheckBox'),
  workImpactDetails: createField('section_23_work_impact_details', ''),
  healthImpact: createField('section_23_health_impact', false, undefined, 'PDFCheckBox'),
  healthImpactDetails: createField('section_23_health_impact_details', ''),
  legalIssues: createField('section_23_legal_issues', false, undefined, 'PDFCheckBox'),
  legalIssuesDetails: createField('section_23_legal_issues_details', ''),
  
  // Additional Information
  additionalDetails: createField('section_23_additional_details', ''),
  witnessesKnown: createField('section_23_witnesses_known', false, undefined, 'PDFCheckBox'),
  witnessInformation: createField('section_23_witness_information', '')
});

/**
 * Create a default drug activity entry
 */
export const createDefaultDrugActivityEntry = (): DrugActivityEntry => ({
  _id: createField('section_23_activity_id', Math.random()),
  
  // Activity Information
  activityType: createField('section_23_activity_type', 'possession' as DrugActivity),
  activityDescription: createField('section_23_activity_description', ''),
  drugTypesInvolved: createField('section_23_drugs_involved', [] as DrugType[]),
  
  // Timeline
  activityDates: {
    from: {
      date: createField('section_23_activity_from_date', ''),
      estimated: createField('section_23_activity_from_estimated', false, undefined, 'PDFCheckBox')
    },
    to: {
      date: createField('section_23_activity_to_date', ''),
      estimated: createField('section_23_activity_to_estimated', false, undefined, 'PDFCheckBox')
    },
    present: createField('section_23_activity_present', false, undefined, 'PDFCheckBox')
  },
  frequencyOfActivity: createField('section_23_activity_frequency', ''),
  
  // Location and Context
  activityLocation: {
    street: createField('section_23_activity_location_street', ''),
    city: createField('section_23_activity_location_city', ''),
    state: createField('section_23_activity_location_state', '' as USState),
    zipCode: createField('section_23_activity_location_zip', ''),
    county: createField('section_23_activity_location_county', ''),
    country: createField('section_23_activity_location_country', '' as Country)
  },
  organizationInvolvement: createField('section_23_organization_involvement', false, undefined, 'PDFCheckBox'),
  organizationDetails: createField('section_23_organization_details', ''),
  
  // Financial Aspects
  moneyInvolved: createField('section_23_money_involved', false, undefined, 'PDFCheckBox'),
  financialDetails: createField('section_23_financial_details', ''),
  profitMade: createField('section_23_profit_made', false, undefined, 'PDFCheckBox'),
  profitAmount: createField('section_23_profit_amount', ''),
  
  // Legal Consequences
  arrestsRelated: createField('section_23_arrests_related', false, undefined, 'PDFCheckBox'),
  arrestDetails: createField('section_23_arrest_details', ''),
  convictionsRelated: createField('section_23_convictions_related', false, undefined, 'PDFCheckBox'),
  convictionDetails: createField('section_23_conviction_details', ''),
  
  // Other Participants
  othersInvolved: createField('section_23_others_involved', false, undefined, 'PDFCheckBox'),
  participantDetails: createField('section_23_participant_details', ''),
  leadershipRole: createField('section_23_leadership_role', false, undefined, 'PDFCheckBox'),
  roleDescription: createField('section_23_role_description', ''),
  
  // Current Status
  activityStopped: createField('section_23_activity_stopped', true, undefined, 'PDFCheckBox'),
  reasonForStopping: createField('section_23_reason_for_stopping', ''),
  likelihoodOfRecurrence: createField('section_23_likelihood_recurrence', ''),
  
  // Additional Information
  additionalDetails: createField('section_23_activity_additional_details', ''),
  cooperationWithAuthorities: createField('section_23_cooperation_authorities', false, undefined, 'PDFCheckBox'),
  cooperationDetails: createField('section_23_cooperation_details', '')
});

/**
 * Create a default drug treatment entry
 */
export const createDefaultDrugTreatmentEntry = (): DrugTreatmentEntry => ({
  _id: createField('section_23_treatment_id', Math.random()),
  
  // Treatment Information
  treatmentType: createField('section_23_treatment_type', 'counseling' as 'inpatient' | 'outpatient' | 'counseling' | 'support_group' | 'detox' | 'rehabilitation' | 'other'),
  treatmentDescription: createField('section_23_treatment_description', ''),
  
  // Timeline
  treatmentDates: {
    from: {
      date: createField('section_23_treatment_from_date', ''),
      estimated: createField('section_23_treatment_from_estimated', false, undefined, 'PDFCheckBox')
    },
    to: {
      date: createField('section_23_treatment_to_date', ''),
      estimated: createField('section_23_treatment_to_estimated', false, undefined, 'PDFCheckBox')
    },
    present: createField('section_23_treatment_present', false, undefined, 'PDFCheckBox')
  },
  treatmentDuration: createField('section_23_treatment_duration', ''),
  
  // Provider Information
  providerName: createField('section_23_provider_name', ''),
  providerAddress: {
    street: createField('section_23_provider_street', ''),
    city: createField('section_23_provider_city', ''),
    state: createField('section_23_provider_state', '' as USState),
    zipCode: createField('section_23_provider_zip', ''),
    county: createField('section_23_provider_county', ''),
    country: createField('section_23_provider_country', '' as Country)
  },
  providerType: createField('section_23_provider_type', ''),
  
  // Treatment Details
  voluntaryTreatment: createField('section_23_voluntary_treatment', true, undefined, 'PDFCheckBox'),
  courtOrdered: createField('section_23_court_ordered', false, undefined, 'PDFCheckBox'),
  employmentRequired: createField('section_23_employment_required', false, undefined, 'PDFCheckBox'),
  reasonForTreatment: createField('section_23_reason_for_treatment', ''),
  
  // Outcomes
  treatmentCompleted: createField('section_23_treatment_completed', false, undefined, 'PDFCheckBox'),
  treatmentSuccessful: createField('section_23_treatment_successful', false, undefined, 'PDFCheckBox'),
  currentlyInTreatment: createField('section_23_currently_in_treatment', false, undefined, 'PDFCheckBox'),
  ongoingSupport: createField('section_23_ongoing_support', false, undefined, 'PDFCheckBox'),
  
  // Relapse Information
  relapsedAfterTreatment: createField('section_23_relapsed', false, undefined, 'PDFCheckBox'),
  relapseDetails: createField('section_23_relapse_details', ''),
  additionalTreatmentSought: createField('section_23_additional_treatment', false, undefined, 'PDFCheckBox'),
  
  // Additional Information
  additionalDetails: createField('section_23_treatment_additional_details', ''),
  contactInformation: createField('section_23_treatment_contact_info', '')
});

/**
 * Create a default Section 23 structure
 */
export const createDefaultSection23 = (): Section23 => ({
  _id: 23,
  section23: {
    drugUse: {
      // Main questions (7-year timeframe)
      hasUsedIllegalDrugs: createField('section_23_has_used_illegal_drugs', 'NO' as 'YES' | 'NO', undefined, 'PDFRadioGroup'),
      hasUsedPrescriptionDrugsIllegally: createField('section_23_has_used_prescription_illegally', 'NO' as 'YES' | 'NO', undefined, 'PDFRadioGroup'),
      hasUsedMarijuana: createField('section_23_has_used_marijuana', 'NO' as 'YES' | 'NO', undefined, 'PDFRadioGroup'),
      
      // Specific timeframe questions
      drugUseInLast7Years: createField('section_23_drug_use_7_years', 'NO' as 'YES' | 'NO', undefined, 'PDFRadioGroup'),
      drugUseWhileEmployed: createField('section_23_drug_use_while_employed', 'NO' as 'YES' | 'NO', undefined, 'PDFRadioGroup'),
      drugUseWithClearance: createField('section_23_drug_use_with_clearance', 'NO' as 'YES' | 'NO', undefined, 'PDFRadioGroup'),
      
      // Intent and future use
      intentToContinueUse: createField('section_23_intent_to_continue', 'NO' as 'YES' | 'NO', undefined, 'PDFRadioGroup'),
      intentExplanation: createField('section_23_intent_explanation', ''),
      
      // Entries
      entries: [],
      entriesCount: 0
    },
    drugActivity: {
      // Main questions
      hasEngagedInDrugActivity: createField('section_23_has_drug_activity', 'NO' as 'YES' | 'NO', undefined, 'PDFRadioGroup'),
      hasSoldDrugs: createField('section_23_has_sold_drugs', 'NO' as 'YES' | 'NO', undefined, 'PDFRadioGroup'),
      hasDistributedDrugs: createField('section_23_has_distributed_drugs', 'NO' as 'YES' | 'NO', undefined, 'PDFRadioGroup'),
      hasManufacturedDrugs: createField('section_23_has_manufactured_drugs', 'NO' as 'YES' | 'NO', undefined, 'PDFRadioGroup'),
      hasTransportedDrugs: createField('section_23_has_transported_drugs', 'NO' as 'YES' | 'NO', undefined, 'PDFRadioGroup'),
      
      // Entries
      entries: [],
      entriesCount: 0
    },
    drugTreatment: {
      // Main questions
      hasReceivedDrugTreatment: createField('section_23_has_received_treatment', 'NO' as 'YES' | 'NO', undefined, 'PDFRadioGroup'),
      hasVoluntaryTreatment: createField('section_23_has_voluntary_treatment', 'NO' as 'YES' | 'NO', undefined, 'PDFRadioGroup'),
      hasCourtOrderedTreatment: createField('section_23_has_court_ordered_treatment', 'NO' as 'YES' | 'NO', undefined, 'PDFRadioGroup'),
      currentlyInTreatment: createField('section_23_currently_in_treatment', 'NO' as 'YES' | 'NO', undefined, 'PDFRadioGroup'),
      
      // Entries
      entries: [],
      entriesCount: 0
    },
    foreignDrugUse: {
      // Main questions
      hasUsedDrugsAbroad: createField('section_23_has_used_drugs_abroad', 'NO' as 'YES' | 'NO', undefined, 'PDFRadioGroup'),
      hasUsedLegalDrugsAbroad: createField('section_23_has_used_legal_drugs_abroad', 'NO' as 'YES' | 'NO', undefined, 'PDFRadioGroup'),
      awareOfLocalLaws: createField('section_23_aware_of_local_laws', 'YES' as 'YES' | 'NO', undefined, 'PDFRadioGroup'),
      
      // Entries (reuses DrugUseEntry structure)
      entries: [],
      entriesCount: 0
    }
  }
});

/**
 * Update Section 23 field helper function
 */
export const updateSection23Field = (
  section23Data: Section23,
  update: Section23FieldUpdate
): Section23 => {
  const updatedData = { ...section23Data };
  const { subsectionKey, entryIndex, fieldPath, newValue } = update;

  if (entryIndex !== undefined) {
    // Update specific entry field
    const entries = updatedData.section23[subsectionKey].entries;
    if (entries[entryIndex]) {
      // Use lodash set for deep path updates if needed
      const entry = { ...entries[entryIndex] };
      (entry as any)[fieldPath] = newValue;
      (updatedData.section23[subsectionKey].entries as any)[entryIndex] = entry;
    }
  } else {
    // Update subsection field
    (updatedData.section23[subsectionKey] as any)[fieldPath] = newValue;
  }

  return updatedData;
};

// ============================================================================
// VALIDATION FUNCTIONS
// ============================================================================

/**
 * Validate a drug use entry
 */
export function validateDrugUseEntry(
  entry: DrugUseEntry, 
  context: Section23ValidationContext
): DrugUseValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const missingRequiredFields: string[] = [];
  const dateRangeIssues: string[] = [];
  const inconsistencies: string[] = [];

  // Validate required fields
  if (!entry.drugType.value || entry.drugType.value === "") {
    missingRequiredFields.push('Drug type is required');
  }

  if (!entry.firstUse.date.value || entry.firstUse.date.value === '') {
    missingRequiredFields.push('First use date is required');
  }

  if (!entry.mostRecentUse.date.value || entry.mostRecentUse.date.value === '') {
    missingRequiredFields.push('Most recent use date is required');
  }

  if (!entry.natureOfUse.value || entry.natureOfUse.value === '') {
    missingRequiredFields.push('Nature of use description is required');
  }

  // Validate date consistency
  if (entry.firstUse.date.value && entry.mostRecentUse.date.value) {
    const firstUseDate = new Date(entry.firstUse.date.value);
    const mostRecentUseDate = new Date(entry.mostRecentUse.date.value);
    
    if (firstUseDate > mostRecentUseDate) {
      dateRangeIssues.push('First use date cannot be after most recent use date');
    }

    // Check if dates are within the required timeframe
    const cutoffDate = new Date();
    cutoffDate.setFullYear(cutoffDate.getFullYear() - context.rules.timeframeYears);
    
    if (mostRecentUseDate < cutoffDate) {
      warnings.push(`Most recent use is outside the ${context.rules.timeframeYears}-year reporting period`);
    }
  }

  // Validate logic consistency
  if (entry.currentlyUsing.value && entry.mostRecentUse.date.value) {
    const mostRecentDate = new Date(entry.mostRecentUse.date.value);
    const monthsAgo = (Date.now() - mostRecentDate.getTime()) / (1000 * 60 * 60 * 24 * 30);
    
    if (monthsAgo > 6) {
      inconsistencies.push('Currently using but most recent use was more than 6 months ago');
    }
  }

  if (entry.intentToContinue.value && !entry.currentlyUsing.value) {
    warnings.push('Intent to continue use but not currently using - consider clarification');
  }

  // Validate description lengths
  if (context.rules.maxDescriptionLength > 0) {
    if (entry.natureOfUse.value && entry.natureOfUse.value.length > context.rules.maxDescriptionLength) {
      warnings.push(`Nature of use description exceeds ${context.rules.maxDescriptionLength} characters`);
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
 * Validate Section 23 data
 */
export function validateSection23(
  section23: Section23,
  context: Section23ValidationContext
): DrugUseValidationResult {
  const allErrors: string[] = [];
  const allWarnings: string[] = [];
  const allMissingFields: string[] = [];
  const allDateIssues: string[] = [];
  const allInconsistencies: string[] = [];

  // Validate each drug use entry
  section23.section23.drugUse.entries.forEach((entry, index) => {
    const entryResult = validateDrugUseEntry(entry, context);
    
    if (!entryResult.isValid) {
      allErrors.push(`Drug use entry ${index + 1}: ${entryResult.errors.join(', ')}`);
    }
    
    allWarnings.push(...entryResult.warnings.map(w => `Drug use entry ${index + 1}: ${w}`));
    allMissingFields.push(...entryResult.missingRequiredFields.map(f => `Drug use entry ${index + 1}: ${f}`));
    allDateIssues.push(...entryResult.dateRangeIssues.map(d => `Drug use entry ${index + 1}: ${d}`));
    allInconsistencies.push(...entryResult.inconsistencies.map(i => `Drug use entry ${index + 1}: ${i}`));
  });

  // Validate consistency between main questions and entries
  if (section23.section23.drugUse.hasUsedIllegalDrugs.value === 'YES' && section23.section23.drugUse.entries.length === 0) {
    allInconsistencies.push('Indicated illegal drug use but no entries provided');
  }

  if (section23.section23.drugUse.hasUsedIllegalDrugs.value === 'NO' && section23.section23.drugUse.entries.length > 0) {
    allInconsistencies.push('Indicated no illegal drug use but entries are present');
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

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Get total drug use entries across all subsections
 */
export const getTotalDrugEntries = (section23: Section23): number => {
  return section23.section23.drugUse.entries.length +
         section23.section23.drugActivity.entries.length +
         section23.section23.drugTreatment.entries.length +
         section23.section23.foreignDrugUse.entries.length;
};

/**
 * Check if any drug-related issues are reported
 */
export const hasAnyDrugIssues = (section23: Section23): boolean => {
  const drugUse = section23.section23.drugUse;
  const drugActivity = section23.section23.drugActivity;
  const drugTreatment = section23.section23.drugTreatment;
  const foreignDrugUse = section23.section23.foreignDrugUse;

  return drugUse.hasUsedIllegalDrugs.value === 'YES' ||
         drugUse.hasUsedPrescriptionDrugsIllegally.value === 'YES' ||
         drugUse.hasUsedMarijuana.value === 'YES' ||
         drugActivity.hasEngagedInDrugActivity.value === 'YES' ||
         drugTreatment.hasReceivedDrugTreatment.value === 'YES' ||
         foreignDrugUse.hasUsedDrugsAbroad.value === 'YES';
};

/**
 * Check if current drug use or intent is indicated
 */
export const hasCurrentDrugConcerns = (section23: Section23): boolean => {
  const drugUse = section23.section23.drugUse;
  const drugTreatment = section23.section23.drugTreatment;

  return drugUse.intentToContinueUse.value === 'YES' ||
         drugTreatment.currentlyInTreatment.value === 'YES' ||
         drugUse.entries.some(entry => entry.currentlyUsing.value === true);
};

/**
 * Get the most recent drug use date across all entries
 */
export const getMostRecentDrugUseDate = (section23: Section23): Date | null => {
  let mostRecentDate: Date | null = null;

  const allEntries = [
    ...section23.section23.drugUse.entries,
    ...section23.section23.foreignDrugUse.entries
  ];

  allEntries.forEach(entry => {
    if (entry.mostRecentUse.date.value) {
      const entryDate = new Date(entry.mostRecentUse.date.value);
      if (!mostRecentDate || entryDate > mostRecentDate) {
        mostRecentDate = entryDate;
      }
    }
  });

  return mostRecentDate;
};

/**
 * Check if additional documentation may be required
 */
export const requiresAdditionalDocumentation = (section23: Section23): boolean => {
  // Documentation typically required for:
  // 1. Any drug-related arrests/convictions
  // 2. Court-ordered treatment
  // 3. Drug activity beyond personal use
  // 4. Current ongoing treatment

  const hasLegalIssues = section23.section23.drugUse.entries.some(entry => entry.legalIssues.value);
  const hasCourtOrderedTreatment = section23.section23.drugTreatment.hasCourtOrderedTreatment.value === 'YES';
  const hasDrugActivity = section23.section23.drugActivity.hasEngagedInDrugActivity.value === 'YES';
  const hasCurrentTreatment = section23.section23.drugTreatment.currentlyInTreatment.value === 'YES';

  return hasLegalIssues || hasCourtOrderedTreatment || hasDrugActivity || hasCurrentTreatment;
}; 