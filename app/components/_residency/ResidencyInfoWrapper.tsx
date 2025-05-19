/**
 * ResidencyInfoWrapper Component
 * 
 * This component serves as an integration layer between the ResidencyInfo context
 * and the RenderResidencyInfo component. It provides a unified interface that
 * matches the FormProps requirements, while leveraging the specialized context
 * for managing residency data.
 * 
 * The wrapper pattern allows the RenderResidencyInfo component to remain agnostic
 * about the specific data management implementation (context vs. direct props),
 * enabling flexibility in how form sections are integrated into the larger application.
 */
import React from 'react';
import { ResidencyInfoProvider, useResidencyInfo } from './ResidencyInfo';
import { RenderResidencyInfo } from '../Rendered/RenderResidencyInfo';
import { type FormInfo, SuffixOptions } from 'api/interfaces/FormInfo';
import { type ResidencyInfo } from 'api/interfaces/sections/residency';

/**
 * Inner component that consumes the ResidencyInfo context.
 * This separation allows us to use the context hooks within a component
 * that is guaranteed to be within the context provider.
 */
const ResidencyInfoContent: React.FC = () => {
  const { 
    residencyInfo, 
    updateResidencyField,
    addResidence,
    removeResidence,
    addPhone,
    removePhone
  } = useResidencyInfo();

  /**
   * Handles input changes from the form.
   * @param path Field path within the residency section
   * @param value New value for the field
   */
  const handleInputChange = (path: string, value: any) => {
    updateResidencyField(path, value);
  };

  /**
   * Handles adding new entries based on the path.
   * The path is used to determine what type of entry to add.
   * @param path The path indicating what type of entry to add
   * @param newItem The new item data (not used in this implementation)
   */
  const handleAddEntry = (path: string, newItem: any) => {
    if (path === 'residencyInfo') {
      addResidence();
    } else if (path.match(/residencyInfo\[\d+\]\.contact\.phone/)) {
      const match = path.match(/residencyInfo\[(\d+)\]/);
      if (match) {
        const residenceIndex = parseInt(match[1]);
        addPhone(residenceIndex);
      }
    }
  };

  /**
   * Handles removing entries based on the path and index.
   * @param path The path indicating what type of entry to remove
   * @param index The index of the item to remove
   */
  const handleRemoveEntry = (path: string, index: number) => {
    if (path === 'residencyInfo') {
      removeResidence(index);
    } else if (path.match(/residencyInfo\[\d+\]\.contact\.phone/)) {
      const match = path.match(/residencyInfo\[(\d+)\]/);
      if (match) {
        const residenceIndex = parseInt(match[1]);
        removePhone(residenceIndex, index);
      }
    }
  };

  /**
   * Determines if a value is valid.
   * In this implementation, all values are considered valid.
   * @param path The path to the field
   * @param value The value to validate
   * @returns True if the value is valid, false otherwise
   */
  const isValidValue = (path: string, value: any) => true;

  /**
   * Determines if a field is read-only.
   * In this implementation, no fields are read-only.
   * @param fieldName The name of the field
   * @returns True if the field is read-only, false otherwise
   */
  const isReadOnlyField = (fieldName: string) => false;

  /**
   * Provides default form info matching the interface requirements.
   * This isn't directly used by the residency section but is needed
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
    if (itemType === 'residencyInfo') {
      // New residence entry
      return {
        _id: 0,
        residenceStartDate: { value: "", id: "", type: "PDFTextField", label: "Residence Start Date" },
        isStartDateEst: { value: "No", id: "", type: "PDFCheckBox", label: "Estimated Start Date" },
        residenceEndDate: { value: "", id: "", type: "PDFTextField", label: "Residence End Date" },
        isResidenceEndEst: { value: "No", id: "", type: "PDFCheckBox", label: "Estimated End Date" },
        isResidencePresent: { value: "No", id: "", type: "PDFCheckBox", label: "Present" },
        residenceStatus: { value: "1", id: "", type: "PDFRadioGroup", label: "Residence Status" },
        residenceAddress: {
          street: { value: "", id: "", type: "PDFTextField", label: "Street" },
          city: { value: "", id: "", type: "PDFTextField", label: "City" },
          state: { value: "", id: "", type: "PDFDropdown", label: "State" },
          zip: { value: "", id: "", type: "PDFTextField", label: "ZIP Code" },
          country: { value: "", id: "", type: "PDFDropdown", label: "Country" },
          hasAPOOrFPO: { value: "NO", id: "", type: "PDFRadioGroup", label: "Has APO/FPO" }
        },
        contact: {
          lastname: { value: "", id: "", type: "PDFTextField", label: "Last Name" },
          firstname: { value: "", id: "", type: "PDFTextField", label: "First Name" },
          lastContactDate: { value: "", id: "", type: "PDFTextField", label: "Last Contact Date" },
          isLastContactEst: { value: "No", id: "", type: "PDFCheckBox", label: "Estimated Last Contact Date" },
          relationship: {
            checkboxes: [
              { value: "No", id: "", type: "PDFCheckbox", label: "Neighbor" },
              { value: "No", id: "", type: "PDFCheckbox", label: "Friend" },
              { value: "No", id: "", type: "PDFCheckbox", label: "Landlord" },
              { value: "No", id: "", type: "PDFCheckbox", label: "Business associate" },
              { value: "No", id: "", type: "PDFCheckbox", label: "Other" }
            ]
          },
          phone: [{
            _id: 1,
            dontKnowNumber: { value: "No", id: "", type: "PDFCheckBox", label: "Don't Know Number" },
            isInternationalOrDSN: { value: "No", id: "", type: "PDFCheckBox", label: "International or DSN" },
            number: { value: "", id: "", type: "PDFTextField", label: "Phone Number" }
          }],
          email: { value: "", id: "", type: "PDFTextField", label: "Email" },
          dontKnowEmail: { value: "No", id: "", type: "PDFCheckBox", label: "Don't Know Email" }
        }
      };
    } else if (itemType.match(/residencyInfo\[\d+\]\.contact\.phone/)) {
      // New phone entry
      return {
        _id: 0,
        dontKnowNumber: { value: "No", id: "", type: "PDFCheckBox", label: "Don't Know Number" },
        isInternationalOrDSN: { value: "No", id: "", type: "PDFCheckBox", label: "International or DSN" },
        number: { value: "", id: "", type: "PDFTextField", label: "Phone Number" }
      };
    }
    
    // Default empty object
    return {};
  };

  return (
    <RenderResidencyInfo
      data={residencyInfo}
      onInputChange={handleInputChange}
      onAddEntry={handleAddEntry}
      onRemoveEntry={handleRemoveEntry}
      isValidValue={isValidValue}
      getDefaultNewItem={getDefaultNewItem}
      isReadOnlyField={isReadOnlyField}
      path="residencyInfo"
      formInfo={formInfo}
    />
  );
};

/**
 * Wrapper component that provides the ResidencyInfo context.
 * This component is the main export and entry point for the residency section.
 * It sets up the context provider and renders the inner content component.
 */
const ResidencyInfoWrapper: React.FC = () => {
  return (
    <ResidencyInfoProvider>
      <ResidencyInfoContent />
    </ResidencyInfoProvider>
  );
};

export default ResidencyInfoWrapper; 