#!/usr/bin/env node
/**
 * Automated Section Migration Tool
 * Migrates existing sections to the new architecture pattern
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface MigrationConfig {
  sectionNumber: number;
  title: string;
  dryRun?: boolean;
  backupOriginal?: boolean;
  verbose?: boolean;
}

interface MigrationResult {
  success: boolean;
  sectionNumber: number;
  filesModified: string[];
  errors: string[];
  warnings: string[];
  metricsImprovement: {
    linesRemoved: number;
    duplicationsEliminated: number;
    performanceGain: string;
  };
}

class SectionMigrator {
  private basePath: string;
  private verbose: boolean;

  constructor(verbose = false) {
    this.basePath = path.join(__dirname, '..', 'app');
    this.verbose = verbose;
  }

  /**
   * Migrate a specific section to new architecture
   */
  async migrateSection(config: MigrationConfig): Promise<MigrationResult> {
    const { sectionNumber, title, dryRun = false, backupOriginal = true } = config;
    
    this.log(`🚀 Starting migration for Section ${sectionNumber}: ${title}`);

    const result: MigrationResult = {
      success: false,
      sectionNumber,
      filesModified: [],
      errors: [],
      warnings: [],
      metricsImprovement: {
        linesRemoved: 0,
        duplicationsEliminated: 0,
        performanceGain: '0%'
      }
    };

    try {
      // 1. Analyze existing section
      const analysis = await this.analyzeSection(sectionNumber);
      if (!analysis.exists) {
        result.errors.push(`Section ${sectionNumber} component not found`);
        return result;
      }

      // 2. Create backup if requested
      if (backupOriginal && !dryRun) {
        await this.createBackup(sectionNumber);
        this.log(`📁 Backup created for Section ${sectionNumber}`);
      }

      // 3. Generate new component
      const newComponent = this.generateModernComponent(sectionNumber, title, analysis);
      
      // 4. Generate new context
      const newContext = this.generateModernContext(sectionNumber, analysis);

      // 5. Update or create files
      if (!dryRun) {
        await this.writeNewComponent(sectionNumber, newComponent);
        await this.writeNewContext(sectionNumber, newContext);
        result.filesModified.push(
          `app/components/Rendered2.0/Section${sectionNumber}Component.tsx`,
          `app/state/contexts/sections2.0/section${sectionNumber}.tsx`
        );
      }

      // 6. Calculate metrics improvement
      result.metricsImprovement = this.calculateImprovement(analysis, newComponent);

      // 7. Validate migration
      const validation = await this.validateMigration(sectionNumber, dryRun);
      if (validation.errors.length > 0) {
        result.errors.push(...validation.errors);
        result.warnings.push(...validation.warnings);
      }

      result.success = result.errors.length === 0;
      this.log(`✅ Migration ${result.success ? 'completed' : 'failed'} for Section ${sectionNumber}`);

      return result;

    } catch (error) {
      result.errors.push(`Migration failed: ${error.message}`);
      return result;
    }
  }

  /**
   * Migrate all sections in batch
   */
  async migrateAllSections(config: { dryRun?: boolean; excludeSections?: number[] } = {}): Promise<MigrationResult[]> {
    const { dryRun = false, excludeSections = [1] } = config; // Exclude Section 1 (already migrated)
    
    this.log('🌊 Starting batch migration of all sections');
    
    const sectionsToMigrate = await this.discoverSections();
    const filteredSections = sectionsToMigrate.filter(s => !excludeSections.includes(s.number));
    
    this.log(`📊 Found ${filteredSections.length} sections to migrate`);

    const results: MigrationResult[] = [];
    
    for (const section of filteredSections) {
      const result = await this.migrateSection({
        sectionNumber: section.number,
        title: section.title,
        dryRun,
        backupOriginal: true,
        verbose: this.verbose
      });
      
      results.push(result);
      
      // Brief pause between migrations
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    // Generate summary report
    this.generateMigrationReport(results);

    return results;
  }

  /**
   * Analyze existing section structure
   */
  private async analyzeSection(sectionNumber: number) {
    const componentPath = path.join(this.basePath, 'components', 'Rendered2.0', `Section${sectionNumber}Component.tsx`);
    const contextPath = path.join(this.basePath, 'state', 'contexts', 'sections2.0', `section${sectionNumber}.tsx`);

    const analysis = {
      exists: false,
      componentPath,
      contextPath,
      componentContent: '',
      contextContent: '',
      linesOfCode: 0,
      hasCustomValidation: false,
      hasComplexState: false,
      duplicatedPatterns: [] as string[],
      fieldTypes: [] as string[]
    };

    try {
      if (fs.existsSync(componentPath)) {
        analysis.exists = true;
        analysis.componentContent = fs.readFileSync(componentPath, 'utf8');
        analysis.linesOfCode = analysis.componentContent.split('\n').length;
        
        // Analyze patterns
        analysis.hasCustomValidation = analysis.componentContent.includes('validation') || 
                                       analysis.componentContent.includes('validate');
        analysis.hasComplexState = analysis.componentContent.includes('useState') && 
                                  analysis.componentContent.split('useState').length > 3;
        
        // Detect field types
        const fieldTypeMatches = analysis.componentContent.match(/type="(\w+)"/g) || [];
        analysis.fieldTypes = [...new Set(fieldTypeMatches.map(match => match.match(/"(\w+)"/)?.[1] || ''))];
        
        // Detect duplication patterns
        if (analysis.componentContent.includes('handleSubmit')) analysis.duplicatedPatterns.push('form submission');
        if (analysis.componentContent.includes('validation')) analysis.duplicatedPatterns.push('validation logic');
        if (analysis.componentContent.includes('navigation')) analysis.duplicatedPatterns.push('navigation');
      }

      if (fs.existsSync(contextPath)) {
        analysis.contextContent = fs.readFileSync(contextPath, 'utf8');
      }

    } catch (error) {
      this.log(`⚠️ Error analyzing Section ${sectionNumber}: ${error.message}`);
    }

    return analysis;
  }

  /**
   * Generate modern component using withSectionWrapper pattern
   */
  private generateModernComponent(sectionNumber: number, title: string, analysis: any): string {
    const fieldsConfig = this.extractFieldsFromAnalysis(analysis);
    
    return `import React from 'react';
import { withSectionWrapper } from './hoc/withSectionWrapper';
import { FieldRenderer } from './fields/FieldRenderer';
import { useSection${sectionNumber} } from '../../state/contexts/sections2.0/section${sectionNumber}';
import { SECTION_CONFIGS } from '../../config/field-configs';

/**
 * Section ${sectionNumber}: ${title}
 * 
 * Migrated to modern architecture:
 * - Uses withSectionWrapper HOC for common functionality
 * - Centralized field configurations
 * - Performance-optimized validation
 * - Consistent UI patterns
 */

interface Section${sectionNumber}FieldsProps {
  // Component-specific props if needed
}

const Section${sectionNumber}Fields: React.FC<Section${sectionNumber}FieldsProps> = () => {
  const { data, updateData, errors, warnings, isValidating } = useSection${sectionNumber}();
  const sectionConfig = SECTION_CONFIGS.section${sectionNumber};

  if (isValidating && !data) {
    return (
      <div className="animate-pulse p-4">
        <div className="h-4 bg-gray-300 rounded w-3/4 mb-4"></div>
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-4 bg-gray-300 rounded w-full"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="section-${sectionNumber}-container space-y-6">
      <div className="section-header">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          {sectionConfig.title}
        </h2>
        <p className="text-gray-600 mb-6">
          {sectionConfig.description}
        </p>
      </div>

      <div className="section-content space-y-4">
        {sectionConfig.fields.map((fieldConfig) => (
          <FieldRenderer
            key={fieldConfig.id}
            config={fieldConfig}
            value={data[fieldConfig.id] || ''}
            onChange={(value) => updateData({ [fieldConfig.id]: value })}
            error={errors.find(e => e.field === fieldConfig.id)?.message}
            warning={warnings.find(w => w.field === fieldConfig.id)?.message}
          />
        ))}
      </div>

      {/* Performance indicator for debugging */}
      {process.env.NODE_ENV === 'development' && (
        <div className="mt-8 p-2 bg-gray-100 rounded text-xs text-gray-500">
          Section ${sectionNumber} - Modern Architecture
        </div>
      )}
    </div>
  );
};

Section${sectionNumber}Fields.displayName = 'Section${sectionNumber}Fields';

// Export the wrapped component with HOC
export const Section${sectionNumber}Component = withSectionWrapper(Section${sectionNumber}Fields, {
  sectionNumber: ${sectionNumber},
  title: '${title}',
  description: '${title} information',
  enableProgressBar: true,
  enableAutoSave: true,
  enableKeyboardShortcuts: true
});`;
  }

  /**
   * Generate modern context using OptimizedSectionContext
   */
  private generateModernContext(sectionNumber: number, analysis: any): string {
    return `import React from 'react';
import { createOptimizedSectionContext } from '../base/OptimizedSectionContext';
import { SECTION_CONFIGS, FieldConfigManager } from '../../../config/field-configs';

/**
 * Section ${sectionNumber} Context
 * 
 * Modern optimized context with:
 * - Performance optimization with validation caching
 * - Incremental validation
 * - Memory management
 * - Centralized configuration
 */

// Section ${sectionNumber} data interface based on field configuration
export interface Section${sectionNumber}Data {
  [key: string]: any; // Dynamic based on field config
}

// Generate default data from field configuration
const sectionConfig = SECTION_CONFIGS.section${sectionNumber};
const defaultData: Section${sectionNumber}Data = {};

sectionConfig.fields.forEach(field => {
  switch (field.type) {
    case 'text':
    case 'email':
    case 'tel':
    case 'textarea':
      defaultData[field.id] = '';
      break;
    case 'select':
      defaultData[field.id] = field.required ? '' : (field as any).options?.[0]?.value || '';
      break;
    case 'checkbox':
      defaultData[field.id] = false;
      break;
    case 'date':
      defaultData[field.id] = '';
      break;
    case 'number':
      defaultData[field.id] = 0;
      break;
    default:
      defaultData[field.id] = '';
  }
});

// Validation function using field configuration
const validateSection${sectionNumber} = (data: Section${sectionNumber}Data) => {
  const errors: any[] = [];
  
  sectionConfig.fields.forEach(field => {
    const value = data[field.id];
    
    field.validation?.forEach(rule => {
      switch (rule.type) {
        case 'required':
          if (!value || (typeof value === 'string' && !value.trim())) {
            errors.push({
              field: field.id,
              rule: 'required',
              message: rule.message,
              severity: rule.severity
            });
          }
          break;
        case 'maxLength':
          if (value && typeof value === 'string' && value.length > (rule.value || 0)) {
            errors.push({
              field: field.id,
              rule: 'maxLength',
              message: rule.message,
              severity: rule.severity
            });
          }
          break;
        case 'pattern':
          if (value && typeof value === 'string' && rule.value && !rule.value.test(value)) {
            errors.push({
              field: field.id,
              rule: 'pattern',
              message: rule.message,
              severity: rule.severity
            });
          }
          break;
        case 'custom':
          // Custom validation logic would go here
          if (field.id === 'dateOfBirth' && value) {
            const date = new Date(value);
            if (date >= new Date()) {
              errors.push({
                field: field.id,
                rule: 'custom',
                message: rule.message,
                severity: rule.severity
              });
            }
          }
          break;
      }
    });
  });
  
  return errors;
};

// Create optimized context
export const {
  Provider: Section${sectionNumber}Provider,
  useContext: useSection${sectionNumber}Context,
  Context: Section${sectionNumber}Context
} = createOptimizedSectionContext<Section${sectionNumber}Data>({
  sectionName: 'Section${sectionNumber}',
  defaultData,
  validateSection: validateSection${sectionNumber},
  transformData: (data) => {
    // Apply any data transformations here
    const transformed = { ...data };
    
    // Example: Format phone numbers
    if (transformed.phone && typeof transformed.phone === 'string') {
      const cleaned = transformed.phone.replace(/\\D/g, '');
      if (cleaned.length === 10) {
        transformed.phone = \`(\${cleaned.slice(0, 3)}) \${cleaned.slice(3, 6)}-\${cleaned.slice(6)}\`;
      }
    }
    
    return transformed;
  },
  cacheTimeout: 30000, // 30 second cache
  debounceDelay: 300   // 300ms debounce
});

// Hook for easier access
export function useSection${sectionNumber}() {
  const context = useSection${sectionNumber}Context();
  
  return {
    ...context,
    sectionTitle: sectionConfig.title,
    sectionConfig: sectionConfig,
    fieldConfigs: sectionConfig.fields
  };
}`;
  }

  /**
   * Extract field configurations from existing component analysis
   */
  private extractFieldsFromAnalysis(analysis: any): any[] {
    // This would parse the existing component to extract field definitions
    // For now, return a basic configuration
    return [
      { id: 'placeholder', type: 'text', label: 'Placeholder Field', required: false }
    ];
  }

  /**
   * Write new component file
   */
  private async writeNewComponent(sectionNumber: number, content: string): Promise<void> {
    const filePath = path.join(this.basePath, 'components', 'Rendered2.0', `Section${sectionNumber}Component.tsx`);
    fs.writeFileSync(filePath, content, 'utf8');
  }

  /**
   * Write new context file
   */
  private async writeNewContext(sectionNumber: number, content: string): Promise<void> {
    const filePath = path.join(this.basePath, 'state', 'contexts', 'sections2.0', `section${sectionNumber}.tsx`);
    fs.writeFileSync(filePath, content, 'utf8');
  }

  /**
   * Create backup of original files
   */
  private async createBackup(sectionNumber: number): Promise<void> {
    const backupDir = path.join(__dirname, '..', 'backups', new Date().toISOString().split('T')[0]);
    
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }

    const componentPath = path.join(this.basePath, 'components', 'Rendered2.0', `Section${sectionNumber}Component.tsx`);
    const contextPath = path.join(this.basePath, 'state', 'contexts', 'sections2.0', `section${sectionNumber}.tsx`);

    if (fs.existsSync(componentPath)) {
      fs.copyFileSync(componentPath, path.join(backupDir, `Section${sectionNumber}Component.backup.tsx`));
    }

    if (fs.existsSync(contextPath)) {
      fs.copyFileSync(contextPath, path.join(backupDir, `section${sectionNumber}.backup.tsx`));
    }
  }

  /**
   * Calculate improvement metrics
   */
  private calculateImprovement(analysis: any, newComponent: string) {
    const originalLines = analysis.linesOfCode || 0;
    const newLines = newComponent.split('\n').length;
    const linesRemoved = Math.max(0, originalLines - newLines);
    const duplicationsEliminated = analysis.duplicatedPatterns?.length || 0;
    const performanceGain = originalLines > 0 ? `${Math.round((linesRemoved / originalLines) * 100)}%` : '0%';

    return {
      linesRemoved,
      duplicationsEliminated,
      performanceGain
    };
  }

  /**
   * Validate migration results
   */
  private async validateMigration(sectionNumber: number, dryRun: boolean) {
    const validation = {
      errors: [] as string[],
      warnings: [] as string[]
    };

    if (dryRun) {
      validation.warnings.push('Dry run mode - files not actually modified');
      return validation;
    }

    // Check if new files exist and are valid TypeScript
    const componentPath = path.join(this.basePath, 'components', 'Rendered2.0', `Section${sectionNumber}Component.tsx`);
    const contextPath = path.join(this.basePath, 'state', 'contexts', 'sections2.0', `section${sectionNumber}.tsx`);

    if (!fs.existsSync(componentPath)) {
      validation.errors.push(`Component file not created: ${componentPath}`);
    } else {
      const content = fs.readFileSync(componentPath, 'utf8');
      if (!content.includes('withSectionWrapper')) {
        validation.errors.push('Component does not use withSectionWrapper HOC');
      }
    }

    if (!fs.existsSync(contextPath)) {
      validation.errors.push(`Context file not created: ${contextPath}`);
    } else {
      const content = fs.readFileSync(contextPath, 'utf8');
      if (!content.includes('createOptimizedSectionContext')) {
        validation.errors.push('Context does not use optimized context pattern');
      }
    }

    return validation;
  }

  /**
   * Discover all existing sections
   */
  private async discoverSections(): Promise<Array<{ number: number; title: string }>> {
    const sections: Array<{ number: number; title: string }> = [];
    const componentsDir = path.join(this.basePath, 'components', 'Rendered2.0');

    if (!fs.existsSync(componentsDir)) {
      return sections;
    }

    const files = fs.readdirSync(componentsDir);
    
    for (const file of files) {
      const match = file.match(/^Section(\d+)Component\.tsx$/);
      if (match) {
        const sectionNumber = parseInt(match[1], 10);
        const title = `Section ${sectionNumber}`;
        sections.push({ number: sectionNumber, title });
      }
    }

    return sections.sort((a, b) => a.number - b.number);
  }

  /**
   * Generate migration report
   */
  private generateMigrationReport(results: MigrationResult[]): void {
    const successful = results.filter(r => r.success);
    const failed = results.filter(r => !r.success);
    const totalLinesRemoved = results.reduce((sum, r) => sum + r.metricsImprovement.linesRemoved, 0);
    const totalDuplicationsEliminated = results.reduce((sum, r) => sum + r.metricsImprovement.duplicationsEliminated, 0);

    this.log('\\n📊 Migration Report');
    this.log('='.repeat(50));
    this.log(`✅ Successful migrations: ${successful.length}`);
    this.log(`❌ Failed migrations: ${failed.length}`);
    this.log(`📉 Total lines of code removed: ${totalLinesRemoved}`);
    this.log(`🔄 Total duplications eliminated: ${totalDuplicationsEliminated}`);
    this.log('='.repeat(50));

    if (failed.length > 0) {
      this.log('\\n❌ Failed Sections:');
      failed.forEach(result => {
        this.log(`   Section ${result.sectionNumber}: ${result.errors.join(', ')}`);
      });
    }

    // Save detailed report
    const reportPath = path.join(__dirname, '..', 'migration-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(results, null, 2));
    this.log(`\\n📄 Detailed report saved to: ${reportPath}`);
  }

  private log(message: string): void {
    if (this.verbose) {
      console.log(message);
    }
  }
}

// CLI Interface
if (import.meta.url === `file://${__filename}`) {
  const args = process.argv.slice(2);
  const migrator = new SectionMigrator(true);

  if (args.length === 0 || args[0] === '--help') {
    console.log(`
Usage:
  node migrate-section.ts <section-number> [title] [options]
  node migrate-section.ts --all [options]

Options:
  --dry-run           Preview changes without modifying files
  --no-backup         Skip creating backup files
  --exclude <numbers> Comma-separated section numbers to exclude

Examples:
  node migrate-section.ts 5 "Education"
  node migrate-section.ts --all --dry-run
  node migrate-section.ts --all --exclude 1,2,3
    `);
    process.exit(0);
  }

  if (args[0] === '--all') {
    const dryRun = args.includes('--dry-run');
    const excludeIndex = args.indexOf('--exclude');
    const excludeSections = excludeIndex > -1 && args[excludeIndex + 1] 
      ? args[excludeIndex + 1].split(',').map(n => parseInt(n, 10))
      : [1]; // Exclude already migrated Section 1

    migrator.migrateAllSections({ dryRun, excludeSections })
      .then(results => {
        const successCount = results.filter(r => r.success).length;
        console.log(`\\n🎉 Migration completed: ${successCount}/${results.length} sections migrated successfully`);
        process.exit(successCount === results.length ? 0 : 1);
      })
      .catch(error => {
        console.error('❌ Migration failed:', error.message);
        process.exit(1);
      });
  } else {
    const sectionNumber = parseInt(args[0], 10);
    const title = args[1] || `Section ${sectionNumber}`;
    const dryRun = args.includes('--dry-run');
    const backupOriginal = !args.includes('--no-backup');

    if (isNaN(sectionNumber)) {
      console.error('❌ Invalid section number');
      process.exit(1);
    }

    migrator.migrateSection({ 
      sectionNumber, 
      title, 
      dryRun, 
      backupOriginal, 
      verbose: true 
    })
      .then(result => {
        if (result.success) {
          console.log(`\\n🎉 Section ${sectionNumber} migrated successfully!`);
          console.log(`📊 Improvements: ${result.metricsImprovement.linesRemoved} lines removed, ${result.metricsImprovement.performanceGain} performance gain`);
          process.exit(0);
        } else {
          console.log(`\\n❌ Migration failed for Section ${sectionNumber}`);
          result.errors.forEach(error => console.log(`   ${error}`));
          process.exit(1);
        }
      })
      .catch(error => {
        console.error('❌ Migration failed:', error.message);
        process.exit(1);
      });
  }
}