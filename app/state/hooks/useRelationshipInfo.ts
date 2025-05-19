import { useSelector } from 'react-redux';
import type { RootState } from '../store';
import { type RelationshipInfo, type Section17_1, type Section17_2, type Section17_3 } from 'api/interfaces/sections/relationshipInfo';
import { useFormActions } from './useFormActions';
import { cloneDeep } from 'lodash';
import { relationshipInfo as defaultRelationshipInfo } from '../contexts/sections/relationshipInfo';

/**
 * Custom hook to access and manipulate the Relationship Status (Section 17) data
 * 
 * @returns Object containing section data and update functions
 */
export const useRelationshipInfo = () => {
  const relationshipInfo = useSelector((state: RootState) => state.form.sections?.relationshipInfo || {});
  const { updateField, addEntry, removeEntry } = useFormActions();
  
  const sectionPath = 'relationshipInfo';
  
  /**
   * Update a specific field in the RelationshipInfo section
   * 
   * @param field Field path within the RelationshipInfo context
   * @param value New value to set
   */
  const updateRelationshipField = (field: string, value: any) => {
    updateField(sectionPath, field, value);
  };
  
  /**
   * Set the marital status and update the visible subsections accordingly
   * 
   * @param status The new marital status value
   */
  const setMaritalStatus = (status: string) => {
    updateRelationshipField('currentStatus', status);
    
    // Get the necessary subsections based on the new status
    const necessarySections = getSectionsBasedOnStatus(status);
    
    // Initialize any missing necessary sections
    necessarySections.forEach((section) => {
      if (!relationshipInfo[section]) {
        initializeSection(section);
      }
    });
  };
  
  /**
   * Determine which subsections should be shown based on marital status
   * 
   * @param status The marital status value
   * @returns Array of section keys that should be visible
   */
  const getSectionsBasedOnStatus = (status: string): string[] => {
    switch (status) {
      case "NeverEntered":
        return ["section17_3"];
      case "CurrentlyIn":
        return ["section17_1", "section17_3"];
      case "Separated":
        return ["section17_1", "section17_3"];
      case "Annulled":
        return ["section17_2", "section17_3"];
      case "Divorced":
        return ["section17_2", "section17_3"];
      case "Widowed":
        return ["section17_2", "section17_3"];
      default:
        return [];
    }
  };
  
  /**
   * Initialize a subsection with default values
   * 
   * @param sectionKey The subsection key to initialize (section17_1, section17_2, section17_3)
   */
  const initializeSection = (sectionKey: string) => {
    let defaultSection: any;
    
    // Get default values from the context
    switch (sectionKey) {
      case 'section17_1':
        defaultSection = cloneDeep(defaultRelationshipInfo.section17_1);
        break;
      case 'section17_2':
        defaultSection = cloneDeep(defaultRelationshipInfo.section17_2);
        // If initializing section17_2, ensure it's an array with at least one entry
        if (!Array.isArray(defaultSection)) {
          defaultSection = [{ _id: 1, ...defaultSection }];
        }
        break;
      case 'section17_3':
        defaultSection = cloneDeep(defaultRelationshipInfo.section17_3);
        break;
      default:
        defaultSection = {};
    }
    
    // Update the state with the default section
    updateRelationshipField(sectionKey, defaultSection);
  };
  
  /**
   * Add a new previous marriage entry to section17_2
   */
  const addPreviousMarriage = () => {
    // Ensure section17_2 exists
    if (!relationshipInfo.section17_2) {
      const defaultSection = cloneDeep(defaultRelationshipInfo.section17_2);
      updateRelationshipField('section17_2', defaultSection);
    } else {
      // Use addEntry from useFormActions
      addEntry(`${sectionPath}.section17_2`);
    }
  };
  
  /**
   * Remove a previous marriage entry from section17_2
   * 
   * @param index The index of the entry to remove
   */
  const removePreviousMarriage = (index: number) => {
    removeEntry(`${sectionPath}.section17_2`, index);
  };
  
  /**
   * Add a new cohabitant entry to section17_3
   */
  const addCohabitant = () => {
    // Ensure section17_3 exists and has a cohabitants array
    if (!relationshipInfo.section17_3?.cohabitants) {
      const section17_3 = cloneDeep(relationshipInfo.section17_3 || defaultRelationshipInfo.section17_3);
      if (!section17_3.cohabitants) {
        section17_3.cohabitants = [];
      }
      updateRelationshipField('section17_3', section17_3);
    }
    
    // Add a new cohabitant
    addEntry(`${sectionPath}.section17_3.cohabitants`);
  };
  
  /**
   * Remove a cohabitant entry from section17_3
   * 
   * @param index The index of the entry to remove
   */
  const removeCohabitant = (index: number) => {
    removeEntry(`${sectionPath}.section17_3.cohabitants`, index);
  };
  
  /**
   * Set whether the applicant has a cohabitant
   * 
   * @param hasCohabitant Whether the applicant has a cohabitant
   */
  const setHasCohabitant = (hasCohabitant: "YES" | "NO (If NO, proceed to Section 18)" | string) => {
    // Ensure section17_3 exists
    if (!relationshipInfo.section17_3) {
      initializeSection('section17_3');
    }
    
    updateRelationshipField('section17_3.hasCohabitant.value', hasCohabitant);
    
    // If has cohabitant is YES and no cohabitants array exists, initialize it
    if (hasCohabitant === "YES" && !relationshipInfo.section17_3?.cohabitants) {
      updateRelationshipField('section17_3.cohabitants', []);
    }
  };
  
  /**
   * Set whether spouse information should use current address
   * 
   * @param useCurrentAddress Whether to use current address
   */
  const setUseCurrentAddress = (useCurrentAddress: "Yes" | "No" | string) => {
    if (relationshipInfo.section17_1) {
      updateRelationshipField('section17_1.useMyCurrentAddress.value', useCurrentAddress);
    }
  };
  
  /**
   * Set whether applicant is separated
   * 
   * @param isSeparated Whether applicant is separated
   */
  const setIsSeparated = (isSeparated: "YES " | "NO" | string) => {
    if (relationshipInfo.section17_1) {
      updateRelationshipField('section17_1.isSeperated.value', isSeparated);
    }
  };
  
  return {
    relationshipInfo,
    updateRelationshipField,
    setMaritalStatus,
    getSectionsBasedOnStatus,
    initializeSection,
    addPreviousMarriage,
    removePreviousMarriage,
    addCohabitant,
    removeCohabitant,
    setHasCohabitant,
    setUseCurrentAddress,
    setIsSeparated
  };
}; 