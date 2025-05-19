# Social Security Number (SSN) Implementation

This document explains the implementation of the Social Security Number (SSN) fields in Section 4 of the SF-86 form.

## Overview

The Social Security Number appears in multiple places throughout the SF-86 form:

1. The main SSN field in Section 4
2. The "Not Applicable" checkbox for cases where an SSN is not available
3. Repeating SSN fields at the bottom of each page of the form

The implementation uses a shared SSN value across all of these fields, ensuring that a change to the main SSN automatically updates all page SSN fields.

## Key Files

- `api/interfaces/sections/aknowledgement.ts` - Contains the TypeScript interfaces for the SSN data
- `app/state/contexts/sections/aknowledgementInfo.tsx` - Contains the context data structure for the SSN fields
- `app/state/hooks/useAcknowledgementInfo.ts` - Provides utility functions for managing SSN data
- `app/components/Rendered/RenderAcknowledgementInfo.tsx` - Renders the SSN form fields in the UI

## Type Definitions

The following interfaces are used for the SSN implementation:

```typescript
// AknowledgeInfo is the main interface for Section 4
interface AknowledgeInfo {
  aknowledge: Field<"YES" | "NO">;  // General acknowledgement radio button
  ssn?: Field<string>;              // Main SSN field
  notApplicable: Field<"Yes" | "No">; // "Not Applicable" checkbox for SSN
  pageSSN: PageSSN[];               // SSN fields on each page
  sectionMetadata?: SectionMetadata; // Additional metadata
}

// PageSSN represents an SSN field on a specific page
interface PageSSN {
  ssn: Field<string>;
}

// SectionMetadata provides additional information about Section 4
interface SectionMetadata {
  sectionNumber: number;
  sectionTitle: string;
  ssnPrivacyNotice: Field<string>;
  ssnFormatExample: Field<string>;
}
```

## Utility Functions

The `useAcknowledgementInfo` hook provides several utility functions:

1. `updateAcknowledgementField` - Updates a specific field in the Acknowledgement section
2. `setSSN` - Sets the SSN value across all occurrences (main field and all page fields)
3. `setNotApplicable` - Sets the "Not Applicable" status (and clears SSN if set to "Yes")
4. `setAcknowledgement` - Sets the acknowledgement agreement status
5. `validateSSN` - Validates the SSN format and checks for invalid patterns

## SSN Validation

The SSN validation logic checks for several conditions:

1. Basic format: Must be 9 digits
2. Invalid area numbers: Cannot be "000", "666", or start with "9"
3. Invalid group numbers: Cannot be "00"
4. Invalid serial numbers: Cannot be "0000"
5. Well-known fake SSNs: Rejects commonly used fake SSNs

## UI Implementation

The `RenderAcknowledgementInfo` component:

1. Displays the main SSN field with appropriate validation
2. Provides a "Not Applicable" checkbox
3. Shows specific error messages based on validation results
4. Indicates how many SSN fields will be populated throughout the form

## Synchronization Mechanism

When the user enters an SSN in the main field, the value is automatically synchronized to all page SSN fields through the `updateAllSSNFields` function. Similarly, when the "Not Applicable" checkbox is checked, all SSN fields are cleared.

## Field Mapping

The fields from Section 4 in field-hierarchy.json are mapped to the AcknowledgementInfo context according to the following pattern:

1. Main SSN field -> `aknowledgementInfo.ssn`
2. Not Applicable checkbox -> `aknowledgementInfo.notApplicable`
3. Page SSN fields -> `aknowledgementInfo.pageSSN[]`

## Usage Example

```typescript
// In a component that needs to use SSN data
const { 
  acknowledgementInfo, 
  setSSN, 
  setNotApplicable, 
  validateSSN 
} = useAcknowledgementInfo();

// Get the current SSN value
const currentSSN = acknowledgementInfo.ssn?.value || '';

// Update the SSN (will update all page fields)
setSSN('123-45-6789');

// Check if the SSN is valid
const isValid = validateSSN('123-45-6789');

// Mark SSN as Not Applicable
setNotApplicable('Yes');
```

## Security Considerations

Social Security Numbers are sensitive personal information. This implementation:

1. Does not store SSNs in local storage or cookies by default
2. Does not transmit SSNs over the network unless the form is being submitted
3. Handles SSN validation on the client-side to avoid unnecessary transmission

## Edge Cases

1. **Not Applicable**: If the "Not Applicable" checkbox is checked, SSN validation is bypassed, and all SSN fields are cleared.
2. **Format Variations**: The validation logic and UI accept SSNs with or without hyphens for user convenience.
3. **Field Updates**: The system ensures all SSN fields are kept in sync across the entire form. 