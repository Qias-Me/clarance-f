/**
 * Section 30 PDF Mapper - Continuation Section
 * Maps Section 30 data to PDF fields with 25 total fields
 * Handles continuation sheets, personal info across multiple pages, and medical info
 */

import type { Section30 } from "../../api/interfaces/section-interfaces/section30";
import type { Field } from "../../api/interfaces/formDefinition2.0";

/**
 * Maps Section 30 data to PDF fields
 * Covers continuation/general remarks section with 25 fields across 4 pages
 */
export function mapSection30ToPDFFields(section30Data: Section30): Map<string, any> {
  const pdfFields = new Map<string, any>();
  
  if (!section30Data?.section30) {
    return pdfFields;
  }

  const { section30 } = section30Data;

  // Main continuation sheet field (page 133)
  if (section30.continuationSheet?.value) {
    pdfFields.set("form1[0].continuation1[0].p15-t28[0]", section30.continuationSheet.value);
  }

  // Date signed on page 1 (page 133)
  if (section30.dateSignedPage1?.value) {
    pdfFields.set("form1[0].continuation1[0].p17-t2[0]", section30.dateSignedPage1.value);
  }

  // Personal info on page 2 (page 134)
  if (section30.personalInfo) {
    const info = section30.personalInfo;
    
    if (info.fullName?.value) {
      pdfFields.set("form1[0].continuation2[0].p17-t1[0]", info.fullName.value);
    }
    
    if (info.dateSigned?.value) {
      pdfFields.set("form1[0].continuation2[0].p17-t2[0]", info.dateSigned.value);
    }
    
    if (info.otherNamesUsed?.value) {
      pdfFields.set("form1[0].continuation2[0].p17-t3[0]", info.otherNamesUsed.value);
    }
    
    if (info.dateOfBirth?.value) {
      pdfFields.set("form1[0].continuation2[0].p17-t4[0]", info.dateOfBirth.value);
    }
    
    // Current address fields
    if (info.currentAddress) {
      const addr = info.currentAddress;
      
      if (addr.street?.value) {
        pdfFields.set("form1[0].continuation2[0].p17-t6[0]", addr.street.value);
      }
      
      if (addr.city?.value) {
        pdfFields.set("form1[0].continuation2[0].p17-t8[0]", addr.city.value);
      }
      
      if (addr.state?.value) {
        pdfFields.set("form1[0].continuation2[0].p17-t9[0]", addr.state.value);
      }
      
      if (addr.zipCode?.value) {
        pdfFields.set("form1[0].continuation2[0].p17-t10[0]", addr.zipCode.value);
      }
      
      if (addr.telephoneNumber?.value) {
        pdfFields.set("form1[0].continuation2[0].p17-t11[0]", addr.telephoneNumber.value);
      }
    }
  }

  // Medical info on page 3 (page 135)
  if (section30.medicalInfo) {
    const medical = section30.medicalInfo;
    
    // Radio button for medical condition (values: "1" or "2")
    if (medical.radioButtonOption?.value) {
      pdfFields.set("form1[0].continuation3[0].RadioButtonList[0]", medical.radioButtonOption.value);
    }
    
    if (medical.whatIsPrognosis?.value) {
      pdfFields.set("form1[0].continuation3[0].TextField1[0]", medical.whatIsPrognosis.value);
    }
    
    if (medical.natureOfCondition?.value) {
      pdfFields.set("form1[0].continuation3[0].TextField1[1]", medical.natureOfCondition.value);
    }
    
    if (medical.datesOfTreatment?.value) {
      pdfFields.set("form1[0].continuation3[0].TextField1[2]", medical.datesOfTreatment.value);
    }
  }

  // Personal info on page 3 (page 135)
  if (section30.page3PersonalInfo) {
    const info = section30.page3PersonalInfo;
    
    if (info.fullName?.value) {
      pdfFields.set("form1[0].continuation3[0].p17-t1[0]", info.fullName.value);
    }
    
    if (info.dateSigned?.value) {
      pdfFields.set("form1[0].continuation3[0].p17-t2[0]", info.dateSigned.value);
    }
    
    if (info.otherNamesUsed?.value) {
      pdfFields.set("form1[0].continuation3[0].p17-t3[0]", info.otherNamesUsed.value);
    }
    
    // Current address fields for page 3
    if (info.currentAddress) {
      const addr = info.currentAddress;
      
      if (addr.street?.value) {
        pdfFields.set("form1[0].continuation3[0].p17-t6[0]", addr.street.value);
      }
      
      if (addr.city?.value) {
        pdfFields.set("form1[0].continuation3[0].p17-t8[0]", addr.city.value);
      }
      
      if (addr.state?.value) {
        pdfFields.set("form1[0].continuation3[0].p17-t9[0]", addr.state.value);
      }
      
      if (addr.zipCode?.value) {
        pdfFields.set("form1[0].continuation3[0].p17-t10[0]", addr.zipCode.value);
      }
      
      if (addr.telephoneNumber?.value) {
        pdfFields.set("form1[0].continuation3[0].p17-t11[0]", addr.telephoneNumber.value);
      }
    }
  }

  // Page 4 info (page 136)
  if (section30.page4Info) {
    const info = section30.page4Info;
    
    if (info.printName?.value) {
      pdfFields.set("form1[0].continuation4[0].p17-t1[0]", info.printName.value);
    }
    
    if (info.dateSigned?.value) {
      pdfFields.set("form1[0].continuation4[0].p17-t2[0]", info.dateSigned.value);
    }
  }

  return pdfFields;
}

/**
 * Validate Section 30 data before PDF generation
 */
export function validateSection30ForPDF(section30Data: Section30): {
  isValid: boolean;
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!section30Data?.section30) {
    errors.push('Section 30: Missing section data');
    return { isValid: false, errors, warnings };
  }

  const { section30 } = section30Data;

  // Check for continuation sheet content
  if (!section30.continuationSheet?.value) {
    warnings.push('Section 30: No continuation remarks provided');
  }

  // Check personal info completeness
  if (section30.personalInfo) {
    const info = section30.personalInfo;
    
    if (!info.fullName?.value) {
      warnings.push('Section 30: Full name is recommended for page 2');
    }
    
    if (!info.dateSigned?.value) {
      warnings.push('Section 30: Date signed is recommended for page 2');
    }
    
    // Check address completeness
    if (info.currentAddress) {
      const addr = info.currentAddress;
      if ((addr.street?.value || addr.city?.value) && 
          (!addr.state?.value || !addr.zipCode?.value)) {
        warnings.push('Section 30: Incomplete address on page 2');
      }
    }
  }

  // Check medical info if present
  if (section30.medicalInfo) {
    const medical = section30.medicalInfo;
    
    if (medical.radioButtonOption?.value) {
      // If medical condition is indicated, check for required fields
      if (!medical.natureOfCondition?.value) {
        warnings.push('Section 30: Nature of condition should be provided when medical info is indicated');
      }
      
      if (!medical.datesOfTreatment?.value) {
        warnings.push('Section 30: Dates of treatment should be provided when medical info is indicated');
      }
      
      if (!medical.whatIsPrognosis?.value) {
        warnings.push('Section 30: Prognosis should be provided when medical info is indicated');
      }
    }
  }

  // Check page 3 personal info if present
  if (section30.page3PersonalInfo) {
    const info = section30.page3PersonalInfo;
    
    if (!info.fullName?.value) {
      warnings.push('Section 30: Full name is recommended for page 3');
    }
    
    if (!info.dateSigned?.value) {
      warnings.push('Section 30: Date signed is recommended for page 3');
    }
  }

  // Check page 4 info if present
  if (section30.page4Info) {
    const info = section30.page4Info;
    
    if (!info.printName?.value) {
      warnings.push('Section 30: Print name is recommended for page 4');
    }
    
    if (!info.dateSigned?.value) {
      warnings.push('Section 30: Date signed is recommended for page 4');
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Get mapping statistics for Section 30
 */
export function getSection30MappingStats(section30Data: Section30): {
  totalFields: number;
  mappedFields: number;
  completionPercentage: number;
} {
  const totalFields = 25; // Total fields in Section 30
  let mappedFields = 0;

  if (!section30Data?.section30) {
    return {
      totalFields,
      mappedFields: 0,
      completionPercentage: 0
    };
  }

  const { section30 } = section30Data;

  // Count main continuation field
  if (section30.continuationSheet?.value) mappedFields++;
  if (section30.dateSignedPage1?.value) mappedFields++;

  // Count personal info fields on page 2
  if (section30.personalInfo) {
    const info = section30.personalInfo;
    if (info.fullName?.value) mappedFields++;
    if (info.dateSigned?.value) mappedFields++;
    if (info.otherNamesUsed?.value) mappedFields++;
    if (info.dateOfBirth?.value) mappedFields++;
    
    if (info.currentAddress) {
      if (info.currentAddress.street?.value) mappedFields++;
      if (info.currentAddress.city?.value) mappedFields++;
      if (info.currentAddress.state?.value) mappedFields++;
      if (info.currentAddress.zipCode?.value) mappedFields++;
      if (info.currentAddress.telephoneNumber?.value) mappedFields++;
    }
  }

  // Count medical info fields
  if (section30.medicalInfo) {
    const medical = section30.medicalInfo;
    if (medical.radioButtonOption?.value) mappedFields++;
    if (medical.whatIsPrognosis?.value) mappedFields++;
    if (medical.natureOfCondition?.value) mappedFields++;
    if (medical.datesOfTreatment?.value) mappedFields++;
  }

  // Count page 3 personal info fields
  if (section30.page3PersonalInfo) {
    const info = section30.page3PersonalInfo;
    if (info.fullName?.value) mappedFields++;
    if (info.dateSigned?.value) mappedFields++;
    if (info.otherNamesUsed?.value) mappedFields++;
    
    if (info.currentAddress) {
      if (info.currentAddress.street?.value) mappedFields++;
      if (info.currentAddress.city?.value) mappedFields++;
      if (info.currentAddress.state?.value) mappedFields++;
      if (info.currentAddress.zipCode?.value) mappedFields++;
      if (info.currentAddress.telephoneNumber?.value) mappedFields++;
    }
  }

  // Count page 4 fields
  if (section30.page4Info) {
    if (section30.page4Info.printName?.value) mappedFields++;
    if (section30.page4Info.dateSigned?.value) mappedFields++;
  }

  return {
    totalFields,
    mappedFields,
    completionPercentage: (mappedFields / totalFields) * 100
  };
}

// Type guard to check if data is extended Section 30
function isExtendedSection30(data: any): data is any {
  return data && typeof data === 'object';
}