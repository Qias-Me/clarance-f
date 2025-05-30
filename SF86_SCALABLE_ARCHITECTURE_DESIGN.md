# SF-86 Scalable Form Architecture Design

**Version:** 1.0.0
**Date:** 2024-01-20
**Status:** Design Phase

## 🎯 Executive Summary

This document outlines the architectural design for scaling the successful Section29 Context implementation to support all 30 sections of the SF-86 form. The architecture builds on proven patterns while introducing centralized coordination, shared utilities, and modular section development.

## 🏗️ Architecture Overview

### **Core Principles**
1. **Modularity**: Each section can be developed and tested independently
2. **Scalability**: Easy addition of new sections without breaking existing functionality
3. **Consistency**: All sections follow the same proven patterns and interfaces
4. **Performance**: Optimized React patterns with proper memoization
5. **PDF Compliance**: Exact field ID generation for form submission accuracy

### **Architecture Layers**

```
┌─────────────────────────────────────────────────────────────┐
│                    SF-86 Form Application                   │
├─────────────────────────────────────────────────────────────┤
│                  SF86FormContext (Central)                  │
│  • Global form state (ApplicantFormValues)                 │
│  • Cross-section coordination                              │
│  • Unified change tracking & validation                    │
│  • Data persistence & navigation                           │
├─────────────────────────────────────────────────────────────┤
│              Section Integration Framework                   │
│  • Section registration system                             │
│  • Context communication protocols                         │
│  • Shared state synchronization                            │
├─────────────────────────────────────────────────────────────┤
│                Individual Section Contexts                  │
│  Section1Context │ Section29Context │ ... │ Section30Context │
│  • Section-specific state                                  │
│  • CRUD operations                                         │
│  • Field ID generation                                     │
│  • Local validation                                        │
├─────────────────────────────────────────────────────────────┤
│                   Shared Infrastructure                     │
│  • Common field ID utilities                               │
│  • Base interfaces & types                                 │
│  • CRUD operation templates                                │
│  • Validation utilities                                    │
└─────────────────────────────────────────────────────────────┘
```

## 📋 Component Specifications

### **1. SF86FormContext (Central Coordinator)**

**Location:** `app/state/contexts/SF86FormContext.tsx`

**Responsibilities:**
- Manage global `ApplicantFormValues` state
- Coordinate all 30 section contexts
- Provide unified change tracking (`isDirty`)
- Handle data persistence (localStorage, API)
- Manage form validation and submission
- Control section navigation and progress

**Key Methods:**
```typescript
interface SF86FormContextType {
  // Global State
  formData: ApplicantFormValues;
  isDirty: boolean;
  isValid: boolean;

  // Section Management
  registerSection: (sectionId: string, context: SectionContextType) => void;
  unregisterSection: (sectionId: string) => void;
  getSectionData: (sectionId: string) => any;
  updateSectionData: (sectionId: string, data: any) => void;

  // Global Operations
  validateForm: () => ValidationResult;
  saveForm: () => Promise<void>;
  loadForm: (data: ApplicantFormValues) => void;
  resetForm: () => void;

  // Navigation
  navigateToSection: (sectionId: string) => void;
  getCompletedSections: () => string[];
  getNextIncompleteSection: () => string | null;
}
```

### **2. Section Integration Framework**

**Location:** `app/state/contexts/shared/section-integration.tsx`

**Purpose:** Provides the communication layer between individual section contexts and the central SF86FormContext.

**Key Features:**
- Section registration/unregistration system
- Bidirectional data synchronization
- Event-driven updates between contexts
- Conflict resolution for concurrent updates

### **3. Individual Section Contexts**

**Pattern:** Each section follows the proven Section29 architecture

**Template Structure:**
```typescript
// app/state/contexts/sections/section{N}.tsx
interface Section{N}ContextType {
  // Section-specific state
  section{N}Data: Section{N};
  isLoading: boolean;
  errors: ValidationError[];
  isDirty: boolean;

  // CRUD Operations (following Section29 pattern)
  updateSubsectionFlag: (key: string, value: "YES" | "NO") => void;
  addEntry: (subsectionKey: string) => void;
  removeEntry: (subsectionKey: string, index: number) => void;
  updateFieldValue: (subsectionKey: string, index: number, path: string, value: any) => void;

  // Advanced Operations
  moveEntry?: (subsectionKey: string, fromIndex: number, toIndex: number) => void;
  duplicateEntry?: (subsectionKey: string, index: number) => void;
  clearEntry?: (subsectionKey: string, index: number) => void;
  bulkUpdateFields?: (updates: BulkUpdate[]) => void;

  // Utility Methods
  getEntryCount: (subsectionKey: string) => number;
  getEntry: (subsectionKey: string, index: number) => any;
  validateSection: () => ValidationResult;
  resetSection: () => void;
  loadSection: (data: Section{N}) => void;
  getChanges: () => ChangeSet;
}
```

### **4. Shared Infrastructure**

**Location:** `app/state/contexts/shared/`

**Components:**

#### **Field ID Generation (`field-id-generator.tsx`)**
```typescript
interface FieldIdGenerator {
  generateFieldId: (sectionId: string, subsectionKey: string, entryIndex: number, fieldType: string) => string;
  validateFieldId: (fieldId: string) => boolean;
  getFieldPattern: (sectionId: string, fieldType: string) => string;
}
```

#### **Base Interfaces (`base-interfaces.tsx`)**
```typescript
interface BaseSectionContext {
  sectionId: string;
  sectionData: any;
  isLoading: boolean;
  errors: ValidationError[];
  isDirty: boolean;

  // Standard CRUD operations
  updateFieldValue: (path: string, value: any) => void;
  validateSection: () => ValidationResult;
  resetSection: () => void;
  loadSection: (data: any) => void;
  getChanges: () => ChangeSet;
}

interface BaseEntry {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  [key: string]: any;
}

interface BaseSubsection {
  hasFlag?: Field<"YES" | "NO">;
  entries: BaseEntry[];
  entriesCount: number;
}
```

#### **CRUD Templates (`crud-templates.tsx`)**
```typescript
// Reusable CRUD operation implementations
export const createCRUDOperations = <T extends BaseEntry>(
  sectionId: string,
  subsectionKey: string
) => {
  const addEntry = useCallback((entryTemplate: T) => {
    // Standard entry addition logic
  }, []);

  const removeEntry = useCallback((index: number) => {
    // Standard entry removal logic
  }, []);

  const updateEntry = useCallback((index: number, updates: Partial<T>) => {
    // Standard entry update logic
  }, []);

  return { addEntry, removeEntry, updateEntry };
};
```

## 🔄 Data Flow Architecture

### **1. Section-to-Central Communication**
```
Section Context → Section Integration Framework → SF86FormContext
```

### **2. Central-to-Section Communication**
```
SF86FormContext → Section Integration Framework → Section Context
```

### **3. Cross-Section Dependencies**
```
Section A → SF86FormContext → Section B (via dependency rules)
```

### **4. Data Persistence Flow**
```
Section Context → SF86FormContext → ApplicantFormValues → localStorage/API
```

## 🎨 Implementation Strategy

### **Phase 1: Foundation (Week 1)**
1. Create shared infrastructure and utilities
2. Implement base interfaces and types
3. Develop field ID generation system
4. Create CRUD operation templates

### **Phase 2: Central Context (Week 2)**
1. Implement SF86FormContext
2. Create section registration system
3. Add global state management
4. Implement data persistence

### **Phase 3: Integration Framework (Week 3)**
1. Develop section integration framework
2. Create communication protocols
3. Implement conflict resolution
4. Add event-driven updates

### **Phase 4: Section Migration (Week 4)**
1. Migrate Section29 to new architecture
2. Ensure backward compatibility
3. Update tests and documentation
4. Validate PDF compliance

### **Phase 5: Scaling (Ongoing)**
1. Create section implementation templates
2. Document development patterns
3. Implement additional sections
4. Expand test coverage

## 🧪 Testing Strategy

### **Unit Testing**
- Individual section context testing
- Shared utility function testing
- Field ID generation validation
- CRUD operation verification

### **Integration Testing**
- Section-to-central communication
- Cross-section dependency handling
- Data persistence and loading
- Form validation coordination

### **End-to-End Testing**
- Complete form workflows
- Multi-section navigation
- Data integrity across sections
- PDF field ID compliance

## 📊 Performance Considerations

### **React Optimization**
- `useCallback` for all context methods
- `useMemo` for computed values
- `React.memo` for section components
- Lazy loading for section contexts

### **State Management**
- Immutable updates with structural sharing
- Selective re-rendering with context splitting
- Debounced validation and persistence
- Efficient change detection

### **Memory Management**
- Section context cleanup on unmount
- Garbage collection of unused entries
- Optimized field ID caching
- Minimal state duplication

## 🔒 Security & Compliance

### **Data Protection**
- Immutable state updates
- Input validation and sanitization
- Secure data persistence
- Error boundary protection

### **PDF Compliance**
- Exact field ID pattern matching
- Validation against sectionizer data
- Automated compliance testing
- Field mapping verification

## 📈 Scalability Features

### **Horizontal Scaling**
- Independent section development
- Modular testing and deployment
- Parallel team development
- Incremental feature rollout

### **Vertical Scaling**
- Performance optimization
- Memory usage monitoring
- Load testing capabilities
- Caching strategies

## 🎯 Success Metrics

### **Development Efficiency**
- Time to implement new sections
- Code reuse percentage
- Test coverage maintenance
- Bug reduction rate

### **Performance Metrics**
- Form load time
- Section switching speed
- Memory usage optimization
- Validation response time

### **Quality Metrics**
- PDF compliance rate
- Test pass rate
- User experience scores
- Error rate reduction

## 🔧 Technical Implementation Details

### **Field ID Generation Patterns**

Based on the successful Section29 implementation and sectionizer JSON analysis, the field ID generation follows these patterns:

```typescript
// Section-specific patterns
const SECTION_PATTERNS = {
  section29: {
    prefix: 'Section29[0]',
    subsections: {
      terrorismOrganizations: 'Section29[0]',
      terrorismActivities: 'Section29_2[0]'
    }
  },
  section7: {
    prefix: 'Section7[0]',
    subsections: {
      currentAddress: 'Section7[0]',
      previousAddresses: 'Section7_1[0]'
    }
  }
  // ... patterns for all 30 sections
};

// Entry index patterns (proven from Section29)
const ENTRY_INDEX_PATTERNS = {
  // Entry #1 gets lower indices, Entry #2 gets higher indices
  organizationName: (entryIndex) => `TextField11[${entryIndex === 0 ? 1 : 8}]`,
  addressStreet: (entryIndex) => `#area[${entryIndex === 0 ? 1 : 3}].TextField11[0]`,
  dateFrom: (entryIndex) => `From_Datefield_Name_2[${entryIndex * 2}]`
};
```

### **Context Communication Protocol**

```typescript
// Event-driven communication between contexts
interface ContextEvent {
  type: 'SECTION_UPDATE' | 'VALIDATION_REQUEST' | 'NAVIGATION_REQUEST';
  sectionId: string;
  payload: any;
  timestamp: Date;
}

// Central event bus for context coordination
class ContextEventBus {
  private listeners: Map<string, Function[]> = new Map();

  emit(event: ContextEvent): void;
  subscribe(eventType: string, callback: Function): () => void;
  unsubscribe(eventType: string, callback: Function): void;
}
```

### **State Synchronization Strategy**

```typescript
// Bidirectional sync between section and central contexts
interface StateSyncManager {
  // Section → Central
  pushSectionData(sectionId: string, data: any): void;

  // Central → Section
  pullSectionData(sectionId: string): any;

  // Conflict resolution
  resolveMergeConflict(local: any, remote: any): any;

  // Change tracking
  trackChanges(sectionId: string, changes: ChangeSet): void;
}
```

## 📁 File Structure

```
app/state/contexts/
├── SF86FormContext.tsx                 # Central coordinator
├── shared/
│   ├── base-interfaces.tsx            # Common interfaces
│   ├── field-id-generator.tsx         # Field ID utilities
│   ├── crud-templates.tsx             # Reusable CRUD operations
│   ├── section-integration.tsx        # Integration framework
│   ├── validation-utilities.tsx       # Shared validation
│   └── state-sync-manager.tsx         # State synchronization
├── sections/
│   ├── section1.tsx                   # Individual section contexts
│   ├── section29.tsx                  # Existing (to be migrated)
│   ├── ...
│   └── section30.tsx
└── templates/
    ├── section-context-template.tsx   # Implementation template
    ├── section-interfaces-template.ts # Interface template
    └── section-tests-template.spec.ts # Test template
```

## 🔄 Migration Path for Section29

### **Step 1: Preserve Existing Functionality**
```typescript
// Maintain current Section29 API while adding integration
export const Section29Provider: React.FC<{children: ReactNode}> = ({children}) => {
  // Existing Section29 logic
  const section29Context = useSection29Internal();

  // New integration with SF86FormContext
  const sf86Context = useSF86Form();

  // Bidirectional sync
  useEffect(() => {
    sf86Context.updateSectionData('section29', section29Context.section29Data);
  }, [section29Context.section29Data]);

  return (
    <Section29Context.Provider value={section29Context}>
      {children}
    </Section29Context.Provider>
  );
};
```

### **Step 2: Gradual Integration**
- Add SF86FormContext integration hooks
- Maintain existing test suite
- Preserve PDF field ID generation
- Ensure backward compatibility

### **Step 3: Enhanced Features**
- Add cross-section validation
- Implement global change tracking
- Enable section navigation
- Add data persistence coordination

## 🎯 Implementation Priorities

### **Critical Path (Must Have)**
1. ✅ Shared infrastructure and utilities
2. ✅ Central SF86FormContext implementation
3. ✅ Section29 migration and integration
4. ✅ PDF field ID compliance validation

### **High Priority (Should Have)**
1. Section integration framework
2. Cross-section dependency handling
3. Global validation coordination
4. Data persistence optimization

### **Medium Priority (Could Have)**
1. Advanced entry management features
2. Section navigation enhancements
3. Performance monitoring
4. Automated testing expansion

### **Low Priority (Won't Have Initially)**
1. Real-time collaboration features
2. Advanced analytics
3. Custom validation rules
4. Third-party integrations

---

**Architecture Status:** ✅ **DESIGN COMPLETE - READY FOR IMPLEMENTATION**

**Next Steps:** Proceed to implement the shared infrastructure and utilities as the foundation for this scalable architecture.
