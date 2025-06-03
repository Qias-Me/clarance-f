/**
 * Section 25: Investigation and Clearance Record
 *
 * TypeScript interface definitions for SF-86 Section 25 (Investigation and Clearance Record) data structure.
 * Based on the established Field<T> interface patterns and PDF field ID mappings from section-25.json.
 * 
 * This section covers background investigations and security clearance eligibility records,
 * including details about investigations completed by US Government agencies, foreign governments,
 * clearance eligibility dates, levels of clearance granted, and any denials or revocations.
 */

import type { Field } from '../formDefinition2.0';
import type { USState, Country } from './base';

// ============================================================================
// LOCAL TYPE DEFINITIONS
// ============================================================================

/**
 * Date information with estimation flag
 */
export interface DateInfo {
  date: Field<string>;
  estimated: Field<boolean>;
  dontKnow: Field<boolean>;
}

/**
 * Agency type for investigations
 */
export type InvestigatingAgencyType = 
  | "US_GOVERNMENT"
  | "FOREIGN_GOVERNMENT"
  | "OTHER";

/**
 * Clearance level types
 */
export type ClearanceLevel = 
  | "CONFIDENTIAL"
  | "SECRET"
  | "TOP_SECRET"
  | "SCI"
  | "SAP"
  | "OTHER";

/**
 * Investigation status types
 */
export type InvestigationStatus = 
  | "GRANTED"
  | "DENIED"
  | "REVOKED"
  | "SUSPENDED"
  | "PENDING";

// ============================================================================
// ENTRY INTERFACES
// ============================================================================

/**
 * Background Investigation Entry
 * Represents a single background investigation record
 */
export interface BackgroundInvestigationEntry {
  _id: number;
  
  // Investigation details
  investigatingAgency: {
    type: Field<InvestigatingAgencyType>;
    agencyName: Field<string>;
    foreignGovernmentName: Field<string>; // Only if type is FOREIGN_GOVERNMENT
    otherAgencyName: Field<string>; // Only if type is OTHER
  };
  
  // Investigation completion
  investigationCompletedDate: DateInfo;
  
  // Clearance eligibility
  clearanceEligibilityDate: DateInfo;
  hasGrantedEligibility: Field<"YES" | "NO">;
  
  // Clearance level
  clearanceLevel: {
    level: Field<ClearanceLevel>;
    otherLevelDescription: Field<string>; // Only if level is OTHER
  };
  
  // Status and additional information
  currentStatus: Field<InvestigationStatus>;
  explanation: Field<string>; // Additional details or explanations
}

/**
 * Clearance Denial Entry
 * Represents a security clearance denial record
 */
export interface ClearanceDenialEntry {
  _id: number;
  
  // Denial details
  denialDate: DateInfo;
  denyingAgency: Field<string>;
  
  // Denial information
  reasonForDenial: Field<string>;
  clearanceLevelDenied: {
    level: Field<ClearanceLevel>;
    otherLevelDescription: Field<string>;
  };
  
  // Appeal information
  wasAppealed: Field<"YES" | "NO">;
  appealOutcome: Field<string>; // Only if appealed
  appealDate: DateInfo; // Only if appealed
  
  // Current status
  explanation: Field<string>;
}

/**
 * Clearance Revocation Entry
 * Represents a security clearance revocation record
 */
export interface ClearanceRevocationEntry {
  _id: number;
  
  // Revocation details
  revocationDate: DateInfo;
  revokingAgency: Field<string>;
  
  // Revocation information
  reasonForRevocation: Field<string>;
  clearanceLevelRevoked: {
    level: Field<ClearanceLevel>;
    otherLevelDescription: Field<string>;
  };
  
  // Circumstances
  circumstances: Field<string>;
  voluntaryRevocation: Field<"YES" | "NO">;
  
  // Current status
  explanation: Field<string>;
}

// ============================================================================
// SUBSECTION INTERFACES
// ============================================================================

/**
 * Background Investigations Subsection
 */
export interface BackgroundInvestigationsSubsection {
  // Main question flags
  hasBackgroundInvestigations: Field<"YES" | "NO">;
  hasUSGovernmentInvestigations: Field<"YES" | "NO">;
  hasForeignGovernmentInvestigations: Field<"YES" | "NO">;
  
  // Investigation entries
  entries: BackgroundInvestigationEntry[];
  entriesCount: number;
}

/**
 * Clearance Denials Subsection
 */
export interface ClearanceDenialsSubsection {
  // Main question flags
  hasClearanceDenials: Field<"YES" | "NO">;
  hasUSGovernmentDenials: Field<"YES" | "NO">;
  hasForeignGovernmentDenials: Field<"YES" | "NO">;
  
  // Denial entries
  entries: ClearanceDenialEntry[];
  entriesCount: number;
}

/**
 * Clearance Revocations Subsection
 */
export interface ClearanceRevocationsSubsection {
  // Main question flags
  hasClearanceRevocations: Field<"YES" | "NO">;
  hasVoluntaryRevocations: Field<"YES" | "NO">;
  hasInvoluntaryRevocations: Field<"YES" | "NO">;
  
  // Revocation entries
  entries: ClearanceRevocationEntry[];
  entriesCount: number;
}

// ============================================================================
// MAIN SECTION INTERFACE
// ============================================================================

/**
 * Section 25 subsection keys
 */
export type Section25SubsectionKey = 
  | 'backgroundInvestigations'
  | 'clearanceDenials'
  | 'clearanceRevocations';

/**
 * Complete Section 25 interface
 */
export interface Section25 {
  _id: number;
  section25: {
    backgroundInvestigations: BackgroundInvestigationsSubsection;
    clearanceDenials: ClearanceDenialsSubsection;
    clearanceRevocations: ClearanceRevocationsSubsection;
  };
}

// ============================================================================
// VALIDATION AND UTILITY INTERFACES
// ============================================================================

/**
 * Section 25 validation context
 */
export interface Section25ValidationContext {
  currentDate: Date;
  rules: {
    timeframeYears: number; // Typically covers entire background history
    requiresInvestigationDetails: boolean;
    requiresAgencyInformation: boolean;
    requiresClearanceLevel: boolean;
    allowsEstimatedDates: boolean;
    maxDescriptionLength: number;
    requiresExplanationForDenials: boolean;
    requiresExplanationForRevocations: boolean;
  };
}

/**
 * Section 25 validation result
 */
export interface InvestigationValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  missingRequiredFields: string[];
  dateRangeIssues: string[];
  inconsistencies: string[];
}

/**
 * Section 25 field update structure
 */
export interface Section25FieldUpdate {
  subsectionKey: Section25SubsectionKey;
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
 * Create default date info
 */
const createDefaultDateInfo = (idPrefix: string): DateInfo => ({
  date: createField(`${idPrefix}_date`, ""),
  estimated: createField(`${idPrefix}_estimated`, false, undefined, "PDFCheckBox"),
  dontKnow: createField(`${idPrefix}_dont_know`, false, undefined, "PDFCheckBox"),
});

/**
 * Create default background investigation entry
 */
export const createDefaultBackgroundInvestigationEntry = (): BackgroundInvestigationEntry => ({
  _id: Date.now(),
  investigatingAgency: {
    type: createField("investigation_agency_type", "US_GOVERNMENT" as InvestigatingAgencyType),
    agencyName: createField("investigation_agency_name", ""),
    foreignGovernmentName: createField("foreign_government_name", ""),
    otherAgencyName: createField("other_agency_name", ""),
  },
  investigationCompletedDate: createDefaultDateInfo("investigation_completed"),
  clearanceEligibilityDate: createDefaultDateInfo("clearance_eligibility"),
  hasGrantedEligibility: createField("has_granted_eligibility", "NO"),
  clearanceLevel: {
    level: createField("clearance_level", "CONFIDENTIAL" as ClearanceLevel),
    otherLevelDescription: createField("other_level_description", ""),
  },
  currentStatus: createField("current_status", "GRANTED" as InvestigationStatus),
  explanation: createField("investigation_explanation", ""),
});

/**
 * Create default clearance denial entry
 */
export const createDefaultClearanceDenialEntry = (): ClearanceDenialEntry => ({
  _id: Date.now(),
  denialDate: createDefaultDateInfo("denial"),
  denyingAgency: createField("denying_agency", ""),
  reasonForDenial: createField("reason_for_denial", ""),
  clearanceLevelDenied: {
    level: createField("denied_clearance_level", "CONFIDENTIAL" as ClearanceLevel),
    otherLevelDescription: createField("denied_other_level_description", ""),
  },
  wasAppealed: createField("was_appealed", "NO"),
  appealOutcome: createField("appeal_outcome", ""),
  appealDate: createDefaultDateInfo("appeal"),
  explanation: createField("denial_explanation", ""),
});

/**
 * Create default clearance revocation entry
 */
export const createDefaultClearanceRevocationEntry = (): ClearanceRevocationEntry => ({
  _id: Date.now(),
  revocationDate: createDefaultDateInfo("revocation"),
  revokingAgency: createField("revoking_agency", ""),
  reasonForRevocation: createField("reason_for_revocation", ""),
  clearanceLevelRevoked: {
    level: createField("revoked_clearance_level", "CONFIDENTIAL" as ClearanceLevel),
    otherLevelDescription: createField("revoked_other_level_description", ""),
  },
  circumstances: createField("revocation_circumstances", ""),
  voluntaryRevocation: createField("voluntary_revocation", "NO"),
  explanation: createField("revocation_explanation", ""),
});

/**
 * Create default Section 25 data structure
 */
export const createDefaultSection25 = (): Section25 => ({
  _id: 25,
  section25: {
    // Background Investigations Subsection
    backgroundInvestigations: {
      hasBackgroundInvestigations: createField("has_background_investigations", "NO"),
      hasUSGovernmentInvestigations: createField("has_us_government_investigations", "NO"),
      hasForeignGovernmentInvestigations: createField("has_foreign_government_investigations", "NO"),
      entries: [],
      entriesCount: 0,
    },
    
    // Clearance Denials Subsection
    clearanceDenials: {
      hasClearanceDenials: createField("has_clearance_denials", "NO"),
      hasUSGovernmentDenials: createField("has_us_government_denials", "NO"),
      hasForeignGovernmentDenials: createField("has_foreign_government_denials", "NO"),
      entries: [],
      entriesCount: 0,
    },
    
    // Clearance Revocations Subsection
    clearanceRevocations: {
      hasClearanceRevocations: createField("has_clearance_revocations", "NO"),
      hasVoluntaryRevocations: createField("has_voluntary_revocations", "NO"),
      hasInvoluntaryRevocations: createField("has_involuntary_revocations", "NO"),
      entries: [],
      entriesCount: 0,
    },
  },
});

/**
 * Validate Section 25 data
 */
export const validateSection25 = (
  data: Section25,
  context: Section25ValidationContext
): InvestigationValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];
  const missingRequiredFields: string[] = [];
  const dateRangeIssues: string[] = [];
  const inconsistencies: string[] = [];

  // Validate background investigations
  if (data.section25.backgroundInvestigations.hasBackgroundInvestigations.value === "YES") {
    if (data.section25.backgroundInvestigations.entries.length === 0) {
      errors.push("At least one background investigation entry is required when answering YES");
    }
    
    data.section25.backgroundInvestigations.entries.forEach((entry, index) => {
      if (!entry.investigatingAgency.agencyName.value && entry.investigatingAgency.type.value === "US_GOVERNMENT") {
        missingRequiredFields.push(`Investigation ${index + 1}: Agency name is required`);
      }
      
      if (!entry.investigationCompletedDate.date.value && !entry.investigationCompletedDate.dontKnow.value) {
        missingRequiredFields.push(`Investigation ${index + 1}: Investigation completion date is required`);
      }
    });
  }

  // Validate clearance denials
  if (data.section25.clearanceDenials.hasClearanceDenials.value === "YES") {
    if (data.section25.clearanceDenials.entries.length === 0) {
      errors.push("At least one clearance denial entry is required when answering YES");
    }
    
    data.section25.clearanceDenials.entries.forEach((entry, index) => {
      if (!entry.denyingAgency.value) {
        missingRequiredFields.push(`Denial ${index + 1}: Denying agency is required`);
      }
      
      if (!entry.reasonForDenial.value) {
        missingRequiredFields.push(`Denial ${index + 1}: Reason for denial is required`);
      }
    });
  }

  // Validate clearance revocations
  if (data.section25.clearanceRevocations.hasClearanceRevocations.value === "YES") {
    if (data.section25.clearanceRevocations.entries.length === 0) {
      errors.push("At least one clearance revocation entry is required when answering YES");
    }
    
    data.section25.clearanceRevocations.entries.forEach((entry, index) => {
      if (!entry.revokingAgency.value) {
        missingRequiredFields.push(`Revocation ${index + 1}: Revoking agency is required`);
      }
      
      if (!entry.reasonForRevocation.value) {
        missingRequiredFields.push(`Revocation ${index + 1}: Reason for revocation is required`);
      }
    });
  }

  return {
    isValid: errors.length === 0 && missingRequiredFields.length === 0,
    errors,
    warnings,
    missingRequiredFields,
    dateRangeIssues,
    inconsistencies,
  };
};

/**
 * Check if section has any investigation records
 */
export const hasAnyInvestigationRecords = (data: Section25): boolean => {
  return (
    data.section25.backgroundInvestigations.hasBackgroundInvestigations.value === "YES" ||
    data.section25.clearanceDenials.hasClearanceDenials.value === "YES" ||
    data.section25.clearanceRevocations.hasClearanceRevocations.value === "YES"
  );
};

/**
 * Get total entry count across all subsections
 */
export const getTotalEntryCount = (data: Section25): number => {
  return (
    data.section25.backgroundInvestigations.entriesCount +
    data.section25.clearanceDenials.entriesCount +
    data.section25.clearanceRevocations.entriesCount
  );
};

/**
 * Get investigation summary
 */
export const getInvestigationSummary = (data: Section25) => {
  return {
    hasInvestigations: data.section25.backgroundInvestigations.hasBackgroundInvestigations.value === "YES",
    hasDenials: data.section25.clearanceDenials.hasClearanceDenials.value === "YES",
    hasRevocations: data.section25.clearanceRevocations.hasClearanceRevocations.value === "YES",
    totalEntries: getTotalEntryCount(data),
    investigationCount: data.section25.backgroundInvestigations.entriesCount,
    denialCount: data.section25.clearanceDenials.entriesCount,
    revocationCount: data.section25.clearanceRevocations.entriesCount,
  };
}; 