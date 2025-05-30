/**
 * Authentication Setup for SF-86 Form Tests
 * 
 * This setup file handles authentication and initial state preparation
 * for all SF-86 form architecture tests.
 */

import { test as setup, expect } from '@playwright/test';
import { promises as fs } from 'fs';

const authFile = 'tests/.auth/user.json';

setup('authenticate and prepare test environment', async ({ page }) => {
  console.log('🔐 Setting up authentication and test environment...');
  
  // Navigate to the application
  await page.goto('/startForm');
  
  // Wait for the application to load
  await page.waitForLoadState('networkidle');
  
  // Check if authentication is required
  const needsAuth = await page.locator('[data-testid="login-form"]').isVisible().catch(() => false);
  
  if (needsAuth) {
    console.log('🔑 Authentication required, performing login...');
    
    // Fill in authentication credentials
    await page.fill('[data-testid="username"]', process.env.TEST_USERNAME || 'test-user');
    await page.fill('[data-testid="password"]', process.env.TEST_PASSWORD || 'test-password');
    
    // Submit login form
    await page.click('[data-testid="login-button"]');
    
    // Wait for successful authentication
    await page.waitForURL('**/startForm', { timeout: 10000 });
    
    console.log('✅ Authentication successful');
  } else {
    console.log('🔓 No authentication required');
  }
  
  // Verify SF-86 form is accessible
  await expect(page.locator('[data-testid="sf86-form-container"]')).toBeVisible({ timeout: 10000 });
  
  // Initialize test environment
  await initializeTestEnvironment(page);
  
  // Clear any existing form data to start fresh
  await clearFormData(page);
  
  // Verify form context is properly initialized
  await verifyFormContextInitialization(page);
  
  // Save authentication state
  await page.context().storageState({ path: authFile });
  
  console.log('✅ Authentication setup and environment preparation complete');
});

/**
 * Initialize test environment with necessary configurations
 */
async function initializeTestEnvironment(page: any) {
  console.log('🔧 Initializing test environment...');
  
  // Set test mode flags
  await page.evaluate(() => {
    window.__SF86_TEST_MODE__ = true;
    window.__PDF_SERVICE_MOCK__ = true;
    window.__AUTO_SAVE_DISABLED__ = true; // Disable auto-save during tests
  });
  
  // Create test configuration
  const testConfig = {
    testMode: true,
    mockPdfService: true,
    autoSaveDisabled: true,
    timestamp: new Date().toISOString()
  };
  
  // Store test configuration in localStorage
  await page.evaluate((config) => {
    localStorage.setItem('sf86-test-config', JSON.stringify(config));
  }, testConfig);
  
  console.log('✅ Test environment initialized');
}

/**
 * Clear any existing form data to ensure clean test state
 */
async function clearFormData(page: any) {
  console.log('🧹 Clearing existing form data...');
  
  await page.evaluate(() => {
    // Clear localStorage
    const keysToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (key.startsWith('sf86-') || key.startsWith('form-'))) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach(key => localStorage.removeItem(key));
    
    // Clear sessionStorage
    const sessionKeysToRemove = [];
    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i);
      if (key && (key.startsWith('sf86-') || key.startsWith('form-'))) {
        sessionKeysToRemove.push(key);
      }
    }
    sessionKeysToRemove.forEach(key => sessionStorage.removeItem(key));
    
    // Reset form state if available
    if (window.__SF86_FORM_CONTEXT__ && typeof window.__SF86_FORM_CONTEXT__.resetForm === 'function') {
      window.__SF86_FORM_CONTEXT__.resetForm();
    }
  });
  
  console.log('✅ Form data cleared');
}

/**
 * Verify that the SF86FormContext is properly initialized
 */
async function verifyFormContextInitialization(page: any) {
  console.log('🔍 Verifying form context initialization...');
  
  const contextStatus = await page.evaluate(() => {
    const context = window.__SF86_FORM_CONTEXT__;
    const formData = window.__SF86_FORM_STATE__;
    
    if (!context) {
      return { initialized: false, error: 'SF86FormContext not found' };
    }
    
    if (!formData) {
      return { initialized: false, error: 'Form state not found' };
    }
    
    // Check required context methods
    const requiredMethods = [
      'updateFieldValue',
      'validateSection',
      'generatePdf',
      'createSectionEntry',
      'updateSectionEntry',
      'deleteSectionEntry'
    ];
    
    const missingMethods = requiredMethods.filter(method => typeof context[method] !== 'function');
    
    if (missingMethods.length > 0) {
      return { initialized: false, error: `Missing methods: ${missingMethods.join(', ')}` };
    }
    
    // Check form data structure
    let sectionCount = 0;
    for (let i = 1; i <= 30; i++) {
      if (`section${i}` in formData) sectionCount++;
    }
    
    if (sectionCount < 30) {
      return { initialized: false, error: `Only ${sectionCount} sections found, expected 30` };
    }
    
    return { 
      initialized: true, 
      sectionCount,
      contextMethods: Object.keys(context).length,
      formDataKeys: Object.keys(formData).length
    };
  });
  
  if (!contextStatus.initialized) {
    throw new Error(`Form context initialization failed: ${contextStatus.error}`);
  }
  
  console.log(`✅ Form context initialized successfully:`);
  console.log(`   - Sections: ${contextStatus.sectionCount}`);
  console.log(`   - Context methods: ${contextStatus.contextMethods}`);
  console.log(`   - Form data keys: ${contextStatus.formDataKeys}`);
}

/**
 * Setup test data files for consistent testing
 */
setup('create test data files', async ({ page }) => {
  console.log('📄 Creating test data files...');
  
  // Ensure test directories exist
  await fs.mkdir('test-results', { recursive: true });
  await fs.mkdir('tests/.auth', { recursive: true });
  
  // Create sample test data
  const testData = {
    sampleSection1: {
      personalInfo: {
        lastName: { 
          id: 'form1[0].Sections1-6[0].TextField11[0]', 
          value: 'TestLastName', 
          type: 'text', 
          label: 'Last Name',
          rect: { x: 0, y: 0, width: 100, height: 20 }
        },
        firstName: { 
          id: 'form1[0].Sections1-6[0].TextField11[1]', 
          value: 'TestFirstName', 
          type: 'text', 
          label: 'First Name',
          rect: { x: 0, y: 0, width: 100, height: 20 }
        },
        middleName: { 
          id: 'form1[0].Sections1-6[0].TextField11[2]', 
          value: 'TestMiddleName', 
          type: 'text', 
          label: 'Middle Name',
          rect: { x: 0, y: 0, width: 100, height: 20 }
        }
      }
    },
    sampleSection2: {
      dateOfBirth: {
        date: { 
          id: 'form1[0].Sections1-6[0].DateField[0]', 
          value: '1990-01-15', 
          type: 'date', 
          label: 'Date of Birth',
          rect: { x: 0, y: 0, width: 100, height: 20 }
        },
        estimated: { 
          id: 'form1[0].Sections1-6[0].CheckBox[0]', 
          value: false, 
          type: 'checkbox', 
          label: 'Estimated',
          rect: { x: 0, y: 0, width: 20, height: 20 }
        }
      }
    },
    sampleSection29: {
      associations: [
        {
          organizationName: { 
            id: 'form1[0].Section29[0].TextField[0]', 
            value: 'Test Organization', 
            type: 'text', 
            label: 'Organization Name',
            rect: { x: 0, y: 0, width: 200, height: 20 }
          },
          organizationAddress: { 
            id: 'form1[0].Section29[0].TextField[1]', 
            value: '123 Test Street', 
            type: 'text', 
            label: 'Organization Address',
            rect: { x: 0, y: 0, width: 200, height: 20 }
          }
        }
      ]
    }
  };
  
  // Write test data to file
  await fs.writeFile(
    'test-results/sample-test-data.json',
    JSON.stringify(testData, null, 2)
  );
  
  // Create test configuration file
  const testConfig = {
    testSuite: 'SF-86 Form Architecture',
    version: '2.0',
    timestamp: new Date().toISOString(),
    browsers: ['chromium', 'firefox', 'webkit'],
    testTypes: [
      'form-context-integration',
      'pdf-integration',
      'section-implementations',
      'field-compatibility',
      'cross-browser-compatibility'
    ],
    expectedSections: 30,
    expectedFieldTypes: ['text', 'date', 'checkbox', 'radio', 'select', 'textarea'],
    pdfFieldPatterns: [
      'form1[0].Sections1-6[0].*',
      'form1[0].Sections7-9[0].*',
      'form1[0].Section\\d+[0].*'
    ]
  };
  
  await fs.writeFile(
    'test-results/test-configuration.json',
    JSON.stringify(testConfig, null, 2)
  );
  
  console.log('✅ Test data files created');
});
