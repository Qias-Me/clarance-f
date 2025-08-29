/**
 * Section 8 Configuration
 * Auto-generated from integration data
 * Generated: 2025-08-19T15:43:29.460Z
 */

import { BaseSectionConfig } from './section-base.config';

export class Section8Config extends BaseSectionConfig {
  metadata = {
    id: 8,
    name: 'Section 8',
    description: '',
    totalFields: 0,
    pageRange: []
  };

  fields = {
    ids: {},
    names: {},
    mappings: {
  'section8.hasPassport': 'form1[0].Sections7-9[0].RadioButtonList[0]',
  'section8.passportNumber': 'form1[0].Sections7-9[0].p3-t68[0]',
  'section8.nameOnPassport.lastName': 'form1[0].Sections7-9[0].TextField11[1]',
  'section8.nameOnPassport.firstName': 'form1[0].Sections7-9[0].TextField11[2]',
  'section8.nameOnPassport.middleName': 'form1[0].Sections7-9[0].TextField11[0]',
  'section8.nameOnPassport.suffix': 'form1[0].Sections7-9[0].suffix[0]',
  'section8.dates.issueDate.date': 'form1[0].Sections7-9[0].#area[0].From_Datefield_Name_2[0]',
  'section8.dates.issueDate.estimated': 'form1[0].Sections7-9[0].#area[0].#field[4]',
  'section8.dates.expirationDate.date': 'form1[0].Sections7-9[0].#area[0].To_Datefield_Name_2[0]',
  'section8.dates.expirationDate.estimated': 'form1[0].Sections7-9[0].#field[23]'
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

export const section8Config = new Section8Config();
