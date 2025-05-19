import { useSelector } from 'react-redux';
import type { RootState } from '../store';
import { type PlaceOfBirth } from 'api/interfaces/sections/placeOfBirth';
import { useFormActions } from './useFormActions';

/**
 * Custom hook to access and manipulate the Place of Birth section data
 * 
 * @returns Object containing section data and update functions
 */
export const usePlaceOfBirth = () => {
  const placeOfBirth = useSelector((state: RootState) => state.form.sections?.placeOfBirth || {});
  const { updateField } = useFormActions();
  
  const sectionPath = 'placeOfBirth';
  
  /**
   * Update a specific field in the Place of Birth section
   * 
   * @param field Field name within the Place of Birth context
   * @param value New value to set
   */
  const updatePlaceOfBirthField = (field: keyof PlaceOfBirth, value: string) => {
    updateField(sectionPath, `${field}.value`, value);
  };
  
  /**
   * Set the birth city
   * 
   * @param value The city of birth
   */
  const setBirthCity = (value: string) => {
    updatePlaceOfBirthField('birthCity', value);
  };
  
  /**
   * Set the birth county
   * 
   * @param value The county of birth
   */
  const setBirthCounty = (value: string) => {
    updatePlaceOfBirthField('birthCounty', value);
  };
  
  /**
   * Set the birth state
   * 
   * @param value The state of birth
   */
  const setBirthState = (value: string) => {
    updatePlaceOfBirthField('birthState', value);
  };
  
  /**
   * Set the birth country
   * 
   * @param value The country of birth
   */
  const setBirthCountry = (value: string) => {
    updatePlaceOfBirthField('birthCountry', value);
  };
  
  return {
    placeOfBirth,
    updatePlaceOfBirthField,
    setBirthCity,
    setBirthCounty,
    setBirthState,
    setBirthCountry
  };
}; 