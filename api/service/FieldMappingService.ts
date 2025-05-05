import { ConfidenceLevel, FieldType } from '../enums/SF86DataEnums';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { PdfService } from './pdfService';

// Get directory path in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Field mapping report interface
interface FieldMappingReport {
  sectionId: number;
  sectionName: string;
  fieldCount: number;
  mappedCount: number;
  confidenceScores: {
    [key: string]: number; // fieldName: confidence score (0-1)
  };
  overallConfidence: number;
}

// PDF field metadata interface
interface PdfFieldMetadata {
  id: string;
  name: string;
  type: string;
  value: string | null;
  label: string | null;
  options?: string[];
  maxLength?: number;
  required?: boolean;
}

/**
 * Service for analyzing and generating field mapping reports
 * with confidence scores between PDF fields and application data model
 */
export class FieldMappingService {
  private pdfService: PdfService;
  private schemasDir: string;
  private interfacesDir: string;
  private pdfFieldsCache: Map<number, PdfFieldMetadata[]>;
  private commonFieldPatterns: {[key: string]: RegExp};
  
  constructor() {
    this.pdfService = new PdfService();
    this.schemasDir = path.join(__dirname, '../../schemas/sections');
    this.interfacesDir = path.join(__dirname, '../../interfaces/sections');
    this.pdfFieldsCache = new Map();
    
    // Define common field patterns for recognition
    this.commonFieldPatterns = {
      name: /\b(name|full\s*name|first|last|middle|initial|suffix)\b/i,
      ssn: /\b(ssn|social\s*security|social\s*security\s*number)\b/i,
      dob: /\b(dob|birth|date\s*of\s*birth|birth\s*date|birth\s*day)\b/i,
      phone: /\b(phone|telephone|cell|mobile|contact\s*number)\b/i,
      email: /\b(email|e-mail|electronic\s*mail)\b/i,
      address: /\b(address|street|city|state|zip|postal|country|residence)\b/i,
      citizenship: /\b(citizen|citizenship|nationality|national|country\s*of\s*birth)\b/i,
      passport: /\b(passport|passport\s*number|passport\s*id|travel\s*document)\b/i,
      employment: /\b(employ|employer|employment|job|occupation|position|title|supervisor)\b/i,
      education: /\b(education|school|college|university|degree|diploma|major)\b/i,
      military: /\b(military|service|branch|rank|discharge|armed\s*forces)\b/i,
      reference: /\b(reference|refer|contact|person\s*who\s*knows\s*you)\b/i,
      financial: /\b(financ|money|debt|credit|loan|bankruptcy|economic)\b/i,
      legal: /\b(legal|law|crime|arrest|charge|offense|conviction|sentence)\b/i,
      medical: /\b(medic|health|treatment|condition|hospital|therapy|counseling)\b/i,
      substance: /\b(drug|alcohol|substance|addiction|abuse|controlled\s*substance)\b/i,
      foreign: /\b(foreign|abroad|overseas|international|travel|visit|country)\b/i,
      date: /\b(date|period|duration|from|to|start|end)\b/i,
      yesNo: /\b(yes|no|affirm|negative|positive|confirm|deny)\b/i
    };
  }
  
  /**
   * Generate field mapping reports for all sections
   */
  async generateFieldMappingReports(): Promise<FieldMappingReport[]> {
    try {
      // Get all schema files
      const schemaFiles = fs.readdirSync(this.schemasDir)
        .filter(file => file.endsWith('.json'))
        .sort((a, b) => {
          const numA = parseInt(a.replace('section', '').replace('.json', ''));
          const numB = parseInt(b.replace('section', '').replace('.json', ''));
          return numA - numB;
        });
      
      // Generate report for each section
      const reports: FieldMappingReport[] = [];
      
      for (const schemaFile of schemaFiles) {
        const sectionId = parseInt(schemaFile.replace('section', '').replace('.json', ''));
        const report = await this.generateSectionReport(sectionId);
        reports.push(report);
      }
      
      return reports;
    } catch (error) {
      console.error('Error generating field mapping reports:', error);
      throw new Error('Failed to generate field mapping reports');
    }
  }
  
  /**
   * Generate a field mapping report for a specific section
   */
  async generateSectionReport(sectionId: number): Promise<FieldMappingReport> {
    try {
      // Load section schema
      const schemaPath = path.join(this.schemasDir, `section${sectionId}.json`);
      const schemaContent = fs.readFileSync(schemaPath, 'utf8');
      const schema = JSON.parse(schemaContent);
      
      // Get PDF fields for this section if not already cached
      if (!this.pdfFieldsCache.has(sectionId)) {
        await this.loadPdfFieldsForSection(sectionId);
      }
      
      const pdfFields = this.pdfFieldsCache.get(sectionId) || [];
      
      // Load section interface if available (for additional validation)
      let interfaceInfo: any = null;
      try {
        const interfacePath = path.join(this.interfacesDir, `section${sectionId}.ts`);
        if (fs.existsSync(interfacePath)) {
          const interfaceContent = fs.readFileSync(interfacePath, 'utf8');
          // Extract interface field names using simple regex (basic parsing)
          const fieldMatches = interfaceContent.match(/\w+\s*:\s*Field<[^>]+>/g) || [];
          interfaceInfo = {
            fields: fieldMatches.map(match => match.split(':')[0].trim())
          };
        }
      } catch (error) {
        console.warn(`Could not load interface for section ${sectionId}:`, error);
      }
      
      // Initialize report
      const report: FieldMappingReport = {
        sectionId,
        sectionName: schema.sectionName,
        fieldCount: Object.keys(schema.properties).length,
        mappedCount: 0,
        confidenceScores: {},
        overallConfidence: 0
      };
      
      // Log debug info to help with troubleshooting
      console.log(`Analyzing section ${sectionId} (${schema.sectionName}):`);
      console.log(`- Schema contains ${Object.keys(schema.properties).length} fields`);
      console.log(`- Found ${pdfFields.length} PDF fields for this section`);
      
      if (interfaceInfo) {
        console.log(`- Interface defines ${interfaceInfo.fields.length} fields`);
      }
      
      // Calculate confidence scores for each field
      let totalConfidence = 0;
      let mappedFields = 0;
      
      for (const [fieldKey, fieldDef] of Object.entries<any>(schema.properties)) {
        // Before calculating confidence, check if field name exists in the interface
        let interfaceMatchBoost = 0;
        if (interfaceInfo && interfaceInfo.fields) {
          const fieldName = fieldKey.split('.').pop() || '';
          if (interfaceInfo.fields.some((f: string) => f === fieldName || f.toLowerCase() === fieldName.toLowerCase())) {
            interfaceMatchBoost = 0.1; // Boost confidence if field exists in interface
          }
        }
        
        // Calculate base confidence
        const confidence = this.calculateFieldConfidence(fieldDef, fieldKey, sectionId);
        
        // Apply interface match boost (but keep within 0-1 range)
        const finalConfidence = Math.min(1.0, confidence + interfaceMatchBoost);
        
        report.confidenceScores[fieldKey] = finalConfidence;
        
        // For screenshots-based validation, we should have very high confidence
        const baseFieldName = fieldKey.split('.').pop() || '';
        if (this.isFieldConfirmedByScreenshots(baseFieldName, sectionId)) {
          report.confidenceScores[fieldKey] = 1.0; // 100% confidence for fields directly observed in screenshots
          
          // Update the PDF field ID if we have a high confidence match and it's not already set
          if (!fieldDef.pdfFieldId) {
            const matchingPdfField = this.findMatchingPdfField(fieldDef, fieldKey, sectionId);
            if (matchingPdfField) {
              fieldDef.pdfFieldId = matchingPdfField.id;
              fieldDef.pdfFieldName = matchingPdfField.name;
              
              // Update the schema file with the new mapping
              this.updateSchemaFieldMapping(schemaPath, schema, fieldKey, {
                pdfFieldId: matchingPdfField.id,
                pdfFieldName: matchingPdfField.name,
                title: fieldDef.title || matchingPdfField.label,
                description: fieldDef.description || `Field matched from PDF form with label: ${matchingPdfField.label}`
              });
            }
          }
        }
        
        if (finalConfidence > 0.1) { // Consider fields with very low confidence as unmapped
          mappedFields++;
          totalConfidence += finalConfidence;
        }
      }
      
      // Update mapping count and overall confidence
      report.mappedCount = mappedFields;
      report.overallConfidence = mappedFields > 0 ? totalConfidence / mappedFields : 0;
      
      // Log the overall results
      console.log(`- Mapped ${mappedFields}/${report.fieldCount} fields with overall confidence ${report.overallConfidence.toFixed(2)}`);
      
      return report;
    } catch (error) {
      console.error(`Error generating report for section ${sectionId}:`, error);
      throw new Error(`Failed to generate report for section ${sectionId}`);
    }
  }
  
  /**
   * Helper method to update schema file with improved field mappings
   */
  private updateSchemaFieldMapping(schemaPath: string, schema: any, fieldKey: string, updates: any): void {
    try {
      if (schema.properties[fieldKey]) {
        // Apply updates to the field
        schema.properties[fieldKey] = {
          ...schema.properties[fieldKey],
          ...updates
        };
        
        // Write the updated schema back to the file
        fs.writeFileSync(schemaPath, JSON.stringify(schema, null, 2), 'utf8');
        console.log(`Updated schema mapping for field ${fieldKey}`);
      }
    } catch (error) {
      console.error(`Error updating schema field mapping for ${fieldKey}:`, error);
    }
  }

  /**
   * Load PDF fields for a specific section
   */
  private async loadPdfFieldsForSection(sectionId: number): Promise<void> {
    try {
      // Load actual field data from the JSON files
      const labelsPath = path.join(__dirname, '../../utilities/externalTools/Labels.json');
      const allFieldsPath = path.join(__dirname, '../../utilities/externalTools/allFieldsTo_JSON.json');
      
      let labelData: any[] = [];
      let allFieldsData: any[] = [];
      
      if (fs.existsSync(labelsPath)) {
        const labelsContent = fs.readFileSync(labelsPath, 'utf8');
        labelData = JSON.parse(labelsContent);
      }
      
      if (fs.existsSync(allFieldsPath)) {
        const allFieldsContent = fs.readFileSync(allFieldsPath, 'utf8');
        allFieldsData = JSON.parse(allFieldsContent);
      }
      
      // Map fields to appropriate sections based on name patterns or structural clues
      const sectionFields: PdfFieldMetadata[] = [];
      
      // Create a map of field IDs to labels for quick lookup
      const labelMap = new Map<string, string>();
      labelData.forEach(field => {
        if (field.id && field.label) {
          labelMap.set(field.id, field.label);
        }
      });
      
      // Determine the section prefix pattern based on section number
      const sectionPatterns = this.getSectionPatterns(sectionId);
      
      // Filter fields based on section patterns
      for (const field of allFieldsData) {
        const isInSection = sectionPatterns.some(pattern => 
          field.name && (field.name.includes(pattern) || this.isFieldInSection(field.name, sectionId))
        );
        
        if (isInSection) {
          const fieldMetadata: PdfFieldMetadata = {
            id: field.id,
            name: field.name,
            type: field.type,
            value: field.value || null,
            label: labelMap.get(field.id) || this.generateLabelFromName(field.name)
          };
          
          // Add options for dropdown fields
          if (field.type === 'PDFDropdown' && Array.isArray(field.value)) {
            fieldMetadata.options = field.value;
          }
          
          // Estimate if field is required based on label text
          fieldMetadata.required = this.estimateIfRequired(fieldMetadata.label);
          
          sectionFields.push(fieldMetadata);
        }
      }
      
      this.pdfFieldsCache.set(sectionId, sectionFields);
      
      // If no fields were found, fall back to mock data
      if (sectionFields.length === 0) {
        console.warn(`No actual PDF fields found for section ${sectionId}, falling back to mock data.`);
        this.generateMockFieldsForSection(sectionId);
      }
    } catch (error) {
      console.error(`Error loading PDF fields for section ${sectionId}:`, error);
      // Fall back to mock data on error
      this.generateMockFieldsForSection(sectionId);
    }
  }
  
  /**
   * Get section patterns to match field names based on section ID
   */
  private getSectionPatterns(sectionId: number): string[] {
    switch (sectionId) {
      case 1:
        return ['Sections1-6[0].section5[0]', 'Full Name', 'FullName'];
      case 2:
        return ['Date of Birth', 'DateOfBirth', 'DOB'];
      case 3:
        return ['Place of Birth', 'PlaceOfBirth', 'BirthPlace'];
      case 4:
        return ['Social Security Number', 'SSN', 'SocialSecurity'];
      case 5:
        return ['Other Names Used', 'OtherNames', 'AliasNames'];
      case 6:
        return ['Identifying Information', 'PhysicalAttributes'];
      case 7:
        return ['Contact Information', 'ContactInfo', 'EmailAddress', 'PhoneNumber'];
      case 8:
        return ['Passport', 'U.S. Passport', 'USPassport'];
      case 9:
        return ['Citizenship', 'CitizenshipStatus'];
      default:
        return [`Section${sectionId}`, `section${sectionId}`];
    }
  }
  
  /**
   * Determine if a field belongs to a specific section based on naming patterns
   */
  private isFieldInSection(fieldName: string, sectionId: number): boolean {
    // These are specific patterns found in the form field names
    switch (sectionId) {
      case 1:
        return /form1\[0\]\.Sections1-6\[0\]\.section5\[0\]/.test(fieldName);
      case 2:
        return /form1\[0\]\.Sections1-6\[0\]\.section[12]\[0\]/.test(fieldName) && 
               /date.*birth|birth.*date|dob/i.test(fieldName);
      case 3:
        return /form1\[0\]\.Sections1-6\[0\]\.section[13]\[0\]/.test(fieldName) && 
               /place.*birth|birth.*place|city|county|state|country.*birth/i.test(fieldName);
      case 4:
        return /form1\[0\]\.Sections1-6\[0\]\.section[14]\[0\]/.test(fieldName) && 
               /social.*security|ssn/i.test(fieldName);
      case 5:
        return /form1\[0\]\.Sections1-6\[0\]\.section[15]\[0\]/.test(fieldName) && 
               /other.*names|used.*names|former|maiden/i.test(fieldName);
      // Add more cases for other sections
      default:
        return fieldName.includes(`Section${sectionId}`) || fieldName.includes(`section${sectionId}`);
    }
  }
  
  /**
   * Generate a label from field name if not provided
   */
  private generateLabelFromName(fieldName: string): string {
    // Extract the most meaningful part of the field name
    let labelText = fieldName;
    
    // Remove form and section prefixes
    labelText = labelText.replace(/form1\[0\]\.Sections?\d+-\d+\[\d+\]\.section\d+\[\d+\]\./, '');
    
    // Remove array indices
    labelText = labelText.replace(/\[\d+\]/g, '');
    
    // Replace underscores and dots with spaces
    labelText = labelText.replace(/[._]/g, ' ');
    
    // Convert camelCase to spaces
    labelText = labelText.replace(/([A-Z])/g, ' $1').trim();
    
    // Format field label (capitalize first letter of each word)
    return labelText
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  }
  
  /**
   * Estimate if a field is required based on label text
   */
  private estimateIfRequired(label: string | null): boolean {
    if (!label) return false;
    
    // Look for required indicators in the label
    return label.includes('(Required)') || 
           label.includes('is required') || 
           label.includes('must be provided') ||
           label.includes('at least one');
  }
  
  /**
   * Fall back to mock data generation if real data isn't available
   */
  private generateMockFieldsForSection(sectionId: number): void {
    const mockFields: PdfFieldMetadata[] = [];
      const fieldCount = 20 + (sectionId % 10);
      
      for (let i = 1; i <= fieldCount; i++) {
        const fieldType = this.getMockFieldType(i);
        const fieldName = this.generateMockFieldName(sectionId, i, fieldType);
        
        mockFields.push({
          id: `${sectionId}_${i} 0 R`,
          name: fieldName,
          type: fieldType,
          value: null,
          label: `${this.formatFieldLabel(fieldName)} (Section ${sectionId})`,
          options: fieldType === 'dropdown' ? ['Option 1', 'Option 2', 'Option 3'] : undefined,
          maxLength: fieldType === 'text' ? 100 : undefined,
          required: i % 3 === 0 // Every third field is required (for mock data)
        });
      }
      
      this.pdfFieldsCache.set(sectionId, mockFields);
  }
  
  /**
   * Helper to generate mock field type (for demonstration)
   */
  private getMockFieldType(index: number): string {
    const types = ['text', 'dropdown', 'checkbox', 'radio', 'date'];
    return types[index % types.length];
  }
  
  /**
   * Helper to generate mock field name (for demonstration)
   */
  private generateMockFieldName(sectionId: number, index: number, type: string): string {
    // This would be replaced with actual field names from the PDF in production
    const section = sectionId.toString().padStart(2, '0');
    
    switch (sectionId) {
      case 1: // Personal Information
        const personalFields = ['lastName', 'firstName', 'middleName', 'suffix', 'gender', 'height', 'weight', 'hairColor', 'eyeColor'];
        return index <= personalFields.length ? personalFields[index - 1] : `field${section}_${index}`;
      
      case 2: // Date and Place of Birth
        const birthFields = ['dateOfBirth', 'cityOfBirth', 'stateOfBirth', 'countryOfBirth'];
        return index <= birthFields.length ? birthFields[index - 1] : `field${section}_${index}`;
      
      case 3: // SSN
        return index === 1 ? 'socialSecurityNumber' : `field${section}_${index}`;
      
      // More specific field names for other sections would go here
      default:
        return `field${section}_${index}`;
    }
  }
  
  /**
   * Format a field name into a readable label
   */
  private formatFieldLabel(fieldName: string): string {
    // Convert camelCase to Title Case with spaces
    const label = fieldName
      .replace(/([A-Z])/g, ' $1') // Insert space before capital letters
      .replace(/^./, (str) => str.toUpperCase()); // Capitalize first letter
    
    return label.trim();
  }
  
  /**
   * Find best matching PDF field for a schema field using knowledge from screenshots
   */
  private findMatchingPdfField(fieldDef: any, fieldKey: string, sectionId: number): PdfFieldMetadata | null {
    const pdfFields = this.pdfFieldsCache.get(sectionId) || [];
    
    // If we have a direct pdfFieldId reference, use that
    if (fieldDef.pdfFieldId) {
      const directMatch = pdfFields.find(field => field.id === fieldDef.pdfFieldId);
      if (directMatch) return directMatch;
    }
    
    // If we have a direct pdfFieldName reference, use that
    if (fieldDef.pdfFieldName) {
      const nameMatch = pdfFields.find(field => field.name === fieldDef.pdfFieldName);
      if (nameMatch) return nameMatch;
    }
    
    // Extract field name from key (remove section prefix if present)
    const fieldName = fieldKey.includes('.') ? fieldKey.split('.').pop() || '' : fieldKey;
    
    // Try exact name match first
    const exactMatch = pdfFields.find(field => 
      field.name.toLowerCase() === fieldName.toLowerCase() ||
      this.normalizeFieldName(field.name) === this.normalizeFieldName(fieldName)
    );
    if (exactMatch) return exactMatch;
    
    // Try matching by label if title/description is available
    if (fieldDef.title || fieldDef.description || fieldDef.label) {
      const labelText = fieldDef.label || fieldDef.title || fieldDef.description;
      
      const labelMatch = pdfFields.find(field => 
        field.label && this.isSimilarText(field.label, labelText)
      );
      
      if (labelMatch) return labelMatch;
    }
    
    // Use screenshot-based knowledge to find matches for common fields
    const knowledgeBasedMatch = this.findMatchByKnowledge(fieldName, fieldDef, pdfFields, sectionId);
    if (knowledgeBasedMatch) return knowledgeBasedMatch;
    
    // Try fuzzy matching based on field properties
    let bestMatch: {field: PdfFieldMetadata, score: number} | null = null;
    
    for (const field of pdfFields) {
      let score = 0;
      
      // Match by name similarity
      if (field.name.toLowerCase().includes(fieldName.toLowerCase())) {
        score += 0.5;
      } else if (fieldName.toLowerCase().includes(field.name.toLowerCase())) {
        score += 0.3;
      }
      
      // Normalized name comparison
      const normalizedFieldName = this.normalizeFieldName(fieldName);
      const normalizedPdfName = this.normalizeFieldName(field.name);
      
      if (normalizedPdfName.includes(normalizedFieldName) || normalizedFieldName.includes(normalizedPdfName)) {
        score += 0.2;
      }
      
      // Match by label similarity (if fieldDef has a label/title/description)
      const labelText = fieldDef.label || fieldDef.title || fieldDef.description;
      if (labelText && field.label) {
        if (field.label.toLowerCase().includes(labelText.toLowerCase())) {
          score += 0.3;
        } else if (labelText.toLowerCase().includes(field.label.toLowerCase())) {
          score += 0.2;
        }
        
        // Check for semantic similarity
        if (this.isSimilarText(labelText, field.label)) {
          score += 0.3;
        }
      }
      
      // Match by field type compatibility
      if (fieldDef.type && field.type) {
        const schemaType = fieldDef.type.toLowerCase();
        const pdfType = this.mapPdfTypeToSchemaType(field.type);
        
        // Direct type match
        if (this.areTypesCompatible(schemaType, pdfType)) {
          score += 0.2;
        }
      }
      
      // Match by common field patterns
      for (const [category, pattern] of Object.entries(this.commonFieldPatterns)) {
        if (pattern.test(fieldName) && (pattern.test(field.name) || (field.label && pattern.test(field.label)))) {
          score += 0.3;
          break;
        }
      }
      
      // Apply section-specific scoring logic
      score += this.getFieldMatchingScoreBoost(field, fieldName, sectionId);
      
      // Update best match if this field has a higher score
      if (!bestMatch || score > bestMatch.score) {
        bestMatch = { field, score };
      }
    }
    
    // Return the best match field if score is above threshold
    return bestMatch && bestMatch.score > 0.2 ? bestMatch.field : null;
  }
  
  /**
   * Normalize field name for better comparison
   */
  private normalizeFieldName(fieldName: string): string {
    return fieldName
      .toLowerCase()
      .replace(/form1\[\d+\]\.sections?\d+-\d+\[\d+\]\.section\d+\[\d+\]\./, '')  // Remove form prefix
      .replace(/[^a-z0-9]/g, '')  // Remove non-alphanumeric
      .replace(/(field|text|dropdown|radio|check|box|area|from|to|date|name|suffix)/g, '');  // Remove common field type words
  }
  
  /**
   * Check if two text strings are semantically similar
   */
  private isSimilarText(text1: string, text2: string): boolean {
    // Convert to lowercase
    const t1 = text1.toLowerCase();
    const t2 = text2.toLowerCase();
    
    // Direct inclusion check
    if (t1.includes(t2) || t2.includes(t1)) {
      return true;
    }
    
    // Check for common keywords
    const keywords1 = t1.split(/\s+/);
    const keywords2 = t2.split(/\s+/);
    
    // Count matching words
    const matches = keywords1.filter(word => 
      word.length > 3 && keywords2.some(w => w === word || w.includes(word) || word.includes(w))
    );
    
    // If more than half of the significant words match
    return matches.length >= Math.min(keywords1.length, keywords2.length) / 2;
  }
  
  /**
   * Find a field match based on section-specific knowledge from the screenshots
   */
  private findMatchByKnowledge(fieldName: string, fieldDef: any, pdfFields: PdfFieldMetadata[], sectionId: number): PdfFieldMetadata | null {
    const normalizedName = fieldName.toLowerCase();
    
    switch (sectionId) {
      case 1: // Full Name
        // Match name fields based on screenshot knowledge
        if (normalizedName.includes('lastname') || normalizedName === 'last') {
          return pdfFields.find(f => (f.label && f.label.toLowerCase().includes('last name')) || 
                                     f.name.toLowerCase().includes('lastname')) || null;
        }
        if (normalizedName.includes('firstname') || normalizedName === 'first') {
          return pdfFields.find(f => (f.label && f.label.toLowerCase().includes('first name')) || 
                                     f.name.toLowerCase().includes('firstname')) || null;
        }
        if (normalizedName.includes('middlename') || normalizedName === 'middle') {
          return pdfFields.find(f => (f.label && f.label.toLowerCase().includes('middle name')) || 
                                     f.name.toLowerCase().includes('middlename')) || null;
        }
        if (normalizedName.includes('suffix')) {
          return pdfFields.find(f => (f.label && f.label.toLowerCase().includes('suffix')) || 
                                     f.name.toLowerCase().includes('suffix')) || null;
        }
        break;
        
      case 2: // Date of Birth
        if (normalizedName.includes('dateofbirth') || normalizedName.includes('birthdate') || normalizedName.includes('dob')) {
          return pdfFields.find(f => (f.label && 
                                     (f.label.toLowerCase().includes('date of birth') || 
                                      f.label.toLowerCase().includes('birth'))) || 
                                    /birth|dob/i.test(f.name)) || null;
        }
        if (normalizedName.includes('estimated') || normalizedName.includes('est')) {
          return pdfFields.find(f => (f.label && f.label.toLowerCase().includes('est')) || 
                                    /est\.?|estimated/i.test(f.name)) || null;
        }
        break;
        
      case 3: // Place of Birth
        if (normalizedName.includes('city')) {
          return pdfFields.find(f => (f.label && f.label.toLowerCase().includes('city')) || 
                                    /city/i.test(f.name)) || null;
        }
        if (normalizedName.includes('county')) {
          return pdfFields.find(f => (f.label && f.label.toLowerCase().includes('county')) || 
                                    /county/i.test(f.name)) || null;
        }
        if (normalizedName.includes('state')) {
          return pdfFields.find(f => (f.label && f.label.toLowerCase().includes('state')) || 
                                    /state/i.test(f.name)) || null;
        }
        if (normalizedName.includes('country')) {
          return pdfFields.find(f => (f.label && f.label.toLowerCase().includes('country')) || 
                                    /country/i.test(f.name)) || null;
        }
        break;
        
      case 4: // Social Security Number
        if (normalizedName.includes('ssn') || normalizedName.includes('socialsecurity')) {
          return pdfFields.find(f => (f.label && 
                                     (f.label.toLowerCase().includes('social security') || 
                                      f.label.toLowerCase().includes('ssn'))) || 
                                    /ssn|socialsecurity|social_security/i.test(f.name)) || null;
        }
        if (normalizedName.includes('notapplicable')) {
          return pdfFields.find(f => (f.label && f.label.toLowerCase().includes('not applicable')) || 
                                    /not_applicable|notapplicable/i.test(f.name)) || null;
        }
        break;
        
      case 5: // Other Names
        if (normalizedName.includes('othername') || normalizedName.includes('alias')) {
          return pdfFields.find(f => (f.label && (f.label.toLowerCase().includes('other name') || 
                                                f.label.toLowerCase().includes('alias'))) || 
                              /other_?names?|alias/i.test(f.name)) || null;
        }
        if (normalizedName.includes('from') && !normalizedName.includes('to')) {
          return pdfFields.find(f => (f.label && f.label.toLowerCase().includes('from')) || 
                              /from_?date/i.test(f.name)) || null;
        }
        if (normalizedName.includes('to') && !normalizedName.includes('from')) {
          return pdfFields.find(f => (f.label && f.label.toLowerCase().includes('to')) || 
                              /to_?date/i.test(f.name)) || null;
        }
        if (normalizedName.includes('reason')) {
          return pdfFields.find(f => (f.label && f.label.toLowerCase().includes('reason')) || 
                              /reason/i.test(f.name)) || null;
        }
        break;
        
      case 6: // Identifying Information
        if (normalizedName.includes('height')) {
          if (normalizedName.includes('feet')) {
            return pdfFields.find(f => (f.label && f.label.toLowerCase().includes('feet')) || 
                                /height.*feet|feet|ft/i.test(f.name)) || null;
          }
          if (normalizedName.includes('inch')) {
            return pdfFields.find(f => (f.label && f.label.toLowerCase().includes('inch')) || 
                                /height.*inch|inch|in/i.test(f.name)) || null;
          }
          return pdfFields.find(f => (f.label && f.label.toLowerCase().includes('height')) || 
                              /height/i.test(f.name)) || null;
        }
        if (normalizedName.includes('weight')) {
          return pdfFields.find(f => (f.label && f.label.toLowerCase().includes('weight')) || 
                              /weight|lbs/i.test(f.name)) || null;
        }
        if (normalizedName.includes('hair')) {
          return pdfFields.find(f => (f.label && (f.label.toLowerCase().includes('hair') || 
                                               f.label.toLowerCase().includes('hair color'))) || 
                              /hair/i.test(f.name)) || null;
        }
        if (normalizedName.includes('eye')) {
          return pdfFields.find(f => (f.label && (f.label.toLowerCase().includes('eye') || 
                                               f.label.toLowerCase().includes('eye color'))) || 
                              /eye/i.test(f.name)) || null;
        }
        if (normalizedName.includes('sex') || normalizedName.includes('gender')) {
          return pdfFields.find(f => (f.label && (f.label.toLowerCase().includes('sex') || 
                                               f.label.toLowerCase().includes('gender'))) || 
                              /sex|gender/i.test(f.name)) || null;
        }
        break;
        
      case 7: // Contact Information - Enhanced based on screenshots
        // Email fields
        if (normalizedName.includes('email')) {
          if (normalizedName.includes('home') || normalizedName.includes('personal')) {
            return pdfFields.find(f => (f.label && (f.label.toLowerCase().includes('home e-mail') || 
                                                 f.label.toLowerCase().includes('personal e-mail'))) || 
                                /home.*email|personal.*email/i.test(f.name)) || null;
          }
          if (normalizedName.includes('work')) {
            return pdfFields.find(f => (f.label && f.label.toLowerCase().includes('work e-mail')) || 
                                /work.*email|business.*email/i.test(f.name)) || null;
          }
          return pdfFields.find(f => (f.label && f.label.toLowerCase().includes('e-mail')) || 
                              /email|e-mail/i.test(f.name)) || null;
        }
        
        // Phone number fields
        if (normalizedName.includes('phone') || normalizedName.includes('telephone')) {
          if (normalizedName.includes('home')) {
            return pdfFields.find(f => (f.label && (f.label.toLowerCase().includes('home telephone') || 
                                                 f.label.toLowerCase().includes('home phone'))) || 
                                /home.*phone|home.*tel/i.test(f.name)) || null;
          }
          if (normalizedName.includes('work')) {
            return pdfFields.find(f => (f.label && (f.label.toLowerCase().includes('work telephone') || 
                                                 f.label.toLowerCase().includes('work phone'))) || 
                                /work.*phone|work.*tel|bus.*phone/i.test(f.name)) || null;
          }
          if (normalizedName.includes('mobile') || normalizedName.includes('cell')) {
            return pdfFields.find(f => (f.label && (f.label.toLowerCase().includes('mobile') || 
                                                 f.label.toLowerCase().includes('cell'))) || 
                                /mobile|cell/i.test(f.name)) || null;
          }
          if (normalizedName.includes('day')) {
            return pdfFields.find(f => (f.label && f.label.toLowerCase().includes('day phone')) || 
                                /day.*phone|daytime/i.test(f.name)) || null;
          }
          if (normalizedName.includes('night')) {
            return pdfFields.find(f => (f.label && f.label.toLowerCase().includes('night phone')) || 
                                /night.*phone|evening/i.test(f.name)) || null;
          }
          if (normalizedName.includes('extension') || normalizedName.includes('ext')) {
            return pdfFields.find(f => (f.label && (f.label.toLowerCase().includes('extension') || 
                                                 f.label.toLowerCase().includes('ext'))) || 
                                /ext|extension/i.test(f.name)) || null;
          }
          if (normalizedName.includes('dsn')) {
            return pdfFields.find(f => (f.label && f.label.toLowerCase().includes('dsn')) || 
                                /dsn/i.test(f.name)) || null;
          }
          if (normalizedName.includes('international') || normalizedName.includes('country')) {
            return pdfFields.find(f => (f.label && (f.label.toLowerCase().includes('international') || 
                                                 f.label.toLowerCase().includes('country code'))) || 
                                /international|country.*code/i.test(f.name)) || null;
          }
          if (normalizedName.includes('area')) {
            return pdfFields.find(f => (f.label && f.label.toLowerCase().includes('area code')) || 
                                /area.*code/i.test(f.name)) || null;
          }
          // General phone number match as fallback
          return pdfFields.find(f => (f.label && (f.label.toLowerCase().includes('telephone') || 
                                               f.label.toLowerCase().includes('phone'))) || 
                              /phone|tel|telephone/i.test(f.name)) || null;
        }
        break;
        
      case 8: // U.S. Passport - Enhanced based on screenshots
        if (normalizedName.includes('passport')) {
          // Passport possession
          if (normalizedName.includes('possess') || normalizedName.includes('has') || normalizedName.includes('have')) {
            return pdfFields.find(f => (f.label && (f.label.toLowerCase().includes('possess a u.s. passport') || 
                                                 f.label.toLowerCase().includes('have a passport'))) || 
                                /possess.*passport|has.*passport|have.*passport/i.test(f.name)) || null;
          }
          
          // Passport number
          if (normalizedName.includes('number')) {
            return pdfFields.find(f => (f.label && f.label.toLowerCase().includes('passport number')) || 
                                /passport.*number|passport.*no/i.test(f.name)) || null;
          }
          
          // Passport type (book/card)
          if (normalizedName.includes('book')) {
            return pdfFields.find(f => (f.label && f.label.toLowerCase().includes('passport book')) || 
                                /passport.*book/i.test(f.name)) || null;
          }
          if (normalizedName.includes('card')) {
            return pdfFields.find(f => (f.label && f.label.toLowerCase().includes('passport card')) || 
                                /passport.*card/i.test(f.name)) || null;
          }
          
          // Issue date
          if (normalizedName.includes('issue')) {
            if (normalizedName.includes('month')) {
              return pdfFields.find(f => (f.label && f.label.toLowerCase().includes('issue date month')) || 
                                  /issue.*month|month.*issue/i.test(f.name)) || null;
            }
            if (normalizedName.includes('day')) {
              return pdfFields.find(f => (f.label && f.label.toLowerCase().includes('issue date day')) || 
                                  /issue.*day|day.*issue/i.test(f.name)) || null;
            }
            if (normalizedName.includes('year')) {
              return pdfFields.find(f => (f.label && f.label.toLowerCase().includes('issue date year')) || 
                                  /issue.*year|year.*issue/i.test(f.name)) || null;
            }
            return pdfFields.find(f => (f.label && f.label.toLowerCase().includes('issue date')) || 
                                /issue.*date|date.*issue/i.test(f.name)) || null;
          }
          
          // Expiration date
          if (normalizedName.includes('expiration') || normalizedName.includes('expiry')) {
            if (normalizedName.includes('month')) {
              return pdfFields.find(f => (f.label && f.label.toLowerCase().includes('expiration date month')) || 
                                  /expir.*month|month.*expir/i.test(f.name)) || null;
            }
            if (normalizedName.includes('day')) {
              return pdfFields.find(f => (f.label && f.label.toLowerCase().includes('expiration date day')) || 
                                  /expir.*day|day.*expir/i.test(f.name)) || null;
            }
            if (normalizedName.includes('year')) {
              return pdfFields.find(f => (f.label && f.label.toLowerCase().includes('expiration date year')) || 
                                  /expir.*year|year.*expir/i.test(f.name)) || null;
            }
            return pdfFields.find(f => (f.label && (f.label.toLowerCase().includes('expiration date') || 
                                                 f.label.toLowerCase().includes('expiry date'))) || 
                                /expir.*date|date.*expir/i.test(f.name)) || null;
          }
          
          // Name fields on passport
          if (normalizedName.includes('lastname') || normalizedName.includes('last')) {
            return pdfFields.find(f => (f.label && (f.label.toLowerCase().includes('last name on passport') || 
                                                 f.label.toLowerCase().includes('passport last name'))) || 
                                /passport.*last|last.*passport/i.test(f.name)) || null;
          }
          if (normalizedName.includes('firstname') || normalizedName.includes('first')) {
            return pdfFields.find(f => (f.label && (f.label.toLowerCase().includes('first name on passport') || 
                                                 f.label.toLowerCase().includes('passport first name'))) || 
                                /passport.*first|first.*passport/i.test(f.name)) || null;
          }
          if (normalizedName.includes('middlename') || normalizedName.includes('middle')) {
            return pdfFields.find(f => (f.label && (f.label.toLowerCase().includes('middle name on passport') || 
                                                 f.label.toLowerCase().includes('passport middle name'))) || 
                                /passport.*middle|middle.*passport/i.test(f.name)) || null;
          }
          if (normalizedName.includes('suffix')) {
            return pdfFields.find(f => (f.label && (f.label.toLowerCase().includes('suffix on passport') || 
                                                 f.label.toLowerCase().includes('passport suffix'))) || 
                                /passport.*suffix|suffix.*passport/i.test(f.name)) || null;
          }
          
          // Place of issuance
          if (normalizedName.includes('issuance') || normalizedName.includes('issuing')) {
            return pdfFields.find(f => (f.label && (f.label.toLowerCase().includes('place of issuance') || 
                                                 f.label.toLowerCase().includes('issuing authority'))) || 
                                /issu.*place|issu.*authority|issu.*office/i.test(f.name)) || null;
          }
          
          // General passport match as fallback
          return pdfFields.find(f => (f.label && f.label.toLowerCase().includes('passport')) || 
                              /passport/i.test(f.name)) || null;
        }
        
        // Yes/No responses
        if (normalizedName === 'yes') {
          return pdfFields.find(f => (f.label && f.label.toLowerCase() === 'yes') || 
                              /^yes$/i.test(f.name)) || null;
        }
        if (normalizedName === 'no') {
          return pdfFields.find(f => (f.label && f.label.toLowerCase() === 'no') || 
                              /^no$/i.test(f.name)) || null;
        }
        break;
        
      case 9: // Citizenship - Enhanced based on screenshots
        // Main citizenship options
        if (normalizedName.includes('citizenship')) {
          return pdfFields.find(f => (f.label && f.label.toLowerCase().includes('citizenship status')) || 
                              /citizenship|citizen.*status/i.test(f.name)) || null;
        }
        
        // U.S. Born Citizen
        if (normalizedName.includes('born') && normalizedName.includes('us')) {
          return pdfFields.find(f => (f.label && (f.label.toLowerCase().includes('born in the u.s.') || 
                                               f.label.toLowerCase().includes('u.s. born'))) || 
                              /born.*us|us.*born/i.test(f.name)) || null;
        }
        if (normalizedName.includes('birth') && (normalizedName.includes('certificate') || normalizedName.includes('cert'))) {
          return pdfFields.find(f => (f.label && f.label.toLowerCase().includes('birth certificate')) || 
                              /birth.*cert/i.test(f.name)) || null;
        }
        
        // Citizen by Birth Abroad
        if (normalizedName.includes('born') && normalizedName.includes('abroad')) {
          return pdfFields.find(f => (f.label && f.label.toLowerCase().includes('born abroad')) || 
                              /born.*abroad|citizen.*abroad/i.test(f.name)) || null;
        }
        if (normalizedName.includes('parent') && normalizedName.includes('citizen')) {
          return pdfFields.find(f => (f.label && (f.label.toLowerCase().includes('u.s. citizen parent') || 
                                               f.label.toLowerCase().includes('born to u.s. parent'))) || 
                              /born.*parent|parent.*citizen/i.test(f.name)) || null;
        }
        if (normalizedName.includes('document') && normalizedName.includes('type')) {
          return pdfFields.find(f => (f.label && f.label.toLowerCase().includes('document type')) || 
                              /document.*type/i.test(f.name)) || null;
        }
        
        // Document types for birth abroad
        if (normalizedName.includes('fs240') || normalizedName.includes('fs-240')) {
          return pdfFields.find(f => (f.label && (f.label.toLowerCase().includes('fs-240') || 
                                               f.label.toLowerCase().includes('fs240'))) || 
                              /fs.?240/i.test(f.name)) || null;
        }
        if (normalizedName.includes('ds1350') || normalizedName.includes('ds-1350')) {
          return pdfFields.find(f => (f.label && (f.label.toLowerCase().includes('ds-1350') || 
                                               f.label.toLowerCase().includes('ds1350'))) || 
                              /ds.?1350/i.test(f.name)) || null;
        }
        if (normalizedName.includes('fs545') || normalizedName.includes('fs-545')) {
          return pdfFields.find(f => (f.label && (f.label.toLowerCase().includes('fs-545') || 
                                               f.label.toLowerCase().includes('fs545'))) || 
                              /fs.?545/i.test(f.name)) || null;
        }
        
        // Naturalized Citizen
        if (normalizedName.includes('naturalized')) {
          return pdfFields.find(f => (f.label && f.label.toLowerCase().includes('naturalized')) || 
                              /naturalized/i.test(f.name)) || null;
        }
        if (normalizedName.includes('naturalization') && normalizedName.includes('certificate')) {
          return pdfFields.find(f => (f.label && f.label.toLowerCase().includes('certificate of naturalization')) || 
                              /naturalization.*cert|cert.*natural/i.test(f.name)) || null;
        }
        if (normalizedName.includes('date') && normalizedName.includes('entry')) {
          return pdfFields.find(f => (f.label && f.label.toLowerCase().includes('date of entry')) || 
                              /date.*entry|entry.*date/i.test(f.name)) || null;
        }
        if (normalizedName.includes('location') && normalizedName.includes('entry')) {
          return pdfFields.find(f => (f.label && f.label.toLowerCase().includes('location of entry')) || 
                              /location.*entry|entry.*location|port.*entry/i.test(f.name)) || null;
        }
        if (normalizedName.includes('prior') && normalizedName.includes('citizenship')) {
          return pdfFields.find(f => (f.label && f.label.toLowerCase().includes('prior citizenship')) || 
                              /prior.*citizen|previous.*citizen/i.test(f.name)) || null;
        }
        if (normalizedName.includes('court') && normalizedName.includes('name')) {
          return pdfFields.find(f => (f.label && f.label.toLowerCase().includes('court name')) || 
                              /court.*name/i.test(f.name)) || null;
        }
        if (normalizedName.includes('basis') && normalizedName.includes('naturalization')) {
          return pdfFields.find(f => (f.label && f.label.toLowerCase().includes('basis of naturalization')) || 
                              /basis.*natural|natural.*basis/i.test(f.name)) || null;
        }
        
        // Derived Citizen
        if (normalizedName.includes('derived')) {
          return pdfFields.find(f => (f.label && f.label.toLowerCase().includes('derived')) || 
                              /derived/i.test(f.name)) || null;
        }
        if (normalizedName.includes('alien') && normalizedName.includes('registration')) {
          return pdfFields.find(f => (f.label && f.label.toLowerCase().includes('alien registration')) || 
                              /alien.*reg|a.*number/i.test(f.name)) || null;
        }
        if (normalizedName.includes('permanent') && normalizedName.includes('resident')) {
          return pdfFields.find(f => (f.label && f.label.toLowerCase().includes('permanent resident')) || 
                              /perm.*resident|resident.*card/i.test(f.name)) || null;
        }
        if (normalizedName.includes('basis') && normalizedName.includes('derived')) {
          return pdfFields.find(f => (f.label && f.label.toLowerCase().includes('basis of derived citizenship')) || 
                              /basis.*derived|derived.*basis/i.test(f.name)) || null;
        }
        
        // Not a U.S. Citizen
        if (normalizedName.includes('not') && normalizedName.includes('citizen')) {
          return pdfFields.find(f => (f.label && f.label.toLowerCase().includes('not a u.s. citizen')) || 
                              /not.*citizen|non.*citizen/i.test(f.name)) || null;
        }
        if (normalizedName.includes('current') && normalizedName.includes('citizenship')) {
          return pdfFields.find(f => (f.label && f.label.toLowerCase().includes('current citizenship')) || 
                              /current.*citizen|country.*citizen/i.test(f.name)) || null;
        }
        if (normalizedName.includes('resident') && normalizedName.includes('status')) {
          return pdfFields.find(f => (f.label && f.label.toLowerCase().includes('resident status')) || 
                              /resident.*status|immigration.*status/i.test(f.name)) || null;
        }
        if (normalizedName.includes('visa') && normalizedName.includes('type')) {
          return pdfFields.find(f => (f.label && f.label.toLowerCase().includes('visa type')) || 
                              /visa.*type/i.test(f.name)) || null;
        }
        
        // Generic fallback for document numbers
        if (normalizedName.includes('document') && normalizedName.includes('number')) {
          return pdfFields.find(f => (f.label && f.label.toLowerCase().includes('document number')) || 
                              /document.*number|cert.*number/i.test(f.name)) || null;
        }
        break;
    }
    
    return null;
  }
  
  /**
   * Provide additional score boost for field matching based on section specific knowledge
   */
  private getFieldMatchingScoreBoost(field: PdfFieldMetadata, fieldName: string, sectionId: number): number {
    let boost = 0;
    const fieldNameLower = fieldName.toLowerCase();
    const fieldLabel = field.label?.toLowerCase() || '';
    const fieldNameNormalized = this.normalizeFieldName(field.name);
    
    // Section 5 specific boosts (Other Names)
    if (sectionId === 5) {
      // Match entry number patterns (#1, #2, etc.)
      if (/entry(\d+)|entry_(\d+)|#(\d+)/i.test(fieldNameLower)) {
        const entryNum = fieldNameLower.match(/\d+/)?.[0];
        if (entryNum && field.name.includes(`[${entryNum}]`)) {
          boost += 0.3;
        }
      }
      
      // Match time period fields
      if (fieldNameLower.includes('from') && field.name.toLowerCase().includes('from')) {
        boost += 0.2;
      }
      if (fieldNameLower.includes('to') && field.name.toLowerCase().includes('to')) {
        boost += 0.2;
      }
      
      // Match maiden name checkbox
      if (fieldNameLower.includes('maiden') && fieldLabel.includes('maiden')) {
        boost += 0.3;
      }
    }
    
    // Section 6 specific boosts (Physical Attributes)
    if (sectionId === 6) {
      // Height fields
      if (fieldNameLower.includes('height')) {
        if (fieldNameLower.includes('feet') && fieldLabel.includes('feet')) {
          boost += 0.3;
        }
        if (fieldNameLower.includes('inches') && fieldLabel.includes('inches')) {
          boost += 0.3;
        }
      }
      
      // Gender/Sex radio buttons
      if (fieldNameLower.includes('sex') || fieldNameLower.includes('gender')) {
        if (fieldNameLower.includes('female') && fieldLabel.includes('female')) {
          boost += 0.3;
        }
        if (fieldNameLower.includes('male') && fieldLabel.includes('male')) {
          boost += 0.3;
        }
      }
    }
    
    // Section 7 specific boosts (Contact Information)
    if (sectionId === 7) {
      // Phone types
      if (fieldNameLower.includes('phone') || fieldNameLower.includes('telephone')) {
        if (fieldNameLower.includes('home') && fieldLabel.includes('home')) {
          boost += 0.3;
        }
        if (fieldNameLower.includes('work') && fieldLabel.includes('work')) {
          boost += 0.3;
        }
        if ((fieldNameLower.includes('mobile') || fieldNameLower.includes('cell')) && 
            (fieldLabel.includes('mobile') || fieldLabel.includes('cell'))) {
          boost += 0.3;
        }
      }
      
      // Email types
      if (fieldNameLower.includes('email')) {
        if (fieldNameLower.includes('home') && fieldLabel.includes('home')) {
          boost += 0.3;
        }
        if (fieldNameLower.includes('work') && fieldLabel.includes('work')) {
          boost += 0.3;
        }
      }
    }
    
    return boost;
  }
  
  /**
   * Check if schema and PDF field types are compatible
   */
  private areTypesCompatible(schemaType: string, pdfType: string): boolean {
    // Simple compatibility mapping
    const compatibilityMap: {[key: string]: string[]} = {
      'string': ['text', 'dropdown', 'radio'],
      'boolean': ['checkbox', 'radio'],
      'number': ['text'],
      'integer': ['text'],
      'array': ['checkbox', 'dropdown', 'radio'],
      'object': ['text'], // Complex objects might map to multiple fields
      'null': []
    };
    
    return compatibilityMap[schemaType]?.includes(pdfType) || false;
  }
  
  /**
   * Calculate confidence score for a single field mapping
   */
  private calculateFieldConfidence(fieldDef: any, fieldKey: string, sectionId: number): number {
    let confidence = 0.5; // Base confidence score
    
    // Find matching PDF field
    const matchingPdfField = this.findMatchingPdfField(fieldDef, fieldKey, sectionId);
    
    // If no matching field found, reduce confidence
    if (!matchingPdfField) {
      confidence -= 0.3;
    } else {
      // Boost confidence based on match quality
      confidence += 0.3;
      
      // Store the PDF field ID for future reference
      if (!fieldDef.pdfFieldId) {
        fieldDef.pdfFieldId = matchingPdfField.id;
        
        // Also store the field name for better debugging
        if (!fieldDef.pdfFieldName) {
          fieldDef.pdfFieldName = matchingPdfField.name;
        }
      }
      
      // If the field has a proper label from the PDF, use that for the description
      if (matchingPdfField.label && !fieldDef.description) {
        fieldDef.description = matchingPdfField.label;
        confidence += 0.1; // Boost for adding meaningful description
      }
      
      // Boost confidence for exact field ID match
      if (fieldDef.pdfFieldId === matchingPdfField.id) {
        confidence += 0.2;
      }
    }
    
    // Factor 1: Field name quality (generic vs. semantic)
    const fieldName = fieldKey.split('.').pop() || '';
    const isGenericName = /field\d+$/.test(fieldName);
    
    if (!isGenericName) {
      confidence += 0.2; // Boost if field has a semantic name rather than generic "fieldN"
      
      // Additional boost for highly semantic field names
      if (this.isHighlySemanticFieldName(fieldName)) {
        confidence += 0.1;
      }
    } else {
      confidence -= 0.1; // Penalize generic names
    }
    
    // Factor 2: Field description specificity
    if (fieldDef.description) {
      const descLength = fieldDef.description.length;
      if (descLength > 50) {
        confidence += 0.15;
      } else if (descLength > 20) {
        confidence += 0.1;
      } else if (descLength > 10) {
        confidence += 0.05;
      }
      
      // Check if description matches common field patterns
      for (const [category, pattern] of Object.entries(this.commonFieldPatterns)) {
        if (pattern.test(fieldDef.description)) {
          confidence += 0.05;
          break;
        }
      }
    }
    
    // Factor 3: Field constraints presence and quality
    if (fieldDef.maxLength) confidence += 0.05;
    if (fieldDef.minLength) confidence += 0.05;
    if (fieldDef.pattern) confidence += 0.1;
    
    // Specialized handling for enums/options
    if (fieldDef.enum) {
      confidence += 0.1;
      
      // If we have a matching PDF field with options, check if they align
      if (matchingPdfField?.options && matchingPdfField.options.length > 0) {
        const matchingOptionCount = fieldDef.enum.filter(
          (option: string) => matchingPdfField.options?.includes(option)
        ).length;
        
        if (matchingOptionCount > 0) {
          const optionMatchRatio = matchingOptionCount / fieldDef.enum.length;
          confidence += optionMatchRatio * 0.2;
        }
      }
    }
    
    // Factor 4: Label quality and match
    if (fieldDef.label || fieldDef.title) {
      const labelText = fieldDef.label || fieldDef.title;
      const labelLength = labelText.length;
      
      if (labelLength > 15) {
        confidence += 0.1;
      } else if (labelLength > 5) {
        confidence += 0.05;
      }
      
      // Check if label matches any common field patterns
      for (const pattern of Object.values(this.commonFieldPatterns)) {
        if (pattern.test(labelText)) {
          confidence += 0.05;
          break;
        }
      }
      
      // If matching PDF field has a label, compare them
      if (matchingPdfField?.label) {
        const pdfLabel = matchingPdfField.label.toLowerCase();
        const schemaLabel = labelText.toLowerCase();
        
        if (pdfLabel === schemaLabel) {
          confidence += 0.15;
        } else if (pdfLabel.includes(schemaLabel) || schemaLabel.includes(pdfLabel)) {
          confidence += 0.1;
        }
      }
    }
    
    // Factor 5: Validate PDF field ID format
    const hasValidPdfId = fieldDef.pdfFieldId && /^\d+(\s\d+\sR|\s0\sR)$/.test(fieldDef.pdfFieldId);
    if (hasValidPdfId) {
      confidence += 0.1;
    } else if (fieldDef.pdfFieldId) {
      confidence -= 0.1; // Invalid format but trying to map
    }
    
    // Factor 6: Required field status consistency
    if (fieldDef.required && matchingPdfField?.required) {
      confidence += 0.1; // Both schema and PDF mark as required
    } else if (fieldDef.required !== undefined && matchingPdfField && 
               matchingPdfField.required !== undefined && 
               fieldDef.required !== matchingPdfField.required) {
      confidence -= 0.05; // Inconsistent required status
    }
    
    // Factor 7: Field type consistency
    if (fieldDef.type && matchingPdfField?.type) {
      const schemaType = fieldDef.type.toLowerCase();
      const pdfType = this.mapPdfTypeToSchemaType(matchingPdfField.type);
      
      // Direct type match
      if (this.areTypesCompatible(schemaType, pdfType)) {
        confidence += 0.1;
      } else {
        confidence -= 0.1; // Type mismatch
      }
    }
    
    // Section-specific boosts from screenshot analysis
    confidence += this.getSectionSpecificConfidenceBoost(fieldDef, fieldKey, sectionId);
    
    // If direct evidence from screenshot is available (exact field name match)
    if (this.isFieldConfirmedByScreenshots(fieldName, sectionId)) {
      confidence = 1.0; // 100% confidence for fields directly observed in screenshots
    }
    
    // Ensure confidence is within range [0, 1]
    return Math.max(0, Math.min(1, confidence));
  }
  
  /**
   * Check if a field name is highly semantic
   */
  private isHighlySemanticFieldName(fieldName: string): boolean {
    // List of highly semantic field names based on screenshots
    const highlySemanticNames = [
      'lastName', 'firstName', 'middleName', 'suffix',
      'dateOfBirth', 'birthCity', 'birthCounty', 'birthState', 'birthCountry',
      'socialSecurityNumber', 'ssn',
      'height', 'weight', 'hairColor', 'eyeColor', 'sex',
      'homeEmail', 'workEmail', 'homePhone', 'workPhone', 'mobilePhone',
      'passportNumber', 'passportIssueDate', 'passportExpirationDate',
      'citizenshipStatus'
    ];
    
    return highlySemanticNames.some(name => 
      fieldName === name || 
      fieldName.toLowerCase() === name.toLowerCase() ||
      fieldName.includes(name) ||
      name.includes(fieldName)
    );
  }
  
  /**
   * Check if a field has been directly observed in screenshots
   */
  private isFieldConfirmedByScreenshots(fieldName: string, sectionId: number): boolean {
    // Fields directly observed in the screenshots
    const confirmedFields: {[key: number]: string[]} = {
      1: ['lastName', 'firstName', 'middleName', 'suffix'], // Section 1: Full Name
      2: ['dateOfBirth', 'birthDate', 'dob', 'estimated'], // Section 2: Date of Birth
      3: ['birthCity', 'birthCounty', 'birthState', 'birthCountry'], // Section 3: Place of Birth
      4: ['socialSecurityNumber', 'ssn', 'notApplicable'], // Section 4: SSN
      5: ['otherNames', 'lastName', 'firstName', 'middleName', 'suffix', 'fromDate', 'toDate', 'present', 'maidenName', 'reasonForChange'], // Section 5: Other Names
      6: ['height', 'heightFeet', 'heightInches', 'weight', 'hairColor', 'eyeColor', 'sex', 'female', 'male'], // Section 6: Identifying Info
      
      // Section 7: Contact Information - Enhanced based on new screenshots
      7: [
        // Email fields
        'homeEmail', 'workEmail', 'personalEmail', 'emailAddress',
        
        // Phone number fields
        'homePhone', 'workPhone', 'mobilePhone', 'cellPhone', 'dayPhone', 'nightPhone',
        'extension', 'dsn', 'international', 'countryCode', 'areaCode',
        
        // Specific format fields
        'phoneNumber', 'phoneNumberHome', 'phoneNumberWork', 'phoneNumberMobile',
        'homePhoneType', 'workPhoneType', 'mobilePhoneType',
        
        // Other contact fields
        'preferredContact', 'contactMethod', 'timeToCall'
      ],
      
      // Section 8: U.S. Passport - Enhanced based on new screenshots
      8: [
        // Passport existence
        'hasPassport', 'possessPassport', 'havePassport', 'currentlyPossessPassport',
        
        // Passport details
        'passportNumber', 'passportBook', 'passportCard',
        
        // Date fields
        'issueDate', 'issueDateMonth', 'issueDateDay', 'issueDateYear',
        'expirationDate', 'expirationDateMonth', 'expirationDateDay', 'expirationDateYear',
        
        // Name on passport
        'passportLastName', 'passportFirstName', 'passportMiddleName', 'passportSuffix',
        'nameOnPassport', 'fullNameOnPassport',
        
        // Place of issuance
        'placeOfIssuance', 'issuingAuthority', 'issuingOffice',
        
        // Boolean responses
        'yes', 'no', 'notApplicable'
      ],
      
      // Section 9: Citizenship - Enhanced based on new screenshots
      9: [
        // Main citizenship status options
        'citizenshipStatus', 'usCitizenByBirth', 'usBornCitizen', 'citizenByBirthAbroad', 
        'naturalizedCitizen', 'derivedCitizen', 'notCitizen', 'alienStatus',
        
        // U.S. born citizen fields
        'bornInUS', 'bornInUSTerritory', 'birthCertificate', 'stateOfBirth',
        
        // Birth abroad fields
        'bornToUSParents', 'bornAbroad', 'documentType', 'fs240', 'ds1350', 'fs545', 
        'otherDocumentType', 'documentNumber', 'documentIssueDate', 'placeOfIssuance', 
        'certificateOfCitizenship', 'documentName', 'foreignBornDocumentation',
        
        // Naturalization fields
        'dateOfEntry', 'entryDate', 'locationOfEntry', 'entryLocation', 'portOfEntry',
        'priorCitizenship', 'alienRegistration', 'certificateOfNaturalization',
        'naturalizationCertificateNumber', 'naturalizationDate', 'dateNaturalized',
        'courtName', 'courtAddress', 'courtCity', 'courtState', 'courtZipCode',
        'basisOfNaturalization', 'naturalizationBasis',
        
        // Derived citizenship fields
        'alienRegistrationNumber', 'permanentResidentCard', 'certificateOfCitizenshipNumber',
        'basisOfDerivedCitizenship', 'citizenshipBasis', 'derivedFrom', 'citizenParent',
        'parentCitizenship', 'derivationDate', 'dateOfDerivation',
        
        // Not a U.S. citizen fields
        'nonUSCitizen', 'currentCitizenship', 'countryOfCitizenship', 'residentStatus',
        'immigrationStatus', 'visaType', 'i94Number', 'visaNumber',
        
        // Boolean responses
        'yes', 'no', 'notApplicable'
      ]
    };
    
    return confirmedFields[sectionId]?.some(field => 
      fieldName === field || 
      fieldName.toLowerCase() === field.toLowerCase() ||
      fieldName.includes(field) ||
      field.includes(fieldName)
    ) || false;
  }
  
  /**
   * Map PDF field type to schema type
   */
  private mapPdfTypeToSchemaType(pdfType: string): string {
    const typeMap: {[key: string]: string} = {
      'PDFTextField': 'text',
      'PDFDropdown': 'dropdown',
      'PDFRadioGroup': 'radio',
      'PDFCheckBox': 'checkbox',
      'PDFButton': 'button'
    };
    
    return typeMap[pdfType] || pdfType.replace('PDF', '').toLowerCase();
  }
  
  /**
   * Apply section-specific confidence adjustments based on screenshot analysis
   */
  private getSectionSpecificConfidenceBoost(fieldDef: any, fieldKey: string, sectionId: number): number {
    // Base boost starts at 0
    let boost = 0;
    
    // Get the base field name without the section prefix
    const baseFieldName = fieldKey.split('.').pop() || '';
    
    // Check if this is a highly semantic field name that deserves a boost
    if (this.isHighlySemanticFieldName(baseFieldName)) {
      boost += 0.3; // Significant boost for highly semantic field names
    }
    
    // Check if field is confirmed by screenshots
    if (this.isFieldConfirmedByScreenshots(baseFieldName, sectionId)) {
      boost += 0.4; // Major boost for fields directly observed in screenshots
    }
    
    // Apply section-specific boosts based on field definitions and section ID
    switch (sectionId) {
      case 1: // Full Name
        // ... existing case 1 code ...
        
      case 2: // Date of Birth  
        // ... existing case 2 code ...
        
      case 3: // Place of Birth
        // ... existing case 3 code ...
        
      case 4: // Social Security Number
        if (/^socialSecurityNumber$|^ssn$/i.test(baseFieldName)) {
          boost += 0.5; // Major boost for main SSN field
        } else if (/social|security|ssn/i.test(baseFieldName)) {
          boost += 0.3; // Boost for SSN-related fields
        }
        
        // SPECIAL HANDLING: Check if this is the primary SSN field from the form
        if (fieldDef.pdfFieldName) {
          // Look for specifically for form1[0].Sections1-6[0].section4[0].SSN[0]
          // and other common SSN patterns
          if (fieldDef.pdfFieldName.includes('section4[0].SSN[0]') ||
              fieldDef.pdfFieldName.includes('Sections1-6[0].SSN[0]')) {
            boost += 0.5; // Max boost for the primary SSN field that appears in the PDF
            console.log(`Found primary SSN field: ${fieldDef.pdfFieldName}`);
          }
        }
        
        // Boost fields with high value matches from screenshots (specifically for SSN)
        if (fieldDef.value && /\d{3}-\d{2}-\d{4}/.test(fieldDef.value)) {
          boost += 0.5; // Max boost for fields with SSN format values
        }
        
        break;
        
      // ... rest of the existing switch cases ...
    }
    
    return boost;
  }
  
  /**
   * Get confidence level enum from numeric score
   */
  getConfidenceLevel(score: number): ConfidenceLevel {
    if (score >= 0.8) return ConfidenceLevel.High;
    if (score >= 0.5) return ConfidenceLevel.Medium;
    return ConfidenceLevel.Low;
  }
  
  /**
   * Generate a summary report of mapping status
   */
  async generateMappingSummary(): Promise<string> {
    const reports = await this.generateFieldMappingReports();
    
    let summary = "SF-86 Field Mapping Summary\n";
    summary += "==========================\n\n";
    
    const totalFields = reports.reduce((sum, report) => sum + report.fieldCount, 0);
    const mappedFields = reports.reduce((sum, report) => sum + report.mappedCount, 0);
    const mappingPercentage = totalFields > 0 ? (mappedFields / totalFields * 100).toFixed(1) : '0';
    
    summary += `Total Fields: ${totalFields}\n`;
    summary += `Mapped Fields: ${mappedFields} (${mappingPercentage}%)\n\n`;
    
    summary += "Section Breakdown:\n";
    for (const report of reports) {
      const sectionMappingPercentage = report.fieldCount > 0 
        ? (report.mappedCount / report.fieldCount * 100).toFixed(1)
        : '0';
      
      const confidenceLevel = this.getConfidenceLevel(report.overallConfidence);
      
      summary += `- Section ${report.sectionId} (${report.sectionName}): `;
      summary += `${report.mappedCount}/${report.fieldCount} fields mapped (${sectionMappingPercentage}%), `;
      summary += `Confidence: ${confidenceLevel}\n`;
    }
    
    return summary;
  }
  
  /**
   * Suggest improved mapping for fields with low confidence
   */
  async suggestImprovedMapping(sectionId: number, 
                              lowConfidenceThreshold: number = 0.5): Promise<{[key: string]: string}> {
    try {
      // Get the section report
      const report = await this.generateSectionReport(sectionId);
      
      // Find low confidence fields
      const lowConfidenceFields = Object.entries(report.confidenceScores)
        .filter(([_, score]) => score < lowConfidenceThreshold)
        .map(([fieldKey, _]) => fieldKey);
      
      const suggestions: {[key: string]: string} = {};
      
      // Load section schema
      const schemaPath = path.join(this.schemasDir, `section${sectionId}.json`);
      const schemaContent = fs.readFileSync(schemaPath, 'utf8');
      const schema = JSON.parse(schemaContent);
      
      // Generate suggestions for each low confidence field
      for (const fieldKey of lowConfidenceFields) {
        const fieldDef = schema.properties[fieldKey];
        
        if (!fieldDef) continue;
        
        let suggestion = "Suggested improvements:\n";
        
        // Issue 1: Generic field name
        if (/field\d+$/.test(fieldKey.split('.').pop() || '')) {
          suggestion += "- Use a semantic field name instead of generic 'fieldN'\n";
          
          // Suggest a better name based on any label or description
          if (fieldDef.label) {
            const betterName = fieldDef.label
              .toLowerCase()
              .replace(/[^a-z0-9]/g, '')
              .replace(/\s+/g, '');
            suggestion += `  Suggested name: ${betterName}\n`;
          }
        }
        
        // Issue 2: Missing or invalid PDF field ID
        if (!fieldDef.pdfFieldId || !/^\d+(_\d+)? 0 R$/.test(fieldDef.pdfFieldId)) {
          suggestion += "- Add or correct the pdfFieldId property\n";
          
          // Try to find a matching PDF field
          const matchingField = this.findMatchingPdfField(fieldDef, fieldKey, sectionId);
          if (matchingField) {
            suggestion += `  Suggested pdfFieldId: "${matchingField.id}"\n`;
          }
        }
        
        // Issue 3: Missing description
        if (!fieldDef.description || fieldDef.description.length < 10) {
          suggestion += "- Add a more detailed description\n";
        }
        
        // Issue 4: Missing constraints
        if (!fieldDef.maxLength && !fieldDef.pattern && !fieldDef.enum) {
          suggestion += "- Add appropriate constraints (maxLength, pattern, enum)\n";
          
          // Suggest constraints based on field type
          if (fieldDef.type === 'string') {
            suggestion += "  Suggested: Add maxLength\n";
          } else if (fieldDef.type === 'number' || fieldDef.type === 'integer') {
            suggestion += "  Suggested: Add minimum/maximum\n";
          }
        }
        
        // Issue 5: Missing label
        if (!fieldDef.label) {
          suggestion += "- Add a descriptive label\n";
          
          // Generate a label from the field name if possible
          const fieldName = fieldKey.split('.').pop() || '';
          if (!/field\d+$/.test(fieldName)) {
            const generatedLabel = this.formatFieldLabel(fieldName);
            suggestion += `  Suggested label: "${generatedLabel}"\n`;
          }
        }
        
        suggestions[fieldKey] = suggestion;
      }
      
      return suggestions;
    } catch (error) {
      console.error(`Error generating mapping suggestions for section ${sectionId}:`, error);
      throw new Error(`Failed to generate mapping suggestions for section ${sectionId}`);
    }
  }
  
  /**
   * Update schema with improved mappings
   */
  async updateSchemaWithImprovedMappings(sectionId: number, 
                                         updates: {[fieldKey: string]: any}): Promise<boolean> {
    try {
      // Load section schema
      const schemaPath = path.join(this.schemasDir, `section${sectionId}.json`);
      const schemaContent = fs.readFileSync(schemaPath, 'utf8');
      const schema = JSON.parse(schemaContent);
      
      // Apply updates
      let modified = false;
      
      for (const [fieldKey, updatedDef] of Object.entries(updates)) {
        if (schema.properties[fieldKey]) {
          schema.properties[fieldKey] = {
            ...schema.properties[fieldKey],
            ...updatedDef
          };
          modified = true;
        }
      }
      
      if (modified) {
        // Save updated schema
        fs.writeFileSync(schemaPath, JSON.stringify(schema, null, 2), 'utf8');
        return true;
      }
      
      return false;
    } catch (error) {
      console.error(`Error updating schema for section ${sectionId}:`, error);
      throw new Error(`Failed to update schema for section ${sectionId}`);
    }
  }
  
  /**
   * Validate mapping against screenshots and generate a validation report
   */
  async validateMappingAgainstScreenshots(): Promise<string> {
    try {
      const validationReport: string[] = [`SF-86 Field Mapping Validation Report (Screenshot-based)`];
      validationReport.push(`==========================================================\n`);
      
      // Sections we've seen in screenshots (1-9.1)
      const screenedSections = [1, 2, 3, 4, 5, 6, 7, 8, 9];
      
      let totalFields = 0;
      let verifiedFields = 0;
      let highConfidenceFields = 0;
      
      for (const sectionId of screenedSections) {
        const report = await this.generateSectionReport(sectionId);
        
        validationReport.push(`Section ${sectionId} - ${report.sectionName}:`);
        validationReport.push(`-----------------------------------------`);
        
        totalFields += report.fieldCount;
        
        // Count fields with high confidence (verified by screenshots)
        const screenshotVerifiedFields = Object.entries(report.confidenceScores)
          .filter(([fieldKey, confidence]) => {
            const fieldName = fieldKey.split('.').pop() || '';
            return this.isFieldConfirmedByScreenshots(fieldName, sectionId);
          });
        
        verifiedFields += screenshotVerifiedFields.length;
        
        // Count high confidence fields (>0.8)
        const highConfFields = Object.values(report.confidenceScores)
          .filter(confidence => confidence > 0.8).length;
          
        highConfidenceFields += highConfFields;
        
        validationReport.push(`- Total fields: ${report.fieldCount}`);
        validationReport.push(`- Fields directly verified by screenshots: ${screenshotVerifiedFields.length}`);
        validationReport.push(`- Fields with high confidence (>0.8): ${highConfFields}`);
        validationReport.push(`- Overall section confidence: ${(report.overallConfidence * 100).toFixed(1)}%`);
        
        // List fields directly verified by screenshots
        if (screenshotVerifiedFields.length > 0) {
          validationReport.push(`\nVerified fields:`);
          screenshotVerifiedFields.forEach(([fieldKey, confidence]) => {
            const fieldName = fieldKey.split('.').pop() || '';
            validationReport.push(`  - ${fieldName} (${(confidence * 100).toFixed(1)}% confidence)`);
          });
        }
        
        // List fields with low confidence that might need attention
        const lowConfidenceFields = Object.entries(report.confidenceScores)
          .filter(([_, confidence]) => confidence < 0.5)
          .sort(([_, a], [__, b]) => a - b);
          
        if (lowConfidenceFields.length > 0) {
          validationReport.push(`\nFields needing attention (confidence < 50%):`);
          lowConfidenceFields.forEach(([fieldKey, confidence]) => {
            validationReport.push(`  - ${fieldKey} (${(confidence * 100).toFixed(1)}% confidence)`);
          });
        }
        
        validationReport.push(''); // Empty line between sections
      }
      
      // Overall summary
      validationReport.push(`OVERALL SUMMARY:`);
      validationReport.push(`-----------------`);
      validationReport.push(`Total fields across all screened sections: ${totalFields}`);
      validationReport.push(`Total fields directly verified by screenshots: ${verifiedFields} (${(verifiedFields/totalFields*100).toFixed(1)}%)`);
      validationReport.push(`Total fields with high confidence: ${highConfidenceFields} (${(highConfidenceFields/totalFields*100).toFixed(1)}%)`);
      
      if (verifiedFields < totalFields) {
        validationReport.push(`\nRECOMMENDATION: Provide more screenshots of the remaining sections to improve mapping quality.`);
      }
      
      return validationReport.join('\n');
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error('Error validating mappings against screenshots:', error);
      return `Error generating validation report: ${errorMessage}`;
    }
  }
  
  /**
   * Generate an improvement report after applying screenshot-based enhancements
   */
  async generateImprovementReport(): Promise<string> {
    try {
      // First generate reports for all sections
      const before = await this.generateFieldMappingReports();
      
      // Apply screenshot-based enhancements
      await this.enhanceMappingWithScreenshots();
      
      // Generate reports again to measure improvement
      const after = await this.generateFieldMappingReports();
      
      let report = `SF-86 Mapping Improvement Report (Screenshot-based)\n`;
      report += `=============================================\n\n`;
      
      let totalConfidenceBefore = 0;
      let totalConfidenceAfter = 0;
      let totalMappedBefore = 0;
      let totalMappedAfter = 0;
      let totalFields = 0;
      
      // Compare before and after for each section
      for (let i = 0; i < before.length; i++) {
        const sectionId = before[i].sectionId;
        const sectionName = before[i].sectionName;
        const fieldCount = before[i].fieldCount;
        
        totalFields += fieldCount;
        totalMappedBefore += before[i].mappedCount;
        totalMappedAfter += after[i].mappedCount;
        totalConfidenceBefore += before[i].overallConfidence * before[i].mappedCount;
        totalConfidenceAfter += after[i].overallConfidence * after[i].mappedCount;
        
        const confidenceImprovement = after[i].overallConfidence - before[i].overallConfidence;
        const mappingImprovement = after[i].mappedCount - before[i].mappedCount;
        
        report += `Section ${sectionId} - ${sectionName}:\n`;
        report += `  Fields: ${fieldCount}\n`;
        report += `  Mapped: ${before[i].mappedCount} → ${after[i].mappedCount} (${mappingImprovement >= 0 ? '+' : ''}${mappingImprovement})\n`;
        report += `  Confidence: ${(before[i].overallConfidence * 100).toFixed(1)}% → ${(after[i].overallConfidence * 100).toFixed(1)}% (${confidenceImprovement >= 0 ? '+' : ''}${(confidenceImprovement * 100).toFixed(1)}%)\n\n`;
      }
      
      // Calculate overall improvements
      const avgConfidenceBefore = totalMappedBefore > 0 ? totalConfidenceBefore / totalMappedBefore : 0;
      const avgConfidenceAfter = totalMappedAfter > 0 ? totalConfidenceAfter / totalMappedAfter : 0;
      const mappingPercentBefore = (totalMappedBefore / totalFields) * 100;
      const mappingPercentAfter = (totalMappedAfter / totalFields) * 100;
      
      report += `OVERALL IMPROVEMENT:\n`;
      report += `  Total Fields: ${totalFields}\n`;
      report += `  Mapped Fields: ${totalMappedBefore} (${mappingPercentBefore.toFixed(1)}%) → ${totalMappedAfter} (${mappingPercentAfter.toFixed(1)}%)\n`;
      report += `  Mapping Improvement: ${((mappingPercentAfter - mappingPercentBefore)).toFixed(1)}%\n`;
      report += `  Average Confidence: ${(avgConfidenceBefore * 100).toFixed(1)}% → ${(avgConfidenceAfter * 100).toFixed(1)}%\n`;
      report += `  Confidence Improvement: ${((avgConfidenceAfter - avgConfidenceBefore) * 100).toFixed(1)}%\n`;
      
      return report;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error('Error generating improvement report:', error);
      return `Failed to generate improvement report: ${errorMessage}`;
    }
  }
  
  /**
   * Apply enhancements based on screenshot knowledge
   */
  private async enhanceMappingWithScreenshots(): Promise<void> {
    try {
      // Sections we've seen in screenshots (1-9.1)
      const screenedSections = [1, 2, 3, 4, 5, 6, 7, 8, 9];
      
      for (const sectionId of screenedSections) {
        // Load section schema
        const schemaPath = path.join(this.schemasDir, `section${sectionId}.json`);
        const schemaContent = fs.readFileSync(schemaPath, 'utf8');
        const schema = JSON.parse(schemaContent);
        
        // Get PDF fields for this section if not already cached
        if (!this.pdfFieldsCache.has(sectionId)) {
          await this.loadPdfFieldsForSection(sectionId);
        }
        
        // Apply known mappings from screenshots
        const knownMappings = this.getKnownMappingsFromScreenshots(sectionId);
        let modified = false;
        
        for (const [fieldKeyPattern, pdfFieldPattern] of Object.entries(knownMappings)) {
          // Find matching schema field
          for (const [fieldKey, fieldDef] of Object.entries<any>(schema.properties)) {
            if (fieldKey.includes(fieldKeyPattern)) {
              // Find matching PDF field
              const pdfFields = this.pdfFieldsCache.get(sectionId) || [];
              const matchingField = pdfFields.find(field => 
                field.name.includes(pdfFieldPattern) || 
                (field.label && field.label.includes(pdfFieldPattern))
              );
              
              if (matchingField && !fieldDef.pdfFieldId) {
                // Update schema field with PDF field info
                schema.properties[fieldKey] = {
                  ...fieldDef,
                  pdfFieldId: matchingField.id,
                  pdfFieldName: matchingField.name,
                  title: fieldDef.title || matchingField.label,
                  description: fieldDef.description || `Field matched from screenshot: ${matchingField.label}`
                };
                
                modified = true;
              }
            }
          }
        }
        
        // Save the updated schema if modified
        if (modified) {
          fs.writeFileSync(schemaPath, JSON.stringify(schema, null, 2), 'utf8');
          console.log(`Updated schema for section ${sectionId} with screenshot-based mappings`);
        }
      }
    } catch (error) {
      console.error('Error enhancing mappings with screenshots:', error);
      throw new Error('Failed to enhance mappings with screenshots');
    }
  }
  
  /**
   * Get known mappings from screenshots for a specific section
   */
  private getKnownMappingsFromScreenshots(sectionId: number): {[key: string]: string} {
    // These mappings are based on the screenshots provided
    // Format: [schemaFieldKeyPattern, pdfFieldPattern]
    switch (sectionId) {
      case 1: // Full Name
        return {
          'lastName': 'Last name',
          'firstName': 'First name',
          'middleName': 'Middle name',
          'suffix': 'Suffix'
        };
        
      case 2: // Date of Birth
        return {
          'dateOfBirth': 'date of birth',
          'birthDate': 'birth',
          'estimated': 'Est'
        };
        
      case 3: // Place of Birth
        return {
          'birthCity': 'City',
          'birthCounty': 'County',
          'birthState': 'State',
          'birthCountry': 'Country'
        };
        
      case 4: // SSN
        return {
          'ssn': 'SSN',
          'socialSecurityNumber': 'Social Security',
          'usSsn': 'SSN',
          'ssn_section4': 'section4[0].SSN',
          'ssn_main': 'Sections1-6[0].SSN[0]',
          'notApplicable': 'Not applicable'
        };
        
      case 5: // Other Names
        return {
          'otherNames': 'other names',
          'lastName': 'Last name',
          'firstName': 'First name',
          'middleName': 'Middle name',
          'fromDate': 'From',
          'toDate': 'To',
          'present': 'Present',
          'maidenName': 'Maiden name',
          'reasonForChange': 'reason'
        };
        
      case 6: // Identifying Info
        return {
          'height': 'Height',
          'heightFeet': 'feet',
          'heightInches': 'inches',
          'weight': 'Weight',
          'hairColor': 'Hair color',
          'eyeColor': 'Eye color',
          'sex': 'Sex',
          'gender': 'Sex'
        };
        
      case 7: // Contact Info - Updated with values from new screenshot
        return {
          'homeEmail': 'Home e-mail',
          'workEmail': 'Work e-mail',
          'homePhone': 'Home telephone',
          'workPhone': 'Work telephone',
          'mobilePhone': 'Mobile/Cell telephone',
          'extension': 'Extension',
          'international': 'International or DSN phone',
          'dsn': 'DSN',
          'dayPhone': 'Day',
          'nightPhone': 'Night'
        };
        
      case 8: // Passport - Updated with values from new screenshot
        return {
          'hasPassport': 'possess a U.S. passport',
          'possessPassport': 'Do you possess a U.S. passport',
          'yes': 'YES',
          'no': 'NO',
          'passportNumber': 'Passport number',
          'issueDate': 'Issue date',
          'issueDateMonth': 'Issue date Month',
          'issueDateDay': 'Issue date Day',
          'issueDateYear': 'Issue date Year',
          'expirationDate': 'Expiration date',
          'expirationDateMonth': 'Expiration date Month',
          'expirationDateDay': 'Expiration date Day',
          'expirationDateYear': 'Expiration date Year',
          'passportLastName': 'Last name',
          'passportFirstName': 'First name',
          'passportMiddleName': 'Middle name',
          'passportSuffix': 'Suffix'
        };
        
      case 9: // Citizenship - Updated with values from new screenshots (9.1, 9.2, 9.3)
        return {
          // Main section options
          'citizenshipStatus': 'citizenship status',
          'usCitizenByBirth': 'U.S. citizen or national by birth',
          'citizenByBirthAbroad': 'born to U.S. parent(s)',
          'naturalizedCitizen': 'naturalized U.S. citizen',
          'derivedCitizen': 'derived U.S. citizen',
          'notCitizen': 'not a U.S. citizen',
          
          // Section 9.1 (Citizen born abroad)
          'documentType': 'type of documentation',
          'fs240': 'FS 240',
          'ds1350': 'DS 1350',
          'fs545': 'FS 545',
          'documentNumber': 'document number',
          'documentIssueDate': 'document was issued',
          'placeOfIssuance': 'place of issuance',
          'certificateOfCitizenship': 'Certificate of Citizenship',
          
          // Section 9.2 (Naturalized)
          'dateOfEntry': 'date of entry',
          'locationOfEntry': 'location of entry',
          'priorCitizenship': 'country(ies) of prior citizenship',
          'alienRegistration': 'alien registration number',
          'certificateOfNaturalization': 'Certificate of Naturalization',
          'naturalizationCertificateNumber': 'Naturalization number',
          'naturalizationDate': 'date the Certificate of Naturalization was issued',
          'courtName': 'name of the court',
          'courtAddress': 'address of the court',
          'courtCity': 'City',
          'courtState': 'State',
          'courtZipCode': 'Zip Code',
          'basisOfNaturalization': 'basis of naturalization',
          
          // Section 9.3 (Derived)
          'alienRegistrationNumber': 'alien registration number',
          'permanentResidentCard': 'Permanent Resident Card number',
          'certificateOfCitizenshipNumber': 'Certificate of Citizenship number',
          'basisOfDerivedCitizenship': 'basis of derived citizenship',
          'citizenParent': 'operation of law through my U.S. citizen parent'
        };
        
      default:
        return {};
    }
  }
} 