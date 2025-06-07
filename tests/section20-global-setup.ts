/**
 * Section 20 Global Test Setup
 * 
 * Prepares the test environment for comprehensive Section 20 testing
 */

import { chromium, FullConfig } from '@playwright/test';
import fs from 'fs';
import path from 'path';

async function globalSetup(config: FullConfig) {
  console.log('🚀 Setting up Section 20 comprehensive test environment...');
  
  // Create test results directory
  const testResultsDir = 'test-results';
  if (!fs.existsSync(testResultsDir)) {
    fs.mkdirSync(testResultsDir, { recursive: true });
  }
  
  // Load Section 20 field data
  const section20DataPath = 'api/sections-references/section-20.json';
  if (!fs.existsSync(section20DataPath)) {
    throw new Error(`Section 20 data file not found: ${section20DataPath}`);
  }
  
  const section20Data = JSON.parse(fs.readFileSync(section20DataPath, 'utf8'));
  console.log(`📊 Loaded ${section20Data.metadata.totalFields} fields for testing`);
  
  // Validate field data structure
  if (!section20Data.fields || !Array.isArray(section20Data.fields)) {
    throw new Error('Invalid Section 20 data structure');
  }
  
  // Group fields by type for test planning
  const fieldsByType = {
    PDFTextField: section20Data.fields.filter((f: any) => f.type === 'PDFTextField'),
    PDFCheckBox: section20Data.fields.filter((f: any) => f.type === 'PDFCheckBox'),
    PDFRadioGroup: section20Data.fields.filter((f: any) => f.type === 'PDFRadioGroup'),
    PDFDropdown: section20Data.fields.filter((f: any) => f.type === 'PDFDropdown')
  };
  
  console.log('📋 Field distribution:');
  console.log(`   - Text fields: ${fieldsByType.PDFTextField.length}`);
  console.log(`   - Checkboxes: ${fieldsByType.PDFCheckBox.length}`);
  console.log(`   - Radio groups: ${fieldsByType.PDFRadioGroup.length}`);
  console.log(`   - Dropdowns: ${fieldsByType.PDFDropdown.length}`);
  
  // Create test plan file
  const testPlan = {
    metadata: {
      totalFields: section20Data.metadata.totalFields,
      testStartTime: new Date().toISOString(),
      fieldDistribution: fieldsByType,
      testStrategy: 'comprehensive'
    },
    fieldsByType,
    testTargets: {
      textFieldTests: fieldsByType.PDFTextField.length,
      checkboxTests: fieldsByType.PDFCheckBox.length,
      radioGroupTests: fieldsByType.PDFRadioGroup.length,
      dropdownTests: fieldsByType.PDFDropdown.length,
      totalTests: Object.values(fieldsByType).reduce((sum, fields) => sum + fields.length, 0)
    }
  };
  
  fs.writeFileSync(
    path.join(testResultsDir, 'section20-test-plan.json'),
    JSON.stringify(testPlan, null, 2)
  );
  
  // Launch browser for environment verification
  console.log('🌐 Verifying test environment...');
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();
  
  try {
    // Check if application is accessible
    const baseURL = config.projects[0].use?.baseURL || 'http://localhost:3000';
    await page.goto(`${baseURL}/form/section/20`, { timeout: 30000 });
    
    // Verify Section 20 page loads
    await page.waitForSelector('h1, h2, h3', { timeout: 10000 });
    const pageTitle = await page.textContent('h1, h2, h3');
    
    if (!pageTitle?.toLowerCase().includes('section 20') && !pageTitle?.toLowerCase().includes('foreign')) {
      console.warn('⚠️ Warning: Section 20 page may not be loading correctly');
    } else {
      console.log('✅ Section 20 page verified');
    }
    
    // Check for required test elements
    const requiredElements = [
      '[data-testid="foreign-financial-interests-yes"]',
      '[data-testid="foreign-business-activities-yes"]',
      '[data-testid="foreign-travel-yes"]'
    ];
    
    let foundElements = 0;
    for (const selector of requiredElements) {
      try {
        await page.waitForSelector(selector, { timeout: 2000 });
        foundElements++;
      } catch {
        console.warn(`⚠️ Warning: Required element not found: ${selector}`);
      }
    }
    
    console.log(`✅ Found ${foundElements}/${requiredElements.length} required test elements`);
    
    // Test basic form functionality
    try {
      await page.click('[data-testid="foreign-financial-interests-yes"]');
      await page.click('[data-testid="add-financial-interest-entry"]');
      console.log('✅ Basic form functionality verified');
    } catch (error) {
      console.warn('⚠️ Warning: Basic form functionality test failed:', error.message);
    }
    
  } catch (error) {
    console.error('❌ Environment verification failed:', error.message);
    throw new Error(`Test environment setup failed: ${error.message}`);
  } finally {
    await browser.close();
  }
  
  // Create field mapping for test optimization
  const fieldMapping = {
    bySubsection: {
      'Section20a[0]': section20Data.fields.filter((f: any) => f.name.includes('Section20a[0]')),
      'Section20a2[0]': section20Data.fields.filter((f: any) => f.name.includes('Section20a2[0]'))
    },
    byPattern: {
      textFields: fieldsByType.PDFTextField.map((f: any) => ({
        id: f.id,
        name: f.name,
        maxLength: f.maxLength,
        testStrategy: f.name.includes('Date') ? 'date' : f.name.includes('Numeric') ? 'numeric' : 'text'
      })),
      checkboxes: fieldsByType.PDFCheckBox.map((f: any) => ({
        id: f.id,
        name: f.name,
        testStrategy: 'toggle'
      })),
      dropdowns: fieldsByType.PDFDropdown.map((f: any) => ({
        id: f.id,
        name: f.name,
        options: f.options,
        testStrategy: 'select'
      })),
      radioGroups: fieldsByType.PDFRadioGroup.map((f: any) => ({
        id: f.id,
        name: f.name,
        options: f.options,
        testStrategy: 'radio'
      }))
    }
  };
  
  fs.writeFileSync(
    path.join(testResultsDir, 'section20-field-mapping.json'),
    JSON.stringify(fieldMapping, null, 2)
  );
  
  // Initialize test results tracking
  const testResults = {
    startTime: new Date().toISOString(),
    totalFields: section20Data.metadata.totalFields,
    fieldResults: {},
    summary: {
      passed: 0,
      failed: 0,
      skipped: 0,
      total: 0
    }
  };
  
  fs.writeFileSync(
    path.join(testResultsDir, 'section20-test-results.json'),
    JSON.stringify(testResults, null, 2)
  );
  
  console.log('✅ Section 20 test environment setup complete');
  console.log(`📁 Test artifacts will be saved to: ${testResultsDir}`);
  
  return {
    testPlan,
    fieldMapping,
    testResultsDir
  };
}

export default globalSetup;
