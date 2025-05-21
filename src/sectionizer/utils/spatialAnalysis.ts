/**
 * SF-86 Sectionizer - Spatial Analysis Utility
 * 
 * This utility provides spatial analysis functions for better field categorization
 * based on field coordinates within the form.
 */

import type { PDFField, CategorizedField } from './extractFieldsBySection.js';
import { refinedSectionPageRanges } from './fieldParsing.js';
import { PDFDocument } from 'pdf-lib';

/**
 * Default PDF page dimensions (US Letter size)
 * These are used as fallback when a PDFDocument is not available
 */
export const DEFAULT_PAGE_DIMENSIONS = {
  width: 612, // Default letter size width in points (8.5 x 11 inches)
  height: 792 // Default letter size height in points (8.5 x 11 inches)
};

/**
 * Interface for spatial information about a field
 */
export interface SpatialInfo {
  relativeX: number;       // X position as percentage of page width (0-1)
  relativeY: number;       // Y position as percentage of page height (0-1)
  relativeWidth: number;   // Width as percentage of page width (0-1)
  relativeHeight: number;  // Height as percentage of page height (0-1)
  isInHeader: boolean;     // Field is in header area (top of page)
  isInFooter: boolean;     // Field is in footer area (bottom of page)
  isInLeftColumn: boolean; // Field is in left column
  isInRightColumn: boolean; // Field is in right column
  positionHint: string;    // Text description of position
  region: string;          // Region of the page (top-left, center, etc.)
  quadrant: number;        // Page quadrant (1-4)
}

/**
 * Represents a spatial cluster of fields
 */
export interface SpatialCluster {
  page: number;
  fields: CategorizedField[];
  centroid: { x: number, y: number };
  radius: number;
  dominantSection: number;
  confidence: number;
}

/**
 * Represents a section boundary in the PDF
 */
export interface SectionBoundary {
  section: number;
  pages: number[];
  topLeft: { x: number, y: number }[];
  bottomRight: { x: number, y: number }[];
  firstField?: CategorizedField;
  lastField?: CategorizedField;
  pageRanges: { start: number, end: number }[];
  subsections?: Map<string, {
    topLeft: { x: number, y: number, page: number };
    bottomRight: { x: number, y: number, page: number };
    fields: CategorizedField[];
  }>;
}

/**
 * Get the dimensions of a specific page in the PDF document
 * @param pdfDoc PDF document
 * @param pageIndex Page index (0-based)
 * @returns Page dimensions (width and height)
 */
export function getPageDimensions(pdfDoc: PDFDocument, pageIndex: number = 0): { width: number, height: number } {
  try {
    if (pdfDoc && pageIndex >= 0 && pageIndex < pdfDoc.getPageCount()) {
      const page = pdfDoc.getPage(pageIndex);
      const { width, height } = page.getSize();
      return { width, height };
    }
  } catch (error) {
    console.warn(`Could not get page dimensions for page ${pageIndex}: ${error}`);
  }
  
  // Return default dimensions if we couldn't get them from the PDF
  return DEFAULT_PAGE_DIMENSIONS;
}

/**
 * Extract spatial information from field coordinates
 * @param field PDF field with potential coordinate data
 * @param pdfDoc Optional PDF document to get accurate page dimensions
 * @returns Spatial info object or null if coordinates not available
 */
export function extractSpatialInfo(field: PDFField, pdfDoc?: PDFDocument): SpatialInfo | null {
  // Check if we have coordinate data for dimensional analysis
  const hasCoordinates = field.rect !== undefined || 
                        ('x' in field && 'y' in field && 'width' in field && 'height' in field);
  
  if (!hasCoordinates) {
    return null;
  }
  
  // Extract coordinates from either the rect property or direct properties
  const x = field.rect?.x || (field as any).x || 0;
  const y = field.rect?.y || (field as any).y || 0;
  const width = field.rect?.width || (field as any).width || 0;
  const height = field.rect?.height || (field as any).height || 0;
  
  // Get page dimensions - use field's page if available, otherwise use first page
  const pageIndex = field.page ? field.page - 1 : 0; // Convert from 1-based to 0-based
  const pageDimensions = pdfDoc ? getPageDimensions(pdfDoc, pageIndex) : DEFAULT_PAGE_DIMENSIONS;
  
  // Calculate relative positions (as percentages of page dimensions)
  const relativeX = x / pageDimensions.width;
  const relativeY = y / pageDimensions.height;
  const relativeWidth = width / pageDimensions.width;
  const relativeHeight = height / pageDimensions.height;
  
  // Determine if the field is in a header, footer, or main content area
  const isInHeader = relativeY > 0.8; // Top 20% of page
  const isInFooter = relativeY < 0.2; // Bottom 20% of page
  const isInLeftColumn = relativeX < 0.5 && relativeWidth < 0.4; // Left half and not too wide
  const isInRightColumn = relativeX > 0.5 && relativeWidth < 0.4; // Right half and not too wide
  
  // Determine page region
  let region = '';
  
  // Vertical regions
  if (relativeY > 0.8) region += 'top-';
  else if (relativeY < 0.2) region += 'bottom-';
  else region += 'middle-';
  
  // Horizontal regions
  if (relativeX < 0.33) region += 'left';
  else if (relativeX > 0.67) region += 'right';
  else region += 'center';
  
  // Determine quadrant (1-4, like mathematical quadrants)
  let quadrant = 0;
  if (relativeX >= 0.5 && relativeY >= 0.5) quadrant = 1; // Top-right
  else if (relativeX < 0.5 && relativeY >= 0.5) quadrant = 2; // Top-left
  else if (relativeX < 0.5 && relativeY < 0.5) quadrant = 3; // Bottom-left
  else if (relativeX >= 0.5 && relativeY < 0.5) quadrant = 4; // Bottom-right
  
  // Create position hint
  const positionHint = [
    isInHeader ? 'header' : '',
    isInFooter ? 'footer' : '',
    isInLeftColumn ? 'left' : '',
    isInRightColumn ? 'right' : ''
  ].filter(Boolean).join(' ');
  
  return {
    relativeX,
    relativeY,
    relativeWidth,
    relativeHeight,
    isInHeader,
    isInFooter,
    isInLeftColumn,
    isInRightColumn,
    positionHint,
    region,
    quadrant
  };
}

/**
 * Calculate spatial confidence boost based on field position
 * @param field PDF field to analyze
 * @param candidateSection Possible section being considered
 * @param pdfDoc Optional PDF document to get accurate page dimensions
 * @returns Confidence boost amount (0-0.2)
 */
export function calculateSpatialConfidenceBoost(
  field: PDFField,
  candidateSection: number,
  pdfDoc?: PDFDocument
): number {
  const spatialInfo = extractSpatialInfo(field, pdfDoc);
  if (!spatialInfo) {
    return 0;
  }
  
  let confidenceBoost = 0;
  
  // Boost for section headers at top of page
  if (field.name?.toLowerCase().includes('section') && spatialInfo.isInHeader) {
    confidenceBoost += 0.15;
  }
  
  // Boost for fields in left column when they contain section indicators
  if (spatialInfo.isInLeftColumn && field.name?.toLowerCase().includes('section')) {
    confidenceBoost += 0.1;
  }
  
  // Apply page-based confidence boost if field has a page
  if (field.page) {
    // Check if the field's page falls within this section's page range
    for (const [sectionStr, [startPage, endPage]] of Object.entries(refinedSectionPageRanges)) {
      const sectionNum = parseInt(sectionStr, 10);
      if (isNaN(sectionNum) || sectionNum !== candidateSection) continue;
      
      if (field.page >= startPage && field.page <= endPage) {
        // Field's page is within this section's page range
        confidenceBoost += 0.1;
        
        // Additional boost if field is in expected position for this section
        if (spatialInfo.isInHeader && field.name?.toLowerCase().includes(`section ${sectionNum}`)) {
          confidenceBoost += 0.15;
        }
      }
    }
  }
  
  return Math.min(0.2, confidenceBoost); // Cap at 0.2
}

/**
 * Check if a field's coordinates suggest it belongs to a specific section
 * based on the spatial characteristics of fields in that section
 * 
 * @param field Field to analyze
 * @param sectionFields Array of fields already known to be in the target section
 * @param sectionNumber Target section number
 * @returns Confidence score for this section assignment (0-1)
 */
export function getPositionalSectionScore(
  field: PDFField,
  sectionFields: CategorizedField[],
  sectionNumber: number
): number {
  const spatialInfo = extractSpatialInfo(field);
  if (!spatialInfo || !field.page) {
    return 0;
  }
  
  // See if any fields in this section are on the same page and in a similar position
  const fieldsOnSamePage = sectionFields.filter(
    f => f.page === field.page
  );
  
  if (fieldsOnSamePage.length === 0) {
    return 0;
  }
  
  // Get spatial info for other fields on this page
  const spatialComp = fieldsOnSamePage
    .map(f => extractSpatialInfo(f))
    .filter((info): info is SpatialInfo => info !== null);
  
  // No valid comparison points
  if (spatialComp.length === 0) {
    return 0;
  }
  
  // Calculate regional matches - more precise than simple area matching
  let regionMatches = 0;
  let quadrantMatches = 0;
  
  for (const comp of spatialComp) {
    // Check if field is in the same region
    if (spatialInfo.region === comp.region) {
      regionMatches++;
    }
    
    // Check if field is in the same quadrant
    if (spatialInfo.quadrant === comp.quadrant) {
      quadrantMatches++;
    }
  }
  
  // Calculate similarity scores (0-1)
  const regionSimilarityScore = regionMatches / spatialComp.length;
  const quadrantSimilarityScore = quadrantMatches / spatialComp.length;
  
  // Weighted combined similarity score
  const spatialSimilarityScore = (regionSimilarityScore * 0.6) + (quadrantSimilarityScore * 0.4);
  
  // Apply page range confidence
  let pageRangeConfidence = 0;
  for (const [sectionStr, [startPage, endPage]] of Object.entries(refinedSectionPageRanges)) {
    const sectionNum = parseInt(sectionStr, 10);
    if (isNaN(sectionNum) || sectionNum !== sectionNumber) continue;
    
    if (field.page >= startPage && field.page <= endPage) {
      // Field is within this section's page range
      pageRangeConfidence = 0.7;
      break;
    }
  }
  
  // Combine scores, weighted toward page range confidence
  return Math.min(0.9, (pageRangeConfidence * 0.6) + (spatialSimilarityScore * 0.4));
}

/**
 * Performs spatial clustering on fields to identify natural groupings
 * @param fields Array of fields to cluster
 * @param maxDistance Maximum distance to consider fields part of the same cluster
 * @returns Array of spatial clusters
 */
export function clusterFieldsSpatially(
  fields: CategorizedField[],
  maxDistance: number = 0.2
): SpatialCluster[] {
  // Initialize clusters array
  const clusters: SpatialCluster[] = [];
  
  // Group fields by page first
  const fieldsByPage: Record<number, CategorizedField[]> = {};
  
  fields.forEach(field => {
    if (!field.page) return;
    
    if (!fieldsByPage[field.page]) {
      fieldsByPage[field.page] = [];
    }
    
    fieldsByPage[field.page].push(field);
  });
  
  // Process each page separately
  Object.entries(fieldsByPage).forEach(([pageStr, pageFields]) => {
    const page = parseInt(pageStr, 10);
    
    // Get spatial info for all fields
    const fieldsWithSpatialInfo = pageFields
      .map(field => ({ field, spatialInfo: extractSpatialInfo(field) }))
      .filter(item => item.spatialInfo !== null) as Array<{ field: CategorizedField, spatialInfo: SpatialInfo }>;
    
    // Skip if no fields have spatial info
    if (fieldsWithSpatialInfo.length === 0) return;
    
    // Simple clustering algorithm:
    // For each field, check if it belongs to an existing cluster or create a new one
    fieldsWithSpatialInfo.forEach(({ field, spatialInfo }) => {
      // Find the closest cluster on this page
      let closestCluster: SpatialCluster | null = null;
      let minDistance = Number.MAX_VALUE;
      
      for (const cluster of clusters) {
        if (cluster.page !== page) continue;
        
        // Calculate distance to cluster centroid
        const distance = Math.sqrt(
          Math.pow(spatialInfo.relativeX - cluster.centroid.x, 2) +
          Math.pow(spatialInfo.relativeY - cluster.centroid.y, 2)
        );
        
        if (distance < minDistance) {
          minDistance = distance;
          closestCluster = cluster;
        }
      }
      
      // If within threshold, add to closest cluster, otherwise create new cluster
      if (closestCluster !== null && minDistance <= maxDistance) {
        // Add field to existing cluster
        closestCluster.fields.push(field);
        
        // Recalculate centroid
        const allSpatialInfos = closestCluster.fields
          .map(f => extractSpatialInfo(f))
          .filter((info): info is SpatialInfo => info !== null);
        
        if (allSpatialInfos.length > 0) {
          closestCluster.centroid = {
            x: allSpatialInfos.reduce((sum, info) => sum + info.relativeX, 0) / allSpatialInfos.length,
            y: allSpatialInfos.reduce((sum, info) => sum + info.relativeY, 0) / allSpatialInfos.length
          };
          
          // Update radius to encompass all points
          let maxRadius = 0;
          allSpatialInfos.forEach(info => {
            const distance = Math.sqrt(
              Math.pow(info.relativeX - closestCluster!.centroid.x, 2) +
              Math.pow(info.relativeY - closestCluster!.centroid.y, 2)
            );
            maxRadius = Math.max(maxRadius, distance);
          });
          
          closestCluster.radius = maxRadius;
        }
      } else {
        // Create new cluster
        clusters.push({
          page,
          fields: [field],
          centroid: {
            x: spatialInfo.relativeX,
            y: spatialInfo.relativeY
          },
          radius: 0,
          dominantSection: field.section || 0,
          confidence: 0.5
        });
      }
    });
  });
  
  // Calculate dominant section for each cluster
  clusters.forEach(cluster => {
    const sectionCounts: Record<number, number> = {};
    
    // Count sections in cluster
    cluster.fields.forEach(field => {
      if (field.section) {
        sectionCounts[field.section] = (sectionCounts[field.section] || 0) + 1;
      }
    });
    
    // Find dominant section
    let dominantSection = 0;
    let maxCount = 0;
    let totalFields = 0;
    
    Object.entries(sectionCounts).forEach(([sectionStr, count]) => {
      totalFields += count;
      
      if (count > maxCount) {
        maxCount = count;
        dominantSection = parseInt(sectionStr, 10);
      }
    });
    
    // Calculate confidence based on percentage of dominant section
    const confidence = totalFields > 0 ? maxCount / totalFields : 0;
    
    cluster.dominantSection = dominantSection;
    cluster.confidence = confidence;
  });
  
  return clusters;
}

/**
 * Predict section for a field based on spatial proximity to other fields
 * @param field Field to predict section for
 * @param sectionFields All fields grouped by section
 * @returns Predicted section and confidence score
 */
export function predictSectionBySpatialProximity(
  field: PDFField,
  sectionFields: Record<string, CategorizedField[]>
): { section: number, confidence: number } {
  const spatialInfo = extractSpatialInfo(field);
  if (!spatialInfo || !field.page) {
    return { section: 0, confidence: 0 };
  }
  
  // Default result
  let bestSection = 0;
  let bestConfidence = 0;
  
  // Find fields on the same page
  for (const [sectionKey, fields] of Object.entries(sectionFields)) {
    const sectionNum = parseInt(sectionKey, 10);
    if (isNaN(sectionNum) || sectionNum === 0) continue;
    
    // Filter fields on same page
    const samePageFields = fields.filter(f => f.page === field.page);
    if (samePageFields.length === 0) continue;
    
    // Calculate confidence score
    const score = getPositionalSectionScore(field, samePageFields, sectionNum);
    
    // Update best match if this is better
    if (score > bestConfidence) {
      bestSection = sectionNum;
      bestConfidence = score;
    }
  }
  
  return { section: bestSection, confidence: bestConfidence };
}

/**
 * Get fields that are spatially adjacent on the same page
 * @param field Target field to find neighbors for
 * @param allFields All available fields to compare with
 * @param maxDistance Maximum distance to consider fields as neighbors
 * @returns Array of adjacent fields
 */
export function getSpatialNeighbors(
  field: PDFField,
  allFields: PDFField[],
  maxDistance: number = 0.1
): PDFField[] {
  const spatialInfo = extractSpatialInfo(field);
  if (!spatialInfo || !field.page) {
    return [];
  }
  
  // Filter fields on the same page
  const samePageFields = allFields.filter(f => 
    f.page === field.page && f !== field
  );
  
  // Get spatial info for other fields
  const neighborsWithDistance = samePageFields
    .map(f => {
      const otherSpatialInfo = extractSpatialInfo(f);
      if (!otherSpatialInfo) return null;
      
      // Calculate Euclidean distance
      const distance = Math.sqrt(
        Math.pow(spatialInfo.relativeX - otherSpatialInfo.relativeX, 2) +
        Math.pow(spatialInfo.relativeY - otherSpatialInfo.relativeY, 2)
      );
      
      return { field: f, distance };
    })
    .filter((n): n is { field: PDFField, distance: number } => n !== null)
    .filter(n => n.distance <= maxDistance);
  
  // Sort by distance (closest first)
  neighborsWithDistance.sort((a, b) => a.distance - b.distance);
  
  // Return just the fields
  return neighborsWithDistance.map(n => n.field);
}

/**
 * Creates a map of section boundaries based on categorized fields
 * @param fields Array of categorized fields
 * @returns Map of section boundaries indexed by section number
 */
export function createSectionBoundaryMap(fields: CategorizedField[]): Map<number, SectionBoundary> {
  console.log('Creating section boundary map...');
  const boundaryMap = new Map<number, SectionBoundary>();
  
  // Group fields by section
  const fieldsBySection: Record<number, CategorizedField[]> = {};
  fields.forEach(field => {
    const section = field.section || 0;
    if (section === 0) return; // Skip uncategorized fields
    
    if (!fieldsBySection[section]) {
      fieldsBySection[section] = [];
    }
    fieldsBySection[section].push(field);
  });
  
  // Process each section to create boundaries
  Object.entries(fieldsBySection).forEach(([sectionStr, sectionFields]) => {
    const section = parseInt(sectionStr, 10);
    if (section === 0) return;
    
    // Group fields by page
    const fieldsByPage: Record<number, CategorizedField[]> = {};
    sectionFields.forEach(field => {
      if (!field.page || !field.rect) return;
      
      if (!fieldsByPage[field.page]) {
        fieldsByPage[field.page] = [];
      }
      fieldsByPage[field.page].push(field);
    });
    
    const pages: number[] = Object.keys(fieldsByPage).map(p => parseInt(p, 10)).sort((a, b) => a - b);
    const topLeft: { x: number, y: number }[] = [];
    const bottomRight: { x: number, y: number }[] = [];
    
    // Create page ranges for consecutive pages
    const pageRanges: { start: number, end: number }[] = [];
    let currentRange: { start: number, end: number } | null = null;
    
    pages.forEach(page => {
      if (!currentRange) {
        currentRange = { start: page, end: page };
      } else if (page === currentRange.end + 1) {
        currentRange.end = page;
      } else {
        pageRanges.push(currentRange);
        currentRange = { start: page, end: page };
      }
      
      // Find extreme coordinates to create a bounding box for this page
      const pageFields = fieldsByPage[page];
      if (!pageFields || pageFields.length === 0) return;
      
      let minX = Number.MAX_VALUE;
      let maxX = Number.MIN_VALUE;
      let minY = Number.MAX_VALUE;
      let maxY = Number.MIN_VALUE;
      
      pageFields.forEach(field => {
        if (!field.rect) return;
        
        const { x, y, width, height } = field.rect;
        minX = Math.min(minX, x);
        maxX = Math.max(maxX, x + width);
        minY = Math.min(minY, y);
        maxY = Math.max(maxY, y + height);
      });
      
      // Store the bounding box coordinates for this page
      topLeft.push({ x: minX, y: maxY }); // Top-left (PDF coordinates start from bottom)
      bottomRight.push({ x: maxX, y: minY }); // Bottom-right
    });
    
    // Add the last range
    if (currentRange) {
      pageRanges.push(currentRange);
    }
    
    // Find the first and last fields in this section (based on page number and Y position)
    sectionFields.sort((a, b) => {
      // Sort by page first, then by Y position (top to bottom in PDF coordinates)
      if ((a.page || 0) !== (b.page || 0)) {
        return (a.page || 0) - (b.page || 0);
      }
      return (b.rect?.y || 0) - (a.rect?.y || 0); // Reverse Y order since PDF coordinates start from bottom
    });
    
    const firstField = sectionFields[0];
    const lastField = sectionFields[sectionFields.length - 1];
    
    // Create subsection boundaries if applicable
    const subsectionMap = new Map<string, {
      topLeft: { x: number, y: number, page: number };
      bottomRight: { x: number, y: number, page: number };
      fields: CategorizedField[];
    }>();
    
    // Group fields by subsection
    const fieldsBySubsection: Record<string, CategorizedField[]> = {};
    sectionFields.forEach(field => {
      if (!field.subsection) return;
      
      if (!fieldsBySubsection[field.subsection]) {
        fieldsBySubsection[field.subsection] = [];
      }
      fieldsBySubsection[field.subsection].push(field);
    });
    
    // Create boundary for each subsection
    Object.entries(fieldsBySubsection).forEach(([subsection, subsectionFields]) => {
      if (subsectionFields.length === 0 || !subsectionFields[0].page || !subsectionFields[0].rect) return;
      
      // Sort by page and position
      subsectionFields.sort((a, b) => {
        if ((a.page || 0) !== (b.page || 0)) {
          return (a.page || 0) - (b.page || 0);
        }
        return (b.rect?.y || 0) - (a.rect?.y || 0);
      });
      
      const firstSubField = subsectionFields[0];
      const lastSubField = subsectionFields[subsectionFields.length - 1];
      
      if (!firstSubField.page || !firstSubField.rect || !lastSubField.page || !lastSubField.rect) return;
      
      // For subsection boundary, we'll use the first and last field directly
      subsectionMap.set(subsection, {
        topLeft: { 
          x: firstSubField.rect.x, 
          y: firstSubField.rect.y + firstSubField.rect.height,
          page: firstSubField.page
        },
        bottomRight: { 
          x: lastSubField.rect.x + lastSubField.rect.width, 
          y: lastSubField.rect.y,
          page: lastSubField.page
        },
        fields: subsectionFields
      });
    });
    
    // Create the boundary object
    boundaryMap.set(section, {
      section,
      pages,
      topLeft,
      bottomRight,
      firstField,
      lastField,
      pageRanges,
      subsections: subsectionMap.size > 0 ? subsectionMap : undefined
    });
  });
  
  console.log(`Created boundaries for ${boundaryMap.size} sections`);
  return boundaryMap;
}

/**
 * Categorizes an uncategorized field using the section boundary map
 * @param field The field to categorize
 * @param boundaryMap Map of section boundaries
 * @returns The section number and confidence level
 */
export function categorizeBySpatialBoundary(
  field: PDFField, 
  boundaryMap: Map<number, SectionBoundary>
): { section: number, confidence: number, subsection?: string, entry?: number } {
  if (!field.page || !field.rect) {
    return { section: 0, confidence: 0 };
  }
  
  const fieldPage = field.page;
  const { x, y, width, height } = field.rect;
  
  let bestSection = 0;
  let bestConfidence = 0;
  let bestSubsection: string | undefined;
  
  // Check each section boundary
  boundaryMap.forEach((boundary, section) => {
    // First check if field is on a page within this section's ranges
    let inSectionRange = false;
    for (const range of boundary.pageRanges) {
      if (fieldPage >= range.start && fieldPage <= range.end) {
        inSectionRange = true;
        break;
      }
    }
    
    if (!inSectionRange) return; // Field's page is not in this section
    
    // Find the page index in the boundary pages
    const pageIndex = boundary.pages.indexOf(fieldPage);
    if (pageIndex === -1) return; // Field is not on a page for this section
    
    // Get the bounding box for this page
    const tl = boundary.topLeft[pageIndex];
    const br = boundary.bottomRight[pageIndex];
    
    // Check if field is within the bounding box
    // Add some margin to the boundaries (5% of the dimensions)
    const marginX = (br.x - tl.x) * 0.05;
    const marginY = (tl.y - br.y) * 0.05;
    
    if (x >= tl.x - marginX && x <= br.x + marginX && 
        y >= br.y - marginY && y <= tl.y + marginY) {
      // Field is within this section's boundary
      
      // Calculate how central the field is within the boundary
      // Fields closer to the center have higher confidence
      const boundaryWidth = br.x - tl.x + 2 * marginX;
      const boundaryHeight = tl.y - br.y + 2 * marginY;
      
      const centerX = tl.x + boundaryWidth / 2;
      const centerY = br.y + boundaryHeight / 2;
      
      // Calculate distance from center as a percentage of the half-width/height
      const distanceX = Math.abs(x - centerX) / (boundaryWidth / 2);
      const distanceY = Math.abs(y - centerY) / (boundaryHeight / 2);
      
      // Average distance from center (0 = center, 1 = edge)
      const averageDistance = (distanceX + distanceY) / 2;
      
      // Convert to confidence (0.5 for edge, 0.9 for center)
      const spatialConfidence = 0.9 - (averageDistance * 0.4);
      
      // Consider distance to first and last fields as additional confidence factor
      let sequenceConfidence = 0;
      if (boundary.firstField?.rect && boundary.lastField?.rect) {
        const firstRect = boundary.firstField.rect;
        const lastRect = boundary.lastField.rect;
        
        // Check if field is between first and last in the sequence
        if (
          (boundary.firstField.page === fieldPage || boundary.lastField.page === fieldPage) && 
          (
            // Between first and last on same page
            (boundary.firstField.page === boundary.lastField.page && 
             y <= Math.max(firstRect.y, lastRect.y) && 
             y >= Math.min(firstRect.y, lastRect.y)) ||
            // After first field on first field's page
            (boundary.firstField.page === fieldPage && y <= firstRect.y) ||
            // Before last field on last field's page
            (boundary.lastField.page === fieldPage && y >= lastRect.y)
          )
        ) {
          sequenceConfidence = 0.2;
        }
      }
      
      // Combine spatial and sequence confidence
      const confidence = Math.min(0.95, spatialConfidence + sequenceConfidence);
      
      // Update best match if this is better
      if (confidence > bestConfidence) {
        bestSection = section;
        bestConfidence = confidence;
      }
    }
  });
  
  return { section: bestSection, confidence: bestConfidence };
}

/**
 * Enhance categorization by applying spatial boundary logic
 * @param fields Array of fields with initial categorization
 * @returns Array of fields with enhanced categorization
 */
export function enhanceSpatialCategorization(fields: CategorizedField[]): CategorizedField[] {
  console.log('Enhancing field categorization using spatial boundaries...');
  
  // Create a boundary map from fields that have already been categorized with high confidence
  const highConfidenceFields = fields.filter(f => f.section > 0 && f.confidence >= 0.7);
  const boundaryMap = createSectionBoundaryMap(highConfidenceFields);
  
  if (boundaryMap.size === 0) {
    console.log('No section boundaries could be created, skipping spatial enhancement');
    return fields;
  }
  
  let enhancedCount = 0;
  let changedCount = 0;
  
  // Apply boundary-based categorization to improve results
  const enhancedFields = fields.map(field => {
    // Skip fields with very high confidence
    if (field.confidence >= 0.9) {
      return field;
    }
    
    // Apply spatial boundary categorization
    const { section, confidence } = categorizeBySpatialBoundary(field, boundaryMap);
    
    // Only apply the new categorization if it's better than existing confidence
    if (section > 0 && confidence > field.confidence) {
      enhancedCount++;
      
      // Check if this changes the assigned section
      if (field.section !== section) {
        changedCount++;
      }
      
      return {
        ...field,
        section,
        confidence,
        // Note: Preserve existing subsection/entry if they exist,
        // otherwise they'll be assigned in organizeFieldsBySpatialRelationships
      };
    }
    
    return field;
  });
  
  console.log(`Enhanced ${enhancedCount} fields using spatial boundaries. Changed section for ${changedCount} fields.`);
  return enhancedFields;
}

/**
 * Uses spatial relationships to organize fields into subsections and entries
 * @param fields Array of categorized fields
 * @returns Fields with organized subsections and entries
 */
export function organizeSpatialSubsectionEntries(
  fields: CategorizedField[]
): CategorizedField[] {
  console.log('Organizing subsections and entries using spatial relationships...');
  
  // Group fields by section
  const fieldsBySection: Record<number, CategorizedField[]> = {};
  fields.forEach(field => {
    const section = field.section || 0;
    if (!fieldsBySection[section]) {
      fieldsBySection[section] = [];
    }
    fieldsBySection[section].push(field);
  });
  
  // Process each section
  const organizedFields: CategorizedField[] = [];
  
  Object.entries(fieldsBySection).forEach(([sectionStr, sectionFields]) => {
    const section = parseInt(sectionStr, 10);
    
    // Skip uncategorized fields
    if (section === 0) {
      organizedFields.push(...sectionFields);
      return;
    }
    
    // Group fields by page
    const fieldsByPage: Record<number, CategorizedField[]> = {};
    sectionFields.forEach(field => {
      if (!field.page) return;
      
      if (!fieldsByPage[field.page]) {
        fieldsByPage[field.page] = [];
      }
      fieldsByPage[field.page].push(field);
    });
    
    // Process each page of this section
    const processedFields: CategorizedField[] = [];
    
    Object.entries(fieldsByPage).forEach(([pageStr, pageFields]) => {
      // Sort fields by y-coordinate (top to bottom)
      pageFields.sort((a, b) => {
        const aY = a.rect?.y || 0;
        const bY = b.rect?.y || 0;
        return bY - aY; // Reverse order since PDF coordinates start from bottom
      });
      
      // Identify rows based on y-coordinate proximity
      const rows: CategorizedField[][] = [];
      let currentRow: CategorizedField[] = [];
      let lastY = -1;
      const yThreshold = 15; // Fields within 15 points are considered in the same row
      
      pageFields.forEach(field => {
        const y = field.rect?.y || 0;
        
        if (lastY === -1 || Math.abs(y - lastY) <= yThreshold) {
          // Same row
          currentRow.push(field);
        } else {
          // New row
          if (currentRow.length > 0) {
            rows.push([...currentRow]);
          }
          currentRow = [field];
        }
        
        lastY = y;
      });
      
      // Add the last row
      if (currentRow.length > 0) {
        rows.push(currentRow);
      }
      
      // Sort fields in each row by x-coordinate (left to right)
      rows.forEach(row => {
        row.sort((a, b) => {
          const aX = a.rect?.x || 0;
          const bX = b.rect?.x || 0;
          return aX - bX;
        });
      });
      
      // Determine subsection letters and entry numbers
      // Rows typically represent subsections, columns represent entries
      
      // Identify columns by analyzing x-coordinates across all rows
      const allX: number[] = [];
      rows.forEach(row => {
        row.forEach(field => {
          if (field.rect) {
            allX.push(field.rect.x);
          }
        });
      });
      
      // Sort x-coordinates and identify clusters
      allX.sort((a, b) => a - b);
      
      const xClusters: number[] = [];
      let lastX = -1;
      const xThreshold = 20; // X-coordinate threshold for columns
      
      allX.forEach(x => {
        if (lastX === -1 || Math.abs(x - lastX) > xThreshold) {
          xClusters.push(x);
        }
        lastX = x;
      });
      
      // Assign subsections (letters) and entries (numbers)
      rows.forEach((row, rowIndex) => {
        // Use letters for subsections
        const subsection = String.fromCharCode(97 + Math.min(rowIndex, 25)); // a-z
        
        row.forEach(field => {
          // Assign subsection if not already assigned
          if (!field.subsection) {
            field.subsection = subsection;
          }
          
          // Find column (entry) for this field
          if (!field.entry && field.rect) {
            // Find closest x-cluster
            let closestCluster = -1;
            let minDistance = Number.MAX_VALUE;
            
            xClusters.forEach((cluster, index) => {
              const distance = Math.abs(field.rect!.x - cluster);
              if (distance < minDistance) {
                minDistance = distance;
                closestCluster = index;
              }
            });
            
            // Assign entry based on column index (1-based)
            if (closestCluster !== -1) {
              field.entry = closestCluster + 1;
            }
          }
        });
      });
      
      // Add all processed fields from this page
      processedFields.push(...pageFields);
    });
    
    // Add all processed fields from this section
    organizedFields.push(...processedFields);
  });
  
  return organizedFields;
} 