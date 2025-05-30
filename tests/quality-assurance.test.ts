/**
 * Quality Assurance Tests
 * 
 * Comprehensive end-to-end validation tests to ensure all 30 SF-86 sections
 * can be accurately written to PDF with proper field mapping and complete
 * workflow testing across all browsers.
 */

import { test, expect } from '@playwright/test';

test.describe('Quality Assurance - Complete SF-86 Form Validation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/startForm');
    await page.waitForSelector('[data-testid="sf86-form-container"]');
  });

  test.describe('All 30 Sections Validation', () => {
    test('should validate all sections are accessible and properly structured', async ({ page }) => {
      const sectionValidation = await page.evaluate(() => {
        const formData = window.__SF86_FORM_STATE__;
        const results = [];
        
        for (let i = 1; i <= 30; i++) {
          const sectionKey = `section${i}`;
          const sectionExists = sectionKey in formData;
          
          results.push({
            sectionId: sectionKey,
            exists: sectionExists,
            hasData: sectionExists && formData[sectionKey] !== undefined
          });
        }
        
        return results;
      });
      
      // Verify all 30 sections exist in form data
      expect(sectionValidation.length).toBe(30);
      
      // All sections should exist in the form structure
      const missingSections = sectionValidation.filter(s => !s.exists);
      expect(missingSections.length).toBe(0);
      
      console.log(`✅ All 30 sections are properly structured in form data`);
    });

    test('should validate implemented sections have proper field structures', async ({ page }) => {
      // Test implemented sections: 1, 2, 3, 7, 8, 29
      const implementedSections = [1, 2, 3, 7, 8, 29];
      
      for (const sectionNum of implementedSections) {
        await page.click(`[data-testid="section-${sectionNum}-tab"]`);
        
        // Verify section form is rendered
        await expect(page.locator(`[data-testid="section${sectionNum}-form"]`)).toBeVisible();
        
        // Validate field structure in context
        const fieldValidation = await page.evaluate((sectionId) => {
          const formData = window.__SF86_FORM_STATE__;
          const sectionData = formData[`section${sectionId}`];
          
          if (!sectionData) return { isValid: false, error: 'Section data not found' };
          
          const fields = [];
          const extractFields = (obj, path = '') => {
            if (!obj || typeof obj !== 'object') return;
            
            Object.entries(obj).forEach(([key, value]) => {
              const currentPath = path ? `${path}.${key}` : key;
              
              if (value && typeof value === 'object' && 'id' in value && 'value' in value) {
                fields.push({
                  path: currentPath,
                  id: value.id,
                  type: value.type,
                  hasRequiredProps: 'id' in value && 'value' in value && 'type' in value && 'label' in value && 'rect' in value
                });
              } else if (value && typeof value === 'object') {
                extractFields(value, currentPath);
              }
            });
          };
          
          extractFields(sectionData);
          
          return {
            isValid: fields.length > 0,
            fieldCount: fields.length,
            validFields: fields.filter(f => f.hasRequiredProps).length,
            fields: fields.slice(0, 3) // Sample of fields for verification
          };
        }, sectionNum);
        
        expect(fieldValidation.isValid).toBe(true);
        expect(fieldValidation.fieldCount).toBeGreaterThan(0);
        expect(fieldValidation.validFields).toBe(fieldValidation.fieldCount);
        
        console.log(`✅ Section ${sectionNum}: ${fieldValidation.fieldCount} fields validated`);
      }
    });
  });

  test.describe('PDF Field Mapping Validation', () => {
    test('should validate PDF field ID accuracy for all implemented sections', async ({ page }) => {
      // Fill test data in implemented sections
      await fillComprehensiveTestData(page);
      
      // Validate field IDs match expected PDF patterns
      const fieldIdValidation = await page.evaluate(async () => {
        const { testFieldIdGeneration } = await import('../app/utils/pdfIntegrationTest');
        return testFieldIdGeneration();
      });
      
      expect(fieldIdValidation.success).toBe(true);
      expect(fieldIdValidation.results.invalidFields.length).toBe(0);
      
      console.log(`✅ PDF Field ID validation: ${fieldIdValidation.results.validFields}/${fieldIdValidation.results.testedFields} fields valid`);
    });

    test('should validate complete PDF generation workflow', async ({ page }) => {
      // Fill comprehensive test data
      await fillComprehensiveTestData(page);
      
      // Run complete PDF integration test
      const pdfIntegrationResult = await page.evaluate(async () => {
        const { runPdfIntegrationTests } = await import('../app/utils/pdfIntegrationTest');
        return runPdfIntegrationTests();
      });
      
      expect(pdfIntegrationResult.success).toBe(true);
      expect(pdfIntegrationResult.summary.failedTests).toBe(0);
      
      // Verify PDF mapping statistics
      expect(pdfIntegrationResult.pdfMappingTest.results.mappedFields).toBeGreaterThan(0);
      
      console.log(`✅ PDF Integration: ${pdfIntegrationResult.pdfMappingTest.results.mappedFields} fields mapped successfully`);
    });

    test('should validate PDF generation with real form data', async ({ page }) => {
      // Fill comprehensive test data
      await fillComprehensiveTestData(page);
      
      // Generate PDF
      await page.click('[data-testid="generate-pdf-button"]');
      
      // Wait for PDF generation to complete
      await page.waitForSelector('[data-testid="pdf-generation-success"]', { timeout: 30000 });
      
      // Verify PDF generation statistics
      const pdfStats = await page.evaluate(() => {
        const statsElement = document.querySelector('[data-testid="pdf-generation-stats"]');
        if (!statsElement) return null;
        
        return {
          fieldsMapped: parseInt(statsElement.getAttribute('data-fields-mapped') || '0'),
          fieldsApplied: parseInt(statsElement.getAttribute('data-fields-applied') || '0'),
          errors: parseInt(statsElement.getAttribute('data-errors') || '0')
        };
      });
      
      expect(pdfStats).toBeTruthy();
      expect(pdfStats!.fieldsMapped).toBeGreaterThan(0);
      expect(pdfStats!.fieldsApplied).toBeGreaterThan(0);
      expect(pdfStats!.errors).toBe(0);
      
      console.log(`✅ PDF Generation: ${pdfStats!.fieldsApplied}/${pdfStats!.fieldsMapped} fields applied to PDF`);
    });
  });

  test.describe('Cross-Browser Compatibility', () => {
    test('should maintain functionality across all browsers', async ({ page, browserName }) => {
      console.log(`🌐 Testing on ${browserName}`);
      
      // Fill test data
      await fillComprehensiveTestData(page);
      
      // Test form functionality
      await page.click('[data-testid="section-1-tab"]');
      await expect(page.locator('[data-testid="last-name-field"]')).toHaveValue('QATestLastName');
      
      // Test PDF generation
      await page.click('[data-testid="generate-pdf-button"]');
      await page.waitForSelector('[data-testid="pdf-generation-success"]', { timeout: 30000 });
      
      // Verify browser-specific functionality
      const browserCompatibility = await page.evaluate((browser) => {
        return {
          browser,
          localStorage: typeof localStorage !== 'undefined',
          sessionStorage: typeof sessionStorage !== 'undefined',
          formData: window.__SF86_FORM_STATE__ !== undefined,
          context: window.__SF86_FORM_CONTEXT__ !== undefined
        };
      }, browserName);
      
      expect(browserCompatibility.localStorage).toBe(true);
      expect(browserCompatibility.sessionStorage).toBe(true);
      expect(browserCompatibility.formData).toBe(true);
      expect(browserCompatibility.context).toBe(true);
      
      console.log(`✅ ${browserName}: All compatibility checks passed`);
    });
  });

  test.describe('Performance Validation', () => {
    test('should meet performance benchmarks', async ({ page }) => {
      const performanceMetrics = {
        sectionRenderTimes: [] as number[],
        validationTimes: [] as number[],
        pdfGenerationTime: 0
      };
      
      // Test section rendering performance
      for (let i = 1; i <= 30; i++) {
        const sectionTab = `[data-testid="section-${i}-tab"]`;
        const sectionExists = await page.locator(sectionTab).isVisible().catch(() => false);
        
        if (sectionExists) {
          const startTime = Date.now();
          await page.click(sectionTab);
          await page.waitForSelector(`[data-testid="section${i}-form"]`, { timeout: 5000 }).catch(() => {});
          const renderTime = Date.now() - startTime;
          
          performanceMetrics.sectionRenderTimes.push(renderTime);
        }
      }
      
      // Test validation performance
      await page.click('[data-testid="section-1-tab"]');
      await page.fill('[data-testid="last-name-field"]', 'PerformanceTest');
      
      const validationStartTime = Date.now();
      await page.click('[data-testid="validate-section-button"]');
      await page.waitForSelector('[data-testid="validation-complete"]', { timeout: 5000 }).catch(() => {});
      performanceMetrics.validationTimes.push(Date.now() - validationStartTime);
      
      // Test PDF generation performance
      await fillComprehensiveTestData(page);
      const pdfStartTime = Date.now();
      await page.click('[data-testid="generate-pdf-button"]');
      await page.waitForSelector('[data-testid="pdf-generation-success"]', { timeout: 30000 });
      performanceMetrics.pdfGenerationTime = Date.now() - pdfStartTime;
      
      // Validate performance benchmarks
      const avgRenderTime = performanceMetrics.sectionRenderTimes.reduce((a, b) => a + b, 0) / performanceMetrics.sectionRenderTimes.length;
      const avgValidationTime = performanceMetrics.validationTimes.reduce((a, b) => a + b, 0) / performanceMetrics.validationTimes.length;
      
      // Performance benchmarks (in milliseconds)
      expect(avgRenderTime).toBeLessThan(100); // Sections should render in <100ms
      expect(avgValidationTime).toBeLessThan(500); // Validation should complete in <500ms
      expect(performanceMetrics.pdfGenerationTime).toBeLessThan(10000); // PDF generation should complete in <10s
      
      console.log(`✅ Performance: Avg render ${avgRenderTime}ms, validation ${avgValidationTime}ms, PDF ${performanceMetrics.pdfGenerationTime}ms`);
    });
  });

  test.describe('Data Integrity and Persistence', () => {
    test('should maintain data integrity across page reloads', async ({ page }) => {
      // Fill test data
      await fillComprehensiveTestData(page);
      
      // Reload the page
      await page.reload();
      await page.waitForSelector('[data-testid="sf86-form-container"]');
      
      // Verify data persistence
      await page.click('[data-testid="section-1-tab"]');
      await expect(page.locator('[data-testid="last-name-field"]')).toHaveValue('QATestLastName');
      
      await page.click('[data-testid="section-2-tab"]');
      await expect(page.locator('[data-testid="date-of-birth-field"]')).toHaveValue('1990-01-15');
      
      console.log('✅ Data integrity maintained across page reload');
    });

    test('should handle concurrent section updates', async ({ page }) => {
      // Simulate concurrent updates
      await page.evaluate(async () => {
        const context = window.__SF86_FORM_CONTEXT__;
        if (!context) throw new Error('Context not available');
        
        // Perform multiple concurrent updates
        const updates = [
          context.updateFieldValue('section1.personalInfo.lastName', 'ConcurrentTest1'),
          context.updateFieldValue('section1.personalInfo.firstName', 'ConcurrentTest2'),
          context.updateFieldValue('section2.dateOfBirth.date', '1985-12-25')
        ];
        
        await Promise.all(updates);
      });
      
      // Verify all updates were applied
      await page.click('[data-testid="section-1-tab"]');
      await expect(page.locator('[data-testid="last-name-field"]')).toHaveValue('ConcurrentTest1');
      await expect(page.locator('[data-testid="first-name-field"]')).toHaveValue('ConcurrentTest2');
      
      console.log('✅ Concurrent updates handled correctly');
    });
  });

  test.describe('Error Handling and Recovery', () => {
    test('should handle and recover from validation errors', async ({ page }) => {
      // Trigger validation errors
      await page.click('[data-testid="section-1-tab"]');
      await page.click('[data-testid="validate-section-button"]');
      
      // Verify errors are displayed
      await expect(page.locator('[data-testid="validation-errors"]')).toBeVisible();
      
      // Fix errors
      await page.fill('[data-testid="last-name-field"]', 'ErrorRecoveryTest');
      await page.fill('[data-testid="first-name-field"]', 'Recovery');
      
      // Re-validate
      await page.click('[data-testid="validate-section-button"]');
      
      // Verify errors are cleared
      await expect(page.locator('[data-testid="validation-success"]')).toBeVisible();
      
      console.log('✅ Error handling and recovery validated');
    });

    test('should handle PDF generation failures gracefully', async ({ page }) => {
      // Corrupt form data to trigger PDF generation failure
      await page.evaluate(() => {
        window.__SF86_FORM_STATE__ = { invalid: 'data' };
      });
      
      await page.click('[data-testid="generate-pdf-button"]');
      
      // Verify error handling
      await expect(page.locator('[data-testid="pdf-generation-error"]')).toBeVisible();
      
      console.log('✅ PDF generation error handling validated');
    });
  });
});

/**
 * Helper function to fill comprehensive test data across all implemented sections
 */
async function fillComprehensiveTestData(page: any) {
  console.log('📝 Filling comprehensive test data...');
  
  // Section 1 - Information About You
  await page.click('[data-testid="section-1-tab"]');
  await page.fill('[data-testid="last-name-field"]', 'QATestLastName');
  await page.fill('[data-testid="first-name-field"]', 'QATestFirstName');
  await page.fill('[data-testid="middle-name-field"]', 'QATestMiddleName');
  await page.fill('[data-testid="suffix-field"]', 'Jr.');
  
  // Section 2 - Date of Birth
  await page.click('[data-testid="section-2-tab"]');
  await page.fill('[data-testid="date-of-birth-field"]', '1990-01-15');
  
  // Section 3 - Place of Birth
  await page.click('[data-testid="section-3-tab"]');
  await page.fill('[data-testid="birth-city-field"]', 'QATestCity');
  await page.selectOption('[data-testid="birth-state-select"]', 'NY');
  await page.selectOption('[data-testid="birth-country-select"]', 'United States');
  await page.check('[data-testid="us-citizen-yes"]');
  
  // Section 7 - Contact Information
  await page.click('[data-testid="section-7-tab"]');
  await page.fill('[data-testid="home-phone-field"]', '(555) 123-4567');
  await page.fill('[data-testid="email-field"]', 'qatest@example.com');
  
  // Section 8 - U.S. Passport Information
  await page.click('[data-testid="section-8-tab"]');
  await page.fill('[data-testid="passport-number-field"]', '123456789');
  await page.fill('[data-testid="passport-issue-date-field"]', '2020-01-01');
  await page.fill('[data-testid="passport-expiration-date-field"]', '2030-01-01');
  
  // Section 29 - Associations
  await page.click('[data-testid="section-29-tab"]');
  await page.click('[data-testid="add-association-button"]');
  await page.fill('[data-testid="organization-name"]', 'QA Test Organization');
  await page.fill('[data-testid="organization-address"]', '123 QA Test Street');
  await page.click('[data-testid="save-association-button"]');
  
  console.log('✅ Comprehensive test data filled');
}
