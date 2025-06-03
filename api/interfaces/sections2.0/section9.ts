/**
 * Section 9: Citizenship of Your Parents
 *
 * TypeScript interface definitions for SF-86 Section 9 citizenship data structure.
 * Based on the established Field<T> interface patterns and PDF field ID mappings.
 */

import type { Field } from "../formDefinition2.0";
import {
  createFieldFromReference,
  validateSectionFieldCount,
} from "../../utils/sections-references-loader";
import type { Country, USState } from "./base";

// ============================================================================
// CORE INTERFACES
// ============================================================================

/**
 * Born in US or territory (Section 9.1) information
 */
export interface BornInUSInfo {
  documentType: Field<
    "FS240" | "DS1350" | "FS545" | "Other (Provide explanation)"
  >;
  otherExplanation?: Field<string>;
  documentNumber: Field<string>;
  documentIssueDate: Field<string>;
  isIssueDateEstimated: Field<boolean>;
  issueCity: Field<string>;
  issueState?: Field<USState>;
  issueCountry?: Field<Country>;
  nameOnDocument: {
    lastName: Field<string>;
    firstName: Field<string>;
    middleName?: Field<string>;
    suffix?: Field<string>;
  };
  certificateNumber?: Field<string>;
  certificateIssueDate?: Field<string>;
  isCertificateDateEstimated?: Field<boolean>;
  nameOnCertificate?: {
    lastName: Field<string>;
    firstName: Field<string>;
    middleName?: Field<string>;
    suffix?: Field<string>;
  };
  wasBornOnMilitaryInstallation: Field<"YES" | "NO">;
  militaryBaseName?: Field<string>;
}

/**
 * Naturalized US Citizen (Section 9.2) information
 */
export interface NaturalizedCitizenInfo {
  naturalizedCertificateNumber: Field<string>;
  nameOnCertificate: {
    lastName: Field<string>;
    firstName: Field<string>;
    middleName?: Field<string>;
    suffix?: Field<string>;
  };
  courtAddress: {
    street: Field<string>;
    city: Field<string>;
    state?: Field<string>;
    zipCode?: Field<string>;
  };
  certificateIssueDate: Field<string>;
  isCertificateDateEstimated: Field<boolean>;
  otherExplanation?: Field<string>;
}

/**
 * Derived US Citizen (Section 9.3) information
 */
export interface DerivedCitizenInfo {
  alienRegistrationNumber?: Field<string>;
  permanentResidentCardNumber?: Field<string>;
  certificateOfCitizenshipNumber?: Field<string>;
  nameOnDocument: {
    lastName: Field<string>;
    firstName: Field<string>;
    middleName?: Field<string>;
    suffix?: Field<string>;
  };
  basis: Field<"By operation of law through my U.S. citizen parent" | "Other">;
  otherExplanation?: Field<string>;
}

/**
 * Non-US Citizen (Section 9.4) information
 */
export interface NonUSCitizenInfo {
  entryDate: Field<string>;
  isEntryDateEstimated: Field<boolean>;
  entryLocation: {
    city: Field<string>;
    state?: Field<string>;
  };
  countryOfCitizenship: {
    country1: Field<string>;
    country2?: Field<string>;
  };
  hasAlienRegistration: Field<"1" | "2" | "3" | "4" | "5">; // Must be numeric string for PDF radio button
  alienRegistrationNumber?: Field<string>;
  alienRegistrationExpiration?: Field<string>;
  isAlienExpDateEstimated?: Field<boolean>;
  visaType?: Field<string>;
  visaNumber?: Field<string>;
  visaIssueDate?: Field<string>;
  isVisaIssueDateEstimated?: Field<boolean>;
  location?: Field<string>;
  i94Number?: Field<string>;
}

/**
 * Section 9 main data structure
 */
export interface Section9 {
  _id: number;
  section9: {
    status: Field<
      | "I am a U.S. citizen or national by birth in the U.S. or U.S. territory/commonwealth. (Proceed to Section 10)   "
      | "I am a U.S. citizen or national by birth, born to U.S. parent(s), in a foreign country. (Complete 9.1) "
      | "I am a naturalized U.S. citizen. (Complete 9.2) "
      | "I am a derived U.S. citizen. (Complete 9.3) "
      | "I am not a U.S. citizen. (Complete 9.4) "
    >;
    bornToUSParents?: BornInUSInfo;
    naturalizedCitizen?: NaturalizedCitizenInfo;
    derivedCitizen?: DerivedCitizenInfo;
    nonUSCitizen?: NonUSCitizenInfo;
  };
}

// ============================================================================
// SUBSECTION TYPES
// ============================================================================

/**
 * Section 9 subsection keys for type safety
 */
export type Section9SubsectionKey = "section9";

// ============================================================================
// FIELD ID MAPPINGS
// ============================================================================

/**
 * PDF field ID mappings for Section 9 - Corrected with 4-digit numeric IDs
 * Based on section-9.json reference file with proper field ID extraction
 */
export const SECTION9_FIELD_IDS = {
  // Main citizenship status radio button (ID: 17233)
  CITIZENSHIP_STATUS: {
    id: "17233",
    name: "form1[0].Sections7-9[0].RadioButtonList[1]",
    type: "PDFRadioGroup",
  },

  // Section 9.1 - Born to US Parents (Sections7-9 pattern)
  OTHER_EXPLANATION: {
    id: "9539",
    name: "form1[0].Sections7-9[0].TextField11[3]",
    type: "PDFTextField",
  },
  DOCUMENT_NUMBER: {
    id: "9538",
    name: "form1[0].Sections7-9[0].TextField11[4]",
    type: "PDFTextField",
  },
  ISSUE_COUNTRY: {
    id: "9537",
    name: "form1[0].Sections7-9[0].DropDownList12[0]",
    type: "PDFDropdown",
  },
  ISSUE_STATE: {
    id: "9536",
    name: "form1[0].Sections7-9[0].School6_State[0]",
    type: "PDFDropdown",
  },
  ISSUE_CITY: {
    id: "9535",
    name: "form1[0].Sections7-9[0].TextField11[5]",
    type: "PDFTextField",
  },
  NAME_MIDDLE: {
    id: "9534",
    name: "form1[0].Sections7-9[0].TextField11[6]",
    type: "PDFTextField",
  },
  NAME_LAST: {
    id: "9533",
    name: "form1[0].Sections7-9[0].TextField11[7]",
    type: "PDFTextField",
  },
  NAME_FIRST: {
    id: "9532",
    name: "form1[0].Sections7-9[0].TextField11[8]",
    type: "PDFTextField",
  },

  // Section 9.2 - Naturalized Citizen (Section9.1-9.4 pattern)
  NATURALIZED_COURT_CITY: {
    id: "9631",
    name: "form1[0].Section9\\.1-9\\.4[0].TextField11[0]",
    type: "PDFTextField",
  },
  NATURALIZED_NAME_MIDDLE: {
    id: "9630",
    name: "form1[0].Section9\\.1-9\\.4[0].TextField11[1]",
    type: "PDFTextField",
  },
  NATURALIZED_NAME_LAST: {
    id: "9629",
    name: "form1[0].Section9\\.1-9\\.4[0].TextField11[2]",
    type: "PDFTextField",
  },
  NATURALIZED_NAME_FIRST: {
    id: "9628",
    name: "form1[0].Section9\\.1-9\\.4[0].TextField11[3]",
    type: "PDFTextField",
  },
  NATURALIZED_COURT_STREET: {
    id: "9627",
    name: "form1[0].Section9\\.1-9\\.4[0].TextField11[4]",
    type: "PDFTextField",
  },
  NATURALIZED_COURT_ZIP: {
    id: "9626",
    name: "form1[0].Section9\\.1-9\\.4[0].TextField11[5]",
    type: "PDFTextField",
  },
  NATURALIZED_CERTIFICATE_NUMBER: {
    id: "9625",
    name: "form1[0].Section9\\.1-9\\.4[0].TextField11[6]",
    type: "PDFTextField",
  },

  // Section 9.4 - Non-US Citizen
  ALIEN_REGISTRATION_NUMBER: {
    id: "9611",
    name: "form1[0].Section9\\.1-9\\.4[0].TextField11[14]",
    type: "PDFTextField",
  },
  ENTRY_CITY: {
    id: "9599",
    name: "form1[0].Section9\\.1-9\\.4[0].TextField11[18]",
    type: "PDFTextField",
  },
  CITIZENSHIP_COUNTRY_1: {
    id: "9597",
    name: "form1[0].Section9\\.1-9\\.4[0].DropDownList15[2]",
    type: "PDFDropdown",
  },
  CITIZENSHIP_COUNTRY_2: {
    id: "9596",
    name: "form1[0].Section9\\.1-9\\.4[0].DropDownList15[3]",
    type: "PDFDropdown",
  },
  HAS_ALIEN_REGISTRATION: {
    id: "17229",
    name: "form1[0].Section9\\.1-9\\.4[0].RadioButtonList[0]",
    type: "PDFRadioGroup",
  },
} as const;

// ============================================================================
// UTILITY TYPES
// ============================================================================

/**
 * Type for creating new citizenship entries
 */
export type CreateCitizenshipEntryParams = {
  entryIndex: number;
};

/**
 * Type for citizenship entry updates
 */
export type CitizenshipEntryUpdate = {
  entryIndex: number;
  fieldPath: string;
  newValue: any;
};

/**
 * Type for bulk citizenship entry operations
 */
export type BulkCitizenshipOperation = {
  operation: "add" | "remove" | "update" | "move";
  entryIndex?: number;
  targetIndex?: number;
  data?: Partial<
    | BornInUSInfo
    | NaturalizedCitizenInfo
    | DerivedCitizenInfo
    | NonUSCitizenInfo
  >;
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Creates a default Section 9 data structure using DRY approach with sections-references
 * This eliminates hardcoded values and uses the single source of truth
 */
export const createDefaultSection9 = (): Section9 => {
  // Validate field count against sections-references (expected: 78 fields)
  validateSectionFieldCount(9, 78);

  return {
    _id: 9,
    section9: {
      status: createFieldFromReference(
        9,
        SECTION9_FIELD_IDS.CITIZENSHIP_STATUS.name,
        "I am a U.S. citizen or national by birth in the U.S. or U.S. territory/commonwealth. (Proceed to Section 10)   "
      ),
      // Born to US Parents subsection (9.1) - matching interface structure
      bornToUSParents: {
        documentType: createFieldFromReference(
          9,
          SECTION9_FIELD_IDS.OTHER_EXPLANATION.name,
          "FS240"
        ),
        otherExplanation: createFieldFromReference(
          9,
          SECTION9_FIELD_IDS.OTHER_EXPLANATION.name,
          ""
        ),
        documentNumber: createFieldFromReference(
          9,
          SECTION9_FIELD_IDS.DOCUMENT_NUMBER.name,
          ""
        ),
        documentIssueDate: createFieldFromReference(
          9,
          SECTION9_FIELD_IDS.ISSUE_CITY.name,
          ""
        ),
        isIssueDateEstimated: createFieldFromReference(
          9,
          SECTION9_FIELD_IDS.ISSUE_STATE.name,
          false
        ),
        issueCity: createFieldFromReference(
          9,
          SECTION9_FIELD_IDS.ISSUE_CITY.name,
          ""
        ),
        issueState: createFieldFromReference(
          9,
          SECTION9_FIELD_IDS.ISSUE_STATE.name,
          ""
        ),
        issueCountry: createFieldFromReference(
          9,
          SECTION9_FIELD_IDS.ISSUE_COUNTRY.name,
          ""
        ),
        nameOnDocument: {
          firstName: createFieldFromReference(
            9,
            SECTION9_FIELD_IDS.NAME_FIRST.name,
            ""
          ),
          middleName: createFieldFromReference(
            9,
            SECTION9_FIELD_IDS.NAME_MIDDLE.name,
            ""
          ),
          lastName: createFieldFromReference(
            9,
            SECTION9_FIELD_IDS.NAME_LAST.name,
            ""
          ),
          suffix: createFieldFromReference(
            9,
            SECTION9_FIELD_IDS.OTHER_EXPLANATION.name,
            ""
          ),
        },
        wasBornOnMilitaryInstallation: createFieldFromReference(
          9,
          SECTION9_FIELD_IDS.OTHER_EXPLANATION.name,
          "NO"
        ),
      },
      // Naturalized Citizen subsection (9.2) - matching interface structure
      naturalizedCitizen: {
        naturalizedCertificateNumber: createFieldFromReference(
          9,
          SECTION9_FIELD_IDS.NATURALIZED_CERTIFICATE_NUMBER.name,
          ""
        ),
        nameOnCertificate: {
          firstName: createFieldFromReference(
            9,
            SECTION9_FIELD_IDS.NATURALIZED_NAME_FIRST.name,
            ""
          ),
          middleName: createFieldFromReference(
            9,
            SECTION9_FIELD_IDS.NATURALIZED_NAME_MIDDLE.name,
            ""
          ),
          lastName: createFieldFromReference(
            9,
            SECTION9_FIELD_IDS.NATURALIZED_NAME_LAST.name,
            ""
          ),
        },
        courtAddress: {
          street: createFieldFromReference(
            9,
            SECTION9_FIELD_IDS.NATURALIZED_COURT_STREET.name,
            ""
          ),
          city: createFieldFromReference(
            9,
            SECTION9_FIELD_IDS.NATURALIZED_COURT_CITY.name,
            ""
          ),
          zipCode: createFieldFromReference(
            9,
            SECTION9_FIELD_IDS.NATURALIZED_COURT_ZIP.name,
            ""
          ),
        },
        certificateIssueDate: createFieldFromReference(
          9,
          SECTION9_FIELD_IDS.NATURALIZED_CERTIFICATE_NUMBER.name,
          ""
        ),
        isCertificateDateEstimated: createFieldFromReference(
          9,
          SECTION9_FIELD_IDS.NATURALIZED_CERTIFICATE_NUMBER.name,
          false
        ),
      },
      // Non-US Citizen subsection (9.4) - matching interface structure
      nonUSCitizen: {
        entryDate: createFieldFromReference(
          9,
          SECTION9_FIELD_IDS.ENTRY_CITY.name,
          ""
        ),
        isEntryDateEstimated: createFieldFromReference(
          9,
          SECTION9_FIELD_IDS.ENTRY_CITY.name,
          false
        ),
        entryLocation: {
          city: createFieldFromReference(
            9,
            SECTION9_FIELD_IDS.ENTRY_CITY.name,
            ""
          ),
        },
        countryOfCitizenship: {
          country1: createFieldFromReference(
            9,
            SECTION9_FIELD_IDS.CITIZENSHIP_COUNTRY_1.name,
            ""
          ),
          country2: createFieldFromReference(
            9,
            SECTION9_FIELD_IDS.CITIZENSHIP_COUNTRY_2.name,
            ""
          ),
        },
        hasAlienRegistration: createFieldFromReference(
          9,
          SECTION9_FIELD_IDS.HAS_ALIEN_REGISTRATION.name,
          "1"
        ),
        alienRegistrationNumber: createFieldFromReference(
          9,
          SECTION9_FIELD_IDS.ALIEN_REGISTRATION_NUMBER.name,
          ""
        ),
      },
    },
  };
};
