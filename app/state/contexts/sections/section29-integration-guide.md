# Section 29 Context Integration Guide

This guide demonstrates how to integrate the Section29Context into your SF-86 form application.

## Quick Start

### 1. Provider Setup

Wrap your application or form section with the Section29Provider:

```tsx
import { Section29Provider } from './app/state/contexts/sections/section29';

function App() {
  return (
    <Section29Provider>
      <YourFormComponents />
    </Section29Provider>
  );
}
```

### 2. Using the Context

```tsx
import { useSection29 } from './app/state/contexts/sections/section29';

function Section29Form() {
  const {
    section29Data,
    updateSubsectionFlag,
    addOrganizationEntry,
    updateFieldValue,
    isDirty
  } = useSection29();

  // Your component logic here
}
```

## Integration with ApplicantFormValues

### Connecting to Main Form State

```tsx
import { useSection29 } from './app/state/contexts/sections/section29';
import type { ApplicantFormValues } from 'api/interfaces/formDefinition2.0';

function MainForm() {
  const { section29Data } = useSection29();
  const [formData, setFormData] = useState<ApplicantFormValues>({});

  // Sync Section29 data with main form
  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      section29: section29Data
    }));
  }, [section29Data]);

  return (
    <form>
      {/* Other form sections */}
      <Section29FormComponent />
    </form>
  );
}
```

### Loading Existing Data

```tsx
function LoadExistingData() {
  const { loadSection } = useSection29();

  const handleLoadData = async () => {
    try {
      const response = await fetch('/api/form-data');
      const formData: ApplicantFormValues = await response.json();
      
      if (formData.section29) {
        loadSection(formData.section29);
      }
    } catch (error) {
      console.error('Failed to load data:', error);
    }
  };

  return <button onClick={handleLoadData}>Load Saved Data</button>;
}
```

## Common Usage Patterns

### 1. Basic Yes/No Questions

```tsx
function SubsectionQuestion({ subsectionKey, label }) {
  const { section29Data, updateSubsectionFlag } = useSection29();
  const subsection = section29Data[subsectionKey];

  return (
    <div>
      <p>{label}</p>
      <label>
        <input
          type="radio"
          value="YES"
          checked={subsection?.hasAssociation?.value === "YES"}
          onChange={() => updateSubsectionFlag(subsectionKey, 'YES')}
        />
        Yes
      </label>
      <label>
        <input
          type="radio"
          value="NO"
          checked={subsection?.hasAssociation?.value === "NO"}
          onChange={() => updateSubsectionFlag(subsectionKey, 'NO')}
        />
        No
      </label>
    </div>
  );
}
```

### 2. Dynamic Entry Management

```tsx
function EntryList({ subsectionKey }) {
  const {
    section29Data,
    addOrganizationEntry,
    removeEntry,
    getEntryCount,
    duplicateEntry
  } = useSection29();

  const subsection = section29Data[subsectionKey];
  const entries = subsection?.entries || [];

  return (
    <div>
      <button onClick={() => addOrganizationEntry(subsectionKey)}>
        Add Entry
      </button>
      
      {entries.map((entry, index) => (
        <div key={entry._id}>
          <h4>Entry #{index + 1}</h4>
          <EntryForm 
            subsectionKey={subsectionKey}
            entryIndex={index}
            entry={entry}
          />
          <button onClick={() => removeEntry(subsectionKey, index)}>
            Remove
          </button>
          <button onClick={() => duplicateEntry(subsectionKey, index)}>
            Duplicate
          </button>
        </div>
      ))}
      
      <p>Total entries: {getEntryCount(subsectionKey)}</p>
    </div>
  );
}
```

### 3. Field Updates

```tsx
function EntryForm({ subsectionKey, entryIndex, entry }) {
  const { updateFieldValue, bulkUpdateFields } = useSection29();

  const handleFieldChange = (fieldPath: string, value: any) => {
    updateFieldValue(subsectionKey, entryIndex, fieldPath, value);
  };

  const handleBulkUpdate = () => {
    bulkUpdateFields(subsectionKey, entryIndex, {
      'address.country.value': 'United States',
      'dateRange.present.value': true
    });
  };

  return (
    <div>
      <input
        type="text"
        value={entry.organizationName.value}
        onChange={(e) => handleFieldChange('organizationName.value', e.target.value)}
        placeholder={entry.organizationName.label}
      />
      
      <button onClick={handleBulkUpdate}>
        Set Default Values
      </button>
    </div>
  );
}
```

## Advanced Features

### 1. Form Validation

```tsx
function ValidationExample() {
  const { validateSection, errors } = useSection29();

  const handleValidate = () => {
    const isValid = validateSection();
    if (!isValid) {
      console.log('Validation errors:', errors);
    }
  };

  return (
    <div>
      <button onClick={handleValidate}>Validate</button>
      {Object.entries(errors).map(([field, error]) => (
        <div key={field} className="error">
          {field}: {error}
        </div>
      ))}
    </div>
  );
}
```

### 2. Change Tracking

```tsx
function ChangeTracking() {
  const { isDirty, getChanges, resetSection } = useSection29();

  const handleSave = () => {
    if (isDirty) {
      const changes = getChanges();
      console.log('Changes to save:', changes);
      // Save logic here
    }
  };

  return (
    <div>
      {isDirty && <p>You have unsaved changes</p>}
      <button onClick={handleSave} disabled={!isDirty}>
        Save Changes
      </button>
      <button onClick={resetSection}>
        Reset Form
      </button>
    </div>
  );
}
```

### 3. Entry Reordering

```tsx
function ReorderableEntries({ subsectionKey }) {
  const { section29Data, moveEntry } = useSection29();
  const entries = section29Data[subsectionKey]?.entries || [];

  const handleMoveUp = (index: number) => {
    if (index > 0) {
      moveEntry(subsectionKey, index, index - 1);
    }
  };

  const handleMoveDown = (index: number) => {
    if (index < entries.length - 1) {
      moveEntry(subsectionKey, index, index + 1);
    }
  };

  return (
    <div>
      {entries.map((entry, index) => (
        <div key={entry._id} className="entry">
          <span>Entry #{index + 1}</span>
          <button onClick={() => handleMoveUp(index)} disabled={index === 0}>
            ↑
          </button>
          <button onClick={() => handleMoveDown(index)} disabled={index === entries.length - 1}>
            ↓
          </button>
        </div>
      ))}
    </div>
  );
}
```

## Integration with Existing Form Handler

To integrate with the existing `formHandler.tsx`:

1. Add Section29Provider to the provider hierarchy
2. Update SECTION_CONTEXT_MAP to include section29 data
3. Add section29 to ORDERED_FORM_SECTIONS
4. Create a RenderSection29 component following the existing pattern

```tsx
// In formHandler.tsx
import { section29Data } from './section29-static-data';

const SECTION_CONTEXT_MAP = {
  // ... existing sections
  section29: section29Data,
};

const ORDERED_FORM_SECTIONS = [
  // ... existing sections
  "section29",
];
```

## Best Practices

1. **Always wrap with Provider**: Ensure Section29Provider wraps any components using the context
2. **Use TypeScript**: Leverage the type-safe interfaces for better development experience
3. **Handle loading states**: Use the `isLoading` state for better UX
4. **Validate before save**: Always call `validateSection()` before saving data
5. **Track changes**: Use `isDirty` to prevent unnecessary saves
6. **Error handling**: Display validation errors to users
7. **Performance**: Use the bulk update functions for multiple field changes

## Troubleshooting

### Common Issues

1. **Context not found error**: Ensure component is wrapped with Section29Provider
2. **Field IDs not unique**: Use the provided field generation utilities
3. **State not updating**: Check that you're using the context methods, not direct state mutation
4. **Performance issues**: Use React.memo for entry components if rendering many entries

### Debug Tips

```tsx
function DebugSection29() {
  const { section29Data } = useSection29();
  
  console.log('Current Section29 state:', section29Data);
  
  return <pre>{JSON.stringify(section29Data, null, 2)}</pre>;
}
```
