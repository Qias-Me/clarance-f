/**
 * SF-86 Sectionizer - Spatial Analysis Utility
 * 
 * This utility provides spatial analysis functions for better field categorization
 * based on field coordinates within the form.
 */

import type { PDFField, CategorizedField } from './extractFieldsBySection.js';
import { refinedSectionPageRanges } from '../../../utilities/page-categorization-bridge.js';

/**
 * Default PDF page dimensions (US Letter size)
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
 * Extract spatial information from field coordinates
 * @param field PDF field with potential coordinate data
 * @returns Spatial info object or null if coordinates not available
 */
export function extractSpatialInfo(field: PDFField): SpatialInfo | null {
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
  
  // Calculate relative positions (as percentages of page dimensions)
  const relativeX = x / DEFAULT_PAGE_DIMENSIONS.width;
  const relativeY = y / DEFAULT_PAGE_DIMENSIONS.height;
  const relativeWidth = width / DEFAULT_PAGE_DIMENSIONS.width;
  const relativeHeight = height / DEFAULT_PAGE_DIMENSIONS.height;
  
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
 * @param candidateSections Possible sections being considered
 * @returns Confidence boost amount (0-0.2)
 */
export function calculateSpatialConfidenceBoost(
  field: PDFField,
  candidateSection: number
): number {
  const spatialInfo = extractSpatialInfo(field);
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