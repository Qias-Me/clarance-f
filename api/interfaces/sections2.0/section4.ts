/**
 * Section 4: Social Security Number
 *
 * TypeScript interface definitions for SF-86 Section 4 (Social Security Number) data structure.
 * Based on the established Field<T> interface patterns and PDF field ID mappings from section-4.json.
 */

import set from "lodash.set";
import type { Field } from "../formDefinition2.0";

// ============================================================================
// CORE INTERFACES
// ============================================================================

/**
 * Social Security Number structure for Section 4
 */
export interface SocialSecurityNumber {
  value: Field<string>;
}

/**
 * Section 4 main data structure
 */
export interface Section4 {
  _id: number;
  section4: {
    ssn: SocialSecurityNumber[];
    notApplicable: Field<boolean>;
    Acknowledgement: Field<"YES" | "NO">;
  };
}

// ============================================================================
// SUBSECTION TYPES
// ============================================================================

/**
 * Section 4 subsection keys for type safety
 */
export type Section4SubsectionKey = "section4";

// ============================================================================
// FIELD ID MAPPINGS
// ============================================================================

/**
 * PDF field ID mappings for Section 4 (Social Security Number)
 * Based on the actual field IDs from section-4.json (4-digit format)
 * Total: 138 fields (2 main input fields + 136 auto-fill fields)
 */
export const SECTION4_FIELD_IDS = {
  // Section 4 specific fields
  NOT_APPLICABLE: "9442",    // form1[0].Sections1-6[0].CheckBox1[0] - Not Applicable checkbox
  ACKNOWLEDGEMENT: "17237",  // form1[0].Sections1-6[0].RadioButtonList[0] - Acknowledgement radio button

  // Main SSN input fields (user fills these)
  SSN_MAIN: "9441",      // form1[0].Sections1-6[0].SSN[1] - Primary SSN input
  SSN_CONTINUATION: "16287", // form1[0].continuation4[0].SSN[1] - Continuation page SSN

  // Auto-fill SSN fields (populated automatically throughout PDF)
  SSN_AUTO_1: "9452",    // form1[0].Sections1-6[0].SSN[0]
  SSN_AUTO_2: "9524",    // form1[0].Sections7-9[0].SSN[0]
  SSN_AUTO_3: "9615",    // form1[0].Section9\\.1-9\\.4[0].SSN[0]
  SSN_AUTO_4: "9627",    // form1[0].Section10\\.1-10\\.2[0].SSN[0]
  SSN_AUTO_5: "9726",    // form1[0].Section10-2[0].SSN[0]
  SSN_AUTO_6: "9827",    // form1[0].Section11[0].SSN[0]
  SSN_AUTO_7: "9896",    // form1[0].Section11-2[0].SSN[0]
  SSN_AUTO_8: "9901",    // form1[0].Section11-3[0].SSN[0]
  SSN_AUTO_9: "10030",   // form1[0].Section11-4[0].SSN[0]
  SSN_AUTO_10: "10100",  // form1[0].section_12[0].SSN[0]
  SSN_AUTO_11: "10136",  // form1[0].section_12_2[0].SSN[0]
  SSN_AUTO_12: "10209",  // form1[0].section_12_3[0].SSN[0]
  SSN_AUTO_13: "10248",  // form1[0].section_13_1-2[0].SSN[0]
  SSN_AUTO_14: "10310",  // form1[0].section13_2-2[0].SSN[0]
  SSN_AUTO_15: "10381",  // form1[0].section13_3-2[0].SSN[0]
  SSN_AUTO_16: "10474",  // form1[0].section13_4[0].SSN[0]
  SSN_AUTO_17: "10544",  // form1[0].section_13_1[0].SSN[0]
  SSN_AUTO_18: "10558",  // form1[0].section13_2[0].SSN[0]
  SSN_AUTO_19: "10711",  // form1[0].section13_3[0].SSN[0]
  SSN_AUTO_20: "10727",  // form1[0].section13_4[1].SSN[0]
  SSN_AUTO_21: "10787",  // form1[0].section_13_1[1].SSN[0]
  SSN_AUTO_22: "10865",  // form1[0].section13_2[1].SSN[0]
  SSN_AUTO_23: "10993",  // form1[0].section13_3[1].SSN[0]
  SSN_AUTO_24: "11037",  // form1[0].section13_4[2].SSN[0]
  SSN_AUTO_25: "11094",  // form1[0].section_13_1[2].SSN[0]
  SSN_AUTO_26: "11209",  // form1[0].section13_2[2].SSN[0]
  SSN_AUTO_27: "11239",  // form1[0].section13_3[2].SSN[0]
  SSN_AUTO_28: "11320",  // form1[0].section13_4[3].SSN[0]
  SSN_AUTO_29: "11358",  // form1[0].section13_5[0].SSN[0]
  SSN_AUTO_30: "11411",  // form1[0].Section14_1[0].SSN[0]
  SSN_AUTO_31: "11481",  // form1[0].Section15_2[0].SSN[0]
  SSN_AUTO_32: "11493",  // form1[0].Section15_3[0].SSN[0]
  SSN_AUTO_33: "11591",  // form1[0].Section16_1[0].SSN[0]
  SSN_AUTO_34: "11622",  // form1[0].Section16_3[0].SSN[0]
  SSN_AUTO_35: "11775",  // form1[0].Section17_1[0].SSN[0]
  SSN_AUTO_36: "11825",  // form1[0].Section17_1_2[0].SSN[0]
  SSN_AUTO_37: "11863",  // form1[0].Section17_2[0].SSN[0]
  SSN_AUTO_38: "11896",  // form1[0].Section17_2_2[0].SSN[0]
  SSN_AUTO_39: "11956",  // form1[0].Section17_3[0].SSN[0]
  SSN_AUTO_40: "12061",  // form1[0].Section17_3_2[0].SSN[0]
  SSN_AUTO_41: "12147",  // form1[0].Section18_1[0].SSN[0]
  SSN_AUTO_42: "12150",  // form1[0].Section18_2[0].SSN[0]
  SSN_AUTO_43: "12250",  // form1[0].Section18_3[0].SSN[0]
  SSN_AUTO_44: "12297",  // form1[0].Section18_1_1[0].SSN[0]
  SSN_AUTO_45: "12351",  // form1[0].Section18_2[1].SSN[0]
  SSN_AUTO_46: "12392",  // form1[0].Section18_3[1].SSN[0]
  SSN_AUTO_47: "12447",  // form1[0].Section18_1_1[1].SSN[0]
  SSN_AUTO_48: "12524",  // form1[0].Section18_2[2].SSN[0]
  SSN_AUTO_49: "12596",  // form1[0].Section18_3[2].SSN[0]
  SSN_AUTO_50: "12650",  // form1[0].Section18_1_1[2].SSN[0]
  SSN_AUTO_51: "12697",  // form1[0].Section18_2[3].SSN[0]
  SSN_AUTO_52: "12702",  // form1[0].Section18_3[3].SSN[0]
  SSN_AUTO_53: "12797",  // form1[0].Section18_1_1[3].SSN[0]
  SSN_AUTO_54: "12859",  // form1[0].Section18_2[4].SSN[0]
  SSN_AUTO_55: "12942",  // form1[0].Section18_3[4].SSN[0]
  SSN_AUTO_56: "12944",  // form1[0].Section18_1_1[4].SSN[0]
  SSN_AUTO_57: "13043",  // form1[0].Section18_2[5].SSN[0]
  SSN_AUTO_58: "13115",  // form1[0].Section18_3[5].SSN[0]
  SSN_AUTO_59: "13142",  // form1[0].Section19_1[0].SSN[0]
  SSN_AUTO_60: "13265",  // form1[0].Section19_2[0].SSN[0]
  SSN_AUTO_61: "13354",  // form1[0].Section19_3[0].SSN[0]
  SSN_AUTO_62: "13378",  // form1[0].Section19_4[0].SSN[0]
  SSN_AUTO_63: "13445",  // form1[0].Section20a[0].SSN[0]
  SSN_AUTO_64: "13521",  // form1[0].Section20a2[0].SSN[0]
  SSN_AUTO_65: "13569",  // form1[0].#subform[68].SSN[0]
  SSN_AUTO_66: "13578",  // form1[0].#subform[69].SSN[1]
  SSN_AUTO_67: "13655",  // form1[0].#subform[70].SSN[2]
  SSN_AUTO_68: "13701",  // form1[0].#subform[71].SSN[3]
  SSN_AUTO_69: "13760",  // form1[0].#subform[72].SSN[4]
  SSN_AUTO_70: "13817",  // form1[0].#subform[74].SSN[5]
  SSN_AUTO_71: "13850",  // form1[0].#subform[76].SSN[6]
  SSN_AUTO_72: "13899",  // form1[0].#subform[77].SSN[7]
  SSN_AUTO_73: "13932",  // form1[0].#subform[78].SSN[8]
  SSN_AUTO_74: "13974",  // form1[0].#subform[79].SSN[9]
  SSN_AUTO_75: "14016",  // form1[0].#subform[80].SSN[10]
  SSN_AUTO_76: "14058",  // form1[0].#subform[81].SSN[11]
  SSN_AUTO_77: "14100",  // form1[0].#subform[82].SSN[12]
  SSN_AUTO_78: "14142",  // form1[0].#subform[83].SSN[13]
  SSN_AUTO_79: "14184",  // form1[0].#subform[84].SSN[14]
  SSN_AUTO_80: "14226",  // form1[0].#subform[85].SSN[15]
  SSN_AUTO_81: "14268",  // form1[0].#subform[86].SSN[16]
  SSN_AUTO_82: "14310",  // form1[0].#subform[87].SSN[17]
  SSN_AUTO_83: "14352",  // form1[0].#subform[88].SSN[18]
  SSN_AUTO_84: "14394",  // form1[0].#subform[89].SSN[19]
  SSN_AUTO_85: "14436",  // form1[0].#subform[90].SSN[20]
  SSN_AUTO_86: "14478",  // form1[0].#subform[91].SSN[21]
  SSN_AUTO_87: "14520",  // form1[0].#subform[92].SSN[22]
  SSN_AUTO_88: "14562",  // form1[0].#subform[93].SSN[23]
  SSN_AUTO_89: "14604",  // form1[0].#subform[94].SSN[24]
  SSN_AUTO_90: "14646",  // form1[0].#subform[95].SSN[25]
  SSN_AUTO_91: "14688",  // form1[0].#subform[96].SSN[26]
  SSN_AUTO_92: "14730",  // form1[0].#subform[97].SSN[27]
  SSN_AUTO_93: "14772",  // form1[0].#subform[98].SSN[28]
  SSN_AUTO_94: "14814",  // form1[0].#subform[99].SSN[29]
  SSN_AUTO_95: "14856",  // form1[0].#subform[100].SSN[30]
  SSN_AUTO_96: "14898",  // form1[0].#subform[101].SSN[31]
  SSN_AUTO_97: "14940",  // form1[0].#subform[102].SSN[32]
  SSN_AUTO_98: "14982",  // form1[0].#subform[103].SSN[33]
  SSN_AUTO_99: "15024",  // form1[0].#subform[104].SSN[34]
  SSN_AUTO_100: "15066", // form1[0].#subform[105].SSN[35]
  SSN_AUTO_101: "15108", // form1[0].#subform[106].SSN[36]
  SSN_AUTO_102: "15150", // form1[0].#subform[107].SSN[37]
  SSN_AUTO_103: "15192", // form1[0].#subform[108].SSN[38]
  SSN_AUTO_104: "15234", // form1[0].#subform[109].SSN[39]
  SSN_AUTO_105: "15276", // form1[0].#subform[110].SSN[40]
  SSN_AUTO_106: "15318", // form1[0].#subform[111].SSN[41]
  SSN_AUTO_107: "15360", // form1[0].#subform[112].SSN[42]
  SSN_AUTO_108: "15402", // form1[0].#subform[113].SSN[43]
  SSN_AUTO_109: "15444", // form1[0].#subform[114].SSN[44]
  SSN_AUTO_110: "15486", // form1[0].#subform[115].SSN[45]
  SSN_AUTO_111: "15528", // form1[0].#subform[116].SSN[46]
  SSN_AUTO_112: "15570", // form1[0].#subform[117].SSN[47]
  SSN_AUTO_113: "15612", // form1[0].#subform[118].SSN[48]
  SSN_AUTO_114: "15654", // form1[0].#subform[119].SSN[49]
  SSN_AUTO_115: "15696", // form1[0].#subform[120].SSN[50]
  SSN_AUTO_116: "15738", // form1[0].#subform[121].SSN[51]
  SSN_AUTO_117: "15780", // form1[0].#subform[122].SSN[52]
  SSN_AUTO_118: "15822", // form1[0].#subform[123].SSN[53]
  SSN_AUTO_119: "15864", // form1[0].#subform[124].SSN[54]
  SSN_AUTO_120: "15906", // form1[0].#subform[125].SSN[55]
  SSN_AUTO_121: "15948", // form1[0].#subform[126].SSN[56]
  SSN_AUTO_122: "15990", // form1[0].#subform[127].SSN[57]
  SSN_AUTO_123: "16032", // form1[0].#subform[128].SSN[58]
  SSN_AUTO_124: "16074", // form1[0].#subform[129].SSN[59]
  SSN_AUTO_125: "16116", // form1[0].#subform[130].SSN[60]
  SSN_AUTO_126: "16158", // form1[0].#subform[131].SSN[61]
  SSN_AUTO_127: "16200", // form1[0].#subform[132].SSN[62]
  SSN_AUTO_128: "16242", // form1[0].#subform[133].SSN[63]
  SSN_AUTO_129: "16284", // form1[0].#subform[134].SSN[64]
  SSN_AUTO_130: "16326", // form1[0].#subform[135].SSN[65]
  SSN_AUTO_131: "16368", // form1[0].#subform[136].SSN[66]
  SSN_AUTO_132: "16410", // form1[0].#subform[137].SSN[67]
  SSN_AUTO_133: "16452", // form1[0].#subform[138].SSN[68]
  SSN_AUTO_134: "16494", // form1[0].#subform[139].SSN[69]
  SSN_AUTO_135: "16536", // form1[0].#subform[140].SSN[70]
  SSN_AUTO_136: "16286", // form1[0].continuation4[0].SSN[0]
} as const;

/**
 * Field name mappings for Section 4 (Social Security Number)
 * Full field paths from section-4.json corresponding to the field IDs above
 */
export const SECTION4_FIELD_NAMES = {
  // Section 4 specific fields
  NOT_APPLICABLE: "form1[0].Sections1-6[0].CheckBox1[0]",
  ACKNOWLEDGEMENT: "form1[0].Sections1-6[0].RadioButtonList[0]",

  // Main SSN input fields (user fills these)
  SSN_MAIN: "form1[0].Sections1-6[0].SSN[1]",
  SSN_CONTINUATION: "form1[0].continuation4[0].SSN[1]",

  // Auto-fill SSN fields (populated automatically throughout PDF)
  SSN_AUTO_1: "form1[0].Sections1-6[0].SSN[0]",
  SSN_AUTO_2: "form1[0].Sections7-9[0].SSN[0]",
  SSN_AUTO_3: "form1[0].Section9\\.1-9\\.4[0].SSN[0]",
  SSN_AUTO_4: "form1[0].Section10\\.1-10\\.2[0].SSN[0]",
  SSN_AUTO_5: "form1[0].Section10-2[0].SSN[0]",
  SSN_AUTO_6: "form1[0].Section11[0].SSN[0]",
  SSN_AUTO_7: "form1[0].Section11-2[0].SSN[0]",
  SSN_AUTO_8: "form1[0].Section11-3[0].SSN[0]",
  SSN_AUTO_9: "form1[0].Section11-4[0].SSN[0]",
  SSN_AUTO_10: "form1[0].section_12[0].SSN[0]",
  SSN_AUTO_11: "form1[0].section_12_2[0].SSN[0]",
  SSN_AUTO_12: "form1[0].section_12_3[0].SSN[0]",
  SSN_AUTO_13: "form1[0].section_13_1-2[0].SSN[0]",
  SSN_AUTO_14: "form1[0].section13_2-2[0].SSN[0]",
  SSN_AUTO_15: "form1[0].section13_3-2[0].SSN[0]",
  SSN_AUTO_16: "form1[0].section13_4[0].SSN[0]",
  SSN_AUTO_17: "form1[0].section_13_1[0].SSN[0]",
  SSN_AUTO_18: "form1[0].section13_2[0].SSN[0]",
  SSN_AUTO_19: "form1[0].section13_3[0].SSN[0]",
  SSN_AUTO_20: "form1[0].section13_4[1].SSN[0]",
  SSN_AUTO_21: "form1[0].section_13_1[1].SSN[0]",
  SSN_AUTO_22: "form1[0].section13_2[1].SSN[0]",
  SSN_AUTO_23: "form1[0].section13_3[1].SSN[0]",
  SSN_AUTO_24: "form1[0].section13_4[2].SSN[0]",
  SSN_AUTO_25: "form1[0].section_13_1[2].SSN[0]",
  SSN_AUTO_26: "form1[0].section13_2[2].SSN[0]",
  SSN_AUTO_27: "form1[0].section13_3[2].SSN[0]",
  SSN_AUTO_28: "form1[0].section13_4[3].SSN[0]",
  SSN_AUTO_29: "form1[0].section13_5[0].SSN[0]",
  SSN_AUTO_30: "form1[0].Section14_1[0].SSN[0]",
  SSN_AUTO_31: "form1[0].Section15_2[0].SSN[0]",
  SSN_AUTO_32: "form1[0].Section15_3[0].SSN[0]",
  SSN_AUTO_33: "form1[0].Section16_1[0].SSN[0]",
  SSN_AUTO_34: "form1[0].Section16_3[0].SSN[0]",
  SSN_AUTO_35: "form1[0].Section17_1[0].SSN[0]",
  SSN_AUTO_36: "form1[0].Section17_1_2[0].SSN[0]",
  SSN_AUTO_37: "form1[0].Section17_2[0].SSN[0]",
  SSN_AUTO_38: "form1[0].Section17_2_2[0].SSN[0]",
  SSN_AUTO_39: "form1[0].Section17_3[0].SSN[0]",
  SSN_AUTO_40: "form1[0].Section17_3_2[0].SSN[0]",
  SSN_AUTO_41: "form1[0].Section18_1[0].SSN[0]",
  SSN_AUTO_42: "form1[0].Section18_2[0].SSN[0]",
  SSN_AUTO_43: "form1[0].Section18_3[0].SSN[0]",
  SSN_AUTO_44: "form1[0].Section18_1_1[0].SSN[0]",
  SSN_AUTO_45: "form1[0].Section18_2[1].SSN[0]",
  SSN_AUTO_46: "form1[0].Section18_3[1].SSN[0]",
  SSN_AUTO_47: "form1[0].Section18_1_1[1].SSN[0]",
  SSN_AUTO_48: "form1[0].Section18_2[2].SSN[0]",
  SSN_AUTO_49: "form1[0].Section18_3[2].SSN[0]",
  SSN_AUTO_50: "form1[0].Section18_1_1[2].SSN[0]",
  SSN_AUTO_51: "form1[0].Section18_2[3].SSN[0]",
  SSN_AUTO_52: "form1[0].Section18_3[3].SSN[0]",
  SSN_AUTO_53: "form1[0].Section18_1_1[3].SSN[0]",
  SSN_AUTO_54: "form1[0].Section18_2[4].SSN[0]",
  SSN_AUTO_55: "form1[0].Section18_3[4].SSN[0]",
  SSN_AUTO_56: "form1[0].Section18_1_1[4].SSN[0]",
  SSN_AUTO_57: "form1[0].Section18_2[5].SSN[0]",
  SSN_AUTO_58: "form1[0].Section18_3[5].SSN[0]",
  SSN_AUTO_59: "form1[0].Section19_1[0].SSN[0]",
  SSN_AUTO_60: "form1[0].Section19_2[0].SSN[0]",
  SSN_AUTO_61: "form1[0].Section19_3[0].SSN[0]",
  SSN_AUTO_62: "form1[0].Section19_4[0].SSN[0]",
  SSN_AUTO_63: "form1[0].Section20a[0].SSN[0]",
  SSN_AUTO_64: "form1[0].Section20a2[0].SSN[0]",
  SSN_AUTO_65: "form1[0].#subform[68].SSN[0]",
  SSN_AUTO_66: "form1[0].#subform[69].SSN[1]",
  SSN_AUTO_67: "form1[0].#subform[70].SSN[2]",
  SSN_AUTO_68: "form1[0].#subform[71].SSN[3]",
  SSN_AUTO_69: "form1[0].#subform[72].SSN[4]",
  SSN_AUTO_70: "form1[0].#subform[74].SSN[5]",
  SSN_AUTO_71: "form1[0].#subform[76].SSN[6]",
  SSN_AUTO_72: "form1[0].#subform[77].SSN[7]",
  SSN_AUTO_73: "form1[0].#subform[78].SSN[8]",
  SSN_AUTO_74: "form1[0].#subform[79].SSN[9]",
  SSN_AUTO_75: "form1[0].#subform[80].SSN[10]",
  SSN_AUTO_76: "form1[0].#subform[81].SSN[11]",
  SSN_AUTO_77: "form1[0].#subform[82].SSN[12]",
  SSN_AUTO_78: "form1[0].#subform[83].SSN[13]",
  SSN_AUTO_79: "form1[0].#subform[84].SSN[14]",
  SSN_AUTO_80: "form1[0].#subform[85].SSN[15]",
  SSN_AUTO_81: "form1[0].#subform[86].SSN[16]",
  SSN_AUTO_82: "form1[0].#subform[87].SSN[17]",
  SSN_AUTO_83: "form1[0].#subform[88].SSN[18]",
  SSN_AUTO_84: "form1[0].#subform[89].SSN[19]",
  SSN_AUTO_85: "form1[0].#subform[90].SSN[20]",
  SSN_AUTO_86: "form1[0].#subform[91].SSN[21]",
  SSN_AUTO_87: "form1[0].#subform[92].SSN[22]",
  SSN_AUTO_88: "form1[0].#subform[93].SSN[23]",
  SSN_AUTO_89: "form1[0].#subform[94].SSN[24]",
  SSN_AUTO_90: "form1[0].#subform[95].SSN[25]",
  SSN_AUTO_91: "form1[0].#subform[96].SSN[26]",
  SSN_AUTO_92: "form1[0].#subform[97].SSN[27]",
  SSN_AUTO_93: "form1[0].#subform[98].SSN[28]",
  SSN_AUTO_94: "form1[0].#subform[99].SSN[29]",
  SSN_AUTO_95: "form1[0].#subform[100].SSN[30]",
  SSN_AUTO_96: "form1[0].#subform[101].SSN[31]",
  SSN_AUTO_97: "form1[0].#subform[102].SSN[32]",
  SSN_AUTO_98: "form1[0].#subform[103].SSN[33]",
  SSN_AUTO_99: "form1[0].#subform[104].SSN[34]",
  SSN_AUTO_100: "form1[0].#subform[105].SSN[35]",
  SSN_AUTO_101: "form1[0].#subform[106].SSN[36]",
  SSN_AUTO_102: "form1[0].#subform[107].SSN[37]",
  SSN_AUTO_103: "form1[0].#subform[108].SSN[38]",
  SSN_AUTO_104: "form1[0].#subform[109].SSN[39]",
  SSN_AUTO_105: "form1[0].#subform[110].SSN[40]",
  SSN_AUTO_106: "form1[0].#subform[111].SSN[41]",
  SSN_AUTO_107: "form1[0].#subform[112].SSN[42]",
  SSN_AUTO_108: "form1[0].#subform[113].SSN[43]",
  SSN_AUTO_109: "form1[0].#subform[114].SSN[44]",
  SSN_AUTO_110: "form1[0].#subform[115].SSN[45]",
  SSN_AUTO_111: "form1[0].#subform[116].SSN[46]",
  SSN_AUTO_112: "form1[0].#subform[117].SSN[47]",
  SSN_AUTO_113: "form1[0].#subform[118].SSN[48]",
  SSN_AUTO_114: "form1[0].#subform[119].SSN[49]",
  SSN_AUTO_115: "form1[0].#subform[120].SSN[50]",
  SSN_AUTO_116: "form1[0].#subform[121].SSN[51]",
  SSN_AUTO_117: "form1[0].#subform[122].SSN[52]",
  SSN_AUTO_118: "form1[0].#subform[123].SSN[53]",
  SSN_AUTO_119: "form1[0].#subform[124].SSN[54]",
  SSN_AUTO_120: "form1[0].#subform[125].SSN[55]",
  SSN_AUTO_121: "form1[0].#subform[126].SSN[56]",
  SSN_AUTO_122: "form1[0].#subform[127].SSN[57]",
  SSN_AUTO_123: "form1[0].#subform[128].SSN[58]",
  SSN_AUTO_124: "form1[0].#subform[129].SSN[59]",
  SSN_AUTO_125: "form1[0].#subform[130].SSN[60]",
  SSN_AUTO_126: "form1[0].#subform[131].SSN[61]",
  SSN_AUTO_127: "form1[0].#subform[132].SSN[62]",
  SSN_AUTO_128: "form1[0].#subform[133].SSN[63]",
  SSN_AUTO_129: "form1[0].#subform[134].SSN[64]",
  SSN_AUTO_130: "form1[0].#subform[135].SSN[65]",
  SSN_AUTO_131: "form1[0].#subform[136].SSN[66]",
  SSN_AUTO_132: "form1[0].#subform[137].SSN[67]",
  SSN_AUTO_133: "form1[0].#subform[138].SSN[68]",
  SSN_AUTO_134: "form1[0].#subform[139].SSN[69]",
  SSN_AUTO_135: "form1[0].#subform[140].SSN[70]",
  SSN_AUTO_136: "form1[0].continuation4[0].SSN[0]",
} as const;

// ============================================================================
// VALIDATION INTERFACES
// ============================================================================

/**
 * SSN validation rules
 */
export interface Section4ValidationRules {
  requiresSSN: boolean;
  allowsPartialSSN: boolean;
}

/**
 * SSN validation context
 */
export interface Section4ValidationContext {
  rules: Section4ValidationRules;
}

/**
 * SSN validation result
 */
export interface SSNValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

/**
 * Type for SSN field updates
 */
export type Section4FieldUpdate = {
  fieldPath: string;
  newValue: any;
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Creates a default Section 4 data structure with correct field IDs
 */
export const createDefaultSection4 = (): Section4 => ({
  _id: 4,
  section4: {
    notApplicable: {
      id: SECTION4_FIELD_IDS.NOT_APPLICABLE,
      name: SECTION4_FIELD_NAMES.NOT_APPLICABLE,
      type: "PDFCheckbox",
      label: "Not Applicable",
      value: false,
      rect: { x: 0, y: 0, width: 0, height: 0 },
    },
    Acknowledgement: {
      id: SECTION4_FIELD_IDS.ACKNOWLEDGEMENT,
      name: SECTION4_FIELD_NAMES.ACKNOWLEDGEMENT,
      type: "PDFRadioGroup",
      label: "Acknowledgement",
      value: "YES",
      rect: { x: 0, y: 0, width: 0, height: 0 },
    },
    ssn: [
      {
        value: {
          id: SECTION4_FIELD_IDS.SSN_MAIN,
          name: SECTION4_FIELD_NAMES.SSN_MAIN,
          type: "PDFTextField",
          label: "Social Security Number",
          value: "123456789",
          rect: { x: 0, y: 0, width: 0, height: 0 },
        },
      },
    ],
  },
});

/**
 * Updates a specific field in the Section 4 data structure
 */
export const updateSection4Field = (
  section4Data: Section4,
  update: Section4FieldUpdate
): Section4 => {
  const { fieldPath, newValue } = update;
  const newData = { ...section4Data };

  set(newData, fieldPath, newValue);

  return newData;
};

/**
 * Format an SSN with appropriate hyphens (XXX-XX-XXXX)
 */
export const formatSSN = (ssn: string): string => {
  if (!ssn) return "";

  // Remove any existing non-numeric characters
  const digits = ssn.replace(/\D/g, "");

  if (digits.length === 9) {
    return `${digits.substring(0, 3)}-${digits.substring(
      3,
      5
    )}-${digits.substring(5, 9)}`;
  }

  // Return the original if it doesn't have 9 digits
  return ssn;
};

/**
 * Validates an SSN entry
 */
export const validateSSN = (
  ssn: string,
  context: Section4ValidationContext
): SSNValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Remove any non-numeric characters for validation
  const digits = ssn.replace(/\D/g, "");

  // Check if SSN is required
  if (context.rules.requiresSSN && !ssn) {
    errors.push("Social Security Number is required");
  }

  // Check SSN format and validity
  if (ssn && digits.length !== 9) {
    errors.push("Social Security Number must be 9 digits");
  }

  // Check for invalid SSN patterns
  if (
    digits === "000000000" ||
    digits === "111111111" ||
    digits === "222222222" ||
    digits === "333333333" ||
    digits === "444444444" ||
    digits === "555555555" ||
    digits === "666666666" ||
    digits === "777777777" ||
    digits === "888888888" ||
    digits === "999999999"
  ) {
    errors.push("Invalid Social Security Number - cannot use all same digits");
  }

  if (
    digits.startsWith("000") ||
    digits.startsWith("666") ||
    digits.startsWith("9")
  ) {
    errors.push("Invalid Social Security Number - invalid area number");
  }

  if (digits.substring(3, 5) === "00") {
    errors.push("Invalid Social Security Number - invalid group number");
  }

  if (digits.substring(5) === "0000") {
    errors.push("Invalid Social Security Number - invalid serial number");
  }

  // Return validation result
  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
};

/**
 * Gets all SSN field IDs for auto-population
 */
export const getAllSSNFieldIds = (): string[] => {
  return [
    SECTION4_FIELD_IDS.SSN_CONTINUATION,
    ...Array.from({ length: 136 }, (_, i) => {
      const fieldKey = `SSN_AUTO_${i + 1}` as keyof typeof SECTION4_FIELD_IDS;
      return SECTION4_FIELD_IDS[fieldKey];
    }),
  ];
};

/**
 * Gets all SSN field names for auto-population
 */
export const getAllSSNFieldNames = (): string[] => {
  return [
    SECTION4_FIELD_NAMES.SSN_CONTINUATION,
    ...Array.from({ length: 136 }, (_, i) => {
      const fieldKey = `SSN_AUTO_${i + 1}` as keyof typeof SECTION4_FIELD_NAMES;
      return SECTION4_FIELD_NAMES[fieldKey];
    }),
  ];
};

/**
 * Propagates the main SSN value to all other SSN fields in the section
 * This ensures consistency across the entire PDF form
 */
export const propagateSSNToAllFields = (
  section4Data: Section4,
  mainSSNValue: string
): Section4 => {
  let updatedData = { ...section4Data };

  // First, update the main SSN field
  if (updatedData.section4.ssn[0]) {
    updatedData.section4.ssn[0].value.value = mainSSNValue;
  }

  // Get all auto-fill field IDs and names
  const allFieldIds = getAllSSNFieldIds();
  const allFieldNames = getAllSSNFieldNames();

  // Create field updates for all auto-fill SSN fields
  const fieldUpdates: Section4FieldUpdate[] = allFieldIds.map((fieldId, index) => ({
    fieldPath: `section4.ssn[${index + 1}].value.value`, // +1 because index 0 is the main field
    newValue: mainSSNValue,
  }));

  // Also create the field structure if it doesn't exist
  if (!updatedData.section4.ssn[1]) {
    // Initialize all auto-fill SSN fields if they don't exist
    for (let i = 0; i < allFieldIds.length; i++) {
      const fieldIndex = i + 1; // +1 because index 0 is the main field
      if (!updatedData.section4.ssn[fieldIndex]) {
        updatedData.section4.ssn[fieldIndex] = {
          value: {
            id: allFieldIds[i],
            name: allFieldNames[i],
            type: "PDFTextField",
            label: `Auto-fill SSN ${i + 1}`,
            value: mainSSNValue,
            rect: { x: 0, y: 0, width: 0, height: 0 },
          },
        };
      } else {
        // Update existing field
        updatedData.section4.ssn[fieldIndex].value.value = mainSSNValue;
      }
    }
  } else {
    // Apply all field updates to existing structure
    fieldUpdates.forEach((update) => {
      updatedData = updateSection4Field(updatedData, update);
    });
  }

  return updatedData;
};

/**
 * Updates the main SSN field and automatically propagates to all other SSN fields
 * This is the primary function to use when updating SSN data
 */
export const updateMainSSNAndPropagate = (
  section4Data: Section4,
  newSSNValue: string,
  shouldFormat: boolean = true
): Section4 => {
  // Format the SSN if requested
  const formattedSSN = shouldFormat ? formatSSN(newSSNValue) : newSSNValue;
  
  // Propagate to all fields
  return propagateSSNToAllFields(section4Data, formattedSSN);
};

/**
 * Validates and updates the main SSN field with auto-propagation
 */
export const validateAndUpdateSSN = (
  section4Data: Section4,
  newSSNValue: string,
  context: Section4ValidationContext,
  shouldFormat: boolean = true
): { updatedData: Section4; validationResult: SSNValidationResult } => {
  // Validate the SSN
  const validationResult = validateSSN(newSSNValue, context);
  
  // Update and propagate if valid, or just update if validation allows it
  const updatedData = updateMainSSNAndPropagate(section4Data, newSSNValue, shouldFormat);
  
  return {
    updatedData,
    validationResult,
  };
};
