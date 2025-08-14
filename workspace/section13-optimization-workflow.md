# Section 13 Field Mapping Optimization Workflow

## Executive Summary

This workflow implements a systematic page-by-page validation system for Section 13 of the SF-86 form, ensuring 100% field coverage between the web UI and PDF. The system prevents progression to the next page until all fields on the current page are properly mapped and validated.

## Current Issues to Fix

1. **Infinite Loop**: Console logging in section13.tsx triggers continuously
2. **Data Flow**: Expected values not properly sourced from formData context
3. **Validation Scope**: System attempts to validate all pages at once instead of page-by-page
4. **Missing Features**: No visual feedback for field mapping status

## Implementation Phases

### Phase 1: Critical Fixes (Immediate)

#### Task 1.1: Fix Infinite Loop
```typescript
// Before: Logging in render cycle
console.log(`🔄 Section13: Creating field for logical path: ${logicalPath}`);

// After: Logging in useEffect with dependencies
useEffect(() => {
  if (process.env.NODE_ENV === 'development') {
    console.log(`🔄 Section13: Field creation triggered for employment type: ${employmentType}`);
  }
}, [employmentType]);
```

#### Task 1.2: Fix Data Flow
```typescript
// Update validateSection13Inputs to use formData
const expectedValues = extractExpectedValuesFromFormData(
  formData.section13,
  targetPage
);
```

#### Task 1.3: Implement Conditional Rendering
- Only render subsections based on selected employment type
- Label subsections as 13A.1 - 13A.6
- Support up to 4 employment entries

### Phase 2: Page-by-Page Validation System

#### Task 2.1: Create Page Manifest
```typescript
interface Section13PageManifest {
  pages: Array<{
    pageNumber: number;
    fieldCount: number;
    fields: Array<{
      pdfFieldName: string;
      uiFieldPath: string;
      isMapped: boolean;
      hasValue: boolean;
      expectedValue?: string;
      actualValue?: string;
    }>;
    validationStatus: 'pending' | 'in-progress' | 'complete';
    coverage: number; // percentage
  }>;
  currentPage: number;
  totalPages: number;
}
```

#### Task 2.2: Implement Single Page Validator
```typescript
async function validateSinglePage(
  pageNumber: number,
  formData: Section13Data,
  pdfBytes: Uint8Array
): Promise<PageValidationResult> {
  // Extract only fields for current page
  const pageFields = await extractPageFields(pdfBytes, pageNumber);
  
  // Map UI values to PDF fields
  const mappedValues = mapFormDataToPageFields(formData, pageFields);
  
  // Generate visual comparison
  const pageImage = await generatePageImage(pdfBytes, pageNumber);
  
  return {
    pageNumber,
    totalFields: pageFields.length,
    mappedFields: mappedValues.filter(f => f.isMapped).length,
    coverage: (mappedFields / totalFields) * 100,
    unmappedFields: mappedValues.filter(f => !f.isMapped),
    pageImage,
    canProceed: coverage === 100
  };
}
```

#### Task 2.3: Build Validation UI Component
```typescript
const FieldMappingValidator: React.FC = () => {
  const [currentPage, setCurrentPage] = useState(17); // Section 13 starts at page 17
  const [manifest, setManifest] = useState<Section13PageManifest>();
  const [validationResults, setValidationResults] = useState<PageValidationResult>();

  return (
    <div className="validation-container">
      {/* Left Panel: PDF Page Preview */}
      <div className="pdf-preview">
        <img src={validationResults?.pageImage} />
        {/* Overlay field highlights */}
        {validationResults?.fields.map(field => (
          <FieldHighlight
            key={field.pdfFieldName}
            field={field}
            status={field.isMapped ? 'mapped' : 'unmapped'}
          />
        ))}
      </div>

      {/* Right Panel: Field Mapping Status */}
      <div className="field-status">
        <h3>Page {currentPage} Field Mapping</h3>
        <ProgressBar value={validationResults?.coverage || 0} />
        
        <div className="field-list">
          {validationResults?.fields.map(field => (
            <FieldStatus
              key={field.pdfFieldName}
              field={field}
              onFix={() => handleFixMapping(field)}
            />
          ))}
        </div>

        <div className="navigation">
          <button 
            disabled={validationResults?.coverage !== 100}
            onClick={() => setCurrentPage(currentPage + 1)}
          >
            Next Page (Requires 100% Coverage)
          </button>
        </div>
      </div>
    </div>
  );
};
```

### Phase 3: Testing & Verification

#### Task 3.1: Playwright Test Suite
```typescript
// tests/section13/field-mapping-validation.spec.ts
test.describe('Section 13 Field Mapping Validation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173');
    await page.click('text=Section 13');
  });

  test('Military employment type renders correct subsections', async ({ page }) => {
    await page.selectOption('[name="employmentType"]', 'military');
    await expect(page.locator('.subsection-13A-1')).toBeVisible();
    await expect(page.locator('.subsection-13A-2')).toBeVisible();
    // ... verify all expected subsections
  });

  test('Page-by-page validation blocks progression', async ({ page }) => {
    // Fill partial data
    await page.fill('[name="employer"]', 'Test Employer');
    await page.click('button:text("Validate Input")');
    
    // Verify cannot proceed without 100% coverage
    const nextButton = page.locator('button:text("Next Page")');
    await expect(nextButton).toBeDisabled();
    
    // Check coverage indicator
    await expect(page.locator('.coverage-percentage')).toContainText('< 100%');
  });

  test('Field mapping achieves 100% coverage', async ({ page }) => {
    // Test each employment type
    const employmentTypes = ['military', 'federal', 'non-federal', 'self-employment'];
    
    for (const type of employmentTypes) {
      await page.selectOption('[name="employmentType"]', type);
      await fillAllFieldsForType(page, type);
      await page.click('button:text("Validate Input")');
      
      // Verify 100% coverage
      await expect(page.locator('.coverage-percentage')).toContainText('100%');
    }
  });
});
```

#### Task 3.2: Coverage Analysis Tool
```typescript
async function generateCoverageReport(): Promise<CoverageReport> {
  const section13Pages = [17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33];
  const report: CoverageReport = {
    totalFields: 0,
    mappedFields: 0,
    pages: []
  };

  for (const pageNum of section13Pages) {
    const pageFields = await analyzePage(pageNum);
    report.pages.push({
      pageNumber: pageNum,
      fieldCount: pageFields.total,
      mappedCount: pageFields.mapped,
      unmappedFields: pageFields.unmapped,
      coverage: (pageFields.mapped / pageFields.total) * 100
    });
    report.totalFields += pageFields.total;
    report.mappedFields += pageFields.mapped;
  }

  report.overallCoverage = (report.mappedFields / report.totalFields) * 100;
  return report;
}
```

### Phase 4: Performance Optimization

#### Task 4.1: Caching Strategy
- Cache validated pages to avoid re-validation
- Store field mappings in browser storage
- Preload next page while validating current

#### Task 4.2: Batch Operations
- Process field extractions in parallel where possible
- Optimize PDF operations for performance
- Implement progress indicators for long operations

## Implementation Timeline

1. **Week 1**: Fix critical issues (infinite loop, data flow)
2. **Week 1-2**: Implement page-by-page validation core
3. **Week 2**: Build visual validation UI
4. **Week 2-3**: Create Playwright tests
5. **Week 3**: Performance optimization and documentation

## Success Metrics

- **Field Coverage**: 100% mapping for all Section 13 fields
- **Validation Accuracy**: Zero false positives/negatives
- **Performance**: < 2 seconds per page validation
- **User Experience**: Clear visual feedback for mapping status
- **Test Coverage**: 100% of employment types tested

## Technical Architecture

### Component Hierarchy
```
Section13Component
├── EmploymentTypeSelector
├── ConditionalSubsections (13A.1 - 13A.6)
├── FieldMappingValidator
│   ├── PDFPagePreview
│   ├── FieldStatusPanel
│   └── NavigationControls
└── ValidationResultsDisplay
```

### Data Flow
```
User Input → Local State → Form Context → PDF Generation → Validation Service → Page Validator → Visual Feedback
```

### API Endpoints
- `POST /api/pdf-validation-tools` - Cleanup operations
- `POST /api/validate-pdf` - Page validation
- `GET /api/field-mapping/{section}/{page}` - Get field mappings

## Next Steps

1. Start with fixing the infinite loop issue
2. Implement data flow corrections
3. Build page manifest system
4. Create visual validator component
5. Write comprehensive tests

This workflow ensures systematic, verifiable 100% field coverage for Section 13.