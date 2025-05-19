# CitizenshipInfo Context Implementation Documentation

## Overview

The CitizenshipInfo context manages the state and logic for Section 9 (Citizenship) of the form. This section handles different types of citizenship statuses and their corresponding data fields, including citizenship by birth, naturalized citizenship, derived citizenship, and non-citizen status.

## Key Components

### 1. CitizenshipInfo.tsx

**Core Context Provider:**
- Provides the `CitizenshipInfoContext` for managing citizenship data
- Includes specialized handlers for different citizenship types
- Integrates with the global form context for data persistence

**Main Functionality:**
- `updateCitizenshipField`: Updates field values with dot-notation path support
- `setCitizenshipStatus`: Sets the primary citizenship status
- Type-specific handlers:
  - `handleCitizenshipByBirth`: Shows section 9.1 forms and hides others
  - `handleNaturalizedCitizen`: Shows section 9.2 forms and hides others
  - `handleDerivedCitizen`: Shows section 9.3 forms and hides others
  - `handleNonCitizen`: Shows section 9.4 forms and hides others

**Special Features:**
- Uses effect hook to handle conditional field display based on citizenship status
- Maps user-friendly status descriptions to internal codes via `citizenshipStatusMapping`
- Fetches initial data from Redux store when available
- Uses the FieldMappingService for field ID handling

### 2. CitizenshipInfoWrapper.tsx

**Integration Layer:**
- Bridges the CitizenshipInfo context with the RenderCitizenshipInfo component
- Provides a unified interface matching the FormProps requirements
- Includes stubs for functions not used in this section but required by the interface

**Implementation Details:**
- `CitizenshipInfoContent`: Inner component consuming the context
- `handleInputChange`: Passes form changes to the context
- `formInfo`: Stub for required FormInfo interface
- Simplified implementation for non-applicable methods (addEntry, removeEntry, etc.)

### 3. Interface & Type Definitions

**Key Interfaces:**
- `CitizenshipInfo`: Main interface with conditional subsections
- Status-specific interfaces:
  - `CitizenshipByBirthInfo`: For citizens born abroad to U.S. parents
  - `NaturalizedCitizenInfo`: For naturalized citizens
  - `DerivedCitizenInfo`: For derived citizens
  - `NonCitizenInfo`: For non-citizens

**Field Types:**
- Most fields follow the standard `Field<T>` pattern
- Specialized enums for dropdown options (state, country, suffix)
- Strong typing for selection fields with predefined options

## Integration Points

### Route Integration

The CitizenshipInfo context is primarily integrated through:
- Route-level integration in `app/routes/form/citizenship.tsx`
- The FormHandler component using the CitizenshipInfoWrapper

### Redux Store Connection

Data persistence is handled through:
- `useFormContext` hook for Redux integration
- Initial loading from the store via `getSectionData`
- Updates to the store via `updateField`

## Conditional Logic

### Status-based Conditional Fields

The context implements complex conditional logic:
1. When a citizenship status is selected, corresponding subsections are shown/hidden
2. Different statuses (birth, naturalized, derived, non-citizen) show different field sets
3. The appropriate default data is loaded for each subsection type
4. Previous subsection data is cleared when switching between status types

### Field Dependencies

Several fields have dependencies on others:
- "Other" document types reveal additional explanation fields
- Military installation checkbox reveals installation name field
- Alien registration questions reveal registration number fields

## Special Handling Considerations

### Date Handling

- All date fields include an "Estimated" checkbox option
- Date formatting follows MM/DD/YYYY pattern
- Date values are stored as strings but follow consistent format

### Documentation Numbers

Different citizenship types require different identification numbers:
- Naturalized citizens: Naturalization certificate number
- Derived citizens: Certificate of citizenship number
- Non-citizens: Alien registration number

## Testing Approach

The CitizenshipInfo implementation should be tested for:
1. Correct initial state loading
2. Proper update of individual fields
3. Conditional field visibility based on citizenship status
4. Integration with the Redux store
5. Proper form submission with formatted field IDs

## Implementation Pattern

This context follows the project's established pattern for form sections:
1. Define TypeScript interfaces for the data structure
2. Create a context provider with type-specific handlers
3. Provide a wrapper component for integration with the form system
4. Connect to the Redux store for persistence
5. Handle conditional logic based on user selections

## Developer Notes

When modifying this section:
- Maintain the conditional logic for different citizenship statuses
- Preserve the mapping between description text and internal codes
- Ensure type safety through the defined interfaces
- Follow existing patterns for field updates and Redux integration 