/**
 * SignatureInfoWrapper Component
 * 
 * This component serves as an integration layer between the SignatureInfo context
 * and the RenderSignature component. It provides a unified interface that
 * matches the FormProps requirements, while leveraging the specialized context
 * for managing signature and authorization data.
 * 
 * The wrapper pattern allows the RenderSignature component to remain agnostic
 * about the specific data management implementation (context vs. direct props),
 * enabling flexibility in how form sections are integrated into the larger application.
 */
import React from 'react';
import { SignatureInfoProvider, useSignatureInfo } from './SignatureInfo';
import { RenderSignature } from '../Rendered/RenderSignature';
import { type FormInfo, SuffixOptions } from 'api/interfaces/FormInfo';

/**
 * Inner component that consumes the SignatureInfo context.
 * This separation allows us to use the context hooks within a component
 * that is guaranteed to be within the context provider.
 */
const SignatureInfoContent: React.FC = () => {
  const { 
    signatureInfo, 
    updateSignatureField,
    setInformationRelease,
    setMedicalRelease, 
    setCreditRelease,
    addSection30_1,
    removeSection30_1,
    addSection30_2,
    removeSection30_2,
    addSection30_3,
    removeSection30_3
  } = useSignatureInfo();

  /**
   * Passes input changes from the form to the context.
   * @param path Field path within the signature section
   * @param value New value for the field
   */
  const handleInputChange = (path: string, value: any) => {
    // Handle special release authorization fields
    if (path === 'information.value') {
      setInformationRelease(value);
    } else if (path === 'medical.value') {
      setMedicalRelease(value);
    } else if (path === 'credit.value') {
      setCreditRelease(value); 
    } else {
      // Handle regular field updates
      updateSignatureField(path, value);
    }
  };

  /**
   * Handles adding entries based on their type:
   * - Section 30.1 entries
   * - Section 30.2 entries
   * - Section 30.3 entries
   * 
   * @param path The path indicating what type of entry to add
   * @param newItem The new item data (not used in this implementation)
   */
  const handleAddEntry = (path: string, newItem: any) => {
    if (path.includes('section30_1')) {
      addSection30_1();
    } else if (path.includes('section30_2')) {
      addSection30_2();
    } else if (path.includes('section30_3')) {
      addSection30_3();
    }
  };

  /**
   * Handles removing entries based on their type and index:
   * - Section 30.1 entries
   * - Section 30.2 entries
   * - Section 30.3 entries
   * 
   * @param path The path indicating what type of entry to remove
   * @param index The index of the item to remove
   */
  const handleRemoveEntry = (path: string, index: number) => {
    if (path.includes('section30_1')) {
      removeSection30_1(index);
    } else if (path.includes('section30_2')) {
      removeSection30_2(index);
    } else if (path.includes('section30_3')) {
      removeSection30_3(index);
    }
  };

  /**
   * Always returns true as validation is handled elsewhere.
   * In this implementation, all values are considered valid.
   */
  const isValidValue = (path: string, value: any) => true;

  /**
   * Always returns false as no fields are read-only in the signature section.
   */
  const isReadOnlyField = (fieldName: string) => false;

  /**
   * Provides default form info matching the interface requirements.
   * This isn't directly used by the signature section but is needed
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
    if (itemType === 'signatureInfo.section30_1') {
      return {
        _id: 0,
        fullName: { value: "", id: "", type: "PDFTextField", label: "Full name" },
        dateSigned: { value: "", id: "", type: "PDFDateInput", label: "Date signed" },
        otherNamesUsed: { value: "", id: "", type: "PDFTextField", label: "Other names used" },
        address: {
          street: { value: "", id: "", type: "PDFTextField", label: "Street address" },
          city: { value: "", id: "", type: "PDFTextField", label: "City" },
          state: { value: "", id: "", type: "PDFDropDown", label: "State" },
          zipCode: { value: "", id: "", type: "PDFTextField", label: "ZIP Code" },
          country: { value: "", id: "", type: "PDFDropDown", label: "Country" },
        },
        telephoneFieldNumber: { value: "", id: "", type: "PDFTextField", label: "Telephone number" },
      };
    }
    
    if (itemType === 'signatureInfo.section30_2') {
      return {
        _id: 0,
        fullName: { value: "", id: "", type: "PDFTextField", label: "Full name" },
        dateSigned: { value: "", id: "", type: "PDFDateInput", label: "Date signed" },
        otherNamesUsed: { value: "", id: "", type: "PDFTextField", label: "Other names used" },
        address: {
          street: { value: "", id: "", type: "PDFTextField", label: "Street address" },
          city: { value: "", id: "", type: "PDFTextField", label: "City" },
          state: { value: "", id: "", type: "PDFDropDown", label: "State" },
          zipCode: { value: "", id: "", type: "PDFTextField", label: "ZIP Code" },
          country: { value: "", id: "", type: "PDFDropDown", label: "Country" },
        },
        telephoneFieldNumber: { value: "", id: "", type: "PDFTextField", label: "Telephone number" },
      };
    }
    
    if (itemType === 'signatureInfo.section30_3') {
      return {
        _id: 0,
        fullName: { value: "", id: "", type: "PDFTextField", label: "Full name" },
        dateSigned: { value: "", id: "", type: "PDFDateInput", label: "Date signed" },
      };
    }
    
    return {};
  };

  return (
    <RenderSignature
      data={signatureInfo}
      onInputChange={handleInputChange}
      onAddEntry={handleAddEntry}
      onRemoveEntry={handleRemoveEntry}
      isValidValue={isValidValue}
      getDefaultNewItem={getDefaultNewItem}
      isReadOnlyField={isReadOnlyField}
      path="signatureInfo"
      formInfo={formInfo}
    />
  );
};

/**
 * Wrapper component that provides the SignatureInfo context.
 * This component is the main export and entry point for the signature section.
 * It sets up the context provider and renders the inner content component.
 */
const SignatureInfoWrapper: React.FC = () => {
  return (
    <SignatureInfoProvider>
      <SignatureInfoContent />
    </SignatureInfoProvider>
  );
};

export default SignatureInfoWrapper; 