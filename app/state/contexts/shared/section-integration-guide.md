# Section Context Integration Framework Guide

This guide explains how to integrate individual section contexts with the central SF86FormContext using the Section Context Integration Framework.

## 🎯 Overview

The Section Context Integration Framework provides seamless bidirectional data synchronization between individual section contexts and the central SF86FormContext while maintaining section independence.

## 🏗️ Architecture

```
Individual Section Context
├── Section-specific state and operations
├── Integration Framework (this module)
│   ├── Bidirectional data sync
│   ├── Event-driven communication
│   └── Global form coordination
└── Central SF86FormContext
    ├── Global form state
    ├── Cross-section coordination
    └── Unified validation/persistence
```

## 📋 Integration Methods

### Method 1: Using useSection86FormIntegration Hook (Recommended)

For existing section contexts like Section29, add integration with minimal changes:

```tsx
// In your existing section context (e.g., section29.tsx)
import { useSection86FormIntegration } from '../shared/section-context-integration';

export const Section29Provider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [section29Data, setSection29Data] = useState<Section29>(defaultSection29Data);
  
  // Add SF86Form integration
  const integration = useSection86FormIntegration(
    'section29',
    'Section 29: Associations',
    section29Data,
    setSection29Data,
    validateSection, // Optional: your existing validation function
    getChanges      // Optional: your existing change tracking function
  );
  
  // Your existing CRUD operations remain unchanged
  const updateSubsectionFlag = useCallback((subsectionKey: string, value: "YES" | "NO") => {
    // Your existing implementation
  }, []);
  
  // Enhanced context value with integration
  const contextValue = {
    // Your existing context properties
    section29Data,
    updateSubsectionFlag,
    // ... other operations
    
    // New integration capabilities
    markComplete: integration.markComplete,
    markIncomplete: integration.markIncomplete,
    triggerGlobalValidation: integration.triggerGlobalValidation,
    getGlobalFormState: integration.getGlobalFormState,
    navigateToSection: integration.navigateToSection,
    saveForm: integration.saveForm
  };
  
  return (
    <Section29Context.Provider value={contextValue}>
      {children}
    </Section29Context.Provider>
  );
};
```

### Method 2: Using createIntegratedSectionContext Factory

For new section contexts, use the factory function:

```tsx
// Create a new integrated section context
import { createIntegratedSectionContext } from '../shared/section-context-integration';

const defaultSection7Data: Section7 = {
  // Your default data structure
};

const {
  SectionContext: Section7Context,
  SectionProvider: Section7Provider,
  useSection: useSection7Base
} = createIntegratedSectionContext('section7', 'Section 7: Residence History', defaultSection7Data);

// Enhance with section-specific operations
export const useSection7 = () => {
  const { sectionData, setSectionData, integration } = useSection7Base();
  
  // Add section-specific CRUD operations
  const addAddressEntry = useCallback(() => {
    setSectionData(prevData => {
      // Your implementation
    });
  }, [setSectionData]);
  
  return {
    section7Data: sectionData,
    addAddressEntry,
    // Integration capabilities
    ...integration
  };
};

export { Section7Provider };
```

### Method 3: Using withSF86FormIntegration HOC

For wrapping existing providers:

```tsx
import { withSF86FormIntegration } from '../shared/section-context-integration';
import { ExistingSectionProvider } from './existing-section';

export const IntegratedSectionProvider = withSF86FormIntegration(
  ExistingSectionProvider,
  'section10',
  'Section 10: Employment Activities'
);
```

## 🔄 Data Synchronization

### Automatic Bidirectional Sync

The framework automatically handles:

1. **Section → Central**: When section data changes, it's synced to central form
2. **Central → Section**: When central form loads data, sections are updated
3. **Cross-Section**: Sections can communicate through the central form

```tsx
// In your section component
const { section29Data, saveForm, getGlobalFormState } = useSection29();

// Check global form state
const globalState = getGlobalFormState();
console.log('Form is dirty:', globalState.isDirty);
console.log('Completed sections:', globalState.completedSections);

// Save entire form (all sections)
const handleSaveAll = async () => {
  try {
    await saveForm();
    console.log('All sections saved successfully');
  } catch (error) {
    console.error('Save failed:', error);
  }
};
```

## ✅ Validation Integration

### Section Validation with Global Coordination

```tsx
// In your section context
const validateSection = useCallback((): ValidationResult => {
  const errors: ValidationError[] = [];
  
  // Your section-specific validation logic
  if (!section29Data.terrorismOrganizations?.hasAssociation?.value) {
    errors.push({
      field: 'terrorismOrganizations.hasAssociation',
      message: 'This field is required',
      code: 'REQUIRED',
      severity: 'error'
    });
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings: []
  };
}, [section29Data]);

// In your component
const { triggerGlobalValidation } = useSection29();

const handleValidateAll = () => {
  const result = triggerGlobalValidation();
  if (!result.isValid) {
    console.log('Form has validation errors:', result.errors);
  }
};
```

## 🧭 Navigation Integration

### Section-to-Section Navigation

```tsx
// In your section component
const { navigateToSection, markComplete } = useSection29();

const handleCompleteSection = () => {
  // Mark current section as complete
  markComplete();
  
  // Navigate to next section
  navigateToSection('section30');
};

const handleGoToEmployment = () => {
  navigateToSection('section13');
};
```

## 📊 Change Tracking Integration

### Global Change Tracking

```tsx
// Using the change tracking hook
import { useSectionChangeTracking } from '../shared/section-context-integration';

const MySection: React.FC = () => {
  const { section29Data } = useSection29();
  const { isDirty, getChanges, resetToInitial } = useSectionChangeTracking(
    'section29',
    section29Data,
    initialSection29Data
  );
  
  return (
    <div>
      <p>Section has changes: {isDirty ? 'Yes' : 'No'}</p>
      <button onClick={resetToInitial}>Reset to Initial</button>
      <button onClick={() => console.log(getChanges())}>Show Changes</button>
    </div>
  );
};
```

## 🎛️ Event-Driven Communication

### Cross-Section Communication

```tsx
// In Section A - emit an event
const { emitEvent } = useSection29();

const notifyOtherSections = () => {
  emitEvent({
    type: 'SECTION_UPDATE',
    sectionId: 'section29',
    payload: { 
      action: 'terrorism_flag_changed',
      value: 'YES',
      affectedSections: ['section30'] 
    }
  });
};

// In Section B - listen for events
const { subscribeToEvents } = useSection30();

useEffect(() => {
  const unsubscribe = subscribeToEvents('SECTION_UPDATE', (event) => {
    if (event.payload.action === 'terrorism_flag_changed') {
      console.log('Section 29 terrorism flag changed:', event.payload.value);
      // React to the change
    }
  });
  
  return unsubscribe;
}, [subscribeToEvents]);
```

## 🔧 Advanced Integration Patterns

### Conditional Section Activation

```tsx
// Activate section based on other section data
const { getGlobalFormState, markComplete } = useSection30();

useEffect(() => {
  const globalState = getGlobalFormState();
  const section29Data = globalState.formData.section29;
  
  // Only activate if Section 29 has terrorism associations
  if (section29Data?.terrorismOrganizations?.hasAssociation?.value === 'YES') {
    // This section is now relevant
    console.log('Section 30 is now active due to Section 29 data');
  } else {
    // Auto-complete if not relevant
    markComplete();
  }
}, [getGlobalFormState, markComplete]);
```

### Dependency Resolution

```tsx
// Check and resolve dependencies
const { sf86Form } = useSection29();

const checkDependencies = () => {
  const dependencies = sf86Form.checkDependencies('section29');
  
  if (dependencies.length > 0) {
    console.log('Section 29 depends on:', dependencies);
    
    // Resolve dependencies
    dependencies.forEach(depSection => {
      sf86Form.resolveDependency('section29', depSection);
    });
  }
};
```

## 🧪 Testing Integration

### Testing Section Integration

```tsx
// Test helper for integration
import { render, screen } from '@testing-library/react';
import { CompleteSF86FormProvider } from '../SF86FormContext';
import { Section29Provider } from './section29';

const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <CompleteSF86FormProvider>
    <Section29Provider>
      {children}
    </Section29Provider>
  </CompleteSF86FormProvider>
);

test('section integrates with central form', async () => {
  render(<YourSectionComponent />, { wrapper: TestWrapper });
  
  // Test integration functionality
  // ...
});
```

## 📝 Best Practices

### 1. Preserve Section Independence
- Keep section-specific logic in section contexts
- Use integration only for coordination, not core functionality
- Maintain backward compatibility

### 2. Optimize Performance
- Use React.memo for section components
- Implement proper useCallback/useMemo patterns
- Avoid unnecessary re-renders

### 3. Handle Errors Gracefully
- Implement error boundaries
- Provide fallback states
- Log integration errors appropriately

### 4. Maintain Type Safety
- Use TypeScript interfaces consistently
- Validate data at integration boundaries
- Provide proper type definitions

## 🚀 Migration Checklist

For existing sections:

- [ ] Add `useSection86FormIntegration` hook
- [ ] Update context value with integration methods
- [ ] Test bidirectional data sync
- [ ] Verify validation integration
- [ ] Update tests to include integration
- [ ] Document section-specific integration patterns

## 🎯 Summary

The Section Context Integration Framework provides:

✅ **Seamless Integration**: Minimal changes to existing section contexts  
✅ **Bidirectional Sync**: Automatic data synchronization  
✅ **Event-Driven**: Cross-section communication  
✅ **Validation**: Global form validation coordination  
✅ **Navigation**: Section-to-section navigation  
✅ **Change Tracking**: Global change detection  
✅ **Performance**: Optimized React patterns  
✅ **Type Safety**: Full TypeScript support  

This framework enables all 30 SF-86 sections to work together seamlessly while maintaining their individual functionality and independence.
