import { z } from 'zod';
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs';
import fs from 'node:fs/promises';
import { resolvePath, enableValidationMode } from '../utils/pathUtils.js';
import { McpError, ErrorCode } from '@modelcontextprotocol/sdk/types.js';
// Helper to parse page range strings (e.g., "1-3,5,7-")
// Helper to parse a single range part (e.g., "1-3", "5", "7-")
const parseRangePart = (part, pages) => {
    const trimmedPart = part.trim();
    if (trimmedPart.includes('-')) {
        const [startStr, endStr] = trimmedPart.split('-');
        if (startStr === undefined) {
            // Basic check
            throw new Error(`Invalid page range format: ${trimmedPart}`);
        }
        const start = parseInt(startStr, 10);
        const end = endStr === '' || endStr === undefined ? Infinity : parseInt(endStr, 10);
        if (isNaN(start) || isNaN(end) || start <= 0 || start > end) {
            throw new Error(`Invalid page range values: ${trimmedPart}`);
        }
        // Add a reasonable upper limit to prevent infinite loops for open ranges
        const practicalEnd = Math.min(end, start + 10000); // Limit range parsing depth
        for (let i = start; i <= practicalEnd; i++) {
            pages.add(i);
        }
        if (end === Infinity && practicalEnd === start + 10000) {
            console.warn(`[PDF Reader MCP] Open-ended range starting at ${String(start)} was truncated at page ${String(practicalEnd)} during parsing.`);
        }
    }
    else {
        const page = parseInt(trimmedPart, 10);
        if (isNaN(page) || page <= 0) {
            throw new Error(`Invalid page number: ${trimmedPart}`);
        }
        pages.add(page);
    }
};
// Parses the complete page range string (e.g., "1-3,5,7-")
const parsePageRanges = (ranges) => {
    const pages = new Set();
    const parts = ranges.split(',');
    for (const part of parts) {
        parseRangePart(part, pages); // Delegate parsing of each part
    }
    if (pages.size === 0) {
        throw new Error('Page range string resulted in zero valid pages.');
    }
    return Array.from(pages).sort((a, b) => a - b);
};
// --- Zod Schemas ---
const pageSpecifierSchema = z.union([
    z.array(z.number().int()).min(1), // Array of integers
    z
        .string()
        .min(1)
        .refine((val) => /^[0-9,-]+$/.test(val.replace(/\s/g, '')), {
        // Allow spaces but test without them
        message: 'Page string must contain only numbers, commas, and hyphens.',
    }),
]);
const PdfSourceSchema = z
    .object({
    path: z.string().min(1).optional().describe('Relative path to the local PDF file.'),
    url: z.string().url().optional().describe('URL of the PDF file.'),
    pages: pageSpecifierSchema
        .optional()
        .describe("Extract text only from specific pages (1-based) or ranges for *this specific source*. If provided, 'include_full_text' for the entire request is ignored for this source."),
})
    .strict()
    .refine((data) => !!(data.path && !data.url) || !!(!data.path && data.url), {
    // Use boolean coercion instead of || for truthiness check if needed, though refine expects boolean
    message: "Each source must have either 'path' or 'url', but not both.",
});
const ReadPdfArgsSchema = z
    .object({
    sources: z
        .array(PdfSourceSchema)
        .min(1)
        .describe('An array of PDF sources to process, each can optionally specify pages.'),
    include_full_text: z
        .boolean()
        .optional()
        .default(false)
        .describe("Include the full text content of each PDF (only if 'pages' is not specified for that source)."),
    include_metadata: z
        .boolean()
        .optional()
        .default(true)
        .describe('Include metadata and info objects for each PDF.'),
    include_page_count: z
        .boolean()
        .optional()
        .default(true)
        .describe('Include the total number of pages for each PDF.'),
    include_form_fields: z
        .boolean()
        .optional()
        .default(false)
        .describe('Include form field values from the PDF (useful for SF-86 validation).'),
    validation_mode: z
        .boolean()
        .optional()
        .default(false)
        .describe('Enable validation mode with enhanced debugging and absolute path support.'),
    search_values: z
        .array(z.string())
        .optional()
        .describe('Array of values to search for in the PDF content and form fields.'),
    search_values_file: z
        .string()
        .optional()
        .describe('Path to a text file containing search values (one per line) for batch analysis.'),
    sf86_section: z
        .string()
        .optional()
        .describe('SF-86 section number (e.g., "Section 13") for automatic page range detection and section-specific validation.'),
    sf86_page_range: z
        .string()
        .optional()
        .describe('SF-86 page range (e.g., "17-33") to override automatic detection. Format: "start-end".'),
})
    .strict();
// SF-86 Section Configuration Database
const SF86_SECTIONS = {
    'Section 1': { section: 'Section 1', pageRange: [1, 3], description: 'Information About You' },
    'Section 2': { section: 'Section 2', pageRange: [4, 5], description: 'Citizenship' },
    'Section 3': { section: 'Section 3', pageRange: [6, 7], description: 'Where You Have Lived' },
    'Section 4': { section: 'Section 4', pageRange: [8, 9], description: 'Where You Went to School' },
    'Section 5': { section: 'Section 5', pageRange: [10, 11], description: 'Where You Have Worked' },
    'Section 6': { section: 'Section 6', pageRange: [12, 13], description: 'People Who Know You Well' },
    'Section 7': { section: 'Section 7', pageRange: [14, 15], description: 'Military History' },
    'Section 8': { section: 'Section 8', pageRange: [16, 16], description: 'Foreign Activities' },
    'Section 9': { section: 'Section 9', pageRange: [17, 18], description: 'Foreign Contacts' },
    'Section 10': { section: 'Section 10', pageRange: [19, 20], description: 'Psychological and Emotional Health' },
    'Section 11': { section: 'Section 11', pageRange: [21, 22], description: 'Information Technology Systems' },
    'Section 12': { section: 'Section 12', pageRange: [23, 24], description: 'Associations' },
    'Section 13': { section: 'Section 13', pageRange: [17, 33], description: 'Employment Activities' },
    'Section 14': { section: 'Section 14', pageRange: [34, 35], description: 'Additional Comments' },
    'Section 15': { section: 'Section 15', pageRange: [36, 37], description: 'General Remarks' },
    'Section 16': { section: 'Section 16', pageRange: [38, 39], description: 'Certification' },
    'Section 17': { section: 'Section 17', pageRange: [40, 41], description: 'Release of Information' },
    'Section 18': { section: 'Section 18', pageRange: [42, 50], description: 'Continuation Space' },
    'Section 19': { section: 'Section 19', pageRange: [51, 60], description: 'Additional Information' },
    'Section 20': { section: 'Section 20', pageRange: [61, 70], description: 'Foreign Activities Details' },
    'Section 21': { section: 'Section 21', pageRange: [71, 80], description: 'Psychological Health Details' },
    'Section 22': { section: 'Section 22', pageRange: [81, 90], description: 'Financial Record Details' },
    'Section 23': { section: 'Section 23', pageRange: [91, 100], description: 'Use of Information Technology' },
    'Section 24': { section: 'Section 24', pageRange: [101, 110], description: 'Association Record Details' },
    'Section 25': { section: 'Section 25', pageRange: [111, 120], description: 'Investigation and Clearance Record' },
    'Section 26': { section: 'Section 26', pageRange: [121, 130], description: 'Law Enforcement Record' },
    'Section 27': { section: 'Section 27', pageRange: [131, 136], description: 'Use of Alcohol' },
    'Section 28': { section: 'Section 28', pageRange: [131, 136], description: 'Use of Drugs and Drug Activity' },
    'Section 29': { section: 'Section 29', pageRange: [131, 136], description: 'Financial Record' }
};
// --- Helper Functions ---
// Parses the page specification for a single source
const getTargetPages = (sourcePages, sourceDescription) => {
    if (!sourcePages) {
        return undefined;
    }
    try {
        let targetPages;
        if (typeof sourcePages === 'string') {
            targetPages = parsePageRanges(sourcePages);
        }
        else {
            // Ensure array elements are positive integers
            if (sourcePages.some((p) => !Number.isInteger(p) || p <= 0)) {
                throw new Error('Page numbers in array must be positive integers.');
            }
            targetPages = [...new Set(sourcePages)].sort((a, b) => a - b);
        }
        if (targetPages.length === 0) {
            // Check after potential Set deduplication
            throw new Error('Page specification resulted in an empty set of pages.');
        }
        return targetPages;
    }
    catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        // Throw McpError for invalid page specs caught during parsing
        throw new McpError(ErrorCode.InvalidParams, `Invalid page specification for source ${sourceDescription}: ${message}`);
    }
};
// Loads the PDF document from path or URL
const loadPdfDocument = async (source, // Explicitly allow undefined
sourceDescription) => {
    let pdfDataSource;
    try {
        if (source.path) {
            const safePath = resolvePath(source.path); // resolvePath handles security checks
            const buffer = await fs.readFile(safePath);
            // Convert Buffer to Uint8Array for PDF.js compatibility
            pdfDataSource = new Uint8Array(buffer);
        }
        else if (source.url) {
            pdfDataSource = { url: source.url };
        }
        else {
            // This case should be caught by Zod, but added for robustness
            throw new McpError(ErrorCode.InvalidParams, `Source ${sourceDescription} missing 'path' or 'url'.`);
        }
    }
    catch (err) {
        // Handle errors during path resolution or file reading
        let errorMessage; // Declare errorMessage here
        const message = err instanceof Error ? err.message : String(err);
        const errorCode = ErrorCode.InvalidRequest; // Default error code
        if (typeof err === 'object' &&
            err !== null &&
            'code' in err &&
            err.code === 'ENOENT' &&
            source.path) {
            // Specific handling for file not found
            errorMessage = `File not found at '${source.path}'.`;
            // Optionally keep errorCode as InvalidRequest or change if needed
        }
        else {
            // Generic error for other file prep issues or resolvePath errors
            errorMessage = `Failed to prepare PDF source ${sourceDescription}. Reason: ${message}`;
        }
        throw new McpError(errorCode, errorMessage, { cause: err instanceof Error ? err : undefined });
    }
    const loadingTask = pdfjsLib.getDocument(pdfDataSource);
    try {
        return await loadingTask.promise;
    }
    catch (err) {
        console.error(`[PDF Reader MCP] PDF.js loading error for ${sourceDescription}:`, err);
        const message = err instanceof Error ? err.message : String(err);
        // Use ?? for default message
        throw new McpError(ErrorCode.InvalidRequest, `Failed to load PDF document from ${sourceDescription}. Reason: ${message || 'Unknown loading error'}`, // Revert to || as message is likely always string here
        { cause: err instanceof Error ? err : undefined });
    }
};
// Extracts metadata and page count
const extractMetadataAndPageCount = async (pdfDocument, includeMetadata, includePageCount) => {
    const output = {};
    if (includePageCount) {
        output.num_pages = pdfDocument.numPages;
    }
    if (includeMetadata) {
        try {
            const pdfMetadata = await pdfDocument.getMetadata();
            const infoData = pdfMetadata.info;
            if (infoData !== undefined) {
                output.info = infoData;
            }
            const metadataObj = pdfMetadata.metadata;
            const metadataData = metadataObj;
            if (metadataData !== undefined) {
                output.metadata = metadataData;
            }
        }
        catch (metaError) {
            console.warn(`[PDF Reader MCP] Error extracting metadata: ${metaError instanceof Error ? metaError.message : String(metaError)}`);
            // Optionally add a warning to the result if metadata extraction fails partially
        }
    }
    return output;
};
// Extracts text from specified pages
const extractPageTexts = async (pdfDocument, pagesToProcess, sourceDescription) => {
    const extractedPageTexts = [];
    for (const pageNum of pagesToProcess) {
        let pageText = '';
        try {
            const page = await pdfDocument.getPage(pageNum);
            const textContent = await page.getTextContent();
            pageText = textContent.items
                .map((item) => item.str) // Type assertion
                .join('');
        }
        catch (pageError) {
            const message = pageError instanceof Error ? pageError.message : String(pageError);
            console.warn(`[PDF Reader MCP] Error getting text content for page ${String(pageNum)} in ${sourceDescription}: ${message}` // Explicit string conversion
            );
            pageText = `Error processing page: ${message}`; // Include error in text
        }
        extractedPageTexts.push({ page: pageNum, text: pageText });
    }
    // Sorting is likely unnecessary if pagesToProcess was sorted, but keep for safety
    extractedPageTexts.sort((a, b) => a.page - b.page);
    return extractedPageTexts;
};
// Determines the actual list of pages to process based on target pages and total pages
const determinePagesToProcess = (targetPages, totalPages, includeFullText) => {
    let pagesToProcess = [];
    let invalidPages = [];
    if (targetPages) {
        // Filter target pages based on actual total pages
        pagesToProcess = targetPages.filter((p) => p <= totalPages);
        invalidPages = targetPages.filter((p) => p > totalPages);
    }
    else if (includeFullText) {
        // If no specific pages requested for this source, use global flag
        pagesToProcess = Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    return { pagesToProcess, invalidPages };
};
// Load search values from a text file (one value per line)
const loadSearchValuesFromFile = async (filePath) => {
    try {
        const resolvedPath = resolvePath(filePath);
        const fileContent = await fs.readFile(resolvedPath, 'utf-8');
        const values = fileContent
            .split('\n')
            .map(line => line.trim())
            .filter(line => line.length > 0 && !line.startsWith('#')); // Filter empty lines and comments
        console.info(`[PDF Reader MCP] Loaded ${values.length} search values from ${filePath}`);
        return values;
    }
    catch (error) {
        console.warn(`[PDF Reader MCP] Failed to load search values from ${filePath}: ${error instanceof Error ? error.message : String(error)}`);
        return [];
    }
};
// Get SF-86 section configuration
const getSF86SectionConfig = (sectionName) => {
    // Normalize section name (case insensitive, flexible matching)
    const normalizedName = sectionName.toLowerCase().replace(/[^a-z0-9]/g, '');
    for (const [key, config] of Object.entries(SF86_SECTIONS)) {
        const normalizedKey = key.toLowerCase().replace(/[^a-z0-9]/g, '');
        if (normalizedKey === normalizedName || normalizedKey.includes(normalizedName)) {
            return config;
        }
    }
    return null;
};
// Parse page range string (e.g., "17-33" -> [17, 33])
const parsePageRange = (pageRangeStr) => {
    const match = pageRangeStr.match(/^(\d+)-(\d+)$/);
    if (match && match[1] && match[2]) {
        const start = parseInt(match[1], 10);
        const end = parseInt(match[2], 10);
        if (start <= end) {
            return [start, end];
        }
    }
    return null;
};
// Extract form field values from PDF (for SF-86 validation)
// Note: PDF.js doesn't directly support form field extraction, so we'll extract annotations instead
const extractFormFields = async (pdfDocument, sourceDescription) => {
    const fields = [];
    const fieldTypes = {};
    let fieldsWithValues = 0;
    try {
        console.info(`[PDF Reader MCP] Attempting form field extraction from ${sourceDescription}`);
        // PDF.js doesn't have direct form field access, so we'll extract annotations from all pages
        const totalPages = pdfDocument.numPages;
        for (let pageNum = 1; pageNum <= Math.min(totalPages, 50); pageNum++) { // Limit to first 50 pages for performance
            try {
                const page = await pdfDocument.getPage(pageNum);
                const annotations = await page.getAnnotations();
                for (const annotation of annotations) {
                    if (annotation.subtype === 'Widget' && annotation.fieldName) {
                        const name = annotation.fieldName || `page${pageNum}_field${fields.length}`;
                        const type = annotation.fieldType || 'unknown';
                        let value = '';
                        let hasValue = false;
                        // Extract value from annotation
                        if (annotation.fieldValue !== null && annotation.fieldValue !== undefined && annotation.fieldValue !== '') {
                            value = annotation.fieldValue;
                            hasValue = true;
                            fieldsWithValues++;
                        }
                        else if (annotation.buttonValue !== null && annotation.buttonValue !== undefined) {
                            value = annotation.buttonValue;
                            hasValue = true;
                            fieldsWithValues++;
                        }
                        fields.push({ name, type, value, hasValue });
                        // Count field types
                        fieldTypes[type] = (fieldTypes[type] || 0) + 1;
                    }
                }
            }
            catch (pageError) {
                console.warn(`[PDF Reader MCP] Error processing page ${pageNum}: ${pageError instanceof Error ? pageError.message : String(pageError)}`);
            }
        }
        console.info(`[PDF Reader MCP] Extracted ${fields.length} form fields from ${sourceDescription}, ${fieldsWithValues} with values`);
    }
    catch (error) {
        console.warn(`[PDF Reader MCP] Form extraction failed for ${sourceDescription}: ${error instanceof Error ? error.message : String(error)}`);
        // Fallback: Return a message indicating form field extraction is not fully supported
        fields.push({
            name: 'extraction_note',
            type: 'info',
            value: 'Form field extraction requires specialized PDF libraries. Consider using pdf-lib or similar for complete form field access.',
            hasValue: true
        });
    }
    return {
        fields,
        summary: {
            total_fields: fields.length,
            fields_with_values: fieldsWithValues,
            field_types: fieldTypes
        }
    };
};
// Perform validation search across text and form fields
const performValidationSearch = (output, searchValues) => {
    const results = [];
    for (const searchValue of searchValues) {
        const result = {
            searchValue,
            found: false,
            locations: []
        };
        // Search in full text
        if (output.full_text && output.full_text.toLowerCase().includes(searchValue.toLowerCase())) {
            result.found = true;
            result.locations.push('full_text');
        }
        // Search in page texts
        if (output.page_texts) {
            for (const pageText of output.page_texts) {
                if (pageText.text.toLowerCase().includes(searchValue.toLowerCase())) {
                    result.found = true;
                    result.locations.push(`page_${pageText.page}`);
                }
            }
        }
        // Search in form fields
        if (output.form_fields) {
            for (const field of output.form_fields) {
                if (field.hasValue && String(field.value).toLowerCase().includes(searchValue.toLowerCase())) {
                    result.found = true;
                    result.locations.push(`form_field_${field.name}`);
                }
            }
        }
        results.push(result);
    }
    return results;
};
// Processes a single PDF source with enhanced capabilities
const processSingleSource = async (source, globalIncludeFullText, globalIncludeMetadata, globalIncludePageCount, includeFormFields = false, validationMode = false, searchValues = [], sf86Info) => {
    const sourceDescription = source.path ?? source.url ?? 'unknown source';
    let individualResult = { source: sourceDescription, success: false };
    // Enhanced logging in validation mode
    if (validationMode) {
        console.info(`[PDF Reader MCP] Processing ${sourceDescription} in validation mode`);
    }
    try {
        // 1. Parse target pages for this source (throws McpError on invalid spec)
        const targetPages = getTargetPages(source.pages, sourceDescription);
        // 2. Load PDF Document (throws McpError on loading failure)
        // Destructure to remove 'pages' before passing to loadPdfDocument due to exactOptionalPropertyTypes
        const { pages: _pages, ...loadArgs } = source;
        const pdfDocument = await loadPdfDocument(loadArgs, sourceDescription);
        const totalPages = pdfDocument.numPages;
        // 3. Extract Metadata & Page Count
        const metadataOutput = await extractMetadataAndPageCount(pdfDocument, globalIncludeMetadata, globalIncludePageCount);
        const output = { ...metadataOutput }; // Start building output
        // 4. Determine actual pages to process
        const { pagesToProcess, invalidPages } = determinePagesToProcess(targetPages, totalPages, globalIncludeFullText // Pass the global flag
        );
        // Add warnings for invalid requested pages
        if (invalidPages.length > 0) {
            output.warnings = output.warnings ?? [];
            output.warnings.push(`Requested page numbers ${invalidPages.join(', ')} exceed total pages (${String(totalPages)}).`);
        }
        // 5. Extract Text (if needed)
        if (pagesToProcess.length > 0) {
            const extractedPageTexts = await extractPageTexts(pdfDocument, pagesToProcess, sourceDescription);
            if (targetPages) {
                // If specific pages were requested for *this source*
                output.page_texts = extractedPageTexts;
            }
            else {
                // Only assign full_text if pages were NOT specified for this source
                output.full_text = extractedPageTexts.map((p) => p.text).join('\n\n');
            }
        }
        // 6. Extract Form Fields (if requested)
        if (includeFormFields) {
            try {
                const formFieldData = await extractFormFields(pdfDocument, sourceDescription);
                output.form_fields = formFieldData.fields;
                output.form_field_summary = formFieldData.summary;
            }
            catch (error) {
                output.warnings = output.warnings ?? [];
                output.warnings.push(`Form field extraction failed: ${error instanceof Error ? error.message : String(error)}`);
            }
        }
        // 7. Perform Validation Search (if search values provided)
        if (searchValues.length > 0) {
            output.validation_results = performValidationSearch(output, searchValues);
        }
        // 8. Add SF-86 Section Information (if provided)
        if (sf86Info) {
            output.sf86_section_info = sf86Info;
        }
        individualResult = { ...individualResult, data: output, success: true };
    }
    catch (error) {
        let errorMessage = `Failed to process PDF from ${sourceDescription}.`;
        if (error instanceof McpError) {
            errorMessage = error.message; // Use message from McpError directly
        }
        else if (error instanceof Error) {
            errorMessage += ` Reason: ${error.message}`;
        }
        else {
            errorMessage += ` Unknown error: ${JSON.stringify(error)}`;
        }
        individualResult.error = errorMessage;
        individualResult.success = false;
        delete individualResult.data; // Ensure no data on error
    }
    return individualResult;
};
// --- Main Handler Function ---
export const handleReadPdfFunc = async (args) => {
    let parsedArgs;
    try {
        parsedArgs = ReadPdfArgsSchema.parse(args);
    }
    catch (error) {
        if (error instanceof z.ZodError) {
            throw new McpError(ErrorCode.InvalidParams, `Invalid arguments: ${error.errors.map((e) => `${e.path.join('.')} (${e.message})`).join(', ')}`);
        }
        // Added fallback for non-Zod errors during parsing
        const message = error instanceof Error ? error.message : String(error);
        throw new McpError(ErrorCode.InvalidParams, `Argument validation failed: ${message}`);
    }
    const { sources, include_full_text, include_metadata, include_page_count, include_form_fields = false, validation_mode = false, search_values = [], search_values_file, sf86_section, sf86_page_range } = parsedArgs;
    // Enable validation mode if requested
    if (validation_mode) {
        enableValidationMode();
    }
    // Load search values from file if provided
    let allSearchValues = [...search_values];
    if (search_values_file) {
        const fileValues = await loadSearchValuesFromFile(search_values_file);
        allSearchValues = [...allSearchValues, ...fileValues];
    }
    // Handle SF-86 section configuration
    let sf86Info;
    let enhancedSources = [...sources];
    if (sf86_section) {
        const sectionConfig = getSF86SectionConfig(sf86_section);
        let pageRange = null;
        // Use provided page range or auto-detect from section
        if (sf86_page_range) {
            pageRange = parsePageRange(sf86_page_range);
        }
        else if (sectionConfig) {
            pageRange = sectionConfig.pageRange;
        }
        if (pageRange) {
            const [startPage, endPage] = pageRange;
            const pages = Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i);
            // Update sources to include the SF-86 section pages
            enhancedSources = sources.map(source => ({
                ...source,
                pages: source.pages || pages
            }));
            sf86Info = {
                section: sf86_section,
                page_range: `${startPage}-${endPage}`,
                auto_detected: !sf86_page_range,
                pages_analyzed: pages
            };
            console.info(`[PDF Reader MCP] SF-86 ${sf86_section} analysis: pages ${startPage}-${endPage} (${sf86Info.auto_detected ? 'auto-detected' : 'manual'})`);
        }
    }
    // Process all sources concurrently
    const results = await Promise.all(enhancedSources.map((source) => processSingleSource(source, include_full_text, include_metadata, include_page_count, include_form_fields, validation_mode, allSearchValues, sf86Info)));
    return {
        content: [
            {
                type: 'text',
                text: JSON.stringify({ results }, null, 2),
            },
        ],
    };
};
// Export the consolidated ToolDefinition
export const readPdfToolDefinition = {
    name: 'read_pdf',
    description: 'Enhanced PDF reader with SF-86 section-aware validation capabilities. Features: form field extraction, batch search from text files, automatic SF-86 section page detection, absolute path support in validation mode. Supports all SF-86 sections with automatic page range detection.',
    schema: ReadPdfArgsSchema,
    handler: handleReadPdfFunc,
};
