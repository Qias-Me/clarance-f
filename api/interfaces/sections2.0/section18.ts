/**
 * Section 18 Interface - Relatives (REDESIGNED)
 * 
 * This interface defines the structure for SF-86 Section 18 data based on the actual PDF form structure.
 * The form has 6 relative entries with subsections 18.1-18.5, totaling 964 fields.
 * 
 * STRUCTURE:
 * - 6 Relative Entries (Entry #1-6)
 * - Section 18.1: Basic relative information (name, birth, other names, citizenship)
 * - Section 18.2: Current address for living relatives
 * - Section 18.3: Citizenship documentation for US citizens
 * - Section 18.4: Documentation for non-US citizens with US address
 * - Section 18.5: Contact info for non-US citizens with foreign address
 */

import type { Field, FieldWithOptions } from '../formDefinition2.0';

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
 * Full name structure for relatives
 */
export interface FullNameField {
  lastName: Field<string>;
  firstName: Field<string>;
  middleName: Field<string>;
  suffix: FieldWithOptions<string>;
}

/**
 * Address field structure
 */
export interface AddressField {
  street: Field<string>;
  city: Field<string>;
  state: FieldWithOptions<string>;
  zipCode: Field<string>;
  country: FieldWithOptions<string>;
}

/**
 * Contact information structure
 */
export interface ContactField {
  phone: Field<string>;
  email: Field<string>;
  contactMethod: FieldWithOptions<string>; // Phone, Email, Mail, In Person
  frequency: FieldWithOptions<string>; // Daily, Weekly, Monthly, Yearly, Other
}

/**
 * Employment information structure
 */
export interface EmploymentField {
  employer: Field<string>;
  position: Field<string>;
  address: AddressField;
  phone: Field<string>;
  isCurrentlyEmployed: FieldWithOptions<string>; // YES/NO
  dontKnow: Field<boolean>;
}

/**
 * Other names used structure (4 entries per relative)
 */
export interface OtherNameField {
  fullName: FullNameField;
  timeUsed: {
    from: DateField;
    to: DateField;
    isPresent: Field<boolean>;
    isEstimated: Field<boolean>;
  };
  reasonForChange: Field<string>;
  isApplicable: Field<boolean>; // "Not applicable" checkbox
}

// ============================================================================
// SUBSECTION INTERFACES (18.1-18.5)
// ============================================================================

/**
 * Section 18.1: Basic relative information
 */
export interface Section18_1 {
  // Relative type and basic info
  relativeType: FieldWithOptions<string>; // Mother, Father, Stepmother, etc.
  
  // Full name
  fullName: FullNameField;
  
  // Mother's maiden name (if applicable)
  mothersMaidenName: {
    sameAsListed: Field<boolean>;
    dontKnow: Field<boolean>;
    maidenName: FullNameField;
  };
  
  // Other names used (4 entries)
  otherNames: OtherNameField[];
  
  // Birth information
  dateOfBirth: DateField;
  dateOfBirthEstimated: Field<boolean>;
  placeOfBirth: {
    city: Field<string>;
    state: FieldWithOptions<string>;
    country: FieldWithOptions<string>;
  };
  
  // Citizenship
  citizenship: {
    countries: FieldWithOptions<string>[]; // Multiple countries possible
  };
}

/**
 * APO/FPO address structure
 */
export interface APOFPOAddressField {
  address: Field<string>;
  apoFpo: Field<string>; // APO or FPO designation
  stateCode: FieldWithOptions<string>; // State code for APO/FPO
  zipCode: Field<string>;
}

/**
 * Section 18.2: Current address for living relatives
 */
export interface Section18_2 {
  // Applicability
  isApplicable: Field<boolean>; // If relative is not deceased

  // Current address
  currentAddress: AddressField;

  // APO/FPO handling
  hasAPOFPOAddress: FieldWithOptions<string>; // YES/NO
  apoFpoAddress: APOFPOAddressField;
}

/**
 * Contact methods structure for Section 18.3
 */
export interface ContactMethodsField {
  inPerson: Field<boolean>;
  telephone: Field<boolean>;
  electronic: Field<boolean>;
  writtenCorrespondence: Field<boolean>;
  other: Field<boolean>;
  otherExplanation: Field<string>;
}

/**
 * Contact frequency structure for Section 18.3
 */
export interface ContactFrequencyField {
  daily: Field<boolean>;
  weekly: Field<boolean>;
  monthly: Field<boolean>;
  quarterly: Field<boolean>;
  annually: Field<boolean>;
  other: Field<boolean>;
  otherExplanation: Field<string>;
}

/**
 * Employment information structure for Section 18.3
 */
export interface EmploymentInfoField {
  employerName: Field<string>;
  dontKnowEmployer: Field<boolean>;
  employerAddress: AddressField & {
    dontKnowAddress: Field<boolean>;
  };
}

/**
 * Foreign government relations structure for Section 18.3
 */
export interface ForeignGovernmentRelationsField {
  hasRelations: FieldWithOptions<string>; // YES/NO/I don't know
  description: Field<string>;
}

/**
 * Contact dates structure for Section 18.3
 */
export interface ContactDatesField {
  firstContact: {
    date: Field<string>; // Month/Year
    isEstimate: Field<boolean>;
  };
  lastContact: {
    date: Field<string>; // Month/Year
    isEstimate: Field<boolean>;
    isPresent: Field<boolean>;
  };
}

/**
 * Documentation types structure for Section 18.3/18.4
 */
export interface DocumentationTypesField {
  i551PermanentResident: Field<boolean>;
  i766EmploymentAuth: Field<boolean>;
  usVisa: Field<boolean>;
  i94ArrivalDeparture: Field<boolean>;
  i20StudentCertificate: Field<boolean>;
  ds2019ExchangeVisitor: Field<boolean>;
  other: Field<boolean>;
  otherExplanation: Field<string>;
  documentNumber: Field<string>;
  expirationDate: Field<string>; // Month/Day/Year
  expirationIsEstimate: Field<boolean>;
}

/**
 * Section 18.3: Contact Information and Foreign Relations
 * Based on actual PDF field structure analysis
 */
export interface Section18_3 {
  // Applicability - for non-US citizens with foreign address
  isApplicable: Field<boolean>;

  // Contact methods (checkboxes)
  contactMethods: ContactMethodsField;

  // Contact frequency (checkboxes)
  contactFrequency: ContactFrequencyField;

  // Employment information
  employmentInfo: EmploymentInfoField;

  // Foreign government relations
  foreignGovernmentRelations: ForeignGovernmentRelationsField;

  // Contact dates (for Section 18.5 functionality)
  contactDates: ContactDatesField;

  // Documentation types (for Section 18.4 functionality)
  documentationTypes: DocumentationTypesField;
}

/**
 * Section 18.4: Documentation for non-US citizens with US address
 */
export interface Section18_4 {
  // Applicability (non-US citizen with US address, not deceased)
  isApplicable: Field<boolean>;
  
  // Documentation
  documentationType: FieldWithOptions<string>; // I-551 Permanent Resident, etc.
  documentNumber: Field<string>;
}

/**
 * Section 18.5: Contact info for non-US citizens with foreign address
 * Complete the following if the relative listed is your Mother, Father, Stepmother, Stepfather,
 * Foster parent, Child (including adopted/foster), Stepchild, Brother, Sister, Stepbrother,
 * Stepsister, Half-brother, Half-sister, Father-in-law, Mother-in-law, Guardian and is not
 * a U.S. Citizen, has a foreign address and is not deceased.
 */
export interface Section18_5 {
  // Contact dates
  firstContactDate: DateField;
  firstContactDateEstimated: Field<boolean>;
  lastContactDate: DateField;
  lastContactDateEstimated: Field<boolean>;
  lastContactDatePresent: Field<boolean>;

  // Contact methods (Check all that apply)
  contactMethods: {
    inPerson: Field<boolean>;
    telephone: Field<boolean>;
    electronic: Field<boolean>; // Such as e-mail, texting, chat rooms, etc
    writtenCorrespondence: Field<boolean>;
    other: Field<boolean>;
    otherExplanation: Field<string>; // Provide explanation
  };

  // Contact frequency
  contactFrequency: {
    daily: Field<boolean>;
    weekly: Field<boolean>;
    monthly: Field<boolean>;
    quarterly: Field<boolean>;
    annually: Field<boolean>;
    other: Field<boolean>;
    otherExplanation: Field<string>; // Provide explanation
  };

  // Employment information
  employerName: Field<string>;
  employerNameDontKnow: Field<boolean>;

  // Employer address
  employerAddress: {
    street: Field<string>;
    city: Field<string>;
    state: FieldWithOptions<string>;
    zipCode: Field<string>;
    country: FieldWithOptions<string>;
    dontKnow: Field<boolean>;
  };

  // Foreign government affiliation
  foreignGovernmentAffiliation: FieldWithOptions<string>; // YES, NO, I don't know
  foreignGovernmentDescription: Field<string>; // Describe the relative's relationship
}

// ============================================================================
// MAIN RELATIVE ENTRY INTERFACE
// ============================================================================

/**
 * Complete relative entry (Entry #1-6)
 * Each entry contains all subsections 18.1-18.5
 */
export interface RelativeEntry {
  // Entry metadata
  entryNumber: number; // 1-6
  
  // All subsections
  section18_1: Section18_1;
  section18_2: Section18_2;
  section18_3: Section18_3;
  section18_4: Section18_4;
  section18_5: Section18_5;
}

// ============================================================================
// MAIN SECTION INTERFACE
// ============================================================================

/**
 * Section 18 main data structure (REDESIGNED)
 * Based on actual PDF form with 6 relative entries and 964 total fields
 *
 * IMPORTANT: The PDF form uses dropdown fields for relative types within each entry,
 * not global checkboxes. Each relative entry has its own relativeType dropdown.
 */
export interface Section18 {
  _id: number;
  section18: {
    // DEPRECATED: Global relative type selection (kept for backward compatibility)
    // The actual PDF form uses dropdown fields within each relative entry
    relativeTypes?: {
      mother?: Field<boolean>;
      father?: Field<boolean>;
      stepmother?: Field<boolean>;
      stepfather?: Field<boolean>;
      fosterParent?: Field<boolean>;
      child?: Field<boolean>;
      stepchild?: Field<boolean>;
      brother?: Field<boolean>;
      sister?: Field<boolean>;
      stepbrother?: Field<boolean>;
      stepsister?: Field<boolean>;
      halfBrother?: Field<boolean>;
      halfSister?: Field<boolean>;
      fatherInLaw?: Field<boolean>;
      motherInLaw?: Field<boolean>;
      guardian?: Field<boolean>;
    };

    // 6 relative entries (each with their own relativeType dropdown)
    relatives: RelativeEntry[];
  };
}

// ============================================================================
// SUBSECTION TYPES
// ============================================================================

/**
 * Section 18 subsection keys for type safety (REDESIGNED)
 */
export type Section18SubsectionKey = 'section18_1' | 'section18_2' | 'section18_3' | 'section18_4' | 'section18_5';

// ============================================================================
// FIELD ID MAPPINGS (Based on Reference Data)
// ============================================================================

/**
 * Field ID constants for Section 18 based on actual PDF form structure
 */
export const SECTION18_FIELD_IDS = {
  // Entry 1 fields
  ENTRY_1: {
    SECTION_18_1: {
      RELATIVE_TYPE: 'section18_entry1_relativeType',
      FULL_NAME_FIRST: 'section18_entry1_firstName',
      FULL_NAME_MIDDLE: 'section18_entry1_middleName',
      FULL_NAME_LAST: 'section18_entry1_lastName',
      FULL_NAME_SUFFIX: 'section18_entry1_suffix',
      // ... more field IDs to be added
    },
    SECTION_18_2: {
      CURRENT_ADDRESS_STREET: 'section18_entry1_currentAddress_street',
      CURRENT_ADDRESS_CITY: 'section18_entry1_currentAddress_city',
      // ... more field IDs to be added
    },
    // ... sections 18.3, 18.4, 18.5
  },
  // Entry 2-6 fields follow same pattern
  // ... to be expanded
} as const;

/**
 * Type for Section 18 field IDs
 */
export type Section18FieldId = typeof SECTION18_FIELD_IDS[keyof typeof SECTION18_FIELD_IDS];
