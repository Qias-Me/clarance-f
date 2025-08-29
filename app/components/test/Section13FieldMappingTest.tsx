/**
 * Section 13 Field Mapping Test Component
 * 
 * Test component for verifying PDF-to-UI field mapping functionality.
 * This component provides a UI for testing field mappings and validating
 * the integration between PDF fields and UI components.
 */

import React, { useState, useEffect } from 'react';
import { useSection13 } from '../../state/contexts/sections2.0/section13';
import { 
  getFieldMappingStatistics,
  generateDynamicFieldMapping,
  mapPdfFieldToUiPath,
  mapUiPathToPdfField
} from '../../state/contexts/sections2.0/section13-field-mapping';

interface TestResult {
  testName: string;
  status: 'pass' | 'fail' | 'pending';
  message?: string;
}

export const Section13FieldMappingTest: React.FC = () => {
  const section13Context = useSection13();
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isTestRunning, setIsTestRunning] = useState(false);
  const [selectedSubsection, setSelectedSubsection] = useState('militaryEmployment');
  const [testPdfField, setTestPdfField] = useState('');
  const [testUiPath, setTestUiPath] = useState('');
  const [mappingResult, setMappingResult] = useState<string | undefined>();

  // Run comprehensive tests
  const runTests = async () => {
    setIsTestRunning(true);
    const results: TestResult[] = [];
    
    // Test 1: Field Mapping Statistics
    try {
      const stats = getFieldMappingStatistics();
      results.push({
        testName: 'Field Mapping Statistics',
        status: stats.totalMappings > 0 ? 'pass' : 'fail',
        message: `Found ${stats.totalMappings} mappings across ${stats.subsections.length} subsections`
      });
    } catch (error) {
      results.push({
        testName: 'Field Mapping Statistics',
        status: 'fail',
        message: String(error)
      });
    }
    
    // Test 2: PDF to UI Mapping
    try {
      const testPdf = 'form1[0].section_13_1-2[0].TextField11[0]';
      const uiPath = mapPdfFieldToUiPath(testPdf);
      results.push({
        testName: 'PDF to UI Mapping',
        status: uiPath ? 'pass' : 'fail',
        message: uiPath ? `Mapped to: ${uiPath}` : 'No mapping found'
      });
    } catch (error) {
      results.push({
        testName: 'PDF to UI Mapping',
        status: 'fail',
        message: String(error)
      });
    }
    
    // Test 3: UI to PDF Mapping
    try {
      const testUi = 'section13.militaryEmployment.entries[0].supervisor.name';
      const pdfField = mapUiPathToPdfField(testUi);
      results.push({
        testName: 'UI to PDF Mapping',
        status: pdfField ? 'pass' : 'fail',
        message: pdfField ? `Mapped to: ${pdfField}` : 'No mapping found'
      });
    } catch (error) {
      results.push({
        testName: 'UI to PDF Mapping',
        status: 'fail',
        message: String(error)
      });
    }
    
    // Test 4: Dynamic Field Generation
    try {
      const dynamicFields = generateDynamicFieldMapping('militaryEmployment', 0);
      results.push({
        testName: 'Dynamic Field Generation',
        status: dynamicFields.length > 0 ? 'pass' : 'fail',
        message: `Generated ${dynamicFields.length} fields for militaryEmployment[0]`
      });
    } catch (error) {
      results.push({
        testName: 'Dynamic Field Generation',
        status: 'fail',
        message: String(error)
      });
    }
    
    // Test 5: Context Integration
    try {
      const fieldMappings = section13Context.getFieldMappings();
      results.push({
        testName: 'Context Integration',
        status: fieldMappings.length > 0 ? 'pass' : 'fail',
        message: `Context has ${fieldMappings.length} field mappings`
      });
    } catch (error) {
      results.push({
        testName: 'Context Integration',
        status: 'fail',
        message: String(error)
      });
    }
    
    // Test 6: Field Validation
    try {
      const testPath = 'section13.militaryEmployment.entries[0].supervisor.name';
      const isValid = section13Context.validateFieldMapping(testPath);
      results.push({
        testName: 'Field Validation',
        status: isValid ? 'pass' : 'fail',
        message: isValid ? 'Field mapping is valid' : 'Field mapping is invalid'
      });
    } catch (error) {
      results.push({
        testName: 'Field Validation',
        status: 'fail',
        message: String(error)
      });
    }
    
    // Test 7: PDF Field Update
    try {
      const testPdfField = 'form1[0].section_13_1-2[0].TextField11[0]';
      section13Context.updateFieldByPdfId(testPdfField, 'Test Value');
      results.push({
        testName: 'PDF Field Update',
        status: 'pass',
        message: 'Successfully updated field via PDF ID'
      });
    } catch (error) {
      results.push({
        testName: 'PDF Field Update',
        status: 'fail',
        message: String(error)
      });
    }
    
    // Test 8: Field Metadata
    try {
      const metadata = section13Context.getFieldMetadata('section13.militaryEmployment.entries[0].supervisor.name');
      results.push({
        testName: 'Field Metadata',
        status: metadata ? 'pass' : 'fail',
        message: metadata ? `Metadata found for ${metadata.section}.${metadata.subsection}` : 'No metadata found'
      });
    } catch (error) {
      results.push({
        testName: 'Field Metadata',
        status: 'fail',
        message: String(error)
      });
    }
    
    setTestResults(results);
    setIsTestRunning(false);
  };
  
  // Test individual field mapping
  const testFieldMapping = () => {
    if (testPdfField) {
      const result = mapPdfFieldToUiPath(testPdfField);
      setMappingResult(result);
    } else if (testUiPath) {
      const result = mapUiPathToPdfField(testUiPath);
      setMappingResult(result);
    }
  };
  
  // Generate fields for selected subsection
  const generateFieldsForSubsection = () => {
    const fields = generateDynamicFieldMapping(selectedSubsection, 0);
    console.log(`Generated ${fields.length} fields for ${selectedSubsection}:`, fields);
    return fields;
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'monospace' }}>
      <h2>Section 13 Field Mapping Test Suite</h2>
      
      {/* Test Controls */}
      <div style={{ marginBottom: '20px' }}>
        <button 
          onClick={runTests} 
          disabled={isTestRunning}
          style={{
            padding: '10px 20px',
            fontSize: '16px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: isTestRunning ? 'not-allowed' : 'pointer',
            opacity: isTestRunning ? 0.6 : 1
          }}
        >
          {isTestRunning ? 'Running Tests...' : 'Run All Tests'}
        </button>
      </div>
      
      {/* Test Results */}
      {testResults.length > 0 && (
        <div style={{ marginBottom: '30px' }}>
          <h3>Test Results</h3>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #ccc' }}>
                <th style={{ textAlign: 'left', padding: '8px' }}>Test Name</th>
                <th style={{ textAlign: 'left', padding: '8px' }}>Status</th>
                <th style={{ textAlign: 'left', padding: '8px' }}>Message</th>
              </tr>
            </thead>
            <tbody>
              {testResults.map((result, index) => (
                <tr key={index} style={{ borderBottom: '1px solid #eee' }}>
                  <td style={{ padding: '8px' }}>{result.testName}</td>
                  <td style={{ 
                    padding: '8px',
                    color: result.status === 'pass' ? 'green' : result.status === 'fail' ? 'red' : 'orange'
                  }}>
                    {result.status.toUpperCase()}
                  </td>
                  <td style={{ padding: '8px' }}>{result.message}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      
      {/* Field Mapping Tester */}
      <div style={{ marginBottom: '30px' }}>
        <h3>Field Mapping Tester</h3>
        <div style={{ marginBottom: '10px' }}>
          <input
            type="text"
            placeholder="Enter PDF Field ID (e.g., form1[0].section_13_1-2[0].TextField11[0])"
            value={testPdfField}
            onChange={(e) => {
              setTestPdfField(e.target.value);
              setTestUiPath('');
            }}
            style={{ width: '500px', padding: '5px', marginRight: '10px' }}
          />
        </div>
        <div style={{ marginBottom: '10px' }}>
          <input
            type="text"
            placeholder="Enter UI Path (e.g., section13.militaryEmployment.entries[0].supervisor.name)"
            value={testUiPath}
            onChange={(e) => {
              setTestUiPath(e.target.value);
              setTestPdfField('');
            }}
            style={{ width: '500px', padding: '5px', marginRight: '10px' }}
          />
        </div>
        <button 
          onClick={testFieldMapping}
          style={{
            padding: '5px 15px',
            backgroundColor: '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Test Mapping
        </button>
        {mappingResult !== undefined && (
          <div style={{ marginTop: '10px', padding: '10px', backgroundColor: '#f0f0f0', borderRadius: '4px' }}>
            <strong>Result:</strong> {mappingResult || 'No mapping found'}
          </div>
        )}
      </div>
      
      {/* Dynamic Field Generator */}
      <div style={{ marginBottom: '30px' }}>
        <h3>Dynamic Field Generator</h3>
        <select
          value={selectedSubsection}
          onChange={(e) => setSelectedSubsection(e.target.value)}
          style={{ padding: '5px', marginRight: '10px' }}
        >
          <option value="militaryEmployment">Military Employment</option>
          <option value="federalEmployment">Federal Employment</option>
          <option value="nonFederalEmployment">Non-Federal Employment</option>
          <option value="selfEmployment">Self Employment</option>
          <option value="unemployment">Unemployment</option>
        </select>
        <button 
          onClick={() => {
            const fields = generateFieldsForSubsection();
            alert(`Generated ${fields.length} fields. Check console for details.`);
          }}
          style={{
            padding: '5px 15px',
            backgroundColor: '#17a2b8',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Generate Fields
        </button>
      </div>
      
      {/* Statistics */}
      <div>
        <h3>Field Mapping Statistics</h3>
        <pre style={{ backgroundColor: '#f0f0f0', padding: '10px', borderRadius: '4px' }}>
          {JSON.stringify(getFieldMappingStatistics(), null, 2)}
        </pre>
      </div>
    </div>
  );
};

export default Section13FieldMappingTest;