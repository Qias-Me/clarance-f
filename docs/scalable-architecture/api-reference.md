# SF-86 Scalable Architecture API Reference

Comprehensive API reference for the scalable SF-86 form architecture including interfaces, hooks, utilities, and integration methods.

## 🎯 Overview

This reference covers:
- **Core Interfaces**: Base types and data structures
- **SF86FormContext API**: Central form coordinator methods
- **Section Integration API**: Integration framework methods
- **Shared Utilities**: Common utilities and helpers
- **Event System API**: Event-driven communication
- **Validation API**: Validation interfaces and methods

## 📋 Core Interfaces

### Field<T>

Base interface for all form fields with type safety and validation support.

```typescript
interface Field<T> {
  id: string;                    // PDF-compliant field ID
  type: FieldType;              // Field input type
  label: string;                // Human-readable label
  value: T;                     // Typed value
  isDirty: boolean;             // Has been modified
  isValid: boolean;             // Passes validation
  errors: string[];             // Validation error messages
}

type FieldType = 
  | 'text' 
  | 'radio' 
  | 'checkbox' 
  | 'date' 
  | 'select' 
  | 'textarea' 
  | 'tel';
```

**Usage:**
```typescript
const nameField: Field<string> = {
  id: "form1[0].Section29[0].TextField[0]",
  type: "text",
  label: "Organization Name",
  value: "",
  isDirty: false,
  isValid: true,
  errors: []
};

const hasAssociationField: Field<"YES" | "NO"> = {
  id: "form1[0].Section29[0].RadioButtonList[0]",
  type: "radio",
  label: "Have you ever been associated with terrorism?",
  value: "NO",
  isDirty: false,
  isValid: true,
  errors: []
};
```

### ValidationResult

Interface for validation results with structured error reporting.

```typescript
interface ValidationResult {
  isValid: boolean;             // Overall validation status
  errors: ValidationError[];    // Array of validation errors
  warnings: ValidationError[]; // Array of validation warnings
}

interface ValidationError {
  field: string;                // Field path (dot notation)
  message: string;              // Human-readable error message
  code: ValidationErrorCode;    // Error type code
  severity: 'error' | 'warning'; // Error severity level
}

type ValidationErrorCode = 
  | 'REQUIRED'
  | 'INVALID_FORMAT'
  | 'CROSS_SECTION_CONFLICT'
  | 'REQUIRED_CONDITIONAL'
  | 'VALIDATION_ERROR';
```

**Usage:**
```typescript
const validationResult: ValidationResult = {
  isValid: false,
  errors: [
    {
      field: 'terrorismOrganizations.hasAssociation',
      message: 'Please answer about terrorism organizations',
      code: 'REQUIRED',
      severity: 'error'
    }
  ],
  warnings: []
};
```

### Address

Standard address interface used across all sections.

```typescript
interface Address {
  street: Field<string>;
  city: Field<string>;
  state: Field<string>;
  zipCode: Field<string>;
  country: Field<string>;
}
```

### DateRange

Standard date range interface with estimation support.

```typescript
interface DateRange {
  from: {
    date: Field<string>;
    estimated: Field<boolean>;
  };
  to: {
    date: Field<string>;
    estimated: Field<boolean>;
  };
  present: Field<boolean>;
}
```

## 🏗️ SF86FormContext API

### useSF86Form()

Main hook for accessing the central SF86FormContext.

```typescript
interface SF86FormContextType {
  // Global Form State
  formData: ApplicantFormValues;
  isDirty: boolean;
  isValid: boolean;
  completedSections: string[];
  activeSections: string[];
  registeredSections: SectionRegistration[];

  // Section Management
  registerSection: (registration: SectionRegistration) => void;
  unregisterSection: (sectionId: string) => void;
  markSectionComplete: (sectionId: string) => void;
  markSectionIncomplete: (sectionId: string) => void;

  // Data Management
  updateSectionData: (sectionId: string, data: any) => void;
  getSectionData: (sectionId: string) => any;
  getFormChanges: () => Record<string, any>;

  // Validation
  validateAllSections: () => ValidationResult;
  validateSection: (sectionId: string) => ValidationResult;

  // Navigation
  navigateToSection: (sectionId: string) => void;
  getNextSection: (currentSectionId: string) => string | null;
  getPreviousSection: (currentSectionId: string) => string | null;
  getNextIncompleteSection: () => string | null;

  // Persistence
  saveForm: () => Promise<void>;
  loadForm: (data: ApplicantFormValues) => void;
  enableAutoSave: () => void;
  disableAutoSave: () => void;

  // Event System
  emitEvent: (event: FormEvent) => void;
  subscribeToEvents: (eventType: string, callback: EventCallback) => () => void;
}
```

**Usage:**
```typescript
const MyComponent = () => {
  const {
    formData,
    isDirty,
    markSectionComplete,
    navigateToSection,
    saveForm
  } = useSF86Form();

  const handleComplete = async () => {
    markSectionComplete('section29');
    await saveForm();
    navigateToSection('section30');
  };

  return (
    <div>
      <p>Form is {isDirty ? 'dirty' : 'clean'}</p>
      <button onClick={handleComplete}>Complete & Continue</button>
    </div>
  );
};
```

### SectionRegistration

Interface for registering sections with the central form.

```typescript
interface SectionRegistration {
  sectionId: string;            // Unique section identifier
  sectionName: string;          // Human-readable section name
  validateSection: () => ValidationResult;
  getChanges: () => any;
  expectedFieldCount?: number;  // Expected number of fields
  dependencies?: string[];      // Required sections
}
```

## 🔗 Section Integration API

### useSection86FormIntegration()

Hook that provides integration capabilities to individual sections.

```typescript
function useSection86FormIntegration<T>(
  sectionId: string,
  sectionName: string,
  sectionData: T,
  setSectionData: (data: T) => void,
  validateSection: () => ValidationResult,
  getChanges: () => any
): SectionIntegration;

interface SectionIntegration {
  // Global Form Operations
  markComplete: () => void;
  markIncomplete: () => void;
  triggerGlobalValidation: () => ValidationResult;
  getGlobalFormState: () => any;
  navigateToSection: (sectionId: string) => void;
  saveForm: () => Promise<void>;

  // Event System
  emitEvent: (event: any) => void;
  subscribeToEvents: (eventType: string, callback: Function) => () => void;
  notifyChange: (changeType: string, payload: any) => void;

  // Integration Status
  isIntegrationAvailable: boolean;
  integrationError: string | null;
}
```

**Usage:**
```typescript
const Section29Provider = ({ children }) => {
  const [section29Data, setSection29Data] = useState(initialData);

  const integration = useSection86FormIntegration(
    'section29',
    'Section 29: Associations',
    section29Data,
    setSection29Data,
    validateSection,
    getChanges
  );

  const contextValue = {
    section29Data,
    updateData: (newData) => {
      setSection29Data(newData);
      integration.notifyChange('data_updated', newData);
    },
    markComplete: integration.markComplete,
    navigateToSection: integration.navigateToSection
  };

  return (
    <Section29Context.Provider value={contextValue}>
      {children}
    </Section29Context.Provider>
  );
};
```

## 🛠️ Shared Utilities API

### generateFieldId()

Utility for generating PDF-compliant field IDs.

```typescript
function generateFieldId(
  sectionNumber: number,
  fieldType: 'TextField' | 'RadioButtonList' | 'CheckBox' | 'DateField' | 'DropDownList',
  index: number,
  subsectionIndex?: number
): string;
```

**Usage:**
```typescript
const fieldId = generateFieldId(29, 'TextField', 0);
// Returns: "form1[0].Section29[0].TextField[0]"

const radioId = generateFieldId(29, 'RadioButtonList', 1, 2);
// Returns: "form1[0].Section29[2].RadioButtonList[1]"
```

### createFieldTemplate()

Utility for creating field templates with proper defaults.

```typescript
function createFieldTemplate<T>(
  id: string,
  type: FieldType,
  label: string,
  defaultValue: T
): Field<T>;
```

**Usage:**
```typescript
const nameField = createFieldTemplate(
  "form1[0].Section29[0].TextField[0]",
  "text",
  "Organization Name",
  ""
);

const hasAssociationField = createFieldTemplate(
  "form1[0].Section29[0].RadioButtonList[0]",
  "radio",
  "Have you ever been associated with terrorism?",
  "NO" as "YES" | "NO"
);
```

### validateField()

Utility for validating individual fields.

```typescript
function validateField<T>(
  field: Field<T>,
  rules: ValidationRule<T>[]
): ValidationError[];

interface ValidationRule<T> {
  test: (value: T) => boolean;
  message: string;
  code: ValidationErrorCode;
}
```

**Usage:**
```typescript
const nameValidationRules: ValidationRule<string>[] = [
  {
    test: (value) => value.trim().length > 0,
    message: 'Organization name is required',
    code: 'REQUIRED'
  },
  {
    test: (value) => value.length <= 100,
    message: 'Organization name must be 100 characters or less',
    code: 'INVALID_FORMAT'
  }
];

const errors = validateField(nameField, nameValidationRules);
```

## 📡 Event System API

### FormEvent

Interface for form events used in cross-section communication.

```typescript
interface FormEvent {
  type: string;                 // Event type identifier
  sectionId: string;           // Source section ID
  payload: any;                // Event payload data
  timestamp?: Date;            // Event timestamp
}

type EventCallback = (event: FormEvent) => void;
```

**Common Event Types:**
```typescript
const EVENT_TYPES = {
  SECTION_UPDATE: 'SECTION_UPDATE',
  DATA_SYNC: 'DATA_SYNC',
  NAVIGATION_REQUEST: 'NAVIGATION_REQUEST',
  VALIDATION_REQUEST: 'VALIDATION_REQUEST',
  DEPENDENCY_RESOLVED: 'DEPENDENCY_RESOLVED',
  BACKGROUND_CHECK_REQUIRED: 'BACKGROUND_CHECK_REQUIRED'
};
```

**Usage:**
```typescript
// Emit event
integration.emitEvent({
  type: 'BACKGROUND_CHECK_REQUIRED',
  sectionId: 'section29',
  payload: {
    reason: 'terrorism_associations',
    requiresVerification: true
  }
});

// Subscribe to events
useEffect(() => {
  const unsubscribe = integration.subscribeToEvents('SECTION_UPDATE', (event) => {
    console.log('Received section update:', event);
    if (event.payload.requiresValidation) {
      validateSection();
    }
  });

  return unsubscribe;
}, [integration]);
```

## 🎯 Section Context Template API

### Standard Section Context Interface

Template interface that all section contexts should implement.

```typescript
interface SectionContextType<T> {
  // Core State
  sectionData: T;
  isLoading: boolean;
  errors: Record<string, string>;
  isDirty: boolean;

  // CRUD Operations
  updateFlag: (subsectionKey: string, hasValue: "YES" | "NO") => void;
  addEntry: (subsectionKey: string) => void;
  removeEntry: (subsectionKey: string, entryIndex: number) => void;
  updateFieldValue: (subsectionKey: string, entryIndex: number, fieldPath: string, newValue: any) => void;

  // Enhanced Operations
  getEntryCount: (subsectionKey: string) => number;
  getEntry: (subsectionKey: string, entryIndex: number) => any | null;
  moveEntry: (subsectionKey: string, fromIndex: number, toIndex: number) => void;
  duplicateEntry: (subsectionKey: string, entryIndex: number) => void;
  clearEntry: (subsectionKey: string, entryIndex: number) => void;
  bulkUpdateFields: (subsectionKey: string, entryIndex: number, fieldUpdates: Record<string, any>) => void;

  // Utility
  resetSection: () => void;
  loadSection: (data: T) => void;
  validateSection: () => ValidationResult;
  getChanges: () => any;

  // SF86Form Integration (Standard)
  markComplete: () => void;
  markIncomplete: () => void;
  triggerGlobalValidation: () => ValidationResult;
  getGlobalFormState: () => any;
  navigateToSection: (sectionId: string) => void;
  saveForm: () => Promise<void>;

  // Event System (Standard)
  emitEvent: (event: any) => void;
  subscribeToEvents: (eventType: string, callback: Function) => () => void;
  notifyChange: (changeType: string, payload: any) => void;
}
```

## 📊 Performance Monitoring API

### usePerformanceMonitoring()

Hook for monitoring section performance.

```typescript
function usePerformanceMonitoring(sectionId: string): PerformanceMetrics;

interface PerformanceMetrics {
  renderCount: number;
  lastRenderTime: number;
  averageRenderTime: number;
  memoryUsage: number;
}
```

**Usage:**
```typescript
const Section29Form = () => {
  const metrics = usePerformanceMonitoring('section29');
  
  useEffect(() => {
    if (metrics.averageRenderTime > 100) {
      console.warn('Section29 rendering slowly:', metrics);
    }
  }, [metrics]);

  return (/* JSX */);
};
```

## 🔍 Debugging API

### useDebugInfo()

Hook for accessing debug information in development.

```typescript
function useDebugInfo(sectionId: string): DebugInfo;

interface DebugInfo {
  sectionId: string;
  isIntegrated: boolean;
  lastUpdate: Date;
  changeCount: number;
  validationHistory: ValidationResult[];
  eventHistory: FormEvent[];
}
```

**Usage:**
```typescript
const Section29Provider = ({ children }) => {
  const debugInfo = useDebugInfo('section29');
  
  // Add debug info to window in development
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      window.section29Debug = debugInfo;
    }
  }, [debugInfo]);

  return (/* Provider JSX */);
};
```

## 📋 Type Definitions Summary

```typescript
// Core Types
export type { Field, ValidationResult, ValidationError, Address, DateRange };

// Context Types
export type { SF86FormContextType, SectionIntegration, SectionRegistration };

// Event Types
export type { FormEvent, EventCallback };

// Utility Types
export type { FieldType, ValidationErrorCode, PerformanceMetrics, DebugInfo };

// Template Types
export type { SectionContextType };
```

This API reference provides comprehensive documentation for all interfaces, hooks, and utilities in the scalable SF-86 form architecture, enabling developers to effectively implement and maintain sections within the system.
