/// <reference types="jest" />

import { 
  generateFieldId, 
  processEntryFieldIds,
  prepareFormForSubmission,
  prepareFormForStorage,
  processFormFieldIds
} from '../formHandler';
import { transformFieldId } from '../forms/FormEntryManager';

describe('Dynamic Field ID PDF Mapping', () => {
  describe('PDF Field ID Format Compatibility', () => {
    test('Generated field IDs can be properly converted to PDF format', () => {
      // Generate IDs for different sections and entries
      const namesInfoId1 = generateFieldId('9500', 0, 'namesInfo');
      const namesInfoId2 = generateFieldId('9500', 1, 'namesInfo');
      const residencyId1 = generateFieldId('8500', 0, 'residencyInfo');
      const residencyId2 = generateFieldId('8500', 1, 'residencyInfo');
      
      // Convert to PDF format
      const pdfNamesInfoId1 = transformFieldId.toPdfFormat(namesInfoId1);
      const pdfNamesInfoId2 = transformFieldId.toPdfFormat(namesInfoId2);
      const pdfResidencyId1 = transformFieldId.toPdfFormat(residencyId1);
      const pdfResidencyId2 = transformFieldId.toPdfFormat(residencyId2);
      
      // Verify correct PDF format
      expect(pdfNamesInfoId1).toBe('9500 0 R');
      expect(pdfNamesInfoId2).toBe('9486 0 R');
      expect(pdfResidencyId1).toBe('8500 0 R');
      expect(pdfResidencyId2).toBe('8488 0 R');
      
      // Verify they can be converted back
      expect(transformFieldId.toContextFormat(pdfNamesInfoId1)).toBe('9500');
      expect(transformFieldId.toContextFormat(pdfNamesInfoId2)).toBe('9486');
    });
    
    test('processFormFieldIds correctly processes dynamic field IDs for PDF submission', () => {
      // Create a form with dynamic entries
      const testForm = {
        namesInfo: {
          hasNames: { id: '9100', value: 'YES' },
          names: [
            {
              firstName: { id: '9501', value: 'John' },
              lastName: { id: '9500', value: 'Doe' }
            },
            {
              firstName: { id: '9487', value: 'Jane' },
              lastName: { id: '9486', value: 'Smith' }
            }
          ]
        }
      };
      
      // Process for PDF submission
      const pdfForm = processFormFieldIds(testForm, true);
      
      // Verify all IDs are in PDF format
      expect(pdfForm.namesInfo.hasNames.id).toBe('9100 0 R');
      expect(pdfForm.namesInfo.names[0].firstName.id).toBe('9501 0 R');
      expect(pdfForm.namesInfo.names[0].lastName.id).toBe('9500 0 R');
      expect(pdfForm.namesInfo.names[1].firstName.id).toBe('9487 0 R');
      expect(pdfForm.namesInfo.names[1].lastName.id).toBe('9486 0 R');
      
      // Process back to context format
      const contextForm = processFormFieldIds(pdfForm, false);
      
      // Verify conversion back to context format
      expect(contextForm.namesInfo.hasNames.id).toBe('9100');
      expect(contextForm.namesInfo.names[0].firstName.id).toBe('9501');
      expect(contextForm.namesInfo.names[0].lastName.id).toBe('9500');
      expect(contextForm.namesInfo.names[1].firstName.id).toBe('9487');
      expect(contextForm.namesInfo.names[1].lastName.id).toBe('9486');
    });
  });
  
  describe('Form Preparation for Submission', () => {
    test('prepareFormForSubmission correctly handles dynamic entries', () => {
      // Create a complex form with dynamic entries and nested fields
      const complexForm = {
        namesInfo: {
          hasNames: { id: '9100', value: 'YES' },
          names: [
            {
              firstName: { id: '9501', value: 'John' },
              lastName: { id: '9500', value: 'Doe' },
              middleName: { id: '9502', value: 'Michael' }
            },
            {
              firstName: { id: '9487', value: 'Jane' },
              lastName: { id: '9486', value: 'Smith' },
              middleName: { id: '9488', value: 'Marie' }
            }
          ]
        },
        residencyInfo: {
          hasResidences: { id: '8100', value: 'YES' },
          entries: [
            {
              street: { id: '8501', value: '123 Main St' },
              city: { id: '8502', value: 'Anytown' }
            },
            {
              street: { id: '8489', value: '456 Oak Ave' },
              city: { id: '8490', value: 'Springfield' }
            }
          ]
        }
      };
      
      // Process for PDF submission
      const pdfForm = prepareFormForSubmission(complexForm as any);
      
      // Check namesInfo section
      expect(pdfForm.namesInfo.hasNames.id).toBe('9100 0 R');
      expect(pdfForm.namesInfo.names[0].firstName.id).toBe('9501 0 R');
      expect(pdfForm.namesInfo.names[0].lastName.id).toBe('9500 0 R');
      expect(pdfForm.namesInfo.names[0].middleName.id).toBe('9502 0 R');
      expect(pdfForm.namesInfo.names[1].firstName.id).toBe('9487 0 R');
      expect(pdfForm.namesInfo.names[1].lastName.id).toBe('9486 0 R');
      expect(pdfForm.namesInfo.names[1].middleName.id).toBe('9488 0 R');
      
      // Check residencyInfo section
      expect(pdfForm.residencyInfo.hasResidences.id).toBe('8100 0 R');
      expect(pdfForm.residencyInfo.entries[0].street.id).toBe('8501 0 R');
      expect(pdfForm.residencyInfo.entries[0].city.id).toBe('8502 0 R');
      expect(pdfForm.residencyInfo.entries[1].street.id).toBe('8489 0 R');
      expect(pdfForm.residencyInfo.entries[1].city.id).toBe('8490 0 R');
      
      // Process back to context format
      const contextForm = prepareFormForStorage(pdfForm as any);
      
      // Verify conversion back to context format
      expect(contextForm.namesInfo.hasNames.id).toBe('9100');
      expect(contextForm.namesInfo.names[0].firstName.id).toBe('9501');
      expect(contextForm.namesInfo.names[1].lastName.id).toBe('9486');
      expect(contextForm.residencyInfo.entries[1].city.id).toBe('8490');
    });
  });
  
  describe('Generated ID Pattern Verification', () => {
    test('Generated IDs follow the correct section-specific patterns', () => {
      // Test pattern for namesInfo (section 5)
      expect(generateFieldId('9500', 0, 'namesInfo')).toBe('9500');
      expect(generateFieldId('9500', 1, 'namesInfo')).toBe('9486');
      expect(generateFieldId('9500', 2, 'namesInfo')).toBe('9472');
      expect(generateFieldId('9500', 3, 'namesInfo')).toBe('9458');
      
      // Test pattern for residencyInfo (section 11)
      expect(generateFieldId('8500', 0, 'residencyInfo')).toBe('8500');
      expect(generateFieldId('8500', 1, 'residencyInfo')).toBe('8488');
      expect(generateFieldId('8500', 2, 'residencyInfo')).toBe('8476');
      
      // Test pattern for employmentInfo (section 13)
      expect(generateFieldId('7500', 0, 'employmentInfo')).toBe('7500');
      expect(generateFieldId('7500', 1, 'employmentInfo')).toBe('7490');
      expect(generateFieldId('7500', 2, 'employmentInfo')).toBe('7480');
      
      // Test pattern for relativesInfo (section 18)
      expect(generateFieldId('6500', 0, 'relativesInfo')).toBe('6500');
      expect(generateFieldId('6500', 1, 'relativesInfo')).toBe('6484');
      expect(generateFieldId('6500', 2, 'relativesInfo')).toBe('6468');
    });
    
    test('Generated IDs maintain correct offset patterns between related fields', () => {
      // Check that related fields maintain their relative positions in new entries
      
      // First entry - original IDs
      const firstName1 = '9501';
      const lastName1 = '9500';
      const middleName1 = '9502';
      
      // Calculate the expected IDs for the second entry
      const firstName2 = generateFieldId(firstName1, 1, 'namesInfo');
      const lastName2 = generateFieldId(lastName1, 1, 'namesInfo');
      const middleName2 = generateFieldId(middleName1, 1, 'namesInfo');
      
      // Verify the offsets between related fields are preserved
      // Original offset: firstName1(9501) - lastName1(9500) = 1
      // This should remain the same in the second entry
      expect(parseInt(firstName2) - parseInt(lastName2)).toBe(1);
      
      // Original offset: middleName1(9502) - firstName1(9501) = 1
      // This should remain the same in the second entry
      expect(parseInt(middleName2) - parseInt(firstName2)).toBe(1);
      
      // Verify the patterns hold for the third entry as well
      const firstName3 = generateFieldId(firstName1, 2, 'namesInfo');
      const lastName3 = generateFieldId(lastName1, 2, 'namesInfo');
      const middleName3 = generateFieldId(middleName1, 2, 'namesInfo');
      
      expect(parseInt(firstName3) - parseInt(lastName3)).toBe(1);
      expect(parseInt(middleName3) - parseInt(firstName3)).toBe(1);
    });
  });
  
  describe('Complex Form Structure Processing', () => {
    test('processEntryFieldIds handles complex nested form structures', () => {
      // Create a complex entry structure with nested fields
      const templateEntry = {
        _id: 1,
        person: {
          name: {
            firstName: { id: '9501', value: '', type: 'text', label: 'First Name' },
            lastName: { id: '9500', value: '', type: 'text', label: 'Last Name' },
            middleName: { id: '9502', value: '', type: 'text', label: 'Middle Name' }
          },
          contact: {
            phone: { id: '9505', value: '', type: 'text', label: 'Phone' },
            email: { id: '9506', value: '', type: 'text', label: 'Email' }
          }
        },
        address: {
          home: {
            street: { id: '9510', value: '', type: 'text', label: 'Street' },
            city: { id: '9511', value: '', type: 'text', label: 'City' },
            state: { id: '9512', value: '', type: 'text', label: 'State' }
          }
        }
      };
      
      // Process for second entry (index 1)
      const processedEntry = processEntryFieldIds(templateEntry, 1, 'namesInfo');
      
      // Verify _id is preserved
      expect(processedEntry._id).toBe(1);
      
      // Verify all field IDs are adjusted correctly
      expect(processedEntry.person.name.firstName.id).toBe('9487');
      expect(processedEntry.person.name.lastName.id).toBe('9486');
      expect(processedEntry.person.name.middleName.id).toBe('9488');
      expect(processedEntry.person.contact.phone.id).toBe('9491');
      expect(processedEntry.person.contact.email.id).toBe('9492');
      expect(processedEntry.address.home.street.id).toBe('9496');
      expect(processedEntry.address.home.city.id).toBe('9497');
      expect(processedEntry.address.home.state.id).toBe('9498');
      
      // Verify field types and labels are preserved
      expect(processedEntry.person.name.firstName.type).toBe('text');
      expect(processedEntry.person.name.firstName.label).toBe('First Name');
      expect(processedEntry.address.home.street.label).toBe('Street');
    });
  });
}); 