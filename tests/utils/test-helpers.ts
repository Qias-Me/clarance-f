/**
 * Test helper utilities for Playwright tests
 */

export interface FieldCoverageResult {
  percentage: number;
  summary: string;
}

/**
 * Logs a field action with consistent formatting
 */
export async function logFieldAction(
  fieldName: string,
  value: string,
  fieldType: string,
  fieldsFilled: string[]
): Promise<void> {
  const logEntry = `${fieldName}: ${value} (${fieldType})`;
  fieldsFilled.push(logEntry);
  console.log(`✓ Filled ${logEntry}`);
}

/**
 * Calculates field coverage percentage
 */
export function calculateFieldCoverage(
  fieldsFilled: string[],
  fieldsSkipped: string[]
): FieldCoverageResult {
  const totalFields = fieldsFilled.length + fieldsSkipped.length;
  const percentage = totalFields > 0 
    ? Math.round((fieldsFilled.length / totalFields) * 100) 
    : 0;
  
  const summary = `Field Coverage: ${fieldsFilled.length}/${totalFields} fields filled (${percentage}%)`;
  
  return { percentage, summary };
}

/**
 * Waits for element and returns true if found within timeout
 */
export async function waitForElement(
  page: any,
  selector: string,
  timeout: number = 5000
): Promise<boolean> {
  try {
    await page.waitForSelector(selector, { timeout });
    return true;
  } catch {
    return false;
  }
}

/**
 * Formats date for consistent logging
 */
export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: '2-digit',
    day: '2-digit',
    year: 'numeric'
  });
}

/**
 * Takes a screenshot with timestamp
 */
export async function takeScreenshot(
  page: any,
  name: string,
  section: string
): Promise<void> {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const path = `tests/${section}/screenshots/${name}-${timestamp}.png`;
  await page.screenshot({ path, fullPage: true });
  console.log(`📸 Screenshot saved: ${path}`);
}