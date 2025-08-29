"use strict";
/**
 * Section 15: Military History
 *
 * TypeScript interface definitions for SF-86 Section 15 (Military History) data structure.
 * Based on the established Field<T> interface patterns and PDF field ID mappings from section-15.json.
 *
 * Section 15 covers:
 * - Military service history (15.1)
 * - Court martial or disciplinary procedure history (15.2)
 * - Foreign military service (15.3)
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.createDefaultForeignMilitaryEntry = exports.createDefaultDisciplinaryEntry = exports.createDefaultMilitaryServiceEntry = exports.createDefaultSection15 = exports.SECTION15_VALIDATION = exports.DISCHARGE_TYPE_OPTIONS = exports.YES_NO_OPTIONS = exports.FOREIGN_MILITARY_OPTIONS = exports.DISCIPLINARY_OPTIONS = exports.MILITARY_SERVICE_OPTIONS = exports.SERVICE_STATUS_OPTIONS = exports.MILITARY_BRANCH_OPTIONS = exports.SECTION15_FIELD_IDS = void 0;
const sections_references_loader_1 = require("../../utils/sections-references-loader");
// ============================================================================
// FIELD ID MAPPINGS
// ============================================================================
/**
 * PDF field ID mappings for Section 15 (Military History)
 * Based on the actual field IDs from section-15.json
 */
exports.SECTION15_FIELD_IDS = {
    // 15.1 Military Service
    HAS_SERVED: "17088", // Has served radio button
    SERVICE_BRANCH: "17087", // Branch selection (1-7)
    SERVICE_STATE: "11394", // State dropdown for National Guard
    SERVICE_STATUS: "17085", // Officer/Enlisted/Other
    SERVICE_FROM_DATE: "11466", // From date
    SERVICE_FROM_ESTIMATED: "11465", // From date estimate checkbox
    SERVICE_TO_DATE: "11464", // To date
    SERVICE_TO_PRESENT: "11463", // Present checkbox
    SERVICE_TO_ESTIMATED: "11462", // To date estimate checkbox
    SERVICE_NUMBER: "11461", // Service number
    DISCHARGE_TYPE: "17084", // Discharge type radio
    TYPE_OF_DISCHARGE: "17083", // Honorable/Other discharge type
    DISCHARGE_DATE: "11459", // Discharge date
    DISCHARGE_ESTIMATED: "11458", // Discharge date estimate
    OTHER_DISCHARGE_TYPE: "11457", // Other discharge type text
    DISCHARGE_REASON: "11456", // Reason for discharge
    // Current status checkboxes
    ACTIVE_DUTY: "11455",
    ACTIVE_RESERVE: "11454",
    INACTIVE_RESERVE: "11453",
    // 15.2 Disciplinary Procedures
    HAS_DISCIPLINARY: "17082", // Has been subject to disciplinary
    PROCEDURE_DATE: "11452", // Date of procedure
    PROCEDURE_ESTIMATED: "11451", // Procedure date estimate
    UCMJ_OFFENSE: "11450", // UCMJ offense description
    DISCIPLINARY_NAME: "11449", // Name of disciplinary procedure
    MILITARY_COURT: "11448", // Military court description
    FINAL_OUTCOME: "11447", // Final outcome
    // 15.3 Foreign Military Service
    HAS_FOREIGN_SERVICE: "17081", // Has served in foreign military
    FOREIGN_FROM_DATE: "11446", // Foreign service from date
    FOREIGN_FROM_ESTIMATED: "11445", // Foreign from date estimate
    FOREIGN_TO_DATE: "11444", // Foreign service to date
    FOREIGN_TO_ESTIMATED: "11443", // Foreign to date estimate
    FOREIGN_PRESENT: "11442", // Currently serving
    ORGANIZATION_NAME: "11441", // Foreign organization name
    COUNTRY: "11440", // Country
    HIGHEST_RANK: "11439", // Highest position/rank
    DIVISION_DEPARTMENT: "11438", // Division/department
    REASON_LEAVING: "11437", // Reason for leaving
    CIRCUMSTANCES: "11436", // Circumstances description
    // Contact 1
    CONTACT1_LAST_NAME: "11435",
    CONTACT1_FIRST_NAME: "11434",
    CONTACT1_MIDDLE_NAME: "11433",
    CONTACT1_SUFFIX: "11432",
    CONTACT1_FROM_DATE: "11431",
    CONTACT1_FROM_ESTIMATED: "11430",
    CONTACT1_TO_DATE: "11429",
    CONTACT1_TO_ESTIMATED: "11428",
    CONTACT1_PRESENT: "11427",
    CONTACT1_FREQUENCY: "11426",
    CONTACT1_TITLE: "11425",
    CONTACT1_STREET: "11424",
    CONTACT1_CITY: "11423",
    CONTACT1_STATE: "11422",
    CONTACT1_COUNTRY: "11421",
    CONTACT1_ZIP: "11420",
    // Contact 2
    CONTACT2_LAST_NAME: "11419",
    CONTACT2_FIRST_NAME: "11418",
    CONTACT2_MIDDLE_NAME: "11417",
    CONTACT2_SUFFIX: "11416",
    CONTACT2_FROM_DATE: "11415",
    CONTACT2_FROM_ESTIMATED: "11414",
    CONTACT2_TO_DATE: "11413",
    CONTACT2_TO_ESTIMATED: "11412",
    CONTACT2_PRESENT: "11411",
    CONTACT2_FREQUENCY: "11410",
    CONTACT2_TITLE: "11409",
    CONTACT2_SPECIFY: "11408",
};
// ============================================================================
// HELPER TYPES
// ============================================================================
/**
 * Military service branch options
 */
exports.MILITARY_BRANCH_OPTIONS = [
    "1", // Army
    "2", // Navy
    "3", // Marine Corps
    "4", // Air Force
    "5", // National Guard
    "6", // Coast Guard
    "7" // Other
];
/**
 * Service status options
 */
exports.SERVICE_STATUS_OPTIONS = [
    "1", // Officer
    "2", // Enlisted
    "3" // Other
];
/**
 * Yes/No options for military service
 */
exports.MILITARY_SERVICE_OPTIONS = [
    "YES",
    "NO (If NO, proceed to Section 15.2) "
];
/**
 * Yes/No options for disciplinary procedures
 */
exports.DISCIPLINARY_OPTIONS = [
    "YES",
    "NO (If NO, proceed to Section 15.3) "
];
/**
 * Yes/No options for foreign military service
 */
exports.FOREIGN_MILITARY_OPTIONS = [
    "YES",
    "NO (If NO, proceed to Section 16)"
];
/**
 * Generic Yes/No options (for backward compatibility)
 */
exports.YES_NO_OPTIONS = [
    "YES",
    "NO"
];
/**
 * Discharge type options
 */
exports.DISCHARGE_TYPE_OPTIONS = [
    "Honorable",
    "General Under Honorable Conditions",
    "Other Than Honorable",
    "Bad Conduct",
    "Dishonorable",
    "Entry Level Separation",
    "Other"
];
/**
 * Validation patterns for Section 15
 */
exports.SECTION15_VALIDATION = {
    SERVICE_NUMBER_MIN_LENGTH: 1,
    SERVICE_NUMBER_MAX_LENGTH: 20,
    DESCRIPTION_MIN_LENGTH: 1,
    DESCRIPTION_MAX_LENGTH: 2000,
    NAME_MIN_LENGTH: 1,
    NAME_MAX_LENGTH: 100,
    SERVICE_NUMBER_PATTERN: /^[A-Za-z0-9\-\s]*$/,
};
// ============================================================================
// HELPER FUNCTIONS
// ============================================================================
/**
 * Creates a default Section 15 data structure using DRY approach with sections-references
 */
const createDefaultSection15 = () => {
    // Validate field count against sections-references
    (0, sections_references_loader_1.validateSectionFieldCount)(15);
    return {
        _id: 15,
        section15: {
            militaryService: {
                hasServed: {
                    ...(0, sections_references_loader_1.createFieldFromReference)(15, 'form1[0].Section14_1[0].#area[4].RadioButtonList[1]', 'NO (If NO, proceed to Section 15.2) '),
                    options: exports.MILITARY_SERVICE_OPTIONS
                },
                entries: []
            },
            disciplinaryProcedures: {
                hasDisciplinaryAction: {
                    ...(0, sections_references_loader_1.createFieldFromReference)(15, 'form1[0].Section15_2[0].#area[0].RadioButtonList[0]', 'NO (If NO, proceed to Section 15.3) '),
                    options: exports.DISCIPLINARY_OPTIONS
                },
                entries: []
            },
            foreignMilitaryService: {
                hasServedInForeignMilitary: {
                    ...(0, sections_references_loader_1.createFieldFromReference)(15, 'form1[0].Section15_3[0].RadioButtonList[0]', 'NO (If NO, proceed to Section 16)'),
                    options: exports.FOREIGN_MILITARY_OPTIONS
                },
                entries: []
            }
        }
    };
};
exports.createDefaultSection15 = createDefaultSection15;
/**
 * Creates a default military service entry using actual field names from sections-references
 */
const createDefaultMilitaryServiceEntry = () => {
    return {
        branch: {
            ...(0, sections_references_loader_1.createFieldFromReference)(15, 'form1[0].Section14_1[0].#area[5].#area[6].RadioButtonList[2]', '5'),
            options: exports.MILITARY_BRANCH_OPTIONS
        },
        serviceState: (0, sections_references_loader_1.createFieldFromReference)(15, 'form1[0].Section14_1[0].School6_State[0]', 'TX'),
        serviceStatus: {
            ...(0, sections_references_loader_1.createFieldFromReference)(15, 'form1[0].Section14_1[0].#area[7].RadioButtonList[3]', '3'),
            options: exports.SERVICE_STATUS_OPTIONS
        },
        fromDate: (0, sections_references_loader_1.createFieldFromReference)(15, 'form1[0].Section14_1[0].#area[8].From_Datefield_Name_2[0]', ''),
        fromDateEstimated: (0, sections_references_loader_1.createFieldFromReference)(15, 'form1[0].Section14_1[0].#area[8].#field[7]', false),
        toDate: (0, sections_references_loader_1.createFieldFromReference)(15, 'form1[0].Section14_1[0].#area[8].From_Datefield_Name_2[1]', ''),
        toDateEstimated: (0, sections_references_loader_1.createFieldFromReference)(15, 'form1[0].Section14_1[0].#area[8].#field[10]', false),
        isPresent: (0, sections_references_loader_1.createFieldFromReference)(15, 'form1[0].Section14_1[0].#area[8].#field[9]', false),
        serviceNumber: (0, sections_references_loader_1.createFieldFromReference)(15, 'form1[0].Section14_1[0].TextField11[3]', ''),
        dischargeType: {
            ...(0, sections_references_loader_1.createFieldFromReference)(15, 'form1[0].Section14_1[0].#area[9].RadioButtonList[4]', ''),
            options: exports.DISCHARGE_TYPE_OPTIONS
        },
        typeOfDischarge: {
            ...(0, sections_references_loader_1.createFieldFromReference)(15, 'form1[0].Section14_1[0].#area[10].RadioButtonList[5]', ''),
            options: exports.DISCHARGE_TYPE_OPTIONS
        },
        dischargeDate: (0, sections_references_loader_1.createFieldFromReference)(15, 'form1[0].Section14_1[0].From_Datefield_Name_2[2]', ''),
        dischargeDateEstimated: (0, sections_references_loader_1.createFieldFromReference)(15, 'form1[0].Section14_1[0].#field[13]', false),
        otherDischargeType: (0, sections_references_loader_1.createFieldFromReference)(15, 'form1[0].Section14_1[0].TextField11[4]', ''),
        dischargeReason: (0, sections_references_loader_1.createFieldFromReference)(15, 'form1[0].Section14_1[0].TextField11[5]', ''),
        currentStatus: {
            activeDuty: (0, sections_references_loader_1.createFieldFromReference)(15, 'form1[0].Section14_1[0].#area[19].#field[27]', false),
            activeReserve: (0, sections_references_loader_1.createFieldFromReference)(15, 'form1[0].Section14_1[0].#area[19].#field[28]', false),
            inactiveReserve: (0, sections_references_loader_1.createFieldFromReference)(15, 'form1[0].Section14_1[0].#area[19].#field[29]', false)
        },
        additionalServiceInfo: (0, sections_references_loader_1.createFieldFromReference)(15, 'form1[0].Section14_1[0].#area[11].RadioButtonList[6]', ''),
        secondaryBranch: (0, sections_references_loader_1.createFieldFromReference)(15, 'form1[0].Section14_1[0].#area[12].RadioButtonList[7]', '')
    };
};
exports.createDefaultMilitaryServiceEntry = createDefaultMilitaryServiceEntry;
/**
 * Creates a default disciplinary entry using actual field names from sections-references
 */
const createDefaultDisciplinaryEntry = () => {
    return {
        procedureDate: (0, sections_references_loader_1.createFieldFromReference)(15, 'form1[0].Section15_2[0].From_Datefield_Name_2[0]', ''),
        procedureDateEstimated: (0, sections_references_loader_1.createFieldFromReference)(15, 'form1[0].Section15_2[0].#field[2]', false),
        ucmjOffenseDescription: (0, sections_references_loader_1.createFieldFromReference)(15, 'form1[0].Section15_2[0].From_Datefield_Name_2[1]', 'OffencesCharged1'),
        disciplinaryProcedureName: (0, sections_references_loader_1.createFieldFromReference)(15, 'form1[0].Section15_2[0].From_Datefield_Name_2[2]', 'DisplinaryProcedure1'),
        militaryCourtDescription: (0, sections_references_loader_1.createFieldFromReference)(15, 'form1[0].Section15_2[0].From_Datefield_Name_2[3]', 'CourtCharged1'),
        finalOutcome: (0, sections_references_loader_1.createFieldFromReference)(15, 'form1[0].Section15_2[0].From_Datefield_Name_2[4]', 'FinalOutcome1')
    };
};
exports.createDefaultDisciplinaryEntry = createDefaultDisciplinaryEntry;
/**
 * Creates a default foreign military service entry using actual field names from sections-references
 */
const createDefaultForeignMilitaryEntry = () => {
    return {
        fromDate: (0, sections_references_loader_1.createFieldFromReference)(15, 'form1[0].Section15_3[0].#area[0].From_Datefield_Name_2[0]', ''),
        fromDateEstimated: (0, sections_references_loader_1.createFieldFromReference)(15, 'form1[0].Section15_3[0].#area[0].#field[3]', false),
        toDate: (0, sections_references_loader_1.createFieldFromReference)(15, 'form1[0].Section15_3[0].#area[0].From_Datefield_Name_2[1]', ''),
        toDateEstimated: (0, sections_references_loader_1.createFieldFromReference)(15, 'form1[0].Section15_3[0].#area[0].#field[5]', false),
        isPresent: (0, sections_references_loader_1.createFieldFromReference)(15, 'form1[0].Section15_3[0].#area[0].#field[6]', false),
        organizationName: (0, sections_references_loader_1.createFieldFromReference)(15, 'form1[0].Section15_3[0].TextField11[0]', ''),
        country: (0, sections_references_loader_1.createFieldFromReference)(15, 'form1[0].Section15_3[0].DropDownList29[0]', ''),
        highestRank: (0, sections_references_loader_1.createFieldFromReference)(15, 'form1[0].Section15_3[0].TextField11[1]', ''),
        divisionDepartment: (0, sections_references_loader_1.createFieldFromReference)(15, 'form1[0].Section15_3[0].TextField11[2]', ''),
        reasonForLeaving: (0, sections_references_loader_1.createFieldFromReference)(15, 'form1[0].Section15_3[0].TextField12[0]', ''),
        circumstancesDescription: (0, sections_references_loader_1.createFieldFromReference)(15, 'form1[0].Section15_3[0].TextField13[0]', ''),
        contactPerson1: {
            firstName: (0, sections_references_loader_1.createFieldFromReference)(15, 'form1[0].Section15_3[0].#area[5].TextField11[16]', ''),
            middleName: (0, sections_references_loader_1.createFieldFromReference)(15, 'form1[0].Section15_3[0].#area[5].TextField11[15]', ''),
            lastName: (0, sections_references_loader_1.createFieldFromReference)(15, 'form1[0].Section15_3[0].#area[5].TextField11[14]', ''),
            suffix: (0, sections_references_loader_1.createFieldFromReference)(15, 'form1[0].Section15_3[0].#area[5].suffix[1]', ''),
            associationFromDate: (0, sections_references_loader_1.createFieldFromReference)(15, 'form1[0].Section15_3[0].#area[5].#area[7].From_Datefield_Name_2[4]', ''),
            associationFromDateEstimated: (0, sections_references_loader_1.createFieldFromReference)(15, 'form1[0].Section15_3[0].#area[5].#area[7].#field[39]', false),
            associationToDate: (0, sections_references_loader_1.createFieldFromReference)(15, 'form1[0].Section15_3[0].#area[5].#area[7].From_Datefield_Name_2[5]', ''),
            associationToDateEstimated: (0, sections_references_loader_1.createFieldFromReference)(15, 'form1[0].Section15_3[0].#area[5].#area[7].#field[41]', false),
            associationIsPresent: (0, sections_references_loader_1.createFieldFromReference)(15, 'form1[0].Section15_3[0].#area[5].#area[7].#field[42]', false),
            frequencyOfContact: (0, sections_references_loader_1.createFieldFromReference)(15, 'form1[0].Section15_3[0].#area[5].TextField11[18]', ''),
            officialTitle: (0, sections_references_loader_1.createFieldFromReference)(15, 'form1[0].Section15_3[0].#area[5].TextField11[17]', ''),
            street: (0, sections_references_loader_1.createFieldFromReference)(15, 'form1[0].Section15_3[0].#area[5].#area[6].TextField11[11]', ''),
            city: (0, sections_references_loader_1.createFieldFromReference)(15, 'form1[0].Section15_3[0].#area[5].#area[6].TextField11[12]', ''),
            state: (0, sections_references_loader_1.createFieldFromReference)(15, 'form1[0].Section15_3[0].#area[5].#area[6].School6_State[1]', ''),
            country: (0, sections_references_loader_1.createFieldFromReference)(15, 'form1[0].Section15_3[0].#area[5].#area[6].DropDownList7[0]', ''),
            zipCode: (0, sections_references_loader_1.createFieldFromReference)(15, 'form1[0].Section15_3[0].#area[5].#area[6].TextField11[13]', '')
        },
        contactPerson2: {
            firstName: (0, sections_references_loader_1.createFieldFromReference)(15, 'form1[0].Section15_3[0].#area[2].TextField11[8]', ''),
            middleName: (0, sections_references_loader_1.createFieldFromReference)(15, 'form1[0].Section15_3[0].#area[2].TextField11[6]', ''),
            lastName: (0, sections_references_loader_1.createFieldFromReference)(15, 'form1[0].Section15_3[0].#area[2].TextField11[7]', ''),
            suffix: (0, sections_references_loader_1.createFieldFromReference)(15, 'form1[0].Section15_3[0].#area[2].suffix[0]', ''),
            associationFromDate: (0, sections_references_loader_1.createFieldFromReference)(15, 'form1[0].Section15_3[0].#area[2].From_Datefield_Name_2[2]', ''),
            associationFromDateEstimated: (0, sections_references_loader_1.createFieldFromReference)(15, 'form1[0].Section15_3[0].#area[2].#field[23]', false),
            associationToDate: (0, sections_references_loader_1.createFieldFromReference)(15, 'form1[0].Section15_3[0].#area[2].From_Datefield_Name_2[3]', ''),
            associationToDateEstimated: (0, sections_references_loader_1.createFieldFromReference)(15, 'form1[0].Section15_3[0].#area[2].#field[25]', false),
            associationIsPresent: (0, sections_references_loader_1.createFieldFromReference)(15, 'form1[0].Section15_3[0].#area[2].#field[26]', false),
            frequencyOfContact: (0, sections_references_loader_1.createFieldFromReference)(15, 'form1[0].Section15_3[0].TextField11[9]', ''),
            officialTitle: (0, sections_references_loader_1.createFieldFromReference)(15, 'form1[0].Section15_3[0].TextField11[10]', ''),
            street: (0, sections_references_loader_1.createFieldFromReference)(15, 'form1[0].Section15_3[0].#area[2].#area[3].TextField11[3]', ''),
            city: (0, sections_references_loader_1.createFieldFromReference)(15, 'form1[0].Section15_3[0].#area[2].#area[3].TextField11[4]', ''),
            state: (0, sections_references_loader_1.createFieldFromReference)(15, 'form1[0].Section15_3[0].#area[2].#area[3].School6_State[0]', ''),
            country: (0, sections_references_loader_1.createFieldFromReference)(15, 'form1[0].Section15_3[0].#area[2].#area[3].DropDownList6[0]', ''),
            zipCode: (0, sections_references_loader_1.createFieldFromReference)(15, 'form1[0].Section15_3[0].#area[2].#area[3].TextField11[5]', ''),
            specify: (0, sections_references_loader_1.createFieldFromReference)(15, 'form1[0].Section15_3[0].TextField11[19]', '')
        },
    };
};
exports.createDefaultForeignMilitaryEntry = createDefaultForeignMilitaryEntry;
