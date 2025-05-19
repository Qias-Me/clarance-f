import React, { useEffect, useState } from 'react';
import { type FormInfo } from "api/interfaces/FormInfo";
import { type PlaceOfBirth } from "api/interfaces/sections/placeOfBirth";
import { StateOptions, CountryOptions } from "api/enums/enums";
import { getFieldsBySection, SortBy } from "app/utils/sectionFieldsExtractor";
import type { FieldMetadata } from "app/utils/fieldHierarchyParser";
import { stripIdSuffix } from "app/utils/fieldHierarchyParser";
import { placeOfBirth as defaultPlaceOfBirth } from "app/state/contexts/sections/placeOfBirth";

interface FormProps {
  data: PlaceOfBirth;
  onInputChange: (path: string, value: any) => void;
  isValidValue: (path: string, value: any) => boolean;
  isReadOnlyField?: (fieldName: string) => boolean;
  path: string;
  formInfo?: FormInfo;
  actionType?: string;
}

const RenderPlaceOfBirth = ({
  data,
  onInputChange,
  isValidValue,
  isReadOnlyField = () => false,
  path,
}: FormProps) => {
  const [sectionFields, setSectionFields] = useState<FieldMetadata[]>([]);
  const placeOfBirth = data as PlaceOfBirth;

  // Load section 3 fields on component mount
  useEffect(() => {
    try {
      // Get all fields for section 3 (Place of Birth)
      const result = getFieldsBySection(3, {
        sortBy: SortBy.LABEL,
        minConfidence: 0.7 // Only include fields with decent confidence
      });
      
      setSectionFields(result.fields);
    } catch (error) {
      console.error('Error loading place of birth fields:', error);
    }
  }, []);

  // Helper function to render the appropriate input based on field type
  const renderField = (field: FieldMetadata) => {
    // Extract field ID without suffix
    const fieldId = stripIdSuffix(field.id);
    
    // Map field names to our interface structure
    // This mapping is needed because field names in field-hierarchy might not exactly match our interface
    const fieldNameMap: Record<string, string> = {
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
    if (mappedFieldKey in placeOfBirth) {
      const typedKey = mappedFieldKey as keyof PlaceOfBirth;
      const fieldObj = placeOfBirth[typedKey];
      if (typeof fieldObj === 'object' && fieldObj !== null && 'value' in fieldObj) {
        currentValue = fieldObj.value || '';
      }
    }
    
    // Determine if field is read-only
    const isReadOnly = isReadOnlyField(fieldPath);
    
    // Render the appropriate field based on type
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
        // Determine which options to use based on the field name
        const isCountryField = mappedFieldKey.toLowerCase().includes('country');
        const isStateField = mappedFieldKey.toLowerCase().includes('state');
        
        const options: Record<string, string> = isCountryField 
          ? CountryOptions 
          : isStateField 
            ? StateOptions 
            : {};
        
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
              <option value="">Select {isCountryField ? 'a country' : isStateField ? 'a state' : 'an option'}</option>
              {Object.entries(options).map(([key, optionValue]) => (
                <option key={key} value={optionValue}>
                  {optionValue}
                </option>
              ))}
            </select>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="p-4 bg-gray-50 rounded-lg shadow space-y-4">
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
            value={placeOfBirth.birthCity.value || ""}
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
            value={placeOfBirth.birthCounty.value || ""}
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
            value={placeOfBirth.birthState.value || ""}
            onChange={(e) => {
              if (isValidValue(`${path}.birthState.value`, e.target.value)) {
                onInputChange(`${path}.birthState.value`, e.target.value);
              }
            }}
            className="mt-1 p-2 w-full border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition duration-150 ease-in-out"
          >
            <option value="">Select a state</option>
            {Object.entries(StateOptions).map(([key, stateValue]) => (
              <option key={key} value={stateValue}>
                {stateValue}
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
            value={placeOfBirth.birthCountry.value || ""}
            onChange={(e) => {
              if (isValidValue(`${path}.birthCountry.value`, e.target.value)) {
                onInputChange(`${path}.birthCountry.value`, e.target.value);
              }
            }}
            className="mt-1 p-2 w-full border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition duration-150 ease-in-out"
          >
            <option value="">Select a country</option>
            {Object.entries(CountryOptions).map(([key, countryValue]) => (
              <option key={key} value={countryValue}>
                {countryValue}
              </option>
            ))}
          </select>
        </div>
      </div>
      
      {/* Render additional fields from field-hierarchy if there are any */}
      <div className="mt-4">
        {sectionFields
          .filter(field => 
            // Filter out fields that are already explicitly rendered
            !['birthCity', 'birthCounty', 'birthState', 'birthCountry', 
              'city_of_birth', 'county_of_birth', 'state_of_birth', 'country_of_birth',
              'birth_city', 'birth_county', 'birth_state', 'birth_country'].includes(
              field.name.split('.').pop()?.replace(/\[\d+\]$/, '') || ''
            )
          )
          .map(field => renderField(field))
        }
      </div>
    </div>
  );
};

export default RenderPlaceOfBirth; 