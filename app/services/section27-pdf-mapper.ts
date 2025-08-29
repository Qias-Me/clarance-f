/**
 * Section 27 PDF Field Mapper
 * Maps Section 27 (Use of Information Technology Systems) data to PDF fields
 * Total fields: 57
 * 
 * Covers:
 * - 27.1: Illegal Access to IT Systems
 * - 27.2: Illegal Modification of IT Systems  
 * - 27.3: Unauthorized Entry to IT Systems
 */

import type { Field } from '../interfaces/formDefinition2.0';
import type { Section27 } from '../../api/interfaces/section-interfaces/section27';

/**
 * Maps Section 27 data to PDF fields
 * Handles IT Systems violations with multiple incident entries
 * 
 * Field mapping breakdown:
 * - 27.1 Illegal Access: ~19 fields (RadioButton + 2 entries with location/date/description)
 * - 27.2 Illegal Modification: ~19 fields (RadioButton + 2 entries with location/date/description)
 * - 27.3 Unauthorized Entry: ~19 fields (RadioButton + 2 entries with location/date/description)
 * 
 * @param section27Data - The Section 27 data from the form context
 * @returns Map of PDF field IDs to their values
 */
export function mapSection27ToPDFFields(section27Data: Section27): Map<string, any> {
  const pdfFieldMap = new Map<string, any>();

  if (!section27Data?.section27) {
    console.warn('⚠️ Section 27: No data provided');
    return pdfFieldMap;
  }

  const section27 = section27Data.section27;
  let mappedCount = 0;
  let skippedCount = 0;
  const fieldErrors: string[] = [];

  try {
    // ============================================================================
    // SECTION 27.1: ILLEGAL ACCESS
    // ============================================================================
    
    console.log('📝 Processing Section 27.1: Illegal Access to IT Systems');
    
    // Has illegal access violation question
    if (section27.illegalAccess?.hasViolation?.value !== undefined) {
      const hasViolationValue = section27.illegalAccess.hasViolation.value;
      pdfFieldMap.set('form1[0].Section27[0].RadioButtonList[0]', hasViolationValue);
      mappedCount++;
      console.log(`  ✅ Has illegal access violation: ${hasViolationValue}`);
    } else {
      skippedCount++;
      console.log('  ⏭️  Skipped: Illegal access violation question (undefined)');
    }
    
    // Process illegal access entries (up to 2 entries)
    if (section27.illegalAccess?.entries && section27.illegalAccess.entries.length > 0) {
      section27.illegalAccess.entries.slice(0, 2).forEach((entry, entryIndex) => {
        console.log(`  📝 Processing illegal access entry ${entryIndex + 1}`);
        
        const areaIndex = entryIndex;
        
        // Location fields
        if (entry.location) {
          if (entry.location.street?.value) {
            pdfFieldMap.set(`form1[0].Section27[0].#area[${areaIndex}].TextField11[0]`, entry.location.street.value);
            mappedCount++;
            console.log(`    ✅ Street: ${entry.location.street.value}`);
          }
          
          if (entry.location.city?.value) {
            pdfFieldMap.set(`form1[0].Section27[0].#area[${areaIndex}].TextField11[1]`, entry.location.city.value);
            mappedCount++;
            console.log(`    ✅ City: ${entry.location.city.value}`);
          }
          
          if (entry.location.state?.value) {
            pdfFieldMap.set(`form1[0].Section27[0].#area[${areaIndex}].School6_State[0]`, entry.location.state.value);
            mappedCount++;
            console.log(`    ✅ State: ${entry.location.state.value}`);
          }
          
          if (entry.location.zipCode?.value) {
            pdfFieldMap.set(`form1[0].Section27[0].#area[${areaIndex}].TextField11[2]`, entry.location.zipCode.value);
            mappedCount++;
          }
          
          if (entry.location.country?.value) {
            pdfFieldMap.set(`form1[0].Section27[0].#area[${areaIndex}].DropDownList12[0]`, entry.location.country.value);
            mappedCount++;
          }
        }
        
        // Incident date
        if (entry.incidentDate?.date?.value) {
          const dateFieldId = entryIndex === 0 
            ? 'form1[0].Section27[0].From_Datefield_Name_2[0]'
            : 'form1[0].Section27[0].From_Datefield_Name_2[1]';
          pdfFieldMap.set(dateFieldId, entry.incidentDate.date.value);
          mappedCount++;
          console.log(`    ✅ Incident date: ${entry.incidentDate.date.value}`);
        }
        
        // Estimated date checkbox
        if (entry.incidentDate?.estimated?.value !== undefined) {
          const estimatedFieldId = entryIndex === 0
            ? 'form1[0].Section27[0].CheckBox5[0]'
            : 'form1[0].Section27[0].CheckBox5[1]';
          pdfFieldMap.set(estimatedFieldId, entry.incidentDate.estimated.value);
          mappedCount++;
        }
        
        // Description
        if (entry.description?.value) {
          const descFieldId = entryIndex === 0
            ? 'form1[0].Section27[0].#area[0].TextField11[3]'
            : 'form1[0].Section27[0].#area[1].TextField11[4]';
          pdfFieldMap.set(descFieldId, entry.description.value);
          mappedCount++;
          console.log(`    ✅ Description provided`);
        }
        
        // Action taken
        if (entry.actionTaken?.value) {
          const actionFieldId = entryIndex === 0
            ? 'form1[0].Section27[0].#area[0].TextField11[4]'
            : 'form1[0].Section27[0].#area[1].TextField11[5]';
          pdfFieldMap.set(actionFieldId, entry.actionTaken.value);
          mappedCount++;
          console.log(`    ✅ Action taken: ${entry.actionTaken.value}`);
        }
      });
    }

    // ============================================================================
    // SECTION 27.2: ILLEGAL MODIFICATION  
    // ============================================================================
    
    console.log('📝 Processing Section 27.2: Illegal Modification of IT Systems');
    
    // Has illegal modification violation question
    if (section27.illegalModification?.hasViolation?.value !== undefined) {
      const hasViolationValue = section27.illegalModification.hasViolation.value;
      pdfFieldMap.set('form1[0].Section27_2[0].RadioButtonList[0]', hasViolationValue);
      mappedCount++;
      console.log(`  ✅ Has illegal modification violation: ${hasViolationValue}`);
    } else {
      skippedCount++;
      console.log('  ⏭️  Skipped: Illegal modification violation question (undefined)');
    }
    
    // Process illegal modification entries (up to 2 entries)
    if (section27.illegalModification?.entries && section27.illegalModification.entries.length > 0) {
      section27.illegalModification.entries.slice(0, 2).forEach((entry, entryIndex) => {
        console.log(`  📝 Processing illegal modification entry ${entryIndex + 1}`);
        
        const areaIndex = entryIndex;
        
        // Location fields
        if (entry.location) {
          if (entry.location.street?.value) {
            pdfFieldMap.set(`form1[0].Section27_2[0].#area[${areaIndex}].TextField11[0]`, entry.location.street.value);
            mappedCount++;
            console.log(`    ✅ Street: ${entry.location.street.value}`);
          }
          
          if (entry.location.city?.value) {
            pdfFieldMap.set(`form1[0].Section27_2[0].#area[${areaIndex}].TextField11[1]`, entry.location.city.value);
            mappedCount++;
            console.log(`    ✅ City: ${entry.location.city.value}`);
          }
          
          if (entry.location.state?.value) {
            pdfFieldMap.set(`form1[0].Section27_2[0].#area[${areaIndex}].School6_State[0]`, entry.location.state.value);
            mappedCount++;
            console.log(`    ✅ State: ${entry.location.state.value}`);
          }
          
          if (entry.location.zipCode?.value) {
            pdfFieldMap.set(`form1[0].Section27_2[0].#area[${areaIndex}].TextField11[2]`, entry.location.zipCode.value);
            mappedCount++;
          }
          
          if (entry.location.country?.value) {
            pdfFieldMap.set(`form1[0].Section27_2[0].#area[${areaIndex}].DropDownList12[0]`, entry.location.country.value);
            mappedCount++;
          }
        }
        
        // Incident date
        if (entry.incidentDate?.date?.value) {
          const dateFieldId = entryIndex === 0 
            ? 'form1[0].Section27_2[0].From_Datefield_Name_2[0]'
            : 'form1[0].Section27_2[0].From_Datefield_Name_2[1]';
          pdfFieldMap.set(dateFieldId, entry.incidentDate.date.value);
          mappedCount++;
          console.log(`    ✅ Incident date: ${entry.incidentDate.date.value}`);
        }
        
        // Estimated date checkbox
        if (entry.incidentDate?.estimated?.value !== undefined) {
          const estimatedFieldId = entryIndex === 0
            ? 'form1[0].Section27_2[0].CheckBox5[0]'
            : 'form1[0].Section27_2[0].CheckBox5[1]';
          pdfFieldMap.set(estimatedFieldId, entry.incidentDate.estimated.value);
          mappedCount++;
        }
        
        // Description
        if (entry.description?.value) {
          const descFieldId = entryIndex === 0
            ? 'form1[0].Section27_2[0].#area[0].TextField11[3]'
            : 'form1[0].Section27_2[0].#area[1].TextField11[4]';
          pdfFieldMap.set(descFieldId, entry.description.value);
          mappedCount++;
          console.log(`    ✅ Description provided`);
        }
        
        // Action taken
        if (entry.actionTaken?.value) {
          const actionFieldId = entryIndex === 0
            ? 'form1[0].Section27_2[0].#area[0].TextField11[4]'
            : 'form1[0].Section27_2[0].#area[1].TextField11[5]';
          pdfFieldMap.set(actionFieldId, entry.actionTaken.value);
          mappedCount++;
          console.log(`    ✅ Action taken: ${entry.actionTaken.value}`);
        }
      });
    }

    // ============================================================================
    // SECTION 27.3: UNAUTHORIZED ENTRY
    // ============================================================================
    
    console.log('📝 Processing Section 27.3: Unauthorized Entry to IT Systems');
    
    // Has unauthorized entry violation question
    if (section27.unauthorizedEntry?.hasViolation?.value !== undefined) {
      const hasViolationValue = section27.unauthorizedEntry.hasViolation.value;
      pdfFieldMap.set('form1[0].Section27[0].RadioButtonList[1]', hasViolationValue);
      mappedCount++;
      console.log(`  ✅ Has unauthorized entry violation: ${hasViolationValue}`);
    } else {
      skippedCount++;
      console.log('  ⏭️  Skipped: Unauthorized entry violation question (undefined)');
    }
    
    // Process unauthorized entry entries (up to 2 entries)
    if (section27.unauthorizedEntry?.entries && section27.unauthorizedEntry.entries.length > 0) {
      section27.unauthorizedEntry.entries.slice(0, 2).forEach((entry, entryIndex) => {
        console.log(`  📝 Processing unauthorized entry ${entryIndex + 1}`);
        
        // Use areas 2 and 3 for unauthorized entry (different from illegal access which uses 0 and 1)
        const areaIndex = entryIndex + 2;
        
        // Location fields
        if (entry.location) {
          if (entry.location.street?.value) {
            pdfFieldMap.set(`form1[0].Section27[0].#area[${areaIndex}].TextField11[0]`, entry.location.street.value);
            mappedCount++;
            console.log(`    ✅ Street: ${entry.location.street.value}`);
          }
          
          if (entry.location.city?.value) {
            pdfFieldMap.set(`form1[0].Section27[0].#area[${areaIndex}].TextField11[1]`, entry.location.city.value);
            mappedCount++;
            console.log(`    ✅ City: ${entry.location.city.value}`);
          }
          
          if (entry.location.state?.value) {
            pdfFieldMap.set(`form1[0].Section27[0].#area[${areaIndex}].School6_State[0]`, entry.location.state.value);
            mappedCount++;
            console.log(`    ✅ State: ${entry.location.state.value}`);
          }
          
          if (entry.location.zipCode?.value) {
            pdfFieldMap.set(`form1[0].Section27[0].#area[${areaIndex}].TextField11[2]`, entry.location.zipCode.value);
            mappedCount++;
          }
          
          if (entry.location.country?.value) {
            pdfFieldMap.set(`form1[0].Section27[0].#area[${areaIndex}].DropDownList12[0]`, entry.location.country.value);
            mappedCount++;
          }
        }
        
        // Incident date (uses different field IDs than illegal access)
        if (entry.incidentDate?.date?.value) {
          const dateFieldId = entryIndex === 0 
            ? 'form1[0].Section27[0].From_Datefield_Name_2[2]'
            : 'form1[0].Section27[0].From_Datefield_Name_2[3]';
          pdfFieldMap.set(dateFieldId, entry.incidentDate.date.value);
          mappedCount++;
          console.log(`    ✅ Incident date: ${entry.incidentDate.date.value}`);
        }
        
        // Estimated date checkbox
        if (entry.incidentDate?.estimated?.value !== undefined) {
          const estimatedFieldId = entryIndex === 0
            ? 'form1[0].Section27[0].CheckBox5[2]'
            : 'form1[0].Section27[0].CheckBox5[3]';
          pdfFieldMap.set(estimatedFieldId, entry.incidentDate.estimated.value);
          mappedCount++;
        }
        
        // Description
        if (entry.description?.value) {
          const descFieldId = entryIndex === 0
            ? 'form1[0].Section27[0].#area[2].TextField11[3]'
            : 'form1[0].Section27[0].#area[3].TextField11[4]';
          pdfFieldMap.set(descFieldId, entry.description.value);
          mappedCount++;
          console.log(`    ✅ Description provided`);
        }
        
        // Action taken
        if (entry.actionTaken?.value) {
          const actionFieldId = entryIndex === 0
            ? 'form1[0].Section27[0].#area[2].TextField11[4]'
            : 'form1[0].Section27[0].#area[3].TextField11[5]';
          pdfFieldMap.set(actionFieldId, entry.actionTaken.value);
          mappedCount++;
          console.log(`    ✅ Action taken: ${entry.actionTaken.value}`);
        }
      });
    }

  } catch (error) {
    console.error('❌ Section 27 PDF mapping error:', error);
    fieldErrors.push(`Mapping error: ${error.message}`);
  }

  // ============================================================================
  // FINAL STATISTICS AND VALIDATION
  // ============================================================================
  
  const totalFields = mappedCount + skippedCount;
  console.log('\n📊 Section 27 PDF Mapping Statistics:');
  console.log(`   Total fields processed: ${totalFields}`);
  console.log(`   Successfully mapped: ${mappedCount}`);
  console.log(`   Skipped (undefined): ${skippedCount}`);
  console.log(`   Errors encountered: ${fieldErrors.length}`);
  
  if (fieldErrors.length > 0) {
    console.log('\n⚠️ Field Mapping Errors:');
    fieldErrors.forEach(error => console.log(`   - ${error}`));
  }
  
  // Log subsection completion
  const subsectionStatus = {
    illegalAccess: '✅ 27.1 processed',
    illegalModification: '✅ 27.2 processed',
    unauthorizedEntry: '✅ 27.3 processed'
  };
  
  console.log('\n📋 Subsection Processing Status:');
  Object.entries(subsectionStatus).forEach(([section, status]) => {
    console.log(`   ${status}`);
  });
  
  // Validate IT violations logic
  const warnings: string[] = [];
  
  // Validate illegal access logic
  const hasIllegalAccess = section27.illegalAccess?.hasViolation?.value;
  if (hasIllegalAccess === 'YES' && (!section27.illegalAccess.entries || section27.illegalAccess.entries.length === 0)) {
    warnings.push('Illegal access violation indicated but no incident entries provided');
  }
  
  // Validate illegal modification logic
  const hasIllegalModification = section27.illegalModification?.hasViolation?.value;
  if (hasIllegalModification === 'YES' && (!section27.illegalModification.entries || section27.illegalModification.entries.length === 0)) {
    warnings.push('Illegal modification violation indicated but no incident entries provided');
  }
  
  // Validate unauthorized entry logic
  const hasUnauthorizedEntry = section27.unauthorizedEntry?.hasViolation?.value;
  if (hasUnauthorizedEntry === 'YES' && (!section27.unauthorizedEntry.entries || section27.unauthorizedEntry.entries.length === 0)) {
    warnings.push('Unauthorized entry violation indicated but no incident entries provided');
  }
  
  if (warnings.length > 0) {
    console.log('\n⚠️ Data Validation Warnings:');
    warnings.forEach(warning => console.log(`   - ${warning}`));
  }
  
  // Expected field counts per subsection
  const expectedFieldCounts = {
    illegalAccess: 19, // RadioButton + 2 entries with ~9 fields each
    illegalModification: 19, // RadioButton + 2 entries with ~9 fields each
    unauthorizedEntry: 19, // RadioButton + 2 entries with ~9 fields each
    total: 57
  };
  
  const actualFieldCounts = {
    illegalAccessEntries: section27.illegalAccess?.entries?.length || 0,
    illegalModificationEntries: section27.illegalModification?.entries?.length || 0,
    unauthorizedEntryEntries: section27.unauthorizedEntry?.entries?.length || 0
  };
  
  console.log('\n🎯 Section 27 Field Mapping Summary:');
  console.log(`   Expected total fields: ${expectedFieldCounts.total}`);
  console.log(`   Actually mapped: ${mappedCount}`);
  console.log(`   Coverage: ${((mappedCount / expectedFieldCounts.total) * 100).toFixed(1)}%`);
  console.log(`   Illegal access entries: ${actualFieldCounts.illegalAccessEntries}`);
  console.log(`   Illegal modification entries: ${actualFieldCounts.illegalModificationEntries}`);
  console.log(`   Unauthorized entry entries: ${actualFieldCounts.unauthorizedEntryEntries}`);
  
  console.log('\n✅ Section 27 PDF field mapping completed');
  return pdfFieldMap;
}

/**
 * Helper function to validate Section 27 data integrity
 */
export function validateSection27Data(section27: Section27): string[] {
  const errors: string[] = [];
  
  // Check for subsection existence
  if (!section27.section27) {
    errors.push('Section 27 data structure is missing');
    return errors;
  }
  
  const data = section27.section27;
  
  // Validate illegal access
  if (data.illegalAccess?.hasViolation?.value === 'YES') {
    if (!data.illegalAccess.entries || data.illegalAccess.entries.length === 0) {
      errors.push('Illegal access violation requires at least one incident entry');
    }
    
    data.illegalAccess.entries?.forEach((entry, index) => {
      if (!entry.incidentDate?.date?.value) {
        errors.push(`Illegal access entry ${index + 1}: Incident date is required`);
      }
      if (!entry.description?.value) {
        errors.push(`Illegal access entry ${index + 1}: Description is required`);
      }
    });
  }
  
  // Validate illegal modification
  if (data.illegalModification?.hasViolation?.value === 'YES') {
    if (!data.illegalModification.entries || data.illegalModification.entries.length === 0) {
      errors.push('Illegal modification violation requires at least one incident entry');
    }
    
    data.illegalModification.entries?.forEach((entry, index) => {
      if (!entry.incidentDate?.date?.value) {
        errors.push(`Illegal modification entry ${index + 1}: Incident date is required`);
      }
      if (!entry.description?.value) {
        errors.push(`Illegal modification entry ${index + 1}: Description is required`);
      }
    });
  }
  
  // Validate unauthorized entry
  if (data.unauthorizedEntry?.hasViolation?.value === 'YES') {
    if (!data.unauthorizedEntry.entries || data.unauthorizedEntry.entries.length === 0) {
      errors.push('Unauthorized entry violation requires at least one incident entry');
    }
    
    data.unauthorizedEntry.entries?.forEach((entry, index) => {
      if (!entry.incidentDate?.date?.value) {
        errors.push(`Unauthorized entry ${index + 1}: Incident date is required`);
      }
      if (!entry.description?.value) {
        errors.push(`Unauthorized entry ${index + 1}: Description is required`);
      }
    });
  }
  
  return errors;
}