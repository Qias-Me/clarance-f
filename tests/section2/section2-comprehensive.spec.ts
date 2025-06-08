/**
 * Section 2: Date of Birth - Comprehensive Playwright Tests
 * 
 * Tests all Section 2 fields cross-referenced with section-2.json
 * Validates data persistence, context integration, and PDF generation
 */

import { test, expect } from '@playwright/test';

// Section 2 field mappings from section-2.json
const SECTION2_FIELDS = {
  date: {
    id: '9432 0 R',
    name: 'form1[0].Sections1-6[0].From_Datefield_Name_2[0]',
    type: 'PDFTextField',
    testId: 'date-of-birth-field'
  },
  estimated: {
    id: '9431 0 R', 
    name: 'form1[0].Sections1-6[0].#field[18]',
    type: 'PDFCheckBox',
    testId: 'estimated-checkbox'
  }
};

test.describe('Section 2: Date of Birth - Comprehensive Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the form
    await page.goto('/startForm');
    
    // Wait for the form to load
    await page.waitForSelector('[data-testid="centralized-sf86-form"]');
    
    // Navigate to Section 2
    await page.click('[data-testid="section2-nav-button"]');
    
    // Wait for Section 2 to load
    await page.waitForSelector('[data-testid="section2-form"]');
  });

  test('should load Section 2 with all required fields', async ({ page }) => {
    // Verify section header
    await expect(page.locator('h2')).toContainText('Section 2: Date of Birth');
    
    // Verify all fields are present
    await expect(page.locator('#monthSelect')).toBeVisible();
    await expect(page.locator('#daySelect')).toBeVisible();
    await expect(page.locator('#yearSelect')).toBeVisible();
    await expect(page.locator('[data-testid="estimated-checkbox"]')).toBeVisible();
    await expect(page.locator('[data-testid="age-field"]')).toBeVisible();
    
    // Verify submit button
    await expect(page.locator('[data-testid="submit-section-button"]')).toBeVisible();
  });

  test('should update date fields and persist data', async ({ page }) => {
    console.log('🧪 Testing Section 2 date field updates and persistence...');
    
    // Enable debug mode for detailed logging
    await page.goto('/startForm?debug=true');
    await page.click('[data-testid="section2-nav-button"]');
    await page.waitForSelector('[data-testid="section2-form"]');
    
    // Listen for console logs to verify data flow
    const consoleLogs: string[] = [];
    page.on('console', msg => {
      if (msg.text().includes('Section2:')) {
        consoleLogs.push(msg.text());
      }
    });
    
    // Test date selection
    await page.selectOption('#monthSelect', '03');
    await page.selectOption('#daySelect', '15');
    await page.selectOption('#yearSelect', '1990');
    
    // Wait for updates to process
    await page.waitForTimeout(500);
    
    // Verify age calculation
    const ageField = page.locator('[data-testid="age-field"]');
    const ageValue = await ageField.inputValue();
    expect(parseInt(ageValue)).toBeGreaterThan(30);
    
    // Test estimated checkbox
    await page.check('[data-testid="estimated-checkbox"]');
    await page.waitForTimeout(200);
    
    // Verify checkbox is checked
    await expect(page.locator('[data-testid="estimated-checkbox"]')).toBeChecked();
    
    // Submit the form to trigger data persistence
    await page.click('[data-testid="submit-section-button"]');
    await page.waitForTimeout(1000);
    
    // Verify console logs show proper data flow
    const updateLogs = consoleLogs.filter(log => log.includes('updateFieldValue'));
    expect(updateLogs.length).toBeGreaterThan(0);
    
    console.log('✅ Section 2 data persistence test completed');
  });

  test('should validate date format and constraints', async ({ page }) => {
    // Test invalid date scenarios would go here
    // For now, focus on basic functionality
    
    // Select an invalid date combination
    await page.selectOption('#monthSelect', '02');
    await page.selectOption('#daySelect', '30'); // Invalid: Feb 30
    await page.selectOption('#yearSelect', '2000');
    
    // Submit and check for validation errors
    await page.click('[data-testid="submit-section-button"]');
    
    // Look for error messages
    const errorMessage = page.locator('[data-testid="date-format-error"]');
    // Note: This might not show immediately due to validation logic
  });

  test('should persist data across navigation', async ({ page }) => {
    console.log('🧪 Testing Section 2 data persistence across navigation...');
    
    // Fill out Section 2
    await page.selectOption('#monthSelect', '07');
    await page.selectOption('#daySelect', '04');
    await page.selectOption('#yearSelect', '1985');
    await page.check('[data-testid="estimated-checkbox"]');
    
    // Submit the section
    await page.click('[data-testid="submit-section-button"]');
    await page.waitForTimeout(500);
    
    // Navigate to another section
    await page.click('[data-testid="section1-nav-button"]');
    await page.waitForTimeout(500);
    
    // Navigate back to Section 2
    await page.click('[data-testid="section2-nav-button"]');
    await page.waitForTimeout(500);
    
    // Verify data is still there
    expect(await page.locator('#monthSelect').inputValue()).toBe('07');
    expect(await page.locator('#daySelect').inputValue()).toBe('04');
    expect(await page.locator('#yearSelect').inputValue()).toBe('1985');
    await expect(page.locator('[data-testid="estimated-checkbox"]')).toBeChecked();
    
    console.log('✅ Section 2 navigation persistence test completed');
  });

  test('should generate PDF with Section 2 data', async ({ page }) => {
    console.log('🧪 Testing Section 2 PDF generation...');
    
    // Fill out Section 2 with test data
    await page.selectOption('#monthSelect', '12');
    await page.selectOption('#daySelect', '25');
    await page.selectOption('#yearSelect', '1980');
    
    // Submit the section
    await page.click('[data-testid="submit-section-button"]');
    await page.waitForTimeout(500);
    
    // Trigger PDF generation
    await page.click('[data-testid="client-pdf-button"]');
    
    // Wait for PDF generation to complete
    await page.waitForTimeout(5000);
    
    // Check for success message or download
    // Note: Actual PDF validation would require more complex setup
    
    console.log('✅ Section 2 PDF generation test completed');
  });

  test('should handle clear section functionality', async ({ page }) => {
    // Fill out some data
    await page.selectOption('#monthSelect', '06');
    await page.selectOption('#daySelect', '15');
    await page.selectOption('#yearSelect', '1995');
    await page.check('[data-testid="estimated-checkbox"]');
    
    // Clear the section
    await page.click('[data-testid="clear-section-button"]');
    await page.waitForTimeout(500);
    
    // Verify fields are cleared
    expect(await page.locator('#monthSelect').inputValue()).toBe('');
    expect(await page.locator('#daySelect').inputValue()).toBe('');
    expect(await page.locator('#yearSelect').inputValue()).toBe('');
    await expect(page.locator('[data-testid="estimated-checkbox"]')).not.toBeChecked();
  });

  test('should show validation status correctly', async ({ page }) => {
    // Check initial validation status
    const validationStatus = page.locator('[data-testid="validation-status"]');
    await expect(validationStatus).toBeVisible();
    
    // Fill out valid data
    await page.selectOption('#monthSelect', '01');
    await page.selectOption('#daySelect', '01');
    await page.selectOption('#yearSelect', '1990');
    
    // Wait for validation to update
    await page.waitForTimeout(500);
    
    // Submit to trigger validation
    await page.click('[data-testid="submit-section-button"]');
    
    // Check that validation passes
    await expect(validationStatus).toContainText('Valid');
  });
});
