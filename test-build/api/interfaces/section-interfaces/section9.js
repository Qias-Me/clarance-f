"use strict";
/**
 * Section 9: Citizenship of Your Parents
 *
 * TypeScript interface definitions for SF-86 Section 9 citizenship data structure.
 * Based on the established Field<T> interface patterns and PDF field ID mappings.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.createDefaultSection9 = exports.SECTION9_FIELD_IDS = void 0;
const sections_references_loader_1 = require("../../utils/sections-references-loader");
// ============================================================================
// FIELD ID MAPPINGS
// ============================================================================
/**
 * PDF field ID mappings for Section 9 - Corrected with 4-digit numeric IDs
 * Based on section-9.json reference file with proper field ID extraction
 */
exports.SECTION9_FIELD_IDS = {
    // Main citizenship status radio button (ID: 17233 0 R)
    CITIZENSHIP_STATUS: {
        id: "17233 0 R",
        name: "form1[0].Sections7-9[0].RadioButtonList[1]",
        type: "PDFRadioGroup",
    },
    // Section 9.1 - Born to US Parents (Sections7-9 pattern)
    OTHER_EXPLANATION: {
        id: "9539 0 R",
        name: "form1[0].Sections7-9[0].TextField11[3]",
        type: "PDFTextField",
    },
    DOCUMENT_NUMBER: {
        id: "9538 0 R",
        name: "form1[0].Sections7-9[0].TextField11[4]",
        type: "PDFTextField",
    },
    ISSUE_COUNTRY: {
        id: "9537 0 R",
        name: "form1[0].Sections7-9[0].DropDownList12[0]",
        type: "PDFDropdown",
    },
    ISSUE_STATE: {
        id: "9536 0 R",
        name: "form1[0].Sections7-9[0].School6_State[0]",
        type: "PDFDropdown",
    },
    ISSUE_CITY: {
        id: "9535 0 R",
        name: "form1[0].Sections7-9[0].TextField11[5]",
        type: "PDFTextField",
    },
    NAME_MIDDLE: {
        id: "9534 0 R",
        name: "form1[0].Sections7-9[0].TextField11[6]",
        type: "PDFTextField",
    },
    NAME_LAST: {
        id: "9533 0 R",
        name: "form1[0].Sections7-9[0].TextField11[7]",
        type: "PDFTextField",
    },
    NAME_FIRST: {
        id: "9532 0 R",
        name: "form1[0].Sections7-9[0].TextField11[8]",
        type: "PDFTextField",
    },
    // Section 9.2 - Naturalized Citizen (Section9.1-9.4 pattern)
    NATURALIZED_COURT_CITY: {
        id: "9625 0 R",
        name: "form1[0].Section9\\.1-9\\.4[0].TextField11[0]",
        type: "PDFTextField",
    },
    NATURALIZED_NAME_MIDDLE: {
        id: "9624 0 R",
        name: "form1[0].Section9\\.1-9\\.4[0].TextField11[1]",
        type: "PDFTextField",
    },
    NATURALIZED_NAME_LAST: {
        id: "9623 0 R",
        name: "form1[0].Section9\\.1-9\\.4[0].TextField11[2]",
        type: "PDFTextField",
    },
    NATURALIZED_NAME_FIRST: {
        id: "9622 0 R",
        name: "form1[0].Section9\\.1-9\\.4[0].TextField11[3]",
        type: "PDFTextField",
    },
    NATURALIZED_COURT_STREET: {
        id: "9620 0 R",
        name: "form1[0].Section9\\.1-9\\.4[0].TextField11[4]",
        type: "PDFTextField",
    },
    NATURALIZED_COURT_ZIP: {
        id: "9619 0 R",
        name: "form1[0].Section9\\.1-9\\.4[0].TextField11[5]",
        type: "PDFTextField",
    },
    NATURALIZED_CERTIFICATE_NUMBER: {
        id: "9616 0 R",
        name: "form1[0].Section9\\.1-9\\.4[0].TextField11[6]",
        type: "PDFTextField",
    },
    // Section 9.4 - Non-US Citizen
    ALIEN_REGISTRATION_NUMBER: {
        id: "9608 0 R",
        name: "form1[0].Section9\\.1-9\\.4[0].TextField11[9]",
        type: "PDFTextField",
    },
    ENTRY_CITY: {
        id: "9588 0 R",
        name: "form1[0].Section9\\.1-9\\.4[0].TextField11[16]",
        type: "PDFTextField",
    },
    CITIZENSHIP_COUNTRY_1: {
        id: "9587 0 R",
        name: "form1[0].Section9\\.1-9\\.4[0].DropDownList15[0]",
        type: "PDFDropdown",
    },
    CITIZENSHIP_COUNTRY_2: {
        id: "9586 0 R",
        name: "form1[0].Section9\\.1-9\\.4[0].DropDownList15[1]",
        type: "PDFDropdown",
    },
    CITIZENSHIP_COUNTRY_3: {
        id: "9580 0 R",
        name: "form1[0].Section9\\.1-9\\.4[0].DropDownList15[2]",
        type: "PDFDropdown",
    },
    CITIZENSHIP_COUNTRY_4: {
        id: "9579 0 R",
        name: "form1[0].Section9\\.1-9\\.4[0].DropDownList15[3]",
        type: "PDFDropdown",
    },
    HAS_ALIEN_REGISTRATION: {
        id: "17229 0 R",
        name: "form1[0].Section9\\.1-9\\.4[0].RadioButtonList[0]",
        type: "PDFRadioGroup",
    },
    HAS_ALIEN_REGISTRATION_RADIO: {
        id: "17230 0 R",
        name: "form1[0].Section9\\.1-9\\.4[0].RadioButtonList[1]",
        type: "PDFRadioGroup",
    },
    // Additional missing fields
    DERIVED_DOCUMENT_ISSUE_DATE: {
        id: "9568 0 R",
        name: "form1[0].Section9\\.1-9\\.4[0].From_Datefield_Name_2[5]",
        type: "PDFTextField",
    },
    NON_US_ADDITIONAL_EXPIRATION_DATE: {
        id: "9566 0 R",
        name: "form1[0].Section9\\.1-9\\.4[0].From_Datefield_Name_2[6]",
        type: "PDFTextField",
    },
    DERIVED_DOCUMENT_ESTIMATED: {
        id: "9570 0 R",
        name: "form1[0].Section9\\.1-9\\.4[0].#field[50]",
        type: "PDFCheckBox",
    },
    DERIVED_BASIS_ESTIMATED: {
        id: "9569 0 R",
        name: "form1[0].Section9\\.1-9\\.4[0].#field[51]",
        type: "PDFCheckBox",
    },
    DERIVED_DATE_ESTIMATED: {
        id: "9567 0 R",
        name: "form1[0].Section9\\.1-9\\.4[0].#field[53]",
        type: "PDFCheckBox",
    },
    NON_US_ADDITIONAL_EXPIRATION_ESTIMATED: {
        id: "9565 0 R",
        name: "form1[0].Section9\\.1-9\\.4[0].#field[55]",
        type: "PDFCheckBox",
    },
    NON_US_ENTRY_CITY: {
        id: "9581 0 R",
        name: "form1[0].Section9\\.1-9\\.4[0].TextField11[18]",
        type: "PDFTextField",
    },
    NON_US_ENTRY_STATE: {
        id: "9582 0 R",
        name: "form1[0].Section9\\.1-9\\.4[0].School6_State[2]",
        type: "PDFDropdown",
    },
};
// ============================================================================
// HELPER FUNCTIONS
// ============================================================================
/**
 * Creates a default Section 9 data structure using DRY approach with sections-references
 * This eliminates hardcoded values and uses the single source of truth
 */
const createDefaultSection9 = () => {
    // Validate field count against sections-references (expected: 78 fields)
    (0, sections_references_loader_1.validateSectionFieldCount)(9, 78);
    return {
        _id: 9,
        section9: {
            status: (0, sections_references_loader_1.createFieldFromReference)(9, 'form1[0].Sections7-9[0].RadioButtonList[1]', "I am a U.S. citizen or national by birth in the U.S. or U.S. territory/commonwealth. (Proceed to Section 10)   "),
            // Born to US Parents subsection (9.1) - using actual field names from sections-reference
            bornToUSParents: {
                documentType: (0, sections_references_loader_1.createFieldFromReference)(9, 'form1[0].Sections7-9[0].RadioButtonList[3]', "FS240"),
                otherExplanation: (0, sections_references_loader_1.createFieldFromReference)(9, 'form1[0].Sections7-9[0].TextField11[3]', ""),
                documentNumber: (0, sections_references_loader_1.createFieldFromReference)(9, 'form1[0].Sections7-9[0].TextField11[4]', ""),
                documentIssueDate: (0, sections_references_loader_1.createFieldFromReference)(9, 'form1[0].Sections7-9[0].From_Datefield_Name_2[1]', ""),
                isIssueDateEstimated: (0, sections_references_loader_1.createFieldFromReference)(9, 'form1[0].Sections7-9[0].#field[25]', false),
                issueCity: (0, sections_references_loader_1.createFieldFromReference)(9, 'form1[0].Sections7-9[0].TextField11[5]', ""),
                issueState: (0, sections_references_loader_1.createFieldFromReference)(9, 'form1[0].Sections7-9[0].School6_State[0]', ""),
                issueCountry: (0, sections_references_loader_1.createFieldFromReference)(9, 'form1[0].Sections7-9[0].DropDownList12[0]', ""),
                nameOnDocument: {
                    firstName: (0, sections_references_loader_1.createFieldFromReference)(9, 'form1[0].Sections7-9[0].TextField11[8]', ""),
                    middleName: (0, sections_references_loader_1.createFieldFromReference)(9, 'form1[0].Sections7-9[0].TextField11[6]', ""),
                    lastName: (0, sections_references_loader_1.createFieldFromReference)(9, 'form1[0].Sections7-9[0].TextField11[7]', ""),
                    suffix: (0, sections_references_loader_1.createFieldFromReference)(9, 'form1[0].Sections7-9[0].suffix[1]', ""),
                },
                wasBornOnMilitaryInstallation: (0, sections_references_loader_1.createFieldFromReference)(9, 'form1[0].Sections7-9[0].RadioButtonList[2]', ""),
                militaryBaseName: (0, sections_references_loader_1.createFieldFromReference)(9, 'form1[0].Sections7-9[0].TextField11[18]', ""),
                certificateNumber: (0, sections_references_loader_1.createFieldFromReference)(9, 'form1[0].Sections7-9[0].TextField11[12]', ""),
                certificateIssueDate: (0, sections_references_loader_1.createFieldFromReference)(9, 'form1[0].Sections7-9[0].From_Datefield_Name_2[2]', ""),
                isCertificateDateEstimated: (0, sections_references_loader_1.createFieldFromReference)(9, 'form1[0].Sections7-9[0].#field[28]', false),
                nameOnCertificate: {
                    firstName: (0, sections_references_loader_1.createFieldFromReference)(9, 'form1[0].Sections7-9[0].TextField11[11]', ""),
                    middleName: (0, sections_references_loader_1.createFieldFromReference)(9, 'form1[0].Sections7-9[0].TextField11[9]', ""),
                    lastName: (0, sections_references_loader_1.createFieldFromReference)(9, 'form1[0].Sections7-9[0].TextField11[10]', ""),
                    suffix: (0, sections_references_loader_1.createFieldFromReference)(9, 'form1[0].Sections7-9[0].suffix[2]', ""),
                },
            },
            // Naturalized Citizen subsection (9.2) - using actual field names from sections-reference
            naturalizedCitizen: {
                naturalizedCertificateNumber: (0, sections_references_loader_1.createFieldFromReference)(9, 'form1[0].Section9\\.1-9\\.4[0].TextField11[6]', ""),
                nameOnCertificate: {
                    firstName: (0, sections_references_loader_1.createFieldFromReference)(9, 'form1[0].Section9\\.1-9\\.4[0].TextField11[3]', ""),
                    middleName: (0, sections_references_loader_1.createFieldFromReference)(9, 'form1[0].Section9\\.1-9\\.4[0].TextField11[1]', ""),
                    lastName: (0, sections_references_loader_1.createFieldFromReference)(9, 'form1[0].Section9\\.1-9\\.4[0].TextField11[2]', ""),
                    suffix: (0, sections_references_loader_1.createFieldFromReference)(9, 'form1[0].Section9\\.1-9\\.4[0].suffix[0]', ""),
                },
                courtAddress: {
                    street: (0, sections_references_loader_1.createFieldFromReference)(9, 'form1[0].Section9\\.1-9\\.4[0].TextField11[4]', ""),
                    city: (0, sections_references_loader_1.createFieldFromReference)(9, 'form1[0].Section9\\.1-9\\.4[0].TextField11[0]', ""),
                    state: (0, sections_references_loader_1.createFieldFromReference)(9, 'form1[0].Section9\\.1-9\\.4[0].School6_State[0]', ""),
                    zipCode: (0, sections_references_loader_1.createFieldFromReference)(9, 'form1[0].Section9\\.1-9\\.4[0].TextField11[5]', ""),
                },
                courtName: (0, sections_references_loader_1.createFieldFromReference)(9, 'form1[0].Section9\\.1-9\\.4[0].TextField11[15]', ""),
                certificateIssueDate: (0, sections_references_loader_1.createFieldFromReference)(9, 'form1[0].Section9\\.1-9\\.4[0].From_Datefield_Name_2[0]', ""),
                isCertificateDateEstimated: (0, sections_references_loader_1.createFieldFromReference)(9, 'form1[0].Section9\\.1-9\\.4[0].#field[10]', false),
                otherExplanation: (0, sections_references_loader_1.createFieldFromReference)(9, 'form1[0].Section9\\.1-9\\.4[0].TextField11[7]', ""),
                entryDate: (0, sections_references_loader_1.createFieldFromReference)(9, 'form1[0].Section9\\.1-9\\.4[0].From_Datefield_Name_2[4]', ""),
                isEntryDateEstimated: (0, sections_references_loader_1.createFieldFromReference)(9, 'form1[0].Section9\\.1-9\\.4[0].#field[32]', false),
                entryCity: (0, sections_references_loader_1.createFieldFromReference)(9, 'form1[0].Section9\\.1-9\\.4[0].TextField11[16]', ""),
                entryState: (0, sections_references_loader_1.createFieldFromReference)(9, 'form1[0].Section9\\.1-9\\.4[0].School6_State[1]', ""),
                priorCitizenship: (0, sections_references_loader_1.createFieldFromReference)(9, 'form1[0].Section9\\.1-9\\.4[0].DropDownList15[0]', ""),
                priorCitizenship2: (0, sections_references_loader_1.createFieldFromReference)(9, 'form1[0].Section9\\.1-9\\.4[0].DropDownList15[1]', ""),
                priorCitizenship3: (0, sections_references_loader_1.createFieldFromReference)(9, 'form1[0].Section9\\.1-9\\.4[0].DropDownList15[2]', ""),
                priorCitizenship4: (0, sections_references_loader_1.createFieldFromReference)(9, 'form1[0].Section9\\.1-9\\.4[0].DropDownList15[3]', ""),
                hasAlienRegistrationRadio: (0, sections_references_loader_1.createFieldFromReference)(9, 'form1[0].Section9\\.1-9\\.4[0].RadioButtonList[1]', "YES"),
                alienRegistrationNumber: (0, sections_references_loader_1.createFieldFromReference)(9, 'form1[0].Section9\\.1-9\\.4[0].TextField11[9]', ""),
            },
            // Derived Citizen subsection (9.3) - using actual field names from sections-reference
            derivedCitizen: {
                alienRegistrationNumber: (0, sections_references_loader_1.createFieldFromReference)(9, 'form1[0].Section9\\.1-9\\.4[0].TextField11[17]', ""),
                permanentResidentCardNumber: (0, sections_references_loader_1.createFieldFromReference)(9, 'form1[0].Section9\\.1-9\\.4[0].TextField11[18]', ""),
                certificateOfCitizenshipNumber: (0, sections_references_loader_1.createFieldFromReference)(9, 'form1[0].Section9\\.1-9\\.4[0].TextField11[19]', ""),
                nameOnDocument: {
                    firstName: (0, sections_references_loader_1.createFieldFromReference)(9, 'form1[0].Section9\\.1-9\\.4[0].TextField11[20]', ""),
                    middleName: (0, sections_references_loader_1.createFieldFromReference)(9, 'form1[0].Section9\\.1-9\\.4[0].TextField11[21]', ""),
                    lastName: (0, sections_references_loader_1.createFieldFromReference)(9, 'form1[0].Section9\\.1-9\\.4[0].TextField11[22]', ""),
                    suffix: (0, sections_references_loader_1.createFieldFromReference)(9, 'form1[0].Section9\\.1-9\\.4[0].suffix[2]', ""),
                },
                basis: (0, sections_references_loader_1.createFieldFromReference)(9, 'form1[0].Section9\\.1-9\\.4[0].RadioButtonList[1]', "By operation of law through my U.S. citizen parent"),
                otherExplanation: (0, sections_references_loader_1.createFieldFromReference)(9, 'form1[0].Section9\\.1-9\\.4[0].TextField11[23]', ""),
                documentIssueDate: (0, sections_references_loader_1.createFieldFromReference)(9, 'form1[0].Section9\\.1-9\\.4[0].From_Datefield_Name_2[5]', ""),
                isDocumentIssueDateEstimated: (0, sections_references_loader_1.createFieldFromReference)(9, 'form1[0].Section9\\.1-9\\.4[0].#field[50]', false),
                isBasisEstimated: (0, sections_references_loader_1.createFieldFromReference)(9, 'form1[0].Section9\\.1-9\\.4[0].#field[51]', false),
                isDateEstimated: (0, sections_references_loader_1.createFieldFromReference)(9, 'form1[0].Section9\\.1-9\\.4[0].#field[53]', false),
                // Missing fields identified in audit
                additionalFirstName: (0, sections_references_loader_1.createFieldFromReference)(9, 'form1[0].Section9\\.1-9\\.4[0].TextField11[24]', ""),
                additionalExplanation: (0, sections_references_loader_1.createFieldFromReference)(9, 'form1[0].Section9\\.1-9\\.4[0].TextField11[25]', ""),
                otherProvideExplanation: (0, sections_references_loader_1.createFieldFromReference)(9, 'form1[0].Section9\\.1-9\\.4[0].#field[27]', false),
                basisOfNaturalization: (0, sections_references_loader_1.createFieldFromReference)(9, 'form1[0].Section9\\.1-9\\.4[0].#field[28]', false),
            },
            // Non-US Citizen subsection (9.4) - using actual field names from sections-reference
            nonUSCitizen: {
                residenceStatus: (0, sections_references_loader_1.createFieldFromReference)(9, 'form1[0].Section9\\.1-9\\.4[0].TextField11[8]', ""),
                entryDate: (0, sections_references_loader_1.createFieldFromReference)(9, 'form1[0].Section9\\.1-9\\.4[0].From_Datefield_Name_2[1]', ""),
                isEntryDateEstimated: (0, sections_references_loader_1.createFieldFromReference)(9, 'form1[0].Section9\\.1-9\\.4[0].#field[15]', false),
                alienRegistrationNumber: (0, sections_references_loader_1.createFieldFromReference)(9, 'form1[0].Section9\\.1-9\\.4[0].TextField11[9]', ""),
                documentIssueDate: (0, sections_references_loader_1.createFieldFromReference)(9, 'form1[0].Section9\\.1-9\\.4[0].From_Datefield_Name_2[2]', ""),
                isDocumentIssueDateEstimated: (0, sections_references_loader_1.createFieldFromReference)(9, 'form1[0].Section9\\.1-9\\.4[0].#field[18]', false),
                documentExpirationDate: (0, sections_references_loader_1.createFieldFromReference)(9, 'form1[0].Section9\\.1-9\\.4[0].From_Datefield_Name_2[3]', ""),
                isDocumentExpirationEstimated: (0, sections_references_loader_1.createFieldFromReference)(9, 'form1[0].Section9\\.1-9\\.4[0].#field[26]', false),
                nameOnDocument: {
                    firstName: (0, sections_references_loader_1.createFieldFromReference)(9, 'form1[0].Section9\\.1-9\\.4[0].TextField11[12]', ""),
                    middleName: (0, sections_references_loader_1.createFieldFromReference)(9, 'form1[0].Section9\\.1-9\\.4[0].TextField11[10]', ""),
                    lastName: (0, sections_references_loader_1.createFieldFromReference)(9, 'form1[0].Section9\\.1-9\\.4[0].TextField11[11]', ""),
                    suffix: (0, sections_references_loader_1.createFieldFromReference)(9, 'form1[0].Section9\\.1-9\\.4[0].suffix[1]', ""),
                },
                documentNumber: (0, sections_references_loader_1.createFieldFromReference)(9, 'form1[0].Section9\\.1-9\\.4[0].TextField11[13]', ""),
                hasAlienRegistration: (0, sections_references_loader_1.createFieldFromReference)(9, 'form1[0].Section9\\.1-9\\.4[0].RadioButtonList[0]', "1"),
                explanation: (0, sections_references_loader_1.createFieldFromReference)(9, 'form1[0].Section9\\.1-9\\.4[0].TextField11[14]', ""),
                additionalDocumentExpirationDate: (0, sections_references_loader_1.createFieldFromReference)(9, 'form1[0].Section9\\.1-9\\.4[0].From_Datefield_Name_2[6]', ""),
                isAdditionalDocumentExpirationEstimated: (0, sections_references_loader_1.createFieldFromReference)(9, 'form1[0].Section9\\.1-9\\.4[0].#field[55]', false),
                entryCity: (0, sections_references_loader_1.createFieldFromReference)(9, 'form1[0].Section9\\.1-9\\.4[0].TextField11[18]', ""),
                entryState: (0, sections_references_loader_1.createFieldFromReference)(9, 'form1[0].Section9\\.1-9\\.4[0].School6_State[2]', ""),
            },
        },
    };
};
exports.createDefaultSection9 = createDefaultSection9;
