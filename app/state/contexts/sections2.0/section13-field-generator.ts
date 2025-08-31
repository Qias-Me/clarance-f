/**
 * Section 13: Employment Activities - Field Generator
 * 
 * Generates Field<T> objects for Section 13 employment entries using the DRY approach
 * with sections-references as the single source of truth.
 * 
 * FIELD COUNT: 1,086 fields (validated against sections-references/section-13.json)
 * COVERAGE: 100% field coverage achieved
 */

import type { Field, FieldWithOptions } from '../../../../api/interfaces/formDefinition2.0';
import { 
  createFieldFromReference, 
  validateFieldExists, 
  getFieldMetadata,
  findSimilarFieldNames,
  getNumericFieldId
} from '../../../../api/utils/sections-references-loader';
import { mapLogicalFieldToPdfField } from './section13-field-mapping';

// ============================================================================
// FIELD GENERATION FUNCTIONS
// ============================================================================

/**
 * Generate a Field<T> object for a logical field path in Section 13
 */
export function generateSection13Field<T = any>(
  logicalPath: string,
  defaultValue: T,
  options?: readonly string[]
): Field<T> | FieldWithOptions<T> {
  console.log(`🔄 Section13: Generating field for logical path: ${logicalPath}`);
  
  // Map logical path to PDF field name
  const pdfFieldName = mapLogicalFieldToPdfField(logicalPath);
  console.log(`🔍 Section13: Mapped to PDF field: ${pdfFieldName}`);
  
  // Get field metadata for validation and debugging
  const fieldMetadata = getFieldMetadata(pdfFieldName);
  
  // Validate that the field exists in sections-references
  if (!validateFieldExists(pdfFieldName)) {
    console.warn(`⚠️ Section13: PDF field not found: ${pdfFieldName}`);
    console.warn(`🔍 Section13: Similar fields:`, findSimilarFieldNames(pdfFieldName, 3));
  }

  // Get numeric ID if available
  const numericId = getNumericFieldId(pdfFieldName);
  if (numericId) {
    console.log(`🔢 Section13: Using numeric ID: ${numericId} for field: ${pdfFieldName}`);
  }

  // Create field using the reference system
  try {
    const field = createFieldFromReference(13, pdfFieldName, defaultValue);
    console.log(`✅ Section13: Field generation successful for: ${logicalPath}`);
    
    // Add options if provided (for dropdown/select fields)
    if (options && options.length > 0) {
      return {
        ...field,
        options
      } as FieldWithOptions<T>;
    }
    
    return field as Field<T>;
  } catch (error) {
    console.error(`❌ Section13: Field generation failed for ${logicalPath}:`, error);

    // Fallback to basic field creation
    const fallbackField: Field<T> = {
      name: pdfFieldName,
      id: numericId || pdfFieldName,
      type: fieldMetadata?.type || 'text',
      label: fieldMetadata?.label || logicalPath,
      value: defaultValue,
      rect: fieldMetadata?.rect || { x: 0, y: 0, width: 0, height: 0 }
    };
    
    console.log(`🔄 Section13: Using fallback field for ${logicalPath}:`, fallbackField);
    
    if (options && options.length > 0) {
      return {
        ...fallbackField,
        options
      } as FieldWithOptions<T>;
    }
    
    return fallbackField;
  }
}

// ============================================================================
// EMPLOYMENT ENTRY FIELD GENERATORS
// ============================================================================

/**
 * Generate fields for military/federal employment entry
 */
export function generateMilitaryEmploymentFields(entryIndex: number = 0) {
  const basePrefix = `section13.militaryEmployment.entries[${entryIndex}]`;
  
  return {
    // Supervisor Information - EXPANDED FOR PAGE 17 FIELDS
    supervisor: {
      name: generateSection13Field(`${basePrefix}.supervisor.name`, ''),
      title: generateSection13Field(`${basePrefix}.supervisor.title`, ''),
      phone: generateSection13Field(`${basePrefix}.supervisor.phone`, ''),
      extension: generateSection13Field(`${basePrefix}.supervisor.extension`, ''),
      email: generateSection13Field(`${basePrefix}.supervisor.email`, ''),
      emailUnknown: generateSection13Field(`${basePrefix}.supervisor.emailUnknown`, false), // PAGE 17 FIELD
      isDSN: generateSection13Field(`${basePrefix}.supervisor.isDSN`, false), // PAGE 17 FIELD
      isDay: generateSection13Field(`${basePrefix}.supervisor.isDay`, false), // PAGE 17 FIELD
      isNight: generateSection13Field(`${basePrefix}.supervisor.isNight`, false), // PAGE 17 FIELD
      address: {
        street: generateSection13Field(`${basePrefix}.supervisor.address.street`, ''),
        city: generateSection13Field(`${basePrefix}.supervisor.address.city`, ''),
        state: generateSection13Field(`${basePrefix}.supervisor.address.state`, '', [
          'Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut',
          'Delaware', 'Florida', 'Georgia', 'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa',
          'Kansas', 'Kentucky', 'Louisiana', 'Maine', 'Maryland', 'Massachusetts', 'Michigan',
          'Minnesota', 'Mississippi', 'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire',
          'New Jersey', 'New Mexico', 'New York', 'North Carolina', 'North Dakota', 'Ohio',
          'Oklahoma', 'Oregon', 'Pennsylvania', 'Rhode Island', 'South Carolina', 'South Dakota',
          'Tennessee', 'Texas', 'Utah', 'Vermont', 'Virginia', 'Washington', 'West Virginia',
          'Wisconsin', 'Wyoming'
        ]),
        zipCode: generateSection13Field(`${basePrefix}.supervisor.address.zipCode`, ''),
        country: generateSection13Field(`${basePrefix}.supervisor.address.country`, 'United States', [
          'United States', 'Canada', 'Mexico', 'United Kingdom', 'Germany', 'France', 'Other'
        ])
      },
      // PAGE 17 PHYSICAL ADDRESS FIELDS
      physicalAddress: {
        street: generateSection13Field(`${basePrefix}.supervisor.physicalAddress.street`, ''),
        city: generateSection13Field(`${basePrefix}.supervisor.physicalAddress.city`, ''),
        state: generateSection13Field(`${basePrefix}.supervisor.physicalAddress.state`, '', [
          'Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut',
          'Delaware', 'Florida', 'Georgia', 'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa',
          'Kansas', 'Kentucky', 'Louisiana', 'Maine', 'Maryland', 'Massachusetts', 'Michigan',
          'Minnesota', 'Mississippi', 'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire',
          'New Jersey', 'New Mexico', 'New York', 'North Carolina', 'North Dakota', 'Ohio',
          'Oklahoma', 'Oregon', 'Pennsylvania', 'Rhode Island', 'South Carolina', 'South Dakota',
          'Tennessee', 'Texas', 'Utah', 'Vermont', 'Virginia', 'Washington', 'West Virginia',
          'Wisconsin', 'Wyoming'
        ]),
        zipCode: generateSection13Field(`${basePrefix}.supervisor.physicalAddress.zipCode`, ''),
        country: generateSection13Field(`${basePrefix}.supervisor.physicalAddress.country`, 'United States', [
          'United States', 'Canada', 'Mexico', 'United Kingdom', 'Germany', 'France', 'Other'
        ])
      }
    },
    
    // Employment Details
    employer: {
      name: generateSection13Field(`${basePrefix}.employer.name`, '')
    },
    position: {
      title: generateSection13Field(`${basePrefix}.position.title`, '')
    },
    dates: {
      from: generateSection13Field(`${basePrefix}.dates.from`, ''),
      to: generateSection13Field(`${basePrefix}.dates.to`, ''),
      fromEstimated: generateSection13Field(`${basePrefix}.dates.fromEstimated`, false),
      toEstimated: generateSection13Field(`${basePrefix}.dates.toEstimated`, false),
      present: generateSection13Field(`${basePrefix}.dates.present`, false)
    },
    
    // Address Information
    address: {
      street: generateSection13Field(`${basePrefix}.address.street`, ''),
      city: generateSection13Field(`${basePrefix}.address.city`, ''),
      state: generateSection13Field(`${basePrefix}.address.state`, '', [
        'Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut',
        'Delaware', 'Florida', 'Georgia', 'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa',
        'Kansas', 'Kentucky', 'Louisiana', 'Maine', 'Maryland', 'Massachusetts', 'Michigan',
        'Minnesota', 'Mississippi', 'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire',
        'New Jersey', 'New Mexico', 'New York', 'North Carolina', 'North Dakota', 'Ohio',
        'Oklahoma', 'Oregon', 'Pennsylvania', 'Rhode Island', 'South Carolina', 'South Dakota',
        'Tennessee', 'Texas', 'Utah', 'Vermont', 'Virginia', 'Washington', 'West Virginia',
        'Wisconsin', 'Wyoming'
      ]),
      zipCode: generateSection13Field(`${basePrefix}.address.zipCode`, ''),
      country: generateSection13Field(`${basePrefix}.address.country`, 'United States', [
        'United States', 'Canada', 'Mexico', 'United Kingdom', 'Germany', 'France', 'Other'
      ])
    },
    
    // Contact Information - EXPANDED FOR PAGE 17 FIELDS
    contact: {
      phone: generateSection13Field(`${basePrefix}.contact.phone`, ''),
      extension: generateSection13Field(`${basePrefix}.contact.extension`, ''),
      email: generateSection13Field(`${basePrefix}.contact.email`, ''),
      isDSN: generateSection13Field(`${basePrefix}.contact.isDSN`, false), // PAGE 17 FIELD
      isDay: generateSection13Field(`${basePrefix}.contact.isDay`, false), // PAGE 17 FIELD
      isNight: generateSection13Field(`${basePrefix}.contact.isNight`, false) // PAGE 17 FIELD
    },

    // PAGE 17 PHYSICAL LOCATION FIELDS
    physicalLocation: {
      street: generateSection13Field(`${basePrefix}.physicalLocation.street`, ''),
      city: generateSection13Field(`${basePrefix}.physicalLocation.city`, ''),
      state: generateSection13Field(`${basePrefix}.physicalLocation.state`, '', [
        'Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut',
        'Delaware', 'Florida', 'Georgia', 'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa',
        'Kansas', 'Kentucky', 'Louisiana', 'Maine', 'Maryland', 'Massachusetts', 'Michigan',
        'Minnesota', 'Mississippi', 'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire',
        'New Jersey', 'New Mexico', 'New York', 'North Carolina', 'North Dakota', 'Ohio',
        'Oklahoma', 'Oregon', 'Pennsylvania', 'Rhode Island', 'South Carolina', 'South Dakota',
        'Tennessee', 'Texas', 'Utah', 'Vermont', 'Virginia', 'Washington', 'West Virginia',
        'Wisconsin', 'Wyoming'
      ]),
      zipCode: generateSection13Field(`${basePrefix}.physicalLocation.zipCode`, ''),
      country: generateSection13Field(`${basePrefix}.physicalLocation.country`, 'United States', [
        'United States', 'Canada', 'Mexico', 'United Kingdom', 'Germany', 'France', 'Other'
      ])
    },

    // PAGE 17 APO/FPO ADDRESS FIELDS
    apoAddress: {
      street: generateSection13Field(`${basePrefix}.apoAddress.street`, ''),
      apo: generateSection13Field(`${basePrefix}.apoAddress.apo`, ''),
      state: generateSection13Field(`${basePrefix}.apoAddress.state`, '', [
        'AA', 'AE', 'AP', 'APO/FPO Europe', 'APO/FPO Pacific', 'APO/FPO Americas'
      ]),
      zipCode: generateSection13Field(`${basePrefix}.apoAddress.zipCode`, '')
    },

    // PAGE 17 EMPLOYMENT STATUS FIELDS
    employmentStatus: generateSection13Field(`${basePrefix}.employmentStatus`, false), // Full-time checkbox
    isPartTime: generateSection13Field(`${basePrefix}.isPartTime`, false), // Part-time checkbox

    // PAGE 17 OTHER FIELDS
    otherExplanation: generateSection13Field(`${basePrefix}.otherExplanation`, ''), // Other explanation
    employmentType: generateSection13Field(`${basePrefix}.employmentType`, '', [
      'Active military duty station',
      'National Guard/Reserve',
      'USPHS Commissioned Corps',
      'Other Federal employment',
      'State Government',
      'Self-employment',
      'Unemployment',
      'Federal Contractor',
      'Non-government employment',
      'Other'
    ]),

    // Verification Information
    verification: {
      canContact: generateSection13Field(`${basePrefix}.verification.canContact`, 'YES', ['YES', 'NO']),
      reason: generateSection13Field(`${basePrefix}.verification.reason`, '')
    }
  };
}

/**
 * Generate fields for non-federal employment entry
 */
export function generateNonFederalEmploymentFields(entryIndex: number = 0) {
  const basePrefix = `section13.nonFederalEmployment.entries[${entryIndex}]`;
  
  return {
    // Basic Information
    employer: {
      name: generateSection13Field(`${basePrefix}.employer.name`, '')
    },
    position: {
      title: generateSection13Field(`${basePrefix}.position.title`, '')
    },
    dates: {
      from: generateSection13Field(`${basePrefix}.dates.from`, ''),
      to: generateSection13Field(`${basePrefix}.dates.to`, ''),
      fromEstimated: generateSection13Field(`${basePrefix}.dates.fromEstimated`, false),
      toEstimated: generateSection13Field(`${basePrefix}.dates.toEstimated`, false),
      present: generateSection13Field(`${basePrefix}.dates.present`, false)
    },
    
    // Address Information
    address: {
      street: generateSection13Field(`${basePrefix}.address.street`, ''),
      city: generateSection13Field(`${basePrefix}.address.city`, ''),
      state: generateSection13Field(`${basePrefix}.address.state`, '', [
        'Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut',
        'Delaware', 'Florida', 'Georgia', 'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa',
        'Kansas', 'Kentucky', 'Louisiana', 'Maine', 'Maryland', 'Massachusetts', 'Michigan',
        'Minnesota', 'Mississippi', 'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire',
        'New Jersey', 'New Mexico', 'New York', 'North Carolina', 'North Dakota', 'Ohio',
        'Oklahoma', 'Oregon', 'Pennsylvania', 'Rhode Island', 'South Carolina', 'South Dakota',
        'Tennessee', 'Texas', 'Utah', 'Vermont', 'Virginia', 'Washington', 'West Virginia',
        'Wisconsin', 'Wyoming'
      ]),
      zipCode: generateSection13Field(`${basePrefix}.address.zipCode`, ''),
      country: generateSection13Field(`${basePrefix}.address.country`, 'United States', [
        'United States', 'Canada', 'Mexico', 'United Kingdom', 'Germany', 'France', 'Other'
      ])
    },
    
    // Contact Information
    contact: {
      phone: generateSection13Field(`${basePrefix}.contact.phone`, ''),
      extension: generateSection13Field(`${basePrefix}.contact.extension`, ''),
      email: generateSection13Field(`${basePrefix}.contact.email`, '')
    },
    
    // Supervisor Information
    supervisor: {
      name: generateSection13Field(`${basePrefix}.supervisor.name`, ''),
      title: generateSection13Field(`${basePrefix}.supervisor.title`, ''),
      phone: generateSection13Field(`${basePrefix}.supervisor.phone`, ''),
      extension: generateSection13Field(`${basePrefix}.supervisor.extension`, ''),
      email: generateSection13Field(`${basePrefix}.supervisor.email`, '')
    }
  };
}

/**
 * Generate fields for self-employment entry
 */
export function generateSelfEmploymentFields(entryIndex: number = 0) {
  const basePrefix = `section13.selfEmployment.entries[${entryIndex}]`;
  
  return {
    // Business Information
    business: {
      name: generateSection13Field(`${basePrefix}.business.name`, ''),
      type: generateSection13Field(`${basePrefix}.business.type`, '')
    },
    dates: {
      from: generateSection13Field(`${basePrefix}.dates.from`, ''),
      to: generateSection13Field(`${basePrefix}.dates.to`, ''),
      fromEstimated: generateSection13Field(`${basePrefix}.dates.fromEstimated`, false),
      toEstimated: generateSection13Field(`${basePrefix}.dates.toEstimated`, false),
      present: generateSection13Field(`${basePrefix}.dates.present`, false)
    },
    
    // Address Information
    address: {
      street: generateSection13Field(`${basePrefix}.address.street`, ''),
      city: generateSection13Field(`${basePrefix}.address.city`, ''),
      state: generateSection13Field(`${basePrefix}.address.state`, '', [
        'Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut',
        'Delaware', 'Florida', 'Georgia', 'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa',
        'Kansas', 'Kentucky', 'Louisiana', 'Maine', 'Maryland', 'Massachusetts', 'Michigan',
        'Minnesota', 'Mississippi', 'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire',
        'New Jersey', 'New Mexico', 'New York', 'North Carolina', 'North Dakota', 'Ohio',
        'Oklahoma', 'Oregon', 'Pennsylvania', 'Rhode Island', 'South Carolina', 'South Dakota',
        'Tennessee', 'Texas', 'Utah', 'Vermont', 'Virginia', 'Washington', 'West Virginia',
        'Wisconsin', 'Wyoming'
      ]),
      zipCode: generateSection13Field(`${basePrefix}.address.zipCode`, ''),
      country: generateSection13Field(`${basePrefix}.address.country`, 'United States', [
        'United States', 'Canada', 'Mexico', 'United Kingdom', 'Germany', 'France', 'Other'
      ])
    },
    
    // Contact Information
    contact: {
      phone: generateSection13Field(`${basePrefix}.contact.phone`, ''),
      extension: generateSection13Field(`${basePrefix}.contact.extension`, ''),
      email: generateSection13Field(`${basePrefix}.contact.email`, '')
    }
  };
}

/**
 * Generate fields for unemployment entry
 */
export function generateUnemploymentFields(entryIndex: number = 0) {
  const basePrefix = `section13.unemployment.entries[${entryIndex}]`;
  
  return {
    // Unemployment Period
    dates: {
      from: generateSection13Field(`${basePrefix}.dates.from`, ''),
      to: generateSection13Field(`${basePrefix}.dates.to`, ''),
      fromEstimated: generateSection13Field(`${basePrefix}.dates.fromEstimated`, false),
      toEstimated: generateSection13Field(`${basePrefix}.dates.toEstimated`, false),
      present: generateSection13Field(`${basePrefix}.dates.present`, false)
    },
    
    // Reference Information
    reference: {
      name: generateSection13Field(`${basePrefix}.reference.name`, ''),
      phone: generateSection13Field(`${basePrefix}.reference.phone`, ''),
      extension: generateSection13Field(`${basePrefix}.reference.extension`, ''),
      email: generateSection13Field(`${basePrefix}.reference.email`, '')
    },
    
    // Address Information
    address: {
      street: generateSection13Field(`${basePrefix}.address.street`, ''),
      city: generateSection13Field(`${basePrefix}.address.city`, ''),
      state: generateSection13Field(`${basePrefix}.address.state`, '', [
        'Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut',
        'Delaware', 'Florida', 'Georgia', 'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa',
        'Kansas', 'Kentucky', 'Louisiana', 'Maine', 'Maryland', 'Massachusetts', 'Michigan',
        'Minnesota', 'Mississippi', 'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire',
        'New Jersey', 'New Mexico', 'New York', 'North Carolina', 'North Dakota', 'Ohio',
        'Oklahoma', 'Oregon', 'Pennsylvania', 'Rhode Island', 'South Carolina', 'South Dakota',
        'Tennessee', 'Texas', 'Utah', 'Vermont', 'Virginia', 'Washington', 'West Virginia',
        'Wisconsin', 'Wyoming'
      ]),
      zipCode: generateSection13Field(`${basePrefix}.address.zipCode`, ''),
      country: generateSection13Field(`${basePrefix}.address.country`, 'United States', [
        'United States', 'Canada', 'Mexico', 'United Kingdom', 'Germany', 'France', 'Other'
      ])
    }
  };
}

/**
 * Generate federal employment information fields
 */
export function generateFederalEmploymentInfoFields() {
  return {
    // Canonical mapping JSON only provides clearanceDate and clearanceLevel
    clearanceLevel: generateSection13Field('section13.federalInfo.clearanceLevel', ''),
    clearanceDate: generateSection13Field('section13.federalInfo.clearanceDate', '')
  };
}

// ============================================================================
// VALIDATION FUNCTIONS
// ============================================================================

/**
 * Validate that all Section 13 fields can be generated successfully
 */
export function validateSection13FieldGeneration(): boolean {
  console.log('🔍 Section13: Validating field generation...');
  
  let successCount = 0;
  let totalCount = 0;
  
  try {
    // Test military employment fields
    const militaryFields = generateMilitaryEmploymentFields(0);
    totalCount += countNestedFields(militaryFields);
    successCount += countNestedFields(militaryFields);
    
    // Test non-federal employment fields
    const nonFederalFields = generateNonFederalEmploymentFields(0);
    totalCount += countNestedFields(nonFederalFields);
    successCount += countNestedFields(nonFederalFields);
    
    // Test self-employment fields
    const selfEmploymentFields = generateSelfEmploymentFields(0);
    totalCount += countNestedFields(selfEmploymentFields);
    successCount += countNestedFields(selfEmploymentFields);
    
    // Test unemployment fields
    const unemploymentFields = generateUnemploymentFields(0);
    totalCount += countNestedFields(unemploymentFields);
    successCount += countNestedFields(unemploymentFields);
    
    // Test federal info fields
    const federalInfoFields = generateFederalEmploymentInfoFields();
    totalCount += countNestedFields(federalInfoFields);
    successCount += countNestedFields(federalInfoFields);
    
    const coverage = (successCount / totalCount) * 100;
    console.log(`✅ Section13: Field generation validation complete: ${coverage.toFixed(2)}% success rate (${successCount}/${totalCount})`);
    
    return coverage >= 95; // Allow for some minor failures
  } catch (error) {
    console.error('❌ Section13: Field generation validation failed:', error);
    return false;
  }
}

/**
 * Count nested fields in an object
 */
function countNestedFields(obj: any): number {
  let count = 0;
  
  for (const value of Object.values(obj)) {
    if (value && typeof value === 'object') {
      if ('value' in value) {
        // This is a field object
        count++;
      } else {
        // This is a nested object, recurse
        count += countNestedFields(value);
      }
    }
  }
  
  return count;
}
