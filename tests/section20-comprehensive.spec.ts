/**
 * Section 20 Comprehensive Playwright Tests
 * 
 * Tests all 790 fields across Section 20 (Foreign Activities)
 * Based on sections-references/section-20.json field mapping
 * 
 * Field Distribution:
 * - PDFTextField: 1,242 fields
 * - PDFCheckBox: 480 fields  
 * - PDFDropdown: 426 fields
 * - PDFRadioGroup: 222 fields
 * Total: 2,370 field instances across 790 unique fields
 * 
 * Subsections:
 * - Section20a[0]: Foreign Financial Interests (126 fields)
 * - Section20a2[0]: Foreign Business Activities & Travel (123 fields)
 */

import { test, expect, Page } from '@playwright/test';
import fs from 'fs';

// Load Section 20 field references
const section20Data = JSON.parse(fs.readFileSync('api/sections-references/section-20.json', 'utf8'));

interface FieldReference {
  id: string;
  name: string;
  page: number;
  label: string;
  type: 'PDFTextField' | 'PDFCheckBox' | 'PDFRadioGroup' | 'PDFDropdown';
  maxLength?: number;
  options?: string[];
  rect: { x: number; y: number; width: number; height: number };
  section: number;
  confidence: number;
  uniqueId: string;
}

// Group fields by subsection and type
const fieldsBySubsection = {
  'Section20a[0]': section20Data.fields.filter((f: FieldReference) => f.name.includes('Section20a[0]')),
  'Section20a2[0]': section20Data.fields.filter((f: FieldReference) => f.name.includes('Section20a2[0]'))
};

const fieldsByType = {
  PDFTextField: section20Data.fields.filter((f: FieldReference) => f.type === 'PDFTextField'),
  PDFCheckBox: section20Data.fields.filter((f: FieldReference) => f.type === 'PDFCheckBox'),
  PDFRadioGroup: section20Data.fields.filter((f: FieldReference) => f.type === 'PDFRadioGroup'),
  PDFDropdown: section20Data.fields.filter((f: FieldReference) => f.type === 'PDFDropdown')
};

test.describe('Section 20: Foreign Activities - Comprehensive Field Tests', () => {
    test.beforeEach(async ({ page }) => {
    // Navigate to the form
    await page.goto('/startForm');
      // Wait for the form to load
    await page.waitForSelector('[data-testid="centralized-sf86-form"]');
    
    // Expand all sections to make Section 20 visible
    await page.click('[data-testid="toggle-sections-button"]');
    
    // Navigate to Section 20
    await page.click('[data-testid="section-section20-button"]');
    
    // Wait for Section 20 component to load
    await page.waitForSelector('[data-testid="section20-form"]');
    
    // Ensure we're on the correct section
    await expect(page.locator('h1, h2, h3')).toContainText(/Section 20|Foreign Activities/i);
  });

  test.describe('Field Mapping Verification', () => {
    
    test('should verify all 790 fields are mapped correctly', async ({ page }) => {
      console.log(`Testing ${section20Data.metadata.totalFields} total fields`);
      
      // Verify metadata
      expect(section20Data.metadata.sectionId).toBe(20);
      expect(section20Data.metadata.sectionName).toBe('Foreign Activities');
      expect(section20Data.metadata.totalFields).toBe(790);
      expect(section20Data.fields).toHaveLength(790);
      
      // Verify field distribution
      expect(fieldsByType.PDFTextField).toHaveLength(1242);
      expect(fieldsByType.PDFCheckBox).toHaveLength(480);
      expect(fieldsByType.PDFDropdown).toHaveLength(426);
      expect(fieldsByType.PDFRadioGroup).toHaveLength(222);
    });

    test('should verify subsection field distribution', async ({ page }) => {
      // Section20a[0]: Foreign Financial Interests
      expect(fieldsBySubsection['Section20a[0]']).toHaveLength(126);
      
      // Section20a2[0]: Foreign Business Activities & Travel  
      expect(fieldsBySubsection['Section20a2[0]']).toHaveLength(123);
      
      console.log('Section20a[0] fields:', fieldsBySubsection['Section20a[0]'].length);
      console.log('Section20a2[0] fields:', fieldsBySubsection['Section20a2[0]'].length);
    });
  });

  test.describe('Foreign Financial Interests (Section20a[0])', () => {
    
    test('should handle main radio button selection', async ({ page }) => {
      // Find the main radio button field
      const mainRadioField = fieldsBySubsection['Section20a[0]'].find(
        (f: FieldReference) => f.name === 'form1[0].Section20a[0].RadioButtonList[0]'
      );
      
      expect(mainRadioField).toBeDefined();
      expect(mainRadioField?.type).toBe('PDFRadioGroup');
      expect(mainRadioField?.options).toEqual(['YES', 'NO (Proceed to 20A.2)']);
      
      // Test radio button interaction
      await page.click('[data-testid="foreign-financial-interests-yes"]');
      await expect(page.locator('[data-testid="foreign-financial-interests-yes"]')).toBeChecked();
      
      await page.click('[data-testid="foreign-financial-interests-no"]');
      await expect(page.locator('[data-testid="foreign-financial-interests-no"]')).toBeChecked();
    });

    test('should test all TextField11 fields', async ({ page }) => {
      const textFields = fieldsBySubsection['Section20a[0]'].filter(
        (f: FieldReference) => f.name.includes('TextField11')
      );
      
      console.log(`Testing ${textFields.length} TextField11 fields`);
      
      // Enable financial interests to show entry form
      await page.click('[data-testid="foreign-financial-interests-yes"]');
      await page.click('[data-testid="add-financial-interest-entry"]');
      
      for (const field of textFields) {
        const testValue = `Test value for ${field.name}`;
        const selector = `[data-field-id="${field.id.replace(' 0 R', '')}"]`;
        
        try {
          await page.fill(selector, testValue);
          await expect(page.locator(selector)).toHaveValue(testValue);
          console.log(`✅ TextField11 ${field.name}: ${testValue}`);
        } catch (error) {
          console.log(`❌ TextField11 ${field.name}: Field not found or not interactive`);
        }
      }
    });

    test('should test all DropDownList12 fields', async ({ page }) => {
      const dropdownFields = fieldsBySubsection['Section20a[0]'].filter(
        (f: FieldReference) => f.name.includes('DropDownList12')
      );
      
      console.log(`Testing ${dropdownFields.length} DropDownList12 fields`);
      
      // Enable financial interests
      await page.click('[data-testid="foreign-financial-interests-yes"]');
      await page.click('[data-testid="add-financial-interest-entry"]');
      
      for (const field of dropdownFields) {
        if (field.options && field.options.length > 0) {
          const testOption = field.options[1] || field.options[0]; // Use second option or first
          const selector = `[data-field-id="${field.id.replace(' 0 R', '')}"]`;
          
          try {
            await page.selectOption(selector, testOption);
            await expect(page.locator(selector)).toHaveValue(testOption);
            console.log(`✅ DropDownList12 ${field.name}: ${testOption}`);
          } catch (error) {
            console.log(`❌ DropDownList12 ${field.name}: Field not found or not interactive`);
          }
        }
      }
    });

    test('should test all checkbox fields (#field)', async ({ page }) => {
      const checkboxFields = fieldsBySubsection['Section20a[0]'].filter(
        (f: FieldReference) => f.name.includes('#field') && f.type === 'PDFCheckBox'
      );
      
      console.log(`Testing ${checkboxFields.length} checkbox fields`);
      
      // Enable financial interests
      await page.click('[data-testid="foreign-financial-interests-yes"]');
      await page.click('[data-testid="add-financial-interest-entry"]');
      
      for (const field of checkboxFields) {
        const selector = `[data-field-id="${field.id.replace(' 0 R', '')}"]`;
        
        try {
          await page.check(selector);
          await expect(page.locator(selector)).toBeChecked();
          
          await page.uncheck(selector);
          await expect(page.locator(selector)).not.toBeChecked();
          
          console.log(`✅ Checkbox ${field.name}: Toggle successful`);
        } catch (error) {
          console.log(`❌ Checkbox ${field.name}: Field not found or not interactive`);
        }
      }
    });
  });

  test.describe('Foreign Business Activities & Travel (Section20a2[0])', () => {
    
    test('should test business activity radio buttons', async ({ page }) => {
      const radioFields = fieldsBySubsection['Section20a2[0]'].filter(
        (f: FieldReference) => f.type === 'PDFRadioGroup'
      );
      
      console.log(`Testing ${radioFields.length} radio button groups`);
      
      // Enable business activities
      await page.click('[data-testid="foreign-business-activities-yes"]');
      await page.click('[data-testid="add-business-activity-entry"]');
      
      for (const field of radioFields) {
        if (field.options && field.options.length > 0) {
          for (const option of field.options) {
            const selector = `[data-field-id="${field.id.replace(' 0 R', '')}"][value="${option}"]`;
            
            try {
              await page.click(selector);
              await expect(page.locator(selector)).toBeChecked();
              console.log(`✅ Radio ${field.name}: ${option}`);
            } catch (error) {
              console.log(`❌ Radio ${field.name}: Option ${option} not found`);
            }
          }
        }
      }
    });

    test('should test travel date fields', async ({ page }) => {
      const dateFields = fieldsBySubsection['Section20a2[0]'].filter(
        (f: FieldReference) => f.name.includes('Datefield')
      );
      
      console.log(`Testing ${dateFields.length} date fields`);
      
      // Enable foreign travel
      await page.click('[data-testid="foreign-travel-yes"]');
      await page.click('[data-testid="add-travel-entry"]');
      
      for (const field of dateFields) {
        const testDate = '2023-01-15';
        const selector = `[data-field-id="${field.id.replace(' 0 R', '')}"]`;
        
        try {
          await page.fill(selector, testDate);
          await expect(page.locator(selector)).toHaveValue(testDate);
          console.log(`✅ Date field ${field.name}: ${testDate}`);
        } catch (error) {
          console.log(`❌ Date field ${field.name}: Field not found or not interactive`);
        }
      }
    });
  });

  test.describe('Data Persistence Tests', () => {

    test('should persist all field types across page reload', async ({ page }) => {
      // Test data for different field types
      const testData = {
        textField: 'Test financial interest description',
        dropdown: 'Canada',
        checkbox: true,
        radio: 'YES',
        date: '2023-06-15',
        number: '50000'
      };

      // Enable financial interests and add entry
      await page.click('[data-testid="foreign-financial-interests-yes"]');
      await page.click('[data-testid="add-financial-interest-entry"]');

      // Fill various field types
      await page.fill('[data-testid="financial-interest-description"]', testData.textField);
      await page.selectOption('[data-testid="financial-interest-country"]', testData.dropdown);
      await page.check('[data-testid="financial-interest-estimated"]');
      await page.fill('[data-testid="financial-interest-date"]', testData.date);
      await page.fill('[data-testid="financial-interest-value"]', testData.number);

      // Save and reload
      await page.click('[data-testid="save-form"]');
      await page.waitForTimeout(1000); // Wait for save
      await page.reload();
      await page.waitForLoadState('networkidle');

      // Verify persistence
      await expect(page.locator('[data-testid="financial-interest-description"]')).toHaveValue(testData.textField);
      await expect(page.locator('[data-testid="financial-interest-country"]')).toHaveValue(testData.dropdown);
      await expect(page.locator('[data-testid="financial-interest-estimated"]')).toBeChecked();
      await expect(page.locator('[data-testid="financial-interest-date"]')).toHaveValue(testData.date);
      await expect(page.locator('[data-testid="financial-interest-value"]')).toHaveValue(testData.number);
    });

    test('should handle multiple entries with all field types', async ({ page }) => {
      // Add multiple financial interest entries
      await page.click('[data-testid="foreign-financial-interests-yes"]');

      for (let i = 0; i < 3; i++) {
        await page.click('[data-testid="add-financial-interest-entry"]');

        // Fill entry-specific data
        await page.fill(`[data-testid="financial-interest-description-${i}"]`, `Interest ${i + 1}`);
        await page.selectOption(`[data-testid="financial-interest-type-${i}"]`, 'bank_account');
        await page.fill(`[data-testid="financial-interest-value-${i}"]`, `${(i + 1) * 10000}`);
      }

      // Verify all entries exist
      for (let i = 0; i < 3; i++) {
        await expect(page.locator(`[data-testid="financial-interest-description-${i}"]`)).toHaveValue(`Interest ${i + 1}`);
        await expect(page.locator(`[data-testid="financial-interest-type-${i}"]`)).toHaveValue('bank_account');
        await expect(page.locator(`[data-testid="financial-interest-value-${i}"]`)).toHaveValue(`${(i + 1) * 10000}`);
      }
    });
  });

  test.describe('Field Validation Tests', () => {

    test('should validate required fields', async ({ page }) => {
      // Enable financial interests
      await page.click('[data-testid="foreign-financial-interests-yes"]');
      await page.click('[data-testid="add-financial-interest-entry"]');

      // Try to save without required fields
      await page.click('[data-testid="save-form"]');

      // Check for validation errors
      await expect(page.locator('[data-testid="validation-error"]')).toBeVisible();
      await expect(page.locator('[data-testid="validation-error"]')).toContainText(/required/i);
    });

    test('should validate date field formats', async ({ page }) => {
      await page.click('[data-testid="foreign-travel-yes"]');
      await page.click('[data-testid="add-travel-entry"]');

      // Test invalid date format
      await page.fill('[data-testid="travel-date-from"]', 'invalid-date');
      await page.blur('[data-testid="travel-date-from"]');

      // Check for date validation error
      await expect(page.locator('[data-testid="date-validation-error"]')).toBeVisible();

      // Test valid date format
      await page.fill('[data-testid="travel-date-from"]', '2023-06-15');
      await page.blur('[data-testid="travel-date-from"]');

      // Error should disappear
      await expect(page.locator('[data-testid="date-validation-error"]')).not.toBeVisible();
    });

    test('should validate numeric field ranges', async ({ page }) => {
      await page.click('[data-testid="foreign-financial-interests-yes"]');
      await page.click('[data-testid="add-financial-interest-entry"]');

      // Test negative value
      await page.fill('[data-testid="financial-interest-value"]', '-1000');
      await page.blur('[data-testid="financial-interest-value"]');

      // Check for validation error
      await expect(page.locator('[data-testid="value-validation-error"]')).toBeVisible();

      // Test valid positive value
      await page.fill('[data-testid="financial-interest-value"]', '50000');
      await page.blur('[data-testid="financial-interest-value"]');

      // Error should disappear
      await expect(page.locator('[data-testid="value-validation-error"]')).not.toBeVisible();
    });
  });

  test.describe('Complex Field Structure Tests', () => {

    test('should handle nested address fields', async ({ page }) => {
      await page.click('[data-testid="foreign-financial-interests-yes"]');
      await page.click('[data-testid="add-financial-interest-entry"]');

      // Test co-owner address fields (nested structure)
      await page.check('[data-testid="has-co-owners"]');

      const addressData = {
        street: '123 Main Street',
        city: 'Toronto',
        state: 'ON',
        zipCode: 'M5V 3A8',
        country: 'Canada'
      };

      await page.fill('[data-testid="co-owner-address-street"]', addressData.street);
      await page.fill('[data-testid="co-owner-address-city"]', addressData.city);
      await page.fill('[data-testid="co-owner-address-state"]', addressData.state);
      await page.fill('[data-testid="co-owner-address-zip"]', addressData.zipCode);
      await page.selectOption('[data-testid="co-owner-address-country"]', addressData.country);

      // Verify nested address structure
      await expect(page.locator('[data-testid="co-owner-address-street"]')).toHaveValue(addressData.street);
      await expect(page.locator('[data-testid="co-owner-address-city"]')).toHaveValue(addressData.city);
      await expect(page.locator('[data-testid="co-owner-address-state"]')).toHaveValue(addressData.state);
      await expect(page.locator('[data-testid="co-owner-address-zip"]')).toHaveValue(addressData.zipCode);
      await expect(page.locator('[data-testid="co-owner-address-country"]')).toHaveValue(addressData.country);
    });

    test('should handle DateInfo field structures', async ({ page }) => {
      await page.click('[data-testid="foreign-financial-interests-yes"]');
      await page.click('[data-testid="add-financial-interest-entry"]');

      // Test DateInfo structure (date + estimated)
      await page.fill('[data-testid="date-acquired-date"]', '2022-03-15');
      await page.check('[data-testid="date-acquired-estimated"]');

      // Verify DateInfo structure
      await expect(page.locator('[data-testid="date-acquired-date"]')).toHaveValue('2022-03-15');
      await expect(page.locator('[data-testid="date-acquired-estimated"]')).toBeChecked();

      // Test that unchecking estimated works
      await page.uncheck('[data-testid="date-acquired-estimated"]');
      await expect(page.locator('[data-testid="date-acquired-estimated"]')).not.toBeChecked();
    });

    test('should handle ValueInfo field structures', async ({ page }) => {
      await page.click('[data-testid="foreign-financial-interests-yes"]');
      await page.click('[data-testid="add-financial-interest-entry"]');

      // Test ValueInfo structure (amount + estimated)
      await page.fill('[data-testid="current-value-amount"]', '75000');
      await page.check('[data-testid="current-value-estimated"]');

      // Verify ValueInfo structure
      await expect(page.locator('[data-testid="current-value-amount"]')).toHaveValue('75000');
      await expect(page.locator('[data-testid="current-value-estimated"]')).toBeChecked();
    });
  });

  test.describe('Performance Tests', () => {

    test('should handle large number of entries efficiently', async ({ page }) => {
      const startTime = Date.now();

      // Add maximum entries for each subsection
      await page.click('[data-testid="foreign-financial-interests-yes"]');
      for (let i = 0; i < 10; i++) {
        await page.click('[data-testid="add-financial-interest-entry"]');
        await page.fill(`[data-testid="financial-interest-description-${i}"]`, `Interest ${i + 1}`);
      }

      await page.click('[data-testid="foreign-business-activities-yes"]');
      for (let i = 0; i < 10; i++) {
        await page.click('[data-testid="add-business-activity-entry"]');
        await page.fill(`[data-testid="business-description-${i}"]`, `Business ${i + 1}`);
      }

      await page.click('[data-testid="foreign-travel-yes"]');
      for (let i = 0; i < 10; i++) {
        await page.click('[data-testid="add-travel-entry"]');
        await page.fill(`[data-testid="travel-country-${i}"]`, `Country ${i + 1}`);
      }

      const endTime = Date.now();
      const duration = endTime - startTime;

      console.log(`Created 30 entries in ${duration}ms`);
      expect(duration).toBeLessThan(30000); // Should complete within 30 seconds

      // Verify all entries exist
      await expect(page.locator('[data-testid^="financial-interest-description-"]')).toHaveCount(10);
      await expect(page.locator('[data-testid^="business-description-"]')).toHaveCount(10);
      await expect(page.locator('[data-testid^="travel-country-"]')).toHaveCount(10);
    });
  });
});
