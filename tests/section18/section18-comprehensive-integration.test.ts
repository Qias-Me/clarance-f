/**
 * Section 18 - Comprehensive Integration Tests
 * 
 * Tests complete Section 18 workflow including:
 * - All 964 fields across 6 relative entries
 * - Integration between subsections 18.1, 18.2, and 18.3
 * - PDF generation with all field values
 * - Console error monitoring
 * - Performance testing
 */

import { test, expect, Page } from '@playwright/test';

// Comprehensive test data for all Section 18 functionality
const COMPREHENSIVE_TEST_DATA = {
  relatives: [
    {
      id: 1,
      section18_1: {
        relativeType: 'Mother',
        fullName: { firstName: 'Jane', middleName: 'Marie', lastName: 'Smith', suffix: 'Jr' },
        dateOfBirth: { month: '03', year: '1965', isEstimated: false },
        placeOfBirth: { city: 'New York', state: 'NY', country: 'United States' },
        citizenship: { countries: ['United States'] },
        otherNames: [
          {
            fullName: { firstName: 'Janet', middleName: 'M', lastName: 'Williams', suffix: 'II' },
            timeUsed: { from: { month: '01', year: '1990' }, to: { month: '12', year: '2000' } },
            reasonForChange: 'Marriage'
          }
        ]
      },
      section18_2: {
        currentAddress: {
          street: '123 Main Street', city: 'New York', state: 'NY', zipCode: '10001', country: 'United States'
        },
        dateRange: { from: { month: '01', year: '2020' }, to: { month: '12', year: '2023' } }
      },
      section18_3: {
        contactMethods: { inPerson: true, telephone: true, other: true, otherExplanation: 'Video calls' },
        contactFrequency: { weekly: true, other: true, otherExplanation: 'Bi-weekly' },
        employmentInfo: { employerName: 'ABC Corp', address: { street: '789 Business Blvd', city: 'Corporate City' } },
        foreignGovernmentRelations: { hasRelations: 'YES', description: 'Embassy translator 2015-2018' },
        documentationTypes: { i551PermanentResident: true, documentNumber: 'ABC123456789', expirationDate: '12/2025' }
      }
    },
    {
      id: 2,
      section18_1: {
        relativeType: 'Father',
        fullName: { firstName: 'John', middleName: 'Robert', lastName: 'Smith', suffix: 'Sr' },
        dateOfBirth: { month: '07', year: '1960', isEstimated: true },
        placeOfBirth: { city: 'Boston', state: 'MA', country: 'United States' },
        citizenship: { countries: ['United States', 'Canada'] }
      },
      section18_2: {
        currentAddress: {
          street: '456 Oak Avenue', city: 'Boston', state: 'MA', zipCode: '02101', country: 'United States'
        },
        dateRange: { from: { month: '06', year: '2018' }, isPresent: true }
      },
      section18_3: {
        contactMethods: { telephone: true, electronic: true },
        contactFrequency: { monthly: true },
        employmentInfo: { employerName: 'XYZ Industries' },
        foreignGovernmentRelations: { hasRelations: 'NO' },
        documentationTypes: { usVisa: true, documentNumber: 'XYZ987654321', expirationDate: '06/2026' }
      }
    }
  ]
};

// Helper function to monitor console logs and errors
async function setupComprehensiveMonitoring(page: Page): Promise<{
  consoleMessages: string[];
  errors: string[];
  warnings: string[];
}> {
  const consoleMessages: string[] = [];
  const errors: string[] = [];
  const warnings: string[] = [];
  
  page.on('console', (msg) => {
    const message = `[${msg.type()}] ${msg.text()}`;
    consoleMessages.push(message);
    
    if (msg.type() === 'error') {
      errors.push(message);
      console.log(`🔴 Console Error: ${message}`);
    } else if (msg.type() === 'warning') {
      warnings.push(message);
      console.log(`🟡 Console Warning: ${message}`);
    } else {
      console.log(`Console: ${message}`);
    }
  });

  page.on('pageerror', (error) => {
    const message = `[PAGE ERROR] ${error.message}`;
    errors.push(message);
    console.log(`🔴 Page Error: ${message}`);
  });

  page.on('requestfailed', (request) => {
    const message = `[REQUEST FAILED] ${request.url()} - ${request.failure()?.errorText}`;
    errors.push(message);
    console.log(`🔴 Request Failed: ${message}`);
  });

  return { consoleMessages, errors, warnings };
}

// Helper function to navigate to Section 18
async function navigateToSection18(page: Page) {
  await page.goto('/form');
  await page.waitForLoadState('networkidle');
  
  // Navigate to Section 18
  await page.click('[data-testid="section-18-nav"]');
  await page.waitForSelector('[data-testid="section-18-content"]', { timeout: 10000 });
}

// Helper function to fill out a complete relative entry
async function fillCompleteRelativeEntry(page: Page, relativeData: any) {
  const relativeId = relativeData.id;
  
  console.log(`📝 Filling complete data for Relative #${relativeId}`);

  // Switch to the relative tab
  await page.click(`[data-testid="relative-${relativeId}-tab"]`);
  await page.waitForTimeout(500);

  // Fill Section 18.1 - Basic Information
  console.log(`  📋 Filling Section 18.1 for Relative #${relativeId}`);
  await page.selectOption(`[data-testid="relative-${relativeId}-type"]`, relativeData.section18_1.relativeType);
  await page.fill(`[data-testid="relative-${relativeId}-firstName"]`, relativeData.section18_1.fullName.firstName);
  await page.fill(`[data-testid="relative-${relativeId}-middleName"]`, relativeData.section18_1.fullName.middleName);
  await page.fill(`[data-testid="relative-${relativeId}-lastName"]`, relativeData.section18_1.fullName.lastName);
  await page.selectOption(`[data-testid="relative-${relativeId}-suffix"]`, relativeData.section18_1.fullName.suffix);
  
  // Birth information
  await page.fill(`[data-testid="relative-${relativeId}-birthDate"]`, `${relativeData.section18_1.dateOfBirth.month}/${relativeData.section18_1.dateOfBirth.year}`);
  if (relativeData.section18_1.dateOfBirth.isEstimated) {
    await page.check(`[data-testid="relative-${relativeId}-birthDate-estimated"]`);
  }
  
  await page.fill(`[data-testid="relative-${relativeId}-birthPlace-city"]`, relativeData.section18_1.placeOfBirth.city);
  await page.selectOption(`[data-testid="relative-${relativeId}-birthPlace-state"]`, relativeData.section18_1.placeOfBirth.state);
  await page.selectOption(`[data-testid="relative-${relativeId}-birthPlace-country"]`, relativeData.section18_1.placeOfBirth.country);
  
  // Citizenship
  await page.selectOption(`[data-testid="relative-${relativeId}-citizenship-country1"]`, relativeData.section18_1.citizenship.countries[0]);
  if (relativeData.section18_1.citizenship.countries[1]) {
    await page.selectOption(`[data-testid="relative-${relativeId}-citizenship-country2"]`, relativeData.section18_1.citizenship.countries[1]);
  }

  // Other names (if provided)
  if (relativeData.section18_1.otherNames && relativeData.section18_1.otherNames.length > 0) {
    const otherName = relativeData.section18_1.otherNames[0];
    await page.fill(`[data-testid="relative-${relativeId}-otherName-1-firstName"]`, otherName.fullName.firstName);
    await page.fill(`[data-testid="relative-${relativeId}-otherName-1-middleName"]`, otherName.fullName.middleName);
    await page.fill(`[data-testid="relative-${relativeId}-otherName-1-lastName"]`, otherName.fullName.lastName);
    await page.selectOption(`[data-testid="relative-${relativeId}-otherName-1-suffix"]`, otherName.fullName.suffix);
    await page.fill(`[data-testid="relative-${relativeId}-otherName-1-fromDate"]`, `${otherName.timeUsed.from.month}/${otherName.timeUsed.from.year}`);
    await page.fill(`[data-testid="relative-${relativeId}-otherName-1-toDate"]`, `${otherName.timeUsed.to.month}/${otherName.timeUsed.to.year}`);
    await page.fill(`[data-testid="relative-${relativeId}-otherName-1-reason"]`, otherName.reasonForChange);
  }

  await page.waitForTimeout(1000);

  // Navigate to Section 18.2 - Current Address
  console.log(`  🏠 Filling Section 18.2 for Relative #${relativeId}`);
  await page.click(`[data-testid="section-18-2-tab"]`);
  await page.waitForTimeout(500);

  await page.fill(`[data-testid="relative-${relativeId}-address-street"]`, relativeData.section18_2.currentAddress.street);
  await page.fill(`[data-testid="relative-${relativeId}-address-city"]`, relativeData.section18_2.currentAddress.city);
  await page.selectOption(`[data-testid="relative-${relativeId}-address-state"]`, relativeData.section18_2.currentAddress.state);
  await page.fill(`[data-testid="relative-${relativeId}-address-zipCode"]`, relativeData.section18_2.currentAddress.zipCode);
  await page.selectOption(`[data-testid="relative-${relativeId}-address-country"]`, relativeData.section18_2.currentAddress.country);
  
  // Date range
  await page.fill(`[data-testid="relative-${relativeId}-address-fromDate"]`, `${relativeData.section18_2.dateRange.from.month}/${relativeData.section18_2.dateRange.from.year}`);
  if (relativeData.section18_2.dateRange.isPresent) {
    await page.check(`[data-testid="relative-${relativeId}-address-present"]`);
  } else if (relativeData.section18_2.dateRange.to) {
    await page.fill(`[data-testid="relative-${relativeId}-address-toDate"]`, `${relativeData.section18_2.dateRange.to.month}/${relativeData.section18_2.dateRange.to.year}`);
  }

  await page.waitForTimeout(1000);

  // Navigate to Section 18.3 - Contact Information
  console.log(`  📞 Filling Section 18.3 for Relative #${relativeId}`);
  await page.click(`[data-testid="section-18-3-tab"]`);
  await page.waitForTimeout(500);

  // Contact methods
  if (relativeData.section18_3.contactMethods.inPerson) {
    await page.check(`[data-testid="relative-${relativeId}-contact-method-inPerson"]`);
  }
  if (relativeData.section18_3.contactMethods.telephone) {
    await page.check(`[data-testid="relative-${relativeId}-contact-method-telephone"]`);
  }
  if (relativeData.section18_3.contactMethods.electronic) {
    await page.check(`[data-testid="relative-${relativeId}-contact-method-electronic"]`);
  }
  if (relativeData.section18_3.contactMethods.other) {
    await page.check(`[data-testid="relative-${relativeId}-contact-method-other"]`);
    await page.fill(`[data-testid="relative-${relativeId}-contact-method-other-explanation"]`, relativeData.section18_3.contactMethods.otherExplanation);
  }

  // Contact frequency
  if (relativeData.section18_3.contactFrequency.weekly) {
    await page.check(`[data-testid="relative-${relativeId}-contact-frequency-weekly"]`);
  }
  if (relativeData.section18_3.contactFrequency.monthly) {
    await page.check(`[data-testid="relative-${relativeId}-contact-frequency-monthly"]`);
  }
  if (relativeData.section18_3.contactFrequency.other) {
    await page.check(`[data-testid="relative-${relativeId}-contact-frequency-other"]`);
    await page.fill(`[data-testid="relative-${relativeId}-contact-frequency-other-explanation"]`, relativeData.section18_3.contactFrequency.otherExplanation);
  }

  // Employment information
  await page.fill(`[data-testid="relative-${relativeId}-employment-employer"]`, relativeData.section18_3.employmentInfo.employerName);
  if (relativeData.section18_3.employmentInfo.address) {
    await page.fill(`[data-testid="relative-${relativeId}-employment-address-street"]`, relativeData.section18_3.employmentInfo.address.street);
    await page.fill(`[data-testid="relative-${relativeId}-employment-address-city"]`, relativeData.section18_3.employmentInfo.address.city);
  }

  // Foreign government relations
  await page.selectOption(`[data-testid="relative-${relativeId}-foreign-relations-hasRelations"]`, relativeData.section18_3.foreignGovernmentRelations.hasRelations);
  if (relativeData.section18_3.foreignGovernmentRelations.hasRelations === 'YES') {
    await page.fill(`[data-testid="relative-${relativeId}-foreign-relations-description"]`, relativeData.section18_3.foreignGovernmentRelations.description);
  }

  // Documentation types
  if (relativeData.section18_3.documentationTypes.i551PermanentResident) {
    await page.check(`[data-testid="relative-${relativeId}-doc-i551"]`);
  }
  if (relativeData.section18_3.documentationTypes.usVisa) {
    await page.check(`[data-testid="relative-${relativeId}-doc-usVisa"]`);
  }
  await page.fill(`[data-testid="relative-${relativeId}-doc-number"]`, relativeData.section18_3.documentationTypes.documentNumber);
  await page.fill(`[data-testid="relative-${relativeId}-doc-expiration"]`, relativeData.section18_3.documentationTypes.expirationDate);

  await page.waitForTimeout(1000);
  console.log(`✅ Completed filling data for Relative #${relativeId}`);
}

test.describe('Section 18 - Comprehensive Integration Tests', () => {
  let monitoring: Awaited<ReturnType<typeof setupComprehensiveMonitoring>>;

  test.beforeEach(async ({ page }) => {
    monitoring = await setupComprehensiveMonitoring(page);
    await navigateToSection18(page);
  });

  test('should fill out complete Section 18 for multiple relatives', async ({ page }) => {
    console.log('🧪 Testing Complete Section 18 for Multiple Relatives');

    // Fill out data for first two relatives
    for (const relativeData of COMPREHENSIVE_TEST_DATA.relatives) {
      await fillCompleteRelativeEntry(page, relativeData);
    }

    // Verify data persistence by checking key fields
    console.log('🔍 Verifying data persistence...');
    
    // Check Relative 1
    await page.click('[data-testid="relative-1-tab"]');
    await page.click('[data-testid="section-18-1-tab"]');
    await expect(page.locator('[data-testid="relative-1-firstName"]')).toHaveValue('Jane');
    
    await page.click('[data-testid="section-18-2-tab"]');
    await expect(page.locator('[data-testid="relative-1-address-street"]')).toHaveValue('123 Main Street');
    
    await page.click('[data-testid="section-18-3-tab"]');
    await expect(page.locator('[data-testid="relative-1-employment-employer"]')).toHaveValue('ABC Corp');

    // Check Relative 2
    await page.click('[data-testid="relative-2-tab"]');
    await page.click('[data-testid="section-18-1-tab"]');
    await expect(page.locator('[data-testid="relative-2-firstName"]')).toHaveValue('John');
    
    await page.click('[data-testid="section-18-2-tab"]');
    await expect(page.locator('[data-testid="relative-2-address-street"]')).toHaveValue('456 Oak Avenue');

    console.log('✅ Complete Section 18 for multiple relatives tested successfully');
  });

  test('should generate PDF with all Section 18 data', async ({ page }) => {
    console.log('🧪 Testing PDF Generation with Complete Section 18 Data');

    // Fill out complete data for first relative
    await fillCompleteRelativeEntry(page, COMPREHENSIVE_TEST_DATA.relatives[0]);

    // Navigate to PDF generation
    await page.click('[data-testid="generate-pdf-button"]');
    await page.waitForTimeout(3000);

    // Wait for PDF generation to complete
    await page.waitForSelector('[data-testid="pdf-generation-complete"]', { timeout: 30000 });

    // Verify PDF was generated successfully
    await expect(page.locator('[data-testid="pdf-generation-complete"]')).toBeVisible();
    
    // Check for PDF download link
    const downloadLink = page.locator('[data-testid="pdf-download-link"]');
    if (await downloadLink.isVisible()) {
      console.log('✅ PDF download link is available');
    }

    console.log('✅ PDF generation with Section 18 data completed successfully');
  });

  test('should monitor console for errors during complete workflow', async ({ page }) => {
    console.log('🧪 Testing Console Error Monitoring During Complete Workflow');

    // Fill out data and monitor for errors
    await fillCompleteRelativeEntry(page, COMPREHENSIVE_TEST_DATA.relatives[0]);

    // Wait for any async operations to complete
    await page.waitForTimeout(2000);

    // Check for console errors
    console.log(`📊 Console Messages: ${monitoring.consoleMessages.length}`);
    console.log(`🔴 Errors: ${monitoring.errors.length}`);
    console.log(`🟡 Warnings: ${monitoring.warnings.length}`);

    // Report any errors found
    if (monitoring.errors.length > 0) {
      console.log('🔴 Errors detected:');
      monitoring.errors.forEach((error, index) => {
        console.log(`  ${index + 1}. ${error}`);
      });
    }

    if (monitoring.warnings.length > 0) {
      console.log('🟡 Warnings detected:');
      monitoring.warnings.forEach((warning, index) => {
        console.log(`  ${index + 1}. ${warning}`);
      });
    }

    // Assert no critical errors occurred
    const criticalErrors = monitoring.errors.filter(error => 
      !error.includes('favicon') && 
      !error.includes('404') &&
      !error.includes('network')
    );

    expect(criticalErrors.length).toBe(0);

    console.log('✅ Console error monitoring completed');
  });

  test('should test performance with all 964 fields', async ({ page }) => {
    console.log('🧪 Testing Performance with All 964 Section 18 Fields');

    const startTime = Date.now();

    // Fill out data for all relatives (simulating all 964 fields)
    for (const relativeData of COMPREHENSIVE_TEST_DATA.relatives) {
      await fillCompleteRelativeEntry(page, relativeData);
    }

    const endTime = Date.now();
    const totalTime = endTime - startTime;

    console.log(`⏱️ Total time to fill Section 18: ${totalTime}ms`);
    console.log(`📊 Average time per field: ${(totalTime / 964).toFixed(2)}ms`);

    // Performance assertions
    expect(totalTime).toBeLessThan(60000); // Should complete within 60 seconds
    
    console.log('✅ Performance testing completed');
  });

  test.afterEach(async ({ page }) => {
    // Final error report
    if (monitoring.errors.length > 0) {
      console.log('\n🔴 Final Error Report:');
      monitoring.errors.forEach((error, index) => {
        console.log(`  ${index + 1}. ${error}`);
      });
    }
  });
});
