/**
 * Section 16: Foreign Activities - Component
 *
 * React component for SF-86 Section 16 using the new Form Architecture 2.0.
 * This component handles collection of foreign activities information including
 * government activities, business activities, organizations, property, travel, conferences, and contacts.
 */

import React, { useEffect, useState } from 'react';
import { useSection16 } from '~/state/contexts/sections2.0/section16';
import { useSF86Form } from '~/state/contexts/SF86FormContext';

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
  // ============================================================================
  // CONTEXT HOOKS
  // ============================================================================

  const {
    section16Data,
    isLoading,
    errors,
    isDirty,
    addForeignGovernmentActivity,
    removeForeignGovernmentActivity,
    updateForeignGovernmentActivity,
    addForeignBusinessActivity,
    removeForeignBusinessActivity,
    updateForeignBusinessActivity,
    addForeignOrganization,
    removeForeignOrganization,
    addForeignProperty,
    removeForeignProperty,
    addForeignBusinessTravel,
    removeForeignBusinessTravel,
    addForeignConference,
    removeForeignConference,
    addForeignGovernmentContact,
    removeForeignGovernmentContact,
    updateFieldValue,
    validateSection,
    resetSection,
    isComplete
  } = useSection16();

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

  const handleAddActivity = (activityType: string) => {
    switch (activityType) {
      case 'government':
        addForeignGovernmentActivity();
        break;
      case 'business':
        addForeignBusinessActivity();
        break;
      case 'organization':
        addForeignOrganization();
        break;
      case 'property':
        addForeignProperty();
        break;
      case 'travel':
        addForeignBusinessTravel();
        break;
      case 'conference':
        addForeignConference();
        break;
      case 'contact':
        addForeignGovernmentContact();
        break;
    }
  };

  const handleRemoveActivity = (activityType: string, index: number) => {
    switch (activityType) {
      case 'government':
        removeForeignGovernmentActivity(index);
        break;
      case 'business':
        removeForeignBusinessActivity(index);
        break;
      case 'organization':
        removeForeignOrganization(index);
        break;
      case 'property':
        removeForeignProperty(index);
        break;
      case 'travel':
        removeForeignBusinessTravel(index);
        break;
      case 'conference':
        removeForeignConference(index);
        break;
      case 'contact':
        removeForeignGovernmentContact(index);
        break;
    }
  };

  const handleFieldChange = (path: string, value: any) => {
    updateFieldValue(path, value);
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
      <h2 className="text-xl font-semibold text-blue-900 mb-2">Section 16: Foreign Activities</h2>
      <p className="text-blue-700 text-sm mb-2">
        Provide information about your foreign activities, including government involvement,
        business activities, organization memberships, property ownership, professional travel,
        conference attendance, and government contacts.
      </p>
      <div className="text-xs text-blue-600">
        <span className="font-medium">Status:</span> {isComplete() ? 'Complete' : 'Incomplete'} |{' '}
        <span className="font-medium">Validation:</span> {localValidation.isValid ? 'Valid' : 'Invalid'} |{' '}
        <span className="font-medium">Changes:</span> {isDirty ? 'Unsaved' : 'Saved'}
      </div>
    </div>
  );

  const renderActivitySection = (title: string, activityType: string, count: number) => (
    <div className="mb-6 p-4 border border-gray-200 rounded-lg">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-lg font-medium text-gray-900">{title}</h3>
        <div className="flex gap-2">
          <span className="text-sm text-gray-500">
            {count} {count === 1 ? 'entry' : 'entries'}
          </span>
          <button
            onClick={() => handleAddActivity(activityType)}
            className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
          >
            Add {title}
          </button>
        </div>
      </div>

      {count === 0 ? (
        <p className="text-gray-500 text-sm italic">No entries added yet.</p>
      ) : (
        <div className="space-y-2">
          {Array.from({ length: count }).map((_, index) => (
            <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
              <span className="text-sm text-gray-700">Entry {index + 1}</span>
              <button
                onClick={() => handleRemoveActivity(activityType, index)}
                className="px-2 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      )}
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
    <div className={`p-6 max-w-4xl mx-auto ${className}`}>
      {renderSectionInfo()}
      {renderValidationErrors()}

      <div className="space-y-6">
        {/* Foreign Government Activities (16.1) */}
        {renderActivitySection(
          'Foreign Government Activities',
          'government',
          section16Data.section16.foreignGovernmentActivities.length
        )}

        {/* Foreign Business Activities (16.2) */}
        {renderActivitySection(
          'Foreign Business Activities',
          'business',
          section16Data.section16.foreignBusinessActivities.length
        )}

        {/* Foreign Organizations (16.3) */}
        {renderActivitySection(
          'Foreign Organization Memberships',
          'organization',
          section16Data.section16.foreignOrganizations.length
        )}

        {/* Foreign Property (16.4) */}
        {renderActivitySection(
          'Foreign Property Ownership',
          'property',
          section16Data.section16.foreignProperty.length
        )}

        {/* Foreign Business Travel (16.5) */}
        {renderActivitySection(
          'Foreign Business Travel',
          'travel',
          section16Data.section16.foreignBusinessTravel.length
        )}

        {/* Foreign Conferences (16.6) */}
        {renderActivitySection(
          'Foreign Conference Attendance',
          'conference',
          section16Data.section16.foreignConferences.length
        )}

        {/* Foreign Government Contacts (16.7) */}
        {renderActivitySection(
          'Foreign Government Contacts',
          'contact',
          section16Data.section16.foreignGovernmentContacts.length
        )}
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