"use strict";
/**
 * Section 5 Field Mapping - Maps logical field paths to actual PDF field names
 *
 * This module provides field mapping functionality for Section 5 (Other Names Used)
 * based on the actual PDF field data from section-5.json reference file.
 *
 * Structure:
 * - Main question: RadioButtonList[0] (Have you used other names?)
 * - Entry 1: TextField11[2,1,0], suffix[0], dates, checkboxes
 * - Entry 2: TextField11[6,5,4], suffix[1], dates, checkboxes
 * - Entry 3: TextField11[10,9,8], suffix[2], dates, checkboxes
 * - Entry 4: TextField11[14,13,12], suffix[3], dates, checkboxes
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SECTION5_FIELD_MAPPINGS = void 0;
exports.mapLogicalFieldToPdfField = mapLogicalFieldToPdfField;
exports.getFieldMetadata = getFieldMetadata;
exports.getPdfFieldByName = getPdfFieldByName;
exports.getPdfFieldById = getPdfFieldById;
exports.getNumericFieldId = getNumericFieldId;
exports.validateFieldExists = validateFieldExists;
exports.getAllFieldNames = getAllFieldNames;
exports.findSimilarFieldNames = findSimilarFieldNames;
exports.isValidSection5Field = isValidSection5Field;
exports.getAllLogicalFieldPaths = getAllLogicalFieldPaths;
exports.generateEntryFieldPath = generateEntryFieldPath;
exports.getEntryFieldName = getEntryFieldName;
const section_5_json_1 = __importDefault(require("../../../../api/sections-references/section-5.json"));
// Load the actual field data
const section5Fields = section_5_json_1.default.fields;
// Create field name to data mapping
const fieldNameToDataMap = new Map();
section5Fields.forEach(field => {
    fieldNameToDataMap.set(field.name, field);
});
// Create field ID to data mapping
const fieldIdToDataMap = new Map();
section5Fields.forEach(field => {
    // Extract numeric ID from "9502 0 R" format
    const numericId = field.id.replace(' 0 R', '');
    fieldIdToDataMap.set(numericId, field);
});
/**
 * Section 5 Field Mappings - Maps logical field paths to actual PDF field names
 *
 * Pattern Analysis from section-5.json:
 * - Main question: form1[0].Sections1-6[0].section5[0].RadioButtonList[0]
 * - Entry N fields follow patterns with incremental indices
 */
exports.SECTION5_FIELD_MAPPINGS = {
    // Main question: Have you used other names?
    'section5.hasOtherNames.value': 'form1[0].Sections1-6[0].section5[0].RadioButtonList[0]',
    // Entry 1 fields (indices: 2,1,0 for TextField11, 0 for others)
    'section5.otherNames.0.lastName.value': 'form1[0].Sections1-6[0].section5[0].TextField11[2]',
    'section5.otherNames.0.firstName.value': 'form1[0].Sections1-6[0].section5[0].TextField11[1]',
    'section5.otherNames.0.middleName.value': 'form1[0].Sections1-6[0].section5[0].TextField11[0]',
    'section5.otherNames.0.suffix.value': 'form1[0].Sections1-6[0].section5[0].suffix[0]',
    'section5.otherNames.0.from.value': 'form1[0].Sections1-6[0].section5[0].#area[0].From_Datefield_Name_2[0]',
    'section5.otherNames.0.to.value': 'form1[0].Sections1-6[0].section5[0].#area[0].To_Datefield_Name_2[0]',
    'section5.otherNames.0.reasonChanged.value': 'form1[0].Sections1-6[0].section5[0].TextField11[3]',
    'section5.otherNames.0.present.value': 'form1[0].Sections1-6[0].section5[0].#field[9]',
    // Entry 2 fields (indices: 6,5,4 for TextField11, 1 for others)
    'section5.otherNames.1.lastName.value': 'form1[0].Sections1-6[0].section5[0].TextField11[6]',
    'section5.otherNames.1.firstName.value': 'form1[0].Sections1-6[0].section5[0].TextField11[5]',
    'section5.otherNames.1.middleName.value': 'form1[0].Sections1-6[0].section5[0].TextField11[4]',
    'section5.otherNames.1.suffix.value': 'form1[0].Sections1-6[0].section5[0].suffix[1]',
    'section5.otherNames.1.from.value': 'form1[0].Sections1-6[0].section5[0].#area[1].From_Datefield_Name_2[1]',
    'section5.otherNames.1.to.value': 'form1[0].Sections1-6[0].section5[0].#area[1].To_Datefield_Name_2[1]',
    'section5.otherNames.1.reasonChanged.value': 'form1[0].Sections1-6[0].section5[0].TextField11[7]',
    'section5.otherNames.1.present.value': 'form1[0].Sections1-6[0].section5[0].#field[19]',
    // Entry 3 fields (indices: 10,9,8 for TextField11, 2 for others)
    'section5.otherNames.2.lastName.value': 'form1[0].Sections1-6[0].section5[0].TextField11[10]',
    'section5.otherNames.2.firstName.value': 'form1[0].Sections1-6[0].section5[0].TextField11[9]',
    'section5.otherNames.2.middleName.value': 'form1[0].Sections1-6[0].section5[0].TextField11[8]',
    'section5.otherNames.2.suffix.value': 'form1[0].Sections1-6[0].section5[0].suffix[2]',
    'section5.otherNames.2.from.value': 'form1[0].Sections1-6[0].section5[0].#area[2].From_Datefield_Name_2[2]',
    'section5.otherNames.2.to.value': 'form1[0].Sections1-6[0].section5[0].#area[2].To_Datefield_Name_2[2]',
    'section5.otherNames.2.reasonChanged.value': 'form1[0].Sections1-6[0].section5[0].TextField11[11]',
    'section5.otherNames.2.present.value': 'form1[0].Sections1-6[0].section5[0].#field[29]',
    // Entry 4 fields (indices: 14,13,12 for TextField11, 3 for others)
    'section5.otherNames.3.lastName.value': 'form1[0].Sections1-6[0].section5[0].TextField11[14]',
    'section5.otherNames.3.firstName.value': 'form1[0].Sections1-6[0].section5[0].TextField11[13]',
    'section5.otherNames.3.middleName.value': 'form1[0].Sections1-6[0].section5[0].TextField11[12]',
    'section5.otherNames.3.suffix.value': 'form1[0].Sections1-6[0].section5[0].suffix[3]',
    'section5.otherNames.3.from.value': 'form1[0].Sections1-6[0].section5[0].#area[3].From_Datefield_Name_2[3]',
    'section5.otherNames.3.to.value': 'form1[0].Sections1-6[0].section5[0].#area[3].To_Datefield_Name_2[3]',
    'section5.otherNames.3.reasonChanged.value': 'form1[0].Sections1-6[0].section5[0].TextField11[15]',
    'section5.otherNames.3.present.value': 'form1[0].Sections1-6[0].section5[0].#field[39]',
};
/**
 * Map a logical field path to the actual PDF field name
 */
function mapLogicalFieldToPdfField(logicalPath) {
    return exports.SECTION5_FIELD_MAPPINGS[logicalPath] || logicalPath;
}
/**
 * Get field metadata for a logical field path
 */
function getFieldMetadata(logicalPath) {
    const pdfFieldName = mapLogicalFieldToPdfField(logicalPath);
    return getPdfFieldByName(pdfFieldName);
}
/**
 * Get PDF field by name
 */
function getPdfFieldByName(fieldName) {
    return fieldNameToDataMap.get(fieldName);
}
/**
 * Get PDF field by ID
 */
function getPdfFieldById(fieldId) {
    return fieldIdToDataMap.get(fieldId);
}
/**
 * Get numeric field ID from field name (for ID-based mapping)
 */
function getNumericFieldId(fieldName) {
    const field = getPdfFieldByName(fieldName);
    if (field) {
        return field.id.replace(' 0 R', '');
    }
    return null;
}
/**
 * Validate that a field exists in the sections-references data
 */
function validateFieldExists(fieldName) {
    return fieldNameToDataMap.has(fieldName);
}
/**
 * Get all available field names for debugging
 */
function getAllFieldNames() {
    return Array.from(fieldNameToDataMap.keys());
}
/**
 * Find similar field names for debugging purposes
 */
function findSimilarFieldNames(targetName, maxResults = 5) {
    const allNames = getAllFieldNames();
    const similar = allNames
        .filter(name => name.includes('section5') || name.includes('TextField11') || name.includes('suffix'))
        .slice(0, maxResults);
    return similar;
}
/**
 * Check if a field path is a valid Section 5 field
 */
function isValidSection5Field(fieldPath) {
    return fieldPath in exports.SECTION5_FIELD_MAPPINGS;
}
/**
 * Get all logical field paths for Section 5
 */
function getAllLogicalFieldPaths() {
    return Object.keys(exports.SECTION5_FIELD_MAPPINGS);
}
/**
 * Generate dynamic field path for a specific entry index
 */
function generateEntryFieldPath(entryIndex, fieldName) {
    return `section5.otherNames.${entryIndex}.${fieldName}.value`;
}
/**
 * Get PDF field name for a specific entry and field
 */
function getEntryFieldName(entryIndex, fieldName) {
    const logicalPath = generateEntryFieldPath(entryIndex, fieldName);
    return mapLogicalFieldToPdfField(logicalPath);
}
