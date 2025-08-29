/**
 * Section 13 Complete Field Renderer
 * Renders all 1086 fields from the Section 13 mapping
 */

import React, { useEffect, useState, useCallback } from 'react';
import { useSection13 } from '~/state/contexts/sections2.0/section13';
import { 
  loadSection13Fields,
  loadSection13Mappings,
  combineFieldsAndMappings
} from '~/utils/section13-field-loader';

interface Section13CompleteRendererProps {
  onValidationChange?: (isValid: boolean) => void;
}

export const Section13CompleteRenderer: React.FC<Section13CompleteRendererProps> = ({
  onValidationChange
}) => {
  const { section13Data, updateFieldValue, validateSection } = useSection13();
  const [fieldMappings, setFieldMappings] = useState<any[]>([]);
  const [groupedFields, setGroupedFields] = useState<Record<string, any[]>>({});
  const [activeTab, setActiveTab] = useState<string>('military');
  const [coverage, setCoverage] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Initialize field mappings on mount
  useEffect(() => {
    const loadFieldData = async () => {
      console.log('🚀 Loading Section 13 field data...');
      setIsLoading(true);
      
      try {
        // Load fields and mappings
        const [fields, mappings] = await Promise.all([
          loadSection13Fields(),
          loadSection13Mappings()
        ]);
        
        console.log(`📊 Loaded ${fields.length} fields and ${mappings.length} mappings`);
        
        // Combine and process
        const combined = combineFieldsAndMappings(fields, mappings);
        
        // Group by employment type
        const grouped = groupFieldsByType(combined);
        
        setFieldMappings(combined);
        setGroupedFields(grouped);
        setCoverage({
          total: 1086,
          loaded: combined.length,
          coverage: ((combined.length / 1086) * 100).toFixed(1)
        });
        
        console.log('✅ Field data loaded successfully:', {
          total: combined.length,
          byType: Object.entries(grouped).map(([type, fields]) => 
            ({ type, count: (fields as any[]).length })
          )
        });
      } catch (error) {
        console.error('❌ Failed to load field data:', error);
        // Use fallback data
        const fallbackFields = await loadSection13Fields();
        const fallbackMappings = await loadSection13Mappings();
        const combined = combineFieldsAndMappings(fallbackFields, fallbackMappings);
        const grouped = groupFieldsByType(combined);
        
        setFieldMappings(combined);
        setGroupedFields(grouped);
        setCoverage({
          total: 1086,
          loaded: combined.length,
          coverage: ((combined.length / 1086) * 100).toFixed(1)
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    loadFieldData();
  }, []);
  
  // Helper function to group fields by employment type
  const groupFieldsByType = (fields: any[]): Record<string, any[]> => {
    const groups: Record<string, any[]> = {
      military: [],
      federal: [],
      nonFederal: [],
      selfEmployment: [],
      unemployment: [],
      general: []
    };
    
    fields.forEach(field => {
      const uiPath = field.uiPath || '';
      if (uiPath.includes('militaryEmployment')) {
        groups.military.push(field);
      } else if (uiPath.includes('federalEmployment')) {
        groups.federal.push(field);
      } else if (uiPath.includes('nonFederalEmployment')) {
        groups.nonFederal.push(field);
      } else if (uiPath.includes('selfEmployment')) {
        groups.selfEmployment.push(field);
      } else if (uiPath.includes('unemployment')) {
        groups.unemployment.push(field);
      } else {
        groups.general.push(field);
      }
    });
    
    return groups;
  };
  
  // Get field value from context
  const getFieldValue = useCallback((uiPath: string): any => {
    // Navigate through the nested object structure
    const pathSegments = uiPath.replace('section13.', '').split('.');
    let current: any = section13Data;
    
    for (const segment of pathSegments) {
      if (!current) return '';
      
      // Handle array notation
      const arrayMatch = segment.match(/^(.+)\[(\d+)\]$/);
      if (arrayMatch) {
        const [, arrayName, index] = arrayMatch;
        current = current[arrayName]?.[parseInt(index)];
      } else {
        current = current[segment];
      }
    }
    
    // Return the value from Field<T> structure or direct value
    if (current && typeof current === 'object' && 'value' in current) {
      return current.value;
    }
    
    return current || '';
  }, [section13Data]);
  
  // Handle field value changes
  const handleFieldChange = useCallback((uiPath: string, value: any) => {
    console.log(`📝 Updating field: ${uiPath} = ${value}`);
    
    // Update the field value
    updateFieldValue(uiPath, value);
    
    // Validate after change
    const result = validateSection();
    onValidationChange?.(result.isValid);
  }, [updateFieldValue, validateSection, onValidationChange]);
  
  // Render individual field based on type
  const renderField = (field: any) => {
    const value = getFieldValue(field.uiPath);
    const fieldKey = `${field.pdfFieldId}_${field.page}`;
    
    switch (field.fieldType) {
      case 'checkbox':
        return (
          <div key={fieldKey} className="flex items-center space-x-2 mb-3">
            <input
              type="checkbox"
              id={fieldKey}
              checked={value === true || value === 'true' || value === 'YES'}
              onChange={(e) => handleFieldChange(field.uiPath, e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              data-pdf-field={field.pdfFieldId}
              data-ui-path={field.uiPath}
            />
            <label htmlFor={fieldKey} className="text-sm text-gray-700">
              {field.label || field.uiPath.split('.').pop()}
            </label>
          </div>
        );
      
      case 'select':
        return (
          <div key={fieldKey} className="mb-4">
            <label htmlFor={fieldKey} className="block text-sm font-medium text-gray-700 mb-1">
              {field.label || field.uiPath.split('.').pop()}
            </label>
            <select
              id={fieldKey}
              value={value}
              onChange={(e) => handleFieldChange(field.uiPath, e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              data-pdf-field={field.pdfFieldId}
              data-ui-path={field.uiPath}
            >
              <option value="">-- Select --</option>
              {field.options?.map(option => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </div>
        );
      
      case 'radio':
        return (
          <div key={fieldKey} className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {field.label || field.uiPath.split('.').pop()}
            </label>
            <div className="space-y-2">
              {field.options?.map(option => (
                <label key={option} className="flex items-center space-x-2">
                  <input
                    type="radio"
                    name={fieldKey}
                    value={option}
                    checked={value === option}
                    onChange={(e) => handleFieldChange(field.uiPath, e.target.value)}
                    className="text-blue-600 focus:ring-blue-500"
                    data-pdf-field={field.pdfFieldId}
                    data-ui-path={field.uiPath}
                  />
                  <span className="text-sm text-gray-700">{option}</span>
                </label>
              ))}
            </div>
          </div>
        );
      
      case 'text':
      default:
        // Determine input type based on field name
        const fieldName = field.uiPath.toLowerCase();
        let inputType = 'text';
        if (fieldName.includes('date')) inputType = 'date';
        else if (fieldName.includes('email')) inputType = 'email';
        else if (fieldName.includes('phone') || fieldName.includes('tel')) inputType = 'tel';
        else if (fieldName.includes('zip')) inputType = 'text';
        
        return (
          <div key={fieldKey} className="mb-4">
            <label htmlFor={fieldKey} className="block text-sm font-medium text-gray-700 mb-1">
              {field.label || field.uiPath.split('.').pop()?.replace(/([A-Z])/g, ' $1').trim()}
            </label>
            <input
              type={inputType}
              id={fieldKey}
              value={value}
              onChange={(e) => handleFieldChange(field.uiPath, e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder={field.label}
              data-pdf-field={field.pdfFieldId}
              data-ui-path={field.uiPath}
            />
          </div>
        );
    }
  };
  
  // Group fields by category for better organization
  const renderFieldGroup = (fields: any[], groupName: string) => {
    // Further group by entry index
    const entriesMap = new Map<number, any[]>();
    const generalFields: any[] = [];
    
    fields.forEach(field => {
      const entryMatch = field.uiPath.match(/entries\[(\d+)\]/);
      if (entryMatch) {
        const index = parseInt(entryMatch[1]);
        if (!entriesMap.has(index)) {
          entriesMap.set(index, []);
        }
        entriesMap.get(index)!.push(field);
      } else {
        generalFields.push(field);
      }
    });
    
    return (
      <div className="space-y-6">
        {/* Render general fields first */}
        {generalFields.length > 0 && (
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="text-md font-semibold text-gray-800 mb-3">General Information</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {generalFields.map(field => renderField(field))}
            </div>
          </div>
        )}
        
        {/* Render entry-specific fields */}
        {Array.from(entriesMap.entries()).map(([index, entryFields]) => (
          <div key={`entry-${index}`} className="bg-white border border-gray-200 p-4 rounded-lg">
            <h4 className="text-md font-semibold text-gray-800 mb-3">
              {groupName} Entry #{index + 1}
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {entryFields.map(field => renderField(field))}
            </div>
          </div>
        ))}
      </div>
    );
  };
  
  // Show loading state
  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading Section 13 fields...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      {/* Header with coverage statistics */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Section 13: Employment Activities - Complete Form
        </h2>
        {coverage && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-sm text-blue-800">
              <strong>Field Coverage:</strong> {coverage.loaded} of {coverage.total} fields loaded 
              ({coverage.coverage}%)
            </p>
            {coverage.loaded < coverage.total && (
              <p className="text-xs text-blue-600 mt-1">
                Loading complete field set from server...
              </p>
            )}
          </div>
        )}
      </div>
      
      {/* Employment Type Tabs */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {Object.entries(groupedFields).map(([type, fields]) => (
              <button
                key={type}
                onClick={() => setActiveTab(type)}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === type
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {type.charAt(0).toUpperCase() + type.slice(1).replace(/([A-Z])/g, ' $1')}
                <span className="ml-2 bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs">
                  {fields.length}
                </span>
              </button>
            ))}
          </nav>
        </div>
      </div>
      
      {/* Render active tab fields */}
      <div className="mt-6">
        {groupedFields[activeTab] && (
          renderFieldGroup(groupedFields[activeTab], activeTab)
        )}
      </div>
      
      {/* Debug information */}
      <div className="mt-8 p-4 bg-gray-100 rounded-lg">
        <details>
          <summary className="cursor-pointer text-sm font-medium text-gray-700">
            Debug Information
          </summary>
          <div className="mt-2 text-xs text-gray-600">
            <p>Total Fields Mapped: {fieldMappings.length}</p>
            <p>Active Tab: {activeTab}</p>
            <p>Fields in Active Tab: {groupedFields[activeTab]?.length || 0}</p>
            <pre className="mt-2 bg-white p-2 rounded overflow-auto max-h-40">
              {JSON.stringify(coverage, null, 2)}
            </pre>
          </div>
        </details>
      </div>
    </div>
  );
};

export default Section13CompleteRenderer;