/// <reference types="jest" />

import { 
  generateFieldId, 
  processEntryFieldIds,
  prepareFormForSubmission,
  prepareFormForStorage,
} from '../formHandler';
import { transformFieldId } from '../forms/FormEntryManager';

// Mock functions to simulate network conditions
const mockOnlineStatus = jest.fn();
Object.defineProperty(navigator, 'onLine', {
  configurable: true,
  get: () => mockOnlineStatus(),
});

// Mock localStorage for offline storage simulation
const mockLocalStorage = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => (key in store ? store[key] : null),
    setItem: (key: string, value: string) => { store[key] = value.toString(); },
    removeItem: (key: string) => { delete store[key]; },
    clear: () => { store = {}; },
    getAllKeys: () => Object.keys(store),
    _getStore: () => store,
  };
})();

// Replace the global localStorage with our mock
Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
  writable: true,
});

describe('Field ID Generation Offline Functionality', () => {
  // Set online status before each test
  beforeEach(() => {
    mockOnlineStatus.mockReturnValue(true);
    localStorage.clear();
  });
  
  describe('Offline ID Generation', () => {
    test('ID generation functions correctly in offline mode', () => {
      // Set navigator.onLine to false to simulate offline
      mockOnlineStatus.mockReturnValue(false);
      
      // Attempt to generate IDs while offline
      const namesInfoId = generateFieldId('9500', 0, 'namesInfo');
      const residencyId = generateFieldId('8500', 0, 'residencyInfo');
      
      // Verify IDs are generated correctly even offline
      expect(namesInfoId).toBe('9500');
      expect(residencyId).toBe('8500');
    });
    
    test('Complex entry processing works offline', () => {
      // Set offline mode
      mockOnlineStatus.mockReturnValue(false);
      
      // Create a test entry
      const testEntry = {
        _id: 1,
        lastName: { id: '9500', value: 'Doe', type: 'PDFTextField', label: 'Last name' },
        firstName: { id: '9501', value: 'John', type: 'PDFTextField', label: 'First name' },
        contact: {
          phone: { id: '9505', value: '123-456-7890', type: 'PDFTextField', label: 'Phone' }
        }
      };
      
      // Process the entry for the second position (index 1)
      const processedEntry = processEntryFieldIds(testEntry, 1, 'namesInfo');
      
      // Verify correct IDs are assigned even offline
      expect(processedEntry.lastName.id).toBe('9486');
      expect(processedEntry.firstName.id).toBe('9487');
      expect(processedEntry.contact.phone.id).toBe('9491');
    });
  });
  
  describe('Form Preparation During Network Changes', () => {
    test('Form can be prepared for submission when going from offline to online', () => {
      // Start offline
      mockOnlineStatus.mockReturnValue(false);
      
      // Create a form while offline
      const offlineForm = {
        namesInfo: {
          hasNames: { id: '9100', value: 'YES', type: 'PDFRadioGroup', label: 'Label' },
          names: [
            {
              lastName: { id: '9500', value: 'Doe', type: 'PDFTextField', label: 'Last name' },
              firstName: { id: '9501', value: 'John', type: 'PDFTextField', label: 'First name' }
            }
          ]
        }
      };
      
      // Store the form in localStorage (simulating offline storage)
      localStorage.setItem('offlineForm', JSON.stringify(offlineForm));
      
      // Now go online
      mockOnlineStatus.mockReturnValue(true);
      
      // Retrieve the form from localStorage
      const retrievedForm = JSON.parse(localStorage.getItem('offlineForm') || '{}');
      
      // Prepare for submission (which would happen when going back online)
      const preparedForm = prepareFormForSubmission(retrievedForm);
      
      // Verify form was prepared correctly with PDF format IDs
      expect(preparedForm.namesInfo.hasNames.id).toBe('9100 0 R');
      expect(preparedForm.namesInfo.names[0].lastName.id).toBe('9500 0 R');
      expect(preparedForm.namesInfo.names[0].firstName.id).toBe('9501 0 R');
    });
    
    test('Form can be converted back to storage format when going offline', () => {
      // Start online with a form prepared for submission
      mockOnlineStatus.mockReturnValue(true);
      
      const onlineForm = {
        namesInfo: {
          hasNames: { id: '9100 0 R', value: 'YES', type: 'PDFRadioGroup', label: 'Label' },
          names: [
            {
              lastName: { id: '9500 0 R', value: 'Doe', type: 'PDFTextField', label: 'Last name' },
              firstName: { id: '9501 0 R', value: 'John', type: 'PDFTextField', label: 'First name' }
            }
          ]
        }
      };
      
      // Now go offline
      mockOnlineStatus.mockReturnValue(false);
      
      // Convert form back to storage format for offline use
      const storageForm = prepareFormForStorage(onlineForm);
      
      // Verify form was converted correctly
      expect(storageForm.namesInfo.hasNames.id).toBe('9100');
      expect(storageForm.namesInfo.names[0].lastName.id).toBe('9500');
      expect(storageForm.namesInfo.names[0].firstName.id).toBe('9501');
      
      // Store for offline use
      localStorage.setItem('offlineStorageForm', JSON.stringify(storageForm));
      
      // Verify it can be retrieved correctly
      const retrievedForm = JSON.parse(localStorage.getItem('offlineStorageForm') || '{}');
      expect(retrievedForm.namesInfo.hasNames.id).toBe('9100');
    });
  });
  
  describe('Offline/Online Synchronization', () => {
    test('IDs remain consistent between online and offline modes', () => {
      // Generate IDs online
      mockOnlineStatus.mockReturnValue(true);
      const onlineIds = {
        namesInfo0: generateFieldId('9500', 0, 'namesInfo'),
        namesInfo1: generateFieldId('9500', 1, 'namesInfo'),
        residencyInfo0: generateFieldId('8500', 0, 'residencyInfo'),
        residencyInfo1: generateFieldId('8500', 1, 'residencyInfo'),
      };
      
      // Generate same IDs offline
      mockOnlineStatus.mockReturnValue(false);
      const offlineIds = {
        namesInfo0: generateFieldId('9500', 0, 'namesInfo'),
        namesInfo1: generateFieldId('9500', 1, 'namesInfo'),
        residencyInfo0: generateFieldId('8500', 0, 'residencyInfo'),
        residencyInfo1: generateFieldId('8500', 1, 'residencyInfo'),
      };
      
      // Verify IDs are identical regardless of online/offline status
      expect(offlineIds.namesInfo0).toBe(onlineIds.namesInfo0);
      expect(offlineIds.namesInfo1).toBe(onlineIds.namesInfo1);
      expect(offlineIds.residencyInfo0).toBe(onlineIds.residencyInfo0);
      expect(offlineIds.residencyInfo1).toBe(onlineIds.residencyInfo1);
    });
    
    test('Form entries processed offline can be properly synced online', () => {
      // Process entries offline
      mockOnlineStatus.mockReturnValue(false);
      
      const templateEntry = {
        _id: 1,
        lastName: { id: '9500', value: '', type: 'PDFTextField', label: 'Last name' },
        firstName: { id: '9501', value: '', type: 'PDFTextField', label: 'First name' },
      };
      
      // Create entries for positions 0, 1, 2 while offline
      const offlineEntries = [
        templateEntry, // Use template for position 0
        processEntryFieldIds(templateEntry, 1, 'namesInfo'),
        processEntryFieldIds(templateEntry, 2, 'namesInfo'),
      ];
      
      // Store the entries offline
      localStorage.setItem('offlineEntries', JSON.stringify(offlineEntries));
      
      // Go online and retrieve
      mockOnlineStatus.mockReturnValue(true);
      const retrievedEntries = JSON.parse(localStorage.getItem('offlineEntries') || '[]');
      
      // Fill in some values in the entries
      retrievedEntries[0].lastName.value = 'Doe';
      retrievedEntries[0].firstName.value = 'John';
      retrievedEntries[1].lastName.value = 'Smith';
      retrievedEntries[1].firstName.value = 'Jane';
      retrievedEntries[2].lastName.value = 'Johnson';
      retrievedEntries[2].firstName.value = 'Bob';
      
      // Create a form with these entries
      const syncedForm = {
        namesInfo: {
          hasNames: { id: '9100', value: 'YES', type: 'PDFRadioGroup', label: 'Label' },
          names: retrievedEntries
        }
      };
      
      // Prepare for online submission
      const submissionForm = prepareFormForSubmission(syncedForm);
      
      // Verify the form maintains correct IDs in PDF format
      expect(submissionForm.namesInfo.names[0].lastName.id).toBe('9500 0 R');
      expect(submissionForm.namesInfo.names[1].lastName.id).toBe('9486 0 R');
      expect(submissionForm.namesInfo.names[2].lastName.id).toBe('9472 0 R');
      
      // Verify values were preserved
      expect(submissionForm.namesInfo.names[0].lastName.value).toBe('Doe');
      expect(submissionForm.namesInfo.names[1].lastName.value).toBe('Smith');
      expect(submissionForm.namesInfo.names[2].lastName.value).toBe('Johnson');
    });
  });
}); 