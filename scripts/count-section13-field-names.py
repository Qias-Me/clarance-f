#!/usr/bin/env python3
"""
Count unique field names in section-13.json
Focus only on the 'name' property of each field object
"""

import json
import os

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
    
    print('🔍 SECTION 13 FIELD NAME ANALYSIS')
    print('=' * 50)
    
    # Extract only the 'name' fields
    field_names = set()
    total_field_objects = 0
    fields_with_names = 0
    
    if 'fields' in data and isinstance(data['fields'], list):
        for field in data['fields']:
            total_field_objects += 1
            if isinstance(field, dict) and 'name' in field and isinstance(field['name'], str):
                field_names.add(field['name'])
                fields_with_names += 1
    
    print(f'📊 Total field objects: {total_field_objects}')
    print(f'📊 Fields with "name" property: {fields_with_names}')
    print(f'📊 Unique field names: {len(field_names)}')
    print(f'📊 Expected field names: 1086')
    
    if len(field_names) == 1086:
        print('✅ Perfect match! All 1,086 field names are available')
    elif len(field_names) > 1086:
        print(f'⚠️  Extra fields: {len(field_names) - 1086} more than expected')
    else:
        print(f'❌ Missing fields: {1086 - len(field_names)} fields short of target')
    
    # Show first 20 field names as examples
    print('\n📋 FIRST 20 FIELD NAMES:')
    field_names_list = sorted(list(field_names))
    for i, name in enumerate(field_names_list[:20]):
        print(f'   {i + 1}. {name}')
    
    if len(field_names_list) > 20:
        print(f'   ... and {len(field_names_list) - 20} more field names')
    
    # Check for form1[0] pattern (PDF field names)
    pdf_field_names = [name for name in field_names_list if name.startswith('form1[0]')]
    print(f'\n📋 PDF FIELD NAMES (form1[0].*): {len(pdf_field_names)}')
    
    if pdf_field_names:
        print('📋 FIRST 10 PDF FIELD NAMES:')
        for i, name in enumerate(pdf_field_names[:10]):
            print(f'   {i + 1}. {name}')
    
    # Summary
    print(f'\n🎯 SUMMARY:')
    print(f'   Total unique field names: {len(field_names)}')
    print(f'   PDF field names: {len(pdf_field_names)}')
    print(f'   Target: 1086 fields')
    print(f'   Status: {"✅ COMPLETE" if len(field_names) >= 1086 else "❌ INCOMPLETE"}')

if __name__ == '__main__':
    main()
