/**
 * Complete Section 29 Test - Add entries and test PDF generation
 * 
 * This test adds actual data to Section 29 subsections and tests PDF generation
 * to identify the exact field mapping issue.
 */

import React, { useState } from 'react';
import { Section29Provider, useSection29 } from '../state/contexts/sections2.0/section29';
import { CompleteSF86FormProvider } from '../state/contexts/SF86FormContext';
import { clientPdfService2 } from '../../api/service/clientPdfService2.0';

const Section29TestComponent: React.FC = () => {
  const {
    section29Data,
    updateSubsectionFlag,
    addOrganizationEntry,
    addActivityEntry,
    updateFieldValue,
    getEntryCount
  } = useSection29();

  const [testResults, setTestResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const addTestEntries = async () => {
    console.log('\n🎯 === ADDING TEST ENTRIES TO SECTION 29 ===');
    
    try {
      // 1. Terrorism Organizations - Add 2 entries
      console.log('Adding terrorism organizations entries...');
      updateSubsectionFlag('terrorismOrganizations', 'hasAssociation', 'YES');
      addOrganizationEntry('terrorismOrganizations');
      addOrganizationEntry('terrorismOrganizations');
      
      // Add data to terrorism organizations
      updateFieldValue('terrorismOrganizations', 0, 'organizationName', 'Test Terrorism Org 1');
      updateFieldValue('terrorismOrganizations', 0, 'address.street', '123 Terror St');
      updateFieldValue('terrorismOrganizations', 0, 'address.city', 'Terror City');
      updateFieldValue('terrorismOrganizations', 0, 'address.state', 'CA');
      updateFieldValue('terrorismOrganizations', 0, 'address.zipCode', '12345');
      updateFieldValue('terrorismOrganizations', 0, 'involvementDescription', 'Test involvement description 1');
      
      updateFieldValue('terrorismOrganizations', 1, 'organizationName', 'Test Terrorism Org 2');
      updateFieldValue('terrorismOrganizations', 1, 'address.street', '456 Terror Ave');
      updateFieldValue('terrorismOrganizations', 1, 'address.city', 'Terror Town');
      updateFieldValue('terrorismOrganizations', 1, 'address.state', 'NY');
      updateFieldValue('terrorismOrganizations', 1, 'address.zipCode', '67890');
      updateFieldValue('terrorismOrganizations', 1, 'involvementDescription', 'Test involvement description 2');

      // 2. Violence Organizations - Add 2 entries
      console.log('Adding violence organizations entries...');
      updateSubsectionFlag('violenceOrganizations', 'hasAssociation', 'YES');
      addOrganizationEntry('violenceOrganizations');
      addOrganizationEntry('violenceOrganizations');
      
      updateFieldValue('violenceOrganizations', 0, 'organizationName', 'Test Violence Org 1');
      updateFieldValue('violenceOrganizations', 0, 'address.street', '789 Violence Blvd');
      updateFieldValue('violenceOrganizations', 0, 'address.city', 'Violence City');
      updateFieldValue('violenceOrganizations', 0, 'involvementDescription', 'Test violence involvement 1');
      
      updateFieldValue('violenceOrganizations', 1, 'organizationName', 'Test Violence Org 2');
      updateFieldValue('violenceOrganizations', 1, 'address.street', '321 Violence Way');
      updateFieldValue('violenceOrganizations', 1, 'address.city', 'Violence Town');
      updateFieldValue('violenceOrganizations', 1, 'involvementDescription', 'Test violence involvement 2');

      // 3. Overthrow Activities - Add 2 entries
      console.log('Adding overthrow activities entries...');
      updateSubsectionFlag('overthrowActivities', 'hasActivity', 'YES');
      addActivityEntry('overthrowActivities');
      addActivityEntry('overthrowActivities');
      
      updateFieldValue('overthrowActivities', 0, 'activityDescription', 'Test overthrow activity 1');
      updateFieldValue('overthrowActivities', 1, 'activityDescription', 'Test overthrow activity 2');

      // 4. Terrorism Associations - Add 2 entries
      console.log('Adding terrorism associations entries...');
      updateSubsectionFlag('terrorismAssociations', 'hasActivity', 'YES');
      addActivityEntry('terrorismAssociations');
      addActivityEntry('terrorismAssociations');
      
      updateFieldValue('terrorismAssociations', 0, 'explanation', 'Test terrorism association explanation 1');
      updateFieldValue('terrorismAssociations', 1, 'explanation', 'Test terrorism association explanation 2');

      console.log('✅ All test entries added successfully!');
      console.log('Current section data:', section29Data);
      
      // Log field IDs for debugging
      console.log('\n📋 Field IDs in current data:');
      logFieldIds(section29Data);
      
    } catch (error) {
      console.error('❌ Error adding test entries:', error);
    }
  };

  const logFieldIds = (data: any, prefix = '') => {
    if (!data || typeof data !== 'object') return;
    
    Object.entries(data).forEach(([key, value]) => {
      const currentPath = prefix ? `${prefix}.${key}` : key;
      
      if (value && typeof value === 'object') {
        // Check if this is a Field object
        if ('id' in value && 'value' in value) {
          console.log(`  ${currentPath}: ID="${value.id}", Value="${value.value}"`);
        } else {
          logFieldIds(value, currentPath);
        }
      }
    });
  };

  const testPdfGeneration = async () => {
    setIsLoading(true);
    console.log('\n📄 === TESTING PDF GENERATION ===');
    
    try {
      // Create form data structure for PDF service
      const formData = {
        section29: section29Data
      };
      
      console.log('Form data structure for PDF generation:');
      console.log('Keys in formData:', Object.keys(formData));
      console.log('Keys in section29:', Object.keys(formData.section29));
      
      // Log all Field objects in the data
      console.log('\n📋 All Field objects in form data:');
      logFieldIds(formData);
      
      // Test PDF generation
      console.log('\n🔄 Calling PDF service...');
      const result = await clientPdfService2.generateFilledPdf(formData as any);
      
      console.log('\n📊 PDF Generation Results:');
      console.log(`Success: ${result.success}`);
      console.log(`Fields Mapped: ${result.fieldsMapped}`);
      console.log(`Fields Applied: ${result.fieldsApplied}`);
      console.log(`Errors: ${result.errors.length}`);
      console.log(`Warnings: ${result.warnings.length}`);
      
      if (result.errors.length > 0) {
        console.log('❌ Errors:', result.errors);
      }
      
      if (result.warnings.length > 0) {
        console.log('⚠️ Warnings:', result.warnings);
      }
      
      const testResult = {
        timestamp: new Date().toISOString(),
        success: result.success,
        fieldsMapped: result.fieldsMapped,
        fieldsApplied: result.fieldsApplied,
        errors: result.errors,
        warnings: result.warnings,
        totalFieldsInData: countFieldsInData(formData)
      };
      
      setTestResults(prev => [testResult, ...prev]);
      
      if (result.success && result.pdfBytes) {
        console.log('✅ PDF generated successfully! Downloading...');
        clientPdfService2.downloadPdf(result.pdfBytes, 'section29-complete-test.pdf');
      }
      
    } catch (error) {
      console.error('❌ Error during PDF generation:', error);
      setTestResults(prev => [{
        timestamp: new Date().toISOString(),
        success: false,
        error: error.message,
        fieldsMapped: 0,
        fieldsApplied: 0,
        errors: [error.message],
        warnings: []
      }, ...prev]);
    } finally {
      setIsLoading(false);
    }
  };

  const countFieldsInData = (data: any): number => {
    let count = 0;
    
    const traverse = (obj: any) => {
      if (!obj || typeof obj !== 'object') return;
      
      Object.values(obj).forEach(value => {
        if (value && typeof value === 'object') {
          if ('id' in value && 'value' in value && value.value !== '' && value.value !== undefined) {
            count++;
          } else {
            traverse(value);
          }
        }
      });
    };
    
    traverse(data);
    return count;
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'monospace' }}>
      <h1>🧪 Section 29 Complete Test</h1>
      <p>This test adds entries to all Section 29 subsections and tests PDF generation.</p>
      
      <div style={{ marginBottom: '20px' }}>
        <button 
          onClick={addTestEntries}
          style={{ 
            padding: '10px 20px', 
            marginRight: '10px',
            backgroundColor: '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Add Test Entries (2 per subsection)
        </button>
        
        <button 
          onClick={testPdfGeneration}
          disabled={isLoading}
          style={{ 
            padding: '10px 20px',
            backgroundColor: isLoading ? '#6c757d' : '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: isLoading ? 'not-allowed' : 'pointer'
          }}
        >
          {isLoading ? 'Generating PDF...' : 'Test PDF Generation'}
        </button>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h3>📊 Entry Counts</h3>
        <ul>
          <li>Terrorism Organizations: {getEntryCount('terrorismOrganizations')}</li>
          <li>Violence Organizations: {getEntryCount('violenceOrganizations')}</li>
          <li>Overthrow Activities: {getEntryCount('overthrowActivities')}</li>
          <li>Terrorism Associations: {getEntryCount('terrorismAssociations')}</li>
        </ul>
      </div>

      <div>
        <h3>📋 Test Results</h3>
        {testResults.length === 0 ? (
          <p>No test results yet. Add entries and test PDF generation.</p>
        ) : (
          testResults.map((result, index) => (
            <div 
              key={index}
              style={{ 
                marginBottom: '15px',
                padding: '15px',
                border: `2px solid ${result.success ? '#28a745' : '#dc3545'}`,
                borderRadius: '8px',
                backgroundColor: result.success ? '#d4edda' : '#f8d7da'
              }}
            >
              <h4 style={{ margin: '0 0 10px 0' }}>
                {result.success ? '✅' : '❌'} Test at {result.timestamp}
              </h4>
              <p><strong>Fields Mapped:</strong> {result.fieldsMapped}</p>
              <p><strong>Fields Applied:</strong> {result.fieldsApplied}</p>
              <p><strong>Total Fields in Data:</strong> {result.totalFieldsInData}</p>
              
              {result.errors && result.errors.length > 0 && (
                <details>
                  <summary style={{ color: '#721c24', fontWeight: 'bold' }}>
                    Errors ({result.errors.length})
                  </summary>
                  <ul>
                    {result.errors.map((error, i) => (
                      <li key={i} style={{ color: '#721c24' }}>{error}</li>
                    ))}
                  </ul>
                </details>
              )}
              
              {result.warnings && result.warnings.length > 0 && (
                <details>
                  <summary style={{ color: '#856404', fontWeight: 'bold' }}>
                    Warnings ({result.warnings.length})
                  </summary>
                  <ul>
                    {result.warnings.map((warning, i) => (
                      <li key={i} style={{ color: '#856404' }}>{warning}</li>
                    ))}
                  </ul>
                </details>
              )}
            </div>
          ))
        )}
      </div>

      <div style={{ marginTop: '30px' }}>
        <details>
          <summary style={{ fontWeight: 'bold', cursor: 'pointer' }}>
            📄 View Current Section 29 Data
          </summary>
          <pre style={{ 
            background: '#f8f9fa', 
            padding: '15px', 
            borderRadius: '4px',
            overflow: 'auto',
            marginTop: '10px',
            fontSize: '12px'
          }}>
            {JSON.stringify(section29Data, null, 2)}
          </pre>
        </details>
      </div>
    </div>
  );
};

const Section29CompleteTest: React.FC = () => {
  return (
    <CompleteSF86FormProvider>
      <Section29Provider>
        <Section29TestComponent />
      </Section29Provider>
    </CompleteSF86FormProvider>
  );
};

export default Section29CompleteTest;
