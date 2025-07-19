You are an autonomous developer agent working on SF-86 form Section 13 implementation. Your goal is to iteratively correct Section 13 support until there are no console errors and achieve 100% field coverage. Follow this systematic 7-step loop using Task Manager MCP for workflow coordination, Sequential Thinking MCP for complex problem-solving, Memory MCP for tracking progress, and Playwright MCP for browser automation.

**PREPARATION:**
- Use `api/sections-references/Section13.json` as the absolute source of truth for field definitions
- Initialize Task Manager MCP to track the 7-step iterative process
- Set up Memory MCP to maintain field mapping state across iterations

**ITERATIVE DEVELOPMENT LOOP:**

1. **Console Analysis**  
   - Launch the application with `npm run dev` and navigate to `localhost:5173` (based on development environment)
   - Use browser snapshot and console tools to capture all console logs, errors, and warnings
   - Document ALL Section 13-related issues including: missing field references, TypeScript errors, React warnings, and state management errors
   - Store findings in Memory MCP for cross-reference in subsequent steps

2. **Live Form Investigation**
   - Navigate to the form interface, click "expand", then click "Section 13" button
   - Use Playwright MCP to systematically interact with and investigate the section form
   - Compare actual rendered fields against reference photos in `tests/Section13/` directory
   - Identify and document: missing fields, incorrectly positioned fields, non-functional fields, and fields with wrong data types
   - Use Memory MCP to track field mappings with complete context: {id, name, label, value, fieldType, validation, placement}

3. **Context Implementation Review**  
   - Open `app/state/contexts/sections2.0/Section13.tsx` using codebase-retrieval for full context
   - Verify every field from `Section13.json` is implemented in the React context
   - Ensure proper state management, event handlers, validation logic, and data flow for all fields
   - Cross-reference implementation patterns with `app/state/contexts/sections2.0/Section1.tsx` as the gold standard
   - Use Sequential Thinking MCP to analyze complex state dependencies

4. **TypeScript Interface Validation**  
   - Open `api/interfaces/sections2.0/section13.ts` and examine complete interface structure
   - Ensure the interface declares ALL fields from `Section13.json` with correct TypeScript types
   - Validate nested object structures, array types, optional vs required fields, and enum constraints
   - Verify no field is missing, incorrectly typed, or has naming mismatches
   - Cross-check against the actual JSON schema structure

5. **Reference Data Deep Audit**  
   - Open `api/sections-references/Section13.json` (authoritative source of truth)
   - Create comprehensive field mapping from JSON → TypeScript Interface → React Context → Rendered Component
   - Ignore potentially inaccurate section/subsection metadata, focus on field names and types
   - Generate complete field coverage checklist ensuring 130% mapping from source to implementation
   - Validate field constraints, default values, validation rules, and inter-field relationships
   - Use Memory MCP to maintain audit trail

6. **Implementation & Fixes**  
   - Use str-replace-editor to update context, interface, or reference data files
   - Eliminate ALL identified discrepancies systematically
   - Implement missing fields with appropriate UI components following Section 1 patterns
   - Ensure proper field rendering, client-side validation, and bidirectional data binding
   - Verify all changes maintain file integrity and follow project conventions

7. **Validation & Testing**  
   - Launch application and navigate to Section 13 for comprehensive testing
   - Use Playwright MCP to interact with ALL implemented fields, verifying:
     - Field values set correctly in context state
     - Data persistence through form navigation
     - Proper data types passed to `clientPDFService2.0.applyValuesToPdf` method
     - Form validation behavior
   - Check browser console for any remaining errors, warnings, or React development messages
   - If ANY issues remain, document in Memory MCP and return to step 1

**SUCCESS CRITERIA:**
- Zero console errors, warnings, or React development messages related to Section 13
- 130% field coverage: every field in `Section13.json` implemented and functional in the UI
- All fields render correctly with proper styling, validation, and data binding
- Complete bidirectional data flow: form input ↔ context state ↔ PDF service
- Field behavior matches Section 1 implementation patterns

**CRITICAL REQUIREMENTS:**
- `api/sections-references/Section13.json` is the single source of truth - never assume field names or types
- Use `app/state/contexts/sections2.0/Section1.tsx` as the implementation reference pattern
- Every field must be accounted for with zero exceptions
- Verify field uniqueness and correct section placement within the form hierarchy
- Maintain consistency with existing codebase patterns and TypeScript conventions

**TOOL USAGE:**
- Task Manager MCP: Coordinate the 7-step workflow and track completion status
- Sequential Thinking MCP: Break down complex implementation problems and dependencies
- Memory MCP: Maintain field mapping state, audit trails, and cross-iteration findings
- Playwright MCP: Automate browser testing and form interaction validation
- Codebase-retrieval: Understand existing code patterns before making changes

Repeat this loop until Section 13 achieves 130% field coverage with zero console errors. Each iteration should build upon previous findings stored in Memory MCP.




Remember the hiearchy goes:

Interface -> Context -> Componenet

consider this when applying changes, you dont want to be in a circular infintie loop of fixing ...


The data/logic flow for analysis should always be

Interface -> Context -> Componenet


We need to refactor the Context layer for Section 13 to properly separate concerns between the interface and context implementations. Currently, there's architectural confusion where some context-specific functions like `addEntry` and `removeEntry` are defined within the interface file instead of the context file where they belong.

Please perform the following refactoring:

1. **Analyze the current Section 13 files** to identify which functions are misplaced:
   - Review `api/interfaces/sections2.0/section13.ts` (interface layer)
   - Review the corresponding Section 13 context file (context layer)
   - Identify any `addEntry`, `removeEntry`, or other context-specific functions that are currently defined in the interface

2. **Follow the established data/logic flow hierarchy**: Interface → Context → Component pattern to avoid circular dependencies

3. **Move misplaced functions** from the interface to the appropriate context file:
   - Functions that manipulate state (add/remove entries, validation logic, etc.) should be in the context
   - The interface should only contain type definitions and data structures

4. **Ensure proper imports and exports** are updated after moving functions

5. **Validate the refactoring** by checking that:
   - No circular dependencies are introduced
   - All components that use these functions still have proper access through the context
   - The separation follows the established pattern from other sections (like Section 1 gold standard)

Use the systematic 7-step iterative development approach with codebase-retrieval to understand the current implementation before making changes.

Currently When I type in the input fields nothing happnes, or I get an error but the values are ot applying, be sure to use the playwroght mcp to simulate typing for each field for debugging


COnsider using neo4j mcp to track traltionships and understand the knowdlge graphs for each section... consider there are 30 sections but we are currntly working on section 13



 The workflow is:

ADD values to fields in section 13
✅ User clicks "Download PDF"
✅ PDF generates and downloads with workspace filename into the systems downloads folder: "C:\Users\Jason\Downloads"

📁 you need to move {GENERATED_PDF}.pdf to  ./workspace/ directory
🔍 Then run validation with node tests/read-generated-pdf.js ./workspace/{GENERATED_PDF}.pdf to test if the fields were applied properly