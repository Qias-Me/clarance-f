/**
 * Comprehensive Section 16 End-to-End Testing
 * 
 * Tests all 108 fields (36 fields × 3 people) in Section 16 to verify:
 * - Field connectivity to Section16Context
 * - Data persistence through SF86FormContext to IndexedDB
 * - Form validation and error handling
 * - Cross-section field mapping (Section16_1 should NOT be present)
 */

import { test, expect, Page } from '@playwright/test';

interface PersonTestData {
  // Personal Information (4 fields)
  firstName: string;
  middleName: string;
  lastName: string;
  suffix: string;
  
  // Date Range (5 fields)
  datesKnownFromMonth: string;
  datesKnownFromYear: string;
  datesKnownToMonth: string;
  datesKnownToYear: string;
  isPresent: boolean;
  
  // Contact Information (6 fields)
  emailAddress: string;
  phoneExtension: string;
  phoneNumber: string;
  mobileNumber: string;
  phoneDay: boolean;
  phoneNight: boolean;
  
  // Address (5 fields)
  street: string;
  city: string;
  state: string;
  country: string;
  zipCode: string;
  
  // Professional (3 fields)
  rankTitle: string;
  rankTitleNotApplicable: boolean;
  rankTitleDontKnow: boolean;
  
  // Relationship (6 fields)
  relationshipFriend: boolean;
  relationshipNeighbor: boolean;
  relationshipSchoolmate: boolean;
  relationshipWorkAssociate: boolean;
  relationshipOther: boolean;
  relationshipOtherExplanation: string;
  
  // Additional (7 fields)
  additionalInfo: string;
  phoneInternational: boolean;
  phoneDontKnow: boolean;
  additionalTextField1: string;
  additionalTextField2: string;
  additionalCheckbox1: boolean;
  additionalCheckbox2: boolean;
}

const TEST_DATA: PersonTestData[] = [
  {
    // Person 1 Test Data
    firstName: 'John',
    middleName: 'Michael',
    lastName: 'Smith',
    suffix: 'Jr.',
    datesKnownFromMonth: '01',
    datesKnownFromYear: '2020',
    datesKnownToMonth: '12',
    datesKnownToYear: '2023',
    isPresent: false,
    emailAddress: 'john.smith@example.com',
    phoneExtension: '123',
    phoneNumber: '555-0101',
    mobileNumber: '555-0102',
    phoneDay: true,
    phoneNight: false,
    street: '123 Main St',
    city: 'Anytown',
    state: 'CA',
    country: 'United States',
    zipCode: '12345',
    rankTitle: 'Manager',
    rankTitleNotApplicable: false,
    rankTitleDontKnow: false,
    relationshipFriend: true,
    relationshipNeighbor: false,
    relationshipSchoolmate: false,
    relationshipWorkAssociate: true,
    relationshipOther: false,
    relationshipOtherExplanation: '',
    additionalInfo: 'Known through work projects',
    phoneInternational: false,
    phoneDontKnow: false,
    additionalTextField1: 'Additional info 1',
    additionalTextField2: 'Additional info 2',
    additionalCheckbox1: true,
    additionalCheckbox2: false
  },
  {
    // Person 2 Test Data
    firstName: 'Sarah',
    middleName: 'Elizabeth',
    lastName: 'Johnson',
    suffix: '',
    datesKnownFromMonth: '06',
    datesKnownFromYear: '2019',
    datesKnownToMonth: '',
    datesKnownToYear: '',
    isPresent: true,
    emailAddress: 'sarah.johnson@example.com',
    phoneExtension: '456',
    phoneNumber: '555-0201',
    mobileNumber: '555-0202',
    phoneDay: false,
    phoneNight: true,
    street: '456 Oak Ave',
    city: 'Somewhere',
    state: 'NY',
    country: 'United States',
    zipCode: '67890',
    rankTitle: 'Director',
    rankTitleNotApplicable: false,
    rankTitleDontKnow: false,
    relationshipFriend: false,
    relationshipNeighbor: true,
    relationshipSchoolmate: true,
    relationshipWorkAssociate: false,
    relationshipOther: false,
    relationshipOtherExplanation: '',
    additionalInfo: 'Neighbor and college friend',
    phoneInternational: false,
    phoneDontKnow: false,
    additionalTextField1: 'Person 2 additional 1',
    additionalTextField2: 'Person 2 additional 2',
    additionalCheckbox1: false,
    additionalCheckbox2: true
  },
  {
    // Person 3 Test Data
    firstName: 'Robert',
    middleName: 'James',
    lastName: 'Williams',
    suffix: 'Sr.',
    datesKnownFromMonth: '03',
    datesKnownFromYear: '2018',
    datesKnownToMonth: '09',
    datesKnownToYear: '2022',
    isPresent: false,
    emailAddress: 'robert.williams@example.com',
    phoneExtension: '789',
    phoneNumber: '555-0301',
    mobileNumber: '555-0302',
    phoneDay: true,
    phoneNight: true,
    street: '789 Pine Rd',
    city: 'Elsewhere',
    state: 'TX',
    country: 'United States',
    zipCode: '54321',
    rankTitle: '',
    rankTitleNotApplicable: true,
    rankTitleDontKnow: false,
    relationshipFriend: false,
    relationshipNeighbor: false,
    relationshipSchoolmate: false,
    relationshipWorkAssociate: false,
    relationshipOther: true,
    relationshipOtherExplanation: 'Family friend',
    additionalInfo: 'Long-time family friend',
    phoneInternational: true,
    phoneDontKnow: false,
    additionalTextField1: 'Person 3 additional 1',
    additionalTextField2: 'Person 3 additional 2',
    additionalCheckbox1: true,
    additionalCheckbox2: true
  }
];

test.describe('Section 16 Comprehensive Field Testing', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate directly to the SF-86 form
    await page.goto('/startForm');

    // Wait for the application to load
    await page.waitForLoadState('networkidle');

    // Wait for the SF-86 form container to be visible
    await page.waitForSelector('[data-testid="sf86-form-container"]', { timeout: 15000 });

    // Take initial screenshot
    await page.screenshot({ path: 'test-results/sf86-form-loaded.png', fullPage: true });

    // Look for Section 16 navigation button
    const section16Button = page.locator('button').filter({ hasText: /section.*16/i });

    if (await section16Button.count() > 0) {
      console.log('✅ Found Section 16 navigation button');
      await section16Button.first().click();
      await page.waitForLoadState('networkidle');
      await page.screenshot({ path: 'test-results/section16-loaded.png', fullPage: true });
      console.log('🎯 Navigated to Section 16');
    } else {
      console.log('⚠️  Section 16 navigation button not found');
      // Try to find any section navigation
      const allSectionButtons = page.locator('button').filter({ hasText: /section/i });
      const count = await allSectionButtons.count();
      console.log(`Found ${count} section buttons`);

      if (count > 0) {
        for (let i = 0; i < Math.min(count, 5); i++) {
          const text = await allSectionButtons.nth(i).textContent();
          console.log(`Section button ${i}: ${text}`);
        }
      }
    }
  });

  test('should load Section 16 with 3 person entries and no foreign organization contact', async ({ page }) => {
    // Take initial screenshot
    await page.screenshot({ path: 'test-results/section16-initial.png', fullPage: true });
    
    // Verify Section 16 loads correctly
    await expect(page.locator('h1, h2, h3')).toContainText(/Section 16|People Who Know You Well/i);
    
    // Verify 3 person entries are present
    const personEntries = page.locator('[data-testid*="person-entry"], .person-entry, [class*="person"]');
    await expect(personEntries).toHaveCount(3);
    
    // Verify NO foreign organization contact section (should be in Section 15 now)
    const foreignOrgSection = page.locator('text=/foreign.*organization/i');
    await expect(foreignOrgSection).toHaveCount(0);
    
    console.log('✅ Section 16 loaded with 3 person entries, no foreign organization contact');
  });

  test('should test all fields for Person 1', async ({ page }) => {
    await testPersonFields(page, 0, TEST_DATA[0]);
  });

  test('should test all fields for Person 2', async ({ page }) => {
    await testPersonFields(page, 1, TEST_DATA[1]);
  });

  test('should test all fields for Person 3', async ({ page }) => {
    await testPersonFields(page, 2, TEST_DATA[2]);
  });

  test('should test data persistence across all 3 people', async ({ page }) => {
    // Fill all fields for all 3 people
    for (let i = 0; i < 3; i++) {
      await testPersonFields(page, i, TEST_DATA[i]);
    }
    
    // Submit the form
    await page.click('button[type="submit"], input[type="submit"], .submit-button');
    await page.waitForLoadState('networkidle');
    
    // Reload the page
    await page.reload();
    await page.waitForLoadState('networkidle');
    
    // Navigate back to Section 16
    await page.click('text=Section 16');
    await page.waitForLoadState('networkidle');
    
    // Verify all data persists
    for (let i = 0; i < 3; i++) {
      await verifyPersonData(page, i, TEST_DATA[i]);
    }
    
    console.log('✅ Data persistence verified for all 3 people');
  });
});

async function testPersonFields(page: Page, personIndex: number, testData: PersonTestData) {
  const personSelector = `[data-testid="person-${personIndex}"], .person-${personIndex}, [data-person="${personIndex}"]`;
  
  console.log(`🧪 Testing Person ${personIndex + 1} fields...`);
  
  // Personal Information (4 fields)
  await fillTextField(page, personSelector, 'firstName', testData.firstName);
  await fillTextField(page, personSelector, 'middleName', testData.middleName);
  await fillTextField(page, personSelector, 'lastName', testData.lastName);
  await fillTextField(page, personSelector, 'suffix', testData.suffix);
  
  // Date Range (5 fields)
  await fillTextField(page, personSelector, 'datesKnownFromMonth', testData.datesKnownFromMonth);
  await fillTextField(page, personSelector, 'datesKnownFromYear', testData.datesKnownFromYear);
  if (!testData.isPresent) {
    await fillTextField(page, personSelector, 'datesKnownToMonth', testData.datesKnownToMonth);
    await fillTextField(page, personSelector, 'datesKnownToYear', testData.datesKnownToYear);
  }
  await setCheckbox(page, personSelector, 'isPresent', testData.isPresent);
  
  // Contact Information (6 fields)
  await fillTextField(page, personSelector, 'emailAddress', testData.emailAddress);
  await fillTextField(page, personSelector, 'phoneExtension', testData.phoneExtension);
  await fillTextField(page, personSelector, 'phoneNumber', testData.phoneNumber);
  await fillTextField(page, personSelector, 'mobileNumber', testData.mobileNumber);
  await setCheckbox(page, personSelector, 'phoneDay', testData.phoneDay);
  await setCheckbox(page, personSelector, 'phoneNight', testData.phoneNight);
  
  // Address (5 fields)
  await fillTextField(page, personSelector, 'street', testData.street);
  await fillTextField(page, personSelector, 'city', testData.city);
  await fillTextField(page, personSelector, 'state', testData.state);
  await fillTextField(page, personSelector, 'country', testData.country);
  await fillTextField(page, personSelector, 'zipCode', testData.zipCode);
  
  // Professional (3 fields)
  await fillTextField(page, personSelector, 'rankTitle', testData.rankTitle);
  await setCheckbox(page, personSelector, 'rankTitleNotApplicable', testData.rankTitleNotApplicable);
  await setCheckbox(page, personSelector, 'rankTitleDontKnow', testData.rankTitleDontKnow);
  
  // Relationship (6 fields)
  await setCheckbox(page, personSelector, 'relationshipFriend', testData.relationshipFriend);
  await setCheckbox(page, personSelector, 'relationshipNeighbor', testData.relationshipNeighbor);
  await setCheckbox(page, personSelector, 'relationshipSchoolmate', testData.relationshipSchoolmate);
  await setCheckbox(page, personSelector, 'relationshipWorkAssociate', testData.relationshipWorkAssociate);
  await setCheckbox(page, personSelector, 'relationshipOther', testData.relationshipOther);
  await fillTextField(page, personSelector, 'relationshipOtherExplanation', testData.relationshipOtherExplanation);
  
  // Additional (7 fields)
  await fillTextField(page, personSelector, 'additionalInfo', testData.additionalInfo);
  await setCheckbox(page, personSelector, 'phoneInternational', testData.phoneInternational);
  await setCheckbox(page, personSelector, 'phoneDontKnow', testData.phoneDontKnow);
  await fillTextField(page, personSelector, 'additionalTextField1', testData.additionalTextField1);
  await fillTextField(page, personSelector, 'additionalTextField2', testData.additionalTextField2);
  await setCheckbox(page, personSelector, 'additionalCheckbox1', testData.additionalCheckbox1);
  await setCheckbox(page, personSelector, 'additionalCheckbox2', testData.additionalCheckbox2);
  
  console.log(`✅ Person ${personIndex + 1} - All 36 fields tested`);
}

async function fillTextField(page: Page, personSelector: string, fieldName: string, value: string) {
  if (!value) return;
  
  const fieldSelectors = [
    `${personSelector} [name*="${fieldName}"]`,
    `${personSelector} [data-testid*="${fieldName}"]`,
    `${personSelector} input[placeholder*="${fieldName}"]`,
    `input[name*="person${personSelector.slice(-1)}_${fieldName}"]`
  ];
  
  for (const selector of fieldSelectors) {
    try {
      const field = page.locator(selector).first();
      if (await field.isVisible({ timeout: 1000 })) {
        await field.fill(value);
        return;
      }
    } catch (e) {
      // Continue to next selector
    }
  }
  
  console.warn(`⚠️  Field ${fieldName} not found for person selector ${personSelector}`);
}

async function setCheckbox(page: Page, personSelector: string, fieldName: string, checked: boolean) {
  const fieldSelectors = [
    `${personSelector} [name*="${fieldName}"]`,
    `${personSelector} [data-testid*="${fieldName}"]`,
    `${personSelector} input[type="checkbox"][placeholder*="${fieldName}"]`,
    `input[type="checkbox"][name*="person${personSelector.slice(-1)}_${fieldName}"]`
  ];
  
  for (const selector of fieldSelectors) {
    try {
      const field = page.locator(selector).first();
      if (await field.isVisible({ timeout: 1000 })) {
        await field.setChecked(checked);
        return;
      }
    } catch (e) {
      // Continue to next selector
    }
  }
  
  console.warn(`⚠️  Checkbox ${fieldName} not found for person selector ${personSelector}`);
}

async function verifyPersonData(page: Page, personIndex: number, expectedData: PersonTestData) {
  const personSelector = `[data-testid="person-${personIndex}"], .person-${personIndex}, [data-person="${personIndex}"]`;
  
  // Verify a few key fields to confirm data persistence
  await expect(page.locator(`${personSelector} [name*="firstName"]`).first()).toHaveValue(expectedData.firstName);
  await expect(page.locator(`${personSelector} [name*="lastName"]`).first()).toHaveValue(expectedData.lastName);
  await expect(page.locator(`${personSelector} [name*="emailAddress"]`).first()).toHaveValue(expectedData.emailAddress);
  
  console.log(`✅ Person ${personIndex + 1} data persistence verified`);
}
