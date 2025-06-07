/**
 * Section 18 Test Runner - Optimized for 964 Fields
 * 
 * This test runner executes comprehensive tests for all Section 18 fields
 * with optimized batching, parallel execution, and detailed reporting.
 */

const { chromium } = require('playwright');
const Section18FieldAnalyzer = require('./section18-field-analyzer');

class Section18TestRunner {
  constructor(options = {}) {
    this.options = {
      headless: options.headless !== false,
      timeout: options.timeout || 120000,
      batchSize: options.batchSize || 25,
      parallelBrowsers: options.parallelBrowsers || 2,
      retries: options.retries || 2,
      baseUrl: options.baseUrl || 'http://localhost:3000',
      outputDir: options.outputDir || './test-results',
      ...options
    };
    
    this.analyzer = new Section18FieldAnalyzer();
    this.results = {
      total: 0,
      passed: 0,
      failed: 0,
      skipped: 0,
      errors: [],
      fieldResults: new Map(),
      performance: {
        startTime: null,
        endTime: null,
        duration: null
      }
    };
  }

  async runComprehensiveTests() {
    console.log('🚀 Starting comprehensive Section 18 tests for 964 fields...');
    this.results.performance.startTime = Date.now();
    
    // Analyze fields first
    this.analyzer.analyzeFields();
    
    // Run test suites
    await this.runTestSuite('smoke', 'Smoke Test - High Priority Fields');
    await this.runTestSuite('textFields', 'Text Field Tests');
    await this.runTestSuite('dropdowns', 'Dropdown Field Tests');
    await this.runTestSuite('checkboxes', 'Checkbox Field Tests');
    await this.runTestSuite('radioButtons', 'Radio Button Field Tests');
    await this.runDataPersistenceTests();
    await this.runPDFGenerationTests();
    
    this.results.performance.endTime = Date.now();
    this.results.performance.duration = this.results.performance.endTime - this.results.performance.startTime;
    
    this.generateReport();
  }

  async runTestSuite(suiteType, suiteName) {
    console.log(`\n🧪 Running ${suiteName}...`);
    
    let fields = [];
    
    switch (suiteType) {
      case 'smoke':
        fields = this.analyzer.getFieldsByPriority('high').slice(0, 20);
        break;
      case 'textFields':
        fields = this.analyzer.getFieldsByType('PDFTextField');
        break;
      case 'dropdowns':
        fields = this.analyzer.getFieldsByType('PDFDropdown');
        break;
      case 'checkboxes':
        fields = this.analyzer.getFieldsByType('PDFCheckBox');
        break;
      case 'radioButtons':
        fields = this.analyzer.getFieldsByType('PDFRadioGroup');
        break;
      default:
        console.log(`❌ Unknown test suite: ${suiteType}`);
        return;
    }
    
    console.log(`📊 Testing ${fields.length} fields in ${suiteName}`);
    
    // Split fields into batches for parallel execution
    const batches = this.createBatches(fields, this.options.batchSize);
    const browsers = await this.createBrowserPool();
    
    try {
      await this.executeBatchesInParallel(batches, browsers, suiteType);
    } finally {
      await this.closeBrowserPool(browsers);
    }
  }

  createBatches(fields, batchSize) {
    const batches = [];
    for (let i = 0; i < fields.length; i += batchSize) {
      batches.push(fields.slice(i, i + batchSize));
    }
    return batches;
  }

  async createBrowserPool() {
    const browsers = [];
    for (let i = 0; i < this.options.parallelBrowsers; i++) {
      const browser = await chromium.launch({ 
        headless: this.options.headless,
        timeout: this.options.timeout 
      });
      browsers.push(browser);
    }
    return browsers;
  }

  async closeBrowserPool(browsers) {
    await Promise.all(browsers.map(browser => browser.close()));
  }

  async executeBatchesInParallel(batches, browsers, suiteType) {
    const batchPromises = batches.map((batch, index) => {
      const browser = browsers[index % browsers.length];
      return this.executeBatch(batch, browser, suiteType, index);
    });
    
    await Promise.all(batchPromises);
  }

  async executeBatch(fields, browser, suiteType, batchIndex) {
    const context = await browser.newContext();
    const page = await context.newPage();
    
    try {
      console.log(`📦 Executing batch ${batchIndex + 1} with ${fields.length} fields`);
      
      // Navigate to Section 18
      await page.goto(`${this.options.baseUrl}/startForm?debug=true`);
      await page.waitForLoadState('networkidle');
      
      // Click Section 18
      await page.click('button[data-testid="section18-nav-button"], button:has-text("Section 18")', { timeout: 10000 });
      await page.waitForSelector('[data-testid*="section18"], [class*="section18"]', { timeout: 10000 });
      
      // Test each field in the batch
      for (const field of fields) {
        await this.testField(page, field, suiteType);
      }
      
    } catch (error) {
      console.error(`❌ Batch ${batchIndex + 1} failed:`, error.message);
      this.results.errors.push({
        batch: batchIndex + 1,
        error: error.message,
        fields: fields.map(f => f.id)
      });
    } finally {
      await context.close();
    }
  }

  async testField(page, field, suiteType) {
    const startTime = Date.now();
    let result = {
      fieldId: field.id,
      fieldType: field.type,
      category: field.category,
      priority: field.priority,
      suiteType: suiteType,
      status: 'skipped',
      error: null,
      duration: 0,
      testValue: field.testData.primary
    };
    
    try {
      this.results.total++;
      
      // Find the field element
      const element = await this.findFieldElement(page, field);
      
      if (!element) {
        result.status = 'skipped';
        result.error = 'Element not found';
        this.results.skipped++;
        return;
      }
      
      // Test field interaction based on type
      const success = await this.interactWithField(page, element, field);
      
      if (success) {
        result.status = 'passed';
        this.results.passed++;
      } else {
        result.status = 'failed';
        result.error = 'Field interaction failed';
        this.results.failed++;
      }
      
    } catch (error) {
      result.status = 'failed';
      result.error = error.message;
      this.results.failed++;
    } finally {
      result.duration = Date.now() - startTime;
      this.results.fieldResults.set(field.id, result);
    }
  }

  async findFieldElement(page, field) {
    // Try multiple selector strategies
    for (const selector of field.selectors) {
      try {
        const element = page.locator(selector).first();
        if (await element.isVisible({ timeout: 2000 })) {
          return element;
        }
      } catch (e) {
        // Continue to next selector
      }
    }
    
    // Try fallback selectors
    const fallbackSelectors = [
      `[data-testid*="${field.id}"]`,
      `[class*="${field.id}"]`,
      `input, select, textarea` // Very broad fallback
    ];
    
    for (const selector of fallbackSelectors) {
      try {
        const elements = await page.locator(selector).all();
        for (const element of elements) {
          if (await element.isVisible({ timeout: 1000 })) {
            return element;
          }
        }
      } catch (e) {
        // Continue
      }
    }
    
    return null;
  }

  async interactWithField(page, element, field) {
    try {
      switch (field.type) {
        case 'PDFTextField':
          await element.fill(field.testData.primary);
          await element.blur();
          await page.waitForTimeout(100);
          
          // Verify value persisted
          const value = await element.inputValue();
          return value === field.testData.primary;
          
        case 'PDFDropdown':
          await element.selectOption(field.testData.primary);
          await page.waitForTimeout(100);
          
          // Verify selection persisted
          const selectedValue = await element.inputValue();
          return selectedValue === field.testData.primary;
          
        case 'PDFCheckBox':
          if (field.testData.primary) {
            await element.check();
          } else {
            await element.uncheck();
          }
          await page.waitForTimeout(100);
          
          // Verify state persisted
          const isChecked = await element.isChecked();
          return isChecked === field.testData.primary;
          
        case 'PDFRadioGroup':
          // For radio buttons, find the specific option
          const radioSelector = `input[type="radio"][name*="${field.name}"][value="${field.testData.primary}"]`;
          const radioElement = page.locator(radioSelector).first();
          
          if (await radioElement.isVisible({ timeout: 1000 })) {
            await radioElement.check();
            await page.waitForTimeout(100);
            
            // Verify selection persisted
            const isSelected = await radioElement.isChecked();
            return isSelected;
          }
          return false;
          
        default:
          console.log(`⚠️ Unknown field type: ${field.type}`);
          return false;
      }
    } catch (error) {
      console.log(`❌ Field interaction error for ${field.id}: ${error.message}`);
      return false;
    }
  }

  async runDataPersistenceTests() {
    console.log('\n🧪 Running data persistence tests...');
    
    const browser = await chromium.launch({ headless: this.options.headless });
    const context = await browser.newContext();
    const page = await context.newPage();
    
    try {
      // Navigate and fill sample fields
      await page.goto(`${this.options.baseUrl}/startForm?debug=true`);
      await page.waitForLoadState('networkidle');
      await page.click('button[data-testid="section18-nav-button"], button:has-text("Section 18")');
      await page.waitForSelector('[data-testid*="section18"], [class*="section18"]');
      
      // Fill sample fields from each category
      const sampleFields = [
        ...this.analyzer.getFieldsByCategory('personal_info').slice(0, 3),
        ...this.analyzer.getFieldsByCategory('address').slice(0, 2),
        ...this.analyzer.getFieldsByCategory('contact').slice(0, 2)
      ];
      
      for (const field of sampleFields) {
        const element = await this.findFieldElement(page, field);
        if (element) {
          await this.interactWithField(page, element, field);
        }
      }
      
      // Check IndexedDB persistence
      const hasPersistedData = await page.evaluate(async () => {
        return new Promise((resolve) => {
          const dbRequest = indexedDB.open('SF86FormData', 1);
          dbRequest.onsuccess = (event) => {
            const db = event.target.result;
            const transaction = db.transaction(['formData'], 'readonly');
            const store = transaction.objectStore('formData');
            const request = store.get('complete-form');
            
            request.onsuccess = () => {
              const data = request.result;
              const hasSection18 = data && data.section18;
              db.close();
              resolve(hasSection18);
            };
            
            request.onerror = () => {
              db.close();
              resolve(false);
            };
          };
          
          dbRequest.onerror = () => resolve(false);
        });
      });
      
      this.results.fieldResults.set('data_persistence', {
        fieldId: 'data_persistence',
        status: hasPersistedData ? 'passed' : 'failed',
        error: hasPersistedData ? null : 'Data not found in IndexedDB'
      });
      
    } finally {
      await browser.close();
    }
  }

  async runPDFGenerationTests() {
    console.log('\n🧪 Running PDF generation tests...');
    
    const browser = await chromium.launch({ headless: this.options.headless });
    const context = await browser.newContext();
    const page = await context.newPage();
    
    try {
      await page.goto(`${this.options.baseUrl}/startForm?debug=true`);
      await page.waitForLoadState('networkidle');
      await page.click('button[data-testid="section18-nav-button"], button:has-text("Section 18")');
      await page.waitForSelector('[data-testid*="section18"], [class*="section18"]');
      
      // Check if Section 18 data is available for PDF generation
      const pdfDataAvailable = await page.evaluate(() => {
        try {
          const formContext = window.sf86FormContext || window.SF86FormContext;
          if (!formContext) return false;
          
          const formData = formContext.exportForm ? formContext.exportForm() : formContext.formData;
          return formData && formData.section18;
        } catch (error) {
          return false;
        }
      });
      
      this.results.fieldResults.set('pdf_generation', {
        fieldId: 'pdf_generation',
        status: pdfDataAvailable ? 'passed' : 'failed',
        error: pdfDataAvailable ? null : 'Section 18 data not available for PDF generation'
      });
      
    } finally {
      await browser.close();
    }
  }

  generateReport() {
    console.log('\n📊 === COMPREHENSIVE TEST RESULTS ===');
    console.log(`Total fields tested: ${this.results.total}`);
    console.log(`Passed: ${this.results.passed} (${((this.results.passed / this.results.total) * 100).toFixed(1)}%)`);
    console.log(`Failed: ${this.results.failed} (${((this.results.failed / this.results.total) * 100).toFixed(1)}%)`);
    console.log(`Skipped: ${this.results.skipped} (${((this.results.skipped / this.results.total) * 100).toFixed(1)}%)`);
    console.log(`Duration: ${(this.results.performance.duration / 1000).toFixed(1)} seconds`);
    
    // Results by field type
    console.log('\n📋 Results by field type:');
    const typeResults = new Map();
    for (const result of this.results.fieldResults.values()) {
      if (!result.fieldType) continue;
      
      if (!typeResults.has(result.fieldType)) {
        typeResults.set(result.fieldType, { passed: 0, failed: 0, skipped: 0 });
      }
      
      typeResults.get(result.fieldType)[result.status]++;
    }
    
    for (const [type, counts] of typeResults) {
      const total = counts.passed + counts.failed + counts.skipped;
      const passRate = total > 0 ? ((counts.passed / total) * 100).toFixed(1) : '0.0';
      console.log(`  ${type}: ${counts.passed}/${total} passed (${passRate}%)`);
    }
    
    // Show errors if any
    if (this.results.errors.length > 0) {
      console.log('\n❌ Errors encountered:');
      this.results.errors.slice(0, 5).forEach((error, index) => {
        console.log(`  ${index + 1}. ${error.error}`);
      });
    }
    
    // Export detailed results
    this.exportResults();
  }

  exportResults() {
    const reportData = {
      summary: {
        total: this.results.total,
        passed: this.results.passed,
        failed: this.results.failed,
        skipped: this.results.skipped,
        passRate: ((this.results.passed / this.results.total) * 100).toFixed(1),
        duration: this.results.performance.duration
      },
      fieldResults: Array.from(this.results.fieldResults.values()),
      errors: this.results.errors,
      generatedAt: new Date().toISOString()
    };
    
    const fs = require('fs');
    const outputPath = `${this.options.outputDir}/section18-test-results.json`;
    
    try {
      if (!fs.existsSync(this.options.outputDir)) {
        fs.mkdirSync(this.options.outputDir, { recursive: true });
      }
      
      fs.writeFileSync(outputPath, JSON.stringify(reportData, null, 2));
      console.log(`\n✅ Detailed results exported to ${outputPath}`);
    } catch (error) {
      console.error(`❌ Error exporting results: ${error.message}`);
    }
  }
}

// CLI usage
if (require.main === module) {
  const runner = new Section18TestRunner({
    headless: process.env.HEADLESS !== 'false',
    batchSize: parseInt(process.env.BATCH_SIZE) || 25,
    parallelBrowsers: parseInt(process.env.PARALLEL_BROWSERS) || 2
  });
  
  runner.runComprehensiveTests().catch(console.error);
}

module.exports = Section18TestRunner;
