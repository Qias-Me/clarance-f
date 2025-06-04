/**
 * Section8 Context Provider - U.S. Passport Information
 *
 * React Context provider for SF-86 Section 8 (U.S. Passport Information) with
 * SF86FormContext integration and optimized defensive check logic.
 */

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useMemo,
} from 'react';
import { cloneDeep } from 'lodash';
import type {
  Section8,
  Section8ValidationContext,
  Section8ValidationRules,
  PassportValidationResult
} from '../../../../api/interfaces/sections2.0/section8';
import { createDefaultSection8 } from '../../../../api/interfaces/sections2.0/section8';
import type {
  ValidationResult,
  ValidationError,
  ChangeSet
} from '../shared/base-interfaces';
import { useSection86FormIntegration } from '../shared/section-context-integration';

// ============================================================================
// CONTEXT TYPE DEFINITION
// ============================================================================

export interface Section8ContextType {
  // State
  section8Data: Section8;
  isLoading: boolean;
  errors: Record<string, string>;
  isDirty: boolean;

  // Basic Actions
  updatePassportFlag: (hasPassport: "YES" | "NO") => void;
  updatePassportNumber: (passportNumber: string) => void;
  updatePassportName: (field: 'lastName' | 'firstName' | 'middleName' | 'suffix', value: string) => void;
  updatePassportDate: (dateType: 'issueDate' | 'expirationDate', date: string, estimated?: boolean) => void;
  updateFieldValue: (fieldPath: string, newValue: any) => void;

  // Validation
  validateSection: () => ValidationResult;
  validatePassport: () => PassportValidationResult;

  // Utility
  resetSection: () => void;
  loadSection: (data: Section8) => void;
  getChanges: () => ChangeSet;
}

// ============================================================================
// DEFAULT DATA AND VALIDATION
// ============================================================================

// Use the DRY createDefaultSection8 from the interface
// This eliminates hardcoded values and uses sections-references as single source of truth

const defaultValidationRules: Section8ValidationRules = {
  requiresPassportInfo: true,
  passportNumberFormat: /^[A-Z0-9]{6,9}$/,
  requiresNameOnPassport: true,
  allowsEstimatedDates: true,
  maxPassportAge: 15
};

// ============================================================================
// CONTEXT CREATION
// ============================================================================

const Section8Context = createContext<Section8ContextType | undefined>(undefined);

// ============================================================================
// PROVIDER COMPONENT
// ============================================================================

export interface Section8ProviderProps {
  children: React.ReactNode;
}

export const Section8Provider: React.FC<Section8ProviderProps> = ({ children }) => {
  // ============================================================================
  // CORE STATE MANAGEMENT
  // ============================================================================

  const [section8Data, setSection8Data] = useState<Section8>(createDefaultSection8());
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [initialData] = useState<Section8>(createDefaultSection8());

  // ============================================================================
  // COMPUTED VALUES
  // ============================================================================

  const isDirty = useMemo(() => {
    return JSON.stringify(section8Data) !== JSON.stringify(initialData);
  }, [section8Data, initialData]);

  // ============================================================================
  // VALIDATION FUNCTIONS
  // ============================================================================

  const validateSection = useCallback((): ValidationResult => {
    const validationErrors: ValidationError[] = [];
    const validationWarnings: ValidationError[] = [];

    // Validate passport information if passport is indicated
    if (section8Data.section8.hasPassport.value === "YES") {
      const validationContext: Section8ValidationContext = {
        currentDate: new Date(),
        rules: defaultValidationRules
      };

      // Basic passport number validation
      if (!section8Data.section8.passportNumber.value.trim()) {
        validationErrors.push({
          field: 'passportNumber',
          message: 'Passport number is required when passport is indicated',
          code: 'VALIDATION_ERROR',
          severity: 'error'
        });
      }

      // Basic name validation
      if (!section8Data.section8.nameOnPassport.lastName.value.trim()) {
        validationErrors.push({
          field: 'lastName',
          message: 'Last name on passport is required',
          code: 'VALIDATION_ERROR',
          severity: 'error'
        });
      }

      if (!section8Data.section8.nameOnPassport.firstName.value.trim()) {
        validationErrors.push({
          field: 'firstName',
          message: 'First name on passport is required',
          code: 'VALIDATION_ERROR',
          severity: 'error'
        });
      }
    }

    // Update local errors
    const newErrors: Record<string, string> = {};
    validationErrors.forEach(error => {
      newErrors[error.field] = error.message;
    });
    setErrors(newErrors);

    return {
      isValid: validationErrors.length === 0,
      errors: validationErrors,
      warnings: validationWarnings
    };
  }, [section8Data]);

  const validatePassport = useCallback((): PassportValidationResult => {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (section8Data.section8.hasPassport.value === "YES") {
      const passportNum = section8Data.section8.passportNumber.value.toUpperCase();

      if (!passportNum) {
        errors.push('Passport number is required');
      } else if (passportNum.length < 6 || passportNum.length > 9) {
        errors.push('Passport number must be between 6 and 9 characters');
      } else if (!/^[A-Z0-9]+$/.test(passportNum)) {
        errors.push('Passport number can only contain letters and numbers');
      }
    }

    return { isValid: errors.length === 0, errors, warnings };
  }, [section8Data]);

  // ============================================================================
  // CRUD OPERATIONS
  // ============================================================================

  const updatePassportFlag = useCallback((hasPassport: "YES" | "NO") => {
    setSection8Data(prevData => {
      const newData = cloneDeep(prevData);
      newData.section8.hasPassport.value = hasPassport;
      return newData;
    });
  }, []);

  const updatePassportNumber = useCallback((passportNumber: string) => {
    setSection8Data(prevData => {
      const newData = cloneDeep(prevData);
      newData.section8.passportNumber.value = passportNumber;
      return newData;
    });
  }, []);

  const updatePassportName = useCallback((field: 'lastName' | 'firstName' | 'middleName' | 'suffix', value: string) => {
    setSection8Data(prevData => {
      const newData = cloneDeep(prevData);
      newData.section8.nameOnPassport[field].value = value;
      return newData;
    });
  }, []);

  const updatePassportDate = useCallback((dateType: 'issueDate' | 'expirationDate', date: string, estimated?: boolean) => {
    setSection8Data(prevData => {
      const newData = cloneDeep(prevData);
      newData.section8.dates[dateType].date.value = date;
      if (estimated !== undefined) {
        newData.section8.dates[dateType].estimated.value = estimated;
      }
      return newData;
    });
  }, []);

  const updateFieldValue = useCallback((fieldPath: string, newValue: any) => {
    setSection8Data(prevData => {
      const newData = cloneDeep(prevData);
      const pathParts = fieldPath.split('.');
      let current: any = newData;

      for (let i = 0; i < pathParts.length - 1; i++) {
        current = current[pathParts[i]];
      }

      const lastKey = pathParts[pathParts.length - 1];
      if (current[lastKey] && typeof current[lastKey] === 'object' && 'value' in current[lastKey]) {
        current[lastKey].value = newValue;
      } else {
        current[lastKey] = newValue;
      }

      return newData;
    });
  }, []);

  // ============================================================================
  // UTILITY FUNCTIONS
  // ============================================================================

  const resetSection = useCallback(() => {
    const newData = createDefaultSection8();
    setSection8Data(newData);
    setErrors({});
  }, []);

  const loadSection = useCallback((data: Section8) => {
    setSection8Data(cloneDeep(data));
    setErrors({});
  }, []);

  const getChanges = useCallback((): ChangeSet => {
    const changes: ChangeSet = {};

    // Simple change detection - compare with initial data
    if (JSON.stringify(section8Data) !== JSON.stringify(initialData)) {
      changes['section8'] = {
        oldValue: initialData,
        newValue: section8Data,
        timestamp: new Date()
      };
    }

    return changes;
  }, [section8Data, initialData]);

  // ============================================================================
  // FIELD FLATTENING FOR PDF GENERATION
  // ============================================================================

  /**
   * Flatten Section8 data structure into Field objects for PDF generation
   * This converts the nested Section8 structure into a flat object with Field<T> objects
   * Following the Section 29 pattern for consistency
   */
  const flattenSection8Fields = useCallback((): Record<string, any> => {
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

    // Flatten section8 passport information fields
    if (section8Data.section8) {
      // Main passport question
      addField(section8Data.section8.hasPassport, 'section8.hasPassport');

      // Passport number
      addField(section8Data.section8.passportNumber, 'section8.passportNumber');

      // Name on passport fields
      if (section8Data.section8.nameOnPassport) {
        addField(section8Data.section8.nameOnPassport.lastName, 'section8.nameOnPassport.lastName');
        addField(section8Data.section8.nameOnPassport.firstName, 'section8.nameOnPassport.firstName');
        addField(section8Data.section8.nameOnPassport.middleName, 'section8.nameOnPassport.middleName');
        addField(section8Data.section8.nameOnPassport.suffix, 'section8.nameOnPassport.suffix');
      }

      // Date fields
      if (section8Data.section8.dates) {
        // Issue date
        if (section8Data.section8.dates.issueDate) {
          addField(section8Data.section8.dates.issueDate.date, 'section8.dates.issueDate.date');
          addField(section8Data.section8.dates.issueDate.estimated, 'section8.dates.issueDate.estimated');
        }

        // Expiration date
        if (section8Data.section8.dates.expirationDate) {
          addField(section8Data.section8.dates.expirationDate.date, 'section8.dates.expirationDate.date');
          addField(section8Data.section8.dates.expirationDate.estimated, 'section8.dates.expirationDate.estimated');
        }
      }
    }

    return flatFields;
  }, [section8Data]);

  // ============================================================================
  // SF86FORM INTEGRATION
  // ============================================================================

  // Integration with main form context using Section 1 gold standard pattern
  // Note: integration variable is used internally by the hook for registration
  const integration = useSection86FormIntegration(
    'section8',
    'Section 8: U.S. Passport Information',
    section8Data,
    setSection8Data,
    () => ({ isValid: validateSection().isValid, errors: validateSection().errors, warnings: validateSection().warnings }),
    getChanges,
    updateFieldValue // Pass Section 8's updateFieldValue function to integration
  );

  // ============================================================================
  // CONTEXT VALUE
  // ============================================================================

  const contextValue: Section8ContextType = {
    // State
    section8Data,
    isLoading,
    errors,
    isDirty,

    // Basic Actions
    updatePassportFlag,
    updatePassportNumber,
    updatePassportName,
    updatePassportDate,
    updateFieldValue,

    // Validation
    validateSection,
    validatePassport,

    // Utility
    resetSection,
    loadSection,
    getChanges,
  };

  return (
    <Section8Context.Provider value={contextValue}>
      {children}
    </Section8Context.Provider>
  );
};

// ============================================================================
// HOOK
// ============================================================================

export const useSection8 = (): Section8ContextType => {
  const context = useContext(Section8Context);
  if (!context) {
    throw new Error('useSection8 must be used within a Section8Provider');
  }
  return context;
};

// ============================================================================
// EXPORTS
// ============================================================================

export default Section8Provider;
