# DualCitizenshipInfo Context Implementation Documentation

## Overview

The DualCitizenshipInfo context manages the state and logic for Section 10 (Dual/Multiple Citizenship) of the form. This section handles information about dual/multiple citizenships and foreign passports, including citizenship details, passport information, and passport usage history.

## Key Components

### 1. DualCitizenshipInfo.tsx

**Core Context Provider:**
- Provides the `DualCitizenshipInfoContext` for managing dual citizenship data
- Includes specialized handlers for managing citizenships and passports
- Integrates with the global form context for data persistence

**Main Functionality:**
- `updateDualCitizenshipField`: Updates field values with dot-notation path support
- `setHeldMultipleCitizenships`: Sets the citizenship status and shows/hides related fields
- `setHadNonUSPassport`: Sets the passport status and shows/hides related fields
- Dynamic array handling:
  - `addCitizenship`/`removeCitizenship`: Manage citizenship entries (maximum of 2)
  - `addPassport`/`removePassport`: Manage passport entries (maximum of 2)
  - `addPassportUse`/`removePassportUse`: Manage passport usage entries

**Special Features:**
- Uses effect hook to load initial data from Redux store
- Handles nested data objects with support for array manipulation
- Implements conditional field display based on user responses
- Enforces form limits (maximum of 2 citizenships, 2 passports)
- Supports nested arrays for passport usage records

### 2. DualCitizenshipInfoWrapper.tsx

**Integration Layer:**
- Bridges the DualCitizenshipInfo context with the RenderDualCitizenshipInfo component
- Provides a unified interface matching the FormProps requirements
- Includes complex path handling for multi-level nested arrays (passports -> passport uses)

**Implementation Details:**
- `DualCitizenshipInfoContent`: Inner component consuming the context
- `handleInputChange`: Passes form changes to the context
- `handleAddEntry`/`handleRemoveEntry`: Smart handlers with path parsing for different entry types
- `getDefaultNewItem`: Provides appropriate templates for different entry types
- RegEx path parsing for identifying passport indices in passport use operations

### 3. Interface & Type Definitions

**Key Interfaces:**
- `DualCitizenshipInfo`: Main interface with conditional sections
- Sub-interfaces:
  - `CitizenshipDetail`: For tracking individual foreign citizenships
  - `PassportDetail`: For foreign passport information
  - `PassportUseDetail`: For tracking each usage of a foreign passport

**Field Types:**
- Most fields follow the standard `Field<T>` pattern
- Specialized enums for dropdown options (country, state)
- Strong typing for binary selection fields with predefined options

## Integration Points

### Route Integration

The DualCitizenshipInfo context is primarily integrated through:
- Route-level integration in `app/routes/form/dualCitizenship.tsx`
- The FormHandler component using the DualCitizenshipInfoWrapper

### Redux Store Connection

Data persistence is handled through:
- `useFormContext` hook for Redux integration
- Initial loading from the store via `getSectionData`
- Updates to the store via `updateField`

## Conditional Logic

### Status-based Conditional Fields

The context implements the following conditional logic:
1. If "Have you EVER held dual/multiple citizenships?" is "NO", hide citizenship details
2. If "Have you EVER been issued a passport by a country other than the U.S.?" is "NO", hide passport details
3. If "Have you EVER used this passport for foreign travel?" is "NO", hide passport usage details
4. If any of the above conditions are changed, the appropriate data is cleared or initialized

### Dynamic Entry Management

The component manages several dynamic array entries:
- Citizenship entries (limited to 2)
- Passport entries (limited to 2)
- Passport usage entries (unlimited, but practically limited by UI)

## Special Handling Considerations

### Date Handling

- All date fields include an "Estimated" checkbox option
- "Present" checkbox for indicating ongoing periods
- Date formatting follows MM/DD/YYYY pattern

### Country Selection

- Country selection dropdowns are available for:
  - Country of citizenship
  - Country where passport was issued
  - Countries visited using the passport

## Testing Approach

The DualCitizenshipInfo implementation should be tested for:
1. Correct initial state loading
2. Proper update of individual fields
3. Addition and removal of citizenship entries
4. Addition and removal of passport entries
5. Addition and removal of passport usage entries
6. Conditional field visibility based on user responses
7. Integration with the Redux store
8. Proper form submission with formatted field IDs

## Implementation Pattern

This context follows the project's established pattern for form sections:
1. Define TypeScript interfaces for the data structure
2. Create a context provider with specialized handlers for different entry types
3. Provide a wrapper component for integration with the form system
4. Connect to the Redux store for persistence
5. Handle conditional logic based on user selections

## Developer Notes

When modifying this section:
- Maintain the conditional logic for showing/hiding different subsections
- Preserve the entry limits (maximum 2 citizenships, 2 passports)
- Ensure proper nesting of passport usage records within their parent passports
- Follow existing patterns for field updates and Redux integration
- Be careful with the nested path handling in the wrapper component for passport usage entries 