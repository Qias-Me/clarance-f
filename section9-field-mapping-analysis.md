# Section 9 Field Mapping Analysis - Source of Truth

## Overview
Based on `api/sections-references/section-9.json`, Section 9 has **78 fields** across **4 subsections**:
- Main citizenship status selection
- Section 9.1: Born to US parents abroad
- Section 9.2: Naturalized citizen  
- Section 9.3: Derived citizen
- Section 9.4: Non-US citizen

## Field Categories and Patterns

### 1. Main Citizenship Status
**Field**: `form1[0].Sections7-9[0].RadioButtonList[1]`
**ID**: `17233 0 R`
**Options**:
- "I am a U.S. citizen or national by birth in the U.S. or U.S. territory/commonwealth. (Proceed to Section 10)"
- "I am a U.S. citizen or national by birth, born to U.S. parent(s), in a foreign country. (Complete 9.1)"
- "I am a naturalized U.S. citizen. (Complete 9.2)"
- "I am a derived U.S. citizen. (Complete 9.3)"
- "I am not a U.S. citizen. (Complete 9.4)"

### 2. Section 9.1 Fields (Born to US Parents)
**Form Path**: `form1[0].Sections7-9[0].*`

| Field Name | Value Pattern | Type | Purpose |
|------------|---------------|------|---------|
| `TextField11[3]` | `sect9.1OtherExplain` | Text | Other explanation |
| `TextField11[4]` | `DocumentNumber9.1` | Text | Document number |
| `DropDownList12[0]` | Country list | Dropdown | Country |
| `School6_State[0]` | State codes | Dropdown | State |
| `TextField11[5]` | `sect9.1City` | Text | City |
| `TextField11[6]` | `9.1MiddleName` | Text | Middle name |
| `TextField11[7]` | `9.1LastName` | Text | Last name |
| `TextField11[8]` | `9.1FirstName` | Text | First name |
| `suffix[1]` | `9.1suffix` | Dropdown | Suffix |
| `TextField11[9]` | `sect9.1CertificateMName` | Text | Certificate middle name |
| `TextField11[10]` | `sect9.1CertificateLName` | Text | Certificate last name |
| `TextField11[11]` | `sect9.1CertificateLFName` | Text | Certificate first name |
| `suffix[2]` | `sect9.1certificateSuffix` | Dropdown | Certificate suffix |
| `RadioButtonList[2]` | YES/NO options | Radio | Has certificate |
| `From_Datefield_Name_2[1]` | `DateIssued9.1` | Date | Date issued |
| `#field[25]` | true | Checkbox | Estimate checkbox |
| `TextField11[12]` | `sect9.1CertificateNumber` | Text | Certificate number |
| `From_Datefield_Name_2[2]` | `sect9.1DateCertificateIssued` | Date | Certificate date |
| `#field[28]` | true | Checkbox | Estimate checkbox |
| `RadioButtonList[3]` | Document type options | Radio | Document type |
| `TextField11[18]` | `sect9.1Military Installation Base` | Text | Military base |

### 3. Section 9.2 Fields (Naturalized)
**Form Path**: `form1[0].Section9\\.1-9\\.4[0].*`

| Field Name | Value Pattern | Type | Purpose |
|------------|---------------|------|---------|
| `School6_State[0]` | `sect9.2CertificateState` | Dropdown | Certificate state |
| `TextField11[0]` | `sect9.2NaturalizationCity` | Text | Naturalization city |
| `TextField11[1]` | `sect9.2NaturalizationLName` | Text | Last name |
| `TextField11[2]` | `sect9.2NaturalizationFName` | Text | First name |
| `TextField11[3]` | `sect9.2NaturalizationMName` | Text | Middle name |
| `suffix[0]` | `sect9.2CertificateSuffix` | Dropdown | Suffix |
| `TextField11[4]` | `sect9.2NaturalizationStreet` | Text | Street address |
| `TextField11[5]` | `9.2CertificateZip` | Text | Zip code |
| `From_Datefield_Name_2[0]` | `sect9.2NaturalizationDate` | Date | Naturalization date |
| `#field[10]` | true | Checkbox | Estimate checkbox |
| `TextField11[6]` | `sect9.2NaturalizationCertificateNumber` | Text | Certificate number |
| `TextField11[7]` | `sect9.2NaturalizationOtherExplaination` | Text | Other explanation |
| `TextField11[15]` | `sect9.2NaturalizationCourt` | Text | Court name |
| `From_Datefield_Name_2[4]` | `sect9.2DateOfEntry` | Date | Date of entry |
| `#field[32]` | true | Checkbox | Estimate checkbox |
| `School6_State[1]` | State codes | Dropdown | Entry state |
| `TextField11[16]` | `sect9.2CityEntry` | Text | Entry city |
| `DropDownList15[0]` | Country list | Dropdown | Prior citizenship country |
| `TextField11[17]` | `9.2AlienRegistrationNumber` | Text | Alien registration number |
| `RadioButtonList[1]` | YES/NO | Radio | Has prior citizenship |
| `DropDownList15[1]` | Country list | Dropdown | Additional country |

### 4. Section 9.3 Fields (Derived)
**Form Path**: `form1[0].Section9\\.1-9\\.4[0].*`

| Field Name | Value Pattern | Type | Purpose |
|------------|---------------|------|---------|
| `TextField11[19]` | `sect9.3AlienNumber` | Text | Alien number |
| `TextField11[20]` | `sect9.3ResidentCard` | Text | Resident card |
| `TextField11[21]` | `sect9.3CertificateNumber` | Text | Certificate number |
| `TextField11[22]` | `9.3MiddleName` | Text | Middle name |
| `TextField11[23]` | `sect9.3LastName` | Text | Last name |
| `TextField11[24]` | `sect9.3FirstName` | Text | First name |
| `suffix[2]` | `sect9.3Suffix` | Dropdown | Suffix |
| `TextField11[25]` | `9.3OtherExplaination` | Text | Other explanation |
| `From_Datefield_Name_2[5]` | `sect9.3DateIssued` | Date | Date issued |

### 5. Section 9.4 Fields (Non-US Citizen)
**Form Path**: `form1[0].Section9\\.1-9\\.4[0].*`

| Field Name | Value Pattern | Type | Purpose |
|------------|---------------|------|---------|
| `From_Datefield_Name_2[1]` | `sect9.4DateOfEntry` | Date | Date of entry |
| `TextField11[8]` | `sect9.4ResidenceStatus` | Text | Residence status |
| `From_Datefield_Name_2[2]` | `9.4DocumentIssued` | Date | Document issued |
| `TextField11[9]` | `9.4AlienRegistrationNumb` | Text | Alien registration |
| `TextField11[10]` | `9.4DocumentMName` | Text | Document middle name |
| `TextField11[11]` | `9.4DocumentLName` | Text | Document last name |
| `TextField11[12]` | `9.4DocumentFName` | Text | Document first name |
| `suffix[1]` | `9.4Suffix` | Dropdown | Suffix |
| `From_Datefield_Name_2[3]` | `9.4DocumentExpeiration` | Date | Document expiration |
| `TextField11[13]` | `9.4DocumentNumber` | Text | Document number |
| `TextField11[14]` | `9.4Explaination` | Text | Explanation |
| `TextField11[18]` | `9.4City` | Text | City |
| `From_Datefield_Name_2[6]` | `9.4Expiration(I-766)` | Date | I-766 expiration |

## Key Issues Identified

1. **Field Name Mismatch**: Current context uses generic names like `documentType`, `firstName` but sections-reference shows specific patterns like `sect9.1OtherExplain`, `9.1FirstName`

2. **Path Structure**: Two different form paths:
   - `form1[0].Sections7-9[0].*` for main and 9.1 fields
   - `form1[0].Section9\\.1-9\\.4[0].*` for 9.2, 9.3, 9.4 fields

3. **Missing Fields**: Many fields in sections-reference are not implemented in current context

4. **Value Patterns**: Each field has specific value patterns that must be preserved for PDF mapping

## Context Implementation Gap Analysis

### Critical Issues Found

#### 1. **Field Name Mismatches**
The current context uses generic interface field names, but the sections-reference shows specific value patterns:

**Current Interface** → **Sections-Reference Value Pattern**
- `documentType` → Should use value `"FS 240 "`, `"DS 1350 "`, etc.
- `documentNumber` → Should use value `"DocumentNumber9.1"`
- `otherExplanation` → Should use value `"sect9.1OtherExplain"`
- `issueCity` → Should use value `"sect9.1City"`
- `firstName` → Should use value `"9.1FirstName"`
- `lastName` → Should use value `"9.1LastName"`
- `middleName` → Should use value `"9.1MiddleName"`

#### 2. **Missing Fields**
Many fields from sections-reference are not implemented:

**Section 9.1 Missing Fields:**
- `sect9.1Military Installation Base` (TextField11[18])
- Certificate name fields with specific patterns
- Multiple date and checkbox fields

**Section 9.2 Missing Fields:**
- `sect9.2NaturalizationCourt` (TextField11[15])
- `sect9.2DateOfEntry` (From_Datefield_Name_2[4])
- `sect9.2CityEntry` (TextField11[16])
- `9.2AlienRegistrationNumber` (TextField11[17])

**Section 9.3 Missing Fields:**
- `sect9.3AlienNumber` (TextField11[19])
- `sect9.3ResidentCard` (TextField11[20])
- `sect9.3CertificateNumber` (TextField11[21])
- `sect9.3DateIssued` (From_Datefield_Name_2[5])

**Section 9.4 Missing Fields:**
- `9.4City` (TextField11[18])
- `9.4Expiration(I-766)` (From_Datefield_Name_2[6])
- Multiple country dropdowns (DropDownList15[0-3])

#### 3. **Component Field Access Issues**
The Section9Component is calling update functions with field names that don't exist in the interface:

**Component Calls** → **Interface Reality**
- `updateBornToUSParentsInfo('documentType', value)` → `documentType` exists but wrong value pattern
- `updateNaturalizedInfo('naturalizedCertificateNumber', value)` → Field exists
- `updateDerivedInfo('certificateOfCitizenshipNumber', value)` → Field exists
- `updateNonUSCitizenInfo('entryDate', value)` → Field exists

#### 4. **Value Pattern Mismatches**
The sections-reference shows specific value patterns that must be preserved:
- Values like `"sect9.1OtherExplain"` are not just field names, they're the actual values
- These values are used for PDF field mapping and must be exact

#### 5. **Missing Integration with createFieldFromReference**
While the interface uses `createFieldFromReference`, the field paths don't match the actual sections-reference structure.

### Root Cause
The main issue is that the current implementation treats the sections-reference `value` field as a field name, when it's actually the **default value** that should be stored in the field. The actual field identification comes from the `name` and `id` properties.

## Section 29 Integration Pattern Analysis

### How Section 29 Successfully Implements Field Mapping

#### 1. **Uses createFieldFromReference Correctly**
```typescript
// Section 29 creates fields using sections-reference data
hasAssociation: createFieldFromReference(
  29,
  "form1[0].Section29[0].RadioButtonList[0]",
  "NO (If NO, proceed to 29.2)"
),
```

#### 2. **Implements updateFieldValueWrapper Pattern**
```typescript
// Section 29 bridges signature mismatch between integration and section-specific functions
const updateFieldValueWrapper = useCallback((path: string, value: any) => {
  // Parse path to extract subsection, entry index, and field path
  const pathParts = path.split('.');

  if (pathParts.length >= 4 && pathParts[0] === 'section29') {
    const subsectionKey = pathParts[1] as SubsectionKey;
    const entriesMatch = pathParts[2].match(/entries\[(\d+)\]/);

    if (entriesMatch) {
      const entryIndex = parseInt(entriesMatch[1]);
      const fieldPath = pathParts.slice(3).join('.');

      // Call Section 29's updateFieldValue with the correct signature
      updateFieldValue(subsectionKey, entryIndex, fieldPath, value);
      return;
    }
  }

  // Fallback for direct field updates
  setSection29Data(prev => {
    const updated = cloneDeep(prev);
    set(updated, path, value);
    return updated;
  });
}, [updateFieldValue]);
```

#### 3. **Uses Field Generator Functions**
Section 29 has sophisticated field generation that maps to sections-reference:
- `generateFieldId()` - Creates proper field IDs
- `generateFieldName()` - Creates proper field names
- `generateFieldLabel()` - Creates proper field labels
- `generateFieldRect()` - Creates proper field rectangles

#### 4. **Validates Field Count**
```typescript
// Validates against sections-reference metadata
validateSectionFieldCount(29, 141);
```

### Key Differences: Section 29 vs Section 9

| Aspect | Section 29 (Working) | Section 9 (Broken) |
|--------|---------------------|-------------------|
| **Field Creation** | Uses `createFieldFromReference()` with exact field names | Uses `createFieldFromReference()` but wrong field names |
| **Field Names** | Uses exact sections-reference `name` values | Uses generic interface field names |
| **Default Values** | Uses sections-reference `value` patterns | Uses empty strings |
| **Integration** | Has `updateFieldValueWrapper` | Has broken `updateFieldValueForIntegration` |
| **Field Generation** | Has sophisticated field generators | Has hardcoded field creation |
| **Validation** | Validates field count against sections-reference | No validation |

### Section 9 Fix Strategy Based on Section 29 Pattern

#### 1. **Create Field Generator Functions**
Like Section 29, Section 9 needs:
- `generateSection9FieldId(subsection, fieldType)`
- `generateSection9FieldName(subsection, fieldType)`
- `generateSection9FieldLabel(subsection, fieldType)`

#### 2. **Fix createFieldFromReference Calls**
Use exact field names from sections-reference:
```typescript
// Current (wrong)
documentType: createFieldFromReference(9, "documentType", "")

// Should be (correct)
documentType: createFieldFromReference(9, "form1[0].Sections7-9[0].RadioButtonList[3]", "FS 240 ")
```

#### 3. **Implement updateFieldValueWrapper**
Replace `updateFieldValueForIntegration` with proper wrapper following Section 29 pattern.

#### 4. **Add Missing Fields**
Implement all 78 fields from sections-reference with correct names and default values.

## Next Steps
1. **Create Section 9 Field Generator**: Build field generation functions like Section 29
2. **Fix Interface**: Update to use exact sections-reference field names and values
3. **Implement updateFieldValueWrapper**: Replace broken integration function
4. **Add Missing Fields**: Implement all 78 fields from sections-reference
5. **Update Component**: Fix component to use correct field paths
6. **Test Integration**: Verify data flows correctly to PDF generation
