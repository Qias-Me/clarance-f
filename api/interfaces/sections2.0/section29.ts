import { type Field } from "../formDefinition2.0";

// ============================================================================
// SECTION 29 RADIO BUTTON FIELD ID CONSTANTS
// ============================================================================

/**
 * PDF Field IDs for Section 29 Radio Buttons
 * These IDs use 4-digit numeric format internally (consistent with other sections)
 * The ' 0 R' suffix is added only during PDF validation/application
 */
export const SECTION29_RADIO_FIELD_IDS = {
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
} as const;

/**
 * PDF Field Names for Section 29 Radio Buttons
 * These names correspond to the exact field names in the SF-86 PDF
 */
export const SECTION29_RADIO_FIELD_NAMES = {
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
} as const;

/**
 * SF-86 Section 29: Associations Interface
 *
 * This interface represents the hierarchical structure of Section 29 (Associations)
 * which covers various types of associations with organizations and activities
 * related to terrorism, violence, and overthrow of government.
 *
 * Structure: Section → Subsection → Entry → Fields
 * - 7 subsections across 5 PDF sections with 141 total fields
 * - Each subsection has 1 main radio question + up to 2 entries
 * - Fields represent individual form fields with typed values
 *
 * PDF Field Distribution:
 * - Section29[0]: Subsection A (Terrorism Organizations)
 * - Section29_2[0]: Subsection B (Terrorism Activities)
 * - Section29_3[0]: Subsection C (Violent Overthrow Organizations)
 * - Section29_4[0]: Subsection D (Violence/Force Organizations)
 * - Section29_5[0]: Subsections E & F (Overthrow Activities + Terrorism Associations)
 */

// ============================================================================
// MAIN SECTION 29 INTERFACE
// ============================================================================

/**
 * Section 29: Associations - Radio Button Field ID Mapping
 *
 * PDF Field IDs for Radio Buttons (4-digit format, consistent with other sections):
 * - 29.1 Terrorism Organizations: form1[0].Section29[0].RadioButtonList[0] → ID: "16435"
 * - 29.2 Terrorism Activities: form1[0].Section29_2[0].RadioButtonList[0] → ID: "16433"
 * - 29.3 Terrorism Advocacy: form1[0].Section29_2[0].RadioButtonList[1] → ID: "16434"
 * - 29.4 Violent Overthrow Organizations: form1[0].Section29_3[0].RadioButtonList[0] → ID: "16430"
 * - 29.5 Violence/Force Organizations: form1[0].Section29_4[0].RadioButtonList[0] → ID: "16428"
 * - 29.6 Overthrow Activities: form1[0].Section29_5[0].RadioButtonList[0] → ID: "16425"
 * - 29.7 Terrorism Associations: form1[0].Section29_5[0].RadioButtonList[1] → ID: "16426"
 *
 * All radio buttons use "YES" | "NO" values for proper PDF field mapping.
 * The ' 0 R' suffix is added only during PDF validation/application.
 */
export interface Section29 {
  /** Section identifier */
  _id: number;
  section29: {

  /** 29.1: Terrorism Organization Membership (Section29[0]) - 33 fields
   *  Radio Button: form1[0].Section29[0].RadioButtonList[0] (ID: 16435) */
  terrorismOrganizations?: SubsectionA;

  /** 29.2: Terrorism Activities (Section29_2[0]) - 13 fields
   *  Radio Button: form1[0].Section29_2[0].RadioButtonList[0] (ID: 16433) */
  terrorismActivities?: SubsectionB;

  /** 29.3: Terrorism Advocacy (Section29_2[0]) - 13 fields (shares PDF section with 29.2)
   *  Radio Button: form1[0].Section29_2[0].RadioButtonList[1] (ID: 16434) */
  terrorismAdvocacy?: SubsectionC;

  /** 29.4: Violent Overthrow Organizations (Section29_3[0]) - 33 fields
   *  Radio Button: form1[0].Section29_3[0].RadioButtonList[0] (ID: 16430) */
  violentOverthrowOrganizations?: SubsectionD;

  /** 29.5: Violence/Force Organizations (Section29_4[0]) - 33 fields
   *  Radio Button: form1[0].Section29_4[0].RadioButtonList[0] (ID: 16428) */
  violenceForceOrganizations?: SubsectionE;

  /** 29.6: Overthrow Activities (Section29_5[0] RadioButtonList[0]) - 13 fields
   *  Radio Button: form1[0].Section29_5[0].RadioButtonList[0] (ID: 16425) */
  overthrowActivities?: SubsectionF;

  /** 29.7: Terrorism Associations (Section29_5[0] RadioButtonList[1]) - 3 fields
   *  Radio Button: form1[0].Section29_5[0].RadioButtonList[1] (ID: 16426) */
  terrorismAssociations?: SubsectionG;

  /** Legacy combined subsection for 29.6 & 29.7 (backward compatibility) */
    overthrowActivitiesAndAssociations?: SubsectionFG;
  };
}

// ============================================================================
// SUBSECTION INTERFACES
// ============================================================================

/**
 * 29.1: Terrorism Organizations (Section29[0]) - 33 fields
 * Organizations dedicated to terrorism
 */
interface SubsectionA {
  /** Yes/No question for this subsection */
  hasAssociation: Field<"YES" | "NO (If NO, proceed to 29.2)">;

  /** Array of organization entries */
  entries: OrganizationEntry[];
}

/**
 * 29.2: Terrorism Activities (Section29_2[0]) - 13 fields
 * Acts of terrorism
 */
interface SubsectionB {
  /** Yes/No question for this subsection */
  hasActivity: Field<"YES" | "NO (If NO, proceed to 29.3)">

  /** Array of terrorism activity entries */
  entries: TerrorismActivityEntry[];
}

/**
 * 29.3: Terrorism Advocacy (Section29_2[0]) - 13 fields (shares PDF section with 29.2)
 * Advocating acts of terrorism or overthrow activities
 */
interface SubsectionC {
  /** Yes/No question for this subsection */
  hasActivity: Field<"YES" | "NO (Proceed to 29.4)">

  /** Array of terrorism advocacy entries */
  entries: TerrorismAdvocacyEntry[];
}

/**
 * 29.4: Violent Overthrow Organizations (Section29_3[0]) - 33 fields
 * Organizations dedicated to violent overthrow
 */
interface SubsectionD {
  /** Yes/No question for this subsection */
  hasAssociation: Field<"YES" | "NO (If NO, proceed to 29.5)">;

  /** Array of organization entries */
  entries: OrganizationEntry[];
}

/**
 * 29.5: Violence/Force Organizations (Section29_4[0]) - 33 fields
 * Organizations advocating violence/force
 */
interface SubsectionE {
  /** Yes/No question for this subsection */
  hasAssociation: Field<"YES" | "NO (If NO, proceed to 29.6)">;

  /** Array of organization entries */
  entries: OrganizationEntry[];
}

/**
 * 29.6: Overthrow Activities (Section29_5[0] RadioButtonList[0]) - 13 fields
 * Activities designed to overthrow the U.S. Government by force
 */
interface SubsectionF {
  /** Yes/No question for overthrow activities */
  hasActivity: Field<"YES" | "NO (If NO, proceed to 29.7)">;

  /** Array of overthrow activity entries */
  entries: OverthrowActivityEntry[];
}

/**
 * 29.7: Terrorism Associations (Section29_5[0] RadioButtonList[1]) - 3 fields
 * Associations with people involved in terrorism activities
 */
interface SubsectionG {
  /** Yes/No question for terrorism associations */
  hasAssociation: Field<"YES" | "NO ">;

  /** Array of terrorism association entries */
  entries: TerrorismAssociationEntry[];
}

/**
 * Combined Subsection 29.6 & 29.7: Legacy support for overthrow activities and terrorism associations
 * Corresponds to Section29_5[0] in the PDF field structure (both radio buttons)
 */
interface SubsectionFG {
  /** Yes/No question for overthrow activities (RadioButtonList[0]) */
  hasActivity: Field<"YES" | "NO">;

  /** Yes/No question for terrorism associations (RadioButtonList[1]) */
  hasAssociation: Field<"YES" | "NO">;

  /** Array of mixed activity entries */
  entries: (OverthrowActivityEntry | TerrorismAssociationEntry)[];
}

// ============================================================================
// ENTRY INTERFACES
// ============================================================================

/**
 * Organization Entry - used for subsections A, C, and D
 * Represents involvement with an organization
 */
interface OrganizationEntry {
  /** Entry identifier */
  _id: number;

  /** Full name of the organization */
  organizationName: Field<string>;

  /** Organization address information */
  address: Address;

  /** Date range of involvement */
  dateRange: DateRange;

  /** Positions held in the organization */
  positions: PositionsField;

  /** Contributions made to the organization */
  contributions: ContributionsField;

  /** Nature and reasons for involvement */
  involvementDescription: Field<string>;
}

/**
 * Terrorism Activity Entry - used for subsection 29.2
 * Represents engagement in terrorism activities
 */
interface TerrorismActivityEntry {
  /** Entry identifier */
  _id: number;

  /** Description of the nature and reasons for the activity */
  activityDescription: Field<string>;

  /** Date range of the activities */
  dateRange: DateRange;
}

/**
 * Terrorism Advocacy Entry - used for subsection 29.3
 * Represents advocating acts of terrorism or overthrow activities
 */
interface TerrorismAdvocacyEntry {
  /** Entry identifier */
  _id: number;

  /** Reason(s) for advocating acts of terrorism */
  advocacyReason: Field<string>;

  /** Date range of advocating activities */
  dateRange: DateRange;
}

/**
 * Overthrow Activity Entry - used for subsection E
 * Represents activities designed to overthrow the government
 */
interface OverthrowActivityEntry {
  /** Entry identifier */
  _id: number;

  /** Description of the nature and reasons for the activity */
  activityDescription: Field<string>;

  /** Date range of such activities */
  dateRange: DateRange;
}

/**
 * Terrorism Association Entry - used for subsection E
 * Represents associations with people involved in terrorism
 */
interface TerrorismAssociationEntry {
  /** Entry identifier */
  _id: number;

  /** Explanation of the association */
  explanation: Field<string>;
}

// ============================================================================
// FIELD GROUP INTERFACES
// ============================================================================

/**
 * Address information for organizations
 */
interface Address {
  /** Street address */
  street: Field<string>;

  /** City */
  city: Field<string>;

  /** State (dropdown) */
  state: Field<string>;

  /** ZIP code */
  zipCode: Field<string>;

  /** Country (dropdown) */
  country: Field<string>;
}

/**
 * Date range with estimate flags
 */
interface DateRange {
  /** From date information */
  from: DateInfo;

  /** To date information */
  to: DateInfo;

  /** Present checkbox - if involvement is ongoing */
  present: Field<boolean>;
}

/**
 * Date information with estimate flag
 */
interface DateInfo {
  /** Date value (Month/Year format) */
  date: Field<string>;

  /** Estimate checkbox - if date is estimated */
  estimated: Field<boolean>;
}

/**
 * Positions field with "no positions" option
 */
interface PositionsField {
  /** Positions held description */
  description: Field<string>;

  /** No positions held checkbox */
  noPositionsHeld: Field<boolean>;
}

/**
 * Contributions field with "no contributions" option
 */
interface ContributionsField {
  /** Contributions made description */
  description: Field<string>;

  /** No contributions made checkbox */
  noContributionsMade: Field<boolean>;
}
// ============================================================================
// EXPORTS
// ============================================================================

export type {
  SubsectionA,
  SubsectionB,
  SubsectionC,
  SubsectionD,
  SubsectionE,
  SubsectionF,
  SubsectionG,
  SubsectionFG,
  OrganizationEntry,
  TerrorismActivityEntry,
  TerrorismAdvocacyEntry,
  OverthrowActivityEntry,
  TerrorismAssociationEntry,
  Address,
  DateRange,
  DateInfo,
  PositionsField,
  ContributionsField
};

