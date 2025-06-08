/**
 * Section 13 Comprehensive Playwright Tests
 * 
 * Tests all employment types and fields in Section 13 with console error monitoring
 */

import { test, expect, Page } from '@playwright/test';

// Test data for different employment types
const MILITARY_EMPLOYMENT_DATA = {
  fromDate: '01/2020',
  toDate: '12/2023',
  rankTitle: 'Captain',
  dutyStation: 'Fort Bragg',
  dutyStreet: '123 Military Base Rd',
  dutyCity: 'Fayetteville',
  dutyState: 'NC',
  dutyZip: '28310',
  phone: '(910) 555-0123',
  extension: '4567',
  supervisorName: 'Major John Smith',
  supervisorTitle: 'Battalion Commander',
  supervisorPhone: '(910) 555-0124',
  supervisorExtension: '4568',
  supervisorEmail: 'john.smith@army.mil'
};

const NON_FEDERAL_EMPLOYMENT_DATA = {
  fromDate: '03/2018',
  toDate: '12/2019',
  employerName: 'Tech Solutions Inc',
  positionTitle: 'Software Engineer',
  street: '456 Corporate Blvd',
  city: 'Charlotte',
  state: 'NC',
  zipCode: '28202',
  phone: '(704) 555-0125',
  extension: '1234',
  supervisorName: 'Sarah Johnson',
  supervisorTitle: 'Engineering Manager',
  supervisorPhone: '(704) 555-0126',
  supervisorEmail: 'sarah.johnson@techsolutions.com'
};

const SELF_EMPLOYMENT_DATA = {
  fromDate: '01/2016',
  toDate: '02/2018',
  businessName: 'Smith Consulting LLC',
  positionTitle: 'Owner/Consultant',
  businessType: 'Technology Consulting',
  street: '789 Business Park Dr',
  city: 'Raleigh',
  state: 'NC',
  zipCode: '27601',
  phone: '(919) 555-0127',
  extension: '0000',
  verifierFirstName: 'Michael',
  verifierLastName: 'Brown',
  verifierPhone: '(919) 555-0128',
  verifierStreet: '321 Verifier St',
  verifierCity: 'Raleigh',
  verifierState: 'NC',
  verifierZip: '27602'
};

const UNEMPLOYMENT_DATA = {
  fromDate: '01/2015',
  toDate: '12/2015',
  referenceFirstName: 'Jennifer',
  referenceLastName: 'Davis',
  referencePhone: '(919) 555-0129',
  referenceStreet: '654 Reference Ave',
  referenceCity: 'Durham',
  referenceState: 'NC',
  referenceZip: '27701'
};

// Console error monitoring
let consoleErrors: string[] = [];
let consoleWarnings: string[] = [];

test.beforeEach(async ({ page }) => {
  // Reset error arrays
  consoleErrors = [];
  consoleWarnings = [];

  // Monitor console errors and warnings
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      consoleErrors.push(`ERROR: ${msg.text()}`);
      console.log(`🔴 Console Error: ${msg.text()}`);
    } else if (msg.type() === 'warning') {
      consoleWarnings.push(`WARNING: ${msg.text()}`);
      console.log(`🟡 Console Warning: ${msg.text()}`);
    } else if (msg.type() === 'log' && msg.text().includes('Section13')) {
      console.log(`📝 Section13 Log: ${msg.text()}`);
    }
  });

  // Monitor network errors
  page.on('pageerror', (error) => {
    consoleErrors.push(`PAGE ERROR: ${error.message}`);
    console.log(`🔴 Page Error: ${error.message}`);
  });

  // Navigate to Section 13
  await page.goto('/form/section13');
  await page.waitForLoadState('networkidle');
});

test.afterEach(async () => {
  // Report console errors and warnings
  if (consoleErrors.length > 0) {
    console.log('\n🔴 CONSOLE ERRORS DETECTED:');
    consoleErrors.forEach(error => console.log(`  - ${error}`));
  }
  
  if (consoleWarnings.length > 0) {
    console.log('\n🟡 CONSOLE WARNINGS DETECTED:');
    consoleWarnings.forEach(warning => console.log(`  - ${warning}`));
  }

  if (consoleErrors.length === 0 && consoleWarnings.length === 0) {
    console.log('\n✅ NO CONSOLE ERRORS OR WARNINGS DETECTED');
  }
});

test.describe('Section 13: Employment Activities - Comprehensive Tests', () => {
  
  test('should load Section 13 without console errors', async ({ page }) => {
    // Verify page loads
    await expect(page.locator('h2')).toContainText('Section 13: Employment Activities');
    
    // Check for initial console errors
    expect(consoleErrors).toHaveLength(0);
    
    // Verify main employment questions are visible
    await expect(page.locator('text=Have you been employed in the last 10 years?')).toBeVisible();
    await expect(page.locator('text=Are there any gaps in your employment history?')).toBeVisible();
  });

  test('should handle employment flag changes without errors', async ({ page }) => {
    console.log('🧪 Testing employment flag changes...');
    
    // Test "Yes" to employment
    await page.locator('input[name="hasEmployment"][value="YES"]').check();
    await page.waitForTimeout(500); // Allow for state updates
    
    // Verify employment type selector appears
    await expect(page.locator('text=Select Employment Type')).toBeVisible();
    
    // Test "No" to employment
    await page.locator('input[name="hasEmployment"][value="NO"]').check();
    await page.waitForTimeout(500);
    
    // Test gaps flag
    await page.locator('input[name="hasGaps"][value="YES"]').check();
    await page.waitForTimeout(500);
    
    // Fill gap explanation
    await page.locator('textarea[placeholder*="employment history"]').fill('Brief unemployment period between jobs');
    await page.waitForTimeout(500);
    
    // Switch back to "Yes" for employment to continue testing
    await page.locator('input[name="hasEmployment"][value="YES"]').check();
    await page.waitForTimeout(500);
    
    expect(consoleErrors).toHaveLength(0);
  });

  test('should test all employment type selections', async ({ page }) => {
    console.log('🧪 Testing employment type selections...');
    
    // First select "Yes" to employment
    await page.locator('input[name="hasEmployment"][value="YES"]').check();
    await page.waitForTimeout(500);
    
    // Test each employment type
    const employmentTypes = [
      'Active Military Duty',
      'Federal Civilian', 
      'State Government',
      'Private Company',
      'Self-Employment',
      'Unemployment',
      'Other'
    ];
    
    for (const type of employmentTypes) {
      console.log(`  📋 Testing employment type: ${type}`);
      
      // Click on the employment type card
      await page.locator(`text=${type}`).first().click();
      await page.waitForTimeout(500);
      
      // Verify the type was selected (check for visual feedback)
      const typeCard = page.locator(`text=${type}`).first().locator('..');
      await expect(typeCard).toHaveClass(/border-blue-500|bg-blue-50/);
      
      // Check for console errors after each selection
      expect(consoleErrors).toHaveLength(0);
    }
  });

  test('should test military employment form with all fields', async ({ page }) => {
    console.log('🧪 Testing Military Employment Form (Section 13A.1)...');
    
    // Navigate to military employment
    await page.locator('input[name="hasEmployment"][value="YES"]').check();
    await page.waitForTimeout(500);
    
    await page.locator('text=Active Military Duty').first().click();
    await page.waitForTimeout(500);
    
    // Add military employment entry
    await page.locator('button:has-text("Add Entry")').click();
    await page.waitForTimeout(1000);
    
    // Fill employment dates
    console.log('  📅 Filling employment dates...');
    await page.locator('input[placeholder="MM/YYYY"]').first().fill(MILITARY_EMPLOYMENT_DATA.fromDate);
    await page.locator('input[placeholder="MM/YYYY"]').nth(1).fill(MILITARY_EMPLOYMENT_DATA.toDate);
    
    // Check estimated dates
    await page.locator('text=Estimated').first().click();
    await page.waitForTimeout(200);
    
    // Fill rank/title
    console.log('  🎖️ Filling rank and title...');
    await page.locator('input[placeholder*="Captain"]').fill(MILITARY_EMPLOYMENT_DATA.rankTitle);
    
    // Select employment status
    await page.locator('select').first().selectOption('Full-time');
    
    // Fill duty station information
    console.log('  🏢 Filling duty station information...');
    await page.locator('input[placeholder*="Fort Bragg"]').fill(MILITARY_EMPLOYMENT_DATA.dutyStation);
    await page.locator('label:has-text("Street Address") + input').fill(MILITARY_EMPLOYMENT_DATA.dutyStreet);
    await page.locator('label:has-text("City") + input').first().fill(MILITARY_EMPLOYMENT_DATA.dutyCity);
    
    // Select state
    await page.locator('select:has(option:text("Select State"))').selectOption(MILITARY_EMPLOYMENT_DATA.dutyState);
    
    // Fill ZIP code
    await page.locator('label:has-text("ZIP Code") + input').first().fill(MILITARY_EMPLOYMENT_DATA.dutyZip);
    
    // Fill phone information
    console.log('  📞 Filling phone information...');
    await page.locator('input[placeholder="(555) 123-4567"]').first().fill(MILITARY_EMPLOYMENT_DATA.phone);
    await page.locator('input[placeholder="1234"]').first().fill(MILITARY_EMPLOYMENT_DATA.extension);
    
    // Check phone type options
    await page.locator('text=DSN').click();
    await page.locator('text=Day').click();
    await page.waitForTimeout(200);
    
    // Fill supervisor information
    console.log('  👤 Filling supervisor information...');
    await page.locator('label:has-text("Supervisor Name") + input').fill(MILITARY_EMPLOYMENT_DATA.supervisorName);
    await page.locator('label:has-text("Supervisor Rank/Title") + input').fill(MILITARY_EMPLOYMENT_DATA.supervisorTitle);
    await page.locator('input[placeholder="(555) 123-4567"]').nth(1).fill(MILITARY_EMPLOYMENT_DATA.supervisorPhone);
    await page.locator('input[placeholder="Ext"]').nth(1).fill(MILITARY_EMPLOYMENT_DATA.supervisorExtension);
    await page.locator('input[type="email"]').fill(MILITARY_EMPLOYMENT_DATA.supervisorEmail);
    
    // Test supervisor contact options
    await page.locator('input[type="radio"][value="YES"]').first().check();
    await page.waitForTimeout(200);
    
    // Test APO/FPO address
    console.log('  📮 Testing APO/FPO address...');
    await page.locator('text=Use APO/FPO address').click();
    await page.waitForTimeout(500);
    
    if (await page.locator('input[placeholder="APO or FPO"]').isVisible()) {
      await page.locator('input[placeholder="APO or FPO"]').fill('APO');
      await page.locator('label:has-text("ZIP Code") + input').nth(1).fill('09123');
      await page.locator('label:has-text("Street Address") + input').nth(1).fill('Unit 1234');
    }
    
    await page.waitForTimeout(1000);
    expect(consoleErrors).toHaveLength(0);
  });

  test('should test non-federal employment form with all fields', async ({ page }) => {
    console.log('🧪 Testing Non-Federal Employment Form (Section 13A.2)...');
    
    // Navigate to non-federal employment
    await page.locator('input[name="hasEmployment"][value="YES"]').check();
    await page.waitForTimeout(500);
    
    await page.locator('text=Private Company').first().click();
    await page.waitForTimeout(500);
    
    // Add non-federal employment entry
    await page.locator('button:has-text("Add Entry")').click();
    await page.waitForTimeout(1000);
    
    // Fill employment dates
    console.log('  📅 Filling employment dates...');
    await page.locator('input[placeholder="MM/YYYY"]').first().fill(NON_FEDERAL_EMPLOYMENT_DATA.fromDate);
    await page.locator('input[placeholder="MM/YYYY"]').nth(1).fill(NON_FEDERAL_EMPLOYMENT_DATA.toDate);
    
    // Fill employer information
    console.log('  🏢 Filling employer information...');
    await page.locator('label:has-text("Employer/Company Name") + input').fill(NON_FEDERAL_EMPLOYMENT_DATA.employerName);
    await page.locator('label:has-text("Position Title") + input').fill(NON_FEDERAL_EMPLOYMENT_DATA.positionTitle);
    
    // Select employment status
    await page.locator('select:has(option:text("Select status"))').selectOption('Full-time');
    
    // Fill employer address
    console.log('  📍 Filling employer address...');
    await page.locator('label:has-text("Street Address") + input').fill(NON_FEDERAL_EMPLOYMENT_DATA.street);
    await page.locator('label:has-text("City") + input').fill(NON_FEDERAL_EMPLOYMENT_DATA.city);
    await page.locator('select:has(option:text("Select State"))').selectOption(NON_FEDERAL_EMPLOYMENT_DATA.state);
    await page.locator('label:has-text("ZIP Code") + input').fill(NON_FEDERAL_EMPLOYMENT_DATA.zipCode);
    
    // Fill contact information
    console.log('  📞 Filling contact information...');
    await page.locator('input[placeholder="(555) 123-4567"]').fill(NON_FEDERAL_EMPLOYMENT_DATA.phone);
    await page.locator('input[placeholder="1234"]').fill(NON_FEDERAL_EMPLOYMENT_DATA.extension);
    
    // Test additional employment periods
    console.log('  📋 Testing additional employment periods...');
    await page.locator('text=Did you have additional employment periods').locator('..').locator('input[type="radio"]').first().check();
    await page.waitForTimeout(500);
    
    // Test physical work address
    console.log('  🏗️ Testing physical work address...');
    await page.locator('text=Did you work at a different physical location').locator('..').locator('input[type="radio"]').first().check();
    await page.waitForTimeout(500);
    
    await page.waitForTimeout(1000);
    expect(consoleErrors).toHaveLength(0);
  });

  test('should save Section 13 data and generate PDF', async ({ page }) => {
    console.log('🧪 Testing Section 13 save and PDF generation...');
    
    // Fill minimal required data
    await page.locator('input[name="hasEmployment"][value="YES"]').check();
    await page.waitForTimeout(500);
    
    await page.locator('text=Private Company').first().click();
    await page.waitForTimeout(500);
    
    await page.locator('button:has-text("Add Entry")').click();
    await page.waitForTimeout(1000);
    
    // Fill minimal required fields
    await page.locator('input[placeholder="MM/YYYY"]').first().fill('01/2020');
    await page.locator('input[placeholder="MM/YYYY"]').nth(1).fill('12/2023');
    await page.locator('label:has-text("Employer/Company Name") + input').fill('Test Company');
    await page.locator('label:has-text("Position Title") + input').fill('Test Position');
    await page.locator('label:has-text("Street Address") + input').fill('123 Test St');
    await page.locator('label:has-text("City") + input').fill('Test City');
    await page.locator('input[placeholder="(555) 123-4567"]').fill('(555) 123-4567');
    
    // Save the section
    console.log('  💾 Saving Section 13...');
    await page.locator('button:has-text("Save Section 13")').click();
    await page.waitForTimeout(2000);
    
    // Check for save success (no console errors)
    expect(consoleErrors).toHaveLength(0);
    
    // Navigate to PDF generation
    console.log('  📄 Testing PDF generation...');
    await page.goto('/form/generate-pdf');
    await page.waitForLoadState('networkidle');
    
    // Generate PDF
    await page.locator('button:has-text("Generate PDF")').click();
    await page.waitForTimeout(5000); // Allow time for PDF generation
    
    // Check for PDF generation errors
    expect(consoleErrors).toHaveLength(0);
  });
});
