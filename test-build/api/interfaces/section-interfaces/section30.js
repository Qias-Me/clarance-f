"use strict";
/**
 * Section 30: General Remarks / Continuation Section
 *
 * TypeScript interface definitions for SF-86 Section 30 continuation sheet data structure.
 * Based on the established Field<T> interface patterns and PDF field ID mappings.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.SECTION30_FIELD_IDS = void 0;
// ============================================================================
// FIELD ID MAPPINGS
// ============================================================================
/**
 * PDF field ID patterns for Section 30
 * Based on the continuation1, continuation2, etc. pattern from the JSON reference
 */
exports.SECTION30_FIELD_IDS = {
    // Main continuation fields
    REMARKS: "form1[0].continuation1[0].p15-t28[0]",
    // Personal info fields - Page 1 (page 133)
    DATE_SIGNED_PAGE1: "form1[0].continuation1[0].p17-t2[0]",
    // Personal info fields - Page 2 (page 134)
    FULL_NAME_PAGE2: "form1[0].continuation2[0].p17-t1[0]",
    DATE_SIGNED_PAGE2: "form1[0].continuation2[0].p17-t2[0]",
    DATE_OF_BIRTH_PAGE2: "form1[0].continuation2[0].p17-t4[0]",
    OTHER_NAMES_USED_PAGE2: "form1[0].continuation2[0].p17-t3[0]",
    STREET_PAGE2: "form1[0].continuation2[0].p17-t6[0]",
    CITY_PAGE2: "form1[0].continuation2[0].p17-t8[0]",
    STATE_PAGE2: "form1[0].continuation2[0].p17-t9[0]",
    ZIP_CODE_PAGE2: "form1[0].continuation2[0].p17-t10[0]",
    TELEPHONE_PAGE2: "form1[0].continuation2[0].p17-t11[0]",
    // Personal info fields - Page 3 (page 135)
    FULL_NAME_PAGE3: "form1[0].continuation3[0].p17-t1[0]",
    DATE_SIGNED_PAGE3: "form1[0].continuation3[0].p17-t2[0]",
    OTHER_NAMES_USED_PAGE3: "form1[0].continuation3[0].p17-t3[0]",
    STREET_PAGE3: "form1[0].continuation3[0].p17-t6[0]",
    CITY_PAGE3: "form1[0].continuation3[0].p17-t8[0]",
    STATE_PAGE3: "form1[0].continuation3[0].p17-t9[0]",
    ZIP_CODE_PAGE3: "form1[0].continuation3[0].p17-t10[0]",
    TELEPHONE_PAGE3: "form1[0].continuation3[0].p17-t11[0]",
    // Personal info fields - Page 4 (page 136)
    PRINT_NAME_PAGE4: "form1[0].continuation4[0].p17-t1[0]",
    DATE_SIGNED_PAGE4: "form1[0].continuation4[0].p17-t2[0]"
};
