#!/usr/bin/env python3
"""
Phase 2: Automated Field Mapping Generator
Generate TypeScript field mappings from section-13.json data
"""

import json
import os
import re
from collections import defaultdict

def parse_field_value(value):
    """Parse the logical field path from the value property"""
    if not isinstance(value, str):
        return None
    
    # Extract logical path patterns like "sect13A.1Entry1SupervisorName"
    if value.startswith('sect13'):
        return value
    return None

def generate_logical_path(field_name, field_value, section_pattern):
    """Generate a logical field path for the TypeScript interface"""

    # Parse the PDF field name to understand structure
    pdf_parts = field_name.split('.')
    if len(pdf_parts) < 2:
        return None

    # Extract section and field info
    section_part = pdf_parts[1] if len(pdf_parts) > 1 else ''

    # Map section patterns to logical paths
    if 'section_13_1-2' in field_name:
        # Federal Employment (13A.1)
        if 'TextField11' in field_name:
            field_num = re.search(r'TextField11\[(\d+)\]', field_name)
            if field_num:
                num = int(field_num.group(1))
                field_map = {
                    0: 'supervisorName',
                    1: 'supervisorRank',
                    2: 'supervisorTitle',
                    3: 'supervisorAddress',
                    4: 'supervisorCity',
                    5: 'supervisorZip',
                    6: 'employerStreet',
                    7: 'employerCity',
                    8: 'employerZip',
                    9: 'dutyStreet',
                    10: 'dutyCity',
                    11: 'dutyZip',
                    12: 'extension',
                    13: 'otherExplanation',
                    14: 'supervisorAddressAlt',
                    15: 'supervisorCityAlt',
                    16: 'dutyStreetAlt',
                    17: 'dutyApoFpo',
                    18: 'dutyZipAlt',
                    19: 'supervisorNameAlt'
                }
                if num in field_map:
                    return f'section13.federalEmployment.entries[0].{field_map[num]}.value'

        elif 'RadioButtonList' in field_name:
            radio_num = re.search(r'RadioButtonList\[(\d+)\]', field_name)
            if radio_num:
                num = int(radio_num.group(1))
                if num == 0:
                    return 'section13.federalEmployment.entries[0].employmentType.value'
                elif num == 1:
                    return 'section13.federalEmployment.entries[0].hasAdditionalInfo.value'

        elif 'From_Datefield_Name_2' in field_name:
            date_num = re.search(r'From_Datefield_Name_2\[(\d+)\]', field_name)
            if date_num:
                num = int(date_num.group(1))
                if num == 0:
                    return 'section13.federalEmployment.entries[0].fromDate.value'
                elif num == 1:
                    return 'section13.federalEmployment.entries[0].toDate.value'

        elif 'School6_State' in field_name:
            state_num = re.search(r'School6_State\[(\d+)\]', field_name)
            if state_num:
                num = int(state_num.group(1))
                state_map = {
                    0: 'supervisorState',
                    1: 'employerState',
                    2: 'dutyState',
                    3: 'supervisorStateAlt',
                    4: 'dutyStateAlt'
                }
                if num in state_map:
                    return f'section13.federalEmployment.entries[0].{state_map[num]}.value'

        elif 'DropDownList' in field_name:
            dropdown_num = re.search(r'DropDownList(\d+)\[(\d+)\]', field_name)
            if dropdown_num:
                list_num = int(dropdown_num.group(1))
                item_num = int(dropdown_num.group(2))
                dropdown_map = {
                    4: 'countryCode',
                    17: 'employerCountry',
                    18: 'supervisorCountry',
                    20: 'dutyCountry'
                }
                if list_num in dropdown_map:
                    return f'section13.federalEmployment.entries[0].{dropdown_map[list_num]}.value'

        elif 'p3-t68' in field_name:
            phone_num = re.search(r'p3-t68\[(\d+)\]', field_name)
            if phone_num:
                num = int(phone_num.group(1))
                phone_map = {
                    0: 'supervisorPhone',
                    1: 'employerPhone',
                    2: 'supervisorEmail',
                    3: 'rankTitle',
                    4: 'dutyStation'
                }
                if num in phone_map:
                    return f'section13.federalEmployment.entries[0].{phone_map[num]}.value'

        elif '#field' in field_name:
            field_num = re.search(r'#field\[(\d+)\]', field_name)
            if field_num:
                num = int(field_num.group(1))
                return f'section13.federalEmployment.entries[0].field{num}.value'

        elif 'p13a-1-1cb' in field_name:
            return 'section13.federalEmployment.entries[0].checkbox.value'
    
    elif 'section13_2' in field_name and 'section13_2-2' not in field_name:
        # Non-Federal Employment (13A.2)
        if 'TextField11' in field_name:
            field_num = re.search(r'TextField11\[(\d+)\]', field_name)
            if field_num:
                num = int(field_num.group(1))
                field_map = {
                    0: 'employerName',
                    1: 'positionTitle',
                    2: 'supervisorName',
                    3: 'supervisorTitle',
                    4: 'employerStreet',
                    5: 'employerCity',
                    6: 'employerZip',
                    7: 'employerPhone',
                    8: 'extension',
                    9: 'dutyStreet',
                    10: 'dutyCity',
                    11: 'dutyZip',
                    12: 'additionalInfo',
                    13: 'reasonForLeaving',
                    14: 'supervisorAddress',
                    15: 'supervisorCity',
                    16: 'supervisorStreet',
                    17: 'supervisorApoFpo',
                    18: 'supervisorZip',
                    19: 'supervisorNameAlt',
                    20: 'employerAddress2',
                    21: 'employerCity2',
                    22: 'employerStreet2',
                    23: 'employerApoFpo',
                    24: 'employerZip2',
                    25: 'employerNameAlt'
                }
                if num in field_map:
                    return f'section13.nonFederalEmployment.entries[0].{field_map[num]}.value'

        elif 'RadioButtonList' in field_name:
            radio_num = re.search(r'RadioButtonList\[(\d+)\]', field_name)
            if radio_num:
                num = int(radio_num.group(1))
                radio_map = {
                    0: 'employmentType',
                    1: 'hasAdditionalInfo',
                    2: 'isCurrentEmployment'
                }
                if num in radio_map:
                    return f'section13.nonFederalEmployment.entries[0].{radio_map[num]}.value'

        elif 'From_Datefield_Name_2' in field_name:
            date_num = re.search(r'From_Datefield_Name_2\[(\d+)\]', field_name)
            if date_num:
                num = int(date_num.group(1))
                if num == 0:
                    return 'section13.nonFederalEmployment.entries[0].fromDate.value'
                elif num == 1:
                    return 'section13.nonFederalEmployment.entries[0].toDate.value'

        elif 'School6_State' in field_name:
            state_num = re.search(r'School6_State\[(\d+)\]', field_name)
            if state_num:
                num = int(state_num.group(1))
                state_map = {
                    0: 'employerState',
                    1: 'dutyState',
                    2: 'supervisorState',
                    3: 'employerStateAlt',
                    4: 'dutyStateAlt',
                    5: 'supervisorStateAlt',
                    6: 'additionalState'
                }
                if num in state_map:
                    return f'section13.nonFederalEmployment.entries[0].{state_map[num]}.value'

        elif 'DropDownList' in field_name:
            dropdown_num = re.search(r'DropDownList(\d+)\[(\d+)\]', field_name)
            if dropdown_num:
                list_num = int(dropdown_num.group(1))
                dropdown_map = {
                    4: 'countryCode',
                    13: 'employerCountry',
                    15: 'dutyCountry',
                    16: 'supervisorCountry'
                }
                if list_num in dropdown_map:
                    return f'section13.nonFederalEmployment.entries[0].{dropdown_map[list_num]}.value'

        elif 'p3-t68' in field_name:
            phone_num = re.search(r'p3-t68\[(\d+)\]', field_name)
            if phone_num:
                num = int(phone_num.group(1))
                phone_map = {
                    0: 'employerPhone',
                    1: 'dutyPhone',
                    2: 'supervisorEmail',
                    3: 'supervisorPhone',
                    4: 'additionalPhone',
                    5: 'emergencyContact'
                }
                if num in phone_map:
                    return f'section13.nonFederalEmployment.entries[0].{phone_map[num]}.value'

        elif '#field' in field_name:
            field_num = re.search(r'#field\[(\d+)\]', field_name)
            if field_num:
                num = int(field_num.group(1))
                return f'section13.nonFederalEmployment.entries[0].field{num}.value'

        elif 'Table1' in field_name:
            # Handle table fields for employment history
            table_match = re.search(r'Table1\[(\d+)\].*Row(\d+)\[(\d+)\].*Cell(\d+)\[(\d+)\]', field_name)
            if table_match:
                table_num = int(table_match.group(1))
                row_num = int(table_match.group(2))
                cell_num = int(table_match.group(4))
                return f'section13.nonFederalEmployment.entries[0].table{table_num}Row{row_num}Cell{cell_num}.value'
    
    elif 'section13_3' in field_name and 'section13_3-2' not in field_name:
        # Self-Employment (13A.3)
        if 'TextField11' in field_name:
            field_num = re.search(r'TextField11\[(\d+)\]', field_name)
            if field_num:
                num = int(field_num.group(1))
                field_map = {
                    0: 'businessName',
                    1: 'businessType',
                    2: 'businessDescription',
                    3: 'businessStreet',
                    4: 'businessCity',
                    5: 'businessZip',
                    6: 'businessPhone',
                    7: 'businessExtension',
                    8: 'businessEmail',
                    9: 'businessAddress2',
                    10: 'businessCity2',
                    11: 'businessZip2',
                    12: 'additionalInfo',
                    13: 'businessLicense',
                    14: 'businessTaxId',
                    15: 'businessRevenue',
                    16: 'businessEmployees',
                    17: 'businessApoFpo',
                    18: 'businessZipAlt',
                    19: 'businessContact',
                    20: 'businessAddress3',
                    21: 'businessCity3',
                    22: 'businessStreet3',
                    23: 'businessApoFpo2',
                    24: 'businessZip3',
                    25: 'businessNameAlt'
                }
                if num in field_map:
                    return f'section13.selfEmployment.entries[0].{field_map[num]}.value'

        elif 'RadioButtonList' in field_name:
            radio_num = re.search(r'RadioButtonList\[(\d+)\]', field_name)
            if radio_num:
                num = int(radio_num.group(1))
                radio_map = {
                    0: 'businessType',
                    1: 'hasEmployees',
                    2: 'isCurrentBusiness'
                }
                if num in radio_map:
                    return f'section13.selfEmployment.entries[0].{radio_map[num]}.value'

        elif 'From_Datefield_Name_2' in field_name:
            date_num = re.search(r'From_Datefield_Name_2\[(\d+)\]', field_name)
            if date_num:
                num = int(date_num.group(1))
                if num == 0:
                    return 'section13.selfEmployment.entries[0].fromDate.value'
                elif num == 1:
                    return 'section13.selfEmployment.entries[0].toDate.value'

        elif 'School6_State' in field_name:
            state_num = re.search(r'School6_State\[(\d+)\]', field_name)
            if state_num:
                num = int(state_num.group(1))
                state_map = {
                    0: 'businessState',
                    1: 'businessState2',
                    2: 'businessState3',
                    3: 'businessStateAlt',
                    4: 'businessStateAlt2',
                    5: 'businessStateAlt3',
                    6: 'additionalState'
                }
                if num in state_map:
                    return f'section13.selfEmployment.entries[0].{state_map[num]}.value'

        elif 'DropDownList' in field_name:
            dropdown_num = re.search(r'DropDownList(\d+)\[(\d+)\]', field_name)
            if dropdown_num:
                list_num = int(dropdown_num.group(1))
                dropdown_map = {
                    4: 'countryCode',
                    9: 'businessCountry',
                    10: 'businessCountry2',
                    11: 'businessCountry3'
                }
                if list_num in dropdown_map:
                    return f'section13.selfEmployment.entries[0].{dropdown_map[list_num]}.value'

        elif 'p3-t68' in field_name:
            phone_num = re.search(r'p3-t68\[(\d+)\]', field_name)
            if phone_num:
                num = int(phone_num.group(1))
                phone_map = {
                    0: 'businessPhone',
                    1: 'businessPhone2',
                    2: 'businessEmail',
                    3: 'businessFax',
                    4: 'businessWebsite'
                }
                if num in phone_map:
                    return f'section13.selfEmployment.entries[0].{phone_map[num]}.value'

        elif '#field' in field_name:
            field_num = re.search(r'#field\[(\d+)\]', field_name)
            if field_num:
                num = int(field_num.group(1))
                return f'section13.selfEmployment.entries[0].field{num}.value'
    
    elif 'section13_4' in field_name:
        # Unemployment (13A.4)
        if 'TextField11' in field_name:
            field_num = re.search(r'TextField11\[(\d+)\]', field_name)
            if field_num:
                num = int(field_num.group(1))
                field_map = {
                    0: 'firstName',
                    1: 'lastName',
                    2: 'referenceStreet',
                    3: 'referenceCity',
                    4: 'referenceZip',
                    5: 'referencePhone',
                    6: 'referenceExtension',
                    7: 'referenceEmail',
                    8: 'referenceAddress2',
                    9: 'referenceCity2',
                    10: 'referenceStreet2',
                    11: 'referenceZip2',
                    12: 'additionalInfo'
                }
                if num in field_map:
                    return f'section13.unemployment.entries[0].{field_map[num]}.value'

        elif 'RadioButtonList' in field_name:
            radio_num = re.search(r'RadioButtonList\[(\d+)\]', field_name)
            if radio_num:
                num = int(radio_num.group(1))
                radio_map = {
                    0: 'hasReference',
                    1: 'receivedBenefits',
                    2: 'isCurrentlyUnemployed'
                }
                if num in radio_map:
                    return f'section13.unemployment.entries[0].{radio_map[num]}.value'

        elif 'From_Datefield_Name_2' in field_name:
            date_num = re.search(r'From_Datefield_Name_2\[(\d+)\]', field_name)
            if date_num:
                num = int(date_num.group(1))
                date_map = {
                    0: 'fromDate',
                    1: 'toDate',
                    2: 'unemploymentStartDate',
                    3: 'unemploymentEndDate',
                    4: 'benefitsStartDate',
                    5: 'benefitsEndDate',
                    6: 'additionalFromDate',
                    7: 'additionalToDate',
                    8: 'referenceFromDate',
                    9: 'referenceToDate'
                }
                if num in date_map:
                    return f'section13.unemployment.entries[0].{date_map[num]}.value'

        elif 'School6_State' in field_name:
            state_num = re.search(r'School6_State\[(\d+)\]', field_name)
            if state_num:
                num = int(state_num.group(1))
                state_map = {
                    0: 'referenceState',
                    1: 'referenceState2',
                    2: 'additionalState'
                }
                if num in state_map:
                    return f'section13.unemployment.entries[0].{state_map[num]}.value'

        elif 'DropDownList' in field_name:
            dropdown_num = re.search(r'DropDownList(\d+)\[(\d+)\]', field_name)
            if dropdown_num:
                list_num = int(dropdown_num.group(1))
                dropdown_map = {
                    4: 'countryCode',
                    6: 'referenceCountry'
                }
                if list_num in dropdown_map:
                    return f'section13.unemployment.entries[0].{dropdown_map[list_num]}.value'

        elif 'p3-t68' in field_name:
            phone_num = re.search(r'p3-t68\[(\d+)\]', field_name)
            if phone_num:
                num = int(phone_num.group(1))
                return f'section13.unemployment.entries[0].phone{num}.value'

        elif '#field' in field_name:
            field_num = re.search(r'#field\[(\d+)\]', field_name)
            if field_num:
                num = int(field_num.group(1))
                return f'section13.unemployment.entries[0].field{num}.value'

        elif '#area' in field_name:
            # Handle area-specific fields
            area_match = re.search(r'#area\[(\d+)\].*#field\[(\d+)\]', field_name)
            if area_match:
                area_num = int(area_match.group(1))
                field_num = int(area_match.group(2))
                return f'section13.unemployment.entries[0].area{area_num}Field{field_num}.value'
    
    elif 'section13_5' in field_name:
        # Employment Issues (13A.5)
        if 'TextField11' in field_name:
            field_num = re.search(r'TextField11\[(\d+)\]', field_name)
            if field_num:
                num = int(field_num.group(1))
                field_map = {
                    0: 'agencyName',
                    1: 'agencyAddress',
                    2: 'clearanceLevel',
                    3: 'gapExplanation',
                    4: 'classificationLevel',
                    5: 'agencyCity',
                    6: 'agencyStreet',
                    7: 'agencyZip',
                    8: 'agencyPhone',
                    9: 'agencyContact',
                    10: 'agencyEmail',
                    11: 'additionalInfo'
                }
                if num in field_map:
                    return f'section13.employmentRecordIssues.{field_map[num]}.value'

        elif 'RadioButtonList' in field_name:
            radio_num = re.search(r'RadioButtonList\[(\d+)\]', field_name)
            if radio_num:
                num = int(radio_num.group(1))
                radio_map = {
                    0: 'hasFederalEmployment',
                    1: 'hasGaps'
                }
                if num in radio_map:
                    return f'section13.employmentRecordIssues.{radio_map[num]}.value'

        elif 'From_Datefield_Name_2' in field_name:
            date_num = re.search(r'From_Datefield_Name_2\[(\d+)\]', field_name)
            if date_num:
                num = int(date_num.group(1))
                date_map = {
                    0: 'clearanceFromDate',
                    1: 'clearanceToDate',
                    2: 'employmentFromDate',
                    3: 'employmentToDate',
                    4: 'gapFromDate',
                    5: 'gapToDate',
                    6: 'additionalFromDate',
                    7: 'additionalToDate'
                }
                if num in date_map:
                    return f'section13.employmentRecordIssues.{date_map[num]}.value'

        elif 'School6_State' in field_name:
            state_num = re.search(r'School6_State\[(\d+)\]', field_name)
            if state_num:
                num = int(state_num.group(1))
                state_map = {
                    0: 'agencyState',
                    1: 'agencyState2',
                    2: 'agencyState3',
                    3: 'additionalState'
                }
                if num in state_map:
                    return f'section13.employmentRecordIssues.{state_map[num]}.value'

        elif 'DropDownList' in field_name:
            dropdown_num = re.search(r'DropDownList(\d+)\[(\d+)\]', field_name)
            if dropdown_num:
                list_num = int(dropdown_num.group(1))
                dropdown_map = {
                    2: 'agencyCountry'
                }
                if list_num in dropdown_map:
                    return f'section13.employmentRecordIssues.{dropdown_map[list_num]}.value'

        elif 'p3-t68' in field_name:
            phone_num = re.search(r'p3-t68\[(\d+)\]', field_name)
            if phone_num:
                num = int(phone_num.group(1))
                phone_map = {
                    0: 'agencyPhone',
                    1: 'agencyPhone2',
                    2: 'agencyFax',
                    3: 'agencyEmail',
                    4: 'contactPhone',
                    5: 'contactPhone2',
                    6: 'contactEmail',
                    7: 'additionalPhone'
                }
                if num in phone_map:
                    return f'section13.employmentRecordIssues.{phone_map[num]}.value'

        elif '#field' in field_name:
            field_num = re.search(r'#field\[(\d+)\]', field_name)
            if field_num:
                num = int(field_num.group(1))
                return f'section13.employmentRecordIssues.field{num}.value'

        elif '#area' in field_name:
            # Handle area-specific fields
            area_match = re.search(r'#area\[(\d+)\]', field_name)
            if area_match:
                area_num = int(area_match.group(1))
                if 'TextField11' in field_name:
                    text_num = re.search(r'TextField11\[(\d+)\]', field_name)
                    if text_num:
                        field_num = int(text_num.group(1))
                        return f'section13.employmentRecordIssues.area{area_num}Text{field_num}.value'
                elif '#field' in field_name:
                    field_match = re.search(r'#field\[(\d+)\]', field_name)
                    if field_match:
                        field_num = int(field_match.group(1))
                        return f'section13.employmentRecordIssues.area{area_num}Field{field_num}.value'
                elif 'DropDownList' in field_name:
                    dropdown_match = re.search(r'DropDownList(\d+)\[(\d+)\]', field_name)
                    if dropdown_match:
                        list_num = int(dropdown_match.group(1))
                        item_num = int(dropdown_match.group(2))
                        return f'section13.employmentRecordIssues.area{area_num}Dropdown{list_num}.value'
                elif 'From_Datefield_Name_2' in field_name:
                    date_match = re.search(r'From_Datefield_Name_2\[(\d+)\]', field_name)
                    if date_match:
                        date_num = int(date_match.group(1))
                        return f'section13.employmentRecordIssues.area{area_num}Date{date_num}.value'
                elif 'School6_State' in field_name:
                    state_match = re.search(r'School6_State\[(\d+)\]', field_name)
                    if state_match:
                        state_num = int(state_match.group(1))
                        return f'section13.employmentRecordIssues.area{area_num}State{state_num}.value'
                elif 'p3-t68' in field_name:
                    phone_match = re.search(r'p3-t68\[(\d+)\]', field_name)
                    if phone_match:
                        phone_num = int(phone_match.group(1))
                        return f'section13.employmentRecordIssues.area{area_num}Phone{phone_num}.value'
    
    # Handle additional section patterns (section13_2-2, section13_3-2, etc.)
    elif 'section13_2-2' in field_name:
        # Additional Non-Federal Employment forms
        return generate_additional_section_mapping(field_name, 'nonFederalEmploymentAdditional')

    elif 'section13_3-2' in field_name:
        # Additional Self-Employment forms
        return generate_additional_section_mapping(field_name, 'selfEmploymentAdditional')

    elif 'section13_4_3' in field_name:
        # Additional Unemployment forms
        return generate_additional_section_mapping(field_name, 'unemploymentAdditional')

    # Default fallback - generate a basic logical path
    section_num = re.search(r'section13[_-]?(\d+(?:-\d+)?)', field_name)
    if section_num:
        section_id = section_num.group(1)
        field_type = 'unknown'
        field_index = 0

        # Extract field type and index
        if 'TextField11' in field_name:
            field_type = 'textField'
            text_match = re.search(r'TextField11\[(\d+)\]', field_name)
            if text_match:
                field_index = int(text_match.group(1))
        elif 'RadioButtonList' in field_name:
            field_type = 'radioButton'
            radio_match = re.search(r'RadioButtonList\[(\d+)\]', field_name)
            if radio_match:
                field_index = int(radio_match.group(1))
        elif 'CheckBox' in field_name:
            field_type = 'checkBox'
        elif 'DropDownList' in field_name:
            field_type = 'dropdown'
            dropdown_match = re.search(r'DropDownList(\d+)\[(\d+)\]', field_name)
            if dropdown_match:
                field_index = int(dropdown_match.group(1))
        elif 'School6_State' in field_name:
            field_type = 'state'
            state_match = re.search(r'School6_State\[(\d+)\]', field_name)
            if state_match:
                field_index = int(state_match.group(1))
        elif 'From_Datefield_Name_2' in field_name:
            field_type = 'dateField'
            date_match = re.search(r'From_Datefield_Name_2\[(\d+)\]', field_name)
            if date_match:
                field_index = int(date_match.group(1))
        elif 'p3-t68' in field_name:
            field_type = 'phoneField'
            phone_match = re.search(r'p3-t68\[(\d+)\]', field_name)
            if phone_match:
                field_index = int(phone_match.group(1))
        elif '#field' in field_name:
            field_type = 'genericField'
            field_match = re.search(r'#field\[(\d+)\]', field_name)
            if field_match:
                field_index = int(field_match.group(1))
        elif 'Table1' in field_name:
            field_type = 'tableField'
            table_match = re.search(r'Table1\[(\d+)\].*Row(\d+)\[(\d+)\].*Cell(\d+)\[(\d+)\]', field_name)
            if table_match:
                table_num = int(table_match.group(1))
                row_num = int(table_match.group(2))
                cell_num = int(table_match.group(4))
                return f'section13.section{section_id}.table{table_num}Row{row_num}Cell{cell_num}.value'

        return f'section13.section{section_id}.{field_type}{field_index}.value'

    return None

def generate_additional_section_mapping(field_name, section_prefix):
    """Generate mappings for additional section patterns like section13_2-2, section13_3-2"""

    if 'TextField11' in field_name:
        field_num = re.search(r'TextField11\[(\d+)\]', field_name)
        if field_num:
            num = int(field_num.group(1))
            return f'section13.{section_prefix}.entries[0].textField{num}.value'

    elif 'RadioButtonList' in field_name:
        radio_num = re.search(r'RadioButtonList\[(\d+)\]', field_name)
        if radio_num:
            num = int(radio_num.group(1))
            return f'section13.{section_prefix}.entries[0].radioButton{num}.value'

    elif 'From_Datefield_Name_2' in field_name:
        date_num = re.search(r'From_Datefield_Name_2\[(\d+)\]', field_name)
        if date_num:
            num = int(date_num.group(1))
            return f'section13.{section_prefix}.entries[0].dateField{num}.value'

    elif 'School6_State' in field_name:
        state_num = re.search(r'School6_State\[(\d+)\]', field_name)
        if state_num:
            num = int(state_num.group(1))
            return f'section13.{section_prefix}.entries[0].state{num}.value'

    elif 'DropDownList' in field_name:
        dropdown_num = re.search(r'DropDownList(\d+)\[(\d+)\]', field_name)
        if dropdown_num:
            list_num = int(dropdown_num.group(1))
            item_num = int(dropdown_num.group(2))
            return f'section13.{section_prefix}.entries[0].dropdown{list_num}.value'

    elif 'p3-t68' in field_name:
        phone_num = re.search(r'p3-t68\[(\d+)\]', field_name)
        if phone_num:
            num = int(phone_num.group(1))
            return f'section13.{section_prefix}.entries[0].phone{num}.value'

    elif '#field' in field_name:
        field_num = re.search(r'#field\[(\d+)\]', field_name)
        if field_num:
            num = int(field_num.group(1))
            return f'section13.{section_prefix}.entries[0].field{num}.value'

    elif 'Table1' in field_name:
        table_match = re.search(r'Table1\[(\d+)\].*Row(\d+)\[(\d+)\].*Cell(\d+)\[(\d+)\]', field_name)
        if table_match:
            table_num = int(table_match.group(1))
            row_num = int(table_match.group(2))
            cell_num = int(table_match.group(4))
            return f'section13.{section_prefix}.entries[0].table{table_num}Row{row_num}Cell{cell_num}.value'

    return None

def main():
    # Load section-13.json
    script_dir = os.path.dirname(os.path.abspath(__file__))
    json_path = os.path.join(script_dir, '..', 'api', 'sections-references', 'section-13.json')
    
    try:
        with open(json_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
    except Exception as e:
        print(f"❌ Error loading section-13.json: {e}")
        return
    
    print('🔧 AUTOMATED FIELD MAPPING GENERATOR')
    print('=' * 60)
    
    # Extract and process fields
    mappings = {}
    unmapped_fields = []
    section_stats = defaultdict(int)
    
    if 'fields' in data and isinstance(data['fields'], list):
        for field in data['fields']:
            if not isinstance(field, dict) or 'name' not in field:
                continue
            
            field_name = field['name']
            field_value = field.get('value', '')
            
            # Generate logical path
            logical_path = generate_logical_path(field_name, field_value, field_name)
            
            if logical_path:
                mappings[logical_path] = field_name
                
                # Track section stats
                if 'section_13_1-2' in field_name:
                    section_stats['13A.1 Federal Employment'] += 1
                elif 'section13_2' in field_name and 'section13_2-2' not in field_name:
                    section_stats['13A.2 Non-Federal Employment'] += 1
                elif 'section13_2-2' in field_name:
                    section_stats['13A.2 Additional Non-Federal'] += 1
                elif 'section13_3' in field_name and 'section13_3-2' not in field_name:
                    section_stats['13A.3 Self-Employment'] += 1
                elif 'section13_3-2' in field_name:
                    section_stats['13A.3 Additional Self-Employment'] += 1
                elif 'section13_4' in field_name:
                    section_stats['13A.4 Unemployment'] += 1
                elif 'section13_5' in field_name:
                    section_stats['13A.5 Employment Issues'] += 1
                else:
                    section_stats['Other'] += 1
            else:
                unmapped_fields.append(field_name)
    
    print(f'📊 MAPPING RESULTS:')
    print(f'   Total fields processed: {len(data.get("fields", []))}')
    print(f'   Successfully mapped: {len(mappings)}')
    print(f'   Unmapped fields: {len(unmapped_fields)}')
    print(f'   Mapping coverage: {(len(mappings) / len(data.get("fields", [])) * 100):.1f}%')
    
    print(f'\n📋 MAPPINGS BY SECTION:')
    for section, count in sorted(section_stats.items()):
        print(f'   {section}: {count} fields')
    
    # Generate TypeScript mapping code
    print(f'\n🔧 GENERATING TYPESCRIPT MAPPINGS...')
    
    ts_mappings = []
    for logical_path, pdf_field in sorted(mappings.items()):
        ts_mappings.append(f"  '{logical_path}': '{pdf_field}',")
    
    # Save TypeScript mappings to file
    output_path = os.path.join(script_dir, 'generated-field-mappings.ts')
    try:
        with open(output_path, 'w', encoding='utf-8') as f:
            f.write('// Auto-generated field mappings from section-13.json\n')
            f.write('// Generated by generate-field-mappings.py\n\n')
            f.write('export const GENERATED_SECTION13_FIELD_MAPPINGS = {\n')
            f.write('\n'.join(ts_mappings))
            f.write('\n} as const;\n\n')
            f.write(f'// Total mappings: {len(mappings)}\n')
            f.write(f'// Coverage: {(len(mappings) / len(data.get("fields", [])) * 100):.1f}%\n')
        
        print(f'✅ TypeScript mappings saved to: {output_path}')
    except Exception as e:
        print(f'⚠️  Could not save TypeScript mappings: {e}')
    
    # Show sample mappings
    print(f'\n📋 SAMPLE GENERATED MAPPINGS:')
    for i, (logical_path, pdf_field) in enumerate(sorted(mappings.items())[:10]):
        print(f'   {i+1}. {logical_path} -> {pdf_field}')
    
    if len(mappings) > 10:
        print(f'   ... and {len(mappings) - 10} more mappings')
    
    # Show unmapped fields sample
    if unmapped_fields:
        print(f'\n⚠️  SAMPLE UNMAPPED FIELDS:')
        for i, field_name in enumerate(unmapped_fields[:5]):
            print(f'   {i+1}. {field_name}')
        if len(unmapped_fields) > 5:
            print(f'   ... and {len(unmapped_fields) - 5} more unmapped fields')

if __name__ == '__main__':
    main()
