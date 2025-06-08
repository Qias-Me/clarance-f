/**
 * Section 18.1 - Basic Relative Information Tests
 * 
 * Tests all fields in Section 18.1 including:
 * - Basic relative information (name, relationship, citizenship, birth info)
 * - Other names functionality (4 entries per relative)
 * - Mother's maiden name
 * - Date validation and estimates
 */

import { test, expect, Page } from '@playwright/test';

// Test data for Section 18.1
const RELATIVE_TEST_DATA = {
  relativeType: 'Mother',
  fullName: {
    firstName: 'Jane',
    middleName: 'Marie',
    lastName: 'Smith',
    suffix: 'Jr'
  },
  mothersMaidenName: {
    sameAsListed: false,
    dontKnow: false,
    maidenName: {
      firstName: 'Mary',
      middleName: 'Elizabeth',
      lastName: 'Johnson',
      suffix: 'Sr'
    }
  },
  otherNames: [
    {
      fullName: {
        firstName: 'Janet',
        middleName: 'M',
        lastName: 'Williams',
        suffix: 'II'
      },
      timeUsed: {
        from: { month: '01', year: '1990', isEstimated: true },
        to: { month: '12', year: '2000', isEstimated: false },
        isPresent: false
      },
      reasonForChange: 'Marriage'
    },
    {
      fullName: {
        firstName: 'Janie',
        middleName: 'Marie',
        lastName: 'Brown',
        suffix: 'III'
      },
      timeUsed: {
        from: { month: '01', year: '2001', isEstimated: false },
        to: { month: '06', year: '2010', isEstimated: true },
        isPresent: false
      },
      reasonForChange: 'Divorce'
    },
    {
      fullName: {
        firstName: 'Jane',
        middleName: 'M',
        lastName: 'Davis',
        suffix: 'IV'
      },
      timeUsed: {
        from: { month: '07', year: '2010', isEstimated: false },
        to: { month: '12', year: '2020', isEstimated: false },
        isPresent: false
      },
      reasonForChange: 'Legal name change'
    },
    {
      fullName: {
        firstName: 'J',
        middleName: 'Marie',
        lastName: 'Wilson',
        suffix: 'V'
      },
      timeUsed: {
        from: { month: '01', year: '2021', isEstimated: true },
        to: { month: '', year: '', isEstimated: false },
        isPresent: true
      },
      reasonForChange: 'Professional reasons'
    }
  ],
  dateOfBirth: {
    month: '03',
    year: '1965',
    isEstimated: false
  },
  placeOfBirth: {
    city: 'New York',
    state: 'NY',
    country: 'United States'
  },
  citizenship: {
    countries: ['United States', 'Canada']
  }
};

// Helper function to monitor console logs
async function setupConsoleMonitoring(page: Page): Promise<string[]> {
  const consoleMessages: string[] = [];
  
  page.on('console', (msg) => {
    const message = `[${msg.type()}] ${msg.text()}`;
    consoleMessages.push(message);
    console.log(`Console: ${message}`);
  });

  page.on('pageerror', (error) => {
    const message = `[ERROR] ${error.message}`;
    consoleMessages.push(message);
    console.log(`Page Error: ${message}`);
  });

  return consoleMessages;
}

// Helper function to navigate to Section 18
async function navigateToSection18(page: Page) {
  await page.goto('/form');
  await page.waitForLoadState('networkidle');
  
  // Navigate to Section 18
  await page.click('[data-testid="section-18-nav"]');
  await page.waitForSelector('[data-testid="section-18-content"]', { timeout: 10000 });
}

test.describe('Section 18.1 - Basic Relative Information', () => {
  test.beforeEach(async ({ page }) => {
    await setupConsoleMonitoring(page);
    await navigateToSection18(page);
  });

  test('should fill out basic relative information for first relative', async ({ page }) => {
    console.log('🧪 Testing Section 18.1 - Basic Relative Information');

    // Select relative type
    await page.selectOption('[data-testid="relative-1-type"]', RELATIVE_TEST_DATA.relativeType);
    await page.waitForTimeout(500);

    // Fill out full name
    await page.fill('[data-testid="relative-1-firstName"]', RELATIVE_TEST_DATA.fullName.firstName);
    await page.fill('[data-testid="relative-1-middleName"]', RELATIVE_TEST_DATA.fullName.middleName);
    await page.fill('[data-testid="relative-1-lastName"]', RELATIVE_TEST_DATA.fullName.lastName);
    await page.selectOption('[data-testid="relative-1-suffix"]', RELATIVE_TEST_DATA.fullName.suffix);

    // Wait for field updates
    await page.waitForTimeout(1000);

    // Verify values were set
    await expect(page.locator('[data-testid="relative-1-firstName"]')).toHaveValue(RELATIVE_TEST_DATA.fullName.firstName);
    await expect(page.locator('[data-testid="relative-1-middleName"]')).toHaveValue(RELATIVE_TEST_DATA.fullName.middleName);
    await expect(page.locator('[data-testid="relative-1-lastName"]')).toHaveValue(RELATIVE_TEST_DATA.fullName.lastName);

    console.log('✅ Basic relative information filled successfully');
  });

  test('should handle mothers maiden name section', async ({ page }) => {
    console.log('🧪 Testing Mother\'s Maiden Name Section');

    // Test "Same as listed" checkbox
    await page.check('[data-testid="relative-1-mothers-maiden-same"]');
    await page.waitForTimeout(500);
    
    // Verify other fields are disabled
    await expect(page.locator('[data-testid="relative-1-mothers-maiden-firstName"]')).toBeDisabled();
    
    // Uncheck and test "Don't know" checkbox
    await page.uncheck('[data-testid="relative-1-mothers-maiden-same"]');
    await page.check('[data-testid="relative-1-mothers-maiden-dontKnow"]');
    await page.waitForTimeout(500);
    
    // Verify fields are still disabled
    await expect(page.locator('[data-testid="relative-1-mothers-maiden-firstName"]')).toBeDisabled();
    
    // Uncheck "Don't know" and fill out maiden name
    await page.uncheck('[data-testid="relative-1-mothers-maiden-dontKnow"]');
    await page.waitForTimeout(500);
    
    await page.fill('[data-testid="relative-1-mothers-maiden-firstName"]', RELATIVE_TEST_DATA.mothersMaidenName.maidenName.firstName);
    await page.fill('[data-testid="relative-1-mothers-maiden-middleName"]', RELATIVE_TEST_DATA.mothersMaidenName.maidenName.middleName);
    await page.fill('[data-testid="relative-1-mothers-maiden-lastName"]', RELATIVE_TEST_DATA.mothersMaidenName.maidenName.lastName);
    await page.selectOption('[data-testid="relative-1-mothers-maiden-suffix"]', RELATIVE_TEST_DATA.mothersMaidenName.maidenName.suffix);

    await page.waitForTimeout(1000);

    // Verify values
    await expect(page.locator('[data-testid="relative-1-mothers-maiden-firstName"]')).toHaveValue(RELATIVE_TEST_DATA.mothersMaidenName.maidenName.firstName);

    console.log('✅ Mother\'s maiden name section tested successfully');
  });

  test('should fill out birth information', async ({ page }) => {
    console.log('🧪 Testing Birth Information Section');

    // Fill out date of birth
    await page.fill('[data-testid="relative-1-birthDate"]', `${RELATIVE_TEST_DATA.dateOfBirth.month}/${RELATIVE_TEST_DATA.dateOfBirth.year}`);
    
    // Test estimated checkbox
    if (RELATIVE_TEST_DATA.dateOfBirth.isEstimated) {
      await page.check('[data-testid="relative-1-birthDate-estimated"]');
    }
    
    await page.waitForTimeout(500);

    // Fill out place of birth
    await page.fill('[data-testid="relative-1-birthPlace-city"]', RELATIVE_TEST_DATA.placeOfBirth.city);
    await page.selectOption('[data-testid="relative-1-birthPlace-state"]', RELATIVE_TEST_DATA.placeOfBirth.state);
    await page.selectOption('[data-testid="relative-1-birthPlace-country"]', RELATIVE_TEST_DATA.placeOfBirth.country);

    await page.waitForTimeout(1000);

    // Verify values
    await expect(page.locator('[data-testid="relative-1-birthDate"]')).toHaveValue(`${RELATIVE_TEST_DATA.dateOfBirth.month}/${RELATIVE_TEST_DATA.dateOfBirth.year}`);
    await expect(page.locator('[data-testid="relative-1-birthPlace-city"]')).toHaveValue(RELATIVE_TEST_DATA.placeOfBirth.city);

    console.log('✅ Birth information filled successfully');
  });

  test('should handle citizenship information', async ({ page }) => {
    console.log('🧪 Testing Citizenship Information');

    // Fill out citizenship countries
    await page.selectOption('[data-testid="relative-1-citizenship-country1"]', RELATIVE_TEST_DATA.citizenship.countries[0]);
    await page.selectOption('[data-testid="relative-1-citizenship-country2"]', RELATIVE_TEST_DATA.citizenship.countries[1]);

    await page.waitForTimeout(1000);

    // Verify selections
    await expect(page.locator('[data-testid="relative-1-citizenship-country1"]')).toHaveValue(RELATIVE_TEST_DATA.citizenship.countries[0]);
    await expect(page.locator('[data-testid="relative-1-citizenship-country2"]')).toHaveValue(RELATIVE_TEST_DATA.citizenship.countries[1]);

    console.log('✅ Citizenship information filled successfully');
  });

  test('should test other names functionality - not applicable', async ({ page }) => {
    console.log('🧪 Testing Other Names - Not Applicable');

    // Check "Not applicable" checkbox
    await page.check('[data-testid="relative-1-otherNames-notApplicable"]');
    await page.waitForTimeout(500);

    // Verify other name fields are hidden/disabled
    await expect(page.locator('[data-testid="relative-1-otherName-1-firstName"]')).not.toBeVisible();

    // Verify message is shown
    await expect(page.locator('[data-testid="relative-1-otherNames-notApplicable-message"]')).toBeVisible();

    console.log('✅ Other Names not applicable functionality tested');
  });

  test('should fill out all 4 other names entries', async ({ page }) => {
    console.log('🧪 Testing All 4 Other Names Entries');

    // Ensure "Not applicable" is unchecked
    await page.uncheck('[data-testid="relative-1-otherNames-notApplicable"]');
    await page.waitForTimeout(500);

    // Fill out all 4 other names
    for (let i = 0; i < 4; i++) {
      const otherName = RELATIVE_TEST_DATA.otherNames[i];
      const index = i + 1;

      console.log(`📝 Filling Other Name #${index}`);

      // Fill name fields
      await page.fill(`[data-testid="relative-1-otherName-${index}-firstName"]`, otherName.fullName.firstName);
      await page.fill(`[data-testid="relative-1-otherName-${index}-middleName"]`, otherName.fullName.middleName);
      await page.fill(`[data-testid="relative-1-otherName-${index}-lastName"]`, otherName.fullName.lastName);
      await page.selectOption(`[data-testid="relative-1-otherName-${index}-suffix"]`, otherName.fullName.suffix);

      // Fill time period
      await page.fill(`[data-testid="relative-1-otherName-${index}-fromDate"]`, `${otherName.timeUsed.from.month}/${otherName.timeUsed.from.year}`);
      
      if (otherName.timeUsed.from.isEstimated) {
        await page.check(`[data-testid="relative-1-otherName-${index}-fromDate-estimated"]`);
      }

      if (!otherName.timeUsed.isPresent) {
        await page.fill(`[data-testid="relative-1-otherName-${index}-toDate"]`, `${otherName.timeUsed.to.month}/${otherName.timeUsed.to.year}`);
        
        if (otherName.timeUsed.to.isEstimated) {
          await page.check(`[data-testid="relative-1-otherName-${index}-toDate-estimated"]`);
        }
      } else {
        await page.check(`[data-testid="relative-1-otherName-${index}-present"]`);
      }

      // Fill reason for change
      await page.fill(`[data-testid="relative-1-otherName-${index}-reason"]`, otherName.reasonForChange);

      await page.waitForTimeout(500);

      // Verify values
      await expect(page.locator(`[data-testid="relative-1-otherName-${index}-firstName"]`)).toHaveValue(otherName.fullName.firstName);
      await expect(page.locator(`[data-testid="relative-1-otherName-${index}-reason"]`)).toHaveValue(otherName.reasonForChange);

      console.log(`✅ Other Name #${index} filled successfully`);
    }

    console.log('✅ All 4 other names entries completed');
  });

  test('should test complete Section 18.1 workflow', async ({ page }) => {
    console.log('🧪 Testing Complete Section 18.1 Workflow');

    // Fill out all sections in sequence
    
    // 1. Basic relative information
    await page.selectOption('[data-testid="relative-1-type"]', RELATIVE_TEST_DATA.relativeType);
    await page.fill('[data-testid="relative-1-firstName"]', RELATIVE_TEST_DATA.fullName.firstName);
    await page.fill('[data-testid="relative-1-middleName"]', RELATIVE_TEST_DATA.fullName.middleName);
    await page.fill('[data-testid="relative-1-lastName"]', RELATIVE_TEST_DATA.fullName.lastName);
    await page.selectOption('[data-testid="relative-1-suffix"]', RELATIVE_TEST_DATA.fullName.suffix);

    // 2. Mother's maiden name
    await page.fill('[data-testid="relative-1-mothers-maiden-firstName"]', RELATIVE_TEST_DATA.mothersMaidenName.maidenName.firstName);
    await page.fill('[data-testid="relative-1-mothers-maiden-middleName"]', RELATIVE_TEST_DATA.mothersMaidenName.maidenName.middleName);
    await page.fill('[data-testid="relative-1-mothers-maiden-lastName"]', RELATIVE_TEST_DATA.mothersMaidenName.maidenName.lastName);
    await page.selectOption('[data-testid="relative-1-mothers-maiden-suffix"]', RELATIVE_TEST_DATA.mothersMaidenName.maidenName.suffix);

    // 3. Birth information
    await page.fill('[data-testid="relative-1-birthDate"]', `${RELATIVE_TEST_DATA.dateOfBirth.month}/${RELATIVE_TEST_DATA.dateOfBirth.year}`);
    await page.fill('[data-testid="relative-1-birthPlace-city"]', RELATIVE_TEST_DATA.placeOfBirth.city);
    await page.selectOption('[data-testid="relative-1-birthPlace-state"]', RELATIVE_TEST_DATA.placeOfBirth.state);
    await page.selectOption('[data-testid="relative-1-birthPlace-country"]', RELATIVE_TEST_DATA.placeOfBirth.country);

    // 4. Citizenship
    await page.selectOption('[data-testid="relative-1-citizenship-country1"]', RELATIVE_TEST_DATA.citizenship.countries[0]);
    await page.selectOption('[data-testid="relative-1-citizenship-country2"]', RELATIVE_TEST_DATA.citizenship.countries[1]);

    // 5. First other name only (to save time)
    const otherName = RELATIVE_TEST_DATA.otherNames[0];
    await page.fill('[data-testid="relative-1-otherName-1-firstName"]', otherName.fullName.firstName);
    await page.fill('[data-testid="relative-1-otherName-1-lastName"]', otherName.fullName.lastName);
    await page.fill('[data-testid="relative-1-otherName-1-fromDate"]', `${otherName.timeUsed.from.month}/${otherName.timeUsed.from.year}`);
    await page.fill('[data-testid="relative-1-otherName-1-toDate"]', `${otherName.timeUsed.to.month}/${otherName.timeUsed.to.year}`);
    await page.fill('[data-testid="relative-1-otherName-1-reason"]', otherName.reasonForChange);

    await page.waitForTimeout(2000);

    // Verify key fields are filled
    await expect(page.locator('[data-testid="relative-1-firstName"]')).toHaveValue(RELATIVE_TEST_DATA.fullName.firstName);
    await expect(page.locator('[data-testid="relative-1-birthPlace-city"]')).toHaveValue(RELATIVE_TEST_DATA.placeOfBirth.city);
    await expect(page.locator('[data-testid="relative-1-otherName-1-firstName"]')).toHaveValue(otherName.fullName.firstName);

    console.log('✅ Complete Section 18.1 workflow tested successfully');
  });

  test('should validate field interactions and state management', async ({ page }) => {
    console.log('🧪 Testing Field Interactions and State Management');

    // Test conditional field visibility
    await page.check('[data-testid="relative-1-mothers-maiden-same"]');
    await expect(page.locator('[data-testid="relative-1-mothers-maiden-firstName"]')).toBeDisabled();

    await page.uncheck('[data-testid="relative-1-mothers-maiden-same"]');
    await expect(page.locator('[data-testid="relative-1-mothers-maiden-firstName"]')).toBeEnabled();

    // Test other names conditional logic
    await page.check('[data-testid="relative-1-otherNames-notApplicable"]');
    await expect(page.locator('[data-testid="relative-1-otherName-1-firstName"]')).not.toBeVisible();

    await page.uncheck('[data-testid="relative-1-otherNames-notApplicable"]');
    await expect(page.locator('[data-testid="relative-1-otherName-1-firstName"]')).toBeVisible();

    // Test present checkbox for other names
    await page.check('[data-testid="relative-1-otherName-1-present"]');
    await expect(page.locator('[data-testid="relative-1-otherName-1-toDate"]')).toBeDisabled();

    await page.uncheck('[data-testid="relative-1-otherName-1-present"]');
    await expect(page.locator('[data-testid="relative-1-otherName-1-toDate"]')).toBeEnabled();

    console.log('✅ Field interactions and state management validated');
  });
});
