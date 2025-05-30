/**
 * Field Mapping Debug Test - Focused on Section 29 PDF Field Mapping Issue
 * 
 * This test specifically debugs why Section 29 fields are not mapping to PDF properly.
 */

import React, { useState, useEffect } from 'react';
import { clientPdfService2 } from '../../api/service/clientPdfService2.0';
import { 
  generateFieldId,
  type SubsectionKey,
  type FieldType 
} from '../state/contexts/sections2.0/section29-field-generator';
import { 
  getPdfFieldByName, 
  getNumericFieldId, 
  isValidFieldName,
  getFieldMappingStats
} from '../state/contexts/sections2.0/section29-field-mapping';

interface TestResult {
  test: string;
  success: boolean;
  details: any;
  error?: string;
}

const FieldMappingDebugTest: React.FC = () => {
  const [results, setResults] = useState<TestResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const runTests = async () => {
    setIsLoading(true);
    const testResults: TestResult[] = [];

    console.log('\n🔍 === FIELD MAPPING DEBUG TEST STARTED ===');

    // Test 1: Check Section 29 field mapping stats
    try {
      const stats = getFieldMappingStats();
      console.log('📊 Field mapping stats:', stats);
      testResults.push({
        test: 'Section 29 Field Mapping Stats',
        success: true,
        details: stats
      });
    } catch (error) {
      testResults.push({
        test: 'Section 29 Field Mapping Stats',
        success: false,
        details: null,
        error: error.message
      });
    }

    // Test 2: Test specific field ID generation and validation
    const testCases: Array<{
      subsection: SubsectionKey;
      entry: number;
      field: FieldType;
      expectedPattern: string;
    }> = [
      {
        subsection: 'terrorismOrganizations',
        entry: 0,
        field: 'hasAssociation',
        expectedPattern: 'form1[0].Section29[0].RadioButtonList[0]'
      },
      {
        subsection: 'terrorismOrganizations',
        entry: 0,
        field: 'organizationName',
        expectedPattern: 'form1[0].Section29[0].TextField11[1]'
      },
      {
        subsection: 'terrorismOrganizations',
        entry: 1,
        field: 'organizationName',
        expectedPattern: 'form1[0].Section29[0].TextField11[8]'
      }
    ];

    for (const testCase of testCases) {
      try {
        console.log(`\n🧪 Testing: ${testCase.subsection}.${testCase.field}[${testCase.entry}]`);
        
        // Generate field ID
        const generatedId = generateFieldId(testCase.subsection, testCase.entry, testCase.field);
        console.log(`Generated ID: ${generatedId}`);
        console.log(`Expected pattern: ${testCase.expectedPattern}`);
        
        // Check if field exists in PDF mapping
        const isValid = isValidFieldName(generatedId);
        const pdfField = getPdfFieldByName(generatedId);
        const numericId = getNumericFieldId(generatedId);
        
        console.log(`Is valid in PDF: ${isValid}`);
        console.log(`PDF field found: ${!!pdfField}`);
        console.log(`Numeric ID: ${numericId}`);
        
        if (pdfField) {
          console.log(`PDF field details:`, {
            id: pdfField.id,
            name: pdfField.name,
            type: pdfField.type,
            label: pdfField.label
          });
        }

        const success = isValid && !!pdfField && !!numericId;
        
        testResults.push({
          test: `Field Generation: ${testCase.subsection}.${testCase.field}[${testCase.entry}]`,
          success,
          details: {
            generatedId,
            expectedPattern: testCase.expectedPattern,
            matches: generatedId === testCase.expectedPattern,
            isValidInPdf: isValid,
            pdfFieldFound: !!pdfField,
            numericId,
            pdfField: pdfField ? {
              id: pdfField.id,
              name: pdfField.name,
              type: pdfField.type
            } : null
          },
          error: !success ? 'Field mapping failed' : undefined
        });

      } catch (error) {
        console.error(`❌ Error testing ${testCase.subsection}.${testCase.field}[${testCase.entry}]:`, error);
        testResults.push({
          test: `Field Generation: ${testCase.subsection}.${testCase.field}[${testCase.entry}]`,
          success: false,
          details: null,
          error: error.message
        });
      }
    }

    // Test 3: Load PDF and check field availability
    try {
      console.log('\n📄 Loading PDF and checking field availability...');
      await clientPdfService2.loadPdf();
      const allPdfFields = clientPdfService2.getAllPdfFields();
      
      console.log(`Total PDF fields loaded: ${allPdfFields.length}`);
      
      // Find Section 29 fields
      const section29Fields = allPdfFields.filter(field => 
        field.name.includes('Section29')
      );
      
      console.log(`Section 29 fields in PDF: ${section29Fields.length}`);
      
      // Check specific fields we're testing
      const specificFields = [
        'form1[0].Section29[0].RadioButtonList[0]',
        'form1[0].Section29[0].TextField11[1]',
        'form1[0].Section29[0].TextField11[8]'
      ];
      
      const fieldAvailability = specificFields.map(fieldName => {
        const found = allPdfFields.find(f => f.name === fieldName);
        return {
          fieldName,
          found: !!found,
          id: found?.id,
          type: found?.type
        };
      });
      
      console.log('Specific field availability:', fieldAvailability);
      
      testResults.push({
        test: 'PDF Field Availability',
        success: true,
        details: {
          totalFields: allPdfFields.length,
          section29Fields: section29Fields.length,
          specificFields: fieldAvailability,
          allSection29Fields: section29Fields.slice(0, 10).map(f => ({
            id: f.id,
            name: f.name,
            type: f.type
          }))
        }
      });

    } catch (error) {
      console.error('❌ Error loading PDF:', error);
      testResults.push({
        test: 'PDF Field Availability',
        success: false,
        details: null,
        error: error.message
      });
    }

    // Test 4: Test the actual PDF service field mapping logic
    try {
      console.log('\n🔄 Testing PDF service field mapping logic...');
      
      // Create test form data that mimics what Section 29 context would send
      const testFormData = {
        section29: {
          terrorismOrganizations: {
            hasAssociation: {
              id: 'form1[0].Section29[0].RadioButtonList[0]',
              value: 'YES',
              type: 'radio',
              label: 'Have you ever been associated with terrorism?',
              rect: { x: 0, y: 0, width: 0, height: 0 }
            },
            entries: [
              {
                organizationName: {
                  id: 'form1[0].Section29[0].TextField11[1]',
                  value: 'Test Organization',
                  type: 'text',
                  label: 'Organization Name',
                  rect: { x: 0, y: 0, width: 0, height: 0 }
                }
              }
            ]
          }
        }
      };
      
      console.log('Test form data:', testFormData);
      
      // Test PDF generation
      const result = await clientPdfService2.generateFilledPdf(testFormData as any);
      
      console.log('PDF generation result:', {
        success: result.success,
        fieldsMapped: result.fieldsMapped,
        fieldsApplied: result.fieldsApplied,
        errors: result.errors,
        warnings: result.warnings
      });
      
      testResults.push({
        test: 'PDF Service Field Mapping',
        success: result.success && result.fieldsMapped > 0,
        details: {
          success: result.success,
          fieldsMapped: result.fieldsMapped,
          fieldsApplied: result.fieldsApplied,
          errors: result.errors,
          warnings: result.warnings
        },
        error: !result.success ? result.errors.join(', ') : undefined
      });

    } catch (error) {
      console.error('❌ Error testing PDF service mapping:', error);
      testResults.push({
        test: 'PDF Service Field Mapping',
        success: false,
        details: null,
        error: error.message
      });
    }

    console.log('🏁 === FIELD MAPPING DEBUG TEST COMPLETED ===\n');
    setResults(testResults);
    setIsLoading(false);
  };

  useEffect(() => {
    runTests();
  }, []);

  return (
    <div style={{ padding: '20px', fontFamily: 'monospace', maxWidth: '1200px' }}>
      <h1>🔍 Field Mapping Debug Test</h1>
      <p>This test debugs the Section 29 field mapping issue step by step.</p>
      
      <button 
        onClick={runTests} 
        disabled={isLoading}
        style={{ 
          padding: '10px 20px', 
          marginBottom: '20px',
          backgroundColor: isLoading ? '#ccc' : '#007bff',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: isLoading ? 'not-allowed' : 'pointer'
        }}
      >
        {isLoading ? 'Running Tests...' : 'Re-run Tests'}
      </button>

      <div>
        {results.map((result, index) => (
          <div 
            key={index} 
            style={{ 
              marginBottom: '20px', 
              padding: '15px', 
              border: `2px solid ${result.success ? '#28a745' : '#dc3545'}`,
              borderRadius: '8px',
              backgroundColor: result.success ? '#d4edda' : '#f8d7da'
            }}
          >
            <h3 style={{ 
              margin: '0 0 10px 0',
              color: result.success ? '#155724' : '#721c24'
            }}>
              {result.success ? '✅' : '❌'} {result.test}
            </h3>
            
            {result.error && (
              <p style={{ color: '#721c24', fontWeight: 'bold' }}>
                Error: {result.error}
              </p>
            )}
            
            {result.details && (
              <details>
                <summary style={{ cursor: 'pointer', fontWeight: 'bold' }}>
                  View Details
                </summary>
                <pre style={{ 
                  background: '#f8f9fa', 
                  padding: '10px', 
                  borderRadius: '4px',
                  overflow: 'auto',
                  marginTop: '10px'
                }}>
                  {JSON.stringify(result.details, null, 2)}
                </pre>
              </details>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default FieldMappingDebugTest;
