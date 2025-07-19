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