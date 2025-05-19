# EmploymentInfo Component

## Overview

The EmploymentInfo component provides a context-based state management solution for Section 13 (Employment Activities) of the form. It handles the storage, manipulation, and validation of employment history data with support for dynamic entries.

## Architecture

The implementation follows the context provider pattern with these key components:

1. **EmploymentInfoContext**: A React context that stores the current state and provides functions for manipulation.
2. **EmploymentInfoProvider**: A context provider that manages the state and implements the business logic.
3. **useEmploymentInfo**: A custom hook for consuming the context in child components.
4. **EmploymentInfoWrapper**: A component that serves as an integration layer between the context and the rendering components.

## Key Features

- Dynamic management of employment entries (add/remove)
- Field updates with dot notation path support for deep nested objects
- Integration with the form's Redux store
- Data validation
- Default values for new entries

## Usage

### Providing the Context

Wrap the components that need access to employment data in the EmploymentInfoProvider:

```tsx
import { EmploymentInfoProvider } from './EmploymentInfo';

const YourComponent = () => (
  <EmploymentInfoProvider>
    {/* Child components that need access to employment data */}
  </EmploymentInfoProvider>
);
```

### Consuming the Context

Use the `useEmploymentInfo` hook in child components:

```tsx
import { useEmploymentInfo } from './EmploymentInfo';

const ChildComponent = () => {
  const { 
    employmentInfo, 
    updateEmploymentField, 
    addEmployment, 
    removeEmployment 
  } = useEmploymentInfo();

  // Use the context values and functions
  return (
    <div>
      {/* Your component UI */}
    </div>
  );
};
```

### Using the Wrapper

For integration with the RenderEmploymentInfo component, use the wrapper:

```tsx
import EmploymentInfoWrapper from './EmploymentInfoWrapper';

const FormSection = () => (
  <div>
    <h2>Employment Information</h2>
    <EmploymentInfoWrapper />
  </div>
);
```

## API Reference

### Context Values

- **employmentInfo**: Array of employment entries.
- **updateEmploymentField(path, value)**: Updates a specific field using dot notation path.
- **resetEmploymentInfo()**: Resets all fields to default values.
- **addEmployment()**: Adds a new employment entry.
- **removeEmployment(index)**: Removes an employment entry at the specified index.
- **validateEmploymentInfo()**: Validates the employment information and returns validation status.

## Data Structure

The employment information follows this structure:

```typescript
[
  {
    _id: number;
    section13A: [
      {
        _id: number;
        employmentActivity: Field<string>;
        otherExplanation?: Field<string>;
        section13A1?: Section13A1;
        section13A2?: Section13A2;
        section13A3?: Section13A3;
        section13A4?: Section13A4;
        section13A5?: Section13A5;
        section13A6?: Section13A6;
      }
    ];
    section13B?: Section13B;
    section13C?: Section13C;
  }
]
```

## Implementation Notes

- The component maintains its own state but syncs with the Redux store.
- Each employment entry has a unique `_id` field for identification.
- Field paths use dot notation to support nested objects and arrays.
- The component handles initialization with default values if no data is provided.
- Employment activity type determines which subsections (13A.1-13A.6) are required.

## Related Components

- **EmploymentInfoWrapper**: Bridges the context with the rendering components.
- **RenderEmploymentInfo**: Renders the employment form UI based on the provided data.
- Section-specific components (Section13A1, Section13A2, etc.). 