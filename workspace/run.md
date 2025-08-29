/sc:troubleshoot is running… --systematic  You are an autonomous developer agent working on SF-86 form Section 2
implementation. Your goal is to iteratively correct Section 2 support until there are no console errors and achieve 100% field
coverage. Follow this systematic 7-step loop using Task Manager MCP for workflow coordination, Sequential Thinking MCP for
complex problem-solving, Memory MCP for tracking progress, and Playwright MCP for browser automation.

**PREPARATION:**
- Use `integration/mappinga/section-2-mappings.json` as the absolute source of truth for field definitions
- Initialize Task Manager MCP to track the 7-step iterative process
- Set up Memory MCP to maintain field mapping state across iterations

**ITERATIVE DEVELOPMENT LOOP:**

1. **Console Analysis**
   - Launch the application with `npm run dev` and navigate to `localhost:5173` (based on development environment)
   - Use browser snapshot and console tools to capture all console logs, errors, and warnings
   - Document ALL Section 2-related issues including: missing field references, TypeScript errors, React warnings, and state
management errors
   - Store findings in Memory MCP for cross-reference in subsequent steps

2. **Live Form Investigation**
   - Navigate to the form interface, click "expand", then click "Section 2" button
   - Use Playwright MCP to systematically interact with and investigate the section form
   - Identify and document: missing fields, incorrectly positioned fields, non-functional fields, and fields with wrong data
types
   - Use Memory MCP to track field mappings with complete context: {id, name, label, value, fieldType, validation, placement}

3. **Context Implementation Review**
   - Open `app/state/contexts/sections2.0/Section2.tsx` using codebase-retrieval for full context
   - Verify every field from `Section2.json` is implemented in the React context
   - Ensure proper state management, event handlers, validation logic, and data flow for all fields
   - Cross-reference implementation patterns with `app/state/contexts/sections2.0/Section1.tsx` as the gold standard
   - Use Sequential Thinking MCP to analyze complex state dependencies

4. **TypeScript Interface Validation**
   - Open `api/interfaces/sections2.0/section2.ts` and examine complete interface structure
   - Ensure the interface declares ALL fields from `Section2.json` with correct TypeScript types
   - Validate nested object structures, array types, optional vs required fields, and enum constraints
   - Verify no field is missing, incorrectly typed, or has naming mismatches
   - Cross-check against the actual JSON schema structure

5. **Reference Data Deep Audit**
   - Open `integration/mappinga/section-2-mappings.json` (authoritative source of truth)
   - Create comprehensive field mapping from JSON → TypeScript Interface → React Context → Rendered Component
   - Ignore potentially inaccurate section/subsection metadata, focus on field names and types
   - Generate complete field coverage checklist ensuring 100% mapping from source to implementation
   - Validate field constraints, default values, validation rules, and inter-field relationships
   - Use Memory MCP to maintain audit trail

6. **Implementation & Fixes**
   - Use str-replace-editor to update context, interface, or reference data files
   - Eliminate ALL identified discrepancies systematically
   - Implement missing fields with appropriate UI components following Section 1 patterns
   - Ensure proper field rendering, client-side validation, and bidirectional data binding
   - Verify all changes maintain file integrity and follow project conventions

7. **Validation & Testing**
   - Launch application and navigate to Section 2 for comprehensive testing
   - Use Playwright MCP to interact with ALL implemented fields, verifying:
     - Field values set correctly in context state
     - Data persistence through form navigation
     - Proper data types passed to `clientPDFService2.0.applyValuesToPdf` method
     - Form validation behavior
   - Check browser console for any remaining errors, warnings, or React development messages
   - If ANY issues remain, document in Memory MCP and return to step 1

**SUCCESS CRITERIA:**
- Zero console errors, warnings, or React development messages related to Section 2
- 100% field coverage: every field in `Section2.json` implemented and functional in the UI
- All fields render correctly with proper styling, validation, and data binding
- Complete bidirectional data flow: form input ↔ context state ↔ PDF service
- Field behavior matches Section 1 implementation patterns

**CRITICAL REQUIREMENTS:**
- `integration/mappinga/section-2-mappings.json` is the single source of truth - never assume field names or types
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

Repeat this loop until Section 2 achieves 100% field coverage with zero console errors. Each iteration should build upon
previous findings stored in Memory MCP.


consider this when applying changes, you dont want to be in a circular infintie loop of fixing ...


The data/logic flow for analysis should always be

Section.Json -> Interface -> Context -> Componenet
   create teats for each mapping. The best way to analyze a large file is to use a **multi-prompt, chunking strategy** that
  builds context incrementally. Instead of sending the entire file at once, you break it down into logical sections and guide
  the AI through a sequential analysis.

  -----

  ## The Core Strategy: Chunk, Chain, and Synthesize

  This method treats the analysis like a conversation, where you feed the AI manageable pieces of the file, ask for intermediate
   summaries, and then request a final, comprehensive analysis at the end.

  1.  **Chunking 🧱:** Divide the large file into smaller, **logically coherent chunks**. Don't just split it every 500 lines.
  Instead, split it by functions, classes, configuration blocks, or chapters. This preserves the immediate context within each
  chunk.
  2.  **Chaining 🔗:** In each new prompt, you refer back to the previous analysis. You "chain" the prompts together by
  reminding the AI of the overall goal and the context it has already gathered.
  3.  **Synthesizing 🔬:** After processing all the chunks, you use a final prompt to ask the AI to synthesize all the
  intermediate findings into a single, complete analysis.

  -----

  ## A Step-by-Step Prompting Method

  Here’s a practical, three-step process to follow.

  ### Step 1: The Initial "Anchor" Prompt

  This first prompt sets the stage. It's the most important one.

    * **State the Goal:** Clearly define the final objective. What do you want to achieve with the analysis?
    * **Explain the Process:** Tell the AI you will be providing a large file in multiple parts.
    * **Provide the First Chunk:** Paste the first logical chunk of your file.
    * **Give Instructions:** Tell the AI exactly what to do after it reads the chunk (e.g., "summarize this part and wait for
  the next one").

  **Example Initial Prompt:**

  > "I need you to perform a security audit on a large Python script. I will provide the script in several parts. Your goal is
  to identify potential vulnerabilities like SQL injection, insecure dependencies, or hardcoded secrets.
  >
  > After I provide each part, please summarize the potential issues you've found in that specific chunk and then say 'Ready for
   the next part.'
  >
  > Here is Part 1 of the script:
  >
  > ````python
  > [Paste the first 500 lines or the first few functions/classes here]
  > ```"
  > ````

  ### Step 2: Incremental "Linking" Prompts

  For all subsequent parts of the file, your prompts will be simpler.

    * **Signal Continuation:** Clearly state that you are providing the next piece.
    * **Provide the Next Chunk:** Paste the new chunk of code or text.
    * **Reinforce the Goal (Optional):** Briefly remind it of the objective if the chunk introduces new, important concepts.

  **Example Incremental Prompt:**

  > "Great, thank you. Here is Part 2. Please continue the security audit based on what you've seen so far.
  >
  > ````python
  > [Paste the next chunk of the script here]
  > ```"
  > ````

  ### Step 3: The Final "Synthesis" Prompt

  Once you've submitted all the chunks, you ask the AI to put it all together.

    * **Signal Completion:** Announce that you have provided the entire file.
    * **Request Final Analysis:** Ask for the comprehensive, synthesized output you defined in your initial prompt.

  **Example Final Prompt:**

  > "That was the last part of the script. Now, please provide the complete security audit report for the **entire file**.
  Synthesize all the information from the parts you've analyzed and list every potential vulnerability, its location (line
  number if possible), and a suggested fix."

  consider: C:\Users\Jason\Desktop\AI-Coding\clarance-f\integration\mappings\section-2-mappings.json

C:\Users\Jason\Desktop\AI-Coding\clarance-f\api\interfaces\sections2.0\section2.ts
C:\Users\Jason\Desktop\AI-Coding\clarance-f\api\sections-references\section-2.json
C:\Users\Jason\Desktop\AI-Coding\clarance-f\app\state\contexts\sections2.0\section2.tsx
