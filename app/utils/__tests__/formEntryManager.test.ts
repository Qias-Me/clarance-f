/// <reference types="jest" />

import { FormEntryManager } from '../forms/FormEntryManager';
import { EntryKeyManager } from '../forms/EntryKeyManager';
import type { Mock } from 'jest-mock';

// Mock console functions to prevent clutter during tests
global.console.error = jest.fn();
global.console.warn = jest.fn();

describe('FormEntryManager', () => {
  describe('Dynamic Entry Management', () => {
    // Test data setup
    let formData: any;
    let contextData: any;
    let onInputChangeMock: jest.Mock;
    let dataMapper: any;

    beforeEach(() => {
      // Reset mocks
      (console.error as jest.Mock).mockClear();
      (console.warn as jest.Mock).mockClear();
      
      // Initialize form data with both simple and complex section structures
      formData = {
        // Names section with a flag and nested entries
        namesInfo: {
          hasNames: { value: 'YES' },
          names: [
            {
              _id: 1,
              firstName: { value: 'John' },
              lastName: { value: 'Doe' }
            }
          ]
        },
        // Residency section as an array directly
        residencyInfo: [
          {
            _id: 1,
            residenceStartDate: { value: '2020-01-01' },
            residenceEndDate: { value: '2022-01-01' },
            residenceAddress: {
              street: { value: '123 Main St' },
              city: { value: 'Anytown' },
              state: { value: 'CA' },
              zipcode: { value: '12345' },
              hasAPOOrFPO: { value: 'NO' }
            }
          }
        ],
        // Empty section to test initialization
        contactInfo: {
          hasContactNumbers: { value: 'NO' },
          contactNumbers: []
        }
      };
      
      // Context data with templates for creating new entries
      contextData = {
        namesInfo: {
          names: [
            {
              _id: 1, // Used for template entry 1
              firstName: { value: '' },
              lastName: { value: '' },
              startDate: {
                date: { value: '' },
                estimated: { value: 'NO' }
              },
              endDate: {
                date: { value: '' },
                estimated: { value: 'NO' },
                isPresent: { value: 'NO' }
              },
              isMaidenName: { value: 'NO' },
              reasonChanged: { value: '' }
            },
            {
              _id: 2, // Used for template entry 2
              firstName: { value: '' },
              lastName: { value: '' },
              startDate: {
                date: { value: '' },
                estimated: { value: 'NO' }
              },
              endDate: {
                date: { value: '' },
                estimated: { value: 'NO' },
                isPresent: { value: 'NO' }
              },
              isMaidenName: { value: 'NO' },
              reasonChanged: { value: '' }
            }
          ]
        },
        residencyInfo: [
          {
            _id: 1,
            residenceStartDate: { value: '' },
            residenceEndDate: { value: '' },
            isResidencePresent: { value: 'NO' },
            residenceAddress: {
              street: { value: '' },
              city: { value: '' },
              state: { value: '' },
              zipcode: { value: '' },
              hasAPOOrFPO: { value: 'NO' }
            }
          }
        ],
        contactInfo: {
          contactNumbers: [
            {
              _id: 1,
              type: { value: '' },
              number: { value: '' },
              extension: { value: '' },
              timeOfDay: { value: '' }
            }
          ]
        }
      };
      
      // Create a mock for onInputChange
      onInputChangeMock = jest.fn();
      
      // Create the data mapper with our test data
      dataMapper = FormEntryManager.createDataMapper(
        formData,
        contextData,
        onInputChangeMock
      );
    });

    describe('addEntry functionality', () => {
      test('should add an entry to a nested section with proper setup', () => {
        // Add a new name entry
        const result = dataMapper.addEntry('namesInfo');
        
        // Assert successful result
        expect(result).toBe(true);
        
        // Check that onInputChange was called with correct params
        expect(onInputChangeMock).toHaveBeenCalledWith(
          'namesInfo.names',
          expect.arrayContaining([
            formData.namesInfo.names[0], // Original entry
            expect.objectContaining({
              _id: expect.any(Number), // Should have a unique ID
              firstName: { value: '' },
              lastName: { value: '' }
            })
          ])
        );
      });
      
      test('should initialize a section with no entries when activating it', () => {
        // Add an entry to the empty contact numbers section
        const result = dataMapper.addEntry('contactInfo.contactNumbers');
        
        // Assert successful result
        expect(result).toBe(true);
        
        // Should update both the entries and the flag
        expect(onInputChangeMock).toHaveBeenCalledWith(
          'contactInfo.contactNumbers',
          expect.arrayContaining([
            expect.objectContaining({
              _id: expect.any(Number),
              type: { value: '' },
              number: { value: '' }
            })
          ])
        );
        expect(onInputChangeMock).toHaveBeenCalledWith(
          'contactInfo.hasContactNumbers.value',
          'YES'
        );
      });
      
      test('should apply custom entry when provided', () => {
        // Create a custom entry
        const customEntry = {
          firstName: { value: 'Jane' },
          lastName: { value: 'Smith' },
          startDate: {
            date: { value: '2018-01-01' },
            estimated: { value: 'NO' }
          }
        };
        
        // Add custom entry
        const result = dataMapper.addEntry('namesInfo', customEntry);
        
        // Assert successful result
        expect(result).toBe(true);
        
        // Check that the custom entry was used (with added _id)
        expect(onInputChangeMock).toHaveBeenCalledWith(
          'namesInfo.names',
          expect.arrayContaining([
            formData.namesInfo.names[0], // Original entry
            expect.objectContaining({
              _id: expect.any(Number),
              firstName: { value: 'Jane' },
              lastName: { value: 'Smith' }
            })
          ])
        );
      });
      
      test('should handle maximum entries constraint', () => {
        // Get the constraints for namesInfo
        const constraints = dataMapper.getSectionConstraints('namesInfo');
        const maxEntries = constraints.maxEntries;
        
        // Add entries up to the max
        for (let i = 0; i < maxEntries - 1; i++) { // -1 because we already have one entry
          const result = dataMapper.addEntry('namesInfo');
          expect(result).toBe(true);
        }
        
        // Reset the mock to check only the last call
        onInputChangeMock.mockClear();
        
        // Try to add one more entry beyond the max
        const result = dataMapper.addEntry('namesInfo');
        
        // Should fail and log a warning
        expect(result).toBe(false);
        expect(console.warn).toHaveBeenCalledWith(
          expect.stringContaining('Maximum entries')
        );
        
        // Should not call onInputChange
        expect(onInputChangeMock).not.toHaveBeenCalled();
      });
      
      test('should handle errors when template is not available', () => {
        // Create a data mapper with empty context data
        const emptyContextMapper = FormEntryManager.createDataMapper(
          formData,
          { emptySection: {} },
          onInputChangeMock
        );
        
        // Try to add an entry with no available template
        const result = emptyContextMapper.addEntry('emptySection');
        
        // Should fail and log an error
        expect(result).toBe(false);
        expect(console.error).toHaveBeenCalledWith(
          expect.stringContaining('No template entries available')
        );
      });
    });

    describe('removeEntry functionality', () => {
      test('should remove an entry from a section correctly', () => {
        // First add an extra entry so we have 2 entries
        dataMapper.addEntry('namesInfo');
        onInputChangeMock.mockClear();
        
        // Now remove the second entry (index 1)
        const result = dataMapper.removeEntry('namesInfo', 1);
        
        // Assert successful result
        expect(result).toBe(true);
        
        // Check that onInputChange was called with an array not containing the second entry
        expect(onInputChangeMock).toHaveBeenCalledWith(
          'namesInfo.names',
          [formData.namesInfo.names[0]] // Only the first entry remains
        );
      });
      
      test('should prevent removing the last entry for required sections', () => {
        // Try to remove the only entry in namesInfo
        const result = dataMapper.removeEntry('namesInfo', 0);
        
        // Should fail for sections that prevent removing the last entry
        expect(result).toBe(false);
        expect(console.warn).toHaveBeenCalledWith(
          expect.stringContaining('Cannot remove the last entry')
        );
      });
      
      test('should reset the last entry instead of removing it when configured', () => {
        // Add an entry that will be configured to reset instead of remove
        // This behavior is defined in the constraints for sections like namesInfo
        
        // Create form data with custom first name
        const testFormData = {
          ...formData,
          namesInfo: {
            ...formData.namesInfo,
            names: [{
              _id: 1,
              firstName: { value: 'Test' },
              lastName: { value: 'User' },
              isMaidenName: { value: 'YES' }
            }]
          }
        };
        
        // Create a new data mapper with this test data
        const testMapper = FormEntryManager.createDataMapper(
          testFormData,
          contextData,
          onInputChangeMock
        );
        
        // Try to remove the only entry
        const result = testMapper.removeEntry('namesInfo', 0);
        
        // Should succeed but reset the entry rather than removing it
        expect(result).toBe(true);
        
        // Check that onInputChange was called with an array containing a reset entry
        expect(onInputChangeMock).toHaveBeenCalledWith(
          'namesInfo.names',
          [expect.objectContaining({
            _id: 1, // ID should be preserved
            firstName: { value: '' }, // Values should be reset
            lastName: { value: '' },
            isMaidenName: { value: 'NO' }
          })]
        );
      });
      
      test('should handle invalid index gracefully', () => {
        // Try to remove an entry with an index that doesn't exist
        const result = dataMapper.removeEntry('namesInfo', 99);
        
        // Should fail and log an error
        expect(result).toBe(false);
        expect(console.error).toHaveBeenCalledWith(
          expect.stringContaining('Invalid index')
        );
      });
      
      test('should update has flag when removing all entries', () => {
        // Create a section without the "prevent removing last entry" constraint
        const testFormData = {
          testSection: {
            hasEntries: { value: 'YES' },
            entries: [{
              _id: 1,
              value: { value: 'Test' }
            }]
          }
        };
        
        const testContextData = {
          testSection: {
            entries: [{
              _id: 1,
              value: { value: '' }
            }]
          }
        };
        
        // Create test mapper
        const testMapper = FormEntryManager.createDataMapper(
          testFormData,
          testContextData,
          onInputChangeMock
        );
        
        // Override constraints for our test section
        jest.spyOn(testMapper, 'getSectionConstraints').mockImplementation((section) => {
          if (section === 'testSection') {
            return {
              preventRemovingLastEntry: false
            };
          }
          return dataMapper.getSectionConstraints(section);
        });
        
        // Remove the only entry
        const result = testMapper.removeEntry('testSection', 0);
        
        // Should succeed
        expect(result).toBe(true);
        
        // Should update both the entries array and the flag
        expect(onInputChangeMock).toHaveBeenCalledWith(
          'testSection.entries',
          []
        );
        expect(onInputChangeMock).toHaveBeenCalledWith(
          'testSection.hasEntries.value',
          'NO'
        );
      });
    });

    describe('toggleSection functionality', () => {
      test('should activate a section and add an entry', () => {
        // Deactivate the contact info section to start
        formData.contactInfo.hasContactNumbers.value = 'NO';
        
        // Toggle the section to active
        const result = dataMapper.toggleSection('contactInfo.contactNumbers', true);
        
        // Assert successful result
        expect(result).toBe(true);
        
        // Should update the flag and add an entry
        expect(onInputChangeMock).toHaveBeenCalledWith(
          'contactInfo.hasContactNumbers.value',
          'YES'
        );
        // The addEntry call should have been triggered internally
        expect(onInputChangeMock).toHaveBeenCalledWith(
          'contactInfo.contactNumbers',
          expect.any(Array)
        );
      });
      
      test('should deactivate a section without removing entries', () => {
        // Toggle namesInfo to inactive
        const result = dataMapper.toggleSection('namesInfo', false);
        
        // Assert successful result
        expect(result).toBe(true);
        
        // Should update only the flag, not remove entries
        expect(onInputChangeMock).toHaveBeenCalledWith(
          'namesInfo.hasNames.value',
          'NO'
        );
        
        // Should not have calls modifying the entries array
        const entriesCall = onInputChangeMock.mock.calls.find(
          call => call[0] === 'namesInfo.names'
        );
        expect(entriesCall).toBeUndefined();
      });
    });
    
    describe('validateEntry functionality', () => {
      test('should validate a name entry correctly', () => {
        // Valid entry
        const validEntry = {
          _id: 1,
          firstName: { value: 'John' },
          lastName: { value: 'Doe' }
        };
        
        // Missing required field
        const invalidEntry = {
          _id: 2,
          firstName: { value: 'John' },
          lastName: { value: '' } // Missing last name
        };
        
        // Test valid entry
        const validResult = FormEntryManager.validateEntry('namesInfo', validEntry);
        expect(validResult.isValid).toBe(true);
        expect(validResult.errors).toHaveLength(0);
        
        // Test invalid entry
        const invalidResult = FormEntryManager.validateEntry('namesInfo', invalidEntry);
        expect(invalidResult.isValid).toBe(false);
        expect(invalidResult.errors).toContain('Last name is required');
      });
      
      test('should validate date ranges properly', () => {
        // Entry with end date before start date
        const invalidDateEntry = {
          _id: 1,
          residenceStartDate: { value: '2022-01-01' },
          residenceEndDate: { value: '2021-01-01' }, // End date before start date
          residenceAddress: {
            street: { value: '123 Main St' },
            city: { value: 'Anytown' },
            state: { value: 'CA' },
            zipcode: { value: '12345' }
          }
        };
        
        // Test invalid date range
        const result = FormEntryManager.validateEntry('residencyInfo', invalidDateEntry);
        expect(result.isValid).toBe(false);
        expect(result.errors).toContain('End date must be after start date');
      });
      
      test('should validate section-specific constraints', () => {
        // Create an entry for phone numbers with invalid format
        const invalidPhoneEntry = {
          _id: 1,
          type: { value: 'Home' },
          number: { value: 'not-a-number' } // Invalid phone format
        };
        
        // Test invalid phone format
        const result = FormEntryManager.validateEntry('contactInfo.contactNumbers', invalidPhoneEntry);
        expect(result.isValid).toBe(false);
        expect(result.errors).toContain('Phone number format is invalid');
      });
    });
    
    describe('updateEntries functionality', () => {
      test('should update entries while preserving IDs', () => {
        // Create new entries that will replace existing ones
        const newEntries = [
          {
            firstName: { value: 'New' },
            lastName: { value: 'Person' }
          },
          {
            firstName: { value: 'Another' },
            lastName: { value: 'Person' }
          }
        ];
        
        // Update namesInfo entries
        const result = dataMapper.updateEntries('namesInfo', newEntries);
        
        // Assert successful result
        expect(result).toBe(true);
        
        // Check that IDs were preserved/assigned
        expect(onInputChangeMock).toHaveBeenCalledWith(
          'namesInfo.names',
          expect.arrayContaining([
            expect.objectContaining({
              _id: expect.any(Number),
              firstName: { value: 'New' }
            }),
            expect.objectContaining({
              _id: expect.any(Number),
              firstName: { value: 'Another' }
            })
          ])
        );
      });
      
      test('should validate entries before updating when configured', () => {
        // Create entries with invalid dates to test validation
        const invalidEntries = [
          {
            _id: 1,
            residenceStartDate: { value: '2022-01-01' },
            residenceEndDate: { value: '2021-01-01' }, // Invalid: end before start
            residenceAddress: {
              street: { value: '123 Main St' },
              city: { value: 'Anytown' },
              state: { value: 'CA' },
              zipcode: { value: '12345' },
              hasAPOOrFPO: { value: 'NO' }
            }
          }
        ];
        
        // Try to update with invalid entries
        // Note: In our implementation, residencyInfo has validateBeforeUpdate
        const result = dataMapper.updateEntries('residencyInfo', invalidEntries);
        
        // Should fail due to validation
        expect(result).toBe(false);
        expect(console.error).toHaveBeenCalledWith(
          expect.stringContaining('has end date before start date')
        );
        
        // Should not call onInputChange
        expect(onInputChangeMock).not.toHaveBeenCalledWith(
          'residencyInfo',
          expect.any(Array)
        );
      });
    });
    
    describe('Utility methods', () => {
      test('getEntriesPath should return correct path for different sections', () => {
        // Test various section types
        expect(FormEntryManager.getEntriesPath('namesInfo')).toBe('namesInfo.names');
        expect(FormEntryManager.getEntriesPath('residencyInfo')).toBe('residencyInfo');
        expect(FormEntryManager.getEntriesPath('contactInfo.contactNumbers')).toBe('contactInfo.contactNumbers');
        expect(FormEntryManager.getEntriesPath('custom.entries')).toBe('custom.entries');
        expect(FormEntryManager.getEntriesPath('custom')).toBe('custom.entries');
      });
      
      test('getHasFlagPath should return correct path for different sections', () => {
        // Test various section types
        expect(FormEntryManager.getHasFlagPath('namesInfo')).toBe('namesInfo.hasNames.value');
        expect(FormEntryManager.getHasFlagPath('residencyInfo')).toBe('residencyInfo.hasResidences.value');
        expect(FormEntryManager.getHasFlagPath('contactInfo.contactNumbers')).toBe('contactInfo.hasContactNumbers.value');
        // Default case for unknown section
        expect(FormEntryManager.getHasFlagPath('custom')).toBe('custom.hasEntries.value');
      });
      
      test('isSectionActive should correctly determine active status', () => {
        // Test active section
        expect(FormEntryManager.isSectionActive(formData, 'namesInfo')).toBe(true);
        
        // Test inactive section
        expect(FormEntryManager.isSectionActive(formData, 'contactInfo.contactNumbers')).toBe(false);
        
        // Test section with no flag (should default to active)
        const testData = { noFlagSection: { entries: [] } };
        expect(FormEntryManager.isSectionActive(testData, 'noFlagSection')).toBe(true);
      });
      
      test('getDynamicSections should return all supported sections', () => {
        const sections = FormEntryManager.getDynamicSections();
        
        // Check that important sections are included
        expect(sections).toContain('namesInfo');
        expect(sections).toContain('namesInfo.names');
        expect(sections).toContain('residencyInfo');
        expect(sections).toContain('employmentInfo');
        expect(sections).toContain('contactInfo.contactNumbers');
        expect(sections).toContain('schoolInfo');
      });
      
      test('getMaxEntriesForSection should return correct limits', () => {
        // Check max entries for different sections
        expect(FormEntryManager.getMaxEntriesForSection('namesInfo')).toBe(4);
        expect(FormEntryManager.getMaxEntriesForSection('relativesInfo')).toBe(20);
        
        // Unknown section should return undefined (unlimited)
        expect(FormEntryManager.getMaxEntriesForSection('unknownSection')).toBeUndefined();
      });
    });
  });
  
  describe('EntryKeyManager', () => {
    test('should generate unique IDs', () => {
      const entries = [
        { _id: 1, value: 'First' },
        { _id: 3, value: 'Third' }
      ];
      
      // Should find the next available ID (2)
      expect(EntryKeyManager.getNextAvailableId(entries)).toBe(2);
      
      // With continuous entries, should use the next number
      const continuousEntries = [
        { _id: 1, value: 'First' },
        { _id: 2, value: 'Second' },
        { _id: 3, value: 'Third' }
      ];
      expect(EntryKeyManager.getNextAvailableId(continuousEntries)).toBe(4);
      
      // Empty array should start with 1
      expect(EntryKeyManager.getNextAvailableId([])).toBe(1);
    });
    
    test('should add entries with unique IDs', () => {
      const entries = [
        { _id: 1, value: 'First' },
        { _id: 2, value: 'Second' }
      ];
      
      // Add entry without ID
      const newEntry = { value: 'New' };
      const result = EntryKeyManager.addEntryWithUniqueId(entries, newEntry);
      
      // Should add with ID 3
      expect(result).toHaveLength(3);
      expect(result[2]).toEqual({ _id: 3, value: 'New' });
      
      // Add entry with existing ID
      const duplicateEntry = { _id: 2, value: 'Duplicate' };
      const resultWithDuplicate = EntryKeyManager.addEntryWithUniqueId(entries, duplicateEntry);
      
      // Should reassign ID to avoid collision
      expect(resultWithDuplicate).toHaveLength(3);
      expect(resultWithDuplicate[2]._id).not.toBe(2);
    });
    
    test('should preserve IDs when updating entries', () => {
      const oldEntries = [
        { _id: 1, value: 'First', other: 'data' },
        { _id: 2, value: 'Second', other: 'info' }
      ];
      
      const newEntries = [
        { value: 'Updated First' },
        { value: 'Updated Second' },
        { value: 'New Third' }
      ];
      
      const result = EntryKeyManager.preserveIdsOnUpdate(oldEntries, newEntries);
      
      // Should preserve existing IDs and assign new ones
      expect(result).toHaveLength(3);
      expect(result[0]).toEqual({ _id: 1, value: 'Updated First' });
      expect(result[1]).toEqual({ _id: 2, value: 'Updated Second' });
      expect(result[2]._id).toBe(3); // New ID for third entry
    });
  });
}); 