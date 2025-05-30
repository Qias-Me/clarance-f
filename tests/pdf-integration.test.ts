/**
 * PDF Integration Tests
 * 
 * Comprehensive tests for PDF service integration including field mapping,
 * PDF generation, download functionality, and validation across all sections.
 */

import { test, expect } from '@playwright/test';

test.describe('PDF Integration', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the SF-86 form
    await page.goto('/startForm');
    await page.waitForSelector('[data-testid="sf86-form-container"]');
    
    // Fill in some test data for PDF generation
    await fillTestData(page);
  });

  test.describe('PDF Generation', () => {
    test('should generate PDF from form data', async ({ page }) => {
      // Click PDF generation button
      await page.click('[data-testid="generate-pdf-button"]');
      
      // Wait for PDF generation to complete
      await page.waitForSelector('[data-testid="pdf-generation-success"]', { timeout: 30000 });
      
      // Verify success message
      await expect(page.locator('[data-testid="pdf-generation-success"]')).toContainText('PDF generated successfully');
      
      // Check that PDF stats are displayed
      await expect(page.locator('[data-testid="fields-mapped-count"]')).toBeVisible();
      await expect(page.locator('[data-testid="fields-applied-count"]')).toBeVisible();
    });

    test('should handle PDF generation errors gracefully', async ({ page }) => {
      // Simulate PDF generation error by corrupting form data
      await page.evaluate(() => {
        window.__SF86_FORM_STATE__ = null;
      });
      
      await page.click('[data-testid="generate-pdf-button"]');
      
      // Wait for error message
      await page.waitForSelector('[data-testid="pdf-generation-error"]');
      await expect(page.locator('[data-testid="pdf-generation-error"]')).toContainText('PDF generation failed');
    });

    test('should show PDF generation progress', async ({ page }) => {
      await page.click('[data-testid="generate-pdf-button"]');
      
      // Check for progress indicator
      await expect(page.locator('[data-testid="pdf-generation-progress"]')).toBeVisible();
      await expect(page.locator('[data-testid="pdf-progress-text"]')).toContainText('Generating PDF...');
    });
  });

  test.describe('PDF Download', () => {
    test('should download generated PDF', async ({ page }) => {
      // Set up download handling
      const downloadPromise = page.waitForEvent('download');
      
      // Generate and download PDF
      await page.click('[data-testid="download-pdf-button"]');
      
      // Wait for download to start
      const download = await downloadPromise;
      
      // Verify download properties
      expect(download.suggestedFilename()).toMatch(/SF86.*\.pdf$/);
      
      // Verify download completes successfully
      const path = await download.path();
      expect(path).toBeTruthy();
    });

    test('should allow custom filename for PDF download', async ({ page }) => {
      // Open filename dialog
      await page.click('[data-testid="download-options-button"]');
      
      // Set custom filename
      await page.fill('[data-testid="custom-filename-input"]', 'MyCustomSF86Form');
      
      const downloadPromise = page.waitForEvent('download');
      await page.click('[data-testid="download-with-custom-name"]');
      
      const download = await downloadPromise;
      expect(download.suggestedFilename()).toBe('MyCustomSF86Form.pdf');
    });
  });

  test.describe('Field Mapping Validation', () => {
    test('should validate field mapping accuracy', async ({ page }) => {
      await page.click('[data-testid="validate-pdf-mapping-button"]');
      
      // Wait for validation to complete
      await page.waitForSelector('[data-testid="mapping-validation-results"]');
      
      // Check validation results
      const validationResult = await page.locator('[data-testid="mapping-validation-summary"]').textContent();
      expect(validationResult).toContain('Field mapping validation');
      
      // Verify no critical errors
      const criticalErrors = await page.locator('[data-testid="critical-mapping-errors"]').count();
      expect(criticalErrors).toBe(0);
    });

    test('should show field mapping statistics', async ({ page }) => {
      await page.click('[data-testid="show-pdf-stats-button"]');
      
      // Verify stats are displayed
      await expect(page.locator('[data-testid="total-pdf-fields"]')).toBeVisible();
      await expect(page.locator('[data-testid="mapped-fields-count"]')).toBeVisible();
      await expect(page.locator('[data-testid="unmapped-fields-count"]')).toBeVisible();
      
      // Verify stats have reasonable values
      const totalFields = await page.locator('[data-testid="total-pdf-fields"]').textContent();
      const mappedFields = await page.locator('[data-testid="mapped-fields-count"]').textContent();
      
      expect(parseInt(totalFields || '0')).toBeGreaterThan(0);
      expect(parseInt(mappedFields || '0')).toBeGreaterThan(0);
    });

    test('should identify unmapped fields', async ({ page }) => {
      await page.click('[data-testid="show-unmapped-fields-button"]');
      
      // Check if unmapped fields list is shown
      await expect(page.locator('[data-testid="unmapped-fields-list"]')).toBeVisible();
      
      // Verify list format
      const unmappedFieldsExist = await page.locator('[data-testid="unmapped-field-item"]').count();
      // Should either have unmapped fields or show "no unmapped fields" message
      const noUnmappedMessage = await page.locator('[data-testid="no-unmapped-fields"]').isVisible();
      
      expect(unmappedFieldsExist > 0 || noUnmappedMessage).toBe(true);
    });
  });

  test.describe('Section-Specific PDF Mapping', () => {
    test('should map Section 1 fields correctly', async ({ page }) => {
      await page.click('[data-testid="section-1-tab"]');
      
      // Fill Section 1 data
      await page.fill('[data-testid="last-name-field"]', 'PDFTestLastName');
      await page.fill('[data-testid="first-name-field"]', 'PDFTestFirstName');
      await page.fill('[data-testid="middle-name-field"]', 'PDFTestMiddleName');
      
      // Validate Section 1 PDF mapping
      await page.click('[data-testid="validate-section-pdf-mapping"]');
      
      const mappingResult = await page.locator('[data-testid="section1-mapping-result"]').textContent();
      expect(mappingResult).toContain('Section 1 mapping: VALID');
    });

    test('should map Section 2 fields correctly', async ({ page }) => {
      await page.click('[data-testid="section-2-tab"]');
      
      // Fill Section 2 data
      await page.fill('[data-testid="date-of-birth-field"]', '1990-01-15');
      await page.check('[data-testid="estimated-checkbox"]');
      
      // Validate Section 2 PDF mapping
      await page.click('[data-testid="validate-section-pdf-mapping"]');
      
      const mappingResult = await page.locator('[data-testid="section2-mapping-result"]').textContent();
      expect(mappingResult).toContain('Section 2 mapping: VALID');
    });

    test('should map Section 29 fields correctly', async ({ page }) => {
      await page.click('[data-testid="section-29-tab"]');
      
      // Add an association entry
      await page.click('[data-testid="add-association-button"]');
      await page.fill('[data-testid="organization-name"]', 'PDF Test Organization');
      await page.fill('[data-testid="organization-address"]', '123 PDF Test St');
      await page.click('[data-testid="save-entry-button"]');
      
      // Validate Section 29 PDF mapping
      await page.click('[data-testid="validate-section-pdf-mapping"]');
      
      const mappingResult = await page.locator('[data-testid="section29-mapping-result"]').textContent();
      expect(mappingResult).toContain('Section 29 mapping: VALID');
    });
  });

  test.describe('PDF Field ID Validation', () => {
    test('should validate field ID patterns', async ({ page }) => {
      // Run field ID validation
      const validationResult = await page.evaluate(async () => {
        // Import the test utility
        const { testFieldIdGeneration } = await import('../app/utils/pdfIntegrationTest');
        return testFieldIdGeneration();
      });
      
      expect(validationResult.success).toBe(true);
      expect(validationResult.results.invalidFields.length).toBe(0);
    });

    test('should validate PDF service compatibility', async ({ page }) => {
      // Run compatibility test
      const compatibilityResult = await page.evaluate(async () => {
        const { checkPdfServiceCompatibility } = await import('../app/utils/fieldCompatibilityValidator');
        const formData = window.__SF86_FORM_STATE__;
        return checkPdfServiceCompatibility(formData);
      });
      
      expect(compatibilityResult.isCompatible).toBe(true);
      expect(compatibilityResult.issues.length).toBe(0);
    });
  });

  test.describe('Error Handling', () => {
    test('should handle PDF service unavailable', async ({ page }) => {
      // Mock PDF service failure
      await page.route('**/api/pdf-proxy**', route => route.abort());
      
      await page.click('[data-testid="generate-pdf-button"]');
      
      // Should show appropriate error message
      await expect(page.locator('[data-testid="pdf-service-error"]')).toContainText('PDF service unavailable');
    });

    test('should handle invalid form data', async ({ page }) => {
      // Corrupt form data
      await page.evaluate(() => {
        window.__SF86_FORM_STATE__ = { invalid: 'data' };
      });
      
      await page.click('[data-testid="generate-pdf-button"]');
      
      // Should show validation error
      await expect(page.locator('[data-testid="form-data-error"]')).toContainText('Invalid form data');
    });
  });
});

/**
 * Helper function to fill test data across multiple sections
 */
async function fillTestData(page: any) {
  // Section 1 - Personal Information
  await page.click('[data-testid="section-1-tab"]');
  await page.fill('[data-testid="last-name-field"]', 'TestLastName');
  await page.fill('[data-testid="first-name-field"]', 'TestFirstName');
  await page.fill('[data-testid="middle-name-field"]', 'TestMiddleName');
  
  // Section 2 - Date of Birth
  await page.click('[data-testid="section-2-tab"]');
  await page.fill('[data-testid="date-of-birth-field"]', '1990-01-15');
  
  // Section 3 - Place of Birth
  await page.click('[data-testid="section-3-tab"]');
  await page.fill('[data-testid="birth-city-field"]', 'TestCity');
  await page.selectOption('[data-testid="birth-state-select"]', 'NY');
  await page.selectOption('[data-testid="birth-country-select"]', 'United States');
  
  console.log('✅ Test data filled across sections');
}
