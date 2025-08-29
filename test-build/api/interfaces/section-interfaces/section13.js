"use strict";
/**
 * Section 13: Employment Activities
 *
 * TypeScript interface definitions for SF-86 Section 13 (Employment Activities) data structure.
 * Based on the established Field<T> interface patterns and PDF field ID mappings from section-13.json.
 *
 * This section covers employment history including employers, positions, dates, supervisors,
 * and employment-related activities with extensive fields across multiple pages.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.REASON_FOR_LEAVING_OPTIONS = exports.EMPLOYMENT_STATUS_OPTIONS = exports.EMPLOYMENT_TYPE_OPTIONS = exports.SECTION13_FIELD_NAMES = exports.isPrivateEmployment = exports.isFederalEmployment = exports.isGovernmentEmployment = void 0;
/**
 * Type guards for employment types
 */
const isGovernmentEmployment = (type) => {
    return type === "Federal Employment" ||
        type === "State Government" ||
        type === "Local Government";
};
exports.isGovernmentEmployment = isGovernmentEmployment;
const isFederalEmployment = (type) => {
    return type === "Federal Employment" || type === "Military Service";
};
exports.isFederalEmployment = isFederalEmployment;
const isPrivateEmployment = (type) => {
    return type === "Private Company" ||
        type === "Non-Profit Organization" ||
        type === "Contract Work" ||
        type === "Consulting" ||
        type === "Self-Employment";
};
exports.isPrivateEmployment = isPrivateEmployment;
/**
 * Field name mappings for Section 13 (Employment Activities)
 * Full field paths from section-13.json
 */
exports.SECTION13_FIELD_NAMES = {
    // Main section questions - using actual field names from section-13.json
    EMPLOYMENT_TYPE_RADIO_1: "form1[0].section_13_1-2[0].RadioButtonList[0]",
    EMPLOYMENT_STATUS_RADIO_1: "form1[0].section_13_1-2[0].RadioButtonList[1]",
    // Entry 1 fields - actual field names from section-13.json
    ENTRY1_SUPERVISOR_NAME: "form1[0].section_13_1-2[0].TextField11[0]",
    ENTRY1_SUPERVISOR_RANK: "form1[0].section_13_1-2[0].TextField11[1]",
    ENTRY1_FROM_DATE: "form1[0].section_13_1-2[0].From_Datefield_Name_2[0]",
    ENTRY1_TO_DATE: "form1[0].section_13_1-2[0].From_Datefield_Name_2[1]",
    // Federal employment section
    FEDERAL_EMPLOYMENT_MAIN: "form1[0].section13_5[0].RadioButtonList[0]",
    FEDERAL_EMPLOYMENT_RESPONSE: "form1[0].section13_5[0].RadioButtonList[1]",
};
// ============================================================================
// HELPER TYPES
// ============================================================================
/**
 * Employment type options for dropdown
 */
exports.EMPLOYMENT_TYPE_OPTIONS = [
    "Federal Employment",
    "State Government",
    "Local Government",
    "Private Company",
    "Non-Profit Organization",
    "Self-Employment",
    "Military Service",
    "Contract Work",
    "Consulting",
    "Unemployment",
    "Other"
];
/**
 * Employment status options for dropdown
 */
exports.EMPLOYMENT_STATUS_OPTIONS = [
    "Full-time",
    "Part-time",
    "Contract",
    "Temporary",
    "Seasonal",
    "Volunteer",
    "Unemployed",
    "Other"
];
/**
 * Reason for leaving options for dropdown
 */
exports.REASON_FOR_LEAVING_OPTIONS = [
    "Resigned",
    "Terminated",
    "Laid Off",
    "Contract Ended",
    "Career Change",
    "Relocation",
    "Better Opportunity",
    "Education",
    "Family Reasons",
    "Retirement",
    "Still Employed",
    "Other"
];
// ============================================================================
// FACTORY FUNCTIONS
// ============================================================================
/**
 * Creates a default military employment entry (Section 13A.1)
 * Maps to the correct PDF field names from section-13.json
 */
/**
 * Creates a default non-federal employment entry (Section 13A.2)
 * Maps to the correct PDF field names from section-13.json
 */
/**
 * Creates a default self-employment entry (Section 13A.3)
 * Maps to the correct PDF field names from section-13.json
 */
/**
 * Creates a default unemployment entry (Section 13A.4)
 * Maps to the correct PDF field names from section-13.json
 */
/**
 * Creates a default Section 13 data structure using DRY approach with sections-references
 * This eliminates hardcoded values and uses the single source of truth
 */
// ============================================================================
// UPDATE FUNCTIONS
// ============================================================================
// Note: updateSection13Field has been moved to the context file (section13.tsx)
// ============================================================================
// VALIDATION FUNCTIONS
// ============================================================================
/**
 * Validates employment dates
 */
// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================
/**
 * Formats employment date for display
 */
/**
 * Calculates employment duration in months
 */
