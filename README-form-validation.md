# SF-86 Form Validation Framework

This document provides detailed information about the SF-86 form validation framework implemented in this project. The framework enables comprehensive validation, filling, and processing of SF-86 forms.

## Overview

The SF-86 Form Validation Framework provides utilities for:

1. Extracting form fields from SF-86 PDFs
2. Organizing fields by section
3. Validating field accessibility and fillability
4. Filling form sections with data
5. Generating validation reports
6. Web-based form automation with Playwright

## Key Components

### 1. Field Extraction

The `extractFieldsBySection.ts` script extracts fields from the SF-86 PDF and organizes them by section:

```sh
npm run extract-fields-by-section
```

This creates:
- JSON files for each section in `scripts/analysis/section*-fields.json`
- A summary file `scripts/analysis/section-summary.json`
- Uncategorized fields in `scripts/analysis/unknown-fields.json`

The script uses field labels and names to intelligently determine which section each field belongs to.

### 2. Form Validation

The `validateFormSections.ts` script validates all form sections:

```sh
npm run validate-form-sections
```

This utility:
- Tests each field's accessibility in the PDF
- Verifies each field can be filled with appropriate data
- Calculates validation success rates by section
- Generates a comprehensive validation report at `scripts/sf86-validation-report.json`

### 3. Section-Specific Form Filling

Section-specific scripts like `fillSection2.ts` demonstrate how to fill individual sections:

```sh
npm run fill-section2
```

These scripts:
- Use section-specific field definitions
- Fill fields with appropriate data
- Save section-specific filled PDFs

### 4. Web Form Automation

The `playwrightFormDemo.ts` script demonstrates browser-based automation:

```sh
npm run playwright-demo
```

This can be extended to integrate with web-based SF-86 portals.

## Validation Results

The latest validation run shows:
- 27 sections validated
- 4,924 fields validated
- 100% accessibility and fillability

## TaskMaster Integration

The form validation framework is integrated with TaskMaster via the `form-validation-task.json` task, which breaks down the implementation into subtasks:

1. Extract SF-86 Form Fields by Section
2. Implement Form Section Validation
3. Create Section-Specific Form Fillers
4. Implement Form Filling Data Source Integration
5. Create Web-Based Form Integration
6. Integrate with TaskMaster Workflow
7. Implement Validation Result Visualization

## Adding Support for New Sections

To add support for a new section:

1. Use `extractFieldsBySection.ts` to generate section field data
2. Create a section-specific filler script based on `fillSection2.ts`
3. Add a new script entry to `package.json`
4. Run validation to ensure the new section integrates properly

## Technical Considerations

- The framework uses pdf-lib for direct PDF form filling
- Field identification is based on field names, labels, and structural patterns
- Form filling is tested with placeholder data before real data is used
- A validation report provides insights into form field accessibility

## Future Enhancements

Planned enhancements to the framework include:
- Data source integration for loading form data from external sources
- Comprehensive web form automation for online SF-86 portals
- Validation result visualization with HTML reports
- Performance optimizations for large form processing

## Setup and Usage

### Setting Up Reference Counts

For proper field validation, the sectionizer needs reference counts for each section. These are now loaded automatically from multiple locations:

1. `section-data/section-summary.json`
2. `reports/section-summary.json`
3. `src/section-data/section-summary.json`

If you're experiencing issues with reference count loading, you can run the helper script:

```bash
node scripts/copy-section-summary.js
```

This script copies section summary files between directories to ensure all tools can find the reference counts they need.

### Dimensional Analysis

The latest version of the sectionizer utilizes field coordinates from the PDF for enhanced dimensional analysis:

- Field positions within the page (header, footer, left column, right column)
- Proximity to other fields
- Page-specific section knowledge
- Relative position on the page

This spatial analysis significantly improves categorization accuracy, especially for fields that lack clear section identifiers in their names.

### Running the Sectionizer with Validation

```bash
tsx src/sectionizer/index.ts -v -s --validate-counts --fields=section-data/extracted-fields.json -l 0 -m 10 --self-healing
```

Options:
- `-v, --verbose`: Enable verbose logging
- `-l, --log-level`: Set log level (0 = debug, 1 = info, 2 = warn, 3 = error)
- `-s, --self-healing`: Apply self-healing rules to improve categorization
- `--validate-counts`: Validate results against reference section counts
- `-m, --max-iterations`: Maximum number of healing iterations
- `--fields`: Path to the extracted fields JSON file

## Troubleshooting

If you encounter issues with section assignment or reference counts:

1. Check that field coordinates are properly extracted from the PDF
2. Verify that section-summary.json exists in at least one of the expected directories
3. Run the copy-section-summary.js script to synchronize summary files
4. Try increasing the max iterations (`-m`) for self-healing
5. Examine the sectionizer report for specific section deviations

## Development

When enhancing the PDF validation or sectionizer:

1. Coordinate-based analysis is implemented in `src/sectionizer/utils/bridgeAdapter.ts`
2. Reference count loading is handled in `src/sectionizer/utils/extractFieldsBySection.ts`
3. Self-healing logic is in `src/sectionizer/utils/enhanced-self-healing.ts`

## Conclusion

The SF-86 Form Validation Framework provides a robust foundation for working with SF-86 forms in both PDF and web formats. The framework ensures that all form sections can be properly validated, filled, and processed. 