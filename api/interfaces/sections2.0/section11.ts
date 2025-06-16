/**
 * Section 11: Where You Have Lived
 *
 * TypeScript interface definitions for SF-86 Section 11 (Where You Have Lived) data structure.
 * Based on the established Field<T> interface patterns and PDF field ID mappings from section-11.json.
 *
 * Section 11 supports 4 entries with these patterns:
 * - Entry 1: form1[0].Section11[0].*
 * - Entry 2: form1[0].Section11-2[0].*
 * - Entry 3: form1[0].Section11-3[0].*
 * - Entry 4: form1[0].Section11-4[0].*
 */

import type { Field, FieldWithOptions } from '../formDefinition2.0';
import type { USState, Country } from './base';
import { createFieldFromReference, validateSectionFieldCount } from '../../utils/sections-references-loader';
import { generateFieldName, getFieldByEntryAndType } from '../../../app/state/contexts/sections2.0/section11-field-mapping';
import { cloneDeep, set } from 'lodash';

// ============================================================================
// CORE INTERFACES
// ============================================================================

/**
 * Address information structure for residence entries
 */
export interface AddressInformation {
  streetAddress: Field<string>;
  city: Field<string>;
  state: FieldWithOptions<USState>;
  zipCode: Field<string>;
  country: FieldWithOptions<Country>;
}

/**
 * APO/FPO address information for military addresses
 */
export interface APOFPOAddress {
  isAPOFPO: Field<boolean>;
  streetUnit: Field<string>;
  apoType: FieldWithOptions<"APO" | "FPO" | "DPO">;
  aeCode: FieldWithOptions<"AA" | "AE" | "AP">;
  zipCode: Field<string>;
}

/**
 * Contact person information for each residence entry
 * Based on verified 63-field structure per entry from section-11.json
 */
export interface ContactPerson {
  // Phone fields (10 fields per entry)
  phone1: Field<string>;
  phone1Ext: Field<string>;
  phone1Intl: Field<boolean>;
  phone2: Field<string>;
  phone2Ext: Field<string>;
  phone2Intl: Field<boolean>;
  phone3: Field<string>;
  phone3Ext: Field<string>;
  phone3Intl: Field<boolean>;
  dontKnowContact: Field<boolean>;

  // Date fields (5 fields per entry)
  fromDate: Field<string>;
  fromDateEstimate: Field<boolean>;
  toDate: Field<string>;
  toDateEstimate: Field<boolean>;
  present: Field<boolean>;

  // Main address fields (5 fields per entry)
  streetAddress: Field<string>;
  city: Field<string>;
  state: Field<string>;
  country: Field<string>;
  zipCode: Field<string>;

  // Contact person names (4 fields per entry)
  firstName: Field<string>;
  middleName: Field<string>;
  lastName: Field<string>;
  suffix: Field<string>;

  // Relationship fields (6 fields per entry)
  relationshipNeighbor: Field<boolean>;
  relationshipFriend: Field<boolean>;
  relationshipLandlord: Field<boolean>;
  relationshipBusiness: Field<boolean>;
  relationshipOther: Field<boolean>;
  relationshipOtherExplain: Field<string>;

  // Contact address fields (6 fields per entry)
  contactStreet: Field<string>;
  contactCity: Field<string>;
  contactState: Field<string>;
  contactCountry: Field<string>;
  contactZip: Field<string>;
  contactEmail: Field<string>;
  contactEmailUnknown: Field<boolean>;

  // Last contact fields (2 fields per entry)
  lastContact: Field<string>;
  lastContactEstimate: Field<boolean>;

  // Physical address fields (15 fields per entry)
  physicalStreet: Field<string>;
  physicalCity: Field<string>;
  physicalState: Field<string>;
  physicalCountry: Field<string>;
  physicalAddressAlt: Field<string>;
  apoFpoAddress: Field<string>;
  apoFpoState: Field<string>;
  apoFpoZip: Field<string>;
  physicalZip: Field<string>;
  physicalAltStreet: Field<string>;
  physicalAltCity: Field<string>;
  physicalAltState: Field<string>;
  physicalAltCountry: Field<string>;
  physicalAltZip: Field<string>;
  physicalAddressFull: Field<string>;

  // Radio button fields (3 fields per entry)
  residenceType: Field<string>;
  addressTypeRadio: Field<string>;
  residenceTypeRadioAlt: Field<string>;

  // Additional fields to complete 63 per entry
  residenceTypeOther: Field<string>;
  apoFpoFull: Field<string>;
  apoFpoStateAlt: Field<string>;
  apoFpoZipAlt: Field<string>;
}

/**
 * Residence entry structure for Section 11
 * VERIFIED: Each entry has exactly 63 fields (uniform distribution)
 * All fields are contained within the ContactPerson interface
 */
export interface ResidenceEntry {
  // All 63 fields per entry are managed through the ContactPerson interface
  // which has been restructured to include all field categories:
  // - Phone fields (10): 3 phones + 3 extensions + 4 international flags
  // - Date fields (5): from/to dates + estimates + present
  // - Main address fields (5): street, city, state, country, zip
  // - Contact person names (4): first, middle, last, suffix
  // - Relationship fields (6): 5 checkboxes + other explanation
  // - Contact address fields (7): street, city, state, country, zip, email + unknown
  // - Last contact fields (2): date + estimate
  // - Physical address fields (15): multiple address variations for APO/FPO
  // - Radio button fields (3): residence type + address type selections
  // - Additional fields (6): residence type other + APO/FPO variations
  // TOTAL: 63 fields per entry (verified from section-11.json)
  contactPerson: ContactPerson;
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
  
  // Entry 1 - Contact person
  CONTACT_LAST_NAME_1: "form1[0].Section11[0].TextField11[6]",
  CONTACT_FIRST_NAME_1: "form1[0].Section11[0].TextField11[7]",
  CONTACT_MIDDLE_NAME_1: "form1[0].Section11[0].TextField11[8]",
  
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

  // Entry 2 - Contact person
  CONTACT_LAST_NAME_2: "form1[0].Section11-2[0].TextField11[6]",
  CONTACT_FIRST_NAME_2: "form1[0].Section11-2[0].TextField11[7]",
  CONTACT_MIDDLE_NAME_2: "form1[0].Section11-2[0].TextField11[8]",

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

  // Entry 3 - Contact person
  CONTACT_LAST_NAME_3: "form1[0].Section11-3[0].TextField11[6]",
  CONTACT_FIRST_NAME_3: "form1[0].Section11-3[0].TextField11[7]",
  CONTACT_MIDDLE_NAME_3: "form1[0].Section11-3[0].TextField11[8]",

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

  // Entry 4 - Contact person
  CONTACT_LAST_NAME_4: "form1[0].Section11-4[0].TextField11[6]",
  CONTACT_FIRST_NAME_4: "form1[0].Section11-4[0].TextField11[7]",
  CONTACT_MIDDLE_NAME_4: "form1[0].Section11-4[0].TextField11[8]",

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
 * Generate field name for a specific entry and field type
 * Uses sections-references as single source of truth
 */
export function getSection11FieldName(entryIndex: number, fieldType: string): string {
  return generateFieldName(fieldType, entryIndex);
}


/**
 * Create a field using sections-references data for Section 11
 */
export function createSection11Field<T>(entryIndex: number, fieldType: string, defaultValue: T): Field<T> {
  const fieldName = getSection11FieldName(entryIndex, fieldType);
  return createFieldFromReference(11, fieldName, defaultValue);
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
export const createDefaultAddressInformationWithReferences = (entryIndex: number): AddressInformation => {
  if (entryIndex === 0) {
    return {
      streetAddress: createFieldFromReference(11, SECTION11_FIELD_NAMES.STREET_ADDRESS_1, ''),
      city: createFieldFromReference(11, SECTION11_FIELD_NAMES.CITY_1, ''),
      state: {
        ...createFieldFromReference(11, SECTION11_FIELD_NAMES.STATE_1, ''),
        options: [
          "AK", "AL", "AR", "AS", "AZ", "CA", "CO", "CT", "DC", "DE",
          "FL", "FM", "GA", "GU", "HI", "IA", "ID", "IL", "IN", "KS",
          "KY", "LA", "MA", "MD", "ME", "MH", "MI", "MN", "MO", "MP",
          "MS", "MT", "NC", "ND", "NE", "NH", "NJ", "NM", "NV", "NY",
          "OH", "OK", "OR", "PA", "PR", "PW", "RI", "SC", "SD", "TN",
          "TX", "UT", "VA", "VI", "VT", "WA", "WI", "WV", "WY", "AA", "AE", "AP", ""
        ],
        value: '' as USState
      },
      zipCode: createFieldFromReference(11, SECTION11_FIELD_NAMES.ZIP_CODE_1, ''),
      country: {
        ...createFieldFromReference(11, SECTION11_FIELD_NAMES.COUNTRY_1, ''),
        options: [
          "Afghanistan", "Albania", "Algeria", "Argentina", "Armenia", "Australia",
          "Austria", "Azerbaijan", "Bahrain", "Bangladesh", "Belarus", "Belgium",
          "Bolivia", "Brazil", "Bulgaria", "Cambodia", "Canada", "Chile", "China",
          "Colombia", "Croatia", "Cuba", "Cyprus", "Czech Republic", "Denmark",
          "Ecuador", "Egypt", "Estonia", "Finland", "France", "Germany", "Greece",
          "Hungary", "Iceland", "India", "Indonesia", "Iran", "Iraq", "Ireland",
          "Israel", "Italy", "Japan", "Jordan", "Kazakhstan", "Kuwait", "Latvia",
          "Lebanon", "Lithuania", "Luxembourg", "Mexico", "Netherlands", "New Zealand",
          "Norway", "Pakistan", "Poland", "Portugal", "Romania", "Russia", "Saudi Arabia",
          "Singapore", "Slovakia", "Slovenia", "South Korea", "Spain", "Sweden",
          "Switzerland", "Syria", "Thailand", "Turkey", "Ukraine", "United Kingdom",
          "Vietnam", ""
        ],
        value: '' as Country
      }
    };
  } else {
    // Fallback for other entries
    return createDefaultAddressInformation();
  }
};

/**
 * Creates a default address information structure (fallback)
 */
export const createDefaultAddressInformation = (): AddressInformation => ({
  streetAddress: {
    id: '',
    name: '',
    type: 'PDFTextField',
    label: 'Street Address',
    value: '',
    rect: { x: 0, y: 0, width: 0, height: 0 }
  },
  city: {
    id: '',
    name: '',
    type: 'PDFTextField',
    label: 'City',
    value: '',
    rect: { x: 0, y: 0, width: 0, height: 0 }
  },
  state: {
    id: '',
    name: '',
    type: 'PDFDropdown',
    label: 'State',
    value: '' as USState,
    options: [
      "AK", "AL", "AR", "AS", "AZ", "CA", "CO", "CT", "DC", "DE", 
      "FL", "FM", "GA", "GU", "HI", "IA", "ID", "IL", "IN", "KS", 
      "KY", "LA", "MA", "MD", "ME", "MH", "MI", "MN", "MO", "MP", 
      "MS", "MT", "NC", "ND", "NE", "NH", "NJ", "NM", "NV", "NY", 
      "OH", "OK", "OR", "PA", "PR", "PW", "RI", "SC", "SD", "TN", 
      "TX", "UT", "VA", "VI", "VT", "WA", "WI", "WV", "WY", "AA", "AE", "AP", ""
    ],
    rect: { x: 0, y: 0, width: 0, height: 0 }
  },
  zipCode: {
    id: '',
    name: '',
    type: 'PDFTextField',
    label: 'Zip Code',
    value: '',
    rect: { x: 0, y: 0, width: 0, height: 0 }
  },
  country: {
    id: '',
    name: '',
    type: 'PDFDropdown',
    label: 'Country',
    value: '' as Country,
    options: [
      "Afghanistan", "Albania", "Algeria", "Argentina", "Armenia", "Australia", 
      "Austria", "Azerbaijan", "Bahrain", "Bangladesh", "Belarus", "Belgium", 
      "Bolivia", "Brazil", "Bulgaria", "Cambodia", "Canada", "Chile", "China", 
      "Colombia", "Croatia", "Cuba", "Cyprus", "Czech Republic", "Denmark", 
      "Ecuador", "Egypt", "Estonia", "Finland", "France", "Germany", "Greece", 
      "Hungary", "Iceland", "India", "Indonesia", "Iran", "Iraq", "Ireland", 
      "Israel", "Italy", "Japan", "Jordan", "Kazakhstan", "Kuwait", "Latvia", 
      "Lebanon", "Lithuania", "Luxembourg", "Mexico", "Netherlands", "New Zealand", 
      "Norway", "Pakistan", "Poland", "Portugal", "Romania", "Russia", "Saudi Arabia", 
      "Singapore", "Slovakia", "Slovenia", "South Korea", "Spain", "Sweden", 
      "Switzerland", "Syria", "Thailand", "Turkey", "Ukraine", "United Kingdom", 
      "Vietnam", ""
    ],
    rect: { x: 0, y: 0, width: 0, height: 0 }
  }
});

/**
 * Creates a default contact person structure with sections-references
 */
export const createDefaultContactPersonWithReferences = (entryIndex: number): ContactPerson => {
  if (entryIndex === 0) {
    return {
      lastName: createFieldFromReference(11, SECTION11_FIELD_NAMES.CONTACT_LAST_NAME_1, ''),
      firstName: createFieldFromReference(11, SECTION11_FIELD_NAMES.CONTACT_FIRST_NAME_1, ''),
      middleName: createFieldFromReference(11, SECTION11_FIELD_NAMES.CONTACT_MIDDLE_NAME_1, ''),
      relationship: {
        id: '',
        name: '',
        type: 'PDFDropdown',
        label: 'Relationship',
        value: 'Neighbor' as const,
        options: RELATIONSHIP_OPTIONS,
        rect: { x: 0, y: 0, width: 0, height: 0 }
      },
      relationshipOther: {
        id: '',
        name: '',
        type: 'PDFTextField',
        label: 'Other Relationship',
        value: '',
        rect: { x: 0, y: 0, width: 0, height: 0 }
      },
      eveningPhone: createFieldFromReference(11, SECTION11_FIELD_NAMES.EVENING_PHONE_1, ''),
      eveningPhoneExt: createFieldFromReference(11, SECTION11_FIELD_NAMES.EVENING_PHONE_EXT_1, ''),
      eveningPhoneIntl: createFieldFromReference(11, SECTION11_FIELD_NAMES.EVENING_PHONE_INTL_1, false),
      daytimePhone: createFieldFromReference(11, SECTION11_FIELD_NAMES.DAYTIME_PHONE_1, ''),
      daytimePhoneExt: createFieldFromReference(11, SECTION11_FIELD_NAMES.DAYTIME_PHONE_EXT_1, ''),
      daytimePhoneIntl: createFieldFromReference(11, SECTION11_FIELD_NAMES.DAYTIME_PHONE_INTL_1, false),
      mobilePhone: createFieldFromReference(11, SECTION11_FIELD_NAMES.MOBILE_PHONE_1, ''),
      mobilePhoneExt: createFieldFromReference(11, SECTION11_FIELD_NAMES.MOBILE_PHONE_EXT_1, ''),
      mobilePhoneIntl: createFieldFromReference(11, SECTION11_FIELD_NAMES.MOBILE_PHONE_INTL_1, false),
      email: createFieldFromReference(11, SECTION11_FIELD_NAMES.EMAIL_1, ''),
      address: createDefaultAddressInformationWithReferences(entryIndex),
      monthLastContact: {
        id: '',
        name: '',
        type: 'PDFTextField',
        label: 'Month of Last Contact',
        value: '',
        rect: { x: 0, y: 0, width: 0, height: 0 }
      },
      dontKnowContact: createFieldFromReference(11, SECTION11_FIELD_NAMES.DONT_KNOW_CONTACT_1, false),

      // Missing high-priority fields for Entry 1
      neighborLastName: createFieldFromReference(11, SECTION11_FIELD_NAMES.NEIGHBOR_LAST_NAME_1, ''),
      neighborFirstName: createFieldFromReference(11, SECTION11_FIELD_NAMES.NEIGHBOR_FIRST_NAME_1, ''),
      neighborMiddleName: createFieldFromReference(11, SECTION11_FIELD_NAMES.NEIGHBOR_MIDDLE_NAME_1, ''),
      neighborPhone1: createFieldFromReference(11, SECTION11_FIELD_NAMES.NEIGHBOR_PHONE_1, ''),
      neighborPhone2: createFieldFromReference(11, SECTION11_FIELD_NAMES.NEIGHBOR_PHONE_2, ''),
      neighborPhone3: createFieldFromReference(11, SECTION11_FIELD_NAMES.NEIGHBOR_PHONE_3, ''),
      neighborAddress: createFieldFromReference(11, SECTION11_FIELD_NAMES.NEIGHBOR_ADDRESS_1, ''),
      neighborState: createFieldFromReference(11, SECTION11_FIELD_NAMES.NEIGHBOR_STATE_1, ''),
      neighborZip: createFieldFromReference(11, SECTION11_FIELD_NAMES.NEIGHBOR_ZIP_1, ''),
      neighborEmail: createFieldFromReference(11, SECTION11_FIELD_NAMES.NEIGHBOR_EMAIL_1, ''),
      lastContact: createFieldFromReference(11, SECTION11_FIELD_NAMES.LAST_CONTACT_1, ''),
      apoFpoAddressField: createFieldFromReference(11, SECTION11_FIELD_NAMES.APO_FPO_ADDRESS_1, ''),
      physicalAddress: createFieldFromReference(11, SECTION11_FIELD_NAMES.PHYSICAL_ADDRESS_1, '')
    };
  } else {
    // Fallback for other entries
    return createDefaultContactPerson();
  }
};

/**
 * Creates a default contact person structure (fallback)
 */
export const createDefaultContactPerson = (): ContactPerson => ({
  lastName: {
    id: '',
    name: '',
    type: 'PDFTextField',
    label: 'Last Name',
    value: '',
    rect: { x: 0, y: 0, width: 0, height: 0 }
  },
  firstName: {
    id: '',
    name: '',
    type: 'PDFTextField',
    label: 'First Name',
    value: '',
    rect: { x: 0, y: 0, width: 0, height: 0 }
  },
  middleName: {
    id: '',
    name: '',
    type: 'PDFTextField',
    label: 'Middle Name',
    value: '',
    rect: { x: 0, y: 0, width: 0, height: 0 }
  },
  relationship: {
    id: '',
    name: '',
    type: 'PDFDropdown',
    label: 'Relationship',
    value: 'Neighbor' as const,
    options: RELATIONSHIP_OPTIONS,
    rect: { x: 0, y: 0, width: 0, height: 0 }
  },
  relationshipOther: {
    id: '',
    name: '',
    type: 'PDFTextField',
    label: 'Other Relationship',
    value: '',
    rect: { x: 0, y: 0, width: 0, height: 0 }
  },
  eveningPhone: {
    id: '',
    name: '',
    type: 'PDFTextField',
    label: 'Evening Phone',
    value: '',
    rect: { x: 0, y: 0, width: 0, height: 0 }
  },
  eveningPhoneExt: {
    id: '',
    name: '',
    type: 'PDFTextField',
    label: 'Evening Phone Extension',
    value: '',
    rect: { x: 0, y: 0, width: 0, height: 0 }
  },
  eveningPhoneIntl: {
    id: '',
    name: '',
    type: 'PDFCheckBox',
    label: 'Evening Phone International',
    value: false,
    rect: { x: 0, y: 0, width: 0, height: 0 }
  },
  daytimePhone: {
    id: '',
    name: '',
    type: 'PDFTextField',
    label: 'Daytime Phone',
    value: '',
    rect: { x: 0, y: 0, width: 0, height: 0 }
  },
  daytimePhoneExt: {
    id: '',
    name: '',
    type: 'PDFTextField',
    label: 'Daytime Phone Extension',
    value: '',
    rect: { x: 0, y: 0, width: 0, height: 0 }
  },
  daytimePhoneIntl: {
    id: '',
    name: '',
    type: 'PDFCheckBox',
    label: 'Daytime Phone International',
    value: false,
    rect: { x: 0, y: 0, width: 0, height: 0 }
  },
  mobilePhone: {
    id: '',
    name: '',
    type: 'PDFTextField',
    label: 'Mobile Phone',
    value: '',
    rect: { x: 0, y: 0, width: 0, height: 0 }
  },
  mobilePhoneExt: {
    id: '',
    name: '',
    type: 'PDFTextField',
    label: 'Mobile Phone Extension',
    value: '',
    rect: { x: 0, y: 0, width: 0, height: 0 }
  },
  mobilePhoneIntl: {
    id: '',
    name: '',
    type: 'PDFCheckBox',
    label: 'Mobile Phone International',
    value: false,
    rect: { x: 0, y: 0, width: 0, height: 0 }
  },
  email: {
    id: '',
    name: '',
    type: 'PDFTextField',
    label: 'Email',
    value: '',
    rect: { x: 0, y: 0, width: 0, height: 0 }
  },
  address: createDefaultAddressInformation(),
  monthLastContact: {
    id: '',
    name: '',
    type: 'PDFTextField',
    label: 'Month of Last Contact',
    value: '',
    rect: { x: 0, y: 0, width: 0, height: 0 }
  },
  dontKnowContact: {
    id: '',
    name: '',
    type: 'PDFCheckBox',
    label: "I don't know this person",
    value: false,
    rect: { x: 0, y: 0, width: 0, height: 0 }
  },

  // Optional fields for missing high-priority functionality
  neighborLastName: undefined,
  neighborFirstName: undefined,
  neighborMiddleName: undefined,
  neighborPhone1: undefined,
  neighborPhone2: undefined,
  neighborPhone3: undefined,
  neighborAddress: undefined,
  neighborState: undefined,
  neighborZip: undefined,
  neighborEmail: undefined,
  lastContact: undefined,
  apoFpoAddressField: undefined,
  physicalAddress: undefined
});

/**
 * Creates a default address information structure using dynamic field mapping
 */
export const createDefaultAddressInformationDynamic = (entryIndex: number): AddressInformation => {
  try {
    return {
      streetAddress: createSection11Field(entryIndex, 'TextField11[3]', ''),
      city: createSection11Field(entryIndex, 'TextField11[4]', ''),
      state: {
        ...createSection11Field(entryIndex, 'School6_State[0]', ''),
        options: [
          "AK", "AL", "AR", "AS", "AZ", "CA", "CO", "CT", "DC", "DE",
          "FL", "FM", "GA", "GU", "HI", "IA", "ID", "IL", "IN", "KS",
          "KY", "LA", "MA", "MD", "ME", "MH", "MI", "MN", "MO", "MP",
          "MS", "MT", "NC", "ND", "NE", "NH", "NJ", "NM", "NV", "NY",
          "OH", "OK", "OR", "PA", "PR", "PW", "RI", "SC", "SD", "TN",
          "TX", "UT", "VA", "VI", "VT", "WA", "WI", "WV", "WY", "AA", "AE", "AP", ""
        ],
        value: '' as USState
      },
      zipCode: createSection11Field(entryIndex, 'TextField11[5]', ''),
      country: {
        ...createSection11Field(entryIndex, 'DropDownList5[0]', ''),
        options: [
          "Afghanistan", "Albania", "Algeria", "Argentina", "Armenia", "Australia",
          "Austria", "Azerbaijan", "Bahrain", "Bangladesh", "Belarus", "Belgium",
          "Bolivia", "Brazil", "Bulgaria", "Cambodia", "Canada", "Chile", "China",
          "Colombia", "Croatia", "Cuba", "Cyprus", "Czech Republic", "Denmark",
          "Ecuador", "Egypt", "Estonia", "Finland", "France", "Germany", "Greece",
          "Hungary", "Iceland", "India", "Indonesia", "Iran", "Iraq", "Ireland",
          "Israel", "Italy", "Japan", "Jordan", "Kazakhstan", "Kuwait", "Latvia",
          "Lebanon", "Lithuania", "Luxembourg", "Mexico", "Netherlands", "New Zealand",
          "Norway", "Pakistan", "Poland", "Portugal", "Romania", "Russia", "Saudi Arabia",
          "Singapore", "Slovakia", "Slovenia", "South Korea", "Spain", "Sweden",
          "Switzerland", "Syria", "Thailand", "Turkey", "Ukraine", "United Kingdom",
          "Vietnam", ""
        ],
        value: '' as Country
      }
    };
  } catch (error) {
    console.warn(`⚠️ Failed to create dynamic address for entry ${entryIndex}, using fallback`);
    return createDefaultAddressInformation();
  }
};

/**
 * Creates a default contact person structure using dynamic field mapping
 */
export const createDefaultContactPersonDynamic = (entryIndex: number): ContactPerson => {
  try {
    return {
      lastName: createSection11Field(entryIndex, 'TextField11[6]', ''),
      firstName: createSection11Field(entryIndex, 'TextField11[7]', ''),
      middleName: createSection11Field(entryIndex, 'TextField11[8]', ''),
      relationship: {
        id: '',
        name: '',
        type: 'PDFDropdown',
        label: 'Relationship',
        value: 'Neighbor' as const,
        options: RELATIONSHIP_OPTIONS,
        rect: { x: 0, y: 0, width: 0, height: 0 }
      },
      relationshipOther: {
        id: '',
        name: '',
        type: 'PDFTextField',
        label: 'Other Relationship',
        value: '',
        rect: { x: 0, y: 0, width: 0, height: 0 }
      },
      eveningPhone: createSection11Field(entryIndex, 'p3-t68[0]', ''),
      eveningPhoneExt: createSection11Field(entryIndex, 'TextField11[0]', ''),
      eveningPhoneIntl: createSection11Field(entryIndex, '#field[4]', false),
      daytimePhone: createSection11Field(entryIndex, 'p3-t68[1]', ''),
      daytimePhoneExt: createSection11Field(entryIndex, 'TextField11[1]', ''),
      daytimePhoneIntl: createSection11Field(entryIndex, '#field[10]', false),
      mobilePhone: createSection11Field(entryIndex, 'p3-t68[2]', ''),
      mobilePhoneExt: createSection11Field(entryIndex, 'TextField11[2]', ''),
      mobilePhoneIntl: createSection11Field(entryIndex, '#field[12]', false),
      email: createSection11Field(entryIndex, 'p3-t68[3]', ''),
      address: createDefaultAddressInformationDynamic(entryIndex),
      monthLastContact: {
        id: '',
        name: '',
        type: 'PDFTextField',
        label: 'Month of Last Contact',
        value: '',
        rect: { x: 0, y: 0, width: 0, height: 0 }
      },
      dontKnowContact: createSection11Field(entryIndex, '#field[5]', false)
    };
  } catch (error) {
    console.warn(`⚠️ Failed to create dynamic contact person for entry ${entryIndex}, using fallback`);
    return createDefaultContactPerson();
  }
};

/**
 * Creates a fallback residence entry when sections-references fails
 */
export const createFallbackResidenceEntry = (index: number): ResidenceEntry => {
  const indexStr = index === 0 ? '1' : `${index + 1}`;

  return {
    fromDate: {
      id: `residence_from_date_${indexStr}`,
      name: `residence_from_date_${indexStr}`,
      type: 'PDFTextField',
      label: 'From Date (Month/Year)',
      value: '',
      rect: { x: 0, y: 0, width: 0, height: 0 }
    },
    fromDateEstimate: {
      id: `residence_from_estimate_${indexStr}`,
      name: `residence_from_estimate_${indexStr}`,
      type: 'PDFCheckBox',
      label: 'From Date Estimate',
      value: false,
      rect: { x: 0, y: 0, width: 0, height: 0 }
    },
    toDate: {
      id: `residence_to_date_${indexStr}`,
      name: `residence_to_date_${indexStr}`,
      type: 'PDFTextField',
      label: 'To Date (Month/Year)',
      value: '',
      rect: { x: 0, y: 0, width: 0, height: 0 }
    },
    toDateEstimate: {
      id: `residence_to_estimate_${indexStr}`,
      name: `residence_to_estimate_${indexStr}`,
      type: 'PDFCheckBox',
      label: 'To Date Estimate',
      value: false,
      rect: { x: 0, y: 0, width: 0, height: 0 }
    },
    present: {
      id: `residence_present_${indexStr}`,
      name: `residence_present_${indexStr}`,
      type: 'PDFCheckBox',
      label: 'Present',
      value: false,
      rect: { x: 0, y: 0, width: 0, height: 0 }
    },
    residenceType: {
      id: `residence_type_${indexStr}`,
      name: `residence_type_${indexStr}`,
      type: 'PDFRadioGroup',
      label: 'Residence Type',
      value: 'Own' as const,
      options: RESIDENCE_TYPE_OPTIONS,
      rect: { x: 0, y: 0, width: 0, height: 0 }
    },
    residenceTypeOther: {
      id: `residence_type_other_${indexStr}`,
      name: `residence_type_other_${indexStr}`,
      type: 'PDFTextField',
      label: 'Other Residence Type',
      value: '',
      rect: { x: 0, y: 0, width: 0, height: 0 }
    },
    address: createDefaultAddressInformation(),
    contactPerson: createDefaultContactPerson()
  };
};

/**
 * Creates a default residence entry with the provided index using sections-references
 */
export const createDefaultResidenceEntry = (index: number): ResidenceEntry => {
  // Validate entry index
  if (index < 0 || index > 3) {
    console.warn(`Invalid entry index: ${index}, defaulting to 0`);
    index = 0;
  }

  // console.log(`🏠 Creating Section 11 residence entry ${index + 1} using sections-references`);

  try {
    return {
      // Date fields using dynamic field mapping
      fromDate: createSection11Field(index, 'From_Datefield_Name_2[0]', ''),
      fromDateEstimate: createSection11Field(index, '#field[15]', false),
      toDate: createSection11Field(index, 'From_Datefield_Name_2[1]', ''),
      toDateEstimate: createSection11Field(index, '#field[18]', false),
      present: createSection11Field(index, '#field[17]', false),

      // Residence type fields
      residenceType: {
        ...createSection11Field(index, 'RadioButtonList[0]', '4'),
        options: RESIDENCE_TYPE_OPTIONS,
        value: 'Own' as const
      },
      residenceTypeOther: createSection11Field(index, 'TextField12[0]', ''),

      // Address and contact using dynamic creation
      address: createDefaultAddressInformationDynamic(index),
      contactPerson: createDefaultContactPersonDynamic(index)
    };
  } catch (error) {
    console.error(`❌ Failed to create residence entry ${index + 1} using sections-references:`, error);
    console.log(`🔄 Falling back to generic field creation for entry ${index + 1}`);

    // Fallback to generic field creation
    return createFallbackResidenceEntry(index);
  }
};

/**
 * Creates a default Section 11 data structure using DRY approach with sections-references
 * This eliminates hardcoded values and uses the single source of truth
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
      residences: [createDefaultResidenceEntry(0)]
    }
  };
};

/**
 * Updates a specific field in the Section 11 data structure
 * Uses lodash set() for flexible field path handling (following Section 29 pattern)
 */
export const updateSection11Field = (
  section11Data: Section11,
  update: Section11FieldUpdate
): Section11 => {
  const { fieldPath, newValue, entryIndex = 0 } = update;
  const newData = cloneDeep(section11Data);

  console.log(`🔧 Section11: updateSection11Field called:`, {
    fieldPath,
    newValue,
    entryIndex,
  });

  // Ensure we have a valid entry index
  if (!newData.section11.residences[entryIndex]) {
    console.warn(`Section 11: Invalid entry index ${entryIndex}`);
    return newData;
  }

  const residence = newData.section11.residences[entryIndex];

  try {
    // Use lodash set() to handle any field path automatically (like Section 29)
    // This handles both simple paths like 'fromDate' and complex paths like 'contactPerson.firstName'
    set(residence, `${fieldPath}.value`, newValue);

    console.log(`✅ Section11: Field updated successfully - ${fieldPath} = ${newValue}`);

    // Special handling for 'present' field - if true, set toDate to 'Present'
    if (fieldPath === 'present' && newValue === true) {
      residence.toDate.value = 'Present';
      console.log(`✅ Section11: Auto-set toDate to 'Present' because present=true`);
    }

  } catch (error) {
    console.error(`❌ Section11: Failed to update field ${fieldPath}:`, error);
    console.warn(`Section 11: Unknown or invalid field path: ${fieldPath}`);
  }

  return newData;
};

/**
 * Adds a new residence entry to Section 11
 */
// Global flag to prevent double execution at the interface level
let isAddingResidenceEntry = false;

export const addResidenceEntry = (section11Data: Section11): Section11 => {
  // Prevent double execution at the lowest level
  if (isAddingResidenceEntry) {
    console.warn(`🚫 addResidenceEntryImpl: Already adding entry, returning unchanged data`);
    return section11Data;
  }

  isAddingResidenceEntry = true;

  try {
    const newData = { ...section11Data };
    const currentLength = newData.section11.residences.length;

    console.log(`🏠 addResidenceEntryImpl: Current length: ${currentLength}, creating entry at index: ${currentLength}`);

    // Additional safety check - prevent creating more than 4 entries
    if (currentLength >= 4) {
      console.warn(`🚫 addResidenceEntryImpl: Cannot add more than 4 entries (current: ${currentLength})`);
      return section11Data;
    }

    const newEntry = createDefaultResidenceEntry(currentLength);

    console.log(`🏠 addResidenceEntryImpl: Created entry for index ${currentLength}, adding to array`);

    newData.section11.residences = [...newData.section11.residences, newEntry];

    console.log(`🏠 addResidenceEntryImpl: Final array length: ${newData.section11.residences.length}`);

    return newData;
  } finally {
    // Reset flag after a short delay to allow for React's double execution
    setTimeout(() => {
      isAddingResidenceEntry = false;
    }, 200);
  }
};

/**
 * Removes a residence entry from Section 11
 */
export const removeResidenceEntry = (section11Data: Section11, index: number): Section11 => {
  const newData = { ...section11Data };
  newData.section11.residences = newData.section11.residences.filter((_, i) => i !== index);
  return newData;
};

/**
 * Validates residence history for gaps and completeness
 */
export const validateResidenceHistory = (
  residences: ResidenceEntry[],
  context: Section11ValidationContext
): ResidenceValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Helper function to parse MM/YYYY format correctly
  const parseMMYYYY = (dateStr: string): Date => {
    if (!dateStr) return new Date();

    // Handle MM/YYYY format (e.g., "01/2020")
    const parts = dateStr.split('/');
    if (parts.length === 2) {
      const month = parseInt(parts[0]) - 1; // Month is 0-indexed in Date
      const year = parseInt(parts[1]);
      return new Date(year, month, 1); // Use first day of month
    }

    // Fallback to regular Date parsing
    return new Date(dateStr);
  };

  // Sort residences by date to check for gaps
  const sortedResidences = residences
    .filter(r => r.fromDate.value && r.toDate.value)
    .sort((a, b) => parseMMYYYY(a.fromDate.value).getTime() - parseMMYYYY(b.fromDate.value).getTime());

  // Check for basic required fields
  residences.forEach((residence, index) => {
    if (!residence.address.streetAddress.value) {
      errors.push(`Residence ${index + 1}: Street address is required`);
    }
    if (!residence.address.city.value) {
      errors.push(`Residence ${index + 1}: City is required`);
    }
    if (!residence.fromDate.value) {
      errors.push(`Residence ${index + 1}: From date is required`);
    }
    if (!residence.contactPerson.lastName.value) {
      errors.push(`Residence ${index + 1}: Contact person last name is required`);
    }
  });

  // Check for gaps if continuous history is required
  const hasGaps = context.requiresContinuousHistory && sortedResidences.length > 1;
  const gapDetails: Array<{ startDate: string; endDate: string; duration: number }> = [];

  if (hasGaps) {
    for (let i = 0; i < sortedResidences.length - 1; i++) {
      const currentEnd = parseMMYYYY(sortedResidences[i].toDate.value);
      const nextStart = parseMMYYYY(sortedResidences[i + 1].fromDate.value);

      const timeDiff = nextStart.getTime() - currentEnd.getTime();
      const daysDiff = Math.floor(timeDiff / (1000 * 3600 * 24));

      if (daysDiff > 30) { // Gap of more than 30 days
        gapDetails.push({
          startDate: sortedResidences[i].toDate.value,
          endDate: sortedResidences[i + 1].fromDate.value,
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