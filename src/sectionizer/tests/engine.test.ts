/**
 * Unit tests for the SF-86 Sectionizer Rule Engine
 */

import * as path from 'path';
import * as fs from 'fs';
import { RuleEngine } from '../engine.js';
import type { CategoryRule, SectionRules } from '../engine.js';
import type { CategorizedField, PDFField } from '../utils/extractFieldsBySection.js';

// Add Jest type definition for global environment
declare global {
  const jest: {
    mock: (moduleName: string, factory?: () => any) => void;
    fn: () => jest.Mock;
    spyOn: (object: any, methodName: string) => any;
    clearAllMocks: () => void;
    requireActual: (moduleName: string) => any;
  };
  
  namespace jest {
    interface Mock {
      mockReturnValue: (value: any) => Mock;
      mockReturnValueOnce: (value: any) => Mock;
      mockImplementation: (fn: (...args: any[]) => any) => Mock;
      mockResolvedValue: (value: any) => Mock;
      mock: {
        calls: any[][];
      };
    }
  }
  
  const describe: (name: string, fn: () => void) => void;
  const beforeEach: (fn: () => void) => void;
  const it: (name: string, fn: () => void | Promise<void>) => void;
  const expect: any;
}

// Mock fs calls
jest.mock('fs', () => ({
  ...jest.requireActual('fs'),
  existsSync: jest.fn(),
  mkdirSync: jest.fn(),
  readdirSync: jest.fn(),
  readFileSync: jest.fn(),
  writeFileSync: jest.fn(),
}));

// Mock fs/promises calls
jest.mock('fs/promises', () => ({
  mkdir: jest.fn().mockResolvedValue(undefined),
  writeFile: jest.fn().mockResolvedValue(undefined),
}));

describe('RuleEngine', () => {
  let engine: RuleEngine;
  const mockRulesDir = '/mock/rules/dir';
  
  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();
    
    // Create a new engine instance for each test
    engine = new RuleEngine(mockRulesDir);
    
    // Mock existsSync to return true
    (fs.existsSync as jest.Mock).mockReturnValue(true);
  });
  
  describe('constructor', () => {
    it('should initialize with the specified rules directory', () => {
      const customDir = '/custom/rules/dir';
      const customEngine = new RuleEngine(customDir);
      
      // Private property access is not type-safe, but we need it for testing
      expect((customEngine as any).rulesDir).toBe(customDir);
    });
    
    it('should use default rules directory if not specified', () => {
      const defaultEngine = new RuleEngine();
      
      // Check that the default path includes 'src/sectionizer/rules'
      expect((defaultEngine as any).rulesDir).toContain(path.join('src', 'sectionizer', 'rules'));
    });
  });
  
  describe('loadRules', () => {
    it('should create rules directory if it does not exist', async () => {
      // Mock existsSync to return false
      (fs.existsSync as jest.Mock).mockReturnValue(false);
      
      await engine.loadRules();
      
      expect(fs.mkdirSync).toHaveBeenCalledWith(mockRulesDir, { recursive: true });
    });
    
    it('should load rules from all JSON files in the rules directory', async () => {
      // Mock readdirSync to return two rule files
      (fs.readdirSync as jest.Mock).mockReturnValue(['01.json', '02.json']);
      
      // Mock readFileSync to return valid rule files
      const mockRule1: SectionRules = {
        section: 1,
        name: 'Mock Section 1',
        rules: [
          { section: 1, pattern: 'test1', confidence: 0.8 }
        ]
      };
      
      const mockRule2: SectionRules = {
        section: 2,
        name: 'Mock Section 2',
        rules: [
          { section: 2, pattern: 'test2', confidence: 0.9 }
        ]
      };
      
      (fs.readFileSync as jest.Mock)
        .mockReturnValueOnce(JSON.stringify(mockRule1))
        .mockReturnValueOnce(JSON.stringify(mockRule2));
      
      await engine.loadRules();
      
      // Verify files were read
      expect(fs.readFileSync).toHaveBeenCalledTimes(2);
      
      // Verify rules were loaded - checking the private property
      expect((engine as any).sectionRules[1]).toBeDefined();
      expect((engine as any).sectionRules[2]).toBeDefined();
      expect((engine as any).rules.length).toBe(2);
    });
    
    it('should handle invalid rule files gracefully', async () => {
      // Mock readdirSync to return one valid and one invalid file
      (fs.readdirSync as jest.Mock).mockReturnValue(['valid.json', 'invalid.json']);
      
      // Mock readFileSync to return a valid file and an invalid file
      const mockValidRule: SectionRules = {
        section: 1,
        name: 'Valid Rule',
        rules: [{ section: 1, pattern: 'test', confidence: 0.8 }]
      };
      
      (fs.readFileSync as jest.Mock)
        .mockReturnValueOnce(JSON.stringify(mockValidRule))
        .mockReturnValueOnce('invalid JSON');
      
      // Mock console.warn and console.error to avoid cluttering test output
      const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      
      await engine.loadRules();
      
      // Verify valid rule was loaded
      expect((engine as any).sectionRules[1]).toBeDefined();
      
      // Verify error was logged for invalid file
      expect(consoleErrorSpy).toHaveBeenCalled();
      
      // Restore console functions
      consoleWarnSpy.mockRestore();
      consoleErrorSpy.mockRestore();
    });
  });
  
  describe('getRulesForSection', () => {
    it('should return rules for a specific section', async () => {
      // Set up mock section rules
      const mockRule: CategoryRule = { 
        section: 1, 
        pattern: 'test', 
        confidence: 0.8 
      };
      
      (engine as any).sectionRules = {
        1: { section: 1, name: 'Test Section', rules: [mockRule] }
      };
      
      const rules = engine.getRulesForSection(1);
      
      expect(rules).toEqual([mockRule]);
    });
    
    it('should return empty array for non-existent section', () => {
      const rules = engine.getRulesForSection(999);
      
      expect(rules).toEqual([]);
    });
  });
  
  describe('categorizeField', () => {
    // Set up some mock rules for testing
    beforeEach(() => {
      (engine as any).rules = [
        // Standard pattern match
        { section: 1, pattern: /section1/i, confidence: 0.8 },
        // Entry index extraction
        { 
          section: 2, 
          subsection: 'A',
          pattern: /section2a(\d+)/i, 
          confidence: 0.9,
          entryPattern: /(\d+)$/
        },
        // Field type restriction
        { 
          section: 3, 
          pattern: /section3/i, 
          confidence: 0.7,
          fieldType: ['checkbox'] 
        }
      ];
      
      // Set up strict patterns for critical sections
      (engine as any).strictSectionPatterns = {
        4: [/section4_strict/i]
      };
    });
    
    it('should match field based on name pattern', () => {
      const field: PDFField = { id: '1', name: 'section1_field', value: '', page: 1 };
      
      const result = engine.categorizeField(field);
      
      expect(result).toBeDefined();
      expect(result?.section).toBe(1);
      expect(result?.confidence).toBeGreaterThan(0.5);
    });
    
    it('should match field based on label if name does not match', () => {
      const field: PDFField = { 
        id: '2', 
        name: 'random_name', 
        label: 'This is a Section1 field',
        value: '', 
        page: 1 
      };
      
      const result = engine.categorizeField(field);
      
      expect(result).toBeDefined();
      expect(result?.section).toBe(1);
    });
    
    it('should extract entry index from pattern match', () => {
      const field: PDFField = { id: '3', name: 'section2a5_field', value: '', page: 2 };
      
      const result = engine.categorizeField(field);
      
      expect(result).toBeDefined();
      expect(result?.section).toBe(2);
      expect(result?.subsection).toBe('A');
      expect(result?.entry).toBe(5);
    });
    
    it('should respect field type restrictions', () => {
      // Field with matching pattern but wrong type
      const textField: PDFField = { 
        id: '4', 
        name: 'section3_field', 
        type: 'text',
        value: '', 
        page: 3 
      };
      
      // Field with matching pattern and correct type
      const checkboxField: PDFField = { 
        id: '5', 
        name: 'section3_field', 
        type: 'checkbox',
        value: '', 
        page: 3 
      };
      
      const textResult = engine.categorizeField(textField);
      const checkboxResult = engine.categorizeField(checkboxField);
      
      // Text field should not match due to type restriction
      expect(textResult).toBeUndefined();
      
      // Checkbox field should match
      expect(checkboxResult).toBeDefined();
      expect(checkboxResult?.section).toBe(3);
    });
    
    it('should prioritize strict patterns for critical sections', () => {
      const field: PDFField = { id: '6', name: 'section4_strict', value: '', page: 4 };
      
      const result = engine.categorizeField(field);
      
      expect(result).toBeDefined();
      expect(result?.section).toBe(4);
      expect(result?.confidence).toBeCloseTo(0.99);
    });
    
    it('should return undefined if no rules match', () => {
      const field: PDFField = { id: '7', name: 'no_match', value: '', page: 10 };
      
      const result = engine.categorizeField(field);
      
      expect(result).toBeUndefined();
    });
  });
  
  describe('categorizeFields', () => {
    // Set up some mock fields and rules
    const mockFields: PDFField[] = [
      { id: '1', name: 'section1_field', value: '', page: 1 },
      { id: '2', name: 'section2_field', value: '', page: 2 },
      { id: '3', name: 'unknown_field', value: '', page: 10 }
    ];
    
    beforeEach(() => {
      (engine as any).rules = [
        { section: 1, pattern: /section1/i, confidence: 0.8 },
        { section: 2, pattern: /section2/i, confidence: 0.9 }
      ];
    });
    
    it('should categorize a batch of fields', () => {
      const categorized = engine.categorizeFields(mockFields);
      
      expect(categorized).toHaveLength(3);
      
      // Check each field was categorized correctly
      expect(categorized[0].section).toBe(1);
      expect(categorized[1].section).toBe(2);
      
      // Unknown field should have section 0 (default)
      expect(categorized[2].section).toBe(0);
    });
    
    it('should apply post-categorization validation', () => {
      // Mock the private validation method to verify it's called
      const validateSpy = jest.spyOn(engine as any, 'validateSectionAssignments');
      
      engine.categorizeFields(mockFields);
      
      expect(validateSpy).toHaveBeenCalled();
      
      validateSpy.mockRestore();
    });
  });
  
  // Test remaining utility methods...
  
  describe('createDefaultRuleFile', () => {
    it('should create a default rule file for a section', () => {
      // Mock fs.writeFileSync
      
      engine.createDefaultRuleFile(10, 'Test Section');
      
      expect(fs.writeFileSync).toHaveBeenCalled();
      
      // Extract the call arguments
      const args = (fs.writeFileSync as jest.Mock).mock.calls[0];
      const filePath = args[0];
      const fileContent = JSON.parse(args[1]);
      
      // Verify file path
      expect(filePath).toContain('10.json');
      
      // Verify file content
      expect(fileContent.section).toBe(10);
      expect(fileContent.name).toBe('Test Section');
      expect(fileContent.rules).toBeInstanceOf(Array);
    });
  });
}); 