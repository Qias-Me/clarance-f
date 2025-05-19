# CitizenshipInfo Implementation Documentation

## Overview
This directory contains the implementation of the CitizenshipInfo context and related components for Section 9 of the form. The CitizenshipInfo context manages the state and logic for citizenship information, including conditional rendering based on citizenship status.

## Components

### 1. `CitizenshipInfo.tsx`
Contains the context definition, provider implementation, and hook for consuming the context.

- **Context Type**: `CitizenshipInfoContextType`
  - `citizenshipInfo`: Current state of citizenship information
  - `updateCitizenshipField`: Function to update specific fields
  - `resetCitizenshipInfo`: Reset to default values
  - `setCitizenshipStatus`: Set citizenship status with appropriate section visibility
  - Helper functions for handling different citizenship types:
    - `handleCitizenshipByBirth`
    - `handleNaturalizedCitizen`
    - `handleDerivedCitizen`
    - `handleNonCitizen`

- **Provider**: `CitizenshipInfoProvider`
  - Initializes state with default values
  - Integrates with form context for persistence
  - Implements dynamic field updates and conditional logic

- **Hook**: `useCitizenshipInfo`
  - Provides easy access to the context

### 2. `CitizenshipInfoWrapper.tsx`
Connects the CitizenshipInfo context provider to the RenderCitizenshipInfo component.

- Implements the required FormProps interface
- Provides stubs for unused functions required by the interface
- Bridges between context state and the rendering component

## Integration

The CitizenshipInfo context is integrated into the application through:

1. A dedicated route in `app/routes/form/citizenship.tsx`
2. Integration with the form rendering system via `formHandler.tsx`

## Special Handling

### Citizenship Status Mapping
The context maintains a mapping between user-facing status descriptions and internal status codes:

```typescript
const citizenshipStatusMapping: Record<string, string> = {
  "I am a U.S. citizen or national by birth in the U.S. or U.S. territory/commonwealth. (Proceed to Section 10)   ": "birth",
  "I am a U.S. citizen or national by birth, born to U.S. parent(s), in a foreign country. (Complete 9.1) ": "citizen",
  "I am a naturalized U.S. citizen. (Complete 9.2) ": "naturalized",
  "I am a derived U.S. citizen. (Complete 9.3) ": "derived",
  "I am not a U.S. citizen. (Complete 9.4) ": "nonCitizen"
};
```

### Conditional Display Logic
The context implements logic to show/hide section components based on the selected citizenship status:

- Section 9.1: For citizens born abroad to U.S. parents
- Section 9.2: For naturalized citizens
- Section 9.3: For derived citizens
- Section 9.4: For non-citizens

Each section is only populated in the state when relevant to the selected status.

### Form Context Integration
The implementation uses `useFormContext` as a unified interface for:
- Reading form state via `getSectionData`
- Updating form state via `updateField`

This integration ensures consistency between local state and the Redux store.

## Assumptions and Constraints

1. **Initial Values**: Default values are sourced from `state/contexts/sections/citizenshipInfo`
2. **Nested Path Handling**: Field paths use dot notation (e.g., "section9_1.doc_type.value")
3. **Form Data Structure**: Follows the CitizenshipInfo interface defined in `api/interfaces/sections/citizenship`
4. **Status-Based Sections**: Only one section (9.1-9.4) is active at a time based on citizenship status

## Usage Example

```tsx
// To consume the context in a component:
const MyComponent = () => {
  const { 
    citizenshipInfo, 
    updateCitizenshipField, 
    setCitizenshipStatus 
  } = useCitizenshipInfo();
  
  // Use the context values and functions
  return (
    <div>
      <select
        value={citizenshipInfo.citizenship_status_code.value}
        onChange={(e) => setCitizenshipStatus(e.target.value)}
      >
        {/* Options here */}
      </select>
    </div>
  );
};

// To provide the context:
const App = () => (
  <CitizenshipInfoProvider>
    <MyComponent />
  </CitizenshipInfoProvider>
);
```

## Related Components

- `RenderCitizenshipInfo`: Renders the form fields for citizenship information
- `useFormContext`: Provides unified access to form state and actions 