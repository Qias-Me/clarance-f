/**
 * SF-86 Form Context Integration Tests
 * 
 * Comprehensive tests for the SF86FormContext including CRUD operations,
 * state management, validation, and PDF integration across all 30 sections.
 */

import { test, expect } from '@playwright/test';

test.describe('SF86FormContext Integration', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the SF-86 form start page
    await page.goto('/startForm');
    
    // Wait for the form to load
    await page.waitForSelector('[data-testid="sf86-form-container"]', { timeout: 10000 });
    
    // Verify SF86FormContext is initialized
    await expect(page.locator('[data-testid="form-status"]')).toBeVisible();
  });

  test.describe('Form Initialization', () => {
    test('should initialize with all 30 sections', async ({ page }) => {
      // Check that all sections are available in the form state
      const sectionCount = await page.evaluate(() => {
        const formData = window.__SF86_FORM_STATE__;
        if (!formData) return 0;
        
        let count = 0;
        for (let i = 1; i <= 30; i++) {
          if (`section${i}` in formData) count++;
        }
        return count;
      });
      
      expect(sectionCount).toBe(30);
    });

    test('should have proper default state structure', async ({ page }) => {
      const hasValidStructure = await page.evaluate(() => {
        const formData = window.__SF86_FORM_STATE__;
        return formData && 
               typeof formData === 'object' &&
               'section1' in formData &&
               'section29' in formData &&
               'print' in formData;
      });
      
      expect(hasValidStructure).toBe(true);
    });

    test('should initialize context methods', async ({ page }) => {
      const hasContextMethods = await page.evaluate(() => {
        const context = window.__SF86_FORM_CONTEXT__;
        return context &&
               typeof context.updateFieldValue === 'function' &&
               typeof context.validateSection === 'function' &&
               typeof context.generatePdf === 'function' &&
               typeof context.createSectionEntry === 'function';
      });
      
      expect(hasContextMethods).toBe(true);
    });
  });

  test.describe('CRUD Operations', () => {
    test('should create section entries', async ({ page }) => {
      // Navigate to a section that supports entries (like Section 29)
      await page.click('[data-testid="section-29-tab"]');
      await page.waitForSelector('[data-testid="section29-form"]');
      
      // Create a new entry
      await page.click('[data-testid="add-association-button"]');
      
      // Fill in entry data
      await page.fill('[data-testid="organization-name"]', 'Test Organization');
      await page.fill('[data-testid="organization-address"]', '123 Test St');
      
      // Save the entry
      await page.click('[data-testid="save-entry-button"]');
      
      // Verify entry was created
      await expect(page.locator('[data-testid="association-entry-0"]')).toBeVisible();
      await expect(page.locator('[data-testid="organization-name-display"]')).toContainText('Test Organization');
    });

    test('should update section entries', async ({ page }) => {
      // First create an entry
      await page.click('[data-testid="section-29-tab"]');
      await page.click('[data-testid="add-association-button"]');
      await page.fill('[data-testid="organization-name"]', 'Original Name');
      await page.click('[data-testid="save-entry-button"]');
      
      // Edit the entry
      await page.click('[data-testid="edit-entry-0"]');
      await page.fill('[data-testid="organization-name"]', 'Updated Name');
      await page.click('[data-testid="save-entry-button"]');
      
      // Verify update
      await expect(page.locator('[data-testid="organization-name-display"]')).toContainText('Updated Name');
    });

    test('should delete section entries', async ({ page }) => {
      // Create an entry first
      await page.click('[data-testid="section-29-tab"]');
      await page.click('[data-testid="add-association-button"]');
      await page.fill('[data-testid="organization-name"]', 'To Be Deleted');
      await page.click('[data-testid="save-entry-button"]');
      
      // Delete the entry
      await page.click('[data-testid="delete-entry-0"]');
      await page.click('[data-testid="confirm-delete"]');
      
      // Verify deletion
      await expect(page.locator('[data-testid="association-entry-0"]')).not.toBeVisible();
    });

    test('should duplicate section entries', async ({ page }) => {
      // Create an entry first
      await page.click('[data-testid="section-29-tab"]');
      await page.click('[data-testid="add-association-button"]');
      await page.fill('[data-testid="organization-name"]', 'Original Entry');
      await page.click('[data-testid="save-entry-button"]');
      
      // Duplicate the entry
      await page.click('[data-testid="duplicate-entry-0"]');
      
      // Verify duplication
      await expect(page.locator('[data-testid="association-entry-1"]')).toBeVisible();
      await expect(page.locator('[data-testid="association-entry-1"] [data-testid="organization-name-display"]')).toContainText('Original Entry');
    });
  });

  test.describe('Field Value Updates', () => {
    test('should update field values in Section 1', async ({ page }) => {
      await page.click('[data-testid="section-1-tab"]');
      
      // Update last name
      await page.fill('[data-testid="last-name-field"]', 'TestLastName');
      
      // Update first name
      await page.fill('[data-testid="first-name-field"]', 'TestFirstName');
      
      // Verify values are updated in context
      const fieldValues = await page.evaluate(() => {
        const formData = window.__SF86_FORM_STATE__;
        return {
          lastName: formData?.section1?.personalInfo?.lastName?.value,
          firstName: formData?.section1?.personalInfo?.firstName?.value
        };
      });
      
      expect(fieldValues.lastName).toBe('TestLastName');
      expect(fieldValues.firstName).toBe('TestFirstName');
    });

    test('should update field values in Section 2', async ({ page }) => {
      await page.click('[data-testid="section-2-tab"]');
      
      // Update date of birth
      await page.fill('[data-testid="date-of-birth-field"]', '1990-01-15');
      
      // Check estimated checkbox
      await page.check('[data-testid="estimated-checkbox"]');
      
      // Verify values are updated
      const fieldValues = await page.evaluate(() => {
        const formData = window.__SF86_FORM_STATE__;
        return {
          dateOfBirth: formData?.section2?.dateOfBirth?.date?.value,
          estimated: formData?.section2?.dateOfBirth?.estimated?.value
        };
      });
      
      expect(fieldValues.dateOfBirth).toBe('1990-01-15');
      expect(fieldValues.estimated).toBe(true);
    });
  });

  test.describe('Validation', () => {
    test('should validate required fields', async ({ page }) => {
      await page.click('[data-testid="section-1-tab"]');
      
      // Try to proceed without filling required fields
      await page.click('[data-testid="validate-section-button"]');
      
      // Check for validation errors
      await expect(page.locator('[data-testid="validation-error"]')).toBeVisible();
      await expect(page.locator('[data-testid="last-name-error"]')).toContainText('Last name is required');
    });

    test('should validate field formats', async ({ page }) => {
      await page.click('[data-testid="section-2-tab"]');
      
      // Enter invalid date format
      await page.fill('[data-testid="date-of-birth-field"]', 'invalid-date');
      await page.click('[data-testid="validate-section-button"]');
      
      // Check for format validation error
      await expect(page.locator('[data-testid="date-format-error"]')).toBeVisible();
    });

    test('should validate cross-section dependencies', async ({ page }) => {
      // This test would check dependencies between sections
      // For example, if Section 3 depends on Section 1 being complete
      
      await page.click('[data-testid="section-3-tab"]');
      await page.click('[data-testid="validate-dependencies-button"]');
      
      // Should show dependency error if Section 1 is not complete
      const hasDependencyError = await page.locator('[data-testid="dependency-error"]').isVisible();
      expect(hasDependencyError).toBe(true);
    });
  });

  test.describe('Auto-save Functionality', () => {
    test('should auto-save form data', async ({ page }) => {
      await page.click('[data-testid="section-1-tab"]');
      
      // Fill in a field
      await page.fill('[data-testid="last-name-field"]', 'AutoSaveTest');
      
      // Wait for auto-save (assuming 2 second delay)
      await page.waitForTimeout(3000);
      
      // Check if auto-save indicator appears
      await expect(page.locator('[data-testid="auto-save-indicator"]')).toContainText('Saved');
    });

    test('should restore data after page reload', async ({ page }) => {
      await page.click('[data-testid="section-1-tab"]');
      
      // Fill in data
      await page.fill('[data-testid="last-name-field"]', 'PersistenceTest');
      await page.fill('[data-testid="first-name-field"]', 'Data');
      
      // Wait for auto-save
      await page.waitForTimeout(3000);
      
      // Reload the page
      await page.reload();
      await page.waitForSelector('[data-testid="sf86-form-container"]');
      
      // Navigate back to section 1
      await page.click('[data-testid="section-1-tab"]');
      
      // Verify data is restored
      await expect(page.locator('[data-testid="last-name-field"]')).toHaveValue('PersistenceTest');
      await expect(page.locator('[data-testid="first-name-field"]')).toHaveValue('Data');
    });
  });

  test.describe('Bulk Operations', () => {
    test('should perform bulk section updates', async ({ page }) => {
      // This would test the bulkUpdateSections method
      const result = await page.evaluate(async () => {
        const context = window.__SF86_FORM_CONTEXT__;
        if (!context) return false;
        
        const updates = {
          'section1.personalInfo.lastName': { value: 'BulkLastName' },
          'section1.personalInfo.firstName': { value: 'BulkFirstName' },
          'section2.dateOfBirth.date': { value: '1985-12-25' }
        };
        
        context.bulkUpdateSections(updates);
        return true;
      });
      
      expect(result).toBe(true);
      
      // Verify the updates were applied
      await page.click('[data-testid="section-1-tab"]');
      await expect(page.locator('[data-testid="last-name-field"]')).toHaveValue('BulkLastName');
    });

    test('should perform bulk section validation', async ({ page }) => {
      const validationResult = await page.evaluate(async () => {
        const context = window.__SF86_FORM_CONTEXT__;
        if (!context) return null;
        
        return context.bulkValidateSections(['section1', 'section2', 'section3']);
      });
      
      expect(validationResult).toBeDefined();
      expect(validationResult).toHaveProperty('isValid');
      expect(validationResult).toHaveProperty('errors');
      expect(validationResult).toHaveProperty('warnings');
    });
  });
});
