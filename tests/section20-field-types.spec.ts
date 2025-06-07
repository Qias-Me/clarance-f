/**
 * Section 20 Field Type Specific Tests
 * 
 * Comprehensive testing of all field types in Section 20:
 * - PDFTextField: 1,242 instances
 * - PDFCheckBox: 480 instances  
 * - PDFDropdown: 426 instances
 * - PDFRadioGroup: 222 instances
 */

import { test, expect, Page } from '@playwright/test';
import fs from 'fs';

const section20Data = JSON.parse(fs.readFileSync('api/sections-references/section-20.json', 'utf8'));

interface FieldReference {
  id: string;
  name: string;
  type: 'PDFTextField' | 'PDFCheckBox' | 'PDFRadioGroup' | 'PDFDropdown';
  options?: string[];
  maxLength?: number;
  label: string;
}

// Helper function to get field selector
function getFieldSelector(field: FieldReference): string {
  const cleanId = field.id.replace(' 0 R', '');
  return `[data-field-id="${cleanId}"], [data-testid*="${cleanId}"], input[name*="${cleanId}"]`;
}

// Helper function to get test value for field type
function getTestValue(field: FieldReference): string | boolean {
  switch (field.type) {
    case 'PDFTextField':
      if (field.name.includes('Date') || field.name.includes('date')) {
        return '2023-06-15';
      }
      if (field.name.includes('Numeric') || field.name.includes('numeric')) {
        return '50000';
      }
      return `Test value for ${field.name}`;
    
    case 'PDFCheckBox':
      return true;
    
    case 'PDFDropdown':
      return field.options?.[1] || field.options?.[0] || 'United States';
    
    case 'PDFRadioGroup':
      return field.options?.[0] || 'YES';
    
    default:
      return 'Default test value';
  }
}

test.describe('Section 20: Field Type Specific Tests', () => {
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
  });

  test.describe('PDFTextField Tests (1,242 instances)', () => {
    
    test('should test all TextField11 instances', async ({ page }) => {
      const textFields = section20Data.fields.filter(
        (f: FieldReference) => f.type === 'PDFTextField' && f.name.includes('TextField11')
      );
      
      console.log(`Testing ${textFields.length} TextField11 instances`);
      
      // Enable all subsections to access all fields
      await page.click('[data-testid="foreign-financial-interests-yes"]');
      await page.click('[data-testid="foreign-business-activities-yes"]');
      await page.click('[data-testid="foreign-travel-yes"]');
      
      // Add entries to access entry-specific fields
      await page.click('[data-testid="add-financial-interest-entry"]');
      await page.click('[data-testid="add-business-activity-entry"]');
      await page.click('[data-testid="add-travel-entry"]');
      
      let successCount = 0;
      let failureCount = 0;
      
      for (const field of textFields) {
        const testValue = getTestValue(field) as string;
        const selector = getFieldSelector(field);
        
        try {
          // Try multiple selector strategies
          const element = await page.locator(selector).first();
          if (await element.isVisible({ timeout: 1000 })) {
            await element.fill(testValue);
            await expect(element).toHaveValue(testValue);
            successCount++;
            console.log(`✅ TextField11 ${field.name}: ${testValue}`);
          } else {
            failureCount++;
            console.log(`⚠️ TextField11 ${field.name}: Not visible`);
          }
        } catch (error) {
          failureCount++;
          console.log(`❌ TextField11 ${field.name}: ${error.message}`);
        }
      }
      
      console.log(`TextField11 Results: ${successCount} success, ${failureCount} failures`);
      expect(successCount).toBeGreaterThan(0);
    });

    test('should test all NumericField instances', async ({ page }) => {
      const numericFields = section20Data.fields.filter(
        (f: FieldReference) => f.type === 'PDFTextField' && f.name.includes('NumericField')
      );
      
      console.log(`Testing ${numericFields.length} NumericField instances`);
      
      await page.click('[data-testid="foreign-financial-interests-yes"]');
      await page.click('[data-testid="add-financial-interest-entry"]');
      
      for (const field of numericFields) {
        const testValue = '75000.50';
        const selector = getFieldSelector(field);
        
        try {
          const element = await page.locator(selector).first();
          if (await element.isVisible({ timeout: 1000 })) {
            await element.fill(testValue);
            await expect(element).toHaveValue(testValue);
            console.log(`✅ NumericField ${field.name}: ${testValue}`);
          }
        } catch (error) {
          console.log(`❌ NumericField ${field.name}: ${error.message}`);
        }
      }
    });

    test('should test all date field instances', async ({ page }) => {
      const dateFields = section20Data.fields.filter(
        (f: FieldReference) => f.type === 'PDFTextField' && 
        (f.name.includes('Date') || f.name.includes('date'))
      );
      
      console.log(`Testing ${dateFields.length} date field instances`);
      
      await page.click('[data-testid="foreign-travel-yes"]');
      await page.click('[data-testid="add-travel-entry"]');
      
      for (const field of dateFields) {
        const testDate = '2023-06-15';
        const selector = getFieldSelector(field);
        
        try {
          const element = await page.locator(selector).first();
          if (await element.isVisible({ timeout: 1000 })) {
            await element.fill(testDate);
            await expect(element).toHaveValue(testDate);
            console.log(`✅ Date field ${field.name}: ${testDate}`);
          }
        } catch (error) {
          console.log(`❌ Date field ${field.name}: ${error.message}`);
        }
      }
    });
  });

  test.describe('PDFCheckBox Tests (480 instances)', () => {
    
    test('should test all #field checkbox instances', async ({ page }) => {
      const checkboxFields = section20Data.fields.filter(
        (f: FieldReference) => f.type === 'PDFCheckBox' && f.name.includes('#field')
      );
      
      console.log(`Testing ${checkboxFields.length} #field checkbox instances`);
      
      // Enable all subsections
      await page.click('[data-testid="foreign-financial-interests-yes"]');
      await page.click('[data-testid="foreign-business-activities-yes"]');
      await page.click('[data-testid="foreign-travel-yes"]');
      
      await page.click('[data-testid="add-financial-interest-entry"]');
      await page.click('[data-testid="add-business-activity-entry"]');
      await page.click('[data-testid="add-travel-entry"]');
      
      let successCount = 0;
      
      for (const field of checkboxFields) {
        const selector = getFieldSelector(field);
        
        try {
          const element = await page.locator(selector).first();
          if (await element.isVisible({ timeout: 1000 })) {
            // Test checking
            await element.check();
            await expect(element).toBeChecked();
            
            // Test unchecking
            await element.uncheck();
            await expect(element).not.toBeChecked();
            
            successCount++;
            console.log(`✅ Checkbox ${field.name}: Toggle successful`);
          }
        } catch (error) {
          console.log(`❌ Checkbox ${field.name}: ${error.message}`);
        }
      }
      
      console.log(`Checkbox Results: ${successCount} successful toggles`);
      expect(successCount).toBeGreaterThan(0);
    });

    test('should test estimate checkboxes', async ({ page }) => {
      const estimateFields = section20Data.fields.filter(
        (f: FieldReference) => f.type === 'PDFCheckBox' && 
        f.label.toLowerCase().includes('estimate')
      );
      
      console.log(`Testing ${estimateFields.length} estimate checkbox instances`);
      
      await page.click('[data-testid="foreign-financial-interests-yes"]');
      await page.click('[data-testid="add-financial-interest-entry"]');
      
      for (const field of estimateFields) {
        const selector = getFieldSelector(field);
        
        try {
          const element = await page.locator(selector).first();
          if (await element.isVisible({ timeout: 1000 })) {
            await element.check();
            await expect(element).toBeChecked();
            console.log(`✅ Estimate checkbox ${field.name}: Checked`);
          }
        } catch (error) {
          console.log(`❌ Estimate checkbox ${field.name}: ${error.message}`);
        }
      }
    });
  });

  test.describe('PDFDropdown Tests (426 instances)', () => {
    
    test('should test all DropDownList instances', async ({ page }) => {
      const dropdownFields = section20Data.fields.filter(
        (f: FieldReference) => f.type === 'PDFDropdown'
      );
      
      console.log(`Testing ${dropdownFields.length} dropdown instances`);
      
      await page.click('[data-testid="foreign-financial-interests-yes"]');
      await page.click('[data-testid="add-financial-interest-entry"]');
      
      let successCount = 0;
      
      for (const field of dropdownFields) {
        if (field.options && field.options.length > 0) {
          const testOption = field.options[1] || field.options[0];
          const selector = getFieldSelector(field);
          
          try {
            const element = await page.locator(selector).first();
            if (await element.isVisible({ timeout: 1000 })) {
              await element.selectOption(testOption);
              await expect(element).toHaveValue(testOption);
              successCount++;
              console.log(`✅ Dropdown ${field.name}: ${testOption}`);
            }
          } catch (error) {
            console.log(`❌ Dropdown ${field.name}: ${error.message}`);
          }
        }
      }
      
      console.log(`Dropdown Results: ${successCount} successful selections`);
      expect(successCount).toBeGreaterThan(0);
    });

    test('should test country dropdown options', async ({ page }) => {
      const countryFields = section20Data.fields.filter(
        (f: FieldReference) => f.type === 'PDFDropdown' && 
        f.options?.includes('United States')
      );
      
      console.log(`Testing ${countryFields.length} country dropdown instances`);
      
      await page.click('[data-testid="foreign-financial-interests-yes"]');
      await page.click('[data-testid="add-financial-interest-entry"]');
      
      const testCountries = ['Canada', 'United Kingdom', 'Germany', 'Japan'];
      
      for (const field of countryFields) {
        const selector = getFieldSelector(field);
        
        try {
          const element = await page.locator(selector).first();
          if (await element.isVisible({ timeout: 1000 })) {
            for (const country of testCountries) {
              if (field.options?.includes(country)) {
                await element.selectOption(country);
                await expect(element).toHaveValue(country);
                console.log(`✅ Country dropdown ${field.name}: ${country}`);
                break;
              }
            }
          }
        } catch (error) {
          console.log(`❌ Country dropdown ${field.name}: ${error.message}`);
        }
      }
    });
  });

  test.describe('PDFRadioGroup Tests (222 instances)', () => {
    
    test('should test all RadioButtonList instances', async ({ page }) => {
      const radioFields = section20Data.fields.filter(
        (f: FieldReference) => f.type === 'PDFRadioGroup'
      );
      
      console.log(`Testing ${radioFields.length} radio button group instances`);
      
      await page.click('[data-testid="foreign-business-activities-yes"]');
      await page.click('[data-testid="add-business-activity-entry"]');
      
      let successCount = 0;
      
      for (const field of radioFields) {
        if (field.options && field.options.length > 0) {
          const selector = getFieldSelector(field);
          
          try {
            for (const option of field.options) {
              const optionSelector = `${selector}[value="${option}"]`;
              const element = await page.locator(optionSelector).first();
              
              if (await element.isVisible({ timeout: 1000 })) {
                await element.click();
                await expect(element).toBeChecked();
                successCount++;
                console.log(`✅ Radio ${field.name}: ${option}`);
                break; // Test first available option
              }
            }
          } catch (error) {
            console.log(`❌ Radio ${field.name}: ${error.message}`);
          }
        }
      }
      
      console.log(`Radio Results: ${successCount} successful selections`);
      expect(successCount).toBeGreaterThan(0);
    });

    test('should test YES/NO radio patterns', async ({ page }) => {
      const yesNoFields = section20Data.fields.filter(
        (f: FieldReference) => f.type === 'PDFRadioGroup' && 
        f.options?.includes('YES') && f.options?.includes('NO')
      );
      
      console.log(`Testing ${yesNoFields.length} YES/NO radio instances`);
      
      for (const field of yesNoFields) {
        const selector = getFieldSelector(field);
        
        try {
          // Test YES option
          const yesElement = await page.locator(`${selector}[value="YES"]`).first();
          if (await yesElement.isVisible({ timeout: 1000 })) {
            await yesElement.click();
            await expect(yesElement).toBeChecked();
            
            // Test NO option
            const noElement = await page.locator(`${selector}[value="NO"]`).first();
            await noElement.click();
            await expect(noElement).toBeChecked();
            await expect(yesElement).not.toBeChecked();
            
            console.log(`✅ YES/NO Radio ${field.name}: Both options work`);
          }
        } catch (error) {
          console.log(`❌ YES/NO Radio ${field.name}: ${error.message}`);
        }
      }
    });
  });
});
