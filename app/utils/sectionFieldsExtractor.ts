import { 
  loadFieldHierarchy,
  getFieldsForSection as getBasicFieldsForSection 
} from './fieldHierarchyParser';
import type { FieldMetadata, FieldHierarchy } from './fieldHierarchyParser';

/**
 * Sorting options for field metadata
 */
export enum SortBy {
  ID = 'id',
  NAME = 'name',
  LABEL = 'label',
  TYPE = 'type',
  CONFIDENCE = 'confidence'
}

/**
 * Sort direction options
 */
export enum SortDirection {
  ASC = 'asc',
  DESC = 'desc'
}

/**
 * Options for extracting section fields
 */
export interface SectionFieldsOptions {
  /** Sort fields by a specific property */
  sortBy?: SortBy;
  /** Sort direction */
  sortDirection?: SortDirection;
  /** Filter fields by type */
  filterByType?: string | string[];
  /** Filter fields by minimum confidence level (0.0-1.0) */
  minConfidence?: number;
  /** Group fields by subsection if applicable */
  groupBySubsection?: boolean;
  /** Filter fields by search query on label or name */
  searchQuery?: string;
  /** Include field name pattern information */
  includePatternInfo?: boolean;
}

/**
 * Subsection grouping structure
 */
export interface SubsectionGroup {
  name: string;
  fields: FieldMetadata[];
}

/**
 * Result of getFieldsBySection with optional grouping
 */
export interface SectionFieldsResult {
  sectionNumber: number;
  sectionName: string;
  fields: FieldMetadata[];
  groupedFields?: Record<string, FieldMetadata[]>;
  subsections?: SubsectionGroup[];
  count: number;
  types: Record<string, number>;
}

/**
 * Extracts fields for a specific section with additional options for sorting and filtering
 * 
 * @param sectionNumber - The section number to extract fields for
 * @param options - Options for filtering, sorting, and grouping fields
 * @param fieldHierarchy - Optional pre-loaded field hierarchy data
 * @returns Extracted and processed fields for the specified section
 */
export function getFieldsBySection(
  sectionNumber: number,
  options: SectionFieldsOptions = {},
  fieldHierarchy?: FieldHierarchy
): SectionFieldsResult {
  // Load field hierarchy if not provided
  const hierarchy = fieldHierarchy || loadFieldHierarchy();
  
  // Get basic fields for the section using the existing function
  let fields = getBasicFieldsForSection(sectionNumber, hierarchy);
  
  // Extract section name from the first field (assuming consistency)
  const sectionName = fields.length > 0 ? fields[0].sectionName : `Section ${sectionNumber}`;
  
  // Apply filtering by type if specified
  if (options.filterByType) {
    const typeFilters = Array.isArray(options.filterByType) 
      ? options.filterByType 
      : [options.filterByType];
    
    fields = fields.filter(field => typeFilters.includes(field.type));
  }
  
  // Apply filtering by confidence if specified
  if (typeof options.minConfidence === 'number') {
    fields = fields.filter(field => field.confidence >= options.minConfidence!);
  }
  
  // Apply search query filtering if specified
  if (options.searchQuery && options.searchQuery.trim() !== '') {
    const query = options.searchQuery.toLowerCase();
    fields = fields.filter(field => 
      field.label.toLowerCase().includes(query) || 
      field.name.toLowerCase().includes(query)
    );
  }
  
  // Apply sorting if specified
  if (options.sortBy) {
    const sortBy = options.sortBy;
    const direction = options.sortDirection || SortDirection.ASC;
    
    fields.sort((a, b) => {
      let valueA = a[sortBy];
      let valueB = b[sortBy];
      
      // Handle string comparison
      if (typeof valueA === 'string' && typeof valueB === 'string') {
        valueA = valueA.toLowerCase();
        valueB = valueB.toLowerCase();
      }
      
      if (valueA < valueB) return direction === SortDirection.ASC ? -1 : 1;
      if (valueA > valueB) return direction === SortDirection.ASC ? 1 : -1;
      return 0;
    });
  }
  
  // Count field types
  const types: Record<string, number> = {};
  fields.forEach(field => {
    types[field.type] = (types[field.type] || 0) + 1;
  });
  
  // Build the result
  const result: SectionFieldsResult = {
    sectionNumber,
    sectionName,
    fields,
    count: fields.length,
    types
  };
  
  // Group fields by subsection if requested
  if (options.groupBySubsection) {
    const subsections: SubsectionGroup[] = [];
    const groupedFields: Record<string, FieldMetadata[]> = {};
    
    // Analyze field names to extract subsection information
    fields.forEach(field => {
      // Extract subsection from field name
      // This is a heuristic and may need adjustment based on actual field name patterns
      const nameParts = field.name.split('.');
      const subsectionPart = nameParts.find(part => part.includes('subsection'));
      
      let subsectionName = 'default';
      
      if (subsectionPart) {
        const match = subsectionPart.match(/subsection(\d+)/i);
        if (match && match[1]) {
          subsectionName = `Subsection ${match[1]}`;
        }
      } else {
        // Try to infer subsection from field label or pattern
        if (field.label.includes('Subsection')) {
          const match = field.label.match(/Subsection (\d+)/i);
          if (match && match[1]) {
            subsectionName = `Subsection ${match[1]}`;
          }
        }
      }
      
      // Add to grouped fields
      if (!groupedFields[subsectionName]) {
        groupedFields[subsectionName] = [];
        subsections.push({
          name: subsectionName,
          fields: groupedFields[subsectionName]
        });
      }
      
      groupedFields[subsectionName].push(field);
    });
    
    result.groupedFields = groupedFields;
    result.subsections = subsections;
  }
  
  // Extract and include pattern information if requested
  if (options.includePatternInfo) {
    // Field name pattern information would be added here
    // This could analyze the structure of field names to extract patterns
    // Or provide metadata about field naming conventions
  }
  
  return result;
}

/**
 * Gets all fields from all sections
 * 
 * @param options - Options for filtering, sorting, and grouping fields
 * @returns Object with fields grouped by section number
 */
export function getAllSectionFields(
  options: SectionFieldsOptions = {}
): Record<number, SectionFieldsResult> {
  const hierarchy = loadFieldHierarchy();
  const allSections: Record<number, SectionFieldsResult> = {};
  
  // Loop through sections 1-30
  for (let i = 1; i <= 30; i++) {
    allSections[i] = getFieldsBySection(i, options, hierarchy);
  }
  
  return allSections;
}

/**
 * Returns a filtered list of section numbers that match specific criteria
 * 
 * @param criteria - Filtering criteria
 * @returns Array of section numbers that match the criteria
 */
export function findSectionsByFieldCriteria(
  criteria: {
    fieldType?: string | string[];
    minFieldCount?: number;
    hasFieldWithName?: string;
    hasFieldWithLabel?: string;
  }
): number[] {
  const hierarchy = loadFieldHierarchy();
  const matchingSections: number[] = [];
  
  // Loop through sections 1-30
  for (let i = 1; i <= 30; i++) {
    const fields = getBasicFieldsForSection(i, hierarchy);
    
    // Skip if no fields in this section
    if (fields.length === 0) continue;
    
    let matches = true;
    
    // Check field count criteria
    if (criteria.minFieldCount !== undefined && fields.length < criteria.minFieldCount) {
      matches = false;
    }
    
    // Check field type criteria
    if (criteria.fieldType && matches) {
      const typeFilters = Array.isArray(criteria.fieldType) 
        ? criteria.fieldType 
        : [criteria.fieldType];
      
      const hasMatchingType = fields.some(field => typeFilters.includes(field.type));
      if (!hasMatchingType) {
        matches = false;
      }
    }
    
    // Check field name criteria
    if (criteria.hasFieldWithName && matches) {
      const namePattern = new RegExp(criteria.hasFieldWithName, 'i');
      const hasMatchingName = fields.some(field => namePattern.test(field.name));
      if (!hasMatchingName) {
        matches = false;
      }
    }
    
    // Check field label criteria
    if (criteria.hasFieldWithLabel && matches) {
      const labelPattern = new RegExp(criteria.hasFieldWithLabel, 'i');
      const hasMatchingLabel = fields.some(field => labelPattern.test(field.label));
      if (!hasMatchingLabel) {
        matches = false;
      }
    }
    
    // Add to results if all criteria matched
    if (matches) {
      matchingSections.push(i);
    }
  }
  
  return matchingSections;
} 