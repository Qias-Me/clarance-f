/**
 * Section 11: Where You Have Lived
 *
 * TypeScript interface definitions for SF-86 Section 11 (Where You Have Lived) data structure.
 * Following the residencyInfo.ts pattern with human-readable field names, proper value types,
 * and createReferenceFrom() method for PDF mapping.
 *
 * Based on section-11.json reference data: 252 total fields (63 per entry × 4 entries)
 * Entry patterns: Section11[0], Section11-2[0], Section11-3[0], Section11-4[0]
 */

import type { Field, FieldWithOptions } from '../formDefinition2.0';
import type { USState, Country, Suffix } from './base';
import { getUSStateOptions, getCountryOptions, getSuffixOptions } from './base';
import { createFieldFromReference, validateSectionFieldCount } from '../../utils/sections-references-loader';
import { generateFieldName } from '../../../app/state/contexts/sections2.0/section11-field-mapping';


// ============================================================================
// CORE INTERFACES - HUMAN READABLE STRUCTURE
// ============================================================================

/**
 * Residence dates information
 */
export interface ResidenceDates {
  fromDate: Field<string>;
  fromDateEstimate: Field<boolean>;
  toDate: Field<string>;
  toDateEstimate: Field<boolean>;
  isPresent: Field<boolean>;
}

/**
 * Residence address information
 */
export interface ResidenceAddress {
  streetAddress: Field<string>;
  city: Field<string>;
  state: FieldWithOptions<string>;
  country: FieldWithOptions<string>;
  zipCode: Field<string>;
}

/**
 * Residence type information
 */
export interface ResidenceType {
  type: FieldWithOptions<"1" | "2" | "3" | "4">; // 1=Own, 2=Rent, 3=Military Housing, 4=Other
  otherExplanation: Field<string>;
}

/**
 * Contact person name information
 */
export interface ContactPersonName {
  firstName: Field<string>;
  middleName?: Field<string>;
  lastName: Field<string>;
  suffix?: FieldWithOptions<string>;
}

/**
 * Contact person phone information
 */
export interface ContactPersonPhones {
  eveningPhone: Field<string>;
  eveningPhoneExtension?: Field<string>;
  eveningPhoneIsInternational: Field<boolean>;
  daytimePhone: Field<string>;
  daytimePhoneExtension?: Field<string>;
  daytimePhoneIsInternational: Field<boolean>;
  daytimePhoneUnknown: Field<boolean>;
  mobilePhone: Field<string>;
  mobilePhoneExtension?: Field<string>;
  mobilePhoneIsInternational: Field<boolean>;
  mobilePhoneUnknown: Field<boolean>;
  dontKnowContact: Field<boolean>;
}

/**
 * Contact person relationship information
 */
export interface ContactPersonRelationship {
  isNeighbor: Field<boolean>;
  isFriend: Field<boolean>;
  isLandlord: Field<boolean>;
  isBusinessAssociate: Field<boolean>;
  isOther: Field<boolean>;
  otherExplanation: Field<string>;
}


/**
 * Contact person address information
 */
export interface ContactPersonAddress {
  streetAddress: Field<string>;
  city: Field<string>;
  state: FieldWithOptions<string>;
  country: FieldWithOptions<string>;
  zipCode: Field<string>;
}

/**
 * Contact person email information
 */
export interface ContactPersonEmail {
  email: Field<string>;
  emailUnknown: Field<boolean>;
}

/**
 * Last contact information
 */
export interface LastContactInfo {
  lastContactDate: Field<string>;
  lastContactEstimate: Field<boolean>;
}

/**
 * APO/FPO physical address information for military addresses
 * Accounts for all 15 physical address fields per entry
 */
export interface APOFPOPhysicalAddress {
  // Primary physical address (5 fields)
  physicalStreetAddress: Field<string>;        // TextField11[13]
  physicalCity: Field<string>;                 // TextField11[14]
  physicalState: FieldWithOptions<string>;     // School6_State[2]
  physicalCountry: FieldWithOptions<string>;   // DropDownList4[0]
  physicalZipCode: Field<string>;              // TextField11[18]

  // APO/FPO address (3 fields)
  apoFpoAddress: Field<string>;                // TextField11[16]
  apoFpoState: FieldWithOptions<string>;       // School6_State[3]
  apoFpoZipCode: Field<string>;                // TextField11[17]

  // Alternative physical address (7 fields)
  physicalAddressAlt: Field<string>;           // TextField11[15]
  physicalAltStreet: Field<string>;            // TextField11[19]
  physicalAltCity: Field<string>;              // TextField11[20]
  physicalAltState: FieldWithOptions<string>;  // School6_State[4]
  physicalAltCountry: FieldWithOptions<string>; // DropDownList4[1]
  physicalAltZip: Field<string>;               // TextField11[21]
  physicalAddressFull: Field<string>;          // TextField11[22]
}

/**
 * Additional radio button fields and APO/FPO alternatives
 * Accounts for remaining fields to reach 63 per entry
 */
export interface AdditionalFields {
  // Radio button fields (3 fields)
  addressTypeRadio: FieldWithOptions<"YES" | "NO">;     // RadioButtonList[1]
  residenceTypeRadioAlt: FieldWithOptions<"YES" | "NO">; // RadioButtonList[2]

  // Additional APO/FPO fields (3 fields)
  apoFpoFull: Field<string>;                   // TextField11[23]
  apoFpoStateAlt: FieldWithOptions<string>;    // School6_State[5]
  apoFpoZipAlt: Field<string>;                 // TextField11[24]
}

/**
 * Complete residence entry structure following residencyInfo.ts pattern
 * Human-readable field names with logical groupings
 * Accounts for all 63 fields per entry: 5+5+2+4+12+6+5+2+2+15+5 = 63 fields
 */
export interface ResidenceEntry {
  _id: number;
  residenceDates: ResidenceDates;                    // 5 fields
  residenceAddress: ResidenceAddress;               // 5 fields
  residenceType: ResidenceType;                     // 2 fields
  contactPersonName: ContactPersonName;             // 4 fields
  contactPersonPhones: ContactPersonPhones;         // 12 fields
  contactPersonRelationship: ContactPersonRelationship; // 6 fields
  contactPersonAddress: ContactPersonAddress;       // 5 fields
  contactPersonEmail: ContactPersonEmail;           // 2 fields
  lastContactInfo: LastContactInfo;                 // 2 fields
  apoFpoPhysicalAddress: APOFPOPhysicalAddress;     // 15 fields
  additionalFields: AdditionalFields;               // 5 fields
  // Total: 63 fields per entry ✓
}

/**
 * Section 11 main data structure
 */
export interface Section11 {
  _id: number;
  section11: {
    residences: ResidenceEntry[];
  };
}

// ============================================================================
// CREATE REFERENCE FROM METHODS - PDF MAPPING
// ============================================================================

/**
 * Creates ResidenceDates from PDF field references
 */
export const createResidenceDatesFromReference = (entryIndex: number): ResidenceDates => {
  const entryPattern = entryIndex === 0 ? 'Section11[0]' : `Section11-${entryIndex + 1}[0]`;

  return {
    fromDate: createFieldFromReference(
      11,
      `form1[0].${entryPattern}.From_Datefield_Name_2[0]`,
      ''
    ),
    fromDateEstimate: createFieldFromReference(
      11,
      `form1[0].${entryPattern}.#field[15]`,
      false
    ),
    toDate: createFieldFromReference(
      11,
      `form1[0].${entryPattern}.From_Datefield_Name_2[1]`,
      ''
    ),
    toDateEstimate: createFieldFromReference(
      11,
      `form1[0].${entryPattern}.#field[18]`,
      false
    ),
    isPresent: createFieldFromReference(
      11,
      `form1[0].${entryPattern}.#field[17]`,
      false
    )
  };
};

/**
 * Creates ResidenceAddress from PDF field references
 */
export const createResidenceAddressFromReference = (entryIndex: number): ResidenceAddress => {
  const entryPattern = entryIndex === 0 ? 'Section11[0]' : `Section11-${entryIndex + 1}[0]`;

  return {
    streetAddress: createFieldFromReference(
      11,
      `form1[0].${entryPattern}.TextField11[3]`,
      ''
    ),
    city: createFieldFromReference(
      11,
      `form1[0].${entryPattern}.TextField11[4]`,
      ''
    ),
    state: {
      ...createFieldFromReference(
        11,
        `form1[0].${entryPattern}.School6_State[0]`,
        ''
      ),
      options: getUSStateOptions().map(option => option.value)
    },
    country: {
      ...createFieldFromReference(
        11,
        `form1[0].${entryPattern}.DropDownList5[0]`,
        'United States'
      ),
      options: getCountryOptions().map(option => option.value)
    },
    zipCode: createFieldFromReference(
      11,
      `form1[0].${entryPattern}.TextField11[5]`,
      ''
    )
  };
};

/**
 * Creates ResidenceType from PDF field references
 */
export const createResidenceTypeFromReference = (entryIndex: number): ResidenceType => {
  const entryPattern = entryIndex === 0 ? 'Section11[0]' : `Section11-${entryIndex + 1}[0]`;

  return {
    type: {
      ...createFieldFromReference(
        11,
        `form1[0].${entryPattern}.RadioButtonList[0]`,
        '1'
      ),
      options: ['1', '2', '3', '4'] // 1=Own, 2=Rent, 3=Military Housing, 4=Other
    },
    otherExplanation: createFieldFromReference(
      11,
      `form1[0].${entryPattern}.TextField12[0]`,
      ''
    )
  };
};

/**
 * Creates ContactPersonName from PDF field references
 */
export const createContactPersonNameFromReference = (entryIndex: number): ContactPersonName => {
  const entryPattern = entryIndex === 0 ? 'Section11[0]' : `Section11-${entryIndex + 1}[0]`;

  return {
    firstName: createFieldFromReference(
      11,
      `form1[0].${entryPattern}.TextField11[8]`,
      ''
    ),
    middleName: createFieldFromReference(
      11,
      `form1[0].${entryPattern}.TextField11[6]`,
      ''
    ),
    lastName: createFieldFromReference(
      11,
      `form1[0].${entryPattern}.TextField11[7]`,
      ''
    ),
    suffix: {
      ...createFieldFromReference(
        11,
        `form1[0].${entryPattern}.suffix[0]`,
        ''
      ),
      options: getSuffixOptions().map(option => option.value)
    }
  };
};

/**
 * Creates ContactPersonPhones from PDF field references
 */
export const createContactPersonPhonesFromReference = (entryIndex: number): ContactPersonPhones => {
  const entryPattern = entryIndex === 0 ? 'Section11[0]' : `Section11-${entryIndex + 1}[0]`;

  return {
    eveningPhone: createFieldFromReference(
      11,
      `form1[0].${entryPattern}.p3-t68[0]`,
      ''
    ),
    eveningPhoneExtension: createFieldFromReference(
      11,
      `form1[0].${entryPattern}.TextField11[0]`,
      ''
    ),
    eveningPhoneIsInternational: createFieldFromReference(
      11,
      `form1[0].${entryPattern}.#field[4]`,
      false
    ),
    daytimePhone: createFieldFromReference(
      11,
      `form1[0].${entryPattern}.p3-t68[1]`,
      ''
    ),
    daytimePhoneExtension: createFieldFromReference(
      11,
      `form1[0].${entryPattern}.TextField11[1]`,
      ''
    ),
    daytimePhoneIsInternational: createFieldFromReference(
      11,
      `form1[0].${entryPattern}.#field[10]`,
      false
    ),
    daytimePhoneUnknown: createFieldFromReference(
      11,
      `form1[0].${entryPattern}.#field[11]`,
      false
    ),
    mobilePhone: createFieldFromReference(
      11,
      `form1[0].${entryPattern}.p3-t68[2]`,
      ''
    ),
    mobilePhoneExtension: createFieldFromReference(
      11,
      `form1[0].${entryPattern}.TextField11[2]`,
      ''
    ),
    mobilePhoneIsInternational: createFieldFromReference(
      11,
      `form1[0].${entryPattern}.#field[12]`,
      false
    ),
    mobilePhoneUnknown: createFieldFromReference(
      11,
      `form1[0].${entryPattern}.#field[13]`,
      false
    ),
    dontKnowContact: createFieldFromReference(
      11,
      `form1[0].${entryPattern}.#field[5]`,
      false
    )
  };
};

/**
 * Creates ContactPersonRelationship from PDF field references
 */
export const createContactPersonRelationshipFromReference = (entryIndex: number): ContactPersonRelationship => {
  const entryPattern = entryIndex === 0 ? 'Section11[0]' : `Section11-${entryIndex + 1}[0]`;

  return {
    isNeighbor: createFieldFromReference(
      11,
      `form1[0].${entryPattern}.#field[29]`,
      false
    ),
    isFriend: createFieldFromReference(
      11,
      `form1[0].${entryPattern}.#field[30]`,
      false
    ),
    isLandlord: createFieldFromReference(
      11,
      `form1[0].${entryPattern}.#field[31]`,
      false
    ),
    isBusinessAssociate: createFieldFromReference(
      11,
      `form1[0].${entryPattern}.#field[32]`,
      false
    ),
    isOther: createFieldFromReference(
      11,
      `form1[0].${entryPattern}.#field[33]`,
      false
    ),
    otherExplanation: createFieldFromReference(
      11,
      `form1[0].${entryPattern}.TextField11[9]`,
      ''
    )
  };
};

/**
 * Creates ContactPersonAddress from PDF field references
 */
export const createContactPersonAddressFromReference = (entryIndex: number): ContactPersonAddress => {
  const entryPattern = entryIndex === 0 ? 'Section11[0]' : `Section11-${entryIndex + 1}[0]`;

  return {
    streetAddress: createFieldFromReference(
      11,
      `form1[0].${entryPattern}.TextField11[10]`,
      ''
    ),
    city: createFieldFromReference(
      11,
      `form1[0].${entryPattern}.TextField11[11]`,
      ''
    ),
    state: {
      ...createFieldFromReference(
        11,
        `form1[0].${entryPattern}.School6_State[1]`,
        ''
      ),
      options: getUSStateOptions().map(option => option.value)
    },
    country: {
      ...createFieldFromReference(
        11,
        `form1[0].${entryPattern}.DropDownList3[0]`,
        'United States'
      ),
      options: getCountryOptions().map(option => option.value)
    },
    zipCode: createFieldFromReference(
      11,
      `form1[0].${entryPattern}.TextField11[12]`,
      ''
    )
  };
};

/**
 * Creates ContactPersonEmail from PDF field references
 */
export const createContactPersonEmailFromReference = (entryIndex: number): ContactPersonEmail => {
  const entryPattern = entryIndex === 0 ? 'Section11[0]' : `Section11-${entryIndex + 1}[0]`;

  return {
    email: createFieldFromReference(
      11,
      `form1[0].${entryPattern}.p3-t68[3]`,
      ''
    ),
    emailUnknown: createFieldFromReference(
      11,
      `form1[0].${entryPattern}.#field[41]`,
      false
    )
  };
};

/**
 * Creates LastContactInfo from PDF field references
 */
export const createLastContactInfoFromReference = (entryIndex: number): LastContactInfo => {
  const entryPattern = entryIndex === 0 ? 'Section11[0]' : `Section11-${entryIndex + 1}[0]`;

  return {
    lastContactDate: createFieldFromReference(
      11,
      `form1[0].${entryPattern}.From_Datefield_Name_2[2]`,
      ''
    ),
    lastContactEstimate: createFieldFromReference(
      11,
      `form1[0].${entryPattern}.#field[43]`,
      false
    )
  };
};

/**
 * Creates APOFPOPhysicalAddress from PDF field references
 * Accounts for all 15 physical address fields per entry
 */
export const createAPOFPOPhysicalAddressFromReference = (entryIndex: number): APOFPOPhysicalAddress => {
  const entryPattern = entryIndex === 0 ? 'Section11[0]' : `Section11-${entryIndex + 1}[0]`;

  return {
    // Primary physical address (5 fields)
    physicalStreetAddress: createFieldFromReference(
      11,
      `form1[0].${entryPattern}.TextField11[13]`,
      ''
    ),
    physicalCity: createFieldFromReference(
      11,
      `form1[0].${entryPattern}.TextField11[14]`,
      ''
    ),
    physicalState: {
      ...createFieldFromReference(
        11,
        `form1[0].${entryPattern}.School6_State[2]`,
        ''
      ),
      options: getUSStateOptions().map(option => option.value)
    },
    physicalCountry: {
      ...createFieldFromReference(
        11,
        `form1[0].${entryPattern}.DropDownList4[0]`,
        'United States'
      ),
      options: getCountryOptions().map(option => option.value)
    },
    physicalZipCode: createFieldFromReference(
      11,
      `form1[0].${entryPattern}.TextField11[18]`,
      ''
    ),

    // APO/FPO address (3 fields)
    apoFpoAddress: createFieldFromReference(
      11,
      `form1[0].${entryPattern}.TextField11[16]`,
      ''
    ),
    apoFpoState: {
      ...createFieldFromReference(
        11,
        `form1[0].${entryPattern}.School6_State[3]`,
        ''
      ),
      options: ['AA', 'AE', 'AP'] // APO/FPO state codes
    },
    apoFpoZipCode: createFieldFromReference(
      11,
      `form1[0].${entryPattern}.TextField11[17]`,
      ''
    ),

    // Alternative physical address (7 fields)
    physicalAddressAlt: createFieldFromReference(
      11,
      `form1[0].${entryPattern}.TextField11[15]`,
      ''
    ),
    physicalAltStreet: createFieldFromReference(
      11,
      `form1[0].${entryPattern}.TextField11[19]`,
      ''
    ),
    physicalAltCity: createFieldFromReference(
      11,
      `form1[0].${entryPattern}.TextField11[20]`,
      ''
    ),
    physicalAltState: {
      ...createFieldFromReference(
        11,
        `form1[0].${entryPattern}.School6_State[4]`,
        ''
      ),
      options: getUSStateOptions().map(option => option.value)
    },
    physicalAltCountry: {
      ...createFieldFromReference(
        11,
        `form1[0].${entryPattern}.DropDownList4[1]`,
        'United States'
      ),
      options: getCountryOptions().map(option => option.value)
    },
    physicalAltZip: createFieldFromReference(
      11,
      `form1[0].${entryPattern}.TextField11[21]`,
      ''
    ),
    physicalAddressFull: createFieldFromReference(
      11,
      `form1[0].${entryPattern}.TextField11[22]`,
      ''
    )
  };
};

/**
 * Creates AdditionalFields from PDF field references
 * Accounts for remaining 5 fields to complete 63 per entry
 */
export const createAdditionalFieldsFromReference = (entryIndex: number): AdditionalFields => {
  const entryPattern = entryIndex === 0 ? 'Section11[0]' : `Section11-${entryIndex + 1}[0]`;

  return {
    // Radio button fields (3 fields)
    addressTypeRadio: {
      ...createFieldFromReference(
        11,
        `form1[0].${entryPattern}.RadioButtonList[1]`,
        'NO'
      ),
      options: ['YES', 'NO']
    },
    residenceTypeRadioAlt: {
      ...createFieldFromReference(
        11,
        `form1[0].${entryPattern}.RadioButtonList[2]`,
        'NO'
      ),
      options: ['YES', 'NO']
    },

    // Additional APO/FPO fields (3 fields)
    apoFpoFull: createFieldFromReference(
      11,
      `form1[0].${entryPattern}.TextField11[23]`,
      ''
    ),
    apoFpoStateAlt: {
      ...createFieldFromReference(
        11,
        `form1[0].${entryPattern}.School6_State[5]`,
        ''
      ),
      options: ['AA', 'AE', 'AP'] // APO/FPO state codes
    },
    apoFpoZipAlt: createFieldFromReference(
      11,
      `form1[0].${entryPattern}.TextField11[24]`,
      ''
    )
  };
};

/**
 * Creates a complete ResidenceEntry from PDF field references
 * Accounts for all 63 fields per entry
 */
export const createResidenceEntryFromReference = (entryIndex: number): ResidenceEntry => {
  return {
    _id: Date.now() + Math.random(),
    residenceDates: createResidenceDatesFromReference(entryIndex),           // 5 fields
    residenceAddress: createResidenceAddressFromReference(entryIndex),       // 5 fields
    residenceType: createResidenceTypeFromReference(entryIndex),             // 2 fields
    contactPersonName: createContactPersonNameFromReference(entryIndex),     // 4 fields
    contactPersonPhones: createContactPersonPhonesFromReference(entryIndex), // 12 fields
    contactPersonRelationship: createContactPersonRelationshipFromReference(entryIndex), // 6 fields
    contactPersonAddress: createContactPersonAddressFromReference(entryIndex), // 5 fields
    contactPersonEmail: createContactPersonEmailFromReference(entryIndex),   // 2 fields
    lastContactInfo: createLastContactInfoFromReference(entryIndex),         // 2 fields
    apoFpoPhysicalAddress: createAPOFPOPhysicalAddressFromReference(entryIndex), // 15 fields
    additionalFields: createAdditionalFieldsFromReference(entryIndex)        // 5 fields
    // Total: 63 fields per entry ✓
  };
};

// ============================================================================
// SUBSECTION TYPES
// ============================================================================

/**
 * Section 11 subsection keys for type safety
 */
export type Section11SubsectionKey = 'section11';

// ============================================================================
// FIELD ID MAPPINGS
// ============================================================================

/**
 * PDF field ID mappings for Section 11 (Where You Have Lived)
 * Based on the actual field IDs from section-11.json - CORRECTED MAPPINGS
 */
export const SECTION11_FIELD_IDS = {
  // ============================================================================
  // ENTRY 1 FIELD IDS (Section11[0]) - CORRECTED FROM section-11.json
  // ============================================================================

  // Entry 1 - Phone fields (neighbor contact)
  NEIGHBOR_PHONE_1_1: "9826", // form1[0].Section11[0].p3-t68[0] - sect11Entry1_neighborTeleNumber1
  NEIGHBOR_PHONE_EXT_1_1: "9825", // form1[0].Section11[0].TextField11[0] - sect11Entry1_Extension1
  NEIGHBOR_PHONE_INTL_1_1: "9824", // form1[0].Section11[0].#field[4] - International or DSN phone
  DONT_KNOW_CONTACT_1: "9823", // form1[0].Section11[0].#field[5] - I don't know
  NEIGHBOR_PHONE_2_1: "9822", // form1[0].Section11[0].p3-t68[1] - sect11Entry1_neighborTeleNumber2
  NEIGHBOR_PHONE_EXT_2_1: "9821", // form1[0].Section11[0].TextField11[1] - sect11Entry1_Extension2
  NEIGHBOR_PHONE_3_1: "9820", // form1[0].Section11[0].p3-t68[2] - sect11Entry1_neighborTeleNumber3
  NEIGHBOR_PHONE_EXT_3_1: "9819", // form1[0].Section11[0].TextField11[2] - sect11Entry1_Extension3
  NEIGHBOR_PHONE_INTL_2_1: "9818", // form1[0].Section11[0].#field[10] - International or DSN phone
  NEIGHBOR_PHONE_UNKNOWN_2_1: "9817", // form1[0].Section11[0].#field[11] - I don't know
  NEIGHBOR_PHONE_INTL_3_1: "9816", // form1[0].Section11[0].#field[12] - International or DSN phone
  NEIGHBOR_PHONE_UNKNOWN_3_1: "9815", // form1[0].Section11[0].#field[13] - I don't know

  // Entry 1 - Date fields
  FROM_DATE_1: "9814", // form1[0].Section11[0].From_Datefield_Name_2[0] - sect11Entry1ToDate
  FROM_DATE_ESTIMATE_1: "9813", // form1[0].Section11[0].#field[15] - Estimate
  TO_DATE_1: "9812", // form1[0].Section11[0].From_Datefield_Name_2[1] - sect11Entry1ToDate
  PRESENT_1: "9811", // form1[0].Section11[0].#field[17] - Present
  TO_DATE_ESTIMATE_1: "9810", // form1[0].Section11[0].#field[18] - Estimate

  // Entry 1 - Residence type
  RESIDENCE_TYPE_1: "17200", // form1[0].Section11[0].RadioButtonList[0]
  RESIDENCE_TYPE_OTHER_1: "9805", // form1[0].Section11[0].TextField12[0] - sect11Entry1OtherField

  // Entry 1 - Main address fields
  STREET_ADDRESS_1: "9804", // form1[0].Section11[0].TextField11[3] - sect11Entry1Street
  CITY_1: "9803", // form1[0].Section11[0].TextField11[4] - sect11Entry1City
  STATE_1: "9802", // form1[0].Section11[0].School6_State[0] - sect11Entry1State
  COUNTRY_1: "9801", // form1[0].Section11[0].DropDownList5[0] - Cambodia
  ZIP_CODE_1: "9800", // form1[0].Section11[0].TextField11[5] - sect11EntryZip

  // Entry 1 - Contact person names
  CONTACT_MIDDLE_NAME_1: "9799", // form1[0].Section11[0].TextField11[6] - sect11Entry1_b_neighborMname
  CONTACT_LAST_NAME_1: "9798", // form1[0].Section11[0].TextField11[7] - sect11Entry1_b_neighborLname
  CONTACT_FIRST_NAME_1: "9797", // form1[0].Section11[0].TextField11[8] - sect11Entry1_b_neighborFname
  CONTACT_SUFFIX_1: "9796", // form1[0].Section11[0].suffix[0] - sect11Entry1_b_suffix

  // Entry 1 - Relationship checkboxes
  RELATIONSHIP_NEIGHBOR_1: "9795", // form1[0].Section11[0].#field[29] - Neighbor
  RELATIONSHIP_FRIEND_1: "9794", // form1[0].Section11[0].#field[30] - Friend
  RELATIONSHIP_LANDLORD_1: "9793", // form1[0].Section11[0].#field[31] - Landlord
  RELATIONSHIP_BUSINESS_1: "9792", // form1[0].Section11[0].#field[32] - Business Associate
  RELATIONSHIP_OTHER_1: "9791", // form1[0].Section11[0].#field[33] - Other
  RELATIONSHIP_OTHER_EXPLAIN_1: "9790", // form1[0].Section11[0].TextField11[9] - sect11Entry1_RelationshipOther

  // Entry 1 - Neighbor address
  NEIGHBOR_STREET_1: "9789", // form1[0].Section11[0].TextField11[10] - E1neighborStreet
  NEIGHBOR_CITY_1: "9788", // form1[0].Section11[0].TextField11[11] - sect11Entry1_Extension1neighborCity
  NEIGHBOR_STATE_1: "9787", // form1[0].Section11[0].School6_State[1] - sect11Entry1_Extension1_NeighborState
  NEIGHBOR_COUNTRY_1: "9786", // form1[0].Section11[0].DropDownList3[0] - Antarctica
  NEIGHBOR_ZIP_1: "9785", // form1[0].Section11[0].TextField11[12] - sect11Entry1_Extension1_NeighborZip
  NEIGHBOR_EMAIL_1: "9784", // form1[0].Section11[0].p3-t68[3] - sect11Entry1_Extension1neighborEmail
  NEIGHBOR_EMAIL_UNKNOWN_1: "9783", // form1[0].Section11[0].#field[41] - I don't know
  LAST_CONTACT_1: "9782", // form1[0].Section11[0].From_Datefield_Name_2[2] - sect11Entry1_b_neighboMonthLasContact
  LAST_CONTACT_ESTIMATE_1: "9781", // form1[0].Section11[0].#field[43] - Estimate

  // Entry 1 - Physical address fields
  PHYSICAL_STREET_1: "9780", // form1[0].Section11[0].TextField11[13] - sect11Entry1_a_Street
  PHYSICAL_CITY_1: "9779", // form1[0].Section11[0].TextField11[14] - sect11Entry1_a_City
  PHYSICAL_STATE_1: "9778", // form1[0].Section11[0].School6_State[2] - sect11Entry1State
  PHYSICAL_COUNTRY_1: "9777", // form1[0].Section11[0].DropDownList4[0] - Akrotiri Sovereign Base
  PHYSICAL_ADDRESS_ALT_1: "9776", // form1[0].Section11[0].TextField11[15] - sect11Entry1_b_Street
  APO_FPO_ADDRESS_1: "9775", // form1[0].Section11[0].TextField11[16] - sect11Entry1_b_APO
  APO_FPO_STATE_1: "9774", // form1[0].Section11[0].School6_State[3] - APO/FPO America
  APO_FPO_ZIP_1: "9773", // form1[0].Section11[0].TextField11[17] - sect11Entry1_b_1Zip
  PHYSICAL_ZIP_1: "9772", // form1[0].Section11[0].TextField11[18] - sect11Entry1_a_Zip
  PHYSICAL_NEIGHBOR_STREET_1: "9771", // form1[0].Section11[0].TextField11[19] - sect11Entry1_a_nieghborAStreet
  PHYSICAL_NEIGHBOR_CITY_1: "9770", // form1[0].Section11[0].TextField11[20] - sect11Entry1_a_nieghborACity
  PHYSICAL_NEIGHBOR_STATE_1: "9769", // form1[0].Section11[0].School6_State[4] - sect11Entry1_a_NeighborState
  PHYSICAL_NEIGHBOR_COUNTRY_1: "9768", // form1[0].Section11[0].DropDownList4[1] - Argentina
  PHYSICAL_NEIGHBOR_ZIP_1: "9767", // form1[0].Section11[0].TextField11[21] - sect11Entry1_a_nieghborAZi

  // Entry 1 - Address type radio buttons
  ADDRESS_TYPE_RADIO_1: "17201", // form1[0].Section11[0].RadioButtonList[1] - NO
  PHYSICAL_ADDRESS_FULL_1: "9764", // form1[0].Section11[0].TextField11[22] - sect11Entry1_b_AddressAPO/FPO
  APO_FPO_FULL_1: "9763", // form1[0].Section11[0].TextField11[23] - sect11Entry1_b_APO
  APO_FPO_STATE_ALT_1: "9762", // form1[0].Section11[0].School6_State[5] - APO/FPO Pacific
  APO_FPO_ZIP_ALT_1: "9761", // form1[0].Section11[0].TextField11[24] - sect11Entry1_b_ZipCode
  RESIDENCE_TYPE_RADIO_ALT_1: "17202", // form1[0].Section11[0].RadioButtonList[2] - YES

  // ============================================================================
  // ENTRY 2 FIELD IDS (Section11-2[0]) - CORRECTED FROM section-11.json
  // ============================================================================

  // Entry 2 - Phone fields (contact person)
  CONTACT_PHONE_1_2: "9895", // form1[0].Section11-2[0].p3-t68[0] - sect11Entry2Phone1
  CONTACT_PHONE_EXT_1_2: "9894", // form1[0].Section11-2[0].TextField11[0] - sect11Entry2Extension1
  CONTACT_PHONE_INTL_1_2: "9893", // form1[0].Section11-2[0].#field[4] - International or DSN phone
  DONT_KNOW_CONTACT_2: "9892", // form1[0].Section11-2[0].#field[5] - I don't know
  CONTACT_PHONE_2_2: "9891", // form1[0].Section11-2[0].p3-t68[1] - sect11Entry2Phone2
  CONTACT_PHONE_EXT_2_2: "9890", // form1[0].Section11-2[0].TextField11[1] - sect11Entry2Extension2
  CONTACT_PHONE_3_2: "9889", // form1[0].Section11-2[0].p3-t68[2] - sect11Entry2Phone3
  CONTACT_PHONE_EXT_3_2: "9888", // form1[0].Section11-2[0].TextField11[2] - sect11Entry2Extension3
  CONTACT_PHONE_INTL_2_2: "9887", // form1[0].Section11-2[0].#field[10] - International or DSN phone
  CONTACT_PHONE_INTL_3_2: "9885", // form1[0].Section11-2[0].#field[12] - International or DSN phone

  // Entry 2 - Date fields
  FROM_DATE_2: "9883", // form1[0].Section11-2[0].From_Datefield_Name_2[0] - sect11Entry2fromDate
  FROM_DATE_ESTIMATE_2: "9882", // form1[0].Section11-2[0].#field[15] - Estimate
  TO_DATE_2: "9881", // form1[0].Section11-2[0].From_Datefield_Name_2[1] - sect11Entry2ToDate
  PRESENT_2: "9880", // form1[0].Section11-2[0].#field[17] - Present
  TO_DATE_ESTIMATE_2: "9879", // form1[0].Section11-2[0].#field[18] - Estimate

  // Entry 2 - Residence type
  RESIDENCE_TYPE_2: "17197", // form1[0].Section11-2[0].RadioButtonList[0]
  RESIDENCE_TYPE_OTHER_2: "9874", // form1[0].Section11-2[0].TextField12[0] - sect11Entry2OtherExplaination

  // Entry 2 - Main address fields
  STREET_ADDRESS_2: "9873", // form1[0].Section11-2[0].TextField11[3] - sect11Entry2Street
  CITY_2: "9872", // form1[0].Section11-2[0].TextField11[4] - sect11Entry2City
  STATE_2: "9871", // form1[0].Section11-2[0].School6_State[0] - sect11Entry2State
  COUNTRY_2: "9870", // form1[0].Section11-2[0].DropDownList5[0] - Afghanistan
  ZIP_CODE_2: "9869", // form1[0].Section11-2[0].TextField11[5] - sect11Entry2Zip

  // Entry 2 - Contact person names
  CONTACT_MIDDLE_NAME_2: "9868", // form1[0].Section11-2[0].TextField11[6] - sect11Entry2MName
  CONTACT_LAST_NAME_2: "9867", // form1[0].Section11-2[0].TextField11[7] - sect11Entry2LName
  CONTACT_FIRST_NAME_2: "9866", // form1[0].Section11-2[0].TextField11[8] - sect11Entry2FName
  CONTACT_SUFFIX_2: "9865", // form1[0].Section11-2[0].suffix[0] - sect11Entry2Suffix

  // Entry 2 - Relationship checkboxes
  RELATIONSHIP_NEIGHBOR_2: "9864", // form1[0].Section11-2[0].#field[29] - Neighbor
  RELATIONSHIP_FRIEND_2: "9863", // form1[0].Section11-2[0].#field[30] - Friend
  RELATIONSHIP_LANDLORD_2: "9862", // form1[0].Section11-2[0].#field[31] - Landlord
  RELATIONSHIP_BUSINESS_2: "9861", // form1[0].Section11-2[0].#field[32] - Business Associate
  RELATIONSHIP_OTHER_2: "9860", // form1[0].Section11-2[0].#field[33] - Other
  RELATIONSHIP_OTHER_EXPLAIN_2: "9859", // form1[0].Section11-2[0].TextField11[9] - E2OtherExplainRelation

  // Entry 2 - Contact person address
  CONTACT_STREET_2: "9858", // form1[0].Section11-2[0].TextField11[10] - sect11Entry2ContactAddress
  CONTACT_CITY_2: "9857", // form1[0].Section11-2[0].TextField11[11] - sect11Entry2ContactCity
  CONTACT_STATE_2: "9856", // form1[0].Section11-2[0].School6_State[1] - sect11Entry2State
  CONTACT_COUNTRY_2: "9855", // form1[0].Section11-2[0].DropDownList3[0] - Afghanistan
  CONTACT_ZIP_2: "9854", // form1[0].Section11-2[0].TextField11[12] - sect11Entry2Zip
  CONTACT_EMAIL_2: "9853", // form1[0].Section11-2[0].p3-t68[3] - sect11Entry2ContactEmail
  CONTACT_EMAIL_UNKNOWN_2: "9852", // form1[0].Section11-2[0].#field[41] - I don't know
  LAST_CONTACT_2: "9851", // form1[0].Section11-2[0].From_Datefield_Name_2[2] - sect11Entry2LastContact
  LAST_CONTACT_ESTIMATE_2: "9850", // form1[0].Section11-2[0].#field[43] - Estimate

  // Entry 2 - Physical address fields
  PHYSICAL_STREET_2: "9849", // form1[0].Section11-2[0].TextField11[13] - sect11Entry2_a_Street
  PHYSICAL_CITY_2: "9848", // form1[0].Section11-2[0].TextField11[14] - sect11Entry2_a_City
  PHYSICAL_STATE_2: "9847", // form1[0].Section11-2[0].School6_State[2] - sect11Entry2_a_State
  PHYSICAL_COUNTRY_2: "9846", // form1[0].Section11-2[0].DropDownList4[0] - Akrotiri Sovereign Base
  PHYSICAL_ADDRESS_ALT_2: "9845", // form1[0].Section11-2[0].TextField11[15] - sect11Entry2_b_Address
  APO_FPO_ADDRESS_2: "9844", // form1[0].Section11-2[0].TextField11[16] - sect11Entry2_b_APO
  APO_FPO_STATE_2: "9843", // form1[0].Section11-2[0].School6_State[3] - APO/FPO America
  APO_FPO_ZIP_2: "9842", // form1[0].Section11-2[0].TextField11[17] - sect11Entry2_b_Zip
  PHYSICAL_ZIP_2: "9841", // form1[0].Section11-2[0].TextField11[18] - sect11Entry2_a_Zip
  PHYSICAL_ALT_STREET_2: "9840", // form1[0].Section11-2[0].TextField11[19] - sect11Entry2_a_Street
  PHYSICAL_ALT_CITY_2: "9839", // form1[0].Section11-2[0].TextField11[20] - sect11Entry2_a_City
  PHYSICAL_ALT_STATE_2: "9838", // form1[0].Section11-2[0].School6_State[4] - sect11Entry2_a_
  PHYSICAL_ALT_COUNTRY_2: "9837", // form1[0].Section11-2[0].DropDownList4[1] - Albania
  PHYSICAL_ALT_ZIP_2: "9836", // form1[0].Section11-2[0].TextField11[21] - sect11Entry2_a_Zip

  // Entry 2 - Address type radio buttons
  ADDRESS_TYPE_RADIO_2: "17198", // form1[0].Section11-2[0].RadioButtonList[1] - NO
  PHYSICAL_ADDRESS_FULL_2: "9833", // form1[0].Section11-2[0].TextField11[22] - sect11Entry2_b_Address
  APO_FPO_FULL_2: "9832", // form1[0].Section11-2[0].TextField11[23] - sect11Entry2_b_APO
  APO_FPO_STATE_ALT_2: "9831", // form1[0].Section11-2[0].School6_State[5] - APO/FPO America
  APO_FPO_ZIP_ALT_2: "9830", // form1[0].Section11-2[0].TextField11[24] - sect11Entry2_b_ZipCode
  RESIDENCE_TYPE_RADIO_ALT_2: "17199", // form1[0].Section11-2[0].RadioButtonList[2] - YES

  // ============================================================================
  // ENTRY 3 FIELD IDS (Section11-3[0]) - CORRECTED FROM section-11.json
  // ============================================================================

  // Entry 3 - Phone fields (contact person)
  CONTACT_PHONE_1_3: "9900", // form1[0].Section11-3[0].p3-t68[0] - sect11Entry3Phone1
  CONTACT_PHONE_EXT_1_3: "9899", // form1[0].Section11-3[0].TextField11[0] - sect11Entry3Extension1
  CONTACT_PHONE_INTL_1_3: "9898", // form1[0].Section11-3[0].#field[4] - International or DSN phone
  DONT_KNOW_CONTACT_3: "9897", // form1[0].Section11-3[0].#field[5] - I don't know
  CONTACT_PHONE_2_3: "9965", // form1[0].Section11-3[0].p3-t68[1] - E3Phone2
  CONTACT_PHONE_EXT_2_3: "9964", // form1[0].Section11-3[0].TextField11[1] - sect11Entry3Extension2
  CONTACT_PHONE_3_3: "9963", // form1[0].Section11-3[0].p3-t68[2] - sect11Entry3Phone3
  CONTACT_PHONE_EXT_3_3: "9962", // form1[0].Section11-3[0].TextField11[2] - sect11Entry3Extionsion3
  CONTACT_PHONE_INTL_2_3: "9961", // form1[0].Section11-3[0].#field[10] - International or DSN phone
  CONTACT_PHONE_INTL_3_3: "9959", // form1[0].Section11-3[0].#field[12] - International or DSN phone

  // Entry 3 - Date fields
  FROM_DATE_3: "9957", // form1[0].Section11-3[0].From_Datefield_Name_2[0] - sect11Entry3FromDate
  FROM_DATE_ESTIMATE_3: "9956", // form1[0].Section11-3[0].#field[15] - Estimate
  TO_DATE_3: "9955", // form1[0].Section11-3[0].From_Datefield_Name_2[1] - sect11Entry3\ToDate
  PRESENT_3: "9954", // form1[0].Section11-3[0].#field[17] - Present
  TO_DATE_ESTIMATE_3: "9953", // form1[0].Section11-3[0].#field[18] - Estimate

  // Entry 3 - Residence type
  RESIDENCE_TYPE_3: "17194", // form1[0].Section11-3[0].RadioButtonList[0]
  RESIDENCE_TYPE_OTHER_3: "9948", // form1[0].Section11-3[0].TextField12[0] - sect11Entry3OtherExplaination

  // Entry 3 - Main address fields
  STREET_ADDRESS_3: "9947", // form1[0].Section11-3[0].TextField11[3] - sect11Entry3StreetAddress
  CITY_3: "9946", // form1[0].Section11-3[0].TextField11[4] - sect11Entry3City
  STATE_3: "9945", // form1[0].Section11-3[0].School6_State[0] - sect11Entry3State
  COUNTRY_3: "9944", // form1[0].Section11-3[0].DropDownList5[0] - Albania
  ZIP_CODE_3: "9943", // form1[0].Section11-3[0].TextField11[5] - sect11Entry3Zipcode

  // Entry 3 - Contact person names
  CONTACT_MIDDLE_NAME_3: "9942", // form1[0].Section11-3[0].TextField11[6] - sect11Entry3NeightborMName
  CONTACT_LAST_NAME_3: "9941", // form1[0].Section11-3[0].TextField11[7] - sect11Entry3NeightborLName
  CONTACT_FIRST_NAME_3: "9940", // form1[0].Section11-3[0].TextField11[8] - sect11Entry3NeighborFName
  CONTACT_SUFFIX_3: "9939", // form1[0].Section11-3[0].suffix[0] - sect11Entry3Suffix

  // Entry 3 - Relationship checkboxes
  RELATIONSHIP_NEIGHBOR_3: "9938", // form1[0].Section11-3[0].#field[29] - Neighbor
  RELATIONSHIP_FRIEND_3: "9937", // form1[0].Section11-3[0].#field[30] - Friend
  RELATIONSHIP_LANDLORD_3: "9936", // form1[0].Section11-3[0].#field[31] - Landlord
  RELATIONSHIP_BUSINESS_3: "9935", // form1[0].Section11-3[0].#field[32] - Business Associate
  RELATIONSHIP_OTHER_3: "9934", // form1[0].Section11-3[0].#field[33] - Other
  RELATIONSHIP_OTHER_EXPLAIN_3: "9933", // form1[0].Section11-3[0].TextField11[9] - sect11Entry3OtherRelationship

  // Entry 3 - Contact person address
  CONTACT_STREET_3: "9932", // form1[0].Section11-3[0].TextField11[10] - sect11Entry3ContactStreet
  CONTACT_CITY_3: "9931", // form1[0].Section11-3[0].TextField11[11] - sect11Entry3ContactCity
  CONTACT_STATE_3: "9930", // form1[0].Section11-3[0].School6_State[1] - sect11Entry3State
  CONTACT_COUNTRY_3: "9929", // form1[0].Section11-3[0].DropDownList3[0] - Andorra
  CONTACT_ZIP_3: "9928", // form1[0].Section11-3[0].TextField11[12] - sect11Entry3ZipCode
  CONTACT_EMAIL_3: "9927", // form1[0].Section11-3[0].p3-t68[3] - sect11Entry3email
  CONTACT_EMAIL_UNKNOWN_3: "9926", // form1[0].Section11-3[0].#field[41] - I don't know
  LAST_CONTACT_3: "9925", // form1[0].Section11-3[0].From_Datefield_Name_2[2] - sect11Entry3LastContact
  LAST_CONTACT_ESTIMATE_3: "9924", // form1[0].Section11-3[0].#field[43] - Estimate

  // Entry 3 - Physical address fields
  PHYSICAL_STREET_3: "9923", // form1[0].Section11-3[0].TextField11[13] - sect11Entry3_a_Address
  PHYSICAL_CITY_3: "9922", // form1[0].Section11-3[0].TextField11[14] - sect11Entry3_a_City
  PHYSICAL_STATE_3: "9921", // form1[0].Section11-3[0].School6_State[2] - sect11Entry3_a_State
  PHYSICAL_COUNTRY_3: "9920", // form1[0].Section11-3[0].DropDownList4[0] - Algeria
  PHYSICAL_ADDRESS_ALT_3: "9919", // form1[0].Section11-3[0].TextField11[15] - sect11Entry3_b_Address
  APO_FPO_ADDRESS_3: "9918", // form1[0].Section11-3[0].TextField11[16] - sect11Entry3_b_APO
  APO_FPO_STATE_3: "9917", // form1[0].Section11-3[0].School6_State[3] - APO/FPO Pacific
  APO_FPO_ZIP_3: "9916", // form1[0].Section11-3[0].TextField11[17] - sect11Entry3_b_Zipcopde
  PHYSICAL_ZIP_3: "9915", // form1[0].Section11-3[0].TextField11[18] - sect11Entry3_a_Zip
  PHYSICAL_ALT_STREET_3: "9914", // form1[0].Section11-3[0].TextField11[19] - sect11Entry3_a_Street
  PHYSICAL_ALT_CITY_3: "9913", // form1[0].Section11-3[0].TextField11[20] - sect11Entry3_a_City
  PHYSICAL_ALT_STATE_3: "9912", // form1[0].Section11-3[0].School6_State[4] - sect11Entry3_a_State
  PHYSICAL_ALT_COUNTRY_3: "9911", // form1[0].Section11-3[0].DropDownList4[1] - Armenia
  PHYSICAL_ALT_ZIP_3: "9910", // form1[0].Section11-3[0].TextField11[21] - sect11Entry3_a_Zipcode

  // Entry 3 - Address type radio buttons
  ADDRESS_TYPE_RADIO_3: "17195", // form1[0].Section11-3[0].RadioButtonList[1] - NO
  PHYSICAL_ADDRESS_FULL_3: "9907", // form1[0].Section11-3[0].TextField11[22] - sect11Entry3_b_3Address
  APO_FPO_FULL_3: "9906", // form1[0].Section11-3[0].TextField11[23] - sect11Entry3_b_Address
  APO_FPO_STATE_ALT_3: "9905", // form1[0].Section11-3[0].School6_State[5] - APO/FPO Pacific
  APO_FPO_ZIP_ALT_3: "9904", // form1[0].Section11-3[0].TextField11[24] - sect11Entry3_b_Zip
  RESIDENCE_TYPE_RADIO_ALT_3: "17196", // form1[0].Section11-3[0].RadioButtonList[2] - YES

  // ============================================================================
  // ENTRY 4 FIELD IDS (Section11-4[0]) - CORRECTED FROM section-11.json
  // ============================================================================

  // Entry 4 - Phone fields (contact person)
  CONTACT_PHONE_1_4: "10029", // form1[0].Section11-4[0].p3-t68[0] - sect11Entry4Phone1
  CONTACT_PHONE_EXT_1_4: "10028", // form1[0].Section11-4[0].TextField11[0] - sect11Entry4Extension1
  CONTACT_PHONE_INTL_1_4: "10027", // form1[0].Section11-4[0].#field[4] - International or DSN phone
  DONT_KNOW_CONTACT_4: "10026", // form1[0].Section11-4[0].#field[5] - I don't know
  CONTACT_PHONE_2_4: "10025", // form1[0].Section11-4[0].p3-t68[1] - sect11Entry4Phone2
  CONTACT_PHONE_EXT_2_4: "10024", // form1[0].Section11-4[0].TextField11[1] - Extension2
  CONTACT_PHONE_3_4: "10023", // form1[0].Section11-4[0].p3-t68[2] - sect11Entry4Phone3
  CONTACT_PHONE_EXT_3_4: "10022", // form1[0].Section11-4[0].TextField11[2] - sect11Entry4Extension3
  CONTACT_PHONE_INTL_2_4: "10021", // form1[0].Section11-4[0].#field[10] - International or DSN phone
  CONTACT_PHONE_INTL_3_4: "10019", // form1[0].Section11-4[0].#field[12] - International or DSN phone

  // Entry 4 - Date fields
  FROM_DATE_4: "10017", // form1[0].Section11-4[0].From_Datefield_Name_2[0] - sect11Entry4FromDate
  FROM_DATE_ESTIMATE_4: "10016", // form1[0].Section11-4[0].#field[15] - Estimate
  TO_DATE_4: "10015", // form1[0].Section11-4[0].From_Datefield_Name_2[1] - sect11Entry4ToDate
  PRESENT_4: "10014", // form1[0].Section11-4[0].#field[17] - Present
  TO_DATE_ESTIMATE_4: "10013", // form1[0].Section11-4[0].#field[18] - Estimate

  // Entry 4 - Residence type and other
  RESIDENCE_TYPE_OTHER_4: "10012", // form1[0].Section11-4[0].TextField12[0] - sect11Entry4OtherExplaination

  // Entry 4 - Main address fields
  STREET_ADDRESS_4: "10011", // form1[0].Section11-4[0].TextField11[3] - sect11Entry4Street
  CITY_4: "10010", // form1[0].Section11-4[0].TextField11[4] - sect11Entry4City
  STATE_4: "10009", // form1[0].Section11-4[0].School6_State[0] - sect11Entry4State
  COUNTRY_4: "10008", // form1[0].Section11-4[0].DropDownList5[0] - USA
  ZIP_CODE_4: "10007", // form1[0].Section11-4[0].TextField11[5] - sect11Entry4Zip

  // Entry 4 - Contact person names
  CONTACT_MIDDLE_NAME_4: "10006", // form1[0].Section11-4[0].TextField11[6] - sect11Entry4MName
  CONTACT_LAST_NAME_4: "10005", // form1[0].Section11-4[0].TextField11[7] - sect11Entry4LName
  CONTACT_FIRST_NAME_4: "10004", // form1[0].Section11-4[0].TextField11[8] - sect11Entry4FName
  CONTACT_SUFFIX_4: "10003", // form1[0].Section11-4[0].suffix[0] - sect11Entry4Suffix

  // Entry 4 - Relationship checkboxes
  RELATIONSHIP_NEIGHBOR_4: "10002", // form1[0].Section11-4[0].#field[29] - Neighbor
  RELATIONSHIP_FRIEND_4: "10001", // form1[0].Section11-4[0].#field[30] - Friend
  RELATIONSHIP_LANDLORD_4: "10000", // form1[0].Section11-4[0].#field[31] - Landlord
  RELATIONSHIP_BUSINESS_4: "9999", // form1[0].Section11-4[0].#field[32] - Business Associate
  RELATIONSHIP_OTHER_4: "9998", // form1[0].Section11-4[0].#field[33] - Other
  RELATIONSHIP_OTHER_EXPLAIN_4: "9997", // form1[0].Section11-4[0].TextField11[9] - OtherRelationship

  // Entry 4 - Contact person address
  CONTACT_STREET_4: "9996", // form1[0].Section11-4[0].TextField11[10] - sect11Entry4ContactStreet
  CONTACT_CITY_4: "9995", // form1[0].Section11-4[0].TextField11[11] - sect11Entry4ContactCity
  CONTACT_STATE_4: "9994", // form1[0].Section11-4[0].School6_State[1] - sect11Entry4State
  CONTACT_COUNTRY_4: "9993", // form1[0].Section11-4[0].DropDownList3[0] - Algeria
  CONTACT_ZIP_4: "9992", // form1[0].Section11-4[0].TextField11[12] - sect11Entry4ContactZip
  CONTACT_EMAIL_4: "9991", // form1[0].Section11-4[0].p3-t68[3] - sect11Entry4ContactEmail
  CONTACT_EMAIL_UNKNOWN_4: "9990", // form1[0].Section11-4[0].#field[41] - I don't know
  LAST_CONTACT_4: "9989", // form1[0].Section11-4[0].From_Datefield_Name_2[2] - sect11Entry4LastContact
  LAST_CONTACT_ESTIMATE_4: "9988", // form1[0].Section11-4[0].#field[43] - Estimate

  // Entry 4 - Physical address fields
  PHYSICAL_STREET_4: "9987", // form1[0].Section11-4[0].TextField11[13] - sect11Entry4_a_address
  PHYSICAL_CITY_4: "9986", // form1[0].Section11-4[0].TextField11[14] - sect11Entry4_a_City
  PHYSICAL_STATE_4: "9985", // form1[0].Section11-4[0].School6_State[2] - sect11Entry4_a_State
  PHYSICAL_COUNTRY_4: "9984", // form1[0].Section11-4[0].DropDownList4[0] - Algeria
  PHYSICAL_ADDRESS_ALT_4: "9983", // form1[0].Section11-4[0].TextField11[15] - sect11Entry4_b_Address
  APO_FPO_ADDRESS_4: "9982", // form1[0].Section11-4[0].TextField11[16] - sect11Entry4_b_APO
  APO_FPO_STATE_4: "9981", // form1[0].Section11-4[0].School6_State[3] - APO/FPO Pacific
  APO_FPO_ZIP_4: "9980", // form1[0].Section11-4[0].TextField11[17] - sect11Entry4_b_3Zip
  PHYSICAL_ZIP_4: "9979", // form1[0].Section11-4[0].TextField11[18] - sect11Entry4_a_Zipcode
  PHYSICAL_ALT_STREET_4: "9978", // form1[0].Section11-4[0].TextField11[19] - sect11Entry4_a_Address
  PHYSICAL_ALT_CITY_4: "9977", // form1[0].Section11-4[0].TextField11[20] - sect11Entry4_a_City
  PHYSICAL_ALT_STATE_4: "9976", // form1[0].Section11-4[0].School6_State[4] - sect11Entry4_a_State
  PHYSICAL_ALT_COUNTRY_4: "9975", // form1[0].Section11-4[0].DropDownList4[1] - Algeria
  PHYSICAL_ALT_ZIP_4: "9974", // form1[0].Section11-4[0].TextField11[21] - sect11Entry4_a_Zip

  // Entry 4 - Address type radio buttons
  RESIDENCE_TYPE_4: "17191", // form1[0].Section11-4[0].RadioButtonList[0] - YES
  PHYSICAL_ADDRESS_FULL_4: "9971", // form1[0].Section11-4[0].TextField11[22] - sect11Entry4_b_Address
  APO_FPO_FULL_4: "9970", // form1[0].Section11-4[0].TextField11[23] - sect11Entry4_b_APO
  APO_FPO_STATE_ALT_4: "9969", // form1[0].Section11-4[0].School6_State[5] - APO/FPO Pacific
  APO_FPO_ZIP_ALT_4: "9968", // form1[0].Section11-4[0].TextField11[24] - sect11Entry4_b_Zip
  ADDRESS_TYPE_RADIO_4: "17192", // form1[0].Section11-4[0].RadioButtonList[1] - YES
  RESIDENCE_TYPE_RADIO_ALT_4: "17193", // form1[0].Section11-4[0].RadioButtonList[2]

} as const;

/**
 * Field name mappings for Section 11 (Where You Have Lived)
 * Full field paths from section-11.json
 */
export const SECTION11_FIELD_NAMES = {
  // Entry 1 - Main address fields
  STREET_ADDRESS_1: "form1[0].Section11[0].TextField11[3]",
  CITY_1: "form1[0].Section11[0].TextField11[4]",
  STATE_1: "form1[0].Section11[0].School6_State[0]",
  COUNTRY_1: "form1[0].Section11[0].DropDownList5[0]",
  ZIP_CODE_1: "form1[0].Section11[0].TextField11[5]",
  
  // Entry 1 - Date fields
  FROM_DATE_1: "form1[0].Section11[0].From_Datefield_Name_2[0]",
  FROM_DATE_ESTIMATE_1: "form1[0].Section11[0].#field[15]",
  TO_DATE_1: "form1[0].Section11[0].From_Datefield_Name_2[1]",
  TO_DATE_ESTIMATE_1: "form1[0].Section11[0].#field[18]",
  PRESENT_1: "form1[0].Section11[0].#field[17]",
  
  // Entry 1 - Residence type
  RESIDENCE_TYPE_1: "form1[0].Section11[0].RadioButtonList[0]",
  RESIDENCE_TYPE_OTHER_1: "form1[0].Section11[0].TextField12[0]",
  
  // Entry 1 - Contact person - CORRECTED MAPPINGS FROM JSON
  CONTACT_LAST_NAME_1: "form1[0].Section11[0].TextField11[7]",
  CONTACT_FIRST_NAME_1: "form1[0].Section11[0].TextField11[8]",
  CONTACT_MIDDLE_NAME_1: "form1[0].Section11[0].TextField11[6]",

  // Entry 1 - Relationship checkboxes
  RELATIONSHIP_NEIGHBOR_1: "form1[0].Section11[0].#field[29]",
  RELATIONSHIP_FRIEND_1: "form1[0].Section11[0].#field[30]",
  RELATIONSHIP_LANDLORD_1: "form1[0].Section11[0].#field[31]",
  RELATIONSHIP_BUSINESS_1: "form1[0].Section11[0].#field[32]",
  RELATIONSHIP_OTHER_1: "form1[0].Section11[0].#field[33]",
  RELATIONSHIP_OTHER_EXPLAIN_1: "form1[0].Section11[0].TextField11[9]",
  
  // Entry 1 - Contact phone numbers
  EVENING_PHONE_1: "form1[0].Section11[0].p3-t68[0]",
  EVENING_PHONE_EXT_1: "form1[0].Section11[0].TextField11[0]",
  EVENING_PHONE_INTL_1: "form1[0].Section11[0].#field[4]",
  DAYTIME_PHONE_1: "form1[0].Section11[0].p3-t68[1]",
  DAYTIME_PHONE_EXT_1: "form1[0].Section11[0].TextField11[1]",
  DAYTIME_PHONE_INTL_1: "form1[0].Section11[0].#field[10]",
  MOBILE_PHONE_1: "form1[0].Section11[0].p3-t68[2]",
  MOBILE_PHONE_EXT_1: "form1[0].Section11[0].TextField11[2]",
  MOBILE_PHONE_INTL_1: "form1[0].Section11[0].#field[12]",
  
  // Entry 1 - Contact availability
  DONT_KNOW_CONTACT_1: "form1[0].Section11[0].#field[5]",
  EMAIL_1: "form1[0].Section11[0].p3-t68[3]", // Email field for contact person

  // Entry 1 - Missing high-priority field names
  NEIGHBOR_LAST_NAME_1: "form1[0].Section11[0].TextField11[7]",
  NEIGHBOR_FIRST_NAME_1: "form1[0].Section11[0].TextField11[8]",
  NEIGHBOR_MIDDLE_NAME_1: "form1[0].Section11[0].TextField11[6]",
  NEIGHBOR_PHONE_1: "form1[0].Section11[0].p3-t68[0]",
  NEIGHBOR_PHONE_2: "form1[0].Section11[0].p3-t68[1]",
  NEIGHBOR_PHONE_3: "form1[0].Section11[0].p3-t68[2]",
  NEIGHBOR_ADDRESS_1: "form1[0].Section11[0].TextField11[11]",
  NEIGHBOR_STATE_1: "form1[0].Section11[0].School6_State[1]",
  NEIGHBOR_ZIP_1: "form1[0].Section11[0].TextField11[12]",
  NEIGHBOR_EMAIL_1: "form1[0].Section11[0].p3-t68[3]",
  LAST_CONTACT_1: "form1[0].Section11[0].From_Datefield_Name_2[2]",
  APO_FPO_ADDRESS_1: "form1[0].Section11[0].TextField11[16]",
  PHYSICAL_ADDRESS_1: "form1[0].Section11[0].TextField11[22]",

  // ============================================================================
  // ENTRY 2 FIELD NAMES (Section11-2[0])
  // ============================================================================

  // Entry 2 - Main address fields
  STREET_ADDRESS_2: "form1[0].Section11-2[0].TextField11[3]",
  CITY_2: "form1[0].Section11-2[0].TextField11[4]",
  STATE_2: "form1[0].Section11-2[0].School6_State[0]",
  COUNTRY_2: "form1[0].Section11-2[0].DropDownList5[0]",
  ZIP_CODE_2: "form1[0].Section11-2[0].TextField11[5]",

  // Entry 2 - Date fields
  FROM_DATE_2: "form1[0].Section11-2[0].From_Datefield_Name_2[0]",
  FROM_DATE_ESTIMATE_2: "form1[0].Section11-2[0].#field[15]",
  TO_DATE_2: "form1[0].Section11-2[0].From_Datefield_Name_2[1]",
  TO_DATE_ESTIMATE_2: "form1[0].Section11-2[0].#field[18]",
  PRESENT_2: "form1[0].Section11-2[0].#field[17]",

  // Entry 2 - Residence type
  RESIDENCE_TYPE_2: "form1[0].Section11-2[0].RadioButtonList[0]",
  RESIDENCE_TYPE_OTHER_2: "form1[0].Section11-2[0].TextField12[0]",

  // Entry 2 - Contact person - CORRECTED MAPPINGS FROM JSON
  CONTACT_LAST_NAME_2: "form1[0].Section11-2[0].TextField11[7]",
  CONTACT_FIRST_NAME_2: "form1[0].Section11-2[0].TextField11[8]",
  CONTACT_MIDDLE_NAME_2: "form1[0].Section11-2[0].TextField11[6]",

  // Entry 2 - Relationship checkboxes
  RELATIONSHIP_NEIGHBOR_2: "form1[0].Section11-2[0].#field[29]",
  RELATIONSHIP_FRIEND_2: "form1[0].Section11-2[0].#field[30]",
  RELATIONSHIP_LANDLORD_2: "form1[0].Section11-2[0].#field[31]",
  RELATIONSHIP_BUSINESS_2: "form1[0].Section11-2[0].#field[32]",
  RELATIONSHIP_OTHER_2: "form1[0].Section11-2[0].#field[33]",
  RELATIONSHIP_OTHER_EXPLAIN_2: "form1[0].Section11-2[0].TextField11[9]",

  // Entry 2 - Contact phone numbers
  EVENING_PHONE_2: "form1[0].Section11-2[0].p3-t68[0]",
  EVENING_PHONE_EXT_2: "form1[0].Section11-2[0].TextField11[0]",
  EVENING_PHONE_INTL_2: "form1[0].Section11-2[0].#field[4]",
  DAYTIME_PHONE_2: "form1[0].Section11-2[0].p3-t68[1]",
  DAYTIME_PHONE_EXT_2: "form1[0].Section11-2[0].TextField11[1]",
  DAYTIME_PHONE_INTL_2: "form1[0].Section11-2[0].#field[10]",
  MOBILE_PHONE_2: "form1[0].Section11-2[0].p3-t68[2]",
  MOBILE_PHONE_EXT_2: "form1[0].Section11-2[0].TextField11[2]",
  MOBILE_PHONE_INTL_2: "form1[0].Section11-2[0].#field[12]",

  // Entry 2 - Contact availability
  DONT_KNOW_CONTACT_2: "form1[0].Section11-2[0].#field[5]",
  EMAIL_2: "form1[0].Section11-2[0].p3-t68[3]",

  // Entry 2 - Missing high-priority field names
  CONTACT_ADDRESS_2: "form1[0].Section11-2[0].TextField11[10]",
  CONTACT_CITY_2: "form1[0].Section11-2[0].TextField11[11]",
  CONTACT_EMAIL_2: "form1[0].Section11-2[0].p3-t68[3]",
  LAST_CONTACT_2: "form1[0].Section11-2[0].From_Datefield_Name_2[2]",
  APO_FPO_ADDRESS_2: "form1[0].Section11-2[0].TextField11[16]",
  PHYSICAL_ADDRESS_2: "form1[0].Section11-2[0].TextField11[23]",

  // ============================================================================
  // ENTRY 3 FIELD NAMES (Section11-3[0])
  // ============================================================================

  // Entry 3 - Main address fields
  STREET_ADDRESS_3: "form1[0].Section11-3[0].TextField11[3]",
  CITY_3: "form1[0].Section11-3[0].TextField11[4]",
  STATE_3: "form1[0].Section11-3[0].School6_State[0]",
  COUNTRY_3: "form1[0].Section11-3[0].DropDownList5[0]",
  ZIP_CODE_3: "form1[0].Section11-3[0].TextField11[5]",

  // Entry 3 - Date fields
  FROM_DATE_3: "form1[0].Section11-3[0].From_Datefield_Name_2[0]",
  FROM_DATE_ESTIMATE_3: "form1[0].Section11-3[0].#field[15]",
  TO_DATE_3: "form1[0].Section11-3[0].From_Datefield_Name_2[1]",
  TO_DATE_ESTIMATE_3: "form1[0].Section11-3[0].#field[18]",
  PRESENT_3: "form1[0].Section11-3[0].#field[17]",

  // Entry 3 - Residence type
  RESIDENCE_TYPE_3: "form1[0].Section11-3[0].RadioButtonList[0]",
  RESIDENCE_TYPE_OTHER_3: "form1[0].Section11-3[0].TextField12[0]",

  // Entry 3 - Contact person - CORRECTED MAPPINGS FROM JSON
  CONTACT_LAST_NAME_3: "form1[0].Section11-3[0].TextField11[7]",
  CONTACT_FIRST_NAME_3: "form1[0].Section11-3[0].TextField11[8]",
  CONTACT_MIDDLE_NAME_3: "form1[0].Section11-3[0].TextField11[6]",

  // Entry 3 - Relationship checkboxes
  RELATIONSHIP_NEIGHBOR_3: "form1[0].Section11-3[0].#field[29]",
  RELATIONSHIP_FRIEND_3: "form1[0].Section11-3[0].#field[30]",
  RELATIONSHIP_LANDLORD_3: "form1[0].Section11-3[0].#field[31]",
  RELATIONSHIP_BUSINESS_3: "form1[0].Section11-3[0].#field[32]",
  RELATIONSHIP_OTHER_3: "form1[0].Section11-3[0].#field[33]",
  RELATIONSHIP_OTHER_EXPLAIN_3: "form1[0].Section11-3[0].TextField11[9]",

  // Entry 3 - Contact phone numbers
  EVENING_PHONE_3: "form1[0].Section11-3[0].p3-t68[0]",
  EVENING_PHONE_EXT_3: "form1[0].Section11-3[0].TextField11[0]",
  EVENING_PHONE_INTL_3: "form1[0].Section11-3[0].#field[4]",
  DAYTIME_PHONE_3: "form1[0].Section11-3[0].p3-t68[1]",
  DAYTIME_PHONE_EXT_3: "form1[0].Section11-3[0].TextField11[1]",
  DAYTIME_PHONE_INTL_3: "form1[0].Section11-3[0].#field[10]",
  MOBILE_PHONE_3: "form1[0].Section11-3[0].p3-t68[2]",
  MOBILE_PHONE_EXT_3: "form1[0].Section11-3[0].TextField11[2]",
  MOBILE_PHONE_INTL_3: "form1[0].Section11-3[0].#field[12]",

  // Entry 3 - Contact availability
  DONT_KNOW_CONTACT_3: "form1[0].Section11-3[0].#field[5]",
  EMAIL_3: "form1[0].Section11-3[0].p3-t68[3]",

  // Entry 3 - Missing high-priority field names
  NEIGHBOR_FIRST_NAME_3: "form1[0].Section11-3[0].TextField11[8]",
  CONTACT_ADDRESS_3: "form1[0].Section11-3[0].TextField11[10]",
  CONTACT_CITY_3: "form1[0].Section11-3[0].TextField11[11]",
  LAST_CONTACT_3: "form1[0].Section11-3[0].From_Datefield_Name_2[2]",
  APO_FPO_ADDRESS_3: "form1[0].Section11-3[0].TextField11[16]",

  // ============================================================================
  // ENTRY 4 FIELD NAMES (Section11-4[0])
  // ============================================================================

  // Entry 4 - Main address fields
  STREET_ADDRESS_4: "form1[0].Section11-4[0].TextField11[3]",
  CITY_4: "form1[0].Section11-4[0].TextField11[4]",
  STATE_4: "form1[0].Section11-4[0].School6_State[0]",
  COUNTRY_4: "form1[0].Section11-4[0].DropDownList5[0]",
  ZIP_CODE_4: "form1[0].Section11-4[0].TextField11[5]",

  // Entry 4 - Date fields
  FROM_DATE_4: "form1[0].Section11-4[0].From_Datefield_Name_2[0]",
  FROM_DATE_ESTIMATE_4: "form1[0].Section11-4[0].#field[15]",
  TO_DATE_4: "form1[0].Section11-4[0].From_Datefield_Name_2[1]",
  TO_DATE_ESTIMATE_4: "form1[0].Section11-4[0].#field[18]",
  PRESENT_4: "form1[0].Section11-4[0].#field[17]",

  // Entry 4 - Residence type
  RESIDENCE_TYPE_4: "form1[0].Section11-4[0].RadioButtonList[0]",
  RESIDENCE_TYPE_OTHER_4: "form1[0].Section11-4[0].TextField12[0]",

  // Entry 4 - Contact person - CORRECTED MAPPINGS FROM JSON
  CONTACT_LAST_NAME_4: "form1[0].Section11-4[0].TextField11[7]",
  CONTACT_FIRST_NAME_4: "form1[0].Section11-4[0].TextField11[8]",
  CONTACT_MIDDLE_NAME_4: "form1[0].Section11-4[0].TextField11[6]",

  // Entry 4 - Relationship checkboxes
  RELATIONSHIP_NEIGHBOR_4: "form1[0].Section11-4[0].#field[29]",
  RELATIONSHIP_FRIEND_4: "form1[0].Section11-4[0].#field[30]",
  RELATIONSHIP_LANDLORD_4: "form1[0].Section11-4[0].#field[31]",
  RELATIONSHIP_BUSINESS_4: "form1[0].Section11-4[0].#field[32]",
  RELATIONSHIP_OTHER_4: "form1[0].Section11-4[0].#field[33]",
  RELATIONSHIP_OTHER_EXPLAIN_4: "form1[0].Section11-4[0].TextField11[9]",

  // Entry 4 - Contact phone numbers
  EVENING_PHONE_4: "form1[0].Section11-4[0].p3-t68[0]",
  EVENING_PHONE_EXT_4: "form1[0].Section11-4[0].TextField11[0]",
  EVENING_PHONE_INTL_4: "form1[0].Section11-4[0].#field[4]",
  DAYTIME_PHONE_4: "form1[0].Section11-4[0].p3-t68[1]",
  DAYTIME_PHONE_EXT_4: "form1[0].Section11-4[0].TextField11[1]",
  DAYTIME_PHONE_INTL_4: "form1[0].Section11-4[0].#field[10]",
  MOBILE_PHONE_4: "form1[0].Section11-4[0].p3-t68[2]",
  MOBILE_PHONE_EXT_4: "form1[0].Section11-4[0].TextField11[2]",
  MOBILE_PHONE_INTL_4: "form1[0].Section11-4[0].#field[12]",

  // Entry 4 - Contact availability
  DONT_KNOW_CONTACT_4: "form1[0].Section11-4[0].#field[5]",
  EMAIL_4: "form1[0].Section11-4[0].p3-t68[3]",

  // Entry 4 - Missing high-priority field names
  CONTACT_ADDRESS_4: "form1[0].Section11-4[0].TextField11[10]",
  CONTACT_CITY_4: "form1[0].Section11-4[0].TextField11[11]",
  CONTACT_ZIP_4: "form1[0].Section11-4[0].TextField11[12]",
  CONTACT_EMAIL_4: "form1[0].Section11-4[0].p3-t68[3]",
  LAST_CONTACT_4: "form1[0].Section11-4[0].From_Datefield_Name_2[2]",
  APO_FPO_ADDRESS_4: "form1[0].Section11-4[0].TextField11[16]",
  PHYSICAL_ADDRESS_4: "form1[0].Section11-4[0].TextField11[23]",

} as const;

// ============================================================================
// DYNAMIC FIELD MAPPING FUNCTIONS
// ============================================================================



/**
 * Create a field using sections-references data for Section 11
 * THROWS ERROR when field creation fails - no fallbacks to ensure proper implementation
 */
export function createSection11Field<T>(entryIndex: number, fieldType: string, defaultValue: T): Field<T> {
  try {
    const fieldName = generateFieldName(fieldType, entryIndex);
    return createFieldFromReference(11, fieldName, defaultValue);
  } catch (error) {
    // THROW ERROR: Return information about fields that could not be created
    const errorDetails = {
      section: 11,
      entryIndex,
      fieldType,
      attemptedFieldName: generateFieldName(fieldType, entryIndex),
      originalError: error instanceof Error ? error.message : String(error),
      expectedFieldPattern: `form1[0].Section11${entryIndex === 0 ? '' : `-${entryIndex + 1}`}[0].${fieldType}`,
      availableEntries: [0, 1, 2, 3],
      validEntryIndex: entryIndex >= 0 && entryIndex <= 3
    };

    throw new Error(`❌ SECTION11 FIELD CREATION FAILED: Could not create field "${fieldType}" for entry ${entryIndex}. Details: ${JSON.stringify(errorDetails, null, 2)}`);
  }
}

// ============================================================================
// DROPDOWN OPTIONS
// ============================================================================

/**
 * Residence type options
 */
export const RESIDENCE_TYPE_OPTIONS = [
  "Own",
  "Rent",
  "Military Housing",
  "Other"
] as const;

/**
 * Mapping from numeric residence type values to human-readable labels
 */
export const RESIDENCE_TYPE_MAPPING = {
  '1': 'Own',
  '2': 'Rent',
  '3': 'Military Housing',
  '4': 'Other'
} as const;

/**
 * Converts numeric residence type value to human-readable label
 * @param value - Numeric residence type ('1', '2', '3', '4')
 * @returns Human-readable label or original value as fallback
 */
export const getResidenceTypeLabel = (value: '1' | '2' | '3' | '4'): string => {
  return RESIDENCE_TYPE_MAPPING[value] || value;
};

/**
 * Relationship options for contact person
 */
export const RELATIONSHIP_OPTIONS = [
  "Neighbor",
  "Landlord",
  "Friend",
  "Relative",
  "Other"
] as const;

/**
 * Creates a relationship field that maps to the correct PDF checkbox based on relationship type and entry index
 * THROWS ERROR if field mapping is not found - no fallbacks to ensure proper implementation
 */
export const createRelationshipField = (relationshipType: string, entryIndex: number): Field<boolean> => {
  const relationshipMap: Record<string, Record<number, string>> = {
    "Neighbor": {
      0: SECTION11_FIELD_NAMES.RELATIONSHIP_NEIGHBOR_1,
      1: SECTION11_FIELD_NAMES.RELATIONSHIP_NEIGHBOR_2,
      2: SECTION11_FIELD_NAMES.RELATIONSHIP_NEIGHBOR_3,
      3: SECTION11_FIELD_NAMES.RELATIONSHIP_NEIGHBOR_4
    },
    "Friend": {
      0: SECTION11_FIELD_NAMES.RELATIONSHIP_FRIEND_1,
      1: SECTION11_FIELD_NAMES.RELATIONSHIP_FRIEND_2,
      2: SECTION11_FIELD_NAMES.RELATIONSHIP_FRIEND_3,
      3: SECTION11_FIELD_NAMES.RELATIONSHIP_FRIEND_4
    },
    "Landlord": {
      0: SECTION11_FIELD_NAMES.RELATIONSHIP_LANDLORD_1,
      1: SECTION11_FIELD_NAMES.RELATIONSHIP_LANDLORD_2,
      2: SECTION11_FIELD_NAMES.RELATIONSHIP_LANDLORD_3,
      3: SECTION11_FIELD_NAMES.RELATIONSHIP_LANDLORD_4
    },
    "Business Associate": {
      0: SECTION11_FIELD_NAMES.RELATIONSHIP_BUSINESS_1,
      1: SECTION11_FIELD_NAMES.RELATIONSHIP_BUSINESS_2,
      2: SECTION11_FIELD_NAMES.RELATIONSHIP_BUSINESS_3,
      3: SECTION11_FIELD_NAMES.RELATIONSHIP_BUSINESS_4
    },
    "Other": {
      0: SECTION11_FIELD_NAMES.RELATIONSHIP_OTHER_1,
      1: SECTION11_FIELD_NAMES.RELATIONSHIP_OTHER_2,
      2: SECTION11_FIELD_NAMES.RELATIONSHIP_OTHER_3,
      3: SECTION11_FIELD_NAMES.RELATIONSHIP_OTHER_4
    }
  };

  const fieldName = relationshipMap[relationshipType]?.[entryIndex];
  if (!fieldName) {
    throw new Error(`❌ SECTION11 FIELD MAPPING ERROR: No relationship field found for type "${relationshipType}" and entry ${entryIndex}. Available types: ${Object.keys(relationshipMap).join(', ')}. Valid entry indices: 0-3.`);
  }

  return createFieldFromReference(11, fieldName, false);
};

/**
 * Creates all relationship fields for a given entry index
 * THROWS ERROR if any field mapping is not found - no fallbacks to ensure proper implementation
 */
export const createAllRelationshipFields = (entryIndex: number) => {
  if (entryIndex < 0 || entryIndex > 3) {
    throw new Error(`❌ SECTION11 FIELD MAPPING ERROR: Invalid entry index ${entryIndex}. Valid entry indices: 0-3.`);
  }

  return {
    neighbor: createRelationshipField('Neighbor', entryIndex),
    friend: createRelationshipField('Friend', entryIndex),
    landlord: createRelationshipField('Landlord', entryIndex),
    businessAssociate: createRelationshipField('Business Associate', entryIndex),
    other: createRelationshipField('Other', entryIndex)
  };
};

/**
 * Gets the relationship other explanation field ID based on entry index
 * THROWS ERROR if field mapping is not found - no fallbacks to ensure proper implementation
 */
export const getRelationshipOtherFieldId = (entryIndex: number): string => {
  const otherFieldMap: Record<number, string> = {
    0: SECTION11_FIELD_NAMES.RELATIONSHIP_OTHER_EXPLAIN_1,
    1: SECTION11_FIELD_NAMES.RELATIONSHIP_OTHER_EXPLAIN_2,
    2: SECTION11_FIELD_NAMES.RELATIONSHIP_OTHER_EXPLAIN_3,
    3: SECTION11_FIELD_NAMES.RELATIONSHIP_OTHER_EXPLAIN_4
  };

  const fieldName = otherFieldMap[entryIndex];
  if (!fieldName) {
    throw new Error(`❌ SECTION11 FIELD MAPPING ERROR: No relationship other explanation field found for entry ${entryIndex}. Valid entry indices: 0-3.`);
  }

  return fieldName;
};

/**
 * APO/FPO type options
 */
export const APO_FPO_TYPE_OPTIONS = [
  "APO",
  "FPO", 
  "DPO"
] as const;

/**
 * AE code options for military addresses
 */
export const AE_CODE_OPTIONS = [
  "AA", // Americas
  "AE", // Europe/Africa/Middle East
  "AP"  // Pacific
] as const;

// ============================================================================
// VALIDATION INTERFACES
// ============================================================================

/**
 * Validation rules specific to Section 11
 */
export interface Section11ValidationRules {
  requiresStreetAddress: boolean;
  requiresCity: boolean;
  requiresStateOrCountry: boolean;
  requiresContactPerson: boolean;
  requiresFromDate: boolean;
  maxResidenceGap: number; // in months
  minimumResidenceTimeframe: number; // in years
}

/**
 * Section 11 validation context
 */
export interface Section11ValidationContext {
  rules: Section11ValidationRules;
  allowAddressEstimates: boolean;
  requiresContinuousHistory: boolean;
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

/**
 * Type for residence field updates
 */
export type Section11FieldUpdate = {
  fieldPath: string;
  newValue: any;
  entryIndex?: number;
};

/**
 * Type for residence validation results
 */
export type ResidenceValidationResult = {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  hasGaps: boolean;
  gapDetails?: Array<{ startDate: string; endDate: string; duration: number }>;
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Creates a default address information structure with sections-references
 */
export const createDefaultAddressInformationWithReferences = (entryIndex: number): ResidenceAddress => {
  if (entryIndex === 0) {
    return {
      streetAddress: createFieldFromReference(11, SECTION11_FIELD_NAMES.STREET_ADDRESS_1, ''),
      city: createFieldFromReference(11, SECTION11_FIELD_NAMES.CITY_1, ''),
      state: {
        ...createFieldFromReference(11, SECTION11_FIELD_NAMES.STATE_1, ''),
        options: getUSStateOptions().map(option => option.value),
        value: '' as USState
      },
      zipCode: createFieldFromReference(11, SECTION11_FIELD_NAMES.ZIP_CODE_1, ''),
      country: {
        ...createFieldFromReference(11, SECTION11_FIELD_NAMES.COUNTRY_1, ''),
        options: getCountryOptions().map(option => option.value),
        value: '' as Country
      }
    };
  } else {
    // THROW ERROR: Return information about entries that could not be created
    const errorDetails = {
      section: 11,
      function: 'createDefaultAddressInformationWithReferences',
      entryIndex,
      implementedEntries: [0],
      availableEntries: [0, 1, 2, 3],
      validEntryIndex: entryIndex >= 0 && entryIndex <= 3,
      reason: 'Only entry 0 is implemented with sections-references mapping'
    };

    throw new Error(`❌ SECTION11 ADDRESS CREATION FAILED: Could not create address information for entry ${entryIndex}. Details: ${JSON.stringify(errorDetails, null, 2)}`);
  }
};

/**
 * Creates a default address information structure - DEPRECATED FALLBACK FUNCTION
 * THROWS ERROR to identify where fallback was being used
 */
export const createDefaultAddressInformation = (): ResidenceAddress => {
  const errorDetails = {
    section: 11,
    function: 'createDefaultAddressInformation',
    reason: 'This fallback function should not be called',
    recommendation: 'Use createDefaultAddressInformationWithReferences() with proper entry index',
    implementedAlternatives: ['createDefaultAddressInformationWithReferences(0)'],
    availableEntries: [0, 1, 2, 3]
  };

  throw new Error(`❌ SECTION11 DEPRECATED FALLBACK CALLED: createDefaultAddressInformation() is a deprecated fallback function. Details: ${JSON.stringify(errorDetails, null, 2)}`);
};

/**
 * Creates a default contact person structure with sections-references
 */
export const createDefaultContactPersonWithReferences = (entryIndex: number): ResidenceEntry => {
  if (entryIndex === 0) {
    return {
      _id: entryIndex,
      residenceDates: createResidenceDatesFromReference(entryIndex),
      residenceAddress: createResidenceAddressFromReference(entryIndex),
      residenceType: createResidenceTypeFromReference(entryIndex),
      contactPersonName: createContactPersonNameFromReference(entryIndex),
      contactPersonPhones: createContactPersonPhonesFromReference(entryIndex),
      contactPersonRelationship: createContactPersonRelationshipFromReference(entryIndex),
      contactPersonAddress: createContactPersonAddressFromReference(entryIndex),
      contactPersonEmail: createContactPersonEmailFromReference(entryIndex),
      lastContactInfo: createLastContactInfoFromReference(entryIndex),
      apoFpoPhysicalAddress: createAPOFPOPhysicalAddressFromReference(entryIndex),
      additionalFields: createAdditionalFieldsFromReference(entryIndex)
    };
  } else {
    // No fallback - throw error to identify missing implementation
    throw new Error(`❌ SECTION11 IMPLEMENTATION ERROR: createDefaultContactPersonWithReferences not implemented for entry index ${entryIndex}. Only entry 0 is currently implemented. Valid entry indices: 0-3.`);
  }
};


/**
 * Creates a default address information structure using dynamic field mapping
 */
export const createDefaultAddressInformationDynamic = (entryIndex: number): ResidenceAddress => {
  try {
    return {
      streetAddress: createSection11Field(entryIndex, 'TextField11[3]', ''),
      city: createSection11Field(entryIndex, 'TextField11[4]', ''),
      state: {
        ...createSection11Field(entryIndex, 'School6_State[0]', ''),
        options: getUSStateOptions().map(option => option.value),
        value: '' as USState
      },
      zipCode: createSection11Field(entryIndex, 'TextField11[5]', ''),
      country: {
        ...createSection11Field(entryIndex, 'DropDownList5[0]', ''),
        options: getCountryOptions().map(option => option.value),
        value: '' as Country
      }
    };
  } catch (error) {
    // THROW ERROR: Return information about dynamic address creation failure
    const errorDetails = {
      section: 11,
      function: 'createDefaultAddressInformationDynamic',
      entryIndex,
      originalError: error instanceof Error ? error.message : String(error),
      attemptedFields: ['TextField11[3]', 'TextField11[4]', 'School6_State[0]', 'DropDownList5[0]', 'TextField11[5]'],
      availableEntries: [0, 1, 2, 3],
      validEntryIndex: entryIndex >= 0 && entryIndex <= 3,
      recommendation: 'Check field mapping for the specified entry index'
    };

    throw new Error(`❌ SECTION11 DYNAMIC ADDRESS CREATION FAILED: Could not create dynamic address for entry ${entryIndex}. Details: ${JSON.stringify(errorDetails, null, 2)}`);
  }
};

/**
 * Creates a default contact person structure using dynamic field mapping
 */
export const createDefaultContactPersonDynamic = (entryIndex: number): ResidenceEntry => {
  // No fallback - throw error to identify missing implementation
  throw new Error(`❌ SECTION11 IMPLEMENTATION ERROR: createDefaultContactPersonDynamic is deprecated and should not be called. Use createDefaultResidenceEntry(${entryIndex}) instead.`);
};



/**
 * Creates a default residence entry with the provided index using sections-references
 */
export const createDefaultResidenceEntry = (index: number): ResidenceEntry => {
  // Validate entry index - THROW ERROR instead of defaulting
  if (index < 0 || index > 3) {
    const errorDetails = {
      section: 11,
      function: 'createDefaultResidenceEntry',
      providedIndex: index,
      validIndices: [0, 1, 2, 3],
      reason: 'Entry index out of valid range',
      maxEntries: 4
    };

    throw new Error(`❌ SECTION11 INVALID ENTRY INDEX: Cannot create residence entry for index ${index}. Details: ${JSON.stringify(errorDetails, null, 2)}`);
  }

  // Creating Section 11 residence entry using sections-references

  try {
    return {
      _id: index,
      residenceDates: createResidenceDatesFromReference(index),
      residenceAddress: createResidenceAddressFromReference(index),
      residenceType: createResidenceTypeFromReference(index),
      contactPersonName: createContactPersonNameFromReference(index),
      contactPersonPhones: createContactPersonPhonesFromReference(index),
      contactPersonRelationship: createContactPersonRelationshipFromReference(index),
      contactPersonAddress: createContactPersonAddressFromReference(index),
      contactPersonEmail: createContactPersonEmailFromReference(index),
      lastContactInfo: createLastContactInfoFromReference(index),
      apoFpoPhysicalAddress: createAPOFPOPhysicalAddressFromReference(index),
      additionalFields: createAdditionalFieldsFromReference(index)
    };

  } catch (error) {
    // No fallback - throw error to identify missing implementation
    throw new Error(`❌ SECTION11 IMPLEMENTATION ERROR: Failed to create residence entry ${index + 1}. Original error: ${error instanceof Error ? error.message : String(error)}. Entry index: ${index}, Valid indices: 0-3.`);
  }
};

/**
 * Creates a default Section 11 data structure using the new human-readable structure
 * with createReferenceFrom() methods for PDF mapping
 *
 * Note: Section 11 supports up to 4 residence entries, but we start with just 1
 * Additional entries can be added via addResidenceEntry()
 */
export const createDefaultSection11 = (): Section11 => {
  // Validate field count against sections-references
  validateSectionFieldCount(11);

  return {
    _id: 11,
    section11: {
      residences: [createResidenceEntryFromReference(0)]
    }
  };
};







/**
 * Validates residence history for gaps and completeness using new structure
 */
export const validateResidenceHistory = (
  residences: ResidenceEntry[],
  context: Section11ValidationContext
): ResidenceValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Helper function to parse MM/YYYY format correctly
  const parseMMYYYY = (dateStr: string): Date => {
    if (!dateStr) {
      throw new Error(`❌ SECTION11 DATE PARSING FAILED: Empty date string provided`);
    }

    const parts = dateStr.split('/');
    if (parts.length === 2) {
      const month = parseInt(parts[0]) - 1; // Month is 0-indexed in Date
      const year = parseInt(parts[1]);

      if (isNaN(month) || isNaN(year) || month < 0 || month > 11 || year < 1900 || year > 2100) {
        throw new Error(`❌ SECTION11 DATE PARSING FAILED: Invalid month or year in "${dateStr}"`);
      }

      return new Date(year, month, 1);
    }

    throw new Error(`❌ SECTION11 DATE PARSING FAILED: Invalid date format "${dateStr}"`);
  };

  // Sort residences by date to check for gaps using new structure
  const sortedResidences = residences
    .filter(r => r.residenceDates.fromDate?.value && r.residenceDates.toDate?.value)
    .sort((a, b) => parseMMYYYY(a.residenceDates.fromDate.value).getTime() - parseMMYYYY(b.residenceDates.fromDate.value).getTime());

  // Check for basic required fields using new structure
  residences.forEach((residence, index) => {
    if (!residence.residenceAddress.streetAddress?.value) {
      errors.push(`Residence ${index + 1}: Street address is required`);
    }
    if (!residence.residenceAddress.city?.value) {
      errors.push(`Residence ${index + 1}: City is required`);
    }
    if (!residence.residenceDates.fromDate?.value) {
      errors.push(`Residence ${index + 1}: From date is required`);
    }
    if (!residence.contactPersonName.lastName?.value) {
      errors.push(`Residence ${index + 1}: Contact person last name is required`);
    }
  });

  // Check for gaps if continuous history is required
  const hasGaps = context.requiresContinuousHistory && sortedResidences.length > 1;
  const gapDetails: Array<{ startDate: string; endDate: string; duration: number }> = [];

  if (hasGaps) {
    for (let i = 0; i < sortedResidences.length - 1; i++) {
      const currentEnd = parseMMYYYY(sortedResidences[i].residenceDates.toDate.value);
      const nextStart = parseMMYYYY(sortedResidences[i + 1].residenceDates.fromDate.value);

      const timeDiff = nextStart.getTime() - currentEnd.getTime();
      const daysDiff = Math.floor(timeDiff / (1000 * 3600 * 24));

      if (daysDiff > 30) {
        gapDetails.push({
          startDate: sortedResidences[i].residenceDates.toDate.value,
          endDate: sortedResidences[i + 1].residenceDates.fromDate.value,
          duration: daysDiff
        });
      }
    }
  }

  if (gapDetails.length > 0) {
    warnings.push(`Found ${gapDetails.length} gaps in residence history`);
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    hasGaps: gapDetails.length > 0,
    gapDetails: gapDetails.length > 0 ? gapDetails : undefined
  };
};