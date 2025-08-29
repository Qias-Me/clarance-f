import React, { useState, useEffect } from 'react';
import { CheckCircleIcon, XCircleIcon, ExclamationTriangleIcon, EyeIcon, DocumentTextIcon } from '@heroicons/react/24/outline';

interface ValidationField {
  fieldId: string;
  fieldName: string;
  expectedValue: any;
  actualValue: any;
  isValid: boolean;
  error?: string;
  suggestions?: string[];
  coordinates?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

interface PageValidationResult {
  pageNumber: number;
  totalFields: number;
  validFields: number;
  invalidFields: number;
  fields: ValidationField[];
  pageImagePath?: string;
  pageDataPath?: string;
}

interface PdfValidationReport {
  success: boolean;
  totalPages: number;
  totalFields: number;
  validFields: number;
  invalidFields: number;
  pages: PageValidationResult[];
  errors: string[];
  warnings: string[];
  processingTime: number;
}

interface PdfValidationDashboardProps {
  validationReport?: PdfValidationReport;
  isVisible: boolean;
  onClose: () => void;
  onViewPage?: (pageNumber: number) => void;
  onViewFieldData?: (pageNumber: number) => void;
}

export const PdfValidationDashboard: React.FC<PdfValidationDashboardProps> = ({
  validationReport,
  isVisible,
  onClose,
  onViewPage,
  onViewFieldData
}) => {
  const [selectedPage, setSelectedPage] = useState<number | null>(null);
  const [showFieldDetails, setShowFieldDetails] = useState(false);

  if (!isVisible || !validationReport) {
    return null;
  }

  const successRate = validationReport.totalFields > 0 
    ? ((validationReport.validFields / validationReport.totalFields) * 100).toFixed(2)
    : '0';

  const getStatusIcon = (isValid: boolean) => {
    return isValid 
      ? <CheckCircleIcon className="h-5 w-5 text-green-500" />
      : <XCircleIcon className="h-5 w-5 text-red-500" />;
  };

  const getStatusColor = (isValid: boolean) => {
    return isValid ? 'text-green-600' : 'text-red-600';
  };

  const selectedPageData = selectedPage 
    ? validationReport.pages.find(p => p.pageNumber === selectedPage)
    : null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-blue-600 text-white px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl font-semibold">PDF Validation Dashboard</h2>
          <button
            onClick={onClose}
            className="text-white hover:text-gray-200 text-2xl font-bold"
          >
            ×
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
          {/* Summary Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-blue-600">Total Fields</h3>
              <p className="text-2xl font-bold text-blue-900">{validationReport.totalFields}</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-green-600">Valid Fields</h3>
              <p className="text-2xl font-bold text-green-900">{validationReport.validFields}</p>
            </div>
            <div className="bg-red-50 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-red-600">Invalid Fields</h3>
              <p className="text-2xl font-bold text-red-900">{validationReport.invalidFields}</p>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-purple-600">Success Rate</h3>
              <p className="text-2xl font-bold text-purple-900">{successRate}%</p>
            </div>
          </div>

          {/* Processing Info */}
          <div className="bg-gray-50 p-4 rounded-lg mb-6">
            <h3 className="text-lg font-semibold mb-2">Processing Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="font-medium">Pages Processed:</span> {validationReport.totalPages}
              </div>
              <div>
                <span className="font-medium">Processing Time:</span> {validationReport.processingTime}ms
              </div>
              <div>
                <span className="font-medium">Status:</span> 
                <span className={validationReport.success ? 'text-green-600 ml-1' : 'text-red-600 ml-1'}>
                  {validationReport.success ? 'Success' : 'Failed'}
                </span>
              </div>
            </div>
          </div>

          {/* Errors and Warnings */}
          {(validationReport.errors.length > 0 || validationReport.warnings.length > 0) && (
            <div className="mb-6">
              {validationReport.errors.length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                  <h3 className="text-lg font-semibold text-red-800 mb-2 flex items-center">
                    <XCircleIcon className="h-5 w-5 mr-2" />
                    Errors ({validationReport.errors.length})
                  </h3>
                  <ul className="list-disc list-inside text-red-700">
                    {validationReport.errors.map((error, index) => (
                      <li key={index}>{error}</li>
                    ))}
                  </ul>
                </div>
              )}
              
              {validationReport.warnings.length > 0 && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-yellow-800 mb-2 flex items-center">
                    <ExclamationTriangleIcon className="h-5 w-5 mr-2" />
                    Warnings ({validationReport.warnings.length})
                  </h3>
                  <ul className="list-disc list-inside text-yellow-700">
                    {validationReport.warnings.map((warning, index) => (
                      <li key={index}>{warning}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Page-by-Page Results */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-4">Page-by-Page Validation Results</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {validationReport.pages.map((page) => (
                <div
                  key={page.pageNumber}
                  className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                    selectedPage === page.pageNumber
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setSelectedPage(page.pageNumber)}
                >
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-semibold">Page {page.pageNumber}</h4>
                    {getStatusIcon(page.invalidFields === 0)}
                  </div>
                  <div className="text-sm text-gray-600">
                    <div>Total Fields: {page.totalFields}</div>
                    <div className="text-green-600">Valid: {page.validFields}</div>
                    <div className="text-red-600">Invalid: {page.invalidFields}</div>
                  </div>
                  <div className="mt-2 flex space-x-2">
                    {onViewPage && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onViewPage(page.pageNumber);
                        }}
                        className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded flex items-center"
                      >
                        <EyeIcon className="h-3 w-3 mr-1" />
                        View
                      </button>
                    )}
                    {onViewFieldData && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onViewFieldData(page.pageNumber);
                        }}
                        className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded flex items-center"
                      >
                        <DocumentTextIcon className="h-3 w-3 mr-1" />
                        Data
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Selected Page Details */}
          {selectedPageData && (
            <div className="border-t pt-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Page {selectedPageData.pageNumber} Details</h3>
                <button
                  onClick={() => setShowFieldDetails(!showFieldDetails)}
                  className="bg-gray-100 text-gray-700 px-3 py-1 rounded text-sm"
                >
                  {showFieldDetails ? 'Hide' : 'Show'} Field Details
                </button>
              </div>

              {showFieldDetails && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-semibold mb-3">Field Validation Details</h4>
                  <div className="max-h-64 overflow-y-auto">
                    {selectedPageData.fields
                      .filter(field => !field.isValid)
                      .slice(0, 10) // Show first 10 invalid fields
                      .map((field, index) => (
                        <div key={index} className="border-b border-gray-200 py-2 last:border-b-0">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="font-medium text-sm">{field.fieldName}</div>
                              <div className="text-xs text-gray-600 mt-1">{field.error}</div>
                              {field.suggestions && field.suggestions.length > 0 && (
                                <div className="text-xs text-blue-600 mt-1">
                                  Suggestion: {field.suggestions[0]}
                                </div>
                              )}
                            </div>
                            {getStatusIcon(field.isValid)}
                          </div>
                        </div>
                      ))}
                    {selectedPageData.fields.filter(field => !field.isValid).length > 10 && (
                      <div className="text-xs text-gray-500 mt-2">
                        ... and {selectedPageData.fields.filter(field => !field.isValid).length - 10} more invalid fields
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PdfValidationDashboard;
