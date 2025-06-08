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
  createDefaultGamblingEntry,
  createDefaultTaxDelinquencyEntry,
  createDefaultCreditCardViolationEntry,
  createDefaultCreditCounselingEntry,
  createDefaultAlimonyChildSupportEntry,
  createDefaultJudgmentEntry,
  createDefaultLienEntry,
  createDefaultFederalDebtEntry,
  createDefaultForeclosureRepossessionEntry,
  createDefaultDefaultEntry,
  createDefaultCollectionEntry,
  createDefaultSuspendedAccountEntry,
  createDefaultEvictionEntry,
  createDefaultGarnishmentEntry,
  createDefaultDelinquencyEntry,
  createDefaultFinancialProblemsContinuation1Subsection,
  createDefaultFinancialProblemsContinuation2Subsection,
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
  addCreditCounselingActualEntry: () => void;
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

  // Continuation entry methods
  addContinuation1Entry: (entryType: string) => void;
  addContinuation2Entry: (entryType: string) => void;
  
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
        case 'gamblingAndTax':
          newData.section26.gamblingAndTax.hasGamblingProblems.value = hasValue;
          newData.section26.gamblingAndTax.hasTaxDelinquencies.value = hasValue;
          break;
        case 'creditCardViolations':
          newData.section26.creditCardViolations.hasCreditCardViolations.value = hasValue;
          break;
        case 'creditCounseling':
          newData.section26.creditCounseling.isUtilizingCreditCounseling.value = hasValue;
          break;
        case 'creditCounselingActual':
          newData.section26.creditCounselingActual.isUtilizingCreditCounseling.value = hasValue;
          break;
        case 'financialObligations':
          // financialObligations has multiple sub-flags - handle the main ones
          newData.section26.financialObligations.hasAlimonyChildSupportDelinquencies.value = hasValue;
          newData.section26.financialObligations.hasJudgments.value = hasValue;
          newData.section26.financialObligations.hasLiens.value = hasValue;
          newData.section26.financialObligations.hasFederalDebt.value = hasValue;
          break;
        case 'financialProblems':
          // financialProblems has multiple sub-flags - handle the main ones
          newData.section26.financialProblems.hasForeclosuresRepossessions.value = hasValue;
          newData.section26.financialProblems.hasDefaults.value = hasValue;
          newData.section26.financialProblems.hasCollections.value = hasValue;
          newData.section26.financialProblems.hasSuspendedAccounts.value = hasValue;
          newData.section26.financialProblems.hasEvictions.value = hasValue;
          newData.section26.financialProblems.hasGarnishments.value = hasValue;
          newData.section26.financialProblems.hasPastDelinquencies.value = hasValue;
          newData.section26.financialProblems.hasCurrentDelinquencies.value = hasValue;
          break;
        case 'financialProblemsContinuation1':
          // Update all continuation flags for 26.8
          newData.section26.financialProblemsContinuation1.continuesForeclosuresRepossessions.value = hasValue;
          newData.section26.financialProblemsContinuation1.continuesDefaults.value = hasValue;
          newData.section26.financialProblemsContinuation1.continuesCollections.value = hasValue;
          newData.section26.financialProblemsContinuation1.continuesSuspendedAccounts.value = hasValue;
          newData.section26.financialProblemsContinuation1.continuesEvictions.value = hasValue;
          newData.section26.financialProblemsContinuation1.continuesGarnishments.value = hasValue;
          newData.section26.financialProblemsContinuation1.continuesPastDelinquencies.value = hasValue;
          newData.section26.financialProblemsContinuation1.continuesCurrentDelinquencies.value = hasValue;
          break;
        case 'financialProblemsContinuation2':
          // Update all continuation flags for 26.9
          newData.section26.financialProblemsContinuation2.continuesForeclosuresRepossessions.value = hasValue;
          newData.section26.financialProblemsContinuation2.continuesDefaults.value = hasValue;
          newData.section26.financialProblemsContinuation2.continuesCollections.value = hasValue;
          newData.section26.financialProblemsContinuation2.continuesSuspendedAccounts.value = hasValue;
          newData.section26.financialProblemsContinuation2.continuesEvictions.value = hasValue;
          newData.section26.financialProblemsContinuation2.continuesGarnishments.value = hasValue;
          newData.section26.financialProblemsContinuation2.continuesPastDelinquencies.value = hasValue;
          newData.section26.financialProblemsContinuation2.continuesCurrentDelinquencies.value = hasValue;
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
          case 'gamblingAndTax':
            newData.section26.gamblingAndTax.gamblingEntries = [];
            newData.section26.gamblingAndTax.gamblingEntriesCount = 0;
            newData.section26.gamblingAndTax.taxDelinquencyEntries = [];
            newData.section26.gamblingAndTax.taxDelinquencyEntriesCount = 0;
            newData.section26.gamblingAndTax.totalEntriesCount = 0;
            break;
          case 'creditCardViolations':
            newData.section26.creditCardViolations.entries = [];
            newData.section26.creditCardViolations.entriesCount = 0;
            break;
          case 'creditCounseling':
            newData.section26.creditCounseling.entries = [];
            newData.section26.creditCounseling.entriesCount = 0;
            break;
          case 'creditCounselingActual':
            newData.section26.creditCounselingActual.entries = [];
            newData.section26.creditCounselingActual.entriesCount = 0;
            break;
          case 'financialObligations':
            newData.section26.financialObligations.alimonyChildSupportEntries = [];
            newData.section26.financialObligations.judgmentEntries = [];
            newData.section26.financialObligations.lienEntries = [];
            newData.section26.financialObligations.federalDebtEntries = [];
            newData.section26.financialObligations.totalEntriesCount = 0;
            break;
          case 'financialProblems':
            newData.section26.financialProblems.foreclosureRepossessionEntries = [];
            newData.section26.financialProblems.defaultEntries = [];
            newData.section26.financialProblems.collectionEntries = [];
            newData.section26.financialProblems.suspendedAccountEntries = [];
            newData.section26.financialProblems.evictionEntries = [];
            newData.section26.financialProblems.garnishmentEntries = [];
            newData.section26.financialProblems.pastDelinquencyEntries = [];
            newData.section26.financialProblems.currentDelinquencyEntries = [];
            newData.section26.financialProblems.totalEntriesCount = 0;
            break;
          case 'financialProblemsContinuation1':
            newData.section26.financialProblemsContinuation1.additionalForeclosureRepossessionEntries = [];
            newData.section26.financialProblemsContinuation1.additionalDefaultEntries = [];
            newData.section26.financialProblemsContinuation1.additionalCollectionEntries = [];
            newData.section26.financialProblemsContinuation1.additionalSuspendedAccountEntries = [];
            newData.section26.financialProblemsContinuation1.additionalEvictionEntries = [];
            newData.section26.financialProblemsContinuation1.additionalGarnishmentEntries = [];
            newData.section26.financialProblemsContinuation1.additionalPastDelinquencyEntries = [];
            newData.section26.financialProblemsContinuation1.additionalCurrentDelinquencyEntries = [];
            newData.section26.financialProblemsContinuation1.totalEntriesCount = 0;
            break;
          case 'financialProblemsContinuation2':
            newData.section26.financialProblemsContinuation2.additionalForeclosureRepossessionEntries = [];
            newData.section26.financialProblemsContinuation2.additionalDefaultEntries = [];
            newData.section26.financialProblemsContinuation2.additionalCollectionEntries = [];
            newData.section26.financialProblemsContinuation2.additionalSuspendedAccountEntries = [];
            newData.section26.financialProblemsContinuation2.additionalEvictionEntries = [];
            newData.section26.financialProblemsContinuation2.additionalGarnishmentEntries = [];
            newData.section26.financialProblemsContinuation2.additionalPastDelinquencyEntries = [];
            newData.section26.financialProblemsContinuation2.additionalCurrentDelinquencyEntries = [];
            newData.section26.financialProblemsContinuation2.totalEntriesCount = 0;
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
      case 'gamblingAndTax':
        return sectionData.section26.gamblingAndTax.totalEntriesCount;
      case 'creditCardViolations':
        return sectionData.section26.creditCardViolations.entriesCount;
      case 'creditCounseling':
        return sectionData.section26.creditCounseling.entriesCount;
      case 'creditCounselingActual':
        return sectionData.section26.creditCounselingActual.entriesCount;
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
      case 'financialProblemsContinuation1':
        return sectionData.section26.financialProblemsContinuation1.totalEntriesCount;
      case 'financialProblemsContinuation2':
        return sectionData.section26.financialProblemsContinuation2.totalEntriesCount;
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
      const newEntry = createDefaultGamblingEntry();
      newData.section26.gamblingAndTax.gamblingEntries.push(newEntry);
      newData.section26.gamblingAndTax.gamblingEntriesCount = newData.section26.gamblingAndTax.gamblingEntries.length;
      newData.section26.gamblingAndTax.totalEntriesCount =
        newData.section26.gamblingAndTax.gamblingEntriesCount +
        newData.section26.gamblingAndTax.taxDelinquencyEntriesCount;
      return newData;
    });
  }, []);

  const addTaxDelinquencyEntry = useCallback(() => {
    setSectionData((prevData) => {
      const newData = cloneDeep(prevData);
      const newEntry = createDefaultTaxDelinquencyEntry();
      newData.section26.gamblingAndTax.taxDelinquencyEntries.push(newEntry);
      newData.section26.gamblingAndTax.taxDelinquencyEntriesCount = newData.section26.gamblingAndTax.taxDelinquencyEntries.length;
      newData.section26.gamblingAndTax.totalEntriesCount =
        newData.section26.gamblingAndTax.gamblingEntriesCount +
        newData.section26.gamblingAndTax.taxDelinquencyEntriesCount;
      return newData;
    });
  }, []);

  const addCreditCardViolationEntry = useCallback(() => {
    setSectionData((prevData) => {
      const newData = cloneDeep(prevData);
      const newEntry = createDefaultCreditCardViolationEntry();
      newData.section26.creditCardViolations.entries.push(newEntry);
      newData.section26.creditCardViolations.entriesCount = newData.section26.creditCardViolations.entries.length;
      return newData;
    });
  }, []);

  const addCreditCounselingEntry = useCallback(() => {
    setSectionData((prevData) => {
      const newData = cloneDeep(prevData);
      const newEntry = createDefaultCreditCounselingEntry();
      newData.section26.creditCounseling.entries.push(newEntry);
      newData.section26.creditCounseling.entriesCount = newData.section26.creditCounseling.entries.length;
      return newData;
    });
  }, []);

  const addCreditCounselingActualEntry = useCallback(() => {
    setSectionData((prevData) => {
      const newData = cloneDeep(prevData);
      const newEntry = createDefaultCreditCounselingEntry();
      newData.section26.creditCounselingActual.entries.push(newEntry);
      newData.section26.creditCounselingActual.entriesCount = newData.section26.creditCounselingActual.entries.length;
      return newData;
    });
  }, []);

  const addAlimonyChildSupportEntry = useCallback(() => {
    setSectionData((prevData) => {
      const newData = cloneDeep(prevData);
      const newEntry = createDefaultAlimonyChildSupportEntry();
      newData.section26.financialObligations.alimonyChildSupportEntries.push(newEntry);
      newData.section26.financialObligations.totalEntriesCount =
        newData.section26.financialObligations.alimonyChildSupportEntries.length +
        newData.section26.financialObligations.judgmentEntries.length +
        newData.section26.financialObligations.lienEntries.length +
        newData.section26.financialObligations.federalDebtEntries.length;
      return newData;
    });
  }, []);

  const addJudgmentEntry = useCallback(() => {
    setSectionData((prevData) => {
      const newData = cloneDeep(prevData);
      const newEntry = createDefaultJudgmentEntry();
      newData.section26.financialObligations.judgmentEntries.push(newEntry);
      newData.section26.financialObligations.totalEntriesCount =
        newData.section26.financialObligations.alimonyChildSupportEntries.length +
        newData.section26.financialObligations.judgmentEntries.length +
        newData.section26.financialObligations.lienEntries.length +
        newData.section26.financialObligations.federalDebtEntries.length;
      return newData;
    });
  }, []);

  const addLienEntry = useCallback(() => {
    setSectionData((prevData) => {
      const newData = cloneDeep(prevData);
      const newEntry = createDefaultLienEntry();
      newData.section26.financialObligations.lienEntries.push(newEntry);
      newData.section26.financialObligations.totalEntriesCount =
        newData.section26.financialObligations.alimonyChildSupportEntries.length +
        newData.section26.financialObligations.judgmentEntries.length +
        newData.section26.financialObligations.lienEntries.length +
        newData.section26.financialObligations.federalDebtEntries.length;
      return newData;
    });
  }, []);

  const addFederalDebtEntry = useCallback(() => {
    setSectionData((prevData) => {
      const newData = cloneDeep(prevData);
      const newEntry = createDefaultFederalDebtEntry();
      newData.section26.financialObligations.federalDebtEntries.push(newEntry);
      newData.section26.financialObligations.totalEntriesCount =
        newData.section26.financialObligations.alimonyChildSupportEntries.length +
        newData.section26.financialObligations.judgmentEntries.length +
        newData.section26.financialObligations.lienEntries.length +
        newData.section26.financialObligations.federalDebtEntries.length;
      return newData;
    });
  }, []);

  const addForeclosureRepossessionEntry = useCallback(() => {
    setSectionData((prevData) => {
      const newData = cloneDeep(prevData);
      const newEntry = createDefaultForeclosureRepossessionEntry();
      newData.section26.financialProblems.foreclosureRepossessionEntries.push(newEntry);
      newData.section26.financialProblems.totalEntriesCount =
        newData.section26.financialProblems.foreclosureRepossessionEntries.length +
        newData.section26.financialProblems.defaultEntries.length +
        newData.section26.financialProblems.collectionEntries.length +
        newData.section26.financialProblems.suspendedAccountEntries.length +
        newData.section26.financialProblems.evictionEntries.length +
        newData.section26.financialProblems.garnishmentEntries.length +
        newData.section26.financialProblems.pastDelinquencyEntries.length +
        newData.section26.financialProblems.currentDelinquencyEntries.length;
      return newData;
    });
  }, []);

  const addDefaultEntry = useCallback(() => {
    setSectionData((prevData) => {
      const newData = cloneDeep(prevData);
      const newEntry = createDefaultDefaultEntry();
      newData.section26.financialProblems.defaultEntries.push(newEntry);
      newData.section26.financialProblems.totalEntriesCount =
        newData.section26.financialProblems.foreclosureRepossessionEntries.length +
        newData.section26.financialProblems.defaultEntries.length +
        newData.section26.financialProblems.collectionEntries.length +
        newData.section26.financialProblems.suspendedAccountEntries.length +
        newData.section26.financialProblems.evictionEntries.length +
        newData.section26.financialProblems.garnishmentEntries.length +
        newData.section26.financialProblems.pastDelinquencyEntries.length +
        newData.section26.financialProblems.currentDelinquencyEntries.length;
      return newData;
    });
  }, []);

  const addCollectionEntry = useCallback(() => {
    setSectionData((prevData) => {
      const newData = cloneDeep(prevData);
      const newEntry = createDefaultCollectionEntry();
      newData.section26.financialProblems.collectionEntries.push(newEntry);
      newData.section26.financialProblems.totalEntriesCount =
        newData.section26.financialProblems.foreclosureRepossessionEntries.length +
        newData.section26.financialProblems.defaultEntries.length +
        newData.section26.financialProblems.collectionEntries.length +
        newData.section26.financialProblems.suspendedAccountEntries.length +
        newData.section26.financialProblems.evictionEntries.length +
        newData.section26.financialProblems.garnishmentEntries.length +
        newData.section26.financialProblems.pastDelinquencyEntries.length +
        newData.section26.financialProblems.currentDelinquencyEntries.length;
      return newData;
    });
  }, []);

  const addSuspendedAccountEntry = useCallback(() => {
    setSectionData((prevData) => {
      const newData = cloneDeep(prevData);
      const newEntry = createDefaultSuspendedAccountEntry();
      newData.section26.financialProblems.suspendedAccountEntries.push(newEntry);
      newData.section26.financialProblems.totalEntriesCount =
        newData.section26.financialProblems.foreclosureRepossessionEntries.length +
        newData.section26.financialProblems.defaultEntries.length +
        newData.section26.financialProblems.collectionEntries.length +
        newData.section26.financialProblems.suspendedAccountEntries.length +
        newData.section26.financialProblems.evictionEntries.length +
        newData.section26.financialProblems.garnishmentEntries.length +
        newData.section26.financialProblems.pastDelinquencyEntries.length +
        newData.section26.financialProblems.currentDelinquencyEntries.length;
      return newData;
    });
  }, []);

  const addEvictionEntry = useCallback(() => {
    setSectionData((prevData) => {
      const newData = cloneDeep(prevData);
      const newEntry = createDefaultEvictionEntry();
      newData.section26.financialProblems.evictionEntries.push(newEntry);
      newData.section26.financialProblems.totalEntriesCount =
        newData.section26.financialProblems.foreclosureRepossessionEntries.length +
        newData.section26.financialProblems.defaultEntries.length +
        newData.section26.financialProblems.collectionEntries.length +
        newData.section26.financialProblems.suspendedAccountEntries.length +
        newData.section26.financialProblems.evictionEntries.length +
        newData.section26.financialProblems.garnishmentEntries.length +
        newData.section26.financialProblems.pastDelinquencyEntries.length +
        newData.section26.financialProblems.currentDelinquencyEntries.length;
      return newData;
    });
  }, []);

  const addGarnishmentEntry = useCallback(() => {
    setSectionData((prevData) => {
      const newData = cloneDeep(prevData);
      const newEntry = createDefaultGarnishmentEntry();
      newData.section26.financialProblems.garnishmentEntries.push(newEntry);
      newData.section26.financialProblems.totalEntriesCount =
        newData.section26.financialProblems.foreclosureRepossessionEntries.length +
        newData.section26.financialProblems.defaultEntries.length +
        newData.section26.financialProblems.collectionEntries.length +
        newData.section26.financialProblems.suspendedAccountEntries.length +
        newData.section26.financialProblems.evictionEntries.length +
        newData.section26.financialProblems.garnishmentEntries.length +
        newData.section26.financialProblems.pastDelinquencyEntries.length +
        newData.section26.financialProblems.currentDelinquencyEntries.length;
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
    setSectionData((prevData) => {
      const newData = cloneDeep(prevData);
      const newEntry = createDefaultDelinquencyEntry();

      if (type === 'past') {
        newData.section26.financialProblems.pastDelinquencyEntries.push(newEntry);
      } else {
        newData.section26.financialProblems.currentDelinquencyEntries.push(newEntry);
      }

      newData.section26.financialProblems.totalEntriesCount =
        newData.section26.financialProblems.foreclosureRepossessionEntries.length +
        newData.section26.financialProblems.defaultEntries.length +
        newData.section26.financialProblems.collectionEntries.length +
        newData.section26.financialProblems.suspendedAccountEntries.length +
        newData.section26.financialProblems.evictionEntries.length +
        newData.section26.financialProblems.garnishmentEntries.length +
        newData.section26.financialProblems.pastDelinquencyEntries.length +
        newData.section26.financialProblems.currentDelinquencyEntries.length;
      return newData;
    });
  }, []);

  const addContinuation1Entry = useCallback((entryType: string) => {
    setSectionData((prevData) => {
      const newData = cloneDeep(prevData);
      const continuation = newData.section26.financialProblemsContinuation1;

      // Add entry to the appropriate array based on type
      switch (entryType) {
        case 'foreclosure':
          continuation.additionalForeclosureRepossessionEntries.push(createDefaultForeclosureRepossessionEntry());
          break;
        case 'default':
          continuation.additionalDefaultEntries.push(createDefaultDefaultEntry());
          break;
        case 'collection':
          continuation.additionalCollectionEntries.push(createDefaultCollectionEntry());
          break;
        case 'suspended':
          continuation.additionalSuspendedAccountEntries.push(createDefaultSuspendedAccountEntry());
          break;
        case 'eviction':
          continuation.additionalEvictionEntries.push(createDefaultEvictionEntry());
          break;
        case 'garnishment':
          continuation.additionalGarnishmentEntries.push(createDefaultGarnishmentEntry());
          break;
        case 'pastDelinquency':
          continuation.additionalPastDelinquencyEntries.push(createDefaultDelinquencyEntry());
          break;
        case 'currentDelinquency':
          continuation.additionalCurrentDelinquencyEntries.push(createDefaultDelinquencyEntry());
          break;
      }

      // Update total count
      continuation.totalEntriesCount =
        continuation.additionalForeclosureRepossessionEntries.length +
        continuation.additionalDefaultEntries.length +
        continuation.additionalCollectionEntries.length +
        continuation.additionalSuspendedAccountEntries.length +
        continuation.additionalEvictionEntries.length +
        continuation.additionalGarnishmentEntries.length +
        continuation.additionalPastDelinquencyEntries.length +
        continuation.additionalCurrentDelinquencyEntries.length;

      return newData;
    });
  }, []);

  const addContinuation2Entry = useCallback((entryType: string) => {
    setSectionData((prevData) => {
      const newData = cloneDeep(prevData);
      const continuation = newData.section26.financialProblemsContinuation2;

      // Add entry to the appropriate array based on type
      switch (entryType) {
        case 'foreclosure':
          continuation.additionalForeclosureRepossessionEntries.push(createDefaultForeclosureRepossessionEntry());
          break;
        case 'default':
          continuation.additionalDefaultEntries.push(createDefaultDefaultEntry());
          break;
        case 'collection':
          continuation.additionalCollectionEntries.push(createDefaultCollectionEntry());
          break;
        case 'suspended':
          continuation.additionalSuspendedAccountEntries.push(createDefaultSuspendedAccountEntry());
          break;
        case 'eviction':
          continuation.additionalEvictionEntries.push(createDefaultEvictionEntry());
          break;
        case 'garnishment':
          continuation.additionalGarnishmentEntries.push(createDefaultGarnishmentEntry());
          break;
        case 'pastDelinquency':
          continuation.additionalPastDelinquencyEntries.push(createDefaultDelinquencyEntry());
          break;
        case 'currentDelinquency':
          continuation.additionalCurrentDelinquencyEntries.push(createDefaultDelinquencyEntry());
          break;
      }

      // Update total count
      continuation.totalEntriesCount =
        continuation.additionalForeclosureRepossessionEntries.length +
        continuation.additionalDefaultEntries.length +
        continuation.additionalCollectionEntries.length +
        continuation.additionalSuspendedAccountEntries.length +
        continuation.additionalEvictionEntries.length +
        continuation.additionalGarnishmentEntries.length +
        continuation.additionalPastDelinquencyEntries.length +
        continuation.additionalCurrentDelinquencyEntries.length;

      return newData;
    });
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
    addCreditCounselingActualEntry,
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
    addContinuation1Entry,
    addContinuation2Entry,
    
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