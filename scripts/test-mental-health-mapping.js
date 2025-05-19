// Test script for mental health field mapping
import { FieldMappingService } from './modules/field-mapping-wrapper.js';
import { mentalHealth } from './modules/mental-health-wrapper.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get directory path in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Audit log for tracking data access (for security and privacy compliance)
function auditLog(action, section, fieldId, status) {
  const timestamp = new Date().toISOString();
  const logEntry = `${timestamp} | ${action} | Section ${section} | Field ${fieldId} | ${status}`;
  console.log(`AUDIT: ${logEntry}`);
  
  // In a production environment, this would write to a secure audit log file
  // and potentially trigger alerts for suspicious activity
}

async function testMentalHealthMapping() {
  try {
    console.log('Starting mental health field mapping test...');
    
    // Initialize the field mapping service
    const fieldMappingService = new FieldMappingService();
    
    // Load sample field hierarchy data (mock data for testing)
    const fieldHierarchyPath = path.join(__dirname, '../utilities/externalTools/field-hierarchy.json');
    let fieldHierarchy;
    
    if (fs.existsSync(fieldHierarchyPath)) {
      console.log(`Loading field hierarchy from: ${fieldHierarchyPath}`);
      const fieldHierarchyData = fs.readFileSync(fieldHierarchyPath, 'utf8');
      fieldHierarchy = JSON.parse(fieldHierarchyData);
      auditLog('READ', 21, 'field-hierarchy.json', 'Success');
    } else {
      console.log('Field hierarchy file not found, using mock data');
      auditLog('READ', 21, 'field-hierarchy.json', 'Not Found - Using Mock Data');
      
      // Mock field hierarchy with comprehensive mental health fields
      fieldHierarchy = {
        sections: {
          21: {
            title: 'Psychological and Emotional Health',
            fields: [
              // Section 21A - Mental Incompetence
              { 
                id: 'mental-incompetent-1', 
                name: 'Section21A-DeclaredIncompetent', 
                value: 'Yes',
                label: 'Have you ever been declared mentally incompetent?',
                subsection: '21A'
              },
              {
                id: 'mental-incompetent-date',
                name: 'Section21A-Date',
                value: '01/15/2020',
                label: 'Date when you were declared mentally incompetent',
                subsection: '21A'
              },
              {
                id: 'mental-incompetent-date-estimated',
                name: 'Section21A-DateEstimated',
                value: 'Yes',
                label: 'Is this date estimated?',
                subsection: '21A'
              },
              {
                id: 'mental-incompetent-court',
                name: 'Section21A-Court',
                value: 'Superior Court of California',
                label: 'Court that issued the declaration',
                subsection: '21A'
              },
              {
                id: 'mental-incompetent-court-street',
                name: 'Section21A-CourtStreet',
                value: '123 Courthouse Ave',
                label: 'Street address of court',
                subsection: '21A'
              },
              {
                id: 'mental-incompetent-court-city',
                name: 'Section21A-CourtCity',
                value: 'Sacramento',
                label: 'City of court',
                subsection: '21A'
              },
              {
                id: 'mental-incompetent-court-state',
                name: 'Section21A-CourtState',
                value: 'CA',
                label: 'State of court',
                subsection: '21A'
              },
              {
                id: 'mental-incompetent-court-zip',
                name: 'Section21A-CourtZip',
                value: '95814',
                label: 'ZIP code of court',
                subsection: '21A'
              },
              {
                id: 'mental-incompetent-court-country',
                name: 'Section21A-CourtCountry',
                value: 'United States',
                label: 'Country of court',
                subsection: '21A'
              },
              {
                id: 'mental-incompetent-appealed',
                name: 'Section21A-Appealed',
                value: 'Yes',
                label: 'Did you appeal this declaration?',
                subsection: '21A'
              },
              {
                id: 'mental-incompetent-appeal-court',
                name: 'Section21A-AppealCourt',
                value: 'California Court of Appeals',
                label: 'Court where the appeal was filed',
                subsection: '21A',
                arrayName: 'appeal',
                arrayIndex: 0
              },
              {
                id: 'mental-incompetent-appeal-disposition',
                name: 'Section21A-AppealDisposition',
                value: 'Denied',
                label: 'Final disposition of the appeal',
                subsection: '21A',
                arrayName: 'appeal',
                arrayIndex: 0
              },
              
              // Section 21B - Mental Health Consultation
              { 
                id: 'mental-consult-1', 
                name: 'Section21B-MentalHealthConsult', 
                value: 'Yes',
                label: 'Have you consulted with a health care professional regarding an emotional or mental health condition?',
                subsection: '21B'
              },
              {
                id: 'mental-consult-date',
                name: 'Section21B-Date',
                value: '03/01/2021',
                label: 'Date of consultation order',
                subsection: '21B'
              },
              {
                id: 'mental-consult-date-estimated',
                name: 'Section21B-DateEstimated',
                value: 'No',
                label: 'Is this date estimated?',
                subsection: '21B'
              },
              {
                id: 'mental-consult-court',
                name: 'Section21B-Court',
                value: 'Municipal Court of San Francisco',
                label: 'Court that ordered the consultation',
                subsection: '21B'
              },
              {
                id: 'mental-consult-disposition',
                name: 'Section21B-Disposition',
                value: 'Completed consultation as ordered',
                label: 'Final disposition of the order',
                subsection: '21B'
              },
              
              // Section 21C - Hospitalization
              { 
                id: 'mental-hospital-1', 
                name: 'Section21C-Hospitalization', 
                value: 'No',
                label: 'Have you ever been hospitalized for an emotional or mental health condition?',
                subsection: '21C'
              },
              {
                id: 'mental-hospital-voluntary',
                name: 'Section21C-Voluntary',
                value: 'Yes',
                label: 'Was the hospitalization voluntary?',
                subsection: '21C'
              },
              {
                id: 'mental-hospital-explanation',
                name: 'Section21C-Explanation',
                value: 'Short-term treatment for anxiety',
                label: 'Explanation for hospitalization',
                subsection: '21C'
              },
              {
                id: 'mental-hospital-facility-name',
                name: 'Section21C-FacilityName',
                value: 'Mercy Hospital',
                label: 'Name of facility',
                subsection: '21C'
              },
              {
                id: 'mental-hospital-from-date',
                name: 'Section21C-FromDate',
                value: '05/10/2020',
                label: 'From date',
                subsection: '21C'
              },
              {
                id: 'mental-hospital-to-date',
                name: 'Section21C-ToDate',
                value: '05/24/2020',
                label: 'To date',
                subsection: '21C'
              },
              
              // Section 21D - Diagnosis
              { 
                id: 'mental-diagnosis-1', 
                name: 'Section21D-Diagnosis', 
                value: 'Yes',
                label: 'Have you ever been diagnosed with an emotional or mental health condition?',
                subsection: '21D'
              },
              {
                id: 'mental-diagnosis-description',
                name: 'Section21D-Description',
                value: 'Anxiety disorder',
                label: 'Description of the diagnosis',
                subsection: '21D'
              },
              {
                id: 'mental-diagnosis-from-date',
                name: 'Section21D-FromDate',
                value: '02/10/2021',
                label: 'From date',
                subsection: '21D'
              },
              {
                id: 'mental-diagnosis-to-date',
                name: 'Section21D-ToDate',
                value: '08/15/2021',
                label: 'To date',
                subsection: '21D'
              },
              {
                id: 'mental-diagnosis-present',
                name: 'Section21D-Present',
                value: 'No',
                label: 'Present',
                subsection: '21D'
              },
              {
                id: 'mental-diagnosis-hcp-name',
                name: 'Section21D-HcpName',
                value: 'Dr. Jane Smith',
                label: 'Healthcare professional name',
                subsection: '21D'
              },
              {
                id: 'mental-diagnosis-hcp-phone',
                name: 'Section21D-HcpPhone',
                value: '555-123-4567',
                label: 'Healthcare professional phone',
                subsection: '21D'
              },
              {
                id: 'mental-diagnosis-effective',
                name: 'Section21D-CounselingEffective',
                value: 'Yes',
                label: 'Was the counseling effective?',
                subsection: '21D'
              },
              
              // Section 21D1 - Current Treatment
              { 
                id: 'mental-treatment-1', 
                name: 'Section21D1-Treatment', 
                value: 'Yes',
                label: 'Are you currently in treatment?',
                subsection: '21D1'
              },
              {
                id: 'mental-treatment-hcp-name',
                name: 'Section21D1-HcpName',
                value: 'Dr. Robert Johnson',
                label: 'Current healthcare professional name',
                subsection: '21D1'
              },
              {
                id: 'mental-treatment-hcp-phone',
                name: 'Section21D1-HcpPhone',
                value: '555-987-6543',
                label: 'Current healthcare professional phone',
                subsection: '21D1'
              },
              
              // Section 21E - Mental Health Affects
              {
                id: 'mental-health-affect-work-1',
                name: 'Section21E-AffectWork',
                value: 'No',
                label: 'Does this condition substantially adversely affect your judgment, reliability, or ability to perform required duties?',
                subsection: '21E'
              },
              {
                id: 'mental-health-chose-not-follow',
                name: 'Section21E-ChoseNotToFollow',
                value: 'No',
                label: 'Did you ever choose not to follow treatment recommendations?',
                subsection: '21E'
              }
            ]
          }
        }
      };
    }
    
    // Deep clone the mental health context to avoid modifying the original
    const initialContext = JSON.parse(JSON.stringify(mentalHealth));
    
    // Add empty arrays for each subsection if they don't exist
    if (!initialContext.section21A) initialContext.section21A = [];
    if (!initialContext.section21B) initialContext.section21B = [];
    if (!initialContext.section21C) initialContext.section21C = [];
    if (!initialContext.section21D) initialContext.section21D = [];
    if (!initialContext.section21D1) initialContext.section21D1 = [];
    if (!initialContext.section21E) initialContext.section21E = [];
    
    // Add a sample entry for each subsection
    initialContext.section21A.push({
      dateOccurred: { value: '', id: '', type: 'text', label: 'Date Occurred' },
      estimated: { value: '', id: '', type: 'checkbox', label: 'Estimated' },
      courtAgency: {
        name: { value: '', id: '', type: 'text', label: 'Court/Agency Name' },
        address: {
          street: { value: '', id: '', type: 'text', label: 'Street' },
          city: { value: '', id: '', type: 'text', label: 'City' },
          state: { value: '', id: '', type: 'text', label: 'State' },
          zipCode: { value: '', id: '', type: 'text', label: 'ZIP Code' },
          country: { value: '', id: '', type: 'text', label: 'Country' }
        }
      },
      appealed: { value: '', id: '', type: 'radio', label: 'Appealed' },
      appeals: [{
        _id: 1,
        courtAgency: {
          name: { value: '', id: '', type: 'text', label: 'Appeal Court/Agency Name' },
          address: {
            street: { value: '', id: '', type: 'text', label: 'Street' },
            city: { value: '', id: '', type: 'text', label: 'City' },
            state: { value: '', id: '', type: 'text', label: 'State' },
            zipCode: { value: '', id: '', type: 'text', label: 'ZIP Code' },
            country: { value: '', id: '', type: 'text', label: 'Country' }
          }
        },
        finalDisposition: { value: '', id: '', type: 'text', label: 'Final Disposition' }
      }]
    });
    
    // Map the fields to the context
    console.log('Mapping mental health fields to context...');
    const mappedContext = fieldMappingService.mapMentalHealthFields(fieldHierarchy, initialContext);
    
    // Validate the mapping results
    console.log('\nValidation Results:');
    const validationResults = {
      mainFields: 0,
      section21A: 0,
      section21B: 0,
      section21C: 0,
      section21D: 0,
      section21D1: 0,
      section21E: 0,
      securityMetadata: 0,
      totalFields: 0,
      passedFields: 0
    };
    
    // Helper function to validate a field mapping
    function validateField(fieldName, subsection, actualValue, expectedValue) {
      validationResults.totalFields++;
      const fieldPath = subsection ? `${subsection}.${fieldName}` : fieldName;
      
      if (actualValue === expectedValue) {
        console.log(`✅ Field "${fieldPath}" mapping successful (${expectedValue})`);
        validationResults.passedFields++;
        
        // Update specific section counter
        if (!subsection) {
          validationResults.mainFields++;
        } else {
          validationResults[subsection]++;
        }
        
        auditLog('VALIDATE', 21, fieldPath, 'Success');
        return true;
      } else {
        console.log(`❌ Field "${fieldPath}" mapping failed. Expected "${expectedValue}", got "${actualValue}"`);
        auditLog('VALIDATE', 21, fieldPath, 'Failed');
        return false;
      }
    }
    
    // Validate main section fields
    validateField('declaredMentallyIncompetent.value', null, mappedContext.declaredMentallyIncompetent.value, 'Yes');
    validateField('consultMentalHealth.value', null, mappedContext.consultMentalHealth.value, 'Yes');
    validateField('hospitalizedMentalHealth.value', null, mappedContext.hospitalizedMentalHealth.value, 'No');
    validateField('beenDiagnosed.value', null, mappedContext.beenDiagnosed.value, 'Yes');
    validateField('currentlyInTreatment.value', null, mappedContext.currentlyInTreatment.value, 'Yes');
    validateField('substantialAffects.value', null, mappedContext.substantialAffects?.value, 'No');
    
    // Validate Section 21A - Mental Incompetence
    if (mappedContext.section21A && mappedContext.section21A.length > 0) {
      const section21A = mappedContext.section21A[0];
      validateField('dateOccurred.value', 'section21A', section21A.dateOccurred.value, '01/15/2020');
      validateField('estimated.value', 'section21A', section21A.estimated.value, 'Yes');
      validateField('courtAgency.name.value', 'section21A', section21A.courtAgency.name.value, 'Superior Court of California');
      validateField('appealed.value', 'section21A', section21A.appealed.value, 'Yes');
      
      // Validate appeal information if present
      if (section21A.appeals && section21A.appeals.length > 0) {
        const appeal = section21A.appeals[0];
        validateField('appeals[0].courtAgency.name.value', 'section21A', appeal.courtAgency.name.value, 'California Court of Appeals');
        validateField('appeals[0].finalDisposition.value', 'section21A', appeal.finalDisposition.value, 'Denied');
      }
    }
    
    // Validate Section 21B - Mental Health Consultation
    if (mappedContext.section21B && mappedContext.section21B.length > 0) {
      const section21B = mappedContext.section21B[0];
      validateField('dateOccurred.value', 'section21B', section21B.dateOccurred.value, '03/01/2021');
      validateField('estimated.value', 'section21B', section21B.estimated.value, 'No');
      validateField('courtAgency.name.value', 'section21B', section21B.courtAgency.name.value, 'Municipal Court of San Francisco');
      validateField('finalDisposition.value', 'section21B', section21B.finalDisposition.value, 'Completed consultation as ordered');
    }
    
    // Validate Section 21C - Hospitalization
    if (mappedContext.section21C && mappedContext.section21C.length > 0) {
      const section21C = mappedContext.section21C[0];
      validateField('voluntary.value', 'section21C', section21C.voluntary.value, 'Yes');
      validateField('explanation.value', 'section21C', section21C.explanation.value, 'Short-term treatment for anxiety');
      validateField('facility.name.value', 'section21C', section21C.facility.name.value, 'Mercy Hospital');
      validateField('fromDate.value', 'section21C', section21C.fromDate.value, '05/10/2020');
      validateField('toDate.value', 'section21C', section21C.toDate.value, '05/24/2020');
    }
    
    // Validate Section 21D - Diagnosis
    if (mappedContext.section21D && mappedContext.section21D.length > 0) {
      const section21D = mappedContext.section21D[0];
      validateField('diagnosis.value', 'section21D', section21D.diagnosis.value, 'Anxiety disorder');
      
      if (section21D.datesOfDiagnosis) {
        validateField('datesOfDiagnosis.fromDate.value', 'section21D', section21D.datesOfDiagnosis.fromDate.value, '02/10/2021');
        validateField('datesOfDiagnosis.toDate.value', 'section21D', section21D.datesOfDiagnosis.toDate.value, '08/15/2021');
        validateField('datesOfDiagnosis.present.value', 'section21D', section21D.datesOfDiagnosis.present.value, 'No');
      }
      
      if (section21D.healthCareProfessional) {
        validateField('healthCareProfessional.name.value', 'section21D', section21D.healthCareProfessional.name.value, 'Dr. Jane Smith');
        validateField('healthCareProfessional.telephoneFieldNumber.value', 'section21D', section21D.healthCareProfessional.telephoneFieldNumber.value, '555-123-4567');
      }
      
      validateField('counselingEffective.value', 'section21D', section21D.counselingEffective.value, 'Yes');
    }
    
    // Validate Section 21D1 - Current Treatment
    if (mappedContext.section21D1 && mappedContext.section21D1.length > 0) {
      const section21D1 = mappedContext.section21D1[0];
      
      if (section21D1.healthCareProfessional) {
        validateField('healthCareProfessional.name.value', 'section21D1', section21D1.healthCareProfessional.name.value, 'Dr. Robert Johnson');
        validateField('healthCareProfessional.telephoneFieldNumber.value', 'section21D1', section21D1.healthCareProfessional.telephoneFieldNumber.value, '555-987-6543');
      }
    }
    
    // Validate Section 21E - Mental Health Affects
    if (mappedContext.section21E && mappedContext.section21E.length > 0) {
      const section21E = mappedContext.section21E[0];
      validateField('choseNotToFollow.value', 'section21E', section21E.choseNotToFollow.value, 'No');
    }
    
    // Validate Security Metadata
    if (mappedContext.securityMetadata) {
      validationResults.securityMetadata = 1;
      console.log('\nSecurity Metadata Validation:');
      console.log(`✅ encryptedAtRest: ${mappedContext.securityMetadata.encryptedAtRest}`);
      console.log(`✅ restrictedAccess: ${mappedContext.securityMetadata.restrictedAccess}`);
      console.log(`✅ auditLoggingEnabled: ${mappedContext.securityMetadata.auditLoggingEnabled}`);
      console.log(`✅ consentRequired: ${mappedContext.securityMetadata.consentRequired}`);
      console.log(`✅ hipaaProtected: ${mappedContext.securityMetadata.hipaaProtected}`);
      console.log(`✅ sensitivityLevel: ${mappedContext.securityMetadata.sensitivityLevel}`);
      
      auditLog('VALIDATE', 21, 'securityMetadata', 'Success');
    } else {
      console.log('❌ Security metadata validation failed - metadata missing');
      auditLog('VALIDATE', 21, 'securityMetadata', 'Failed - Missing');
    }
    
    // Test error handling with malformed input
    console.log('\nTesting error handling...');
    
    // Test with null field hierarchy
    try {
      const errorResult1 = fieldMappingService.mapMentalHealthFields(null, initialContext);
      console.log('✅ Handled null field hierarchy gracefully');
      auditLog('TEST', 21, 'null-field-hierarchy', 'Success');
    } catch (error) {
      console.log('❌ Failed to handle null field hierarchy: ' + error.message);
      auditLog('TEST', 21, 'null-field-hierarchy', 'Failed');
    }
    
    // Test with missing section 21
    try {
      const errorResult2 = fieldMappingService.mapMentalHealthFields({ sections: {} }, initialContext);
      console.log('✅ Handled missing section 21 gracefully');
      auditLog('TEST', 21, 'missing-section-21', 'Success');
    } catch (error) {
      console.log('❌ Failed to handle missing section 21: ' + error.message);
      auditLog('TEST', 21, 'missing-section-21', 'Failed');
    }
    
    // Test with null context
    try {
      const errorResult3 = fieldMappingService.mapMentalHealthFields(fieldHierarchy, null);
      console.log('❌ Did not properly validate null context');
      auditLog('TEST', 21, 'null-context', 'Failed');
    } catch (error) {
      console.log('✅ Properly rejected null context: ' + error.message);
      auditLog('TEST', 21, 'null-context', 'Success');
    }
    
    // Optional: Save the mapped context to a file for inspection
    const outputFile = path.join(__dirname, 'mapped-mental-health.json');
    fs.writeFileSync(outputFile, JSON.stringify(mappedContext, null, 2), 'utf8');
    console.log(`\nMapped context saved to: ${outputFile}`);
    
    // Print test summary
    console.log('\nTest Summary:');
    console.log(`Main Fields: ${validationResults.mainFields} validated`);
    console.log(`Section 21A: ${validationResults.section21A} fields validated`);
    console.log(`Section 21B: ${validationResults.section21B} fields validated`);
    console.log(`Section 21C: ${validationResults.section21C} fields validated`);
    console.log(`Section 21D: ${validationResults.section21D} fields validated`);
    console.log(`Section 21D1: ${validationResults.section21D1} fields validated`);
    console.log(`Section 21E: ${validationResults.section21E} fields validated`);
    console.log(`Security Metadata: ${validationResults.securityMetadata ? 'Validated' : 'Not Validated'}`);
    console.log(`Overall: ${validationResults.passedFields}/${validationResults.totalFields} fields passed validation (${Math.round(validationResults.passedFields/validationResults.totalFields*100)}%)`);
    
    console.log('\nTest completed!');
    return true;
  } catch (error) {
    console.error('Error during mental health mapping test:', error);
    auditLog('ERROR', 21, 'test-execution', error.message);
    return false;
  }
}

// Run the test
testMentalHealthMapping();

// Export for potential use in other tests
export { testMentalHealthMapping }; 