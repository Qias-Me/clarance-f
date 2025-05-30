/**
 * Section Context Integration Example
 * 
 * This file demonstrates how to integrate an existing section context (Section29)
 * with the new SF86FormContext using the Section Context Integration Framework.
 * This serves as a practical example for migrating other sections.
 */

import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { cloneDeep, set } from 'lodash';
import type { Section29 } from '../../../../api/interfaces/sections2.0/section29';
import { useSection86FormIntegration } from './section-context-integration';
import type { ValidationResult, ValidationError } from './base-interfaces';

// ============================================================================
// EXAMPLE: ENHANCED SECTION29 CONTEXT WITH INTEGRATION
// ============================================================================

/**
 * Enhanced Section29 Context Type with integration capabilities
 */
interface EnhancedSection29ContextType {
  // Original Section29 properties
  section29Data: Section29;
  isLoading: boolean;
  errors: Record<string, string>;
  isDirty: boolean;
  
  // Original Section29 operations
  updateSubsectionFlag: (subsectionKey: string, value: "YES" | "NO") => void;
  addOrganizationEntry: (subsectionKey: string) => void;
  addActivityEntry: (subsectionKey: string, entryType: string) => void;
  removeEntry: (subsectionKey: string, entryIndex: number) => void;
  updateFieldValue: (subsectionKey: string, entryIndex: number, fieldPath: string, newValue: any) => void;
  getEntryCount: (subsectionKey: string) => number;
  getEntry: (subsectionKey: string, entryIndex: number) => any;
  
  // Enhanced operations with integration
  moveEntry: (subsectionKey: string, fromIndex: number, toIndex: number) => void;
  duplicateEntry: (subsectionKey: string, entryIndex: number) => void;
  clearEntry: (subsectionKey: string, entryIndex: number) => void;
  bulkUpdateFields: (updates: Array<{ path: string; value: any }>) => void;
  resetSection: () => void;
  loadSection: (data: Section29) => void;
  validateSection: () => ValidationResult;
  getChanges: () => Record<string, any>;
  
  // NEW: Integration capabilities
  markComplete: () => void;
  markIncomplete: () => void;
  triggerGlobalValidation: () => ValidationResult;
  getGlobalFormState: () => any;
  navigateToSection: (sectionId: string) => void;
  saveForm: () => Promise<void>;
  emitEvent: (event: any) => void;
  subscribeToEvents: (eventType: string, callback: Function) => () => void;
}

/**
 * Default Section29 data structure
 */
const defaultSection29Data: Section29 = {
  _id: 29,
  terrorismOrganizations: {
    hasAssociation: {
      id: "form1[0].Section29[0].RadioButtonList[0]",
      type: "radio",
      label: "Have you EVER been a member of an organization dedicated to terrorism?",
      value: "NO",
      isDirty: false,
      isValid: true,
      errors: []
    },
    entries: []
  },
  terrorismActivities: {
    hasActivity: {
      id: "form1[0].Section29_2[0].RadioButtonList[0]",
      type: "radio", 
      label: "Have you EVER engaged in acts of terrorism?",
      value: "NO",
      isDirty: false,
      isValid: true,
      errors: []
    },
    entries: []
  }
};

/**
 * Enhanced Section29 Context
 */
const EnhancedSection29Context = React.createContext<EnhancedSection29ContextType | null>(null);

/**
 * Enhanced Section29 Provider with SF86Form integration
 */
export const EnhancedSection29Provider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Core state management (unchanged from original)
  const [section29Data, setSection29Data] = useState<Section29>(defaultSection29Data);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // ============================================================================
  // INTEGRATION WITH SF86FORMCONTEXT
  // ============================================================================
  
  /**
   * Validation function for integration
   */
  const validateSection = useCallback((): ValidationResult => {
    const validationErrors: ValidationError[] = [];
    
    // Example validation logic
    if (!section29Data.terrorismOrganizations?.hasAssociation?.value) {
      validationErrors.push({
        field: 'terrorismOrganizations.hasAssociation',
        message: 'Please answer whether you have been a member of a terrorism organization',
        code: 'REQUIRED',
        severity: 'error'
      });
    }
    
    if (!section29Data.terrorismActivities?.hasActivity?.value) {
      validationErrors.push({
        field: 'terrorismActivities.hasActivity',
        message: 'Please answer whether you have engaged in terrorism activities',
        code: 'REQUIRED',
        severity: 'error'
      });
    }
    
    return {
      isValid: validationErrors.length === 0,
      errors: validationErrors,
      warnings: []
    };
  }, [section29Data]);
  
  /**
   * Change tracking function for integration
   */
  const getChanges = useCallback(() => {
    // Simple change tracking implementation
    // In a real implementation, you'd compare with initial data
    return {
      section29: {
        oldValue: defaultSection29Data,
        newValue: section29Data,
        timestamp: new Date()
      }
    };
  }, [section29Data]);
  
  /**
   * SF86Form integration hook
   */
  const integration = useSection86FormIntegration(
    'section29',
    'Section 29: Associations',
    section29Data,
    setSection29Data,
    validateSection,
    getChanges
  );
  
  // ============================================================================
  // ORIGINAL SECTION29 OPERATIONS (PRESERVED)
  // ============================================================================
  
  /**
   * Update subsection flag (YES/NO questions)
   */
  const updateSubsectionFlag = useCallback((subsectionKey: string, value: "YES" | "NO") => {
    setSection29Data(prevData => {
      const newData = cloneDeep(prevData);
      set(newData, `${subsectionKey}.hasAssociation.value`, value);
      return newData;
    });
  }, []);
  
  /**
   * Add organization entry
   */
  const addOrganizationEntry = useCallback((subsectionKey: string) => {
    setSection29Data(prevData => {
      const newData = cloneDeep(prevData);
      const subsection = newData[subsectionKey as keyof Section29] as any;
      
      if (subsection && subsection.entries) {
        const newEntry = {
          _id: Date.now(),
          organizationName: {
            id: `form1[0].Section29[0].TextField11[${subsection.entries.length === 0 ? 1 : 8}]`,
            type: "text",
            label: "Organization Name",
            value: "",
            isDirty: false,
            isValid: true,
            errors: []
          }
          // Add other fields as needed
        };
        
        subsection.entries.push(newEntry);
      }
      
      return newData;
    });
  }, []);
  
  /**
   * Add activity entry
   */
  const addActivityEntry = useCallback((subsectionKey: string, entryType: string) => {
    setSection29Data(prevData => {
      const newData = cloneDeep(prevData);
      const subsection = newData[subsectionKey as keyof Section29] as any;
      
      if (subsection && subsection.entries) {
        const newEntry = {
          _id: Date.now(),
          activityDescription: {
            id: `form1[0].Section29_2[0].TextField11[${subsection.entries.length}]`,
            type: "textarea",
            label: "Activity Description",
            value: "",
            isDirty: false,
            isValid: true,
            errors: []
          }
        };
        
        subsection.entries.push(newEntry);
      }
      
      return newData;
    });
  }, []);
  
  /**
   * Remove entry
   */
  const removeEntry = useCallback((subsectionKey: string, entryIndex: number) => {
    setSection29Data(prevData => {
      const newData = cloneDeep(prevData);
      const subsection = newData[subsectionKey as keyof Section29] as any;
      
      if (subsection && subsection.entries && entryIndex >= 0 && entryIndex < subsection.entries.length) {
        subsection.entries.splice(entryIndex, 1);
      }
      
      return newData;
    });
  }, []);
  
  /**
   * Update field value
   */
  const updateFieldValue = useCallback((subsectionKey: string, entryIndex: number, fieldPath: string, newValue: any) => {
    setSection29Data(prevData => {
      const newData = cloneDeep(prevData);
      const fullPath = `${subsectionKey}.entries[${entryIndex}].${fieldPath}`;
      set(newData, fullPath, newValue);
      return newData;
    });
  }, []);
  
  /**
   * Get entry count
   */
  const getEntryCount = useCallback((subsectionKey: string): number => {
    const subsection = section29Data[subsectionKey as keyof Section29] as any;
    return subsection?.entries?.length || 0;
  }, [section29Data]);
  
  /**
   * Get specific entry
   */
  const getEntry = useCallback((subsectionKey: string, entryIndex: number) => {
    const subsection = section29Data[subsectionKey as keyof Section29] as any;
    return subsection?.entries?.[entryIndex] || null;
  }, [section29Data]);
  
  // ============================================================================
  // ENHANCED OPERATIONS
  // ============================================================================
  
  /**
   * Move entry to different position
   */
  const moveEntry = useCallback((subsectionKey: string, fromIndex: number, toIndex: number) => {
    setSection29Data(prevData => {
      const newData = cloneDeep(prevData);
      const subsection = newData[subsectionKey as keyof Section29] as any;
      
      if (subsection && subsection.entries) {
        const [movedEntry] = subsection.entries.splice(fromIndex, 1);
        subsection.entries.splice(toIndex, 0, movedEntry);
      }
      
      return newData;
    });
  }, []);
  
  /**
   * Duplicate entry
   */
  const duplicateEntry = useCallback((subsectionKey: string, entryIndex: number) => {
    setSection29Data(prevData => {
      const newData = cloneDeep(prevData);
      const subsection = newData[subsectionKey as keyof Section29] as any;
      
      if (subsection && subsection.entries && subsection.entries[entryIndex]) {
        const originalEntry = subsection.entries[entryIndex];
        const duplicatedEntry = {
          ...cloneDeep(originalEntry),
          _id: Date.now()
        };
        
        subsection.entries.push(duplicatedEntry);
      }
      
      return newData;
    });
  }, []);
  
  /**
   * Clear entry (reset to default values)
   */
  const clearEntry = useCallback((subsectionKey: string, entryIndex: number) => {
    setSection29Data(prevData => {
      const newData = cloneDeep(prevData);
      const subsection = newData[subsectionKey as keyof Section29] as any;
      
      if (subsection && subsection.entries && subsection.entries[entryIndex]) {
        // Reset all field values to empty/default
        const entry = subsection.entries[entryIndex];
        Object.keys(entry).forEach(key => {
          if (key !== '_id' && typeof entry[key] === 'object' && entry[key].value !== undefined) {
            entry[key].value = '';
          }
        });
      }
      
      return newData;
    });
  }, []);
  
  /**
   * Bulk update multiple fields
   */
  const bulkUpdateFields = useCallback((updates: Array<{ path: string; value: any }>) => {
    setSection29Data(prevData => {
      const newData = cloneDeep(prevData);
      
      updates.forEach(({ path, value }) => {
        set(newData, path, value);
      });
      
      return newData;
    });
  }, []);
  
  /**
   * Reset section to default state
   */
  const resetSection = useCallback(() => {
    setSection29Data(cloneDeep(defaultSection29Data));
    setErrors({});
  }, []);
  
  /**
   * Load section data
   */
  const loadSection = useCallback((data: Section29) => {
    setSection29Data(cloneDeep(data));
    setErrors({});
  }, []);
  
  // ============================================================================
  // COMPUTED VALUES
  // ============================================================================
  
  /**
   * Check if section has unsaved changes
   */
  const isDirty = useMemo(() => {
    return JSON.stringify(section29Data) !== JSON.stringify(defaultSection29Data);
  }, [section29Data]);
  
  // ============================================================================
  // CONTEXT VALUE
  // ============================================================================
  
  const contextValue: EnhancedSection29ContextType = {
    // Original properties
    section29Data,
    isLoading,
    errors,
    isDirty,
    
    // Original operations
    updateSubsectionFlag,
    addOrganizationEntry,
    addActivityEntry,
    removeEntry,
    updateFieldValue,
    getEntryCount,
    getEntry,
    
    // Enhanced operations
    moveEntry,
    duplicateEntry,
    clearEntry,
    bulkUpdateFields,
    resetSection,
    loadSection,
    validateSection,
    getChanges,
    
    // NEW: Integration capabilities
    markComplete: integration.markComplete,
    markIncomplete: integration.markIncomplete,
    triggerGlobalValidation: integration.triggerGlobalValidation,
    getGlobalFormState: integration.getGlobalFormState,
    navigateToSection: integration.navigateToSection,
    saveForm: integration.saveForm,
    emitEvent: integration.emitEvent,
    subscribeToEvents: integration.subscribeToEvents
  };
  
  return (
    <EnhancedSection29Context.Provider value={contextValue}>
      {children}
    </EnhancedSection29Context.Provider>
  );
};

/**
 * Hook to use Enhanced Section29 Context
 */
export const useEnhancedSection29 = (): EnhancedSection29ContextType => {
  const context = React.useContext(EnhancedSection29Context);
  if (!context) {
    throw new Error('useEnhancedSection29 must be used within an EnhancedSection29Provider');
  }
  return context;
};

// ============================================================================
// USAGE EXAMPLE COMPONENT
// ============================================================================

/**
 * Example component showing how to use the enhanced Section29 context
 */
export const EnhancedSection29Example: React.FC = () => {
  const {
    section29Data,
    updateSubsectionFlag,
    addOrganizationEntry,
    markComplete,
    triggerGlobalValidation,
    getGlobalFormState,
    navigateToSection,
    saveForm
  } = useEnhancedSection29();
  
  const handleTerrorismFlagChange = (value: "YES" | "NO") => {
    updateSubsectionFlag('terrorismOrganizations', value);
    
    // If YES, automatically add an entry
    if (value === 'YES') {
      addOrganizationEntry('terrorismOrganizations');
    }
  };
  
  const handleCompleteSection = async () => {
    // Validate before completing
    const validationResult = triggerGlobalValidation();
    
    if (validationResult.isValid) {
      markComplete();
      await saveForm();
      navigateToSection('section30');
    } else {
      console.log('Validation errors:', validationResult.errors);
    }
  };
  
  const globalState = getGlobalFormState();
  
  return (
    <div className="enhanced-section29-example">
      <h2>Enhanced Section 29: Associations</h2>
      
      <div className="global-state-info">
        <p>Form is dirty: {globalState.isDirty ? 'Yes' : 'No'}</p>
        <p>Form is valid: {globalState.isValid ? 'Yes' : 'No'}</p>
        <p>Completed sections: {globalState.completedSections.join(', ')}</p>
      </div>
      
      <div className="terrorism-organizations">
        <h3>Terrorism Organizations</h3>
        <label>
          <input
            type="radio"
            name="terrorismOrgs"
            value="YES"
            checked={section29Data.terrorismOrganizations?.hasAssociation?.value === 'YES'}
            onChange={() => handleTerrorismFlagChange('YES')}
          />
          Yes
        </label>
        <label>
          <input
            type="radio"
            name="terrorismOrgs"
            value="NO"
            checked={section29Data.terrorismOrganizations?.hasAssociation?.value === 'NO'}
            onChange={() => handleTerrorismFlagChange('NO')}
          />
          No
        </label>
      </div>
      
      <div className="actions">
        <button onClick={handleCompleteSection}>
          Complete Section & Continue
        </button>
        <button onClick={() => navigateToSection('section28')}>
          Go to Previous Section
        </button>
        <button onClick={() => saveForm()}>
          Save All Sections
        </button>
      </div>
    </div>
  );
};

// ============================================================================
// EXPORTS
// ============================================================================

export {
  EnhancedSection29Provider,
  useEnhancedSection29,
  EnhancedSection29Example
};
