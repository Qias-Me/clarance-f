/**
 * Section Implementation Tests
 * 
 * Tests for individual section implementations including Section 1, 2, 3, 7, 8, and 29.
 * Validates field rendering, data binding, validation, and integration with SF86FormContext.
 */

import { test, expect } from '@playwright/test';

test.describe('Section Implementations', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/startForm');
    await page.waitForSelector('[data-testid="sf86-form-container"]');
  });

  test.describe('Section 1 - Information About You', () => {
    test.beforeEach(async ({ page }) => {
      await page.click('[data-testid="section-1-tab"]');
      await page.waitForSelector('[data-testid="section1-form"]');
    });

    test('should render all required fields', async ({ page }) => {
      // Verify all Section 1 fields are present
      await expect(page.locator('[data-testid="last-name-field"]')).toBeVisible();
      await expect(page.locator('[data-testid="first-name-field"]')).toBeVisible();
      await expect(page.locator('[data-testid="middle-name-field"]')).toBeVisible();
      await expect(page.locator('[data-testid="suffix-field"]')).toBeVisible();
    });

    test('should validate required fields', async ({ page }) => {
      // Try to proceed without filling required fields
      await page.click('[data-testid="validate-section-button"]');
      
      // Check for validation errors
      await expect(page.locator('[data-testid="last-name-error"]')).toContainText('Last name is required');
      await expect(page.locator('[data-testid="first-name-error"]')).toContainText('First name is required');
    });

    test('should update form context when fields change', async ({ page }) => {
      await page.fill('[data-testid="last-name-field"]', 'ContextTestLastName');
      await page.fill('[data-testid="first-name-field"]', 'ContextTestFirstName');
      
      // Verify context is updated
      const contextValues = await page.evaluate(() => {
        const formData = window.__SF86_FORM_STATE__;
        return {
          lastName: formData?.section1?.personalInfo?.lastName?.value,
          firstName: formData?.section1?.personalInfo?.firstName?.value
        };
      });
      
      expect(contextValues.lastName).toBe('ContextTestLastName');
      expect(contextValues.firstName).toBe('ContextTestFirstName');
    });

    test('should have correct field IDs for PDF mapping', async ({ page }) => {
      const fieldIds = await page.evaluate(() => {
        const formData = window.__SF86_FORM_STATE__;
        return {
          lastNameId: formData?.section1?.personalInfo?.lastName?.id,
          firstNameId: formData?.section1?.personalInfo?.firstName?.id,
          middleNameId: formData?.section1?.personalInfo?.middleName?.id,
          suffixId: formData?.section1?.personalInfo?.suffix?.id
        };
      });
      
      expect(fieldIds.lastNameId).toBe('form1[0].Sections1-6[0].TextField11[0]');
      expect(fieldIds.firstNameId).toBe('form1[0].Sections1-6[0].TextField11[1]');
      expect(fieldIds.middleNameId).toBe('form1[0].Sections1-6[0].TextField11[2]');
      expect(fieldIds.suffixId).toBe('form1[0].Sections1-6[0].TextField11[3]');
    });
  });

  test.describe('Section 2 - Date of Birth', () => {
    test.beforeEach(async ({ page }) => {
      await page.click('[data-testid="section-2-tab"]');
      await page.waitForSelector('[data-testid="section2-form"]');
    });

    test('should render date and estimation fields', async ({ page }) => {
      await expect(page.locator('[data-testid="date-of-birth-field"]')).toBeVisible();
      await expect(page.locator('[data-testid="estimated-checkbox"]')).toBeVisible();
      await expect(page.locator('[data-testid="age-field"]')).toBeVisible();
    });

    test('should calculate age automatically', async ({ page }) => {
      await page.fill('[data-testid="date-of-birth-field"]', '1990-01-15');
      
      // Wait for age calculation
      await page.waitForTimeout(1000);
      
      const ageValue = await page.locator('[data-testid="age-field"]').inputValue();
      const expectedAge = new Date().getFullYear() - 1990;
      
      expect(parseInt(ageValue)).toBeCloseTo(expectedAge, 1);
    });

    test('should validate date format', async ({ page }) => {
      await page.fill('[data-testid="date-of-birth-field"]', 'invalid-date');
      await page.click('[data-testid="validate-section-button"]');
      
      await expect(page.locator('[data-testid="date-format-error"]')).toContainText('Invalid date format');
    });

    test('should handle estimated dates', async ({ page }) => {
      await page.check('[data-testid="estimated-checkbox"]');
      await page.fill('[data-testid="date-of-birth-field"]', '1990-01-01');
      
      const contextValues = await page.evaluate(() => {
        const formData = window.__SF86_FORM_STATE__;
        return {
          date: formData?.section2?.dateOfBirth?.date?.value,
          estimated: formData?.section2?.dateOfBirth?.estimated?.value
        };
      });
      
      expect(contextValues.estimated).toBe(true);
      expect(contextValues.date).toBe('1990-01-01');
    });
  });

  test.describe('Section 3 - Place of Birth', () => {
    test.beforeEach(async ({ page }) => {
      await page.click('[data-testid="section-3-tab"]');
      await page.waitForSelector('[data-testid="section3-form"]');
    });

    test('should render location fields', async ({ page }) => {
      await expect(page.locator('[data-testid="birth-city-field"]')).toBeVisible();
      await expect(page.locator('[data-testid="birth-state-select"]')).toBeVisible();
      await expect(page.locator('[data-testid="birth-country-select"]')).toBeVisible();
      await expect(page.locator('[data-testid="us-citizen-radio"]')).toBeVisible();
    });

    test('should handle US birth locations', async ({ page }) => {
      await page.fill('[data-testid="birth-city-field"]', 'New York');
      await page.selectOption('[data-testid="birth-state-select"]', 'NY');
      await page.selectOption('[data-testid="birth-country-select"]', 'United States');
      await page.check('[data-testid="us-citizen-yes"]');
      
      const contextValues = await page.evaluate(() => {
        const formData = window.__SF86_FORM_STATE__;
        return {
          city: formData?.section3?.placeOfBirth?.city?.value,
          state: formData?.section3?.placeOfBirth?.state?.value,
          country: formData?.section3?.placeOfBirth?.country?.value,
          isUSCitizen: formData?.section3?.placeOfBirth?.isUSCitizen?.value
        };
      });
      
      expect(contextValues.city).toBe('New York');
      expect(contextValues.state).toBe('NY');
      expect(contextValues.country).toBe('United States');
      expect(contextValues.isUSCitizen).toBe('YES');
    });

    test('should handle international birth locations', async ({ page }) => {
      await page.fill('[data-testid="birth-city-field"]', 'London');
      await page.selectOption('[data-testid="birth-country-select"]', 'United Kingdom');
      await page.check('[data-testid="us-citizen-no"]');
      
      // State field should be hidden for international locations
      await expect(page.locator('[data-testid="birth-state-select"]')).not.toBeVisible();
      
      const contextValues = await page.evaluate(() => {
        const formData = window.__SF86_FORM_STATE__;
        return {
          city: formData?.section3?.placeOfBirth?.city?.value,
          country: formData?.section3?.placeOfBirth?.country?.value,
          isUSCitizen: formData?.section3?.placeOfBirth?.isUSCitizen?.value
        };
      });
      
      expect(contextValues.city).toBe('London');
      expect(contextValues.country).toBe('United Kingdom');
      expect(contextValues.isUSCitizen).toBe('NO');
    });
  });

  test.describe('Section 7 - Contact Information', () => {
    test.beforeEach(async ({ page }) => {
      await page.click('[data-testid="section-7-tab"]');
      await page.waitForSelector('[data-testid="section7-form"]');
    });

    test('should render contact fields', async ({ page }) => {
      await expect(page.locator('[data-testid="home-phone-field"]')).toBeVisible();
      await expect(page.locator('[data-testid="work-phone-field"]')).toBeVisible();
      await expect(page.locator('[data-testid="cell-phone-field"]')).toBeVisible();
      await expect(page.locator('[data-testid="email-field"]')).toBeVisible();
    });

    test('should validate phone number formats', async ({ page }) => {
      await page.fill('[data-testid="home-phone-field"]', 'invalid-phone');
      await page.click('[data-testid="validate-section-button"]');
      
      await expect(page.locator('[data-testid="phone-format-error"]')).toContainText('Invalid phone number format');
    });

    test('should validate email format', async ({ page }) => {
      await page.fill('[data-testid="email-field"]', 'invalid-email');
      await page.click('[data-testid="validate-section-button"]');
      
      await expect(page.locator('[data-testid="email-format-error"]')).toContainText('Invalid email format');
    });

    test('should format phone numbers automatically', async ({ page }) => {
      await page.fill('[data-testid="home-phone-field"]', '5551234567');
      
      // Wait for formatting
      await page.waitForTimeout(500);
      
      const formattedPhone = await page.locator('[data-testid="home-phone-field"]').inputValue();
      expect(formattedPhone).toMatch(/\(\d{3}\) \d{3}-\d{4}/);
    });
  });

  test.describe('Section 8 - U.S. Passport Information', () => {
    test.beforeEach(async ({ page }) => {
      await page.click('[data-testid="section-8-tab"]');
      await page.waitForSelector('[data-testid="section8-form"]');
    });

    test('should render passport fields', async ({ page }) => {
      await expect(page.locator('[data-testid="passport-number-field"]')).toBeVisible();
      await expect(page.locator('[data-testid="passport-issue-date-field"]')).toBeVisible();
      await expect(page.locator('[data-testid="passport-expiration-date-field"]')).toBeVisible();
      await expect(page.locator('[data-testid="passport-book-checkbox"]')).toBeVisible();
      await expect(page.locator('[data-testid="passport-card-checkbox"]')).toBeVisible();
    });

    test('should validate passport number format', async ({ page }) => {
      await page.fill('[data-testid="passport-number-field"]', '123'); // Too short
      await page.click('[data-testid="validate-section-button"]');
      
      await expect(page.locator('[data-testid="passport-number-error"]')).toContainText('Invalid passport number');
    });

    test('should validate date ranges', async ({ page }) => {
      await page.fill('[data-testid="passport-issue-date-field"]', '2025-01-01'); // Future date
      await page.fill('[data-testid="passport-expiration-date-field"]', '2020-01-01'); // Past date
      await page.click('[data-testid="validate-section-button"]');
      
      await expect(page.locator('[data-testid="date-range-error"]')).toContainText('Expiration date must be after issue date');
    });
  });

  test.describe('Section 29 - Associations', () => {
    test.beforeEach(async ({ page }) => {
      await page.click('[data-testid="section-29-tab"]');
      await page.waitForSelector('[data-testid="section29-form"]');
    });

    test('should render associations interface', async ({ page }) => {
      await expect(page.locator('[data-testid="associations-list"]')).toBeVisible();
      await expect(page.locator('[data-testid="add-association-button"]')).toBeVisible();
      await expect(page.locator('[data-testid="no-associations-message"]')).toBeVisible();
    });

    test('should add new association entry', async ({ page }) => {
      await page.click('[data-testid="add-association-button"]');
      
      // Fill association form
      await page.fill('[data-testid="organization-name"]', 'Test Organization');
      await page.fill('[data-testid="organization-address"]', '123 Test Street');
      await page.fill('[data-testid="position-title"]', 'Member');
      await page.fill('[data-testid="start-date"]', '2020-01-01');
      await page.fill('[data-testid="end-date"]', '2023-12-31');
      
      await page.click('[data-testid="save-association-button"]');
      
      // Verify entry was added
      await expect(page.locator('[data-testid="association-entry-0"]')).toBeVisible();
      await expect(page.locator('[data-testid="organization-name-display"]')).toContainText('Test Organization');
    });

    test('should edit existing association', async ({ page }) => {
      // First add an association
      await page.click('[data-testid="add-association-button"]');
      await page.fill('[data-testid="organization-name"]', 'Original Name');
      await page.click('[data-testid="save-association-button"]');
      
      // Edit the association
      await page.click('[data-testid="edit-association-0"]');
      await page.fill('[data-testid="organization-name"]', 'Updated Name');
      await page.click('[data-testid="save-association-button"]');
      
      // Verify update
      await expect(page.locator('[data-testid="organization-name-display"]')).toContainText('Updated Name');
    });

    test('should delete association', async ({ page }) => {
      // Add an association first
      await page.click('[data-testid="add-association-button"]');
      await page.fill('[data-testid="organization-name"]', 'To Be Deleted');
      await page.click('[data-testid="save-association-button"]');
      
      // Delete the association
      await page.click('[data-testid="delete-association-0"]');
      await page.click('[data-testid="confirm-delete-button"]');
      
      // Verify deletion
      await expect(page.locator('[data-testid="association-entry-0"]')).not.toBeVisible();
      await expect(page.locator('[data-testid="no-associations-message"]')).toBeVisible();
    });

    test('should validate required association fields', async ({ page }) => {
      await page.click('[data-testid="add-association-button"]');
      await page.click('[data-testid="save-association-button"]'); // Try to save without filling required fields
      
      await expect(page.locator('[data-testid="organization-name-error"]')).toContainText('Organization name is required');
      await expect(page.locator('[data-testid="organization-address-error"]')).toContainText('Organization address is required');
    });
  });

  test.describe('Cross-Section Integration', () => {
    test('should maintain data consistency across sections', async ({ page }) => {
      // Fill data in Section 1
      await page.click('[data-testid="section-1-tab"]');
      await page.fill('[data-testid="last-name-field"]', 'CrossSectionTest');
      
      // Navigate to Section 2 and back
      await page.click('[data-testid="section-2-tab"]');
      await page.fill('[data-testid="date-of-birth-field"]', '1990-01-15');
      
      // Return to Section 1 and verify data persistence
      await page.click('[data-testid="section-1-tab"]');
      await expect(page.locator('[data-testid="last-name-field"]')).toHaveValue('CrossSectionTest');
    });

    test('should trigger validation across dependent sections', async ({ page }) => {
      // This test would verify that changes in one section trigger validation in dependent sections
      await page.click('[data-testid="section-1-tab"]');
      await page.fill('[data-testid="last-name-field"]', 'DependencyTest');
      
      // Check if dependent sections show updated validation status
      const dependentSectionStatus = await page.locator('[data-testid="section-3-status"]').textContent();
      expect(dependentSectionStatus).toContain('Ready'); // or whatever indicates dependency is satisfied
    });
  });
});
