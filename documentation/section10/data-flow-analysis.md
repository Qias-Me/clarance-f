# SF-86 Section 10 (Dual Citizenship & Foreign Passports) - Data Flow Analysis

**Analysis Date**: August 26, 2025  
**Analysis Depth**: Comprehensive architectural review  
**Section Complexity**: High (multi-entry CRUD with nested travel history and cross-section dependencies)

## Executive Summary

Section 10 (Dual Citizenship & Foreign Passports) implements comprehensive dual/multiple citizenship and foreign passport information collection through sophisticated multi-entry CRUD systems with nested travel history tables. This section features complex cross-section dependencies, with visibility controlled by Section 9 citizenship responses.

### Key Architectural Features
- **Perfect Field Coverage**: 100% of 122 PDF fields mapped and implemented
- **Multi-Entry CRUD Systems**: Advanced entry management with nested travel history capabilities
- **Cross-Section Integration**: Visibility controlled by Section 9 citizenship status responses
- **Nested Data Structures**: Complex travel history tables within passport entries

## Section 10 Field Distribution Analysis

### Entry Structure Pattern
- **Dual Citizenship Entries**: Multi-entry system for citizenship documentation
- **Foreign Passport Entries**: Multi-entry system with nested travel history tables
- **Travel History Integration**: Nested country-specific travel documentation per passport

**Key Metrics:**
- Total PDF Fields: 122
- UI Components: Multi-entry forms with nested travel tables and country selection
- Validation Rules: Entry limits, travel country constraints, passport validation
- Security Level: High (dual citizenship and foreign passport information critical for security assessment)
- Special Features: Nested travel countries, cross-section dependencies, conditional visibility
- Multi-entry architecture supporting up to 2 citizenship entries and 2 passport entries
- Nested travel country tables (6 countries per passport)
- Complex conditional field display patterns
- Entry-specific PDF field mapping variations

---

## Architecture Layers

### 1. UI Component Layer
**File:** `app/components/Rendered2.0/Section10Component.tsx`

#### Component Structure
```typescript
Section10Component: React.FC<Section10ComponentProps> = ({
  className?: string,
  onValidationChange?: (isValid: boolean) => void,
  onNext?: () => void
})
```

#### Key Features
- **Dual citizenship section** with entry management
- **Foreign passport section** with travel country tables
- **Progressive rendering** for performance optimization
- **Submit-only mode** to prevent auto-save on keystrokes
- **Real-time validation feedback** with error display
- **Cross-section integration** with Section 9 dependencies

#### Data Flow Patterns
```typescript
// Main flag updates
updateDualCitizenshipFlag(value: string) → Context → State Update

// Entry management
addDualCitizenship() → createDualCitizenshipEntry(index) → State Update
removeDualCitizenship(index) → removeDualCitizenshipEntry() → State Update
updateDualCitizenship(index, field, value) → updateFieldValue() → State Update

// Travel country management (nested within passports)
addTravelCountry(passportIndex) → createTravelCountryEntry() → State Update
updateTravelCountry(passportIndex, travelIndex, field, value) → State Update
```

#### Conditional Rendering Logic
```typescript
// Dual citizenship conditional display
{section10Data.section10.dualCitizenship?.hasDualCitizenship?.value === 'YES' && (
  // Show dual citizenship entries (max 2)
)}

// Foreign passport conditional display  
{section10Data.section10.foreignPassport?.hasForeignPassport?.value === 'YES' && (
  // Show passport entries with travel tables (max 2 passports, 6 countries each)
)}

// Entry limits and add button visibility
{canAddDualCitizenship() && (
  <button onClick={addDualCitizenship}>Add Citizenship ({entries.length + 1} of 2)</button>
)}
```

#### Travel Countries Table Integration
```typescript
// Nested table rendering within passport entries
const renderTravelCountriesTable = (passport: any, passportIndex: number) => {
  return (
    <table>
      {passport.travelCountries.map((travel, travelIndex) => (
        <tr key={`travel-${passportIndex}-${travelIndex}`}>
          <td>Country Selection</td>
          <td>Date Range with Estimates</td>
          <td>Present Checkbox</td>
          <td>Remove Action</td>
        </tr>
      ))}
    </table>
  );
};
```

### 2. Interface Layer
**File:** `api/interfaces/section-interfaces/section10.ts`

#### Core Data Structures
```typescript
// Travel country entry for passport travel history
export interface TravelCountryEntry {
  country: Field<string>;
  fromDate: Field<string>;
  isFromDateEstimated: Field<boolean>;
  toDate: Field<string>;
  isToDateEstimated: Field<boolean>;
  isPresent: Field<boolean>;
}

// Dual citizenship entry (max 2)
export interface DualCitizenshipEntry {
  country: Field<string>;
  howAcquired: Field<string>;
  fromDate: Field<string>;
  toDate: Field<string>;
  isFromEstimated: Field<boolean>;
  isToEstimated: Field<boolean>;
  isPresent: Field<boolean>;
  hasRenounced: Field<string>;
  renounceExplanation: Field<string>;
  hasTakenAction: Field<string>;
  actionExplanation: Field<string>;
}

// Foreign passport entry with nested travel countries (max 2)
export interface ForeignPassportEntry {
  country: Field<string>;
  issueDate: Field<string>;
  isIssueDateEstimated: Field<boolean>;
  city: Field<string>;
  country2: Field<string>;
  lastName: Field<string>;
  firstName: Field<string>;
  middleName: Field<string>;
  suffix: Field<string>;
  passportNumber: Field<string>;
  expirationDate: Field<string>;
  isExpirationDateEstimated: Field<boolean>;
  usedForUSEntry: Field<boolean>;
  travelCountries: TravelCountryEntry[]; // Max 6 per passport
}
```

#### Field Creation Using Single Source of Truth
```typescript
// Uses sections-reference as authoritative field mapping source
export const createDualCitizenshipEntry = (index: number = 0): DualCitizenshipEntry => {
  if (index === 0) {
    // Entry 1: Uses Section10\.1-10\.2 pattern
    return {
      country: createFieldFromReference(10, 'form1[0].Section10\\.1-10\\.2[0].DropDownList13[0]', ''),
      howAcquired: createFieldFromReference(10, 'form1[0].Section10\\.1-10\\.2[0].TextField11[0]', ''),
      // ... other fields with Entry 1 patterns
    };
  }
  
  if (index === 1) {
    // Entry 2: Uses adjusted field indices
    return {
      country: createFieldFromReference(10, 'form1[0].Section10\\.1-10\\.2[0].DropDownList13[1]', ''),
      howAcquired: createFieldFromReference(10, 'form1[0].Section10\\.1-10\\.2[0].TextField11[3]', ''),
      // ... other fields with Entry 2 patterns
    };
  }
};

// Travel country creation with special Row 6 handling
export const createTravelCountryEntry = (passportIndex: number, rowIndex: number): TravelCountryEntry => {
  const sectionPattern = passportIndex === 0 ? 'Section10\\.1-10\\.2' : 'Section10-2';
  const isRow6 = rowIndex === 5;
  const rowPattern = isRow6 ? 'Row5[1]' : `Row${rowIndex + 1}[0]`;
  
  if (isRow6) {
    // Row 6 uses #field pattern instead of Cell pattern
    return {
      country: createFieldFromReference(10, `${basePattern}.#field[0]`, ''),
      fromDate: createFieldFromReference(10, `${basePattern}.#field[1]`, ''),
      // ... other fields with #field pattern
    };
  }
  // Rows 1-5 use Cell pattern
};
```

### 3. PDF Mapping Layer
**File:** `api/mappings/section-10-mappings.json`

#### Mapping Statistics
- **Total mappings:** 122 field mappings
- **Accuracy:** 100.00% (122/122 valid)
- **Coverage:** Complete dual citizenship, passport, and travel country mappings

#### Key Mapping Patterns
```json
{
  "mappings": [
    // Main section flags
    {
      "uiPath": "section10.dualCitizenship.hasDualCitizenship",
      "pdfFieldId": "form1[0].Section10\\.1-10\\.2[0].RadioButtonList[0]"
    },
    {
      "uiPath": "section10.foreignPassport.hasForeignPassport", 
      "pdfFieldId": "form1[0].Section10\\.1-10\\.2[0].RadioButtonList[5]"
    },

    // Dual citizenship Entry 1 vs Entry 2 patterns
    {
      "uiPath": "section10.dualCitizenship.entries[0].country",
      "pdfFieldId": "form1[0].Section10\\.1-10\\.2[0].DropDownList13[0]"
    },
    {
      "uiPath": "section10.dualCitizenship.entries[1].country", 
      "pdfFieldId": "form1[0].Section10\\.1-10\\.2[0].DropDownList13[1]"
    },

    // Foreign passport Entry 1 vs Entry 2 section patterns
    {
      "uiPath": "section10.foreignPassport.entries[0].country",
      "pdfFieldId": "form1[0].Section10\\.1-10\\.2[0].DropDownList14[0]"
    },
    {
      "uiPath": "section10.foreignPassport.entries[1].country",
      "pdfFieldId": "form1[0].Section10-2[0].DropDownList14[0]"
    },

    // Travel countries with Row variations (Entry 1)
    {
      "uiPath": "section10.foreignPassport.entries[0].travelCountries[0].country",
      "pdfFieldId": "form1[0].Section10\\.1-10\\.2[0].Table1[0].Row1[0].Cell1[0]"
    },
    {
      "uiPath": "section10.foreignPassport.entries[0].travelCountries[5].country",
      "pdfFieldId": "form1[0].Section10\\.1-10\\.2[0].Table1[0].Row5[1].#field[0]"
    },

    // Travel countries for Entry 2 (Section10-2 pattern)
    {
      "uiPath": "section10.foreignPassport.entries[1].travelCountries[0].country",
      "pdfFieldId": "form1[0].Section10-2[0].Table1[0].Row1[0].Cell1[0]"
    }
  ]
}
```

#### PDF Field Pattern Analysis
```
Entry 1 Patterns:
- Section: form1[0].Section10\.1-10\.2[0]
- Dual citizenship: DropDownList13[0], TextField11[0-2], RadioButtonList[1-2]
- Passports: DropDownList14[0], TextField11[6-10], RadioButtonList[6]
- Travel countries: Table1[0].Row{1-5}[0].Cell{1-5}[0] or Row5[1].#field[0-5]

Entry 2 Patterns:
- Dual citizenship: Same section, incremented indices
- Passports: form1[0].Section10-2[0] (different section!)
- Travel countries: Section10-2[0].Table1[0] with same row/cell patterns
```

### 4. Context Layer
**File:** `app/state/contexts/sections2.0/section10.tsx`

#### State Management Architecture
```typescript
interface Section10ContextType {
  // Core state
  section10Data: Section10;
  isLoading: boolean;
  errors: Record<string, string>;
  isDirty: boolean;

  // Multi-level CRUD operations
  updateDualCitizenshipFlag: (value: string) => void;
  addDualCitizenship: () => void;
  removeDualCitizenship: (index: number) => void;
  updateDualCitizenship: (index: number, field: string, value: any) => void;
  
  // Nested travel country management
  addTravelCountry: (passportIndex: number) => void;
  removeTravelCountry: (passportIndex: number, travelIndex: number) => void;
  updateTravelCountry: (passportIndex: number, travelIndex: number, field: string, value: any) => void;
  canAddTravelCountry: (passportIndex: number) => boolean;
}
```

#### Advanced State Operations
```typescript
// Multi-level field updates for travel countries
const updateTravelCountry = useCallback((
  passportIndex: number, 
  travelIndex: number, 
  field: string, 
  value: any
) => {
  setSection10Data(prev => {
    // Efficient shallow copying approach
    const newPassportEntries = [...prev.section10.foreignPassport.entries];
    const passportToUpdate = newPassportEntries[passportIndex];
    
    if (passportToUpdate?.travelCountries[travelIndex]) {
      const updatedPassport = {
        ...passportToUpdate,
        travelCountries: [...passportToUpdate.travelCountries]
      };
      
      const travelEntry = { ...updatedPassport.travelCountries[travelIndex] };
      
      // Handle Field<T> object updates
      if (travelEntry[field]?.value !== undefined) {
        travelEntry[field] = { ...travelEntry[field], value };
      }
      
      // Special handling for "Present" checkbox logic
      if (field === "isPresent" && value === true) {
        travelEntry.toDate = { ...travelEntry.toDate, value: "Present" };
      }
      
      updatedPassport.travelCountries[travelIndex] = travelEntry;
      newPassportEntries[passportIndex] = updatedPassport;
      
      return {
        ...prev,
        section10: {
          ...prev.section10,
          foreignPassport: {
            ...prev.section10.foreignPassport,
            entries: newPassportEntries
          }
        }
      };
    }
    return prev;
  });
}, []);
```

#### Entry Limit Management
```typescript
// React Strict Mode protection with timestamp tracking
const addDualCitizenship = useCallback(() => {
  setSection10Data(prev => {
    if (prev.section10.dualCitizenship.entries.length >= 2) {
      return prev; // Hard limit enforcement
    }
    
    // Prevent double execution in React Strict Mode
    const currentCount = prev.section10.dualCitizenship.entries.length;
    const now = Date.now();
    const lastOp = lastDualCitizenshipOpRef.current;
    
    if (now - lastOp.timestamp < 50 && currentCount === lastOp.count) {
      return prev; // Skip duplicate calls
    }
    
    lastDualCitizenshipOpRef.current = { count: currentCount + 1, timestamp: now };
    return addDualCitizenshipEntry(prev);
  });
}, []);
```

#### Submit-Only Mode Implementation
```typescript
// Prevents auto-save on every keystroke
const [submitOnlyMode] = useState(true);
const [pendingChanges, setPendingChanges] = useState(false);

const submitSectionData = useCallback(async () => {
  if (submitOnlyMode) {
    const currentData = currentDataRef.current;
    sf86Form.updateSectionData('section10', currentData);
    
    lastSubmittedDataRef.current = cloneDeep(currentData);
    setPendingChanges(false);
  }
}, [submitOnlyMode, sf86Form]);

const hasPendingChanges = useCallback(() => {
  return pendingChanges;
}, [pendingChanges]);
```

---

## Multi-Entry Architecture Analysis

### 1. Dual Citizenship System (Max 2 Entries)

#### Entry Management Flow
```
User clicks "I have dual citizenship" checkbox
├─ updateDualCitizenshipFlag('YES')
├─ Auto-add first entry if none exist
└─ Show entry management UI

Add Entry Flow:
├─ Check canAddDualCitizenship() (< 2 entries)
├─ addDualCitizenship() → createDualCitizenshipEntry(index)
├─ Use index-specific PDF field patterns
└─ Update state with new entry

Field Update Flow:
├─ updateDualCitizenship(index, field, value)
├─ Route through updateFieldValue('dualCitizenship', index, field, value)
├─ Shallow copy entry at index
└─ Update specific field with Field<T> structure
```

#### Entry-Specific Field Patterns
```typescript
// Entry 0 (first entry)
country: form1[0].Section10\.1-10\.2[0].DropDownList13[0]
howAcquired: form1[0].Section10\.1-10\.2[0].TextField11[0]
hasRenounced: form1[0].Section10\.1-10\.2[0].RadioButtonList[1]

// Entry 1 (second entry)  
country: form1[0].Section10\.1-10\.2[0].DropDownList13[1]
howAcquired: form1[0].Section10\.1-10\.2[0].TextField11[3]  // Note: index jump
hasRenounced: form1[0].Section10\.1-10\.2[0].RadioButtonList[3]  // Note: index jump
```

### 2. Foreign Passport System (Max 2 Entries)

#### Cross-Section Pattern Variation
```typescript
// Entry 0: Uses Section10\.1-10\.2 pattern
passport0.country: form1[0].Section10\.1-10\.2[0].DropDownList14[0]
passport0.city: form1[0].Section10\.1-10\.2[0].TextField11[6]

// Entry 1: Uses completely different Section10-2 pattern  
passport1.country: form1[0].Section10-2[0].DropDownList14[0]
passport1.city: form1[0].Section10-2[0].TextField11[0]  // Note: resets to [0]
```

#### Travel Countries Nested System (6 per Passport)
```typescript
// Row 1-5 pattern for passport 0
travel0.country: form1[0].Section10\.1-10\.2[0].Table1[0].Row1[0].Cell1[0]
travel1.country: form1[0].Section10\.1-10\.2[0].Table1[0].Row2[0].Cell1[0]

// Special Row 6 pattern (Row5[1] with #field)
travel5.country: form1[0].Section10\.1-10\.2[0].Table1[0].Row5[1].#field[0]

// Passport 1 travels use Section10-2 but same table structure
travel0.country: form1[0].Section10-2[0].Table1[0].Row1[0].Cell1[0]
```

### 3. Dynamic Field Management

#### Conditional Field Display
```typescript
// Estimate checkboxes disable/enable date fields
if (isFromEstimated.checked) {
  // Show estimation indicator, keep date field enabled
}

// Present checkbox clears and disables "To Date"
if (isPresent.checked) {
  toDate.value = "Present";
  toDate.disabled = true;
  isToEstimated.disabled = true;
}

// Travel country validation only triggers if country selected
if (travelCountry.country.value && !travelCountry.fromDate.value) {
  validationErrors.push("From date required when country specified");
}
```

#### Add/Remove Button States
```typescript
// Dynamic button text and availability
const canAddDualCitizenship = () => entries.length < 2;
const buttonText = `Add Dual Citizenship (${entries.length + 1} of 2)`;
const showButton = canAddDualCitizenship();
const showMaxMessage = !canAddDualCitizenship() && entries.length >= 2;

// Similar pattern for travel countries (6 per passport)
const canAddTravelCountry = (passportIndex) => 
  passport.travelCountries.length < 6;
```

---

## Cross-Section Integration

### 1. Section 9 Dependency
```typescript
// Section 10 visibility controlled by Section 9 responses
// If Section 9 indicates foreign contacts, Section 10 becomes required
// Complex visibility logic based on multiple Section 9 field combinations

const shouldShowSection10 = () => {
  const section9Data = sf86Form.formData.section9;
  return (
    section9Data?.foreignContacts?.hasForeignContacts?.value === 'YES' ||
    section9Data?.foreignActivities?.hasActivities?.value === 'YES'
    // ... other Section 9 triggers
  );
};
```

### 2. PDF Generation Integration
```typescript
// Section 10 data flattening for PDF
const flattenSection10Fields = (): Record<string, any> => {
  const flatFields: Record<string, any> = {};
  
  // Main flags
  addField(section10Data.section10.dualCitizenship.hasDualCitizenship, 'dual-flag');
  addField(section10Data.section10.foreignPassport.hasForeignPassport, 'passport-flag');
  
  // Recursive flattening of all entries and nested travel countries
  section10Data.section10.dualCitizenship.entries.forEach((entry, index) => {
    flattenEntry(entry, `section10.dualCitizenship.entries.${index}`);
  });
  
  section10Data.section10.foreignPassport.entries.forEach((entry, index) => {
    flattenEntry(entry, `section10.foreignPassport.entries.${index}`);
    // Include nested travel countries
    entry.travelCountries.forEach((travel, travelIndex) => {
      flattenEntry(travel, `section10.foreignPassport.entries.${index}.travelCountries.${travelIndex}`);
    });
  });
  
  return flatFields;
};
```

---

## Performance Optimizations

### 1. State Update Efficiency
```typescript
// Shallow copying instead of deep cloning for better performance
const updateTravelCountry = (passportIndex, travelIndex, field, value) => {
  setSection10Data(prev => {
    // Create shallow copies only where needed
    const newPassportEntries = [...prev.section10.foreignPassport.entries];
    const passportToUpdate = newPassportEntries[passportIndex];
    
    const updatedPassport = {
      ...passportToUpdate,
      travelCountries: [...passportToUpdate.travelCountries]
    };
    
    const travelEntry = { ...updatedPassport.travelCountries[travelIndex] };
    travelEntry[field] = { ...travelEntry[field], value };
    
    updatedPassport.travelCountries[travelIndex] = travelEntry;
    newPassportEntries[passportIndex] = updatedPassport;
    
    return {
      ...prev,
      section10: {
        ...prev.section10,
        foreignPassport: {
          ...prev.section10.foreignPassport,
          entries: newPassportEntries
        }
      }
    };
  });
};
```

### 2. Validation Performance
```typescript
// Validation only on explicit calls, not on every data change
const validateSection = useCallback((): ValidationResult => {
  // Use ref to avoid dependencies on data changes
  const currentData = currentDataRef.current;
  
  const validationErrors: ValidationError[] = [];
  
  // Efficient validation logic without triggering re-renders
  if (currentData.section10.dualCitizenship.hasDualCitizenship.value === 'YES') {
    currentData.section10.dualCitizenship.entries.forEach((entry, index) => {
      // Validate required fields with specific error paths
      if (!entry.country.value) {
        validationErrors.push({
          field: `dualCitizenship.entries[${index}].country`,
          message: 'Country is required',
          code: 'REQUIRED_FIELD'
        });
      }
    });
  }
  
  return {
    isValid: validationErrors.length === 0,
    errors: validationErrors
  };
}, []); // No dependencies prevents re-creation
```

### 3. React Strict Mode Protection
```typescript
// Timestamp-based duplicate operation detection
const lastOperationRefs = {
  dualCitizenship: useRef({ count: 0, timestamp: 0 }),
  foreignPassport: useRef({ count: 0, timestamp: 0 }),
  travelCountry: useRef({ passportIndex: -1, count: 0, timestamp: 0 })
};

const addEntry = useCallback((operationType) => {
  setData(prev => {
    const currentCount = getCurrentCount(prev, operationType);
    const now = Date.now();
    const lastOp = lastOperationRefs[operationType].current;
    
    // Skip if duplicate call within 50ms
    if (now - lastOp.timestamp < 50 && currentCount === lastOp.count) {
      return prev;
    }
    
    lastOperationRefs[operationType].current = { 
      count: currentCount + 1, 
      timestamp: now 
    };
    
    return performActualAddition(prev, operationType);
  });
}, []);
```

---

## Error Handling & Validation

### 1. Multi-Level Validation
```typescript
// Field-level validation
const validateField = (entry, field, index) => {
  const errors = [];
  
  if (field.required && !entry[field.name].value) {
    errors.push({
      field: `entries[${index}].${field.name}`,
      message: `${field.label} is required`,
      code: 'REQUIRED_FIELD'
    });
  }
  
  return errors;
};

// Entry-level validation
const validateEntry = (entry, index, entryType) => {
  const errors = [];
  
  // Cross-field validation (e.g., date ranges)
  if (entry.fromDate.value && entry.toDate.value && !entry.isPresent.value) {
    if (new Date(entry.fromDate.value) > new Date(entry.toDate.value)) {
      errors.push({
        field: `entries[${index}].dateRange`,
        message: 'From date must be before To date',
        code: 'INVALID_DATE_RANGE'
      });
    }
  }
  
  return errors;
};

// Section-level validation
const validateSection = () => {
  const errors = [];
  
  // Validate all dual citizenship entries
  if (dualCitizenship.hasDualCitizenship.value === 'YES') {
    dualCitizenship.entries.forEach((entry, index) => {
      errors.push(...validateEntry(entry, index, 'dualCitizenship'));
    });
  }
  
  // Validate all passport entries and their travel countries
  if (foreignPassport.hasForeignPassport.value === 'YES') {
    foreignPassport.entries.forEach((entry, index) => {
      errors.push(...validateEntry(entry, index, 'foreignPassport'));
      
      // Validate nested travel countries
      entry.travelCountries.forEach((travel, travelIndex) => {
        if (travel.country.value && !travel.fromDate.value) {
          errors.push({
            field: `foreignPassport.entries[${index}].travelCountries[${travelIndex}].fromDate`,
            message: 'From date required when country is specified'
          });
        }
      });
    });
  }
  
  return { isValid: errors.length === 0, errors };
};
```

### 2. Error Display Integration
```typescript
// Component-level error display
{errors[`dualCitizenship.entries[${index}].country`] && (
  <p className="text-red-600 text-sm">
    {errors[`dualCitizenship.entries[${index}].country`]}
  </p>
)}

// Travel country error display (nested)
{errors[`foreignPassport.entries[${passportIndex}].travelCountries[${travelIndex}].country`] && (
  <p className="text-red-600 text-xs">
    {errors[`foreignPassport.entries[${passportIndex}].travelCountries[${travelIndex}].country`]}
  </p>
)}

// Section-level validation summary
{Object.keys(errors).length > 0 && (
  <div className="validation-summary">
    <h4>Errors ({Object.keys(errors).length}):</h4>
    <ul>
      {Object.entries(errors).slice(0, 5).map(([field, message]) => (
        <li key={field}>• {message}</li>
      ))}
    </ul>
  </div>
)}
```

---

## Data Persistence Strategy

### 1. Submit-Only Mode
```typescript
// Prevents auto-save on every keystroke for performance
const [submitOnlyMode] = useState(true);
const [pendingChanges, setPendingChanges] = useState(false);

// Manual data submission
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  
  const validationResult = performValidation();
  
  if (validationResult.isValid) {
    // Sync to central form context
    sf86Form.updateSectionData('section10', section10Data);
    
    // Persist to storage
    const currentFormData = sf86Form.exportForm();
    const updatedFormData = { ...currentFormData, section10: section10Data };
    await sf86Form.saveForm(updatedFormData);
    
    // Mark as complete
    sf86Form.markSectionComplete('section10');
    
    if (onNext) onNext();
  }
};
```

### 2. Change Tracking
```typescript
// Efficient change detection
const hasPendingChanges = useCallback(() => {
  if (!lastSubmittedDataRef.current) return false;
  
  const current = currentDataRef.current;
  const submitted = lastSubmittedDataRef.current;
  
  // Check key structural changes rather than full JSON comparison
  return (
    current.section10.dualCitizenship.hasDualCitizenship.value !== 
    submitted.section10.dualCitizenship.hasDualCitizenship.value ||
    current.section10.foreignPassport.hasForeignPassport.value !== 
    submitted.section10.foreignPassport.hasForeignPassport.value ||
    current.section10.dualCitizenship.entries.length !== 
    submitted.section10.dualCitizenship.entries.length ||
    current.section10.foreignPassport.entries.length !== 
    submitted.section10.foreignPassport.entries.length
  );
}, []);
```

---

## Summary

SF-86 Section 10 demonstrates sophisticated multi-entry CRUD architecture with:

**Key Strengths:**
- **Multi-level nesting**: Passports contain travel country tables
- **Entry-specific patterns**: Different PDF field patterns for Entry 1 vs Entry 2
- **Performance optimization**: Shallow copying and efficient state updates
- **React Strict Mode protection**: Timestamp-based duplicate operation detection
- **Submit-only mode**: Prevents auto-save performance issues
- **Comprehensive validation**: Multi-level validation with specific error paths

**Complex Features:**
- **Cross-section dependencies**: Visibility controlled by Section 9
- **Dynamic field management**: Conditional field display and validation
- **Table row variations**: Special handling for Row 6 in travel countries
- **Entry limits**: Hard limits with user-friendly messaging (2 citizenships, 2 passports, 6 countries)

**Architecture Benefits:**
- **Single source of truth**: Uses sections-reference for field mappings
- **Efficient updates**: Shallow copying strategies for nested data
- **Robust validation**: Field, entry, and section-level validation layers
- **Performance-focused**: Optimized for large forms with nested data structures

This architecture serves as a reference implementation for complex multi-entry form sections with nested data tables and sophisticated field management requirements.