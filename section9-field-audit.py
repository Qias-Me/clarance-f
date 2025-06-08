#!/usr/bin/env python3
"""
Section 9 Comprehensive Field Mapping Audit
Creates a detailed checklist ensuring 100% coverage from Section9.json
"""

import json

def main():
    # Load section-9.json
    with open('api/sections-references/section-9.json', 'r') as f:
        data = json.load(f)

    print('=== SECTION 9 COMPREHENSIVE FIELD MAPPING AUDIT ===')
    print()

    # Define ALL implemented fields from interface analysis (complete list)
    implemented_field_names = {
        # Main status (1 field)
        'form1[0].Sections7-9[0].RadioButtonList[1]': 'section9.status',
        
        # Born to US Parents (9.1) - 21 fields
        'form1[0].Sections7-9[0].RadioButtonList[3]': 'section9.bornToUSParents.documentType',
        'form1[0].Sections7-9[0].TextField11[3]': 'section9.bornToUSParents.otherExplanation',
        'form1[0].Sections7-9[0].TextField11[4]': 'section9.bornToUSParents.documentNumber',
        'form1[0].Sections7-9[0].From_Datefield_Name_2[1]': 'section9.bornToUSParents.documentIssueDate',
        'form1[0].Sections7-9[0].#field[25]': 'section9.bornToUSParents.isIssueDateEstimated',
        'form1[0].Sections7-9[0].TextField11[5]': 'section9.bornToUSParents.issueCity',
        'form1[0].Sections7-9[0].School6_State[0]': 'section9.bornToUSParents.issueState',
        'form1[0].Sections7-9[0].DropDownList12[0]': 'section9.bornToUSParents.issueCountry',
        'form1[0].Sections7-9[0].TextField11[8]': 'section9.bornToUSParents.nameOnDocument.firstName',
        'form1[0].Sections7-9[0].TextField11[6]': 'section9.bornToUSParents.nameOnDocument.middleName',
        'form1[0].Sections7-9[0].TextField11[7]': 'section9.bornToUSParents.nameOnDocument.lastName',
        'form1[0].Sections7-9[0].suffix[1]': 'section9.bornToUSParents.nameOnDocument.suffix',
        'form1[0].Sections7-9[0].RadioButtonList[2]': 'section9.bornToUSParents.wasBornOnMilitaryInstallation',
        'form1[0].Sections7-9[0].TextField11[18]': 'section9.bornToUSParents.militaryBaseName',
        'form1[0].Sections7-9[0].TextField11[12]': 'section9.bornToUSParents.certificateNumber',
        'form1[0].Sections7-9[0].From_Datefield_Name_2[2]': 'section9.bornToUSParents.certificateIssueDate',
        'form1[0].Sections7-9[0].#field[28]': 'section9.bornToUSParents.isCertificateDateEstimated',
        'form1[0].Sections7-9[0].TextField11[11]': 'section9.bornToUSParents.nameOnCertificate.firstName',
        'form1[0].Sections7-9[0].TextField11[9]': 'section9.bornToUSParents.nameOnCertificate.middleName',
        'form1[0].Sections7-9[0].TextField11[10]': 'section9.bornToUSParents.nameOnCertificate.lastName',
        'form1[0].Sections7-9[0].suffix[2]': 'section9.bornToUSParents.nameOnCertificate.suffix',
        
        # Naturalized Citizen (9.2) - 22 fields
        'form1[0].Section9\\.1-9\\.4[0].TextField11[6]': 'section9.naturalizedCitizen.naturalizedCertificateNumber',
        'form1[0].Section9\\.1-9\\.4[0].TextField11[3]': 'section9.naturalizedCitizen.nameOnCertificate.firstName',
        'form1[0].Section9\\.1-9\\.4[0].TextField11[1]': 'section9.naturalizedCitizen.nameOnCertificate.middleName',
        'form1[0].Section9\\.1-9\\.4[0].TextField11[2]': 'section9.naturalizedCitizen.nameOnCertificate.lastName',
        'form1[0].Section9\\.1-9\\.4[0].suffix[0]': 'section9.naturalizedCitizen.nameOnCertificate.suffix',
        'form1[0].Section9\\.1-9\\.4[0].TextField11[4]': 'section9.naturalizedCitizen.courtAddress.street',
        'form1[0].Section9\\.1-9\\.4[0].TextField11[0]': 'section9.naturalizedCitizen.courtAddress.city',
        'form1[0].Section9\\.1-9\\.4[0].School6_State[0]': 'section9.naturalizedCitizen.courtAddress.state',
        'form1[0].Section9\\.1-9\\.4[0].TextField11[5]': 'section9.naturalizedCitizen.courtAddress.zipCode',
        'form1[0].Section9\\.1-9\\.4[0].TextField11[15]': 'section9.naturalizedCitizen.courtName',
        'form1[0].Section9\\.1-9\\.4[0].From_Datefield_Name_2[0]': 'section9.naturalizedCitizen.certificateIssueDate',
        'form1[0].Section9\\.1-9\\.4[0].#field[10]': 'section9.naturalizedCitizen.isCertificateDateEstimated',
        'form1[0].Section9\\.1-9\\.4[0].TextField11[7]': 'section9.naturalizedCitizen.otherExplanation',
        'form1[0].Section9\\.1-9\\.4[0].From_Datefield_Name_2[4]': 'section9.naturalizedCitizen.entryDate',
        'form1[0].Section9\\.1-9\\.4[0].#field[32]': 'section9.naturalizedCitizen.isEntryDateEstimated',
        'form1[0].Section9\\.1-9\\.4[0].TextField11[16]': 'section9.naturalizedCitizen.entryCity',
        'form1[0].Section9\\.1-9\\.4[0].School6_State[1]': 'section9.naturalizedCitizen.entryState',
        'form1[0].Section9\\.1-9\\.4[0].DropDownList15[0]': 'section9.naturalizedCitizen.priorCitizenship',
        'form1[0].Section9\\.1-9\\.4[0].DropDownList15[1]': 'section9.naturalizedCitizen.priorCitizenship2',
        'form1[0].Section9\\.1-9\\.4[0].DropDownList15[2]': 'section9.naturalizedCitizen.priorCitizenship3',
        'form1[0].Section9\\.1-9\\.4[0].DropDownList15[3]': 'section9.naturalizedCitizen.priorCitizenship4',
        'form1[0].Section9\\.1-9\\.4[0].RadioButtonList[1]': 'section9.naturalizedCitizen.hasAlienRegistrationRadio',
        
        # Derived Citizen (9.3) - 13 fields
        'form1[0].Section9\\.1-9\\.4[0].TextField11[17]': 'section9.derivedCitizen.alienRegistrationNumber',
        'form1[0].Section9\\.1-9\\.4[0].TextField11[18]': 'section9.derivedCitizen.permanentResidentCardNumber',
        'form1[0].Section9\\.1-9\\.4[0].TextField11[19]': 'section9.derivedCitizen.certificateOfCitizenshipNumber',
        'form1[0].Section9\\.1-9\\.4[0].TextField11[20]': 'section9.derivedCitizen.nameOnDocument.firstName',
        'form1[0].Section9\\.1-9\\.4[0].TextField11[21]': 'section9.derivedCitizen.nameOnDocument.middleName',
        'form1[0].Section9\\.1-9\\.4[0].TextField11[22]': 'section9.derivedCitizen.nameOnDocument.lastName',
        'form1[0].Section9\\.1-9\\.4[0].suffix[2]': 'section9.derivedCitizen.nameOnDocument.suffix',
        'form1[0].Section9\\.1-9\\.4[0].TextField11[23]': 'section9.derivedCitizen.otherExplanation',
        'form1[0].Section9\\.1-9\\.4[0].From_Datefield_Name_2[5]': 'section9.derivedCitizen.documentIssueDate',
        'form1[0].Section9\\.1-9\\.4[0].#field[50]': 'section9.derivedCitizen.isDocumentIssueDateEstimated',
        'form1[0].Section9\\.1-9\\.4[0].#field[51]': 'section9.derivedCitizen.isBasisEstimated',
        'form1[0].Section9\\.1-9\\.4[0].#field[53]': 'section9.derivedCitizen.isDateEstimated',

        # Missing fields now added
        'form1[0].Section9\\.1-9\\.4[0].TextField11[24]': 'section9.derivedCitizen.additionalFirstName',
        'form1[0].Section9\\.1-9\\.4[0].TextField11[25]': 'section9.derivedCitizen.additionalExplanation',
        'form1[0].Section9\\.1-9\\.4[0].#field[27]': 'section9.derivedCitizen.otherProvideExplanation',
        'form1[0].Section9\\.1-9\\.4[0].#field[28]': 'section9.derivedCitizen.basisOfNaturalization',
        
        # Non-US Citizen (9.4) - 19 fields
        'form1[0].Section9\\.1-9\\.4[0].TextField11[8]': 'section9.nonUSCitizen.residenceStatus',
        'form1[0].Section9\\.1-9\\.4[0].From_Datefield_Name_2[1]': 'section9.nonUSCitizen.entryDate',
        'form1[0].Section9\\.1-9\\.4[0].#field[15]': 'section9.nonUSCitizen.isEntryDateEstimated',
        'form1[0].Section9\\.1-9\\.4[0].TextField11[9]': 'section9.nonUSCitizen.alienRegistrationNumber',
        'form1[0].Section9\\.1-9\\.4[0].From_Datefield_Name_2[2]': 'section9.nonUSCitizen.documentIssueDate',
        'form1[0].Section9\\.1-9\\.4[0].#field[18]': 'section9.nonUSCitizen.isDocumentIssueDateEstimated',
        'form1[0].Section9\\.1-9\\.4[0].From_Datefield_Name_2[3]': 'section9.nonUSCitizen.documentExpirationDate',
        'form1[0].Section9\\.1-9\\.4[0].#field[26]': 'section9.nonUSCitizen.isDocumentExpirationEstimated',
        'form1[0].Section9\\.1-9\\.4[0].TextField11[12]': 'section9.nonUSCitizen.nameOnDocument.firstName',
        'form1[0].Section9\\.1-9\\.4[0].TextField11[10]': 'section9.nonUSCitizen.nameOnDocument.middleName',
        'form1[0].Section9\\.1-9\\.4[0].TextField11[11]': 'section9.nonUSCitizen.nameOnDocument.lastName',
        'form1[0].Section9\\.1-9\\.4[0].suffix[1]': 'section9.nonUSCitizen.nameOnDocument.suffix',
        'form1[0].Section9\\.1-9\\.4[0].TextField11[13]': 'section9.nonUSCitizen.documentNumber',
        'form1[0].Section9\\.1-9\\.4[0].RadioButtonList[0]': 'section9.nonUSCitizen.hasAlienRegistration',
        'form1[0].Section9\\.1-9\\.4[0].TextField11[14]': 'section9.nonUSCitizen.explanation',
        'form1[0].Section9\\.1-9\\.4[0].From_Datefield_Name_2[6]': 'section9.nonUSCitizen.additionalDocumentExpirationDate',
        'form1[0].Section9\\.1-9\\.4[0].#field[55]': 'section9.nonUSCitizen.isAdditionalDocumentExpirationEstimated',
        'form1[0].Section9\\.1-9\\.4[0].School6_State[2]': 'section9.nonUSCitizen.entryState',
    }

    print('Analyzing all 78 fields from reference data...')
    print()

    # Process each field
    implemented_fields = []
    missing_fields = []
    
    for i, field in enumerate(data['fields'], 1):
        field_name = field['name']
        field_type = field['type']
        field_label = field['label']
        field_id = field['id']
        
        # Check if field is implemented
        if field_name in implemented_field_names:
            implemented_fields.append({
                'field_name': field_name,
                'field_type': field_type,
                'field_label': field_label,
                'field_id': field_id,
                'interface_path': implemented_field_names[field_name],
                'status': 'IMPLEMENTED'
            })
        else:
            missing_fields.append({
                'field_name': field_name,
                'field_type': field_type,
                'field_label': field_label,
                'field_id': field_id,
                'status': 'MISSING'
            })

    print('FIELD MAPPING AUDIT RESULTS:')
    print('Total fields in reference:', len(data['fields']))
    print('Implemented fields:', len(implemented_fields))
    print('Missing fields:', len(missing_fields))
    print()

    if missing_fields:
        print('MISSING FIELDS DETAILED LIST:')
        for i, field in enumerate(missing_fields, 1):
            print(f'{i:2d}. {field["field_name"]}')
            print(f'    Type: {field["field_type"]}')
            print(f'    Label: {field["field_label"]}')
            print(f'    ID: {field["field_id"]}')
            print()
    
    # Field coverage by subsection
    print('FIELD COVERAGE BY SUBSECTION:')
    sections_7_9_total = 0
    sections_7_9_implemented = 0
    section_9_1_9_4_total = 0
    section_9_1_9_4_implemented = 0
    
    for field in data['fields']:
        if 'Sections7-9' in field['name']:
            sections_7_9_total += 1
            if field['name'] in implemented_field_names:
                sections_7_9_implemented += 1
        elif 'Section9' in field['name'] and '1-9' in field['name'] and '4' in field['name']:
            section_9_1_9_4_total += 1
            if field['name'] in implemented_field_names:
                section_9_1_9_4_implemented += 1
    
    print(f'Sections7-9 pattern: {sections_7_9_implemented}/{sections_7_9_total} ({sections_7_9_implemented/sections_7_9_total*100:.1f}%)')
    print(f'Section9.1-9.4 pattern: {section_9_1_9_4_implemented}/{section_9_1_9_4_total} ({section_9_1_9_4_implemented/section_9_1_9_4_total*100:.1f}%)')
    print()
    
    print('OVERALL COVERAGE:', f'{len(implemented_fields)}/{len(data["fields"])} ({len(implemented_fields)/len(data["fields"])*100:.1f}%)')

if __name__ == '__main__':
    main()
