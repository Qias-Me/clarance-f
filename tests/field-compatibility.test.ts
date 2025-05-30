/**
 * Field Compatibility and Validation Tests
 * 
 * Tests for field structure compatibility, PDF field mapping accuracy,
 * and validation across all sections of the SF-86 form.
 */

import { test, expect } from '@playwright/test';

test.describe('Field Compatibility and Validation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/startForm');
    await page.waitForSelector('[data-testid="sf86-form-container"]');
  });

  test.describe('Field Structure Validation', () => {
    test('should validate Field<T> interface compliance', async ({ page }) => {
      // Run field compatibility validation
      const validationResult = await page.evaluate(async () => {
        const { validateFieldCompatibility } = await import('../app/utils/fieldCompatibilityValidator');
        const formData = window.__SF86_FORM_STATE__;
        return validateFieldCompatibility(formData);
      });
      
      expect(validationResult.overallValid).toBe(true);
      expect(validationResult.invalidFields).toBe(0);
      expect(validationResult.summary.structureErrors).toBe(0);
    });

    test('should validate field ID patterns', async ({ page }) => {
      const fieldIdValidation = await page.evaluate(async () => {
        const { testFieldIdGeneration } = await import('../app/utils/pdfIntegrationTest');
        return testFieldIdGeneration();
      });
      
      expect(fieldIdValidation.success).toBe(true);
      expect(fieldIdValidation.results.invalidFields.length).toBe(0);
      expect(fieldIdValidation.results.validFields).toBeGreaterThan(0);
    });

    test('should validate field type consistency', async ({ page }) => {
      // Fill some test data to create fields
      await fillTestDataForValidation(page);
      
      const typeValidation = await page.evaluate(() => {
        const formData = window.__SF86_FORM_STATE__;
        const errors: string[] = [];
        
        const validateFieldType = (field: any, path: string) => {
          if (!field || typeof field !== 'object') return;
          
          if ('type' in field && 'value' in field) {
            const { type, value } = field;
            
            // Validate type-value consistency
            if (type === 'checkbox' && typeof value !== 'boolean') {
              errors.push(`${path}: checkbox field should have boolean value, got ${typeof value}`);
            }
            if (type === 'number' && typeof value !== 'number' && value !== '') {
              errors.push(`${path}: number field should have number value, got ${typeof value}`);
            }
            if (type === 'date' && value && !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
              errors.push(`${path}: date field should have YYYY-MM-DD format, got ${value}`);
            }
          }
        };
        
        const traverseObject = (obj: any, path = '') => {
          if (!obj || typeof obj !== 'object') return;
          
          Object.entries(obj).forEach(([key, value]) => {
            const currentPath = path ? `${path}.${key}` : key;
            
            if (value && typeof value === 'object' && 'type' in value) {
              validateFieldType(value, currentPath);
            } else if (value && typeof value === 'object') {
              traverseObject(value, currentPath);
            }
          });
        };
        
        traverseObject(formData);
        return { errors, isValid: errors.length === 0 };
      });
      
      expect(typeValidation.isValid).toBe(true);
      expect(typeValidation.errors.length).toBe(0);
    });
  });

  test.describe('PDF Field Mapping Validation', () => {
    test('should validate Section 1 field mappings', async ({ page }) => {
      await page.click('[data-testid="section-1-tab"]');
      await page.fill('[data-testid="last-name-field"]', 'MappingTest');
      await page.fill('[data-testid="first-name-field"]', 'PDF');
      
      const mappingValidation = await page.evaluate(() => {
        const formData = window.__SF86_FORM_STATE__;
        const section1 = formData?.section1;
        
        if (!section1) return { isValid: false, error: 'Section 1 not found' };
        
        const expectedMappings = {
          'lastName': 'form1[0].Sections1-6[0].TextField11[0]',
          'firstName': 'form1[0].Sections1-6[0].TextField11[1]',
          'middleName': 'form1[0].Sections1-6[0].TextField11[2]',
          'suffix': 'form1[0].Sections1-6[0].TextField11[3]'
        };
        
        const errors: string[] = [];
        
        Object.entries(expectedMappings).forEach(([fieldName, expectedId]) => {
          const field = section1.personalInfo?.[fieldName];
          if (!field) {
            errors.push(`Field ${fieldName} not found`);
          } else if (field.id !== expectedId) {
            errors.push(`Field ${fieldName} has incorrect ID: expected ${expectedId}, got ${field.id}`);
          }
        });
        
        return { isValid: errors.length === 0, errors };
      });
      
      expect(mappingValidation.isValid).toBe(true);
      expect(mappingValidation.errors?.length || 0).toBe(0);
    });

    test('should validate Section 2 field mappings', async ({ page }) => {
      await page.click('[data-testid="section-2-tab"]');
      await page.fill('[data-testid="date-of-birth-field"]', '1990-01-15');
      
      const mappingValidation = await page.evaluate(() => {
        const formData = window.__SF86_FORM_STATE__;
        const section2 = formData?.section2;
        
        if (!section2) return { isValid: false, error: 'Section 2 not found' };
        
        const expectedMappings = {
          'date': 'form1[0].Sections1-6[0].DateField[0]',
          'estimated': 'form1[0].Sections1-6[0].CheckBox[0]',
          'age': 'form1[0].Sections1-6[0].TextField11[4]'
        };
        
        const errors: string[] = [];
        
        Object.entries(expectedMappings).forEach(([fieldName, expectedId]) => {
          const field = section2.dateOfBirth?.[fieldName];
          if (!field) {
            errors.push(`Field ${fieldName} not found`);
          } else if (field.id !== expectedId) {
            errors.push(`Field ${fieldName} has incorrect ID: expected ${expectedId}, got ${field.id}`);
          }
        });
        
        return { isValid: errors.length === 0, errors };
      });
      
      expect(mappingValidation.isValid).toBe(true);
      expect(mappingValidation.errors?.length || 0).toBe(0);
    });

    test('should validate Section 3 field mappings', async ({ page }) => {
      await page.click('[data-testid="section-3-tab"]');
      await page.fill('[data-testid="birth-city-field"]', 'TestCity');
      
      const mappingValidation = await page.evaluate(() => {
        const formData = window.__SF86_FORM_STATE__;
        const section3 = formData?.section3;
        
        if (!section3) return { isValid: false, error: 'Section 3 not found' };
        
        const expectedMappings = {
          'city': 'form1[0].Sections1-6[0].TextField11[5]',
          'state': 'form1[0].Sections1-6[0].DropDownList[0]',
          'country': 'form1[0].Sections1-6[0].DropDownList[1]',
          'isUSCitizen': 'form1[0].Sections1-6[0].RadioButtonList[0]'
        };
        
        const errors: string[] = [];
        
        Object.entries(expectedMappings).forEach(([fieldName, expectedId]) => {
          const field = section3.placeOfBirth?.[fieldName];
          if (!field) {
            errors.push(`Field ${fieldName} not found`);
          } else if (field.id !== expectedId) {
            errors.push(`Field ${fieldName} has incorrect ID: expected ${expectedId}, got ${field.id}`);
          }
        });
        
        return { isValid: errors.length === 0, errors };
      });
      
      expect(mappingValidation.isValid).toBe(true);
      expect(mappingValidation.errors?.length || 0).toBe(0);
    });
  });

  test.describe('Field Validation Rules', () => {
    test('should validate required field enforcement', async ({ page }) => {
      // Test Section 1 required fields
      await page.click('[data-testid="section-1-tab"]');
      await page.click('[data-testid="validate-section-button"]');
      
      // Should show required field errors
      await expect(page.locator('[data-testid="validation-errors"]')).toBeVisible();
      await expect(page.locator('[data-testid="last-name-error"]')).toContainText('required');
      await expect(page.locator('[data-testid="first-name-error"]')).toContainText('required');
    });

    test('should validate field format constraints', async ({ page }) => {
      // Test email format validation
      await page.click('[data-testid="section-7-tab"]');
      await page.fill('[data-testid="email-field"]', 'invalid-email-format');
      await page.click('[data-testid="validate-section-button"]');
      
      await expect(page.locator('[data-testid="email-format-error"]')).toContainText('Invalid email format');
      
      // Test phone format validation
      await page.fill('[data-testid="home-phone-field"]', '123');
      await page.click('[data-testid="validate-section-button"]');
      
      await expect(page.locator('[data-testid="phone-format-error"]')).toContainText('Invalid phone number');
    });

    test('should validate date constraints', async ({ page }) => {
      await page.click('[data-testid="section-2-tab"]');
      
      // Test future date validation
      const futureDate = new Date();
      futureDate.setFullYear(futureDate.getFullYear() + 1);
      const futureDateString = futureDate.toISOString().split('T')[0];
      
      await page.fill('[data-testid="date-of-birth-field"]', futureDateString);
      await page.click('[data-testid="validate-section-button"]');
      
      await expect(page.locator('[data-testid="future-date-error"]')).toContainText('Date cannot be in the future');
    });

    test('should validate field length constraints', async ({ page }) => {
      await page.click('[data-testid="section-1-tab"]');
      
      // Test maximum length validation
      const longString = 'a'.repeat(256); // Assuming 255 character limit
      await page.fill('[data-testid="last-name-field"]', longString);
      await page.click('[data-testid="validate-section-button"]');
      
      await expect(page.locator('[data-testid="length-error"]')).toContainText('exceeds maximum length');
    });
  });

  test.describe('Cross-Field Validation', () => {
    test('should validate date range consistency', async ({ page }) => {
      await page.click('[data-testid="section-8-tab"]');
      
      // Set issue date after expiration date
      await page.fill('[data-testid="passport-issue-date-field"]', '2025-01-01');
      await page.fill('[data-testid="passport-expiration-date-field"]', '2024-01-01');
      await page.click('[data-testid="validate-section-button"]');
      
      await expect(page.locator('[data-testid="date-range-error"]')).toContainText('Issue date cannot be after expiration date');
    });

    test('should validate conditional field requirements', async ({ page }) => {
      await page.click('[data-testid="section-3-tab"]');
      
      // Select US as country, state should become required
      await page.selectOption('[data-testid="birth-country-select"]', 'United States');
      await page.click('[data-testid="validate-section-button"]');
      
      await expect(page.locator('[data-testid="state-required-error"]')).toContainText('State is required for US locations');
    });
  });

  test.describe('PDF Service Compatibility', () => {
    test('should validate PDF service integration', async ({ page }) => {
      // Fill test data
      await fillTestDataForValidation(page);
      
      const compatibilityResult = await page.evaluate(async () => {
        const { checkPdfServiceCompatibility } = await import('../app/utils/fieldCompatibilityValidator');
        const formData = window.__SF86_FORM_STATE__;
        return checkPdfServiceCompatibility(formData);
      });
      
      expect(compatibilityResult.isCompatible).toBe(true);
      expect(compatibilityResult.issues.length).toBe(0);
    });

    test('should validate field ID uniqueness', async ({ page }) => {
      const uniquenessCheck = await page.evaluate(() => {
        const formData = window.__SF86_FORM_STATE__;
        const fieldIds = new Set<string>();
        const duplicates: string[] = [];
        
        const collectFieldIds = (obj: any) => {
          if (!obj || typeof obj !== 'object') return;
          
          Object.values(obj).forEach(value => {
            if (value && typeof value === 'object' && 'id' in value && 'value' in value) {
              const id = (value as any).id;
              if (fieldIds.has(id)) {
                duplicates.push(id);
              } else {
                fieldIds.add(id);
              }
            } else if (value && typeof value === 'object') {
              collectFieldIds(value);
            }
          });
        };
        
        collectFieldIds(formData);
        
        return {
          totalIds: fieldIds.size,
          duplicates,
          isUnique: duplicates.length === 0
        };
      });
      
      expect(uniquenessCheck.isUnique).toBe(true);
      expect(uniquenessCheck.duplicates.length).toBe(0);
      expect(uniquenessCheck.totalIds).toBeGreaterThan(0);
    });
  });

  test.describe('Performance Validation', () => {
    test('should validate form rendering performance', async ({ page }) => {
      const startTime = Date.now();
      
      // Navigate through all sections to test rendering performance
      for (let i = 1; i <= 30; i++) {
        const sectionTab = `[data-testid="section-${i}-tab"]`;
        const sectionExists = await page.locator(sectionTab).isVisible().catch(() => false);
        
        if (sectionExists) {
          await page.click(sectionTab);
          await page.waitForSelector(`[data-testid="section${i}-form"]`, { timeout: 5000 }).catch(() => {});
        }
      }
      
      const endTime = Date.now();
      const renderTime = endTime - startTime;
      
      // Should render all sections within reasonable time (10 seconds)
      expect(renderTime).toBeLessThan(10000);
    });

    test('should validate field update performance', async ({ page }) => {
      await page.click('[data-testid="section-1-tab"]');
      
      const startTime = Date.now();
      
      // Perform multiple field updates
      for (let i = 0; i < 10; i++) {
        await page.fill('[data-testid="last-name-field"]', `TestName${i}`);
        await page.waitForTimeout(10); // Small delay to allow context updates
      }
      
      const endTime = Date.now();
      const updateTime = endTime - startTime;
      
      // Should complete updates within reasonable time (2 seconds)
      expect(updateTime).toBeLessThan(2000);
    });
  });
});

/**
 * Helper function to fill test data for validation tests
 */
async function fillTestDataForValidation(page: any) {
  // Section 1
  await page.click('[data-testid="section-1-tab"]');
  await page.fill('[data-testid="last-name-field"]', 'ValidationTest');
  await page.fill('[data-testid="first-name-field"]', 'Field');
  
  // Section 2
  await page.click('[data-testid="section-2-tab"]');
  await page.fill('[data-testid="date-of-birth-field"]', '1990-01-15');
  
  // Section 3
  await page.click('[data-testid="section-3-tab"]');
  await page.fill('[data-testid="birth-city-field"]', 'TestCity');
  await page.selectOption('[data-testid="birth-country-select"]', 'United States');
  await page.selectOption('[data-testid="birth-state-select"]', 'NY');
  
  console.log('✅ Test data filled for validation tests');
}
