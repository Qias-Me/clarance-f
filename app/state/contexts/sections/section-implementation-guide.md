# Section Implementation Guide

This guide provides step-by-step instructions for implementing any SF-86 section using the standardized templates and following the proven Section29 patterns.

## 🎯 Overview

The section implementation process follows a standardized approach that ensures:
- **Consistency** across all 30 SF-86 sections
- **SF86FormContext Integration** for global coordination
- **Backward Compatibility** with existing patterns
- **Type Safety** with comprehensive TypeScript interfaces
- **Performance** with optimized React patterns

## 📋 Implementation Steps

### Step 1: Choose Your Section Template

**For New Sections:**
- Use `section-template.tsx` as your starting point
- Copy the template to create your section file (e.g., `section13.tsx`)

**For Existing Sections:**
- Follow the Section29 migration pattern from `section29-integrated.tsx`
- Use the integration framework to enhance existing functionality

### Step 2: Replace Template Placeholders

**Required Replacements:**
```typescript
// Replace these placeholders throughout the file:
[SECTION_X] → Your section name (e.g., Section13, Section15)
[sectionX] → Camelcase version (e.g., section13, section15)
[SECTION_NUMBER] → Section number (e.g., 13, 15)
[SECTION_NAME] → Section title (e.g., "Employment Activities", "Military History")
```

**Example for Section 13 (Employment Activities):**
```typescript
// Before
interface [SECTION_X]Data { ... }
const use[SECTION_X] = () => { ... }

// After
interface Section13Data { ... }
const useSection13 = () => { ... }
```

### Step 3: Define Section-Specific Interfaces

**Update Data Structure:**
```typescript
interface Section13Data {
  _id: number;
  employmentActivities: {
    hasActivities: Field<"YES" | "NO">;
    entries: EmploymentEntry[];
  };
  unemploymentPeriods: {
    hasUnemployment: Field<"YES" | "NO">;
    entries: UnemploymentEntry[];
  };
}
```

**Update Entry Types:**
```typescript
interface EmploymentEntry {
  _id: number | string;
  employer: Field<string>;
  position: Field<string>;
  address: Address;
  dateRange: DateRange;
  supervisor: {
    name: Field<string>;
    phone: Field<string>;
    email: Field<string>;
  };
  reasonForLeaving: Field<string>;
}
```

**Update Subsection Keys:**
```typescript
type Section13SubsectionKey = 
  | 'employmentActivities'
  | 'unemploymentPeriods';
```

### Step 4: Implement Initial State

**Create Default Data:**
```typescript
const createInitialSection13State = (): Section13Data => ({
  _id: 13,
  employmentActivities: {
    hasActivities: {
      id: "form1[0].Section13[0].RadioButtonList[0]",
      type: "radio",
      label: "Have you been employed in the last 7 years?",
      value: "NO",
      isDirty: false,
      isValid: true,
      errors: []
    },
    entries: []
  },
  unemploymentPeriods: {
    hasUnemployment: {
      id: "form1[0].Section13[0].RadioButtonList[1]",
      type: "radio",
      label: "Have you had any periods of unemployment longer than 30 days?",
      value: "NO",
      isDirty: false,
      isValid: true,
      errors: []
    },
    entries: []
  }
});
```

### Step 5: Create Entry Templates

**Implement Entry Creators:**
```typescript
const createEmploymentEntryTemplate = (entryIndex: number): EmploymentEntry => ({
  _id: Date.now() + Math.random(),
  employer: {
    id: `form1[0].Section13[0].TextField[${entryIndex * 10}]`,
    type: "text",
    label: "Employer Name",
    value: "",
    isDirty: false,
    isValid: true,
    errors: []
  },
  position: {
    id: `form1[0].Section13[0].TextField[${entryIndex * 10 + 1}]`,
    type: "text",
    label: "Position Title",
    value: "",
    isDirty: false,
    isValid: true,
    errors: []
  },
  // ... other fields
});
```

### Step 6: Customize CRUD Operations

**Update Method Names:**
```typescript
// Generic template methods
updateSubsectionFlag → updateEmploymentFlag
addEntry → addEmploymentEntry

// Section-specific methods
const updateEmploymentFlag = useCallback((subsectionKey: Section13SubsectionKey, hasValue: "YES" | "NO") => {
  setSection13Data(prev => {
    const updated = cloneDeep(prev);
    const subsection = updated[subsectionKey];

    if (subsection && 'hasActivities' in subsection) {
      subsection.hasActivities.value = hasValue;
    } else if (subsection && 'hasUnemployment' in subsection) {
      subsection.hasUnemployment.value = hasValue;
    }

    return updated;
  });
  
  integration.notifyChange('employment_flag_updated', { subsectionKey, hasValue });
}, [integration]);
```

### Step 7: Implement Section-Specific Validation

**Add Validation Rules:**
```typescript
const validateSection = useCallback((): ValidationResult => {
  const validationErrors: ValidationError[] = [];
  
  // Validate employment activities flag
  if (!section13Data.employmentActivities?.hasActivities?.value) {
    validationErrors.push({
      field: 'employmentActivities.hasActivities',
      message: 'Please answer about your employment activities',
      code: 'REQUIRED',
      severity: 'error'
    });
  }
  
  // If YES to employment, validate entries
  if (section13Data.employmentActivities?.hasActivities?.value === 'YES') {
    if (!section13Data.employmentActivities.entries || section13Data.employmentActivities.entries.length === 0) {
      validationErrors.push({
        field: 'employmentActivities.entries',
        message: 'Please provide your employment history',
        code: 'REQUIRED_CONDITIONAL',
        severity: 'error'
      });
    } else {
      // Validate each employment entry
      section13Data.employmentActivities.entries.forEach((entry, index) => {
        if (!entry.employer.value) {
          validationErrors.push({
            field: `employmentActivities.entries[${index}].employer`,
            message: `Employer name is required for employment ${index + 1}`,
            code: 'REQUIRED',
            severity: 'error'
          });
        }
        
        if (!entry.position.value) {
          validationErrors.push({
            field: `employmentActivities.entries[${index}].position`,
            message: `Position title is required for employment ${index + 1}`,
            code: 'REQUIRED',
            severity: 'error'
          });
        }
      });
    }
  }
  
  // Update local errors for backward compatibility
  const newErrors: Record<string, string> = {};
  validationErrors.forEach(error => {
    newErrors[error.field] = error.message;
  });
  setErrors(newErrors);
  
  return {
    isValid: validationErrors.length === 0,
    errors: validationErrors,
    warnings: []
  };
}, [section13Data]);
```

### Step 8: Update Context Interface

**Customize Method Names:**
```typescript
interface Section13ContextType {
  // Core State
  section13Data: Section13Data;
  isLoading: boolean;
  errors: Record<string, string>;
  isDirty: boolean;

  // Section-Specific CRUD Operations
  updateEmploymentFlag: (subsectionKey: Section13SubsectionKey, hasValue: "YES" | "NO") => void;
  addEmploymentEntry: (subsectionKey: Section13SubsectionKey) => void;
  removeEmploymentEntry: (subsectionKey: Section13SubsectionKey, entryIndex: number) => void;
  updateFieldValue: (subsectionKey: Section13SubsectionKey, entryIndex: number, fieldPath: string, newValue: any) => void;

  // Enhanced Entry Management
  getEmploymentCount: (subsectionKey: Section13SubsectionKey) => number;
  getEmploymentEntry: (subsectionKey: Section13SubsectionKey, entryIndex: number) => EmploymentEntry | null;
  moveEmploymentEntry: (subsectionKey: Section13SubsectionKey, fromIndex: number, toIndex: number) => void;
  duplicateEmploymentEntry: (subsectionKey: Section13SubsectionKey, entryIndex: number) => void;
  clearEmploymentEntry: (subsectionKey: Section13SubsectionKey, entryIndex: number) => void;
  bulkUpdateEmploymentFields: (subsectionKey: Section13SubsectionKey, entryIndex: number, fieldUpdates: Record<string, any>) => void;

  // Utility
  resetSection: () => void;
  loadSection: (data: Section13Data) => void;
  validateSection: () => ValidationResult;
  getChanges: () => any;
  
  // SF86Form Integration Capabilities (Standard)
  markComplete: () => void;
  markIncomplete: () => void;
  triggerGlobalValidation: () => ValidationResult;
  getGlobalFormState: () => any;
  navigateToSection: (sectionId: string) => void;
  saveForm: () => Promise<void>;
  
  // Event System (Standard)
  emitEvent: (event: any) => void;
  subscribeToEvents: (eventType: string, callback: Function) => () => void;
  notifyChange: (changeType: string, payload: any) => void;
}
```

### Step 9: Update SF86Form Integration

**Configure Integration:**
```typescript
const integration = useSection86FormIntegration(
  'section13',  // Section ID
  'Section 13: Employment Activities',  // Section name
  section13Data,
  setSection13Data,
  validateSection,
  getChanges
);
```

### Step 10: Create TypeScript Interfaces

**Create Interface File:**
```typescript
// api/interfaces/sections/section13.ts
import type { Field } from '../formDefinition2.0';

export interface Section13 {
  _id: number;
  employmentActivities: {
    hasActivities: Field<"YES" | "NO">;
    entries: EmploymentEntry[];
  };
  unemploymentPeriods: {
    hasUnemployment: Field<"YES" | "NO">;
    entries: UnemploymentEntry[];
  };
}

export interface EmploymentEntry {
  _id: number | string;
  employer: Field<string>;
  position: Field<string>;
  address: Address;
  dateRange: DateRange;
  supervisor: {
    name: Field<string>;
    phone: Field<string>;
    email: Field<string>;
  };
  reasonForLeaving: Field<string>;
}

// ... other interfaces
```

## 🧪 Testing Your Implementation

### Step 1: Create Test File

```typescript
// __tests__/section13.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { Section13Provider, useSection13 } from '../section13';
import { CompleteSF86FormProvider } from '../../SF86FormContext';

const TestWrapper = ({ children }) => (
  <CompleteSF86FormProvider>
    <Section13Provider>
      {children}
    </Section13Provider>
  </CompleteSF86FormProvider>
);

test('section13 basic functionality', () => {
  const TestComponent = () => {
    const { section13Data, updateEmploymentFlag, addEmploymentEntry } = useSection13();
    
    return (
      <div>
        <button onClick={() => updateEmploymentFlag('employmentActivities', 'YES')}>
          Yes to Employment
        </button>
        <button onClick={() => addEmploymentEntry('employmentActivities')}>
          Add Employment
        </button>
        <div data-testid="employment-count">
          {section13Data.employmentActivities.entries.length}
        </div>
      </div>
    );
  };
  
  render(<TestComponent />, { wrapper: TestWrapper });
  
  // Test flag update
  fireEvent.click(screen.getByText('Yes to Employment'));
  
  // Test entry addition
  fireEvent.click(screen.getByText('Add Employment'));
  expect(screen.getByTestId('employment-count')).toHaveTextContent('1');
});

test('section13 integration features', () => {
  const TestComponent = () => {
    const { markComplete, triggerGlobalValidation, navigateToSection } = useSection13();
    
    return (
      <div>
        <button onClick={markComplete}>Mark Complete</button>
        <button onClick={() => triggerGlobalValidation()}>Validate All</button>
        <button onClick={() => navigateToSection('section14')}>Next Section</button>
      </div>
    );
  };
  
  render(<TestComponent />, { wrapper: TestWrapper });
  
  // Test integration features
  expect(screen.getByText('Mark Complete')).toBeInTheDocument();
  expect(screen.getByText('Validate All')).toBeInTheDocument();
  expect(screen.getByText('Next Section')).toBeInTheDocument();
});
```

## ✅ Implementation Checklist

### Required Steps:
- [ ] **Copy template** and rename to your section
- [ ] **Replace placeholders** with section-specific names
- [ ] **Define interfaces** for your section's data structure
- [ ] **Implement initial state** with proper field IDs
- [ ] **Create entry templates** with PDF-compliant field IDs
- [ ] **Customize CRUD operations** for your section's needs
- [ ] **Add validation rules** specific to your section
- [ ] **Update context interface** with section-specific method names
- [ ] **Configure SF86Form integration** with correct section ID and name
- [ ] **Create TypeScript interfaces** in api/interfaces/sections/

### Testing Steps:
- [ ] **Create test file** following the testing patterns
- [ ] **Test basic CRUD operations** (add, remove, update entries)
- [ ] **Test validation logic** with various scenarios
- [ ] **Test integration features** (markComplete, navigation, etc.)
- [ ] **Test backward compatibility** if migrating existing section
- [ ] **Verify field ID accuracy** for PDF compliance

### Documentation Steps:
- [ ] **Document section-specific patterns** if any
- [ ] **Add usage examples** for complex operations
- [ ] **Update migration guides** if needed
- [ ] **Add to section registry** for global form coordination

## 🎯 Best Practices

### 1. Field ID Generation
- Follow PDF field ID patterns from existing sections
- Ensure unique IDs across all entries
- Use consistent numbering schemes

### 2. Validation Logic
- Implement conditional validation based on YES/NO flags
- Provide clear, user-friendly error messages
- Validate all required fields for each entry

### 3. Performance Optimization
- Use useCallback for all methods
- Use useMemo for computed values
- Implement proper dependency arrays

### 4. Type Safety
- Define strict TypeScript interfaces
- Use proper generic types for Field<T>
- Maintain type consistency across the section

### 5. Integration Patterns
- Always notify integration of changes
- Use proper event types for cross-section communication
- Implement graceful fallbacks for integration features

## 🚀 Ready to Scale

Following this guide ensures that your section implementation:
- **Integrates seamlessly** with the SF86FormContext
- **Maintains consistency** with proven Section29 patterns
- **Provides full functionality** including CRUD operations and validation
- **Supports advanced features** like auto-save, navigation, and events
- **Is production-ready** with comprehensive testing and type safety

This standardized approach enables rapid implementation of all 30 SF-86 sections while maintaining high quality and consistency!
