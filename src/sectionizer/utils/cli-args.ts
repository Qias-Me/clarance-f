/**
 * Centralized Command Line Arguments Processing Module
 *
 * This module provides a standardized way to handle command line arguments
 * across the sectionizer project.
 */

import { Command } from 'commander';
import type { OptionValues } from 'commander';
import path from 'path';
import * as fsPromises from 'fs/promises';
import * as fs from 'fs';
import { PDFDocument } from 'pdf-lib';

/**
 * Interface for common command line options used throughout the application
 */
export interface CommandLineOptions {
  pdfPath: string;
  inputFields?: string;
  outputDir?: string;
  selfHealing?: boolean;
  validate?: boolean;
  maxIterations?: number;
  logLevel?: 'debug' | 'info' | 'warn' | 'error' | 'success';
  generateReport?: boolean;
  force?: boolean;
  verbose?: boolean;
  exportSections?: boolean;
}

/**
 * Setup and configure command line parser with standard options
 * @returns Configured Commander instance ready for parsing
 */
export function configureCommandLineParser(): Command {
  const program = new Command();

  program
    .name("sf86-sectionizer")
    .description("SF-86 PDF sectionizer tool")
    .version("2.0.0");

  program
    .option(
      "-p, --pdf-path <path>",
      "Path to the SF-86 PDF file to process"
    )
    .option(
      "-i, --input-fields <path>",
      "Path to input JSON file containing extracted fields to process"
    )
    .option(
      "-o, --output-dir <directory>",
      "Output directory for generated files",
      "./output"
    )
    .option(
      "--no-self-healing",
      "Disable self-healing mechanism for unknown fields"
    )
    .option(
      "--no-validate",
      "Disable validation of section counts against reference data"
    )
    .option(
      "-m, --max-iterations <number>",
      "Maximum number of iterations for self-healing",
      parseIntOption,
      25
    )
    .option(
      "-l, --log-level <level>",
      "Set log level (debug, info, warn, error, success)",
      "info"
    )
    .option(
      "-r, --generate-report",
      "Generate summary report after processing"
    )
    .option(
      "-f, --force",
      "Force extraction even when cache exists",
      false
    )
    .option(
      "--verbose",
      "Show detailed output"
    )
    .option(
      "--export-sections",
      "Export each section to separate JSON files in output/sections/ directory"
    );

  program.addHelpText(
    "after",
    `
Examples:
  $ sf86-sectionizer --pdf-path ./example.pdf
  $ sf86-sectionizer --input-fields ./extracted-fields.json --output-dir ./output
  $ sf86-sectionizer -p ./example.pdf --no-self-healing --log-level debug
  $ sf86-sectionizer -p ./example.pdf --export-sections --output-dir ./output
`
  );

  return program;
}

/**
 * Parse command line arguments and return type-safe options
 * @param argv Optional array of command line arguments (uses process.argv if not provided)
 * @returns Typed and validated CommandLineOptions object
 */
export function parseCommandLineArgs(argv?: string[]): CommandLineOptions {
  const program = configureCommandLineParser();

  // Parse argv if provided, otherwise use process.argv
  program.parse(argv || process.argv);
  const opts = program.opts();

  // Convert and validate options
  const options: CommandLineOptions = {
    pdfPath: opts.pdfPath,
    inputFields: opts.inputFields,
    outputDir: opts.outputDir,
    selfHealing: !!opts.selfHealing,
    validate: !!opts.validate,
    maxIterations: opts.maxIterations,
    logLevel: opts.logLevel,
    generateReport: !!opts.generateReport,
    force: !!opts.force,
    verbose: !!opts.verbose,
    exportSections: !!opts.exportSections
  };

  return options;
}

/**
 * Validate the log level, defaulting to 'info' if invalid
 * @param level The provided log level string
 * @returns Valid log level or 'info' if invalid
 * @private
 */
function validateLogLevel(level: unknown): 'debug' | 'info' | 'warn' | 'error' | 'success' {
  if (
    typeof level === 'string' &&
    ['debug', 'info', 'warn', 'error', 'success'].includes(level.toLowerCase())
  ) {
    return level.toLowerCase() as 'debug' | 'info' | 'warn' | 'error' | 'success';
  }
  return 'info';
}

/**
 * Validate PDF file exists and is readable
 * @param pdfPath Path to PDF file
 * @returns True if valid, false otherwise
 */
export async function validatePdf(pdfPath: string): Promise<boolean> {
  console.log(`Validating PDF path: ${pdfPath}`);
  try {
    const stats = await fs.promises.stat(pdfPath);
    const isFile = stats.isFile();
    const extension = path.extname(pdfPath).toLowerCase();
    const isValidExtension = extension === '.pdf';

    console.log(`PDF validation results: isFile=${isFile}, extension=${extension}, isValidExtension=${isValidExtension}`);

    return isFile && isValidExtension;
  } catch (error) {
    console.error(`Error validating PDF: ${error}`);
    return false;
  }
}

/**
 * Configure command line parser for standalone utility scripts
 * @param description Description of the utility tool's purpose
 * @returns Commander instance configured for a utility script
 */
export function configureUtilityCommandParser(description: string): Command {
  const program = new Command();

  program
    .name("utility-script")
    .description(description)
    .version("1.0.0");

  return program;
}

/**
 * Parse command line arguments for utility scripts with custom options
 * @param program Configured Commander instance for the utility
 * @param argv Optional array of command line arguments
 * @returns Parsed options object with type T
 */
export function parseUtilityArgs<T extends OptionValues>(
  program: Command,
  argv?: string[]
): T {
  program.parse(argv || process.argv);
  return program.opts() as T;
}

/**
 * Parse integer option handling invalid inputs
 * @param value Option value
 * @returns Parsed integer or default value
 */
function parseIntOption(value: string, defaultValue: number = 0): number {
  const parsedValue = parseInt(value, 10);
  return isNaN(parsedValue) ? defaultValue : parsedValue;
}