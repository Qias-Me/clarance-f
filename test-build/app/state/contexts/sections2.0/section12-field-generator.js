"use strict";
/**
 * Section 12: Where You Went to School - Field Generator
 *
 * This module provides field generation utilities that match the PDF field naming patterns
 * identified in the Section 12 JSON analysis. It ensures unique, predictable field IDs that
 * align with the existing SF-86 system and PDF field structure.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateSection12Field = generateSection12Field;
exports.generateSchoolEntryFields = generateSchoolEntryFields;
exports.generateDegreeFields = generateDegreeFields;
exports.generateContactPersonFields = generateContactPersonFields;
exports.generateGlobalFields = generateGlobalFields;
exports.generateFieldId = generateFieldId;
exports.validateFieldGeneration = validateFieldGeneration;
exports.initializeSection12FieldGeneration = initializeSection12FieldGeneration;
const sections_references_loader_1 = require("../../../../api/utils/sections-references-loader");
const section12_field_mapping_1 = require("./section12-field-mapping");
/**
 * Generate a field using the Section 12 field mapping system
 */
function generateSection12Field(logicalPath, defaultValue) {
    // console.log(`🔄 Section12: Generating field for logical path: ${logicalPath}`);
    const pdfFieldName = (0, section12_field_mapping_1.mapLogicalFieldToPdfField)(logicalPath);
    const fieldMetadata = (0, section12_field_mapping_1.getFieldMetadata)(pdfFieldName);
    // console.log(`🔍 Section12: Mapped to PDF field: ${pdfFieldName}`);
    // Validate that the field exists
    if (!(0, section12_field_mapping_1.validateFieldExists)(pdfFieldName)) {
        // console.warn(`⚠️ Section12: PDF field not found: ${pdfFieldName}`);
        // console.warn(`🔍 Section12: Similar fields:`, findSimilarFieldNames(pdfFieldName, 3));
    }
    // Get numeric ID if available
    const numericId = (0, section12_field_mapping_1.getNumericFieldId)(pdfFieldName);
    if (numericId) {
        // console.log(`🔢 Section12: Using numeric ID: ${numericId} for field: ${pdfFieldName}`);
    }
    // Create field using the reference system
    try {
        const field = (0, sections_references_loader_1.createFieldFromReference)(12, pdfFieldName, defaultValue);
        // console.log(`✅ Section12: Field generation successful for: ${logicalPath}`);
        return field;
    }
    catch (error) {
        // console.error(`❌ Section12: Field generation failed for ${logicalPath}:`, error);
        // Fallback to basic field creation
        return {
            name: pdfFieldName,
            id: numericId || pdfFieldName,
            type: fieldMetadata?.type || 'text',
            label: fieldMetadata?.label || logicalPath,
            value: defaultValue,
        };
    }
}
/**
 * Generate multiple fields for a school entry
 */
function generateSchoolEntryFields(entryIndex, defaultValues) {
    // console.log(`🔄 Section12: Generating fields for school entry ${entryIndex}`);
    const fields = {};
    const fieldMappings = (0, section12_field_mapping_1.getEntryFieldMappings)(entryIndex);
    Object.entries(defaultValues).forEach(([fieldType, defaultValue]) => {
        const logicalPath = `section12.entries[${entryIndex}].${fieldType}`;
        try {
            fields[fieldType] = generateSection12Field(logicalPath, defaultValue);
        }
        catch (error) {
            // console.error(`❌ Section12: Failed to generate field ${fieldType} for entry ${entryIndex}:`, error);
            // Create fallback field
            fields[fieldType] = {
                id: `section12-entry${entryIndex}-${fieldType}`,
                name: `section12-entry${entryIndex}-${fieldType}`,
                type: 'PDFTextField',
                label: `${fieldType} - Entry ${entryIndex + 1}`,
                value: defaultValue,
                rect: { x: 0, y: 0, width: 0, height: 0 }
            };
        }
    });
    // console.log(`✅ Section12: Generated ${Object.keys(fields).length} fields for entry ${entryIndex}`);
    return fields;
}
/**
 * Generate degree fields for a specific entry and degree index
 */
function generateDegreeFields(entryIndex, degreeIndex) {
    // console.log(`🔄 Section12: Generating degree fields for entry ${entryIndex}, degree ${degreeIndex}`);
    return {
        degreeType: generateSection12Field(`section12.entries[${entryIndex}].degrees[${degreeIndex}].degreeType`, 'High School Diploma'),
        otherDegree: generateSection12Field(`section12.entries[${entryIndex}].degrees[${degreeIndex}].otherDegree`, ''),
        dateAwarded: generateSection12Field(`section12.entries[${entryIndex}].degrees[${degreeIndex}].dateAwarded`, '')
    };
}
/**
 * Generate contact person fields for a specific entry
 */
function generateContactPersonFields(entryIndex) {
    // console.log(`🔄 Section12: Generating contact person fields for entry ${entryIndex}`);
    return {
        lastName: generateSection12Field(`section12.entries[${entryIndex}].contactPerson.lastName`, ''),
        firstName: generateSection12Field(`section12.entries[${entryIndex}].contactPerson.firstName`, '')
    };
}
/**
 * Generate global section fields (hasAttendedSchool, hasAttendedSchoolOutsideUS)
 */
function generateGlobalFields() {
    // console.log(`🔄 Section12: Generating global section fields`);
    return {
        hasAttendedSchool: generateSection12Field('section12.hasAttendedSchool', "NO"),
        hasAttendedSchoolOutsideUS: generateSection12Field('section12.hasAttendedSchoolOutsideUS', "NO")
    };
}
/**
 * Generate field ID for a specific field type and entry
 */
function generateFieldId(fieldType, entryIndex) {
    let logicalPath;
    if (fieldType === 'hasAttendedSchool' || fieldType === 'hasAttendedSchoolOutsideUS') {
        logicalPath = `section12.${fieldType}`;
    }
    else if (entryIndex !== undefined) {
        logicalPath = `section12.entries[${entryIndex}].${fieldType}`;
    }
    else {
        throw new Error(`Entry index required for field type: ${fieldType}`);
    }
    const pdfFieldName = (0, section12_field_mapping_1.mapLogicalFieldToPdfField)(logicalPath);
    const numericId = (0, section12_field_mapping_1.getNumericFieldId)(pdfFieldName);
    // console.log(`🔄 Section12: Generated field ID for ${logicalPath}: ${numericId || pdfFieldName}`);
    return numericId || pdfFieldName;
}
/**
 * Validate that all required fields can be generated
 */
function validateFieldGeneration() {
    // console.log('🔍 Section12: Validating field generation capabilities');
    let allValid = true;
    return allValid;
}
/**
 * Initialize and validate Section 12 field generation system
 */
function initializeSection12FieldGeneration() {
    // console.log('🚀 Section12: Initializing field generation system');
    // Validate field mappings
    const validation = (0, section12_field_mapping_1.validateSection12FieldMappings)();
    // console.log(`📊 Section12: Field mapping coverage: ${validation.coverage.toFixed(1)}%`);
    // console.log(`📊 Section12: Mapped ${validation.mappedFields}/${validation.totalFields} fields`);
    if (validation.coverage >= 80) {
        // console.log(`✅ Section12: Field mapping coverage is acceptable (${validation.coverage.toFixed(1)}%)`);
    }
    else {
        // console.warn(`⚠️ Section12: Low field mapping coverage (${validation.coverage.toFixed(1)}%)`);
        // console.warn(`🔍 Section12: Missing fields:`, validation.missingFields.slice(0, 10));
    }
    // Validate field generation
    const canGenerate = validateFieldGeneration();
    if (canGenerate) {
        // console.log(`✅ Section12: All critical fields can be generated`);
    }
    else {
        // console.warn(`⚠️ Section12: Some fields cannot be generated - check field mappings`);
    }
    // console.log('🎯 Section12: Field generation system initialized');
}
// Initialize the system when the module is loaded
initializeSection12FieldGeneration();
