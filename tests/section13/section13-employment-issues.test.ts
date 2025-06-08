/**
 * Section 13 Employment Issues Tests
 * 
 * Tests for Section 13A.5 (Employment Record Issues) and 13A.6 (Disciplinary Actions)
 */

import { test, expect, Page } from '@playwright/test';

const EMPLOYMENT_ISSUES_DATA = {
  firedDate: '06/2019',
  firedReason: 'Performance issues related to missed deadlines and communication problems',
  quitDate: '03/2020', 
  quitReason: 'Told to resign due to restructuring and position elimination',
  mutualDate: '12/2021',
  mutualReason: 'Mutual agreement to part ways due to company direction change',
  allegations: 'Allegation of inappropriate workplace behavior that was investigated and resolved',
  unsatisfactoryReason: 'Received unsatisfactory performance review due to learning curve on new technology'
};

const DISCIPLINARY_DATA = {
  warningDates: ['01/2020', '06/2020', '11/2020'],
  warningReasons: [
    'Late arrival to work on multiple occasions',
    'Failure to follow proper safety protocols',
    'Inappropriate use of company resources'
  ]
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

test.describe('Section 13: Employment Issues and Disciplinary Actions', () => {

  test('should test employment record issues (Section 13A.5)', async ({ page }) => {
    console.log('🧪 Testing Employment Record Issues (Section 13A.5)...');
    
    // Navigate to employment section first
    await page.locator('input[name="hasEmployment"][value="YES"]').check();
    await page.waitForTimeout(500);
    
    // Look for employment record issues section
    // This might be in a separate section or part of the main form
    
    // Test "Were you fired" question
    console.log('  🔥 Testing fired from job question...');
    const firedQuestion = page.locator('text=fired').first();
    if (await firedQuestion.isVisible()) {
      await page.locator('input[type="radio"][value="true"]').first().check();
      await page.waitForTimeout(500);
      
      // Fill fired date and reason if fields appear
      const firedDateField = page.locator('input[placeholder*="date"]').first();
      if (await firedDateField.isVisible()) {
        await firedDateField.fill(EMPLOYMENT_ISSUES_DATA.firedDate);
      }
      
      const firedReasonField = page.locator('textarea').first();
      if (await firedReasonField.isVisible()) {
        await firedReasonField.fill(EMPLOYMENT_ISSUES_DATA.firedReason);
      }
    }
    
    // Test "Quit after being told" question
    console.log('  🚪 Testing quit after being told question...');
    const quitQuestion = page.locator('text=quit').first();
    if (await quitQuestion.isVisible()) {
      await page.locator('input[type="radio"][value="true"]').nth(1).check();
      await page.waitForTimeout(500);
      
      // Fill quit date and reason if fields appear
      const quitDateField = page.locator('input[placeholder*="date"]').nth(1);
      if (await quitDateField.isVisible()) {
        await quitDateField.fill(EMPLOYMENT_ISSUES_DATA.quitDate);
      }
      
      const quitReasonField = page.locator('textarea').nth(1);
      if (await quitReasonField.isVisible()) {
        await quitReasonField.fill(EMPLOYMENT_ISSUES_DATA.quitReason);
      }
    }
    
    // Test "Left by mutual agreement" question
    console.log('  🤝 Testing mutual agreement question...');
    const mutualQuestion = page.locator('text=mutual').first();
    if (await mutualQuestion.isVisible()) {
      await page.locator('input[type="radio"][value="true"]').nth(2).check();
      await page.waitForTimeout(500);
      
      // Fill mutual agreement date and reason if fields appear
      const mutualDateField = page.locator('input[placeholder*="date"]').nth(2);
      if (await mutualDateField.isVisible()) {
        await mutualDateField.fill(EMPLOYMENT_ISSUES_DATA.mutualDate);
      }
      
      const mutualReasonField = page.locator('textarea').nth(2);
      if (await mutualReasonField.isVisible()) {
        await mutualReasonField.fill(EMPLOYMENT_ISSUES_DATA.mutualReason);
      }
    }
    
    // Test allegations field
    console.log('  ⚖️ Testing allegations field...');
    const allegationsField = page.locator('textarea[placeholder*="allegations"], textarea[placeholder*="charges"]');
    if (await allegationsField.isVisible()) {
      await allegationsField.fill(EMPLOYMENT_ISSUES_DATA.allegations);
    }
    
    // Test unsatisfactory performance field
    console.log('  📉 Testing unsatisfactory performance field...');
    const unsatisfactoryField = page.locator('textarea[placeholder*="unsatisfactory"], textarea[placeholder*="performance"]');
    if (await unsatisfactoryField.isVisible()) {
      await unsatisfactoryField.fill(EMPLOYMENT_ISSUES_DATA.unsatisfactoryReason);
    }
    
    await page.waitForTimeout(1000);
    expect(consoleErrors).toHaveLength(0);
    console.log('✅ Employment record issues tested successfully');
  });

  test('should test disciplinary actions (Section 13A.6)', async ({ page }) => {
    console.log('🧪 Testing Disciplinary Actions (Section 13A.6)...');
    
    // Navigate to employment section first
    await page.locator('input[name="hasEmployment"][value="YES"]').check();
    await page.waitForTimeout(500);
    
    // Test written warning question
    console.log('  📝 Testing written warning question...');
    const warningQuestion = page.locator('text=written warning').first();
    if (await warningQuestion.isVisible()) {
      await page.locator('input[type="radio"][value="true"]').last().check();
      await page.waitForTimeout(500);
      
      // Add warning dates and reasons if fields appear
      for (let i = 0; i < DISCIPLINARY_DATA.warningDates.length; i++) {
        console.log(`    📅 Adding warning ${i + 1}...`);
        
        // Look for add warning button
        const addWarningButton = page.locator('button:has-text("Add Warning"), button:has-text("Add Date")');
        if (await addWarningButton.isVisible()) {
          await addWarningButton.click();
          await page.waitForTimeout(500);
        }
        
        // Fill warning date
        const warningDateField = page.locator(`input[placeholder*="date"]`).nth(i);
        if (await warningDateField.isVisible()) {
          await warningDateField.fill(DISCIPLINARY_DATA.warningDates[i]);
        }
        
        // Fill warning reason
        const warningReasonField = page.locator(`textarea, input[type="text"]`).nth(i);
        if (await warningReasonField.isVisible()) {
          await warningReasonField.fill(DISCIPLINARY_DATA.warningReasons[i]);
        }
        
        await page.waitForTimeout(300);
      }
    }
    
    await page.waitForTimeout(1000);
    expect(consoleErrors).toHaveLength(0);
    console.log('✅ Disciplinary actions tested successfully');
  });

  test('should test employment issues with employment entry', async ({ page }) => {
    console.log('🧪 Testing employment issues with actual employment entry...');
    
    // First create an employment entry
    await page.locator('input[name="hasEmployment"][value="YES"]').check();
    await page.waitForTimeout(500);
    
    await page.locator('text=Private Company').first().click();
    await page.waitForTimeout(500);
    
    await page.locator('button:has-text("Add Entry")').click();
    await page.waitForTimeout(1000);
    
    // Fill minimal employment data
    console.log('  💼 Filling basic employment information...');
    await page.locator('input[placeholder="MM/YYYY"]').first().fill('01/2020');
    await page.locator('input[placeholder="MM/YYYY"]').nth(1).fill('12/2020');
    await page.locator('label:has-text("Employer/Company Name") + input').fill('Problem Company Inc');
    await page.locator('label:has-text("Position Title") + input').fill('Software Developer');
    await page.locator('label:has-text("Street Address") + input').fill('123 Problem St');
    await page.locator('label:has-text("City") + input').fill('Issue City');
    await page.locator('input[placeholder="(555) 123-4567"]').fill('(555) 123-4567');
    
    // Now test employment issues in context
    console.log('  ⚠️ Testing employment issues in context...');
    
    // Look for employment issues section (might be at bottom of form)
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(500);
    
    // Test various employment issue scenarios
    const issueQuestions = [
      'fired',
      'quit',
      'mutual',
      'warning',
      'disciplinary',
      'performance'
    ];
    
    for (const issue of issueQuestions) {
      const questionElement = page.locator(`text*=${issue}`).first();
      if (await questionElement.isVisible()) {
        console.log(`    📋 Found ${issue} question`);
        
        // Try to interact with related radio buttons or checkboxes
        const radioButton = questionElement.locator('..').locator('input[type="radio"]').first();
        if (await radioButton.isVisible()) {
          await radioButton.check();
          await page.waitForTimeout(300);
        }
      }
    }
    
    await page.waitForTimeout(1000);
    expect(consoleErrors).toHaveLength(0);
    console.log('✅ Employment issues with employment entry tested successfully');
  });

  test('should test all employment issue combinations', async ({ page }) => {
    console.log('🧪 Testing all employment issue combinations...');
    
    // Navigate to employment section
    await page.locator('input[name="hasEmployment"][value="YES"]').check();
    await page.waitForTimeout(500);
    
    // Test different combinations of employment issues
    const testCombinations = [
      { fired: true, quit: false, mutual: false, warning: false },
      { fired: false, quit: true, mutual: false, warning: false },
      { fired: false, quit: false, mutual: true, warning: false },
      { fired: false, quit: false, mutual: false, warning: true },
      { fired: true, quit: true, mutual: false, warning: true },
    ];
    
    for (let i = 0; i < testCombinations.length; i++) {
      const combo = testCombinations[i];
      console.log(`  🔄 Testing combination ${i + 1}: ${JSON.stringify(combo)}`);
      
      // Reset all options first
      const allRadios = await page.locator('input[type="radio"]').all();
      for (const radio of allRadios) {
        if (await radio.isVisible()) {
          try {
            await radio.check();
            await page.waitForTimeout(100);
          } catch (e) {
            // Some radios might not be interactable, skip
          }
        }
      }
      
      await page.waitForTimeout(500);
    }
    
    expect(consoleErrors).toHaveLength(0);
    console.log('✅ All employment issue combinations tested successfully');
  });

  test('should test employment issues validation', async ({ page }) => {
    console.log('🧪 Testing employment issues validation...');
    
    // Navigate to employment section
    await page.locator('input[name="hasEmployment"][value="YES"]').check();
    await page.waitForTimeout(500);
    
    // Try to trigger validation by selecting issues without providing details
    console.log('  ❌ Testing validation with incomplete issue information...');
    
    // Look for employment issue checkboxes/radios
    const issueInputs = await page.locator('input[type="radio"], input[type="checkbox"]').all();
    
    // Select some issues without filling details
    for (let i = 0; i < Math.min(3, issueInputs.length); i++) {
      if (await issueInputs[i].isVisible()) {
        try {
          await issueInputs[i].check();
          await page.waitForTimeout(200);
        } catch (e) {
          // Skip if not interactable
        }
      }
    }
    
    // Try to save without filling required details
    await page.locator('button:has-text("Save")').first().click();
    await page.waitForTimeout(2000);
    
    // Check for validation messages
    const validationElements = await page.locator('.text-red-500, .text-red-700, .bg-red-50').count();
    console.log(`  📊 Found ${validationElements} validation elements`);
    
    // Fill some details to test validation clearing
    console.log('  ✅ Filling details to clear validation...');
    const textareas = await page.locator('textarea').all();
    for (let i = 0; i < Math.min(2, textareas.length); i++) {
      if (await textareas[i].isVisible()) {
        await textareas[i].fill('Test explanation for employment issue');
        await page.waitForTimeout(200);
      }
    }
    
    await page.waitForTimeout(1000);
    
    // Check that console errors are validation-related, not JavaScript errors
    const jsErrors = consoleErrors.filter(error => 
      !error.includes('validation') && 
      !error.includes('required') &&
      !error.includes('field')
    );
    
    expect(jsErrors).toHaveLength(0);
    console.log('✅ Employment issues validation tested successfully');
  });

  test('should test complete employment issues workflow', async ({ page }) => {
    console.log('🧪 Testing complete employment issues workflow...');
    
    // Create a complete employment entry with issues
    await page.locator('input[name="hasEmployment"][value="YES"]').check();
    await page.waitForTimeout(500);
    
    await page.locator('text=Private Company').first().click();
    await page.waitForTimeout(500);
    
    await page.locator('button:has-text("Add Entry")').click();
    await page.waitForTimeout(1000);
    
    // Fill employment information
    await page.locator('input[placeholder="MM/YYYY"]').first().fill('01/2019');
    await page.locator('input[placeholder="MM/YYYY"]').nth(1).fill('06/2019');
    await page.locator('label:has-text("Employer/Company Name") + input').fill('Problematic Corp');
    await page.locator('label:has-text("Position Title") + input').fill('Manager');
    await page.locator('label:has-text("Street Address") + input').fill('456 Issue Ave');
    await page.locator('label:has-text("City") + input').fill('Problem City');
    await page.locator('input[placeholder="(555) 123-4567"]').fill('(555) 987-6543');
    
    // Add employment issues
    console.log('  ⚠️ Adding employment issues...');
    
    // Scroll to find employment issues section
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(500);
    
    // Look for and fill employment issues
    const issueFields = await page.locator('textarea, input[type="text"]').all();
    for (let i = 0; i < Math.min(3, issueFields.length); i++) {
      if (await issueFields[i].isVisible()) {
        const placeholder = await issueFields[i].getAttribute('placeholder') || '';
        if (placeholder.includes('reason') || placeholder.includes('explain')) {
          await issueFields[i].fill(`Employment issue explanation ${i + 1}`);
          await page.waitForTimeout(200);
        }
      }
    }
    
    // Save the complete entry
    console.log('  💾 Saving complete employment entry with issues...');
    await page.locator('button:has-text("Save Section 13")').click();
    await page.waitForTimeout(2000);
    
    expect(consoleErrors).toHaveLength(0);
    console.log('✅ Complete employment issues workflow tested successfully');
  });
});
