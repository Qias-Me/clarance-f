# SF-86 Scalable Architecture Troubleshooting Guide

Comprehensive troubleshooting guide for common issues, debugging techniques, and solutions for the scalable SF-86 form architecture.

## 🎯 Overview

This guide covers troubleshooting for:
- **Integration Issues**: SF86FormContext integration problems
- **Performance Problems**: Memory leaks, slow rendering, excessive re-renders
- **Data Sync Issues**: Bidirectional synchronization problems
- **Validation Errors**: Validation logic and error handling
- **Event System Issues**: Cross-section communication problems
- **TypeScript Errors**: Type-related compilation issues

## 🔧 Common Integration Issues

### Issue 1: Integration Methods Not Available

**Symptoms:**
```typescript
// Error: Cannot read property 'markComplete' of undefined
const { markComplete } = useSection29();
markComplete(); // TypeError
```

**Diagnosis:**
```typescript
// Check if SF86FormProvider is properly wrapping the component
const { markComplete } = useSection29();
console.log('markComplete available:', typeof markComplete); // Should be 'function'
```

**Solutions:**

**Solution A: Ensure Proper Provider Wrapping**
```typescript
// ✅ Correct: Proper provider hierarchy
function App() {
  return (
    <CompleteSF86FormProvider>  {/* Required wrapper */}
      <Section29Provider>
        <YourComponent />
      </Section29Provider>
    </CompleteSF86FormProvider>
  );
}

// ❌ Incorrect: Missing SF86FormProvider
function App() {
  return (
    <Section29Provider>  {/* Missing SF86FormProvider */}
      <YourComponent />
    </Section29Provider>
  );
}
```

**Solution B: Use Fallback Hook**
```typescript
// Create fallback hook for gradual migration
const useSection29WithFallback = () => {
  const context = useContext(Section29Context);
  
  if (!context) {
    throw new Error('useSection29 must be used within a Section29Provider');
  }
  
  // Provide fallbacks for integration methods
  const markComplete = useCallback(() => {
    if (context.markComplete) {
      context.markComplete();
    } else {
      console.warn('markComplete not available, using fallback');
      // Fallback behavior
    }
  }, [context]);
  
  return {
    ...context,
    markComplete
  };
};
```

### Issue 2: Data Not Syncing Between Central and Section

**Symptoms:**
- Changes in section context don't appear in central form
- Changes in central form don't update section context
- Infinite sync loops

**Diagnosis:**
```typescript
// Add debugging to track sync events
const integration = useSection86FormIntegration(
  'section29',
  'Section 29: Associations',
  section29Data,
  setSection29Data,
  validateSection,
  getChanges
);

// Debug sync events
useEffect(() => {
  console.log('Section29 data changed:', section29Data);
}, [section29Data]);

// Check if changes are being detected
const changes = getChanges();
console.log('Detected changes:', changes);
```

**Solutions:**

**Solution A: Fix Change Detection**
```typescript
// ✅ Correct: Proper change detection
const getChanges = useCallback(() => {
  const changes: Record<string, any> = {};
  
  // Use deep comparison for change detection
  if (JSON.stringify(section29Data) !== JSON.stringify(initialData)) {
    changes.section29 = {
      oldValue: initialData,
      newValue: section29Data,
      timestamp: new Date()
    };
  }
  
  return changes;
}, [section29Data, initialData]);

// ❌ Incorrect: Shallow comparison
const getChanges = () => {
  return section29Data !== initialData ? { section29: section29Data } : {};
};
```

**Solution B: Prevent Infinite Loops**
```typescript
// ✅ Correct: Prevent sync loops with proper dependencies
const updateFieldValue = useCallback((entryIndex: number, fieldPath: string, newValue: any) => {
  setSection29Data(prev => {
    const updated = cloneDeep(prev);
    set(updated, `entries[${entryIndex}].${fieldPath}`, newValue);
    return updated;
  });
  
  // Only notify if integration is available and stable
  if (integration && integration.notifyChange) {
    integration.notifyChange('field_updated', { entryIndex, fieldPath, newValue });
  }
}, [integration]); // Stable dependency

// ❌ Incorrect: Missing dependencies or unstable references
const updateFieldValue = (entryIndex, fieldPath, newValue) => {
  // Function recreated on every render
  setSection29Data(/* ... */);
  integration.notifyChange(/* ... */); // Unstable reference
};
```

## ⚡ Performance Issues

### Issue 3: Excessive Re-renders

**Symptoms:**
- Components re-render frequently
- Slow form interactions
- High CPU usage

**Diagnosis:**
```typescript
// Use React DevTools Profiler or add custom logging
const Section29Form = () => {
  console.log('Section29Form rendered');
  
  const { section29Data, updateFieldValue } = useSection29();
  
  // Check if functions are stable
  const updateFieldRef = useRef(updateFieldValue);
  if (updateFieldRef.current !== updateFieldValue) {
    console.log('updateFieldValue changed - potential re-render cause');
    updateFieldRef.current = updateFieldValue;
  }
  
  return (/* JSX */);
};
```

**Solutions:**

**Solution A: Proper Memoization**
```typescript
// ✅ Correct: Memoized context value
const Section29Provider = ({ children }) => {
  const [section29Data, setSection29Data] = useState(initialData);
  
  const updateFieldValue = useCallback((entryIndex, fieldPath, newValue) => {
    setSection29Data(prev => {
      const updated = cloneDeep(prev);
      set(updated, `entries[${entryIndex}].${fieldPath}`, newValue);
      return updated;
    });
  }, []); // Stable dependencies
  
  const contextValue = useMemo(() => ({
    section29Data,
    updateFieldValue,
    // Other methods
  }), [section29Data, updateFieldValue]);
  
  return (
    <Section29Context.Provider value={contextValue}>
      {children}
    </Section29Context.Provider>
  );
};
```

**Solution B: Component Memoization**
```typescript
// ✅ Correct: Memoized components
const ResidenceEntry = React.memo(({ entry, entryIndex, onUpdate }) => {
  const handleFieldChange = useCallback((fieldPath, newValue) => {
    onUpdate(entryIndex, fieldPath, newValue);
  }, [entryIndex, onUpdate]);
  
  return (
    <div>
      {/* Entry fields */}
    </div>
  );
});

// ❌ Incorrect: No memoization
const ResidenceEntry = ({ entry, entryIndex, onUpdate }) => {
  // Component re-renders on every parent update
  return (/* JSX */);
};
```

### Issue 4: Memory Leaks

**Symptoms:**
- Increasing memory usage over time
- Browser becomes slow or unresponsive
- "Maximum call stack exceeded" errors

**Diagnosis:**
```typescript
// Monitor memory usage
const useMemoryMonitoring = () => {
  useEffect(() => {
    const checkMemory = () => {
      if ('memory' in performance) {
        const memory = (performance as any).memory;
        console.log('Memory usage:', {
          used: Math.round(memory.usedJSHeapSize / 1024 / 1024) + ' MB',
          total: Math.round(memory.totalJSHeapSize / 1024 / 1024) + ' MB'
        });
      }
    };
    
    const interval = setInterval(checkMemory, 5000);
    return () => clearInterval(interval);
  }, []);
};
```

**Solutions:**

**Solution A: Proper Cleanup**
```typescript
// ✅ Correct: Clean up subscriptions
const Section29Provider = ({ children }) => {
  const [section29Data, setSection29Data] = useState(initialData);
  
  const integration = useSection86FormIntegration(
    'section29',
    'Section 29: Associations',
    section29Data,
    setSection29Data,
    validateSection,
    getChanges
  );
  
  useEffect(() => {
    const unsubscribe = integration.subscribeToEvents('SECTION_UPDATE', handleSectionUpdate);
    
    return () => {
      unsubscribe(); // ✅ Cleanup subscription
    };
  }, [integration]);
  
  // Rest of component
};
```

**Solution B: Avoid Circular References**
```typescript
// ✅ Correct: Avoid circular references
const validateSection = useCallback((): ValidationResult => {
  const validationErrors: ValidationError[] = [];
  
  // Validate without creating circular references
  if (!section29Data.terrorismOrganizations?.hasAssociation?.value) {
    validationErrors.push({
      field: 'terrorismOrganizations.hasAssociation',
      message: 'Please answer about terrorism organizations',
      code: 'REQUIRED',
      severity: 'error'
    });
  }
  
  return {
    isValid: validationErrors.length === 0,
    errors: validationErrors,
    warnings: []
  };
}, [section29Data]); // Only depend on data, not functions

// ❌ Incorrect: Circular dependencies
const validateSection = useCallback(() => {
  // Validation logic that references other functions
  return someOtherFunction(validateSection); // Circular reference
}, [someOtherFunction, validateSection]); // Circular dependency
```

## 🔄 Data Synchronization Issues

### Issue 5: Bidirectional Sync Not Working

**Symptoms:**
- Section updates don't reflect in central form
- Central form updates don't reflect in section
- Data inconsistencies between contexts

**Diagnosis:**
```typescript
// Add sync debugging
const integration = useSection86FormIntegration(
  'section29',
  'Section 29: Associations',
  section29Data,
  setSection29Data,
  validateSection,
  getChanges
);

// Debug sync events
useEffect(() => {
  console.log('Integration notifyChange available:', typeof integration.notifyChange);
  console.log('Section29 data for sync:', section29Data);
}, [integration, section29Data]);
```

**Solutions:**

**Solution A: Ensure Proper Integration Setup**
```typescript
// ✅ Correct: Complete integration setup
const Section29Provider = ({ children }) => {
  const [section29Data, setSection29Data] = useState(createInitialSection29State());
  
  // Proper validation function
  const validateSection = useCallback((): ValidationResult => {
    // Validation logic
    return { isValid: true, errors: [], warnings: [] };
  }, [section29Data]);
  
  // Proper change detection
  const getChanges = useCallback(() => {
    // Change detection logic
    return {};
  }, [section29Data]);
  
  // Integration with all required parameters
  const integration = useSection86FormIntegration(
    'section29',                    // ✅ Section ID
    'Section 29: Associations',     // ✅ Section name
    section29Data,                  // ✅ Current data
    setSection29Data,               // ✅ Data setter
    validateSection,                // ✅ Validation function
    getChanges                      // ✅ Change detection
  );
  
  // Rest of provider
};
```

**Solution B: Fix Change Notification**
```typescript
// ✅ Correct: Proper change notification
const updateSubsectionFlag = useCallback((subsectionKey: Section29SubsectionKey, hasValue: "YES" | "NO") => {
  setSection29Data(prev => {
    const updated = cloneDeep(prev);
    const subsection = updated[subsectionKey];
    
    if (subsection && 'hasAssociation' in subsection) {
      subsection.hasAssociation.value = hasValue;
    }
    
    return updated;
  });
  
  // ✅ Notify integration of change
  integration.notifyChange('subsection_flag_updated', { subsectionKey, hasValue });
}, [integration]);

// ❌ Incorrect: Missing change notification
const updateSubsectionFlag = (subsectionKey, hasValue) => {
  setSection29Data(prev => {
    // Update logic
    return updated;
  });
  // Missing: integration.notifyChange(...)
};
```

## ✅ Validation Issues

### Issue 6: Validation Not Working

**Symptoms:**
- Validation errors not showing
- Invalid data being accepted
- Validation running but not updating UI

**Diagnosis:**
```typescript
// Debug validation
const validateSection = useCallback((): ValidationResult => {
  console.log('Validation running for data:', section29Data);
  
  const validationErrors: ValidationError[] = [];
  
  // Add validation logic with debugging
  if (!section29Data.terrorismOrganizations?.hasAssociation?.value) {
    console.log('Validation error: Missing terrorism association answer');
    validationErrors.push({
      field: 'terrorismOrganizations.hasAssociation',
      message: 'Please answer about terrorism organizations',
      code: 'REQUIRED',
      severity: 'error'
    });
  }
  
  console.log('Validation result:', { isValid: validationErrors.length === 0, errors: validationErrors });
  
  return {
    isValid: validationErrors.length === 0,
    errors: validationErrors,
    warnings: []
  };
}, [section29Data]);
```

**Solutions:**

**Solution A: Fix Validation Logic**
```typescript
// ✅ Correct: Comprehensive validation
const validateSection = useCallback((): ValidationResult => {
  const validationErrors: ValidationError[] = [];
  
  // Validate each subsection
  Object.entries(section29Data).forEach(([key, subsection]) => {
    if (key === '_id') return; // Skip ID field
    
    if (subsection && typeof subsection === 'object' && 'hasAssociation' in subsection) {
      // Validate YES/NO flag
      if (!subsection.hasAssociation?.value) {
        validationErrors.push({
          field: `${key}.hasAssociation`,
          message: `Please answer the ${key} question`,
          code: 'REQUIRED',
          severity: 'error'
        });
      }
      
      // Validate entries if YES
      if (subsection.hasAssociation?.value === 'YES') {
        if (!subsection.entries || subsection.entries.length === 0) {
          validationErrors.push({
            field: `${key}.entries`,
            message: `Please provide details for ${key}`,
            code: 'REQUIRED_CONDITIONAL',
            severity: 'error'
          });
        }
      }
    }
  });
  
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
}, [section29Data]);
```

**Solution B: Ensure Validation Triggers**
```typescript
// ✅ Correct: Trigger validation on data changes
useEffect(() => {
  // Validate when data changes
  const result = validateSection();
  
  // Update integration with validation result
  if (integration && integration.notifyChange) {
    integration.notifyChange('validation_updated', result);
  }
}, [section29Data, validateSection, integration]);
```

## 🎯 Event System Issues

### Issue 7: Events Not Being Received

**Symptoms:**
- Cross-section events not triggering
- Event subscriptions not working
- Events being emitted but not received

**Diagnosis:**
```typescript
// Debug event system
const Section29Provider = ({ children }) => {
  const integration = useSection86FormIntegration(/* ... */);
  
  useEffect(() => {
    console.log('Setting up event subscription');
    
    const unsubscribe = integration.subscribeToEvents('SECTION_UPDATE', (event) => {
      console.log('Section29 received event:', event);
    });
    
    console.log('Event subscription setup complete');
    
    return () => {
      console.log('Cleaning up event subscription');
      unsubscribe();
    };
  }, [integration]);
  
  // Test event emission
  const testEventEmission = () => {
    console.log('Emitting test event');
    integration.emitEvent({
      type: 'TEST_EVENT',
      sectionId: 'section29',
      payload: { test: true }
    });
  };
  
  // Rest of provider
};
```

**Solutions:**

**Solution A: Fix Event Subscription**
```typescript
// ✅ Correct: Proper event subscription
useEffect(() => {
  if (!integration || !integration.subscribeToEvents) {
    console.warn('Integration not available for event subscription');
    return;
  }
  
  const unsubscribe = integration.subscribeToEvents('SECTION_UPDATE', (event) => {
    console.log('Received SECTION_UPDATE event:', event);
    
    // Handle event
    if (event.sectionId !== 'section29' && event.payload.requiresValidation) {
      // Trigger validation in response to other section updates
      validateSection();
    }
  });
  
  return () => {
    if (unsubscribe) {
      unsubscribe();
    }
  };
}, [integration, validateSection]);
```

**Solution B: Fix Event Emission**
```typescript
// ✅ Correct: Proper event emission
const emitBackgroundCheckEvent = useCallback(() => {
  if (!integration || !integration.emitEvent) {
    console.warn('Integration not available for event emission');
    return;
  }
  
  integration.emitEvent({
    type: 'BACKGROUND_CHECK_REQUIRED',
    sectionId: 'section29',
    payload: {
      reason: 'terrorism_associations',
      requiresVerification: true,
      timestamp: new Date().toISOString()
    }
  });
}, [integration]);
```

## 🔍 Debugging Techniques

### 1. React DevTools

```typescript
// Add display names for better debugging
Section29Provider.displayName = 'Section29Provider';
useSection29.displayName = 'useSection29';

// Add debug props
const Section29Form = () => {
  const section29Context = useSection29();
  
  // Add context to window for debugging
  useEffect(() => {
    window.section29Debug = section29Context;
  }, [section29Context]);
  
  return (/* JSX */);
};
```

### 2. Console Debugging

```typescript
// Add comprehensive logging
const debugLog = (message: string, data?: any) => {
  if (process.env.NODE_ENV === 'development') {
    console.log(`[Section29] ${message}`, data);
  }
};

const updateFieldValue = useCallback((entryIndex: number, fieldPath: string, newValue: any) => {
  debugLog('Updating field value', { entryIndex, fieldPath, newValue });
  
  setSection29Data(prev => {
    const updated = cloneDeep(prev);
    set(updated, `entries[${entryIndex}].${fieldPath}`, newValue);
    
    debugLog('Updated data', updated);
    return updated;
  });
}, []);
```

### 3. Performance Profiling

```typescript
// Add performance markers
const updateFieldValue = useCallback((entryIndex: number, fieldPath: string, newValue: any) => {
  performance.mark('updateFieldValue-start');
  
  setSection29Data(prev => {
    const updated = cloneDeep(prev);
    set(updated, `entries[${entryIndex}].${fieldPath}`, newValue);
    return updated;
  });
  
  performance.mark('updateFieldValue-end');
  performance.measure('updateFieldValue', 'updateFieldValue-start', 'updateFieldValue-end');
}, []);
```

## 📋 Troubleshooting Checklist

### Quick Diagnosis Checklist
- [ ] **Provider Wrapping**: Is SF86FormProvider wrapping the section provider?
- [ ] **Integration Setup**: Are all integration parameters provided correctly?
- [ ] **Dependencies**: Are useCallback/useMemo dependencies correct?
- [ ] **Event Cleanup**: Are event subscriptions being cleaned up?
- [ ] **TypeScript**: Are there any TypeScript compilation errors?
- [ ] **Console Errors**: Are there any runtime errors in the console?

### Performance Checklist
- [ ] **Memoization**: Are context values and functions properly memoized?
- [ ] **Re-renders**: Are components re-rendering unnecessarily?
- [ ] **Memory Leaks**: Are subscriptions and timers being cleaned up?
- [ ] **Bundle Size**: Is the bundle size reasonable?

### Integration Checklist
- [ ] **Data Sync**: Is data syncing between section and central form?
- [ ] **Events**: Are events being emitted and received correctly?
- [ ] **Validation**: Is validation working and updating the UI?
- [ ] **Navigation**: Are navigation methods working correctly?

This troubleshooting guide provides systematic approaches to diagnosing and resolving common issues in the scalable SF-86 form architecture.
