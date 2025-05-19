import React, { useEffect, useState } from 'react';
import {type FormInfo} from "api/interfaces/FormInfo";
import { type BirthInfo } from "api/interfaces/sections/birthnfo";
import { StateOptions, CountryOptions } from "api/enums/enums";
import { getFieldsBySection, SortBy } from "app/utils/sectionFieldsExtractor";
import type { FieldMetadata } from "app/utils/fieldHierarchyParser";
import { stripIdSuffix } from "app/utils/fieldHierarchyParser";
import { birthInfo as defaultBirthInfo } from "app/state/contexts/sections/birthInfo";

interface FormProps {
  data: BirthInfo;
  onInputChange: (path: string, value: any) => void;
  onAddEntry?: (path: string, newItem: any) => void;
  onRemoveEntry?: (path: string, index: number) => void;
  isValidValue: (path: string, value: any) => boolean;
  getDefaultNewItem?: (itemType: string) => any;
  isReadOnlyField?: (fieldName: string) => boolean;
  path: string;
  formInfo: FormInfo;
  actionType?: string;
}

const RenderBirthInfo = ({
  data,
  onInputChange,
  isValidValue,
  isReadOnlyField = () => false,
  path
}: FormProps) => {
  const [section2Fields, setSection2Fields] = useState<FieldMetadata[]>([]);
  const [section3Fields, setSection3Fields] = useState<FieldMetadata[]>([]);
  const birthInfo = data as BirthInfo;

  // Load section 2 and 3 fields on component mount
  useEffect(() => {
    try {
      // Get all fields for section 2 (Date of Birth)
      const dateResult = getFieldsBySection(2, {
        sortBy: SortBy.LABEL,
        minConfidence: 0.7 // Only include fields with decent confidence
      });
      
      setSection2Fields(dateResult.fields);
      
      // Get all fields for section 3 (Place of Birth)
      const placeResult = getFieldsBySection(3, {
        sortBy: SortBy.LABEL,
        minConfidence: 0.7
      });
      
      setSection3Fields(placeResult.fields);
    } catch (error) {
      console.error('Error loading birth info fields:', error);
    }
  }, []);

  // Helper function to render the appropriate input based on field type
  const renderField = (field: FieldMetadata, sectionNumber: number) => {
    // Extract field ID without suffix
    const fieldId = stripIdSuffix(field.id);
    
    // Map field names to our interface structure
    // This mapping is needed because field names in field-hierarchy might not exactly match our interface
    const fieldNameMap: Record<string, string> = {
      // Common mappings for birth date fields
      'birthDate': 'birthDate',
      'date_of_birth': 'birthDate',
      'dob': 'birthDate',
      'estimate': 'isBirthDateEstimate',
      'birthDateEstimate': 'isBirthDateEstimate',
      
      // Common mappings for birth place fields
      'birthCity': 'birthCity',
      'city_of_birth': 'birthCity',
      'birth_city': 'birthCity',
      'birthCounty': 'birthCounty',
      'county_of_birth': 'birthCounty',
      'birth_county': 'birthCounty',
      'birthState': 'birthState',
      'state_of_birth': 'birthState',
      'birth_state': 'birthState',
      'birthCountry': 'birthCountry',
      'country_of_birth': 'birthCountry',
      'birth_country': 'birthCountry'
    };
    
    // Try to determine the field key from the field name
    const fieldNamePart = field.name.split('.').pop()?.replace(/\[\d+\]$/, '') || '';
    const mappedFieldKey = fieldNameMap[fieldNamePart] || fieldNamePart;
    
    // Generate path for this field
    const fieldPath = `${path}.${mappedFieldKey}.value`;
    
    // Get current value from the data
    let currentValue = '';
    if (mappedFieldKey in birthInfo) {
      const typedKey = mappedFieldKey as keyof BirthInfo;
      const fieldObj = birthInfo[typedKey];
      if (typeof fieldObj === 'object' && fieldObj !== null && 'value' in fieldObj) {
        currentValue = fieldObj.value || '';
      }
    }
    
    // Determine if field is read-only
    const isReadOnly = isReadOnlyField(fieldPath);
    
    switch (field.type) {
      case 'PDFTextField':
        // Special handling for date fields
        if (field.name.toLowerCase().includes('date') || mappedFieldKey === 'birthDate') {
          return (
            <div key={fieldId} className="mb-4">
              <label htmlFor={fieldId} className="block text-sm font-medium text-gray-700">
                {field.label}
              </label>
              <input
                id={fieldId}
                type="date"
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
        
        // Regular text field
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
        // Special case for state field
        if (mappedFieldKey === 'birthState') {
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
                <option value="">Select a state</option>
                {Object.entries(StateOptions).map(([key, value]) => (
                  <option key={key} value={value}>
                    {value}
                  </option>
                ))}
              </select>
            </div>
          );
        }
        
        // Special case for country field
        if (mappedFieldKey === 'birthCountry') {
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
                <option value="">Select a country</option>
                {Object.entries(CountryOptions).map(([key, value]) => (
                  <option key={key} value={value}>
                    {value}
                  </option>
                ))}
              </select>
            </div>
          );
        }
        
        // Generic dropdown for other cases
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
                checked={currentValue === 'Yes'}
                onChange={(e) => {
                  const newValue = e.target.checked ? 'Yes' : 'No';
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
      {/* Date of Birth Section */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-4">SECTION 2: Date of Birth</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Required fields explicitly rendered */}
          <div>
            <label htmlFor="birthDate" className="block text-sm font-medium text-gray-700">
              Date of Birth
            </label>
            <input
              id="birthDate"
              type="date"
              value={birthInfo.birthDate.value || ""}
              onChange={(e) => {
                if (isValidValue(`${path}.birthDate.value`, e.target.value)) {
                  onInputChange(`${path}.birthDate.value`, e.target.value);
                }
              }}
              className="mt-1 p-2 w-full border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition duration-150 ease-in-out"
            />
          </div>
          
          <div className="flex items-center mt-7">
            <input
              id="isBirthDateEstimate"
              type="checkbox"
              checked={birthInfo.isBirthDateEstimate.value === "Yes"}
              onChange={(e) => {
                const newValue = e.target.checked ? "Yes" : "No";
                if (isValidValue(`${path}.isBirthDateEstimate.value`, newValue)) {
                  onInputChange(`${path}.isBirthDateEstimate.value`, newValue);
                }
              }}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="isBirthDateEstimate" className="ml-2 block text-sm text-gray-700">
              Estimated Date
            </label>
          </div>
        </div>
        
        {/* Render additional date of birth fields */}
        <div className="mt-4">
          {section2Fields
            .filter(field => 
              // Filter out fields that are already explicitly rendered
              !['birthDate', 'isBirthDateEstimate', 'date_of_birth', 'estimate'].includes(
                field.name.split('.').pop()?.replace(/\[\d+\]$/, '') || ''
              )
            )
            .map(field => renderField(field, 2))
          }
        </div>
      </div>
      
      {/* Place of Birth Section */}
      <div className="pt-4 border-t border-gray-300">
        <h3 className="text-lg font-semibold mb-4">SECTION 3: Place of Birth</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* City and County */}
          <div>
            <label htmlFor="birthCity" className="block text-sm font-medium text-gray-700">
              City
            </label>
            <input
              id="birthCity"
              type="text"
              value={birthInfo.birthCity.value || ""}
              onChange={(e) => {
                if (isValidValue(`${path}.birthCity.value`, e.target.value)) {
                  onInputChange(`${path}.birthCity.value`, e.target.value);
                }
              }}
              className="mt-1 p-2 w-full border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition duration-150 ease-in-out"
            />
          </div>
          
          <div>
            <label htmlFor="birthCounty" className="block text-sm font-medium text-gray-700">
              County
            </label>
            <input
              id="birthCounty"
              type="text"
              value={birthInfo.birthCounty.value || ""}
              onChange={(e) => {
                if (isValidValue(`${path}.birthCounty.value`, e.target.value)) {
                  onInputChange(`${path}.birthCounty.value`, e.target.value);
                }
              }}
              className="mt-1 p-2 w-full border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition duration-150 ease-in-out"
            />
          </div>
          
          {/* State and Country */}
          <div>
            <label htmlFor="birthState" className="block text-sm font-medium text-gray-700">
              State
            </label>
            <select
              id="birthState"
              value={birthInfo.birthState.value || ""}
              onChange={(e) => {
                if (isValidValue(`${path}.birthState.value`, e.target.value)) {
                  onInputChange(`${path}.birthState.value`, e.target.value);
                }
              }}
              className="mt-1 p-2 w-full border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition duration-150 ease-in-out"
            >
              <option value="">Select a state</option>
              {Object.entries(StateOptions).map(([key, value]) => (
                <option key={key} value={value}>
                  {value}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label htmlFor="birthCountry" className="block text-sm font-medium text-gray-700">
              Country
            </label>
            <select
              id="birthCountry"
              value={birthInfo.birthCountry.value || ""}
              onChange={(e) => {
                if (isValidValue(`${path}.birthCountry.value`, e.target.value)) {
                  onInputChange(`${path}.birthCountry.value`, e.target.value);
                }
              }}
              className="mt-1 p-2 w-full border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition duration-150 ease-in-out"
            >
              <option value="">Select a country</option>
              {Object.entries(CountryOptions).map(([key, value]) => (
                <option key={key} value={value}>
                  {value}
                </option>
              ))}
            </select>
          </div>
        </div>
        
        {/* Render additional place of birth fields */}
        <div className="mt-4">
          {section3Fields
            .filter(field => 
              // Filter out fields that are already explicitly rendered
              !['birthCity', 'birthCounty', 'birthState', 'birthCountry', 
                'city_of_birth', 'county_of_birth', 'state_of_birth', 'country_of_birth',
                'birth_city', 'birth_county', 'birth_state', 'birth_country'].includes(
                field.name.split('.').pop()?.replace(/\[\d+\]$/, '') || ''
              )
            )
            .map(field => renderField(field, 3))
          }
        </div>
      </div>
    </div>
  );
};

export { RenderBirthInfo };
