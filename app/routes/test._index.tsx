import type { Route } from "./+types/startForm._index";
import { useState } from "react";
import { useSection1 } from "~/state/contexts/sections2.0/section1";
import { useSection2 } from "~/state/contexts/sections2.0/section2";
import { useSection5 } from "~/state/contexts/sections2.0/section5";
import { useSection8 } from "~/state/contexts/sections2.0/section8";
import { useSection9 } from "~/state/contexts/sections2.0/section9";
import { useSection27 } from "~/state/contexts/sections2.0/section27";
import { useSection29 } from "~/state/contexts/sections2.0/section29";
import { CompleteSF86FormProvider, useSF86Form } from "~/state/contexts/SF86FormContext";
// PDF service import removed to fix build issues

export function loader({}: Route.LoaderArgs) {
  try {
    return { isLoading: false };
  } catch (e) {
    console.error("Failed to load employee data:", e);
    return { isLoading: false };
  }
}

/**
 * Multi-Section Test Component - Comprehensive SF-86 Form Testing
 *
 * This component provides comprehensive testing for all integrated SF-86 sections
 * including sections 1, 2, 7, 29 with CRUD operations, field value persistence,
 * defensive check logic testing, and cross-section integration validation.
 */

// ============================================================================
// SECTION TEST COMPONENTS
// ============================================================================

/**
 * Section 1 Test Component - Name Information
 */
function Section1TestComponent() {
  const section1 = useSection1();

  const handleUpdateName = () => {
    section1.updateFullName({ fieldPath: 'section1.lastName', newValue: 'TestLastName' });
    section1.updateFullName({ fieldPath: 'section1.firstName', newValue: 'TestFirstName' });
    section1.updateFullName({ fieldPath: 'section1.middleName', newValue: 'TestMiddleName' });
    section1.updateFullName({ fieldPath: 'section1.suffix', newValue: 'Jr' });
  };

  const handleClearName = () => {
    section1.updateFullName({ fieldPath: 'section1.lastName', newValue: '' });
    section1.updateFullName({ fieldPath: 'section1.firstName', newValue: '' });
    section1.updateFullName({ fieldPath: 'section1.middleName', newValue: '' });
    section1.updateFullName({ fieldPath: 'section1.suffix', newValue: '' });
  };

  return (
    <div className="section-test-panel border rounded-lg p-4 mb-4" data-testid="section1-test-panel">
      <h3 className="text-lg font-semibold mb-3">Section 1: Name Information</h3>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium mb-1">Last Name</label>
          <input
            type="text"
            value={section1.section1Data.section1.lastName.value || ''}
            onChange={(e) => section1.updateFullName({ fieldPath: 'section1.lastName', newValue: e.target.value })}
            className="w-full border rounded px-3 py-2"
            data-testid="section1-lastname-input"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">First Name</label>
          <input
            type="text"
            value={section1.section1Data.section1.firstName.value || ''}
            onChange={(e) => section1.updateFullName({ fieldPath: 'section1.firstName', newValue: e.target.value })}
            className="w-full border rounded px-3 py-2"
            data-testid="section1-firstname-input"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Middle Name</label>
          <input
            type="text"
            value={section1.section1Data.section1.middleName.value || ''}
            onChange={(e) => section1.updateFullName({ fieldPath: 'section1.middleName', newValue: e.target.value })}
            className="w-full border rounded px-3 py-2"
            data-testid="section1-middlename-input"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Suffix</label>
          <input
            type="text"
            value={section1.section1Data.section1.suffix.value || ''}
            onChange={(e) => section1.updateFullName({ fieldPath: 'section1.suffix', newValue: e.target.value })}
            className="w-full border rounded px-3 py-2"
            data-testid="section1-suffix-input"
          />
        </div>
      </div>

      <div className="flex space-x-2 mb-4">
        <button
          onClick={handleUpdateName}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          data-testid="section1-update-name-btn"
        >
          Fill Test Data
        </button>
        <button
          onClick={handleClearName}
          className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
          data-testid="section1-clear-name-btn"
        >
          Clear Data
        </button>
      </div>

      <div className="text-sm text-gray-600">
        <p><strong>Validation:</strong> {section1.validateSection().isValid ? '✅ Valid' : '❌ Invalid'}</p>
        <p><strong>Has Changes:</strong> {section1.isDirty ? '🔄 Yes' : '✅ No'}</p>
      </div>
    </div>
  );
}

/**
 * Section 2 Test Component - Date of Birth
 */
function Section2TestComponent() {
  const section2 = useSection2();
  const sf86Form = useSF86Form();

  const handleUpdateDate = () => {
    console.log('🔍 Testing Section 2 custom actions...');
    console.log('📊 Before update - Section 2 data:', section2.sectionData);
    console.log('📊 Custom actions available:', Object.keys(section2.customActions || {}));

    // Test custom actions
    if (section2.customActions?.updateDateOfBirth) {
      section2.customActions.updateDateOfBirth('01/15/1990');
      console.log('✅ Called updateDateOfBirth');
    } else {
      console.error('❌ updateDateOfBirth not available');
    }

    if (section2.customActions?.updateEstimated) {
      section2.customActions.updateEstimated(false);
      console.log('✅ Called updateEstimated');
    } else {
      console.error('❌ updateEstimated not available');
    }

    // Wait a bit and check the data again
    setTimeout(() => {
      console.log('📊 After update - Section 2 data:', section2.sectionData);

      // Test SF86FormContext integration
      console.log('🔍 Testing SF86FormContext integration...');
      console.log('📊 Registered sections:', sf86Form.registeredSections.map(s => s.sectionId));
      console.log('📊 Section 2 in registry:', sf86Form.registeredSections.find(s => s.sectionId === 'section2'));

      // Test data collection
      const collectedData = sf86Form.exportForm();
      console.log('📊 Collected form data:', collectedData);
      console.log('📊 Section 2 in collected data:', collectedData.section2);
    }, 100);
  };

  const handleClearDate = () => {
    if (section2.customActions?.updateDateOfBirth) {
      section2.customActions.updateDateOfBirth('');
    }
    if (section2.customActions?.updateEstimated) {
      section2.customActions.updateEstimated(false);
    }
  };

  return (
    <div className="section-test-panel border rounded-lg p-4 mb-4" data-testid="section2-test-panel">
      <h3 className="text-lg font-semibold mb-3">Section 2: Date of Birth</h3>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium mb-1">Date of Birth</label>
          <input
            type="text"
            value={section2.sectionData.section2.date?.value || ''}
            onChange={(e) => {
              console.log('🔧 Test Page: Date input changed:', e.target.value);
              section2.customActions?.updateDateOfBirth?.(e.target.value);
              console.log('🔧 Test Page: After updateDateOfBirth, sectionData:', section2.sectionData);
            }}
            className="w-full border rounded px-3 py-2"
            placeholder="MM/DD/YYYY"
            data-testid="section2-date-input"
          />
        </div>
        <div className="flex items-center">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={section2.sectionData.section2.isEstimated?.value || false}
              onChange={(e) => {
                console.log('🔧 Test Page: Estimated checkbox changed:', e.target.checked);
                section2.customActions?.updateEstimated?.(e.target.checked);
                console.log('🔧 Test Page: After updateEstimated, sectionData:', section2.sectionData);
              }}
              className="mr-2"
              data-testid="section2-estimated-checkbox"
            />
            Estimated
          </label>
        </div>
      </div>

      {/* Test Section 2 Data Flow Button */}
      <div className="mb-4">
        <button
          onClick={async () => {
            console.log('\n🔍 ===== TESTING SECTION 2 DATA FLOW =====');
            console.log('📊 Current Section 2 data:', section2.sectionData);
            console.log('📊 Date value:', section2.sectionData.section2.date?.value);
            console.log('📊 Estimated value:', section2.sectionData.section2.isEstimated?.value);

            // Test SF86FormContext integration
            console.log('🔧 Testing SF86FormContext updateSectionData...');
            sf86Form.updateSectionData('section2', section2.sectionData);

            console.log('🔧 Testing SF86FormContext saveForm...');
            await sf86Form.saveForm();

            console.log('✅ Section 2 data flow test completed');
          }}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Test Section 2 Data Flow
        </button>
      </div>

      <div className="flex space-x-2 mb-4">
        <button
          onClick={handleUpdateDate}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          data-testid="section2-update-date-btn"
        >
          Fill Test Data
        </button>
        <button
          onClick={handleClearDate}
          className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
          data-testid="section2-clear-date-btn"
        >
          Clear Data
        </button>
        <button
          onClick={async () => {
            console.log('🔍 Testing Section 2 persistence...');
            try {
              // Update SF86FormContext with Section 2 data
              sf86Form.updateSectionData('section2', section2.sectionData);
              console.log('✅ Updated SF86FormContext with Section 2 data');

              // Save to IndexedDB
              await sf86Form.saveForm();
              console.log('✅ Saved form to IndexedDB');

              // Test data collection
              const exportedData = sf86Form.exportForm();
              console.log('📊 Exported form data:', exportedData);
              console.log('📊 Section 2 in exported data:', exportedData.section2);
            } catch (error) {
              console.error('❌ Persistence test failed:', error);
            }
          }}
          className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
          data-testid="section2-test-persistence-btn"
        >
          Test Persistence
        </button>
      </div>

      <div className="text-sm text-gray-600">
        <p><strong>Validation:</strong> {section2.validateSection().isValid ? '✅ Valid' : '❌ Invalid'}</p>
        <p><strong>Has Changes:</strong> {section2.isDirty ? '🔄 Yes' : '✅ No'}</p>
        <p><strong>Custom Actions:</strong> {section2.customActions ? Object.keys(section2.customActions).join(', ') : 'None'}</p>
        <p><strong>Date Value:</strong> {section2.sectionData.section2.date?.value || 'Empty'}</p>
        <p><strong>Estimated Value:</strong> {section2.sectionData.section2.isEstimated?.value ? 'Yes' : 'No'}</p>
      </div>
    </div>
  );
}

/**
 * Section 5 Test Component - Other Names Used
 */
function Section5TestComponent() {
  const section5 = useSection5();

  const handleUpdateOtherNames = () => {
    console.log('🔍 Testing Section 5 - Adding other names...');
    section5.updateHasOtherNames(true);

    // Add test data to the first entry
    setTimeout(() => {
      section5.updateFieldValue('section5.otherNames[0].lastName', 'TestOtherLast');
      section5.updateFieldValue('section5.otherNames[0].firstName', 'TestOtherFirst');
      section5.updateFieldValue('section5.otherNames[0].middleName', 'TestOtherMiddle');
      section5.updateFieldValue('section5.otherNames[0].suffix', 'Jr');
      section5.updateFieldValue('section5.otherNames[0].from', '01/2020');
      section5.updateFieldValue('section5.otherNames[0].to', '12/2022');
      section5.updateFieldValue('section5.otherNames[0].reasonChanged', 'Marriage');
      console.log('✅ Added test data to first entry');
    }, 100);
  };

  const handleAddMoreEntries = () => {
    console.log('🔍 Testing Section 5 - Adding more entries...');
    const currentCount = section5.getEntryCount();
    console.log(`Current entry count: ${currentCount}`);

    if (currentCount < 4) {
      section5.addOtherNameEntry();
      console.log(`✅ Added entry. New count: ${section5.getEntryCount()}`);
    } else {
      console.log('❌ Cannot add more entries - at maximum limit');
    }
  };

  const handleClearOtherNames = () => {
    section5.updateHasOtherNames(false);
  };

  const handleTestMaxLimit = () => {
    console.log('🔍 Testing Section 5 - Maximum limit test...');
    section5.updateHasOtherNames(true);

    // Try to add 5 entries (should only allow 4)
    for (let i = 0; i < 5; i++) {
      setTimeout(() => {
        const currentCount = section5.getEntryCount();
        console.log(`Attempting to add entry ${i + 1}. Current count: ${currentCount}`);
        section5.addOtherNameEntry();
        console.log(`After add attempt. New count: ${section5.getEntryCount()}`);
      }, i * 100);
    }
  };

  return (
    <div className="section-test-panel border rounded-lg p-4 mb-4" data-testid="section5-test-panel">
      <h3 className="text-lg font-semibold mb-3">Section 5: Other Names Used (Max 4 Entries)</h3>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium mb-1">Has Other Names</label>
          <select
            value={section5.section5Data.section5.hasOtherNames.value}
            onChange={(e) => section5.updateHasOtherNames(e.target.value === 'YES')}
            className="w-full border rounded px-3 py-2"
            data-testid="section5-has-other-names"
          >
            <option value="NO">NO</option>
            <option value="YES">YES</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Number of Entries</label>
          <input
            type="text"
            value={`${section5.getEntryCount()}/4`}
            readOnly
            className="w-full border rounded px-3 py-2 bg-gray-100"
            data-testid="section5-entries-count"
          />
        </div>
      </div>

      <div className="flex space-x-2 mb-4">
        <button
          onClick={handleUpdateOtherNames}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          data-testid="section5-update-names-btn"
        >
          Fill Test Data
        </button>
        <button
          onClick={handleAddMoreEntries}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          data-testid="section5-add-entry-btn"
        >
          Add Entry
        </button>
        <button
          onClick={handleTestMaxLimit}
          className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600"
          data-testid="section5-test-max-btn"
        >
          Test Max Limit
        </button>
        <button
          onClick={handleClearOtherNames}
          className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
          data-testid="section5-clear-names-btn"
        >
          Clear Data
        </button>
      </div>

      <div className="text-sm text-gray-600">
        <p><strong>Validation:</strong> {section5.validateSection().isValid ? '✅ Valid' : '❌ Invalid'}</p>
        <p><strong>Has Changes:</strong> {section5.isDirty ? '🔄 Yes' : '✅ No'}</p>
        <p><strong>Entry Count:</strong> {section5.getEntryCount()}/4</p>
        <p><strong>Can Add More:</strong> {section5.getEntryCount() < 4 ? '✅ Yes' : '❌ No (at limit)'}</p>
      </div>
    </div>
  );
}

/**
 * Section 8 Test Component - U.S. Passport Information
 */
function Section8TestComponent() {
  const section8 = useSection8();

  const handleUpdatePassport = () => {
    section8.updatePassportFlag('YES');
    section8.updatePassportNumber('A12345678');
    section8.updatePassportName('lastName', 'TestLastName');
    section8.updatePassportName('firstName', 'TestFirstName');
    section8.updatePassportDate('issueDate', '01/01/2020');
    section8.updatePassportDate('expirationDate', '01/01/2030');
  };

  const handleClearPassport = () => {
    section8.updatePassportFlag('NO');
    section8.updatePassportNumber('');
    section8.updatePassportName('lastName', '');
    section8.updatePassportName('firstName', '');
    section8.updatePassportDate('issueDate', '');
    section8.updatePassportDate('expirationDate', '');
  };

  return (
    <div className="section-test-panel border rounded-lg p-4 mb-4" data-testid="section8-test-panel">
      <h3 className="text-lg font-semibold mb-3">Section 8: U.S. Passport Information</h3>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium mb-1">Has U.S. Passport</label>
          <select
            value={section8.section8Data.passportInfo.hasPassport.value}
            onChange={(e) => section8.updatePassportFlag(e.target.value as "YES" | "NO")}
            className="w-full border rounded px-3 py-2"
            data-testid="section8-passport-flag"
          >
            <option value="NO">NO</option>
            <option value="YES">YES</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Passport Number</label>
          <input
            type="text"
            value={section8.section8Data.passportInfo.passportNumber.value || ''}
            onChange={(e) => section8.updatePassportNumber(e.target.value)}
            className="w-full border rounded px-3 py-2"
            data-testid="section8-passport-number"
            disabled={section8.section8Data.passportInfo.hasPassport.value === 'NO'}
          />
        </div>
      </div>

      <div className="flex space-x-2 mb-4">
        <button
          onClick={handleUpdatePassport}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          data-testid="section8-update-passport-btn"
        >
          Fill Test Data
        </button>
        <button
          onClick={handleClearPassport}
          className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
          data-testid="section8-clear-passport-btn"
        >
          Clear Data
        </button>
      </div>

      <div className="text-sm text-gray-600">
        <p><strong>Validation:</strong> {section8.validateSection().isValid ? '✅ Valid' : '❌ Invalid'}</p>
        <p><strong>Has Changes:</strong> {section8.isDirty ? '🔄 Yes' : '✅ No'}</p>
        <p><strong>Passport Validation:</strong> {section8.validatePassport().isValid ? '✅ Valid' : '❌ Invalid'}</p>
      </div>
    </div>
  );
}

/**
 * Section 9 Test Component - Citizenship Status
 */
function Section9TestComponent() {
  const section9 = useSection9();

  const handleUpdateCitizenship = () => {
    section9.updateCitizenshipStatus("I am a naturalized U.S. citizen. (Complete 9.2) ");
    section9.updateBornToUSParentsInfo('documentNumber', 'TEST123456');
  };

  const handleClearCitizenship = () => {
    section9.updateCitizenshipStatus("I am a U.S. citizen or national by birth in the U.S. or U.S. territory/commonwealth. (Proceed to Section 10)   ");
    section9.updateBornToUSParentsInfo('documentNumber', '');
  };

  return (
    <div className="section-test-panel border rounded-lg p-4 mb-4" data-testid="section9-test-panel">
      <h3 className="text-lg font-semibold mb-3">Section 9: Citizenship Status</h3>

      <div className="grid grid-cols-1 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium mb-1">Citizenship Status</label>
          <select
            value={section9.section9Data.citizenshipStatus.status.value}
            onChange={(e) => section9.updateCitizenshipStatus(e.target.value as any)}
            className="w-full border rounded px-3 py-2"
            data-testid="section9-citizenship-status"
          >
            <option value="I am a U.S. citizen or national by birth in the U.S. or U.S. territory/commonwealth. (Proceed to Section 10)   ">Born in U.S.</option>
            <option value="I am a U.S. citizen or national by birth, born to U.S. parent(s), in a foreign country. (Complete 9.1) ">Born to U.S. parents abroad</option>
            <option value="I am a naturalized U.S. citizen. (Complete 9.2) ">Naturalized citizen</option>
            <option value="I am a derived U.S. citizen. (Complete 9.3) ">Derived citizen</option>
            <option value="I am not a U.S. citizen. (Complete 9.4) ">Not a U.S. citizen</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Document Number (if applicable)</label>
          <input
            type="text"
            value={section9.section9Data.citizenshipStatus.bornToUSParents?.documentNumber?.value || ''}
            onChange={(e) => section9.updateBornToUSParentsInfo('documentNumber', e.target.value)}
            className="w-full border rounded px-3 py-2"
            data-testid="section9-document-number"
          />
        </div>
      </div>

      <div className="flex space-x-2 mb-4">
        <button
          onClick={handleUpdateCitizenship}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          data-testid="section9-update-citizenship-btn"
        >
          Fill Test Data
        </button>
        <button
          onClick={handleClearCitizenship}
          className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
          data-testid="section9-clear-citizenship-btn"
        >
          Clear Data
        </button>
      </div>

      <div className="text-sm text-gray-600">
        <p><strong>Validation:</strong> {section9.validateSection().isValid ? '✅ Valid' : '❌ Invalid'}</p>
        <p><strong>Has Changes:</strong> {section9.isDirty ? '🔄 Yes' : '✅ No'}</p>
      </div>
    </div>
  );
}

/**
 * Section 27 Test Component - Use of Information Technology Systems
 */
function Section27TestComponent() {
  const section27 = useSection27();

  const handleUpdateIT = () => {
    section27.updateSubsectionFlag('illegalAccess', 'YES');
    section27.addEntry('illegalAccess');
    section27.updateFieldValue('illegalAccess', 0, 'description', 'Test illegal access description');
  };

  const handleClearIT = () => {
    section27.updateSubsectionFlag('illegalAccess', 'NO');
    section27.resetSection();
  };

  return (
    <div className="section-test-panel border rounded-lg p-4 mb-4" data-testid="section27-test-panel">
      <h3 className="text-lg font-semibold mb-3">Section 27: Use of Information Technology Systems</h3>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium mb-1">Illegal Access to IT Systems?</label>
          <select
            value={section27.section27Data.illegalAccess.hasViolation.value}
            onChange={(e) => section27.updateSubsectionFlag('illegalAccess', e.target.value as "YES" | "NO")}
            className="w-full border rounded px-3 py-2"
            data-testid="section27-illegal-access-flag"
          >
            <option value="NO">NO</option>
            <option value="YES">YES</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Number of Entries</label>
          <input
            type="text"
            value={section27.getEntryCount('illegalAccess')}
            readOnly
            className="w-full border rounded px-3 py-2 bg-gray-100"
            data-testid="section27-entries-count"
          />
        </div>
      </div>

      <div className="flex space-x-2 mb-4">
        <button
          onClick={handleUpdateIT}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          data-testid="section27-update-it-btn"
        >
          Fill Test Data
        </button>
        <button
          onClick={handleClearIT}
          className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
          data-testid="section27-clear-it-btn"
        >
          Clear Data
        </button>
        <button
          onClick={() => section27.addEntry('illegalAccess')}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          data-testid="section27-add-entry-btn"
          disabled={section27.section27Data.illegalAccess.hasViolation.value === 'NO'}
        >
          Add Entry
        </button>
      </div>

      <div className="text-sm text-gray-600">
        <p><strong>Validation:</strong> {section27.validateSection().isValid ? '✅ Valid' : '❌ Invalid'}</p>
        <p><strong>Has Changes:</strong> {section27.isDirty ? '🔄 Yes' : '✅ No'}</p>
        <p><strong>Entries:</strong> {section27.getEntryCount('illegalAccess')}</p>
        <p><strong>Technology Validation:</strong> {section27.validateTechnology().isValid ? '✅ Valid' : '❌ Invalid'}</p>
      </div>
    </div>
  );
}

/**
 * Section 29 Test Component - Association Record
 */
function Section29TestComponent() {
  const section29 = useSection29();

  const handleUpdateTerrorism = () => {
    // Update terrorism organizations flag
    section29.updateSubsectionFlag('terrorismOrganizations', 'YES');
    // Add an entry
    section29.addOrganizationEntry('terrorismOrganizations');
    // Update the entry fields
    section29.updateFieldValue('terrorismOrganizations', 0, 'organizationName', 'Test Terrorism Organization');
    section29.updateFieldValue('terrorismOrganizations', 0, 'address.street', '123 Test Street');
    section29.updateFieldValue('terrorismOrganizations', 0, 'address.city', 'Test City');
    section29.updateFieldValue('terrorismOrganizations', 0, 'address.state', 'TS');
    section29.updateFieldValue('terrorismOrganizations', 0, 'address.zipCode', '12345');
  };

  const handleClearTerrorism = () => {
    section29.updateSubsectionFlag('terrorismOrganizations', 'NO');
    section29.resetSection();
  };

  const handleTestFieldIds = () => {
    console.log('\n🔍 ===== SECTION 29 FIELD ID TEST =====');
    console.log('📊 Section 29 Data:', section29.section29Data);

    // Test radio button field IDs
    const terrorismOrgRadio = section29.section29Data.terrorismOrganizations?.hasAssociation;
    if (terrorismOrgRadio) {
      console.log('📻 Terrorism Organizations Radio Button:');
      console.log('   ID:', terrorismOrgRadio.id);
      console.log('   Name:', terrorismOrgRadio.name);
      console.log('   Value:', terrorismOrgRadio.value);
    }

    // Test entry field IDs if entries exist
    const entries = section29.section29Data.terrorismOrganizations?.entries;
    const entriesCount = entries ? entries.length : 0;

    if (entriesCount > 0 && entries) {
      const firstEntry = entries[0];
      if (firstEntry) {
        console.log('📝 First Entry Field IDs:');
        console.log('   Organization Name ID:', firstEntry.organizationName.id);
        console.log('   Organization Name Name:', firstEntry.organizationName.name);
        console.log('   Street Address ID:', firstEntry.address.street.id);
        console.log('   Street Address Name:', firstEntry.address.street.name);
      }
    }

    console.log('🔍 ===== FIELD ID TEST COMPLETE =====\n');
  };

  return (
    <div className="section-test-panel border rounded-lg p-4 mb-4" data-testid="section29-test-panel">
      <h3 className="text-lg font-semibold mb-3">Section 29: Association Record</h3>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium mb-1">Terrorism Organizations?</label>
          <select
            value={section29.section29Data.terrorismOrganizations?.hasAssociation.value || 'NO'}
            onChange={(e) => section29.updateSubsectionFlag('terrorismOrganizations', e.target.value as "YES" | "NO")}
            className="w-full border rounded px-3 py-2"
            data-testid="section29-terrorism-flag"
          >
            <option value="NO">NO</option>
            <option value="YES">YES</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Number of Entries</label>
          <input
            type="text"
            value={section29.getEntryCount('terrorismOrganizations')}
            readOnly
            className="w-full border rounded px-3 py-2 bg-gray-100"
            data-testid="section29-entries-count"
          />
        </div>
      </div>

      {/* Show first entry fields if they exist */}
      {section29.getEntryCount('terrorismOrganizations') > 0 && (
        <div className="border rounded p-3 mb-4 bg-gray-50">
          <h4 className="font-medium mb-2">First Entry Fields</h4>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <label className="block text-xs font-medium mb-1">Organization Name</label>
              <input
                type="text"
                value={section29.getEntry('terrorismOrganizations', 0)?.organizationName.value || ''}
                onChange={(e) => section29.updateFieldValue('terrorismOrganizations', 0, 'organizationName', e.target.value)}
                className="w-full border rounded px-2 py-1 text-sm"
                data-testid="section29-org-name"
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1">Street Address</label>
              <input
                type="text"
                value={section29.getEntry('terrorismOrganizations', 0)?.address.street.value || ''}
                onChange={(e) => section29.updateFieldValue('terrorismOrganizations', 0, 'address.street', e.target.value)}
                className="w-full border rounded px-2 py-1 text-sm"
                data-testid="section29-street"
              />
            </div>
          </div>
        </div>
      )}

      <div className="flex space-x-2 mb-4">
        <button
          onClick={handleUpdateTerrorism}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          data-testid="section29-update-terrorism-btn"
        >
          Fill Test Data
        </button>
        <button
          onClick={handleClearTerrorism}
          className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
          data-testid="section29-clear-terrorism-btn"
        >
          Clear Data
        </button>
        <button
          onClick={() => section29.addOrganizationEntry('terrorismOrganizations')}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          data-testid="section29-add-entry-btn"
          disabled={section29.section29Data.terrorismOrganizations?.hasAssociation.value.startsWith('NO')}
        >
          Add Entry
        </button>
        <button
          onClick={handleTestFieldIds}
          className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
          data-testid="section29-test-field-ids-btn"
        >
          Test Field IDs
        </button>
        <button
          onClick={() => window.open('/startForm', '_blank')}
          className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600"
          data-testid="section29-open-form-btn"
        >
          Open Form
        </button>
      </div>

      <div className="text-sm text-gray-600">
        <p><strong>Validation:</strong> {section29.validateSection() ? '✅ Valid' : '❌ Invalid'}</p>
        <p><strong>Has Changes:</strong> {section29.isDirty ? '🔄 Yes' : '✅ No'}</p>
        <p><strong>Entries:</strong> {section29.getEntryCount('terrorismOrganizations')}</p>
      </div>
    </div>
  );
}

/**
 * Cross-Section Integration Test Component
 */
function CrossSectionIntegrationTest() {
  const sf86Form = useSF86Form();

  const handleExportData = () => {
    console.log('\n🔍 ===== CROSS-SECTION EXPORT TEST =====');
    const exportedData = sf86Form.exportForm();
    console.log('📊 Exported Form Data:', exportedData);
    console.log('📋 Exported sections:', Object.keys(exportedData));
    console.log('📈 Total sections exported:', Object.keys(exportedData).length);

    // Detailed analysis of each section
    Object.entries(exportedData).forEach(([sectionId, sectionData]) => {
      console.log(`\n📁 Section ${sectionId}:`, sectionData);
      if (sectionData && typeof sectionData === 'object') {
        console.log(`   📊 Section ${sectionId} keys:`, Object.keys(sectionData));
      }
    });
    console.log('🔍 ===== EXPORT TEST COMPLETE =====\n');
  };

  const handleSaveForm = async () => {
    try {
      console.log('\n💾 ===== CROSS-SECTION SAVE TEST =====');
      await sf86Form.saveForm();
      console.log('✅ Form saved successfully');
      console.log('💾 ===== SAVE TEST COMPLETE =====\n');
    } catch (error) {
      console.error('❌ Form save failed:', error);
    }
  };

  const handleGeneratePDF = async () => {
    try {
      console.log('\n📄 ===== CROSS-SECTION PDF TEST =====');
      const result = await sf86Form.generatePdf();
      console.log('📄 PDF Generation Result:', result);
      console.log('📊 Fields mapped:', result.fieldsMapped);
      console.log('📊 Fields applied:', result.fieldsApplied);
      console.log('📄 ===== PDF TEST COMPLETE =====\n');
    } catch (error) {
      console.error('❌ PDF generation failed:', error);
    }
  };

  const handlePopulateAllSections = () => {
    console.log('\n🔄 ===== POPULATING ALL SECTIONS =====');

    // Populate Section 1 data (using generic updateFieldValue)
    const section1 = sf86Form.registeredSections.find(s => s.sectionId === 'section1');
    if (section1?.context?.updateFieldValue) {
      console.log('📝 Populating Section 1...');
      section1.context.updateFieldValue('section1.lastName', 'TestLastName');
      section1.context.updateFieldValue('section1.firstName', 'TestFirstName');
      section1.context.updateFieldValue('section1.middleName', 'TestMiddleName');
      section1.context.updateFieldValue('section1.suffix', 'Jr');
    }

    // Populate Section 2 data
    const section2 = sf86Form.registeredSections.find(s => s.sectionId === 'section2');
    if (section2?.context?.updateFieldValue) {
      console.log('📝 Populating Section 2...');
      section2.context.updateFieldValue('dateOfBirth.date', '01/15/1990');
      section2.context.updateFieldValue('dateOfBirth.isEstimated', false);
    }

    // Populate Section 8 data (using generic updateFieldValue)
    const section8 = sf86Form.registeredSections.find(s => s.sectionId === 'section8');
    if (section8?.context?.updateFieldValue) {
      console.log('📝 Populating Section 8...');
      section8.context.updateFieldValue('passportInfo.hasPassport', 'YES');
      section8.context.updateFieldValue('passportInfo.passportNumber', 'A12345678');
    }

    // Populate Section 9 data (using generic updateFieldValue)
    const section9 = sf86Form.registeredSections.find(s => s.sectionId === 'section9');
    if (section9?.context?.updateFieldValue) {
      console.log('📝 Populating Section 9...');
      section9.context.updateFieldValue('citizenshipStatus.status', 'I am a naturalized U.S. citizen');
    }

    // Populate Section 27 data (using generic updateFieldValue)
    const section27 = sf86Form.registeredSections.find(s => s.sectionId === 'section27');
    if (section27?.context?.updateFieldValue) {
      console.log('📝 Populating Section 27...');
      section27.context.updateFieldValue('illegalAccess.hasViolation', 'YES');
    }

    // Populate Section 29 data
    const section29 = sf86Form.registeredSections.find(s => s.sectionId === 'section29');
    if (section29?.context?.updateFieldValue) {
      console.log('📝 Populating Section 29...');
      section29.context.updateFieldValue('terrorismOrganizations.hasAssociation', 'YES');
      // We can't easily add entries via the generic context interface
      console.log('Note: To add entries to Section 29, use the dedicated component interface');
    }

    console.log('✅ All sections populated');
    console.log('🔄 ===== POPULATION COMPLETE =====\n');
  };

  const handleClearAllSections = () => {
    console.log('\n🧹 ===== CLEARING ALL SECTIONS =====');

    // Clear Section 1 data
    const section1 = sf86Form.registeredSections.find(s => s.sectionId === 'section1');
    if (section1?.context?.resetSection) {
      console.log('🧹 Clearing Section 1...');
      section1.context.resetSection();
    }

    // Clear Section 2 data
    const section2 = sf86Form.registeredSections.find(s => s.sectionId === 'section2');
    if (section2?.context?.resetSection) {
      console.log('🧹 Clearing Section 2...');
      section2.context.resetSection();
    }

    // Clear Section 8 data
    const section8 = sf86Form.registeredSections.find(s => s.sectionId === 'section8');
    if (section8?.context?.resetSection) {
      console.log('🧹 Clearing Section 8...');
      section8.context.resetSection();
    }

    // Clear Section 9 data
    const section9 = sf86Form.registeredSections.find(s => s.sectionId === 'section9');
    if (section9?.context?.resetSection) {
      console.log('🧹 Clearing Section 9...');
      section9.context.resetSection();
    }

    // Clear Section 27 data
    const section27 = sf86Form.registeredSections.find(s => s.sectionId === 'section27');
    if (section27?.context?.resetSection) {
      console.log('🧹 Clearing Section 27...');
      section27.context.resetSection();
    }

    // Clear Section 29 data
    const section29 = sf86Form.registeredSections.find(s => s.sectionId === 'section29');
    if (section29?.context?.resetSection) {
      console.log('🧹 Clearing Section 29...');
      section29.context.resetSection();
    }

    console.log('✅ All sections cleared');
    console.log('🧹 ===== CLEARING COMPLETE =====\n');
  };

  return (
    <div className="integration-test-panel border rounded-lg p-4 mb-4" data-testid="integration-test-panel">
      <h3 className="text-lg font-semibold mb-3">Cross-Section Integration Tests</h3>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <h4 className="font-medium mb-2">Registered Sections</h4>
          <ul className="text-sm">
            {sf86Form.registeredSections.map((section) => (
              <li key={section.sectionId} className="flex justify-between">
                <span>{section.sectionName}</span>
                <span className={section.isActive ? 'text-green-600' : 'text-gray-400'}>
                  {section.isActive ? '✅' : '⏸️'}
                </span>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className="font-medium mb-2">Form Status</h4>
          <div className="text-sm space-y-1">
            <p><strong>Is Dirty:</strong> {sf86Form.isDirty ? '🔄 Yes' : '✅ No'}</p>
            <p><strong>Is Valid:</strong> {sf86Form.isValid ? '✅ Yes' : '❌ No'}</p>
            <p><strong>Active Sections:</strong> {sf86Form.activeSections.length}</p>
            <p><strong>Completed Sections:</strong> {sf86Form.completedSections.length}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 mb-4">
        <button
          onClick={handlePopulateAllSections}
          className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600"
          data-testid="populate-all-btn"
        >
          Populate All Sections
        </button>
        <button
          onClick={handleClearAllSections}
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          data-testid="clear-all-btn"
        >
          Clear All Sections
        </button>
        <button
          onClick={handleExportData}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          data-testid="export-data-btn"
        >
          Export Data
        </button>
        <button
          onClick={handleSaveForm}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          data-testid="save-form-btn"
        >
          Save Form
        </button>
        <button
          onClick={handleGeneratePDF}
          className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 col-span-2"
          data-testid="generate-pdf-btn"
        >
          Generate PDF
        </button>
      </div>

      <div className="text-sm text-gray-600">
        <p><strong>Last Saved:</strong> {sf86Form.lastSaved ? sf86Form.lastSaved.toLocaleString() : 'Never'}</p>
        <p><strong>Auto Save:</strong> {sf86Form.autoSave ? '✅ Enabled' : '❌ Disabled'}</p>
      </div>
    </div>
  );
}

// ============================================================================
// MAIN TEST PAGE COMPONENT
// ============================================================================

export default function MultiSectionTestPage({}: Route.ComponentProps) {
  const [activeTab, setActiveTab] = useState<'section1' | 'section2' | 'section5' | 'section7' | 'section8' | 'section9' | 'section27' | 'section29' | 'integration'>('section1');

  return (
    <CompleteSF86FormProvider>
      <div className="multi-section-test-page min-h-screen bg-gray-50 p-6" data-testid="multi-section-test-page">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold text-center mb-8">Multi-Section SF-86 Form Tests</h1>

          {/* Test Navigation */}
          <nav className="test-nav mb-8" data-testid="test-navigation">
            <div className="flex justify-center space-x-2 flex-wrap">
              <button
                className={`px-4 py-2 rounded-lg font-semibold ${activeTab === 'section1' ? 'bg-blue-500 text-white' : 'bg-white text-blue-500 border border-blue-500'}`}
                onClick={() => setActiveTab('section1')}
                data-testid="section1-tab"
              >
                Section 1
              </button>
              <button
                className={`px-4 py-2 rounded-lg font-semibold ${activeTab === 'section2' ? 'bg-blue-500 text-white' : 'bg-white text-blue-500 border border-blue-500'}`}
                onClick={() => setActiveTab('section2')}
                data-testid="section2-tab"
              >
                Section 2
              </button>
              <button
                className={`px-4 py-2 rounded-lg font-semibold ${activeTab === 'section5' ? 'bg-blue-500 text-white' : 'bg-white text-blue-500 border border-blue-500'}`}
                onClick={() => setActiveTab('section5')}
                data-testid="section5-tab"
              >
                Section 5
              </button>
              <button
                className={`px-4 py-2 rounded-lg font-semibold ${activeTab === 'section7' ? 'bg-blue-500 text-white' : 'bg-white text-blue-500 border border-blue-500'}`}
                onClick={() => setActiveTab('section7')}
                data-testid="section7-tab"
              >
                Section 7
              </button>
              <button
                className={`px-4 py-2 rounded-lg font-semibold ${activeTab === 'section8' ? 'bg-blue-500 text-white' : 'bg-white text-blue-500 border border-blue-500'}`}
                onClick={() => setActiveTab('section8')}
                data-testid="section8-tab"
              >
                Section 8
              </button>
              <button
                className={`px-4 py-2 rounded-lg font-semibold ${activeTab === 'section9' ? 'bg-blue-500 text-white' : 'bg-white text-blue-500 border border-blue-500'}`}
                onClick={() => setActiveTab('section9')}
                data-testid="section9-tab"
              >
                Section 9
              </button>
              <button
                className={`px-4 py-2 rounded-lg font-semibold ${activeTab === 'section27' ? 'bg-blue-500 text-white' : 'bg-white text-blue-500 border border-blue-500'}`}
                onClick={() => setActiveTab('section27')}
                data-testid="section27-tab"
              >
                Section 27
              </button>
              <button
                className={`px-4 py-2 rounded-lg font-semibold ${activeTab === 'section29' ? 'bg-blue-500 text-white' : 'bg-white text-blue-500 border border-blue-500'}`}
                onClick={() => setActiveTab('section29')}
                data-testid="section29-tab"
              >
                Section 29
              </button>
              <button
                className={`px-4 py-2 rounded-lg font-semibold ${activeTab === 'integration' ? 'bg-blue-500 text-white' : 'bg-white text-blue-500 border border-blue-500'}`}
                onClick={() => setActiveTab('integration')}
                data-testid="integration-tab"
              >
                Integration
              </button>
            </div>
          </nav>

          {/* Test Content */}
          <main className="test-content bg-white rounded-lg shadow-lg p-6">
            {activeTab === 'section1' && <Section1TestComponent />}
            {activeTab === 'section2' && <Section2TestComponent />}
            {activeTab === 'section5' && <Section5TestComponent />}
            {activeTab === 'section7' && <div data-testid="section7-placeholder">Section 7 test component (API methods need verification)</div>}
            {activeTab === 'section8' && <Section8TestComponent />}
            {activeTab === 'section9' && <Section9TestComponent />}
            {activeTab === 'section27' && <Section27TestComponent />}
            {activeTab === 'section29' && <Section29TestComponent />}
            {activeTab === 'integration' && <CrossSectionIntegrationTest />}
          </main>
        </div>
      </div>
    </CompleteSF86FormProvider>
  );
}