/**
 * Section 29 Context Usage Examples
 * 
 * This file demonstrates how to use the Section29Context in various scenarios
 * including form components, integration with ApplicantFormValues, and
 * advanced entry management operations.
 */

import React, { useState, useEffect } from 'react';
import { Section29Provider, useSection29 } from '../sections2.0/section29';
import type { ApplicantFormValues } from '../../../../api/interfaces/formDefinition2.0';

// ============================================================================
// BASIC FORM COMPONENT EXAMPLE
// ============================================================================

/**
 * Example form component showing basic Section29 usage
 */
const Section29BasicForm: React.FC = () => {
  const {
    section29Data,
    updateSubsectionFlag,
    addOrganizationEntry,
    addActivityEntry,
    removeEntry,
    updateFieldValue,
    getEntryCount,
    isDirty,
    validateSection
  } = useSection29();

  const handleSubsectionChange = (subsectionKey: any, value: "YES" | "NO") => {
    updateSubsectionFlag(subsectionKey, value);
  };

  const handleAddOrganization = (subsectionKey: any) => {
    addOrganizationEntry(subsectionKey);
  };

  const handleFieldChange = (subsectionKey: any, entryIndex: number, fieldPath: string, value: any) => {
    updateFieldValue(subsectionKey, entryIndex, fieldPath, value);
  };

  return (
    <div className="section29-form">
      <h2>Section 29: Associations</h2>
      
      {/* Terrorism Organizations Subsection */}
      <div className="subsection">
        <h3>Terrorism Organizations</h3>
        
        <div className="question">
          <label>
            <input
              type="radio"
              name="terrorismOrganizations"
              value="YES"
              checked={section29Data.terrorismOrganizations?.hasAssociation.value === "YES"}
              onChange={() => handleSubsectionChange('terrorismOrganizations', 'YES')}
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
            />
            No
          </label>
        </div>

        {section29Data.terrorismOrganizations?.hasAssociation.value === "YES" && (
          <div className="entries">
            <button onClick={() => handleAddOrganization('terrorismOrganizations')}>
              Add Organization Entry
            </button>
            
            {section29Data.terrorismOrganizations.entries.map((entry, index) => (
              <div key={entry._id} className="entry">
                <h4>Entry #{index + 1}</h4>
                
                <div className="field">
                  <label>{entry.organizationName.label}</label>
                  <input
                    type="text"
                    value={entry.organizationName.value}
                    onChange={(e) => handleFieldChange('terrorismOrganizations', index, 'organizationName.value', e.target.value)}
                  />
                </div>

                <div className="address-group">
                  <h5>Address</h5>
                  <input
                    type="text"
                    placeholder="Street"
                    value={entry.address.street.value}
                    onChange={(e) => handleFieldChange('terrorismOrganizations', index, 'address.street.value', e.target.value)}
                  />
                  <input
                    type="text"
                    placeholder="City"
                    value={entry.address.city.value}
                    onChange={(e) => handleFieldChange('terrorismOrganizations', index, 'address.city.value', e.target.value)}
                  />
                </div>

                <button onClick={() => removeEntry('terrorismOrganizations', index)}>
                  Remove Entry
                </button>
              </div>
            ))}
            
            <p>Total entries: {getEntryCount('terrorismOrganizations')}</p>
          </div>
        )}
      </div>

      {/* Form Status */}
      <div className="form-status">
        <p>Form has changes: {isDirty ? 'Yes' : 'No'}</p>
        <button onClick={() => validateSection()}>Validate Section</button>
      </div>
    </div>
  );
};

// ============================================================================
// ADVANCED ENTRY MANAGEMENT EXAMPLE
// ============================================================================

/**
 * Example component showing advanced entry management features
 */
const Section29AdvancedManagement: React.FC = () => {
  const {
    section29Data,
    getEntry,
    moveEntry,
    duplicateEntry,
    clearEntry,
    bulkUpdateFields
  } = useSection29();

  const handleMoveEntry = (subsectionKey: any, fromIndex: number, direction: 'up' | 'down') => {
    const toIndex = direction === 'up' ? fromIndex - 1 : fromIndex + 1;
    moveEntry(subsectionKey, fromIndex, toIndex);
  };

  const handleDuplicateEntry = (subsectionKey: any, entryIndex: number) => {
    duplicateEntry(subsectionKey, entryIndex);
  };

  const handleClearEntry = (subsectionKey: any, entryIndex: number) => {
    if (confirm('Are you sure you want to clear this entry?')) {
      clearEntry(subsectionKey, entryIndex);
    }
  };

  const handleBulkUpdate = (subsectionKey: any, entryIndex: number) => {
    const updates = {
      'address.country.value': 'United States',
      'dateRange.present.value': true
    };
    bulkUpdateFields(subsectionKey, entryIndex, updates);
  };

  return (
    <div className="advanced-management">
      <h3>Advanced Entry Management</h3>
      
      {section29Data.terrorismOrganizations?.entries.map((entry, index) => (
        <div key={entry._id} className="entry-management">
          <h4>Entry #{index + 1}: {entry.organizationName.value || 'Unnamed'}</h4>
          
          <div className="entry-actions">
            <button 
              onClick={() => handleMoveEntry('terrorismOrganizations', index, 'up')}
              disabled={index === 0}
            >
              Move Up
            </button>
            
            <button 
              onClick={() => handleMoveEntry('terrorismOrganizations', index, 'down')}
              disabled={index === section29Data.terrorismOrganizations.entries.length - 1}
            >
              Move Down
            </button>
            
            <button onClick={() => handleDuplicateEntry('terrorismOrganizations', index)}>
              Duplicate
            </button>
            
            <button onClick={() => handleClearEntry('terrorismOrganizations', index)}>
              Clear
            </button>
            
            <button onClick={() => handleBulkUpdate('terrorismOrganizations', index)}>
              Set Defaults
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

// ============================================================================
// INTEGRATION WITH APPLICANT FORM VALUES
// ============================================================================

/**
 * Example showing integration with the main form context
 */
const Section29Integration: React.FC = () => {
  const { section29Data, loadSection, resetSection } = useSection29();
  const [formData, setFormData] = useState<ApplicantFormValues>({});

  // Load Section29 data into main form
  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      section29: section29Data
    }));
  }, [section29Data]);

  // Load existing data from main form
  const handleLoadFromForm = () => {
    if (formData.section29) {
      loadSection(formData.section29);
    }
  };

  // Export Section29 data
  const handleExportData = () => {
    const exportData = {
      section29: section29Data,
      timestamp: new Date().toISOString(),
      version: '1.0'
    };
    
    console.log('Exported Section29 data:', exportData);
    
    // In a real application, you might:
    // - Save to localStorage
    // - Send to API
    // - Download as JSON file
    localStorage.setItem('section29-backup', JSON.stringify(exportData));
  };

  // Import Section29 data
  const handleImportData = () => {
    try {
      const importData = localStorage.getItem('section29-backup');
      if (importData) {
        const parsed = JSON.parse(importData);
        if (parsed.section29) {
          loadSection(parsed.section29);
        }
      }
    } catch (error) {
      console.error('Failed to import data:', error);
    }
  };

  return (
    <div className="integration-example">
      <h3>Form Integration</h3>
      
      <div className="integration-actions">
        <button onClick={handleLoadFromForm}>
          Load from Main Form
        </button>
        
        <button onClick={handleExportData}>
          Export Section Data
        </button>
        
        <button onClick={handleImportData}>
          Import Section Data
        </button>
        
        <button onClick={resetSection}>
          Reset Section
        </button>
      </div>

      <div className="data-preview">
        <h4>Current Form Data Structure:</h4>
        <pre>
          {JSON.stringify({
            personalInfo: formData.personalInfo ? 'Present' : 'Not set',
            section29: formData.section29 ? 'Present' : 'Not set',
            signature: formData.signature ? 'Present' : 'Not set'
          }, null, 2)}
        </pre>
      </div>
    </div>
  );
};

// ============================================================================
// COMPLETE EXAMPLE APP
// ============================================================================

/**
 * Complete example showing how to use Section29Provider
 */
const Section29ExampleApp: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'basic' | 'advanced' | 'integration'>('basic');

  return (
    <Section29Provider>
      <div className="section29-example-app">
        <nav className="tabs">
          <button 
            className={activeTab === 'basic' ? 'active' : ''}
            onClick={() => setActiveTab('basic')}
          >
            Basic Form
          </button>
          <button 
            className={activeTab === 'advanced' ? 'active' : ''}
            onClick={() => setActiveTab('advanced')}
          >
            Advanced Management
          </button>
          <button 
            className={activeTab === 'integration' ? 'active' : ''}
            onClick={() => setActiveTab('integration')}
          >
            Integration
          </button>
        </nav>

        <main className="content">
          {activeTab === 'basic' && <Section29BasicForm />}
          {activeTab === 'advanced' && <Section29AdvancedManagement />}
          {activeTab === 'integration' && <Section29Integration />}
        </main>
      </div>
    </Section29Provider>
  );
};

export default Section29ExampleApp;
