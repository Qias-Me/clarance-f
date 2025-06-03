/**
 * Section 22: Police Record Component
 *
 * This component follows the established data flow pattern:
 * User Input → handleFieldChange → updateSection22Field → Section Context → SF86FormContext → IndexedDB
 *
 * Features:
 * - Criminal history subsections
 * - Domestic violence orders tracking
 * - Military and foreign court proceedings
 * - Dynamic entry management
 * - Validation integration
 * - PDF generation compatibility
 */

import React, { useState, useCallback } from 'react';
import { useSection22 } from '../../state/contexts/sections2.0/section22';
import { useSF86Form } from '../../state/contexts/SF86FormContext';
import type {
  Section22SubsectionKey,
  PoliceRecordEntry,
  DomesticViolenceOrderEntry,
  PoliceRecordType,
  CourtType,
  CaseStatus
} from '../../../api/interfaces/sections2.0/section22';

// ============================================================================
// POLICE RECORD SUBSECTION COMPONENT
// ============================================================================

interface PoliceRecordSubsectionProps {
  subsectionKey: Section22SubsectionKey;
  title: string;
  description: string;
  flagTypes: string[];
  isDomesticViolence?: boolean;
}

const PoliceRecordSubsection: React.FC<PoliceRecordSubsectionProps> = ({
  subsectionKey,
  title,
  description,
  flagTypes,
  isDomesticViolence = false
}) => {
  const section22 = useSection22();
  const sf86Form = useSF86Form();

  // Get subsection data
  const subsectionData = section22.sectionData?.section22?.[subsectionKey];
  const entries = subsectionData?.entries || [];

  // Get all flag values for this subsection
  const flagValues = flagTypes.reduce((acc, flagType) => {
    acc[flagType] = (subsectionData as any)?.[flagType]?.value || 'NO';
    return acc;
  }, {} as Record<string, 'YES' | 'NO'>);

  // Check if any flag is YES
  const hasAnyYes = Object.values(flagValues).some(value => value === 'YES');

  // Handle flag change (YES/NO)
  const handleFlagChange = useCallback((flagType: string, value: 'YES' | 'NO') => {
    // Follow the data flow: User Input → handleFieldChange → updateSection22Field
    section22.updateSubsectionFlag(subsectionKey, flagType, value);

    // Update in global form context
    sf86Form.updateSectionData('section22', section22.sectionData);
  }, [section22, subsectionKey, sf86Form]);

  // Handle field changes in entries
  const handleFieldChange = useCallback((entryIndex: number, fieldPath: string, newValue: any) => {
    // Follow the data flow pattern
    section22.updateEntryField(subsectionKey, entryIndex, fieldPath, newValue);

    // Update in global form context
    sf86Form.updateSectionData('section22', section22.sectionData);
  }, [section22, subsectionKey, sf86Form]);

  // Add new entry
  const handleAddEntry = useCallback(() => {
    section22.addEntry(subsectionKey);

    // Update in global form context
    sf86Form.updateSectionData('section22', section22.sectionData);
  }, [section22, subsectionKey, sf86Form]);

  // Remove entry
  const handleRemoveEntry = useCallback((entryIndex: number) => {
    section22.removeEntry(subsectionKey, entryIndex);

    // Update in global form context
    sf86Form.updateSectionData('section22', section22.sectionData);
  }, [section22, subsectionKey, sf86Form]);

  return (
    <div className="police-record-subsection border rounded-lg p-6 mb-6 bg-white shadow-sm">
      <div className="subsection-header mb-4">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        <p className="text-sm text-gray-600 mt-1">{description}</p>
      </div>

      {/* Flag Questions */}
      <div className="flag-questions space-y-4 mb-6">
        {flagTypes.map(flagType => {
          const questionText = getQuestionText(flagType);
          const fieldName = `${subsectionKey}_${flagType}`;

          return (
            <div key={flagType} className="flag-selection">
              <fieldset className="space-y-2">
                <legend className="text-sm font-medium text-gray-700">
                  {questionText}
                </legend>
                <div className="flex space-x-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name={fieldName}
                      value="NO"
                      checked={flagValues[flagType] === 'NO'}
                      onChange={() => handleFlagChange(flagType, 'NO')}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                    />
                    <span className="ml-2 text-sm text-gray-700">No</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name={fieldName}
                      value="YES"
                      checked={flagValues[flagType] === 'YES'}
                      onChange={() => handleFlagChange(flagType, 'YES')}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                    />
                    <span className="ml-2 text-sm text-gray-700">Yes</span>
                  </label>
                </div>
              </fieldset>
            </div>
          );
        })}
      </div>

      {/* Entry Forms (shown when any flag is YES) */}
      {hasAnyYes && (
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
              Add {isDomesticViolence ? 'Order' : 'Record'}
            </button>
          </div>

          {/* Entry List */}
          {entries.length === 0 ? (
            <div className="no-entries text-center py-8 text-gray-500">
              <p>No {title.toLowerCase()} entries yet.</p>
              <p className="text-sm">Click "Add {isDomesticViolence ? 'Order' : 'Record'}" to get started.</p>
            </div>
          ) : (
            <div className="entries-list space-y-4">
              {entries.map((entry: any, index: number) => (
                isDomesticViolence ? (
                  <DomesticViolenceOrderForm
                    key={entry._id?.value || index}
                    entry={entry}
                    entryIndex={index}
                    onFieldChange={(fieldPath, newValue) =>
                      handleFieldChange(index, fieldPath, newValue)
                    }
                    onRemove={() => handleRemoveEntry(index)}
                  />
                ) : (
                  <PoliceRecordEntryForm
                    key={entry._id?.value || index}
                    entry={entry}
                    entryIndex={index}
                    onFieldChange={(fieldPath, newValue) =>
                      handleFieldChange(index, fieldPath, newValue)
                    }
                    onRemove={() => handleRemoveEntry(index)}
                  />
                )
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// ============================================================================
// POLICE RECORD ENTRY FORM COMPONENT
// ============================================================================

interface PoliceRecordEntryFormProps {
  entry: PoliceRecordEntry;
  entryIndex: number;
  onFieldChange: (fieldPath: string, newValue: any) => void;
  onRemove: () => void;
}

const PoliceRecordEntryForm: React.FC<PoliceRecordEntryFormProps> = ({
  entry,
  entryIndex,
  onFieldChange,
  onRemove
}) => {
  return (
    <div className="entry-form border border-gray-200 rounded p-4 bg-gray-50">
      <div className="entry-header mb-3 flex justify-between items-center">
        <h5 className="text-sm font-medium text-gray-700">
          Police Record Entry #{entryIndex + 1}
        </h5>
        <button
          type="button"
          onClick={onRemove}
          className="px-2 py-1 text-xs text-red-600 border border-red-300 rounded hover:bg-red-50"
        >
          Remove Entry
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Record Type */}
        <div className="form-field">
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Type of Police Record *
          </label>
          <select
            value={entry.recordType?.value || ''}
            onChange={(e) => onFieldChange('recordType.value', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          >
            <option value="">Select record type...</option>
            <option value="summons_citation_ticket">Summons, Citation, or Ticket</option>
            <option value="arrest">Arrest</option>
            <option value="charged_convicted_sentenced">Charged, Convicted, or Sentenced</option>
            <option value="probation_parole">Probation or Parole</option>
            <option value="trial_awaiting_trial">Trial or Awaiting Trial</option>
            <option value="other">Other</option>
          </select>
        </div>

        {/* Offense Date */}
        <div className="form-field">
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Date of Offense *
          </label>
          <div className="space-y-2">
            <input
              type="date"
              value={entry.offenseDate?.date?.value || ''}
              onChange={(e) => onFieldChange('offenseDate.date.value', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            <label className="flex items-center text-xs text-gray-600">
              <input
                type="checkbox"
                checked={entry.offenseDate?.estimated?.value || false}
                onChange={(e) => onFieldChange('offenseDate.estimated.value', e.target.checked)}
                className="mr-1"
              />
              Date is estimated
            </label>
          </div>
        </div>

        {/* Offense Description */}
        <div className="form-field md:col-span-2">
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Description of Offense *
          </label>
          <textarea
            value={entry.offenseDescription?.value || ''}
            onChange={(e) => onFieldChange('offenseDescription.value', e.target.value)}
            placeholder="Provide a detailed description of the offense..."
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        {/* Specific Charges */}
        <div className="form-field md:col-span-2">
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Specific Charges
          </label>
          <input
            type="text"
            value={entry.specificCharges?.value || ''}
            onChange={(e) => onFieldChange('specificCharges.value', e.target.value)}
            placeholder="List specific charges if applicable..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Incident Location */}
        <div className="form-field md:col-span-2">
          <label className="block text-xs font-medium text-gray-700 mb-2">
            Location of Incident
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <input
              type="text"
              value={entry.incidentLocation?.street?.value || ''}
              onChange={(e) => onFieldChange('incidentLocation.street.value', e.target.value)}
              placeholder="Street address..."
              className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="text"
              value={entry.incidentLocation?.city?.value || ''}
              onChange={(e) => onFieldChange('incidentLocation.city.value', e.target.value)}
              placeholder="City..."
              className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="text"
              value={entry.incidentLocation?.state?.value || ''}
              onChange={(e) => onFieldChange('incidentLocation.state.value', e.target.value)}
              placeholder="State..."
              className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="text"
              value={entry.incidentLocation?.zipCode?.value || ''}
              onChange={(e) => onFieldChange('incidentLocation.zipCode.value', e.target.value)}
              placeholder="ZIP code..."
              className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Court Information */}
        <div className="form-field">
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Court Name
          </label>
          <input
            type="text"
            value={entry.courtName?.value || ''}
            onChange={(e) => onFieldChange('courtName.value', e.target.value)}
            placeholder="Name of court..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="form-field">
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Court Type
          </label>
          <select
            value={entry.courtType?.value || ''}
            onChange={(e) => onFieldChange('courtType.value', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select court type...</option>
            <option value="federal">Federal</option>
            <option value="state">State</option>
            <option value="local">Local</option>
            <option value="military">Military</option>
            <option value="non_us">Non-US</option>
            <option value="traffic">Traffic</option>
            <option value="criminal">Criminal</option>
            <option value="civil">Civil</option>
            <option value="other">Other</option>
          </select>
        </div>

        {/* Case Information */}
        <div className="form-field">
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Case Number
          </label>
          <input
            type="text"
            value={entry.caseNumber?.value || ''}
            onChange={(e) => onFieldChange('caseNumber.value', e.target.value)}
            placeholder="Case or docket number..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="form-field">
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Case Status
          </label>
          <select
            value={entry.caseStatus?.value || ''}
            onChange={(e) => onFieldChange('caseStatus.value', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select status...</option>
            <option value="pending">Pending</option>
            <option value="dismissed">Dismissed</option>
            <option value="convicted">Convicted</option>
            <option value="acquitted">Acquitted</option>
            <option value="plea_bargain">Plea Bargain</option>
            <option value="deferred">Deferred</option>
            <option value="completed">Completed</option>
            <option value="ongoing">Ongoing</option>
            <option value="other">Other</option>
          </select>
        </div>

        {/* Law Enforcement */}
        <div className="form-field">
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Arresting Agency
          </label>
          <input
            type="text"
            value={entry.arrestingAgency?.value || ''}
            onChange={(e) => onFieldChange('arrestingAgency.value', e.target.value)}
            placeholder="Name of arresting agency..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="form-field">
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Arresting Officer
          </label>
          <input
            type="text"
            value={entry.arrestingOfficer?.value || ''}
            onChange={(e) => onFieldChange('arrestingOfficer.value', e.target.value)}
            placeholder="Name of arresting officer..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Sentencing */}
        {entry.caseStatus?.value === 'convicted' && (
          <>
            <div className="form-field">
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Sentence
              </label>
              <textarea
                value={entry.sentence?.value || ''}
                onChange={(e) => onFieldChange('sentence.value', e.target.value)}
                placeholder="Description of sentence..."
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="form-field">
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Fine Amount
              </label>
              <input
                type="text"
                value={entry.fineAmount?.value || ''}
                onChange={(e) => onFieldChange('fineAmount.value', e.target.value)}
                placeholder="Amount of fine..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </>
        )}

        {/* Current Status Checkboxes */}
        <div className="form-field md:col-span-2">
          <label className="block text-xs font-medium text-gray-700 mb-2">
            Current Status
          </label>
          <div className="grid grid-cols-2 gap-2">
            <label className="flex items-center text-sm text-gray-700">
              <input
                type="checkbox"
                checked={entry.currentlyOnTrial?.value || false}
                onChange={(e) => onFieldChange('currentlyOnTrial.value', e.target.checked)}
                className="mr-2"
              />
              Currently on trial
            </label>
            <label className="flex items-center text-sm text-gray-700">
              <input
                type="checkbox"
                checked={entry.awaitingTrial?.value || false}
                onChange={(e) => onFieldChange('awaitingTrial.value', e.target.checked)}
                className="mr-2"
              />
              Awaiting trial
            </label>
            <label className="flex items-center text-sm text-gray-700">
              <input
                type="checkbox"
                checked={entry.currentlyOnProbation?.value || false}
                onChange={(e) => onFieldChange('currentlyOnProbation.value', e.target.checked)}
                className="mr-2"
              />
              Currently on probation
            </label>
            <label className="flex items-center text-sm text-gray-700">
              <input
                type="checkbox"
                checked={entry.currentlyOnParole?.value || false}
                onChange={(e) => onFieldChange('currentlyOnParole.value', e.target.checked)}
                className="mr-2"
              />
              Currently on parole
            </label>
          </div>
        </div>

        {/* Additional Details */}
        <div className="form-field md:col-span-2">
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Additional Details
          </label>
          <textarea
            value={entry.additionalDetails?.value || ''}
            onChange={(e) => onFieldChange('additionalDetails.value', e.target.value)}
            placeholder="Any additional relevant information..."
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// DOMESTIC VIOLENCE ORDER FORM COMPONENT
// ============================================================================

interface DomesticViolenceOrderFormProps {
  entry: DomesticViolenceOrderEntry;
  entryIndex: number;
  onFieldChange: (fieldPath: string, newValue: any) => void;
  onRemove: () => void;
}

const DomesticViolenceOrderForm: React.FC<DomesticViolenceOrderFormProps> = ({
  entry,
  entryIndex,
  onFieldChange,
  onRemove
}) => {
  return (
    <div className="entry-form border border-gray-200 rounded p-4 bg-gray-50">
      <div className="entry-header mb-3 flex justify-between items-center">
        <h5 className="text-sm font-medium text-gray-700">
          Domestic Violence Order #{entryIndex + 1}
        </h5>
        <button
          type="button"
          onClick={onRemove}
          className="px-2 py-1 text-xs text-red-600 border border-red-300 rounded hover:bg-red-50"
        >
          Remove Order
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Order Type */}
        <div className="form-field">
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Type of Order *
          </label>
          <input
            type="text"
            value={entry.orderType?.value || ''}
            onChange={(e) => onFieldChange('orderType.value', e.target.value)}
            placeholder="e.g., Restraining Order, Protection Order..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        {/* Order Date */}
        <div className="form-field">
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Date Order Issued *
          </label>
          <input
            type="date"
            value={entry.orderDate?.date?.value || ''}
            onChange={(e) => onFieldChange('orderDate.date.value', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        {/* Expiration Date */}
        <div className="form-field">
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Expiration Date
          </label>
          <input
            type="date"
            value={entry.expirationDate?.date?.value || ''}
            onChange={(e) => onFieldChange('expirationDate.date.value', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Currently Active */}
        <div className="form-field">
          <label className="flex items-center text-sm text-gray-700">
            <input
              type="checkbox"
              checked={entry.isCurrentlyActive?.value || false}
              onChange={(e) => onFieldChange('isCurrentlyActive.value', e.target.checked)}
              className="mr-2"
            />
            Order is currently active
          </label>
        </div>

        {/* Issuing Court */}
        <div className="form-field">
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Issuing Court *
          </label>
          <input
            type="text"
            value={entry.issuingCourt?.value || ''}
            onChange={(e) => onFieldChange('issuingCourt.value', e.target.value)}
            placeholder="Name of court that issued the order..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        {/* Protected Person Name */}
        <div className="form-field">
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Protected Person Name
          </label>
          <input
            type="text"
            value={entry.protectedPersonName?.value || ''}
            onChange={(e) => onFieldChange('protectedPersonName.value', e.target.value)}
            placeholder="Name of protected person..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Relationship */}
        <div className="form-field">
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Relationship to Protected Person
          </label>
          <input
            type="text"
            value={entry.protectedPersonRelationship?.value || ''}
            onChange={(e) => onFieldChange('protectedPersonRelationship.value', e.target.value)}
            placeholder="e.g., Spouse, Ex-spouse, Partner..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Order Status */}
        <div className="form-field">
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Order Status
          </label>
          <select
            value={entry.orderStatus?.value || ''}
            onChange={(e) => onFieldChange('orderStatus.value', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select status...</option>
            <option value="active">Active</option>
            <option value="expired">Expired</option>
            <option value="dismissed">Dismissed</option>
            <option value="modified">Modified</option>
            <option value="other">Other</option>
          </select>
        </div>

        {/* Order Restrictions */}
        <div className="form-field md:col-span-2">
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Order Restrictions
          </label>
          <textarea
            value={entry.orderRestrictions?.value || ''}
            onChange={(e) => onFieldChange('orderRestrictions.value', e.target.value)}
            placeholder="Describe the restrictions imposed by the order..."
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Violation History */}
        <div className="form-field md:col-span-2">
          <label className="flex items-center text-sm text-gray-700 mb-2">
            <input
              type="checkbox"
              checked={entry.violationHistory?.value || false}
              onChange={(e) => onFieldChange('violationHistory.value', e.target.checked)}
              className="mr-2"
            />
            Has there been any violation of this order?
          </label>
          {entry.violationHistory?.value && (
            <textarea
              value={entry.violationDetails?.value || ''}
              onChange={(e) => onFieldChange('violationDetails.value', e.target.value)}
              placeholder="Describe any violations of the order..."
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          )}
        </div>

        {/* Additional Notes */}
        <div className="form-field md:col-span-2">
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Additional Notes
          </label>
          <textarea
            value={entry.additionalNotes?.value || ''}
            onChange={(e) => onFieldChange('additionalNotes.value', e.target.value)}
            placeholder="Any additional relevant information..."
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get question text for flag types
 */
const getQuestionText = (flagType: string): string => {
  const questions: Record<string, string> = {
    hasSummonsOrCitation: "In the past seven (7) years, have you been issued a summons, citation, or ticket to appear in court in a criminal proceeding against you?",
    hasArrest: "In the past seven (7) years, have you been arrested by any police officer, sheriff, marshal or any other type of law enforcement official?",
    hasChargedOrConvicted: "In the past seven (7) years, have you been charged, convicted, or sentenced of a crime in any court?",
    hasProbationOrParole: "In the past seven (7) years, have you been or are you now on probation or parole?",
    hasCurrentTrial: "Are you currently on trial or awaiting a trial on criminal charges?",
    hasCurrentOrder: "In the past seven (7) years, have you been subject to a court order or restraining order; or have you been counseled, treated, or ordered to attend anger management, domestic violence, or family counseling as a result of domestic violence allegations?",
    hasMilitaryCourtProceedings: "EVER been subject to court proceedings under the Uniform Code of Military Justice (UCMJ)?",
    hasForeignCourtProceedings: "EVER been charged with an offense or subject to court proceedings in a foreign country?"
  };

  return questions[flagType] || flagType;
};

// ============================================================================
// MAIN SECTION 22 COMPONENT
// ============================================================================

const Section22Component: React.FC = () => {
  const section22 = useSection22();
  const sf86Form = useSF86Form();
  const [isLoading, setIsLoading] = useState(false);

  // Validation and submission
  const handleValidateAndContinue = useCallback(async () => {
    setIsLoading(true);

    try {
      // Validate section
      const validationResult = section22.validateSection();

      if (validationResult.isValid) {
        // Update global form data
        sf86Form.updateSectionData('section22', section22.sectionData);

        // Save form
        await sf86Form.saveForm();

        // Mark section as complete
        sf86Form.markSectionComplete('section22');

        console.log('✅ Section 22 validated and saved successfully');
      } else {
        console.warn('⚠️ Section 22 validation failed:', validationResult.errors);
      }
    } catch (error) {
      console.error('❌ Error validating Section 22:', error);
    } finally {
      setIsLoading(false);
    }
  }, [section22, sf86Form]);

  return (
    <div className="section22-component max-w-4xl mx-auto p-6">
      {/* Section Header */}
      <div className="section-header mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Section 22: Police Record
        </h1>
        <p className="text-gray-600">
          Report arrests, summons, citations, charges, convictions, court proceedings, probation,
          parole, domestic violence restraining orders, and other police record incidents.
        </p>

        {/* Important Notice */}
        <div className="notice mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <h3 className="text-sm font-medium text-yellow-800 mb-1">Important Note:</h3>
          <p className="text-sm text-yellow-700">
            You must report information regardless of whether the record in your case has been
            sealed, expunged, or otherwise stricken from the court record, or the charge was
            dismissed. You need not report traffic fines of $300 or less, unless the violation
            was alcohol or drug related.
          </p>
        </div>

        {/* Summary Stats */}
        <div className="stats-summary mt-4 p-4 bg-blue-50 rounded-lg">
          <div className="flex flex-wrap gap-4 text-sm">
            <div>
              <span className="font-medium">Total Police Record Entries:</span>
              <span className="ml-1 text-blue-600">
                {section22.getTotalPoliceRecordEntries()}
              </span>
            </div>
            <div>
              <span className="font-medium">Police Record Issues Reported:</span>
              <span className="ml-1">{section22.hasAnyPoliceRecordIssues() ? 'Yes' : 'None'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Police Record Subsections */}
      <div className="subsections">
        <PoliceRecordSubsection
          subsectionKey="criminalHistory"
          title="Criminal History"
          description="Criminal proceedings, arrests, charges, and convictions in the past 7 years"
          flagTypes={[
            'hasSummonsOrCitation',
            'hasArrest',
            'hasChargedOrConvicted',
            'hasProbationOrParole',
            'hasCurrentTrial'
          ]}
        />

        <PoliceRecordSubsection
          subsectionKey="domesticViolenceOrders"
          title="Domestic Violence Orders"
          description="Restraining orders and domestic violence related court orders"
          flagTypes={['hasCurrentOrder']}
          isDomesticViolence={true}
        />

        <PoliceRecordSubsection
          subsectionKey="militaryCourtProceedings"
          title="Military Court Proceedings"
          description="Proceedings under the Uniform Code of Military Justice (UCMJ)"
          flagTypes={['hasMilitaryCourtProceedings']}
        />

        <PoliceRecordSubsection
          subsectionKey="foreignCourtProceedings"
          title="Foreign Court Proceedings"
          description="Charges or court proceedings in foreign countries"
          flagTypes={['hasForeignCourtProceedings']}
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



export default Section22Component;