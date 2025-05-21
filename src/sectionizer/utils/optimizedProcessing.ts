/**
 * Optimized Processing Pipeline for SF-86 Sectionizer
 *
 * This file consolidates multiple utility functions into a single optimized pipeline:
 * 1. Field Collection management - for efficient data organization
 * 2. Coordinate enhancement - with caching to avoid redundancy
 * 3. Memoization utilities - for caching expensive operations
 * 4. Direct output generation - for streamlined file output
 * 5. In-place processing - eliminates intermediate file creation
 * 
 * The goal is to minimize file count while maximizing performance.
 */

import * as fs from 'fs';
import * as fsPromises from 'fs/promises';
import * as path from 'path';
import { RuleEngine } from '../engine.js';
import type { PDFField, CategorizedField } from './extractFieldsBySection.js';
import { categorizeFields as originalCategorizeFields } from './extractFieldsBySection.js';
import * as helpers from './commonHelpers.js';

// Cache for expensive coordinate calculations
const coordinateCache = new Map<string, any>();
// Cache for memoized function results
const memoizationCache = new Map<string, Map<string, any>>();
// Cache for tracking enhanced fields
const enhancedFieldsCache = new Set<string>();

// In-memory database of coordinate data from debug logs
let coordinateDebugLog: Record<string, any>[] = [];

/**
 * Generate variations of field names for matching against coordinate data
 */
function getFieldNameVariations(fieldName: string): string[] {
  const variations: string[] = [];
  
  // Original name
  variations.push(fieldName);
  
  // Name with normalized array indices
  const normalizedName = fieldName.replace(/\[\d+\]/g, '[0]');
  if (normalizedName !== fieldName) {
    variations.push(normalizedName);
  }
  
  // Name with no array indices
  const noIndicesName = fieldName.replace(/\[\d+\]/g, '');
  if (noIndicesName !== fieldName) {
    variations.push(noIndicesName);
  }
  
  // Name with last part (after last dot)
  const parts = fieldName.split('.');
  if (parts.length > 1) {
    variations.push(parts[parts.length - 1]);
  }
  
  return variations;
}

/**
 * Find coordinate data for a specific field
 * @param fieldName Name of the field to find coordinates for
 * @returns Coordinate data object or undefined if not found
 */
function findCoordinateDataForField(fieldName: string): Record<string, any> | undefined {
  // Lazy-load coordinate data if not already loaded
  if (coordinateDebugLog.length === 0) {
    // We can't use await here in a synchronous function, so use a try-catch
    try {
      // Use path but access fs synchronous methods correctly
      const debugLogPath = path.join(process.cwd(), 'output', 'coordinate-extraction-debug.json');
      
      // Use fs.existsSync and fs.readFileSync directly, not from fs/promises
      if (fs.existsSync(debugLogPath)) {
        const data = fs.readFileSync(debugLogPath, 'utf8');
        coordinateDebugLog = JSON.parse(data);
        console.log(`Loaded ${coordinateDebugLog.length} coordinate entries from debug log`);
      } else {
        console.error(`Debug log file not found at ${debugLogPath}`);
      }
    } catch (error) {
      console.error(`Error loading coordinate debug log synchronously: ${error}`);
    }
  }
  
  if (coordinateDebugLog.length === 0) {
    return undefined;
  }
  
  // Try different field name formats
  const fieldNameVariations = getFieldNameVariations(fieldName);
  
  // Check each variation against the debug log
  for (const nameVariation of fieldNameVariations) {
    // Direct match first (full field name)
    const match = coordinateDebugLog.find(entry => 
      entry.field === nameVariation
    );
    
    if (match) {
      return match;
    }
  }
  
  // If no direct match, try a more flexible approach
  // Ignore array indices and try to match based on field name patterns
  for (const nameVariation of fieldNameVariations) {
    const baseFieldName = nameVariation.replace(/\[\d+\]/g, '[]');
    
    // Find entries that have the same pattern, ignoring specific array indices
    const patternMatches = coordinateDebugLog.filter(entry => {
      const entryBaseField = entry.field.replace(/\[\d+\]/g, '[]');
      return entryBaseField === baseFieldName;
    });
    
    if (patternMatches.length > 0) {
      // Return the first match, which is better than nothing
      return patternMatches[0];
    }
  }
  
  return undefined;
}

/**
 * Helper function to extract array indices from a field name
 * @param fieldName The field name with array notation
 * @returns Array of indices found in the field name
 */
function getArrayIndices(fieldName: string): number[] {
  const indices: number[] = [];
  const matches = fieldName.matchAll(/\[(\d+)\]/g);
  for (const match of matches) {
    if (match[1]) {
      indices.push(parseInt(match[1], 10));
    }
  }
  return indices;
}

// Default pipeline options
export const DEFAULT_PIPELINE_OPTIONS: OptimizedPipelineOptions = {
  selfHealing: true,
  validateCounts: false,
  outputDir: path.join(process.cwd(), 'output'),
  outputFormat: 'both',
  enhanceCoordinates: true,
  maxIterations: 5,
  logLevel: 'info'
};

// ===== 1. FIELD COLLECTION IMPLEMENTATION =====

/**
 * FieldCollection class for efficient in-memory field processing
 * Provides a unified data structure to avoid redundant transformations
 */
export class FieldCollection {
  private fieldArray: CategorizedField[] = [];
  private sectionMap: Record<string, CategorizedField[]> = {};
  private filterCache: Map<string, CategorizedField[]> = new Map();
  
  constructor(fields?: CategorizedField[]) {
    if (fields && fields.length > 0) {
      this.addFields(fields);
    }
  }
  
  public addFields(fields: CategorizedField[]): void {
    if (!fields || fields.length === 0) return;
    
    this.fieldArray.push(...fields);
    this.updateSectionMap(fields);
    this.clearCache();
  }
  
  private updateSectionMap(fields: CategorizedField[]): void {
    fields.forEach(field => {
      const section = String(field.section || 0);
      if (!this.sectionMap[section]) {
        this.sectionMap[section] = [];
      }
      this.sectionMap[section].push(field);
    });
  }
  
  private clearCache(): void {
    this.filterCache.clear();
  }
  
  public rebuildSectionMap(): void {
    this.sectionMap = {};
    this.updateSectionMap(this.fieldArray);
    this.clearCache();
  }
  
  public get fields(): CategorizedField[] {
    return [...this.fieldArray];
  }
  
  public get totalCount(): number {
    return this.fieldArray.length;
  }
  
  public get categorizedCount(): number {
    return this.fieldArray.filter(f => f.section !== undefined && f.section > 0).length;
  }
  
  public get unknownCount(): number {
    return this.fieldArray.filter(f => f.section === undefined || f.section === 0).length;
  }
  
  public get coveragePercentage(): number {
    if (this.totalCount === 0) return 0;
    return (this.categorizedCount / this.totalCount) * 100;
  }
  
  public get sectionCounts(): Record<string, number> {
    const counts: Record<string, number> = {};
    
    for (const [section, fields] of Object.entries(this.sectionMap)) {
      counts[section] = fields.length;
    }
    
    return counts;
  }
  
  public getFieldsForSection(section: number | string): CategorizedField[] {
    const sectionKey = String(section);
    return [...(this.sectionMap[sectionKey] || [])];
  }
  
  public getFieldsWithFilter(
    filterFn: (field: CategorizedField) => boolean,
    cacheKey?: string
  ): CategorizedField[] {
    if (cacheKey && this.filterCache.has(cacheKey)) {
      return [...this.filterCache.get(cacheKey)!];
    }
    
    const filteredFields = this.fieldArray.filter(filterFn);
    
    if (cacheKey) {
      this.filterCache.set(cacheKey, [...filteredFields]);
    }
    
    return filteredFields;
  }
  
  public transformFields(transformFn: (field: CategorizedField) => void): void {
    this.fieldArray.forEach(transformFn);
    this.rebuildSectionMap();
  }
  
  public moveFieldToSection(fieldId: string, targetSection: number): boolean {
    const fieldIndex = this.fieldArray.findIndex(f => f.id === fieldId);
    if (fieldIndex === -1) return false;
    
    const field = this.fieldArray[fieldIndex];
    const originalSection = String(field.section || 0);
    const newSection = String(targetSection);
    
    if (originalSection === newSection) return true;
    
    field.section = targetSection;
    
    if (this.sectionMap[originalSection]) {
      this.sectionMap[originalSection] = this.sectionMap[originalSection].filter(f => f.id !== fieldId);
    }
    
    if (!this.sectionMap[newSection]) {
      this.sectionMap[newSection] = [];
    }
    this.sectionMap[newSection].push(field);
    
    this.clearCache();
    
    return true;
  }
  
  public setFieldProperty<K extends keyof CategorizedField>(
    fieldId: string,
    property: K,
    value: CategorizedField[K]
  ): boolean {
    const field = this.fieldArray.find(f => f.id === fieldId);
    if (!field) return false;
    
    if (property === 'section' && field.section !== value) {
      return this.moveFieldToSection(fieldId, value as number);
    }
    
    field[property] = value;
    
    if (property === 'section' || property === 'subsection' || property === 'entry') {
      this.rebuildSectionMap();
    }
    
    return true;
  }
  
  public clone(): FieldCollection {
    const cloned = new FieldCollection();
    cloned.addFields(JSON.parse(JSON.stringify(this.fieldArray)));
    return cloned;
  }
}

// ===== 2. COORDINATE ENHANCEMENT IMPLEMENTATION =====

/**
 * Enhanced rectangle with additional properties
 */
interface EnhancedRect {
  x: number;
  y: number;
  width: number;
  height: number;
  page: number;
  right?: number;
  bottom?: number;
  centerX?: number;
  centerY?: number;
  area?: number;
}

/**
 * Enhanced field with additional coordinate properties
 */
interface EnhancedField extends CategorizedField {
  rect: EnhancedRect;
  centerX?: number;
  centerY?: number;
  coordinatesEnhanced: boolean;
}

/**
 * Enhance fields with coordinate data from the PDF annotations
 * This uses the cached coordinates when available
 */
function enhanceCoordinates(field: CategorizedField): EnhancedField {
  const cacheKey = `${field.id}-${field.name}`;
  
  // Check if already enhanced and in cache
  if (coordinateCache.has(cacheKey) && enhancedFieldsCache.has(cacheKey)) {
    return coordinateCache.get(cacheKey) as EnhancedField;
  }
  
  // Initialize with default values
  let rect: EnhancedRect = { 
    x: 0, 
    y: 0, 
    width: 0, 
    height: 0, 
    page: field.page,
    right: 0,
    bottom: 0,
    centerX: 0,
    centerY: 0,
    area: 0
  };
  
  // Look for the debugLog entry that matches this field
  try {
    // Check if there's coordinate data for this field name in the debugLog
    const coordData = findCoordinateDataForField(field.name);
    
    if (coordData) {
      // Check if there's a direct result property with coordinates
      if (coordData.result && typeof coordData.result === 'object') {
        const result = coordData.result;
        if (result.x !== undefined && result.y !== undefined && 
            result.width !== undefined && result.height !== undefined) {
          // Use the result coordinates directly
          rect = {
            x: Math.round(result.x * 100) / 100,
            y: Math.round(result.y * 100) / 100,
            width: Math.round(result.width * 100) / 100,
            height: Math.round(result.height * 100) / 100,
            page: field.page,
            right: Math.round((result.x + result.width) * 100) / 100,
            bottom: Math.round((result.y + result.height) * 100) / 100,
            centerX: Math.round((result.x + result.width / 2) * 100) / 100,
            centerY: Math.round((result.y + result.height / 2) * 100) / 100,
            area: Math.round((result.width * result.height) * 100) / 100
          };
        }
      }
      // If no direct result, try to parse from widgetInfo
      else if (coordData.widgetInfo && Array.isArray(coordData.widgetInfo) && coordData.widgetInfo.length > 0) {
        const widget = coordData.widgetInfo[0];
        if (widget.calculated && typeof widget.calculated === 'object') {
          const calculated = widget.calculated;
          if (calculated.x !== undefined && calculated.y !== undefined && 
              calculated.width !== undefined && calculated.height !== undefined) {
            // Use the calculated coordinates
            rect = {
              x: Math.round(calculated.x * 100) / 100,
              y: Math.round(calculated.y * 100) / 100,
              width: Math.round(calculated.width * 100) / 100,
              height: Math.round(calculated.height * 100) / 100,
              page: field.page,
              right: Math.round((calculated.x + calculated.width) * 100) / 100,
              bottom: Math.round((calculated.y + calculated.height) * 100) / 100,
              centerX: Math.round((calculated.x + calculated.width / 2) * 100) / 100,
              centerY: Math.round((calculated.y + calculated.height / 2) * 100) / 100,
              area: Math.round((calculated.width * calculated.height) * 100) / 100
            };
          }
        }
        // Fallback to parsed array if available
        else if (widget.parsed && Array.isArray(widget.parsed) && widget.parsed.length === 4) {
          const [x, y, right, bottom] = widget.parsed;
          
          // Create rectangle from PDF coordinates
          rect = {
            x: Math.round(x * 100) / 100,
            y: Math.round(y * 100) / 100,
            width: Math.round((right - x) * 100) / 100,
            height: Math.round((bottom - y) * 100) / 100,
            page: field.page,
            right: Math.round(right * 100) / 100,
            bottom: Math.round(bottom * 100) / 100,
            centerX: Math.round(((x + right) / 2) * 100) / 100,
            centerY: Math.round(((y + bottom) / 2) * 100) / 100,
            area: Math.round((right - x) * (bottom - y) * 100) / 100
          };
        }
      }
    }
  } catch (error) {
    console.warn(`Error enhancing coordinates for field ${field.name}:`, error);
  }
  
  // Create enhanced field with coordinate data
  const enhancedField: EnhancedField = {
    ...field,
    rect,
    centerX: rect.centerX,
    centerY: rect.centerY,
    coordinatesEnhanced: true
  };
  
  // Cache the enhanced field
  coordinateCache.set(cacheKey, enhancedField);
  enhancedFieldsCache.add(cacheKey);
  
  return enhancedField;
}

/**
 * Enhance field coordinates only once, with caching for efficiency
 */
export function enhanceFieldCoordinatesOnce<T extends PDFField & { coordinatesEnhanced?: boolean }>(
  fields: T[],
  force: boolean = false
): T[] {
  if (!fields || fields.length === 0) return [];
  
  console.log(`Enhancing ${fields.length} fields with coordinate data...`);
  
  const fieldsNeedingEnhancement: T[] = [];
  const alreadyEnhancedFields: T[] = [];
  
  // If not forcing recalculation, identify which fields need enhancement
  if (!force) {
    for (const field of fields) {
      const fieldId = field.id || field.name;
      const isEnhanced = field.coordinatesEnhanced || (fieldId && enhancedFieldsCache.has(fieldId));
      
      if (!isEnhanced || !field.rect) {
        fieldsNeedingEnhancement.push(field);
      } else {
        alreadyEnhancedFields.push(field);
      }
    }
    
    // If all fields are already enhanced, return original array
    if (fieldsNeedingEnhancement.length === 0) {
      console.log(`All ${fields.length} fields are already enhanced.`);
      return fields;
    }
    
    console.log(`Need to enhance ${fieldsNeedingEnhancement.length} fields. ${alreadyEnhancedFields.length} are already enhanced.`);
  } else {
    // Force enhancement for all fields
    fieldsNeedingEnhancement.push(...fields);
    console.log(`Forcing enhancement of all ${fields.length} fields`);
  }
  
  // Process fields needing enhancement
  for (const field of fieldsNeedingEnhancement) {
    const fieldId = field.id || field.name;
    
    // Check cache first
    if (fieldId && coordinateCache.has(fieldId) && !force) {
      const cachedField = coordinateCache.get(fieldId);
      if (cachedField && cachedField.rect) {
        field.rect = { ...cachedField.rect };
        field.coordinatesEnhanced = true;
        enhancedFieldsCache.add(fieldId);
        continue;
      }
    }
    
    // If no valid rect property, initialize one
    if (!field.rect) {
      field.rect = { x: 0, y: 0, width: 0, height: 0 };
    }
    
    // If rect is already fully populated and valid, skip further processing
    if (field.rect.x !== 0 && field.rect.y !== 0 && field.rect.width > 0 && field.rect.height > 0) {
      field.coordinatesEnhanced = true;
      if (fieldId) {
        enhancedFieldsCache.add(fieldId);
        coordinateCache.set(fieldId, field as unknown as EnhancedField);
      }
      continue;
    }
    
    // Otherwise, use the enhanceCoordinates function to fully enhance the field
    const enhancedField = enhanceCoordinates(field as unknown as CategorizedField);
    field.rect = { ...enhancedField.rect };
    field.coordinatesEnhanced = true;
  }
  
  // Show a summary of the results
  let validCoordinates = 0;
  let zeroCoordinates = 0;
  
  for (const field of fieldsNeedingEnhancement) {
    if (field.rect && (field.rect.x !== 0 || field.rect.y !== 0 || field.rect.width !== 0 || field.rect.height !== 0)) {
      validCoordinates++;
    } else {
      zeroCoordinates++;
    }
  }
  
  console.log(`Enhancement summary: ${validCoordinates} fields with valid coordinates, ${zeroCoordinates} fields with zero coordinates`);
  
  // Combine enhanced and already enhanced fields if needed
  return force ? fieldsNeedingEnhancement : [...alreadyEnhancedFields, ...fieldsNeedingEnhancement];
}

/**
 * Clear the coordinate enhancement cache
 */
export function clearCoordinateCache(): void {
  enhancedFieldsCache.clear();
  coordinateCache.clear();
}

// ===== 3. MEMOIZATION IMPLEMENTATION =====

/**
 * Memoize a function to cache its results based on input arguments
 */
export function memoize<T extends (...args: any[]) => any>(
  fn: T,
  keyGenerator?: (...args: Parameters<T>) => string,
  cacheName: string = fn.name || 'anonymous'
): T {
  if (!memoizationCache.has(cacheName)) {
    memoizationCache.set(cacheName, new Map<string, any>());
  }
  
  const cache = memoizationCache.get(cacheName)!;
  
  const defaultKeyGenerator = (...args: Parameters<T>): string => {
    return args.map(arg => {
      if (arg === null || arg === undefined) return String(arg);
      if (typeof arg === 'object') {
        if (Array.isArray(arg)) {
          if (arg.length <= 5) return JSON.stringify(arg);
          return `arr[${arg.length}]:${JSON.stringify(arg.slice(0, 2))}...${JSON.stringify(arg.slice(-2))}`;
        }
        const objWithId = arg as { id?: string | number; name?: string; type?: string };
        if (objWithId.id) return `obj:${objWithId.id}`;
        if (objWithId.name) return `obj:${objWithId.name}`;
        const keys = Object.keys(arg);
        return `${arg.constructor.name}[${keys.length}]`;
      }
      return String(arg);
    }).join('|');
  };
  
  const getKey = keyGenerator || defaultKeyGenerator;
  
  const memoized = function(this: any, ...args: Parameters<T>): ReturnType<T> {
    const key = getKey(...args);
    
    if (cache.has(key)) {
      return cache.get(key) as ReturnType<T>;
    }
    
    const result = fn.apply(this, args);
    cache.set(key, result);
    
    return result;
  } as T;
  
  Object.defineProperties(memoized, {
    memoized: { value: true },
    original: { value: fn },
    cacheName: { value: cacheName },
    clearCache: { value: () => cache.clear() },
    getCacheSize: { value: () => cache.size }
  });
  
  return memoized;
}

/**
 * Clear the entire memoization cache
 */
export function clearMemoizationCache(): void {
  memoizationCache.forEach(cache => cache.clear());
}

// ===== 4. OUTPUT GENERATION IMPLEMENTATION =====

// Get section name from section ID
function getSectionName(sectionId: number): string {
  const sectionNames: Record<number, string> = {
    1: "Full Name",
    2: "Date of Birth",
    3: "Place of Birth",
    4: "Social Security Number",
    5: "Other Names Used",
    6: "Your Identifying Information",
    7: "Your Contact Information",
    8: "U.S. Passport Information",
    9: "Citizenship",
    10: "Dual/Multiple Citizenship & Foreign Passport Info",
    11: "Where You Have Lived",
    12: "Where you went to School",
    13: "Employment Acitivites",
    14: "Selective Service",
    15: "Military History",
    16: "People Who Know You Well",
    17: "Maritial/Relationship Status",
    18: "Relatives",
    19: "Foreign Contacts",
    20: "Foreign Business, Activities, Government Contacts",
    21: "Psycological and Emotional Health",
    22: "Police Record",
    23: "Illegal Use of Drugs and Drug Activity",
    24: "Use of Alcohol",
    25: "Investigations and Clearance",
    26: "Financial Record",
    27: "Use of Information Technology Systems",
    28: "Involvement in Non-Criminal Court Actions",
    29: "Association Record",
    30: "Continuation Space"
  };
  
  
  return sectionNames[sectionId] || `Section ${sectionId}`;
}

/**
 * Output structure for consolidated section data
 */
interface SectionizerOutput {
  metadata: {
    totalFields: number;
    categorizedFields: number;
    unknownFields: number;
    coveragePercentage: number;
    sectionCounts: Record<string, number>;
    processingDate: string;
    version: string;
  };
  sections: Record<string, {
    id: number;
    name: string;
    fields: CategorizedField[];
    stats: {
      count: number;
      coverage: number;
    };
  }>;
}

/**
 * Generate a single consolidated output file with all categorized fields
 */
export async function generateConsolidatedOutput(
  fields: FieldCollection,
  outputPath: string,
  enhanceCoordinates: boolean = true
): Promise<string> {
  const outputDir = path.dirname(outputPath);
  await fsPromises.mkdir(outputDir, { recursive: true });
  
  const output: SectionizerOutput = {
    metadata: {
      totalFields: fields.totalCount,
      categorizedFields: fields.categorizedCount,
      unknownFields: fields.unknownCount,
      coveragePercentage: fields.coveragePercentage,
      sectionCounts: fields.sectionCounts,
      processingDate: new Date().toISOString(),
      version: '2.0.0'
    },
    sections: {}
  };
  
  const sectionIds = Object.keys(fields.sectionCounts);
  
  for (const sectionKey of sectionIds) {
    const sectionId = parseInt(sectionKey, 10);
    const sectionFields = fields.getFieldsForSection(sectionId);
    
    if (sectionFields.length === 0) continue;
    
    const processedFields = enhanceCoordinates ? 
      enhanceFieldCoordinatesOnce(sectionFields) : 
      sectionFields;
    
    const coverage = fields.totalCount > 0 ? 
      (processedFields.length / fields.totalCount) * 100 : 0;
    
    output.sections[sectionKey] = {
      id: sectionId,
      name: getSectionName(sectionId),
      fields: processedFields,
      stats: {
        count: processedFields.length,
        coverage
      }
    };
  }
  
  await fsPromises.writeFile(
    outputPath, 
    JSON.stringify(output, null, 2),
    { encoding: 'utf8' }
  );
  
  return outputPath;
}

/**
 * Generate a single extracted-fields.json file with all fields
 */
export async function generateExtractedFieldsJson(
  fields: FieldCollection,
  outputPath: string,
  enhanceCoordinates: boolean = true
): Promise<string> {
  const outputDir = path.dirname(outputPath);
  await fsPromises.mkdir(outputDir, { recursive: true });
  
  const allFields = fields.fields;
  
  const processedFields = enhanceCoordinates ? 
    enhanceFieldCoordinatesOnce(allFields) : 
    allFields;
    
  // Log how many fields have subsection or entry
  const fieldsWithSubsection = processedFields.filter(f => f.subsection !== undefined).length;
  const fieldsWithEntry = processedFields.filter(f => f.entry !== undefined).length;
  console.log(`Final extraction: ${fieldsWithSubsection} fields with subsection, ${fieldsWithEntry} with entry`);
  
  if (fieldsWithSubsection > 0) {
    console.log('Sample subsection values:');
    processedFields
      .filter(f => f.subsection !== undefined)
      .slice(0, 3)
      .forEach(f => console.log(`Field ${f.name}: subsection=${f.subsection}`));
  }
  
  // Remove the 'required' property from all fields
  const fieldsWithoutRequired = processedFields.map(field => {
    // Create a new object without the 'required' property
    const { required, ...fieldWithoutRequired } = field;
    
    // Ensure subsection and entry are included
    return {
      ...fieldWithoutRequired,
      subsection: field.subsection,
      entry: field.entry
    };
  });
  
  // Write the JSON file
  await fsPromises.writeFile(outputPath, JSON.stringify(fieldsWithoutRequired, null, 2), 'utf8');
  
  return outputPath;
}

// ===== 5. OPTIMIZED PIPELINE IMPLEMENTATION =====

/**
 * Options for the optimized processing pipeline
 */
export interface OptimizedPipelineOptions {
  selfHealing: boolean;
  validateCounts: boolean;
  outputDir: string;
  outputFormat: 'consolidated' | 'extracted' | 'both';
  enhanceCoordinates: boolean;
  maxIterations: number;
  logLevel: 'debug' | 'info' | 'warn' | 'error';
}

/**
 * Memoized version of the categorizeFields function for improved performance
 */
export const categorizeFields = memoize(originalCategorizeFields, 
  (fields) => `fields[${fields.length}]`,
  'categorizeFields'
);

/**
 * Load coordinate data from debug log
 * @returns Array of coordinate data records
 */
async function loadCoordinateDebugLog(): Promise<Record<string, any>[]> {
  try {
    const debugLogPath = path.join(process.cwd(), 'output', 'coordinate-extraction-debug.json');
    
    try {
      const data = await fsPromises.readFile(debugLogPath, 'utf8');
      return JSON.parse(data);
    } catch (err) {
      console.warn('Debug log not found, coordinates will not be enhanced:', err);
      return [];
    }
  } catch (err) {
    console.warn('Error loading coordinate debug log:', err);
    return [];
  }
}

/**
 * Initialize coordinate debug log
 * This should be called before processing fields
 */
async function initializeCoordinateDebugLog(): Promise<void> {
  try {
    console.log('Initializing coordinate debug log...');
    const debugLog = await loadCoordinateDebugLog();
    if (debugLog.length > 0) {
      coordinateDebugLog = debugLog;
      console.log(`Loaded ${coordinateDebugLog.length} coordinate entries from debug log`);
    } else {
      console.warn('No coordinate data found in debug log');
    }
  } catch (err) {
    console.warn('Error initializing coordinate debug log:', err);
  }
}

/**
 * Process section data and output directly to extracted-fields.json
 * This is a streamlined function that bypasses intermediate file creation
 */
export async function processSectionData(
  inputFields: PDFField[],
  outputPath: string = path.join(process.cwd(), 'output', 'extracted-fields.json'),
  options: Partial<OptimizedPipelineOptions> = {}
): Promise<string> {
  // Track performance
  const startTime = process.hrtime();
  
  // Initialize rule engine
  const engine = new RuleEngine();
  await engine.loadRules();
  
  // Initialize coordinate debug log if needed
  if (options.enhanceCoordinates !== false) {
    await initializeCoordinateDebugLog();
  }
  
  // Create field collection
  const fieldCollection = new FieldCollection();
  
  // Process in batches for large datasets
  const batchSize = 1000;
  const totalFields = inputFields.length;
  let processedCount = 0;
  
  // Log processing start
  console.log(`Processing ${totalFields} fields directly to ${outputPath}`);
  
  // Process in batches to avoid memory issues with large datasets
  for (let i = 0; i < totalFields; i += batchSize) {
    const batchEnd = Math.min(i + batchSize, totalFields);
    const batch = inputFields.slice(i, batchEnd);
    
    // Enhance fields with coordinates (once)
    const enhancedBatch = options.enhanceCoordinates !== false ? 
      enhanceFieldCoordinatesOnce(batch) : batch;
    
    // Categorize fields
    const categorizedFields = (engine && typeof engine.categorizeFields === 'function')
      ? engine.categorizeFields(enhancedBatch)
      : categorizeFields(enhancedBatch);
    
    // Add to field collection
    fieldCollection.addFields(categorizedFields);
    
    // Update processed count
    processedCount += batch.length;
    
    // Log progress
    if (processedCount % 5000 === 0 || processedCount === totalFields) {
      const progressPercent = (processedCount / totalFields * 100).toFixed(1);
      console.log(`Processed ${processedCount}/${totalFields} fields (${progressPercent}%)`);
    }
  }
  
  // Apply self-healing if enabled
  if (options.selfHealing !== false) {
    await applySelfHealing(
      fieldCollection, 
      engine, 
      options.maxIterations || DEFAULT_PIPELINE_OPTIONS.maxIterations
    );
  }
  
  // Create output directory if it doesn't exist
  const outputDir = path.dirname(outputPath);
  await fsPromises.mkdir(outputDir, { recursive: true });
  
  // Generate output file directly (no intermediate files)
  await generateExtractedFieldsJson(
    fieldCollection,
    outputPath,
    options.enhanceCoordinates !== false
  );
  
  // Calculate processing time
  const [seconds, nanoseconds] = process.hrtime(startTime);
  const totalMs = (seconds * 1000) + (nanoseconds / 1000000);
  
  // Log performance metrics
  console.log(`
=== Performance Metrics ===
Total fields processed: ${totalFields}
Processing time: ${(totalMs / 1000).toFixed(2)} seconds
Fields per second: ${Math.round(totalFields / (totalMs / 1000))}
Output file: ${outputPath}
Coverage: ${fieldCollection.coveragePercentage.toFixed(1)}%
Categorized: ${fieldCollection.categorizedCount} fields
Unknown: ${fieldCollection.unknownCount} fields
  `);
  
  return outputPath;
}

/**
 * Process fields through the optimized pipeline
 */
export async function processFieldsOptimized(
  fields: PDFField[],
  options: Partial<OptimizedPipelineOptions> = {},
  ruleEngine?: RuleEngine
): Promise<string[]> {
  console.log(`Processing ${fields.length} fields with optimized pipeline...`);
  
  // Combine default options with provided options
  const pipelineOptions: OptimizedPipelineOptions = {
    ...DEFAULT_PIPELINE_OPTIONS,
    ...options
  };
  
  // Initialize coordinate debug log if needed
  if (pipelineOptions.enhanceCoordinates) {
    await initializeCoordinateDebugLog();
  }
  
  // Initialize the rule engine if not provided
  const engine = ruleEngine || new RuleEngine();
  if (!ruleEngine) {
    await engine.loadRules();
  }
  
  // Clear caches at the start of processing
  clearCoordinateCache();
  clearMemoizationCache();
  
  // Create the output directory
  await fsPromises.mkdir(pipelineOptions.outputDir, { recursive: true });
  
  // Step 1: Enhance fields with coordinates (once)
  let processedFields = fields;
  
  if (pipelineOptions.enhanceCoordinates) {
    processedFields = enhanceFieldCoordinatesOnce(fields);
  }
  
  // Step 2: Categorize fields
  const categorizedFields = (engine && typeof engine.categorizeFields === 'function')
    ? engine.categorizeFields(processedFields)
    : categorizeFields(processedFields);
  
  // Debug: Count fields with subsection or entry values
  const fieldsWithSubsection = categorizedFields.filter(f => f.subsection !== undefined).length;
  const fieldsWithEntry = categorizedFields.filter(f => f.entry !== undefined).length;
  console.log(`DEBUG: Found ${fieldsWithSubsection} fields with subsection values and ${fieldsWithEntry} fields with entry values`);
  
  if (fieldsWithSubsection > 0 || fieldsWithEntry > 0) {
    console.log('Sample fields with subsection or entry:');
    categorizedFields
      .filter(f => f.subsection !== undefined || f.entry !== undefined)
      .slice(0, 5)
      .forEach(f => {
        console.log(`Field: ${f.name}, Section: ${f.section}, Subsection: ${f.subsection}, Entry: ${f.entry}`);
      });
  }
  
  // Step 3: Create field collection for efficient processing
  const fieldCollection = new FieldCollection(categorizedFields);
  
  // Step 4: Apply self-healing if enabled
  if (pipelineOptions.selfHealing) {
    await applySelfHealing(fieldCollection, engine, pipelineOptions.maxIterations);
  }
  
  // Step 5: Generate output file(s)
  const outputFiles: string[] = [];
  
  if (pipelineOptions.outputFormat === 'consolidated' || pipelineOptions.outputFormat === 'both') {
    const consolidatedPath = path.join(pipelineOptions.outputDir, 'section-data.json');
    const outputPath = await generateConsolidatedOutput(
      fieldCollection,
      consolidatedPath,
      pipelineOptions.enhanceCoordinates
    );
    outputFiles.push(outputPath);
  }
  
  if (pipelineOptions.outputFormat === 'extracted' || pipelineOptions.outputFormat === 'both') {
    const extractedPath = path.join(pipelineOptions.outputDir, 'extracted-fields.json');
    const outputPath = await generateExtractedFieldsJson(
      fieldCollection,
      extractedPath,
      pipelineOptions.enhanceCoordinates
    );
    outputFiles.push(outputPath);
  }
  
  return outputFiles;
}

/**
 * Apply self-healing to improve field categorization
 * This function modifies the field collection in-place
 */
async function applySelfHealing(
  fields: FieldCollection,
  engine: RuleEngine,
  maxIterations: number
): Promise<void> {
  // Import the ConsolidatedSelfHealingManager dynamically to avoid circular dependencies
  const { runConsolidatedSelfHealing } = await import('./consolidated-self-healing.js');
  
  // Get unknown fields (section 0)
  const unknownFields = fields.getFieldsForSection(0);
  
  if (unknownFields.length === 0) {
    console.log('No unknown fields to process for self-healing.');
    return;
  }
  
  // Organize fields by section for the self-healing algorithm
  const sectionFields: Record<string, CategorizedField[]> = {};
  
  // First, populate with the existing sections from the collection
  for (const section of Object.keys(fields.sectionCounts)) {
    sectionFields[section] = fields.getFieldsForSection(parseInt(section, 10));
  }
  
  // Ensure section 0 exists
  if (!sectionFields['0']) {
    sectionFields['0'] = [];
  }
  
  // Add unknown fields to section 0
  sectionFields['0'] = unknownFields;
  
  // Process fields to improve categorization
  const healingResult = await runConsolidatedSelfHealing(
    engine, 
    sectionFields,
    {}, // No reference counts for now
    undefined, // No output path
    0.3 // Default deviation threshold
  );
  
  // If we have improved fields, update the field collection
  if (healingResult.corrections > 0 || healingResult.rulesGenerated > 0) {
    console.log(`Self-healing made ${healingResult.corrections} corrections and generated ${healingResult.rulesGenerated} rules`);
    
    // Clear existing fields and add the improved fields
    fields.transformFields(() => {
      // No-op, just to trigger rebuildSectionMap
    });
    
    // Extract all fields from the result
    const improvedFields: CategorizedField[] = [];
    Object.values(healingResult.finalSectionFields).forEach(sectionFields => {
      improvedFields.push(...sectionFields);
    });
    
    // Re-add the improved fields
    fields.addFields(improvedFields);
  } else {
    console.log('Self-healing did not improve any fields.');
  }
}

/**
 * Log performance metrics for a processing step
 */
export function reportPerformance(
  label: string,
  startTime: [number, number],
  data?: { count?: number; details?: string }
): void {
  const [seconds, nanoseconds] = process.hrtime(startTime);
  const totalMs = (seconds * 1000) + (nanoseconds / 1000000);
  
  let message = `${label}: ${totalMs.toFixed(2)}ms`;
  
  if (data?.count) {
    message += ` | ${data.count} items`;
    message += ` | ${(data.count / (totalMs / 1000)).toFixed(0)} items/sec`;
  }
  
  if (data?.details) {
    message += ` | ${data.details}`;
  }
  
  console.log(message);
} 