/**
 * Sections 1-5 PDF Integration Service
 * 
 * Comprehensive field mapping and integration service for SF-86 Sections 1-5
 * This service ensures proper data transformation from UI to PDF format
 */

import type { 
  ApplicantFormValues, 
  Field, 
  FieldWithOptions 
} from '../../api/interfaces/formDefinition2.0';

/**
 * Section Field Mappings
 * Maps UI field paths to PDF field IDs for sections 1-5
 */
export const SECTION_1_5_PDF_MAPPINGS = {
  // Section 1: Full Name
  // NOTE: Section 1 contains only current name fields (lastName, firstName, middleName, suffix)
  // This is handled by the dedicated section1-pdf-mapper.ts
  section1: {
    // Placeholder - actual mapping handled by section1-pdf-mapper.ts
    // which properly maps the 4 name fields
  },

  // Section 2: Date of Birth
  // NOTE: Section 2 contains only date of birth and isEstimated checkbox
  // This is handled by the dedicated section2-pdf-mapper.ts
  section2: {
    // Placeholder - actual mapping handled by section2-pdf-mapper.ts
    // which properly maps date and isEstimated fields
  },

  // Section 3: Place of Birth
  // NOTE: Section 3 contains only place of birth fields (city, county, country, state)
  // This is handled by the dedicated section3-pdf-mapper.ts
  section3: {
    // Placeholder - actual mapping handled by section3-pdf-mapper.ts
    // which properly maps city, county, country, and state fields
  },

  // Section 4: Social Security Number
  // NOTE: Section 4 has 138 SSN fields that require propagation
  // This is handled by the dedicated section4-pdf-mapper.ts
  section4: {
    // Placeholder - actual mapping handled by section4-pdf-mapper.ts
    // which properly maps to all 138 SSN fields in the PDF
  },

  // Section 5: Other Names Used
  section5: {
    hasUsedOtherNames: 'form1[0].Sections1-6[0].RadioButtonList[2]',
    otherNames: {
      // Entry 1
      entry1: {
        lastName: 'form1[0].Sections1-6[0].TextField11[16]',
        firstName: 'form1[0].Sections1-6[0].TextField11[17]',
        middleName: 'form1[0].Sections1-6[0].TextField11[18]',
        fromMonth: 'form1[0].Sections1-6[0].TextField11[19]',
        fromYear: 'form1[0].Sections1-6[0].TextField11[20]',
        toMonth: 'form1[0].Sections1-6[0].TextField11[21]',
        toYear: 'form1[0].Sections1-6[0].TextField11[22]',
        reason: 'form1[0].Sections1-6[0].TextField11[23]'
      },
      // Entry 2
      entry2: {
        lastName: 'form1[0].Sections1-6[0].TextField11[24]',
        firstName: 'form1[0].Sections1-6[0].TextField11[25]',
        middleName: 'form1[0].Sections1-6[0].TextField11[26]',
        fromMonth: 'form1[0].Sections1-6[0].TextField11[27]',
        fromYear: 'form1[0].Sections1-6[0].TextField11[28]',
        toMonth: 'form1[0].Sections1-6[0].TextField11[29]',
        toYear: 'form1[0].Sections1-6[0].TextField11[30]',
        reason: 'form1[0].Sections1-6[0].TextField11[31]'
      }
    }
  }
};

/**
 * Transform UI data to PDF-compatible format for sections 1-5
 */
export function transformSections1to5ForPDF(formData: ApplicantFormValues): Map<string, any> {
  const pdfFieldMap = new Map<string, any>();

  // Process Section 1 - Full Name
  if (formData.section1) {
    // Section 1 contains only current name fields (4 fields total)
    // Use the dedicated mapper for proper handling
    const { mapSection1ToPDFFields } = require('./section1-pdf-mapper');
    const section1Fields = mapSection1ToPDFFields(formData.section1);
    
    // Add all Section 1 fields to the main PDF field map
    section1Fields.forEach((value, key) => {
      pdfFieldMap.set(key, value);
    });
  }

  // Process Section 2 - Date of Birth
  if (formData.section2) {
    // Section 2 contains only date of birth and isEstimated checkbox
    // Use the dedicated mapper for proper handling
    const { mapSection2ToPDFFields } = require('./section2-pdf-mapper');
    const section2Fields = mapSection2ToPDFFields(formData.section2);
    
    // Add all Section 2 fields to the main PDF field map
    section2Fields.forEach((value, key) => {
      pdfFieldMap.set(key, value);
    });
  }

  // Process Section 3 - Place of Birth
  if (formData.section3) {
    // Section 3 contains only place of birth fields (city, county, country, state)
    // Use the dedicated mapper for proper handling
    const { mapSection3ToPDFFields } = require('./section3-pdf-mapper');
    const section3Fields = mapSection3ToPDFFields(formData.section3);
    
    // Add all Section 3 fields to the main PDF field map
    section3Fields.forEach((value, key) => {
      pdfFieldMap.set(key, value);
    });
  }

  // Process Section 4 - Social Security Number
  // Import the proper Section 4 mapper to handle all 138 SSN fields
  if (formData.section4) {
    // Section 4 has a special structure that requires SSN propagation to 138 fields
    // Use the dedicated mapper for proper handling
    const { mapSection4ToPDFFields } = require('./section4-pdf-mapper');
    const section4Fields = mapSection4ToPDFFields(formData.section4);
    
    // Add all Section 4 fields to the main PDF field map
    section4Fields.forEach((value, key) => {
      pdfFieldMap.set(key, value);
    });
  }

  // Process Section 5 - Other Names Used (use dedicated mapper)
  if (formData.section5) {
    const { mapSection5ToPDFFields } = require('./section5-pdf-mapper');
    const section5Fields = mapSection5ToPDFFields(formData.section5 as any);
    section5Fields.forEach((value: any, key: string) => {
      pdfFieldMap.set(key, value);
    });
  }

  return pdfFieldMap;
}

/**
 * Validate sections 1-5 data for PDF generation
 */
export function validateSections1to5(formData: ApplicantFormValues): {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  statistics: {
    totalFields: number;
    populatedFields: number;
    missingRequiredFields: string[];
  };
} {
  const errors: string[] = [];
  const warnings: string[] = [];
  const missingRequiredFields: string[] = [];
  let totalFields = 0;
  let populatedFields = 0;

  // Validate Section 1 - Name is required
  if (!formData.section1?.section1?.lastName?.value) {
    errors.push('Section 1: Last Name is required');
    missingRequiredFields.push('lastName');
  } else {
    populatedFields++;
  }
  totalFields++;

  if (!formData.section1?.section1?.firstName?.value) {
    errors.push('Section 1: First Name is required');
    missingRequiredFields.push('firstName');
  } else {
    populatedFields++;
  }
  totalFields++;

  // Middle name and suffix are optional
  if (formData.section1?.section1?.middleName?.value) {
    populatedFields++;
  }
  totalFields++;

  if (formData.section1?.section1?.suffix?.value) {
    populatedFields++;
  }
  totalFields++;

  // Validate Section 2 - Date of Birth fields
  if (formData.section2?.section2) {
    const section = formData.section2.section2;
    
    // Check date (required)
    if (!section.date?.value) {
      errors.push('Section 2: Date of Birth is required');
      missingRequiredFields.push('dateOfBirth');
    } else {
      populatedFields++;
    }
    totalFields++;
    
    // isEstimated is optional
    if (section.isEstimated?.value !== undefined) {
      populatedFields++;
    }
    totalFields++;
  } else {
    errors.push('Section 2: Section data is missing');
    missingRequiredFields.push('section2');
  }

  // Validate Section 3 - Place of Birth fields
  if (formData.section3?.section3) {
    const section = formData.section3.section3;
    
    // Check city (required)
    if (!section.city?.value) {
      errors.push('Section 3: City is required');
      missingRequiredFields.push('city');
    } else {
      populatedFields++;
    }
    totalFields++;
    
    // Check country (required)
    if (!section.country?.value) {
      errors.push('Section 3: Country is required');
      missingRequiredFields.push('country');
    } else {
      populatedFields++;
    }
    totalFields++;
    
    // Check state (required for US births)
    if (section.country?.value === 'United States' && !section.state?.value) {
      errors.push('Section 3: State is required for US birth locations');
      missingRequiredFields.push('state');
    } else if (section.state?.value) {
      populatedFields++;
    }
    totalFields++;
    
    // County is optional
    if (section.county?.value) {
      populatedFields++;
    }
    totalFields++;
  } else {
    errors.push('Section 3: Section data is missing');
    missingRequiredFields.push('section3');
  }

  // Validate Section 4 - Acknowledgement is required, SSN is optional
  if (formData.section4?.section4) {
    const section = formData.section4.section4;
    
    // Check acknowledgement (required)
    if (!section.Acknowledgement?.value) {
      errors.push('Section 4: Acknowledgement is required');
      missingRequiredFields.push('acknowledgement');
    } else {
      populatedFields++;
    }
    totalFields++;
    
    // Check SSN (optional, but validate format if provided)
    if (!section.notApplicable?.value && section.ssn?.[0]?.value?.value) {
      const ssnValue = section.ssn[0].value.value.replace(/\D/g, '');
      if (ssnValue.length !== 9 && ssnValue.length > 0) {
        errors.push('Section 4: SSN must be 9 digits');
      } else if (ssnValue.length === 9) {
        populatedFields++;
      }
    }
    totalFields++;
  } else {
    errors.push('Section 4: Section data is missing');
    missingRequiredFields.push('section4');
  }

  // Generate warnings for optional but recommended fields
  // Note: Section 2 only has date and isEstimated fields, no place of birth
  // Place of birth warnings would be for Section 3

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    statistics: {
      totalFields,
      populatedFields,
      missingRequiredFields
    }
  };
}

/**
 * Get mapping statistics for sections 1-5
 */
export function getSections1to5MappingStats(formData: ApplicantFormValues): {
  section1: { total: number; mapped: number; percentage: number };
  section2: { total: number; mapped: number; percentage: number };
  section3: { total: number; mapped: number; percentage: number };
  section4: { total: number; mapped: number; percentage: number };
  section5: { total: number; mapped: number; percentage: number };
  overall: { total: number; mapped: number; percentage: number };
} {
  const stats = {
    section1: { total: 4, mapped: 0, percentage: 0 },
    section2: { total: 2, mapped: 0, percentage: 0 }, // date, isEstimated
    section3: { total: 4, mapped: 0, percentage: 0 }, // city, county, country, state
    section4: { total: 140, mapped: 0, percentage: 0 }, // 138 SSN + notApplicable + Acknowledgement
    section5: { total: 17, mapped: 0, percentage: 0 }, // Multiple entries possible
    overall: { total: 0, mapped: 0, percentage: 0 }
  };

  // Count Section 1 mapped fields
  if (formData.section1?.section1) {
    const s1 = formData.section1.section1;
    if (s1.lastName?.value) stats.section1.mapped++;
    if (s1.firstName?.value) stats.section1.mapped++;
    if (s1.middleName?.value) stats.section1.mapped++;
    if (s1.suffix?.value) stats.section1.mapped++;
  }
  stats.section1.percentage = (stats.section1.mapped / stats.section1.total) * 100;

  // Count Section 2 mapped fields
  // Section 2 has 2 fields: date, isEstimated
  if (formData.section2?.section2) {
    const s2 = formData.section2.section2;
    if (s2.date?.value) stats.section2.mapped++;
    if (s2.isEstimated?.value !== undefined) stats.section2.mapped++;
  }
  stats.section2.percentage = (stats.section2.mapped / stats.section2.total) * 100;

  // Count Section 3 mapped fields
  // Section 3 has 4 fields: city, county, country, state
  stats.section3.total = 4;
  if (formData.section3?.section3) {
    const s3 = formData.section3.section3;
    if (s3.city?.value) stats.section3.mapped++;
    if (s3.county?.value) stats.section3.mapped++;
    if (s3.country?.value) stats.section3.mapped++;
    if (s3.state?.value) stats.section3.mapped++;
  }
  stats.section3.percentage = stats.section3.total > 0 ? (stats.section3.mapped / stats.section3.total) * 100 : 0;

  // Count Section 4 mapped fields
  // Section 4 has 138 SSN fields + 1 notApplicable + 1 Acknowledgement = 140 total
  stats.section4.total = 140;
  if (formData.section4?.section4) {
    const s4 = formData.section4.section4;
    // Count SSN fields (all 138 get the same value when propagated)
    if (!s4.notApplicable?.value && s4.ssn?.[0]?.value?.value) {
      stats.section4.mapped += 138; // All SSN fields get mapped
    }
    if (s4.notApplicable?.value !== undefined) stats.section4.mapped++;
    if (s4.Acknowledgement?.value) stats.section4.mapped++;
  }
  stats.section4.percentage = (stats.section4.mapped / stats.section4.total) * 100;

  // Count Section 5 mapped fields
  if (formData.section5) {
    const s5 = formData.section5;
    if (s5.hasUsedOtherNames?.value !== undefined) stats.section5.mapped++;
    
    if (s5.otherNames && Array.isArray(s5.otherNames)) {
      s5.otherNames.forEach((entry) => {
        if (entry.lastName?.value) stats.section5.mapped++;
        if (entry.firstName?.value) stats.section5.mapped++;
        if (entry.middleName?.value) stats.section5.mapped++;
        if (entry.fromMonth?.value) stats.section5.mapped++;
        if (entry.fromYear?.value) stats.section5.mapped++;
        if (entry.toMonth?.value) stats.section5.mapped++;
        if (entry.toYear?.value) stats.section5.mapped++;
        if (entry.reason?.value) stats.section5.mapped++;
      });
    }
  }
  stats.section5.percentage = stats.section5.total > 0 ? (stats.section5.mapped / stats.section5.total) * 100 : 0;

  // Calculate overall statistics
  stats.overall.total = stats.section1.total + stats.section2.total + stats.section3.total + 
                        stats.section4.total + stats.section5.total;
  stats.overall.mapped = stats.section1.mapped + stats.section2.mapped + stats.section3.mapped + 
                         stats.section4.mapped + stats.section5.mapped;
  stats.overall.percentage = stats.overall.total > 0 ? (stats.overall.mapped / stats.overall.total) * 100 : 0;

  return stats;
}
