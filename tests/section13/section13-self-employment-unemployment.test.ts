/**
 * Section 13 Self-Employment and Unemployment Tests
 * 
 * Comprehensive tests for Section 13A.3 (Self-Employment) and 13A.4 (Unemployment)
 */

import { test, expect, Page } from '@playwright/test';

const SELF_EMPLOYMENT_DATA = {
  fromDate: '01/2016',
  toDate: '02/2018',
  businessName: 'Smith Consulting LLC',
  positionTitle: 'Owner/Consultant',
  businessType: 'Technology Consulting',
  businessStreet: '789 Business Park Dr',
  businessCity: 'Raleigh',
  businessState: 'NC',
  businessZip: '27601',
  businessPhone: '(919) 555-0127',
  businessExtension: '0000',
  verifierFirstName: 'Michael',
  verifierLastName: 'Brown',
  verifierPhone: '(919) 555-0128',
  verifierExtension: '1111',
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
  referenceExtension: '2222',
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

  // Monitor console messages
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

  page.on('pageerror', (error) => {
    consoleErrors.push(`PAGE ERROR: ${error.message}`);
    console.log(`🔴 Page Error: ${error.message}`);
  });

  await page.goto('/form/section13');
  await page.waitForLoadState('networkidle');
});

test.afterEach(async () => {
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

test.describe('Section 13: Self-Employment and Unemployment Tests', () => {

  test('should test self-employment form with all fields (Section 13A.3)', async ({ page }) => {
    console.log('🧪 Testing Self-Employment Form (Section 13A.3)...');
    
    // Navigate to self-employment
    await page.locator('input[name="hasEmployment"][value="YES"]').check();
    await page.waitForTimeout(500);
    
    await page.locator('text=Self-Employment').first().click();
    await page.waitForTimeout(500);
    
    // Add self-employment entry
    await page.locator('button:has-text("Add Entry")').click();
    await page.waitForTimeout(1000);
    
    // Fill employment dates
    console.log('  📅 Filling self-employment dates...');
    await page.locator('input[placeholder="MM/YYYY"]').first().fill(SELF_EMPLOYMENT_DATA.fromDate);
    await page.locator('input[placeholder="MM/YYYY"]').nth(1).fill(SELF_EMPLOYMENT_DATA.toDate);
    
    // Check estimated dates
    await page.locator('text=Estimated').first().click();
    await page.waitForTimeout(200);
    
    // Fill business information
    console.log('  🏢 Filling business information...');
    await page.locator('label:has-text("Business Name") + input').fill(SELF_EMPLOYMENT_DATA.businessName);
    await page.locator('label:has-text("Position Title") + input').fill(SELF_EMPLOYMENT_DATA.positionTitle);
    await page.locator('label:has-text("Business Type") + input').fill(SELF_EMPLOYMENT_DATA.businessType);
    
    // Fill business address
    console.log('  📍 Filling business address...');
    await page.locator('label:has-text("Street Address") + input').first().fill(SELF_EMPLOYMENT_DATA.businessStreet);
    await page.locator('label:has-text("City") + input').first().fill(SELF_EMPLOYMENT_DATA.businessCity);
    await page.locator('select:has(option:text("Select State"))').first().selectOption(SELF_EMPLOYMENT_DATA.businessState);
    await page.locator('label:has-text("ZIP Code") + input').first().fill(SELF_EMPLOYMENT_DATA.businessZip);
    
    // Fill business contact information
    console.log('  📞 Filling business contact information...');
    await page.locator('input[placeholder="(555) 123-4567"]').first().fill(SELF_EMPLOYMENT_DATA.businessPhone);
    await page.locator('input[placeholder="1234"]').first().fill(SELF_EMPLOYMENT_DATA.businessExtension);
    
    // Fill verifier information
    console.log('  👤 Filling verifier information...');
    await page.locator('label:has-text("Verifier First Name") + input').fill(SELF_EMPLOYMENT_DATA.verifierFirstName);
    await page.locator('label:has-text("Verifier Last Name") + input').fill(SELF_EMPLOYMENT_DATA.verifierLastName);
    
    // Fill verifier phone
    await page.locator('input[placeholder="(555) 123-4567"]').nth(1).fill(SELF_EMPLOYMENT_DATA.verifierPhone);
    await page.locator('input[placeholder="Ext"]').nth(1).fill(SELF_EMPLOYMENT_DATA.verifierExtension);
    
    // Fill verifier address
    console.log('  📮 Filling verifier address...');
    await page.locator('label:has-text("Street Address") + input').nth(1).fill(SELF_EMPLOYMENT_DATA.verifierStreet);
    await page.locator('label:has-text("City") + input').nth(1).fill(SELF_EMPLOYMENT_DATA.verifierCity);
    await page.locator('select:has(option:text("Select State"))').nth(1).selectOption(SELF_EMPLOYMENT_DATA.verifierState);
    await page.locator('label:has-text("ZIP Code") + input').nth(1).fill(SELF_EMPLOYMENT_DATA.verifierZip);
    
    await page.waitForTimeout(1000);
    expect(consoleErrors).toHaveLength(0);
    
    console.log('✅ Self-employment form completed successfully');
  });

  test('should test unemployment form with all fields (Section 13A.4)', async ({ page }) => {
    console.log('🧪 Testing Unemployment Form (Section 13A.4)...');
    
    // Navigate to unemployment
    await page.locator('input[name="hasEmployment"][value="YES"]').check();
    await page.waitForTimeout(500);
    
    await page.locator('text=Unemployment').first().click();
    await page.waitForTimeout(500);
    
    // Add unemployment entry
    await page.locator('button:has-text("Add Entry")').click();
    await page.waitForTimeout(1000);
    
    // Fill unemployment dates
    console.log('  📅 Filling unemployment dates...');
    await page.locator('input[placeholder="MM/YYYY"]').first().fill(UNEMPLOYMENT_DATA.fromDate);
    await page.locator('input[placeholder="MM/YYYY"]').nth(1).fill(UNEMPLOYMENT_DATA.toDate);
    
    // Check estimated dates
    await page.locator('text=Estimated').first().click();
    await page.waitForTimeout(200);
    
    // Test "Still unemployed" checkbox
    console.log('  ⏰ Testing still unemployed option...');
    await page.locator('text=Still unemployed').click();
    await page.waitForTimeout(500);
    
    // Uncheck to continue with end date
    await page.locator('text=Still unemployed').click();
    await page.waitForTimeout(500);
    
    // Fill reference contact information
    console.log('  👤 Filling reference contact information...');
    await page.locator('label:has-text("Reference First Name") + input').fill(UNEMPLOYMENT_DATA.referenceFirstName);
    await page.locator('label:has-text("Reference Last Name") + input').fill(UNEMPLOYMENT_DATA.referenceLastName);
    
    // Fill reference phone
    await page.locator('input[placeholder="(555) 123-4567"]').fill(UNEMPLOYMENT_DATA.referencePhone);
    await page.locator('input[placeholder="Ext"]').fill(UNEMPLOYMENT_DATA.referenceExtension);
    
    // Fill reference address
    console.log('  📮 Filling reference address...');
    await page.locator('label:has-text("Street Address") + input').fill(UNEMPLOYMENT_DATA.referenceStreet);
    await page.locator('label:has-text("City") + input').fill(UNEMPLOYMENT_DATA.referenceCity);
    await page.locator('select:has(option:text("Select State"))').selectOption(UNEMPLOYMENT_DATA.referenceState);
    await page.locator('label:has-text("ZIP Code") + input').fill(UNEMPLOYMENT_DATA.referenceZip);
    
    await page.waitForTimeout(1000);
    expect(consoleErrors).toHaveLength(0);
    
    console.log('✅ Unemployment form completed successfully');
  });

  test('should test multiple employment entries of different types', async ({ page }) => {
    console.log('🧪 Testing multiple employment entries of different types...');
    
    // Start with employment
    await page.locator('input[name="hasEmployment"][value="YES"]').check();
    await page.waitForTimeout(500);
    
    // Add self-employment entry
    console.log('  💼 Adding self-employment entry...');
    await page.locator('text=Self-Employment').first().click();
    await page.waitForTimeout(500);
    
    await page.locator('button:has-text("Add Entry")').click();
    await page.waitForTimeout(1000);
    
    // Fill minimal self-employment data
    await page.locator('input[placeholder="MM/YYYY"]').first().fill('01/2020');
    await page.locator('input[placeholder="MM/YYYY"]').nth(1).fill('12/2020');
    await page.locator('label:has-text("Business Name") + input').fill('Test Business');
    await page.locator('label:has-text("Position Title") + input').fill('Owner');
    await page.locator('label:has-text("Business Type") + input').fill('Consulting');
    
    // Change to unemployment type
    console.log('  📋 Changing to unemployment type...');
    await page.locator('button:has-text("Change Type")').click();
    await page.waitForTimeout(500);
    
    await page.locator('text=Unemployment').first().click();
    await page.waitForTimeout(500);
    
    // Add unemployment entry
    await page.locator('button:has-text("Add Entry")').click();
    await page.waitForTimeout(1000);
    
    // Fill minimal unemployment data
    await page.locator('input[placeholder="MM/YYYY"]').first().fill('01/2019');
    await page.locator('input[placeholder="MM/YYYY"]').nth(1).fill('12/2019');
    await page.locator('label:has-text("Reference First Name") + input').fill('John');
    await page.locator('label:has-text("Reference Last Name") + input').fill('Doe');
    await page.locator('input[placeholder="(555) 123-4567"]').fill('(555) 123-4567');
    
    await page.waitForTimeout(1000);
    expect(consoleErrors).toHaveLength(0);
    
    console.log('✅ Multiple employment entries tested successfully');
  });

  test('should test form validation and error handling', async ({ page }) => {
    console.log('🧪 Testing form validation and error handling...');
    
    // Start with employment
    await page.locator('input[name="hasEmployment"][value="YES"]').check();
    await page.waitForTimeout(500);
    
    // Select self-employment
    await page.locator('text=Self-Employment').first().click();
    await page.waitForTimeout(500);
    
    // Add entry without filling required fields
    await page.locator('button:has-text("Add Entry")').click();
    await page.waitForTimeout(1000);
    
    // Try to save without filling required fields
    console.log('  ❌ Testing validation with empty required fields...');
    await page.locator('button:has-text("Save Section 13")').click();
    await page.waitForTimeout(2000);
    
    // Check if validation errors are displayed
    const errorElements = await page.locator('.text-red-500, .text-red-700, .bg-red-50').count();
    console.log(`  📊 Found ${errorElements} validation error elements`);
    
    // Fill some required fields
    console.log('  ✅ Filling required fields to test validation clearing...');
    await page.locator('input[placeholder="MM/YYYY"]').first().fill('01/2020');
    await page.locator('label:has-text("Business Name") + input').fill('Test Business');
    await page.locator('label:has-text("Position Title") + input').fill('Owner');
    await page.locator('label:has-text("Business Type") + input').fill('Consulting');
    
    await page.waitForTimeout(1000);
    
    // Check that console errors are related to validation, not JavaScript errors
    const jsErrors = consoleErrors.filter(error => 
      !error.includes('validation') && 
      !error.includes('required') &&
      !error.includes('field')
    );
    
    expect(jsErrors).toHaveLength(0);
    console.log('✅ Validation testing completed successfully');
  });

  test('should test employment gaps functionality', async ({ page }) => {
    console.log('🧪 Testing employment gaps functionality...');
    
    // Test gaps flag
    await page.locator('input[name="hasGaps"][value="YES"]').check();
    await page.waitForTimeout(500);
    
    // Verify gap explanation field appears
    await expect(page.locator('textarea[placeholder*="employment history"]')).toBeVisible();
    
    // Fill gap explanation
    const gapExplanation = 'I had a 6-month gap between jobs due to family relocation and job search in new city.';
    await page.locator('textarea[placeholder*="employment history"]').fill(gapExplanation);
    await page.waitForTimeout(500);
    
    // Test switching gaps flag to NO
    await page.locator('input[name="hasGaps"][value="NO"]').check();
    await page.waitForTimeout(500);
    
    // Verify gap explanation field is hidden
    await expect(page.locator('textarea[placeholder*="employment history"]')).not.toBeVisible();
    
    expect(consoleErrors).toHaveLength(0);
    console.log('✅ Employment gaps functionality tested successfully');
  });

  test('should test complete workflow with PDF generation', async ({ page }) => {
    console.log('🧪 Testing complete Section 13 workflow with PDF generation...');
    
    // Complete a full employment entry
    await page.locator('input[name="hasEmployment"][value="YES"]').check();
    await page.waitForTimeout(500);
    
    // Add self-employment
    await page.locator('text=Self-Employment').first().click();
    await page.waitForTimeout(500);
    
    await page.locator('button:has-text("Add Entry")').click();
    await page.waitForTimeout(1000);
    
    // Fill all required fields
    await page.locator('input[placeholder="MM/YYYY"]').first().fill(SELF_EMPLOYMENT_DATA.fromDate);
    await page.locator('input[placeholder="MM/YYYY"]').nth(1).fill(SELF_EMPLOYMENT_DATA.toDate);
    await page.locator('label:has-text("Business Name") + input').fill(SELF_EMPLOYMENT_DATA.businessName);
    await page.locator('label:has-text("Position Title") + input').fill(SELF_EMPLOYMENT_DATA.positionTitle);
    await page.locator('label:has-text("Business Type") + input').fill(SELF_EMPLOYMENT_DATA.businessType);
    await page.locator('label:has-text("Street Address") + input').first().fill(SELF_EMPLOYMENT_DATA.businessStreet);
    await page.locator('label:has-text("City") + input').first().fill(SELF_EMPLOYMENT_DATA.businessCity);
    await page.locator('input[placeholder="(555) 123-4567"]').first().fill(SELF_EMPLOYMENT_DATA.businessPhone);
    await page.locator('label:has-text("Verifier First Name") + input').fill(SELF_EMPLOYMENT_DATA.verifierFirstName);
    await page.locator('label:has-text("Verifier Last Name") + input').fill(SELF_EMPLOYMENT_DATA.verifierLastName);
    await page.locator('input[placeholder="(555) 123-4567"]').nth(1).fill(SELF_EMPLOYMENT_DATA.verifierPhone);
    await page.locator('label:has-text("Street Address") + input').nth(1).fill(SELF_EMPLOYMENT_DATA.verifierStreet);
    await page.locator('label:has-text("City") + input').nth(1).fill(SELF_EMPLOYMENT_DATA.verifierCity);
    
    // Save the section
    console.log('  💾 Saving Section 13...');
    await page.locator('button:has-text("Save Section 13")').click();
    await page.waitForTimeout(2000);
    
    // Navigate to PDF generation
    console.log('  📄 Generating PDF...');
    await page.goto('/form/generate-pdf');
    await page.waitForLoadState('networkidle');
    
    await page.locator('button:has-text("Generate PDF")').click();
    await page.waitForTimeout(5000);
    
    expect(consoleErrors).toHaveLength(0);
    console.log('✅ Complete workflow tested successfully');
  });
});
