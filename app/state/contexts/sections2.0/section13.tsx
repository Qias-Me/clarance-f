/**
 * Section 13: Employment Activities - Context Provider
 *
 * React context provider for SF-86 Section 13 using the new Form Architecture 2.0.
 * This provider manages employment history data with full CRUD operations,
 * validation, and integration with the central SF86FormContext.
 */

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect
} from 'react';
import cloneDeep from 'lodash/cloneDeep';
import set from 'lodash/set';
import type {
  Section13,
  Section13ValidationRules,
  Section13FieldUpdate,
  MilitaryEmploymentEntry,
  NonFederalEmploymentEntry,
  SelfEmploymentEntry,
  UnemploymentEntry,
  EmploymentEntry,
  FederalEmploymentInfo,
  EmploymentType,
  EmploymentStatus
} from '../../../../api/interfaces/sections2.0/section13';
// Import helper functions for field creation
import { createFieldFromReference } from '../../../../api/utils/sections-references-loader';
import { mapLogicalFieldToPdfField } from './section13-field-mapping';

import type { ValidationResult, ValidationError, ChangeSet } from '../shared/base-interfaces';
import { useSF86Form } from './SF86FormContext';

/**
 * Helper function to create a field using the logical path mapping system
 */
function createMappedField<T>(logicalPath: string, defaultValue: T): any {
  const pdfFieldName = mapLogicalFieldToPdfField(logicalPath);
  // Removed logging from here to prevent infinite loops
  // Logging should be done in useEffect or event handlers only

  try {
    return createFieldFromReference(13, pdfFieldName, defaultValue);
  } catch (error) {
    // Silent fallback to prevent console spam
    return {
      name: pdfFieldName,
      id: pdfFieldName,
      type: 'text',
      label: logicalPath,
      value: defaultValue,
      rect: { x: 0, y: 0, width: 0, height: 0 }
    };
  }
}

/**
 * Helper function to create a mapped field with entry indexing support
 * Automatically generates the correct logical path for employment entries
 */
function createMappedFieldForEntry<T>(employmentType: string, entryIndex: number, fieldPath: string, defaultValue: T): any {
  const logicalPath = `section13.${employmentType}.entries[${entryIndex}].${fieldPath}`;
  const pdfFieldName = mapLogicalFieldToPdfField(logicalPath);
  // Removed logging from here to prevent infinite loops
  // Logging should be done in useEffect or event handlers only

  try {
    return createFieldFromReference(13, pdfFieldName, defaultValue);
  } catch (error) {
    // Silent fallback to prevent console spam
    return {
      name: pdfFieldName,
      id: pdfFieldName,
      type: 'text',
      label: logicalPath,
      value: defaultValue,
      rect: { x: 0, y: 0, width: 0, height: 0 }
    };
  }
}

// ============================================================================
// FACTORY FUNCTIONS (Moved from Interface Layer)
// ============================================================================

/**
 * Creates a default military employment entry (Section 13A.1)
 * Maps to the correct PDF field names from section-13.json
 */
export const createDefaultMilitaryEmploymentEntry = (entryId: string | number): MilitaryEmploymentEntry => {
  return {
    _id: entryId,

    // Basic Employment Information - CORRECTED FIELD MAPPINGS
    employerName: createMappedField('employerName', ''),
    positionTitle: createMappedField('positionTitle', ''),

    // Supervisor Information - CORRECTED FIELD MAPPINGS
    supervisor: {
      name: createMappedField('supervisor.name', ''),
      title: createMappedField('supervisor.title', ''),
      email: createMappedField('supervisor.email', ''),
      emailUnknown: createMappedField('supervisor.emailUnknown', false),
      phone: {
        number: createMappedField('supervisor.phone.number', ''),
        extension: createMappedField('supervisor.phone.extension', ''),
        isDSN: createMappedField('supervisor.phone.isDSN', false),
        isDay: createMappedField('supervisor.phone.isDay', false),
        isNight: createMappedField('supervisor.phone.isNight', false)
      },
      workLocation: {
        street: createMappedField('supervisor.workLocation.street', ''),
        city: createMappedField('supervisor.workLocation.city', ''),
        state: createMappedField('supervisor.workLocation.state', ''),
        zipCode: createMappedField('supervisor.workLocation.zipCode', ''),
        country: createMappedField('supervisor.workLocation.country', 'United States')
      },
      hasApoFpo: createMappedField('supervisor.hasApoFpo', false),
      canContact: createMappedField('supervisor.canContact', 'YES' as "YES" | "NO"),
      contactRestrictions: createMappedField('supervisor.contactRestrictions', '')
    },



    // Employment Dates - CORRECTED FIELD MAPPINGS
    employmentDates: {
      fromDate: createMappedField('employmentDates.fromDate', ''),
      toDate: createMappedField('employmentDates.toDate', ''),
      fromEstimated: createMappedField('employmentDates.fromEstimated', false),
      toEstimated: createMappedField('employmentDates.toEstimated', false),
      present: createMappedField('employmentDates.present', false)
    },

    employmentStatus: {
      ...createMappedField('employmentStatus', 'Full-time' as EmploymentStatus),
      options: ['Full-time', 'Part-time'] as const
    },

    rankTitle: createMappedField('rankTitle', ''),
    dutyStation: {
      dutyStation: createMappedField('dutyStation.dutyStation', ''),
      street: createMappedField('dutyStation.street', ''),
      city: createMappedField('dutyStation.city', ''),
      state: {
        ...createMappedField('dutyStation.state', ''),
        options: []
      },
      zipCode: createMappedField('dutyStation.zipCode', ''),
      country: {
        ...createMappedField('dutyStation.country', ''),
        options: []
      }
    },

    phone: {
      number: createMappedField('phone.number', ''),
      extension: createMappedField('phone.extension', ''),
      isDSN: createMappedField('phone.isDSN', false),
      isDay: createMappedField('phone.isDay', false),
      isNight: createMappedField('phone.isNight', false)
    },

    otherExplanation: createMappedField('otherExplanation', '')
  };
};

/**
 * Creates a default non-federal employment entry (Section 13A.2)
 */
export const createDefaultNonFederalEmploymentEntry = (entryId: string | number): NonFederalEmploymentEntry => {
  return {
    _id: entryId,

    // Basic Employment Information - NOW USING MAPPED FIELDS
    employerName: createMappedField('section13.nonFederalEmployment.entries[0].employer.name', ''),
    positionTitle: createMappedField('section13.nonFederalEmployment.entries[0].position.title', ''),

    // Supervisor Information - NOW USING MAPPED FIELDS
    supervisor: {
      name: createMappedField('section13.nonFederalEmployment.entries[0].supervisor.name', ''),
      title: createMappedField('section13.nonFederalEmployment.entries[0].supervisor.title', ''),
      email: createMappedField('section13.nonFederalEmployment.entries[0].supervisor.email', ''),
      emailUnknown: createMappedField('section13.nonFederalEmployment.entries[0].supervisor.emailUnknown', false),
      phone: {
        number: createMappedField('section13.nonFederalEmployment.entries[0].supervisor.phone', ''),
        extension: createMappedField('section13.nonFederalEmployment.entries[0].supervisor.phone.extension', ''),
        isDSN: createMappedField('section13.nonFederalEmployment.entries[0].supervisor.phone.isDSN', false),
        isDay: createMappedField('section13.nonFederalEmployment.entries[0].supervisor.phone.isDay', false),
        isNight: createMappedField('section13.nonFederalEmployment.entries[0].supervisor.phone.isNight', false)
      },
      workLocation: {
        street: createMappedField('section13.nonFederalEmployment.entries[0].supervisor.workLocation.street', ''),
        city: createMappedField('section13.nonFederalEmployment.entries[0].supervisor.workLocation.city', ''),
        state: {
          ...createMappedField('section13.nonFederalEmployment.entries[0].supervisor.workLocation.state', ''),
          options: []
        },
        zipCode: createMappedField('section13.nonFederalEmployment.entries[0].supervisor.workLocation.zipCode', ''),
        country: {
          ...createMappedField('section13.nonFederalEmployment.entries[0].supervisor.workLocation.country', ''),
          options: []
        }
      },
      hasApoFpo: createMappedField('section13.nonFederalEmployment.entries[0].supervisor.hasApoFpo', false),
      canContact: createMappedField('section13.nonFederalEmployment.entries[0].supervisor.canContact', "YES" as "YES" | "NO"),
      contactRestrictions: createMappedField('section13.nonFederalEmployment.entries[0].supervisor.contactRestrictions', '')
    },

    // Employer Address - NOW USING MAPPED FIELDS
    employerAddress: {
      street: createMappedField('section13.nonFederalEmployment.entries[0].employerAddress.street', ''),
      city: createMappedField('section13.nonFederalEmployment.entries[0].employerAddress.city', ''),
      state: createMappedField('section13.nonFederalEmployment.entries[0].employerAddress.state', ''),
      zipCode: createMappedField('section13.nonFederalEmployment.entries[0].employerAddress.zipCode', ''),
      country: createMappedField('section13.nonFederalEmployment.entries[0].employerAddress.country', '')
    },

    // Employment Dates - NOW USING MAPPED FIELDS
    employmentDates: {
      fromDate: createMappedField('section13.nonFederalEmployment.entries[0].employmentDates.fromDate', ''),
      toDate: createMappedField('section13.nonFederalEmployment.entries[0].employmentDates.toDate', ''),
      fromEstimated: createMappedField('section13.nonFederalEmployment.entries[0].employmentDates.fromEstimated', false),
      toEstimated: createMappedField('section13.nonFederalEmployment.entries[0].employmentDates.toEstimated', false),
      present: createMappedField('section13.nonFederalEmployment.entries[0].employmentDates.present', false)
    },

    employmentStatus: {
      ...createMappedField('section13.nonFederalEmployment.entries[0].employmentStatus', 'Full-time' as EmploymentStatus),
      options: ['Full-time', 'Part-time'] as const
    },

    phone: {
      number: createMappedField('section13.nonFederalEmployment.entries[0].phone.number', ''),
      extension: createMappedField('section13.nonFederalEmployment.entries[0].phone.extension', ''),
      isDSN: createMappedField('section13.nonFederalEmployment.entries[0].phone.isDSN', false),
      isDay: createMappedField('section13.nonFederalEmployment.entries[0].phone.isDay', false),
      isNight: createMappedField('section13.nonFederalEmployment.entries[0].phone.isNight', false)
    },

    hasAdditionalPeriods: createMappedField('section13.nonFederalEmployment.entries[0].hasAdditionalPeriods', false),
    additionalPeriods: [],
    multipleEmploymentPeriods: {
      periods: []
    },
    hasPhysicalWorkAddress: createMappedField('section13.nonFederalEmployment.entries[0].hasPhysicalWorkAddress', false)
  };
};

/**
 * Creates a default self-employment entry (Section 13A.3)
 */
export const createDefaultSelfEmploymentEntry = (entryId: string | number): SelfEmploymentEntry => {
  return {
    _id: entryId,

    businessName: createFieldFromReference(13, 'sect13A.3Entry1Employment', ''),
    businessType: createFieldFromReference(13, 'sect13A.3Entry1BusinessType', ''),
    positionTitle: createFieldFromReference(13, 'sect13A.3Entry1PositionTitle', ''),

    businessAddress: {
      street: createFieldFromReference(13, 'sect13A.3Entry1Street', ''),
      city: createFieldFromReference(13, 'sect13A.3Entry1City', ''),
      state: {
        ...createFieldFromReference(13, 'sect13A.3Entry1State', ''),
        options: []
      },
      zipCode: createFieldFromReference(13, 'sect13A.3Entry1Zip', ''),
      country: {
        ...createFieldFromReference(13, 'sect13A.3Entry1Country', ''),
        options: []
      }
    },

    employmentDates: {
      fromDate: createFieldFromReference(13, 'sect13A.3Entry1FromDate', ''),
      toDate: createFieldFromReference(13, 'sect13A.3Entry1ToDate', ''),
      fromEstimated: createFieldFromReference(13, 'sect13A.3Entry1FromEstimated', false),
      toEstimated: createFieldFromReference(13, 'sect13A.3Entry1ToEstimated', false),
      present: createFieldFromReference(13, 'sect13A.3Entry1Present', false)
    },

    phone: {
      number: createFieldFromReference(13, 'sect13A.3Entry1Phone', ''),
      extension: createFieldFromReference(13, 'sect13A.3Entry1Ext', ''),
      isDSN: createFieldFromReference(13, 'sect13A.3Entry1DSN', false),
      isDay: createFieldFromReference(13, 'sect13A.3Entry1Day', false),
      isNight: createFieldFromReference(13, 'sect13A.3Entry1Night', false)
    },

    verifierFirstName: createFieldFromReference(13, 'sect13A.3Entry1_FName', ''),
    verifierLastName: createFieldFromReference(13, 'sect13A.3Entry1_LName', ''),

    verifierAddress: {
      street: createFieldFromReference(13, 'sect13A.3Entry1_Street', ''),
      city: createFieldFromReference(13, 'sect13A.3Entry1_City', ''),
      state: {
        ...createFieldFromReference(13, 'sect13A.3Entry1_State', ''),
        options: []
      },
      zipCode: createFieldFromReference(13, 'sect13A.3Entry1_Zip', ''),
      country: {
        ...createFieldFromReference(13, 'sect13A.3Entry1_Country', ''),
        options: []
      }
    },

    verifierPhone: {
      number: createFieldFromReference(13, 'sect13A.3Entry1_a_Phone', ''),
      extension: createFieldFromReference(13, 'sect13A.3Entry1_a_ext', ''),
      isDSN: createFieldFromReference(13, 'sect13A.3Entry1_DSN', false),
      isDay: createFieldFromReference(13, 'sect13A.3Entry1_Day', false),
      isNight: createFieldFromReference(13, 'sect13A.3Entry1_Night', false)
    }
  };
};

/**
 * Creates a default unemployment entry (Section 13A.4)
 */
export const createDefaultUnemploymentEntry = (entryId: string | number): UnemploymentEntry => {
  return {
    _id: entryId,

    unemploymentDates: {
      fromDate: createFieldFromReference(13, 'sect13A.4Entry1FromDate', ''),
      toDate: createFieldFromReference(13, 'sect13A.4Entry1ToDate', ''),
      fromEstimated: createFieldFromReference(13, 'sect13A.4Entry1FromEstimated', false),
      toEstimated: createFieldFromReference(13, 'sect13A.4Entry1ToEstimated', false),
      present: createFieldFromReference(13, 'sect13A.4Entry1Present', false)
    },

    reference: {
      firstName: createFieldFromReference(13, 'sect13A.4Entry1_FName', ''),
      lastName: createFieldFromReference(13, 'sect13A.4Entry1_LName', ''),
      address: {
        street: createFieldFromReference(13, 'sect13A.4Entry1_Street', ''),
        city: createFieldFromReference(13, 'sect13A.4Entry1_City', ''),
        state: {
          ...createFieldFromReference(13, 'sect13A.4Entry1_State', ''),
          options: []
        },
        zipCode: createFieldFromReference(13, 'sect13A.4Entry1_Zip', ''),
        country: {
          ...createFieldFromReference(13, 'sect13A.4Entry1_Country', ''),
          options: []
        }
      },
      phone: {
        number: createFieldFromReference(13, 'sect13A.4Entry1_Phone', ''),
        extension: createFieldFromReference(13, 'sect13A.4Entry1_Ext', ''),
        isDSN: createFieldFromReference(13, 'sect13A.4Entry1_DSN', false),
        isDay: createFieldFromReference(13, 'sect13A.4Entry1_Day', false),
        isNight: createFieldFromReference(13, 'sect13A.4Entry1_Night', false)
      }
    }
  };
};

/**
 * Creates default federal employment information - NOW USING MAPPED FIELDS
 */
export const createDefaultFederalEmploymentInfo = (): FederalEmploymentInfo => ({
  hasFederalEmployment: createMappedField('sect13A.5Entry1HasFederalEmployment', "NO" as "YES" | "NO"),
  securityClearance: createMappedField('sect13A.5Entry1SecurityClearance', "NO" as "YES" | "NO"),
  clearanceLevel: createMappedField('sect13A.5Entry1ClearanceLevel', ''),
  clearanceDate: createMappedField('sect13A.5Entry1ClearanceDate', ''),
  investigationDate: createMappedField('sect13A.5Entry1InvestigationDate', ''),
  polygraphDate: createMappedField('sect13A.5Entry1PolygraphDate', ''),
  accessToClassified: createMappedField('sect13A.5Entry1AccessToClassified', "NO" as "YES" | "NO"),
  classificationLevel: createMappedField('sect13A.5Entry1ClassificationLevel', '')
});

/**
 * Creates a default Section 13 data structure
 */
export const createDefaultSection13 = (includeInitialEntry: boolean = false): Section13 => {
  const defaultSection: Section13 = {
    _id: 13,
    section13: {
      // Main employment questions - NOW USING MAPPED FIELDS
      hasEmployment: createMappedField('sect13HasEmployment', "NO" as "YES" | "NO"),
      hasGaps: createMappedField('sect13HasGaps', "NO" as "YES" | "NO"),
      gapExplanation: createMappedField('sect13GapExplanation', ''),

      // Employment type selection - NOW USING MAPPED FIELDS
      employmentType: {
        ...createMappedField('sect13EmploymentType', 'Other' as EmploymentType),
        options: ['Military', 'Federal', 'Non-Federal', 'Self-Employment', 'Unemployment', 'Other'] as const
      },

      // Subsection structures
      militaryEmployment: {
        entries: [] as MilitaryEmploymentEntry[]
      },
      nonFederalEmployment: {
        entries: [] as NonFederalEmploymentEntry[]
      },
      selfEmployment: {
        entries: [] as SelfEmploymentEntry[]
      },
      unemployment: {
        entries: [] as UnemploymentEntry[]
      },

      // Generic entries (for backward compatibility)
      entries: [] as EmploymentEntry[],

      // Employment record issues (Section 13A.5) - NOW USING MAPPED FIELDS
      employmentRecordIssues: {
        wasFired: createMappedField('sect13A.5WasFired', false),
        quitAfterBeingTold: createMappedField('sect13A.5QuitAfterBeingTold', false),
        leftByMutualAgreement: createMappedField('sect13A.5LeftByMutualAgreement', false)
        // Note: hasChargesOrAllegations and hasUnsatisfactoryPerformance fields don't exist in the PDF
      },

      // Disciplinary actions (Section 13A.6) - NOW USING MAPPED FIELDS
      disciplinaryActions: {
        receivedWrittenWarning: createMappedField('sect13A.6ReceivedWrittenWarning', false),
        warningDates: [],
        warningReasons: []
      },

      // Federal employment information
      federalInfo: createDefaultFederalEmploymentInfo(),
    }
  };

  // Add initial entry if requested
  if (includeInitialEntry) {
    defaultSection.section13.militaryEmployment.entries.push(createDefaultMilitaryEmploymentEntry(Date.now()));
  }

  return defaultSection;
};

/**
 * Update Section 13 field values following the Field<T> interface pattern
 * Handle nested employment entries and complex data structures
 */
export const updateSection13Field = (
  section13Data: Section13,
  update: Section13FieldUpdate
): Section13 => {
  const { fieldPath, newValue, entryIndex } = update;
  // Deep clone to avoid mutation
  const newData = JSON.parse(JSON.stringify(section13Data));

  console.log(`🔍 SECTION13 Field Update:`, {
    fieldPath,
    newValue,
    entryIndex,
    valueType: typeof newValue
  });

  // Main section flags
  if (fieldPath === 'section13.hasEmployment' || fieldPath === 'hasEmployment') {
    if (newData.section13?.hasEmployment) {
      newData.section13.hasEmployment.value = newValue;
    }
    return newData;
  }

  if (fieldPath === 'section13.hasGaps' || fieldPath === 'hasGaps') {
    if (newData.section13?.hasGaps) {
      newData.section13.hasGaps.value = newValue;
    }
    return newData;
  }

  if (fieldPath === 'section13.gapExplanation' || fieldPath === 'gapExplanation') {
    if (newData.section13?.gapExplanation) {
      newData.section13.gapExplanation.value = newValue;
    }
    return newData;
  }

  // Handle employment entries
  if (fieldPath.includes('entries') && entryIndex !== undefined) {
    if (entryIndex >= 0 && entryIndex < newData.section13.entries.length) {
      const entry = newData.section13.entries[entryIndex];

      // Handle employment dates
      if (fieldPath.includes('employmentDates.fromDate') || fieldPath.includes('fromDate')) {
        entry.employmentDates.fromDate.value = newValue;
      }
      else if (fieldPath.includes('employmentDates.toDate') || fieldPath.includes('toDate')) {
        entry.employmentDates.toDate.value = newValue;
      }
      else if (fieldPath.includes('employmentDates.fromEstimated') || fieldPath.includes('fromEstimated')) {
        entry.employmentDates.fromEstimated.value = Boolean(newValue);
      }
      else if (fieldPath.includes('employmentDates.toEstimated') || fieldPath.includes('toEstimated')) {
        entry.employmentDates.toEstimated.value = Boolean(newValue);
      }
      else if (fieldPath.includes('employmentDates.present') || fieldPath.includes('present')) {
        entry.employmentDates.present.value = Boolean(newValue);
      }

      // Handle employer information
      else if (fieldPath.includes('employmentType')) {
        entry.employmentType.value = newValue;
      }
      else if (fieldPath.includes('employmentStatus')) {
        entry.employmentStatus.value = newValue;
      }
      else if (fieldPath.includes('employerName')) {
        entry.employerName.value = newValue;
      }
      else if (fieldPath.includes('positionTitle')) {
        entry.positionTitle.value = newValue;
      }

      // Handle employer address
      else if (fieldPath.includes('employerAddress.street') || fieldPath.includes('street')) {
        entry.employerAddress.street.value = newValue;
      }
      else if (fieldPath.includes('employerAddress.city') || fieldPath.includes('city')) {
        entry.employerAddress.city.value = newValue;
      }
      else if (fieldPath.includes('employerAddress.state') || fieldPath.includes('state')) {
        entry.employerAddress.state.value = newValue;
      }
      else if (fieldPath.includes('employerAddress.zipCode') || fieldPath.includes('zipCode')) {
        entry.employerAddress.zipCode.value = newValue;
      }
      else if (fieldPath.includes('employerAddress.country') || fieldPath.includes('country')) {
        entry.employerAddress.country.value = newValue;
      }

      // Handle supervisor information
      else if (fieldPath.includes('supervisor.name') || fieldPath.endsWith('supervisorName')) {
        entry.supervisor.name.value = newValue;
      }
      else if (fieldPath.includes('supervisor.title') || fieldPath.endsWith('supervisorTitle')) {
        entry.supervisor.title.value = newValue;
      }
      else if (fieldPath.includes('supervisor.email') || fieldPath.endsWith('supervisorEmail')) {
        entry.supervisor.email.value = newValue;
      }
      else if (fieldPath.includes('supervisor.phone') || fieldPath.endsWith('supervisorPhone')) {
        entry.supervisor.phone.value = newValue;
      }
    }
    return newData;
  }

  // Fallback: try to guess the right field from the field path
  try {
    const pathParts = fieldPath.split('.');
    const lastPart = pathParts[pathParts.length - 1];

    if (lastPart === 'hasEmployment' && newData.section13?.hasEmployment) {
      newData.section13.hasEmployment.value = newValue;
    }
    else if (lastPart === 'hasGaps' && newData.section13?.hasGaps) {
      newData.section13.hasGaps.value = newValue;
    }
    else if (lastPart === 'gapExplanation' && newData.section13?.gapExplanation) {
      newData.section13.gapExplanation.value = newValue;
    }
  } catch (error) {
    console.error(`Section13: Failed to update field at path ${fieldPath}:`, error);
  }

  return newData;
};

// ============================================================================
// CONTEXT INTERFACE
// ============================================================================

export interface Section13ContextType {
  // State
  section13Data: Section13;
  isLoading: boolean;
  errors: Record<string, string>;
  isDirty: boolean;

  // Basic Actions
  updateEmploymentInfo: (fieldPath: string, value: string) => void;
  updateFieldValue: (path: string, value: any) => void;
  updateField: (fieldPath: string, value: any) => void;

  // Employment Entry Management
  addMilitaryEmploymentEntry: () => void;
  removeMilitaryEmploymentEntry: (entryId: string) => void;
  updateMilitaryEmploymentEntry: (entryId: string, fieldPath: string, value: any) => void;

  addNonFederalEmploymentEntry: () => void;
  removeNonFederalEmploymentEntry: (entryId: string) => void;
  updateNonFederalEmploymentEntry: (entryId: string, fieldPath: string, value: any) => void;

  addSelfEmploymentEntry: () => void;
  removeSelfEmploymentEntry: (entryId: string) => void;
  updateSelfEmploymentEntry: (entryId: string, fieldPath: string, value: any) => void;

  addUnemploymentEntry: () => void;
  removeUnemploymentEntry: (entryId: string) => void;
  updateUnemploymentEntry: (entryId: string, fieldPath: string, value: any) => void;

  // Validation
  validateSection: () => ValidationResult;
  validateEmploymentEntry: (entryType: string, entryId: string) => ValidationResult;

  // Utility
  resetSection: () => void;
  loadSection: (data: Section13) => void;
  getChanges: () => any;
  getEmploymentEntryCount: (entryType: string) => number;
  getTotalEmploymentYears: () => number;
}

// ============================================================================
// INITIAL STATE CREATION
// ============================================================================

// Use the DRY approach with sections-references instead of hardcoded values
const createInitialSection13State = (): Section13 => {
  return createDefaultSection13();
};

// ============================================================================
// VALIDATION RULES
// ============================================================================

const defaultValidationRules: Section13ValidationRules = {
  requiresEmploymentHistory: true,
  requiresGapExplanation: true,
  maxEmploymentEntries: 10,
  requiresEmployerName: true,
  requiresPositionTitle: true,
  requiresEmploymentDates: true,
  requiresSupervisorInfo: true,
  allowsEstimatedDates: true,
  maxEmployerNameLength: 100,
  maxPositionDescriptionLength: 500,
  maxCommentLength: 1000,
  timeFrameYears: 10
};

// ============================================================================
// CONTEXT CREATION
// ============================================================================

const Section13Context = createContext<Section13ContextType | undefined>(undefined);

// ============================================================================
// PROVIDER COMPONENT
// ============================================================================

export interface Section13ProviderProps {
  children: React.ReactNode;
}

export const Section13Provider: React.FC<Section13ProviderProps> = ({ children }) => {
  // ============================================================================
  // CORE STATE MANAGEMENT
  // ============================================================================

  const [section13Data, setSection13Data] = useState<Section13>(createInitialSection13State());
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [initialData] = useState<Section13>(createInitialSection13State());
  const [isInitialized, setIsInitialized] = useState(false);

  // ============================================================================
  // COMPUTED VALUES
  // ============================================================================

  const isDirty = JSON.stringify(section13Data) !== JSON.stringify(initialData);

  // Set initialized flag after component mounts
  useEffect(() => {
    setIsInitialized(true);
  }, []);

  // Log field creation only in debug mode and only when employment type changes
  useEffect(() => {
    const isDebugMode = typeof window !== 'undefined' && window.location.search.includes('debug=true');
    if (isDebugMode && isInitialized && section13Data.section13?.employmentType?.value) {
      console.log(`🔄 Section13: Employment type changed to: ${section13Data.section13.employmentType.value}`);
      console.log(`📋 Section13: Active entries:`, {
        military: section13Data.section13.militaryEmployment?.entries?.length || 0,
        nonFederal: section13Data.section13.nonFederalEmployment?.entries?.length || 0,
        selfEmployment: section13Data.section13.selfEmployment?.entries?.length || 0,
        unemployment: section13Data.section13.unemployment?.entries?.length || 0
      });
    }
  }, [section13Data.section13?.employmentType?.value, isInitialized]);

  // ============================================================================
  // VALIDATION FUNCTIONS
  // ============================================================================

  const validateSection = useCallback((): ValidationResult => {
    const validationErrors: ValidationError[] = [];
    const validationWarnings: ValidationError[] = [];

    // Basic validation for employment questions
    if (!section13Data.section13?.hasEmployment?.value) {
      validationErrors.push({
        field: 'hasEmployment',
        message: 'Please indicate if you have employment history',
        code: 'VALIDATION_ERROR',
        severity: 'error'
      });
    }

    // If has gaps, require explanation
    if (section13Data.section13?.hasGaps?.value === 'YES' && 
        !section13Data.section13?.gapExplanation?.value?.trim()) {
      validationErrors.push({
        field: 'gapExplanation',
        message: 'Please provide an explanation for employment gaps',
        code: 'VALIDATION_ERROR',
        severity: 'error'
      });
    }

    return {
      isValid: validationErrors.length === 0,
      errors: validationErrors,
      warnings: validationWarnings
    };
  }, [section13Data]);

  // Update errors when section data changes (but not during initial render)
  useEffect(() => {
    // Skip validation on initial render to avoid infinite loops
    if (!isInitialized) return;

    const validationResult = validateSection();
    const newErrors: Record<string, string> = {};

    validationResult.errors.forEach(error => {
      newErrors[error.field] = error.message;
    });

    // Only update errors if they actually changed
    const currentErrorKeys = Object.keys(errors);
    const newErrorKeys = Object.keys(newErrors);
    const errorsChanged =
      currentErrorKeys.length !== newErrorKeys.length ||
      currentErrorKeys.some(key => errors[key] !== newErrors[key]);

    if (errorsChanged) {
      setErrors(newErrors);
    }
  }, [section13Data, isInitialized, errors]);

  // ============================================================================
  // CRUD OPERATIONS
  // ============================================================================

  const updateEmploymentInfo = useCallback((fieldPath: string, value: string) => {
    setSection13Data(prevData => {
      const newData = cloneDeep(prevData);
      set(newData, `section13.${fieldPath}.value`, value);
      return newData;
    });
  }, []);

  /**
   * Generic field update function for integration compatibility
   * Maps generic field paths to Section 13 specific update functions
   */
  const updateFieldValue = useCallback((path: string, value: any) => {
    setSection13Data(prevData => {
      return updateSection13Field(prevData, { fieldPath: path, newValue: value });
    });
  }, []);

  /**
   * Update a specific field by path
   */
  const updateField = useCallback((fieldPath: string, value: any) => {
    setSection13Data(prevData => {
      const newData = cloneDeep(prevData);
      set(newData, fieldPath, value);
      return newData;
    });
  }, []);

  // ============================================================================
  // EMPLOYMENT ENTRY MANAGEMENT
  // ============================================================================

  /**
   * Add a new military employment entry
   */
  const addMilitaryEmploymentEntry = useCallback(() => {
    setSection13Data(prevData => {
      const newData = cloneDeep(prevData);
      const newEntryId = `military_${Date.now()}`;

      // Create new entry using the factory function from interface
      const newEntry = createDefaultMilitaryEmploymentEntry(newEntryId);

      if (!newData.section13.militaryEmployment) {
        newData.section13.militaryEmployment = { entries: [] };
      }

      newData.section13.militaryEmployment.entries.push(newEntry);
      return newData;
    });
  }, []);

  /**
   * Remove a military employment entry
   */
  const removeMilitaryEmploymentEntry = useCallback((entryId: string) => {
    setSection13Data(prevData => {
      const newData = cloneDeep(prevData);
      if (newData.section13.militaryEmployment?.entries) {
        newData.section13.militaryEmployment.entries =
          newData.section13.militaryEmployment.entries.filter(entry => entry._id !== entryId);
      }
      return newData;
    });
  }, []);

  /**
   * Update a military employment entry field
   */
  const updateMilitaryEmploymentEntry = useCallback((entryId: string, fieldPath: string, value: any) => {
    setSection13Data(prevData => {
      const newData = cloneDeep(prevData);
      const entryIndex = newData.section13.militaryEmployment?.entries.findIndex(entry => entry._id === entryId);

      if (entryIndex !== undefined && entryIndex >= 0) {
        set(newData, `section13.militaryEmployment.entries[${entryIndex}].${fieldPath}`, value);
      }

      return newData;
    });
  }, []);

  /**
   * Add a new non-federal employment entry
   */
  const addNonFederalEmploymentEntry = useCallback(() => {
    setSection13Data(prevData => {
      const newData = cloneDeep(prevData);
      const newEntryId = `nonFederal_${Date.now()}`;

      const newEntry = createDefaultNonFederalEmploymentEntry(newEntryId);

      if (!newData.section13.nonFederalEmployment) {
        newData.section13.nonFederalEmployment = { entries: [] };
      }

      newData.section13.nonFederalEmployment.entries.push(newEntry);
      return newData;
    });
  }, []);

  /**
   * Remove a non-federal employment entry
   */
  const removeNonFederalEmploymentEntry = useCallback((entryId: string) => {
    setSection13Data(prevData => {
      const newData = cloneDeep(prevData);
      if (newData.section13.nonFederalEmployment?.entries) {
        newData.section13.nonFederalEmployment.entries =
          newData.section13.nonFederalEmployment.entries.filter(entry => entry._id !== entryId);
      }
      return newData;
    });
  }, []);

  /**
   * Update a non-federal employment entry field
   */
  const updateNonFederalEmploymentEntry = useCallback((entryId: string, fieldPath: string, value: any) => {
    setSection13Data(prevData => {
      const newData = cloneDeep(prevData);
      const entryIndex = newData.section13.nonFederalEmployment?.entries.findIndex(entry => entry._id === entryId);

      if (entryIndex !== undefined && entryIndex >= 0) {
        set(newData, `section13.nonFederalEmployment.entries[${entryIndex}].${fieldPath}`, value);
      }

      return newData;
    });
  }, []);

  /**
   * Add a new self-employment entry
   */
  const addSelfEmploymentEntry = useCallback(() => {
    setSection13Data(prevData => {
      const newData = cloneDeep(prevData);
      const newEntryId = `selfEmployment_${Date.now()}`;

      const newEntry = createDefaultSelfEmploymentEntry(newEntryId);

      if (!newData.section13.selfEmployment) {
        newData.section13.selfEmployment = { entries: [] };
      }

      newData.section13.selfEmployment.entries.push(newEntry);
      return newData;
    });
  }, []);

  /**
   * Remove a self-employment entry
   */
  const removeSelfEmploymentEntry = useCallback((entryId: string) => {
    setSection13Data(prevData => {
      const newData = cloneDeep(prevData);
      if (newData.section13.selfEmployment?.entries) {
        newData.section13.selfEmployment.entries =
          newData.section13.selfEmployment.entries.filter(entry => entry._id !== entryId);
      }
      return newData;
    });
  }, []);

  /**
   * Update a self-employment entry field
   */
  const updateSelfEmploymentEntry = useCallback((entryId: string, fieldPath: string, value: any) => {
    setSection13Data(prevData => {
      const newData = cloneDeep(prevData);
      const entryIndex = newData.section13.selfEmployment?.entries.findIndex(entry => entry._id === entryId);

      if (entryIndex !== undefined && entryIndex >= 0) {
        set(newData, `section13.selfEmployment.entries[${entryIndex}].${fieldPath}`, value);
      }

      return newData;
    });
  }, []);

  /**
   * Add a new unemployment entry
   */
  const addUnemploymentEntry = useCallback(() => {
    setSection13Data(prevData => {
      const newData = cloneDeep(prevData);
      const newEntryId = `unemployment_${Date.now()}`;

      const newEntry = createDefaultUnemploymentEntry(newEntryId);

      if (!newData.section13.unemployment) {
        newData.section13.unemployment = { entries: [] };
      }

      newData.section13.unemployment.entries.push(newEntry);
      return newData;
    });
  }, []);

  /**
   * Remove an unemployment entry
   */
  const removeUnemploymentEntry = useCallback((entryId: string) => {
    setSection13Data(prevData => {
      const newData = cloneDeep(prevData);
      if (newData.section13.unemployment?.entries) {
        newData.section13.unemployment.entries =
          newData.section13.unemployment.entries.filter(entry => entry._id !== entryId);
      }
      return newData;
    });
  }, []);

  /**
   * Update an unemployment entry field
   */
  const updateUnemploymentEntry = useCallback((entryId: string, fieldPath: string, value: any) => {
    setSection13Data(prevData => {
      const newData = cloneDeep(prevData);
      const entryIndex = newData.section13.unemployment?.entries.findIndex(entry => entry._id === entryId);

      if (entryIndex !== undefined && entryIndex >= 0) {
        set(newData, `section13.unemployment.entries[${entryIndex}].${fieldPath}`, value);
      }

      return newData;
    });
  }, []);

  // ============================================================================
  // UTILITY FUNCTIONS
  // ============================================================================

  /**
   * Get the count of entries for a specific employment type
   */
  const getEmploymentEntryCount = useCallback((entryType: string): number => {
    switch (entryType) {
      case 'militaryEmployment':
        return section13Data.section13.militaryEmployment?.entries?.length || 0;
      case 'nonFederalEmployment':
        return section13Data.section13.nonFederalEmployment?.entries?.length || 0;
      case 'selfEmployment':
        return section13Data.section13.selfEmployment?.entries?.length || 0;
      case 'unemployment':
        return section13Data.section13.unemployment?.entries?.length || 0;
      default:
        return 0;
    }
  }, [section13Data]);

  /**
   * Calculate total employment years (simplified calculation)
   */
  const getTotalEmploymentYears = useCallback((): number => {
    // This would need proper date parsing and calculation
    // For now, return a placeholder
    return 0;
  }, []);

  /**
   * Validate a specific employment entry
   */
  const validateEmploymentEntry = useCallback((entryType: string, entryId: string): ValidationResult => {
    // Placeholder validation - would implement specific validation logic
    return {
      isValid: true,
      errors: [],
      warnings: []
    };
  }, []);

  // ============================================================================
  // UTILITY FUNCTIONS
  // ============================================================================

  const resetSection = useCallback(() => {
    const newData = createInitialSection13State();
    setSection13Data(newData);
    setErrors({});
  }, []);

  const loadSection = useCallback((data: Section13) => {
    setSection13Data(cloneDeep(data));
    setErrors({});
  }, []);

  const getChanges = useCallback((): ChangeSet => {
    const changes: ChangeSet = {};

    // Simple change detection - compare with initial data
    if (JSON.stringify(section13Data) !== JSON.stringify(initialData)) {
      changes['section13'] = {
        oldValue: initialData,
        newValue: section13Data,
        timestamp: new Date()
      };
    }

    return changes;
  }, [section13Data, initialData]);

  // ============================================================================
  // SF86FORM INTEGRATION
  // ============================================================================
  // Access SF86FormContext to sync with loaded data
  const sf86Form = useSF86Form();

  // Sync with SF86FormContext when data is loaded
  useEffect(() => {
    const isDebugMode = typeof window !== 'undefined' && window.location.search.includes('debug=true');

    if (sf86Form.formData.section13 && sf86Form.formData.section13 !== section13Data) {
      if (isDebugMode) {
        console.log('🔄 Section13: Syncing with SF86FormContext loaded data');
      }

      // Load the data from SF86FormContext
      loadSection(sf86Form.formData.section13);

      if (isDebugMode) {
        console.log('✅ Section13: Data sync complete');
      }
    }
  }, [sf86Form.formData.section13, loadSection]);

  // Auto-sync Section 13 data to SF86FormContext when it changes
  useEffect(() => {
    const isDebugMode = typeof window !== 'undefined' && window.location.search.includes('debug=true');

    if (isInitialized && section13Data && isDirty) {
      if (isDebugMode) {
        console.log('🔄 Section13: Auto-syncing data to SF86FormContext');
      }

      // Update the central form context with Section 13 data
      sf86Form.updateSectionData('section13', section13Data);

      if (isDebugMode) {
        console.log('✅ Section13: Auto-sync complete');
      }
    }
  }, [section13Data, isInitialized, isDirty, sf86Form.updateSectionData]);

  // ============================================================================
  // CONTEXT VALUE
  // ============================================================================

  const contextValue: Section13ContextType = {
    // State
    section13Data,
    isLoading,
    errors,
    isDirty,

    // Basic Actions
    updateEmploymentInfo,
    updateFieldValue,
    updateField,

    // Employment Entry Management
    addMilitaryEmploymentEntry,
    removeMilitaryEmploymentEntry,
    updateMilitaryEmploymentEntry,

    addNonFederalEmploymentEntry,
    removeNonFederalEmploymentEntry,
    updateNonFederalEmploymentEntry,

    addSelfEmploymentEntry,
    removeSelfEmploymentEntry,
    updateSelfEmploymentEntry,

    addUnemploymentEntry,
    removeUnemploymentEntry,
    updateUnemploymentEntry,

    // Validation
    validateSection,
    validateEmploymentEntry,

    // Utility
    resetSection,
    loadSection,
    getChanges,
    getEmploymentEntryCount,
    getTotalEmploymentYears
  };

  return (
    <Section13Context.Provider value={contextValue}>
      {children}
    </Section13Context.Provider>
  );
};

// ============================================================================
// HOOK
// ============================================================================

export const useSection13 = (): Section13ContextType => {
  const context = useContext(Section13Context);
  if (!context) {
    throw new Error('useSection13 must be used within a Section13Provider');
  }
  return context;
};

// ============================================================================
// EXPORTS
// ============================================================================

export default Section13Provider;
