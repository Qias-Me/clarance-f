#!/usr/bin/env node

/**
 * SF-86 PDF Form Field Task 3 - Advanced Field Categorization & Validation
 * 
 * This script focuses on:
 * 1. Extracting values from sf862.pdf and categorizing them into appropriate sections
 * 2. Using complex pattern recognition to identify sections, subsections, entries, and sub-entries
 * 3. Leveraging custom context from app/state/contexts/sections for better categorization
 * 4. Generating detailed hierarchical reports for analysis
 * 
 * Dependencies:
 * - pdf-lib: For PDF manipulation and field extraction
 * - glob: For finding context files (run 'npm install glob' if missing)
 * 
 * Usage:
 *   npx tsx scripts/test-pdf-form-task3.ts       # Extract only filled fields
 *   npx tsx scripts/test-pdf-form-task3.ts 2     # Extract all fields (filled and empty)
 *    npx tsx scripts/test-pdf-form-task3.ts page 5     # Extract all fields by page (filled and empty)
 *     npx tsx scripts/test-pdf-form-task3.ts section 5     # Extract all fields by section (filled and empty)on

 * 

 * 
 * The script will:
 * - Load values from sf862.pdf
 * - Map each field to its appropriate section, subsection, entry, and sub-entry
 * - Generate detailed hierarchical reports showing the categorization
 * - Create a page distribution report and a section distribution report
 * - Update the extracted-metadata.json file with page information
 */

import * as fs from 'fs';
import * as path from 'path';
import { PdfService } from '../api/service/pdfService';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { PDFDocument, PDFString, PDFNumber, PDFArray, PDFName } from 'pdf-lib';
import * as glob from 'glob';
// Import the page categorization bridge module
import * as pageCategorization from './page-categorization-bridge';
import { 
  enhancedMultiDimensionalCategorization, 
  groupFieldsBySection as groupFieldsBySectionBridge,
  sectionClassifications,
  getNeighborFieldContext,
  identifySectionByPageWithConfidence,
  refinedSectionPageRanges,
  // Import these patterns from the page-categorization-bridge file
sectionFieldPatterns
} from './page-categorization-bridge';


// Get the current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Add collector for field metadata during processing
const collectedMetadata: any[] = [];

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
    const contexts: Record<string, SectionContext> = {};
    
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
  "signature.tsx": { id: "30", name: "Continuation Space" }
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
          
          contexts[sectionId] = contextData as SectionContext;
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
              
              contexts[sectionId] = contextData as SectionContext;
              console.log(`Inferred section context: ${sectionId} - ${sectionName} from ${basename}`);
            }
          }
        }
      } catch (fileErr) {
        console.warn(`Error processing context file ${file}:`, fileErr);
      }
    }
    
    console.log(`Successfully loaded ${Object.keys(contexts).length} section contexts`);
    return contexts;
  } catch (error) {
    console.error("Error loading section contexts:", error);
    return {};
  }
}

// Global variable to store loaded section contexts
let sectionContexts: Record<string, SectionContext> = {};

// Helper: Extract metadata from field
function collectFieldMetadata(field: {
  name?: string;
  constructor?: { name?: string };
  label?: string;
  page?: number;
  id?: string;
  defaultValue?: any;
  options?: any[];
}) {
  if (!field || !field.name) return;
  
  // Skip if we already have metadata for this field
  if (collectedMetadata.some(meta => meta.name === field.name)) return;
  
  // Extract basic field info
  const metadataEntry = {
    name: field.name,
    type: field.constructor ? field.constructor.name : undefined,
    label: field.label || undefined,
    page: field.page || undefined,
    id: field.id || undefined,
    defaultValue: field.defaultValue || undefined,
    options: field.options || undefined,
    timestamp: new Date().toISOString()
  };
  
  // Add to collection
  collectedMetadata.push(metadataEntry);
}

// Helper: Save collected metadata
function saveCollectedMetadata() {
  try {
    if (collectedMetadata.length === 0) {
      console.log("No new metadata collected, skipping save");
      return;
    }
    
    const reportsDir = path.resolve(__dirname, "../reports");
    
    // Create directory if it doesn't exist
    if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir, { recursive: true });
    }
    
    const metadataPath = path.resolve(reportsDir, "extracted-metadata.json");
    
    // Merge with existing metadata if available
    let combinedMetadata: any[] = [...collectedMetadata];
    
    if (fs.existsSync(metadataPath)) {
      try {
        const existingMetadata = JSON.parse(fs.readFileSync(metadataPath, 'utf-8'));
        
        if (Array.isArray(existingMetadata)) {
          // Create a map for more efficient lookup 
          const existingMetadataMap = new Map(
            existingMetadata.map(meta => [meta.name, meta])
          );
          
          // Merge: preserve existing entries but update with new page information if available
          const newMetadata: any[] = [];
          
          for (const newMeta of collectedMetadata) {
            const existingMeta = existingMetadataMap.get(newMeta.name);
            
            if (existingMeta) {
              // Update existing metadata with new page information if available
              if (newMeta.page !== null && existingMeta.page === null) {
                existingMeta.page = newMeta.page;
                console.log(`Updated page info for field ${newMeta.name}: page ${newMeta.page}`);
              }
              // Keep existing metadata (now possibly updated with page info)
            } else {
              // Add completely new metadata
              newMetadata.push(newMeta);
            }
          }
          
          // Combine existing with new
          combinedMetadata = [...existingMetadata, ...newMetadata];
          
          console.log(`Adding ${newMetadata.length} new metadata entries to existing ${existingMetadata.length} entries`);
          console.log(`Updated page information for ${existingMetadata.filter(meta => meta.page !== null).length} entries`);
        }
      } catch (err) {
        console.warn("Error reading existing metadata, using only collected metadata:", err);
      }
    }
    
    // Write combined metadata
    fs.writeFileSync(metadataPath, JSON.stringify(combinedMetadata, null, 2));
    console.log(`Saved ${combinedMetadata.length} metadata entries to ${metadataPath}`);
    
  } catch (err: any) {
    console.warn(`Failed to save collected metadata: ${err.message}`);
  }
}

// Helper function to create empty metadata file if none exists
function createEmptyMetadataFile() {
  try {
    const reportsDir = path.resolve(__dirname, "../reports");
    
    // Create reports directory if it doesn't exist
    if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir, { recursive: true });
    }
    
    const metadataPath = path.resolve(reportsDir, "extracted-metadata.json");
    
    // Check if file already exists, don't overwrite
    if (!fs.existsSync(metadataPath)) {
      console.log(`Creating empty metadata file at: ${metadataPath}`);
      fs.writeFileSync(metadataPath, JSON.stringify([], null, 2));
      return metadataPath;
    }
    
    return null;
  } catch (err: any) {
    console.warn(`Failed to create empty metadata file: ${err.message}`);
    return null;
  }
}

// Load extracted metadata for cross-referencing
let extractedMetadata: any[] = [];
try {
  // Fix: Check both possible locations for the metadata file
  const metadataPath1 = path.resolve(__dirname, 'extracted-metadata.json');
  const metadataPath2 = path.resolve(__dirname, '../reports/extracted-metadata.json');
  const metadataPath3 = path.resolve(__dirname, '../tools/extracted-metadata.json');
  
  let metadataPath = '';
  if (fs.existsSync(metadataPath1)) {
    metadataPath = metadataPath1;
  } else if (fs.existsSync(metadataPath2)) {
    metadataPath = metadataPath2;
  } else if (fs.existsSync(metadataPath3)) {
    metadataPath = metadataPath3;
  }
  
  if (metadataPath && fs.existsSync(metadataPath)) {
    console.log(`Loading metadata from: ${metadataPath}`);
    const metadataContent = fs.readFileSync(metadataPath, 'utf-8');
    try {
      extractedMetadata = JSON.parse(metadataContent);
      if (!Array.isArray(extractedMetadata)) {
        console.warn('Metadata is not an array, converting to empty array');
        extractedMetadata = [];
      }
    } catch (parseErr) {
      console.warn('Could not parse metadata JSON:', parseErr);
      extractedMetadata = [];
    }
  } else {
    console.warn('Could not find extracted-metadata.json in any of the expected locations');
    
    // Create empty metadata file if none exists
    const newMetadataPath = createEmptyMetadataFile();
    if (newMetadataPath) {
      console.log(`Created empty metadata file at: ${newMetadataPath}`);
    }
  }
} catch (err) {
  console.warn('Error loading extracted-metadata.json:', err);
  extractedMetadata = [];
}

// Helper: Find metadata entry by field name
function getMetadataByName(fieldName: string) {
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

// Updated section structure based on the context directories in the app
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
  29: { name: "Association" },
  30: {name: "Continuation"}
};

// Enhanced pattern-based heuristics for identifying sections - defined at the top level
const sectionPatterns: Array<{ pattern: RegExp, sectionId: number, subsectionId: string, confidence: number }> = [
  // Section 1: Personal Information
  { pattern: /Name|Full|First|Last|Middle|Suffix/i, sectionId: 1, subsectionId: "personal", confidence: 0.8 },
  { pattern: /Height|Weight|Hair|Eye|Sex|Gender/i, sectionId: 1, subsectionId: "physical", confidence: 0.8 },
  

  // Section 4: Social Security Number
  { pattern: /SSN|Social.*Security|SS#/i, sectionId: 4, subsectionId: "ssn", confidence: 0.9 },
  
  // Section 5: Other Names
  { pattern: /Other.*Names|Alias|Maiden|Previous/i, sectionId: 5, subsectionId: "othernames", confidence: 0.8 },
  
  // Section 6: Current Address
  { pattern: /Current.*Address|Street|City|State|ZIP|County|Country.*of.*Residence/i, sectionId: 6, subsectionId: "address", confidence: 0.8 },
  
  // Section 7: Contact Information
  { pattern: /Phone|Telephone|Mobile|Cell|Email|E-mail|Contact/i, sectionId: 7, subsectionId: "contact", confidence: 0.8 },
  
  // Section 8: Passport
  { pattern: /Passport|Travel.*Document|Book.*Number/i, sectionId: 8, subsectionId: "passport", confidence: 0.9 },
  
  // Section 9: Citizenship
  { pattern: /Citizen|National|Naturalized|Status/i, sectionId: 9, subsectionId: "citizenship", confidence: 0.8 },
  
  // Section 10: Dual Citizenship
  { pattern: /Dual.*Citizen|Multiple.*Citizenship|Foreign.*Citizen/i, sectionId: 10, subsectionId: "dual", confidence: 0.9 },
  
  // Section 11: Alien Registration
  { pattern: /Alien|Registration|Permanent.*Resident|Green.*Card|USCIS|Section11-4/i, sectionId: 11, subsectionId: "alien", confidence: 0.95 },
  
  // Section 12: People Who Know You Well
  { pattern: /References|People.*Know.*You|People.*Who.*Know/i, sectionId: 12, subsectionId: "references", confidence: 0.8 },
  
  // Section 13: Residence
  { pattern: /Residence|Where.*You.*Lived|Address.*History|section13_|Section13/i, sectionId: 13, subsectionId: "residence", confidence: 0.95 },
  
  // Section 14: Education
  { pattern: /Education|School|College|University|Degree/i, sectionId: 14, subsectionId: "education", confidence: 0.8 },
  
  // Section 15: Employment
  { pattern: /Employment|Employer|Job|Work|Company/i, sectionId: 15, subsectionId: "employment", confidence: 0.8 },
  
  // Section 16: Employment Activities
  { pattern: /Employment.*Activities|Job.*History|Work.*History/i, sectionId: 16, subsectionId: "activities", confidence: 0.8 },
  
  // Section 17: Selective Service
  { pattern: /Selective.*Service|Draft|Military.*Registration/i, sectionId: 17, subsectionId: "selective", confidence: 0.8 },
  
  // Section 18: Military History
  { pattern: /Military|Service|Armed.*Forces|Discharge|Branch/i, sectionId: 18, subsectionId: "military", confidence: 0.8 },
  
  // Section 19: Foreign Contacts
  { pattern: /Foreign.*Contact|Foreign.*National|Foreign.*Person/i, sectionId: 19, subsectionId: "contacts", confidence: 0.8 },
  
  // Section 20: Foreign Activities
  { pattern: /Foreign.*Activities|Overseas|International.*Activities/i, sectionId: 20, subsectionId: "activities", confidence: 0.8 },
  
  // Section 21: Foreign Business
  { pattern: /Foreign.*Business|International.*Business|Foreign.*Company/i, sectionId: 21, subsectionId: "business", confidence: 0.8 },
  
  // Section 22: Mental Health
  { pattern: /Mental.*Health|Psychological|Counseling|Therapy/i, sectionId: 22, subsectionId: "mental", confidence: 0.8 },
  
  // Section 23: Alcohol
  { pattern: /Alcohol|Drinking|Intoxication/i, sectionId: 23, subsectionId: "alcohol", confidence: 0.8 },
  
  // Section 24: Drugs
  { pattern: /Drug|Substance|Narcotic|Controlled.*Substance/i, sectionId: 24, subsectionId: "drugs", confidence: 0.8 },
  
  // Section 25: Financial Record
  { pattern: /Financial|Money|Debt|Bankrupt|Credit/i, sectionId: 25, subsectionId: "financial", confidence: 0.8 },
  
  // Section 26: Civil Court Record
  { pattern: /Civil.*Court|Litigation|Lawsuit/i, sectionId: 26, subsectionId: "civil", confidence: 0.8 },
  
  // Section 27: Investigative History
  { pattern: /Investigation|Background.*Check|Clearance|Security/i, sectionId: 27, subsectionId: "investigative", confidence: 0.8 },
  
  // Section 28: Public Record
  { pattern: /Public.*Record|Criminal|Arrest|Charge/i, sectionId: 28, subsectionId: "public", confidence: 0.8 },
  
  // Section 29: Signature and Certification
  { pattern: /association|Association|Associ|Date.*Signed|Attestation/i, sectionId: 29, subsectionId: "association", confidence: 0.9 },
];

// Add specific field patterns for the fields mentioned in the user query - defined at the top level
const fieldCategories = new Map<string, { sectionId: number, subsectionId: string, confidence: number }>([
  // Section 1: Personal Information
  ["Name_First", { sectionId: 1, subsectionId: "personal", confidence: 1.0 }],
  ["Name_Last", { sectionId: 1, subsectionId: "personal", confidence: 1.0 }],
  ["Name_Middle", { sectionId: 1, subsectionId: "personal", confidence: 1.0 }],
  ["Name_Suffix", { sectionId: 1, subsectionId: "personal", confidence: 1.0 }],
  ["firstName", { sectionId: 1, subsectionId: "personal", confidence: 1.0 }],
  ["lastName", { sectionId: 1, subsectionId: "personal", confidence: 1.0 }],
  ["middleName", { sectionId: 1, subsectionId: "personal", confidence: 1.0 }],
  ["suffix", { sectionId: 1, subsectionId: "personal", confidence: 1.0 }],
  ["height", { sectionId: 1, subsectionId: "physical", confidence: 0.9 }],
  ["weight", { sectionId: 1, subsectionId: "physical", confidence: 0.9 }],
  ["hairColor", { sectionId: 1, subsectionId: "physical", confidence: 0.9 }],
  ["eyeColor", { sectionId: 1, subsectionId: "physical", confidence: 0.9 }],
  ["sex", { sectionId: 1, subsectionId: "physical", confidence: 0.9 }],
  
  // Section 2: Date of Birth
  ["DOB", { sectionId: 2, subsectionId: "birth", confidence: 1.0 }],

  // Section 3: Place of Birth
  ["birthCity", { sectionId: 3, subsectionId: "birthplace", confidence: 1.0 }],
  ["birthCounty", { sectionId: 3, subsectionId: "birthplace", confidence: 1.0 }],
  ["birthState", { sectionId: 3, subsectionId: "birthplace", confidence: 1.0 }],
  ["birthCountry", { sectionId: 3, subsectionId: "birthplace", confidence: 1.0 }],
  
  // Section 4: Social Security Number
  ["SSN", { sectionId: 4, subsectionId: "ssn", confidence: 1.0 }],
  ["socialSecurityNumber", { sectionId: 4, subsectionId: "ssn", confidence: 1.0 }],
  ["ssn1", { sectionId: 4, subsectionId: "ssn", confidence: 1.0 }],
  ["ssn2", { sectionId: 4, subsectionId: "ssn", confidence: 1.0 }],
  ["ssn3", { sectionId: 4, subsectionId: "ssn", confidence: 1.0 }],
  
  // Section 5: Other Names Used
  ["OtherNames", { sectionId: 5, subsectionId: "othernames", confidence: 1.0 }],
  ["alias", { sectionId: 5, subsectionId: "othernames", confidence: 1.0 }],
  ["maidenName", { sectionId: 5, subsectionId: "othernames", confidence: 0.9 }],
  
  // Section 6: Current Address
  ["CurrentAddress", { sectionId: 6, subsectionId: "address", confidence: 1.0 }],
  ["address", { sectionId: 6, subsectionId: "address", confidence: 0.9 }],
  ["street", { sectionId: 6, subsectionId: "address", confidence: 0.9 }],
  ["city", { sectionId: 6, subsectionId: "address", confidence: 0.9 }],
  ["state", { sectionId: 6, subsectionId: "address", confidence: 0.9 }],
  ["zipCode", { sectionId: 6, subsectionId: "address", confidence: 0.9 }],
  
  // Section 7: Contact Information
  ["Phone", { sectionId: 7, subsectionId: "phone", confidence: 1.0 }],
  ["Email", { sectionId: 7, subsectionId: "email", confidence: 1.0 }],
  ["homePhone", { sectionId: 7, subsectionId: "phone", confidence: 0.9 }],
  ["workPhone", { sectionId: 7, subsectionId: "phone", confidence: 0.9 }],
  ["mobilePhone", { sectionId: 7, subsectionId: "phone", confidence: 0.9 }],
  ["emailAddress", { sectionId: 7, subsectionId: "email", confidence: 0.9 }],
  
  // Section 8: U.S. Passport Information
  ["Passport", { sectionId: 8, subsectionId: "passport", confidence: 1.0 }],
  ["passportNumber", { sectionId: 8, subsectionId: "passport", confidence: 1.0 }],
  ["passportIssuedDate", { sectionId: 8, subsectionId: "passport", confidence: 1.0 }],
  ["passportExpirationDate", { sectionId: 8, subsectionId: "passport", confidence: 1.0 }],
  
  // Section 9: Citizenship
  ["Citizenship_Status", { sectionId: 9, subsectionId: "status", confidence: 1.0 }],
  ["Citizenship_ByBirth", { sectionId: 9, subsectionId: "status", confidence: 0.9 }],
  ["Citizenship_Naturalized", { sectionId: 9, subsectionId: "naturalized", confidence: 0.9 }],
  ["Citizenship_Derived", { sectionId: 9, subsectionId: "derived", confidence: 0.9 }],
  ["Citizenship_Alien", { sectionId: 9, subsectionId: "alien", confidence: 0.9 }],
  ["citizenshipStatus", { sectionId: 9, subsectionId: "status", confidence: 1.0 }],
  
  // Section 10: Dual Citizenship
  ["DualCitizenship", { sectionId: 10, subsectionId: "dual", confidence: 1.0 }],
  ["hasDualCitizenship", { sectionId: 10, subsectionId: "dual", confidence: 1.0 }],
  ["dualCountry", { sectionId: 10, subsectionId: "dual", confidence: 1.0 }],
  
  // Section 11: Alien Registration - Add specific patterns
  ["AlienRegistration", { sectionId: 11, subsectionId: "alien", confidence: 1.0 }],
  ["alienRegistrationNumber", { sectionId: 11, subsectionId: "alien", confidence: 1.0 }],
  ["Section11-4", { sectionId: 11, subsectionId: "alien", confidence: 1.0 }], // Direct match for Section11-4 pattern
  ["RadioButtonList", { sectionId: 11, subsectionId: "alien", confidence: 0.8 }], // Common in Section 11
  
  // Section 12: People Who Know You Well
  ["References", { sectionId: 12, subsectionId: "references", confidence: 1.0 }],
  ["Verifier", { sectionId: 12, subsectionId: "references", confidence: 0.9 }],
  ["KnownBy", { sectionId: 12, subsectionId: "references", confidence: 0.9 }],
  
  // Section 13: Residence - Add specific patterns
  ["Residence", { sectionId: 13, subsectionId: "residence", confidence: 1.0 }],
  ["section13_2-2", { sectionId: 13, subsectionId: "residence", confidence: 1.0 }], // Direct match for section13_2-2 pattern
  ["section13_", { sectionId: 13, subsectionId: "residence", confidence: 0.95 }], // Broader match for Section 13
  ["SupervisorName", { sectionId: 13, subsectionId: "residence", confidence: 0.9 }], // Common in Section 13
  
  // Section 29: Certification and Signature
  ["Signature", { sectionId: 29, subsectionId: "signature", confidence: 1.0 }],
  ["Certified", { sectionId: 29, subsectionId: "signature", confidence: 1.0 }],
  ["signatureDate", { sectionId: 29, subsectionId: "signature", confidence: 1.0 }]
]);

// Add more sophisticated pattern detection for field names
interface FieldPattern {
  section: number;
  subsection?: string | number;
  entry?: number;
  subEntry?: number;
  type?: string;
  confidence: number;
}

// Enhanced function to parse complex field name patterns
function parseFieldNamePattern(fieldName: string): FieldPattern | null {
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
      // For this we need to look at the field name further
      
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
    return extractSectionFromFieldName(fieldName);
    
  } catch (error) {
    console.warn(`Error parsing field pattern for ${fieldName}:`, error);
    return null;
  }
}

// Helper to extract basic section information
function extractSectionFromFieldName(fieldName: string): FieldPattern | null {
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

// Update the PdfField interface to handle more value types and add id property
interface PdfField {
  name: string;
  value?: string | string[] | boolean; // Updated to support multiple value types
  section?: number;
  subsection?: string;
  entry?: number;
  subEntry?: number;
  confidence?: number;
  page?: number;
  label?: string;
  type?: string;
  id?: string;           // Add id property
  maxLength?: number;    // Add field constraint metadata
  options?: string[];    // Add field options
  required?: boolean;    // Add required flag
}

// Helper function to update field with page data using widget information
function updateFieldWithPageData(field: PdfField, pdfDoc: any): void {
  try {
    if (!field.name || !pdfDoc) return;
    
    const form = pdfDoc.getForm();
    if (!form) return;
    
    const pdfField = form.getField(field.name);
    if (!pdfField) return;
    
    const widgets = pdfField.getWidgets();
    if (!widgets || widgets.length === 0) return;
    
    const widget = widgets[0];
    if (!widget || !widget.getPage) return;
    
    const page = widget.getPage();
    if (!page) return;
    
    field.page = page.getIndex() + 1; // PDF pages are 0-indexed, convert to 1-indexed
  } catch (error) {
    console.warn(`Error updating field page data for ${field.name}:`, error);
  }
}

// Helper function to extract page information for a field
async function getFieldPageInfo(pdfDoc: any, fieldName: string): Promise<{ pageNumber: number } | null> {
  try {
    // Get the form from the PDF document
    const form = pdfDoc.getForm();
    if (!form) return null;
    
    // Try to get the field by name
    const field = form.getField(fieldName);
    if (!field) return null;
    
    // Try to get page from widgets first (most direct method)
    const widgets = field.getWidgets();
    if (widgets && widgets.length > 0) {
      const widget = widgets[0];
      if (widget && widget.getPage) {
        const page = widget.getPage();
        if (page) {
          return { pageNumber: page.getIndex() + 1 }; // 1-based page number
        }
      }
    }
    
    // Fallback: Examine each page for the field annotations
    const pageCount = pdfDoc.getPageCount();
    
    for (let i = 0; i < pageCount; i++) {
      const page = pdfDoc.getPage(i);
      const annotations = page.getAnnotations();
      
      for (const annotation of annotations) {
        // Check annotation for field name match
        if (annotation.getFieldName && annotation.getFieldName() === fieldName) {
          return { pageNumber: i + 1 }; // 1-based page number
        }
      }
    }
    
    return null;
  } catch (error) {
    console.warn(`Error getting page info for field ${fieldName}:`, error);
    return null;
  }
}



// Add a new function to detect section from field value naming pattern
function detectSectionFromFieldValue(value: string | string[] | boolean | undefined): { 
  section: number, 
  subsection?: string, 
  entry?: number, 
  confidence: number 
} | null {
  // Use the imported function from page-categorization-bridge
  const result = pageCategorization.detectSectionFromFieldValue(value);
  if (!result) return null;
  
  // Map the result to the expected format for backward compatibility
  return {
    section: result.section,
    subsection: result.subsection,
    entry: result.entry,
    confidence: result.confidence
  };
}

// Replace the categorizeField function with a direct whitelist approach for sections 1 and 3
function categorizeField(field: PdfField): { section: number, confidence: number } {
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
      
      // Rest of the function remains the same...
    }
    
    // Default to section 6 (identifying info) for most unidentified fields
    return { section: 6, confidence: 0.5 };
  } catch (error) {
    console.warn(`Error in categorizeField for ${field.name}:`, error);
    return { section: 0, confidence: 0 };
  }
}

// Update the categorizeSections1to6Field function to use the strict patterns for section 3
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
  
  // PRIORITY 2: Check for page information from metadata
  const metadata = getMetadataByName(fieldName);
  if (metadata && metadata.page) {
    const pageResult = identifySectionByPage(metadata.page);
    if (pageResult && pageResult.section > 0 && pageResult.confidence >= 0.7) {
      // Never use page data to override to sections 1, 2, or 3
      if (pageResult.section !== 1 && pageResult.section !== 2 && pageResult.section !== 3) {
        return { 
          section: pageResult.section, 
          confidence: 0.8 // Good confidence for page-based matching
        };
      }
    }
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
  
  // PRIORITY 4: Check specific patterns for each section
  for (const [sectionId, patterns] of Object.entries(sectionFieldPatterns)) {
    // Skip section 1 and 3 since we've already handled them with strict patterns
    if (sectionId === '1' || sectionId === '3') continue;
    
    for (const pattern of patterns) {
      if (pattern.test(fieldName)) {
        return {
          section: parseInt(sectionId),
          confidence: 0.85 // High confidence for pattern match
        };
      }
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

// Add new helper function for section organization - add this near generateReports
function groupFieldsBySection(fields: PdfField[]): Record<number, PdfField[]> {
  const sections: Record<number, PdfField[]> = {};
  
  // Initialize arrays for all 30 sections plus unidentified (0)
  for (let i = 0; i <= 30; i++) {
    sections[i] = [];
  }
  
  // Group fields by section
  for (const field of fields) {
    const section = field.section || 0;
    sections[section].push(field);
  }
  
  return sections;
}



// Add this helper function to identify section by page
function identifySectionByPage(pageNum: number): { section: number, confidence: number } | null {
  // Use the imported function from page-categorization-bridge
  return identifySectionByPageWithConfidence(pageNum);
}

// Add these functions for report generation
async function generateReports(validFields: PdfField[], unidentifiedFields: PdfField[]) {
  try {
    console.log("\nGenerating reports...");
    const reportsDir = path.resolve(__dirname, "../reports");
    
    // Create directory if it doesn't exist
    if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir, { recursive: true });
    }
    
    // Group fields by section
    const fieldsBySection = groupFieldsBySection(validFields);
    fieldsBySection[0] = unidentifiedFields; // Add unidentified fields
    
    // Create a comprehensive section report
    const sectionReport: Record<string, any> = {
      metadata: {
        timestamp: new Date().toISOString(),
        totalFields: validFields.length + unidentifiedFields.length,
        identifiedFields: validFields.length,
        unidentifiedFields: unidentifiedFields.length
      },
      sections: {}
    };
    
    // Populate section data with hierarchical organization
    for (let sectionId = 0; sectionId <= 30; sectionId++) {
      const sectionFields = fieldsBySection[sectionId];
      if (sectionFields.length === 0) continue;
      
      // Get section name from contexts or default
      const sectionName = sectionId === 0 
        ? "Unidentified" 
        : (sectionContexts[sectionId]?.name || 
           sectionClassifications.find(s => s.sectionId === sectionId)?.name || 
           `Section ${sectionId}`);
      
      // Group by subsection
      const subsections: Record<string, PdfField[]> = {};
      for (const field of sectionFields) {
        const subsection = field.subsection || 'default';
        if (!subsections[subsection]) {
          subsections[subsection] = [];
        }
        subsections[subsection].push(field);
      }
      
      // Calculate average confidence
      const avgConfidence = sectionFields.reduce((sum, field) => sum + (field.confidence || 0), 0) / sectionFields.length;
      
      // Identify pages where this section appears
      const pages = Array.from(new Set(sectionFields.filter(f => f.page).map(f => f.page))) as number[];
      
      // Add section to report
      sectionReport.sections[sectionId] = {
        name: sectionName,
        fieldCount: sectionFields.length,
        averageConfidence: avgConfidence,
        pages: pages.sort((a, b) => a - b),
        subsections: Object.keys(subsections).map(key => ({
          name: key,
          fieldCount: subsections[key].length,
          fields: subsections[key].map(field => ({
            name: field.name,
            page: field.page,
            value: field.value,
            confidence: field.confidence
          }))
        }))
      };
    }
    
    // Save section report
    const sectionReportPath = path.join(reportsDir, "section-report.json");
    fs.writeFileSync(sectionReportPath, JSON.stringify(sectionReport, null, 2));
    console.log(`Saved section report to ${sectionReportPath}`);
    
    // Generate field-section mapping for easier lookups
    const fieldSectionMapping: Record<string, {
      section: number;
      sectionName: string;
      subsection?: string;
      page?: number;
      confidence: number;
    }> = {};
    
    for (const field of validFields) {
      if (field.section !== undefined) {
        const sectionId = field.section;
        const sectionName = sectionId === 0 
          ? "Unidentified" 
          : (sectionContexts[sectionId]?.name || 
            sectionClassifications.find(s => s.sectionId === sectionId)?.name || 
            `Section ${sectionId}`);
            
        fieldSectionMapping[field.name] = {
          section: sectionId,
          sectionName: sectionName,
          subsection: field.subsection,
          page: field.page,
          confidence: field.confidence || 0
        };
      }
    }
    
    // Save field-section mapping
    const mappingPath = path.join(reportsDir, "field-sections.json");
    fs.writeFileSync(mappingPath, JSON.stringify(fieldSectionMapping, null, 2));
    console.log(`Saved field-section mapping to ${mappingPath}`);
    
    // Generate section distribution summary
    const sectionSummary: Record<string, any> = {
      metadata: {
        timestamp: new Date().toISOString(),
        totalFields: validFields.length + unidentifiedFields.length
      },
      sectionCounts: {},
      confidenceDistribution: {
        high: 0,    // 0.8-1.0
        medium: 0,  // 0.5-0.79
        low: 0      // 0-0.49
      }
    };
    
    // Calculate section stats
    for (let sectionId = 0; sectionId <= 30; sectionId++) {
      const fields = fieldsBySection[sectionId];
      if (fields.length === 0) continue;
      
      // Get section name
      const sectionName = sectionId === 0 
        ? "Unidentified" 
        : (sectionContexts[sectionId]?.name || 
           sectionClassifications.find(s => s.sectionId === sectionId)?.name || 
           `Section ${sectionId}`);
      
      // Calculate confidence levels
      const highConfCount = fields.filter(f => (f.confidence || 0) >= 0.8).length;
      const medConfCount = fields.filter(f => (f.confidence || 0) >= 0.5 && (f.confidence || 0) < 0.8).length;
      const lowConfCount = fields.filter(f => (f.confidence || 0) < 0.5).length;
      
      // Update global confidence counts
      sectionSummary.confidenceDistribution.high += highConfCount;
      sectionSummary.confidenceDistribution.medium += medConfCount;
      sectionSummary.confidenceDistribution.low += lowConfCount;
      
      // Add section stats
      sectionSummary.sectionCounts[sectionId] = {
        name: sectionName,
        count: fields.length,
        confidence: {
          high: highConfCount,
          medium: medConfCount,
          low: lowConfCount
        },
        percentage: ((fields.length / validFields.length) * 100).toFixed(2) + '%'
      };
    }
    
    // Save section summary
    const summaryPath = path.join(reportsDir, "section-summary.json");
    fs.writeFileSync(summaryPath, JSON.stringify(sectionSummary, null, 2));
    console.log(`Saved section summary to ${summaryPath}`);
    
    // Generate additional reports for backward compatibility
    await generateSectionDistributionReport(validFields, unidentifiedFields);
    await generatePageSummaryReport(validFields);
    
    console.log("Report generation complete.");
  } catch (error) {
    console.error("Error generating reports:", error);
  }
}

// Add a simple page summary report generator function
async function generatePageSummaryReport(validFields: PdfField[]) {
  try {
    const reportsDir = path.resolve(__dirname, "../reports");
    
    // Count fields per page
    const pageStats: Record<number, {
      fieldCount: number,
      fields: string[]
    }> = {};
    
    let fieldsWithPage = 0;
    let fieldsWithoutPage = 0;
    
    for (const field of validFields) {
      if (field.page) {
        fieldsWithPage++;
        if (!pageStats[field.page]) {
          pageStats[field.page] = { fieldCount: 0, fields: [] };
        }
        pageStats[field.page].fieldCount++;
        pageStats[field.page].fields.push(field.name);
      } else {
        fieldsWithoutPage++;
      }
    }
    
    // Create the page stats report
    const pageStatsReport = {
      totalFields: validFields.length,
      fieldsWithPage,
      fieldsWithoutPage,
      unmatchedFields: 0,
      pageStats: Object.entries(pageStats).map(([page, stats]) => ({
        page: parseInt(page),
        fieldCount: stats.fieldCount,
        fields: stats.fields
      })).sort((a, b) => a.page - b.page)
    };
    
    // Save the report
    const reportPath = path.join(reportsDir, "page-stats-report.json");
    fs.writeFileSync(reportPath, JSON.stringify(pageStatsReport, null, 2));
    console.log(`Saved page statistics to ${reportPath}`);
  } catch (error) {
    console.error("Error generating page summary report:", error);
  }
}

// Specifically target the generateSectionDistributionReport function
async function generateSectionDistributionReport(validFields: PdfField[], unidentifiedFields: PdfField[]) {
  try {
    const reportsDir = path.resolve(__dirname, "../reports");
    
    // Get all strict pattern fields for sections 1 and 3
    const section1Fields = validFields.filter(field => 
      field.name && sectionFieldPatterns[1] && sectionFieldPatterns[1].some(pattern => pattern.test(field.name))
    );
    
    const section3Fields = validFields.filter(field => 
      field.name && sectionFieldPatterns[3] && sectionFieldPatterns[3].some(pattern => pattern.test(field.name))
    );
    
    console.log(`Strict filtering found ${section1Fields.length} fields for Section 1`);
    console.log(`Strict filtering found ${section3Fields.length} fields for Section 3`);
    
    // Count fields per section
    const sectionCounts: Record<number, { 
      count: number; 
      filled: number; 
      withPage: number; 
      sectionName: string;
    }> = {};
    
    // Initialize section counts
    for (let i = 0; i <= 30; i++) {
      const sectionName = i === 0 
        ? "Unidentified" 
        : (sectionContexts[i]?.name || 
           sectionClassifications.find(s => s.sectionId === i)?.name || 
           `Section ${i}`);
           
      sectionCounts[i] = { 
        count: 0, 
        filled: 0, 
        withPage: 0, 
        sectionName 
      };
    }
    
    // First pass: count all fields except those in sections 1 and 3
    validFields.forEach(field => {
      // Skip fields in sections 1 and 3 - these will be handled specially
      if (!field.section || field.section === 1 || field.section === 3) {
        return;
      }
      
      sectionCounts[field.section].count++;
      
      if (field.value !== undefined && field.value !== '') {
        sectionCounts[field.section].filled++;
      }
      
      if (field.page !== undefined) {
        sectionCounts[field.section].withPage++;
      }
    });
    
    // Second pass: handle section 1 and 3 with strict field lists
    // Set exact counts for section 1 based on strict patterns
    sectionCounts[1] = {
      count: section1Fields.length,
      filled: section1Fields.filter(f => f.value !== undefined && f.value !== '').length,
      withPage: section1Fields.filter(f => f.page !== undefined).length,
      sectionName: sectionCounts[1].sectionName
    };
    
    // Set exact counts for section 3 based on strict patterns
    sectionCounts[3] = {
      count: section3Fields.length,
      filled: section3Fields.filter(f => f.value !== undefined && f.value !== '').length,
      withPage: section3Fields.filter(f => f.page !== undefined).length,
      sectionName: sectionCounts[3].sectionName
    };
    
    // Calculate unidentified fields
    sectionCounts[0].count = unidentifiedFields.length;
    sectionCounts[0].filled = unidentifiedFields.filter(f => f.value !== undefined && f.value !== '').length;
    sectionCounts[0].withPage = unidentifiedFields.filter(f => f.page !== undefined).length;
    
    // Create report - count total valid fields excluding section 1 and 3 first
    const totalValidFieldsExcluding1And3 = Object.entries(sectionCounts)
      .filter(([section]) => parseInt(section) > 0 && parseInt(section) !== 1 && parseInt(section) !== 3)
      .reduce((sum, [_, data]) => sum + data.count, 0);
    
    // Add back the strictly filtered section 1 and 3 fields
    const totalValidFields = totalValidFieldsExcluding1And3 + section1Fields.length + section3Fields.length;
    
    const sectionCountsArray = Object.entries(sectionCounts)
      .filter(([section]) => parseInt(section) > 0) // Exclude unidentified
      .map(([section, data]) => ({
        sectionId: parseInt(section),
        name: data.sectionName,
        count: data.count,
        filled: data.filled,
        withPage: data.withPage,
        percentage: `${(data.count / totalValidFields * 100).toFixed(2)}%`
      }))
      .sort((a, b) => a.sectionId - b.sectionId);
    
    const report = {
      totalFields: totalValidFields + unidentifiedFields.length,
      identifiedFields: totalValidFields,
      unidentifiedFields: unidentifiedFields.length,
      sections: sectionCountsArray
    };
    
    // Write report to file
    const reportPath = path.resolve(reportsDir, "section-distribution.json");
    await fs.promises.writeFile(reportPath, JSON.stringify(report, null, 2));
    
    console.log(`Saved section distribution to ${reportPath}`);
    return report;
  } catch (error) {
    console.error('Error generating section distribution report:', error);
    throw error;
  }
}

// Add a new function to create the hierarchical field organization
async function generateHierarchicalFieldOrganization(fields: PdfField[]): Promise<Record<number, any>> {
  // Structure: page -> field value pattern -> field path regex -> context map
  const hierarchy: Record<number, {
    fieldsByValuePattern: Record<string, {
      pattern: string;
      confidence: number;
      fieldsByRegex: Record<string, {
        regex: string;
        confidence: number;
        fields: PdfField[]
      }>
    }>
  }> = {};

  // Gather all unique pages
  const uniquePages = [...new Set(fields.filter(f => f.page).map(f => f.page))];
  
  // Initialize page structure
  uniquePages.forEach(page => {
    if (page) {
      hierarchy[page] = {
        fieldsByValuePattern: {}
      };
    }
  });

  // Analyze and organize each field
  fields.forEach(field => {
    if (!field.page) return;
    
    const page = field.page;
    
    // 1. Determine value pattern (sect1FullName, sect9.1_Entry1, etc.)
    let valuePattern = "unknown";
    let valuePatternConfidence = 0.2;
    
    const valuePatternResult = detectSectionFromFieldValue(field.value);
    if (valuePatternResult) {
      valuePattern = `section${valuePatternResult.section}` + 
        (valuePatternResult.subsection ? `.${valuePatternResult.subsection}` : "") +
        (valuePatternResult.entry ? `_Entry${valuePatternResult.entry}` : "");
      valuePatternConfidence = valuePatternResult.confidence;
    } else if (field.section) {
      // If no pattern in value, use detected section
      valuePattern = `section${field.section}`;
    }
    
    // 2. Determine field path regex pattern
    let regexPattern = "unknown";
    let regexConfidence = 0.2;
    
    // Check for common patterns
    if (sectionFieldPatterns[1] && sectionFieldPatterns[1].some(pattern => pattern.test(field.name))) {
      regexPattern = "section1Name";
      regexConfidence = 0.98;
    } else if (sectionFieldPatterns[3] && sectionFieldPatterns[3].some(pattern => pattern.test(field.name))) {
      regexPattern = "section3Birth";
      regexConfidence = 0.98;
    } else {
      // Try to extract a pattern from the field name
      const patternResult = parseFieldNamePattern(field.name);
      if (patternResult) {
        regexPattern = `section${patternResult.section}` + 
          (patternResult.subsection ? `.${patternResult.subsection}` : "") +
          (patternResult.entry ? `_Entry${patternResult.entry}` : "");
        regexConfidence = patternResult.confidence;
      } else {
        // Create a simplified regex pattern from the field name
        const nameParts = field.name.split(/[\[\].]/);
        if (nameParts.length > 2) {
          regexPattern = `${nameParts[0]}_${nameParts[1]}`;
          regexConfidence = 0.5;
        } else {
          regexPattern = field.name.replace(/\[\d+\]/g, "[]");
          regexConfidence = 0.4;
        }
      }
    }
    
    // Initialize valuePattern structure if needed
    if (!hierarchy[page].fieldsByValuePattern[valuePattern]) {
      hierarchy[page].fieldsByValuePattern[valuePattern] = {
        pattern: valuePattern,
        confidence: valuePatternConfidence,
        fieldsByRegex: {}
      };
    }
    
    // Initialize regex pattern structure if needed
    if (!hierarchy[page].fieldsByValuePattern[valuePattern].fieldsByRegex[regexPattern]) {
      hierarchy[page].fieldsByValuePattern[valuePattern].fieldsByRegex[regexPattern] = {
        regex: regexPattern,
        confidence: regexConfidence,
        fields: []
      };
    }
    
    // Add field to the hierarchy
    hierarchy[page].fieldsByValuePattern[valuePattern].fieldsByRegex[regexPattern].fields.push(field);
  });
  
  return hierarchy;
}

// Add a new function to generate the hierarchical organization report
async function generateHierarchicalReport(validFields: PdfField[]): Promise<void> {
  try {
    console.log("Generating hierarchical field organization...");
    
    // Create hierarchical organization
    const hierarchy = await generateHierarchicalFieldOrganization(validFields);
    
    // Save to file
    const outputDir = path.join(__dirname, '../reports');
    fs.mkdirSync(outputDir, { recursive: true });
    
    const outputPath = path.join(outputDir, 'field-hierarchy-detailed.json');
    fs.writeFileSync(outputPath, JSON.stringify(hierarchy, null, 2));
    
    console.log(`Hierarchical organization saved to ${outputPath}`);
    
    // Generate a summary
    let totalFields = 0;
    let totalValuePatterns = 0;
    let totalRegexPatterns = 0;
    
    // Count patterns by page
    const pageSummary: Record<number, {
      valuePatterns: number;
      regexPatterns: number;
      fields: number;
    }> = {};
    
    // Use properly typed loops to avoid type issues
    for (const [pageStr, pageData] of Object.entries(hierarchy)) {
      const pageNum = parseInt(pageStr);
      const valuePatterns = Object.keys(pageData.fieldsByValuePattern).length;
      
      let regexPatterns = 0;
      let fieldCount = 0;
      
      for (const valuePatternKey of Object.keys(pageData.fieldsByValuePattern)) {
        const valueData = pageData.fieldsByValuePattern[valuePatternKey];
        regexPatterns += Object.keys(valueData.fieldsByRegex).length;
        
        for (const regexPatternKey of Object.keys(valueData.fieldsByRegex)) {
          const regexData = valueData.fieldsByRegex[regexPatternKey];
          fieldCount += regexData.fields.length;
        }
      }
      
      pageSummary[pageNum] = {
        valuePatterns,
        regexPatterns,
        fields: fieldCount
      };
      
      totalValuePatterns += valuePatterns;
      totalRegexPatterns += regexPatterns;
      totalFields += fieldCount;
    }
    
    // Save summary
    const summaryPath = path.join(outputDir, 'field-hierarchy-summary.json');
    fs.writeFileSync(summaryPath, JSON.stringify({
      totalPages: Object.keys(hierarchy).length,
      totalValuePatterns,
      totalRegexPatterns,
      totalFields,
      pageSummary
    }, null, 2));
    
    console.log(`Hierarchical summary saved to ${summaryPath}`);
    
    // Print summary to console
    console.log("\nHierarchical Organization Summary:");
    console.log(`Total pages with fields: ${Object.keys(hierarchy).length}`);
    console.log(`Total field value patterns: ${totalValuePatterns}`);
    console.log(`Total regex patterns: ${totalRegexPatterns}`);
    console.log(`Total fields: ${totalFields}`);
    
    console.log("\nPage breakdown:");
    Object.entries(pageSummary)
      .sort((a, b) => parseInt(a[0]) - parseInt(b[0]))
      .forEach(([page, data]) => {
        console.log(`Page ${page}: ${data.valuePatterns} value patterns, ${data.regexPatterns} regex patterns, ${data.fields} fields`);
      });
      
  } catch (error) {
    console.error("Error generating hierarchical report:", error);
  }
}

// Add a new function to strictly validate section assignments
function validateSectionAssignments(fields: PdfField[]): PdfField[] {
  console.log("Performing strict section validation...");
  
  // Create a counter for corrections
  let section1Corrections = 0;
  let section2Corrections = 0;
  let section3Corrections = 0;
  
  // Log section 2 fields
  console.log("\nSection 2 fields BEFORE validation:");
  const section2Fields = fields.filter(f => f.section === 2);
  section2Fields.forEach(field => {
    const isValid = sectionFieldPatterns[2] && sectionFieldPatterns[2].some(pattern => pattern.test(field.name));
    console.log(`  ${field.name}: ${isValid ? "VALID" : "INVALID"}`);
  });
  
  // Validate each field
  fields.forEach(field => {
    // Validate section 1 - only fields matching strict patterns should be in section 1
    if (field.section === 1 && !(sectionFieldPatterns[1] && sectionFieldPatterns[1].some(pattern => pattern.test(field.name)))) {
      // This field is incorrectly assigned to section 1
      field.section = 6; // Reassign to section 6 (common default)
      field.confidence = 0.6;
      section1Corrections++;
    }
    
    // Validate section 2 - only fields matching strict patterns should be in section 2
    if (field.section === 2 && !(sectionFieldPatterns[2] && sectionFieldPatterns[2].some(pattern => pattern.test(field.name)))) {
      // This field is incorrectly assigned to section 2
      console.log(`  Correcting invalid section 2 field: ${field.name}`);
      field.section = 6; // Reassign to section 6 (common default)
      field.confidence = 0.6;
      section2Corrections++;
    }
    
    // Validate section 3 - only fields matching strict patterns should be in section 3
    if (field.section === 3 && !(sectionFieldPatterns[3] && sectionFieldPatterns[3].some(pattern => pattern.test(field.name)))) {
      // This field is incorrectly assigned to section 3
      field.section = 6; // Reassign to section 6 (common default)
      field.confidence = 0.6;
      section3Corrections++;
    }
    
    // Ensure fields matching strict patterns are in their correct sections
    if (sectionFieldPatterns[1] && sectionFieldPatterns[1].some(pattern => pattern.test(field.name)) && field.section !== 1) {
      field.section = 1;
      field.confidence = 0.99;
    }
    
    if (sectionFieldPatterns[2] && sectionFieldPatterns[2].some(pattern => pattern.test(field.name)) && field.section !== 2) {
      field.section = 2;
      field.confidence = 0.99;
    }
    
    if (sectionFieldPatterns[3] && sectionFieldPatterns[3].some(pattern => pattern.test(field.name)) && field.section !== 3) {
      field.section = 3;
      field.confidence = 0.99;
    }
    
    // Apply strict rules for sections 1-6 that have very specific field patterns
    for (const [sectionIdStr, patterns] of Object.entries(sectionFieldPatterns)) {
      if (patterns && Array.isArray(patterns)) {
        for (const pattern of patterns) {
          if (pattern.test(field.name)) {
            field.section = parseInt(sectionIdStr);
            field.confidence = 0.95;
            break;
          }
        }
      }
    }
  });
  
  // Log section 2 fields after validation
  console.log("\nSection 2 fields AFTER validation:");
  const validatedSection2Fields = fields.filter(f => f.section === 2);
  validatedSection2Fields.forEach(field => {
    console.log(`  ${field.name}`);
  });
  
  console.log(`\nSection validation complete. Corrections: Section 1: ${section1Corrections}, Section 2: ${section2Corrections}, Section 3: ${section3Corrections}`);
  return fields;
}

// Update main function to incorporate the enhanced metadata extraction
async function main() {
  console.log("Starting Enhanced SF-86 PDF Form Task 3 Test...");
  
  try {
    // Initialize the page categorization bridge
    console.log("Initializing page categorization bridge...");
    const bridgeInitialized = pageCategorization.initPageCategorization();
    if (bridgeInitialized) {
      console.log("Page categorization bridge initialized successfully");
    } else {
      console.log("Page categorization bridge initialization failed, continuing with standard categorization");
    }
    
    // Load section contexts first
    sectionContexts = await loadSectionContexts();
    
    // Initialize PDF service
    console.log("Initializing PDF Service...");
    let pdfService;
    try {
      pdfService = new PdfService();
      console.log("PDF Service initialized successfully");
    } catch (serviceErr: any) {
      throw new Error(`Failed to initialize PDF Service: ${serviceErr.message}`);
    }
    
    // Specify PDF path
    const pdfPath = path.resolve(__dirname, "../tools/externalTools/sf862.pdf");
    console.log(`Checking PDF at: ${pdfPath}`);
    
    // Verify file exists before attempting to read
    if (!fs.existsSync(pdfPath)) {
      throw new Error(`PDF file not found at path: ${pdfPath}`);
    }
    
    // Get all filled field values
    console.log("Reading PDF file...");
    let pdfBytes;
    try {
      pdfBytes = fs.readFileSync(pdfPath);
    } catch (readErr: any) {
      if (readErr.code === 'EACCES') {
        throw new Error(`Permission denied when accessing PDF file: ${pdfPath}`);
      } else {
        throw new Error(`Failed to read PDF file: ${readErr.message}`);
      }
    }
    
    console.log("Loading PDF document...");
    let pdfDoc;
    try {
      pdfDoc = await PDFDocument.load(pdfBytes);
    } catch (loadErr: any) {
      throw new Error(`Failed to load PDF document: ${loadErr.message}. The file may be corrupted or password protected.`);
    }

    // Determine extraction mode from command-line argument
    const mode = process.argv[2] === '2' ? 'all' : 'filled';
    let allFields: any[] = [];
    
    try {
      if (mode === 'all') {
        console.log('Extracting ALL fields (filled and empty)...');
        allFields = await pdfService.mapFormFields(pdfDoc);
      } else {
        console.log('Extracting ONLY filled fields...');
        allFields = await pdfService.mapFilledValuesfrom_PDF(pdfDoc);
      }
      
      if (!Array.isArray(allFields)) {
        console.warn('Warning: Field extraction did not return an array. Converting to empty array.');
        allFields = [];
      }
      
      console.log(`Retrieved ${allFields.length} fields from PDF...`);
    } catch (fieldExtractionErr: any) {
      throw new Error(`Failed to extract fields from PDF: ${fieldExtractionErr.message}`);
    }
    
    // Enhanced metadata extraction using PdfService.extractFieldMetadata
    console.log("Extracting detailed field metadata...");
    try {
      const detailedMetadata = await pdfService.extractFieldMetadata(pdfPath);
      
      // Create a lookup map for field metadata
      const metadataMap = new Map(detailedMetadata.map(meta => [meta.name, meta]));
      
      // Enhance allFields with metadata
      for (const field of allFields) {
        if (field.name && metadataMap.has(field.name)) {
          const metadata = metadataMap.get(field.name)!;
          field.label = metadata.label;
          field.type = metadata.type;
          field.page = metadata.page;
          field.maxLength = metadata.maxLength;
          field.options = metadata.options;
          field.required = metadata.required;
        }
      }
      
      console.log(`Enhanced ${allFields.filter(f => f.label).length} fields with additional metadata`);
    } catch (metadataErr) {
      console.warn("Error extracting detailed metadata:", metadataErr);
      // Continue with basic metadata
    }
    
    // For filled mode, filter as before
    let validFields: PdfField[] = [];
    try {
      if (mode === 'filled') {
        validFields = allFields.filter(field => {
          if (!field || field.value === undefined || field.value === null) return false;
          
          // Handle different value types more robustly
          if (typeof field.value === 'boolean') {
            return field.name && typeof field.name === 'string' && field.name.trim() !== "";
          }
          
          if (Array.isArray(field.value)) {
            return field.name && typeof field.name === 'string' && field.name.trim() !== "" && field.value.length > 0;
          }
          
          const stringValue = String(field.value);
          return field.name && typeof field.name === 'string' && field.name.trim() !== "" && stringValue.trim() !== "";
        });
      } else {
        // For all mode, keep all fields
        validFields = allFields.filter(field => field && field.name);
      }
      console.log(`Fields considered for report: ${validFields.length}`);
    } catch (filterErr: any) {
      console.error(`Error filtering fields: ${filterErr.message}`);
      console.log('Using all retrieved fields as fallback...');
      validFields = allFields.filter(field => field && field.name);
    }
    
    // Process fields to extract metadata and determine page numbers
    for (let field of validFields) {
      try {
        // Use enhanced multi-dimensional categorization with all available data
        try {
          // Check if this is a Sections1-6 field for special handling
          if (field.name && field.name.includes('Sections1-6[0]')) {
            const specialResult = categorizeSections1to6Field(
              field.name, 
              field.label, 
              field.value
            );
            
            if (specialResult && specialResult.confidence > 0.6) {
              field.section = specialResult.section;
              field.confidence = specialResult.confidence;
              
              // Skip further categorization for Sections1-6 fields
              // that we've confidently categorized
              collectFieldMetadata(field);
              continue;
            }
          }
          
          // First collect nearby fields for better context
          const neighborFields = getNeighborFieldContext(field.name, validFields.map(f => f.name));

          // Categorize using multiple dimensions of data
          const enhancedResult = pageCategorization.enhancedMultiDimensionalCategorization(
            field.name,
            field.label,
            field.page || 0,
            typeof field.value === 'string' ? field.value : 
              (field.value !== undefined ? String(field.value) : undefined),
            neighborFields
          );
          
          if (enhancedResult) {
            // For Sections1-6 fields, double-check with our specialized categorizer
            if (field.name && field.name.includes('Sections1-6[0]')) {
              const specialResult = categorizeSections1to6Field(
                field.name, 
                field.label, 
                field.value
              );
              
              if (specialResult && specialResult.section !== enhancedResult.section) {
                // If they disagree, prefer the specialized categorizer as it's focused on 
                // the specific problem we're trying to solve
                if (specialResult.confidence >= 0.7) {
                  field.section = specialResult.section;
                  field.confidence = specialResult.confidence;
                  
                  // Skip the rest of the logic for this field
                  collectFieldMetadata(field);
                  continue;
                }
              }
            }
            
            field.section = enhancedResult.section;
            field.subsection = enhancedResult.subsection;
            field.entry = enhancedResult.entry;
            field.confidence = enhancedResult.confidence;
          } else {
            // Fallback to standard categorization
            const fieldCategory = categorizeField(field);
            field.section = fieldCategory.section;
            field.confidence = fieldCategory.confidence;
          }
          
          // For section 1, perform additional validation
          // This helps address the issue of too many fields in section 1
          if (field.section === 1) {
            // Check if field name patterns match section 1
            const namePattern = /name|first|last|middle|suffix/i;
            const isSection1Field = (field.name.includes('Sections1-6[0]') && 
                                   (field.name.includes('TextField11[0]') || 
                                    field.name.includes('TextField11[1]') || 
                                    field.name.includes('TextField11[2]') || 
                                    field.name.includes('suffix[0]')));
            
            if (!isSection1Field && 
                !field.name.match(namePattern) && 
                (!field.label || !field.label.match(namePattern))) {
              
              // This shouldn't be in section 1 - check if it matches any specific sections
              let reassigned = false;
              
              for (const [sectionId, patterns] of Object.entries(sectionFieldPatterns)) {
                if (sectionId === '1') continue; // Skip section 1
                
                for (const pattern of patterns) {
                  if (pattern.test(field.name) || 
                     (field.label && pattern.test(field.label))) {
                    field.section = parseInt(sectionId);
                    field.confidence = 0.8;
                    reassigned = true;
                    break;
                  }
                }
                
                if (reassigned) break;
              }
              
              if (!reassigned) {
                // Reclassify based on page if we couldn't find a better match
                if (field.page) {
                  field.section = identifySectionByPage(field.page)?.section || 0;
                  field.confidence = 0.7;
                } else {
                  field.section = 0; // Unidentified
                  field.confidence = 0.2;
                }
              }
            }
          }
          
          // Special handling for SSN fields - verify they're correctly placed
          if (field.name && field.name.includes('SSN') && field.section !== 4) {
            // SSN fields can appear in many sections, but we want to mark them as section 4
            field.section = 4;
            field.confidence = 0.95;
          }
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : String(error);
          console.warn(`Error categorizing field ${field.name}:`, errorMessage);
          
          // Fallback to basic page-based categorization
          if (field.page) {
            const pageResult = identifySectionByPage(field.page);
            if (pageResult) {
              field.section = pageResult.section;
              field.confidence = pageResult.confidence;
            } else {
              field.section = 0;
              field.confidence = 0.2;
            }
          } else {
            field.section = 0;
            field.confidence = 0.1;
          }
        }
        
        // Collect field metadata for storage
        collectFieldMetadata(field);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.warn(`Error processing field ${field.name}:`, errorMessage);
      }
    }
    
    // Build nested structure: Section → Subsection → Entry → Sub-entry → Fields
    const reportTree: any = {};
    const unidentifiedFields: PdfField[] = [];

    try {
      // Apply strict section validation before building reports
      console.log("Applying strict section validation rules...");
      validFields = validateSectionAssignments(validFields);
      
      validFields.forEach((field: PdfField) => {
        try {
          const meta = getMetadataByName(field.name);
          
          // If no valid section, add to unidentified fields
          if (!field.section || (typeof field.section === 'number' && (field.section < 1 || field.section > 30))) {
            unidentifiedFields.push(field);
            return;
          }
                    
          // Build hierarchical tree structure
          // Level 1: Section
          const sectionKey = String(field.section);
          if (!reportTree[sectionKey]) reportTree[sectionKey] = {};
          
          // Level 2: Subsection
          const subsectionId = field.subsection || 'general';
          if (!reportTree[sectionKey][subsectionId]) reportTree[sectionKey][subsectionId] = {};
          
          // Add the field to the final level
          if (!reportTree[sectionKey][subsectionId].fields) {
            reportTree[sectionKey][subsectionId].fields = [];
          }
          
          // Add field with all metadata
          reportTree[sectionKey][subsectionId].fields.push({
            name: field.name,
            value: field.value,
            page: field.page,
            label: field.label || meta?.label,
            type: field.type || meta?.type,
            id: field.id || meta?.id,
            maxLength: field.maxLength,
            options: field.options,
            required: field.required,
            confidence: field.confidence || 0
          });
        } catch (error: unknown) {
          const errorMessage = error instanceof Error ? error.message : String(error);
          console.error(`Error processing field ${field.name}:`, errorMessage);
          unidentifiedFields.push(field);
        }
      });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error(`Error building report tree:`, errorMessage);
      unidentifiedFields.push(...allFields);
    }

    // Generate enhanced hierarchical reports
    // Check for mode 6 from command line - hierarchical organization
    const runMode = process.argv[3] || '';
    if (runMode === '6') {
      console.log("Mode 6: Generating hierarchical field organization...");
      await generateHierarchicalReport(validFields);
      
      console.log("\nMode 6 Report Generated Successfully");
      console.log("\nNext steps:");
      console.log("1. Explore the field-hierarchy-detailed.json file to see the complete organization");
      console.log("2. Use the field-hierarchy-summary.json file for a high-level overview");
      console.log("3. Try running 'npx tsx scripts/enhanced-pdf-validation.ts' for even more detailed analysis");
      
      // Save collected metadata and exit
      saveCollectedMetadata();
      console.log("\nEnhanced SF-86 PDF Form Task 3 Mode 6 completed successfully.");
      process.exit(0);
    }
    
    await generateReports(validFields, unidentifiedFields);
    
    // Generate additional page summary report
    await generatePageSummaryReport(validFields);
    
    // Save collected metadata
    saveCollectedMetadata();
    
    // Generate confidence summary
    const confidenceLevels = {
      high: validFields.filter(f => f.confidence && f.confidence >= 0.9).length,
      medium: validFields.filter(f => f.confidence && f.confidence >= 0.7 && f.confidence < 0.9).length,
      low: validFields.filter(f => f.confidence && f.confidence < 0.7).length,
      none: validFields.filter(f => !f.confidence).length
    };
    
    console.log("\nCategorization Confidence Summary:");
    console.log(`- High confidence (≥0.9): ${confidenceLevels.high} fields (${Math.round(confidenceLevels.high/validFields.length*100)}%)`);
    console.log(`- Medium confidence (0.7-0.9): ${confidenceLevels.medium} fields (${Math.round(confidenceLevels.medium/validFields.length*100)}%)`);
    console.log(`- Low confidence (<0.7): ${confidenceLevels.low} fields (${Math.round(confidenceLevels.low/validFields.length*100)}%)`);
    console.log(`- No confidence score: ${confidenceLevels.none} fields (${Math.round(confidenceLevels.none/validFields.length*100)}%)`);
    
    console.log("\nEnhanced SF-86 PDF Form Task 3 Test completed successfully.");
    process.exit(0);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("Error in SF-86 PDF Form Task 3 Test:", errorMessage);
    
    // Try to save metadata even if there's an error
    try {
      saveCollectedMetadata();
    } catch (metadataErr) {
      console.warn("Failed to save metadata after error:", metadataErr);
    }
    
    process.exit(1);
  }
}

// Run main function
main(); 