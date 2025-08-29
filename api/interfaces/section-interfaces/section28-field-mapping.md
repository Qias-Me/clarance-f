# Section 28 Field Mapping Analysis

## Overview
Section 28 handles "Involvement in Non-Criminal Court Actions" and covers civil court actions in the last 10 years. The section supports up to 2 court action entries.

## Field Pattern Analysis

### Main Radio Button
- **Field Name**: `form1[0].Section28[0].RadioButtonList[0]`
- **Type**: PDFRadioGroup  
- **Options**: "YES", "NO (If NO, proceed to Section 29)"
- **Maps to**: `hasCourtActions` in the interface

### Entry Structure Pattern
The section supports 2 entries, identified by array indices [0] and [1]:

#### Entry #1 (Index [0])
| Field Purpose | Field Name | Label | Interface Property |
|---------------|------------|-------|-------------------|
| Date | `From_Datefield_Name_2[0]` | "Provide the date of the civil action (Month/Year)" | `dateOfAction.date` |
| Court Name | `TextField11[1]` | "Provide the court name." | `courtName` |
| Nature | `TextField11[0]` | "Provide details of the nature of the action." | `natureOfAction` |
| Results | `TextField11[2]` | "Provide a description of the results of the action." | `resultsDescription` |
| Parties | `TextField11[3]` | "Provide the name(s) of the principal parties involved" | `principalParties` |
| Street | `TextField11[4]` | "Provide the address of the court... Street" | `courtAddress.street` |
| City | `TextField11[5]` | "City" | `courtAddress.city` |
| State | `School6_State[0]` | "State" | `courtAddress.state` |
| Zip | `TextField11[6]` | "Zip Code" | `courtAddress.zipCode` |
| Country | `DropDownList142[0]` | "Country" | `courtAddress.country` |
| Estimate | `#field[12]` | "Estimate" | `estimatedDate` |

#### Entry #2 (Index [1])
| Field Purpose | Field Name | Label | Interface Property |
|---------------|------------|-------|-------------------|
| Date | `From_Datefield_Name_2[1]` | "Entry #2. Provide the date of the civil action (Month/Year)" | `dateOfAction.date` |
| Court Name | `TextField11[8]` | "Provide the court name." | `courtName` |
| Nature | `TextField11[7]` | "Provide details of the nature of the action." | `natureOfAction` |
| Results | `TextField11[9]` | "Provide a description of the results of the action." | `resultsDescription` |
| Parties | `TextField11[10]` | "Provide the name(s) of the principal parties involved" | `principalParties` |
| Street | `TextField11[11]` | "Provide the address of the court... Street" | `courtAddress.street` |
| City | `TextField11[12]` | "City" | `courtAddress.city` |
| State | `School6_State[1]` | "State" | `courtAddress.state` |
| Zip | `TextField11[13]` | "Zip Code" | `courtAddress.zipCode` |
| Country | `DropDownList7[0]` | "Country" | `courtAddress.country` |
| Estimate | `#field[23]` | "Estimate" | `estimatedDate` |

## Field Naming Patterns Identified

1. **Array Indexing**: Consistent use of [0] and [1] to differentiate between Entry #1 and Entry #2
2. **Date Fields**: `From_Datefield_Name_2[index]` pattern for date inputs
3. **Text Fields**: Sequential numbering in `TextField11[n]` with specific mappings per entry
4. **Dropdown Consistency**: State fields use `School6_State[index]` pattern
5. **Country Dropdowns**: Different naming (`DropDownList142[0]` vs `DropDownList7[0]`) but same functionality
6. **Estimate Checkboxes**: Different field IDs (`#field[12]` vs `#field[23]`) for each entry

## Interface Design Decisions

### 1. Entry Structure
- Used `CourtActionEntry[]` array to handle variable number of entries (0-2)
- Each entry contains all fields for one complete court action

### 2. Address Handling
- Created `CourtAddress` interface to handle both US and international addresses
- Made `state` and `zipCode` optional for international addresses
- Included comprehensive country and state type definitions

### 3. Date Structure
- Used `DateInfo` interface with separate `date` and `estimated` fields
- Supports the form's Month/Year format requirement
- Includes estimation checkbox functionality

### 4. Type Safety
- Included comprehensive `USState` type with all dropdown options
- Included extensive `Country` type with all available countries
- Used proper `Field<T>` typing for all form fields

## Validation Considerations

1. **Conditional Logic**: If `hasCourtActions` is "NO", entries array should be empty
2. **Address Validation**: For US addresses, state and zipCode should be required
3. **Date Format**: Month/Year format validation needed
4. **Entry Limit**: Maximum 2 entries based on form structure

## Usage Example

```typescript
const section28Data: Section28Info = {
  _id: 28,
  hasCourtActions: {
    value: "YES",
    id: "section_28_field_form1_0__Section28_0__RadioButtonList_0_",
    type: "PDFRadioGroup",
    label: "RadioButtonList"
  },
  courtActionEntries: [
    {
      _id: 1,
      dateOfAction: {
        date: {
          value: "03/2020",
          id: "section_28_field_form1_0__Section28_0__From_Datefield_Name_2_0_",
          type: "PDFTextField",
          label: "Provide the date of the civil action (Month/Year)"
        },
        estimated: {
          value: "NO",
          id: "section_28_field_form1_0__Section28_0___field_12_",
          type: "PDFCheckBox",
          label: "Estimate"
        }
      },
      courtName: {
        value: "Superior Court of California",
        id: "section_28_field_form1_0__Section28_0__TextField11_1_",
        type: "PDFTextField",
        label: "Provide the court name."
      },
      // ... other fields
    }
  ]
};
```

This interface provides a clean, type-safe way to handle Section 28 data while maintaining full compatibility with the PDF form field structure. 