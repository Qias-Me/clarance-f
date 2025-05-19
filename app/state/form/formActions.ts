import { createAction } from '@reduxjs/toolkit';

/**
 * Redux actions for form state management
 * These actions handle field updates, dynamic entries, and section management
 */

// Action Types
export enum FormActionTypes {
  UPDATE_FIELD = 'form/updateField',
  ADD_ENTRY = 'form/addEntry',
  REMOVE_ENTRY = 'form/removeEntry',
  RESET_SECTION = 'form/resetSection',
}

// Field Update Action
export interface UpdateFieldPayload {
  sectionPath: string;
  fieldPath: string;
  value: any;
}

/**
 * Updates a single form field value
 * @param sectionPath The section containing the field (e.g., 'namesInfo')
 * @param fieldPath The path to the field within the section (e.g., 'names[0].firstName')
 * @param value The new value for the field
 */
export const updateField = createAction<UpdateFieldPayload>(
  FormActionTypes.UPDATE_FIELD
);

// Entry Management Actions
export interface EntryPayload {
  sectionPath: string;
  entryIndex?: number;
  newEntry?: any;
}

/**
 * Adds a new entry to a repeatable section
 * @param sectionPath The section to add an entry to (e.g., 'namesInfo.names')
 * @param newEntry Optional custom entry data (uses template if not provided)
 */
export const addEntry = createAction<EntryPayload>(
  FormActionTypes.ADD_ENTRY
);

/**
 * Removes an entry from a repeatable section
 * @param sectionPath The section containing the entry (e.g., 'namesInfo.names') 
 * @param entryIndex The index of the entry to remove
 */
export const removeEntry = createAction<EntryPayload>(
  FormActionTypes.REMOVE_ENTRY
);

// Section Management Actions
export interface SectionPayload {
  sectionPath: string;
}

/**
 * Resets a section to its initial state
 * @param sectionPath The section to reset (e.g., 'namesInfo')
 */
export const resetSection = createAction<SectionPayload>(
  FormActionTypes.RESET_SECTION
); 