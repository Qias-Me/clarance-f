import { useSelector } from 'react-redux';
import type { RootState } from '../store';
import { type AknowledgeInfo, type PageSSN } from 'api/interfaces/sections/aknowledgement';
import { useFormActions } from './useFormActions';

/**
 * Custom hook to access and manipulate the Acknowledgement Information and SSN data
 * 
 * @returns Object containing section data and update functions
 */
export const useAcknowledgementInfo = () => {
  const acknowledgementInfo = useSelector((state: RootState) => state.form.sections?.aknowledgementInfo || {});
  const { updateField } = useFormActions();
  
  const sectionPath = 'aknowledgementInfo';
  
  /**
   * Update a specific field in the Acknowledgement section
   * 
   * @param field Field name within the Acknowledgement context
   * @param value New value to set
   */
  const updateAcknowledgementField = (field: keyof AknowledgeInfo, value: any) => {
    updateField(sectionPath, `${field}.value`, value);
  };
  
  /**
   * Set the Social Security Number across all occurrences
   * This updates the main SSN field and all page SSN fields
   * 
   * @param value The Social Security Number
   */
  const setSSN = (value: string) => {
    // Update the main SSN field
    updateField(sectionPath, 'ssn.value', value);
    
    // Update all page SSN fields
    if (acknowledgementInfo.pageSSN && Array.isArray(acknowledgementInfo.pageSSN)) {
      acknowledgementInfo.pageSSN.forEach((_: PageSSN, index: number) => {
        updateField(sectionPath, `pageSSN[${index}].ssn.value`, value);
      });
    }
  };
  
  /**
   * Set the Not Applicable status for SSN
   * 
   * @param value The not applicable status ('Yes' or 'No')
   */
  const setNotApplicable = (value: 'Yes' | 'No') => {
    updateField(sectionPath, 'notApplicable.value', value);
    
    // If marked as not applicable, clear the SSN
    if (value === 'Yes') {
      setSSN('');
    }
  };
  
  /**
   * Set the acknowledgement agreement status
   * 
   * @param value The acknowledgement status ('YES' or 'NO')
   */
  const setAcknowledgement = (value: 'YES' | 'NO') => {
    updateField(sectionPath, 'aknowledge.value', value);
  };
  
  /**
   * Validate the SSN format and check for invalid patterns
   * 
   * @param ssn The Social Security Number to validate
   * @returns Boolean indicating if the SSN is valid
   */
  const validateSSN = (ssn: string): boolean => {
    // Return true if not applicable is set to Yes
    if (acknowledgementInfo.notApplicable?.value === 'Yes') {
      return true;
    }
    
    // SSN is required if not marked as not applicable
    if (!ssn) return false;
    
    // Remove any hyphens or spaces
    const cleanSSN = ssn.replace(/[-\s]/g, '');
    
    // Check if it's 9 digits
    if (!/^\d{9}$/.test(cleanSSN)) {
      return false;
    }

    // Parse the SSN into its components
    const areaNumber = cleanSSN.substring(0, 3);
    const groupNumber = cleanSSN.substring(3, 5);
    const serialNumber = cleanSSN.substring(5, 9);
    
    // Check for invalid area numbers
    if (
      areaNumber === '000' || // 000 is invalid
      areaNumber === '666' || // 666 is invalid (reserved)
      areaNumber.startsWith('9') // 900-999 series is invalid (reserved)
    ) {
      return false;
    }
    
    // Check for invalid group numbers
    if (groupNumber === '00') {
      return false;
    }
    
    // Check for invalid serial numbers
    if (serialNumber === '0000') {
      return false;
    }
    
    // Check for well-known invalid SSNs
    const invalidSSNs = [
      '078051120', // Used in advertisement
      '219099999', // Commonly used fake SSN
      '123456789'  // Sequential digits (often used as fake)
    ];
    
    if (invalidSSNs.includes(cleanSSN)) {
      return false;
    }
    
    return true;
  };
  
  return {
    acknowledgementInfo,
    updateAcknowledgementField,
    setSSN,
    setNotApplicable,
    setAcknowledgement,
    validateSSN
  };
}; 