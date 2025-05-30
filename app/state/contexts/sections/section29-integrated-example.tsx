/**
 * Section29 Integrated Example Component
 * 
 * This component demonstrates the migrated Section29 Context with SF86Form integration.
 * It shows how existing functionality is preserved while new capabilities are added.
 */

import React, { useState, useEffect } from 'react';
import { Section29Provider, useSection29 } from './section29-integrated';
import { CompleteSF86FormProvider } from '../SF86FormContext';

// ============================================================================
// EXAMPLE COMPONENT USING INTEGRATED SECTION29
// ============================================================================

/**
 * Main Section29 form component showing both original and new capabilities
 */
const Section29IntegratedForm: React.FC = () => {
  const {
    // ============================================================================
    // ORIGINAL SECTION29 FUNCTIONALITY (UNCHANGED)
    // ============================================================================
    
    // State
    section29Data,
    isLoading,
    errors,
    isDirty,
    
    // CRUD Operations
    updateSubsectionFlag,
    addOrganizationEntry,
    addActivityEntry,
    removeEntry,
    updateFieldValue,
    getEntryCount,
    
    // Utility
    validateSection,
    resetSection,
    
    // ============================================================================
    // NEW: SF86FORM INTEGRATION CAPABILITIES
    // ============================================================================
    
    // Global Form Operations
    markComplete,
    markIncomplete,
    triggerGlobalValidation,
    getGlobalFormState,
    navigateToSection,
    saveForm,
    
    // Event System
    emitEvent,
    subscribeToEvents,
    notifyChange
  } = useSection29();
  
  // Local state for demonstration
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [eventLog, setEventLog] = useState<string[]>([]);
  
  // ============================================================================
  // ORIGINAL FUNCTIONALITY EXAMPLES (PRESERVED)
  // ============================================================================
  
  /**
   * Handle terrorism organization flag change (original functionality)
   */
  const handleTerrorismFlagChange = (value: "YES" | "NO") => {
    updateSubsectionFlag('terrorismOrganizations', value);
    
    // If YES, automatically add an entry for user convenience
    if (value === 'YES') {
      addOrganizationEntry('terrorismOrganizations');
    }
  };
  
  /**
   * Handle adding organization entry (original functionality)
   */
  const handleAddOrganization = (subsectionKey: string) => {
    addOrganizationEntry(subsectionKey as any);
  };
  
  /**
   * Handle field value update (original functionality)
   */
  const handleFieldUpdate = (subsectionKey: string, entryIndex: number, fieldPath: string, value: any) => {
    updateFieldValue(subsectionKey as any, entryIndex, fieldPath, value);
  };
  
  // ============================================================================
  // NEW: INTEGRATION FUNCTIONALITY EXAMPLES
  // ============================================================================
  
  /**
   * Enhanced section completion with global coordination
   */
  const handleCompleteSection = async () => {
    // Validate current section
    const sectionResult = validateSection();
    
    if (sectionResult.isValid) {
      // Trigger global validation
      const globalResult = triggerGlobalValidation();
      
      if (globalResult.isValid) {
        // Mark section as complete
        markComplete();
        
        // Save entire form
        try {
          await saveForm();
          console.log('Form saved successfully');
          
          // Navigate to next section
          navigateToSection('section30');
        } catch (error) {
          console.error('Save failed:', error);
        }
      } else {
        console.log('Global validation failed:', globalResult.errors);
      }
    } else {
      console.log('Section validation failed:', sectionResult.errors);
    }
  };
  
  /**
   * Cross-section communication example
   */
  const handleNotifyOtherSections = () => {
    const hasAssociations = section29Data.terrorismOrganizations?.hasAssociation?.value === 'YES';
    
    if (hasAssociations) {
      emitEvent({
        type: 'SECTION_UPDATE',
        sectionId: 'section29',
        payload: {
          action: 'terrorism_associations_detected',
          requiresAdditionalScreening: true,
          affectedSections: ['section30', 'section31']
        }
      });
      
      setEventLog(prev => [...prev, 'Notified other sections of terrorism associations']);
    }
  };
  
  /**
   * Get global form state for display
   */
  const globalState = getGlobalFormState();
  
  // ============================================================================
  // EVENT LISTENERS (NEW CAPABILITY)
  // ============================================================================
  
  useEffect(() => {
    // Listen for events from other sections
    const unsubscribe = subscribeToEvents('SECTION_UPDATE', (event) => {
      setEventLog(prev => [...prev, `Received event from ${event.sectionId}: ${event.payload.action}`]);
    });
    
    return unsubscribe;
  }, [subscribeToEvents]);
  
  // ============================================================================
  // RENDER
  // ============================================================================
  
  return (
    <div className="section29-integrated-form">
      <h2>Section 29: Associations (Integrated)</h2>
      
      {/* Global Form Status (NEW) */}
      <div className="global-status" style={{ background: '#f0f8ff', padding: '1rem', marginBottom: '1rem' }}>
        <h3>🌐 Global Form Status</h3>
        <p><strong>Form is dirty:</strong> {globalState.isDirty ? 'Yes' : 'No'}</p>
        <p><strong>Form is valid:</strong> {globalState.isValid ? 'Yes' : 'No'}</p>
        <p><strong>Completed sections:</strong> {globalState.completedSections?.join(', ') || 'None'}</p>
        <p><strong>Section is dirty:</strong> {isDirty ? 'Yes' : 'No'}</p>
        {isLoading && <p><strong>Loading...</strong></p>}
      </div>
      
      {/* Original Section29 Form (PRESERVED) */}
      <div className="section29-content">
        <h3>Terrorism Organizations</h3>
        <div className="question-group">
          <p>Have you EVER been a member of an organization dedicated to terrorism?</p>
          <label>
            <input
              type="radio"
              name="terrorismOrgs"
              value="YES"
              checked={section29Data.terrorismOrganizations?.hasAssociation?.value === 'YES'}
              onChange={() => handleTerrorismFlagChange('YES')}
            />
            Yes
          </label>
          <label>
            <input
              type="radio"
              name="terrorismOrgs"
              value="NO"
              checked={section29Data.terrorismOrganizations?.hasAssociation?.value === 'NO'}
              onChange={() => handleTerrorismFlagChange('NO')}
            />
            No
          </label>
        </div>
        
        {/* Show entries if YES selected */}
        {section29Data.terrorismOrganizations?.hasAssociation?.value === 'YES' && (
          <div className="entries-section">
            <h4>Organization Details</h4>
            <p>Entries: {getEntryCount('terrorismOrganizations')}</p>
            
            <button onClick={() => handleAddOrganization('terrorismOrganizations')}>
              Add Organization
            </button>
            
            {section29Data.terrorismOrganizations.entries.map((entry, index) => (
              <div key={entry._id} className="entry-card" style={{ border: '1px solid #ccc', padding: '1rem', margin: '0.5rem 0' }}>
                <h5>Organization {index + 1}</h5>
                <input
                  type="text"
                  placeholder="Organization Name"
                  value={entry.organizationName.value}
                  onChange={(e) => handleFieldUpdate('terrorismOrganizations', index, 'organizationName.value', e.target.value)}
                />
                <button onClick={() => removeEntry('terrorismOrganizations', index)}>
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}
        
        {/* Validation Errors */}
        {Object.keys(errors).length > 0 && (
          <div className="errors" style={{ color: 'red', marginTop: '1rem' }}>
            <h4>Validation Errors:</h4>
            <ul>
              {Object.entries(errors).map(([field, message]) => (
                <li key={field}>{field}: {message}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
      
      {/* Integration Controls (NEW) */}
      <div className="integration-controls" style={{ background: '#f8f8f8', padding: '1rem', marginTop: '1rem' }}>
        <h3>🔗 Integration Controls</h3>
        
        <div className="button-group" style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <button onClick={handleCompleteSection}>
            Complete Section & Continue
          </button>
          
          <button onClick={() => navigateToSection('section28')}>
            Go to Previous Section
          </button>
          
          <button onClick={() => saveForm()}>
            Save All Sections
          </button>
          
          <button onClick={handleNotifyOtherSections}>
            Notify Other Sections
          </button>
          
          <button onClick={() => setShowAdvanced(!showAdvanced)}>
            {showAdvanced ? 'Hide' : 'Show'} Advanced
          </button>
          
          <button onClick={resetSection}>
            Reset Section
          </button>
        </div>
        
        {/* Advanced Integration Features */}
        {showAdvanced && (
          <div className="advanced-features" style={{ marginTop: '1rem', padding: '1rem', background: '#fff' }}>
            <h4>Advanced Integration Features</h4>
            
            <div className="feature-demo">
              <h5>Event Log:</h5>
              <div style={{ maxHeight: '100px', overflowY: 'auto', border: '1px solid #ccc', padding: '0.5rem' }}>
                {eventLog.length === 0 ? (
                  <p>No events yet...</p>
                ) : (
                  eventLog.map((event, index) => (
                    <div key={index} style={{ fontSize: '0.8rem', marginBottom: '0.25rem' }}>
                      {new Date().toLocaleTimeString()}: {event}
                    </div>
                  ))
                )}
              </div>
            </div>
            
            <div className="validation-demo" style={{ marginTop: '1rem' }}>
              <h5>Validation Status:</h5>
              <button onClick={() => {
                const result = validateSection();
                console.log('Section validation result:', result);
                setEventLog(prev => [...prev, `Section validation: ${result.isValid ? 'PASSED' : 'FAILED'}`]);
              }}>
                Validate Section
              </button>
              
              <button onClick={() => {
                const result = triggerGlobalValidation();
                console.log('Global validation result:', result);
                setEventLog(prev => [...prev, `Global validation: ${result.isValid ? 'PASSED' : 'FAILED'}`]);
              }}>
                Validate All Sections
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// ============================================================================
// COMPLETE EXAMPLE WITH PROVIDERS
// ============================================================================

/**
 * Complete example showing the proper provider setup
 */
export const Section29IntegratedExample: React.FC = () => {
  return (
    <CompleteSF86FormProvider>
      <Section29Provider>
        <Section29IntegratedForm />
      </Section29Provider>
    </CompleteSF86FormProvider>
  );
};

// ============================================================================
// COMPARISON COMPONENT
// ============================================================================

/**
 * Component showing side-by-side comparison of capabilities
 */
export const Section29CapabilitiesComparison: React.FC = () => {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', padding: '2rem' }}>
      <div>
        <h3>✅ Original Capabilities (Preserved)</h3>
        <ul>
          <li>CRUD operations for all subsections</li>
          <li>Field ID generation with PDF compliance</li>
          <li>Entry management (add, remove, move, duplicate)</li>
          <li>Local validation and error handling</li>
          <li>Change tracking and dirty state</li>
          <li>TypeScript interfaces and type safety</li>
          <li>React Context patterns</li>
          <li>Performance optimizations</li>
        </ul>
      </div>
      
      <div>
        <h3>🆕 New Integration Capabilities</h3>
        <ul>
          <li>Global form state access</li>
          <li>Cross-section navigation</li>
          <li>Centralized validation coordination</li>
          <li>Auto-save functionality</li>
          <li>Event-driven communication</li>
          <li>Section completion tracking</li>
          <li>Global change detection</li>
          <li>Form persistence management</li>
        </ul>
      </div>
    </div>
  );
};

// ============================================================================
// EXPORTS
// ============================================================================

export default Section29IntegratedExample;
export { Section29IntegratedForm, Section29CapabilitiesComparison };
