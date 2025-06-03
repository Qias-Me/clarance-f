import { test, expect } from '@playwright/test';

test.describe('Section 13 Persistence Tests', () => {
  test('should persist employment flag and entries correctly', async ({ page }) => {
    // Navigate to Section 13
    await page.goto('http://localhost:3000/startForm/section13');
    
    // Wait for the page to load
    await page.waitForSelector('h2:has-text("Section 13: Employment Activities")');
    
    // Enable debug mode for logging
    await page.locator('text=Enable debug mode').click();
    
    // Select "Yes" for employment history
    await page.locator('label:has-text("Yes")').first().click();
    
    // Wait for the employment entries section to appear
    await page.waitForSelector('text=Employment History');
    
    // Should have one entry by default
    await expect(page.locator('.border.rounded-lg')).toHaveCount(1);
    
    // Click the entry to expand it
    await page.locator('.border.rounded-lg').first().click();
    
    // Fill out some basic employment information
    await page.locator('input[placeholder="MM/YYYY"]').first().fill('01/2020');
    await page.locator('input[placeholder="MM/YYYY"]').nth(1).fill('12/2021');
    
    await page.locator('input[placeholder="Employer Name"]').fill('Test Company');
    await page.locator('input[placeholder="Position Title"]').fill('Software Engineer');
    
    // Fill supervisor info
    await page.locator('input[placeholder="Supervisor Name"]').fill('Test Supervisor');
    await page.locator('input[placeholder="Supervisor Phone"]').fill('123-456-7890');
    
    // Fill address info
    await page.locator('input[placeholder="Street Address"]').fill('123 Test St');
    await page.locator('input[placeholder="City"]').fill('Test City');
    
    // Add another entry to test multiple entries
    await page.locator('button:has-text("Add Employment Entry")').click();
    
    // Validate that we now have two entries
    await expect(page.locator('.border.rounded-lg')).toHaveCount(2);
    
    // Navigate away and then back to test persistence
    await page.goto('http://localhost:3000/startForm');
    await page.goto('http://localhost:3000/startForm/section13');
    
    // Wait for the page to reload
    await page.waitForSelector('h2:has-text("Section 13: Employment Activities")');
    
    // Verify that data persisted
    await expect(page.locator('input:checked')).toHaveCount(1); // Yes radio button
    await expect(page.locator('.border.rounded-lg')).toHaveCount(2); // Two entries
    
    // Click first entry to expand
    await page.locator('.border.rounded-lg').first().click();
    
    // Verify specific field values
    await expect(page.locator('input[placeholder="MM/YYYY"]').first()).toHaveValue('01/2020');
    await expect(page.locator('input[placeholder="MM/YYYY"]').nth(1)).toHaveValue('12/2021');
    await expect(page.locator('input[placeholder="Employer Name"]')).toHaveValue('Test Company');
    await expect(page.locator('input[placeholder="Position Title"]')).toHaveValue('Software Engineer');
  });

  test('should investigate field IDs and console logs for Section 13', async ({ page }) => {
    // Enable console logging to capture debugging info
    page.on('console', msg => {
      console.log(`[BROWSER ${msg.type().toUpperCase()}]:`, msg.text());
    });

    page.on('pageerror', error => {
      console.error(`[BROWSER ERROR]:`, error.message);
    });

    // Navigate to Section 13 on the correct port
    await page.goto('http://localhost:5174/startForm/section13');
    
    // Wait for the page to load
    await page.waitForSelector('h2:has-text("Section 13: Employment Activities")', { timeout: 10000 });
    
    console.log('✅ Page loaded successfully');

    // Enable debug mode for logging
    const debugToggle = page.locator('text=Enable debug mode');
    if (await debugToggle.isVisible()) {
      await debugToggle.click();
      console.log('✅ Debug mode enabled');
    }

    // Check what radio buttons are actually present
    const radioButtons = await page.locator('input[type="radio"]').all();
    console.log(`Found ${radioButtons.length} radio buttons on the page`);

    for (let i = 0; i < radioButtons.length; i++) {
      const radio = radioButtons[i];
      const name = await radio.getAttribute('name');
      const value = await radio.getAttribute('value');
      const checked = await radio.isChecked();
      console.log(`Radio ${i}: name="${name}", value="${value}", checked=${checked}`);
    }

    // Check for employment-related labels/text
    const employmentLabels = await page.locator('text*="employment"').all();
    console.log(`Found ${employmentLabels.length} employment-related text elements`);

    for (let i = 0; i < employmentLabels.length; i++) {
      const text = await employmentLabels[i].textContent();
      console.log(`Employment text ${i}: "${text}"`);
    }

    // Try to find the main employment question
    const hasEmploymentRadio = page.locator('input[name="hasEmployment"]');
    if (await hasEmploymentRadio.first().isVisible()) {
      console.log('✅ Found hasEmployment radio buttons');
      
      // Try selecting "Yes"
      await page.locator('label:has-text("Yes")').first().click();
      console.log('✅ Clicked "Yes" for employment');
      
      // Wait a bit and check console for field updates
      await page.waitForTimeout(1000);
      
    } else {
      console.log('❌ No hasEmployment radio buttons found');
    }

    // Check if there are any text inputs visible
    const textInputs = await page.locator('input[type="text"]').all();
    console.log(`Found ${textInputs.length} text inputs on the page`);

    for (let i = 0; i < Math.min(textInputs.length, 5); i++) {
      const input = textInputs[i];
      const placeholder = await input.getAttribute('placeholder');
      const value = await input.inputValue();
      console.log(`Text input ${i}: placeholder="${placeholder}", value="${value}"`);
    }

    // Check for any employment entries section
    const entriesSection = page.locator('text=Employment History');
    if (await entriesSection.isVisible()) {
      console.log('✅ Found Employment History section');
    } else {
      console.log('❌ No Employment History section found');
    }

    // Check for entry cards
    const entryCards = await page.locator('.border.rounded-lg').all();
    console.log(`Found ${entryCards.length} entry cards`);

    // Take a screenshot for debugging
    await page.screenshot({ path: 'section13-debug.png', fullPage: true });
    console.log('✅ Screenshot saved as section13-debug.png');

    // Check network requests that might be failing
    page.on('requestfailed', request => {
      console.error(`[NETWORK FAILED]: ${request.method()} ${request.url()} - ${request.failure()?.errorText}`);
    });

    // Wait for any pending operations
    await page.waitForTimeout(2000);
    
    console.log('✅ Section 13 investigation complete');
  });

  test('should test actual field updates with console monitoring', async ({ page }) => {
    // Enable console logging
    page.on('console', msg => {
      console.log(`[BROWSER ${msg.type().toUpperCase()}]:`, msg.text());
    });

    // Navigate to Section 13
    await page.goto('http://localhost:5174/startForm/section13');
    
    // Wait for the page to load
    await page.waitForSelector('h2:has-text("Section 13: Employment Activities")');
    
    // Enable debug mode
    const debugToggle = page.locator('text=Enable debug mode');
    if (await debugToggle.isVisible()) {
      await debugToggle.click();
    }

    // Try to interact with the first radio button we can find
    const firstRadio = page.locator('input[type="radio"]').first();
    if (await firstRadio.isVisible()) {
      console.log('Clicking first radio button...');
      await firstRadio.click();
      
      // Wait and monitor console output
      await page.waitForTimeout(2000);
    }

    // Try to fill a text field
    const firstTextInput = page.locator('input[type="text"]').first();
    if (await firstTextInput.isVisible()) {
      console.log('Filling first text input...');
      await firstTextInput.fill('Test Value');
      
      // Wait and monitor console output  
      await page.waitForTimeout(2000);
    }

    // Check if any validation errors appear
    const errorElements = await page.locator('.text-red-500, .text-red-600, .text-red-700, .text-red-800').all();
    console.log(`Found ${errorElements.length} error elements`);

    for (let i = 0; i < errorElements.length; i++) {
      const errorText = await errorElements[i].textContent();
      console.log(`Error ${i}: "${errorText}"`);
    }
  });
}); 