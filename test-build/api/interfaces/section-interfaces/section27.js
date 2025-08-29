"use strict";
/**
 * Section 27: Use of Information Technology Systems
 *
 * This interface defines the structure for SF-86 Section 27 data.
 * Uses DRY approach with sections-references as single source of truth.
 *
 * ACTUAL PDF STRUCTURE (based on sections-references analysis):
 * - 27.1 Illegal Access: Section27[0] RadioButtonList[0] + first half of fields
 * - 27.2 Illegal Modification: Section27_2[0] RadioButtonList[0] + all Section27_2 fields
 * - 27.3 Unauthorized Entry: Section27[0] RadioButtonList[1] + second half of Section27[0] fields
 *
 * Each subsection supports 2 entries with location, date, description, and action fields.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.createDefaultSection27 = exports.createDefaultSection27_3Entry = exports.createDefaultSection27_2Entry = exports.createDefaultSection27_1Entry = void 0;
const sections_references_loader_1 = require("../../utils/sections-references-loader");
// ============================================================================
// FIELD MAPPING PATTERNS (Based on sections-reference/section-27.json analysis)
// ============================================================================
/**
 * Field patterns for Section 27 entries - CRITICAL for correct PDF mapping
 * Based on comprehensive analysis of sections-reference/section-27.json
 *
 * Pattern Analysis:
 * - 27.1 Illegal Access: Uses area[0] and area[1] for 2 entries
 * - 27.2 Illegal Modification: Uses Section27_2[0] area[0] and area[1] for 2 entries
 * - 27.3 Unauthorized Entry: Uses area[2] and area[3] for 2 entries
 */
const SECTION27_FIELD_PATTERNS = {
    illegalAccess: {
        radioButton: 'form1[0].Section27[0].RadioButtonList[0]',
        entries: [
            {
                // Entry 1 - area[0] pattern
                street: 'form1[0].Section27[0].#area[0].TextField11[0]',
                city: 'form1[0].Section27[0].#area[0].TextField11[1]',
                zipCode: 'form1[0].Section27[0].#area[0].TextField11[2]',
                description: 'form1[0].Section27[0].TextField11[4]',
                actionTaken: 'form1[0].Section27[0].TextField11[3]',
                date: 'form1[0].Section27[0].From_Datefield_Name_2[0]',
                estimated: 'form1[0].Section27[0].#field[8]'
            },
            {
                // Entry 2 - area[1] pattern
                street: 'form1[0].Section27[0].#area[1].TextField11[5]',
                city: 'form1[0].Section27[0].#area[1].TextField11[6]',
                zipCode: 'form1[0].Section27[0].#area[1].TextField11[7]',
                description: 'form1[0].Section27[0].TextField11[9]',
                actionTaken: 'form1[0].Section27[0].TextField11[8]',
                date: 'form1[0].Section27[0].From_Datefield_Name_2[1]',
                estimated: 'form1[0].Section27[0].#field[17]'
            }
        ]
    },
    illegalModification: {
        radioButton: 'form1[0].Section27_2[0].RadioButtonList[0]',
        entries: [
            {
                // Entry 1 - Section27_2 area[0] pattern
                street: 'form1[0].Section27_2[0].#area[0].TextField11[0]',
                city: 'form1[0].Section27_2[0].#area[0].TextField11[1]',
                zipCode: 'form1[0].Section27_2[0].#area[0].TextField11[2]',
                description: 'form1[0].Section27_2[0].TextField11[4]',
                actionTaken: 'form1[0].Section27_2[0].TextField11[3]',
                date: 'form1[0].Section27_2[0].From_Datefield_Name_2[0]',
                estimated: 'form1[0].Section27_2[0].#field[8]'
            },
            {
                // Entry 2 - Section27_2 area[1] pattern
                street: 'form1[0].Section27_2[0].#area[1].TextField11[5]',
                city: 'form1[0].Section27_2[0].#area[1].TextField11[6]',
                zipCode: 'form1[0].Section27_2[0].#area[1].TextField11[7]',
                description: 'form1[0].Section27_2[0].TextField11[9]',
                actionTaken: 'form1[0].Section27_2[0].TextField11[8]',
                date: 'form1[0].Section27_2[0].From_Datefield_Name_2[1]',
                estimated: 'form1[0].Section27_2[0].#field[17]'
            }
        ]
    },
    unauthorizedEntry: {
        radioButton: 'form1[0].Section27[0].RadioButtonList[1]',
        entries: [
            {
                // Entry 1 - area[2] pattern
                street: 'form1[0].Section27[0].#area[2].TextField11[10]',
                city: 'form1[0].Section27[0].#area[2].TextField11[11]',
                zipCode: 'form1[0].Section27[0].#area[2].TextField11[12]',
                description: 'form1[0].Section27[0].TextField11[14]',
                actionTaken: 'form1[0].Section27[0].TextField11[13]',
                date: 'form1[0].Section27[0].From_Datefield_Name_2[2]',
                estimated: 'form1[0].Section27[0].#field[26]'
            },
            {
                // Entry 2 - area[3] pattern
                street: 'form1[0].Section27[0].#area[3].TextField11[15]',
                city: 'form1[0].Section27[0].#area[3].TextField11[16]',
                zipCode: 'form1[0].Section27[0].#area[3].TextField11[17]',
                description: 'form1[0].Section27[0].TextField11[19]',
                actionTaken: 'form1[0].Section27[0].TextField11[18]',
                date: 'form1[0].Section27[0].From_Datefield_Name_2[3]',
                estimated: 'form1[0].Section27[0].#field[35]'
            }
        ]
    }
};
// ============================================================================
// HELPER FUNCTIONS
// ============================================================================
/**
 * Creates a default Section 27.1 entry (Illegal Access)
 * Uses actual PDF field patterns from sections-references analysis
 */
const createDefaultSection27_1Entry = (entryIndex = 0) => {
    const pattern = SECTION27_FIELD_PATTERNS.illegalAccess.entries[entryIndex] || SECTION27_FIELD_PATTERNS.illegalAccess.entries[0];
    return {
        location: {
            street: (0, sections_references_loader_1.createFieldFromReference)(27, pattern.street, ''),
            city: (0, sections_references_loader_1.createFieldFromReference)(27, pattern.city, ''),
            state: (0, sections_references_loader_1.createFieldFromReference)(27, 'form1[0].Section27[0].#area[0].School6_State[0]', ''), // Dropdown field
            zipCode: (0, sections_references_loader_1.createFieldFromReference)(27, pattern.zipCode, ''),
            country: (0, sections_references_loader_1.createFieldFromReference)(27, 'form1[0].Section27[0].#area[0].DropDownList12[0]', '') // Dropdown field
        },
        description: (0, sections_references_loader_1.createFieldFromReference)(27, pattern.description, ''),
        incidentDate: {
            date: (0, sections_references_loader_1.createFieldFromReference)(27, pattern.date, ''),
            estimated: (0, sections_references_loader_1.createFieldFromReference)(27, pattern.estimated, false)
        },
        actionTaken: (0, sections_references_loader_1.createFieldFromReference)(27, pattern.actionTaken, '')
    };
};
exports.createDefaultSection27_1Entry = createDefaultSection27_1Entry;
/**
 * Creates a default Section 27.2 entry (Illegal Modification)
 * Uses actual PDF field patterns from Section27_2[0] fields
 */
const createDefaultSection27_2Entry = (entryIndex = 0) => {
    const pattern = SECTION27_FIELD_PATTERNS.illegalModification.entries[entryIndex] || SECTION27_FIELD_PATTERNS.illegalModification.entries[0];
    return {
        location: {
            street: (0, sections_references_loader_1.createFieldFromReference)(27, pattern.street, ''),
            city: (0, sections_references_loader_1.createFieldFromReference)(27, pattern.city, ''),
            state: (0, sections_references_loader_1.createFieldFromReference)(27, 'form1[0].Section27_2[0].#area[0].School6_State[0]', ''), // Dropdown field
            zipCode: (0, sections_references_loader_1.createFieldFromReference)(27, pattern.zipCode, ''),
            country: (0, sections_references_loader_1.createFieldFromReference)(27, 'form1[0].Section27_2[0].#area[0].DropDownList9[0]', '') // Dropdown field
        },
        description: (0, sections_references_loader_1.createFieldFromReference)(27, pattern.description, ''),
        incidentDate: {
            date: (0, sections_references_loader_1.createFieldFromReference)(27, pattern.date, ''),
            estimated: (0, sections_references_loader_1.createFieldFromReference)(27, pattern.estimated, false)
        },
        actionTaken: (0, sections_references_loader_1.createFieldFromReference)(27, pattern.actionTaken, '')
    };
};
exports.createDefaultSection27_2Entry = createDefaultSection27_2Entry;
/**
 * Creates a default Section 27.3 entry (Unauthorized Entry)
 * Uses actual PDF field patterns from Section27[0] area[2] and area[3] fields
 */
const createDefaultSection27_3Entry = (entryIndex = 0) => {
    const pattern = SECTION27_FIELD_PATTERNS.unauthorizedEntry.entries[entryIndex] || SECTION27_FIELD_PATTERNS.unauthorizedEntry.entries[0];
    return {
        location: {
            street: (0, sections_references_loader_1.createFieldFromReference)(27, pattern.street, ''),
            city: (0, sections_references_loader_1.createFieldFromReference)(27, pattern.city, ''),
            state: (0, sections_references_loader_1.createFieldFromReference)(27, 'form1[0].Section27[0].#area[2].School6_State[2]', ''), // Dropdown field
            zipCode: (0, sections_references_loader_1.createFieldFromReference)(27, pattern.zipCode, ''),
            country: (0, sections_references_loader_1.createFieldFromReference)(27, 'form1[0].Section27[0].#area[2].DropDownList10[0]', '') // Dropdown field
        },
        description: (0, sections_references_loader_1.createFieldFromReference)(27, pattern.description, ''),
        incidentDate: {
            date: (0, sections_references_loader_1.createFieldFromReference)(27, pattern.date, ''),
            estimated: (0, sections_references_loader_1.createFieldFromReference)(27, pattern.estimated, false)
        },
        actionTaken: (0, sections_references_loader_1.createFieldFromReference)(27, pattern.actionTaken, '')
    };
};
exports.createDefaultSection27_3Entry = createDefaultSection27_3Entry;
/**
 * Creates a default Section 27 data structure using DRY approach with sections-references
 * This eliminates hardcoded values and uses the single source of truth
 *
 * Updated to match actual PDF structure with correct field mappings
 */
const createDefaultSection27 = () => {
    // Validate field count against sections-references
    (0, sections_references_loader_1.validateSectionFieldCount)(27);
    return {
        _id: 27,
        section27: {
            illegalAccess: {
                hasViolation: (0, sections_references_loader_1.createFieldFromReference)(27, SECTION27_FIELD_PATTERNS.illegalAccess.radioButton, "NO"),
                entries: [],
                entriesCount: 0
            },
            illegalModification: {
                hasViolation: (0, sections_references_loader_1.createFieldFromReference)(27, SECTION27_FIELD_PATTERNS.illegalModification.radioButton, "NO"),
                entries: [],
                entriesCount: 0
            },
            unauthorizedEntry: {
                hasViolation: (0, sections_references_loader_1.createFieldFromReference)(27, SECTION27_FIELD_PATTERNS.unauthorizedEntry.radioButton, "NO"),
                entries: [],
                entriesCount: 0
            }
        }
    };
};
exports.createDefaultSection27 = createDefaultSection27;
