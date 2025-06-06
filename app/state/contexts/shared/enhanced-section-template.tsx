/**
 * Enhanced Section Template Factory (Gold Standard)
 *
 * Based on Section 2's optimal patterns, this template provides a standardized
 * approach for creating all SF-86 section contexts with DRY principles and
 * createDefaultSection compatibility.
 */

import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import cloneDeep from 'lodash/cloneDeep';
import set from 'lodash/set';
import { useSection86FormIntegration } from './section-context-integration';
import {
  SectionLogger,
  PerformanceMonitor,
  SectionContextUtils,
  FieldValidationUtils,
  type StandardSectionContextType
} from './section-optimization-utils';
import type { ValidationResult, ChangeSet, SectionId } from './base-interfaces';

// ============================================================================
// ENHANCED SECTION TEMPLATE CONFIGURATION
// ============================================================================

export interface EnhancedSectionConfig<T> {
  sectionId: string;
  sectionName: string;
  expectedFieldCount: number;
  createInitialState: () => T;
  validateSection: (data: T) => ValidationResult;
  updateField?: (data: T, fieldPath: string, newValue: any) => T;
  customActions?: Record<string, (data: T, ...args: any[]) => T>;
  flattenFields?: (data: T) => Record<string, any>;
}

// ============================================================================
// ENHANCED SECTION CONTEXT TYPE
// ============================================================================

export interface EnhancedSectionContextType<T> extends StandardSectionContextType<T> {
  // Performance monitoring
  performanceMetrics: {
    lastOperationDuration: number;
    averageOperationTime: number;
  };

  // Field operations
  updateField: (fieldPath: string, newValue: any) => void;

  // Custom actions (section-specific)
  customActions: Record<string, (...args: any[]) => void>;
}

// ============================================================================
// ENHANCED SECTION TEMPLATE FACTORY
// ============================================================================

/**
 * Creates an optimized section context following Section 2's gold standard patterns
 */
export function createEnhancedSectionContext<T>(config: EnhancedSectionConfig<T>) {
  // Create React context
  const SectionContext = createContext<EnhancedSectionContextType<T> | undefined>(undefined);

  // Create provider component
  const SectionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    // ============================================================================
    // CORE STATE MANAGEMENT (Section 2 Pattern)
    // ============================================================================

    const [sectionData, setSectionData] = useState<T>(config.createInitialState());
    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [initialData] = useState<T>(config.createInitialState());

    // Generate unique context ID for performance-optimized logging
    const contextId = useMemo(() => SectionContextUtils.generateContextId(), []);

    // Performance metrics tracking
    const [performanceMetrics, setPerformanceMetrics] = useState({
      lastOperationDuration: 0,
      averageOperationTime: 0
    });

    // ============================================================================
    // COMPUTED VALUES (Section 2 Pattern)
    // ============================================================================

    const isDirty = SectionContextUtils.createIsDirtyComputation(sectionData, initialData);

    // ============================================================================
    // FIELD OPERATIONS (Standardized)
    // ============================================================================

    const updateField = useCallback((fieldPath: string, newValue: any) => {
      const operationId = `updateField-${fieldPath}`;

      PerformanceMonitor.measure(config.sectionId, contextId, operationId, () => {
        setSectionData(prevData => {
          if (config.updateField) {
            return config.updateField(prevData, fieldPath, newValue);
          } else {
            // Default field update logic using lodash set for consistency
            const newData = cloneDeep(prevData);
            set(newData as any, fieldPath, newValue);
            return newData;
          }
        });

        SectionLogger.fieldChange(config.sectionId, contextId, fieldPath, '', newValue);
      });
    }, [config, contextId]);

    // ============================================================================
    // VALIDATION FUNCTIONS (Section 2 Pattern)
    // ============================================================================

    const validateSection = useCallback((): ValidationResult => {
      return PerformanceMonitor.measure(config.sectionId, contextId, 'validateSection', () => {
        const validationResult = config.validateSection(sectionData);

        // Update local errors
        const newErrors = SectionContextUtils.createErrorState(validationResult);
        setErrors(newErrors);

        // Validate field count
        FieldValidationUtils.validateFieldCount(config.sectionId,
          Object.keys(sectionData || {}).length, config.expectedFieldCount);

        return validationResult;
      });
    }, [sectionData, config, contextId]);

    // ============================================================================
    // UTILITY FUNCTIONS (Section 2 Pattern)
    // ============================================================================

    const resetSection = useCallback(() => {
      PerformanceMonitor.measure(config.sectionId, contextId, 'resetSection', () => {
        const newData = config.createInitialState();
        setSectionData(newData);
        setErrors({});
        SectionLogger.info(config.sectionId, contextId, 'Section reset');
      });
    }, [config, contextId]);

    const loadSection = useCallback((data: T) => {
      PerformanceMonitor.measure(config.sectionId, contextId, 'loadSection', () => {
        setSectionData(cloneDeep(data));
        setErrors({});
        SectionLogger.info(config.sectionId, contextId, 'Section data loaded');
      });
    }, [config.sectionId, contextId]);

    const getChanges = useCallback((): ChangeSet => {
      const changes: ChangeSet = {};

      // Only include changes if section is dirty
      if (isDirty) {
        changes[config.sectionId] = {
          oldValue: initialData,
          newValue: sectionData,
          timestamp: new Date()
        };
      }

      return changes;
    }, [sectionData, isDirty, initialData, config.sectionId]);



    // ============================================================================
    // CUSTOM ACTIONS (Section-Specific)
    // ============================================================================

    const customActions = useMemo(() => {
      const actions: Record<string, (...args: any[]) => void> = {};

      if (config.customActions) {
        Object.entries(config.customActions).forEach(([actionName, actionFn]) => {
          actions[actionName] = (...args: any[]) => {
            console.log(`🔧 Enhanced Template: Executing custom action ${actionName} for ${config.sectionId}`, args);

            // Special debugging for Section 2
            if (config.sectionId === 'section2') {
              console.log(`🔍 Section2 Enhanced Template: Custom action ${actionName} called with args:`, args);
            }

            PerformanceMonitor.measure(config.sectionId, contextId, actionName, () => {
              setSectionData(prevData => {
                console.log(`📊 Enhanced Template: Before ${actionName}:`, prevData);

                // Special debugging for Section 2
                if (config.sectionId === 'section2') {
                  const section2Data = prevData as any;
                  console.log(`🔍 Section2 Enhanced Template: Before ${actionName} - date value:`, section2Data.section2?.date?.value);
                  console.log(`🔍 Section2 Enhanced Template: Before ${actionName} - estimated value:`, section2Data.section2?.isEstimated?.value);
                }

                const newData = actionFn(prevData, ...args);
                console.log(`📊 Enhanced Template: After ${actionName}:`, newData);

                // Special debugging for Section 2
                if (config.sectionId === 'section2') {
                  const section2NewData = newData as any;
                  console.log(`🔍 Section2 Enhanced Template: After ${actionName} - date value:`, section2NewData.section2?.date?.value);
                  console.log(`🔍 Section2 Enhanced Template: After ${actionName} - estimated value:`, section2NewData.section2?.isEstimated?.value);
                }

                return newData;
              });
              SectionLogger.info(config.sectionId, contextId, `Custom action: ${actionName}`);
            });
          };
        });
      }

      // console.log(`🔧 Enhanced Template: Created custom actions for ${config.sectionId}:`, Object.keys(actions));
      return actions;
    }, [config, contextId]);

    // ============================================================================
    // SF86FORM INTEGRATION (Section 2 Pattern)
    // ============================================================================

    // Create updateFieldValue function for integration
    const updateFieldValue = useCallback((path: string, value: any) => {
      console.log(`🔧 Enhanced Template: updateFieldValue called for ${config.sectionId}`, { path, value });
      setSectionData(prevData => {
        const newData = StandardFieldOperations.updateFieldValue(prevData, path, value);
        console.log(`📊 Enhanced Template: Field update result:`, { path, value, newData });
        return newData;
      });
    }, [config.sectionId]);

    const integration = useSection86FormIntegration(
      config.sectionId as SectionId,
      config.sectionName,
      sectionData,
      setSectionData,
      validateSection,
      getChanges,
      updateFieldValue // Pass proper updateFieldValue function instead of flattenFields
    );

    // Ensure section is properly registered with SF86FormContext
    // This is critical for collectAllSectionData() to find this section
    // console.log(`🔧 Enhanced Template: Section ${config.sectionId} integration initialized`);
    // console.log(`📊 Enhanced Template: Section data available:`, !!sectionData);
    // console.log(`📊 Enhanced Template: Integration object:`, !!integration);

    // ============================================================================
    // CONTEXT VALUE (createDefaultSection Compatible)
    // ============================================================================

    const contextValue: EnhancedSectionContextType<T> = {
      // Standard interface (createDefaultSection compatible)
      sectionData,
      isLoading,
      errors,
      isDirty,
      validateSection,
      resetSection,
      loadSection,
      getChanges,

      // Enhanced features
      performanceMetrics,
      updateField,
      customActions
    };

    return (
      <SectionContext.Provider value={contextValue}>
        {children}
      </SectionContext.Provider>
    );
  };

  // Create hook
  const useSection = (): EnhancedSectionContextType<T> => {
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
// FIELD UPDATE UTILITIES (Standardized)
// ============================================================================

/**
 * Common field update patterns for different field types
 */
export class StandardFieldOperations {
  /**
   * Update a simple field value using lodash set for consistency with working sections
   */
  static updateSimpleField<T>(data: T, fieldPath: string, newValue: any): T {
    const newData = cloneDeep(data);
    set(newData as any, fieldPath, newValue);
    return newData;
  }

  /**
   * Update a field's value property (for Field<T> structures)
   */
  static updateFieldValue<T>(data: T, fieldPath: string, newValue: any): T {
    return this.updateSimpleField(data, `${fieldPath}.value`, newValue);
  }

  /**
   * Add an entry to an array field
   */
  static addArrayEntry<T>(data: T, arrayPath: string, newEntry: any): T {
    const newData = cloneDeep(data);
    const pathParts = arrayPath.split('.');
    let current = newData as any;

    for (const part of pathParts) {
      if (!current[part]) {
        current[part] = [];
      }
      current = current[part];
    }

    if (Array.isArray(current)) {
      current.push(newEntry);
    }

    return newData;
  }

  /**
   * Remove an entry from an array field
   */
  static removeArrayEntry<T>(data: T, arrayPath: string, index: number): T {
    const newData = cloneDeep(data);
    const pathParts = arrayPath.split('.');
    let current = newData as any;

    for (const part of pathParts) {
      current = current[part];
    }

    if (Array.isArray(current) && index >= 0 && index < current.length) {
      current.splice(index, 1);
    }

    return newData;
  }
}
