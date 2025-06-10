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
    
    print('🔍 SECTION 13 UNIQUE FIELD NAME ANALYSIS')
    print('=' * 60)
    
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
    
    # Get metadata
    metadata_total = data.get('metadata', {}).get('totalFields', 'Unknown')
    
    print(f'📊 Metadata says total fields: {metadata_total}')
    print(f'📊 Total field objects in JSON: {total_field_objects}')
    print(f'📊 Fields with "name" property: {fields_with_names}')
    print(f'📊 Unique field names: {len(field_names)}')
    print(f'📊 Expected field names: 1086')
    
    print(f'\n🎯 FIELD MAPPING STATUS:')
    if len(field_names) == 1086:
        print('✅ Perfect match! All 1,086 unique field names are available for mapping')
        status = "COMPLETE"
    elif len(field_names) > 1086:
        print(f'⚠️  Extra fields: {len(field_names) - 1086} more unique field names than expected')
        print('✅ More than sufficient field names available for mapping')
        status = "OVER-COMPLETE"
    else:
        print(f'❌ Missing fields: {1086 - len(field_names)} unique field names short of target')
        status = "INCOMPLETE"
    
    # Show first 10 field names as examples
    print(f'\n📋 FIRST 10 UNIQUE FIELD NAMES:')
    field_names_list = sorted(list(field_names))
    for i, name in enumerate(field_names_list[:10]):
        print(f'   {i + 1}. {name}')
    
    if len(field_names_list) > 10:
        print(f'   ... and {len(field_names_list) - 10} more unique field names')
    
    # Check for form1[0] pattern (PDF field names)
    pdf_field_names = [name for name in field_names_list if name.startswith('form1[0]')]
    print(f'\n📋 PDF FIELD NAMES (form1[0].*): {len(pdf_field_names)}')
    
    # Summary
    print(f'\n🎯 FINAL SUMMARY:')
    print(f'   Unique field names available: {len(field_names)}')
    print(f'   PDF field names: {len(pdf_field_names)}')
    print(f'   Target requirement: 1086 fields')
    print(f'   Mapping status: {status}')
    
    if status in ["COMPLETE", "OVER-COMPLETE"]:
        print(f'   ✅ All 1,086 fields CAN be mapped from available field names')
    else:
        print(f'   ❌ Only {len(field_names)} unique field names available for mapping')

if __name__ == '__main__':
    main()
