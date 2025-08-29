"use strict";
/**
 * Section 2: Date of Birth
 *
 * TypeScript interface definitions for SF-86 Section 2 (Date of Birth) data structure.
 * Based on the established Field<T> interface patterns and PDF field ID mappings from section-2.json.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatDateString = exports.updateSection2Field = exports.createDefaultSection2 = exports.DATE_VALIDATION = exports.DATE_FORMATS = exports.SECTION2_FIELD_NAMES = exports.SECTION2_FIELD_IDS = exports.DATE_VALIDATION_CONSTANTS = exports.AGE_LIMITS = void 0;
exports.validateDateOfBirth = validateDateOfBirth;
exports.calculateAge = calculateAge;
exports.formatDateForDisplay = formatDateForDisplay;
const sections_references_loader_1 = require("../../utils/sections-references-loader");
// ============================================================================
// CONSTANTS
// ============================================================================
/**
 * Age validation constants
 */
exports.AGE_LIMITS = {
    MINIMUM: 18,
    MAXIMUM: 120
};
/**
 * Date validation constants
 */
exports.DATE_VALIDATION_CONSTANTS = {
    MIN_YEAR: 1900,
    MAX_YEAR: new Date().getFullYear(),
    DEFAULT_FORMAT: 'MM/DD/YYYY'
};
// ============================================================================
// FIELD ID MAPPINGS
// ============================================================================
/**
 * PDF field ID mappings for Section 2 (Date of Birth)
 * Based on the actual field IDs from section-2.json (4-digit format)
 */
exports.SECTION2_FIELD_IDS = {
    // Date of birth fields
    DATE: "9432", // form1[0].Sections1-6[0].From_Datefield_Name_2[0]
    IS_ESTIMATED: "9431" // form1[0].Sections1-6[0].#field[18]
};
/**
 * Field name mappings for Section 2 (Date of Birth)
 * Full field paths from section-2.json
 */
exports.SECTION2_FIELD_NAMES = {
    // Date of birth fields
    DATE: "form1[0].Sections1-6[0].From_Datefield_Name_2[0]",
    IS_ESTIMATED: "form1[0].Sections1-6[0].#field[18]"
};
// ============================================================================
// HELPER TYPES
// ============================================================================
/**
 * Date format patterns
 */
exports.DATE_FORMATS = {
    MM_DD_YYYY: 'MM/DD/YYYY',
    DD_MM_YYYY: 'DD/MM/YYYY',
    YYYY_MM_DD: 'YYYY-MM-DD',
    ISO_8601: 'YYYY-MM-DDTHH:mm:ss.sssZ'
};
/**
 * Date validation patterns
 */
exports.DATE_VALIDATION = {
    MIN_YEAR: exports.DATE_VALIDATION_CONSTANTS.MIN_YEAR,
    MAX_YEAR: exports.DATE_VALIDATION_CONSTANTS.MAX_YEAR,
    DATE_REGEX: /^(0[1-9]|1[0-2])\/(0[1-9]|[12]\d|3[01])\/\d{4}$/,
    ISO_REGEX: /^\d{4}-\d{2}-\d{2}$/
};
// ============================================================================
// HELPER FUNCTIONS
// ============================================================================
/**
 * Creates a default Section 2 data structure using DRY approach with sections-references
 * This eliminates hardcoded values and uses the single source of truth
 */
const createDefaultSection2 = () => ({
    _id: 2,
    section2: {
        date: (0, sections_references_loader_1.createFieldFromReference)(2, 'form1[0].Sections1-6[0].From_Datefield_Name_2[0]', ''),
        isEstimated: (0, sections_references_loader_1.createFieldFromReference)(2, 'form1[0].Sections1-6[0].#field[18]', false)
    }
});
exports.createDefaultSection2 = createDefaultSection2;
/**
 * Updates a specific field in the Section 2 data structure
 */
const updateSection2Field = (section2Data, update) => {
    const { fieldPath, newValue } = update;
    const newData = { ...section2Data };
    // Update the specified field
    if (fieldPath === 'section2.date') {
        newData.section2.date.value = newValue;
    }
    else if (fieldPath === 'section2.isEstimated') {
        newData.section2.isEstimated.value = newValue;
    }
    return newData;
};
exports.updateSection2Field = updateSection2Field;
/**
 * Format a date string to MM/DD/YYYY format
 * @param date - The date string to format
 * @returns Formatted date string or original if parsing fails
 */
const formatDateString = (date) => {
    return formatDateForDisplay(date, exports.DATE_FORMATS.MM_DD_YYYY);
};
exports.formatDateString = formatDateString;
/**
 * Validates a date of birth entry
 * @param dateOfBirth - The date of birth data to validate
 * @param context - Validation context with rules and current date
 * @returns Validation result with errors, warnings, and parsed date
 */
function validateDateOfBirth(dateOfBirth, context) {
    const errors = [];
    const warnings = [];
    let parsedDate;
    // Check required field
    if (context.rules.requiresDateOfBirth && !dateOfBirth.date.value.trim()) {
        errors.push('Date of birth is required');
        return { isValid: false, errors, warnings };
    }
    // Validate date if provided
    if (dateOfBirth.date.value) {
        const dateValidation = validateDateFormat(dateOfBirth.date.value, context);
        errors.push(...dateValidation.errors);
        warnings.push(...dateValidation.warnings);
        parsedDate = dateValidation.parsedDate;
    }
    // Validate estimation settings
    const estimationValidation = validateEstimation(dateOfBirth.isEstimated.value, context.rules);
    errors.push(...estimationValidation.errors);
    warnings.push(...estimationValidation.warnings);
    return {
        isValid: errors.length === 0,
        errors,
        warnings,
        parsedDate
    };
}
/**
 * Validates date format and value
 * @private
 */
function validateDateFormat(dateValue, context) {
    const errors = [];
    const warnings = [];
    let parsedDate;
    // Check format
    if (!exports.DATE_VALIDATION.DATE_REGEX.test(dateValue)) {
        errors.push('Date must be in MM/DD/YYYY format');
        return { isValid: false, errors, warnings };
    }
    // Parse date
    try {
        parsedDate = new Date(dateValue);
        if (isNaN(parsedDate.getTime())) {
            errors.push('Invalid date provided');
            return { isValid: false, errors, warnings };
        }
        // Validate age
        const age = calculateAge(parsedDate, context.currentDate);
        if (age < context.rules.minimumAge) {
            errors.push(`Age must be at least ${context.rules.minimumAge} years`);
        }
        if (age > context.rules.maximumAge) {
            errors.push(`Age cannot exceed ${context.rules.maximumAge} years`);
        }
        // Check future date
        if (parsedDate > context.currentDate) {
            errors.push('Date of birth cannot be in the future');
        }
        // Validate year range
        const year = parsedDate.getFullYear();
        if (year < exports.DATE_VALIDATION.MIN_YEAR || year > exports.DATE_VALIDATION.MAX_YEAR) {
            errors.push(`Year must be between ${exports.DATE_VALIDATION.MIN_YEAR} and ${exports.DATE_VALIDATION.MAX_YEAR}`);
        }
    }
    catch (error) {
        errors.push('Unable to parse date');
    }
    return { isValid: errors.length === 0, errors, warnings, parsedDate };
}
/**
 * Validates estimation settings
 * @private
 */
function validateEstimation(isEstimated, rules) {
    const errors = [];
    const warnings = [];
    if (isEstimated && !rules.allowsEstimatedDate) {
        errors.push('Estimated dates are not allowed for date of birth');
    }
    if (isEstimated) {
        warnings.push('Date of birth is marked as estimated');
    }
    return { errors, warnings };
}
/**
 * Calculates age in years
 * @param birthDate - The birth date
 * @param currentDate - The date to calculate age at
 * @returns Age in years
 */
function calculateAge(birthDate, currentDate) {
    const age = currentDate.getFullYear() - birthDate.getFullYear();
    const monthDiff = currentDate.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && currentDate.getDate() < birthDate.getDate())) {
        return age - 1;
    }
    return age;
}
/**
 * Formats a date for display in various formats
 * @param date - The date string to format
 * @param format - The desired output format (default: MM/DD/YYYY)
 * @returns Formatted date string or original if parsing fails
 */
function formatDateForDisplay(date, format = exports.DATE_FORMATS.MM_DD_YYYY) {
    if (!date)
        return '';
    try {
        const parsedDate = new Date(date);
        if (isNaN(parsedDate.getTime()))
            return date;
        switch (format) {
            case exports.DATE_FORMATS.MM_DD_YYYY:
                return parsedDate.toLocaleDateString('en-US');
            case exports.DATE_FORMATS.DD_MM_YYYY:
                return parsedDate.toLocaleDateString('en-GB');
            case exports.DATE_FORMATS.YYYY_MM_DD:
                return parsedDate.toISOString().split('T')[0];
            default:
                return date;
        }
    }
    catch {
        return date;
    }
}
