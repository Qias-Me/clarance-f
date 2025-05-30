/**
 * Section 7: Where You Have Lived (Residence History)
 *
 * TypeScript interface definitions for SF-86 Section 7 residence history data structure.
 * Based on the established Field<T> interface patterns and PDF field ID mappings.
 */

import type { Field } from '../formDefinition2.0';

// ============================================================================
// CORE INTERFACES
// ============================================================================

/**
 * Address interface for residence entries
 */
export interface Address {
  street: Field<string>;
  city: Field<string>;
  state: Field<string>;
  zipCode: Field<string>;
  country: Field<string>;
}

/**
 * Date range interface with estimation support
 */
export interface DateRange {
  from: {
    date: Field<string>;
    estimated: Field<boolean>;
  };
  to: {
    date: Field<string>;
    estimated: Field<boolean>;
  };
  present: Field<boolean>;
}

/**
 * Verification contact information
 */
export interface VerificationContact {
  name: Field<string>;
  phone: Field<string>;
  email: Field<string>;
  relationship: Field<string>;
}

/**
 * Individual residence entry
 */
export interface ResidenceEntry {
  _id: number | string;
  address: Address;
  dateRange: DateRange;
  residenceType: Field<'OWN' | 'RENT' | 'MILITARY' | 'OTHER'>;
  verificationSource: VerificationContact;
  additionalInfo: Field<string>;
}

/**
 * Section 7 main data structure
 */
export interface Section7 {
  _id: number;
  residenceHistory: {
    hasLivedAtCurrentAddressFor3Years: Field<"YES" | "NO">;
    entries: ResidenceEntry[];
  };
}

// ============================================================================
// SUBSECTION TYPES
// ============================================================================

/**
 * Section 7 subsection keys for type safety
 */
export type Section7SubsectionKey = 'residenceHistory';

// ============================================================================
// VALIDATION INTERFACES
// ============================================================================

/**
 * Validation rules specific to Section 7
 */
export interface Section7ValidationRules {
  requiresResidenceHistory: boolean;
  minimumResidenceEntries: number;
  maximumResidenceEntries: number;
  requiresVerificationContact: boolean;
  allowsEstimatedDates: boolean;
}

/**
 * Section 7 validation context
 */
export interface Section7ValidationContext {
  currentDate: Date;
  minimumCoverageYears: number;
  rules: Section7ValidationRules;
}

// ============================================================================
// FIELD ID MAPPINGS
// ============================================================================

/**
 * PDF field ID patterns for Section 7
 * Based on the Sections7-9 pattern from the JSON reference
 */
export const SECTION7_FIELD_IDS = {
  // Main question
  HAS_LIVED_AT_CURRENT_ADDRESS: "form1[0].Sections7-9[0].RadioButtonList[0]",

  // Entry field patterns (indexed by entry number)
  ENTRY_PATTERNS: {
    STREET: (entryIndex: number) => `form1[0].Sections7-9[0].TextField[${entryIndex * 10}]`,
    CITY: (entryIndex: number) => `form1[0].Sections7-9[0].TextField[${entryIndex * 10 + 1}]`,
    STATE: (entryIndex: number) => `form1[0].Sections7-9[0].DropDownList[${entryIndex}]`,
    ZIP_CODE: (entryIndex: number) => `form1[0].Sections7-9[0].TextField[${entryIndex * 10 + 2}]`,
    COUNTRY: (entryIndex: number) => `form1[0].Sections7-9[0].TextField[${entryIndex * 10 + 3}]`,

    FROM_DATE: (entryIndex: number) => `form1[0].Sections7-9[0].DateField[${entryIndex * 2}]`,
    FROM_ESTIMATED: (entryIndex: number) => `form1[0].Sections7-9[0].CheckBox[${entryIndex * 6}]`,
    TO_DATE: (entryIndex: number) => `form1[0].Sections7-9[0].DateField[${entryIndex * 2 + 1}]`,
    TO_ESTIMATED: (entryIndex: number) => `form1[0].Sections7-9[0].CheckBox[${entryIndex * 6 + 1}]`,
    PRESENT: (entryIndex: number) => `form1[0].Sections7-9[0].CheckBox[${entryIndex * 6 + 2}]`,

    RESIDENCE_TYPE: (entryIndex: number) => `form1[0].Sections7-9[0].DropDownList[${entryIndex + 100}]`,

    VERIFICATION_NAME: (entryIndex: number) => `form1[0].Sections7-9[0].TextField[${entryIndex * 10 + 4}]`,
    VERIFICATION_PHONE: (entryIndex: number) => `form1[0].Sections7-9[0].TextField[${entryIndex * 10 + 5}]`,
    VERIFICATION_EMAIL: (entryIndex: number) => `form1[0].Sections7-9[0].TextField[${entryIndex * 10 + 6}]`,
    VERIFICATION_RELATIONSHIP: (entryIndex: number) => `form1[0].Sections7-9[0].TextField[${entryIndex * 10 + 7}]`,

    ADDITIONAL_INFO: (entryIndex: number) => `form1[0].Sections7-9[0].TextArea[${entryIndex}]`
  }
} as const;

// ============================================================================
// HELPER TYPES
// ============================================================================

/**
 * Residence type options
 */
export const RESIDENCE_TYPES = {
  OWN: 'Own',
  RENT: 'Rent',
  MILITARY: 'Military Housing',
  OTHER: 'Other'
} as const;

/**
 * Common relationship types for verification contacts
 */
export const VERIFICATION_RELATIONSHIPS = {
  LANDLORD: 'Landlord',
  PROPERTY_MANAGER: 'Property Manager',
  NEIGHBOR: 'Neighbor',
  FRIEND: 'Friend',
  FAMILY_MEMBER: 'Family Member',
  EMPLOYER: 'Employer',
  OTHER: 'Other'
} as const;

// ============================================================================
// UTILITY TYPES
// ============================================================================

/**
 * Type for creating new residence entries
 */
export type CreateResidenceEntryParams = {
  entryIndex: number;
  defaultCountry?: string;
};

/**
 * Type for residence entry updates
 */
export type ResidenceEntryUpdate = {
  entryIndex: number;
  fieldPath: string;
  newValue: any;
};

/**
 * Type for bulk residence entry operations
 */
export type BulkResidenceOperation = {
  operation: 'add' | 'remove' | 'update' | 'move';
  entryIndex?: number;
  targetIndex?: number;
  data?: Partial<ResidenceEntry>;
};
