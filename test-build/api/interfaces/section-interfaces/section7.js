"use strict";
/**
 * Section 7: Your Contact Information
 *
 * TypeScript interface definitions for SF-86 Section 7 contact information data structure.
 * Based on the established Field<T> interface patterns and PDF field ID mappings from section-7.json.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateSection7Field = exports.createDefaultSection7 = exports.createDefaultPhoneNumber = exports.SECTION7_FIELD_NAMES = exports.SECTION7_FIELD_IDS = void 0;
const sections_references_loader_1 = require("../../utils/sections-references-loader");
// ============================================================================
// FIELD ID MAPPINGS
// ============================================================================
/**
 * PDF field ID mappings for Section 7 Contact Information
 * Based on the actual field IDs from section-7.json (4-digit format)
 */
exports.SECTION7_FIELD_IDS = {
    // Email fields
    HOME_EMAIL: "9513", // form1[0].Sections7-9[0].TextField11[13]
    WORK_EMAIL: "9512", // form1[0].Sections7-9[0].TextField11[14]
    // Home phone fields
    HOME_PHONE_NUMBER: "9511", // form1[0].Sections7-9[0].p3-t68[1]
    HOME_PHONE_EXTENSION: "9510", // form1[0].Sections7-9[0].TextField11[15]
    HOME_PHONE_INTERNATIONAL: "9509", // form1[0].Sections7-9[0].#field[33]
    HOME_PHONE_NIGHT: "9508", // form1[0].Sections7-9[0].#field[34]
    HOME_PHONE_DAY: "9507", // form1[0].Sections7-9[0].#field[35]
    // Work phone fields
    WORK_PHONE_NUMBER: "9506", // form1[0].Sections7-9[0].p3-t68[2]
    WORK_PHONE_EXTENSION: "9505", // form1[0].Sections7-9[0].TextField11[16]
    WORK_PHONE_INTERNATIONAL: "9504", // form1[0].Sections7-9[0].#field[38]
    WORK_PHONE_NIGHT: "9503", // form1[0].Sections7-9[0].#field[39]
    WORK_PHONE_DAY: "9562", // form1[0].Sections7-9[0].#field[40]
    // Mobile phone fields
    MOBILE_PHONE_NUMBER: "9561", // form1[0].Sections7-9[0].p3-t68[3]
    MOBILE_PHONE_EXTENSION: "9560", // form1[0].Sections7-9[0].TextField11[17]
    MOBILE_PHONE_INTERNATIONAL: "9559", // form1[0].Sections7-9[0].#field[43]
    MOBILE_PHONE_NIGHT: "9558", // form1[0].Sections7-9[0].#field[44]
    MOBILE_PHONE_DAY: "9557", // form1[0].Sections7-9[0].#field[45]
};
/**
 * Field name mappings for Section 7 Contact Information
 * Full field paths from section-7.json
 */
exports.SECTION7_FIELD_NAMES = {
    // Email fields
    HOME_EMAIL: "form1[0].Sections7-9[0].TextField11[13]",
    WORK_EMAIL: "form1[0].Sections7-9[0].TextField11[14]",
    // Home phone fields
    HOME_PHONE_NUMBER: "form1[0].Sections7-9[0].p3-t68[1]",
    HOME_PHONE_EXTENSION: "form1[0].Sections7-9[0].TextField11[15]",
    HOME_PHONE_INTERNATIONAL: "form1[0].Sections7-9[0].#field[33]",
    HOME_PHONE_NIGHT: "form1[0].Sections7-9[0].#field[34]",
    HOME_PHONE_DAY: "form1[0].Sections7-9[0].#field[35]",
    // Work phone fields
    WORK_PHONE_NUMBER: "form1[0].Sections7-9[0].p3-t68[2]",
    WORK_PHONE_EXTENSION: "form1[0].Sections7-9[0].TextField11[16]",
    WORK_PHONE_INTERNATIONAL: "form1[0].Sections7-9[0].#field[38]",
    WORK_PHONE_NIGHT: "form1[0].Sections7-9[0].#field[39]",
    WORK_PHONE_DAY: "form1[0].Sections7-9[0].#field[40]",
    // Mobile phone fields
    MOBILE_PHONE_NUMBER: "form1[0].Sections7-9[0].p3-t68[3]",
    MOBILE_PHONE_EXTENSION: "form1[0].Sections7-9[0].TextField11[17]",
    MOBILE_PHONE_INTERNATIONAL: "form1[0].Sections7-9[0].#field[43]",
    MOBILE_PHONE_NIGHT: "form1[0].Sections7-9[0].#field[44]",
    MOBILE_PHONE_DAY: "form1[0].Sections7-9[0].#field[45]",
};
// ============================================================================
// HELPER FUNCTIONS
// ============================================================================
/**
 * Creates a default phone number field structure using DRY approach
 */
const createDefaultPhoneNumber = (numberFieldName, extensionFieldName, internationalFieldName, dayTimeFieldName, nightTimeFieldName, label) => ({
    number: (0, sections_references_loader_1.createFieldFromReference)(7, numberFieldName, ''),
    extension: (0, sections_references_loader_1.createFieldFromReference)(7, extensionFieldName, ''),
    isInternational: (0, sections_references_loader_1.createFieldFromReference)(7, internationalFieldName, false),
    dayTime: (0, sections_references_loader_1.createFieldFromReference)(7, dayTimeFieldName, false),
    nightTime: (0, sections_references_loader_1.createFieldFromReference)(7, nightTimeFieldName, false)
});
exports.createDefaultPhoneNumber = createDefaultPhoneNumber;
/**
 * Creates a default Section 7 data structure using DRY approach with sections-references
 * This eliminates hardcoded values and uses the single source of truth
 */
const createDefaultSection7 = () => {
    // Validate field count against sections-references (expected: 7 fields)
    // 2 email fields + 1 phone entry × 5 fields = 7 total fields
    (0, sections_references_loader_1.validateSectionFieldCount)(7);
    return {
        _id: 7,
        section7: {
            homeEmail: (0, sections_references_loader_1.createFieldFromReference)(7, 'form1[0].Sections7-9[0].TextField11[13]', ''),
            workEmail: (0, sections_references_loader_1.createFieldFromReference)(7, 'form1[0].Sections7-9[0].TextField11[14]', ''),
            entries: [
                // Start with only 1 phone entry - users can add more via "Add Phone" button
                (0, exports.createDefaultPhoneNumber)('form1[0].Sections7-9[0].p3-t68[1]', 'form1[0].Sections7-9[0].TextField11[15]', 'form1[0].Sections7-9[0].#field[33]', 'form1[0].Sections7-9[0].#field[35]', 'form1[0].Sections7-9[0].#field[34]', 'Phone')
            ]
        }
    };
};
exports.createDefaultSection7 = createDefaultSection7;
/**
 * Updates a field in Section 7 data structure
 */
const updateSection7Field = (section7Data, update) => {
    const newData = { ...section7Data };
    // Use lodash set to update nested field paths
    const fieldPath = update.fieldPath.replace(/^section7\./, '');
    if (fieldPath.includes('.')) {
        // Handle nested phone number fields
        const [phoneType, fieldType] = fieldPath.split('.');
        // Check if phoneType is 'home', 'work', or 'mobile' to access entries correctly
        if (phoneType === 'home' || phoneType === 'work' || phoneType === 'mobile') {
            // Get the index in the entries array based on phone type
            const entryIndex = phoneType === 'home' ? 0 : phoneType === 'work' ? 1 : 2;
            // Access the correct entry in the entries array
            const phoneEntry = newData.section7.entries[entryIndex];
            if (phoneEntry && phoneEntry[fieldType]) {
                phoneEntry[fieldType].value = update.newValue;
            }
        }
    }
    else {
        // Handle direct email fields
        if (newData.section7[fieldPath]) {
            newData.section7[fieldPath].value = update.newValue;
        }
    }
    return newData;
};
exports.updateSection7Field = updateSection7Field;
