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
  wasBornOnMilitaryInstallation: Field<"YES" | "NO (If NO, proceed to Section 10)" | "">;
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
  courtName?: Field<string>;
  certificateIssueDate: Field<string>;
  isCertificateDateEstimated: Field<boolean>;
  otherExplanation?: Field<string>;
  entryDate?: Field<string>;
  isEntryDateEstimated?: Field<boolean>;
  entryCity?: Field<string>;
  entryState?: Field<string>;
  priorCitizenship?: Field<string>;
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
  residenceStatus?: Field<string>;
  entryDate: Field<string>;
  isEntryDateEstimated: Field<boolean>;
  alienRegistrationNumber?: Field<string>;
  documentIssueDate?: Field<string>;
  isDocumentIssueDateEstimated?: Field<boolean>;
  documentExpirationDate?: Field<string>;
  isDocumentExpirationEstimated?: Field<boolean>;
  nameOnDocument?: {
    firstName: Field<string>;
    middleName?: Field<string>;
    lastName: Field<string>;
    suffix?: Field<string>;
  };
  documentNumber?: Field<string>;
  hasAlienRegistration: Field<"1" | "2" | "3" | "4" | "5">; // Must be numeric string for PDF radio button
  explanation?: Field<string>;
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
  HAS_ALIEN_REGISTRATION: {
    id: "17229 0 R",
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
        'form1[0].Sections7-9[0].RadioButtonList[1]',
        "I am a U.S. citizen or national by birth in the U.S. or U.S. territory/commonwealth. (Proceed to Section 10)   "
      ),
      // Born to US Parents subsection (9.1) - using actual field names from sections-reference
      bornToUSParents: {
        documentType: createFieldFromReference(
          9,
          'form1[0].Sections7-9[0].RadioButtonList[3]',
          "FS240"
        ),
        otherExplanation: createFieldFromReference(
          9,
          'form1[0].Sections7-9[0].TextField11[3]',
          ""
        ),
        documentNumber: createFieldFromReference(
          9,
          'form1[0].Sections7-9[0].TextField11[4]',
          ""
        ),
        documentIssueDate: createFieldFromReference(
          9,
          'form1[0].Sections7-9[0].From_Datefield_Name_2[1]',
          ""
        ),
        isIssueDateEstimated: createFieldFromReference(
          9,
          'form1[0].Sections7-9[0].#field[25]',
          false
        ),
        issueCity: createFieldFromReference(
          9,
          'form1[0].Sections7-9[0].TextField11[5]',
          ""
        ),
        issueState: createFieldFromReference(
          9,
          'form1[0].Sections7-9[0].School6_State[0]',
          ""
        ),
        issueCountry: createFieldFromReference(
          9,
          'form1[0].Sections7-9[0].DropDownList12[0]',
          ""
        ),
        nameOnDocument: {
          firstName: createFieldFromReference(
            9,
            'form1[0].Sections7-9[0].TextField11[8]',
            ""
          ),
          middleName: createFieldFromReference(
            9,
            'form1[0].Sections7-9[0].TextField11[6]',
            ""
          ),
          lastName: createFieldFromReference(
            9,
            'form1[0].Sections7-9[0].TextField11[7]',
            ""
          ),
          suffix: createFieldFromReference(
            9,
            'form1[0].Sections7-9[0].suffix[1]',
            ""
          ),
        },
        wasBornOnMilitaryInstallation: createFieldFromReference(
          9,
          'form1[0].Sections7-9[0].RadioButtonList[2]',
          ""
        ),
        militaryBaseName: createFieldFromReference(
          9,
          'form1[0].Sections7-9[0].TextField11[18]',
          ""
        ),
        certificateNumber: createFieldFromReference(
          9,
          'form1[0].Sections7-9[0].TextField11[12]',
          ""
        ),
        certificateIssueDate: createFieldFromReference(
          9,
          'form1[0].Sections7-9[0].From_Datefield_Name_2[2]',
          ""
        ),
        isCertificateDateEstimated: createFieldFromReference(
          9,
          'form1[0].Sections7-9[0].#field[28]',
          false
        ),
        nameOnCertificate: {
          firstName: createFieldFromReference(
            9,
            'form1[0].Sections7-9[0].TextField11[11]',
            ""
          ),
          middleName: createFieldFromReference(
            9,
            'form1[0].Sections7-9[0].TextField11[9]',
            ""
          ),
          lastName: createFieldFromReference(
            9,
            'form1[0].Sections7-9[0].TextField11[10]',
            ""
          ),
          suffix: createFieldFromReference(
            9,
            'form1[0].Sections7-9[0].suffix[2]',
            ""
          ),
        },
      },
      // Naturalized Citizen subsection (9.2) - using actual field names from sections-reference
      naturalizedCitizen: {
        naturalizedCertificateNumber: createFieldFromReference(
          9,
          'form1[0].Section9\\.1-9\\.4[0].TextField11[6]',
          ""
        ),
        nameOnCertificate: {
          firstName: createFieldFromReference(
            9,
            'form1[0].Section9\\.1-9\\.4[0].TextField11[3]',
            ""
          ),
          middleName: createFieldFromReference(
            9,
            'form1[0].Section9\\.1-9\\.4[0].TextField11[1]',
            ""
          ),
          lastName: createFieldFromReference(
            9,
            'form1[0].Section9\\.1-9\\.4[0].TextField11[2]',
            ""
          ),
          suffix: createFieldFromReference(
            9,
            'form1[0].Section9\\.1-9\\.4[0].suffix[0]',
            ""
          ),
        },
        courtAddress: {
          street: createFieldFromReference(
            9,
            'form1[0].Section9\\.1-9\\.4[0].TextField11[4]',
            ""
          ),
          city: createFieldFromReference(
            9,
            'form1[0].Section9\\.1-9\\.4[0].TextField11[0]',
            ""
          ),
          state: createFieldFromReference(
            9,
            'form1[0].Section9\\.1-9\\.4[0].School6_State[0]',
            ""
          ),
          zipCode: createFieldFromReference(
            9,
            'form1[0].Section9\\.1-9\\.4[0].TextField11[5]',
            ""
          ),
        },
        courtName: createFieldFromReference(
          9,
          'form1[0].Section9\\.1-9\\.4[0].TextField11[15]',
          ""
        ),
        certificateIssueDate: createFieldFromReference(
          9,
          'form1[0].Section9\\.1-9\\.4[0].From_Datefield_Name_2[0]',
          ""
        ),
        isCertificateDateEstimated: createFieldFromReference(
          9,
          'form1[0].Section9\\.1-9\\.4[0].#field[10]',
          false
        ),
        otherExplanation: createFieldFromReference(
          9,
          'form1[0].Section9\\.1-9\\.4[0].TextField11[7]',
          ""
        ),
        entryDate: createFieldFromReference(
          9,
          'form1[0].Section9\\.1-9\\.4[0].From_Datefield_Name_2[4]',
          ""
        ),
        isEntryDateEstimated: createFieldFromReference(
          9,
          'form1[0].Section9\\.1-9\\.4[0].#field[32]',
          false
        ),
        entryCity: createFieldFromReference(
          9,
          'form1[0].Section9\\.1-9\\.4[0].TextField11[16]',
          ""
        ),
        entryState: createFieldFromReference(
          9,
          'form1[0].Section9\\.1-9\\.4[0].School6_State[1]',
          ""
        ),
        priorCitizenship: createFieldFromReference(
          9,
          'form1[0].Section9\\.1-9\\.4[0].DropDownList15[0]',
          ""
        ),
      },
      // Derived Citizen subsection (9.3) - using actual field names from sections-reference
      derivedCitizen: {
        alienRegistrationNumber: createFieldFromReference(
          9,
          'form1[0].Section9\\.1-9\\.4[0].TextField11[17]',
          ""
        ),
        permanentResidentCardNumber: createFieldFromReference(
          9,
          'form1[0].Section9\\.1-9\\.4[0].TextField11[18]',
          ""
        ),
        certificateOfCitizenshipNumber: createFieldFromReference(
          9,
          'form1[0].Section9\\.1-9\\.4[0].TextField11[19]',
          ""
        ),
        nameOnDocument: {
          firstName: createFieldFromReference(
            9,
            'form1[0].Section9\\.1-9\\.4[0].TextField11[20]',
            ""
          ),
          middleName: createFieldFromReference(
            9,
            'form1[0].Section9\\.1-9\\.4[0].TextField11[21]',
            ""
          ),
          lastName: createFieldFromReference(
            9,
            'form1[0].Section9\\.1-9\\.4[0].TextField11[22]',
            ""
          ),
          suffix: createFieldFromReference(
            9,
            'form1[0].Section9\\.1-9\\.4[0].suffix[2]',
            ""
          ),
        },
        basis: createFieldFromReference(
          9,
          'form1[0].Section9\\.1-9\\.4[0].RadioButtonList[1]',
          "By operation of law through my U.S. citizen parent"
        ),
        otherExplanation: createFieldFromReference(
          9,
          'form1[0].Section9\\.1-9\\.4[0].TextField11[23]',
          ""
        ),
      },
      // Non-US Citizen subsection (9.4) - using actual field names from sections-reference
      nonUSCitizen: {
        residenceStatus: createFieldFromReference(
          9,
          'form1[0].Section9\\.1-9\\.4[0].TextField11[8]',
          ""
        ),
        entryDate: createFieldFromReference(
          9,
          'form1[0].Section9\\.1-9\\.4[0].From_Datefield_Name_2[1]',
          ""
        ),
        isEntryDateEstimated: createFieldFromReference(
          9,
          'form1[0].Section9\\.1-9\\.4[0].#field[15]',
          false
        ),
        alienRegistrationNumber: createFieldFromReference(
          9,
          'form1[0].Section9\\.1-9\\.4[0].TextField11[9]',
          ""
        ),
        documentIssueDate: createFieldFromReference(
          9,
          'form1[0].Section9\\.1-9\\.4[0].From_Datefield_Name_2[2]',
          ""
        ),
        isDocumentIssueDateEstimated: createFieldFromReference(
          9,
          'form1[0].Section9\\.1-9\\.4[0].#field[18]',
          false
        ),
        documentExpirationDate: createFieldFromReference(
          9,
          'form1[0].Section9\\.1-9\\.4[0].From_Datefield_Name_2[3]',
          ""
        ),
        isDocumentExpirationEstimated: createFieldFromReference(
          9,
          'form1[0].Section9\\.1-9\\.4[0].#field[26]',
          false
        ),
        nameOnDocument: {
          firstName: createFieldFromReference(
            9,
            'form1[0].Section9\\.1-9\\.4[0].TextField11[12]',
            ""
          ),
          middleName: createFieldFromReference(
            9,
            'form1[0].Section9\\.1-9\\.4[0].TextField11[10]',
            ""
          ),
          lastName: createFieldFromReference(
            9,
            'form1[0].Section9\\.1-9\\.4[0].TextField11[11]',
            ""
          ),
          suffix: createFieldFromReference(
            9,
            'form1[0].Section9\\.1-9\\.4[0].suffix[1]',
            ""
          ),
        },
        documentNumber: createFieldFromReference(
          9,
          'form1[0].Section9\\.1-9\\.4[0].TextField11[13]',
          ""
        ),
        hasAlienRegistration: createFieldFromReference(
          9,
          'form1[0].Section9\\.1-9\\.4[0].RadioButtonList[0]',
          "1"
        ),
        explanation: createFieldFromReference(
          9,
          'form1[0].Section9\\.1-9\\.4[0].TextField11[14]',
          ""
        ),
      },
    },
  };
};
