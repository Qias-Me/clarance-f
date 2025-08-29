/**
 * Field Mapping Utilities for Section Components
 * Provides reusable functionality for field mapping display and statistics
 */

import React from 'react';

export interface FieldMappingInfo {
  pdfFieldId: string;
  pdfFieldName: string;
  confidence: number;
  type: string;
}

export interface FieldMappingStats {
  totalMappings: number;
  integrationMappings: number;
  averageConfidence: number | null;
  validation?: {
    isValid: boolean;
    errors?: string[];
  };
}

/**
 * Renders field mapping info badge for form labels
 */
export const renderFieldMappingBadge = (
  fieldPath: string,
  mappingInfo: FieldMappingInfo | null
): React.ReactElement | null => {
  if (!mappingInfo) return null;
  
  return (
    <span className="ml-2 text-xs text-blue-600 font-normal">
      → PDF Field: {mappingInfo.pdfFieldId}
    </span>
  );
};

/**
 * Renders detailed field mapping info box
 */
export const renderFieldMappingDetails = (
  mappingInfo: FieldMappingInfo | null
): React.ReactElement | null => {
  if (!mappingInfo) return null;
  
  return (
    <div className="mt-1 text-xs text-blue-600 bg-blue-50 p-2 rounded">
      🔗 Maps to: {mappingInfo.pdfFieldName} 
      (Confidence: {(mappingInfo.confidence * 100).toFixed(0)}%)
    </div>
  );
};

/**
 * Renders field mapping statistics panel
 */
export const renderMappingStatistics = (
  stats: FieldMappingStats | null
): React.ReactElement | null => {
  if (!stats) return null;
  
  return (
    <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
      <h4 className="text-sm font-medium text-blue-900 mb-2">
        🔗 Field Mapping Integration Statistics
      </h4>
      <div className="grid grid-cols-2 gap-4 text-xs">
        <div>
          <span className="font-medium">Total Mappings:</span> {stats.totalMappings || 0}
        </div>
        <div>
          <span className="font-medium">Integration Mappings:</span> {stats.integrationMappings || 0}
        </div>
        <div>
          <span className="font-medium">Average Confidence:</span> {
            stats.averageConfidence 
              ? (stats.averageConfidence * 100).toFixed(1) + '%' 
              : 'N/A'
          }
        </div>
        <div>
          <span className="font-medium">Validation Status:</span> 
          <span className={stats.validation?.isValid ? 'text-green-600' : 'text-red-600'}>
            {stats.validation?.isValid ? ' ✅ Valid' : ' ❌ Invalid'}
          </span>
        </div>
      </div>
    </div>
  );
};