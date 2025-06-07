/**
 * Section 21 Field Generator
 * 
 * Generates Field<T> objects for Section 21 using actual PDF field names from sections-references
 * This replaces the problematic createFieldFromReference calls with proper PDF field mapping
 */

import type { Field } from '../../../../api/interfaces/shared/field';
import { createFieldFromPDFReference, getPDFFieldName, SECTION21_FIELD_MAPPINGS } from './section21-field-mapping';

/**
 * Generate all Section 21 fields with proper PDF field names
 */
export function generateSection21Fields() {
  console.log('🔧 Generating Section 21 fields with actual PDF field names...');
  
  const fields = {
    // Section 21a - Mental Health Consultations
    mentalHealthConsultations: {
      hasConsultation: createFieldFromPDFReference(
        SECTION21_FIELD_MAPPINGS.mentalHealthConsultations.hasConsultation,
        'NO'
      ),
      entry1: {
        courtName: createFieldFromPDFReference(
          SECTION21_FIELD_MAPPINGS.mentalHealthConsultations.entries[0].courtName,
          ''
        ),
        address: {
          street: createFieldFromPDFReference(
            SECTION21_FIELD_MAPPINGS.mentalHealthConsultations.entries[0].address.street,
            ''
          ),
          city: createFieldFromPDFReference(
            SECTION21_FIELD_MAPPINGS.mentalHealthConsultations.entries[0].address.city,
            ''
          ),
          state: createFieldFromPDFReference(
            SECTION21_FIELD_MAPPINGS.mentalHealthConsultations.entries[0].address.state,
            ''
          ),
          zipCode: createFieldFromPDFReference(
            SECTION21_FIELD_MAPPINGS.mentalHealthConsultations.entries[0].address.zipCode,
            ''
          ),
          country: createFieldFromPDFReference(
            SECTION21_FIELD_MAPPINGS.mentalHealthConsultations.entries[0].address.country,
            'United States'
          )
        },
        dateFrom: createFieldFromPDFReference(
          SECTION21_FIELD_MAPPINGS.mentalHealthConsultations.entries[0].dateFrom,
          ''
        ),
        dateFromEstimated: createFieldFromPDFReference(
          SECTION21_FIELD_MAPPINGS.mentalHealthConsultations.entries[0].dateFromEstimated,
          false
        ),
        appealCourt1: createFieldFromPDFReference(
          SECTION21_FIELD_MAPPINGS.mentalHealthConsultations.entries[0].appealCourt1,
          ''
        ),
        appealAddress1: {
          street: createFieldFromPDFReference(
            SECTION21_FIELD_MAPPINGS.mentalHealthConsultations.entries[0].appealAddress1.street,
            ''
          ),
          city: createFieldFromPDFReference(
            SECTION21_FIELD_MAPPINGS.mentalHealthConsultations.entries[0].appealAddress1.city,
            ''
          ),
          state: createFieldFromPDFReference(
            SECTION21_FIELD_MAPPINGS.mentalHealthConsultations.entries[0].appealAddress1.state,
            ''
          ),
          zipCode: createFieldFromPDFReference(
            SECTION21_FIELD_MAPPINGS.mentalHealthConsultations.entries[0].appealAddress1.zipCode,
            ''
          ),
          country: createFieldFromPDFReference(
            SECTION21_FIELD_MAPPINGS.mentalHealthConsultations.entries[0].appealAddress1.country,
            'United States'
          )
        },
        finalDisposition1: createFieldFromPDFReference(
          SECTION21_FIELD_MAPPINGS.mentalHealthConsultations.entries[0].finalDisposition1,
          ''
        ),
        appealCourt2: createFieldFromPDFReference(
          SECTION21_FIELD_MAPPINGS.mentalHealthConsultations.entries[0].appealCourt2,
          ''
        ),
        appealAddress2: {
          street: createFieldFromPDFReference(
            SECTION21_FIELD_MAPPINGS.mentalHealthConsultations.entries[0].appealAddress2.street,
            ''
          ),
          city: createFieldFromPDFReference(
            SECTION21_FIELD_MAPPINGS.mentalHealthConsultations.entries[0].appealAddress2.city,
            ''
          ),
          state: createFieldFromPDFReference(
            SECTION21_FIELD_MAPPINGS.mentalHealthConsultations.entries[0].appealAddress2.state,
            ''
          ),
          zipCode: createFieldFromPDFReference(
            SECTION21_FIELD_MAPPINGS.mentalHealthConsultations.entries[0].appealAddress2.zipCode,
            ''
          ),
          country: createFieldFromPDFReference(
            SECTION21_FIELD_MAPPINGS.mentalHealthConsultations.entries[0].appealAddress2.country,
            'United States'
          )
        },
        finalDisposition2: createFieldFromPDFReference(
          SECTION21_FIELD_MAPPINGS.mentalHealthConsultations.entries[0].finalDisposition2,
          ''
        )
      }
    },

    // Section 21a2 - Mental Health Consultations Entry 2
    mentalHealthConsultations2: {
      hasConsultation: createFieldFromPDFReference(
        SECTION21_FIELD_MAPPINGS.mentalHealthConsultations2.hasConsultation,
        'NO'
      ),
      entry1: {
        courtName: createFieldFromPDFReference(
          SECTION21_FIELD_MAPPINGS.mentalHealthConsultations2.entries[0].courtName,
          ''
        ),
        address: {
          street: createFieldFromPDFReference(
            SECTION21_FIELD_MAPPINGS.mentalHealthConsultations2.entries[0].address.street,
            ''
          ),
          city: createFieldFromPDFReference(
            SECTION21_FIELD_MAPPINGS.mentalHealthConsultations2.entries[0].address.city,
            ''
          ),
          state: createFieldFromPDFReference(
            SECTION21_FIELD_MAPPINGS.mentalHealthConsultations2.entries[0].address.state,
            ''
          ),
          zipCode: createFieldFromPDFReference(
            SECTION21_FIELD_MAPPINGS.mentalHealthConsultations2.entries[0].address.zipCode,
            ''
          ),
          country: createFieldFromPDFReference(
            SECTION21_FIELD_MAPPINGS.mentalHealthConsultations2.entries[0].address.country,
            'United States'
          )
        },
        dateFrom: createFieldFromPDFReference(
          SECTION21_FIELD_MAPPINGS.mentalHealthConsultations2.entries[0].dateFrom,
          ''
        ),
        dateFromEstimated: createFieldFromPDFReference(
          SECTION21_FIELD_MAPPINGS.mentalHealthConsultations2.entries[0].dateFromEstimated,
          false
        )
      }
    },

    // Section 21b - Court Ordered Treatment
    courtOrderedTreatment: {
      hasCourtOrdered: createFieldFromPDFReference(
        SECTION21_FIELD_MAPPINGS.courtOrderedTreatment.hasCourtOrdered,
        'NO'
      )
    },

    // Section 21c - Hospitalization
    hospitalization: {
      hasConsultation: createFieldFromPDFReference(
        SECTION21_FIELD_MAPPINGS.hospitalization.hasConsultation,
        'NO'
      )
    },

    // Section 21d - Other Mental Health
    otherMentalHealth: {
      hasConsultation: createFieldFromPDFReference(
        SECTION21_FIELD_MAPPINGS.otherMentalHealth.hasConsultation,
        'NO'
      )
    }
  };

  console.log('✅ Section 21 fields generated successfully with PDF field names');
  return fields;
}

/**
 * Create a field update function that uses proper PDF field names
 */
export function createSection21FieldUpdater() {
  return function updateField(contextPath: string, value: any): { pdfFieldName: string | null; field: Field<any> | null } {
    const pdfFieldName = getPDFFieldName(contextPath);
    
    if (!pdfFieldName) {
      console.warn(`No PDF field mapping found for context path: ${contextPath}`);
      return { pdfFieldName: null, field: null };
    }
    
    const field = createFieldFromPDFReference(pdfFieldName, value);
    console.log(`🔄 Section 21 field update: ${contextPath} → ${pdfFieldName} = ${value}`);
    
    return { pdfFieldName, field };
  };
}

/**
 * Validate that all generated fields have valid PDF field names
 */
export function validateGeneratedFields() {
  const fields = generateSection21Fields();
  const issues: string[] = [];
  
  function validateFieldObject(obj: any, path: string = '') {
    for (const [key, value] of Object.entries(obj)) {
      const currentPath = path ? `${path}.${key}` : key;
      
      if (value && typeof value === 'object' && 'id' in value && 'name' in value) {
        // This is a Field object
        const field = value as Field<any>;
        if (!field.name.startsWith('form1[0]')) {
          issues.push(`Invalid PDF field name at ${currentPath}: ${field.name}`);
        }
      } else if (typeof value === 'object' && value !== null) {
        validateFieldObject(value, currentPath);
      }
    }
  }
  
  validateFieldObject(fields);
  
  return {
    valid: issues.length === 0,
    issues,
    totalFields: countFields(fields)
  };
}

/**
 * Count total number of Field objects
 */
function countFields(obj: any): number {
  let count = 0;
  
  for (const value of Object.values(obj)) {
    if (value && typeof value === 'object') {
      if ('id' in value && 'name' in value && 'type' in value) {
        count++;
      } else {
        count += countFields(value);
      }
    }
  }
  
  return count;
}
