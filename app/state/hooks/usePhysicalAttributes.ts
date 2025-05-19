import { useSelector } from 'react-redux';
import type { RootState } from '../store';
import type { PhysicalAttributes } from 'api/interfaces/sections/physicalAttributes';
import { useFormActions } from './useFormActions';

/**
 * Custom hook to access and manipulate Physical Attributes data (Section 6)
 * 
 * @returns Object containing section data and update functions
 */
export const usePhysicalAttributes = () => {
  const physicalAttributes = useSelector((state: RootState) => state.form.sections?.physicalAttributes || {});
  const { updateField } = useFormActions();
  
  const sectionPath = 'physicalAttributes';
  
  /**
   * Update a specific field in the Physical Attributes section
   * 
   * @param field Field name within the Physical Attributes context
   * @param value New value to set
   */
  const updatePhysicalAttributesField = (field: keyof PhysicalAttributes, value: any) => {
    updateField(sectionPath, `${field}.value`, value);
  };

  /**
   * Set the height in feet
   * 
   * @param feet Height in feet (1-9)
   */
  const setHeightFeet = (feet: string) => {
    updatePhysicalAttributesField('heightFeet', feet);
  };

  /**
   * Set the height in inches
   * 
   * @param inches Height in inches (0-11)
   */
  const setHeightInch = (inches: string) => {
    updatePhysicalAttributesField('heightInch', inches);
  };

  /**
   * Set the weight in pounds
   * 
   * @param pounds Weight in pounds
   */
  const setWeight = (pounds: string) => {
    updatePhysicalAttributesField('weight', pounds);
  };

  /**
   * Set the hair color
   * 
   * @param color Hair color
   */
  const setHairColor = (color: string) => {
    updatePhysicalAttributesField('hairColor', color);
  };

  /**
   * Set the eye color
   * 
   * @param color Eye color
   */
  const setEyeColor = (color: string) => {
    updatePhysicalAttributesField('eyeColor', color);
  };

  /**
   * Set the gender
   * 
   * @param gender Gender ('Male' or 'Female')
   */
  const setGender = (gender: string) => {
    updatePhysicalAttributesField('gender', gender);
  };

  /**
   * Validate the weight value
   * 
   * @param weight Weight value to validate
   * @returns Boolean indicating if the weight is valid
   */
  const validateWeight = (weight: string): boolean => {
    // Weight should be a number greater than 0
    const weightNumber = Number(weight);
    return !isNaN(weightNumber) && weightNumber > 0 && weightNumber < 1000;
  };

  return {
    physicalAttributes,
    updatePhysicalAttributesField,
    setHeightFeet,
    setHeightInch,
    setWeight,
    setHairColor,
    setEyeColor,
    setGender,
    validateWeight
  };
}; 