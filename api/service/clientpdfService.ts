import {
  PDFCheckBox,
  PDFDocument,
  PDFDropdown,
  PDFName,
  PDFRadioGroup,
  PDFString,
  PDFTextField
} from 'pdf-lib';
import type { ApplicantFormValues } from '../interfaces/formDefinition';
import { updateIdFormat } from '../../app/utils/formHandler';
import { mapContextToPdfFields } from '../../app/utils/contextToPdfFieldMapping';
import type { FieldHierarchy } from '../interfaces/FieldMetadata';

// URLs for fetching the SF86 PDF
const SF86_PDF_URL = 'https://www.opm.gov/forms/pdf_fill/sf86.pdf';
// Add a CORS proxy option
const SF86_PDF_PROXY_URL = `/api/pdf-proxy?url=${encodeURIComponent(SF86_PDF_URL)}`;

// Interface for field metadata
interface FieldMetadata {
  name: string;
  id: string;
  type: string;
  label?: string;
  value?: any;
}

export class ClientPdfService {
  private pdfDoc: PDFDocument | null = null;
  private fieldMapping: FieldMetadata[] = [];
  private fieldHierarchy: FieldHierarchy | null = null;

  /**
   * Fetch and load the SF86 PDF document
   */
  async loadPdf(): Promise<PDFDocument> {
    if (this.pdfDoc) return this.pdfDoc;
    
    try {
      // Try proxy URL first as direct is likely to fail due to CORS
      try {
        console.log("Attempting to fetch PDF via proxy...");
        const proxyResponse = await fetch(SF86_PDF_PROXY_URL);
        if (proxyResponse.ok) {
          const pdfBytes = await proxyResponse.arrayBuffer();
          this.pdfDoc = await PDFDocument.load(pdfBytes);
          await this.mapFormFields();
          return this.pdfDoc;
        }
      } catch (proxyError) {
        console.warn("Proxy PDF fetch failed", proxyError);
      }
      
      // Try direct URL as a fallback (unlikely to work due to CORS)
      try {
        console.log("Attempting to fetch PDF directly...");
        const response = await fetch(SF86_PDF_URL);
        if (response.ok) {
          const pdfBytes = await response.arrayBuffer();
          this.pdfDoc = await PDFDocument.load(pdfBytes);
          await this.mapFormFields();
          return this.pdfDoc;
        }
      } catch (directError) {
        console.warn("Direct PDF fetch failed", directError);
      }
      
      // If both methods fail
      throw new Error(
        "Unable to load SF86 PDF. Please upload a SF86 PDF file instead."
      );
    } catch (error) {
      console.error("Error loading PDF:", error);
      throw error;
    }
  }

  /**
   * Load PDF from an ArrayBuffer (for user-uploaded files)
   */
  async loadPdfFromBuffer(pdfBuffer: ArrayBuffer): Promise<PDFDocument> {
    try {
      console.log("Loading PDF from uploaded file...");
      this.pdfDoc = await PDFDocument.load(pdfBuffer);
      
      // Map fields immediately after loading
      await this.mapFormFields();
      
      return this.pdfDoc;
    } catch (error) {
      console.error("Error loading PDF from buffer:", error);
      throw error;
    }
  }

  /**
   * Map all fields in the PDF document - using the same structure as server-side
   */
  private async mapFormFields(): Promise<FieldMetadata[]> {
    if (!this.pdfDoc) throw new Error("PDF document not loaded");
    
    const form = this.pdfDoc.getForm();
    const fields = form.getFields();
    
    this.fieldMapping = fields.map((field) => {
      const name = field.getName();
      const type = field.constructor.name;
      const id = field.ref.tag.toString(); // Important: get the ID as in the server-side impl
      
      let value: any = undefined;
      if (field instanceof PDFTextField) {
        value = field.getText();
      } else if (field instanceof PDFDropdown) {
        value = field.getSelected();
      } else if (field instanceof PDFCheckBox) {
        value = field.isChecked() ? "Yes" : "No";
      } else if (field instanceof PDFRadioGroup) {
        value = field.getSelected();
      }

      let label: string | undefined = undefined;
      // Extract the label from TU field as in server-side impl
      const dict = field.acroField.dict;
      const tuRaw = dict.get(PDFName.of("TU"));
      if (tuRaw instanceof PDFString) {
          label = tuRaw.decodeText();
      }
      
      return {
        name,
        id,
        type,
        value,
        label
      };
    });
    
    return this.fieldMapping;
  }

  /**
   * Set the field hierarchy for mapping
   * This should be called before generateFilledPdf if using the context mapping approach
   */
  setFieldHierarchy(hierarchy: FieldHierarchy): void {
    this.fieldHierarchy = hierarchy;
    console.log("Field hierarchy set for PDF generation");
  }

  /**
   * Map form values to JSON data - align with server-side implementation
   */
  private async mapFormValuesToJsonData(
    fieldMapping: FieldMetadata[],
    formData: ApplicantFormValues
  ): Promise<FieldMetadata[]> {
    // If we have a field hierarchy, use the context-to-PDF mapping utility
    if (this.fieldHierarchy) {
      try {
        console.log("Using contextToPdfFieldMapping utility to map form values");
        const pdfFieldValues = mapContextToPdfFields(formData, this.fieldHierarchy);
        console.log(`Generated ${Object.keys(pdfFieldValues).length} PDF field mappings`);
        
        // Create a deep copy of the field mapping
        const mappedFields: FieldMetadata[] = fieldMapping.map(field => ({...field}));
        
        // Map the values from pdfFieldValues to our field metadata
        let mappedCount = 0;
        mappedFields.forEach((item) => {
          const fieldId = item.id + " 0 R"; // Ensure consistent format
          if (pdfFieldValues[fieldId] !== undefined) {
            item.value = pdfFieldValues[fieldId];
            mappedCount++;
          }
        });
        
        console.log(`Successfully mapped ${mappedCount} values to PDF fields using context mapping`);
        return mappedFields;
      } catch (error) {
        console.error("Error using contextToPdfFieldMapping - falling back to legacy mapping:", error);
        // Fall back to legacy mapping
      }
    }
    
    // Legacy implementation as fallback
    console.log("Using legacy mapping approach");
    
    // Create ID to value map similar to server-side
    const idValueMap = new Map<string, any>();
  
    const flattenFormValues = (data: any, prefix = '') => {
      if (!data || typeof data !== 'object') return;
      
      Object.entries(data).forEach(([key, val]) => {
        const path = prefix ? `${prefix}.${key}` : key;
        
        if (val && typeof val === "object") {
          // Type guard to check for expected structure
          if ('id' in val && 'value' in val && val.id && val.value !== undefined && val.value !== '') {
            // Ensure ID has the correct PDF format with "0 R" suffix
            const idStr = updateIdFormat(String(val.id), 'pdf');
            const valueStr = val.value; // Don't convert to string to preserve arrays
            console.log(`Mapping field ${path}: ID=${idStr}, value=${typeof valueStr === 'object' ? JSON.stringify(valueStr) : valueStr}`);
            idValueMap.set(idStr, valueStr);
          } else {
            flattenFormValues(val, path);
          }
        }
      });
    };
  
    console.log("Starting form value mapping with form data:", Object.keys(formData));
    flattenFormValues(formData);
    console.log(`Found ${idValueMap.size} form values to map`);
  
    // Create a deep copy of the field mapping
    const mappedFields: FieldMetadata[] = fieldMapping.map(field => ({...field}));
    
    let mappedCount = 0;
    mappedFields.forEach((item) => {
      if (idValueMap.has(item.id)) {
        item.value = idValueMap.get(item.id);
        mappedCount++;
      }
    });
    
    console.log(`Successfully mapped ${mappedCount} values to PDF fields`);
    return mappedFields;
  }

  /**
   * Generate a filled PDF from form values
   */
  async generateFilledPdf(formData: ApplicantFormValues): Promise<Uint8Array> {
    try {
      console.log("Starting client-side PDF generation");
      
      // Make sure PDF is loaded
      if (!this.pdfDoc) {
        await this.loadPdf();
      }
      
      if (!this.pdfDoc) throw new Error("Failed to load PDF document");
      


      
      // Map form values to PDF fields
      const finalForm = await this.mapFormValuesToJsonData(this.fieldMapping, formData);
      
      const appliedFields = finalForm.filter(field => {
        // Skip fields with no value
        if (!field.value) return false;
        
        // Skip empty arrays
        if (Array.isArray(field.value) && field.value.length === 0) return false;
        
        // Skip "No", "NO", or empty string values
        if (field.value === "No" || field.value === "NO" || field.value === "") return false;
        
        // Include all other values
        return true;
      });
      
      console.log(`Applying ${appliedFields.length} fields to PDF`);
      
      // Log a sample of fields being applied
      if (appliedFields.length > 0) {
        console.log("Sample of fields being applied:", 
          appliedFields.slice(0, 5).map(f => ({name: f.name, value: f.value}))
        );
      }
      
      // Get the form and create a field map for faster lookups
      const form = this.pdfDoc.getForm();
      const fieldMap = new Map(form.getFields().map((f) => [f.getName(), f]));
      
      // Apply values to fields
      let appliedCount = 0;
      
      // Apply each value with proper type checking
      appliedFields.forEach(field => {
        if (fieldMap.has(field.name)) {
          const pdfField = fieldMap.get(field.name);
          
          try {
            if (pdfField instanceof PDFTextField) {
              pdfField.setText(String(field.value));
              appliedCount++;
            } else if (pdfField instanceof PDFDropdown || pdfField instanceof PDFRadioGroup) {
              pdfField.select(String(field.value));
              appliedCount++;
            } else if (pdfField instanceof PDFCheckBox) {
              const strValue = String(field.value).toLowerCase();
              if (strValue === "yes") {
                pdfField.check();
              } else {
                pdfField.uncheck();
              }
              appliedCount++;
            }
          } catch (error) {
            console.error(`Error setting field ${field.name}:`, error);
          }
        }
      });
      
      console.log(`Successfully applied ${appliedCount} values to the PDF`);
      
      // Save the PDF
      const modifiedPdfBytes = await this.pdfDoc.save();
      return new Uint8Array(modifiedPdfBytes);
    } catch (error) {
      console.error("Error generating PDF:", error);
      throw error;
    }
  }

  /**
   * Download the generated PDF
   */
  downloadPdf(pdfBytes: Uint8Array, filename = 'SF86-filled.pdf'): void {
    const blob = new Blob([pdfBytes], { type: 'application/pdf' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
    URL.revokeObjectURL(link.href);
  }
}

// Create and export a singleton instance
export const clientPdfService = new ClientPdfService(); 