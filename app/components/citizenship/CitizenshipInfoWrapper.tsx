/**
 * CitizenshipInfoWrapper Component
 * 
 * This component serves as an integration layer between the CitizenshipInfo context
 * and the RenderCitizenshipInfo component. It provides a unified interface that
 * matches the FormProps requirements, while leveraging the specialized context
 * for managing citizenship data.
 * 
 * The wrapper pattern allows the RenderCitizenshipInfo component to remain agnostic
 * about the specific data management implementation (context vs. direct props),
 * enabling flexibility in how form sections are integrated into the larger application.
 */
import React from 'react';
import { CitizenshipInfoProvider, useCitizenshipInfo } from './CitizenshipInfo';
import { RenderCitizenshipInfo } from '../Rendered/RenderCitizenshipInfo';
import { type FormInfo, SuffixOptions } from 'api/interfaces/FormInfo';

/**
 * Inner component that consumes the CitizenshipInfo context.
 * This separation allows us to use the context hooks within a component
 * that is guaranteed to be within the context provider.
 */
const CitizenshipInfoContent: React.FC = () => {
  const { 
    citizenshipInfo, 
    updateCitizenshipField, 
    setCitizenshipStatus 
  } = useCitizenshipInfo();

  /**
   * Passes input changes from the form to the context.
   * @param path Field path within the citizenship section
   * @param value New value for the field
   */
  const handleInputChange = (path: string, value: any) => {
    updateCitizenshipField(path, value);
  };

  /**
   * Stub for adding entries (not needed for CitizenshipInfo but required by interface).
   * This section doesn't use dynamic entries, but the function is required by the FormProps interface.
   */
  const handleAddEntry = (path: string, newItem: any) => {
    console.log('Add entry not implemented for CitizenshipInfo', path, newItem);
  };

  /**
   * Stub for removing entries (not needed for CitizenshipInfo but required by interface).
   * This section doesn't use dynamic entries, but the function is required by the FormProps interface.
   */
  const handleRemoveEntry = (path: string, index: number) => {
    console.log('Remove entry not implemented for CitizenshipInfo', path, index);
  };

  /**
   * Always returns true as validation is handled elsewhere.
   * In this implementation, all values are considered valid.
   */
  const isValidValue = (path: string, value: any) => true;

  /**
   * Always returns false as no fields are read-only in the citizenship section.
   */
  const isReadOnlyField = (fieldName: string) => false;

  /**
   * Provides default form info matching the interface requirements.
   * This isn't directly used by the citizenship section but is needed
   * to satisfy the FormProps interface.
   */
  const formInfo: FormInfo = {
    employee_id: {
      value: 0,
      id: "employee_id",
      type: "number",
      label: "Employee ID"
    },
    suffix: SuffixOptions.None
  };

  /**
   * Returns appropriate default data for new items based on the item type.
   * While not actively used for adding items, this function provides defaults
   * when resetting sections or initializing empty data structures.
   * @param itemType The type of item to create defaults for
   * @returns A default data object appropriate for the item type
   */
  const getDefaultNewItem = (itemType: string) => {
    // Based on the itemType, return appropriate default data
    if (itemType === 'citizenshipInfo.section9_1') {
      return citizenshipInfo.section9_1 || {};
    }
    if (itemType === 'citizenshipInfo.section9_2') {
      return citizenshipInfo.section9_2 || {};
    }
    if (itemType === 'citizenshipInfo.section9_3') {
      return citizenshipInfo.section9_3 || {};
    }
    if (itemType === 'citizenshipInfo.section9_4') {
      return citizenshipInfo.section9_4 || {};
    }
    
    return {};
  };

  return (
    <RenderCitizenshipInfo
      data={citizenshipInfo}
      onInputChange={handleInputChange}
      onAddEntry={handleAddEntry}
      onRemoveEntry={handleRemoveEntry}
      isValidValue={isValidValue}
      getDefaultNewItem={getDefaultNewItem}
      isReadOnlyField={isReadOnlyField}
      path="citizenshipInfo"
      formInfo={formInfo}
    />
  );
};

/**
 * Wrapper component that provides the CitizenshipInfo context.
 * This component is the main export and entry point for the citizenship section.
 * It sets up the context provider and renders the inner content component.
 */
const CitizenshipInfoWrapper: React.FC = () => {
  return (
    <CitizenshipInfoProvider>
      <CitizenshipInfoContent />
    </CitizenshipInfoProvider>
  );
};

export default CitizenshipInfoWrapper; 