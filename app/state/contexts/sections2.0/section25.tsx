/**
 * Section 25: Investigation and Clearance Record Context (Simplified)
 *
 * This context manages Section 25 of the SF-86 form, which covers background investigations
 * and security clearance eligibility records. This is a simplified version focusing on core functionality.
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
  Section25,
  Section25SubsectionKey,
  BackgroundInvestigationEntry,
  ClearanceDenialEntry,
  ClearanceRevocationEntry,
} from "../../../../api/interfaces/sections2.0/section25";
import {
  createDefaultBackgroundInvestigationEntry,
  createDefaultClearanceDenialEntry,
  createDefaultClearanceRevocationEntry,
  createDefaultSection25,
} from "../../../../api/interfaces/sections2.0/section25";

// ============================================================================
// CONTEXT INTERFACE
// ============================================================================

interface Section25ContextType {
  // Core state
  sectionData: Section25;
  isLoading: boolean;
  
  // Core methods
  updateSubsectionFlag: (
    subsectionKey: Section25SubsectionKey,
    hasValue: "YES" | "NO"
  ) => void;
  
  // Entry management
  addBackgroundInvestigationEntry: () => void;
  addClearanceDenialEntry: () => void;
  addClearanceRevocationEntry: () => void;
  removeEntry: (subsectionKey: string, index: number) => void;
  
  // Field updates
  updateEntryField: (
    subsectionKey: Section25SubsectionKey,
    entryIndex: number,
    fieldPath: string,
    newValue: any
  ) => void;
  
  // Utility functions
  getEntryCount: (subsectionKey: string) => number;
  
  // Section-specific queries
  hasAnyInvestigations: () => boolean;
  hasAnyDenials: () => boolean;
  hasAnyRevocations: () => boolean;
  getCurrentInvestigationStatus: () => {
    hasActiveInvestigations: boolean;
    hasPendingClearances: boolean;
    hasCurrentIssues: boolean;
    totalRecords: number;
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

const Section25Context = createContext<Section25ContextType | null>(null);

/**
 * Section 25 Provider Component
 */
export const Section25Provider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  // State management
  const [sectionData, setSectionData] = useState<Section25>(() => 
    createDefaultSection25()
  );
  const [isLoading] = useState(false);

  // ============================================================================
  // FIELD UPDATE METHODS
  // ============================================================================

  /**
   * Update subsection flag (YES/NO radio buttons)
   */
  const updateSubsectionFlag = useCallback((
    subsectionKey: Section25SubsectionKey,
    hasValue: "YES" | "NO"
  ) => {
    setSectionData((prevData) => {
      const newData = cloneDeep(prevData);
      
      // Update the main flag based on subsection
      switch (subsectionKey) {
        case 'backgroundInvestigations':
          newData.section25.backgroundInvestigations.hasBackgroundInvestigations.value = hasValue;
          break;
        case 'clearanceDenials':
          newData.section25.clearanceDenials.hasClearanceDenials.value = hasValue;
          break;
        case 'clearanceRevocations':
          newData.section25.clearanceRevocations.hasClearanceRevocations.value = hasValue;
          break;
      }
      
      return newData;
    });
  }, []);

  /**
   * Update entry field
   */
  const updateEntryField = useCallback((
    subsectionKey: Section25SubsectionKey,
    entryIndex: number,
    fieldPath: string,
    newValue: any
  ) => {
    setSectionData((prevData) => {
      const newData = cloneDeep(prevData);
      const fullPath = `section25.${subsectionKey}.entries.${entryIndex}.${fieldPath}`;
      set(newData, fullPath, newValue);
      return newData;
    });
  }, []);

  // ============================================================================
  // ENTRY MANAGEMENT METHODS
  // ============================================================================

  /**
   * Add background investigation entry
   */
  const addBackgroundInvestigationEntry = useCallback(() => {
    setSectionData((prevData) => {
      const newData = cloneDeep(prevData);
      const newEntry = createDefaultBackgroundInvestigationEntry();
      
      newData.section25.backgroundInvestigations.entries.push(newEntry);
      newData.section25.backgroundInvestigations.entriesCount = newData.section25.backgroundInvestigations.entries.length;
      
      // Auto-update the main flag to YES when adding an entry
      newData.section25.backgroundInvestigations.hasBackgroundInvestigations.value = "YES";
      
      return newData;
    });
  }, []);

  /**
   * Add clearance denial entry
   */
  const addClearanceDenialEntry = useCallback(() => {
    setSectionData((prevData) => {
      const newData = cloneDeep(prevData);
      const newEntry = createDefaultClearanceDenialEntry();
      
      newData.section25.clearanceDenials.entries.push(newEntry);
      newData.section25.clearanceDenials.entriesCount = newData.section25.clearanceDenials.entries.length;
      
      // Auto-update the main flag to YES when adding an entry
      newData.section25.clearanceDenials.hasClearanceDenials.value = "YES";
      
      return newData;
    });
  }, []);

  /**
   * Add clearance revocation entry
   */
  const addClearanceRevocationEntry = useCallback(() => {
    setSectionData((prevData) => {
      const newData = cloneDeep(prevData);
      const newEntry = createDefaultClearanceRevocationEntry();
      
      newData.section25.clearanceRevocations.entries.push(newEntry);
      newData.section25.clearanceRevocations.entriesCount = newData.section25.clearanceRevocations.entries.length;
      
      // Auto-update the main flag to YES when adding an entry
      newData.section25.clearanceRevocations.hasClearanceRevocations.value = "YES";
      
      return newData;
    });
  }, []);

  /**
   * Remove entry from subsection
   */
  const removeEntry = useCallback((subsectionKey: string, index: number) => {
    setSectionData((prevData) => {
      const newData = cloneDeep(prevData);
      
      switch (subsectionKey) {
        case 'backgroundInvestigations':
          newData.section25.backgroundInvestigations.entries.splice(index, 1);
          newData.section25.backgroundInvestigations.entriesCount = newData.section25.backgroundInvestigations.entries.length;
          
          // Auto-update flag if no entries remain
          if (newData.section25.backgroundInvestigations.entries.length === 0) {
            newData.section25.backgroundInvestigations.hasBackgroundInvestigations.value = "NO";
          }
          break;
          
        case 'clearanceDenials':
          newData.section25.clearanceDenials.entries.splice(index, 1);
          newData.section25.clearanceDenials.entriesCount = newData.section25.clearanceDenials.entries.length;
          
          if (newData.section25.clearanceDenials.entries.length === 0) {
            newData.section25.clearanceDenials.hasClearanceDenials.value = "NO";
          }
          break;
          
        case 'clearanceRevocations':
          newData.section25.clearanceRevocations.entries.splice(index, 1);
          newData.section25.clearanceRevocations.entriesCount = newData.section25.clearanceRevocations.entries.length;
          
          if (newData.section25.clearanceRevocations.entries.length === 0) {
            newData.section25.clearanceRevocations.hasClearanceRevocations.value = "NO";
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
   * Get entry count for subsection
   */
  const getEntryCount = useCallback((subsectionKey: string): number => {
    switch (subsectionKey) {
      case 'backgroundInvestigations':
        return sectionData.section25.backgroundInvestigations.entriesCount;
      case 'clearanceDenials':
        return sectionData.section25.clearanceDenials.entriesCount;
      case 'clearanceRevocations':
        return sectionData.section25.clearanceRevocations.entriesCount;
      default:
        return 0;
    }
  }, [sectionData]);

  // ============================================================================
  // SECTION-SPECIFIC QUERIES
  // ============================================================================

  /**
   * Check if section has any investigations
   */
  const hasAnyInvestigations = useCallback((): boolean => {
    return sectionData.section25.backgroundInvestigations.hasBackgroundInvestigations.value === "YES";
  }, [sectionData]);

  /**
   * Check if section has any denials
   */
  const hasAnyDenials = useCallback((): boolean => {
    return sectionData.section25.clearanceDenials.hasClearanceDenials.value === "YES";
  }, [sectionData]);

  /**
   * Check if section has any revocations
   */
  const hasAnyRevocations = useCallback((): boolean => {
    return sectionData.section25.clearanceRevocations.hasClearanceRevocations.value === "YES";
  }, [sectionData]);

  /**
   * Get current investigation status
   */
  const getCurrentInvestigationStatus = useCallback(() => {
    return {
      hasActiveInvestigations: hasAnyInvestigations(),
      hasPendingClearances: hasAnyInvestigations() && sectionData.section25.backgroundInvestigations.entries.some(
        entry => entry.currentStatus.value === "PENDING"
      ),
      hasCurrentIssues: hasAnyDenials() || hasAnyRevocations(),
      totalRecords: (
        sectionData.section25.backgroundInvestigations.entriesCount +
        sectionData.section25.clearanceDenials.entriesCount +
        sectionData.section25.clearanceRevocations.entriesCount
      ),
    };
  }, [sectionData, hasAnyInvestigations, hasAnyDenials, hasAnyRevocations]);

  // ============================================================================
  // VALIDATION METHODS
  // ============================================================================

  /**
   * Validate section data
   */
  const validateSection = useCallback(() => {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Validate background investigations
    if (sectionData.section25.backgroundInvestigations.hasBackgroundInvestigations.value === "YES") {
      if (sectionData.section25.backgroundInvestigations.entries.length === 0) {
        errors.push("At least one background investigation entry is required when answering YES");
      }
      
      sectionData.section25.backgroundInvestigations.entries.forEach((entry, index) => {
        if (!entry.investigatingAgency.agencyName.value && entry.investigatingAgency.type.value === "US_GOVERNMENT") {
          errors.push(`Investigation ${index + 1}: Agency name is required`);
        }
        
        if (!entry.investigationCompletedDate.date.value && !entry.investigationCompletedDate.dontKnow.value) {
          errors.push(`Investigation ${index + 1}: Investigation completion date is required`);
        }
      });
    }

    // Validate clearance denials
    if (sectionData.section25.clearanceDenials.hasClearanceDenials.value === "YES") {
      if (sectionData.section25.clearanceDenials.entries.length === 0) {
        errors.push("At least one clearance denial entry is required when answering YES");
      }
      
      sectionData.section25.clearanceDenials.entries.forEach((entry, index) => {
        if (!entry.denyingAgency.value) {
          errors.push(`Denial ${index + 1}: Denying agency is required`);
        }
        
        if (!entry.reasonForDenial.value) {
          errors.push(`Denial ${index + 1}: Reason for denial is required`);
        }
      });
    }

    // Validate clearance revocations
    if (sectionData.section25.clearanceRevocations.hasClearanceRevocations.value === "YES") {
      if (sectionData.section25.clearanceRevocations.entries.length === 0) {
        errors.push("At least one clearance revocation entry is required when answering YES");
      }
      
      sectionData.section25.clearanceRevocations.entries.forEach((entry, index) => {
        if (!entry.revokingAgency.value) {
          errors.push(`Revocation ${index + 1}: Revoking agency is required`);
        }
        
        if (!entry.reasonForRevocation.value) {
          errors.push(`Revocation ${index + 1}: Reason for revocation is required`);
        }
      });
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }, [sectionData]);

  // ============================================================================
  // CONTEXT VALUE
  // ============================================================================

  const contextValue: Section25ContextType = {
    // Core state
    sectionData,
    isLoading,
    
    // Core methods
    updateSubsectionFlag,
    
    // Entry management
    addBackgroundInvestigationEntry,
    addClearanceDenialEntry,
    addClearanceRevocationEntry,
    removeEntry,
    
    // Field updates
    updateEntryField,
    
    // Utility functions
    getEntryCount,
    
    // Section-specific queries
    hasAnyInvestigations,
    hasAnyDenials,
    hasAnyRevocations,
    getCurrentInvestigationStatus,
    
    // Validation
    validateSection,
  };

  return (
    <Section25Context.Provider value={contextValue}>
      {children}
    </Section25Context.Provider>
  );
};

// ============================================================================
// HOOK
// ============================================================================

/**
 * Hook to use Section 25 context
 */
export const useSection25 = (): Section25ContextType => {
  const context = useContext(Section25Context);
  if (!context) {
    throw new Error("useSection25 must be used within a Section25Provider");
  }
  return context;
}; 