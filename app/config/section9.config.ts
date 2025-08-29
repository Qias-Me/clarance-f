/**
 * Section 9 Configuration
 * Auto-generated from integration data
 * Generated: 2025-08-19T15:43:29.462Z
 */

import { BaseSectionConfig } from './section-base.config';

export class Section9Config extends BaseSectionConfig {
  metadata = {
    id: 9,
    name: 'Section 9',
    description: '',
    totalFields: 0,
    pageRange: []
  };

  fields = {
    ids: {},
    names: {},
    mappings: {
  'section9.status': 'form1[0].Sections7-9[0].RadioButtonList[1]',
  'section9.bornToUSParents.documentType': 'form1[0].Sections7-9[0].RadioButtonList[3]',
  'section9.bornToUSParents.otherExplanation': 'form1[0].Sections7-9[0].TextField11[3]',
  'section9.bornToUSParents.documentNumber': 'form1[0].Sections7-9[0].TextField11[4]',
  'section9.bornToUSParents.documentIssueDate': 'form1[0].Sections7-9[0].From_Datefield_Name_2[1]',
  'section9.bornToUSParents.isIssueDateEstimated': 'form1[0].Sections7-9[0].#field[25]',
  'section9.bornToUSParents.issueCity': 'form1[0].Sections7-9[0].TextField11[5]',
  'section9.bornToUSParents.issueState': 'form1[0].Sections7-9[0].School6_State[0]',
  'section9.bornToUSParents.issueCountry': 'form1[0].Sections7-9[0].DropDownList12[0]',
  'section9.bornToUSParents.nameOnDocument.lastName': 'form1[0].Sections7-9[0].TextField11[7]',
  'section9.bornToUSParents.nameOnDocument.firstName': 'form1[0].Sections7-9[0].TextField11[8]',
  'section9.bornToUSParents.nameOnDocument.middleName': 'form1[0].Sections7-9[0].TextField11[6]',
  'section9.bornToUSParents.nameOnDocument.suffix': 'form1[0].Sections7-9[0].suffix[1]',
  'section9.bornToUSParents.nameOnCertificate.lastName': 'form1[0].Sections7-9[0].TextField11[10]',
  'section9.bornToUSParents.nameOnCertificate.firstName': 'form1[0].Sections7-9[0].TextField11[11]',
  'section9.bornToUSParents.nameOnCertificate.middleName': 'form1[0].Sections7-9[0].TextField11[9]',
  'section9.bornToUSParents.nameOnCertificate.suffix': 'form1[0].Sections7-9[0].suffix[2]',
  'section9.bornToUSParents.wasBornOnMilitaryInstallation': 'form1[0].Sections7-9[0].RadioButtonList[2]',
  'section9.bornToUSParents.militaryBaseName': 'form1[0].Sections7-9[0].TextField11[18]',
  'section9.naturalizedCitizen.naturalizedCertificateNumber': 'form1[0].Section9\\.1-9\\.4[0].TextField11[6]',
  'section9.naturalizedCitizen.nameOnCertificate.lastName': 'form1[0].Section9\\.1-9\\.4[0].TextField11[2]',
  'section9.naturalizedCitizen.nameOnCertificate.firstName': 'form1[0].Section9\\.1-9\\.4[0].TextField11[3]',
  'section9.naturalizedCitizen.nameOnCertificate.middleName': 'form1[0].Section9\\.1-9\\.4[0].TextField11[1]',
  'section9.naturalizedCitizen.nameOnCertificate.suffix': 'form1[0].Section9\\.1-9\\.4[0].suffix[0]',
  'section9.naturalizedCitizen.courtAddress.street': 'form1[0].Section9\\.1-9\\.4[0].TextField11[4]',
  'section9.naturalizedCitizen.courtAddress.city': 'form1[0].Section9\\.1-9\\.4[0].TextField11[0]',
  'section9.naturalizedCitizen.courtAddress.state': 'form1[0].Section9\\.1-9\\.4[0].School6_State[0]',
  'section9.naturalizedCitizen.courtAddress.zipCode': 'form1[0].Section9\\.1-9\\.4[0].TextField11[5]',
  'section9.naturalizedCitizen.courtName': 'form1[0].Section9\\.1-9\\.4[0].TextField11[15]',
  'section9.naturalizedCitizen.certificateIssueDate': 'form1[0].Section9\\.1-9\\.4[0].From_Datefield_Name_2[0]',
  'section9.naturalizedCitizen.isCertificateDateEstimated': 'form1[0].Section9\\.1-9\\.4[0].#field[10]',
  'section9.naturalizedCitizen.otherExplanation': 'form1[0].Section9\\.1-9\\.4[0].TextField11[7]',
  'section9.naturalizedCitizen.entryDate': 'form1[0].Section9\\.1-9\\.4[0].From_Datefield_Name_2[4]',
  'section9.naturalizedCitizen.isEntryDateEstimated': 'form1[0].Section9\\.1-9\\.4[0].#field[32]',
  'section9.naturalizedCitizen.entryCity': 'form1[0].Section9\\.1-9\\.4[0].TextField11[16]',
  'section9.naturalizedCitizen.entryState': 'form1[0].Section9\\.1-9\\.4[0].School6_State[1]',
  'section9.naturalizedCitizen.priorCitizenship': 'form1[0].Section9\\.1-9\\.4[0].DropDownList15[0]',
  'section9.naturalizedCitizen.priorCitizenship2': 'form1[0].Section9\\.1-9\\.4[0].DropDownList15[1]',
  'section9.naturalizedCitizen.priorCitizenship3': 'form1[0].Section9\\.1-9\\.4[0].DropDownList15[2]',
  'section9.naturalizedCitizen.priorCitizenship4': 'form1[0].Section9\\.1-9\\.4[0].DropDownList15[3]',
  'section9.naturalizedCitizen.hasAlienRegistrationRadio': 'form1[0].Section9\\.1-9\\.4[0].RadioButtonList[1]',
  'section9.naturalizedCitizen.alienRegistrationNumber': 'form1[0].Section9\\.1-9\\.4[0].TextField11[9]',
  'section9.derivedCitizen.alienRegistrationNumber': 'form1[0].Section9\\.1-9\\.4[0].TextField11[17]',
  'section9.derivedCitizen.permanentResidentCardNumber': 'form1[0].Section9\\.1-9\\.4[0].TextField11[18]',
  'section9.derivedCitizen.certificateOfCitizenshipNumber': 'form1[0].Section9\\.1-9\\.4[0].TextField11[19]',
  'section9.derivedCitizen.nameOnDocument.firstName': 'form1[0].Section9\\.1-9\\.4[0].TextField11[20]',
  'section9.derivedCitizen.nameOnDocument.middleName': 'form1[0].Section9\\.1-9\\.4[0].TextField11[21]',
  'section9.derivedCitizen.nameOnDocument.lastName': 'form1[0].Section9\\.1-9\\.4[0].TextField11[22]',
  'section9.derivedCitizen.nameOnDocument.suffix': 'form1[0].Section9\\.1-9\\.4[0].suffix[2]',
  'section9.derivedCitizen.basis': 'form1[0].Section9\\.1-9\\.4[0].RadioButtonList[1]',
  'section9.derivedCitizen.otherExplanation': 'form1[0].Section9\\.1-9\\.4[0].TextField11[23]',
  'section9.derivedCitizen.documentIssueDate': 'form1[0].Section9\\.1-9\\.4[0].From_Datefield_Name_2[5]',
  'section9.derivedCitizen.isDocumentIssueDateEstimated': 'form1[0].Section9\\.1-9\\.4[0].#field[50]',
  'section9.derivedCitizen.isBasisEstimated': 'form1[0].Section9\\.1-9\\.4[0].#field[51]',
  'section9.derivedCitizen.isDateEstimated': 'form1[0].Section9\\.1-9\\.4[0].#field[53]',
  'section9.derivedCitizen.additionalFirstName': 'form1[0].Section9\\.1-9\\.4[0].TextField11[24]',
  'section9.derivedCitizen.additionalExplanation': 'form1[0].Section9\\.1-9\\.4[0].TextField11[25]',
  'section9.derivedCitizen.otherProvideExplanation': 'form1[0].Section9\\.1-9\\.4[0].#field[27]',
  'section9.derivedCitizen.basisOfNaturalization': 'form1[0].Section9\\.1-9\\.4[0].#field[28]',
  'section9.nonUSCitizen.residenceStatus': 'form1[0].Section9\\.1-9\\.4[0].TextField11[8]',
  'section9.nonUSCitizen.entryDate': 'form1[0].Section9\\.1-9\\.4[0].From_Datefield_Name_2[1]',
  'section9.nonUSCitizen.isEntryDateEstimated': 'form1[0].Section9\\.1-9\\.4[0].#field[15]',
  'section9.nonUSCitizen.alienRegistrationNumber': 'form1[0].Section9\\.1-9\\.4[0].TextField11[9]',
  'section9.nonUSCitizen.documentIssueDate': 'form1[0].Section9\\.1-9\\.4[0].From_Datefield_Name_2[2]',
  'section9.nonUSCitizen.isDocumentIssueDateEstimated': 'form1[0].Section9\\.1-9\\.4[0].#field[18]',
  'section9.nonUSCitizen.documentExpirationDate': 'form1[0].Section9\\.1-9\\.4[0].From_Datefield_Name_2[3]',
  'section9.nonUSCitizen.isDocumentExpirationEstimated': 'form1[0].Section9\\.1-9\\.4[0].#field[26]',
  'section9.nonUSCitizen.nameOnDocument.firstName': 'form1[0].Section9\\.1-9\\.4[0].TextField11[12]',
  'section9.nonUSCitizen.nameOnDocument.middleName': 'form1[0].Section9\\.1-9\\.4[0].TextField11[10]',
  'section9.nonUSCitizen.nameOnDocument.lastName': 'form1[0].Section9\\.1-9\\.4[0].TextField11[11]',
  'section9.nonUSCitizen.nameOnDocument.suffix': 'form1[0].Section9\\.1-9\\.4[0].suffix[1]',
  'section9.nonUSCitizen.documentNumber': 'form1[0].Section9\\.1-9\\.4[0].TextField11[13]',
  'section9.nonUSCitizen.hasAlienRegistration': 'form1[0].Section9\\.1-9\\.4[0].RadioButtonList[0]',
  'section9.nonUSCitizen.explanation': 'form1[0].Section9\\.1-9\\.4[0].TextField11[14]',
  'section9.nonUSCitizen.additionalDocumentExpirationDate': 'form1[0].Section9\\.1-9\\.4[0].From_Datefield_Name_2[6]',
  'section9.nonUSCitizen.isAdditionalDocumentExpirationEstimated': 'form1[0].Section9\\.1-9\\.4[0].#field[55]',
  'section9.nonUSCitizen.entryCity': 'form1[0].Section9\\.1-9\\.4[0].TextField11[18]',
  'section9.nonUSCitizen.entryState': 'form1[0].Section9\\.1-9\\.4[0].School6_State[2]'
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

export const section9Config = new Section9Config();
