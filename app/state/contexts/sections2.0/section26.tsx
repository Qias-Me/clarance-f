/**
 * Section 26: Financial Record Context
 *
 * This context manages Section 26 of the SF-86 form, which covers financial record
 * including bankruptcy, gambling problems, tax delinquencies, credit violations,
 * credit counseling, financial obligations, and various financial problems that may
 * affect an individual's ability to safeguard classified information.
 */

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from "react";
import cloneDeep from "lodash/cloneDeep";
import set from "lodash/set";
import type {
  Section26,
  Section26SubsectionKey,
  BankruptcyEntry,
  GamblingEntry,
  TaxDelinquencyEntry,
  CreditCardViolationEntry,
  CreditCounselingEntry,
  AlimonyChildSupportEntry,
  JudgmentEntry,
  LienEntry,
  FederalDebtEntry,
  ForeclosureRepossessionEntry,
  DefaultEntry,
  CollectionEntry,
  SuspendedAccountEntry,
  EvictionEntry,
  GarnishmentEntry,
  DelinquencyEntry,
  FinancialValidationResult,
} from "../../../../api/interfaces/sections2.0/section26";
import {
  createDefaultBankruptcyEntry,
  createDefaultSection26,
  validateSection26,
  hasAnyFinancialIssues,
  getTotalEntryCount,
  getFinancialSummary,
} from "../../../../api/interfaces/sections2.0/section26";
import { useSectionIntegration } from "../shared/section-integration";
import type { ValidationError, ValidationResult, ChangeSet, SectionRegistration, BulkUpdate } from "../shared/base-interfaces";

// ============================================================================
// CONTEXT INTERFACE
// ============================================================================

interface Section26ContextType {
  // Core state
  sectionId: string;
  sectionName: string;
  sectionData: Section26;
  isLoading: boolean;
  errors: ValidationError[];
  isDirty: boolean;
  
  // Core methods
  updateFieldValue: (path: string, value: any) => void;
  validateSection: () => ValidationResult;
  resetSection: () => void;
  loadSection: (data: any) => void;
  getChanges: () => ChangeSet;
  
  // Entry management
  getEntryCount: (subsectionKey: string) => number;
  addEntry: (subsectionKey: string, entryType?: string) => void;
  removeEntry: (subsectionKey: string, index: number) => void;
  moveEntry: (subsectionKey: string, fromIndex: number, toIndex: number) => void;
  duplicateEntry: (subsectionKey: string, index: number) => void;
  clearEntry: (subsectionKey: string, index: number) => void;
  
  // Subsection flag management
  updateSubsectionFlag: (
    subsectionKey: Section26SubsectionKey,
    hasValue: "YES" | "NO"
  ) => void;
  
  // Specific entry management methods
  addBankruptcyEntry: () => void;
  addGamblingEntry: () => void;
  addTaxDelinquencyEntry: () => void;
  addCreditCardViolationEntry: () => void;
  addCreditCounselingEntry: () => void;
  addAlimonyChildSupportEntry: () => void;
  addJudgmentEntry: () => void;
  addLienEntry: () => void;
  addFederalDebtEntry: () => void;
  addForeclosureRepossessionEntry: () => void;
  addDefaultEntry: () => void;
  addCollectionEntry: () => void;
  addSuspendedAccountEntry: () => void;
  addEvictionEntry: () => void;
  addGarnishmentEntry: () => void;
  addDelinquencyEntry: (type: 'past' | 'current') => void;
  
  // Field updates
  updateEntryField: (
    subsectionKey: Section26SubsectionKey,
    entryIndex: number,
    fieldPath: string,
    newValue: any
  ) => void;
  
  // Bulk operations
  bulkUpdateFields: (updates: BulkUpdate[]) => void;
  bulkUpdateEntryFields: (
    subsectionKey: Section26SubsectionKey,
    entryIndex: number,
    fieldUpdates: Record<string, any>
  ) => void;
  
  // Utility functions
  getEntry: (subsectionKey: Section26SubsectionKey, entryIndex: number) => any;
  
  // Section-specific queries
  hasAnyFinancialIssues: () => boolean;
  hasAnyBankruptcies: () => boolean;
  hasAnyTaxIssues: () => boolean;
  hasAnyDelinquencies: () => boolean;
  getCurrentFinancialStatus: () => {
    hasActiveIssues: boolean;
    hasPendingResolutions: boolean;
    hasCurrentProblems: boolean;
    totalRecords: number;
  };
  getFinancialSummary: () => ReturnType<typeof getFinancialSummary>;
  
  // Validation
  validateFinancialData: () => FinancialValidationResult;
}

// ============================================================================
// CONTEXT IMPLEMENTATION
// ============================================================================

const Section26Context = createContext<Section26ContextType | null>(null);

/**
 * Section 26 Provider Component
 */
export const Section26Provider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  // State management
  const [sectionData, setSectionData] = useState<Section26>(() => 
    createDefaultSection26()
  );
  const [initialSectionData, setInitialSectionData] = useState<Section26>(() => 
    createDefaultSection26()
  );
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<ValidationError[]>([]);

  // Integration with shared context
  const integration = useSectionIntegration();

  // Register this section with the integration system
  useEffect(() => {
    if (integration) {
      console.log("🔧 Section 26 integrated with system");
    }
  }, [integration]);

  // ============================================================================
  // COMPUTED VALUES
  // ============================================================================

  const isDirty = JSON.stringify(sectionData) !== JSON.stringify(initialSectionData);

  // ============================================================================
  // FIELD UPDATE METHODS
  // ============================================================================

  /**
   * Update any field value using dot notation path
   */
  const updateFieldValue = useCallback((path: string, value: any) => {
    setSectionData((prevData) => {
      const newData = cloneDeep(prevData);
      set(newData, path, value);
      
      // Log field changes for debugging
      console.log(`Section 26 field updated: ${path} = ${value}`);
      
      return newData;
    });
  }, [integration]);

  /**
   * Update subsection flag (YES/NO radio buttons)
   */
  const updateSubsectionFlag = useCallback((
    subsectionKey: Section26SubsectionKey,
    hasValue: "YES" | "NO"
  ) => {
    setSectionData((prevData) => {
      const newData = cloneDeep(prevData);
      
      // Update the main flag based on subsection
      switch (subsectionKey) {
        case 'bankruptcy':
          newData.section26.bankruptcy.hasBankruptcyFilings.value = hasValue;
          break;
        case 'gambling':
          newData.section26.gambling.hasGamblingProblems.value = hasValue;
          break;
        case 'taxDelinquency':
          newData.section26.taxDelinquency.hasTaxDelinquencies.value = hasValue;
          break;
        case 'creditCardViolations':
          newData.section26.creditCardViolations.hasCreditCardViolations.value = hasValue;
          break;
        case 'creditCounseling':
          newData.section26.creditCounseling.isUtilizingCreditCounseling.value = hasValue;
          break;
        case 'financialObligations':
          // Note: financialObligations has multiple sub-flags
          break;
        case 'financialProblems':
          // Note: financialProblems has multiple sub-flags
          break;
        default:
          console.warn(`Unknown subsection key: ${subsectionKey}`);
      }
      
      // Clear entries if NO is selected
      if (hasValue === "NO") {
        switch (subsectionKey) {
          case 'bankruptcy':
            newData.section26.bankruptcy.entries = [];
            newData.section26.bankruptcy.entriesCount = 0;
            break;
          case 'gambling':
            newData.section26.gambling.entries = [];
            newData.section26.gambling.entriesCount = 0;
            break;
          case 'taxDelinquency':
            newData.section26.taxDelinquency.entries = [];
            newData.section26.taxDelinquency.entriesCount = 0;
            break;
          case 'creditCardViolations':
            newData.section26.creditCardViolations.entries = [];
            newData.section26.creditCardViolations.entriesCount = 0;
            break;
          case 'creditCounseling':
            newData.section26.creditCounseling.entries = [];
            newData.section26.creditCounseling.entriesCount = 0;
            break;
        }
      }
      
      // Log subsection flag changes for debugging
      console.log(`Section 26 subsection updated: ${subsectionKey} = ${hasValue}`);
      
      return newData;
    });
  }, [integration]);

  // ============================================================================
  // ENTRY MANAGEMENT METHODS
  // ============================================================================

  /**
   * Get entry count for a subsection
   */
  const getEntryCount = useCallback((subsectionKey: string): number => {
    switch (subsectionKey) {
      case 'bankruptcy':
        return sectionData.section26.bankruptcy.entriesCount;
      case 'gambling':
        return sectionData.section26.gambling.entriesCount;
      case 'taxDelinquency':
        return sectionData.section26.taxDelinquency.entriesCount;
      case 'creditCardViolations':
        return sectionData.section26.creditCardViolations.entriesCount;
      case 'creditCounseling':
        return sectionData.section26.creditCounseling.entriesCount;
      case 'alimonyChildSupport':
        return sectionData.section26.financialObligations.alimonyChildSupportEntries.length;
      case 'judgments':
        return sectionData.section26.financialObligations.judgmentEntries.length;
      case 'liens':
        return sectionData.section26.financialObligations.lienEntries.length;
      case 'federalDebt':
        return sectionData.section26.financialObligations.federalDebtEntries.length;
      case 'foreclosures':
        return sectionData.section26.financialProblems.foreclosureRepossessionEntries.length;
      case 'defaults':
        return sectionData.section26.financialProblems.defaultEntries.length;
      case 'collections':
        return sectionData.section26.financialProblems.collectionEntries.length;
      case 'suspendedAccounts':
        return sectionData.section26.financialProblems.suspendedAccountEntries.length;
      case 'evictions':
        return sectionData.section26.financialProblems.evictionEntries.length;
      case 'garnishments':
        return sectionData.section26.financialProblems.garnishmentEntries.length;
      case 'pastDelinquencies':
        return sectionData.section26.financialProblems.pastDelinquencyEntries.length;
      case 'currentDelinquencies':
        return sectionData.section26.financialProblems.currentDelinquencyEntries.length;
      default:
        return 0;
    }
  }, [sectionData]);

  /**
   * Add entry to a subsection
   */
  const addEntry = useCallback((subsectionKey: string, entryType?: string) => {
    setSectionData((prevData) => {
      const newData = cloneDeep(prevData);
      
      switch (subsectionKey) {
        case 'bankruptcy':
          // Add default bankruptcy entry implementation here
          break;
        case 'gambling':
          // Add default gambling entry implementation here
          break;
        // ... other cases
        default:
          console.warn(`Unknown subsection key for addEntry: ${subsectionKey}`);
      }
      
      return newData;
    });
  }, []);

  /**
   * Remove entry from a subsection
   */
  const removeEntry = useCallback((subsectionKey: string, index: number) => {
    setSectionData((prevData) => {
      const newData = cloneDeep(prevData);
      
      switch (subsectionKey) {
        case 'bankruptcy':
          newData.section26.bankruptcy.entries.splice(index, 1);
          newData.section26.bankruptcy.entriesCount = newData.section26.bankruptcy.entries.length;
          break;
        case 'gambling':
          newData.section26.gambling.entries.splice(index, 1);
          newData.section26.gambling.entriesCount = newData.section26.gambling.entries.length;
          break;
        // ... other cases
        default:
          console.warn(`Unknown subsection key for removeEntry: ${subsectionKey}`);
      }
      
      return newData;
    });
  }, []);

  // ============================================================================
  // SPECIFIC ENTRY CREATORS
  // ============================================================================

  const addBankruptcyEntry = useCallback(() => {
    setSectionData((prevData) => {
      const newData = cloneDeep(prevData);
      const newEntry = createDefaultBankruptcyEntry();
      newData.section26.bankruptcy.entries.push(newEntry);
      newData.section26.bankruptcy.entriesCount = newData.section26.bankruptcy.entries.length;
      return newData;
    });
  }, []);

  // Add more specific entry creators...
  const addGamblingEntry = useCallback(() => {
    setSectionData((prevData) => {
      const newData = cloneDeep(prevData);
      // Implementation would create default gambling entry
      console.log("Adding gambling entry");
      return newData;
    });
  }, []);

  const addTaxDelinquencyEntry = useCallback(() => {
    setSectionData((prevData) => {
      const newData = cloneDeep(prevData);
      // Implementation would create default tax delinquency entry
      console.log("Adding tax delinquency entry");
      return newData;
    });
  }, []);

  const addCreditCardViolationEntry = useCallback(() => {
    setSectionData((prevData) => {
      const newData = cloneDeep(prevData);
      // Implementation would create default credit card violation entry
      console.log("Adding credit card violation entry");
      return newData;
    });
  }, []);

  const addCreditCounselingEntry = useCallback(() => {
    setSectionData((prevData) => {
      const newData = cloneDeep(prevData);
      // Implementation would create default credit counseling entry
      console.log("Adding credit counseling entry");
      return newData;
    });
  }, []);

  const addAlimonyChildSupportEntry = useCallback(() => {
    setSectionData((prevData) => {
      const newData = cloneDeep(prevData);
      // Implementation would create default alimony/child support entry
      console.log("Adding alimony/child support entry");
      return newData;
    });
  }, []);

  const addJudgmentEntry = useCallback(() => {
    setSectionData((prevData) => {
      const newData = cloneDeep(prevData);
      // Implementation would create default judgment entry
      console.log("Adding judgment entry");
      return newData;
    });
  }, []);

  const addLienEntry = useCallback(() => {
    setSectionData((prevData) => {
      const newData = cloneDeep(prevData);
      // Implementation would create default lien entry
      console.log("Adding lien entry");
      return newData;
    });
  }, []);

  const addFederalDebtEntry = useCallback(() => {
    setSectionData((prevData) => {
      const newData = cloneDeep(prevData);
      // Implementation would create default federal debt entry
      console.log("Adding federal debt entry");
      return newData;
    });
  }, []);

  const addForeclosureRepossessionEntry = useCallback(() => {
    setSectionData((prevData) => {
      const newData = cloneDeep(prevData);
      // Implementation would create default foreclosure/repossession entry
      console.log("Adding foreclosure/repossession entry");
      return newData;
    });
  }, []);

  const addDefaultEntry = useCallback(() => {
    setSectionData((prevData) => {
      const newData = cloneDeep(prevData);
      // Implementation would create default default entry
      console.log("Adding default entry");
      return newData;
    });
  }, []);

  const addCollectionEntry = useCallback(() => {
    setSectionData((prevData) => {
      const newData = cloneDeep(prevData);
      // Implementation would create default collection entry
      console.log("Adding collection entry");
      return newData;
    });
  }, []);

  const addSuspendedAccountEntry = useCallback(() => {
    setSectionData((prevData) => {
      const newData = cloneDeep(prevData);
      // Implementation would create default suspended account entry
      console.log("Adding suspended account entry");
      return newData;
    });
  }, []);

  const addEvictionEntry = useCallback(() => {
    setSectionData((prevData) => {
      const newData = cloneDeep(prevData);
      // Implementation would create default eviction entry
      console.log("Adding eviction entry");
      return newData;
    });
  }, []);

  const addGarnishmentEntry = useCallback(() => {
    setSectionData((prevData) => {
      const newData = cloneDeep(prevData);
      // Implementation would create default garnishment entry
      console.log("Adding garnishment entry");
      return newData;
    });
  }, []);

  // ============================================================================
  // VALIDATION METHODS
  // ============================================================================

  /**
   * Validate section data
   */
  const validateSection = useCallback((): ValidationResult => {
    const validationContext = {
      currentDate: new Date(),
      rules: {
        timeframeYears: 7,
        requiresCourtInformation: true,
        requiresAmountDetails: true,
        requiresResolutionStatus: true,
        allowsEstimatedDates: true,
        maxDescriptionLength: 2000,
        requiresExplanationForUnresolved: true,
        requiresCurrentStatusUpdate: true,
      }
    };

    const result = validateSection26(sectionData, validationContext);
    
    const validationErrors: ValidationError[] = result.errors.map(error => ({
      field: 'general',
      message: error,
      code: 'VALIDATION_ERROR',
      severity: 'error' as const
    }));

    setErrors(validationErrors);

    return {
      isValid: result.isValid,
      errors: validationErrors,
      warnings: result.warnings.map(warning => ({
        field: 'general',
        message: warning,
        code: 'VALIDATION_WARNING',
        severity: 'warning' as const
      }))
    };
  }, [sectionData]);

  /**
   * Validate financial data specifically
   */
  const validateFinancialData = useCallback((): FinancialValidationResult => {
    const validationContext = {
      currentDate: new Date(),
      rules: {
        timeframeYears: 7,
        requiresCourtInformation: true,
        requiresAmountDetails: true,
        requiresResolutionStatus: true,
        allowsEstimatedDates: true,
        maxDescriptionLength: 2000,
        requiresExplanationForUnresolved: true,
        requiresCurrentStatusUpdate: true,
      }
    };

    return validateSection26(sectionData, validationContext);
  }, [sectionData]);

  // ============================================================================
  // UTILITY METHODS
  // ============================================================================

  const resetSection = useCallback(() => {
    const newData = createDefaultSection26();
    setSectionData(newData);
    setInitialSectionData(newData);
    setErrors([]);
  }, []);

  const loadSection = useCallback((data: any) => {
    setSectionData(cloneDeep(data));
    setInitialSectionData(cloneDeep(data));
    setErrors([]);
  }, []);

  const getChanges = useCallback((): ChangeSet => {
    const changes: ChangeSet = {};
    if (isDirty) {
      changes["section26"] = {
        oldValue: initialSectionData,
        newValue: sectionData,
        timestamp: new Date()
      };
    }
    return changes;
  }, [sectionData, initialSectionData, isDirty]);

  // ============================================================================
  // QUERY METHODS
  // ============================================================================

  const hasAnyFinancialIssuesQuery = useCallback(() => {
    return hasAnyFinancialIssues(sectionData);
  }, [sectionData]);

  const hasAnyBankruptcies = useCallback(() => {
    return sectionData.section26.bankruptcy.hasBankruptcyFilings.value === "YES";
  }, [sectionData]);

  const hasAnyTaxIssues = useCallback(() => {
    return sectionData.section26.taxDelinquency.hasTaxDelinquencies.value === "YES";
  }, [sectionData]);

  const hasAnyDelinquencies = useCallback(() => {
    return sectionData.section26.financialProblems.hasPastDelinquencies.value === "YES" ||
           sectionData.section26.financialProblems.hasCurrentDelinquencies.value === "YES";
  }, [sectionData]);

  const getCurrentFinancialStatus = useCallback(() => {
    const summary = getFinancialSummary(sectionData);
    return {
      hasActiveIssues: summary.hasAnyIssues,
      hasPendingResolutions: false, // Could be computed from entry statuses
      hasCurrentProblems: hasAnyDelinquencies(),
      totalRecords: summary.totalEntries
    };
  }, [sectionData, hasAnyDelinquencies]);

  const getFinancialSummaryQuery = useCallback(() => {
    return getFinancialSummary(sectionData);
  }, [sectionData]);

  // ============================================================================
  // ADDITIONAL HELPER METHODS
  // ============================================================================

  const moveEntry = useCallback((subsectionKey: string, fromIndex: number, toIndex: number) => {
    // Implementation for moving entries
  }, []);

  const duplicateEntry = useCallback((subsectionKey: string, index: number) => {
    // Implementation for duplicating entries
  }, []);

  const clearEntry = useCallback((subsectionKey: string, index: number) => {
    // Implementation for clearing entry data
  }, []);

  const updateEntryField = useCallback((
    subsectionKey: Section26SubsectionKey,
    entryIndex: number,
    fieldPath: string,
    newValue: any
  ) => {
    const fullPath = `section26.${subsectionKey}.entries[${entryIndex}].${fieldPath}`;
    updateFieldValue(fullPath, newValue);
  }, [updateFieldValue]);

  const bulkUpdateFields = useCallback((updates: BulkUpdate[]) => {
    setSectionData((prevData) => {
      const newData = cloneDeep(prevData);
      updates.forEach(update => {
        set(newData, update.path, update.value);
      });
      return newData;
    });
  }, []);

  const bulkUpdateEntryFields = useCallback((
    subsectionKey: Section26SubsectionKey,
    entryIndex: number,
    fieldUpdates: Record<string, any>
  ) => {
    const updates: BulkUpdate[] = Object.entries(fieldUpdates).map(([field, value]) => ({
      path: `section26.${subsectionKey}.entries[${entryIndex}].${field}`,
      value
    }));
    bulkUpdateFields(updates);
  }, [bulkUpdateFields]);

  const getEntry = useCallback((subsectionKey: Section26SubsectionKey, entryIndex: number) => {
    switch (subsectionKey) {
      case 'bankruptcy':
        return sectionData.section26.bankruptcy.entries[entryIndex];
      case 'gambling':
        return sectionData.section26.gambling.entries[entryIndex];
      case 'taxDelinquency':
        return sectionData.section26.taxDelinquency.entries[entryIndex];
      // ... other cases
      default:
        return null;
    }
  }, [sectionData]);

  const addDelinquencyEntry = useCallback((type: 'past' | 'current') => {
    // Implementation for adding delinquency entries
  }, []);

  // ============================================================================
  // CONTEXT VALUE
  // ============================================================================

  const contextValue: Section26ContextType = {
    // Core state
    sectionId: "section26",
    sectionName: "Financial Record",
    sectionData,
    isLoading,
    errors,
    isDirty,
    
    // Core methods
    updateFieldValue,
    validateSection,
    resetSection,
    loadSection,
    getChanges,
    
    // Entry management
    getEntryCount,
    addEntry,
    removeEntry,
    moveEntry,
    duplicateEntry,
    clearEntry,
    
    // Subsection flag management
    updateSubsectionFlag,
    
    // Specific entry management
    addBankruptcyEntry,
    addGamblingEntry,
    addTaxDelinquencyEntry,
    addCreditCardViolationEntry,
    addCreditCounselingEntry,
    addAlimonyChildSupportEntry,
    addJudgmentEntry,
    addLienEntry,
    addFederalDebtEntry,
    addForeclosureRepossessionEntry,
    addDefaultEntry,
    addCollectionEntry,
    addSuspendedAccountEntry,
    addEvictionEntry,
    addGarnishmentEntry,
    addDelinquencyEntry,
    
    // Field updates
    updateEntryField,
    
    // Bulk operations
    bulkUpdateFields,
    bulkUpdateEntryFields,
    
    // Utility functions
    getEntry,
    
    // Section-specific queries
    hasAnyFinancialIssues: hasAnyFinancialIssuesQuery,
    hasAnyBankruptcies,
    hasAnyTaxIssues,
    hasAnyDelinquencies,
    getCurrentFinancialStatus,
    getFinancialSummary: getFinancialSummaryQuery,
    
    // Validation
    validateFinancialData,
  };

  return (
    <Section26Context.Provider value={contextValue}>
      {children}
    </Section26Context.Provider>
  );
};

// ============================================================================
// HOOK
// ============================================================================

/**
 * Hook to use Section 26 context
 */
export const useSection26 = (): Section26ContextType => {
  const context = useContext(Section26Context);
  if (!context) {
    throw new Error("useSection26 must be used within a Section26Provider");
  }
  return context;
};

// ============================================================================
// EXPORTS
// ============================================================================

export type { Section26ContextType };
export default Section26Provider; 