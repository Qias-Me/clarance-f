/**
 * Section 20: Foreign Activities - Context Provider
 *
 * React context provider for SF-86 Section 20 following the Section 1 gold standard pattern.
 * This provider manages foreign activities data with proper sections-references integration,
 * validation, and SF86FormContext integration.
 *
 * FIELD COUNT: 790 (from sections-references/section-20.json analysis)
 *
 * Features:
 * - DRY approach with sections-references as single source of truth
 * - Section 1 gold standard patterns for simplicity and reliability
 * - Proper Field<T> interface compliance
 * - SF86FormContext integration via useSection86FormIntegration hook
 * - Comprehensive logging for debugging
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
import get from 'lodash/get';
import type {
  Section20,
  Section20SubsectionKey,
  Section20FieldUpdate,
  Section20ValidationContext,
  ForeignActivitiesValidationResult
} from '../../../../api/interfaces/sections2.0/section20';
import {
  createDefaultSection20,
  validateSection20,
  updateSection20Field,
  createDefaultForeignFinancialInterestEntry,
  createDefaultForeignBusinessEntry,
  createDefaultForeignTravelEntry
} from '../../../../api/interfaces/sections2.0/section20';

import { useSection86FormIntegration } from '../shared/section-context-integration';
import type { ValidationResult, ValidationError, ChangeSet } from '../shared/base-interfaces';

// ============================================================================
// CONTEXT INTERFACE
// ============================================================================

export interface Section20ContextType {
  // State
  section20Data: Section20;
  isLoading: boolean;
  errors: Record<string, string>;
  isDirty: boolean;

  // Basic Actions - FIXED: Removed updateForeignActivities to follow Section 1 gold standard
  updateSubsectionFlag: (subsectionKey: Section20SubsectionKey, value: 'YES' | 'NO') => void;
  updateFieldValue: (path: string, value: any) => void;
  addEntry: (subsectionKey: Section20SubsectionKey) => void;

  // Validation
  validateSection: () => ValidationResult;

  // Utility
  resetSection: () => void;
  loadSection: (data: Section20) => void;
  getChanges: () => any;
}

// ============================================================================
// INITIAL STATE CREATION
// ============================================================================

// FIXED: Memoized initial state creation to prevent infinite loops
// Following Section 29 pattern for stability
let _memoizedInitialSection20State: Section20 | null = null;

const createInitialSection20State = (): Section20 => {
  if (!_memoizedInitialSection20State) {
    // console.log('� Creating memoized Section 20 initial state (one-time only)...');
    _memoizedInitialSection20State = createDefaultSection20();
    // console.log('✅ Memoized Section 20 initial state created successfully');
  }

  // Return a deep clone to prevent mutations affecting the memoized state
  return cloneDeep(_memoizedInitialSection20State);
};

// ============================================================================
// VALIDATION RULES
// ============================================================================

const defaultValidationRules = {
  requiresExplanation: true,
  requiresAmount: true,
  requiresDate: true,
  requiresAddress: true,
  maxDescriptionLength: 1000,
  maxExplanationLength: 2000,
  allowsFutureDate: false
};

// ============================================================================
// CONTEXT CREATION
// ============================================================================

const Section20Context = createContext<Section20ContextType | undefined>(undefined);

// ============================================================================
// PROVIDER COMPONENT
// ============================================================================

export interface Section20ProviderProps {
  children: React.ReactNode;
}

export const Section20Provider: React.FC<Section20ProviderProps> = ({ children }) => {
  // ============================================================================
  // CORE STATE MANAGEMENT
  // ============================================================================

  const [section20Data, setSection20Data] = useState<Section20>(createInitialSection20State());
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [initialData] = useState<Section20>(createInitialSection20State());
  const [isInitialized, setIsInitialized] = useState(false);

  // ============================================================================
  // COMPUTED VALUES
  // ============================================================================

  const isDirty = JSON.stringify(section20Data) !== JSON.stringify(initialData);

  // Set initialized flag after component mounts
  useEffect(() => {
    setIsInitialized(true);
  }, []);

  // ============================================================================
  // VALIDATION FUNCTIONS
  // ============================================================================

  const validateSection = useCallback((): ValidationResult => {
    const validationErrors: ValidationError[] = [];
    const validationWarnings: ValidationError[] = [];

    // Create validation context
    const validationContext: Section20ValidationContext = {
      currentDate: new Date(),
      rules: defaultValidationRules,
      requiresDocumentation: false
    };

    // Validate the entire section
    const sectionValidation = validateSection20(section20Data, validationContext);

    // Convert to ValidationError format
    sectionValidation.errors.forEach(error => {
      validationErrors.push({
        field: 'section20',
        message: error,
        code: 'FOREIGN_ACTIVITIES_VALIDATION_ERROR',
        severity: 'error'
      });
    });

    sectionValidation.warnings.forEach(warning => {
      validationWarnings.push({
        field: 'section20',
        message: warning,
        code: 'FOREIGN_ACTIVITIES_VALIDATION_WARNING',
        severity: 'warning'
      });
    });

    return {
      isValid: validationErrors.length === 0,
      errors: validationErrors,
      warnings: validationWarnings
    };
  }, [section20Data]);

  // Update errors when section data changes (but not during initial render)
  // FIXED: Removed 'errors' dependency to prevent validation loops
  useEffect(() => {
    // Skip validation on initial render to avoid infinite loops
    if (!isInitialized) return;

    const validationResult = validateSection();
    const newErrors: Record<string, string> = {};

    validationResult.errors.forEach(error => {
      newErrors[error.field] = error.message;
    });

    // Only update errors if they actually changed (without depending on current errors)
    const newErrorKeys = Object.keys(newErrors);
    const hasErrors = newErrorKeys.length > 0;

    // Simple check: only update if we have new errors or need to clear existing ones
    if (hasErrors || Object.keys(errors).length > 0) {
      setErrors(newErrors);
    }
  }, [section20Data, isInitialized, validateSection]); // FIXED: Removed 'errors' dependency

  // ============================================================================
  // CRUD OPERATIONS
  // ============================================================================

  // REMOVED: updateForeignActivities function that was causing double .value nesting
  // Now using direct path updates in updateFieldValue following Section 1 gold standard

  const updateSubsectionFlag = useCallback((subsectionKey: Section20SubsectionKey, value: 'YES' | 'NO') => {
    console.log(`🔧 Section20: updateSubsectionFlag called:`, { subsectionKey, value });

    setSection20Data(prevData => {
      const newData = cloneDeep(prevData);

      switch (subsectionKey) {
        case 'foreignFinancialInterests':
          newData.section20.foreignFinancialInterests.hasForeignFinancialInterests.value = value;
          break;
        case 'foreignBusinessActivities':
          newData.section20.foreignBusinessActivities.hasForeignBusinessActivities.value = value;
          break;
        case 'foreignTravel':
          newData.section20.foreignTravel.hasForeignTravel.value = value;
          break;
      }

      console.log(`✅ Section20: Updated ${subsectionKey} flag to:`, value);
      return newData;
    });
  }, []);

  /**
   * FIXED: Generic field update function following Section 1 gold standard pattern
   * Uses direct path updates with lodash set() instead of complex path parsing
   * This resolves the field path double-nesting issue that was preventing data persistence
   */
  const updateFieldValue = useCallback((path: string, value: any) => {
    console.log(`🔧 Section20: updateFieldValue called:`, { path, value });
    console.log(`🔍 Section20: Current data before update:`, JSON.stringify(section20Data, null, 2));

    // CRITICAL FIX: Use direct path update like Section 1 and Section 19 gold standard
    // This prevents the double .value nesting issue that was breaking field updates
    setSection20Data(prev => {
      const newData = cloneDeep(prev);

      // Enhanced logging for debugging
      console.log(`🔍 Section20: Setting path "${path}" to value:`, value);
      console.log(`🔍 Section20: Data structure before set():`, JSON.stringify(newData, null, 2));

      set(newData, path, value);

      console.log(`✅ Section20: Updated field ${path} to:`, value);
      console.log(`🔍 Section20: Data after update:`, JSON.stringify(newData, null, 2));

      // Verify the field was actually set
      const verifyValue = get(newData, path);
      console.log(`🔍 Section20: Verification - get("${path}") returns:`, verifyValue);

      return newData;
    });
  }, [section20Data]);

  /**
   * Add a new entry to the specified subsection
   * Automatically creates the appropriate entry type based on subsection
   */
  const addEntry = useCallback((subsectionKey: Section20SubsectionKey) => {
    console.log(`➕ Section20: Adding new entry to ${subsectionKey}`);

    setSection20Data(prevData => {
      const newData = cloneDeep(prevData);

      switch (subsectionKey) {
        case 'foreignFinancialInterests':
          const financialEntry = createDefaultForeignFinancialInterestEntry();
          console.log(`🔍 Section20: Created financial entry structure:`, financialEntry);
          console.log(`🔍 Section20: Financial entry field types:`, Object.keys(financialEntry).map(key => ({
            key,
            type: typeof financialEntry[key],
            hasValue: financialEntry[key]?.value !== undefined,
            value: financialEntry[key]?.value
          })));
          newData.section20.foreignFinancialInterests.entries.push(financialEntry);
          newData.section20.foreignFinancialInterests.entriesCount = newData.section20.foreignFinancialInterests.entries.length;
          console.log(`✅ Section20: Added foreign financial interest entry #${newData.section20.foreignFinancialInterests.entries.length}`);
          break;

        case 'foreignBusinessActivities':
          // CRITICAL FIX: Pass entry index to map to correct subform (74, 76, 77, 78, 79, 80)
          const currentBusinessCount = newData.section20.foreignBusinessActivities.entries.length;
          const businessEntry = createDefaultForeignBusinessEntry(currentBusinessCount);
          console.log(`🔍 Section20: Created business entry structure for subform ${businessEntry.subformId}:`, businessEntry);
          newData.section20.foreignBusinessActivities.entries.push(businessEntry);
          newData.section20.foreignBusinessActivities.entriesCount = newData.section20.foreignBusinessActivities.entries.length;
          console.log(`✅ Section20: Added foreign business activity entry #${newData.section20.foreignBusinessActivities.entries.length} (subform ${businessEntry.subformId}, page ${businessEntry.pageNumber})`);
          break;

        case 'foreignTravel':
          // CRITICAL FIX: Pass entry index to map to correct subform (68, 69, 70, 71, 72)
          const currentTravelCount = newData.section20.foreignTravel.entries.length;
          const travelEntry = createDefaultForeignTravelEntry(currentTravelCount);
          console.log(`🔍 Section20: Created travel entry structure for subform ${travelEntry.subformId}:`, travelEntry);
          newData.section20.foreignTravel.entries.push(travelEntry);
          newData.section20.foreignTravel.entriesCount = newData.section20.foreignTravel.entries.length;
          console.log(`✅ Section20: Added foreign travel entry #${newData.section20.foreignTravel.entries.length} (subform ${travelEntry.subformId}, page ${travelEntry.pageNumber})`);
          break;

        default:
          console.warn(`⚠️ Section20: Unknown subsection key: ${subsectionKey}`);
          return prevData;
      }

      return newData;
    });
  }, []);

  // ============================================================================
  // UTILITY FUNCTIONS
  // ============================================================================

  const resetSection = useCallback(() => {
    const newData = createInitialSection20State();
    setSection20Data(newData);
    setErrors({});
    console.log('🔄 Section20: Section reset to initial state');
  }, []);

  const loadSection = useCallback((data: Section20) => {
    setSection20Data(cloneDeep(data));
    setErrors({});
    console.log('📥 Section20: Section data loaded:', data);
  }, []);

  const getChanges = useCallback((): ChangeSet => {
    const changes: ChangeSet = {};

    // Simple change detection - compare with initial data
    if (JSON.stringify(section20Data) !== JSON.stringify(initialData)) {
      changes['section20'] = {
        oldValue: initialData,
        newValue: section20Data,
        timestamp: new Date()
      };
    }

    return changes;
  }, [section20Data, initialData]);

  // ============================================================================
  // FIELD FLATTENING FOR PDF GENERATION
  // ============================================================================

  /**
   * Flatten Section20 data structure into Field objects for PDF generation
   * This converts the nested Section20 structure into a flat object with Field<T> objects
   * Following the Section 1 pattern for consistency
   */
  const flattenSection20Fields = useCallback((): Record<string, any> => {
    const flatFields: Record<string, any> = {};

    const addField = (field: any, _path: string) => {
      if (
        field &&
        typeof field === "object" &&
        "id" in field &&
        "value" in field
      ) {
        flatFields[field.id] = field;
      }
    };

    // Flatten section20 foreign activities fields
    if (section20Data.section20) {
      const { foreignFinancialInterests, foreignBusinessActivities, foreignTravel } = section20Data.section20;

      // Add main subsection flags
      addField(foreignFinancialInterests.hasForeignFinancialInterests, 'section20.foreignFinancialInterests.hasForeignFinancialInterests');
      addField(foreignBusinessActivities.hasForeignBusinessActivities, 'section20.foreignBusinessActivities.hasForeignBusinessActivities');
      addField(foreignTravel.hasForeignTravel, 'section20.foreignTravel.hasForeignTravel');

      // Flatten entries (simplified for now - can be expanded later)
      foreignFinancialInterests.entries.forEach((entry, index) => {
        const flattenEntry = (obj: any, prefix: string) => {
          Object.entries(obj).forEach(([key, value]) => {
            if (value && typeof value === 'object' && 'id' in value && 'value' in value) {
              addField(value, `${prefix}.${key}`);
            } else if (value && typeof value === 'object' && !Array.isArray(value)) {
              flattenEntry(value, `${prefix}.${key}`);
            }
          });
        };
        flattenEntry(entry, `section20.foreignFinancialInterests.entries[${index}]`);
      });
    }

    return flatFields;
  }, [section20Data]);

  // ============================================================================
  // SF86FORM INTEGRATION
  // ============================================================================

  // Integration with main form context using Section 1 gold standard pattern
  // Note: integration variable is used internally by the hook for registration
  const integration = useSection86FormIntegration(
    'section20',
    'Section 20: Foreign Activities',
    section20Data,
    setSection20Data,
    () => ({ isValid: validateSection().isValid, errors: validateSection().errors, warnings: validateSection().warnings }),
    getChanges,
    updateFieldValue // Pass Section 20's updateFieldValue function to integration
  );

  // Enhanced logging for Section 20 registration
  useEffect(() => {
    console.log(`🔗 Section20: Integration hook initialized`);
    console.log(`🔍 Section20: Current section20Data:`, section20Data);
    console.log(`🔍 Section20: Integration object:`, integration);
  }, [integration, section20Data]);

  // ============================================================================
  // CONTEXT VALUE
  // ============================================================================

  const contextValue: Section20ContextType = {
    // State
    section20Data,
    isLoading,
    errors,
    isDirty,

    // Basic Actions - FIXED: Removed updateForeignActivities
    updateSubsectionFlag,
    updateFieldValue,
    addEntry,

    // Validation
    validateSection,

    // Utility
    resetSection,
    loadSection,
    getChanges
  };

  return (
    <Section20Context.Provider value={contextValue}>
      {children}
    </Section20Context.Provider>
  );
};

// ============================================================================
// HOOK
// ============================================================================

export const useSection20 = (): Section20ContextType => {
  const context = useContext(Section20Context);
  if (!context) {
    throw new Error('useSection20 must be used within a Section20Provider');
  }
  return context;
};

// ============================================================================
// EXPORTS
// ============================================================================

export default Section20Provider;