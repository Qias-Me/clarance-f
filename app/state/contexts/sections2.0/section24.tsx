/**
 * Section 24: Use of Alcohol Context (Simplified)
 *
 * This context manages Section 24 of the SF-86 form, which covers alcohol use and its
 * negative impacts. This is a simplified version focusing on core functionality.
 */

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import cloneDeep from "lodash/cloneDeep";
import set from "lodash/set";
import type {
  Section24,
  Section24SubsectionKey,
  AlcoholImpactEntry,
  AlcoholTreatmentEntry,
  AlcoholConsumptionEntry,
} from "../../../../api/interfaces/sections2.0/section24";
import {
  createDefaultAlcoholImpactEntry,
  createDefaultAlcoholTreatmentEntry,
  createDefaultAlcoholConsumptionEntry,
  createDefaultSection24,
} from "../../../../api/interfaces/sections2.0/section24";

// ============================================================================
// CONTEXT INTERFACE
// ============================================================================

interface Section24ContextType {
  // Core state
  sectionData: Section24;
  isLoading: boolean;
  
  // Core methods
  updateSubsectionFlag: (
    subsectionKey: Section24SubsectionKey,
    hasValue: "YES" | "NO"
  ) => void;
  
  // Entry management
  addAlcoholImpactEntry: () => void;
  addAlcoholTreatmentEntry: () => void;
  addAlcoholConsumptionEntry: () => void;
  removeEntry: (subsectionKey: string, index: number) => void;
  
  // Field updates
  updateEntryField: (
    subsectionKey: Section24SubsectionKey,
    entryIndex: number,
    fieldPath: string,
    newValue: any
  ) => void;
  
  // Utility functions
  getEntryCount: (subsectionKey: string) => number;
  
  // Section-specific queries
  hasAnyAlcoholImpacts: () => boolean;
  hasAnyAlcoholTreatment: () => boolean;
  hasCurrentAlcoholConcerns: () => boolean;
  getCurrentAlcoholStatus: () => {
    hasCurrentImpacts: boolean;
    hasCurrentTreatment: boolean;
    requiresMonitoring: boolean;
  };
  
  // Validation
  validateSection: () => {
    isValid: boolean;
    errors: string[];
    warnings: string[];
  };
}

// ============================================================================
// CONTEXT IMPLEMENTATION
// ============================================================================

const Section24Context = createContext<Section24ContextType | null>(null);

/**
 * Section 24 Provider Component
 */
export const Section24Provider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  // State management
  const [sectionData, setSectionData] = useState<Section24>(() => 
    createDefaultSection24()
  );
  const [isLoading] = useState(false);

  // ============================================================================
  // FIELD UPDATE METHODS
  // ============================================================================

  /**
   * Update subsection flag (YES/NO radio buttons)
   */
  const updateSubsectionFlag = useCallback((
    subsectionKey: Section24SubsectionKey,
    hasValue: "YES" | "NO"
  ) => {
    setSectionData((prevData) => {
      const newData = cloneDeep(prevData);
      
      // Update the main flag based on subsection
      switch (subsectionKey) {
        case 'alcoholImpacts':
          newData.section24.alcoholImpacts.hasAlcoholNegativeImpacts.value = hasValue;
          break;
        case 'alcoholTreatment':
          newData.section24.alcoholTreatment.hasReceivedAlcoholTreatment.value = hasValue;
          break;
        case 'alcoholConsumption':
          newData.section24.alcoholConsumption.currentlyConsumesAlcohol.value = hasValue;
          break;
      }
      
      return newData;
    });
  }, []);

  /**
   * Update entry field
   */
  const updateEntryField = useCallback((
    subsectionKey: Section24SubsectionKey,
    entryIndex: number,
    fieldPath: string,
    newValue: any
  ) => {
    setSectionData((prevData) => {
      const newData = cloneDeep(prevData);
      const fullPath = `section24.${subsectionKey}.entries.${entryIndex}.${fieldPath}`;
      set(newData, fullPath, newValue);
      return newData;
    });
  }, []);

  // ============================================================================
  // ENTRY MANAGEMENT METHODS
  // ============================================================================

  /**
   * Add alcohol impact entry
   */
  const addAlcoholImpactEntry = useCallback(() => {
    setSectionData((prevData) => {
      const newData = cloneDeep(prevData);
      const newEntry = createDefaultAlcoholImpactEntry();
      
      newData.section24.alcoholImpacts.entries.push(newEntry);
      newData.section24.alcoholImpacts.entriesCount = newData.section24.alcoholImpacts.entries.length;
      
      // Auto-update the main flag to YES when adding an entry
      newData.section24.alcoholImpacts.hasAlcoholNegativeImpacts.value = "YES";
      
      return newData;
    });
  }, []);

  /**
   * Add alcohol treatment entry
   */
  const addAlcoholTreatmentEntry = useCallback(() => {
    setSectionData((prevData) => {
      const newData = cloneDeep(prevData);
      const newEntry = createDefaultAlcoholTreatmentEntry();
      
      newData.section24.alcoholTreatment.entries.push(newEntry);
      newData.section24.alcoholTreatment.entriesCount = newData.section24.alcoholTreatment.entries.length;
      
      // Auto-update the main flag to YES when adding an entry
      newData.section24.alcoholTreatment.hasReceivedAlcoholTreatment.value = "YES";
      
      return newData;
    });
  }, []);

  /**
   * Add alcohol consumption entry
   */
  const addAlcoholConsumptionEntry = useCallback(() => {
    setSectionData((prevData) => {
      const newData = cloneDeep(prevData);
      const newEntry = createDefaultAlcoholConsumptionEntry();
      
      newData.section24.alcoholConsumption.entries.push(newEntry);
      newData.section24.alcoholConsumption.entriesCount = newData.section24.alcoholConsumption.entries.length;
      
      // Auto-update the main flag to YES when adding an entry
      newData.section24.alcoholConsumption.currentlyConsumesAlcohol.value = "YES";
      
      return newData;
    });
  }, []);

  /**
   * Remove entry
   */
  const removeEntry = useCallback((subsectionKey: string, index: number) => {
    setSectionData((prevData) => {
      const newData = cloneDeep(prevData);
      
      switch (subsectionKey) {
        case 'alcoholImpacts':
          newData.section24.alcoholImpacts.entries.splice(index, 1);
          newData.section24.alcoholImpacts.entriesCount = newData.section24.alcoholImpacts.entries.length;
          
          // Update main flag if no entries remain
          if (newData.section24.alcoholImpacts.entries.length === 0) {
            newData.section24.alcoholImpacts.hasAlcoholNegativeImpacts.value = "NO";
          }
          break;
        case 'alcoholTreatment':
          newData.section24.alcoholTreatment.entries.splice(index, 1);
          newData.section24.alcoholTreatment.entriesCount = newData.section24.alcoholTreatment.entries.length;
          
          if (newData.section24.alcoholTreatment.entries.length === 0) {
            newData.section24.alcoholTreatment.hasReceivedAlcoholTreatment.value = "NO";
          }
          break;
        case 'alcoholConsumption':
          newData.section24.alcoholConsumption.entries.splice(index, 1);
          newData.section24.alcoholConsumption.entriesCount = newData.section24.alcoholConsumption.entries.length;
          
          if (newData.section24.alcoholConsumption.entries.length === 0) {
            newData.section24.alcoholConsumption.currentlyConsumesAlcohol.value = "NO";
          }
          break;
      }
      
      return newData;
    });
  }, []);

  // ============================================================================
  // UTILITY METHODS
  // ============================================================================

  /**
   * Get entry count for a subsection
   */
  const getEntryCount = useCallback((subsectionKey: string) => {
    switch (subsectionKey) {
      case 'alcoholImpacts':
        return sectionData.section24.alcoholImpacts.entries.length;
      case 'alcoholTreatment':
        return sectionData.section24.alcoholTreatment.entries.length;
      case 'alcoholConsumption':
        return sectionData.section24.alcoholConsumption.entries.length;
      default:
        return 0;
    }
  }, [sectionData]);

  // ============================================================================
  // SECTION-SPECIFIC QUERY METHODS
  // ============================================================================

  /**
   * Check if there are any alcohol impacts
   */
  const hasAnyAlcoholImpacts = useCallback(() => {
    return sectionData.section24.alcoholImpacts.hasAlcoholNegativeImpacts.value === 'YES' ||
           sectionData.section24.alcoholImpacts.entries.length > 0;
  }, [sectionData]);

  /**
   * Check if there is any alcohol treatment
   */
  const hasAnyAlcoholTreatment = useCallback(() => {
    return sectionData.section24.alcoholTreatment.hasReceivedAlcoholTreatment.value === 'YES' ||
           sectionData.section24.alcoholTreatment.entries.length > 0;
  }, [sectionData]);

  /**
   * Check if there are current alcohol concerns
   */
  const hasCurrentAlcoholConcerns = useCallback(() => {
    return sectionData.section24.alcoholImpacts.currentProblems.value === 'YES' ||
           sectionData.section24.alcoholTreatment.currentlyInTreatment.value === 'YES' ||
           sectionData.section24.alcoholConsumption.concernsAboutUse.value === 'YES';
  }, [sectionData]);

  /**
   * Get current alcohol status
   */
  const getCurrentAlcoholStatus = useCallback(() => {
    return {
      hasCurrentImpacts: sectionData.section24.alcoholImpacts.currentProblems.value === 'YES',
      hasCurrentTreatment: sectionData.section24.alcoholTreatment.currentlyInTreatment.value === 'YES',
      requiresMonitoring: hasCurrentAlcoholConcerns(),
    };
  }, [sectionData, hasCurrentAlcoholConcerns]);

  // ============================================================================
  // VALIDATION
  // ============================================================================

  /**
   * Validate entire section
   */
  const validateSection = useCallback(() => {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Validate consistency between flags and entries
    const hasImpactFlag = sectionData.section24.alcoholImpacts.hasAlcoholNegativeImpacts.value === 'YES';
    const hasImpactEntries = sectionData.section24.alcoholImpacts.entries.length > 0;
    
    if (hasImpactFlag && !hasImpactEntries) {
      errors.push('Indicated alcohol negative impacts but no entries provided');
    }
    
    if (!hasImpactFlag && hasImpactEntries) {
      warnings.push('Provided alcohol impact entries but indicated no negative impacts');
    }

    // Validate each impact entry
    sectionData.section24.alcoholImpacts.entries.forEach((entry, index) => {
      if (!entry.impactDescription.value.trim()) {
        errors.push(`Alcohol Impact Entry ${index + 1}: Impact description is required`);
      }
      if (!entry.circumstances.value.trim()) {
        errors.push(`Alcohol Impact Entry ${index + 1}: Circumstances are required`);
      }
    });

    // Validate treatment entries
    sectionData.section24.alcoholTreatment.entries.forEach((entry, index) => {
      if (!entry.treatmentDescription.value.trim()) {
        errors.push(`Treatment Entry ${index + 1}: Treatment description is required`);
      }
      if (!entry.providerName.value.trim()) {
        errors.push(`Treatment Entry ${index + 1}: Provider name is required`);
      }
    });

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }, [sectionData]);

  // ============================================================================
  // CONTEXT VALUE
  // ============================================================================

  const contextValue: Section24ContextType = {
    // Core state
    sectionData,
    isLoading,

    // Core methods
    updateSubsectionFlag,
    addAlcoholImpactEntry,
    addAlcoholTreatmentEntry,
    addAlcoholConsumptionEntry,
    removeEntry,
    updateEntryField,
    getEntryCount,

    // Section-specific queries
    hasAnyAlcoholImpacts,
    hasAnyAlcoholTreatment,
    hasCurrentAlcoholConcerns,
    getCurrentAlcoholStatus,

    // Validation
    validateSection,
  };

  return (
    <Section24Context.Provider value={contextValue}>
      {children}
    </Section24Context.Provider>
  );
};

// ============================================================================
// HOOK
// ============================================================================

/**
 * Hook to use Section 24 context
 */
export const useSection24 = (): Section24ContextType => {
  const context = useContext(Section24Context);
  if (!context) {
    throw new Error("useSection24 must be used within a Section24Provider");
  }
  return context;
}; 