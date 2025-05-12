# Form Entry Manager Utility

The Form Entry Manager is a utility for managing dynamic entries in form sections. It provides a clean separation between the visibility of entries and the actual form data.

## Key Features

- Track which entries should be visible without modifying the form data
- Add and remove entries with standardized methods
- Handle entry limits per section
- Provide utilities for working with field IDs

## Basic Usage

### 1. Import the utility

```tsx
import FormEntryManager, { useFormEntryManager } from "../../utils/forms/FormEntryManager";
```

### 2. Use the hook in your component

```tsx
const entryManager = useFormEntryManager({
  maxEntries: 4, // Maximum number of entries allowed
  defaultVisible: true, // Whether to show an entry by default when activating a section
  isSectionActive: (formData) => formData.hasEntries?.value === "YES" // Function to check if a section is active
});
```

### 3. Initialize the entry manager

```tsx
useEffect(() => {
  if (data) {
    // Initialize entries based on current data
    const isActive = data.hasEntries?.value === "YES";
    
    if (isActive) {
      // If entries exist, make them visible
      if (data.entries && data.entries.length > 0) {
        entryManager.setVisibilityMap({
          [path]: data.entries.map((_, index) => index)
        });
      } else {
        // If active but no entries yet, make the first entry visible
        entryManager.setVisibilityMap({
          [path]: [0]
        });
      }
    } else {
      // Clear visibility if section is not active
      entryManager.setVisibilityMap({
        [path]: []
      });
    }
    
    // Update visible entries in your component state
    updateVisibleEntries();
  }
}, [data.hasEntries?.value]);
```

### 4. Track visible entries

```tsx
const [visibleEntries, setVisibleEntries] = useState([]);

const updateVisibleEntries = () => {
  if (data.entries && data.hasEntries?.value === "YES") {
    // Only show entries that are marked as visible
    const visibleEntries = entryManager.getVisibleEntries(path, data.entries);
    setVisibleEntries(visibleEntries);
  } else {
    setVisibleEntries([]);
  }
};
```

### 5. Add and remove entries

```tsx
// Add an entry
const handleAddEntry = () => {
  // Add to your form data as before
  // ...
  
  // Make the new entry visible
  entryManager.addEntry(path);
};

// Remove an entry
const handleRemoveEntry = (index) => {
  // Only hide the entry without removing from data
  entryManager.removeEntry(path, index);
  
  // Update your component's visible entries
  updateVisibleEntries();
};
```

### 6. Render only visible entries

```tsx
{visibleEntries.map((entry, visibleIndex) => {
  // Find the actual index in the data array
  const actualIndex = data.entries?.findIndex(e => e === entry) ?? visibleIndex;
  
  return (
    <div key={actualIndex}>
      {/* Render entry fields here */}
      {/* Use actualIndex for form paths */}
    </div>
  );
})}
```

## Handling Field IDs

The utility also provides helpers for transforming field IDs between the context format and the PDF format:

```tsx
import { transformFieldId } from "../../utils/forms/FormEntryManager";

// Convert to PDF format (add "0 R" suffix)
const pdfFieldId = transformFieldId.toPdfFormat("9502"); // "9502 0 R"

// Convert to context format (remove "0 R" suffix)
const contextFieldId = transformFieldId.toContextFormat("9502 0 R"); // "9502"
```

## Utility Methods

The `FormEntryManager` object provides additional static utilities:

```tsx
// Check if a section is active
const isActive = FormEntryManager.isSectionActive(formData, 'namesInfo');

// Get the correct path for entries in a section
const entriesPath = FormEntryManager.getEntriesPath('namesInfo'); // 'namesInfo.names'

// Create a data mapper for working with context data
const dataMapper = FormEntryManager.createDataMapper(formData, contextData, onInputChange);
dataMapper.addEntry('namesInfo');
dataMapper.removeEntry('namesInfo', 0);
dataMapper.toggleSection('namesInfo', true);
``` 