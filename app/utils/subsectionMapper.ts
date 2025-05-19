/**
 * Subsection Mapper Utility
 * 
 * This utility provides comprehensive mapping and validation for subsections across all 30 form sections.
 * It helps ensure that every subsection in field-hierarchy.json has proper context mapping,
 * enforces parent-child relationships between sections and subsections, and provides
 * tools for validating subsection coverage.
 */

import { sectionMapping, type SectionInfo } from './sectionMapping';
import { groupFieldsBySection, type FieldMetadata, type FieldHierarchy } from './fieldHierarchyParser';

/**
 * Interface representing a subsection
 */
export interface SubsectionInfo extends SectionInfo {
  parentSection: number;
  subsectionNumber: string; // e.g., "18.1", "18.2"
  subsectionId: string; // Numeric identifier, e.g., "1801", "1802"
  componentPath: string;
  contextPath: string;
}

/**
 * Interface for subsection mapping results
 */
export interface SubsectionMappingResult {
  subsections: SubsectionInfo[];
  unmappedSubsections: string[];
  totalSubsections: number;
  mappedCount: number;
  unmappedCount: number;
  coveragePercentage: number;
}

/**
 * Interface for section to subsection mapping
 */
export interface SectionSubsectionMap {
  [sectionId: number]: {
    section: SectionInfo;
    subsections: SubsectionInfo[];
  };
}

/**
 * Regular expression to detect subsection notation in field metadata
 * Enhanced with multiple patterns for maximum coverage
 */
const SUBSECTION_PATTERNS = [
  // Standard section notation with dot or underscore
  /section(\d+)[\._](\d+)/i,
  
  // Direct subsection patterns like "Section9.1-9.4[0]"
  /Section(?<section>\d+)\.(?<subsection>\d+)(?:-\d+\.\d+)?(?:\[.*?\])?/i,
  
  // Escaped subsection patterns like "Section9\\.1-9\\.4"
  /Section(?<section>\d+)\\\\.(?<subsection>\d+)(?:-\d+\\\\.d+)?/i,
  
  // Numeric subsection patterns like "9.1" or "18.2"
  /^(?<section>\d+)\.(?<subsection>\d+)$/,
  
  // Section with underscore subsection like "section13_2-2"
  /section(?<section>\d+)_(?<subsection>[0-9.\-]+)/i,
  
  // Fields with subsection value patterns
  /^sect(?<section>\d+)\.(?<subsection>\d+)/i,
  
  // Form1 style subsection patterns
  /form\d+\[\d+\]\.Section(?<section>\d+)_(?<subsection>\d+)/i
];

// Keeping the original for backward compatibility
const SUBSECTION_REGEX = /section(\d+)[\._](\d+)/i;

/**
 * Known subsection mappings (manually verified)
 * This provides a fallback for subsections that might not follow the standard naming pattern
 */
const KNOWN_SUBSECTIONS: Record<string, Partial<SubsectionInfo>> = {
  // Section 18 (Relatives)
  '18.1': {
    id: 1801,
    name: 'Relatives - Parent Info',
    componentName: 'RenderSection18_1',
    contextFile: 'relativesInfo'
  },
  '18.2': {
    id: 1802, 
    name: 'Relatives - Address',
    componentName: 'RenderSection18_2',
    contextFile: 'relativesInfo'
  },
  '18.3': {
    id: 1803,
    name: 'Relatives - Citizenship',
    componentName: 'RenderSection18_3',
    contextFile: 'relativesInfo'
  },
  '18.4': {
    id: 1804,
    name: 'Relatives - US Documentation', 
    componentName: 'RenderSection18_4',
    contextFile: 'relativesInfo'
  },
  '18.5': {
    id: 1805,
    name: 'Relatives - Contact Information',
    componentName: 'RenderSection18_5', 
    contextFile: 'relativesInfo'
  },
  
  // Section 20 (Foreign Activities)
  '20A1': { 
    id: 2001,
    name: 'Foreign Activities - Financial Interests',
    componentName: 'RenderSection20A1',
    contextFile: 'foreignActivities'
  },
  '20A2': {
    id: 2002,
    name: 'Foreign Activities - Foreign Interests on Behalf',
    componentName: 'RenderSection20A2',
    contextFile: 'foreignActivities'
  },
  // Add other known subsections here...
  
  // Section 28 (Civil Actions)
  '28.1': {
    id: 2801,
    name: 'Civil Court Actions - Details',
    componentName: 'RenderSection28_1',
    contextFile: 'civil'
  },
  
  // Section 15 (Military History)
  '15.1': {
    id: 1501,
    name: 'Military History - Service Record',
    componentName: 'RenderSection15_1',
    contextFile: 'militaryHistory'
  },
  '15.2': {
    id: 1502,
    name: 'Military History - Disciplinary Procedures',
    componentName: 'RenderSection15_2',
    contextFile: 'militaryHistory'
  },
  '15.3': {
    id: 1503,
    name: 'Military History - Foreign Service',
    componentName: 'RenderSection15_3',
    contextFile: 'militaryHistory'
  }
};

/**
 * Detects and extracts subsection information from field names or metadata
 * Enhanced to use multiple detection patterns for improved coverage
 * 
 * @param field The field metadata to analyze
 * @returns Subsection information if found, null otherwise
 */
export function detectSubsection(field: FieldMetadata): {
  sectionId: number;
  subsectionId: string;
} | null {
  if (!field) return null;
  
  // Check field name for subsection notation
  if (field.name) {
    // Try all subsection patterns for maximum coverage
    for (const pattern of SUBSECTION_PATTERNS) {
      const match = field.name.match(pattern);
      if (match && match.groups) {
        // Use named capture groups if available
        if (match.groups.section && match.groups.subsection) {
          return {
            sectionId: parseInt(match.groups.section, 10),
            subsectionId: `${match.groups.section}.${match.groups.subsection}`,
          };
        }
      } else if (match && match.length >= 3) {
        // Use regular capture groups
        return {
          sectionId: parseInt(match[1], 10),
          subsectionId: `${match[1]}.${match[2]}`,
        };
      }
    }
    
    // Special case handling for form fields with nested structure
    if (field.name.includes('Section') && field.name.includes('#area')) {
      const sectionMatch = field.name.match(/Section(\d+)_(\d+)/i);
      if (sectionMatch && sectionMatch.length >= 3) {
        return {
          sectionId: parseInt(sectionMatch[1], 10),
          subsectionId: `${sectionMatch[1]}.${sectionMatch[2]}`,
        };
      }
    }
  }
  
  // Check field label for subsection notation
  if (field.label) {
    // Check standard section with subsection notation "Section 15.2"
    const labelMatch = field.label.match(/section\s*(\d+)[\._](\d+)/i);
    if (labelMatch) {
      return {
        sectionId: parseInt(labelMatch[1], 10),
        subsectionId: `${labelMatch[1]}.${labelMatch[2]}`,
      };
    }
    
    // Check for direct subsection reference at start of label "15.2 Entry #2"
    const directMatch = field.label.match(/^(\d+)\.(\d+)\s/i);
    if (directMatch) {
      return {
        sectionId: parseInt(directMatch[1], 10),
        subsectionId: `${directMatch[1]}.${directMatch[2]}`,
      };
    }
    
    // Check for descriptive section format "Section 15 Subsection 2"
    const descriptiveMatch = field.label.match(/section\s+(\d+)\s+subsection\s+(\d+)/i);
    if (descriptiveMatch) {
      return {
        sectionId: parseInt(descriptiveMatch[1], 10),
        subsectionId: `${descriptiveMatch[1]}.${descriptiveMatch[2]}`,
      };
    }
  }
  
  // Check field sectionName if available - this is often a good indicator
  if (field.sectionName && field.section) {
    // If we have a section but need to infer subsection from field structure
    const parts = field.name?.split(/[_.\[\]]/) || [];
    for (let i = 0; i < parts.length; i++) {
      if (/^\d+$/.test(parts[i]) && i < parts.length - 1 && /^\d+$/.test(parts[i+1])) {
        const section = parseInt(parts[i]);
        const subsection = parseInt(parts[i+1]);
        
        // Only consider it a match if the section matches the field's section
        if (section === field.section) {
          return {
            sectionId: section,
            subsectionId: `${section}.${subsection}`,
          };
        }
      }
    }
  }
  
  // Check if field belongs to a known subsection structure (fallback)
  // Use known subsections mapping as a last resort
  if (field.section) {
    // Check for any known subsections for this section
    const sectionStr = field.section.toString();
    const knownSubsectionKeys = Object.keys(KNOWN_SUBSECTIONS)
      .filter(key => key.startsWith(sectionStr + '.'));
      
    if (knownSubsectionKeys.length === 1) {
      // If there's only one known subsection for this section, assume it's the right one
      return {
        sectionId: field.section,
        subsectionId: knownSubsectionKeys[0],
      };
    }
  }
  
  return null;
}

/**
 * Gets the component path for a subsection
 * 
 * @param sectionId The parent section ID
 * @param subsectionId The subsection identifier (e.g., "18.1")
 * @returns The component path or undefined if not found
 */
export function getComponentPathForSubsection(sectionId: number, subsectionId: string): string | undefined {
  // First check if there's a known mapping
  const knownSubsection = KNOWN_SUBSECTIONS[subsectionId];
  if (knownSubsection && knownSubsection.componentName && knownSubsection.contextFile) {
    return `app/components/_${knownSubsection.contextFile.replace('Info', '')}/${knownSubsection.componentName}`;
  }
  
  // Default pattern for subsection components
  const sectionInfo = sectionMapping[sectionId];
  if (!sectionInfo) return undefined;
  
  const contextBase = sectionInfo.contextFile.replace('Info', '');
  const formattedSubsectionId = subsectionId.replace('.', '_');
  
  return `app/components/_${contextBase}/Section${formattedSubsectionId}`;
}

/**
 * Gets the context path for a subsection
 * 
 * @param sectionId The parent section ID
 * @param subsectionId The subsection identifier (e.g., "18.1")
 * @returns The context path or undefined if not found
 */
export function getContextPathForSubsection(sectionId: number, subsectionId: string): string | undefined {
  // Subsections typically share the same context file as their parent section
  const sectionInfo = sectionMapping[sectionId];
  if (!sectionInfo) return undefined;
  
  return `app/state/contexts/sections/${sectionInfo.contextFile}`;
}

/**
 * Builds comprehensive mapping of all subsections across all sections
 * 
 * @param fieldHierarchy The field hierarchy data
 * @returns The subsection mapping result with coverage statistics
 */
export function buildSubsectionMapping(fieldHierarchy: FieldHierarchy): SubsectionMappingResult {
  const result: SubsectionMappingResult = {
    subsections: [],
    unmappedSubsections: [],
    totalSubsections: 0,
    mappedCount: 0,
    unmappedCount: 0,
    coveragePercentage: 0
  };
  
  // First, collect all known subsections from the KNOWN_SUBSECTIONS mapping
  const knownSubsectionIds = Object.keys(KNOWN_SUBSECTIONS);
  for (const subsectionId of knownSubsectionIds) {
    const [sectionPart, subsectionPart] = subsectionId.split('.');
    const sectionId = parseInt(sectionPart, 10);
    
    const sectionInfo = sectionMapping[sectionId];
    if (!sectionInfo) {
      result.unmappedSubsections.push(subsectionId);
      continue;
    }
    
    const knownInfo = KNOWN_SUBSECTIONS[subsectionId];
    
    const subsectionInfo: SubsectionInfo = {
      id: knownInfo.id || parseInt(subsectionId.replace('.', ''), 10),
      name: knownInfo.name || `${sectionInfo.name} - Subsection ${subsectionPart}`,
      componentName: knownInfo.componentName || `Section${sectionPart}_${subsectionPart}`,
      contextFile: knownInfo.contextFile || sectionInfo.contextFile,
      parentSection: sectionId,
      subsectionNumber: subsectionId,
      subsectionId: subsectionId.replace('.', ''),
      componentPath: getComponentPathForSubsection(sectionId, subsectionId) || '',
      contextPath: getContextPathForSubsection(sectionId, subsectionId) || ''
    };
    
    result.subsections.push(subsectionInfo);
    result.mappedCount++;
  }
  
  // Next, analyze field hierarchy for any additional subsections
  if (fieldHierarchy) {
    const sectionFields = groupFieldsBySection(fieldHierarchy);
    
    // Iterate through all sections
    for (const [sectionIdStr, fields] of Object.entries(sectionFields)) {
      const sectionId = parseInt(sectionIdStr, 10);
      const sectionInfo = sectionMapping[sectionId];
      if (!sectionInfo) continue;
      
      // Map to collect unique subsections
      const subsectionMap = new Map<string, Set<string>>();
      
      // Analyze each field for subsection patterns
      for (const field of fields) {
        const subsectionInfo = detectSubsection(field);
        if (subsectionInfo) {
          // Track unique field names for this subsection
          if (!subsectionMap.has(subsectionInfo.subsectionId)) {
            subsectionMap.set(subsectionInfo.subsectionId, new Set<string>());
          }
          subsectionMap.get(subsectionInfo.subsectionId)?.add(field.name);
        }
      }
      
      // Process detected subsections
      for (const [subsectionId, fieldNames] of subsectionMap.entries()) {
        // Skip if already mapped from KNOWN_SUBSECTIONS
        if (result.subsections.some(s => s.subsectionNumber === subsectionId)) {
          continue;
        }
        
        // Check if there are enough fields to indicate a real subsection
        if (fieldNames.size >= 3) {  // Arbitrary threshold to avoid false positives
          const [sectionPart, subsectionPart] = subsectionId.split('.');
          
          const subsectionInfo: SubsectionInfo = {
            id: parseInt(subsectionId.replace('.', ''), 10),
            name: `${sectionInfo.name} - Subsection ${subsectionPart}`,
            componentName: `Section${sectionPart}_${subsectionPart}`,
            contextFile: sectionInfo.contextFile,
            parentSection: sectionId,
            subsectionNumber: subsectionId,
            subsectionId: subsectionId.replace('.', ''),
            componentPath: getComponentPathForSubsection(sectionId, subsectionId) || '',
            contextPath: getContextPathForSubsection(sectionId, subsectionId) || ''
          };
          
          result.subsections.push(subsectionInfo);
          result.mappedCount++;
        } else {
          // Not enough fields, might be a false positive
          result.unmappedSubsections.push(subsectionId);
          result.unmappedCount++;
        }
      }
    }
  }
  
  // Calculate coverage statistics
  result.totalSubsections = result.mappedCount + result.unmappedCount;
  result.coveragePercentage = result.totalSubsections > 0 
    ? (result.mappedCount / result.totalSubsections) * 100 
    : 0;
  
  return result;
}

/**
 * Organizes subsections by their parent section
 * 
 * @param subsections Array of subsection information
 * @returns Mapping of sections to their subsections
 */
export function organizeSubsectionsBySection(subsections: SubsectionInfo[]): SectionSubsectionMap {
  const map: SectionSubsectionMap = {};
  
  // Initialize with all sections
  for (const [idStr, section] of Object.entries(sectionMapping)) {
    const id = parseInt(idStr, 10);
    map[id] = {
      section,
      subsections: []
    };
  }
  
  // Add subsections to their parent sections
  for (const subsection of subsections) {
    if (map[subsection.parentSection]) {
      map[subsection.parentSection].subsections.push(subsection);
    }
  }
  
  return map;
}

/**
 * Validates that a section context object properly includes all required subsection fields
 * 
 * @param contextData The section context data
 * @param sectionId The section ID
 * @param subsectionIds Array of subsection IDs that should be present
 * @returns Validation result with missing subsections
 */
export function validateSubsectionFields(
  contextData: any, 
  sectionId: number,
  subsectionIds: string[]
): { 
  isValid: boolean; 
  missingSubsections: string[];
  presentSubsections: string[];
} {
  const result = {
    isValid: true,
    missingSubsections: [] as string[],
    presentSubsections: [] as string[]
  };
  
  // Skip validation if context data is missing
  if (!contextData) {
    result.isValid = false;
    result.missingSubsections = subsectionIds;
    return result;
  }
  
  // Check for each expected subsection
  for (const subsectionId of subsectionIds) {
    // Convert subsection ID format (e.g., "18.1") to the property name format (e.g., "section18_1")
    const propertyName = `section${subsectionId.replace('.', '_')}`;
    
    if (contextData[propertyName] !== undefined) {
      result.presentSubsections.push(subsectionId);
    } else {
      result.missingSubsections.push(subsectionId);
      result.isValid = false;
    }
  }
  
  return result;
}

/**
 * Generates subsection interface code for a given section
 * 
 * @param sectionId The section ID
 * @param subsections Array of subsection information
 * @returns TypeScript interface code for the subsections
 */
export function generateSubsectionInterfaces(sectionId: number, subsections: SubsectionInfo[]): string {
  if (subsections.length === 0) {
    return '';
  }
  
  const sectionInfo = sectionMapping[sectionId];
  if (!sectionInfo) {
    return '';
  }
  
  let code = `// Subsection interfaces for Section ${sectionId}: ${sectionInfo.name}\n\n`;
  
  // Generate import statement
  code += `import { type Field } from "api/interfaces/formDefinition";\n\n`;
  
  // Generate parent section interface if it includes subsections
  code += `interface ${camelToTitleCase(sectionInfo.contextFile)} {\n`;
  code += `  _id: number;\n`;
  
  // Add subsection properties to parent interface
  for (const subsection of subsections) {
    const formattedId = subsection.subsectionNumber.replace('.', '_');
    code += `  section${formattedId}?: Section${formattedId}Details[];\n`;
  }
  
  code += `}\n\n`;
  
  // Generate each subsection interface
  for (const subsection of subsections) {
    const formattedId = subsection.subsectionNumber.replace('.', '_');
    code += `interface Section${formattedId}Details {\n`;
    code += `  _id: number;\n`;
    code += `  // Add fields specific to this subsection\n`;
    code += `}\n\n`;
  }
  
  // Generate exports
  code += `export type {\n`;
  code += `  ${camelToTitleCase(sectionInfo.contextFile)},\n`;
  
  for (const subsection of subsections) {
    const formattedId = subsection.subsectionNumber.replace('.', '_');
    code += `  Section${formattedId}Details,\n`;
  }
  
  code += `};\n`;
  
  return code;
}

/**
 * Helper function to convert camelCase to TitleCase
 * 
 * @param str The string to convert
 * @returns The converted string
 */
function camelToTitleCase(str: string): string {
  // First letter uppercase
  const first = str.charAt(0).toUpperCase();
  // Rest unchanged
  const rest = str.slice(1);
  return first + rest;
}

/**
 * Create a validation report for subsection coverage
 * 
 * @param mappingResult The subsection mapping result
 * @returns A formatted validation report
 */
export function generateCoverageReport(mappingResult: SubsectionMappingResult): string {
  let report = `# Subsection Coverage Report\n\n`;
  
  report += `## Summary\n\n`;
  report += `- Total Subsections: ${mappingResult.totalSubsections}\n`;
  report += `- Mapped Subsections: ${mappingResult.mappedCount}\n`;
  report += `- Unmapped Subsections: ${mappingResult.unmappedCount}\n`;
  report += `- Coverage Percentage: ${mappingResult.coveragePercentage.toFixed(2)}%\n\n`;
  
  report += `## Mapped Subsections\n\n`;
  
  // Organize by section
  const bySection = organizeSubsectionsBySection(mappingResult.subsections);
  
  for (const [sectionId, sectionData] of Object.entries(bySection)) {
    if (sectionData.subsections.length === 0) continue;
    
    report += `### Section ${sectionId}: ${sectionData.section.name}\n\n`;
    
    for (const subsection of sectionData.subsections) {
      report += `- **${subsection.subsectionNumber}**: ${subsection.name}\n`;
      report += `  - Component: \`${subsection.componentPath}\`\n`;
      report += `  - Context: \`${subsection.contextPath}\`\n`;
      report += `\n`;
    }
  }
  
  if (mappingResult.unmappedSubsections.length > 0) {
    report += `## Unmapped Subsections\n\n`;
    
    for (const subsectionId of mappingResult.unmappedSubsections) {
      report += `- ${subsectionId}\n`;
    }
  }
  
  return report;
} 