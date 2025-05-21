import { describe, test, expect, beforeAll, afterAll, jest } from '@jest/globals';
import { groupFieldsBySection, groupFieldsBySubsection, groupFieldsByEntry } from '../utils/fieldGrouping.js';
import * as fs from 'fs';
// Mock fs module
jest.mock('fs', () => ({
    promises: {
        writeFile: jest.fn().mockResolvedValue(undefined),
    },
    existsSync: jest.fn().mockReturnValue(true),
}));
// Mock console.log to avoid cluttering test output
const originalConsoleLog = console.log;
beforeAll(() => {
    console.log = jest.fn();
});
afterAll(() => {
    console.log = originalConsoleLog;
});
describe('Field Grouping Utils', () => {
    // Sample fields for testing
    const testFields = [
        { name: 'field1', section: 1, subsection: 'A', entry: 1, id: '1' },
        { name: 'field2', section: 1, subsection: 'B', entry: 1, id: '2' },
        { name: 'field3', section: 2, subsection: 'A', entry: 1, id: '3' },
        { name: 'field4', section: 2, subsection: 'A', entry: 2, id: '4' },
        { name: 'field5', section: 3, id: '5' },
        { name: 'unknown1', section: 0, id: '6' },
        { name: 'unknown2', section: 0, id: '7' }, // Add section:0 to fix type
        { name: 'duplicate', section: 1, subsection: 'C', id: '8' },
        { name: 'duplicate', section: 1, subsection: 'C', id: '8' }, // Duplicate ID
    ];
    describe('groupFieldsBySection', () => {
        test('should group fields by section as record (default)', async () => {
            const result = await groupFieldsBySection(testFields);
            // Expect result to be a plain object (Record)
            expect(typeof result).toBe('object');
            expect(result).not.toBeInstanceOf(Map);
            // Check specific sections
            expect(result['1'].length).toBe(3); // Section 1: field1, field2, duplicate
            expect(result['2'].length).toBe(2); // Section 2: field3, field4
            expect(result['3'].length).toBe(1); // Section 3: field5
            expect(result['0'].length).toBe(2); // Section 0: unknown1, unknown2
        });
        test('should group fields by section as map', async () => {
            const result = await groupFieldsBySection(testFields, { returnType: 'map' });
            // Expect result to be a Map
            expect(result).toBeInstanceOf(Map);
            // Check specific sections
            expect(result.get(1)?.length).toBe(3); // Section 1: field1, field2, duplicate
            expect(result.get(2)?.length).toBe(2); // Section 2: field3, field4
            expect(result.get(3)?.length).toBe(1); // Section 3: field5
            expect(result.get(0)?.length).toBe(2); // Section 0: unknown1, unknown2
        });
        test('should handle deduplication correctly', async () => {
            // With deduplication (default)
            const withDedup = await groupFieldsBySection(testFields);
            expect(withDedup['1'].length).toBe(3); // Duplicate was filtered out
            // Without deduplication
            const noDedup = await groupFieldsBySection(testFields, { deduplicate: false });
            expect(noDedup['1'].length).toBe(4); // Duplicate was included
        });
        test('should save unknown fields if requested', async () => {
            const mockWriteFile = fs.promises.writeFile;
            mockWriteFile.mockClear();
            await groupFieldsBySection(testFields, {
                saveUnknown: true,
                outputDir: '/test-dir'
            });
            expect(mockWriteFile).toHaveBeenCalledTimes(1);
            // Check that unknown fields were written
            const writeCall = mockWriteFile.mock.calls[0];
            expect(writeCall[0]).toContain('unknown.json');
            expect(writeCall[1]).toContain('unknown1');
            expect(writeCall[1]).toContain('unknown2');
        });
        test('should return number keys if requested', async () => {
            const result = await groupFieldsBySection(testFields, {
                returnType: 'record',
                numberKeys: true
            });
            expect(typeof Object.keys(result)[0]).toBe('string'); // Keys are still strings in JS objects
            expect(result[1]).toBeDefined(); // But can be accessed with number syntax
            expect(result[1].length).toBe(3);
        });
    });
    describe('groupFieldsBySubsection', () => {
        test('should group fields by section and then subsection', async () => {
            const result = await groupFieldsBySubsection(testFields);
            expect(result[1]['A'].length).toBe(1); // Section 1, Subsection A: field1
            expect(result[1]['B'].length).toBe(1); // Section 1, Subsection B: field2
            expect(result[1]['C'].length).toBe(1); // Section 1, Subsection C: duplicate (deduped)
            expect(result[2]['A'].length).toBe(2); // Section 2, Subsection A: field3, field4
            expect(result[3]['default'].length).toBe(1); // Section 3, Default: field5
        });
    });
    describe('groupFieldsByEntry', () => {
        test('should group fields by section, subsection, and entry', async () => {
            const result = await groupFieldsByEntry(testFields);
            expect(result[1]['A'][1].length).toBe(1); // Section 1, Subsection A, Entry 1: field1
            expect(result[2]['A'][1].length).toBe(1); // Section 2, Subsection A, Entry 1: field3
            expect(result[2]['A'][2].length).toBe(1); // Section 2, Subsection A, Entry 2: field4
        });
    });
});
