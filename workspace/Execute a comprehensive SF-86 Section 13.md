Execute a comprehensive SF-86 Section 13 PDF validation workflow to verify that all 1,086 form fields are properly populated in the generated PDF. 

**Phase 1: Pre-Validation Setup and Field Analysis**
- Navigate to localhost:5173 Section 13 (Employment Activities)
- Use browser inspection tools to catalog all available form fields in the current UI implementation for Page 17.
- Create a comprehensive test data file (`tests/section13/validation-test-data.txt`) containing:
  - Specific values for each field type (text, radio, checkbox, dropdown)
  - Unique identifiable strings for text fields to enable precise PDF searching
  - Employment scenarios covering all subsections (13A.1-13A.6, 13B, 13C)
- Document the current implementation gap (expected 1,086 fields vs. actually implemented fields)

**Phase 2: Systematic Field Population with Real-Time Validation**
- Fill Section 13 fields in logical groups, validating each group before proceeding:
  - Group 1: Basic employment questions (hasEmployment, hasGaps, gapExplanation)
  - Group 2: Employment Entry #1 (if implemented) - employer, position, dates, addresses
  - Group 3: Employment Entry #2-4 (if implemented) - complete details
  - Group 4: Military/Federal service details (if implemented)
  - Group 5: Security clearance information (if implemented)
  - Group 6: Supervisor contact details (if implemented)
- After each group, use `browser_evaluate` to programmatically extract field values and verify they match input
- Take screenshots at key stages for visual confirmation
- Log any fields that fail to accept values or show validation errors

**Phase 3: Pre-PDF Generation Field State Validation**
- Before generating PDF, perform comprehensive field extraction using JavaScript evaluation
- Create a validation report comparing expected vs. actual field values
- Save field state to `workspace/section13-field-state-pre-pdf.json`
- Only proceed to PDF generation if field validation shows acceptable population rate

**Phase 4: PDF Generation with Enhanced Monitoring**
- Click "Download PDF" and monitor browser console for JavaScript errors
- Capture exact download path and file size for validation
- Move generated PDF to: `workspace/SF86_Section13_Generated_YYYY-MM-DD.pdf`
- Verify file integrity (size > 10MB expected for complete SF-86)

**Phase 5: PDF Content Validation Using PDF Reader MCP**
- Use `read_pdf_pdf-reader` tool with these specific parameters:
  - `sources`: `[{"path": "workspace/SF86_Section13_Generated_YYYY-MM-DD.pdf"}]`
  - `sf86_section`: "Section 13" (enables automatic page range 17-33 detection)
  - `include_form_fields`: true (extract actual PDF form field values)
  - `include_full_text`: true (for text-based searching)
  - `search_values_file`: "tests/section13/validation-test-data.txt" (batch search all entered values)
  - `validation_mode`: true (enhanced debugging output)
- Cross-reference results with `api/sections-references/section-13.json` metadata

**Phase 6: Comprehensive Results Analysis**
- Create detailed comparison report showing:
  - Fields successfully populated in UI vs. fields found in PDF
  - Specific missing values with exact search strings
  - Field mapping discrepancies between UI field names and PDF field names
  - Implementation coverage percentage (actual fields vs. 1,086 expected)
- Generate actionable debugging recommendations for any failures
- Document root cause analysis for field population failures

**Critical Success Criteria:**
- All entered field values must be searchable in the generated PDF content
- PDF form fields must contain user-entered data (not just template defaults)
- Field mapping between UI and PDF must be verified for implemented fields
- Any field population failures must be documented with specific field names and expected values

**Implementation Notes:**
- Current UI implementation appears to have only ~3 fields out of 1,086 expected
- Focus validation on actually implemented fields rather than attempting to fill non-existent fields
- Use unique, searchable test values (e.g., "UNIQUE_EMPLOYER_NAME_TEST_123") to eliminate false positives
- Prioritize systematic validation over comprehensive field population until basic field transfer is confirmed working