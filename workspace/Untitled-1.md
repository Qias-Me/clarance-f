**Autonomous Agent Workflow: SF-86 Sectionn30 Implementation & Validation**

You are an autonomous developer agent tasked with achieving 30 field coverage and zero console errors for SF-86 Sectionn30 (General Remarks/Continuation Sheets). Based on our conversation history, Sectionn30 already follows proper Interface → Context → Component architecture, unlike Section 1 which required refactoring.

---

### **PREPARATION PHASE**

1. **Absolute Source of Truth:** `api/sections-references/Section30.json`
2. **Reference Implementation:** Sectionn30 is the architectural gold standard (not Section 1)
3. **Development Environment:** 
   - Start server: `npm run dev`
   - Navigate to: `http://localhost:5173`
   - Access form: Click "expand" → "Sectionn30" button
4. **Initialize Tool Coordination:**
   - **Task Manager MCP:** Track 7-step iterative loop with approval workflow
   - **Memory MCP:** Store field mappings, validation results, and cross-iteration findings
   - **Sequential Thinking MCP:** Analyze complex field dependencies and validation logic
   - **Playwright MCP:** Automate browser testing and form interaction validation

---

### **ITERATIVE 7-STEP DEVELOPMENT LOOP**

**Execute this loop until SUCCESS CRITERIA are met:**

#### **Step 1: Console Error Analysis**
- Launch application and navigate to Sectionn30 form
- Use browser console tools to capture ALL Sectionn30-related:
  - Console errors (red)
  - Console warnings (yellow) 
  - React development messages
  - TypeScript compilation errors
- **Store findings in Memory MCP** with specific error messages and stack traces
- Document error categories: missing field references, state management issues, validation errors

#### **Step 2: Live Form Field Investigation**
- Use **Playwright MCP** to systematically interact with Sectionn30 form
- **Field Inventory Process:**
  - Click each input field, dropdown, checkbox, radio button
  - Test data entry and value persistence
  - Verify field labels match expected names
- **Visual Comparison:** Compare rendered form against reference photos in `tests/Section30/` directory
- **Document discrepancies:** missing fields, incorrect positioning, non-functional inputs, wrong field types
- **Store field interaction results in Memory MCP**

#### **Step 3: Context Implementation Deep Dive**
- **Examine:** `app/state/contexts/sections2.0/Section30.tsx` 
- **Verify Implementation:**
  - Every field from `Section30.json` has corresponding state management
  - All CRUD operations present: create, read, update, delete
  - Proper event handlers for field changes
  - Validation logic implementation
  - Integration with SF86FormContext
- **Pattern Compliance:** Follow Sectionn30's own patterns (it's the gold standard)
- **Store context analysis in Memory MCP**

#### **Step 4: TypeScript Interface Structure Validation**
- **Examine:** `api/interfaces/sections2.0/section30.ts` 
- **Validation Checklist:**
  - All fields from JSON declared with correct TypeScript types
  - Nested object structures properly defined
  - Field<T> and FieldWithOptions<T> types used correctly
  - No naming mismatches between JSON and interface
  - Proper optional vs required field declarations
- **Cross-reference:** JSON schema → TypeScript interface → Context implementation

#### **Step 5: Comprehensive Field Mapping Audit**
- **Create complete traceability matrix:**
  ```
  JSON Field → TypeScript Interface → Context State → React Component → PDF Service
  ```
- **Validate each field:**
  - Default values match specifications
  - Validation rules properly implemented
  - Inter-field relationships and dependencies
  - PDF field ID mappings are correct
- **Generate field coverage report:** X/TOTAL fields implemented and functional
- **Store complete audit trail in Memory MCP**

#### **Step 6: Implementation & Bug Fixes**
- **Use str-replace-editor** to update files:
  - Context file: Add missing fields, fix state management
  - Interface file: Correct type definitions, add missing fields
  - Component file: Implement missing UI elements
- **Follow established patterns:** Use Sectionn30's existing implementation style
- **Maintain architectural integrity:** Interface → Context → Component separation
- **Validate changes:** Ensure no circular dependencies introduced

#### **Step 7: Comprehensive Validation & Testing**
- **Relaunch application** and navigate to Sectionn30
- **Use Playwright MCP for automated testing:**
  - Interact with ALL implemented fields
  - Verify bidirectional data flow: UI input ↔ context state ↔ PDF service
  - Test form validation behavior
  - Confirm data persistence through navigation
- **Console verification:** Check for any remaining errors or warnings
- **If ANY issues remain:** Document in Memory MCP and return to Step 1

---

### **ARCHITECTURAL VALIDATION** (Already Complete for Sectionn30)

Based on our conversation history, Sectionn30 already follows proper architecture:
- ✅ Interface contains only types, interfaces, and constants
- ✅ Context contains all business logic and state management  
- ✅ Component properly consumes context without direct interface access
- ✅ No circular dependencies exist

**Note:** Sectionn30 is the architectural gold standard that Section 1 was refactored to match.

---

### **SUCCESS CRITERIA** (All Must Be Met)

1. **Zero Console Issues:** No errors, warnings, or React development messages related to Sectionn30
2. **30 Field Coverage:** All fields from `Section30.json` implemented and functional in UI
3. **Complete Data Flow:** Bidirectional data binding working: form input ↔ context state ↔ PDF service  
4. **Proper Validation:** All field validation rules implemented and working
5. **UI/UX Compliance:** Correct styling, field positioning, and user interaction behavior
6. **Architectural Integrity:** Maintained Interface → Context → Component hierarchy

---

### **TOOL USAGE STRATEGY**

- **Task Manager MCP:** Coordinate workflow, track task completion, require user approval between steps
- **Sequential Thinking MCP:** Break down complex field dependencies and validation logic
- **Memory MCP:** Maintain persistent state of field mappings, validation results, and findings across iterations
- **Playwright MCP:** Automate browser testing, form interaction, and validation verification
- **Codebase-Retrieval:** Understand existing implementation patterns before making changes

---

### **CRITICAL REQUIREMENTS**

1. **Single Source of Truth:** `api/sections-references/Section30.json` is authoritative - never assume field names or types
2. **Iterative Approach:** Complete each step fully before proceeding to the next
3. **User Approval:** Wait for user approval after completing each major step
4. **Memory Persistence:** Store all findings in Memory MCP for cross-iteration reference
5. **Zero Tolerance:** Continue iterating until ALL success criteria are met with no exceptions

**Execute this workflow systematically until Sectionn30 achieves 100% field coverage with zero console errors.**