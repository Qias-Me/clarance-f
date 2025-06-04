// ============================================================================
// SECTION 16_1: FOREIGN ORGANIZATION CONTACT INFORMATION
// ============================================================================

export interface ForeignOrganizationContactEntry {
  // Organization Information
  organizationName: Field<string>;
  organizationCountry: Field<string>;
  positionHeld: Field<string>;
  divisionDepartment: Field<string>;

  // Service Period
  serviceFromDate: Field<string>;
  serviceToDate: Field<string>;
  serviceFromEstimate: Field<boolean>;
  serviceToEstimate: Field<boolean>;
  isPresent: Field<boolean>;
  reasonForLeaving: Field<string>;
  circumstancesDescription: Field<string>;

  // Contact #1
  contact1FirstName: Field<string>;
  contact1MiddleName: Field<string>;
  contact1LastName: Field<string>;
  contact1Suffix: Field<string>;
  contact1Title: Field<string>;
  contact1Frequency: Field<string>;
  contact1Address: {
    street: Field<string>;
    city: Field<string>;
    state: Field<string>;
    country: Field<string>;
    zipCode: Field<string>;
  };
  contact1AssociationFromDate: Field<string>;
  contact1AssociationToDate: Field<string>;
  contact1FromEstimate: Field<boolean>;
  contact1ToEstimate: Field<boolean>;
  contact1IsPresent: Field<boolean>;

  // Contact #2
  contact2FirstName: Field<string>;
  contact2MiddleName: Field<string>;
  contact2LastName: Field<string>;
  contact2Suffix: Field<string>;
  contact2Title: Field<string>;
  contact2Frequency: Field<string>;
  contact2Address: {
    street: Field<string>;
    city: Field<string>;
    state: Field<string>;
    country: Field<string>;
    zipCode: Field<string>;
  };
  contact2AssociationFromDate: Field<string>;
  contact2AssociationToDate: Field<string>;
  contact2FromEstimate: Field<boolean>;
  contact2ToEstimate: Field<boolean>;
  contact2IsPresent: Field<boolean>;
}

// ============================================================================
// SECTION 16_3: PEOPLE WHO KNOW YOU WELL
// ============================================================================

export interface PersonWhoKnowsYouEntry {
  // Personal Information
  firstName: Field<string>;
  middleName: Field<string>;
  lastName: Field<string>;
  suffix: Field<string>;

  // Dates Known
  datesKnownFrom: Field<string>;
  datesKnownTo: Field<string>;
  datesKnownFromEstimate: Field<boolean>;
  datesKnownToEstimate: Field<boolean>;
  datesKnownIsPresent: Field<boolean>;

  // Address
  address: {
    street: Field<string>;
    city: Field<string>;
    state: Field<string>;
    country: Field<string>;
    zipCode: Field<string>;
  };

  // Contact Information
  phoneNumber: Field<string>;
  mobileNumber: Field<string>;
  phoneExtension: Field<string>;
  emailAddress: Field<string>;
  phoneDay: Field<boolean>;
  phoneNight: Field<boolean>;
  phoneInternational: Field<boolean>;
  phoneDontKnow: Field<boolean>;

  // Professional Information
  rankTitle: Field<string>;
  rankTitleNotApplicable: Field<boolean>;
  rankTitleDontKnow: Field<boolean>;

  // Relationship
  relationshipFriend: Field<boolean>;
  relationshipNeighbor: Field<boolean>;
  relationshipSchoolmate: Field<boolean>;
  relationshipWorkAssociate: Field<boolean>;
  relationshipOther: Field<boolean>;
  relationshipOtherExplanation: Field<string>;
}

// ============================================================================
// MAIN SECTION 16 INTERFACE
// ============================================================================

export interface Section16 {
  section16: {
    foreignOrganizationContacts: ForeignOrganizationContactEntry[];
    peopleWhoKnowYou: PersonWhoKnowsYouEntry[];
  };
}

// ============================================================================
// FIELD ID MAPPINGS
// ============================================================================

export const SECTION16_FIELD_IDS = {
  // Section16_1 Fields
  Section16_1_0_area_0_field_3: 'form1[0].Section16_1[0].#area[0].#field[3]',
  Section16_1_0_area_0_field_5: 'form1[0].Section16_1[0].#area[0].#field[5]',
  Section16_1_0_area_0_field_6: 'form1[0].Section16_1[0].#area[0].#field[6]',
  Section16_1_0_area_0_From_Datefield_Name_2_0: 'form1[0].Section16_1[0].#area[0].From_Datefield_Name_2[0]',
  Section16_1_0_area_0_From_Datefield_Name_2_1: 'form1[0].Section16_1[0].#area[0].From_Datefield_Name_2[1]',
  Section16_1_0_area_2_area_3_DropDownList6_0: 'form1[0].Section16_1[0].#area[2].#area[3].DropDownList6[0]',
  Section16_1_0_area_2_area_3_School6_State_0: 'form1[0].Section16_1[0].#area[2].#area[3].School6_State[0]',
  Section16_1_0_area_2_area_3_TextField11_3: 'form1[0].Section16_1[0].#area[2].#area[3].TextField11[3]',
  Section16_1_0_area_2_area_3_TextField11_4: 'form1[0].Section16_1[0].#area[2].#area[3].TextField11[4]',
  Section16_1_0_area_2_area_3_TextField11_5: 'form1[0].Section16_1[0].#area[2].#area[3].TextField11[5]',
  Section16_1_0_area_2_field_23: 'form1[0].Section16_1[0].#area[2].#field[23]',
  Section16_1_0_area_2_field_25: 'form1[0].Section16_1[0].#area[2].#field[25]',
  Section16_1_0_area_2_field_26: 'form1[0].Section16_1[0].#area[2].#field[26]',
  Section16_1_0_area_2_From_Datefield_Name_2_2: 'form1[0].Section16_1[0].#area[2].From_Datefield_Name_2[2]',
  Section16_1_0_area_2_From_Datefield_Name_2_3: 'form1[0].Section16_1[0].#area[2].From_Datefield_Name_2[3]',
  Section16_1_0_area_2_TextField11_6: 'form1[0].Section16_1[0].#area[2].TextField11[6]',
  Section16_1_0_area_2_TextField11_7: 'form1[0].Section16_1[0].#area[2].TextField11[7]',
  Section16_1_0_area_2_TextField11_8: 'form1[0].Section16_1[0].#area[2].TextField11[8]',
  Section16_1_0_area_2_suffix_0: 'form1[0].Section16_1[0].#area[2].suffix[0]',
  Section16_1_0_area_5_area_6_DropDownList7_0: 'form1[0].Section16_1[0].#area[5].#area[6].DropDownList7[0]',
  Section16_1_0_area_5_area_6_School6_State_1: 'form1[0].Section16_1[0].#area[5].#area[6].School6_State[1]',
  Section16_1_0_area_5_area_6_TextField11_11: 'form1[0].Section16_1[0].#area[5].#area[6].TextField11[11]',
  Section16_1_0_area_5_area_6_TextField11_12: 'form1[0].Section16_1[0].#area[5].#area[6].TextField11[12]',
  Section16_1_0_area_5_area_6_TextField11_13: 'form1[0].Section16_1[0].#area[5].#area[6].TextField11[13]',
  Section16_1_0_area_5_area_7_field_39: 'form1[0].Section16_1[0].#area[5].#area[7].#field[39]',
  Section16_1_0_area_5_area_7_field_41: 'form1[0].Section16_1[0].#area[5].#area[7].#field[41]',
  Section16_1_0_area_5_area_7_field_42: 'form1[0].Section16_1[0].#area[5].#area[7].#field[42]',
  Section16_1_0_area_5_area_7_From_Datefield_Name_2_4: 'form1[0].Section16_1[0].#area[5].#area[7].From_Datefield_Name_2[4]',
  Section16_1_0_area_5_area_7_From_Datefield_Name_2_5: 'form1[0].Section16_1[0].#area[5].#area[7].From_Datefield_Name_2[5]',
  Section16_1_0_area_5_TextField11_14: 'form1[0].Section16_1[0].#area[5].TextField11[14]',
  Section16_1_0_area_5_TextField11_15: 'form1[0].Section16_1[0].#area[5].TextField11[15]',
  Section16_1_0_area_5_TextField11_16: 'form1[0].Section16_1[0].#area[5].TextField11[16]',
  Section16_1_0_area_5_TextField11_17: 'form1[0].Section16_1[0].#area[5].TextField11[17]',
  Section16_1_0_area_5_TextField11_18: 'form1[0].Section16_1[0].#area[5].TextField11[18]',
  Section16_1_0_area_5_suffix_1: 'form1[0].Section16_1[0].#area[5].suffix[1]',
  Section16_1_0_DropDownList29_0: 'form1[0].Section16_1[0].DropDownList29[0]',
  Section16_1_0_RadioButtonList_0: 'form1[0].Section16_1[0].RadioButtonList[0]',
  Section16_1_0_RadioButtonList_1: 'form1[0].Section16_1[0].RadioButtonList[1]',
  Section16_1_0_TextField11_0: 'form1[0].Section16_1[0].TextField11[0]',
  Section16_1_0_TextField11_10: 'form1[0].Section16_1[0].TextField11[10]',
  Section16_1_0_TextField11_19: 'form1[0].Section16_1[0].TextField11[19]',
  Section16_1_0_TextField11_1: 'form1[0].Section16_1[0].TextField11[1]',
  Section16_1_0_TextField11_2: 'form1[0].Section16_1[0].TextField11[2]',
  Section16_1_0_TextField11_9: 'form1[0].Section16_1[0].TextField11[9]',
  Section16_1_0_TextField12_0: 'form1[0].Section16_1[0].TextField12[0]',
  Section16_1_0_TextField13_0: 'form1[0].Section16_1[0].TextField13[0]',

  // Section16_3 Fields
  Section16_3_0_area_0_field_11: 'form1[0].Section16_3[0].#area[0].#field[11]',
  Section16_3_0_area_0_field_13: 'form1[0].Section16_3[0].#area[0].#field[13]',
  Section16_3_0_area_0_field_14: 'form1[0].Section16_3[0].#area[0].#field[14]',
  Section16_3_0_area_0_From_Datefield_Name_2_0: 'form1[0].Section16_3[0].#area[0].From_Datefield_Name_2[0]',
  Section16_3_0_area_0_From_Datefield_Name_2_1: 'form1[0].Section16_3[0].#area[0].From_Datefield_Name_2[1]',
  Section16_3_0_area_1_field_47: 'form1[0].Section16_3[0].#area[1].#field[47]',
  Section16_3_0_area_1_field_49: 'form1[0].Section16_3[0].#area[1].#field[49]',
  Section16_3_0_area_1_field_50: 'form1[0].Section16_3[0].#area[1].#field[50]',
  Section16_3_0_area_1_From_Datefield_Name_2_2: 'form1[0].Section16_3[0].#area[1].From_Datefield_Name_2[2]',
  Section16_3_0_area_1_From_Datefield_Name_2_3: 'form1[0].Section16_3[0].#area[1].From_Datefield_Name_2[3]',
  Section16_3_0_area_2_field_80: 'form1[0].Section16_3[0].#area[2].#field[80]',
  Section16_3_0_area_2_field_82: 'form1[0].Section16_3[0].#area[2].#field[82]',
  Section16_3_0_area_2_field_83: 'form1[0].Section16_3[0].#area[2].#field[83]',
  Section16_3_0_area_2_From_Datefield_Name_2_4: 'form1[0].Section16_3[0].#area[2].From_Datefield_Name_2[4]',
  Section16_3_0_area_2_From_Datefield_Name_2_5: 'form1[0].Section16_3[0].#area[2].From_Datefield_Name_2[5]',
  Section16_3_0_field_100: 'form1[0].Section16_3[0].#field[100]',
  Section16_3_0_field_101: 'form1[0].Section16_3[0].#field[101]',
  Section16_3_0_field_103: 'form1[0].Section16_3[0].#field[103]',
  Section16_3_0_field_105: 'form1[0].Section16_3[0].#field[105]',
  Section16_3_0_field_107: 'form1[0].Section16_3[0].#field[107]',
  Section16_3_0_field_1: 'form1[0].Section16_3[0].#field[1]',
  Section16_3_0_field_21: 'form1[0].Section16_3[0].#field[21]',
  Section16_3_0_field_22: 'form1[0].Section16_3[0].#field[22]',
  Section16_3_0_field_23: 'form1[0].Section16_3[0].#field[23]',
  Section16_3_0_field_25: 'form1[0].Section16_3[0].#field[25]',
  Section16_3_0_field_26: 'form1[0].Section16_3[0].#field[26]',
  Section16_3_0_field_28: 'form1[0].Section16_3[0].#field[28]',
  Section16_3_0_field_29: 'form1[0].Section16_3[0].#field[29]',
  Section16_3_0_field_30: 'form1[0].Section16_3[0].#field[30]',
  Section16_3_0_field_31: 'form1[0].Section16_3[0].#field[31]',
  Section16_3_0_field_32: 'form1[0].Section16_3[0].#field[32]',
  Section16_3_0_field_33: 'form1[0].Section16_3[0].#field[33]',
  Section16_3_0_field_34: 'form1[0].Section16_3[0].#field[34]',
  Section16_3_0_field_36: 'form1[0].Section16_3[0].#field[36]',
  Section16_3_0_field_37: 'form1[0].Section16_3[0].#field[37]',
  Section16_3_0_field_44: 'form1[0].Section16_3[0].#field[44]',
  Section16_3_0_field_56: 'form1[0].Section16_3[0].#field[56]',
  Section16_3_0_field_57: 'form1[0].Section16_3[0].#field[57]',
  Section16_3_0_field_59: 'form1[0].Section16_3[0].#field[59]',
  Section16_3_0_field_60: 'form1[0].Section16_3[0].#field[60]',
  Section16_3_0_field_61: 'form1[0].Section16_3[0].#field[61]',
  Section16_3_0_field_62: 'form1[0].Section16_3[0].#field[62]',
  Section16_3_0_field_63: 'form1[0].Section16_3[0].#field[63]',
  Section16_3_0_field_64: 'form1[0].Section16_3[0].#field[64]',
  Section16_3_0_field_65: 'form1[0].Section16_3[0].#field[65]',
  Section16_3_0_field_66: 'form1[0].Section16_3[0].#field[66]',
  Section16_3_0_field_67: 'form1[0].Section16_3[0].#field[67]',
  Section16_3_0_field_69: 'form1[0].Section16_3[0].#field[69]',
  Section16_3_0_field_70: 'form1[0].Section16_3[0].#field[70]',
  Section16_3_0_field_77: 'form1[0].Section16_3[0].#field[77]',
  Section16_3_0_field_8: 'form1[0].Section16_3[0].#field[8]',
  Section16_3_0_field_90: 'form1[0].Section16_3[0].#field[90]',
  Section16_3_0_field_91: 'form1[0].Section16_3[0].#field[91]',
  Section16_3_0_field_93: 'form1[0].Section16_3[0].#field[93]',
  Section16_3_0_field_94: 'form1[0].Section16_3[0].#field[94]',
  Section16_3_0_field_95: 'form1[0].Section16_3[0].#field[95]',
  Section16_3_0_field_96: 'form1[0].Section16_3[0].#field[96]',
  Section16_3_0_field_97: 'form1[0].Section16_3[0].#field[97]',
  Section16_3_0_field_98: 'form1[0].Section16_3[0].#field[98]',
  Section16_3_0_field_99: 'form1[0].Section16_3[0].#field[99]',
  Section16_3_0_DropDownList10_0: 'form1[0].Section16_3[0].DropDownList10[0]',
  Section16_3_0_DropDownList8_0: 'form1[0].Section16_3[0].DropDownList8[0]',
  Section16_3_0_DropDownList8_1: 'form1[0].Section16_3[0].DropDownList8[1]',
  Section16_3_0_School6_State_0: 'form1[0].Section16_3[0].School6_State[0]',
  Section16_3_0_School6_State_1: 'form1[0].Section16_3[0].School6_State[1]',
  Section16_3_0_School6_State_2: 'form1[0].Section16_3[0].School6_State[2]',
  Section16_3_0_TextField11_0: 'form1[0].Section16_3[0].TextField11[0]',
  Section16_3_0_TextField11_10: 'form1[0].Section16_3[0].TextField11[10]',
  Section16_3_0_TextField11_11: 'form1[0].Section16_3[0].TextField11[11]',
  Section16_3_0_TextField11_12: 'form1[0].Section16_3[0].TextField11[12]',
  Section16_3_0_TextField11_13: 'form1[0].Section16_3[0].TextField11[13]',
  Section16_3_0_TextField11_14: 'form1[0].Section16_3[0].TextField11[14]',
  Section16_3_0_TextField11_15: 'form1[0].Section16_3[0].TextField11[15]',
  Section16_3_0_TextField11_16: 'form1[0].Section16_3[0].TextField11[16]',
  Section16_3_0_TextField11_17: 'form1[0].Section16_3[0].TextField11[17]',
  Section16_3_0_TextField11_18: 'form1[0].Section16_3[0].TextField11[18]',
  Section16_3_0_TextField11_19: 'form1[0].Section16_3[0].TextField11[19]',
  Section16_3_0_TextField11_1: 'form1[0].Section16_3[0].TextField11[1]',
  Section16_3_0_TextField11_20: 'form1[0].Section16_3[0].TextField11[20]',
  Section16_3_0_TextField11_21: 'form1[0].Section16_3[0].TextField11[21]',
  Section16_3_0_TextField11_22: 'form1[0].Section16_3[0].TextField11[22]',
  Section16_3_0_TextField11_23: 'form1[0].Section16_3[0].TextField11[23]',
  Section16_3_0_TextField11_24: 'form1[0].Section16_3[0].TextField11[24]',
  Section16_3_0_TextField11_25: 'form1[0].Section16_3[0].TextField11[25]',
  Section16_3_0_TextField11_26: 'form1[0].Section16_3[0].TextField11[26]',
  Section16_3_0_TextField11_27: 'form1[0].Section16_3[0].TextField11[27]',
  Section16_3_0_TextField11_28: 'form1[0].Section16_3[0].TextField11[28]',
  Section16_3_0_TextField11_29: 'form1[0].Section16_3[0].TextField11[29]',
  Section16_3_0_TextField11_2: 'form1[0].Section16_3[0].TextField11[2]',
  Section16_3_0_TextField11_30: 'form1[0].Section16_3[0].TextField11[30]',
  Section16_3_0_TextField11_31: 'form1[0].Section16_3[0].TextField11[31]',
  Section16_3_0_TextField11_32: 'form1[0].Section16_3[0].TextField11[32]',
  Section16_3_0_TextField11_3: 'form1[0].Section16_3[0].TextField11[3]',
  Section16_3_0_TextField11_4: 'form1[0].Section16_3[0].TextField11[4]',
  Section16_3_0_TextField11_5: 'form1[0].Section16_3[0].TextField11[5]',
  Section16_3_0_TextField11_6: 'form1[0].Section16_3[0].TextField11[6]',
  Section16_3_0_TextField11_7: 'form1[0].Section16_3[0].TextField11[7]',
  Section16_3_0_TextField11_8: 'form1[0].Section16_3[0].TextField11[8]',
  Section16_3_0_TextField11_9: 'form1[0].Section16_3[0].TextField11[9]',
  Section16_3_0_p3_t68_0: 'form1[0].Section16_3[0].p3-t68[0]',
  Section16_3_0_p3_t68_1: 'form1[0].Section16_3[0].p3-t68[1]',
  Section16_3_0_p3_t68_2: 'form1[0].Section16_3[0].p3-t68[2]',
  Section16_3_0_p3_t68_3: 'form1[0].Section16_3[0].p3-t68[3]',
  Section16_3_0_p3_t68_4: 'form1[0].Section16_3[0].p3-t68[4]',
  Section16_3_0_p3_t68_5: 'form1[0].Section16_3[0].p3-t68[5]',
  Section16_3_0_suffix_0: 'form1[0].Section16_3[0].suffix[0]',
  Section16_3_0_suffix_1: 'form1[0].Section16_3[0].suffix[1]',
  Section16_3_0_suffix_2: 'form1[0].Section16_3[0].suffix[2]',
};
