/**
 * Test script to demonstrate enhanced error reporting in PDF generation
 * This script creates test data with known problematic fields to trigger errors
 */

import { ServerPdfService2 } from './api/service/serverPdfService2.0';
import type { ApplicantFormValues } from './api/interfaces/formDefinition2.0';

async function testErrorReporting() {
  console.log('🧪 Testing enhanced error reporting for PDF generation...');
  
  // Create test data with problematic fields that should trigger errors
  const testFormData: ApplicantFormValues = {
    // Valid Section 29 data (should work)
    section29: {
      _id: 29,
      terrorismOrganizations: {
        hasAssociation: {
          id: "16435 0 R",
          name: "form1[0].Section29[0].RadioButtonList[0]",
          type: "radio",
          label: "Have you EVER been a member of an organization dedicated to terrorism?",
          value: "NO (If NO, proceed to Section 29.2)",
          rect: { x: 0, y: 0, width: 0, height: 0 }
        }
      }
    },
    
    // Invalid Section 8 data (should cause errors)
    section8: {
      _id: 8,
      hasPassport: {
        id: "INVALID_FIELD_ID", // This should cause a lookup error
        name: "invalid.field.name",
        type: "radio",
        label: "Do you have a passport?",
        value: "INVALID_VALUE", // This should cause a value application error
        rect: { x: 0, y: 0, width: 0, height: 0 }
      },
      passportNumber: {
        id: "9999999", // Non-existent field ID
        name: "nonexistent.field",
        type: "text",
        label: "Passport Number",
        value: "Test123",
        rect: { x: 0, y: 0, width: 0, height: 0 }
      }
    }
  };

  try {
    // Initialize the PDF service
    const pdfService = new ServerPdfService2();
    
    console.log('📄 Loading PDF template...');
    await pdfService.loadPdf();
    
    console.log('🔧 Generating PDF with test data...');
    const result = await pdfService.generateFilledPdf(testFormData);
    
    console.log('\n📊 ===== TEST RESULTS =====');
    console.log(`✅ Success: ${result.success}`);
    console.log(`📊 Fields Mapped: ${result.fieldsMapped}`);
    console.log(`📊 Fields Applied: ${result.fieldsApplied}`);
    console.log(`🚨 Errors: ${result.errors.length}`);
    console.log(`⚠️ Warnings: ${result.warnings.length}`);
    
    if (result.errors.length > 0) {
      console.log('\n💥 ERRORS:');
      result.errors.forEach((error, index) => {
        console.log(`   [${index + 1}] ${error}`);
      });
    }
    
    if (result.warnings.length > 0) {
      console.log('\n⚠️ WARNINGS:');
      result.warnings.forEach((warning, index) => {
        console.log(`   [${index + 1}] ${warning}`);
      });
    }
    
    console.log('\n🎉 Test completed! Check the detailed logs above for field-specific error information.');
    
  } catch (error) {
    console.error('💥 Test failed:', error);
  }
}

// Run the test if this file is executed directly
if (require.main === module) {
  testErrorReporting();
}

export { testErrorReporting };
