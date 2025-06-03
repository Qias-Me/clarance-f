import { type Field } from "../formDefinition2.0";

// ============================================================================
// SECTION 19 RADIO BUTTON FIELD ID CONSTANTS
// ============================================================================

/**
 * PDF Field IDs for Section 19 Radio Buttons
 * These IDs use the standard format consistent with other sections
 * The ' 0 R' suffix is added only during PDF validation/application
 */
export const SECTION19_RADIO_FIELD_IDS = {
  /** 19.1 Foreign Contacts: form1[0].Section19_1[0].RadioButtonList[0] */
  FOREIGN_CONTACTS: "16873"
} as const;

/**
 * PDF Field Names for Section 19 Radio Buttons
 * These names correspond to the exact field names in the SF-86 PDF
 */
export const SECTION19_RADIO_FIELD_NAMES = {
  /** 19.1 Foreign Contacts */
  FOREIGN_CONTACTS: "form1[0].Section19_1[0].RadioButtonList[0]"
} as const;

/**
 * SF-86 Section 19: Foreign Activities Interface
 *
 * This interface represents the hierarchical structure of Section 19 (Foreign Activities)
 * which covers foreign contacts and relationships with foreign nationals.
 *
 * Structure: Section → Subsection → Entry → Fields
 * - 1 main subsection with foreign contact entries
 * - Each entry contains detailed information about foreign nationals
 * - Fields represent individual form fields with typed values
 *
 * PDF Field Distribution:
 * - Section19_1[0]: Foreign Contacts and Relationships
 *
 * Pages: 63-66 (4 pages total)
 * Total Fields: 277 fields
 */

// ============================================================================
// MAIN SECTION 19 INTERFACE
// ============================================================================

/**
 * Section 19: Foreign Activities - Radio Button Field ID Mapping
 *
 * PDF Field IDs for Radio Buttons:
 * - 19.1 Foreign Contacts: form1[0].Section19_1[0].RadioButtonList[0] → ID: "16873"
 *
 * All radio buttons use "YES" | "NO" values for proper PDF field mapping.
 * The ' 0 R' suffix is added only during PDF validation/application.
 */
export interface Section19 {
  /** Section identifier */
  _id: number;
  section19: {
    /** 19.1: Foreign Contacts and Relationships (Section19_1[0]) - 277 fields
     *  Radio Button: form1[0].Section19_1[0].RadioButtonList[0] (ID: 16873) */
    foreignContacts?: ForeignContactsSubsection;
  };
}

// ============================================================================
// SUBSECTION INTERFACES
// ============================================================================

/**
 * 19.1: Foreign Contacts and Relationships (Section19_1[0]) - 277 fields
 * Close and/or continuing contact with foreign nationals
 */
interface ForeignContactsSubsection {
  /** Yes/No question for this subsection */
  hasContact: Field<"YES" | "NO (If NO, proceed to Section 20A)">;

  /** Array of foreign contact entries */
  entries: ForeignContactEntry[];
}

// ============================================================================
// ENTRY INTERFACES
// ============================================================================

/**
 * Foreign Contact Entry - represents information about a foreign national contact
 */
interface ForeignContactEntry {
  /** Entry identifier */
  _id: number;

  /** Personal information about the foreign national */
  personalInfo: ForeignNationalPersonalInfo;

  /** Citizenship information */
  citizenship: CitizenshipInfo;

  /** Contact and relationship information */
  contact: ContactInfo;

  /** Employment information about the foreign national */
  employment: ForeignNationalEmployment;

  /** Government/military/intelligence relationships */
  governmentRelationship: GovernmentRelationshipInfo;

  /** Frequency and nature of contact */
  contactDetails: ContactDetailsInfo;
}

// ============================================================================
// FIELD GROUP INTERFACES
// ============================================================================

/**
 * Personal information about the foreign national
 */
interface ForeignNationalPersonalInfo {
  /** Full name of the foreign national */
  name: PersonName;

  /** Date of birth information */
  dateOfBirth: DateInfo;

  /** Place of birth information */
  placeOfBirth: PlaceOfBirth;

  /** Current address */
  address: Address;
}

/**
 * Person name structure
 */
interface PersonName {
  /** First name */
  first: Field<string>;

  /** Middle name */
  middle: Field<string>;

  /** Last name */
  last: Field<string>;

  /** Name suffix */
  suffix?: Field<string>;

  /** Unknown name checkbox */
  unknown: Field<boolean>;
}

/**
 * Date information structure
 */
interface DateInfo {
  /** Date value (Month/Day/Year format) */
  date: Field<string>;

  /** Estimate checkbox - if date is estimated */
  estimated: Field<boolean>;

  /** Unknown date checkbox */
  unknown: Field<boolean>;
}

/**
 * Place of birth information
 */
interface PlaceOfBirth {
  /** City of birth */
  city: Field<string>;

  /** Country of birth (dropdown) */
  country: Field<string>;

  /** Unknown place of birth checkbox */
  unknown: Field<boolean>;
}

/**
 * Address information
 */
interface Address {
  /** Street address */
  street: Field<string>;

  /** City */
  city: Field<string>;

  /** State/Province */
  state: Field<string>;

  /** ZIP/Postal code */
  zipCode: Field<string>;

  /** Country (dropdown) */
  country: Field<string>;
}

/**
 * Citizenship information about the foreign national
 */
interface CitizenshipInfo {
  /** Primary country of citizenship (dropdown) */
  country1: Field<string>;

  /** Secondary country of citizenship (dropdown) */
  country2?: Field<string>;

  /** Additional countries of citizenship */
  additionalCountries?: Field<string>;

  /** Unknown citizenship checkbox */
  unknown: Field<boolean>;
}

/**
 * Contact information for the foreign national
 */
interface ContactInfo {
  /** Phone number */
  phone: Field<string>;

  /** Email address */
  email: Field<string>;

  /** Correspondence address (if different from current address) */
  correspondenceAddress?: Address;

  /** Relationship to the applicant */
  relationship: Field<string>;

  /** Methods of correspondence */
  correspondenceMethods: Field<string>;
}

/**
 * Employment information about the foreign national
 */
interface ForeignNationalEmployment {
  /** Current employer name */
  employerName: Field<string>;

  /** Employer address */
  employerAddress: Address;

  /** Position/title */
  position: Field<string>;

  /** Employment dates */
  dateRange: DateRange;

  /** Unknown employer information checkbox */
  unknownEmployer: Field<boolean>;
}

/**
 * Government/military/intelligence relationship information
 */
interface GovernmentRelationshipInfo {
  /** Has relationship with foreign government */
  hasRelationship: Field<"YES" | "NO">;

  /** Description of the relationship */
  relationshipDescription: Field<string>;

  /** Type of government entity */
  entityType: Field<string>;

  /** Security clearance or access */
  securityAccess: Field<string>;
}

/**
 * Contact details and frequency information
 */
interface ContactDetailsInfo {
  /** First contact date */
  firstContact: DateInfo;

  /** Last contact date */
  lastContact: DateInfo;

  /** Frequency of contact */
  frequency: Field<string>;

  /** Nature of contact */
  natureOfContact: Field<string>;

  /** Circumstances of initial meeting */
  initialMeetingCircumstances: Field<string>;

  /** Other people present during contacts */
  otherPersonsPresent: Field<string>;

  /** Location(s) of contacts */
  contactLocations: Field<string>;

  /** Sponsored or arranged by */
  sponsoredBy: Field<string>;

  /** Purpose of contact */
  purpose: Field<string>;
}

/**
 * Date range structure used for employment and other periods
 */
interface DateRange {
  /** From date information */
  from: DateInfo;

  /** To date information */
  to: DateInfo;

  /** Present checkbox - if relationship is ongoing */
  present: Field<boolean>;
}

// ============================================================================
// SUBSECTION TYPES
// ============================================================================

/**
 * Section 19 subsection keys for type safety
 */
export type Section19SubsectionKey = "foreignContacts";

/**
 * Section 19 field types for validation
 */
export type Section19FieldType = 
  | "text" | "textarea" | "select" | "checkbox" | "radio" 
  | "date" | "email" | "phone" | "country" | "address";

/**
 * Section 19 entry types
 */
export type Section19EntryType = "foreignContact";

// ============================================================================
// UTILITY TYPES
// ============================================================================

/**
 * Type for creating new foreign contact entries
 */
export type CreateForeignContactEntryParams = {
  entryIndex: number;
};

/**
 * Type for foreign contact entry updates
 */
export type ForeignContactEntryUpdate = {
  entryIndex: number;
  fieldPath: string;
  newValue: any;
};

/**
 * Type for Section 19 field updates
 */
export type Section19FieldUpdate = {
  fieldPath: string;
  newValue: any;
  entryIndex?: number;
};

/**
 * Section 19 validation rules
 */
export interface Section19ValidationRules {
  requireContactDetails: boolean;
  requireEmploymentInfo: boolean;
  requireGovernmentRelationship: boolean;
  maxEntries: number;
  minContactFrequency?: string;
}

/**
 * Section 19 validation context
 */
export interface Section19ValidationContext {
  rules: Section19ValidationRules;
  allowPartialInfo: boolean;
}

// ============================================================================
// EXPORTS
// ============================================================================

export type {
  ForeignContactsSubsection,
  ForeignContactEntry,
  ForeignNationalPersonalInfo,
  PersonName,
  DateInfo,
  PlaceOfBirth,
  Address,
  CitizenshipInfo,
  ContactInfo,
  ForeignNationalEmployment,
  GovernmentRelationshipInfo,
  ContactDetailsInfo,
  DateRange
};

/**
 * Field counts for Section 19 subsections
 * Used for validation and PDF mapping
 */
export const SECTION19_FIELD_COUNTS = {
  FOREIGN_CONTACTS: 277
} as const;

/**
 * Section 19 validation helper functions
 */
export const Section19Utils = {
  /**
   * Generate a new entry ID for foreign contacts
   */
  generateEntryId: (): number => {
    return Date.now() + Math.floor(Math.random() * 1000);
  },

  /**
   * Validate foreign contact entry completeness
   */
  validateForeignContactEntry: (entry: Partial<ForeignContactEntry>): boolean => {
    return !!(
      entry.personalInfo?.name?.first?.value &&
      entry.personalInfo?.name?.last?.value &&
      entry.citizenship?.country1?.value
    );
  },

  /**
   * Get field count for validation
   */
  getExpectedFieldCount: (): number => {
    return SECTION19_FIELD_COUNTS.FOREIGN_CONTACTS;
  }
} as const; 