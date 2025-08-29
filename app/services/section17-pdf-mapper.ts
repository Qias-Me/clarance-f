/**
 * Section 17 PDF Field Mapper
 * Maps Section 17 (Marital Status) data to PDF fields
 * Total fields: 332
 * 
 * Covers:
 * - Current marital status and spouse information
 * - Marriage details and location
 * - Previous marriages and divorce information
 * - Cohabitation relationships
 */

import type { Field, FieldWithOptions } from '../interfaces/formDefinition2.0';
import type { Section17 } from '../../api/interfaces/section-interfaces/section17';

/**
 * Maps Section 17 data to PDF fields
 * Handles Marital Status with complex relationship logic
 * 
 * Field mapping breakdown:
 * - Current marital status: ~25 fields
 * - Current spouse info: ~40 fields
 * - Marriage details: ~20 fields
 * - Previous marriages: ~50 fields per entry (up to 3 entries)
 * - Cohabitation: ~35 fields
 * - Additional relationships: ~30 fields per entry
 * 
 * @param section17Data - The Section 17 data from the form context
 * @returns Map of PDF field IDs to their values
 */
export function mapSection17ToPDFFields(section17Data: Section17): Map<string, any> {
  const pdfFieldMap = new Map<string, any>();

  if (!section17Data?.section17) {
    console.warn('⚠️ Section 17: No data provided');
    return pdfFieldMap;
  }

  const section17 = section17Data.section17;
  let mappedCount = 0;
  let skippedCount = 0;
  const fieldErrors: string[] = [];

  try {
    // ============================================================================
    // SECTION 17: CURRENT MARITAL STATUS
    // ============================================================================
    
    console.log('📝 Processing Section 17: Marital Status');
    
    // Current marital status
    if (section17.currentMaritalStatus?.value !== undefined) {
      const maritalStatusValue = section17.currentMaritalStatus.value;
      pdfFieldMap.set('form1[0].Section17_1[0].MaritalStatus[0]', maritalStatusValue);
      mappedCount++;
      console.log(`  ✅ Current marital status: ${maritalStatusValue}`);
    } else {
      skippedCount++;
      console.log('  ⏭️  Skipped: Current marital status (undefined)');
    }

    // ============================================================================
    // CURRENT SPOUSE INFORMATION
    // ============================================================================
    
    if (section17.currentSpouse) {
      console.log('📝 Processing current spouse information');
      const spouse = section17.currentSpouse;
      
      // Spouse name
      if (spouse.name?.first?.value) {
        pdfFieldMap.set('form1[0].Section17_1[0].SpouseName_First[0]', spouse.name.first.value);
        mappedCount++;
        console.log(`  ✅ Spouse first name: ${spouse.name.first.value}`);
      }
      
      if (spouse.name?.middle?.value) {
        pdfFieldMap.set('form1[0].Section17_1[0].SpouseName_Middle[0]', spouse.name.middle.value);
        mappedCount++;
        console.log(`  ✅ Spouse middle name: ${spouse.name.middle.value}`);
      }
      
      if (spouse.name?.last?.value) {
        pdfFieldMap.set('form1[0].Section17_1[0].SpouseName_Last[0]', spouse.name.last.value);
        mappedCount++;
        console.log(`  ✅ Spouse last name: ${spouse.name.last.value}`);
      }
      
      // Spouse birth information
      if (spouse.birthDate?.value) {
        pdfFieldMap.set('form1[0].Section17_1[0].SpouseBirthDate[0]', spouse.birthDate.value);
        mappedCount++;
        console.log(`  ✅ Spouse birth date: ${spouse.birthDate.value}`);
      }
      
      if (spouse.birthPlace?.city?.value) {
        pdfFieldMap.set('form1[0].Section17_1[0].SpouseBirthPlace_City[0]', spouse.birthPlace.city.value);
        mappedCount++;
      }
      
      if (spouse.birthPlace?.state?.value) {
        pdfFieldMap.set('form1[0].Section17_1[0].SpouseBirthPlace_State[0]', spouse.birthPlace.state.value);
        mappedCount++;
      }
      
      if (spouse.birthPlace?.country?.value) {
        pdfFieldMap.set('form1[0].Section17_1[0].SpouseBirthPlace_Country[0]', spouse.birthPlace.country.value);
        mappedCount++;
      }
      
      // Spouse citizenship
      if (spouse.citizenship?.value) {
        pdfFieldMap.set('form1[0].Section17_1[0].SpouseCitizenship[0]', spouse.citizenship.value);
        mappedCount++;
        console.log(`  ✅ Spouse citizenship: ${spouse.citizenship.value}`);
      }
      
      // Spouse SSN
      if (spouse.ssn?.value) {
        pdfFieldMap.set('form1[0].Section17_1[0].SpouseSSN[0]', spouse.ssn.value);
        mappedCount++;
        console.log(`  ✅ Spouse SSN provided`);
      }
      
      // Spouse contact information
      if (spouse.phoneNumbers?.home?.value) {
        pdfFieldMap.set('form1[0].Section17_1[0].SpousePhone_Home[0]', spouse.phoneNumbers.home.value);
        mappedCount++;
      }
      
      if (spouse.phoneNumbers?.work?.value) {
        pdfFieldMap.set('form1[0].Section17_1[0].SpousePhone_Work[0]', spouse.phoneNumbers.work.value);
        mappedCount++;
      }
      
      if (spouse.phoneNumbers?.cell?.value) {
        pdfFieldMap.set('form1[0].Section17_1[0].SpousePhone_Cell[0]', spouse.phoneNumbers.cell.value);
        mappedCount++;
      }
      
      if (spouse.email?.value) {
        pdfFieldMap.set('form1[0].Section17_1[0].SpouseEmail[0]', spouse.email.value);
        mappedCount++;
      }
      
      // Spouse current address
      if (spouse.currentAddress) {
        const address = spouse.currentAddress;
        
        if (address.street?.value) {
          pdfFieldMap.set('form1[0].Section17_1[0].SpouseAddress_Street[0]', address.street.value);
          mappedCount++;
        }
        
        if (address.city?.value) {
          pdfFieldMap.set('form1[0].Section17_1[0].SpouseAddress_City[0]', address.city.value);
          mappedCount++;
        }
        
        if (address.state?.value) {
          pdfFieldMap.set('form1[0].Section17_1[0].SpouseAddress_State[0]', address.state.value);
          mappedCount++;
        }
        
        if (address.zipcode?.value) {
          pdfFieldMap.set('form1[0].Section17_1[0].SpouseAddress_Zip[0]', address.zipcode.value);
          mappedCount++;
        }
        
        if (address.country?.value) {
          pdfFieldMap.set('form1[0].Section17_1[0].SpouseAddress_Country[0]', address.country.value);
          mappedCount++;
        }
      }
      
      // Spouse employment information
      if (spouse.employer) {
        const employer = spouse.employer;
        
        if (employer.name?.value) {
          pdfFieldMap.set('form1[0].Section17_1[0].SpouseEmployer_Name[0]', employer.name.value);
          mappedCount++;
        }
        
        if (employer.position?.value) {
          pdfFieldMap.set('form1[0].Section17_1[0].SpouseEmployer_Position[0]', employer.position.value);
          mappedCount++;
        }
        
        if (employer.supervisor?.value) {
          pdfFieldMap.set('form1[0].Section17_1[0].SpouseEmployer_Supervisor[0]', employer.supervisor.value);
          mappedCount++;
        }
        
        if (employer.phone?.value) {
          pdfFieldMap.set('form1[0].Section17_1[0].SpouseEmployer_Phone[0]', employer.phone.value);
          mappedCount++;
        }
        
        // Spouse employer address
        if (employer.address) {
          const empAddress = employer.address;
          
          if (empAddress.street?.value) {
            pdfFieldMap.set('form1[0].Section17_1[0].SpouseEmployer_Street[0]', empAddress.street.value);
            mappedCount++;
          }
          
          if (empAddress.city?.value) {
            pdfFieldMap.set('form1[0].Section17_1[0].SpouseEmployer_City[0]', empAddress.city.value);
            mappedCount++;
          }
          
          if (empAddress.state?.value) {
            pdfFieldMap.set('form1[0].Section17_1[0].SpouseEmployer_State[0]', empAddress.state.value);
            mappedCount++;
          }
          
          if (empAddress.zipcode?.value) {
            pdfFieldMap.set('form1[0].Section17_1[0].SpouseEmployer_Zip[0]', empAddress.zipcode.value);
            mappedCount++;
          }
          
          if (empAddress.country?.value) {
            pdfFieldMap.set('form1[0].Section17_1[0].SpouseEmployer_Country[0]', empAddress.country.value);
            mappedCount++;
          }
        }
      }
    }

    // ============================================================================
    // MARRIAGE INFORMATION
    // ============================================================================
    
    if (section17.currentMarriage) {
      console.log('📝 Processing marriage information');
      const marriage = section17.currentMarriage;
      
      // Marriage date
      if (marriage.date?.value) {
        pdfFieldMap.set('form1[0].Section17_1[0].MarriageDate[0]', marriage.date.value);
        mappedCount++;
        console.log(`  ✅ Marriage date: ${marriage.date.value}`);
      }
      
      // Marriage location
      if (marriage.location?.city?.value) {
        pdfFieldMap.set('form1[0].Section17_1[0].MarriageLocation_City[0]', marriage.location.city.value);
        mappedCount++;
      }
      
      if (marriage.location?.state?.value) {
        pdfFieldMap.set('form1[0].Section17_1[0].MarriageLocation_State[0]', marriage.location.state.value);
        mappedCount++;
      }
      
      if (marriage.location?.country?.value) {
        pdfFieldMap.set('form1[0].Section17_1[0].MarriageLocation_Country[0]', marriage.location.country.value);
        mappedCount++;
      }
      
      // Marriage type and officiant
      if (marriage.type?.value) {
        pdfFieldMap.set('form1[0].Section17_1[0].MarriageType[0]', marriage.type.value);
        mappedCount++;
      }
      
      if (marriage.officiant?.value) {
        pdfFieldMap.set('form1[0].Section17_1[0].MarriageOfficiant[0]', marriage.officiant.value);
        mappedCount++;
      }
    }

    // ============================================================================
    // SEPARATION/DIVORCE INFORMATION
    // ============================================================================
    
    if (section17.currentMarriage?.separationInfo) {
      console.log('📝 Processing separation/divorce information');
      const separation = section17.currentMarriage.separationInfo;
      
      // Separation information
      if (separation.separated?.value !== undefined) {
        pdfFieldMap.set('form1[0].Section17_1[0].IsSeparated[0]', separation.separated.value ? 'Yes' : 'No');
        mappedCount++;
      }
      
      if (separation.separationDate?.value) {
        pdfFieldMap.set('form1[0].Section17_1[0].SeparationDate[0]', separation.separationDate.value);
        mappedCount++;
        console.log(`  ✅ Separation date: ${separation.separationDate.value}`);
      }
      
      // Divorce information
      if (separation.divorced?.value !== undefined) {
        pdfFieldMap.set('form1[0].Section17_1[0].IsDivorced[0]', separation.divorced.value ? 'Yes' : 'No');
        mappedCount++;
      }
      
      if (separation.divorceDate?.value) {
        pdfFieldMap.set('form1[0].Section17_1[0].DivorceDate[0]', separation.divorceDate.value);
        mappedCount++;
        console.log(`  ✅ Divorce date: ${separation.divorceDate.value}`);
      }
      
      // Divorce location
      if (separation.divorceLocation?.city?.value) {
        pdfFieldMap.set('form1[0].Section17_1[0].DivorceLocation_City[0]', separation.divorceLocation.city.value);
        mappedCount++;
      }
      
      if (separation.divorceLocation?.state?.value) {
        pdfFieldMap.set('form1[0].Section17_1[0].DivorceLocation_State[0]', separation.divorceLocation.state.value);
        mappedCount++;
      }
      
      if (separation.divorceLocation?.country?.value) {
        pdfFieldMap.set('form1[0].Section17_1[0].DivorceLocation_Country[0]', separation.divorceLocation.country.value);
        mappedCount++;
      }
      
      // Divorce reason and court records
      if (separation.reason?.value) {
        pdfFieldMap.set('form1[0].Section17_1[0].DivorceReason[0]', separation.reason.value);
        mappedCount++;
      }
      
      if (separation.courtRecord?.value) {
        pdfFieldMap.set('form1[0].Section17_1[0].DivorceCourtRecord[0]', separation.courtRecord.value);
        mappedCount++;
      }
    }

    // ============================================================================
    // PREVIOUS MARRIAGES
    // ============================================================================
    
    // Has previous marriages question
    if (section17.hasPreviousMarriages?.value !== undefined) {
      const hasPreviousValue = section17.hasPreviousMarriages.value ? 'Yes' : 'No';
      pdfFieldMap.set('form1[0].Section17_1[0].HasPreviousMarriages[0]', hasPreviousValue);
      mappedCount++;
      console.log(`  ✅ Has previous marriages: ${hasPreviousValue}`);
    }
    
    // Process previous marriage entries (up to 3 entries)
    if (section17.previousMarriages && section17.previousMarriages.length > 0) {
      section17.previousMarriages.slice(0, 3).forEach((marriage, marriageIndex) => {
        console.log(`  📝 Processing previous marriage ${marriageIndex + 1}`);
        
        const entryNum = marriageIndex + 1;
        const baseFieldId = `form1[0].Section17_${entryNum}`;
        
        // Former spouse information
        if (marriage.formerSpouse) {
          const formerSpouse = marriage.formerSpouse;
          
          // Former spouse name
          if (formerSpouse.name?.first?.value) {
            pdfFieldMap.set(`${baseFieldId}[0].FormerSpouseName_First[0]`, formerSpouse.name.first.value);
            mappedCount++;
          }
          
          if (formerSpouse.name?.middle?.value) {
            pdfFieldMap.set(`${baseFieldId}[0].FormerSpouseName_Middle[0]`, formerSpouse.name.middle.value);
            mappedCount++;
          }
          
          if (formerSpouse.name?.last?.value) {
            pdfFieldMap.set(`${baseFieldId}[0].FormerSpouseName_Last[0]`, formerSpouse.name.last.value);
            mappedCount++;
            console.log(`    ✅ Former spouse ${entryNum} name: ${formerSpouse.name.last.value}`);
          }
          
          // Former spouse birth information
          if (formerSpouse.birthDate?.value) {
            pdfFieldMap.set(`${baseFieldId}[0].FormerSpouseBirthDate[0]`, formerSpouse.birthDate.value);
            mappedCount++;
          }
          
          if (formerSpouse.birthPlace?.city?.value) {
            pdfFieldMap.set(`${baseFieldId}[0].FormerSpouseBirthPlace_City[0]`, formerSpouse.birthPlace.city.value);
            mappedCount++;
          }
          
          if (formerSpouse.birthPlace?.state?.value) {
            pdfFieldMap.set(`${baseFieldId}[0].FormerSpouseBirthPlace_State[0]`, formerSpouse.birthPlace.state.value);
            mappedCount++;
          }
          
          if (formerSpouse.birthPlace?.country?.value) {
            pdfFieldMap.set(`${baseFieldId}[0].FormerSpouseBirthPlace_Country[0]`, formerSpouse.birthPlace.country.value);
            mappedCount++;
          }
          
          // Former spouse SSN and citizenship
          if (formerSpouse.ssn?.value) {
            pdfFieldMap.set(`${baseFieldId}[0].FormerSpouseSSN[0]`, formerSpouse.ssn.value);
            mappedCount++;
          }
          
          if (formerSpouse.citizenship?.value) {
            pdfFieldMap.set(`${baseFieldId}[0].FormerSpouseCitizenship[0]`, formerSpouse.citizenship.value);
            mappedCount++;
          }
        }
        
        // Marriage information for previous marriage
        if (marriage.marriageInfo) {
          const marriageInfo = marriage.marriageInfo;
          
          if (marriageInfo.date?.value) {
            pdfFieldMap.set(`${baseFieldId}[0].PreviousMarriageDate[0]`, marriageInfo.date.value);
            mappedCount++;
          }
          
          if (marriageInfo.location?.city?.value) {
            pdfFieldMap.set(`${baseFieldId}[0].PreviousMarriageLocation_City[0]`, marriageInfo.location.city.value);
            mappedCount++;
          }
          
          if (marriageInfo.location?.state?.value) {
            pdfFieldMap.set(`${baseFieldId}[0].PreviousMarriageLocation_State[0]`, marriageInfo.location.state.value);
            mappedCount++;
          }
          
          if (marriageInfo.location?.country?.value) {
            pdfFieldMap.set(`${baseFieldId}[0].PreviousMarriageLocation_Country[0]`, marriageInfo.location.country.value);
            mappedCount++;
          }
        }
        
        // Separation information for previous marriage
        if (marriage.separationInfo) {
          const separationInfo = marriage.separationInfo;
          
          if (separationInfo.divorceDate?.value) {
            pdfFieldMap.set(`${baseFieldId}[0].PreviousDivorceDate[0]`, separationInfo.divorceDate.value);
            mappedCount++;
          }
          
          if (separationInfo.divorceLocation?.city?.value) {
            pdfFieldMap.set(`${baseFieldId}[0].PreviousDivorceLocation_City[0]`, separationInfo.divorceLocation.city.value);
            mappedCount++;
          }
          
          if (separationInfo.divorceLocation?.state?.value) {
            pdfFieldMap.set(`${baseFieldId}[0].PreviousDivorceLocation_State[0]`, separationInfo.divorceLocation.state.value);
            mappedCount++;
          }
          
          if (separationInfo.divorceLocation?.country?.value) {
            pdfFieldMap.set(`${baseFieldId}[0].PreviousDivorceLocation_Country[0]`, separationInfo.divorceLocation.country.value);
            mappedCount++;
          }
          
          if (separationInfo.reason?.value) {
            pdfFieldMap.set(`${baseFieldId}[0].PreviousDivorceReason[0]`, separationInfo.reason.value);
            mappedCount++;
          }
        }
        
        // Children information
        if (marriage.children?.hasChildren?.value !== undefined) {
          const hasChildrenValue = marriage.children.hasChildren.value ? 'Yes' : 'No';
          pdfFieldMap.set(`${baseFieldId}[0].HasChildren[0]`, hasChildrenValue);
          mappedCount++;
          
          if (marriage.children.childrenDetails && marriage.children.childrenDetails.length > 0) {
            marriage.children.childrenDetails.slice(0, 2).forEach((child, childIndex) => {
              const childNum = childIndex + 1;
              
              if (child.name?.first?.value) {
                pdfFieldMap.set(`${baseFieldId}[0].Child${childNum}_Name_First[0]`, child.name.first.value);
                mappedCount++;
              }
              
              if (child.name?.last?.value) {
                pdfFieldMap.set(`${baseFieldId}[0].Child${childNum}_Name_Last[0]`, child.name.last.value);
                mappedCount++;
              }
              
              if (child.birthDate?.value) {
                pdfFieldMap.set(`${baseFieldId}[0].Child${childNum}_BirthDate[0]`, child.birthDate.value);
                mappedCount++;
              }
            });
          }
        }
      });
    }

    // ============================================================================
    // COHABITATION INFORMATION
    // ============================================================================
    
    if (section17.cohabitation) {
      console.log('📝 Processing cohabitation information');
      const cohabitation = section17.cohabitation;
      
      // Partner information
      if (cohabitation.partner) {
        const partner = cohabitation.partner;
        
        if (partner.name?.first?.value) {
          pdfFieldMap.set('form1[0].Section17_Cohabitation[0].PartnerName_First[0]', partner.name.first.value);
          mappedCount++;
        }
        
        if (partner.name?.middle?.value) {
          pdfFieldMap.set('form1[0].Section17_Cohabitation[0].PartnerName_Middle[0]', partner.name.middle.value);
          mappedCount++;
        }
        
        if (partner.name?.last?.value) {
          pdfFieldMap.set('form1[0].Section17_Cohabitation[0].PartnerName_Last[0]', partner.name.last.value);
          mappedCount++;
          console.log(`  ✅ Cohabitation partner: ${partner.name.last.value}`);
        }
        
        if (partner.birthDate?.value) {
          pdfFieldMap.set('form1[0].Section17_Cohabitation[0].PartnerBirthDate[0]', partner.birthDate.value);
          mappedCount++;
        }
        
        if (partner.ssn?.value) {
          pdfFieldMap.set('form1[0].Section17_Cohabitation[0].PartnerSSN[0]', partner.ssn.value);
          mappedCount++;
        }
        
        if (partner.citizenship?.value) {
          pdfFieldMap.set('form1[0].Section17_Cohabitation[0].PartnerCitizenship[0]', partner.citizenship.value);
          mappedCount++;
        }
        
        // Partner address
        if (partner.currentAddress) {
          const address = partner.currentAddress;
          
          if (address.street?.value) {
            pdfFieldMap.set('form1[0].Section17_Cohabitation[0].PartnerAddress_Street[0]', address.street.value);
            mappedCount++;
          }
          
          if (address.city?.value) {
            pdfFieldMap.set('form1[0].Section17_Cohabitation[0].PartnerAddress_City[0]', address.city.value);
            mappedCount++;
          }
          
          if (address.state?.value) {
            pdfFieldMap.set('form1[0].Section17_Cohabitation[0].PartnerAddress_State[0]', address.state.value);
            mappedCount++;
          }
          
          if (address.zipcode?.value) {
            pdfFieldMap.set('form1[0].Section17_Cohabitation[0].PartnerAddress_Zip[0]', address.zipcode.value);
            mappedCount++;
          }
        }
      }
      
      // Relationship dates
      if (cohabitation.relationshipStart?.value) {
        pdfFieldMap.set('form1[0].Section17_Cohabitation[0].RelationshipStart[0]', cohabitation.relationshipStart.value);
        mappedCount++;
      }
      
      if (cohabitation.relationshipEnd?.value) {
        pdfFieldMap.set('form1[0].Section17_Cohabitation[0].RelationshipEnd[0]', cohabitation.relationshipEnd.value);
        mappedCount++;
      }
      
      if (cohabitation.cohabitationStart?.value) {
        pdfFieldMap.set('form1[0].Section17_Cohabitation[0].CohabitationStart[0]', cohabitation.cohabitationStart.value);
        mappedCount++;
      }
      
      if (cohabitation.cohabitationEnd?.value) {
        pdfFieldMap.set('form1[0].Section17_Cohabitation[0].CohabitationEnd[0]', cohabitation.cohabitationEnd.value);
        mappedCount++;
      }
      
      if (cohabitation.reason?.value) {
        pdfFieldMap.set('form1[0].Section17_Cohabitation[0].CohabitationReason[0]', cohabitation.reason.value);
        mappedCount++;
      }
    }

    // ============================================================================
    // ADDITIONAL INFORMATION
    // ============================================================================
    
    if (section17.additionalInfo) {
      console.log('📝 Processing additional information');
      const additionalInfo = section17.additionalInfo;
      
      if (additionalInfo.legalName?.value) {
        pdfFieldMap.set('form1[0].Section17_Additional[0].LegalName[0]', additionalInfo.legalName.value);
        mappedCount++;
      }
      
      if (additionalInfo.nameChangeDocuments?.value) {
        pdfFieldMap.set('form1[0].Section17_Additional[0].NameChangeDocuments[0]', additionalInfo.nameChangeDocuments.value);
        mappedCount++;
      }
      
      if (additionalInfo.courtRecords?.value) {
        pdfFieldMap.set('form1[0].Section17_Additional[0].CourtRecords[0]', additionalInfo.courtRecords.value);
        mappedCount++;
      }
      
      if (additionalInfo.otherRelevantInfo?.value) {
        pdfFieldMap.set('form1[0].Section17_Additional[0].OtherInfo[0]', additionalInfo.otherRelevantInfo.value);
        mappedCount++;
      }
    }

  } catch (error) {
    console.error('❌ Section 17 PDF mapping error:', error);
    fieldErrors.push(`Mapping error: ${error.message}`);
  }

  // ============================================================================
  // FINAL STATISTICS AND VALIDATION
  // ============================================================================
  
  const totalFields = mappedCount + skippedCount;
  console.log('\n📊 Section 17 PDF Mapping Statistics:');
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
    currentMaritalStatus: '✅ 17.1 processed',
    spouseInfo: section17.currentSpouse ? '✅ 17.2 processed' : '⏭️ 17.2 skipped',
    marriageInfo: section17.currentMarriage ? '✅ 17.3 processed' : '⏭️ 17.3 skipped',
    previousMarriages: section17.hasPreviousMarriages?.value ? '✅ 17.4 processed' : '⏭️ 17.4 skipped',
    cohabitation: section17.cohabitation ? '✅ 17.5 processed' : '⏭️ 17.5 skipped',
    additionalInfo: section17.additionalInfo ? '✅ 17.6 processed' : '⏭️ 17.6 skipped'
  };
  
  console.log('\n📋 Subsection Processing Status:');
  Object.entries(subsectionStatus).forEach(([section, status]) => {
    console.log(`   ${status}`);
  });
  
  // Validate marital status logic
  const maritalStatus = section17.currentMaritalStatus?.value;
  const warnings: string[] = [];
  
  if (maritalStatus === 'Married' && !section17.currentSpouse) {
    warnings.push('Marital status is "Married" but no spouse information provided');
  }
  
  if (maritalStatus === 'Cohabiting' && !section17.cohabitation) {
    warnings.push('Marital status is "Cohabiting" but no cohabitation information provided');
  }
  
  if (section17.hasPreviousMarriages?.value === true && (!section17.previousMarriages || section17.previousMarriages.length === 0)) {
    warnings.push('Has previous marriages indicated but no previous marriage entries provided');
  }
  
  if (warnings.length > 0) {
    console.log('\n⚠️ Data Validation Warnings:');
    warnings.forEach(warning => console.log(`   - ${warning}`));
  }
  
  // Expected field counts per subsection
  const expectedFieldCounts = {
    baseMaritalStatus: 25, // Core marital status fields
    currentSpouse: 40, // Current spouse information
    marriageInfo: 20, // Marriage details
    previousMarriages: 50, // Per entry (up to 3 entries)
    cohabitation: 35, // Cohabitation details
    additionalInfo: 15 // Additional information
  };
  
  const actualFieldCounts = {
    totalEntries: section17.previousMarriages?.length || 0,
    hasSpouse: !!section17.currentSpouse,
    hasCohabitation: !!section17.cohabitation,
    hasAdditionalInfo: !!section17.additionalInfo
  };
  
  console.log('\n🎯 Section 17 Field Mapping Summary:');
  console.log(`   Expected total fields: ~332`);
  console.log(`   Actually mapped: ${mappedCount}`);
  console.log(`   Coverage: ${((mappedCount / 332) * 100).toFixed(1)}%`);
  console.log(`   Previous marriages: ${actualFieldCounts.totalEntries}`);
  console.log(`   Has current spouse: ${actualFieldCounts.hasSpouse}`);
  console.log(`   Has cohabitation: ${actualFieldCounts.hasCohabitation}`);
  
  console.log('\n✅ Section 17 PDF field mapping completed');
  return pdfFieldMap;
}

/**
 * Helper function to validate Section 17 data integrity
 */
export function validateSection17Data(section17: Section17): string[] {
  const errors: string[] = [];
  
  // Required field validation
  if (!section17.currentMaritalStatus?.value) {
    errors.push('Current marital status is required');
  }
  
  // Conditional validation based on marital status
  const maritalStatus = section17.currentMaritalStatus?.value;
  
  if (['Married', 'Separated'].includes(maritalStatus as string)) {
    if (!section17.currentSpouse) {
      errors.push('Spouse information is required for married/separated status');
    }
    if (!section17.currentMarriage) {
      errors.push('Marriage information is required for married/separated status');
    }
  }
  
  if (maritalStatus === 'Cohabiting' && !section17.cohabitation) {
    errors.push('Cohabitation information is required for cohabiting status');
  }
  
  if (section17.hasPreviousMarriages?.value === true) {
    if (!section17.previousMarriages || section17.previousMarriages.length === 0) {
      errors.push('Previous marriage entries are required when indicated');
    }
  }
  
  return errors;
}