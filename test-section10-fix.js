import { chromium } from 'playwright';

async function testSection10Fix() {
  console.log('🚀 Starting Section 10 data persistence test...');
  
  // Launch browser
  const browser = await chromium.launch({ 
    headless: false, // Set to true for headless mode
    slowMo: 1000 // Slow down for visibility
  });
  
  const context = await browser.newContext();
  const page = await context.newPage();
  
  try {
    // Navigate to the form
    console.log('📍 Navigating to form...');
    await page.goto('http://localhost:5173/startform');
    await page.waitForLoadState('networkidle');
    
    // Navigate to Section 10
    console.log('📍 Looking for Section 10...');
    
    // Look for Section 10 navigation or button
    const section10Button = await page.locator('text=Section 10').first();
    if (await section10Button.isVisible()) {
      await section10Button.click();
      console.log('✅ Clicked Section 10 navigation');
    } else {
      // Try to find it in a different way
      console.log('🔍 Looking for Section 10 in different ways...');
      await page.locator('text=Dual').first().click();
    }
    
    await page.waitForTimeout(2000);
    
    // Check if we're on Section 10
    const section10Header = await page.locator('h2:has-text("Section 10")').first();
    if (await section10Header.isVisible()) {
      console.log('✅ Successfully navigated to Section 10');
    } else {
      console.log('❌ Could not find Section 10 header');
      return;
    }
    
    // Test dual citizenship functionality
    console.log('🧪 Testing dual citizenship functionality...');
    
    // Check the dual citizenship checkbox
    const dualCitizenshipCheckbox = await page.locator('[data-testid="dual-citizenship-flag-checkbox"]');
    if (await dualCitizenshipCheckbox.isVisible()) {
      await dualCitizenshipCheckbox.check();
      console.log('✅ Checked dual citizenship checkbox');
      
      await page.waitForTimeout(1000);
      
      // Add a dual citizenship entry
      const addButton = await page.locator('[data-testid="add-dual-citizenship-button"]');
      if (await addButton.isVisible()) {
        await addButton.click();
        console.log('✅ Clicked add dual citizenship button');
        
        await page.waitForTimeout(1000);
        
        // Fill in country field
        const countryField = await page.locator('[data-testid="citizenship-country-0"]');
        if (await countryField.isVisible()) {
          await countryField.fill('Canada');
          console.log('✅ Filled country field with "Canada"');
        }
        
        // Fill in how obtained field
        const howObtainedField = await page.locator('[data-testid="citizenship-how-obtained-0"]');
        if (await howObtainedField.isVisible()) {
          await howObtainedField.selectOption('BIRTH');
          console.log('✅ Selected "By Birth" for how obtained');
        }
        
        // Fill in date field
        const dateField = await page.locator('[data-testid="citizenship-date-obtained-0"]');
        if (await dateField.isVisible()) {
          await dateField.fill('01/01/1990');
          console.log('✅ Filled date field with "01/01/1990"');
        }
      }
    }
    
    // Test foreign passport functionality
    console.log('🧪 Testing foreign passport functionality...');
    
    const foreignPassportCheckbox = await page.locator('[data-testid="foreign-passport-flag-checkbox"]');
    if (await foreignPassportCheckbox.isVisible()) {
      await foreignPassportCheckbox.check();
      console.log('✅ Checked foreign passport checkbox');
      
      await page.waitForTimeout(1000);
      
      // Add a foreign passport entry
      const addPassportButton = await page.locator('[data-testid="add-foreign-passport-button"]');
      if (await addPassportButton.isVisible()) {
        await addPassportButton.click();
        console.log('✅ Clicked add foreign passport button');
        
        await page.waitForTimeout(1000);
        
        // Fill in passport fields
        const passportCountryField = await page.locator('[data-testid="passport-country-0"]');
        if (await passportCountryField.isVisible()) {
          await passportCountryField.fill('Canada');
          console.log('✅ Filled passport country field');
        }
        
        const passportNumberField = await page.locator('[data-testid="passport-number-0"]');
        if (await passportNumberField.isVisible()) {
          await passportNumberField.fill('AB123456');
          console.log('✅ Filled passport number field');
        }
      }
    }
    
    // Listen for console logs to see if our fix is working
    page.on('console', msg => {
      if (msg.text().includes('Section 10 data saved successfully')) {
        console.log('🎉 SUCCESS: Section 10 data persistence is working!');
      } else if (msg.text().includes('Failed to save Section 10 data')) {
        console.log('❌ ERROR: Section 10 data persistence failed!');
      }
    });
    
    // Submit the form
    console.log('📤 Submitting Section 10 form...');
    const submitButton = await page.locator('[data-testid="submit-section-button"]');
    if (await submitButton.isVisible()) {
      await submitButton.click();
      console.log('✅ Clicked submit button');
      
      // Wait for any console logs
      await page.waitForTimeout(3000);
    }
    
    console.log('✅ Test completed successfully!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await browser.close();
  }
}

// Run the test
testSection10Fix().catch(console.error);
