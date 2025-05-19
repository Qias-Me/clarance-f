# ResidencyInfo Context Implementation Documentation

## Overview

The ResidencyInfo context manages the state and logic for Section 11 (Where You Have Lived) of the form. This section handles residence history information, including addresses, residence statuses, and person contacts associated with each residence.

## Key Components

### 1. ResidencyInfo.tsx

**Core Context Provider:**
- Provides the `ResidencyInfoContext` for managing residence data
- Includes specialized handlers for dynamic arrays of residences and phone numbers
- Integrates with the global form context for data persistence

**Main Functionality:**
- `updateResidencyField`: Updates field values with dot-notation path support
- `addResidence`/`removeResidence`: Manage dynamic residence entries
- `addPhone`/`removePhone`: Manage dynamic phone entries within a contact
- `validateResidencyInfo`: Validates form data against requirements

**Special Features:**
- Uses effect hook to load initial data from Redux store
- Handles nested data objects with support for array manipulation
- Implements complex update logic for fields with dynamic array paths

### 2. ResidencyInfoWrapper.tsx

**Integration Layer:**
- Bridges the ResidencyInfo context with the RenderResidencyInfo component
- Provides a unified interface matching the FormProps requirements
- Special handling for different entry types

**Implementation Details:**
- `ResidencyInfoContent`: Inner component consuming the context
- `handleInputChange`: Direct passthrough to the context
- `handleAddEntry`/`handleRemoveEntry`: Path-based routing to appropriate handlers
- `getDefaultNewItem`: Provides appropriate templates for different entry types

### 3. Interface & Type Definitions

**Key Interfaces:**
- `ResidencyInfo`: Main interface with detailed residence information
- Sub-interfaces:
  - `Address`: Standard address fields
  - `APOOrFPODetails`: Military address details
  - `ResidenceAddress`: Extended address with APO/FPO support
  - `Contact`: Person contact details
  - `Phone`: Phone number with international/DSN support

**Field Types:**
- Follow the standard `Field<T>` pattern
- Strong typing for status fields with predefined options
- Supports complex nested structures with multiple levels

## Integration Points

### Route Integration

The ResidencyInfo context is primarily integrated through:
- Route-level integration in `app/routes/form/residency.tsx`
- The FormHandler component using the ResidencyInfoWrapper

### Redux Store Connection

Data persistence is handled through:
- `useFormContext` hook for Redux integration
- Initial loading from the store via `getSectionData`
- Updates to the store via `updateField`

## Dynamic Entry Management

### Residences

The context supports multiple residence entries with:
1. `addResidence`: Creates new residence entries with default values
2. `removeResidence`: Removes residence entries at specified indices
3. Array-based state management with _id tracking for each entry

### Contact Phones

Each residence contact can have multiple phone numbers:
1. `addPhone`: Adds new phone entries to a specific residence contact
2. `removePhone`: Removes phone entries from a specific residence contact
3. Ensures at least one phone entry is always present

## Special Handling Considerations

### Address Fields

- Standard address fields include street, city, state, zip, and country
- APO/FPO addresses have specialized handling with conditional fields
- Military addresses have their own structure with separate validation

### Relationship Fields

- Contact relationships use a checkbox array for multiple selection
- "Other" relationship type has a conditional field for details
- Strong typing ensures valid relationship values

## Testing Approach

The ResidencyInfo implementation should be tested for:
1. Correct initial state loading
2. Proper update of individual fields
3. Addition and removal of residence entries
4. Addition and removal of phone entries
5. Conditional field visibility
6. Integration with the Redux store
7. Proper form submission with formatted field IDs

## Implementation Pattern

This context follows the project's established pattern for form sections:
1. Define TypeScript interfaces for the data structure
2. Create a context provider with specialized handlers for different entry types
3. Provide a wrapper component for integration with the form system
4. Connect to the Redux store for persistence
5. Handle dynamic arrays with proper _id tracking and management

## Developer Notes

When modifying this section:
- Maintain the dynamic array pattern for both residences and phones
- Preserve the nested update logic for deep path handling
- Follow existing patterns for field updates and Redux integration
- Be aware of the RenderResidencyInfo component's expectations for data structure
- Ensure proper _id management for new and removed entries
- Remember that validation is handled at both the field level and section level 