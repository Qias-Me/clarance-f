/**
 * Field clustering for SF-86 form fields
 * 
 * This module implements advanced field clustering based on naming conventions
 * to help identify groups of related fields that should be processed together.
 */

import type { CategorizedField } from './extractFieldsBySection.js';
import chalk from 'chalk';

/**
 * Estimated field counts per section based on PDF analysis and manual review
 * Key is the section number, value is the expected number of fields
 * the entires and subsections are not yet implemented
 * the fields are still a bit scewed.
 */
export const expectedFieldCounts: Record<number, { fields: number, entries: number, subsections: number }> = {
  1: { fields: 4, entries: 0, subsections: 0 },
  2: { fields: 2, entries: 0, subsections: 0 },
  3: { fields: 4, entries: 0, subsections: 0 },
  4: { fields: 136, entries: 0, subsections: 0 },
  5: { fields: 45, entries: 4, subsections: 0 },
  6: { fields: 6, entries: 0, subsections: 0 },
  7: { fields: 17, entries: 0, subsections: 0 },
  8: { fields: 10, entries: 0, subsections: 0 },
  9: { fields: 78, entries: 0, subsections: 0 },
  10: { fields: 122, entries: 0, subsections: 4 },
  11: { fields: 252, entries: 0, subsections: 0 },
  12: { fields: 118, entries: 0, subsections: 0 },
  13: { fields: 1086, entries: 0, subsections: 0 },
  14: { fields: 5, entries: 0, subsections: 0 },
  15: { fields: 60, entries: 0, subsections: 0 },
  16: { fields: 154, entries: 0, subsections: 0 },
  17: { fields: 332, entries: 0, subsections: 0 },
  18: { fields: 964, entries: 0, subsections: 0 },
  19: { fields: 277, entries: 0, subsections: 0 },
  20: { fields: 570, entries: 0, subsections: 0 },
  21: { fields: 486, entries: 0, subsections: 0 },
  22: { fields: 267, entries: 0, subsections: 0 },
  23: { fields: 191, entries: 0, subsections: 0 },
  24: { fields: 160, entries: 0, subsections: 0 },
  25: { fields: 79, entries: 0, subsections: 0 },
  26: { fields: 237, entries: 0, subsections: 0 },
  27: { fields: 57, entries: 0, subsections: 0 },
  28: { fields: 23, entries: 0, subsections: 0 },
  29: { fields: 141, entries: 0, subsections: 0 },
  30: { fields: 25, entries: 0, subsections: 0 },
};

// Import section field patterns
export const sectionFieldPatterns: Record<number, RegExp[]> = {
  1: [
    /form1\[0\]\.Sections1-6\[0\]\.TextField11\[0\]/i, // Last name
    /form1\[0\]\.Sections1-6\[0\]\.TextField11\[1\]/i, // First name
    /form1\[0\]\.Sections1-6\[0\]\.TextField11\[2\]/i, // Middle name
    /form1\[0\]\.Sections1-6\[0\]\.suffix\[0\]/i, // Name suffix
  ],
  2: [
    /form1\[0\]\.Sections1-6\[0\]\.From_Datefield_Name_2\[0\]/i, // Date of Birth field
    /form1\[0\]\.Sections1-6\[0\]\.#field\[18\]/i, // Second DOB field
  ],
  3: [
    /Section 3/,
    /Place of Birth/,
    /BirthCity/,
    /County/,
    /form1\[0\]\.Sections1-6\[0\]\.TextField11\[3\]/i, // Birth city
    /form1\[0\]\.Sections1-6\[0\]\.TextField11\[4\]/i, // Birth county
    /form1\[0\]\.Sections1-6\[0\]\.School6_State\[0\]/i, // Birth state
    /form1\[0\]\.Sections1-6\[0\]\.DropDownList1\[0\]/i,
  ],
  4: [
    /Section 4/,
    /Social Security Number/,
    /^form1\[0\]\.Sections1-6\[0\]\.SSN/,
    /^SSN\[/,
    /form1\[0\]\.Sections1-6\[0\]\.SSN\[0\]/i, // Primary SSN field
    /form1\[0\]\.Sections1-6\[0\]\.SSN\[1\]/i, // Secondary SSN field
    /SSN\[\d+\]/i,
  ],
  5: [/form1\[0\]\.Sections1-6\[0\]\.section5\[0\]/],
  6: [
    // STRICT: Only these 6 specific fields should be in section 6
    /form1\[0\]\.Sections1-6\[0\]\.DropDownList7\[0\]/i, // Height in inches
    /form1\[0\]\.Sections1-6\[0\]\.DropDownList8\[0\]/i, // Height in feets
    /form1\[0\]\.Sections1-6\[0\]\.DropDownList9\[0\]/i, // Eye color
    /form1\[0\]\.Sections1-6\[0\]\.DropDownList10\[0\]/i, // Hair color
    /form1\[0\]\.Sections1-6\[0\]\.p3-rb3b\[0\]/i, // Sex Male or Female
    /form1\[0\]\.Sections1-6\[0\]\.TextField11\[5\]/i, // Wieght in pounds
  ],
  7: [
    /p3-t68\[2\]/i,
    /phone/i,
    /email/i,
    /contact/i
  ],
  8: [
    /passport/i,
    /travel/i,
    /form1\[0\]\.Sections7-9\[0\]\.Section8/i
  ],
  9: [
    /citizenship/i,
    /citizen/i,
    /form1\[0\]\.Sections7-9\[0\]\.Section9/i
  ],
  // Add patterns for section 13 (Employment)
  13: [
    /employment/i,
    /employer/i,
    /job title/i,
    /position/i,
    /salary/i,
    /supervisor/i,
    /work(ed)?/i, 
    /duties/i,
    /occupation/i,
    /form1\[0\]\.Section13/i,
    /form1\[0\]\.section13/i,
    /form1\[0\]\.employment/i,
    /section ?13/i,
    /\bsect ?13\b/i
  ],
  // Add patterns for section 16 (References)
  16: [
    /references/i,
    /people who know/i,
    /know (you )?well/i,
    /verifiers?/i,
    /form1\[0\]\.Section16/i, 
    /form1\[0\]\.section16/i,
    /reference\d+/i,
    /section ?16/i,
    /\bsect ?16\b/i
  ],
  // Adding more accurate patterns for other sections
  29: [
    /association/i,
    /organization/i,
    /membership/i,
    /^form1\[0\]\.Section29/i
  ]
};

// Define section keywords for content matching
const sectionKeywords: Record<number, string[]> = {
  1: ["name", "last", "first", "middle", "suffix"],
  2: ["birth", "dob", "date of birth"],
  3: ["place of birth", "city", "county", "country"],
  4: ["ssn", "social security", "number"],
  5: ["other names", "used", "maiden", "nickname"],
  6: ["height", "weight", "hair", "eye", "color", "sex", "gender"],
  7: ["phone", "email", "address", "contact"],
  8: ["passport", "travel", "document", "expiration"],
  9: ["citizenship", "nationality", "birth", "citizen"],
  10: ["dual", "multiple", "citizenship", "foreign", "passport"],
  11: ["residence", "address", "lived", "own", "rent"],
  12: ["education", "school", "college", "university", "degree"],
  13: ["employment", "employer", "job", "work", "position"],
  14: ["selective", "service", "register", "registration"],
  15: ["military", "service", "army", "navy", "air force", "marines", "coast guard"],
  16: ["people", "know", "references", "verifier", "verifiers"],
  17: ["marital", "relationship", "spouse", "cohabitant", "partner"],
  18: ["relatives", "family", "father", "mother", "sibling", "child", "children"],
  19: ["foreign", "contact", "contacts", "relationship", "allegiance"],
  20: ["foreign", "activity", "activities", "business", "government"],
  21: ["psychological", "mental", "health", "counseling", "treatment"],
  22: ["police", "record", "arrest", "criminal", "offense"],
  23: ["drug", "illegal", "controlled", "substance", "misuse"],
  24: ["alcohol", "abuse", "treatment", "counseling"],
  25: ["investigation", "clearance", "security", "classified"],
  26: ["financial", "debt", "bankruptcy", "delinquent", "taxes"],
  27: ["technology", "computer", "unauthorized", "illegal", "system"],
  28: ["civil", "court", "action", "lawsuit", "legal"],
  29: ["association", "record", "organization", "membership", "terror"],
  30: ["continuation", "additional", "information", "comments"]
};



// Define more accurate section page ranges based on validation
export const sectionPageRanges: Record<number, [number, number]> = {
  1: [5, 5], // Full Name (1 page)
  2: [5, 5], // Date of Birth (1 page)
  3: [5, 5], // Place of Birth (1 page)
  4: [5, 5], // Social Security Number (1 page)
  5: [5, 5], // Other Names Used (1 page)
  6: [5, 5], // Your Identifying Information (1 page)
  7: [6, 6], // Your Contact Information (1 page)
  8: [6, 6], // U.S. Passport Information (1 page)
  9: [6, 7], // Citizenship (2 pages)
  10: [8, 9], // Dual/Multiple Citizenship & Foreign Passport Info (2 pages)
  11: [10, 13], // Where You Have Lived (4 pages)
  12: [14, 16], // Where you went to School (3 pages)
  13: [17, 33], // Employment Activities (17 pages)
  14: [34, 34], // Selective Service (1 page)
  15: [34, 37], // Military History (4 pages)
  16: [38, 38], // People Who Know You Well (1 page)
  17: [39, 44], // Marital/Relationship Status (6 pages)
  18: [45, 62], // Relatives (18 pages)
  19: [63, 66], // Foreign Contacts (4 pages)
  20: [67, 87], // Foreign Business, Activities, Government Contacts (21 pages)
  21: [88, 97], // Psychological and Emotional Health (10 pages)
  22: [98, 104], // Police Record (7 pages)
  23: [105, 111], // Illegal Use of Drugs and Drug Activity (7 pages)
  24: [112, 115], // Use of Alcohol (4 pages)
  25: [116, 117], // Investigations and Clearance (2 pages)
  26: [118, 124], // Financial Record (7 pages)
  27: [125, 126], // Use of Information Technology Systems (2 pages)
  28: [127, 127], // Involvement in Non-Criminal Court Actions (1 page)
  29: [128, 132], // Association Record (5 pages)
  30: [133, 136], // Continuation Space (4 pages)
};

/**
 * Field cluster result interface
 */
export interface FieldCluster {
  /** Name or pattern of the cluster */
  pattern: string;
  /** Fields belonging to this cluster */
  fields: CategorizedField[];
  /** Confidence score (0-1) */
  confidence: number;
  /** Description of the cluster pattern */
  description: string;
  /** Suggested section if known */
  suggestedSection?: number;
}

/**
 * Field clustering options
 */
export interface ClusteringOptions {
  /** Minimum similarity required to group fields (0-1) */
  similarityThreshold?: number;
  /** Minimum size of a cluster to be considered significant */
  minClusterSize?: number;
  /** Maximum size for a cluster (larger clusters will be subdivided) */
  maxClusterSize?: number;
  /** Whether to use advanced NLP for clustering */
  useAdvancedNLP?: boolean;
  /** Whether to analyze field values in addition to names */
  analyzeValues?: boolean;
  /** Whether to use positional information (pages) in clustering */
  usePositionalInfo?: boolean;
}

/**
 * Field clusterer for grouping SF-86 form fields based on naming patterns
 */
export class FieldClusterer {
  // Default options for clustering
  private readonly defaultOptions: Required<ClusteringOptions> = {
    similarityThreshold: 0.7,
    minClusterSize: 3,
    maxClusterSize: 30,
    useAdvancedNLP: false,
    analyzeValues: true,
    usePositionalInfo: true
  };
  
  // Common field name patterns derived from enhanced-pdf-validation.ts
  private readonly commonPatterns = {
    // Direct section references
    sectionRef: /section(\d+)[._]?(\d+)?/i,
    sectionRange: /sections(\d+)-(\d+)/i,
    // Field indexing patterns
    indexedField: /(\w+)\[(\d+)\]/,
    nestedIndex: /(\w+)\[(\d+)\]\.(\w+)\[(\d+)\]/,
    // SF-86 specific patterns
    subsectionDot: /(\d+)\.(\d+)/,
    subsectionUnderscore: /(\d+)_(\d+)/,
    // Form pattern: form1[0].Section5[0].someField[0]
    formPattern: /form1\[0\]\.(\w+)\[0\]\.(\w+)/i
  };
  
  // Common prefixes in field names
  private readonly commonPrefixes = [
    'TextField', 'CheckBox', 'DropDownList', 'RadioButton',
    'Date', 'SSN', 'Email', 'Phone', 'Address',
    'Name', 'Birth', 'Citizenship', 'Employment'
  ];
  
  // Common suffixes in field names
  private readonly commonSuffixes = [
    'Name', 'Date', 'ID', 'Number', 'Code', 'Status',
    'City', 'State', 'Zip', 'Country', 'Street',
    'First', 'Last', 'Middle', 'Full', 'Suffix'
  ];
  
  /**
   * Create a new field clusterer
   * @param options Clustering options
   */
  constructor(private options: ClusteringOptions = {}) {
    // Merge with default options
    this.options = {
      ...this.defaultOptions,
      ...options
    };
  }
  
  /**
   * Cluster fields based on naming patterns
   * 
   * @param fields Fields to cluster
   * @param options Optional clustering options to override instance options
   * @returns Array of field clusters
   */
  public clusterFields(
    fields: CategorizedField[],
    options?: ClusteringOptions
  ): FieldCluster[] {
    // Merge options
    const mergedOptions: Required<ClusteringOptions> = {
      ...this.defaultOptions,
      ...this.options,
      ...options
    };
    
    // Skip if no fields
    if (!fields || fields.length === 0) {
      return [];
    }
    
    console.log(chalk.cyan(`Starting field clustering for ${fields.length} fields`));
    
    // Step 1: Extract naming patterns from fields
    const patterns = this.extractNamePatterns(fields);
    console.log(chalk.cyan(`Extracted ${patterns.size} distinct patterns`));
    
    // Step 2: Group fields by primary pattern
    const initialClusters = this.groupFieldsByPrimaryPattern(fields, patterns, mergedOptions);
    console.log(chalk.cyan(`Created ${initialClusters.length} initial clusters`));
    
    // Step 3: Refine clusters - split large ones, merge similar ones
    const refinedClusters = this.refineClusters(initialClusters, mergedOptions);
    console.log(chalk.cyan(`Refined into ${refinedClusters.length} clusters`));
    
    // Step 4: Calculate confidence for each cluster
    const scoredClusters = this.calculateClusterConfidence(refinedClusters);
    console.log(chalk.cyan(`Final clusters: ${scoredClusters.length}`));
    
    // Sort clusters by confidence (descending)
    return scoredClusters.sort((a, b) => b.confidence - a.confidence);
  }
  
  /**
   * Extract name patterns from fields
   * 
   * @param fields Fields to analyze
   * @returns Map of pattern to matching field names
   */
  private extractNamePatterns(fields: CategorizedField[]): Map<string, string[]> {
    // Hold patterns with field names that match
    const patternMap = new Map<string, string[]>();
    
    // Process each field
    for (const field of fields) {
      const fieldName = field.name;
      
      // Try each pattern matcher
      
      // 1. Check for direct section reference
      const sectionRefMatch = fieldName.match(this.commonPatterns.sectionRef);
      if (sectionRefMatch) {
        const section = sectionRefMatch[1];
        const subsection = sectionRefMatch[2] || "";
        const pattern = subsection ? `section${section}_${subsection}` : `section${section}`;
        this.addToPatternMap(patternMap, pattern, fieldName);
        continue;
      }
      
      // 2. Check for section range
      const sectionRangeMatch = fieldName.match(this.commonPatterns.sectionRange);
      if (sectionRangeMatch) {
        const pattern = `sections${sectionRangeMatch[1]}-${sectionRangeMatch[2]}`;
        this.addToPatternMap(patternMap, pattern, fieldName);
        continue;
      }
      
      // 3. Check for form pattern
      const formMatch = fieldName.match(this.commonPatterns.formPattern);
      if (formMatch) {
        const section = formMatch[1];
        const field = formMatch[2];
        const pattern = `form.${section}.${field}`;
        this.addToPatternMap(patternMap, pattern, fieldName);
        continue;
      }
      
      // 4. Check for indexed fields
      const indexMatch = fieldName.match(this.commonPatterns.indexedField);
      if (indexMatch) {
        const baseField = indexMatch[1];
        // Create pattern with [idx] placeholder
        const pattern = `${baseField}[idx]`;
        this.addToPatternMap(patternMap, pattern, fieldName);
        continue;
      }
      
      // 5. Extract common prefix if found
      const prefix = this.commonPrefixes.find(p => fieldName.startsWith(p));
      if (prefix) {
        const pattern = `prefix:${prefix}`;
        this.addToPatternMap(patternMap, pattern, fieldName);
        continue;
      }
      
      // 6. Extract common suffix if found
      const suffix = this.commonSuffixes.find(s => fieldName.endsWith(s));
      if (suffix) {
        const pattern = `suffix:${suffix}`;
        this.addToPatternMap(patternMap, pattern, fieldName);
        continue;
      }
      
      // Default pattern - use first part of name (up to first digit or special char)
      const defaultPattern = fieldName.replace(/[^a-zA-Z].*$/, '');
      if (defaultPattern && defaultPattern !== fieldName) {
        this.addToPatternMap(patternMap, `base:${defaultPattern}`, fieldName);
      } else {
        // For fields that didn't match any pattern, use a general bucket
        this.addToPatternMap(patternMap, 'other', fieldName);
      }
    }
    
    return patternMap;
  }
  
  /**
   * Helper to add field to pattern map
   */
  private addToPatternMap(map: Map<string, string[]>, pattern: string, fieldName: string): void {
    if (!map.has(pattern)) {
      map.set(pattern, []);
    }
    map.get(pattern)!.push(fieldName);
  }
  
  /**
   * Group fields by primary pattern
   * 
   * @param fields All fields to group
   * @param patterns Pattern map from extractNamePatterns
   * @param options Clustering options
   * @returns Initial field clusters
   */
  private groupFieldsByPrimaryPattern(
    fields: CategorizedField[],
    patterns: Map<string, string[]>,
    options: Required<ClusteringOptions>
  ): FieldCluster[] {
    const clusters: FieldCluster[] = [];
    const fieldMap = new Map<string, CategorizedField>();
    
    // Create a lookup map for fields by name
    fields.forEach(field => fieldMap.set(field.name, field));
    
    // Process each pattern
    for (const [pattern, fieldNames] of patterns.entries()) {
      // Skip patterns with too few fields
      if (fieldNames.length < options.minClusterSize) {
        continue;
      }
      
      // Create cluster fields array
      const clusterFields = fieldNames
        .map(name => fieldMap.get(name))
        .filter(Boolean) as CategorizedField[];
      
      // Skip if we don't have enough fields
      if (clusterFields.length < options.minClusterSize) {
        continue;
      }
      
      // Generate description for this pattern
      const description = this.generatePatternDescription(pattern);
      
      // Create the cluster
      const cluster: FieldCluster = {
        pattern,
        fields: clusterFields,
        confidence: 0.5, // Initial confidence
        description
      };
      
      // Try to determine section for this cluster
      const suggestedSection = this.suggestSectionForCluster(cluster);
      if (suggestedSection && suggestedSection.confidence > 0.6) {
        cluster.suggestedSection = suggestedSection.section;
      }
      
      clusters.push(cluster);
    }
    
    return clusters;
  }
  
  /**
   * Generate human-readable description for a pattern
   * 
   * @param pattern The pattern string
   * @returns Human-readable description
   */
  private generatePatternDescription(pattern: string): string {
    // Handle special pattern prefixes
    if (pattern.startsWith('section')) {
      // Extract section number
      const match = pattern.match(/section(\d+)(?:_(\d+))?/);
      if (match) {
        const section = match[1];
        const subsection = match[2];
        
        if (subsection) {
          return `Section ${section}.${subsection} fields`;
        }
        return `Section ${section} fields`;
      }
      return `Section fields`;
    }
    
    if (pattern.startsWith('sections')) {
      const match = pattern.match(/sections(\d+)-(\d+)/);
      if (match) {
        return `Sections ${match[1]}-${match[2]} range`;
      }
      return `Multiple sections range`;
    }
    
    if (pattern.startsWith('form.')) {
      const parts = pattern.split('.');
      if (parts.length >= 3) {
        return `Form fields: ${parts[1]} - ${parts[2]}`;
      }
      return `Form fields: ${pattern}`;
    }
    
    if (pattern.startsWith('prefix:')) {
      return `Fields with prefix: ${pattern.substring(7)}`;
    }
    
    if (pattern.startsWith('suffix:')) {
      return `Fields with suffix: ${pattern.substring(7)}`;
    }
    
    if (pattern.startsWith('base:')) {
      return `Base name: ${pattern.substring(5)}`;
    }
    
    if (pattern.includes('[idx]')) {
      return `Indexed fields: ${pattern.replace('[idx]', '')}`;
    }
    
    return `Pattern: ${pattern}`;
  }
  
  /**
   * Refine clusters by splitting large ones and merging similar ones
   * 
   * @param clusters Initial clusters to refine
   * @param options Clustering options
   * @returns Refined clusters
   */
  private refineClusters(
    clusters: FieldCluster[],
    options: Required<ClusteringOptions>
  ): FieldCluster[] {
    const result: FieldCluster[] = [];
    
    // First, split large clusters
    for (const cluster of clusters) {
      if (cluster.fields.length > options.maxClusterSize) {
        // This cluster is too large, subdivide it
        const subClusters = this.subdivideCluster(cluster, options);
        result.push(...subClusters);
      } else {
        // Keep as is
        result.push(cluster);
      }
    }
    
    return result;
  }
  
  /**
   * Subdivide a large cluster into smaller ones
   * 
   * @param cluster Large cluster to subdivide
   * @param options Clustering options
   * @returns Array of smaller clusters
   */
  private subdivideCluster(
    cluster: FieldCluster,
    options: Required<ClusteringOptions>
  ): FieldCluster[] {
    const result: FieldCluster[] = [];
    
    // Try different subdivision strategies
    
    // 1. Try to subdivide by page
    if (options.usePositionalInfo) {
      const fieldsByPage: Record<number, CategorizedField[]> = {};
      
      // Group fields by page
      for (const field of cluster.fields) {
        if (field.page) {
          if (!fieldsByPage[field.page]) {
            fieldsByPage[field.page] = [];
          }
          fieldsByPage[field.page].push(field);
        }
      }
      
      // Create clusters for pages with enough fields
      for (const [page, pageFields] of Object.entries(fieldsByPage)) {
        if (pageFields.length >= options.minClusterSize) {
          result.push({
            pattern: `${cluster.pattern}_page${page}`,
            fields: pageFields,
            confidence: 0.6, // Slightly higher than default
            description: `${cluster.description} on page ${page}`
          });
        }
      }
      
      // If we successfully subdivided, return the result
      if (result.length > 0) {
        return result;
      }
    }
    
    // 2. Try to subdivide by field type
    const fieldsByType: Record<string, CategorizedField[]> = {};
    
    // Group fields by type
    for (const field of cluster.fields) {
      const type = field.type || 'unknown';
      if (!fieldsByType[type]) {
        fieldsByType[type] = [];
      }
      fieldsByType[type].push(field);
    }
    
    // Create clusters for types with enough fields
    for (const [type, typeFields] of Object.entries(fieldsByType)) {
      if (typeFields.length >= options.minClusterSize) {
        result.push({
          pattern: `${cluster.pattern}_${type}`,
          fields: typeFields,
          confidence: 0.55,
          description: `${cluster.description} (${type})`
        });
      }
    }
    
    // If we successfully subdivided, return the result
    if (result.length > 0) {
      return result;
    }
    
    // 3. If all subdivision strategies failed, just split the cluster arbitrarily
    const chunks: CategorizedField[][] = [];
    const chunkSize = options.maxClusterSize;
    
    for (let i = 0; i < cluster.fields.length; i += chunkSize) {
      chunks.push(cluster.fields.slice(i, i + chunkSize));
    }
    
    // Create clusters for each chunk
    chunks.forEach((chunk, index) => {
      result.push({
        pattern: `${cluster.pattern}_part${index + 1}`,
        fields: chunk,
        confidence: 0.5,
        description: `${cluster.description} (Part ${index + 1})`
      });
    });
    
    return result;
  }
  
  /**
   * Calculate confidence scores for clusters
   * 
   * @param clusters Clusters to score
   * @returns Clusters with confidence scores
   */
  private calculateClusterConfidence(clusters: FieldCluster[]): FieldCluster[] {
    return clusters.map(cluster => {
      // Start with basic confidence based on number of fields
      let confidence = Math.min(0.5 + (cluster.fields.length / 20) * 0.25, 0.75);
      
      // Factor 1: Field naming consistency
      const nameConsistency = this.calculateNamingConsistency(cluster.fields);
      
      // Factor 2: Page consistency (if all fields are on same/adjacent pages)
      const pageConsistency = this.calculatePageConsistency(cluster.fields);
      
      // Factor 3: Value pattern consistency
      const valueConsistency = this.calculateValueConsistency(cluster.fields);
      
      // Factor 4: Match to known section patterns
      const sectionPatternMatch = this.calculateSectionPatternMatch(cluster.fields);
      
      // Combine all factors, giving more weight to naming consistency and section matches
      confidence = 0.3 * confidence + 
                  0.25 * nameConsistency + 
                  0.15 * pageConsistency + 
                  0.1 * valueConsistency +
                  0.2 * sectionPatternMatch;
      
      // Ensure confidence is between 0 and 1
      confidence = Math.max(0, Math.min(1, confidence));
      
      // Return updated cluster
      return {
        ...cluster,
        confidence
      };
    });
  }
  
  /**
   * Calculate naming consistency score for fields in a cluster
   */
  private calculateNamingConsistency(fields: CategorizedField[]): number {
    if (fields.length < 2) return 0.5;
    
    // Look for shared prefix/suffix patterns
    const names = fields.map(f => f.name);
    
    // Get longest common prefix
    let prefix = names[0];
    for (let i = 1; i < names.length; i++) {
      while (!names[i].startsWith(prefix) && prefix.length > 0) {
        prefix = prefix.substring(0, prefix.length - 1);
      }
      if (prefix.length === 0) break;
    }
    
    // Get longest common suffix
    let suffix = names[0];
    for (let i = 1; i < names.length; i++) {
      while (!names[i].endsWith(suffix) && suffix.length > 0) {
        suffix = suffix.substring(1);
      }
      if (suffix.length === 0) break;
    }
    
    // Calculate score based on common prefix/suffix
    const prefixScore = prefix.length > 3 ? prefix.length / 10 : 0;
    const suffixScore = suffix.length > 3 ? suffix.length / 10 : 0;
    
    // Check for sequential numbering
    let sequentialScore = 0;
    const numbers: number[] = [];
    const pattern = /(\D+)(\d+)(\D*)/;
    
    for (const name of names) {
      const match = name.match(pattern);
      if (match) {
        numbers.push(parseInt(match[2], 10));
      }
    }
    
    if (numbers.length > 0) {
      numbers.sort((a, b) => a - b);
      let sequential = 0;
      for (let i = 1; i < numbers.length; i++) {
        if (numbers[i] === numbers[i-1] + 1) {
          sequential++;
        }
      }
      sequentialScore = sequential / (numbers.length - 1);
    }
    
    // Combine scores
    return Math.min(prefixScore + suffixScore + sequentialScore, 1);
  }
  
  /**
   * Calculate page consistency score for fields in a cluster
   */
  private calculatePageConsistency(fields: CategorizedField[]): number {
    // Extract pages from fields
    const pages = fields
      .map(f => f.page)
      .filter(Boolean);
    
    if (pages.length < 2) return 0.5;
    
    // If all on same page, perfect consistency
    const uniquePages = new Set(pages);
    if (uniquePages.size === 1) {
      return 1.0;
    }
    
    // If pages span 2-3 consecutive pages, good consistency
    const minPage = Math.min(...pages);
    const maxPage = Math.max(...pages);
    
    if (maxPage - minPage <= 2) {
      return 0.8;
    }
    
    // If pages span within section range, reasonable consistency
    const pageInSection = (page: number, section: number): boolean => {
      const range = sectionPageRanges[section];
      return range && page >= range[0] && page <= range[1];
    };
    
    // Get section from first field, check if all pages are in that section
    const firstSectionMatch = fields[0].name.match(/section(\d+)/i);
    if (firstSectionMatch) {
      const section = parseInt(firstSectionMatch[1], 10);
      if (section && pages.every(page => pageInSection(page, section))) {
        return 0.7;
      }
    }
    
    // Otherwise, score based on page spread
    return Math.max(0.1, 1 - (maxPage - minPage) / 10);
  }
  
  /**
   * Calculate value consistency score for fields in a cluster
   */
  private calculateValueConsistency(fields: CategorizedField[]): number {
    // Count fields with values
    const fieldsWithValues = fields.filter(f => f.value !== undefined);
    if (fieldsWithValues.length < 2) return 0.5;
    
    // Check if values follow a common pattern
    let patternCount = 0;
    
    // Look for section number in values
    const sectionPattern = /^(?:sect)?(\d+)(?:\.|_)/i;
    const sectionMatches = fieldsWithValues
      .map(f => String(f.value).match(sectionPattern))
      .filter(Boolean);
      
    if (sectionMatches.length > fieldsWithValues.length * 0.6) {
      patternCount++;
    }
    
    // Look for empty but present values (placeholder fields)
    const emptyValues = fieldsWithValues
      .filter(f => String(f.value).trim() === '');
      
    if (emptyValues.length > fieldsWithValues.length * 0.8) {
      patternCount++;
    }
    
    // Look for similar lengths
    const valueLengths = fieldsWithValues
      .map(f => String(f.value).length);
      
    const averageLength = valueLengths.reduce((sum, len) => sum + len, 0) / valueLengths.length;
    const similarLengths = valueLengths
      .filter(len => Math.abs(len - averageLength) < 5)
      .length;
      
    if (similarLengths > fieldsWithValues.length * 0.7) {
      patternCount++;
    }
    
    return patternCount / 3;
  }
  
  /**
   * Calculate section pattern match score for fields in a cluster
   */
  private calculateSectionPatternMatch(fields: CategorizedField[]): number {
    // For each section, check what percentage of fields match its patterns
    const scores: Record<number, number> = {};
    
    // Check each section's patterns
    for (const [section, patterns] of Object.entries(sectionFieldPatterns)) {
      const sectionNum = parseInt(section, 10);
      
      // Count fields matching this section's patterns
      let matchCount = 0;
      for (const field of fields) {
        for (const pattern of patterns) {
          if (pattern.test(field.name)) {
            matchCount++;
            break;
          }
        }
      }
      
      // Calculate score for this section
      scores[sectionNum] = matchCount / fields.length;
    }
    
    // Check for section keywords in field values
    for (const [section, keywords] of Object.entries(sectionKeywords)) {
      const sectionNum = parseInt(section, 10);
      
      // Initialize score for this section if not already set
      if (!scores[sectionNum]) {
        scores[sectionNum] = 0;
      }
      
      // Count fields with values matching this section's keywords
      let valueMatchCount = 0;
      let fieldsWithValues = 0;
      
      for (const field of fields) {
        if (field.value) {
          fieldsWithValues++;
          const value = String(field.value).toLowerCase();
          if (keywords.some(keyword => value.includes(keyword))) {
            valueMatchCount++;
          }
        }
      }
      
      // Add value match score (weighted less than pattern matches)
      if (fieldsWithValues > 0) {
        scores[sectionNum] += (valueMatchCount / fieldsWithValues) * 0.5;
      }
    }
    
    // Return highest score for any section
    const bestScore = Math.max(0, ...Object.values(scores));
    return Math.min(bestScore, 1);
  }
  
  /**
   * Suggest section for a cluster based on name patterns, page ranges, etc.
   * 
   * @param cluster Cluster to analyze
   * @returns Suggested section with confidence score
   */
  public suggestSectionForCluster(
    cluster: FieldCluster
  ): { section: number; confidence: number } | null {
    // Check if cluster already has a suggested section
    if (cluster.suggestedSection) {
      return {
        section: cluster.suggestedSection,
        confidence: cluster.confidence
      };
    }
    
    // Scoring for each section
    const sectionScores: Record<number, number> = {};
    
    // Method 1: Check pattern name for section references
    const sectionMatch = cluster.pattern.match(/section(\d+)/i);
    if (sectionMatch) {
      const section = parseInt(sectionMatch[1], 10);
      sectionScores[section] = (sectionScores[section] || 0) + 0.8;
    }
    
    // Method 2: Check field naming patterns for each section
    for (const [section, patterns] of Object.entries(sectionFieldPatterns)) {
      const sectionNum = parseInt(section, 10);
      
      // Count fields matching this section's patterns
      let matchCount = 0;
      for (const field of cluster.fields) {
        for (const pattern of patterns) {
          if (pattern.test(field.name)) {
            matchCount++;
            break;
          }
        }
      }
      
      // Calculate score for this section (0-1)
      const patternScore = matchCount / cluster.fields.length;
      sectionScores[sectionNum] = (sectionScores[sectionNum] || 0) + patternScore * 0.6;
    }
    
    // Method 3: Check page ranges
    const pages = cluster.fields
      .map(f => f.page)
      .filter(Boolean);
      
    if (pages.length > 0) {
      const avgPage = pages.reduce((sum, page) => sum + page, 0) / pages.length;
      
      // Find sections whose page range contains this average
      for (const [section, [minPage, maxPage]] of Object.entries(sectionPageRanges)) {
        const sectionNum = parseInt(section, 10);
        if (avgPage >= minPage && avgPage <= maxPage) {
          sectionScores[sectionNum] = (sectionScores[sectionNum] || 0) + 0.4;
        }
      }
    }
    
    // Method 4: Check field values for section keywords
    for (const [section, keywords] of Object.entries(sectionKeywords)) {
      const sectionNum = parseInt(section, 10);
      
      // Count fields with values matching this section's keywords
      let valueMatchCount = 0;
      let fieldsWithValues = 0;
      
      for (const field of cluster.fields) {
        if (field.value) {
          fieldsWithValues++;
          const value = String(field.value).toLowerCase();
          if (keywords.some(keyword => value.includes(keyword))) {
            valueMatchCount++;
          }
        }
      }
      
      // Add value match score
      if (fieldsWithValues > 0) {
        const keywordScore = (valueMatchCount / fieldsWithValues) * 0.3;
        sectionScores[sectionNum] = (sectionScores[sectionNum] || 0) + keywordScore;
      }
    }
    
    // Find section with highest score
    let bestSection = 0;
    let bestScore = 0;
    
    for (const [section, score] of Object.entries(sectionScores)) {
      const sectionNum = parseInt(section, 10);
      if (score > bestScore) {
        bestScore = score;
        bestSection = sectionNum;
      }
    }
    
    // Return section if confidence is reasonable
    if (bestScore >= 0.4 && bestSection > 0) {
      return {
        section: bestSection,
        confidence: Math.min(bestScore, 1)
      };
    }
    
    return null;
  }
}

// Export singleton instance for easier usage
export const fieldClusterer = new FieldClusterer(); 