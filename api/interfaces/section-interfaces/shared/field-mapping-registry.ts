/**
 * Field Mapping Registry
 * 
 * Centralized registry for all section field mappings
 * Eliminates duplication of PDF field IDs and names across sections
 */

import type { FieldMapping, SectionFieldMappings } from './base-types';

/**
 * Field mapping registry interface
 */
export interface IFieldMappingRegistry {
  registerSection(mappings: SectionFieldMappings): void;
  getSectionMappings(sectionNumber: number): FieldMapping[];
  getPdfFieldId(sectionNumber: number, uiPath: string): string | undefined;
  getPdfFieldName(sectionNumber: number, uiPath: string): string | undefined;
  getUiPath(sectionNumber: number, pdfFieldId: string): string | undefined;
  getAllMappings(): Map<number, FieldMapping[]>;
}

/**
 * Field mapping registry implementation
 */
class FieldMappingRegistry implements IFieldMappingRegistry {
  private mappings = new Map<number, FieldMapping[]>();
  private uiPathIndex = new Map<string, FieldMapping>();
  private pdfFieldIdIndex = new Map<string, FieldMapping>();
  
  /**
   * Register section field mappings
   */
  registerSection(sectionMappings: SectionFieldMappings): void {
    const { sectionNumber, mappings } = sectionMappings;
    
    // Store mappings
    this.mappings.set(sectionNumber, mappings);
    
    // Build indexes for fast lookup
    mappings.forEach(mapping => {
      const uiKey = `${sectionNumber}:${mapping.uiPath}`;
      const pdfKey = `${sectionNumber}:${mapping.pdfFieldId}`;
      
      this.uiPathIndex.set(uiKey, mapping);
      this.pdfFieldIdIndex.set(pdfKey, mapping);
    });
  }
  
  /**
   * Get all mappings for a section
   */
  getSectionMappings(sectionNumber: number): FieldMapping[] {
    return this.mappings.get(sectionNumber) || [];
  }
  
  /**
   * Get PDF field ID by UI path
   */
  getPdfFieldId(sectionNumber: number, uiPath: string): string | undefined {
    const key = `${sectionNumber}:${uiPath}`;
    return this.uiPathIndex.get(key)?.pdfFieldId;
  }
  
  /**
   * Get PDF field name by UI path
   */
  getPdfFieldName(sectionNumber: number, uiPath: string): string | undefined {
    const key = `${sectionNumber}:${uiPath}`;
    return this.uiPathIndex.get(key)?.pdfFieldName;
  }
  
  /**
   * Get UI path by PDF field ID
   */
  getUiPath(sectionNumber: number, pdfFieldId: string): string | undefined {
    const key = `${sectionNumber}:${pdfFieldId}`;
    return this.pdfFieldIdIndex.get(key)?.uiPath;
  }
  
  /**
   * Get all mappings
   */
  getAllMappings(): Map<number, FieldMapping[]> {
    return new Map(this.mappings);
  }
  
  /**
   * Clear all mappings
   */
  clear(): void {
    this.mappings.clear();
    this.uiPathIndex.clear();
    this.pdfFieldIdIndex.clear();
  }
  
  /**
   * Get registry statistics
   */
  getStats(): {
    totalSections: number;
    totalMappings: number;
    sectionsRegistered: number[];
  } {
    let totalMappings = 0;
    const sectionsRegistered: number[] = [];
    
    this.mappings.forEach((mappings, sectionNumber) => {
      totalMappings += mappings.length;
      sectionsRegistered.push(sectionNumber);
    });
    
    return {
      totalSections: this.mappings.size,
      totalMappings,
      sectionsRegistered: sectionsRegistered.sort((a, b) => a - b)
    };
  }
}

// Singleton instance
export const fieldMappingRegistry = new FieldMappingRegistry();

/**
 * Helper function to create field mapping
 */
export function createFieldMapping(
  uiPath: string,
  pdfFieldId: string,
  pdfFieldName?: string,
  transformer?: (value: any) => string
): FieldMapping {
  return {
    uiPath,
    pdfFieldId,
    pdfFieldName,
    transformer
  };
}

/**
 * Helper function to register multiple mappings at once
 */
export function registerBulkMappings(
  sectionNumber: number,
  mappings: Array<[string, string, string?]>
): void {
  const fieldMappings: FieldMapping[] = mappings.map(
    ([uiPath, pdfFieldId, pdfFieldName]) =>
      createFieldMapping(uiPath, pdfFieldId, pdfFieldName)
  );
  
  fieldMappingRegistry.registerSection({
    sectionNumber,
    mappings: fieldMappings
  });
}

/**
 * Common transformers for field values
 */
export const FieldTransformers = {
  /**
   * Transform boolean to YES/NO
   */
  booleanToYesNo: (value: boolean | string): string => {
    if (typeof value === 'boolean') {
      return value ? 'YES' : 'NO';
    }
    return value === 'true' || value === 'YES' ? 'YES' : 'NO';
  },
  
  /**
   * Transform date to MM/DD/YYYY format
   */
  dateToMMDDYYYY: (value: string): string => {
    if (!value) return '';
    const date = new Date(value);
    if (isNaN(date.getTime())) return value;
    
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const year = date.getFullYear();
    
    return `${month}/${day}/${year}`;
  },
  
  /**
   * Transform phone number to (XXX) XXX-XXXX format
   */
  formatPhoneNumber: (value: string): string => {
    const digits = value.replace(/\D/g, '');
    if (digits.length !== 10) return value;
    
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  },
  
  /**
   * Transform SSN to XXX-XX-XXXX format
   */
  formatSSN: (value: string): string => {
    const digits = value.replace(/\D/g, '');
    if (digits.length !== 9) return value;
    
    return `${digits.slice(0, 3)}-${digits.slice(3, 5)}-${digits.slice(5)}`;
  },
  
  /**
   * Uppercase transformer
   */
  uppercase: (value: string): string => {
    return String(value).toUpperCase();
  },
  
  /**
   * Truncate to max length
   */
  truncate: (maxLength: number) => (value: string): string => {
    return String(value).slice(0, maxLength);
  }
};

/**
 * Load field mappings from JSON files
 */
export async function loadFieldMappingsFromJSON(
  sectionNumber: number,
  jsonPath: string
): Promise<void> {
  try {
    const response = await fetch(jsonPath);
    const data = await response.json();
    
    const mappings: FieldMapping[] = data.mappings || data;
    
    fieldMappingRegistry.registerSection({
      sectionNumber,
      mappings
    });
  } catch (error) {
    console.error(`Failed to load field mappings for section ${sectionNumber}:`, error);
    throw error;
  }
}

/**
 * Batch load multiple section mappings
 */
export async function loadAllSectionMappings(): Promise<void> {
  const sections = Array.from({ length: 30 }, (_, i) => i + 1);
  
  const loadPromises = sections.map(async (sectionNumber) => {
    const jsonPath = `/api/interfaces/sections-references/section-${sectionNumber}.json`;
    
    try {
      await loadFieldMappingsFromJSON(sectionNumber, jsonPath);
    } catch (error) {
      // Skip sections without mapping files
      console.log(`No mappings found for section ${sectionNumber}`);
    }
  });
  
  await Promise.all(loadPromises);
  
  const stats = fieldMappingRegistry.getStats();
  console.log('Field mappings loaded:', stats);
}