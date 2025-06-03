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

  // Define subsection tabs
  const subsectionTabs = [
    { id: 'bankruptcy', name: '26.1 Bankruptcy', key: 'bankruptcy' as Section26SubsectionKey },
    { id: 'gambling', name: '26.2 Gambling', key: 'gambling' as Section26SubsectionKey },
    { id: 'taxes', name: '26.3 Tax Issues', key: 'taxDelinquency' as Section26SubsectionKey },
    { id: 'credit', name: '26.4 Credit Violations', key: 'creditCardViolations' as Section26SubsectionKey },
    { id: 'counseling', name: '26.5 Credit Counseling', key: 'creditCounseling' as Section26SubsectionKey },
    { id: 'obligations', name: '26.6 Financial Obligations', key: 'financialObligations' as Section26SubsectionKey },
    { id: 'problems', name: '26.7 Financial Problems', key: 'financialProblems' as Section26SubsectionKey },
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

          {activeTab === 'gambling' && (
            <GamblingSubsection
              sectionData={sectionData}
              onFlagChange={handleSubsectionFlagChange}
              onAddEntry={addGamblingEntry}
              entryCount={getEntryCount('gambling')}
            />
          )}

          {activeTab === 'taxes' && (
            <TaxDelinquencySubsection
              sectionData={sectionData}
              onFlagChange={handleSubsectionFlagChange}
              onAddEntry={addTaxDelinquencyEntry}
              entryCount={getEntryCount('taxDelinquency')}
            />
          )}

          {activeTab === 'credit' && (
            <CreditViolationsSubsection
              sectionData={sectionData}
              onFlagChange={handleSubsectionFlagChange}
              onAddEntry={addCreditCardViolationEntry}
              entryCount={getEntryCount('creditCardViolations')}
            />
          )}

          {activeTab === 'counseling' && (
            <CreditCounselingSubsection
              sectionData={sectionData}
              onFlagChange={handleSubsectionFlagChange}
              onAddEntry={addCreditCounselingEntry}
              entryCount={getEntryCount('creditCounseling')}
            />
          )}

          {activeTab === 'obligations' && (
            <FinancialObligationsSubsection
              sectionData={sectionData}
              onFlagChange={handleSubsectionFlagChange}
            />
          )}

          {activeTab === 'problems' && (
            <FinancialProblemsSubsection
              sectionData={sectionData}
              onFlagChange={handleSubsectionFlagChange}
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
 * Gambling Subsection Component
 */
const GamblingSubsection: React.FC<{
  sectionData: any;
  onFlagChange: (key: Section26SubsectionKey, value: "YES" | "NO") => void;
  onAddEntry: () => void;
  entryCount: number;
}> = ({ sectionData, onFlagChange, onAddEntry, entryCount }) => {
  const hasGamblingProblems = sectionData.section26.gambling.hasGamblingProblems.value;

  return (
    <div className="subsection gambling-subsection">
      <SubsectionQuestion
        subsectionKey="gambling"
        title="26.2 Gambling"
        description="In the last seven (7) years, have you experienced financial problems due to gambling?"
        hasValue={hasGamblingProblems}
        onValueChange={onFlagChange}
        showEntries={hasGamblingProblems === "YES"}
        entryCount={entryCount}
        onAddEntry={onAddEntry}
      >
        {hasGamblingProblems === "YES" && entryCount === 0 && (
          <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-yellow-800 text-sm">
              Please add at least one gambling entry to provide details about your gambling-related financial problems.
            </p>
          </div>
        )}
      </SubsectionQuestion>
    </div>
  );
};

/**
 * Tax Delinquency Subsection Component
 */
const TaxDelinquencySubsection: React.FC<{
  sectionData: any;
  onFlagChange: (key: Section26SubsectionKey, value: "YES" | "NO") => void;
  onAddEntry: () => void;
  entryCount: number;
}> = ({ sectionData, onFlagChange, onAddEntry, entryCount }) => {
  const hasTaxDelinquencies = sectionData.section26.taxDelinquency.hasTaxDelinquencies.value;

  return (
    <div className="subsection tax-delinquency-subsection">
      <SubsectionQuestion
        subsectionKey="taxDelinquency"
        title="26.3 Tax Delinquency"
        description="In the last seven (7) years, have you failed to file or pay Federal, state, or other taxes when required by law or ordinance?"
        hasValue={hasTaxDelinquencies}
        onValueChange={onFlagChange}
        showEntries={hasTaxDelinquencies === "YES"}
        entryCount={entryCount}
        onAddEntry={onAddEntry}
      >
        {hasTaxDelinquencies === "YES" && entryCount === 0 && (
          <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-yellow-800 text-sm">
              Please add at least one tax delinquency entry to provide details about your tax-related issues.
            </p>
          </div>
        )}
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
}> = ({ sectionData, onFlagChange }) => {
  return (
    <div className="subsection financial-obligations-subsection">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">26.6 Financial Obligations</h3>
      <div className="space-y-6">
        <div className="bg-gray-50 p-4 rounded-lg">
          <p className="text-gray-700 mb-4">
            This subsection covers various financial obligations including judgments, liens,
            alimony/child support, and federal debt. Implementation for individual sub-questions
            would be added here.
          </p>
          <p className="text-sm text-gray-500">
            Note: This is a complex subsection with multiple sub-parts that would require
            additional implementation for each specific obligation type.
          </p>
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
}> = ({ sectionData, onFlagChange }) => {
  return (
    <div className="subsection financial-problems-subsection">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">26.7 Financial Problems</h3>
      <div className="space-y-6">
        <div className="bg-gray-50 p-4 rounded-lg">
          <p className="text-gray-700 mb-4">
            This subsection covers various financial problems including foreclosures,
            repossessions, defaults, collections, suspended accounts, evictions,
            garnishments, and delinquencies. Implementation for individual sub-questions
            would be added here.
          </p>
          <p className="text-sm text-gray-500">
            Note: This is a complex subsection with multiple sub-parts that would require
            additional implementation for each specific problem type.
          </p>
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