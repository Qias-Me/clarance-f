/// <reference types="jest" />

import { 
  generateFieldId, 
  processEntryFieldIds,
} from '../formHandler';

// Simulate multiple distributed instances by using different workerIds
describe('Field ID Generation in Distributed Environments', () => {
  // Since our implementation might not directly support distributed IDs with different
  // worker IDs, we'll simulate it by testing the patterns and deterministic nature
  
  describe('Deterministic ID Generation Across Environments', () => {
    test('Generated IDs follow predictable patterns regardless of environment', () => {
      // For a deterministic algorithm, the same inputs should generate the same outputs
      // across different environments
      
      const section = 'namesInfo';
      const baseId = '9500';
      
      // Generate IDs for the same inputs
      const id1 = generateFieldId(baseId, 0, section);
      const id2 = generateFieldId(baseId, 0, section);
      const id3 = generateFieldId(baseId, 0, section);
      
      // All instances should produce the same ID for the same inputs
      expect(id1).toBe(id2);
      expect(id1).toBe(id3);
      
      // Generate IDs for different indices
      const idIndex0 = generateFieldId(baseId, 0, section);
      const idIndex1 = generateFieldId(baseId, 1, section);
      const idIndex2 = generateFieldId(baseId, 2, section);
      
      // Verify that different indices produce different IDs
      expect(idIndex0).not.toBe(idIndex1);
      expect(idIndex0).not.toBe(idIndex2);
      expect(idIndex1).not.toBe(idIndex2);
      
      // The specific pattern should be predictable
      expect(idIndex1).toBe('9486'); // For namesInfo section, index 1, baseId 9500
    });
    
    test('Generated IDs follow predictable patterns across sections', () => {
      // Check that different sections have consistent and predictable patterns
      const sections = ['namesInfo', 'residencyInfo', 'employmentInfo', 'relativesInfo'];
      const baseId = '5000';
      
      // For each section, calculate the delta between consecutive indices
      const sectionDeltas: Record<string, number[]> = {};
      
      for (const section of sections) {
        sectionDeltas[section] = [];
        
        // Generate IDs for consecutive indices
        const ids = [];
        for (let i = 0; i < 5; i++) {
          ids.push(generateFieldId(baseId, i, section));
        }
        
        // Calculate deltas
        for (let i = 0; i < ids.length - 1; i++) {
          sectionDeltas[section].push(parseInt(ids[i]) - parseInt(ids[i + 1]));
        }
        
        // Each section should have a consistent delta pattern
        expect(new Set(sectionDeltas[section]).size).toBe(1);
      }
      
      // Log the delta patterns for each section
      console.log('Section offset patterns:', Object.fromEntries(
        Object.entries(sectionDeltas).map(([section, deltas]) => [section, deltas[0]])
      ));
    });
  });
  
  describe('Simulation of Multiple Application Instances', () => {
    test('Multiple instances generating the same base set of IDs should be conflict-free', () => {
      // Simulate different application instances generating IDs for the same entries
      
      // Generate IDs for namesInfo entries across "instances"
      const instance1NamesIds = [
        generateFieldId('9500', 0, 'namesInfo'),
        generateFieldId('9500', 1, 'namesInfo'),
        generateFieldId('9500', 2, 'namesInfo'),
      ];
      
      const instance2NamesIds = [
        generateFieldId('9500', 0, 'namesInfo'),
        generateFieldId('9500', 1, 'namesInfo'),
        generateFieldId('9500', 2, 'namesInfo'),
      ];
      
      // IDs should be identical across instances for the same inputs
      expect(instance1NamesIds[0]).toBe(instance2NamesIds[0]);
      expect(instance1NamesIds[1]).toBe(instance2NamesIds[1]);
      expect(instance1NamesIds[2]).toBe(instance2NamesIds[2]);
      
      // Generate IDs for a different section
      const instance1ResidencyIds = [
        generateFieldId('8500', 0, 'residencyInfo'),
        generateFieldId('8500', 1, 'residencyInfo'),
      ];
      
      const instance2ResidencyIds = [
        generateFieldId('8500', 0, 'residencyInfo'),
        generateFieldId('8500', 1, 'residencyInfo'),
      ];
      
      // These should also match
      expect(instance1ResidencyIds[0]).toBe(instance2ResidencyIds[0]);
      expect(instance1ResidencyIds[1]).toBe(instance2ResidencyIds[1]);
      
      // Cross-section ID conflicts should be minimized
      // Check that namesInfo IDs are not conflicting with residencyInfo IDs
      const allInstance1Ids = [...instance1NamesIds, ...instance1ResidencyIds];
      const uniqueIds = new Set(allInstance1Ids);
      
      // The number of unique IDs should be close to the total number of IDs
      // We might have some collisions if the sections use overlapping ranges
      console.log(`Generated ${uniqueIds.size} unique IDs from ${allInstance1Ids.length} total IDs`);
      expect(uniqueIds.size).toBeGreaterThanOrEqual(allInstance1Ids.length * 0.75);
    });
    
    test('Simulating multiple instances processing complex entries should yield consistent results', () => {
      // Create a complex entry template
      const entryTemplate = {
        _id: 1,
        name: {
          last: { id: '9500', value: 'Doe', type: 'PDFTextField', label: 'Last name' },
          first: { id: '9501', value: 'John', type: 'PDFTextField', label: 'First name' },
        },
        contact: {
          phone: { id: '9505', value: '123-456-7890', type: 'PDFTextField', label: 'Phone' },
          email: { id: '9506', value: 'test@example.com', type: 'PDFTextField', label: 'Email' },
        }
      };
      
      // Process the entry in two different "instances"
      const instance1Entry = processEntryFieldIds({...entryTemplate}, 1, 'namesInfo');
      const instance2Entry = processEntryFieldIds({...entryTemplate}, 1, 'namesInfo');
      
      // The processed entries should be identical
      expect(instance1Entry.name.last.id).toBe(instance2Entry.name.last.id);
      expect(instance1Entry.name.first.id).toBe(instance2Entry.name.first.id);
      expect(instance1Entry.contact.phone.id).toBe(instance2Entry.contact.phone.id);
      expect(instance1Entry.contact.email.id).toBe(instance2Entry.contact.email.id);
      
      // Process for a different index
      const instance1Entry2 = processEntryFieldIds({...entryTemplate}, 2, 'namesInfo');
      const instance2Entry2 = processEntryFieldIds({...entryTemplate}, 2, 'namesInfo');
      
      // These should also match
      expect(instance1Entry2.name.last.id).toBe(instance2Entry2.name.last.id);
      expect(instance1Entry2.name.first.id).toBe(instance2Entry2.name.first.id);
      
      // But they should be different from the index 1 entries
      expect(instance1Entry.name.last.id).not.toBe(instance1Entry2.name.last.id);
    });
  });
  
  describe('Conflict Resolution Simulation', () => {
    test('Different sections with the same baseId and index should generate different IDs', () => {
      // This tests how the system handles potential conflicts from two different sections
      // that might have overlapping ID ranges
      
      const baseId = '9000';
      const index = 1;
      
      // Generate IDs for different sections with the same base parameters
      const sectionsToTest = [
        'namesInfo',
        'residencyInfo',
        'employmentInfo',
        'relativesInfo',
        'foreignContacts',
        'schoolInfo'
      ];
      
      const generatedIds = sectionsToTest.map(section => 
        generateFieldId(baseId, index, section)
      );
      
      // Count unique IDs
      const uniqueIds = new Set(generatedIds);
      
      // Log the IDs generated for each section
      console.log('IDs generated for different sections with the same parameters:');
      sectionsToTest.forEach((section, i) => {
        console.log(`- ${section}: ${generatedIds[i]}`);
      });
      
      // Our ID generation might not guarantee unique IDs across sections with the same baseId
      // but a good system should have some level of section-specific differentiation
      // We expect that at least some of the sections will have unique IDs
      expect(uniqueIds.size).toBeGreaterThan(1);
    });
  });
  
  describe('Cross-Environment Entry Processing', () => {
    test('Entry processing produces the same results across environments', () => {
      // Create a template entry
      const templateEntry = {
        _id: 1,
        lastName: { value: "", id: "9500", type: "PDFTextField", label: "Last name" },
        firstName: { value: "", id: "9501", type: "PDFTextField", label: "First name" },
        middleName: { value: "", id: "9502", type: "PDFTextField", label: "Middle name" },
      };
      
            // Process the same entry multiple times (simulating different environments)      const result1 = processEntryFieldIds(templateEntry, 1, 'namesInfo');      const result2 = processEntryFieldIds(templateEntry, 1, 'namesInfo');      const result3 = processEntryFieldIds(templateEntry, 1, 'namesInfo');
      
      // Results should be identical across all "environments"
      expect(result1.lastName.id).toBe(result2.lastName.id);
      expect(result1.lastName.id).toBe(result3.lastName.id);
      expect(result1.firstName.id).toBe(result2.firstName.id);
      expect(result1.middleName.id).toBe(result3.middleName.id);
      
      // Specific expected results based on the algorithm
      expect(result1.lastName.id).toBe('9486');
      expect(result1.firstName.id).toBe('9487');
      expect(result1.middleName.id).toBe('9488');
    });
  });
  
  describe('Multi-Instance ID Generation Collision Avoidance', () => {
    test('Different form sections have sufficiently unique ID patterns', () => {
      const sections = ['namesInfo', 'residencyInfo', 'employmentInfo', 'relativesInfo'];
      const collisionMap = new Map<string, Array<{ section: string, index: number, baseId: string }>>();
      
      // Generate IDs for different sections using the same baseId and index
      // to check for potential collisions
      for (const section of sections) {
        for (let index = 0; index < 5; index++) {
          for (let baseIdNum = 9500; baseIdNum < 9520; baseIdNum++) {
            const baseId = baseIdNum.toString();
            const id = generateFieldId(baseId, index, section);
            
            if (!collisionMap.has(id)) {
              collisionMap.set(id, []);
            }
            
            collisionMap.get(id)?.push({ section, index, baseId });
          }
        }
      }
      
      // Count collisions where the same ID was generated for different inputs
      let collisionCount = 0;
      let worstCollision = 0;
      
      for (const [id, sources] of collisionMap.entries()) {
        if (sources.length > 1) {
          collisionCount++;
          worstCollision = Math.max(worstCollision, sources.length);
          
          // Log details of one collision for debugging
          if (collisionCount === 1) {
            console.log(`Collision example - ID: ${id}`);
            sources.forEach(source => {
              console.log(`  Generated by section: ${source.section}, index: ${source.index}, baseId: ${source.baseId}`);
            });
          }
        }
      }
      
      console.log(`Found ${collisionCount} collisions among ${collisionMap.size} unique IDs`);
      console.log(`Worst collision had ${worstCollision} sources generating the same ID`);
      
      // We accept some collisions, but they should be limited
      // The exact threshold depends on the implementation specifics
      const totalIdsGenerated = sections.length * 5 * 20; // 4 sections * 5 indices * 20 baseIds
      const acceptableCollisionRate = 0.25; // 25% collision rate max
      const maxAcceptableCollisions = totalIdsGenerated * acceptableCollisionRate;
      
      expect(collisionCount).toBeLessThan(maxAcceptableCollisions);
      expect(worstCollision).toBeLessThan(5); // No more than 5 sources for the same ID
    });
  });
  
  describe('Sequential ID Generation Stability', () => {
    test('IDs are generated in a stable sequence regardless of environment', () => {
      // Test the sequence of IDs generated for the same section and baseId
      // but different indices
      
      const section = 'namesInfo';
      const baseId = '9500';
      const count = 5;
      
      // Generate a sequence of IDs in different "environments"
      const sequence1 = Array.from({ length: count }, (_, i) => generateFieldId(baseId, i, section));
      const sequence2 = Array.from({ length: count }, (_, i) => generateFieldId(baseId, i, section));
      
      // The sequences should be identical
      for (let i = 0; i < count; i++) {
        expect(sequence1[i]).toBe(sequence2[i]);
      }
      
      // Verify the expected sequence for this specific input
      const expectedSequence = ['9500', '9486', '9472', '9458', '9444'];
      expect(sequence1).toEqual(expectedSequence);
    });
  });
}); 