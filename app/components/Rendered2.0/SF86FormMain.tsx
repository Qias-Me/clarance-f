/**
 * SF-86 Form Main Component
 *
 * Main form component that integrates all SF-86 sections using the new
 * Form Architecture 2.0. This component provides navigation between sections
 * and demonstrates the complete form functionality.
 */

import React, { useState } from 'react';
import { useSF86Form } from '~/state/contexts/SF86FormContext';
import { clientPdfService2 } from '../../../api/service/clientPdfService2.0';
import Section1Component from './Section1Component';
import Section2Component from './Section2Component';
import Section29Component from './Section29Component';


interface SF86FormMainProps {
  className?: string;
}

export const SF86FormMain: React.FC<SF86FormMainProps> = ({
  className = ''
}) => {
  const { generatePdf, validateForm, saveForm, formData, exportForm } = useSF86Form();
  const [currentSection, setCurrentSection] = useState<string>('section1');
  const [sectionValidation, setSectionValidation] = useState<Record<string, boolean>>({});

  // Available sections in our implementation
  const availableSections = [
    { id: 'section1', name: 'Information About You', component: Section1Component },
    { id: 'section2', name: 'Date of Birth', component: Section2Component },
    { id: 'section29', name: 'Associations', component: Section29Component }
  ];

  // Handle section validation updates
  const handleSectionValidation = (sectionId: string, isValid: boolean) => {
    setSectionValidation(prev => ({
      ...prev,
      [sectionId]: isValid
    }));
  };

  // Handle PDF generation and download - enhanced with better error handling
  const handleGeneratePdfLocal = async () => {
    try {
      console.log('Starting PDF generation process...');
      const result = await generatePdf();

      if (result.success && result.pdfBytes) {
        console.log(`PDF generation successful. Fields mapped: ${result.fieldsMapped}, Fields applied: ${result.fieldsApplied}`);

        // Use the service's download method directly
        const filename = `SF86_Form_${new Date().toISOString().split('T')[0]}.pdf`;
        console.log(`Initiating download with filename: ${filename}`);

        // Call the enhanced download method
        clientPdfService2.downloadPdf(result.pdfBytes, filename);

        // Show success message with detailed info
        const message = `PDF generated and download initiated successfully!\n\n` +
                       `Details:\n` +
                       `• Fields mapped: ${result.fieldsMapped}\n` +
                       `• Fields applied: ${result.fieldsApplied}\n` +
                       `• PDF size: ${result.pdfBytes.length} bytes\n` +
                       `• Filename: ${filename}\n\n` +
                       `If the download doesn't start automatically, check your browser's download settings or popup blocker.`;

        alert(message);
      } else {
        const errorMessage = `PDF generation failed:\n\n${result.errors.join('\n')}`;
        console.error('PDF generation failed:', result.errors);
        alert(errorMessage);
      }
    } catch (error) {
      const errorMessage = `PDF generation error: ${error}`;
      console.error('PDF generation error:', error);
      alert(errorMessage);
    }
  };

    // Handle PDF generation and download - SERVER-SIDE processing with terminal logging
    const handleGeneratePdfServer = async () => {
      try {
        console.log('🚀 Starting SERVER-SIDE PDF generation process...');
        console.log('📊 Form data to send:', formData);

        // Collect all section data from contexts before sending to server
        const completeFormData = exportForm(); // This calls collectAllSectionData internally
        console.log('📋 Complete form data collected:', completeFormData);

        // Create form data for the server action
        const actionFormData = new FormData();
        actionFormData.append('data', JSON.stringify(completeFormData));
        actionFormData.append('actionType', 'generatePDFServer');

        console.log('📡 Sending request to server action...');

        // Submit to the server action via startForm route
        const response = await fetch('/startForm', {
          method: 'POST',
          body: actionFormData
        });

        const result = await response.json() as any; // Type assertion for server response
        console.log('📄 Server PDF generation result:', result);

        if (result.success && result.data?.pdfBase64) {
          console.log(`✅ PDF generation successful!`);
          console.log(`📊 Fields mapped: ${result.data.fieldsMapped}`);
          console.log(`📊 Fields applied: ${result.data.fieldsApplied}`);
          console.log(`📈 Success rate: ${result.data.successRate?.toFixed(2)}%`);
          console.log('📄 Check your terminal for detailed server logs!');

          // Create download link for the PDF
          const pdfBlob = new Blob([
            Uint8Array.from(atob(result.data.pdfBase64), c => c.charCodeAt(0))
          ], { type: 'application/pdf' });

          const url = URL.createObjectURL(pdfBlob);
          const link = document.createElement('a');
          link.href = url;
          const filename = `SF86_Server_Generated_${new Date().toISOString().split('T')[0]}.pdf`;
          link.download = filename;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(url);

          // Show success message with detailed server-side info
          const message = `🎉 SERVER-SIDE PDF generated and downloaded successfully!\n\n` +
                         `📊 Server Processing Details:\n` +
                         `• Fields mapped: ${result.data.fieldsMapped}\n` +
                         `• Fields applied: ${result.data.fieldsApplied}\n` +
                         `• Success rate: ${result.data.successRate?.toFixed(2)}%\n` +
                         `• Total PDF fields: ${result.data.totalPdfFields}\n` +
                         `• Total form fields: ${result.data.totalFormFields}\n` +
                         `• Filename: ${filename}\n\n` +
                         `🖥️ IMPORTANT: Check your terminal/console for comprehensive field mapping logs!\n` +
                         `This includes detailed analysis of Section 29 radio button mappings and field lookup effectiveness.`;

          alert(message);
        } else {
          const errorMessage = `❌ Server-side PDF generation failed:\n\n${result.message}\n\n` +
                              `🔍 Check your terminal for detailed error logs.`;
          console.error('❌ Server PDF generation failed:', result.message);
          if (result.data?.errors) {
            console.error('🔍 Server errors:', result.data.errors);
          }
          alert(errorMessage);
        }
      } catch (error) {
        const errorMessage = `💥 Server PDF generation error: ${error}\n\n` +
                            `🔍 Check your terminal for detailed error information.`;
        console.error('💥 Server PDF generation error:', error);
        alert(errorMessage);
      }
    };


  // Handle form validation
  const handleValidateForm = () => {
    const result = validateForm();
    alert(`Form validation: ${result.isValid ? 'PASSED' : 'FAILED'}\nErrors: ${result.errors.length}\nWarnings: ${result.warnings.length}`);
  };

  // Handle form save
  const handleSaveForm = async () => {
    try {
      await saveForm();
      alert('Form saved successfully!');
    } catch (error) {
      alert(`Form save error: ${error}`);
    }
  };

  // Get current section component
  const getCurrentSectionComponent = () => {
    const section = availableSections.find(s => s.id === currentSection);
    if (!section) return null;

    const Component = section.component;
    return (
      <Component
        onValidationChange={(isValid) => handleSectionValidation(currentSection, isValid)}
      />
    );
  };

  return (
    <div className={`min-h-screen bg-gray-50 ${className}`} data-testid="sf86-form-container">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                SF-86 Questionnaire for National Security Positions
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                Form Architecture 2.0 - Comprehensive Implementation
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500" data-testid="form-status">
                Status: Active
              </span>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Section Navigation */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-lg p-6 sticky top-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Sections</h2>

              <nav className="space-y-2">
                {availableSections.map((section) => (
                  <button
                    key={section.id}
                    onClick={() => setCurrentSection(section.id)}
                    className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                      currentSection === section.id
                        ? 'bg-blue-500 text-white'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                    data-testid={`${section.id}-tab`}
                  >
                    <div className="flex items-center justify-between">
                      <span>{section.name}</span>
                      {sectionValidation[section.id] && (
                        <span className="text-green-400">✓</span>
                      )}
                    </div>
                  </button>
                ))}
              </nav>

              {/* Form Actions */}
              <div className="mt-8 space-y-3">
                <button
                  onClick={handleValidateForm}
                  className="w-full px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors text-sm"
                  data-testid="validate-form-button"
                >
                  Validate Form
                </button>

                <button
                  onClick={handleSaveForm}
                  className="w-full px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors text-sm"
                  data-testid="save-form-button"
                >
                  Save Form
                </button>

                <button
                  onClick={handleGeneratePdfLocal}
                  className="w-full px-4 py-2 bg-purple-500 text-white rounded-md hover:bg-purple-600 transition-colors text-sm"
                  data-testid="generate-pdf-button"
                >
                  Generate & Download PDF (Local)
                </button>

                <button
                  onClick={handleGeneratePdfServer}
                  className="w-full px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-purple-600 transition-colors text-sm"
                  data-testid="generate-pdf-button"
                >
                  Generate & Download PDF (Server)
                </button>

              </div>

              {/* Form Statistics */}
              <div className="mt-8 p-4 bg-gray-50 rounded-lg">
                <h3 className="text-sm font-medium text-gray-700 mb-2">Form Statistics</h3>
                <div className="space-y-1 text-xs text-gray-600">
                  <div>Sections: {availableSections.length}/30</div>
                  <div>Valid Sections: {Object.values(sectionValidation).filter(Boolean).length}</div>
                  <div>Architecture: 2.0</div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {getCurrentSectionComponent()}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white border-t mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-sm text-gray-500">
            <p>SF-86 Form Architecture 2.0 - Demonstration Implementation</p>
            <p className="mt-1">
              This is a demonstration of the new scalable SF-86 form architecture with
              comprehensive PDF integration and testing infrastructure.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default SF86FormMain;
