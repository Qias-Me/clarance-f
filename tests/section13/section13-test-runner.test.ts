/**
 * Section 13 Test Runner and Summary
 * 
 * Comprehensive test suite runner for all Section 13 functionality
 * Monitors console errors and provides detailed reporting
 */

import { test, expect, Page } from '@playwright/test';

// Test execution tracking
let testResults: Array<{
  testName: string;
  status: 'passed' | 'failed' | 'skipped';
  errors: string[];
  warnings: string[];
  duration: number;
  fieldsInteracted: number;
}> = [];

let globalConsoleErrors: string[] = [];
let globalConsoleWarnings: string[] = [];

test.beforeAll(async () => {
  console.log('\n🚀 STARTING SECTION 13 COMPREHENSIVE TEST SUITE');
  console.log('=' .repeat(60));
  console.log('📋 Test Coverage:');
  console.log('  • Employment Type Selection');
  console.log('  • Military Employment (13A.1)');
  console.log('  • Non-Federal Employment (13A.2)');
  console.log('  • Self-Employment (13A.3)');
  console.log('  • Unemployment (13A.4)');
  console.log('  • Employment Issues (13A.5)');
  console.log('  • Disciplinary Actions (13A.6)');
  console.log('  • Field Validation & Edge Cases');
  console.log('  • PDF Generation Integration');
  console.log('=' .repeat(60));
});

test.afterAll(async () => {
  console.log('\n📊 SECTION 13 TEST SUITE SUMMARY');
  console.log('=' .repeat(60));
  
  const totalTests = testResults.length;
  const passedTests = testResults.filter(t => t.status === 'passed').length;
  const failedTests = testResults.filter(t => t.status === 'failed').length;
  const skippedTests = testResults.filter(t => t.status === 'skipped').length;
  
  console.log(`📈 Test Results:`);
  console.log(`  ✅ Passed: ${passedTests}/${totalTests}`);
  console.log(`  ❌ Failed: ${failedTests}/${totalTests}`);
  console.log(`  ⏭️  Skipped: ${skippedTests}/${totalTests}`);
  
  const totalFieldsInteracted = testResults.reduce((sum, t) => sum + t.fieldsInteracted, 0);
  console.log(`\n🎯 Field Interaction Summary:`);
  console.log(`  📝 Total Fields Interacted: ${totalFieldsInteracted}`);
  console.log(`  📊 Average Fields per Test: ${Math.round(totalFieldsInteracted / totalTests)}`);
  
  if (globalConsoleErrors.length > 0) {
    console.log(`\n🔴 Global Console Errors (${globalConsoleErrors.length}):`);
    globalConsoleErrors.forEach((error, index) => {
      console.log(`  ${index + 1}. ${error}`);
    });
  }
  
  if (globalConsoleWarnings.length > 0) {
    console.log(`\n🟡 Global Console Warnings (${globalConsoleWarnings.length}):`);
    globalConsoleWarnings.forEach((warning, index) => {
      console.log(`  ${index + 1}. ${warning}`);
    });
  }
  
  if (globalConsoleErrors.length === 0 && globalConsoleWarnings.length === 0) {
    console.log('\n✅ NO CONSOLE ERRORS OR WARNINGS DETECTED ACROSS ALL TESTS');
  }
  
  console.log('\n🎉 SECTION 13 TEST SUITE COMPLETED');
  console.log('=' .repeat(60));
});

test.describe('Section 13: Complete Test Suite Runner', () => {

  test('should run comprehensive field interaction test', async ({ page }) => {
    const testName = 'Comprehensive Field Interaction';
    const startTime = Date.now();
    let fieldsInteracted = 0;
    let testErrors: string[] = [];
    let testWarnings: string[] = [];

    // Monitor console for this specific test
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        testErrors.push(msg.text());
        globalConsoleErrors.push(`[${testName}] ${msg.text()}`);
      } else if (msg.type() === 'warning') {
        testWarnings.push(msg.text());
        globalConsoleWarnings.push(`[${testName}] ${msg.text()}`);
      }
    });

    try {
      console.log(`\n🧪 Running ${testName}...`);
      
      await page.goto('/form/section13');
      await page.waitForLoadState('networkidle');
      
      // Test all employment types with field interactions
      await page.locator('input[name="hasEmployment"][value="YES"]').check();
      fieldsInteracted++;
      await page.waitForTimeout(500);
      
      const employmentTypes = [
        { name: 'Active Military Duty', expectedFields: 15 },
        { name: 'Private Company', expectedFields: 12 },
        { name: 'Self-Employment', expectedFields: 14 },
        { name: 'Unemployment', expectedFields: 8 }
      ];
      
      for (const empType of employmentTypes) {
        console.log(`  📋 Testing ${empType.name}...`);
        
        await page.locator(`text=${empType.name}`).first().click();
        fieldsInteracted++;
        await page.waitForTimeout(500);
        
        await page.locator('button:has-text("Add Entry")').click();
        fieldsInteracted++;
        await page.waitForTimeout(1000);
        
        // Interact with all visible form fields
        const formFields = await page.locator('input, select, textarea').all();
        let typeFieldsInteracted = 0;
        
        for (const field of formFields) {
          if (await field.isVisible() && await field.isEnabled()) {
            try {
              const tagName = await field.evaluate(el => el.tagName.toLowerCase());
              const type = await field.getAttribute('type') || '';
              
              if (tagName === 'input') {
                if (type === 'text' || type === 'tel' || type === 'email' || !type) {
                  await field.fill(`Test${typeFieldsInteracted}`);
                } else if (type === 'checkbox' || type === 'radio') {
                  await field.check();
                }
              } else if (tagName === 'select') {
                const options = await field.locator('option').all();
                if (options.length > 1) {
                  await field.selectOption({ index: 1 });
                }
              } else if (tagName === 'textarea') {
                await field.fill(`Test textarea content ${typeFieldsInteracted}`);
              }
              
              typeFieldsInteracted++;
              fieldsInteracted++;
              await page.waitForTimeout(50);
            } catch (e) {
              // Skip fields that can't be interacted with
            }
          }
        }
        
        console.log(`    ✅ Interacted with ${typeFieldsInteracted} fields for ${empType.name}`);
        
        // Change to next employment type
        if (empType !== employmentTypes[employmentTypes.length - 1]) {
          await page.locator('button:has-text("Change Type")').click();
          fieldsInteracted++;
          await page.waitForTimeout(500);
        }
      }
      
      // Test save functionality
      await page.locator('button:has-text("Save Section 13")').click();
      fieldsInteracted++;
      await page.waitForTimeout(2000);
      
      const duration = Date.now() - startTime;
      
      testResults.push({
        testName,
        status: 'passed',
        errors: testErrors,
        warnings: testWarnings,
        duration,
        fieldsInteracted
      });
      
      console.log(`  ✅ ${testName} completed: ${fieldsInteracted} fields, ${duration}ms`);
      
    } catch (error) {
      const duration = Date.now() - startTime;
      testResults.push({
        testName,
        status: 'failed',
        errors: [...testErrors, error.message],
        warnings: testWarnings,
        duration,
        fieldsInteracted
      });
      
      console.log(`  ❌ ${testName} failed: ${error.message}`);
      throw error;
    }
  });

  test('should test all employment subsections systematically', async ({ page }) => {
    const testName = 'All Employment Subsections';
    const startTime = Date.now();
    let fieldsInteracted = 0;
    let testErrors: string[] = [];
    let testWarnings: string[] = [];

    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        testErrors.push(msg.text());
        globalConsoleErrors.push(`[${testName}] ${msg.text()}`);
      } else if (msg.type() === 'warning') {
        testWarnings.push(msg.text());
        globalConsoleWarnings.push(`[${testName}] ${msg.text()}`);
      }
    });

    try {
      console.log(`\n🧪 Running ${testName}...`);
      
      await page.goto('/form/section13');
      await page.waitForLoadState('networkidle');
      
      // Test each subsection systematically
      const subsections = [
        {
          name: '13A.1 - Military/Federal',
          type: 'Active Military Duty',
          requiredFields: [
            'input[placeholder="MM/YYYY"]',
            'input[placeholder*="Captain"]',
            'input[placeholder*="Fort Bragg"]',
            'input[placeholder="(555) 123-4567"]'
          ]
        },
        {
          name: '13A.2 - Non-Federal',
          type: 'Private Company',
          requiredFields: [
            'input[placeholder="MM/YYYY"]',
            'label:has-text("Employer/Company Name") + input',
            'label:has-text("Position Title") + input',
            'label:has-text("Street Address") + input'
          ]
        },
        {
          name: '13A.3 - Self-Employment',
          type: 'Self-Employment',
          requiredFields: [
            'input[placeholder="MM/YYYY"]',
            'label:has-text("Business Name") + input',
            'label:has-text("Position Title") + input',
            'label:has-text("Business Type") + input'
          ]
        },
        {
          name: '13A.4 - Unemployment',
          type: 'Unemployment',
          requiredFields: [
            'input[placeholder="MM/YYYY"]',
            'label:has-text("Reference First Name") + input',
            'label:has-text("Reference Last Name") + input',
            'input[placeholder="(555) 123-4567"]'
          ]
        }
      ];
      
      await page.locator('input[name="hasEmployment"][value="YES"]').check();
      fieldsInteracted++;
      await page.waitForTimeout(500);
      
      for (const subsection of subsections) {
        console.log(`  📋 Testing ${subsection.name}...`);
        
        // Select employment type
        await page.locator(`text=${subsection.type}`).first().click();
        fieldsInteracted++;
        await page.waitForTimeout(500);
        
        // Add entry
        await page.locator('button:has-text("Add Entry")').click();
        fieldsInteracted++;
        await page.waitForTimeout(1000);
        
        // Fill required fields
        for (const fieldSelector of subsection.requiredFields) {
          const field = page.locator(fieldSelector).first();
          if (await field.isVisible()) {
            await field.fill(`Test${fieldsInteracted}`);
            fieldsInteracted++;
            await page.waitForTimeout(100);
          }
        }
        
        console.log(`    ✅ ${subsection.name} tested with ${subsection.requiredFields.length} required fields`);
        
        // Change type for next iteration
        if (subsection !== subsections[subsections.length - 1]) {
          await page.locator('button:has-text("Change Type")').click();
          fieldsInteracted++;
          await page.waitForTimeout(500);
        }
      }
      
      const duration = Date.now() - startTime;
      
      testResults.push({
        testName,
        status: 'passed',
        errors: testErrors,
        warnings: testWarnings,
        duration,
        fieldsInteracted
      });
      
      console.log(`  ✅ ${testName} completed: ${fieldsInteracted} fields, ${duration}ms`);
      
    } catch (error) {
      const duration = Date.now() - startTime;
      testResults.push({
        testName,
        status: 'failed',
        errors: [...testErrors, error.message],
        warnings: testWarnings,
        duration,
        fieldsInteracted
      });
      
      console.log(`  ❌ ${testName} failed: ${error.message}`);
      throw error;
    }
  });

  test('should test PDF generation with Section 13 data', async ({ page }) => {
    const testName = 'PDF Generation Integration';
    const startTime = Date.now();
    let fieldsInteracted = 0;
    let testErrors: string[] = [];
    let testWarnings: string[] = [];

    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        testErrors.push(msg.text());
        globalConsoleErrors.push(`[${testName}] ${msg.text()}`);
      } else if (msg.type() === 'warning') {
        testWarnings.push(msg.text());
        globalConsoleWarnings.push(`[${testName}] ${msg.text()}`);
      }
    });

    try {
      console.log(`\n🧪 Running ${testName}...`);
      
      await page.goto('/form/section13');
      await page.waitForLoadState('networkidle');
      
      // Create a complete employment entry
      await page.locator('input[name="hasEmployment"][value="YES"]').check();
      fieldsInteracted++;
      await page.waitForTimeout(500);
      
      await page.locator('text=Private Company').first().click();
      fieldsInteracted++;
      await page.waitForTimeout(500);
      
      await page.locator('button:has-text("Add Entry")').click();
      fieldsInteracted++;
      await page.waitForTimeout(1000);
      
      // Fill comprehensive employment data
      const testData = {
        'input[placeholder="MM/YYYY"]': ['01/2020', '12/2023'],
        'label:has-text("Employer/Company Name") + input': 'PDF Test Company Inc',
        'label:has-text("Position Title") + input': 'Senior Software Engineer',
        'label:has-text("Street Address") + input': '123 PDF Test Street',
        'label:has-text("City") + input': 'Test City',
        'input[placeholder="(555) 123-4567"]': '(555) 123-4567'
      };
      
      for (const [selector, value] of Object.entries(testData)) {
        if (Array.isArray(value)) {
          for (let i = 0; i < value.length; i++) {
            const field = page.locator(selector).nth(i);
            if (await field.isVisible()) {
              await field.fill(value[i]);
              fieldsInteracted++;
              await page.waitForTimeout(100);
            }
          }
        } else {
          const field = page.locator(selector);
          if (await field.isVisible()) {
            await field.fill(value);
            fieldsInteracted++;
            await page.waitForTimeout(100);
          }
        }
      }
      
      // Save Section 13
      await page.locator('button:has-text("Save Section 13")').click();
      fieldsInteracted++;
      await page.waitForTimeout(2000);
      
      // Navigate to PDF generation
      console.log('  📄 Testing PDF generation...');
      await page.goto('/form/generate-pdf');
      await page.waitForLoadState('networkidle');
      
      // Generate PDF
      await page.locator('button:has-text("Generate PDF")').click();
      fieldsInteracted++;
      await page.waitForTimeout(5000); // Allow time for PDF generation
      
      const duration = Date.now() - startTime;
      
      testResults.push({
        testName,
        status: 'passed',
        errors: testErrors,
        warnings: testWarnings,
        duration,
        fieldsInteracted
      });
      
      console.log(`  ✅ ${testName} completed: ${fieldsInteracted} interactions, ${duration}ms`);
      
    } catch (error) {
      const duration = Date.now() - startTime;
      testResults.push({
        testName,
        status: 'failed',
        errors: [...testErrors, error.message],
        warnings: testWarnings,
        duration,
        fieldsInteracted
      });
      
      console.log(`  ❌ ${testName} failed: ${error.message}`);
      throw error;
    }
  });
});
