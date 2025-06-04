#!/usr/bin/env python3
"""
Section 16 Field Analysis Script
Analyzes all 154 fields in section-16.json to understand the complete structure
"""

import json
import re
from collections import defaultdict

def analyze_section16_fields():
    """Analyze all Section 16 fields and categorize them"""
    
    # Load the JSON file
    with open('api/sections-references/section-16.json', 'r') as f:
        data = json.load(f)
    
    fields = data['fields']
    
    # Categorize fields
    section16_1_fields = []
    section16_3_fields = []
    
    for field in fields:
        name = field['name']
        label = field.get('label', '')
        field_type = field.get('type', '')
        
        field_info = {
            'name': name,
            'label': label,
            'type': field_type,
            'page': field.get('page', 0)
        }
        
        if 'Section16_1' in name:
            section16_1_fields.append(field_info)
        elif 'Section16_3' in name:
            section16_3_fields.append(field_info)
    
    # Remove duplicates and sort
    section16_1_unique = {}
    section16_3_unique = {}
    
    for field in section16_1_fields:
        if field['name'] not in section16_1_unique:
            section16_1_unique[field['name']] = field
    
    for field in section16_3_fields:
        if field['name'] not in section16_3_unique:
            section16_3_unique[field['name']] = field
    
    print("=== SECTION 16 FIELD ANALYSIS ===")
    print(f"Total fields in JSON: {len(fields)}")
    print(f"Section16_1 unique fields: {len(section16_1_unique)}")
    print(f"Section16_3 unique fields: {len(section16_3_unique)}")
    print(f"Total unique fields: {len(section16_1_unique) + len(section16_3_unique)}")
    print()
    
    print("=== SECTION16_1 FIELDS (CONTACTS) ===")
    for name, field in sorted(section16_1_unique.items()):
        print(f"{name}")
        print(f"  Label: {field['label']}")
        print(f"  Type: {field['type']}")
        print()
    
    print("=== SECTION16_3 FIELDS (PEOPLE) ===")
    for name, field in sorted(section16_3_unique.items()):
        print(f"{name}")
        print(f"  Label: {field['label']}")
        print(f"  Type: {field['type']}")
        print()

if __name__ == "__main__":
    analyze_section16_fields()
