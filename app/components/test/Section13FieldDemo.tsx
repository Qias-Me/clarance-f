/**
 * Section 13 Field Demonstration Component
 * 
 * This component demonstrates how the Section 13 employment fields
 * should be connected to the field mapping system.
 */

import React, { useState } from 'react';
import { useSection13 } from '~/state/contexts/sections2.0/section13';
import {
  generateMilitaryEmploymentFields,
  generateFederalEmploymentFields,
  generateNonFederalEmploymentFields,
  generateSelfEmploymentFields,
  generateUnemploymentFields
} from '~/state/contexts/sections2.0/section13-field-mapping';

type EmploymentType = 'military' | 'federal' | 'nonFederal' | 'selfEmployment' | 'unemployment';

interface EmploymentEntry {
  id: string;
  type: EmploymentType;
  index: number;
}

export const Section13FieldDemo: React.FC = () => {
  const { section13Data, updateFieldValue, mapPdfFieldToUi } = useSection13();
  const [employmentEntries, setEmploymentEntries] = useState<EmploymentEntry[]>([]);
  const [selectedType, setSelectedType] = useState<EmploymentType>('military');

  // Add new employment entry
  const addEmploymentEntry = () => {
    const newEntry: EmploymentEntry = {
      id: `${selectedType}_${Date.now()}`,
      type: selectedType,
      index: employmentEntries.filter(e => e.type === selectedType).length
    };
    console.log('🔍 Adding employment entry:', newEntry);
    console.log('🔍 Current employment entries before:', employmentEntries);
    setEmploymentEntries([...employmentEntries, newEntry]);
    console.log('🔍 New employment entries array:', [...employmentEntries, newEntry]);
  };

  // Get fields for a specific employment entry
  const getFieldsForEntry = (entry: EmploymentEntry) => {
    console.log('🔍 Getting fields for entry:', entry);
    let fields;
    switch (entry.type) {
      case 'military':
        fields = generateMilitaryEmploymentFields(entry.index);
        break;
      case 'federal':
        fields = generateFederalEmploymentFields(entry.index);
        break;
      case 'nonFederal':
        fields = generateNonFederalEmploymentFields(entry.index);
        break;
      case 'selfEmployment':
        fields = generateSelfEmploymentFields(entry.index);
        break;
      case 'unemployment':
        fields = generateUnemploymentFields(entry.index);
        break;
      default:
        fields = [];
    }
    console.log(`🔍 Generated ${fields.length} fields for ${entry.type} entry:`, fields.slice(0, 3));
    return fields;
  };

  // Render input field based on field type
  const renderField = (field: any, entryId: string) => {
    const fieldId = `${entryId}_${field.uiPath}`;
    const value = section13Data[field.uiPath] || '';

    // Determine field type from the path
    const isDateField = field.uiPath.includes('Date') || field.uiPath.includes('date');
    const isEmailField = field.uiPath.includes('email');
    const isPhoneField = field.uiPath.includes('phone');
    const isSelectField = field.uiPath.includes('state') || field.uiPath.includes('country') || 
                          field.uiPath.includes('branch') || field.uiPath.includes('dischargeType');
    const isCheckbox = field.uiPath.includes('present') || field.uiPath.includes('isDSN') || 
                       field.uiPath.includes('isDay') || field.uiPath.includes('isNight');

    if (isCheckbox) {
      return (
        <label key={fieldId} className="flex items-center space-x-2">
          <input
            type="checkbox"
            id={fieldId}
            data-field-path={field.uiPath}
            data-pdf-field={field.pdfField}
            checked={value === 'true' || value === true}
            onChange={(e) => updateFieldValue(field.uiPath, e.target.checked.toString())}
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <span className="text-sm text-gray-700">
            {field.uiPath.split('.').pop()?.replace(/([A-Z])/g, ' $1').trim()}
          </span>
        </label>
      );
    }

    if (isSelectField) {
      return (
        <div key={fieldId} className="mb-4">
          <label htmlFor={fieldId} className="block text-sm font-medium text-gray-700 mb-1">
            {field.uiPath.split('.').pop()?.replace(/([A-Z])/g, ' $1').trim()}
          </label>
          <select
            id={fieldId}
            data-field-path={field.uiPath}
            data-pdf-field={field.pdfField}
            value={value}
            onChange={(e) => updateFieldValue(field.uiPath, e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select...</option>
            {field.uiPath.includes('state') && (
              <>
                <option value="NC">North Carolina</option>
                <option value="CA">California</option>
                <option value="TX">Texas</option>
                <option value="FL">Florida</option>
                <option value="NY">New York</option>
              </>
            )}
            {field.uiPath.includes('country') && (
              <>
                <option value="United States">United States</option>
                <option value="Canada">Canada</option>
                <option value="Mexico">Mexico</option>
              </>
            )}
            {field.uiPath.includes('branch') && (
              <>
                <option value="Army">Army</option>
                <option value="Navy">Navy</option>
                <option value="Air Force">Air Force</option>
                <option value="Marines">Marines</option>
                <option value="Coast Guard">Coast Guard</option>
                <option value="Space Force">Space Force</option>
              </>
            )}
            {field.uiPath.includes('dischargeType') && (
              <>
                <option value="Honorable">Honorable</option>
                <option value="General">General</option>
                <option value="Other">Other</option>
              </>
            )}
          </select>
        </div>
      );
    }

    return (
      <div key={fieldId} className="mb-4">
        <label htmlFor={fieldId} className="block text-sm font-medium text-gray-700 mb-1">
          {field.uiPath.split('.').pop()?.replace(/([A-Z])/g, ' $1').trim()}
        </label>
        <input
          type={isDateField ? 'date' : isEmailField ? 'email' : isPhoneField ? 'tel' : 'text'}
          id={fieldId}
          data-field-path={field.uiPath}
          data-pdf-field={field.pdfField}
          value={value}
          onChange={(e) => updateFieldValue(field.uiPath, e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder={`Enter ${field.uiPath.split('.').pop()?.replace(/([A-Z])/g, ' $1').trim()}`}
        />
      </div>
    );
  };

  // Group fields by category
  const groupFields = (fields: any[]) => {
    const groups: { [key: string]: any[] } = {};
    
    fields.forEach(field => {
      const pathParts = field.uiPath.split('.');
      // Extract the category (e.g., supervisor, employmentDates, dutyStation)
      const category = pathParts[pathParts.length - 2] || 'general';
      
      if (!groups[category]) {
        groups[category] = [];
      }
      groups[category].push(field);
    });
    
    return groups;
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Section 13: Employment Activities - Field Demonstration
        </h2>
        <p className="text-gray-600">
          This demonstrates how employment fields connect to the PDF mapping system.
        </p>
      </div>

      {/* Employment Type Selector */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Select Employment Type to Add:
        </label>
        <div className="flex space-x-4 mb-4">
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value as EmploymentType)}
            className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="military">Military Employment</option>
            <option value="federal">Federal Employment</option>
            <option value="nonFederal">Non-Federal Employment</option>
            <option value="selfEmployment">Self-Employment</option>
            <option value="unemployment">Unemployment</option>
          </select>
          <button
            onClick={addEmploymentEntry}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Add Employment Entry
          </button>
        </div>
      </div>

      {/* Employment Entries */}
      <div className="space-y-8">
        {console.log('🔍 Rendering employment entries:', employmentEntries)}
        {employmentEntries.map((entry, entryIndex) => {
          console.log('🔍 Processing entry for rendering:', entry, 'at index:', entryIndex);
          const fields = getFieldsForEntry(entry);
          const groupedFields = groupFields(fields);
          console.log('🔍 Grouped fields for entry:', Object.keys(groupedFields), 'Total groups:', Object.keys(groupedFields).length);
          
          return (
            <div key={entry.id} className="border-2 border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                {entry.type.replace(/([A-Z])/g, ' $1').trim()} Employment #{entry.index + 1}
              </h3>
              
              {/* Render fields by group */}
              {Object.entries(groupedFields).map(([groupName, groupFields]) => (
                <div key={groupName} className="mb-6">
                  <h4 className="text-md font-medium text-gray-700 mb-3 capitalize">
                    {groupName.replace(/([A-Z])/g, ' $1').trim()}
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {groupFields.map(field => renderField(field, entry.id))}
                  </div>
                </div>
              ))}
              
              {/* Remove button */}
              <button
                onClick={() => setEmploymentEntries(employmentEntries.filter(e => e.id !== entry.id))}
                className="mt-4 px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600"
              >
                Remove Entry
              </button>
            </div>
          );
        })}
      </div>

      {/* Field Mapping Info */}
      <div className="mt-8 p-4 bg-blue-50 rounded-lg">
        <h3 className="text-sm font-semibold text-blue-900 mb-2">Field Mapping Information</h3>
        <p className="text-sm text-blue-700">
          Each field above is connected to the PDF mapping system:
        </p>
        <ul className="mt-2 text-sm text-blue-600 list-disc list-inside">
          <li>Fields have data-field-path attributes for UI path tracking</li>
          <li>Fields have data-pdf-field attributes for PDF field mapping</li>
          <li>Changes are automatically synced through the Section13 context</li>
          <li>The mapping supports bidirectional data flow (PDF ↔ UI)</li>
        </ul>
      </div>

      {/* Debug Section */}
      <details className="mt-6 p-4 bg-gray-50 rounded-lg">
        <summary className="cursor-pointer text-sm font-medium text-gray-700">
          Debug: Current Section 13 Data
        </summary>
        <pre className="mt-2 text-xs bg-white p-2 rounded border overflow-auto max-h-40">
          {JSON.stringify(section13Data, null, 2)}
        </pre>
      </details>
    </div>
  );
};

export default Section13FieldDemo;