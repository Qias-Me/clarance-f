/**
 * Section 20 Global Test Teardown
 * 
 * Cleans up test environment and generates comprehensive test reports
 */

import { FullConfig } from '@playwright/test';
import fs from 'fs';
import path from 'path';

async function globalTeardown(config: FullConfig) {
  console.log('🧹 Starting Section 20 test cleanup and reporting...');
  
  const testResultsDir = 'test-results';
  
  try {
    // Load test results
    const testResultsPath = path.join(testResultsDir, 'section20-test-results.json');
    let testResults: any = {
      startTime: new Date().toISOString(),
      endTime: new Date().toISOString(),
      totalFields: 790,
      fieldResults: {},
      summary: { passed: 0, failed: 0, skipped: 0, total: 0 }
    };
    
    if (fs.existsSync(testResultsPath)) {
      testResults = JSON.parse(fs.readFileSync(testResultsPath, 'utf8'));
    }
    
    testResults.endTime = new Date().toISOString();
    
    // Calculate test duration
    const startTime = new Date(testResults.startTime);
    const endTime = new Date(testResults.endTime);
    const duration = endTime.getTime() - startTime.getTime();
    
    testResults.duration = {
      milliseconds: duration,
      seconds: Math.round(duration / 1000),
      minutes: Math.round(duration / 60000),
      formatted: formatDuration(duration)
    };
    
    // Load test plan for comparison
    const testPlanPath = path.join(testResultsDir, 'section20-test-plan.json');
    let testPlan: any = { testTargets: { totalTests: 790 } };
    
    if (fs.existsSync(testPlanPath)) {
      testPlan = JSON.parse(fs.readFileSync(testPlanPath, 'utf8'));
    }
    
    // Generate comprehensive report
    const comprehensiveReport = {
      metadata: {
        testSuite: 'Section 20 Comprehensive Field Tests',
        totalFields: 790,
        testStartTime: testResults.startTime,
        testEndTime: testResults.endTime,
        duration: testResults.duration,
        generatedAt: new Date().toISOString()
      },
      
      summary: {
        planned: testPlan.testTargets?.totalTests || 790,
        executed: testResults.summary.total,
        passed: testResults.summary.passed,
        failed: testResults.summary.failed,
        skipped: testResults.summary.skipped,
        passRate: testResults.summary.total > 0 ? 
          Math.round((testResults.summary.passed / testResults.summary.total) * 100) : 0,
        coverage: testPlan.testTargets?.totalTests > 0 ? 
          Math.round((testResults.summary.total / testPlan.testTargets.totalTests) * 100) : 0
      },
      
      fieldTypeBreakdown: generateFieldTypeBreakdown(testResults.fieldResults),
      
      performance: {
        averageTestTime: testResults.summary.total > 0 ? 
          Math.round(duration / testResults.summary.total) : 0,
        slowestTests: findSlowestTests(testResults.fieldResults),
        fastestTests: findFastestTests(testResults.fieldResults)
      },
      
      issues: {
        failedFields: extractFailedFields(testResults.fieldResults),
        skippedFields: extractSkippedFields(testResults.fieldResults),
        commonFailureReasons: analyzeFailureReasons(testResults.fieldResults)
      },
      
      recommendations: generateRecommendations(testResults, testPlan)
    };
    
    // Save comprehensive report
    fs.writeFileSync(
      path.join(testResultsDir, 'section20-comprehensive-report.json'),
      JSON.stringify(comprehensiveReport, null, 2)
    );
    
    // Generate HTML report
    const htmlReport = generateHtmlReport(comprehensiveReport);
    fs.writeFileSync(
      path.join(testResultsDir, 'section20-report.html'),
      htmlReport
    );
    
    // Generate CSV report for analysis
    const csvReport = generateCsvReport(testResults.fieldResults);
    fs.writeFileSync(
      path.join(testResultsDir, 'section20-field-results.csv'),
      csvReport
    );
    
    // Print summary to console
    console.log('\n📊 Section 20 Test Summary');
    console.log('=' .repeat(50));
    console.log(`Total Fields: ${comprehensiveReport.metadata.totalFields}`);
    console.log(`Tests Executed: ${comprehensiveReport.summary.executed}`);
    console.log(`Tests Passed: ${comprehensiveReport.summary.passed}`);
    console.log(`Tests Failed: ${comprehensiveReport.summary.failed}`);
    console.log(`Tests Skipped: ${comprehensiveReport.summary.skipped}`);
    console.log(`Pass Rate: ${comprehensiveReport.summary.passRate}%`);
    console.log(`Coverage: ${comprehensiveReport.summary.coverage}%`);
    console.log(`Duration: ${testResults.duration.formatted}`);
    console.log(`Average Test Time: ${comprehensiveReport.performance.averageTestTime}ms`);
    
    if (comprehensiveReport.issues.failedFields.length > 0) {
      console.log(`\n❌ Failed Fields: ${comprehensiveReport.issues.failedFields.length}`);
      comprehensiveReport.issues.failedFields.slice(0, 5).forEach((field: any) => {
        console.log(`   - ${field.name}: ${field.reason}`);
      });
      if (comprehensiveReport.issues.failedFields.length > 5) {
        console.log(`   ... and ${comprehensiveReport.issues.failedFields.length - 5} more`);
      }
    }
    
    console.log(`\n📁 Reports generated:`);
    console.log(`   - Comprehensive: ${path.join(testResultsDir, 'section20-comprehensive-report.json')}`);
    console.log(`   - HTML Report: ${path.join(testResultsDir, 'section20-report.html')}`);
    console.log(`   - CSV Data: ${path.join(testResultsDir, 'section20-field-results.csv')}`);
    
    // Clean up temporary files
    const tempFiles = [
      'section20-test-plan.json',
      'section20-field-mapping.json'
    ];
    
    tempFiles.forEach(file => {
      const filePath = path.join(testResultsDir, file);
      if (fs.existsSync(filePath)) {
        try {
          fs.unlinkSync(filePath);
        } catch (error) {
          console.warn(`Warning: Could not delete temp file ${file}`);
        }
      }
    });
    
    console.log('✅ Section 20 test cleanup complete');
    
  } catch (error) {
    console.error('❌ Error during test cleanup:', error.message);
  }
}

// Helper functions
function formatDuration(milliseconds: number): string {
  const seconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  
  if (hours > 0) {
    return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
  } else if (minutes > 0) {
    return `${minutes}m ${seconds % 60}s`;
  } else {
    return `${seconds}s`;
  }
}

function generateFieldTypeBreakdown(fieldResults: any): any {
  const breakdown = {
    PDFTextField: { passed: 0, failed: 0, skipped: 0 },
    PDFCheckBox: { passed: 0, failed: 0, skipped: 0 },
    PDFRadioGroup: { passed: 0, failed: 0, skipped: 0 },
    PDFDropdown: { passed: 0, failed: 0, skipped: 0 }
  };
  
  Object.values(fieldResults).forEach((result: any) => {
    const fieldType = result.fieldType || 'PDFTextField';
    if (breakdown[fieldType]) {
      if (result.passed) breakdown[fieldType].passed++;
      else if (result.skipped) breakdown[fieldType].skipped++;
      else breakdown[fieldType].failed++;
    }
  });
  
  return breakdown;
}

function findSlowestTests(fieldResults: any): any[] {
  return Object.values(fieldResults)
    .filter((result: any) => result.duration)
    .sort((a: any, b: any) => b.duration - a.duration)
    .slice(0, 10);
}

function findFastestTests(fieldResults: any): any[] {
  return Object.values(fieldResults)
    .filter((result: any) => result.duration)
    .sort((a: any, b: any) => a.duration - b.duration)
    .slice(0, 10);
}

function extractFailedFields(fieldResults: any): any[] {
  return Object.values(fieldResults)
    .filter((result: any) => !result.passed && !result.skipped)
    .map((result: any) => ({
      name: result.fieldName,
      id: result.fieldId,
      reason: result.error || 'Unknown error'
    }));
}

function extractSkippedFields(fieldResults: any): any[] {
  return Object.values(fieldResults)
    .filter((result: any) => result.skipped)
    .map((result: any) => ({
      name: result.fieldName,
      id: result.fieldId,
      reason: result.skipReason || 'Unknown reason'
    }));
}

function analyzeFailureReasons(fieldResults: any): any {
  const reasons: { [key: string]: number } = {};
  
  Object.values(fieldResults).forEach((result: any) => {
    if (!result.passed && !result.skipped && result.error) {
      const reason = result.error.split(':')[0]; // Get first part of error
      reasons[reason] = (reasons[reason] || 0) + 1;
    }
  });
  
  return Object.entries(reasons)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 10)
    .map(([reason, count]) => ({ reason, count }));
}

function generateRecommendations(testResults: any, testPlan: any): string[] {
  const recommendations = [];
  
  if (testResults.summary.passRate < 90) {
    recommendations.push('Consider reviewing failed test cases and improving field implementations');
  }
  
  if (testResults.summary.coverage < 95) {
    recommendations.push('Increase test coverage to include more fields');
  }
  
  if (testResults.duration.minutes > 30) {
    recommendations.push('Consider optimizing test execution time with parallel testing');
  }
  
  return recommendations;
}

function generateHtmlReport(report: any): string {
  return `
<!DOCTYPE html>
<html>
<head>
    <title>Section 20 Test Report</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .summary { background: #f5f5f5; padding: 20px; border-radius: 5px; }
        .metric { display: inline-block; margin: 10px; padding: 10px; background: white; border-radius: 3px; }
        .passed { color: green; }
        .failed { color: red; }
        .skipped { color: orange; }
    </style>
</head>
<body>
    <h1>Section 20 Comprehensive Test Report</h1>
    
    <div class="summary">
        <h2>Test Summary</h2>
        <div class="metric">Total Fields: <strong>${report.metadata.totalFields}</strong></div>
        <div class="metric">Tests Executed: <strong>${report.summary.executed}</strong></div>
        <div class="metric passed">Passed: <strong>${report.summary.passed}</strong></div>
        <div class="metric failed">Failed: <strong>${report.summary.failed}</strong></div>
        <div class="metric skipped">Skipped: <strong>${report.summary.skipped}</strong></div>
        <div class="metric">Pass Rate: <strong>${report.summary.passRate}%</strong></div>
        <div class="metric">Coverage: <strong>${report.summary.coverage}%</strong></div>
        <div class="metric">Duration: <strong>${report.metadata.duration.formatted}</strong></div>
    </div>
    
    <h2>Field Type Breakdown</h2>
    <pre>${JSON.stringify(report.fieldTypeBreakdown, null, 2)}</pre>
    
    <h2>Performance Metrics</h2>
    <p>Average Test Time: ${report.performance.averageTestTime}ms</p>
    
    <h2>Issues</h2>
    <h3>Failed Fields (${report.issues.failedFields.length})</h3>
    <ul>
        ${report.issues.failedFields.slice(0, 20).map((field: any) => 
          `<li>${field.name}: ${field.reason}</li>`
        ).join('')}
    </ul>
    
    <p><em>Generated at: ${report.metadata.generatedAt}</em></p>
</body>
</html>`;
}

function generateCsvReport(fieldResults: any): string {
  const headers = 'FieldId,FieldName,FieldType,Status,Duration,Error\n';
  const rows = Object.values(fieldResults).map((result: any) => {
    const status = result.passed ? 'PASSED' : result.skipped ? 'SKIPPED' : 'FAILED';
    return `"${result.fieldId}","${result.fieldName}","${result.fieldType}","${status}","${result.duration || 0}","${result.error || ''}"`;
  }).join('\n');
  
  return headers + rows;
}

export default globalTeardown;
