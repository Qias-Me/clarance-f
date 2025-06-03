/**
 * Section 20: Foreign Activities
 *
 * TypeScript interface definitions for SF-86 Section 20 (Foreign Activities) data structure.
 * Based on the established Field<T> interface patterns and PDF field ID mappings from section-20.json.
 *
 * This section covers foreign financial interests, foreign business activities, and foreign travel.
 * It includes subsections for:
 * - 20A: Foreign Financial Interests (stocks, property, investments, bank accounts)
 * - 20B: Foreign Business/Professional Activities
 * - 20C: Foreign Travel
 */

import type { Field } from '../formDefinition2.0';
import { createFieldFromReference } from '../../utils/sections-references-loader';

// ============================================================================
// SHARED HELPER TYPES
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
  suffix?: Field<string>;
}

/**
 * Value information with estimation flag for financial amounts
 */
export interface ValueInfo {
  amount: Field<string>;
  estimated: Field<boolean>;
}

/**
 * Ownership type for foreign financial interests
 */
export interface OwnershipType {
  _id: number;
  type: Field<'Yourself' | 'Spouse or legally recognized civil union/domestic partner' | 'Cohabitant' | 'Dependent children'>;
}

/**
 * Co-owner information for foreign financial interests
 */
export interface CoOwner {
  _id: number;
  name: NameInfo;
  address: Address;
  citizenships: Citizenship[];
  relationship: Field<string>;
}

/**
 * Citizenship information
 */
export interface Citizenship {
  _id: number;
  country: Field<string>;
}

/**
 * Foreign Financial Interest Entry (20A)
 */
export interface ForeignFinancialInterestEntry {
  _id: number;

  // Ownership information
  ownershipTypes: OwnershipType[];

  // Financial interest details
  financialInterestType: Field<string>;
  description: Field<string>;

  // Acquisition information
  dateAcquired: DateInfo;
  howAcquired: Field<string>;
  costAtAcquisition: ValueInfo;

  // Current status
  currentValue: ValueInfo;
  dateControlRelinquished?: DateInfo;
  disposalExplanation?: Field<string>;
  isCurrentlyOwned: Field<'YES' | 'NO'>;

  // Co-ownership
  hasCoOwners: Field<'YES' | 'NO'>;
  coOwners: CoOwner[];
}

/**
 * Foreign Business Activity Entry (20B)
 */
export interface ForeignBusinessEntry {
  _id: number;

  // Business details
  businessDescription: Field<string>;
  businessType: Field<string>;
  country: Field<string>;

  // Individual/Organization information
  individualName?: NameInfo;
  organizationName?: Field<string>;

  // Timeline
  dateFrom: DateInfo;
  dateTo: DateInfo;
  isOngoing: Field<'YES' | 'NO'>;

  // Compensation
  receivedCompensation: Field<'YES' | 'NO'>;
  compensationDetails?: Field<string>;

  // Additional details
  circumstances: Field<string>;
}

/**
 * Foreign Travel Entry (20C)
 */
export interface ForeignTravelEntry {
  _id: number;

  // Travel details
  countryVisited: Field<string>;
  travelDates: {
    from: DateInfo;
    to: DateInfo;
  };
  numberOfDays: Field<number>;
  purposeOfTravel: Field<string>;

  // Security-related questions
  questionedOrSearched: Field<'YES' | 'NO'>;
  questionedOrSearchedExplanation?: Field<string>;

  encounterWithPolice: Field<'YES' | 'NO'>;
  encounterWithPoliceExplanation?: Field<string>;

  contactWithForeignIntelligence: Field<'YES' | 'NO'>;
  contactWithForeignIntelligenceExplanation?: Field<string>;

  counterintelligenceIssues: Field<'YES' | 'NO'>;
  counterintelligenceIssuesExplanation?: Field<string>;

  contactExhibitingInterest: Field<'YES' | 'NO'>;
  contactExhibitingInterestExplanation?: Field<string>;

  contactAttemptingToObtainInfo: Field<'YES' | 'NO'>;
  contactAttemptingToObtainInfoExplanation?: Field<string>;
}

// ============================================================================
// SUBSECTION INTERFACES
// ============================================================================

/**
 * Foreign Financial Interests Subsection (20A)
 */
export interface ForeignFinancialInterestsSubsection {
  hasForeignFinancialInterests: Field<'YES' | 'NO'>;
  entries: ForeignFinancialInterestEntry[];
  entriesCount: number;
}

/**
 * Foreign Business Activities Subsection (20B)
 */
export interface ForeignBusinessActivitiesSubsection {
  hasForeignBusinessActivities: Field<'YES' | 'NO'>;
  entries: ForeignBusinessEntry[];
  entriesCount: number;
}

/**
 * Foreign Travel Subsection (20C)
 */
export interface ForeignTravelSubsection {
  hasForeignTravel: Field<'YES' | 'NO'>;
  entries: ForeignTravelEntry[];
  entriesCount: number;
}

/**
 * Foreign Activities main structure
 */
export interface ForeignActivities {
  // 20A: Foreign Financial Interests
  foreignFinancialInterests: ForeignFinancialInterestsSubsection;

  // 20B: Foreign Business Activities
  foreignBusinessActivities: ForeignBusinessActivitiesSubsection;

  // 20C: Foreign Travel
  foreignTravel: ForeignTravelSubsection;
}

/**
 * Section 20 main data structure
 */
export interface Section20 {
  _id: number;
  section20: ForeignActivities;
}

// ============================================================================
// SUBSECTION TYPES
// ============================================================================

/**
 * Section 20 subsection keys for type safety
 */
export type Section20SubsectionKey =
  | 'foreignFinancialInterests'
  | 'foreignBusinessActivities'
  | 'foreignTravel';

/**
 * Entry types for Section 20
 */
export type Section20EntryType =
  | 'foreign_financial_interest'
  | 'foreign_business_activity'
  | 'foreign_travel';

// ============================================================================
// VALIDATION INTERFACES
// ============================================================================

/**
 * Validation rules specific to Section 20
 */
export interface Section20ValidationRules {
  requiresExplanation: boolean;
  requiresAmount: boolean;
  requiresDate: boolean;
  requiresAddress: boolean;
  maxDescriptionLength: number;
  maxExplanationLength: number;
  allowsFutureDate: boolean;
}

/**
 * Section 20 validation context
 */
export interface Section20ValidationContext {
  currentDate: Date;
  rules: Section20ValidationRules;
  requiresDocumentation: boolean;
}

// ============================================================================
// FIELD ID MAPPINGS (Based on section-20.json)
// ============================================================================

/**
 * PDF field ID mappings for Section 20 (Foreign Activities)
 * Based on the actual field IDs from section-20.json (4-digit format)
 */
export const SECTION20_FIELD_IDS = {
  // Main question
  MAIN_RADIO_BUTTON: "16830", // form1[0].Section20a[0].RadioButtonList[0]

  // Co-owner fields
  CO_OWNER_FIRST_NAME: "13474", // form1[0].Section20a[0].TextField11[6]
  CO_OWNER_MIDDLE_NAME: "13476", // form1[0].Section20a[0].TextField11[4]
  CO_OWNER_LAST_NAME: "13475", // form1[0].Section20a[0].TextField11[5]
  CO_OWNER_SUFFIX: "13477", // form1[0].Section20a[0].suffix[0]
  CO_OWNER_RELATIONSHIP: "13473", // form1[0].Section20a[0].TextField11[7]

  // Address fields
  CO_OWNER_STREET: "13437", // form1[0].Section20a[0].#area[0].TextField11[1]
  CO_OWNER_CITY: "13436", // form1[0].Section20a[0].#area[0].TextField11[2]
  CO_OWNER_STATE: "13435", // form1[0].Section20a[0].#area[0].School6_State[0]
  CO_OWNER_ZIP: "13478", // form1[0].Section20a[0].#area[0].TextField11[3]
  CO_OWNER_COUNTRY: "13434", // form1[0].Section20a[0].#area[0].DropDownList40[0]

  // Citizenship fields
  CO_OWNER_CITIZENSHIP_1: "13441", // form1[0].Section20a[0].DropDownList12[0]
  CO_OWNER_CITIZENSHIP_2: "13440", // form1[0].Section20a[0].DropDownList12[1]

  // Financial details
  FINANCIAL_INTEREST_TYPE: "13468", // form1[0].Section20a[0].TextField11[8]
  ACQUISITION_COST: "13467", // form1[0].Section20a[0].NumericField1[0]
  CURRENT_VALUE: "13465", // form1[0].Section20a[0].NumericField1[1]
  HOW_ACQUIRED: "13442", // form1[0].Section20a[0].TextField11[0]

  // Ownership checkboxes
  OWNERSHIP_YOURSELF: "13469", // form1[0].Section20a[0].#field[20]
  OWNERSHIP_SPOUSE: "13470", // form1[0].Section20a[0].#field[19]
  OWNERSHIP_COHABITANT: "13471", // form1[0].Section20a[0].#field[18]
  OWNERSHIP_DEPENDENT: "13472", // form1[0].Section20a[0].#field[17]

  // Date fields
  ACQUISITION_DATE: "13462", // form1[0].Section20a[0].From_Datefield_Name_2[0]
  DISPOSAL_DATE: "13460", // form1[0].Section20a[0].From_Datefield_Name_2[1]

  // Estimate checkboxes
  COST_ESTIMATE: "13466", // form1[0].Section20a[0].#field[23]
  VALUE_ESTIMATE: "13464", // form1[0].Section20a[0].#field[25]

  // Control relinquished
  CONTROL_RELINQUISHED: "16832" // form1[0].Section20a[0].RadioButtonList[1]
} as const;

// ============================================================================
// HELPER TYPES
// ============================================================================

/**
 * Type for Section 20 field updates
 */
export type Section20FieldUpdate = {
  subsectionKey: Section20SubsectionKey;
  entryIndex?: number;
  fieldPath: string;
  newValue: any;
};

/**
 * Type for foreign activities validation results
 */
export type ForeignActivitiesValidationResult = {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  missingRequiredFields: string[];
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Creates a default Section 20 data structure using DRY approach with sections-references
 * This eliminates hardcoded values and uses the single source of truth
 */
export const createDefaultSection20 = (): Section20 => ({
  _id: 20,
  section20: {
    foreignFinancialInterests: {
      hasForeignFinancialInterests: createFieldFromReference(20, 'form1[0].Section20a[0].RadioButtonList[0]', 'NO'),
      entries: [],
      entriesCount: 0
    },
    foreignBusinessActivities: {
      hasForeignBusinessActivities: createFieldFromReference(20, 'foreign_business_flag', 'NO'),
      entries: [],
      entriesCount: 0
    },
    foreignTravel: {
      hasForeignTravel: createFieldFromReference(20, 'foreign_travel_flag', 'NO'),
      entries: [],
      entriesCount: 0
    }
  }
});

/**
 * Creates a default foreign financial interest entry
 */
export const createDefaultForeignFinancialInterestEntry = (): ForeignFinancialInterestEntry => ({
  _id: Date.now(),
  ownershipTypes: [],
  financialInterestType: createFieldFromReference(20, SECTION20_FIELD_IDS.FINANCIAL_INTEREST_TYPE, ''),
  description: createFieldFromReference(20, 'description', ''),
  dateAcquired: {
    date: createFieldFromReference(20, SECTION20_FIELD_IDS.ACQUISITION_DATE, ''),
    estimated: createFieldFromReference(20, 'acquisition_date_estimated', false)
  },
  howAcquired: createFieldFromReference(20, SECTION20_FIELD_IDS.HOW_ACQUIRED, ''),
  costAtAcquisition: {
    amount: createFieldFromReference(20, SECTION20_FIELD_IDS.ACQUISITION_COST, ''),
    estimated: createFieldFromReference(20, SECTION20_FIELD_IDS.COST_ESTIMATE, false)
  },
  currentValue: {
    amount: createFieldFromReference(20, SECTION20_FIELD_IDS.CURRENT_VALUE, ''),
    estimated: createFieldFromReference(20, SECTION20_FIELD_IDS.VALUE_ESTIMATE, false)
  },
  isCurrentlyOwned: createFieldFromReference(20, 'currently_owned', 'YES'),
  hasCoOwners: createFieldFromReference(20, 'has_co_owners', 'NO'),
  coOwners: []
});

/**
 * Creates a default co-owner entry
 */
export const createDefaultCoOwner = (): CoOwner => ({
  _id: Date.now(),
  name: {
    first: createFieldFromReference(20, SECTION20_FIELD_IDS.CO_OWNER_FIRST_NAME, ''),
    middle: createFieldFromReference(20, SECTION20_FIELD_IDS.CO_OWNER_MIDDLE_NAME, ''),
    last: createFieldFromReference(20, SECTION20_FIELD_IDS.CO_OWNER_LAST_NAME, ''),
    suffix: createFieldFromReference(20, SECTION20_FIELD_IDS.CO_OWNER_SUFFIX, '')
  },
  address: {
    street: createFieldFromReference(20, SECTION20_FIELD_IDS.CO_OWNER_STREET, ''),
    city: createFieldFromReference(20, SECTION20_FIELD_IDS.CO_OWNER_CITY, ''),
    state: createFieldFromReference(20, SECTION20_FIELD_IDS.CO_OWNER_STATE, ''),
    zipCode: createFieldFromReference(20, SECTION20_FIELD_IDS.CO_OWNER_ZIP, ''),
    country: createFieldFromReference(20, SECTION20_FIELD_IDS.CO_OWNER_COUNTRY, 'United States')
  },
  citizenships: [],
  relationship: createFieldFromReference(20, SECTION20_FIELD_IDS.CO_OWNER_RELATIONSHIP, '')
});

/**
 * Creates a default foreign business entry
 */
export const createDefaultForeignBusinessEntry = (): ForeignBusinessEntry => ({
  _id: Date.now(),
  businessDescription: createFieldFromReference(20, 'business_description', ''),
  businessType: createFieldFromReference(20, 'business_type', ''),
  country: createFieldFromReference(20, 'business_country', ''),
  dateFrom: {
    date: createFieldFromReference(20, 'business_date_from', ''),
    estimated: createFieldFromReference(20, 'business_date_from_estimated', false)
  },
  dateTo: {
    date: createFieldFromReference(20, 'business_date_to', ''),
    estimated: createFieldFromReference(20, 'business_date_to_estimated', false)
  },
  isOngoing: createFieldFromReference(20, 'business_ongoing', 'NO'),
  receivedCompensation: createFieldFromReference(20, 'received_compensation', 'NO'),
  circumstances: createFieldFromReference(20, 'business_circumstances', '')
});

/**
 * Creates a default foreign travel entry
 */
export const createDefaultForeignTravelEntry = (): ForeignTravelEntry => ({
  _id: Date.now(),
  countryVisited: createFieldFromReference(20, 'travel_country', ''),
  travelDates: {
    from: {
      date: createFieldFromReference(20, 'travel_date_from', ''),
      estimated: createFieldFromReference(20, 'travel_date_from_estimated', false)
    },
    to: {
      date: createFieldFromReference(20, 'travel_date_to', ''),
      estimated: createFieldFromReference(20, 'travel_date_to_estimated', false)
    }
  },
  numberOfDays: createFieldFromReference(20, 'travel_days', 0),
  purposeOfTravel: createFieldFromReference(20, 'travel_purpose', ''),
  questionedOrSearched: createFieldFromReference(20, 'questioned_searched', 'NO'),
  encounterWithPolice: createFieldFromReference(20, 'encounter_police', 'NO'),
  contactWithForeignIntelligence: createFieldFromReference(20, 'contact_intelligence', 'NO'),
  counterintelligenceIssues: createFieldFromReference(20, 'counterintelligence_issues', 'NO'),
  contactExhibitingInterest: createFieldFromReference(20, 'contact_exhibiting_interest', 'NO'),
  contactAttemptingToObtainInfo: createFieldFromReference(20, 'contact_attempting_info', 'NO')
});

/**
 * Updates a specific field in the Section 20 data structure
 */
export const updateSection20Field = (
  section20Data: Section20,
  update: Section20FieldUpdate
): Section20 => {
  const { subsectionKey, entryIndex, fieldPath, newValue } = update;
  const newData = { ...section20Data };

  // Update subsection flag
  if (fieldPath === 'hasForeignFinancialInterests' && subsectionKey === 'foreignFinancialInterests') {
    newData.section20.foreignFinancialInterests.hasForeignFinancialInterests.value = newValue;
    return newData;
  }
  if (fieldPath === 'hasForeignBusinessActivities' && subsectionKey === 'foreignBusinessActivities') {
    newData.section20.foreignBusinessActivities.hasForeignBusinessActivities.value = newValue;
    return newData;
  }
  if (fieldPath === 'hasForeignTravel' && subsectionKey === 'foreignTravel') {
    newData.section20.foreignTravel.hasForeignTravel.value = newValue;
    return newData;
  }

  // Update entry field
  if (entryIndex !== undefined && newData.section20[subsectionKey].entries[entryIndex]) {
    const entry = { ...newData.section20[subsectionKey].entries[entryIndex] };

    // Handle nested field paths
    const pathParts = fieldPath.split('.');
    let current: any = entry;

    for (let i = 0; i < pathParts.length - 1; i++) {
      if (!current[pathParts[i]]) {
        current[pathParts[i]] = {};
      }
      current = current[pathParts[i]];
    }

    const finalKey = pathParts[pathParts.length - 1];
    if (current[finalKey] && typeof current[finalKey] === 'object' && 'value' in current[finalKey]) {
      current[finalKey].value = newValue;
    } else {
      current[finalKey] = newValue;
    }

    newData.section20[subsectionKey].entries[entryIndex] = entry;
  }

  return newData;
};

/**
 * Validates a foreign financial interest entry
 */
export function validateForeignFinancialInterestEntry(
  entry: ForeignFinancialInterestEntry,
  context: Section20ValidationContext
): ForeignActivitiesValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const missingRequiredFields: string[] = [];

  // Required field validation
  if (!entry.financialInterestType?.value?.trim()) {
    missingRequiredFields.push('financialInterestType');
    errors.push('Financial interest type is required');
  }

  if (!entry.description?.value?.trim()) {
    missingRequiredFields.push('description');
    errors.push('Description is required');
  }

  if (!entry.dateAcquired?.date?.value?.trim()) {
    missingRequiredFields.push('dateAcquired');
    errors.push('Date acquired is required');
  }

  if (!entry.howAcquired?.value?.trim()) {
    missingRequiredFields.push('howAcquired');
    errors.push('How acquired is required');
  }

  // Ownership validation
  if (entry.ownershipTypes.length === 0) {
    missingRequiredFields.push('ownershipTypes');
    errors.push('At least one ownership type must be selected');
  }

  // Co-owner validation
  if (entry.hasCoOwners?.value === 'YES' && entry.coOwners.length === 0) {
    missingRequiredFields.push('coOwners');
    errors.push('Co-owners must be provided when indicated');
  }

  // Financial amount validation
  if (entry.costAtAcquisition?.amount?.value) {
    const cost = parseFloat(entry.costAtAcquisition.amount.value.replace(/[,$]/g, ''));
    if (isNaN(cost) || cost < 0) {
      errors.push('Cost at acquisition must be a valid positive number');
    }
  }

  if (entry.currentValue?.amount?.value) {
    const value = parseFloat(entry.currentValue.amount.value.replace(/[,$]/g, ''));
    if (isNaN(value) || value < 0) {
      errors.push('Current value must be a valid positive number');
    }
  }

  // Date validation
  if (entry.dateAcquired?.date?.value) {
    const acquiredDate = new Date(entry.dateAcquired.date.value);
    if (isNaN(acquiredDate.getTime())) {
      errors.push('Invalid acquisition date format');
    } else if (acquiredDate > context.currentDate) {
      errors.push('Date acquired cannot be in the future');
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    missingRequiredFields
  };
}

/**
 * Validates the entire Section 20
 */
export function validateSection20(
  section20Data: Section20,
  context: Section20ValidationContext
): ForeignActivitiesValidationResult {
  const allErrors: string[] = [];
  const allWarnings: string[] = [];
  const allMissingFields: string[] = [];

  // Validate foreign financial interests
  if (section20Data.section20.foreignFinancialInterests.hasForeignFinancialInterests.value === 'YES') {
    section20Data.section20.foreignFinancialInterests.entries.forEach((entry, index) => {
      const entryValidation = validateForeignFinancialInterestEntry(entry, context);

      entryValidation.errors.forEach((error: string) => {
        allErrors.push(`foreignFinancialInterests[${index}]: ${error}`);
      });

      entryValidation.warnings.forEach((warning: string) => {
        allWarnings.push(`foreignFinancialInterests[${index}]: ${warning}`);
      });

      entryValidation.missingRequiredFields.forEach((field: string) => {
        allMissingFields.push(`foreignFinancialInterests[${index}].${field}`);
      });
    });
  }

  // Validate foreign business activities
  if (section20Data.section20.foreignBusinessActivities.hasForeignBusinessActivities.value === 'YES') {
    section20Data.section20.foreignBusinessActivities.entries.forEach((entry, index) => {
      // For now, basic validation - can be expanded later
      if (!entry.businessDescription?.value?.trim()) {
        allErrors.push(`foreignBusinessActivities[${index}]: Business description is required`);
      }
      if (!entry.country?.value?.trim()) {
        allErrors.push(`foreignBusinessActivities[${index}]: Country is required`);
      }
    });
  }

  // Validate foreign travel
  if (section20Data.section20.foreignTravel.hasForeignTravel.value === 'YES') {
    section20Data.section20.foreignTravel.entries.forEach((entry, index) => {
      // For now, basic validation - can be expanded later
      if (!entry.countryVisited?.value?.trim()) {
        allErrors.push(`foreignTravel[${index}]: Country visited is required`);
      }
      if (!entry.purposeOfTravel?.value?.trim()) {
        allErrors.push(`foreignTravel[${index}]: Purpose of travel is required`);
      }
    });
  }

  return {
    isValid: allErrors.length === 0,
    errors: allErrors,
    warnings: allWarnings,
    missingRequiredFields: allMissingFields
  };
}

/**
 * Formats currency amount for display
 */
export const formatCurrency = (amount: string): string => {
  if (!amount) return '';

  const numericAmount = parseFloat(amount.replace(/[,$]/g, ''));
  if (isNaN(numericAmount)) return amount;

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(numericAmount);
};

/**
 * Calculates total value of foreign financial interests
 */
export const calculateTotalForeignFinancialValue = (section20Data: Section20): number => {
  let total = 0;

  section20Data.section20.foreignFinancialInterests.entries.forEach(entry => {
    if (entry.currentValue?.amount?.value) {
      const amount = parseFloat(entry.currentValue.amount.value.replace(/[,$]/g, ''));
      if (!isNaN(amount)) {
        total += amount;
      }
    }
  });

  return total;
};

/**
 * Gets all countries mentioned in foreign activities
 */
export const getForeignCountries = (section20Data: Section20): string[] => {
  const countries = new Set<string>();

  // From foreign financial interests (co-owners)
  section20Data.section20.foreignFinancialInterests.entries.forEach(entry => {
    entry.coOwners.forEach(coOwner => {
      coOwner.citizenships.forEach(citizenship => {
        if (citizenship.country.value.trim()) {
          countries.add(citizenship.country.value);
        }
      });
    });
  });

  // From foreign business activities
  section20Data.section20.foreignBusinessActivities.entries.forEach(entry => {
    if (entry.country?.value?.trim()) {
      countries.add(entry.country.value);
    }
  });

  // From foreign travel
  section20Data.section20.foreignTravel.entries.forEach(entry => {
    if (entry.countryVisited?.value?.trim()) {
      countries.add(entry.countryVisited.value);
    }
  });

  return Array.from(countries).sort();
};