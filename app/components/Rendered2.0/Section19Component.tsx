/**
 * Section 19: Foreign Activities - Component
 *
 * React component for SF-86 Section 19 using the new Form Architecture 2.0.
 * This component handles foreign contacts and activities with full CRUD operations
 * and integrates with the comprehensive Section19Provider context.
 *
 * COMPREHENSIVE FIELD COVERAGE (277 total fields across 4 subsections):
 * - Personal Information: Name, DOB, place of birth, address
 * - Citizenship Information: Primary/secondary countries
 * - Contact Methods: 5 checkboxes (in-person, telephone, electronic, written, other)
 * - Contact Dates: First/last contact with estimated flags
 * - Contact Frequency: Radio button groups (1-6 scale)
 * - Relationship Types: Professional, personal, obligation, other + explanations
 * - Additional Names Table: 4 rows × 4 columns (16 fields)
 * - Employment Information: Employer details and address
 * - Government Relationship: Security/intelligence connections
 *
 * SUBSECTION MAPPING:
 * - Entry 0 → Section19_1 (Subsection 1)
 * - Entry 1 → Section19_2 (Subsection 2)
 * - Entry 2 → Section19_3 (Subsection 3)
 * - Entry 3 → Section19_4 (Subsection 4)
 *
 * FIELD BREAKDOWN BY CATEGORY:
 * 1. Main Radio Button: 1 field (hasContact)
 * 2. Personal Information: ~45 fields per entry
 *    - Name fields: first, middle, last, suffix, unknown (5 fields)
 *    - Date of birth: date, estimated, unknown (3 fields)
 *    - Place of birth: city, country, unknown (3 fields)
 *    - Address: street, city, state, zip, country, unknown (6 fields)
 * 3. Citizenship: ~6 fields per entry
 *    - Primary country, secondary country, unknown (3 fields)
 * 4. Contact Methods: ~12 fields per entry
 *    - 5 checkboxes: inPerson, telephone, electronic, written, other
 *    - Other explanation field (6 fields total)
 * 5. Contact Dates: ~8 fields per entry
 *    - First contact: date, estimated (2 fields)
 *    - Last contact: date, estimated (2 fields)
 * 6. Contact Frequency: ~2 fields per entry
 *    - Radio button group (1-6 scale)
 * 7. Relationship Types: ~12 fields per entry
 *    - 4 checkboxes: professional, personal, obligation, other
 *    - 4 explanation fields for each type (8 fields total)
 * 8. Additional Names Table: 16 fields per entry
 *    - 4 rows × 4 columns (last, first, middle, suffix)
 * 9. Employment Information: ~12 fields per entry
 *    - Employer name, unknown employer checkbox
 *    - Employer address: street, city, state, zip, country, unknown (6 fields)
 * 10. Government Relationship: ~12 fields per entry
 *     - Has relationship radio, description
 *     - Additional details radio
 *     - Government address: street, apoFpo, state, zip (4 fields)
 *
 * TOTAL: 1 main + (4 entries × ~69 fields) = 277 fields
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
const MAX_FOREIGN_CONTACTS = 4;

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

// Suffix options for names
const SUFFIXES = [
  { value: "", label: "Select suffix..." },
  { value: "Jr.", label: "Jr." },
  { value: "Sr.", label: "Sr." },
  { value: "II", label: "II" },
  { value: "III", label: "III" },
  { value: "IV", label: "IV" },
  { value: "V", label: "V" },
  { value: "VI", label: "VI" },
  { value: "VII", label: "VII" },
  { value: "VIII", label: "VIII" },
  { value: "IX", label: "IX" },
  { value: "X", label: "X" }
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

    // If current is a Field object, return its value, otherwise return current if it's a primitive
    if (current && typeof current === 'object' && 'value' in current) {
      return current.value || '';
    }

    // Return primitive values or empty string for objects
    return typeof current === 'object' ? '' : current || '';
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
                  data-testid="has-foreign-contacts-yes"
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
                  data-testid="has-foreign-contacts-no"
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
                  data-testid="add-foreign-contact"
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

                        {/* Date of Birth Flags */}
                        <div className="space-y-2">
                          <label className="flex items-center">
                            <input
                              type="checkbox"
                              checked={getFieldValue(entryIndex, 'personalInfo.dateOfBirth.estimated')}
                              onChange={(e) => handleCheckboxChange(entryIndex, 'personalInfo.dateOfBirth.estimated.value', e.target.checked)}
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            <span className="ml-2 text-sm text-gray-700">Date is estimated</span>
                          </label>
                          <label className="flex items-center">
                            <input
                              type="checkbox"
                              checked={getFieldValue(entryIndex, 'personalInfo.dateOfBirth.unknown')}
                              onChange={(e) => handleCheckboxChange(entryIndex, 'personalInfo.dateOfBirth.unknown.value', e.target.checked)}
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            <span className="ml-2 text-sm text-gray-700">Date of birth unknown</span>
                          </label>
                        </div>

                        {/* Place of Birth */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Place of Birth - City
                          </label>
                          <input
                            type="text"
                            value={getFieldValue(entryIndex, 'personalInfo.placeOfBirth.city')}
                            onChange={(e) => handleFieldChange(entryIndex, 'personalInfo.placeOfBirth.city.value', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Enter city of birth"
                          />
                        </div>

                        {/* Place of Birth - Country */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Place of Birth - Country
                          </label>
                          <select
                            value={getFieldValue(entryIndex, 'personalInfo.placeOfBirth.country')}
                            onChange={(e) => handleFieldChange(entryIndex, 'personalInfo.placeOfBirth.country.value', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          >
                            {COUNTRIES.map(country => (
                              <option key={country.value} value={country.value}>
                                {country.label}
                              </option>
                            ))}
                          </select>
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

                        {/* Place of Birth Unknown Checkbox */}
                        <div className="md:col-span-2">
                          <label className="flex items-center">
                            <input
                              type="checkbox"
                              checked={getFieldValue(entryIndex, 'personalInfo.placeOfBirth.unknown')}
                              onChange={(e) => handleCheckboxChange(entryIndex, 'personalInfo.placeOfBirth.unknown.value', e.target.checked)}
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            <span className="ml-2 text-sm text-gray-700">Place of birth unknown</span>
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

                      </div>
                    </div>

                    {/* Current Address Section */}
                    <div>
                      <h4 className="text-md font-medium text-gray-900 mb-4">Current Address</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Street Address */}
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Street Address
                          </label>
                          <input
                            type="text"
                            value={getFieldValue(entryIndex, 'personalInfo.address.street')}
                            onChange={(e) => handleFieldChange(entryIndex, 'personalInfo.address.street.value', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Enter street address"
                          />
                        </div>

                        {/* City */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            City
                          </label>
                          <input
                            type="text"
                            value={getFieldValue(entryIndex, 'personalInfo.address.city')}
                            onChange={(e) => handleFieldChange(entryIndex, 'personalInfo.address.city.value', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Enter city"
                          />
                        </div>

                        {/* State */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            State/Province
                          </label>
                          <input
                            type="text"
                            value={getFieldValue(entryIndex, 'personalInfo.address.state')}
                            onChange={(e) => handleFieldChange(entryIndex, 'personalInfo.address.state.value', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Enter state or province"
                          />
                        </div>

                        {/* ZIP Code */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            ZIP/Postal Code
                          </label>
                          <input
                            type="text"
                            value={getFieldValue(entryIndex, 'personalInfo.address.zipCode')}
                            onChange={(e) => handleFieldChange(entryIndex, 'personalInfo.address.zipCode.value', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Enter ZIP or postal code"
                          />
                        </div>

                        {/* Country */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Country
                          </label>
                          <select
                            value={getFieldValue(entryIndex, 'personalInfo.address.country')}
                            onChange={(e) => handleFieldChange(entryIndex, 'personalInfo.address.country.value', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          >
                            {COUNTRIES.map(country => (
                              <option key={country.value} value={country.value}>
                                {country.label}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Address Unknown Checkbox */}
                        <div className="md:col-span-2">
                          <label className="flex items-center">
                            <input
                              type="checkbox"
                              checked={getFieldValue(entryIndex, 'personalInfo.address.unknown')}
                              onChange={(e) => handleCheckboxChange(entryIndex, 'personalInfo.address.unknown.value', e.target.checked)}
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            <span className="ml-2 text-sm text-gray-700">Address unknown</span>
                          </label>
                        </div>
                      </div>
                    </div>

                    {/* Contact Methods Section */}
                    <div>
                      <h4 className="text-md font-medium text-gray-900 mb-4">Contact Methods</h4>
                      <div className="space-y-4">
                        <p className="text-sm text-gray-600">Select all methods by which you have had contact with this person:</p>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {/* In Person Contact */}
                          <label className="flex items-center">
                            <input
                              type="checkbox"
                              checked={getFieldValue(entryIndex, 'contactMethods.inPerson')}
                              onChange={(e) => handleCheckboxChange(entryIndex, 'contactMethods.inPerson.value', e.target.checked)}
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            <span className="ml-2 text-sm text-gray-700">In person</span>
                          </label>

                          {/* Telephone Contact */}
                          <label className="flex items-center">
                            <input
                              type="checkbox"
                              checked={getFieldValue(entryIndex, 'contactMethods.telephone')}
                              onChange={(e) => handleCheckboxChange(entryIndex, 'contactMethods.telephone.value', e.target.checked)}
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            <span className="ml-2 text-sm text-gray-700">Telephone</span>
                          </label>

                          {/* Electronic Contact */}
                          <label className="flex items-center">
                            <input
                              type="checkbox"
                              checked={getFieldValue(entryIndex, 'contactMethods.electronic')}
                              onChange={(e) => handleCheckboxChange(entryIndex, 'contactMethods.electronic.value', e.target.checked)}
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            <span className="ml-2 text-sm text-gray-700">Electronic (email, internet, etc.)</span>
                          </label>

                          {/* Written Correspondence */}
                          <label className="flex items-center">
                            <input
                              type="checkbox"
                              checked={getFieldValue(entryIndex, 'contactMethods.writtenCorrespondence')}
                              onChange={(e) => handleCheckboxChange(entryIndex, 'contactMethods.writtenCorrespondence.value', e.target.checked)}
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            <span className="ml-2 text-sm text-gray-700">Written correspondence</span>
                          </label>

                          {/* Other Contact Method */}
                          <label className="flex items-center">
                            <input
                              type="checkbox"
                              checked={getFieldValue(entryIndex, 'contactMethods.other')}
                              onChange={(e) => handleCheckboxChange(entryIndex, 'contactMethods.other.value', e.target.checked)}
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            <span className="ml-2 text-sm text-gray-700">Other</span>
                          </label>
                        </div>

                        {/* Other Contact Method Explanation */}
                        {getFieldValue(entryIndex, 'contactMethods.other') && (
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Explain other contact method
                            </label>
                            <textarea
                              value={getFieldValue(entryIndex, 'contactMethods.otherExplanation')}
                              onChange={(e) => handleFieldChange(entryIndex, 'contactMethods.otherExplanation.value', e.target.value)}
                              rows={2}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              placeholder="Describe the other contact method"
                            />
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Contact Dates Section */}
                    <div>
                      <h4 className="text-md font-medium text-gray-900 mb-4">Contact Dates</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* First Contact Date */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            First Contact Date
                          </label>
                          <input
                            type="date"
                            value={getFieldValue(entryIndex, 'contactDates.firstContact')}
                            onChange={(e) => handleFieldChange(entryIndex, 'contactDates.firstContact.value', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                          <label className="flex items-center mt-2">
                            <input
                              type="checkbox"
                              checked={getFieldValue(entryIndex, 'contactDates.firstContactEstimated')}
                              onChange={(e) => handleCheckboxChange(entryIndex, 'contactDates.firstContactEstimated.value', e.target.checked)}
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            <span className="ml-2 text-sm text-gray-700">Date is estimated</span>
                          </label>
                        </div>

                        {/* Last Contact Date */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Last Contact Date
                          </label>
                          <input
                            type="date"
                            value={getFieldValue(entryIndex, 'contactDates.lastContact')}
                            onChange={(e) => handleFieldChange(entryIndex, 'contactDates.lastContact.value', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                          <label className="flex items-center mt-2">
                            <input
                              type="checkbox"
                              checked={getFieldValue(entryIndex, 'contactDates.lastContactEstimated')}
                              onChange={(e) => handleCheckboxChange(entryIndex, 'contactDates.lastContactEstimated.value', e.target.checked)}
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            <span className="ml-2 text-sm text-gray-700">Date is estimated</span>
                          </label>
                        </div>
                      </div>
                    </div>

                    {/* Contact Frequency Section */}
                    <div>
                      <h4 className="text-md font-medium text-gray-900 mb-4">Contact Frequency</h4>
                      <fieldset>
                        <legend className="text-sm text-gray-600 mb-3">How frequently do you have contact with this person?</legend>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                          {['1', '2', '3', '4', '5', '6'].map((freq) => (
                            <label key={freq} className="flex items-center">
                              <input
                                type="radio"
                                name={`contactFrequency_${entryIndex}`}
                                value={freq}
                                checked={getFieldValue(entryIndex, 'contactFrequency') === freq}
                                onChange={(e) => handleFieldChange(entryIndex, 'contactFrequency.value', freq)}
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                              />
                              <span className="ml-2 text-sm text-gray-700">Level {freq}</span>
                            </label>
                          ))}
                        </div>
                      </fieldset>
                    </div>

                    {/* Relationship Types Section */}
                    <div>
                      <h4 className="text-md font-medium text-gray-900 mb-4">Relationship Types</h4>
                      <div className="space-y-4">
                        <p className="text-sm text-gray-600">Select all that apply to describe your relationship with this person:</p>

                        {/* Professional/Business Relationship */}
                        <div>
                          <label className="flex items-center">
                            <input
                              type="checkbox"
                              checked={getFieldValue(entryIndex, 'relationshipTypes.professionalBusiness')}
                              onChange={(e) => handleCheckboxChange(entryIndex, 'relationshipTypes.professionalBusiness.value', e.target.checked)}
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            <span className="ml-2 text-sm text-gray-700">Professional/Business</span>
                          </label>
                          {getFieldValue(entryIndex, 'relationshipTypes.professionalBusiness') && (
                            <div className="mt-2 ml-6">
                              <textarea
                                value={getFieldValue(entryIndex, 'relationshipTypes.professionalExplanation')}
                                onChange={(e) => handleFieldChange(entryIndex, 'relationshipTypes.professionalExplanation.value', e.target.value)}
                                rows={2}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                placeholder="Explain the professional/business relationship"
                              />
                            </div>
                          )}
                        </div>

                        {/* Personal Relationship */}
                        <div>
                          <label className="flex items-center">
                            <input
                              type="checkbox"
                              checked={getFieldValue(entryIndex, 'relationshipTypes.personal')}
                              onChange={(e) => handleCheckboxChange(entryIndex, 'relationshipTypes.personal.value', e.target.checked)}
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            <span className="ml-2 text-sm text-gray-700">Personal</span>
                          </label>
                          {getFieldValue(entryIndex, 'relationshipTypes.personal') && (
                            <div className="mt-2 ml-6">
                              <textarea
                                value={getFieldValue(entryIndex, 'relationshipTypes.personalExplanation')}
                                onChange={(e) => handleFieldChange(entryIndex, 'relationshipTypes.personalExplanation.value', e.target.value)}
                                rows={2}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                placeholder="Explain the personal relationship"
                              />
                            </div>
                          )}
                        </div>

                        {/* Obligation Relationship */}
                        <div>
                          <label className="flex items-center">
                            <input
                              type="checkbox"
                              checked={getFieldValue(entryIndex, 'relationshipTypes.obligation')}
                              onChange={(e) => handleCheckboxChange(entryIndex, 'relationshipTypes.obligation.value', e.target.checked)}
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            <span className="ml-2 text-sm text-gray-700">Obligation</span>
                          </label>
                          {getFieldValue(entryIndex, 'relationshipTypes.obligation') && (
                            <div className="mt-2 ml-6">
                              <textarea
                                value={getFieldValue(entryIndex, 'relationshipTypes.obligationExplanation')}
                                onChange={(e) => handleFieldChange(entryIndex, 'relationshipTypes.obligationExplanation.value', e.target.value)}
                                rows={2}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                placeholder="Explain the obligation relationship"
                              />
                            </div>
                          )}
                        </div>

                        {/* Other Relationship */}
                        <div>
                          <label className="flex items-center">
                            <input
                              type="checkbox"
                              checked={getFieldValue(entryIndex, 'relationshipTypes.other')}
                              onChange={(e) => handleCheckboxChange(entryIndex, 'relationshipTypes.other.value', e.target.checked)}
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            <span className="ml-2 text-sm text-gray-700">Other</span>
                          </label>
                          {getFieldValue(entryIndex, 'relationshipTypes.other') && (
                            <div className="mt-2 ml-6">
                              <textarea
                                value={getFieldValue(entryIndex, 'relationshipTypes.otherExplanation')}
                                onChange={(e) => handleFieldChange(entryIndex, 'relationshipTypes.otherExplanation.value', e.target.value)}
                                rows={2}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                placeholder="Explain the other relationship type"
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Additional Names Table Section */}
                    <div>
                      <h4 className="text-md font-medium text-gray-900 mb-4">Additional Names</h4>
                      <p className="text-sm text-gray-600 mb-4">
                        List any other names by which this person is known (aliases, nicknames, maiden names, etc.)
                      </p>

                      <div className="overflow-x-auto">
                        <table className="min-w-full border border-gray-300">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-4 py-2 border-b border-gray-300 text-left text-sm font-medium text-gray-700">Last Name</th>
                              <th className="px-4 py-2 border-b border-gray-300 text-left text-sm font-medium text-gray-700">First Name</th>
                              <th className="px-4 py-2 border-b border-gray-300 text-left text-sm font-medium text-gray-700">Middle Name</th>
                              <th className="px-4 py-2 border-b border-gray-300 text-left text-sm font-medium text-gray-700">Suffix</th>
                            </tr>
                          </thead>
                          <tbody>
                            {['row1', 'row2', 'row3', 'row4'].map((rowKey, rowIndex) => (
                              <tr key={rowKey} className={rowIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                <td className="px-4 py-2 border-b border-gray-300">
                                  <input
                                    type="text"
                                    value={getFieldValue(entryIndex, `additionalNames.${rowKey}.last`)}
                                    onChange={(e) => handleFieldChange(entryIndex, `additionalNames.${rowKey}.last.value`, e.target.value)}
                                    className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="Last name"
                                  />
                                </td>
                                <td className="px-4 py-2 border-b border-gray-300">
                                  <input
                                    type="text"
                                    value={getFieldValue(entryIndex, `additionalNames.${rowKey}.first`)}
                                    onChange={(e) => handleFieldChange(entryIndex, `additionalNames.${rowKey}.first.value`, e.target.value)}
                                    className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="First name"
                                  />
                                </td>
                                <td className="px-4 py-2 border-b border-gray-300">
                                  <input
                                    type="text"
                                    value={getFieldValue(entryIndex, `additionalNames.${rowKey}.middle`)}
                                    onChange={(e) => handleFieldChange(entryIndex, `additionalNames.${rowKey}.middle.value`, e.target.value)}
                                    className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="Middle name"
                                  />
                                </td>
                                <td className="px-4 py-2 border-b border-gray-300">
                                  <select
                                    value={getFieldValue(entryIndex, `additionalNames.${rowKey}.suffix`)}
                                    onChange={(e) => handleFieldChange(entryIndex, `additionalNames.${rowKey}.suffix.value`, e.target.value)}
                                    className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                                  >
                                    {SUFFIXES.map(suffix => (
                                      <option key={suffix.value} value={suffix.value}>
                                        {suffix.label}
                                      </option>
                                    ))}
                                  </select>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Employment Information */}
                    <div>
                      <h4 className="text-md font-medium text-gray-900 mb-4">Employment Information</h4>
                      <div className="space-y-4">
                        {/* Employer Name */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Employer Name
                          </label>
                          <input
                            type="text"
                            value={getFieldValue(entryIndex, 'employment.employerName')}
                            onChange={(e) => handleFieldChange(entryIndex, 'employment.employerName.value', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Enter employer name"
                          />
                        </div>

                        {/* Unknown Employer Checkbox */}
                        <div>
                          <label className="flex items-center">
                            <input
                              type="checkbox"
                              checked={getFieldValue(entryIndex, 'employment.unknownEmployer')}
                              onChange={(e) => handleCheckboxChange(entryIndex, 'employment.unknownEmployer.value', e.target.checked)}
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            <span className="ml-2 text-sm text-gray-700">Employer unknown</span>
                          </label>
                        </div>

                        {/* Employer Address */}
                        <div>
                          <h5 className="text-sm font-medium text-gray-900 mb-3">Employer Address</h5>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Street Address */}
                            <div className="md:col-span-2">
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Street Address
                              </label>
                              <input
                                type="text"
                                value={getFieldValue(entryIndex, 'employment.employerAddress.street')}
                                onChange={(e) => handleFieldChange(entryIndex, 'employment.employerAddress.street.value', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                placeholder="Enter employer street address"
                              />
                            </div>

                            {/* City */}
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                City
                              </label>
                              <input
                                type="text"
                                value={getFieldValue(entryIndex, 'employment.employerAddress.city')}
                                onChange={(e) => handleFieldChange(entryIndex, 'employment.employerAddress.city.value', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                placeholder="Enter city"
                              />
                            </div>

                            {/* State */}
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                State/Province
                              </label>
                              <input
                                type="text"
                                value={getFieldValue(entryIndex, 'employment.employerAddress.state')}
                                onChange={(e) => handleFieldChange(entryIndex, 'employment.employerAddress.state.value', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                placeholder="Enter state or province"
                              />
                            </div>

                            {/* ZIP Code */}
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                ZIP/Postal Code
                              </label>
                              <input
                                type="text"
                                value={getFieldValue(entryIndex, 'employment.employerAddress.zipCode')}
                                onChange={(e) => handleFieldChange(entryIndex, 'employment.employerAddress.zipCode.value', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                placeholder="Enter ZIP or postal code"
                              />
                            </div>

                            {/* Country */}
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Country
                              </label>
                              <select
                                value={getFieldValue(entryIndex, 'employment.employerAddress.country')}
                                onChange={(e) => handleFieldChange(entryIndex, 'employment.employerAddress.country.value', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              >
                                {COUNTRIES.map(country => (
                                  <option key={country.value} value={country.value}>
                                    {country.label}
                                  </option>
                                ))}
                              </select>
                            </div>

                            {/* Employer Address Unknown Checkbox */}
                            <div className="md:col-span-2">
                              <label className="flex items-center">
                                <input
                                  type="checkbox"
                                  checked={getFieldValue(entryIndex, 'employment.employerAddress.unknown')}
                                  onChange={(e) => handleCheckboxChange(entryIndex, 'employment.employerAddress.unknown.value', e.target.checked)}
                                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                />
                                <span className="ml-2 text-sm text-gray-700">Employer address unknown</span>
                              </label>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Government Relationship Section */}
                    <div>
                      <h4 className="text-md font-medium text-gray-900 mb-4">Government Relationship</h4>
                      <div className="space-y-4">
                        <p className="text-sm text-gray-600">
                          Does this person have any affiliation with a foreign government, military, security, defense industry, foreign movement, or intelligence service?
                        </p>

                        {/* Has Relationship Radio */}
                        <fieldset>
                          <legend className="text-sm font-medium text-gray-700 mb-2">Government Relationship</legend>
                          <div className="space-y-2">
                            <label className="flex items-center">
                              <input
                                type="radio"
                                name={`governmentRelationship_${entryIndex}`}
                                value="YES"
                                checked={getFieldValue(entryIndex, 'governmentRelationship.hasRelationship') === 'YES'}
                                onChange={(e) => handleFieldChange(entryIndex, 'governmentRelationship.hasRelationship.value', 'YES')}
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                              />
                              <span className="ml-2 text-sm text-gray-700">Yes</span>
                            </label>
                            <label className="flex items-center">
                              <input
                                type="radio"
                                name={`governmentRelationship_${entryIndex}`}
                                value="NO"
                                checked={getFieldValue(entryIndex, 'governmentRelationship.hasRelationship') === 'NO'}
                                onChange={(e) => handleFieldChange(entryIndex, 'governmentRelationship.hasRelationship.value', 'NO')}
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                              />
                              <span className="ml-2 text-sm text-gray-700">No</span>
                            </label>
                          </div>
                        </fieldset>

                        {/* Relationship Description */}
                        {getFieldValue(entryIndex, 'governmentRelationship.hasRelationship') === 'YES' && (
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Describe the relationship
                            </label>
                            <textarea
                              value={getFieldValue(entryIndex, 'governmentRelationship.description')}
                              onChange={(e) => handleFieldChange(entryIndex, 'governmentRelationship.description.value', e.target.value)}
                              rows={3}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              placeholder="Provide details about the government relationship"
                            />
                          </div>
                        )}

                        {/* Additional Details Radio */}
                        {getFieldValue(entryIndex, 'governmentRelationship.hasRelationship') === 'YES' && (
                          <fieldset>
                            <legend className="text-sm font-medium text-gray-700 mb-2">Additional Details Required</legend>
                            <div className="space-y-2">
                              <label className="flex items-center">
                                <input
                                  type="radio"
                                  name={`additionalDetails_${entryIndex}`}
                                  value="YES"
                                  checked={getFieldValue(entryIndex, 'governmentRelationship.additionalDetails') === 'YES'}
                                  onChange={(e) => handleFieldChange(entryIndex, 'governmentRelationship.additionalDetails.value', 'YES')}
                                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                                />
                                <span className="ml-2 text-sm text-gray-700">Yes</span>
                              </label>
                              <label className="flex items-center">
                                <input
                                  type="radio"
                                  name={`additionalDetails_${entryIndex}`}
                                  value="NO"
                                  checked={getFieldValue(entryIndex, 'governmentRelationship.additionalDetails') === 'NO'}
                                  onChange={(e) => handleFieldChange(entryIndex, 'governmentRelationship.additionalDetails.value', 'NO')}
                                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                                />
                                <span className="ml-2 text-sm text-gray-700">No</span>
                              </label>
                            </div>
                          </fieldset>
                        )}

                        {/* Government Entity Address */}
                        {getFieldValue(entryIndex, 'governmentRelationship.additionalDetails') === 'YES' && (
                          <div>
                            <h5 className="text-sm font-medium text-gray-900 mb-3">Government Entity Address</h5>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {/* Street Address */}
                              <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  Street Address
                                </label>
                                <input
                                  type="text"
                                  value={getFieldValue(entryIndex, 'governmentRelationship.address.street')}
                                  onChange={(e) => handleFieldChange(entryIndex, 'governmentRelationship.address.street.value', e.target.value)}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                  placeholder="Enter government entity street address"
                                />
                              </div>

                              {/* APO/FPO */}
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  APO/FPO
                                </label>
                                <input
                                  type="text"
                                  value={getFieldValue(entryIndex, 'governmentRelationship.address.apoFpo')}
                                  onChange={(e) => handleFieldChange(entryIndex, 'governmentRelationship.address.apoFpo.value', e.target.value)}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                  placeholder="Enter APO/FPO if applicable"
                                />
                              </div>

                              {/* State */}
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  State/Province
                                </label>
                                <input
                                  type="text"
                                  value={getFieldValue(entryIndex, 'governmentRelationship.address.state')}
                                  onChange={(e) => handleFieldChange(entryIndex, 'governmentRelationship.address.state.value', e.target.value)}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                  placeholder="Enter state or province"
                                />
                              </div>

                              {/* ZIP Code */}
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  ZIP/Postal Code
                                </label>
                                <input
                                  type="text"
                                  value={getFieldValue(entryIndex, 'governmentRelationship.address.zipCode')}
                                  onChange={(e) => handleFieldChange(entryIndex, 'governmentRelationship.address.zipCode.value', e.target.value)}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                  placeholder="Enter ZIP or postal code"
                                />
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
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