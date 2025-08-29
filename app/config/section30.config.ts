/**
 * Section 30 Configuration
 * Auto-generated from integration data
 * Generated: 2025-08-19T15:58:30.736Z
 */

import { BaseSectionConfig } from './section-base.config';

export class Section30Config extends BaseSectionConfig {
  metadata = {
    id: 30,
    name: 'Section 30',
    description: '',
    totalFields: 0,
    pageRange: []
  };

  fields = {
    ids: {},
    names: {},
    mappings: {
  'section30.section30.continuationSheet': 'form1[0].continuation1[0].p15-t28[0]',
  'section30.section30.dateSignedPage1': 'form1[0].continuation1[0].p17-t2[0]',
  'section30.section30.personalInfo.fullName': 'form1[0].continuation2[0].p17-t1[0]',
  'section30.section30.personalInfo.dateSigned': 'form1[0].continuation2[0].p17-t2[0]',
  'section30.section30.personalInfo.otherNamesUsed': 'form1[0].continuation2[0].p17-t3[0]',
  'section30.section30.personalInfo.dateOfBirth': 'form1[0].continuation2[0].p17-t4[0]',
  'section30.section30.personalInfo.currentAddress.street': 'form1[0].continuation2[0].p17-t6[0]',
  'section30.section30.personalInfo.currentAddress.city': 'form1[0].continuation2[0].p17-t8[0]',
  'section30.section30.personalInfo.currentAddress.state': 'form1[0].continuation2[0].p17-t9[0]',
  'section30.section30.personalInfo.currentAddress.zipCode': 'form1[0].continuation2[0].p17-t10[0]',
  'section30.section30.personalInfo.currentAddress.telephoneNumber': 'form1[0].continuation2[0].p17-t11[0]',
  'section30.section30.medicalInfo.radioButtonOption': 'form1[0].continuation3[0].RadioButtonList[0]',
  'section30.section30.medicalInfo.whatIsPrognosis': 'form1[0].continuation3[0].TextField1[0]',
  'section30.section30.medicalInfo.natureOfCondition': 'form1[0].continuation3[0].TextField1[1]',
  'section30.section30.medicalInfo.datesOfTreatment': 'form1[0].continuation3[0].TextField1[2]',
  'section30.section30.page3PersonalInfo.fullName': 'form1[0].continuation3[0].p17-t1[0]',
  'section30.section30.page3PersonalInfo.dateSigned': 'form1[0].continuation3[0].p17-t2[0]',
  'section30.section30.page3PersonalInfo.otherNamesUsed': 'form1[0].continuation3[0].p17-t3[0]',
  'section30.section30.page3PersonalInfo.currentAddress.street': 'form1[0].continuation3[0].p17-t6[0]',
  'section30.section30.page3PersonalInfo.currentAddress.city': 'form1[0].continuation3[0].p17-t8[0]',
  'section30.section30.page3PersonalInfo.currentAddress.state': 'form1[0].continuation3[0].p17-t9[0]',
  'section30.section30.page3PersonalInfo.currentAddress.zipCode': 'form1[0].continuation3[0].p17-t10[0]',
  'section30.section30.page3PersonalInfo.currentAddress.telephoneNumber': 'form1[0].continuation3[0].p17-t11[0]',
  'section30.section30.page4Info.printName': 'form1[0].continuation4[0].p17-t1[0]',
  'section30.section30.page4Info.dateSigned': 'form1[0].continuation4[0].p17-t2[0]'
}
  };

  validation = {
    rules: {},
    messages: {
      required: {},
      invalid: {},
      warnings: {}
    },
    confidence: {
      high: 0.8,
      medium: 0.5,
      low: 0.3,
      warningThreshold: 0.5
    }
  };
}

export const section30Config = new Section30Config();
