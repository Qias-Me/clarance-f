/**
 * Section 16: Foreign Activities
 *
 * TypeScript interface definitions for SF-86 Section 16 (Foreign Activities) data structure.
 * Based on the established Field<T> interface patterns and PDF field ID mappings from section-16.json.
 * 
 * Section 16 covers:
 * - Foreign government activities and involvement (16.1)
 * - Foreign business activities and consulting (16.2)  
 * - Foreign organization membership (16.3)
 * - Foreign property ownership (16.4)
 * - Foreign travel for business or professional activities (16.5)
 * - Foreign conference attendance (16.6)
 * - Foreign government contact (16.7)
 */

import type { Field, FieldWithOptions } from '../formDefinition2.0';
import { createFieldFromReference, validateSectionFieldCount } from '../../utils/sections-references-loader';

// ============================================================================
// HELPER TYPES
// ============================================================================

/**
 * Date field structure used in SF-86 forms
 */
export interface DateField {
  month: Field<string>;
  year: Field<string>;
}

/**
 * Address structure for foreign contacts and properties
 */
export interface AddressField {
  street: Field<string>;
  city: Field<string>;
  state: Field<string>;
  country: Field<string>;
  zipCode: Field<string>;
}

// ============================================================================
// CORE INTERFACES
// ============================================================================

/**
 * Foreign government activity entry for Section 16.1
 */
export interface ForeignGovernmentActivityEntry {
  hasForeignGovernmentActivity: FieldWithOptions<string>; // YES/NO radio button
  
  // Organization details
  organizationName: Field<string>;
  organizationType: FieldWithOptions<string>; // Government agency, military, etc.
  country: Field<string>;
  
  // Service period
  fromDate: DateField;
  fromDateEstimated: Field<boolean>;
  toDate: DateField;
  toDateEstimated: Field<boolean>;
  isPresent: Field<boolean>;
  
  // Position details
  positionTitle: Field<string>;
  duties: Field<string>;
  reasonForLeaving: Field<string>;
  
  // Compensation
  wasCompensated: FieldWithOptions<string>; // YES/NO
  compensationAmount: Field<string>;
  compensationCurrency: Field<string>;
  
  // Contact information
  supervisorName: Field<string>;
  supervisorTitle: Field<string>;
  contactAddress: AddressField;
  contactPhone: Field<string>;
  contactEmail: Field<string>;
}

/**
 * Foreign business activity entry for Section 16.2
 */
export interface ForeignBusinessActivityEntry {
  hasForeignBusinessActivity: FieldWithOptions<string>; // YES/NO
  
  // Business details
  businessName: Field<string>;
  businessType: Field<string>;
  businessDescription: Field<string>;
  country: Field<string>;
  
  // Activity period
  fromDate: DateField;
  fromDateEstimated: Field<boolean>;
  toDate: DateField;
  toDateEstimated: Field<boolean>;
  isPresent: Field<boolean>;
  
  // Role details
  role: Field<string>;
  responsibilities: Field<string>;
  
  // Financial involvement
  hasFinancialInterest: FieldWithOptions<string>; // YES/NO
  financialInterestDescription: Field<string>;
  investmentAmount: Field<string>;
  
  // Contact information
  businessAddress: AddressField;
  businessPhone: Field<string>;
  businessEmail: Field<string>;
}

/**
 * Foreign organization membership entry for Section 16.3
 */
export interface ForeignOrganizationEntry {
  hasForeignOrganizationMembership: FieldWithOptions<string>; // YES/NO
  
  // Organization details
  organizationName: Field<string>;
  organizationType: FieldWithOptions<string>; // Professional, cultural, political, etc.
  country: Field<string>;
  
  // Membership period
  fromDate: DateField;
  fromDateEstimated: Field<boolean>;
  toDate: DateField;
  toDateEstimated: Field<boolean>;
  isPresent: Field<boolean>;
  
  // Involvement details
  membershipType: Field<string>;
  activitiesParticipated: Field<string>;
  positionsHeld: Field<string>;
  
  // Financial aspects
  membershipFees: FieldWithOptions<string>; // YES/NO
  feeAmount: Field<string>;
  donations: FieldWithOptions<string>; // YES/NO
  donationAmount: Field<string>;
  
  // Contact information
  organizationAddress: AddressField;
  contactPerson: Field<string>;
  contactPhone: Field<string>;
}

/**
 * Foreign property ownership entry for Section 16.4
 */
export interface ForeignPropertyEntry {
  hasForeignProperty: FieldWithOptions<string>; // YES/NO
  
  // Property details
  propertyType: FieldWithOptions<string>; // Residential, commercial, land, etc.
  propertyDescription: Field<string>;
  country: Field<string>;
  propertyAddress: AddressField;
  
  // Ownership details
  ownershipType: FieldWithOptions<string>; // Sole, joint, beneficial, etc.
  ownershipPercentage: Field<string>;
  
  // Acquisition details
  acquisitionDate: DateField;
  acquisitionDateEstimated: Field<boolean>;
  acquisitionMethod: FieldWithOptions<string>; // Purchase, inheritance, gift, etc.
  purchasePrice: Field<string>;
  currentValue: Field<string>;
  currency: Field<string>;
  
  // Management details
  whoManagesProperty: Field<string>;
  managerContact: Field<string>;
  
  // Income details
  generatesIncome: FieldWithOptions<string>; // YES/NO
  annualIncome: Field<string>;
  incomeReported: FieldWithOptions<string>; // YES/NO
}

/**
 * Foreign travel for business/professional activities entry for Section 16.5
 */
export interface ForeignBusinessTravelEntry {
  hasForeignBusinessTravel: FieldWithOptions<string>; // YES/NO
  
  // Travel details
  travelPurpose: FieldWithOptions<string>; // Business, conference, consulting, etc.
  countries: Field<string>; // Comma-separated list
  
  // Trip period
  fromDate: DateField;
  fromDateEstimated: Field<boolean>;
  toDate: DateField;
  toDateEstimated: Field<boolean>;
  
  // Travel details
  travelDescription: Field<string>;
  businessContacts: Field<string>;
  activitiesConducted: Field<string>;
  
  // Sponsorship details
  whoFundedTravel: Field<string>;
  sponsorAddress: AddressField;
  sponsorContact: Field<string>;
  
  // Compensation
  receivedCompensation: FieldWithOptions<string>; // YES/NO
  compensationAmount: Field<string>;
  compensationDescription: Field<string>;
}

/**
 * Foreign conference/seminar attendance entry for Section 16.6
 */
export interface ForeignConferenceEntry {
  hasForeignConferenceAttendance: FieldWithOptions<string>; // YES/NO
  
  // Conference details
  conferenceName: Field<string>;
  conferenceType: FieldWithOptions<string>; // Academic, professional, technical, etc.
  country: Field<string>;
  city: Field<string>;
  
  // Conference dates
  fromDate: DateField;
  fromDateEstimated: Field<boolean>;
  toDate: DateField;
  toDateEstimated: Field<boolean>;
  
  // Participation details
  participationRole: FieldWithOptions<string>; // Attendee, speaker, organizer, etc.
  presentationGiven: FieldWithOptions<string>; // YES/NO
  presentationTitle: Field<string>;
  presentationDescription: Field<string>;
  
  // Sponsorship details
  sponsoringOrganization: Field<string>;
  sponsorContact: Field<string>;
  
  // Financial details
  expensesPaid: FieldWithOptions<string>; // YES/NO
  whoPaidExpenses: Field<string>;
  honorariumReceived: FieldWithOptions<string>; // YES/NO
  honorariumAmount: Field<string>;
}

/**
 * Foreign government contact entry for Section 16.7
 */
export interface ForeignGovernmentContactEntry {
  hasForeignGovernmentContact: FieldWithOptions<string>; // YES/NO
  
  // Contact details
  contactName: Field<string>;
  contactTitle: Field<string>;
  governmentAgency: Field<string>;
  country: Field<string>;
  
  // Contact period
  fromDate: DateField;
  fromDateEstimated: Field<boolean>;
  toDate: DateField;
  toDateEstimated: Field<boolean>;
  isPresent: Field<boolean>;
  
  // Relationship details
  relationshipNature: Field<string>;
  contactFrequency: FieldWithOptions<string>; // Daily, weekly, monthly, etc.
  contactMethod: FieldWithOptions<string>; // In person, phone, email, etc.
  
  // Context details
  howMet: Field<string>;
  purposeOfContact: Field<string>;
  topicsDiscussed: Field<string>;
  
  // Contact information
  contactAddress: AddressField;
  contactPhone: Field<string>;
  contactEmail: Field<string>;
}

/**
 * Section 16 main data structure
 */
export interface Section16 {
  _id: number;
  section16: {
    foreignGovernmentActivities: ForeignGovernmentActivityEntry[];
    foreignBusinessActivities: ForeignBusinessActivityEntry[];
    foreignOrganizations: ForeignOrganizationEntry[];
    foreignProperty: ForeignPropertyEntry[];
    foreignBusinessTravel: ForeignBusinessTravelEntry[];
    foreignConferences: ForeignConferenceEntry[];
    foreignGovernmentContacts: ForeignGovernmentContactEntry[];
  };
}

// ============================================================================
// SUBSECTION TYPES
// ============================================================================

/**
 * Section 16 subsection keys for type safety
 */
export type Section16SubsectionKey = 
  | 'foreignGovernmentActivities' 
  | 'foreignBusinessActivities' 
  | 'foreignOrganizations' 
  | 'foreignProperty' 
  | 'foreignBusinessTravel' 
  | 'foreignConferences' 
  | 'foreignGovernmentContacts';

// ============================================================================
// FIELD ID MAPPINGS
// ============================================================================

/**
 * PDF field ID mappings for Section 16 (Foreign Activities)
 * Based on the actual field IDs from section-16.json
 */
export const SECTION16_FIELD_IDS = {
  // 16.1 Foreign Government Activities
  HAS_FOREIGN_GOVT_ACTIVITY: "17042", // Main radio button (options 1-7)
  GOVT_ORGANIZATION_NAME: "11578", // Organization name
  GOVT_COUNTRY: "11577", // Country dropdown
  GOVT_POSITION_TITLE: "11576", // Position/rank held
  GOVT_FROM_DATE: "11583", // From date
  GOVT_FROM_ESTIMATED: "11582", // From date estimate
  GOVT_TO_DATE: "11581", // To date
  GOVT_TO_ESTIMATED: "11580", // To date estimate
  GOVT_PRESENT: "11579", // Present checkbox
  
  // 16.2 Foreign Business Activities
  HAS_FOREIGN_BUSINESS: "17041", // Foreign business radio button
  BUSINESS_NAME: "11575", // Business name
  BUSINESS_COUNTRY: "11574", // Business country
  BUSINESS_ROLE: "11573", // Role in business
  BUSINESS_FROM_DATE: "11572", // Business start date
  BUSINESS_TO_DATE: "11571", // Business end date
  
  // 16.3 Foreign Organizations
  HAS_FOREIGN_ORG: "17040", // Foreign organization radio button
  ORG_NAME: "11570", // Organization name
  ORG_COUNTRY: "11569", // Organization country
  ORG_TYPE: "11568", // Organization type
  ORG_FROM_DATE: "11567", // Membership start
  ORG_TO_DATE: "11566", // Membership end
  
  // 16.4 Foreign Property
  HAS_FOREIGN_PROPERTY: "17039", // Foreign property radio button
  PROPERTY_TYPE: "11565", // Property type
  PROPERTY_COUNTRY: "11564", // Property country
  PROPERTY_ADDRESS: "11563", // Property address
  PROPERTY_VALUE: "11562", // Property value
  PROPERTY_DATE_ACQUIRED: "11561", // Acquisition date
  
  // 16.5 Foreign Business Travel
  HAS_FOREIGN_TRAVEL: "17038", // Foreign travel radio button
  TRAVEL_PURPOSE: "11560", // Purpose of travel
  TRAVEL_COUNTRIES: "11559", // Countries visited
  TRAVEL_FROM_DATE: "11558", // Travel start date
  TRAVEL_TO_DATE: "11557", // Travel end date
  TRAVEL_SPONSOR: "11556", // Who sponsored travel
  
  // 16.6 Foreign Conferences
  HAS_FOREIGN_CONFERENCE: "17037", // Foreign conference radio button
  CONFERENCE_NAME: "11555", // Conference name
  CONFERENCE_COUNTRY: "11554", // Conference country
  CONFERENCE_ROLE: "11553", // Role at conference
  CONFERENCE_FROM_DATE: "11552", // Conference start
  CONFERENCE_TO_DATE: "11551", // Conference end
  
  // 16.7 Foreign Government Contacts
  HAS_FOREIGN_CONTACT: "17036", // Foreign contact radio button
  CONTACT_NAME: "11550", // Contact name
  CONTACT_COUNTRY: "11549", // Contact country
  CONTACT_TITLE: "11548", // Contact title
  CONTACT_AGENCY: "11547", // Government agency
  CONTACT_FROM_DATE: "11546", // Contact start
  CONTACT_TO_DATE: "11545", // Contact end
  CONTACT_FREQUENCY: "11544", // Contact frequency
  CONTACT_PURPOSE: "11543", // Purpose of contact
} as const;

// ============================================================================
// VALIDATION INTERFACES
// ============================================================================

/**
 * Validation rules specific to Section 16
 */
export interface Section16ValidationRules {
  requiresActivityDetailsIfYes: boolean;
  requiresContactInfoForActivities: boolean;
  requiresFinancialDisclosure: boolean;
  requiresDateRanges: boolean;
  maxDescriptionLength: number;
  maxNameLength: number;
}

/**
 * Section 16 validation context
 */
export interface Section16ValidationContext {
  rules: Section16ValidationRules;
  allowPartialCompletion: boolean;
}

// ============================================================================
// HELPER TYPES
// ============================================================================

/**
 * Foreign activity types options
 */
export const FOREIGN_ACTIVITY_OPTIONS = [
  "1", // Government employment/consulting
  "2", // Business activities
  "3", // Organization membership
  "4", // Property ownership
  "5", // Business travel
  "6", // Conference attendance
  "7"  // Government contacts
] as const;

/**
 * Yes/No options
 */
export const YES_NO_OPTIONS = [
  "YES",
  "NO"
] as const;

/**
 * Organization type options
 */
export const ORGANIZATION_TYPE_OPTIONS = [
  "Government Agency",
  "Military",
  "Political",
  "Educational",
  "Professional",
  "Commercial",
  "Other"
] as const;

/**
 * Property type options
 */
export const PROPERTY_TYPE_OPTIONS = [
  "Residential",
  "Commercial",
  "Land",
  "Investment",
  "Other"
] as const;

/**
 * Contact frequency options
 */
export const CONTACT_FREQUENCY_OPTIONS = [
  "Daily",
  "Weekly",
  "Monthly",
  "Quarterly",
  "Annually",
  "Rarely"
] as const;

/**
 * Validation patterns for Section 16
 */
export const SECTION16_VALIDATION = {
  NAME_MIN_LENGTH: 1,
  NAME_MAX_LENGTH: 100,
  DESCRIPTION_MIN_LENGTH: 1,
  DESCRIPTION_MAX_LENGTH: 2000,
  CURRENCY_MIN_LENGTH: 1,
  CURRENCY_MAX_LENGTH: 10,
  AMOUNT_PATTERN: /^\d+(\.\d{2})?$/,
} as const;

// ============================================================================
// UTILITY TYPES
// ============================================================================

/**
 * Type for foreign activities field updates
 */
export type Section16FieldUpdate = {
  fieldPath: string;
  newValue: any;
  entryIndex?: number;
  subsection: Section16SubsectionKey;
};

/**
 * Type for foreign activities validation results
 */
export type ForeignActivitiesValidationResult = {
  isValid: boolean;
  errors: string[];
  warnings: string[];
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Creates a default Section 16 data structure using DRY approach with sections-references
 */
export const createDefaultSection16 = (): Section16 => {
  // Validate field count against sections-references
  validateSectionFieldCount(16);

  return {
    _id: 16,
    section16: {
      foreignGovernmentActivities: [],
      foreignBusinessActivities: [],
      foreignOrganizations: [],
      foreignProperty: [],
      foreignBusinessTravel: [],
      foreignConferences: [],
      foreignGovernmentContacts: []
    }
  };
};

/**
 * Creates a default foreign government activity entry
 */
export const createDefaultForeignGovernmentActivityEntry = (): ForeignGovernmentActivityEntry => {
  return {
    hasForeignGovernmentActivity: {
      ...createFieldFromReference(16, 'form1[0].Section16_1[0].RadioButtonList[0]', ''),
      options: YES_NO_OPTIONS
    },
    organizationName: createFieldFromReference(16, 'form1[0].Section16_1[0].TextField11[0]', ''),
    organizationType: {
      ...createFieldFromReference(16, 'form1[0].Section16_1[0].TextField11[1]', ''),
      options: ORGANIZATION_TYPE_OPTIONS
    },
    country: createFieldFromReference(16, 'form1[0].Section16_1[0].DropDownList29[0]', ''),
    fromDate: {
      month: createFieldFromReference(16, 'form1[0].Section16_1[0].#area[0].From_Datefield_Name_2[0]', ''),
      year: createFieldFromReference(16, 'form1[0].Section16_1[0].#area[0].From_Datefield_Name_2[0]', '')
    },
    fromDateEstimated: createFieldFromReference(16, 'form1[0].Section16_1[0].#area[0].#field[3]', false),
    toDate: {
      month: createFieldFromReference(16, 'form1[0].Section16_1[0].#area[0].From_Datefield_Name_2[1]', ''),
      year: createFieldFromReference(16, 'form1[0].Section16_1[0].#area[0].From_Datefield_Name_2[1]', '')
    },
    toDateEstimated: createFieldFromReference(16, 'form1[0].Section16_1[0].#area[0].#field[5]', false),
    isPresent: createFieldFromReference(16, 'form1[0].Section16_1[0].#area[0].#field[6]', false),
    positionTitle: createFieldFromReference(16, 'form1[0].Section16_1[0].TextField11[2]', ''),
    duties: createFieldFromReference(16, 'form1[0].Section16_1[0].#area[2].#area[3].TextField11[3]', ''),
    reasonForLeaving: createFieldFromReference(16, 'form1[0].Section16_1[0].TextField11[9]', ''),
    wasCompensated: {
      ...createFieldFromReference(16, 'form1[0].Section16_1[0].RadioButtonList[1]', ''),
      options: YES_NO_OPTIONS
    },
    compensationAmount: createFieldFromReference(16, 'form1[0].Section16_1[0].TextField11[10]', ''),
    compensationCurrency: createFieldFromReference(16, 'form1[0].Section16_1[0].TextField11[19]', ''),
    supervisorName: createFieldFromReference(16, 'form1[0].Section16_3[0].TextField11[0]', ''),
    supervisorTitle: createFieldFromReference(16, 'form1[0].Section16_3[0].TextField11[1]', ''),
    contactAddress: {
      street: createFieldFromReference(16, 'form1[0].Section16_3[0].TextField11[2]', ''),
      city: createFieldFromReference(16, 'form1[0].Section16_3[0].TextField11[3]', ''),
      state: createFieldFromReference(16, 'form1[0].Section16_1[0].#area[5].#area[6].TextField11[11]', ''),
      country: createFieldFromReference(16, 'form1[0].Section16_1[0].#area[5].#area[6].TextField11[12]', ''),
      zipCode: createFieldFromReference(16, 'form1[0].Section16_3[0].TextField11[30]', '')
    },
    contactPhone: createFieldFromReference(16, 'form1[0].Section16_3[0].TextField11[32]', ''),
    contactEmail: createFieldFromReference(16, 'form1[0].Section16_3[0].TextField11[3]', '')
  };
};

/**
 * Creates a default foreign business activity entry
 */
export const createDefaultForeignBusinessActivityEntry = (): ForeignBusinessActivityEntry => {
  return {
    hasForeignBusinessActivity: {
      ...createFieldFromReference(16, 'form1[0].Section16_1[0].RadioButtonList[1]', ''),
      options: YES_NO_OPTIONS
    },
    businessName: createFieldFromReference(16, 'form1[0].Section16_1[0].TextField11[0]', ''),
    businessType: createFieldFromReference(16, 'form1[0].Section16_1[0].TextField11[1]', ''),
    businessDescription: createFieldFromReference(16, 'form1[0].Section16_1[0].TextField11[2]', ''),
    country: createFieldFromReference(16, 'form1[0].Section16_1[0].DropDownList29[0]', ''),
    fromDate: {
      month: createFieldFromReference(16, 'form1[0].Section16_1[0].#area[0].From_Datefield_Name_2[0]', ''),
      year: createFieldFromReference(16, 'form1[0].Section16_1[0].#area[0].From_Datefield_Name_2[0]', '')
    },
    fromDateEstimated: createFieldFromReference(16, 'form1[0].Section16_1[0].#area[0].#field[3]', false),
    toDate: {
      month: createFieldFromReference(16, 'form1[0].Section16_1[0].#area[0].From_Datefield_Name_2[1]', ''),
      year: createFieldFromReference(16, 'form1[0].Section16_1[0].#area[0].From_Datefield_Name_2[1]', '')
    },
    toDateEstimated: createFieldFromReference(16, 'form1[0].Section16_1[0].#area[0].#field[5]', false),
    isPresent: createFieldFromReference(16, 'form1[0].Section16_1[0].#area[0].#field[6]', false),
    role: createFieldFromReference(16, 'form1[0].Section16_1[0].TextField11[9]', ''),
    responsibilities: createFieldFromReference(16, 'form1[0].Section16_1[0].#area[2].#area[3].TextField11[3]', ''),
    hasFinancialInterest: {
      ...createFieldFromReference(16, 'form1[0].Section16_1[0].RadioButtonList[1]', ''),
      options: YES_NO_OPTIONS
    },
    financialInterestDescription: createFieldFromReference(16, 'form1[0].Section16_1[0].TextField11[10]', ''),
    investmentAmount: createFieldFromReference(16, 'form1[0].Section16_1[0].TextField11[19]', ''),
    businessAddress: {
      street: createFieldFromReference(16, 'form1[0].Section16_3[0].TextField11[2]', ''),
      city: createFieldFromReference(16, 'form1[0].Section16_3[0].TextField11[3]', ''),
      state: createFieldFromReference(16, 'form1[0].Section16_1[0].#area[5].#area[6].TextField11[11]', ''),
      country: createFieldFromReference(16, 'form1[0].Section16_1[0].#area[5].#area[6].TextField11[12]', ''),
      zipCode: createFieldFromReference(16, 'form1[0].Section16_3[0].TextField11[30]', '')
    },
    businessPhone: createFieldFromReference(16, 'form1[0].Section16_3[0].TextField11[32]', ''),
    businessEmail: createFieldFromReference(16, 'form1[0].Section16_3[0].TextField11[4]', '')
  };
};

/**
 * Creates a default foreign organization entry
 */
export const createDefaultForeignOrganizationEntry = (): ForeignOrganizationEntry => {
  return {
    hasForeignOrganizationMembership: {
      ...createFieldFromReference(16, 'form1[0].Section16_1[0].RadioButtonList[0]', ''),
      options: YES_NO_OPTIONS
    },
    organizationName: createFieldFromReference(16, 'form1[0].Section16_1[0].TextField11[0]', ''),
    organizationType: {
      ...createFieldFromReference(16, 'form1[0].Section16_1[0].TextField11[1]', ''),
      options: ORGANIZATION_TYPE_OPTIONS
    },
    country: createFieldFromReference(16, 'form1[0].Section16_1[0].DropDownList29[0]', ''),
    fromDate: {
      month: createFieldFromReference(16, 'form1[0].Section16_1[0].#area[0].From_Datefield_Name_2[0]', ''),
      year: createFieldFromReference(16, 'form1[0].Section16_1[0].#area[0].From_Datefield_Name_2[0]', '')
    },
    fromDateEstimated: createFieldFromReference(16, 'form1[0].Section16_1[0].#area[0].#field[3]', false),
    toDate: {
      month: createFieldFromReference(16, 'form1[0].Section16_1[0].#area[0].From_Datefield_Name_2[1]', ''),
      year: createFieldFromReference(16, 'form1[0].Section16_1[0].#area[0].From_Datefield_Name_2[1]', '')
    },
    toDateEstimated: createFieldFromReference(16, 'form1[0].Section16_1[0].#area[0].#field[5]', false),
    isPresent: createFieldFromReference(16, 'form1[0].Section16_1[0].#area[0].#field[6]', false),
    membershipType: createFieldFromReference(16, 'form1[0].Section16_1[0].TextField11[2]', ''),
    activitiesParticipated: createFieldFromReference(16, 'form1[0].Section16_1[0].#area[2].#area[3].TextField11[3]', ''),
    positionsHeld: createFieldFromReference(16, 'form1[0].Section16_1[0].TextField11[9]', ''),
    membershipFees: {
      ...createFieldFromReference(16, 'form1[0].Section16_1[0].RadioButtonList[1]', ''),
      options: YES_NO_OPTIONS
    },
    feeAmount: createFieldFromReference(16, 'form1[0].Section16_1[0].TextField11[10]', ''),
    donations: {
      ...createFieldFromReference(16, 'form1[0].Section16_1[0].RadioButtonList[1]', ''),
      options: YES_NO_OPTIONS
    },
    donationAmount: createFieldFromReference(16, 'form1[0].Section16_1[0].TextField11[19]', ''),
    organizationAddress: {
      street: createFieldFromReference(16, 'form1[0].Section16_3[0].TextField11[2]', ''),
      city: createFieldFromReference(16, 'form1[0].Section16_3[0].TextField11[3]', ''),
      state: createFieldFromReference(16, 'form1[0].Section16_1[0].#area[5].#area[6].TextField11[11]', ''),
      country: createFieldFromReference(16, 'form1[0].Section16_1[0].#area[5].#area[6].TextField11[12]', ''),
      zipCode: createFieldFromReference(16, 'form1[0].Section16_3[0].TextField11[30]', '')
    },
    contactPerson: createFieldFromReference(16, 'form1[0].Section16_3[0].TextField11[0]', ''),
    contactPhone: createFieldFromReference(16, 'form1[0].Section16_3[0].TextField11[32]', '')
  };
};

/**
 * Creates a default foreign property entry
 */
export const createDefaultForeignPropertyEntry = (): ForeignPropertyEntry => {
  return {
    hasForeignProperty: {
      ...createFieldFromReference(16, 'form1[0].Section16_1[0].RadioButtonList[0]', ''),
      options: YES_NO_OPTIONS
    },
    propertyType: {
      ...createFieldFromReference(16, 'form1[0].Section16_1[0].TextField11[1]', ''),
      options: PROPERTY_TYPE_OPTIONS
    },
    propertyDescription: createFieldFromReference(16, 'form1[0].Section16_1[0].TextField11[2]', ''),
    country: createFieldFromReference(16, 'form1[0].Section16_1[0].DropDownList29[0]', ''),
    propertyAddress: {
      street: createFieldFromReference(16, 'form1[0].Section16_3[0].TextField11[2]', ''),
      city: createFieldFromReference(16, 'form1[0].Section16_3[0].TextField11[3]', ''),
      state: createFieldFromReference(16, 'form1[0].Section16_1[0].#area[5].#area[6].TextField11[11]', ''),
      country: createFieldFromReference(16, 'form1[0].Section16_1[0].#area[5].#area[6].TextField11[12]', ''),
      zipCode: createFieldFromReference(16, 'form1[0].Section16_3[0].TextField11[30]', '')
    },
    ownershipType: {
      ...createFieldFromReference(16, 'form1[0].Section16_1[0].TextField11[9]', ''),
      options: ['Sole', 'Joint', 'Beneficial']
    },
    ownershipPercentage: createFieldFromReference(16, 'form1[0].Section16_1[0].TextField11[10]', ''),
    acquisitionDate: {
      month: createFieldFromReference(16, 'form1[0].Section16_1[0].#area[0].From_Datefield_Name_2[0]', ''),
      year: createFieldFromReference(16, 'form1[0].Section16_1[0].#area[0].From_Datefield_Name_2[0]', '')
    },
    acquisitionDateEstimated: createFieldFromReference(16, 'form1[0].Section16_1[0].#area[0].#field[3]', false),
    acquisitionMethod: {
      ...createFieldFromReference(16, 'form1[0].Section16_1[0].RadioButtonList[1]', ''),
      options: ['Purchase', 'Inheritance', 'Gift', 'Other']
    },
    purchasePrice: createFieldFromReference(16, 'form1[0].Section16_1[0].TextField11[19]', ''),
    currentValue: createFieldFromReference(16, 'form1[0].Section16_1[0].TextField11[19]', ''),
    currency: createFieldFromReference(16, 'form1[0].Section16_1[0].TextField11[19]', ''),
    whoManagesProperty: createFieldFromReference(16, 'form1[0].Section16_3[0].TextField11[0]', ''),
    managerContact: createFieldFromReference(16, 'form1[0].Section16_3[0].TextField11[32]', ''),
    generatesIncome: {
      ...createFieldFromReference(16, 'form1[0].Section16_1[0].RadioButtonList[1]', ''),
      options: YES_NO_OPTIONS
    },
    annualIncome: createFieldFromReference(16, 'form1[0].Section16_1[0].TextField11[10]', ''),
    incomeReported: {
      ...createFieldFromReference(16, 'form1[0].Section16_1[0].RadioButtonList[1]', ''),
      options: YES_NO_OPTIONS
    }
  };
};

/**
 * Creates a default foreign business travel entry
 */
export const createDefaultForeignBusinessTravelEntry = (): ForeignBusinessTravelEntry => {
  return {
    hasForeignBusinessTravel: {
      ...createFieldFromReference(16, 'form1[0].Section16_1[0].RadioButtonList[0]', ''),
      options: YES_NO_OPTIONS
    },
    travelPurpose: {
      ...createFieldFromReference(16, 'form1[0].Section16_1[0].TextField11[1]', ''),
      options: ['Business', 'Conference', 'Consulting', 'Other']
    },
    countries: createFieldFromReference(16, 'form1[0].Section16_1[0].DropDownList29[0]', ''),
    fromDate: {
      month: createFieldFromReference(16, 'form1[0].Section16_1[0].#area[0].From_Datefield_Name_2[0]', ''),
      year: createFieldFromReference(16, 'form1[0].Section16_1[0].#area[0].From_Datefield_Name_2[0]', '')
    },
    fromDateEstimated: createFieldFromReference(16, 'form1[0].Section16_1[0].#area[0].#field[3]', false),
    toDate: {
      month: createFieldFromReference(16, 'form1[0].Section16_1[0].#area[0].From_Datefield_Name_2[1]', ''),
      year: createFieldFromReference(16, 'form1[0].Section16_1[0].#area[0].From_Datefield_Name_2[1]', '')
    },
    toDateEstimated: createFieldFromReference(16, 'form1[0].Section16_1[0].#area[0].#field[5]', false),
    travelDescription: createFieldFromReference(16, 'form1[0].Section16_1[0].#area[2].#area[3].TextField11[3]', ''),
    businessContacts: createFieldFromReference(16, 'form1[0].Section16_1[0].TextField11[9]', ''),
    activitiesConducted: createFieldFromReference(16, 'form1[0].Section16_1[0].TextField11[10]', ''),
    whoFundedTravel: createFieldFromReference(16, 'form1[0].Section16_1[0].TextField11[19]', ''),
    sponsorAddress: {
      street: createFieldFromReference(16, 'form1[0].Section16_3[0].TextField11[2]', ''),
      city: createFieldFromReference(16, 'form1[0].Section16_3[0].TextField11[3]', ''),
      state: createFieldFromReference(16, 'form1[0].Section16_1[0].#area[5].#area[6].TextField11[11]', ''),
      country: createFieldFromReference(16, 'form1[0].Section16_1[0].#area[5].#area[6].TextField11[12]', ''),
      zipCode: createFieldFromReference(16, 'form1[0].Section16_3[0].TextField11[30]', '')
    },
    sponsorContact: createFieldFromReference(16, 'form1[0].Section16_3[0].TextField11[0]', ''),
    receivedCompensation: {
      ...createFieldFromReference(16, 'form1[0].Section16_1[0].RadioButtonList[1]', ''),
      options: YES_NO_OPTIONS
    },
    compensationAmount: createFieldFromReference(16, 'form1[0].Section16_1[0].TextField11[10]', ''),
    compensationDescription: createFieldFromReference(16, 'form1[0].Section16_1[0].TextField11[19]', '')
  };
};

/**
 * Creates a default foreign conference entry
 */
export const createDefaultForeignConferenceEntry = (): ForeignConferenceEntry => {
  return {
    hasForeignConferenceAttendance: {
      ...createFieldFromReference(16, 'form1[0].Section16_1[0].RadioButtonList[0]', ''),
      options: YES_NO_OPTIONS
    },
    conferenceName: createFieldFromReference(16, 'form1[0].Section16_1[0].TextField11[0]', ''),
    conferenceType: {
      ...createFieldFromReference(16, 'form1[0].Section16_1[0].TextField11[1]', ''),
      options: ['Academic', 'Professional', 'Technical', 'Other']
    },
    country: createFieldFromReference(16, 'form1[0].Section16_1[0].DropDownList29[0]', ''),
    city: createFieldFromReference(16, 'form1[0].Section16_3[0].TextField11[3]', ''),
    fromDate: {
      month: createFieldFromReference(16, 'form1[0].Section16_1[0].#area[0].From_Datefield_Name_2[0]', ''),
      year: createFieldFromReference(16, 'form1[0].Section16_1[0].#area[0].From_Datefield_Name_2[0]', '')
    },
    fromDateEstimated: createFieldFromReference(16, 'form1[0].Section16_1[0].#area[0].#field[3]', false),
    toDate: {
      month: createFieldFromReference(16, 'form1[0].Section16_1[0].#area[0].From_Datefield_Name_2[1]', ''),
      year: createFieldFromReference(16, 'form1[0].Section16_1[0].#area[0].From_Datefield_Name_2[1]', '')
    },
    toDateEstimated: createFieldFromReference(16, 'form1[0].Section16_1[0].#area[0].#field[5]', false),
    participationRole: {
      ...createFieldFromReference(16, 'form1[0].Section16_1[0].TextField11[2]', ''),
      options: ['Attendee', 'Speaker', 'Organizer', 'Other']
    },
    presentationGiven: {
      ...createFieldFromReference(16, 'form1[0].Section16_1[0].RadioButtonList[1]', ''),
      options: YES_NO_OPTIONS
    },
    presentationTitle: createFieldFromReference(16, 'form1[0].Section16_1[0].TextField11[9]', ''),
    presentationDescription: createFieldFromReference(16, 'form1[0].Section16_1[0].#area[2].#area[3].TextField11[3]', ''),
    sponsoringOrganization: createFieldFromReference(16, 'form1[0].Section16_1[0].TextField11[10]', ''),
    sponsorContact: createFieldFromReference(16, 'form1[0].Section16_3[0].TextField11[0]', ''),
    expensesPaid: {
      ...createFieldFromReference(16, 'form1[0].Section16_1[0].RadioButtonList[1]', ''),
      options: YES_NO_OPTIONS
    },
    whoPaidExpenses: createFieldFromReference(16, 'form1[0].Section16_1[0].TextField11[19]', ''),
    honorariumReceived: {
      ...createFieldFromReference(16, 'form1[0].Section16_1[0].RadioButtonList[1]', ''),
      options: YES_NO_OPTIONS
    },
    honorariumAmount: createFieldFromReference(16, 'form1[0].Section16_1[0].TextField11[10]', '')
  };
};

/**
 * Creates a default foreign government contact entry
 */
export const createDefaultForeignGovernmentContactEntry = (): ForeignGovernmentContactEntry => {
  return {
    hasForeignGovernmentContact: {
      ...createFieldFromReference(16, 'form1[0].Section16_1[0].RadioButtonList[0]', ''),
      options: YES_NO_OPTIONS
    },
    contactName: createFieldFromReference(16, 'form1[0].Section16_3[0].TextField11[0]', ''),
    contactTitle: createFieldFromReference(16, 'form1[0].Section16_3[0].TextField11[1]', ''),
    governmentAgency: createFieldFromReference(16, 'form1[0].Section16_1[0].TextField11[0]', ''),
    country: createFieldFromReference(16, 'form1[0].Section16_1[0].DropDownList29[0]', ''),
    fromDate: {
      month: createFieldFromReference(16, 'form1[0].Section16_1[0].#area[0].From_Datefield_Name_2[0]', ''),
      year: createFieldFromReference(16, 'form1[0].Section16_1[0].#area[0].From_Datefield_Name_2[0]', '')
    },
    fromDateEstimated: createFieldFromReference(16, 'form1[0].Section16_1[0].#area[0].#field[3]', false),
    toDate: {
      month: createFieldFromReference(16, 'form1[0].Section16_1[0].#area[0].From_Datefield_Name_2[1]', ''),
      year: createFieldFromReference(16, 'form1[0].Section16_1[0].#area[0].From_Datefield_Name_2[1]', '')
    },
    toDateEstimated: createFieldFromReference(16, 'form1[0].Section16_1[0].#area[0].#field[5]', false),
    isPresent: createFieldFromReference(16, 'form1[0].Section16_1[0].#area[0].#field[6]', false),
    relationshipNature: createFieldFromReference(16, 'form1[0].Section16_1[0].TextField11[2]', ''),
    contactFrequency: {
      ...createFieldFromReference(16, 'form1[0].Section16_1[0].TextField11[9]', ''),
      options: CONTACT_FREQUENCY_OPTIONS
    },
    contactMethod: {
      ...createFieldFromReference(16, 'form1[0].Section16_1[0].TextField11[10]', ''),
      options: ['In person', 'Phone', 'Email', 'Other']
    },
    howMet: createFieldFromReference(16, 'form1[0].Section16_1[0].TextField11[19]', ''),
    purposeOfContact: createFieldFromReference(16, 'form1[0].Section16_1[0].#area[2].#area[3].TextField11[3]', ''),
    topicsDiscussed: createFieldFromReference(16, 'form1[0].Section16_1[0].TextField11[10]', ''),
    contactAddress: {
      street: createFieldFromReference(16, 'form1[0].Section16_3[0].TextField11[2]', ''),
      city: createFieldFromReference(16, 'form1[0].Section16_3[0].TextField11[3]', ''),
      state: createFieldFromReference(16, 'form1[0].Section16_1[0].#area[5].#area[6].TextField11[11]', ''),
      country: createFieldFromReference(16, 'form1[0].Section16_1[0].#area[5].#area[6].TextField11[12]', ''),
      zipCode: createFieldFromReference(16, 'form1[0].Section16_3[0].TextField11[30]', '')
    },
    contactPhone: createFieldFromReference(16, 'form1[0].Section16_3[0].TextField11[32]', ''),
    contactEmail: createFieldFromReference(16, 'form1[0].Section16_3[0].TextField11[3]', '')
  };
};

/**
 * Updates a Section 16 field
 */
export const updateSection16Field = (
  section16Data: Section16,
  update: Section16FieldUpdate
): Section16 => {
  const { fieldPath, newValue, subsection, entryIndex } = update;
  const updatedData = { ...section16Data };
  
  // Handle field updates based on subsection and entry index
  if (subsection && typeof entryIndex === 'number') {
    // Update a field in a specific entry of a subsection array
    if (updatedData.section16[subsection] && 
        Array.isArray(updatedData.section16[subsection]) && 
        entryIndex >= 0 && 
        entryIndex < updatedData.section16[subsection].length) {
      
      // Safely get the entry with appropriate type handling
      const entry = updatedData.section16[subsection][entryIndex];
      
      // Parse the fieldPath to determine which field to update
      const fieldName = fieldPath.split('.').pop();
      
      if (fieldName) {
        // Use type-safe property access with checking
        const hasProperty = Object.prototype.hasOwnProperty.call(entry, fieldName);
        
        if (hasProperty) {
          // Simple field update - use type assertion to inform TypeScript
          const fieldValue = (entry as any)[fieldName];
          if (typeof fieldValue === 'object' && fieldValue !== null && 'value' in fieldValue) {
            (entry as any)[fieldName].value = newValue;
          }
        } else if (fieldName.includes('.')) {
          // Handle nested fields like 'fromDate.month'
          const [parentField, childField] = fieldName.split('.');
          
          if (parentField && childField) {
            const hasParentProperty = Object.prototype.hasOwnProperty.call(entry, parentField);
            
            if (hasParentProperty) {
              const parentValue = (entry as any)[parentField];
              
              if (typeof parentValue === 'object' && parentValue !== null) {
                const hasChildProperty = Object.prototype.hasOwnProperty.call(parentValue, childField);
                
                if (hasChildProperty && 
                    typeof parentValue[childField] === 'object' && 
                    parentValue[childField] !== null &&
                    'value' in parentValue[childField]) {
                  parentValue[childField].value = newValue;
                }
              }
            }
          }
        } else if (fieldName.includes('[')) {
          // Handle array fields like 'addresses[0].street'
          const match = fieldName.match(/^([^\[]+)\[(\d+)\]\.(.+)$/);
          
          if (match) {
            const [_, arrayField, arrayIndex, arrayItemField] = match;
            const index = parseInt(arrayIndex, 10);
            
            if (arrayField && arrayItemField) {
              const hasArrayProperty = Object.prototype.hasOwnProperty.call(entry, arrayField);
              
              if (hasArrayProperty) {
                const arrayValue = (entry as any)[arrayField];
                
                if (Array.isArray(arrayValue) && index < arrayValue.length) {
                  const arrayItem = arrayValue[index];
                  
                  if (typeof arrayItem === 'object' && arrayItem !== null) {
                    const hasItemProperty = Object.prototype.hasOwnProperty.call(arrayItem, arrayItemField);
                    
                    if (hasItemProperty && 
                        typeof arrayItem[arrayItemField] === 'object' && 
                        arrayItem[arrayItemField] !== null &&
                        'value' in arrayItem[arrayItemField]) {
                      arrayItem[arrayItemField].value = newValue;
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  } else {
    // Handle direct field updates not in arrays
    const pathParts = fieldPath.split('.');
    
    if (pathParts.length >= 2) {
      const sectionPart = pathParts[0];
      const fieldPart = pathParts.slice(1).join('.');
      
      if (sectionPart === 'section16' && fieldPart) {
        // Direct properties of section16
        if (Object.prototype.hasOwnProperty.call(updatedData.section16, fieldPart)) {
          const fieldValue = (updatedData.section16 as any)[fieldPart];
          
          if (typeof fieldValue === 'object' && fieldValue !== null && 'value' in fieldValue) {
            (updatedData.section16 as any)[fieldPart].value = newValue;
          }
        } else {
          // Handle nested paths using safe property access
          try {
            let current: any = updatedData;
            const nestedParts = `section16.${fieldPart}`.split('.');
            
            // Navigate to the parent object
            for (let i = 0; i < nestedParts.length - 1; i++) {
              if (current && typeof current === 'object' && current[nestedParts[i]] !== undefined) {
                current = current[nestedParts[i]];
              } else {
                current = null;
                break;
              }
            }
            
            // Update the value if we reached a valid parent
            if (current && typeof current === 'object') {
              const lastPart = nestedParts[nestedParts.length - 1];
              
              if (Object.prototype.hasOwnProperty.call(current, lastPart)) {
                const lastValue = current[lastPart];
                
                if (typeof lastValue === 'object' && lastValue !== null && 'value' in lastValue) {
                  current[lastPart].value = newValue;
                }
              }
            }
          } catch (error) {
            // Silent fail - path doesn't exist
            console.warn(`Failed to update path: ${fieldPath}`, error);
          }
        }
      }
    }
  }
  
  return updatedData;
};

/**
 * Validates foreign activities information
 */
export function validateForeignActivities(
  foreignData: Section16['section16'], 
  context: Section16ValidationContext
): ForeignActivitiesValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Validate foreign government activities
  foreignData.foreignGovernmentActivities.forEach((entry, index) => {
    if (entry.hasForeignGovernmentActivity.value === 'YES') {
      if (!entry.organizationName.value) {
        errors.push(`Foreign government activity ${index + 1}: Organization name is required`);
      }
      if (!entry.country.value) {
        errors.push(`Foreign government activity ${index + 1}: Country is required`);
      }
      if (!entry.fromDate.month.value || !entry.fromDate.year.value) {
        errors.push(`Foreign government activity ${index + 1}: Start date is required`);
      }
    }
  });

  // Validate foreign business activities
  foreignData.foreignBusinessActivities.forEach((entry, index) => {
    if (entry.hasForeignBusinessActivity.value === 'YES') {
      if (!entry.businessName.value) {
        errors.push(`Foreign business activity ${index + 1}: Business name is required`);
      }
      if (!entry.country.value) {
        errors.push(`Foreign business activity ${index + 1}: Country is required`);
      }
    }
  });

  // Validate foreign organizations
  foreignData.foreignOrganizations.forEach((entry, index) => {
    if (entry.hasForeignOrganizationMembership.value === 'YES') {
      if (!entry.organizationName.value) {
        errors.push(`Foreign organization ${index + 1}: Organization name is required`);
      }
      if (!entry.country.value) {
        errors.push(`Foreign organization ${index + 1}: Country is required`);
      }
    }
  });

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Checks if Section 16 is complete
 */
export function isSection16Complete(section16Data: Section16): boolean {
  const {
    foreignGovernmentActivities,
    foreignBusinessActivities,
    foreignOrganizations,
    foreignProperty,
    foreignBusinessTravel,
    foreignConferences,
    foreignGovernmentContacts
  } = section16Data.section16;
  
  // Check if at least one subsection has been addressed
  const hasGovernmentActivity = foreignGovernmentActivities.some(entry => entry.hasForeignGovernmentActivity.value);
  const hasBusinessActivity = foreignBusinessActivities.some(entry => entry.hasForeignBusinessActivity.value);
  const hasOrganization = foreignOrganizations.some(entry => entry.hasForeignOrganizationMembership.value);
  const hasProperty = foreignProperty.some(entry => entry.hasForeignProperty.value);
  const hasTravel = foreignBusinessTravel.some(entry => entry.hasForeignBusinessTravel.value);
  const hasConference = foreignConferences.some(entry => entry.hasForeignConferenceAttendance.value);
  const hasContact = foreignGovernmentContacts.some(entry => entry.hasForeignGovernmentContact.value);
  
  return hasGovernmentActivity || hasBusinessActivity || hasOrganization || 
         hasProperty || hasTravel || hasConference || hasContact;
}

/**
 * Determines which fields should be visible based on responses
 */
export function getVisibleFields(entry: ForeignGovernmentActivityEntry): string[] {
  const visibleFields: string[] = ['hasForeignGovernmentActivity'];
  
  if (entry.hasForeignGovernmentActivity.value === 'YES') {
    visibleFields.push(
      'organizationName', 'organizationType', 'country', 'fromDate', 'toDate',
      'positionTitle', 'duties', 'wasCompensated', 'supervisorName', 'contactAddress'
    );
    
    if (entry.wasCompensated.value === 'YES') {
      visibleFields.push('compensationAmount', 'compensationCurrency');
    }
    
    if (!entry.isPresent.value) {
      visibleFields.push('reasonForLeaving');
    }
  }
  
  return visibleFields;
} 