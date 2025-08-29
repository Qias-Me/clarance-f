#!/usr/bin/env node
/**
 * Mass Section Migration Tool
 * Automatically migrates all sections to unified architecture
 */

import fs from 'fs';
import path from 'path';
import { logger } from '../app/utils/logger';

interface MigrationPlan {
  sectionNumber: number;
  currentFile: string;
  backupFile: string;
  newFile: string;
  complexity: 'simple' | 'moderate' | 'complex';
  hasCustomLogic: boolean;
  fieldsCount: number;
  riskLevel: 'low' | 'medium' | 'high';
}

class MassSectionMigrator {
  private projectRoot: string;
  private migrationPlans: MigrationPlan[] = [];

  constructor() {
    this.projectRoot = path.resolve(process.cwd());
  }

  /**
   * Analyze all sections and create migration plan
   */
  async analyzeSections(): Promise<void> {
    const contextDir = path.join(this.projectRoot, 'app/state/contexts/sections2.0');
    const componentDir = path.join(this.projectRoot, 'app/components/Rendered2.0');

    // Find all section files
    const contextFiles = fs.readdirSync(contextDir)
      .filter(file => file.match(/^section\d+\.tsx$/))
      .sort();

    for (const file of contextFiles) {
      const sectionMatch = file.match(/section(\d+)\.tsx/);
      if (!sectionMatch) continue;

      const sectionNumber = parseInt(sectionMatch[1]);
      const contextPath = path.join(contextDir, file);
      const componentPath = path.join(componentDir, `Section${sectionNumber}Component.tsx`);

      // Analyze complexity
      const plan = await this.analyzeSectionComplexity(sectionNumber, contextPath, componentPath);
      this.migrationPlans.push(plan);
    }

    // Sort by risk level (migrate low-risk first)
    this.migrationPlans.sort((a, b) => {
      const riskOrder = { low: 1, medium: 2, high: 3 };
      return riskOrder[a.riskLevel] - riskOrder[b.riskLevel];
    });
  }

  /**
   * Analyze individual section complexity
   */
  private async analyzeSectionComplexity(
    sectionNumber: number,
    contextPath: string,
    componentPath: string
  ): Promise<MigrationPlan> {
    const contextContent = fs.existsSync(contextPath) 
      ? fs.readFileSync(contextPath, 'utf8') 
      : '';
    
    const componentContent = fs.existsSync(componentPath)
      ? fs.readFileSync(componentPath, 'utf8')
      : '';

    // Calculate complexity metrics
    const contextLines = contextContent.split('\n').length;
    const componentLines = componentContent.split('\n').length;
    const totalLines = contextLines + componentLines;

    const hasCustomLogic = this.detectCustomLogic(contextContent, componentContent);
    const fieldsCount = this.estimateFieldsCount(contextContent, componentContent);

    let complexity: 'simple' | 'moderate' | 'complex';
    let riskLevel: 'low' | 'medium' | 'high';

    if (totalLines < 200 && !hasCustomLogic) {
      complexity = 'simple';
      riskLevel = 'low';
    } else if (totalLines < 500 && fieldsCount < 50) {
      complexity = 'moderate';
      riskLevel = hasCustomLogic ? 'medium' : 'low';
    } else {
      complexity = 'complex';
      riskLevel = hasCustomLogic ? 'high' : 'medium';
    }

    return {
      sectionNumber,
      currentFile: contextPath,
      backupFile: `${contextPath}.backup-${new Date().toISOString().split('T')[0]}`,
      newFile: `${contextPath.replace('.tsx', '-unified.tsx')}`,
      complexity,
      hasCustomLogic,
      fieldsCount,
      riskLevel
    };
  }

  /**
   * Detect custom logic that requires manual review
   */
  private detectCustomLogic(contextContent: string, componentContent: string): boolean {
    const content = contextContent + componentContent;
    
    const customLogicIndicators = [
      /useEffect.*\[\]/g,        // Complex effects
      /useMemo.*dependency/g,     // Complex memoization
      /useCallback.*complex/g,    // Complex callbacks
      /switch.*case.*:/g,         // Switch statements
      /if.*else.*if/g,           // Complex conditionals
      /try.*catch/g,             // Error handling
      /Promise\./g,              // Async operations
      /setTimeout|setInterval/g,  // Timers
      /fetch|axios/g,            // API calls
      /localStorage|sessionStorage/g, // Storage access
    ];

    return customLogicIndicators.some(pattern => pattern.test(content));
  }

  /**
   * Estimate number of fields in section
   */
  private estimateFieldsCount(contextContent: string, componentContent: string): number {
    const content = contextContent + componentContent;
    
    const fieldPatterns = [
      /input.*type=/g,
      /select.*name=/g,
      /textarea.*name=/g,
      /FieldRenderer/g,
      /\.field\./g,
    ];

    let count = 0;
    fieldPatterns.forEach(pattern => {
      const matches = content.match(pattern);
      if (matches) count += matches.length;
    });

    return Math.max(count, 5); // Minimum estimate
  }

  /**
   * Generate migration code for a section
   */
  private generateMigrationCode(plan: MigrationPlan): string {
    return `/**
 * Section ${plan.sectionNumber}: Unified Architecture Migration
 * 
 * Migrated from legacy architecture (${plan.complexity} complexity)
 * Fields estimated: ${plan.fieldsCount}
 * Risk level: ${plan.riskLevel}
 */

import { createUnifiedSectionContext, createSectionHook } from './base/UnifiedSectionContext';
import type { ValidationError } from './base/UnifiedSectionContext';

// Section ${plan.sectionNumber} data interface
export interface Section${plan.sectionNumber}Data {
  // TODO: Define actual fields based on original implementation
  [key: string]: any;
}

// Default data for Section ${plan.sectionNumber}
const defaultSection${plan.sectionNumber}Data: Section${plan.sectionNumber}Data = {
  // TODO: Populate with actual default values
};

// Validation rules for Section ${plan.sectionNumber}
const validateSection${plan.sectionNumber} = (data: Section${plan.sectionNumber}Data): ValidationError[] => {
  const errors: ValidationError[] = [];
  
  // TODO: Implement validation rules from original
  ${plan.hasCustomLogic ? '// MANUAL REVIEW REQUIRED: Custom validation logic detected' : ''}
  
  return errors;
};

// Data transformation function
const transformSection${plan.sectionNumber}Data = (data: Section${plan.sectionNumber}Data): Section${plan.sectionNumber}Data => {
  // TODO: Implement data transformations from original
  ${plan.hasCustomLogic ? '// MANUAL REVIEW REQUIRED: Custom transformation logic detected' : ''}
  return data;
};

// Create the unified context
export const {
  Provider: Section${plan.sectionNumber}Provider,
  useContext: useSection${plan.sectionNumber}Context,
  Context: Section${plan.sectionNumber}Context
} = createUnifiedSectionContext<Section${plan.sectionNumber}Data>({
  sectionName: 'Section${plan.sectionNumber}',
  sectionNumber: ${plan.sectionNumber},
  defaultData: defaultSection${plan.sectionNumber}Data,
  validateSection: validateSection${plan.sectionNumber},
  transformData: transformSection${plan.sectionNumber}Data,
  debounceMs: 300,
  autoSave: ${plan.complexity === 'complex' ? 'false' : 'true'}
});

// Enhanced hook with Section ${plan.sectionNumber}-specific utilities
export const useSection${plan.sectionNumber} = createSectionHook(
  useSection${plan.sectionNumber}Context,
  ${plan.sectionNumber},
  (context) => ({
    // Backward compatibility
    section${plan.sectionNumber}Data: context.data,
    
    // TODO: Add section-specific utilities from original
    ${plan.hasCustomLogic ? '// MANUAL REVIEW REQUIRED: Custom utilities detected' : ''}
  })
);

// Legacy export for migration compatibility
export const Section${plan.sectionNumber}ContextProvider = Section${plan.sectionNumber}Provider;`;
  }

  /**
   * Execute migration for all planned sections
   */
  async executeMigration(dryRun: boolean = true): Promise<void> {
    console.log(`\n🚀 Starting mass section migration (${dryRun ? 'DRY RUN' : 'LIVE'})`);
    console.log(`📊 ${this.migrationPlans.length} sections identified for migration\n`);

    const stats = {
      simple: this.migrationPlans.filter(p => p.complexity === 'simple').length,
      moderate: this.migrationPlans.filter(p => p.complexity === 'moderate').length,
      complex: this.migrationPlans.filter(p => p.complexity === 'complex').length,
      lowRisk: this.migrationPlans.filter(p => p.riskLevel === 'low').length,
      mediumRisk: this.migrationPlans.filter(p => p.riskLevel === 'medium').length,
      highRisk: this.migrationPlans.filter(p => p.riskLevel === 'high').length,
    };

    console.log('📋 Migration Overview:');
    console.log(`   Simple: ${stats.simple} | Moderate: ${stats.moderate} | Complex: ${stats.complex}`);
    console.log(`   Low Risk: ${stats.lowRisk} | Medium Risk: ${stats.mediumRisk} | High Risk: ${stats.highRisk}\n`);

    let successful = 0;
    let failed = 0;
    let requiresReview = 0;

    for (const plan of this.migrationPlans) {
      try {
        console.log(`📝 Processing Section ${plan.sectionNumber} (${plan.complexity}, ${plan.riskLevel} risk)...`);
        
        if (!dryRun) {
          // Create backup
          fs.copyFileSync(plan.currentFile, plan.backupFile);
          
          // Generate and write new file
          const migrationCode = this.generateMigrationCode(plan);
          fs.writeFileSync(plan.newFile, migrationCode, 'utf8');
        }

        if (plan.hasCustomLogic || plan.riskLevel === 'high') {
          requiresReview++;
          console.log(`   ⚠️  Manual review required - custom logic detected`);
        } else {
          successful++;
          console.log(`   ✅ Ready for automatic migration`);
        }

      } catch (error) {
        failed++;
        console.log(`   ❌ Migration failed: ${error}`);
      }
    }

    console.log('\n📊 Migration Summary:');
    console.log(`   ✅ Ready for auto-migration: ${successful}`);
    console.log(`   ⚠️  Requires manual review: ${requiresReview}`);
    console.log(`   ❌ Failed: ${failed}`);
    
    if (requiresReview > 0) {
      console.log('\n🔍 Sections requiring manual review:');
      this.migrationPlans
        .filter(p => p.hasCustomLogic || p.riskLevel === 'high')
        .forEach(p => {
          console.log(`   - Section ${p.sectionNumber}: ${p.complexity} complexity, custom logic detected`);
        });
    }

    if (!dryRun && successful > 0) {
      console.log('\n🎉 Migration complete! Next steps:');
      console.log('   1. Review generated *-unified.tsx files');
      console.log('   2. Update imports in components');
      console.log('   3. Test each migrated section');
      console.log('   4. Remove backup files when satisfied');
    }
  }

  /**
   * Generate migration report
   */
  generateReport(): void {
    const report = {
      timestamp: new Date().toISOString(),
      totalSections: this.migrationPlans.length,
      byComplexity: {
        simple: this.migrationPlans.filter(p => p.complexity === 'simple').length,
        moderate: this.migrationPlans.filter(p => p.complexity === 'moderate').length,
        complex: this.migrationPlans.filter(p => p.complexity === 'complex').length,
      },
      byRisk: {
        low: this.migrationPlans.filter(p => p.riskLevel === 'low').length,
        medium: this.migrationPlans.filter(p => p.riskLevel === 'medium').length,
        high: this.migrationPlans.filter(p => p.riskLevel === 'high').length,
      },
      estimatedSavings: {
        linesOfCode: this.migrationPlans.reduce((sum, p) => {
          // Estimate 60% code reduction from unified architecture
          const contextLines = fs.existsSync(p.currentFile) 
            ? fs.readFileSync(p.currentFile, 'utf8').split('\n').length 
            : 200;
          return sum + (contextLines * 0.6);
        }, 0),
        maintenanceHours: this.migrationPlans.length * 2, // 2 hours saved per section
        bundleSizeKB: this.migrationPlans.length * 5 // 5KB saved per section
      },
      sections: this.migrationPlans
    };

    const reportPath = path.join(this.projectRoot, 'migration-analysis.json');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    
    console.log(`📄 Detailed migration report saved to: ${reportPath}`);
  }
}

// CLI Interface
const main = async () => {
  const args = process.argv.slice(2);
  const dryRun = !args.includes('--execute');

  const migrator = new MassSectionMigrator();
  
  console.log('🔍 Analyzing sections architecture...');
  await migrator.analyzeSections();
  
  migrator.generateReport();
  await migrator.executeMigration(dryRun);
  
  if (dryRun) {
    console.log('\n💡 This was a dry run. Use --execute flag to perform actual migration.');
  }
};

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}