/**
 * Section 15 Configuration
 * Auto-generated from integration data
 * Generated: 2025-08-19T15:43:29.483Z
 */

import { BaseSectionConfig } from './section-base.config';

export class Section15Config extends BaseSectionConfig {
  metadata = {
    id: 15,
    name: 'Section 15',
    description: '',
    totalFields: 0,
    pageRange: []
  };

  fields = {
    ids: {},
    names: {},
    mappings: {
  'section15.hasServed': 'form1[0].Sections1-6[0].section5[0].RadioButtonList[0]',
  'section15.militaryService[0].serviceNumber': 'form1[0].#subform[71].TextField11[72]',
  'section15.militaryService[0].dates.from': 'form1[0].#subform[74].From_Datefield_Name_2[16]',
  'section15.militaryService[0].dates.to': 'form1[0].#subform[74].From_Datefield_Name_2[17]',
  'section15.militaryService[0].rank.initial': 'form1[0].#subform[71].TextField11[73]',
  'section15.militaryService[0].rank.final': 'form1[0].#subform[72].TextField11[74]',
  'section15.militaryService[0].militaryOccupation': 'form1[0].#subform[72].TextField11[75]',
  'section15.militaryService[0].discharge.date': 'form1[0].#subform[77].#area[17].From_Datefield_Name_2[18]',
  'section15.militaryService[0].disciplinaryAction.hasAction': 'form1[0].Section10\\.1-10\\.2[0].RadioButtonList[5]',
  'section15.militaryService[0].disciplinaryAction.details': 'form1[0].#subform[72].TextField11[76]',
  'section15.militaryService[1].serviceNumber': 'form1[0].#subform[71].TextField11[72]',
  'section15.militaryService[1].dates.from': 'form1[0].#subform[74].From_Datefield_Name_2[16]',
  'section15.militaryService[1].dates.to': 'form1[0].#subform[74].From_Datefield_Name_2[17]',
  'section15.militaryService[1].rank.initial': 'form1[0].#subform[71].TextField11[73]',
  'section15.militaryService[1].rank.final': 'form1[0].#subform[72].TextField11[74]',
  'section15.militaryService[1].militaryOccupation': 'form1[0].#subform[72].TextField11[75]',
  'section15.militaryService[1].discharge.date': 'form1[0].#subform[77].#area[17].From_Datefield_Name_2[18]',
  'section15.militaryService[1].disciplinaryAction.hasAction': 'form1[0].Section10\\.1-10\\.2[0].RadioButtonList[5]',
  'section15.militaryService[1].disciplinaryAction.details': 'form1[0].#subform[72].TextField11[76]',
  'section15.militaryService[2].serviceNumber': 'form1[0].#subform[71].TextField11[72]',
  'section15.militaryService[2].dates.from': 'form1[0].#subform[74].From_Datefield_Name_2[16]',
  'section15.militaryService[2].dates.to': 'form1[0].#subform[74].From_Datefield_Name_2[17]',
  'section15.militaryService[2].rank.initial': 'form1[0].#subform[71].TextField11[73]',
  'section15.militaryService[2].rank.final': 'form1[0].#subform[72].TextField11[74]',
  'section15.militaryService[2].militaryOccupation': 'form1[0].#subform[72].TextField11[75]',
  'section15.militaryService[2].discharge.date': 'form1[0].#subform[77].#area[17].From_Datefield_Name_2[18]',
  'section15.militaryService[2].disciplinaryAction.hasAction': 'form1[0].Section10\\.1-10\\.2[0].RadioButtonList[5]',
  'section15.militaryService[2].disciplinaryAction.details': 'form1[0].#subform[72].TextField11[76]',
  'section15.militaryService[3].serviceNumber': 'form1[0].#subform[71].TextField11[72]',
  'section15.militaryService[3].dates.from': 'form1[0].#subform[74].From_Datefield_Name_2[16]',
  'section15.militaryService[3].dates.to': 'form1[0].#subform[74].From_Datefield_Name_2[17]',
  'section15.militaryService[3].rank.initial': 'form1[0].#subform[71].TextField11[73]',
  'section15.militaryService[3].rank.final': 'form1[0].#subform[72].TextField11[74]',
  'section15.militaryService[3].militaryOccupation': 'form1[0].#subform[72].TextField11[75]',
  'section15.militaryService[3].discharge.date': 'form1[0].#subform[77].#area[17].From_Datefield_Name_2[18]',
  'section15.militaryService[3].disciplinaryAction.hasAction': 'form1[0].Section10\\.1-10\\.2[0].RadioButtonList[5]',
  'section15.militaryService[3].disciplinaryAction.details': 'form1[0].#subform[72].TextField11[76]',
  'section15.militaryService[4].serviceNumber': 'form1[0].#subform[71].TextField11[72]',
  'section15.militaryService[4].dates.from': 'form1[0].#subform[74].From_Datefield_Name_2[16]',
  'section15.militaryService[4].dates.to': 'form1[0].#subform[74].From_Datefield_Name_2[17]',
  'section15.militaryService[4].rank.initial': 'form1[0].#subform[71].TextField11[73]',
  'section15.militaryService[4].rank.final': 'form1[0].#subform[72].TextField11[74]',
  'section15.militaryService[4].militaryOccupation': 'form1[0].#subform[72].TextField11[75]',
  'section15.militaryService[4].discharge.date': 'form1[0].#subform[77].#area[17].From_Datefield_Name_2[18]',
  'section15.militaryService[4].disciplinaryAction.hasAction': 'form1[0].Section10\\.1-10\\.2[0].RadioButtonList[5]',
  'section15.militaryService[4].disciplinaryAction.details': 'form1[0].#subform[72].TextField11[76]',
  'section15.courtMartial.hasCourtMartial': 'form1[0].Section10\\.1-10\\.2[0].RadioButtonList[6]',
  'section15.courtMartial.details': 'form1[0].#subform[74].TextField11[90]',
  'section15.courtMartial.date': 'form1[0].#subform[77].#area[19].From_Datefield_Name_2[20]',
  'section15.militaryService[0].branch': 'form1[0].Sections1-6[0].section5[0].TextField11[0]',
  'section15.militaryService[0].component': 'form1[0].Sections1-6[0].section5[0].TextField11[1]',
  'section15.militaryService[0].officer': 'form1[0].Sections1-6[0].section5[0].TextField11[2]',
  'section15.militaryService[0].enlisted': 'form1[0].Sections1-6[0].section5[0].TextField11[3]',
  'section15.militaryService[0].dates.estimated': 'form1[0].Sections1-6[0].section5[0].#area[0].From_Datefield_Name_2[0]',
  'section15.militaryService[0].discharge.type': 'form1[0].Sections1-6[0].section5[0].#area[0].To_Datefield_Name_2[0]',
  'section15.militaryService[0].discharge.dateEstimated': 'form1[0].Sections1-6[0].section5[0].suffix[0]',
  'section15.militaryService[0].foreignService': 'form1[0].Sections1-6[0].section5[0].#field[7]',
  'section15.militaryService[0].combatDuty': 'form1[0].Sections1-6[0].section5[0].#field[8]'
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

export const section15Config = new Section15Config();
