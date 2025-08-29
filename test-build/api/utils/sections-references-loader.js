"use strict";
/**
 * Sections References Loader - DRY Solution for Field Data (API Utils)
 *
 * This utility loads field data from the sections-references JSON files to eliminate
 * hardcoded values in section interfaces and contexts. Located in api/utils for
 * proper access by both api/interfaces and app/state/contexts.
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EXPECTED_FIELD_COUNTS = void 0;
exports.getSectionFields = getSectionFields;
exports.getSectionMetadata = getSectionMetadata;
exports.findFieldByName = findFieldByName;
exports.findFieldById = findFieldById;
exports.findFieldsByPartialName = findFieldsByPartialName;
exports.findFieldByUniqueId = findFieldByUniqueId;
exports.createFieldFromReference = createFieldFromReference;
exports.createFieldsFromReferences = createFieldsFromReferences;
exports.validateSectionFieldCount = validateSectionFieldCount;
exports.validateAllSectionFieldCounts = validateAllSectionFieldCounts;
// Import all sections-references JSON files (relative to api/utils)
const section_1_json_1 = __importDefault(require("../interfaces/sections-references/section-1.json"));
const section_2_json_1 = __importDefault(require("../interfaces/sections-references/section-2.json"));
const section_4_json_1 = __importDefault(require("../interfaces/sections-references/section-4.json"));
const section_3_json_1 = __importDefault(require("../interfaces/sections-references/section-3.json"));
const section_5_json_1 = __importDefault(require("../interfaces/sections-references/section-5.json"));
const section_6_json_1 = __importDefault(require("../interfaces/sections-references/section-6.json"));
const section_7_json_1 = __importDefault(require("../interfaces/sections-references/section-7.json"));
const section_8_json_1 = __importDefault(require("../interfaces/sections-references/section-8.json"));
const section_9_json_1 = __importDefault(require("../interfaces/sections-references/section-9.json"));
const section_10_json_1 = __importDefault(require("../interfaces/sections-references/section-10.json"));
const section_11_json_1 = __importDefault(require("../interfaces/sections-references/section-11.json"));
const section_12_json_1 = __importDefault(require("../interfaces/sections-references/section-12.json"));
const section_13_json_1 = __importDefault(require("../interfaces/sections-references/section-13.json"));
const section_14_json_1 = __importDefault(require("../interfaces/sections-references/section-14.json"));
const section_15_json_1 = __importDefault(require("../interfaces/sections-references/section-15.json"));
const section_27_json_1 = __importDefault(require("../interfaces/sections-references/section-27.json"));
const section_28_json_1 = __importDefault(require("../interfaces/sections-references/section-28.json"));
const section_29_json_1 = __importDefault(require("../interfaces/sections-references/section-29.json"));
const section_30_json_1 = __importDefault(require("../interfaces/sections-references/section-30.json"));
// ============================================================================
// SECTIONS REGISTRY
// ============================================================================
const sectionsRegistry = {
    1: section_1_json_1.default,
    2: section_2_json_1.default,
    3: section_3_json_1.default,
    4: section_4_json_1.default,
    5: section_5_json_1.default,
    6: section_6_json_1.default,
    7: section_7_json_1.default,
    8: section_8_json_1.default,
    9: section_9_json_1.default,
    10: section_10_json_1.default,
    11: section_11_json_1.default,
    12: section_12_json_1.default,
    13: section_13_json_1.default,
    14: section_14_json_1.default,
    15: section_15_json_1.default,
    // 16: section16Data as SectionReference,
    // 17: section17Data as SectionReference,
    // 18: section18Data as SectionReference,
    // 19: section19Data as SectionReference,
    // 20: section20Data as SectionReference,
    // 21: section21Data as SectionReference,
    // 22: section22Data as SectionReference,
    // 23: section23Data as SectionReference,
    // 24: section24Data as SectionReference,
    // 25: section25Data as SectionReference,
    // 26: section26Data as SectionReference,
    27: section_27_json_1.default,
    28: section_28_json_1.default,
    29: section_29_json_1.default,
    30: section_30_json_1.default
};
// ============================================================================
// FIELD LOOKUP UTILITIES
// ============================================================================
/**
 * Get all fields for a specific section
 */
function getSectionFields(sectionId) {
    const sectionData = sectionsRegistry[sectionId];
    if (!sectionData) {
        throw new Error(`Section ${sectionId} not found in sections-references`);
    }
    // Handle both formats: direct fields array or fieldsByEntry object
    if (sectionData.fields) {
        return sectionData.fields;
    }
    else if (sectionData.fieldsByEntry) {
        // Flatten all entry arrays into a single fields array
        const allFields = [];
        Object.values(sectionData.fieldsByEntry).forEach(entryFields => {
            allFields.push(...entryFields);
        });
        return allFields;
    }
    else {
        throw new Error(`Section ${sectionId} has no fields or fieldsByEntry data`);
    }
}
/**
 * Get section metadata
 */
function getSectionMetadata(sectionId) {
    const sectionData = sectionsRegistry[sectionId];
    if (!sectionData) {
        throw new Error(`Section ${sectionId} not found in sections-references`);
    }
    return sectionData.metadata;
}
/**
 * Find a field by its PDF field name
 */
function findFieldByName(sectionId, fieldName) {
    const fields = getSectionFields(sectionId);
    return fields.find(field => field.name === fieldName);
}
/**
 * Find a field by its ID (with or without ' 0 R' suffix)
 */
function findFieldById(sectionId, fieldId) {
    const fields = getSectionFields(sectionId);
    const cleanId = fieldId.replace(' 0 R', '');
    return fields.find(field => field.id.replace(' 0 R', '') === cleanId);
}
/**
 * Find fields by partial name match (useful for finding related fields)
 */
function findFieldsByPartialName(sectionId, partialName) {
    const fields = getSectionFields(sectionId);
    return fields.filter(field => field.name.includes(partialName));
}
/**
 * Get field by unique identifier
 */
function findFieldByUniqueId(sectionId, uniqueId) {
    const fields = getSectionFields(sectionId);
    return fields.find(field => field.uniqueId === uniqueId);
}
// ============================================================================
// FIELD CREATION UTILITIES (DRY)
// ============================================================================
/**
 * Create a Field<T> object from sections-references data
 * Fixed to match Field<T> interface requirements
 */
function createFieldFromReference(sectionId, fieldIdentifier, defaultValue) {
    // Try to find field by ID first, then by name, then by unique ID
    let fieldRef = findFieldById(sectionId, fieldIdentifier) ||
        findFieldByName(sectionId, fieldIdentifier) ||
        findFieldByUniqueId(sectionId, fieldIdentifier);
    if (!fieldRef) {
        console.warn(`Field not found in section ${sectionId}: ${fieldIdentifier}`);
        // Return a default field structure with proper Field<T> compliance
        return {
            id: fieldIdentifier, // Use the identifier as fallback ID
            name: fieldIdentifier, // Use the identifier as fallback name
            type: "PDFTextField", // Default type
            label: `Field ${fieldIdentifier}`, // Default label
            value: defaultValue,
            required: false, // Default to not required
            section: sectionId, // Set the section number
            rect: { x: 0, y: 0, width: 0, height: 0 } // Default rect
        };
    }
    return {
        id: fieldRef.id.replace(' 0 R', ''), // Remove ' 0 R' suffix for internal use
        name: fieldRef.name,
        type: fieldRef.type,
        label: fieldRef.label,
        value: defaultValue,
        required: false, // Add required field (default false)
        section: sectionId, // Add section field
        rect: fieldRef.rect
    };
}
/**
 * Create multiple fields from a list of identifiers
 */
function createFieldsFromReferences(sectionId, fieldMappings) {
    const fields = {};
    fieldMappings.forEach(({ identifier, defaultValue }) => {
        const fieldKey = identifier.split('.').pop() || identifier; // Use last part as key
        fields[fieldKey] = createFieldFromReference(sectionId, identifier, defaultValue);
    });
    return fields;
}
// ============================================================================
// VALIDATION UTILITIES
// ============================================================================
/**
 * Validate that a section has the expected number of fields
 */
function validateSectionFieldCount(sectionId, expectedCount) {
    const metadata = getSectionMetadata(sectionId);
    const actualCount = metadata.totalFields;
    if (expectedCount && actualCount !== expectedCount) {
        console.error(`Section ${sectionId} field count mismatch: expected ${expectedCount}, got ${actualCount}`);
        return false;
    }
    // console.log(`Section ${sectionId} has ${actualCount} fields`);
    return true;
}
/**
 * Get expected field counts for validation
 */
exports.EXPECTED_FIELD_COUNTS = {
    1: 4, // Will be determined from sections-references
    2: 2,
    3: 4, // Will be determined from sections-references
    6: 6, // Will be determined from sections-references
    7: 17,
    8: 10,
    9: 78,
    10: 122,
    11: 252,
    12: 150,
    13: 1086,
    14: 5,
    15: 95,
    16: 154,
    17: 332,
    18: 964,
    19: 277,
    20: 790,
    21: 486,
    22: 267,
    23: 191,
    24: 160,
    25: 79,
    26: 237,
    27: 57,
    28: 23,
    29: 141,
    30: 25
};
/**
 * Validate all section field counts
 */
function validateAllSectionFieldCounts() {
    const results = {};
    Object.entries(exports.EXPECTED_FIELD_COUNTS).forEach(([sectionId, expectedCount]) => {
        const id = parseInt(sectionId);
        results[id] = validateSectionFieldCount(id, expectedCount);
    });
    return results;
}
