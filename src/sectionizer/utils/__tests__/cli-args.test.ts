/**
 * Unit tests for the CLI arguments module
 */

import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  parseCommandLineArgs,
  configureCommandLineParser,
  validatePdf,
  configureUtilityCommandParser,
  parseUtilityArgs
} from '../cli-args.js';
import * as fsPromises from 'fs/promises';
import type { CommandLineOptions } from '../cli-args.js';

// Mock fs/promises
vi.mock('fs/promises', () => ({
  access: vi.fn(),
  open: vi.fn()
}));

describe('CLI Arguments Module', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('parseCommandLineArgs', () => {
    test('should return default values when no arguments are provided', () => {
      const options = parseCommandLineArgs(['node', 'test.js']);
      
      expect(options).toMatchObject({
        verbose: false,
        logLevel: 'info',
        selfHealing: false,
        validateCounts: false,
        maxIterations: 5,
        confidenceThreshold: 0.75,
        healingOnly: false
      });
    });

    test('should parse boolean flags correctly', () => {
      const options = parseCommandLineArgs(['node', 'test.js', '--verbose', '--self-healing']);
      
      expect(options.verbose).toBe(true);
      expect(options.selfHealing).toBe(true);
    });

    test('should parse values correctly', () => {
      const options = parseCommandLineArgs([
        'node', 'test.js',
        '--log-level', 'debug',
        '--output', './output',
        '--pdf', './test.pdf',
        '--fields', './fields.json',
        '--max-iterations', '10',
        '--confidence-threshold', '0.9'
      ]);
      
      expect(options.logLevel).toBe('debug');
      expect(options.output).toBe('./output');
      expect(options.pdf).toBe('./test.pdf');
      expect(options.fields).toBe('./fields.json');
      expect(options.maxIterations).toBe(10);
      expect(options.confidenceThreshold).toBe(0.9);
    });
  });

  describe('configureCommandLineParser', () => {
    test('should return a Command object with expected options', () => {
      const program = configureCommandLineParser();
      
      expect(program).toBeDefined();
      expect(program.opts).toBeDefined();
      expect(program.parse).toBeDefined();
      expect(program.name()).toBe('sectionizer');
    });
  });

  describe('validatePdf', () => {
    test('should return isValid: true for valid PDF', async () => {
      // Mock file access and buffer read
      const mockFileHandle = {
        read: vi.fn().mockResolvedValue({ 
          bytesRead: 5,
          buffer: Buffer.from('%PDF-')
        }),
        close: vi.fn().mockResolvedValue(undefined)
      };
      
      vi.mocked(fsPromises.access).mockResolvedValue(undefined);
      vi.mocked(fsPromises.open).mockResolvedValue(mockFileHandle as any);
      
      const result = await validatePdf('test.pdf');
      expect(result.isValid).toBe(true);
      expect(result.errors).toBeUndefined();
    });

    test('should return isValid: false for non-PDF extension', async () => {
      const result = await validatePdf('test.txt');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('File must have .pdf extension');
    });

    test('should return isValid: false if file access fails', async () => {
      vi.mocked(fsPromises.access).mockRejectedValue(new Error('File not found'));
      
      const result = await validatePdf('missing.pdf');
      expect(result.isValid).toBe(false);
      expect(result.errors).toBeDefined();
      expect(result.errors![0]).toContain('Failed to access PDF file');
    });
  });

  describe('configureUtilityCommandParser', () => {
    test('should return a Command object with the provided description', () => {
      const description = 'Test Utility';
      const program = configureUtilityCommandParser(description);
      
      expect(program).toBeDefined();
      expect(program.description()).toBe(description);
    });
  });

  describe('parseUtilityArgs', () => {
    test('should parse arguments from a configured command parser', () => {
      const program = configureUtilityCommandParser('Test');
      program.option('-t, --test <value>', 'Test option');
      
      const args = parseUtilityArgs(program, ['node', 'test.js', '--test', 'value']);
      expect(args).toBeDefined();
      expect(args.test).toBe('value');
    });
  });
}); 