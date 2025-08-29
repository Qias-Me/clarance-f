"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SECTION29_RADIO_FIELD_NAMES = exports.SECTION29_RADIO_FIELD_IDS = void 0;
// ============================================================================
// SECTION 29 RADIO BUTTON FIELD ID CONSTANTS
// ============================================================================
/**
 * PDF Field IDs for Section 29 Radio Buttons
 * These IDs use 4-digit numeric format internally (consistent with other sections)
 * The ' 0 R' suffix is added only during PDF validation/application
 */
exports.SECTION29_RADIO_FIELD_IDS = {
    /** 29.1 Terrorism Organizations: form1[0].Section29[0].RadioButtonList[0] */
    TERRORISM_ORGANIZATIONS: "16435",
    /** 29.2 Terrorism Activities: form1[0].Section29_2[0].RadioButtonList[0] */
    TERRORISM_ACTIVITIES: "16433",
    /** 29.3 Terrorism Advocacy: form1[0].Section29_2[0].RadioButtonList[1] */
    TERRORISM_ADVOCACY: "16434",
    /** 29.4 Violent Overthrow Organizations: form1[0].Section29_3[0].RadioButtonList[0] */
    VIOLENT_OVERTHROW_ORGANIZATIONS: "16430",
    /** 29.5 Violence/Force Organizations: form1[0].Section29_4[0].RadioButtonList[0] */
    VIOLENCE_FORCE_ORGANIZATIONS: "16428",
    /** 29.6 Overthrow Activities: form1[0].Section29_5[0].RadioButtonList[0] */
    OVERTHROW_ACTIVITIES: "16425",
    /** 29.7 Terrorism Associations: form1[0].Section29_5[0].RadioButtonList[1] */
    TERRORISM_ASSOCIATIONS: "16426"
};
/**
 * PDF Field Names for Section 29 Radio Buttons
 * These names correspond to the exact field names in the SF-86 PDF
 */
exports.SECTION29_RADIO_FIELD_NAMES = {
    /** 29.1 Terrorism Organizations */
    TERRORISM_ORGANIZATIONS: "form1[0].Section29[0].RadioButtonList[0]",
    /** 29.2 Terrorism Activities */
    TERRORISM_ACTIVITIES: "form1[0].Section29_2[0].RadioButtonList[0]",
    /** 29.3 Terrorism Advocacy */
    TERRORISM_ADVOCACY: "form1[0].Section29_2[0].RadioButtonList[1]",
    /** 29.4 Violent Overthrow Organizations */
    VIOLENT_OVERTHROW_ORGANIZATIONS: "form1[0].Section29_3[0].RadioButtonList[0]",
    /** 29.5 Violence/Force Organizations */
    VIOLENCE_FORCE_ORGANIZATIONS: "form1[0].Section29_4[0].RadioButtonList[0]",
    /** 29.6 Overthrow Activities */
    OVERTHROW_ACTIVITIES: "form1[0].Section29_5[0].RadioButtonList[0]",
    /** 29.7 Terrorism Associations */
    TERRORISM_ASSOCIATIONS: "form1[0].Section29_5[0].RadioButtonList[1]"
};
