/**
 * Section 13 - Employment Activities PDF Mapper
 * Maps Section 13 employment data to PDF field structure
 * Handles 1086 fields for comprehensive employment history
 */

import { Section13 } from '../../api/interfaces/section-interfaces/section13';
import section13Mappings from '../../api/mappings/section-13-mappings.json';
import { logger } from './Logger';

// Flattens Section 13 data into uiPath -> value pairs matching the mapping JSON
function flattenSection13(section13Data: Section13): Record<string, any> {
  const out: Record<string, any> = {};

  const walk = (obj: any, path: string) => {
    if (!obj) return;
    for (const key of Object.keys(obj)) {
      const val: any = (obj as any)[key];
      if (val && typeof val === 'object') {
        if (Array.isArray(val)) {
          val.forEach((item, idx) => walk(item, `${path}${key}[${idx}].`));
        } else if ('value' in val) {
          out[`${path}${key}`] = val.value;
        } else {
          walk(val, `${path}${key}.`);
        }
      }
    }
  };

  walk(section13Data.section13, 'section13.');
  return out;
}

/**
 * Maps Section 13 data to PDF fields
 * @param section13Data The Section 13 form data
 * @returns Map of PDF field IDs to values
 */
export function mapSection13ToPDFFields(section13Data: Section13): Map<string, any> {
  const pdfFieldMap = new Map<string, any>();

  if (!section13Data?.section13) {
    logger.warn('No Section 13 data provided', 'Section13PDFMapper');
    return pdfFieldMap;
  }

  const flat = flattenSection13(section13Data);

  for (const mapping of section13Mappings.mappings as Array<{ uiPath: string; pdfFieldId: string }>) {
    const value = flat[mapping.uiPath];
    if (value !== undefined && value !== null) {
      pdfFieldMap.set(mapping.pdfFieldId, value);
    }
  }

  logger.info('Section 13 PDF mapping complete', 'Section13PDFMapper', {
    totalFieldsMapped: pdfFieldMap.size
  });

  return pdfFieldMap;
}
          const mapping = section13Mappings.mappings.find(m => 
            m.uiPath === `section13.nonFederalEmployment.entries[${index}].supervisor.email`
          );
          if (mapping) {
            pdfFieldMap.set(mapping.pdfFieldId, supervisor.email.value || '');
          }
        }
      }
      
      // Map additional employment periods
      if (entry.additionalPeriods?.periods) {
        entry.additionalPeriods.periods.forEach((period, periodIndex) => {
          if (!period) return;
          
          if (period.fromDate) {
            const mapping = section13Mappings.mappings.find(m => 
              m.uiPath === `section13.nonFederalEmployment.entries[${index}].additionalPeriods.periods[${periodIndex}].fromDate`
            );
            if (mapping) {
              pdfFieldMap.set(mapping.pdfFieldId, period.fromDate.value || '');
            }
          }
          
          if (period.toDate) {
            const mapping = section13Mappings.mappings.find(m => 
              m.uiPath === `section13.nonFederalEmployment.entries[${index}].additionalPeriods.periods[${periodIndex}].toDate`
            );
            if (mapping) {
              pdfFieldMap.set(mapping.pdfFieldId, period.toDate.value || '');
            }
          }
          
          if (period.positionTitle) {
            const mapping = section13Mappings.mappings.find(m => 
              m.uiPath === `section13.nonFederalEmployment.entries[${index}].additionalPeriods.periods[${periodIndex}].positionTitle`
            );
            if (mapping) {
              pdfFieldMap.set(mapping.pdfFieldId, period.positionTitle.value || '');
            }
          }
          
          if (period.supervisor) {
            const mapping = section13Mappings.mappings.find(m => 
              m.uiPath === `section13.nonFederalEmployment.entries[${index}].additionalPeriods.periods[${periodIndex}].supervisor`
            );
            if (mapping) {
              pdfFieldMap.set(mapping.pdfFieldId, period.supervisor.value || '');
            }
          }
        });
      }
    });
  }
  
  // Map Self-Employment (Section 13A.3)
  if (section.selfEmployment?.entries) {
    section.selfEmployment.entries.forEach((entry, index) => {
      if (!entry) return;
      
      if (entry.businessName) {
        const mapping = section13Mappings.mappings.find(m => 
          m.uiPath === `section13.selfEmployment.entries[${index}].businessName`
        );
        if (mapping) {
          pdfFieldMap.set(mapping.pdfFieldId, entry.businessName.value || '');
        }
      }
      
      if (entry.natureOfBusiness) {
        const mapping = section13Mappings.mappings.find(m => 
          m.uiPath === `section13.selfEmployment.entries[${index}].natureOfBusiness`
        );
        if (mapping) {
          pdfFieldMap.set(mapping.pdfFieldId, entry.natureOfBusiness.value || '');
        }
      }
      
      if (entry.positionTitle) {
        const mapping = section13Mappings.mappings.find(m => 
          m.uiPath === `section13.selfEmployment.entries[${index}].positionTitle`
        );
        if (mapping) {
          pdfFieldMap.set(mapping.pdfFieldId, entry.positionTitle.value || '');
        }
      }
      
      // Map business address
      if (entry.address) {
        const address = entry.address;
        
        if (address.street) {
          const mapping = section13Mappings.mappings.find(m => 
            m.uiPath === `section13.selfEmployment.entries[${index}].address.street`
          );
          if (mapping) {
            pdfFieldMap.set(mapping.pdfFieldId, address.street.value || '');
          }
        }
        
        if (address.city) {
          const mapping = section13Mappings.mappings.find(m => 
            m.uiPath === `section13.selfEmployment.entries[${index}].address.city`
          );
          if (mapping) {
            pdfFieldMap.set(mapping.pdfFieldId, address.city.value || '');
          }
        }
        
        if (address.state) {
          const mapping = section13Mappings.mappings.find(m => 
            m.uiPath === `section13.selfEmployment.entries[${index}].address.state`
          );
          if (mapping) {
            pdfFieldMap.set(mapping.pdfFieldId, address.state.value || '');
          }
        }
        
        if (address.zipCode) {
          const mapping = section13Mappings.mappings.find(m => 
            m.uiPath === `section13.selfEmployment.entries[${index}].address.zipCode`
          );
          if (mapping) {
            pdfFieldMap.set(mapping.pdfFieldId, address.zipCode.value || '');
          }
        }
        
        if (address.country) {
          const mapping = section13Mappings.mappings.find(m => 
            m.uiPath === `section13.selfEmployment.entries[${index}].address.country`
          );
          if (mapping) {
            pdfFieldMap.set(mapping.pdfFieldId, address.country.value || '');
          }
        }
      }
      
      // Map employment dates
      if (entry.dates) {
        if (entry.dates.fromDate) {
          const mapping = section13Mappings.mappings.find(m => 
            m.uiPath === `section13.selfEmployment.entries[${index}].dates.fromDate`
          );
          if (mapping) {
            pdfFieldMap.set(mapping.pdfFieldId, entry.dates.fromDate.value || '');
          }
        }
        
        if (entry.dates.toDate) {
          const mapping = section13Mappings.mappings.find(m => 
            m.uiPath === `section13.selfEmployment.entries[${index}].dates.toDate`
          );
          if (mapping) {
            pdfFieldMap.set(mapping.pdfFieldId, entry.dates.toDate.value || '');
          }
        }
        
        if (entry.dates.present) {
          const mapping = section13Mappings.mappings.find(m => 
            m.uiPath === `section13.selfEmployment.entries[${index}].dates.present`
          );
          if (mapping) {
            pdfFieldMap.set(mapping.pdfFieldId, entry.dates.present.value || false);
          }
        }
      }
      
      // Map references
      if (entry.references) {
        entry.references.forEach((reference, refIndex) => {
          if (!reference) return;
          
          if (reference.firstName) {
            const mapping = section13Mappings.mappings.find(m => 
              m.uiPath === `section13.selfEmployment.entries[${index}].references[${refIndex}].firstName`
            );
            if (mapping) {
              pdfFieldMap.set(mapping.pdfFieldId, reference.firstName.value || '');
            }
          }
          
          if (reference.lastName) {
            const mapping = section13Mappings.mappings.find(m => 
              m.uiPath === `section13.selfEmployment.entries[${index}].references[${refIndex}].lastName`
            );
            if (mapping) {
              pdfFieldMap.set(mapping.pdfFieldId, reference.lastName.value || '');
            }
          }
          
          if (reference.phone?.number) {
            const mapping = section13Mappings.mappings.find(m => 
              m.uiPath === `section13.selfEmployment.entries[${index}].references[${refIndex}].phone.number`
            );
            if (mapping) {
              pdfFieldMap.set(mapping.pdfFieldId, reference.phone.number.value || '');
            }
          }
        });
      }
    });
  }
  
  // Map Unemployment (Section 13A.4)
  if (section.unemployment?.entries) {
    section.unemployment.entries.forEach((entry, index) => {
      if (!entry) return;
      
      if (entry.reason) {
        const mapping = section13Mappings.mappings.find(m => 
          m.uiPath === `section13.unemployment.entries[${index}].reason`
        );
        if (mapping) {
          pdfFieldMap.set(mapping.pdfFieldId, entry.reason.value || '');
        }
      }
      
      // Map unemployment dates
      if (entry.dates) {
        if (entry.dates.fromDate) {
          const mapping = section13Mappings.mappings.find(m => 
            m.uiPath === `section13.unemployment.entries[${index}].dates.fromDate`
          );
          if (mapping) {
            pdfFieldMap.set(mapping.pdfFieldId, entry.dates.fromDate.value || '');
          }
        }
        
        if (entry.dates.toDate) {
          const mapping = section13Mappings.mappings.find(m => 
            m.uiPath === `section13.unemployment.entries[${index}].dates.toDate`
          );
          if (mapping) {
            pdfFieldMap.set(mapping.pdfFieldId, entry.dates.toDate.value || '');
          }
        }
      }
      
      // Map references
      if (entry.references) {
        entry.references.forEach((reference, refIndex) => {
          if (!reference) return;
          
          if (reference.firstName) {
            const mapping = section13Mappings.mappings.find(m => 
              m.uiPath === `section13.unemployment.entries[${index}].references[${refIndex}].firstName`
            );
            if (mapping) {
              pdfFieldMap.set(mapping.pdfFieldId, reference.firstName.value || '');
            }
          }
          
          if (reference.lastName) {
            const mapping = section13Mappings.mappings.find(m => 
              m.uiPath === `section13.unemployment.entries[${index}].references[${refIndex}].lastName`
            );
            if (mapping) {
              pdfFieldMap.set(mapping.pdfFieldId, reference.lastName.value || '');
            }
          }
          
          if (reference.phone?.number) {
            const mapping = section13Mappings.mappings.find(m => 
              m.uiPath === `section13.unemployment.entries[${index}].references[${refIndex}].phone.number`
            );
            if (mapping) {
              pdfFieldMap.set(mapping.pdfFieldId, reference.phone.number.value || '');
            }
          }
          
          if (reference.address) {
            const address = reference.address;
            
            if (address.street) {
              const mapping = section13Mappings.mappings.find(m => 
                m.uiPath === `section13.unemployment.entries[${index}].references[${refIndex}].address.street`
              );
              if (mapping) {
                pdfFieldMap.set(mapping.pdfFieldId, address.street.value || '');
              }
            }
            
            if (address.city) {
              const mapping = section13Mappings.mappings.find(m => 
                m.uiPath === `section13.unemployment.entries[${index}].references[${refIndex}].address.city`
              );
              if (mapping) {
                pdfFieldMap.set(mapping.pdfFieldId, address.city.value || '');
              }
            }
            
            if (address.state) {
              const mapping = section13Mappings.mappings.find(m => 
                m.uiPath === `section13.unemployment.entries[${index}].references[${refIndex}].address.state`
              );
              if (mapping) {
                pdfFieldMap.set(mapping.pdfFieldId, address.state.value || '');
              }
            }
            
            if (address.zipCode) {
              const mapping = section13Mappings.mappings.find(m => 
                m.uiPath === `section13.unemployment.entries[${index}].references[${refIndex}].address.zipCode`
              );
              if (mapping) {
                pdfFieldMap.set(mapping.pdfFieldId, address.zipCode.value || '');
              }
            }
            
            if (address.country) {
              const mapping = section13Mappings.mappings.find(m => 
                m.uiPath === `section13.unemployment.entries[${index}].references[${refIndex}].address.country`
              );
              if (mapping) {
                pdfFieldMap.set(mapping.pdfFieldId, address.country.value || '');
              }
            }
          }
        });
      }
    });
  }
  
  // Map Employment Record Issues (Section 13A.5)
  if (section.employmentRecordIssues) {
    const issues = section.employmentRecordIssues;
    
    if (issues.wasFired) {
      const mapping = section13Mappings.mappings.find(m => 
        m.uiPath === 'section13.employmentRecordIssues.wasFired'
      );
      if (mapping) {
        pdfFieldMap.set(mapping.pdfFieldId, issues.wasFired.value || false);
      }
    }
    
    if (issues.quitAfterBeingTold) {
      const mapping = section13Mappings.mappings.find(m => 
        m.uiPath === 'section13.employmentRecordIssues.quitAfterBeingTold'
      );
      if (mapping) {
        pdfFieldMap.set(mapping.pdfFieldId, issues.quitAfterBeingTold.value || false);
      }
    }
    
    if (issues.leftByMutualAgreement) {
      const mapping = section13Mappings.mappings.find(m => 
        m.uiPath === 'section13.employmentRecordIssues.leftByMutualAgreement'
      );
      if (mapping) {
        pdfFieldMap.set(mapping.pdfFieldId, issues.leftByMutualAgreement.value || false);
      }
    }
    
    if (issues.hasChargesOrAllegations) {
      const mapping = section13Mappings.mappings.find(m => 
        m.uiPath === 'section13.employmentRecordIssues.hasChargesOrAllegations'
      );
      if (mapping) {
        pdfFieldMap.set(mapping.pdfFieldId, issues.hasChargesOrAllegations.value || false);
      }
    }
    
    if (issues.hasUnsatisfactoryPerformance) {
      const mapping = section13Mappings.mappings.find(m => 
        m.uiPath === 'section13.employmentRecordIssues.hasUnsatisfactoryPerformance'
      );
      if (mapping) {
        pdfFieldMap.set(mapping.pdfFieldId, issues.hasUnsatisfactoryPerformance.value || false);
      }
    }
    
    // Map employment dates for issues
    if (issues.employmentDates) {
      const dates = issues.employmentDates;
      
      if (dates.fromDate) {
        const mapping = section13Mappings.mappings.find(m => 
          m.uiPath === 'section13.employmentRecordIssues.employmentDates.fromDate'
        );
        if (mapping) {
          pdfFieldMap.set(mapping.pdfFieldId, dates.fromDate.value || '');
        }
      }
      
      if (dates.toDate) {
        const mapping = section13Mappings.mappings.find(m => 
          m.uiPath === 'section13.employmentRecordIssues.employmentDates.toDate'
        );
        if (mapping) {
          pdfFieldMap.set(mapping.pdfFieldId, dates.toDate.value || '');
        }
      }
      
      if (dates.present) {
        const mapping = section13Mappings.mappings.find(m => 
          m.uiPath === 'section13.employmentRecordIssues.employmentDates.present'
        );
        if (mapping) {
          pdfFieldMap.set(mapping.pdfFieldId, dates.present.value || false);
        }
      }
    }
    
    // Map reason fields
    if (issues.reasonForFiring) {
      const mapping = section13Mappings.mappings.find(m => 
        m.uiPath === 'section13.employmentRecordIssues.reasonForFiring'
      );
      if (mapping) {
        pdfFieldMap.set(mapping.pdfFieldId, issues.reasonForFiring.value || '');
      }
    }
    
    if (issues.reasonForQuitting) {
      const mapping = section13Mappings.mappings.find(m => 
        m.uiPath === 'section13.employmentRecordIssues.reasonForQuitting'
      );
      if (mapping) {
        pdfFieldMap.set(mapping.pdfFieldId, issues.reasonForQuitting.value || '');
      }
    }
    
    if (issues.reasonForLeaving) {
      const mapping = section13Mappings.mappings.find(m => 
        m.uiPath === 'section13.employmentRecordIssues.reasonForLeaving'
      );
      if (mapping) {
        pdfFieldMap.set(mapping.pdfFieldId, issues.reasonForLeaving.value || '');
      }
    }
    
    if (issues.chargesOrAllegations) {
      const mapping = section13Mappings.mappings.find(m => 
        m.uiPath === 'section13.employmentRecordIssues.chargesOrAllegations'
      );
      if (mapping) {
        pdfFieldMap.set(mapping.pdfFieldId, issues.chargesOrAllegations.value || '');
      }
    }
  }
  
  // Map Disciplinary Actions (Section 13A.6)
  if (section.disciplinaryActions) {
    const disciplinary = section.disciplinaryActions;
    
    if (disciplinary.receivedWrittenWarning) {
      const mapping = section13Mappings.mappings.find(m => 
        m.uiPath === 'section13.disciplinaryActions.receivedWrittenWarning'
      );
      if (mapping) {
        pdfFieldMap.set(mapping.pdfFieldId, disciplinary.receivedWrittenWarning.value || false);
      }
    }
    
    if (disciplinary.receivedOfficialReprimand) {
      const mapping = section13Mappings.mappings.find(m => 
        m.uiPath === 'section13.disciplinaryActions.receivedOfficialReprimand'
      );
      if (mapping) {
        pdfFieldMap.set(mapping.pdfFieldId, disciplinary.receivedOfficialReprimand.value || false);
      }
    }
    
    if (disciplinary.suspendedFromEmployment) {
      const mapping = section13Mappings.mappings.find(m => 
        m.uiPath === 'section13.disciplinaryActions.suspendedFromEmployment'
      );
      if (mapping) {
        pdfFieldMap.set(mapping.pdfFieldId, disciplinary.suspendedFromEmployment.value || false);
      }
    }
    
    if (disciplinary.disciplinaryProcedures) {
      const mapping = section13Mappings.mappings.find(m => 
        m.uiPath === 'section13.disciplinaryActions.disciplinaryProcedures'
      );
      if (mapping) {
        pdfFieldMap.set(mapping.pdfFieldId, disciplinary.disciplinaryProcedures.value || false);
      }
    }
  }
  
  // Map Federal contractor information
  if (section.federalInfo) {
    const federal = section.federalInfo;
    
    if (federal.hasBeenFederalContractor) {
      const mapping = section13Mappings.mappings.find(m => 
        m.uiPath === 'section13.federalInfo.hasBeenFederalContractor'
      );
      if (mapping) {
        pdfFieldMap.set(mapping.pdfFieldId, federal.hasBeenFederalContractor.value || false);
      }
    }
    
    if (federal.mostRecentAgency) {
      const mapping = section13Mappings.mappings.find(m => 
        m.uiPath === 'section13.federalInfo.mostRecentAgency'
      );
      if (mapping) {
        pdfFieldMap.set(mapping.pdfFieldId, federal.mostRecentAgency.value || '');
      }
    }
    
    if (federal.dateContractEnded) {
      const mapping = section13Mappings.mappings.find(m => 
        m.uiPath === 'section13.federalInfo.dateContractEnded'
      );
      if (mapping) {
        pdfFieldMap.set(mapping.pdfFieldId, federal.dateContractEnded.value || '');
      }
    }
  }
  
  logger.info('Section 13 PDF mapping complete', 'Section13PDFMapper', {
    totalFieldsMapped: pdfFieldMap.size,
    hasMilitaryEmployment: !!section.militaryEmployment?.entries?.length,
    hasNonFederalEmployment: !!section.nonFederalEmployment?.entries?.length,
    hasSelfEmployment: !!section.selfEmployment?.entries?.length,
    hasUnemployment: !!section.unemployment?.entries?.length,
    hasRecordIssues: !!section.employmentRecordIssues,
    hasDisciplinaryActions: !!section.disciplinaryActions
  });
  
  return pdfFieldMap;
}

/**
 * Validate Section 13 data for PDF generation
 */
export function validateSection13ForPDF(section13Data: Section13): {
  isValid: boolean;
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  if (!section13Data?.section13) {
    errors.push('Section 13 data is missing');
    return { isValid: false, errors, warnings };
  }
  
  const section = section13Data.section13;
  
  // Validate employment type is selected
  if (!section.employmentType?.value) {
    errors.push('Employment type selection is required');
  }
  
  // Validate military employment entries
  if (section.militaryEmployment?.entries) {
    section.militaryEmployment.entries.forEach((entry, index) => {
      if (!entry.branch?.value) {
        warnings.push(`Military Employment ${index + 1}: Branch is missing`);
      }
      if (!entry.dates?.fromDate?.value) {
        warnings.push(`Military Employment ${index + 1}: From date is missing`);
      }
      if (!entry.supervisor?.name?.value) {
        warnings.push(`Military Employment ${index + 1}: Supervisor name is missing`);
      }
    });
  }
  
  // Validate non-federal employment entries
  if (section.nonFederalEmployment?.entries) {
    section.nonFederalEmployment.entries.forEach((entry, index) => {
      if (!entry.employer?.value) {
        warnings.push(`Non-Federal Employment ${index + 1}: Employer name is missing`);
      }
      if (!entry.title?.value) {
        warnings.push(`Non-Federal Employment ${index + 1}: Position title is missing`);
      }
      if (!entry.dates?.fromDate?.value) {
        warnings.push(`Non-Federal Employment ${index + 1}: From date is missing`);
      }
      if (!entry.address?.city?.value) {
        warnings.push(`Non-Federal Employment ${index + 1}: City is missing`);
      }
    });
  }
  
  // Validate self-employment entries
  if (section.selfEmployment?.entries) {
    section.selfEmployment.entries.forEach((entry, index) => {
      if (!entry.businessName?.value) {
        warnings.push(`Self-Employment ${index + 1}: Business name is missing`);
      }
      if (!entry.natureOfBusiness?.value) {
        warnings.push(`Self-Employment ${index + 1}: Nature of business is missing`);
      }
      if (!entry.dates?.fromDate?.value) {
        warnings.push(`Self-Employment ${index + 1}: From date is missing`);
      }
    });
  }
  
  // Validate unemployment entries
  if (section.unemployment?.entries) {
    section.unemployment.entries.forEach((entry, index) => {
      if (!entry.reason?.value) {
        warnings.push(`Unemployment ${index + 1}: Reason is missing`);
      }
      if (!entry.dates?.fromDate?.value) {
        warnings.push(`Unemployment ${index + 1}: From date is missing`);
      }
      if (!entry.references || entry.references.length === 0) {
        warnings.push(`Unemployment ${index + 1}: References are recommended`);
      }
    });
  }
  
  // Validate employment record issues if any are marked YES
  if (section.employmentRecordIssues) {
    const issues = section.employmentRecordIssues;
    if (issues.wasFired?.value && !issues.reasonForFiring?.value) {
      warnings.push('Employment Issues: Reason for firing should be provided');
    }
    if (issues.quitAfterBeingTold?.value && !issues.reasonForQuitting?.value) {
      warnings.push('Employment Issues: Reason for quitting should be provided');
    }
    if (issues.hasChargesOrAllegations?.value && !issues.chargesOrAllegations?.value) {
      warnings.push('Employment Issues: Details of charges/allegations should be provided');
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Get mapping statistics for Section 13
 */
export function getSection13MappingStats(section13Data: Section13): {
  totalFields: number;
  mappedFields: number;
  percentage: number;
  employmentStats: {
    military: number;
    nonFederal: number;
    selfEmployment: number;
    unemployment: number;
    recordIssues: number;
    disciplinary: number;
  };
} {
  const pdfFieldMap = mapSection13ToPDFFields(section13Data);
  const totalPossibleFields = (section13Mappings as any)?.summary?.totalMappings ?? 1086;
  
  const stats = {
    military: 0,
    nonFederal: 0,
    selfEmployment: 0,
    unemployment: 0,
    recordIssues: 0,
    disciplinary: 0
  };
  
  if (section13Data?.section13) {
    const section = section13Data.section13;
    
    // Count military employment fields
    if (section.militaryEmployment?.entries) {
      stats.military = section.militaryEmployment.entries.length * 50; // Approximate fields per entry
    }
    
    // Count non-federal employment fields
    if (section.nonFederalEmployment?.entries) {
      stats.nonFederal = section.nonFederalEmployment.entries.length * 90; // Approximate fields per entry
    }
    
    // Count self-employment fields
    if (section.selfEmployment?.entries) {
      stats.selfEmployment = section.selfEmployment.entries.length * 60; // Approximate fields per entry
    }
    
    // Count unemployment fields
    if (section.unemployment?.entries) {
      stats.unemployment = section.unemployment.entries.length * 50; // Approximate fields per entry
    }
    
    // Count record issues fields
    if (section.employmentRecordIssues) {
      stats.recordIssues = 62; // As per metadata
    }
    
    // Count disciplinary actions fields
    if (section.disciplinaryActions) {
      stats.disciplinary = 4; // As per metadata
    }
  }
  
  return {
    totalFields: totalPossibleFields,
    mappedFields: pdfFieldMap.size,
    percentage: (pdfFieldMap.size / totalPossibleFields) * 100,
    employmentStats: stats
  };
}
