"use strict";
/**
 * Section 11: Where You Have Lived
 *
 * TypeScript interface definitions for SF-86 Section 11 (Where You Have Lived) data structure.
 * Following the residencyInfo.ts pattern with human-readable field names, proper value types,
 * and createReferenceFrom() method for PDF mapping.
 *
 * Based on section-11.json reference data: 252 total fields (63 per entry × 4 entries)
 * Entry patterns: Section11[0], Section11-2[0], Section11-3[0], Section11-4[0]
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateResidenceHistory = exports.createDefaultSection11 = exports.createDefaultResidenceEntry = exports.createDefaultContactPersonDynamic = exports.createDefaultAddressInformationDynamic = exports.createDefaultContactPersonWithReferences = exports.createDefaultAddressInformation = exports.createDefaultAddressInformationWithReferences = exports.AE_CODE_OPTIONS = exports.APO_FPO_TYPE_OPTIONS = exports.getRelationshipOtherFieldId = exports.createAllRelationshipFields = exports.createRelationshipField = exports.RELATIONSHIP_OPTIONS = exports.getResidenceTypeLabel = exports.RESIDENCE_TYPE_MAPPING = exports.RESIDENCE_TYPE_OPTIONS = exports.SECTION11_FIELD_NAMES = exports.SECTION11_FIELD_IDS = exports.createResidenceEntryFromReference = exports.createAdditionalFieldsFromReference = exports.createAPOFPOPhysicalAddressFromReference = exports.createLastContactInfoFromReference = exports.createContactPersonEmailFromReference = exports.createContactPersonAddressFromReference = exports.createContactPersonRelationshipFromReference = exports.createContactPersonPhonesFromReference = exports.createContactPersonNameFromReference = exports.createResidenceTypeFromReference = exports.createResidenceAddressFromReference = exports.createResidenceDatesFromReference = void 0;
exports.createSection11Field = createSection11Field;
const base_1 = require("./base");
const sections_references_loader_1 = require("../../utils/sections-references-loader");
const section11_field_mapping_1 = require("../../../app/state/contexts/sections2.0/section11-field-mapping");
// ============================================================================
// CREATE REFERENCE FROM METHODS - PDF MAPPING
// ============================================================================
/**
 * Creates ResidenceDates from PDF field references
 */
const createResidenceDatesFromReference = (entryIndex) => {
    const entryPattern = entryIndex === 0 ? 'Section11[0]' : `Section11-${entryIndex + 1}[0]`;
    return {
        fromDate: (0, sections_references_loader_1.createFieldFromReference)(11, `form1[0].${entryPattern}.From_Datefield_Name_2[0]`, ''),
        fromDateEstimate: (0, sections_references_loader_1.createFieldFromReference)(11, `form1[0].${entryPattern}.#field[15]`, false),
        toDate: (0, sections_references_loader_1.createFieldFromReference)(11, `form1[0].${entryPattern}.From_Datefield_Name_2[1]`, ''),
        toDateEstimate: (0, sections_references_loader_1.createFieldFromReference)(11, `form1[0].${entryPattern}.#field[18]`, false),
        isPresent: (0, sections_references_loader_1.createFieldFromReference)(11, `form1[0].${entryPattern}.#field[17]`, false)
    };
};
exports.createResidenceDatesFromReference = createResidenceDatesFromReference;
/**
 * Creates ResidenceAddress from PDF field references
 */
const createResidenceAddressFromReference = (entryIndex) => {
    const entryPattern = entryIndex === 0 ? 'Section11[0]' : `Section11-${entryIndex + 1}[0]`;
    return {
        streetAddress: (0, sections_references_loader_1.createFieldFromReference)(11, `form1[0].${entryPattern}.TextField11[3]`, ''),
        city: (0, sections_references_loader_1.createFieldFromReference)(11, `form1[0].${entryPattern}.TextField11[4]`, ''),
        state: {
            ...(0, sections_references_loader_1.createFieldFromReference)(11, `form1[0].${entryPattern}.School6_State[0]`, ''),
            options: (0, base_1.getUSStateOptions)().map(option => option.value)
        },
        country: {
            ...(0, sections_references_loader_1.createFieldFromReference)(11, `form1[0].${entryPattern}.DropDownList5[0]`, 'United States'),
            options: (0, base_1.getCountryOptions)().map(option => option.value)
        },
        zipCode: (0, sections_references_loader_1.createFieldFromReference)(11, `form1[0].${entryPattern}.TextField11[5]`, '')
    };
};
exports.createResidenceAddressFromReference = createResidenceAddressFromReference;
/**
 * Creates ResidenceType from PDF field references
 */
const createResidenceTypeFromReference = (entryIndex) => {
    const entryPattern = entryIndex === 0 ? 'Section11[0]' : `Section11-${entryIndex + 1}[0]`;
    return {
        type: {
            ...(0, sections_references_loader_1.createFieldFromReference)(11, `form1[0].${entryPattern}.RadioButtonList[0]`, '1'),
            options: ['1', '2', '3', '4'] // 1=Own, 2=Rent, 3=Military Housing, 4=Other
        },
        otherExplanation: (0, sections_references_loader_1.createFieldFromReference)(11, `form1[0].${entryPattern}.TextField12[0]`, '')
    };
};
exports.createResidenceTypeFromReference = createResidenceTypeFromReference;
/**
 * Creates ContactPersonName from PDF field references
 */
const createContactPersonNameFromReference = (entryIndex) => {
    const entryPattern = entryIndex === 0 ? 'Section11[0]' : `Section11-${entryIndex + 1}[0]`;
    return {
        firstName: (0, sections_references_loader_1.createFieldFromReference)(11, `form1[0].${entryPattern}.TextField11[8]`, ''),
        middleName: (0, sections_references_loader_1.createFieldFromReference)(11, `form1[0].${entryPattern}.TextField11[6]`, ''),
        lastName: (0, sections_references_loader_1.createFieldFromReference)(11, `form1[0].${entryPattern}.TextField11[7]`, ''),
        suffix: {
            ...(0, sections_references_loader_1.createFieldFromReference)(11, `form1[0].${entryPattern}.suffix[0]`, ''),
            options: (0, base_1.getSuffixOptions)().map(option => option.value)
        }
    };
};
exports.createContactPersonNameFromReference = createContactPersonNameFromReference;
/**
 * Creates ContactPersonPhones from PDF field references
 */
const createContactPersonPhonesFromReference = (entryIndex) => {
    const entryPattern = entryIndex === 0 ? 'Section11[0]' : `Section11-${entryIndex + 1}[0]`;
    return {
        eveningPhone: (0, sections_references_loader_1.createFieldFromReference)(11, `form1[0].${entryPattern}.p3-t68[0]`, ''),
        eveningPhoneExtension: (0, sections_references_loader_1.createFieldFromReference)(11, `form1[0].${entryPattern}.TextField11[0]`, ''),
        eveningPhoneIsInternational: (0, sections_references_loader_1.createFieldFromReference)(11, `form1[0].${entryPattern}.#field[4]`, false),
        daytimePhone: (0, sections_references_loader_1.createFieldFromReference)(11, `form1[0].${entryPattern}.p3-t68[1]`, ''),
        daytimePhoneExtension: (0, sections_references_loader_1.createFieldFromReference)(11, `form1[0].${entryPattern}.TextField11[1]`, ''),
        daytimePhoneIsInternational: (0, sections_references_loader_1.createFieldFromReference)(11, `form1[0].${entryPattern}.#field[10]`, false),
        daytimePhoneUnknown: (0, sections_references_loader_1.createFieldFromReference)(11, `form1[0].${entryPattern}.#field[11]`, false),
        mobilePhone: (0, sections_references_loader_1.createFieldFromReference)(11, `form1[0].${entryPattern}.p3-t68[2]`, ''),
        mobilePhoneExtension: (0, sections_references_loader_1.createFieldFromReference)(11, `form1[0].${entryPattern}.TextField11[2]`, ''),
        mobilePhoneIsInternational: (0, sections_references_loader_1.createFieldFromReference)(11, `form1[0].${entryPattern}.#field[12]`, false),
        mobilePhoneUnknown: (0, sections_references_loader_1.createFieldFromReference)(11, `form1[0].${entryPattern}.#field[13]`, false),
        dontKnowContact: (0, sections_references_loader_1.createFieldFromReference)(11, `form1[0].${entryPattern}.#field[5]`, false)
    };
};
exports.createContactPersonPhonesFromReference = createContactPersonPhonesFromReference;
/**
 * Creates ContactPersonRelationship from PDF field references
 */
const createContactPersonRelationshipFromReference = (entryIndex) => {
    const entryPattern = entryIndex === 0 ? 'Section11[0]' : `Section11-${entryIndex + 1}[0]`;
    return {
        isNeighbor: (0, sections_references_loader_1.createFieldFromReference)(11, `form1[0].${entryPattern}.#field[29]`, false),
        isFriend: (0, sections_references_loader_1.createFieldFromReference)(11, `form1[0].${entryPattern}.#field[30]`, false),
        isLandlord: (0, sections_references_loader_1.createFieldFromReference)(11, `form1[0].${entryPattern}.#field[31]`, false),
        isBusinessAssociate: (0, sections_references_loader_1.createFieldFromReference)(11, `form1[0].${entryPattern}.#field[32]`, false),
        isOther: (0, sections_references_loader_1.createFieldFromReference)(11, `form1[0].${entryPattern}.#field[33]`, false),
        otherExplanation: (0, sections_references_loader_1.createFieldFromReference)(11, `form1[0].${entryPattern}.TextField11[9]`, '')
    };
};
exports.createContactPersonRelationshipFromReference = createContactPersonRelationshipFromReference;
/**
 * Creates ContactPersonAddress from PDF field references
 */
const createContactPersonAddressFromReference = (entryIndex) => {
    const entryPattern = entryIndex === 0 ? 'Section11[0]' : `Section11-${entryIndex + 1}[0]`;
    return {
        streetAddress: (0, sections_references_loader_1.createFieldFromReference)(11, `form1[0].${entryPattern}.TextField11[10]`, ''),
        city: (0, sections_references_loader_1.createFieldFromReference)(11, `form1[0].${entryPattern}.TextField11[11]`, ''),
        state: {
            ...(0, sections_references_loader_1.createFieldFromReference)(11, `form1[0].${entryPattern}.School6_State[1]`, ''),
            options: (0, base_1.getUSStateOptions)().map(option => option.value)
        },
        country: {
            ...(0, sections_references_loader_1.createFieldFromReference)(11, `form1[0].${entryPattern}.DropDownList3[0]`, 'United States'),
            options: (0, base_1.getCountryOptions)().map(option => option.value)
        },
        zipCode: (0, sections_references_loader_1.createFieldFromReference)(11, `form1[0].${entryPattern}.TextField11[12]`, '')
    };
};
exports.createContactPersonAddressFromReference = createContactPersonAddressFromReference;
/**
 * Creates ContactPersonEmail from PDF field references
 */
const createContactPersonEmailFromReference = (entryIndex) => {
    const entryPattern = entryIndex === 0 ? 'Section11[0]' : `Section11-${entryIndex + 1}[0]`;
    return {
        email: (0, sections_references_loader_1.createFieldFromReference)(11, `form1[0].${entryPattern}.p3-t68[3]`, ''),
        emailUnknown: (0, sections_references_loader_1.createFieldFromReference)(11, `form1[0].${entryPattern}.#field[41]`, false)
    };
};
exports.createContactPersonEmailFromReference = createContactPersonEmailFromReference;
/**
 * Creates LastContactInfo from PDF field references
 */
const createLastContactInfoFromReference = (entryIndex) => {
    const entryPattern = entryIndex === 0 ? 'Section11[0]' : `Section11-${entryIndex + 1}[0]`;
    return {
        lastContactDate: (0, sections_references_loader_1.createFieldFromReference)(11, `form1[0].${entryPattern}.From_Datefield_Name_2[2]`, ''),
        lastContactEstimate: (0, sections_references_loader_1.createFieldFromReference)(11, `form1[0].${entryPattern}.#field[43]`, false)
    };
};
exports.createLastContactInfoFromReference = createLastContactInfoFromReference;
/**
 * Creates APOFPOPhysicalAddress from PDF field references
 * Accounts for all 15 physical address fields per entry
 */
const createAPOFPOPhysicalAddressFromReference = (entryIndex) => {
    const entryPattern = entryIndex === 0 ? 'Section11[0]' : `Section11-${entryIndex + 1}[0]`;
    return {
        // Primary physical address (5 fields)
        physicalStreetAddress: (0, sections_references_loader_1.createFieldFromReference)(11, `form1[0].${entryPattern}.TextField11[13]`, ''),
        physicalCity: (0, sections_references_loader_1.createFieldFromReference)(11, `form1[0].${entryPattern}.TextField11[14]`, ''),
        physicalState: {
            ...(0, sections_references_loader_1.createFieldFromReference)(11, `form1[0].${entryPattern}.School6_State[2]`, ''),
            options: (0, base_1.getUSStateOptions)().map(option => option.value)
        },
        physicalCountry: {
            ...(0, sections_references_loader_1.createFieldFromReference)(11, `form1[0].${entryPattern}.DropDownList4[0]`, 'United States'),
            options: (0, base_1.getCountryOptions)().map(option => option.value)
        },
        physicalZipCode: (0, sections_references_loader_1.createFieldFromReference)(11, `form1[0].${entryPattern}.TextField11[18]`, ''),
        // APO/FPO address (3 fields)
        apoFpoAddress: (0, sections_references_loader_1.createFieldFromReference)(11, `form1[0].${entryPattern}.TextField11[16]`, ''),
        apoFpoState: {
            ...(0, sections_references_loader_1.createFieldFromReference)(11, `form1[0].${entryPattern}.School6_State[3]`, ''),
            options: ['AA', 'AE', 'AP'] // APO/FPO state codes
        },
        apoFpoZipCode: (0, sections_references_loader_1.createFieldFromReference)(11, `form1[0].${entryPattern}.TextField11[17]`, ''),
        // Alternative physical address (7 fields)
        physicalAddressAlt: (0, sections_references_loader_1.createFieldFromReference)(11, `form1[0].${entryPattern}.TextField11[15]`, ''),
        physicalAltStreet: (0, sections_references_loader_1.createFieldFromReference)(11, `form1[0].${entryPattern}.TextField11[19]`, ''),
        physicalAltCity: (0, sections_references_loader_1.createFieldFromReference)(11, `form1[0].${entryPattern}.TextField11[20]`, ''),
        physicalAltState: {
            ...(0, sections_references_loader_1.createFieldFromReference)(11, `form1[0].${entryPattern}.School6_State[4]`, ''),
            options: (0, base_1.getUSStateOptions)().map(option => option.value)
        },
        physicalAltCountry: {
            ...(0, sections_references_loader_1.createFieldFromReference)(11, `form1[0].${entryPattern}.DropDownList4[1]`, 'United States'),
            options: (0, base_1.getCountryOptions)().map(option => option.value)
        },
        physicalAltZip: (0, sections_references_loader_1.createFieldFromReference)(11, `form1[0].${entryPattern}.TextField11[21]`, ''),
        physicalAddressFull: (0, sections_references_loader_1.createFieldFromReference)(11, `form1[0].${entryPattern}.TextField11[22]`, '')
    };
};
exports.createAPOFPOPhysicalAddressFromReference = createAPOFPOPhysicalAddressFromReference;
/**
 * Creates AdditionalFields from PDF field references
 * Accounts for remaining 5 fields to complete 63 per entry
 */
const createAdditionalFieldsFromReference = (entryIndex) => {
    const entryPattern = entryIndex === 0 ? 'Section11[0]' : `Section11-${entryIndex + 1}[0]`;
    return {
        // Radio button fields (3 fields)
        addressTypeRadio: {
            ...(0, sections_references_loader_1.createFieldFromReference)(11, `form1[0].${entryPattern}.RadioButtonList[1]`, 'NO'),
            options: ['YES', 'NO']
        },
        residenceTypeRadioAlt: {
            ...(0, sections_references_loader_1.createFieldFromReference)(11, `form1[0].${entryPattern}.RadioButtonList[2]`, 'NO'),
            options: ['YES', 'NO']
        },
        // Additional APO/FPO fields (3 fields)
        apoFpoFull: (0, sections_references_loader_1.createFieldFromReference)(11, `form1[0].${entryPattern}.TextField11[23]`, ''),
        apoFpoStateAlt: {
            ...(0, sections_references_loader_1.createFieldFromReference)(11, `form1[0].${entryPattern}.School6_State[5]`, ''),
            options: ['AA', 'AE', 'AP'] // APO/FPO state codes
        },
        apoFpoZipAlt: (0, sections_references_loader_1.createFieldFromReference)(11, `form1[0].${entryPattern}.TextField11[24]`, '')
    };
};
exports.createAdditionalFieldsFromReference = createAdditionalFieldsFromReference;
/**
 * Creates a complete ResidenceEntry from PDF field references
 * Accounts for all 63 fields per entry
 */
const createResidenceEntryFromReference = (entryIndex) => {
    return {
        _id: Date.now() + Math.random(),
        residenceDates: (0, exports.createResidenceDatesFromReference)(entryIndex), // 5 fields
        residenceAddress: (0, exports.createResidenceAddressFromReference)(entryIndex), // 5 fields
        residenceType: (0, exports.createResidenceTypeFromReference)(entryIndex), // 2 fields
        contactPersonName: (0, exports.createContactPersonNameFromReference)(entryIndex), // 4 fields
        contactPersonPhones: (0, exports.createContactPersonPhonesFromReference)(entryIndex), // 12 fields
        contactPersonRelationship: (0, exports.createContactPersonRelationshipFromReference)(entryIndex), // 6 fields
        contactPersonAddress: (0, exports.createContactPersonAddressFromReference)(entryIndex), // 5 fields
        contactPersonEmail: (0, exports.createContactPersonEmailFromReference)(entryIndex), // 2 fields
        lastContactInfo: (0, exports.createLastContactInfoFromReference)(entryIndex), // 2 fields
        apoFpoPhysicalAddress: (0, exports.createAPOFPOPhysicalAddressFromReference)(entryIndex), // 15 fields
        additionalFields: (0, exports.createAdditionalFieldsFromReference)(entryIndex) // 5 fields
        // Total: 63 fields per entry ✓
    };
};
exports.createResidenceEntryFromReference = createResidenceEntryFromReference;
// ============================================================================
// FIELD ID MAPPINGS
// ============================================================================
/**
 * PDF field ID mappings for Section 11 (Where You Have Lived)
 * Based on the actual field IDs from section-11.json - CORRECTED MAPPINGS
 */
exports.SECTION11_FIELD_IDS = {
    // ============================================================================
    // ENTRY 1 FIELD IDS (Section11[0]) - CORRECTED FROM section-11.json
    // ============================================================================
    // Entry 1 - Phone fields (neighbor contact)
    NEIGHBOR_PHONE_1_1: "9826", // form1[0].Section11[0].p3-t68[0] - sect11Entry1_neighborTeleNumber1
    NEIGHBOR_PHONE_EXT_1_1: "9825", // form1[0].Section11[0].TextField11[0] - sect11Entry1_Extension1
    NEIGHBOR_PHONE_INTL_1_1: "9824", // form1[0].Section11[0].#field[4] - International or DSN phone
    DONT_KNOW_CONTACT_1: "9823", // form1[0].Section11[0].#field[5] - I don't know
    NEIGHBOR_PHONE_2_1: "9822", // form1[0].Section11[0].p3-t68[1] - sect11Entry1_neighborTeleNumber2
    NEIGHBOR_PHONE_EXT_2_1: "9821", // form1[0].Section11[0].TextField11[1] - sect11Entry1_Extension2
    NEIGHBOR_PHONE_3_1: "9820", // form1[0].Section11[0].p3-t68[2] - sect11Entry1_neighborTeleNumber3
    NEIGHBOR_PHONE_EXT_3_1: "9819", // form1[0].Section11[0].TextField11[2] - sect11Entry1_Extension3
    NEIGHBOR_PHONE_INTL_2_1: "9818", // form1[0].Section11[0].#field[10] - International or DSN phone
    NEIGHBOR_PHONE_UNKNOWN_2_1: "9817", // form1[0].Section11[0].#field[11] - I don't know
    NEIGHBOR_PHONE_INTL_3_1: "9816", // form1[0].Section11[0].#field[12] - International or DSN phone
    NEIGHBOR_PHONE_UNKNOWN_3_1: "9815", // form1[0].Section11[0].#field[13] - I don't know
    // Entry 1 - Date fields
    FROM_DATE_1: "9814", // form1[0].Section11[0].From_Datefield_Name_2[0] - sect11Entry1ToDate
    FROM_DATE_ESTIMATE_1: "9813", // form1[0].Section11[0].#field[15] - Estimate
    TO_DATE_1: "9812", // form1[0].Section11[0].From_Datefield_Name_2[1] - sect11Entry1ToDate
    PRESENT_1: "9811", // form1[0].Section11[0].#field[17] - Present
    TO_DATE_ESTIMATE_1: "9810", // form1[0].Section11[0].#field[18] - Estimate
    // Entry 1 - Residence type
    RESIDENCE_TYPE_1: "17200", // form1[0].Section11[0].RadioButtonList[0]
    RESIDENCE_TYPE_OTHER_1: "9805", // form1[0].Section11[0].TextField12[0] - sect11Entry1OtherField
    // Entry 1 - Main address fields
    STREET_ADDRESS_1: "9804", // form1[0].Section11[0].TextField11[3] - sect11Entry1Street
    CITY_1: "9803", // form1[0].Section11[0].TextField11[4] - sect11Entry1City
    STATE_1: "9802", // form1[0].Section11[0].School6_State[0] - sect11Entry1State
    COUNTRY_1: "9801", // form1[0].Section11[0].DropDownList5[0] - Cambodia
    ZIP_CODE_1: "9800", // form1[0].Section11[0].TextField11[5] - sect11EntryZip
    // Entry 1 - Contact person names
    CONTACT_MIDDLE_NAME_1: "9799", // form1[0].Section11[0].TextField11[6] - sect11Entry1_b_neighborMname
    CONTACT_LAST_NAME_1: "9798", // form1[0].Section11[0].TextField11[7] - sect11Entry1_b_neighborLname
    CONTACT_FIRST_NAME_1: "9797", // form1[0].Section11[0].TextField11[8] - sect11Entry1_b_neighborFname
    CONTACT_SUFFIX_1: "9796", // form1[0].Section11[0].suffix[0] - sect11Entry1_b_suffix
    // Entry 1 - Relationship checkboxes
    RELATIONSHIP_NEIGHBOR_1: "9795", // form1[0].Section11[0].#field[29] - Neighbor
    RELATIONSHIP_FRIEND_1: "9794", // form1[0].Section11[0].#field[30] - Friend
    RELATIONSHIP_LANDLORD_1: "9793", // form1[0].Section11[0].#field[31] - Landlord
    RELATIONSHIP_BUSINESS_1: "9792", // form1[0].Section11[0].#field[32] - Business Associate
    RELATIONSHIP_OTHER_1: "9791", // form1[0].Section11[0].#field[33] - Other
    RELATIONSHIP_OTHER_EXPLAIN_1: "9790", // form1[0].Section11[0].TextField11[9] - sect11Entry1_RelationshipOther
    // Entry 1 - Neighbor address
    NEIGHBOR_STREET_1: "9789", // form1[0].Section11[0].TextField11[10] - E1neighborStreet
    NEIGHBOR_CITY_1: "9788", // form1[0].Section11[0].TextField11[11] - sect11Entry1_Extension1neighborCity
    NEIGHBOR_STATE_1: "9787", // form1[0].Section11[0].School6_State[1] - sect11Entry1_Extension1_NeighborState
    NEIGHBOR_COUNTRY_1: "9786", // form1[0].Section11[0].DropDownList3[0] - Antarctica
    NEIGHBOR_ZIP_1: "9785", // form1[0].Section11[0].TextField11[12] - sect11Entry1_Extension1_NeighborZip
    NEIGHBOR_EMAIL_1: "9784", // form1[0].Section11[0].p3-t68[3] - sect11Entry1_Extension1neighborEmail
    NEIGHBOR_EMAIL_UNKNOWN_1: "9783", // form1[0].Section11[0].#field[41] - I don't know
    LAST_CONTACT_1: "9782", // form1[0].Section11[0].From_Datefield_Name_2[2] - sect11Entry1_b_neighboMonthLasContact
    LAST_CONTACT_ESTIMATE_1: "9781", // form1[0].Section11[0].#field[43] - Estimate
    // Entry 1 - Physical address fields
    PHYSICAL_STREET_1: "9780", // form1[0].Section11[0].TextField11[13] - sect11Entry1_a_Street
    PHYSICAL_CITY_1: "9779", // form1[0].Section11[0].TextField11[14] - sect11Entry1_a_City
    PHYSICAL_STATE_1: "9778", // form1[0].Section11[0].School6_State[2] - sect11Entry1State
    PHYSICAL_COUNTRY_1: "9777", // form1[0].Section11[0].DropDownList4[0] - Akrotiri Sovereign Base
    PHYSICAL_ADDRESS_ALT_1: "9776", // form1[0].Section11[0].TextField11[15] - sect11Entry1_b_Street
    APO_FPO_ADDRESS_1: "9775", // form1[0].Section11[0].TextField11[16] - sect11Entry1_b_APO
    APO_FPO_STATE_1: "9774", // form1[0].Section11[0].School6_State[3] - APO/FPO America
    APO_FPO_ZIP_1: "9773", // form1[0].Section11[0].TextField11[17] - sect11Entry1_b_1Zip
    PHYSICAL_ZIP_1: "9772", // form1[0].Section11[0].TextField11[18] - sect11Entry1_a_Zip
    PHYSICAL_NEIGHBOR_STREET_1: "9771", // form1[0].Section11[0].TextField11[19] - sect11Entry1_a_nieghborAStreet
    PHYSICAL_NEIGHBOR_CITY_1: "9770", // form1[0].Section11[0].TextField11[20] - sect11Entry1_a_nieghborACity
    PHYSICAL_NEIGHBOR_STATE_1: "9769", // form1[0].Section11[0].School6_State[4] - sect11Entry1_a_NeighborState
    PHYSICAL_NEIGHBOR_COUNTRY_1: "9768", // form1[0].Section11[0].DropDownList4[1] - Argentina
    PHYSICAL_NEIGHBOR_ZIP_1: "9767", // form1[0].Section11[0].TextField11[21] - sect11Entry1_a_nieghborAZi
    // Entry 1 - Address type radio buttons
    ADDRESS_TYPE_RADIO_1: "17201", // form1[0].Section11[0].RadioButtonList[1] - NO
    PHYSICAL_ADDRESS_FULL_1: "9764", // form1[0].Section11[0].TextField11[22] - sect11Entry1_b_AddressAPO/FPO
    APO_FPO_FULL_1: "9763", // form1[0].Section11[0].TextField11[23] - sect11Entry1_b_APO
    APO_FPO_STATE_ALT_1: "9762", // form1[0].Section11[0].School6_State[5] - APO/FPO Pacific
    APO_FPO_ZIP_ALT_1: "9761", // form1[0].Section11[0].TextField11[24] - sect11Entry1_b_ZipCode
    RESIDENCE_TYPE_RADIO_ALT_1: "17202", // form1[0].Section11[0].RadioButtonList[2] - YES
    // ============================================================================
    // ENTRY 2 FIELD IDS (Section11-2[0]) - CORRECTED FROM section-11.json
    // ============================================================================
    // Entry 2 - Phone fields (contact person)
    CONTACT_PHONE_1_2: "9895", // form1[0].Section11-2[0].p3-t68[0] - sect11Entry2Phone1
    CONTACT_PHONE_EXT_1_2: "9894", // form1[0].Section11-2[0].TextField11[0] - sect11Entry2Extension1
    CONTACT_PHONE_INTL_1_2: "9893", // form1[0].Section11-2[0].#field[4] - International or DSN phone
    DONT_KNOW_CONTACT_2: "9892", // form1[0].Section11-2[0].#field[5] - I don't know
    CONTACT_PHONE_2_2: "9891", // form1[0].Section11-2[0].p3-t68[1] - sect11Entry2Phone2
    CONTACT_PHONE_EXT_2_2: "9890", // form1[0].Section11-2[0].TextField11[1] - sect11Entry2Extension2
    CONTACT_PHONE_3_2: "9889", // form1[0].Section11-2[0].p3-t68[2] - sect11Entry2Phone3
    CONTACT_PHONE_EXT_3_2: "9888", // form1[0].Section11-2[0].TextField11[2] - sect11Entry2Extension3
    CONTACT_PHONE_INTL_2_2: "9887", // form1[0].Section11-2[0].#field[10] - International or DSN phone
    CONTACT_PHONE_INTL_3_2: "9885", // form1[0].Section11-2[0].#field[12] - International or DSN phone
    // Entry 2 - Date fields
    FROM_DATE_2: "9883", // form1[0].Section11-2[0].From_Datefield_Name_2[0] - sect11Entry2fromDate
    FROM_DATE_ESTIMATE_2: "9882", // form1[0].Section11-2[0].#field[15] - Estimate
    TO_DATE_2: "9881", // form1[0].Section11-2[0].From_Datefield_Name_2[1] - sect11Entry2ToDate
    PRESENT_2: "9880", // form1[0].Section11-2[0].#field[17] - Present
    TO_DATE_ESTIMATE_2: "9879", // form1[0].Section11-2[0].#field[18] - Estimate
    // Entry 2 - Residence type
    RESIDENCE_TYPE_2: "17197", // form1[0].Section11-2[0].RadioButtonList[0]
    RESIDENCE_TYPE_OTHER_2: "9874", // form1[0].Section11-2[0].TextField12[0] - sect11Entry2OtherExplaination
    // Entry 2 - Main address fields
    STREET_ADDRESS_2: "9873", // form1[0].Section11-2[0].TextField11[3] - sect11Entry2Street
    CITY_2: "9872", // form1[0].Section11-2[0].TextField11[4] - sect11Entry2City
    STATE_2: "9871", // form1[0].Section11-2[0].School6_State[0] - sect11Entry2State
    COUNTRY_2: "9870", // form1[0].Section11-2[0].DropDownList5[0] - Afghanistan
    ZIP_CODE_2: "9869", // form1[0].Section11-2[0].TextField11[5] - sect11Entry2Zip
    // Entry 2 - Contact person names
    CONTACT_MIDDLE_NAME_2: "9868", // form1[0].Section11-2[0].TextField11[6] - sect11Entry2MName
    CONTACT_LAST_NAME_2: "9867", // form1[0].Section11-2[0].TextField11[7] - sect11Entry2LName
    CONTACT_FIRST_NAME_2: "9866", // form1[0].Section11-2[0].TextField11[8] - sect11Entry2FName
    CONTACT_SUFFIX_2: "9865", // form1[0].Section11-2[0].suffix[0] - sect11Entry2Suffix
    // Entry 2 - Relationship checkboxes
    RELATIONSHIP_NEIGHBOR_2: "9864", // form1[0].Section11-2[0].#field[29] - Neighbor
    RELATIONSHIP_FRIEND_2: "9863", // form1[0].Section11-2[0].#field[30] - Friend
    RELATIONSHIP_LANDLORD_2: "9862", // form1[0].Section11-2[0].#field[31] - Landlord
    RELATIONSHIP_BUSINESS_2: "9861", // form1[0].Section11-2[0].#field[32] - Business Associate
    RELATIONSHIP_OTHER_2: "9860", // form1[0].Section11-2[0].#field[33] - Other
    RELATIONSHIP_OTHER_EXPLAIN_2: "9859", // form1[0].Section11-2[0].TextField11[9] - E2OtherExplainRelation
    // Entry 2 - Contact person address
    CONTACT_STREET_2: "9858", // form1[0].Section11-2[0].TextField11[10] - sect11Entry2ContactAddress
    CONTACT_CITY_2: "9857", // form1[0].Section11-2[0].TextField11[11] - sect11Entry2ContactCity
    CONTACT_STATE_2: "9856", // form1[0].Section11-2[0].School6_State[1] - sect11Entry2State
    CONTACT_COUNTRY_2: "9855", // form1[0].Section11-2[0].DropDownList3[0] - Afghanistan
    CONTACT_ZIP_2: "9854", // form1[0].Section11-2[0].TextField11[12] - sect11Entry2Zip
    CONTACT_EMAIL_2: "9853", // form1[0].Section11-2[0].p3-t68[3] - sect11Entry2ContactEmail
    CONTACT_EMAIL_UNKNOWN_2: "9852", // form1[0].Section11-2[0].#field[41] - I don't know
    LAST_CONTACT_2: "9851", // form1[0].Section11-2[0].From_Datefield_Name_2[2] - sect11Entry2LastContact
    LAST_CONTACT_ESTIMATE_2: "9850", // form1[0].Section11-2[0].#field[43] - Estimate
    // Entry 2 - Physical address fields
    PHYSICAL_STREET_2: "9849", // form1[0].Section11-2[0].TextField11[13] - sect11Entry2_a_Street
    PHYSICAL_CITY_2: "9848", // form1[0].Section11-2[0].TextField11[14] - sect11Entry2_a_City
    PHYSICAL_STATE_2: "9847", // form1[0].Section11-2[0].School6_State[2] - sect11Entry2_a_State
    PHYSICAL_COUNTRY_2: "9846", // form1[0].Section11-2[0].DropDownList4[0] - Akrotiri Sovereign Base
    PHYSICAL_ADDRESS_ALT_2: "9845", // form1[0].Section11-2[0].TextField11[15] - sect11Entry2_b_Address
    APO_FPO_ADDRESS_2: "9844", // form1[0].Section11-2[0].TextField11[16] - sect11Entry2_b_APO
    APO_FPO_STATE_2: "9843", // form1[0].Section11-2[0].School6_State[3] - APO/FPO America
    APO_FPO_ZIP_2: "9842", // form1[0].Section11-2[0].TextField11[17] - sect11Entry2_b_Zip
    PHYSICAL_ZIP_2: "9841", // form1[0].Section11-2[0].TextField11[18] - sect11Entry2_a_Zip
    PHYSICAL_ALT_STREET_2: "9840", // form1[0].Section11-2[0].TextField11[19] - sect11Entry2_a_Street
    PHYSICAL_ALT_CITY_2: "9839", // form1[0].Section11-2[0].TextField11[20] - sect11Entry2_a_City
    PHYSICAL_ALT_STATE_2: "9838", // form1[0].Section11-2[0].School6_State[4] - sect11Entry2_a_
    PHYSICAL_ALT_COUNTRY_2: "9837", // form1[0].Section11-2[0].DropDownList4[1] - Albania
    PHYSICAL_ALT_ZIP_2: "9836", // form1[0].Section11-2[0].TextField11[21] - sect11Entry2_a_Zip
    // Entry 2 - Address type radio buttons
    ADDRESS_TYPE_RADIO_2: "17198", // form1[0].Section11-2[0].RadioButtonList[1] - NO
    PHYSICAL_ADDRESS_FULL_2: "9833", // form1[0].Section11-2[0].TextField11[22] - sect11Entry2_b_Address
    APO_FPO_FULL_2: "9832", // form1[0].Section11-2[0].TextField11[23] - sect11Entry2_b_APO
    APO_FPO_STATE_ALT_2: "9831", // form1[0].Section11-2[0].School6_State[5] - APO/FPO America
    APO_FPO_ZIP_ALT_2: "9830", // form1[0].Section11-2[0].TextField11[24] - sect11Entry2_b_ZipCode
    RESIDENCE_TYPE_RADIO_ALT_2: "17199", // form1[0].Section11-2[0].RadioButtonList[2] - YES
    // ============================================================================
    // ENTRY 3 FIELD IDS (Section11-3[0]) - CORRECTED FROM section-11.json
    // ============================================================================
    // Entry 3 - Phone fields (contact person)
    CONTACT_PHONE_1_3: "9900", // form1[0].Section11-3[0].p3-t68[0] - sect11Entry3Phone1
    CONTACT_PHONE_EXT_1_3: "9899", // form1[0].Section11-3[0].TextField11[0] - sect11Entry3Extension1
    CONTACT_PHONE_INTL_1_3: "9898", // form1[0].Section11-3[0].#field[4] - International or DSN phone
    DONT_KNOW_CONTACT_3: "9897", // form1[0].Section11-3[0].#field[5] - I don't know
    CONTACT_PHONE_2_3: "9965", // form1[0].Section11-3[0].p3-t68[1] - E3Phone2
    CONTACT_PHONE_EXT_2_3: "9964", // form1[0].Section11-3[0].TextField11[1] - sect11Entry3Extension2
    CONTACT_PHONE_3_3: "9963", // form1[0].Section11-3[0].p3-t68[2] - sect11Entry3Phone3
    CONTACT_PHONE_EXT_3_3: "9962", // form1[0].Section11-3[0].TextField11[2] - sect11Entry3Extionsion3
    CONTACT_PHONE_INTL_2_3: "9961", // form1[0].Section11-3[0].#field[10] - International or DSN phone
    CONTACT_PHONE_INTL_3_3: "9959", // form1[0].Section11-3[0].#field[12] - International or DSN phone
    // Entry 3 - Date fields
    FROM_DATE_3: "9957", // form1[0].Section11-3[0].From_Datefield_Name_2[0] - sect11Entry3FromDate
    FROM_DATE_ESTIMATE_3: "9956", // form1[0].Section11-3[0].#field[15] - Estimate
    TO_DATE_3: "9955", // form1[0].Section11-3[0].From_Datefield_Name_2[1] - sect11Entry3\ToDate
    PRESENT_3: "9954", // form1[0].Section11-3[0].#field[17] - Present
    TO_DATE_ESTIMATE_3: "9953", // form1[0].Section11-3[0].#field[18] - Estimate
    // Entry 3 - Residence type
    RESIDENCE_TYPE_3: "17194", // form1[0].Section11-3[0].RadioButtonList[0]
    RESIDENCE_TYPE_OTHER_3: "9948", // form1[0].Section11-3[0].TextField12[0] - sect11Entry3OtherExplaination
    // Entry 3 - Main address fields
    STREET_ADDRESS_3: "9947", // form1[0].Section11-3[0].TextField11[3] - sect11Entry3StreetAddress
    CITY_3: "9946", // form1[0].Section11-3[0].TextField11[4] - sect11Entry3City
    STATE_3: "9945", // form1[0].Section11-3[0].School6_State[0] - sect11Entry3State
    COUNTRY_3: "9944", // form1[0].Section11-3[0].DropDownList5[0] - Albania
    ZIP_CODE_3: "9943", // form1[0].Section11-3[0].TextField11[5] - sect11Entry3Zipcode
    // Entry 3 - Contact person names
    CONTACT_MIDDLE_NAME_3: "9942", // form1[0].Section11-3[0].TextField11[6] - sect11Entry3NeightborMName
    CONTACT_LAST_NAME_3: "9941", // form1[0].Section11-3[0].TextField11[7] - sect11Entry3NeightborLName
    CONTACT_FIRST_NAME_3: "9940", // form1[0].Section11-3[0].TextField11[8] - sect11Entry3NeighborFName
    CONTACT_SUFFIX_3: "9939", // form1[0].Section11-3[0].suffix[0] - sect11Entry3Suffix
    // Entry 3 - Relationship checkboxes
    RELATIONSHIP_NEIGHBOR_3: "9938", // form1[0].Section11-3[0].#field[29] - Neighbor
    RELATIONSHIP_FRIEND_3: "9937", // form1[0].Section11-3[0].#field[30] - Friend
    RELATIONSHIP_LANDLORD_3: "9936", // form1[0].Section11-3[0].#field[31] - Landlord
    RELATIONSHIP_BUSINESS_3: "9935", // form1[0].Section11-3[0].#field[32] - Business Associate
    RELATIONSHIP_OTHER_3: "9934", // form1[0].Section11-3[0].#field[33] - Other
    RELATIONSHIP_OTHER_EXPLAIN_3: "9933", // form1[0].Section11-3[0].TextField11[9] - sect11Entry3OtherRelationship
    // Entry 3 - Contact person address
    CONTACT_STREET_3: "9932", // form1[0].Section11-3[0].TextField11[10] - sect11Entry3ContactStreet
    CONTACT_CITY_3: "9931", // form1[0].Section11-3[0].TextField11[11] - sect11Entry3ContactCity
    CONTACT_STATE_3: "9930", // form1[0].Section11-3[0].School6_State[1] - sect11Entry3State
    CONTACT_COUNTRY_3: "9929", // form1[0].Section11-3[0].DropDownList3[0] - Andorra
    CONTACT_ZIP_3: "9928", // form1[0].Section11-3[0].TextField11[12] - sect11Entry3ZipCode
    CONTACT_EMAIL_3: "9927", // form1[0].Section11-3[0].p3-t68[3] - sect11Entry3email
    CONTACT_EMAIL_UNKNOWN_3: "9926", // form1[0].Section11-3[0].#field[41] - I don't know
    LAST_CONTACT_3: "9925", // form1[0].Section11-3[0].From_Datefield_Name_2[2] - sect11Entry3LastContact
    LAST_CONTACT_ESTIMATE_3: "9924", // form1[0].Section11-3[0].#field[43] - Estimate
    // Entry 3 - Physical address fields
    PHYSICAL_STREET_3: "9923", // form1[0].Section11-3[0].TextField11[13] - sect11Entry3_a_Address
    PHYSICAL_CITY_3: "9922", // form1[0].Section11-3[0].TextField11[14] - sect11Entry3_a_City
    PHYSICAL_STATE_3: "9921", // form1[0].Section11-3[0].School6_State[2] - sect11Entry3_a_State
    PHYSICAL_COUNTRY_3: "9920", // form1[0].Section11-3[0].DropDownList4[0] - Algeria
    PHYSICAL_ADDRESS_ALT_3: "9919", // form1[0].Section11-3[0].TextField11[15] - sect11Entry3_b_Address
    APO_FPO_ADDRESS_3: "9918", // form1[0].Section11-3[0].TextField11[16] - sect11Entry3_b_APO
    APO_FPO_STATE_3: "9917", // form1[0].Section11-3[0].School6_State[3] - APO/FPO Pacific
    APO_FPO_ZIP_3: "9916", // form1[0].Section11-3[0].TextField11[17] - sect11Entry3_b_Zipcopde
    PHYSICAL_ZIP_3: "9915", // form1[0].Section11-3[0].TextField11[18] - sect11Entry3_a_Zip
    PHYSICAL_ALT_STREET_3: "9914", // form1[0].Section11-3[0].TextField11[19] - sect11Entry3_a_Street
    PHYSICAL_ALT_CITY_3: "9913", // form1[0].Section11-3[0].TextField11[20] - sect11Entry3_a_City
    PHYSICAL_ALT_STATE_3: "9912", // form1[0].Section11-3[0].School6_State[4] - sect11Entry3_a_State
    PHYSICAL_ALT_COUNTRY_3: "9911", // form1[0].Section11-3[0].DropDownList4[1] - Armenia
    PHYSICAL_ALT_ZIP_3: "9910", // form1[0].Section11-3[0].TextField11[21] - sect11Entry3_a_Zipcode
    // Entry 3 - Address type radio buttons
    ADDRESS_TYPE_RADIO_3: "17195", // form1[0].Section11-3[0].RadioButtonList[1] - NO
    PHYSICAL_ADDRESS_FULL_3: "9907", // form1[0].Section11-3[0].TextField11[22] - sect11Entry3_b_3Address
    APO_FPO_FULL_3: "9906", // form1[0].Section11-3[0].TextField11[23] - sect11Entry3_b_Address
    APO_FPO_STATE_ALT_3: "9905", // form1[0].Section11-3[0].School6_State[5] - APO/FPO Pacific
    APO_FPO_ZIP_ALT_3: "9904", // form1[0].Section11-3[0].TextField11[24] - sect11Entry3_b_Zip
    RESIDENCE_TYPE_RADIO_ALT_3: "17196", // form1[0].Section11-3[0].RadioButtonList[2] - YES
    // ============================================================================
    // ENTRY 4 FIELD IDS (Section11-4[0]) - CORRECTED FROM section-11.json
    // ============================================================================
    // Entry 4 - Phone fields (contact person)
    CONTACT_PHONE_1_4: "10029", // form1[0].Section11-4[0].p3-t68[0] - sect11Entry4Phone1
    CONTACT_PHONE_EXT_1_4: "10028", // form1[0].Section11-4[0].TextField11[0] - sect11Entry4Extension1
    CONTACT_PHONE_INTL_1_4: "10027", // form1[0].Section11-4[0].#field[4] - International or DSN phone
    DONT_KNOW_CONTACT_4: "10026", // form1[0].Section11-4[0].#field[5] - I don't know
    CONTACT_PHONE_2_4: "10025", // form1[0].Section11-4[0].p3-t68[1] - sect11Entry4Phone2
    CONTACT_PHONE_EXT_2_4: "10024", // form1[0].Section11-4[0].TextField11[1] - Extension2
    CONTACT_PHONE_3_4: "10023", // form1[0].Section11-4[0].p3-t68[2] - sect11Entry4Phone3
    CONTACT_PHONE_EXT_3_4: "10022", // form1[0].Section11-4[0].TextField11[2] - sect11Entry4Extension3
    CONTACT_PHONE_INTL_2_4: "10021", // form1[0].Section11-4[0].#field[10] - International or DSN phone
    CONTACT_PHONE_INTL_3_4: "10019", // form1[0].Section11-4[0].#field[12] - International or DSN phone
    // Entry 4 - Date fields
    FROM_DATE_4: "10017", // form1[0].Section11-4[0].From_Datefield_Name_2[0] - sect11Entry4FromDate
    FROM_DATE_ESTIMATE_4: "10016", // form1[0].Section11-4[0].#field[15] - Estimate
    TO_DATE_4: "10015", // form1[0].Section11-4[0].From_Datefield_Name_2[1] - sect11Entry4ToDate
    PRESENT_4: "10014", // form1[0].Section11-4[0].#field[17] - Present
    TO_DATE_ESTIMATE_4: "10013", // form1[0].Section11-4[0].#field[18] - Estimate
    // Entry 4 - Residence type and other
    RESIDENCE_TYPE_OTHER_4: "10012", // form1[0].Section11-4[0].TextField12[0] - sect11Entry4OtherExplaination
    // Entry 4 - Main address fields
    STREET_ADDRESS_4: "10011", // form1[0].Section11-4[0].TextField11[3] - sect11Entry4Street
    CITY_4: "10010", // form1[0].Section11-4[0].TextField11[4] - sect11Entry4City
    STATE_4: "10009", // form1[0].Section11-4[0].School6_State[0] - sect11Entry4State
    COUNTRY_4: "10008", // form1[0].Section11-4[0].DropDownList5[0] - USA
    ZIP_CODE_4: "10007", // form1[0].Section11-4[0].TextField11[5] - sect11Entry4Zip
    // Entry 4 - Contact person names
    CONTACT_MIDDLE_NAME_4: "10006", // form1[0].Section11-4[0].TextField11[6] - sect11Entry4MName
    CONTACT_LAST_NAME_4: "10005", // form1[0].Section11-4[0].TextField11[7] - sect11Entry4LName
    CONTACT_FIRST_NAME_4: "10004", // form1[0].Section11-4[0].TextField11[8] - sect11Entry4FName
    CONTACT_SUFFIX_4: "10003", // form1[0].Section11-4[0].suffix[0] - sect11Entry4Suffix
    // Entry 4 - Relationship checkboxes
    RELATIONSHIP_NEIGHBOR_4: "10002", // form1[0].Section11-4[0].#field[29] - Neighbor
    RELATIONSHIP_FRIEND_4: "10001", // form1[0].Section11-4[0].#field[30] - Friend
    RELATIONSHIP_LANDLORD_4: "10000", // form1[0].Section11-4[0].#field[31] - Landlord
    RELATIONSHIP_BUSINESS_4: "9999", // form1[0].Section11-4[0].#field[32] - Business Associate
    RELATIONSHIP_OTHER_4: "9998", // form1[0].Section11-4[0].#field[33] - Other
    RELATIONSHIP_OTHER_EXPLAIN_4: "9997", // form1[0].Section11-4[0].TextField11[9] - OtherRelationship
    // Entry 4 - Contact person address
    CONTACT_STREET_4: "9996", // form1[0].Section11-4[0].TextField11[10] - sect11Entry4ContactStreet
    CONTACT_CITY_4: "9995", // form1[0].Section11-4[0].TextField11[11] - sect11Entry4ContactCity
    CONTACT_STATE_4: "9994", // form1[0].Section11-4[0].School6_State[1] - sect11Entry4State
    CONTACT_COUNTRY_4: "9993", // form1[0].Section11-4[0].DropDownList3[0] - Algeria
    CONTACT_ZIP_4: "9992", // form1[0].Section11-4[0].TextField11[12] - sect11Entry4ContactZip
    CONTACT_EMAIL_4: "9991", // form1[0].Section11-4[0].p3-t68[3] - sect11Entry4ContactEmail
    CONTACT_EMAIL_UNKNOWN_4: "9990", // form1[0].Section11-4[0].#field[41] - I don't know
    LAST_CONTACT_4: "9989", // form1[0].Section11-4[0].From_Datefield_Name_2[2] - sect11Entry4LastContact
    LAST_CONTACT_ESTIMATE_4: "9988", // form1[0].Section11-4[0].#field[43] - Estimate
    // Entry 4 - Physical address fields
    PHYSICAL_STREET_4: "9987", // form1[0].Section11-4[0].TextField11[13] - sect11Entry4_a_address
    PHYSICAL_CITY_4: "9986", // form1[0].Section11-4[0].TextField11[14] - sect11Entry4_a_City
    PHYSICAL_STATE_4: "9985", // form1[0].Section11-4[0].School6_State[2] - sect11Entry4_a_State
    PHYSICAL_COUNTRY_4: "9984", // form1[0].Section11-4[0].DropDownList4[0] - Algeria
    PHYSICAL_ADDRESS_ALT_4: "9983", // form1[0].Section11-4[0].TextField11[15] - sect11Entry4_b_Address
    APO_FPO_ADDRESS_4: "9982", // form1[0].Section11-4[0].TextField11[16] - sect11Entry4_b_APO
    APO_FPO_STATE_4: "9981", // form1[0].Section11-4[0].School6_State[3] - APO/FPO Pacific
    APO_FPO_ZIP_4: "9980", // form1[0].Section11-4[0].TextField11[17] - sect11Entry4_b_3Zip
    PHYSICAL_ZIP_4: "9979", // form1[0].Section11-4[0].TextField11[18] - sect11Entry4_a_Zipcode
    PHYSICAL_ALT_STREET_4: "9978", // form1[0].Section11-4[0].TextField11[19] - sect11Entry4_a_Address
    PHYSICAL_ALT_CITY_4: "9977", // form1[0].Section11-4[0].TextField11[20] - sect11Entry4_a_City
    PHYSICAL_ALT_STATE_4: "9976", // form1[0].Section11-4[0].School6_State[4] - sect11Entry4_a_State
    PHYSICAL_ALT_COUNTRY_4: "9975", // form1[0].Section11-4[0].DropDownList4[1] - Algeria
    PHYSICAL_ALT_ZIP_4: "9974", // form1[0].Section11-4[0].TextField11[21] - sect11Entry4_a_Zip
    // Entry 4 - Address type radio buttons
    RESIDENCE_TYPE_4: "17191", // form1[0].Section11-4[0].RadioButtonList[0] - YES
    PHYSICAL_ADDRESS_FULL_4: "9971", // form1[0].Section11-4[0].TextField11[22] - sect11Entry4_b_Address
    APO_FPO_FULL_4: "9970", // form1[0].Section11-4[0].TextField11[23] - sect11Entry4_b_APO
    APO_FPO_STATE_ALT_4: "9969", // form1[0].Section11-4[0].School6_State[5] - APO/FPO Pacific
    APO_FPO_ZIP_ALT_4: "9968", // form1[0].Section11-4[0].TextField11[24] - sect11Entry4_b_Zip
    ADDRESS_TYPE_RADIO_4: "17192", // form1[0].Section11-4[0].RadioButtonList[1] - YES
    RESIDENCE_TYPE_RADIO_ALT_4: "17193", // form1[0].Section11-4[0].RadioButtonList[2]
};
/**
 * Field name mappings for Section 11 (Where You Have Lived)
 * Full field paths from section-11.json
 */
exports.SECTION11_FIELD_NAMES = {
    // Entry 1 - Main address fields
    STREET_ADDRESS_1: "form1[0].Section11[0].TextField11[3]",
    CITY_1: "form1[0].Section11[0].TextField11[4]",
    STATE_1: "form1[0].Section11[0].School6_State[0]",
    COUNTRY_1: "form1[0].Section11[0].DropDownList5[0]",
    ZIP_CODE_1: "form1[0].Section11[0].TextField11[5]",
    // Entry 1 - Date fields
    FROM_DATE_1: "form1[0].Section11[0].From_Datefield_Name_2[0]",
    FROM_DATE_ESTIMATE_1: "form1[0].Section11[0].#field[15]",
    TO_DATE_1: "form1[0].Section11[0].From_Datefield_Name_2[1]",
    TO_DATE_ESTIMATE_1: "form1[0].Section11[0].#field[18]",
    PRESENT_1: "form1[0].Section11[0].#field[17]",
    // Entry 1 - Residence type
    RESIDENCE_TYPE_1: "form1[0].Section11[0].RadioButtonList[0]",
    RESIDENCE_TYPE_OTHER_1: "form1[0].Section11[0].TextField12[0]",
    // Entry 1 - Contact person - CORRECTED MAPPINGS FROM JSON
    CONTACT_LAST_NAME_1: "form1[0].Section11[0].TextField11[7]",
    CONTACT_FIRST_NAME_1: "form1[0].Section11[0].TextField11[8]",
    CONTACT_MIDDLE_NAME_1: "form1[0].Section11[0].TextField11[6]",
    // Entry 1 - Relationship checkboxes
    RELATIONSHIP_NEIGHBOR_1: "form1[0].Section11[0].#field[29]",
    RELATIONSHIP_FRIEND_1: "form1[0].Section11[0].#field[30]",
    RELATIONSHIP_LANDLORD_1: "form1[0].Section11[0].#field[31]",
    RELATIONSHIP_BUSINESS_1: "form1[0].Section11[0].#field[32]",
    RELATIONSHIP_OTHER_1: "form1[0].Section11[0].#field[33]",
    RELATIONSHIP_OTHER_EXPLAIN_1: "form1[0].Section11[0].TextField11[9]",
    // Entry 1 - Contact phone numbers
    EVENING_PHONE_1: "form1[0].Section11[0].p3-t68[0]",
    EVENING_PHONE_EXT_1: "form1[0].Section11[0].TextField11[0]",
    EVENING_PHONE_INTL_1: "form1[0].Section11[0].#field[4]",
    DAYTIME_PHONE_1: "form1[0].Section11[0].p3-t68[1]",
    DAYTIME_PHONE_EXT_1: "form1[0].Section11[0].TextField11[1]",
    DAYTIME_PHONE_INTL_1: "form1[0].Section11[0].#field[10]",
    MOBILE_PHONE_1: "form1[0].Section11[0].p3-t68[2]",
    MOBILE_PHONE_EXT_1: "form1[0].Section11[0].TextField11[2]",
    MOBILE_PHONE_INTL_1: "form1[0].Section11[0].#field[12]",
    // Entry 1 - Contact availability
    DONT_KNOW_CONTACT_1: "form1[0].Section11[0].#field[5]",
    EMAIL_1: "form1[0].Section11[0].p3-t68[3]", // Email field for contact person
    // Entry 1 - Missing high-priority field names
    NEIGHBOR_LAST_NAME_1: "form1[0].Section11[0].TextField11[7]",
    NEIGHBOR_FIRST_NAME_1: "form1[0].Section11[0].TextField11[8]",
    NEIGHBOR_MIDDLE_NAME_1: "form1[0].Section11[0].TextField11[6]",
    NEIGHBOR_PHONE_1: "form1[0].Section11[0].p3-t68[0]",
    NEIGHBOR_PHONE_2: "form1[0].Section11[0].p3-t68[1]",
    NEIGHBOR_PHONE_3: "form1[0].Section11[0].p3-t68[2]",
    NEIGHBOR_ADDRESS_1: "form1[0].Section11[0].TextField11[11]",
    NEIGHBOR_STATE_1: "form1[0].Section11[0].School6_State[1]",
    NEIGHBOR_ZIP_1: "form1[0].Section11[0].TextField11[12]",
    NEIGHBOR_EMAIL_1: "form1[0].Section11[0].p3-t68[3]",
    LAST_CONTACT_1: "form1[0].Section11[0].From_Datefield_Name_2[2]",
    APO_FPO_ADDRESS_1: "form1[0].Section11[0].TextField11[16]",
    PHYSICAL_ADDRESS_1: "form1[0].Section11[0].TextField11[22]",
    // ============================================================================
    // ENTRY 2 FIELD NAMES (Section11-2[0])
    // ============================================================================
    // Entry 2 - Main address fields
    STREET_ADDRESS_2: "form1[0].Section11-2[0].TextField11[3]",
    CITY_2: "form1[0].Section11-2[0].TextField11[4]",
    STATE_2: "form1[0].Section11-2[0].School6_State[0]",
    COUNTRY_2: "form1[0].Section11-2[0].DropDownList5[0]",
    ZIP_CODE_2: "form1[0].Section11-2[0].TextField11[5]",
    // Entry 2 - Date fields
    FROM_DATE_2: "form1[0].Section11-2[0].From_Datefield_Name_2[0]",
    FROM_DATE_ESTIMATE_2: "form1[0].Section11-2[0].#field[15]",
    TO_DATE_2: "form1[0].Section11-2[0].From_Datefield_Name_2[1]",
    TO_DATE_ESTIMATE_2: "form1[0].Section11-2[0].#field[18]",
    PRESENT_2: "form1[0].Section11-2[0].#field[17]",
    // Entry 2 - Residence type
    RESIDENCE_TYPE_2: "form1[0].Section11-2[0].RadioButtonList[0]",
    RESIDENCE_TYPE_OTHER_2: "form1[0].Section11-2[0].TextField12[0]",
    // Entry 2 - Contact person - CORRECTED MAPPINGS FROM JSON
    CONTACT_LAST_NAME_2: "form1[0].Section11-2[0].TextField11[7]",
    CONTACT_FIRST_NAME_2: "form1[0].Section11-2[0].TextField11[8]",
    CONTACT_MIDDLE_NAME_2: "form1[0].Section11-2[0].TextField11[6]",
    // Entry 2 - Relationship checkboxes
    RELATIONSHIP_NEIGHBOR_2: "form1[0].Section11-2[0].#field[29]",
    RELATIONSHIP_FRIEND_2: "form1[0].Section11-2[0].#field[30]",
    RELATIONSHIP_LANDLORD_2: "form1[0].Section11-2[0].#field[31]",
    RELATIONSHIP_BUSINESS_2: "form1[0].Section11-2[0].#field[32]",
    RELATIONSHIP_OTHER_2: "form1[0].Section11-2[0].#field[33]",
    RELATIONSHIP_OTHER_EXPLAIN_2: "form1[0].Section11-2[0].TextField11[9]",
    // Entry 2 - Contact phone numbers
    EVENING_PHONE_2: "form1[0].Section11-2[0].p3-t68[0]",
    EVENING_PHONE_EXT_2: "form1[0].Section11-2[0].TextField11[0]",
    EVENING_PHONE_INTL_2: "form1[0].Section11-2[0].#field[4]",
    DAYTIME_PHONE_2: "form1[0].Section11-2[0].p3-t68[1]",
    DAYTIME_PHONE_EXT_2: "form1[0].Section11-2[0].TextField11[1]",
    DAYTIME_PHONE_INTL_2: "form1[0].Section11-2[0].#field[10]",
    MOBILE_PHONE_2: "form1[0].Section11-2[0].p3-t68[2]",
    MOBILE_PHONE_EXT_2: "form1[0].Section11-2[0].TextField11[2]",
    MOBILE_PHONE_INTL_2: "form1[0].Section11-2[0].#field[12]",
    // Entry 2 - Contact availability
    DONT_KNOW_CONTACT_2: "form1[0].Section11-2[0].#field[5]",
    EMAIL_2: "form1[0].Section11-2[0].p3-t68[3]",
    // Entry 2 - Missing high-priority field names
    CONTACT_ADDRESS_2: "form1[0].Section11-2[0].TextField11[10]",
    CONTACT_CITY_2: "form1[0].Section11-2[0].TextField11[11]",
    CONTACT_EMAIL_2: "form1[0].Section11-2[0].p3-t68[3]",
    LAST_CONTACT_2: "form1[0].Section11-2[0].From_Datefield_Name_2[2]",
    APO_FPO_ADDRESS_2: "form1[0].Section11-2[0].TextField11[16]",
    PHYSICAL_ADDRESS_2: "form1[0].Section11-2[0].TextField11[23]",
    // ============================================================================
    // ENTRY 3 FIELD NAMES (Section11-3[0])
    // ============================================================================
    // Entry 3 - Main address fields
    STREET_ADDRESS_3: "form1[0].Section11-3[0].TextField11[3]",
    CITY_3: "form1[0].Section11-3[0].TextField11[4]",
    STATE_3: "form1[0].Section11-3[0].School6_State[0]",
    COUNTRY_3: "form1[0].Section11-3[0].DropDownList5[0]",
    ZIP_CODE_3: "form1[0].Section11-3[0].TextField11[5]",
    // Entry 3 - Date fields
    FROM_DATE_3: "form1[0].Section11-3[0].From_Datefield_Name_2[0]",
    FROM_DATE_ESTIMATE_3: "form1[0].Section11-3[0].#field[15]",
    TO_DATE_3: "form1[0].Section11-3[0].From_Datefield_Name_2[1]",
    TO_DATE_ESTIMATE_3: "form1[0].Section11-3[0].#field[18]",
    PRESENT_3: "form1[0].Section11-3[0].#field[17]",
    // Entry 3 - Residence type
    RESIDENCE_TYPE_3: "form1[0].Section11-3[0].RadioButtonList[0]",
    RESIDENCE_TYPE_OTHER_3: "form1[0].Section11-3[0].TextField12[0]",
    // Entry 3 - Contact person - CORRECTED MAPPINGS FROM JSON
    CONTACT_LAST_NAME_3: "form1[0].Section11-3[0].TextField11[7]",
    CONTACT_FIRST_NAME_3: "form1[0].Section11-3[0].TextField11[8]",
    CONTACT_MIDDLE_NAME_3: "form1[0].Section11-3[0].TextField11[6]",
    // Entry 3 - Relationship checkboxes
    RELATIONSHIP_NEIGHBOR_3: "form1[0].Section11-3[0].#field[29]",
    RELATIONSHIP_FRIEND_3: "form1[0].Section11-3[0].#field[30]",
    RELATIONSHIP_LANDLORD_3: "form1[0].Section11-3[0].#field[31]",
    RELATIONSHIP_BUSINESS_3: "form1[0].Section11-3[0].#field[32]",
    RELATIONSHIP_OTHER_3: "form1[0].Section11-3[0].#field[33]",
    RELATIONSHIP_OTHER_EXPLAIN_3: "form1[0].Section11-3[0].TextField11[9]",
    // Entry 3 - Contact phone numbers
    EVENING_PHONE_3: "form1[0].Section11-3[0].p3-t68[0]",
    EVENING_PHONE_EXT_3: "form1[0].Section11-3[0].TextField11[0]",
    EVENING_PHONE_INTL_3: "form1[0].Section11-3[0].#field[4]",
    DAYTIME_PHONE_3: "form1[0].Section11-3[0].p3-t68[1]",
    DAYTIME_PHONE_EXT_3: "form1[0].Section11-3[0].TextField11[1]",
    DAYTIME_PHONE_INTL_3: "form1[0].Section11-3[0].#field[10]",
    MOBILE_PHONE_3: "form1[0].Section11-3[0].p3-t68[2]",
    MOBILE_PHONE_EXT_3: "form1[0].Section11-3[0].TextField11[2]",
    MOBILE_PHONE_INTL_3: "form1[0].Section11-3[0].#field[12]",
    // Entry 3 - Contact availability
    DONT_KNOW_CONTACT_3: "form1[0].Section11-3[0].#field[5]",
    EMAIL_3: "form1[0].Section11-3[0].p3-t68[3]",
    // Entry 3 - Missing high-priority field names
    NEIGHBOR_FIRST_NAME_3: "form1[0].Section11-3[0].TextField11[8]",
    CONTACT_ADDRESS_3: "form1[0].Section11-3[0].TextField11[10]",
    CONTACT_CITY_3: "form1[0].Section11-3[0].TextField11[11]",
    LAST_CONTACT_3: "form1[0].Section11-3[0].From_Datefield_Name_2[2]",
    APO_FPO_ADDRESS_3: "form1[0].Section11-3[0].TextField11[16]",
    // ============================================================================
    // ENTRY 4 FIELD NAMES (Section11-4[0])
    // ============================================================================
    // Entry 4 - Main address fields
    STREET_ADDRESS_4: "form1[0].Section11-4[0].TextField11[3]",
    CITY_4: "form1[0].Section11-4[0].TextField11[4]",
    STATE_4: "form1[0].Section11-4[0].School6_State[0]",
    COUNTRY_4: "form1[0].Section11-4[0].DropDownList5[0]",
    ZIP_CODE_4: "form1[0].Section11-4[0].TextField11[5]",
    // Entry 4 - Date fields
    FROM_DATE_4: "form1[0].Section11-4[0].From_Datefield_Name_2[0]",
    FROM_DATE_ESTIMATE_4: "form1[0].Section11-4[0].#field[15]",
    TO_DATE_4: "form1[0].Section11-4[0].From_Datefield_Name_2[1]",
    TO_DATE_ESTIMATE_4: "form1[0].Section11-4[0].#field[18]",
    PRESENT_4: "form1[0].Section11-4[0].#field[17]",
    // Entry 4 - Residence type
    RESIDENCE_TYPE_4: "form1[0].Section11-4[0].RadioButtonList[0]",
    RESIDENCE_TYPE_OTHER_4: "form1[0].Section11-4[0].TextField12[0]",
    // Entry 4 - Contact person - CORRECTED MAPPINGS FROM JSON
    CONTACT_LAST_NAME_4: "form1[0].Section11-4[0].TextField11[7]",
    CONTACT_FIRST_NAME_4: "form1[0].Section11-4[0].TextField11[8]",
    CONTACT_MIDDLE_NAME_4: "form1[0].Section11-4[0].TextField11[6]",
    // Entry 4 - Relationship checkboxes
    RELATIONSHIP_NEIGHBOR_4: "form1[0].Section11-4[0].#field[29]",
    RELATIONSHIP_FRIEND_4: "form1[0].Section11-4[0].#field[30]",
    RELATIONSHIP_LANDLORD_4: "form1[0].Section11-4[0].#field[31]",
    RELATIONSHIP_BUSINESS_4: "form1[0].Section11-4[0].#field[32]",
    RELATIONSHIP_OTHER_4: "form1[0].Section11-4[0].#field[33]",
    RELATIONSHIP_OTHER_EXPLAIN_4: "form1[0].Section11-4[0].TextField11[9]",
    // Entry 4 - Contact phone numbers
    EVENING_PHONE_4: "form1[0].Section11-4[0].p3-t68[0]",
    EVENING_PHONE_EXT_4: "form1[0].Section11-4[0].TextField11[0]",
    EVENING_PHONE_INTL_4: "form1[0].Section11-4[0].#field[4]",
    DAYTIME_PHONE_4: "form1[0].Section11-4[0].p3-t68[1]",
    DAYTIME_PHONE_EXT_4: "form1[0].Section11-4[0].TextField11[1]",
    DAYTIME_PHONE_INTL_4: "form1[0].Section11-4[0].#field[10]",
    MOBILE_PHONE_4: "form1[0].Section11-4[0].p3-t68[2]",
    MOBILE_PHONE_EXT_4: "form1[0].Section11-4[0].TextField11[2]",
    MOBILE_PHONE_INTL_4: "form1[0].Section11-4[0].#field[12]",
    // Entry 4 - Contact availability
    DONT_KNOW_CONTACT_4: "form1[0].Section11-4[0].#field[5]",
    EMAIL_4: "form1[0].Section11-4[0].p3-t68[3]",
    // Entry 4 - Missing high-priority field names
    CONTACT_ADDRESS_4: "form1[0].Section11-4[0].TextField11[10]",
    CONTACT_CITY_4: "form1[0].Section11-4[0].TextField11[11]",
    CONTACT_ZIP_4: "form1[0].Section11-4[0].TextField11[12]",
    CONTACT_EMAIL_4: "form1[0].Section11-4[0].p3-t68[3]",
    LAST_CONTACT_4: "form1[0].Section11-4[0].From_Datefield_Name_2[2]",
    APO_FPO_ADDRESS_4: "form1[0].Section11-4[0].TextField11[16]",
    PHYSICAL_ADDRESS_4: "form1[0].Section11-4[0].TextField11[23]",
};
// ============================================================================
// DYNAMIC FIELD MAPPING FUNCTIONS
// ============================================================================
/**
 * Create a field using sections-references data for Section 11
 * THROWS ERROR when field creation fails - no fallbacks to ensure proper implementation
 */
function createSection11Field(entryIndex, fieldType, defaultValue) {
    try {
        const fieldName = (0, section11_field_mapping_1.generateFieldName)(fieldType, entryIndex);
        return (0, sections_references_loader_1.createFieldFromReference)(11, fieldName, defaultValue);
    }
    catch (error) {
        // THROW ERROR: Return information about fields that could not be created
        const errorDetails = {
            section: 11,
            entryIndex,
            fieldType,
            attemptedFieldName: (0, section11_field_mapping_1.generateFieldName)(fieldType, entryIndex),
            originalError: error instanceof Error ? error.message : String(error),
            expectedFieldPattern: `form1[0].Section11${entryIndex === 0 ? '' : `-${entryIndex + 1}`}[0].${fieldType}`,
            availableEntries: [0, 1, 2, 3],
            validEntryIndex: entryIndex >= 0 && entryIndex <= 3
        };
        throw new Error(`❌ SECTION11 FIELD CREATION FAILED: Could not create field "${fieldType}" for entry ${entryIndex}. Details: ${JSON.stringify(errorDetails, null, 2)}`);
    }
}
// ============================================================================
// DROPDOWN OPTIONS
// ============================================================================
/**
 * Residence type options
 */
exports.RESIDENCE_TYPE_OPTIONS = [
    "Own",
    "Rent",
    "Military Housing",
    "Other"
];
/**
 * Mapping from numeric residence type values to human-readable labels
 */
exports.RESIDENCE_TYPE_MAPPING = {
    '1': 'Own',
    '2': 'Rent',
    '3': 'Military Housing',
    '4': 'Other'
};
/**
 * Converts numeric residence type value to human-readable label
 * @param value - Numeric residence type ('1', '2', '3', '4')
 * @returns Human-readable label or original value as fallback
 */
const getResidenceTypeLabel = (value) => {
    return exports.RESIDENCE_TYPE_MAPPING[value] || value;
};
exports.getResidenceTypeLabel = getResidenceTypeLabel;
/**
 * Relationship options for contact person
 */
exports.RELATIONSHIP_OPTIONS = [
    "Neighbor",
    "Landlord",
    "Friend",
    "Relative",
    "Other"
];
/**
 * Creates a relationship field that maps to the correct PDF checkbox based on relationship type and entry index
 * THROWS ERROR if field mapping is not found - no fallbacks to ensure proper implementation
 */
const createRelationshipField = (relationshipType, entryIndex) => {
    const relationshipMap = {
        "Neighbor": {
            0: exports.SECTION11_FIELD_NAMES.RELATIONSHIP_NEIGHBOR_1,
            1: exports.SECTION11_FIELD_NAMES.RELATIONSHIP_NEIGHBOR_2,
            2: exports.SECTION11_FIELD_NAMES.RELATIONSHIP_NEIGHBOR_3,
            3: exports.SECTION11_FIELD_NAMES.RELATIONSHIP_NEIGHBOR_4
        },
        "Friend": {
            0: exports.SECTION11_FIELD_NAMES.RELATIONSHIP_FRIEND_1,
            1: exports.SECTION11_FIELD_NAMES.RELATIONSHIP_FRIEND_2,
            2: exports.SECTION11_FIELD_NAMES.RELATIONSHIP_FRIEND_3,
            3: exports.SECTION11_FIELD_NAMES.RELATIONSHIP_FRIEND_4
        },
        "Landlord": {
            0: exports.SECTION11_FIELD_NAMES.RELATIONSHIP_LANDLORD_1,
            1: exports.SECTION11_FIELD_NAMES.RELATIONSHIP_LANDLORD_2,
            2: exports.SECTION11_FIELD_NAMES.RELATIONSHIP_LANDLORD_3,
            3: exports.SECTION11_FIELD_NAMES.RELATIONSHIP_LANDLORD_4
        },
        "Business Associate": {
            0: exports.SECTION11_FIELD_NAMES.RELATIONSHIP_BUSINESS_1,
            1: exports.SECTION11_FIELD_NAMES.RELATIONSHIP_BUSINESS_2,
            2: exports.SECTION11_FIELD_NAMES.RELATIONSHIP_BUSINESS_3,
            3: exports.SECTION11_FIELD_NAMES.RELATIONSHIP_BUSINESS_4
        },
        "Other": {
            0: exports.SECTION11_FIELD_NAMES.RELATIONSHIP_OTHER_1,
            1: exports.SECTION11_FIELD_NAMES.RELATIONSHIP_OTHER_2,
            2: exports.SECTION11_FIELD_NAMES.RELATIONSHIP_OTHER_3,
            3: exports.SECTION11_FIELD_NAMES.RELATIONSHIP_OTHER_4
        }
    };
    const fieldName = relationshipMap[relationshipType]?.[entryIndex];
    if (!fieldName) {
        throw new Error(`❌ SECTION11 FIELD MAPPING ERROR: No relationship field found for type "${relationshipType}" and entry ${entryIndex}. Available types: ${Object.keys(relationshipMap).join(', ')}. Valid entry indices: 0-3.`);
    }
    return (0, sections_references_loader_1.createFieldFromReference)(11, fieldName, false);
};
exports.createRelationshipField = createRelationshipField;
/**
 * Creates all relationship fields for a given entry index
 * THROWS ERROR if any field mapping is not found - no fallbacks to ensure proper implementation
 */
const createAllRelationshipFields = (entryIndex) => {
    if (entryIndex < 0 || entryIndex > 3) {
        throw new Error(`❌ SECTION11 FIELD MAPPING ERROR: Invalid entry index ${entryIndex}. Valid entry indices: 0-3.`);
    }
    return {
        neighbor: (0, exports.createRelationshipField)('Neighbor', entryIndex),
        friend: (0, exports.createRelationshipField)('Friend', entryIndex),
        landlord: (0, exports.createRelationshipField)('Landlord', entryIndex),
        businessAssociate: (0, exports.createRelationshipField)('Business Associate', entryIndex),
        other: (0, exports.createRelationshipField)('Other', entryIndex)
    };
};
exports.createAllRelationshipFields = createAllRelationshipFields;
/**
 * Gets the relationship other explanation field ID based on entry index
 * THROWS ERROR if field mapping is not found - no fallbacks to ensure proper implementation
 */
const getRelationshipOtherFieldId = (entryIndex) => {
    const otherFieldMap = {
        0: exports.SECTION11_FIELD_NAMES.RELATIONSHIP_OTHER_EXPLAIN_1,
        1: exports.SECTION11_FIELD_NAMES.RELATIONSHIP_OTHER_EXPLAIN_2,
        2: exports.SECTION11_FIELD_NAMES.RELATIONSHIP_OTHER_EXPLAIN_3,
        3: exports.SECTION11_FIELD_NAMES.RELATIONSHIP_OTHER_EXPLAIN_4
    };
    const fieldName = otherFieldMap[entryIndex];
    if (!fieldName) {
        throw new Error(`❌ SECTION11 FIELD MAPPING ERROR: No relationship other explanation field found for entry ${entryIndex}. Valid entry indices: 0-3.`);
    }
    return fieldName;
};
exports.getRelationshipOtherFieldId = getRelationshipOtherFieldId;
/**
 * APO/FPO type options
 */
exports.APO_FPO_TYPE_OPTIONS = [
    "APO",
    "FPO",
    "DPO"
];
/**
 * AE code options for military addresses
 */
exports.AE_CODE_OPTIONS = [
    "AA", // Americas
    "AE", // Europe/Africa/Middle East
    "AP" // Pacific
];
// ============================================================================
// HELPER FUNCTIONS
// ============================================================================
/**
 * Creates a default address information structure with sections-references
 */
const createDefaultAddressInformationWithReferences = (entryIndex) => {
    if (entryIndex === 0) {
        return {
            streetAddress: (0, sections_references_loader_1.createFieldFromReference)(11, exports.SECTION11_FIELD_NAMES.STREET_ADDRESS_1, ''),
            city: (0, sections_references_loader_1.createFieldFromReference)(11, exports.SECTION11_FIELD_NAMES.CITY_1, ''),
            state: {
                ...(0, sections_references_loader_1.createFieldFromReference)(11, exports.SECTION11_FIELD_NAMES.STATE_1, ''),
                options: (0, base_1.getUSStateOptions)().map(option => option.value),
                value: ''
            },
            zipCode: (0, sections_references_loader_1.createFieldFromReference)(11, exports.SECTION11_FIELD_NAMES.ZIP_CODE_1, ''),
            country: {
                ...(0, sections_references_loader_1.createFieldFromReference)(11, exports.SECTION11_FIELD_NAMES.COUNTRY_1, ''),
                options: (0, base_1.getCountryOptions)().map(option => option.value),
                value: ''
            }
        };
    }
    else {
        // THROW ERROR: Return information about entries that could not be created
        const errorDetails = {
            section: 11,
            function: 'createDefaultAddressInformationWithReferences',
            entryIndex,
            implementedEntries: [0],
            availableEntries: [0, 1, 2, 3],
            validEntryIndex: entryIndex >= 0 && entryIndex <= 3,
            reason: 'Only entry 0 is implemented with sections-references mapping'
        };
        throw new Error(`❌ SECTION11 ADDRESS CREATION FAILED: Could not create address information for entry ${entryIndex}. Details: ${JSON.stringify(errorDetails, null, 2)}`);
    }
};
exports.createDefaultAddressInformationWithReferences = createDefaultAddressInformationWithReferences;
/**
 * Creates a default address information structure - DEPRECATED FALLBACK FUNCTION
 * THROWS ERROR to identify where fallback was being used
 */
const createDefaultAddressInformation = () => {
    const errorDetails = {
        section: 11,
        function: 'createDefaultAddressInformation',
        reason: 'This fallback function should not be called',
        recommendation: 'Use createDefaultAddressInformationWithReferences() with proper entry index',
        implementedAlternatives: ['createDefaultAddressInformationWithReferences(0)'],
        availableEntries: [0, 1, 2, 3]
    };
    throw new Error(`❌ SECTION11 DEPRECATED FALLBACK CALLED: createDefaultAddressInformation() is a deprecated fallback function. Details: ${JSON.stringify(errorDetails, null, 2)}`);
};
exports.createDefaultAddressInformation = createDefaultAddressInformation;
/**
 * Creates a default contact person structure with sections-references
 */
const createDefaultContactPersonWithReferences = (entryIndex) => {
    if (entryIndex === 0) {
        return {
            _id: entryIndex,
            residenceDates: (0, exports.createResidenceDatesFromReference)(entryIndex),
            residenceAddress: (0, exports.createResidenceAddressFromReference)(entryIndex),
            residenceType: (0, exports.createResidenceTypeFromReference)(entryIndex),
            contactPersonName: (0, exports.createContactPersonNameFromReference)(entryIndex),
            contactPersonPhones: (0, exports.createContactPersonPhonesFromReference)(entryIndex),
            contactPersonRelationship: (0, exports.createContactPersonRelationshipFromReference)(entryIndex),
            contactPersonAddress: (0, exports.createContactPersonAddressFromReference)(entryIndex),
            contactPersonEmail: (0, exports.createContactPersonEmailFromReference)(entryIndex),
            lastContactInfo: (0, exports.createLastContactInfoFromReference)(entryIndex),
            apoFpoPhysicalAddress: (0, exports.createAPOFPOPhysicalAddressFromReference)(entryIndex),
            additionalFields: (0, exports.createAdditionalFieldsFromReference)(entryIndex)
        };
    }
    else {
        // No fallback - throw error to identify missing implementation
        throw new Error(`❌ SECTION11 IMPLEMENTATION ERROR: createDefaultContactPersonWithReferences not implemented for entry index ${entryIndex}. Only entry 0 is currently implemented. Valid entry indices: 0-3.`);
    }
};
exports.createDefaultContactPersonWithReferences = createDefaultContactPersonWithReferences;
/**
 * Creates a default address information structure using dynamic field mapping
 */
const createDefaultAddressInformationDynamic = (entryIndex) => {
    try {
        return {
            streetAddress: createSection11Field(entryIndex, 'TextField11[3]', ''),
            city: createSection11Field(entryIndex, 'TextField11[4]', ''),
            state: {
                ...createSection11Field(entryIndex, 'School6_State[0]', ''),
                options: (0, base_1.getUSStateOptions)().map(option => option.value),
                value: ''
            },
            zipCode: createSection11Field(entryIndex, 'TextField11[5]', ''),
            country: {
                ...createSection11Field(entryIndex, 'DropDownList5[0]', ''),
                options: (0, base_1.getCountryOptions)().map(option => option.value),
                value: ''
            }
        };
    }
    catch (error) {
        // THROW ERROR: Return information about dynamic address creation failure
        const errorDetails = {
            section: 11,
            function: 'createDefaultAddressInformationDynamic',
            entryIndex,
            originalError: error instanceof Error ? error.message : String(error),
            attemptedFields: ['TextField11[3]', 'TextField11[4]', 'School6_State[0]', 'DropDownList5[0]', 'TextField11[5]'],
            availableEntries: [0, 1, 2, 3],
            validEntryIndex: entryIndex >= 0 && entryIndex <= 3,
            recommendation: 'Check field mapping for the specified entry index'
        };
        throw new Error(`❌ SECTION11 DYNAMIC ADDRESS CREATION FAILED: Could not create dynamic address for entry ${entryIndex}. Details: ${JSON.stringify(errorDetails, null, 2)}`);
    }
};
exports.createDefaultAddressInformationDynamic = createDefaultAddressInformationDynamic;
/**
 * Creates a default contact person structure using dynamic field mapping
 */
const createDefaultContactPersonDynamic = (entryIndex) => {
    // No fallback - throw error to identify missing implementation
    throw new Error(`❌ SECTION11 IMPLEMENTATION ERROR: createDefaultContactPersonDynamic is deprecated and should not be called. Use createDefaultResidenceEntry(${entryIndex}) instead.`);
};
exports.createDefaultContactPersonDynamic = createDefaultContactPersonDynamic;
/**
 * Creates a default residence entry with the provided index using sections-references
 */
const createDefaultResidenceEntry = (index) => {
    // Validate entry index - THROW ERROR instead of defaulting
    if (index < 0 || index > 3) {
        const errorDetails = {
            section: 11,
            function: 'createDefaultResidenceEntry',
            providedIndex: index,
            validIndices: [0, 1, 2, 3],
            reason: 'Entry index out of valid range',
            maxEntries: 4
        };
        throw new Error(`❌ SECTION11 INVALID ENTRY INDEX: Cannot create residence entry for index ${index}. Details: ${JSON.stringify(errorDetails, null, 2)}`);
    }
    // Creating Section 11 residence entry using sections-references
    try {
        return {
            _id: index,
            residenceDates: (0, exports.createResidenceDatesFromReference)(index),
            residenceAddress: (0, exports.createResidenceAddressFromReference)(index),
            residenceType: (0, exports.createResidenceTypeFromReference)(index),
            contactPersonName: (0, exports.createContactPersonNameFromReference)(index),
            contactPersonPhones: (0, exports.createContactPersonPhonesFromReference)(index),
            contactPersonRelationship: (0, exports.createContactPersonRelationshipFromReference)(index),
            contactPersonAddress: (0, exports.createContactPersonAddressFromReference)(index),
            contactPersonEmail: (0, exports.createContactPersonEmailFromReference)(index),
            lastContactInfo: (0, exports.createLastContactInfoFromReference)(index),
            apoFpoPhysicalAddress: (0, exports.createAPOFPOPhysicalAddressFromReference)(index),
            additionalFields: (0, exports.createAdditionalFieldsFromReference)(index)
        };
    }
    catch (error) {
        // No fallback - throw error to identify missing implementation
        throw new Error(`❌ SECTION11 IMPLEMENTATION ERROR: Failed to create residence entry ${index + 1}. Original error: ${error instanceof Error ? error.message : String(error)}. Entry index: ${index}, Valid indices: 0-3.`);
    }
};
exports.createDefaultResidenceEntry = createDefaultResidenceEntry;
/**
 * Creates a default Section 11 data structure using the new human-readable structure
 * with createReferenceFrom() methods for PDF mapping
 *
 * Note: Section 11 supports up to 4 residence entries, but we start with just 1
 * Additional entries can be added via addResidenceEntry()
 */
const createDefaultSection11 = () => {
    // Validate field count against sections-references
    (0, sections_references_loader_1.validateSectionFieldCount)(11);
    return {
        _id: 11,
        section11: {
            residences: [(0, exports.createResidenceEntryFromReference)(0)]
        }
    };
};
exports.createDefaultSection11 = createDefaultSection11;
/**
 * Validates residence history for gaps and completeness using new structure
 */
const validateResidenceHistory = (residences, context) => {
    const errors = [];
    const warnings = [];
    // Helper function to parse MM/YYYY format correctly
    const parseMMYYYY = (dateStr) => {
        if (!dateStr) {
            throw new Error(`❌ SECTION11 DATE PARSING FAILED: Empty date string provided`);
        }
        const parts = dateStr.split('/');
        if (parts.length === 2) {
            const month = parseInt(parts[0]) - 1; // Month is 0-indexed in Date
            const year = parseInt(parts[1]);
            if (isNaN(month) || isNaN(year) || month < 0 || month > 11 || year < 1900 || year > 2100) {
                throw new Error(`❌ SECTION11 DATE PARSING FAILED: Invalid month or year in "${dateStr}"`);
            }
            return new Date(year, month, 1);
        }
        throw new Error(`❌ SECTION11 DATE PARSING FAILED: Invalid date format "${dateStr}"`);
    };
    // Sort residences by date to check for gaps using new structure
    const sortedResidences = residences
        .filter(r => r.residenceDates.fromDate?.value && r.residenceDates.toDate?.value)
        .sort((a, b) => parseMMYYYY(a.residenceDates.fromDate.value).getTime() - parseMMYYYY(b.residenceDates.fromDate.value).getTime());
    // Check for basic required fields using new structure
    residences.forEach((residence, index) => {
        if (!residence.residenceAddress.streetAddress?.value) {
            errors.push(`Residence ${index + 1}: Street address is required`);
        }
        if (!residence.residenceAddress.city?.value) {
            errors.push(`Residence ${index + 1}: City is required`);
        }
        if (!residence.residenceDates.fromDate?.value) {
            errors.push(`Residence ${index + 1}: From date is required`);
        }
        if (!residence.contactPersonName.lastName?.value) {
            errors.push(`Residence ${index + 1}: Contact person last name is required`);
        }
    });
    // Check for gaps if continuous history is required
    const hasGaps = context.requiresContinuousHistory && sortedResidences.length > 1;
    const gapDetails = [];
    if (hasGaps) {
        for (let i = 0; i < sortedResidences.length - 1; i++) {
            const currentEnd = parseMMYYYY(sortedResidences[i].residenceDates.toDate.value);
            const nextStart = parseMMYYYY(sortedResidences[i + 1].residenceDates.fromDate.value);
            const timeDiff = nextStart.getTime() - currentEnd.getTime();
            const daysDiff = Math.floor(timeDiff / (1000 * 3600 * 24));
            if (daysDiff > 30) {
                gapDetails.push({
                    startDate: sortedResidences[i].residenceDates.toDate.value,
                    endDate: sortedResidences[i + 1].residenceDates.fromDate.value,
                    duration: daysDiff
                });
            }
        }
    }
    if (gapDetails.length > 0) {
        warnings.push(`Found ${gapDetails.length} gaps in residence history`);
    }
    return {
        isValid: errors.length === 0,
        errors,
        warnings,
        hasGaps: gapDetails.length > 0,
        gapDetails: gapDetails.length > 0 ? gapDetails : undefined
    };
};
exports.validateResidenceHistory = validateResidenceHistory;
