const { chromium } = require('playwright');

async function debugStartForm() {
  console.log('🔍 Starting Section 20 navigation debug...');
  
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  try {
    // Navigate to startForm
    console.log('📍 Navigating to /startForm...');
    await page.goto('http://localhost:5173/startForm');
    
    // Wait for the main form to load
    await page.waitForSelector('[data-testid="centralized-sf86-form"]', { timeout: 10000 });
    console.log('✅ Main form loaded');
    
    // Check if sections are visible by default
    const sectionsVisible = await page.evaluate(() => {
      const sections = document.querySelectorAll('[data-testid*="section-section"]');
      return Array.from(sections).map(el => ({
        testId: el.getAttribute('data-testid'),
        visible: el.offsetParent !== null,
        text: el.textContent?.trim()
      }));
    });
    
    console.log('📋 Available section buttons:', sectionsVisible);
    
    // Specifically look for Section 20 button
    const section20Button = await page.$('[data-testid="section-section20-button"]');
    if (section20Button) {
      console.log('✅ Section 20 button found');
      const isVisible = await section20Button.isVisible();
      console.log('👁️ Section 20 button visible:', isVisible);
    } else {
      console.log('❌ Section 20 button NOT found');
    }
    
    // Check if there's an expand/show all sections button
    const expandButton = await page.$('[data-testid*="expand"], [data-testid*="show"], button:has-text("Show All"), button:has-text("Expand")');
    if (expandButton) {
      console.log('🔍 Found expand button');
      await expandButton.click();
      await page.waitForTimeout(1000);
      
      // Check again for Section 20 button after expanding
      const section20ButtonAfterExpand = await page.$('[data-testid="section-section20-button"]');
      if (section20ButtonAfterExpand) {
        console.log('✅ Section 20 button found after expanding');
        const isVisible = await section20ButtonAfterExpand.isVisible();
        console.log('👁️ Section 20 button visible after expanding:', isVisible);
      }
    }
    
    // Take a screenshot for manual inspection
    await page.screenshot({ path: 'startform-debug-screenshot.png', fullPage: true });
    console.log('📸 Screenshot saved as startform-debug-screenshot.png');
    
    // Wait for manual inspection
    console.log('⏳ Keeping browser open for 30 seconds for manual inspection...');
    await page.waitForTimeout(30000);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await browser.close();
  }
}

debugStartForm();
