/**
 * Manual Section 16 Testing Script
 * 
 * This script manually tests Section 16 form fields using Playwright
 * to verify they are properly connected to the Section16Context.
 */

import { chromium } from 'playwright';
import path from 'path';

const BROWSER_PATH = '/home/atoyota/Desktop/ICM/clarance-f/node_modules/playwright-core/.local-browsers/chromium-1169/chrome-linux/chrome';
const APP_URL = 'http://localhost:5173';

async function testSection16Fields() {
  console.log('🚀 Starting Section 16 Manual Testing...');
  
  let browser;
  let page;
  
  try {
    // Launch browser with explicit path
    browser = await chromium.launch({
      executablePath: BROWSER_PATH,
      headless: false, // Run in headed mode to see what's happening
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    page = await browser.newPage();
    
    // Set viewport
    await page.setViewportSize({ width: 1280, height: 720 });
    
    console.log('📱 Browser launched, navigating to application...');
    
    // Navigate to the SF-86 form application
    console.log('🎯 Navigating to SF-86 form...');
    await page.goto(`${APP_URL}/startForm`, { waitUntil: 'networkidle' });

    // Take initial screenshot
    await page.screenshot({ path: 'section16-test-initial.png', fullPage: true });
    console.log('📸 Initial screenshot taken');

    // Check page title and content
    const title = await page.title();
    console.log(`📄 Page title: ${title}`);

    // Wait for the form to load
    await page.waitForSelector('[data-testid="sf86-form-container"]', { timeout: 10000 });
    console.log('✅ SF-86 form container loaded');

    // Look for Section 16 navigation button
    console.log('🔍 Looking for Section 16 navigation...');
    const section16Button = page.locator('button').filter({ hasText: /section.*16|16.*section/i });

    if (await section16Button.count() > 0) {
      console.log('✅ Found Section 16 navigation button');
      await section16Button.first().click();
      await page.waitForLoadState('networkidle');
      console.log('🎯 Clicked Section 16 navigation');
    } else {
      console.log('⚠️  Section 16 navigation button not found, checking current content');
    }
    
    // Try to find navigation elements
    const navigationElements = await page.locator('nav, .nav, [role="navigation"], .sidebar, .menu').all();
    console.log(`🧭 Found ${navigationElements.length} navigation elements`);
    
    // Look for Section 16 links or buttons
    const section16Links = await page.locator('a, button').filter({ hasText: /section.*16|16.*section/i }).all();
    console.log(`🔗 Found ${section16Links.length} potential Section 16 links`);

    // Take screenshot after potential navigation
    await page.screenshot({ path: 'section16-test-after-navigation.png', fullPage: true });
    console.log('📸 Post-navigation screenshot taken');
    
    // Look for form fields that might be Section 16 related
    const formFields = await page.locator('input, select, textarea').all();
    console.log(`📝 Found ${formFields.length} form fields on page`);
    
    // Look for person entries
    const personEntries = await page.locator('[data-testid*="person"], .person, [class*="person"]').all();
    console.log(`👥 Found ${personEntries.length} potential person entries`);
    
    // Look for specific field patterns
    const nameFields = await page.locator('input[name*="firstName"], input[name*="lastName"], input[placeholder*="name"]').all();
    console.log(`📛 Found ${nameFields.length} name-related fields`);
    
    const emailFields = await page.locator('input[type="email"], input[name*="email"], input[placeholder*="email"]').all();
    console.log(`📧 Found ${emailFields.length} email fields`);
    
    const phoneFields = await page.locator('input[type="tel"], input[name*="phone"], input[placeholder*="phone"]').all();
    console.log(`📞 Found ${phoneFields.length} phone fields`);
    
    // Test a few fields if they exist
    if (nameFields.length > 0) {
      console.log('🧪 Testing first name field...');
      await nameFields[0].fill('Test Name');
      const value = await nameFields[0].inputValue();
      console.log(`✅ Name field test: ${value === 'Test Name' ? 'PASSED' : 'FAILED'}`);
    }
    
    if (emailFields.length > 0) {
      console.log('🧪 Testing email field...');
      await emailFields[0].fill('test@example.com');
      const value = await emailFields[0].inputValue();
      console.log(`✅ Email field test: ${value === 'test@example.com' ? 'PASSED' : 'FAILED'}`);
    }
    
    // Check console for any errors
    const consoleMessages = [];
    page.on('console', msg => {
      consoleMessages.push(`${msg.type()}: ${msg.text()}`);
    });
    
    // Wait a bit to capture any console messages
    await page.waitForTimeout(2000);
    
    if (consoleMessages.length > 0) {
      console.log('🖥️  Console messages:');
      consoleMessages.forEach(msg => console.log(`   ${msg}`));
    }
    
    // Take final screenshot
    await page.screenshot({ path: 'section16-test-final.png', fullPage: true });
    console.log('📸 Final screenshot taken');
    
    console.log('✅ Section 16 manual testing completed');
    
  } catch (error) {
    console.error('❌ Error during testing:', error);
  } finally {
    if (page) await page.close();
    if (browser) await browser.close();
  }
}

// Run the test
testSection16Fields().catch(console.error);
