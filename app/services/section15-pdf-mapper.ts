/**
 * Section 15 PDF Field Mapper
 * Maps Section 15 (Military History) data to PDF fields
 * Total fields: 95
 * 
 * Covers:
 * - 15.1: Military Service History
 * - 15.2: Court Martial/Disciplinary Procedures  
 * - 15.3: Foreign Military Service
 */

import type { Field, FieldWithOptions } from '../interfaces/formDefinition2.0';
import type { Section15 } from '../../api/interfaces/section-interfaces/section15';

/**
 * Maps Section 15 data to PDF fields
 * Handles Military Service History with complex conditional logic
 * 
 * Field mapping breakdown:
 * - 15.1 Military Service: ~35 fields per entry (up to 2 entries)
 * - 15.2 Disciplinary Actions: ~10 fields per entry (up to 2 entries) 
 * - 15.3 Foreign Military Service: ~25 fields including contacts
 * 
 * @param section15Data - The Section 15 data from the form context
 * @returns Map of PDF field IDs to their values
 */
export function mapSection15ToPDFFields(section15Data: Section15): Map<string, any> {
  const pdfFieldMap = new Map<string, any>();

  if (!section15Data?.section15) {
    console.warn('⚠️ Section 15: No data provided');
    return pdfFieldMap;
  }

  const section15 = section15Data.section15;
  let mappedCount = 0;
  let skippedCount = 0;
  const fieldErrors: string[] = [];

  try {
    // ============================================================================
    // SECTION 15.1: MILITARY SERVICE HISTORY
    // ============================================================================
    
    console.log('📝 Processing Section 15.1: Military Service History');
    
    // Has served in military question
    if (section15.militaryService.hasServed?.value !== undefined) {
      const hasServedValue = section15.militaryService.hasServed.value;
      pdfFieldMap.set('form1[0].Section14_1[0].#area[4].RadioButtonList[1]', hasServedValue);
      mappedCount++;
      console.log(`  ✅ Has served: ${hasServedValue}`);
    } else {
      skippedCount++;
    }

    // Process military service entries (up to 2 entries)
    if (section15.militaryService.entries && section15.militaryService.entries.length > 0) {
      section15.militaryService.entries.slice(0, 2).forEach((entry, entryIndex) => {
        console.log(`  📝 Processing military service entry ${entryIndex + 1}`);
        
        // Service branch (1-7 options)
        if (entry.branch?.value) {
          // First entry uses RadioButtonList[2], second uses different field
          const branchFieldId = entryIndex === 0 
            ? 'form1[0].Section14_1[0].#area[5].#area[6].RadioButtonList[2]'
            : 'form1[0].Section14_1[0].#area[13].#area[14].RadioButtonList[8]';
          pdfFieldMap.set(branchFieldId, entry.branch.value);
          mappedCount++;
        } else {
          skippedCount++;
        }

        // Service state (for National Guard)
        if (entry.serviceState?.value) {
          const stateFieldId = entryIndex === 0
            ? 'form1[0].Section14_1[0].School6_State[0]'
            : 'form1[0].Section14_1[0].School6_State[1]';
          pdfFieldMap.set(stateFieldId, entry.serviceState.value);
          mappedCount++;
        } else {
          // Clear field if no value
          const stateFieldId = entryIndex === 0
            ? 'form1[0].Section14_1[0].School6_State[0]'
            : 'form1[0].Section14_1[0].School6_State[1]';
          pdfFieldMap.set(stateFieldId, '');
          skippedCount++;
        }

        // Service status (Officer/Enlisted/Other)
        if (entry.serviceStatus?.value) {
          const statusFieldId = entryIndex === 0
            ? 'form1[0].Section14_1[0].#area[7].RadioButtonList[3]'
            : 'form1[0].Section14_1[0].#area[15].RadioButtonList[9]';
          pdfFieldMap.set(statusFieldId, entry.serviceStatus.value);
          mappedCount++;
        } else {
          skippedCount++;
        }

        // Service dates
        const datePrefix = entryIndex === 0 ? '#area[8]' : '#area[16]';
        
        // From date
        if (entry.fromDate?.value) {
          const fromDateFieldId = entryIndex === 0
            ? 'form1[0].Section14_1[0].#area[8].From_Datefield_Name_2[0]'
            : 'form1[0].Section14_1[0].#area[16].From_Datefield_Name_2[3]';
          pdfFieldMap.set(fromDateFieldId, entry.fromDate.value);
          mappedCount++;
        } else {
          skippedCount++;
        }

        // From date estimated checkbox
        if (entry.fromDateEstimated?.value !== undefined) {
          const fromEstFieldId = entryIndex === 0
            ? 'form1[0].Section14_1[0].#area[8].#field[7]'
            : 'form1[0].Section14_1[0].#area[16].#field[18]';
          pdfFieldMap.set(fromEstFieldId, entry.fromDateEstimated.value);
          mappedCount++;
        } else {
          skippedCount++;
        }

        // To date
        if (entry.toDate?.value) {
          const toDateFieldId = entryIndex === 0
            ? 'form1[0].Section14_1[0].#area[8].From_Datefield_Name_2[1]'
            : 'form1[0].Section14_1[0].#area[16].From_Datefield_Name_2[4]';
          pdfFieldMap.set(toDateFieldId, entry.toDate.value);
          mappedCount++;
        } else {
          skippedCount++;
        }

        // Present checkbox
        if (entry.isPresent?.value !== undefined) {
          const presentFieldId = entryIndex === 0
            ? 'form1[0].Section14_1[0].#area[8].#field[9]'
            : 'form1[0].Section14_1[0].#area[16].#field[20]';
          pdfFieldMap.set(presentFieldId, entry.isPresent.value);
          mappedCount++;
        } else {
          skippedCount++;
        }

        // To date estimated checkbox  
        if (entry.toDateEstimated?.value !== undefined) {
          const toEstFieldId = entryIndex === 0
            ? 'form1[0].Section14_1[0].#area[8].#field[10]'
            : 'form1[0].Section14_1[0].#area[16].#field[21]';
          pdfFieldMap.set(toEstFieldId, entry.toDateEstimated.value);
          mappedCount++;
        } else {
          skippedCount++;
        }

        // Service number
        if (entry.serviceNumber?.value) {
          const serviceNumFieldId = entryIndex === 0
            ? 'form1[0].Section14_1[0].TextField11[3]'
            : 'form1[0].Section14_1[0].TextField11[6]';
          pdfFieldMap.set(serviceNumFieldId, entry.serviceNumber.value);
          mappedCount++;
        } else {
          const serviceNumFieldId = entryIndex === 0
            ? 'form1[0].Section14_1[0].TextField11[3]'
            : 'form1[0].Section14_1[0].TextField11[6]';
          pdfFieldMap.set(serviceNumFieldId, '');
          skippedCount++;
        }

        // Discharge type
        if (entry.dischargeType?.value) {
          const dischargeTypeFieldId = entryIndex === 0
            ? 'form1[0].Section14_1[0].#area[9].RadioButtonList[4]'
            : 'form1[0].Section14_1[0].#area[18].RadioButtonList[11]';
          pdfFieldMap.set(dischargeTypeFieldId, entry.dischargeType.value);
          mappedCount++;
        } else {
          skippedCount++;
        }

        // Type of discharge (specific discharge category)
        if (entry.typeOfDischarge?.value) {
          const typeDischargeFieldId = entryIndex === 0
            ? 'form1[0].Section14_1[0].#area[10].RadioButtonList[5]'
            : 'form1[0].Section14_1[0].#area[18].RadioButtonList[11]'; // Note: Second entry reuses same field
          pdfFieldMap.set(typeDischargeFieldId, entry.typeOfDischarge.value);
          mappedCount++;
        } else {
          skippedCount++;
        }

        // Discharge date
        if (entry.dischargeDate?.value) {
          const dischargeDateFieldId = entryIndex === 0
            ? 'form1[0].Section14_1[0].From_Datefield_Name_2[2]'
            : 'form1[0].Section14_1[0].From_Datefield_Name_2[5]';
          pdfFieldMap.set(dischargeDateFieldId, entry.dischargeDate.value);
          mappedCount++;
        } else {
          skippedCount++;
        }

        // Discharge date estimated
        if (entry.dischargeDateEstimated?.value !== undefined) {
          const dischargeEstFieldId = entryIndex === 0
            ? 'form1[0].Section14_1[0].#field[13]'
            : 'form1[0].Section14_1[0].#field[24]';
          pdfFieldMap.set(dischargeEstFieldId, entry.dischargeDateEstimated.value);
          mappedCount++;
        } else {
          skippedCount++;
        }

        // Other discharge type (text field)
        if (entry.otherDischargeType?.value) {
          const otherDischargeFieldId = entryIndex === 0
            ? 'form1[0].Section14_1[0].TextField11[4]'
            : 'form1[0].Section14_1[0].TextField11[7]';
          pdfFieldMap.set(otherDischargeFieldId, entry.otherDischargeType.value);
          mappedCount++;
        } else {
          const otherDischargeFieldId = entryIndex === 0
            ? 'form1[0].Section14_1[0].TextField11[4]'
            : 'form1[0].Section14_1[0].TextField11[7]';
          pdfFieldMap.set(otherDischargeFieldId, '');
          skippedCount++;
        }

        // Discharge reason
        if (entry.dischargeReason?.value) {
          const reasonFieldId = entryIndex === 0
            ? 'form1[0].Section14_1[0].TextField11[5]'
            : 'form1[0].Section14_1[0].TextField11[8]';
          pdfFieldMap.set(reasonFieldId, entry.dischargeReason.value);
          mappedCount++;
        } else {
          const reasonFieldId = entryIndex === 0
            ? 'form1[0].Section14_1[0].TextField11[5]'
            : 'form1[0].Section14_1[0].TextField11[8]';
          pdfFieldMap.set(reasonFieldId, '');
          skippedCount++;
        }

        // Current status checkboxes (only for first entry based on field structure)
        if (entryIndex === 0 && entry.currentStatus) {
          // Active Duty
          if (entry.currentStatus.activeDuty?.value !== undefined) {
            pdfFieldMap.set('form1[0].Section14_1[0].#area[19].#field[27]', entry.currentStatus.activeDuty.value);
            mappedCount++;
          } else {
            pdfFieldMap.set('form1[0].Section14_1[0].#area[19].#field[27]', false);
            skippedCount++;
          }

          // Active Reserve
          if (entry.currentStatus.activeReserve?.value !== undefined) {
            pdfFieldMap.set('form1[0].Section14_1[0].#area[19].#field[28]', entry.currentStatus.activeReserve.value);
            mappedCount++;
          } else {
            pdfFieldMap.set('form1[0].Section14_1[0].#area[19].#field[28]', false);
            skippedCount++;
          }

          // Inactive Reserve
          if (entry.currentStatus.inactiveReserve?.value !== undefined) {
            pdfFieldMap.set('form1[0].Section14_1[0].#area[19].#field[29]', entry.currentStatus.inactiveReserve.value);
            mappedCount++;
          } else {
            pdfFieldMap.set('form1[0].Section14_1[0].#area[19].#field[29]', false);
            skippedCount++;
          }
        }

        // Additional service info (conditional fields)
        if (entry.additionalServiceInfo?.value) {
          pdfFieldMap.set('form1[0].Section14_1[0].#area[11].RadioButtonList[6]', entry.additionalServiceInfo.value);
          mappedCount++;
        } else {
          skippedCount++;
        }

        // Secondary branch (for complex service history)
        if (entry.secondaryBranch?.value) {
          pdfFieldMap.set('form1[0].Section14_1[0].#area[12].RadioButtonList[7]', entry.secondaryBranch.value);
          mappedCount++;
        } else {
          skippedCount++;
        }

        console.log(`  ✅ Military service entry ${entryIndex + 1} processed`);
      });
    }

    // ============================================================================
    // SECTION 15.2: COURT MARTIAL/DISCIPLINARY PROCEDURES  
    // ============================================================================

    console.log('📝 Processing Section 15.2: Disciplinary Procedures');

    // Has disciplinary action question
    if (section15.disciplinaryProcedures.hasDisciplinaryAction?.value !== undefined) {
      const hasActionValue = section15.disciplinaryProcedures.hasDisciplinaryAction.value;
      pdfFieldMap.set('form1[0].Section15_2[0].#area[0].RadioButtonList[0]', hasActionValue);
      mappedCount++;
      console.log(`  ✅ Has disciplinary action: ${hasActionValue}`);
    } else {
      skippedCount++;
    }

    // Process disciplinary entries (up to 2 entries)
    if (section15.disciplinaryProcedures.entries && section15.disciplinaryProcedures.entries.length > 0) {
      section15.disciplinaryProcedures.entries.slice(0, 2).forEach((entry, entryIndex) => {
        console.log(`  📝 Processing disciplinary entry ${entryIndex + 1}`);

        // Procedure date
        if (entry.procedureDate?.value) {
          const dateFieldId = entryIndex === 0
            ? 'form1[0].Section15_2[0].From_Datefield_Name_2[0]'
            : 'form1[0].Section15_2[0].From_Datefield_Name_2[5]';
          pdfFieldMap.set(dateFieldId, entry.procedureDate.value);
          mappedCount++;
        } else {
          skippedCount++;
        }

        // Procedure date estimated
        if (entry.procedureDateEstimated?.value !== undefined) {
          const estFieldId = entryIndex === 0
            ? 'form1[0].Section15_2[0].#field[2]'
            : 'form1[0].Section15_2[0].#field[8]';
          pdfFieldMap.set(estFieldId, entry.procedureDateEstimated.value);
          mappedCount++;
        } else {
          skippedCount++;
        }

        // UCMJ offense description
        if (entry.ucmjOffenseDescription?.value) {
          const offenseFieldId = entryIndex === 0
            ? 'form1[0].Section15_2[0].From_Datefield_Name_2[1]'
            : 'form1[0].Section15_2[0].From_Datefield_Name_2[6]';
          pdfFieldMap.set(offenseFieldId, entry.ucmjOffenseDescription.value);
          mappedCount++;
        } else {
          const offenseFieldId = entryIndex === 0
            ? 'form1[0].Section15_2[0].From_Datefield_Name_2[1]'
            : 'form1[0].Section15_2[0].From_Datefield_Name_2[6]';
          pdfFieldMap.set(offenseFieldId, '');
          skippedCount++;
        }

        // Disciplinary procedure name
        if (entry.disciplinaryProcedureName?.value) {
          const procedureNameFieldId = entryIndex === 0
            ? 'form1[0].Section15_2[0].From_Datefield_Name_2[2]'
            : 'form1[0].Section15_2[0].From_Datefield_Name_2[7]';
          pdfFieldMap.set(procedureNameFieldId, entry.disciplinaryProcedureName.value);
          mappedCount++;
        } else {
          const procedureNameFieldId = entryIndex === 0
            ? 'form1[0].Section15_2[0].From_Datefield_Name_2[2]'
            : 'form1[0].Section15_2[0].From_Datefield_Name_2[7]';
          pdfFieldMap.set(procedureNameFieldId, '');
          skippedCount++;
        }

        // Military court description
        if (entry.militaryCourtDescription?.value) {
          const courtFieldId = entryIndex === 0
            ? 'form1[0].Section15_2[0].From_Datefield_Name_2[3]'
            : 'form1[0].Section15_2[0].From_Datefield_Name_2[8]';
          pdfFieldMap.set(courtFieldId, entry.militaryCourtDescription.value);
          mappedCount++;
        } else {
          const courtFieldId = entryIndex === 0
            ? 'form1[0].Section15_2[0].From_Datefield_Name_2[3]'
            : 'form1[0].Section15_2[0].From_Datefield_Name_2[8]';
          pdfFieldMap.set(courtFieldId, '');
          skippedCount++;
        }

        // Final outcome
        if (entry.finalOutcome?.value) {
          const outcomeFieldId = entryIndex === 0
            ? 'form1[0].Section15_2[0].From_Datefield_Name_2[4]'
            : 'form1[0].Section15_2[0].From_Datefield_Name_2[9]';
          pdfFieldMap.set(outcomeFieldId, entry.finalOutcome.value);
          mappedCount++;
        } else {
          const outcomeFieldId = entryIndex === 0
            ? 'form1[0].Section15_2[0].From_Datefield_Name_2[4]'
            : 'form1[0].Section15_2[0].From_Datefield_Name_2[9]';
          pdfFieldMap.set(outcomeFieldId, '');
          skippedCount++;
        }

        console.log(`  ✅ Disciplinary entry ${entryIndex + 1} processed`);
      });
    }

    // ============================================================================
    // SECTION 15.3: FOREIGN MILITARY SERVICE
    // ============================================================================

    console.log('📝 Processing Section 15.3: Foreign Military Service');

    // Has served in foreign military question
    if (section15.foreignMilitaryService.hasServedInForeignMilitary?.value !== undefined) {
      const hasForeignServiceValue = section15.foreignMilitaryService.hasServedInForeignMilitary.value;
      pdfFieldMap.set('form1[0].Section15_3[0].RadioButtonList[0]', hasForeignServiceValue);
      mappedCount++;
      console.log(`  ✅ Has foreign military service: ${hasForeignServiceValue}`);
    } else {
      skippedCount++;
    }

    // Process foreign military entries (typically 1 entry with contacts)
    if (section15.foreignMilitaryService.entries && section15.foreignMilitaryService.entries.length > 0) {
      const entry = section15.foreignMilitaryService.entries[0]; // Focus on first entry
      console.log('  📝 Processing foreign military service entry');

      // Service organization selection
      pdfFieldMap.set('form1[0].Section15_3[0].RadioButtonList[1]', '7'); // Default to organization type
      mappedCount++;

      // Service period dates
      if (entry.fromDate?.value) {
        pdfFieldMap.set('form1[0].Section15_3[0].#area[0].From_Datefield_Name_2[0]', entry.fromDate.value);
        mappedCount++;
      } else {
        pdfFieldMap.set('form1[0].Section15_3[0].#area[0].From_Datefield_Name_2[0]', '');
        skippedCount++;
      }

      if (entry.fromDateEstimated?.value !== undefined) {
        pdfFieldMap.set('form1[0].Section15_3[0].#area[0].#field[3]', entry.fromDateEstimated.value);
        mappedCount++;
      } else {
        pdfFieldMap.set('form1[0].Section15_3[0].#area[0].#field[3]', false);
        skippedCount++;
      }

      if (entry.toDate?.value) {
        pdfFieldMap.set('form1[0].Section15_3[0].#area[0].From_Datefield_Name_2[1]', entry.toDate.value);
        mappedCount++;
      } else {
        pdfFieldMap.set('form1[0].Section15_3[0].#area[0].From_Datefield_Name_2[1]', '');
        skippedCount++;
      }

      if (entry.toDateEstimated?.value !== undefined) {
        pdfFieldMap.set('form1[0].Section15_3[0].#area[0].#field[5]', entry.toDateEstimated.value);
        mappedCount++;
      } else {
        pdfFieldMap.set('form1[0].Section15_3[0].#area[0].#field[5]', false);
        skippedCount++;
      }

      if (entry.isPresent?.value !== undefined) {
        pdfFieldMap.set('form1[0].Section15_3[0].#area[0].#field[6]', entry.isPresent.value);
        mappedCount++;
      } else {
        pdfFieldMap.set('form1[0].Section15_3[0].#area[0].#field[6]', false);
        skippedCount++;
      }

      // Organization details
      if (entry.organizationName?.value) {
        pdfFieldMap.set('form1[0].Section15_3[0].TextField11[0]', entry.organizationName.value);
        mappedCount++;
      } else {
        pdfFieldMap.set('form1[0].Section15_3[0].TextField11[0]', '');
        skippedCount++;
      }

      if (entry.country?.value) {
        pdfFieldMap.set('form1[0].Section15_3[0].DropDownList29[0]', entry.country.value);
        mappedCount++;
      } else {
        pdfFieldMap.set('form1[0].Section15_3[0].DropDownList29[0]', '');
        skippedCount++;
      }

      if (entry.highestRank?.value) {
        pdfFieldMap.set('form1[0].Section15_3[0].TextField11[1]', entry.highestRank.value);
        mappedCount++;
      } else {
        pdfFieldMap.set('form1[0].Section15_3[0].TextField11[1]', '');
        skippedCount++;
      }

      if (entry.divisionDepartment?.value) {
        pdfFieldMap.set('form1[0].Section15_3[0].TextField11[2]', entry.divisionDepartment.value);
        mappedCount++;
      } else {
        pdfFieldMap.set('form1[0].Section15_3[0].TextField11[2]', '');
        skippedCount++;
      }

      if (entry.reasonForLeaving?.value) {
        pdfFieldMap.set('form1[0].Section15_3[0].TextField12[0]', entry.reasonForLeaving.value);
        mappedCount++;
      } else {
        pdfFieldMap.set('form1[0].Section15_3[0].TextField12[0]', '');
        skippedCount++;
      }

      if (entry.circumstancesDescription?.value) {
        pdfFieldMap.set('form1[0].Section15_3[0].TextField13[0]', entry.circumstancesDescription.value);
        mappedCount++;
      } else {
        pdfFieldMap.set('form1[0].Section15_3[0].TextField13[0]', '');
        skippedCount++;
      }

      // Contact Person 1
      if (entry.contactPerson1) {
        const contact1 = entry.contactPerson1;
        
        if (contact1.lastName?.value) {
          pdfFieldMap.set('form1[0].Section15_3[0].#area[2].TextField11[7]', contact1.lastName.value);
          mappedCount++;
        } else {
          pdfFieldMap.set('form1[0].Section15_3[0].#area[2].TextField11[7]', '');
          skippedCount++;
        }

        if (contact1.firstName?.value) {
          pdfFieldMap.set('form1[0].Section15_3[0].#area[2].TextField11[8]', contact1.firstName.value);
          mappedCount++;
        } else {
          pdfFieldMap.set('form1[0].Section15_3[0].#area[2].TextField11[8]', '');
          skippedCount++;
        }

        if (contact1.middleName?.value) {
          pdfFieldMap.set('form1[0].Section15_3[0].#area[2].TextField11[6]', contact1.middleName.value);
          mappedCount++;
        } else {
          pdfFieldMap.set('form1[0].Section15_3[0].#area[2].TextField11[6]', '');
          skippedCount++;
        }

        if (contact1.suffix?.value) {
          pdfFieldMap.set('form1[0].Section15_3[0].#area[2].suffix[0]', contact1.suffix.value);
          mappedCount++;
        } else {
          pdfFieldMap.set('form1[0].Section15_3[0].#area[2].suffix[0]', '');
          skippedCount++;
        }

        // Contact 1 address
        if (contact1.street?.value) {
          pdfFieldMap.set('form1[0].Section15_3[0].#area[2].#area[3].TextField11[3]', contact1.street.value);
          mappedCount++;
        } else {
          pdfFieldMap.set('form1[0].Section15_3[0].#area[2].#area[3].TextField11[3]', '');
          skippedCount++;
        }

        if (contact1.city?.value) {
          pdfFieldMap.set('form1[0].Section15_3[0].#area[2].#area[3].TextField11[4]', contact1.city.value);
          mappedCount++;
        } else {
          pdfFieldMap.set('form1[0].Section15_3[0].#area[2].#area[3].TextField11[4]', '');
          skippedCount++;
        }

        if (contact1.state?.value) {
          pdfFieldMap.set('form1[0].Section15_3[0].#area[2].#area[3].School6_State[0]', contact1.state.value);
          mappedCount++;
        } else {
          pdfFieldMap.set('form1[0].Section15_3[0].#area[2].#area[3].School6_State[0]', '');
          skippedCount++;
        }

        if (contact1.country?.value) {
          pdfFieldMap.set('form1[0].Section15_3[0].#area[2].#area[3].DropDownList6[0]', contact1.country.value);
          mappedCount++;
        } else {
          pdfFieldMap.set('form1[0].Section15_3[0].#area[2].#area[3].DropDownList6[0]', '');
          skippedCount++;
        }

        if (contact1.zipCode?.value) {
          pdfFieldMap.set('form1[0].Section15_3[0].#area[2].#area[3].TextField11[5]', contact1.zipCode.value);
          mappedCount++;
        } else {
          pdfFieldMap.set('form1[0].Section15_3[0].#area[2].#area[3].TextField11[5]', '');
          skippedCount++;
        }

        // Contact 1 association dates
        if (contact1.associationFromDate?.value) {
          pdfFieldMap.set('form1[0].Section15_3[0].#area[2].From_Datefield_Name_2[2]', contact1.associationFromDate.value);
          mappedCount++;
        } else {
          pdfFieldMap.set('form1[0].Section15_3[0].#area[2].From_Datefield_Name_2[2]', '');
          skippedCount++;
        }

        if (contact1.associationFromDateEstimated?.value !== undefined) {
          pdfFieldMap.set('form1[0].Section15_3[0].#area[2].#field[23]', contact1.associationFromDateEstimated.value);
          mappedCount++;
        } else {
          pdfFieldMap.set('form1[0].Section15_3[0].#area[2].#field[23]', false);
          skippedCount++;
        }

        if (contact1.associationToDate?.value) {
          pdfFieldMap.set('form1[0].Section15_3[0].#area[2].From_Datefield_Name_2[3]', contact1.associationToDate.value);
          mappedCount++;
        } else {
          pdfFieldMap.set('form1[0].Section15_3[0].#area[2].From_Datefield_Name_2[3]', '');
          skippedCount++;
        }

        if (contact1.associationToDateEstimated?.value !== undefined) {
          pdfFieldMap.set('form1[0].Section15_3[0].#area[2].#field[25]', contact1.associationToDateEstimated.value);
          mappedCount++;
        } else {
          pdfFieldMap.set('form1[0].Section15_3[0].#area[2].#field[25]', false);
          skippedCount++;
        }

        if (contact1.associationIsPresent?.value !== undefined) {
          pdfFieldMap.set('form1[0].Section15_3[0].#area[2].#field[26]', contact1.associationIsPresent.value);
          mappedCount++;
        } else {
          pdfFieldMap.set('form1[0].Section15_3[0].#area[2].#field[26]', false);
          skippedCount++;
        }

        // Contact 1 details
        if (contact1.officialTitle?.value) {
          pdfFieldMap.set('form1[0].Section15_3[0].TextField11[10]', contact1.officialTitle.value);
          mappedCount++;
        } else {
          pdfFieldMap.set('form1[0].Section15_3[0].TextField11[10]', '');
          skippedCount++;
        }

        if (contact1.frequencyOfContact?.value) {
          pdfFieldMap.set('form1[0].Section15_3[0].TextField11[9]', contact1.frequencyOfContact.value);
          mappedCount++;
        } else {
          pdfFieldMap.set('form1[0].Section15_3[0].TextField11[9]', '');
          skippedCount++;
        }
      }

      // Contact Person 2  
      if (entry.contactPerson2) {
        const contact2 = entry.contactPerson2;
        
        if (contact2.lastName?.value) {
          pdfFieldMap.set('form1[0].Section15_3[0].#area[5].TextField11[14]', contact2.lastName.value);
          mappedCount++;
        } else {
          pdfFieldMap.set('form1[0].Section15_3[0].#area[5].TextField11[14]', '');
          skippedCount++;
        }

        if (contact2.firstName?.value) {
          pdfFieldMap.set('form1[0].Section15_3[0].#area[5].TextField11[16]', contact2.firstName.value);
          mappedCount++;
        } else {
          pdfFieldMap.set('form1[0].Section15_3[0].#area[5].TextField11[16]', '');
          skippedCount++;
        }

        if (contact2.middleName?.value) {
          pdfFieldMap.set('form1[0].Section15_3[0].#area[5].TextField11[15]', contact2.middleName.value);
          mappedCount++;
        } else {
          pdfFieldMap.set('form1[0].Section15_3[0].#area[5].TextField11[15]', '');
          skippedCount++;
        }

        if (contact2.suffix?.value) {
          pdfFieldMap.set('form1[0].Section15_3[0].#area[5].suffix[1]', contact2.suffix.value);
          mappedCount++;
        } else {
          pdfFieldMap.set('form1[0].Section15_3[0].#area[5].suffix[1]', '');
          skippedCount++;
        }

        // Contact 2 address
        if (contact2.street?.value) {
          pdfFieldMap.set('form1[0].Section15_3[0].#area[5].#area[6].TextField11[11]', contact2.street.value);
          mappedCount++;
        } else {
          pdfFieldMap.set('form1[0].Section15_3[0].#area[5].#area[6].TextField11[11]', '');
          skippedCount++;
        }

        if (contact2.city?.value) {
          pdfFieldMap.set('form1[0].Section15_3[0].#area[5].#area[6].TextField11[12]', contact2.city.value);
          mappedCount++;
        } else {
          pdfFieldMap.set('form1[0].Section15_3[0].#area[5].#area[6].TextField11[12]', '');
          skippedCount++;
        }

        if (contact2.state?.value) {
          pdfFieldMap.set('form1[0].Section15_3[0].#area[5].#area[6].School6_State[1]', contact2.state.value);
          mappedCount++;
        } else {
          pdfFieldMap.set('form1[0].Section15_3[0].#area[5].#area[6].School6_State[1]', '');
          skippedCount++;
        }

        if (contact2.country?.value) {
          pdfFieldMap.set('form1[0].Section15_3[0].#area[5].#area[6].DropDownList7[0]', contact2.country.value);
          mappedCount++;
        } else {
          pdfFieldMap.set('form1[0].Section15_3[0].#area[5].#area[6].DropDownList7[0]', '');
          skippedCount++;
        }

        if (contact2.zipCode?.value) {
          pdfFieldMap.set('form1[0].Section15_3[0].#area[5].#area[6].TextField11[13]', contact2.zipCode.value);
          mappedCount++;
        } else {
          pdfFieldMap.set('form1[0].Section15_3[0].#area[5].#area[6].TextField11[13]', '');
          skippedCount++;
        }

        // Contact 2 association dates
        if (contact2.associationFromDate?.value) {
          pdfFieldMap.set('form1[0].Section15_3[0].#area[5].#area[7].From_Datefield_Name_2[4]', contact2.associationFromDate.value);
          mappedCount++;
        } else {
          pdfFieldMap.set('form1[0].Section15_3[0].#area[5].#area[7].From_Datefield_Name_2[4]', '');
          skippedCount++;
        }

        if (contact2.associationFromDateEstimated?.value !== undefined) {
          pdfFieldMap.set('form1[0].Section15_3[0].#area[5].#area[7].#field[39]', contact2.associationFromDateEstimated.value);
          mappedCount++;
        } else {
          pdfFieldMap.set('form1[0].Section15_3[0].#area[5].#area[7].#field[39]', false);
          skippedCount++;
        }

        if (contact2.associationToDate?.value) {
          pdfFieldMap.set('form1[0].Section15_3[0].#area[5].#area[7].From_Datefield_Name_2[5]', contact2.associationToDate.value);
          mappedCount++;
        } else {
          pdfFieldMap.set('form1[0].Section15_3[0].#area[5].#area[7].From_Datefield_Name_2[5]', '');
          skippedCount++;
        }

        if (contact2.associationToDateEstimated?.value !== undefined) {
          pdfFieldMap.set('form1[0].Section15_3[0].#area[5].#area[7].#field[41]', contact2.associationToDateEstimated.value);
          mappedCount++;
        } else {
          pdfFieldMap.set('form1[0].Section15_3[0].#area[5].#area[7].#field[41]', false);
          skippedCount++;
        }

        if (contact2.associationIsPresent?.value !== undefined) {
          pdfFieldMap.set('form1[0].Section15_3[0].#area[5].#area[7].#field[42]', contact2.associationIsPresent.value);
          mappedCount++;
        } else {
          pdfFieldMap.set('form1[0].Section15_3[0].#area[5].#area[7].#field[42]', false);
          skippedCount++;
        }

        // Contact 2 details
        if (contact2.officialTitle?.value) {
          pdfFieldMap.set('form1[0].Section15_3[0].#area[5].TextField11[17]', contact2.officialTitle.value);
          mappedCount++;
        } else {
          pdfFieldMap.set('form1[0].Section15_3[0].#area[5].TextField11[17]', '');
          skippedCount++;
        }

        if (contact2.frequencyOfContact?.value) {
          pdfFieldMap.set('form1[0].Section15_3[0].#area[5].TextField11[18]', contact2.frequencyOfContact.value);
          mappedCount++;
        } else {
          pdfFieldMap.set('form1[0].Section15_3[0].#area[5].TextField11[18]', '');
          skippedCount++;
        }

        // Specify field (unique to contact 2)
        if (contact2.specify?.value) {
          pdfFieldMap.set('form1[0].Section15_3[0].TextField11[19]', contact2.specify.value);
          mappedCount++;
        } else {
          pdfFieldMap.set('form1[0].Section15_3[0].TextField11[19]', '');
          skippedCount++;
        }
      }

      // Additional foreign service status
      pdfFieldMap.set('form1[0].Section15_3[0].RadioButtonList[2]', 'YES'); // Has additional contacts
      mappedCount++;

      console.log('  ✅ Foreign military service entry processed');
    }

  } catch (error) {
    console.error('❌ Section 15: Error mapping fields:', error);
    fieldErrors.push(`Mapping error: ${error instanceof Error ? error.message : String(error)}`);
  }

  // Log comprehensive mapping statistics
  console.log('📊 Section 15 Mapping Statistics:', {
    totalExpectedFields: 95,
    mappedFields: mappedCount,
    skippedFields: skippedCount,
    actualPdfFields: pdfFieldMap.size,
    coverage: `${((mappedCount / 95) * 100).toFixed(1)}%`,
    errors: fieldErrors.length,
    errorDetails: fieldErrors.length > 0 ? fieldErrors : undefined,
    subsections: {
      militaryService: '✅ 15.1 processed',
      disciplinaryProcedures: '✅ 15.2 processed', 
      foreignMilitaryService: '✅ 15.3 processed'
    }
  });

  // Validate mapping completeness
  validateSection15Logic(section15Data, pdfFieldMap);

  return pdfFieldMap;
}

/**
 * Validates Section 15 field logic and relationships
 */
function validateSection15Logic(section15Data: Section15, pdfFieldMap: Map<string, any>): void {
  const warnings: string[] = [];
  const section15 = section15Data.section15;

  if (!section15) return;

  // Validate military service logic
  const hasServed = section15.militaryService.hasServed?.value;
  if (hasServed === 'YES' && (!section15.militaryService.entries || section15.militaryService.entries.length === 0)) {
    warnings.push('Military service indicated but no service entries provided');
  }

  // Validate disciplinary action logic
  const hasDisciplinaryAction = section15.disciplinaryProcedures.hasDisciplinaryAction?.value;
  if (hasDisciplinaryAction === 'YES' && (!section15.disciplinaryProcedures.entries || section15.disciplinaryProcedures.entries.length === 0)) {
    warnings.push('Disciplinary action indicated but no disciplinary entries provided');
  }

  // Validate foreign military service logic
  const hasForeignService = section15.foreignMilitaryService.hasServedInForeignMilitary?.value;
  if (hasForeignService === 'YES' && (!section15.foreignMilitaryService.entries || section15.foreignMilitaryService.entries.length === 0)) {
    warnings.push('Foreign military service indicated but no foreign service entries provided');
  }

  // Validate service entry completeness
  if (section15.militaryService.entries) {
    section15.militaryService.entries.forEach((entry, index) => {
      if (!entry.branch?.value) {
        warnings.push(`Military service entry ${index + 1}: Missing branch`);
      }
      if (!entry.fromDate?.value && !entry.toDate?.value) {
        warnings.push(`Military service entry ${index + 1}: Missing service dates`);
      }
    });
  }

  // Validate foreign service contact information
  if (section15.foreignMilitaryService.entries && section15.foreignMilitaryService.entries.length > 0) {
    const foreignEntry = section15.foreignMilitaryService.entries[0];
    if (!foreignEntry.contactPerson1?.firstName?.value && !foreignEntry.contactPerson1?.lastName?.value) {
      warnings.push('Foreign military service requires at least one contact person');
    }
  }

  if (warnings.length > 0) {
    console.warn('⚠️ Section 15 Validation Warnings:', warnings);
  }
}

/**
 * Get field statistics for Section 15
 */
export function getSection15FieldStats(): {
  totalFields: number;
  subsectionBreakdown: Record<string, number>;
  fieldTypes: Record<string, number>;
  maxEntries: Record<string, number>;
} {
  return {
    totalFields: 95,
    subsectionBreakdown: {
      militaryService: 35, // Per entry (up to 2 entries)
      disciplinaryProcedures: 10, // Per entry (up to 2 entries)
      foreignMilitaryService: 25 // Including contact persons
    },
    fieldTypes: {
      RadioGroups: 14,
      Dropdowns: 9,
      TextFields: 50,
      CheckBoxes: 22
    },
    maxEntries: {
      militaryService: 2,
      disciplinaryProcedures: 2,
      foreignMilitaryService: 1
    }
  };
}

// Export for use in integration
export type { Section15 };