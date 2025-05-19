/**
 * Mental Health Field Mapping Test
 * 
 * This script tests the field mapping functionality for the Mental Health section (21)
 */

import { FieldMappingService } from '../api/service/FieldMappingService';
import { mentalHealth } from '../app/state/contexts/sections/mentalHealth';
import * as fs from 'fs';
import * as path from 'path';

// Audit log for tracking data access (for security and privacy compliance)
function auditLog(action: string, section: number | string, fieldId: string, status: string): void {
  const timestamp = new Date().toISOString();
  const logEntry = `${timestamp} | ${action} | Section ${section} | Field ${fieldId} | ${status}`;
  console.log(`AUDIT: ${logEntry}`);
}

async function testMentalHealthMapping(): Promise<boolean> {
  try {
    console.log('Starting mental health field mapping test...');
    
    // Initialize the field mapping service
    const fieldMappingService = new FieldMappingService();
    
    // Load sample field hierarchy data (mock data for testing)
    const fieldHierarchyPath = path.join(__dirname, '../utilities/externalTools/field-hierarchy.json');
    let fieldHierarchy: any;
    
    if (fs.existsSync(fieldHierarchyPath)) {
      console.log(`Loading field hierarchy from: ${fieldHierarchyPath}`);
      const fieldHierarchyData = fs.readFileSync(fieldHierarchyPath, 'utf8');
      fieldHierarchy = JSON.parse(fieldHierarchyData);
      auditLog('READ', 21, 'field-hierarchy.json', 'Success');
    } else {
      console.log('Field hierarchy file not found, using mock data');
      auditLog('READ', 21, 'field-hierarchy.json', 'Not Found - Using Mock Data');
      
      // Mock field hierarchy with a few sample fields
      fieldHierarchy = {
        sections: {
          21: {
            title: 'Psychological and Emotional Health',
            fields: [
              // Just a sample of fields for quick testing
              { 
                id: 'mental-incompetent-1', 
                name: 'Section21A-DeclaredIncompetent', 
                value: 'Yes',
                label: 'Have you ever been declared mentally incompetent?',
                subsection: '21A'
              },
              { 
                id: 'mental-consult-1', 
                name: 'Section21B-MentalHealthConsult', 
                value: 'Yes',
                label: 'Have you consulted with a health care professional regarding an emotional or mental health condition?',
                subsection: '21B'
              }
            ]
          }
        }
      };
    }
    
    // Deep clone the mental health context to avoid modifying the original
    const initialContext = JSON.parse(JSON.stringify(mentalHealth));
    
    // Map the fields to the context
    console.log('Mapping mental health fields to context...');
    const mappedContext = fieldMappingService.mapMentalHealthFields(fieldHierarchy, initialContext);
    
    // Simple validation of a few key fields
    console.log('\nValidation Results:');
    console.log(`declaredMentallyIncompetent = ${mappedContext.declaredMentallyIncompetent?.value}`);
    console.log(`consultMentalHealth = ${mappedContext.consultMentalHealth?.value}`);
    
    // Save the mapped context to a file for inspection
    const outputFile = path.join(__dirname, 'mapped-mental-health.json');
    fs.writeFileSync(outputFile, JSON.stringify(mappedContext, null, 2), 'utf8');
    console.log(`\nMapped context saved to: ${outputFile}`);
    
    console.log('\nTest completed!');
    return true;
  } catch (error) {
    console.error('Error during mental health mapping test:', error);
    auditLog('ERROR', 21, 'test-execution', (error as Error).message);
    return false;
  }
}

// Run the test
testMentalHealthMapping(); 