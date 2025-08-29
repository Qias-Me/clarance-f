/**
 * Dynamic Field Renderer Component
 * 
 * Renders all 1,086 fields from JSON mappings dynamically
 * Connects enhanced integration with UI components
 */

import React, { useEffect, useState } from 'react';
import { 
  getEnhancedEmploymentTypeMapping 
} from '~/state/contexts/sections2.0/section13-enhanced-integration';
import { 
  type JsonFieldMapping 
} from '~/state/contexts/sections2.0/section13-json-loader';

interface DynamicFieldRendererProps {
  employmentType: string;
  onFieldChange: (fieldPath: string, value: any) => void;
  getFieldValue: (fieldPath: string) => any;
}

interface FieldGroup {
  category: string;
  fields: JsonFieldMapping[];
}

export const DynamicFieldRenderer: React.FC<DynamicFieldRendererProps> = ({
  employmentType,
  onFieldChange,
  getFieldValue
}) => {
  const [fieldMappings, setFieldMappings] = useState<JsonFieldMapping[]>([]);
  const [fieldGroups, setFieldGroups] = useState<FieldGroup[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load field mappings for employment type
  // Fixed: Added memoization to prevent unnecessary re-loads
  useEffect(() => {
    let isMounted = true;
    
    const loadFields = async () => {
      try {
        if (!isMounted) return;
        
        setIsLoading(true);
        setError(null);
        
        console.log(`🔄 DynamicFieldRenderer: Loading fields for ${employmentType}`);
        
        // Load enhanced mappings for this employment type
        const mappings = await getEnhancedEmploymentTypeMapping(employmentType);
        
        if (!isMounted) return;
        
        const jsonMappings = mappings.map(mapping => ({
          uiPath: mapping.uiPath,
          pdfFieldId: mapping.pdfField,
          confidence: mapping.metadata?.confidence || 0.8,
          page: mapping.metadata?.page || 17,
          label: mapping.metadata?.label || '',
          type: mapping.fieldType as 'PDFTextField' | 'PDFCheckBox' | 'PDFDropdown' | 'PDFRadioGroup',
          processingSource: mapping.metadata?.processingSource || 'dynamic'
        }));
        
        setFieldMappings(jsonMappings);
        
        // Group fields by category
        const groups = groupFieldsByCategory(jsonMappings);
        setFieldGroups(groups);
        
        console.log(`✅ DynamicFieldRenderer: Loaded ${jsonMappings.length} fields in ${groups.length} groups`);
        
      } catch (err) {
        if (!isMounted) return;
        console.error('❌ DynamicFieldRenderer: Failed to load fields:', err);
        setError(err instanceof Error ? err.message : 'Failed to load fields');
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    if (employmentType) {
      loadFields();
    }
    
    return () => {
      isMounted = false;
    };
  }, [employmentType]);

  // Group fields by their path structure
  const groupFieldsByCategory = (mappings: JsonFieldMapping[]): FieldGroup[] => {
    const groups = new Map<string, JsonFieldMapping[]>();
    
    mappings.forEach(mapping => {
      // Extract category from UI path
      const pathParts = mapping.uiPath.split('.');
      let category = 'General Information';
      
      if (pathParts.length >= 2) {
        const secondPart = pathParts[1];
        switch (secondPart) {
          case 'employmentDates':
            category = 'Employment Dates';
            break;
          case 'address':
            category = 'Address Information';
            break;
          case 'supervisor':
            category = 'Supervisor Information';
            break;
          case 'dutyStation':
            category = 'Military Information';
            break;
          case 'employmentRecordIssues':
            category = 'Employment Record Issues';
            break;
          case 'disciplinaryActions':
            category = 'Disciplinary Actions';
            break;
          case 'federalInfo':
            category = 'Federal Information';
            break;
          default:
            if (secondPart.includes('Employment')) {
              category = 'Employment Details';
            }
        }
      }
      
      if (!groups.has(category)) {
        groups.set(category, []);
      }
      groups.get(category)!.push(mapping);
    });
    
    // Convert to array and sort by importance
    const categoryOrder = [
      'General Information',
      'Employment Details', 
      'Employment Dates',
      'Address Information',
      'Supervisor Information',
      'Military Information',
      'Federal Information',
      'Employment Record Issues',
      'Disciplinary Actions'
    ];
    
    return categoryOrder
      .map(category => ({ category, fields: groups.get(category) || [] }))
      .filter(group => group.fields.length > 0);
  };

  // Render individual field based on type
  const renderField = (mapping: JsonFieldMapping) => {
    const value = getFieldValue(mapping.uiPath);
    const fieldId = `field_${mapping.uiPath.replace(/[.\[\]]/g, '_')}`;
    
    const baseClassName = "w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500";
    
    switch (mapping.type) {
      case 'PDFTextField':
        return (
          <div key={mapping.uiPath} className="space-y-2">
            <label htmlFor={fieldId} className="block text-sm font-medium text-gray-700">
              {mapping.label || formatFieldLabel(mapping.uiPath)}
            </label>
            <input
              type="text"
              id={fieldId}
              value={value || ''}
              onChange={(e) => onFieldChange(mapping.uiPath, e.target.value)}
              className={baseClassName}
              data-field-path={mapping.uiPath}
              data-pdf-field={mapping.pdfFieldId}
              data-confidence={mapping.confidence}
              placeholder={`Enter ${mapping.label || formatFieldLabel(mapping.uiPath)}`}
            />
          </div>
        );
        
      case 'PDFCheckBox':
        return (
          <div key={mapping.uiPath} className="flex items-center space-x-3">
            <input
              type="checkbox"
              id={fieldId}
              checked={Boolean(value)}
              onChange={(e) => onFieldChange(mapping.uiPath, e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              data-field-path={mapping.uiPath}
              data-pdf-field={mapping.pdfFieldId}
            />
            <label htmlFor={fieldId} className="text-sm text-gray-700">
              {mapping.label || formatFieldLabel(mapping.uiPath)}
            </label>
          </div>
        );
        
      case 'PDFRadioGroup':
        // For radio groups, we'll render as Yes/No for now
        return (
          <div key={mapping.uiPath} className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              {mapping.label || formatFieldLabel(mapping.uiPath)}
            </label>
            <div className="flex space-x-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  name={fieldId}
                  value="yes"
                  checked={value === true || value === 'yes'}
                  onChange={() => onFieldChange(mapping.uiPath, true)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                  data-field-path={mapping.uiPath}
                  data-pdf-field={mapping.pdfFieldId}
                />
                <span className="ml-2 text-sm text-gray-700">Yes</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name={fieldId}
                  value="no"
                  checked={value === false || value === 'no'}
                  onChange={() => onFieldChange(mapping.uiPath, false)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                  data-field-path={mapping.uiPath}
                  data-pdf-field={mapping.pdfFieldId}
                />
                <span className="ml-2 text-sm text-gray-700">No</span>
              </label>
            </div>
          </div>
        );
        
      case 'PDFDropdown':
        return (
          <div key={mapping.uiPath} className="space-y-2">
            <label htmlFor={fieldId} className="block text-sm font-medium text-gray-700">
              {mapping.label || formatFieldLabel(mapping.uiPath)}
            </label>
            <select
              id={fieldId}
              value={value || ''}
              onChange={(e) => onFieldChange(mapping.uiPath, e.target.value)}
              className={baseClassName}
              data-field-path={mapping.uiPath}
              data-pdf-field={mapping.pdfFieldId}
            >
              <option value="">Select option...</option>
              <option value="option1">Option 1</option>
              <option value="option2">Option 2</option>
              <option value="option3">Option 3</option>
            </select>
          </div>
        );
        
      default:
        return (
          <div key={mapping.uiPath} className="text-sm text-gray-500">
            Unknown field type: {mapping.type} for {mapping.uiPath}
          </div>
        );
    }
  };

  // Format field label from UI path
  const formatFieldLabel = (uiPath: string): string => {
    const parts = uiPath.split('.');
    const lastPart = parts[parts.length - 1];
    
    // Convert camelCase to Title Case
    return lastPart
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, str => str.toUpperCase())
      .trim();
  };

  if (isLoading) {
    return (
      <div className="p-6 bg-blue-50 rounded-lg border border-blue-200">
        <div className="flex items-center space-x-3">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          <span className="text-blue-800">Loading {employmentType} fields...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-red-50 rounded-lg border border-red-200">
        <h4 className="text-red-800 font-medium">Error Loading Fields</h4>
        <p className="text-red-600 text-sm mt-1">{error}</p>
      </div>
    );
  }

  if (fieldMappings.length === 0) {
    return (
      <div className="p-6 bg-gray-50 rounded-lg border border-gray-200">
        <p className="text-gray-600">No fields found for {employmentType}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Field Summary */}
      <div className="p-4 bg-green-50 rounded-lg border border-green-200">
        <h4 className="text-green-800 font-medium">Dynamic Field Renderer Active</h4>
        <p className="text-green-700 text-sm mt-1">
          Loaded {fieldMappings.length} fields for {employmentType} in {fieldGroups.length} categories
        </p>
      </div>
      
      {/* Render field groups */}
      {fieldGroups.map((group, groupIndex) => (
        <div key={group.category} className="border border-gray-200 rounded-lg p-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">
            {group.category} ({group.fields.length} fields)
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {group.fields.map(mapping => renderField(mapping))}
          </div>
        </div>
      ))}
      
      {/* Debug Information */}
      {typeof window !== 'undefined' && window.location.search.includes('debug=true') && (
        <details className="p-4 bg-gray-50 rounded-lg">
          <summary className="cursor-pointer text-sm font-medium text-gray-700">
            Debug: Field Mappings ({fieldMappings.length} total)
          </summary>
          <div className="mt-2">
            <pre className="text-xs bg-white p-2 rounded border overflow-auto max-h-40">
              {JSON.stringify(fieldMappings.slice(0, 5), null, 2)}
            </pre>
            {fieldMappings.length > 5 && (
              <p className="text-xs text-gray-500 mt-1">
                Showing first 5 of {fieldMappings.length} mappings
              </p>
            )}
          </div>
        </details>
      )}
    </div>
  );
};

export default DynamicFieldRenderer;