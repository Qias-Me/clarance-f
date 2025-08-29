"use strict";
/**
 * Section 6: Your Identifying Information
 *
 * TypeScript interface definitions for SF-86 Section 6 (Your Identifying Information) data structure.
 * Based on the established Field<T> interface patterns and PDF field ID mappings from section-6.json.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatHeight = exports.calculateTotalHeightInches = exports.updateSection6Field = exports.createDefaultSection6 = exports.HEIGHT_INCHES_OPTIONS = exports.HEIGHT_FEET_OPTIONS = exports.SEX_OPTIONS = exports.EYE_COLOR_OPTIONS = exports.HAIR_COLOR_OPTIONS = exports.SECTION6_FIELD_NAMES = exports.SECTION6_FIELD_IDS = void 0;
const sections_references_loader_1 = require("../../utils/sections-references-loader");
// ============================================================================
// FIELD ID MAPPINGS
// ============================================================================
/**
 * PDF field ID mappings for Section 6 (Your Identifying Information)
 * Based on the actual field IDs from section-6.json (4-digit format)
 */
exports.SECTION6_FIELD_IDS = {
    // Physical information fields
    HEIGHT_FEET: "9434", // form1[0].Sections1-6[0].DropDownList8[0]
    HEIGHT_INCHES: "9433", // form1[0].Sections1-6[0].DropDownList7[0]
    WEIGHT: "9438", // form1[0].Sections1-6[0].TextField11[5]
    HAIR_COLOR: "9437", // form1[0].Sections1-6[0].DropDownList10[0]
    EYE_COLOR: "9436", // form1[0].Sections1-6[0].DropDownList9[0]
    SEX: "17238" // form1[0].Sections1-6[0].p3-rb3b[0]
};
/**
 * Field name mappings for Section 6 (Your Identifying Information)
 * Full field paths from section-6.json
 */
exports.SECTION6_FIELD_NAMES = {
    // Physical information fields
    HEIGHT_FEET: "form1[0].Sections1-6[0].DropDownList8[0]",
    HEIGHT_INCHES: "form1[0].Sections1-6[0].DropDownList7[0]",
    WEIGHT: "form1[0].Sections1-6[0].TextField11[5]",
    HAIR_COLOR: "form1[0].Sections1-6[0].DropDownList10[0]",
    EYE_COLOR: "form1[0].Sections1-6[0].DropDownList9[0]",
    SEX: "form1[0].Sections1-6[0].p3-rb3b[0]"
};
// ============================================================================
// DROPDOWN OPTIONS
// ============================================================================
/**
 * Hair color options for dropdown
 */
exports.HAIR_COLOR_OPTIONS = [
    "Bald",
    "Black",
    "Blonde or Strawberry",
    "Brown",
    "Gray or Partially Gray",
    "Red or Auburn",
    "Sandy",
    "White",
    "Blue",
    "Green",
    "Orange",
    "Pink",
    "Purple",
    "Unspecified or Unknown"
];
/**
 * Eye color options for dropdown
 */
exports.EYE_COLOR_OPTIONS = [
    "Black",
    "Blue",
    "Brown",
    "Gray",
    "Green",
    "Hazel",
    "Maroon",
    "Multicolored",
    "Pink",
    "Unknown"
];
/**
 * Sex options for radio buttons
 */
exports.SEX_OPTIONS = [
    "Male",
    "Female"
];
/**
 * Height feet options for dropdown
 */
exports.HEIGHT_FEET_OPTIONS = [
    "1",
    "2",
    "3",
    "4",
    "5",
    "6",
    "7",
    "8",
    "9"
];
/**
 * Height inches options for dropdown
 */
exports.HEIGHT_INCHES_OPTIONS = [
    "0",
    "1",
    "2",
    "3",
    "4",
    "5",
    "6",
    "7",
    "8",
    "9",
    "10",
    "11"
];
// ============================================================================
// HELPER FUNCTIONS
// ============================================================================
/**
 * Creates a default Section 6 data structure using DRY approach with sections-references
 * This eliminates hardcoded values and uses the single source of truth
 */
const createDefaultSection6 = () => {
    // Validate field count against sections-references
    (0, sections_references_loader_1.validateSectionFieldCount)(6);
    return {
        _id: 6,
        section6: {
            heightFeet: (0, sections_references_loader_1.createFieldFromReference)(6, 'form1[0].Sections1-6[0].DropDownList8[0]', ''),
            heightInches: (0, sections_references_loader_1.createFieldFromReference)(6, 'form1[0].Sections1-6[0].DropDownList7[0]', ''),
            weight: (0, sections_references_loader_1.createFieldFromReference)(6, 'form1[0].Sections1-6[0].TextField11[5]', ''),
            hairColor: (0, sections_references_loader_1.createFieldFromReference)(6, 'form1[0].Sections1-6[0].DropDownList10[0]', ''),
            eyeColor: (0, sections_references_loader_1.createFieldFromReference)(6, 'form1[0].Sections1-6[0].DropDownList9[0]', ''),
            sex: (0, sections_references_loader_1.createFieldFromReference)(6, 'form1[0].Sections1-6[0].p3-rb3b[0]', '')
        }
    };
};
exports.createDefaultSection6 = createDefaultSection6;
/**
 * Updates a specific field in the Section 6 data structure
 */
const updateSection6Field = (section6Data, update) => {
    const { fieldPath, newValue } = update;
    const newData = { ...section6Data };
    // Update the specified field
    if (fieldPath === 'section6.heightFeet') {
        newData.section6.heightFeet.value = newValue;
    }
    else if (fieldPath === 'section6.heightInches') {
        newData.section6.heightInches.value = newValue;
    }
    else if (fieldPath === 'section6.weight') {
        newData.section6.weight.value = newValue;
    }
    else if (fieldPath === 'section6.hairColor') {
        newData.section6.hairColor.value = newValue;
    }
    else if (fieldPath === 'section6.eyeColor') {
        newData.section6.eyeColor.value = newValue;
    }
    else if (fieldPath === 'section6.sex') {
        newData.section6.sex.value = newValue;
    }
    return newData;
};
exports.updateSection6Field = updateSection6Field;
/**
 * Calculates height in inches from feet and inches components
 */
const calculateTotalHeightInches = (feet, inches) => {
    const feetNum = parseInt(feet, 10) || 0;
    const inchesNum = parseInt(inches, 10) || 0;
    return (feetNum * 12) + inchesNum;
};
exports.calculateTotalHeightInches = calculateTotalHeightInches;
/**
 * Formats height as a string (e.g., "5'10\"")
 */
const formatHeight = (feet, inches) => {
    return `${feet}'${inches}"`;
};
exports.formatHeight = formatHeight;
