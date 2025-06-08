#!/usr/bin/env python3
"""
Complete Section 13 Field Analysis
Analyzes all 1,086 fields in section-13.json to understand the full structure
"""

import json
import os
from collections import defaultdict

def count_all_fields(obj, path='', field_list=None):
    """Count all fields and collect their paths and values"""
    if field_list is None:
        field_list = []

    count = 0
    if isinstance(obj, dict):
        for key, value in obj.items():
            current_path = f'{path}.{key}' if path else key
            if key == 'value':
                count += 1
                field_list.append({
                    'path': path,
                    'value': value,
                    'field_number': len(field_list) + 1
                })
            else:
                sub_count, _ = count_all_fields(value, current_path, field_list)
                count += sub_count
    elif isinstance(obj, list):
        for i, item in enumerate(obj):
            sub_count, _ = count_all_fields(item, f'{path}[{i}]', field_list)
            count += sub_count

    return count, field_list

def analyze_field_structure(field_list):
    """Analyze the structure and patterns in fields"""

    # Group by field value patterns
    value_patterns = defaultdict(list)
    path_patterns = defaultdict(list)

    for field in field_list:
        value = field['value']
        path = field['path']

        # Skip non-string values
        if not isinstance(value, str):
            value_patterns[f'non_string_{type(value).__name__}'].append(field)
            continue

        # Categorize by value pattern
        if value.startswith('sect13A.'):
            subsection = value.split('.')[0] + '.' + value.split('.')[1][:3]  # sect13A.1, sect13A.2, etc.
            value_patterns[subsection].append(field)
        elif any(x in value for x in ['13A1', '13A2', '13A3', '13A4', '13A5', '13A6']):
            # Legacy format
            if '13A1' in value:
                value_patterns['legacy_13A1'].append(field)
            elif '13A2' in value:
                value_patterns['legacy_13A2'].append(field)
            elif '13A3' in value:
                value_patterns['legacy_13A3'].append(field)
            elif '13A4' in value:
                value_patterns['legacy_13A4'].append(field)
            elif '13A5' in value:
                value_patterns['legacy_13A5'].append(field)
            elif '13A6' in value:
                value_patterns['legacy_13A6'].append(field)
        else:
            value_patterns['other'].append(field)
        
        # Categorize by path pattern
        if 'form1[0]' in path:
            if 'section_13_1-2[0]' in path:
                path_patterns['section_13_1-2'].append(field)
            elif 'section13_2-2[0]' in path:
                path_patterns['section13_2-2'].append(field)
            elif 'section13_3-2[0]' in path:
                path_patterns['section13_3-2'].append(field)
            elif 'section13_4[0]' in path:
                path_patterns['section13_4'].append(field)
            elif 'section13_5[0]' in path:
                path_patterns['section13_5'].append(field)
            else:
                path_patterns['other_form'].append(field)
        else:
            path_patterns['non_form'].append(field)
    
    return value_patterns, path_patterns

def main():
    # Load reference data
    script_dir = os.path.dirname(os.path.abspath(__file__))
    json_path = os.path.join(script_dir, '..', 'api', 'sections-references', 'section-13.json')
    
    with open(json_path, 'r') as f:
        data = json.load(f)
    
    print('🔍 COMPLETE SECTION 13 FIELD ANALYSIS')
    print('=' * 60)
    
    # Count all fields
    total_fields, field_list = count_all_fields(data)
    
    print(f'📊 TOTAL FIELDS FOUND: {total_fields}')
    print(f'📊 EXPECTED FIELDS: 1086')
    
    if total_fields != 1086:
        print(f'⚠️  Field count mismatch!')
        print(f'   Difference: {1086 - total_fields}')
        if total_fields < 1086:
            print(f'   Missing: {1086 - total_fields} fields')
        else:
            print(f'   Extra: {total_fields - 1086} fields')
    else:
        print('✅ Field count matches expected 1086!')
    
    # Analyze field structure
    value_patterns, path_patterns = analyze_field_structure(field_list)
    
    print('\n📋 FIELD DISTRIBUTION BY VALUE PATTERN:')
    for pattern, fields in sorted(value_patterns.items()):
        print(f'  {pattern}: {len(fields)} fields')
        if len(fields) <= 5:
            for field in fields[:3]:
                print(f'    - {field["value"]}')
        else:
            for field in fields[:3]:
                print(f'    - {field["value"]}')
            print(f'    ... and {len(fields) - 3} more')
    
    print('\n📋 FIELD DISTRIBUTION BY PATH PATTERN:')
    for pattern, fields in sorted(path_patterns.items()):
        print(f'  {pattern}: {len(fields)} fields')
    
    # Show first 20 fields for debugging
    print('\n🔍 FIRST 20 FIELDS:')
    for i, field in enumerate(field_list[:20]):
        print(f'  {i+1:3d}. {field["value"]} (path: {field["path"]})')
    
    if len(field_list) > 20:
        print(f'  ... and {len(field_list) - 20} more fields')
    
    # Check for unique string values only
    string_fields = [field for field in field_list if isinstance(field['value'], str)]
    unique_string_values = set(field['value'] for field in string_fields)

    print(f'\n📊 STRING FIELD INSTANCES: {len(string_fields)}')
    print(f'📊 UNIQUE STRING VALUES: {len(unique_string_values)}')
    print(f'📊 TOTAL FIELD INSTANCES: {len(field_list)}')
    print(f'📊 NON-STRING FIELDS: {len(field_list) - len(string_fields)}')

    # Analyze what the 1086 might refer to
    print(f'\n🎯 ANALYSIS FOR 1086 TARGET:')

    # Count sect13A.* fields (official form fields)
    sect_fields = [field for field in string_fields if field['value'].startswith('sect13A.')]
    print(f'   sect13A.* fields: {len(sect_fields)}')

    # Count legacy 13A* fields
    legacy_fields = [field for field in string_fields if any(x in field['value'] for x in ['13A1', '13A2', '13A3', '13A4', '13A5', '13A6']) and not field['value'].startswith('sect13A.')]
    print(f'   Legacy 13A* fields: {len(legacy_fields)}')

    # Count other string fields
    other_string_fields = [field for field in string_fields if not field['value'].startswith('sect13A.') and not any(x in field['value'] for x in ['13A1', '13A2', '13A3', '13A4', '13A5', '13A6'])]
    print(f'   Other string fields: {len(other_string_fields)}')

    total_string_unique = len(unique_string_values)
    print(f'   Total unique strings: {total_string_unique}')

    if total_string_unique == 1086:
        print('✅ FOUND IT! 1086 = Total unique string field values')
    elif len(sect_fields) + len(legacy_fields) == 1086:
        print('✅ FOUND IT! 1086 = sect13A.* + legacy 13A* fields')
    else:
        print(f'🔍 1086 target not yet identified. Closest: {total_string_unique}')

    return total_fields, field_list, value_patterns, path_patterns

if __name__ == '__main__':
    main()
