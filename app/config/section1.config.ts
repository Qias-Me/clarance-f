/**
 * Section 1 Configuration
 * Auto-generated from integration data
 * Generated: 2025-08-19T15:43:29.435Z
 */

import { BaseSectionConfig } from './section-base.config';

export class Section1Config extends BaseSectionConfig {
  metadata = {
    id: 1,
    name: 'Section 1',
    description: '',
    totalFields: 0,
    pageRange: []
  };

  fields = {
    ids: {},
    names: {},
    mappings: {
  'section1.lastName': 'form1[0].Sections1-6[0].TextField11[0]',
  'section1.firstName': 'form1[0].Sections1-6[0].TextField11[1]',
  'section1.middleName': 'form1[0].Sections1-6[0].TextField11[2]',
  'section1.suffix': 'form1[0].Sections1-6[0].suffix[0]'
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

export const section1Config = new Section1Config();
