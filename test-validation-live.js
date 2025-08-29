/**
 * Live test for Section 1 validation fix
 */

import { chromium } from 'playwright';

async function testValidationLive() {
  console.log('🧪 Testing Section 1 Validation Live\n');
  console.log('=' .repeat(50));
  
  const browser = await chromium.launch({
    headless: false,
    devtools: true
  });
  
  const context = await browser.newContext();
  const page = await context.newPage();
  
  // Capture console logs
  page.on('console', msg => {
    const text = msg.text();
    if (text.includes('Validation') || text.includes('isValid')) {
      console.log('📊 Console:', text);
    }
  });
  
  try {
    // Navigate to form
    console.log('📍 Navigating to form...');
    await page.goto('http://localhost:5174/startForm', {
      waitUntil: 'networkidle'
    });
    console.log('✅ Form loaded\n');
    
    await page.waitForSelector('[data-testid="centralized-sf86-form"]', { timeout: 10000 });
    
    // Get button reference
    const continueBtn = page.locator('button:has-text("Continue")').first();
    
    // Check initial state
    console.log('🔍 Initial State:');
    let isDisabled = await continueBtn.isDisabled();
    console.log(`  Continue button: ${isDisabled ? '❌ DISABLED' : '✅ ENABLED'}\n`);
    
    // Fill last name only
    console.log('📝 Step 1: Filling ONLY Last Name...');
    await page.fill('input[id="lastName"]', 'TestLastName');
    await page.waitForTimeout(500);
    
    isDisabled = await continueBtn.isDisabled();
    console.log(`  Button state: ${isDisabled ? '❌ DISABLED (correct - need both names)' : '⚠️ ENABLED (wrong - missing first name)'}\n`);
    
    // Fill first name
    console.log('📝 Step 2: Adding First Name...');
    await page.fill('input[id="firstName"]', 'TestFirstName');
    await page.waitForTimeout(500);
    
    isDisabled = await continueBtn.isDisabled();
    console.log(`  Button state: ${isDisabled ? '❌ DISABLED (PROBLEM!)' : '✅ ENABLED (correct!)'}\n`);
    
    if (!isDisabled) {
      console.log('✅ SUCCESS! Button is now enabled with both required fields.');
      
      // Try clicking Continue
      console.log('🖱️ Attempting to click Continue...');
      await continueBtn.click();
      await page.waitForTimeout(2000);
      
      // Check if we navigated
      const currentUrl = page.url();
      const sectionText = await page.locator('h2').first().textContent();
      console.log(`📍 After click:
    URL: ${currentUrl}
    Section: ${sectionText}\n`);
      
      if (sectionText?.includes('Section 2')) {
        console.log('🎉 PERFECT! Successfully navigated to Section 2!');
      }
    } else {
      console.log('❌ ISSUE REMAINS: Button still disabled with both names filled.');
      
      // Debug info
      const lastName = await page.inputValue('input[id="lastName"]');
      const firstName = await page.inputValue('input[id="firstName"]');
      console.log(`\n🔍 Debug Info:
    Last Name: "${lastName}"
    First Name: "${firstName}"`);
    }
    
    // Screenshot
    await page.screenshot({ path: 'validation-test-live.png' });
    console.log('\n📸 Screenshot saved: validation-test-live.png');
    
  } catch (error) {
    console.error('💥 Error:', error.message);
  }
  
  console.log('\n' + '=' .repeat(50));
  console.log('Test complete. Browser will remain open for inspection.');
  console.log('Press Ctrl+C to close.');
  
  // Keep browser open
  await new Promise(() => {});
}

testValidationLive().catch(console.error);