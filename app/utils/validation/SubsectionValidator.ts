/**
 * SubsectionValidator.ts
 * 
 * A utility for validating subsection mapping across the application.
 * This helps ensure no subsections are orphaned or improperly mapped.
 */

import { type FieldHierarchy, type SubsectionInfo, type FieldMetadata, type SectionMetadata } from '../../../api/interfaces/FieldMetadata';
import { FormEntryManager } from '../forms/FormEntryManager';
import { get, has } from 'lodash';

// Type definitions for validation results
export type ValidationIssue = {
  level: 'warning' | 'error';
  message: string;
  subsectionId?: string;
  parentSection?: string;
  fieldCount?: number;
  suggestion?: string;
};

export type SubsectionValidationReport = {
  timestamp: string;
  totalSubsections: number;
  mappedSubsections: number;
  unmappedSubsections: number;
  orphanedSubsections: number;
  issues: ValidationIssue[];
  sectionSummary: {
    [sectionId: string]: {
      total: number;
      mapped: number;
      unmapped: number;
    }
  };
  subsectionDetails: {
    [subsectionId: string]: {
      parentSection: string;
      entriesPath: string;
      fieldCount: number;
      isMapped: boolean;
      isOrphaned: boolean;
      issues: string[];
    }
  };
};

export class SubsectionValidator {
  private fieldHierarchy: FieldHierarchy | null = null;
  private contextData: any = null;
  private knownSubsections: Map<string, {
    parentSection: string;
    entriesPath: string;
    hasFlag?: string;
  }> = new Map();
  
  /**
   * Initialize the validator with field hierarchy and context data
   * 
   * @param fieldHierarchy The field hierarchy data from the PDF
   * @param contextData The application context data
   */
  constructor(fieldHierarchy: FieldHierarchy | null = null, contextData: any = null) {
    this.fieldHierarchy = fieldHierarchy;
    this.contextData = contextData;
    this.initializeKnownSubsections();
  }
  
  /**
   * Set or update the field hierarchy
   * 
   * @param fieldHierarchy The field hierarchy data from the PDF
   */
  setFieldHierarchy(fieldHierarchy: FieldHierarchy): void {
    this.fieldHierarchy = fieldHierarchy;
  }
  
  /**
   * Set or update the context data
   * 
   * @param contextData The application context data
   */
  setContextData(contextData: any): void {
    this.contextData = contextData;
  }
  
  /**
   * Initialize the known subsections from the FormEntryManager configuration
   */
  private initializeKnownSubsections(): void {
    // Get subsection configurations from FormEntryManager
    const subsectionConfigs = FormEntryManager.getSubsectionConfigs();
    
    // Initialize the map of known subsections
    subsectionConfigs.forEach(config => {
      this.knownSubsections.set(config.subsectionId, {
        parentSection: config.parentSectionPath,
        entriesPath: config.entriesPath,
        hasFlag: config.hasFlag
      });
    });
  }
  
  /**
   * Check if a subsection is properly mapped in the context
   * 
   * @param subsectionId The subsection ID (e.g., "9.1")
   * @returns Whether the subsection is mapped and accessible
   */
  private isSubsectionMapped(subsectionId: string): boolean {
    if (!this.contextData) return false;
    
    const config = this.knownSubsections.get(subsectionId);
    if (!config) return false;
    
    // Check if the parent section exists
    if (!has(this.contextData, config.parentSection)) {
      return false;
    }
    
    // Check if the subsection entries path exists
    const entriesPathParts = config.entriesPath.split('.');
    const entriesPath = entriesPathParts.slice(0, -1).join('.');
    
    return has(this.contextData, entriesPath);
  }
  
  /**
   * Check if a subsection is orphaned (has no fields mapped to it)
   * 
   * @param subsectionId The subsection ID (e.g., "9.1")
   * @returns Whether the subsection is orphaned
   */
  private isSubsectionOrphaned(subsectionId: string): boolean {
    if (!this.fieldHierarchy) return true;
    
    // Parse the subsection ID
    const [sectionNumStr, subsectionNumStr] = subsectionId.split('.');
    const sectionNum = Number(sectionNumStr);
    const subsectionNum = Number(subsectionNumStr);
    
    // Get section data from the hierarchy
    const formKeys = Object.keys(this.fieldHierarchy);
    if (formKeys.length === 0) return true;
    
    // Look through each form for this section
    let sectionFields: FieldMetadata[] = [];
    for (const formKey of formKeys) {
      const form = this.fieldHierarchy[formKey];
      if (form && form.fields) {
        // Filter fields that belong to this section
        const fieldsInSection = form.fields.filter(field => field.section === sectionNum);
        sectionFields = [...sectionFields, ...fieldsInSection];
      }
    }
    
    if (sectionFields.length === 0) return true;
    
    // Count fields that belong to this subsection
    const subsectionFields = sectionFields.filter(field => {
      // Check for subsection info
      if (field.subsection !== undefined) {
        return field.subsection === subsectionNum;
      }
      
      // Check field name for subsection pattern (e.g., contains '_9.1_')
      const subsectionPattern = `_${sectionNum}.${subsectionNum}_`;
      if (field.name && field.name.includes(subsectionPattern)) {
        return true;
      }
      
      // Check if field label indicates subsection
      if (field.label) {
        const labelLower = field.label.toLowerCase();
        // Check for common subsection label patterns
        const subsectionLabelPatterns = [
          `section ${sectionNum}.${subsectionNum}`,
          `subsection ${subsectionNum}`,
          `${sectionNum}.${subsectionNum}:`
        ];
        return subsectionLabelPatterns.some(pattern => labelLower.includes(pattern));
      }
      
      return false;
    });
    
    // The subsection is orphaned if no fields are mapped to it
    return subsectionFields.length === 0;
  }
  
  /**
   * Count the number of fields mapped to a subsection
   * 
   * @param subsectionId The subsection ID (e.g., "9.1")
   * @returns The number of fields mapped to the subsection
   */
  private countSubsectionFields(subsectionId: string): number {
    if (!this.fieldHierarchy) return 0;
    
    // Parse the subsection ID
    const [sectionNumStr, subsectionNumStr] = subsectionId.split('.');
    const sectionNum = Number(sectionNumStr);
    const subsectionNum = Number(subsectionNumStr);
    
    // Get section data from the hierarchy
    const formKeys = Object.keys(this.fieldHierarchy);
    if (formKeys.length === 0) return 0;
    
    // Look through each form for this section
    let sectionFields: FieldMetadata[] = [];
    for (const formKey of formKeys) {
      const form = this.fieldHierarchy[formKey];
      if (form && form.fields) {
        // Filter fields that belong to this section
        const fieldsInSection = form.fields.filter(field => field.section === sectionNum);
        sectionFields = [...sectionFields, ...fieldsInSection];
      }
    }
    
    if (sectionFields.length === 0) return 0;
    
    // Count fields that belong to this subsection
    const subsectionFields = sectionFields.filter(field => {
      // Check for subsection info
      if (field.subsection !== undefined) {
        return field.subsection === subsectionNum;
      }
      
      // Check field name for subsection pattern (e.g., contains '_9.1_')
      const subsectionPattern = `_${sectionNum}.${subsectionNum}_`;
      if (field.name && field.name.includes(subsectionPattern)) {
        return true;
      }
      
      // Check if field label indicates subsection
      if (field.label) {
        const labelLower = field.label.toLowerCase();
        // Check for common subsection label patterns
        const subsectionLabelPatterns = [
          `section ${sectionNum}.${subsectionNum}`,
          `subsection ${subsectionNum}`,
          `${sectionNum}.${subsectionNum}:`
        ];
        return subsectionLabelPatterns.some(pattern => labelLower.includes(pattern));
      }
      
      return false;
    });
    
    return subsectionFields.length;
  }
  
  /**
   * Generate a comprehensive validation report for all subsections
   * 
   * @returns The validation report
   */
  validateAllSubsections(): SubsectionValidationReport {
    const report: SubsectionValidationReport = {
      timestamp: new Date().toISOString(),
      totalSubsections: 0,
      mappedSubsections: 0,
      unmappedSubsections: 0,
      orphanedSubsections: 0,
      issues: [],
      sectionSummary: {},
      subsectionDetails: {}
    };
    
    // Initialize section summary
    const sectionIds = Array.from(new Set(
      Array.from(this.knownSubsections.keys()).map(id => id.split('.')[0])
    ));
    
    sectionIds.forEach(sectionId => {
      report.sectionSummary[sectionId] = {
        total: 0,
        mapped: 0,
        unmapped: 0
      };
    });
    
    // Process each known subsection
    this.knownSubsections.forEach((config, subsectionId) => {
      // Update total count
      report.totalSubsections++;
      
      // Get section ID
      const sectionId = subsectionId.split('.')[0];
      report.sectionSummary[sectionId].total++;
      
      // Check if subsection is mapped in the context
      const isMapped = this.isSubsectionMapped(subsectionId);
      if (isMapped) {
        report.mappedSubsections++;
        report.sectionSummary[sectionId].mapped++;
      } else {
        report.unmappedSubsections++;
        report.sectionSummary[sectionId].unmapped++;
        
        // Add issue for unmapped subsection
        report.issues.push({
          level: 'warning',
          message: `Subsection ${subsectionId} is not mapped in the context`,
          subsectionId,
          parentSection: config.parentSection,
          suggestion: `Ensure a component and context mapping exists for subsection ${subsectionId}`
        });
      }
      
      // Check if subsection is orphaned (no fields mapped to it)
      const isOrphaned = this.isSubsectionOrphaned(subsectionId);
      if (isOrphaned) {
        report.orphanedSubsections++;
        
        // Add issue for orphaned subsection
        report.issues.push({
          level: 'error',
          message: `Subsection ${subsectionId} is orphaned (no fields mapped to it)`,
          subsectionId,
          parentSection: config.parentSection,
          suggestion: `Review field-hierarchy.json to ensure fields are properly mapped to subsection ${subsectionId}`
        });
      }
      
      // Count fields mapped to this subsection
      const fieldCount = this.countSubsectionFields(subsectionId);
      
      // Add to subsection details
      report.subsectionDetails[subsectionId] = {
        parentSection: config.parentSection,
        entriesPath: config.entriesPath,
        fieldCount,
        isMapped,
        isOrphaned,
        issues: []
      };
      
      // Add specific issues for this subsection
      if (!isMapped) {
        report.subsectionDetails[subsectionId].issues.push(
          `Not mapped in context`
        );
      }
      
      if (isOrphaned) {
        report.subsectionDetails[subsectionId].issues.push(
          `No fields mapped to this subsection`
        );
      }
      
      if (fieldCount === 0) {
        report.subsectionDetails[subsectionId].issues.push(
          `No fields found for this subsection`
        );
      } else if (fieldCount < 3) {
        report.subsectionDetails[subsectionId].issues.push(
          `Low field count (${fieldCount}), may be incomplete`
        );
      }
    });
    
    return report;
  }
  
  /**
   * Generate a report for a specific section's subsections
   * 
   * @param sectionId The section ID (e.g., "9")
   * @returns The validation report for this section
   */
  validateSectionSubsections(sectionId: string): SubsectionValidationReport {
    const fullReport = this.validateAllSubsections();
    const sectionReport: SubsectionValidationReport = {
      timestamp: fullReport.timestamp,
      totalSubsections: 0,
      mappedSubsections: 0,
      unmappedSubsections: 0,
      orphanedSubsections: 0,
      issues: [],
      sectionSummary: {},
      subsectionDetails: {}
    };
    
    // Initialize section summary
    sectionReport.sectionSummary[sectionId] = fullReport.sectionSummary[sectionId] || {
      total: 0,
      mapped: 0,
      unmapped: 0
    };
    
    // Filter subsection details and issues for this section
    Object.entries(fullReport.subsectionDetails).forEach(([subsectionId, details]) => {
      if (subsectionId.startsWith(`${sectionId}.`)) {
        sectionReport.totalSubsections++;
        if (details.isMapped) {
          sectionReport.mappedSubsections++;
        } else {
          sectionReport.unmappedSubsections++;
        }
        if (details.isOrphaned) {
          sectionReport.orphanedSubsections++;
        }
        
        sectionReport.subsectionDetails[subsectionId] = details;
      }
    });
    
    // Filter issues for this section
    sectionReport.issues = fullReport.issues.filter(issue => 
      issue.subsectionId && issue.subsectionId.startsWith(`${sectionId}.`)
    );
    
    return sectionReport;
  }
  
  /**
   * Generate a simple report of issues as an array of message strings
   * 
   * @returns Array of issue messages
   */
  getIssuesSummary(): string[] {
    const report = this.validateAllSubsections();
    
    // Map issues to message strings
    return report.issues.map(issue => {
      const prefix = issue.level === 'error' ? '[ERROR]' : '[WARNING]';
      return `${prefix} ${issue.message}${issue.suggestion ? ` - ${issue.suggestion}` : ''}`;
    });
  }
  
  /**
   * Get specific suggestions for unmapped or orphaned subsections
   * 
   * @returns Array of suggestion strings
   */
  getSuggestions(): string[] {
    const report = this.validateAllSubsections();
    const suggestions: string[] = [];
    
    // Add general statistics
    suggestions.push(`Total Subsections: ${report.totalSubsections}`);
    suggestions.push(`Mapped: ${report.mappedSubsections} (${Math.round(report.mappedSubsections / report.totalSubsections * 100)}%)`);
    suggestions.push(`Unmapped: ${report.unmappedSubsections} (${Math.round(report.unmappedSubsections / report.totalSubsections * 100)}%)`);
    suggestions.push(`Orphaned: ${report.orphanedSubsections} (${Math.round(report.orphanedSubsections / report.totalSubsections * 100)}%)`);
    suggestions.push(``);
    
    // Add section-specific suggestions
    for (const [sectionId, summary] of Object.entries(report.sectionSummary)) {
      if (summary.unmapped > 0) {
        suggestions.push(`Section ${sectionId}: ${summary.unmapped} unmapped subsection(s)`);
        
        // Add specific subsection suggestions
        Object.entries(report.subsectionDetails)
          .filter(([subsectionId]) => subsectionId.startsWith(`${sectionId}.`))
          .filter(([, details]) => !details.isMapped || details.isOrphaned)
          .forEach(([subsectionId, details]) => {
            if (!details.isMapped) {
              suggestions.push(`  - Subsection ${subsectionId}: Add mapping in updatedModel.tsx`);
            }
            if (details.isOrphaned) {
              suggestions.push(`  - Subsection ${subsectionId}: No fields mapped, review field-hierarchy.json`);
            }
          });
      }
    }
    
    return suggestions;
  }
  
  /**
   * Format the validation report as markdown for documentation
   * 
   * @returns Markdown formatted report
   */
  generateMarkdownReport(): string {
    const report = this.validateAllSubsections();
    let markdown = `# Subsection Validation Report\n\n`;
    
    // Add timestamp
    markdown += `Generated: ${new Date(report.timestamp).toLocaleString()}\n\n`;
    
    // Add summary statistics
    markdown += `## Summary\n\n`;
    markdown += `- **Total Subsections**: ${report.totalSubsections}\n`;
    markdown += `- **Mapped**: ${report.mappedSubsections} (${Math.round(report.mappedSubsections / report.totalSubsections * 100)}%)\n`;
    markdown += `- **Unmapped**: ${report.unmappedSubsections} (${Math.round(report.unmappedSubsections / report.totalSubsections * 100)}%)\n`;
    markdown += `- **Orphaned**: ${report.orphanedSubsections} (${Math.round(report.orphanedSubsections / report.totalSubsections * 100)}%)\n\n`;
    
    // Add section summary table
    markdown += `## Section Summary\n\n`;
    markdown += `| Section | Total | Mapped | Unmapped | Coverage |\n`;
    markdown += `|---------|-------|--------|----------|----------|\n`;
    
    Object.entries(report.sectionSummary)
      .sort((a, b) => parseInt(a[0]) - parseInt(b[0]))
      .forEach(([sectionId, summary]) => {
        const coverage = Math.round(summary.mapped / summary.total * 100);
        markdown += `| ${sectionId} | ${summary.total} | ${summary.mapped} | ${summary.unmapped} | ${coverage}% |\n`;
      });
    
    markdown += `\n`;
    
    // Add issues section
    if (report.issues.length > 0) {
      markdown += `## Issues\n\n`;
      
      const errors = report.issues.filter(issue => issue.level === 'error');
      const warnings = report.issues.filter(issue => issue.level === 'warning');
      
      if (errors.length > 0) {
        markdown += `### Errors (${errors.length})\n\n`;
        errors.forEach(issue => {
          markdown += `- **${issue.subsectionId}**: ${issue.message}\n`;
          if (issue.suggestion) {
            markdown += `  - *Suggestion*: ${issue.suggestion}\n`;
          }
        });
        markdown += `\n`;
      }
      
      if (warnings.length > 0) {
        markdown += `### Warnings (${warnings.length})\n\n`;
        warnings.forEach(issue => {
          markdown += `- **${issue.subsectionId}**: ${issue.message}\n`;
          if (issue.suggestion) {
            markdown += `  - *Suggestion*: ${issue.suggestion}\n`;
          }
        });
        markdown += `\n`;
      }
    }
    
    // Add detailed subsection info
    markdown += `## Subsection Details\n\n`;
    
    // Group by section for readability
    const sectionIds = Array.from(new Set(
      Object.keys(report.subsectionDetails).map(id => id.split('.')[0])
    )).sort((a, b) => parseInt(a) - parseInt(b));
    
    sectionIds.forEach(sectionId => {
      markdown += `### Section ${sectionId}\n\n`;
      markdown += `| Subsection | Fields | Mapped | Orphaned | Issues |\n`;
      markdown += `|------------|--------|--------|----------|--------|\n`;
      
      // Get subsections for this section and sort them
      const subsections = Object.entries(report.subsectionDetails)
        .filter(([id]) => id.startsWith(`${sectionId}.`))
        .sort((a, b) => {
          const subA = parseFloat(a[0]);
          const subB = parseFloat(b[0]);
          return subA - subB;
        });
      
      subsections.forEach(([subsectionId, details]) => {
        const mappedStatus = details.isMapped ? '✅' : '❌';
        const orphanedStatus = details.isOrphaned ? '❌' : '✅';
        const issues = details.issues.join('; ');
        
        markdown += `| ${subsectionId} | ${details.fieldCount} | ${mappedStatus} | ${orphanedStatus} | ${issues} |\n`;
      });
      
      markdown += `\n`;
    });
    
    return markdown;
  }
}

/**
 * Create a subsection validator instance with the provided data
 * 
 * @param fieldHierarchy The field hierarchy data from the PDF
 * @param contextData The application context data
 * @returns A new SubsectionValidator instance
 */
export function createSubsectionValidator(
  fieldHierarchy: FieldHierarchy | null = null, 
  contextData: any = null
): SubsectionValidator {
  return new SubsectionValidator(fieldHierarchy, contextData);
} 