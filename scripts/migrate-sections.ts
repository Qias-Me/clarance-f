#!/usr/bin/env tsx
/**
 * Section Migration Utilities
 * 
 * Automated migration from legacy section architecture to new shared architecture
 * Handles backup, validation, and rollback for safe migration
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

interface SectionMigrationConfig {
  sectionNumber: number;
  currentFiles: {
    interface?: string;
    context?: string;
    component?: string;
    fieldMapping?: string;
  };
  backupDir?: string;
  validateBeforeMigration?: boolean;
  enableRollback?: boolean;
  dryRun?: boolean;
}

interface MigrationResult {
  sectionNumber: number;
  success: boolean;
  filesCreated: string[];
  filesModified: string[];
  filesBackedUp: string[];
  errors: string[];
  warnings: string[];
}

interface LegacyAnalysis {
  sectionNumber: number;
  hasInterface: boolean;
  hasContext: boolean;
  hasComponent: boolean;
  hasFieldMapping: boolean;
  duplicatedPatterns: string[];
  complexityScore: number;
  migrationRecommendation: 'easy' | 'moderate' | 'complex' | 'manual';
}

/**
 * Section migration utilities
 */
export class SectionMigrator {
  private basePath: string;
  private backupPath: string;
  
  constructor(projectPath: string = process.cwd()) {
    this.basePath = projectPath;
    this.backupPath = path.join(projectPath, '.section-migration-backups');
  }
  
  /**
   * Analyze legacy section for migration complexity
   */
  async analyzeLegacySection(sectionNumber: number): Promise<LegacyAnalysis> {
    const analysis: LegacyAnalysis = {
      sectionNumber,
      hasInterface: false,
      hasContext: false,
      hasComponent: false,
      hasFieldMapping: false,
      duplicatedPatterns: [],
      complexityScore: 0,
      migrationRecommendation: 'easy'
    };
    
    // Check for existing files
    const possibleFiles = {
      interface: [
        `api/interfaces/sections2.0/section${sectionNumber}.ts`,
        `api/interfaces/section-interfaces/section${sectionNumber}.ts`
      ],
      context: [
        `app/state/contexts/sections2.0/section${sectionNumber}.tsx`,
        `app/contexts/section${sectionNumber}.tsx`
      ],
      component: [
        `app/components/Rendered2.0/Section${sectionNumber}Component.tsx`,
        `app/components/sections/Section${sectionNumber}.tsx`
      ],
      fieldMapping: [
        `app/state/contexts/sections2.0/section${sectionNumber}-field-mapping.ts`,
        `app/utils/section${sectionNumber}-mapping.ts`
      ]
    };
    
    // Check file existence and analyze content
    for (const [type, paths] of Object.entries(possibleFiles)) {
      for (const filePath of paths) {
        const fullPath = path.join(this.basePath, filePath);
        if (fs.existsSync(fullPath)) {
          (analysis as any)[`has${type.charAt(0).toUpperCase()}${type.slice(1)}`] = true;
          
          // Analyze file content for complexity
          const content = fs.readFileSync(fullPath, 'utf-8');
          const complexity = this.analyzeFileComplexity(content, type);
          analysis.complexityScore += complexity;
          
          // Check for duplicated patterns
          const patterns = this.identifyDuplicatedPatterns(content);
          analysis.duplicatedPatterns.push(...patterns);
          
          break; // Use first found file
        }
      }
    }
    
    // Determine migration recommendation
    if (analysis.complexityScore < 20) {
      analysis.migrationRecommendation = 'easy';
    } else if (analysis.complexityScore < 50) {
      analysis.migrationRecommendation = 'moderate';
    } else if (analysis.complexityScore < 100) {
      analysis.migrationRecommendation = 'complex';
    } else {
      analysis.migrationRecommendation = 'manual';
    }
    
    return analysis;
  }
  
  /**
   * Analyze file complexity for migration assessment
   */
  private analyzeFileComplexity(content: string, fileType: string): number {
    let complexity = 0;
    
    // Line count complexity
    const lines = content.split('\n').length;
    complexity += Math.min(lines / 10, 20);
    
    // Pattern complexity based on file type
    switch (fileType) {
      case 'interface':
        complexity += (content.match(/interface/g) || []).length * 2;
        complexity += (content.match(/type/g) || []).length;
        break;
      case 'context':
        complexity += (content.match(/useState/g) || []).length * 2;
        complexity += (content.match(/useEffect/g) || []).length * 3;
        complexity += (content.match(/createContext/g) || []).length * 5;
        break;
      case 'component':
        complexity += (content.match(/const.*=.*\(/g) || []).length;
        complexity += (content.match(/return \(/g) || []).length * 2;
        break;
      case 'fieldMapping':
        complexity += (content.match(/:/g) || []).length / 10;
        break;
    }
    
    // Custom logic complexity
    complexity += (content.match(/if\s*\(/g) || []).length;
    complexity += (content.match(/switch\s*\(/g) || []).length * 2;
    complexity += (content.match(/for\s*\(/g) || []).length * 2;
    complexity += (content.match(/while\s*\(/g) || []).length * 3;
    
    return complexity;
  }
  
  /**
   * Identify duplicated patterns that can be replaced with shared types
   */
  private identifyDuplicatedPatterns(content: string): string[] {
    const patterns: string[] = [];
    
    // Common interface patterns
    if (content.includes('PersonName') || content.match(/firstName.*lastName/)) {
      patterns.push('PersonName interface duplication');
    }
    
    if (content.includes('DateRange') || content.match(/startDate.*endDate/)) {
      patterns.push('DateRange interface duplication');
    }
    
    if (content.includes('Address') || content.match(/street.*city.*state/)) {
      patterns.push('Address interface duplication');
    }
    
    // Common validation patterns
    if (content.match(/required.*validation/i)) {
      patterns.push('Required validation duplication');
    }
    
    if (content.match(/email.*validation/i)) {
      patterns.push('Email validation duplication');
    }
    
    // Common context patterns
    if (content.match(/useState.*errors/)) {
      patterns.push('Error state duplication');
    }
    
    if (content.match(/useState.*loading/)) {
      patterns.push('Loading state duplication');
    }
    
    return patterns;
  }
  
  /**
   * Create backup of existing files before migration
   */
  private createBackup(config: SectionMigrationConfig): string[] {
    const backupDir = path.join(this.backupPath, `section${config.sectionNumber}-${Date.now()}`);
    const backedUpFiles: string[] = [];
    
    if (!fs.existsSync(this.backupPath)) {
      fs.mkdirSync(this.backupPath, { recursive: true });
    }
    
    fs.mkdirSync(backupDir, { recursive: true });
    
    // Backup existing files
    for (const [type, filePath] of Object.entries(config.currentFiles)) {
      if (!filePath) continue;
      
      const fullPath = path.join(this.basePath, filePath);
      if (fs.existsSync(fullPath)) {
        const backupPath = path.join(backupDir, `${type}-${path.basename(filePath)}`);
        fs.copyFileSync(fullPath, backupPath);
        backedUpFiles.push(backupPath);
      }
    }
    
    return backedUpFiles;
  }
  
  /**
   * Extract data from legacy interface file
   */
  private extractLegacyInterface(filePath: string): any {
    if (!fs.existsSync(filePath)) {
      return null;
    }
    
    const content = fs.readFileSync(filePath, 'utf-8');
    
    // Simple extraction logic - in reality would use AST parsing
    const interfaceMatch = content.match(/export interface Section(\d+)Data\s*{([^}]+)}/s);
    if (!interfaceMatch) {
      return null;
    }
    
    const interfaceBody = interfaceMatch[2];
    const fields: any[] = [];
    
    // Extract field definitions
    const fieldMatches = interfaceBody.match(/(\w+)(\??):\s*([^;]+);/g) || [];
    for (const match of fieldMatches) {
      const fieldMatch = match.match(/(\w+)(\??):\s*([^;]+);/);
      if (fieldMatch) {
        fields.push({
          name: fieldMatch[1],
          required: !fieldMatch[2], // no ? means required
          type: fieldMatch[3].trim()
        });
      }
    }
    
    return {
      sectionNumber: parseInt(interfaceMatch[1]),
      fields
    };
  }
  
  /**
   * Generate new interface using shared types
   */
  private generateNewInterface(sectionNumber: number, legacyData: any): string {
    const fields = legacyData?.fields || [];
    
    // Convert legacy field types to use shared types
    const convertedFields = fields.map((field: any) => {
      let type = field.type;
      
      // Replace common patterns with shared types
      if (type.includes('firstName') && type.includes('lastName')) {
        type = 'PersonName';
      } else if (type.includes('startDate') && type.includes('endDate')) {
        type = 'DateRange';
      } else if (type.includes('street') && type.includes('city')) {
        type = 'Address';
      } else if (type.includes('Field<')) {
        // Already using Field type
      } else {
        // Wrap in Field type
        type = `Field<${type}>`;
      }
      
      const optional = field.required ? '' : '?';
      return `  ${field.name}${optional}: ${type};`;
    }).join('\\n');
    
    return `/**
 * Section ${sectionNumber} Interface
 * Migrated to use shared base types
 */

import type { Field, FieldWithOptions } from '../../../formDefinition2.0';
import type { 
  BaseSection, 
  PersonName, 
  DateRange, 
  Address 
} from '../shared/base-types';

export interface Section${sectionNumber}Data {
${fields}
}

export interface Section${sectionNumber} extends BaseSection<Section${sectionNumber}Data> {
  sectionNumber: ${sectionNumber};
  sectionName: 'section${sectionNumber}';
}`;
  }
  
  /**
   * Generate new context using BaseSectionContext
   */
  private generateNewContext(sectionNumber: number): string {
    return `/**
 * Section ${sectionNumber} Context
 * Migrated to use BaseSectionContext
 */

import { createBaseSectionContext } from '../../base/BaseSectionContext';
import type { Section${sectionNumber}Data } from '../../../api/interfaces/section-interfaces/section${sectionNumber}';
import { section${sectionNumber}Config } from '../../../config/sections/section${sectionNumber}.config';

// Create the context using the base factory
const {
  Context: Section${sectionNumber}Context,
  Provider: Section${sectionNumber}Provider,
  useSection: useSection${sectionNumber}
} = createBaseSectionContext<Section${sectionNumber}Data>(
  section${sectionNumber}Config,
  {
    enableAutoSave: true,
    autoSaveDelay: 2000,
    enableChangeTracking: true,
    enableIncrementalValidation: true,
    validationDebounce: 300
  }
);

export {
  Section${sectionNumber}Context,
  Section${sectionNumber}Provider,
  useSection${sectionNumber}
};`;
  }
  
  /**
   * Generate new component using HOC wrapper
   */
  private generateNewComponent(sectionNumber: number): string {
    return `/**
 * Section ${sectionNumber} Component
 * Migrated to use withSectionWrapper HOC
 */

import React, { memo } from 'react';
import { withSectionWrapper } from '../hoc/withSectionWrapper';
import { useSection${sectionNumber} } from '../../state/contexts/sections2.0/section${sectionNumber}';
import { FieldRenderer } from '../fields/FieldRenderer';

const Section${sectionNumber}Fields: React.FC = () => {
  const { 
    data, 
    updateField, 
    errors, 
    warnings, 
    isLoading 
  } = useSection${sectionNumber}();
  
  if (isLoading) {
    return <div className="animate-pulse">Loading...</div>;
  }
  
  return (
    <div className="space-y-6">
      {/* TODO: Add specific field renderers based on section requirements */}
    </div>
  );
};

export const Section${sectionNumber}Component = withSectionWrapper(
  Section${sectionNumber}Fields,
  {
    sectionNumber: ${sectionNumber},
    title: 'Section ${sectionNumber}',
    description: 'Please provide the required information.',
    enableProgressBar: true,
    enableAutoSave: true,
    enableKeyboardShortcuts: true
  }
);`;
  }
  
  /**
   * Migrate single section
   */
  async migrateLegacySection(config: SectionMigrationConfig): Promise<MigrationResult> {
    const result: MigrationResult = {
      sectionNumber: config.sectionNumber,
      success: false,
      filesCreated: [],
      filesModified: [],
      filesBackedUp: [],
      errors: [],
      warnings: []
    };
    
    try {
      console.log(`🔄 Starting migration for Section ${config.sectionNumber}...`);
      
      // Validate before migration
      if (config.validateBeforeMigration) {
        const analysis = await this.analyzeLegacySection(config.sectionNumber);
        if (analysis.migrationRecommendation === 'manual') {
          result.errors.push('Section is too complex for automated migration - manual migration required');
          return result;
        }
        
        if (analysis.duplicatedPatterns.length > 0) {
          result.warnings.push(`Found duplicated patterns: ${analysis.duplicatedPatterns.join(', ')}`);
        }
      }
      
      // Create backup if enabled
      if (config.enableRollback) {
        result.filesBackedUp = this.createBackup(config);
        console.log(`📁 Created backup with ${result.filesBackedUp.length} files`);
      }
      
      // Extract legacy data
      const legacyInterface = config.currentFiles.interface 
        ? this.extractLegacyInterface(path.join(this.basePath, config.currentFiles.interface))
        : null;
      
      if (config.dryRun) {
        console.log('🧪 DRY RUN - No files will be modified');
        result.success = true;
        return result;
      }
      
      // Generate new files
      const newInterface = this.generateNewInterface(config.sectionNumber, legacyInterface);
      const newContext = this.generateNewContext(config.sectionNumber);
      const newComponent = this.generateNewComponent(config.sectionNumber);
      
      // Write new interface
      const interfacePath = path.join(
        this.basePath,
        `api/interfaces/section-interfaces/section${config.sectionNumber}.ts`
      );
      fs.mkdirSync(path.dirname(interfacePath), { recursive: true });
      fs.writeFileSync(interfacePath, newInterface);
      result.filesCreated.push(interfacePath);
      
      // Write new context
      const contextPath = path.join(
        this.basePath,
        `app/state/contexts/sections2.0/section${config.sectionNumber}.tsx`
      );
      fs.mkdirSync(path.dirname(contextPath), { recursive: true });
      fs.writeFileSync(contextPath, newContext);
      result.filesCreated.push(contextPath);
      
      // Write new component
      const componentPath = path.join(
        this.basePath,
        `app/components/Rendered2.0/Section${config.sectionNumber}Component.tsx`
      );
      fs.mkdirSync(path.dirname(componentPath), { recursive: true });
      fs.writeFileSync(componentPath, newComponent);
      result.filesCreated.push(componentPath);
      
      result.success = true;
      console.log(`✅ Successfully migrated Section ${config.sectionNumber}`);
      
    } catch (error) {
      result.errors.push(`Migration failed: ${(error as Error).message}`);
      console.error(`❌ Migration failed for Section ${config.sectionNumber}:`, error);
    }
    
    return result;
  }
  
  /**
   * Migrate multiple sections
   */
  async migrateLegacySections(sectionNumbers: number[], options: {
    dryRun?: boolean;
    enableRollback?: boolean;
    validateFirst?: boolean;
  } = {}): Promise<MigrationResult[]> {
    const results: MigrationResult[] = [];
    
    console.log(`🚀 Starting batch migration for ${sectionNumbers.length} sections...`);
    
    for (const sectionNumber of sectionNumbers) {
      console.log(`\\n--- Section ${sectionNumber} ---`);
      
      // Auto-discover current files
      const config: SectionMigrationConfig = {
        sectionNumber,
        currentFiles: await this.discoverCurrentFiles(sectionNumber),
        dryRun: options.dryRun,
        enableRollback: options.enableRollback,
        validateBeforeMigration: options.validateFirst
      };
      
      const result = await this.migrateLegacySection(config);
      results.push(result);
      
      // Stop on critical errors
      if (!result.success && result.errors.some(e => e.includes('critical'))) {
        console.log('🛑 Stopping migration due to critical error');
        break;
      }
    }
    
    // Summary
    const successful = results.filter(r => r.success).length;
    const failed = results.length - successful;
    
    console.log(`\\n📊 Migration Summary:`);
    console.log(`   ✅ Successful: ${successful}`);
    console.log(`   ❌ Failed: ${failed}`);
    console.log(`   📁 Total files created: ${results.reduce((sum, r) => sum + r.filesCreated.length, 0)}`);
    console.log(`   💾 Total files backed up: ${results.reduce((sum, r) => sum + r.filesBackedUp.length, 0)}`);
    
    return results;
  }
  
  /**
   * Auto-discover current files for a section
   */
  private async discoverCurrentFiles(sectionNumber: number): Promise<SectionMigrationConfig['currentFiles']> {
    const possibleFiles = {
      interface: [
        `api/interfaces/sections2.0/section${sectionNumber}.ts`,
        `api/interfaces/section-interfaces/section${sectionNumber}.ts`
      ],
      context: [
        `app/state/contexts/sections2.0/section${sectionNumber}.tsx`,
        `app/contexts/section${sectionNumber}.tsx`
      ],
      component: [
        `app/components/Rendered2.0/Section${sectionNumber}Component.tsx`,
        `app/components/sections/Section${sectionNumber}.tsx`
      ],
      fieldMapping: [
        `app/state/contexts/sections2.0/section${sectionNumber}-field-mapping.ts`,
        `app/utils/section${sectionNumber}-mapping.ts`
      ]
    };
    
    const found: SectionMigrationConfig['currentFiles'] = {};
    
    for (const [type, paths] of Object.entries(possibleFiles)) {
      for (const filePath of paths) {
        if (fs.existsSync(path.join(this.basePath, filePath))) {
          (found as any)[type] = filePath;
          break;
        }
      }
    }
    
    return found;
  }
  
  /**
   * Rollback migration for specific section
   */
  async rollbackMigration(sectionNumber: number, backupTimestamp?: number): Promise<boolean> {
    try {
      // Find most recent backup if not specified
      const backupDirs = fs.readdirSync(this.backupPath)
        .filter(dir => dir.startsWith(`section${sectionNumber}-`))
        .sort()
        .reverse();
      
      if (backupDirs.length === 0) {
        console.error(`❌ No backup found for Section ${sectionNumber}`);
        return false;
      }
      
      let targetBackup = backupDirs[0];
      if (backupTimestamp) {
        const timestampBackup = backupDirs.find(dir => dir.includes(backupTimestamp.toString()));
        if (timestampBackup) {
          targetBackup = timestampBackup;
        }
      }
      
      const backupDir = path.join(this.backupPath, targetBackup);
      console.log(`🔄 Rolling back Section ${sectionNumber} from backup: ${targetBackup}`);
      
      // Restore backed up files
      const backupFiles = fs.readdirSync(backupDir);
      for (const backupFile of backupFiles) {
        const [type, ...nameParts] = backupFile.split('-');
        const originalName = nameParts.join('-');
        
        // Determine original location
        let originalPath: string;
        switch (type) {
          case 'interface':
            originalPath = `api/interfaces/sections2.0/${originalName}`;
            break;
          case 'context':
            originalPath = `app/state/contexts/sections2.0/${originalName}`;
            break;
          case 'component':
            originalPath = `app/components/Rendered2.0/${originalName}`;
            break;
          default:
            continue;
        }
        
        const sourcePath = path.join(backupDir, backupFile);
        const destPath = path.join(this.basePath, originalPath);
        
        fs.mkdirSync(path.dirname(destPath), { recursive: true });
        fs.copyFileSync(sourcePath, destPath);
        console.log(`📁 Restored: ${originalPath}`);
      }
      
      console.log(`✅ Successfully rolled back Section ${sectionNumber}`);
      return true;
      
    } catch (error) {
      console.error(`❌ Rollback failed for Section ${sectionNumber}:`, error);
      return false;
    }
  }
}

/**
 * Main CLI
 */
async function main() {
  const args = process.argv.slice(2);
  const command = args[0];
  
  const migrator = new SectionMigrator();
  
  switch (command) {
    case 'analyze': {
      const sectionNumber = parseInt(args[1]);
      if (!sectionNumber) {
        console.error('Usage: tsx migrate-sections.ts analyze <section-number>');
        return;
      }
      
      const analysis = await migrator.analyzeLegacySection(sectionNumber);
      console.log('📊 Section Analysis:');
      console.log(JSON.stringify(analysis, null, 2));
      break;
    }
    
    case 'migrate': {
      const sectionNumbers = args.slice(1).map(n => parseInt(n)).filter(n => !isNaN(n));
      if (sectionNumbers.length === 0) {
        console.error('Usage: tsx migrate-sections.ts migrate <section-numbers...> [--dry-run] [--no-backup] [--no-validate]');
        return;
      }
      
      const dryRun = args.includes('--dry-run');
      const enableRollback = !args.includes('--no-backup');
      const validateFirst = !args.includes('--no-validate');
      
      await migrator.migrateLegacySections(sectionNumbers, {
        dryRun,
        enableRollback,
        validateFirst
      });
      break;
    }
    
    case 'rollback': {
      const sectionNumber = parseInt(args[1]);
      if (!sectionNumber) {
        console.error('Usage: tsx migrate-sections.ts rollback <section-number> [timestamp]');
        return;
      }
      
      const timestamp = args[2] ? parseInt(args[2]) : undefined;
      await migrator.rollbackMigration(sectionNumber, timestamp);
      break;
    }
    
    default:
      console.log(`
📦 Section Migration Utilities

Usage:
  tsx migrate-sections.ts analyze <section-number>
    Analyze a legacy section for migration complexity

  tsx migrate-sections.ts migrate <section-numbers...> [options]
    Migrate sections to new architecture
    Options:
      --dry-run      Show what would be done without making changes
      --no-backup    Skip creating rollback backups  
      --no-validate  Skip pre-migration validation

  tsx migrate-sections.ts rollback <section-number> [timestamp]
    Rollback a section to backed up state

Examples:
  tsx migrate-sections.ts analyze 13
  tsx migrate-sections.ts migrate 1 2 3 --dry-run
  tsx migrate-sections.ts migrate 13 14 15
  tsx migrate-sections.ts rollback 13
      `);
  }
}

// Run if executed directly
if (require.main === module) {
  main().catch(console.error);
}

export { SectionMigrator };