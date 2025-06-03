import { test, expect } from '@playwright/test';

/**
 * Test suite to validate Section 16 field mapping fixes
 * This tests that users can successfully add foreign activities without "Field not found" errors
 */
test.describe('Section 16 Field Mapping Tests', () => {
  
  // Login before each test
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Login logic goes here - adjust based on your auth flow
    await page.getByLabel('Username').fill('testuser');
    await page.getByLabel('Password').fill('testpassword');
    await page.getByRole('button', { name: 'Login' }).click();
    
    // Navigate to Section 16
    await page.goto('/form86/section/16');
    // Wait for the section to load
    await page.waitForSelector('h1:has-text("Foreign Activities")', { state: 'visible' });
  });

  test('should add foreign government activity without field mapping errors', async ({ page }) => {
    // Click to add a foreign government activity
    await page.getByText('Add Foreign Government Activity').click();
    
    // Fill out the form fields
    await page.getByLabel(/Do you have or have you had/).click(); // Click Yes radio button
    await page.getByLabel('Organization Name').fill('Test Foreign Government');
    
    // Select organization type
    await page.getByLabel('Organization Type').selectOption('Government Agency');
    
    // Select country
    await page.getByLabel('Country').selectOption('France');
    
    // Fill dates
    await page.getByLabel('From Month').fill('01');
    await page.getByLabel('From Year').fill('2020');
    await page.getByLabel('To Month').fill('12');
    await page.getByLabel('To Year').fill('2022');
    
    // Add position details
    await page.getByLabel('Position Title').fill('Consultant');
    await page.getByLabel('Duties').fill('Advisory role on international relations');
    await page.getByLabel('Reason for Leaving').fill('Contract completed');
    
    // Compensation
    await page.getByLabel(/Were you compensated/).click(); // Yes
    await page.getByLabel('Compensation Amount').fill('50000');
    await page.getByLabel('Currency').fill('EUR');
    
    // Contact information
    await page.getByLabel('Supervisor Name').fill('Jean Dupont');
    await page.getByLabel('Supervisor Title').fill('Director');
    await page.getByLabel('Street').fill('123 Government Ave');
    await page.getByLabel('City').fill('Paris');
    await page.getByLabel('Country').nth(1).selectOption('France');
    await page.getByLabel('Postal Code').fill('75001');
    await page.getByLabel('Contact Phone').fill('+33123456789');
    await page.getByLabel('Contact Email').fill('contact@gov.fr');
    
    // Save the entry
    await page.getByRole('button', { name: 'Save' }).click();
    
    // Verify success - no error dialogs or messages should appear
    await expect(page.getByText('Field not found')).toBeHidden();
    await expect(page.getByText('Successfully saved')).toBeVisible();
    
    // Verify the entry appears in the list
    await expect(page.getByText('Test Foreign Government')).toBeVisible();
  });

  test('should add foreign business activity without field mapping errors', async ({ page }) => {
    // Click to add a foreign business activity
    await page.getByText('Add Foreign Business Activity').click();
    
    // Fill out the form fields
    await page.getByLabel(/Do you have or have you had any foreign business/).click(); // Click Yes radio button
    await page.getByLabel('Business Name').fill('Test Foreign Business');
    await page.getByLabel('Business Type').fill('Consulting Firm');
    await page.getByLabel('Business Description').fill('International business consulting');
    
    // Select country
    await page.getByLabel('Country').selectOption('Germany');
    
    // Fill dates
    await page.getByLabel('From Month').fill('03');
    await page.getByLabel('From Year').fill('2019');
    await page.getByLabel('To Month').fill('09');
    await page.getByLabel('To Year').fill('2023');
    
    // Role details
    await page.getByLabel('Role').fill('Senior Consultant');
    await page.getByLabel('Responsibilities').fill('Client relations and business development');
    
    // Financial involvement
    await page.getByLabel(/Do you have financial interest/).click(); // Yes
    await page.getByLabel('Financial Interest Description').fill('15% ownership stake');
    await page.getByLabel('Investment Amount').fill('75000');
    
    // Business contact information
    await page.getByLabel('Street').fill('456 Business Strasse');
    await page.getByLabel('City').fill('Berlin');
    await page.getByLabel('Country').nth(1).selectOption('Germany');
    await page.getByLabel('Postal Code').fill('10115');
    await page.getByLabel('Business Phone').fill('+49987654321');
    await page.getByLabel('Business Email').fill('contact@business.de');
    
    // Save the entry
    await page.getByRole('button', { name: 'Save' }).click();
    
    // Verify success - no error dialogs or messages should appear
    await expect(page.getByText('Field not found')).toBeHidden();
    await expect(page.getByText('Successfully saved')).toBeVisible();
    
    // Verify the entry appears in the list
    await expect(page.getByText('Test Foreign Business')).toBeVisible();
  });
}); 