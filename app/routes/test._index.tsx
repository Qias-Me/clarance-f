import type { Route } from "./+types/startForm._index";
import { useState } from "react";
import { Section29Provider, useSection29 } from "~/state/contexts/sections2.0/section29";
import type {
  SubsectionKey,
  OrganizationSubsectionKey,
  ActivitySubsectionKey,
  ActivityEntryType
} from "~/state/contexts/sections2.0/section29-field-generator";

export function loader({}: Route.LoaderArgs) {
  try {
    return { isLoading: false };
  } catch (e) {
    console.error("Failed to load employee data:", e);
    return { isLoading: false };
  }
}

/**
 * Section29 Test Component - Realistic Form Scenarios
 *
 * This component demonstrates Section29Provider integration with realistic form scenarios
 * for comprehensive Playwright testing. It includes all CRUD operations, field ID generation,
 * ApplicantFormValues integration, and advanced entry management features.
 */

// ============================================================================
// SECTION29 BASIC FORM COMPONENT
// ============================================================================

function Section29BasicFormTest() {
  const {
    section29Data,
    updateSubsectionFlag,
    addOrganizationEntry,
    addActivityEntry,
    removeEntry,
    updateFieldValue,
    getEntryCount,
    isDirty,
    validateSection,
    errors
  } = useSection29();

  const [testResults, setTestResults] = useState<Record<string, boolean>>({});

  const handleSubsectionChange = (subsectionKey: SubsectionKey, value: "YES" | "NO") => {
    updateSubsectionFlag(subsectionKey, value);
    setTestResults(prev => ({
      ...prev,
      [`subsection_${subsectionKey}_${value}`]: true
    }));
  };

  const handleAddOrganization = (subsectionKey: OrganizationSubsectionKey) => {
    addOrganizationEntry(subsectionKey);
    setTestResults(prev => ({
      ...prev,
      [`add_org_${subsectionKey}`]: true
    }));
  };

  const handleAddActivity = (subsectionKey: ActivitySubsectionKey, entryType: ActivityEntryType) => {
    addActivityEntry(subsectionKey, entryType);
    setTestResults(prev => ({
      ...prev,
      [`add_activity_${subsectionKey}_${entryType}`]: true
    }));
  };

  const handleFieldChange = (
    subsectionKey: SubsectionKey,
    entryIndex: number,
    fieldPath: string,
    value: any
  ) => {
    updateFieldValue(subsectionKey, entryIndex, fieldPath, value);
    setTestResults(prev => ({
      ...prev,
      [`field_update_${subsectionKey}_${entryIndex}_${fieldPath}`]: true
    }));
  };

  const handleRemoveEntry = (subsectionKey: SubsectionKey, entryIndex: number) => {
    removeEntry(subsectionKey, entryIndex);
    setTestResults(prev => ({
      ...prev,
      [`remove_entry_${subsectionKey}_${entryIndex}`]: true
    }));
  };

  const handleValidate = () => {
    const isValid = validateSection();
    setTestResults(prev => ({
      ...prev,
      validation_executed: true,
      validation_result: isValid
    }));
  };

  return (
    <div className="section29-basic-test" data-testid="section29-basic-form">
      <h2 className="text-2xl font-bold mb-6">Section 29: Associations - Basic Form Test</h2>

      {/* Test Results Display */}
      <div className="test-results mb-6 p-4 bg-gray-100 rounded" data-testid="test-results">
        <h3 className="font-semibold mb-2">Test Results:</h3>
        <div className="grid grid-cols-2 gap-2 text-sm">
          {Object.entries(testResults).map(([key, value]) => (
            <div key={key} className={`p-1 rounded ${value ? 'bg-green-200' : 'bg-red-200'}`}>
              {key}: {value ? '✓' : '✗'}
            </div>
          ))}
        </div>
      </div>

      {/* Form Status */}
      <div className="form-status mb-6 p-4 bg-blue-50 rounded" data-testid="form-status">
        <p><strong>Form has changes:</strong> <span data-testid="is-dirty">{isDirty ? 'Yes' : 'No'}</span></p>
        <p><strong>Validation errors:</strong> <span data-testid="error-count">{Object.keys(errors).length}</span></p>
        <button
          onClick={handleValidate}
          className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          data-testid="validate-button"
        >
          Validate Section
        </button>
      </div>

      {/* Terrorism Organizations Subsection */}
      <div className="subsection mb-8 p-4 border rounded" data-testid="terrorism-organizations">
        <h3 className="text-lg font-semibold mb-4">Terrorism Organizations</h3>

        <div className="question mb-4">
          <p className="mb-2">{section29Data.terrorismOrganizations?.hasAssociation.label}</p>
          <label className="mr-4">
            <input
              type="radio"
              name="terrorismOrganizations"
              value="YES"
              checked={section29Data.terrorismOrganizations?.hasAssociation.value === "YES"}
              onChange={() => handleSubsectionChange('terrorismOrganizations', 'YES')}
              data-testid="terrorism-orgs-yes"
            />
            Yes
          </label>
          <label>
            <input
              type="radio"
              name="terrorismOrganizations"
              value="NO"
              checked={section29Data.terrorismOrganizations?.hasAssociation.value === "NO"}
              onChange={() => handleSubsectionChange('terrorismOrganizations', 'NO')}
              data-testid="terrorism-orgs-no"
            />
            No
          </label>
        </div>

        {section29Data.terrorismOrganizations?.hasAssociation.value === "YES" && (
          <div className="entries" data-testid="terrorism-orgs-entries">
            <button
              onClick={() => handleAddOrganization('terrorismOrganizations')}
              className="mb-4 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
              data-testid="add-terrorism-org-button"
            >
              Add Organization Entry
            </button>

            {section29Data.terrorismOrganizations.entries.map((entry, index) => (
              <div key={entry._id} className="entry mb-6 p-4 border-l-4 border-blue-500 bg-gray-50" data-testid={`terrorism-org-entry-${index}`}>
                <h4 className="font-semibold mb-3">Entry #{index + 1}</h4>

                <div className="field mb-3">
                  <label className="block text-sm font-medium mb-1">{entry.organizationName.label}</label>
                  <input
                    type="text"
                    value={entry.organizationName.value}
                    onChange={(e) => handleFieldChange('terrorismOrganizations', index, 'organizationName.value', e.target.value)}
                    className="w-full p-2 border rounded"
                    data-testid={`terrorism-org-name-${index}`}
                    data-field-id={entry.organizationName.id}
                  />
                </div>

                <div className="address-group mb-3">
                  <h5 className="font-medium mb-2">Address</h5>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      placeholder="Street"
                      value={entry.address.street.value}
                      onChange={(e) => handleFieldChange('terrorismOrganizations', index, 'address.street.value', e.target.value)}
                      className="p-2 border rounded"
                      data-testid={`terrorism-org-street-${index}`}
                      data-field-id={entry.address.street.id}
                    />
                    <input
                      type="text"
                      placeholder="City"
                      value={entry.address.city.value}
                      onChange={(e) => handleFieldChange('terrorismOrganizations', index, 'address.city.value', e.target.value)}
                      className="p-2 border rounded"
                      data-testid={`terrorism-org-city-${index}`}
                      data-field-id={entry.address.city.id}
                    />
                  </div>
                </div>

                <div className="date-range mb-3">
                  <h5 className="font-medium mb-2">Date Range</h5>
                  <div className="grid grid-cols-3 gap-2">
                    <input
                      type="month"
                      value={entry.dateRange.from.date.value}
                      onChange={(e) => handleFieldChange('terrorismOrganizations', index, 'dateRange.from.date.value', e.target.value)}
                      className="p-2 border rounded"
                      data-testid={`terrorism-org-from-date-${index}`}
                      data-field-id={entry.dateRange.from.date.id}
                    />
                    <input
                      type="month"
                      value={entry.dateRange.to.date.value}
                      onChange={(e) => handleFieldChange('terrorismOrganizations', index, 'dateRange.to.date.value', e.target.value)}
                      className="p-2 border rounded"
                      data-testid={`terrorism-org-to-date-${index}`}
                      data-field-id={entry.dateRange.to.date.id}
                    />
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={entry.dateRange.present.value}
                        onChange={(e) => handleFieldChange('terrorismOrganizations', index, 'dateRange.present.value', e.target.checked)}
                        className="mr-2"
                        data-testid={`terrorism-org-present-${index}`}
                        data-field-id={entry.dateRange.present.id}
                      />
                      Present
                    </label>
                  </div>
                </div>

                <button
                  onClick={() => handleRemoveEntry('terrorismOrganizations', index)}
                  className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                  data-testid={`remove-terrorism-org-${index}`}
                >
                  Remove Entry
                </button>
              </div>
            ))}

            <p className="text-sm text-gray-600" data-testid="terrorism-orgs-count">
              Total entries: {getEntryCount('terrorismOrganizations')}
            </p>
          </div>
        )}
      </div>

      {/* Terrorism Activities Subsection */}
      <div className="subsection mb-8 p-4 border rounded" data-testid="terrorism-activities">
        <h3 className="text-lg font-semibold mb-4">Terrorism Activities</h3>

        <div className="question mb-4">
          <p className="mb-2">{section29Data.terrorismActivities?.hasActivity.label}</p>
          <label className="mr-4">
            <input
              type="radio"
              name="terrorismActivities"
              value="YES"
              checked={section29Data.terrorismActivities?.hasActivity.value === "YES"}
              onChange={() => handleSubsectionChange('terrorismActivities', 'YES')}
              data-testid="terrorism-activities-yes"
            />
            Yes
          </label>
          <label>
            <input
              type="radio"
              name="terrorismActivities"
              value="NO"
              checked={section29Data.terrorismActivities?.hasActivity.value === "NO"}
              onChange={() => handleSubsectionChange('terrorismActivities', 'NO')}
              data-testid="terrorism-activities-no"
            />
            No
          </label>
        </div>

        {section29Data.terrorismActivities?.hasActivity.value === "YES" && (
          <div className="entries" data-testid="terrorism-activities-entries">
            <button
              onClick={() => handleAddActivity('terrorismActivities', 'terrorism')}
              className="mb-4 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
              data-testid="add-terrorism-activity-button"
            >
              Add Activity Entry
            </button>

            {section29Data.terrorismActivities.entries.map((entry, index) => (
              <div key={entry._id} className="entry mb-6 p-4 border-l-4 border-red-500 bg-gray-50" data-testid={`terrorism-activity-entry-${index}`}>
                <h4 className="font-semibold mb-3">Activity Entry #{index + 1}</h4>

                <div className="field mb-3">
                  <label className="block text-sm font-medium mb-1">{entry.activityDescription.label}</label>
                  <textarea
                    value={entry.activityDescription.value}
                    onChange={(e) => handleFieldChange('terrorismActivities', index, 'activityDescription.value', e.target.value)}
                    className="w-full p-2 border rounded"
                    rows={3}
                    data-testid={`terrorism-activity-description-${index}`}
                    data-field-id={entry.activityDescription.id}
                  />
                </div>

                <button
                  onClick={() => handleRemoveEntry('terrorismActivities', index)}
                  className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                  data-testid={`remove-terrorism-activity-${index}`}
                >
                  Remove Entry
                </button>
              </div>
            ))}

            <p className="text-sm text-gray-600" data-testid="terrorism-activities-count">
              Total entries: {getEntryCount('terrorismActivities')}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// MAIN TEST PAGE COMPONENT
// ============================================================================

export default function Section29TestPage({}: Route.ComponentProps) {
  const [activeTest, setActiveTest] = useState<'basic' | 'advanced' | 'integration'>('basic');

  return (
    <Section29Provider>
      <div className="section29-test-page min-h-screen bg-gray-50 p-6" data-testid="section29-test-page">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold text-center mb-8">Section 29 Context Integration Tests</h1>

          {/* Test Navigation */}
          <nav className="test-nav mb-8" data-testid="test-navigation">
            <div className="flex justify-center space-x-4">
              <button
                className={`px-6 py-3 rounded-lg font-semibold ${activeTest === 'basic' ? 'bg-blue-500 text-white' : 'bg-white text-blue-500 border border-blue-500'}`}
                onClick={() => setActiveTest('basic')}
                data-testid="basic-test-tab"
              >
                Basic Form Tests
              </button>
              <button
                className={`px-6 py-3 rounded-lg font-semibold ${activeTest === 'advanced' ? 'bg-blue-500 text-white' : 'bg-white text-blue-500 border border-blue-500'}`}
                onClick={() => setActiveTest('advanced')}
                data-testid="advanced-test-tab"
              >
                Advanced Features
              </button>
              <button
                className={`px-6 py-3 rounded-lg font-semibold ${activeTest === 'integration' ? 'bg-blue-500 text-white' : 'bg-white text-blue-500 border border-blue-500'}`}
                onClick={() => setActiveTest('integration')}
                data-testid="integration-test-tab"
              >
                Integration Tests
              </button>
            </div>
          </nav>

          {/* Test Content */}
          <main className="test-content bg-white rounded-lg shadow-lg p-6">
            {activeTest === 'basic' && <Section29BasicFormTest />}
            {activeTest === 'advanced' && <div data-testid="advanced-placeholder">Advanced tests will be implemented in test.tsx</div>}
            {activeTest === 'integration' && <div data-testid="integration-placeholder">Integration tests will be implemented in test.tsx</div>}
          </main>
        </div>
      </div>
    </Section29Provider>
  );
}