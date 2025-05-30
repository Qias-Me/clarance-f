/**
 * Section 29 Field Mapping Debug Test
 *
 * This test component helps debug the Section 29 field mapping issue
 * by creating test data, logging field IDs, and testing PDF generation.
 */

import React, { useState, useEffect } from 'react';
import { Section29Provider, useSection29 } from '../state/contexts/sections2.0/section29';
import { CompleteSF86FormProvider } from '../state/contexts/SF86FormContext';
import { clientPdfService2 } from '../../api/service/clientPdfService2.0';
import { generateFieldId } from '../state/contexts/sections2.0/section29-field-generator';
import {
  getPdfFieldByName,
  getNumericFieldId,
  getFieldMappingStats,
  isValidFieldName,
  getAllSection29FieldNames,
  searchFieldsByPattern
} from '../state/contexts/sections2.0/section29-field-mapping';

const Section29DebugTest: React.FC = () => {
  const {
    section29Data,
    updateSubsectionFlag,
    addOrganizationEntry,
    updateFieldValue,
    getEntryCount
  } = useSection29();

  const [debugInfo, setDebugInfo] = useState<any[]>([]);
  const [pdfStats, setPdfStats] = useState<any>(null);

  // Test field mapping on component mount
  useEffect(() => {
    testFieldMapping();
  }, []);

  const testFieldMapping = async () => {
    console.log('\n=== SECTION 29 FIELD MAPPING DEBUG TEST ===');

    const testResults: any[] = [];

    // Test 1: Check field mapping stats
    const stats = getFieldMappingStats();
    console.log('Field mapping stats:', stats);
    testResults.push({ test: 'Field Mapping Stats', result: stats });

    // Test 1.5: Show actual PDF field names for comparison
    console.log('\n--- Actual PDF Field Names (First 20) ---');
    const allSection29Fields = getAllSection29FieldNames();
    console.log(`Total Section 29 fields in PDF: ${allSection29Fields.length}`);
    allSection29Fields.slice(0, 20).forEach((fieldName, index) => {
      console.log(`  [${index}] ${fieldName}`);
    });

    // Test 2: Test field ID generation for different subsections and field types
    const testCases = [
      { subsection: 'terrorismOrganizations', entry: 0, field: 'hasAssociation' },
      { subsection: 'terrorismOrganizations', entry: 0, field: 'organizationName' },
      { subsection: 'terrorismOrganizations', entry: 1, field: 'organizationName' },
      { subsection: 'violenceOrganizations', entry: 0, field: 'hasAssociation' },
      { subsection: 'violenceOrganizations', entry: 0, field: 'organizationName' },
      { subsection: 'overthrowActivities', entry: 0, field: 'hasActivity' },
      { subsection: 'terrorismAssociations', entry: 0, field: 'explanation' }
    ];

    for (const testCase of testCases) {
      try {
        const fieldId = generateFieldId(
          testCase.subsection as any,
          testCase.entry,
          testCase.field as any
        );

        console.log(`Generated field ID for ${testCase.subsection}.${testCase.field}[${testCase.entry}]: ${fieldId}`);

        // Check if this field name exists in PDF
        const isValid = isValidFieldName(fieldId);
        const pdfField = getPdfFieldByName(fieldId);
        const numericId = getNumericFieldId(fieldId);

        const result = {
          subsection: testCase.subsection,
          field: testCase.field,
          entry: testCase.entry,
          generatedId: fieldId,
          isValidInPdf: isValid,
          pdfField: pdfField ? { id: pdfField.id, name: pdfField.name, type: pdfField.type } : null,
          numericId: numericId
        };

        console.log(`Field validation result:`, result);
        testResults.push({ test: `Field ID Generation - ${testCase.subsection}.${testCase.field}[${testCase.entry}]`, result });

      } catch (error) {
        console.error(`Error testing ${testCase.subsection}.${testCase.field}[${testCase.entry}]:`, error);
        testResults.push({
          test: `Field ID Generation - ${testCase.subsection}.${testCase.field}[${testCase.entry}]`,
          result: { error: error.message }
        });
      }
    }

    // Test 3: Load PDF and check field mapping
    try {
      console.log('\n--- Testing PDF Service Field Mapping ---');
      await clientPdfService2.loadPdf();
      const allPdfFields = clientPdfService2.getAllPdfFields();

      console.log(`Total PDF fields loaded: ${allPdfFields.length}`);

      // Find Section 29 fields in PDF
      const section29PdfFields = allPdfFields.filter(field =>
        field.name.includes('Section29')
      );

      console.log(`Section 29 PDF fields found: ${section29PdfFields.length}`);
      console.log('First 10 Section 29 fields:', section29PdfFields.slice(0, 10).map(f => ({
        id: f.id,
        name: f.name,
        type: f.type
      })));

      setPdfStats({
        totalFields: allPdfFields.length,
        section29Fields: section29PdfFields.length,
        sampleFields: section29PdfFields.slice(0, 10)
      });

      testResults.push({
        test: 'PDF Service Field Loading',
        result: {
          totalFields: allPdfFields.length,
          section29Fields: section29PdfFields.length
        }
      });

    } catch (error) {
      console.error('Error loading PDF:', error);
      testResults.push({ test: 'PDF Service Field Loading', result: { error: error.message } });
    }

    setDebugInfo(testResults);
    console.log('=== END SECTION 29 FIELD MAPPING DEBUG TEST ===\n');
  };

  const addTestData = async () => {
    console.log('\n=== ADDING TEST DATA TO SECTION 29 ===');

    try {
      // Add terrorism organizations entries
      updateSubsectionFlag('terrorismOrganizations', 'YES');
      addOrganizationEntry('terrorismOrganizations');

      // Add some test values
      updateFieldValue('terrorismOrganizations', 0, 'organizationName', 'Test Terrorism Org 1');

      console.log('Test data added successfully');
      console.log('Current section data:', section29Data);

      // Debug: Check what field IDs were actually generated
      console.log('\n--- DEBUGGING GENERATED FIELD IDs ---');
      const terrorismOrg = section29Data.terrorismOrganizations;
      console.log('hasAssociation field ID:', terrorismOrg.hasAssociation.id);
      console.log('hasAssociation field value:', terrorismOrg.hasAssociation.value);

      if (terrorismOrg.entries.length > 0) {
        const entry0 = terrorismOrg.entries[0];
        console.log('Entry 0 organizationName field ID:', entry0.organizationName.id);
        console.log('Entry 0 organizationName field value:', entry0.organizationName.value);
        console.log('Entry 0 address.street field ID:', entry0.address.street.id);
        console.log('Entry 0 dateRange.from field ID:', entry0.dateRange.from.date.id);
      }

    } catch (error) {
      console.error('Error adding test data:', error);
    }
  };

  const testPdfGeneration = async () => {
    console.log('\n=== TESTING PDF GENERATION ===');

    try {
      // Create test form data structure
      const testFormData = {
        section29: section29Data
      };

      console.log('Form data for PDF generation:', testFormData);

      // Debug: Check what field IDs are actually in the form data
      console.log('\n--- DEBUGGING FORM DATA FIELD IDs ---');
      const terrorismOrg = section29Data.terrorismOrganizations;
      console.log('hasAssociation field ID:', terrorismOrg.hasAssociation.id);
      console.log('hasAssociation field value:', terrorismOrg.hasAssociation.value);

      if (terrorismOrg.entries.length > 0) {
        const entry0 = terrorismOrg.entries[0];
        console.log('Entry 0 organizationName field ID:', entry0.organizationName.id);
        console.log('Entry 0 organizationName field value:', entry0.organizationName.value);
      }

      const result = await clientPdfService2.generateFilledPdf(testFormData as any);

      console.log('PDF generation result:', result);

      if (result.success && result.pdfBytes) {
        console.log(`PDF generated successfully! Fields mapped: ${result.fieldsMapped}, Fields applied: ${result.fieldsApplied}`);

        // Download the PDF
        clientPdfService2.downloadPdf(result.pdfBytes, 'section29-test.pdf');
      } else {
        console.error('PDF generation failed:', result.errors);
      }

    } catch (error) {
      console.error('Error during PDF generation:', error);
    }
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'monospace' }}>
      <h1>Section 29 Field Mapping Debug Test</h1>

      <div style={{ marginBottom: '20px' }}>
        <button onClick={testFieldMapping} style={{ marginRight: '10px' }}>
          Re-run Field Mapping Test
        </button>
        <button onClick={addTestData} style={{ marginRight: '10px' }}>
          Add Test Data
        </button>
        <button onClick={testPdfGeneration}>
          Test PDF Generation
        </button>
      </div>

      {pdfStats && (
        <div style={{ marginBottom: '20px', padding: '10px', border: '1px solid #ccc' }}>
          <h3>PDF Stats</h3>
          <p>Total PDF Fields: {pdfStats.totalFields}</p>
          <p>Section 29 Fields: {pdfStats.section29Fields}</p>
          <details>
            <summary>Sample Section 29 Fields</summary>
            <pre>{JSON.stringify(pdfStats.sampleFields, null, 2)}</pre>
          </details>
        </div>
      )}

      <div>
        <h3>Debug Results</h3>
        {debugInfo.map((item, index) => (
          <details key={index} style={{ marginBottom: '10px' }}>
            <summary style={{ fontWeight: 'bold' }}>{item.test}</summary>
            <pre style={{ background: '#f5f5f5', padding: '10px', overflow: 'auto' }}>
              {JSON.stringify(item.result, null, 2)}
            </pre>
          </details>
        ))}
      </div>

      <div style={{ marginTop: '20px' }}>
        <h3>Current Section 29 Data</h3>
        <details>
          <summary>View Section Data</summary>
          <pre style={{ background: '#f5f5f5', padding: '10px', overflow: 'auto' }}>
            {JSON.stringify(section29Data, null, 2)}
          </pre>
        </details>
      </div>
    </div>
  );
};

const Section29DebugPage: React.FC = () => {
  return (
    <CompleteSF86FormProvider>
      <Section29Provider>
        <Section29DebugTest />
      </Section29Provider>
    </CompleteSF86FormProvider>
  );
};

export default Section29DebugPage;
