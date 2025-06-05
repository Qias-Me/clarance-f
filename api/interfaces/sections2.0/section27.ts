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

export interface Section27Location {
  street: Field<string>;
  city: Field<string>;
  state: Field<string>;
  zipCode: Field<string>;
  country: Field<string>;
}

export interface Section27Entry {
  description: Field<string>;
  incidentDate: {
    date: Field<string>;
    estimated: Field<boolean>;
  };
  location: Section27Location;
  actionTaken: Field<string>;
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
export const createDefaultSection27_1Entry = (): Section27_1Entry => {
  console.log('🔍 Creating Section 27.1 entry...');
  
  const entry = {
    description: createFieldFromReference(27, 'form1[0].Section27[0].TextField11[4]', ''),
    incidentDate: {
      date: createFieldFromReference(27, 'form1[0].Section27[0].From_Datefield_Name_2[0]', ''),
      estimated: createFieldFromReference(27, 'form1[0].Section27[0].#field[8]', false)
    },
    location: {
      street: createFieldFromReference(27, 'form1[0].Section27[0].#area[0].TextField11[0]', ''),
      city: createFieldFromReference(27, 'form1[0].Section27[0].#area[0].TextField11[1]', ''),
      state: createFieldFromReference(27, 'form1[0].Section27[0].#area[0].School6_State[0]', ''),
      zipCode: createFieldFromReference(27, 'form1[0].Section27[0].#area[0].TextField11[2]', ''),
      country: createFieldFromReference(27, 'form1[0].Section27[0].#area[0].DropDownList12[0]', '')
    },
    actionTaken: createFieldFromReference(27, 'form1[0].Section27[0].TextField11[3]', ''),
    systemAccessed: createFieldFromReference(27, 'form1[0].Section27[0].TextField11[8]', ''),
    accessMethod: createFieldFromReference(27, 'form1[0].Section27[0].TextField11[9]', '')
  };

  console.log('✅ Section 27.1 entry created:', {
    description: entry.description,
    incidentDate: entry.incidentDate,
    location: entry.location,
    actionTaken: entry.actionTaken,
    systemAccessed: entry.systemAccessed,
    accessMethod: entry.accessMethod
  });

  return entry;
};

/**
 * Creates a default Section 27.2 entry (Illegal Modification)
 */
export const createDefaultSection27_2Entry = (): Section27_2Entry => {
  console.log('🔍 Creating Section 27.2 entry...');
  
  const entry = {
    description: createFieldFromReference(27, 'form1[0].Section27_2[0].TextField11[4]', ''),
    incidentDate: {
      date: createFieldFromReference(27, 'form1[0].Section27_2[0].From_Datefield_Name_2[0]', ''),
      estimated: createFieldFromReference(27, 'form1[0].Section27_2[0].#field[8]', false)
    },
    location: {
      street: createFieldFromReference(27, 'form1[0].Section27_2[0].#area[0].TextField11[0]', ''),
      city: createFieldFromReference(27, 'form1[0].Section27_2[0].#area[0].TextField11[1]', ''),
      state: createFieldFromReference(27, 'form1[0].Section27_2[0].#area[0].School6_State[0]', ''),
      zipCode: createFieldFromReference(27, 'form1[0].Section27_2[0].#area[0].TextField11[2]', ''),
      country: createFieldFromReference(27, 'form1[0].Section27_2[0].#area[0].DropDownList12[0]', '')
    },
    actionTaken: createFieldFromReference(27, 'form1[0].Section27_2[0].TextField11[3]', ''),
    systemModified: createFieldFromReference(27, 'form1[0].Section27_2[0].TextField11[8]', ''),
    modificationType: createFieldFromReference(27, 'form1[0].Section27_2[0].TextField11[9]', '')
  };

  console.log('✅ Section 27.2 entry created:', {
    description: entry.description,
    incidentDate: entry.incidentDate,
    location: entry.location,
    actionTaken: entry.actionTaken,
    systemModified: entry.systemModified,
    modificationType: entry.modificationType
  });

  return entry;
};

/**
 * Creates a default Section 27.3 entry (Unauthorized Use)
 * Uses the second RadioButtonList for this subsection
 */
export const createDefaultSection27_3Entry = (): Section27_3Entry => {
  console.log('🔍 Creating Section 27.3 entry...');
  
  const entry = {
    description: createFieldFromReference(27, 'form1[0].Section27[0].TextField11[18]', ''),
    incidentDate: {
      date: createFieldFromReference(27, 'form1[0].Section27[0].From_Datefield_Name_2[3]', ''),
      estimated: createFieldFromReference(27, 'form1[0].Section27[0].#field[35]', false)
    },
    location: {
      street: createFieldFromReference(27, 'form1[0].Section27[0].#area[3].TextField11[15]', ''),
      city: createFieldFromReference(27, 'form1[0].Section27[0].#area[3].TextField11[16]', ''),
      state: createFieldFromReference(27, 'form1[0].Section27[0].#area[3].School6_State[3]', ''),
      zipCode: createFieldFromReference(27, 'form1[0].Section27[0].#area[3].TextField11[17]', ''),
      country: createFieldFromReference(27, 'form1[0].Section27[0].#area[3].DropDownList12[3]', '')
    },
    actionTaken: createFieldFromReference(27, 'form1[0].Section27[0].TextField11[19]', ''),
    systemUsed: createFieldFromReference(27, 'form1[0].Section27[0].TextField11[13]', ''),
    useType: createFieldFromReference(27, 'form1[0].Section27[0].TextField11[14]', '')
  };

  console.log('✅ Section 27.3 entry created:', {
    description: entry.description,
    incidentDate: entry.incidentDate,
    location: entry.location,
    actionTaken: entry.actionTaken,
    systemUsed: entry.systemUsed,
    useType: entry.useType
  });

  return entry;
};

/**
 * Creates a default Section 27 data structure using DRY approach with sections-references
 * This eliminates hardcoded values and uses the single source of truth
 */
export const createDefaultSection27 = (): Section27 => {
  console.log('🔍 Creating default Section 27 data structure...');
  
  // Validate field count against sections-references
  validateSectionFieldCount(27);

  const section27Data = {
    _id: 27 as const,
    section27: {
    illegalAccess: {
      hasViolation: createFieldFromReference(27, 'form1[0].Section27[0].RadioButtonList[0]', "NO" as "YES" | "NO"),
      entries: []
    },
    illegalModification: {
      hasViolation: createFieldFromReference(27, 'form1[0].Section27_2[0].RadioButtonList[0]', "NO" as "YES" | "NO"),
      entries: []
    },
    unauthorizedUse: {
      // Use the second RadioButtonList which exists in the actual PDF
      hasViolation: createFieldFromReference(27, 'form1[0].Section27[0].RadioButtonList[1]', "NO" as "YES" | "NO"),
      entries: []
      }
    }
  };

  console.log('✅ Section 27 default data created:', {
    illegalAccess: section27Data.section27.illegalAccess,
    illegalModification: section27Data.section27.illegalModification,
    unauthorizedUse: section27Data.section27.unauthorizedUse
  });

  return section27Data;
};
