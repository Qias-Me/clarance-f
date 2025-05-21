/**
 * Rules Updater Module
 * 
 * This module analyzes the results of sectionizer runs and 
 * updates the classification rules to improve future categorization.
 */

import fs from 'fs';
import path from 'path';
import type { CategorizedField } from './extractFieldsBySection.js';
import { 
  sectionClassifications,
  getSectionPageRange
} from './fieldParsing.js';

interface SectionDeviation {
  section: number;
  actual: number;
  expected: number;
  deviation: number;
  percentage: number;
}

interface SectionFieldMapping {
  sectionId: number;
  fieldNames: string[];
  fieldPatterns: string[];
}

interface SectionRules {
  addPatterns: string[];
  removePatterns: string[];
}

/**
 * Updates rules based on section deviations
 * @param sectionFields Current categorized fields
 * @param referenceCounts Reference field counts
 * @param outputPath Path to save updated rules
 */
export async function updateRules(
  sectionFields: Record<string, CategorizedField[]>,
  referenceCounts: Record<number, number>,
  outputPath: string = 'section-data'
): Promise<{
  rulesUpdated: number;
  patternsAdded: number;
  improvementEstimate: number;
  correctedFields?: number;
}> {
  console.log('Analyzing section deviations to update rules...');
  
  // Calculate deviations
  const deviations: SectionDeviation[] = [];
  let totalDeviation = 0;
  
  for (const [sectionStr, expectedCount] of Object.entries(referenceCounts)) {
    const section = parseInt(sectionStr, 10);
    const actualCount = sectionFields[sectionStr]?.length || 0;
    const deviation = actualCount - expectedCount;
    const percentage = expectedCount > 0 ? Math.abs(deviation) / expectedCount * 100 : 0;
    
    if (Math.abs(deviation) > 0) {
      deviations.push({
        section,
        actual: actualCount,
        expected: expectedCount,
        deviation,
        percentage
      });
      
      totalDeviation += Math.abs(deviation);
    }
  }
  
  // Sort by absolute percentage deviation (descending)
  deviations.sort((a, b) => b.percentage - a.percentage);
  
  // Focus on the top problematic sections
  const problemSections = deviations
    .filter(d => d.percentage > 20 || Math.abs(d.deviation) > 10)
    .slice(0, 5);
  
  console.log(`Found ${problemSections.length} major problem sections to address`);
  
  // For sections with too many fields, analyze the fields to find patterns that can be moved elsewhere
  const rulesUpdates: Record<number, {
    addPatterns: string[];
    removePatterns: string[];
  }> = {};
  
  let patternsAdded = 0;
  
  // Process sections with too many fields (positive deviation)
  for (const deviation of problemSections.filter(d => d.deviation > 0)) {
    console.log(`Processing oversized section ${deviation.section}: ${deviation.actual} fields (expected ${deviation.expected}, +${deviation.deviation})`);
    
    const sectionStr = String(deviation.section);
    const sectionFieldsForSection = sectionFields[sectionStr] || [];
    
    // Sort by confidence (lowest first) to find potential misclassifications
    sectionFieldsForSection.sort((a: CategorizedField, b: CategorizedField) => a.confidence - b.confidence);
    
    // Take a sample of low-confidence fields that might be misclassified
    const potentialMisclassified = sectionFieldsForSection.slice(0, Math.min(30, Math.ceil(deviation.deviation * 0.2)));
    
    // Analyze field names for patterns
    const patterns = findCommonPatterns(potentialMisclassified.map((f: CategorizedField) => f.name));
    
    if (patterns.length > 0) {
      console.log(`Found ${patterns.length} potentially problematic patterns in section ${deviation.section}`);
      
      // Add patterns to be excluded from this section
      if (!rulesUpdates[deviation.section]) {
        rulesUpdates[deviation.section] = { addPatterns: [], removePatterns: [] };
      }
      
      rulesUpdates[deviation.section].removePatterns.push(...patterns);
      patternsAdded += patterns.length;
    }
  }
  
  // Process sections with too few fields (negative deviation)
  for (const deviation of problemSections.filter(d => d.deviation < 0)) {
    console.log(`Processing undersized section ${deviation.section}: ${deviation.actual} fields (expected ${deviation.expected}, ${deviation.deviation})`);
    
    // Look for fields that might belong to this section but are classified elsewhere
    // First check in section 0 (unknown)
    const unknownFields = sectionFields["0"] || [];
    
    // Find fields with names that suggest they belong to this section
    const sectionPattern = new RegExp(`section${deviation.section}|sect${deviation.section}`, 'i');
    const potentialMatches = unknownFields.filter((f: CategorizedField) => 
      sectionPattern.test(f.name) || 
      (f.label && sectionPattern.test(f.label))
    );
    
    if (potentialMatches.length > 0) {
      console.log(`Found ${potentialMatches.length} potential matches for section ${deviation.section} in unknown fields`);
      
      // Extract patterns from these fields
      const patterns = findCommonPatterns(potentialMatches.map((f: CategorizedField) => f.name));
      
      if (patterns.length > 0) {
        // Add patterns to be included in this section
        if (!rulesUpdates[deviation.section]) {
          rulesUpdates[deviation.section] = { addPatterns: [], removePatterns: [] };
        }
        
        rulesUpdates[deviation.section].addPatterns.push(...patterns);
        patternsAdded += patterns.length;
      }
    }
    
    // Also check in oversized sections for potential matches
    const oversizedSections = problemSections.filter(d => d.deviation > 0).map(d => d.section);
    for (const otherSection of oversizedSections) {
      const otherSectionStr = String(otherSection);
      const otherSectionFields = sectionFields[otherSectionStr] || [];
      
      // Find fields that might belong to this section but are classified elsewhere
      const potentialMisclassified = otherSectionFields.filter((f: CategorizedField) => 
        f.confidence < 0.85 && (
          sectionPattern.test(f.name) || 
          (f.label && sectionPattern.test(f.label))
        )
      );
      
      if (potentialMisclassified.length > 0) {
        console.log(`Found ${potentialMisclassified.length} potential matches for section ${deviation.section} in section ${otherSection}`);
        
        // Extract patterns from these fields
        const patterns = findCommonPatterns(potentialMisclassified.map((f: CategorizedField) => f.name));
        
        if (patterns.length > 0) {
          // Add patterns to be included in this section
          if (!rulesUpdates[deviation.section]) {
            rulesUpdates[deviation.section] = { addPatterns: [], removePatterns: [] };
          }
          
          rulesUpdates[deviation.section].addPatterns.push(...patterns);
          patternsAdded += patterns.length;
        }
      }
    }
  }
  
  // Save the updated rules
  const rulesOutputPath = path.join(outputPath, 'updated-section-rules.json');
  await fs.promises.writeFile(
    rulesOutputPath,
    JSON.stringify(rulesUpdates, null, 2)
  );
  
  // Apply rules immediately to correct fields for this run
  const correctedFields = applyRulesToFields(sectionFields, rulesUpdates);
  
  // Estimate improvement
  // This is a rough estimate - actual improvement depends on pattern effectiveness
  const improvementEstimate = Math.min(95, Math.round(patternsAdded * 2.5));
  
  console.log(`Updated rules saved to ${rulesOutputPath}`);
  console.log(`Added ${patternsAdded} new patterns across ${Object.keys(rulesUpdates).length} sections`);
  console.log(`Estimated alignment improvement: ${improvementEstimate}%`);
  
  return {
    rulesUpdated: Object.keys(rulesUpdates).length,
    patternsAdded,
    improvementEstimate,
    correctedFields
  };
}

/**
 * Apply the updated rules to the section fields
 * @param sectionFields Current section fields
 * @param rulesUpdates Updated rules
 * @returns Number of corrected fields
 */
function applyRulesToFields(
  sectionFields: Record<string, CategorizedField[]>,
  rulesUpdates: Record<number, SectionRules>
): number {
  let correctedFields = 0;
  
  // Create a new map to hold fields to be moved
  // Key format: 'from_section_to_section'
  const fieldsToMove: Record<string, CategorizedField[]> = {};
  
  // First pass: identify fields to remove from sections
  for (const [sectionStr, rules] of Object.entries(rulesUpdates)) {
    const section = parseInt(sectionStr);
    
    // Skip if no remove patterns defined
    if (!rules.removePatterns || rules.removePatterns.length === 0) {
      continue;
    }
    
    // Get fields for this section
    const fieldsInSection = sectionFields[sectionStr] || [];
    
    // Create RegExp objects for each pattern
    const removePatterns = rules.removePatterns.map(pattern => new RegExp(pattern));
    
    // Identify fields matching removal patterns
    const fieldsToRemove: CategorizedField[] = [];
    
    for (const field of fieldsInSection) {
      for (const pattern of removePatterns) {
        if (pattern.test(field.name)) {
          fieldsToRemove.push(field);
          break;
        }
      }
    }
    
    // Add these fields to section 0 (unknown) for now
    for (const field of fieldsToRemove) {
      const key = `from_${section}_to_0`;
      if (!fieldsToMove[key]) {
        fieldsToMove[key] = [];
      }
      fieldsToMove[key].push(field);
    }
  }
  
  // Second pass: identify fields to add to sections based on add patterns
  for (const [sectionStr, rules] of Object.entries(rulesUpdates)) {
    const targetSection = parseInt(sectionStr);
    
    // Skip if no add patterns defined
    if (!rules.addPatterns || rules.addPatterns.length === 0) {
      continue;
    }
    
    // Create RegExp objects for each pattern
    const addPatterns = rules.addPatterns.map(pattern => new RegExp(pattern));
    
    // Look in all sections (except target section) for matching fields
    for (const [currentSectionStr, fieldsInSection] of Object.entries(sectionFields)) {
      const currentSection = parseInt(currentSectionStr);
      
      // Skip if this is the target section
      if (currentSection === targetSection) {
        continue;
      }
      
      // Find fields matching add patterns
      for (const field of fieldsInSection) {
        for (const pattern of addPatterns) {
          if (pattern.test(field.name)) {
            const key = `from_${currentSection}_to_${targetSection}`;
            if (!fieldsToMove[key]) {
              fieldsToMove[key] = [];
            }
            fieldsToMove[key].push(field);
            break;
          }
        }
      }
    }
  }
  
  // Now actually move the fields
  for (const [key, fields] of Object.entries(fieldsToMove)) {
    if (fields.length === 0) continue;
    
    const [_, fromStr, toStr] = key.match(/from_(\d+)_to_(\d+)/) || [];
    if (!fromStr || !toStr) continue;
    
    const fromSection = parseInt(fromStr);
    const toSection = parseInt(toStr);
    
    // Verify both sections exist in the map
    if (!sectionFields[fromStr]) continue;
    if (!sectionFields[toStr]) {
      sectionFields[toStr] = [];
    }
    
    // Update each field
    for (const field of fields) {
      // Remove field from source section
      sectionFields[fromStr] = sectionFields[fromStr].filter(f => f.id !== field.id);
      
      // Update field properties
      field.section = toSection;
      field.confidence = 0.85; // Set a reasonably high confidence since this is a rule-based correction
      
      // Add field to target section
      sectionFields[toStr].push(field);
      
      correctedFields++;
    }
  }
  
  return correctedFields;
}

/**
 * Find common patterns in field names
 * @param fieldNames Array of field names
 * @returns Array of common patterns
 */
function findCommonPatterns(fieldNames: string[]): string[] {
  if (fieldNames.length === 0) {
    return [];
  }
  
  const patterns: string[] = [];
  const prefixGroups: Record<string, string[]> = {};
  const suffixGroups: Record<string, string[]> = {};
  
  // Group by common prefixes and suffixes
  for (const name of fieldNames) {
    // Extract prefix (first part before numbers or special chars)
    const prefixMatch = name.match(/^([a-zA-Z]+)/);
    if (prefixMatch && prefixMatch[1].length >= 3) {
      const prefix = prefixMatch[1].toLowerCase();
      if (!prefixGroups[prefix]) {
        prefixGroups[prefix] = [];
      }
      prefixGroups[prefix].push(name);
    }
    
    // Extract suffix (last part)
    const suffixMatch = name.match(/([a-zA-Z]+\d*)$/);
    if (suffixMatch && suffixMatch[1].length >= 3) {
      const suffix = suffixMatch[1].toLowerCase();
      if (!suffixGroups[suffix]) {
        suffixGroups[suffix] = [];
      }
      suffixGroups[suffix].push(name);
    }
    
    // Also search for number patterns
    const numberMatch = name.match(/\b(\d+)\b/g);
    if (numberMatch) {
      for (const num of numberMatch) {
        patterns.push(`\\b${num}\\b`);
      }
    }
  }
  
  // Find significant prefixes (shared by at least 3 fields or 20% of input)
  const minFieldsThreshold = Math.max(3, Math.ceil(fieldNames.length * 0.2));
  
  for (const [prefix, fields] of Object.entries(prefixGroups)) {
    if (fields.length >= minFieldsThreshold) {
      patterns.push(`^${prefix}`);
    }
  }
  
  for (const [suffix, fields] of Object.entries(suffixGroups)) {
    if (fields.length >= minFieldsThreshold) {
      patterns.push(`${suffix}$`);
    }
  }
  
  // Add form specific patterns
  const formFields = fieldNames.filter(name => name.includes('form'));
  if (formFields.length >= minFieldsThreshold) {
    patterns.push('^form');
  }
  
  return patterns;
}

export default {
  updateRules
}; 