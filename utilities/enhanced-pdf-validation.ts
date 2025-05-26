#!/usr/bin/env node

/**
 * Enhanced PDF Form Field Validation
 *
 * This script combines the functionality of PDF-Page-data.ts and test-pdf-form-task3.ts
 * to provide improved field categorization based on page numbers.
 *
 * Usage:
 *   npx tsx scripts/enhanced-pdf-validation.ts [--debug]
 *
 * Options:
 *   --debug - Optional. Show detailed debug information during processing
 *
 * The script will:
 * 1. Extract page information for all fields using PDF-Page-data.ts functionality
 * 2. Use this page data to enhance the categorization in test-pdf-form-task3.ts
 * 3. Generate improved validation reports
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";
import * as glob from "glob";
import { PdfService } from "../api/service/pdfService2.js";
import {
  enhancedMultiDimensionalCategorization,
  sectionClassifications,
  initPageCategorization,
  enhancedSectionCategorization,
  identifySectionByPageWithConfidence,
  detectSectionFromFieldValue,
  refinedSectionPageRanges,
  extractSectionInfoFromName,
} from "../src/sectionizer/utils/fieldParsing.js";

// Import these functions from the consolidated utils also
import { loadFieldPageMapping, loadSectionStats } from "./page-categorization-bridge.js";
import { groupFieldsBySection } from "../src/sectionizer/utils/fieldGrouping.js";
import { sectionFieldPatterns } from "../src/sectionizer/utils/field-clusterer.js";

// Add this section structure definition to replace the existing mapping
const sectionStructure: Record<string, { name: string }> = {
  1: { name: "Full Name" },
  2: { name: "Date of Birth" },
  3: { name: "Place of Birth" },
  4: { name: "Social Security Number" },
  5: { name: "Other Names Used" },
  6: { name: "Your Identifying Information" },
  7: { name: "Your Contact Information" },
  8: { name: "U.S. Passport Information" },
  9: { name: "Citizenship" },
  10: { name: "Dual/Multiple Citizenship & Foreign Passport Info" },
  11: { name: "Where You Have Lived" },
  12: { name: "Where you went to School" },
  13: { name: "Employment Acitivites" },
  14: { name: "Selective Service" },
  15: { name: "Military History" },
  16: { name: "People Who Know You Well" },
  17: { name: "Maritial/Relationship Status" },
  18: { name: "Relatives" },
  19: { name: "Foreign Contacts" },
  20: { name: "Foreign Business, Activities, Government Contacts" },
  21: { name: "Psycological and Emotional Health" },
  22: { name: "Police Record" },
  23: { name: "Illegal Use of Drugs and Drug Activity" },
  24: { name: "Use of Alcohol" },
  25: { name: "Investigations and Clearance" },
  26: { name: "Financial Record" },
  27: { name: "Use of Information Technology Systems" },
  28: { name: "Involvement in Non-Criminal Court Actions" },
  29: { name: "Association Record" },
  30: { name: "Continuation Space" }
};

// Interface for section context data
interface SectionContext {
  id: string;
  name: string;
  fields?: Record<string, any>;
  patterns?: string[];
  pageRange?: [number, number];
}

// Load section context data from app/state/contexts/sections
async function loadSectionContexts(): Promise<Record<string, SectionContext>> {
  try {
    console.log("Loading section contexts from app/state/contexts/sections...");
    const sectionsDir = path.resolve(__dirname, "../app/state/contexts/sections");
    
    if (!fs.existsSync(sectionsDir)) {
      console.warn(`Section contexts directory not found: ${sectionsDir}`);
      return {};
    }
    
    // Find all potential context files (TypeScript or JavaScript)
    const contextFiles = glob.sync("**/*.{ts,tsx,js,jsx}", { cwd: sectionsDir });
    
    if (contextFiles.length === 0) {
      console.warn("No section context files found");
      return {};
    }
    
    console.log(`Found ${contextFiles.length} potential section context files`);
    
    // Process each context file
    const contextArray: Array<SectionContext & { id: string }> = [];
    
    // Map file names to section IDs and names
    const fileToSectionMapping: Record<string, { id: string, name: string }> = {
      "personalInfo.tsx": { id: "1", name: "Full Name" },
      "birthInfo.tsx": { id: "2", name: "Date of Birth" },
      "placeOfBirth.tsx": { id: "3", name: "Place of Birth" },
      "aknowledgementInfo.tsx": { id: "4", name: "Social Security Number" },
      "namesInfo.tsx": { id: "5", name: "Other Names Used" },
      "physicalAttributes.tsx": { id: "6", name: "Your Identifying Information" },
      "contactInfo.tsx": { id: "7", name: "Your Contact Information" },
      "passportInfo.tsx": { id: "8", name: "U.S. Passport Information" },
      "citizenshipInfo.tsx": { id: "9", name: "Citizenship" },
      "dualCitizenshipInfo.tsx": { id: "10", name: "Dual/Multiple Citizenship & Foreign Passport Info" },
      "residencyInfo.tsx": { id: "11", name: "Where You Have Lived" },
      "schoolInfo.tsx": { id: "12", name: "Where you went to School" },
      "employmentInfo.tsx": { id: "13", name: "Employment Acitivites" },
      "serviceInfo.tsx": { id: "14", name: "Selective Service" },
      "militaryHistoryInfo.tsx": { id: "15", name: "Military History" },
      "peopleThatKnow.tsx": { id: "16", name: "People Who Know You Well" },
      "relationshipInfo.tsx": { id: "17", name: "Maritial/Relationship Status" },
      "relativesInfo.tsx": { id: "18", name: "Relatives" },
      "foreignContacts.tsx": { id: "19", name: "Foreign Contacts" },
      "foreignActivities.tsx": { id: "20", name: "Foreign Business, Activities, Government Contacts" },
      "mentalHealth.tsx": { id: "21", name: "Psycological and Emotional Health" },
      "policeRecord.tsx": { id: "22", name: "Police Record" },
      "drugActivity.tsx": { id: "23", name: "Illegal Use of Drugs and Drug Activity" },
      "alcoholUse.tsx": { id: "24", name: "Use of Alcohol" },
      "investigationsInfo.tsx": { id: "25", name: "Investigations and Clearance" },
      "finances.tsx": { id: "26", name: "Financial Record" },
      "technology.tsx": { id: "27", name: "Use of Information Technology Systems" },
      "civil.tsx": { id: "28", name: "Involvement in Non-Criminal Court Actions" },
      "association.tsx": { id: "29", name: "Association Record" },
      "continuation.tsx": { id: "30", name: "Continuation Space" }
    };
    
    for (const file of contextFiles) {
      try {
        const filePath = path.join(sectionsDir, file);
        const content = fs.readFileSync(filePath, 'utf-8');
        
        // Check if we have a mapping for this file
        const basename = path.basename(file);
        if (fileToSectionMapping[basename]) {
          const { id, name } = fileToSectionMapping[basename];
          
          // Look for comment blocks that might contain section info
          const sectionCommentMatch = content.match(/\/\/\s*(.*?)(Section|Covers)\s*(\d+)/i);
          let sectionId = id;
          
          // If comment explicitly mentions a section number, use that instead
          if (sectionCommentMatch && sectionCommentMatch[3]) {
            sectionId = sectionCommentMatch[3];
          }
          
          // Create context data
          const contextData = {
            id: sectionId,
            name: name,
            fields: {}, // We could extract fields if needed
            patterns: [] // We could extract patterns if needed
          };
          
          contextArray.push(contextData as SectionContext & { id: string });
          console.log(`Loaded section context: ${sectionId} - ${name} from ${basename}`);
        } else {
          // Try to infer section information from file content
          const exportMatch = content.match(/export\s+const\s+(\w+)/);
          if (exportMatch && exportMatch[1]) {
            const exportName = exportMatch[1];
            
            // Try to find section number comments
            const sectionCommentMatch = content.match(/\/\/\s*(.*?)(Section|Covers)\s*(\d+)/i);
            
            if (sectionCommentMatch && sectionCommentMatch[3]) {
              const sectionId = sectionCommentMatch[3];
              const sectionName = exportName.replace(/([A-Z])/g, ' $1').trim();
              
              const contextData = {
                id: sectionId,
                name: sectionName
              };
              
              contextArray.push(contextData as SectionContext & { id: string });
              console.log(`Inferred section context: ${sectionId} - ${sectionName} from ${basename}`);
            }
          }
        }
      } catch (fileErr) {
        console.warn(`Error processing context file ${file}:`, fileErr);
      }
    }
    
    // Sort contexts by section ID numerically
    contextArray.sort((a, b) => parseInt(a.id) - parseInt(b.id));
    
    // Convert array to object with section IDs as keys
    const contexts: Record<string, SectionContext> = {};
    contextArray.forEach(context => {
      contexts[context.id] = context;
    });
    
    console.log(`Successfully loaded ${Object.keys(contexts).length} section contexts in order`);
    return contexts;
  } catch (error) {
    console.error("Error loading section contexts:", error);
    return {};
  }
}

// Global variable to store loaded section contexts
let sectionContexts: Record<string, SectionContext> = {};

// Global variables
const fieldLabels: Record<string, string> = {};

// Helper: Find metadata entry by field name
function getMetadataByName(fieldName: string, extractedMetadata: any[]) {
  // Safety check for empty metadata or null/undefined fieldName
  if (!extractedMetadata || !Array.isArray(extractedMetadata) || extractedMetadata.length === 0 || !fieldName) {
    return null;
  }
  
  try {
    return extractedMetadata.find(meta => meta && meta.name === fieldName) || null;
  } catch (err) {
    console.warn(`Error finding metadata for ${fieldName}:`, err);
    return null;
  }
}

// Function to parse complex field name patterns
function parseFieldNamePattern(fieldName: string): { 
  section: number;
  subsection?: string | number;
  entry?: number;
  subEntry?: number;
  type?: string;
  confidence: number;
} | null {
  try {
    if (!fieldName) return null;
    
    // HIGHEST PRIORITY: Direct section number in field name
    // Look for explicit section patterns like "Section11" or "Section11-2"
    const directSectionMatch = fieldName.match(/Section(\d+)(?:[-_]?\d*)?/i);
    if (directSectionMatch && directSectionMatch[1]) {
      const sectionNum = parseInt(directSectionMatch[1], 10);
      if (sectionNum > 0 && sectionNum <= 30) {
        return {
          section: sectionNum,
          confidence: 0.95
        };
      }
    }
    
    // Handle direct section patterns like "section9" or "section9.1-9.4"
    const sectionPattern = /Section(?<section>\d+)[_\.]?(?<subsection>[0-9.]+)?(?:\-(?<subrange>[0-9.]+))?\[(?<index>\d+)\]/i;
    const sectionMatch = fieldName.match(sectionPattern);
    
    if (sectionMatch?.groups?.section) {
      const section = parseInt(sectionMatch.groups.section);
      const subsection = sectionMatch.groups.subsection || undefined;
      
      return {
        section,
        subsection: subsection,
        confidence: 0.9
      };
    }
    
    // Handle section patterns with "section" prefix like "section13_2-2"
    const sectionUnderscorePattern = /section(?<section>\d+)_(?<subsection>[0-9.\-]+)/i;
    const underscoreMatch = fieldName.match(sectionUnderscorePattern);
    
    if (underscoreMatch?.groups?.section) {
      const section = parseInt(underscoreMatch.groups.section);
      const subsection = underscoreMatch.groups.subsection || undefined;
      
      return {
        section,
        subsection: subsection,
        confidence: 0.9
      };
    }
    
    // Special handling for section 1-6 fields
    if (fieldName.includes('Sections1-6[0]')) {
      // These need special handling as they cover multiple sections
      
      // Section 1: Name fields
      if (fieldName.includes('TextField11[0]') || 
          fieldName.includes('TextField11[1]') || 
          fieldName.includes('TextField11[2]') ||
          fieldName.includes('suffix[0]')) {
        return { section: 1, confidence: 0.95 };
      }
      
      // Section 2: Date of Birth
      if (fieldName.includes('From_Datefield_Name_2[0]')) {
        return { section: 2, confidence: 0.95 };
      }
      
      // Section 3: Place of Birth
      if (fieldName.includes('TextField11[3]') || 
          fieldName.includes('TextField11[4]') || 
          fieldName.includes('School6_State[0]') ||
          fieldName.includes('DropDownList1[0]')) {
        return { section: 3, confidence: 0.95 };
      }
      
      // Section 4: SSN
      if (fieldName.includes('SSN[1]')) {
        return { section: 4, confidence: 0.95 };
      }
      
      // Section 5: Other Names
      if (fieldName.includes('section5[0]')) {
        return { section: 5, confidence: 0.9 };
      }
    }
    
    // Handle grouped sections like "Sections7-9" or "Sections1-6"
    const sectionsRangePattern = /Sections(?<start>\d+)-(?<end>\d+)/i;
    const rangeMatch = fieldName.match(sectionsRangePattern);
    
    if (rangeMatch?.groups?.start && rangeMatch?.groups?.end) {
      // Extract index information to determine which section in the range
      
      // Check for specific patterns to determine the exact section
      if (fieldName.includes('TextField11[0]') && 
          fieldName.includes('Sections1-6')) {
        return { section: 1, confidence: 0.85 }; // Section 1 Name
      }
      
      if (fieldName.includes('SSN[1]') && 
          fieldName.includes('Sections1-6')) {
        return { section: 4, confidence: 0.85 }; // Section 4 SSN
      }
      
      if (fieldName.includes('p3-t68[2]') && 
          fieldName.includes('Sections7-9')) {
        return { section: 7, confidence: 0.8 }; // Section 7 Phone
      }
      
      // For other cases, try to use extracted context
      // but with lower confidence
      return {
        section: parseInt(rangeMatch.groups.start), 
        confidence: 0.5 // Lower confidence for range matches
      };
    }
    
    // Handle subsection patterns with escaped dots like "Section9\\.1-9\\.4"
    const escapedSectionPattern = /Section(?<section>\d+)\\\\.(?<subsection>\d+)-\d+\\\\.(?<subrange>\d+)/i;
    const escapedMatch = fieldName.match(escapedSectionPattern);
    
    if (escapedMatch?.groups?.section) {
      const section = parseInt(escapedMatch.groups.section);
      const subsection = escapedMatch.groups.subsection;
      
      return {
        section,
        subsection: subsection,
        confidence: 0.85
      };
    }
    
    // Handle continuation patterns
    if (/continuation(?<continuationNum>\d+)/.test(fieldName)) {
      // This is a continuation section (supplemental to section 29)
      return {
        section: 30, // Use 30 to represent continuation sections
        confidence: 0.8
      };
    }
    
    // Fall back to basic section extraction
    const extracted = extractSectionInfoFromName(fieldName);
    if (extracted && extracted.section !== undefined) {
      return {
        section: extracted.section,
        subsection: extracted.subsection,
        entry: extracted.entry,
        subEntry: extracted.subEntry,
        confidence: extracted.confidence
      };
    }
    
    return null;
    
  } catch (error) {
    console.warn(`Error parsing field pattern for ${fieldName}:`, error);
    return null;
  }
}

// Helper to extract basic section information
function extractSectionFromFieldName(fieldName: string): { 
  section: number;
  subsection?: string | number;
  confidence: number;
} | null {
  // Basic numeric patterns at the start of field names
  const numericPattern = /^(\d+)[.]?(\d+)?/;
  const numericMatch = fieldName.match(numericPattern);
  
  if (numericMatch) {
    const section = parseInt(numericMatch[1]);
    const subsection = numericMatch[2] ? numericMatch[2] : undefined;
    
    return {
      section,
      subsection,
      confidence: 0.7
    };
  }
  
  // Look for section numbers anywhere in the field name
  const embeddedSectionPattern = /[^0-9](\d+)[^0-9]/g;
  const embeddedMatches = Array.from(fieldName.matchAll(embeddedSectionPattern));
  
  if (embeddedMatches.length > 0) {
    // Use the first number that looks like a reasonable section (1-30)
    for (const match of embeddedMatches) {
      const potentialSection = parseInt(match[1]);
      if (potentialSection >= 1 && potentialSection <= 30) {
        return {
          section: potentialSection,
          confidence: 0.5 // Low confidence for this fallback method
        };
      }
    }
  }
  
  // Special case for bottom of page SSN
  if (/SSN\[\d+\]$/.test(fieldName)) {
    // Check for section identifier before it
    if (/Section28/.test(fieldName)) {
      return { section: 28, confidence: 0.85 };
    }
    
    if (/continuation/.test(fieldName)) {
      return { section: 30, confidence: 0.8 }; // Continuation section
    }
  }
  
  // Could not determine section
  return null;
}

// Get the current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Default PDF path if not specified
const DEFAULT_PDF_PATH = path.join(
  __dirname,
  "../src/sf862.pdf"
);

// Command line args
const args = process.argv.slice(2);
const DEBUG = args.includes("--debug");

// Define types for our script
interface FieldMetadata {
  label?: string;
  required?: boolean;
  maxLength?: number;
}

interface FieldData {
  id: string;
  name: string;
  type: string;
  page: number;
  value?: string | string[] | boolean;
  metadata: FieldMetadata;
}

interface TypeCounts {
  [key: string]: number;
}

interface PageStats {
  pageNumber: number;
  fieldCount: number;
  typeBreakdown: TypeCounts;
}

// Define a type for our field page mapping
interface FieldPageInfo {
  page: number;
  label?: string;
  value?: string | string[] | boolean;
  maxLength?: number;
  options?: string[];
  required?: boolean;
}

// Use refinedSectionPageRanges from the bridge module instead of redefining
const sectionPageRanges: Record<number, [number, number]> =
  refinedSectionPageRanges;

// Updated function to identify section by page with improved accuracy using the ranges
function identifySectionByPage(
  pageNum: number
): { section: number; confidence: number } | null {
  return identifySectionByPageWithConfidence(pageNum);
}

// Replace the categorizeField function with a direct whitelist approach for sections 1 and 3
function categorizeField(field: any): { section: number, confidence: number } {
  try {
    // PRIORITY 1: Whitelist approach for sections 1, 2, and 3 (highest precedence)
    if (field.name) {
      // SECTION 1: Use sectionFieldPatterns
      if (sectionFieldPatterns[1] && sectionFieldPatterns[1].some(pattern => pattern.test(field.name))) {
        return { section: 1, confidence: 0.99 };
      }
      
      // SECTION 2: Use specific section 2 patterns
      const section2Patterns = [
        /form1\[0\]\.Sections1-6\[0\]\.From_Datefield_Name_2\[0\]/i,
        /form1\[0\]\.Sections1-6\[0\]\.#field\[18\]/i,
      ];
      if (section2Patterns.some(pattern => pattern.test(field.name))) {
        return { section: 2, confidence: 0.99 };
      }
      
      // SECTION 3: Use sectionFieldPatterns
      if (sectionFieldPatterns[3] && sectionFieldPatterns[3].some(pattern => pattern.test(field.name))) {
        return { section: 3, confidence: 0.99 };
      }
      
      // Check if field name contains direct section reference
      const patternResult = parseFieldNamePattern(field.name);
      if (patternResult && patternResult.confidence > 0.7) {
        return { section: patternResult.section, confidence: patternResult.confidence };
      }
      
      // Check if field value follows sectN naming pattern
      if (field.value) {
        const valuePattern = detectSectionFromFieldValue(field.value);
        if (valuePattern && valuePattern.confidence > 0.7) {
          return { section: valuePattern.section, confidence: valuePattern.confidence };
        }
      }
      
      // Check page number against known section ranges
      if (field.page) {
        const pageResult = identifySectionByPageWithConfidence(field.page);
        if (pageResult && pageResult.confidence > 0.7) {
          return { section: pageResult.section, confidence: pageResult.confidence };
        }
      }
    }
    
    // Default to section 6 (identifying info) for most unidentified fields
    return { section: 6, confidence: 0.5 };
  } catch (error) {
    console.warn(`Error in categorizeField for ${field.name}:`, error);
    return { section: 0, confidence: 0 };
  }
}

// Function to categorize Sections1-6 fields using special rules
function categorizeSections1to6Field(fieldName: string, fieldLabel?: string, fieldValue?: any): { section: number, confidence: number } | null {
  if (!fieldName) return null;
  
  // Check if this is a Sections1-6 field
  if (!fieldName.includes('Sections1-6[0]')) return null;
  
  // For sections 1-6, we have strict pattern matching
  for (const [sectionIdStr, patterns] of Object.entries(sectionFieldPatterns)) {
    const sectionId = parseInt(sectionIdStr);
    if (patterns && Array.isArray(patterns)) {
      for (const pattern of patterns) {
        if (pattern.test(fieldName)) {
          return {
            section: sectionId,
            confidence: 0.95
          };
        }
      }
    }
  }
  
  // PRIORITY 2: Check field name patterns for specific sections
  if (fieldName.includes('TextField11[0]') || 
      fieldName.includes('TextField11[1]') || 
      fieldName.includes('TextField11[2]') ||
      fieldName.includes('suffix[0]')) {
    return { section: 1, confidence: 0.95 };
  }
  
  if (fieldName.includes('From_Datefield_Name_2[0]') ||
      fieldName.includes('#field[18]')) {
    return { section: 2, confidence: 0.95 };
  }
  
  if (fieldName.includes('TextField11[3]') || 
      fieldName.includes('TextField11[4]') || 
      fieldName.includes('School6_State[0]') ||
      fieldName.includes('DropDownList1[0]')) {
    return { section: 3, confidence: 0.95 };
  }
  
  if (fieldName.includes('SSN[0]') || 
      fieldName.includes('SSN[1]')) {
    return { section: 4, confidence: 0.95 };
  }
  
  if (fieldName.includes('section5[0]')) {
    return { section: 5, confidence: 0.95 };
  }
  
  // PRIORITY 3: Check if field value follows sectN naming pattern
  if (fieldValue) {
    const valuePattern = detectSectionFromFieldValue(fieldValue);
    if (valuePattern && valuePattern.confidence >= 0.8) {
      return {
        section: valuePattern.section,
        confidence: valuePattern.confidence
      };
    }
  }
  
  // PRIORITY 5: If no pattern match, try to use label content
  if (fieldLabel) {
    // Check label for section clues
    if (/birth\s*date|date\s*of\s*birth|dob/i.test(fieldLabel)) {
      return { section: 2, confidence: 0.75 };
    }
    if (/ssn|social\s*security|security\s*number/i.test(fieldLabel)) {
      return { section: 4, confidence: 0.75 };
    }
    if (/other\s*names|maiden\s*name|alias|former\s*name/i.test(fieldLabel)) {
      return { section: 5, confidence: 0.75 };
    }
    if (/height|weight|hair\s*color|eye\s*color|sex|gender/i.test(fieldLabel)) {
      return { section: 6, confidence: 0.75 };
    }
  }
  
  // Default to a moderate-confidence assignment to section 6
  return { section: 6, confidence: 0.6 };
}

// Define these functions locally instead of importing from a non-existent module
function saveSectionSummaryToAllDirectories(sectionSummary: any): void {
  try {
    // Save to reports directory
    const reportsDir = path.join(__dirname, "../reports");
    if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir, { recursive: true });
    }
    const reportPath = path.join(reportsDir, "section-summary.json");
    fs.writeFileSync(reportPath, JSON.stringify(sectionSummary, null, 2));
    
    // Save to section-data directory
    const sectionDataDir = path.join(__dirname, "../section-data");
    if (!fs.existsSync(sectionDataDir)) {
      fs.mkdirSync(sectionDataDir, { recursive: true });
    }
    const sectionDataPath = path.join(sectionDataDir, "section-summary.json");
    fs.writeFileSync(sectionDataPath, JSON.stringify(sectionSummary, null, 2));
    
    console.log(`Saved section summary to multiple directories`);
  } catch (error) {
    console.error("Error saving section summary:", error);
  }
}

function saveUnidentifiedFieldsToAllDirectories(unidentifiedData: any): void {
  try {
    // Save to reports directory
    const reportsDir = path.join(__dirname, "./reports");
    if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir, { recursive: true });
    }
    const reportPath = path.join(reportsDir, "unidentified-fields.json");
    fs.writeFileSync(reportPath, JSON.stringify(unidentifiedData, null, 2));
    
    // Save to section-data directory
    const sectionDataDir = path.join(__dirname, "./section-data");
    if (!fs.existsSync(sectionDataDir)) {
      fs.mkdirSync(sectionDataDir, { recursive: true });
    }
    const sectionDataPath = path.join(sectionDataDir, "unidentified-fields.json");
    fs.writeFileSync(sectionDataPath, JSON.stringify(unidentifiedData, null, 2));
    
    console.log(`Saved unidentified fields to multiple directories`);
  } catch (error) {
    console.error("Error saving unidentified fields:", error);
  }
}

/**
 * Main function to run enhanced PDF validation
 */
async function main(): Promise<void> {
  try {
    console.log("Starting Enhanced PDF Form Field Validation...");

    // Check if PDF exists
    if (!fs.existsSync(DEFAULT_PDF_PATH)) {
      console.error(`Error: PDF file not found at ${DEFAULT_PDF_PATH}`);
      process.exit(1);
    }

    // Initialize the categorization system
    initPageCategorization();

    // Load section contexts for context-aware categorization
    console.log("Loading section contexts...");
    sectionContexts = await loadSectionContexts();
    console.log(`Loaded ${Object.keys(sectionContexts).length} section contexts \n`);

    // First pass: Collect accurate page data for all fields
    console.log("Phase 1: Extracting field metadata and page data...");
    const fieldMetadata = await extractFieldMetadataWithPages(DEFAULT_PDF_PATH);
    console.log(`Extracted metadata for ${fieldMetadata.length} fields`);

    // Save field metadata to a JSON file for reference
    const metadataPath = path.join(__dirname, "../reports/field-metadata.json");
    fs.mkdirSync(path.dirname(metadataPath), { recursive: true });
    fs.writeFileSync(metadataPath, JSON.stringify(fieldMetadata, null, 2));
    console.log(`Saved field metadata to ${metadataPath}`);

    // Create a mapping from field name to page number for backward compatibility
    const pageMapping: Record<string, FieldPageInfo> = {};
    fieldMetadata.forEach((field) => {
      pageMapping[field.name] = {
        page: field.page || 0,
        label: field.label,
        value: field.value,
        maxLength: field.maxLength,
        options: field.options,
      };
    });

    // Save page mapping to a JSON file for reference
    const pageMapPath = path.join(
      __dirname,
      "../reports/field-page-mapping.json"
    );
    fs.writeFileSync(pageMapPath, JSON.stringify(pageMapping, null, 2));
    console.log(`Saved field page mapping to ${pageMapPath}`);

    // Create a separate file just for field labels to make them easier to access
    fieldMetadata.forEach((field) => {
      if (field.label) {
        fieldLabels[field.name] = field.label;
      }
    });

    const labelsPath = path.join(__dirname, "../reports/field-labels.json");
    fs.writeFileSync(labelsPath, JSON.stringify(fieldLabels, null, 2));
    console.log(`Saved field labels to ${labelsPath} \n`);

    // Second pass: Generate section statistics based on page data
    console.log("Phase 2: Analyzing section page distributions...");
    const sectionStats = analyzePageDistribution(pageMapping);

    // Save section statistics
    const statsPath = path.join(
      __dirname,
      "../reports/section-page-stats.json"
    );
    fs.writeFileSync(statsPath, JSON.stringify(sectionStats, null, 2));
    console.log(`Saved section page statistics to ${statsPath} \n`);

    // Third pass: Group fields by section using multi-dimensional approach
    console.log(
      "Phase 3: Performing enhanced multi-dimensional field categorization..."
    );

    // Initialize field categories storage
    const fieldCategories: Record<
      string,
      {
        section: number;
        sectionName: string;
        confidence: number;
        subsection?: number;
      }
    > = {};

    // Apply context-aware categorization to all fields
    Object.keys(fieldLabels).forEach((fieldName) => {
      try {
        // Special fast path for section 1 fields using strict patterns
        if (
          sectionFieldPatterns[1].some((pattern: RegExp) =>
            pattern.test(fieldName)
          )
        ) {
          fieldCategories[fieldName] = {
            section: 1,
            sectionName: "Full Name",
            confidence: 0.98,
          };
          return;
        }

        // Special fast path for section 2 fields
        if (
          sectionFieldPatterns[2].some((pattern: RegExp) =>
            pattern.test(fieldName)
          )
        ) {
          fieldCategories[fieldName] = {
            section: 2,
            sectionName: "Date of Birth",
            confidence: 0.98,
          };
          return;
        }

        // Special fast path for section 3 fields
        if (
          sectionFieldPatterns[3].some((pattern: RegExp) =>
            pattern.test(fieldName)
          )
        ) {
          fieldCategories[fieldName] = {
            section: 3,
            sectionName: "Place of Birth",
            confidence: 0.98,
          };
          return;
        }

        // Special fast path for section 4 fields (SSN)
        if (
          sectionFieldPatterns[4].some((pattern: RegExp) =>
            pattern.test(fieldName)
          ) ||
          fieldName.includes("SSN[") ||
          fieldName.toLowerCase().includes("ssn")
        ) {
          fieldCategories[fieldName] = {
            section: 4,
            sectionName: "Social Security Number",
            confidence: 0.98,
          };
          return;
        }

        // Special fast path for section 5 fields (Other Names)
        if (
          sectionFieldPatterns[5].some((pattern: RegExp) =>
            pattern.test(fieldName)
          )
        ) {
          fieldCategories[fieldName] = {
            section: 5,
            sectionName: "Other Names Used",
            confidence: 0.98,
          };
          return;
        }

        // Special fast path for section 6 fields (Your Identifying Information)
        if (
          sectionFieldPatterns[6].some((pattern: RegExp) =>
            pattern.test(fieldName)
          )
        ) {
          fieldCategories[fieldName] = {
            section: 6,
            sectionName: "Your Identifying Information",
            confidence: 0.98,
          };
          return;
        }

        // Special fast path for section 7 fields (Contact Information)
        if (
          sectionFieldPatterns[7].some((pattern: RegExp) =>
            pattern.test(fieldName)
          )
        ) {
          fieldCategories[fieldName] = {
            section: 7,
            sectionName: "Your Contact Information",
            confidence: 0.98,
          };
          return;
        }

        // Special fast path for section 8 fields (Passport)
        if (
          sectionFieldPatterns[8].some((pattern: RegExp) =>
            pattern.test(fieldName)
          )
        ) {
          fieldCategories[fieldName] = {
            section: 8,
            sectionName: "U.S. Passport Information",
            confidence: 0.98,
          };
          return;
        }

        // Special fast path for section 9 fields (Citizenship)
        if (
          sectionFieldPatterns[9].some((pattern: RegExp) =>
            pattern.test(fieldName)
          )
        ) {
          // Try to identify subsection within section 9
          let subsection = undefined; // Only set if we can determine
          
          // Check for subsection patterns in the field name
         if (/9\.1-9\.4/.test(fieldName)) {
            // For range pattern, further examine the value to determine specific subsection
            const fieldValue = getFieldValue(fieldName, fieldCategories);
            const valueStr = typeof fieldValue === 'string' ? fieldValue : '';
            
            if (valueStr.startsWith("9.1") || valueStr.startsWith("sect9.1")) {
              subsection = 1;
            } else if (valueStr.startsWith("9.2") || valueStr.startsWith("sect9.2")) {
              subsection = 2;
            } else if (valueStr.startsWith("9.3") || valueStr.startsWith("sect9.3")) {
              subsection = 3;
            } else if (valueStr.startsWith("9.4") || valueStr.startsWith("sect9.4")) {
              subsection = 4;
            }
            // Look for subsection keywords in field labels
            else {
              const fieldLabel = getFieldLabel(fieldName);
              if (fieldLabel) {
                if (/by birth, born to U\.S\. parent/.test(fieldLabel)) {
                  subsection = 1;
                } else if (/naturalized U\.S\. citizen/.test(fieldLabel)) {
                  subsection = 2;
                } else if (/derived U\.S\. Citizen/.test(fieldLabel)) {
                  subsection = 3;
                } else if (/not a U\.S\. Citizen/.test(fieldLabel)) {
                  subsection = 4;
                }
              }
            }
          }
          
          fieldCategories[fieldName] = {
            section: 9,
            sectionName: "Citizenship",
            subsection,
            confidence: 0.98,
          };
          return;
        }

        // Check if this is a Sections1-6 field for special handling
        if (fieldName.includes('Sections1-6[0]')) {
          const specialResult = categorizeSections1to6Field(
            fieldName, 
            getFieldLabel(fieldName), 
            getFieldValue(fieldName, fieldCategories)
          );
          
          if (specialResult) {
            const sectionName = getSectionName(specialResult.section);
            fieldCategories[fieldName] = {
              section: specialResult.section,
              sectionName: sectionName,
              confidence: specialResult.confidence
            };
            return;
          }
        }

        // Check for patterns in field name using the field name pattern parser
        const patternResult = parseFieldNamePattern(fieldName);
        if (patternResult && patternResult.confidence > 0.7) {
          const sectionName = getSectionName(patternResult.section);
          fieldCategories[fieldName] = {
            section: patternResult.section,
            sectionName: sectionName,
            confidence: patternResult.confidence,
            subsection: typeof patternResult.subsection === 'number' ? patternResult.subsection : undefined
          };
          return;
        }

        // Look for section info in field value
        const fieldValue = getFieldValue(fieldName, fieldCategories);
        const valuePattern = fieldValue ? detectSectionFromFieldValue(fieldValue) : null;
        if (valuePattern) {
          fieldCategories[fieldName] = {
            section: valuePattern.section,
            sectionName: valuePattern.sectionName || `Section ${valuePattern.section}`,
            confidence: valuePattern.confidence,
            subsection: valuePattern.subsection ? Number(valuePattern.subsection) : undefined
          };
          return;
        }

        // Use page-based categorization
        const fieldPage = pageMapping[fieldName]?.page || 0;
        if (fieldPage > 0) {
          const pageResult = identifySectionByPageWithConfidence(fieldPage);
          if (pageResult && pageResult.section > 0) {
            const sectionName = getSectionName(pageResult.section);
            fieldCategories[fieldName] = {
              section: pageResult.section,
              sectionName: sectionName,
              confidence: pageResult.confidence
            };
            return;
          }
        }

        // Use the comprehensive multidimensional categorization
        const result = enhancedMultiDimensionalCategorization(
          fieldName,
          getFieldLabel(fieldName),
          pageMapping[fieldName]?.page || 0,
          typeof getFieldValue(fieldName, fieldCategories) === "string"
            ? (getFieldValue(fieldName, fieldCategories) as string)
            : getFieldValue(fieldName, fieldCategories) !== undefined
            ? String(getFieldValue(fieldName, fieldCategories))
            : undefined,
          [] // Nearby fields could be added here for better context
        );

        if (result) {
          const sectionName = getSectionName(result.section);
          fieldCategories[fieldName] = {
            section: result.section,
            sectionName: sectionName,
            confidence: result.confidence,
            subsection: result.subsection ? Number(result.subsection) : undefined
          };
          return;
        }

        // Default to unidentified if all categorization approaches fail
        fieldCategories[fieldName] = {
          section: 0,
          sectionName: "Unidentified",
          confidence: 0.1
        };
      } catch (error) {
        console.warn(`Error categorizing field ${fieldName}:`, error);
        
        // Default to unidentified on error
        fieldCategories[fieldName] = {
          section: 0,
          sectionName: "Unidentified",
          confidence: 0.1
        };
      }
    });

    // Apply strict section validation to enforce section rules
    console.log("Applying strict section validation...");
    validateSectionAssignments(fieldCategories);

    // Save the section grouping
    const sectionsPath = path.join(__dirname, "../reports/field-sections.json");
    fs.writeFileSync(sectionsPath, JSON.stringify(fieldCategories, null, 2));
    console.log(`Saved field section grouping to ${sectionsPath}`);

    // Aggregate the field categorization data by section
    const sectionGroups: Record<
      number,
      {
        sectionName: string;
        count: number;
        filled: number;
        highConfidence: number;
        mediumConfidence: number;
        lowConfidence: number;
        subsections: Record<number, {
          count: number;
          filled: number;
          highConfidence: number;
          mediumConfidence: number;
          lowConfidence: number;
        }>;
      }
    > = {};

    // Initialize section groups
    for (let i = 1; i <= 30; i++) {
      const sectionName = getSectionName(i);
      sectionGroups[i] = {
        sectionName,
        count: 0,
        filled: 0,
        highConfidence: 0,
        mediumConfidence: 0,
        lowConfidence: 0,
        subsections: {} // Add subsections tracking
      };
    }

    // Count fields per section
    Object.entries(fieldCategories).forEach(([fieldName, data]) => {
      const section = data.section;
      let subsection: number | null = null;
      
      // Only look for subsections in section 9
      if (section === 9) {
        // Try to extract subsection from fieldName with different patterns
        // Pattern 1: Section9\\.1-9\\.4[0] type
        const subsectionRegex1 = /Section(\d+)\\\.(\d+)-\d+\.\d+\[0\]/;
        // Pattern 2: Section9\\.1[0] type (direct subsection)
        const subsectionRegex3 = /Section(\d+)\\\.(\d+)\[0\]/;
        
        const subsectionMatch1 = fieldName.match(subsectionRegex1);
        const subsectionMatch3 = fieldName.match(subsectionRegex3);
        
        // Try to extract subsection from field value
        const fieldValue = getFieldValue(fieldName, fieldCategories);
        const valueStr = typeof fieldValue === 'string' ? fieldValue : '';
        
        // Pattern 1: sect9.2Name type
        const valueSubsectionRegex = /^sect(\d+)\.(\d+)/i;
        // Pattern 2: 9.1Name type
        const simpleValueRegex = /^(\d+)\.(\d+)/;
        // Pattern 3: sect9.1.Name or 9.1.Name type (with extra dot)
        const dotValueRegex = /^(sect)?(\d+)\.(\d+)\./i;
        
        const valueMatch = valueStr ? valueStr.match(valueSubsectionRegex) : null;
        const simpleValueMatch = valueStr ? valueStr.match(simpleValueRegex) : null;
        const dotValueMatch = valueStr ? valueStr.match(dotValueRegex) : null;
        
        // Extract subsection with priority
        if (subsectionMatch1 && parseInt(subsectionMatch1[1]) === section) {
          subsection = parseInt(subsectionMatch1[2]);
        } else if (subsectionMatch3 && parseInt(subsectionMatch3[1]) === section) {
          subsection = parseInt(subsectionMatch3[2]);
        } else if (valueMatch && parseInt(valueMatch[1]) === section) {
          subsection = parseInt(valueMatch[2]);
        } else if (simpleValueMatch && parseInt(simpleValueMatch[1]) === section) {
          subsection = parseInt(simpleValueMatch[2]);
        } else if (dotValueMatch && parseInt(dotValueMatch[2]) === section) {
          subsection = parseInt(dotValueMatch[3]);
        } else if (fieldName.includes("9.1-9.4")) {
          // For Section9\.1-9\.4 pattern fields, check the field value to determine subsection
          if (valueStr.startsWith("9.1") || valueStr.startsWith("sect9.1")) {
            subsection = 1;
          } else if (valueStr.startsWith("9.2") || valueStr.startsWith("sect9.2")) {
            subsection = 2;
          } else if (valueStr.startsWith("9.3") || valueStr.startsWith("sect9.3")) {
            subsection = 3;
          } else if (valueStr.startsWith("9.4") || valueStr.startsWith("sect9.4")) {
            subsection = 4;
          } 
          // Default to subsection 1 if we can't determine
          else if (/Citizen/.test(fieldName)) {
            subsection = 1;
          }
        }
      }
      
      if (section >= 1 && section <= 30) {
        // Increment total count
        sectionGroups[section].count++;

        // Initialize subsection if it doesn't exist and we have a valid subsection
        if (subsection && section === 9 && !sectionGroups[section].subsections[subsection]) {
          sectionGroups[section].subsections[subsection] = {
            count: 0,
            filled: 0,
            highConfidence: 0,
            mediumConfidence: 0,
            lowConfidence: 0
          };
        }
        
        // Increment subsection count if applicable (only for section 9)
        if (subsection && section === 9) {
          sectionGroups[section].subsections[subsection].count++;
        }

        // Check if field has a value
        if (getFieldValue(fieldName, fieldCategories) !== undefined) {
          sectionGroups[section].filled++;
          
          // Increment filled count for subsection if applicable (only for section 9)
          if (subsection && section === 9) {
            sectionGroups[section].subsections[subsection].filled++;
          }
        }

        // Count by confidence level
        if (data.confidence >= 0.9) {
          sectionGroups[section].highConfidence++;
          if (subsection && section === 9) {
            sectionGroups[section].subsections[subsection].highConfidence++;
          }
        } else if (data.confidence >= 0.7) {
          sectionGroups[section].mediumConfidence++;
          if (subsection && section === 9) {
            sectionGroups[section].subsections[subsection].mediumConfidence++;
          }
        } else {
          sectionGroups[section].lowConfidence++;
          if (subsection && section === 9) {
            sectionGroups[section].subsections[subsection].lowConfidence++;
          }
        }
      }
    });

    // Generate section summary report
    const sectionSummary = Object.entries(sectionGroups)
      .map(([sectionId, data]) => {
        // Convert subsections object to array for easier processing
        const subsections = Object.entries(data.subsections || {}).map(([subsectionId, subData]) => ({
          subsectionId: parseInt(subsectionId),
          fieldCount: subData.count,
          filledFieldCount: subData.filled,
          highConfidenceFields: subData.highConfidence,
          mediumConfidenceFields: subData.mediumConfidence,
          lowConfidenceFields: subData.lowConfidence,
        }));
        
        return {
          sectionId: parseInt(sectionId),
          sectionName: data.sectionName,
          fieldCount: data.count,
          filledFieldCount: data.filled,
          highConfidenceFields: data.highConfidence,
          mediumConfidenceFields: data.mediumConfidence,
          lowConfidenceFields: data.lowConfidence,
          subsections: subsections.length > 0 ? subsections : undefined
        };
      })
      .sort((a, b) => a.sectionId - b.sectionId);

    // Save the section summary - replace the existing sectionSummary code
    const summaryPath = path.join(__dirname, "../reports/section-summary.json");
    fs.writeFileSync(summaryPath, JSON.stringify(sectionSummary, null, 2));
    console.log(`Saved section summary to ${summaryPath}`);
    
    // Use the new function to save section summary to all directories
    saveSectionSummaryToAllDirectories(sectionSummary);

    // Create backward compatible format in section-data directory 
    const backwardCompatSummary: {
      sections: Record<number, { fieldCount: number }>
    } = {
      sections: {}
    };
    
    // Include all regular sections
    sectionSummary.forEach(section => {
      backwardCompatSummary.sections[section.sectionId] = {
        fieldCount: section.fieldCount
      };
    });
    
    // Add section 0 for unidentified/uncategorized fields if they exist
    const unidentifiedFields = Object.values(fieldCategories).filter(data => data.section === 0);
    if (unidentifiedFields.length > 0) {
      backwardCompatSummary.sections[0] = {
        fieldCount: unidentifiedFields.length
      };
      
      // Also add it to the section summary array for consistency
      sectionSummary.push({
        sectionId: 0,
        sectionName: "Uncategorized",
        fieldCount: unidentifiedFields.length,
        filledFieldCount: unidentifiedFields.filter(field => {
          // Get the field name from the category object
          const fieldName = Object.entries(fieldCategories)
            .find(([_, category]) => category === field)?.[0] || '';
          return getFieldValue(fieldName, fieldCategories) !== null;
        }).length,
        highConfidenceFields: 0,
        mediumConfidenceFields: 0,
        lowConfidenceFields: unidentifiedFields.length,
        subsections: undefined // Make sure this field is included to match the expected type
      });
      
      // Save updated summary with section 0 included - use our utility function
      saveSectionSummaryToAllDirectories(sectionSummary);
      
      // Save unidentified fields separately for reference
      const unidentifiedFieldList = Object.entries(fieldCategories)
        .filter(([_, category]) => category.section === 0)
        .map(([fieldName, _]) => ({
          name: fieldName,
          label: fieldLabels[fieldName] || fieldName
        }));
      
      // Use our utility function to save unidentified fields to all locations
      saveUnidentifiedFieldsToAllDirectories({
        count: unidentifiedFields.length,
        fields: unidentifiedFieldList
      });
      
      console.log(`Saved ${unidentifiedFields.length} unidentified fields to multiple directories`);
    }
    
    // Save backward compatible format - use our utility function for this too
    saveSectionSummaryToAllDirectories(backwardCompatSummary);

    // Update the console output to use the aggregated data
    console.log("\nSection Distribution:");
    for (const section of sectionSummary) {
      const filled = section.filledFieldCount;
      const total = section.fieldCount;
      const highConf = section.highConfidenceFields;
      const percentage = total > 0 ? Math.round((filled / total) * 100) : 0;
      console.log(
        `  Section ${section.sectionId} (${section.sectionName}): ${total} fields, ${filled} filled (${percentage}%), ${highConf} high confidence`
      );
      
      // Print subsection information if available (only for section 9)
      if (section.subsections && section.subsections.length > 0 && section.sectionId === 9) {
        for (const subsection of section.subsections) {
          const subFilled = subsection.filledFieldCount;
          const subTotal = subsection.fieldCount;
          const subHighConf = subsection.highConfidenceFields;
          const subPercentage = subTotal > 0 ? Math.round((subFilled / subTotal) * 100) : 0;
          
          // Get appropriate subsection name based on the form layout
          let subsectionName = "";
          if (subsection.subsectionId === 1) {
            subsectionName = "U.S. Citizen by Birth (Foreign Country)";
          } else if (subsection.subsectionId === 2) {
            subsectionName = "Naturalized U.S. Citizen";
          } else if (subsection.subsectionId === 3) {
            subsectionName = "Derived U.S. Citizen";
          } else if (subsection.subsectionId === 4) {
            subsectionName = "Not a U.S. Citizen";
          } else {
            subsectionName = `Subsection ${section.sectionId}.${subsection.subsectionId}`;
          }
          
          console.log(
            `    ${section.sectionId}.${subsection.subsectionId} (${subsectionName}): ${subTotal} fields, ${subFilled} filled (${subPercentage}%), ${subHighConf} high confidence`
          );
        }
      }
    }

    // Generate a comprehensive validation report
    console.log("\nValidation Summary:");
    console.log(`- Total fields analyzed: ${fieldMetadata.length}`);
    console.log(
      `- Fields with page data: ${
        fieldMetadata.filter((f) => f.page && f.page > 0).length
      }`
    );
    console.log(
      `- Fields without page data: ${
        fieldMetadata.filter((f) => !f.page || f.page === 0).length
      }`
    );
    console.log(
      `- Fields with labels: ${fieldMetadata.filter((f) => f.label).length}`
    );
    console.log(
      `- Fields with values: ${
        fieldMetadata.filter((f) => f.value !== undefined).length
      }`
    );
    console.log(
      `- Fields with max length: ${
        fieldMetadata.filter((f) => f.maxLength).length
      }`
    );
    console.log(
      `- Fields with options: ${
        fieldMetadata.filter((f) => f.options && f.options.length > 0).length
      }`
    );
    // console.log(
    //   `- Fields required: ${fieldMetadata.filter((f) => f.required).length}`
    // );
    // Count unique section numbers instead of fields
    const uniqueSections = new Set(Object.values(fieldCategories).map(data => data.section));
    const sectionCounts = Object.values(fieldCategories).reduce((counts, data) => {
      counts[data.section] = (counts[data.section] || 0) + 1;
      return counts;
    }, {} as Record<number, number>);
    
    console.log(`- Sections Found: ${uniqueSections.size}`);
    console.log(
      `- Total categorized fields: ${Object.values(fieldCategories).length}`
    );
    
    // Count total subsections
    const totalSubsections = sectionSummary.reduce((total, section) => 
      total + (section.subsections?.length || 0), 0);
    console.log(`- Total subsections identified: ${totalSubsections} \n`);



    console.log(`- Section Distribution:`);
    Object.entries(sectionCounts)
      .sort((a, b) => Number(a[0]) - Number(b[0]))
      .forEach(([section, count]) => {
        if (Number(section) > 0) {
          console.log(`    Section ${section}: ${count} fields`);
        }
      });

    if (sectionCounts[0]) {
      console.log(`    Unidentified (Section 0): ${sectionCounts[0]} fields`);
    }

    console.log("\nMetadata saved to:");
    console.log(`- Field metadata: ${metadataPath}`);
    console.log(`- Page mapping: ${pageMapPath}`);
    console.log(`- Field labels: ${labelsPath}`);
    console.log(`- Section statistics: ${statsPath}`);
    console.log(`- Field section grouping: ${sectionsPath}`);
    console.log(`- Section summary: ${summaryPath}`);

    console.log("\nNext steps:");
    console.log("1. Use these files as input to test-pdf-form-task3.ts");
    console.log("2. Run: npx tsx scripts/test-pdf-form-task3.ts 2");
    console.log("\nEnhanced PDF Form Field Validation complete! \n");

    // Fourth pass: Create hierarchical organization of fields
    console.log("Phase 4: Creating hierarchical organization of fields...");

    // Organize fields hierarchically by page -> field value pattern -> regex pattern -> context
    const fieldHierarchy = organizeFieldsHierarchically(
      fieldMetadata,
      fieldCategories
    );

    // Save the hierarchical organization
    const hierarchyPath = path.join(
      __dirname,
      "../reports/field-hierarchy.json"
    );
    fs.writeFileSync(hierarchyPath, JSON.stringify(fieldHierarchy, null, 2));
    console.log(`Saved hierarchical field organization to ${hierarchyPath}`);

    // Add to console output
    console.log(`- Field hierarchy: ${hierarchyPath}`);
    console.log(
      "3. Explore the field-hierarchy.json for an organized view by page, value pattern, and regex"
    );

    // Add a function to validate section assignments and enforce strict rules
    validateSectionAssignments(fieldCategories);
  } catch (error) {
    console.error("Error in enhanced validation:", error);
    process.exit(1);
  }
}

/**
 * Extract field metadata using PdfService with page information already included
 */
async function extractFieldMetadataWithPages(pdfPath: string): Promise<
  Array<{
    name: string;
    id: string;
    type: string;
    label?: string;
    value?: string | string[] | boolean;
    maxLength?: number;
    options?: string[];
    required?: boolean;
    page?: number;
  }>
> {
  // Initialize PDF service
  const pdfService = new PdfService();

  // Get field metadata using the existing service - now includes page data
  const fieldMetadata = await pdfService.extractFieldMetadata(pdfPath);

  if (DEBUG) {
    console.log(
      `Fields with page data from PdfService: ${
        fieldMetadata.filter((f) => f.page).length
      } / ${fieldMetadata.length}`
    );
  }

  return fieldMetadata;
}

/**
 * Analyze the distribution of fields across pages and sections
 */
function analyzePageDistribution(
  pageMapping: Record<string, FieldPageInfo>
): any {
  // Count fields per page - change from array to object mapping
  const fieldsByPage: Record<number, Record<string, FieldPageInfo>> = {};

  // Count fields per section based on page
  const fieldsBySection: Record<number, string[]> = {};

  // Initialize section arrays, including a special -1 section for unmatched fields
  for (let i = -1; i <= 30; i++) {
    fieldsBySection[i] = [];
  }

  // Analyze each field
  for (const [fieldName, fieldData] of Object.entries(pageMapping)) {
    const pageNumber = fieldData.page;

    // Skip fields without page data
    if (pageNumber === 0) continue;

    // Add to page count with metadata
    if (!fieldsByPage[pageNumber]) {
      fieldsByPage[pageNumber] = {};
    }

    // Create a complete field metadata object with consistent structure
    fieldsByPage[pageNumber][fieldName] = {
      label: fieldData.label || "",
      value: fieldData.value || "",
      options: fieldData.options || [],
    } as any;

    // First try the enhanced categorization with field name, label, page, and value
    const enhancedResult = enhancedSectionCategorization(
      fieldName,
      fieldData.label,
      pageNumber,
      fieldData.value
    );
    if (
      enhancedResult &&
      enhancedResult.section &&
      enhancedResult.confidence > 0.7
    ) {
      if (fieldsBySection[enhancedResult.section] !== undefined) {
        fieldsBySection[enhancedResult.section].push(fieldName);
        continue; // Skip the basic identification if we got a high confidence match
      }
    }

    // Fallback to basic identification
    const sectionId = identifySectionByPage(pageNumber);
    if (
      sectionId !== null &&
      sectionId.section >= 1 &&
      fieldsBySection[sectionId.section] !== undefined
    ) {
      fieldsBySection[sectionId.section].push(fieldName);
    }
  }

  // Prepare statistics - fields is now an object instead of an array
  const pageStats = Object.entries(fieldsByPage).map(([page, fields]) => ({
    page: parseInt(page),
    fieldCount: Object.keys(fields).length,
    fields: fields,
  }));

  const sectionStats = Object.entries(fieldsBySection)
    .filter(([section]) => parseInt(section) >= 1) // Exclude the -1 section from stats
    .map(([section, fields]) => ({
      section: parseInt(section),
      fieldCount: fields.length,
      fields: fields,
      pages: detectSectionPages(fields, pageMapping),
    }));

  // Count unmatched fields
  const unmatchedFieldCount = fieldsBySection[-1]?.length || 0;

  return {
    totalFields: Object.keys(pageMapping).length,
    fieldsWithPage: Object.values(pageMapping).filter((data) => data.page > 0)
      .length,
    fieldsWithoutPage: Object.values(pageMapping).filter(
      (data) => data.page === 0
    ).length,
    unmatchedFields: unmatchedFieldCount,
    pageStats: pageStats.sort((a, b) => a.page - b.page),
    sectionStats: sectionStats.sort((a, b) => a.section - b.section),
  };
}

/**
 * Detect the actual page range for a section based on its fields
 */
function detectSectionPages(
  fields: string[],
  pageMapping: Record<string, FieldPageInfo>
): [number, number] {
  const pages = fields
    .map((field) => pageMapping[field].page)
    .filter((page) => page > 0);

  if (pages.length === 0) {
    return [0, 0]; // No pages detected
  }

  return [Math.min(...pages), Math.max(...pages)];
}

// Add new function to generate hierarchical organization by page, value pattern, path regex, and context
function organizeFieldsHierarchically(
  fieldMetadata: any[],
  fieldCategories: Record<string, any>
): Record<number, any> {
  // Define an interface to ensure our object types are consistent
  interface FieldInfo {
    name: string;
    value: string;
    context: string;
    section: number;
    confidence: number;
    x: number;
    y: number;
    page: number;
    deviationInfo?: any;
    alternativeSections?: number[];
  }

  // Structure: page -> field value pattern -> field path regex -> context map
  const hierarchy: Record<
    number,
    {
      fieldsByValuePattern: Record<
        string,
        {
          pattern: string;
          confidence: number;
          fieldsByRegex: Record<
            string,
            {
              regex: string;
              confidence: number;
              contextMap: Record<
                string,
                FieldInfo[]
              >;
            }
          >;
        }
      >;
    }
  > = {};

  // First pass - collect expected field counts per section
  const expectedCounts: Record<number, number> = {};
  const sectionSummary = getSectionSummary(); // Get section summary
  
  // Get sections that are over-allocated (have more fields than expected)
  const overallocatedSections: Record<number, { expected: number; actual: number; excess: number }> = {};
  const underallocatedSections: Record<number, { expected: number; actual: number; missing: number }> = {};
  
  // Count fields by section for deviation analysis
  const sectionCounts: Record<number, number> = {};
  Object.values(fieldCategories).forEach(data => {
    const section = data.section || 0;
    sectionCounts[section] = (sectionCounts[section] || 0) + 1;
  });
  
  // Calculate deviations
  if (sectionSummary && typeof sectionSummary === 'object' && sectionSummary.sections) {
    Object.entries(sectionSummary.sections).forEach(([sectionId, sectionData]) => {
      const section = parseInt(sectionId, 10);
      if (!isNaN(section)) {
        // Add type safety check
        const sectionDataObj = sectionData as any;
        if (sectionDataObj && typeof sectionDataObj === 'object' && 'fieldCount' in sectionDataObj) {
          const expected = sectionDataObj.fieldCount;
          const actual = sectionCounts[section] || 0;
          
          if (actual > expected * 1.2) { // Over by 20%
            overallocatedSections[section] = {
              expected,
              actual,
              excess: actual - expected
            };
          } else if (actual < expected * 0.8) { // Under by 20%
            underallocatedSections[section] = {
              expected,
              actual,
              missing: expected - actual
            };
          }
          
          expectedCounts[section] = expected;
        }
      }
    });
  }

  // Group fields by page
  fieldMetadata.forEach((field) => {
    const page = field.page || 0;
    
    // Initialize page in hierarchy if it doesn't exist
    if (!hierarchy[page]) {
      hierarchy[page] = { fieldsByValuePattern: {} };
    }
    
    // Get field category data for this field
    const categoryData = fieldCategories[field.name] || { section: 0, confidence: 0 };
    const section = categoryData.section || 0;
    const fieldConfidence = categoryData.confidence || 0;
    
    // Determine if field's section is over-allocated
    const isOverallocated = !!overallocatedSections[section];
    const isUnderallocated = !!underallocatedSections[section];
    
    // Calculate deviation info
    let deviationInfo = null;
    if (expectedCounts[section]) {
      const expectedCount = expectedCounts[section];
      const actualCount = sectionCounts[section] || 0;
      const deviation = actualCount - expectedCount;
      const deviationPercentage = (deviation / expectedCount) * 100;
      
      deviationInfo = {
        expectedCount,
        actualCount,
        deviation,
        deviationPercentage,
        isOverallocated,
        isUnderallocated
      };
    }
    
    // Create value pattern key based on the field value
    const valuePattern = getValuePattern(field.value || "");
    
    // Initialize value pattern in page if it doesn't exist
    if (!hierarchy[page].fieldsByValuePattern[valuePattern]) {
      hierarchy[page].fieldsByValuePattern[valuePattern] = {
        pattern: valuePattern,
        confidence: 0,
        fieldsByRegex: {},
      };
    }

    // Create regex pattern for the field name
    const regexPattern = createFieldRegexPattern(field.name);
    
    // Initialize regex pattern in value pattern if it doesn't exist
    if (!hierarchy[page].fieldsByValuePattern[valuePattern].fieldsByRegex[regexPattern]) {
      hierarchy[page].fieldsByValuePattern[valuePattern].fieldsByRegex[regexPattern] = {
        regex: regexPattern,
        confidence: 0,
        contextMap: {},
      };
    }
    
    // Extract context from the field
    const context = extractFieldContext(field);
    
    // Initialize context in regex pattern if it doesn't exist
    if (!hierarchy[page].fieldsByValuePattern[valuePattern].fieldsByRegex[regexPattern].contextMap[context]) {
      hierarchy[page].fieldsByValuePattern[valuePattern].fieldsByRegex[regexPattern].contextMap[context] = [];
    }
    
    // Calculate potential alternative sections for over-allocated fields
    let alternativeSections: number[] = [];
    if (isOverallocated) {
      alternativeSections = findPotentialAlternativeSections(
        field, 
        fieldCategories, 
        Object.keys(underallocatedSections).map(s => parseInt(s, 10))
      );
    }
    
    // Add field to context
    const fieldInfo: FieldInfo = {
      name: field.name,
      value: field.value,
      context,
      section,
      confidence: fieldConfidence,
      x: field.x || 0,
      y: field.y || 0,
      page
    };
    
    // Add optional properties conditionally
    if (deviationInfo) {
      fieldInfo.deviationInfo = deviationInfo;
    }
    
    if (alternativeSections.length > 0) {
      fieldInfo.alternativeSections = alternativeSections;
    }
    
    hierarchy[page].fieldsByValuePattern[valuePattern].fieldsByRegex[regexPattern].contextMap[context].push(fieldInfo);
    
    // Update confidence scores
    const contextMapObj = hierarchy[page].fieldsByValuePattern[valuePattern].fieldsByRegex[regexPattern].contextMap;
    const confidenceSum = Object.values(contextMapObj).reduce(
      (sum, fields) => sum + fields.reduce((s, f) => s + f.confidence, 0),
      0
    );
    const fieldCount = Object.values(contextMapObj).reduce(
      (count, fields) => count + fields.length,
      0
    );
    
    // Update average confidence for the regex pattern
    hierarchy[page].fieldsByValuePattern[valuePattern].fieldsByRegex[regexPattern].confidence =
      fieldCount > 0 ? confidenceSum / fieldCount : 0;
    
    // Update value pattern confidence based on regex confidences
    const regexPatterns = hierarchy[page].fieldsByValuePattern[valuePattern].fieldsByRegex;
    const regexConfidenceSum = Object.values(regexPatterns).reduce(
      (sum, pattern) => sum + pattern.confidence,
      0
    );
    
    hierarchy[page].fieldsByValuePattern[valuePattern].confidence =
      Object.keys(regexPatterns).length > 0
        ? regexConfidenceSum / Object.keys(regexPatterns).length
        : 0;
  });

  return hierarchy;
}

/**
 * Helper function to get a standardized pattern from a field value
 */
function getValuePattern(value: string): string {
  if (!value) return "EMPTY";
  
  // Replace special patterns with placeholder tokens
  return value
    .replace(/\d+/g, "NUM")
    .replace(/[A-Z][A-Z]+/g, "CAPS")
    .replace(/[A-Z][a-z]+/g, "Word")
    .replace(/[a-z]+/g, "word")
    .substring(0, 20); // Limit length for reasonable grouping
}

/**
 * Helper function to create a regex pattern from a field name
 */
function createFieldRegexPattern(fieldName: string): string {
  // Simple version - can be enhanced for better matching
  return fieldName
    .replace(/\d+/g, "\\d+")
    .replace(/\./g, "\\.")
    .replace(/\-/g, "\\-");
}

/**
 * Extract context from a field
 */
function extractFieldContext(field: any): string {
  // Extract context based on field location and surrounding text
  // This is a placeholder - implement based on your specific needs
  return `pg${field.page || 0}_${Math.floor((field.y || 0) / 100)}`;
}

/**
 * Find potential alternative sections for a field
 */
function findPotentialAlternativeSections(
  field: any, 
  fieldCategories: Record<string, any>,
  undersizedSections: number[]
): number[] {
  const alternatives: number[] = [];
  
  // Skip if no undersized sections to consider
  if (!undersizedSections || undersizedSections.length === 0) {
    return alternatives;
  }
  
  try {
    // 1. Check nearby fields on same page - fields on same page might belong to same section
    if (field.page !== undefined) {
      // Find other fields on same page and check their sections
      const samePageFields = Object.entries(fieldCategories)
        .filter(([name, data]) => {
          return name !== field.name && 
                data.page === field.page && 
                data.section !== field.section &&
                undersizedSections.includes(data.section);
        });
      
      if (samePageFields.length > 0) {
        // Group by section and count occurrences
        const sectionCounts: Record<number, number> = {};
        samePageFields.forEach(([_, data]) => {
          const section = data.section || 0;
          if (section > 0) {
            sectionCounts[section] = (sectionCounts[section] || 0) + 1;
          }
        });
        
        // Add sections that appear frequently on this page
        Object.entries(sectionCounts)
          .filter(([_, count]) => count >= 2) // At least 2 other fields
          .forEach(([section]) => {
            alternatives.push(parseInt(section, 10));
          });
      }
      
      // 2. Check spatial proximity - fields close together might belong to same section
      if (field.x !== undefined && field.y !== undefined) {
        const spatialNeighbors = Object.entries(fieldCategories)
          .filter(([name, data]) => {
            if (name === field.name || data.page !== field.page || !undersizedSections.includes(data.section)) {
              return false;
            }
            
            // Check if fields are close together (within 100 units)
            const xDiff = Math.abs((data.x || 0) - (field.x || 0));
            const yDiff = Math.abs((data.y || 0) - (field.y || 0));
            return xDiff < 100 && yDiff < 100;
          })
          .map(([_, data]) => data.section);
          
        // Count occurrences of each section among spatial neighbors
        const spatialSections: Record<number, number> = {};
        spatialNeighbors.forEach(section => {
          if (section > 0) {
            spatialSections[section] = (spatialSections[section] || 0) + 1;
          }
        });
        
        // Add sections that appear frequently among spatial neighbors
        Object.entries(spatialSections)
          .filter(([_, count]) => count >= 1) // Even one spatial neighbor is significant
          .forEach(([section]) => {
            alternatives.push(parseInt(section, 10));
          });
      }
    }
    
    // 3. Check name patterns - use section extraction from field name
    const sectionInfo = extractSectionFromFieldName(field.name);
    if (sectionInfo && sectionInfo.section > 0 && 
        sectionInfo.section !== field.section &&
        undersizedSections.includes(sectionInfo.section)) {
      alternatives.push(sectionInfo.section);
    }
    
    // 4. Check by page ranges - use page-based section identification
    if (field.page !== undefined) {
      const pageSection = identifySectionByPage(field.page);
      if (pageSection && pageSection.section > 0 && 
          pageSection.section !== field.section &&
          undersizedSections.includes(pageSection.section)) {
        alternatives.push(pageSection.section);
      }
    }
    
    // Return unique alternatives, sorted by frequency
    const uniqueAlternatives = [...new Set(alternatives)];
    return uniqueAlternatives;
  } catch (error) {
    console.error('Error in findPotentialAlternativeSections:', error);
    return [];
  }
}

/**
 * Add spatial information analysis to the hierarchy
 */
function attachSpatialInformation(hierarchy: Record<number, any>): void {
  // Analyze each page
  for (const [pageNumStr, pageData] of Object.entries(hierarchy)) {
    const pageNum = parseInt(pageNumStr, 10);
    
    // Skip if no fields on this page
    if (!pageData.fieldsByValuePattern) continue;
    
    // Collect all fields on this page with coordinates
    const fieldsWithCoordinates: any[] = [];
    
    // Collect fields from all patterns and regexes
    Object.values(pageData.fieldsByValuePattern).forEach((patternData: any) => {
      Object.values(patternData.fieldsByRegex).forEach((regexData: any) => {
        regexData.fields.forEach((field: any) => {
          if (field.coordinates) {
            fieldsWithCoordinates.push(field);
          }
        });
      });
    });
    
    // Skip if not enough fields with coordinates
    if (fieldsWithCoordinates.length < 3) continue;
    
    // Group fields by their y-coordinate (row) with some tolerance
    const tolerance = 10; // pixels
    const rows: Record<string, any[]> = {};
    
    fieldsWithCoordinates.forEach(field => {
      const y = field.coordinates.top;
      const yKey = y.toString();
      
      // Find existing row that's close enough
      let foundRow = false;
      for (const [rowY, fields] of Object.entries(rows)) {
        if (Math.abs(parseInt(rowY) - y) <= tolerance) {
          fields.push(field);
          foundRow = true;
          break;
        }
      }
      
      // Create new row if needed
      if (!foundRow) {
        rows[yKey] = [field];
      }
    });
    
    // Analyze section distribution by row
    const rowSections: Record<string, Record<string, number>> = {};
    
    for (const [rowY, fields] of Object.entries(rows)) {
      rowSections[rowY] = {};
      
      // Count sections in this row
      fields.forEach(field => {
        const sectionKey = field.section.toString();
        rowSections[rowY][sectionKey] = (rowSections[rowY][sectionKey] || 0) + 1;
      });
    }
    
    // Add row analysis to page data
    pageData.spatialAnalysis = {
      rows: rowSections,
      pageNumber: pageNum
    };
  }
}

// Add a function to validate section assignments and enforce strict rules
function validateSectionAssignments(
  fieldCategories: Record<
    string,
    {
      section: number;
      sectionName: string;
      confidence: number;
    }
  >
): void {
  console.log("Performing strict section validation...");

  // Create a counter for corrections
  let corrections = {
    section1: 0,
    section2: 0,
    section3: 0,
    section4: 0,
    section6: 0,
    total: 0
  };

  // Create a backup of original assignments for comparison
  const originalAssignments = JSON.parse(JSON.stringify(fieldCategories));

  // Log section counts before validation
  const sectionCountsBefore: Record<number, number> = {};
  Object.values(fieldCategories).forEach(data => {
    sectionCountsBefore[data.section] = (sectionCountsBefore[data.section] || 0) + 1;
  });

  // Validate each field in fieldCategories
  Object.entries(fieldCategories).forEach(([fieldName, data]) => {
    // Validate section 1 - only fields matching strict patterns should be in section 1
    if (
      data.section === 1 &&
      !sectionFieldPatterns[1].some((pattern: RegExp) => pattern.test(fieldName))
    ) {
      data.section = 0;
      data.sectionName = "Unidentified";
      data.confidence = 0.1;
      corrections.section1++;
      corrections.total++;
    }

    // Validate section 2 - only fields matching strict patterns should be in section 2
    if (
      data.section === 2 &&
      !sectionFieldPatterns[2].some((pattern: RegExp) => pattern.test(fieldName))
    ) {
      data.section = 0;
      data.sectionName = "Unidentified";
      data.confidence = 0.1;
      corrections.section2++;
      corrections.total++;
    }

    // Validate section 3 - only fields matching strict patterns should be in section 3
    if (
      data.section === 3 &&
      !sectionFieldPatterns[3].some((pattern: RegExp) => pattern.test(fieldName))
    ) {
      data.section = 0;
      data.sectionName = "Unidentified";
      data.confidence = 0.1;
      corrections.section3++;
      corrections.total++;
    }

    // Validate section 4 - only fields matching strict patterns should be in section 4
    if (
      data.section === 4 &&
      !sectionFieldPatterns[4].some((pattern: RegExp) => pattern.test(fieldName)) &&
      !fieldName.includes("SSN[") &&
      !fieldName.toLowerCase().includes("ssn")
    ) {
      data.section = 0;
      data.sectionName = "Unidentified";
      data.confidence = 0.1;
      corrections.section4++;
      corrections.total++;
    }

    // Validate section 6 - only fields matching strict patterns should be in section 6
    if (
      data.section === 6 &&
      !sectionFieldPatterns[6].some((pattern: RegExp) => pattern.test(fieldName))
    ) {
      data.section = 0;
      data.sectionName = "Unidentified";
      data.confidence = 0.1;
      corrections.section6++;
      corrections.total++;
    }
  });

  // Log section counts after validation
  const sectionCountsAfter: Record<number, number> = {};
  Object.values(fieldCategories).forEach(data => {
    sectionCountsAfter[data.section] = (sectionCountsAfter[data.section] || 0) + 1;
  });

  // Find unidentified fields (section 0)
  const unidentifiedFields: string[] = [];
  
  for (const [fieldName, data] of Object.entries(fieldCategories)) {
    if (data.section === 0) {
      unidentifiedFields.push(fieldName);
    }
  }

  console.log("\nSection counts AFTER validation:");
  Object.entries(sectionCountsAfter).sort((a, b) => Number(a[0]) - Number(b[0])).forEach(([section, count]) => {
    if (Number(section) > 0) {
      console.log(`  Section ${section}: ${count} fields`);
    }
  });
  if (sectionCountsAfter[0]) {
    console.log(`  Unidentified fields: ${sectionCountsAfter[0]}`);
  }
  
  // Log the actual unidentified fields
  if (unidentifiedFields.length > 0) {
    console.log("\nUnidentified fields after validation:");
    unidentifiedFields.sort().forEach(fieldName => {
      // Use existing getFieldLabel function to get the label
      const label = getFieldLabel(fieldName);
      console.log(`  - ${fieldName}${label !== fieldName ? ` (${label})` : ""}`);
    });
    
    // Save unidentified fields to a separate file with more details
    const unidentifiedPath = path.join(__dirname, "../reports/unidentified-fields.json");
    fs.writeFileSync(unidentifiedPath, JSON.stringify({
      count: unidentifiedFields.length,
      fields: unidentifiedFields.map(fieldName => ({
        name: fieldName,
        label: getFieldLabel(fieldName)
      }))
    }, null, 2));
    console.log(`\nSaved ${unidentifiedFields.length} unidentified fields to ${unidentifiedPath}`);
  }

  console.log(`\nTotal field section corrections: ${corrections.total}`);
  console.log(`  Section 1 corrections: ${corrections.section1}`);
  console.log(`  Section 2 corrections: ${corrections.section2}`);
  console.log(`  Section 3 corrections: ${corrections.section3}`);
  console.log(`  Section 4 corrections: ${corrections.section4}`);
  console.log(`  Section 6 corrections: ${corrections.section6}`);
}

/**
 * Gets the value of a field, with type checking and fallbacks
 */
function getFieldValue(
  fieldName: string,
  fieldData: Record<string, FieldData> | Record<string, {
    section: number;
    sectionName: string;
    confidence: number;
  }>
): string | null {
  // When we're passing in the full field data records
  if (fieldData[fieldName] && 'value' in fieldData[fieldName]) {
    const value = (fieldData[fieldName] as FieldData).value;
    if (typeof value === "string") {
      return value.trim();
    } else if (Array.isArray(value)) {
      return value.length > 0 ? value[0].toString().trim() : null;
    } else if (typeof value === "boolean") {
      return value ? "true" : "false";
    }
  }
  return null;
}

/**
 * Gets the field label for a given field
 */
function getFieldLabel(fieldName: string): string {
  return fieldLabels[fieldName] || fieldName;
}

// Add this helper function for getting section names
function getSectionName(section: number): string {
  return sectionStructure[section]?.name || `Section ${section}`;
}

// Fix the global caching issue
// Create a global interface to extend globalThis
declare global {
  var cachedSectionSummary: any;
}

// Function to get section summary using global cache
function getSectionSummary(): any {
  try {
    // If we already have a sectionSummary loaded for this run, return it
    if (global.cachedSectionSummary) {
      return global.cachedSectionSummary;
    }
    
    // First, try to get section summary from our generated data in the reports directory
    const reportSummaryPath = path.join(__dirname, '../reports/section-summary.json');
    if (fs.existsSync(reportSummaryPath)) {
      try {
        const summaryContent = fs.readFileSync(reportSummaryPath, 'utf8');
        const summaryData = JSON.parse(summaryContent);
        
        // Check if we have section data in expected format
        if (Array.isArray(summaryData)) {
          // Convert array format to sections object format
          const sections: Record<string, any> = {};
          summaryData.forEach(section => {
            if (section.sectionId !== undefined && section.fieldCount !== undefined) {
              sections[section.sectionId] = { fieldCount: section.fieldCount };
            }
          });
          const result = { sections };
          global.cachedSectionSummary = result;
          return result;
        } else if (summaryData && summaryData.sections) {
          // Already in correct format
          global.cachedSectionSummary = summaryData;
          return summaryData;
        }
      } catch (error) {
        console.error('Error parsing section summary from reports directory:', error);
      }
    }
    
    // Next, try section-data directory
    const sectionDataPath = path.join(__dirname, '../section-data/section-summary.json');
    if (fs.existsSync(sectionDataPath)) {
      try {
        const summaryContent = fs.readFileSync(sectionDataPath, 'utf8');
        const summaryData = JSON.parse(summaryContent);
        
        // Similar conversion as above if needed
        if (Array.isArray(summaryData)) {
          // Convert array format to sections object format
          const sections: Record<string, any> = {};
          summaryData.forEach(section => {
            if (section.sectionId !== undefined && section.fieldCount !== undefined) {
              sections[section.sectionId] = { fieldCount: section.fieldCount };
            }
          });
          const result = { sections };
          global.cachedSectionSummary = result;
          return result;
        } else if (summaryData && summaryData.sections) {
          // Already in correct format
          global.cachedSectionSummary = summaryData;
          return summaryData;
        }
      } catch (error) {
        console.error('Error parsing section summary from section-data directory:', error);
      }
    }
    
    // Return empty structure if we couldn't find or parse the data
    return { sections: {} };
  } catch (error) {
    console.error('Error in getSectionSummary:', error);
    return { sections: {} };
  }
}

// Run the main function
main().catch(console.error);
