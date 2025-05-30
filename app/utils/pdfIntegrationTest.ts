/**
 * PDF Integration Test Utility
 * 
 * This utility provides functions to test the integration between our new SF-86 form
 * architecture and the PDF service. It validates that field IDs, values, and mappings
 * work correctly across all sections.
 */

import type { ApplicantFormValues, Field } from '../../api/interfaces/formDefinition2.0';
import type { Section1 } from '../../api/interfaces/sections2.0/section1';
import type { Section2 } from '../../api/interfaces/sections2.0/section2';
import type { Section3 } from '../../api/interfaces/sections2.0/section3';
import type { Section7 } from '../../api/interfaces/sections2.0/section7';
import type { Section8 } from '../../api/interfaces/sections2.0/section8';
import type { Section29 } from '../../api/interfaces/sections2.0/section29';
import { clientPdfService2 } from '../../api/service/clientPdfService';

// Test data creation helpers
const createTestField = <T>(id: string, value: T, type: string, label: string): Field<T> => ({
  id,
  value,
  type,
  label,
  rect: { x: 0, y: 0, width: 100, height: 20 }
});

/**
 * Create test data for Section 1 (Information About You)
 */
export const createTestSection1 = (): Section1 => ({
  _id: 1,
  personalInfo: {
    lastName: createTestField('form1[0].Sections1-6[0].TextField11[0]', 'Smith', 'text', 'Last Name'),
    firstName: createTestField('form1[0].Sections1-6[0].TextField11[1]', 'John', 'text', 'First Name'),
    middleName: createTestField('form1[0].Sections1-6[0].TextField11[2]', 'Michael', 'text', 'Middle Name'),
    suffix: createTestField('form1[0].Sections1-6[0].TextField11[3]', 'Jr.', 'text', 'Suffix')
  }
});

/**
 * Create test data for Section 2 (Date of Birth)
 */
export const createTestSection2 = (): Section2 => ({
  _id: 2,
  dateOfBirth: {
    date: createTestField('form1[0].Sections1-6[0].DateField[0]', '1990-01-15', 'date', 'Date of Birth'),
    estimated: createTestField('form1[0].Sections1-6[0].CheckBox[0]', false, 'checkbox', 'Estimated'),
    age: createTestField('form1[0].Sections1-6[0].TextField11[4]', '34', 'text', 'Age')
  }
});

/**
 * Create test data for Section 3 (Place of Birth)
 */
export const createTestSection3 = (): Section3 => ({
  _id: 3,
  placeOfBirth: {
    city: createTestField('form1[0].Sections1-6[0].TextField11[5]', 'New York', 'text', 'City of Birth'),
    state: createTestField('form1[0].Sections1-6[0].DropDownList[0]', 'NY', 'select', 'State of Birth'),
    country: createTestField('form1[0].Sections1-6[0].DropDownList[1]', 'United States', 'select', 'Country of Birth'),
    isUSCitizen: createTestField('form1[0].Sections1-6[0].RadioButtonList[0]', 'YES', 'radio', 'U.S. Citizen')
  }
});

/**
 * Create comprehensive test form data
 */
export const createTestFormData = (): ApplicantFormValues => ({
  section1: createTestSection1(),
  section2: createTestSection2(),
  section3: createTestSection3(),
  section4: undefined,
  section5: undefined,
  section6: undefined,
  section7: undefined,
  section8: undefined,
  section9: undefined,
  section10: undefined,
  section11: undefined,
  section12: undefined,
  section13: undefined,
  section14: undefined,
  section15: undefined,
  section16: undefined,
  section17: undefined,
  section18: undefined,
  section19: undefined,
  section20: undefined,
  section21: undefined,
  section22: undefined,
  section23: undefined,
  section24: undefined,
  section25: undefined,
  section26: undefined,
  section27: undefined,
  section28: undefined,
  section29: undefined,
  section30: undefined,
  print: undefined
});

/**
 * Test PDF field mapping accuracy
 */
export const testPdfFieldMapping = async (): Promise<{
  success: boolean;
  results: {
    totalFields: number;
    mappedFields: number;
    unmappedFields: number;
    errors: string[];
    warnings: string[];
  };
}> => {
  try {
    console.log('Starting PDF field mapping test...');
    
    const testData = createTestFormData();
    
    // Test PDF generation
    const pdfResult = await clientPdfService2.generateFilledPdf(testData);
    
    if (!pdfResult.success) {
      return {
        success: false,
        results: {
          totalFields: 0,
          mappedFields: 0,
          unmappedFields: 0,
          errors: pdfResult.errors,
          warnings: pdfResult.warnings
        }
      };
    }
    
    // Test field validation
    const validationResults = await clientPdfService2.validateFieldMapping(testData);
    const stats = clientPdfService2.getFieldMappingStats();
    
    const errors: string[] = [];
    const warnings: string[] = [];
    
    // Check for validation issues
    const invalidFields = validationResults.filter(r => !r.isValid);
    if (invalidFields.length > 0) {
      errors.push(`${invalidFields.length} fields failed validation`);
    }
    
    // Check mapping coverage
    if (stats.unmappedFields > 0) {
      warnings.push(`${stats.unmappedFields} PDF fields are not mapped to form data`);
    }
    
    console.log(`PDF mapping test completed. Fields mapped: ${pdfResult.fieldsMapped}, Fields applied: ${pdfResult.fieldsApplied}`);
    
    return {
      success: true,
      results: {
        totalFields: stats.totalFields,
        mappedFields: stats.mappedFields,
        unmappedFields: stats.unmappedFields,
        errors: [...pdfResult.errors, ...errors],
        warnings: [...pdfResult.warnings, ...warnings]
      }
    };
  } catch (error) {
    console.error('PDF mapping test failed:', error);
    return {
      success: false,
      results: {
        totalFields: 0,
        mappedFields: 0,
        unmappedFields: 0,
        errors: [`Test failed: ${error}`],
        warnings: []
      }
    };
  }
};

/**
 * Test field ID generation accuracy
 */
export const testFieldIdGeneration = (): {
  success: boolean;
  results: {
    testedFields: number;
    validFields: number;
    invalidFields: string[];
  };
} => {
  const testData = createTestFormData();
  const invalidFields: string[] = [];
  let testedFields = 0;
  let validFields = 0;
  
  const validateFieldId = (fieldId: string, fieldName: string): boolean => {
    testedFields++;
    
    // Basic validation: must start with form1[0] and contain section prefix
    const basicPattern = /^form1\[0\]\.Sections?\d+(-\d+)?\[0\]\./;
    const isValid = basicPattern.test(fieldId);
    
    if (isValid) {
      validFields++;
    } else {
      invalidFields.push(`${fieldName}: ${fieldId}`);
    }
    
    return isValid;
  };
  
  const validateFieldsRecursively = (obj: any, path = '') => {
    if (!obj || typeof obj !== 'object') return;
    
    Object.entries(obj).forEach(([key, value]) => {
      const currentPath = path ? `${path}.${key}` : key;
      
      if (value && typeof value === 'object' && 'id' in value && 'value' in value) {
        validateFieldId(value.id as string, currentPath);
      } else if (value && typeof value === 'object') {
        validateFieldsRecursively(value, currentPath);
      }
    });
  };
  
  validateFieldsRecursively(testData);
  
  return {
    success: invalidFields.length === 0,
    results: {
      testedFields,
      validFields,
      invalidFields
    }
  };
};

/**
 * Run comprehensive PDF integration tests
 */
export const runPdfIntegrationTests = async (): Promise<{
  success: boolean;
  fieldIdTest: ReturnType<typeof testFieldIdGeneration>;
  pdfMappingTest: Awaited<ReturnType<typeof testPdfFieldMapping>>;
  summary: {
    totalTests: number;
    passedTests: number;
    failedTests: number;
    errors: string[];
    warnings: string[];
  };
}> => {
  console.log('Running comprehensive PDF integration tests...');
  
  const fieldIdTest = testFieldIdGeneration();
  const pdfMappingTest = await testPdfFieldMapping();
  
  const totalTests = 2;
  const passedTests = (fieldIdTest.success ? 1 : 0) + (pdfMappingTest.success ? 1 : 0);
  const failedTests = totalTests - passedTests;
  
  const allErrors = [
    ...pdfMappingTest.results.errors,
    ...(fieldIdTest.success ? [] : [`Field ID validation failed: ${fieldIdTest.results.invalidFields.length} invalid fields`])
  ];
  
  const allWarnings = [
    ...pdfMappingTest.results.warnings
  ];
  
  const overallSuccess = passedTests === totalTests;
  
  console.log(`PDF integration tests completed. Passed: ${passedTests}/${totalTests}`);
  
  return {
    success: overallSuccess,
    fieldIdTest,
    pdfMappingTest,
    summary: {
      totalTests,
      passedTests,
      failedTests,
      errors: allErrors,
      warnings: allWarnings
    }
  };
};
