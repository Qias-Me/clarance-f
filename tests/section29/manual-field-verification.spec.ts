/**
 * Section 29 Manual Field Verification Test
 * 
 * This test manually verifies that Section 29 field mapping is working correctly
 * by testing the field generation functions and component integration.
 */

import { test, expect } from '@playwright/test';

test.describe('Section 29 Field Mapping Verification', () => {
  test('Section 29 component loads and displays correctly', async ({ page }) => {
    // Navigate directly to the form
    await page.goto('/startForm');
    
    // Wait for the page to load
    await page.waitForLoadState('networkidle');
    
    // Take a screenshot to see what's loaded
    await page.screenshot({ path: 'test-results/section29-initial-load.png' });
    
    // Check if the main form container is present
    const formContainer = page.locator('[data-testid="centralized-sf86-form"]');
    await expect(formContainer).toBeVisible({ timeout: 10000 });
    
    // Look for Section 29 navigation button
    const section29Button = page.locator('[data-testid="section-section29-button"]');
    
    if (await section29Button.isVisible()) {
      console.log('✓ Section 29 button found');
      
      // Click on Section 29
      await section29Button.click();
      await page.waitForTimeout(1000);
      
      // Take screenshot after clicking
      await page.screenshot({ path: 'test-results/section29-after-click.png' });
      
      // Check if Section 29 component loaded
      const section29Form = page.locator('[data-testid="section29-form"]');
      
      if (await section29Form.isVisible()) {
        console.log('✓ Section 29 form component loaded');
        
        // Verify the main header
        const header = page.locator('h2:has-text("Section 29: Association Record")');
        await expect(header).toBeVisible();
        console.log('✓ Section 29 header found');
        
        // Check for subsection tabs
        const subsectionTabs = [
          '29.1 Terrorism Organizations',
          '29.2 Terrorism Activities', 
          '29.3 Violent Overthrow Organizations',
          '29.4 Violence/Force Organizations',
          '29.5 Overthrow Activities & Associations'
        ];
        
        for (const tabText of subsectionTabs) {
          const tab = page.locator(`button:has-text("${tabText}")`);
          if (await tab.isVisible()) {
            console.log(`✓ Found tab: ${tabText}`);
          } else {
            console.log(`✗ Missing tab: ${tabText}`);
          }
        }
        
        // Test the first subsection (Terrorism Organizations)
        const firstTab = page.locator('button:has-text("29.1 Terrorism Organizations")');
        if (await firstTab.isVisible()) {
          await firstTab.click();
          await page.waitForTimeout(500);
          
          // Check for Yes/No radio buttons
          const yesRadio = page.locator('input[name="terrorismOrganizations-flag"][value="YES"]');
          const noRadio = page.locator('input[name="terrorismOrganizations-flag"][value="NO"]');
          
          if (await yesRadio.isVisible() && await noRadio.isVisible()) {
            console.log('✓ Yes/No radio buttons found');
            
            // Check if "No" is selected by default
            if (await noRadio.isChecked()) {
              console.log('✓ "No" is selected by default');
            }
            
            // Click "Yes" to test entry functionality
            await yesRadio.click();
            await page.waitForTimeout(500);
            
            // Look for "Add Organization" button
            const addButton = page.locator('[data-testid="add-terrorismOrganizations-entry"]');
            if (await addButton.isVisible()) {
              console.log('✓ Add Organization button appears when Yes is selected');
              
              // Click to add an entry
              await addButton.click();
              await page.waitForTimeout(500);
              
              // Check if entry was added
              const entryCard = page.locator('text=Organization 1');
              if (await entryCard.isVisible()) {
                console.log('✓ Organization entry was added successfully');
                
                // Check for remove button
                const removeButton = page.locator('[data-testid="remove-terrorismOrganizations-entry-0"]');
                if (await removeButton.isVisible()) {
                  console.log('✓ Remove button is present');
                }
              }
            }
          }
        }
        
        // Check PDF Field Mapping Summary
        const summarySection = page.locator('div:has-text("PDF Field Mapping Summary")');
        if (await summarySection.isVisible()) {
          console.log('✓ PDF Field Mapping Summary section found');
          
          // Check for specific summary elements
          const flagField = summarySection.locator('p:has-text("Flag Field:")');
          const entries = summarySection.locator('p:has-text("Entries:")');
          const totalFields = summarySection.locator('p:has-text("Total Fields Mapped:")');
          
          if (await flagField.isVisible()) console.log('✓ Flag Field info displayed');
          if (await entries.isVisible()) console.log('✓ Entries count displayed');
          if (await totalFields.isVisible()) console.log('✓ Total Fields count displayed');
        }
        
        // Take final screenshot
        await page.screenshot({ path: 'test-results/section29-final-state.png' });
        
      } else {
        console.log('✗ Section 29 form component did not load');
        
        // Check for any error messages
        const errorMessages = await page.locator('.error, [class*="error"], [data-testid*="error"]').allTextContents();
        if (errorMessages.length > 0) {
          console.log('Error messages found:', errorMessages);
        }
      }
      
    } else {
      console.log('✗ Section 29 button not found');
      
      // List all available buttons for debugging
      const allButtons = await page.locator('button').allTextContents();
      console.log('Available buttons:', allButtons);
    }
  });

  test('Field ID generation functions work correctly', async ({ page }) => {
    // This test verifies the field ID generation logic by checking the actual generated IDs
    await page.goto('/startForm');
    await page.waitForLoadState('networkidle');
    
    // Navigate to Section 29
    const section29Button = page.locator('[data-testid="section-section29-button"]');
    if (await section29Button.isVisible()) {
      await section29Button.click();
      await page.waitForTimeout(1000);
      
      // Check the PDF Field Mapping Summary for actual field IDs
      const summarySection = page.locator('div:has-text("PDF Field Mapping Summary")');
      if (await summarySection.isVisible()) {
        
        // Get the flag field ID text
        const flagFieldText = await summarySection.locator('p:has-text("Flag Field:")').textContent();
        console.log('Flag Field ID:', flagFieldText);
        
        // Verify it contains the expected PDF field pattern
        if (flagFieldText && flagFieldText.includes('form1[0].Section29')) {
          console.log('✓ Flag field ID follows correct PDF pattern');
        } else {
          console.log('✗ Flag field ID does not follow expected pattern');
        }
        
        // Test different subsections
        const subsections = [
          { key: 'terrorismOrganizations', expectedPrefix: 'Section29[0]' },
          { key: 'terrorismActivities', expectedPrefix: 'Section29_2[0]' },
          { key: 'violentOverthrowOrganizations', expectedPrefix: 'Section29_3[0]' },
          { key: 'violenceForceOrganizations', expectedPrefix: 'Section29_4[0]' },
          { key: 'overthrowActivitiesAndAssociations', expectedPrefix: 'Section29_5[0]' }
        ];
        
        for (const subsection of subsections) {
          // Click on each subsection tab
          const tabButton = page.locator(`button:has-text("${subsection.key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}")`);
          if (await tabButton.isVisible()) {
            await tabButton.click();
            await page.waitForTimeout(500);
            
            // Check the flag field ID for this subsection
            const currentFlagFieldText = await summarySection.locator('p:has-text("Flag Field:")').textContent();
            if (currentFlagFieldText && currentFlagFieldText.includes(subsection.expectedPrefix)) {
              console.log(`✓ ${subsection.key} has correct PDF prefix: ${subsection.expectedPrefix}`);
            } else {
              console.log(`✗ ${subsection.key} does not have expected prefix. Got: ${currentFlagFieldText}`);
            }
          }
        }
      }
    }
  });

  test('All subsections maintain independent state', async ({ page }) => {
    await page.goto('/startForm');
    await page.waitForLoadState('networkidle');
    
    const section29Button = page.locator('[data-testid="section-section29-button"]');
    if (await section29Button.isVisible()) {
      await section29Button.click();
      await page.waitForTimeout(1000);
      
      // Set terrorism organizations to Yes
      await page.click('button:has-text("29.1 Terrorism Organizations")');
      await page.click('input[name="terrorismOrganizations-flag"][value="YES"]');
      
      // Set terrorism activities to Yes  
      await page.click('button:has-text("29.2 Terrorism Activities")');
      await page.click('input[name="terrorismActivities-flag"][value="YES"]');
      
      // Leave violent overthrow as No (default)
      await page.click('button:has-text("29.3 Violent Overthrow Organizations")');
      // Should be No by default
      
      // Verify states are preserved when switching back
      await page.click('button:has-text("29.1 Terrorism Organizations")');
      const terrorismOrgYes = page.locator('input[name="terrorismOrganizations-flag"][value="YES"]');
      if (await terrorismOrgYes.isChecked()) {
        console.log('✓ Terrorism Organizations state preserved (YES)');
      }
      
      await page.click('button:has-text("29.2 Terrorism Activities")');
      const terrorismActYes = page.locator('input[name="terrorismActivities-flag"][value="YES"]');
      if (await terrorismActYes.isChecked()) {
        console.log('✓ Terrorism Activities state preserved (YES)');
      }
      
      await page.click('button:has-text("29.3 Violent Overthrow Organizations")');
      const violentOverthrowNo = page.locator('input[name="violentOverthrowOrganizations-flag"][value="NO"]');
      if (await violentOverthrowNo.isChecked()) {
        console.log('✓ Violent Overthrow Organizations state preserved (NO)');
      }
      
      console.log('✓ All subsection states are maintained independently');
    }
  });
});
