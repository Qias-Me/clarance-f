# Test info

- Name: Section 5 - Initial Entry Behavior >> should allow adding more entries up to 4 total
- Location: C:\Users\Jason\Desktop\AI-Coding\clarance-f\tests\section5\section5-initial-entry.test.ts:55:3

# Error details

```
Error: page.click: Test ended.
Call log:
  - waiting for locator('[data-testid="section-section5-nav-button"]')

    at C:\Users\Jason\Desktop\AI-Coding\clarance-f\tests\section5\section5-initial-entry.test.ts:19:16
```

# Test source

```ts
   1 | /**
   2 |  * Section 5 Initial Entry Test
   3 |  * 
   4 |  * Tests that Section 5 only renders 1 entry when user selects "Yes"
   5 |  * and allows adding more entries up to 4 total.
   6 |  */
   7 |
   8 | import { test, expect } from '@playwright/test';
   9 |
   10 | test.describe('Section 5 - Initial Entry Behavior', () => {
   11 |   test.beforeEach(async ({ page }) => {
   12 |     // Navigate to the form
   13 |     await page.goto('http://localhost:5174/startForm');
   14 |     
   15 |     // Wait for the page to load
   16 |     await page.waitForLoadState('networkidle');
   17 |     
   18 |     // Navigate to Section 5
>  19 |     await page.click('[data-testid="section-section5-nav-button"]');
      |                ^ Error: page.click: Test ended.
   20 |     
   21 |     // Wait for Section 5 to load
   22 |     await page.waitForSelector('[data-testid="section5-form"]');
   23 |   });
   24 |
   25 |   test('should show no entries initially', async ({ page }) => {
   26 |     // Initially, no entries should be visible
   27 |     const entries = page.locator('[data-testid^="other-name-"][data-testid$="-last-name"]');
   28 |     await expect(entries).toHaveCount(0);
   29 |     
   30 |     // Add button should not be visible when "No" is selected or nothing is selected
   31 |     const addButton = page.locator('[data-testid="add-other-name-button"]');
   32 |     await expect(addButton).not.toBeVisible();
   33 |   });
   34 |
   35 |   test('should render exactly 1 entry when user selects "Yes"', async ({ page }) => {
   36 |     // Select "Yes" for having other names
   37 |     await page.click('[data-testid="has-other-names-yes"]');
   38 |
   39 |     // Wait a moment for the state to update
   40 |     await page.waitForTimeout(100);
   41 |
   42 |     // Should show exactly 1 entry
   43 |     const entries = page.locator('[data-testid^="other-name-"][data-testid$="-last-name"]');
   44 |     await expect(entries).toHaveCount(1);
   45 |
   46 |     // Verify the entry is for index 0
   47 |     await expect(page.locator('[data-testid="other-name-0-last-name"]')).toBeVisible();
   48 |
   49 |     // Add button should be visible and show (1/4)
   50 |     const addButton = page.locator('[data-testid="add-other-name-button"]');
   51 |     await expect(addButton).toBeVisible();
   52 |     await expect(addButton).toContainText('Add Another Name (1/4)');
   53 |   });
   54 |
   55 |   test('should allow adding more entries up to 4 total', async ({ page }) => {
   56 |     // Select "Yes" for having other names
   57 |     await page.click('[data-testid="has-other-names-yes"]');
   58 |     
   59 |     // Should start with 1 entry
   60 |     let entries = page.locator('[data-testid^="other-name-"][data-testid$="-last-name"]');
   61 |     await expect(entries).toHaveCount(1);
   62 |     
   63 |     const addButton = page.locator('[data-testid="add-other-name-button"]');
   64 |     
   65 |     // Add second entry
   66 |     await addButton.click();
   67 |     entries = page.locator('[data-testid^="other-name-"][data-testid$="-last-name"]');
   68 |     await expect(entries).toHaveCount(2);
   69 |     await expect(addButton).toContainText('Add Another Name (2/4)');
   70 |     
   71 |     // Add third entry
   72 |     await addButton.click();
   73 |     entries = page.locator('[data-testid^="other-name-"][data-testid$="-last-name"]');
   74 |     await expect(entries).toHaveCount(3);
   75 |     await expect(addButton).toContainText('Add Another Name (3/4)');
   76 |     
   77 |     // Add fourth entry
   78 |     await addButton.click();
   79 |     entries = page.locator('[data-testid^="other-name-"][data-testid$="-last-name"]');
   80 |     await expect(entries).toHaveCount(4);
   81 |     await expect(addButton).toContainText('Add Another Name (4/4)');
   82 |     
   83 |     // Button should be disabled now
   84 |     await expect(addButton).toBeDisabled();
   85 |     
   86 |     // Should show maximum message
   87 |     await expect(page.locator('text=Maximum of 4 other names allowed.')).toBeVisible();
   88 |   });
   89 |
   90 |   test('should clear all entries when user selects "No"', async ({ page }) => {
   91 |     // Select "Yes" and add some entries
   92 |     await page.click('[data-testid="has-other-names-yes"]');
   93 |     
   94 |     // Add another entry
   95 |     await page.click('[data-testid="add-other-name-button"]');
   96 |     
   97 |     // Should have 2 entries
   98 |     let entries = page.locator('[data-testid^="other-name-"][data-testid$="-last-name"]');
   99 |     await expect(entries).toHaveCount(2);
  100 |     
  101 |     // Select "No"
  102 |     await page.click('[data-testid="has-other-names-no"]');
  103 |     
  104 |     // Should have no entries
  105 |     entries = page.locator('[data-testid^="other-name-"][data-testid$="-last-name"]');
  106 |     await expect(entries).toHaveCount(0);
  107 |     
  108 |     // Add button should not be visible
  109 |     const addButton = page.locator('[data-testid="add-other-name-button"]');
  110 |     await expect(addButton).not.toBeVisible();
  111 |   });
  112 |
  113 |   test('should allow removing entries', async ({ page }) => {
  114 |     // Select "Yes" for having other names
  115 |     await page.click('[data-testid="has-other-names-yes"]');
  116 |     
  117 |     // Add another entry to have 2 total
  118 |     await page.click('[data-testid="add-other-name-button"]');
  119 |     
```