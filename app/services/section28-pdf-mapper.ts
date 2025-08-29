/**
 * Section 28 PDF Field Mapper
 * Maps Section 28 (Involvement in Non-Criminal Court Actions) data to PDF fields
 * Total fields: 23
 * 
 * Covers:
 * - Court action disclosure question
 * - Court action entries (up to 2 entries)
 * - Court details including date, name, nature, results, and parties
 * - Court address information
 */

import type { Field } from '../interfaces/formDefinition2.0';
import type { Section28, CourtActionEntry } from '../../api/interfaces/section-interfaces/section28';

/**
 * Maps Section 28 data to PDF fields
 * Handles non-criminal court actions from the last 10 years
 * 
 * Field mapping breakdown:
 * - Has court actions: 1 RadioButton field
 * - Court action entries: ~11 fields per entry (up to 2 entries)
 * - Total expected: 23 fields
 * 
 * @param section28Data - The Section 28 data from the form context
 * @returns Map of PDF field IDs to their values
 */
export function mapSection28ToPDFFields(section28Data: Section28): Map<string, any> {
  const pdfFieldMap = new Map<string, any>();

  if (!section28Data?.section28) {
    console.warn('⚠️ Section 28: No data provided');
    return pdfFieldMap;
  }

  const section28 = section28Data.section28;
  let mappedCount = 0;
  let skippedCount = 0;
  const fieldErrors: string[] = [];

  try {
    // ============================================================================
    // SECTION 28: COURT ACTION DISCLOSURE
    // ============================================================================
    
    console.log('📝 Processing Section 28: Involvement in Non-Criminal Court Actions');
    
    // Has court actions question
    if (section28.hasCourtActions?.value !== undefined) {
      const hasCourtActionsValue = section28.hasCourtActions.value;
      pdfFieldMap.set('form1[0].Section28[0].RadioButtonList[0]', hasCourtActionsValue);
      mappedCount++;
      console.log(`  ✅ Has court actions: ${hasCourtActionsValue}`);
    } else {
      skippedCount++;
      console.log('  ⏭️  Skipped: Has court actions question (undefined)');
    }

    // ============================================================================
    // COURT ACTION ENTRIES
    // ============================================================================
    
    if (section28.courtActionEntries && section28.courtActionEntries.length > 0) {
      // Process court action entries (up to 2 entries based on PDF structure)
      section28.courtActionEntries.slice(0, 2).forEach((entry: CourtActionEntry, entryIndex: number) => {
        console.log(`  📝 Processing court action entry ${entryIndex + 1}`);
        
        // Date of action
        if (entry.dateOfAction?.date?.value) {
          const dateFieldId = entryIndex === 0 
            ? 'form1[0].Section28[0].From_Datefield_Name_2[0]'
            : 'form1[0].Section28[1].From_Datefield_Name_2[0]';
          pdfFieldMap.set(dateFieldId, entry.dateOfAction.date.value);
          mappedCount++;
          console.log(`    ✅ Date of action: ${entry.dateOfAction.date.value}`);
        } else {
          skippedCount++;
        }
        
        // Estimated date checkbox
        if (entry.dateOfAction?.estimated?.value !== undefined) {
          const estimatedFieldId = entryIndex === 0
            ? 'form1[0].Section28[0].#field[12]'
            : 'form1[0].Section28[1].#field[12]';
          const estimatedValue = entry.dateOfAction.estimated.value === 'YES';
          pdfFieldMap.set(estimatedFieldId, estimatedValue);
          mappedCount++;
        } else {
          skippedCount++;
        }
        
        // Court name
        if (entry.courtName?.value) {
          const courtNameFieldId = entryIndex === 0
            ? 'form1[0].Section28[0].TextField11[1]'
            : 'form1[0].Section28[1].TextField11[1]';
          pdfFieldMap.set(courtNameFieldId, entry.courtName.value);
          mappedCount++;
          console.log(`    ✅ Court name: ${entry.courtName.value}`);
        } else {
          skippedCount++;
        }
        
        // Nature of action
        if (entry.natureOfAction?.value) {
          const natureFieldId = entryIndex === 0
            ? 'form1[0].Section28[0].TextField11[0]'
            : 'form1[0].Section28[1].TextField11[0]';
          pdfFieldMap.set(natureFieldId, entry.natureOfAction.value);
          mappedCount++;
          console.log(`    ✅ Nature of action: ${entry.natureOfAction.value}`);
        } else {
          skippedCount++;
        }
        
        // Results description
        if (entry.resultsDescription?.value) {
          const resultsFieldId = entryIndex === 0
            ? 'form1[0].Section28[0].TextField11[2]'
            : 'form1[0].Section28[1].TextField11[2]';
          pdfFieldMap.set(resultsFieldId, entry.resultsDescription.value);
          mappedCount++;
          console.log(`    ✅ Results description provided`);
        } else {
          skippedCount++;
        }
        
        // Principal parties
        if (entry.principalParties?.value) {
          const partiesFieldId = entryIndex === 0
            ? 'form1[0].Section28[0].TextField11[3]'
            : 'form1[0].Section28[1].TextField11[3]';
          pdfFieldMap.set(partiesFieldId, entry.principalParties.value);
          mappedCount++;
          console.log(`    ✅ Principal parties: ${entry.principalParties.value}`);
        } else {
          skippedCount++;
        }
        
        // Court address information
        if (entry.courtAddress) {
          const baseSection = entryIndex === 0 ? 'Section28[0]' : 'Section28[1]';
          
          // Street
          if (entry.courtAddress.street?.value) {
            pdfFieldMap.set(`form1[0].${baseSection}.TextField11[4]`, entry.courtAddress.street.value);
            mappedCount++;
            console.log(`    ✅ Court street: ${entry.courtAddress.street.value}`);
          } else {
            skippedCount++;
          }
          
          // City
          if (entry.courtAddress.city?.value) {
            pdfFieldMap.set(`form1[0].${baseSection}.TextField11[5]`, entry.courtAddress.city.value);
            mappedCount++;
            console.log(`    ✅ Court city: ${entry.courtAddress.city.value}`);
          } else {
            skippedCount++;
          }
          
          // State (dropdown)
          if (entry.courtAddress.state?.value) {
            pdfFieldMap.set(`form1[0].${baseSection}.School6_State[0]`, entry.courtAddress.state.value);
            mappedCount++;
            console.log(`    ✅ Court state: ${entry.courtAddress.state.value}`);
          } else {
            skippedCount++;
          }
          
          // Zip code
          if (entry.courtAddress.zipCode?.value) {
            pdfFieldMap.set(`form1[0].${baseSection}.TextField11[6]`, entry.courtAddress.zipCode.value);
            mappedCount++;
            console.log(`    ✅ Court zip code: ${entry.courtAddress.zipCode.value}`);
          } else {
            skippedCount++;
          }
          
          // Country (dropdown)
          if (entry.courtAddress.country?.value) {
            pdfFieldMap.set(`form1[0].${baseSection}.DropDownList12[0]`, entry.courtAddress.country.value);
            mappedCount++;
            console.log(`    ✅ Court country: ${entry.courtAddress.country.value}`);
          } else {
            skippedCount++;
          }
        }
      });
    } else if (section28.hasCourtActions?.value === 'YES') {
      console.log('  ⚠️  Court actions indicated but no entries provided');
    }

  } catch (error) {
    console.error('❌ Section 28 PDF mapping error:', error);
    fieldErrors.push(`Mapping error: ${error.message}`);
  }

  // ============================================================================
  // FINAL STATISTICS AND VALIDATION
  // ============================================================================
  
  const totalFields = mappedCount + skippedCount;
  console.log('\n📊 Section 28 PDF Mapping Statistics:');
  console.log(`   Total fields processed: ${totalFields}`);
  console.log(`   Successfully mapped: ${mappedCount}`);
  console.log(`   Skipped (undefined): ${skippedCount}`);
  console.log(`   Errors encountered: ${fieldErrors.length}`);
  
  if (fieldErrors.length > 0) {
    console.log('\n⚠️ Field Mapping Errors:');
    fieldErrors.forEach(error => console.log(`   - ${error}`));
  }
  
  // Validate court actions logic
  const warnings: string[] = [];
  const hasCourtActions = section28.hasCourtActions?.value;
  
  if (hasCourtActions === 'YES') {
    if (!section28.courtActionEntries || section28.courtActionEntries.length === 0) {
      warnings.push('Court actions indicated but no court action entries provided');
    } else {
      // Validate each entry
      section28.courtActionEntries.forEach((entry, index) => {
        if (!entry.dateOfAction?.date?.value) {
          warnings.push(`Court action entry ${index + 1}: Date is required`);
        }
        if (!entry.courtName?.value) {
          warnings.push(`Court action entry ${index + 1}: Court name is required`);
        }
        if (!entry.natureOfAction?.value) {
          warnings.push(`Court action entry ${index + 1}: Nature of action is required`);
        }
      });
    }
  }
  
  if (warnings.length > 0) {
    console.log('\n⚠️ Data Validation Warnings:');
    warnings.forEach(warning => console.log(`   - ${warning}`));
  }
  
  // Expected field counts
  const expectedFieldCounts = {
    radioButton: 1, // Has court actions question
    perEntry: 11, // Fields per court action entry
    maxEntries: 2, // Maximum number of entries
    total: 23 // Total expected fields
  };
  
  const actualFieldCounts = {
    courtActionEntries: section28.courtActionEntries?.length || 0,
    hasCourtActions: section28.hasCourtActions?.value === 'YES'
  };
  
  console.log('\n🎯 Section 28 Field Mapping Summary:');
  console.log(`   Expected total fields: ${expectedFieldCounts.total}`);
  console.log(`   Actually mapped: ${mappedCount}`);
  console.log(`   Coverage: ${((mappedCount / expectedFieldCounts.total) * 100).toFixed(1)}%`);
  console.log(`   Court action entries: ${actualFieldCounts.courtActionEntries}`);
  console.log(`   Has court actions: ${actualFieldCounts.hasCourtActions ? 'Yes' : 'No'}`);
  
  console.log('\n✅ Section 28 PDF field mapping completed');
  return pdfFieldMap;
}

/**
 * Helper function to validate Section 28 data integrity
 */
export function validateSection28Data(section28: Section28): string[] {
  const errors: string[] = [];
  
  // Check for section existence
  if (!section28?.section28) {
    errors.push('Section 28 data structure is missing');
    return errors;
  }
  
  const data = section28.section28;
  
  // Required field validation
  if (!data.hasCourtActions?.value) {
    errors.push('Court actions disclosure question is required');
  }
  
  // Conditional validation based on court actions
  if (data.hasCourtActions?.value === 'YES') {
    if (!data.courtActionEntries || data.courtActionEntries.length === 0) {
      errors.push('At least one court action entry is required when court actions are indicated');
    } else {
      // Validate each court action entry
      data.courtActionEntries.forEach((entry, index) => {
        const entryNum = index + 1;
        
        // Required fields for each entry
        if (!entry.dateOfAction?.date?.value) {
          errors.push(`Court action entry ${entryNum}: Date of action is required`);
        }
        
        if (!entry.courtName?.value) {
          errors.push(`Court action entry ${entryNum}: Court name is required`);
        }
        
        if (!entry.natureOfAction?.value) {
          errors.push(`Court action entry ${entryNum}: Nature of action is required`);
        }
        
        if (!entry.resultsDescription?.value) {
          errors.push(`Court action entry ${entryNum}: Results description is required`);
        }
        
        if (!entry.principalParties?.value) {
          errors.push(`Court action entry ${entryNum}: Principal parties information is required`);
        }
        
        // Validate court address
        if (!entry.courtAddress) {
          errors.push(`Court action entry ${entryNum}: Court address is required`);
        } else {
          if (!entry.courtAddress.city?.value) {
            errors.push(`Court action entry ${entryNum}: Court city is required`);
          }
          
          if (!entry.courtAddress.country?.value) {
            errors.push(`Court action entry ${entryNum}: Court country is required`);
          }
          
          // State and zip are required for US addresses
          if (entry.courtAddress.country?.value === 'United States') {
            if (!entry.courtAddress.state?.value) {
              errors.push(`Court action entry ${entryNum}: State is required for US addresses`);
            }
            if (!entry.courtAddress.zipCode?.value) {
              errors.push(`Court action entry ${entryNum}: Zip code is required for US addresses`);
            }
          }
        }
      });
    }
  }
  
  return errors;
}