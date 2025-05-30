import { test as base, Page } from '@playwright/test';
import { Section29TestUtils } from '../utils/section29-test-utils';

/**
 * Section29 Test Fixtures
 * 
 * Custom Playwright fixtures that provide Section29-specific testing utilities
 * and setup for comprehensive integration testing.
 */

// Define the types for our fixtures
type Section29Fixtures = {
  section29Utils: Section29TestUtils;
  section29Page: Page;
};

/**
 * Extended test with Section29 fixtures
 */
export const test = base.extend<Section29Fixtures>({
  /**
   * Section29 test utilities fixture
   * Provides a pre-configured Section29TestUtils instance
   */
  section29Utils: async ({ page }, use) => {
    const utils = new Section29TestUtils(page);
    await use(utils);
  },

  /**
   * Section29 page fixture
   * Provides a page that's already navigated to the Section29 test environment
   */
  section29Page: async ({ page }, use) => {
    // Navigate to the test page and wait for it to load
    await page.goto('/test');
    await page.waitForSelector('[data-testid="section29-test-page"]', { timeout: 10000 });
    
    // Ensure the page is fully loaded and interactive
    await page.waitForLoadState('networkidle');
    
    // Clear any existing data to start with a clean state
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
    
    // Reload to ensure clean state
    await page.reload();
    await page.waitForSelector('[data-testid="section29-test-page"]', { timeout: 10000 });
    
    await use(page);
  },
});

/**
 * Export expect from Playwright for convenience
 */
export { expect } from '@playwright/test';

/**
 * Test data constants for Section29 testing
 */
export const SECTION29_TEST_DATA = {
  // Sample organization data
  SAMPLE_ORGANIZATION: {
    name: 'Test Terrorism Organization',
    street: '123 Test Street',
    city: 'Test City',
    state: 'CA',
    zipCode: '12345',
    country: 'United States'
  },
  
  // Sample activity data
  SAMPLE_ACTIVITY: {
    description: 'Test terrorism activity description for comprehensive testing of the form fields and validation.'
  },
  
  // Expected field ID patterns from PDF analysis
  EXPECTED_FIELD_PATTERNS: {
    terrorismOrganizations: {
      hasAssociation: 'form1[0].Section29[0].RadioButtonList[0]',
      entry1: {
        organizationName: 'form1[0].Section29[0].TextField11[1]',
        street: 'form1[0].Section29[0].#area[1].TextField11[0]',
        city: 'form1[0].Section29[0].#area[1].TextField11[1]',
        fromDate: 'form1[0].Section29[0].From_Datefield_Name_2[0]'
      },
      entry2: {
        organizationName: 'form1[0].Section29[0].TextField11[8]',
        street: 'form1[0].Section29[0].#area[3].TextField11[0]',
        city: 'form1[0].Section29[0].#area[3].TextField11[1]',
        fromDate: 'form1[0].Section29[0].From_Datefield_Name_2[2]'
      }
    },
    terrorismActivities: {
      hasActivity: 'form1[0].Section29_2[0].RadioButtonList[0]',
      entry1: {
        activityDescription: 'form1[0].Section29_2[0].TextField11[0]'
      }
    }
  },
  
  // Test scenarios for comprehensive coverage
  TEST_SCENARIOS: {
    BASIC_FORM_INTERACTION: {
      name: 'Basic Form Interaction',
      description: 'Test basic yes/no interactions and entry management'
    },
    FIELD_ID_VALIDATION: {
      name: 'Field ID Validation',
      description: 'Validate that generated field IDs match PDF patterns'
    },
    ADVANCED_ENTRY_MANAGEMENT: {
      name: 'Advanced Entry Management',
      description: 'Test move, duplicate, clear, and bulk update operations'
    },
    ERROR_HANDLING: {
      name: 'Error Handling',
      description: 'Test error conditions and boundary cases'
    },
    INTEGRATION_TESTING: {
      name: 'Integration Testing',
      description: 'Test ApplicantFormValues integration and data persistence'
    }
  }
};

/**
 * Common test selectors for Section29 testing
 */
export const SECTION29_SELECTORS = {
  // Page elements
  TEST_PAGE: '[data-testid="section29-test-page"]',
  BASIC_FORM: '[data-testid="section29-basic-form"]',
  ADVANCED_FEATURES: '[data-testid="section29-advanced-features"]',
  INTEGRATION: '[data-testid="section29-integration"]',
  FIELD_ID_VALIDATION: '[data-testid="section29-field-id-validation"]',
  
  // Navigation
  BASIC_TAB: '[data-testid="basic-test-tab"]',
  ADVANCED_TAB: '[data-testid="advanced-features-tab"]',
  INTEGRATION_TAB: '[data-testid="integration-tab"]',
  FIELD_ID_TAB: '[data-testid="field-id-tab"]',
  
  // Form status
  FORM_STATUS: '[data-testid="form-status"]',
  IS_DIRTY: '[data-testid="is-dirty"]',
  ERROR_COUNT: '[data-testid="error-count"]',
  VALIDATE_BUTTON: '[data-testid="validate-button"]',
  
  // Terrorism Organizations
  TERRORISM_ORGS: '[data-testid="terrorism-organizations"]',
  TERRORISM_ORGS_YES: '[data-testid="terrorism-orgs-yes"]',
  TERRORISM_ORGS_NO: '[data-testid="terrorism-orgs-no"]',
  TERRORISM_ORGS_ENTRIES: '[data-testid="terrorism-orgs-entries"]',
  ADD_TERRORISM_ORG: '[data-testid="add-terrorism-org-button"]',
  TERRORISM_ORGS_COUNT: '[data-testid="terrorism-orgs-count"]',
  
  // Terrorism Activities
  TERRORISM_ACTIVITIES: '[data-testid="terrorism-activities"]',
  TERRORISM_ACTIVITIES_YES: '[data-testid="terrorism-activities-yes"]',
  TERRORISM_ACTIVITIES_NO: '[data-testid="terrorism-activities-no"]',
  TERRORISM_ACTIVITIES_ENTRIES: '[data-testid="terrorism-activities-entries"]',
  ADD_TERRORISM_ACTIVITY: '[data-testid="add-terrorism-activity-button"]',
  TERRORISM_ACTIVITIES_COUNT: '[data-testid="terrorism-activities-count"]',
  
  // Test results
  TEST_RESULTS: '[data-testid="test-results"]',
  ADVANCED_TEST_RESULTS: '[data-testid="advanced-test-results"]',
  ERROR_TEST_RESULTS: '[data-testid="error-test-results"]',
  INTEGRATION_TEST_RESULTS: '[data-testid="integration-test-results"]',
  FIELD_ID_TEST_RESULTS: '[data-testid="field-id-test-results"]',
  
  // Test controls
  TEST_ADVANCED_FEATURES: '[data-testid="test-advanced-features-button"]',
  TEST_ERROR_CONDITIONS: '[data-testid="test-error-conditions-button"]',
  TEST_DATA_PERSISTENCE: '[data-testid="test-data-persistence-button"]',
  TEST_FORM_RESET: '[data-testid="test-form-reset-button"]',
  VALIDATE_FIELD_IDS: '[data-testid="validate-field-ids-button"]'
};

/**
 * Helper function to generate entry selectors
 */
export function getEntrySelector(subsection: string, entryIndex: number, field?: string): string {
  const baseSelector = `[data-testid="${subsection.replace('Organizations', '-org').replace('Activities', '-activity')}-entry-${entryIndex}"]`;
  if (field) {
    return `[data-testid="${subsection.replace('Organizations', '-org').replace('Activities', '-activity')}-${field}-${entryIndex}"]`;
  }
  return baseSelector;
}

/**
 * Helper function to generate result selectors
 */
export function getResultSelector(testKey: string, resultType: 'result' | 'error' | 'integration' | 'field-id' = 'result'): string {
  return `[data-testid="${resultType}-${testKey}"]`;
}
