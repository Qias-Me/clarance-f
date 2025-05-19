# Physical Attributes (Section 6) Implementation

This document explains the implementation of the Physical Attributes section (Section 6) of the SF-86 form.

## Overview

The Physical Attributes section captures basic identifying information about the applicant, including:
- Height (in feet and inches)
- Weight (in pounds)
- Hair color
- Eye color
- Gender

## Key Files

- `api/interfaces/sections/physicalAttributes.ts` - Contains the TypeScript interfaces for the Physical Attributes data
- `app/state/contexts/sections/physicalAttributes.tsx` - Contains the initial context data structure
- `app/state/hooks/usePhysicalAttributes.ts` - Custom hook for accessing and manipulating Physical Attributes data
- `app/components/Rendered/RenderPhysicals.tsx` - React component for rendering the Physical Attributes section
- `api/enums/enums.ts` - Contains the enums for Height, Hair Color, Eye Color, and Gender options

## Data Structure

The `PhysicalAttributes` interface defines the structure for storing Physical Attributes data:

```typescript
interface PhysicalAttributes {
  heightFeet: Field<string>;    // Height in feet (1-9)
  heightInch: Field<string>;    // Height in inches (0-11)
  weight: Field<string>;        // Weight in pounds
  hairColor: Field<string>;     // Hair color
  eyeColor: Field<string>;      // Eye color
  gender: Field<'Male' | 'Female'>; // Gender
  sectionMetadata?: SectionMetadata; // Additional metadata
}
```

Each field follows the common `Field` structure which includes:
- `value` - The current value
- `id` - The form field ID
- `type` - The field type (e.g., "PDFDropdown", "PDFTextField")
- `label` - Human-readable field label

## Implementation Details

### Context Mapping

Field values from `field-hierarchy.json` are mapped to the context structure using the `mapPhysicalAttributesFields` function in `FieldMappingService`. This mapping process:

1. Searches for fields in Section 6 of the field hierarchy
2. Maps them to the appropriate context fields based on field names and labels
3. Updates the context with the field values and IDs
4. Preserves any existing values if field hierarchy data is unavailable

### Data Validation

The `usePhysicalAttributes` hook provides validation functions:
- `validateWeight` ensures that weight values are valid numbers within reasonable ranges

### Component Rendering

The `RenderPhysicalsInfo` component in `RenderPhysicals.tsx` handles rendering the Physical Attributes fields with appropriate input controls:
- Dropdown selects for height, hair color, eye color, and gender using enums from `enums.ts`
- Numeric input for weight with validation
- All fields include proper accessibility labels and validation feedback

## Usage

### Accessing Physical Attributes Data

```typescript
// Import the hook
import { usePhysicalAttributes } from 'app/state/hooks/usePhysicalAttributes';

// In your component
const { 
  physicalAttributes, 
  setHeightFeet,
  setHeightInch,
  setWeight,
  setHairColor,
  setEyeColor,
  setGender,
  validateWeight
} = usePhysicalAttributes();

// Access values
const height = `${physicalAttributes.heightFeet.value}' ${physicalAttributes.heightInch.value}"`;
const weight = `${physicalAttributes.weight.value} lbs`;

// Update values
setHeightFeet('5');
setHeightInch('10');
setWeight('175');
```

## Special Considerations

- Height values are stored separately as feet and inches (not as a combined value or in centimeters)
- Weight is stored in pounds (not kilograms)
- Gender only accepts 'Male' or 'Female' as per the SF-86 form requirements 