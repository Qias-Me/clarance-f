/**
 * Tests for Enhanced PDF Validation utility
 */
import { validator } from '../utils/enhanced-pdf-validation.js';
// Mock bridge adapter functions
jest.mock('../utils/bridgeAdapter.js', () => ({
    extractSectionInfo: jest.fn().mockImplementation((name) => {
        if (name.includes('section5')) {
            return { section: 5, confidence: 0.9 };
        }
        if (name.includes('section') && /section(\d+)/.test(name)) {
            const match = name.match(/section(\d+)/);
            if (match) {
                return {
                    section: parseInt(match[1]),
                    confidence: 0.9
                };
            }
        }
        return null;
    }),
    pageRangeLookup: jest.fn().mockImplementation((page) => {
        // Map page numbers to sections
        const pageMap = {
            1: 1,
            2: 2,
            5: 5,
            10: 10,
            20: 20
        };
        return pageMap[page] || null;
    }),
    fallbackCategorization: jest.fn().mockImplementation((field) => {
        if (field.label?.toLowerCase().includes('name')) {
            return { section: 1, confidence: 0.6 };
        }
        if (field.label?.toLowerCase().includes('birth')) {
            return { section: 2, confidence: 0.7 };
        }
        return null;
    })
}));
describe('EnhancedPdfValidator', () => {
    // Sample fields for testing
    const testFields = [
        {
            id: 'field1',
            name: 'section5_field1',
            value: 'test value',
            page: 5,
            label: 'Test Field 1',
            type: 'text'
        },
        {
            id: 'field2',
            name: 'unknown_field',
            value: '',
            page: 2,
            label: 'Name Field',
            type: 'text'
        },
        {
            id: 'field3',
            name: 'duplicate',
            value: 'duplicate value',
            page: 0, // Missing page
            type: 'text'
        },
        {
            id: 'field3', // Duplicate ID
            name: 'duplicate2',
            value: true,
            page: 10,
            type: 'PDFCheckBox'
        },
        {
            id: 'field4',
            name: 'section_label_field',
            value: 'test',
            page: 15,
            label: 'Section 15 data', // Contains section in label
            type: 'text'
        }
    ];
    describe('enrichFields', () => {
        it('should enrich fields with section information', () => {
            const enriched = validator.enrichFields(testFields);
            // Should have same number of fields
            expect(enriched.length).toBe(testFields.length);
            // Field with section in name should get section from extractSectionInfo
            const field1 = enriched.find(f => f.id === 'field1');
            expect(field1).toBeDefined();
            expect(field1?.section).toBe(5);
            expect(field1?.confidence).toBeGreaterThan(0.8);
            // Field with page but no section in name should get section from page
            const field2 = enriched.find(f => f.id === 'field2');
            expect(field2).toBeDefined();
            expect(field2?.section).toBe(2);
            expect(field2?.confidence).toBeLessThan(0.8); // Page-based confidence should be lower
            // Field with section in label should use that
            const field4 = enriched.find(f => f.id === 'field4');
            expect(field4).toBeDefined();
            expect(field4?.section).toBe(15);
        });
    });
    describe('validateFields', () => {
        it('should identify validation issues in fields', () => {
            const validationResult = validator.validateFields(testFields);
            // Should identify a duplicate ID
            expect(validationResult.duplicateIds).toContain('field3');
            expect(validationResult.duplicateIds.length).toBe(1);
            // Should identify missing page
            expect(validationResult.missingPages).toContain('field3');
            expect(validationResult.missingPages.length).toBe(1);
            // Should detect missing labels (except on checkboxes)
            expect(validationResult.missingLabels).toContain('field3'); // text field without label
            expect(validationResult.missingLabels).not.toContain('field4'); // 4th field is a checkbox
            // Should report validation as false
            expect(validationResult.valid).toBe(false);
        });
        it('should validate clean field data', () => {
            const cleanFields = [
                {
                    id: 'field1',
                    name: 'clean_field1',
                    value: 'test',
                    page: 1,
                    label: 'Clean Field 1',
                    type: 'text'
                },
                {
                    id: 'field2',
                    name: 'clean_field2',
                    value: 'test2',
                    page: 2,
                    label: 'Clean Field 2',
                    type: 'text'
                }
            ];
            const validationResult = validator.validateFields(cleanFields);
            expect(validationResult.duplicateIds.length).toBe(0);
            expect(validationResult.missingPages.length).toBe(0);
            expect(validationResult.missingLabels.length).toBe(0);
            expect(validationResult.valid).toBe(true);
        });
    });
    describe('generateQualityReport', () => {
        it('should generate quality metrics for fields', () => {
            // Prepare enriched fields with confidence and section data
            const enrichedFields = [
                {
                    id: 'field1',
                    name: 'section1_field',
                    value: 'value1',
                    page: 1,
                    label: 'Section 1 Field',
                    section: 1,
                    confidence: 0.9
                },
                {
                    id: 'field2',
                    name: 'section1_field2',
                    value: 'value2',
                    page: 1,
                    label: 'Section 1 Field 2',
                    section: 1,
                    confidence: 0.8
                },
                {
                    id: 'field3',
                    name: 'section2_field',
                    value: 'value3',
                    page: 2,
                    label: 'Section 2 Field',
                    section: 2,
                    confidence: 0.7
                },
                {
                    id: 'field4',
                    name: 'unknown_field',
                    value: 'value4',
                    page: 3,
                    label: 'Unknown Field',
                    confidence: 0.3
                }
            ];
            const qualityReport = validator.generateQualityReport(enrichedFields);
            // Should count total fields
            expect(qualityReport.totalFields).toBe(4);
            // Should group by section
            expect(Object.keys(qualityReport.sectionCoverage).length).toBeGreaterThanOrEqual(3); // 1, 2, unknown
            expect(qualityReport.sectionCoverage['1'].count).toBe(2);
            expect(qualityReport.sectionCoverage['2'].count).toBe(1);
            expect(qualityReport.sectionCoverage['unknown'].count).toBe(1);
            // Should categorize confidence
            expect(qualityReport.confidenceDistribution['high (0.8-1.0)']).toBe(2); // Two high confidence fields
            expect(qualityReport.confidenceDistribution['medium (0.5-0.8)']).toBe(1); // One medium confidence field
            expect(qualityReport.confidenceDistribution['low (0-0.5)']).toBe(1); // One low confidence field
            // Should include a report string
            expect(qualityReport.report).toContain('Field Quality Report');
        });
    });
});
