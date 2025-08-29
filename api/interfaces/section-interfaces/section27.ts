/**
 * Section 27: Use of Information Technology Systems
 *
 * This interface defines the structure for SF-86 Section 27 data.
 * Uses DRY approach with sections-references as single source of truth.
 *
 * ACTUAL PDF STRUCTURE (based on sections-references analysis):
 * - 27.1 Illegal Access: Section27[0] RadioButtonList[0] + first half of fields
 * - 27.2 Illegal Modification: Section27_2[0] RadioButtonList[0] + all Section27_2 fields
 * - 27.3 Unauthorized Entry: Section27[0] RadioButtonList[1] + second half of Section27[0] fields
 *
 * Each subsection supports 2 entries with location, date, description, and action fields.
 */

import type { Field } from '../formDefinition2.0';
import { createFieldFromReference, validateSectionFieldCount } from '../../utils/sections-references-loader';

// ============================================================================
// CORE INTERFACES
// ============================================================================

/**
 * Base entry structure for all Section 27 incidents
 * Each entry represents one incident with location, date, description, and action taken
 */
export interface Section27BaseEntry {
  // Location fields (area-based)
  location: {
    street: Field<string>;
    city: Field<string>;
    state: Field<string>;
    zipCode: Field<string>;
    country: Field<string>;
  };
  // Incident details
  description: Field<string>;
  incidentDate: {
    date: Field<string>;
    estimated: Field<boolean>;
  };
  actionTaken: Field<string>;
}

/**
 * 27.1 Illegal Access Entry
 * Uses Section27[0] fields with area[0] and area[1] patterns
 */
export interface Section27_1Entry extends Section27BaseEntry {
  // Entry-specific fields for illegal access incidents
}

/**
 * 27.2 Illegal Modification Entry
 * Uses Section27_2[0] fields with area[0] and area[1] patterns
 */
export interface Section27_2Entry extends Section27BaseEntry {
  // Entry-specific fields for illegal modification incidents
}

/**
 * 27.3 Unauthorized Entry
 * Uses Section27[0] fields with area[2] and area[3] patterns
 */
export interface Section27_3Entry extends Section27BaseEntry {
  // Entry-specific fields for unauthorized entry incidents
}

/**
 * Generic subsection structure for Section 27
 * Each subsection has a yes/no question and supports up to 2 entries
 */
export interface Section27Subsection<T extends Section27BaseEntry> {
  hasViolation: Field<"YES" | "NO">;
  entries: T[];
  entriesCount: number;
}

/**
 * Main Section 27 interface structure
 * Maps to the actual PDF structure with 3 distinct subsections
 */
export interface Section27 {
  _id: 27;
  section27: {
    /** 27.1 Illegal Access - Section27[0] RadioButtonList[0] */
    illegalAccess: Section27Subsection<Section27_1Entry>;
    /** 27.2 Illegal Modification - Section27_2[0] RadioButtonList[0] */
    illegalModification: Section27Subsection<Section27_2Entry>;
    /** 27.3 Unauthorized Entry - Section27[0] RadioButtonList[1] */
    unauthorizedEntry: Section27Subsection<Section27_3Entry>;
  }
}

// ============================================================================
// SUBSECTION KEYS
// ============================================================================

export type Section27SubsectionKey = 'illegalAccess' | 'illegalModification' | 'unauthorizedEntry';

// ============================================================================
// VALIDATION INTERFACES
// ============================================================================

export interface TechnologyValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

// ============================================================================
// FIELD MAPPING PATTERNS (Based on sections-reference/section-27.json analysis)
// ============================================================================

/**
 * Field patterns for Section 27 entries - CRITICAL for correct PDF mapping
 * Based on comprehensive analysis of sections-reference/section-27.json
 *
 * Pattern Analysis:
 * - 27.1 Illegal Access: Uses area[0] and area[1] for 2 entries
 * - 27.2 Illegal Modification: Uses Section27_2[0] area[0] and area[1] for 2 entries
 * - 27.3 Unauthorized Entry: Uses area[2] and area[3] for 2 entries
 */
const SECTION27_FIELD_PATTERNS = {
  illegalAccess: {
    radioButton: 'form1[0].Section27[0].RadioButtonList[0]',
    entries: [
      {
        // Entry 1 - area[0] pattern
        street: 'form1[0].Section27[0].#area[0].TextField11[0]',
        city: 'form1[0].Section27[0].#area[0].TextField11[1]',
        zipCode: 'form1[0].Section27[0].#area[0].TextField11[2]',
        description: 'form1[0].Section27[0].TextField11[4]',
        actionTaken: 'form1[0].Section27[0].TextField11[3]',
        date: 'form1[0].Section27[0].From_Datefield_Name_2[0]',
        estimated: 'form1[0].Section27[0].#field[8]'
      },
      {
        // Entry 2 - area[1] pattern
        street: 'form1[0].Section27[0].#area[1].TextField11[5]',
        city: 'form1[0].Section27[0].#area[1].TextField11[6]',
        zipCode: 'form1[0].Section27[0].#area[1].TextField11[7]',
        description: 'form1[0].Section27[0].TextField11[9]',
        actionTaken: 'form1[0].Section27[0].TextField11[8]',
        date: 'form1[0].Section27[0].From_Datefield_Name_2[1]',
        estimated: 'form1[0].Section27[0].#field[17]'
      }
    ]
  },
  illegalModification: {
    radioButton: 'form1[0].Section27_2[0].RadioButtonList[0]',
    entries: [
      {
        // Entry 1 - Section27_2 area[0] pattern
        street: 'form1[0].Section27_2[0].#area[0].TextField11[0]',
        city: 'form1[0].Section27_2[0].#area[0].TextField11[1]',
        zipCode: 'form1[0].Section27_2[0].#area[0].TextField11[2]',
        description: 'form1[0].Section27_2[0].TextField11[4]',
        actionTaken: 'form1[0].Section27_2[0].TextField11[3]',
        date: 'form1[0].Section27_2[0].From_Datefield_Name_2[0]',
        estimated: 'form1[0].Section27_2[0].#field[8]'
      },
      {
        // Entry 2 - Section27_2 area[1] pattern
        street: 'form1[0].Section27_2[0].#area[1].TextField11[5]',
        city: 'form1[0].Section27_2[0].#area[1].TextField11[6]',
        zipCode: 'form1[0].Section27_2[0].#area[1].TextField11[7]',
        description: 'form1[0].Section27_2[0].TextField11[9]',
        actionTaken: 'form1[0].Section27_2[0].TextField11[8]',
        date: 'form1[0].Section27_2[0].From_Datefield_Name_2[1]',
        estimated: 'form1[0].Section27_2[0].#field[17]'
      }
    ]
  },
  unauthorizedEntry: {
    radioButton: 'form1[0].Section27[0].RadioButtonList[1]',
    entries: [
      {
        // Entry 1 - area[2] pattern
        street: 'form1[0].Section27[0].#area[2].TextField11[10]',
        city: 'form1[0].Section27[0].#area[2].TextField11[11]',
        zipCode: 'form1[0].Section27[0].#area[2].TextField11[12]',
        description: 'form1[0].Section27[0].TextField11[14]',
        actionTaken: 'form1[0].Section27[0].TextField11[13]',
        date: 'form1[0].Section27[0].From_Datefield_Name_2[2]',
        estimated: 'form1[0].Section27[0].#field[26]'
      },
      {
        // Entry 2 - area[3] pattern
        street: 'form1[0].Section27[0].#area[3].TextField11[15]',
        city: 'form1[0].Section27[0].#area[3].TextField11[16]',
        zipCode: 'form1[0].Section27[0].#area[3].TextField11[17]',
        description: 'form1[0].Section27[0].TextField11[19]',
        actionTaken: 'form1[0].Section27[0].TextField11[18]',
        date: 'form1[0].Section27[0].From_Datefield_Name_2[3]',
        estimated: 'form1[0].Section27[0].#field[35]'
      }
    ]
  }
} as const;

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Creates a default Section 27.1 entry (Illegal Access)
 * Uses actual PDF field patterns from sections-references analysis
 */
export const createDefaultSection27_1Entry = (entryIndex: number = 0): Section27_1Entry => {
  const pattern = SECTION27_FIELD_PATTERNS.illegalAccess.entries[entryIndex] || SECTION27_FIELD_PATTERNS.illegalAccess.entries[0];

  return {
    location: {
      street: createFieldFromReference(27, pattern.street, ''),
      city: createFieldFromReference(27, pattern.city, ''),
      state: createFieldFromReference(27, 'form1[0].Section27[0].#area[0].School6_State[0]', ''), // Dropdown field
      zipCode: createFieldFromReference(27, pattern.zipCode, ''),
      country: createFieldFromReference(27, 'form1[0].Section27[0].#area[0].DropDownList12[0]', '') // Dropdown field
    },
    description: createFieldFromReference(27, pattern.description, ''),
    incidentDate: {
      date: createFieldFromReference(27, pattern.date, ''),
      estimated: createFieldFromReference(27, pattern.estimated, false)
    },
    actionTaken: createFieldFromReference(27, pattern.actionTaken, '')
  };
};

/**
 * Creates a default Section 27.2 entry (Illegal Modification)
 * Uses actual PDF field patterns from Section27_2[0] fields
 */
export const createDefaultSection27_2Entry = (entryIndex: number = 0): Section27_2Entry => {
  const pattern = SECTION27_FIELD_PATTERNS.illegalModification.entries[entryIndex] || SECTION27_FIELD_PATTERNS.illegalModification.entries[0];

  return {
    location: {
      street: createFieldFromReference(27, pattern.street, ''),
      city: createFieldFromReference(27, pattern.city, ''),
      state: createFieldFromReference(27, 'form1[0].Section27_2[0].#area[0].School6_State[0]', ''), // Dropdown field
      zipCode: createFieldFromReference(27, pattern.zipCode, ''),
      country: createFieldFromReference(27, 'form1[0].Section27_2[0].#area[0].DropDownList9[0]', '') // Dropdown field
    },
    description: createFieldFromReference(27, pattern.description, ''),
    incidentDate: {
      date: createFieldFromReference(27, pattern.date, ''),
      estimated: createFieldFromReference(27, pattern.estimated, false)
    },
    actionTaken: createFieldFromReference(27, pattern.actionTaken, '')
  };
};

/**
 * Creates a default Section 27.3 entry (Unauthorized Entry)
 * Uses actual PDF field patterns from Section27[0] area[2] and area[3] fields
 */
export const createDefaultSection27_3Entry = (entryIndex: number = 0): Section27_3Entry => {
  const pattern = SECTION27_FIELD_PATTERNS.unauthorizedEntry.entries[entryIndex] || SECTION27_FIELD_PATTERNS.unauthorizedEntry.entries[0];

  return {
    location: {
      street: createFieldFromReference(27, pattern.street, ''),
      city: createFieldFromReference(27, pattern.city, ''),
      state: createFieldFromReference(27, 'form1[0].Section27[0].#area[2].School6_State[2]', ''), // Dropdown field
      zipCode: createFieldFromReference(27, pattern.zipCode, ''),
      country: createFieldFromReference(27, 'form1[0].Section27[0].#area[2].DropDownList10[0]', '') // Dropdown field
    },
    description: createFieldFromReference(27, pattern.description, ''),
    incidentDate: {
      date: createFieldFromReference(27, pattern.date, ''),
      estimated: createFieldFromReference(27, pattern.estimated, false)
    },
    actionTaken: createFieldFromReference(27, pattern.actionTaken, '')
  };
};

/**
 * Creates a default Section 27 data structure using DRY approach with sections-references
 * This eliminates hardcoded values and uses the single source of truth
 *
 * Updated to match actual PDF structure with correct field mappings
 */
export const createDefaultSection27 = (): Section27 => {
  // Validate field count against sections-references
  validateSectionFieldCount(27);

  return {
    _id: 27,
    section27: {
      illegalAccess: {
        hasViolation: createFieldFromReference(27, SECTION27_FIELD_PATTERNS.illegalAccess.radioButton, "NO"),
        entries: [],
        entriesCount: 0
      },
      illegalModification: {
        hasViolation: createFieldFromReference(27, SECTION27_FIELD_PATTERNS.illegalModification.radioButton, "NO"),
        entries: [],
        entriesCount: 0
      },
      unauthorizedEntry: {
        hasViolation: createFieldFromReference(27, SECTION27_FIELD_PATTERNS.unauthorizedEntry.radioButton, "NO"),
        entries: [],
        entriesCount: 0
      }
    }
  };
};
