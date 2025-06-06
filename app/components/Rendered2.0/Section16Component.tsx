/**
 * Section 16: People Who Know You Well - Component
 *
 * React component for SF-86 Section 16 using the new Form Architecture 2.0.
 * This component handles collection of "People Who Know You Well" information with
 * 3 person entries and 36 fields each (108 total fields).
 */

import React, { useEffect, useState } from 'react';
import { useSection16 } from '~/state/contexts/sections2.0/section16';
import { useSF86Form } from '~/state/contexts/SF86FormContext';
import type { PersonWhoKnowsYouEntry } from '~/api/interfaces/sections2.0/section16';

interface Section16ComponentProps {
  className?: string;
  onValidationChange?: (isValid: boolean) => void;
  onNext?: () => void;
}

/**
 * Section 16 Component Implementation
 */
export const Section16Component: React.FC<Section16ComponentProps> = ({
  className = '',
  onValidationChange,
  onNext
}) => {
  console.log('🔄 Section16Component: Component initializing...');

  // ============================================================================
  // CONTEXT HOOKS
  // ============================================================================

  const {
    section16Data,
    isLoading,
    errors,
    isDirty,
    updatePersonWhoKnowsYou,
    updateFieldValue,
    validateSection,
    resetSection,
    isComplete
  } = useSection16();

  console.log('🔍 Section16Component: Context data loaded', {
    section16Data,
    isLoading,
    errors,
    isDirty,
    totalPeople: section16Data?.section16?.peopleWhoKnowYou?.length || 0
  });

        // SF86 Form Context for data persistence
        const sf86Form = useSF86Form();

  const { registeredSections } = useSF86Form();

  // ============================================================================
  // LOCAL STATE
  // ============================================================================

  const [localValidation, setLocalValidation] = useState({ isValid: true, errors: [], warnings: [] });

  // ============================================================================
  // EFFECTS
  // ============================================================================

  // Validate section when data changes
  useEffect(() => {
    const validation = validateSection();
    setLocalValidation(validation);
    onValidationChange?.(validation.isValid);
  }, [section16Data, validateSection, onValidationChange]);

  // ============================================================================
  // EVENT HANDLERS
  // ============================================================================


  // Handle form submission with data persistence
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = validateSection();
    setIsValid(result.isValid);
    onValidationChange?.(result.isValid);

    if (result.isValid) {
      try {
        // Update the central form context with Section 6 data
        sf86Form.updateSectionData('section16', section16Data);

        // Save the form data to persistence layer
        await sf86Form.saveForm();

        console.log('✅ Section 16 data saved successfully:', section16Data);

        // Proceed to next section if callback provided
        if (onNext) {
          onNext();
        }
      } catch (error) {
        console.error('❌ Failed to save Section 16 data:', error);
        // Could show an error message to user here
      }
    }
  };

  const handlePersonFieldChange = (personIndex: number, fieldPath: string, value: any) => {
    console.log('🔄 Section16Component: handlePersonFieldChange called', {
      personIndex,
      fieldPath,
      value,
      timestamp: new Date().toISOString()
    });

    const person = section16Data.section16.peopleWhoKnowYou[personIndex];
    if (!person) {
      console.warn('⚠️ Section16Component: Person not found', { personIndex, totalPeople: section16Data.section16.peopleWhoKnowYou.length });
      return;
    }

    console.log('🔍 Section16Component: Current person data', { personIndex, person });

    // FIXED: Properly update Field<T> structure without corrupting it
    // Instead of spreading the entire person object, just pass the field update
    const fieldUpdate: Partial<PersonWhoKnowsYouEntry> = {};

    // Handle nested address fields
    if (fieldPath.startsWith('address.')) {
      const addressField = fieldPath.replace('address.', '') as keyof typeof person.address;
      const currentAddressField = person.address[addressField];

      if (currentAddressField && typeof currentAddressField === 'object' && 'value' in currentAddressField) {
        fieldUpdate.address = {
          ...person.address,
          [addressField]: {
            ...currentAddressField,
            value
          }
        };
      }
    } else {
      // Handle direct fields - preserve Field<T> structure
      const currentField = (person as any)[fieldPath];

      if (currentField && typeof currentField === 'object' && 'value' in currentField) {
        (fieldUpdate as any)[fieldPath] = {
          ...currentField,
          value
        };
      }
    }

    console.log('🔍 Section16Component: About to call updatePersonWhoKnowsYou', {
      personIndex,
      fieldUpdate,
      fieldPath,
      value
    });

    updatePersonWhoKnowsYou(personIndex, fieldUpdate);

    console.log('✅ Section16Component: updatePersonWhoKnowsYou called successfully');
  };

  const handleReset = () => {
    if (confirm('Are you sure you want to reset all Section 16 data? This action cannot be undone.')) {
      resetSection();
    }
  };

  // ============================================================================
  // RENDER HELPERS
  // ============================================================================

  const renderSectionInfo = () => (
    <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
      <h2 className="text-xl font-semibold text-blue-900 mb-2">Section 16: People Who Know You Well</h2>
      <p className="text-blue-700 text-sm mb-2">
        Provide information about 3 people who know you well. Each person requires 36 fields of information
        including personal details, contact information, address, dates known, professional information,
        and relationship details.
      </p>
      <div className="text-xs text-blue-600">
        <span className="font-medium">Status:</span> {isComplete() ? 'Complete' : 'Incomplete'} |{' '}
        <span className="font-medium">Validation:</span> {localValidation.isValid ? 'Valid' : 'Invalid'} |{' '}
        <span className="font-medium">Changes:</span> {isDirty ? 'Unsaved' : 'Saved'} |{' '}
        <span className="font-medium">Total Fields:</span> 108 (36 per person × 3 people)
      </div>
    </div>
  );

  const renderPersonForm = (person: PersonWhoKnowsYouEntry, personIndex: number) => (
    <div className="mb-8 p-6 border border-gray-200 rounded-lg bg-white shadow-sm">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium text-gray-900">Person {personIndex + 1} Who Knows You Well</h3>
        <span className="text-sm text-gray-500">36 fields</span>
      </div>

      {/* Personal Information (4 fields) */}
      <div className="mb-6">
        <h4 className="text-md font-medium text-gray-800 mb-3">Personal Information</h4>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">First Name *</label>
            <input
              type="text"
              value={person.firstName?.value || ''}
              onChange={(e) => handlePersonFieldChange(personIndex, 'firstName', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              data-testid={`person-${personIndex}-firstName`}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Middle Name</label>
            <input
              type="text"
              value={person.middleName?.value || ''}
              onChange={(e) => handlePersonFieldChange(personIndex, 'middleName', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              data-testid={`person-${personIndex}-middleName`}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Last Name *</label>
            <input
              type="text"
              value={person.lastName?.value || ''}
              onChange={(e) => handlePersonFieldChange(personIndex, 'lastName', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              data-testid={`person-${personIndex}-lastName`}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Suffix</label>
            <input
              type="text"
              value={person.suffix?.value || ''}
              onChange={(e) => handlePersonFieldChange(personIndex, 'suffix', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              data-testid={`person-${personIndex}-suffix`}
            />
          </div>
        </div>
      </div>

      {/* Dates Known (5 fields) */}
      <div className="mb-6">
        <h4 className="text-md font-medium text-gray-800 mb-3">Dates Known</h4>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">From Date (MM/YYYY)</label>
            <input
              type="text"
              value={person.datesKnownFrom?.value || ''}
              onChange={(e) => handlePersonFieldChange(personIndex, 'datesKnownFrom', e.target.value)}
              placeholder="MM/YYYY"
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              data-testid={`person-${personIndex}-datesKnownFrom`}
            />
            <div className="mt-1">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={person.datesKnownFromEstimate?.value || false}
                  onChange={(e) => handlePersonFieldChange(personIndex, 'datesKnownFromEstimate', e.target.checked)}
                  className="mr-2"
                  data-testid={`person-${personIndex}-datesKnownFromEstimate`}
                />
                <span className="text-sm text-gray-600">Estimate</span>
              </label>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">To Date (MM/YYYY)</label>
            <input
              type="text"
              value={person.datesKnownTo?.value || ''}
              onChange={(e) => handlePersonFieldChange(personIndex, 'datesKnownTo', e.target.value)}
              placeholder="MM/YYYY"
              disabled={person.datesKnownIsPresent?.value || false}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
              data-testid={`person-${personIndex}-datesKnownTo`}
            />
            <div className="mt-1 space-y-1">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={person.datesKnownToEstimate?.value || false}
                  onChange={(e) => handlePersonFieldChange(personIndex, 'datesKnownToEstimate', e.target.checked)}
                  disabled={person.datesKnownIsPresent?.value || false}
                  className="mr-2"
                  data-testid={`person-${personIndex}-datesKnownToEstimate`}
                />
                <span className="text-sm text-gray-600">Estimate</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={person.datesKnownIsPresent?.value || false}
                  onChange={(e) => handlePersonFieldChange(personIndex, 'datesKnownIsPresent', e.target.checked)}
                  className="mr-2"
                  data-testid={`person-${personIndex}-datesKnownIsPresent`}
                />
                <span className="text-sm text-gray-600">Present</span>
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Contact Information (6 fields) */}
      <div className="mb-6">
        <h4 className="text-md font-medium text-gray-800 mb-3">Contact Information</h4>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
            <input
              type="email"
              value={person.emailAddress?.value || ''}
              onChange={(e) => handlePersonFieldChange(personIndex, 'emailAddress', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              data-testid={`person-${personIndex}-emailAddress`}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone Extension</label>
            <input
              type="text"
              value={person.phoneExtension?.value || ''}
              onChange={(e) => handlePersonFieldChange(personIndex, 'phoneExtension', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              data-testid={`person-${personIndex}-phoneExtension`}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
            <input
              type="tel"
              value={person.phoneNumber?.value || ''}
              onChange={(e) => handlePersonFieldChange(personIndex, 'phoneNumber', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              data-testid={`person-${personIndex}-phoneNumber`}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Mobile Number</label>
            <input
              type="tel"
              value={person.mobileNumber?.value || ''}
              onChange={(e) => handlePersonFieldChange(personIndex, 'mobileNumber', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              data-testid={`person-${personIndex}-mobileNumber`}
            />
          </div>
        </div>
        <div className="mt-3 flex gap-4">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={person.phoneDay?.value || false}
              onChange={(e) => handlePersonFieldChange(personIndex, 'phoneDay', e.target.checked)}
              className="mr-2"
              data-testid={`person-${personIndex}-phoneDay`}
            />
            <span className="text-sm text-gray-600">Day Phone</span>
          </label>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={person.phoneNight?.value || false}
              onChange={(e) => handlePersonFieldChange(personIndex, 'phoneNight', e.target.checked)}
              className="mr-2"
              data-testid={`person-${personIndex}-phoneNight`}
            />
            <span className="text-sm text-gray-600">Night Phone</span>
          </label>
        </div>
      </div>

      {/* Address Information (5 fields) */}
      <div className="mb-6">
        <h4 className="text-md font-medium text-gray-800 mb-3">Address Information</h4>
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Street Address</label>
            <input
              type="text"
              value={person.address?.street?.value || ''}
              onChange={(e) => handlePersonFieldChange(personIndex, 'address.street', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              data-testid={`person-${personIndex}-address-street`}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
            <input
              type="text"
              value={person.address?.city?.value || ''}
              onChange={(e) => handlePersonFieldChange(personIndex, 'address.city', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              data-testid={`person-${personIndex}-address-city`}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
            <input
              type="text"
              value={person.address?.state?.value || ''}
              onChange={(e) => handlePersonFieldChange(personIndex, 'address.state', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              data-testid={`person-${personIndex}-address-state`}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">ZIP Code</label>
            <input
              type="text"
              value={person.address?.zipCode?.value || ''}
              onChange={(e) => handlePersonFieldChange(personIndex, 'address.zipCode', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              data-testid={`person-${personIndex}-address-zipCode`}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
            <input
              type="text"
              value={person.address?.country?.value || ''}
              onChange={(e) => handlePersonFieldChange(personIndex, 'address.country', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              data-testid={`person-${personIndex}-address-country`}
            />
          </div>
        </div>
      </div>

      {/* Professional Information (3 fields) */}
      <div className="mb-6">
        <h4 className="text-md font-medium text-gray-800 mb-3">Professional Information</h4>
        <div className="grid grid-cols-1 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Rank/Title</label>
            <input
              type="text"
              value={person.rankTitle?.value || ''}
              onChange={(e) => handlePersonFieldChange(personIndex, 'rankTitle', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              data-testid={`person-${personIndex}-rankTitle`}
            />
          </div>
        </div>
        <div className="mt-3 flex gap-4">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={person.rankTitleNotApplicable?.value || false}
              onChange={(e) => handlePersonFieldChange(personIndex, 'rankTitleNotApplicable', e.target.checked)}
              className="mr-2"
              data-testid={`person-${personIndex}-rankTitleNotApplicable`}
            />
            <span className="text-sm text-gray-600">Not Applicable</span>
          </label>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={person.rankTitleDontKnow?.value || false}
              onChange={(e) => handlePersonFieldChange(personIndex, 'rankTitleDontKnow', e.target.checked)}
              className="mr-2"
              data-testid={`person-${personIndex}-rankTitleDontKnow`}
            />
            <span className="text-sm text-gray-600">Don't Know</span>
          </label>
        </div>
      </div>

      {/* Relationship Information (6 fields) */}
      <div className="mb-6">
        <h4 className="text-md font-medium text-gray-800 mb-3">Relationship Information</h4>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Other Relationship Explanation</label>
            <input
              type="text"
              value={person.relationshipOtherExplanation?.value || ''}
              onChange={(e) => handlePersonFieldChange(personIndex, 'relationshipOtherExplanation', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              data-testid={`person-${personIndex}-relationshipOtherExplanation`}
            />
          </div>
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Additional Information</label>
            <textarea
              value={person.additionalInfo?.value || ''}
              onChange={(e) => handlePersonFieldChange(personIndex, 'additionalInfo', e.target.value)}
              rows={3}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              data-testid={`person-${personIndex}-additionalInfo`}
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={person.relationshipFriend?.value || false}
              onChange={(e) => handlePersonFieldChange(personIndex, 'relationshipFriend', e.target.checked)}
              className="mr-2"
              data-testid={`person-${personIndex}-relationshipFriend`}
            />
            <span className="text-sm text-gray-600">Friend</span>
          </label>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={person.relationshipNeighbor?.value || false}
              onChange={(e) => handlePersonFieldChange(personIndex, 'relationshipNeighbor', e.target.checked)}
              className="mr-2"
              data-testid={`person-${personIndex}-relationshipNeighbor`}
            />
            <span className="text-sm text-gray-600">Neighbor</span>
          </label>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={person.relationshipSchoolmate?.value || false}
              onChange={(e) => handlePersonFieldChange(personIndex, 'relationshipSchoolmate', e.target.checked)}
              className="mr-2"
              data-testid={`person-${personIndex}-relationshipSchoolmate`}
            />
            <span className="text-sm text-gray-600">Schoolmate</span>
          </label>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={person.relationshipWorkAssociate?.value || false}
              onChange={(e) => handlePersonFieldChange(personIndex, 'relationshipWorkAssociate', e.target.checked)}
              className="mr-2"
              data-testid={`person-${personIndex}-relationshipWorkAssociate`}
            />
            <span className="text-sm text-gray-600">Work Associate</span>
          </label>
        </div>
      </div>

      {/* Additional Fields (7 fields to reach 36 total) */}
      <div className="mb-6">
        <h4 className="text-md font-medium text-gray-800 mb-3">Additional Information</h4>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Additional Text Field 1</label>
            <input
              type="text"
              value={person.additionalTextField1?.value || ''}
              onChange={(e) => handlePersonFieldChange(personIndex, 'additionalTextField1', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              data-testid={`person-${personIndex}-additionalTextField1`}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Additional Text Field 2</label>
            <input
              type="text"
              value={person.additionalTextField2?.value || ''}
              onChange={(e) => handlePersonFieldChange(personIndex, 'additionalTextField2', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              data-testid={`person-${personIndex}-additionalTextField2`}
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={person.phoneInternational?.value || false}
              onChange={(e) => handlePersonFieldChange(personIndex, 'phoneInternational', e.target.checked)}
              className="mr-2"
              data-testid={`person-${personIndex}-phoneInternational`}
            />
            <span className="text-sm text-gray-600">International Phone</span>
          </label>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={person.phoneDontKnow?.value || false}
              onChange={(e) => handlePersonFieldChange(personIndex, 'phoneDontKnow', e.target.checked)}
              className="mr-2"
              data-testid={`person-${personIndex}-phoneDontKnow`}
            />
            <span className="text-sm text-gray-600">Don't Know Phone</span>
          </label>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={person.relationshipOther?.value || false}
              onChange={(e) => handlePersonFieldChange(personIndex, 'relationshipOther', e.target.checked)}
              className="mr-2"
              data-testid={`person-${personIndex}-relationshipOther`}
            />
            <span className="text-sm text-gray-600">Other Relationship</span>
          </label>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={person.additionalCheckbox1?.value || false}
              onChange={(e) => handlePersonFieldChange(personIndex, 'additionalCheckbox1', e.target.checked)}
              className="mr-2"
              data-testid={`person-${personIndex}-additionalCheckbox1`}
            />
            <span className="text-sm text-gray-600">Additional Option 1</span>
          </label>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={person.additionalCheckbox2?.value || false}
              onChange={(e) => handlePersonFieldChange(personIndex, 'additionalCheckbox2', e.target.checked)}
              className="mr-2"
              data-testid={`person-${personIndex}-additionalCheckbox2`}
            />
            <span className="text-sm text-gray-600">Additional Option 2</span>
          </label>
        </div>
      </div>
    </div>
  );

  const renderValidationErrors = () => {
    if (localValidation.isValid && Object.keys(errors).length === 0) return null;

    return (
      <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
        <h4 className="text-red-900 font-medium mb-2">Validation Issues</h4>
        <ul className="text-red-700 text-sm space-y-1">
          {localValidation.errors.map((error, index) => (
            <li key={index}>• {error.message}</li>
          ))}
          {Object.entries(errors).map(([field, message]) => (
            <li key={field}>• {field}: {message}</li>
          ))}
        </ul>
      </div>
    );
  };

  const renderDebugInfo = () => {
    const isDebugMode = typeof window !== 'undefined' && window.location.search.includes('debug=true');
    if (!isDebugMode) return null;

    return (
      <div className="mt-6 p-4 bg-gray-100 border border-gray-300 rounded-lg">
        <h4 className="font-medium text-gray-900 mb-2">Debug Information</h4>
        <div className="text-xs text-gray-600 space-y-1">
          <div>Section registered: {registeredSections.some(s => s.sectionId === 'section16') ? 'Yes' : 'No'}</div>
          <div>Data loaded: {section16Data ? 'Yes' : 'No'}</div>
          <div>Loading: {isLoading ? 'Yes' : 'No'}</div>
          <div>Dirty: {isDirty ? 'Yes' : 'No'}</div>
          <div>Complete: {isComplete() ? 'Yes' : 'No'}</div>
          <div>Validation errors: {localValidation.errors.length}</div>
          <div>Context errors: {Object.keys(errors).length}</div>
        </div>
      </div>
    );
  };

  // ============================================================================
  // MAIN RENDER
  // ============================================================================

  if (isLoading) {
    return (
      <div className={`p-6 ${className}`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading Section 16...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`p-6 max-w-6xl mx-auto ${className}`}>
      {renderSectionInfo()}
      {renderValidationErrors()}

      <div className="space-y-8">
        {/* Note about Section16_1 fields */}
        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <h4 className="text-yellow-900 font-medium mb-2">Cross-Section Field Mapping</h4>
          <p className="text-yellow-700 text-sm">
            Note: Section16_1 fields (Foreign Organization Contact) are handled in Section 15 Entry 2
            per the cross-section field mapping implementation. Only "People Who Know You Well" fields
            are displayed here.
          </p>
        </div>

        {/* Render all 3 people who know you well */}
        {section16Data.section16.peopleWhoKnowYou.map((person, index) => (
          <div key={index}>
            {renderPersonForm(person, index)}
          </div>
        ))}

        {/* Summary Information */}
        <div className="mt-8 p-4 bg-gray-50 border border-gray-200 rounded-lg">
          <h4 className="font-medium text-gray-900 mb-2">Section Summary</h4>
          <div className="text-sm text-gray-600 space-y-1">
            <div>Total People: {section16Data.section16.peopleWhoKnowYou.length} / 3 required</div>
            <div>Total Fields: 108 (36 fields × 3 people)</div>
            <div>Completed People: {section16Data.section16.peopleWhoKnowYou.filter(person =>
              person.firstName?.value && person.lastName?.value
            ).length}</div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-200">
        <button
          onClick={handleReset}
          className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
        >
          Reset Section
        </button>

        <div className="flex gap-3">
          <button
            onClick={onNext}
            disabled={!localValidation.isValid}
            className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            Continue to Next Section
          </button>
        </div>
      </div>

      {renderDebugInfo()}
    </div>
  );
};

export default Section16Component;