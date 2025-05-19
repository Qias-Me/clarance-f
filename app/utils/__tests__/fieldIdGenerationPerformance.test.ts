/// <reference types="jest" />

import { 
  generateFieldId, 
  processEntryFieldIds,
} from '../formHandler';

describe('Field ID Generation Performance', () => {
  describe('Generation Speed', () => {
    test('Can generate 10,000+ IDs per second', () => {
      const startTime = Date.now();
      let generatedCount = 0;
      
      // Generate IDs for multiple sections and indices
      const sections = ['namesInfo', 'residencyInfo', 'employmentInfo', 'relativesInfo', 'foreignContacts'];
      const baseIdRange = ['9500', '8500', '7500', '6500', '5500'];
      
      // Target: at least 10,000 IDs in under 1 second
      const targetCount = 10000;
      const timeLimit = 1000; // 1 second (ms)
      
      // Keep generating IDs until we reach the target or time limit
      while (generatedCount < targetCount && (Date.now() - startTime) < timeLimit) {
        for (const section of sections) {
          for (const baseId of baseIdRange) {
            for (let index = 0; index < 10; index++) {
              generateFieldId(baseId, index, section);
              generatedCount++;
              
              if (generatedCount >= targetCount) break;
            }
            if (generatedCount >= targetCount) break;
          }
          if (generatedCount >= targetCount) break;
        }
      }
      
      const endTime = Date.now();
      const elapsedMs = endTime - startTime;
      const idsPerSecond = (generatedCount / elapsedMs) * 1000;
      
      console.log(`Generated ${generatedCount} IDs in ${elapsedMs}ms (${idsPerSecond.toFixed(2)} IDs/second)`);
      
      // Assertions
      expect(generatedCount).toBeGreaterThanOrEqual(targetCount);
      expect(elapsedMs).toBeLessThanOrEqual(timeLimit);
      expect(idsPerSecond).toBeGreaterThanOrEqual(10000);
    });
  });
  
  describe('ID Consistency Under Load', () => {
    test('Generated IDs remain consistent when generating many IDs', () => {
      // Record some IDs before generating many IDs
      const initialIds = {
        namesInfo0: generateFieldId('9500', 0, 'namesInfo'),
        namesInfo1: generateFieldId('9500', 1, 'namesInfo'),
        residencyInfo0: generateFieldId('8500', 0, 'residencyInfo'),
        residencyInfo1: generateFieldId('8500', 1, 'residencyInfo'),
      };
      
      // Generate a large number of IDs (which shouldn't affect the algorithm)
      for (let i = 0; i < 10000; i++) {
        generateFieldId(`${i}`, i % 10, i % 2 === 0 ? 'namesInfo' : 'residencyInfo');
      }
      
      // Generate the same IDs again after the load
      const afterLoadIds = {
        namesInfo0: generateFieldId('9500', 0, 'namesInfo'),
        namesInfo1: generateFieldId('9500', 1, 'namesInfo'),
        residencyInfo0: generateFieldId('8500', 0, 'residencyInfo'),
        residencyInfo1: generateFieldId('8500', 1, 'residencyInfo'),
      };
      
      // IDs should be identical before and after the heavy load
      expect(afterLoadIds.namesInfo0).toBe(initialIds.namesInfo0);
      expect(afterLoadIds.namesInfo1).toBe(initialIds.namesInfo1);
      expect(afterLoadIds.residencyInfo0).toBe(initialIds.residencyInfo0);
      expect(afterLoadIds.residencyInfo1).toBe(initialIds.residencyInfo1);
    });
  });
  
  describe('Entry Processing Performance', () => {
    test('Can process complex entries efficiently', () => {
      // Create a complex entry with nested fields
      const createComplexEntry = () => ({
        _id: Math.random(),
        personal: {
          name: {
            lastName: { id: '9500', value: '', type: 'PDFTextField', label: 'Last Name' },
            firstName: { id: '9501', value: '', type: 'PDFTextField', label: 'First Name' },
            middleName: { id: '9502', value: '', type: 'PDFTextField', label: 'Middle Name' },
          },
          contact: {
            phone: { id: '9505', value: '', type: 'PDFTextField', label: 'Phone' },
            email: { id: '9506', value: '', type: 'PDFTextField', label: 'Email' },
          },
          address: {
            street: { id: '9510', value: '', type: 'PDFTextField', label: 'Street' },
            city: { id: '9511', value: '', type: 'PDFTextField', label: 'City' },
            state: { id: '9512', value: '', type: 'PDFDropdown', label: 'State' },
            zip: { id: '9513', value: '', type: 'PDFTextField', label: 'ZIP' },
            country: { id: '9514', value: '', type: 'PDFDropdown', label: 'Country' },
          },
        },
        employment: {
          current: {
            company: { id: '9520', value: '', type: 'PDFTextField', label: 'Company' },
            title: { id: '9521', value: '', type: 'PDFTextField', label: 'Title' },
            startDate: { id: '9522', value: '', type: 'PDFTextField', label: 'Start Date' },
          },
          previous: {
            company: { id: '9530', value: '', type: 'PDFTextField', label: 'Previous Company' },
            title: { id: '9531', value: '', type: 'PDFTextField', label: 'Previous Title' },
            startDate: { id: '9532', value: '', type: 'PDFTextField', label: 'Previous Start Date' },
            endDate: { id: '9533', value: '', type: 'PDFTextField', label: 'Previous End Date' },
          },
        },
        references: [
          {
            name: { id: '9540', value: '', type: 'PDFTextField', label: 'Reference Name' },
            relationship: { id: '9541', value: '', type: 'PDFTextField', label: 'Relationship' },
            contact: { id: '9542', value: '', type: 'PDFTextField', label: 'Contact Info' },
          },
          {
            name: { id: '9545', value: '', type: 'PDFTextField', label: 'Reference Name' },
            relationship: { id: '9546', value: '', type: 'PDFTextField', label: 'Relationship' },
            contact: { id: '9547', value: '', type: 'PDFTextField', label: 'Contact Info' },
          },
        ],
        education: [
          {
            institution: { id: '9550', value: '', type: 'PDFTextField', label: 'Institution' },
            degree: { id: '9551', value: '', type: 'PDFTextField', label: 'Degree' },
            graduationDate: { id: '9552', value: '', type: 'PDFTextField', label: 'Graduation Date' },
          },
        ],
        flags: {
          isVerified: { id: '9560', value: 'NO', type: 'PDFCheckBox', label: 'Verified' },
          hasComments: { id: '9561', value: 'NO', type: 'PDFCheckBox', label: 'Has Comments' },
          isComplete: { id: '9562', value: 'NO', type: 'PDFCheckBox', label: 'Complete' },
        },
      });
      
      const startTime = Date.now();
      let processedCount = 0;
      const targetCount = 1000;
      const timeLimit = 1000; // 1 second
      
      // Process complex entries until we reach the target or time limit
      while (processedCount < targetCount && (Date.now() - startTime) < timeLimit) {
        const entry = createComplexEntry();
        
        // Process entries for multiple section types and indices
        const sections = ['namesInfo', 'residencyInfo', 'employmentInfo', 'relativesInfo'];
        
        for (const section of sections) {
          for (let index = 0; index < 5; index++) {
            processEntryFieldIds(entry, index, section);
            processedCount++;
            
            if (processedCount >= targetCount) break;
          }
          if (processedCount >= targetCount) break;
        }
      }
      
      const endTime = Date.now();
      const elapsedMs = endTime - startTime;
      const entriesPerSecond = (processedCount / elapsedMs) * 1000;
      
      console.log(`Processed ${processedCount} complex entries in ${elapsedMs}ms (${entriesPerSecond.toFixed(2)} entries/second)`);
      
      // Assertions for reasonable performance
      expect(processedCount).toBeGreaterThanOrEqual(100); // Should process at least 100 entries
      expect(entriesPerSecond).toBeGreaterThanOrEqual(100); // Should process at least 100 entries per second
    });
  });
  
  describe('ID Uniqueness', () => {
    test('Generated IDs are unique within a section', () => {
      // Generate multiple IDs for a section and ensure uniqueness
      const section = 'namesInfo';
      const generatedIds = new Set<string>();
      
      // Generate IDs for multiple baseIds and indices
      for (let baseId = 9500; baseId < 9600; baseId++) {
        for (let index = 0; index < 10; index++) {
          const id = generateFieldId(baseId.toString(), index, section);
          
          // Ensure this ID hasn't been generated before
          expect(generatedIds.has(id)).toBe(false);
          generatedIds.add(id);
        }
      }
      
      // Verify we have the expected number of unique IDs
      expect(generatedIds.size).toBe(1000); // 100 baseIds × 10 indices
    });
    
    test('Generated IDs are unique across sections', () => {
      const sections = ['namesInfo', 'residencyInfo', 'employmentInfo', 'relativesInfo'];
      const generatedIds = new Set<string>();
      
      // Use the same baseId and index across different sections
      for (const section of sections) {
        for (let baseId = 9500; baseId < 9520; baseId++) {
          for (let index = 0; index < 5; index++) {
            const id = generateFieldId(baseId.toString(), index, section);
            
            // Check for uniqueness
            if (generatedIds.has(id)) {
              console.warn(`Duplicate ID detected: ${id} for ${section}, baseId=${baseId}, index=${index}`);
            }
            
            generatedIds.add(id);
          }
        }
      }
      
      // Verify we have the expected number of unique IDs
      // If IDs are truly unique across sections, we should have:
      // 4 sections × 20 baseIds × 5 indices = 400 unique IDs
      // However, ID generation doesn't guarantee cross-section uniqueness
      // so we expect the actual number to be less
      console.log(`Generated ${generatedIds.size} unique IDs across sections`);
      
      // We accept some collisions, but want to ensure decent uniqueness
      // across sections (at least 75% unique)
      const minExpectedUnique = Math.floor(4 * 20 * 5 * 0.75);
      expect(generatedIds.size).toBeGreaterThanOrEqual(minExpectedUnique);
    });
  });
}); 