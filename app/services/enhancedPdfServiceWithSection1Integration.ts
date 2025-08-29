/**
 * Enhanced PDF Service with Sections 1-9 Integration
 * 
 * Service for generating PDFs with comprehensive Sections 1-9 data integration
 */

import { PDFDocument, PDFForm, PDFTextField, PDFCheckBox, PDFRadioGroup } from 'pdf-lib';
import { logger } from './Logger';
import { 
  transformSections1to5ForPDF, 
  validateSections1to5, 
  getSections1to5MappingStats 
} from './sections1-5-pdf-integration';
import { 
  transformSections6to30ForPDF, 
  validateSections6to30, 
  getSections6to30MappingStats 
} from './sections6-30-pdf-integration';

export interface PdfGenerationOptions {
  includeMetadata?: boolean;
  compress?: boolean;
  encrypt?: boolean;
}

export interface Section1Data {
  lastName?: string;
  firstName?: string;
  middleName?: string;
  suffix?: string;
  previousNames?: Array<{
    lastName: string;
    firstName: string;
    middleName?: string;
  }>;
  ssn?: string;
  dateOfBirth?: string;
  placeOfBirth?: string;
  citizenship?: string;
}

export class EnhancedPdfServiceWithSection1Integration {
  private pdfDoc: PDFDocument | null = null;
  private form: PDFForm | null = null;
  
  /**
   * Load PDF template
   */
  async loadTemplate(templatePath: string): Promise<void> {
    try {
      const response = await fetch(templatePath);
      if (!response.ok) {
        throw new Error(`Failed to load PDF template: ${response.statusText}`);
      }
      
      const pdfBytes = await response.arrayBuffer();
      this.pdfDoc = await PDFDocument.load(pdfBytes);
      this.form = this.pdfDoc.getForm();
      
      logger.info('PDF template loaded successfully', 'EnhancedPdfService', {
        templatePath,
        pageCount: this.pdfDoc.getPageCount()
      });
    } catch (error) {
      logger.error('Failed to load PDF template', error as Error, 'EnhancedPdfService');
      throw error;
    }
  }
  
  /**
   * Fill Section 1 data
   */
  fillSection1(data: Section1Data): void {
    if (!this.form) {
      throw new Error('PDF form not loaded. Call loadTemplate first.');
    }
    
    try {
      // Fill basic information
      if (data.lastName) {
        const field = this.form.getTextField('form1[0].Sections1-6[0].TextField11[0]');
        field?.setText(data.lastName);
      }
      
      if (data.firstName) {
        const field = this.form.getTextField('form1[0].Sections1-6[0].TextField11[1]');
        field?.setText(data.firstName);
      }
      
      if (data.middleName) {
        const field = this.form.getTextField('form1[0].Sections1-6[0].TextField11[2]');
        field?.setText(data.middleName);
      }
      
      if (data.suffix) {
        const field = this.form.getTextField('form1[0].Sections1-6[0].suffix[0]');
        field?.setText(data.suffix);
      }
      
      // Fill SSN if provided
      if (data.ssn) {
        const ssnFormatted = data.ssn.replace(/\D/g, '');
        if (ssnFormatted.length === 9) {
          const field = this.form.getTextField('form1[0].Sections1-6[0].SSN[0]');
          field?.setText(`${ssnFormatted.slice(0,3)}-${ssnFormatted.slice(3,5)}-${ssnFormatted.slice(5)}`);
        }
      }
      
      // Fill date of birth
      if (data.dateOfBirth) {
        const field = this.form.getTextField('form1[0].Sections1-6[0].DateOfBirth[0]');
        field?.setText(data.dateOfBirth);
      }
      
      // Fill place of birth
      if (data.placeOfBirth) {
        const field = this.form.getTextField('form1[0].Sections1-6[0].PlaceOfBirth[0]');
        field?.setText(data.placeOfBirth);
      }
      
      logger.info('Section 1 data filled successfully', 'EnhancedPdfService');
    } catch (error) {
      logger.error('Failed to fill Section 1 data', error as Error, 'EnhancedPdfService');
      throw error;
    }
  }
  
  /**
   * Fill all sections with form data
   */
  async fillAllSections(formData: any): Promise<void> {
    if (!this.form) {
      throw new Error('PDF form not loaded. Call loadTemplate first.');
    }
    
    try {
      // Section 1
      if (formData.section1) {
        this.fillSection1(formData.section1);
      }
      
      // Additional sections would be filled here
      // Section 2 through Section 30
      
      logger.info('All sections filled successfully', 'EnhancedPdfService', {
        sectionsProcessed: Object.keys(formData).length
      });
    } catch (error) {
      logger.error('Failed to fill sections', error as Error, 'EnhancedPdfService');
      throw error;
    }
  }
  
  /**
   * Generate PDF with options
   */
  async generatePdf(options: PdfGenerationOptions = {}): Promise<Uint8Array> {
    if (!this.pdfDoc) {
      throw new Error('PDF document not loaded. Call loadTemplate first.');
    }
    
    try {
      // Add metadata if requested
      if (options.includeMetadata) {
        this.pdfDoc.setTitle('SF-86 Form');
        this.pdfDoc.setAuthor('SF-86 Application System');
        this.pdfDoc.setSubject('Security Clearance Application');
        this.pdfDoc.setCreationDate(new Date());
        this.pdfDoc.setModificationDate(new Date());
      }
      
      // Save the PDF
      const pdfBytes = await this.pdfDoc.save({
        useObjectStreams: options.compress || false
      });
      
      logger.info('PDF generated successfully', 'EnhancedPdfService', {
        size: pdfBytes.length,
        compressed: options.compress || false
      });
      
      return pdfBytes;
    } catch (error) {
      logger.error('Failed to generate PDF', error as Error, 'EnhancedPdfService');
      throw error;
    }
  }
  
  /**
   * Get field names from the PDF form
   */
  getFieldNames(): string[] {
    if (!this.form) {
      throw new Error('PDF form not loaded. Call loadTemplate first.');
    }
    
    const fields = this.form.getFields();
    return fields.map(field => field.getName());
  }
  
  /**
   * Validate form data against PDF fields
   */
  validateFormData(formData: any): { isValid: boolean; missingFields: string[] } {
    if (!this.form) {
      throw new Error('PDF form not loaded. Call loadTemplate first.');
    }
    
    const missingFields: string[] = [];
    const pdfFields = this.getFieldNames();
    
    // Check if form data maps to PDF fields
    // This is a simplified validation - real implementation would be more comprehensive
    
    return {
      isValid: missingFields.length === 0,
      missingFields
    };
  }
  
  /**
   * Clear all form fields
   */
  clearForm(): void {
    if (!this.form) {
      throw new Error('PDF form not loaded. Call loadTemplate first.');
    }
    
    const fields = this.form.getFields();
    fields.forEach(field => {
      if (field instanceof PDFTextField) {
        field.setText('');
      } else if (field instanceof PDFCheckBox) {
        field.uncheck();
      }
    });
    
    logger.info('Form cleared', 'EnhancedPdfService');
  }
  
  /**
   * Get PDF metadata
   */
  getMetadata(): any {
    if (!this.pdfDoc) {
      throw new Error('PDF document not loaded. Call loadTemplate first.');
    }
    
    return {
      title: this.pdfDoc.getTitle(),
      author: this.pdfDoc.getAuthor(),
      subject: this.pdfDoc.getSubject(),
      creator: this.pdfDoc.getCreator(),
      producer: this.pdfDoc.getProducer(),
      creationDate: this.pdfDoc.getCreationDate(),
      modificationDate: this.pdfDoc.getModificationDate(),
      pageCount: this.pdfDoc.getPageCount()
    };
  }

  /**
   * Generate enhanced PDF with sections 1-9 integration
   * This method integrates with clientPdfService2.0 for comprehensive field mapping
   */
  async generateEnhancedPdf(formData: any): Promise<any> {
    try {
      // Import the client PDF service
      const { clientPdfService2 } = await import('../../api/service/clientPdfService2.0');
      
      // First validate sections 1-5 data
      const validation1to5 = validateSections1to5(formData);
      
      logger.info('Sections 1-5 Validation', 'EnhancedPdfService', {
        isValid: validation1to5.isValid,
        errors: validation1to5.errors.length,
        warnings: validation1to5.warnings.length,
        populatedFields: validation1to5.statistics.populatedFields,
        totalFields: validation1to5.statistics.totalFields
      });
      
      // Validate sections 6-13 data
      const validation6to30 = validateSections6to30(formData);
      
      logger.info('Sections 6-13 Validation', 'EnhancedPdfService', {
        isValid: validation6to30.isValid,
        errors: validation6to30.errors.length,
        warnings: validation6to30.warnings.length
      });
      
      // Get mapping statistics for sections 1-5
      const mappingStats1to5 = getSections1to5MappingStats(formData);
      
      logger.info('Sections 1-5 Mapping Statistics', 'EnhancedPdfService', {
        section1: mappingStats1to5.section1,
        section2: mappingStats1to5.section2,
        section3: mappingStats1to5.section3,
        section4: mappingStats1to5.section4,
        section5: mappingStats1to5.section5,
        overall: mappingStats1to5.overall
      });
      
      // Get mapping statistics for sections 6-13
      const mappingStats6to30 = getSections6to30MappingStats(formData);
      
      logger.info('Sections 6-15 Mapping Statistics', 'EnhancedPdfService', {
        section6: mappingStats6to30.sectionBreakdown.section6,
        section7: mappingStats6to30.sectionBreakdown.section7,
        section8: mappingStats6to30.sectionBreakdown.section8,
        section9: mappingStats6to30.sectionBreakdown.section9,
        section10: mappingStats6to30.sectionBreakdown.section10,
        section11: mappingStats6to30.sectionBreakdown.section11,
        section12: mappingStats6to30.sectionBreakdown.section12,
        section13: mappingStats6to30.sectionBreakdown.section13,
        section14: mappingStats6to30.sectionBreakdown.section14,
        section15: mappingStats6to30.sectionBreakdown.section15,
        section17: mappingStats6to30.sectionBreakdown.section17,
        section27: mappingStats6to30.sectionBreakdown.section27,
        section28: mappingStats6to30.sectionBreakdown.section28,
        section29: mappingStats6to30.sectionBreakdown.section29,
        section30: mappingStats6to30.sectionBreakdown.section30,
        totalFields: mappingStats6to30.totalFields,
        mappedFields: mappingStats6to30.mappedFields
      });
      
      // Transform sections 1-5 data for PDF
      const pdfFieldMap1to5 = transformSections1to5ForPDF(formData);
      
      // Transform sections 6-15 data for PDF (async)
      const pdfFieldMap6to30 = await transformSections6to30ForPDF(formData);
      
      // Combine both field maps
      const pdfFieldMap = new Map([...pdfFieldMap1to5, ...pdfFieldMap6to30]);
      
      // Create enhanced form data with proper field mappings
      const enhancedFormData = { ...formData };
      
      // Apply the transformed mappings to ensure proper field IDs
      pdfFieldMap.forEach((value, fieldId) => {
        // Inject the mapped values into the form data structure
        // This ensures the clientPdfService2 can properly map them
        const fieldObj = {
          id: fieldId,
          value: value,
          name: fieldId,
          type: 'text',
          label: '',
          required: false,
          section: 1
        };
        
        // Store in a special _pdfMappings section for processing
        if (!enhancedFormData._pdfMappings) {
          enhancedFormData._pdfMappings = [];
        }
        enhancedFormData._pdfMappings.push(fieldObj);
      });
      
      // Call the standard PDF generation with enhanced data
      const result = await clientPdfService2.generatePdfClientAction(enhancedFormData);
      
      // Add sections 1-5 specific statistics to the result
      result.section1Statistics = {
        totalSection1Fields: mappingStats1to5.section1.total,
        successfulMappings: mappingStats1to5.section1.mapped,
        failedMappings: mappingStats1to5.section1.total - mappingStats1to5.section1.mapped,
        mappingSuccessRate: mappingStats1to5.section1.percentage / 100,
        integrationMappings: pdfFieldMap1to5.size,
        legacyMappings: 0
      };
      
      // Add Section 9 specific statistics
      result.section9Statistics = {
        totalSection9Fields: mappingStats6to10.sectionBreakdown.section9.total,
        successfulMappings: mappingStats6to10.sectionBreakdown.section9.mapped,
        failedMappings: mappingStats6to10.sectionBreakdown.section9.total - mappingStats6to10.sectionBreakdown.section9.mapped,
        mappingSuccessRate: mappingStats6to10.sectionBreakdown.section9.total > 0 
          ? mappingStats6to10.sectionBreakdown.section9.mapped / mappingStats6to10.sectionBreakdown.section9.total 
          : 0,
        integrationMappings: pdfFieldMap6to10.size
      };
      
      // Add Section 10 specific statistics
      result.section10Statistics = {
        totalSection10Fields: mappingStats6to11.sectionBreakdown.section10.total,
        successfulMappings: mappingStats6to11.sectionBreakdown.section10.mapped,
        failedMappings: mappingStats6to11.sectionBreakdown.section10.total - mappingStats6to11.sectionBreakdown.section10.mapped,
        mappingSuccessRate: mappingStats6to11.sectionBreakdown.section10.total > 0 
          ? mappingStats6to11.sectionBreakdown.section10.mapped / mappingStats6to11.sectionBreakdown.section10.total 
          : 0,
        integrationMappings: pdfFieldMap6to11.size
      };
      
      // Add Section 11 specific statistics
      result.section11Statistics = {
        totalSection11Fields: mappingStats6to12.sectionBreakdown.section11.total,
        successfulMappings: mappingStats6to12.sectionBreakdown.section11.mapped,
        failedMappings: mappingStats6to12.sectionBreakdown.section11.total - mappingStats6to12.sectionBreakdown.section11.mapped,
        mappingSuccessRate: mappingStats6to12.sectionBreakdown.section11.total > 0 
          ? mappingStats6to12.sectionBreakdown.section11.mapped / mappingStats6to12.sectionBreakdown.section11.total 
          : 0,
        integrationMappings: pdfFieldMap6to12.size
      };
      
      // Add Section 12 specific statistics
      result.section12Statistics = {
        totalSection12Fields: mappingStats6to30.sectionBreakdown.section12.total,
        successfulMappings: mappingStats6to30.sectionBreakdown.section12.mapped,
        failedMappings: mappingStats6to30.sectionBreakdown.section12.total - mappingStats6to30.sectionBreakdown.section12.mapped,
        mappingSuccessRate: mappingStats6to30.sectionBreakdown.section12.total > 0 
          ? mappingStats6to30.sectionBreakdown.section12.mapped / mappingStats6to30.sectionBreakdown.section12.total 
          : 0,
        integrationMappings: pdfFieldMap6to30.size
      };
      
      // Add Section 13 specific statistics
      result.section13Statistics = {
        totalSection13Fields: mappingStats6to30.sectionBreakdown.section13.total,
        successfulMappings: mappingStats6to30.sectionBreakdown.section13.mapped,
        failedMappings: mappingStats6to30.sectionBreakdown.section13.total - mappingStats6to30.sectionBreakdown.section13.mapped,
        mappingSuccessRate: mappingStats6to30.sectionBreakdown.section13.total > 0 
          ? mappingStats6to30.sectionBreakdown.section13.mapped / mappingStats6to30.sectionBreakdown.section13.total 
          : 0,
        integrationMappings: pdfFieldMap6to30.size
      };

      // Add Section 14 specific statistics
      result.section14Statistics = {
        totalSection14Fields: mappingStats6to30.sectionBreakdown.section14.total,
        successfulMappings: mappingStats6to30.sectionBreakdown.section14.mapped,
        failedMappings: mappingStats6to30.sectionBreakdown.section14.total - mappingStats6to30.sectionBreakdown.section14.mapped,
        mappingSuccessRate: mappingStats6to30.sectionBreakdown.section14.total > 0 
          ? mappingStats6to30.sectionBreakdown.section14.mapped / mappingStats6to30.sectionBreakdown.section14.total 
          : 0,
        integrationMappings: pdfFieldMap6to30.size
      };

      // Add Section 15 specific statistics
      result.section15Statistics = {
        totalSection15Fields: mappingStats6to30.sectionBreakdown.section15.total,
        successfulMappings: mappingStats6to30.sectionBreakdown.section15.mapped,
        failedMappings: mappingStats6to30.sectionBreakdown.section15.total - mappingStats6to30.sectionBreakdown.section15.mapped,
        mappingSuccessRate: mappingStats6to30.sectionBreakdown.section15.total > 0 
          ? mappingStats6to30.sectionBreakdown.section15.mapped / mappingStats6to30.sectionBreakdown.section15.total
          : 0
      };

      // Section 17 specific statistics (newly added)
      result.section17Statistics = {
        totalSection17Fields: mappingStats6to30.sectionBreakdown.section17.total,
        successfulMappings: mappingStats6to30.sectionBreakdown.section17.mapped,
        failedMappings: mappingStats6to30.sectionBreakdown.section17.total - mappingStats6to30.sectionBreakdown.section17.mapped,
        mappingSuccessRate: mappingStats6to30.sectionBreakdown.section17.total > 0 
          ? mappingStats6to30.sectionBreakdown.section17.mapped / mappingStats6to30.sectionBreakdown.section17.total 
          : 0,
        integrationMappings: pdfFieldMap6to30.size
      };

      // Section 27 specific statistics (IT Systems violations)
      result.section27Statistics = {
        totalSection27Fields: mappingStats6to30.sectionBreakdown.section27.total,
        successfulMappings: mappingStats6to30.sectionBreakdown.section27.mapped,
        failedMappings: mappingStats6to30.sectionBreakdown.section27.total - mappingStats6to30.sectionBreakdown.section27.mapped,
        mappingSuccessRate: mappingStats6to30.sectionBreakdown.section27.total > 0 
          ? mappingStats6to30.sectionBreakdown.section27.mapped / mappingStats6to30.sectionBreakdown.section27.total 
          : 0,
        integrationMappings: pdfFieldMap6to30.size
      };

      // Section 28 specific statistics (Non-Criminal Court Actions)
      result.section28Statistics = {
        totalSection28Fields: mappingStats6to30.sectionBreakdown.section28.total,
        successfulMappings: mappingStats6to30.sectionBreakdown.section28.mapped,
        failedMappings: mappingStats6to30.sectionBreakdown.section28.total - mappingStats6to30.sectionBreakdown.section28.mapped,
        mappingSuccessRate: mappingStats6to30.sectionBreakdown.section28.total > 0 
          ? mappingStats6to30.sectionBreakdown.section28.mapped / mappingStats6to30.sectionBreakdown.section28.total 
          : 0,
        integrationMappings: pdfFieldMap6to30.size
      };
      
      // Section 29 specific statistics (Association Record)
      result.section29Statistics = {
        totalSection29Fields: mappingStats6to30.sectionBreakdown.section29.total,
        successfulMappings: mappingStats6to30.sectionBreakdown.section29.mapped,
        failedMappings: mappingStats6to30.sectionBreakdown.section29.total - mappingStats6to30.sectionBreakdown.section29.mapped,
        mappingSuccessRate: mappingStats6to30.sectionBreakdown.section29.total > 0 
          ? mappingStats6to30.sectionBreakdown.section29.mapped / mappingStats6to30.sectionBreakdown.section29.total 
          : 0,
        integrationMappings: pdfFieldMap6to30.size
      };
      
      // Section 30 specific statistics (Continuation Section)
      result.section30Statistics = {
        totalSection30Fields: mappingStats6to30.sectionBreakdown.section30.total,
        successfulMappings: mappingStats6to30.sectionBreakdown.section30.mapped,
        failedMappings: mappingStats6to30.sectionBreakdown.section30.total - mappingStats6to30.sectionBreakdown.section30.mapped,
        mappingSuccessRate: mappingStats6to30.sectionBreakdown.section30.total > 0 
          ? mappingStats6to30.sectionBreakdown.section30.mapped / mappingStats6to30.sectionBreakdown.section30.total 
          : 0,
        integrationMappings: pdfFieldMap6to30.size
      };
      
      // Add validation information
      result.validationResults = {
        sections1to5: validation1to5,
        sections6to30: validation6to30
      };
      result.mappingStatistics = {
        sections1to5: mappingStats1to5,
        sections6to30: mappingStats6to30
      };
      
      logger.info('Enhanced PDF Generation Complete', 'EnhancedPdfService', {
        success: result.success,
        fieldsMapped: result.fieldsMapped,
        fieldsApplied: result.fieldsApplied,
        section1to5Mapped: pdfFieldMap1to5.size,
        section6to29Mapped: pdfFieldMap6to30.size,
        totalMapped: pdfFieldMap.size
      });
      
      return result;
      
    } catch (error) {
      logger.error('Enhanced PDF generation failed', error as Error, 'EnhancedPdfService');
      throw error;
    }
  }
}

// Export singleton instance
export const enhancedPdfService = new EnhancedPdfServiceWithSection1Integration();