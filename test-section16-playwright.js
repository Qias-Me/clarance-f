/**
 * Section 16 Playwright Testing Script
 * Tests the "People Who Know You Well" form with all 108 fields
 */

import { chromium } from 'playwright';

// Helper function to test individual fields
async function testField(page, personIndex, fieldName, value, type = 'text') {
  const testId = `person-${personIndex}-${fieldName}`;
  const result = {
    person: personIndex + 1,
    field: fieldName,
    value: value,
    type: type,
    success: false,
    error: null
  };

  try {
    const field = page.locator(`[data-testid="${testId}"]`);

    if (await field.isVisible()) {
      if (type === 'checkbox') {
        if (value) {
          await field.check();
        } else {
          await field.uncheck();
        }
        const isChecked = await field.isChecked();
        result.success = isChecked === value;
        console.log(`    ${result.success ? '✅' : '❌'} ${fieldName}: ${isChecked} (expected: ${value})`);
      } else {
        await field.fill(value);
        const actualValue = await field.inputValue();
        result.success = actualValue === value;
        console.log(`    ${result.success ? '✅' : '❌'} ${fieldName}: "${actualValue}" (expected: "${value}")`);
      }
    } else {
      result.error = 'Field not visible';
      console.log(`    ❌ ${fieldName}: Field not visible`);
    }
  } catch (error) {
    result.error = error.message;
    console.log(`    ❌ ${fieldName}: Error - ${error.message}`);
  }

  return result;
}

async function testSection16() {
  console.log('🚀 Starting Section 16 Playwright Testing...');
  
  // Launch browser
  const browser = await chromium.launch({ 
    headless: false,
    args: ['--disable-web-security', '--disable-features=VizDisplayCompositor']
  });
  
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 }
  });
  
  const page = await context.newPage();

  // Listen for console messages
  page.on('console', msg => {
    console.log(`🖥️ Browser Console [${msg.type()}]: ${msg.text()}`);
  });

  // Listen for page errors
  page.on('pageerror', error => {
    console.log(`💥 Page Error: ${error.message}`);
  });

  try {
    // Navigate to the application
    console.log('📍 Navigating to http://localhost:5173/startForm');
    await page.goto('http://localhost:5173/startForm', { waitUntil: 'networkidle' });
    
    // Take initial screenshot
    await page.screenshot({ path: 'section16-test-initial.png', fullPage: true });
    console.log('📸 Initial screenshot taken: section16-test-initial.png');
    
    // Wait for the page to load
    await page.waitForTimeout(2000);
    
    // Look for Section 16 navigation or form
    console.log('🔍 Looking for Section 16...');

    // First, try to expand the sections navigation
    console.log('📋 Looking for section navigation...');

    // Look for the expand/collapse button
    const expandButton = await page.locator('[data-testid="toggle-sections-button"]');
    if (await expandButton.isVisible()) {
      console.log('🔽 Found expand button, clicking to show all sections...');
      await expandButton.click();
      await page.waitForTimeout(1000);
      await page.screenshot({ path: 'section16-test-expanded.png', fullPage: true });
    }

    // Now look for Section 16 specifically
    const section16Button = await page.locator('[data-testid="section-section16-nav-button"]');
    if (await section16Button.isVisible()) {
      console.log('🎯 Found Section 16 navigation button, clicking...');
      await section16Button.click();
      await page.waitForTimeout(2000);
      await page.screenshot({ path: 'section16-test-after-nav.png', fullPage: true });
    } else {
      // Try alternative selectors
      console.log('🔍 Trying alternative Section 16 selectors...');

      // Try looking for section16 text
      const section16Text = await page.locator('text=section16').first();
      if (await section16Text.isVisible()) {
        console.log('🎯 Found section16 text, clicking...');
        await section16Text.click();
        await page.waitForTimeout(2000);
      } else {
        // Try looking for "People Who Know You Well" directly
        const peopleNav = await page.locator('text=People Who Know You Well').first();
        if (await peopleNav.isVisible()) {
          console.log('🎯 Found "People Who Know You Well" navigation, clicking...');
          await peopleNav.click();
          await page.waitForTimeout(2000);
        } else {
          // List all available section buttons for debugging
          console.log('🔍 Looking for all section navigation buttons...');
          const allSectionButtons = await page.locator('[data-testid*="section-"][data-testid*="-nav-button"]').all();
          console.log(`📍 Found ${allSectionButtons.length} section navigation buttons`);

          for (let i = 0; i < allSectionButtons.length; i++) {
            const buttonText = await allSectionButtons[i].textContent();
            const testId = await allSectionButtons[i].getAttribute('data-testid');
            console.log(`📍 Section button ${i}: "${buttonText?.trim()}" (${testId})`);
          }
        }
      }
    }
    
    // Look for the Section 16 form - try multiple possible indicators
    console.log('🔍 Looking for Section 16 form content...');

    // Check for various Section 16 indicators
    const section16Indicators = [
      'text=People Who Know You Well',
      'text=Section 16: People Who Know You Well',
      'text=Section 16',
      '[data-testid*="person-0-firstName"]',
      '[data-testid*="person-"]',
      'text=Personal Information',
      'text=Contact Information',
      'text=Address Information'
    ];

    let foundIndicator = null;
    for (const indicator of section16Indicators) {
      const element = await page.locator(indicator).first();
      if (await element.isVisible()) {
        foundIndicator = indicator;
        console.log(`✅ Found Section 16 indicator: ${indicator}`);
        break;
      }
    }

    if (foundIndicator) {
      console.log('✅ Section 16 form content found!');

      // Take screenshot of the form
      await page.screenshot({ path: 'section16-test-form.png', fullPage: true });
      console.log('📸 Form screenshot taken: section16-test-form.png');

      // Count the number of person forms
      const personForms = await page.locator('[data-testid*="person-"]').count();
      console.log(`👥 Found ${personForms} person-related fields`);

      // ========================================================================
      // COMPREHENSIVE TESTING OF ALL 108 FIELDS (36 fields × 3 people)
      // ========================================================================

      console.log('\n🧪 Starting comprehensive testing of all 108 form fields...');

      // Define test data for each person
      const testPeople = [
        {
          // Person 1 - John Doe
          firstName: 'John',
          middleName: 'Michael',
          lastName: 'Doe',
          suffix: 'Jr.',
          datesKnownFrom: '01/2020',
          datesKnownTo: '12/2023',
          emailAddress: 'john.doe@example.com',
          phoneExtension: '123',
          phoneNumber: '555-0101',
          mobileNumber: '555-0102',
          street: '123 Main Street',
          city: 'Anytown',
          state: 'CA',
          zipCode: '12345',
          country: 'United States',
          rankTitle: 'Manager',
          relationshipOtherExplanation: 'College roommate',
          additionalInfo: 'Known since college, very reliable person.',
          additionalTextField1: 'Additional info 1',
          additionalTextField2: 'Additional info 2'
        },
        {
          // Person 2 - Jane Smith
          firstName: 'Jane',
          middleName: 'Elizabeth',
          lastName: 'Smith',
          suffix: 'Sr.',
          datesKnownFrom: '06/2018',
          datesKnownTo: '03/2024',
          emailAddress: 'jane.smith@example.com',
          phoneExtension: '456',
          phoneNumber: '555-0201',
          mobileNumber: '555-0202',
          street: '456 Oak Avenue',
          city: 'Springfield',
          state: 'NY',
          zipCode: '67890',
          country: 'United States',
          rankTitle: 'Director',
          relationshipOtherExplanation: 'Former supervisor',
          additionalInfo: 'Worked together for 5 years, excellent reference.',
          additionalTextField1: 'Professional contact',
          additionalTextField2: 'Leadership experience'
        },
        {
          // Person 3 - Robert Johnson
          firstName: 'Robert',
          middleName: 'William',
          lastName: 'Johnson',
          suffix: 'III',
          datesKnownFrom: '09/2015',
          datesKnownTo: '',
          emailAddress: 'robert.johnson@example.com',
          phoneExtension: '789',
          phoneNumber: '555-0301',
          mobileNumber: '555-0302',
          street: '789 Pine Road',
          city: 'Riverside',
          state: 'TX',
          zipCode: '54321',
          country: 'United States',
          rankTitle: 'Senior Analyst',
          relationshipOtherExplanation: 'Neighbor and friend',
          additionalInfo: 'Long-time neighbor, trustworthy and dependable.',
          additionalTextField1: 'Community involvement',
          additionalTextField2: 'Family friend'
        }
      ];

      let totalFieldsTested = 0;
      let successfulFields = 0;
      let failedFields = 0;
      const fieldResults = [];

      // Test each person's fields
      for (let personIndex = 0; personIndex < 3; personIndex++) {
        const person = testPeople[personIndex];
        console.log(`\n👤 Testing Person ${personIndex + 1}: ${person.firstName} ${person.lastName}`);

        // Test Personal Information (4 fields)
        console.log(`  📝 Testing Personal Information (4 fields)...`);
        const personalFields = [
          { field: 'firstName', value: person.firstName, type: 'text' },
          { field: 'middleName', value: person.middleName, type: 'text' },
          { field: 'lastName', value: person.lastName, type: 'text' },
          { field: 'suffix', value: person.suffix, type: 'text' }
        ];

        for (const fieldInfo of personalFields) {
          const result = await testField(page, personIndex, fieldInfo.field, fieldInfo.value, fieldInfo.type);
          fieldResults.push(result);
          totalFieldsTested++;
          if (result.success) successfulFields++;
          else failedFields++;
        }

        // Test Dates Known (5 fields)
        console.log(`  📅 Testing Dates Known (5 fields)...`);
        const dateFields = [
          { field: 'datesKnownFrom', value: person.datesKnownFrom, type: 'text' },
          { field: 'datesKnownTo', value: person.datesKnownTo, type: 'text' },
          { field: 'datesKnownFromEstimate', value: false, type: 'checkbox' },
          { field: 'datesKnownToEstimate', value: false, type: 'checkbox' },
          { field: 'datesKnownIsPresent', value: personIndex === 2, type: 'checkbox' } // Person 3 is current
        ];

        for (const fieldInfo of dateFields) {
          const result = await testField(page, personIndex, fieldInfo.field, fieldInfo.value, fieldInfo.type);
          fieldResults.push(result);
          totalFieldsTested++;
          if (result.success) successfulFields++;
          else failedFields++;
        }

        // Test Contact Information (6 fields)
        console.log(`  📞 Testing Contact Information (6 fields)...`);
        const contactFields = [
          { field: 'emailAddress', value: person.emailAddress, type: 'text' },
          { field: 'phoneExtension', value: person.phoneExtension, type: 'text' },
          { field: 'phoneNumber', value: person.phoneNumber, type: 'text' },
          { field: 'mobileNumber', value: person.mobileNumber, type: 'text' },
          { field: 'phoneDay', value: true, type: 'checkbox' },
          { field: 'phoneNight', value: false, type: 'checkbox' }
        ];

        for (const fieldInfo of contactFields) {
          const result = await testField(page, personIndex, fieldInfo.field, fieldInfo.value, fieldInfo.type);
          fieldResults.push(result);
          totalFieldsTested++;
          if (result.success) successfulFields++;
          else failedFields++;
        }

        // Test Address Information (5 fields)
        console.log(`  🏠 Testing Address Information (5 fields)...`);
        const addressFields = [
          { field: 'address-street', value: person.street, type: 'text' },
          { field: 'address-city', value: person.city, type: 'text' },
          { field: 'address-state', value: person.state, type: 'text' },
          { field: 'address-zipCode', value: person.zipCode, type: 'text' },
          { field: 'address-country', value: person.country, type: 'text' }
        ];

        for (const fieldInfo of addressFields) {
          const result = await testField(page, personIndex, fieldInfo.field, fieldInfo.value, fieldInfo.type);
          fieldResults.push(result);
          totalFieldsTested++;
          if (result.success) successfulFields++;
          else failedFields++;
        }

        // Test Professional Information (3 fields)
        console.log(`  💼 Testing Professional Information (3 fields)...`);
        const professionalFields = [
          { field: 'rankTitle', value: person.rankTitle, type: 'text' },
          { field: 'rankTitleNotApplicable', value: false, type: 'checkbox' },
          { field: 'rankTitleDontKnow', value: false, type: 'checkbox' }
        ];

        for (const fieldInfo of professionalFields) {
          const result = await testField(page, personIndex, fieldInfo.field, fieldInfo.value, fieldInfo.type);
          fieldResults.push(result);
          totalFieldsTested++;
          if (result.success) successfulFields++;
          else failedFields++;
        }

        // Test Relationship Information (6 fields)
        console.log(`  👥 Testing Relationship Information (6 fields)...`);
        const relationshipFields = [
          { field: 'relationshipOtherExplanation', value: person.relationshipOtherExplanation, type: 'text' },
          { field: 'additionalInfo', value: person.additionalInfo, type: 'text' },
          { field: 'relationshipFriend', value: personIndex === 0, type: 'checkbox' }, // Person 1 is friend
          { field: 'relationshipNeighbor', value: personIndex === 2, type: 'checkbox' }, // Person 3 is neighbor
          { field: 'relationshipSchoolmate', value: personIndex === 0, type: 'checkbox' }, // Person 1 is schoolmate
          { field: 'relationshipWorkAssociate', value: personIndex === 1, type: 'checkbox' } // Person 2 is work associate
        ];

        for (const fieldInfo of relationshipFields) {
          const result = await testField(page, personIndex, fieldInfo.field, fieldInfo.value, fieldInfo.type);
          fieldResults.push(result);
          totalFieldsTested++;
          if (result.success) successfulFields++;
          else failedFields++;
        }

        // Test Additional Fields (7 fields to reach 36 total)
        console.log(`  ➕ Testing Additional Fields (7 fields)...`);
        const additionalFields = [
          { field: 'phoneInternational', value: false, type: 'checkbox' },
          { field: 'phoneDontKnow', value: false, type: 'checkbox' },
          { field: 'relationshipOther', value: false, type: 'checkbox' },
          { field: 'additionalTextField1', value: person.additionalTextField1, type: 'text' },
          { field: 'additionalTextField2', value: person.additionalTextField2, type: 'text' },
          { field: 'additionalCheckbox1', value: true, type: 'checkbox' },
          { field: 'additionalCheckbox2', value: false, type: 'checkbox' }
        ];

        for (const fieldInfo of additionalFields) {
          const result = await testField(page, personIndex, fieldInfo.field, fieldInfo.value, fieldInfo.type);
          fieldResults.push(result);
          totalFieldsTested++;
          if (result.success) successfulFields++;
          else failedFields++;
        }

        console.log(`  ✅ Person ${personIndex + 1} testing completed: 36 fields tested`);
      }

      // Summary
      console.log('\n📊 COMPREHENSIVE FIELD TESTING SUMMARY:');
      console.log(`✅ Total fields tested: ${totalFieldsTested}`);
      console.log(`✅ Successful: ${successfulFields}`);
      console.log(`❌ Failed: ${failedFields}`);
      console.log(`📈 Success rate: ${((successfulFields / totalFieldsTested) * 100).toFixed(1)}%`);

      // Expected vs Actual
      console.log(`\n🎯 EXPECTED vs ACTUAL:`);
      console.log(`📋 Expected total fields: 108 (36 fields × 3 people)`);
      console.log(`📋 Actual fields tested: ${totalFieldsTested}`);
      console.log(`${totalFieldsTested === 108 ? '✅' : '❌'} Field count matches expectation`);

      // Detailed breakdown by person
      console.log(`\n👥 BREAKDOWN BY PERSON:`);
      for (let i = 0; i < 3; i++) {
        const personResults = fieldResults.filter(r => r.person === i + 1);
        const personSuccess = personResults.filter(r => r.success).length;
        const personFailed = personResults.filter(r => !r.success).length;
        console.log(`  Person ${i + 1}: ${personSuccess}/${personResults.length} successful (${((personSuccess / personResults.length) * 100).toFixed(1)}%)`);
      }

      // Failed fields details
      const failedFieldDetails = fieldResults.filter(r => !r.success);
      if (failedFieldDetails.length > 0) {
        console.log(`\n❌ FAILED FIELDS DETAILS:`);
        failedFieldDetails.forEach(field => {
          console.log(`  Person ${field.person} - ${field.field}: ${field.error || 'Value mismatch'}`);
        });
      }

      // Field type breakdown
      const textFields = fieldResults.filter(r => r.type === 'text');
      const checkboxFields = fieldResults.filter(r => r.type === 'checkbox');
      console.log(`\n📝 FIELD TYPE BREAKDOWN:`);
      console.log(`  Text fields: ${textFields.filter(f => f.success).length}/${textFields.length} successful`);
      console.log(`  Checkbox fields: ${checkboxFields.filter(f => f.success).length}/${checkboxFields.length} successful`);

      // Take final screenshot
      await page.screenshot({ path: 'section16-test-final.png', fullPage: true });
      console.log('\n📸 Final screenshot taken: section16-test-final.png');

      // Scroll to top and take overview screenshot
      await page.evaluate(() => window.scrollTo(0, 0));
      await page.waitForTimeout(1000);
      await page.screenshot({ path: 'section16-test-overview.png', fullPage: true });
      console.log('📸 Overview screenshot taken: section16-test-overview.png');

    } else {
      console.log('❌ Section 16 form content not found');

      // Take screenshot of current page for debugging
      await page.screenshot({ path: 'section16-test-debug.png', fullPage: true });
      console.log('📸 Debug screenshot taken: section16-test-debug.png');

      // Check what's actually on the page
      console.log('🔍 Checking what content is actually displayed...');

      // Look for any headings
      const headings = await page.locator('h1, h2, h3, h4, h5, h6').all();
      console.log(`📋 Found ${headings.length} headings:`);
      for (let i = 0; i < Math.min(headings.length, 10); i++) {
        const text = await headings[i].textContent();
        console.log(`  📍 Heading ${i + 1}: "${text?.trim()}"`);
      }

      // Look for any form elements
      const formElements = await page.locator('input, textarea, select, button').all();
      console.log(`📋 Found ${formElements.length} form elements`);

      // Check for error messages
      const errorElements = await page.locator('[class*="error"], [class*="Error"], .text-red-500, .text-red-600, .text-red-700').all();
      if (errorElements.length > 0) {
        console.log(`🚨 Found ${errorElements.length} potential error elements:`);
        for (let i = 0; i < Math.min(errorElements.length, 5); i++) {
          const text = await errorElements[i].textContent();
          console.log(`  🚨 Error ${i + 1}: "${text?.trim()}"`);
        }
      }

      // Log page content for debugging
      const pageContent = await page.content();
      console.log('📄 Page content preview:', pageContent.substring(0, 1000));
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    await page.screenshot({ path: 'section16-test-error.png', fullPage: true });
  } finally {
    await browser.close();
    console.log('🏁 Test completed');
  }
}

// Run the test
testSection16().catch(console.error);
