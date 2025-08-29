"use strict";
/**
 * Section 8: U.S. Passport Information
 *
 * TypeScript interface definitions for SF-86 Section 8 passport information data structure.
 * Based on the established Field<T> interface patterns and PDF field ID mappings.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.PASSPORT_SUFFIXES = exports.PASSPORT_VALIDATION = exports.SECTION8_FIELD_NAMES = exports.SECTION8_FIELD_IDS = void 0;
exports.createDefaultSection8 = createDefaultSection8;
exports.validatePassportInfo = validatePassportInfo;
exports.updateSection8Field = updateSection8Field;
exports.isPassportRequired = isPassportRequired;
exports.flattenSection8Fields = flattenSection8Fields;
const sections_references_loader_1 = require("../../utils/sections-references-loader");
// ============================================================================
// STANDARDIZED FIELD ID MAPPINGS (4-digit numeric format)
// ============================================================================
/**
 * Section 8 PDF field IDs in standardized 4-digit numeric format
 * Based on field ID mappings from api/sections-references/section-8.json
 * Uses numeric IDs (extracted from 'id' field) for consistency with other sections
 */
exports.SECTION8_FIELD_IDS = {
    // Main passport question (ID: "17231 0 R" -> "17231")
    HAS_PASSPORT: "17231",
    // Passport details (ID: "9553 0 R" -> "9553")
    PASSPORT_NUMBER: "9553",
    // Passport name fields
    LAST_NAME: "9547", // ID: "9547 0 R" 
    FIRST_NAME: "9546", // ID: "9546 0 R"
    MIDDLE_NAME: "9548", // ID: "9548 0 R"
    SUFFIX: "9545", // ID: "9545 0 R"
    // Date fields  
    ISSUE_DATE: "9551", // ID: "9551 0 R"
    ISSUE_DATE_ESTIMATED: "9549", // ID: "9549 0 R"
    EXPIRATION_DATE: "9550", // ID: "9550 0 R"
    EXPIRATION_DATE_ESTIMATED: "9523" // ID: "9523 0 R"
};
/**
 * Section 8 PDF field names for createFieldFromReference compatibility
 * Maps to the 'name' field in section-8.json for proper field resolution
 */
exports.SECTION8_FIELD_NAMES = {
    // Main passport question
    HAS_PASSPORT: "form1[0].Sections7-9[0].RadioButtonList[0]",
    // Passport details
    PASSPORT_NUMBER: "form1[0].Sections7-9[0].p3-t68[0]",
    // Passport name fields
    LAST_NAME: "form1[0].Sections7-9[0].TextField11[1]",
    FIRST_NAME: "form1[0].Sections7-9[0].TextField11[2]",
    MIDDLE_NAME: "form1[0].Sections7-9[0].TextField11[0]",
    SUFFIX: "form1[0].Sections7-9[0].suffix[0]",
    // Date fields
    ISSUE_DATE: "form1[0].Sections7-9[0].#area[0].From_Datefield_Name_2[0]",
    ISSUE_DATE_ESTIMATED: "form1[0].Sections7-9[0].#area[0].#field[4]",
    EXPIRATION_DATE: "form1[0].Sections7-9[0].#area[0].To_Datefield_Name_2[0]",
    EXPIRATION_DATE_ESTIMATED: "form1[0].Sections7-9[0].#field[23]"
};
// ============================================================================
// HELPER TYPES
// ============================================================================
/**
 * Passport number validation patterns
 */
exports.PASSPORT_VALIDATION = {
    // US Passport format: 9 digits or letters
    US_PASSPORT_REGEX: /^[A-Z0-9]{9}$/,
    MIN_LENGTH: 6,
    MAX_LENGTH: 15,
    ALLOWED_CHARACTERS: /^[A-Z0-9]*$/
};
/**
 * Common passport suffixes
 */
exports.PASSPORT_SUFFIXES = {
    JR: 'Jr.',
    SR: 'Sr.',
    II: 'II',
    III: 'III',
    IV: 'IV',
    V: 'V',
    NONE: ''
};
// ============================================================================
// FACTORY FUNCTIONS
// ============================================================================
/**
 * Creates a default Section 8 data structure using DRY approach with sections-references
 * This eliminates hardcoded values and uses the single source of truth
 */
function createDefaultSection8() {
    // Validate field count against sections-references (expected: 10 fields)
    (0, sections_references_loader_1.validateSectionFieldCount)(8, 10);
    return {
        _id: 8,
        section8: {
            hasPassport: (0, sections_references_loader_1.createFieldFromReference)(8, exports.SECTION8_FIELD_NAMES.HAS_PASSPORT, "NO"),
            passportNumber: (0, sections_references_loader_1.createFieldFromReference)(8, exports.SECTION8_FIELD_NAMES.PASSPORT_NUMBER, ''),
            nameOnPassport: {
                lastName: (0, sections_references_loader_1.createFieldFromReference)(8, exports.SECTION8_FIELD_NAMES.LAST_NAME, ''),
                firstName: (0, sections_references_loader_1.createFieldFromReference)(8, exports.SECTION8_FIELD_NAMES.FIRST_NAME, ''),
                middleName: (0, sections_references_loader_1.createFieldFromReference)(8, exports.SECTION8_FIELD_NAMES.MIDDLE_NAME, ''),
                suffix: (0, sections_references_loader_1.createFieldFromReference)(8, exports.SECTION8_FIELD_NAMES.SUFFIX, '')
            },
            dates: {
                issueDate: {
                    date: (0, sections_references_loader_1.createFieldFromReference)(8, exports.SECTION8_FIELD_NAMES.ISSUE_DATE, ''),
                    estimated: (0, sections_references_loader_1.createFieldFromReference)(8, exports.SECTION8_FIELD_NAMES.ISSUE_DATE_ESTIMATED, false)
                },
                expirationDate: {
                    date: (0, sections_references_loader_1.createFieldFromReference)(8, exports.SECTION8_FIELD_NAMES.EXPIRATION_DATE, ''),
                    estimated: (0, sections_references_loader_1.createFieldFromReference)(8, exports.SECTION8_FIELD_NAMES.EXPIRATION_DATE_ESTIMATED, false)
                }
            }
        }
    };
}
/**
 * Validates passport information
 */
function validatePassportInfo(section8, context) {
    const errors = [];
    const warnings = [];
    // If no passport, skip detailed validation
    if (section8.hasPassport.value === "NO") {
        return { isValid: true, errors, warnings };
    }
    // Passport number validation
    if (!section8.passportNumber.value.trim()) {
        errors.push('Passport number is required when passport is indicated');
    }
    else {
        const passportNum = section8.passportNumber.value.toUpperCase();
        if (passportNum.length < exports.PASSPORT_VALIDATION.MIN_LENGTH ||
            passportNum.length > exports.PASSPORT_VALIDATION.MAX_LENGTH) {
            errors.push(`Passport number must be between ${exports.PASSPORT_VALIDATION.MIN_LENGTH} and ${exports.PASSPORT_VALIDATION.MAX_LENGTH} characters`);
        }
        if (!exports.PASSPORT_VALIDATION.ALLOWED_CHARACTERS.test(passportNum)) {
            errors.push('Passport number can only contain letters and numbers');
        }
        if (!exports.PASSPORT_VALIDATION.US_PASSPORT_REGEX.test(passportNum)) {
            warnings.push('Passport number format may not match standard US passport format');
        }
    }
    // Name validation
    if (context.rules.requiresNameOnPassport) {
        if (!section8.nameOnPassport.lastName.value.trim()) {
            errors.push('Last name on passport is required');
        }
        if (!section8.nameOnPassport.firstName.value.trim()) {
            errors.push('First name on passport is required');
        }
    }
    // Date validation
    const issueDate = section8.dates.issueDate.date.value;
    const expirationDate = section8.dates.expirationDate.date.value;
    if (issueDate && expirationDate) {
        try {
            const issueParsed = new Date(issueDate);
            const expirationParsed = new Date(expirationDate);
            if (issueParsed >= expirationParsed) {
                errors.push('Passport issue date must be before expiration date');
            }
            if (expirationParsed < context.currentDate) {
                warnings.push('Passport appears to be expired');
            }
            const passportAge = (context.currentDate.getTime() - issueParsed.getTime()) / (1000 * 60 * 60 * 24 * 365);
            if (passportAge > context.rules.maxPassportAge) {
                warnings.push(`Passport is older than ${context.rules.maxPassportAge} years`);
            }
        }
        catch (error) {
            errors.push('Invalid date format in passport dates');
        }
    }
    // Estimation warnings
    if (section8.dates.issueDate.estimated.value) {
        warnings.push('Passport issue date is estimated');
    }
    if (section8.dates.expirationDate.estimated.value) {
        warnings.push('Passport expiration date is estimated');
    }
    return {
        isValid: errors.length === 0,
        errors,
        warnings
    };
}
/**
 * Updates a specific field in Section 8
 */
function updateSection8Field(section8, update) {
    const updated = { ...section8 };
    const fieldPath = update.fieldPath.split('.');
    // Navigate to the correct nested field and update it
    let current = updated.section8;
    for (let i = 0; i < fieldPath.length - 1; i++) {
        current = current[fieldPath[i]];
    }
    const finalField = fieldPath[fieldPath.length - 1];
    if (current[finalField] && typeof current[finalField] === 'object' && 'value' in current[finalField]) {
        current[finalField].value = update.newValue;
    }
    return updated;
}
/**
 * Checks if passport information is required based on other form data
 */
function isPassportRequired(formData) {
    // Add logic based on other sections (e.g., citizenship status)
    // This would typically check Section 9 (Citizenship) data
    return false; // Default implementation
}
// ============================================================================
// FIELD FLATTENING FOR PDF GENERATION
// ============================================================================
/**
 * Flattens Section 8 fields for PDF generation
 * Converts nested Field<T> objects to a flat Record<string, any> structure
 * Expected 10 fields: hasPassport, passportNumber, lastName, firstName, middleName, suffix, issueDate, issueDateEstimated, expirationDate, expirationDateEstimated
 */
function flattenSection8Fields(section8Data) {
    const flattened = {};
    if (section8Data.section8) {
        const section = section8Data.section8;
        // Main passport question
        if (section.hasPassport) {
            flattened[section.hasPassport.id] = section.hasPassport.value;
        }
        // Passport number
        if (section.passportNumber) {
            flattened[section.passportNumber.id] = section.passportNumber.value;
        }
        // Name on passport fields
        if (section.nameOnPassport) {
            if (section.nameOnPassport.lastName) {
                flattened[section.nameOnPassport.lastName.id] = section.nameOnPassport.lastName.value;
            }
            if (section.nameOnPassport.firstName) {
                flattened[section.nameOnPassport.firstName.id] = section.nameOnPassport.firstName.value;
            }
            if (section.nameOnPassport.middleName) {
                flattened[section.nameOnPassport.middleName.id] = section.nameOnPassport.middleName.value;
            }
            if (section.nameOnPassport.suffix) {
                flattened[section.nameOnPassport.suffix.id] = section.nameOnPassport.suffix.value;
            }
        }
        // Date fields
        if (section.dates) {
            // Issue date
            if (section.dates.issueDate) {
                if (section.dates.issueDate.date) {
                    flattened[section.dates.issueDate.date.id] = section.dates.issueDate.date.value;
                }
                if (section.dates.issueDate.estimated) {
                    flattened[section.dates.issueDate.estimated.id] = section.dates.issueDate.estimated.value;
                }
            }
            // Expiration date
            if (section.dates.expirationDate) {
                if (section.dates.expirationDate.date) {
                    flattened[section.dates.expirationDate.date.id] = section.dates.expirationDate.date.value;
                }
                if (section.dates.expirationDate.estimated) {
                    flattened[section.dates.expirationDate.estimated.id] = section.dates.expirationDate.estimated.value;
                }
            }
        }
    }
    return flattened;
}
