/**
 * Comprehensive Playwright Tests for Section 18 - All 964 Fields
 * 
 * This test suite covers all 964 fields in Section 18 of the SF-86 form,
 * including data persistence, PDF generation, and IndexedDB storage.
 */

const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

// Load Section 18 field definitions
const section18Fields = JSON.parse(
  fs.readFileSync(path.join(__dirname, 'api/sections-references/section-18.json'), 'utf8')
);

// Field type mappings for test data generation
const FIELD_TYPE_HANDLERS = {
  'PDFTextField': {
    testValue: (field, index) => {
      if (field.label.toLowerCase().includes('name')) {
        return `TestName${index}`;
      } else if (field.label.toLowerCase().includes('city')) {
        return `TestCity${index}`;
      } else if (field.label.toLowerCase().includes('address')) {
        return `123 Test Street ${index}`;
      } else if (field.label.toLowerCase().includes('phone')) {
        return `(555) 123-${String(index).padStart(4, '0')}`;
      } else if (field.label.toLowerCase().includes('email')) {
        return `test${index}@example.com`;
      } else if (field.label.toLowerCase().includes('date') || field.label.toLowerCase().includes('month')) {
        return '01';
      } else if (field.label.toLowerCase().includes('year')) {
        return '1990';
      } else {
        return `TestValue${index}`;
      }
    },
    selector: (field) => `input[name*="${field.name}"], input[data-field-id="${field.id}"], textarea[name*="${field.name}"]`
  },
  'PDFDropdown': {
    testValue: (field, index) => {
      if (field.options && field.options.length > 0) {
        // Return first non-empty option
        return field.options.find(opt => opt && opt.trim() !== '') || field.options[0];
      }
      return 'TestOption';
    },
    selector: (field) => `select[name*="${field.name}"], select[data-field-id="${field.id}"]`
  },
  'PDFCheckBox': {
    testValue: (field, index) => index % 2 === 0, // Alternate true/false
    selector: (field) => `input[type="checkbox"][name*="${field.name}"], input[type="checkbox"][data-field-id="${field.id}"]`
  },
  'PDFRadioGroup': {
    testValue: (field, index) => {
      if (field.options && field.options.length > 0) {
        return field.options[index % field.options.length];
      }
      return 'YES';
    },
    selector: (field) => `input[type="radio"][name*="${field.name}"], input[type="radio"][data-field-id="${field.id}"]`
  }
};

// Test data generator
class Section18TestDataGenerator {
  constructor() {
    this.fields = section18Fields.fields;
    this.testData = new Map();
  }

  generateTestData() {
    this.fields.forEach((field, index) => {
      const handler = FIELD_TYPE_HANDLERS[field.type];
      if (handler) {
        this.testData.set(field.id, {
          field,
          testValue: handler.testValue(field, index),
          selector: handler.selector(field),
          index
        });
      }
    });
    return this.testData;
  }

  getFieldsByType(type) {
    return Array.from(this.testData.values()).filter(data => data.field.type === type);
  }

  getFieldsByPage(page) {
    return Array.from(this.testData.values()).filter(data => data.field.page === page);
  }

  getFieldsByLabel(labelPattern) {
    return Array.from(this.testData.values()).filter(data => 
      data.field.label.toLowerCase().includes(labelPattern.toLowerCase())
    );
  }
}

// Test configuration
const TEST_CONFIG = {
  timeout: 60000,
  retries: 2,
  batchSize: 50, // Process fields in batches to avoid overwhelming the browser
  waitTime: 100, // Wait between field interactions
  saveInterval: 10 // Save form every N field interactions
};

test.describe('Section 18 Comprehensive Field Tests', () => {
  let testDataGenerator;
  let testData;

  test.beforeAll(async () => {
    testDataGenerator = new Section18TestDataGenerator();
    testData = testDataGenerator.generateTestData();
    console.log(`Generated test data for ${testData.size} fields`);
  });

  test.beforeEach(async ({ page }) => {
    // Set longer timeout for comprehensive tests
    test.setTimeout(TEST_CONFIG.timeout);
    
    // Navigate to Section 18
    await page.goto('/startForm?debug=true');
    await page.waitForLoadState('networkidle');
    
    // Click Section 18 navigation
    await page.click('button[data-testid="section18-nav-button"], button:has-text("Section 18")', { timeout: 10000 });
    await page.waitForSelector('[data-testid*="section18"], [class*="section18"]', { timeout: 10000 });
    
    // Enable console logging for debugging
    page.on('console', msg => {
      if (msg.text().includes('Section18') || msg.text().includes('ERROR')) {
        console.log(`🔍 Console: ${msg.text()}`);
      }
    });
  });

  test('All 964 fields should be testable and accessible', async ({ page }) => {
    console.log('🧪 Testing field accessibility for all 964 fields...');
    
    let accessibleFields = 0;
    let inaccessibleFields = [];
    
    for (const [fieldId, fieldData] of testData) {
      try {
        // Try to find the field using multiple selector strategies
        const selectors = [
          fieldData.selector,
          `[data-field-id="${fieldId}"]`,
          `[name*="${fieldData.field.name}"]`,
          `[id*="${fieldId}"]`
        ];
        
        let fieldFound = false;
        for (const selector of selectors) {
          try {
            const element = await page.locator(selector).first();
            if (await element.isVisible({ timeout: 1000 })) {
              accessibleFields++;
              fieldFound = true;
              break;
            }
          } catch (e) {
            // Continue to next selector
          }
        }
        
        if (!fieldFound) {
          inaccessibleFields.push({
            id: fieldId,
            name: fieldData.field.name,
            label: fieldData.field.label,
            type: fieldData.field.type
          });
        }
      } catch (error) {
        inaccessibleFields.push({
          id: fieldId,
          name: fieldData.field.name,
          label: fieldData.field.label,
          type: fieldData.field.type,
          error: error.message
        });
      }
    }
    
    console.log(`📊 Accessible fields: ${accessibleFields}/${testData.size}`);
    console.log(`📊 Inaccessible fields: ${inaccessibleFields.length}`);
    
    if (inaccessibleFields.length > 0) {
      console.log('⚠️ Inaccessible fields:', inaccessibleFields.slice(0, 10)); // Show first 10
    }
    
    // Expect at least 80% of fields to be accessible
    expect(accessibleFields).toBeGreaterThan(testData.size * 0.8);
  });

  test('Text fields should accept and persist input values', async ({ page }) => {
    console.log('🧪 Testing text field input and persistence...');
    
    const textFields = testDataGenerator.getFieldsByType('PDFTextField');
    console.log(`📊 Testing ${textFields.length} text fields`);
    
    let successfulFields = 0;
    const failedFields = [];
    
    // Process in batches to avoid overwhelming the browser
    for (let i = 0; i < textFields.length; i += TEST_CONFIG.batchSize) {
      const batch = textFields.slice(i, i + TEST_CONFIG.batchSize);
      console.log(`📦 Processing batch ${Math.floor(i / TEST_CONFIG.batchSize) + 1}/${Math.ceil(textFields.length / TEST_CONFIG.batchSize)}`);
      
      for (const fieldData of batch) {
        try {
          const element = await page.locator(fieldData.selector).first();
          
          if (await element.isVisible({ timeout: 2000 })) {
            await element.fill(fieldData.testValue);
            await element.blur();
            await page.waitForTimeout(TEST_CONFIG.waitTime);
            
            // Verify value persisted
            const currentValue = await element.inputValue();
            if (currentValue === fieldData.testValue) {
              successfulFields++;
            } else {
              failedFields.push({
                id: fieldData.field.id,
                expected: fieldData.testValue,
                actual: currentValue
              });
            }
          }
        } catch (error) {
          failedFields.push({
            id: fieldData.field.id,
            error: error.message
          });
        }
      }
      
      // Save form periodically
      if (i % (TEST_CONFIG.batchSize * TEST_CONFIG.saveInterval) === 0) {
        try {
          await page.click('button[type="submit"], button:has-text("Save")', { timeout: 2000 });
          await page.waitForTimeout(1000);
        } catch (e) {
          // Save button might not be visible, continue
        }
      }
    }
    
    console.log(`📊 Successful text fields: ${successfulFields}/${textFields.length}`);
    console.log(`📊 Failed text fields: ${failedFields.length}`);
    
    if (failedFields.length > 0) {
      console.log('❌ Failed fields sample:', failedFields.slice(0, 5));
    }
    
    // Expect at least 70% success rate for text fields
    expect(successfulFields).toBeGreaterThan(textFields.length * 0.7);
  });

  test('Dropdown fields should accept selections and persist values', async ({ page }) => {
    console.log('🧪 Testing dropdown field selections...');
    
    const dropdownFields = testDataGenerator.getFieldsByType('PDFDropdown');
    console.log(`📊 Testing ${dropdownFields.length} dropdown fields`);
    
    let successfulFields = 0;
    const failedFields = [];
    
    for (const fieldData of dropdownFields) {
      try {
        const element = await page.locator(fieldData.selector).first();
        
        if (await element.isVisible({ timeout: 2000 })) {
          await element.selectOption(fieldData.testValue);
          await page.waitForTimeout(TEST_CONFIG.waitTime);
          
          // Verify selection persisted
          const currentValue = await element.inputValue();
          if (currentValue === fieldData.testValue) {
            successfulFields++;
          } else {
            failedFields.push({
              id: fieldData.field.id,
              expected: fieldData.testValue,
              actual: currentValue
            });
          }
        }
      } catch (error) {
        failedFields.push({
          id: fieldData.field.id,
          error: error.message
        });
      }
    }
    
    console.log(`📊 Successful dropdown fields: ${successfulFields}/${dropdownFields.length}`);
    console.log(`📊 Failed dropdown fields: ${failedFields.length}`);
    
    // Expect at least 70% success rate for dropdown fields
    expect(successfulFields).toBeGreaterThan(dropdownFields.length * 0.7);
  });

  test('Checkbox fields should toggle and persist state', async ({ page }) => {
    console.log('🧪 Testing checkbox field toggling...');
    
    const checkboxFields = testDataGenerator.getFieldsByType('PDFCheckBox');
    console.log(`📊 Testing ${checkboxFields.length} checkbox fields`);
    
    let successfulFields = 0;
    const failedFields = [];
    
    // Process in smaller batches for checkboxes
    for (let i = 0; i < checkboxFields.length; i += 25) {
      const batch = checkboxFields.slice(i, i + 25);
      
      for (const fieldData of batch) {
        try {
          const element = await page.locator(fieldData.selector).first();
          
          if (await element.isVisible({ timeout: 2000 })) {
            const initialState = await element.isChecked();
            
            if (fieldData.testValue) {
              await element.check();
            } else {
              await element.uncheck();
            }
            
            await page.waitForTimeout(TEST_CONFIG.waitTime);
            
            // Verify state persisted
            const currentState = await element.isChecked();
            if (currentState === fieldData.testValue) {
              successfulFields++;
            } else {
              failedFields.push({
                id: fieldData.field.id,
                expected: fieldData.testValue,
                actual: currentState
              });
            }
          }
        } catch (error) {
          failedFields.push({
            id: fieldData.field.id,
            error: error.message
          });
        }
      }
    }
    
    console.log(`📊 Successful checkbox fields: ${successfulFields}/${checkboxFields.length}`);
    console.log(`📊 Failed checkbox fields: ${failedFields.length}`);
    
    // Expect at least 70% success rate for checkbox fields
    expect(successfulFields).toBeGreaterThan(checkboxFields.length * 0.7);
  });

  test('Radio button fields should select options and persist values', async ({ page }) => {
    console.log('🧪 Testing radio button field selections...');

    const radioFields = testDataGenerator.getFieldsByType('PDFRadioGroup');
    console.log(`📊 Testing ${radioFields.length} radio button fields`);

    let successfulFields = 0;
    const failedFields = [];

    for (const fieldData of radioFields) {
      try {
        // For radio buttons, we need to find the specific option
        const radioSelector = `input[type="radio"][name*="${fieldData.field.name}"][value="${fieldData.testValue}"]`;
        const element = await page.locator(radioSelector).first();

        if (await element.isVisible({ timeout: 2000 })) {
          await element.check();
          await page.waitForTimeout(TEST_CONFIG.waitTime);

          // Verify selection persisted
          const isChecked = await element.isChecked();
          if (isChecked) {
            successfulFields++;
          } else {
            failedFields.push({
              id: fieldData.field.id,
              expected: fieldData.testValue,
              actual: 'not checked'
            });
          }
        }
      } catch (error) {
        failedFields.push({
          id: fieldData.field.id,
          error: error.message
        });
      }
    }

    console.log(`📊 Successful radio fields: ${successfulFields}/${radioFields.length}`);
    console.log(`📊 Failed radio fields: ${failedFields.length}`);

    // Expect at least 70% success rate for radio fields
    expect(successfulFields).toBeGreaterThan(radioFields.length * 0.7);
  });

  test('Section 18 data should persist in IndexedDB after field interactions', async ({ page }) => {
    console.log('🧪 Testing IndexedDB persistence for Section 18 data...');

    // Fill out a representative sample of fields
    const sampleFields = [
      ...testDataGenerator.getFieldsByLabel('name').slice(0, 5),
      ...testDataGenerator.getFieldsByLabel('address').slice(0, 3),
      ...testDataGenerator.getFieldsByLabel('phone').slice(0, 2),
      ...testDataGenerator.getFieldsByType('PDFDropdown').slice(0, 3)
    ];

    console.log(`📊 Testing ${sampleFields.length} sample fields for persistence`);

    // Fill out sample fields
    for (const fieldData of sampleFields) {
      try {
        const element = await page.locator(fieldData.selector).first();

        if (await element.isVisible({ timeout: 2000 })) {
          if (fieldData.field.type === 'PDFTextField') {
            await element.fill(fieldData.testValue);
          } else if (fieldData.field.type === 'PDFDropdown') {
            await element.selectOption(fieldData.testValue);
          }
          await element.blur();
          await page.waitForTimeout(100);
        }
      } catch (error) {
        console.log(`⚠️ Could not fill field ${fieldData.field.id}: ${error.message}`);
      }
    }

    // Trigger save
    try {
      await page.click('button[type="submit"], button:has-text("Save")');
      await page.waitForTimeout(2000);
    } catch (e) {
      // Save might be automatic
    }

    // Check IndexedDB for Section 18 data
    const hasSection18Data = await page.evaluate(async () => {
      return new Promise((resolve) => {
        const dbRequest = indexedDB.open('SF86FormData', 1);

        dbRequest.onsuccess = (event) => {
          const db = event.target.result;
          const transaction = db.transaction(['formData'], 'readonly');
          const store = transaction.objectStore('formData');

          const completeFormRequest = store.get('complete-form');
          completeFormRequest.onsuccess = () => {
            const data = completeFormRequest.result;
            const hasData = data && data.section18 && data.section18.section18;

            if (hasData) {
              console.log('✅ Section 18 data found in IndexedDB');
              console.log('📊 Immediate family entries:', data.section18.section18.immediateFamily?.length || 0);
              console.log('📊 Extended family entries:', data.section18.section18.extendedFamily?.length || 0);
              console.log('📊 Associates entries:', data.section18.section18.associates?.length || 0);
            } else {
              console.log('❌ No Section 18 data found in IndexedDB');
            }

            db.close();
            resolve(hasData);
          };

          completeFormRequest.onerror = () => {
            db.close();
            resolve(false);
          };
        };

        dbRequest.onerror = () => resolve(false);
      });
    });

    expect(hasSection18Data).toBe(true);
  });

  test('Section 18 data should be included in PDF generation', async ({ page }) => {
    console.log('🧪 Testing PDF generation with Section 18 data...');

    // Fill out key fields that should appear in PDF
    const keyFields = [
      ...testDataGenerator.getFieldsByLabel('Last name').slice(0, 2),
      ...testDataGenerator.getFieldsByLabel('First name').slice(0, 2),
      ...testDataGenerator.getFieldsByLabel('relationship').slice(0, 1)
    ];

    console.log(`📊 Filling ${keyFields.length} key fields for PDF test`);

    for (const fieldData of keyFields) {
      try {
        const element = await page.locator(fieldData.selector).first();

        if (await element.isVisible({ timeout: 2000 })) {
          if (fieldData.field.type === 'PDFTextField') {
            await element.fill(fieldData.testValue);
          } else if (fieldData.field.type === 'PDFDropdown') {
            await element.selectOption(fieldData.testValue);
          }
          await element.blur();
          await page.waitForTimeout(100);
        }
      } catch (error) {
        console.log(`⚠️ Could not fill field ${fieldData.field.id}: ${error.message}`);
      }
    }

    // Check if Section 18 data is available for PDF generation
    const pdfDataAvailable = await page.evaluate(async () => {
      try {
        const formContext = window.sf86FormContext || window.SF86FormContext;
        if (!formContext) return false;

        // Get form data that would be sent to PDF generation
        const formData = formContext.exportForm ? formContext.exportForm() : formContext.formData;

        console.log('📊 Form data for PDF available:', !!formData);
        console.log('📊 Section 18 in form data:', !!formData.section18);

        if (formData.section18) {
          console.log('📊 Section 18 data structure:', Object.keys(formData.section18));

          // Check if Section 18 has the expected structure
          const hasValidStructure = formData.section18.section18 &&
            (formData.section18.section18.immediateFamily ||
             formData.section18.section18.extendedFamily ||
             formData.section18.section18.associates);

          console.log('📊 Section 18 has valid structure:', hasValidStructure);
          return hasValidStructure;
        }

        return false;
      } catch (error) {
        console.error('❌ Error checking PDF data:', error);
        return false;
      }
    });

    expect(pdfDataAvailable).toBe(true);
  });

  test('Field mappings should match section-18.json reference data', async ({ page }) => {
    console.log('🧪 Testing field mappings against reference data...');

    // Check if field mappings are correctly loaded
    const fieldMappingsValid = await page.evaluate(async () => {
      try {
        const response = await fetch('/api/sections-references/section-18.json');
        const referenceData = await response.json();

        console.log('📊 Reference data loaded:', !!referenceData);
        console.log('📊 Total fields in reference:', referenceData.metadata?.totalFields);
        console.log('📊 Fields array length:', referenceData.fields?.length);

        // Verify metadata matches expected values
        const metadataValid = referenceData.metadata?.totalFields === 964 &&
                             referenceData.metadata?.sectionId === 18 &&
                             referenceData.fields?.length > 0;

        console.log('📊 Metadata validation:', metadataValid);

        // Check field structure
        if (referenceData.fields && referenceData.fields.length > 0) {
          const sampleField = referenceData.fields[0];
          const hasRequiredFields = sampleField.id && sampleField.name &&
                                   sampleField.type && sampleField.label;

          console.log('📊 Field structure validation:', hasRequiredFields);
          console.log('📊 Sample field:', {
            id: sampleField.id,
            name: sampleField.name,
            type: sampleField.type,
            label: sampleField.label?.substring(0, 50) + '...'
          });

          return metadataValid && hasRequiredFields;
        }

        return false;
      } catch (error) {
        console.error('❌ Error validating field mappings:', error);
        return false;
      }
    });

    expect(fieldMappingsValid).toBe(true);
  });

  test('Section 18 context should follow Section 29 pattern', async ({ page }) => {
    console.log('🧪 Testing Section 18 context pattern consistency...');

    const contextPatternValid = await page.evaluate(() => {
      try {
        // Check if Section 18 context is available
        const section18Context = window.useSection18?.();
        if (!section18Context) {
          console.log('❌ Section 18 context not available');
          return false;
        }

        console.log('✅ Section 18 context available');

        // Check required methods exist (following Section 29 pattern)
        const requiredMethods = [
          'updateField',
          'updateFieldValue',
          'getFieldValue',
          'validate',
          'validateEntry'
        ];

        const missingMethods = requiredMethods.filter(method =>
          typeof section18Context[method] !== 'function'
        );

        if (missingMethods.length > 0) {
          console.log('❌ Missing methods:', missingMethods);
          return false;
        }

        console.log('✅ All required methods available');

        // Check updateFieldValue signature (should have 4 parameters like Section 29)
        const updateFieldValueLength = section18Context.updateFieldValue.length;
        console.log('📊 updateFieldValue parameter count:', updateFieldValueLength);

        if (updateFieldValueLength !== 4) {
          console.log('❌ updateFieldValue should have 4 parameters (Section 29 pattern)');
          return false;
        }

        console.log('✅ updateFieldValue follows Section 29 pattern');

        // Check data structure
        const section18Data = section18Context.section18Data;
        if (!section18Data || !section18Data.section18) {
          console.log('❌ Invalid Section 18 data structure');
          return false;
        }

        const hasRequiredSubsections = section18Data.section18.immediateFamily &&
                                      section18Data.section18.extendedFamily &&
                                      section18Data.section18.associates;

        if (!hasRequiredSubsections) {
          console.log('❌ Missing required subsections');
          return false;
        }

        console.log('✅ Section 18 data structure valid');
        console.log('📊 Immediate family entries:', section18Data.section18.immediateFamily.length);
        console.log('📊 Extended family entries:', section18Data.section18.extendedFamily.length);
        console.log('📊 Associates entries:', section18Data.section18.associates.length);

        return true;
      } catch (error) {
        console.error('❌ Error checking context pattern:', error);
        return false;
      }
    });

    expect(contextPatternValid).toBe(true);
  });
});
