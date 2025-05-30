/**
 * Simple Section 29 Verification Test
 * 
 * Basic test to verify Section 29 component loads and functions correctly
 */

import { test, expect } from '@playwright/test';

test.describe('Section 29 Simple Verification', () => {
  test('Section 29 component loads and basic functionality works', async ({ page }) => {
    // Navigate to the form
    await page.goto('http://localhost:5173/startForm');
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    // Take initial screenshot
    await page.screenshot({ path: 'test-results/section29-initial.png', fullPage: true });
    
    // Look for the main form container
    const formContainer = page.locator('[data-testid="centralized-sf86-form"]');
    
    try {
      await expect(formContainer).toBeVisible({ timeout: 10000 });
      console.log('✓ Main form container found');
      
      // Look for Section 29 button
      const section29Button = page.locator('[data-testid="section-section29-button"]');
      
      if (await section29Button.isVisible()) {
        console.log('✓ Section 29 button found');
        
        // Click Section 29
        await section29Button.click();
        await page.waitForTimeout(2000);
        
        // Take screenshot after clicking
        await page.screenshot({ path: 'test-results/section29-clicked.png', fullPage: true });
        
        // Check if Section 29 form loaded
        const section29Form = page.locator('[data-testid="section29-form"]');
        
        if (await section29Form.isVisible()) {
          console.log('✓ Section 29 form component loaded successfully');
          
          // Check for main header
          const header = page.locator('h2:has-text("Section 29: Association Record")');
          await expect(header).toBeVisible();
          console.log('✓ Section 29 header found');
          
          // Check for subsection tabs
          const tabs = [
            '29.1 Terrorism Organizations',
            '29.2 Terrorism Activities',
            '29.3 Violent Overthrow Organizations',
            '29.4 Violence/Force Organizations',
            '29.5 Overthrow Activities & Associations'
          ];
          
          let tabsFound = 0;
          for (const tabText of tabs) {
            const tab = page.locator(`button:has-text("${tabText}")`);
            if (await tab.isVisible()) {
              console.log(`✓ Found tab: ${tabText}`);
              tabsFound++;
            } else {
              console.log(`✗ Missing tab: ${tabText}`);
            }
          }
          
          console.log(`Found ${tabsFound}/5 subsection tabs`);
          
          // Test first subsection functionality
          const firstTab = page.locator('button:has-text("29.1 Terrorism Organizations")');
          if (await firstTab.isVisible()) {
            await firstTab.click();
            await page.waitForTimeout(1000);
            
            // Check for Yes/No radio buttons
            const yesRadio = page.locator('input[name="terrorismOrganizations-flag"][value="YES"]');
            const noRadio = page.locator('input[name="terrorismOrganizations-flag"][value="NO"]');
            
            if (await yesRadio.isVisible() && await noRadio.isVisible()) {
              console.log('✓ Yes/No radio buttons found');
              
              // Test selecting Yes
              await yesRadio.click();
              await page.waitForTimeout(1000);
              
              // Look for Add Organization button
              const addButton = page.locator('[data-testid="add-terrorismOrganizations-entry"]');
              if (await addButton.isVisible()) {
                console.log('✓ Add Organization button appears when Yes is selected');
                
                // Test adding an entry
                await addButton.click();
                await page.waitForTimeout(1000);
                
                // Check if entry was added
                const entryCard = page.locator('text=Organization 1');
                if (await entryCard.isVisible()) {
                  console.log('✓ Organization entry added successfully');
                } else {
                  console.log('✗ Organization entry was not added');
                }
              } else {
                console.log('✗ Add Organization button not found');
              }
            } else {
              console.log('✗ Yes/No radio buttons not found');
            }
          }
          
          // Check PDF Field Mapping Summary
          const summarySection = page.locator('div:has-text("PDF Field Mapping Summary")');
          if (await summarySection.isVisible()) {
            console.log('✓ PDF Field Mapping Summary section found');
            
            // Get the flag field ID
            const flagFieldText = await summarySection.locator('p:has-text("Flag Field:")').textContent();
            console.log('Flag Field ID:', flagFieldText);
            
            if (flagFieldText && flagFieldText.includes('form1[0].Section29')) {
              console.log('✓ Flag field ID follows correct PDF pattern');
            } else {
              console.log('✗ Flag field ID does not follow expected pattern');
            }
          } else {
            console.log('✗ PDF Field Mapping Summary section not found');
          }
          
          // Take final screenshot
          await page.screenshot({ path: 'test-results/section29-final.png', fullPage: true });
          
        } else {
          console.log('✗ Section 29 form component did not load');
          
          // Check for any visible text to debug
          const pageText = await page.textContent('body');
          console.log('Page content preview:', pageText?.substring(0, 500));
        }
        
      } else {
        console.log('✗ Section 29 button not found');
        
        // List all available buttons for debugging
        const allButtons = await page.locator('button').allTextContents();
        console.log('Available buttons:', allButtons.slice(0, 10)); // Show first 10 buttons
      }
      
    } catch (error) {
      console.log('✗ Error during test:', error);
      
      // Take error screenshot
      await page.screenshot({ path: 'test-results/section29-error.png', fullPage: true });
      
      // Get page content for debugging
      const pageText = await page.textContent('body');
      console.log('Page content on error:', pageText?.substring(0, 500));
    }
  });

  test('Verify all subsections have correct field mapping patterns', async ({ page }) => {
    await page.goto('http://localhost:5173/startForm');
    await page.waitForLoadState('networkidle');
    
    // Navigate to Section 29
    const section29Button = page.locator('[data-testid="section-section29-button"]');
    
    if (await section29Button.isVisible()) {
      await section29Button.click();
      await page.waitForTimeout(2000);
      
      const section29Form = page.locator('[data-testid="section29-form"]');
      
      if (await section29Form.isVisible()) {
        // Test each subsection's field mapping
        const subsections = [
          { title: '29.1 Terrorism Organizations', expectedPrefix: 'Section29[0]' },
          { title: '29.2 Terrorism Activities', expectedPrefix: 'Section29_2[0]' },
          { title: '29.3 Violent Overthrow Organizations', expectedPrefix: 'Section29_3[0]' },
          { title: '29.4 Violence/Force Organizations', expectedPrefix: 'Section29_4[0]' },
          { title: '29.5 Overthrow Activities & Associations', expectedPrefix: 'Section29_5[0]' }
        ];
        
        for (const subsection of subsections) {
          const tab = page.locator(`button:has-text("${subsection.title}")`);
          
          if (await tab.isVisible()) {
            await tab.click();
            await page.waitForTimeout(1000);
            
            // Check the PDF Field Mapping Summary
            const summarySection = page.locator('div:has-text("PDF Field Mapping Summary")');
            if (await summarySection.isVisible()) {
              const flagFieldText = await summarySection.locator('p:has-text("Flag Field:")').textContent();
              
              if (flagFieldText && flagFieldText.includes(subsection.expectedPrefix)) {
                console.log(`✓ ${subsection.title} has correct PDF prefix: ${subsection.expectedPrefix}`);
              } else {
                console.log(`✗ ${subsection.title} incorrect PDF prefix. Expected: ${subsection.expectedPrefix}, Got: ${flagFieldText}`);
              }
            }
          }
        }
      }
    }
  });
});
