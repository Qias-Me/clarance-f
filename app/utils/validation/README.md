# Subsection Validation System

This system provides tools to validate the mapping and implementation of subsections across the application. It helps identify issues such as unmapped subsections, orphaned subsections (with no fields), and incomplete implementations.

## Components

The validation system consists of the following components:

1. **SubsectionValidator.ts** - Core validation logic that analyzes subsection mapping
2. **SubsectionValidationDashboard.tsx** - React component for visualizing validation results
3. **subsectionValidation.ts** - Script for running validation and generating reports

## Usage

### Running Validation

You can run subsection validation using the following npm script:

```bash
npm run validate-subsections
```

This will:
- Analyze the field hierarchy and form context
- Generate validation reports in multiple formats (JSON, Markdown, Text)
- Save reports to the `reports/subsection-validation` directory
- Display a summary of validation results in the console

### Validation Dashboard

To use the validation dashboard in your application:

```tsx
import { SubsectionValidationDashboard } from '../components/validation/SubsectionValidationDashboard';
import fieldHierarchy from '../../public/field-hierarchy.json';

// Basic usage
<SubsectionValidationDashboard fieldHierarchy={fieldHierarchy} />

// With auto-refresh (every 60 seconds)
<SubsectionValidationDashboard 
  fieldHierarchy={fieldHierarchy} 
  refreshInterval={60000} 
/>
```

The dashboard provides three main views:
- **Summary** - Overview of subsection mapping status across sections
- **Issues** - List of warnings and errors that need attention
- **Section Details** - Detailed breakdown of each subsection by section

### Programmatic Usage

You can also use the validation system programmatically:

```tsx
import { createSubsectionValidator } from '../../utils/validation/SubsectionValidator';
import type { FieldHierarchy } from '../../../api/interfaces/FieldMetadata';

// Create validator
const validator = createSubsectionValidator(fieldHierarchy, contextData);

// Generate report
const report = validator.validateAllSubsections();

// Get specific section report
const section9Report = validator.validateSectionSubsections('9');

// Get suggestions
const suggestions = validator.getSuggestions();

// Generate markdown report
const markdown = validator.generateMarkdownReport();
```

## Validation Checks

The validation system performs the following checks:

1. **Mapped Subsections** - Verifies if each subsection is mapped in the application context
2. **Orphaned Subsections** - Identifies subsections with no fields mapped to them
3. **Field Count** - Counts fields mapped to each subsection and flags potential issues
4. **Section Coverage** - Analyzes the percentage of subsections properly mapped in each section

## Report Structure

The validation report includes:

- **Timestamp** - When the report was generated
- **Overall Metrics** - Total, mapped, unmapped, and orphaned subsection counts
- **Section Summary** - Mapping coverage by section
- **Issues** - List of errors and warnings that need attention
- **Subsection Details** - Detailed information about each subsection

## Integration

This validation system is designed to be used:

1. During development to identify mapping issues
2. In CI/CD pipelines to prevent regressions
3. As an admin tool in the application for real-time validation

## Extending

To extend the validation system:

1. Add new validation checks to `SubsectionValidator.ts`
2. Extend the report structure as needed
3. Update the dashboard component to display new validation data 