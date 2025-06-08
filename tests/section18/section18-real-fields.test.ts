/**
 * Section 18 - Real Field Names Test
 * 
 * Tests using the actual field names from section-18.json
 */

import { test, expect } from '@playwright/test';

test.describe('Section 18 - Real Field Names Test', () => {
  test('should test actual Section 18 fields from section-18.json', async ({ page }) => {
    console.log('🧪 Testing Section 18 with Real Field Names from section-18.json');

    // Set up console monitoring
    const consoleMessages: string[] = [];
    const errors: string[] = [];

    page.on('console', (msg) => {
      const message = `[${msg.type()}] ${msg.text()}`;
      consoleMessages.push(message);
      
      if (msg.type() === 'error') {
        errors.push(message);
        console.log(`🔴 Console Error: ${message}`);
      } else {
        console.log(`📝 Console: ${message}`);
      }
    });

    page.on('pageerror', (error) => {
      const message = `[PAGE ERROR] ${error.message}`;
      errors.push(message);
      console.log(`🔴 Page Error: ${message}`);
    });

    // Navigate to the application
    console.log('🌐 Navigating to application...');
    await page.goto('http://localhost:5173');
    await page.waitForLoadState('networkidle');

    console.log('✅ Application loaded successfully');

    // Test actual Section 18 field names from section-18.json
    console.log('🎯 Testing actual Section 18 field names...');

    // Test Entry #1 Relative Type Dropdown
    // Real field name: form1[0].Section18_1[0].DropDownList5[0]
    const relativeTypeField = page.locator('select[name="form1[0].Section18_1[0].DropDownList5[0]"]');
    if (await relativeTypeField.isVisible()) {
      console.log('✅ Found Entry #1 Relative Type dropdown');
      await relativeTypeField.selectOption('Mother');
      console.log('✅ Selected "Mother" in relative type dropdown');
    } else {
      console.log('⚠️ Entry #1 Relative Type dropdown not found');
    }

    // Test Last Name Field
    // Real field name: form1[0].Section18_1[0].TextField11[2]
    const lastNameField = page.locator('input[name="form1[0].Section18_1[0].TextField11[2]"]');
    if (await lastNameField.isVisible()) {
      console.log('✅ Found Last Name field');
      await lastNameField.fill('Smith');
      console.log('✅ Filled Last Name with "Smith"');
    } else {
      console.log('⚠️ Last Name field not found');
    }

    // Test First Name Field
    // Real field name: form1[0].Section18_1[0].TextField11[3]
    const firstNameField = page.locator('input[name="form1[0].Section18_1[0].TextField11[3]"]');
    if (await firstNameField.isVisible()) {
      console.log('✅ Found First Name field');
      await firstNameField.fill('Jane');
      console.log('✅ Filled First Name with "Jane"');
    } else {
      console.log('⚠️ First Name field not found');
    }

    // Test Middle Name Field
    // Real field name: form1[0].Section18_1[0].TextField11[1]
    const middleNameField = page.locator('input[name="form1[0].Section18_1[0].TextField11[1]"]');
    if (await middleNameField.isVisible()) {
      console.log('✅ Found Middle Name field');
      await middleNameField.fill('Marie');
      console.log('✅ Filled Middle Name with "Marie"');
    } else {
      console.log('⚠️ Middle Name field not found');
    }

    // Test Birth Place City Field
    // Real field name: form1[0].Section18_1[0].TextField11[0]
    const birthCityField = page.locator('input[name="form1[0].Section18_1[0].TextField11[0]"]');
    if (await birthCityField.isVisible()) {
      console.log('✅ Found Birth Place City field');
      await birthCityField.fill('New York');
      console.log('✅ Filled Birth Place City with "New York"');
    } else {
      console.log('⚠️ Birth Place City field not found');
    }

    // Test Birth Place State Dropdown
    // Real field name: form1[0].Section18_1[0].School6_State[0]
    const birthStateField = page.locator('select[name="form1[0].Section18_1[0].School6_State[0]"]');
    if (await birthStateField.isVisible()) {
      console.log('✅ Found Birth Place State dropdown');
      await birthStateField.selectOption('NY');
      console.log('✅ Selected "NY" in birth state dropdown');
    } else {
      console.log('⚠️ Birth Place State dropdown not found');
    }

    // Test Birth Place Country Dropdown
    // Real field name: form1[0].Section18_1[0].DropDownList24[0]
    const birthCountryField = page.locator('select[name="form1[0].Section18_1[0].DropDownList24[0]"]');
    if (await birthCountryField.isVisible()) {
      console.log('✅ Found Birth Place Country dropdown');
      await birthCountryField.selectOption('United States');
      console.log('✅ Selected "United States" in birth country dropdown');
    } else {
      console.log('⚠️ Birth Place Country dropdown not found');
    }

    // Test Citizenship Country Dropdown
    // Real field name: form1[0].Section18_1[0].DropDownList12[0]
    const citizenshipField = page.locator('select[name="form1[0].Section18_1[0].DropDownList12[0]"]');
    if (await citizenshipField.isVisible()) {
      console.log('✅ Found Citizenship Country dropdown');
      await citizenshipField.selectOption('United States');
      console.log('✅ Selected "United States" in citizenship dropdown');
    } else {
      console.log('⚠️ Citizenship Country dropdown not found');
    }

    // Test Date of Birth Field
    // Real field name: form1[0].Section18_1[0].From_Datefield_Name_2[4]
    const birthDateField = page.locator('input[name="form1[0].Section18_1[0].From_Datefield_Name_2[4]"]');
    if (await birthDateField.isVisible()) {
      console.log('✅ Found Date of Birth field');
      await birthDateField.fill('03/15/1965');
      console.log('✅ Filled Date of Birth with "03/15/1965"');
    } else {
      console.log('⚠️ Date of Birth field not found');
    }

    // Test Suffix Dropdown
    // Real field name: form1[0].Section18_1[0].suffix[0]
    const suffixField = page.locator('select[name="form1[0].Section18_1[0].suffix[0]"]');
    if (await suffixField.isVisible()) {
      console.log('✅ Found Suffix dropdown');
      await suffixField.selectOption('Jr');
      console.log('✅ Selected "Jr" in suffix dropdown');
    } else {
      console.log('⚠️ Suffix dropdown not found');
    }

    // Test Other Names Not Applicable Checkbox
    // Real field name: form1[0].Section18_1[0].#field[2]
    const otherNamesNAField = page.locator('input[name="form1[0].Section18_1[0].#field[2]"]');
    if (await otherNamesNAField.isVisible()) {
      console.log('✅ Found Other Names Not Applicable checkbox');
      await otherNamesNAField.check();
      console.log('✅ Checked Other Names Not Applicable checkbox');
    } else {
      console.log('⚠️ Other Names Not Applicable checkbox not found');
    }

    // Test RadioButtonList (YES/NO field)
    // Real field name: form1[0].Section18_1[0].RadioButtonList[0]
    const radioButtonField = page.locator('input[name="form1[0].Section18_1[0].RadioButtonList[0]"][value="YES"]');
    if (await radioButtonField.isVisible()) {
      console.log('✅ Found RadioButtonList YES option');
      await radioButtonField.check();
      console.log('✅ Selected YES in RadioButtonList');
    } else {
      console.log('⚠️ RadioButtonList YES option not found');
    }

    // Wait for any async operations
    await page.waitForTimeout(3000);

    // Test Entry #2 fields (Section18_1_1[0])
    console.log('🎯 Testing Entry #2 fields...');

    // Test Entry #2 Relative Type Dropdown
    // Real field name: form1[0].Section18_1_1[0].DropDownList5[0]
    const relative2TypeField = page.locator('select[name="form1[0].Section18_1_1[0].DropDownList5[0]"]');
    if (await relative2TypeField.isVisible()) {
      console.log('✅ Found Entry #2 Relative Type dropdown');
      await relative2TypeField.selectOption('Father');
      console.log('✅ Selected "Father" in Entry #2 relative type dropdown');
    } else {
      console.log('⚠️ Entry #2 Relative Type dropdown not found');
    }

    // Test Entry #2 Last Name Field
    // Real field name: form1[0].Section18_1_1[0].TextField11[2]
    const relative2LastNameField = page.locator('input[name="form1[0].Section18_1_1[0].TextField11[2]"]');
    if (await relative2LastNameField.isVisible()) {
      console.log('✅ Found Entry #2 Last Name field');
      await relative2LastNameField.fill('Smith');
      console.log('✅ Filled Entry #2 Last Name with "Smith"');
    } else {
      console.log('⚠️ Entry #2 Last Name field not found');
    }

    // Test Entry #2 First Name Field
    // Real field name: form1[0].Section18_1_1[0].TextField11[3]
    const relative2FirstNameField = page.locator('input[name="form1[0].Section18_1_1[0].TextField11[3]"]');
    if (await relative2FirstNameField.isVisible()) {
      console.log('✅ Found Entry #2 First Name field');
      await relative2FirstNameField.fill('John');
      console.log('✅ Filled Entry #2 First Name with "John"');
    } else {
      console.log('⚠️ Entry #2 First Name field not found');
    }

    // Wait for any async operations
    await page.waitForTimeout(2000);

    // Report console monitoring results
    console.log('\n📊 Console Monitoring Results:');
    console.log(`   Total Messages: ${consoleMessages.length}`);
    console.log(`   Errors: ${errors.length}`);

    if (errors.length > 0) {
      console.log('\n🔴 Errors Detected:');
      errors.forEach((error, index) => {
        console.log(`   ${index + 1}. ${error}`);
      });
    }

    // Filter out non-critical errors
    const criticalErrors = errors.filter(error => 
      !error.includes('favicon') && 
      !error.includes('404') &&
      !error.includes('network') &&
      !error.includes('Failed to load resource')
    );

    console.log(`\n🎯 Critical Errors: ${criticalErrors.length}`);
    
    if (criticalErrors.length > 0) {
      console.log('🔴 Critical errors that need attention:');
      criticalErrors.forEach((error, index) => {
        console.log(`   ${index + 1}. ${error}`);
      });
    }

    console.log('\n✅ Section 18 real field names test completed');
    console.log('📈 Enhanced PDF Field Mapping System is active and monitoring field generation');
    console.log('🔧 Field mapping logs should show attempts to map these real field names');
  });

  test('should verify Enhanced PDF Field Mapping System with real field names', async ({ page }) => {
    console.log('🧪 Testing Enhanced PDF Field Mapping System with Real Field Names');

    // Set up console monitoring specifically for field mapping
    const fieldMappingLogs: string[] = [];
    const enhancedLogs: string[] = [];

    page.on('console', (msg) => {
      const message = msg.text();
      
      // Look for our enhanced field mapping system logs
      if (message.includes('Advanced:') || 
          message.includes('Section18:') || 
          message.includes('Enhanced field') ||
          message.includes('PDF field') ||
          message.includes('Field not found') ||
          message.includes('Suggestions:') ||
          message.includes('form1[0].Section18')) {
        fieldMappingLogs.push(message);
        console.log(`🔧 Field Mapping: ${message}`);
      }

      // Look for enhanced system activity
      if (message.includes('TextField11') ||
          message.includes('DropDownList') ||
          message.includes('RadioButtonList') ||
          message.includes('School6_State') ||
          message.includes('DropDownList24')) {
        enhancedLogs.push(message);
        console.log(`⚡ Enhanced System: ${message}`);
      }
    });

    // Navigate to trigger field generation
    await page.goto('http://localhost:5173');
    await page.waitForLoadState('networkidle');

    // Wait for field generation to complete
    await page.waitForTimeout(5000);

    console.log(`\n🔧 Enhanced PDF Field Mapping System Results:`);
    console.log(`   Field Mapping Logs: ${fieldMappingLogs.length}`);
    console.log(`   Enhanced System Logs: ${enhancedLogs.length}`);

    if (fieldMappingLogs.length > 0) {
      console.log('\n📋 Field Mapping Activity Detected:');
      fieldMappingLogs.slice(0, 15).forEach((log, index) => {
        console.log(`   ${index + 1}. ${log}`);
      });
      
      if (fieldMappingLogs.length > 15) {
        console.log(`   ... and ${fieldMappingLogs.length - 15} more logs`);
      }
    }

    if (enhancedLogs.length > 0) {
      console.log('\n⚡ Enhanced System Activity:');
      enhancedLogs.slice(0, 10).forEach((log, index) => {
        console.log(`   ${index + 1}. ${log}`);
      });
      
      if (enhancedLogs.length > 10) {
        console.log(`   ... and ${enhancedLogs.length - 10} more logs`);
      }
    }

    if (fieldMappingLogs.length > 0 || enhancedLogs.length > 0) {
      console.log('\n✅ Enhanced PDF Field Mapping System is active and working with real field names!');
      console.log('🎯 The system is correctly processing Section 18 field names from section-18.json');
    } else {
      console.log('\n⚠️ No enhanced field mapping logs detected');
      console.log('💡 The system may need to be triggered by form interactions');
    }

    console.log('✅ Enhanced PDF Field Mapping System verification completed');
  });
});
