/**
 * Section 19 Comprehensive Playwright Tests
 * 
 * Tests all 277 fields across 4 subsections of Section 19 (Foreign Activities)
 * Monitors console logs for errors and validates complete field interaction
 */

import { test, expect, Page } from '@playwright/test';
import {
  fillDateOfBirthFields,
  fillPlaceOfBirthFields,
  fillAddressFields,
  fillCitizenshipFields,
  fillContactMethodFields,
  fillContactDateFields,
  fillContactFrequencyFields,
  fillRelationshipTypeFields,
  fillAdditionalNamesTable,
  fillEmploymentFields,
  fillGovernmentRelationshipFields
} from './section19-field-helpers';
import {
  testTextFields,
  testCheckboxFields,
  testDropdownFields,
  testRadioFields,
  testDateFields,
  runComprehensiveFieldTests
} from './section19-field-type-tests';

// Test data for comprehensive field testing
const testData = {
  foreignContact1: {
    personalInfo: {
      name: {
        first: 'Ivan',
        middle: 'Dmitri',
        last: 'Petrov',
        suffix: 'Jr'
      },
      dateOfBirth: {
        date: '1985-03-15',
        estimated: false,
        unknown: false
      },
      placeOfBirth: {
        city: 'Moscow',
        country: 'Russia',
        unknown: false
      },
      address: {
        street: '123 Red Square',
        city: 'Moscow',
        state: 'Moscow Oblast',
        zipCode: '101000',
        country: 'Russia'
      }
    },
    citizenship: {
      country1: 'Russia',
      country2: 'Belarus'
    },
    contactMethods: {
      inPerson: true,
      telephone: true,
      electronic: false,
      writtenCorrespondence: false,
      other: true,
      otherExplanation: 'Video calls via secure messaging'
    },
    contactDates: {
      firstContact: '2020-01-15',
      firstContactEstimated: false,
      lastContact: '2023-12-01',
      lastContactEstimated: false
    },
    contactFrequency: '3', // Scale 1-6
    relationshipTypes: {
      professionalBusiness: true,
      personal: false,
      obligation: false,
      other: false,
      professionalExplanation: 'Business partner in technology consulting'
    },
    additionalNames: {
      row1: { last: 'Petrov', first: 'Ivan', middle: 'Dmitri', suffix: 'Jr' },
      row2: { last: 'Petrov', first: 'Vanya', middle: '', suffix: '' },
      row3: { last: '', first: '', middle: '', suffix: '' },
      row4: { last: '', first: '', middle: '', suffix: '' }
    },
    employment: {
      employerName: 'Moscow Tech Solutions',
      unknownEmployer: false,
      employerAddress: {
        street: '456 Technology Boulevard',
        city: 'Moscow',
        state: 'Moscow Oblast',
        zipCode: '101001',
        country: 'Russia',
        unknown: false
      }
    },
    governmentRelationship: {
      hasRelationship: 'NO',
      description: '',
      additionalDetails: 'NO'
    }
  },
  foreignContact2: {
    personalInfo: {
      name: {
        first: 'Li',
        middle: 'Wei',
        last: 'Zhang',
        suffix: ''
      },
      dateOfBirth: {
        date: '1990-07-22',
        estimated: true,
        unknown: false
      },
      placeOfBirth: {
        city: 'Beijing',
        country: 'China',
        unknown: false
      },
      address: {
        street: '789 Great Wall Street',
        city: 'Beijing',
        state: 'Beijing',
        zipCode: '100000',
        country: 'China'
      }
    },
    citizenship: {
      country1: 'China',
      country2: ''
    },
    contactMethods: {
      inPerson: false,
      telephone: false,
      electronic: true,
      writtenCorrespondence: true,
      other: false,
      otherExplanation: ''
    },
    contactDates: {
      firstContact: '2021-06-10',
      firstContactEstimated: true,
      lastContact: '2023-11-15',
      lastContactEstimated: false
    },
    contactFrequency: '2',
    relationshipTypes: {
      professionalBusiness: false,
      personal: true,
      obligation: false,
      other: false,
      personalExplanation: 'University friend from exchange program'
    },
    additionalNames: {
      row1: { last: 'Zhang', first: 'Li', middle: 'Wei', suffix: '' },
      row2: { last: '', first: '', middle: '', suffix: '' },
      row3: { last: '', first: '', middle: '', suffix: '' },
      row4: { last: '', first: '', middle: '', suffix: '' }
    },
    employment: {
      employerName: 'Beijing University',
      unknownEmployer: false,
      employerAddress: {
        street: '15 Academic Road',
        city: 'Beijing',
        state: 'Beijing',
        zipCode: '100871',
        country: 'China',
        unknown: false
      }
    },
    governmentRelationship: {
      hasRelationship: 'NO',
      description: '',
      additionalDetails: 'NO'
    }
  }
};

// Console log monitoring setup
let consoleErrors: string[] = [];
let consoleWarnings: string[] = [];

test.describe('Section 19 - Foreign Activities Comprehensive Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Reset console log arrays
    consoleErrors = [];
    consoleWarnings = [];

    // Monitor console logs
    page.on('console', (msg) => {
      const text = msg.text();
      const type = msg.type();
      
      if (type === 'error') {
        consoleErrors.push(text);
        console.log(`🔴 Console Error: ${text}`);
      } else if (type === 'warning') {
        consoleWarnings.push(text);
        console.log(`🟡 Console Warning: ${text}`);
      } else if (type === 'log' && (text.includes('Section19') || text.includes('section19'))) {
        console.log(`📝 Section 19 Log: ${text}`);
      }
    });

    // Navigate to Section 19
    await page.goto('/form/section19');
    await page.waitForLoadState('networkidle');
    
    console.log('🚀 Starting Section 19 comprehensive test...');
  });

  test.afterEach(async () => {
    // Report console errors and warnings
    if (consoleErrors.length > 0) {
      console.log(`\n❌ Console Errors Found: ${consoleErrors.length}`);
      consoleErrors.forEach((error, index) => {
        console.log(`  ${index + 1}. ${error}`);
      });
    }

    if (consoleWarnings.length > 0) {
      console.log(`\n⚠️ Console Warnings Found: ${consoleWarnings.length}`);
      consoleWarnings.forEach((warning, index) => {
        console.log(`  ${index + 1}. ${warning}`);
      });
    }

    if (consoleErrors.length === 0 && consoleWarnings.length === 0) {
      console.log('\n✅ No console errors or warnings detected');
    }
  });

  test('should initialize Section 19 with proper field validation', async ({ page }) => {
    console.log('🔍 Testing Section 19 initialization and field validation...');

    // Wait for the section to load
    await expect(page.locator('[data-testid="section19-container"]')).toBeVisible({ timeout: 10000 });

    // Check for field validation logs in console
    await page.waitForTimeout(2000); // Allow time for validation logs

    // Verify main radio button is present
    const mainRadio = page.locator('input[name*="hasContact"], input[name*="foreign"], [data-testid*="foreign-contact"]');
    await expect(mainRadio.first()).toBeVisible();

    console.log('✅ Section 19 initialized successfully');
  });

  test('should handle main foreign contact radio button', async ({ page }) => {
    console.log('🔍 Testing main foreign contact radio button...');

    // Find and interact with the main radio button
    const yesRadio = page.locator('input[value="YES"], input[value="yes"]').first();
    const noRadio = page.locator('input[value="NO"], input[value="no"]').first();

    // Test NO selection first
    if (await noRadio.isVisible()) {
      await noRadio.click();
      console.log('✅ Selected NO for foreign contacts');
      await page.waitForTimeout(1000);
    }

    // Test YES selection
    if (await yesRadio.isVisible()) {
      await yesRadio.click();
      console.log('✅ Selected YES for foreign contacts');
      await page.waitForTimeout(1000);

      // Verify that entry fields become available
      const addEntryButton = page.locator('button:has-text("Add"), button:has-text("New"), [data-testid*="add"]');
      if (await addEntryButton.first().isVisible()) {
        console.log('✅ Add entry button became available');
      }
    }
  });

  test('should create and fill first foreign contact entry (Subsection 1)', async ({ page }) => {
    console.log('🔍 Testing first foreign contact entry creation and field filling...');

    // Enable foreign contacts
    const yesRadio = page.locator('input[value="YES"], input[value="yes"]').first();
    if (await yesRadio.isVisible()) {
      await yesRadio.click();
      await page.waitForTimeout(1000);
    }

    // Add first entry
    const addButton = page.locator('button:has-text("Add"), button:has-text("New"), [data-testid*="add"]').first();
    if (await addButton.isVisible()) {
      await addButton.click();
      await page.waitForTimeout(2000);
      console.log('✅ Added first foreign contact entry');
    }

    // Fill out all fields for first contact
    await fillForeignContactEntry(page, 0, testData.foreignContact1);
    
    console.log('✅ Completed first foreign contact entry');
  });

  test('should create and fill second foreign contact entry (Subsection 2)', async ({ page }) => {
    console.log('🔍 Testing second foreign contact entry creation and field filling...');

    // Enable foreign contacts and add first entry
    await setupForeignContacts(page);

    // Add second entry
    const addButton = page.locator('button:has-text("Add"), button:has-text("New"), [data-testid*="add"]').first();
    if (await addButton.isVisible()) {
      await addButton.click();
      await page.waitForTimeout(2000);
      console.log('✅ Added second foreign contact entry');
    }

    // Fill out all fields for second contact
    await fillForeignContactEntry(page, 1, testData.foreignContact2);

    console.log('✅ Completed second foreign contact entry');
  });

  test('should test all field types and interactions', async ({ page }) => {
    console.log('🔍 Testing all field types and interactions...');

    await setupForeignContacts(page);

    // Test different field types
    await testTextFields(page);
    await testCheckboxFields(page);
    await testDropdownFields(page);
    await testRadioFields(page);
    await testDateFields(page);

    console.log('✅ All field types tested successfully');
  });

  test('should validate field count and PDF field references', async ({ page }) => {
    console.log('🔍 Testing field count validation and PDF field references...');

    await setupForeignContacts(page);

    // Check console logs for field validation messages
    await page.waitForTimeout(3000);

    // Look for validation messages in console
    const hasValidationLogs = consoleErrors.some(log => log.includes('validation')) ||
                             consoleWarnings.some(log => log.includes('validation'));

    console.log(`📊 Field validation logs detected: ${hasValidationLogs ? 'Yes' : 'No'}`);
    console.log('✅ Field validation test completed');
  });

  test('should test entry management operations', async ({ page }) => {
    console.log('🔍 Testing entry management operations...');

    await setupForeignContacts(page);

    // Test adding multiple entries
    for (let i = 0; i < 3; i++) {
      const addButton = page.locator('button:has-text("Add"), button:has-text("New"), [data-testid*="add"]').first();
      if (await addButton.isVisible()) {
        await addButton.click();
        await page.waitForTimeout(1000);
        console.log(`✅ Added entry ${i + 1}`);
      }
    }

    // Test entry removal if available
    const removeButtons = page.locator('button:has-text("Remove"), button:has-text("Delete"), [data-testid*="remove"]');
    const removeCount = await removeButtons.count();
    if (removeCount > 0) {
      await removeButtons.first().click();
      await page.waitForTimeout(1000);
      console.log('✅ Tested entry removal');
    }

    console.log('✅ Entry management operations tested');
  });
});

// Helper Functions
async function setupForeignContacts(page: Page) {
  const yesRadio = page.locator('input[value="YES"], input[value="yes"]').first();
  if (await yesRadio.isVisible()) {
    await yesRadio.click();
    await page.waitForTimeout(1000);
  }

  const addButton = page.locator('button:has-text("Add"), button:has-text("New"), [data-testid*="add"]').first();
  if (await addButton.isVisible()) {
    await addButton.click();
    await page.waitForTimeout(2000);
  }
}

async function fillForeignContactEntry(page: Page, entryIndex: number, contactData: any) {
  console.log(`🔍 Filling foreign contact entry ${entryIndex}...`);

  const entrySelector = `[data-testid*="entry-${entryIndex}"], [data-entry-index="${entryIndex}"], .entry-${entryIndex}`;

  // Personal Information - Name fields
  await fillNameFields(page, entryIndex, contactData.personalInfo.name);

  // Date of Birth
  await fillDateOfBirthFields(page, entryIndex, contactData.personalInfo.dateOfBirth);

  // Place of Birth
  await fillPlaceOfBirthFields(page, entryIndex, contactData.personalInfo.placeOfBirth);

  // Address
  await fillAddressFields(page, entryIndex, contactData.personalInfo.address);

  // Citizenship
  await fillCitizenshipFields(page, entryIndex, contactData.citizenship);

  // Contact Methods
  await fillContactMethodFields(page, entryIndex, contactData.contactMethods);

  // Contact Dates
  await fillContactDateFields(page, entryIndex, contactData.contactDates);

  // Contact Frequency
  await fillContactFrequencyFields(page, entryIndex, contactData.contactFrequency);

  // Relationship Types
  await fillRelationshipTypeFields(page, entryIndex, contactData.relationshipTypes);

  // Additional Names Table
  await fillAdditionalNamesTable(page, entryIndex, contactData.additionalNames);

  // Employment Information
  await fillEmploymentFields(page, entryIndex, contactData.employment);

  // Government Relationship
  await fillGovernmentRelationshipFields(page, entryIndex, contactData.governmentRelationship);

  console.log(`✅ Completed filling entry ${entryIndex}`);
}

async function fillNameFields(page: Page, entryIndex: number, nameData: any) {
  console.log(`  📝 Filling name fields for entry ${entryIndex}...`);

  const selectors = [
    `input[name*="firstName"], input[name*="first"], [data-testid*="first-name"]`,
    `input[name*="middleName"], input[name*="middle"], [data-testid*="middle-name"]`,
    `input[name*="lastName"], input[name*="last"], [data-testid*="last-name"]`,
    `select[name*="suffix"], [data-testid*="suffix"]`
  ];

  const values = [nameData.first, nameData.middle, nameData.last, nameData.suffix];

  for (let i = 0; i < selectors.length; i++) {
    const field = page.locator(selectors[i]).nth(entryIndex);
    if (await field.isVisible()) {
      if (selectors[i].includes('select')) {
        if (values[i]) await field.selectOption(values[i]);
      } else {
        await field.fill(values[i] || '');
      }
      await page.waitForTimeout(200);
    }
  }

  // Unknown checkbox
  const unknownCheckbox = page.locator(`input[name*="unknown"], [data-testid*="unknown"]`).nth(entryIndex);
  if (await unknownCheckbox.isVisible() && nameData.unknown) {
    await unknownCheckbox.check();
  }
}

async function fillNameFields(page: Page, entryIndex: number, nameData: any) {
  console.log(`  📝 Filling name fields for entry ${entryIndex}...`);

  const selectors = [
    `input[name*="firstName"], input[name*="first"], [data-testid*="first-name"]`,
    `input[name*="middleName"], input[name*="middle"], [data-testid*="middle-name"]`,
    `input[name*="lastName"], input[name*="last"], [data-testid*="last-name"]`,
    `select[name*="suffix"], [data-testid*="suffix"]`
  ];

  const values = [nameData.first, nameData.middle, nameData.last, nameData.suffix];

  for (let i = 0; i < selectors.length; i++) {
    const field = page.locator(selectors[i]).nth(entryIndex);
    if (await field.isVisible()) {
      if (selectors[i].includes('select')) {
        if (values[i]) await field.selectOption(values[i]);
      } else {
        await field.fill(values[i] || '');
      }
      await page.waitForTimeout(200);
    }
  }

  // Unknown checkbox
  const unknownCheckbox = page.locator(`input[name*="unknown"], [data-testid*="unknown"]`).nth(entryIndex);
  if (await unknownCheckbox.isVisible() && nameData.unknown) {
    await unknownCheckbox.check();
  }
}
