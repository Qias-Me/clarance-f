# SF-86 Form State Management

Comprehensive TypeScript interfaces and utilities for managing SF-86 form data in online form applications.

## Overview

This module provides a complete type-safe solution for working with SF-86 form data, featuring:

- **Hierarchical Structure**: Section → Subsection → Entry → Fields
- **Type Safety**: Full TypeScript support with proper enums and interfaces
- **Validation**: Built-in validation rules and business logic
- **Conversion**: Utilities to convert between different data formats
- **Form Management**: State management helpers for online forms

## Architecture

### Hierarchical Organization

```
SF86Form
├── metadata (form-level info)
├── sections (1-30)
│   ├── SF86Section
│   │   ├── subsections (A, B, C, etc.)
│   │   │   ├── SF86Subsection
│   │   │   │   ├── entries (1, 2, 3, etc.)
│   │   │   │   │   ├── SF86Entry
│   │   │   │   │   │   └── fields[]
│   │   │   │   │   └── SF86FormField
│   │   │   │   └── standaloneFields[]
│   │   │   └── standaloneFields[]
│   │   └── standaloneFields[]
│   └── navigation (current section, progress)
└── validationMessages[]
```

### Key Interfaces

#### `SF86FormField`
The core field interface with all properties needed for form rendering:
- Basic metadata (id, name, value, type)
- Spatial information (coordinates, page)
- Categorization (section, subsection, entry)
- Validation (state, messages, rules)
- UI properties (display name, help text, visibility)

#### `SF86Section`
Complete section with subsections and validation:
- Section metadata and configuration
- Hierarchical field organization
- Completion tracking
- Validation state management

#### `SF86Form`
Complete form structure with navigation and state:
- All sections organized hierarchically
- Form-level metadata and validation
- Navigation state and progress tracking
- Submission state management

## Usage Examples

### Basic Usage

```typescript
import { 
  createSF86Form, 
  validateForm, 
  updateFormCompletion,
  type SF86Form 
} from './src/sectionizer/new-state';

// Convert existing categorized fields
const form: SF86Form = createSF86Form(categorizedFields);

// Update completion percentages
const updatedForm = updateFormCompletion(form);

// Validate the form
const validation = validateForm(updatedForm);
```

### Working with Sections

```typescript
// Access a specific section
const section7 = form.sections[7]; // "Where You Have Lived"

// Check section properties
console.log(section7.sectionName);
console.log(section7.hasSubsections);
console.log(section7.completionPercentage);

// Access subsections
const subsectionA = section7.subsections['A'];
const firstEntry = subsectionA.entries[0];
```

### Field Manipulation

```typescript
// Find a specific field
const addressField = firstEntry.fields.find(f => 
  f.name.includes('address')
);

// Update field value
if (addressField) {
  addressField.value = '123 Main Street';
  addressField.validationState = ValidationState.VALID;
}

// Add validation
const validation = validateField(addressField, {
  required: true,
  minLength: 5,
  pattern: /^[a-zA-Z0-9\s]+$/
});
```

### Loading from Section Exports

```typescript
import { loadFormFromSectionExports } from './SF86FormConverter';

// Load form from exported section files
const form = await loadFormFromSectionExports('./output/sections/');

// Convert legacy categorized fields
const form2 = convertLegacyFieldsToForm(legacyFields);
```

## Field Types

The system supports all SF-86 field types:

```typescript
enum SF86FieldType {
  TEXT = 'PDFTextField',
  RADIO_GROUP = 'PDFRadioGroup', 
  CHECKBOX = 'PDFCheckBox',
  DROPDOWN = 'PDFDropdown',
  DATE = 'PDFDateField',
  SIGNATURE = 'PDFSignature',
  UNKNOWN = 'unknown'
}
```

## Validation

### Built-in Validation Patterns

```typescript
export const VALIDATION_PATTERNS = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE: /^\+?[\d\s\-\(\)]{10,}$/,
  SSN: /^\d{3}-?\d{2}-?\d{4}$/,
  ZIP_CODE: /^\d{5}(-\d{4})?$/,
  DATE: /^\d{1,2}\/\d{1,2}\/\d{4}$/,
  PASSPORT: /^[A-Z0-9]{6,9}$/,
  NAME: /^[a-zA-Z\s\-'\.]{1,50}$/
};
```

### Custom Validation Rules

```typescript
const fieldRules: FieldValidationRule = {
  required: true,
  minLength: 2,
  maxLength: 50,
  pattern: VALIDATION_PATTERNS.NAME,
  customValidator: (value) => {
    if (value === 'John Doe') {
      return {
        isValid: false,
        errors: ['Please enter your real name'],
        warnings: []
      };
    }
    return { isValid: true, errors: [], warnings: [] };
  }
};
```

## Section Configuration

### Section Names and Properties

```typescript
// Built-in section names
export const SF86_SECTION_NAMES: Record<number, string> = {
  1: "Information About You",
  2: "Citizenship",
  3: "Where You Have Lived",
  // ... all 30 sections
};

// Sections without subsections (1-8)
export const SECTIONS_WITHOUT_SUBSECTIONS = [1, 2, 3, 4, 5, 6, 7, 8];

// Repeatable sections
export const REPEATABLE_SECTIONS = [11, 12, 13, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29];
```

## Data Conversion

### From Legacy Format

```typescript
// Convert from existing CategorizedField format
const sf86Field = convertLegacyField(legacyField);
const form = convertLegacyFieldsToForm(legacyFields);
```

### From Section Exports

```typescript
// Load from section export JSON files
const form = await loadFormFromSectionExports('./output/sections/');

// Convert section export data
const form2 = convertSectionExportsToForm(sectionExportData);
```

### Serialization

```typescript
// Serialize form to JSON
const jsonString = serializeForm(form);

// Deserialize from JSON
const form = deserializeForm(jsonString);

// Export to section files
await exportFormToSectionFiles(form, './output/form-sections/');
```

## Form State Management

### Navigation

```typescript
// Access navigation state
const nav = form.navigation;
console.log(nav.currentSection);
console.log(nav.completedSections);
console.log(nav.availableSections);

// Update navigation
nav.currentSection = 8;
nav.completedSections.push(7);
```

### Completion Tracking

```typescript
// Update completion percentages
const updatedForm = updateFormCompletion(form);

// Check section completion
const section = form.sections[7];
console.log(`Section 7 is ${section.completionPercentage}% complete`);
```

### Validation States

```typescript
// Update all validation states
const validatedForm = updateValidationStates(form);

// Check form validity
if (form.metadata.validationState === ValidationState.VALID) {
  console.log('Form is ready for submission');
}
```

## Type Guards

```typescript
// Check if object is a valid SF86Form
if (isSF86Form(data)) {
  // TypeScript knows data is SF86Form
  console.log(data.metadata.version);
}

// Check if object is a valid SF86Section
if (isSF86Section(obj)) {
  console.log(obj.sectionName);
}

// Check if object is a valid SF86FormField
if (isSF86FormField(field)) {
  console.log(field.displayName);
}
```

## Integration with Existing Code

This module is designed to work seamlessly with the existing SF-86 sectionizer:

1. **Import existing data**: Use conversion utilities to transform categorized fields
2. **Maintain compatibility**: All existing field properties are preserved
3. **Enhance functionality**: Add form-specific features like validation and UI state
4. **Export compatibility**: Can export back to section-based JSON format

## Files

- `SF86FormTypes.ts` - Core type definitions and interfaces
- `SF86FormHelpers.ts` - Utility functions and form management
- `SF86FormValidation.ts` - Validation rules and functions
- `SF86FormConverter.ts` - Data conversion utilities
- `index.ts` - Main exports and convenience functions
- `README.md` - This documentation
