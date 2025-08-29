"use strict";
/**
 * Section 5: Other Names Used
 *
 * TypeScript interface definitions for SF-86 Section 5 (Other Names Used) data structure.
 * Based on the established Field<T> interface patterns and PDF field ID mappings from section-5.json.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.removeOtherNameEntry = exports.addOtherNameEntry = exports.updateSection5Field = exports.createDefaultSection5 = exports.createDefaultOtherNameEntry = exports.SECTION5_FIELD_NAMES = exports.SECTION5_FIELD_IDS = void 0;
const base_1 = require("./base");
const section5_field_generator_1 = require("../../../app/state/contexts/sections2.0/section5-field-generator");
// ============================================================================
// FIELD ID MAPPINGS
// ============================================================================
/**
 * PDF field ID mappings for Section 5 (Other Names Used)
 * Based on the actual field IDs from section-5.json (4-digit format)
 * Supports all 4 entries as per PDF structure
 */
exports.SECTION5_FIELD_IDS = {
    // Has other names field
    HAS_OTHER_NAMES: "17240", // form1[0].Sections1-6[0].section5[0].RadioButtonList[0]
    // Has maiden names field
    HAS_MAIDEN_NAMES: "17241", // form1[0].Sections1-6[0].section5[0].RadioButtonList[1]
    // Entry 1 fields
    LAST_NAME_1: "9500", // form1[0].Sections1-6[0].section5[0].TextField11[2]
    FIRST_NAME_1: "9501", // form1[0].Sections1-6[0].section5[0].TextField11[1]
    MIDDLE_NAME_1: "9502", // form1[0].Sections1-6[0].section5[0].TextField11[0]
    SUFFIX_1: "9494", // form1[0].Sections1-6[0].section5[0].suffix[0]
    FROM_1: "9498", // form1[0].Sections1-6[0].section5[0].#area[0].From_Datefield_Name_2[0]
    FROM_ESTIMATE_1: "9493", // form1[0].Sections1-6[0].section5[0].#field[7] - From date estimate checkbox
    TO_1: "9497", // form1[0].Sections1-6[0].section5[0].#area[0].To_Datefield_Name_2[0]
    TO_ESTIMATE_1: "9492", // form1[0].Sections1-6[0].section5[0].#field[8] - To date estimate checkbox
    REASON_1: "9499", // form1[0].Sections1-6[0].section5[0].TextField11[3]
    PRESENT_1: "9491", // form1[0].Sections1-6[0].section5[0].#field[9] - Present checkbox
    MAIDEN_NAME_1: "17243", // form1[0].Sections1-6[0].section5[0].RadioButtonList[2] - Maiden name radio
    // Entry 2 fields
    LAST_NAME_2: "9486", // form1[0].Sections1-6[0].section5[0].TextField11[6]
    FIRST_NAME_2: "9487", // form1[0].Sections1-6[0].section5[0].TextField11[5]
    MIDDLE_NAME_2: "9488", // form1[0].Sections1-6[0].section5[0].TextField11[4]
    SUFFIX_2: "9480", // form1[0].Sections1-6[0].section5[0].suffix[1]
    FROM_2: "9484", // form1[0].Sections1-6[0].section5[0].#area[1].From_Datefield_Name_2[1]
    FROM_ESTIMATE_2: "9479", // form1[0].Sections1-6[0].section5[0].#field[17] - From date estimate checkbox
    TO_2: "9483", // form1[0].Sections1-6[0].section5[0].#area[1].To_Datefield_Name_2[1]
    TO_ESTIMATE_2: "9478", // form1[0].Sections1-6[0].section5[0].#field[18] - To date estimate checkbox
    REASON_2: "9485", // form1[0].Sections1-6[0].section5[0].TextField11[7]
    PRESENT_2: "9477", // form1[0].Sections1-6[0].section5[0].#field[19] - Present checkbox
    MAIDEN_NAME_2: "17245", // form1[0].Sections1-6[0].section5[0].RadioButtonList[3] - Maiden name radio
    // Entry 3 fields
    LAST_NAME_3: "9474", // form1[0].Sections1-6[0].section5[0].TextField11[10]
    FIRST_NAME_3: "9475", // form1[0].Sections1-6[0].section5[0].TextField11[9]
    MIDDLE_NAME_3: "9476", // form1[0].Sections1-6[0].section5[0].TextField11[8]
    SUFFIX_3: "9468", // form1[0].Sections1-6[0].section5[0].suffix[2]
    FROM_3: "9472", // form1[0].Sections1-6[0].section5[0].#area[2].From_Datefield_Name_2[2]
    FROM_ESTIMATE_3: "9467", // form1[0].Sections1-6[0].section5[0].#field[27] - From date estimate checkbox
    TO_3: "9471", // form1[0].Sections1-6[0].section5[0].#area[2].To_Datefield_Name_2[2]
    TO_ESTIMATE_3: "9466", // form1[0].Sections1-6[0].section5[0].#field[28] - To date estimate checkbox
    REASON_3: "9473", // form1[0].Sections1-6[0].section5[0].TextField11[11]
    PRESENT_3: "9465", // form1[0].Sections1-6[0].section5[0].#field[29] - Present checkbox
    MAIDEN_NAME_3: "17247", // form1[0].Sections1-6[0].section5[0].RadioButtonList[4] - Maiden name radio
    // Entry 4 fields
    LAST_NAME_4: "9462", // form1[0].Sections1-6[0].section5[0].TextField11[14]
    FIRST_NAME_4: "9463", // form1[0].Sections1-6[0].section5[0].TextField11[13]
    MIDDLE_NAME_4: "9464", // form1[0].Sections1-6[0].section5[0].TextField11[12]
    SUFFIX_4: "9456", // form1[0].Sections1-6[0].section5[0].suffix[3]
    FROM_4: "9460", // form1[0].Sections1-6[0].section5[0].#area[3].From_Datefield_Name_2[3]
    FROM_ESTIMATE_4: "9455", // form1[0].Sections1-6[0].section5[0].#field[37] - From date estimate checkbox
    TO_4: "9459", // form1[0].Sections1-6[0].section5[0].#area[3].To_Datefield_Name_2[3]
    TO_ESTIMATE_4: "9454", // form1[0].Sections1-6[0].section5[0].#field[38] - To date estimate checkbox
    REASON_4: "9461", // form1[0].Sections1-6[0].section5[0].TextField11[15]
    PRESENT_4: "9453", // form1[0].Sections1-6[0].section5[0].#field[39] - Present checkbox
    MAIDEN_NAME_4: "17249" // form1[0].Sections1-6[0].section5[0].RadioButtonList[5] - Maiden name radio (placeholder)
};
/**
 * Field name mappings for Section 5 (Other Names Used)
 * Full field paths from section-5.json
 * Supports all 4 entries as per PDF structure
 */
exports.SECTION5_FIELD_NAMES = {
    // Has other names field
    HAS_OTHER_NAMES: "form1[0].Sections1-6[0].section5[0].RadioButtonList[0]",
    // Has maiden names field
    HAS_MAIDEN_NAMES: "form1[0].Sections1-6[0].section5[0].RadioButtonList[1]",
    // Entry 1 fields
    LAST_NAME_1: "form1[0].Sections1-6[0].section5[0].TextField11[2]",
    FIRST_NAME_1: "form1[0].Sections1-6[0].section5[0].TextField11[1]",
    MIDDLE_NAME_1: "form1[0].Sections1-6[0].section5[0].TextField11[0]",
    SUFFIX_1: "form1[0].Sections1-6[0].section5[0].suffix[0]",
    FROM_1: "form1[0].Sections1-6[0].section5[0].#area[0].From_Datefield_Name_2[0]",
    FROM_ESTIMATE_1: "form1[0].Sections1-6[0].section5[0].#field[7]",
    TO_1: "form1[0].Sections1-6[0].section5[0].#area[0].To_Datefield_Name_2[0]",
    TO_ESTIMATE_1: "form1[0].Sections1-6[0].section5[0].#field[8]",
    REASON_1: "form1[0].Sections1-6[0].section5[0].TextField11[3]",
    PRESENT_1: "form1[0].Sections1-6[0].section5[0].#field[9]",
    MAIDEN_NAME_1: "form1[0].Sections1-6[0].section5[0].RadioButtonList[2]",
    // Entry 2 fields
    LAST_NAME_2: "form1[0].Sections1-6[0].section5[0].TextField11[6]",
    FIRST_NAME_2: "form1[0].Sections1-6[0].section5[0].TextField11[5]",
    MIDDLE_NAME_2: "form1[0].Sections1-6[0].section5[0].TextField11[4]",
    SUFFIX_2: "form1[0].Sections1-6[0].section5[0].suffix[1]",
    FROM_2: "form1[0].Sections1-6[0].section5[0].#area[1].From_Datefield_Name_2[1]",
    FROM_ESTIMATE_2: "form1[0].Sections1-6[0].section5[0].#field[17]",
    TO_2: "form1[0].Sections1-6[0].section5[0].#area[1].To_Datefield_Name_2[1]",
    TO_ESTIMATE_2: "form1[0].Sections1-6[0].section5[0].#field[18]",
    REASON_2: "form1[0].Sections1-6[0].section5[0].TextField11[7]",
    PRESENT_2: "form1[0].Sections1-6[0].section5[0].#field[19]",
    MAIDEN_NAME_2: "form1[0].Sections1-6[0].section5[0].RadioButtonList[3]",
    // Entry 3 fields
    LAST_NAME_3: "form1[0].Sections1-6[0].section5[0].TextField11[10]",
    FIRST_NAME_3: "form1[0].Sections1-6[0].section5[0].TextField11[9]",
    MIDDLE_NAME_3: "form1[0].Sections1-6[0].section5[0].TextField11[8]",
    SUFFIX_3: "form1[0].Sections1-6[0].section5[0].suffix[2]",
    FROM_3: "form1[0].Sections1-6[0].section5[0].#area[2].From_Datefield_Name_2[2]",
    FROM_ESTIMATE_3: "form1[0].Sections1-6[0].section5[0].#field[27]",
    TO_3: "form1[0].Sections1-6[0].section5[0].#area[2].To_Datefield_Name_2[2]",
    TO_ESTIMATE_3: "form1[0].Sections1-6[0].section5[0].#field[28]",
    REASON_3: "form1[0].Sections1-6[0].section5[0].TextField11[11]",
    PRESENT_3: "form1[0].Sections1-6[0].section5[0].#field[29]",
    MAIDEN_NAME_3: "form1[0].Sections1-6[0].section5[0].RadioButtonList[4]",
    // Entry 4 fields
    LAST_NAME_4: "form1[0].Sections1-6[0].section5[0].TextField11[14]",
    FIRST_NAME_4: "form1[0].Sections1-6[0].section5[0].TextField11[13]",
    MIDDLE_NAME_4: "form1[0].Sections1-6[0].section5[0].TextField11[12]",
    SUFFIX_4: "form1[0].Sections1-6[0].section5[0].suffix[3]",
    FROM_4: "form1[0].Sections1-6[0].section5[0].#area[3].From_Datefield_Name_2[3]",
    FROM_ESTIMATE_4: "form1[0].Sections1-6[0].section5[0].#field[37]",
    TO_4: "form1[0].Sections1-6[0].section5[0].#area[3].To_Datefield_Name_2[3]",
    TO_ESTIMATE_4: "form1[0].Sections1-6[0].section5[0].#field[38]",
    REASON_4: "form1[0].Sections1-6[0].section5[0].TextField11[15]",
    PRESENT_4: "form1[0].Sections1-6[0].section5[0].#field[39]",
    MAIDEN_NAME_4: "form1[0].Sections1-6[0].section5[0].RadioButtonList[5]"
};
// ============================================================================
// HELPER FUNCTIONS
// ============================================================================
/**
 * Creates a default Other Name Entry with the provided index
 * Now supports all 4 entries with proper PDF field mapping
 */
const createDefaultOtherNameEntry = (index) => {
    // Get the proper field IDs and names based on the entry index (0-3)
    const getFieldMapping = (index) => {
        switch (index) {
            case 0:
                return {
                    lastNameId: exports.SECTION5_FIELD_IDS.LAST_NAME_1,
                    lastNameName: exports.SECTION5_FIELD_NAMES.LAST_NAME_1,
                    firstNameId: exports.SECTION5_FIELD_IDS.FIRST_NAME_1,
                    firstNameName: exports.SECTION5_FIELD_NAMES.FIRST_NAME_1,
                    middleNameId: exports.SECTION5_FIELD_IDS.MIDDLE_NAME_1,
                    middleNameName: exports.SECTION5_FIELD_NAMES.MIDDLE_NAME_1,
                    suffixId: exports.SECTION5_FIELD_IDS.SUFFIX_1,
                    suffixName: exports.SECTION5_FIELD_NAMES.SUFFIX_1,
                    fromId: exports.SECTION5_FIELD_IDS.FROM_1,
                    fromName: exports.SECTION5_FIELD_NAMES.FROM_1,
                    fromEstimateId: exports.SECTION5_FIELD_IDS.FROM_ESTIMATE_1,
                    fromEstimateName: exports.SECTION5_FIELD_NAMES.FROM_ESTIMATE_1,
                    toId: exports.SECTION5_FIELD_IDS.TO_1,
                    toName: exports.SECTION5_FIELD_NAMES.TO_1,
                    toEstimateId: exports.SECTION5_FIELD_IDS.TO_ESTIMATE_1,
                    toEstimateName: exports.SECTION5_FIELD_NAMES.TO_ESTIMATE_1,
                    reasonId: exports.SECTION5_FIELD_IDS.REASON_1,
                    reasonName: exports.SECTION5_FIELD_NAMES.REASON_1,
                    presentId: exports.SECTION5_FIELD_IDS.PRESENT_1,
                    presentName: exports.SECTION5_FIELD_NAMES.PRESENT_1,
                    maidenNameId: exports.SECTION5_FIELD_IDS.MAIDEN_NAME_1,
                    maidenNameName: exports.SECTION5_FIELD_NAMES.MAIDEN_NAME_1
                };
            case 1:
                return {
                    lastNameId: exports.SECTION5_FIELD_IDS.LAST_NAME_2,
                    lastNameName: exports.SECTION5_FIELD_NAMES.LAST_NAME_2,
                    firstNameId: exports.SECTION5_FIELD_IDS.FIRST_NAME_2,
                    firstNameName: exports.SECTION5_FIELD_NAMES.FIRST_NAME_2,
                    middleNameId: exports.SECTION5_FIELD_IDS.MIDDLE_NAME_2,
                    middleNameName: exports.SECTION5_FIELD_NAMES.MIDDLE_NAME_2,
                    suffixId: exports.SECTION5_FIELD_IDS.SUFFIX_2,
                    suffixName: exports.SECTION5_FIELD_NAMES.SUFFIX_2,
                    fromId: exports.SECTION5_FIELD_IDS.FROM_2,
                    fromName: exports.SECTION5_FIELD_NAMES.FROM_2,
                    fromEstimateId: exports.SECTION5_FIELD_IDS.FROM_ESTIMATE_2,
                    fromEstimateName: exports.SECTION5_FIELD_NAMES.FROM_ESTIMATE_2,
                    toId: exports.SECTION5_FIELD_IDS.TO_2,
                    toName: exports.SECTION5_FIELD_NAMES.TO_2,
                    toEstimateId: exports.SECTION5_FIELD_IDS.TO_ESTIMATE_2,
                    toEstimateName: exports.SECTION5_FIELD_NAMES.TO_ESTIMATE_2,
                    reasonId: exports.SECTION5_FIELD_IDS.REASON_2,
                    reasonName: exports.SECTION5_FIELD_NAMES.REASON_2,
                    presentId: exports.SECTION5_FIELD_IDS.PRESENT_2,
                    presentName: exports.SECTION5_FIELD_NAMES.PRESENT_2,
                    maidenNameId: exports.SECTION5_FIELD_IDS.MAIDEN_NAME_2,
                    maidenNameName: exports.SECTION5_FIELD_NAMES.MAIDEN_NAME_2
                };
            case 2:
                return {
                    lastNameId: exports.SECTION5_FIELD_IDS.LAST_NAME_3,
                    lastNameName: exports.SECTION5_FIELD_NAMES.LAST_NAME_3,
                    firstNameId: exports.SECTION5_FIELD_IDS.FIRST_NAME_3,
                    firstNameName: exports.SECTION5_FIELD_NAMES.FIRST_NAME_3,
                    middleNameId: exports.SECTION5_FIELD_IDS.MIDDLE_NAME_3,
                    middleNameName: exports.SECTION5_FIELD_NAMES.MIDDLE_NAME_3,
                    suffixId: exports.SECTION5_FIELD_IDS.SUFFIX_3,
                    suffixName: exports.SECTION5_FIELD_NAMES.SUFFIX_3,
                    fromId: exports.SECTION5_FIELD_IDS.FROM_3,
                    fromName: exports.SECTION5_FIELD_NAMES.FROM_3,
                    fromEstimateId: exports.SECTION5_FIELD_IDS.FROM_ESTIMATE_3,
                    fromEstimateName: exports.SECTION5_FIELD_NAMES.FROM_ESTIMATE_3,
                    toId: exports.SECTION5_FIELD_IDS.TO_3,
                    toName: exports.SECTION5_FIELD_NAMES.TO_3,
                    toEstimateId: exports.SECTION5_FIELD_IDS.TO_ESTIMATE_3,
                    toEstimateName: exports.SECTION5_FIELD_NAMES.TO_ESTIMATE_3,
                    reasonId: exports.SECTION5_FIELD_IDS.REASON_3,
                    reasonName: exports.SECTION5_FIELD_NAMES.REASON_3,
                    presentId: exports.SECTION5_FIELD_IDS.PRESENT_3,
                    presentName: exports.SECTION5_FIELD_NAMES.PRESENT_3,
                    maidenNameId: exports.SECTION5_FIELD_IDS.MAIDEN_NAME_3,
                    maidenNameName: exports.SECTION5_FIELD_NAMES.MAIDEN_NAME_3
                };
            case 3:
                return {
                    lastNameId: exports.SECTION5_FIELD_IDS.LAST_NAME_4,
                    lastNameName: exports.SECTION5_FIELD_NAMES.LAST_NAME_4,
                    firstNameId: exports.SECTION5_FIELD_IDS.FIRST_NAME_4,
                    firstNameName: exports.SECTION5_FIELD_NAMES.FIRST_NAME_4,
                    middleNameId: exports.SECTION5_FIELD_IDS.MIDDLE_NAME_4,
                    middleNameName: exports.SECTION5_FIELD_NAMES.MIDDLE_NAME_4,
                    suffixId: exports.SECTION5_FIELD_IDS.SUFFIX_4,
                    suffixName: exports.SECTION5_FIELD_NAMES.SUFFIX_4,
                    fromId: exports.SECTION5_FIELD_IDS.FROM_4,
                    fromName: exports.SECTION5_FIELD_NAMES.FROM_4,
                    fromEstimateId: exports.SECTION5_FIELD_IDS.FROM_ESTIMATE_4,
                    fromEstimateName: exports.SECTION5_FIELD_NAMES.FROM_ESTIMATE_4,
                    toId: exports.SECTION5_FIELD_IDS.TO_4,
                    toName: exports.SECTION5_FIELD_NAMES.TO_4,
                    toEstimateId: exports.SECTION5_FIELD_IDS.TO_ESTIMATE_4,
                    toEstimateName: exports.SECTION5_FIELD_NAMES.TO_ESTIMATE_4,
                    reasonId: exports.SECTION5_FIELD_IDS.REASON_4,
                    reasonName: exports.SECTION5_FIELD_NAMES.REASON_4,
                    presentId: exports.SECTION5_FIELD_IDS.PRESENT_4,
                    presentName: exports.SECTION5_FIELD_NAMES.PRESENT_4,
                    maidenNameId: exports.SECTION5_FIELD_IDS.MAIDEN_NAME_4,
                    maidenNameName: exports.SECTION5_FIELD_NAMES.MAIDEN_NAME_4
                };
            default:
                throw new Error(`Section 5: Invalid entry index ${index}. Only indices 0-3 are supported.`);
        }
    };
    const fieldMapping = getFieldMapping(index);
    return {
        lastName: {
            id: fieldMapping.lastNameId,
            name: fieldMapping.lastNameName,
            type: 'PDFTextField',
            label: `Other Name #${index + 1} - Last Name`,
            value: '',
            rect: (0, section5_field_generator_1.generateFieldRect)(index, 'lastName')
        },
        firstName: {
            id: fieldMapping.firstNameId,
            name: fieldMapping.firstNameName,
            type: 'PDFTextField',
            label: `Other Name #${index + 1} - First Name`,
            value: '',
            rect: (0, section5_field_generator_1.generateFieldRect)(index, 'firstName')
        },
        middleName: {
            id: fieldMapping.middleNameId,
            name: fieldMapping.middleNameName,
            type: 'PDFTextField',
            label: `Other Name #${index + 1} - Middle Name`,
            value: '',
            rect: (0, section5_field_generator_1.generateFieldRect)(index, 'middleName')
        },
        suffix: {
            id: fieldMapping.suffixId,
            name: fieldMapping.suffixName,
            type: 'PDFDropdown',
            label: `Other Name #${index + 1} - Suffix`,
            value: '',
            options: base_1.SUFFIX_OPTIONS,
            rect: (0, section5_field_generator_1.generateFieldRect)(index, 'suffix')
        },
        from: {
            id: fieldMapping.fromId,
            name: fieldMapping.fromName,
            type: 'PDFTextField',
            label: `Other Name #${index + 1} - From (Month/Year)`,
            value: '',
            rect: (0, section5_field_generator_1.generateFieldRect)(index, 'from')
        },
        fromEstimate: {
            id: fieldMapping.fromEstimateId,
            name: fieldMapping.fromEstimateName,
            type: 'PDFCheckBox',
            label: `Other Name #${index + 1} - From Date Estimate`,
            value: false,
            rect: (0, section5_field_generator_1.generateFieldRect)(index, 'fromEstimate')
        },
        to: {
            id: fieldMapping.toId,
            name: fieldMapping.toName,
            type: 'PDFTextField',
            label: `Other Name #${index + 1} - To (Month/Year)`,
            value: '',
            rect: (0, section5_field_generator_1.generateFieldRect)(index, 'to')
        },
        toEstimate: {
            id: fieldMapping.toEstimateId,
            name: fieldMapping.toEstimateName,
            type: 'PDFCheckBox',
            label: `Other Name #${index + 1} - To Date Estimate`,
            value: false,
            rect: (0, section5_field_generator_1.generateFieldRect)(index, 'toEstimate')
        },
        reasonChanged: {
            id: fieldMapping.reasonId,
            name: fieldMapping.reasonName,
            type: 'PDFTextField',
            label: `Other Name #${index + 1} - Reason for Name Change`,
            value: '',
            rect: (0, section5_field_generator_1.generateFieldRect)(index, 'reasonChanged')
        },
        present: {
            id: fieldMapping.presentId,
            name: fieldMapping.presentName,
            type: 'PDFCheckBox',
            label: `Other Name #${index + 1} - Present`,
            value: false,
            rect: (0, section5_field_generator_1.generateFieldRect)(index, 'present')
        },
        isMaidenName: {
            id: fieldMapping.maidenNameId,
            name: fieldMapping.maidenNameName,
            type: 'PDFRadioGroup',
            label: `Other Name #${index + 1} - Is Maiden Name`,
            value: "NO",
            rect: (0, section5_field_generator_1.generateFieldRect)(index, 'isMaidenName')
        }
    };
};
exports.createDefaultOtherNameEntry = createDefaultOtherNameEntry;
/**
 * Creates a default Section 5 data structure with correct field IDs
 */
const createDefaultSection5 = () => ({
    _id: 5,
    section5: {
        hasOtherNames: {
            id: exports.SECTION5_FIELD_IDS.HAS_OTHER_NAMES,
            name: exports.SECTION5_FIELD_NAMES.HAS_OTHER_NAMES,
            type: 'PDFRadioGroup',
            label: 'Have you used any other names?',
            value: "NO", // Must be string "NO" or "YES", not boolean
            rect: (0, section5_field_generator_1.generateFieldRect)(-1, 'hasOtherNames') // Use -1 for main question
        },
        // Always initialize with exactly 4 fixed entries as required by PDF structure
        otherNames: [
            (0, exports.createDefaultOtherNameEntry)(0),
            (0, exports.createDefaultOtherNameEntry)(1),
            (0, exports.createDefaultOtherNameEntry)(2),
            (0, exports.createDefaultOtherNameEntry)(3)
        ]
    }
});
exports.createDefaultSection5 = createDefaultSection5;
/**
 * Updates a specific field in the Section 5 data structure
 */
const updateSection5Field = (section5Data, update) => {
    const { fieldPath, newValue, index: defaultIndex = 0 } = update;
    const newData = { ...section5Data };
    // Update the specified field
    if (fieldPath === 'section5.hasOtherNames') {
        newData.section5.hasOtherNames.value = newValue;
    }
    else if (fieldPath.startsWith('section5.otherNames')) {
        // Parse the field path to extract array index and field name
        // Examples: 
        // - 'section5.otherNames[0].lastName' -> index: 0, fieldName: 'lastName'
        // - 'section5.otherNames.lastName' -> use defaultIndex, fieldName: 'lastName'
        let entryIndex = defaultIndex;
        let fieldName = '';
        const arrayIndexMatch = fieldPath.match(/section5\.otherNames\[(\d+)\]\.(.+)/);
        if (arrayIndexMatch) {
            // Field path includes array index: section5.otherNames[0].lastName
            entryIndex = parseInt(arrayIndexMatch[1], 10);
            fieldName = arrayIndexMatch[2];
        }
        else {
            // Field path without array index: section5.otherNames.lastName (use provided index)
            fieldName = fieldPath.split('.').pop() || '';
        }
        // Only add entries if the entryIndex is exactly the next expected index
        // This prevents accidentally creating multiple entries
        if (entryIndex === newData.section5.otherNames.length) {
            newData.section5.otherNames.push((0, exports.createDefaultOtherNameEntry)(newData.section5.otherNames.length));
        }
        else if (entryIndex > newData.section5.otherNames.length) {
            // If trying to access an index beyond the next expected, don't auto-create
            console.warn(`Section5: Attempted to update field at index ${entryIndex} but only ${newData.section5.otherNames.length} entries exist. Not auto-creating entries.`);
            return newData; // Return unchanged data
        }
        // Update the specific field in the entry
        if (fieldName && fieldName in newData.section5.otherNames[entryIndex]) {
            newData.section5.otherNames[entryIndex][fieldName].value = newValue;
            // Special handling for "present" checkbox
            if (fieldName === 'present' && newValue === true) {
                newData.section5.otherNames[entryIndex].to.value = 'Present';
            }
        }
    }
    return newData;
};
exports.updateSection5Field = updateSection5Field;
/**
 * Adds a new other name entry to the section data
 * NOTE: Section 5 has exactly 4 fixed entries per PDF structure - this is now a no-op
 */
const addOtherNameEntry = (section5Data) => {
    console.warn('Section 5: Cannot add entries - PDF has exactly 4 fixed entries');
    return section5Data; // Return unchanged - PDF has fixed 4 entries
};
exports.addOtherNameEntry = addOtherNameEntry;
/**
 * Removes an other name entry from the section data
 * NOTE: Section 5 has exactly 4 fixed entries per PDF structure - this is now a no-op
 */
const removeOtherNameEntry = (section5Data, index) => {
    console.warn('Section 5: Cannot remove entries - PDF has exactly 4 fixed entries');
    return section5Data; // Return unchanged - PDF has fixed 4 entries
};
exports.removeOtherNameEntry = removeOtherNameEntry;
