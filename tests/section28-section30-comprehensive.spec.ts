/**
 * Comprehensive Playwright Test for Section 28 & Section 30 Data Persistence
 * 
 * This test verifies that the fixes for Section 28 and Section 30 data persistence
 * issues are working correctly, including:
 * - Test data population
 * - Field mapping corrections
 * - Date formatting fixes
 * - PDF generation integration
 */

import { test, expect } from '@playwright/test';

test.describe('Section 28 & Section 30 Data Persistence Tests', () => {
  
  test.beforeEach(async ({ page }) => {
    // Navigate to the form
    await page.goto('http://localhost:5173/startForm');
    
    // Wait for the form to load
    await page.waitForSelector('[data-testid="populate-test-data-button"]', { timeout: 10000 });
    
    // Clear any existing data
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
  });

  test('should populate Section 28 and Section 30 test data successfully', async ({ page }) => {
    console.log('🧪 Testing Section 28 & Section 30 test data population...');
    
    // Monitor console logs for test data population
    const populationLogs: string[] = [];
    page.on('console', msg => {
      const text = msg.text();
      if (text.includes('Populating Section 28') || 
          text.includes('Populating Section 30') ||
          text.includes('test data populated successfully')) {
        populationLogs.push(text);
      }
    });
    
    // Click the populate test data button
    await page.click('[data-testid="populate-test-data-button"]');
    
    // Wait for test data to be populated
    await page.waitForTimeout(3000);
    
    // Verify Section 28 population logs
    const section28Logs = populationLogs.filter(log => log.includes('Section 28'));
    expect(section28Logs.length).toBeGreaterThan(0);
    console.log('✅ Section 28 test data population verified');
    
    // Verify Section 30 population logs
    const section30Logs = populationLogs.filter(log => log.includes('Section 30'));
    expect(section30Logs.length).toBeGreaterThan(0);
    console.log('✅ Section 30 test data population verified');
    
    // Verify overall success
    const successLogs = populationLogs.filter(log => log.includes('test data populated successfully'));
    expect(successLogs.length).toBeGreaterThan(0);
    console.log('✅ Overall test data population success verified');
  });

  test('should verify Section 28 court action field mapping', async ({ page }) => {
    console.log('🧪 Testing Section 28 court action field mapping...');
    
    // Monitor console logs for field mapping
    const fieldMappingLogs: string[] = [];
    page.on('console', msg => {
      const text = msg.text();
      if (text.includes('Section 28') || 
          text.includes('court') ||
          text.includes('field mapping') ||
          text.includes('Field ID:')) {
        fieldMappingLogs.push(text);
      }
    });
    
    // Populate test data first
    await page.click('[data-testid="populate-test-data-button"]');
    await page.waitForTimeout(2000);
    
    // Generate PDF to trigger field mapping
    await page.click('[data-testid="server-pdf-button"]');
    
    // Wait for PDF generation to complete
    await page.waitForTimeout(5000);
    
    // Verify no "#field[12]" errors (the old bug)
    const errorLogs = fieldMappingLogs.filter(log => 
      log.includes('#field[12]') || 
      log.includes('Field not found in section 28')
    );
    expect(errorLogs.length).toBe(0);
    console.log('✅ No Section 28 field mapping errors found');
    
    // Verify Section 28 fields are being processed
    const section28FieldLogs = fieldMappingLogs.filter(log => 
      log.includes('Section 28') || 
      log.includes('court')
    );
    expect(section28FieldLogs.length).toBeGreaterThan(0);
    console.log('✅ Section 28 fields are being processed correctly');
  });

  test('should verify Section 30 date formatting fixes', async ({ page }) => {
    console.log('🧪 Testing Section 30 date formatting fixes...');
    
    // Monitor console logs for date formatting
    const dateFormattingLogs: string[] = [];
    page.on('console', msg => {
      const text = msg.text();
      if (text.includes('Section 30') || 
          text.includes('date') ||
          text.includes('MM/DD') ||
          text.includes('16262') ||
          text.includes('maxLength')) {
        dateFormattingLogs.push(text);
      }
    });
    
    // Populate test data first
    await page.click('[data-testid="populate-test-data-button"]');
    await page.waitForTimeout(2000);
    
    // Generate PDF to trigger field mapping
    await page.click('[data-testid="server-pdf-button"]');
    
    // Wait for PDF generation to complete
    await page.waitForTimeout(5000);
    
    // Verify no maxLength=5 truncation errors for field 16262
    const truncationErrors = dateFormattingLogs.filter(log => 
      log.includes('16262') && 
      log.includes('maxLength=5') &&
      log.includes('truncated')
    );
    expect(truncationErrors.length).toBe(0);
    console.log('✅ No Section 30 date truncation errors found');
    
    // Verify proper date formatting messages
    const dateFormatLogs = dateFormattingLogs.filter(log => 
      log.includes('MM/DD/YYYY') || 
      log.includes('date formatting')
    );
    expect(dateFormatLogs.length).toBeGreaterThan(0);
    console.log('✅ Section 30 date formatting working correctly');
  });

  test('should verify both sections appear in PDF generation logs', async ({ page }) => {
    console.log('🧪 Testing Section 28 & Section 30 PDF generation integration...');
    
    // Monitor all PDF generation logs
    const pdfLogs: string[] = [];
    page.on('console', msg => {
      const text = msg.text();
      if (text.includes('PDF') || 
          text.includes('field') ||
          text.includes('Section 28') ||
          text.includes('Section 30') ||
          text.includes('applied') ||
          text.includes('mapped')) {
        pdfLogs.push(text);
      }
    });
    
    // Populate test data first
    await page.click('[data-testid="populate-test-data-button"]');
    await page.waitForTimeout(2000);
    
    // Generate PDF
    await page.click('[data-testid="server-pdf-button"]');
    
    // Wait for PDF generation to complete
    await page.waitForTimeout(8000);
    
    // Verify Section 28 appears in PDF logs
    const section28PdfLogs = pdfLogs.filter(log => 
      log.includes('Section 28') || 
      log.includes('court')
    );
    expect(section28PdfLogs.length).toBeGreaterThan(0);
    console.log('✅ Section 28 data appears in PDF generation');
    
    // Verify Section 30 appears in PDF logs
    const section30PdfLogs = pdfLogs.filter(log => 
      log.includes('Section 30') || 
      log.includes('continuation')
    );
    expect(section30PdfLogs.length).toBeGreaterThan(0);
    console.log('✅ Section 30 data appears in PDF generation');
    
    // Verify overall PDF generation success
    const successLogs = pdfLogs.filter(log => 
      log.includes('PDF generated successfully') ||
      log.includes('fields applied')
    );
    expect(successLogs.length).toBeGreaterThan(0);
    console.log('✅ PDF generation completed successfully');
  });

  test('should verify field count increase after test data population', async ({ page }) => {
    console.log('🧪 Testing field count increase after test data population...');
    
    // Monitor field count logs
    const fieldCountLogs: string[] = [];
    page.on('console', msg => {
      const text = msg.text();
      if (text.includes('field count') || 
          text.includes('fields') ||
          text.includes('649') ||
          text.includes('85')) {
        fieldCountLogs.push(text);
      }
    });
    
    // Generate PDF before test data (should have fewer fields)
    await page.click('[data-testid="server-pdf-button"]');
    await page.waitForTimeout(3000);
    
    // Populate test data
    await page.click('[data-testid="populate-test-data-button"]');
    await page.waitForTimeout(2000);
    
    // Generate PDF after test data (should have more fields)
    await page.click('[data-testid="server-pdf-button"]');
    await page.waitForTimeout(5000);
    
    // Verify field count increase message
    const increaseMessages = fieldCountLogs.filter(log => 
      log.includes('field count increase') ||
      log.includes('649 fields')
    );
    expect(increaseMessages.length).toBeGreaterThan(0);
    console.log('✅ Field count increase verified after test data population');
  });

  test('should verify Section 28 and Section 30 context registration', async ({ page }) => {
    console.log('🧪 Testing Section 28 & Section 30 context registration...');
    
    // Monitor context registration logs
    const registrationLogs: string[] = [];
    page.on('console', msg => {
      const text = msg.text();
      if (text.includes('registered sections') || 
          text.includes('section28') ||
          text.includes('section30') ||
          text.includes('context')) {
        registrationLogs.push(text);
      }
    });
    
    // Populate test data to trigger context registration logging
    await page.click('[data-testid="populate-test-data-button"]');
    await page.waitForTimeout(2000);
    
    // Verify Section 28 context registration
    const section28Registration = registrationLogs.filter(log => 
      log.includes('section28')
    );
    expect(section28Registration.length).toBeGreaterThan(0);
    console.log('✅ Section 28 context registration verified');
    
    // Verify Section 30 context registration
    const section30Registration = registrationLogs.filter(log => 
      log.includes('section30')
    );
    expect(section30Registration.length).toBeGreaterThan(0);
    console.log('✅ Section 30 context registration verified');
  });
});
