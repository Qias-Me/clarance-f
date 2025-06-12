/**
 * Section 11: Where You Have Lived Component
 *
 * React component for SF-86 Section 11 (Where You Have Lived) following the established
 * UI patterns and integrating with the Section11 context provider.
 */

import React, { useState, useCallback, useEffect } from 'react';
import { useSection11 } from '../../state/contexts/sections2.0/section11';
import type { ResidenceEntry } from '../../../api/interfaces/sections2.0/section11';
import { useSF86Form } from '~/state/contexts/sections2.0/SF86FormContext';

// ============================================================================
// TYPES
// ============================================================================

interface Section11ComponentProps {
  onNext?: () => void;
  onPrevious?: () => void;
  showNavigation?: boolean;
  onValidationChange?: (isValid: boolean) => void;
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const Section11Component: React.FC<Section11ComponentProps> = ({
  onNext,
  onPrevious,
  showNavigation = true,
  onValidationChange
}) => {
  const {
    section11Data,
    isLoading,
    errors,
    isDirty,
    addResidenceEntry,
    removeResidenceEntry,
    updateFieldValue,
    getEntryCount,
    validateSection,
    isResidenceHistoryComplete,
    getTotalResidenceTimespan,
    submitSectionData,
    hasPendingChanges
  } = useSection11();

  // SF86 Form Context for data persistence
  const sf86Form = useSF86Form();

  // Track validation state internally
  const [isValid, setIsValid] = useState(false);
  const [activeEntryIndex, setActiveEntryIndex] = useState(0);
  const [showValidation, setShowValidation] = useState(false);
  const [pendingNewEntry, setPendingNewEntry] = useState(false);

  // Use refs to prevent double execution issues
  const isAddingEntryRef = React.useRef(false);
  const lastEntryCountRef = React.useRef(0);

  // Maximum entries allowed for Section 11
  const MAX_ENTRIES = 4;

  // Track add calls to detect multiple invocations
  const addCallCountRef = React.useRef(0);

  // Handle validation on component mount and when data changes
  useEffect(() => {
    const validationResult = validateSection();
    setIsValid(validationResult.isValid);
    onValidationChange?.(validationResult.isValid);
  }, [section11Data, validateSection, onValidationChange]);

  // Track entry count changes for validation
  React.useEffect(() => {
    const currentCount = getEntryCount();
    lastEntryCountRef.current = currentCount;

    if (currentCount > MAX_ENTRIES) {
      // console.warn(`⚠️ Section 11: Entry count (${currentCount}) exceeds maximum (${MAX_ENTRIES})`);
    }
  }, [getEntryCount, section11Data.section11.residences.length]);

  // Handle setting active index to new entry after it's been added
  React.useEffect(() => {
    if (pendingNewEntry) {
      const currentCount = getEntryCount();
      const newEntryIndex = currentCount - 1; // Last entry is the new one
      setActiveEntryIndex(newEntryIndex);
      setPendingNewEntry(false);
      isAddingEntryRef.current = false; // Reset the adding flag
    }
  }, [pendingNewEntry, getEntryCount]);

  // ============================================================================
  // EVENT HANDLERS
  // ============================================================================

  const handleFieldChange = useCallback((fieldPath: string, value: any, entryIndex?: number) => {
    updateFieldValue(fieldPath, value, entryIndex);
  }, [updateFieldValue]);

  const handleAddResidence = useCallback(() => {
    // Prevent multiple rapid calls
    if (isAddingEntryRef.current) {
      return;
    }

    // Enforce maximum entry limit
    if (getEntryCount() >= MAX_ENTRIES) {
      return;
    }

    // Set flags to prevent duplicate calls and track new entry
    isAddingEntryRef.current = true;
    setPendingNewEntry(true);
    addResidenceEntry();

    // Fallback timeout to reset adding flag in case something goes wrong
    setTimeout(() => {
      isAddingEntryRef.current = false;
    }, 2000);
  }, [addResidenceEntry, getEntryCount]);

  const handleRemoveResidence = useCallback((index: number) => {
    if (getEntryCount() > 1) {
      removeResidenceEntry(index);
      if (activeEntryIndex >= index && activeEntryIndex > 0) {
        setActiveEntryIndex(activeEntryIndex - 1);
      }
    }
  }, [removeResidenceEntry, getEntryCount, activeEntryIndex]);

  // Handle submission with data persistence
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = validateSection();
    setIsValid(result.isValid);
    onValidationChange?.(result.isValid);

    // console.log('🔍 Section 11 validation result:', result);
    // console.log('📊 Section 11 data before submission:', section11Data);

    if (result.isValid) {
      try {
        // console.log('🔄 Section 11: Starting data synchronization...');

        // Update the central form context with Section 11 data and wait for synchronization
        sf86Form.updateSectionData('section11', section11Data);

        // console.log('✅ Section 11: Data synchronization complete, proceeding to save...');

        // Get the current form data and update it with section11 data for immediate saving
        const currentFormData = sf86Form.exportForm();
        const updatedFormData = { ...currentFormData, section11: section11Data };

        // Save the form data to persistence layer with the updated data
        await sf86Form.saveForm(updatedFormData);

        // Mark section as complete after successful save
        sf86Form.markSectionComplete('section11');

        // console.log('✅ Section 11 data saved successfully:', section11Data);

        // Proceed to next section if callback provided
        if (onNext) {
          onNext();
        }
      } catch (error) {
        // console.error('❌ Failed to save Section 11 data:', error);
        // Show an error message to user
        // console.log('There was an error saving your information. Please try again.');
      }
    }
  };

  // ============================================================================
  // RENDER FUNCTIONS
  // ============================================================================

  const renderResidenceEntry = (entry: ResidenceEntry, index: number) => {
    const isActive = index === activeEntryIndex;

    if (index >= MAX_ENTRIES) {
      // console.warn(`⚠️ Section 11: Attempting to render entry ${index} which exceeds maximum of ${MAX_ENTRIES}`);
    }

    return (
      <div key={index} className={`border border-gray-200 rounded-lg ${isActive ? 'ring-2 ring-blue-500 border-blue-500' : ''}`}>
        <div className="p-4 bg-gray-50 border-b border-gray-200 rounded-t-lg">
          <div className="flex justify-between items-center">
            <div>
              <h4 className="text-lg font-medium text-gray-900">
                Residence {index + 1}
                {index === 0 && <span className="ml-2 text-sm text-blue-600 font-normal">(Current)</span>}
              </h4>
              {entry.address.streetAddress.value && (
                <p className="text-sm text-gray-600 mt-1">
                  {entry.address.streetAddress.value}, {entry.address.city.value}
                  {entry.address.state.value && `, ${entry.address.state.value}`}
                </p>
              )}
            </div>
            <div className="flex space-x-2">
              <button
                type="button"
                onClick={() => setActiveEntryIndex(index)}
                className={`px-3 py-1 text-sm rounded-md transition-colors ${
                  isActive
                    ? 'bg-blue-100 text-blue-700 border border-blue-300'
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
              >
                {isActive ? 'Editing' : 'Edit'}
              </button>
              {getEntryCount() > 1 && (
                <button
                  type="button"
                  onClick={() => handleRemoveResidence(index)}
                  className="px-3 py-1 text-sm bg-red-100 text-red-700 border border-red-300 rounded-md hover:bg-red-200 transition-colors"
                >
                  Remove
                </button>
              )}
            </div>
          </div>
        </div>

        {isActive && (
          <div className="p-6 space-y-8">
            {renderAddressSection(entry, index)}
            {renderDateSection(entry, index)}
            {renderResidenceTypeSection(entry, index)}
            {renderContactPersonSection(entry, index)}
          </div>
        )}
      </div>
    );
  };

  const renderAddressSection = (entry: ResidenceEntry, index: number) => (
    <div className="space-y-4">
      <h5 className="text-lg font-medium text-gray-900 border-b border-gray-200 pb-2">
        Address Information
      </h5>

      {/* Street Address */}
      <div>
        <label htmlFor={`street-${index}`} className="block text-sm font-medium text-gray-700 mb-2">
          Street Address <span className="text-red-500">*</span>
        </label>
        <input
          id={`street-${index}`}
          type="text"
          value={entry.address.streetAddress.value}
          onChange={(e) => handleFieldChange('address.streetAddress', e.target.value, index)}
          className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
            errors[`section11.residences[${index}].address.streetAddress`]
              ? 'border-red-300 text-red-900 placeholder-red-300'
              : 'border-gray-300'
          }`}
          placeholder="Enter street address"
        />
        {errors[`section11.residences[${index}].address.streetAddress`] && (
          <p className="mt-1 text-sm text-red-600">
            {errors[`section11.residences[${index}].address.streetAddress`]}
          </p>
        )}
      </div>

      {/* City, State, ZIP Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label htmlFor={`city-${index}`} className="block text-sm font-medium text-gray-700 mb-2">
            City <span className="text-red-500">*</span>
          </label>
          <input
            id={`city-${index}`}
            type="text"
            value={entry.address.city.value}
            onChange={(e) => handleFieldChange('address.city', e.target.value, index)}
            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              errors[`section11.residences[${index}].address.city`]
                ? 'border-red-300 text-red-900 placeholder-red-300'
                : 'border-gray-300'
            }`}
            placeholder="Enter city"
          />
          {errors[`section11.residences[${index}].address.city`] && (
            <p className="mt-1 text-sm text-red-600">
              {errors[`section11.residences[${index}].address.city`]}
            </p>
          )}
        </div>

        <div>
          <label htmlFor={`state-${index}`} className="block text-sm font-medium text-gray-700 mb-2">
            State
          </label>
          <select
            id={`state-${index}`}
            value={entry.address.state.value}
            onChange={(e) => handleFieldChange('address.state', e.target.value, index)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Select State</option>
            {entry.address.state.options?.map(state => (
              <option key={state} value={state}>{state}</option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor={`zip-${index}`} className="block text-sm font-medium text-gray-700 mb-2">
            ZIP Code
          </label>
          <input
            id={`zip-${index}`}
            type="text"
            value={entry.address.zipCode.value}
            onChange={(e) => handleFieldChange('address.zipCode', e.target.value, index)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter ZIP code"
          />
        </div>
      </div>

      {/* Country */}
      <div>
        <label htmlFor={`country-${index}`} className="block text-sm font-medium text-gray-700 mb-2">
          Country
        </label>
        <select
          id={`country-${index}`}
          value={entry.address.country.value}
          onChange={(e) => handleFieldChange('address.country', e.target.value, index)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="">Select Country</option>
          {entry.address.country.options?.map(country => (
            <option key={country} value={country}>{country}</option>
          ))}
        </select>
      </div>
    </div>
  );

  const renderDateSection = (entry: ResidenceEntry, index: number) => (
    <div className="space-y-4">
      <h5 className="text-lg font-medium text-gray-900 border-b border-gray-200 pb-2">
        Residence Period
      </h5>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* From Date */}
        <div className="space-y-3">
          <label htmlFor={`from-date-${index}`} className="block text-sm font-medium text-gray-700">
            From Date (MM/YYYY) <span className="text-red-500">*</span>
          </label>
          <input
            id={`from-date-${index}`}
            type="text"
            value={entry.fromDate.value}
            onChange={(e) => handleFieldChange('fromDate', e.target.value, index)}
            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              errors[`section11.residences[${index}].fromDate`]
                ? 'border-red-300 text-red-900 placeholder-red-300'
                : 'border-gray-300'
            }`}
            placeholder="MM/YYYY"
          />
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={entry.fromDateEstimate.value}
              onChange={(e) => handleFieldChange('fromDateEstimate', e.target.checked, index)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <span className="ml-2 text-sm text-gray-600">Estimate</span>
          </label>
          {errors[`section11.residences[${index}].fromDate`] && (
            <p className="text-sm text-red-600">
              {errors[`section11.residences[${index}].fromDate`]}
            </p>
          )}
        </div>

        {/* To Date */}
        <div className="space-y-3">
          <label htmlFor={`to-date-${index}`} className="block text-sm font-medium text-gray-700">
            To Date (MM/YYYY)
          </label>
          <input
            id={`to-date-${index}`}
            type="text"
            value={entry.toDate.value}
            onChange={(e) => handleFieldChange('toDate', e.target.value, index)}
            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              entry.present.value ? 'bg-gray-100 text-gray-500' : ''
            } ${
              errors[`section11.residences[${index}].toDate`]
                ? 'border-red-300 text-red-900 placeholder-red-300'
                : 'border-gray-300'
            }`}
            placeholder="MM/YYYY"
            disabled={entry.present.value}
          />
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={entry.toDateEstimate.value}
              onChange={(e) => handleFieldChange('toDateEstimate', e.target.checked, index)}
              disabled={entry.present.value}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded disabled:opacity-50"
            />
            <span className={`ml-2 text-sm ${entry.present.value ? 'text-gray-400' : 'text-gray-600'}`}>
              Estimate
            </span>
          </label>
          {errors[`section11.residences[${index}].toDate`] && (
            <p className="text-sm text-red-600">
              {errors[`section11.residences[${index}].toDate`]}
            </p>
          )}
        </div>
      </div>

      {/* Present Checkbox */}
      <div className="pt-2">
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={entry.present.value}
            onChange={(e) => handleFieldChange('present', e.target.checked, index)}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <span className="ml-2 text-sm font-medium text-gray-700">
            I currently live at this address
          </span>
        </label>
        <p className="mt-1 text-xs text-gray-500">
          Check this box if this is your current residence
        </p>
      </div>
    </div>
  );

  const renderResidenceTypeSection = (entry: ResidenceEntry, index: number) => (
    <div className="space-y-4">
      <h5 className="text-lg font-medium text-gray-900 border-b border-gray-200 pb-2">
        Residence Type
      </h5>

      <div className="space-y-3">
        <p className="text-sm text-gray-600">
          Select the type of residence this was for you:
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {entry.residenceType.options?.map(type => (
            <label key={type} className="flex items-center p-3 border border-gray-200 rounded-md hover:bg-gray-50 cursor-pointer">
              <input
                type="radio"
                name={`residence-type-${index}`}
                value={type}
                checked={entry.residenceType.value === type}
                onChange={(e) => handleFieldChange('residenceType', e.target.value, index)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
              />
              <span className="ml-3 text-sm font-medium text-gray-700">{type}</span>
            </label>
          ))}
        </div>
      </div>

      {entry.residenceType.value === 'Other' && (
        <div className="mt-4">
          <label htmlFor={`residence-other-${index}`} className="block text-sm font-medium text-gray-700 mb-2">
            Specify Other Residence Type
          </label>
          <input
            id={`residence-other-${index}`}
            type="text"
            value={entry.residenceTypeOther.value}
            onChange={(e) => handleFieldChange('residenceTypeOther', e.target.value, index)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Specify other residence type"
          />
        </div>
      )}
    </div>
  );

  const renderContactPersonSection = (entry: ResidenceEntry, index: number) => (
    <div className="space-y-6">
      <h5 className="text-lg font-medium text-gray-900 border-b border-gray-200 pb-2">
        Contact Person Who Knows You at This Address
      </h5>

      <p className="text-sm text-gray-600">
        Provide information for someone who knows you at this address (neighbor, landlord, friend, etc.).
      </p>

      {/* Name Fields */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label htmlFor={`contact-first-${index}`} className="block text-sm font-medium text-gray-700 mb-2">
            First Name <span className="text-red-500">*</span>
          </label>
          <input
            id={`contact-first-${index}`}
            type="text"
            value={entry.contactPerson.firstName.value}
            onChange={(e) => handleFieldChange('contactPerson.firstName', e.target.value, index)}
            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              errors[`section11.residences[${index}].contactPerson.firstName`]
                ? 'border-red-300 text-red-900 placeholder-red-300'
                : 'border-gray-300'
            }`}
            placeholder="Enter first name"
          />
          {errors[`section11.residences[${index}].contactPerson.firstName`] && (
            <p className="mt-1 text-sm text-red-600">
              {errors[`section11.residences[${index}].contactPerson.firstName`]}
            </p>
          )}
        </div>

        <div>
          <label htmlFor={`contact-middle-${index}`} className="block text-sm font-medium text-gray-700 mb-2">
            Middle Name
          </label>
          <input
            id={`contact-middle-${index}`}
            type="text"
            value={entry.contactPerson.middleName.value}
            onChange={(e) => handleFieldChange('contactPerson.middleName', e.target.value, index)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter middle name"
          />
        </div>

        <div>
          <label htmlFor={`contact-last-${index}`} className="block text-sm font-medium text-gray-700 mb-2">
            Last Name <span className="text-red-500">*</span>
          </label>
          <input
            id={`contact-last-${index}`}
            type="text"
            value={entry.contactPerson.lastName.value}
            onChange={(e) => handleFieldChange('contactPerson.lastName', e.target.value, index)}
            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              errors[`section11.residences[${index}].contactPerson.lastName`]
                ? 'border-red-300 text-red-900 placeholder-red-300'
                : 'border-gray-300'
            }`}
            placeholder="Enter last name"
          />
          {errors[`section11.residences[${index}].contactPerson.lastName`] && (
            <p className="mt-1 text-sm text-red-600">
              {errors[`section11.residences[${index}].contactPerson.lastName`]}
            </p>
          )}
        </div>
      </div>

      {/* Relationship */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor={`contact-relationship-${index}`} className="block text-sm font-medium text-gray-700 mb-2">
            Relationship
          </label>
          <select
            id={`contact-relationship-${index}`}
            value={entry.contactPerson.relationship.value}
            onChange={(e) => handleFieldChange('contactPerson.relationship', e.target.value, index)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            {entry.contactPerson.relationship.options?.map(rel => (
              <option key={rel} value={rel}>{rel}</option>
            ))}
          </select>
        </div>

        {entry.contactPerson.relationship.value === 'Other' && (
          <div>
            <label htmlFor={`contact-relationship-other-${index}`} className="block text-sm font-medium text-gray-700 mb-2">
              Specify Other Relationship
            </label>
            <input
              id={`contact-relationship-other-${index}`}
              type="text"
              value={entry.contactPerson.relationshipOther.value}
              onChange={(e) => handleFieldChange('contactPerson.relationshipOther', e.target.value, index)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Specify other relationship"
            />
          </div>
        )}
      </div>

      {/* Contact Information */}
      <div className="space-y-4">
        <h6 className="text-base font-medium text-gray-900">Contact Information</h6>

        {/* Phone Numbers */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label htmlFor={`contact-evening-${index}`} className="block text-sm font-medium text-gray-700 mb-2">
              Evening Phone
            </label>
            <input
              id={`contact-evening-${index}`}
              type="tel"
              value={entry.contactPerson.eveningPhone.value}
              onChange={(e) => handleFieldChange('contactPerson.eveningPhone', e.target.value, index)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="(XXX) XXX-XXXX"
            />
          </div>

          <div>
            <label htmlFor={`contact-daytime-${index}`} className="block text-sm font-medium text-gray-700 mb-2">
              Daytime Phone
            </label>
            <input
              id={`contact-daytime-${index}`}
              type="tel"
              value={entry.contactPerson.daytimePhone.value}
              onChange={(e) => handleFieldChange('contactPerson.daytimePhone', e.target.value, index)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="(XXX) XXX-XXXX"
            />
          </div>

          <div>
            <label htmlFor={`contact-mobile-${index}`} className="block text-sm font-medium text-gray-700 mb-2">
              Mobile Phone
            </label>
            <input
              id={`contact-mobile-${index}`}
              type="tel"
              value={entry.contactPerson.mobilePhone.value}
              onChange={(e) => handleFieldChange('contactPerson.mobilePhone', e.target.value, index)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="(XXX) XXX-XXXX"
            />
          </div>
        </div>

        {/* Email */}
        <div>
          <label htmlFor={`contact-email-${index}`} className="block text-sm font-medium text-gray-700 mb-2">
            Email Address
          </label>
          <input
            id={`contact-email-${index}`}
            type="email"
            value={entry.contactPerson.email.value}
            onChange={(e) => handleFieldChange('contactPerson.email', e.target.value, index)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="email@example.com"
          />
        </div>

        {/* Don't Know Contact Checkbox */}
        <div className="pt-2">
          <label className="flex items-start">
            <input
              type="checkbox"
              checked={entry.contactPerson.dontKnowContact.value}
              onChange={(e) => handleFieldChange('contactPerson.dontKnowContact', e.target.checked, index)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mt-0.5"
            />
            <span className="ml-2 text-sm text-gray-700">
              I don't know this person or how to contact them
            </span>
          </label>
          <p className="mt-1 ml-6 text-xs text-gray-500">
            Check this box if you cannot provide contact information for someone at this address
          </p>
        </div>
      </div>
    </div>
  );

  const renderResidenceHistorySummary = () => {
    const timespan = getTotalResidenceTimespan();
    const isComplete = isResidenceHistoryComplete();

    return (
      <div className="mb-6 bg-gray-50 border border-gray-200 rounded-lg p-4">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Residence History Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-md p-3 border border-gray-200">
            <div className="text-sm font-medium text-gray-500">Total Residences</div>
            <div className="text-2xl font-bold text-gray-900">{getEntryCount()}</div>
          </div>
          <div className="bg-white rounded-md p-3 border border-gray-200">
            <div className="text-sm font-medium text-gray-500">Total Timespan</div>
            <div className="text-2xl font-bold text-gray-900">{timespan ? timespan.toFixed(1) : 0} years</div>
          </div>
          <div className="bg-white rounded-md p-3 border border-gray-200">
            <div className="text-sm font-medium text-gray-500">History Complete</div>
            <div className={`text-2xl font-bold ${isComplete ? 'text-green-600' : 'text-red-600'}`}>
              {isComplete ? 'Yes' : 'No'}
            </div>
          </div>
        </div>

        {!isComplete && (
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-yellow-700">
                  Your residence history should cover at least 7 years without gaps.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  // ============================================================================
  // MAIN RENDER
  // ============================================================================

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-center py-12">
          <div className="flex items-center space-x-3">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="text-gray-600">Loading Section 11: Where You Have Lived...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6" data-testid="section11-form">
      {/* Section Header */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Section 11: Where You Have Lived
        </h2>
        <p className="text-gray-600">
          List where you have lived, beginning with your current address first.
          Account for all residences for the last 7 years or since your 18th birthday,
          whichever is shorter.
        </p>
        <div className="mt-4 text-sm text-gray-500">
          Fields marked with <span className="text-red-500">*</span> are required.
        </div>
        {hasPendingChanges() && (
          <div className="mt-4 p-3 bg-orange-50 border border-orange-200 rounded-md">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-orange-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-orange-700">
                  You have unsaved changes (submit-only mode active)
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Residence History Summary */}
      {renderResidenceHistorySummary()}

      {/* Residences Container */}
      <div className="space-y-6">
        {section11Data.section11.residences.slice(0, MAX_ENTRIES).map((entry, index) =>
          renderResidenceEntry(entry, index)
        )}
      </div>

      {/* Add Residence Button */}
      <div className="mt-6 flex justify-center">
        <button
          type="button"
          onClick={handleAddResidence}
          disabled={getEntryCount() >= MAX_ENTRIES}
          className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm transition-colors ${
            getEntryCount() >= MAX_ENTRIES
              ? 'bg-gray-400 text-gray-700 cursor-not-allowed'
              : 'text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
          }`}
        >
          <svg className="-ml-1 mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Add Another Residence
          {getEntryCount() >= MAX_ENTRIES && (
            <span className="ml-1 text-xs">(Max: {MAX_ENTRIES})</span>
          )}
        </button>
      </div>

      {/* Entry limit information */}
      {getEntryCount() >= MAX_ENTRIES && (
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-blue-700">
                You have reached the maximum of {MAX_ENTRIES} residence entries allowed for Section 11.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Validation Errors */}
      {showValidation && Object.keys(errors).length > 0 && (
        <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-md">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                Please correct the following errors:
              </h3>
              <div className="mt-2 text-sm text-red-700">
                <ul className="list-disc pl-5 space-y-1">
                  {Object.entries(errors).map(([field, message]) => (
                    <li key={field}>{message}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      {showNavigation && (
        <div className="mt-8 flex justify-between items-center pt-6 border-t border-gray-200">
          <div className="text-sm text-gray-500">
            <span className="text-red-500">*</span> Required fields
          </div>

          <div className="flex space-x-4">
            {onPrevious && (
              <button
                type="button"
                onClick={onPrevious}
                className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
              >
                Previous Section
              </button>
            )}

            <button
              type="button"
              onClick={handleSubmit}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isLoading}
            >
              {isLoading ? 'Saving...' : 'Save & Continue'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Section11Component; 