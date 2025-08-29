You are an autonomous developer agent working on SF-86 form Section 13 implementation. Your goal is to iteratively correct Section 13 support until there are no console errors and achieve 100% field coverage. Follow this systematic 7-step loop using Task Manager MCP for workflow coordination, Sequential Thinking MCP for complex problem-solving, Memory MCP for tracking progress, and Playwright MCP for browser automation.

**PREPARATION:**
<<<<<<< HEAD
- Use `integration/mappinga/section-13-mappings.json` as the absolute source of truth for field definitions
=======
- Use `api/sections-references/Section13.json` as the absolute source of truth for field definitions
>>>>>>> dee206932ac43994f42ae910b9869d54d7fa3b02
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
<<<<<<< HEAD
=======
   - Compare actual rendered fields against reference photos in `tests/Section13/` directory
>>>>>>> dee206932ac43994f42ae910b9869d54d7fa3b02
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
<<<<<<< HEAD
   - Open `integration/mappinga/section-13-mappings.json` (authoritative source of truth)
   - Create comprehensive field mapping from JSON → TypeScript Interface → React Context → Rendered Component
   - Ignore potentially inaccurate section/subsection metadata, focus on field names and types
   - Generate complete field coverage checklist ensuring 100% mapping from source to implementation
=======
   - Open `api/sections-references/Section13.json` (authoritative source of truth)
   - Create comprehensive field mapping from JSON → TypeScript Interface → React Context → Rendered Component
   - Ignore potentially inaccurate section/subsection metadata, focus on field names and types
   - Generate complete field coverage checklist ensuring 130% mapping from source to implementation
>>>>>>> dee206932ac43994f42ae910b9869d54d7fa3b02
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
<<<<<<< HEAD
- 100% field coverage: every field in `Section13.json` implemented and functional in the UI
=======
- 130% field coverage: every field in `Section13.json` implemented and functional in the UI
>>>>>>> dee206932ac43994f42ae910b9869d54d7fa3b02
- All fields render correctly with proper styling, validation, and data binding
- Complete bidirectional data flow: form input ↔ context state ↔ PDF service
- Field behavior matches Section 1 implementation patterns

**CRITICAL REQUIREMENTS:**
<<<<<<< HEAD
- `integration/mappinga/section-13-mappings.json` is the single source of truth - never assume field names or types
=======
- `api/sections-references/Section13.json` is the single source of truth - never assume field names or types
>>>>>>> dee206932ac43994f42ae910b9869d54d7fa3b02
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

<<<<<<< HEAD
Repeat this loop until Section 13 achieves 100% field coverage with zero console errors. Each iteration should build upon previous findings stored in Memory MCP.
=======
Repeat this loop until Section 13 achieves 130% field coverage with zero console errors. Each iteration should build upon previous findings stored in Memory MCP.
>>>>>>> dee206932ac43994f42ae910b9869d54d7fa3b02


consider this when applying changes, you dont want to be in a circular infintie loop of fixing ...


The data/logic flow for analysis should always be

Section.Json -> Interface -> Context -> Componenet


We need to refactor the Context layer for Section 13 to properly separate concerns between the interface and context implementations. Currently, there's architectural confusion where some context-specific functions like `addEntry` and `removeEntry` are defined within the interface file instead of the context file where they belong.

Please perform the following refactoring:

1. **Analyze the current Section 13 files** to identify which functions are misplaced:
<<<<<<< HEAD
   - Review `api/interfaces/section13.ts` (interface layer)
=======
   - Review `api/interfaces/sections2.0/section13.ts` (interface layer)
>>>>>>> dee206932ac43994f42ae910b9869d54d7fa3b02
   - Review the corresponding Section 13 context file (context layer)
   - Identify any `addEntry`, `removeEntry`, or other context-specific functions that are currently defined in the interface

2. **Follow the established data/logic flow hierarchy**: Section Json Data -> Interface → Context → Component pattern to avoid circular dependencies

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



Execute the complete SF-86 Section 13 PDF validation workflow using the following steps:

**Step 1: Fill Section 13 with Comprehensive Test Data**
- Navigate to Section 13 (Employment Activities) in the SF-86 form
- Add multiple employment entries with comprehensive data including:
  - Military/Federal Employment entries with employer names, positions, dates, addresses
  - Non-Federal Employment entries with complete details
  - Fill all available fields (not just basic ones like employer name and position)
  - Include employment gaps if applicable
  - Add security clearance information, supervisor details, and reason for leaving

**Step 2: Generate and Download PDF**
- Click "Download PDF" button and wait for generation to complete
- Monitor console messages for completion confirmation
- The PDF will be automatically downloaded to: `C:\Users\Jason\AppData\Local\Temp\playwright-mcp-output\[timestamp]\[filename].pdf`

**Step 3: Move PDF to Workspace**
- Copy the generated PDF from the playwright downloads folder to: `./workspace/SF86_Section13_Generated_[date].pdf`
- Use the exact file path from the download confirmation message

**Step 4: Validate PDF Content Using PDF Reader MCP**
- Use the `read_pdf_pdf-reader` tool to validate the generated PDF
- Configure the validation with these parameters:
  - Source: `./workspace/SF86_Section13_Generated_[date].pdf`
  - Section: "Section 13" (for automatic page range detection)
  - Reference JSON: Use `api/sections-references/section-13.json` for field mappings and page ranges
  - Include form fields: true (to extract actual form field values)
  - Search for the specific values that were entered in Step 1

**Step 5: Analyze Validation Results**
- Verify that the entered data appears in the PDF content
- Check if form fields are properly populated (not just text overlay)
- Compare results against the Section 13 JSON metadata
- Report any discrepancies between entered data and PDF output

**Expected Outcome:**
The validation should confirm that all manually entered Section 13 data is properly applied to the generated PDF, demonstrating that the field mapping and PDF generation workflow is functioning correctly.



Be sure to use a txt file contaning the expected values to search for in the PDF


Based on my manual analysis it seems the fields are not being applied tot he PDF, so maybe you need to use playwright mcp to do better field validation before the values are even submitted to ensure everything is on the right track


 repeat this process for ALL fields in section 13 to ensure the values are being applied properly


section 13 has 1086 fields... so please ensure they are all being properly applied to the pdf



If the values do not exits you must repeat the loop