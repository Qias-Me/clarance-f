/**
 * Section 28 Configuration
 * Auto-generated from integration data
 * Generated: 2025-08-19T15:43:29.488Z
 */

import { BaseSectionConfig } from './section-base.config';

export class Section28Config extends BaseSectionConfig {
  metadata = {
    id: 28,
    name: 'Section 28',
    description: '',
    totalFields: 0,
    pageRange: []
  };

  fields = {
    ids: {},
    names: {},
    mappings: {
  'section28.hasCourtActions': 'form1[0].Section28[0].RadioButtonList[0]',
  'section28.courtActionEntries[0].dateOfAction.date': 'form1[0].Section28[0].From_Datefield_Name_2[0]',
  'section28.courtActionEntries[0].dateOfAction.estimated': 'form1[0].Section28[0].#field[12]',
  'section28.courtActionEntries[0].courtName': 'form1[0].Section28[0].TextField11[1]',
  'section28.courtActionEntries[0].natureOfAction': 'form1[0].Section28[0].TextField11[0]',
  'section28.courtActionEntries[0].resultsDescription': 'form1[0].Section28[0].TextField11[2]',
  'section28.courtActionEntries[0].principalParties': 'form1[0].Section28[0].TextField11[3]',
  'section28.courtActionEntries[0].courtAddress.street': 'form1[0].Section28[0].TextField11[4]',
  'section28.courtActionEntries[0].courtAddress.city': 'form1[0].Section28[0].TextField11[5]',
  'section28.courtActionEntries[0].courtAddress.state': 'form1[0].Section28[0].School6_State[0]',
  'section28.courtActionEntries[0].courtAddress.zipCode': 'form1[0].Section28[0].TextField11[6]',
  'section28.courtActionEntries[0].courtAddress.country': 'form1[0].Section28[0].DropDownList142[0]',
  'section28.courtActionEntries[1].dateOfAction.date': 'form1[0].Section28[0].From_Datefield_Name_2[1]',
  'section28.courtActionEntries[1].dateOfAction.estimated': 'form1[0].Section28[0].#field[23]',
  'section28.courtActionEntries[1].courtName': 'form1[0].Section28[0].TextField11[8]',
  'section28.courtActionEntries[1].natureOfAction': 'form1[0].Section28[0].TextField11[7]',
  'section28.courtActionEntries[1].resultsDescription': 'form1[0].Section28[0].TextField11[9]',
  'section28.courtActionEntries[1].principalParties': 'form1[0].Section28[0].TextField11[10]',
  'section28.courtActionEntries[1].courtAddress.street': 'form1[0].Section28[0].TextField11[11]',
  'section28.courtActionEntries[1].courtAddress.city': 'form1[0].Section28[0].TextField11[12]',
  'section28.courtActionEntries[1].courtAddress.state': 'form1[0].Section28[0].School6_State[1]',
  'section28.courtActionEntries[1].courtAddress.zipCode': 'form1[0].Section28[0].TextField11[13]',
  'section28.courtActionEntries[1].courtAddress.country': 'form1[0].Section28[0].DropDownList7[0]'
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

export const section28Config = new Section28Config();
