/**
 * Section 19: Foreign Activities - Component
 *
 * React component for SF-86 Section 19 using the new Form Architecture 2.0.
 * This component handles foreign contacts and activities with full CRUD operations
 * and integrates with the Section19Provider context.
 *
 * Foreign Contacts Subsection (277 total fields across 4 pages):
 * - Personal Information: Name, DOB, place of birth, address
 * - Citizenship Information: Primary/secondary countries
 * - Contact Information: Phone, email, relationship
 * - Employment Information: Employer details, position, dates
 * - Government Relationship: Official connections
 * - Contact Details: Meeting circumstances, frequency, purpose
 */

import React, { useState, useCallback, useEffect } from 'react';
import { useSection19 } from '~/state/contexts/sections2.0/section19';
import { useSF86Form } from '~/state/contexts/SF86FormContext';

interface Section19ComponentProps {
  className?: string;
  onValidationChange?: (isValid: boolean) => void;
  onNext?: () => void;
}

// Maximum number of foreign contact entries allowed
const MAX_FOREIGN_CONTACTS = 10;

// Common countries for dropdown
const COUNTRIES = [
  { value: "", label: "Select country..." },
  { value: "United States", label: "United States" },
  { value: "Afghanistan", label: "Afghanistan" },
  { value: "Albania", label: "Albania" },
  { value: "Algeria", label: "Algeria" },
  { value: "Argentina", label: "Argentina" },
  { value: "Australia", label: "Australia" },
  { value: "Austria", label: "Austria" },
  { value: "Belgium", label: "Belgium" },
  { value: "Brazil", label: "Brazil" },
  { value: "Canada", label: "Canada" },
  { value: "China", label: "China" },
  { value: "Colombia", label: "Colombia" },
  { value: "Denmark", label: "Denmark" },
  { value: "Egypt", label: "Egypt" },
  { value: "France", label: "France" },
  { value: "Germany", label: "Germany" },
  { value: "India", label: "India" },
  { value: "Iran", label: "Iran" },
  { value: "Iraq", label: "Iraq" },
  { value: "Ireland", label: "Ireland" },
  { value: "Israel", label: "Israel" },
  { value: "Italy", label: "Italy" },
  { value: "Japan", label: "Japan" },
  { value: "Jordan", label: "Jordan" },
  { value: "Mexico", label: "Mexico" },
  { value: "Netherlands", label: "Netherlands" },
  { value: "Norway", label: "Norway" },
  { value: "Pakistan", label: "Pakistan" },
  { value: "Poland", label: "Poland" },
  { value: "Russia", label: "Russia" },
  { value: "Saudi Arabia", label: "Saudi Arabia" },
  { value: "South Korea", label: "South Korea" },
  { value: "Spain", label: "Spain" },
  { value: "Sweden", label: "Sweden" },
  { value: "Switzerland", label: "Switzerland" },
  { value: "Turkey", label: "Turkey" },
  { value: "Ukraine", label: "Ukraine" },
  { value: "United Kingdom", label: "United Kingdom" },
  { value: "Other", label: "Other" }
];

// US States for address fields
const US_STATES = [
  { value: "", label: "Select state..." },
  { value: "AL", label: "Alabama" }, { value: "AK", label: "Alaska" }, { value: "AZ", label: "Arizona" },
  { value: "AR", label: "Arkansas" }, { value: "CA", label: "California" }, { value: "CO", label: "Colorado" },
  { value: "CT", label: "Connecticut" }, { value: "DE", label: "Delaware" }, { value: "DC", label: "District of Columbia" },
  { value: "FL", label: "Florida" }, { value: "GA", label: "Georgia" }, { value: "HI", label: "Hawaii" },
  { value: "ID", label: "Idaho" }, { value: "IL", label: "Illinois" }, { value: "IN", label: "Indiana" },
  { value: "IA", label: "Iowa" }, { value: "KS", label: "Kansas" }, { value: "KY", label: "Kentucky" },
  { value: "LA", label: "Louisiana" }, { value: "ME", label: "Maine" }, { value: "MD", label: "Maryland" },
  { value: "MA", label: "Massachusetts" }, { value: "MI", label: "Michigan" }, { value: "MN", label: "Minnesota" },
  { value: "MS", label: "Mississippi" }, { value: "MO", label: "Missouri" }, { value: "MT", label: "Montana" },
  { value: "NE", label: "Nebraska" }, { value: "NV", label: "Nevada" }, { value: "NH", label: "New Hampshire" },
  { value: "NJ", label: "New Jersey" }, { value: "NM", label: "New Mexico" }, { value: "NY", label: "New York" },
  { value: "NC", label: "North Carolina" }, { value: "ND", label: "North Dakota" }, { value: "OH", label: "Ohio" },
  { value: "OK", label: "Oklahoma" }, { value: "OR", label: "Oregon" }, { value: "PA", label: "Pennsylvania" },
  { value: "RI", label: "Rhode Island" }, { value: "SC", label: "South Carolina" }, { value: "SD", label: "South Dakota" },
  { value: "TN", label: "Tennessee" }, { value: "TX", label: "Texas" }, { value: "UT", label: "Utah" },
  { value: "VT", label: "Vermont" }, { value: "VA", label: "Virginia" }, { value: "WA", label: "Washington" },
  { value: "WV", label: "West Virginia" }, { value: "WI", label: "Wisconsin" }, { value: "WY", label: "Wyoming" }
];

// Contact frequency options
const CONTACT_FREQUENCIES = [
  { value: "", label: "Select frequency..." },
  { value: "Daily", label: "Daily" },
  { value: "Weekly", label: "Weekly" },
  { value: "Monthly", label: "Monthly" },
  { value: "Quarterly", label: "Quarterly" },
  { value: "Annually", label: "Annually" },
  { value: "Rarely", label: "Rarely" },
  { value: "One-time", label: "One-time contact" }
];

export const Section19Component: React.FC<Section19ComponentProps> = ({
  className = '',
  onValidationChange,
  onNext
}) => {
  // Section 19 Context
  const {
    section19Data,
    updateSubsectionFlag,
    updateForeignContactField,
    addEntry,
    removeEntry,
    duplicateEntry,
    clearEntry,
    moveEntry,
    getEntryCount,
    validateSection,
    validateEntry,
    errors,
    isDirty
  } = useSection19();

  // SF86 Form Context for data persistence
  const sf86Form = useSF86Form();

  // Local state
  const [isValid, setIsValid] = useState(false);
  const [expandedEntries, setExpandedEntries] = useState<Set<number>>(new Set([0]));
  const [validationErrors, setValidationErrors] = useState<Record<string, string[]>>({});

  // Handle validation on component mount and when data changes
  useEffect(() => {
    const validationResult = validateSection();
    setIsValid(validationResult.isValid);
    onValidationChange?.(validationResult.isValid);

    // Process validation errors for display
    const errorMap: Record<string, string[]> = {};
    validationResult.errors.forEach(error => {
      if (!errorMap[error.field]) {
        errorMap[error.field] = [];
      }
      errorMap[error.field].push(error.message);
    });
    setValidationErrors(errorMap);
  }, [section19Data, validateSection, onValidationChange]);

  // Toggle entry expansion
  const toggleEntryExpansion = useCallback((index: number) => {
    setExpandedEntries(prev => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  }, []);

  // Handle main subsection flag change
  const handleHasForeignContactsChange = (value: "YES" | "NO (If NO, proceed to Section 20A)") => {
    updateSubsectionFlag('foreignContacts', value);

    // Auto-expand first entry if answering YES
    if (value === "YES" && getEntryCount('foreignContacts') === 0) {
      addEntry('foreignContacts');
      setExpandedEntries(new Set([0]));
    }
  };

  // Handle adding new foreign contact entry
  const handleAddForeignContact = () => {
    const currentCount = getEntryCount('foreignContacts');
    if (currentCount >= MAX_FOREIGN_CONTACTS) {
      alert(`Maximum of ${MAX_FOREIGN_CONTACTS} foreign contacts allowed.`);
      return;
    }

    addEntry('foreignContacts');
    setExpandedEntries(prev => new Set([...prev, currentCount]));
  };

  // Handle removing foreign contact entry
  const handleRemoveForeignContact = (index: number) => {
    if (window.confirm('Are you sure you want to remove this foreign contact entry?')) {
      removeEntry('foreignContacts', index);
      setExpandedEntries(prev => {
        const newSet = new Set(prev);
        newSet.delete(index);
        return newSet;
      });
    }
  };

  // Handle field changes
  const handleFieldChange = (entryIndex: number, fieldPath: string, value: any) => {
    updateForeignContactField(entryIndex, fieldPath, value);
  };

  // Handle checkbox changes
  const handleCheckboxChange = (entryIndex: number, fieldPath: string, checked: boolean) => {
    updateForeignContactField(entryIndex, fieldPath, checked);
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = validateSection();
    setIsValid(result.isValid);
    onValidationChange?.(result.isValid);

    if (result.isValid) {
      try {
        // Update the central form context with Section 19 data
        sf86Form.updateSectionData('section19', section19Data);

        // Save the form data to persistence layer
        await sf86Form.saveForm();

        console.log('✅ Section 19 data saved successfully:', section19Data);

        // Proceed to next section if callback provided
        if (onNext) {
          onNext();
        }
      } catch (error) {
        console.error('❌ Failed to save Section 19 data:', error);
      }
    }
  };

  // Get field value safely
  const getFieldValue = (entryIndex: number, fieldPath: string): any => {
    const entries = section19Data.section19.foreignContacts?.entries || [];
    const entry = entries[entryIndex];
    if (!entry) return '';

    const pathParts = fieldPath.split('.');
    let current: any = entry;

    for (const part of pathParts) {
      if (current && typeof current === 'object' && part in current) {
        current = current[part];
      } else {
        return '';
      }
    }

    return current?.value || current || '';
  };

  // Check if field has error
  const hasFieldError = (entryIndex: number, fieldPath: string): boolean => {
    const fullPath = `foreignContacts.entries.${entryIndex}.${fieldPath}`;
    return !!(validationErrors[fullPath] && validationErrors[fullPath].length > 0);
  };

  // Get field error message
  const getFieldError = (entryIndex: number, fieldPath: string): string => {
    const fullPath = `foreignContacts.entries.${entryIndex}.${fieldPath}`;
    return validationErrors[fullPath]?.[0] || '';
  };

  // Date validation helper
  const validateDate = (dateString: string): boolean => {
    if (!dateString) return true; // Allow empty dates
    const datePattern = /^\d{4}-\d{2}-\d{2}$/;
    return datePattern.test(dateString);
  };

  const hasForeignContacts = section19Data.section19.foreignContacts?.hasContact?.value;
  const foreignContactEntries = section19Data.section19.foreignContacts?.entries || [];

  return (
    <div className={`bg-white rounded-lg shadow-lg p-6 ${className}`} data-testid="section19-form">
      {/* Section Header */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Section 19: Foreign Activities
        </h2>
        <p className="text-gray-600">
          Provide information about your foreign contacts and relationships with foreign nationals.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Main Question */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <fieldset>
            <legend className="text-lg font-medium text-gray-900 mb-4">
              Do you have, or have you had, close and/or continuing contact with a foreign national within the last seven (7) years with whom you, or your spouse, or legally recognized civil union/domestic partner, or any member of either of your immediate families, has affection, influence, common interests, and/or obligation?
            </legend>

            <div className="space-y-3">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="hasForeignContacts"
                  value="YES"
                  checked={hasForeignContacts === "YES"}
                  onChange={(e) => handleHasForeignContactsChange("YES")}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                />
                <span className="ml-2 text-sm text-gray-700">
                  <strong>YES</strong>
                </span>
              </label>

              <label className="flex items-center">
                <input
                  type="radio"
                  name="hasForeignContacts"
                  value="NO"
                  checked={hasForeignContacts === "NO (If NO, proceed to Section 20A)"}
                  onChange={(e) => handleHasForeignContactsChange("NO (If NO, proceed to Section 20A)")}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                />
                <span className="ml-2 text-sm text-gray-700">
                  <strong>NO</strong> (If NO, proceed to Section 20A)
                </span>
              </label>
            </div>
          </fieldset>
        </div>

        {/* Foreign Contacts Entries */}
        {hasForeignContacts === "YES" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">
                Foreign Contacts ({foreignContactEntries.length} of {MAX_FOREIGN_CONTACTS})
              </h3>

              {foreignContactEntries.length < MAX_FOREIGN_CONTACTS && (
                <button
                  type="button"
                  onClick={handleAddForeignContact}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Add Foreign Contact
                </button>
              )}
            </div>

            {/* Entry List */}
            {foreignContactEntries.map((entry, entryIndex) => (
              <div key={entry._id || entryIndex} className="border border-gray-200 rounded-lg">
                {/* Entry Header */}
                <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => toggleEntryExpansion(entryIndex)}
                    className="flex items-center space-x-2 text-sm font-medium text-gray-700 hover:text-gray-900"
                  >
                    <span>
                      {expandedEntries.has(entryIndex) ? '▼' : '▶'}
                    </span>
                    <span>
                      Foreign Contact #{entryIndex + 1}
                      {getFieldValue(entryIndex, 'personalInfo.name.first') &&
                       getFieldValue(entryIndex, 'personalInfo.name.last') &&
                       ` - ${getFieldValue(entryIndex, 'personalInfo.name.first')} ${getFieldValue(entryIndex, 'personalInfo.name.last')}`
                      }
                    </span>
                  </button>

                  <div className="flex items-center space-x-2">
                    {foreignContactEntries.length > 1 && (
                      <>
                        <button
                          type="button"
                          onClick={() => duplicateEntry('foreignContacts', entryIndex)}
                          className="text-xs text-blue-600 hover:text-blue-800"
                          title="Duplicate entry"
                        >
                          Copy
                        </button>

                        <button
                          type="button"
                          onClick={() => clearEntry('foreignContacts', entryIndex)}
                          className="text-xs text-yellow-600 hover:text-yellow-800"
                          title="Clear entry"
                        >
                          Clear
                        </button>

                        <button
                          type="button"
                          onClick={() => handleRemoveForeignContact(entryIndex)}
                          className="text-xs text-red-600 hover:text-red-800"
                          title="Remove entry"
                        >
                          Remove
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {/* Entry Content */}
                {expandedEntries.has(entryIndex) && (
                  <div className="p-6 space-y-8">
                    {/* Personal Information Section */}
                    <div>
                      <h4 className="text-md font-medium text-gray-900 mb-4">Personal Information</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* First Name */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            First Name <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={getFieldValue(entryIndex, 'personalInfo.name.first')}
                            onChange={(e) => handleFieldChange(entryIndex, 'personalInfo.name.first.value', e.target.value)}
                            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                              hasFieldError(entryIndex, 'personalInfo.name.first')
                                ? 'border-red-300 focus:border-red-500'
                                : 'border-gray-300 focus:border-blue-500'
                            }`}
                            placeholder="Enter first name"
                          />
                          {hasFieldError(entryIndex, 'personalInfo.name.first') && (
                            <p className="mt-1 text-sm text-red-600">
                              {getFieldError(entryIndex, 'personalInfo.name.first')}
                            </p>
                          )}
                        </div>

                        {/* Last Name */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Last Name <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={getFieldValue(entryIndex, 'personalInfo.name.last')}
                            onChange={(e) => handleFieldChange(entryIndex, 'personalInfo.name.last.value', e.target.value)}
                            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                              hasFieldError(entryIndex, 'personalInfo.name.last')
                                ? 'border-red-300 focus:border-red-500'
                                : 'border-gray-300 focus:border-blue-500'
                            }`}
                            placeholder="Enter last name"
                          />
                          {hasFieldError(entryIndex, 'personalInfo.name.last') && (
                            <p className="mt-1 text-sm text-red-600">
                              {getFieldError(entryIndex, 'personalInfo.name.last')}
                            </p>
                          )}
                        </div>

                        {/* Middle Name */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Middle Name
                          </label>
                          <input
                            type="text"
                            value={getFieldValue(entryIndex, 'personalInfo.name.middle')}
                            onChange={(e) => handleFieldChange(entryIndex, 'personalInfo.name.middle.value', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Enter middle name (optional)"
                          />
                        </div>

                        {/* Suffix */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Suffix
                          </label>
                          <select
                            value={getFieldValue(entryIndex, 'personalInfo.name.suffix')}
                            onChange={(e) => handleFieldChange(entryIndex, 'personalInfo.name.suffix.value', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          >
                            <option value="">Select suffix</option>
                            <option value="Jr.">Jr.</option>
                            <option value="Sr.">Sr.</option>
                            <option value="II">II</option>
                            <option value="III">III</option>
                            <option value="IV">IV</option>
                          </select>
                        </div>

                        {/* Date of Birth */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Date of Birth
                          </label>
                          <input
                            type="date"
                            value={getFieldValue(entryIndex, 'personalInfo.dateOfBirth.date')}
                            onChange={(e) => handleFieldChange(entryIndex, 'personalInfo.dateOfBirth.date.value', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>

                        {/* Unknown Name Checkbox */}
                        <div className="md:col-span-2">
                          <label className="flex items-center">
                            <input
                              type="checkbox"
                              checked={getFieldValue(entryIndex, 'personalInfo.name.unknown')}
                              onChange={(e) => handleCheckboxChange(entryIndex, 'personalInfo.name.unknown.value', e.target.checked)}
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            <span className="ml-2 text-sm text-gray-700">Name unknown</span>
                          </label>
                        </div>
                      </div>
                    </div>

                    {/* Citizenship Information */}
                    <div>
                      <h4 className="text-md font-medium text-gray-900 mb-4">Citizenship Information</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Primary Citizenship */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Primary Citizenship <span className="text-red-500">*</span>
                          </label>
                          <select
                            value={getFieldValue(entryIndex, 'citizenship.country1')}
                            onChange={(e) => handleFieldChange(entryIndex, 'citizenship.country1.value', e.target.value)}
                            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                              hasFieldError(entryIndex, 'citizenship.country1')
                                ? 'border-red-300 focus:border-red-500'
                                : 'border-gray-300 focus:border-blue-500'
                            }`}
                          >
                            {COUNTRIES.map(country => (
                              <option key={country.value} value={country.value}>
                                {country.label}
                              </option>
                            ))}
                          </select>
                          {hasFieldError(entryIndex, 'citizenship.country1') && (
                            <p className="mt-1 text-sm text-red-600">
                              {getFieldError(entryIndex, 'citizenship.country1')}
                            </p>
                          )}
                        </div>

                        {/* Secondary Citizenship */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Secondary Citizenship
                          </label>
                          <select
                            value={getFieldValue(entryIndex, 'citizenship.country2')}
                            onChange={(e) => handleFieldChange(entryIndex, 'citizenship.country2.value', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          >
                            {COUNTRIES.map(country => (
                              <option key={country.value} value={country.value}>
                                {country.label}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Unknown Citizenship Checkbox */}
                        <div className="md:col-span-2">
                          <label className="flex items-center">
                            <input
                              type="checkbox"
                              checked={getFieldValue(entryIndex, 'citizenship.unknown')}
                              onChange={(e) => handleCheckboxChange(entryIndex, 'citizenship.unknown.value', e.target.checked)}
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            <span className="ml-2 text-sm text-gray-700">Citizenship unknown</span>
                          </label>
                        </div>
                      </div>
                    </div>

                    {/* Contact Information */}
                    <div>
                      <h4 className="text-md font-medium text-gray-900 mb-4">Contact Information</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Relationship */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Relationship <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={getFieldValue(entryIndex, 'contact.relationship')}
                            onChange={(e) => handleFieldChange(entryIndex, 'contact.relationship.value', e.target.value)}
                            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                              hasFieldError(entryIndex, 'contact.relationship')
                                ? 'border-red-300 focus:border-red-500'
                                : 'border-gray-300 focus:border-blue-500'
                            }`}
                            placeholder="Describe your relationship"
                          />
                          {hasFieldError(entryIndex, 'contact.relationship') && (
                            <p className="mt-1 text-sm text-red-600">
                              {getFieldError(entryIndex, 'contact.relationship')}
                            </p>
                          )}
                        </div>

                        {/* Phone Number */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Phone Number
                          </label>
                          <input
                            type="tel"
                            value={getFieldValue(entryIndex, 'contact.phone')}
                            onChange={(e) => handleFieldChange(entryIndex, 'contact.phone.value', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Enter phone number"
                          />
                        </div>

                        {/* Email Address */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Email Address
                          </label>
                          <input
                            type="email"
                            value={getFieldValue(entryIndex, 'contact.email')}
                            onChange={(e) => handleFieldChange(entryIndex, 'contact.email.value', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Enter email address"
                          />
                        </div>

                        {/* Contact Frequency */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Contact Frequency
                          </label>
                          <select
                            value={getFieldValue(entryIndex, 'contactDetails.frequency')}
                            onChange={(e) => handleFieldChange(entryIndex, 'contactDetails.frequency.value', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          >
                            {CONTACT_FREQUENCIES.map(freq => (
                              <option key={freq.value} value={freq.value}>
                                {freq.label}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* Contact Details */}
                    <div>
                      <h4 className="text-md font-medium text-gray-900 mb-4">Contact Details</h4>
                      <div className="space-y-4">
                        {/* Nature of Contact */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Nature of Contact
                          </label>
                          <textarea
                            value={getFieldValue(entryIndex, 'contactDetails.natureOfContact')}
                            onChange={(e) => handleFieldChange(entryIndex, 'contactDetails.natureOfContact.value', e.target.value)}
                            rows={3}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Describe the nature and purpose of your contact"
                          />
                        </div>

                        {/* Initial Meeting Circumstances */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Initial Meeting Circumstances
                          </label>
                          <textarea
                            value={getFieldValue(entryIndex, 'contactDetails.initialMeetingCircumstances')}
                            onChange={(e) => handleFieldChange(entryIndex, 'contactDetails.initialMeetingCircumstances.value', e.target.value)}
                            rows={3}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Describe how and under what circumstances you first met"
                          />
                        </div>

                        {/* Contact Dates */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              First Contact Date
                            </label>
                            <input
                              type="date"
                              value={getFieldValue(entryIndex, 'contactDetails.firstContact.date')}
                              onChange={(e) => handleFieldChange(entryIndex, 'contactDetails.firstContact.date.value', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Last Contact Date
                            </label>
                            <input
                              type="date"
                              value={getFieldValue(entryIndex, 'contactDetails.lastContact.date')}
                              onChange={(e) => handleFieldChange(entryIndex, 'contactDetails.lastContact.date.value', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Government Relationship */}
                    <div>
                      <h4 className="text-md font-medium text-gray-900 mb-4">Government Relationship</h4>

                      {/* Has Government Relationship */}
                      <div className="mb-4">
                        <fieldset>
                          <legend className="text-sm font-medium text-gray-700 mb-2">
                            Does this person have any known or suspected affiliation with a foreign government, military, security, defense industry, foreign movement, or intelligence service?
                          </legend>

                          <div className="space-y-2">
                            <label className="flex items-center">
                              <input
                                type="radio"
                                name={`govRelationship_${entryIndex}`}
                                value="YES"
                                checked={getFieldValue(entryIndex, 'governmentRelationship.hasRelationship') === "YES"}
                                onChange={(e) => handleFieldChange(entryIndex, 'governmentRelationship.hasRelationship.value', "YES")}
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                              />
                              <span className="ml-2 text-sm text-gray-700">YES</span>
                            </label>

                            <label className="flex items-center">
                              <input
                                type="radio"
                                name={`govRelationship_${entryIndex}`}
                                value="NO"
                                checked={getFieldValue(entryIndex, 'governmentRelationship.hasRelationship') === "NO"}
                                onChange={(e) => handleFieldChange(entryIndex, 'governmentRelationship.hasRelationship.value', "NO")}
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                              />
                              <span className="ml-2 text-sm text-gray-700">NO</span>
                            </label>
                          </div>
                        </fieldset>
                      </div>

                      {/* Government Relationship Details */}
                      {getFieldValue(entryIndex, 'governmentRelationship.hasRelationship') === "YES" && (
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Describe the relationship
                            </label>
                            <textarea
                              value={getFieldValue(entryIndex, 'governmentRelationship.relationshipDescription')}
                              onChange={(e) => handleFieldChange(entryIndex, 'governmentRelationship.relationshipDescription.value', e.target.value)}
                              rows={3}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              placeholder="Provide details about the government relationship"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}

            {/* No entries message */}
            {foreignContactEntries.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <p>No foreign contacts added yet.</p>
                <button
                  type="button"
                  onClick={handleAddForeignContact}
                  className="mt-2 inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Add First Foreign Contact
                </button>
              </div>
            )}
          </div>
        )}

        {/* Validation Summary */}
        {validationErrors && Object.keys(validationErrors).length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <h4 className="text-sm font-medium text-red-800 mb-2">Please fix the following errors:</h4>
            <ul className="text-sm text-red-700 space-y-1">
              {Object.entries(validationErrors).map(([field, messages]) => (
                <li key={field}>
                  {field}: {messages.join(', ')}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Form Actions */}
        <div className="flex items-center justify-between pt-6 border-t border-gray-200">
          <div className="text-sm text-gray-500">
            {isDirty && <span className="text-yellow-600">Unsaved changes</span>}
          </div>

          <div className="flex items-center space-x-4">
            <button
              type="button"
              onClick={() => window.history.back()}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Previous
            </button>

            <button
              type="submit"
              disabled={!isValid}
              className={`px-6 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                isValid
                  ? 'bg-blue-600 hover:bg-blue-700'
                  : 'bg-gray-400 cursor-not-allowed'
              }`}
            >
              Save & Continue
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default Section19Component;