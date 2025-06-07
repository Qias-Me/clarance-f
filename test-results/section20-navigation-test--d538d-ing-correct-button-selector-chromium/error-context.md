# Test info

- Name: Section 20 Navigation Test >> should navigate to Section 20 using correct button selector
- Location: C:\Users\Jason\Desktop\AI-Coding\clarance-f\tests\section20-navigation-test.spec.ts:10:3

# Error details

```
TimeoutError: page.click: Timeout 30000ms exceeded.
Call log:
  - waiting for locator('[data-testid="section-section20-button"]')

    at C:\Users\Jason\Desktop\AI-Coding\clarance-f\tests\section20-navigation-test.spec.ts:20:16
```

# Page snapshot

```yaml
- banner:
  - heading "SF-86 Questionnaire for National Security Positions" [level=1]
  - text: "Form Version: 2024.1 • Updated: 6/7/2025 Environment: development Progress: 0/30"
- main:
  - img
  - heading "Form Management" [level=2]
  - paragraph: Validate, save, and generate PDFs
  - button "Validate All":
    - img
    - text: Validate All
  - button "Save Form":
    - img
    - text: Save Form
  - button "🧪 Test Data"
  - button "Server PDF":
    - img
    - text: Server PDF
  - button "Client PDF":
    - img
    - text: Client PDF
  - button "Clear Cache":
    - img
    - text: Clear Cache
  - button "Collapse":
    - img
    - text: Collapse
  - img
  - 'heading "Development Mode: Enhanced PDF Generation" [level=3]'
  - text: Server PDF Generation Processes PDF on server with comprehensive terminal logging Client PDF Generation Uses advanced field mapping with browser console logging
  - img
  - strong: "Server:"
  - text: Check terminal for detailed logs
  - img
  - strong: "Client:"
  - text: Check browser console (F12) for field mapping stats
  - img
  - heading "All SF-86 Sections" [level=3]
  - text: 30 implemented • 30 total
  - button "1 Full Name section1":
    - text: 1 Full Name section1
    - img
  - button "2 Date / Place of Birth section2":
    - text: 2 Date / Place of Birth section2
    - img
  - button "3 Place of Birth section3":
    - text: 3 Place of Birth section3
    - img
  - button "4 Social Security Number section4":
    - text: 4 Social Security Number section4
    - img
  - button "5 Residence section5":
    - text: 5 Residence section5
    - img
  - button "6 Physical Characteristics section6":
    - text: 6 Physical Characteristics section6
    - img
  - button "7 Contact Information section7":
    - text: 7 Contact Information section7
    - img
  - button "8 U.S. Passport Information section8":
    - text: 8 U.S. Passport Information section8
    - img
  - button "9 Citizenship section9":
    - text: 9 Citizenship section9
    - img
  - button "10 Dual Citizenship section10":
    - text: 10 Dual Citizenship section10
    - img
  - button "11 Where You Have Lived section11":
    - text: 11 Where You Have Lived section11
    - img
  - button "12 Where You Went to School section12":
    - text: 12 Where You Went to School section12
    - img
  - button "13 Employment Activities section13":
    - text: 13 Employment Activities section13
    - img
  - button "14 Selective Service section14":
    - text: 14 Selective Service section14
    - img
  - button "15 Military Service section15":
    - text: 15 Military Service section15
    - img
  - button "16 People Who Know You Well section16":
    - text: 16 People Who Know You Well section16
    - img
  - button "17 Marital / Relationship section17":
    - text: 17 Marital / Relationship section17
    - img
  - button "18 Relatives section18":
    - text: 18 Relatives section18
    - img
  - button "19 Foreign Contacts section19":
    - text: 19 Foreign Contacts section19
    - img
  - button "20 Foreign Activities section20":
    - text: 20 Foreign Activities section20
    - img
  - button "21 Mental Health section21":
    - text: 21 Mental Health section21
    - img
  - button "22 Police Record section22":
    - text: 22 Police Record section22
    - img
  - button "23 Illegal Use of Drugs or Drug Activity section23":
    - text: 23 Illegal Use of Drugs or Drug Activity section23
    - img
  - button "24 Use of Alcohol section24":
    - text: 24 Use of Alcohol section24
    - img
  - button "25 Investigation and Clearance Record section25":
    - text: 25 Investigation and Clearance Record section25
    - img
  - button "26 Financial Record section26":
    - text: 26 Financial Record section26
    - img
  - button "27 Information Technology Systems section27":
    - text: 27 Information Technology Systems section27
    - img
  - button "28 Involvement in Non-Criminal Court Actions section28":
    - text: 28 Involvement in Non-Criminal Court Actions section28
    - img
  - button "29 Associations section29":
    - text: 29 Associations section29
    - img
  - button "30 Continuation section30":
    - text: 30 Continuation section30
    - img
  - 'heading "Section 1: Information About You" [level=2]'
  - paragraph: Provide your full legal name as it appears on official documents.
  - text: Last Name *
  - textbox "Last Name *"
  - paragraph: Enter your last name exactly as it appears on your birth certificate or passport.
  - text: First Name *
  - textbox "First Name *"
  - paragraph: Enter your first name exactly as it appears on your birth certificate or passport.
  - text: Middle Name
  - textbox "Middle Name"
  - paragraph: Enter your middle name if you have one. Leave blank if not applicable.
  - text: Suffix
  - combobox "Suffix":
    - option "Select suffix (if applicable)" [selected]
    - option "Jr."
    - option "Sr."
    - option "II"
    - option "III"
    - option "IV"
    - option "V"
  - paragraph: Select your name suffix if applicable (Jr., Sr., II, III, etc.).
  - text: "* Required fields"
  - button "Submit & Continue"
  - button "Clear Section"
  - text: "Section Status: Ready for input Validation: Has errors"
```

# Test source

```ts
   1 | /**
   2 |  * Simple Section 20 Navigation Test
   3 |  * 
   4 |  * Tests that the updated navigation pattern works correctly for Section 20
   5 |  */
   6 |
   7 | import { test, expect } from '@playwright/test';
   8 |
   9 | test.describe('Section 20 Navigation Test', () => {
  10 |   test('should navigate to Section 20 using correct button selector', async ({ page }) => {
  11 |     // Navigate to the form
  12 |     await page.goto('http://localhost:5173/startForm');
  13 |       // Wait for the form to load
  14 |     await page.waitForSelector('[data-testid="centralized-sf86-form"]');
  15 |     
  16 |     // Expand all sections to make Section 20 visible
  17 |     await page.click('[data-testid="toggle-sections-button"]');
  18 |     
  19 |     // Navigate to Section 20
> 20 |     await page.click('[data-testid="section-section20-button"]');
     |                ^ TimeoutError: page.click: Timeout 30000ms exceeded.
  21 |     
  22 |     // Wait for Section 20 component to load
  23 |     await page.waitForSelector('[data-testid="section20-form"]');
  24 |     
  25 |     // Verify we're on Section 20
  26 |     await expect(page.locator('h1, h2, h3')).toContainText(/Section 20|Foreign Activities/i);
  27 |     
  28 |     console.log('✅ Section 20 navigation test passed');
  29 |   });
  30 | });
  31 |
```