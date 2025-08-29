"use strict";
/**
 * Section 14: Selective Service
 *
 * TypeScript interface definitions for SF-86 Section 14 (Selective Service) data structure.
 * Based on the established Field<T> interface patterns and PDF field ID mappings from section-14.json.
 *
 * Section 14 covers:
 * - Selective Service registration status
 * - Registration number (if applicable)
 * - Explanation for non-registration
 * - Unknown status explanation
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEFAULT_SECTION14_VALIDATION_RULES = exports.updateSection14Field = exports.createDefaultSection14 = exports.SECTION14_VALIDATION = exports.REGISTRATION_STATUS_OPTIONS = exports.BORN_MALE_AFTER_1959_OPTIONS = exports.SECTION14_FIELD_NAMES = exports.SECTION14_FIELD_IDS = void 0;
exports.validateSelectiveService = validateSelectiveService;
exports.isSection14Complete = isSection14Complete;
exports.getActiveExplanationField = getActiveExplanationField;
const sections_references_loader_1 = require("../../utils/sections-references-loader");
// ============================================================================
// FIELD ID MAPPINGS
// ============================================================================
/**
 * PDF field ID mappings for Section 14 (Selective Service)
 * Based on the actual field IDs from section-14.json - 5 fields total
 */
exports.SECTION14_FIELD_IDS = {
    // Born male after 1959 radio button (first field)
    BORN_MALE_AFTER_1959: "17089", // form1[0].Section14_1[0].#area[0].RadioButtonList[0]
    // Registration status radio button (second field)
    REGISTRATION_STATUS: "17077", // form1[0].Section14_1[0].#area[17].RadioButtonList[10]
    // Registration number text field (third field)
    REGISTRATION_NUMBER: "11407", // form1[0].Section14_1[0].TextField11[0]
    // No registration explanation (fourth field)
    NO_REGISTRATION_EXPLANATION: "11406", // form1[0].Section14_1[0].TextField11[1]
    // Unknown status explanation (fifth field)
    UNKNOWN_STATUS_EXPLANATION: "11405", // form1[0].Section14_1[0].TextField11[2]
};
/**
 * Field name mappings for Section 14 (Selective Service)
 * Full field paths from section-14.json - 5 fields total
 */
exports.SECTION14_FIELD_NAMES = {
    // Born male after 1959 radio button (first field)
    BORN_MALE_AFTER_1959: "form1[0].Section14_1[0].#area[0].RadioButtonList[0]",
    // Registration status radio button (second field)
    REGISTRATION_STATUS: "form1[0].Section14_1[0].#area[17].RadioButtonList[10]",
    // Registration number text field (third field)
    REGISTRATION_NUMBER: "form1[0].Section14_1[0].TextField11[0]",
    // No registration explanation (fourth field)
    NO_REGISTRATION_EXPLANATION: "form1[0].Section14_1[0].TextField11[1]",
    // Unknown status explanation (fifth field)
    UNKNOWN_STATUS_EXPLANATION: "form1[0].Section14_1[0].TextField11[2]",
};
// ============================================================================
// HELPER TYPES
// ============================================================================
/**
 * Born male after 1959 options
 */
exports.BORN_MALE_AFTER_1959_OPTIONS = [
    "YES",
    "NO"
];
/**
 * Registration status options
 */
exports.REGISTRATION_STATUS_OPTIONS = [
    "Yes",
    "No",
    "I don't know"
];
/**
 * Validation patterns for Section 14
 */
exports.SECTION14_VALIDATION = {
    REGISTRATION_NUMBER_MIN_LENGTH: 1,
    REGISTRATION_NUMBER_MAX_LENGTH: 20,
    EXPLANATION_MIN_LENGTH: 1,
    EXPLANATION_MAX_LENGTH: 500,
    REGISTRATION_NUMBER_PATTERN: /^[0-9\-\s]*$/,
};
// ============================================================================
// HELPER FUNCTIONS
// ============================================================================
/**
 * Creates a default Section 14 data structure using DRY approach with sections-references
 * This eliminates hardcoded values and uses the single source of truth
 */
const createDefaultSection14 = () => {
    // Validate field count against sections-references
    (0, sections_references_loader_1.validateSectionFieldCount)(14);
    return {
        _id: 14,
        section14: {
            bornMaleAfter1959: {
                ...(0, sections_references_loader_1.createFieldFromReference)(14, 'form1[0].Section14_1[0].#area[0].RadioButtonList[0]', ''),
                options: exports.BORN_MALE_AFTER_1959_OPTIONS
            },
            registrationStatus: {
                ...(0, sections_references_loader_1.createFieldFromReference)(14, 'form1[0].Section14_1[0].#area[17].RadioButtonList[10]', ''),
                options: exports.REGISTRATION_STATUS_OPTIONS
            },
            registrationNumber: (0, sections_references_loader_1.createFieldFromReference)(14, 'form1[0].Section14_1[0].TextField11[0]', ''),
            noRegistrationExplanation: (0, sections_references_loader_1.createFieldFromReference)(14, 'form1[0].Section14_1[0].TextField11[1]', ''),
            unknownStatusExplanation: (0, sections_references_loader_1.createFieldFromReference)(14, 'form1[0].Section14_1[0].TextField11[2]', '')
        }
    };
};
exports.createDefaultSection14 = createDefaultSection14;
/**
 * Updates a specific field in the Section 14 data structure
 */
const updateSection14Field = (section14Data, update) => {
    const { fieldPath, newValue } = update;
    console.log(`🔧 updateSection14Field: fieldPath=${fieldPath}, newValue=${newValue}`);
    console.log(`🔧 updateSection14Field: input section14Data=`, section14Data);
    const newData = {
        ...section14Data,
        section14: {
            ...section14Data.section14,
            bornMaleAfter1959: { ...section14Data.section14.bornMaleAfter1959 },
            registrationStatus: { ...section14Data.section14.registrationStatus },
            registrationNumber: { ...section14Data.section14.registrationNumber },
            noRegistrationExplanation: { ...section14Data.section14.noRegistrationExplanation },
            unknownStatusExplanation: { ...section14Data.section14.unknownStatusExplanation }
        }
    };
    // Update the specified field
    if (fieldPath === 'section14.bornMaleAfter1959') {
        console.log(`🔧 updateSection14Field: Updating bornMaleAfter1959 to ${newValue}`);
        newData.section14.bornMaleAfter1959.value = newValue;
    }
    else if (fieldPath === 'section14.registrationStatus') {
        console.log(`🔧 updateSection14Field: Updating registrationStatus to ${newValue}`);
        newData.section14.registrationStatus.value = newValue;
    }
    else if (fieldPath === 'section14.registrationNumber') {
        console.log(`🔧 updateSection14Field: Updating registrationNumber to ${newValue}`);
        newData.section14.registrationNumber.value = newValue;
    }
    else if (fieldPath === 'section14.noRegistrationExplanation') {
        console.log(`🔧 updateSection14Field: Updating noRegistrationExplanation to ${newValue}`);
        newData.section14.noRegistrationExplanation.value = newValue;
    }
    else if (fieldPath === 'section14.unknownStatusExplanation') {
        console.log(`🔧 updateSection14Field: Updating unknownStatusExplanation to ${newValue}`);
        newData.section14.unknownStatusExplanation.value = newValue;
    }
    else {
        console.log(`🔧 updateSection14Field: No matching field path for ${fieldPath}`);
    }
    console.log(`🔧 updateSection14Field: output newData=`, newData);
    return newData;
};
exports.updateSection14Field = updateSection14Field;
/**
 * Validates selective service information
 */
function validateSelectiveService(selectiveServiceInfo, context) {
    const errors = [];
    const warnings = [];
    // Born male after 1959 validation
    if (!selectiveServiceInfo.bornMaleAfter1959?.value) {
        errors.push('Please indicate if you were born a male after December 31, 1959');
    }
    // Only validate registration fields if born male after 1959
    const bornMale = selectiveServiceInfo.bornMaleAfter1959?.value;
    const registrationStatus = selectiveServiceInfo.registrationStatus?.value; // Define at function scope
    if (bornMale === 'YES') {
        // Required field validation
        if (context.rules.requiresRegistrationStatus && !registrationStatus) {
            errors.push('Registration status is required');
        }
        // Conditional validation based on registration status
        if (registrationStatus === 'Yes') {
            if (context.rules.requiresRegistrationNumberIfYes && !selectiveServiceInfo.registrationNumber.value.trim()) {
                errors.push('Registration number is required when registration status is Yes');
            }
            // Validate registration number format
            if (selectiveServiceInfo.registrationNumber.value &&
                !exports.SECTION14_VALIDATION.REGISTRATION_NUMBER_PATTERN.test(selectiveServiceInfo.registrationNumber.value)) {
                errors.push('Registration number contains invalid characters (only numbers, dashes, and spaces allowed)');
            }
        }
        if (registrationStatus === 'No') {
            if (context.rules.requiresExplanationIfNo && !selectiveServiceInfo.noRegistrationExplanation.value.trim()) {
                errors.push('Explanation is required when registration status is No');
            }
        }
        if (registrationStatus === "I don't know") {
            if (context.rules.requiresExplanationIfUnknown && !selectiveServiceInfo.unknownStatusExplanation.value.trim()) {
                errors.push('Explanation is required when registration status is "I don\'t know"');
            }
        }
    }
    // Length validation
    const fields = [
        { value: selectiveServiceInfo.registrationNumber.value, name: 'Registration number', maxLength: context.rules.maxRegistrationNumberLength },
        { value: selectiveServiceInfo.noRegistrationExplanation.value, name: 'No registration explanation', maxLength: context.rules.maxExplanationLength },
        { value: selectiveServiceInfo.unknownStatusExplanation.value, name: 'Unknown status explanation', maxLength: context.rules.maxExplanationLength }
    ];
    fields.forEach(field => {
        if (field.value && field.value.length > field.maxLength) {
            errors.push(`${field.name} exceeds maximum length of ${field.maxLength} characters`);
        }
    });
    // Warnings - only if born male after 1959
    if (bornMale === 'YES' && registrationStatus === 'No' && !selectiveServiceInfo.noRegistrationExplanation.value.trim()) {
        warnings.push('Consider providing an explanation for non-registration');
    }
    return {
        isValid: errors.length === 0,
        errors,
        warnings
    };
}
/**
 * Default validation rules for Section 14
 */
exports.DEFAULT_SECTION14_VALIDATION_RULES = {
    requiresRegistrationStatus: true,
    requiresRegistrationNumberIfYes: true,
    requiresExplanationIfNo: true,
    requiresExplanationIfUnknown: true,
    requiresMilitaryServiceStatus: false, // Not part of actual Section 14 form
    maxExplanationLength: 500,
    maxRegistrationNumberLength: 20
};
/**
 * Checks if selective service information is complete
 */
function isSection14Complete(section14Data) {
    const { bornMaleAfter1959, registrationStatus, registrationNumber, noRegistrationExplanation, unknownStatusExplanation } = section14Data.section14;
    // Must answer if born male after 1959
    if (!bornMaleAfter1959.value) {
        return false;
    }
    // If not born male after 1959, section is complete
    if (bornMaleAfter1959.value === 'NO') {
        return true;
    }
    // If born male after 1959, must complete registration fields
    if (!registrationStatus.value) {
        return false;
    }
    // Conditional completeness based on registration status
    switch (registrationStatus.value) {
        case 'Yes':
            return !!registrationNumber.value.trim();
        case 'No':
            return !!noRegistrationExplanation.value.trim();
        case "I don't know":
            return !!unknownStatusExplanation.value.trim();
        default:
            return false;
    }
}
/**
 * Gets the appropriate explanation field based on registration status
 */
function getActiveExplanationField(registrationStatus) {
    switch (registrationStatus) {
        case 'Yes':
            return 'registrationNumber';
        case 'No':
            return 'noRegistrationExplanation';
        case "I don't know":
            return 'unknownStatusExplanation';
        default:
            return null;
    }
}
