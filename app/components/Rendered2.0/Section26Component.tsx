/**
 * Section 26: Financial Record Component
 *
 * React component for SF-86 Section 26 using the new Form Architecture 2.0.
 * This component handles collection of financial record information including
 * bankruptcy, gambling problems, tax delinquencies, credit violations,
 * credit counseling, financial obligations, and various financial problems.
 */

import React, { useEffect, useState, useCallback } from 'react';
import { useSection26 } from '~/state/contexts/sections2.0/section26';
import { useSF86Form } from '~/state/contexts/SF86FormContext';
import type { Section26SubsectionKey } from '../../../api/interfaces/sections2.0/section26';

// ============================================================================
// TYPES
// ============================================================================

interface Section26ComponentProps {
  className?: string;
  onValidationChange?: (isValid: boolean) => void;
  onNext?: () => void;
  showNavigation?: boolean;
}

interface SubsectionQuestionProps {
  subsectionKey: Section26SubsectionKey;
  title: string;
  description: string;
  hasValue: "YES" | "NO";
  onValueChange: (subsectionKey: Section26SubsectionKey, value: "YES" | "NO") => void;
  showEntries?: boolean;
  entryCount?: number;
  onAddEntry?: () => void;
  children?: React.ReactNode;
}

// ============================================================================
// INTERNAL COMPONENT IMPLEMENTATION
// ============================================================================

const Section26Component: React.FC<Section26ComponentProps> = ({
  className = '',
  onValidationChange,
  onNext,
  showNavigation = true
}) => {
  // Section 26 Context
  const {
    sectionData,
    updateSubsectionFlag,
    validateSection,
    resetSection,
    isDirty,
    errors,
    getEntryCount,
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
    addCreditCounselingActualEntry,
    addContinuation1Entry,
    addContinuation2Entry,
    hasAnyFinancialIssues,
    getFinancialSummary
  } = useSection26();

  // SF86 Form Context for data persistence
  const sf86Form = useSF86Form();

  // Track validation state internally
  const [isValid, setIsValid] = useState(false);
  const [activeTab, setActiveTab] = useState<string>('bankruptcy');

  // Handle validation on component mount and when data changes
  useEffect(() => {
    const validationResult = validateSection();
    setIsValid(validationResult.isValid);
    onValidationChange?.(validationResult.isValid);
  }, [sectionData, validateSection, onValidationChange]);

  // Handle subsection flag updates
  const handleSubsectionFlagChange = useCallback((
    subsectionKey: Section26SubsectionKey,
    value: "YES" | "NO"
  ) => {
    updateSubsectionFlag(subsectionKey, value);
  }, [updateSubsectionFlag]);

  // Handle specific financial obligations flag updates
  const handleFinancialObligationsFlagChange = useCallback((
    flagType: 'alimony' | 'judgments' | 'liens' | 'federalDebt',
    value: "YES" | "NO"
  ) => {
    // This would need to be implemented in the context to handle specific sub-flags
    // For now, we'll use the general subsection flag update
    updateSubsectionFlag('financialObligations', value);
  }, [updateSubsectionFlag]);

  // Handle specific financial problems flag updates
  const handleFinancialProblemsFlagChange = useCallback((
    flagType: 'foreclosures' | 'defaults' | 'collections' | 'suspended' | 'evictions' | 'garnishments' | 'pastDelinquencies' | 'currentDelinquencies',
    value: "YES" | "NO"
  ) => {
    // This would need to be implemented in the context to handle specific sub-flags
    // For now, we'll use the general subsection flag update
    updateSubsectionFlag('financialProblems', value);
  }, [updateSubsectionFlag]);

  // Handle submission with data persistence
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = validateSection();
    setIsValid(result.isValid);
    onValidationChange?.(result.isValid);

    if (result.isValid) {
      try {
        // Update the central form context with Section 26 data
        sf86Form.updateSectionData('section26', sectionData);

        // Save the form data to persistence layer
        await sf86Form.saveForm();

        console.log('✅ Section 26 data saved successfully:', sectionData);

        // Proceed to next section if callback provided
        if (onNext) {
          onNext();
        }
      } catch (error) {
        console.error('❌ Failed to save Section 26 data:', error);
      }
    }
  };

  // Reset function
  const handleReset = () => {
    resetSection();
  };

  // Get financial summary for status display
  const financialSummary = getFinancialSummary();

  // Define subsection tabs - CORRECTED based on actual reference data
  const subsectionTabs = [
    { id: 'bankruptcy', name: '26.1 Bankruptcy', key: 'bankruptcy' as Section26SubsectionKey },
    { id: 'gamblingAndTax', name: '26.2 Gambling + Tax', key: 'gamblingAndTax' as Section26SubsectionKey },
    { id: 'creditViolations', name: '26.3 Credit Violations', key: 'creditCardViolations' as Section26SubsectionKey },
    { id: 'creditCounseling', name: '26.4 Credit Counseling', key: 'creditCounseling' as Section26SubsectionKey },
    { id: 'creditCounselingActual', name: '26.5 Credit Counseling (Actual)', key: 'creditCounselingActual' as Section26SubsectionKey },
    { id: 'obligations', name: '26.6 Financial Obligations', key: 'financialObligations' as Section26SubsectionKey },
    { id: 'problems', name: '26.7 Financial Problems', key: 'financialProblems' as Section26SubsectionKey },
    { id: 'continuation1', name: '26.8 Problems Continuation', key: 'financialProblemsContinuation1' as Section26SubsectionKey },
    { id: 'continuation2', name: '26.9 Problems Continuation', key: 'financialProblemsContinuation2' as Section26SubsectionKey },
  ];

  return (
    <div className={`section26-component bg-white rounded-lg shadow-lg p-6 ${className}`}>
      {/* Header */}
      <div className="section-header mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Section 26: Financial Record
        </h2>
        <p className="text-gray-600 mb-4">
          In this section you will be asked to provide information about your financial record.
          You will be asked questions about bankruptcy, gambling, tax delinquencies, credit card violations,
          credit counseling, financial obligations, and various financial problems.
        </p>

        {/* Status Summary */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <h3 className="text-sm font-semibold text-blue-900 mb-2">Financial Record Summary</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-blue-700">Any Financial Issues:</span>
              <span className={`ml-2 font-medium ${financialSummary.hasAnyIssues ? 'text-red-600' : 'text-green-600'}`}>
                {financialSummary.hasAnyIssues ? 'Yes' : 'No'}
              </span>
            </div>
            <div>
              <span className="text-blue-700">Total Entries:</span>
              <span className="ml-2 font-medium text-blue-900">{financialSummary.totalEntries}</span>
            </div>
          </div>
        </div>

        {/* Validation Errors */}
        {errors.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <h4 className="text-red-800 font-medium mb-2">Please address the following issues:</h4>
            <ul className="list-disc list-inside text-red-700 text-sm space-y-1">
              {errors.map((error, index) => (
                <li key={index}>{error.message}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Navigation Tabs */}
      <div className="section-navigation mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 overflow-x-auto">
            {subsectionTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.name}
                {getEntryCount(tab.key) > 0 && (
                  <span className="ml-2 bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded-full">
                    {getEntryCount(tab.key)}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Form Content */}
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Subsection Content */}
        <div className="subsection-content">
          {activeTab === 'bankruptcy' && (
            <BankruptcySubsection
              sectionData={sectionData}
              onFlagChange={handleSubsectionFlagChange}
              onAddEntry={addBankruptcyEntry}
              entryCount={getEntryCount('bankruptcy')}
            />
          )}

          {activeTab === 'gamblingAndTax' && (
            <GamblingAndTaxSubsection
              sectionData={sectionData}
              onFlagChange={handleSubsectionFlagChange}
              onAddGamblingEntry={addGamblingEntry}
              onAddTaxEntry={addTaxDelinquencyEntry}
              entryCount={getEntryCount('gamblingAndTax')}
            />
          )}

          {activeTab === 'creditViolations' && (
            <CreditViolationsSubsection
              sectionData={sectionData}
              onFlagChange={handleSubsectionFlagChange}
              onAddEntry={addCreditCardViolationEntry}
              entryCount={getEntryCount('creditCardViolations')}
            />
          )}

          {activeTab === 'creditCounseling' && (
            <CreditCounselingSubsection
              sectionData={sectionData}
              onFlagChange={handleSubsectionFlagChange}
              onAddEntry={addCreditCounselingEntry}
              entryCount={getEntryCount('creditCounseling')}
            />
          )}

          {activeTab === 'creditCounselingActual' && (
            <CreditCounselingActualSubsection
              sectionData={sectionData}
              onFlagChange={handleSubsectionFlagChange}
              onAddEntry={addCreditCounselingActualEntry}
              entryCount={getEntryCount('creditCounselingActual')}
            />
          )}

          {activeTab === 'obligations' && (
            <FinancialObligationsSubsection
              sectionData={sectionData}
              onFlagChange={handleSubsectionFlagChange}
              onSpecificFlagChange={handleFinancialObligationsFlagChange}
            />
          )}

          {activeTab === 'problems' && (
            <FinancialProblemsSubsection
              sectionData={sectionData}
              onFlagChange={handleSubsectionFlagChange}
              onSpecificFlagChange={handleFinancialProblemsFlagChange}
            />
          )}

          {activeTab === 'continuation1' && (
            <FinancialProblemsContinuation1Subsection
              sectionData={sectionData}
              onFlagChange={handleSubsectionFlagChange}
              onAddEntry={addContinuation1Entry}
              entryCount={getEntryCount('financialProblemsContinuation1')}
            />
          )}

          {activeTab === 'continuation2' && (
            <FinancialProblemsContinuation2Subsection
              sectionData={sectionData}
              onFlagChange={handleSubsectionFlagChange}
              onAddEntry={addContinuation2Entry}
              entryCount={getEntryCount('financialProblemsContinuation2')}
            />
          )}
        </div>

        {/* Form Actions */}
        {showNavigation && (
          <div className="form-actions flex justify-between items-center pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={handleReset}
              className="px-4 py-2 text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
            >
              Reset Section
            </button>

            <div className="flex space-x-4">
              <div className="text-sm text-gray-500">
                {isDirty && <span className="text-orange-500">● Unsaved changes</span>}
                {isValid ? (
                  <span className="text-green-600 ml-2">✓ Valid</span>
                ) : (
                  <span className="text-red-600 ml-2">⚠ Needs attention</span>
                )}
              </div>

              <button
                type="submit"
                disabled={!isDirty && isValid}
                className={`px-6 py-2 rounded-md font-medium transition-colors ${
                  isValid
                    ? 'bg-green-600 text-white hover:bg-green-700'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {isValid ? 'Save & Continue' : 'Save Progress'}
              </button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
};

// ============================================================================
// SUBSECTION COMPONENTS
// ============================================================================

/**
 * Bankruptcy Subsection Component
 */
const BankruptcySubsection: React.FC<{
  sectionData: any;
  onFlagChange: (key: Section26SubsectionKey, value: "YES" | "NO") => void;
  onAddEntry: () => void;
  entryCount: number;
}> = ({ sectionData, onFlagChange, onAddEntry, entryCount }) => {
  const hasBankruptcyFilings = sectionData.section26.bankruptcy.hasBankruptcyFilings.value;

  return (
    <div className="subsection bankruptcy-subsection">
      <SubsectionQuestion
        subsectionKey="bankruptcy"
        title="26.1 Bankruptcy"
        description="In the last seven (7) years have you filed a petition under any chapter of the bankruptcy code?"
        hasValue={hasBankruptcyFilings}
        onValueChange={onFlagChange}
        showEntries={hasBankruptcyFilings === "YES"}
        entryCount={entryCount}
        onAddEntry={onAddEntry}
      >
        {hasBankruptcyFilings === "YES" && entryCount === 0 && (
          <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-yellow-800 text-sm">
              Please add at least one bankruptcy entry to provide details about your bankruptcy filing(s).
            </p>
          </div>
        )}
      </SubsectionQuestion>
    </div>
  );
};

/**
 * Combined Gambling and Tax Delinquency Subsection Component (26.2)
 * Based on Section26_2[0] in reference data which contains both gambling and tax fields
 */
const GamblingAndTaxSubsection: React.FC<{
  sectionData: any;
  onFlagChange: (key: Section26SubsectionKey, value: "YES" | "NO") => void;
  onAddGamblingEntry: () => void;
  onAddTaxEntry: () => void;
  entryCount: number;
}> = ({ sectionData, onFlagChange, onAddGamblingEntry, onAddTaxEntry, entryCount }) => {
  const gamblingAndTax = sectionData.section26.gamblingAndTax;
  const hasGamblingProblems = gamblingAndTax.hasGamblingProblems.value;
  const hasTaxDelinquencies = gamblingAndTax.hasTaxDelinquencies.value;

  return (
    <div className="subsection gambling-and-tax-subsection">
      <h3 className="text-lg font-semibold text-gray-900 mb-6">26.2 Gambling and Tax Delinquency</h3>
      <div className="space-y-8">

        {/* Gambling Problems */}
        <SubsectionQuestion
          subsectionKey="gamblingAndTax"
          title="26.2.1 Gambling Problems"
          description="In the last seven (7) years, have you experienced financial problems due to gambling?"
          hasValue={hasGamblingProblems}
          onValueChange={(_, value) => {
            // Update gambling flag specifically
            onFlagChange('gamblingAndTax', value);
          }}
          showEntries={hasGamblingProblems === "YES"}
          entryCount={gamblingAndTax.gamblingEntriesCount}
          onAddEntry={onAddGamblingEntry}
        >
          {hasGamblingProblems === "YES" && gamblingAndTax.gamblingEntriesCount === 0 && (
            <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-yellow-800 text-sm">
                Please add at least one gambling entry to provide details about your gambling-related financial problems.
              </p>
            </div>
          )}
        </SubsectionQuestion>

        {/* Tax Delinquency */}
        <SubsectionQuestion
          subsectionKey="gamblingAndTax"
          title="26.2.2 Tax Delinquency"
          description="In the last seven (7) years, have you failed to file or pay Federal, state, or other taxes when required by law or ordinance?"
          hasValue={hasTaxDelinquencies}
          onValueChange={(_, value) => {
            // Update tax flag specifically
            onFlagChange('gamblingAndTax', value);
          }}
          showEntries={hasTaxDelinquencies === "YES"}
          entryCount={gamblingAndTax.taxDelinquencyEntriesCount}
          onAddEntry={onAddTaxEntry}
        >
          {hasTaxDelinquencies === "YES" && gamblingAndTax.taxDelinquencyEntriesCount === 0 && (
            <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-yellow-800 text-sm">
                Please add at least one tax delinquency entry to provide details about your tax-related issues.
              </p>
            </div>
          )}
        </SubsectionQuestion>

        {/* Summary */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-medium text-blue-900 mb-2">Section 26.2 Summary</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-blue-700">Gambling Entries:</span>
              <span className="ml-2 font-medium text-blue-900">{gamblingAndTax.gamblingEntriesCount}</span>
            </div>
            <div>
              <span className="text-blue-700">Tax Entries:</span>
              <span className="ml-2 font-medium text-blue-900">{gamblingAndTax.taxDelinquencyEntriesCount}</span>
            </div>
            <div>
              <span className="text-blue-700">Total Entries:</span>
              <span className="ml-2 font-medium text-blue-900">{gamblingAndTax.totalEntriesCount}</span>
            </div>
            <div>
              <span className="text-blue-700">Any Issues:</span>
              <span className={`ml-2 font-medium ${
                hasGamblingProblems === "YES" || hasTaxDelinquencies === "YES"
                  ? 'text-red-600' : 'text-green-600'
              }`}>
                {hasGamblingProblems === "YES" || hasTaxDelinquencies === "YES" ? 'Yes' : 'No'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * Credit Counseling Actual Subsection Component (26.5)
 * Based on Section26_3[0] in reference data - the actual credit counseling implementation
 */
const CreditCounselingActualSubsection: React.FC<{
  sectionData: any;
  onFlagChange: (key: Section26SubsectionKey, value: "YES" | "NO") => void;
  onAddEntry: () => void;
  entryCount: number;
}> = ({ sectionData, onFlagChange, onAddEntry, entryCount }) => {
  const isUtilizingCreditCounseling = sectionData.section26.creditCounselingActual.isUtilizingCreditCounseling.value;

  return (
    <div className="subsection credit-counseling-actual-subsection">
      <SubsectionQuestion
        subsectionKey="creditCounselingActual"
        title="26.5 Credit Counseling (Actual Implementation)"
        description="Are you currently utilizing or seeking credit counseling for the control of your finances? This section contains the actual 46 fields from the reference data."
        hasValue={isUtilizingCreditCounseling}
        onValueChange={onFlagChange}
        showEntries={isUtilizingCreditCounseling === "YES"}
        entryCount={entryCount}
        onAddEntry={onAddEntry}
      >
        {isUtilizingCreditCounseling === "YES" && entryCount === 0 && (
          <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-yellow-800 text-sm">
              Please add at least one credit counseling entry to provide details about your credit counseling services.
            </p>
          </div>
        )}

        <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-blue-800 text-sm">
            <strong>Note:</strong> This is the actual credit counseling section based on Section26_3[0] from the reference data,
            containing 46 fields. Sections 26.3 and 26.4 are missing from the reference data.
          </p>
        </div>
      </SubsectionQuestion>
    </div>
  );
};

/**
 * Credit Violations Subsection Component
 */
const CreditViolationsSubsection: React.FC<{
  sectionData: any;
  onFlagChange: (key: Section26SubsectionKey, value: "YES" | "NO") => void;
  onAddEntry: () => void;
  entryCount: number;
}> = ({ sectionData, onFlagChange, onAddEntry, entryCount }) => {
  const hasCreditCardViolations = sectionData.section26.creditCardViolations.hasCreditCardViolations.value;

  return (
    <div className="subsection credit-violations-subsection">
      <SubsectionQuestion
        subsectionKey="creditCardViolations"
        title="26.4 Employment Credit Card Violations"
        description="In the last seven (7) years, have you had any account or credit card suspended, charged off, or cancelled for failing to pay as agreed?"
        hasValue={hasCreditCardViolations}
        onValueChange={onFlagChange}
        showEntries={hasCreditCardViolations === "YES"}
        entryCount={entryCount}
        onAddEntry={onAddEntry}
      >
        {hasCreditCardViolations === "YES" && entryCount === 0 && (
          <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-yellow-800 text-sm">
              Please add at least one credit card violation entry to provide details.
            </p>
          </div>
        )}
      </SubsectionQuestion>
    </div>
  );
};

/**
 * Credit Counseling Subsection Component
 */
const CreditCounselingSubsection: React.FC<{
  sectionData: any;
  onFlagChange: (key: Section26SubsectionKey, value: "YES" | "NO") => void;
  onAddEntry: () => void;
  entryCount: number;
}> = ({ sectionData, onFlagChange, onAddEntry, entryCount }) => {
  const isUtilizingCreditCounseling = sectionData.section26.creditCounseling.isUtilizingCreditCounseling.value;

  return (
    <div className="subsection credit-counseling-subsection">
      <SubsectionQuestion
        subsectionKey="creditCounseling"
        title="26.5 Credit Counseling"
        description="Are you currently utilizing or seeking credit counseling for the control of your finances?"
        hasValue={isUtilizingCreditCounseling}
        onValueChange={onFlagChange}
        showEntries={isUtilizingCreditCounseling === "YES"}
        entryCount={entryCount}
        onAddEntry={onAddEntry}
      >
        {isUtilizingCreditCounseling === "YES" && entryCount === 0 && (
          <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-yellow-800 text-sm">
              Please add at least one credit counseling entry to provide details about your credit counseling services.
            </p>
          </div>
        )}
      </SubsectionQuestion>
    </div>
  );
};

/**
 * Financial Obligations Subsection Component
 */
const FinancialObligationsSubsection: React.FC<{
  sectionData: any;
  onFlagChange: (key: Section26SubsectionKey, value: "YES" | "NO") => void;
  onSpecificFlagChange: (flagType: 'alimony' | 'judgments' | 'liens' | 'federalDebt', value: "YES" | "NO") => void;
}> = ({ sectionData, onFlagChange, onSpecificFlagChange }) => {
  const obligations = sectionData.section26.financialObligations;

  return (
    <div className="subsection financial-obligations-subsection">
      <h3 className="text-lg font-semibold text-gray-900 mb-6">26.6 Financial Obligations</h3>
      <div className="space-y-8">

        {/* 26.6.1 - Alimony/Child Support Delinquencies */}
        <SubsectionQuestion
          subsectionKey="financialObligations"
          title="26.6.1 Alimony/Child Support Delinquencies"
          description="In the last seven (7) years, have you been over 120 days delinquent on any debt including alimony or child support?"
          hasValue={obligations.hasAlimonyChildSupportDelinquencies.value}
          onValueChange={(_, value) => onSpecificFlagChange('alimony', value)}
          showEntries={obligations.hasAlimonyChildSupportDelinquencies.value === "YES"}
          entryCount={obligations.alimonyChildSupportEntries.length}
          onAddEntry={addAlimonyChildSupportEntry}
        >
          {obligations.hasAlimonyChildSupportDelinquencies.value === "YES" && obligations.alimonyChildSupportEntries.length === 0 && (
            <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-yellow-800 text-sm">
                Please add at least one alimony/child support entry to provide details.
              </p>
            </div>
          )}
        </SubsectionQuestion>

        {/* 26.6.2 - Judgments */}
        <SubsectionQuestion
          subsectionKey="financialObligations"
          title="26.6.2 Judgments"
          description="In the last seven (7) years, have you had a judgment entered against you?"
          hasValue={obligations.hasJudgments.value}
          onValueChange={(_, value) => onSpecificFlagChange('judgments', value)}
          showEntries={obligations.hasJudgments.value === "YES"}
          entryCount={obligations.judgmentEntries.length}
          onAddEntry={addJudgmentEntry}
        >
          {obligations.hasJudgments.value === "YES" && obligations.judgmentEntries.length === 0 && (
            <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-yellow-800 text-sm">
                Please add at least one judgment entry to provide details.
              </p>
            </div>
          )}
        </SubsectionQuestion>

        {/* 26.6.3 - Liens */}
        <SubsectionQuestion
          subsectionKey="financialObligations"
          title="26.6.3 Liens"
          description="In the last seven (7) years, have you had a lien placed against your property for failing to pay taxes or other debts?"
          hasValue={obligations.hasLiens.value}
          onValueChange={(_, value) => onSpecificFlagChange('liens', value)}
          showEntries={obligations.hasLiens.value === "YES"}
          entryCount={obligations.lienEntries.length}
          onAddEntry={addLienEntry}
        >
          {obligations.hasLiens.value === "YES" && obligations.lienEntries.length === 0 && (
            <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-yellow-800 text-sm">
                Please add at least one lien entry to provide details.
              </p>
            </div>
          )}
        </SubsectionQuestion>

        {/* 26.6.4 - Federal Debt */}
        <SubsectionQuestion
          subsectionKey="financialObligations"
          title="26.6.4 Federal Debt"
          description="In the last seven (7) years, have you been over 120 days delinquent on any debt owed to the Federal government?"
          hasValue={obligations.hasFederalDebt.value}
          onValueChange={(_, value) => onSpecificFlagChange('federalDebt', value)}
          showEntries={obligations.hasFederalDebt.value === "YES"}
          entryCount={obligations.federalDebtEntries.length}
          onAddEntry={addFederalDebtEntry}
        >
          {obligations.hasFederalDebt.value === "YES" && obligations.federalDebtEntries.length === 0 && (
            <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-yellow-800 text-sm">
                Please add at least one federal debt entry to provide details.
              </p>
            </div>
          )}
        </SubsectionQuestion>

        {/* Summary */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-medium text-blue-900 mb-2">Financial Obligations Summary</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-blue-700">Total Entries:</span>
              <span className="ml-2 font-medium text-blue-900">{obligations.totalEntriesCount}</span>
            </div>
            <div>
              <span className="text-blue-700">Any Issues:</span>
              <span className={`ml-2 font-medium ${
                obligations.hasAlimonyChildSupportDelinquencies.value === "YES" ||
                obligations.hasJudgments.value === "YES" ||
                obligations.hasLiens.value === "YES" ||
                obligations.hasFederalDebt.value === "YES"
                  ? 'text-red-600' : 'text-green-600'
              }`}>
                {obligations.hasAlimonyChildSupportDelinquencies.value === "YES" ||
                 obligations.hasJudgments.value === "YES" ||
                 obligations.hasLiens.value === "YES" ||
                 obligations.hasFederalDebt.value === "YES" ? 'Yes' : 'No'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * Financial Problems Subsection Component
 */
const FinancialProblemsSubsection: React.FC<{
  sectionData: any;
  onFlagChange: (key: Section26SubsectionKey, value: "YES" | "NO") => void;
  onSpecificFlagChange: (flagType: 'foreclosures' | 'defaults' | 'collections' | 'suspended' | 'evictions' | 'garnishments' | 'pastDelinquencies' | 'currentDelinquencies', value: "YES" | "NO") => void;
}> = ({ sectionData, onFlagChange, onSpecificFlagChange }) => {
  const problems = sectionData.section26.financialProblems;

  return (
    <div className="subsection financial-problems-subsection">
      <h3 className="text-lg font-semibold text-gray-900 mb-6">26.7 Financial Problems</h3>
      <div className="space-y-6">

        {/* 26.7.1 - Foreclosures/Repossessions */}
        <SubsectionQuestion
          subsectionKey="financialProblems"
          title="26.7.1 Foreclosures/Repossessions"
          description="In the last seven (7) years, have you had any possessions or property voluntarily or involuntarily repossessed or foreclosed?"
          hasValue={problems.hasForeclosuresRepossessions.value}
          onValueChange={(_, value) => onSpecificFlagChange('foreclosures', value)}
          showEntries={problems.hasForeclosuresRepossessions.value === "YES"}
          entryCount={problems.foreclosureRepossessionEntries.length}
          onAddEntry={addForeclosureRepossessionEntry}
        />

        {/* 26.7.2 - Defaults */}
        <SubsectionQuestion
          subsectionKey="financialProblems"
          title="26.7.2 Defaults"
          description="In the last seven (7) years, have you defaulted on any type of loan?"
          hasValue={problems.hasDefaults.value}
          onValueChange={(_, value) => onSpecificFlagChange('defaults', value)}
          showEntries={problems.hasDefaults.value === "YES"}
          entryCount={problems.defaultEntries.length}
          onAddEntry={addDefaultEntry}
        />

        {/* 26.7.3 - Collections */}
        <SubsectionQuestion
          subsectionKey="financialProblems"
          title="26.7.3 Collections"
          description="In the last seven (7) years, have you had bills or debts turned over to a collection agency?"
          hasValue={problems.hasCollections.value}
          onValueChange={(_, value) => onSpecificFlagChange('collections', value)}
          showEntries={problems.hasCollections.value === "YES"}
          entryCount={problems.collectionEntries.length}
          onAddEntry={addCollectionEntry}
        />

        {/* 26.7.4 - Suspended/Cancelled Accounts */}
        <SubsectionQuestion
          subsectionKey="financialProblems"
          title="26.7.4 Suspended/Cancelled Accounts"
          description="In the last seven (7) years, have you had any account or credit card suspended, charged off, or cancelled for failing to pay as agreed?"
          hasValue={problems.hasSuspendedAccounts.value}
          onValueChange={(_, value) => onSpecificFlagChange('suspended', value)}
          showEntries={problems.hasSuspendedAccounts.value === "YES"}
          entryCount={problems.suspendedAccountEntries.length}
          onAddEntry={addSuspendedAccountEntry}
        />

        {/* 26.7.5 - Evictions */}
        <SubsectionQuestion
          subsectionKey="financialProblems"
          title="26.7.5 Evictions"
          description="In the last seven (7) years, have you been evicted for non-payment?"
          hasValue={problems.hasEvictions.value}
          onValueChange={(_, value) => onSpecificFlagChange('evictions', value)}
          showEntries={problems.hasEvictions.value === "YES"}
          entryCount={problems.evictionEntries.length}
          onAddEntry={addEvictionEntry}
        />

        {/* 26.7.6 - Garnishments */}
        <SubsectionQuestion
          subsectionKey="financialProblems"
          title="26.7.6 Garnishments"
          description="In the last seven (7) years, have you had your wages, benefits, or assets garnished or attached for any debt?"
          hasValue={problems.hasGarnishments.value}
          onValueChange={(_, value) => onSpecificFlagChange('garnishments', value)}
          showEntries={problems.hasGarnishments.value === "YES"}
          entryCount={problems.garnishmentEntries.length}
          onAddEntry={addGarnishmentEntry}
        />

        {/* 26.7.7 - Past Delinquencies */}
        <SubsectionQuestion
          subsectionKey="financialProblems"
          title="26.7.7 Past Delinquencies (120+ days)"
          description="In the last seven (7) years, have you been over 120 days delinquent on any debt not previously entered?"
          hasValue={problems.hasPastDelinquencies.value}
          onValueChange={(_, value) => onSpecificFlagChange('pastDelinquencies', value)}
          showEntries={problems.hasPastDelinquencies.value === "YES"}
          entryCount={problems.pastDelinquencyEntries.length}
          onAddEntry={() => addDelinquencyEntry('past')}
        />

        {/* 26.7.8 - Current Delinquencies */}
        <SubsectionQuestion
          subsectionKey="financialProblems"
          title="26.7.8 Current Delinquencies (120+ days)"
          description="Are you currently over 120 days delinquent on any debt?"
          hasValue={problems.hasCurrentDelinquencies.value}
          onValueChange={(_, value) => onSpecificFlagChange('currentDelinquencies', value)}
          showEntries={problems.hasCurrentDelinquencies.value === "YES"}
          entryCount={problems.currentDelinquencyEntries.length}
          onAddEntry={() => addDelinquencyEntry('current')}
        />

        {/* Summary */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-medium text-blue-900 mb-2">Financial Problems Summary</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-blue-700">Total Entries:</span>
              <span className="ml-2 font-medium text-blue-900">{problems.totalEntriesCount}</span>
            </div>
            <div>
              <span className="text-blue-700">Any Issues:</span>
              <span className={`ml-2 font-medium ${
                problems.hasForeclosuresRepossessions.value === "YES" ||
                problems.hasDefaults.value === "YES" ||
                problems.hasCollections.value === "YES" ||
                problems.hasSuspendedAccounts.value === "YES" ||
                problems.hasEvictions.value === "YES" ||
                problems.hasGarnishments.value === "YES" ||
                problems.hasPastDelinquencies.value === "YES" ||
                problems.hasCurrentDelinquencies.value === "YES"
                  ? 'text-red-600' : 'text-green-600'
              }`}>
                {problems.hasForeclosuresRepossessions.value === "YES" ||
                 problems.hasDefaults.value === "YES" ||
                 problems.hasCollections.value === "YES" ||
                 problems.hasSuspendedAccounts.value === "YES" ||
                 problems.hasEvictions.value === "YES" ||
                 problems.hasGarnishments.value === "YES" ||
                 problems.hasPastDelinquencies.value === "YES" ||
                 problems.hasCurrentDelinquencies.value === "YES" ? 'Yes' : 'No'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * Financial Problems Continuation 1 Subsection Component (26.8)
 * Based on Section26_8[0] in reference data - continuation of 26.7 with checkboxes
 */
const FinancialProblemsContinuation1Subsection: React.FC<{
  sectionData: any;
  onFlagChange: (key: Section26SubsectionKey, value: "YES" | "NO") => void;
  onAddEntry: (entryType: string) => void;
  entryCount: number;
}> = ({ sectionData, onFlagChange, onAddEntry, entryCount }) => {
  const continuation = sectionData.section26.financialProblemsContinuation1;

  return (
    <div className="subsection financial-problems-continuation1-subsection">
      <h3 className="text-lg font-semibold text-gray-900 mb-6">26.8 Financial Problems Continuation</h3>
      <div className="space-y-6">

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <p className="text-blue-800 text-sm">
            <strong>Note:</strong> This section is a continuation of Section 26.7. Use the checkboxes below to indicate
            which types of financial problems from 26.7 you need to provide additional entries for, then add the
            corresponding entries.
          </p>
        </div>

        {/* Continuation Checkboxes */}
        <div className="grid grid-cols-2 gap-4">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={continuation.continuesForeclosuresRepossessions.value === "YES"}
              onChange={(e) => onFlagChange('financialProblemsContinuation1', e.target.checked ? "YES" : "NO")}
              className="mr-2 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-gray-700">Foreclosures/Repossessions</span>
          </label>

          <label className="flex items-center">
            <input
              type="checkbox"
              checked={continuation.continuesDefaults.value === "YES"}
              onChange={(e) => onFlagChange('financialProblemsContinuation1', e.target.checked ? "YES" : "NO")}
              className="mr-2 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-gray-700">Defaults</span>
          </label>

          <label className="flex items-center">
            <input
              type="checkbox"
              checked={continuation.continuesCollections.value === "YES"}
              onChange={(e) => onFlagChange('financialProblemsContinuation1', e.target.checked ? "YES" : "NO")}
              className="mr-2 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-gray-700">Collections</span>
          </label>

          <label className="flex items-center">
            <input
              type="checkbox"
              checked={continuation.continuesSuspendedAccounts.value === "YES"}
              onChange={(e) => onFlagChange('financialProblemsContinuation1', e.target.checked ? "YES" : "NO")}
              className="mr-2 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-gray-700">Suspended Accounts</span>
          </label>

          <label className="flex items-center">
            <input
              type="checkbox"
              checked={continuation.continuesEvictions.value === "YES"}
              onChange={(e) => onFlagChange('financialProblemsContinuation1', e.target.checked ? "YES" : "NO")}
              className="mr-2 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-gray-700">Evictions</span>
          </label>

          <label className="flex items-center">
            <input
              type="checkbox"
              checked={continuation.continuesGarnishments.value === "YES"}
              onChange={(e) => onFlagChange('financialProblemsContinuation1', e.target.checked ? "YES" : "NO")}
              className="mr-2 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-gray-700">Garnishments</span>
          </label>

          <label className="flex items-center">
            <input
              type="checkbox"
              checked={continuation.continuesPastDelinquencies.value === "YES"}
              onChange={(e) => onFlagChange('financialProblemsContinuation1', e.target.checked ? "YES" : "NO")}
              className="mr-2 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-gray-700">Past Delinquencies</span>
          </label>

          <label className="flex items-center">
            <input
              type="checkbox"
              checked={continuation.continuesCurrentDelinquencies.value === "YES"}
              onChange={(e) => onFlagChange('financialProblemsContinuation1', e.target.checked ? "YES" : "NO")}
              className="mr-2 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-gray-700">Current Delinquencies</span>
          </label>
        </div>

        {/* Entry Management Buttons */}
        <div className="grid grid-cols-2 gap-4 mt-6">
          <button
            type="button"
            onClick={() => onAddEntry('foreclosure')}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm"
          >
            Add Foreclosure Entry
          </button>
          <button
            type="button"
            onClick={() => onAddEntry('default')}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm"
          >
            Add Default Entry
          </button>
          <button
            type="button"
            onClick={() => onAddEntry('collection')}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm"
          >
            Add Collection Entry
          </button>
          <button
            type="button"
            onClick={() => onAddEntry('suspended')}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm"
          >
            Add Suspended Account Entry
          </button>
          <button
            type="button"
            onClick={() => onAddEntry('eviction')}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm"
          >
            Add Eviction Entry
          </button>
          <button
            type="button"
            onClick={() => onAddEntry('garnishment')}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm"
          >
            Add Garnishment Entry
          </button>
          <button
            type="button"
            onClick={() => onAddEntry('pastDelinquency')}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm"
          >
            Add Past Delinquency Entry
          </button>
          <button
            type="button"
            onClick={() => onAddEntry('currentDelinquency')}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm"
          >
            Add Current Delinquency Entry
          </button>
        </div>

        {/* Summary */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-medium text-blue-900 mb-2">Continuation Summary</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-blue-700">Total Additional Entries:</span>
              <span className="ml-2 font-medium text-blue-900">{entryCount}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * Financial Problems Continuation 2 Subsection Component (26.9)
 * Based on Section26_9[0] in reference data - second continuation of 26.7 with checkboxes
 */
const FinancialProblemsContinuation2Subsection: React.FC<{
  sectionData: any;
  onFlagChange: (key: Section26SubsectionKey, value: "YES" | "NO") => void;
  onAddEntry: (entryType: string) => void;
  entryCount: number;
}> = ({ sectionData, onFlagChange, onAddEntry, entryCount }) => {
  const continuation = sectionData.section26.financialProblemsContinuation2;

  return (
    <div className="subsection financial-problems-continuation2-subsection">
      <h3 className="text-lg font-semibold text-gray-900 mb-6">26.9 Financial Problems Continuation (Page 2)</h3>
      <div className="space-y-6">

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <p className="text-blue-800 text-sm">
            <strong>Note:</strong> This is the second continuation page for Section 26.7 financial problems.
            Use this section if you need even more space to document additional financial problems beyond what
            was provided in sections 26.7 and 26.8.
          </p>
        </div>

        {/* Similar checkbox structure as 26.8 but for continuation 2 */}
        <div className="grid grid-cols-2 gap-4">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={continuation.continuesForeclosuresRepossessions.value === "YES"}
              onChange={(e) => onFlagChange('financialProblemsContinuation2', e.target.checked ? "YES" : "NO")}
              className="mr-2 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-gray-700">More Foreclosures/Repossessions</span>
          </label>

          <label className="flex items-center">
            <input
              type="checkbox"
              checked={continuation.continuesDefaults.value === "YES"}
              onChange={(e) => onFlagChange('financialProblemsContinuation2', e.target.checked ? "YES" : "NO")}
              className="mr-2 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-gray-700">More Defaults</span>
          </label>

          <label className="flex items-center">
            <input
              type="checkbox"
              checked={continuation.continuesCollections.value === "YES"}
              onChange={(e) => onFlagChange('financialProblemsContinuation2', e.target.checked ? "YES" : "NO")}
              className="mr-2 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-gray-700">More Collections</span>
          </label>

          <label className="flex items-center">
            <input
              type="checkbox"
              checked={continuation.continuesSuspendedAccounts.value === "YES"}
              onChange={(e) => onFlagChange('financialProblemsContinuation2', e.target.checked ? "YES" : "NO")}
              className="mr-2 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-gray-700">More Suspended Accounts</span>
          </label>

          <label className="flex items-center">
            <input
              type="checkbox"
              checked={continuation.continuesEvictions.value === "YES"}
              onChange={(e) => onFlagChange('financialProblemsContinuation2', e.target.checked ? "YES" : "NO")}
              className="mr-2 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-gray-700">More Evictions</span>
          </label>

          <label className="flex items-center">
            <input
              type="checkbox"
              checked={continuation.continuesGarnishments.value === "YES"}
              onChange={(e) => onFlagChange('financialProblemsContinuation2', e.target.checked ? "YES" : "NO")}
              className="mr-2 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-gray-700">More Garnishments</span>
          </label>

          <label className="flex items-center">
            <input
              type="checkbox"
              checked={continuation.continuesPastDelinquencies.value === "YES"}
              onChange={(e) => onFlagChange('financialProblemsContinuation2', e.target.checked ? "YES" : "NO")}
              className="mr-2 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-gray-700">More Past Delinquencies</span>
          </label>

          <label className="flex items-center">
            <input
              type="checkbox"
              checked={continuation.continuesCurrentDelinquencies.value === "YES"}
              onChange={(e) => onFlagChange('financialProblemsContinuation2', e.target.checked ? "YES" : "NO")}
              className="mr-2 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-gray-700">More Current Delinquencies</span>
          </label>
        </div>

        {/* Entry Management Buttons */}
        <div className="grid grid-cols-2 gap-4 mt-6">
          <button
            type="button"
            onClick={() => onAddEntry('foreclosure')}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm"
          >
            Add More Foreclosure Entries
          </button>
          <button
            type="button"
            onClick={() => onAddEntry('default')}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm"
          >
            Add More Default Entries
          </button>
          <button
            type="button"
            onClick={() => onAddEntry('collection')}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm"
          >
            Add More Collection Entries
          </button>
          <button
            type="button"
            onClick={() => onAddEntry('suspended')}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm"
          >
            Add More Suspended Entries
          </button>
          <button
            type="button"
            onClick={() => onAddEntry('eviction')}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm"
          >
            Add More Eviction Entries
          </button>
          <button
            type="button"
            onClick={() => onAddEntry('garnishment')}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm"
          >
            Add More Garnishment Entries
          </button>
          <button
            type="button"
            onClick={() => onAddEntry('pastDelinquency')}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm"
          >
            Add More Past Delinquencies
          </button>
          <button
            type="button"
            onClick={() => onAddEntry('currentDelinquency')}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm"
          >
            Add More Current Delinquencies
          </button>
        </div>

        {/* Summary */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-medium text-blue-900 mb-2">Second Continuation Summary</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-blue-700">Total Additional Entries:</span>
              <span className="ml-2 font-medium text-blue-900">{entryCount}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * Reusable Subsection Question Component
 */
const SubsectionQuestion: React.FC<SubsectionQuestionProps> = ({
  subsectionKey,
  title,
  description,
  hasValue,
  onValueChange,
  showEntries = false,
  entryCount = 0,
  onAddEntry,
  children
}) => {
  return (
    <div className="subsection-question mb-6">
      <div className="question-header mb-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
        <p className="text-gray-700 mb-4">{description}</p>
      </div>

      {/* Yes/No Radio Buttons */}
      <div className="radio-group mb-4">
        <div className="flex space-x-6">
          <label className="flex items-center">
            <input
              type="radio"
              name={`${subsectionKey}-flag`}
              value="YES"
              checked={hasValue === "YES"}
              onChange={() => onValueChange(subsectionKey, "YES")}
              className="mr-2 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-gray-700">Yes</span>
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              name={`${subsectionKey}-flag`}
              value="NO"
              checked={hasValue === "NO"}
              onChange={() => onValueChange(subsectionKey, "NO")}
              className="mr-2 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-gray-700">No</span>
          </label>
        </div>
      </div>

      {/* Entry Management */}
      {showEntries && (
        <div className="entry-management mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h4 className="font-medium text-blue-900">Entries</h4>
              <p className="text-sm text-blue-700">
                Current entries: {entryCount}
              </p>
            </div>
            {onAddEntry && (
              <button
                type="button"
                onClick={onAddEntry}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm"
              >
                Add Entry
              </button>
            )}
          </div>

          {children}
        </div>
      )}
    </div>
  );
};

export default Section26Component;