# Section 17 Field Categorization Analysis

**Total Fields: 332**

Based on systematic analysis of `api/sections-references/section-17.json`, here are the distinct subsection patterns found:

## Subsection Patterns Discovered

### 1. **Section17_1[0]** - Current Spouse/Marriage Information
- **Field Count**: ~80+ fields
- **Purpose**: Current marriage, spouse details, contact information, addresses
- **Key Field Patterns**:
  - `TextField11[0-19]` - Various text inputs (names, addresses, phones, etc.)
  - `#area[0-5]` - Grouped field areas for dates, addresses, other names
  - `DropDownList12[0-1]` - Country/citizenship dropdowns
  - `RadioButtonList[0-3]` - Yes/No questions and status selections
  - `From_Datefield_Name_2[0-6]` / `To_Datefield_Name_2[0-3]` - Date ranges
  - `suffix[0-4]` - Name suffixes
  - `#field[10-79]` - Various checkboxes and field controls

### 2. **Section17_1_2[0]** - Additional Current Spouse Information (Second Entry)
- **Field Count**: ~50+ fields  
- **Purpose**: Extended current spouse information, additional addresses
- **Key Field Patterns**:
  - `TextField11[0-13]` - Extended text fields
  - `#area[0-2]` - Grouped areas for addresses and contact info
  - `DropDownList4[0]`, `DropDownList31[0]`, `DropDownList13[0]`, `DropDownList14[0]` - Various dropdowns
  - `RadioButtonList[0-1]` - Status questions
  - `School6_State[0-4]` - State selection fields

### 3. **Section17_2[0]** - Former Spouse Information (First Former Spouse)
- **Field Count**: ~30+ fields
- **Purpose**: First former spouse details, marriage/divorce information
- **Key Field Patterns**:
  - `TextField11[0-8]` - Former spouse name, contact, dates (NO SSN!)
  - `#area[4-7]` - Birth info, marriage location, last known address
  - `DropDownList12[0-1]` - Country fields
  - `RadioButtonList[0-1]` - Marriage status, deceased status
  - `From_Datefield_Name_2[0-2]` - Marriage and divorce dates

### 4. **Section17_2_2[0]** - Former Spouse Information (Second Former Spouse)
- **Field Count**: ~30+ fields
- **Purpose**: Second former spouse (same structure as Section17_2)
- **Field Patterns**: Identical to Section17_2[0]

### 5. **Section17_3[0]** - Cohabitant Information (First Cohabitant)
- **Field Count**: ~70+ fields
- **Purpose**: First cohabitant details, cohabitation periods, personal info
- **Key Field Patterns**:
  - `TextField11[0-18]` - Cohabitant personal information
  - `#area[0-4]` - Date ranges, addresses, birth information
  - `DropDownList12[0-1]` - Country fields
  - `RadioButtonList[0-4]` - Various status questions
  - `From_Datefield_Name_2[0-6]` / `To_Datefield_Name_2[0-3]` - Date periods
  - `#field[8-71]` - Extensive checkbox controls

### 6. **Section17_3_2[0]** - Cohabitant Information (Second Cohabitant)
- **Field Count**: ~70+ fields
- **Purpose**: Second cohabitant (same structure as Section17_3)
- **Field Patterns**: Identical to Section17_3[0]

## Critical Field Mapping Insights

### Name Field Patterns:
- **Current Spouse** (Section17_1): `TextField11[6]=middle, TextField11[7]=last, TextField11[8]=first`
- **Former Spouse** (Section17_2): `TextField11[0]=middle, TextField11[1]=last, TextField11[2]=first`
- **Cohabitant** (Section17_3): `TextField11[6]=middle, TextField11[7]=last, TextField11[8]=first` (same as current spouse)

### SSN Fields:
- **Current Spouse**: `TextField11[9]` (HAS SSN)
- **Former Spouse**: NO SSN fields present
- **Cohabitant**: `TextField11[16]` (HAS SSN)

### Date of Birth:
- **Current Spouse**: `From_Datefield_Name_2[3]`
- **Former Spouse**: `From_Datefield_Name_2[0]`  
- **Cohabitant**: `From_Datefield_Name_2[3]`

### Citizenship:
- All subsections use `DropDownList12[0]` for primary citizenship

### Documentation Fields:
- **Current Spouse**: `TextField11[10]=document number, TextField11[11]=explanation`
- **Former Spouse**: No documentation fields
- **Cohabitant**: `TextField11[17]=document number, TextField11[18]=explanation`

### Address Patterns:
- Complex nested `#area[X]` structures for different address types
- Multiple `School6_State[X]` and country dropdown fields
- Special `Address_Full_short_line[0]` patterns for divorce locations

## Multiple Entry Support

The JSON contains multiple instances of each subsection:
- **Section17_1** appears 3 times (lines ~17, ~14454, ~28892)
- **Section17_1_2** appears 3 times (lines ~2593, ~17030, ~31468)  
- **Section17_2** appears 3 times (lines ~4613, ~19050, ~33488)
- **Section17_2_2** appears 3 times (lines ~7104, ~21541, ~35979)
- **Section17_3** appears 3 times (lines ~9596, ~24033, ~38471)
- **Section17_3_2** appears 3 times (lines ~12036, ~26473, ~40911)

This indicates the PDF supports multiple entries for each relationship type.

## Next Steps for Interface Mapping

1. **Extract field labels** for each field to understand their exact purpose
2. **Map each subsection** to appropriate TypeScript interfaces
3. **Create comprehensive field origin mapping** for all 332 fields
4. **Account for multiple entry patterns** in interface design
5. **Follow section29 implementation patterns** for consistency 