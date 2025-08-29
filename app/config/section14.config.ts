/**
 * Section 14 Configuration
 * Auto-generated from integration data
 * Generated: 2025-08-19T15:43:29.481Z
 */

import { BaseSectionConfig } from './section-base.config';

export class Section14Config extends BaseSectionConfig {
  metadata = {
    id: 14,
    name: 'Section 14',
    description: '',
    totalFields: 0,
    pageRange: []
  };

  fields = {
    ids: {},
    names: {},
    mappings: {
  'section14.bornMaleAfter1959': 'form1[0].Section14_1[0].#area[0].RadioButtonList[0]',
  'section14.registrationStatus': 'form1[0].Section14_1[0].#area[17].RadioButtonList[10]',
  'section14.registrationNumber': 'form1[0].Section14_1[0].TextField11[0]',
  'section14.noRegistrationExplanation': 'form1[0].Section14_1[0].TextField11[1]',
  'section14.unknownStatusExplanation': 'form1[0].Section14_1[0].TextField11[2]'
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

export const section14Config = new Section14Config();
