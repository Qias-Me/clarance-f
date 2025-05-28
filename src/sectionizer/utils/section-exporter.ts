/**
 * Section Export Utility
 *
 * This module provides functionality to export categorized fields into separate JSON files
 * per section, creating a clean directory structure for analysis and debugging.
 */

import * as fs from 'fs';
import * as fsPromises from 'fs/promises';
import * as path from 'path';
import type { CategorizedField } from './extractFieldsBySection.js';
import logger from './logging.js';

/**
 * Interface for section metadata
 */
interface SectionMetadata {
  sectionId: number;
  sectionName: string;
  totalFields: number;
  subsectionCount: number;
  entryCount: number;
  exportDate: string;
  averageConfidence: number;
  pageRange?: [number, number];
}

/**
 * Interface for the exported section JSON structure
 */
interface SectionExport {
  metadata: SectionMetadata;
  fields: CategorizedField[];
  fieldsBySubsection: Record<string, CategorizedField[]>;
  fieldsByEntry: Record<string, CategorizedField[]>;
  statistics: {
    fieldTypes: Record<string, number>;
    confidenceDistribution: {
      high: number; // >= 0.9
      medium: number; // 0.7 - 0.89
      low: number; // < 0.7
    };
  };
}

/**
 * Configuration options for section export
 */
export interface SectionExportOptions {
  /** Whether to export uncategorized fields to a separate file */
  includeUncategorized?: boolean;
  /** Whether to create empty section files for sections with no fields */
  createEmptyFiles?: boolean;
  /** Custom section names mapping */
  sectionNames?: Record<number, string>;
  /** Whether to include detailed statistics */
  includeStatistics?: boolean;
}

/**
 * Default section names for SF-86 form
 */
const DEFAULT_SECTION_NAMES: Record<number, string> = {
  1: "Information About You",
  2: "Citizenship",
  3: "Where You Have Lived",
  4: "Activities",
  5: "Education",
  6: "Employment Activities",
  7: "Where You Have Lived",
  8: "U.S. Passport Information",
  9: "Citizenship",
  10: "Relatives and Associates",
  11: "Where You Have Lived",
  12: "Where You Went to School",
  13: "Employment Activities",
  14: "Military History",
  15: "Military History",
  16: "Foreign Activities",
  17: "Marital Status",
  18: "Relatives and Associates",
  19: "Foreign Activities",
  20: "Foreign Activities",
  21: "Psychological and Emotional Health",
  22: "Police Record",
  23: "Illegal Use of Drugs or Drug Activity",
  24: "Use of Alcohol",
  25: "Investigation and Clearance Record",
  26: "Financial Record",
  27: "Use of Information Technology Systems",
  28: "Involvement in Non-Criminal Court Actions",
  29: "Association Record",
  30: "General Remarks"
};

/**
 * Export categorized fields into separate JSON files per section
 *
 * @param sectionFields Fields grouped by section
 * @param outputPath Base output directory path
 * @param options Export configuration options
 * @returns Promise resolving to export summary
 */
export async function exportSectionFiles(
  sectionFields: Record<string, CategorizedField[]>,
  outputPath: string,
  options: SectionExportOptions = {}
): Promise<{
  sectionsExported: number;
  filesCreated: string[];
  errors: string[];
}> {
  const {
    includeUncategorized = true,
    createEmptyFiles = false,
    sectionNames = DEFAULT_SECTION_NAMES,
    includeStatistics = true
  } = options;

  const sectionsDir = path.join(outputPath, 'sections');
  const filesCreated: string[] = [];
  const errors: string[] = [];
  let sectionsExported = 0;

  try {
    // Create sections directory
    if (!fs.existsSync(sectionsDir)) {
      fs.mkdirSync(sectionsDir, { recursive: true });
      logger.log('info', `Created sections directory: ${sectionsDir}`);
    }

    // Process each section
    for (const [sectionKey, fields] of Object.entries(sectionFields)) {
      const sectionId = parseInt(sectionKey, 10);

      // Handle uncategorized fields (section 0)
      if (sectionId === 0) {
        if (includeUncategorized && fields.length > 0) {
          try {
            const uncategorizedFile = path.join(sectionsDir, 'uncategorized.json');
            const uncategorizedData = {
              metadata: {
                sectionId: 0,
                sectionName: "Uncategorized Fields",
                totalFields: fields.length,
                subsectionCount: 0,
                entryCount: 0,
                exportDate: new Date().toISOString(),
                averageConfidence: calculateAverageConfidence(fields)
              },
              fields: fields,
              fieldsBySubsection: {},
              fieldsByEntry: {},
              statistics: includeStatistics ? generateStatistics(fields) : {}
            };

            fs.writeFileSync(uncategorizedFile, JSON.stringify(uncategorizedData, null, 2));
            filesCreated.push(uncategorizedFile);
            logger.log('info', `Exported ${fields.length} uncategorized fields to ${uncategorizedFile}`);
          } catch (error) {
            const errorMsg = `Failed to export uncategorized fields: ${error}`;
            errors.push(errorMsg);
            logger.log('error', errorMsg);
          }
        }
        continue;
      }

      // Skip invalid section numbers
      if (isNaN(sectionId) || sectionId < 1 || sectionId > 30) {
        continue;
      }

      // Skip empty sections unless createEmptyFiles is true
      if (fields.length === 0 && !createEmptyFiles) {
        continue;
      }

      try {
        const sectionExport = createSectionExport(
          sectionId,
          fields,
          sectionNames[sectionId] || `Section ${sectionId}`,
          includeStatistics
        );

        const sectionFile = path.join(sectionsDir, `section-${sectionId}.json`);
        fs.writeFileSync(sectionFile, JSON.stringify(sectionExport, null, 2));

        filesCreated.push(sectionFile);
        sectionsExported++;

        logger.log('info', `Exported Section ${sectionId} (${fields.length} fields) to ${sectionFile}`);
      } catch (error) {
        const errorMsg = `Failed to export Section ${sectionId}: ${error}`;
        errors.push(errorMsg);
        logger.log('error', errorMsg);
      }
    }

    // Create index file with summary
    try {
      const indexFile = path.join(sectionsDir, 'index.json');
      const indexData = {
        exportDate: new Date().toISOString(),
        totalSections: sectionsExported,
        totalFiles: filesCreated.length,
        sections: Object.entries(sectionFields)
          .filter(([key]) => parseInt(key, 10) > 0)
          .map(([key, fields]) => ({
            sectionId: parseInt(key, 10),
            sectionName: sectionNames[parseInt(key, 10)] || `Section ${key}`,
            fieldCount: fields.length,
            fileName: `section-${key}.json`
          }))
          .sort((a, b) => a.sectionId - b.sectionId)
      };

      fs.writeFileSync(indexFile, JSON.stringify(indexData, null, 2));
      filesCreated.push(indexFile);
      logger.log('info', `Created section index file: ${indexFile}`);
    } catch (error) {
      const errorMsg = `Failed to create index file: ${error}`;
      errors.push(errorMsg);
      logger.log('error', errorMsg);
    }

    logger.log('success', `Section export completed: ${sectionsExported} sections exported, ${filesCreated.length} files created`);

  } catch (error) {
    const errorMsg = `Failed to create sections directory: ${error}`;
    errors.push(errorMsg);
    logger.log('error', errorMsg);
  }

  return {
    sectionsExported,
    filesCreated,
    errors
  };
}

/**
 * Create a section export object with organized data
 */
function createSectionExport(
  sectionId: number,
  fields: CategorizedField[],
  sectionName: string,
  includeStatistics: boolean
): SectionExport {
  // Group fields by subsection
  const fieldsBySubsection: Record<string, CategorizedField[]> = {};
  const fieldsByEntry: Record<string, CategorizedField[]> = {};

  // Get unique subsections and entries
  const subsections = new Set<string>();
  const entries = new Set<string>();

  fields.forEach(field => {
    // Group by subsection
    const subsection = field.subsection || 'default';
    if (!fieldsBySubsection[subsection]) {
      fieldsBySubsection[subsection] = [];
    }
    fieldsBySubsection[subsection].push(field);
    subsections.add(subsection);

    // Group by entry
    const entry = field.entry?.toString() || 'default';
    if (!fieldsByEntry[entry]) {
      fieldsByEntry[entry] = [];
    }
    fieldsByEntry[entry].push(field);
    entries.add(entry);
  });

  // Calculate page range
  const pages = fields
    .map(f => f.page)
    .filter(p => p && p > 0) as number[];
  const pageRange: [number, number] | undefined = pages.length > 0
    ? [Math.min(...pages), Math.max(...pages)]
    : undefined;

  const metadata: SectionMetadata = {
    sectionId,
    sectionName,
    totalFields: fields.length,
    subsectionCount: subsections.size,
    entryCount: entries.size,
    exportDate: new Date().toISOString(),
    averageConfidence: calculateAverageConfidence(fields),
    pageRange
  };

  return {
    metadata,
    fields,
    fieldsBySubsection,
    fieldsByEntry,
    statistics: includeStatistics ? generateStatistics(fields) : {} as any
  };
}

/**
 * Calculate average confidence for a set of fields
 */
function calculateAverageConfidence(fields: CategorizedField[]): number {
  if (fields.length === 0) return 0;

  const totalConfidence = fields.reduce((sum, field) => sum + (field.confidence || 0), 0);
  return Math.round((totalConfidence / fields.length) * 100) / 100;
}

/**
 * Generate statistics for a set of fields
 */
function generateStatistics(fields: CategorizedField[]) {
  const fieldTypes: Record<string, number> = {};
  let highConfidence = 0;
  let mediumConfidence = 0;
  let lowConfidence = 0;

  fields.forEach(field => {
    // Count field types
    const type = field.type || 'unknown';
    fieldTypes[type] = (fieldTypes[type] || 0) + 1;

    // Count confidence distribution
    const confidence = field.confidence || 0;
    if (confidence >= 0.9) {
      highConfidence++;
    } else if (confidence >= 0.7) {
      mediumConfidence++;
    } else {
      lowConfidence++;
    }
  });

  return {
    fieldTypes,
    confidenceDistribution: {
      high: highConfidence,
      medium: mediumConfidence,
      low: lowConfidence
    }
  };
}

/**
 * Legacy function for backward compatibility
 * @deprecated Use exportSectionFiles instead
 */
export async function exportFinalSections(
  sectionFields: Record<string, CategorizedField[]>,
  outputDir: string
): Promise<string[]> {
  const result = await exportSectionFiles(sectionFields, outputDir, {
    includeUncategorized: true,
    createEmptyFiles: false,
    includeStatistics: true
  });

  return result.filesCreated;
}