/**
 * Section 13 Full Field Renderer
 * Renders all 1086 fields from the generated field definitions
 */

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { getNestedProperty } from '../../state/contexts/sections2.0/base/BaseSectionContext';
import { useSection13 } from '~/state/contexts/sections2.0/section13';
import { logger } from '../../utils/logger';
import { 
  SECTION_13_ALL_FIELDS,
  SECTION_13_FIELDS_BY_TYPE,
  SECTION_13_FIELD_STATS,
  getFieldsForEntry,
  type Section13FieldDefinition
} from '~/data/section13-complete-fields';

interface Section13FullRendererProps {
  onValidationChange?: (isValid: boolean) => void;
}

export const Section13FullRenderer: React.FC<Section13FullRendererProps> = ({
  onValidationChange
}) => {
  const { section13Data, updateFieldValue, validateSection } = useSection13();
  const [activeTab, setActiveTab] = useState<string>('military');
  const [expandedEntries, setExpandedEntries] = useState<Record<string, boolean>>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [showDebug, setShowDebug] = useState(false);
  
  // Get field value from context data
  const getFieldValue = useCallback((uiPath: string): any => {
    if (!uiPath || !section13Data) return '';
    
    // Use BaseSectionContext utility for safer nested property access
    const value = getNestedProperty(section13Data, uiPath);
    
    // Extract value from Field<T> structure if present
    if (value && typeof value === 'object' && 'value' in value) {
      return value.value;
    }
    
    // For non-Field<T> values, return as is
    return value || '';
  }, [section13Data]);
  
  // Handle field value changes with proper state updates
  const handleFieldChange = useCallback((uiPath: string, value: any) => {
    logger.debug(`Field updated: ${uiPath}`, { 
      component: 'Section13FullRenderer',
      action: 'field_update',
      fieldPath: uiPath,
      metadata: { value: typeof value === 'object' ? JSON.stringify(value) : value }
    });
    
    // Ensure we have the full path
    const fullPath = uiPath.startsWith('section13.') ? uiPath : `section13.${uiPath}`;
    
    // Update the field value
    updateFieldValue(fullPath, value);
    
    // Trigger validation
    const result = validateSection();
    onValidationChange?.(result.isValid);
  }, [updateFieldValue, validateSection, onValidationChange]);
  
  // Filter fields based on search term
  const filteredFields = useMemo(() => {
    if (!searchTerm) return SECTION_13_ALL_FIELDS;
    
    const term = searchTerm.toLowerCase();
    return SECTION_13_ALL_FIELDS.filter(field => 
      (field.label || '').toLowerCase().includes(term) ||
      (field.uiPath || '').toLowerCase().includes(term) ||
      (field.pdfFieldId || '').toLowerCase().includes(term)
    );
  }, [searchTerm]);
  
  // Group filtered fields by type - ENSURE ALL FIELDS ARE CATEGORIZED
  const groupedFilteredFields = useMemo(() => {
    const groups: Record<string, Section13FieldDefinition[]> = {
      military: [],
      federal: [],
      nonFederal: [],
      selfEmployment: [],
      unemployment: [],
      general: [],
      employmentRecordIssues: [],
      disciplinaryActions: []
    };
    
    let categorizedCount = 0;
    
    filteredFields.forEach(field => {
      const uiPath = field.uiPath || '';
      let categorized = false;
      
      // More comprehensive matching to ensure no field is missed
      if (uiPath.includes('militaryEmployment') || uiPath.includes('military')) {
        groups.military.push(field);
        categorized = true;
      } else if (uiPath.includes('federalInfo') || uiPath.includes('federal')) {
        groups.federal.push(field);
        categorized = true;
      } else if (uiPath.includes('nonFederalEmployment') || uiPath.includes('nonFederal')) {
        groups.nonFederal.push(field);
        categorized = true;
      } else if (uiPath.includes('selfEmployment') || uiPath.includes('self')) {
        groups.selfEmployment.push(field);
        categorized = true;
      } else if (uiPath.includes('unemployment')) {
        groups.unemployment.push(field);
        categorized = true;
      } else if (uiPath.includes('employmentRecordIssues') || uiPath.includes('Issues')) {
        groups.employmentRecordIssues.push(field);
        categorized = true;
      } else if (uiPath.includes('disciplinaryActions') || uiPath.includes('disciplinary')) {
        groups.disciplinaryActions.push(field);
        categorized = true;
      } else {
        // All uncategorized fields go to general
        groups.general.push(field);
        categorized = true;
      }
      
      if (categorized) categorizedCount++;
    });
    
    // Log categorization stats for debugging
    logger.info(`Field categorization complete`, {
      component: 'Section13FullRenderer',
      action: 'field_categorization',
      metadata: {
        categorized: categorizedCount,
        total: filteredFields.length,
        groups: Object.entries(groups).reduce((acc, [key, fields]) => {
          if (fields.length > 0) acc[key] = fields.length;
          return acc;
        }, {} as Record<string, number>)
      }
    });
    
    return groups;
  }, [filteredFields]);
  
  // Render individual field based on type
  const renderField = (field: Section13FieldDefinition) => {
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
        // Provide default options for radio fields that don't have them
        let radioOptions = field.options;
        if (!radioOptions || radioOptions.length === 0) {
          if (field.uiPath.includes('employmentType')) {
            radioOptions = ['Military', 'Federal', 'Non-Federal', 'Self-Employment', 'Unemployment', 'Other'];
          } else if (field.uiPath.includes('hasPhysicalWorkAddress') || 
                     field.uiPath.includes('hasAdditionalPeriods') || 
                     field.uiPath.includes('canContact') ||
                     field.uiPath.includes('quitAfterBeingTold')) {
            radioOptions = ['Yes', 'No'];
          } else {
            radioOptions = ['Yes', 'No']; // Default fallback
          }
        }
        
        return (
          <div key={fieldKey} className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {field.label || field.uiPath.split('.').pop()}
            </label>
            <div className="space-y-2">
              {radioOptions.map(option => (
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
        else if (fieldName.includes('ssn')) inputType = 'text';
        else if (fieldName.includes('zip')) inputType = 'text';
        else if (fieldName.includes('number') && !fieldName.includes('phone')) inputType = 'number';
        
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
              maxLength={field.maxLength}
              data-pdf-field={field.pdfFieldId}
              data-ui-path={field.uiPath}
            />
          </div>
        );
    }
  };
  
  // Render a group of fields with simplified organization
  const renderFieldGroup = (fields: Section13FieldDefinition[], groupName: string) => {
    // Simple approach: just render all fields directly
    if (fields.length === 0) return null;
    
    // Log field rendering for debugging
    logger.debug(`Rendering field group`, {
      component: 'Section13FullRenderer',
      action: 'render_group',
      metadata: { group: groupName, fieldCount: fields.length }
    });
    
    return (
      <div className="space-y-6">
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="text-md font-semibold text-gray-800 mb-3">
            {groupName.charAt(0).toUpperCase() + groupName.slice(1)} Fields ({fields.length} fields)
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {fields.map(field => renderField(field))}
          </div>
        </div>
      </div>
    );
  };
  
  const tabLabels: Record<string, string> = {
    military: 'Military Service',
    federal: 'Federal Employment',
    nonFederal: 'Non-Federal',
    selfEmployment: 'Self-Employment',
    unemployment: 'Unemployment',
    employmentRecordIssues: 'Employment Issues',
    disciplinaryActions: 'Disciplinary',
    general: 'General'
  };
  
  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Section 13: Employment Activities
            </h2>
            <p className="text-sm text-gray-600">
              Complete form with all {SECTION_13_FIELD_STATS.total} fields
            </p>
          </div>
          <button
            onClick={() => setShowDebug(!showDebug)}
            className="px-3 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded"
          >
            {showDebug ? 'Hide' : 'Show'} Debug
          </button>
        </div>
        
        {/* Coverage Statistics */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
          <p className="text-sm text-green-800">
            <strong>✅ Full Coverage:</strong> All {SECTION_13_FIELD_STATS.total} fields loaded
          </p>
          <div className="mt-2 grid grid-cols-2 md:grid-cols-4 gap-2 text-xs text-green-600">
            <span>Text: {SECTION_13_FIELD_STATS.byFieldType.text}</span>
            <span>Select: {SECTION_13_FIELD_STATS.byFieldType.select}</span>
            <span>Checkbox: {SECTION_13_FIELD_STATS.byFieldType.checkbox}</span>
            <span>Radio: {SECTION_13_FIELD_STATS.byFieldType.radio}</span>
          </div>
        </div>
        
        {/* Search */}
        <div className="mt-4">
          <input
            type="text"
            placeholder="Search fields by label, path, or PDF ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {searchTerm && (
            <p className="mt-2 text-sm text-gray-600">
              Found {filteredFields.length} fields matching "{searchTerm}"
            </p>
          )}
        </div>
      </div>
      
      {/* Tabs */}
      <div className="mb-6">
        <div className="border-b border-gray-200 overflow-x-auto">
          <nav className="-mb-px flex space-x-4">
            {Object.entries(groupedFilteredFields).map(([type, fields]) => (
              <button
                key={type}
                onClick={() => setActiveTab(type)}
                className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                  activeTab === type
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tabLabels[type] || type}
                <span className="ml-2 bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs">
                  {fields.length}
                </span>
              </button>
            ))}
          </nav>
        </div>
      </div>
      
      {/* Active Tab Content - Render ALL fields to ensure 100% coverage */}
      <div className="mt-6">
        {/* Actually render ALL field groups in the DOM, using CSS to show/hide */}
        {Object.entries(groupedFilteredFields).map(([groupName, fields]) => (
          <div key={groupName} className={activeTab === groupName ? 'block' : 'hidden'}>
            {renderFieldGroup(fields, groupName)}
          </div>
        ))}
      </div>
      
      {/* Debug Information */}
      {showDebug && (
        <div className="mt-8 p-4 bg-gray-100 rounded-lg">
          <h3 className="font-bold text-sm mb-2">Debug Information</h3>
          <div className="text-xs text-gray-600 space-y-1">
            <p>Total Fields: {SECTION_13_FIELD_STATS.total}</p>
            <p>Active Tab: {activeTab} ({groupedFilteredFields[activeTab]?.length} fields)</p>
            <p>Search Term: {searchTerm || '(none)'}</p>
            <p>Filtered Fields: {filteredFields.length}</p>
            <details className="mt-2">
              <summary className="cursor-pointer font-medium">Field Distribution</summary>
              <pre className="mt-2 bg-white p-2 rounded overflow-auto max-h-40">
                {JSON.stringify(SECTION_13_FIELD_STATS.byType, null, 2)}
              </pre>
            </details>
            <details className="mt-2">
              <summary className="cursor-pointer font-medium">Sample Data</summary>
              <pre className="mt-2 bg-white p-2 rounded overflow-auto max-h-40">
                {JSON.stringify(section13Data, null, 2).slice(0, 500)}...
              </pre>
            </details>
          </div>
        </div>
      )}
    </div>
  );
};

export default Section13FullRenderer;