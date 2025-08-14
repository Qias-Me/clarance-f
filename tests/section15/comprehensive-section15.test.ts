/**
 * Comprehensive Playwright test for Section 15: Military History
 * This test fills ALL visible fields with the provided test data
 */

import { test, expect } from '@playwright/test';
import { logFieldAction, calculateFieldCoverage } from '../utils/test-helpers';

test.describe('Section 15: Military History - Comprehensive Field Coverage', () => {
  test('should fill ALL military service fields with maximum coverage', async ({ page }) => {
    const fieldsFilled: string[] = [];
    const fieldsSkipped: string[] = [];
    const testStartTime = Date.now();

    // Navigate to Section 15
    await page.goto('http://localhost:5173/form/section/15');
    await page.waitForSelector('[data-testid="section15-form"]', { timeout: 10000 });

    // Take screenshot before filling
    await page.screenshot({ 
      path: 'tests/section15/screenshots/section15-before-filling.png',
      fullPage: true 
    });

    console.log('=== Starting Comprehensive Section 15: Military History Test ===');
    console.log('Test Data:');
    console.log('- Branch of Service: Army');
    console.log('- Service Status: Officer');
    console.log('- Service dates: 01/15/2015 to 06/30/2019');
    console.log('- Service Number: 123-45-6789');
    console.log('- State of Service: National Guard (if applicable)');
    console.log('- Discharge Type: Honorable');
    console.log('- Discharge Date: 06/30/2019');
    console.log('- Current Status: Separated');
    console.log('==========================================\n');

    // Step 1: Military Service Question
    console.log('📋 Step 1: Military Service Question');
    const hasServedRadio = await page.locator('input[name="hasServed"][value="YES"]');
    if (await hasServedRadio.isVisible()) {
      await hasServedRadio.click();
      await logFieldAction('Has Served in Military', 'YES', 'radio', fieldsFilled);
    } else {
      fieldsSkipped.push('Has Served in Military - Radio not found');
    }

    // Wait for the form to update
    await page.waitForTimeout(500);

    // Step 2: Add Military Service Entry
    console.log('\n📋 Step 2: Adding Military Service Entry');
    const addServiceButton = await page.locator('button:has-text("Add Service Entry")');
    if (await addServiceButton.isVisible()) {
      await addServiceButton.click();
      await page.waitForTimeout(500);
      console.log('✓ Clicked Add Service Entry button');
    } else {
      // Try alternative button selector
      const addButton = await page.locator('[data-testid="add-military-service-entry"]');
      if (await addButton.isVisible()) {
        await addButton.click();
        await page.waitForTimeout(500);
        console.log('✓ Clicked Add Service Entry button (via data-testid)');
      }
    }

    // Step 3: Fill Military Service Entry Fields
    console.log('\n📋 Step 3: Filling Military Service Entry Fields');

    // Branch of Service (Dropdown)
    const branchSelect = await page.locator('select').filter({ hasText: 'Select Branch' }).first();
    if (await branchSelect.isVisible()) {
      await branchSelect.selectOption('1'); // Army value is '1'
      await logFieldAction('Branch of Service', 'Army', 'dropdown', fieldsFilled);
    } else {
      fieldsSkipped.push('Branch of Service - Dropdown not found');
    }

    // Service Status (Radio) - Value '1' is Officer
    const officerRadio = await page.locator('input[type="radio"][value="1"]').first();
    if (await officerRadio.isVisible()) {
      await officerRadio.click();
      await logFieldAction('Service Status', 'Officer', 'radio', fieldsFilled);
    } else {
      // Try alternative status selection
      const statusRadios = await page.locator('input[type="radio"][name*="serviceStatus"]');
      if (await statusRadios.count() > 0) {
        await statusRadios.first().click();
        await logFieldAction('Service Status', 'First available option', 'radio', fieldsFilled);
      } else {
        fieldsSkipped.push('Service Status - Radio not found');
      }
    }

    // Service Dates
    const fromDateInput = await page.locator('input[type="date"][id*="fromDate"], input[type="date"][name*="fromDate"]').first();
    if (await fromDateInput.isVisible()) {
      await fromDateInput.fill('2015-01-15');
      await logFieldAction('Service From Date', '01/15/2015', 'date', fieldsFilled);
    } else {
      fieldsSkipped.push('Service From Date - Input not found');
    }

    const toDateInput = await page.locator('input[type="date"][id*="toDate"], input[type="date"][name*="toDate"]').first();
    if (await toDateInput.isVisible()) {
      await toDateInput.fill('2019-06-30');
      await logFieldAction('Service To Date', '06/30/2019', 'date', fieldsFilled);
    } else {
      fieldsSkipped.push('Service To Date - Input not found');
    }

    // Service Number
    const serviceNumberInput = await page.locator('input[type="text"][placeholder*="service number" i], input[id*="serviceNumber"], input[name*="serviceNumber"]').first();
    if (await serviceNumberInput.isVisible()) {
      await serviceNumberInput.fill('123-45-6789');
      await logFieldAction('Service Number', '123-45-6789', 'text', fieldsFilled);
    } else {
      fieldsSkipped.push('Service Number - Input not found');
    }

    // State (for National Guard)
    const stateSelect = await page.locator('select[id*="state"], select[name*="state"]').first();
    if (await stateSelect.isVisible()) {
      await stateSelect.selectOption('CA'); // California
      await logFieldAction('State of Service', 'California', 'dropdown', fieldsFilled);
    }

    // Discharge Type (Radio)
    const honorableRadio = await page.locator('input[type="radio"][value="Honorable"]').first();
    if (await honorableRadio.isVisible()) {
      await honorableRadio.click();
      await logFieldAction('Discharge Type', 'Honorable', 'radio', fieldsFilled);
    } else {
      // Try alternative discharge type selection
      const dischargeRadios = await page.locator('input[type="radio"][name*="dischargeType"]');
      if (await dischargeRadios.count() > 0) {
        await dischargeRadios.first().click();
        await logFieldAction('Discharge Type', 'First available option', 'radio', fieldsFilled);
      } else {
        fieldsSkipped.push('Discharge Type - Radio not found');
      }
    }

    // Discharge Date
    const dischargeDateInput = await page.locator('input[type="date"][id*="dischargeDate"], input[type="date"][name*="dischargeDate"]').first();
    if (await dischargeDateInput.isVisible()) {
      await dischargeDateInput.fill('2019-06-30');
      await logFieldAction('Discharge Date', '06/30/2019', 'date', fieldsFilled);
    } else {
      fieldsSkipped.push('Discharge Date - Input not found');
    }

    // Current Status (if available)
    const currentStatusSelect = await page.locator('select[id*="currentStatus"], select[name*="currentStatus"]').first();
    if (await currentStatusSelect.isVisible()) {
      await currentStatusSelect.selectOption({ label: 'Separated' });
      await logFieldAction('Current Status', 'Separated', 'dropdown', fieldsFilled);
    }

    // Step 4: Check for Additional Fields and Checkboxes
    console.log('\n📋 Step 4: Checking for Additional Fields and Checkboxes');

    // Check all visible checkboxes that might be relevant
    const allCheckboxes = await page.locator('input[type="checkbox"]:visible');
    const checkboxCount = await allCheckboxes.count();
    console.log(`Found ${checkboxCount} visible checkboxes`);
    
    for (let i = 0; i < checkboxCount; i++) {
      const checkbox = allCheckboxes.nth(i);
      const label = await checkbox.locator('xpath=..').textContent().catch(() => '');
      if (label && !await checkbox.isChecked()) {
        // Only check specific relevant checkboxes
        if (label.toLowerCase().includes('active') || 
            label.toLowerCase().includes('reserve') || 
            label.toLowerCase().includes('guard')) {
          await checkbox.check();
          await logFieldAction(`Checkbox: ${label.trim()}`, 'Checked', 'checkbox', fieldsFilled);
        }
      }
    }

    // Step 5: Fill any additional text fields
    console.log('\n📋 Step 5: Checking for Additional Text Fields');

    // Look for any unit/organization fields
    const unitInput = await page.locator('input[placeholder*="unit" i], input[id*="unit"], input[name*="unit"]').first();
    if (await unitInput.isVisible()) {
      await unitInput.fill('1st Infantry Division');
      await logFieldAction('Unit/Organization', '1st Infantry Division', 'text', fieldsFilled);
    }

    // Look for rank fields
    const rankInput = await page.locator('input[placeholder*="rank" i], input[id*="rank"], input[name*="rank"]').first();
    if (await rankInput.isVisible()) {
      await rankInput.fill('Captain');
      await logFieldAction('Rank', 'Captain', 'text', fieldsFilled);
    }

    // Look for highest rank/position fields in entries
    const highestRankInputs = await page.locator('input[placeholder*="highest" i]');
    const highestRankCount = await highestRankInputs.count();
    for (let i = 0; i < highestRankCount; i++) {
      const input = highestRankInputs.nth(i);
      if (await input.isVisible()) {
        await input.fill('Captain');
        await logFieldAction(`Highest Rank/Position ${i + 1}`, 'Captain', 'text', fieldsFilled);
      }
    }

    // Check for date estimate checkboxes
    const dateEstimateCheckboxes = await page.locator('input[type="checkbox"]').filter({ hasText: 'Estimated' });
    const estimateCount = await dateEstimateCheckboxes.count();
    for (let i = 0; i < estimateCount; i++) {
      const checkbox = dateEstimateCheckboxes.nth(i);
      const label = await checkbox.locator('xpath=..').textContent().catch(() => '');
      if (label && label.includes('From Date')) {
        await checkbox.check();
        await logFieldAction('From Date Estimated', 'Checked', 'checkbox', fieldsFilled);
      }
    }

    // Step 6: Disciplinary Actions Section
    console.log('\n📋 Step 6: Disciplinary Actions Section');
    const disciplinaryRadio = await page.locator('input[name="hasDisciplinaryAction"][value="NO"]');
    if (await disciplinaryRadio.isVisible()) {
      await disciplinaryRadio.click();
      await logFieldAction('Has Disciplinary Action', 'NO', 'radio', fieldsFilled);
    }

    // Step 7: Foreign Military Service Section
    console.log('\n📋 Step 7: Foreign Military Service Section');
    const foreignMilitaryRadio = await page.locator('input[name="hasServedInForeignMilitary"][value="NO"]');
    if (await foreignMilitaryRadio.isVisible()) {
      await foreignMilitaryRadio.click();
      await logFieldAction('Has Foreign Military Service', 'NO', 'radio', fieldsFilled);
    }

    // Take screenshot after filling
    await page.screenshot({ 
      path: 'tests/section15/screenshots/section15-after-filling.png',
      fullPage: true 
    });

    // Calculate and report field coverage
    const { percentage, summary } = calculateFieldCoverage(fieldsFilled, fieldsSkipped);
    
    console.log('\n' + '='.repeat(50));
    console.log('📊 FIELD COVERAGE REPORT');
    console.log('='.repeat(50));
    console.log(`✅ Fields Successfully Filled: ${fieldsFilled.length}`);
    console.log(`❌ Fields Skipped/Not Found: ${fieldsSkipped.length}`);
    console.log(`📈 Coverage Percentage: ${percentage}%`);
    console.log(`⏱️  Test Duration: ${Date.now() - testStartTime}ms`);
    console.log('='.repeat(50));

    if (fieldsFilled.length > 0) {
      console.log('\n✅ FIELDS FILLED:');
      fieldsFilled.forEach((field, index) => {
        console.log(`  ${index + 1}. ${field}`);
      });
    }

    if (fieldsSkipped.length > 0) {
      console.log('\n❌ FIELDS SKIPPED:');
      fieldsSkipped.forEach((field, index) => {
        console.log(`  ${index + 1}. ${field}`);
      });
    }

    console.log('\n' + summary);

    // Validate that key fields were filled
    expect(fieldsFilled.length).toBeGreaterThan(0);
    expect(percentage).toBeGreaterThan(70); // Expect at least 70% coverage
    
    // Verify critical fields were filled
    const criticalFields = [
      'Has Served in Military',
      'Branch of Service',
      'Service From Date',
      'Service To Date',
      'Service Number'
    ];
    
    const filledFieldNames = fieldsFilled.map(f => f.split(':')[0].trim());
    const missingCriticalFields = criticalFields.filter(
      field => !filledFieldNames.some(filled => filled.includes(field))
    );
    
    if (missingCriticalFields.length > 0) {
      console.log('\n⚠️  WARNING: Some critical fields were not filled:');
      missingCriticalFields.forEach(field => console.log(`  - ${field}`));
    }
    
    expect(missingCriticalFields.length).toBe(0);
  });
});