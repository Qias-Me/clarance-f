import React, { useEffect, useState } from 'react';
import { SuffixOptions } from "api/enums/enums";
import type { FormInfo } from "api/interfaces/FormInfo";
import { type PersonalInfo } from "api/interfaces/sections/personalInfo";
import { getFieldsBySection, SortBy } from "app/utils/sectionFieldsExtractor";
import type { FieldMetadata } from "app/utils/fieldHierarchyParser";
import { stripIdSuffix } from "app/utils/fieldHierarchyParser";
import { personalInfo as defaultPersonalInfo } from "app/state/contexts/sections/personalInfo";

type FormProps = {
  data: PersonalInfo;
  onInputChange: (path: string, value: any) => void;
  onAddEntry: (path: string, newItem: any) => void;
  onRemoveEntry: (path: string, index: number) => void;
  isValidValue: (path: string, value: any) => boolean;
  getDefaultNewItem: (itemType: string) => any;
  isReadOnlyField: (fieldName: string) => boolean;
  path: string;
  formInfo: FormInfo;
  actionType?: string;
};

const RenderPersonalInfo = ({
  data,
  isReadOnlyField,
  onInputChange,
  isValidValue,
  path,
}: FormProps) => {
  const [sectionFields, setSectionFields] = useState<FieldMetadata[]>([]);
  const personalInfo = data as PersonalInfo;

  // Load section 1 fields on component mount
  useEffect(() => {
    try {
      // Get all fields for section 1 and sort them by label
      const result = getFieldsBySection(1, {
        sortBy: SortBy.LABEL,
        minConfidence: 0.7 // Only include fields with decent confidence
      });
      
      setSectionFields(result.fields);
    } catch (error) {
      console.error('Error loading personal info fields:', error);
    }
  }, []);

  // Helper function to render the appropriate input based on field type
  const renderField = (field: FieldMetadata) => {
    // Extract field ID without suffix
    const fieldId = stripIdSuffix(field.id);
    
    // Generate path for this field
    const fieldPath = `${path}.${field.name.split('.').pop()?.replace(/\[\d+\]$/, '')}.value`;
    
    // Get current value from the data
    const fieldKey = field.name.split('.').pop()?.replace(/\[\d+\]$/, '');
    
    // Safely access field value if it exists in personalInfo
    let currentValue = '';
    if (fieldKey && fieldKey in personalInfo) {
      const typedKey = fieldKey as keyof PersonalInfo;
      const field = personalInfo[typedKey];
      // Ensure we're accessing a field object with a value property, not a string
      if (typeof field === 'object' && field !== null && 'value' in field) {
        currentValue = field.value || '';
      }
    }
    
    // Determine if field is read-only
    const isReadOnly = isReadOnlyField(fieldPath);
    
    switch (field.type) {
      case 'PDFTextField':
        return (
          <div key={fieldId} className="mb-4">
            <label htmlFor={fieldId} className="block text-sm font-medium text-gray-700">
              {field.label}
            </label>
            <input
              id={fieldId}
              type="text"
              value={currentValue}
              onChange={(e) => {
                if (isValidValue(fieldPath, e.target.value)) {
                  onInputChange(fieldPath, e.target.value);
                }
              }}
              disabled={isReadOnly}
              className="mt-1 p-2 w-full border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition duration-150 ease-in-out"
            />
          </div>
        );
        
      case 'PDFDropdown':
        // Special case for suffix field
        if (field.name.toLowerCase().includes('suffix')) {
          return (
            <div key={fieldId} className="mb-4">
              <label htmlFor={fieldId} className="block text-sm font-medium text-gray-700">
                {field.label}
              </label>
              <select
                id={fieldId}
                value={currentValue}
                onChange={(e) => {
                  if (isValidValue(fieldPath, e.target.value)) {
                    onInputChange(fieldPath, e.target.value);
                  }
                }}
                disabled={isReadOnly}
                className="mt-1 p-2 w-full border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition duration-150 ease-in-out"
              >
                <option value="">Select a suffix</option>
                {Object.entries(SuffixOptions).map(([key, value]) => (
                  <option key={key} value={value}>
                    {value}
                  </option>
                ))}
              </select>
            </div>
          );
        }
        // For other dropdown fields
        return (
          <div key={fieldId} className="mb-4">
            <label htmlFor={fieldId} className="block text-sm font-medium text-gray-700">
              {field.label}
            </label>
            <select
              id={fieldId}
              value={currentValue}
              onChange={(e) => {
                if (isValidValue(fieldPath, e.target.value)) {
                  onInputChange(fieldPath, e.target.value);
                }
              }}
              disabled={isReadOnly}
              className="mt-1 p-2 w-full border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition duration-150 ease-in-out"
            >
              <option value="">Select an option</option>
              <option value="Yes">Yes</option>
              <option value="No">No</option>
            </select>
          </div>
        );
        
      case 'PDFCheckBox':
        return (
          <div key={fieldId} className="mb-4">
            <label htmlFor={fieldId} className="flex items-center">
              <input
                id={fieldId}
                type="checkbox"
                checked={currentValue === 'YES'}
                onChange={(e) => {
                  const newValue = e.target.checked ? 'YES' : 'NO';
                  if (isValidValue(fieldPath, newValue)) {
                    onInputChange(fieldPath, newValue);
                  }
                }}
                disabled={isReadOnly}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="ml-2 text-sm text-gray-700">{field.label}</span>
            </label>
          </div>
        );
        
      case 'PDFRadioButton': 
      case 'PDFRadioGroup':
        return (
          <div key={fieldId} className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {field.label}
            </label>
            <div className="flex space-x-4">
              <label htmlFor={`${fieldId}-yes`} className="flex items-center">
                <input
                  id={`${fieldId}-yes`}
                  type="radio"
                  name={fieldId}
                  value="YES"
                  checked={currentValue === 'YES'}
                  onChange={() => {
                    if (isValidValue(fieldPath, 'YES')) {
                      onInputChange(fieldPath, 'YES');
                    }
                  }}
                  disabled={isReadOnly}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                />
                <span className="ml-2 text-sm text-gray-700">Yes</span>
              </label>
              <label htmlFor={`${fieldId}-no`} className="flex items-center">
                <input
                  id={`${fieldId}-no`}
                  type="radio"
                  name={fieldId}
                  value="NO"
                  checked={currentValue === 'NO'}
                  onChange={() => {
                    if (isValidValue(fieldPath, 'NO')) {
                      onInputChange(fieldPath, 'NO');
                    }
                  }}
                  disabled={isReadOnly}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                />
                <span className="ml-2 text-sm text-gray-700">No</span>
              </label>
            </div>
          </div>
        );
        
      default:
        // Default to text input for any other field types
        return (
          <div key={fieldId} className="mb-4">
            <label htmlFor={fieldId} className="block text-sm font-medium text-gray-700">
              {field.label}
            </label>
            <input
              id={fieldId}
              type="text"
              value={currentValue}
              onChange={(e) => {
                if (isValidValue(fieldPath, e.target.value)) {
                  onInputChange(fieldPath, e.target.value);
                }
              }}
              disabled={isReadOnly}
              className="mt-1 p-2 w-full border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition duration-150 ease-in-out"
            />
          </div>
        );
    }
  };

  return (
    <div className="p-4 bg-gray-50 rounded-lg shadow space-y-4">
      {/* Header section */}
      {personalInfo.applicantID ? (
        <div className="flex justify-between">
          <h3 className="text-lg font-semibold">
            SECTION 1: Personal Information
          </h3>
          <p className="text-xs font-semibold">
            Applicant ID: {personalInfo.applicantID}
          </p>
        </div>
      ) : (
        <div className="text-lg font-semibold">SECTION 1: Personal Information</div>
      )}

      {/* Required fields explicitly rendered */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
            First Name
          </label>
          <input
            id="firstName"
            type="text"
            value={personalInfo.firstName.value || ""}
            onChange={(e) => {
              if (isValidValue(`${path}.firstName.value`, e.target.value)) {
                onInputChange(`${path}.firstName.value`, e.target.value);
              }
            }}
            disabled={isReadOnlyField(`${path}.firstName.value`)}
            className="mt-1 p-2 w-full border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition duration-150 ease-in-out"
          />
        </div>

        <div>
          <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
            Last Name
          </label>
          <input
            id="lastName"
            type="text"
            value={personalInfo.lastName.value || ""}
            onChange={(e) => {
              if (isValidValue(`${path}.lastName.value`, e.target.value)) {
                onInputChange(`${path}.lastName.value`, e.target.value);
              }
            }}
            disabled={isReadOnlyField(`${path}.lastName.value`)}
            className="mt-1 p-2 w-full border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition duration-150 ease-in-out"
          />
        </div>

        <div>
          <label htmlFor="middleName" className="block text-sm font-medium text-gray-700">
            Middle Name
          </label>
          <input
            id="middleName"
            type="text"
            value={personalInfo.middleName.value || ""}
            onChange={(e) => {
              if (isValidValue(`${path}.middleName.value`, e.target.value)) {
                onInputChange(`${path}.middleName.value`, e.target.value);
              }
            }}
            disabled={isReadOnlyField(`${path}.middleName.value`)}
            className="mt-1 p-2 w-full border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition duration-150 ease-in-out"
          />
        </div>

        <div>
          <label htmlFor="suffix" className="block text-sm font-medium text-gray-700">
            Suffix
          </label>
          <select
            id="suffix"
            value={personalInfo.suffix.value || ""}
            onChange={(e) => {
              if (isValidValue(`${path}.suffix.value`, e.target.value)) {
                onInputChange(`${path}.suffix.value`, e.target.value);
              }
            }}
            disabled={isReadOnlyField(`${path}.suffix.value`)}
            className="mt-1 p-2 w-full border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition duration-150 ease-in-out"
          >
            <option value="">Select a suffix</option>
            {Object.entries(SuffixOptions).map(([key, value]) => (
              <option key={key} value={value}>
                {value}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Render additional fields from section 1 */}
      <div className="mt-6 border-t pt-4">
        <h4 className="text-md font-medium mb-4">Additional Information</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {sectionFields
            .filter(field => 
              // Filter out fields that are already explicitly rendered above
              !['firstName', 'lastName', 'middleName', 'suffix'].includes(
                field.name.split('.').pop()?.replace(/\[\d+\]$/, '') || ''
              )
            )
            .map(field => renderField(field))
          }
        </div>
      </div>
    </div>
  );
};

export default RenderPersonalInfo; 