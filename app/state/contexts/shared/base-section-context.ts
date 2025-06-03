/**
 * Enhanced Base Section Context Template (Gold Standard)
 *
 * Standardized template for all SF-86 section contexts based on Section 2's optimal patterns.
 * Ensures DRY implementation, consistent patterns, and createDefaultSection compatibility.
 *
 * Features:
 * - Performance-optimized logging with SectionLogger
 * - Standardized state management patterns
 * - createDefaultSection compatibility
 * - Field validation against sections-references JSON
 * - Consistent integration with SF86FormContext
 * - Memory-efficient operations
 */

import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import cloneDeep from 'lodash.clonedeep';
import set from 'lodash.set';

import { useSection86FormIntegration } from './section-context-integration';
import {
  SectionLogger,
  PerformanceMonitor,
  SectionContextUtils,
  FieldValidationUtils,
  DefensiveCheckUtils,
  type StandardSectionContextType,
  type DefensiveCheckConfig
} from './section-optimization-utils';
import type { ValidationResult, ChangeSet, SectionId } from './base-interfaces';

// ============================================================================
// BASE SECTION CONTEXT CONFIGURATION
// ============================================================================

export interface BaseSectionConfig<T> {
  sectionId: string;
  sectionName: string;
  expectedFieldCount: number;
  createInitialState: () => T;
  validateSection: (data: T) => ValidationResult;
  fieldsToCheck: string[];
  customFieldChecker?: (currentData: T, newData: T) => boolean;
}

// ============================================================================
// BASE SECTION CONTEXT HOOK
// ============================================================================

/**
 * Base hook for creating standardized section contexts
 * Eliminates code duplication and ensures consistent patterns
 */
export function useBaseSectionContext<T>(config: BaseSectionConfig<T>) {
  // ============================================================================
  // CORE STATE MANAGEMENT
  // ============================================================================

  const [sectionData, setSectionData] = useState<T>(config.createInitialState());
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [initialData] = useState<T>(config.createInitialState());

  // Generate unique context ID
  const contextId = useMemo(() => SectionContextUtils.generateContextId(), []);

  // ============================================================================
  // COMPUTED VALUES
  // ============================================================================

  const isDirty = SectionContextUtils.createIsDirtyComputation(sectionData, initialData);

  // ============================================================================
  // VALIDATION FUNCTIONS
  // ============================================================================

  const validateSection = useCallback((): ValidationResult => {
    const validationResult = config.validateSection(sectionData);

    // Update local errors
    const newErrors = SectionContextUtils.createErrorState(validationResult);
    setErrors(newErrors);

    return validationResult;
  }, [sectionData, config]);

  // ============================================================================
  // UTILITY FUNCTIONS
  // ============================================================================

  const resetSection = useCallback(() => {
    const newData = config.createInitialState();
    setSectionData(newData);
    setErrors({});
    SectionLogger.info(config.sectionId, contextId, 'Section reset');
  }, [config, contextId]);

  const loadSection = useCallback((data: T) => {
    setSectionData(cloneDeep(data));
    setErrors({});
    SectionLogger.info(config.sectionId, contextId, 'Section data loaded');
  }, [config.sectionId, contextId]);

  const getChanges = useCallback((): any => {
    return isDirty ? { [config.sectionId]: sectionData } : {};
  }, [sectionData, isDirty, config.sectionId]);

  // ============================================================================
  // SF86FORM INTEGRATION WITH OPTIMIZED DEFENSIVE CHECK
  // ============================================================================

  // Create defensive check configuration
  const defensiveCheckConfig: DefensiveCheckConfig = {
    sectionId: config.sectionId,
    contextId,
    fieldsToCheck: config.fieldsToCheck,
    customFieldChecker: config.customFieldChecker
  };

  // Integration with main form context using optimized defensive check logic
  const integration = useSection86FormIntegration<T>(
    config.sectionId as SectionId,
    config.sectionName,
    sectionData,
    setSectionData,
    validateSection,
    getChanges
  );

  // ============================================================================
  // RETURN STANDARDIZED CONTEXT
  // ============================================================================

  return {
    // State
    sectionData,
    setSectionData,
    isLoading,
    setIsLoading,
    errors,
    setErrors,
    isDirty,
    contextId,

    // Functions
    validateSection,
    resetSection,
    loadSection,
    getChanges,

    // Integration
    integration,

    // Utilities
    logger: {
      info: (message: string, data?: any) => SectionLogger.info(config.sectionId, contextId, message, data),
      warn: (message: string, data?: any) => SectionLogger.warn(config.sectionId, contextId, message, data),
      error: (message: string, data?: any) => SectionLogger.error(config.sectionId, contextId, message, data),
      success: (message: string, data?: any) => SectionLogger.success(config.sectionId, contextId, message, data),
    }
  };
}

// ============================================================================
// SECTION CONTEXT FACTORY
// ============================================================================

/**
 * Section context type interface for standardized contexts
 */
export interface SectionContextType<T> extends StandardSectionContextType<T> {
  // Add any section-specific methods here
}

/**
 * Factory function to create standardized section contexts
 * Ensures all sections follow the same pattern and are createDefaultSection compatible
 */
export function createSectionContext<T>(config: BaseSectionConfig<T>) {
  // Create React context
  const SectionContext = createContext<SectionContextType<T> | undefined>(undefined);

  // Create provider component
  const SectionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const baseContext = useBaseSectionContext(config);

    // Create context value with standardized interface
    const contextValue: SectionContextType<T> = {
      // State
      sectionData: baseContext.sectionData,
      isLoading: baseContext.isLoading,
      errors: baseContext.errors,
      isDirty: baseContext.isDirty,

      // Validation
      validateSection: baseContext.validateSection,

      // Utility
      resetSection: baseContext.resetSection,
      loadSection: baseContext.loadSection,
      getChanges: baseContext.getChanges
    };

    return React.createElement(
      SectionContext.Provider,
      { value: contextValue },
      children
    );
  };

  // Create hook
  const useSection = (): SectionContextType<T> => {
    const context = useContext(SectionContext);
    if (!context) {
      throw new Error(`useSection must be used within a ${config.sectionName}Provider`);
    }
    return context;
  };

  return {
    SectionContext,
    SectionProvider,
    useSection,
    config
  };
}

// ============================================================================
// FIELD UPDATE UTILITIES
// ============================================================================

/**
 * Standardized field update utilities for consistent patterns
 */
export class FieldUpdateUtils {
  /**
   * Create a field update function with consistent pattern
   */
  static createFieldUpdater<T>(
    setSectionData: React.Dispatch<React.SetStateAction<T>>,
    logger: any
  ) {
    return (fieldPath: string, newValue: any) => {
      setSectionData(prevData => {
        const newData = cloneDeep(prevData);

        // Use lodash.set for nested field updates
        set(newData as any, fieldPath, newValue);

        logger.info(`Field updated: ${fieldPath}`, { newValue });
        return newData;
      });
    };
  }

  /**
   * Create a field value updater for Field<T> structures
   */
  static createFieldValueUpdater<T>(
    setSectionData: React.Dispatch<React.SetStateAction<T>>,
    logger: any
  ) {
    return (fieldPath: string, newValue: any) => {
      setSectionData(prevData => {
        const newData = cloneDeep(prevData);

        // Update the .value property of the field
        set(newData as any, `${fieldPath}.value`, newValue);

        logger.info(`Field value updated: ${fieldPath}`, { newValue });
        return newData;
      });
    };
  }
}

