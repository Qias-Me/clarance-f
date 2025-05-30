/**
 * Section Context Integration Framework
 * 
 * This framework allows individual section contexts to integrate with the central
 * SF86FormContext while maintaining their independence and section-specific functionality.
 * It provides hooks and utilities for seamless bidirectional data synchronization.
 */

import React, { useEffect, useCallback, useRef } from 'react';
import { cloneDeep, isEqual } from 'lodash';
import type { 
  BaseSectionContext,
  SectionId,
  ValidationResult,
  ChangeSet
} from './base-interfaces';
import { useSF86Form } from '../SF86FormContext';
import { useSectionContextIntegration } from './section-integration';

// ============================================================================
// INTEGRATION HOOK FOR SECTION CONTEXTS
// ============================================================================

/**
 * Hook that integrates a section context with the central SF86FormContext
 * This should be used by every section context to enable central coordination
 */
export function useSection86FormIntegration<T = any>(
  sectionId: SectionId,
  sectionName: string,
  sectionData: T,
  setSectionData: (data: T) => void,
  validateSection?: () => ValidationResult,
  getChanges?: () => ChangeSet
) {
  const sf86Form = useSF86Form();
  const previousDataRef = useRef<T>(sectionData);
  const isInitializedRef = useRef(false);
  
  // Create section context interface
  const sectionContext: BaseSectionContext = {
    sectionId,
    sectionName,
    sectionData,
    isLoading: false,
    errors: [],
    isDirty: !isEqual(sectionData, previousDataRef.current),
    
    updateFieldValue: (path: string, value: any) => {
      setSectionData(prevData => {
        const newData = cloneDeep(prevData);
        const pathParts = path.split('.');
        let current = newData as any;
        
        for (let i = 0; i < pathParts.length - 1; i++) {
          if (!current[pathParts[i]]) {
            current[pathParts[i]] = {};
          }
          current = current[pathParts[i]];
        }
        
        current[pathParts[pathParts.length - 1]] = value;
        return newData;
      });
    },
    
    validateSection: validateSection || (() => ({ isValid: true, errors: [], warnings: [] })),
    
    resetSection: () => {
      setSectionData(cloneDeep(previousDataRef.current));
    },
    
    loadSection: (data: T) => {
      setSectionData(cloneDeep(data));
      previousDataRef.current = cloneDeep(data);
    },
    
    getChanges: getChanges || (() => ({}))
  };
  
  // Register with section integration framework
  const integration = useSectionContextIntegration(sectionId, sectionName, sectionContext);
  
  // ============================================================================
  // BIDIRECTIONAL DATA SYNCHRONIZATION
  // ============================================================================
  
  /**
   * Sync section data to central form when it changes
   */
  useEffect(() => {
    if (isInitializedRef.current && !isEqual(sectionData, previousDataRef.current)) {
      sf86Form.updateSectionData(sectionId, sectionData);
      previousDataRef.current = cloneDeep(sectionData);
    }
  }, [sectionData, sectionId, sf86Form]);
  
  /**
   * Load initial data from central form on mount
   */
  useEffect(() => {
    const centralData = sf86Form.getSectionData(sectionId);
    if (centralData && !isInitializedRef.current) {
      setSectionData(cloneDeep(centralData));
      previousDataRef.current = cloneDeep(centralData);
    }
    isInitializedRef.current = true;
  }, [sectionId, sf86Form, setSectionData]);
  
  /**
   * Listen for external data updates from central form
   */
  useEffect(() => {
    const unsubscribe = integration.subscribeToEvents('DATA_SYNC', (event) => {
      if (event.sectionId === sectionId && event.payload.action === 'loaded') {
        const newData = event.payload.formData[sectionId];
        if (newData && !isEqual(newData, sectionData)) {
          setSectionData(cloneDeep(newData));
          previousDataRef.current = cloneDeep(newData);
        }
      }
    });
    
    return unsubscribe;
  }, [sectionId, sectionData, setSectionData, integration]);
  
  // ============================================================================
  // INTEGRATION UTILITIES
  // ============================================================================
  
  /**
   * Mark section as complete in central form
   */
  const markComplete = useCallback(() => {
    sf86Form.markSectionComplete(sectionId);
  }, [sf86Form, sectionId]);
  
  /**
   * Mark section as incomplete in central form
   */
  const markIncomplete = useCallback(() => {
    sf86Form.markSectionIncomplete(sectionId);
  }, [sf86Form, sectionId]);
  
  /**
   * Trigger global form validation
   */
  const triggerGlobalValidation = useCallback(() => {
    return sf86Form.validateForm();
  }, [sf86Form]);
  
  /**
   * Get global form state
   */
  const getGlobalFormState = useCallback(() => {
    return {
      formData: sf86Form.formData,
      isDirty: sf86Form.isDirty,
      isValid: sf86Form.isValid,
      completedSections: sf86Form.completedSections
    };
  }, [sf86Form]);
  
  /**
   * Navigate to another section
   */
  const navigateToSection = useCallback((targetSectionId: string) => {
    sf86Form.navigateToSection(targetSectionId);
  }, [sf86Form]);
  
  /**
   * Save the entire form
   */
  const saveForm = useCallback(async () => {
    return sf86Form.saveForm();
  }, [sf86Form]);
  
  return {
    // Integration utilities
    markComplete,
    markIncomplete,
    triggerGlobalValidation,
    getGlobalFormState,
    navigateToSection,
    saveForm,
    
    // Event system
    emitEvent: integration.emitEvent,
    subscribeToEvents: integration.subscribeToEvents,
    notifyChange: integration.notifyChange,
    
    // Central form access
    sf86Form,
    
    // Section context
    sectionContext
  };
}

// ============================================================================
// ENHANCED SECTION PROVIDER WRAPPER
// ============================================================================

/**
 * Higher-order component that wraps section providers with SF86Form integration
 */
export function withSF86FormIntegration<P extends object>(
  WrappedProvider: React.ComponentType<P>,
  sectionId: SectionId,
  sectionName: string
) {
  const IntegratedProvider: React.FC<P> = (props) => {
    return (
      <WrappedProvider {...props} />
    );
  };
  
  IntegratedProvider.displayName = `withSF86FormIntegration(${WrappedProvider.displayName || WrappedProvider.name})`;
  
  return IntegratedProvider;
}

// ============================================================================
// SECTION CONTEXT FACTORY
// ============================================================================

/**
 * Factory function to create section contexts with built-in SF86Form integration
 */
export function createIntegratedSectionContext<T>(
  sectionId: SectionId,
  sectionName: string,
  defaultData: T
) {
  const SectionContext = React.createContext<{
    sectionData: T;
    setSectionData: (data: T) => void;
    integration: ReturnType<typeof useSection86FormIntegration>;
  } | null>(null);
  
  const SectionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [sectionData, setSectionData] = React.useState<T>(defaultData);
    
    const integration = useSection86FormIntegration(
      sectionId,
      sectionName,
      sectionData,
      setSectionData
    );
    
    const contextValue = {
      sectionData,
      setSectionData,
      integration
    };
    
    return (
      <SectionContext.Provider value={contextValue}>
        {children}
      </SectionContext.Provider>
    );
  };
  
  const useSection = () => {
    const context = React.useContext(SectionContext);
    if (!context) {
      throw new Error(`useSection must be used within a ${sectionName}Provider`);
    }
    return context;
  };
  
  return {
    SectionContext,
    SectionProvider,
    useSection
  };
}

// ============================================================================
// VALIDATION INTEGRATION UTILITIES
// ============================================================================

/**
 * Hook for integrating section validation with global form validation
 */
export function useSectionValidationIntegration(
  sectionId: SectionId,
  validateSection: () => ValidationResult
) {
  const sf86Form = useSF86Form();
  
  /**
   * Validate section and update global form state
   */
  const validateAndSync = useCallback(() => {
    const result = validateSection();
    
    // Update global form validation state if needed
    if (!result.isValid) {
      // The central form will pick up validation errors through the section context
    }
    
    return result;
  }, [validateSection]);
  
  /**
   * Listen for global validation requests
   */
  useEffect(() => {
    const unsubscribe = sf86Form.registeredSections.find(r => r.sectionId === sectionId)?.context.validateSection;
    // The section context will be called automatically by the central form
    return () => {};
  }, [sectionId, sf86Form]);
  
  return {
    validateAndSync
  };
}

// ============================================================================
// CHANGE TRACKING INTEGRATION
// ============================================================================

/**
 * Hook for integrating section change tracking with global form change tracking
 */
export function useSectionChangeTracking<T>(
  sectionId: SectionId,
  sectionData: T,
  initialData: T
) {
  const sf86Form = useSF86Form();
  
  /**
   * Check if section has changes
   */
  const isDirty = React.useMemo(() => {
    return !isEqual(sectionData, initialData);
  }, [sectionData, initialData]);
  
  /**
   * Get section changes
   */
  const getChanges = useCallback((): ChangeSet => {
    const changes: ChangeSet = {};
    
    // Simple change detection (can be enhanced)
    if (!isEqual(sectionData, initialData)) {
      changes[sectionId] = {
        oldValue: initialData,
        newValue: sectionData,
        timestamp: new Date()
      };
    }
    
    return changes;
  }, [sectionData, initialData, sectionId]);
  
  /**
   * Reset section to initial state
   */
  const resetToInitial = useCallback(() => {
    sf86Form.updateSectionData(sectionId, cloneDeep(initialData));
  }, [sf86Form, sectionId, initialData]);
  
  return {
    isDirty,
    getChanges,
    resetToInitial
  };
}

