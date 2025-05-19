/**
 * Military Specialized Data Mapping Utility
 * 
 * This utility provides specialized mapping functions for military-specific data like
 * rank/grade, military occupational specialties (MOS), deployment history, and awards/decorations.
 * It extends the core military history mapping functionality.
 */

import { type FieldMetadata } from 'api/interfaces/FieldMetadata';
import { 
  type MilitaryServiceEntry,
  type ForeignServiceEntry,
} from 'api/interfaces/sections/militaryHistoryInfo';
import { type Field } from 'api/interfaces/formDefinition';

// Military branch mapping (numeric codes to readable names)
export const BRANCH_MAPPING = {
  '1': 'Army',
  '2': 'Army National Guard',
  '3': 'Navy',
  '4': 'Air Force',
  '5': 'Air National Guard',
  '6': 'Marine Corps',
  '7': 'Coast Guard'
};

// Discharge type mapping (numeric codes to readable names)
export const DISCHARGE_TYPE_MAPPING = {
  '1': 'Honorable',
  '2': 'General',
  '3': 'Other Than Honorable',
  '4': 'Bad Conduct',
  '5': 'Dishonorable',
  '6': 'Other'
};

// Status mapping (numeric codes to readable names)
export const STATUS_MAPPING = {
  '1': 'Active Duty',
  '2': 'Active Reserve',
  '3': 'Inactive Reserve'
};

// Officer/Enlisted mapping (numeric codes to readable names)
export const OFFICER_ENLISTED_MAPPING = {
  '1': 'Not Applicable',
  '2': 'Officer',
  '3': 'Enlisted'
};

// Foreign military organization type mapping
export const FOREIGN_ORG_TYPE_MAPPING = {
  '1': 'Military',
  '2': 'Intelligence Service',
  '3': 'Diplomatic Service',
  '4': 'Security Forces',
  '5': 'Militia',
  '6': 'Other Defense Forces',
  '7': 'Other'
};

/**
 * Get human-readable military branch name from numeric code
 * 
 * @param code - Numeric branch code ('1'-'7')
 * @returns Human-readable branch name
 */
export function getBranchName(code: string): string {
  return BRANCH_MAPPING[code as keyof typeof BRANCH_MAPPING] || 'Unknown';
}

/**
 * Get human-readable discharge type from numeric code
 * 
 * @param code - Numeric discharge type code ('1'-'6')
 * @returns Human-readable discharge type
 */
export function getDischargeTypeName(code: string): string {
  return DISCHARGE_TYPE_MAPPING[code as keyof typeof DISCHARGE_TYPE_MAPPING] || 'Unknown';
}

/**
 * Get human-readable status name from numeric code
 * 
 * @param code - Numeric status code ('1'-'3')
 * @returns Human-readable status
 */
export function getStatusName(code: string): string {
  return STATUS_MAPPING[code as keyof typeof STATUS_MAPPING] || 'Unknown';
}

/**
 * Get human-readable officer/enlisted status from numeric code
 * 
 * @param code - Numeric code ('1'-'3')
 * @returns Human-readable officer/enlisted description
 */
export function getOfficerEnlistedName(code: string): string {
  return OFFICER_ENLISTED_MAPPING[code as keyof typeof OFFICER_ENLISTED_MAPPING] || 'Unknown';
}

/**
 * Get human-readable foreign organization type from numeric code
 * 
 * @param code - Numeric code ('1'-'7')
 * @returns Human-readable organization type
 */
export function getForeignOrgTypeName(code: string): string {
  return FOREIGN_ORG_TYPE_MAPPING[code as keyof typeof FOREIGN_ORG_TYPE_MAPPING] || 'Unknown';
}

/**
 * Format military service data with human-readable values
 * 
 * @param entry - Military service entry with coded values
 * @returns Enhanced entry with human-readable display values
 */
export function formatMilitaryServiceForDisplay(entry: MilitaryServiceEntry): MilitaryServiceEntry & {
  display: {
    branchName: string;
    statusName: string;
    officerEnlistedName: string;
    dischargeTypeName?: string;
  }
} {
  return {
    ...entry,
    display: {
      branchName: getBranchName(entry.branch.value),
      statusName: getStatusName(entry.status.value),
      officerEnlistedName: getOfficerEnlistedName(entry.officerOrEnlisted.value),
      dischargeTypeName: entry.typeOfDischarge ? getDischargeTypeName(entry.typeOfDischarge.value) : undefined
    }
  };
}

/**
 * Format foreign service data with human-readable values
 * 
 * @param entry - Foreign service entry with coded values
 * @returns Enhanced entry with human-readable display values
 */
export function formatForeignServiceForDisplay(entry: ForeignServiceEntry): ForeignServiceEntry & {
  display: {
    organizationTypeName: string;
  }
} {
  return {
    ...entry,
    display: {
      organizationTypeName: getForeignOrgTypeName(entry.organizationType.value)
    }
  };
}

/**
 * Validate military service dates (from/to dates are valid, from is before to unless present)
 * 
 * @param entry - Military service entry to validate
 * @returns Validation result with error messages if any
 */
export function validateMilitaryServiceDates(entry: MilitaryServiceEntry): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];
  
  // Validate service from date format (if not empty)
  if (entry.serviceFromDate.value && !isValidDateFormat(entry.serviceFromDate.value)) {
    errors.push('Service from date must be in MM/YYYY format');
  }
  
  // If present is not checked, validate to date
  if (entry.present.value !== 'Yes') {
    if (entry.serviceToDate.value && !isValidDateFormat(entry.serviceToDate.value)) {
      errors.push('Service to date must be in MM/YYYY format');
    }
    
    // Check if from date is before to date (if both are valid dates)
    if (isValidDateFormat(entry.serviceFromDate.value) && 
        isValidDateFormat(entry.serviceToDate.value) &&
        !isDateBeforeDate(entry.serviceFromDate.value, entry.serviceToDate.value)) {
      errors.push('Service from date must be before service to date');
    }
  }
  
  // If discharged, validate discharge date
  if (entry.discharged.value === 'YES' && entry.dischargeDate) {
    if (!isValidDateFormat(entry.dischargeDate.value)) {
      errors.push('Discharge date must be in MM/YYYY format');
    }
    
    // Check if discharge date is after from date and before to date (if applicable)
    if (isValidDateFormat(entry.serviceFromDate.value) && 
        isValidDateFormat(entry.dischargeDate.value) &&
        !isDateBeforeDate(entry.serviceFromDate.value, entry.dischargeDate.value)) {
      errors.push('Discharge date must be after service from date');
    }
    
    if (entry.present.value !== 'Yes' && 
        isValidDateFormat(entry.serviceToDate.value) && 
        isValidDateFormat(entry.dischargeDate.value) &&
        !isDateBeforeDate(entry.dischargeDate.value, entry.serviceToDate.value)) {
      errors.push('Discharge date must be before or equal to service to date');
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Validate a date string format (MM/YYYY)
 * 
 * @param dateStr - Date string to validate
 * @returns Whether the date is in valid MM/YYYY format
 */
export function isValidDateFormat(dateStr: string): boolean {
  // Check MM/YYYY format using regex
  const regex = /^(0[1-9]|1[0-2])\/\d{4}$/;
  return regex.test(dateStr);
}

/**
 * Check if date1 is before date2 (in MM/YYYY format)
 * 
 * @param date1 - First date in MM/YYYY format
 * @param date2 - Second date in MM/YYYY format
 * @returns Whether date1 is before date2
 */
export function isDateBeforeDate(date1: string, date2: string): boolean {
  if (!isValidDateFormat(date1) || !isValidDateFormat(date2)) {
    return false;
  }
  
  const [month1, year1] = date1.split('/').map(part => parseInt(part, 10));
  const [month2, year2] = date2.split('/').map(part => parseInt(part, 10));
  
  if (year1 < year2) {
    return true;
  } else if (year1 === year2) {
    return month1 < month2;
  } else {
    return false;
  }
}

/**
 * Validate discharge type and reason (ensure consistency)
 * 
 * @param entry - Military service entry to validate
 * @returns Validation result with error messages if any
 */
export function validateDischarge(entry: MilitaryServiceEntry): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];
  
  // If discharged, validate discharge type
  if (entry.discharged.value === 'YES') {
    // If type of discharge is "Other", ensure discharge type other is provided
    if (entry.typeOfDischarge?.value === '6' && 
        (!entry.dischargeTypeOther || !entry.dischargeTypeOther.value.trim())) {
      errors.push('Please specify other discharge type');
    }
    
    // If discharge type is not honorable, ensure discharge reason is provided
    if (entry.typeOfDischarge?.value !== '1' && 
        (!entry.dischargeReason || !entry.dischargeReason.value.trim())) {
      errors.push('Please provide reason for discharge');
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Generate summary text for military service
 * 
 * @param entry - Military service entry to summarize
 * @returns Human-readable summary text
 */
export function generateMilitaryServiceSummary(entry: MilitaryServiceEntry): string {
  const branchName = getBranchName(entry.branch.value);
  const statusName = getStatusName(entry.status.value);
  const officerEnlistedName = getOfficerEnlistedName(entry.officerOrEnlisted.value);
  
  let summary = `${officerEnlistedName} in the ${branchName}, ${statusName}`;
  
  // Add state information for National Guard
  if ((entry.branch.value === '2' || entry.branch.value === '5') && entry.stateOfService) {
    summary += ` (${entry.stateOfService.value})`;
  }
  
  // Add service period
  summary += `, from ${entry.serviceFromDate.value}`;
  
  if (entry.present.value === 'Yes') {
    summary += ' to present';
  } else if (entry.serviceToDate.value) {
    summary += ` to ${entry.serviceToDate.value}`;
  }
  
  // Add discharge information if applicable
  if (entry.discharged.value === 'YES' && entry.typeOfDischarge) {
    const dischargeTypeName = getDischargeTypeName(entry.typeOfDischarge.value);
    summary += `. ${dischargeTypeName} discharge`;
    
    if (entry.dischargeDate) {
      summary += ` on ${entry.dischargeDate.value}`;
    }
  }
  
  return summary;
}

/**
 * Generate summary text for foreign military service
 * 
 * @param entry - Foreign service entry to summarize
 * @returns Human-readable summary text
 */
export function generateForeignServiceSummary(entry: ForeignServiceEntry): string {
  const orgTypeName = getForeignOrgTypeName(entry.organizationType.value);
  
  let summary = `Served in ${entry.country.value} ${orgTypeName}`;
  
  // Add organization name if available
  if (entry.organizationName.value) {
    summary += ` (${entry.organizationName.value})`;
  }
  
  // Add service period
  summary += `, from ${entry.periodOfServiceFrom.value}`;
  
  if (entry.present.value === 'Yes') {
    summary += ' to present';
  } else if (entry.periodOfServiceTo.value) {
    summary += ` to ${entry.periodOfServiceTo.value}`;
  }
  
  // Add highest rank if available
  if (entry.highestRank.value) {
    summary += `. Highest rank: ${entry.highestRank.value}`;
  }
  
  // Add contact maintenance information
  if (entry.maintainsContact.value === 'YES') {
    summary += `. Maintains contact with ${entry.contacts.length} personnel`;
  }
  
  return summary;
} 