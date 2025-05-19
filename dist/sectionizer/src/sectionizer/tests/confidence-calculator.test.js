/**
 * Unit tests for confidence calculator
 */
import { describe, it, expect } from 'vitest';
import { confidenceCalculator } from '../utils/confidence-calculator.js';
describe('ConfidenceCalculator', () => {
    // Helper function to create a mock EnhancedField object
    const createMockField = (id) => ({
        id: id,
        name: `field_${id}`,
        value: `value_${id}`,
        page: 1
    });
    // Helper function to create mock sections for testing
    const createMockSectionOutput = (sectionNumber, matchedFields, fieldsData, // Number of fields to create in each subsection
    name) => {
        const fields = {};
        let fieldIdCounter = 1;
        // Create fields for each subsection
        for (const [subsection, count] of Object.entries(fieldsData)) {
            fields[subsection] = [];
            for (let i = 0; i < count; i++) {
                fields[subsection].push(createMockField(String(fieldIdCounter++)));
            }
        }
        return {
            [sectionNumber]: {
                meta: {
                    hasSubSections: false,
                    confidence: 0, // Will be calculated
                    totalFields: 0, // Will be calculated
                    matchedFields,
                    name: name || `Section ${sectionNumber}`,
                    pageRange: [1, 10]
                },
                fields
            }
        };
    };
    describe('calculateConfidence', () => {
        it('should calculate confidence correctly for a section with fields', () => {
            const mockData = createMockSectionOutput('1', 8, // 8 matched fields
            {
                '_default': 4,
                'A': 2,
                'B': 4
            });
            const result = confidenceCalculator.calculateConfidence(mockData);
            // Total fields should be 10
            expect(result['1'].meta.totalFields).toBe(10);
            // Confidence should be 8/10 = 0.8
            expect(result['1'].meta.confidence).toBe(0.8);
            // hasSubSections should be true
            expect(result['1'].meta.hasSubSections).toBe(true);
            // fieldsBySubsection should be populated
            expect(result['1'].meta.fieldsBySubsection).toEqual({
                '_default': 4,
                'A': 2,
                'B': 4
            });
        });
        it('should handle empty sections with zero fields', () => {
            const mockData = createMockSectionOutput('2', 0, // 0 matched fields
            {
                '_default': 0
            });
            const result = confidenceCalculator.calculateConfidence(mockData);
            // Total fields should be 0
            expect(result['2'].meta.totalFields).toBe(0);
            // Confidence should be 1 (fail-safe)
            expect(result['2'].meta.confidence).toBe(1);
            // hasSubSections should be false
            expect(result['2'].meta.hasSubSections).toBe(false);
        });
        it('should handle partial matches correctly', () => {
            const mockData = createMockSectionOutput('3', 5, // 5 matched fields
            {
                '_default': 3,
                'A': 3,
                'B': 2
            });
            const result = confidenceCalculator.calculateConfidence(mockData);
            // Total fields should be 8
            expect(result['3'].meta.totalFields).toBe(8);
            // Confidence should be 5/8 = 0.625
            expect(result['3'].meta.confidence).toBe(0.625);
        });
        it('should not override existing fieldsBySubsection if present', () => {
            // Create a custom mock with predefined fieldsBySubsection
            const mockData = {
                '4': {
                    meta: {
                        hasSubSections: false,
                        confidence: 0,
                        totalFields: 0,
                        matchedFields: 3,
                        fieldsBySubsection: {
                            '_default': 2,
                            'A': 3
                        }
                    },
                    fields: {
                        '_default': [
                            createMockField('1'),
                            createMockField('2')
                        ],
                        'A': [
                            createMockField('3'),
                            createMockField('4'),
                            createMockField('5')
                        ]
                    }
                }
            };
            const result = confidenceCalculator.calculateConfidence(mockData);
            // Should preserve the existing fieldsBySubsection
            expect(result['4'].meta.fieldsBySubsection).toEqual({
                '_default': 2,
                'A': 3
            });
        });
    });
    describe('calculateOverallConfidence', () => {
        it('should calculate overall confidence across multiple sections', () => {
            const mockData = {
                '1': {
                    meta: {
                        hasSubSections: true,
                        confidence: 0.8,
                        totalFields: 10,
                        matchedFields: 8,
                        name: 'Test Section 1'
                    },
                    fields: {
                        '_default': [createMockField('1'), createMockField('2')],
                        'A': [createMockField('3'), createMockField('4')],
                        'B': [createMockField('5'), createMockField('6')]
                    }
                },
                '2': {
                    meta: {
                        hasSubSections: false,
                        confidence: 0.75,
                        totalFields: 8,
                        matchedFields: 6,
                        name: 'Test Section 2'
                    },
                    fields: {
                        '_default': [createMockField('7'), createMockField('8')]
                    }
                }
            };
            const result = confidenceCalculator.calculateOverallConfidence(mockData);
            // Overall confidence should be (8 + 6) / (10 + 8) = 14/18 = 0.7777...
            expect(result).toBeCloseTo(0.7778, 4);
        });
        it('should return 1 for empty section collections', () => {
            const mockData = {};
            const result = confidenceCalculator.calculateOverallConfidence(mockData);
            // Fail-safe: should return 1 for empty data
            expect(result).toBe(1);
        });
        it('should handle sections with zero fields', () => {
            const mockData = {
                '1': {
                    meta: {
                        hasSubSections: false,
                        confidence: 1,
                        totalFields: 0,
                        matchedFields: 0
                    },
                    fields: {
                        '_default': []
                    }
                }
            };
            const result = confidenceCalculator.calculateOverallConfidence(mockData);
            // Fail-safe: should return 1 for zero fields
            expect(result).toBe(1);
        });
    });
    describe('generateConfidenceReport', () => {
        it('should generate a properly formatted confidence report', () => {
            const mockData = {
                '1': {
                    meta: {
                        hasSubSections: true,
                        confidence: 0.8,
                        totalFields: 10,
                        matchedFields: 8,
                        name: 'Test Section 1'
                    },
                    fields: {
                        '_default': [],
                        'A': [],
                        'B': []
                    }
                },
                '2': {
                    meta: {
                        hasSubSections: false,
                        confidence: 0.75,
                        totalFields: 8,
                        matchedFields: 6,
                        name: 'Test Section 2'
                    },
                    fields: {
                        '_default': []
                    }
                }
            };
            const report = confidenceCalculator.generateConfidenceReport(mockData);
            // Check basic report structure
            expect(report).toContain('Confidence Report:');
            expect(report).toContain('| Section | Fields | Matched | Confidence |');
            // Check section data
            expect(report).toContain('| 1 | 10 | 8 | 80.00% |');
            expect(report).toContain('| 2 | 8 | 6 | 75.00% |');
            // Check overall summary
            expect(report).toContain('| Overall | 18 | 14 | 77.78% |');
        });
        it('should handle empty data', () => {
            const mockData = {};
            const report = confidenceCalculator.generateConfidenceReport(mockData);
            // Should still generate valid markdown table
            expect(report).toContain('Confidence Report:');
            expect(report).toContain('| Section | Fields | Matched | Confidence |');
            expect(report).toContain('| Overall | 0 | 0 | 100.00% |');
        });
    });
    describe('generateAdvancedReport', () => {
        it('should generate a comprehensive advanced report', () => {
            const mockData = {
                '1': {
                    meta: {
                        hasSubSections: true,
                        confidence: 0.8,
                        totalFields: 10,
                        matchedFields: 8,
                        name: 'Name',
                        pageRange: [1, 3],
                        fieldsBySubsection: {
                            '_default': 4,
                            'A': 2,
                            'B': 4
                        }
                    },
                    fields: {
                        '_default': [],
                        'A': [],
                        'B': []
                    }
                }
            };
            const report = confidenceCalculator.generateAdvancedReport(mockData);
            // Check report structure
            expect(report).toContain('# Detailed Confidence Report');
            expect(report).toContain('## Summary');
            expect(report).toContain('### Section 1: Name');
            // Check section metadata
            expect(report).toContain('**Fields**: 10');
            expect(report).toContain('**Matched**: 8');
            expect(report).toContain('**Confidence**: 80.00%');
            expect(report).toContain('**Page Range**: 1 - 3');
            // Check subsection details
            expect(report).toContain('#### Subsections');
            expect(report).toContain('| Subsection | Fields | Percentage |');
            expect(report).toContain('| _default | 4 | 40.00% |');
            expect(report).toContain('| A | 2 | 20.00% |');
            expect(report).toContain('| B | 4 | 40.00% |');
        });
        it('should handle sections without page ranges', () => {
            const mockData = {
                '2': {
                    meta: {
                        hasSubSections: false,
                        confidence: 0.75,
                        totalFields: 8,
                        matchedFields: 6,
                        name: 'Date of Birth'
                    },
                    fields: {
                        '_default': []
                    }
                }
            };
            const report = confidenceCalculator.generateAdvancedReport(mockData);
            // Should not have page range info
            expect(report).toContain('### Section 2: Date of Birth');
            expect(report).toContain('**Fields**: 8');
            expect(report).not.toContain('**Page Range**');
        });
    });
});
