/**
 * Section 9 Data Flow Test Utility
 * 
 * Comprehensive test suite for validating Section 9 (Citizenship) data flow
 * from form input to IndexedDB persistence and PDF generation.
 * 
 * Based on the established patterns from pdfIntegrationTest.ts and testDataPopulator.ts
 */

import type { Section9 } from '../../api/interfaces/sections2.0/section9';
import { createDefaultSection9 } from '../../api/interfaces/sections2.0/section9';
import { clientPdfService2 } from '../../api/service/clientPdfService';

// Test data for Section 9
export const createTestSection9Data = (): Section9 => {
  const defaultSection9 = createDefaultSection9();
  
  // Update with test values
  defaultSection9.section9.status.value = "I am a U.S. citizen or national by birth, born to U.S. parent(s), in a foreign country. (Complete 9.1) ";
  
  // Born to US Parents test data
  if (defaultSection9.section9.bornToUSParents) {
    defaultSection9.section9.bornToUSParents.documentType.value = "FS 240 ";
    defaultSection9.section9.bornToUSParents.documentNumber.value = "TEST123456789";
    defaultSection9.section9.bornToUSParents.documentIssueDate.value = "01/15/2020";
    defaultSection9.section9.bornToUSParents.issueCity.value = "London";
    defaultSection9.section9.bornToUSParents.otherExplanation.value = "Test explanation for other document type";
    
    // Certificate information
    defaultSection9.section9.bornToUSParents.certificateNumber.value = "CERT987654321";
    defaultSection9.section9.bornToUSParents.certificateIssueDate.value = "02/20/2020";
    
    // Name on certificate
    if (defaultSection9.section9.bornToUSParents.nameOnCertificate) {
      defaultSection9.section9.bornToUSParents.nameOnCertificate.firstName.value = "John";
      defaultSection9.section9.bornToUSParents.nameOnCertificate.lastName.value = "Doe";
      defaultSection9.section9.bornToUSParents.nameOnCertificate.middleName.value = "Michael";
      defaultSection9.section9.bornToUSParents.nameOnCertificate.suffix.value = "Jr.";
    }
    
    // Military installation info
    defaultSection9.section9.bornToUSParents.wasBornOnMilitaryInstallation.value = "YES";
    defaultSection9.section9.bornToUSParents.militaryBaseName.value = "RAF Lakenheath";
  }
  
  return defaultSection9;
};

/**
 * Test Section 9 field mapping accuracy
 */
export const testSection9FieldMapping = (): {
  success: boolean;
  results: {
    totalFields: number;
    validFields: number;
    invalidFields: string[];
    fieldMappings: Array<{
      fieldPath: string;
      fieldId: string;
      fieldValue: any;
      isValid: boolean;
    }>;
  };
} => {
  console.log('🧪 Testing Section 9 field mapping...');
  
  const testData = createTestSection9Data();
  const invalidFields: string[] = [];
  const fieldMappings: Array<{
    fieldPath: string;
    fieldId: string;
    fieldValue: any;
    isValid: boolean;
  }> = [];
  
  let totalFields = 0;
  let validFields = 0;
  
  const validateFieldId = (fieldId: string, fieldPath: string, fieldValue: any): boolean => {
    totalFields++;
    
    // Section 9 specific validation patterns
    const section9Patterns = [
      /^form1\[0\]\.Sections7-9\[0\]\./, // Main Section 9 fields
      /^form1\[0\]\.Section9\\\.1-9\\\.4\[0\]\./, // Section 9.1-9.4 fields
    ];
    
    const isValid = section9Patterns.some(pattern => pattern.test(fieldId));
    
    fieldMappings.push({
      fieldPath,
      fieldId,
      fieldValue,
      isValid
    });
    
    if (isValid) {
      validFields++;
    } else {
      invalidFields.push(`${fieldPath}: ${fieldId}`);
    }
    
    return isValid;
  };
  
  const validateFieldsRecursively = (obj: any, path = '') => {
    if (!obj || typeof obj !== 'object') return;
    
    Object.entries(obj).forEach(([key, value]) => {
      const currentPath = path ? `${path}.${key}` : key;
      
      if (value && typeof value === 'object' && 'id' in value && 'value' in value) {
        validateFieldId(value.id as string, currentPath, value.value);
      } else if (value && typeof value === 'object') {
        validateFieldsRecursively(value, currentPath);
      }
    });
  };
  
  validateFieldsRecursively(testData);
  
  console.log(`✅ Section 9 field mapping test completed. Valid: ${validFields}/${totalFields}`);
  
  return {
    success: invalidFields.length === 0,
    results: {
      totalFields,
      validFields,
      invalidFields,
      fieldMappings
    }
  };
};

/**
 * Test Section 9 PDF generation
 */
export const testSection9PdfGeneration = async (): Promise<{
  success: boolean;
  results: {
    pdfGenerated: boolean;
    fieldsMapped: number;
    fieldsApplied: number;
    errors: string[];
    warnings: string[];
  };
}> => {
  console.log('🧪 Testing Section 9 PDF generation...');
  
  try {
    const testData = createTestSection9Data();
    
    // Create minimal form data with Section 9
    const formData = {
      section9: testData,
      // Add minimal data for other required sections
      section1: undefined,
      section2: undefined,
      section3: undefined,
      // ... other sections
    };
    
    const pdfResult = await clientPdfService2.generateFilledPdf(formData as any);
    
    console.log(`✅ Section 9 PDF generation test completed. Success: ${pdfResult.success}`);
    
    return {
      success: pdfResult.success,
      results: {
        pdfGenerated: pdfResult.success,
        fieldsMapped: pdfResult.fieldsMapped || 0,
        fieldsApplied: pdfResult.fieldsApplied || 0,
        errors: pdfResult.errors || [],
        warnings: pdfResult.warnings || []
      }
    };
  } catch (error) {
    console.error('❌ Section 9 PDF generation test failed:', error);
    return {
      success: false,
      results: {
        pdfGenerated: false,
        fieldsMapped: 0,
        fieldsApplied: 0,
        errors: [`PDF generation failed: ${error}`],
        warnings: []
      }
    };
  }
};

/**
 * Test Section 9 context integration
 */
export const testSection9ContextIntegration = (sf86Context: any): {
  success: boolean;
  results: {
    contextRegistered: boolean;
    fieldsUpdated: number;
    updateErrors: string[];
  };
} => {
  console.log('🧪 Testing Section 9 context integration...');
  
  const updateErrors: string[] = [];
  let fieldsUpdated = 0;
  
  try {
    // Find Section 9 registration
    const section9Registration = sf86Context?.registeredSections?.find((s: any) => s.sectionId === 'section9');
    
    if (!section9Registration?.context) {
      return {
        success: false,
        results: {
          contextRegistered: false,
          fieldsUpdated: 0,
          updateErrors: ['Section 9 context not registered in SF86FormContext']
        }
      };
    }
    
    const section9Context = section9Registration.context;
    
    // Test citizenship status update
    try {
      section9Context.updateCitizenshipStatus('I am a U.S. citizen or national by birth, born to U.S. parent(s), in a foreign country. (Complete 9.1) ');
      fieldsUpdated++;
    } catch (error) {
      updateErrors.push(`Failed to update citizenship status: ${error}`);
    }
    
    // Test born to US parents info updates
    try {
      section9Context.updateBornToUSParentsInfo('documentType', 'FS-240');
      section9Context.updateBornToUSParentsInfo('documentNumber', 'TEST123456');
      section9Context.updateBornToUSParentsInfo('documentIssueDate', '01/15/2020');
      fieldsUpdated += 3;
    } catch (error) {
      updateErrors.push(`Failed to update born to US parents info: ${error}`);
    }
    
    console.log(`✅ Section 9 context integration test completed. Fields updated: ${fieldsUpdated}`);
    
    return {
      success: updateErrors.length === 0,
      results: {
        contextRegistered: true,
        fieldsUpdated,
        updateErrors
      }
    };
  } catch (error) {
    console.error('❌ Section 9 context integration test failed:', error);
    return {
      success: false,
      results: {
        contextRegistered: false,
        fieldsUpdated,
        updateErrors: [`Context integration test failed: ${error}`]
      }
    };
  }
};

/**
 * Run comprehensive Section 9 data flow tests
 */
export const runSection9DataFlowTests = async (sf86Context?: any): Promise<{
  success: boolean;
  fieldMappingTest: ReturnType<typeof testSection9FieldMapping>;
  pdfGenerationTest: Awaited<ReturnType<typeof testSection9PdfGeneration>>;
  contextIntegrationTest: ReturnType<typeof testSection9ContextIntegration>;
  summary: {
    totalTests: number;
    passedTests: number;
    failedTests: number;
    errors: string[];
    warnings: string[];
  };
}> => {
  console.log('🚀 Running comprehensive Section 9 data flow tests...');
  console.log('================================================');
  
  const fieldMappingTest = testSection9FieldMapping();
  const pdfGenerationTest = await testSection9PdfGeneration();
  const contextIntegrationTest = sf86Context ? testSection9ContextIntegration(sf86Context) : {
    success: false,
    results: {
      contextRegistered: false,
      fieldsUpdated: 0,
      updateErrors: ['SF86FormContext not provided']
    }
  };
  
  const totalTests = 3;
  const passedTests = [fieldMappingTest.success, pdfGenerationTest.success, contextIntegrationTest.success].filter(Boolean).length;
  const failedTests = totalTests - passedTests;
  
  const allErrors = [
    ...fieldMappingTest.results.invalidFields.map(f => `Field mapping error: ${f}`),
    ...pdfGenerationTest.results.errors,
    ...contextIntegrationTest.results.updateErrors
  ];
  
  const allWarnings = [
    ...pdfGenerationTest.results.warnings
  ];
  
  const overallSuccess = passedTests === totalTests;
  
  console.log(`📊 Section 9 data flow tests completed. Passed: ${passedTests}/${totalTests}`);
  
  return {
    success: overallSuccess,
    fieldMappingTest,
    pdfGenerationTest,
    contextIntegrationTest,
    summary: {
      totalTests,
      passedTests,
      failedTests,
      errors: allErrors,
      warnings: allWarnings
    }
  };
};

// Export for browser console testing
if (typeof window !== 'undefined') {
  (window as any).runSection9DataFlowTests = runSection9DataFlowTests;
  (window as any).testSection9FieldMapping = testSection9FieldMapping;
  (window as any).testSection9PdfGeneration = testSection9PdfGeneration;
  console.log('📝 Section 9 data flow test suite loaded. Use window.runSection9DataFlowTests() to start testing.');
}
