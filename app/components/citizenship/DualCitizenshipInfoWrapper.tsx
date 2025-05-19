/**
 * DualCitizenshipInfoWrapper Component
 * 
 * This component serves as an integration layer between the DualCitizenshipInfo context
 * and the RenderDualCitizenshipInfo component. It provides a unified interface that
 * matches the FormProps requirements, while leveraging the specialized context
 * for managing dual citizenship and foreign passport data.
 * 
 * The wrapper pattern allows the RenderDualCitizenshipInfo component to remain agnostic
 * about the specific data management implementation (context vs. direct props),
 * enabling flexibility in how form sections are integrated into the larger application.
 */
import React from 'react';
import { DualCitizenshipInfoProvider, useDualCitizenshipInfo } from './DualCitizenshipInfo';
import { RenderDualCitizenshipInfo } from '../Rendered/RenderDualCitizenship';
import { type FormInfo, SuffixOptions } from 'api/interfaces/FormInfo';

/**
 * Inner component that consumes the DualCitizenshipInfo context.
 * This separation allows us to use the context hooks within a component
 * that is guaranteed to be within the context provider.
 */
const DualCitizenshipInfoContent: React.FC = () => {
  const { 
    dualCitizenshipInfo, 
    updateDualCitizenshipField,
    addCitizenship,
    removeCitizenship,
    addPassport,
    removePassport,
    addPassportUse,
    removePassportUse
  } = useDualCitizenshipInfo();

  /**
   * Passes input changes from the form to the context.
   * @param path Field path within the dual citizenship section
   * @param value New value for the field
   */
  const handleInputChange = (path: string, value: any) => {
    updateDualCitizenshipField(path, value);
  };

  /**
   * Handles adding entries based on their type:
   * - Citizenships
   * - Passports
   * - Passport uses (requires special handling for the passport index)
   * 
   * @param path The path indicating what type of entry to add
   * @param newItem The new item data (not used in this implementation)
   */
  const handleAddEntry = (path: string, newItem: any) => {
    if (path.includes('citizenships')) {
      addCitizenship();
    } else if (path.includes('passports.passportUses')) {
      // Extract passport index from the path (e.g. "dualCitizenshipInfo.passports.0.passportUses")
      const passportPath = path.match(/passports\.(\d+)\.passportUses/);
      if (passportPath && passportPath[1]) {
        const passportIndex = parseInt(passportPath[1], 10);
        addPassportUse(passportIndex);
      }
    } else if (path.includes('passports')) {
      addPassport();
    }
  };

  /**
   * Handles removing entries based on their type and index:
   * - Citizenships
   * - Passports
   * - Passport uses (requires special handling for both passport and use indices)
   * 
   * @param path The path indicating what type of entry to remove
   * @param index The index of the item to remove
   */
  const handleRemoveEntry = (path: string, index: number) => {
    if (path.includes('citizenships')) {
      removeCitizenship(index);
    } else if (path.includes('passports.passportUses')) {
      // Extract passport index from the path (e.g. "dualCitizenshipInfo.passports.0.passportUses")
      const passportPath = path.match(/passports\.(\d+)\.passportUses/);
      if (passportPath && passportPath[1]) {
        const passportIndex = parseInt(passportPath[1], 10);
        removePassportUse(passportIndex, index);
      }
    } else if (path.includes('passports')) {
      removePassport(index);
    }
  };

  /**
   * Always returns true as validation is handled elsewhere.
   * In this implementation, all values are considered valid.
   */
  const isValidValue = (path: string, value: any) => true;

  /**
   * Always returns false as no fields are read-only in the dual citizenship section.
   */
  const isReadOnlyField = (fieldName: string) => false;

  /**
   * Provides default form info matching the interface requirements.
   * This isn't directly used by the dual citizenship section but is needed
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
   * @param itemType The type of item to create defaults for
   * @returns A default data object appropriate for the item type
   */
  const getDefaultNewItem = (itemType: string) => {
    // Based on the itemType, return appropriate default data
    if (itemType === 'dualCitizenshipInfo.citizenships') {
      if (dualCitizenshipInfo.citizenships && dualCitizenshipInfo.citizenships.length > 0) {
        // Return a copy of the first citizenship as a template, but with empty values
        const template = dualCitizenshipInfo.citizenships[0];
        return {
          ...template,
          country: { ...template.country, value: "" },
          howCitizenshipAcquired: { ...template.howCitizenshipAcquired, value: "" },
          citizenshipStart: { ...template.citizenshipStart, value: "" }
        };
      }
      return {};
    }
    
    if (itemType === 'dualCitizenshipInfo.passports') {
      if (dualCitizenshipInfo.passports && dualCitizenshipInfo.passports.length > 0) {
        // Return a copy of the first passport as a template, but with empty values
        const template = dualCitizenshipInfo.passports[0];
        return {
          ...template,
          countryIssued: { ...template.countryIssued, value: "" },
          passportNumber: { ...template.passportNumber, value: "" },
          passportUses: []
        };
      }
      return {};
    }
    
    if (itemType === 'dualCitizenshipInfo.passports.passportUses') {
      if (dualCitizenshipInfo.passports && 
          dualCitizenshipInfo.passports[0]?.passportUses && 
          dualCitizenshipInfo.passports[0].passportUses.length > 0) {
        // Return a copy of the first passport use as a template, but with empty values
        const template = dualCitizenshipInfo.passports[0].passportUses[0];
        return {
          ...template,
          passportCountry: { ...template.passportCountry, value: "" },
          fromDate: { ...template.fromDate, value: "" },
          toDate: { ...template.toDate, value: "" }
        };
      }
      return {};
    }
    
    return {};
  };

  return (
    <RenderDualCitizenshipInfo
      data={dualCitizenshipInfo}
      onInputChange={handleInputChange}
      onAddEntry={handleAddEntry}
      onRemoveEntry={handleRemoveEntry}
      isValidValue={isValidValue}
      getDefaultNewItem={getDefaultNewItem}
      isReadOnlyField={isReadOnlyField}
      path="dualCitizenshipInfo"
      formInfo={formInfo}
    />
  );
};

/**
 * Wrapper component that provides the DualCitizenshipInfo context.
 * This component is the main export and entry point for the dual citizenship section.
 * It sets up the context provider and renders the inner content component.
 */
const DualCitizenshipInfoWrapper: React.FC = () => {
  return (
    <DualCitizenshipInfoProvider>
      <DualCitizenshipInfoContent />
    </DualCitizenshipInfoProvider>
  );
};

export default DualCitizenshipInfoWrapper; 