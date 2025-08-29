/**
 * Section 9 PDF Field Mapper
 * 
 * Handles the proper mapping of Section 9 (Citizenship) data to PDF fields
 * Section 9 contains 78 fields related to citizenship status:
 * - Main status radio button
 * - Born to US Parents (Section 9.1)
 * - Naturalized Citizen (Section 9.2)
 * - Derived Citizen (Section 9.3)
 * - Non-US Citizen (Section 9.4)
 */

import type { Section9 } from '../../api/interfaces/section-interfaces/section9';
import section9Mappings from '../../api/mappings/section-9-mappings.json';

// Flatten Section 9 data into uiPath -> value pairs matching the mapping JSON
function flattenSection9(section9Data: Section9): Record<string, any> {
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

  // Mapping JSON uses 'section9.section9.*'
  walk(section9Data.section9 as any, 'section9.section9.');
  return out;
}

/**
 * Maps Section 9 data to PDF fields
 * Handles all 78 citizenship-related fields based on status selection
 */
export function mapSection9ToPDFFields(section9Data: Section9): Map<string, any> {
  const pdfFieldMap = new Map<string, any>();
  
  if (!section9Data?.section9) {
    return pdfFieldMap;
  }
  
  const section = section9Data.section9;
  
  // Canonical: map via JSON using a flattener for full coverage
  const flat = flattenSection9(section9Data);
  for (const mapping of (section9Mappings as any).mappings as Array<{ uiPath: string; pdfFieldId: string }>) {
    const value = flat[mapping.uiPath];
    if (value !== undefined && value !== null) {
      pdfFieldMap.set(mapping.pdfFieldId, value);
    }
  }
  return pdfFieldMap;
  
  // Map main citizenship status radio button
  if (section.status) {
    const statusMapping = section9Mappings.mappings.find(m => 
      m.uiPath === 'section9.section9.status'
    );
    if (statusMapping) {
      pdfFieldMap.set(statusMapping.pdfFieldId, section.status.value || '');
    }
  }
  
  // Map Born to US Parents fields (Section 9.1)
  if (section.bornToUSParents) {
    const bornToUS = section.bornToUSParents;
    
    // Document type
    mapField(pdfFieldMap, 'section9.section9.bornToUSParents.documentType', 
      bornToUS.documentType?.value);
    
    // Other explanation
    mapField(pdfFieldMap, 'section9.section9.bornToUSParents.otherExplanation', 
      bornToUS.otherExplanation?.value);
    
    // Document details
    mapField(pdfFieldMap, 'section9.section9.bornToUSParents.documentNumber', 
      bornToUS.documentNumber?.value);
    mapField(pdfFieldMap, 'section9.section9.bornToUSParents.documentIssueDate', 
      bornToUS.documentIssueDate?.value);
    mapField(pdfFieldMap, 'section9.section9.bornToUSParents.isIssueDateEstimated', 
      bornToUS.isIssueDateEstimated?.value);
    
    // Issue location
    mapField(pdfFieldMap, 'section9.section9.bornToUSParents.issueCity', 
      bornToUS.issueCity?.value);
    mapField(pdfFieldMap, 'section9.section9.bornToUSParents.issueState', 
      bornToUS.issueState?.value);
    mapField(pdfFieldMap, 'section9.section9.bornToUSParents.issueCountry', 
      bornToUS.issueCountry?.value);
    
    // Name on document
    if (bornToUS.nameOnDocument) {
      mapField(pdfFieldMap, 'section9.section9.bornToUSParents.nameOnDocument.lastName', 
        bornToUS.nameOnDocument.lastName?.value);
      mapField(pdfFieldMap, 'section9.section9.bornToUSParents.nameOnDocument.firstName', 
        bornToUS.nameOnDocument.firstName?.value);
      mapField(pdfFieldMap, 'section9.section9.bornToUSParents.nameOnDocument.middleName', 
        bornToUS.nameOnDocument.middleName?.value);
      mapField(pdfFieldMap, 'section9.section9.bornToUSParents.nameOnDocument.suffix', 
        bornToUS.nameOnDocument.suffix?.value);
    }
    
    // Name on certificate
    if (bornToUS.nameOnCertificate) {
      mapField(pdfFieldMap, 'section9.section9.bornToUSParents.nameOnCertificate.lastName', 
        bornToUS.nameOnCertificate.lastName?.value);
      mapField(pdfFieldMap, 'section9.section9.bornToUSParents.nameOnCertificate.firstName', 
        bornToUS.nameOnCertificate.firstName?.value);
      mapField(pdfFieldMap, 'section9.section9.bornToUSParents.nameOnCertificate.middleName', 
        bornToUS.nameOnCertificate.middleName?.value);
      mapField(pdfFieldMap, 'section9.section9.bornToUSParents.nameOnCertificate.suffix', 
        bornToUS.nameOnCertificate.suffix?.value);
    }
    
    // Military installation
    mapField(pdfFieldMap, 'section9.section9.bornToUSParents.wasBornOnMilitaryInstallation', 
      bornToUS.wasBornOnMilitaryInstallation?.value);
    mapField(pdfFieldMap, 'section9.section9.bornToUSParents.militaryBaseName', 
      bornToUS.militaryBaseName?.value);
  }
  
  // Map Naturalized Citizen fields (Section 9.2)
  if (section.naturalizedCitizen) {
    const naturalized = section.naturalizedCitizen;
    
    // Certificate details
    mapField(pdfFieldMap, 'section9.section9.naturalizedCitizen.naturalizedCertificateNumber', 
      naturalized.naturalizedCertificateNumber?.value);
    mapField(pdfFieldMap, 'section9.section9.naturalizedCitizen.certificateIssueDate', 
      naturalized.certificateIssueDate?.value);
    mapField(pdfFieldMap, 'section9.section9.naturalizedCitizen.isCertificateDateEstimated', 
      naturalized.isCertificateDateEstimated?.value);
    
    // Name on certificate
    if (naturalized.nameOnCertificate) {
      mapField(pdfFieldMap, 'section9.section9.naturalizedCitizen.nameOnCertificate.lastName', 
        naturalized.nameOnCertificate.lastName?.value);
      mapField(pdfFieldMap, 'section9.section9.naturalizedCitizen.nameOnCertificate.firstName', 
        naturalized.nameOnCertificate.firstName?.value);
      mapField(pdfFieldMap, 'section9.section9.naturalizedCitizen.nameOnCertificate.middleName', 
        naturalized.nameOnCertificate.middleName?.value);
      mapField(pdfFieldMap, 'section9.section9.naturalizedCitizen.nameOnCertificate.suffix', 
        naturalized.nameOnCertificate.suffix?.value);
    }
    
    // Court address
    if (naturalized.courtAddress) {
      mapField(pdfFieldMap, 'section9.section9.naturalizedCitizen.courtAddress.street', 
        naturalized.courtAddress.street?.value);
      mapField(pdfFieldMap, 'section9.section9.naturalizedCitizen.courtAddress.city', 
        naturalized.courtAddress.city?.value);
      mapField(pdfFieldMap, 'section9.section9.naturalizedCitizen.courtAddress.state', 
        naturalized.courtAddress.state?.value);
      mapField(pdfFieldMap, 'section9.section9.naturalizedCitizen.courtAddress.zipCode', 
        naturalized.courtAddress.zipCode?.value);
    }
    
    // Court name and other details
    mapField(pdfFieldMap, 'section9.section9.naturalizedCitizen.courtName', 
      naturalized.courtName?.value);
    mapField(pdfFieldMap, 'section9.section9.naturalizedCitizen.otherExplanation', 
      naturalized.otherExplanation?.value);
    
    // Entry information
    mapField(pdfFieldMap, 'section9.section9.naturalizedCitizen.entryDate', 
      naturalized.entryDate?.value);
    mapField(pdfFieldMap, 'section9.section9.naturalizedCitizen.isEntryDateEstimated', 
      naturalized.isEntryDateEstimated?.value);
    mapField(pdfFieldMap, 'section9.section9.naturalizedCitizen.entryCity', 
      naturalized.entryCity?.value);
    mapField(pdfFieldMap, 'section9.section9.naturalizedCitizen.entryState', 
      naturalized.entryState?.value);
    
    // Prior citizenships
    mapField(pdfFieldMap, 'section9.section9.naturalizedCitizen.priorCitizenship', 
      naturalized.priorCitizenship?.value);
    mapField(pdfFieldMap, 'section9.section9.naturalizedCitizen.priorCitizenship2', 
      naturalized.priorCitizenship2?.value);
    mapField(pdfFieldMap, 'section9.section9.naturalizedCitizen.priorCitizenship3', 
      naturalized.priorCitizenship3?.value);
    mapField(pdfFieldMap, 'section9.section9.naturalizedCitizen.priorCitizenship4', 
      naturalized.priorCitizenship4?.value);
    
    // Alien registration
    mapField(pdfFieldMap, 'section9.section9.naturalizedCitizen.hasAlienRegistrationRadio', 
      naturalized.hasAlienRegistrationRadio?.value);
    mapField(pdfFieldMap, 'section9.section9.naturalizedCitizen.alienRegistrationNumber', 
      naturalized.alienRegistrationNumber?.value);
  }
  
  // Map Derived Citizen fields (Section 9.3)
  if (section.derivedCitizen) {
    const derived = section.derivedCitizen;
    
    // Registration numbers
    mapField(pdfFieldMap, 'section9.section9.derivedCitizen.alienRegistrationNumber', 
      derived.alienRegistrationNumber?.value);
    mapField(pdfFieldMap, 'section9.section9.derivedCitizen.permanentResidentCardNumber', 
      derived.permanentResidentCardNumber?.value);
    mapField(pdfFieldMap, 'section9.section9.derivedCitizen.certificateOfCitizenshipNumber', 
      derived.certificateOfCitizenshipNumber?.value);
    
    // Name on document
    if (derived.nameOnDocument) {
      mapField(pdfFieldMap, 'section9.section9.derivedCitizen.nameOnDocument.firstName', 
        derived.nameOnDocument.firstName?.value);
      mapField(pdfFieldMap, 'section9.section9.derivedCitizen.nameOnDocument.middleName', 
        derived.nameOnDocument.middleName?.value);
      mapField(pdfFieldMap, 'section9.section9.derivedCitizen.nameOnDocument.lastName', 
        derived.nameOnDocument.lastName?.value);
      mapField(pdfFieldMap, 'section9.section9.derivedCitizen.nameOnDocument.suffix', 
        derived.nameOnDocument.suffix?.value);
    }
    
    // Basis and explanations
    mapField(pdfFieldMap, 'section9.section9.derivedCitizen.basis', 
      derived.basis?.value);
    mapField(pdfFieldMap, 'section9.section9.derivedCitizen.otherExplanation', 
      derived.otherExplanation?.value);
    
    // Document dates
    mapField(pdfFieldMap, 'section9.section9.derivedCitizen.documentIssueDate', 
      derived.documentIssueDate?.value);
    mapField(pdfFieldMap, 'section9.section9.derivedCitizen.isDocumentIssueDateEstimated', 
      derived.isDocumentIssueDateEstimated?.value);
    mapField(pdfFieldMap, 'section9.section9.derivedCitizen.isBasisEstimated', 
      derived.isBasisEstimated?.value);
    mapField(pdfFieldMap, 'section9.section9.derivedCitizen.isDateEstimated', 
      derived.isDateEstimated?.value);
    
    // Additional fields
    mapField(pdfFieldMap, 'section9.section9.derivedCitizen.additionalFirstName', 
      derived.additionalFirstName?.value);
    mapField(pdfFieldMap, 'section9.section9.derivedCitizen.additionalExplanation', 
      derived.additionalExplanation?.value);
    mapField(pdfFieldMap, 'section9.section9.derivedCitizen.otherProvideExplanation', 
      derived.otherProvideExplanation?.value);
    mapField(pdfFieldMap, 'section9.section9.derivedCitizen.basisOfNaturalization', 
      derived.basisOfNaturalization?.value);
  }
  
  // Map Non-US Citizen fields (Section 9.4)
  if (section.nonUSCitizen) {
    const nonUS = section.nonUSCitizen;
    
    // Residence and entry
    mapField(pdfFieldMap, 'section9.section9.nonUSCitizen.residenceStatus', 
      nonUS.residenceStatus?.value);
    mapField(pdfFieldMap, 'section9.section9.nonUSCitizen.entryDate', 
      nonUS.entryDate?.value);
    mapField(pdfFieldMap, 'section9.section9.nonUSCitizen.isEntryDateEstimated', 
      nonUS.isEntryDateEstimated?.value);
    mapField(pdfFieldMap, 'section9.section9.nonUSCitizen.entryCity', 
      nonUS.entryCity?.value);
    mapField(pdfFieldMap, 'section9.section9.nonUSCitizen.entryState', 
      nonUS.entryState?.value);
    
    // Alien registration
    mapField(pdfFieldMap, 'section9.section9.nonUSCitizen.alienRegistrationNumber', 
      nonUS.alienRegistrationNumber?.value);
    mapField(pdfFieldMap, 'section9.section9.nonUSCitizen.hasAlienRegistration', 
      nonUS.hasAlienRegistration?.value);
    
    // Document details
    mapField(pdfFieldMap, 'section9.section9.nonUSCitizen.documentNumber', 
      nonUS.documentNumber?.value);
    mapField(pdfFieldMap, 'section9.section9.nonUSCitizen.documentIssueDate', 
      nonUS.documentIssueDate?.value);
    mapField(pdfFieldMap, 'section9.section9.nonUSCitizen.isDocumentIssueDateEstimated', 
      nonUS.isDocumentIssueDateEstimated?.value);
    mapField(pdfFieldMap, 'section9.section9.nonUSCitizen.documentExpirationDate', 
      nonUS.documentExpirationDate?.value);
    mapField(pdfFieldMap, 'section9.section9.nonUSCitizen.isDocumentExpirationEstimated', 
      nonUS.isDocumentExpirationEstimated?.value);
    mapField(pdfFieldMap, 'section9.section9.nonUSCitizen.additionalDocumentExpirationDate', 
      nonUS.additionalDocumentExpirationDate?.value);
    mapField(pdfFieldMap, 'section9.section9.nonUSCitizen.isAdditionalDocumentExpirationEstimated', 
      nonUS.isAdditionalDocumentExpirationEstimated?.value);
    
    // Name on document
    if (nonUS.nameOnDocument) {
      mapField(pdfFieldMap, 'section9.section9.nonUSCitizen.nameOnDocument.firstName', 
        nonUS.nameOnDocument.firstName?.value);
      mapField(pdfFieldMap, 'section9.section9.nonUSCitizen.nameOnDocument.middleName', 
        nonUS.nameOnDocument.middleName?.value);
      mapField(pdfFieldMap, 'section9.section9.nonUSCitizen.nameOnDocument.lastName', 
        nonUS.nameOnDocument.lastName?.value);
      mapField(pdfFieldMap, 'section9.section9.nonUSCitizen.nameOnDocument.suffix', 
        nonUS.nameOnDocument.suffix?.value);
    }
    
    // Explanation
    mapField(pdfFieldMap, 'section9.section9.nonUSCitizen.explanation', 
      nonUS.explanation?.value);
  }
  
  return pdfFieldMap;
}

/**
 * Helper function to map a field if it exists in the mappings
 */
function mapField(pdfFieldMap: Map<string, any>, uiPath: string, value: any) {
  if (value === undefined || value === null) return;
  
  const mapping = section9Mappings.mappings.find(m => m.uiPath === uiPath);
  if (mapping) {
    pdfFieldMap.set(mapping.pdfFieldId, value);
  }
}

/**
 * Validates that Section 9 data is properly structured for PDF generation
 */
export function validateSection9ForPDF(section9Data: Section9): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];
  
  if (!section9Data?.section9) {
    errors.push('Section 9 data is missing');
    return { isValid: false, errors };
  }
  
  const section = section9Data.section9;
  
  // Check required main status field
  if (!section.status?.value) {
    errors.push('Citizenship status is required');
  }
  
  // Validate based on selected status
  const status = section.status?.value || '';
  
  if (status.includes('born to U.S. parent(s)')) {
    // Validate Section 9.1
    if (!section.bornToUSParents) {
      errors.push('Born to US Parents information is required');
    } else {
      if (!section.bornToUSParents.documentType?.value) {
        errors.push('Document type is required for Born to US Parents');
      }
      if (!section.bornToUSParents.documentNumber?.value) {
        errors.push('Document number is required for Born to US Parents');
      }
    }
  }
  
  if (status.includes('naturalized')) {
    // Validate Section 9.2
    if (!section.naturalizedCitizen) {
      errors.push('Naturalized Citizen information is required');
    } else {
      if (!section.naturalizedCitizen.naturalizedCertificateNumber?.value) {
        errors.push('Naturalization certificate number is required');
      }
      if (!section.naturalizedCitizen.certificateIssueDate?.value) {
        errors.push('Certificate issue date is required');
      }
    }
  }
  
  if (status.includes('derived')) {
    // Validate Section 9.3
    if (!section.derivedCitizen) {
      errors.push('Derived Citizen information is required');
    } else {
      if (!section.derivedCitizen.basis?.value) {
        errors.push('Basis for derived citizenship is required');
      }
    }
  }
  
  if (status.includes('not a U.S. citizen')) {
    // Validate Section 9.4
    if (!section.nonUSCitizen) {
      errors.push('Non-US Citizen information is required');
    } else {
      if (!section.nonUSCitizen.entryDate?.value) {
        errors.push('Entry date is required for Non-US Citizens');
      }
      if (!section.nonUSCitizen.hasAlienRegistration?.value) {
        errors.push('Alien registration status is required');
      }
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Get statistics about Section 9 PDF mapping
 */
export function getSection9MappingStats(): {
  totalFields: number;
  statusFields: number;
  bornToUSFields: number;
  naturalizedFields: number;
  derivedFields: number;
  nonUSFields: number;
} {
  return {
    totalFields: 78,
    statusFields: 1,
    bornToUSFields: 18, // Born to US Parents subsection
    naturalizedFields: 24, // Naturalized Citizen subsection
    derivedFields: 18, // Derived Citizen subsection
    nonUSFields: 17 // Non-US Citizen subsection
  };
}
