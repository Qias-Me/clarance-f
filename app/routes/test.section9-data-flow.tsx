/**
 * Section 9 Data Flow Test Route
 * 
 * Test page for validating Section 9 (Citizenship) data flow
 * from form input to IndexedDB persistence and PDF generation.
 */

import { useState, useEffect } from 'react';
import { runSection9DataFlowTests, testSection9FieldMapping, testSection9PdfGeneration } from '../utils/section9DataFlowTest';

export default function Section9DataFlowTest() {
  const [testResults, setTestResults] = useState<any>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [selectedTest, setSelectedTest] = useState<string>('all');

  const runTests = async () => {
    setIsRunning(true);
    setTestResults(null);

    try {
      let results;
      
      switch (selectedTest) {
        case 'fieldMapping':
          results = { fieldMappingTest: testSection9FieldMapping() };
          break;
        case 'pdfGeneration':
          results = { pdfGenerationTest: await testSection9PdfGeneration() };
          break;
        case 'all':
        default:
          results = await runSection9DataFlowTests();
          break;
      }
      
      setTestResults(results);
    } catch (error) {
      setTestResults({
        error: `Test execution failed: ${error}`
      });
    } finally {
      setIsRunning(false);
    }
  };

  const renderFieldMappingResults = (results: any) => {
    if (!results) return null;

    return (
      <div className="bg-white p-4 rounded-lg shadow mb-4">
        <h3 className="text-lg font-semibold mb-2 text-gray-800">Field Mapping Test Results</h3>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="bg-blue-50 p-3 rounded">
            <div className="text-sm text-gray-600">Total Fields</div>
            <div className="text-2xl font-bold text-blue-600">{results.results.totalFields}</div>
          </div>
          <div className="bg-green-50 p-3 rounded">
            <div className="text-sm text-gray-600">Valid Fields</div>
            <div className="text-2xl font-bold text-green-600">{results.results.validFields}</div>
          </div>
        </div>
        
        {results.results.invalidFields.length > 0 && (
          <div className="bg-red-50 p-3 rounded mb-4">
            <h4 className="font-semibold text-red-800 mb-2">Invalid Fields:</h4>
            <ul className="text-sm text-red-700">
              {results.results.invalidFields.map((field: string, index: number) => (
                <li key={index} className="font-mono">{field}</li>
              ))}
            </ul>
          </div>
        )}
        
        <div className="bg-gray-50 p-3 rounded">
          <h4 className="font-semibold text-gray-800 mb-2">Field Mappings:</h4>
          <div className="max-h-64 overflow-y-auto">
            {results.results.fieldMappings.map((mapping: any, index: number) => (
              <div key={index} className={`text-xs p-2 mb-1 rounded ${mapping.isValid ? 'bg-green-100' : 'bg-red-100'}`}>
                <div className="font-mono">{mapping.fieldPath}</div>
                <div className="text-gray-600">{mapping.fieldId}</div>
                <div className="text-gray-500">Value: {JSON.stringify(mapping.fieldValue)}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderPdfGenerationResults = (results: any) => {
    if (!results) return null;

    return (
      <div className="bg-white p-4 rounded-lg shadow mb-4">
        <h3 className="text-lg font-semibold mb-2 text-gray-800">PDF Generation Test Results</h3>
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className={`p-3 rounded ${results.success ? 'bg-green-50' : 'bg-red-50'}`}>
            <div className="text-sm text-gray-600">PDF Generated</div>
            <div className={`text-2xl font-bold ${results.success ? 'text-green-600' : 'text-red-600'}`}>
              {results.results.pdfGenerated ? 'YES' : 'NO'}
            </div>
          </div>
          <div className="bg-blue-50 p-3 rounded">
            <div className="text-sm text-gray-600">Fields Mapped</div>
            <div className="text-2xl font-bold text-blue-600">{results.results.fieldsMapped}</div>
          </div>
          <div className="bg-purple-50 p-3 rounded">
            <div className="text-sm text-gray-600">Fields Applied</div>
            <div className="text-2xl font-bold text-purple-600">{results.results.fieldsApplied}</div>
          </div>
        </div>
        
        {results.results.errors.length > 0 && (
          <div className="bg-red-50 p-3 rounded mb-4">
            <h4 className="font-semibold text-red-800 mb-2">Errors:</h4>
            <ul className="text-sm text-red-700">
              {results.results.errors.map((error: string, index: number) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </div>
        )}
        
        {results.results.warnings.length > 0 && (
          <div className="bg-yellow-50 p-3 rounded">
            <h4 className="font-semibold text-yellow-800 mb-2">Warnings:</h4>
            <ul className="text-sm text-yellow-700">
              {results.results.warnings.map((warning: string, index: number) => (
                <li key={index}>{warning}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  };

  const renderSummary = (summary: any) => {
    if (!summary) return null;

    return (
      <div className="bg-white p-4 rounded-lg shadow mb-4">
        <h3 className="text-lg font-semibold mb-2 text-gray-800">Test Summary</h3>
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="bg-gray-50 p-3 rounded">
            <div className="text-sm text-gray-600">Total Tests</div>
            <div className="text-2xl font-bold text-gray-600">{summary.totalTests}</div>
          </div>
          <div className="bg-green-50 p-3 rounded">
            <div className="text-sm text-gray-600">Passed</div>
            <div className="text-2xl font-bold text-green-600">{summary.passedTests}</div>
          </div>
          <div className="bg-red-50 p-3 rounded">
            <div className="text-sm text-gray-600">Failed</div>
            <div className="text-2xl font-bold text-red-600">{summary.failedTests}</div>
          </div>
        </div>
        
        {summary.errors.length > 0 && (
          <div className="bg-red-50 p-3 rounded mb-4">
            <h4 className="font-semibold text-red-800 mb-2">Summary Errors:</h4>
            <ul className="text-sm text-red-700">
              {summary.errors.map((error: string, index: number) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">Section 9 Data Flow Test</h1>
          <p className="text-gray-600 mb-6">
            Comprehensive testing suite for Section 9 (Citizenship) data flow validation.
            Tests field mapping, PDF generation, and context integration.
          </p>
          
          <div className="flex items-center gap-4 mb-4">
            <select
              value={selectedTest}
              onChange={(e) => setSelectedTest(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="all">All Tests</option>
              <option value="fieldMapping">Field Mapping Only</option>
              <option value="pdfGeneration">PDF Generation Only</option>
            </select>
            
            <button
              onClick={runTests}
              disabled={isRunning}
              className={`px-6 py-2 rounded-md font-semibold ${
                isRunning
                  ? 'bg-gray-400 text-gray-700 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {isRunning ? 'Running Tests...' : 'Run Tests'}
            </button>
          </div>
        </div>

        {testResults && (
          <div>
            {testResults.error && (
              <div className="bg-red-50 border border-red-200 p-4 rounded-lg mb-4">
                <h3 className="text-lg font-semibold text-red-800 mb-2">Test Error</h3>
                <p className="text-red-700">{testResults.error}</p>
              </div>
            )}
            
            {testResults.summary && renderSummary(testResults.summary)}
            {testResults.fieldMappingTest && renderFieldMappingResults(testResults.fieldMappingTest)}
            {testResults.pdfGenerationTest && renderPdfGenerationResults(testResults.pdfGenerationTest)}
            
            {testResults.contextIntegrationTest && (
              <div className="bg-white p-4 rounded-lg shadow mb-4">
                <h3 className="text-lg font-semibold mb-2 text-gray-800">Context Integration Test Results</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className={`p-3 rounded ${testResults.contextIntegrationTest.success ? 'bg-green-50' : 'bg-red-50'}`}>
                    <div className="text-sm text-gray-600">Context Registered</div>
                    <div className={`text-2xl font-bold ${testResults.contextIntegrationTest.success ? 'text-green-600' : 'text-red-600'}`}>
                      {testResults.contextIntegrationTest.results.contextRegistered ? 'YES' : 'NO'}
                    </div>
                  </div>
                  <div className="bg-blue-50 p-3 rounded">
                    <div className="text-sm text-gray-600">Fields Updated</div>
                    <div className="text-2xl font-bold text-blue-600">{testResults.contextIntegrationTest.results.fieldsUpdated}</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
