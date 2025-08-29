/**
 * Section 13 Enhanced Integration Module
 * 
 * Integrates the complete 1,086-field JSON mapping with the existing 
 * Section 13 form system to achieve 100% field coverage.
 */

import { 
  loadSection13JsonMappings, 
  getFieldsByEmploymentType,
  getAllFieldMappings,
  getCoverageReport,
  initializeJsonLoader
} from './section13-json-loader';

import { 
  generateSection13FieldMapping,
  getCachedFieldMapping,
  clearFieldMappingCache,
  type FieldMapping
} from './section13-field-mapping';

// Enhanced field mapping that combines JSON source with manual generators
let enhancedFieldMappings: FieldMapping[] | null = null;

/**
 * Generate enhanced field mappings that include all 1,086 fields from JSON
 */
export const generateEnhancedFieldMapping = async (): Promise<FieldMapping[]> => {
  if (enhancedFieldMappings) {
    return enhancedFieldMappings;
  }

  try {
    // Load the complete JSON mappings
    await initializeJsonLoader();
    
    // Get all field mappings from JSON (1,086 fields)
    let jsonMappings: FieldMapping[] = [];
    try {
      jsonMappings = getAllFieldMappings();
      console.log(`Got ${jsonMappings.length} mappings from getAllFieldMappings()`);
    } catch (error) {
      console.warn('Failed to get JSON mappings, retrying after initialization:', error);
      // Re-initialize and try again
      await initializeJsonLoader();
      jsonMappings = getAllFieldMappings();
      console.log(`After retry, got ${jsonMappings.length} mappings from getAllFieldMappings()`);
    }
    
    // Debug: Check first few JSON mappings
    if (jsonMappings.length > 0) {
      console.log('Sample JSON mappings:');
      jsonMappings.slice(0, 3).forEach((m, i) => {
        console.log(`  ${i + 1}. ${m.uiPath}`);
      });
    } else {
      console.warn('⚠️ No JSON mappings returned from getAllFieldMappings()');
    }
    
    // Get existing manual mappings for comparison
    const manualMappings = generateSection13FieldMapping();
    console.log(`Got ${manualMappings.length} manual mappings`);
    
    // Combine mappings - use JSON as source of truth
    const combinedMappings = new Map<string, FieldMapping>();
    
    // Add JSON mappings first (source of truth - all 1086 fields)
    let jsonAdded = 0;
    jsonMappings.forEach(mapping => {
      combinedMappings.set(mapping.uiPath, mapping);
      jsonAdded++;
    });
    console.log(`Added ${jsonAdded} JSON mappings to combined map`);
    
    // Only add manual mappings that don't exist in JSON
    let manualAdded = 0;
    manualMappings.forEach(mapping => {
      if (!combinedMappings.has(mapping.uiPath)) {
        combinedMappings.set(mapping.uiPath, mapping);
        manualAdded++;
      }
    });
    console.log(`Added ${manualAdded} unique manual mappings to combined map`);
    
    enhancedFieldMappings = Array.from(combinedMappings.values());
    
    console.log(`Enhanced field mapping generated: ${enhancedFieldMappings.length} total fields`);
    console.log(`JSON mappings: ${jsonMappings.length}, Manual mappings: ${manualMappings.length}`);
    console.log(`Expected: 1086 fields, Actual: ${enhancedFieldMappings.length} fields`);
    
    // If we don't have all fields, log a warning
    if (enhancedFieldMappings.length < 1086) {
      console.warn(`⚠️ Enhanced mapping has only ${enhancedFieldMappings.length} fields instead of 1086`);
      console.warn('This may indicate an issue with the JSON loader or mapping deduplication');
    }
    
    return enhancedFieldMappings;
  } catch (error) {
    console.error('Error generating enhanced field mapping:', error);
    // Fall back to manual mappings if JSON loading fails
    const manualMappings = generateSection13FieldMapping();
    console.warn('Falling back to manual mappings only:', manualMappings.length);
    return manualMappings;
  }
};

/**
 * Get enhanced field mapping with full coverage
 */
export const getEnhancedFieldMapping = async (): Promise<FieldMapping[]> => {
  if (!enhancedFieldMappings) {
    return await generateEnhancedFieldMapping();
  }
  return enhancedFieldMappings;
};

/**
 * Get field mappings for specific employment type with full JSON coverage
 */
export const getEnhancedEmploymentTypeMapping = async (employmentType: string): Promise<FieldMapping[]> => {
  await initializeJsonLoader();
  
  // Map dropdown values to internal keys
  const employmentTypeMap: Record<string, string> = {
    "Military Service": "militaryEmployment",
    "Federal Employment": "federalInfo",
    "Private Company": "nonFederalEmployment",
    "State Government": "nonFederalEmployment",
    "Local Government": "nonFederalEmployment",
    "Non-Profit Organization": "nonFederalEmployment",
    "Self-Employment": "selfEmployment",
    "Contract Work": "nonFederalEmployment",
    "Consulting": "nonFederalEmployment",
    "Unemployment": "unemployment",
    "Other": "nonFederalEmployment"
  };
  
  const mappedType = employmentTypeMap[employmentType] || employmentType;
  const jsonFields = getFieldsByEmploymentType(mappedType);
  
  // If no fields found from JSON, use the field generators as fallback
  if (jsonFields.length === 0) {
    console.log(`⚠️ No JSON fields found for ${employmentType}, using field generators`);
    // Import the generators dynamically to avoid circular dependencies
    const { 
      generateMilitaryEmploymentFields,
      generateFederalEmploymentFields,
      generateNonFederalEmploymentFields,
      generateSelfEmploymentFields,
      generateUnemploymentFields
    } = await import('./section13-field-mapping');
    
    let generatorFields: FieldMapping[] = [];
    switch (mappedType) {
      case 'militaryEmployment':
        generatorFields = generateMilitaryEmploymentFields(0);
        break;
      case 'federalInfo':
        generatorFields = generateFederalEmploymentFields(0);
        break;
      case 'nonFederalEmployment':
        generatorFields = generateNonFederalEmploymentFields(0);
        break;
      case 'selfEmployment':
        generatorFields = generateSelfEmploymentFields(0);
        break;
      case 'unemployment':
        generatorFields = generateUnemploymentFields(0);
        break;
    }
    return generatorFields;
  }
  
  return jsonFields.map(field => ({
    uiPath: field.uiPath,
    pdfField: field.pdfFieldId,
    fieldType: field.type,
    metadata: {
      label: field.label,
      page: field.page,
      confidence: field.confidence,
      processingSource: field.processingSource
    }
  }));
};

/**
 * Validate implementation coverage against complete JSON source
 */
export const validateImplementationCoverage = async (implementedUiPaths: string[]) => {
  await initializeJsonLoader();
  
  const report = getCoverageReport(implementedUiPaths);
  
  console.log(`
=== Section 13 Field Coverage Report ===
Total Fields (JSON Source): ${report.total}
Implemented Fields: ${report.implemented}
Missing Fields: ${report.missing}
Coverage: ${report.coverage.toFixed(2)}%

Missing Field Categories:
${report.missingFields.slice(0, 10).map(field => `- ${field}`).join('\n')}
${report.missing > 10 ? `... and ${report.missing - 10} more` : ''}
  `);
  
  return report;
};

/**
 * Get employment type statistics from JSON source
 */
export const getEmploymentTypeStatistics = async () => {
  await initializeJsonLoader();
  
  const militaryFields = await getEnhancedEmploymentTypeMapping('militaryEmployment');
  const nonFederalFields = await getEnhancedEmploymentTypeMapping('nonFederalEmployment');
  const selfEmploymentFields = await getEnhancedEmploymentTypeMapping('selfEmployment');
  const unemploymentFields = await getEnhancedEmploymentTypeMapping('unemployment');
  const recordIssuesFields = await getEnhancedEmploymentTypeMapping('employmentRecordIssues');
  const disciplinaryFields = await getEnhancedEmploymentTypeMapping('disciplinaryActions');
  const federalInfoFields = await getEnhancedEmploymentTypeMapping('federalInfo');
  const employmentTypeFields = await getEnhancedEmploymentTypeMapping('employmentType');
  
  return {
    militaryEmployment: militaryFields.length,        // Expected: 196
    nonFederalEmployment: nonFederalFields.length,    // Expected: 356  
    selfEmployment: selfEmploymentFields.length,      // Expected: 248
    unemployment: unemploymentFields.length,          // Expected: 200
    employmentRecordIssues: recordIssuesFields.length, // Expected: 62
    disciplinaryActions: disciplinaryFields.length,   // Expected: 4
    federalInfo: federalInfoFields.length,           // Expected: 16
    employmentType: employmentTypeFields.length,     // Expected: 4
    total: militaryFields.length + nonFederalFields.length + selfEmploymentFields.length + 
           unemploymentFields.length + recordIssuesFields.length + disciplinaryFields.length +
           federalInfoFields.length + employmentTypeFields.length
  };
};

/**
 * Initialize enhanced integration system
 */
export const initializeEnhancedIntegration = async (): Promise<void> => {
  console.log('Initializing Section 13 Enhanced Integration...');
  
  // Clear existing cache to force reload
  clearFieldMappingCache();
  
  // Load enhanced mappings
  await generateEnhancedFieldMapping();
  
  // Get statistics
  const stats = await getEmploymentTypeStatistics();
  
  console.log(`
=== Section 13 Enhanced Integration Initialized ===
Total Field Mappings Available: ${enhancedFieldMappings?.length || 0}

Employment Type Breakdown:
- Military Employment: ${stats.militaryEmployment} fields
- Non-Federal Employment: ${stats.nonFederalEmployment} fields  
- Self Employment: ${stats.selfEmployment} fields
- Unemployment: ${stats.unemployment} fields
- Employment Record Issues: ${stats.employmentRecordIssues} fields
- Disciplinary Actions: ${stats.disciplinaryActions} fields
- Federal Info: ${stats.federalInfo} fields
- Employment Type: ${stats.employmentType} fields

Total Coverage: ${stats.total} fields
Source Verification: ${stats.total >= 1086 ? '✅ Complete' : '❌ Incomplete'}
  `);
};

/**
 * Clear enhanced mapping cache
 */
export const clearEnhancedMappingCache = (): void => {
  enhancedFieldMappings = null;
  clearFieldMappingCache();
};