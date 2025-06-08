#!/usr/bin/env python3
"""
Complete Section 13 Field Verification for All 1,086 Fields
Verifies that our interface mapping covers all PDF form fields
"""

import json
import os
import re
from collections import defaultdict

def load_reference_data():
    """Load the section-13.json reference data"""
    script_dir = os.path.dirname(os.path.abspath(__file__))
    json_path = os.path.join(script_dir, '..', 'api', 'sections-references', 'section-13.json')
    
    with open(json_path, 'r') as f:
        return json.load(f)

def load_interface_mappings():
    """Load the interface mappings from section13.ts"""
    script_dir = os.path.dirname(os.path.abspath(__file__))
    interface_path = os.path.join(script_dir, '..', 'api', 'interfaces', 'sections2.0', 'section13.ts')
    
    with open(interface_path, 'r') as f:
        return f.read()

def analyze_all_fields(data):
    """Analyze all 1,086 fields in the reference data"""
    fields_array = data['fields']
    
    field_analysis = {
        'total_fields': len(fields_array),
        'by_type': defaultdict(list),
        'by_value_type': defaultdict(list),
        'string_values': set(),
        'field_names': set(),
        'unique_ids': set()
    }
    
    for i, field in enumerate(fields_array):
        field_type = field.get('type', 'unknown')
        field_name = field.get('name', f'field_{i}')
        field_value = field.get('value')
        field_id = field.get('id', '')
        unique_id = field.get('uniqueId', '')
        
        # Categorize by PDF field type
        field_analysis['by_type'][field_type].append({
            'index': i,
            'name': field_name,
            'value': field_value,
            'id': field_id,
            'uniqueId': unique_id
        })
        
        # Categorize by value type
        if isinstance(field_value, str):
            field_analysis['by_value_type']['string'].append(field)
            field_analysis['string_values'].add(field_value)
        elif isinstance(field_value, bool):
            field_analysis['by_value_type']['boolean'].append(field)
        elif isinstance(field_value, list):
            field_analysis['by_value_type']['list'].append(field)
        elif field_value is None:
            field_analysis['by_value_type']['null'].append(field)
        else:
            field_analysis['by_value_type']['other'].append(field)
        
        field_analysis['field_names'].add(field_name)
        field_analysis['unique_ids'].add(unique_id)
    
    return field_analysis

def extract_interface_mappings(interface_content):
    """Extract all mappings from the interface file"""
    mappings = {
        'string_values': set(),
        'field_names': set(),
        'checkbox_fields': set(),
        'radio_fields': set(),
        'dropdown_fields': set()
    }
    
    # Extract string value mappings
    mapping_section = re.search(r'SECTION13_FIELD_MAPPINGS.*?} as const;', interface_content, re.DOTALL)
    if mapping_section:
        mapping_text = mapping_section.group(0)
        # Find all quoted field values (right side of mappings)
        field_matches = re.findall(r"'([^']+)'", mapping_text)
        for field in field_matches:
            mappings['string_values'].add(field)
    
    # Extract checkbox field mappings
    checkbox_section = re.search(r'CHECKBOX_FIELDS:.*?},', interface_content, re.DOTALL)
    if checkbox_section:
        checkbox_text = checkbox_section.group(0)
        field_matches = re.findall(r"'([^']+)'", checkbox_text)
        for field in field_matches:
            if 'form1[0]' in field:
                mappings['checkbox_fields'].add(field)
    
    # Extract radio button mappings
    radio_section = re.search(r'RADIO_BUTTON_GROUPS:.*?},', interface_content, re.DOTALL)
    if radio_section:
        radio_text = radio_section.group(0)
        field_matches = re.findall(r"'([^']+)'", radio_text)
        for field in field_matches:
            if 'form1[0]' in field:
                mappings['radio_fields'].add(field)
    
    # Extract dropdown field mappings
    dropdown_section = re.search(r'DROPDOWN_FIELDS:.*?}', interface_content, re.DOTALL)
    if dropdown_section:
        dropdown_text = dropdown_section.group(0)
        field_matches = re.findall(r"'([^']+)'", dropdown_text)
        for field in field_matches:
            if 'form1[0]' in field:
                mappings['dropdown_fields'].add(field)
    
    return mappings

def verify_coverage(field_analysis, interface_mappings):
    """Verify coverage of all field types"""
    results = {
        'string_coverage': 0,
        'checkbox_coverage': 0,
        'radio_coverage': 0,
        'dropdown_coverage': 0,
        'total_coverage': 0,
        'missing_fields': defaultdict(list)
    }
    
    # Check string value coverage
    string_values = field_analysis['string_values']
    mapped_strings = interface_mappings['string_values']
    string_matches = string_values.intersection(mapped_strings)
    results['string_coverage'] = len(string_matches) / len(string_values) * 100 if string_values else 0
    results['missing_fields']['strings'] = list(string_values - mapped_strings)
    
    # Check checkbox coverage
    checkbox_fields = [f['name'] for f in field_analysis['by_type']['PDFCheckBox']]
    mapped_checkboxes = interface_mappings['checkbox_fields']
    checkbox_matches = set(checkbox_fields).intersection(mapped_checkboxes)
    results['checkbox_coverage'] = len(checkbox_matches) / len(checkbox_fields) * 100 if checkbox_fields else 0
    results['missing_fields']['checkboxes'] = list(set(checkbox_fields) - mapped_checkboxes)
    
    # Check radio button coverage
    radio_fields = [f['name'] for f in field_analysis['by_type']['PDFRadioGroup']]
    mapped_radios = interface_mappings['radio_fields']
    radio_matches = set(radio_fields).intersection(mapped_radios)
    results['radio_coverage'] = len(radio_matches) / len(radio_fields) * 100 if radio_fields else 0
    results['missing_fields']['radios'] = list(set(radio_fields) - mapped_radios)
    
    # Check dropdown coverage
    dropdown_fields = [f['name'] for f in field_analysis['by_type']['PDFDropdown']]
    mapped_dropdowns = interface_mappings['dropdown_fields']
    dropdown_matches = set(dropdown_fields).intersection(mapped_dropdowns)
    results['dropdown_coverage'] = len(dropdown_matches) / len(dropdown_fields) * 100 if dropdown_fields else 0
    results['missing_fields']['dropdowns'] = list(set(dropdown_fields) - mapped_dropdowns)
    
    # Calculate total coverage
    total_fields = field_analysis['total_fields']
    total_mapped = len(string_matches) + len(checkbox_matches) + len(radio_matches) + len(dropdown_matches)
    results['total_coverage'] = total_mapped / total_fields * 100 if total_fields else 0
    results['total_mapped'] = total_mapped
    
    return results

def main():
    print('🎯 SECTION 13 COMPLETE FIELD VERIFICATION (1,086 Fields)')
    print('=' * 70)
    
    # Load data
    data = load_reference_data()
    interface_content = load_interface_mappings()
    
    # Analyze fields
    field_analysis = analyze_all_fields(data)
    interface_mappings = extract_interface_mappings(interface_content)
    
    print(f'📊 REFERENCE DATA ANALYSIS:')
    print(f'   Total PDF fields: {field_analysis["total_fields"]}')
    print(f'   PDFTextField: {len(field_analysis["by_type"]["PDFTextField"])}')
    print(f'   PDFCheckBox: {len(field_analysis["by_type"]["PDFCheckBox"])}')
    print(f'   PDFRadioGroup: {len(field_analysis["by_type"]["PDFRadioGroup"])}')
    print(f'   PDFDropdown: {len(field_analysis["by_type"]["PDFDropdown"])}')
    print(f'   Unique string values: {len(field_analysis["string_values"])}')
    
    print(f'\n📊 INTERFACE MAPPING ANALYSIS:')
    print(f'   Mapped string values: {len(interface_mappings["string_values"])}')
    print(f'   Mapped checkbox fields: {len(interface_mappings["checkbox_fields"])}')
    print(f'   Mapped radio fields: {len(interface_mappings["radio_fields"])}')
    print(f'   Mapped dropdown fields: {len(interface_mappings["dropdown_fields"])}')
    
    # Verify coverage
    results = verify_coverage(field_analysis, interface_mappings)
    
    print(f'\n📈 COVERAGE ANALYSIS:')
    print(f'   String values: {results["string_coverage"]:.1f}%')
    print(f'   Checkbox fields: {results["checkbox_coverage"]:.1f}%')
    print(f'   Radio fields: {results["radio_coverage"]:.1f}%')
    print(f'   Dropdown fields: {results["dropdown_coverage"]:.1f}%')
    print(f'   TOTAL COVERAGE: {results["total_coverage"]:.1f}% ({results["total_mapped"]}/1086)')
    
    # Show missing fields
    for field_type, missing in results['missing_fields'].items():
        if missing:
            print(f'\n🔍 MISSING {field_type.upper()} ({len(missing)}):')
            for field in missing[:10]:
                print(f'   - {field}')
            if len(missing) > 10:
                print(f'   ... and {len(missing) - 10} more')
    
    # Final assessment
    if results['total_coverage'] >= 99:
        print('\n🎉 EXCELLENT! Near-perfect coverage achieved!')
    elif results['total_coverage'] >= 95:
        print('\n✅ EXCELLENT COVERAGE!')
    elif results['total_coverage'] >= 90:
        print('\n🟢 VERY GOOD COVERAGE!')
    elif results['total_coverage'] >= 80:
        print('\n🟡 GOOD COVERAGE - Some gaps remain')
    else:
        print('\n🔴 COVERAGE NEEDS SIGNIFICANT IMPROVEMENT')
    
    print(f'\n🎯 SECTION 13 VERIFICATION COMPLETE!')
    return results

if __name__ == '__main__':
    main()
