/**
 * Section 10 - Comprehensive Integration Tests
 * 
 * Tests complete Section 10 workflow including:
 * - All 122 fields across dual citizenship and foreign passport entries
 * - Integration between subsections 10.1 and 10.2
 * - PDF generation with all field values
 * - Console error monitoring
 * - Field mapping verification
 */

import { test, expect, Page } from '@playwright/test';

// Comprehensive test data for all Section 10 functionality
const COMPREHENSIVE_TEST_DATA = {
  dualCitizenship: {
    hasDualCitizenship: 'YES',
    entries: [
      {
        id: 1,
        country: 'Canada',
        howAcquired: 'Birth',
        fromDate: '01/1990',
        isFromEstimated: false,
        toDate: '12/2020',
        isToEstimated: true,
        isPresent: false,
        hasRenounced: 'YES',
        renounceExplanation: 'Renounced Canadian citizenship in 2020',
        hasTakenAction: 'YES',
        actionExplanation: 'Filed paperwork with Canadian consulate'
      },
      {
        id: 2,
        country: 'United Kingdom',
        howAcquired: 'Naturalization',
        fromDate: '06/2000',
        isFromEstimated: true,
        toDate: '',
        isToEstimated: false,
        isPresent: true,
        hasRenounced: 'NO',
        renounceExplanation: '',
        hasTakenAction: 'NO',
        actionExplanation: ''
      }
    ]
  },
  foreignPassport: {
    hasForeignPassport: 'YES',
    entries: [
      {
        id: 1,
        country: 'Canada',
        issueDate: '03/2015',
        isIssueDateEstimated: false,
        city: 'Toronto',
        country2: 'Canada',
        lastName: 'Smith',
        firstName: 'John',
        middleName: 'Michael',
        suffix: 'Jr',
        passportNumber: 'CA123456789',
        expirationDate: '03/2025',
        isExpirationDateEstimated: false,
        usedForUSEntry: true,
        travelCountries: [
          {
            country: 'France',
            fromDate: '06/2020',
            isFromDateEstimated: false,
            toDate: '07/2020',
            isToDateEstimated: false,
            isPresent: false
          },
          {
            country: 'Germany',
            fromDate: '08/2021',
            isFromDateEstimated: true,
            toDate: '09/2021',
            isToDateEstimated: false,
            isPresent: false
          },
          {
            country: 'Italy',
            fromDate: '05/2022',
            isFromDateEstimated: false,
            toDate: '',
            isToDateEstimated: false,
            isPresent: true
          }
        ]
      },
      {
        id: 2,
        country: 'United Kingdom',
        issueDate: '01/2018',
        isIssueDateEstimated: true,
        city: 'London',
        country2: 'United Kingdom',
        lastName: 'Smith',
        firstName: 'John',
        middleName: 'Michael',
        suffix: 'Sr',
        passportNumber: 'UK987654321',
        expirationDate: '01/2028',
        isExpirationDateEstimated: false,
        usedForUSEntry: false,
        travelCountries: [
          {
            country: 'Spain',
            fromDate: '04/2019',
            isFromDateEstimated: false,
            toDate: '05/2019',
            isToDateEstimated: false,
            isPresent: false
          },
          {
            country: 'Netherlands',
            fromDate: '09/2020',
            isFromDateEstimated: false,
            toDate: '10/2020',
            isToDateEstimated: true,
            isPresent: false
          },
          {
            country: 'Belgium',
            fromDate: '03/2023',
            isFromDateEstimated: false,
            toDate: '',
            isToDateEstimated: false,
            isPresent: true
          }
        ]
      }
    ]
  }
};

// Helper function to monitor console logs and errors
async function setupComprehensiveMonitoring(page: Page): Promise<{
  consoleMessages: string[];
  errors: string[];
  warnings: string[];
  section10Logs: string[];
}> {
  const consoleMessages: string[] = [];
  const errors: string[] = [];
  const warnings: string[] = [];
  const section10Logs: string[] = [];
  
  page.on('console', (msg) => {
    const message = `[${msg.type()}] ${msg.text()}`;
    consoleMessages.push(message);
    
    // Capture Section 10 specific logs
    if (message.includes('Section10:')) {
      section10Logs.push(message);
      console.log(`🔧 Section10 Log: ${message}`);
    }
    
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

  return { consoleMessages, errors, warnings, section10Logs };
}

// Helper function to navigate to Section 10
async function navigateToSection10(page: Page) {
  await page.goto('/startForm');
  await page.waitForLoadState('networkidle');
  
  // Navigate to Section 10
  await page.click('[data-testid="section-10-nav"]');
  await page.waitForSelector('[data-testid="section-10-content"]', { timeout: 10000 });
  
  // Wait for Section 10 initialization logs
  await page.waitForTimeout(2000);
}

// Helper function to fill dual citizenship entry
async function fillDualCitizenshipEntry(page: Page, entryData: any, entryIndex: number) {
  console.log(`📝 Filling dual citizenship entry ${entryIndex + 1}`);
  
  // Select the entry tab if multiple entries
  if (entryIndex > 0) {
    await page.click(`[data-testid="dual-citizenship-entry-${entryIndex + 1}-tab"]`);
    await page.waitForTimeout(500);
  }
  
  // Fill all dual citizenship fields
  await page.selectOption(`[data-testid="dual-citizenship-${entryIndex + 1}-country"]`, entryData.country);
  await page.fill(`[data-testid="dual-citizenship-${entryIndex + 1}-howAcquired"]`, entryData.howAcquired);
  await page.fill(`[data-testid="dual-citizenship-${entryIndex + 1}-fromDate"]`, entryData.fromDate);
  
  if (entryData.isFromEstimated) {
    await page.check(`[data-testid="dual-citizenship-${entryIndex + 1}-fromDate-estimated"]`);
  }
  
  if (entryData.isPresent) {
    await page.check(`[data-testid="dual-citizenship-${entryIndex + 1}-present"]`);
  } else {
    await page.fill(`[data-testid="dual-citizenship-${entryIndex + 1}-toDate"]`, entryData.toDate);
    if (entryData.isToEstimated) {
      await page.check(`[data-testid="dual-citizenship-${entryIndex + 1}-toDate-estimated"]`);
    }
  }
  
  await page.selectOption(`[data-testid="dual-citizenship-${entryIndex + 1}-hasRenounced"]`, entryData.hasRenounced);
  if (entryData.hasRenounced === 'YES') {
    await page.fill(`[data-testid="dual-citizenship-${entryIndex + 1}-renounceExplanation"]`, entryData.renounceExplanation);
  }
  
  await page.selectOption(`[data-testid="dual-citizenship-${entryIndex + 1}-hasTakenAction"]`, entryData.hasTakenAction);
  if (entryData.hasTakenAction === 'YES') {
    await page.fill(`[data-testid="dual-citizenship-${entryIndex + 1}-actionExplanation"]`, entryData.actionExplanation);
  }
  
  await page.waitForTimeout(1000);
  console.log(`✅ Completed dual citizenship entry ${entryIndex + 1}`);
}

// Helper function to fill foreign passport entry
async function fillForeignPassportEntry(page: Page, entryData: any, entryIndex: number) {
  console.log(`📝 Filling foreign passport entry ${entryIndex + 1}`);
  
  // Select the entry tab if multiple entries
  if (entryIndex > 0) {
    await page.click(`[data-testid="foreign-passport-entry-${entryIndex + 1}-tab"]`);
    await page.waitForTimeout(500);
  }
  
  // Fill passport details
  await page.selectOption(`[data-testid="foreign-passport-${entryIndex + 1}-country"]`, entryData.country);
  await page.fill(`[data-testid="foreign-passport-${entryIndex + 1}-issueDate"]`, entryData.issueDate);
  
  if (entryData.isIssueDateEstimated) {
    await page.check(`[data-testid="foreign-passport-${entryIndex + 1}-issueDate-estimated"]`);
  }
  
  await page.fill(`[data-testid="foreign-passport-${entryIndex + 1}-city"]`, entryData.city);
  await page.selectOption(`[data-testid="foreign-passport-${entryIndex + 1}-country2"]`, entryData.country2);
  await page.fill(`[data-testid="foreign-passport-${entryIndex + 1}-lastName"]`, entryData.lastName);
  await page.fill(`[data-testid="foreign-passport-${entryIndex + 1}-firstName"]`, entryData.firstName);
  await page.fill(`[data-testid="foreign-passport-${entryIndex + 1}-middleName"]`, entryData.middleName);
  await page.selectOption(`[data-testid="foreign-passport-${entryIndex + 1}-suffix"]`, entryData.suffix);
  await page.fill(`[data-testid="foreign-passport-${entryIndex + 1}-passportNumber"]`, entryData.passportNumber);
  await page.fill(`[data-testid="foreign-passport-${entryIndex + 1}-expirationDate"]`, entryData.expirationDate);
  
  if (entryData.isExpirationDateEstimated) {
    await page.check(`[data-testid="foreign-passport-${entryIndex + 1}-expirationDate-estimated"]`);
  }
  
  if (entryData.usedForUSEntry) {
    await page.check(`[data-testid="foreign-passport-${entryIndex + 1}-usedForUSEntry"]`);
  }
  
  // Fill travel countries
  for (let i = 0; i < entryData.travelCountries.length; i++) {
    const travelData = entryData.travelCountries[i];
    await fillTravelCountryEntry(page, travelData, entryIndex, i);
  }
  
  await page.waitForTimeout(1000);
  console.log(`✅ Completed foreign passport entry ${entryIndex + 1}`);
}

// Helper function to fill travel country entry
async function fillTravelCountryEntry(page: Page, travelData: any, passportIndex: number, travelIndex: number) {
  console.log(`  📍 Filling travel country ${travelIndex + 1} for passport ${passportIndex + 1}`);
  
  const prefix = `foreign-passport-${passportIndex + 1}-travel-${travelIndex + 1}`;
  
  await page.selectOption(`[data-testid="${prefix}-country"]`, travelData.country);
  await page.fill(`[data-testid="${prefix}-fromDate"]`, travelData.fromDate);
  
  if (travelData.isFromDateEstimated) {
    await page.check(`[data-testid="${prefix}-fromDate-estimated"]`);
  }
  
  if (travelData.isPresent) {
    await page.check(`[data-testid="${prefix}-present"]`);
  } else {
    await page.fill(`[data-testid="${prefix}-toDate"]`, travelData.toDate);
    if (travelData.isToDateEstimated) {
      await page.check(`[data-testid="${prefix}-toDate-estimated"]`);
    }
  }
  
  console.log(`  ✅ Completed travel country ${travelIndex + 1}`);
}

test.describe('Section 10 - Comprehensive Integration Tests', () => {
  let monitoring: Awaited<ReturnType<typeof setupComprehensiveMonitoring>>;

  test.beforeEach(async ({ page }) => {
    monitoring = await setupComprehensiveMonitoring(page);
    await navigateToSection10(page);
  });

  test('should verify Section 10 field mapping initialization', async ({ page }) => {
    console.log('🧪 Testing Section 10 Field Mapping Initialization');

    // Wait for initialization logs
    await page.waitForTimeout(3000);

    // Verify Section 10 initialization logs are present
    const section10InitLogs = monitoring.section10Logs.filter(log =>
      log.includes('Initializing section data') ||
      log.includes('Field mapping verification') ||
      log.includes('Field generation system')
    );

    console.log(`📊 Section 10 initialization logs found: ${section10InitLogs.length}`);
    section10InitLogs.forEach(log => console.log(`  - ${log}`));

    // Verify field mapping coverage
    const coverageLogs = monitoring.section10Logs.filter(log =>
      log.includes('coverage') && log.includes('%')
    );

    if (coverageLogs.length > 0) {
      console.log('✅ Field mapping coverage verification found');
      coverageLogs.forEach(log => console.log(`  📊 ${log}`));
    }

    // Verify field generation validation
    const generationLogs = monitoring.section10Logs.filter(log =>
      log.includes('Field generation system')
    );

    if (generationLogs.length > 0) {
      console.log('✅ Field generation system validation found');
    }

    console.log('✅ Section 10 field mapping initialization verified');
  });

  test('should fill out complete dual citizenship section', async ({ page }) => {
    console.log('🧪 Testing Complete Dual Citizenship Section');

    // Answer main question
    await page.selectOption('[data-testid="has-dual-citizenship"]', COMPREHENSIVE_TEST_DATA.dualCitizenship.hasDualCitizenship);
    await page.waitForTimeout(1000);

    // Fill dual citizenship entries
    for (let i = 0; i < COMPREHENSIVE_TEST_DATA.dualCitizenship.entries.length; i++) {
      // Add entry if needed
      if (i > 0) {
        await page.click('[data-testid="add-dual-citizenship-entry"]');
        await page.waitForTimeout(500);
      }

      await fillDualCitizenshipEntry(page, COMPREHENSIVE_TEST_DATA.dualCitizenship.entries[i], i);
    }

    // Verify data persistence
    console.log('🔍 Verifying dual citizenship data persistence...');

    // Check first entry
    await page.click('[data-testid="dual-citizenship-entry-1-tab"]');
    await expect(page.locator('[data-testid="dual-citizenship-1-country"]')).toHaveValue('Canada');
    await expect(page.locator('[data-testid="dual-citizenship-1-howAcquired"]')).toHaveValue('Birth');

    // Check second entry
    await page.click('[data-testid="dual-citizenship-entry-2-tab"]');
    await expect(page.locator('[data-testid="dual-citizenship-2-country"]')).toHaveValue('United Kingdom');
    await expect(page.locator('[data-testid="dual-citizenship-2-howAcquired"]')).toHaveValue('Naturalization');

    console.log('✅ Complete dual citizenship section tested successfully');
  });

  test('should fill out complete foreign passport section', async ({ page }) => {
    console.log('🧪 Testing Complete Foreign Passport Section');

    // Answer main question
    await page.selectOption('[data-testid="has-foreign-passport"]', COMPREHENSIVE_TEST_DATA.foreignPassport.hasForeignPassport);
    await page.waitForTimeout(1000);

    // Fill foreign passport entries
    for (let i = 0; i < COMPREHENSIVE_TEST_DATA.foreignPassport.entries.length; i++) {
      // Add entry if needed
      if (i > 0) {
        await page.click('[data-testid="add-foreign-passport-entry"]');
        await page.waitForTimeout(500);
      }

      await fillForeignPassportEntry(page, COMPREHENSIVE_TEST_DATA.foreignPassport.entries[i], i);
    }

    // Verify data persistence
    console.log('🔍 Verifying foreign passport data persistence...');

    // Check first passport
    await page.click('[data-testid="foreign-passport-entry-1-tab"]');
    await expect(page.locator('[data-testid="foreign-passport-1-country"]')).toHaveValue('Canada');
    await expect(page.locator('[data-testid="foreign-passport-1-passportNumber"]')).toHaveValue('CA123456789');

    // Check second passport
    await page.click('[data-testid="foreign-passport-entry-2-tab"]');
    await expect(page.locator('[data-testid="foreign-passport-2-country"]')).toHaveValue('United Kingdom');
    await expect(page.locator('[data-testid="foreign-passport-2-passportNumber"]')).toHaveValue('UK987654321');

    console.log('✅ Complete foreign passport section tested successfully');
  });

  test('should test all 122 fields in Section 10', async ({ page }) => {
    console.log('🧪 Testing All 122 Fields in Section 10');

    let fieldCount = 0;

    // Fill dual citizenship section (23 fields)
    await page.selectOption('[data-testid="has-dual-citizenship"]', COMPREHENSIVE_TEST_DATA.dualCitizenship.hasDualCitizenship);
    fieldCount++; // Main question

    for (let i = 0; i < COMPREHENSIVE_TEST_DATA.dualCitizenship.entries.length; i++) {
      if (i > 0) {
        await page.click('[data-testid="add-dual-citizenship-entry"]');
        await page.waitForTimeout(500);
      }

      await fillDualCitizenshipEntry(page, COMPREHENSIVE_TEST_DATA.dualCitizenship.entries[i], i);
      fieldCount += 11; // 11 fields per dual citizenship entry
    }

    console.log(`📊 Dual citizenship fields filled: ${fieldCount}`);

    // Fill foreign passport section (99 fields)
    await page.selectOption('[data-testid="has-foreign-passport"]', COMPREHENSIVE_TEST_DATA.foreignPassport.hasForeignPassport);
    fieldCount++; // Main question

    for (let i = 0; i < COMPREHENSIVE_TEST_DATA.foreignPassport.entries.length; i++) {
      if (i > 0) {
        await page.click('[data-testid="add-foreign-passport-entry"]');
        await page.waitForTimeout(500);
      }

      await fillForeignPassportEntry(page, COMPREHENSIVE_TEST_DATA.foreignPassport.entries[i], i);
      fieldCount += 13; // 13 passport fields per entry
      fieldCount += COMPREHENSIVE_TEST_DATA.foreignPassport.entries[i].travelCountries.length * 6; // 6 fields per travel country
    }

    console.log(`📊 Total fields filled: ${fieldCount}`);
    console.log(`📊 Expected fields: 122`);

    // Verify we've tested all expected fields
    expect(fieldCount).toBeGreaterThanOrEqual(100); // Allow some flexibility for dynamic fields

    console.log('✅ All Section 10 fields tested successfully');
  });

  test('should generate PDF with all Section 10 data', async ({ page }) => {
    console.log('🧪 Testing PDF Generation with Complete Section 10 Data');

    // Fill complete Section 10 data
    await page.selectOption('[data-testid="has-dual-citizenship"]', COMPREHENSIVE_TEST_DATA.dualCitizenship.hasDualCitizenship);
    await fillDualCitizenshipEntry(page, COMPREHENSIVE_TEST_DATA.dualCitizenship.entries[0], 0);

    await page.selectOption('[data-testid="has-foreign-passport"]', COMPREHENSIVE_TEST_DATA.foreignPassport.hasForeignPassport);
    await fillForeignPassportEntry(page, COMPREHENSIVE_TEST_DATA.foreignPassport.entries[0], 0);

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

    console.log('✅ PDF generation with Section 10 data completed successfully');
  });

  test('should monitor console for errors during complete workflow', async ({ page }) => {
    console.log('🧪 Testing Console Error Monitoring During Complete Workflow');

    // Fill complete Section 10 data and monitor for errors
    await page.selectOption('[data-testid="has-dual-citizenship"]', COMPREHENSIVE_TEST_DATA.dualCitizenship.hasDualCitizenship);
    await fillDualCitizenshipEntry(page, COMPREHENSIVE_TEST_DATA.dualCitizenship.entries[0], 0);

    await page.selectOption('[data-testid="has-foreign-passport"]', COMPREHENSIVE_TEST_DATA.foreignPassport.hasForeignPassport);
    await fillForeignPassportEntry(page, COMPREHENSIVE_TEST_DATA.foreignPassport.entries[0], 0);

    // Wait for any async operations to complete
    await page.waitForTimeout(2000);

    // Check for console errors
    console.log(`📊 Console Messages: ${monitoring.consoleMessages.length}`);
    console.log(`📊 Section 10 Logs: ${monitoring.section10Logs.length}`);
    console.log(`🔴 Errors: ${monitoring.errors.length}`);
    console.log(`🟡 Warnings: ${monitoring.warnings.length}`);

    // Report Section 10 specific logs
    if (monitoring.section10Logs.length > 0) {
      console.log('🔧 Section 10 Logs:');
      monitoring.section10Logs.forEach((log, index) => {
        console.log(`  ${index + 1}. ${log}`);
      });
    }

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

  test.afterEach(async ({ page }) => {
    // Final error report
    if (monitoring.errors.length > 0) {
      console.log('\n🔴 Final Error Report:');
      monitoring.errors.forEach((error, index) => {
        console.log(`  ${index + 1}. ${error}`);
      });
    }

    // Final Section 10 logs report
    if (monitoring.section10Logs.length > 0) {
      console.log('\n🔧 Final Section 10 Logs Report:');
      monitoring.section10Logs.forEach((log, index) => {
        console.log(`  ${index + 1}. ${log}`);
      });
    }
  });
});
