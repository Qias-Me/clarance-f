/**
 * EmploymentInfoWrapper Component
 * 
 * This component serves as an integration layer between the EmploymentInfo context
 * and the RenderEmploymentInfo component. It provides a unified interface that
 * matches the FormProps requirements, while leveraging the specialized context
 * for managing employment data.
 * 
 * The wrapper pattern allows the RenderEmploymentInfo component to remain agnostic
 * about the specific data management implementation (context vs. direct props),
 * enabling flexibility in how form sections are integrated into the larger application.
 */
import React from 'react';
import { EmploymentInfoProvider, useEmploymentInfo } from './EmploymentInfo';
import { RenderEmploymentInfo } from '../Rendered/RenderEmployementInfo';
import { type FormInfo, SuffixOptions } from 'api/interfaces/FormInfo';
import { type EmploymentInfo } from 'api/interfaces/sections/employmentInfo';

/**
 * Inner component that consumes the EmploymentInfo context.
 * This separation allows us to use the context hooks within a component
 * that is guaranteed to be within the context provider.
 */
const EmploymentInfoContent: React.FC = () => {
  const { 
    employmentInfo, 
    updateEmploymentField,
    addEmployment,
    removeEmployment
  } = useEmploymentInfo();

  /**
   * Handles input changes from the form.
   * @param path Field path within the employment section
   * @param value New value for the field
   */
  const handleInputChange = (path: string, value: any) => {
    updateEmploymentField(path, value);
  };

  /**
   * Handles adding new entries based on the path.
   * The path is used to determine what type of entry to add.
   * @param path The path indicating what type of entry to add
   * @param newItem The new item data (not used in this implementation)
   */
  const handleAddEntry = (path: string, newItem: any) => {
    if (path === 'employmentInfo') {
      addEmployment();
    }
  };

  /**
   * Handles removing entries based on the path and index.
   * @param path The path indicating what type of entry to remove
   * @param index The index of the item to remove
   */
  const handleRemoveEntry = (path: string, index: number) => {
    if (path === 'employmentInfo') {
      removeEmployment(index);
    }
  };

  /**
   * Determines if a field is read-only.
   * In this implementation, no fields are read-only.
   * @param fieldName The name of the field
   * @returns True if the field is read-only, false otherwise
   */
  const isReadOnlyField = (fieldName: string) => false;

  /**
   * Provides default form info matching the interface requirements.
   * This isn't directly used by the employment section but is needed
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
   * Returns appropriate default data for new items.
   * @param itemType The type of item to create defaults for
   * @returns A default data object appropriate for the item type
   */
  const getDefaultNewItem = (itemType: string): any => {
    if (itemType === 'employmentInfo') {
      // New employment entry
      return {
        _id: 0,
        section13A: [
          {
            _id: 1,
            employmentActivity: {
              value: "Active military duty station (Complete 13A.1, 13A.5 and 13A.6)",
              id: "",
              type: "PDFRadioGroup",
              label: "Employment Activity"
            }
          }
        ]
      };
    }
    
    // Default empty object
    return {};
  };

  return (
    <RenderEmploymentInfo
      data={employmentInfo}
      onInputChange={handleInputChange}
      onAddEntry={handleAddEntry}
      onRemoveEntry={handleRemoveEntry}
      getDefaultNewItem={getDefaultNewItem}
      isReadOnlyField={isReadOnlyField}
      path="employmentInfo"
      formInfo={formInfo}
    />
  );
};

/**
 * Wrapper component that provides the EmploymentInfo context.
 * This component is the main export and entry point for the employment section.
 * It sets up the context provider and renders the inner content component.
 */
const EmploymentInfoWrapper: React.FC = () => {
  return (
    <EmploymentInfoProvider>
      <EmploymentInfoContent />
    </EmploymentInfoProvider>
  );
};

export default EmploymentInfoWrapper; 