/**
 * Scalable Architecture Test Fixtures
 * 
 * Custom Playwright fixtures that provide testing utilities for the scalable
 * SF-86 form architecture including SF86FormContext, section integration,
 * and cross-section functionality.
 */

import { test as base, Page } from '@playwright/test';

// ============================================================================
// TEST UTILITIES CLASSES
// ============================================================================

/**
 * SF86FormContext test utilities
 */
export class SF86FormContextTestUtils {
  constructor(private page: Page) {}

  async navigateToTestPage() {
    await this.page.goto('/test/sf86-form-context');
    await this.page.waitForSelector('[data-testid="sf86-form-context-test"]', { timeout: 10000 });
  }

  async clearFormData() {
    await this.page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
  }

  async getGlobalFormState() {
    const formData = await this.page.locator('[data-testid="global-form-data"]').textContent();
    return JSON.parse(formData || '{}');
  }

  async getCompletedSections() {
    const completed = await this.page.locator('[data-testid="completed-sections"]').textContent();
    return JSON.parse(completed || '[]');
  }

  async markSectionComplete(sectionId: string) {
    await this.page.click(`[data-testid="mark-${sectionId}-complete"]`);
  }

  async markSectionIncomplete(sectionId: string) {
    await this.page.click(`[data-testid="mark-${sectionId}-incomplete"]`);
  }

  async triggerGlobalValidation() {
    await this.page.click('[data-testid="trigger-global-validation"]');
    const result = await this.page.locator('[data-testid="global-validation-result"]').textContent();
    return JSON.parse(result || '{}');
  }

  async saveForm() {
    await this.page.click('[data-testid="save-form"]');
  }

  async loadFormData(data: any) {
    await this.page.evaluate((formData) => {
      localStorage.setItem('sf86-form-data', JSON.stringify(formData));
    }, data);
  }

  async enableAutoSave() {
    await this.page.click('[data-testid="enable-auto-save"]');
  }

  async disableAutoSave() {
    await this.page.click('[data-testid="disable-auto-save"]');
  }

  async getLastSavedTime() {
    const lastSaved = await this.page.locator('[data-testid="last-saved"]').textContent();
    return lastSaved === 'null' ? null : new Date(lastSaved || '');
  }

  async navigateToSection(sectionId: string) {
    await this.page.click(`[data-testid="navigate-to-${sectionId}"]`);
  }

  async getNextIncompleteSection() {
    await this.page.click('[data-testid="get-next-incomplete"]');
    return await this.page.locator('[data-testid="next-incomplete-section"]').textContent();
  }
}

/**
 * Section Integration test utilities
 */
export class SectionIntegrationTestUtils {
  constructor(private page: Page) {}

  async navigateToTestPage() {
    await this.page.goto('/test/section-integration');
    await this.page.waitForSelector('[data-testid="section-integration-test"]', { timeout: 10000 });
  }

  async setupEventListener(sectionId: string, eventType: string) {
    await this.page.click(`[data-testid="${sectionId}-setup-${eventType}-listener"]`);
  }

  async emitEvent(sectionId: string, eventType: string, payload?: any) {
    if (payload) {
      await this.page.evaluate(({ section, type, data }) => {
        window.emitTestEvent(section, type, data);
      }, { section: sectionId, type: eventType, data: payload });
    } else {
      await this.page.click(`[data-testid="${sectionId}-emit-${eventType}"]`);
    }
  }

  async getReceivedEvents(sectionId: string, eventType?: string) {
    const selector = eventType 
      ? `[data-testid="${sectionId}-${eventType}-events"]`
      : `[data-testid="${sectionId}-received-events"]`;
    
    const events = await this.page.locator(selector).textContent();
    return events ? events.split(',').filter(e => e.trim()) : [];
  }

  async updateSectionData(sectionId: string, data: any) {
    await this.page.evaluate(({ section, sectionData }) => {
      window.updateSectionData(section, sectionData);
    }, { section: sectionId, sectionData: data });
  }

  async getSectionData(sectionId: string) {
    const data = await this.page.locator(`[data-testid="${sectionId}-data"]`).textContent();
    return JSON.parse(data || '{}');
  }

  async getCentralSectionData(sectionId: string) {
    const data = await this.page.locator(`[data-testid="central-${sectionId}-data"]`).textContent();
    return JSON.parse(data || '{}');
  }

  async validateSectionIntegration(sectionId: string) {
    await this.page.click(`[data-testid="${sectionId}-validate-integration"]`);
    const result = await this.page.locator(`[data-testid="${sectionId}-integration-result"]`).textContent();
    return JSON.parse(result || '{}');
  }

  async testBidirectionalSync(sectionId: string) {
    // Test section -> central sync
    await this.updateSectionData(sectionId, { test: 'section-to-central' });
    const centralData = await this.getCentralSectionData(sectionId);
    
    // Test central -> section sync
    await this.page.evaluate(({ section }) => {
      window.updateCentralSectionData(section, { test: 'central-to-section' });
    }, { section: sectionId });
    const sectionData = await this.getSectionData(sectionId);
    
    return {
      sectionToCentral: centralData.test === 'section-to-central',
      centralToSection: sectionData.test === 'central-to-section'
    };
  }
}

/**
 * Cross-Section functionality test utilities
 */
export class CrossSectionTestUtils {
  constructor(private page: Page) {}

  async navigateToTestPage() {
    await this.page.goto('/test/cross-section');
    await this.page.waitForSelector('[data-testid="cross-section-test"]', { timeout: 10000 });
  }

  async setupDependencyChain(dependencies: Array<{ from: string; to: string; condition?: string }>) {
    await this.page.evaluate((deps) => {
      window.setupDependencyChain(deps);
    }, dependencies);
  }

  async checkDependencies(sectionId: string) {
    await this.page.click(`[data-testid="check-${sectionId}-dependencies"]`);
    const deps = await this.page.locator(`[data-testid="${sectionId}-dependencies"]`).textContent();
    return JSON.parse(deps || '[]');
  }

  async resolveDependencies(sectionId: string) {
    await this.page.click(`[data-testid="resolve-${sectionId}-dependencies"]`);
  }

  async validateCrossSectionConsistency() {
    await this.page.click('[data-testid="validate-cross-section-consistency"]');
    const result = await this.page.locator('[data-testid="cross-section-validation"]').textContent();
    return JSON.parse(result || '{}');
  }

  async setupEventCascade(cascade: Array<{ from: string; to: string; event: string }>) {
    await this.page.evaluate((cascadeConfig) => {
      window.setupEventCascade(cascadeConfig);
    }, cascade);
  }

  async triggerEventCascade(initialEvent: string, fromSection: string) {
    await this.page.evaluate(({ event, section }) => {
      window.triggerEventCascade(event, section);
    }, { event: initialEvent, section: fromSection });
  }

  async getEventCascadeResults() {
    const results = await this.page.locator('[data-testid="event-cascade-results"]').textContent();
    return JSON.parse(results || '{}');
  }

  async loadAllSections() {
    await this.page.click('[data-testid="load-all-sections"]');
    await this.page.waitForSelector('[data-testid="all-sections-loaded"]', { timeout: 10000 });
  }

  async testAllSectionsResponsive() {
    await this.page.click('[data-testid="test-all-sections-responsive"]');
    const responsive = await this.page.locator('[data-testid="all-sections-responsive"]').textContent();
    return responsive === 'true';
  }

  async performMemoryIntensiveOperations() {
    await this.page.click('[data-testid="perform-memory-intensive-operations"]');
  }

  async checkMemoryLeaks() {
    const memoryCheck = await this.page.evaluate(() => {
      return window.checkMemoryLeaks ? window.checkMemoryLeaks() : { hasLeaks: false };
    });
    return memoryCheck;
  }

  async getCurrentSection() {
    return await this.page.locator('[data-testid="current-section"]').textContent();
  }

  async navigateToSection(sectionId: string) {
    await this.page.click(`[data-testid="navigate-to-${sectionId}"]`);
  }

  async navigateNext() {
    await this.page.click('[data-testid="navigate-next"]');
  }

  async navigatePrevious() {
    await this.page.click('[data-testid="navigate-previous"]');
  }

  async navigateNextIncomplete() {
    await this.page.click('[data-testid="navigate-next-incomplete"]');
  }

  async completeAndContinue() {
    await this.page.click('[data-testid="complete-and-continue"]');
  }
}

// ============================================================================
// FIXTURE DEFINITIONS
// ============================================================================

type ScalableArchitectureFixtures = {
  sf86FormUtils: SF86FormContextTestUtils;
  sectionIntegrationUtils: SectionIntegrationTestUtils;
  crossSectionUtils: CrossSectionTestUtils;
  scalableArchitecturePage: Page;
};

/**
 * Extended test with scalable architecture fixtures
 */
export const test = base.extend<ScalableArchitectureFixtures>({
  /**
   * SF86FormContext test utilities fixture
   */
  sf86FormUtils: async ({ page }, use) => {
    const utils = new SF86FormContextTestUtils(page);
    await use(utils);
  },

  /**
   * Section Integration test utilities fixture
   */
  sectionIntegrationUtils: async ({ page }, use) => {
    const utils = new SectionIntegrationTestUtils(page);
    await use(utils);
  },

  /**
   * Cross-Section test utilities fixture
   */
  crossSectionUtils: async ({ page }, use) => {
    const utils = new CrossSectionTestUtils(page);
    await use(utils);
  },

  /**
   * Pre-configured page for scalable architecture testing
   */
  scalableArchitecturePage: async ({ page }, use) => {
    // Navigate to the main test page
    await page.goto('/test/scalable-architecture');
    await page.waitForSelector('[data-testid="scalable-architecture-test"]', { timeout: 10000 });
    
    // Ensure the page is fully loaded
    await page.waitForLoadState('networkidle');
    
    // Clear any existing data
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
    
    // Initialize test environment
    await page.evaluate(() => {
      window.initializeTestEnvironment();
    });
    
    await use(page);
  },
});

/**
 * Export expect from Playwright for convenience
 */
export { expect } from '@playwright/test';

// ============================================================================
// TEST DATA CONSTANTS
// ============================================================================

export const SCALABLE_ARCHITECTURE_TEST_DATA = {
  // Sample form data for testing
  SAMPLE_FORM_DATA: {
    personalInfo: {
      firstName: 'John',
      lastName: 'Doe',
      ssn: '123-45-6789'
    },
    section29: {
      _id: 29,
      terrorismOrganizations: {
        hasAssociation: { value: 'NO' },
        entries: []
      }
    }
  },

  // Sample section data for integration testing
  SAMPLE_SECTION_DATA: {
    section7: {
      _id: 7,
      residenceHistory: {
        hasHistory: { value: 'YES' },
        entries: [{
          address: { street: { value: '123 Test St' } },
          dateRange: { from: { date: { value: '2020-01-01' } } }
        }]
      }
    },
    section13: {
      _id: 13,
      employmentActivities: {
        hasActivities: { value: 'YES' },
        entries: [{
          employer: { value: 'Test Company' },
          position: { value: 'Test Position' }
        }]
      }
    }
  },

  // Event types for testing
  EVENT_TYPES: {
    SECTION_UPDATE: 'SECTION_UPDATE',
    DATA_SYNC: 'DATA_SYNC',
    NAVIGATION_REQUEST: 'NAVIGATION_REQUEST',
    VALIDATION_REQUEST: 'VALIDATION_REQUEST',
    DEPENDENCY_RESOLVED: 'DEPENDENCY_RESOLVED'
  },

  // Dependency configurations for testing
  DEPENDENCY_CONFIGS: {
    SIMPLE_CHAIN: [
      { from: 'section7', to: 'section8', condition: 'residence_complete' },
      { from: 'section8', to: 'section9', condition: 'passport_complete' }
    ],
    COMPLEX_WEB: [
      { from: 'section29', to: 'section30', condition: 'terrorism_associations' },
      { from: 'section13', to: 'section15', condition: 'employment_history' },
      { from: 'section15', to: 'section30', condition: 'military_service' }
    ]
  },

  // Performance test configurations
  PERFORMANCE_CONFIGS: {
    RAPID_UPDATES: {
      count: 100,
      interval: 10,
      timeout: 3000
    },
    MEMORY_INTENSIVE: {
      sectionCount: 30,
      entriesPerSection: 50,
      fieldsPerEntry: 20
    }
  },

  // Validation test scenarios
  VALIDATION_SCENARIOS: {
    CROSS_SECTION_CONFLICTS: {
      section13: { employmentStart: '2020-01-01', employmentEnd: '2021-01-01' },
      section15: { militaryStart: '2020-06-01', militaryEnd: '2020-12-01' }
    },
    MISSING_DEPENDENCIES: {
      section30: { requiresTerrorismData: true },
      section29: { terrorismData: null }
    }
  }
};

// ============================================================================
// SELECTORS FOR SCALABLE ARCHITECTURE TESTING
// ============================================================================

export const SCALABLE_ARCHITECTURE_SELECTORS = {
  // SF86FormContext selectors
  SF86_FORM_CONTEXT: '[data-testid="sf86-form-context-test"]',
  GLOBAL_FORM_DATA: '[data-testid="global-form-data"]',
  GLOBAL_IS_DIRTY: '[data-testid="global-is-dirty"]',
  GLOBAL_IS_VALID: '[data-testid="global-is-valid"]',
  COMPLETED_SECTIONS: '[data-testid="completed-sections"]',
  ACTIVE_SECTIONS: '[data-testid="active-sections"]',
  REGISTERED_SECTIONS: '[data-testid="registered-sections"]',
  
  // Section Integration selectors
  SECTION_INTEGRATION: '[data-testid="section-integration-test"]',
  SYNC_EVENTS: '[data-testid="sync-events"]',
  INTEGRATION_EVENTS: '[data-testid="integration-events"]',
  
  // Cross-Section selectors
  CROSS_SECTION: '[data-testid="cross-section-test"]',
  CURRENT_SECTION: '[data-testid="current-section"]',
  DEPENDENCY_WARNING: '[data-testid="dependency-warning"]',
  CROSS_SECTION_VALIDATION: '[data-testid="cross-section-validation"]',
  EVENT_CASCADE_RESULTS: '[data-testid="event-cascade-results"]',
  
  // Performance selectors
  ALL_SECTIONS_LOADED: '[data-testid="all-sections-loaded"]',
  ALL_SECTIONS_RESPONSIVE: '[data-testid="all-sections-responsive"]',
  MEMORY_USAGE: '[data-testid="memory-usage"]',
  
  // Error handling selectors
  INTEGRATION_ERROR: '[data-testid="integration-error"]',
  COMMUNICATION_ERROR: '[data-testid="communication-error"]',
  VALIDATION_ERROR: '[data-testid="validation-error"]',
  DEPENDENCY_ERROR: '[data-testid="dependency-error"]'
};
