/**
 * Global Teardown for Section 18 Tests
 * 
 * Cleans up after Section 18 tests and generates final reports
 */

import { FullConfig } from '@playwright/test';
import fs from 'fs';
import path from 'path';

async function globalTeardown(config: FullConfig) {
  console.log('🧹 Cleaning up Section 18 test environment...');

  const testResultsDir = 'test-results/section18';
  
  try {
    // Read test summary
    const summaryPath = path.join(testResultsDir, 'test-summary.json');
    let testSummary = {
      startTime: new Date().toISOString(),
      endTime: new Date().toISOString(),
      testSuite: 'Section 18 Comprehensive Tests',
      totalTests: 0,
      passedTests: 0,
      failedTests: 0,
      errors: [],
      warnings: [],
      performance: {
        totalExecutionTime: 0,
        averageTestTime: 0
      }
    };

    if (fs.existsSync(summaryPath)) {
      testSummary = JSON.parse(fs.readFileSync(summaryPath, 'utf8'));
    }

    // Update end time
    testSummary.endTime = new Date().toISOString();

    // Calculate total execution time
    const startTime = new Date(testSummary.startTime);
    const endTime = new Date(testSummary.endTime);
    testSummary.performance.totalExecutionTime = endTime.getTime() - startTime.getTime();

    // Generate final report
    const finalReport = {
      ...testSummary,
      summary: {
        testSuite: 'Section 18 - Relatives and Associates',
        description: 'Comprehensive tests covering all 964 fields across 6 relative entries',
        sections: [
          'Section 18.1 - Basic Relative Information',
          'Section 18.2 - Current Address',
          'Section 18.3 - Contact Information and Foreign Relations (includes 18.4 & 18.5 functionality)'
        ],
        features: [
          'Basic relative information (name, relationship, citizenship, birth info)',
          'Other names functionality (4 entries per relative)',
          'Current address with APO/FPO support',
          'Contact methods and frequency (Section 18.5 functionality)',
          'Documentation types (Section 18.4 functionality)',
          'Employment information',
          'Foreign government relations',
          'Contact dates and estimates',
          'PDF generation with all field values',
          'Console error monitoring',
          'Performance testing'
        ],
        totalFields: 964,
        relativesSupported: 6,
        subsections: 3
      }
    };

    // Write final report
    fs.writeFileSync(
      path.join(testResultsDir, 'final-report.json'),
      JSON.stringify(finalReport, null, 2)
    );

    // Generate human-readable report
    const readableReport = `
# Section 18 Test Results

## Test Summary
- **Test Suite**: ${finalReport.testSuite}
- **Start Time**: ${finalReport.startTime}
- **End Time**: ${finalReport.endTime}
- **Total Execution Time**: ${finalReport.performance.totalExecutionTime}ms
- **Total Tests**: ${finalReport.totalTests}
- **Passed Tests**: ${finalReport.passedTests}
- **Failed Tests**: ${finalReport.failedTests}

## Section 18 Coverage
- **Total Fields**: 964
- **Relatives Supported**: 6
- **Subsections**: 3

### Subsections Tested:
1. **Section 18.1** - Basic Relative Information
   - Name, relationship, citizenship, birth information
   - Other names functionality (4 entries per relative)
   - Mother's maiden name

2. **Section 18.2** - Current Address
   - Standard address fields
   - APO/FPO address support
   - Date ranges and estimates

3. **Section 18.3** - Contact Information and Foreign Relations
   - Contact methods (Section 18.5 functionality)
   - Contact frequency (Section 18.5 functionality)
   - Documentation types (Section 18.4 functionality)
   - Employment information
   - Foreign government relations
   - Contact dates

## Features Tested:
${finalReport.summary.features.map(feature => `- ${feature}`).join('\n')}

## Errors Detected:
${finalReport.errors.length > 0 ? finalReport.errors.map((error, index) => `${index + 1}. ${error}`).join('\n') : 'No errors detected'}

## Warnings:
${finalReport.warnings.length > 0 ? finalReport.warnings.map((warning, index) => `${index + 1}. ${warning}`).join('\n') : 'No warnings detected'}

## Performance Metrics:
- **Total Execution Time**: ${finalReport.performance.totalExecutionTime}ms
- **Average Test Time**: ${finalReport.performance.averageTestTime}ms
- **Average Time per Field**: ${(finalReport.performance.totalExecutionTime / 964).toFixed(2)}ms

---
Generated on: ${new Date().toISOString()}
`;

    fs.writeFileSync(
      path.join(testResultsDir, 'README.md'),
      readableReport
    );

    console.log('📊 Test Results Summary:');
    console.log(`   Total Tests: ${finalReport.totalTests}`);
    console.log(`   Passed: ${finalReport.passedTests}`);
    console.log(`   Failed: ${finalReport.failedTests}`);
    console.log(`   Execution Time: ${finalReport.performance.totalExecutionTime}ms`);
    console.log(`   Errors: ${finalReport.errors.length}`);
    console.log(`   Warnings: ${finalReport.warnings.length}`);

    if (finalReport.errors.length > 0) {
      console.log('🔴 Errors detected during testing:');
      finalReport.errors.forEach((error, index) => {
        console.log(`   ${index + 1}. ${error}`);
      });
    }

    console.log(`📁 Detailed reports saved to: ${testResultsDir}`);

  } catch (error) {
    console.error('❌ Error during teardown:', error);
  }

  console.log('✅ Section 18 test environment cleanup completed');
}

export default globalTeardown;
