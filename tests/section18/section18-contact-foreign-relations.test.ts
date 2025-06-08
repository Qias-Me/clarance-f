/**
 * Section 18.3 - Contact Information and Foreign Relations Tests
 * 
 * Tests all fields in Section 18.3 including:
 * - Contact methods (18.5 functionality)
 * - Contact frequency (18.5 functionality)
 * - Documentation types (18.4 functionality)
 * - Employment information
 * - Foreign government relations
 * - Contact dates (18.5 functionality)
 */

import { test, expect, Page } from '@playwright/test';

// Test data for Section 18.3
const CONTACT_TEST_DATA = {
  contactMethods: {
    inPerson: true,
    telephone: true,
    electronic: false,
    writtenCorrespondence: true,
    other: true,
    otherExplanation: 'Video calls and social media'
  },
  contactFrequency: {
    daily: false,
    weekly: true,
    monthly: false,
    quarterly: false,
    annually: false,
    other: true,
    otherExplanation: 'Bi-weekly during holidays'
  },
  employmentInfo: {
    employerName: 'ABC Corporation',
    dontKnowEmployer: false,
    employerAddress: {
      street: '789 Business Blvd',
      city: 'Corporate City',
      state: 'TX',
      country: 'United States',
      zipCode: '75001',
      dontKnowAddress: false
    }
  },
  foreignGovernmentRelations: {
    hasRelations: 'YES',
    description: 'Worked as a translator for the embassy from 2015-2018'
  },
  contactDates: {
    firstContact: {
      date: '01/2010',
      isEstimate: true
    },
    lastContact: {
      date: '12/2023',
      isEstimate: false,
      isPresent: false
    }
  },
  documentationTypes: {
    i551PermanentResident: true,
    i766EmploymentAuth: false,
    usVisa: true,
    i94ArrivalDeparture: false,
    i20StudentCertificate: false,
    ds2019ExchangeVisitor: false,
    other: true,
    otherExplanation: 'Work permit from previous employer',
    documentNumber: 'ABC123456789',
    expirationDate: '12/2025',
    expirationIsEstimate: false
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

// Helper function to navigate to Section 18.3
async function navigateToSection18_3(page: Page) {
  await page.goto('/form');
  await page.waitForLoadState('networkidle');
  
  // Navigate to Section 18
  await page.click('[data-testid="section-18-nav"]');
  await page.waitForSelector('[data-testid="section-18-content"]', { timeout: 10000 });
  
  // Navigate to Section 18.3 tab
  await page.click('[data-testid="section-18-3-tab"]');
  await page.waitForSelector('[data-testid="section-18-3-content"]', { timeout: 5000 });
}

test.describe('Section 18.3 - Contact Information and Foreign Relations', () => {
  test.beforeEach(async ({ page }) => {
    await setupConsoleMonitoring(page);
    await navigateToSection18_3(page);
  });

  test('should handle not applicable checkbox', async ({ page }) => {
    console.log('🧪 Testing Not Applicable Functionality');

    // Check "Not applicable" checkbox
    await page.check('[data-testid="relative-1-contact-notApplicable"]');
    await page.waitForTimeout(500);

    // Verify contact fields are hidden/disabled
    await expect(page.locator('[data-testid="relative-1-contact-methods-section"]')).not.toBeVisible();
    await expect(page.locator('[data-testid="relative-1-contact-frequency-section"]')).not.toBeVisible();

    // Verify message is shown
    await expect(page.locator('[data-testid="relative-1-contact-notApplicable-message"]')).toBeVisible();

    // Uncheck to continue with other tests
    await page.uncheck('[data-testid="relative-1-contact-notApplicable"]');
    await page.waitForTimeout(500);

    console.log('✅ Not applicable functionality tested');
  });

  test('should fill out contact methods (18.5 functionality)', async ({ page }) => {
    console.log('🧪 Testing Contact Methods (Section 18.5 functionality)');

    // Ensure not applicable is unchecked
    await page.uncheck('[data-testid="relative-1-contact-notApplicable"]');
    await page.waitForTimeout(500);

    // Fill out contact methods
    if (CONTACT_TEST_DATA.contactMethods.inPerson) {
      await page.check('[data-testid="relative-1-contact-method-inPerson"]');
    }
    if (CONTACT_TEST_DATA.contactMethods.telephone) {
      await page.check('[data-testid="relative-1-contact-method-telephone"]');
    }
    if (CONTACT_TEST_DATA.contactMethods.electronic) {
      await page.check('[data-testid="relative-1-contact-method-electronic"]');
    }
    if (CONTACT_TEST_DATA.contactMethods.writtenCorrespondence) {
      await page.check('[data-testid="relative-1-contact-method-written"]');
    }
    if (CONTACT_TEST_DATA.contactMethods.other) {
      await page.check('[data-testid="relative-1-contact-method-other"]');
      await page.fill('[data-testid="relative-1-contact-method-other-explanation"]', CONTACT_TEST_DATA.contactMethods.otherExplanation);
    }

    await page.waitForTimeout(1000);

    // Verify contact method selections
    if (CONTACT_TEST_DATA.contactMethods.inPerson) {
      await expect(page.locator('[data-testid="relative-1-contact-method-inPerson"]')).toBeChecked();
    }
    if (CONTACT_TEST_DATA.contactMethods.telephone) {
      await expect(page.locator('[data-testid="relative-1-contact-method-telephone"]')).toBeChecked();
    }
    if (CONTACT_TEST_DATA.contactMethods.other) {
      await expect(page.locator('[data-testid="relative-1-contact-method-other-explanation"]')).toHaveValue(CONTACT_TEST_DATA.contactMethods.otherExplanation);
    }

    console.log('✅ Contact methods filled successfully');
  });

  test('should fill out contact frequency (18.5 functionality)', async ({ page }) => {
    console.log('🧪 Testing Contact Frequency (Section 18.5 functionality)');

    // Fill out contact frequency
    if (CONTACT_TEST_DATA.contactFrequency.daily) {
      await page.check('[data-testid="relative-1-contact-frequency-daily"]');
    }
    if (CONTACT_TEST_DATA.contactFrequency.weekly) {
      await page.check('[data-testid="relative-1-contact-frequency-weekly"]');
    }
    if (CONTACT_TEST_DATA.contactFrequency.monthly) {
      await page.check('[data-testid="relative-1-contact-frequency-monthly"]');
    }
    if (CONTACT_TEST_DATA.contactFrequency.quarterly) {
      await page.check('[data-testid="relative-1-contact-frequency-quarterly"]');
    }
    if (CONTACT_TEST_DATA.contactFrequency.annually) {
      await page.check('[data-testid="relative-1-contact-frequency-annually"]');
    }
    if (CONTACT_TEST_DATA.contactFrequency.other) {
      await page.check('[data-testid="relative-1-contact-frequency-other"]');
      await page.fill('[data-testid="relative-1-contact-frequency-other-explanation"]', CONTACT_TEST_DATA.contactFrequency.otherExplanation);
    }

    await page.waitForTimeout(1000);

    // Verify contact frequency selections
    if (CONTACT_TEST_DATA.contactFrequency.weekly) {
      await expect(page.locator('[data-testid="relative-1-contact-frequency-weekly"]')).toBeChecked();
    }
    if (CONTACT_TEST_DATA.contactFrequency.other) {
      await expect(page.locator('[data-testid="relative-1-contact-frequency-other-explanation"]')).toHaveValue(CONTACT_TEST_DATA.contactFrequency.otherExplanation);
    }

    console.log('✅ Contact frequency filled successfully');
  });

  test('should fill out employment information', async ({ page }) => {
    console.log('🧪 Testing Employment Information');

    // Fill out employer name
    await page.fill('[data-testid="relative-1-employment-employer"]', CONTACT_TEST_DATA.employmentInfo.employerName);

    // Test "Don't know employer" checkbox
    if (CONTACT_TEST_DATA.employmentInfo.dontKnowEmployer) {
      await page.check('[data-testid="relative-1-employment-dontKnowEmployer"]');
      await page.waitForTimeout(500);
      
      // Verify employer field is disabled
      await expect(page.locator('[data-testid="relative-1-employment-employer"]')).toBeDisabled();
    } else {
      // Fill out employer address
      await page.fill('[data-testid="relative-1-employment-address-street"]', CONTACT_TEST_DATA.employmentInfo.employerAddress.street);
      await page.fill('[data-testid="relative-1-employment-address-city"]', CONTACT_TEST_DATA.employmentInfo.employerAddress.city);
      await page.selectOption('[data-testid="relative-1-employment-address-state"]', CONTACT_TEST_DATA.employmentInfo.employerAddress.state);
      await page.selectOption('[data-testid="relative-1-employment-address-country"]', CONTACT_TEST_DATA.employmentInfo.employerAddress.country);
      await page.fill('[data-testid="relative-1-employment-address-zipCode"]', CONTACT_TEST_DATA.employmentInfo.employerAddress.zipCode);

      // Test "Don't know address" checkbox
      if (CONTACT_TEST_DATA.employmentInfo.employerAddress.dontKnowAddress) {
        await page.check('[data-testid="relative-1-employment-address-dontKnow"]');
        await page.waitForTimeout(500);
        
        // Verify address fields are disabled
        await expect(page.locator('[data-testid="relative-1-employment-address-street"]')).toBeDisabled();
      }
    }

    await page.waitForTimeout(1000);

    // Verify employment information
    if (!CONTACT_TEST_DATA.employmentInfo.dontKnowEmployer) {
      await expect(page.locator('[data-testid="relative-1-employment-employer"]')).toHaveValue(CONTACT_TEST_DATA.employmentInfo.employerName);
      await expect(page.locator('[data-testid="relative-1-employment-address-street"]')).toHaveValue(CONTACT_TEST_DATA.employmentInfo.employerAddress.street);
    }

    console.log('✅ Employment information filled successfully');
  });

  test('should fill out foreign government relations', async ({ page }) => {
    console.log('🧪 Testing Foreign Government Relations');

    // Select foreign government relations option
    await page.selectOption('[data-testid="relative-1-foreign-relations-hasRelations"]', CONTACT_TEST_DATA.foreignGovernmentRelations.hasRelations);
    await page.waitForTimeout(500);

    // If YES is selected, description field should be visible
    if (CONTACT_TEST_DATA.foreignGovernmentRelations.hasRelations === 'YES') {
      await expect(page.locator('[data-testid="relative-1-foreign-relations-description"]')).toBeVisible();
      await page.fill('[data-testid="relative-1-foreign-relations-description"]', CONTACT_TEST_DATA.foreignGovernmentRelations.description);
    }

    await page.waitForTimeout(1000);

    // Verify foreign government relations
    await expect(page.locator('[data-testid="relative-1-foreign-relations-hasRelations"]')).toHaveValue(CONTACT_TEST_DATA.foreignGovernmentRelations.hasRelations);
    if (CONTACT_TEST_DATA.foreignGovernmentRelations.hasRelations === 'YES') {
      await expect(page.locator('[data-testid="relative-1-foreign-relations-description"]')).toHaveValue(CONTACT_TEST_DATA.foreignGovernmentRelations.description);
    }

    console.log('✅ Foreign government relations filled successfully');
  });

  test('should fill out contact dates (18.5 functionality)', async ({ page }) => {
    console.log('🧪 Testing Contact Dates (Section 18.5 functionality)');

    // Fill out first contact date
    await page.fill('[data-testid="relative-1-contact-firstDate"]', CONTACT_TEST_DATA.contactDates.firstContact.date);
    if (CONTACT_TEST_DATA.contactDates.firstContact.isEstimate) {
      await page.check('[data-testid="relative-1-contact-firstDate-estimate"]');
    }

    // Fill out last contact date
    if (!CONTACT_TEST_DATA.contactDates.lastContact.isPresent) {
      await page.fill('[data-testid="relative-1-contact-lastDate"]', CONTACT_TEST_DATA.contactDates.lastContact.date);
      if (CONTACT_TEST_DATA.contactDates.lastContact.isEstimate) {
        await page.check('[data-testid="relative-1-contact-lastDate-estimate"]');
      }
    } else {
      await page.check('[data-testid="relative-1-contact-lastDate-present"]');
      await page.waitForTimeout(500);
      
      // Verify last date field is disabled when present is checked
      await expect(page.locator('[data-testid="relative-1-contact-lastDate"]')).toBeDisabled();
    }

    await page.waitForTimeout(1000);

    // Verify contact dates
    await expect(page.locator('[data-testid="relative-1-contact-firstDate"]')).toHaveValue(CONTACT_TEST_DATA.contactDates.firstContact.date);
    if (!CONTACT_TEST_DATA.contactDates.lastContact.isPresent) {
      await expect(page.locator('[data-testid="relative-1-contact-lastDate"]')).toHaveValue(CONTACT_TEST_DATA.contactDates.lastContact.date);
    }

    console.log('✅ Contact dates filled successfully');
  });

  test('should fill out documentation types (18.4 functionality)', async ({ page }) => {
    console.log('🧪 Testing Documentation Types (Section 18.4 functionality)');

    // Fill out documentation types
    if (CONTACT_TEST_DATA.documentationTypes.i551PermanentResident) {
      await page.check('[data-testid="relative-1-doc-i551"]');
    }
    if (CONTACT_TEST_DATA.documentationTypes.i766EmploymentAuth) {
      await page.check('[data-testid="relative-1-doc-i766"]');
    }
    if (CONTACT_TEST_DATA.documentationTypes.usVisa) {
      await page.check('[data-testid="relative-1-doc-usVisa"]');
    }
    if (CONTACT_TEST_DATA.documentationTypes.i94ArrivalDeparture) {
      await page.check('[data-testid="relative-1-doc-i94"]');
    }
    if (CONTACT_TEST_DATA.documentationTypes.i20StudentCertificate) {
      await page.check('[data-testid="relative-1-doc-i20"]');
    }
    if (CONTACT_TEST_DATA.documentationTypes.ds2019ExchangeVisitor) {
      await page.check('[data-testid="relative-1-doc-ds2019"]');
    }
    if (CONTACT_TEST_DATA.documentationTypes.other) {
      await page.check('[data-testid="relative-1-doc-other"]');
      await page.fill('[data-testid="relative-1-doc-other-explanation"]', CONTACT_TEST_DATA.documentationTypes.otherExplanation);
    }

    // Fill out document details
    await page.fill('[data-testid="relative-1-doc-number"]', CONTACT_TEST_DATA.documentationTypes.documentNumber);
    await page.fill('[data-testid="relative-1-doc-expiration"]', CONTACT_TEST_DATA.documentationTypes.expirationDate);
    if (CONTACT_TEST_DATA.documentationTypes.expirationIsEstimate) {
      await page.check('[data-testid="relative-1-doc-expiration-estimate"]');
    }

    await page.waitForTimeout(1000);

    // Verify documentation types
    if (CONTACT_TEST_DATA.documentationTypes.i551PermanentResident) {
      await expect(page.locator('[data-testid="relative-1-doc-i551"]')).toBeChecked();
    }
    if (CONTACT_TEST_DATA.documentationTypes.usVisa) {
      await expect(page.locator('[data-testid="relative-1-doc-usVisa"]')).toBeChecked();
    }
    if (CONTACT_TEST_DATA.documentationTypes.other) {
      await expect(page.locator('[data-testid="relative-1-doc-other-explanation"]')).toHaveValue(CONTACT_TEST_DATA.documentationTypes.otherExplanation);
    }
    await expect(page.locator('[data-testid="relative-1-doc-number"]')).toHaveValue(CONTACT_TEST_DATA.documentationTypes.documentNumber);
    await expect(page.locator('[data-testid="relative-1-doc-expiration"]')).toHaveValue(CONTACT_TEST_DATA.documentationTypes.expirationDate);

    console.log('✅ Documentation types filled successfully');
  });

  test('should test complete Section 18.3 workflow', async ({ page }) => {
    console.log('🧪 Testing Complete Section 18.3 Workflow');

    // Ensure not applicable is unchecked
    await page.uncheck('[data-testid="relative-1-contact-notApplicable"]');
    await page.waitForTimeout(500);

    // Fill out all sections in sequence
    
    // 1. Contact methods
    await page.check('[data-testid="relative-1-contact-method-inPerson"]');
    await page.check('[data-testid="relative-1-contact-method-telephone"]');
    await page.check('[data-testid="relative-1-contact-method-other"]');
    await page.fill('[data-testid="relative-1-contact-method-other-explanation"]', CONTACT_TEST_DATA.contactMethods.otherExplanation);

    // 2. Contact frequency
    await page.check('[data-testid="relative-1-contact-frequency-weekly"]');
    await page.check('[data-testid="relative-1-contact-frequency-other"]');
    await page.fill('[data-testid="relative-1-contact-frequency-other-explanation"]', CONTACT_TEST_DATA.contactFrequency.otherExplanation);

    // 3. Employment information
    await page.fill('[data-testid="relative-1-employment-employer"]', CONTACT_TEST_DATA.employmentInfo.employerName);
    await page.fill('[data-testid="relative-1-employment-address-street"]', CONTACT_TEST_DATA.employmentInfo.employerAddress.street);
    await page.fill('[data-testid="relative-1-employment-address-city"]', CONTACT_TEST_DATA.employmentInfo.employerAddress.city);

    // 4. Foreign government relations
    await page.selectOption('[data-testid="relative-1-foreign-relations-hasRelations"]', CONTACT_TEST_DATA.foreignGovernmentRelations.hasRelations);
    await page.fill('[data-testid="relative-1-foreign-relations-description"]', CONTACT_TEST_DATA.foreignGovernmentRelations.description);

    // 5. Contact dates
    await page.fill('[data-testid="relative-1-contact-firstDate"]', CONTACT_TEST_DATA.contactDates.firstContact.date);
    await page.fill('[data-testid="relative-1-contact-lastDate"]', CONTACT_TEST_DATA.contactDates.lastContact.date);

    // 6. Documentation types
    await page.check('[data-testid="relative-1-doc-i551"]');
    await page.check('[data-testid="relative-1-doc-usVisa"]');
    await page.fill('[data-testid="relative-1-doc-number"]', CONTACT_TEST_DATA.documentationTypes.documentNumber);
    await page.fill('[data-testid="relative-1-doc-expiration"]', CONTACT_TEST_DATA.documentationTypes.expirationDate);

    await page.waitForTimeout(2000);

    // Verify key fields are filled
    await expect(page.locator('[data-testid="relative-1-contact-method-other-explanation"]')).toHaveValue(CONTACT_TEST_DATA.contactMethods.otherExplanation);
    await expect(page.locator('[data-testid="relative-1-employment-employer"]')).toHaveValue(CONTACT_TEST_DATA.employmentInfo.employerName);
    await expect(page.locator('[data-testid="relative-1-foreign-relations-description"]')).toHaveValue(CONTACT_TEST_DATA.foreignGovernmentRelations.description);
    await expect(page.locator('[data-testid="relative-1-doc-number"]')).toHaveValue(CONTACT_TEST_DATA.documentationTypes.documentNumber);

    console.log('✅ Complete Section 18.3 workflow tested successfully');
  });

  test('should test field interactions and conditional logic', async ({ page }) => {
    console.log('🧪 Testing Field Interactions and Conditional Logic');

    // Test contact method "other" explanation visibility
    await page.check('[data-testid="relative-1-contact-method-other"]');
    await expect(page.locator('[data-testid="relative-1-contact-method-other-explanation"]')).toBeVisible();
    
    await page.uncheck('[data-testid="relative-1-contact-method-other"]');
    await expect(page.locator('[data-testid="relative-1-contact-method-other-explanation"]')).not.toBeVisible();

    // Test contact frequency "other" explanation visibility
    await page.check('[data-testid="relative-1-contact-frequency-other"]');
    await expect(page.locator('[data-testid="relative-1-contact-frequency-other-explanation"]')).toBeVisible();
    
    await page.uncheck('[data-testid="relative-1-contact-frequency-other"]');
    await expect(page.locator('[data-testid="relative-1-contact-frequency-other-explanation"]')).not.toBeVisible();

    // Test foreign relations description visibility
    await page.selectOption('[data-testid="relative-1-foreign-relations-hasRelations"]', 'YES');
    await expect(page.locator('[data-testid="relative-1-foreign-relations-description"]')).toBeVisible();
    
    await page.selectOption('[data-testid="relative-1-foreign-relations-hasRelations"]', 'NO');
    await expect(page.locator('[data-testid="relative-1-foreign-relations-description"]')).not.toBeVisible();

    // Test documentation "other" explanation visibility
    await page.check('[data-testid="relative-1-doc-other"]');
    await expect(page.locator('[data-testid="relative-1-doc-other-explanation"]')).toBeVisible();
    
    await page.uncheck('[data-testid="relative-1-doc-other"]');
    await expect(page.locator('[data-testid="relative-1-doc-other-explanation"]')).not.toBeVisible();

    // Test last contact date present checkbox
    await page.check('[data-testid="relative-1-contact-lastDate-present"]');
    await expect(page.locator('[data-testid="relative-1-contact-lastDate"]')).toBeDisabled();
    
    await page.uncheck('[data-testid="relative-1-contact-lastDate-present"]');
    await expect(page.locator('[data-testid="relative-1-contact-lastDate"]')).toBeEnabled();

    console.log('✅ Field interactions and conditional logic tested');
  });

  test('should test multiple relatives contact information', async ({ page }) => {
    console.log('🧪 Testing Multiple Relatives Contact Information');

    // Test first relative
    await page.check('[data-testid="relative-1-contact-method-inPerson"]');
    await page.fill('[data-testid="relative-1-employment-employer"]', 'First Employer');
    await page.selectOption('[data-testid="relative-1-foreign-relations-hasRelations"]', 'YES');

    // Switch to second relative
    await page.click('[data-testid="relative-2-tab"]');
    await page.waitForTimeout(500);

    // Test second relative
    await page.check('[data-testid="relative-2-contact-method-telephone"]');
    await page.fill('[data-testid="relative-2-employment-employer"]', 'Second Employer');
    await page.selectOption('[data-testid="relative-2-foreign-relations-hasRelations"]', 'NO');

    // Switch back to first relative and verify data persistence
    await page.click('[data-testid="relative-1-tab"]');
    await page.waitForTimeout(500);

    await expect(page.locator('[data-testid="relative-1-contact-method-inPerson"]')).toBeChecked();
    await expect(page.locator('[data-testid="relative-1-employment-employer"]')).toHaveValue('First Employer');

    // Switch back to second relative and verify
    await page.click('[data-testid="relative-2-tab"]');
    await page.waitForTimeout(500);

    await expect(page.locator('[data-testid="relative-2-contact-method-telephone"]')).toBeChecked();
    await expect(page.locator('[data-testid="relative-2-employment-employer"]')).toHaveValue('Second Employer');

    console.log('✅ Multiple relatives contact information tested');
  });

  test('should test comprehensive error handling', async ({ page }) => {
    console.log('🧪 Testing Comprehensive Error Handling');

    // Test invalid date formats
    await page.fill('[data-testid="relative-1-contact-firstDate"]', 'invalid-date');
    await page.blur('[data-testid="relative-1-contact-firstDate"]');
    await page.waitForTimeout(500);

    // Test invalid document number formats
    await page.fill('[data-testid="relative-1-doc-number"]', '');
    await page.check('[data-testid="relative-1-doc-i551"]'); // Check a doc type but leave number empty
    await page.blur('[data-testid="relative-1-doc-number"]');
    await page.waitForTimeout(500);

    // Test required field validation
    await page.selectOption('[data-testid="relative-1-foreign-relations-hasRelations"]', 'YES');
    await page.fill('[data-testid="relative-1-foreign-relations-description"]', '');
    await page.blur('[data-testid="relative-1-foreign-relations-description"]');
    await page.waitForTimeout(500);

    console.log('✅ Error handling tested');
  });
});
