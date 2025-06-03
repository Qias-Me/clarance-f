/**
 * Section 27: Use of Information Technology Systems
 *
 * This interface defines the structure for SF-86 Section 27 data.
 * Uses DRY approach with sections-references as single source of truth.
 */

import type { Field } from '../formDefinition2.0';
import { createFieldFromReference, validateSectionFieldCount } from '../../utils/sections-references-loader';

// ============================================================================
// CORE INTERFACES
// ============================================================================

export interface Section27Entry {
  description: Field<string>;
  incidentDate: {
    date: Field<string>;
    estimated: Field<boolean>;
  };
  actionTaken: Field<string>;
  currentStatus: Field<string>;
}

export interface Section27_1Entry extends Section27Entry {
  // Illegal Access specific fields
  systemAccessed: Field<string>;
  accessMethod: Field<string>;
}

export interface Section27_2Entry extends Section27Entry {
  // Illegal Modification specific fields
  systemModified: Field<string>;
  modificationType: Field<string>;
}

export interface Section27_3Entry extends Section27Entry {
  // Unauthorized Use specific fields
  systemUsed: Field<string>;
  useType: Field<string>;
}

export interface Section27Subsection {
  hasViolation: Field<"YES" | "NO">;
  entries: Section27Entry[];
  entriesCount: number;
}

export interface Section27 {
  _id: 27;
  section27: {
  illegalAccess: Section27Subsection;
  illegalModification: Section27Subsection;
  unauthorizedUse: Section27Subsection;
  }
}

// ============================================================================
// SUBSECTION KEYS
// ============================================================================

export type Section27SubsectionKey = 'illegalAccess' | 'illegalModification' | 'unauthorizedUse';

// ============================================================================
// VALIDATION INTERFACES
// ============================================================================

export interface TechnologyValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Creates a default Section 27.1 entry (Illegal Access)
 */
export const createDefaultSection27_1Entry = (): Section27_1Entry => ({
  description: createFieldFromReference(27, 'form1[0].Section27[0].TextField11[0]', ''),
  incidentDate: {
    date: createFieldFromReference(27, 'form1[0].Section27[0].From_Datefield_Name_2[0]', ''),
    estimated: createFieldFromReference(27, 'form1[0].Section27[0].#field[8]', false)
  },
  actionTaken: createFieldFromReference(27, 'form1[0].Section27[0].TextField11[3]', ''),
  currentStatus: createFieldFromReference(27, 'form1[0].Section27[0].TextField11[1]', ''),
  systemAccessed: createFieldFromReference(27, 'form1[0].Section27[0].#area[0].TextField11[0]', ''),
  accessMethod: createFieldFromReference(27, 'form1[0].Section27[0].#area[0].TextField11[1]', '')
});

/**
 * Creates a default Section 27.2 entry (Illegal Modification)
 */
export const createDefaultSection27_2Entry = (): Section27_2Entry => ({
  description: createFieldFromReference(27, 'form1[0].Section27_2[0].TextField11[0]', ''),
  incidentDate: {
    date: createFieldFromReference(27, 'form1[0].Section27_2[0].From_Datefield_Name[0]', ''),
    estimated: createFieldFromReference(27, 'form1[0].Section27_2[0].#field[0]', false)
  },
  actionTaken: createFieldFromReference(27, 'form1[0].Section27_2[0].TextField11[1]', ''),
  currentStatus: createFieldFromReference(27, 'form1[0].Section27_2[0].TextField11[2]', ''),
  systemModified: createFieldFromReference(27, 'form1[0].Section27_2[0].TextField11[3]', ''),
  modificationType: createFieldFromReference(27, 'form1[0].Section27_2[0].TextField11[4]', '')
});

/**
 * Creates a default Section 27.3 entry (Unauthorized Use)
 * Note: Section 27 only has 2 subsections in the PDF, so this uses fallback fields
 */
export const createDefaultSection27_3Entry = (): Section27_3Entry => ({
  description: createFieldFromReference(27, 'form1[0].Section27[0].TextField11[2]', ''),
  incidentDate: {
    date: createFieldFromReference(27, 'form1[0].Section27[0].From_Datefield_Name_2[0]', ''),
    estimated: createFieldFromReference(27, 'form1[0].Section27[0].#field[8]', false)
  },
  actionTaken: createFieldFromReference(27, 'form1[0].Section27[0].TextField11[3]', ''),
  currentStatus: createFieldFromReference(27, 'form1[0].Section27[0].TextField11[4]', ''),
  systemUsed: createFieldFromReference(27, 'form1[0].Section27[0].#area[0].TextField11[2]', ''),
  useType: createFieldFromReference(27, 'form1[0].Section27[0].#area[0].School6_State[0]', '')
});

/**
 * Creates a default Section 27 data structure using DRY approach with sections-references
 * This eliminates hardcoded values and uses the single source of truth
 */
export const createDefaultSection27 = (): Section27 => {
  // Validate field count against sections-references
  validateSectionFieldCount(27);

  return {
    _id: 27,
    section27: {
    illegalAccess: {
      hasViolation: createFieldFromReference(27, 'form1[0].Section27[0].RadioButtonList[0]', "NO"),
      entries: [],
      entriesCount: 0
    },
    illegalModification: {
      hasViolation: createFieldFromReference(27, 'form1[0].Section27_2[0].RadioButtonList[0]', "NO"),
      entries: [],
      entriesCount: 0
    },
    unauthorizedUse: {
      // Section 27 only has 2 subsections in the PDF, so we'll use a fallback field
      hasViolation: createFieldFromReference(27, 'form1[0].Section27[0].RadioButtonList[1]', "NO"),
      entries: [],
        entriesCount: 0
      }
    }
  };
};
