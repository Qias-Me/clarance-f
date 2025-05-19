import React, { useState, useRef, useEffect } from 'react';
import { clientPdfService } from '../../../api/service/clientpdfService';
import type { ApplicantFormValues } from '../../../api/interfaces/formDefinition';
import type { FieldHierarchy } from '../../../api/interfaces/FieldMetadata';

// Mock field hierarchy service - replace with actual API call in production
async function fetchFieldHierarchy(): Promise<FieldHierarchy | null> {
  try {
    // In a real implementation, this would be an API call to fetch field hierarchy
    // For development/testing, you could load from a local JSON file
    const response = await fetch('/api/field-hierarchy');
    if (response.ok) {
      return await response.json();
    }
    console.warn('Failed to fetch field hierarchy, using fallback mapping');
    return null;
  } catch (error) {
    console.error('Error fetching field hierarchy:', error);
    return null;
  }
}

interface PdfGeneratorProps {
  formData: ApplicantFormValues;
}

export const PdfGenerator: React.FC<PdfGeneratorProps> = ({ formData }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<string | null>(null);
  const [showUpload, setShowUpload] = useState(false);
  const [fieldHierarchy, setFieldHierarchy] = useState<FieldHierarchy | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch field hierarchy when component mounts
  useEffect(() => {
    async function loadFieldHierarchy() {
      try {
        const hierarchy = await fetchFieldHierarchy();
        if (hierarchy) {
          setFieldHierarchy(hierarchy);
          console.log('Field hierarchy loaded for PDF generation');
        }
      } catch (error) {
        console.error('Failed to load field hierarchy:', error);
      }
    }
    
    loadFieldHierarchy();
  }, []);

  const generatePdf = async () => {
    setIsGenerating(true);
    setError(null);
    setProgress('Loading PDF...');
    setShowUpload(false);

    try {
      // First load the PDF template
      await clientPdfService.loadPdf();
      setProgress('Preparing form data...');
      
      // Set field hierarchy if available
      if (fieldHierarchy) {
        clientPdfService.setFieldHierarchy(fieldHierarchy);
        setProgress('Field hierarchy set, filling form fields...');
      } else {
        setProgress('Using fallback mapping, filling form fields...');
      }
      
      // Generate the filled PDF
      const pdfBytes = await clientPdfService.generateFilledPdf(formData);
      setProgress('PDF generated! Downloading...');
      
      // Download the PDF
      clientPdfService.downloadPdf(pdfBytes);
      setProgress('PDF downloaded successfully!');
      
      // Reset status after 3 seconds
      setTimeout(() => {
        setProgress(null);
        setIsGenerating(false);
      }, 3000);
    } catch (error) {
      console.error('Error generating PDF:', error);
      setError(`Error generating PDF: ${error instanceof Error ? error.message : String(error)}`);
      setIsGenerating(false);
      setProgress(null);
      
      // Show file upload option if loading failed
      setShowUpload(true);
    }
  };
  
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    setIsGenerating(true);
    setError(null);
    setProgress('Reading uploaded PDF template...');
    
    try {
      // Read the file as ArrayBuffer
      const fileBuffer = await file.arrayBuffer();
      
      // Load the PDF from the uploaded file
      await clientPdfService.loadPdfFromBuffer(fileBuffer);
      
      // Set field hierarchy if available
      if (fieldHierarchy) {
        clientPdfService.setFieldHierarchy(fieldHierarchy);
        setProgress('Field hierarchy set, filling uploaded PDF template...');
      } else {
        setProgress('Using fallback mapping with uploaded PDF template...');
      }
      
      // Generate the filled PDF
      const pdfBytes = await clientPdfService.generateFilledPdf(formData);
      setProgress('PDF generated! Downloading...');
      
      // Download the PDF
      clientPdfService.downloadPdf(pdfBytes);
      setProgress('PDF downloaded successfully!');
      
      // Reset status after 3 seconds
      setTimeout(() => {
        setProgress(null);
        setIsGenerating(false);
        setShowUpload(false);
      }, 3000);
    } catch (error) {
      console.error('Error processing uploaded PDF:', error);
      setError(`Error processing uploaded PDF: ${error instanceof Error ? error.message : String(error)}`);
      setIsGenerating(false);
      setProgress(null);
    }
  };

  return (
    <div className="pdf-generator">
      <button 
        onClick={generatePdf} 
        disabled={isGenerating}
        className="btn btn-primary"
      >
        {isGenerating ? 'Generating PDF...' : 'Generate SF86 PDF'}
      </button>
      
      {progress && (
        <div className="mt-2 text-info">
          <span>{progress}</span>
        </div>
      )}
      
      {error && (
        <div className="mt-2 text-danger">
          <span>{error}</span>
        </div>
      )}
      
      {showUpload && (
        <div className="mt-3">
          <p>Having trouble fetching the SF86 PDF? Upload your own copy:</p>
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf"
            onChange={handleFileUpload}
            className="form-control mt-2"
          />
          <small className="text-muted d-block mt-1">
            You can download the SF86 form from <a href="https://www.opm.gov/forms/pdf_fill/sf86.pdf" target="_blank" rel="noopener noreferrer">OPM's website</a>.
          </small>
        </div>
      )}
      
      <div className="mt-3">
        <small className="text-muted">
          This will generate and download your SF86 form as a PDF file.
          All processing happens in your browser - no data is sent to any server.
          {fieldHierarchy ? ' Using optimized field mapping.' : ' Using legacy field mapping.'}
        </small>
      </div>
    </div>
  );
}; 