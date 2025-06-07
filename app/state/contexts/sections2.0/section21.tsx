/**
 * Section 21: Psychological and Emotional Health - Context Provider
 *
 * This implementation follows the established patterns for SF-86 sections,
 * learning from Section 20 and avoiding the setSectionData issues.
 *
 * Features:
 * - Enhanced section template with performance monitoring
 * - Standardized field operations and validation
 * - Mental health subsections management
 * - PDF field flattening
 * - Proper context integration
 */

import type {
  Section21,
  Section21FieldUpdate,
  MentalHealthValidationResult,
  Section21ValidationContext,
  Section21SubsectionKey,
  MentalHealthEntry,
  CourtOrderedTreatmentEntry
} from '../../../../api/interfaces/sections2.0/section21';
import {
  createDefaultSection21,
  createDefaultMentalHealthEntry,
  createDefaultCourtOrderedEntry,
  validateSection21,
  validateMentalHealthEntry,
  updateSection21Field,
  getTotalMentalHealthEntries,
  hasAnyMentalHealthIssues
} from '../../../../api/interfaces/sections2.0/section21';
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
 * Flattens Section 21 fields for PDF generation
 * Converts nested Field<T> objects to a flat Record<string, any> structure
 */
export const flattenSection21Fields = (section21Data: Section21): Record<string, any> => {
  const flattened: Record<string, any> = {};

  // Flatten each subsection
  Object.entries(section21Data.section21).forEach(([subsectionKey, subsection]) => {
    // Flatten flag field
    if ('hasConsultation' in subsection && subsection.hasConsultation) {
      flattened[subsection.hasConsultation.id] = subsection.hasConsultation;
    }
    if ('hasCourtOrdered' in subsection && (subsection as any).hasCourtOrdered) {
      flattened[(subsection as any).hasCourtOrdered.id] = (subsection as any).hasCourtOrdered;
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
// SECTION 21 CONFIGURATION
// ============================================================================

const section21Config = {
  sectionId: 'section21',
  sectionName: 'Section 21: Psychological and Emotional Health',
  expectedFieldCount: 0, // TBD - to be determined from section-21.json
  createInitialState: createDefaultSection21,
  flattenFields: flattenSection21Fields,
  validateSection: (data: Section21): ValidationResult => {
    const validationErrors: ValidationError[] = [];
    const validationWarnings: ValidationError[] = [];

    // Create validation context
    const validationContext: Section21ValidationContext = {
      currentDate: new Date(),
      rules: {
        requiresReason: true,
        requiresProfessionalInfo: true,
        requiresDateRange: true,
        requiresTreatmentDetails: false,
        maxReasonLength: 1000,
        maxTreatmentLength: 2000,
        allowsFutureDate: false
      },
      requiresDocumentation: false
    };

    // Validate the entire section
    const sectionValidation = validateSection21(data, validationContext);
    
    // Convert to ValidationError format
    sectionValidation.errors.forEach(error => {
      validationErrors.push({
        field: 'section21',
        message: error,
        code: 'MENTAL_HEALTH_VALIDATION_ERROR',
        severity: 'error'
      });
    });

    sectionValidation.warnings.forEach(warning => {
      validationWarnings.push({
        field: 'section21',
        message: warning,
        code: 'MENTAL_HEALTH_VALIDATION_WARNING',
        severity: 'warning'
      });
    });

    return {
      isValid: validationErrors.length === 0,
      errors: validationErrors,
      warnings: validationWarnings
    };
  },
  updateField: (data: Section21, fieldPath: string, newValue: any): Section21 => {
    // Parse field path to determine subsection and entry
    const pathParts = fieldPath.split('.');
    
    if (pathParts.length >= 2) {
      const subsectionKey = pathParts[1] as Section21SubsectionKey;
      
      if (pathParts.length === 3 && (pathParts[2] === 'hasConsultation' || pathParts[2] === 'hasCourtOrdered')) {
        // Update subsection flag
        const update: Section21FieldUpdate = {
          subsectionKey,
          fieldPath: pathParts[2],
          newValue
        };
        return updateSection21Field(data, update);
      } else if (pathParts.length >= 4) {
        // Update entry field
        const entryIndex = parseInt(pathParts[2]);
        const entryFieldPath = pathParts.slice(3).join('.');
        
        const update: Section21FieldUpdate = {
          subsectionKey,
          entryIndex,
          fieldPath: entryFieldPath,
          newValue
        };
        return updateSection21Field(data, update);
      }
    }
    
    return StandardFieldOperations.updateSimpleField(data, fieldPath, newValue);
  },
  customActions: {
    // Subsection flag operations
    updateSubsectionFlag: (data: Section21, subsectionKey: Section21SubsectionKey, value: 'YES' | 'NO'): Section21 => {
      const flagField = subsectionKey === 'courtOrderedTreatment' ? 'hasCourtOrdered' : 'hasConsultation';
      const update: Section21FieldUpdate = {
        subsectionKey,
        fieldPath: flagField,
        newValue: value
      };
      return updateSection21Field(data, update);
    },

    // Entry management operations
    addMentalHealthEntry: (data: Section21, subsectionKey: Section21SubsectionKey): Section21 => {
      const newData = { ...data };
      let newEntry: any;

      if (subsectionKey === 'courtOrderedTreatment') {
        newEntry = createDefaultCourtOrderedEntry();
      } else {
        newEntry = createDefaultMentalHealthEntry();
      }

      newData.section21[subsectionKey].entries.push(newEntry);
      newData.section21[subsectionKey].entriesCount = newData.section21[subsectionKey].entries.length;

      return newData;
    },

    removeMentalHealthEntry: (data: Section21, subsectionKey: Section21SubsectionKey, entryIndex: number): Section21 => {
      const newData = { ...data };
      
      if (newData.section21[subsectionKey].entries[entryIndex]) {
        newData.section21[subsectionKey].entries.splice(entryIndex, 1);
        newData.section21[subsectionKey].entriesCount = newData.section21[subsectionKey].entries.length;
      }

      return newData;
    },

    // Field update operations
    updateEntryField: (data: Section21, subsectionKey: Section21SubsectionKey, entryIndex: number, fieldPath: string, newValue: any): Section21 => {
      const update: Section21FieldUpdate = {
        subsectionKey,
        entryIndex,
        fieldPath,
        newValue
      };
      return updateSection21Field(data, update);
    }
  }
};

// ============================================================================
// CREATE ENHANCED SECTION CONTEXT
// ============================================================================

const {
  SectionProvider: Section21Provider,
  useSection: useSection21Base
} = createEnhancedSectionContext(section21Config);

// ============================================================================
// ENHANCED SECTION 21 CONTEXT TYPE
// ============================================================================

export interface Section21ContextType extends EnhancedSectionContextType<Section21> {
  // Section-specific computed values
  getTotalMentalHealthEntries: () => number;
  getSubsectionEntryCount: (subsectionKey: Section21SubsectionKey) => number;
  hasAnyMentalHealthIssues: () => boolean;

  // Section-specific operations
  updateSubsectionFlag: (subsectionKey: Section21SubsectionKey, value: 'YES' | 'NO') => void;
  addEntry: (subsectionKey: Section21SubsectionKey) => void;
  removeEntry: (subsectionKey: Section21SubsectionKey, entryIndex: number) => void;
  updateEntryField: (subsectionKey: Section21SubsectionKey, entryIndex: number, fieldPath: string, newValue: any) => void;

  // Section-specific validation
  validateEntry: (subsectionKey: Section21SubsectionKey, entryIndex: number) => MentalHealthValidationResult;
  validateSubsection: (subsectionKey: Section21SubsectionKey) => MentalHealthValidationResult;

  // Utility functions
  getEntryById: (subsectionKey: Section21SubsectionKey, entryId: string | number) => any | null;
}

// ============================================================================
// ENHANCED HOOK WITH SECTION-SPECIFIC FEATURES
// ============================================================================

export const useSection21 = (): Section21ContextType => {
  const baseContext = useSection21Base();

  // Add section-specific computed values and methods
  const getTotalMentalHealthEntriesCount = (): number => {
    return getTotalMentalHealthEntries(baseContext.sectionData);
  };

  const getSubsectionEntryCount = (subsectionKey: Section21SubsectionKey): number => {
    return baseContext.sectionData?.section21?.[subsectionKey]?.entriesCount || 0;
  };

  const hasAnyMentalHealthIssuesReported = (): boolean => {
    return hasAnyMentalHealthIssues(baseContext.sectionData);
  };

  // Section-specific operations using updateField from base context
  const updateSubsectionFlag = (subsectionKey: Section21SubsectionKey, value: 'YES' | 'NO'): void => {
    const flagField = subsectionKey === 'courtOrderedTreatment' ? 'hasCourtOrdered' : 'hasConsultation';
    const fieldPath = `section21.${subsectionKey}.${flagField}`;
    baseContext.updateField(fieldPath, value);
  };

  const addEntry = (subsectionKey: Section21SubsectionKey): void => {
    const updatedData = section21Config.customActions.addMentalHealthEntry(
      baseContext.sectionData,
      subsectionKey
    );
    // Use updateField to trigger the proper data flow
    baseContext.updateField('section21', updatedData.section21);
  };

  const removeEntry = (subsectionKey: Section21SubsectionKey, entryIndex: number): void => {
    const updatedData = section21Config.customActions.removeMentalHealthEntry(
      baseContext.sectionData,
      subsectionKey,
      entryIndex
    );
    // Use updateField to trigger the proper data flow
    baseContext.updateField('section21', updatedData.section21);
  };

  const updateEntryField = (subsectionKey: Section21SubsectionKey, entryIndex: number, fieldPath: string, newValue: any): void => {
    const fullFieldPath = `section21.${subsectionKey}.entries.${entryIndex}.${fieldPath}`;
    baseContext.updateField(fullFieldPath, newValue);
  };

  // Section-specific validation
  const validateEntry = (subsectionKey: Section21SubsectionKey, entryIndex: number): MentalHealthValidationResult => {
    const entry = baseContext.sectionData?.section21?.[subsectionKey]?.entries?.[entryIndex];
    if (!entry) {
      return {
        isValid: false,
        errors: ['Entry not found'],
        warnings: [],
        missingRequiredFields: []
      };
    }

    const validationContext: Section21ValidationContext = {
      currentDate: new Date(),
      rules: {
        requiresReason: true,
        requiresProfessionalInfo: true,
        requiresDateRange: true,
        requiresTreatmentDetails: false,
        maxReasonLength: 1000,
        maxTreatmentLength: 2000,
        allowsFutureDate: false
      },
      requiresDocumentation: false
    };

    return validateMentalHealthEntry(entry as MentalHealthEntry, validationContext);
  };

  const validateSubsection = (subsectionKey: Section21SubsectionKey): MentalHealthValidationResult => {
    const subsection = baseContext.sectionData?.section21?.[subsectionKey];
    if (!subsection) {
      return {
        isValid: false,
        errors: ['Subsection not found'],
        warnings: [],
        missingRequiredFields: []
      };
    }

    const allErrors: string[] = [];
    const allWarnings: string[] = [];
    const allMissingFields: string[] = [];

    const hasFlag = 'hasConsultation' in subsection ? subsection.hasConsultation?.value : (subsection as any).hasCourtOrdered?.value;
    
    if (hasFlag === 'YES' && subsection.entries) {
      subsection.entries.forEach((entry: any, index: number) => {
        const entryValidation = validateEntry(subsectionKey, index);
        
        entryValidation.errors.forEach(error => {
          allErrors.push(`Entry ${index + 1}: ${error}`);
        });
        
        entryValidation.warnings.forEach(warning => {
          allWarnings.push(`Entry ${index + 1}: ${warning}`);
        });
        
        entryValidation.missingRequiredFields.forEach(field => {
          allMissingFields.push(`Entry ${index + 1}.${field}`);
        });
      });
    }

    return {
      isValid: allErrors.length === 0,
      errors: allErrors,
      warnings: allWarnings,
      missingRequiredFields: allMissingFields
    };
  };

  // Utility functions
  const getEntryById = (subsectionKey: Section21SubsectionKey, entryId: string | number): any | null => {
    const entries = baseContext.sectionData?.section21?.[subsectionKey]?.entries || [];
    return entries.find((entry: any) => entry._id?.value === entryId) || null;
  };

  return {
    ...baseContext,
    getTotalMentalHealthEntries: getTotalMentalHealthEntriesCount,
    getSubsectionEntryCount,
    hasAnyMentalHealthIssues: hasAnyMentalHealthIssuesReported,
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

export { Section21Provider }; 