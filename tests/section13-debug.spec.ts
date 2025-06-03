import { test, expect } from '@playwright/test';

test.describe('Section 13 Debug Test', () => {
  test('should investigate Section 13 field IDs and form behavior', async ({ page }) => {
    // Enable console logging to capture debugging info
    page.on('console', msg => {
      console.log(`[BROWSER ${msg.type().toUpperCase()}]:`, msg.text());
    });

    page.on('pageerror', error => {
      console.error(`[BROWSER ERROR]:`, error.message);
    });

    // Navigate to Section 13 on the correct port
    console.log('🚀 Navigating to Section 13...');
    await page.goto('http://localhost:5174/startForm/section13');
    
    // Wait for the page to load
    try {
      await page.waitForSelector('h2:has-text("Section 13")', { timeout: 10000 });
      console.log('✅ Page loaded successfully');
    } catch (error) {
      console.log('❌ Could not find Section 13 heading, checking for any h2...');
      const headings = await page.locator('h2').all();
      for (let i = 0; i < headings.length; i++) {
        const text = await headings[i].textContent();
        console.log(`H2 ${i}: "${text}"`);
      }
    }

    // Take a screenshot to see current state
    await page.screenshot({ path: 'section13-initial.png', fullPage: true });
    console.log('📸 Initial screenshot saved');

    // Check for debug toggle
    const debugToggle = page.locator('text=Enable debug mode');
    if (await debugToggle.isVisible()) {
      await debugToggle.click();
      console.log('✅ Debug mode enabled');
      await page.waitForTimeout(1000);
    } else {
      console.log('❌ No debug toggle found');
    }

    // Check all form inputs on the page
    const allInputs = await page.locator('input').all();
    console.log(`🔍 Found ${allInputs.length} total input elements`);

    for (let i = 0; i < Math.min(allInputs.length, 10); i++) {
      const input = allInputs[i];
      const type = await input.getAttribute('type');
      const name = await input.getAttribute('name');
      const id = await input.getAttribute('id');
      const placeholder = await input.getAttribute('placeholder');
      console.log(`Input ${i}: type="${type}", name="${name}", id="${id}", placeholder="${placeholder}"`);
    }

    // Check for radio buttons specifically
    const radioButtons = await page.locator('input[type="radio"]').all();
    console.log(`📻 Found ${radioButtons.length} radio buttons`);

    for (let i = 0; i < radioButtons.length; i++) {
      const radio = radioButtons[i];
      const name = await radio.getAttribute('name');
      const value = await radio.getAttribute('value');
      const checked = await radio.isChecked();
      console.log(`Radio ${i}: name="${name}", value="${value}", checked=${checked}`);
    }

    // Check for text inputs
    const textInputs = await page.locator('input[type="text"]').all();
    console.log(`📝 Found ${textInputs.length} text inputs`);

    for (let i = 0; i < Math.min(textInputs.length, 5); i++) {
      const input = textInputs[i];
      const name = await input.getAttribute('name');
      const placeholder = await input.getAttribute('placeholder');
      const value = await input.inputValue();
      console.log(`Text input ${i}: name="${name}", placeholder="${placeholder}", value="${value}"`);
    }

    // Try to interact with the first available form element
    if (radioButtons.length > 0) {
      console.log('🎯 Attempting to click first radio button...');
      await radioButtons[0].click();
      await page.waitForTimeout(2000);
      console.log('✅ Radio button clicked');
    }

    if (textInputs.length > 0) {
      console.log('✏️ Attempting to fill first text input...');
      await textInputs[0].fill('Test Value');
      await page.waitForTimeout(2000);
      console.log('✅ Text input filled');
    }

    // Check for any employment-related text
    const pageText = await page.textContent('body');
    if (pageText && pageText.toLowerCase().includes('employment')) {
      console.log('✅ Page contains employment-related content');
    } else {
      console.log('❌ No employment-related content found');
    }

    // Final screenshot
    await page.screenshot({ path: 'section13-final.png', fullPage: true });
    console.log('📸 Final screenshot saved');

    console.log('🎉 Section 13 debug test complete');
  });
}); 