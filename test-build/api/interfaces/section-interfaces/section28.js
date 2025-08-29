"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createDefaultDateInfo = createDefaultDateInfo;
exports.createDefaultCourtAddress = createDefaultCourtAddress;
exports.createDefaultCourtActionEntry = createDefaultCourtActionEntry;
exports.createDefaultSection28 = createDefaultSection28;
exports.getSection28FieldReferences = getSection28FieldReferences;
exports.getSection28ExpectedFieldCount = getSection28ExpectedFieldCount;
const sections_references_loader_1 = require("../../utils/sections-references-loader");
// ============================================================================
// FIELD CREATION UTILITIES
// ============================================================================
/**
 * Create a default date field with sections-references integration
 */
function createDateField(fieldIdentifier) {
    return (0, sections_references_loader_1.createFieldFromReference)(28, fieldIdentifier, "");
}
/**
 * Create a default text field with sections-references integration
 */
function createTextField(fieldIdentifier) {
    return (0, sections_references_loader_1.createFieldFromReference)(28, fieldIdentifier, "");
}
/**
 * Create a default radio field with sections-references integration
 */
function createRadioField(fieldIdentifier) {
    return (0, sections_references_loader_1.createFieldFromReference)(28, fieldIdentifier, "NO");
}
/**
 * Create the specific hasCourtActions field with the correct type
 */
function createHasCourtActionsField(fieldIdentifier) {
    return (0, sections_references_loader_1.createFieldFromReference)(28, fieldIdentifier, "NO (If NO, proceed to Section 29)");
}
/**
 * Create a default dropdown field with sections-references integration
 */
function createDropdownField(fieldIdentifier) {
    return (0, sections_references_loader_1.createFieldFromReference)(28, fieldIdentifier, "");
}
// ============================================================================
// DEFAULT CREATORS
// ============================================================================
/**
 * Create default DateInfo object for a specific entry index
 */
function createDefaultDateInfo(entryIndex = 0) {
    const estimateFieldId = entryIndex === 0 ? "form1[0].Section28[0].#field[12]" : "form1[0].Section28[0].#field[23]";
    return {
        date: createDateField(`form1[0].Section28[0].From_Datefield_Name_2[${entryIndex}]`),
        estimated: createRadioField(estimateFieldId)
    };
}
/**
 * Create default CourtAddress object for a specific entry index
 */
function createDefaultCourtAddress(entryIndex = 0) {
    const fieldMappings = entryIndex === 0 ? {
        street: "form1[0].Section28[0].TextField11[4]",
        city: "form1[0].Section28[0].TextField11[5]",
        state: "form1[0].Section28[0].School6_State[0]",
        zipCode: "form1[0].Section28[0].TextField11[6]",
        country: "form1[0].Section28[0].DropDownList142[0]"
    } : {
        street: "form1[0].Section28[0].TextField11[11]",
        city: "form1[0].Section28[0].TextField11[12]",
        state: "form1[0].Section28[0].School6_State[1]",
        zipCode: "form1[0].Section28[0].TextField11[13]",
        country: "form1[0].Section28[0].DropDownList7[0]"
    };
    return {
        street: createTextField(fieldMappings.street),
        city: createTextField(fieldMappings.city),
        state: createDropdownField(fieldMappings.state),
        zipCode: createTextField(fieldMappings.zipCode),
        country: createDropdownField(fieldMappings.country)
    };
}
/**
 * Create default CourtActionEntry object for a specific entry index
 */
function createDefaultCourtActionEntry(entryIndex = 0) {
    const fieldMappings = entryIndex === 0 ? {
        courtName: "form1[0].Section28[0].TextField11[1]",
        natureOfAction: "form1[0].Section28[0].TextField11[0]",
        resultsDescription: "form1[0].Section28[0].TextField11[2]",
        principalParties: "form1[0].Section28[0].TextField11[3]"
    } : {
        courtName: "form1[0].Section28[0].TextField11[8]",
        natureOfAction: "form1[0].Section28[0].TextField11[7]",
        resultsDescription: "form1[0].Section28[0].TextField11[9]",
        principalParties: "form1[0].Section28[0].TextField11[10]"
    };
    return {
        _id: Date.now(),
        dateOfAction: createDefaultDateInfo(entryIndex),
        courtName: createTextField(fieldMappings.courtName),
        natureOfAction: createTextField(fieldMappings.natureOfAction),
        resultsDescription: createTextField(fieldMappings.resultsDescription),
        principalParties: createTextField(fieldMappings.principalParties),
        courtAddress: createDefaultCourtAddress(entryIndex)
    };
}
/**
 * Create default Section28 object
 */
function createDefaultSection28() {
    return {
        _id: 28,
        section28: {
            hasCourtActions: createHasCourtActionsField("form1[0].Section28[0].RadioButtonList[0]"),
            courtActionEntries: []
        }
    };
}
// ============================================================================
// FIELD MAPPING UTILITIES
// ============================================================================
/**
 * Get Section 28 field references for validation and mapping
 */
function getSection28FieldReferences() {
    const fields = (0, sections_references_loader_1.getSectionFields)(28);
    return {
        // Main question
        hasCourtActions: fields.find(f => f.name === 'form1[0].Section28[0].RadioButtonList[0]'),
        // Entry 1 fields
        entry1: {
            dateOfAction: fields.find(f => f.name === 'form1[0].Section28[0].From_Datefield_Name_2[0]'),
            courtName: fields.find(f => f.name === 'form1[0].Section28[0].TextField11[1]'),
            natureOfAction: fields.find(f => f.name === 'form1[0].Section28[0].TextField11[0]'),
            resultsDescription: fields.find(f => f.name === 'form1[0].Section28[0].TextField11[2]'),
            principalParties: fields.find(f => f.name === 'form1[0].Section28[0].TextField11[3]'),
            street: fields.find(f => f.name === 'form1[0].Section28[0].TextField11[4]'),
            city: fields.find(f => f.name === 'form1[0].Section28[0].TextField11[5]'),
            state: fields.find(f => f.name === 'form1[0].Section28[0].School6_State[0]'),
            zipCode: fields.find(f => f.name === 'form1[0].Section28[0].TextField11[6]'),
            country: fields.find(f => f.name === 'form1[0].Section28[0].DropDownList142[0]'),
            estimatedDate: fields.find(f => f.name === 'form1[0].Section28[0].#field[12]')
        },
        // Entry 2 fields
        entry2: {
            dateOfAction: fields.find(f => f.name === 'form1[0].Section28[0].From_Datefield_Name_2[1]'),
            courtName: fields.find(f => f.name === 'form1[0].Section28[0].TextField11[8]'),
            natureOfAction: fields.find(f => f.name === 'form1[0].Section28[0].TextField11[7]'),
            resultsDescription: fields.find(f => f.name === 'form1[0].Section28[0].TextField11[9]'),
            principalParties: fields.find(f => f.name === 'form1[0].Section28[0].TextField11[10]'),
            street: fields.find(f => f.name === 'form1[0].Section28[0].TextField11[11]'),
            city: fields.find(f => f.name === 'form1[0].Section28[0].TextField11[12]'),
            state: fields.find(f => f.name === 'form1[0].Section28[0].School6_State[1]'),
            zipCode: fields.find(f => f.name === 'form1[0].Section28[0].TextField11[13]'),
            country: fields.find(f => f.name === 'form1[0].Section28[0].DropDownList7[0]'),
            estimatedDate: fields.find(f => f.name === 'form1[0].Section28[0].#field[23]')
        }
    };
}
/**
 * Get the expected field count for validation
 */
function getSection28ExpectedFieldCount() {
    const metadata = (0, sections_references_loader_1.getSectionMetadata)(28);
    return metadata.totalFields;
}
