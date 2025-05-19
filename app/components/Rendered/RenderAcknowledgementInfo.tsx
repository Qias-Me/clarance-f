import React, { useState, useEffect } from 'react';
import { type AknowledgeInfo } from "api/interfaces/sections/aknowledgement"; // Assuming this import path is correct
import { type FormInfo } from "api/interfaces/FormInfo";
import { useAcknowledgementInfo } from '../../state/hooks/useAcknowledgementInfo';

interface FormProps {
  data: AknowledgeInfo; // Use the correct data type
  onInputChange: (path: string, value: any) => void;
  isValidValue: (path: string, value: any) => boolean;
  path: string;
  formInfo: FormInfo;
}

interface SSNValidationState {
  isValid: boolean;
  errorType?: 'empty' | 'format' | 'invalid-area' | 'invalid-group' | 'invalid-serial' | 'known-fake';
}

const RenderAcknowledgementInfo: React.FC<FormProps> = ({
  data,
  onInputChange,
  isValidValue,
  path
}) => {
  const { validateSSN } = useAcknowledgementInfo();
  const [ssnValue, setSSNValue] = useState(data.ssn?.value || '');
  const [validationState, setValidationState] = useState<SSNValidationState>({ isValid: true });
  
  useEffect(() => {
    // When the component mounts or data changes, update the local state
    setSSNValue(data.ssn?.value || '');
    validateSSNInput(data.ssn?.value || '');
  }, [data.ssn?.value]);
  
  // Function to update all SSN fields in the form
  const updateAllSSNFields = (ssnValue: string) => {
    // Update the main SSN field
    onInputChange(`${path}.ssn.value`, ssnValue);
    
    // Update all page SSN fields if they exist
    if (data.pageSSN && Array.isArray(data.pageSSN)) {
      data.pageSSN.forEach((_, index) => {
        onInputChange(`${path}.pageSSN[${index}].ssn.value`, ssnValue);
      });
    }
  };

  // Count total SSN fields for verification
  const totalSSNFields = data.pageSSN ? data.pageSSN.length + 1 : 1; // +1 for the main SSN field

  // Detailed validation to provide specific error messages
  const validateSSNInput = (value: string): SSNValidationState => {
    // If not applicable is selected, SSN is always valid
    if (data.notApplicable.value === "Yes") {
      return { isValid: true };
    }
    
    // SSN is required
    if (!value) {
      return { isValid: false, errorType: 'empty' };
    }
    
    // Check basic format (9 digits)
    const cleanSSN = value.replace(/[-\s]/g, '');
    if (!/^\d{9}$/.test(cleanSSN)) {
      return { isValid: false, errorType: 'format' };
    }
    
    // Check components of the SSN
    const areaNumber = cleanSSN.substring(0, 3);
    const groupNumber = cleanSSN.substring(3, 5);
    const serialNumber = cleanSSN.substring(5, 9);
    
    // Check area number
    if (areaNumber === '000' || areaNumber === '666' || areaNumber.startsWith('9')) {
      return { isValid: false, errorType: 'invalid-area' };
    }
    
    // Check group number
    if (groupNumber === '00') {
      return { isValid: false, errorType: 'invalid-group' };
    }
    
    // Check serial number
    if (serialNumber === '0000') {
      return { isValid: false, errorType: 'invalid-serial' };
    }
    
    // Check known fake SSNs
    const knownFakes = ['078051120', '219099999', '123456789'];
    if (knownFakes.includes(cleanSSN)) {
      return { isValid: false, errorType: 'known-fake' };
    }
    
    return { isValid: true };
  };

  const handleSSNChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setSSNValue(newValue);
    
    // Detailed validation
    const validation = validateSSNInput(newValue);
    setValidationState(validation);
    
    // Simple validation for form submission
    const isValid = validateSSN(newValue);
    
    if (isValidValue(`${path}.ssn.value`, newValue) && isValid) {
      // Update all SSN fields with the same value
      updateAllSSNFields(newValue);
    }
  };

  const handleNotApplicableChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.checked ? "Yes" : "No";
    if (isValidValue(`${path}.notApplicable.value`, newValue)) {
      onInputChange(`${path}.notApplicable.value`, newValue);
      
      // If not applicable is checked, clear the SSN
      if (newValue === "Yes") {
        setSSNValue('');
        updateAllSSNFields('');
        setValidationState({ isValid: true });
      }
    }
  };

  // Get appropriate error message based on validation state
  const getErrorMessage = (): string => {
    if (!validationState.errorType) return '';
    
    switch (validationState.errorType) {
      case 'empty':
        return 'Social Security Number is required';
      case 'format':
        return 'Please enter a valid 9-digit Social Security Number';
      case 'invalid-area':
        return 'The first three digits (area number) are invalid';
      case 'invalid-group':
        return 'The middle two digits (group number) are invalid';
      case 'invalid-serial':
        return 'The last four digits (serial number) are invalid';
      case 'known-fake':
        return 'This appears to be a commonly used fake SSN';
      default:
        return 'Invalid Social Security Number';
    }
  };

  // Format SSN for display (XXX-XX-XXXX)
  const formatSSN = (value: string): string => {
    const digits = value.replace(/\D/g, '');
    
    if (digits.length <= 3) {
      return digits;
    } else if (digits.length <= 5) {
      return `${digits.substring(0, 3)}-${digits.substring(3)}`;
    } else {
      return `${digits.substring(0, 3)}-${digits.substring(3, 5)}-${digits.substring(5, 9)}`;
    }
  };

  return (
    <div className="p-4 bg-gray-50 rounded-lg shadow space-y-4">
      <div className="flex justify-between">
        <h3 className="text-lg font-semibold">Section 4 - Social Security Number</h3>
        <span className="text-sm text-gray-500">Total SSN fields: {totalSSNFields}</span>
      </div>

      <div className="flex items-center space-x-2 mb-4">
        <input
          id="not-applicable-checkbox"
          type="checkbox"
          checked={data.notApplicable.value === "Yes"}
          onChange={handleNotApplicableChange}
          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
        />
        <label htmlFor="not-applicable-checkbox" className="text-sm font-medium text-gray-700">
          Not Applicable
        </label>
      </div>

      <div className="mb-4">
        <label htmlFor="ssn-input" className="block text-sm font-medium text-gray-700 mb-1">
          Social Security Number
        </label>
        <input
          id="ssn-input"
          type="text"
          value={ssnValue}
          onChange={handleSSNChange}
          disabled={data.notApplicable.value === "Yes"}
          placeholder="e.g., 123-45-6789"
          className={`mt-1 block w-full px-3 py-2 border ${
            validationState.isValid ? 'border-gray-300' : 'border-red-500'
          } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
        />
        {!validationState.isValid && ssnValue && data.notApplicable.value !== "Yes" && (
          <p className="mt-1 text-sm text-red-600">
            {getErrorMessage()}
          </p>
        )}
      </div>
      
      <div className="text-xs text-gray-500 mt-4 p-2 border border-gray-200 rounded bg-gray-100">
        <h4 className="font-medium mb-1">Information</h4>
        <p>Your SSN will be used to complete Section 4 and to pre-fill the SSN field at the bottom of each page of the SF-86 form.</p>
        {data.notApplicable.value === "Yes" && (
          <p className="mt-1 italic">Not Applicable has been selected. No SSN will be provided.</p>
        )}
      </div>
    </div>
  );
};

export { RenderAcknowledgementInfo };
