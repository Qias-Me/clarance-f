import type { SectionOutput } from '../types.js';

/**
 * Calculates confidence metrics for section categorization
 */
export class ConfidenceCalculator {
  /**
   * Calculates confidence metrics for all sections
   * @param sectionOutputs Map of section outputs
   * @returns Updated section outputs with confidence metrics
   */
  public calculateConfidence(sectionOutputs: Record<string, SectionOutput>): Record<string, SectionOutput> {
    const result = { ...sectionOutputs };
    
    for (const [section, output] of Object.entries(result)) {
      // Count total fields in this section
      let totalFields = 0;
      for (const subSection of Object.values(output.fields)) {
        totalFields += (subSection as any[]).length;
      }
      
      // Update total fields count
      output.meta.totalFields = totalFields;
      
      // Calculate confidence (avoid division by zero)
      if (totalFields > 0) {
        output.meta.confidence = output.meta.matchedFields / totalFields;
      } else {
        // Fail-safe: If no fields, set confidence to 1
        output.meta.confidence = 1;
      }
      
      // Update hasSubSections flag
      const subSections = Object.keys(output.fields).filter(s => s !== '_default');
      output.meta.hasSubSections = subSections.length > 0;
      
      // Calculate fields by subsection if not already defined
      if (!output.meta.fieldsBySubsection) {
        output.meta.fieldsBySubsection = {};
        for (const [subSectionKey, fields] of Object.entries(output.fields)) {
          output.meta.fieldsBySubsection[subSectionKey] = (fields as any[]).length;
        }
      }
    }
    
    return result;
  }
  
  /**
   * Calculates overall confidence across all sections
   * @param sectionOutputs Map of section outputs
   * @returns Overall confidence value (0-1)
   */
  public calculateOverallConfidence(sectionOutputs: Record<string, SectionOutput>): number {
    let totalFields = 0;
    let totalMatched = 0;
    
    for (const output of Object.values(sectionOutputs)) {
      totalFields += output.meta.totalFields;
      totalMatched += output.meta.matchedFields;
    }
    
    // Avoid division by zero
    return totalFields > 0 ? totalMatched / totalFields : 1;
  }
  
  /**
   * Generates a confidence report for all sections
   * @param sectionOutputs Map of section outputs
   * @returns Confidence report as a string
   */
  public generateConfidenceReport(sectionOutputs: Record<string, SectionOutput>): string {
    let report = 'Confidence Report:\n\n';
    report += '| Section | Fields | Matched | Confidence |\n';
    report += '|---------|--------|---------|------------|\n';
    
    let totalFields = 0;
    let totalMatched = 0;
    
    // Add row for each section
    for (let i = 1; i <= 30; i++) {
      const section = String(i);
      const output = sectionOutputs[section];
      
      if (!output) continue;
      
      const fields = output.meta.totalFields;
      const matched = output.meta.matchedFields;
      const confidence = output.meta.confidence;
      
      totalFields += fields;
      totalMatched += matched;
      
      report += `| ${section} | ${fields} | ${matched} | ${(confidence * 100).toFixed(2)}% |\n`;
    }
    
    // Add overall row
    const overallConfidence = totalFields > 0 ? totalMatched / totalFields : 1;
    report += '|---------|--------|---------|------------|\n';
    report += `| Overall | ${totalFields} | ${totalMatched} | ${(overallConfidence * 100).toFixed(2)}% |\n`;
    
    return report;
  }
  
  /**
   * Generates a more detailed confidence report with subsection information
   * @param sectionOutputs Map of section outputs
   * @returns Detailed confidence report as a string in markdown format
   */
  public generateAdvancedReport(sectionOutputs: Record<string, SectionOutput>): string {
    let report = '# Detailed Confidence Report\n\n';
    
    // Overall statistics
    let totalFields = 0;
    let totalMatched = 0;
    
    for (const output of Object.values(sectionOutputs)) {
      totalFields += output.meta.totalFields;
      totalMatched += output.meta.matchedFields;
    }
    
    const overallConfidence = totalFields > 0 ? totalMatched / totalFields : 1;
    
    report += '## Summary\n\n';
    report += `- **Total Fields**: ${totalFields}\n`;
    report += `- **Matched Fields**: ${totalMatched}\n`;
    report += `- **Overall Confidence**: ${(overallConfidence * 100).toFixed(2)}%\n\n`;
    
    report += '## Section Details\n\n';
    
    // Add details for each section
    for (let i = 1; i <= 30; i++) {
      const section = String(i);
      const output = sectionOutputs[section];
      
      if (!output) continue;
      
      const fields = output.meta.totalFields;
      const matched = output.meta.matchedFields;
      const confidence = output.meta.confidence;
      
      // Section header
      report += `### Section ${section}${output.meta.name ? ': ' + output.meta.name : ''}\n\n`;
      
      // Section metadata
      report += `- **Fields**: ${fields}\n`;
      report += `- **Matched**: ${matched}\n`;
      report += `- **Confidence**: ${(confidence * 100).toFixed(2)}%\n`;
      
      // Add page range if available
      if (output.meta.pageRange) {
        report += `- **Page Range**: ${output.meta.pageRange[0]} - ${output.meta.pageRange[1]}\n`;
      }
      
      // Add subsection details if available
      if (output.meta.hasSubSections && output.meta.fieldsBySubsection) {
        report += '\n#### Subsections\n\n';
        report += '| Subsection | Fields | Percentage |\n';
        report += '|------------|--------|------------|\n';
        
        for (const [subSection, count] of Object.entries(output.meta.fieldsBySubsection)) {
          const percentage = fields > 0 ? ((count as number) / fields * 100).toFixed(2) : '0.00';
          report += `| ${subSection} | ${count} | ${percentage}% |\n`;
        }
      }
      
      report += '\n';
    }
    
    return report;
  }
}

export const confidenceCalculator = new ConfidenceCalculator(); 