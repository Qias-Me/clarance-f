/**
 * Section References Validation Script
 * 
 * This script validates that all section contexts properly use sections-references
 * JSON files as the single source of truth for field mappings and counts.
 */

import { 
  getSectionMetadata, 
  getSectionFields, 
  validateSectionFieldCount,
  validateAllSectionFieldCounts,
  EXPECTED_FIELD_COUNTS 
} from '../api/utils/sections-references-loader';

// ============================================================================
// VALIDATION RESULTS INTERFACE
// ============================================================================

interface ValidationResult {
  sectionId: number;
  sectionName: string;
  status: 'PASS' | 'FAIL' | 'WARNING';
  issues: string[];
  fieldCount: {
    expected: number;
    actual: number;
    matches: boolean;
  };
  hasContextFile: boolean;
  usesReferences: boolean;
  hasFieldFlattening: boolean;
}

// ============================================================================
// SECTION CONTEXT ANALYSIS
// ============================================================================

const IMPLEMENTED_SECTIONS = [1, 2, 5, 7, 8, 9, 27, 29, 30];

const SECTION_CONTEXT_PATTERNS = {
  usesReferences: [29], // Sections that properly use sections-references
  hasFieldFlattening: [29, 5], // Sections with field flattening implemented
  needsStandardization: [1, 2, 7, 8, 9, 27, 30] // Sections needing standardization
};

// ============================================================================
// VALIDATION FUNCTIONS
// ============================================================================

/**
 * Validate a single section's references and implementation
 */
function validateSection(sectionId: number): ValidationResult {
  const metadata = getSectionMetadata(sectionId);
  const fields = getSectionFields(sectionId);
  const issues: string[] = [];
  
  // Check if section has context file
  const hasContextFile = IMPLEMENTED_SECTIONS.includes(sectionId);
  if (!hasContextFile) {
    issues.push(`No context file implemented for section ${sectionId}`);
  }
  
  // Check if section uses references properly
  const usesReferences = SECTION_CONTEXT_PATTERNS.usesReferences.includes(sectionId);
  if (hasContextFile && !usesReferences) {
    issues.push(`Section ${sectionId} context does not use sections-references JSON`);
  }
  
  // Check if section has field flattening
  const hasFieldFlattening = SECTION_CONTEXT_PATTERNS.hasFieldFlattening.includes(sectionId);
  if (hasContextFile && !hasFieldFlattening) {
    issues.push(`Section ${sectionId} missing field flattening for PDF generation`);
  }
  
  // Validate field count
  const expectedCount = EXPECTED_FIELD_COUNTS[sectionId as keyof typeof EXPECTED_FIELD_COUNTS];
  const actualCount = metadata.totalFields;
  const fieldCountMatches = expectedCount ? actualCount === expectedCount : true;
  
  if (expectedCount && !fieldCountMatches) {
    issues.push(`Field count mismatch: expected ${expectedCount}, got ${actualCount}`);
  }
  
  // Validate field ID format
  const invalidFieldIds = fields.filter(field => {
    const numericId = field.id.replace(' 0 R', '');
    return !/^\d{4}$/.test(numericId);
  });
  
  if (invalidFieldIds.length > 0) {
    issues.push(`${invalidFieldIds.length} fields have invalid ID format`);
  }
  
  // Determine overall status
  let status: 'PASS' | 'FAIL' | 'WARNING' = 'PASS';
  if (issues.some(issue => issue.includes('mismatch') || issue.includes('invalid'))) {
    status = 'FAIL';
  } else if (issues.length > 0) {
    status = 'WARNING';
  }
  
  return {
    sectionId,
    sectionName: metadata.sectionName,
    status,
    issues,
    fieldCount: {
      expected: expectedCount || actualCount,
      actual: actualCount,
      matches: fieldCountMatches
    },
    hasContextFile,
    usesReferences,
    hasFieldFlattening
  };
}

/**
 * Validate all sections
 */
function validateAllSections(): ValidationResult[] {
  const results: ValidationResult[] = [];
  
  // Validate all 30 sections
  for (let sectionId = 1; sectionId <= 30; sectionId++) {
    try {
      const result = validateSection(sectionId);
      results.push(result);
    } catch (error) {
      results.push({
        sectionId,
        sectionName: `Section ${sectionId}`,
        status: 'FAIL',
        issues: [`Failed to load section data: ${error}`],
        fieldCount: { expected: 0, actual: 0, matches: false },
        hasContextFile: false,
        usesReferences: false,
        hasFieldFlattening: false
      });
    }
  }
  
  return results;
}

// ============================================================================
// REPORTING FUNCTIONS
// ============================================================================

/**
 * Generate validation report
 */
function generateValidationReport(results: ValidationResult[]): string {
  const report: string[] = [];
  
  report.push('# SF-86 Section References Validation Report');
  report.push('');
  report.push(`Generated: ${new Date().toISOString()}`);
  report.push('');
  
  // Summary statistics
  const totalSections = results.length;
  const passCount = results.filter(r => r.status === 'PASS').length;
  const warningCount = results.filter(r => r.status === 'WARNING').length;
  const failCount = results.filter(r => r.status === 'FAIL').length;
  
  report.push('## Summary');
  report.push(`- Total Sections: ${totalSections}`);
  report.push(`- ✅ Pass: ${passCount}`);
  report.push(`- ⚠️ Warning: ${warningCount}`);
  report.push(`- ❌ Fail: ${failCount}`);
  report.push('');
  
  // Implementation status
  const implementedCount = results.filter(r => r.hasContextFile).length;
  const referencesCount = results.filter(r => r.usesReferences).length;
  const flatteningCount = results.filter(r => r.hasFieldFlattening).length;
  
  report.push('## Implementation Status');
  report.push(`- Context Files: ${implementedCount}/${totalSections}`);
  report.push(`- Uses References: ${referencesCount}/${implementedCount}`);
  report.push(`- Has Field Flattening: ${flatteningCount}/${implementedCount}`);
  report.push('');
  
  // Detailed results
  report.push('## Detailed Results');
  report.push('');
  
  results.forEach(result => {
    const statusIcon = result.status === 'PASS' ? '✅' : result.status === 'WARNING' ? '⚠️' : '❌';
    report.push(`### ${statusIcon} Section ${result.sectionId}: ${result.sectionName}`);
    report.push('');
    report.push(`- **Status**: ${result.status}`);
    report.push(`- **Field Count**: ${result.fieldCount.actual} (expected: ${result.fieldCount.expected})`);
    report.push(`- **Has Context**: ${result.hasContextFile ? 'Yes' : 'No'}`);
    report.push(`- **Uses References**: ${result.usesReferences ? 'Yes' : 'No'}`);
    report.push(`- **Has Field Flattening**: ${result.hasFieldFlattening ? 'Yes' : 'No'}`);
    
    if (result.issues.length > 0) {
      report.push('- **Issues**:');
      result.issues.forEach(issue => {
        report.push(`  - ${issue}`);
      });
    }
    report.push('');
  });
  
  return report.join('\n');
}

// ============================================================================
// MAIN EXECUTION
// ============================================================================

/**
 * Run validation and generate report
 */
export function runValidation(): string {
  console.log('🔍 Starting SF-86 section references validation...');
  
  const results = validateAllSections();
  const report = generateValidationReport(results);
  
  console.log('✅ Validation complete!');
  console.log(`📊 Results: ${results.filter(r => r.status === 'PASS').length} pass, ${results.filter(r => r.status === 'WARNING').length} warnings, ${results.filter(r => r.status === 'FAIL').length} failures`);
  
  return report;
}

// Export for use in other scripts
export { validateSection, validateAllSections, generateValidationReport };
