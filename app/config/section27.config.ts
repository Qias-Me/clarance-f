/**
 * Section 27 Configuration
 * Auto-generated from integration data
 * Generated: 2025-08-19T15:43:29.485Z
 */

import { BaseSectionConfig } from './section-base.config';

export class Section27Config extends BaseSectionConfig {
  metadata = {
    id: 27,
    name: 'Section 27',
    description: '',
    totalFields: 0,
    pageRange: []
  };

  fields = {
    ids: {},
    names: {},
    mappings: {
  'section27.illegalAccess.hasViolation': 'form1[0].Section27[0].RadioButtonList[0]',
  'section27.illegalModification.hasViolation': 'form1[0].Section27_2[0].RadioButtonList[0]',
  'section27.unauthorizedEntry.hasViolation': 'form1[0].Section27[0].RadioButtonList[1]',
  'section27.illegalAccess.entries[0].location.street': 'form1[0].Section27[0].#area[0].TextField11[0]',
  'section27.illegalAccess.entries[0].location.city': 'form1[0].Section27[0].#area[0].TextField11[1]',
  'section27.illegalAccess.entries[0].location.state': 'form1[0].Section27[0].#area[0].School6_State[0]',
  'section27.illegalAccess.entries[0].location.country': 'form1[0].Section27[0].#area[0].DropDownList12[0]',
  'section27.illegalAccess.entries[0].location.zipCode': 'form1[0].Section27[0].#area[0].TextField11[2]',
  'section27.illegalAccess.entries[0].incidentDate.date': 'form1[0].Section27[0].From_Datefield_Name_2[0]',
  'section27.illegalAccess.entries[0].incidentDate.estimated': 'form1[0].Section27[0].#field[8]',
  'section27.illegalAccess.entries[0].description': 'form1[0].Section27[0].TextField11[4]',
  'section27.illegalAccess.entries[0].actionTaken': 'form1[0].Section27[0].TextField11[3]',
  'section27.illegalAccess.entries[1].location.street': 'form1[0].Section27[0].#area[1].TextField11[5]',
  'section27.illegalAccess.entries[1].location.city': 'form1[0].Section27[0].#area[1].TextField11[6]',
  'section27.illegalAccess.entries[1].location.state': 'form1[0].Section27[0].#area[1].School6_State[1]',
  'section27.illegalAccess.entries[1].location.country': 'form1[0].Section27[0].#area[1].DropDownList11[0]',
  'section27.illegalAccess.entries[1].location.zipCode': 'form1[0].Section27[0].#area[1].TextField11[7]',
  'section27.illegalAccess.entries[1].incidentDate.date': 'form1[0].Section27[0].From_Datefield_Name_2[1]',
  'section27.illegalAccess.entries[1].incidentDate.estimated': 'form1[0].Section27[0].#field[17]',
  'section27.illegalAccess.entries[1].description': 'form1[0].Section27[0].TextField11[9]',
  'section27.illegalAccess.entries[1].actionTaken': 'form1[0].Section27[0].TextField11[8]',
  'section27.illegalModification.entries[0].location.street': 'form1[0].Section27_2[0].#area[0].TextField11[0]',
  'section27.illegalModification.entries[0].location.city': 'form1[0].Section27_2[0].#area[0].TextField11[1]',
  'section27.illegalModification.entries[0].location.state': 'form1[0].Section27_2[0].#area[0].School6_State[0]',
  'section27.illegalModification.entries[0].location.country': 'form1[0].Section27_2[0].#area[0].DropDownList9[0]',
  'section27.illegalModification.entries[0].location.zipCode': 'form1[0].Section27_2[0].#area[0].TextField11[2]',
  'section27.illegalModification.entries[0].incidentDate.date': 'form1[0].Section27_2[0].From_Datefield_Name_2[0]',
  'section27.illegalModification.entries[0].incidentDate.estimated': 'form1[0].Section27_2[0].#field[8]',
  'section27.illegalModification.entries[0].description': 'form1[0].Section27_2[0].TextField11[4]',
  'section27.illegalModification.entries[0].actionTaken': 'form1[0].Section27_2[0].TextField11[3]',
  'section27.illegalModification.entries[1].location.street': 'form1[0].Section27_2[0].#area[1].TextField11[5]',
  'section27.illegalModification.entries[1].location.city': 'form1[0].Section27_2[0].#area[1].TextField11[6]',
  'section27.illegalModification.entries[1].location.state': 'form1[0].Section27_2[0].#area[1].School6_State[1]',
  'section27.illegalModification.entries[1].location.country': 'form1[0].Section27_2[0].#area[1].DropDownList8[0]',
  'section27.illegalModification.entries[1].location.zipCode': 'form1[0].Section27_2[0].#area[1].TextField11[7]',
  'section27.illegalModification.entries[1].incidentDate.date': 'form1[0].Section27_2[0].From_Datefield_Name_2[1]',
  'section27.illegalModification.entries[1].incidentDate.estimated': 'form1[0].Section27_2[0].#field[17]',
  'section27.illegalModification.entries[1].description': 'form1[0].Section27_2[0].TextField11[9]',
  'section27.illegalModification.entries[1].actionTaken': 'form1[0].Section27_2[0].TextField11[8]',
  'section27.unauthorizedEntry.entries[0].location.street': 'form1[0].Section27[0].#area[2].TextField11[10]',
  'section27.unauthorizedEntry.entries[0].location.city': 'form1[0].Section27[0].#area[2].TextField11[11]',
  'section27.unauthorizedEntry.entries[0].location.state': 'form1[0].Section27[0].#area[2].School6_State[2]',
  'section27.unauthorizedEntry.entries[0].location.country': 'form1[0].Section27[0].#area[2].DropDownList10[0]',
  'section27.unauthorizedEntry.entries[0].location.zipCode': 'form1[0].Section27[0].#area[2].TextField11[12]',
  'section27.unauthorizedEntry.entries[0].incidentDate.date': 'form1[0].Section27[0].From_Datefield_Name_2[2]',
  'section27.unauthorizedEntry.entries[0].incidentDate.estimated': 'form1[0].Section27[0].#field[26]',
  'section27.unauthorizedEntry.entries[0].description': 'form1[0].Section27[0].TextField11[14]',
  'section27.unauthorizedEntry.entries[0].actionTaken': 'form1[0].Section27[0].TextField11[13]',
  'section27.unauthorizedEntry.entries[1].location.street': 'form1[0].Section27[0].#area[3].TextField11[15]',
  'section27.unauthorizedEntry.entries[1].location.city': 'form1[0].Section27[0].#area[3].TextField11[16]',
  'section27.unauthorizedEntry.entries[1].location.state': 'form1[0].Section27[0].#area[3].School6_State[3]',
  'section27.unauthorizedEntry.entries[1].location.country': 'form1[0].Section27[0].#area[3].DropDownList13[0]',
  'section27.unauthorizedEntry.entries[1].location.zipCode': 'form1[0].Section27[0].#area[3].TextField11[17]',
  'section27.unauthorizedEntry.entries[1].incidentDate.date': 'form1[0].Section27[0].From_Datefield_Name_2[3]',
  'section27.unauthorizedEntry.entries[1].incidentDate.estimated': 'form1[0].Section27[0].#field[35]',
  'section27.unauthorizedEntry.entries[1].description': 'form1[0].Section27[0].TextField11[19]',
  'section27.unauthorizedEntry.entries[1].actionTaken': 'form1[0].Section27[0].TextField11[18]'
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

export const section27Config = new Section27Config();
