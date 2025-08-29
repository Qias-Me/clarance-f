"use strict";
/**
 * Section 10: Dual/Multiple Citizenship & Foreign Passport - Interface
 *
 * This interface defines the structure for SF-86 Section 10 data,
 * which collects information about dual citizenship and foreign passports.
 *
 * Uses sections-reference as single source of truth following Section 1 gold standard pattern.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.createDefaultSection10 = exports.createForeignPassportEntry = exports.createDualCitizenshipEntry = exports.createTravelCountryEntry = exports.hasForeignPassportField = exports.hasDualCitizenshipField = void 0;
const sections_references_loader_1 = require("../../utils/sections-references-loader");
// ============================================================================
// FIELD CREATION USING SECTIONS-REFERENCE (DRY APPROACH)
// ============================================================================
/**
 * Creates Section 10 fields using createFieldFromReference following Section 1 gold standard
 * All field names come from sections-reference/section-10.json as single source of truth
 */
// Main dual citizenship question - FIXED: Use correct default value from sections-reference
const hasDualCitizenshipField = () => (0, sections_references_loader_1.createFieldFromReference)(10, 'form1[0].Section10\\.1-10\\.2[0].RadioButtonList[0]', 'NO (If NO, proceed to 10.2)');
exports.hasDualCitizenshipField = hasDualCitizenshipField;
// Main foreign passport question - FIXED: Use correct default value from sections-reference
const hasForeignPassportField = () => (0, sections_references_loader_1.createFieldFromReference)(10, 'form1[0].Section10\\.1-10\\.2[0].RadioButtonList[5]', 'NO (If NO, proceed to Section 11)');
exports.hasForeignPassportField = hasForeignPassportField;
/**
 * Creates a travel country entry using createFieldFromReference
 * Used for foreign passport travel history table (6 rows per passport)
 */
const createTravelCountryEntry = (passportIndex = 0, rowIndex = 0) => {
    // Determine the section pattern based on passport entry
    const sectionPattern = passportIndex === 0 ? 'Section10\\.1-10\\.2' : 'Section10-2';
    // Handle Row 6 special case (Row5[1] pattern)
    const isRow6 = rowIndex === 5;
    const rowPattern = isRow6 ? 'Row5[1]' : `Row${rowIndex + 1}[0]`;
    const basePattern = `form1[0].${sectionPattern}[0].Table1[0].${rowPattern}`;
    if (isRow6) {
        // Row 6 uses #field pattern
        return {
            country: (0, sections_references_loader_1.createFieldFromReference)(10, `${basePattern}.#field[0]`, ''),
            fromDate: (0, sections_references_loader_1.createFieldFromReference)(10, `${basePattern}.#field[1]`, ''),
            isFromDateEstimated: (0, sections_references_loader_1.createFieldFromReference)(10, `${basePattern}.Cell3[0]`, false),
            toDate: (0, sections_references_loader_1.createFieldFromReference)(10, `${basePattern}.#field[3]`, ''),
            isToDateEstimated: (0, sections_references_loader_1.createFieldFromReference)(10, `${basePattern}.Cell5[0]`, false),
            isPresent: (0, sections_references_loader_1.createFieldFromReference)(10, `${basePattern}.#field[5]`, false),
        };
    }
    else {
        // Rows 1-5 use Cell pattern
        return {
            country: (0, sections_references_loader_1.createFieldFromReference)(10, `${basePattern}.Cell1[0]`, ''),
            fromDate: (0, sections_references_loader_1.createFieldFromReference)(10, `${basePattern}.Cell2[0]`, ''),
            isFromDateEstimated: (0, sections_references_loader_1.createFieldFromReference)(10, `${basePattern}.Cell3[0]`, false),
            toDate: (0, sections_references_loader_1.createFieldFromReference)(10, `${basePattern}.Cell4[0]`, ''),
            isToDateEstimated: (0, sections_references_loader_1.createFieldFromReference)(10, `${basePattern}.Cell5[0]`, false),
            isPresent: (0, sections_references_loader_1.createFieldFromReference)(10, `${basePattern}.#field[5]`, false),
        };
    }
};
exports.createTravelCountryEntry = createTravelCountryEntry;
/**
 * Creates a dual citizenship entry using createFieldFromReference
 * CORRECTED: Fixed field mappings based on reference data analysis
 * Entry 1 uses actual field names from sections-reference, Entry 2 uses corrected mappings
 */
const createDualCitizenshipEntry = (index = 0) => {
    // For first entry, use exact field names from sections-reference
    if (index === 0) {
        return {
            country: (0, sections_references_loader_1.createFieldFromReference)(10, 'form1[0].Section10\\.1-10\\.2[0].DropDownList13[0]', ''),
            howAcquired: (0, sections_references_loader_1.createFieldFromReference)(10, 'form1[0].Section10\\.1-10\\.2[0].TextField11[0]', ''),
            fromDate: (0, sections_references_loader_1.createFieldFromReference)(10, 'form1[0].Section10\\.1-10\\.2[0].From_Datefield_Name_2[0]', ''),
            toDate: (0, sections_references_loader_1.createFieldFromReference)(10, 'form1[0].Section10\\.1-10\\.2[0].From_Datefield_Name_2[1]', ''),
            isFromEstimated: (0, sections_references_loader_1.createFieldFromReference)(10, 'form1[0].Section10\\.1-10\\.2[0].#field[3]', false),
            isToEstimated: (0, sections_references_loader_1.createFieldFromReference)(10, 'form1[0].Section10\\.1-10\\.2[0].#field[6]', false),
            isPresent: (0, sections_references_loader_1.createFieldFromReference)(10, 'form1[0].Section10\\.1-10\\.2[0].#field[5]', false),
            hasRenounced: (0, sections_references_loader_1.createFieldFromReference)(10, 'form1[0].Section10\\.1-10\\.2[0].RadioButtonList[1]', ''),
            renounceExplanation: (0, sections_references_loader_1.createFieldFromReference)(10, 'form1[0].Section10\\.1-10\\.2[0].TextField11[1]', ''),
            hasTakenAction: (0, sections_references_loader_1.createFieldFromReference)(10, 'form1[0].Section10\\.1-10\\.2[0].RadioButtonList[2]', ''),
            actionExplanation: (0, sections_references_loader_1.createFieldFromReference)(10, 'form1[0].Section10\\.1-10\\.2[0].TextField11[2]', ''),
        };
    }
    // For second entry, use corrected field mappings from reference data
    if (index === 1) {
        return {
            country: (0, sections_references_loader_1.createFieldFromReference)(10, 'form1[0].Section10\\.1-10\\.2[0].DropDownList13[1]', ''),
            howAcquired: (0, sections_references_loader_1.createFieldFromReference)(10, 'form1[0].Section10\\.1-10\\.2[0].TextField11[3]', ''),
            fromDate: (0, sections_references_loader_1.createFieldFromReference)(10, 'form1[0].Section10\\.1-10\\.2[0].From_Datefield_Name_2[2]', ''),
            toDate: (0, sections_references_loader_1.createFieldFromReference)(10, 'form1[0].Section10\\.1-10\\.2[0].From_Datefield_Name_2[3]', ''),
            isFromEstimated: (0, sections_references_loader_1.createFieldFromReference)(10, 'form1[0].Section10\\.1-10\\.2[0].#field[11]', false),
            isToEstimated: (0, sections_references_loader_1.createFieldFromReference)(10, 'form1[0].Section10\\.1-10\\.2[0].#field[14]', false),
            isPresent: (0, sections_references_loader_1.createFieldFromReference)(10, 'form1[0].Section10\\.1-10\\.2[0].#field[13]', false),
            hasRenounced: (0, sections_references_loader_1.createFieldFromReference)(10, 'form1[0].Section10\\.1-10\\.2[0].RadioButtonList[3]', ''),
            renounceExplanation: (0, sections_references_loader_1.createFieldFromReference)(10, 'form1[0].Section10\\.1-10\\.2[0].TextField11[4]', ''),
            hasTakenAction: (0, sections_references_loader_1.createFieldFromReference)(10, 'form1[0].Section10\\.1-10\\.2[0].RadioButtonList[4]', ''),
            actionExplanation: (0, sections_references_loader_1.createFieldFromReference)(10, 'form1[0].Section10\\.1-10\\.2[0].TextField11[5]', ''),
        };
    }
    // For additional entries beyond 2, use pattern-based field names (fallback)
    return {
        country: (0, sections_references_loader_1.createFieldFromReference)(10, `form1[0].Section10\\.1-10\\.2[${index}].DropDownList13[0]`, ''),
        howAcquired: (0, sections_references_loader_1.createFieldFromReference)(10, `form1[0].Section10\\.1-10\\.2[${index}].TextField11[0]`, ''),
        fromDate: (0, sections_references_loader_1.createFieldFromReference)(10, `form1[0].Section10\\.1-10\\.2[${index}].From_Datefield_Name_2[0]`, ''),
        toDate: (0, sections_references_loader_1.createFieldFromReference)(10, `form1[0].Section10\\.1-10\\.2[${index}].From_Datefield_Name_2[1]`, ''),
        isFromEstimated: (0, sections_references_loader_1.createFieldFromReference)(10, `form1[0].Section10\\.1-10\\.2[${index}].#field[3]`, false),
        isToEstimated: (0, sections_references_loader_1.createFieldFromReference)(10, `form1[0].Section10\\.1-10\\.2[${index}].#field[6]`, false),
        isPresent: (0, sections_references_loader_1.createFieldFromReference)(10, `form1[0].Section10\\.1-10\\.2[${index}].#field[5]`, false),
        hasRenounced: (0, sections_references_loader_1.createFieldFromReference)(10, `form1[0].Section10\\.1-10\\.2[${index}].RadioButtonList[1]`, ''),
        renounceExplanation: (0, sections_references_loader_1.createFieldFromReference)(10, `form1[0].Section10\\.1-10\\.2[${index}].TextField11[1]`, ''),
        hasTakenAction: (0, sections_references_loader_1.createFieldFromReference)(10, `form1[0].Section10\\.1-10\\.2[${index}].RadioButtonList[2]`, ''),
        actionExplanation: (0, sections_references_loader_1.createFieldFromReference)(10, `form1[0].Section10\\.1-10\\.2[${index}].TextField11[2]`, ''),
    };
};
exports.createDualCitizenshipEntry = createDualCitizenshipEntry;
/**
 * Creates a foreign passport entry using createFieldFromReference
 * UPDATED: Added all missing fields and corrected field mappings
 * Entry 1 uses Section10\.1-10\.2 pattern, Entry 2 uses Section10-2 pattern
 */
const createForeignPassportEntry = (index = 0) => {
    // For first entry, use exact field names from sections-reference
    if (index === 0) {
        // Start with empty travel countries table - user must click "Add Country" to add entries
        const travelCountries = [];
        return {
            country: (0, sections_references_loader_1.createFieldFromReference)(10, 'form1[0].Section10\\.1-10\\.2[0].DropDownList14[0]', ''),
            issueDate: (0, sections_references_loader_1.createFieldFromReference)(10, 'form1[0].Section10\\.1-10\\.2[0].From_Datefield_Name_2[4]', ''),
            isIssueDateEstimated: (0, sections_references_loader_1.createFieldFromReference)(10, 'form1[0].Section10\\.1-10\\.2[0].#field[20]', false),
            city: (0, sections_references_loader_1.createFieldFromReference)(10, 'form1[0].Section10\\.1-10\\.2[0].TextField11[6]', ''),
            country2: (0, sections_references_loader_1.createFieldFromReference)(10, 'form1[0].Section10\\.1-10\\.2[0].DropDownList11[0]', ''),
            lastName: (0, sections_references_loader_1.createFieldFromReference)(10, 'form1[0].Section10\\.1-10\\.2[0].TextField11[7]', ''),
            firstName: (0, sections_references_loader_1.createFieldFromReference)(10, 'form1[0].Section10\\.1-10\\.2[0].TextField11[8]', ''),
            middleName: (0, sections_references_loader_1.createFieldFromReference)(10, 'form1[0].Section10\\.1-10\\.2[0].TextField11[9]', ''),
            suffix: (0, sections_references_loader_1.createFieldFromReference)(10, 'form1[0].Section10\\.1-10\\.2[0].suffix[0]', ''),
            passportNumber: (0, sections_references_loader_1.createFieldFromReference)(10, 'form1[0].Section10\\.1-10\\.2[0].TextField11[10]', ''),
            expirationDate: (0, sections_references_loader_1.createFieldFromReference)(10, 'form1[0].Section10\\.1-10\\.2[0].From_Datefield_Name_2[5]', ''),
            isExpirationDateEstimated: (0, sections_references_loader_1.createFieldFromReference)(10, 'form1[0].Section10\\.1-10\\.2[0].#field[29]', false),
            usedForUSEntry: (0, sections_references_loader_1.createFieldFromReference)(10, 'form1[0].Section10\\.1-10\\.2[0].RadioButtonList[6]', false),
            travelCountries,
        };
    }
    // For second entry, use Section10-2 pattern from sections-reference
    if (index === 1) {
        // Start with empty travel countries table - user must click "Add Country" to add entries
        const travelCountries = [];
        return {
            country: (0, sections_references_loader_1.createFieldFromReference)(10, 'form1[0].Section10-2[0].DropDownList14[0]', ''),
            issueDate: (0, sections_references_loader_1.createFieldFromReference)(10, 'form1[0].Section10-2[0].From_Datefield_Name_2[0]', ''),
            isIssueDateEstimated: (0, sections_references_loader_1.createFieldFromReference)(10, 'form1[0].Section10-2[0].#field[4]', false),
            city: (0, sections_references_loader_1.createFieldFromReference)(10, 'form1[0].Section10-2[0].TextField11[0]', ''),
            country2: (0, sections_references_loader_1.createFieldFromReference)(10, 'form1[0].Section10-2[0].DropDownList11[0]', ''),
            lastName: (0, sections_references_loader_1.createFieldFromReference)(10, 'form1[0].Section10-2[0].TextField11[1]', ''),
            firstName: (0, sections_references_loader_1.createFieldFromReference)(10, 'form1[0].Section10-2[0].TextField11[2]', ''),
            middleName: (0, sections_references_loader_1.createFieldFromReference)(10, 'form1[0].Section10-2[0].TextField11[3]', ''),
            suffix: (0, sections_references_loader_1.createFieldFromReference)(10, 'form1[0].Section10-2[0].suffix[0]', ''),
            passportNumber: (0, sections_references_loader_1.createFieldFromReference)(10, 'form1[0].Section10-2[0].TextField11[4]', ''),
            expirationDate: (0, sections_references_loader_1.createFieldFromReference)(10, 'form1[0].Section10-2[0].From_Datefield_Name_2[1]', ''),
            isExpirationDateEstimated: (0, sections_references_loader_1.createFieldFromReference)(10, 'form1[0].Section10-2[0].#field[13]', false),
            usedForUSEntry: (0, sections_references_loader_1.createFieldFromReference)(10, 'form1[0].Section10-2[0].RadioButtonList[0]', false),
            travelCountries,
        };
    }
    // For additional entries beyond 2, use pattern-based field names (fallback)
    // Start with empty travel countries table - user must click "Add Country" to add entries
    const travelCountries = [];
    return {
        country: (0, sections_references_loader_1.createFieldFromReference)(10, `form1[0].Section10\\.1-10\\.2[${index}].DropDownList14[0]`, ''),
        issueDate: (0, sections_references_loader_1.createFieldFromReference)(10, `form1[0].Section10\\.1-10\\.2[${index}].From_Datefield_Name_2[4]`, ''),
        isIssueDateEstimated: (0, sections_references_loader_1.createFieldFromReference)(10, `form1[0].Section10\\.1-10\\.2[${index}].#field[20]`, false),
        city: (0, sections_references_loader_1.createFieldFromReference)(10, `form1[0].Section10\\.1-10\\.2[${index}].TextField11[6]`, ''),
        country2: (0, sections_references_loader_1.createFieldFromReference)(10, `form1[0].Section10\\.1-10\\.2[${index}].DropDownList11[0]`, ''),
        lastName: (0, sections_references_loader_1.createFieldFromReference)(10, `form1[0].Section10\\.1-10\\.2[${index}].TextField11[7]`, ''),
        firstName: (0, sections_references_loader_1.createFieldFromReference)(10, `form1[0].Section10\\.1-10\\.2[${index}].TextField11[8]`, ''),
        middleName: (0, sections_references_loader_1.createFieldFromReference)(10, `form1[0].Section10\\.1-10\\.2[${index}].TextField11[9]`, ''),
        suffix: (0, sections_references_loader_1.createFieldFromReference)(10, `form1[0].Section10\\.1-10\\.2[${index}].suffix[0]`, ''),
        passportNumber: (0, sections_references_loader_1.createFieldFromReference)(10, `form1[0].Section10\\.1-10\\.2[${index}].TextField11[10]`, ''),
        expirationDate: (0, sections_references_loader_1.createFieldFromReference)(10, `form1[0].Section10\\.1-10\\.2[${index}].From_Datefield_Name_2[5]`, ''),
        isExpirationDateEstimated: (0, sections_references_loader_1.createFieldFromReference)(10, `form1[0].Section10\\.1-10\\.2[${index}].#field[29]`, false),
        usedForUSEntry: (0, sections_references_loader_1.createFieldFromReference)(10, `form1[0].Section10\\.1-10\\.2[${index}].RadioButtonList[6]`, false),
        travelCountries,
    };
};
exports.createForeignPassportEntry = createForeignPassportEntry;
/**
 * Creates default Section 10 data structure using createFieldFromReference
 * Following Section 1 gold standard pattern
 */
const createDefaultSection10 = () => ({
    _id: 10,
    section10: {
        dualCitizenship: {
            hasDualCitizenship: (0, exports.hasDualCitizenshipField)(),
            entries: [], // Start with no entries - user must click "Add" button to add entries
        },
        foreignPassport: {
            hasForeignPassport: (0, exports.hasForeignPassportField)(),
            entries: [], // Start with no entries - user must click "Add" button to add entries
        },
    },
});
exports.createDefaultSection10 = createDefaultSection10;
