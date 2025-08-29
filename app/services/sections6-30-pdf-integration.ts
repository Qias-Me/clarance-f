/**
 * Sections 6-30 PDF Integration Service
 * 
 * Comprehensive field mapping and integration service for SF-86 Sections 6-30
 * This service ensures proper data transformation from UI to PDF format
 */

import type { 
  ApplicantFormValues, 
  Field, 
  FieldWithOptions 
} from '../../api/interfaces/formDefinition2.0';

/**
 * Section Field Mappings
 * Maps UI field paths to PDF field IDs for sections 6-15
 */
export const SECTION_6_30_PDF_MAPPINGS = {
  // Section 6: Marital Status
  section6: {
    // TODO: Add Section 6 mappings when mapper is created
    // Placeholder for Section 6 fields
  },

  // Section 7: Relatives
  section7: {
    // TODO: Add Section 7 mappings when mapper is created
    // Placeholder for Section 7 fields
  },

  // Section 8: Associates
  section8: {
    // Mapped via section8-pdf-mapper.ts
  },

  // Section 9: Citizenship
  // NOTE: Section 9 has complex citizenship fields handled by section9-pdf-mapper.ts
  section9: {
    // Placeholder - actual mapping handled by section9-pdf-mapper.ts
    // which properly maps all 78 citizenship-related fields
  },

  // Section 10: Dual/Multiple Citizenship & Foreign Passport
  // NOTE: Section 10 has 122 fields handled by section10-pdf-mapper.ts
  section10: {
    // Placeholder - actual mapping handled by section10-pdf-mapper.ts
    // which properly maps dual citizenship and foreign passport fields
  },

  // Section 11: Where You Have Lived
  // NOTE: Section 11 has 252 fields handled by section11-pdf-mapper.ts
  section11: {
    // Placeholder - actual mapping handled by section11-pdf-mapper.ts
    // which properly maps residence history with up to 4 entries
  },

  // Section 12: Where You Went to School
  // NOTE: Section 12 has 150 fields handled by section12-pdf-mapper.ts
  section12: {
    // Placeholder - actual mapping handled by section12-pdf-mapper.ts
    // which properly maps educational history with up to 4 entries
  },

  // Section 13: Employment Activities
  // NOTE: Section 13 has 1086 fields handled by section13-pdf-mapper.ts
  section13: {
    // Placeholder - actual mapping handled by section13-pdf-mapper.ts
    // which properly maps comprehensive employment history
  },

  // Section 14: Selective Service
  // NOTE: Section 14 has 5 fields handled by section14-pdf-mapper.ts
  section14: {
    // Placeholder - actual mapping handled by section14-pdf-mapper.ts
    // which properly maps Selective Service registration information
  },

  // Section 15: Military History
  // NOTE: Section 15 has 95 fields handled by section15-pdf-mapper.ts
  section15: {
    // Placeholder - actual mapping handled by section15-pdf-mapper.ts
    // which properly maps military service history, disciplinary procedures, and foreign military service
  },

  // Section 16: Foreign Activities
  // NOTE: Section 16 has 154 fields handled by section16-pdf-mapper.ts
  section16: {
    // Placeholder - actual mapping handled by section16-pdf-mapper.ts
    // which properly maps foreign activities and financial interests
  },

  // Section 17: Marital Status
  // NOTE: Section 17 has 332 fields handled by section17-pdf-mapper.ts
  section17: {
    // Placeholder - actual mapping handled by section17-pdf-mapper.ts
    // which properly maps marital status, spouse information, previous marriages, and cohabitation
  },

  // Section 27: Use of Information Technology Systems
  // NOTE: Section 27 has 57 fields handled by section27-pdf-mapper.ts
  section27: {
    // Placeholder - actual mapping handled by section27-pdf-mapper.ts
    // which properly maps IT system violations including illegal access, modification, and unauthorized entry
  },

  // Section 28: Involvement in Non-Criminal Court Actions
  // NOTE: Section 28 has 23 fields handled by section28-pdf-mapper.ts
  section28: {
    // Placeholder - actual mapping handled by section28-pdf-mapper.ts
    // which properly maps court action disclosures, dates, parties, and results
  },

  // Section 29: Association Record
  // NOTE: Section 29 has 141 fields handled by section29-pdf-mapper.ts
  section29: {
    // Placeholder - actual mapping handled by section29-pdf-mapper.ts
    // which properly maps 7 subsections covering terrorism organizations, activities, advocacy,
    // violent overthrow organizations, violence/force organizations, overthrow activities, and terrorism associations
  },

  // Section 30: Continuation Section
  // NOTE: Section 30 has 25 fields handled by section30-pdf-mapper.ts
  section30: {
    // Placeholder - actual mapping handled by section30-pdf-mapper.ts
    // which properly maps continuation sheets, personal info across multiple pages, and medical info
  }
};

/**
 * Transform UI data to PDF-compatible format for sections 6-15
 */
export async function transformSections6to30ForPDF(formData: ApplicantFormValues): Promise<Map<string, any>> {
  const pdfFieldMap = new Map<string, any>();

  // Process Section 6 - Marital Status
  if (formData.section6) {
    // TODO: Implement Section 6 mapping when mapper is created
    console.log('Section 6 mapping placeholder - mapper not yet implemented');
  }

  // Process Section 7 - Relatives
  if (formData.section7) {
    // TODO: Implement Section 7 mapping when mapper is created
    console.log('Section 7 mapping placeholder - mapper not yet implemented');
  }

  // Process Section 8 - Associates
  if (formData.section8) {
    const mapperModule = await import('./section8-pdf-mapper');
    const section8Fields = mapperModule.mapSection8ToPDFFields(formData.section8);
    section8Fields.forEach((value, key) => {
      pdfFieldMap.set(key, value);
    });
  }

  // Process Section 9 - Citizenship
  if (formData.section9) {
    // Section 9 contains complex citizenship fields with conditional subsections
    // Use the dedicated mapper for proper handling
    // Dynamic import to avoid circular dependencies
    const mapperModule = await import('./section9-pdf-mapper');
    const section9Fields = mapperModule.mapSection9ToPDFFields(formData.section9);
    
    // Add all Section 9 fields to the main PDF field map
    section9Fields.forEach((value, key) => {
      pdfFieldMap.set(key, value);
    });
  }

  // Process Section 10 - Dual/Multiple Citizenship & Foreign Passport
  if (formData.section10) {
    // Section 10 contains 122 fields for dual citizenship and foreign passport information
    // Use the dedicated mapper for proper handling
    const mapperModule = await import('./section10-pdf-mapper');
    const section10Fields = mapperModule.mapSection10ToPDFFields(formData.section10);
    
    // Add all Section 10 fields to the main PDF field map
    section10Fields.forEach((value, key) => {
      pdfFieldMap.set(key, value);
    });
  }

  // Process Section 11 - Where You Have Lived
  if (formData.section11) {
    // Section 11 contains 252 fields for residence history
    // Use the dedicated mapper for proper handling
    const mapperModule = await import('./section11-pdf-mapper');
    const section11Fields = mapperModule.mapSection11ToPDFFields(formData.section11);
    
    // Add all Section 11 fields to the main PDF field map
    section11Fields.forEach((value, key) => {
      pdfFieldMap.set(key, value);
    });
  }

  // Process Section 12 - Where You Went to School
  if (formData.section12) {
    // Section 12 contains 150 fields for educational history
    // Use the dedicated mapper for proper handling
    const mapperModule = await import('./section12-pdf-mapper');
    const section12Fields = mapperModule.mapSection12ToPDFFields(formData.section12);
    
    // Add all Section 12 fields to the main PDF field map
    section12Fields.forEach((value, key) => {
      pdfFieldMap.set(key, value);
    });
  }

  // Process Section 13 - Employment Activities
  if (formData.section13) {
    // Section 13 contains 1086 fields for employment history
    // Use the dedicated mapper for proper handling
    const mapperModule = await import('./section13-pdf-mapper');
    const section13Fields = mapperModule.mapSection13ToPDFFields(formData.section13);
    
    // Add all Section 13 fields to the main PDF field map
    section13Fields.forEach((value, key) => {
      pdfFieldMap.set(key, value);
    });
  }

  // Process Section 14 - Selective Service
  if (formData.section14) {
    // Section 14 contains 5 fields for Selective Service registration
    // Use the dedicated mapper for proper handling
    const mapperModule = await import('./section14-pdf-mapper');
    const section14Fields = mapperModule.mapSection14ToPDFFields(formData.section14);
    
    // Add all Section 14 fields to the main PDF field map
    section14Fields.forEach((value, key) => {
      pdfFieldMap.set(key, value);
    });
  }

  // Process Section 15 - Military History
  if (formData.section15) {
    // Section 15 contains 95 fields for military service history, disciplinary procedures, and foreign military service
    // Use the dedicated mapper for proper handling
    const mapperModule = await import('./section15-pdf-mapper');
    const section15Fields = mapperModule.mapSection15ToPDFFields(formData.section15);
    
    // Add all Section 15 fields to the main PDF field map
    section15Fields.forEach((value, key) => {
      pdfFieldMap.set(key, value);
    });
  }

  // Process Section 17 - Marital Status
  if (formData.section17) {
    // Section 17 contains 332 fields for marital status, spouse information, previous marriages, and cohabitation
    // Use the dedicated mapper for proper handling
    const mapperModule = await import('./section17-pdf-mapper');
    const section17Fields = mapperModule.mapSection17ToPDFFields(formData.section17);
    
    // Add all Section 17 fields to the main PDF field map
    section17Fields.forEach((value, key) => {
      pdfFieldMap.set(key, value);
    });
  }

  // Process Section 27 - Use of Information Technology Systems
  if (formData.section27) {
    // Section 27 contains 57 fields for IT system violations
    // Use the dedicated mapper for proper handling
    const mapperModule = await import('./section27-pdf-mapper');
    const section27Fields = mapperModule.mapSection27ToPDFFields(formData.section27);
    
    // Add all Section 27 fields to the main PDF field map
    section27Fields.forEach((value, key) => {
      pdfFieldMap.set(key, value);
    });
  }

  // Process Section 28 - Involvement in Non-Criminal Court Actions
  if (formData.section28) {
    // Section 28 contains 23 fields for court action disclosures
    // Use the dedicated mapper for proper handling
    const mapperModule = await import('./section28-pdf-mapper');
    const section28Fields = mapperModule.mapSection28ToPDFFields(formData.section28);
    
    // Add all Section 28 fields to the main PDF field map
    section28Fields.forEach((value, key) => {
      pdfFieldMap.set(key, value);
    });
  }

  // Process Section 29 - Association Record
  if (formData.section29) {
    // Section 29 contains 141 fields for association records including terrorism-related organizations
    // Use the dedicated mapper for proper handling
    const mapperModule = await import('./section29-pdf-mapper');
    const section29Fields = mapperModule.mapSection29ToPDFFields(formData.section29);
    
    // Add all Section 29 fields to the main PDF field map
    section29Fields.forEach((value, key) => {
      pdfFieldMap.set(key, value);
    });
  }

  // Process Section 30 - Continuation Section
  if (formData.section30) {
    // Section 30 contains 25 fields for continuation/general remarks across multiple pages
    // Use the dedicated mapper for proper handling
    const mapperModule = await import('./section30-pdf-mapper');
    const section30Fields = mapperModule.mapSection30ToPDFFields(formData.section30);
    
    // Add all Section 30 fields to the main PDF field map
    section30Fields.forEach((value, key) => {
      pdfFieldMap.set(key, value);
    });
  }

  return pdfFieldMap;
}

/**
 * Validate sections 6-17 data before PDF generation
 */
export function validateSections6to30(formData: ApplicantFormValues): {
  isValid: boolean;
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Validate Section 6
  if (formData.section6) {
    // TODO: Add Section 6 validation when mapper is created
  }

  // Validate Section 7
  if (formData.section7) {
    // TODO: Add Section 7 validation when mapper is created
  }

  // Validate Section 8
  if (formData.section8) {
    // TODO: Add Section 8 validation when mapper is created
  }

  // Validate Section 9
  if (formData.section9) {
    const section9 = formData.section9;
    
    // Check if citizenship status is selected
    if (!section9.status?.value) {
      errors.push('Section 9: Citizenship status is required');
    } else {
      // Validate based on citizenship status
      const status = section9.status.value;
      
      if (status === 'bornAbroad' && section9.bornToUSParents) {
        // Validate Born to US Parents fields
        if (!section9.bornToUSParents.documentType?.value) {
          warnings.push('Section 9.1: Document type is recommended for Born to US Parents');
        }
        if (!section9.bornToUSParents.documentNumber?.value) {
          warnings.push('Section 9.1: Document number is recommended');
        }
      } else if (status === 'naturalized' && section9.naturalizedCitizen) {
        // Validate Naturalized Citizen fields
        if (!section9.naturalizedCitizen.naturalizedCertificateNumber?.value) {
          errors.push('Section 9.2: Certificate number is required for naturalized citizens');
        }
        if (!section9.naturalizedCitizen.courtName?.value) {
          warnings.push('Section 9.2: Court name is recommended');
        }
      } else if (status === 'derived' && section9.derivedCitizen) {
        // Validate Derived Citizen fields
        if (!section9.derivedCitizen.certificateOfCitizenshipNumber?.value) {
          errors.push('Section 9.3: Certificate of citizenship number is required for derived citizens');
        }
        if (!section9.derivedCitizen.basis?.value) {
          warnings.push('Section 9.3: Basis of derived citizenship is recommended');
        }
      } else if (status === 'notCitizen' && section9.nonUSCitizen) {
        // Validate Non-US Citizen fields
        if (!section9.nonUSCitizen.alienRegistrationNumber?.value) {
          errors.push('Section 9.4: Alien registration number is required for non-US citizens');
        }
        if (!section9.nonUSCitizen.documentNumber?.value) {
          warnings.push('Section 9.4: Document number is recommended');
        }
      }
    }
  }

  // Validate Section 10
  if (formData.section10) {
    const section10 = formData.section10;
    
    // Check main questions
    if (!section10.section10?.dualCitizenship?.hasDualCitizenship?.value) {
      errors.push('Section 10.1: Dual citizenship question must be answered');
    }
    
    if (!section10.section10?.foreignPassport?.hasForeignPassport?.value) {
      errors.push('Section 10.2: Foreign passport question must be answered');
    }
    
    // Validate dual citizenship entries if YES
    if (section10.section10?.dualCitizenship?.hasDualCitizenship?.value === 'YES' || 
        section10.section10?.dualCitizenship?.hasDualCitizenship?.value === true) {
      if (!section10.section10.dualCitizenship.entries || 
          section10.section10.dualCitizenship.entries.length === 0) {
        errors.push('Section 10.1: At least one dual citizenship entry required when answer is YES');
      }
    }
    
    // Validate foreign passport entries if YES
    if (section10.section10?.foreignPassport?.hasForeignPassport?.value === 'YES' || 
        section10.section10?.foreignPassport?.hasForeignPassport?.value === true) {
      if (!section10.section10.foreignPassport.entries || 
          section10.section10.foreignPassport.entries.length === 0) {
        errors.push('Section 10.2: At least one foreign passport entry required when answer is YES');
      }
    }
  }

  // Validate Section 11
  if (formData.section11) {
    // Use the dedicated validator from section11-pdf-mapper
    import('./section11-pdf-mapper').then(mapperModule => {
      const validation = mapperModule.validateSection11ForPDF(formData.section11);
      errors.push(...validation.errors);
      warnings.push(...validation.warnings);
    }).catch(err => {
      errors.push('Section 11: Failed to validate - ' + err.message);
    });
  }

  // Validate Section 12
  if (formData.section12) {
    // Use the dedicated validator from section12-pdf-mapper
    import('./section12-pdf-mapper').then(mapperModule => {
      const validation = mapperModule.validateSection12ForPDF(formData.section12);
      errors.push(...validation.errors);
      warnings.push(...validation.warnings);
    }).catch(err => {
      errors.push('Section 12: Failed to validate - ' + err.message);
    });
  }

  // Validate Section 13
  if (formData.section13) {
    // Use the dedicated validator from section13-pdf-mapper
    import('./section13-pdf-mapper').then(mapperModule => {
      const validation = mapperModule.validateSection13ForPDF(formData.section13);
      errors.push(...validation.errors);
      warnings.push(...validation.warnings);
    }).catch(err => {
      errors.push('Section 13: Failed to validate - ' + err.message);
    });
  }

  // Validate Section 14
  if (formData.section14) {
    const section14 = formData.section14;
    
    // Check if born male after 1959
    const bornMaleAfter1959 = section14.bornMaleAfter1959?.value;
    const registrationStatus = section14.registrationStatus?.value;
    const registrationNumber = section14.registrationNumber?.value;
    const noRegistrationExplanation = section14.noRegistrationExplanation?.value;
    
    if (!bornMaleAfter1959) {
      errors.push('Section 14: Born male after 1959 status is required');
    } else {
      // If born male after 1959, registration status is required
      if (bornMaleAfter1959 === 'Yes' && !registrationStatus) {
        errors.push('Section 14: Registration status is required for males born after 1959');
      }
      
      // If registered, registration number is required
      if (registrationStatus === 'Yes' && !registrationNumber) {
        errors.push('Section 14: Registration number is required when registered');
      }
      
      // If not registered, explanation is required
      if (registrationStatus === 'No' && !noRegistrationExplanation) {
        errors.push('Section 14: Explanation is required when not registered');
      }
    }
  }

  // Validate Section 15
  if (formData.section15) {
    const section15 = formData.section15.section15;
    
    if (section15) {
      // Check military service status
      const hasServed = section15.militaryService?.hasServed?.value;
      if (hasServed === 'YES' && (!section15.militaryService.entries || section15.militaryService.entries.length === 0)) {
        errors.push('Section 15: Military service indicated but no service entries provided');
      }
      
      // Check disciplinary action status
      const hasDisciplinaryAction = section15.disciplinaryProcedures?.hasDisciplinaryAction?.value;
      if (hasDisciplinaryAction === 'YES' && (!section15.disciplinaryProcedures.entries || section15.disciplinaryProcedures.entries.length === 0)) {
        errors.push('Section 15: Disciplinary action indicated but no disciplinary entries provided');
      }
      
      // Check foreign military service status
      const hasForeignService = section15.foreignMilitaryService?.hasServedInForeignMilitary?.value;
      if (hasForeignService === 'YES' && (!section15.foreignMilitaryService.entries || section15.foreignMilitaryService.entries.length === 0)) {
        errors.push('Section 15: Foreign military service indicated but no foreign service entries provided');
      }
      
      // Validate military service entries
      if (section15.militaryService?.entries) {
        section15.militaryService.entries.forEach((entry, index) => {
          if (!entry.branch?.value) {
            warnings.push(`Section 15: Military service entry ${index + 1} missing branch`);
          }
          if (!entry.fromDate?.value && !entry.toDate?.value) {
            warnings.push(`Section 15: Military service entry ${index + 1} missing service dates`);
          }
        });
      }
      
      // Validate foreign service contact information
      if (section15.foreignMilitaryService?.entries && section15.foreignMilitaryService.entries.length > 0) {
        const foreignEntry = section15.foreignMilitaryService.entries[0];
        if (!foreignEntry.contactPerson1?.firstName?.value && !foreignEntry.contactPerson1?.lastName?.value) {
          warnings.push('Section 15: Foreign military service requires at least one contact person');
        }
      }
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Get mapping statistics for sections 6-15
 */
export function getSections6to30MappingStats(formData: ApplicantFormValues): {
  totalFields: number;
  mappedFields: number;
  sectionBreakdown: Record<string, { total: number; mapped: number }>;
} {
  const stats = {
    totalFields: 0,
    mappedFields: 0,
    sectionBreakdown: {
      section6: { total: 0, mapped: 0 },
      section7: { total: 0, mapped: 0 },
      section8: { total: 0, mapped: 0 },
      section9: { total: 0, mapped: 0 },
      section10: { total: 0, mapped: 0 },
      section11: { total: 0, mapped: 0 },
      section12: { total: 0, mapped: 0 },
      section13: { total: 0, mapped: 0 },
      section14: { total: 0, mapped: 0 },
      section15: { total: 0, mapped: 0 }
    }
  };

  // Process Section 6 stats
  if (formData.section6) {
    // TODO: Add Section 6 stats when mapper is created
  }

  // Process Section 7 stats
  if (formData.section7) {
    // TODO: Add Section 7 stats when mapper is created
  }

  // Process Section 8 stats
  if (formData.section8) {
    // TODO: Add Section 8 stats when mapper is created
  }

  // Process Section 9 stats
  if (formData.section9) {
    const section9 = formData.section9;
    
    // Count main status field
    if (section9.status?.value) {
      stats.sectionBreakdown.section9.total++;
      stats.sectionBreakdown.section9.mapped++;
    }
    
    // Count fields based on citizenship status
    const status = section9.status?.value;
    
    if (status === 'bornAbroad' && section9.bornToUSParents) {
      const subsection = section9.bornToUSParents;
      const fields = [
        'documentType', 'otherExplanation', 'documentNumber', 
        'documentIssueDate', 'issuedAtLocation'
      ];
      
      fields.forEach(field => {
        stats.sectionBreakdown.section9.total++;
        if (subsection[field]?.value) {
          stats.sectionBreakdown.section9.mapped++;
        }
      });
    } else if (status === 'naturalized' && section9.naturalizedCitizen) {
      const subsection = section9.naturalizedCitizen;
      const fields = [
        'naturalizedCertificateNumber', 'courtName', 'certificateIssueDate'
      ];
      
      fields.forEach(field => {
        stats.sectionBreakdown.section9.total++;
        if (subsection[field]?.value) {
          stats.sectionBreakdown.section9.mapped++;
        }
      });
      
      // Count nested address fields
      if (subsection.courtAddress) {
        ['city', 'state'].forEach(field => {
          stats.sectionBreakdown.section9.total++;
          if (subsection.courtAddress[field]?.value) {
            stats.sectionBreakdown.section9.mapped++;
          }
        });
      }
    } else if (status === 'derived' && section9.derivedCitizen) {
      const subsection = section9.derivedCitizen;
      const fields = [
        'certificateOfCitizenshipNumber', 'basis', 'otherExplanation'
      ];
      
      fields.forEach(field => {
        stats.sectionBreakdown.section9.total++;
        if (subsection[field]?.value) {
          stats.sectionBreakdown.section9.mapped++;
        }
      });
      
      // Count nested name fields
      if (subsection.nameOnDocument) {
        ['firstName', 'lastName'].forEach(field => {
          stats.sectionBreakdown.section9.total++;
          if (subsection.nameOnDocument[field]?.value) {
            stats.sectionBreakdown.section9.mapped++;
          }
        });
      }
    } else if (status === 'notCitizen' && section9.nonUSCitizen) {
      const subsection = section9.nonUSCitizen;
      const fields = [
        'alienRegistrationNumber', 'documentNumber', 
        'entryDate', 'documentExpirationDate'
      ];
      
      fields.forEach(field => {
        stats.sectionBreakdown.section9.total++;
        if (subsection[field]?.value) {
          stats.sectionBreakdown.section9.mapped++;
        }
      });
    }
  }

  // Process Section 10 stats
  if (formData.section10) {
    const section10 = formData.section10;
    
    // Count main questions
    if (section10.section10?.dualCitizenship?.hasDualCitizenship?.value) {
      stats.sectionBreakdown.section10.total++;
      stats.sectionBreakdown.section10.mapped++;
    }
    
    if (section10.section10?.foreignPassport?.hasForeignPassport?.value) {
      stats.sectionBreakdown.section10.total++;
      stats.sectionBreakdown.section10.mapped++;
    }
    
    // Count dual citizenship entries
    if (section10.section10?.dualCitizenship?.entries) {
      section10.section10.dualCitizenship.entries.forEach((entry, index) => {
        if (index >= 2) return; // Only 2 entries in PDF
        
        const fields = [
          'country', 'howAcquired', 'fromDate', 'isFromEstimated',
          'toDate', 'isToEstimated', 'isPresent', 'hasRenounced',
          'renounceExplanation', 'hasTakenAction', 'actionExplanation'
        ];
        
        fields.forEach(field => {
          stats.sectionBreakdown.section10.total++;
          if (entry[field]?.value !== undefined) {
            stats.sectionBreakdown.section10.mapped++;
          }
        });
      });
    }
    
    // Count foreign passport entries
    if (section10.section10?.foreignPassport?.entries) {
      section10.section10.foreignPassport.entries.forEach((entry, index) => {
        if (index >= 2) return; // Only 2 entries in PDF
        
        const passportFields = [
          'country', 'issueDate', 'isIssueDateEstimated', 'city', 'country2',
          'lastName', 'firstName', 'middleName', 'suffix', 'passportNumber',
          'expirationDate', 'isExpirationDateEstimated', 'usedForUSEntry'
        ];
        
        passportFields.forEach(field => {
          stats.sectionBreakdown.section10.total++;
          if (entry[field]?.value !== undefined) {
            stats.sectionBreakdown.section10.mapped++;
          }
        });
        
        // Count travel countries
        if (entry.travelCountries) {
          entry.travelCountries.forEach((travel, travelIndex) => {
            if (travelIndex >= 6) return; // Only 6 travel entries per passport
            
            const travelFields = [
              'country', 'fromDate', 'isFromDateEstimated',
              'toDate', 'isToDateEstimated', 'isPresent'
            ];
            
            travelFields.forEach(field => {
              stats.sectionBreakdown.section10.total++;
              if (travel[field]?.value !== undefined) {
                stats.sectionBreakdown.section10.mapped++;
              }
            });
          });
        }
      });
    }
  }

  // Process Section 11 stats
  if (formData.section11) {
    // Section 11 has 252 total possible fields
    // Use the mapper's stats function to get accurate counts
    stats.sectionBreakdown.section11.total = 252;
    
    // Count mapped fields based on actual data
    const section11 = formData.section11;
    if (section11.section11) {
      // Count base field
      if (section11.section11.hasLivedAbroad?.value) {
        stats.sectionBreakdown.section11.mapped++;
      }
      
      // Count residence entries
      if (section11.section11.residences) {
        section11.section11.residences.forEach((residence, index) => {
          if (index >= 4) return; // Only 4 entries in PDF
          
          // Count residence fields (simplified count for main fields)
          const residenceFields = [
            'streetAddress', 'streetAddress2', 'apartmentNumber', 'city',
            'stateOrProvince', 'country', 'zipCode', 'fromMonth', 'fromYear',
            'toMonth', 'toYear', 'isCurrentResidence', 'residenceType',
            'ownershipStatus', 'militaryHousing', 'explanation'
          ];
          
          residenceFields.forEach(field => {
            if (residence[field]?.value !== undefined) {
              stats.sectionBreakdown.section11.mapped++;
            }
          });
          
          // Count persons who know you
          if (residence.personsWhoKnowYou) {
            residence.personsWhoKnowYou.forEach((person, personIndex) => {
              if (personIndex >= 3) return; // Only 3 persons per residence
              
              const personFields = [
                'fullName', 'relationship', 'phoneNumber', 'email',
                'streetAddress', 'city', 'stateOrProvince', 'country', 'zipCode'
              ];
              
              personFields.forEach(field => {
                if (person[field]?.value !== undefined) {
                  stats.sectionBreakdown.section11.mapped++;
                }
              });
            });
          }
        });
      }
    }
  }

  // Process Section 12 stats
  if (formData.section12) {
    // Section 12 has 150 total possible fields
    stats.sectionBreakdown.section12.total = 150;
    
    // Count mapped fields based on actual data
    const section12 = formData.section12;
    if (section12.section12) {
      // Count global questions
      if (section12.section12.hasAttendedSchool?.value) {
        stats.sectionBreakdown.section12.mapped++;
      }
      if (section12.section12.hasAttendedSchoolOutsideUS?.value) {
        stats.sectionBreakdown.section12.mapped++;
      }
      
      // Count school entries
      if (section12.section12.entries) {
        section12.section12.entries.forEach((entry, index) => {
          if (index >= 4) return; // Only 4 entries in PDF
          
          // Count school fields (simplified count for main fields)
          const schoolFields = [
            'fromDate', 'toDate', 'fromDateEstimate', 'toDateEstimate', 'isPresent',
            'schoolName', 'schoolAddress', 'schoolCity', 'schoolState', 'schoolCountry',
            'schoolZipCode', 'schoolType', 'receivedDegree'
          ];
          
          schoolFields.forEach(field => {
            if (entry[field]?.value !== undefined) {
              stats.sectionBreakdown.section12.mapped++;
            }
          });
          
          // Count degrees
          if (entry.degrees) {
            entry.degrees.forEach(degree => {
              const degreeFields = ['degreeType', 'otherDegree', 'dateAwarded', 'dateAwardedEstimate'];
              degreeFields.forEach(field => {
                if (degree[field]?.value !== undefined) {
                  stats.sectionBreakdown.section12.mapped++;
                }
              });
            });
          }
          
          // Count contact person fields
          if (entry.contactPerson) {
            const contactFields = [
              'unknownPerson', 'lastName', 'firstName', 'address', 'city', 'state',
              'country', 'zipCode', 'phoneNumber', 'phoneExtension', 'email'
            ];
            contactFields.forEach(field => {
              if (entry.contactPerson[field]?.value !== undefined) {
                stats.sectionBreakdown.section12.mapped++;
              }
            });
          }
        });
      }
    }
  }

  // Process Section 13 stats
  if (formData.section13) {
    // Section 13 has 1086 total possible fields
    stats.sectionBreakdown.section13.total = 1086;
    
    // Count mapped fields based on actual data
    const section13 = formData.section13;
    if (section13.section13) {
      // Count employment type selection
      if (section13.section13.employmentType?.value) {
        stats.sectionBreakdown.section13.mapped++;
      }
      
      // Count military employment entries
      if (section13.section13.militaryEmployment?.entries) {
        stats.sectionBreakdown.section13.mapped += section13.section13.militaryEmployment.entries.length * 50;
      }
      
      // Count non-federal employment entries
      if (section13.section13.nonFederalEmployment?.entries) {
        stats.sectionBreakdown.section13.mapped += section13.section13.nonFederalEmployment.entries.length * 90;
      }
      
      // Count self-employment entries
      if (section13.section13.selfEmployment?.entries) {
        stats.sectionBreakdown.section13.mapped += section13.section13.selfEmployment.entries.length * 60;
      }
      
      // Count unemployment entries
      if (section13.section13.unemployment?.entries) {
        stats.sectionBreakdown.section13.mapped += section13.section13.unemployment.entries.length * 50;
      }
      
      // Count employment record issues
      if (section13.section13.employmentRecordIssues) {
        const issues = section13.section13.employmentRecordIssues;
        if (issues.wasFired?.value !== undefined) stats.sectionBreakdown.section13.mapped++;
        if (issues.quitAfterBeingTold?.value !== undefined) stats.sectionBreakdown.section13.mapped++;
        if (issues.leftByMutualAgreement?.value !== undefined) stats.sectionBreakdown.section13.mapped++;
        if (issues.hasChargesOrAllegations?.value !== undefined) stats.sectionBreakdown.section13.mapped++;
        if (issues.hasUnsatisfactoryPerformance?.value !== undefined) stats.sectionBreakdown.section13.mapped++;
      }
      
      // Count disciplinary actions
      if (section13.section13.disciplinaryActions) {
        const disciplinary = section13.section13.disciplinaryActions;
        if (disciplinary.receivedWrittenWarning?.value !== undefined) stats.sectionBreakdown.section13.mapped++;
        if (disciplinary.receivedOfficialReprimand?.value !== undefined) stats.sectionBreakdown.section13.mapped++;
        if (disciplinary.suspendedFromEmployment?.value !== undefined) stats.sectionBreakdown.section13.mapped++;
        if (disciplinary.disciplinaryProcedures?.value !== undefined) stats.sectionBreakdown.section13.mapped++;
      }
    }
  }

  // Process Section 14 stats
  if (formData.section14) {
    // Section 14 has 5 total fields
    stats.sectionBreakdown.section14.total = 5;
    
    // Count mapped fields based on actual data
    const section14 = formData.section14;
    
    if (section14.bornMaleAfter1959?.value) {
      stats.sectionBreakdown.section14.mapped++;
    }
    if (section14.registrationStatus?.value) {
      stats.sectionBreakdown.section14.mapped++;
    }
    if (section14.registrationNumber?.value) {
      stats.sectionBreakdown.section14.mapped++;
    }
    if (section14.noRegistrationExplanation?.value) {
      stats.sectionBreakdown.section14.mapped++;
    }
    if (section14.unknownStatusExplanation?.value) {
      stats.sectionBreakdown.section14.mapped++;
    }
  }

  // Process Section 15 stats
  if (formData.section15) {
    // Section 15 has 95 total fields
    stats.sectionBreakdown.section15.total = 95;
    
    // Count mapped fields based on actual data
    const section15 = formData.section15.section15;
    
    if (section15) {
      // Count military service main question
      if (section15.militaryService?.hasServed?.value) {
        stats.sectionBreakdown.section15.mapped++;
      }
      
      // Count military service entries (each entry has approximately 15-20 fields)
      if (section15.militaryService?.entries) {
        section15.militaryService.entries.forEach(entry => {
          let entryFields = 0;
          if (entry.branch?.value) entryFields++;
          if (entry.serviceState?.value) entryFields++;
          if (entry.serviceStatus?.value) entryFields++;
          if (entry.fromDate?.value) entryFields++;
          if (entry.toDate?.value) entryFields++;
          if (entry.serviceNumber?.value) entryFields++;
          if (entry.dischargeType?.value) entryFields++;
          if (entry.dischargeDate?.value) entryFields++;
          if (entry.dischargeReason?.value) entryFields++;
          if (entry.currentStatus?.activeDuty?.value !== undefined) entryFields++;
          if (entry.currentStatus?.activeReserve?.value !== undefined) entryFields++;
          if (entry.currentStatus?.inactiveReserve?.value !== undefined) entryFields++;
          stats.sectionBreakdown.section15.mapped += entryFields;
        });
      }
      
      // Count disciplinary procedures main question
      if (section15.disciplinaryProcedures?.hasDisciplinaryAction?.value) {
        stats.sectionBreakdown.section15.mapped++;
      }
      
      // Count disciplinary entries (each entry has approximately 5-6 fields)
      if (section15.disciplinaryProcedures?.entries) {
        section15.disciplinaryProcedures.entries.forEach(entry => {
          let entryFields = 0;
          if (entry.procedureDate?.value) entryFields++;
          if (entry.ucmjOffenseDescription?.value) entryFields++;
          if (entry.disciplinaryProcedureName?.value) entryFields++;
          if (entry.militaryCourtDescription?.value) entryFields++;
          if (entry.finalOutcome?.value) entryFields++;
          stats.sectionBreakdown.section15.mapped += entryFields;
        });
      }
      
      // Count foreign military service main question
      if (section15.foreignMilitaryService?.hasServedInForeignMilitary?.value) {
        stats.sectionBreakdown.section15.mapped++;
      }
      
      // Count foreign military service entries (complex with contacts)
      if (section15.foreignMilitaryService?.entries) {
        section15.foreignMilitaryService.entries.forEach(entry => {
          let entryFields = 0;
          if (entry.fromDate?.value) entryFields++;
          if (entry.toDate?.value) entryFields++;
          if (entry.organizationName?.value) entryFields++;
          if (entry.country?.value) entryFields++;
          if (entry.highestRank?.value) entryFields++;
          if (entry.divisionDepartment?.value) entryFields++;
          if (entry.reasonForLeaving?.value) entryFields++;
          if (entry.circumstancesDescription?.value) entryFields++;
          
          // Count contact person fields
          if (entry.contactPerson1) {
            if (entry.contactPerson1.firstName?.value) entryFields++;
            if (entry.contactPerson1.lastName?.value) entryFields++;
            if (entry.contactPerson1.street?.value) entryFields++;
            if (entry.contactPerson1.city?.value) entryFields++;
            if (entry.contactPerson1.state?.value) entryFields++;
            if (entry.contactPerson1.country?.value) entryFields++;
            if (entry.contactPerson1.officialTitle?.value) entryFields++;
            if (entry.contactPerson1.frequencyOfContact?.value) entryFields++;
          }
          
          if (entry.contactPerson2) {
            if (entry.contactPerson2.firstName?.value) entryFields++;
            if (entry.contactPerson2.lastName?.value) entryFields++;
            if (entry.contactPerson2.street?.value) entryFields++;
            if (entry.contactPerson2.city?.value) entryFields++;
            if (entry.contactPerson2.state?.value) entryFields++;
            if (entry.contactPerson2.country?.value) entryFields++;
            if (entry.contactPerson2.officialTitle?.value) entryFields++;
            if (entry.contactPerson2.frequencyOfContact?.value) entryFields++;
            if (entry.contactPerson2.specify?.value) entryFields++;
          }
          
          stats.sectionBreakdown.section15.mapped += entryFields;
        });
      }
    }
  }

  // Calculate totals
  Object.values(stats.sectionBreakdown).forEach(section => {
    stats.totalFields += section.total;
    stats.mappedFields += section.mapped;
  });

  return stats;
}

/**
 * Export all section 6-30 integration functions
 */
export default {
  transformSections6to30ForPDF,
  validateSections6to30,
  getSections6to30MappingStats,
  SECTION_6_30_PDF_MAPPINGS
};
