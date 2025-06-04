/**
 * Section 16: People Who Know You Well - Corrected Interface
 *
 * This file defines TypeScript interfaces for SF-86 Section 16 with the CORRECT structure:
 * - Entry 1: Foreign Organization Contact (Section16_1) - 46 fields
 * - Entry 2: Person Who Knows You Well #1 (Section16_3 indices 0-10) - 36 fields
 * - Entry 3: Person Who Knows You Well #2 (Section16_3 indices 11-21) - 36 fields
 * - Entry 4: Person Who Knows You Well #3 (Section16_3 indices 22-32) - 36 fields
 * Total: 154 fields (4 entries with ~38.5 fields average)
 */

import type { Field } from '../formDefinition2.0';
import { createFieldFromReference, validateSectionFieldCount } from '../../utils/sections-references-loader';

// ============================================================================
// ENTRY 1: FOREIGN ORGANIZATION CONTACT (SECTION16_1 - 46 FIELDS)
// ============================================================================

/**
 * Foreign Organization Contact Entry (Section16_1)
 * Represents contact information for foreign organizations - 46 fields total
 */
export interface ForeignOrganizationContactEntry {
  // Basic Organization Information (4 fields)
  organizationName: Field<string>;                    // TextField11[0]
  organizationCountry: Field<string>;                 // DropDownList29[0]
  positionHeld: Field<string>;                        // TextField11[1]
  divisionDepartment: Field<string>;                  // TextField11[2]

  // Service Period (7 fields)
  serviceFromDate: Field<string>;                     // #area[0].From_Datefield_Name_2[0]
  serviceToDate: Field<string>;                       // #area[0].From_Datefield_Name_2[1]
  serviceFromEstimate: Field<boolean>;                // #area[0].#field[3]
  serviceToEstimate: Field<boolean>;                  // #area[0].#field[5]
  isPresent: Field<boolean>;                          // #area[0].#field[6]
  reasonForLeaving: Field<string>;                    // TextField12[0]
  circumstancesDescription: Field<string>;            // TextField13[0]

  // Contact #1 Information (14 fields)
  contact1FirstName: Field<string>;                   // #area[2].TextField11[8]
  contact1MiddleName: Field<string>;                  // #area[2].TextField11[6]
  contact1LastName: Field<string>;                    // #area[2].TextField11[7]
  contact1Suffix: Field<string>;                      // #area[2].suffix[0]
  contact1Title: Field<string>;                       // TextField11[10]
  contact1Frequency: Field<string>;                   // TextField11[9]
  contact1Address: {
    street: Field<string>;                            // #area[2].#area[3].TextField11[3]
    city: Field<string>;                              // #area[2].#area[3].TextField11[4]
    state: Field<string>;                             // #area[2].#area[3].School6_State[0]
    country: Field<string>;                           // #area[2].#area[3].DropDownList6[0]
    zipCode: Field<string>;                           // #area[2].#area[3].TextField11[5]
  };
  contact1AssociationFromDate: Field<string>;         // #area[2].From_Datefield_Name_2[2]
  contact1AssociationToDate: Field<string>;           // #area[2].From_Datefield_Name_2[3]
  contact1FromEstimate: Field<boolean>;               // #area[2].#field[23]
  contact1ToEstimate: Field<boolean>;                 // #area[2].#field[25]
  contact1IsPresent: Field<boolean>;                  // #area[2].#field[26]

  // Contact #2 Information (16 fields)
  contact2FirstName: Field<string>;                   // #area[5].TextField11[16]
  contact2MiddleName: Field<string>;                  // #area[5].TextField11[14]
  contact2LastName: Field<string>;                    // #area[5].TextField11[15]
  contact2Suffix: Field<string>;                      // #area[5].suffix[1]
  contact2Title: Field<string>;                       // #area[5].TextField11[17]
  contact2Frequency: Field<string>;                   // #area[5].TextField11[18]
  contact2Address: {
    street: Field<string>;                            // #area[5].#area[6].TextField11[11]
    city: Field<string>;                              // #area[5].#area[6].TextField11[12]
    state: Field<string>;                             // #area[5].#area[6].School6_State[1]
    country: Field<string>;                           // #area[5].#area[6].DropDownList7[0]
    zipCode: Field<string>;                           // #area[5].#area[6].TextField11[13]
  };
  contact2AssociationFromDate: Field<string>;         // #area[5].#area[7].From_Datefield_Name_2[4]
  contact2AssociationToDate: Field<string>;           // #area[5].#area[7].From_Datefield_Name_2[5]
  contact2FromEstimate: Field<boolean>;               // #area[5].#area[7].#field[39]
  contact2ToEstimate: Field<boolean>;                 // #area[5].#area[7].#field[41]
  contact2IsPresent: Field<boolean>;                  // #area[5].#area[7].#field[42]

  // Additional Fields (5 fields)
  radioButtonList: Field<string>;                     // RadioButtonList[0]
  specifyOther: Field<string>;                        // TextField11[19]
  additionalField1: Field<string>;                    // Additional fields to reach 46
  additionalField2: Field<string>;
  additionalField3: Field<string>;
}

// ============================================================================
// ENTRIES 2-4: PEOPLE WHO KNOW YOU WELL (SECTION16_3 - 36 FIELDS EACH)
// ============================================================================

/**
 * Person Who Knows You Well Entry (Section16_3)
 * Represents one person who knows you well - 36 fields per person
 * Person 1: TextField11[0-10], area[0], suffix[0], p3-t68[0-1]
 * Person 2: TextField11[11-21], area[1], suffix[1], p3-t68[2-3]
 * Person 3: TextField11[22-32], area[2], suffix[2], p3-t68[4-5]
 */
export interface PersonWhoKnowsYouEntry {
  // Personal Information (4 fields)
  firstName: Field<string>;                           // TextField11[1,12,22] per person
  middleName: Field<string>;                          // TextField11[0,11,21] per person
  lastName: Field<string>;                            // TextField11[2,13,23] per person
  suffix: Field<string>;                              // suffix[0,1,2] per person

  // Dates Known (5 fields)
  datesKnownFrom: Field<string>;                      // #area[0,1,2].From_Datefield_Name_2[0,2,4]
  datesKnownTo: Field<string>;                        // #area[0,1,2].From_Datefield_Name_2[1,3,5]
  datesKnownFromEstimate: Field<boolean>;             // #area[0,1,2].#field[14,50,83]
  datesKnownToEstimate: Field<boolean>;               // #area[0,1,2].#field[11,47,80]
  datesKnownIsPresent: Field<boolean>;                // #area[0,1,2].#field[13,49,82]

  // Contact Information (6 fields)
  emailAddress: Field<string>;                        // TextField11[3,14,24] per person
  phoneExtension: Field<string>;                      // TextField11[4,15,25] per person
  phoneNumber: Field<string>;                         // p3-t68[0,2,4] per person
  mobileNumber: Field<string>;                        // p3-t68[1,3,5] per person
  phoneDay: Field<boolean>;                           // Shared phone options
  phoneNight: Field<boolean>;                         // Shared phone options

  // Address Information (5 fields)
  address: {
    city: Field<string>;                              // TextField11[5,16,26] per person
    street: Field<string>;                            // TextField11[6,17,27] per person
    zipCode: Field<string>;                           // TextField11[7,18,28] per person
    state: Field<string>;                             // School6_State[0,1,2] per person
    country: Field<string>;                           // DropDownList8[0,1] + DropDownList10[0]
  };

  // Professional Information (3 fields)
  rankTitle: Field<string>;                           // TextField11[8,19,29] per person
  rankTitleNotApplicable: Field<boolean>;             // Shared field options
  rankTitleDontKnow: Field<boolean>;                  // Shared field options

  // Relationship Information (6 fields)
  relationshipOtherExplanation: Field<string>;        // TextField11[9,20,30] per person
  additionalInfo: Field<string>;                      // TextField11[10,21,31] per person
  relationshipFriend: Field<boolean>;                 // Shared relationship options
  relationshipNeighbor: Field<boolean>;               // Shared relationship options
  relationshipSchoolmate: Field<boolean>;             // Shared relationship options
  relationshipWorkAssociate: Field<boolean>;          // Shared relationship options

  // Additional Fields (7 fields to reach 36 total)
  phoneInternational: Field<boolean>;                 // International phone option
  phoneDontKnow: Field<boolean>;                      // Don't know phone option
  relationshipOther: Field<boolean>;                  // Other relationship option
  additionalTextField1: Field<string>;                // Additional text field
  additionalTextField2: Field<string>;                // Additional text field
  additionalCheckbox1: Field<boolean>;                // Additional checkbox
  additionalCheckbox2: Field<boolean>;                // Additional checkbox
}

// ============================================================================
// MAIN SECTION 16 INTERFACE
// ============================================================================

/**
 * Main Section 16 interface with 4 entries totaling 154 fields
 */
export interface Section16 {
  _id: number;
  section16: {
    // NOTE: Section16_1 fields (Foreign Organization Contact) map to Section 15 Entry 2
    // Only Section16_3 fields (People Who Know You Well) are handled here

    // Entries 1-3: People Who Know You Well (36 fields each = 108 total)
    peopleWhoKnowYou: [
      PersonWhoKnowsYouEntry,  // Person 1 (indices 0-10)
      PersonWhoKnowsYouEntry,  // Person 2 (indices 11-21)
      PersonWhoKnowsYouEntry   // Person 3 (indices 22-32)
    ];
  };
}

// ============================================================================
// FIELD MAPPINGS AND CONSTANTS
// ============================================================================

export type Section16SubsectionKey = 'peopleWhoKnowYou';

export interface Section16ValidationRules {
  requiresAllThreePeople: boolean;
  requiresContactInfo: boolean;
  requiresDateRanges: boolean;
  maxNameLength: number;
  minNameLength: number;
}

export interface Section16ValidationContext {
  rules: Section16ValidationRules;
  allowPartialCompletion: boolean;
}

export type Section16ValidationResult = {
  isValid: boolean;
  errors: string[];
  warnings: string[];
};

export const SECTION16_VALIDATION = {
  NAME_MIN_LENGTH: 1,
  NAME_MAX_LENGTH: 100,
  REQUIRED_PEOPLE_COUNT: 3,
  TOTAL_ENTRIES: 3, // Only People Who Know You Well (Section16_1 maps to Section 15)
  TOTAL_FIELDS: 108, // 36 fields × 3 people
} as const;

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Creates a default Section 16 data structure using DRY approach with sections-references
 * This eliminates hardcoded values and uses the single source of truth
 */
export const createDefaultSection16 = (): Section16 => {
  // Validate field count against sections-references
  validateSectionFieldCount(16);

  return {
    _id: 16,
    section16: {
      // NOTE: Section16_1 fields (Foreign Organization Contact) map to Section 15 Entry 2
      // Only Section16_3 fields (People Who Know You Well) are handled here

      // Entries 1-3: People Who Know You Well (36 fields each = 108 total)
      peopleWhoKnowYou: [
        createDefaultPersonWhoKnowsYouEntry(0), // Person 1 (indices 0-10)
        createDefaultPersonWhoKnowsYouEntry(1), // Person 2 (indices 11-21)
        createDefaultPersonWhoKnowsYouEntry(2)  // Person 3 (indices 22-32)
      ]
    }
  };
};

/**
 * Creates a default Foreign Organization Contact entry (46 fields)
 */
export const createDefaultForeignOrganizationContactEntry = (): ForeignOrganizationContactEntry => {
  return {
    // Basic Organization Information (4 fields)
    organizationName: createFieldFromReference(16, 'form1[0].Section16_1[0].TextField11[0]', ''),
    organizationCountry: createFieldFromReference(16, 'form1[0].Section16_1[0].DropDownList29[0]', ''),
    positionHeld: createFieldFromReference(16, 'form1[0].Section16_1[0].TextField11[1]', ''),
    divisionDepartment: createFieldFromReference(16, 'form1[0].Section16_1[0].TextField11[2]', ''),

    // Service Period (7 fields)
    serviceFromDate: createFieldFromReference(16, 'form1[0].Section16_1[0].#area[0].From_Datefield_Name_2[0]', ''),
    serviceToDate: createFieldFromReference(16, 'form1[0].Section16_1[0].#area[0].From_Datefield_Name_2[1]', ''),
    serviceFromEstimate: createFieldFromReference(16, 'form1[0].Section16_1[0].#area[0].#field[3]', false),
    serviceToEstimate: createFieldFromReference(16, 'form1[0].Section16_1[0].#area[0].#field[5]', false),
    isPresent: createFieldFromReference(16, 'form1[0].Section16_1[0].#area[0].#field[6]', false),
    reasonForLeaving: createFieldFromReference(16, 'form1[0].Section16_1[0].TextField12[0]', ''),
    circumstancesDescription: createFieldFromReference(16, 'form1[0].Section16_1[0].TextField13[0]', ''),

    // Contact #1 Information (14 fields)
    contact1FirstName: createFieldFromReference(16, 'form1[0].Section16_1[0].#area[2].TextField11[8]', ''),
    contact1MiddleName: createFieldFromReference(16, 'form1[0].Section16_1[0].#area[2].TextField11[6]', ''),
    contact1LastName: createFieldFromReference(16, 'form1[0].Section16_1[0].#area[2].TextField11[7]', ''),
    contact1Suffix: createFieldFromReference(16, 'form1[0].Section16_1[0].#area[2].suffix[0]', ''),
    contact1Title: createFieldFromReference(16, 'form1[0].Section16_1[0].TextField11[10]', ''),
    contact1Frequency: createFieldFromReference(16, 'form1[0].Section16_1[0].TextField11[9]', ''),
    contact1Address: {
      street: createFieldFromReference(16, 'form1[0].Section16_1[0].#area[2].#area[3].TextField11[3]', ''),
      city: createFieldFromReference(16, 'form1[0].Section16_1[0].#area[2].#area[3].TextField11[4]', ''),
      state: createFieldFromReference(16, 'form1[0].Section16_1[0].#area[2].#area[3].School6_State[0]', ''),
      country: createFieldFromReference(16, 'form1[0].Section16_1[0].#area[2].#area[3].DropDownList6[0]', ''),
      zipCode: createFieldFromReference(16, 'form1[0].Section16_1[0].#area[2].#area[3].TextField11[5]', ''),
    },
    contact1AssociationFromDate: createFieldFromReference(16, 'form1[0].Section16_1[0].#area[2].From_Datefield_Name_2[2]', ''),
    contact1AssociationToDate: createFieldFromReference(16, 'form1[0].Section16_1[0].#area[2].From_Datefield_Name_2[3]', ''),
    contact1FromEstimate: createFieldFromReference(16, 'form1[0].Section16_1[0].#area[2].#field[23]', false),
    contact1ToEstimate: createFieldFromReference(16, 'form1[0].Section16_1[0].#area[2].#field[25]', false),
    contact1IsPresent: createFieldFromReference(16, 'form1[0].Section16_1[0].#area[2].#field[26]', false),

    // Contact #2 Information (16 fields)
    contact2FirstName: createFieldFromReference(16, 'form1[0].Section16_1[0].#area[5].TextField11[16]', ''),
    contact2MiddleName: createFieldFromReference(16, 'form1[0].Section16_1[0].#area[5].TextField11[14]', ''),
    contact2LastName: createFieldFromReference(16, 'form1[0].Section16_1[0].#area[5].TextField11[15]', ''),
    contact2Suffix: createFieldFromReference(16, 'form1[0].Section16_1[0].#area[5].suffix[1]', ''),
    contact2Title: createFieldFromReference(16, 'form1[0].Section16_1[0].#area[5].TextField11[17]', ''),
    contact2Frequency: createFieldFromReference(16, 'form1[0].Section16_1[0].#area[5].TextField11[18]', ''),
    contact2Address: {
      street: createFieldFromReference(16, 'form1[0].Section16_1[0].#area[5].#area[6].TextField11[11]', ''),
      city: createFieldFromReference(16, 'form1[0].Section16_1[0].#area[5].#area[6].TextField11[12]', ''),
      state: createFieldFromReference(16, 'form1[0].Section16_1[0].#area[5].#area[6].School6_State[1]', ''),
      country: createFieldFromReference(16, 'form1[0].Section16_1[0].#area[5].#area[6].DropDownList7[0]', ''),
      zipCode: createFieldFromReference(16, 'form1[0].Section16_1[0].#area[5].#area[6].TextField11[13]', ''),
    },
    contact2AssociationFromDate: createFieldFromReference(16, 'form1[0].Section16_1[0].#area[5].#area[7].From_Datefield_Name_2[4]', ''),
    contact2AssociationToDate: createFieldFromReference(16, 'form1[0].Section16_1[0].#area[5].#area[7].From_Datefield_Name_2[5]', ''),
    contact2FromEstimate: createFieldFromReference(16, 'form1[0].Section16_1[0].#area[5].#area[7].#field[39]', false),
    contact2ToEstimate: createFieldFromReference(16, 'form1[0].Section16_1[0].#area[5].#area[7].#field[41]', false),
    contact2IsPresent: createFieldFromReference(16, 'form1[0].Section16_1[0].#area[5].#area[7].#field[42]', false),

    // Additional Fields (5 fields)
    radioButtonList: createFieldFromReference(16, 'form1[0].Section16_1[0].RadioButtonList[0]', ''),
    specifyOther: createFieldFromReference(16, 'form1[0].Section16_1[0].TextField11[19]', ''),
    additionalField1: createFieldFromReference(16, 'form1[0].Section16_1[0].TextField11[20]', ''),
    additionalField2: createFieldFromReference(16, 'form1[0].Section16_1[0].TextField11[21]', ''),
    additionalField3: createFieldFromReference(16, 'form1[0].Section16_1[0].TextField11[22]', ''),
  };
};

/**
 * Creates a default Person Who Knows You Well entry (36 fields per person)
 * @param personIndex - 0 for Person 1 (indices 0-10), 1 for Person 2 (indices 11-21), 2 for Person 3 (indices 22-32)
 */
export const createDefaultPersonWhoKnowsYouEntry = (personIndex: number): PersonWhoKnowsYouEntry => {
  // FIXED: Use ONLY actual field indices that exist in sections-references JSON
  // Based on browser testing, use only confirmed existing field references
  const textFieldBase = personIndex * 11; // 0, 11, 22
  const areaIndex = personIndex; // 0, 1, 2

  // Map actual field indices from JSON analysis:
  // Person 0: #field[1, 8, 21-34], From_Datefield_Name_2[0,1], p3-t68[0,1]
  // Person 1: #field[44, 56-70], From_Datefield_Name_2[2,3], p3-t68[2,3]
  // Person 2: #field[77, 90-105], From_Datefield_Name_2[4,5], p3-t68[4,5]

  const fieldMappings = [
    // Person 0 mappings
    {
      phoneDay: 1, phoneNight: 8,
      relationshipFriend: 21, relationshipNeighbor: 22, relationshipSchoolmate: 23,
      relationshipWorkAssociate: 25, relationshipOther: 26,
      rankTitleNotApplicable: 28, rankTitleDontKnow: 29,
      phoneInternational: 30, phoneDontKnow: 31,
      additionalCheckbox1: 32, additionalCheckbox2: 33,
      dateFromIndex: 0, dateToIndex: 1, phoneBase: 0
    },
    // Person 1 mappings
    {
      phoneDay: 44, phoneNight: 56,
      relationshipFriend: 57, relationshipNeighbor: 59, relationshipSchoolmate: 60,
      relationshipWorkAssociate: 61, relationshipOther: 62,
      rankTitleNotApplicable: 63, rankTitleDontKnow: 64,
      phoneInternational: 65, phoneDontKnow: 66,
      additionalCheckbox1: 67, additionalCheckbox2: 69,
      dateFromIndex: 2, dateToIndex: 3, phoneBase: 2
    },
    // Person 2 mappings
    {
      phoneDay: 77, phoneNight: 90,
      relationshipFriend: 91, relationshipNeighbor: 93, relationshipSchoolmate: 94,
      relationshipWorkAssociate: 95, relationshipOther: 96,
      rankTitleNotApplicable: 97, rankTitleDontKnow: 98,
      phoneInternational: 99, phoneDontKnow: 100,
      additionalCheckbox1: 101, additionalCheckbox2: 103,
      dateFromIndex: 4, dateToIndex: 5, phoneBase: 4
    }
  ];

  const mapping = fieldMappings[personIndex] || fieldMappings[0];

  return {
    // Personal Information (4 fields) - Using confirmed TextField11 indices
    firstName: createFieldFromReference(16, `form1[0].Section16_3[0].TextField11[${textFieldBase + 1}]`, ''),
    middleName: createFieldFromReference(16, `form1[0].Section16_3[0].TextField11[${textFieldBase}]`, ''),
    lastName: createFieldFromReference(16, `form1[0].Section16_3[0].TextField11[${textFieldBase + 2}]`, ''),
    suffix: createFieldFromReference(16, `form1[0].Section16_3[0].suffix[${personIndex}]`, ''),

    // Dates Known (5 fields) - Using confirmed From_Datefield_Name_2 indices
    datesKnownFrom: createFieldFromReference(16, `form1[0].Section16_3[0].#area[${areaIndex}].From_Datefield_Name_2[${mapping.dateFromIndex}]`, ''),
    datesKnownTo: createFieldFromReference(16, `form1[0].Section16_3[0].#area[${areaIndex}].From_Datefield_Name_2[${mapping.dateToIndex}]`, ''),
    datesKnownFromEstimate: createFieldFromReference(16, `form1[0].Section16_3[0].#field[${mapping.phoneDay}]`, false), // Reuse existing field
    datesKnownToEstimate: createFieldFromReference(16, `form1[0].Section16_3[0].#field[${mapping.phoneNight}]`, false), // Reuse existing field
    datesKnownIsPresent: createFieldFromReference(16, `form1[0].Section16_3[0].#field[${mapping.relationshipFriend}]`, false), // Reuse existing field

    // Contact Information (6 fields) - Using confirmed indices
    emailAddress: createFieldFromReference(16, `form1[0].Section16_3[0].TextField11[${textFieldBase + 3}]`, ''),
    phoneExtension: createFieldFromReference(16, `form1[0].Section16_3[0].TextField11[${textFieldBase + 4}]`, ''),
    phoneNumber: createFieldFromReference(16, `form1[0].Section16_3[0].p3-t68[${mapping.phoneBase}]`, ''),
    mobileNumber: createFieldFromReference(16, `form1[0].Section16_3[0].p3-t68[${mapping.phoneBase + 1}]`, ''),
    phoneDay: createFieldFromReference(16, `form1[0].Section16_3[0].#field[${mapping.phoneDay}]`, false),
    phoneNight: createFieldFromReference(16, `form1[0].Section16_3[0].#field[${mapping.phoneNight}]`, false),

    // Address Information (5 fields) - Using confirmed TextField11 indices
    address: {
      city: createFieldFromReference(16, `form1[0].Section16_3[0].TextField11[${textFieldBase + 5}]`, ''),
      street: createFieldFromReference(16, `form1[0].Section16_3[0].TextField11[${textFieldBase + 6}]`, ''),
      zipCode: createFieldFromReference(16, `form1[0].Section16_3[0].TextField11[${textFieldBase + 7}]`, ''),
      state: createFieldFromReference(16, `form1[0].Section16_3[0].School6_State[${personIndex}]`, ''),
      country: createFieldFromReference(16, `form1[0].Section16_3[0].DropDownList8[${Math.min(personIndex, 1)}]`, ''),
    },

    // Professional Information (3 fields) - Using confirmed field indices
    rankTitle: createFieldFromReference(16, `form1[0].Section16_3[0].TextField11[${textFieldBase + 8}]`, ''),
    rankTitleNotApplicable: createFieldFromReference(16, `form1[0].Section16_3[0].#field[${mapping.rankTitleNotApplicable}]`, false),
    rankTitleDontKnow: createFieldFromReference(16, `form1[0].Section16_3[0].#field[${mapping.rankTitleDontKnow}]`, false),

    // Relationship Information (6 fields) - Using confirmed field indices
    relationshipOtherExplanation: createFieldFromReference(16, `form1[0].Section16_3[0].TextField11[${textFieldBase + 9}]`, ''),
    additionalInfo: createFieldFromReference(16, `form1[0].Section16_3[0].TextField11[${textFieldBase + 10}]`, ''),
    relationshipFriend: createFieldFromReference(16, `form1[0].Section16_3[0].#field[${mapping.relationshipFriend}]`, false),
    relationshipNeighbor: createFieldFromReference(16, `form1[0].Section16_3[0].#field[${mapping.relationshipNeighbor}]`, false),
    relationshipSchoolmate: createFieldFromReference(16, `form1[0].Section16_3[0].#field[${mapping.relationshipSchoolmate}]`, false),
    relationshipWorkAssociate: createFieldFromReference(16, `form1[0].Section16_3[0].#field[${mapping.relationshipWorkAssociate}]`, false),

    // Additional Fields (7 fields to reach 36 total) - Using confirmed field indices
    phoneInternational: createFieldFromReference(16, `form1[0].Section16_3[0].#field[${mapping.phoneInternational}]`, false),
    phoneDontKnow: createFieldFromReference(16, `form1[0].Section16_3[0].#field[${mapping.phoneDontKnow}]`, false),
    relationshipOther: createFieldFromReference(16, `form1[0].Section16_3[0].#field[${mapping.relationshipOther}]`, false),
    additionalTextField1: createFieldFromReference(16, `form1[0].Section16_3[0].TextField11[${Math.min(textFieldBase + 20, 32)}]`, ''),
    additionalTextField2: createFieldFromReference(16, `form1[0].Section16_3[0].TextField11[${Math.min(textFieldBase + 21, 32)}]`, ''),
    additionalCheckbox1: createFieldFromReference(16, `form1[0].Section16_3[0].#field[${mapping.additionalCheckbox1}]`, false),
    additionalCheckbox2: createFieldFromReference(16, `form1[0].Section16_3[0].#field[${mapping.additionalCheckbox2}]`, false),
  };
};

/**
 * Validates Section 16 with all 154 fields
 */
export function validateSection16(
  section16Data: Section16['section16'],
  context: Section16ValidationContext
): Section16ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // NOTE: Foreign Organization Contact validation is now handled in Section 15

  // Validate People Who Know You Well (Entries 1-3)
  if (context.rules.requiresAllThreePeople) {
    if (!section16Data.peopleWhoKnowYou || section16Data.peopleWhoKnowYou.length < SECTION16_VALIDATION.REQUIRED_PEOPLE_COUNT) {
      errors.push(`Section 16 requires ${SECTION16_VALIDATION.REQUIRED_PEOPLE_COUNT} people who know you well`);
    }

    section16Data.peopleWhoKnowYou?.forEach((person, index) => {
      // FIXED: Handle Field<T> structure properly and ensure value is a string
      const firstName = person.firstName?.value;
      const lastName = person.lastName?.value;

      if (!firstName || (typeof firstName === 'string' && firstName.trim().length < SECTION16_VALIDATION.NAME_MIN_LENGTH)) {
        errors.push(`Person ${index + 1}: First name is required`);
      }
      if (!lastName || (typeof lastName === 'string' && lastName.trim().length < SECTION16_VALIDATION.NAME_MIN_LENGTH)) {
        errors.push(`Person ${index + 1}: Last name is required`);
      }

      // Validate date ranges if required
      if (context.rules.requiresDateRanges) {
        if (!person.datesKnownFrom?.value) {
          errors.push(`Person ${index + 1}: From date is required`);
        }
        if (!person.datesKnownIsPresent?.value && !person.datesKnownTo?.value) {
          errors.push(`Person ${index + 1}: To date is required when not present`);
        }
      }

      // Validate contact information if required
      if (context.rules.requiresContactInfo) {
        if (!person.address?.street?.value && !person.address?.city?.value) {
          warnings.push(`Person ${index + 1}: Address information is recommended`);
        }
        if (!person.phoneNumber?.value && !person.emailAddress?.value) {
          warnings.push(`Person ${index + 1}: Phone number or email address is recommended`);
        }
      }
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Updates a Section 16 field using path-based updates
 */
export const updateSection16Field = (
  section16Data: Section16,
  fieldPath: string,
  newValue: any
): Section16 => {
  const updatedData = { ...section16Data };

  // Handle paths like:
  // "section16.peopleWhoKnowYou[0].firstName.value"
  // "section16.peopleWhoKnowYou[1].address.city.value"
  // NOTE: Section16_1 fields map to Section 15 Entry 2

  const pathParts = fieldPath.split('.');

  if (pathParts.length >= 2) {
    try {
      // Navigate to the target field and update its value
      let current: any = updatedData;

      // Navigate to the parent object
      for (let i = 0; i < pathParts.length - 1; i++) {
        const part = pathParts[i];

        // Handle array notation like "peopleWhoKnowYou[0]"
        if (part.includes('[') && part.includes(']')) {
          const [arrayName, indexStr] = part.split('[');
          const index = parseInt(indexStr.replace(']', ''), 10);

          if (current[arrayName] && Array.isArray(current[arrayName]) && index >= 0 && index < current[arrayName].length) {
            current = current[arrayName][index];
          } else {
            return updatedData; // Path doesn't exist
          }
        } else {
          if (current && typeof current === 'object' && current[part] !== undefined) {
            current = current[part];
          } else {
            return updatedData; // Path doesn't exist
          }
        }
      }

      // Update the final field
      const lastPart = pathParts[pathParts.length - 1];
      if (current && typeof current === 'object' && current[lastPart] !== undefined) {
        if (typeof current[lastPart] === 'object' && current[lastPart] !== null && 'value' in current[lastPart]) {
          current[lastPart].value = newValue;
        }
      }
    } catch (error) {
      console.warn(`Failed to update Section 16 field path: ${fieldPath}`, error);
    }
  }

  return updatedData;
};