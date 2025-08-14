/**
 * Field Mapping Validator Component
 * 
 * Provides visual page-by-page validation for Section 13 field mappings.
 * Ensures 100% field coverage between UI and PDF before allowing progression.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { integratedValidationService } from '../../../api/service/integratedValidationService';
import type { PageValidationResult, FieldValidationStatus } from './field-mapping-types';

interface FieldMappingValidatorProps {
  pdfBytes: Uint8Array;
  formData: any;
  sectionNumber: number;
  startPage: number;
  endPage: number;
  onValidationComplete?: (results: PageValidationResult[]) => void;
}

interface PageManifest {
  pageNumber: number;
  fieldCount: number;
  fields: Array<{
    pdfFieldName: string;
    uiFieldPath: string;
    isMapped: boolean;
    hasValue: boolean;
    expectedValue?: string;
    actualValue?: string;
  }>;
  validationStatus: 'pending' | 'in-progress' | 'complete';
  coverage: number;
}

export const FieldMappingValidator: React.FC<FieldMappingValidatorProps> = ({
  pdfBytes,
  formData,
  sectionNumber,
  startPage,
  endPage,
  onValidationComplete
}) => {
  const [currentPage, setCurrentPage] = useState(startPage);
  const [pageManifest, setPageManifest] = useState<PageManifest[]>([]);
  const [validationResult, setValidationResult] = useState<PageValidationResult | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [pageImage, setPageImage] = useState<string | null>(null);

  // Initialize page manifest
  useEffect(() => {
    const manifest: PageManifest[] = [];
    for (let page = startPage; page <= endPage; page++) {
      manifest.push({
        pageNumber: page,
        fieldCount: 0,
        fields: [],
        validationStatus: 'pending',
        coverage: 0
      });
    }
    setPageManifest(manifest);
  }, [startPage, endPage]);

  // Validate single page
  const validateSinglePage = useCallback(async (pageNumber: number) => {
    setIsValidating(true);
    
    try {
      console.log(`🔍 Validating page ${pageNumber}...`);
      
      // Extract expected values from form data
      const expectedValues = extractExpectedValuesForPage(formData, pageNumber);
      
      // Run validation for specific page
      const result = await integratedValidationService.validateSection13Inputs(
        pdfBytes,
        {
          clearData: false,
          generateImages: true,
          extractFields: true,
          targetPage: pageNumber,
          validateAgainstExpected: true,
          expectedValues
        }
      );

      // Update page manifest with results
      setPageManifest(prev => {
        const updated = [...prev];
        const pageIndex = pageNumber - startPage;
        
        if (updated[pageIndex]) {
          const fields = result.pageResult?.fields || [];
          const mappedFields = fields.filter(f => f.value && f.value.trim() !== '');
          
          updated[pageIndex] = {
            ...updated[pageIndex],
            fieldCount: fields.length,
            fields: fields.map(field => ({
              pdfFieldName: field.name,
              uiFieldPath: mapPdfFieldToUiPath(field.name),
              isMapped: !!field.value && field.value.trim() !== '',
              hasValue: !!field.value,
              expectedValue: expectedValues.find(v => field.value?.includes(v)),
              actualValue: field.value
            })),
            validationStatus: 'complete',
            coverage: fields.length > 0 ? (mappedFields.length / fields.length) * 100 : 0
          };
        }
        
        return updated;
      });

      // Set page image if generated
      if (result.imagePath) {
        setPageImage(result.imagePath);
      }

      setValidationResult({
        pageNumber,
        success: result.success,
        coverage: result.pageResult ? 
          (result.pageResult.fieldsWithValues / result.pageResult.totalFields) * 100 : 0,
        totalFields: result.pageResult?.totalFields || 0,
        mappedFields: result.pageResult?.fieldsWithValues || 0,
        unmappedFields: result.pageResult?.fieldsEmpty || 0,
        errors: result.errors || []
      });

      return result;
      
    } catch (error) {
      console.error(`❌ Error validating page ${pageNumber}:`, error);
      setValidationResult({
        pageNumber,
        success: false,
        coverage: 0,
        totalFields: 0,
        mappedFields: 0,
        unmappedFields: 0,
        errors: [error instanceof Error ? error.message : 'Validation failed']
      });
    } finally {
      setIsValidating(false);
    }
  }, [pdfBytes, formData, startPage]);

  // Extract expected values for a specific page
  const extractExpectedValuesForPage = (data: any, pageNumber: number): string[] => {
    // This should be customized based on which fields appear on which pages
    // For now, return all values from the form data
    const values: string[] = [];
    
    const extract = (obj: any) => {
      if (typeof obj === 'string' && obj.trim()) {
        values.push(obj);
      } else if (typeof obj === 'object' && obj !== null) {
        if (obj.value !== undefined) {
          if (typeof obj.value === 'string' && obj.value.trim()) {
            values.push(obj.value);
          }
        } else {
          Object.values(obj).forEach(val => extract(val));
        }
      }
    };
    
    extract(data);
    return values;
  };

  // Map PDF field name to UI field path
  const mapPdfFieldToUiPath = (pdfFieldName: string): string => {
    // This should use the reverse mapping from section13-field-mapping.ts
    // For now, return a placeholder
    return `section13.${pdfFieldName}`;
  };

  // Handle page navigation
  const goToNextPage = () => {
    if (currentPage < endPage) {
      setCurrentPage(currentPage + 1);
      setValidationResult(null);
      setPageImage(null);
    }
  };

  const goToPreviousPage = () => {
    if (currentPage > startPage) {
      setCurrentPage(currentPage - 1);
      setValidationResult(null);
      setPageImage(null);
    }
  };

  // Check if current page is 100% validated
  const isCurrentPageComplete = () => {
    const pageIndex = currentPage - startPage;
    const page = pageManifest[pageIndex];
    return page && page.validationStatus === 'complete' && page.coverage === 100;
  };

  // Get current page info
  const getCurrentPageInfo = () => {
    const pageIndex = currentPage - startPage;
    return pageManifest[pageIndex];
  };

  return (
    <div className="field-mapping-validator bg-white rounded-lg shadow-lg p-6">
      <h3 className="text-xl font-bold mb-4">
        Section {sectionNumber} Field Mapping Validation
      </h3>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex justify-between text-sm text-gray-600 mb-2">
          <span>Progress: Page {currentPage - startPage + 1} of {endPage - startPage + 1}</span>
          <span>Coverage: {getCurrentPageInfo()?.coverage.toFixed(1) || 0}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${((currentPage - startPage) / (endPage - startPage)) * 100}%` }}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Left Panel: PDF Page Preview */}
        <div className="pdf-preview border rounded-lg p-4">
          <h4 className="font-semibold mb-2">PDF Page {currentPage}</h4>
          <div className="relative bg-gray-100 min-h-[600px] flex items-center justify-center">
            {pageImage ? (
              <img 
                src={pageImage} 
                alt={`Page ${currentPage}`}
                className="max-w-full max-h-full"
              />
            ) : (
              <div className="text-gray-500">
                Click "Validate Page" to see page preview
              </div>
            )}
            
            {/* Field Highlights Overlay */}
            {validationResult && getCurrentPageInfo()?.fields.map((field, index) => (
              <div
                key={field.pdfFieldName}
                className={`absolute border-2 ${
                  field.isMapped ? 'border-green-500' : 'border-red-500'
                } bg-opacity-20 ${
                  field.isMapped ? 'bg-green-500' : 'bg-red-500'
                }`}
                title={`${field.pdfFieldName}: ${field.isMapped ? 'Mapped' : 'Not Mapped'}`}
                style={{
                  // Position would be based on actual field coordinates
                  top: `${(index * 30) % 500}px`,
                  left: '20px',
                  width: '200px',
                  height: '25px'
                }}
              />
            ))}
          </div>
        </div>

        {/* Right Panel: Field Status */}
        <div className="field-status">
          <h4 className="font-semibold mb-2">Field Mapping Status</h4>
          
          {!validationResult && (
            <div className="text-center py-8">
              <button
                onClick={() => validateSinglePage(currentPage)}
                disabled={isValidating}
                className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
              >
                {isValidating ? 'Validating...' : 'Validate Page'}
              </button>
            </div>
          )}

          {validationResult && (
            <>
              {/* Summary Stats */}
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="bg-gray-50 p-3 rounded">
                  <div className="text-2xl font-bold">{validationResult.totalFields}</div>
                  <div className="text-sm text-gray-600">Total Fields</div>
                </div>
                <div className="bg-green-50 p-3 rounded">
                  <div className="text-2xl font-bold text-green-600">
                    {validationResult.mappedFields}
                  </div>
                  <div className="text-sm text-gray-600">Mapped</div>
                </div>
                <div className="bg-red-50 p-3 rounded">
                  <div className="text-2xl font-bold text-red-600">
                    {validationResult.unmappedFields}
                  </div>
                  <div className="text-sm text-gray-600">Unmapped</div>
                </div>
              </div>

              {/* Field List */}
              <div className="field-list max-h-96 overflow-y-auto border rounded p-2">
                {getCurrentPageInfo()?.fields.map(field => (
                  <div 
                    key={field.pdfFieldName}
                    className={`flex items-center justify-between p-2 mb-1 rounded ${
                      field.isMapped ? 'bg-green-50' : 'bg-red-50'
                    }`}
                  >
                    <div className="flex-1">
                      <div className="font-mono text-sm">{field.pdfFieldName}</div>
                      <div className="text-xs text-gray-600">{field.uiFieldPath}</div>
                      {field.hasValue && (
                        <div className="text-xs text-gray-500">
                          Value: {field.actualValue}
                        </div>
                      )}
                    </div>
                    <div className="ml-2">
                      {field.isMapped ? (
                        <span className="text-green-600">✅</span>
                      ) : (
                        <span className="text-red-600">❌</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Errors */}
              {validationResult.errors.length > 0 && (
                <div className="mt-4 p-3 bg-red-50 rounded">
                  <h5 className="font-semibold text-red-800 mb-1">Errors:</h5>
                  {validationResult.errors.map((error, index) => (
                    <div key={index} className="text-sm text-red-600">
                      • {error}
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Navigation Controls */}
      <div className="flex justify-between items-center mt-6">
        <button
          onClick={goToPreviousPage}
          disabled={currentPage === startPage}
          className="px-4 py-2 border rounded hover:bg-gray-50 disabled:opacity-50"
        >
          ← Previous Page
        </button>

        <div className="text-center">
          <div className="text-sm text-gray-600">
            Page {currentPage} of {endPage}
          </div>
          {validationResult && (
            <div className={`text-lg font-semibold ${
              validationResult.coverage === 100 ? 'text-green-600' : 'text-orange-600'
            }`}>
              {validationResult.coverage.toFixed(1)}% Coverage
            </div>
          )}
        </div>

        <button
          onClick={goToNextPage}
          disabled={currentPage === endPage || !isCurrentPageComplete()}
          className={`px-4 py-2 rounded ${
            isCurrentPageComplete() 
              ? 'bg-green-600 text-white hover:bg-green-700' 
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          {!isCurrentPageComplete() && currentPage < endPage
            ? 'Complete 100% to Continue →'
            : 'Next Page →'
          }
        </button>
      </div>
    </div>
  );
};