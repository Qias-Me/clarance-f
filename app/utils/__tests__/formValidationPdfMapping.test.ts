/// <reference types="jest" />

import { 
  generateFieldId, 
  processEntryFieldIds,
  prepareFormForSubmission,
  processFormFieldIds
} from '../formHandler';
import { transformFieldId } from '../forms/FormEntryManager';
import { validateNamesInfo } from '../../state/contexts/sections/namesInfo';
import { validateResidencyInfo } from '../../state/contexts/sections/residencyInfo';
import { validateRelativesInfo } from '../../state/contexts/sections/relativesInfo';

describe('Form Validation and PDF Field Mapping', () => {
  describe('Names Section Validation and Mapping', () => {
    test('Valid namesInfo data passes validation', () => {
      const validNamesData = {
        hasNames: {
          value: "YES",
          id: "17241",
          type: "PDFRadioGroup",
          label: "Have you used other names?"
        },
        names: [
          {
            _id: 1,
            lastName: {
              value: "Smith",
              id: "9500",
              type: "PDFTextField",
              label: "Last name"
            },
            firstName: {
              value: "Jane",
              id: "9501",
              type: "PDFTextField",
              label: "First name"
            },
            middleName: {
              value: "Marie",
              id: "9502",
              type: "PDFTextField",
              label: "Middle name"
            },
            startDate: {
              date: {
                value: "2015-01",
                id: "9498",
                type: "PDFTextField",
                label: "From date"
              },
              estimated: {
                value: "NO",
                id: "9493",
                type: "PDFCheckBox",
                label: "Estimate"
              }
            },
            endDate: {
              date: {
                value: "2020-06",
                id: "9497",
                type: "PDFTextField",
                label: "To date"
              },
              estimated: {
                value: "NO",
                id: "9492",
                type: "PDFCheckBox",
                label: "Estimate"
              },
              isPresent: {
                value: "NO",
                id: "9491",
                type: "PDFCheckBox",
                label: "Present"
              }
            },
            isMaidenName: {
              value: "YES",
              id: "17240",
              type: "PDFRadioGroup",
              label: "Is this a maiden name?"
            },
            reasonChanged: {
              value: "Marriage",
              id: "9499",
              type: "PDFTextField",
              label: "Reason changed"
            }
          }
        ]
      };
      
      const result = validateNamesInfo(validNamesData);
      expect(result.isValid).toBe(true);
      expect(result.errors.length).toBe(0);
    });
    
    test('Invalid namesInfo data fails validation with specific errors', () => {
      const invalidNamesData = {
        hasNames: {
          value: "YES",
          id: "17241",
          type: "PDFRadioGroup",
          label: "Have you used other names?"
        },
        names: [
          {
            _id: 1,
            lastName: {
              value: "",  // Empty last name
              id: "9500",
              type: "PDFTextField",
              label: "Last name"
            },
            firstName: {
              value: "",  // Empty first name
              id: "9501",
              type: "PDFTextField",
              label: "First name"
            },
            middleName: {
              value: "",
              id: "9502",
              type: "PDFTextField",
              label: "Middle name"
            },
            startDate: {
              date: {
                value: "invalid-date",  // Invalid date format
                id: "9498",
                type: "PDFTextField",
                label: "From date"
              },
              estimated: {
                value: "NO",
                id: "9493",
                type: "PDFCheckBox",
                label: "Estimate"
              }
            },
            endDate: {
              date: {
                value: "",  // Missing end date
                id: "9497",
                type: "PDFTextField",
                label: "To date"
              },
              estimated: {
                value: "NO",
                id: "9492",
                type: "PDFCheckBox",
                label: "Estimate"
              },
              isPresent: {
                value: "NO",  // Not present, but no end date
                id: "9491",
                type: "PDFCheckBox",
                label: "Present"
              }
            },
            isMaidenName: {
              value: "YES",
              id: "17240",
              type: "PDFRadioGroup",
              label: "Is this a maiden name?"
            },
            reasonChanged: {
              value: "",  // Missing reason
              id: "9499",
              type: "PDFTextField",
              label: "Reason changed"
            }
          }
        ]
      };
      
      const result = validateNamesInfo(invalidNamesData);
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors).toContain("Name entry #1: First name or last name is required.");
      expect(result.errors).toContain("Name entry #1: Start date must be in MM/YYYY or YYYY-MM format.");
      expect(result.errors).toContain("Name entry #1: End date is required when \"Present\" is not selected.");
      expect(result.errors).toContain("Name entry #1: Reason for name change is required.");
    });
    
    test('PDF field ID mapping preserves validation capability for names section', () => {
      // Create valid names data
      const validNamesData = {
        hasNames: {
          value: "YES",
          id: "17241",
          type: "PDFRadioGroup",
          label: "Have you used other names?"
        },
        names: [
          {
            _id: 1,
            lastName: { value: "Smith", id: "9500", type: "PDFTextField", label: "Last name" },
            firstName: { value: "Jane", id: "9501", type: "PDFTextField", label: "First name" }
          },
          {
            _id: 2,
            lastName: { value: "Jones", id: "9486", type: "PDFTextField", label: "Last name" },
            firstName: { value: "Jane", id: "9487", type: "PDFTextField", label: "First name" }
          }
        ]
      };
      
      // Convert to PDF format
      const pdfData = processFormFieldIds(validNamesData, true);
      
      // Verify PDF format IDs
      expect(pdfData.hasNames.id).toBe('17241 0 R');
      expect(pdfData.names[0].lastName.id).toBe('9500 0 R');
      expect(pdfData.names[1].lastName.id).toBe('9486 0 R');
      
      // Convert back to context format
      const contextData = processFormFieldIds(pdfData, false);
      
      // Verify original IDs are restored
      expect(contextData.hasNames.id).toBe('17241');
      expect(contextData.names[0].lastName.id).toBe('9500');
      expect(contextData.names[1].lastName.id).toBe('9486');
      
      // Add fields to make it valid for validation
      contextData.names.forEach((name: any, index: number) => {
        const nameNum = index + 1;
        name.startDate = {
          date: { value: `2010-0${nameNum}`, id: index === 0 ? "9498" : "9484", type: "PDFTextField", label: "From date" },
          estimated: { value: "NO", id: index === 0 ? "9493" : "9479", type: "PDFCheckBox", label: "Estimate" }
        };
        name.endDate = {
          date: { value: `2020-0${nameNum}`, id: index === 0 ? "9497" : "9483", type: "PDFTextField", label: "To date" },
          estimated: { value: "NO", id: index === 0 ? "9492" : "9478", type: "PDFCheckBox", label: "Estimate" },
          isPresent: { value: "NO", id: index === 0 ? "9491" : "9477", type: "PDFCheckBox", label: "Present" }
        };
        name.isMaidenName = { 
          value: "YES", 
          id: index === 0 ? "17240" : "17243", 
          type: "PDFRadioGroup", 
          label: "Is this a maiden name?" 
        };
        name.reasonChanged = { 
          value: "Marriage", 
          id: index === 0 ? "9499" : "9485", 
          type: "PDFTextField", 
          label: "Reason changed" 
        };
      });
      
      // Validate context data after round-trip conversion
      const result = validateNamesInfo(contextData);
      expect(result.isValid).toBe(true);
    });
  });

  describe('Residency Section Validation and Mapping', () => {
    test('Valid residencyInfo data passes validation', () => {
      const validResidencyData = [
        {
          _id: 1,
          residenceStartDate: {
            value: "2018-01",
            id: "9814",
            type: "PDFTextField",
            label: "Start date"
          },
          isStartDateEst: {
            value: "NO",
            id: "9813",
            type: "PDFCheckBox",
            label: "Estimate"
          },
          residenceEndDate: {
            value: "2021-06",
            id: "9812",
            type: "PDFTextField",
            label: "End date"
          },
          isResidenceEndEst: {
            value: "NO",
            id: "9811",
            type: "PDFCheckBox",
            label: "Estimate"
          },
          isResidencePresent: {
            value: "NO",
            id: "9810",
            type: "PDFCheckBox",
            label: "Present"
          },
          residenceStatus: {
            value: "2",
            id: "17200",
            type: "PDFRadioGroup",
            label: "Status"
          },
          residenceAddress: {
            street: {
              value: "123 Main St",
              id: "9804",
              type: "PDFTextField",
              label: "Street"
            },
            city: {
              value: "Springfield",
              id: "9803",
              type: "PDFTextField",
              label: "City"
            },
            state: {
              value: "IL",
              id: "9802",
              type: "PDFDropdown",
              label: "State"
            },
            zip: {
              value: "62701",
              id: "9800",
              type: "PDFTextField",
              label: "ZIP"
            },
            country: {
              value: "United States",
              id: "9801",
              type: "PDFDropdown",
              label: "Country"
            },
            hasAPOOrFPO: {
              value: "NO",
              id: "17201",
              type: "PDFRadioGroup",
              label: "APO/FPO address?"
            }
          },
          contact: {
            firstname: {
              value: "John",
              id: "9797",
              type: "PDFTextField",
              label: "First name"
            },
            lastname: {
              value: "Doe",
              id: "9798",
              type: "PDFTextField",
              label: "Last name"
            }
          }
        }
      ];
      
      const result = validateResidencyInfo(validResidencyData);
      expect(result.isValid).toBe(true);
      expect(result.errors.length).toBe(0);
    });
    
    test('PDF field mapping maintains proper ID patterns for multiple residency entries', () => {
      // Create form with multiple residency entries
      const residencyForm = {
        residencyInfo: [
          {
            _id: 1,
            residenceStartDate: { value: "2018-01", id: "9814", label: "Start date" },
            residenceAddress: {
              street: { value: "123 Main St", id: "9804", label: "Street" },
              city: { value: "Springfield", id: "9803", label: "City" }
            }
          },
          {
            _id: 2,
            residenceStartDate: { value: "2021-01", id: "9802", label: "Start date" },
            residenceAddress: {
              street: { value: "456 Oak Ave", id: "9792", label: "Street" },
              city: { value: "Boston", id: "9791", label: "City" }
            }
          }
        ]
      };
      
      // Convert to PDF format
      const pdfForm = prepareFormForSubmission(residencyForm as any);
      
      // Verify correct PDF ID format
      expect(pdfForm.residencyInfo[0].residenceStartDate.id).toBe('9814 0 R');
      expect(pdfForm.residencyInfo[0].residenceAddress.street.id).toBe('9804 0 R');
      expect(pdfForm.residencyInfo[1].residenceStartDate.id).toBe('9802 0 R');
      expect(pdfForm.residencyInfo[1].residenceAddress.street.id).toBe('9792 0 R');
      
      // Convert back and verify IDs are preserved
      const contextForm = processFormFieldIds(pdfForm, false);
      expect(contextForm.residencyInfo[0].residenceStartDate.id).toBe('9814');
      expect(contextForm.residencyInfo[1].residenceStartDate.id).toBe('9802');
    });
  });
  
  describe('Field ID Generation and Validation Cross-Checking', () => {
    test('Dynamic ID generation preserves field validation patterns', () => {
      // Template entry for names section
      const nameTemplate = {
        _id: 1,
        lastName: { value: "", id: "9500", type: "PDFTextField", label: "Last name" },
        firstName: { value: "", id: "9501", type: "PDFTextField", label: "First name" },
        middleName: { value: "", id: "9502", type: "PDFTextField", label: "Middle name" },
        startDate: {
          date: { value: "", id: "9498", type: "PDFTextField", label: "From date" },
          estimated: { value: "NO", id: "9493", type: "PDFCheckBox", label: "Estimate" }
        },
        endDate: {
          date: { value: "", id: "9497", type: "PDFTextField", label: "To date" },
          estimated: { value: "NO", id: "9492", type: "PDFCheckBox", label: "Estimate" },
          isPresent: { value: "NO", id: "9491", type: "PDFCheckBox", label: "Present" }
        },
        isMaidenName: { value: "NO", id: "17240", type: "PDFRadioGroup", label: "Is this a maiden name?" },
        reasonChanged: { value: "", id: "9499", type: "PDFTextField", label: "Reason changed" }
      };
      
      // Generate entries for indices 1, 2, and 3
      const entry1 = processEntryFieldIds(nameTemplate, 1, 'namesInfo');
      const entry2 = processEntryFieldIds(nameTemplate, 2, 'namesInfo');
      const entry3 = processEntryFieldIds(nameTemplate, 3, 'namesInfo');
      
      // Verify correct IDs for nested fields
      expect(entry1.lastName.id).toBe('9486');
      expect(entry1.firstName.id).toBe('9487');
      expect(entry1.startDate.date.id).toBe('9484');
      
      expect(entry2.lastName.id).toBe('9472');
      expect(entry2.firstName.id).toBe('9473');
      expect(entry2.startDate.date.id).toBe('9470');
      
      expect(entry3.lastName.id).toBe('9458');
      expect(entry3.firstName.id).toBe('9459');
      expect(entry3.startDate.date.id).toBe('9456');
      
      // Create a form with these entries and validate
      const testForm = {
        hasNames: { value: "YES", id: "17241", type: "PDFRadioGroup", label: "Have used other names?" },
        names: [
          {
            ...nameTemplate,
            lastName: { ...nameTemplate.lastName, value: "Doe" },
            firstName: { ...nameTemplate.firstName, value: "John" },
            startDate: { 
              ...nameTemplate.startDate, 
              date: { ...nameTemplate.startDate.date, value: "2010-01" }
            },
            endDate: {
              ...nameTemplate.endDate,
              date: { ...nameTemplate.endDate.date, value: "2015-01" }
            },
            reasonChanged: { ...nameTemplate.reasonChanged, value: "Legal change" }
          },
          {
            ...entry1,
            lastName: { ...entry1.lastName, value: "Smith" },
            firstName: { ...entry1.firstName, value: "Jane" },
            startDate: { 
              ...entry1.startDate, 
              date: { ...entry1.startDate.date, value: "2015-02" }
            },
            endDate: {
              ...entry1.endDate,
              date: { ...entry1.endDate.date, value: "2018-03" }
            },
            reasonChanged: { ...entry1.reasonChanged, value: "Marriage" }
          },
          {
            ...entry2,
            lastName: { ...entry2.lastName, value: "Johnson" },
            firstName: { ...entry2.firstName, value: "Sarah" },
            startDate: { 
              ...entry2.startDate, 
              date: { ...entry2.startDate.date, value: "2018-04" }
            },
            endDate: {
              ...entry2.endDate,
              date: { ...entry2.endDate.date, value: "2020-05" }
            },
            reasonChanged: { ...entry2.reasonChanged, value: "Divorce" }
          }
        ]
      };
      
      // Validate form
      const result = validateNamesInfo(testForm);
      expect(result.isValid).toBe(true);
      expect(result.errors.length).toBe(0);
      
      // Convert to PDF format
      const pdfForm = processFormFieldIds(testForm, true);
      
      // Verify PDF IDs are correct
      expect(pdfForm.names[0].lastName.id).toBe('9500 0 R');
      expect(pdfForm.names[1].lastName.id).toBe('9486 0 R');
      expect(pdfForm.names[2].lastName.id).toBe('9472 0 R');
    });
  });
}); 