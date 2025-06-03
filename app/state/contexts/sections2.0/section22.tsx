/**
 * Section 22: Police Record - Context Provider
 *
 * This implementation follows the established patterns for SF-86 sections,
 * learning from Section 21 and avoiding the setSectionData issues.
 *
 * Features:
 * - Enhanced section template with performance monitoring
 * - Standardized field operations and validation
 * - Police record subsections management
 * - PDF field flattening
 * - Proper context integration
 */

import type {
  Section22,
  Section22FieldUpdate,
  PoliceRecordValidationResult,
  Section22ValidationContext,
  Section22SubsectionKey,
  PoliceRecordEntry,
  DomesticViolenceOrderEntry
} from '../../../../api/interfaces/sections2.0/section22';
import {
  createDefaultSection22,
  createDefaultPoliceRecordEntry,
  createDefaultDomesticViolenceEntry,
  validateSection22,
  validatePoliceRecordEntry,
  validateDomesticViolenceOrderEntry,
  updateSection22Field,
  getTotalPoliceRecordEntries,
  hasAnyPoliceRecordIssues
} from '../../../../api/interfaces/sections2.0/section22';
import type { ValidationResult, ValidationError } from '../shared/base-interfaces';
import {
  createEnhancedSectionContext,
  StandardFieldOperations,
  type EnhancedSectionContextType
} from '../shared/enhanced-section-template';

// ============================================================================
// FIELD FLATTENING FOR PDF GENERATION
// ============================================================================

/**
 * Flattens Section 22 fields for PDF generation
 * Converts nested Field<T> objects to a flat Record<string, any> structure
 */
export const flattenSection22Fields = (section22Data: Section22): Record<string, any> => {
  const flattened: Record<string, any> = {};

  // Flatten each subsection
  Object.entries(section22Data.section22).forEach(([subsectionKey, subsection]) => {
    // Flatten flag fields
    if ('hasSummonsOrCitation' in subsection && subsection.hasSummonsOrCitation) {
      flattened[subsection.hasSummonsOrCitation.id] = subsection.hasSummonsOrCitation;
    }
    if ('hasArrest' in subsection && subsection.hasArrest) {
      flattened[subsection.hasArrest.id] = subsection.hasArrest;
    }
    if ('hasChargedOrConvicted' in subsection && subsection.hasChargedOrConvicted) {
      flattened[subsection.hasChargedOrConvicted.id] = subsection.hasChargedOrConvicted;
    }
    if ('hasProbationOrParole' in subsection && subsection.hasProbationOrParole) {
      flattened[subsection.hasProbationOrParole.id] = subsection.hasProbationOrParole;
    }
    if ('hasCurrentTrial' in subsection && subsection.hasCurrentTrial) {
      flattened[subsection.hasCurrentTrial.id] = subsection.hasCurrentTrial;
    }
    if ('hasCurrentOrder' in subsection && subsection.hasCurrentOrder) {
      flattened[subsection.hasCurrentOrder.id] = subsection.hasCurrentOrder;
    }
    if ('hasMilitaryCourtProceedings' in subsection && subsection.hasMilitaryCourtProceedings) {
      flattened[subsection.hasMilitaryCourtProceedings.id] = subsection.hasMilitaryCourtProceedings;
    }
    if ('hasForeignCourtProceedings' in subsection && subsection.hasForeignCourtProceedings) {
      flattened[subsection.hasForeignCourtProceedings.id] = subsection.hasForeignCourtProceedings;
    }

    // Flatten entry fields
    if (subsection.entries && Array.isArray(subsection.entries)) {
      subsection.entries.forEach((entry: any, entryIndex: number) => {
        // Flatten all fields in the entry recursively
        const flattenEntry = (obj: any, prefix: string = '') => {
          Object.entries(obj).forEach(([key, value]) => {
            if (value && typeof value === 'object' && 'id' in value && 'value' in value) {
              // This is a Field<T> object
              const fieldObj = value as { id: string; value: any };
              flattened[fieldObj.id] = fieldObj;
            } else if (value && typeof value === 'object' && !Array.isArray(value)) {
              // Nested object, recurse
              flattenEntry(value, `${prefix}${key}.`);
            }
          });
        };

        flattenEntry(entry, `${subsectionKey}[${entryIndex}].`);
      });
    }
  });

  return flattened;
};

// ============================================================================
// SECTION 22 CONFIGURATION
// ============================================================================

const section22Config = {
  sectionId: 'section22',
  sectionName: 'Section 22: Police Record',
  expectedFieldCount: 267, // From section-22.json metadata
  createInitialState: createDefaultSection22,
  flattenFields: flattenSection22Fields,
  validateSection: (data: Section22): ValidationResult => {
    const validationErrors: ValidationError[] = [];
    const validationWarnings: ValidationError[] = [];

    // Create validation context
    const validationContext: Section22ValidationContext = {
      currentDate: new Date(),
      rules: {
        timeframeYears: 7,
        trafficFineThreshold: 300,
        requiresCourtInfo: true,
        requiresIncidentDetails: true,
        requiresLocationInfo: true,
        allowsEstimatedDates: true,
        maxDescriptionLength: 2000,
        requiresDocumentation: false
      }
    };

    // Validate the entire section
    const sectionValidation = validateSection22(data, validationContext);
    
    // Convert to ValidationError format
    sectionValidation.errors.forEach(error => {
      validationErrors.push({
        field: 'section22',
        message: error,
        code: 'POLICE_RECORD_VALIDATION_ERROR',
        severity: 'error'
      });
    });

    sectionValidation.warnings.forEach(warning => {
      validationWarnings.push({
        field: 'section22',
        message: warning,
        code: 'POLICE_RECORD_VALIDATION_WARNING',
        severity: 'warning'
      });
    });

    return {
      isValid: validationErrors.length === 0,
      errors: validationErrors,
      warnings: validationWarnings
    };
  },
  updateField: (data: Section22, fieldPath: string, newValue: any): Section22 => {
    // Parse field path to determine subsection and entry
    const pathParts = fieldPath.split('.');
    
    if (pathParts.length >= 2) {
      const subsectionKey = pathParts[1] as Section22SubsectionKey;
      
      if (pathParts.length === 3 && [
        'hasSummonsOrCitation', 'hasArrest', 'hasChargedOrConvicted', 
        'hasProbationOrParole', 'hasCurrentTrial', 'hasCurrentOrder',
        'hasMilitaryCourtProceedings', 'hasForeignCourtProceedings'
      ].includes(pathParts[2])) {
        // Update subsection flag
        const update: Section22FieldUpdate = {
          subsectionKey,
          fieldPath: pathParts[2],
          newValue
        };
        return updateSection22Field(data, update);
      } else if (pathParts.length >= 4) {
        // Update entry field
        const entryIndex = parseInt(pathParts[2]);
        const entryFieldPath = pathParts.slice(3).join('.');
        
        const update: Section22FieldUpdate = {
          subsectionKey,
          entryIndex,
          fieldPath: entryFieldPath,
          newValue
        };
        return updateSection22Field(data, update);
      }
    }
    
    return StandardFieldOperations.updateSimpleField(data, fieldPath, newValue);
  },
  customActions: {
    // Subsection flag operations
    updateSubsectionFlag: (data: Section22, subsectionKey: Section22SubsectionKey, flagType: string, value: 'YES' | 'NO'): Section22 => {
      const update: Section22FieldUpdate = {
        subsectionKey,
        fieldPath: flagType,
        newValue: value
      };
      return updateSection22Field(data, update);
    },

    // Entry management operations
    addPoliceRecordEntry: (data: Section22, subsectionKey: Section22SubsectionKey): Section22 => {
      const newData = { ...data };
      let newEntry: any;

      if (subsectionKey === 'domesticViolenceOrders') {
        newEntry = createDefaultDomesticViolenceEntry();
      } else {
        newEntry = createDefaultPoliceRecordEntry();
      }

      newData.section22[subsectionKey].entries.push(newEntry);
      newData.section22[subsectionKey].entriesCount = newData.section22[subsectionKey].entries.length;
      
      return newData;
    },

    removePoliceRecordEntry: (data: Section22, subsectionKey: Section22SubsectionKey, entryIndex: number): Section22 => {
      const newData = { ...data };
      
      if (newData.section22[subsectionKey].entries.length > entryIndex) {
        newData.section22[subsectionKey].entries.splice(entryIndex, 1);
        newData.section22[subsectionKey].entriesCount = newData.section22[subsectionKey].entries.length;
      }
      
      return newData;
    }
  }
};

// ============================================================================
// CONTEXT CREATION
// ============================================================================

const {
  SectionProvider: Section22Provider,
  useSection: useSection22Context
} = createEnhancedSectionContext(section22Config);

// ============================================================================
// SECTION 22 SPECIFIC CONTEXT TYPE
// ============================================================================

export interface Section22ContextType extends EnhancedSectionContextType<Section22> {
  // Section-specific computed values
  getTotalPoliceRecordEntries: () => number;
  getSubsectionEntryCount: (subsectionKey: Section22SubsectionKey) => number;
  hasAnyPoliceRecordIssues: () => boolean;

  // Section-specific operations
  updateSubsectionFlag: (subsectionKey: Section22SubsectionKey, flagType: string, value: 'YES' | 'NO') => void;
  addEntry: (subsectionKey: Section22SubsectionKey) => void;
  removeEntry: (subsectionKey: Section22SubsectionKey, entryIndex: number) => void;
  updateEntryField: (subsectionKey: Section22SubsectionKey, entryIndex: number, fieldPath: string, newValue: any) => void;

  // Section-specific validation
  validateEntry: (subsectionKey: Section22SubsectionKey, entryIndex: number) => PoliceRecordValidationResult;
  validateSubsection: (subsectionKey: Section22SubsectionKey) => PoliceRecordValidationResult;

  // Utility functions
  getEntryById: (subsectionKey: Section22SubsectionKey, entryId: string | number) => any | null;
}

// ============================================================================
// ENHANCED HOOK IMPLEMENTATION
// ============================================================================

export const useSection22 = (): Section22ContextType => {
  const baseContext = useSection22Context();

  const getTotalPoliceRecordEntriesCount = (): number => {
    return getTotalPoliceRecordEntries(baseContext.sectionData);
  };

  const getSubsectionEntryCount = (subsectionKey: Section22SubsectionKey): number => {
    return baseContext.sectionData.section22[subsectionKey].entriesCount;
  };

  const hasAnyPoliceRecordIssuesReported = (): boolean => {
    return hasAnyPoliceRecordIssues(baseContext.sectionData);
  };

  const updateSubsectionFlag = (subsectionKey: Section22SubsectionKey, flagType: string, value: 'YES' | 'NO'): void => {
    baseContext.customActions.updateSubsectionFlag(subsectionKey, flagType, value);
  };

  const addEntry = (subsectionKey: Section22SubsectionKey): void => {
    baseContext.customActions.addPoliceRecordEntry(subsectionKey);
  };

  const removeEntry = (subsectionKey: Section22SubsectionKey, entryIndex: number): void => {
    baseContext.customActions.removePoliceRecordEntry(subsectionKey, entryIndex);
  };

  const updateEntryField = (subsectionKey: Section22SubsectionKey, entryIndex: number, fieldPath: string, newValue: any): void => {
    const fullFieldPath = `section22.${subsectionKey}.entries.${entryIndex}.${fieldPath}`;
    baseContext.updateField(fullFieldPath, newValue);
  };

  const validateEntry = (subsectionKey: Section22SubsectionKey, entryIndex: number): PoliceRecordValidationResult => {
    const entry = baseContext.sectionData.section22[subsectionKey].entries[entryIndex];
    if (!entry) {
      return {
        isValid: false,
        errors: ['Entry not found'],
        warnings: [],
        missingRequiredFields: [],
        dateRangeIssues: [],
        inconsistencies: []
      };
    }

    const validationContext: Section22ValidationContext = {
      currentDate: new Date(),
      rules: {
        timeframeYears: 7,
        trafficFineThreshold: 300,
        requiresCourtInfo: true,
        requiresIncidentDetails: true,
        requiresLocationInfo: true,
        allowsEstimatedDates: true,
        maxDescriptionLength: 2000,
        requiresDocumentation: false
      }
    };

    if (subsectionKey === 'domesticViolenceOrders') {
      return validateDomesticViolenceOrderEntry(entry as DomesticViolenceOrderEntry, validationContext);
    } else {
      return validatePoliceRecordEntry(entry as PoliceRecordEntry, validationContext);
    }
  };

  const validateSubsection = (subsectionKey: Section22SubsectionKey): PoliceRecordValidationResult => {
    const combinedResult: PoliceRecordValidationResult = {
      isValid: true,
      errors: [],
      warnings: [],
      missingRequiredFields: [],
      dateRangeIssues: [],
      inconsistencies: []
    };

    const subsection = baseContext.sectionData.section22[subsectionKey];
    subsection.entries.forEach((entry: any, index: number) => {
      const entryValidation = validateEntry(subsectionKey, index);
      
      if (!entryValidation.isValid) {
        combinedResult.isValid = false;
      }
      
      combinedResult.errors.push(...entryValidation.errors.map(error => `Entry ${index + 1}: ${error}`));
      combinedResult.warnings.push(...entryValidation.warnings.map(warning => `Entry ${index + 1}: ${warning}`));
      combinedResult.missingRequiredFields.push(...entryValidation.missingRequiredFields.map(field => `Entry ${index + 1}: ${field}`));
      combinedResult.dateRangeIssues.push(...entryValidation.dateRangeIssues.map(issue => `Entry ${index + 1}: ${issue}`));
      combinedResult.inconsistencies.push(...entryValidation.inconsistencies.map(inconsistency => `Entry ${index + 1}: ${inconsistency}`));
    });

    return combinedResult;
  };

  const getEntryById = (subsectionKey: Section22SubsectionKey, entryId: string | number): any | null => {
    const subsection = baseContext.sectionData.section22[subsectionKey];
    return subsection.entries.find((entry: any) => entry._id.value === entryId) || null;
  };

  return {
    ...baseContext,
    getTotalPoliceRecordEntries: getTotalPoliceRecordEntriesCount,
    getSubsectionEntryCount,
    hasAnyPoliceRecordIssues: hasAnyPoliceRecordIssuesReported,
    updateSubsectionFlag,
    addEntry,
    removeEntry,
    updateEntryField,
    validateEntry,
    validateSubsection,
    getEntryById
  };
};

// ============================================================================
// EXPORTS
// ============================================================================

export { Section22Provider };
export type { Section22 } from '../../../../api/interfaces/sections2.0/section22'; 