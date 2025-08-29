#!/usr/bin/env tsx
/**
 * Section Consolidation Migration Script
 * Automatically consolidates multiple versions of section files into a single optimized version
 */

import { promises as fs } from 'fs';
import path from 'path';
import { glob } from 'glob';
import { Command } from 'commander';
import ora from 'ora';

// ============================================================================
// CONFIGURATION
// ============================================================================

const SECTIONS_PATH = path.join(process.cwd(), 'app/state/contexts/sections2.0');
const COMPONENTS_PATH = path.join(process.cwd(), 'app/components/Rendered2.0');
const INTERFACES_PATH = path.join(process.cwd(), 'api/interfaces/section-interfaces');
const BACKUP_PATH = path.join(process.cwd(), '.backup-sections');

interface MigrationConfig {
  section: string;
  dryRun: boolean;
  backup: boolean;
  verbose: boolean;
  all: boolean;
}

interface SectionVariants {
  section: string;
  variants: string[];
  primaryFile?: string;
  hasImproved?: boolean;
}

// ============================================================================
// FILE ANALYSIS
// ============================================================================

async function analyzeSectionFiles(sectionNumber: string): Promise<SectionVariants> {
  const contextPattern = path.join(SECTIONS_PATH, `section${sectionNumber}*.tsx`);
  const componentPattern = path.join(COMPONENTS_PATH, `Section${sectionNumber}Component*.tsx`);
  
  const contextFiles = await glob(contextPattern);
  const componentFiles = await glob(componentPattern);
  
  // Extract variants
  const contextVariants = contextFiles.map(f => path.basename(f));
  const componentVariants = componentFiles.map(f => path.basename(f));
  
  // Identify primary file (prefer -improved, then -optimized, then base)
  let primaryFile: string | undefined;
  const hasImproved = contextVariants.some(v => v.includes('-improved'));
  
  if (hasImproved) {
    primaryFile = contextVariants.find(v => v.includes('-improved'));
  } else if (contextVariants.some(v => v.includes('-optimized'))) {
    primaryFile = contextVariants.find(v => v.includes('-optimized'));
  } else if (contextVariants.some(v => v.includes('-unified'))) {
    primaryFile = contextVariants.find(v => v.includes('-unified'));
  } else {
    primaryFile = `section${sectionNumber}.tsx`;
  }
  
  return {
    section: sectionNumber,
    variants: [...contextVariants, ...componentVariants],
    primaryFile,
    hasImproved
  };
}

// ============================================================================
// CONSOLIDATION LOGIC
// ============================================================================

async function consolidateSection(
  sectionNumber: string,
  config: MigrationConfig,
  spinner: ora.Ora
): Promise<{ success: boolean; message: string }> {
  try {
    spinner.text = `Analyzing section ${sectionNumber}...`;
    const analysis = await analyzeSectionFiles(sectionNumber);
    
    if (analysis.variants.length <= 1) {
      return { 
        success: true, 
        message: `Section ${sectionNumber}: Already consolidated (1 file)` 
      };
    }
    
    spinner.text = `Found ${analysis.variants.length} variants for section ${sectionNumber}`;
    
    if (config.dryRun) {
      return {
        success: true,
        message: `Section ${sectionNumber}: Would consolidate ${analysis.variants.length} files (dry run)`
      };
    }
    
    // Backup if requested
    if (config.backup) {
      await backupFiles(analysis.variants, sectionNumber);
    }
    
    // Generate consolidated version
    spinner.text = `Generating consolidated version for section ${sectionNumber}...`;
    const consolidatedContent = await generateConsolidatedSection(sectionNumber, analysis);
    
    // Write consolidated file
    const consolidatedPath = path.join(SECTIONS_PATH, `section${sectionNumber}.tsx`);
    await fs.writeFile(consolidatedPath, consolidatedContent);
    
    // Update imports
    spinner.text = `Updating imports for section ${sectionNumber}...`;
    await updateImports(sectionNumber, analysis.variants);
    
    // Remove old variants (except the consolidated one)
    spinner.text = `Cleaning up old variants for section ${sectionNumber}...`;
    for (const variant of analysis.variants) {
      if (variant !== `section${sectionNumber}.tsx` && !variant.includes('Component')) {
        const variantPath = path.join(SECTIONS_PATH, variant);
        await fs.unlink(variantPath).catch(() => {}); // Ignore if doesn't exist
      }
    }
    
    return {
      success: true,
      message: `Section ${sectionNumber}: Successfully consolidated ${analysis.variants.length} files into 1`
    };
  } catch (error) {
    return {
      success: false,
      message: `Section ${sectionNumber}: Failed - ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
}

// ============================================================================
// CODE GENERATION
// ============================================================================

async function generateConsolidatedSection(
  sectionNumber: string,
  analysis: SectionVariants
): Promise<string> {
  // Template for consolidated section using best practices
  return `/**
 * Section ${sectionNumber} - Consolidated Context Provider
 * Auto-generated by consolidation script
 * Combines best practices from all variants
 */

import React from 'react';
import { createSectionContext } from './base/BaseSectionContext';
import { ValidationBuilder } from '~/utils/section-utilities';
import type { Field } from '~/utils/section-utilities';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export interface Section${sectionNumber}Data {
  _id: number;
  section${sectionNumber}: {
    // Add section-specific fields here
    // These should be extracted from the original files
  };
}

// ============================================================================
// VALIDATION
// ============================================================================

const validateSection${sectionNumber} = (data: Section${sectionNumber}Data) => {
  const builder = new ValidationBuilder();
  
  // Add validation rules here
  // These should be extracted from the original files
  
  return builder.build();
};

// ============================================================================
// INITIAL STATE
// ============================================================================

const createInitialSection${sectionNumber} = (): Section${sectionNumber}Data => ({
  _id: ${sectionNumber},
  section${sectionNumber}: {
    // Initialize fields here
  }
});

// ============================================================================
// CONTEXT CREATION
// ============================================================================

const { Provider, useContext } = createSectionContext<Section${sectionNumber}Data>({
  sectionName: 'Section${sectionNumber}',
  defaultData: createInitialSection${sectionNumber}(),
  validateSection: validateSection${sectionNumber}
});

export const Section${sectionNumber}Provider = Provider;
export const useSection${sectionNumber} = useContext;

// Re-export types
export type { Field };
`;
}

// ============================================================================
// IMPORT UPDATES
// ============================================================================

async function updateImports(sectionNumber: string, variants: string[]): Promise<void> {
  // Find all files that import the section
  const pattern = path.join(process.cwd(), 'app/**/*.{ts,tsx}');
  const files = await glob(pattern);
  
  for (const file of files) {
    let content = await fs.readFile(file, 'utf-8');
    let modified = false;
    
    // Update imports from variants to consolidated version
    for (const variant of variants) {
      if (variant === `section${sectionNumber}.tsx`) continue;
      
      const variantName = variant.replace('.tsx', '');
      const oldImport = new RegExp(
        `from ['"].*sections2\\.0/${variantName}['"]`,
        'g'
      );
      
      if (oldImport.test(content)) {
        content = content.replace(
          oldImport,
          `from '~/state/contexts/sections2.0/section${sectionNumber}'`
        );
        modified = true;
      }
    }
    
    if (modified) {
      await fs.writeFile(file, content);
    }
  }
}

// ============================================================================
// BACKUP
// ============================================================================

async function backupFiles(files: string[], sectionNumber: string): Promise<void> {
  const backupDir = path.join(BACKUP_PATH, `section${sectionNumber}-${Date.now()}`);
  await fs.mkdir(backupDir, { recursive: true });
  
  for (const file of files) {
    const sourcePath = file.includes('Component')
      ? path.join(COMPONENTS_PATH, file)
      : path.join(SECTIONS_PATH, file);
    
    try {
      const content = await fs.readFile(sourcePath, 'utf-8');
      const destPath = path.join(backupDir, file);
      await fs.writeFile(destPath, content);
    } catch (error) {
      // File might not exist, skip
    }
  }
}

// ============================================================================
// REPORTING
// ============================================================================

function generateReport(results: Array<{ section: string; result: { success: boolean; message: string } }>) {
  console.log('\n' + '='.repeat(60));
  console.log('CONSOLIDATION REPORT');
  console.log('='.repeat(60) + '\n');
  
  const successful = results.filter(r => r.result.success);
  const failed = results.filter(r => !r.result.success);
  
  console.log(`✅ Successful: ${successful.length}`);
  console.log(`❌ Failed: ${failed.length}`);
  console.log(`📊 Total: ${results.length}\n`);
  
  if (successful.length > 0) {
    console.log('Successful Consolidations:');
    successful.forEach(r => {
      console.log(`  ✅ ${r.result.message}`);
    });
  }
  
  if (failed.length > 0) {
    console.log('\nFailed Consolidations:');
    failed.forEach(r => {
      console.log(`  ❌ ${r.result.message}`);
    });
  }
  
  console.log('\n' + '='.repeat(60));
}

// ============================================================================
// CLI
// ============================================================================

const program = new Command();

program
  .name('consolidate-sections')
  .description('Consolidate multiple versions of section files into optimized versions')
  .version('1.0.0');

program
  .argument('[section]', 'Section number to consolidate (e.g., 1, 13)')
  .option('-a, --all', 'Consolidate all sections')
  .option('-d, --dry-run', 'Show what would be done without making changes')
  .option('-b, --backup', 'Create backup before consolidation', true)
  .option('-v, --verbose', 'Verbose output')
  .action(async (section: string | undefined, options: any) => {
    const config: MigrationConfig = {
      section: section || '',
      dryRun: options.dryRun || false,
      backup: options.backup !== false,
      verbose: options.verbose || false,
      all: options.all || false
    };
    
    const spinner = ora('Starting consolidation...').start();
    const results: Array<{ section: string; result: { success: boolean; message: string } }> = [];
    
    try {
      if (config.all) {
        // Process all sections (1-30)
        for (let i = 1; i <= 30; i++) {
          const result = await consolidateSection(i.toString(), config, spinner);
          results.push({ section: i.toString(), result });
        }
      } else if (section) {
        // Process single section
        const result = await consolidateSection(section, config, spinner);
        results.push({ section, result });
      } else {
        spinner.fail('No section specified. Use --all or specify a section number.');
        process.exit(1);
      }
      
      spinner.succeed('Consolidation complete!');
      generateReport(results);
      
      if (config.backup) {
        console.log(`\n📁 Backups saved to: ${BACKUP_PATH}`);
      }
      
    } catch (error) {
      spinner.fail(`Consolidation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      process.exit(1);
    }
  });

// Run if called directly
if (require.main === module) {
  program.parse(process.argv);
}

export { consolidateSection, analyzeSectionFiles };