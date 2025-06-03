/**
 * Section 20: Financial Record Component
 *
 * This component follows the established data flow pattern:
 * User Input → handleFieldChange → updateSection20Field → Section Context → SF86FormContext → IndexedDB
 *
 * Features:
 * - Financial issue subsections (bankruptcy, liens, garnishments, etc.)
 * - Dynamic entry management
 * - Validation integration
 * - PDF generation compatibility
 */

import React, { useState, useCallback } from 'react';
import { useSection20 } from '../../state/contexts/sections2.0/section20';
import { useSF86Form } from '../../state/contexts/SF86FormContext';
import type {
  Section20SubsectionKey,
  Section20EntryType,
  FinancialIssueEntry,
  BankruptcyEntry,
  TaxDelinquencyEntry,
  CreditCounselingEntry
} from '../../../api/interfaces/sections2.0/section20';

// ============================================================================
// FINANCIAL SUBSECTION COMPONENT
// ============================================================================

interface FinancialSubsectionProps {
  subsectionKey: Section20SubsectionKey;
  title: string;
  description: string;
  entryType?: Section20EntryType;
}

const FinancialSubsection: React.FC<FinancialSubsectionProps> = ({
  subsectionKey,
  title,
  description,
  entryType = 'financial_issue'
}) => {
  const section20 = useSection20();
  const sf86Form = useSF86Form();

  // Get subsection data
  const subsectionData = section20.sectionData?.section20?.[subsectionKey];
  const hasFlag = subsectionData?.hasFlag?.value || 'NO';
  const entries = subsectionData?.entries || [];

  // Handle flag change (YES/NO)
  const handleFlagChange = useCallback((value: 'YES' | 'NO') => {
    // Follow the data flow: User Input → handleFieldChange → updateSection20Field
    section20.updateField(`section20.${subsectionKey}.hasFlag`, value);

    // Update in global form context
    sf86Form.updateSectionData('section20', section20.sectionData);
  }, [section20, subsectionKey, sf86Form]);

  // Handle field changes in entries
  const handleFieldChange = useCallback((entryIndex: number, fieldPath: string, newValue: any) => {
    // Follow the data flow pattern
    const fullFieldPath = `section20.${subsectionKey}.entries.${entryIndex}.${fieldPath}`;
    section20.updateField(fullFieldPath, newValue);

    // Update in global form context
    sf86Form.updateSectionData('section20', section20.sectionData);
  }, [section20, subsectionKey, sf86Form]);

  // Add new entry
  const handleAddEntry = useCallback(() => {
    // For now, we'll use the basic customActions approach
    section20.customActions.updateEntryField(
      subsectionKey,
      entries.length,
      'new_entry_marker',
      true
    );
  }, [section20, subsectionKey, entries.length]);

  return (
    <div className="financial-subsection border rounded-lg p-6 mb-6 bg-white shadow-sm">
      <div className="subsection-header mb-4">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        <p className="text-sm text-gray-600 mt-1">{description}</p>
      </div>

      {/* YES/NO Flag Selection */}
      <div className="flag-selection mb-4">
        <fieldset className="space-y-2">
          <legend className="text-sm font-medium text-gray-700">
            Do you have any {title.toLowerCase()} to report?
          </legend>
          <div className="flex space-x-4">
            <label className="flex items-center">
              <input
                type="radio"
                name={`${subsectionKey}_flag`}
                value="NO"
                checked={hasFlag === 'NO'}
                onChange={() => handleFlagChange('NO')}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
              />
              <span className="ml-2 text-sm text-gray-700">No</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name={`${subsectionKey}_flag`}
                value="YES"
                checked={hasFlag === 'YES'}
                onChange={() => handleFlagChange('YES')}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
              />
              <span className="ml-2 text-sm text-gray-700">Yes</span>
            </label>
          </div>
        </fieldset>
      </div>

      {/* Entry Forms (shown when YES is selected) */}
      {hasFlag === 'YES' && (
        <div className="entries-section">
          <div className="entries-header flex justify-between items-center mb-4">
            <h4 className="text-md font-medium text-gray-800">
              {title} Details ({entries.length} {entries.length === 1 ? 'entry' : 'entries'})
            </h4>
            <button
              type="button"
              onClick={handleAddEntry}
              className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Add {title}
            </button>
          </div>

          {/* Entry List */}
          {entries.length === 0 ? (
            <div className="no-entries text-center py-8 text-gray-500">
              <p>No {title.toLowerCase()} entries yet.</p>
              <p className="text-sm">Click "Add {title}" to get started.</p>
            </div>
          ) : (
            <div className="entries-list space-y-4">
              {entries.map((entry: any, index: number) => (
                <FinancialEntryForm
                  key={entry._id || index}
                  entry={entry}
                  entryIndex={index}
                  entryType={entryType}
                  onFieldChange={(fieldPath, newValue) =>
                    handleFieldChange(index, fieldPath, newValue)
                  }
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// ============================================================================
// FINANCIAL ENTRY FORM COMPONENT
// ============================================================================

interface FinancialEntryFormProps {
  entry: FinancialIssueEntry | BankruptcyEntry | TaxDelinquencyEntry | CreditCounselingEntry;
  entryIndex: number;
  entryType: Section20EntryType;
  onFieldChange: (fieldPath: string, newValue: any) => void;
}

const FinancialEntryForm: React.FC<FinancialEntryFormProps> = ({
  entry,
  entryIndex,
  entryType,
  onFieldChange
}) => {
  const section20 = useSection20();

  return (
    <div className="entry-form border border-gray-200 rounded p-4 bg-gray-50">
      <div className="entry-header mb-3">
        <h5 className="text-sm font-medium text-gray-700">
          Entry #{entryIndex + 1}
        </h5>
      </div>

      <div className="form-grid grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Description Field */}
        {'description' in entry && (
          <div className="form-field">
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Description *
            </label>
            <textarea
              value={entry.description?.value || ''}
              onChange={(e) => onFieldChange('description.value', e.target.value)}
              placeholder="Provide details about this financial issue..."
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
        )}

        {/* Amount Field */}
        {'amount' in entry && (
          <div className="form-field">
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Amount
            </label>
            <input
              type="text"
              value={entry.amount?.value || ''}
              onChange={(e) => onFieldChange('amount.value', e.target.value)}
              placeholder="$0.00"
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <div className="mt-1 text-xs text-gray-500">
              Formatted: {section20.formatCurrency(entry.amount?.value || '')}
            </div>
          </div>
        )}

        {/* Date Occurred Field */}
        {'dateOccurred' in entry && (
          <div className="form-field">
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Date Occurred *
            </label>
            <input
              type="date"
              value={entry.dateOccurred?.value || ''}
              onChange={(e) => onFieldChange('dateOccurred.value', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
        )}

        {/* Court/Agency Field */}
        {'courtOrAgency' in entry && (
          <div className="form-field">
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Court or Agency
            </label>
            <input
              type="text"
              value={entry.courtOrAgency?.value || ''}
              onChange={(e) => onFieldChange('courtOrAgency.value', e.target.value)}
              placeholder="Enter court or agency name..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        )}
      </div>

      {/* Entry-specific fields based on type */}
      {entryType === 'bankruptcy' && 'bankruptcyType' in entry && (
        <div className="bankruptcy-specific mt-4">
          <h6 className="text-xs font-medium text-gray-700 mb-2">Bankruptcy Details</h6>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="form-field">
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Bankruptcy Type
              </label>
              <select
                value={entry.bankruptcyType?.value || ''}
                onChange={(e) => onFieldChange('bankruptcyType.value', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select type...</option>
                <option value="chapter7">Chapter 7</option>
                <option value="chapter11">Chapter 11</option>
                <option value="chapter12">Chapter 12</option>
                <option value="chapter13">Chapter 13</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ============================================================================
// MAIN SECTION 20 COMPONENT
// ============================================================================

export const Section20Component: React.FC = () => {
  const section20 = useSection20();
  const sf86Form = useSF86Form();
  const [isLoading, setIsLoading] = useState(false);

  // Validation and submission
  const handleValidateAndContinue = useCallback(async () => {
    setIsLoading(true);

    try {
      // Validate section
      const validationResult = section20.validateSection();

      if (validationResult.isValid) {
        // Update global form data
        sf86Form.updateSectionData('section20', section20.sectionData);

        // Save form
        await sf86Form.saveForm();

        // Mark section as complete
        sf86Form.markSectionComplete('section20');

        console.log('✅ Section 20 validated and saved successfully');
      } else {
        console.warn('⚠️ Section 20 validation failed:', validationResult.errors);
      }
    } catch (error) {
      console.error('❌ Error validating Section 20:', error);
    } finally {
      setIsLoading(false);
    }
  }, [section20, sf86Form]);

  return (
    <div className="section20-component max-w-4xl mx-auto p-6">
      {/* Section Header */}
      <div className="section-header mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Section 20: Financial Record
        </h1>
        <p className="text-gray-600">
          Report any financial issues including bankruptcy, liens, judgments, garnishments,
          delinquent taxes, credit counseling, and other financial problems.
        </p>

        {/* Summary Stats */}
        <div className="stats-summary mt-4 p-4 bg-blue-50 rounded-lg">
          <div className="flex flex-wrap gap-4 text-sm">
            <div>
              <span className="font-medium">Total Financial Impact:</span>
              <span className="ml-1 text-green-600">
                {section20.formatCurrency(section20.getTotalFinancialImpact().toString())}
              </span>
            </div>
            <div>
              <span className="font-medium">Financial Issues Reported:</span>
              <span className="ml-1">{section20.hasAnyFinancialIssues() ? 'Yes' : 'None'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Financial Subsections */}
      <div className="subsections">
        <FinancialSubsection
          subsectionKey="bankruptcy"
          title="Bankruptcy"
          description="Have you ever filed a petition under any chapter of the bankruptcy code?"
          entryType="bankruptcy"
        />

        <FinancialSubsection
          subsectionKey="liensJudgments"
          title="Liens and Judgments"
          description="Have you had any property subject to a lien, judgment, or garnishment?"
        />

        <FinancialSubsection
          subsectionKey="garnishments"
          title="Garnishments"
          description="Have you had wages, salary, or assets garnished or attached for any debt?"
        />

        <FinancialSubsection
          subsectionKey="delinquentTaxes"
          title="Delinquent Taxes"
          description="Have you failed to file or pay federal, state, or other taxes when required?"
          entryType="tax_delinquency"
        />

        <FinancialSubsection
          subsectionKey="creditCounseling"
          title="Credit Counseling"
          description="Have you consulted with a credit counseling service or similar organization?"
          entryType="credit_counseling"
        />

        <FinancialSubsection
          subsectionKey="otherFinancialIssues"
          title="Other Financial Issues"
          description="Have you had any other financial issues not covered above?"
        />
      </div>

      {/* Form Actions */}
      <div className="form-actions mt-8 flex justify-between">
        <button
          type="button"
          className="px-6 py-2 text-gray-600 border border-gray-300 rounded hover:bg-gray-50"
        >
          Previous Section
        </button>

        <button
          type="button"
          onClick={handleValidateAndContinue}
          disabled={isLoading}
          className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Validating...' : 'Validate & Continue'}
        </button>
      </div>
    </div>
  );
};

export default Section20Component;