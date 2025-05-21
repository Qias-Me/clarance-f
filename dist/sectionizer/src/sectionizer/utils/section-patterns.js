/**
 * Shared section pattern definitions for the SF-86 form sectionizer
 */
/**
 * Strict patterns for critical sections - using string keys
 */
export const strictSectionPatterns = {
    "1": [
        /form1\[0\]\.Sections1-6\[0\]\.TextField11\[0\]/i, // Last name
        /form1\[0\]\.Sections1-6\[0\]\.TextField11\[1\]/i, // First name
        /form1\[0\]\.Sections1-6\[0\]\.TextField11\[2\]/i, // Middle name
        /form1\[0\]\.Sections1-6\[0\]\.suffix\[0\]/i, // Name suffix
    ],
    "2": [
        /form1\[0\]\.Sections1-6\[0\]\.From_Datefield_Name_2\[0\]/i, // Date of Birth field
        /form1\[0\]\.Sections1-6\[0\]\.#field\[18\]/i, // Estimate checkbox
    ],
    "3": [
        /form1\[0\]\.Sections1-6\[0\]\.TextField11\[3\]/i, // Birth city
        /form1\[0\]\.Sections1-6\[0\]\.TextField11\[4\]/i, // Birth county
        /form1\[0\]\.Sections1-6\[0\]\.School6_State\[0\]/i, // Birth state
        /form1\[0\]\.Sections1-6\[0\]\.DropDownList1\[0\]/i, // Birth country
    ],
    "4": [
        /form1\[0\]\.Sections1-6\[0\]\.RadioButtonList\[0\]/i, // Not applicable radio button
        /form1\[0\]\.Sections1-6\[0\]\.CheckBox1\[0\]/i, // Not applicable checkbox
        /form1\[0\]\.Sections1-6\[0\]\.SSN\[0\]/i, // Primary SSN field
        /form1\[0\]\.Sections1-6\[0\]\.SSN\[1\]/i, // Secondary SSN field
        /\.SSN\[\d+\]/i, // Any SSN field
    ],
    "5": [
        /form1\[0\]\.Sections1-6\[0\]\.section5\[0\]/i,
        /form1\[0\]\.Sections1-6\[0\]\.section5\[0\]\.#area\[0\]\.From_Datefield_Name_2\[0\]/i,
    ],
    "6": [
        /form1\[0\]\.Sections1-6\[0\]\.DropDownList7\[0\]/i, // Height in inches
        /form1\[0\]\.Sections1-6\[0\]\.DropDownList8\[0\]/i, // Height in feet
        /form1\[0\]\.Sections1-6\[0\]\.DropDownList9\[0\]/i, // Eye color
        /form1\[0\]\.Sections1-6\[0\]\.DropDownList10\[0\]/i, // Hair color
        /form1\[0\]\.Sections1-6\[0\]\.p3-rb3b\[0\]/i, // Sex Male or Female
        /form1\[0\]\.Sections1-6\[0\]\.TextField11\[5\]/i, // Weight in pounds
    ],
    "7": [
        /form1\[0\]\.Sections7-9\[0\]\.TextField11\[13\]/i, // Home email address
        /form1\[0\]\.Sections7-9\[0\]\.TextField11\[14\]/i, // Work email address
        /form1\[0\]\.Sections7-9\[0\]\.p3-t68\[1\]/i, // Home telephone number
        /form1\[0\]\.Sections7-9\[0\]\.TextField11\[15\]/i, // Extension for home phone
    ],
    "13": [
        /form1\[0\]\.section_13_1\[\d+\]\.From_Datefield_Name_2\[0\]/i, // Section 13 date fields
    ],
    "16": [
        /form1\[0\]\.Section16_1\[0\]\.#area\[0\]\.From_Datefield_Name_2\[0\]/i, // Section 16 date fields
    ]
};
/**
 * Strict patterns for critical sections - using numeric keys
 */
export const strictSectionPatternsNumeric = {
    1: strictSectionPatterns["1"],
    2: strictSectionPatterns["2"],
    3: strictSectionPatterns["3"],
    4: strictSectionPatterns["4"],
    5: strictSectionPatterns["5"],
    6: strictSectionPatterns["6"],
    7: strictSectionPatterns["7"],
    13: strictSectionPatterns["13"],
    16: strictSectionPatterns["16"],
};
/**
 * Estimated field counts per section based on PDF analysis and manual review
 * Key is the section number, value is the expected number of fields
 * the entires and subsections are not yet implemented
 * the fields are still a bit scewed.
 */
export const sectionFieldPatterns = {
    1: { fields: 4, entries: 0, subsections: 0 },
    2: { fields: 2, entries: 0, subsections: 0 },
    3: { fields: 4, entries: 0, subsections: 0 },
    4: { fields: 138, entries: 0, subsections: 0 },
    5: { fields: 45, entries: 0, subsections: 0 },
    6: { fields: 6, entries: 0, subsections: 0 },
    7: { fields: 17, entries: 0, subsections: 0 },
    8: { fields: 10, entries: 0, subsections: 0 },
    9: { fields: 78, entries: 0, subsections: 0 },
    10: { fields: 122, entries: 0, subsections: 0 },
    11: { fields: 252, entries: 0, subsections: 0 },
    12: { fields: 118, entries: 0, subsections: 0 },
    13: { fields: 1086, entries: 0, subsections: 0 },
    14: { fields: 40, entries: 0, subsections: 0 },
    15: { fields: 60, entries: 0, subsections: 0 },
    16: { fields: 154, entries: 0, subsections: 0 },
    17: { fields: 332, entries: 0, subsections: 0 },
    18: { fields: 964, entries: 0, subsections: 0 },
    19: { fields: 277, entries: 0, subsections: 0 },
    20: { fields: 570, entries: 0, subsections: 0 },
    21: { fields: 486, entries: 0, subsections: 0 },
    22: { fields: 267, entries: 0, subsections: 0 },
    23: { fields: 191, entries: 0, subsections: 0 },
    24: { fields: 160, entries: 0, subsections: 0 },
    25: { fields: 79, entries: 0, subsections: 0 },
    26: { fields: 237, entries: 0, subsections: 0 },
    27: { fields: 57, entries: 0, subsections: 0 },
    28: { fields: 23, entries: 0, subsections: 0 },
    29: { fields: 141, entries: 0, subsections: 0 },
    30: { fields: 25, entries: 0, subsections: 0 },
};
/**
 * Determine if a field belongs to a specific section based on its name
 */
export function isFieldInSection(fieldName, section) {
    const sectionStr = section.toString();
    if (strictSectionPatterns[sectionStr]) {
        return strictSectionPatterns[sectionStr].some(pattern => pattern.test(fieldName));
    }
    return false;
}
