# SF-86 Scalable Architecture Best Practices

Comprehensive guide covering best practices, coding standards, performance optimization, and architectural patterns for the scalable SF-86 form architecture.

## 🎯 Overview

This guide establishes best practices for:
- **Code Organization**: Structure and organization patterns
- **Performance Optimization**: Memory management and efficiency
- **Type Safety**: TypeScript patterns and interfaces
- **Testing**: Testing strategies and patterns
- **Error Handling**: Robust error handling and recovery
- **Accessibility**: Accessibility compliance and standards

## 📋 Code Organization Best Practices

### 1. File Structure Standards

```
app/state/contexts/sections/
├── shared/                          # Shared utilities and interfaces
│   ├── base-interfaces.ts          # Core type definitions
│   ├── section-context-integration.ts # Integration framework
│   ├── field-id-generator.ts       # Field ID generation utilities
│   └── validation-utils.ts         # Validation helpers
├── section7.tsx                    # Individual section implementations
├── section13.tsx
├── section29.tsx
├── section-template.tsx            # Template for new sections
└── index.ts                        # Barrel exports
```

### 2. Naming Conventions

```typescript
// ✅ Good: Consistent naming patterns
interface Section7Data { ... }
interface Section7ContextType { ... }
const Section7Provider = ({ children }) => { ... };
const useSection7 = () => { ... };

// ❌ Bad: Inconsistent naming
interface ResidenceData { ... }
interface Section7Context { ... }
const ResidenceProvider = ({ children }) => { ... };
const useResidenceHistory = () => { ... };
```

### 3. Interface Organization

```typescript
// ✅ Good: Organized interface structure
interface Section7Data {
  _id: number;                      // Section identifier
  subsectionName: {                 // Logical grouping
    hasFlag: Field<"YES" | "NO">;   // YES/NO flag
    entries: EntryType[];           // Entry array
  };
}

interface EntryType {
  _id: number | string;             // Entry identifier
  requiredField: Field<string>;     // Required fields first
  optionalField: Field<string>;     // Optional fields after
  complexField: ComplexType;        // Complex types last
}
```

### 4. Import Organization

```typescript
// ✅ Good: Organized imports
// React imports first
import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';

// Third-party imports
import cloneDeep from 'lodash/cloneDeep';
import set from 'lodash/set';

// Internal imports - types first
import type { Field, ValidationResult } from '../shared/base-interfaces';

// Internal imports - utilities
import { useSection86FormIntegration } from '../shared/section-context-integration';
import { generateFieldId } from '../shared/field-id-generator';
```

## ⚡ Performance Best Practices

### 1. State Management Optimization

```typescript
// ✅ Good: Efficient state updates
const updateFieldValue = useCallback((entryIndex: number, fieldPath: string, newValue: any) => {
  setSection7Data(prev => {
    const updated = cloneDeep(prev);
    set(updated, `entries[${entryIndex}].${fieldPath}`, newValue);
    return updated;
  });
}, []);

// ❌ Bad: Inefficient state updates
const updateFieldValue = (entryIndex: number, fieldPath: string, newValue: any) => {
  const newData = { ...section7Data };
  // Manual deep copying and updating
  setSection7Data(newData);
};
```

### 2. Memoization Patterns

```typescript
// ✅ Good: Proper memoization
const contextValue = useMemo(() => ({
  section7Data,
  updateFieldValue,
  addEntry,
  removeEntry,
  // Integration methods
  markComplete: integration.markComplete,
  navigateToSection: integration.navigateToSection
}), [section7Data, updateFieldValue, addEntry, removeEntry, integration]);

// ✅ Good: Computed values
const entryCount = useMemo(() => {
  return section7Data.entries.length;
}, [section7Data.entries]);

// ❌ Bad: No memoization
const contextValue = {
  section7Data,
  updateFieldValue: (index, path, value) => { /* inline function */ },
  entryCount: section7Data.entries.length // Computed on every render
};
```

### 3. useCallback Usage

```typescript
// ✅ Good: Stable function references
const addEntry = useCallback(() => {
  setSection7Data(prev => {
    const updated = cloneDeep(prev);
    updated.entries.push(createEntryTemplate(updated.entries.length));
    return updated;
  });
  
  integration.notifyChange('entry_added', {});
}, [integration]);

// ❌ Bad: New function on every render
const addEntry = () => {
  // Function recreated on every render
};
```

### 4. Memory Management

```typescript
// ✅ Good: Cleanup subscriptions
useEffect(() => {
  const unsubscribe = subscribeToEvents('SECTION_UPDATE', handleSectionUpdate);
  
  return () => {
    unsubscribe(); // Cleanup subscription
  };
}, [subscribeToEvents]);

// ✅ Good: Avoid memory leaks in integration
const integration = useSection86FormIntegration(
  'section7',
  'Section 7: Residence History',
  section7Data,
  setSection7Data,
  validateSection,
  getChanges
);

// Integration hook handles cleanup automatically
```

## 🔒 Type Safety Best Practices

### 1. Strict TypeScript Configuration

```json
// tsconfig.json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "noImplicitReturns": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "exactOptionalPropertyTypes": true
  }
}
```

### 2. Interface Design

```typescript
// ✅ Good: Specific, well-defined interfaces
interface Field<T> {
  id: string;
  type: 'text' | 'radio' | 'checkbox' | 'date' | 'select' | 'textarea' | 'tel';
  label: string;
  value: T;
  isDirty: boolean;
  isValid: boolean;
  errors: string[];
}

interface ValidationError {
  field: string;
  message: string;
  code: 'REQUIRED' | 'INVALID_FORMAT' | 'CROSS_SECTION_CONFLICT';
  severity: 'error' | 'warning';
}

// ❌ Bad: Loose, any-based interfaces
interface Field {
  id: any;
  value: any;
  errors: any[];
}
```

### 3. Generic Type Usage

```typescript
// ✅ Good: Proper generic usage
interface SectionData<T> {
  _id: number;
  data: T;
}

interface SectionContextType<T> {
  sectionData: SectionData<T>;
  updateData: (data: Partial<T>) => void;
  validateSection: () => ValidationResult;
}

// ✅ Good: Constrained generics
type SectionId = `section${number}`;
type YesNoValue = "YES" | "NO";
```

### 4. Type Guards and Validation

```typescript
// ✅ Good: Type guards for runtime safety
const isValidSectionData = (data: any): data is Section7Data => {
  return (
    data &&
    typeof data._id === 'number' &&
    data.residenceHistory &&
    Array.isArray(data.residenceHistory.entries)
  );
};

// ✅ Good: Runtime validation
const loadSection = useCallback((data: unknown) => {
  if (!isValidSectionData(data)) {
    throw new Error('Invalid section data format');
  }
  
  setSection7Data(cloneDeep(data));
}, []);
```

## 🧪 Testing Best Practices

### 1. Test Organization

```typescript
// ✅ Good: Organized test structure
describe('Section7 Context', () => {
  describe('CRUD Operations', () => {
    test('should add residence entry', () => { /* ... */ });
    test('should remove residence entry', () => { /* ... */ });
    test('should update field value', () => { /* ... */ });
  });

  describe('Integration Features', () => {
    test('should mark section complete', () => { /* ... */ });
    test('should trigger global validation', () => { /* ... */ });
    test('should navigate to next section', () => { /* ... */ });
  });

  describe('Validation Logic', () => {
    test('should validate required fields', () => { /* ... */ });
    test('should validate conditional logic', () => { /* ... */ });
  });
});
```

### 2. Test Data Management

```typescript
// ✅ Good: Centralized test data
const TEST_DATA = {
  VALID_RESIDENCE_ENTRY: {
    _id: 1,
    address: {
      street: { value: '123 Test St', id: 'test-street', type: 'text', label: 'Street' },
      city: { value: 'Test City', id: 'test-city', type: 'text', label: 'City' }
    }
  },
  
  INVALID_RESIDENCE_ENTRY: {
    _id: 2,
    address: {
      street: { value: '', id: 'test-street', type: 'text', label: 'Street' },
      city: { value: '', id: 'test-city', type: 'text', label: 'City' }
    }
  }
};

// ✅ Good: Test utilities
const createTestWrapper = ({ initialData = null } = {}) => {
  return ({ children }) => (
    <CompleteSF86FormProvider>
      <Section7Provider initialData={initialData}>
        {children}
      </Section7Provider>
    </CompleteSF86FormProvider>
  );
};
```

### 3. Integration Testing

```typescript
// ✅ Good: Test integration features
test('should integrate with SF86FormContext', async () => {
  const { result } = renderHook(() => useSection7(), {
    wrapper: createTestWrapper()
  });

  // Test integration methods are available
  expect(typeof result.current.markComplete).toBe('function');
  expect(typeof result.current.triggerGlobalValidation).toBe('function');
  expect(typeof result.current.navigateToSection).toBe('function');

  // Test integration functionality
  act(() => {
    result.current.markComplete();
  });

  // Verify integration behavior
  expect(mockMarkComplete).toHaveBeenCalledWith('section7');
});
```

## 🚨 Error Handling Best Practices

### 1. Graceful Error Handling

```typescript
// ✅ Good: Comprehensive error handling
const updateFieldValue = useCallback((entryIndex: number, fieldPath: string, newValue: any) => {
  try {
    setSection7Data(prev => {
      const updated = cloneDeep(prev);
      
      // Validate indices
      if (entryIndex < 0 || entryIndex >= updated.entries.length) {
        throw new Error(`Invalid entry index: ${entryIndex}`);
      }
      
      // Validate field path
      if (!fieldPath || typeof fieldPath !== 'string') {
        throw new Error(`Invalid field path: ${fieldPath}`);
      }
      
      set(updated, `entries[${entryIndex}].${fieldPath}`, newValue);
      return updated;
    });
    
    integration.notifyChange('field_updated', { entryIndex, fieldPath, newValue });
  } catch (error) {
    console.error('Error updating field value:', error);
    setErrors(prev => ({
      ...prev,
      [`entries[${entryIndex}].${fieldPath}`]: 'Failed to update field'
    }));
  }
}, [integration]);
```

### 2. Integration Error Handling

```typescript
// ✅ Good: Fallback for integration failures
const useSection7WithFallback = () => {
  const context = useContext(Section7Context);
  
  if (!context) {
    throw new Error('useSection7 must be used within a Section7Provider');
  }
  
  // Provide fallbacks for integration methods
  const markComplete = useCallback(() => {
    try {
      context.markComplete();
    } catch (error) {
      console.warn('Integration markComplete failed, using fallback:', error);
      // Fallback behavior
      console.log('Section7 marked as complete (fallback)');
    }
  }, [context]);
  
  return {
    ...context,
    markComplete
  };
};
```

### 3. Validation Error Handling

```typescript
// ✅ Good: Structured validation errors
const validateSection = useCallback((): ValidationResult => {
  const validationErrors: ValidationError[] = [];
  
  try {
    // Validate section structure
    if (!section7Data.residenceHistory) {
      validationErrors.push({
        field: 'residenceHistory',
        message: 'Residence history data is missing',
        code: 'REQUIRED',
        severity: 'error'
      });
      
      return { isValid: false, errors: validationErrors, warnings: [] };
    }
    
    // Validate entries
    section7Data.residenceHistory.entries.forEach((entry, index) => {
      validateResidenceEntry(entry, index, validationErrors);
    });
    
  } catch (error) {
    console.error('Validation error:', error);
    validationErrors.push({
      field: 'section',
      message: 'Validation failed due to internal error',
      code: 'VALIDATION_ERROR',
      severity: 'error'
    });
  }
  
  return {
    isValid: validationErrors.length === 0,
    errors: validationErrors,
    warnings: []
  };
}, [section7Data]);
```

## ♿ Accessibility Best Practices

### 1. Semantic HTML and ARIA

```typescript
// ✅ Good: Proper ARIA labels and roles
const ResidenceForm = () => {
  const { section7Data, updateFieldValue } = useSection7();
  
  return (
    <section aria-labelledby="section7-heading" role="main">
      <h2 id="section7-heading">Section 7: Residence History</h2>
      
      <fieldset>
        <legend>Have you lived at your current address for at least 3 years?</legend>
        <div role="radiogroup" aria-labelledby="residence-history-question">
          <label>
            <input
              type="radio"
              name="residenceHistory"
              value="YES"
              aria-describedby="residence-history-help"
            />
            Yes
          </label>
          <label>
            <input
              type="radio"
              name="residenceHistory"
              value="NO"
              aria-describedby="residence-history-help"
            />
            No
          </label>
        </div>
        <div id="residence-history-help" className="help-text">
          If no, you will need to provide your residence history for the past 3 years.
        </div>
      </fieldset>
    </section>
  );
};
```

### 2. Keyboard Navigation

```typescript
// ✅ Good: Keyboard navigation support
const ResidenceEntryForm = ({ entryIndex }) => {
  const { updateFieldValue, removeResidenceEntry } = useSection7();
  
  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'Delete' && event.ctrlKey) {
      event.preventDefault();
      removeResidenceEntry(entryIndex);
    }
  };
  
  return (
    <div
      className="residence-entry"
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="group"
      aria-label={`Residence ${entryIndex + 1}`}
    >
      {/* Form fields */}
    </div>
  );
};
```

### 3. Error Announcements

```typescript
// ✅ Good: Accessible error handling
const ValidationErrors = ({ errors }) => {
  return (
    <div
      role="alert"
      aria-live="polite"
      aria-atomic="true"
      className="validation-errors"
    >
      {errors.length > 0 && (
        <>
          <h3>Please correct the following errors:</h3>
          <ul>
            {errors.map((error, index) => (
              <li key={index}>
                <a href={`#${error.field}`}>
                  {error.message}
                </a>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
};
```

## 📊 Performance Monitoring

### 1. Performance Metrics

```typescript
// ✅ Good: Performance monitoring
const usePerformanceMonitoring = (sectionId: string) => {
  useEffect(() => {
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry) => {
        if (entry.name.includes(sectionId)) {
          console.log(`${sectionId} performance:`, {
            name: entry.name,
            duration: entry.duration,
            startTime: entry.startTime
          });
        }
      });
    });
    
    observer.observe({ entryTypes: ['measure', 'navigation'] });
    
    return () => observer.disconnect();
  }, [sectionId]);
};
```

### 2. Memory Usage Monitoring

```typescript
// ✅ Good: Memory monitoring
const useMemoryMonitoring = () => {
  useEffect(() => {
    const checkMemory = () => {
      if ('memory' in performance) {
        const memory = (performance as any).memory;
        console.log('Memory usage:', {
          used: memory.usedJSHeapSize,
          total: memory.totalJSHeapSize,
          limit: memory.jsHeapSizeLimit
        });
      }
    };
    
    const interval = setInterval(checkMemory, 30000); // Check every 30 seconds
    
    return () => clearInterval(interval);
  }, []);
};
```

## 🎯 Code Quality Standards

### 1. ESLint Configuration

```json
{
  "extends": [
    "@typescript-eslint/recommended",
    "react-hooks/recommended"
  ],
  "rules": {
    "@typescript-eslint/no-unused-vars": "error",
    "@typescript-eslint/explicit-function-return-type": "warn",
    "react-hooks/exhaustive-deps": "error",
    "prefer-const": "error",
    "no-var": "error"
  }
}
```

### 2. Code Documentation

```typescript
/**
 * Updates a field value in a residence entry
 * 
 * @param entryIndex - Index of the residence entry (0-based)
 * @param fieldPath - Dot-notation path to the field (e.g., 'address.street.value')
 * @param newValue - New value to set
 * 
 * @example
 * updateFieldValue(0, 'address.street.value', '123 Main St');
 * updateFieldValue(1, 'dateRange.from.date.value', '2020-01-01');
 */
const updateFieldValue = useCallback((
  entryIndex: number,
  fieldPath: string,
  newValue: any
): void => {
  // Implementation
}, [integration]);
```

### 3. Consistent Formatting

```typescript
// ✅ Good: Consistent formatting with Prettier
const contextValue: Section7ContextType = {
  // Core State
  section7Data,
  isLoading,
  errors,
  isDirty,

  // CRUD Operations
  updateResidenceHistoryFlag,
  addResidenceEntry,
  removeResidenceEntry,
  updateFieldValue,

  // Integration Features
  markComplete: integration.markComplete,
  navigateToSection: integration.navigateToSection,
  saveForm: integration.saveForm
};
```

These best practices ensure that the scalable SF-86 form architecture maintains high code quality, performance, accessibility, and maintainability across all implementations.
