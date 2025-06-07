/**
 * Section 18: Relatives and Associates - Component
 *
 * React component for SF-86 Section 18 using the new Form Architecture 2.0.
 * This component handles comprehensive relatives and associates information including
 * immediate family, extended family, and close associates/friends.
 */

import React, { useEffect, useState } from 'react';
import { useSection18 } from '~/state/contexts/sections2.0/section18';
import { useSF86Form } from '~/state/contexts/SF86FormContext';
import type {
  ImmediateFamilyEntry,
  ExtendedFamilyEntry,
  AssociateEntry,
  Section18SubsectionKey
} from '../../../api/interfaces/sections2.0/section18';
import {
  IMMEDIATE_FAMILY_RELATIONSHIP_OPTIONS,
  EXTENDED_FAMILY_RELATIONSHIP_OPTIONS,
  ASSOCIATE_TYPE_OPTIONS,
  CITIZENSHIP_OPTIONS,
  CONTACT_FREQUENCY_OPTIONS,
  YES_NO_OPTIONS,
  SUFFIX_OPTIONS
} from '../../../api/interfaces/sections2.0/section18';

interface Section18ComponentProps {
  className?: string;
  onValidationChange?: (isValid: boolean) => void;
  onNext?: () => void;
}

export const Section18Component: React.FC<Section18ComponentProps> = ({
  className = '',
  onValidationChange,
  onNext
}) => {
  // Section 18 Context
  const {
    section18Data,
    immediateFamily,
    extendedFamily,
    associates,
    addImmediateFamilyMember,
    updateImmediateFamilyMember,
    removeImmediateFamilyMember,
    duplicateImmediateFamilyMember,
    addExtendedFamilyMember,
    updateExtendedFamilyMember,
    removeExtendedFamilyMember,
    duplicateExtendedFamilyMember,
    addAssociate,
    updateAssociate,
    removeAssociate,
    duplicateAssociate,
    updateField,
    getFieldValue,
    validate,
    validateEntry,
    validationErrors,
    isComplete,
    resetSection
  } = useSection18();

  // SF86 Form Context for data persistence
  const sf86Form = useSF86Form();

  // Component state
  const [isValid, setIsValid] = useState(false);
  const [activeTab, setActiveTab] = useState<'immediateFamily' | 'extendedFamily' | 'associates'>('immediateFamily');
  const [showValidationErrors, setShowValidationErrors] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  // Handle validation on component mount and when data changes
  useEffect(() => {
    const validationResult = validate();
    setIsValid(validationResult.isValid);
    onValidationChange?.(validationResult.isValid);
  }, [section18Data, validate, onValidationChange]);

  // Handle submission with data persistence
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setShowValidationErrors(true);

    const result = validate();
    setIsValid(result.isValid);
    onValidationChange?.(result.isValid);

    if (result.isValid) {
      try {
        sf86Form.updateSectionData('section18', section18Data);
        await sf86Form.saveForm();
        console.log('✅ Section 18 data saved successfully:', section18Data);

        if (onNext) {
          onNext();
        }
      } catch (error) {
        console.error('❌ Failed to save Section 18 data:', error);
      }
    }
  };

  // Helper function to safely get field value
  const getFieldValueSafe = (obj: any, path: string): string => {
    return path.split('.').reduce((current, key) => current?.[key]?.value || '', obj);
  };

  // Helper function to check if field has error
  const hasFieldError = (fieldPath: string): boolean => {
    return showValidationErrors && validationErrors.some(error => error.includes(fieldPath));
  };

  const getFieldError = (fieldPath: string): string => {
    return validationErrors.find(error => error.includes(fieldPath)) || '';
  };

  // Immediate Family Form Component
  const ImmediateFamilyForm: React.FC<{ entry: ImmediateFamilyEntry; index: number }> = ({ entry, index }) => (
    <div className="bg-gray-50 p-6 rounded-lg mb-6" data-testid={`immediate-family-${index}`}>
      <div className="flex justify-between items-center mb-4">
        <h4 className="font-semibold text-lg">Immediate Family Member #{index + 1}</h4>
        <div className="flex space-x-2">
          <button
            type="button"
            onClick={() => duplicateImmediateFamilyMember(index)}
            className="text-blue-600 hover:text-blue-800 font-medium text-sm"
          >
            Duplicate
          </button>
          <button
            type="button"
            onClick={() => removeImmediateFamilyMember(index)}
            className="text-red-600 hover:text-red-800 font-medium text-sm"
          >
            Remove
          </button>
        </div>
      </div>

      {/* Relationship */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Relationship <span className="text-red-500">*</span>
        </label>
        <select
          value={getFieldValueSafe(entry, 'relationship')}
          onChange={(e) => {
            console.log(`🎯 Section18Component: Relationship field changed:`, {
              index,
              fieldPath: 'relationship.value',
              newValue: e.target.value,
              currentValue: getFieldValueSafe(entry, 'relationship')
            });
            updateField('relationship.value', e.target.value, index, 'immediateFamily');
          }}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
          required
        >
          <option value="">Select relationship</option>
          {IMMEDIATE_FAMILY_RELATIONSHIP_OPTIONS.map(option => (
            <option key={option} value={option}>{option}</option>
          ))}
        </select>
        {hasFieldError(`immediateFamily[${index}].relationship`) && (
          <p className="mt-1 text-sm text-red-600">{getFieldError(`immediateFamily[${index}].relationship`)}</p>
        )}
      </div>

      {/* Is Deceased */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Is this person deceased?
        </label>
        <div className="flex space-x-4">
          {YES_NO_OPTIONS.map(option => (
            <label key={option} className="flex items-center">
              <input
                type="radio"
                name={`deceased_${index}`}
                value={option}
                checked={getFieldValueSafe(entry, 'isDeceased') === option}
                onChange={(e) => updateField('isDeceased.value', e.target.value, index, 'immediateFamily')}
                className="mr-2"
              />
              {option}
            </label>
          ))}
        </div>
      </div>

      {/* Date of Death (if deceased) */}
      {getFieldValueSafe(entry, 'isDeceased') === 'YES' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date of Death (Month)
            </label>
            <input
              type="text"
              placeholder="MM"
              value={getFieldValueSafe(entry, 'dateOfDeath.month')}
              onChange={(e) => updateField('dateOfDeath.month.value', e.target.value, index, 'immediateFamily')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date of Death (Year)
            </label>
            <input
              type="text"
              placeholder="YYYY"
              value={getFieldValueSafe(entry, 'dateOfDeath.year')}
              onChange={(e) => updateField('dateOfDeath.year.value', e.target.value, index, 'immediateFamily')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      )}

      {/* Full Name */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Last Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={getFieldValueSafe(entry, 'fullName.lastName')}
            onChange={(e) => updateField('fullName.lastName.value', e.target.value, index, 'immediateFamily')}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            First Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={getFieldValueSafe(entry, 'fullName.firstName')}
            onChange={(e) => {
              console.log(`🎯 Section18Component: First name field changed:`, {
                index,
                fieldPath: 'fullName.firstName.value',
                newValue: e.target.value,
                currentValue: getFieldValueSafe(entry, 'fullName.firstName')
              });
              updateField('fullName.firstName.value', e.target.value, index, 'immediateFamily');
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Middle Name
          </label>
          <input
            type="text"
            value={getFieldValueSafe(entry, 'fullName.middleName')}
            onChange={(e) => updateField('fullName.middleName.value', e.target.value, index, 'immediateFamily')}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Suffix
          </label>
          <select
            value={getFieldValueSafe(entry, 'fullName.suffix')}
            onChange={(e) => updateField('fullName.suffix.value', e.target.value, index, 'immediateFamily')}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select suffix</option>
            {SUFFIX_OPTIONS.map(option => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Date of Birth */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Date of Birth (Month) <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            placeholder="MM"
            value={getFieldValueSafe(entry, 'dateOfBirth.month')}
            onChange={(e) => updateField('dateOfBirth.month.value', e.target.value, index, 'immediateFamily')}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Date of Birth (Year) <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            placeholder="YYYY"
            value={getFieldValueSafe(entry, 'dateOfBirth.year')}
            onChange={(e) => updateField('dateOfBirth.year.value', e.target.value, index, 'immediateFamily')}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
      </div>

      {/* Place of Birth */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Place of Birth - City
          </label>
          <input
            type="text"
            value={getFieldValueSafe(entry, 'placeOfBirth.city')}
            onChange={(e) => updateField('placeOfBirth.city.value', e.target.value, index, 'immediateFamily')}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Place of Birth - State/Province
          </label>
          <input
            type="text"
            value={getFieldValueSafe(entry, 'placeOfBirth.state')}
            onChange={(e) => updateField('placeOfBirth.state.value', e.target.value, index, 'immediateFamily')}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Place of Birth - Country <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={getFieldValueSafe(entry, 'placeOfBirth.country')}
            onChange={(e) => updateField('placeOfBirth.country.value', e.target.value, index, 'immediateFamily')}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
      </div>

      {/* Citizenship */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Citizenship <span className="text-red-500">*</span>
          </label>
          <select
            value={getFieldValueSafe(entry, 'citizenship')}
            onChange={(e) => updateField('citizenship.value', e.target.value, index, 'immediateFamily')}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            required
          >
            <option value="">Select citizenship</option>
            {CITIZENSHIP_OPTIONS.map(option => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        </div>
        {getFieldValueSafe(entry, 'citizenship') === 'Other' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Citizenship Country <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={getFieldValueSafe(entry, 'citizenshipCountry')}
              onChange={(e) => updateField('citizenshipCountry.value', e.target.value, index, 'immediateFamily')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
        )}
      </div>

      {/* Current Address */}
      <div className="mb-4">
        <h5 className="font-medium text-gray-900 mb-3">Current Address</h5>
        <div className="grid grid-cols-1 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Street Address
            </label>
            <input
              type="text"
              value={getFieldValueSafe(entry, 'currentAddress.street')}
              onChange={(e) => updateField('currentAddress.street.value', e.target.value, index, 'immediateFamily')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                City
              </label>
              <input
                type="text"
                value={getFieldValueSafe(entry, 'currentAddress.city')}
                onChange={(e) => updateField('currentAddress.city.value', e.target.value, index, 'immediateFamily')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                State/Province
              </label>
              <input
                type="text"
                value={getFieldValueSafe(entry, 'currentAddress.state')}
                onChange={(e) => updateField('currentAddress.state.value', e.target.value, index, 'immediateFamily')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Country
              </label>
              <input
                type="text"
                value={getFieldValueSafe(entry, 'currentAddress.country')}
                onChange={(e) => updateField('currentAddress.country.value', e.target.value, index, 'immediateFamily')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Contact Information */}
      <div className="mb-4">
        <h5 className="font-medium text-gray-900 mb-3">Contact Information</h5>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Home Phone
            </label>
            <input
              type="tel"
              value={getFieldValueSafe(entry, 'contactInfo.homePhone')}
              onChange={(e) => updateField('contactInfo.homePhone.value', e.target.value, index, 'immediateFamily')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Work Phone
            </label>
            <input
              type="tel"
              value={getFieldValueSafe(entry, 'contactInfo.workPhone')}
              onChange={(e) => updateField('contactInfo.workPhone.value', e.target.value, index, 'immediateFamily')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Cell Phone
            </label>
            <input
              type="tel"
              value={getFieldValueSafe(entry, 'contactInfo.cellPhone')}
              onChange={(e) => updateField('contactInfo.cellPhone.value', e.target.value, index, 'immediateFamily')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <input
              type="email"
              value={getFieldValueSafe(entry, 'contactInfo.email')}
              onChange={(e) => updateField('contactInfo.email.value', e.target.value, index, 'immediateFamily')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Government Affiliation */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Does this person have any government affiliation?
        </label>
        <div className="flex space-x-4">
          {YES_NO_OPTIONS.map(option => (
            <label key={option} className="flex items-center">
              <input
                type="radio"
                name={`govAffiliation_${index}`}
                value={option}
                checked={getFieldValueSafe(entry, 'hasGovernmentAffiliation') === option}
                onChange={(e) => updateField('hasGovernmentAffiliation.value', e.target.value, index, 'immediateFamily')}
                className="mr-2"
              />
              {option}
            </label>
          ))}
        </div>
      </div>
    </div>
  );

  // Extended Family Form Component
  const ExtendedFamilyForm: React.FC<{ entry: ExtendedFamilyEntry; index: number }> = ({ entry, index }) => (
    <div className="bg-gray-50 p-6 rounded-lg mb-6" data-testid={`extended-family-${index}`}>
      <div className="flex justify-between items-center mb-4">
        <h4 className="font-semibold text-lg">Extended Family Member #{index + 1}</h4>
        <div className="flex space-x-2">
          <button
            type="button"
            onClick={() => duplicateExtendedFamilyMember(index)}
            className="text-blue-600 hover:text-blue-800 font-medium text-sm"
          >
            Duplicate
          </button>
          <button
            type="button"
            onClick={() => removeExtendedFamilyMember(index)}
            className="text-red-600 hover:text-red-800 font-medium text-sm"
          >
            Remove
          </button>
        </div>
      </div>

      {/* Relationship */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Relationship <span className="text-red-500">*</span>
        </label>
        <select
          value={getFieldValueSafe(entry, 'relationship')}
          onChange={(e) => updateField('relationship.value', e.target.value, index, 'extendedFamily')}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
          required
        >
          <option value="">Select relationship</option>
          {EXTENDED_FAMILY_RELATIONSHIP_OPTIONS.map(option => (
            <option key={option} value={option}>{option}</option>
          ))}
        </select>
      </div>

      {/* Full Name */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Last Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={getFieldValueSafe(entry, 'fullName.lastName')}
            onChange={(e) => updateField('fullName.lastName.value', e.target.value, index, 'extendedFamily')}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            First Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={getFieldValueSafe(entry, 'fullName.firstName')}
            onChange={(e) => updateField('fullName.firstName.value', e.target.value, index, 'extendedFamily')}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Middle Name
          </label>
          <input
            type="text"
            value={getFieldValueSafe(entry, 'fullName.middleName')}
            onChange={(e) => updateField('fullName.middleName.value', e.target.value, index, 'extendedFamily')}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Contact Frequency */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          How often do you contact this person?
        </label>
        <select
          value={getFieldValueSafe(entry, 'contactFrequency')}
          onChange={(e) => updateField('contactFrequency.value', e.target.value, index, 'extendedFamily')}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Select frequency</option>
          {CONTACT_FREQUENCY_OPTIONS.map(option => (
            <option key={option} value={option}>{option}</option>
          ))}
        </select>
      </div>
    </div>
  );

  // Associate Form Component
  const AssociateForm: React.FC<{ entry: AssociateEntry; index: number }> = ({ entry, index }) => (
    <div className="bg-gray-50 p-6 rounded-lg mb-6" data-testid={`associate-${index}`}>
      <div className="flex justify-between items-center mb-4">
        <h4 className="font-semibold text-lg">Associate #{index + 1}</h4>
        <div className="flex space-x-2">
          <button
            type="button"
            onClick={() => duplicateAssociate(index)}
            className="text-blue-600 hover:text-blue-800 font-medium text-sm"
          >
            Duplicate
          </button>
          <button
            type="button"
            onClick={() => removeAssociate(index)}
            className="text-red-600 hover:text-red-800 font-medium text-sm"
          >
            Remove
          </button>
        </div>
      </div>

      {/* Associate Type */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Associate Type <span className="text-red-500">*</span>
        </label>
        <select
          value={getFieldValueSafe(entry, 'associateType')}
          onChange={(e) => updateField('associateType.value', e.target.value, index, 'associates')}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
          required
        >
          <option value="">Select associate type</option>
          {ASSOCIATE_TYPE_OPTIONS.map(option => (
            <option key={option} value={option}>{option}</option>
          ))}
        </select>
      </div>

      {/* Relationship Description */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Describe your relationship with this person
        </label>
        <textarea
          value={getFieldValueSafe(entry, 'relationshipDescription')}
          onChange={(e) => updateField('relationshipDescription.value', e.target.value, index, 'associates')}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
          rows={3}
        />
      </div>

      {/* Full Name */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Last Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={getFieldValueSafe(entry, 'fullName.lastName')}
            onChange={(e) => updateField('fullName.lastName.value', e.target.value, index, 'associates')}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            First Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={getFieldValueSafe(entry, 'fullName.firstName')}
            onChange={(e) => updateField('fullName.firstName.value', e.target.value, index, 'associates')}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Middle Name
          </label>
          <input
            type="text"
            value={getFieldValueSafe(entry, 'fullName.middleName')}
            onChange={(e) => updateField('fullName.middleName.value', e.target.value, index, 'associates')}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* How Met */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          How did you meet this person? <span className="text-red-500">*</span>
        </label>
        <textarea
          value={getFieldValueSafe(entry, 'howMet')}
          onChange={(e) => updateField('howMet.value', e.target.value, index, 'associates')}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
          rows={2}
          required
        />
      </div>

      {/* When Met */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            When did you meet? (Month) <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            placeholder="MM"
            value={getFieldValueSafe(entry, 'whenMet.month')}
            onChange={(e) => updateField('whenMet.month.value', e.target.value, index, 'associates')}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            When did you meet? (Year) <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            placeholder="YYYY"
            value={getFieldValueSafe(entry, 'whenMet.year')}
            onChange={(e) => updateField('whenMet.year.value', e.target.value, index, 'associates')}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
      </div>

      {/* Frequency of Contact */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          How often do you contact this person?
        </label>
        <select
          value={getFieldValueSafe(entry, 'frequencyOfContact')}
          onChange={(e) => updateField('frequencyOfContact.value', e.target.value, index, 'associates')}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Select frequency</option>
          {CONTACT_FREQUENCY_OPTIONS.map(option => (
            <option key={option} value={option}>{option}</option>
          ))}
        </select>
      </div>

      {/* Nature of Relationship Checkboxes */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Nature of relationship (check all that apply):
        </label>
        <div className="space-y-2">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={getFieldValueSafe(entry, 'personalRelationship') === 'true'}
              onChange={(e) => updateField('personalRelationship.value', e.target.checked, index, 'associates')}
              className="mr-2"
            />
            Personal friendship
          </label>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={getFieldValueSafe(entry, 'businessRelationship') === 'true'}
              onChange={(e) => updateField('businessRelationship.value', e.target.checked, index, 'associates')}
              className="mr-2"
            />
            Business relationship
          </label>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={getFieldValueSafe(entry, 'professionalRelationship') === 'true'}
              onChange={(e) => updateField('professionalRelationship.value', e.target.checked, index, 'associates')}
              className="mr-2"
            />
            Professional relationship
          </label>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={getFieldValueSafe(entry, 'otherRelationship') === 'true'}
              onChange={(e) => updateField('otherRelationship.value', e.target.checked, index, 'associates')}
              className="mr-2"
            />
            Other
          </label>
        </div>

        {/* Other Relationship Description */}
        {getFieldValueSafe(entry, 'otherRelationship') === 'true' && (
          <div className="mt-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Describe other relationship type:
            </label>
            <textarea
              value={getFieldValueSafe(entry, 'otherRelationshipDescription')}
              onChange={(e) => updateField('otherRelationshipDescription.value', e.target.value, index, 'associates')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              rows={2}
            />
          </div>
        )}
      </div>

      {/* Foreign Connections */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Does this person have foreign connections?
        </label>
        <div className="flex space-x-4">
          {YES_NO_OPTIONS.map(option => (
            <label key={option} className="flex items-center">
              <input
                type="radio"
                name={`foreignConnections_${index}`}
                value={option}
                checked={getFieldValueSafe(entry, 'hasForeignConnections') === option}
                onChange={(e) => updateField('hasForeignConnections.value', e.target.value, index, 'associates')}
                className="mr-2"
              />
              {option}
            </label>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className={`bg-white rounded-lg shadow-lg p-6 ${className}`} data-testid="section18-form">
      {/* Section Header */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Section 18: Relatives and Associates
        </h2>
        <p className="text-gray-600">
          Provide information about your relatives and close associates, including immediate family,
          extended family, and close friends or business associates.
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex space-x-8">
          {[
            { id: 'immediateFamily', label: 'Immediate Family', count: immediateFamily.length },
            { id: 'extendedFamily', label: 'Extended Family', count: extendedFamily.length },
            { id: 'associates', label: 'Associates', count: associates.length }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as Section18SubsectionKey)}
              className={`pb-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.label} {tab.count > 0 && `(${tab.count})`}
            </button>
          ))}
        </nav>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Immediate Family Tab */}
        {activeTab === 'immediateFamily' && (
          <div>
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-2">Immediate Family Members</h3>
              <p className="text-sm text-gray-600">
                List your parents, stepparents, foster parents, children, stepchildren, brothers, and sisters.
              </p>
            </div>

            {immediateFamily.map((entry, index) => (
              <ImmediateFamilyForm key={index} entry={entry} index={index} />
            ))}

            <button
              type="button"
              onClick={addImmediateFamilyMember}
              className="w-full py-3 px-4 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-gray-400 hover:text-gray-700"
            >
              + Add Immediate Family Member
            </button>
          </div>
        )}

        {/* Extended Family Tab */}
        {activeTab === 'extendedFamily' && (
          <div>
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-2">Extended Family Members</h3>
              <p className="text-sm text-gray-600">
                List grandparents, aunts, uncles, cousins, in-laws, and other relatives.
              </p>
            </div>

            {extendedFamily.map((entry, index) => (
              <ExtendedFamilyForm key={index} entry={entry} index={index} />
            ))}

            <button
              type="button"
              onClick={addExtendedFamilyMember}
              className="w-full py-3 px-4 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-gray-400 hover:text-gray-700"
            >
              + Add Extended Family Member
            </button>
          </div>
        )}

        {/* Associates Tab */}
        {activeTab === 'associates' && (
          <div>
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-2">Associates and Close Friends</h3>
              <p className="text-sm text-gray-600">
                List close friends, business associates, professional colleagues, and other significant relationships.
              </p>
            </div>

            {associates.map((entry, index) => (
              <AssociateForm key={index} entry={entry} index={index} />
            ))}

            <button
              type="button"
              onClick={addAssociate}
              className="w-full py-3 px-4 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-gray-400 hover:text-gray-700"
            >
              + Add Associate
            </button>
          </div>
        )}

        {/* Validation Errors Summary */}
        {showValidationErrors && !isValid && validationErrors.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <h4 className="text-sm font-medium text-red-800 mb-2">Please correct the following errors:</h4>
            <ul className="text-sm text-red-700 list-disc list-inside">
              {validationErrors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Form Actions */}
        <div className="flex justify-between items-center pt-6 border-t border-gray-200">
          <button
            type="button"
            onClick={resetSection}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium"
          >
            Reset Section
          </button>

          <div className="flex space-x-4">
            <span className={`text-sm ${isDirty ? 'text-orange-600' : 'text-green-600'}`}>
              {isDirty ? 'Unsaved changes' : 'All changes saved'}
            </span>

            <button
              type="submit"
              className={`px-6 py-2 rounded-md font-medium ${
                isValid
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
              disabled={!isValid}
            >
              Save & Continue
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default Section18Component;