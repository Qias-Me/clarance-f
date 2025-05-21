import { describe, test, expect, beforeAll, afterAll, jest } from '@jest/globals';
import { validateSectionCounts, identifyProblemSections, loadReferenceCounts } from '../utils/validation.js';
import * as fs from 'fs';
// Mock fs module
jest.mock('fs', () => ({
    promises: {
        writeFile: jest.fn().mockResolvedValue(undefined),
    },
    existsSync: jest.fn().mockReturnValue(true),
    readFileSync: jest.fn().mockReturnValue('{"1": 10, "2": 20}'),
}));
// Mock console.log to avoid cluttering test output
const originalConsoleLog = console.log;
beforeAll(() => {
    console.log = jest.fn();
});
afterAll(() => {
    console.log = originalConsoleLog;
});
describe('Validation Utils', () => {
    // Sample section fields for testing
    const sectionFields = {
        '0': [
            { name: 'unknown1', section: 0 },
            { name: 'unknown2', section: 0 }
        ],
        '1': [
            { name: 'field1_1', section: 1 },
            { name: 'field1_2', section: 1 },
            { name: 'field1_3', section: 1 },
        ],
        '2': [
            { name: 'field2_1', section: 2 },
            { name: 'field2_2', section: 2 },
        ],
        '3': [
            { name: 'field3_1', section: 3 },
            { name: 'field3_2', section: 3 },
            { name: 'field3_3', section: 3 },
            { name: 'field3_4', section: 3 },
        ],
    };
    // Reference counts for sections (matching expected values)
    const referenceCounts = {
        1: 5, // Deviation of 2 (40%)
        2: 5, // Deviation of 3 (60%)
        3: 2, // Deviation of 2 (100%)
    };
    describe('validateSectionCounts', () => {
        test('should validate section counts against reference data', () => {
            const result = validateSectionCounts(sectionFields, referenceCounts);
            // Basic validation
            expect(result).toHaveProperty('success');
            expect(result).toHaveProperty('alignmentPercentage');
            expect(result).toHaveProperty('deviations');
            expect(result).toHaveProperty('totalExpected');
            expect(result).toHaveProperty('totalActual');
            // Check counts
            expect(result.totalExpected).toBe(12); // 5 + 5 + 2
            expect(result.totalActual).toBe(9); // 3 + 2 + 4
            expect(result.unknownFieldCount).toBe(2);
            // Check deviations
            expect(result.deviations.length).toBe(3);
            // Deviations should be sorted by percentage (highest first)
            expect(result.deviations[0].section).toBe(3);
            expect(result.deviations[0].percentage).toBe(100);
            expect(result.deviations[1].section).toBe(2);
            expect(result.deviations[1].percentage).toBe(60);
            expect(result.deviations[2].section).toBe(1);
            expect(result.deviations[2].percentage).toBe(40);
        });
        test('should respect success threshold', () => {
            // All deviations are > 30% so should fail with default threshold
            const resultDefault = validateSectionCounts(sectionFields, referenceCounts);
            expect(resultDefault.success).toBe(false);
            // With a very high threshold, it should pass
            const resultHighThreshold = validateSectionCounts(sectionFields, referenceCounts, {
                maxDeviationPercent: 200,
                successThreshold: 0.1
            });
            expect(resultHighThreshold.success).toBe(true);
        });
        test('should handle critical sections properly', () => {
            // Make section 1 critical
            const resultCritical = validateSectionCounts(sectionFields, referenceCounts, {
                criticalSections: [1],
                maxDeviationPercent: 50,
                criticalSectionThreshold: 20 // Section 1 has 40% deviation
            });
            expect(resultCritical.criticalSectionsAligned).toBe(false);
            // With higher threshold, critical section should pass
            const resultCriticalPass = validateSectionCounts(sectionFields, referenceCounts, {
                criticalSections: [1],
                maxDeviationPercent: 100,
                criticalSectionThreshold: 45 // Section 1 has 40% deviation
            });
            expect(resultCriticalPass.criticalSectionsAligned).toBe(true);
        });
        test('should generate validation report if requested', () => {
            const mockWriteFile = fs.promises.writeFile;
            mockWriteFile.mockClear();
            validateSectionCounts(sectionFields, referenceCounts, {
                outputReport: true,
                reportPath: '/test/report.json',
                verbose: true
            });
            expect(mockWriteFile).toHaveBeenCalledTimes(1);
            // Check that a report was written
            const writeCall = mockWriteFile.mock.calls[0];
            expect(writeCall[0]).toBe('/test/report.json');
            expect(writeCall[1]).toContain('result');
        });
    });
    describe('identifyProblemSections', () => {
        test('should identify the most problematic sections', () => {
            // Create a sample validation result
            const result = {
                success: false,
                alignmentPercentage: 50,
                deviations: [
                    { section: 1, expected: 10, actual: 5, deviation: -5, percentage: 50 },
                    { section: 2, expected: 10, actual: 3, deviation: -7, percentage: 70 },
                    { section: 3, expected: 10, actual: 1, deviation: -9, percentage: 90 },
                    { section: 4, expected: 10, actual: 8, deviation: -2, percentage: 20 },
                    { section: 5, expected: 10, actual: 15, deviation: 5, percentage: 50 },
                ],
                totalExpected: 50,
                totalActual: 32,
                totalDeviation: 28,
                unknownFieldCount: 5,
                criticalSectionsAligned: false
            };
            // Get top 3 problem sections
            const problems = identifyProblemSections(result, 3);
            expect(problems.length).toBe(3);
            expect(problems[0]).toBe(3); // Worst deviation (90%)
            expect(problems[1]).toBe(2); // Second worst (70%)
            expect(problems[2]).toBe(1); // Third worst (50%, based on sorting order)
        });
        test('should handle empty deviations', () => {
            const result = {
                success: true,
                alignmentPercentage: 100,
                deviations: [],
                totalExpected: 10,
                totalActual: 10,
                totalDeviation: 0,
                unknownFieldCount: 0,
                criticalSectionsAligned: true
            };
            const problems = identifyProblemSections(result);
            expect(problems.length).toBe(0);
        });
    });
    describe('loadReferenceCounts', () => {
        test('should load reference counts from file', () => {
            const mockReadFileSync = fs.readFileSync;
            const counts = loadReferenceCounts('/test/reference.json');
            expect(mockReadFileSync).toHaveBeenCalledWith('/test/reference.json', 'utf8');
            expect(counts).toEqual({
                1: 10,
                2: 20
            });
        });
        test('should return default counts if no file provided', () => {
            const counts = loadReferenceCounts();
            // Default counts should have many sections
            expect(Object.keys(counts).length).toBeGreaterThan(20);
            expect(counts[1]).toBeDefined();
            expect(counts[30]).toBeDefined();
        });
    });
});
