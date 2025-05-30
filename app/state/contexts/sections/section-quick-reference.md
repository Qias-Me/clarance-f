# Section Implementation Quick Reference

Quick reference guide for implementing SF-86 sections using the standardized templates.

## 🚀 Quick Start

### 1. Copy Template
```bash
cp section-template.tsx section[NUMBER].tsx
# Example: cp section-template.tsx section13.tsx
```

### 2. Find & Replace Placeholders
```typescript
// Replace these throughout the file:
[SECTION_X] → Section13
[sectionX] → section13
[SECTION_NUMBER] → 13
[SECTION_NAME] → Employment Activities
```

### 3. Update Interfaces
```typescript
interface Section13Data {
  _id: number;
  yourSubsection: {
    hasFlag: Field<"YES" | "NO">;
    entries: YourEntry[];
  };
}

interface YourEntry {
  _id: number | string;
  // Your entry fields here
}

type Section13SubsectionKey = 'yourSubsection';
```

### 4. Configure Integration
```typescript
const integration = useSection86FormIntegration(
  'section13',
  'Section 13: Employment Activities',
  section13Data,
  setSection13Data,
  validateSection,
  getChanges
);
```

## 📋 Common Patterns

### Field ID Generation
```typescript
// Pattern: form1[0].Section[N][0].FieldType[index]
id: `form1[0].Section13[0].TextField[${entryIndex * 5}]`
id: `form1[0].Section13[0].RadioButtonList[${entryIndex}]`
id: `form1[0].Section13[0].CheckBox[${entryIndex * 3}]`
id: `form1[0].Section13[0].DateField[${entryIndex * 2}]`
id: `form1[0].Section13[0].DropDownList[${entryIndex + 100}]`
```

### Standard Field Structure
```typescript
fieldName: {
  id: "form1[0].Section13[0].TextField[0]",
  type: "text" | "radio" | "checkbox" | "date" | "select" | "textarea" | "tel",
  label: "Field Label",
  value: "", // or false for boolean, appropriate default
  isDirty: false,
  isValid: true,
  errors: []
}
```

### Address Template
```typescript
address: {
  street: { id: "...", type: "text", label: "Street", value: "", ... },
  city: { id: "...", type: "text", label: "City", value: "", ... },
  state: { id: "...", type: "select", label: "State", value: "", ... },
  zipCode: { id: "...", type: "text", label: "ZIP Code", value: "", ... },
  country: { id: "...", type: "text", label: "Country", value: "United States", ... }
}
```

### Date Range Template
```typescript
dateRange: {
  from: {
    date: { id: "...", type: "date", label: "From Date", value: "", ... },
    estimated: { id: "...", type: "checkbox", label: "Estimated", value: false, ... }
  },
  to: {
    date: { id: "...", type: "date", label: "To Date", value: "", ... },
    estimated: { id: "...", type: "checkbox", label: "Estimated", value: false, ... }
  },
  present: { id: "...", type: "checkbox", label: "Present", value: false, ... }
}
```

## 🔧 Standard CRUD Operations

### Update Flag
```typescript
const updateYourFlag = useCallback((hasValue: "YES" | "NO") => {
  setSection13Data(prev => {
    const updated = cloneDeep(prev);
    updated.yourSubsection.hasFlag.value = hasValue;
    return updated;
  });
  
  integration.notifyChange('flag_updated', { hasValue });
}, [integration]);
```

### Add Entry
```typescript
const addYourEntry = useCallback(() => {
  setSection13Data(prev => {
    const updated = cloneDeep(prev);
    const entryIndex = updated.yourSubsection.entries.length;
    const newEntry = createYourEntryTemplate(entryIndex);
    updated.yourSubsection.entries.push(newEntry);
    return updated;
  });
  
  integration.notifyChange('entry_added', {});
}, [integration]);
```

### Remove Entry
```typescript
const removeYourEntry = useCallback((entryIndex: number) => {
  setSection13Data(prev => {
    const updated = cloneDeep(prev);
    if (entryIndex >= 0 && entryIndex < updated.yourSubsection.entries.length) {
      updated.yourSubsection.entries.splice(entryIndex, 1);
    }
    return updated;
  });
  
  integration.notifyChange('entry_removed', { entryIndex });
}, [integration]);
```

### Update Field
```typescript
const updateFieldValue = useCallback((
  entryIndex: number,
  fieldPath: string,
  newValue: any
) => {
  setSection13Data(prev => {
    const updated = cloneDeep(prev);
    const fullPath = `yourSubsection.entries[${entryIndex}].${fieldPath}`;
    set(updated, fullPath, newValue);
    return updated;
  });
  
  integration.notifyChange('field_updated', { entryIndex, fieldPath, newValue });
}, [integration]);
```

## ✅ Validation Patterns

### Basic Validation
```typescript
const validateSection = useCallback((): ValidationResult => {
  const validationErrors: ValidationError[] = [];
  
  // Validate flag
  if (!section13Data.yourSubsection?.hasFlag?.value) {
    validationErrors.push({
      field: 'yourSubsection.hasFlag',
      message: 'Please answer this question',
      code: 'REQUIRED',
      severity: 'error'
    });
  }
  
  // Conditional validation
  if (section13Data.yourSubsection?.hasFlag?.value === 'YES') {
    if (!section13Data.yourSubsection.entries || section13Data.yourSubsection.entries.length === 0) {
      validationErrors.push({
        field: 'yourSubsection.entries',
        message: 'Please provide details',
        code: 'REQUIRED_CONDITIONAL',
        severity: 'error'
      });
    }
  }
  
  return {
    isValid: validationErrors.length === 0,
    errors: validationErrors,
    warnings: []
  };
}, [section13Data]);
```

### Entry Validation
```typescript
// Validate each entry
section13Data.yourSubsection.entries.forEach((entry, index) => {
  if (!entry.requiredField.value) {
    validationErrors.push({
      field: `yourSubsection.entries[${index}].requiredField`,
      message: `Required field is missing for entry ${index + 1}`,
      code: 'REQUIRED',
      severity: 'error'
    });
  }
});
```

## 🎯 Integration Features

### Standard Integration Methods
```typescript
// Available in all sections
const {
  // Global Form Operations
  markComplete,
  markIncomplete,
  triggerGlobalValidation,
  getGlobalFormState,
  navigateToSection,
  saveForm,
  
  // Event System
  emitEvent,
  subscribeToEvents,
  notifyChange
} = useSection13();
```

### Usage Examples
```typescript
// Mark section complete and navigate
const handleComplete = async () => {
  const result = triggerGlobalValidation();
  if (result.isValid) {
    markComplete();
    await saveForm();
    navigateToSection('section14');
  }
};

// Cross-section communication
const notifyOtherSections = () => {
  emitEvent({
    type: 'SECTION_UPDATE',
    sectionId: 'section13',
    payload: { action: 'employment_added', requiresVerification: true }
  });
};

// Listen for events
useEffect(() => {
  const unsubscribe = subscribeToEvents('SECTION_UPDATE', (event) => {
    if (event.payload.action === 'background_check_required') {
      // React to event
    }
  });
  
  return unsubscribe;
}, [subscribeToEvents]);
```

## 🧪 Testing Checklist

### Basic Tests
```typescript
// Test flag update
fireEvent.click(screen.getByText('Yes'));
expect(mockUpdateFlag).toHaveBeenCalledWith('YES');

// Test entry addition
fireEvent.click(screen.getByText('Add Entry'));
expect(screen.getByTestId('entry-count')).toHaveTextContent('1');

// Test field update
fireEvent.change(screen.getByLabelText('Field Name'), { target: { value: 'test' } });
expect(mockUpdateField).toHaveBeenCalledWith(0, 'fieldName.value', 'test');
```

### Integration Tests
```typescript
// Test integration features
const { markComplete, navigateToSection } = useSection13();
expect(typeof markComplete).toBe('function');
expect(typeof navigateToSection).toBe('function');
```

## 📁 File Structure

```
app/state/contexts/sections/
├── section-template.tsx          # Template for new sections
├── section7-example.tsx          # Concrete example (Residence History)
├── section13.tsx                 # Your implementation
├── section13.test.tsx            # Your tests
└── section-implementation-guide.md
```

## 🔍 Common Issues & Solutions

### Issue: Field IDs not unique
**Solution:** Use proper indexing in field ID generation
```typescript
// ❌ Wrong
id: `form1[0].Section13[0].TextField[0]`

// ✅ Correct
id: `form1[0].Section13[0].TextField[${entryIndex * fieldsPerEntry + fieldOffset}]`
```

### Issue: Integration not working
**Solution:** Ensure proper provider wrapping
```typescript
<CompleteSF86FormProvider>
  <Section13Provider>
    <YourComponent />
  </Section13Provider>
</CompleteSF86FormProvider>
```

### Issue: Validation not triggering
**Solution:** Update local errors for backward compatibility
```typescript
const newErrors: Record<string, string> = {};
validationErrors.forEach(error => {
  newErrors[error.field] = error.message;
});
setErrors(newErrors);
```

## 🎯 Section-Specific Examples

### Section 7 (Residence History)
- **Flag:** "Have you lived at current address for 3+ years?"
- **Entries:** Address, date range, residence type, verification
- **Validation:** Address completeness, date continuity

### Section 13 (Employment Activities)
- **Flag:** "Have you been employed in the last 7 years?"
- **Entries:** Employer, position, dates, supervisor, reason for leaving
- **Validation:** Employment gaps, supervisor contact info

### Section 29 (Associations)
- **Multiple Subsections:** Terrorism, violent overthrow, etc.
- **Different Entry Types:** Organizations vs activities
- **Complex Validation:** Conditional based on association type

## 🚀 Quick Implementation

1. **Copy template** → Replace placeholders → **5 minutes**
2. **Define interfaces** → Update data structure → **10 minutes**
3. **Implement CRUD** → Customize operations → **15 minutes**
4. **Add validation** → Section-specific rules → **10 minutes**
5. **Test implementation** → Basic functionality → **10 minutes**

**Total: ~50 minutes per section** following this standardized approach!

This quick reference enables rapid, consistent implementation of all 30 SF-86 sections while maintaining the proven patterns and integration capabilities.
