# Section29 Migration Guide

This guide explains how to migrate from the original Section29 Context to the new integrated version that works with the SF86FormContext architecture.

## 🎯 Migration Overview

The migration preserves **100% backward compatibility** while adding powerful new integration capabilities. Existing code will continue to work without any changes.

## 📋 What's New

### ✅ **Preserved (No Changes Required)**
- All original CRUD operations
- All original state management
- All original field generation
- All original validation logic
- All original TypeScript interfaces
- All original component patterns

### 🆕 **New Integration Capabilities**
- Global form coordination
- Cross-section navigation
- Centralized validation
- Auto-save functionality
- Event-driven communication
- Section completion tracking

## 🔄 Migration Steps

### Step 1: Update Import (Optional)

**Before (Original):**
```tsx
import { Section29Provider, useSection29 } from './sections/section29';
```

**After (Integrated):**
```tsx
import { Section29Provider, useSection29 } from './sections/section29-integrated';
```

**Note:** The original file can remain unchanged. The integrated version is a separate file.

### Step 2: Wrap with SF86FormProvider

**Before:**
```tsx
function App() {
  return (
    <Section29Provider>
      <YourFormComponents />
    </Section29Provider>
  );
}
```

**After:**
```tsx
import { CompleteSF86FormProvider } from '../SF86FormContext';

function App() {
  return (
    <CompleteSF86FormProvider>
      <Section29Provider>
        <YourFormComponents />
      </Section29Provider>
    </CompleteSF86FormProvider>
  );
}
```

### Step 3: Use New Integration Features (Optional)

**Enhanced Component Example:**
```tsx
import { useSection29 } from './sections/section29-integrated';

function Section29Form() {
  const {
    // Original functionality (unchanged)
    section29Data,
    updateSubsectionFlag,
    addOrganizationEntry,
    validateSection,
    
    // NEW: Integration capabilities
    markComplete,
    triggerGlobalValidation,
    navigateToSection,
    saveForm,
    getGlobalFormState
  } = useSection29();
  
  // Original code works exactly the same
  const handleTerrorismFlag = (value: "YES" | "NO") => {
    updateSubsectionFlag('terrorismOrganizations', value);
  };
  
  // NEW: Enhanced capabilities
  const handleCompleteSection = async () => {
    const result = triggerGlobalValidation();
    if (result.isValid) {
      markComplete();
      await saveForm();
      navigateToSection('section30');
    }
  };
  
  const globalState = getGlobalFormState();
  
  return (
    <div>
      {/* Original form components work unchanged */}
      <button onClick={() => handleTerrorismFlag('YES')}>
        Yes to Terrorism Organizations
      </button>
      
      {/* NEW: Enhanced navigation */}
      <div className="form-status">
        <p>Form is dirty: {globalState.isDirty ? 'Yes' : 'No'}</p>
        <p>Completed sections: {globalState.completedSections.join(', ')}</p>
      </div>
      
      <button onClick={handleCompleteSection}>
        Complete Section & Continue
      </button>
    </div>
  );
}
```

## 🔧 Advanced Integration Patterns

### Cross-Section Communication

```tsx
function Section29Form() {
  const { emitEvent, subscribeToEvents } = useSection29();
  
  // Notify other sections of important changes
  const handleTerrorismFlagChange = (value: "YES" | "NO") => {
    updateSubsectionFlag('terrorismOrganizations', value);
    
    if (value === 'YES') {
      emitEvent({
        type: 'SECTION_UPDATE',
        sectionId: 'section29',
        payload: { 
          action: 'terrorism_flag_enabled',
          affectedSections: ['section30', 'section31'] 
        }
      });
    }
  };
  
  // Listen for events from other sections
  useEffect(() => {
    const unsubscribe = subscribeToEvents('SECTION_UPDATE', (event) => {
      if (event.payload.action === 'background_check_required') {
        // React to background check requirements
        console.log('Background check required due to:', event.sectionId);
      }
    });
    
    return unsubscribe;
  }, [subscribeToEvents]);
}
```

### Conditional Section Activation

```tsx
function Section29Form() {
  const { getGlobalFormState, markComplete } = useSection29();
  
  useEffect(() => {
    const globalState = getGlobalFormState();
    const previousSections = globalState.formData;
    
    // Auto-complete if no relevant background issues
    if (previousSections.section28?.criminalHistory?.hasIssues?.value === 'NO') {
      // This section might not be relevant
      markComplete();
    }
  }, [getGlobalFormState, markComplete]);
}
```

### Safe Migration with Fallbacks

```tsx
import { useSection29WithFallback } from './sections/section29-integrated';

function Section29Form() {
  // This hook provides safe fallbacks for integration features
  const context = useSection29WithFallback();
  
  // All original functionality works
  const { section29Data, updateSubsectionFlag } = context;
  
  // Integration features work with safe fallbacks
  const handleSave = async () => {
    try {
      await context.saveForm(); // Works with integration, logs warning without
    } catch (error) {
      console.log('Fallback: saving locally');
    }
  };
}
```

## 🧪 Testing Migration

### Test Original Functionality

```tsx
import { render, screen } from '@testing-library/react';
import { Section29Provider } from './sections/section29-integrated';
import { CompleteSF86FormProvider } from '../SF86FormContext';

const TestWrapper = ({ children }) => (
  <CompleteSF86FormProvider>
    <Section29Provider>
      {children}
    </Section29Provider>
  </CompleteSF86FormProvider>
);

test('original functionality preserved', async () => {
  render(<Section29Form />, { wrapper: TestWrapper });
  
  // Test original CRUD operations
  const yesButton = screen.getByText('Yes');
  fireEvent.click(yesButton);
  
  // Verify original behavior works
  expect(screen.getByText('Organization Details')).toBeInTheDocument();
});
```

### Test Integration Features

```tsx
test('integration features work', async () => {
  render(<Section29Form />, { wrapper: TestWrapper });
  
  // Test new integration capabilities
  const completeButton = screen.getByText('Complete Section');
  fireEvent.click(completeButton);
  
  // Verify integration behavior
  expect(mockNavigateToSection).toHaveBeenCalledWith('section30');
});
```

## 📊 Feature Comparison

| Feature | Original | Integrated | Notes |
|---------|----------|------------|-------|
| **CRUD Operations** | ✅ | ✅ | Identical API |
| **State Management** | ✅ | ✅ | Same patterns |
| **Field Generation** | ✅ | ✅ | Same utilities |
| **Validation** | ✅ | ✅ Enhanced | Enhanced with global coordination |
| **Change Tracking** | ✅ | ✅ Enhanced | Enhanced with global tracking |
| **Global Form Access** | ❌ | ✅ | NEW: Access to all sections |
| **Cross-Section Navigation** | ❌ | ✅ | NEW: Navigate between sections |
| **Auto-Save** | ❌ | ✅ | NEW: Automatic persistence |
| **Event Communication** | ❌ | ✅ | NEW: Cross-section events |
| **Completion Tracking** | ❌ | ✅ | NEW: Section completion state |

## 🚨 Breaking Changes

**None!** The migration is designed to be 100% backward compatible.

## 🔍 Troubleshooting

### Issue: Integration features not working

**Solution:** Ensure the component is wrapped with `CompleteSF86FormProvider`:

```tsx
// ❌ Missing SF86FormProvider
<Section29Provider>
  <MyComponent />
</Section29Provider>

// ✅ Correct setup
<CompleteSF86FormProvider>
  <Section29Provider>
    <MyComponent />
  </Section29Provider>
</CompleteSF86FormProvider>
```

### Issue: TypeScript errors with new methods

**Solution:** Use the fallback hook for gradual migration:

```tsx
// ❌ Direct usage might cause TS errors
const { markComplete } = useSection29();

// ✅ Safe usage with fallbacks
const { markComplete } = useSection29WithFallback();
```

### Issue: Performance concerns

**Solution:** The integration is optimized with React patterns:

```tsx
// All operations are memoized with useCallback
// State updates use immutable patterns
// Event subscriptions are properly cleaned up
```

## 📈 Migration Timeline

### Phase 1: Setup (Immediate)
- [ ] Add `CompleteSF86FormProvider` wrapper
- [ ] Import integrated Section29 context
- [ ] Verify existing functionality works

### Phase 2: Enhancement (Gradual)
- [ ] Add global form operations where beneficial
- [ ] Implement cross-section navigation
- [ ] Add event-driven communication

### Phase 3: Optimization (Optional)
- [ ] Leverage auto-save functionality
- [ ] Implement advanced validation coordination
- [ ] Add section completion tracking

## ✅ Migration Checklist

- [ ] **Backup existing code**
- [ ] **Add SF86FormProvider wrapper**
- [ ] **Update imports to integrated version**
- [ ] **Test all existing functionality**
- [ ] **Gradually add integration features**
- [ ] **Update tests to include integration**
- [ ] **Document new capabilities for team**

## 🎯 Summary

The Section29 migration provides:

✅ **Zero Breaking Changes**: All existing code continues to work  
✅ **Enhanced Capabilities**: Powerful new integration features  
✅ **Gradual Adoption**: Use new features at your own pace  
✅ **Type Safety**: Full TypeScript support maintained  
✅ **Performance**: Optimized React patterns preserved  
✅ **Testing**: Comprehensive test compatibility  

The migration demonstrates how the new architecture scales while preserving the proven patterns that make Section29 successful!
