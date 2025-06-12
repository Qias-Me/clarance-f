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
 * Contact person information for each residence
 */
export interface ContactPerson {
  lastName: Field<string>;
  firstName: Field<string>;
  middleName: Field<string>;
  relationship: FieldWithOptions<"Neighbor" | "Landlord" | "Friend" | "Relative" | "Other">;
  relationshipOther: Field<string>;
  
  // Contact methods
  eveningPhone: Field<string>;
  eveningPhoneExt: Field<string>;
  eveningPhoneIntl: Field<boolean>;
  daytimePhone: Field<string>;
  daytimePhoneExt: Field<string>;
  daytimePhoneIntl: Field<boolean>;
  mobilePhone: Field<string>;
  mobilePhoneExt: Field<string>;
  mobilePhoneIntl: Field<boolean>;
  email: Field<string>;
  
  // Contact address
  address: AddressInformation;
  apoFpoAddress?: APOFPOAddress;
  
  // Contact availability
  monthLastContact: Field<string>;
  dontKnowContact: Field<boolean>;
}

/**
 * Residence entry structure for Section 11
 */
export interface ResidenceEntry {
  // Date information
  fromDate: Field<string>;
  fromDateEstimate: Field<boolean>;
  toDate: Field<string>;
  toDateEstimate: Field<boolean>;
  present: Field<boolean>;
  
  // Address type
  residenceType: FieldWithOptions<"Own" | "Rent" | "Military Housing" | "Other">;
  residenceTypeOther: Field<string>;
  
  // Address information
  address: AddressInformation;
  apoFpoAddress?: APOFPOAddress;
  
  // Contact person who knows you at this address
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
 * Based on the actual field IDs from section-11.json (4-digit format)
 */
export const SECTION11_FIELD_IDS = {
  // Entry 1 - Main address fields
  STREET_ADDRESS_1: "9804", // form1[0].Section11[0].TextField11[3]
  CITY_1: "9803", // form1[0].Section11[0].TextField11[4]
  STATE_1: "9802", // form1[0].Section11[0].School6_State[0]
  COUNTRY_1: "9801", // form1[0].Section11[0].DropDownList5[0]
  ZIP_CODE_1: "9800", // form1[0].Section11[0].TextField11[5]
  
  // Entry 1 - Date fields
  FROM_DATE_1: "9814", // form1[0].Section11[0].From_Datefield_Name_2[0]
  FROM_DATE_ESTIMATE_1: "9813", // form1[0].Section11[0].#field[15]
  TO_DATE_1: "9812", // form1[0].Section11[0].From_Datefield_Name_2[1]
  TO_DATE_ESTIMATE_1: "9810", // form1[0].Section11[0].#field[18]
  PRESENT_1: "9811", // form1[0].Section11[0].#field[17]
  
  // Entry 1 - Residence type
  RESIDENCE_TYPE_1: "17200", // form1[0].Section11[0].RadioButtonList[0]
  RESIDENCE_TYPE_OTHER_1: "9805", // form1[0].Section11[0].TextField12[0]
  
  // Entry 1 - Contact person
  CONTACT_LAST_NAME_1: "9789", // form1[0].Section11[0].TextField11[6]
  CONTACT_FIRST_NAME_1: "9788", // form1[0].Section11[0].TextField11[7]
  CONTACT_MIDDLE_NAME_1: "9787", // form1[0].Section11[0].TextField11[8]
  
  // Entry 1 - Contact phone numbers
  EVENING_PHONE_1: "9826", // form1[0].Section11[0].p3-t68[0]
  EVENING_PHONE_EXT_1: "9825", // form1[0].Section11[0].TextField11[0]
  EVENING_PHONE_INTL_1: "9824", // form1[0].Section11[0].#field[4]
  DAYTIME_PHONE_1: "9822", // form1[0].Section11[0].p3-t68[1]
  DAYTIME_PHONE_EXT_1: "9821", // form1[0].Section11[0].TextField11[1]
  DAYTIME_PHONE_INTL_1: "9818", // form1[0].Section11[0].#field[10]
  MOBILE_PHONE_1: "9820", // form1[0].Section11[0].p3-t68[2]
  MOBILE_PHONE_EXT_1: "9819", // form1[0].Section11[0].TextField11[2]
  MOBILE_PHONE_INTL_1: "9816", // form1[0].Section11[0].#field[12]
  
  // Entry 1 - Contact availability
  DONT_KNOW_CONTACT_1: "9823", // form1[0].Section11[0].#field[5]
  EMAIL_1: "9786", // Email field for contact person

  // ============================================================================
  // ENTRY 2 FIELD IDS (Section11-2[0])
  // ============================================================================

  // Entry 2 - Main address fields
  STREET_ADDRESS_2: "9741", // form1[0].Section11-2[0].TextField11[3]
  CITY_2: "9740", // form1[0].Section11-2[0].TextField11[4]
  STATE_2: "9739", // form1[0].Section11-2[0].School6_State[0]
  COUNTRY_2: "9738", // form1[0].Section11-2[0].DropDownList5[0]
  ZIP_CODE_2: "9737", // form1[0].Section11-2[0].TextField11[5]

  // Entry 2 - Date fields
  FROM_DATE_2: "9751", // form1[0].Section11-2[0].From_Datefield_Name_2[0]
  FROM_DATE_ESTIMATE_2: "9750", // form1[0].Section11-2[0].#field[15]
  TO_DATE_2: "9749", // form1[0].Section11-2[0].From_Datefield_Name_2[1]
  TO_DATE_ESTIMATE_2: "9747", // form1[0].Section11-2[0].#field[18]
  PRESENT_2: "9748", // form1[0].Section11-2[0].#field[17]

  // Entry 2 - Residence type
  RESIDENCE_TYPE_2: "17201", // form1[0].Section11-2[0].RadioButtonList[0]
  RESIDENCE_TYPE_OTHER_2: "9742", // form1[0].Section11-2[0].TextField12[0]

  // Entry 2 - Contact person
  CONTACT_LAST_NAME_2: "9726", // form1[0].Section11-2[0].TextField11[6]
  CONTACT_FIRST_NAME_2: "9725", // form1[0].Section11-2[0].TextField11[7]
  CONTACT_MIDDLE_NAME_2: "9724", // form1[0].Section11-2[0].TextField11[8]

  // Entry 2 - Contact phone numbers
  EVENING_PHONE_2: "9763", // form1[0].Section11-2[0].p3-t68[0]
  EVENING_PHONE_EXT_2: "9762", // form1[0].Section11-2[0].TextField11[0]
  EVENING_PHONE_INTL_2: "9761", // form1[0].Section11-2[0].#field[4]
  DAYTIME_PHONE_2: "9759", // form1[0].Section11-2[0].p3-t68[1]
  DAYTIME_PHONE_EXT_2: "9758", // form1[0].Section11-2[0].TextField11[1]
  DAYTIME_PHONE_INTL_2: "9755", // form1[0].Section11-2[0].#field[10]
  MOBILE_PHONE_2: "9757", // form1[0].Section11-2[0].p3-t68[2]
  MOBILE_PHONE_EXT_2: "9756", // form1[0].Section11-2[0].TextField11[2]
  MOBILE_PHONE_INTL_2: "9753", // form1[0].Section11-2[0].#field[12]

  // Entry 2 - Contact availability
  DONT_KNOW_CONTACT_2: "9760", // form1[0].Section11-2[0].#field[5]
  EMAIL_2: "9723", // form1[0].Section11-2[0].p3-t68[3]

  // ============================================================================
  // ENTRY 3 FIELD IDS (Section11-3[0])
  // ============================================================================

  // Entry 3 - Main address fields
  STREET_ADDRESS_3: "9678", // form1[0].Section11-3[0].TextField11[3]
  CITY_3: "9677", // form1[0].Section11-3[0].TextField11[4]
  STATE_3: "9676", // form1[0].Section11-3[0].School6_State[0]
  COUNTRY_3: "9675", // form1[0].Section11-3[0].DropDownList5[0]
  ZIP_CODE_3: "9674", // form1[0].Section11-3[0].TextField11[5]

  // Entry 3 - Date fields
  FROM_DATE_3: "9688", // form1[0].Section11-3[0].From_Datefield_Name_2[0]
  FROM_DATE_ESTIMATE_3: "9687", // form1[0].Section11-3[0].#field[15]
  TO_DATE_3: "9686", // form1[0].Section11-3[0].From_Datefield_Name_2[1]
  TO_DATE_ESTIMATE_3: "9684", // form1[0].Section11-3[0].#field[18]
  PRESENT_3: "9685", // form1[0].Section11-3[0].#field[17]

  // Entry 3 - Residence type
  RESIDENCE_TYPE_3: "17202", // form1[0].Section11-3[0].RadioButtonList[0]
  RESIDENCE_TYPE_OTHER_3: "9679", // form1[0].Section11-3[0].TextField12[0]

  // Entry 3 - Contact person
  CONTACT_LAST_NAME_3: "9663", // form1[0].Section11-3[0].TextField11[6]
  CONTACT_FIRST_NAME_3: "9662", // form1[0].Section11-3[0].TextField11[7]
  CONTACT_MIDDLE_NAME_3: "9661", // form1[0].Section11-3[0].TextField11[8]

  // Entry 3 - Contact phone numbers
  EVENING_PHONE_3: "9700", // form1[0].Section11-3[0].p3-t68[0]
  EVENING_PHONE_EXT_3: "9699", // form1[0].Section11-3[0].TextField11[0]
  EVENING_PHONE_INTL_3: "9698", // form1[0].Section11-3[0].#field[4]
  DAYTIME_PHONE_3: "9696", // form1[0].Section11-3[0].p3-t68[1]
  DAYTIME_PHONE_EXT_3: "9695", // form1[0].Section11-3[0].TextField11[1]
  DAYTIME_PHONE_INTL_3: "9692", // form1[0].Section11-3[0].#field[10]
  MOBILE_PHONE_3: "9694", // form1[0].Section11-3[0].p3-t68[2]
  MOBILE_PHONE_EXT_3: "9693", // form1[0].Section11-3[0].TextField11[2]
  MOBILE_PHONE_INTL_3: "9690", // form1[0].Section11-3[0].#field[12]

  // Entry 3 - Contact availability
  DONT_KNOW_CONTACT_3: "9697", // form1[0].Section11-3[0].#field[5]
  EMAIL_3: "9660", // form1[0].Section11-3[0].p3-t68[3]

  // ============================================================================
  // ENTRY 4 FIELD IDS (Section11-4[0])
  // ============================================================================

  // Entry 4 - Main address fields
  STREET_ADDRESS_4: "9615", // form1[0].Section11-4[0].TextField11[3]
  CITY_4: "9614", // form1[0].Section11-4[0].TextField11[4]
  STATE_4: "9613", // form1[0].Section11-4[0].School6_State[0]
  COUNTRY_4: "9612", // form1[0].Section11-4[0].DropDownList5[0]
  ZIP_CODE_4: "9611", // form1[0].Section11-4[0].TextField11[5]

  // Entry 4 - Date fields
  FROM_DATE_4: "9625", // form1[0].Section11-4[0].From_Datefield_Name_2[0]
  FROM_DATE_ESTIMATE_4: "9624", // form1[0].Section11-4[0].#field[15]
  TO_DATE_4: "9623", // form1[0].Section11-4[0].From_Datefield_Name_2[1]
  TO_DATE_ESTIMATE_4: "9621", // form1[0].Section11-4[0].#field[18]
  PRESENT_4: "9622", // form1[0].Section11-4[0].#field[17]

  // Entry 4 - Residence type
  RESIDENCE_TYPE_4: "17203", // form1[0].Section11-4[0].RadioButtonList[0]
  RESIDENCE_TYPE_OTHER_4: "9616", // form1[0].Section11-4[0].TextField12[0]

  // Entry 4 - Contact person
  CONTACT_LAST_NAME_4: "9600", // form1[0].Section11-4[0].TextField11[6]
  CONTACT_FIRST_NAME_4: "9599", // form1[0].Section11-4[0].TextField11[7]
  CONTACT_MIDDLE_NAME_4: "9598", // form1[0].Section11-4[0].TextField11[8]

  // Entry 4 - Contact phone numbers
  EVENING_PHONE_4: "9637", // form1[0].Section11-4[0].p3-t68[0]
  EVENING_PHONE_EXT_4: "9636", // form1[0].Section11-4[0].TextField11[0]
  EVENING_PHONE_INTL_4: "9635", // form1[0].Section11-4[0].#field[4]
  DAYTIME_PHONE_4: "9633", // form1[0].Section11-4[0].p3-t68[1]
  DAYTIME_PHONE_EXT_4: "9632", // form1[0].Section11-4[0].TextField11[1]
  DAYTIME_PHONE_INTL_4: "9629", // form1[0].Section11-4[0].#field[10]
  MOBILE_PHONE_4: "9631", // form1[0].Section11-4[0].p3-t68[2]
  MOBILE_PHONE_EXT_4: "9630", // form1[0].Section11-4[0].TextField11[2]
  MOBILE_PHONE_INTL_4: "9627", // form1[0].Section11-4[0].#field[12]

  // Entry 4 - Contact availability
  DONT_KNOW_CONTACT_4: "9634", // form1[0].Section11-4[0].#field[5]
  EMAIL_4: "9597", // form1[0].Section11-4[0].p3-t68[3]

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
      dontKnowContact: createFieldFromReference(11, SECTION11_FIELD_NAMES.DONT_KNOW_CONTACT_1, false)
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
  }
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
  
  // Sort residences by date to check for gaps
  const sortedResidences = residences
    .filter(r => r.fromDate.value && r.toDate.value)
    .sort((a, b) => new Date(a.fromDate.value).getTime() - new Date(b.fromDate.value).getTime());

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
      const currentEnd = new Date(sortedResidences[i].toDate.value);
      const nextStart = new Date(sortedResidences[i + 1].fromDate.value);
      
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