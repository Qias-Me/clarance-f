/**
 * Section 24: Use of Alcohol
 *
 * TypeScript interface definitions for SF-86 Section 24 (Use of Alcohol) data structure.
 * Based on the established Field<T> interface patterns and PDF field ID mappings from section-24.json.
 * 
 * This section covers alcohol use and its negative impacts on work performance, professional or
 * personal relationships, finances, and incidents involving law enforcement or public safety personnel.
 * Includes questions about alcohol-related treatment, counseling, and current status.
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
// SECTION 24 CORE INTERFACES
// ============================================================================

/**
 * Types of negative impacts from alcohol use
 */
export type AlcoholImpactType = 
  | 'work_performance'
  | 'professional_relationships'
  | 'personal_relationships'
  | 'financial_impact'
  | 'law_enforcement_intervention'
  | 'public_safety_intervention'
  | 'health_consequences'
  | 'legal_consequences'
  | 'other';

/**
 * Types of alcohol-related incidents
 */
export type AlcoholIncidentType =
  | 'dui_dwi'
  | 'public_intoxication'
  | 'domestic_disturbance'
  | 'workplace_incident'
  | 'accident_while_intoxicated'
  | 'disorderly_conduct'
  | 'assault_while_intoxicated'
  | 'property_damage'
  | 'other_criminal_activity'
  | 'other';

/**
 * Types of alcohol treatment or counseling
 */
export type AlcoholTreatmentType =
  | 'inpatient_rehabilitation'
  | 'outpatient_treatment'
  | 'alcoholics_anonymous'
  | 'individual_counseling'
  | 'group_therapy'
  | 'family_counseling'
  | 'employee_assistance_program'
  | 'court_ordered_treatment'
  | 'detoxification'
  | 'other';

/**
 * Current alcohol use status
 */
export type AlcoholUseStatus =
  | 'abstinent'
  | 'social_drinker'
  | 'moderate_use'
  | 'heavy_use'
  | 'seeking_treatment'
  | 'in_treatment'
  | 'other';

/**
 * Frequency of alcohol consumption
 */
export type AlcoholUseFrequency =
  | 'never'
  | 'rarely'
  | 'monthly'
  | 'weekly'
  | 'several_times_week'
  | 'daily'
  | 'multiple_times_daily'
  | 'binge_drinking'
  | 'other';

/**
 * Alcohol-related negative impact entry
 */
export interface AlcoholImpactEntry {
  _id: Field<string | number>;
  
  // Impact Details
  impactType: Field<AlcoholImpactType>;
  impactDescription: Field<string>;
  circumstances: Field<string>;
  negativeImpactDetails: Field<string>;
  
  // Timeline
  incidentDates: DateRange;
  frequencyOfProblems: Field<string>;
  
  // Location Information
  incidentLocation: Address;
  additionalLocations: Field<string>;
  
  // Work-Related Impact
  workPerformanceAffected: Field<boolean>;
  workPerformanceDetails: Field<string>;
  jobLossRelated: Field<boolean>;
  disciplinaryActionTaken: Field<boolean>;
  disciplinaryDetails: Field<string>;
  
  // Relationship Impact
  personalRelationshipsAffected: Field<boolean>;
  relationshipDetails: Field<string>;
  familyImpact: Field<boolean>;
  familyImpactDetails: Field<string>;
  
  // Financial Impact
  financialProblemsRelated: Field<boolean>;
  financialDetails: Field<string>;
  estimatedFinancialLoss: Field<string>;
  debtIncurred: Field<boolean>;
  
  // Legal/Law Enforcement
  lawEnforcementInvolved: Field<boolean>;
  lawEnforcementDetails: Field<string>;
  arrestsMade: Field<boolean>;
  arrestDetails: Field<string>;
  chargesFiled: Field<boolean>;
  chargesDetails: Field<string>;
  convictionsResult: Field<boolean>;
  convictionDetails: Field<string>;
  
  // Health Impact
  healthConsequences: Field<boolean>;
  healthDetails: Field<string>;
  medicalTreatmentSought: Field<boolean>;
  medicalTreatmentDetails: Field<string>;
  
  // Current Status
  problemResolved: Field<boolean>;
  resolutionDetails: Field<string>;
  ongoingIssues: Field<boolean>;
  currentSupport: Field<string>;
  
  // Additional Information
  witnessesPresent: Field<boolean>;
  witnessInformation: Field<string>;
  additionalDetails: Field<string>;
  
  // Pattern Recognition
  recurringProblem: Field<boolean>;
  patternDescription: Field<string>;
  interventionAttempts: Field<string>;
}

/**
 * Alcohol treatment/counseling entry
 */
export interface AlcoholTreatmentEntry {
  _id: Field<string | number>;
  
  // Treatment Information
  treatmentType: Field<AlcoholTreatmentType>;
  treatmentDescription: Field<string>;
  
  // Timeline
  treatmentDates: DateRange;
  treatmentDuration: Field<string>;
  
  // Provider Information
  providerName: Field<string>;
  providerAddress: Address;
  providerType: Field<string>;
  providerContactInfo: Field<string>;
  
  // Treatment Details
  voluntaryTreatment: Field<boolean>;
  courtOrdered: Field<boolean>;
  employmentRequired: Field<boolean>;
  familyIntervention: Field<boolean>;
  reasonForTreatment: Field<string>;
  
  // Treatment Components
  inpatientCare: Field<boolean>;
  outpatientCare: Field<boolean>;
  groupSessions: Field<boolean>;
  individualCounseling: Field<boolean>;
  medicationAssisted: Field<boolean>;
  medicationDetails: Field<string>;
  
  // Outcomes
  treatmentCompleted: Field<boolean>;
  treatmentSuccessful: Field<boolean>;
  currentlyInTreatment: Field<boolean>;
  ongoingSupport: Field<boolean>;
  supportGroupParticipation: Field<boolean>;
  
  // Relapse Information
  relapsedAfterTreatment: Field<boolean>;
  relapseDetails: Field<string>;
  additionalTreatmentSought: Field<boolean>;
  relapsePreventionPlan: Field<boolean>;
  
  // Additional Information
  treatmentEffectiveness: Field<string>;
  lessonsLearned: Field<string>;
  additionalDetails: Field<string>;
  recommendationsReceived: Field<string>;
}

/**
 * Alcohol consumption pattern entry
 */
export interface AlcoholConsumptionEntry {
  _id: Field<string | number>;
  
  // Consumption Pattern
  typicalFrequency: Field<AlcoholUseFrequency>;
  typicalQuantity: Field<string>;
  preferredBeverages: Field<string>;
  consumptionContext: Field<string>;
  
  // Timeline
  drinkingPeriod: DateRange;
  ageFirstDrink: Field<string>;
  ageRegularDrinking: Field<string>;
  
  // Pattern Changes
  consumptionIncreased: Field<boolean>;
  consumptionDecreased: Field<boolean>;
  patternChangeReason: Field<string>;
  patternChangeDate: Field<string>;
  
  // Social Context
  drinkingAlone: Field<boolean>;
  drinkingWithOthers: Field<boolean>;
  socialPressureInvolved: Field<boolean>;
  peerInfluence: Field<string>;
  
  // Control and Awareness
  attemptsToReduce: Field<boolean>;
  reductionAttemptDetails: Field<string>;
  successfulReduction: Field<boolean>;
  reasonForChange: Field<string>;
  
  // Current Status
  currentConsumption: Field<AlcoholUseStatus>;
  currentFrequency: Field<AlcoholUseFrequency>;
  currentConcerns: Field<boolean>;
  currentConcernDetails: Field<string>;
  
  // Additional Information
  familyHistory: Field<boolean>;
  familyHistoryDetails: Field<string>;
  additionalDetails: Field<string>;
}

// ============================================================================
// SUBSECTION INTERFACES
// ============================================================================

/**
 * Section 24 subsection keys
 */
export type Section24SubsectionKey = 
  | 'alcoholImpacts'
  | 'alcoholTreatment'
  | 'alcoholConsumption';

/**
 * Alcohol impacts subsection
 */
export interface AlcoholImpactsSubsection {
  // Main questions
  hasAlcoholNegativeImpacts: Field<'YES' | 'NO'>;
  hasWorkPerformanceImpact: Field<'YES' | 'NO'>;
  hasRelationshipImpact: Field<'YES' | 'NO'>;
  hasFinancialImpact: Field<'YES' | 'NO'>;
  hasLawEnforcementInvolvement: Field<'YES' | 'NO'>;
  
  // Follow-up questions
  impactsInLast7Years: Field<'YES' | 'NO'>;
  recurringPattern: Field<'YES' | 'NO'>;
  currentProblems: Field<'YES' | 'NO'>;
  
  // Entries
  entries: AlcoholImpactEntry[];
  entriesCount: number;
}

/**
 * Alcohol treatment subsection
 */
export interface AlcoholTreatmentSubsection {
  // Main questions
  hasReceivedAlcoholTreatment: Field<'YES' | 'NO'>;
  hasReceivedCounseling: Field<'YES' | 'NO'>;
  hasVoluntaryTreatment: Field<'YES' | 'NO'>;
  hasCourtOrderedTreatment: Field<'YES' | 'NO'>;
  currentlyInTreatment: Field<'YES' | 'NO'>;
  
  // Treatment effectiveness
  treatmentHelpful: Field<'YES' | 'NO'>;
  continuesSupport: Field<'YES' | 'NO'>;
  recommendsTreatment: Field<'YES' | 'NO'>;
  
  // Entries
  entries: AlcoholTreatmentEntry[];
  entriesCount: number;
}

/**
 * Alcohol consumption subsection
 */
export interface AlcoholConsumptionSubsection {
  // Current use questions
  currentlyConsumesAlcohol: Field<'YES' | 'NO'>;
  consumptionFrequency: Field<AlcoholUseFrequency>;
  concernsAboutUse: Field<'YES' | 'NO'>;
  othersExpressedConcern: Field<'YES' | 'NO'>;
  
  // Pattern questions
  drinkingPatternChanged: Field<'YES' | 'NO'>;
  increaseInConsumption: Field<'YES' | 'NO'>;
  attemptsToReduce: Field<'YES' | 'NO'>;
  successfulInReduction: Field<'YES' | 'NO'>;
  
  // Entries
  entries: AlcoholConsumptionEntry[];
  entriesCount: number;
}

// ============================================================================
// MAIN SECTION INTERFACE
// ============================================================================

/**
 * Complete Section 24 interface
 */
export interface Section24 {
  _id: number;
  section24: {
    alcoholImpacts: AlcoholImpactsSubsection;
    alcoholTreatment: AlcoholTreatmentSubsection;
    alcoholConsumption: AlcoholConsumptionSubsection;
  };
}

// ============================================================================
// VALIDATION AND UTILITY INTERFACES
// ============================================================================

/**
 * Section 24 validation context
 */
export interface Section24ValidationContext {
  currentDate: Date;
  rules: {
    timeframeYears: number; // Typically 7 years for alcohol-related questions
    requiresImpactDetails: boolean;
    requiresTreatmentInfo: boolean;
    requiresCurrentStatusInfo: boolean;
    allowsEstimatedDates: boolean;
    maxDescriptionLength: number;
    requiresProviderInfo: boolean;
    requiresLocationInfo: boolean;
  };
}

/**
 * Section 24 validation result
 */
export interface AlcoholValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  missingRequiredFields: string[];
  dateRangeIssues: string[];
  inconsistencies: string[];
}

/**
 * Section 24 field update structure
 */
export interface Section24FieldUpdate {
  subsectionKey: Section24SubsectionKey;
  entryIndex?: number;
  fieldPath: string;
  newValue: any;
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Create a Field with proper PDF mapping
 */
const createField = <T>(id: string, value: T, name?: string, type = "PDFTextField", label = ""): Field<T> => ({
  id,
  name: name || id,
  value,
  type,
  label,
  rect: { x: 0, y: 0, width: 0, height: 0 },
});

/**
 * Create default alcohol impact entry
 */
export const createDefaultAlcoholImpactEntry = (): AlcoholImpactEntry => ({
  _id: createField("entry_id", `impact_${Date.now()}`),
  
  // Impact Details
  impactType: createField("impact_type", 'work_performance' as AlcoholImpactType),
  impactDescription: createField("impact_description", ""),
  circumstances: createField("circumstances", ""),
  negativeImpactDetails: createField("negative_impact_details", ""),
  
  // Timeline
  incidentDates: {
    from: {
      date: createField("incident_from_date", ""),
      estimated: createField("incident_from_estimated", false),
    },
    to: {
      date: createField("incident_to_date", ""),
      estimated: createField("incident_to_estimated", false),
    },
    present: createField("incident_present", false),
  },
  frequencyOfProblems: createField("frequency_of_problems", ""),
  
  // Location Information
  incidentLocation: {
    street: createField("incident_street", ""),
    city: createField("incident_city", ""),
    state: createField("incident_state", "" as USState),
    zipCode: createField("incident_zip", ""),
    county: createField("incident_county", ""),
    country: createField("incident_country", "" as Country),
  },
  additionalLocations: createField("additional_locations", ""),
  
  // Work-Related Impact
  workPerformanceAffected: createField("work_performance_affected", false),
  workPerformanceDetails: createField("work_performance_details", ""),
  jobLossRelated: createField("job_loss_related", false),
  disciplinaryActionTaken: createField("disciplinary_action_taken", false),
  disciplinaryDetails: createField("disciplinary_details", ""),
  
  // Relationship Impact
  personalRelationshipsAffected: createField("personal_relationships_affected", false),
  relationshipDetails: createField("relationship_details", ""),
  familyImpact: createField("family_impact", false),
  familyImpactDetails: createField("family_impact_details", ""),
  
  // Financial Impact
  financialProblemsRelated: createField("financial_problems_related", false),
  financialDetails: createField("financial_details", ""),
  estimatedFinancialLoss: createField("estimated_financial_loss", ""),
  debtIncurred: createField("debt_incurred", false),
  
  // Legal/Law Enforcement
  lawEnforcementInvolved: createField("law_enforcement_involved", false),
  lawEnforcementDetails: createField("law_enforcement_details", ""),
  arrestsMade: createField("arrests_made", false),
  arrestDetails: createField("arrest_details", ""),
  chargesFiled: createField("charges_filed", false),
  chargesDetails: createField("charges_details", ""),
  convictionsResult: createField("convictions_result", false),
  convictionDetails: createField("conviction_details", ""),
  
  // Health Impact
  healthConsequences: createField("health_consequences", false),
  healthDetails: createField("health_details", ""),
  medicalTreatmentSought: createField("medical_treatment_sought", false),
  medicalTreatmentDetails: createField("medical_treatment_details", ""),
  
  // Current Status
  problemResolved: createField("problem_resolved", false),
  resolutionDetails: createField("resolution_details", ""),
  ongoingIssues: createField("ongoing_issues", false),
  currentSupport: createField("current_support", ""),
  
  // Additional Information
  witnessesPresent: createField("witnesses_present", false),
  witnessInformation: createField("witness_information", ""),
  additionalDetails: createField("additional_details", ""),
  
  // Pattern Recognition
  recurringProblem: createField("recurring_problem", false),
  patternDescription: createField("pattern_description", ""),
  interventionAttempts: createField("intervention_attempts", ""),
});

/**
 * Create default alcohol treatment entry
 */
export const createDefaultAlcoholTreatmentEntry = (): AlcoholTreatmentEntry => ({
  _id: createField("entry_id", `treatment_${Date.now()}`),
  
  // Treatment Information
  treatmentType: createField("treatment_type", 'individual_counseling' as AlcoholTreatmentType),
  treatmentDescription: createField("treatment_description", ""),
  
  // Timeline
  treatmentDates: {
    from: {
      date: createField("treatment_from_date", ""),
      estimated: createField("treatment_from_estimated", false),
    },
    to: {
      date: createField("treatment_to_date", ""),
      estimated: createField("treatment_to_estimated", false),
    },
    present: createField("treatment_present", false),
  },
  treatmentDuration: createField("treatment_duration", ""),
  
  // Provider Information
  providerName: createField("provider_name", ""),
  providerAddress: {
    street: createField("provider_street", ""),
    city: createField("provider_city", ""),
    state: createField("provider_state", "" as USState),
    zipCode: createField("provider_zip", ""),
    county: createField("provider_county", ""),
    country: createField("provider_country", "" as Country),
  },
  providerType: createField("provider_type", ""),
  providerContactInfo: createField("provider_contact_info", ""),
  
  // Treatment Details
  voluntaryTreatment: createField("voluntary_treatment", true),
  courtOrdered: createField("court_ordered", false),
  employmentRequired: createField("employment_required", false),
  familyIntervention: createField("family_intervention", false),
  reasonForTreatment: createField("reason_for_treatment", ""),
  
  // Treatment Components
  inpatientCare: createField("inpatient_care", false),
  outpatientCare: createField("outpatient_care", false),
  groupSessions: createField("group_sessions", false),
  individualCounseling: createField("individual_counseling", false),
  medicationAssisted: createField("medication_assisted", false),
  medicationDetails: createField("medication_details", ""),
  
  // Outcomes
  treatmentCompleted: createField("treatment_completed", false),
  treatmentSuccessful: createField("treatment_successful", false),
  currentlyInTreatment: createField("currently_in_treatment", false),
  ongoingSupport: createField("ongoing_support", false),
  supportGroupParticipation: createField("support_group_participation", false),
  
  // Relapse Information
  relapsedAfterTreatment: createField("relapsed_after_treatment", false),
  relapseDetails: createField("relapse_details", ""),
  additionalTreatmentSought: createField("additional_treatment_sought", false),
  relapsePreventionPlan: createField("relapse_prevention_plan", false),
  
  // Additional Information
  treatmentEffectiveness: createField("treatment_effectiveness", ""),
  lessonsLearned: createField("lessons_learned", ""),
  additionalDetails: createField("additional_details", ""),
  recommendationsReceived: createField("recommendations_received", ""),
});

/**
 * Create default alcohol consumption entry
 */
export const createDefaultAlcoholConsumptionEntry = (): AlcoholConsumptionEntry => ({
  _id: createField("entry_id", `consumption_${Date.now()}`),
  
  // Consumption Pattern
  typicalFrequency: createField("typical_frequency", 'social_drinker' as AlcoholUseFrequency),
  typicalQuantity: createField("typical_quantity", ""),
  preferredBeverages: createField("preferred_beverages", ""),
  consumptionContext: createField("consumption_context", ""),
  
  // Timeline
  drinkingPeriod: {
    from: {
      date: createField("drinking_from_date", ""),
      estimated: createField("drinking_from_estimated", false),
    },
    to: {
      date: createField("drinking_to_date", ""),
      estimated: createField("drinking_to_estimated", false),
    },
    present: createField("drinking_present", false),
  },
  ageFirstDrink: createField("age_first_drink", ""),
  ageRegularDrinking: createField("age_regular_drinking", ""),
  
  // Pattern Changes
  consumptionIncreased: createField("consumption_increased", false),
  consumptionDecreased: createField("consumption_decreased", false),
  patternChangeReason: createField("pattern_change_reason", ""),
  patternChangeDate: createField("pattern_change_date", ""),
  
  // Social Context
  drinkingAlone: createField("drinking_alone", false),
  drinkingWithOthers: createField("drinking_with_others", true),
  socialPressureInvolved: createField("social_pressure_involved", false),
  peerInfluence: createField("peer_influence", ""),
  
  // Control and Awareness
  attemptsToReduce: createField("attempts_to_reduce", false),
  reductionAttemptDetails: createField("reduction_attempt_details", ""),
  successfulReduction: createField("successful_reduction", false),
  reasonForChange: createField("reason_for_change", ""),
  
  // Current Status
  currentConsumption: createField("current_consumption", 'social_drinker' as AlcoholUseStatus),
  currentFrequency: createField("current_frequency", 'social_drinker' as AlcoholUseFrequency),
  currentConcerns: createField("current_concerns", false),
  currentConcernDetails: createField("current_concern_details", ""),
  
  // Additional Information
  familyHistory: createField("family_history", false),
  familyHistoryDetails: createField("family_history_details", ""),
  additionalDetails: createField("additional_details", ""),
});

/**
 * Create default Section 24 data structure
 */
export const createDefaultSection24 = (): Section24 => ({
  _id: 24,
  section24: {
    // Alcohol Impacts Subsection
    alcoholImpacts: {
      hasAlcoholNegativeImpacts: createField("has_alcohol_negative_impacts", "NO"),
      hasWorkPerformanceImpact: createField("has_work_performance_impact", "NO"),
      hasRelationshipImpact: createField("has_relationship_impact", "NO"),
      hasFinancialImpact: createField("has_financial_impact", "NO"),
      hasLawEnforcementInvolvement: createField("has_law_enforcement_involvement", "NO"),
      impactsInLast7Years: createField("impacts_in_last_7_years", "NO"),
      recurringPattern: createField("recurring_pattern", "NO"),
      currentProblems: createField("current_problems", "NO"),
      entries: [],
      entriesCount: 0,
    },
    
    // Alcohol Treatment Subsection
    alcoholTreatment: {
      hasReceivedAlcoholTreatment: createField("has_received_alcohol_treatment", "NO"),
      hasReceivedCounseling: createField("has_received_counseling", "NO"),
      hasVoluntaryTreatment: createField("has_voluntary_treatment", "NO"),
      hasCourtOrderedTreatment: createField("has_court_ordered_treatment", "NO"),
      currentlyInTreatment: createField("currently_in_treatment", "NO"),
      treatmentHelpful: createField("treatment_helpful", "NO"),
      continuesSupport: createField("continues_support", "NO"),
      recommendsTreatment: createField("recommends_treatment", "NO"),
      entries: [],
      entriesCount: 0,
    },
    
    // Alcohol Consumption Subsection
    alcoholConsumption: {
      currentlyConsumesAlcohol: createField("currently_consumes_alcohol", "NO"),
      consumptionFrequency: createField("consumption_frequency", 'never' as AlcoholUseFrequency),
      concernsAboutUse: createField("concerns_about_use", "NO"),
      othersExpressedConcern: createField("others_expressed_concern", "NO"),
      drinkingPatternChanged: createField("drinking_pattern_changed", "NO"),
      increaseInConsumption: createField("increase_in_consumption", "NO"),
      attemptsToReduce: createField("attempts_to_reduce", "NO"),
      successfulInReduction: createField("successful_in_reduction", "NO"),
      entries: [],
      entriesCount: 0,
    },
  },
});

/**
 * Update Section 24 field helper
 */
export const updateSection24Field = (
  section24Data: Section24,
  update: Section24FieldUpdate
): Section24 => {
  const updatedData = { ...section24Data };
  const path = update.entryIndex !== undefined 
    ? `section24.${update.subsectionKey}.entries.${update.entryIndex}.${update.fieldPath}`
    : `section24.${update.subsectionKey}.${update.fieldPath}`;
  
  // Use lodash set or implement path-based update
  // This is a simplified version - you'd want to use lodash.set in practice
  return updatedData;
};

/**
 * Validation function for alcohol impact entries
 */
export function validateAlcoholImpactEntry(
  entry: AlcoholImpactEntry, 
  context: Section24ValidationContext
): AlcoholValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const missingRequiredFields: string[] = [];

  // Validate required fields
  if (!entry.impactDescription.value.trim()) {
    missingRequiredFields.push('Impact Description');
  }
  
  if (!entry.circumstances.value.trim()) {
    missingRequiredFields.push('Circumstances');
  }

  // Validate dates
  const dateRangeIssues: string[] = [];
  if (entry.incidentDates.from.date.value && entry.incidentDates.to.date.value) {
    const fromDate = new Date(entry.incidentDates.from.date.value);
    const toDate = new Date(entry.incidentDates.to.date.value);
    
    if (fromDate > toDate) {
      dateRangeIssues.push('From date cannot be after To date');
    }
    
    if (fromDate > context.currentDate) {
      dateRangeIssues.push('From date cannot be in the future');
    }
  }

  return {
    isValid: errors.length === 0 && missingRequiredFields.length === 0 && dateRangeIssues.length === 0,
    errors,
    warnings,
    missingRequiredFields,
    dateRangeIssues,
    inconsistencies: [],
  };
}

/**
 * Validation function for complete Section 24
 */
export function validateSection24(
  section24: Section24,
  context: Section24ValidationContext
): AlcoholValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const missingRequiredFields: string[] = [];
  const dateRangeIssues: string[] = [];
  const inconsistencies: string[] = [];

  // Validate each subsection's entries
  section24.section24.alcoholImpacts.entries.forEach((entry, index) => {
    const entryResult = validateAlcoholImpactEntry(entry, context);
    if (!entryResult.isValid) {
      errors.push(`Alcohol Impact Entry ${index + 1}: ${entryResult.errors.join(', ')}`);
      missingRequiredFields.push(...entryResult.missingRequiredFields.map(field => `Entry ${index + 1}: ${field}`));
      dateRangeIssues.push(...entryResult.dateRangeIssues.map(issue => `Entry ${index + 1}: ${issue}`));
    }
  });

  // Check for consistency
  const hasImpacts = section24.section24.alcoholImpacts.hasAlcoholNegativeImpacts.value === 'YES';
  const hasEntries = section24.section24.alcoholImpacts.entries.length > 0;
  
  if (hasImpacts && !hasEntries) {
    inconsistencies.push('Indicated alcohol negative impacts but no entries provided');
  }
  
  if (!hasImpacts && hasEntries) {
    inconsistencies.push('Provided alcohol impact entries but indicated no negative impacts');
  }

  return {
    isValid: errors.length === 0 && missingRequiredFields.length === 0 && dateRangeIssues.length === 0 && inconsistencies.length === 0,
    errors,
    warnings,
    missingRequiredFields,
    dateRangeIssues,
    inconsistencies,
  };
}

/**
 * Get total alcohol-related entries across all subsections
 */
export const getTotalAlcoholEntries = (section24: Section24): number => {
  return section24.section24.alcoholImpacts.entries.length +
         section24.section24.alcoholTreatment.entries.length +
         section24.section24.alcoholConsumption.entries.length;
};

/**
 * Check if there are any alcohol-related issues
 */
export const hasAnyAlcoholIssues = (section24: Section24): boolean => {
  return section24.section24.alcoholImpacts.hasAlcoholNegativeImpacts.value === 'YES' ||
         section24.section24.alcoholTreatment.hasReceivedAlcoholTreatment.value === 'YES' ||
         section24.section24.alcoholConsumption.concernsAboutUse.value === 'YES';
};

/**
 * Check if there are current alcohol concerns
 */
export const hasCurrentAlcoholConcerns = (section24: Section24): boolean => {
  return section24.section24.alcoholImpacts.currentProblems.value === 'YES' ||
         section24.section24.alcoholTreatment.currentlyInTreatment.value === 'YES' ||
         section24.section24.alcoholConsumption.concernsAboutUse.value === 'YES';
};

/**
 * Check if additional documentation is required
 */
export const requiresAdditionalDocumentation = (section24: Section24): boolean => {
  return hasAnyAlcoholIssues(section24) || hasCurrentAlcoholConcerns(section24);
}; 