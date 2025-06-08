#!/usr/bin/env python3
"""
Section 9 Field Analysis Script

This script analyzes the section-9.json reference data to:
1. Extract all 78 unique field names
2. Categorize them by subsection (9.1, 9.2, 9.3, 9.4)
3. Identify missing fields from the TypeScript interface
4. Generate field mapping recommendations
"""

import json
import os
from collections import defaultdict

def load_section9_data():
    """Load the section-9.json reference data"""
    script_dir = os.path.dirname(os.path.abspath(__file__))
    json_path = os.path.join(script_dir, '..', 'api', 'sections-references', 'section-9.json')
    
    with open(json_path, 'r') as f:
        return json.load(f)

def analyze_field_patterns(fields):
    """Analyze field patterns to categorize by subsection"""
    patterns = {
        'main_status': [],
        'section_9_1': [],  # Born to US Parents (Sections7-9 pattern)
        'section_9_2': [],  # Naturalized (Section9\.1-9\.4 pattern)
        'section_9_3': [],  # Derived (Section9\.1-9\.4 pattern)
        'section_9_4': [],  # Non-US Citizen (Section9\.1-9\.4 pattern)
        'unknown': []
    }
    
    for field in fields:
        name = field['name']
        field_type = field['type']
        value = field.get('value', '')
        
        # Categorize by field name pattern
        if 'Sections7-9[0].RadioButtonList[1]' in name:
            patterns['main_status'].append(field)
        elif 'Sections7-9[0]' in name:
            patterns['section_9_1'].append(field)
        elif 'Section9\\.1-9\\.4[0]' in name:
            # Further categorize 9.2, 9.3, 9.4 based on field values and positions
            if any(keyword in str(value).lower() for keyword in ['naturalization', 'court', 'sect9.2']):
                patterns['section_9_2'].append(field)
            elif any(keyword in str(value).lower() for keyword in ['sect9.3', 'derived', 'certificate']):
                patterns['section_9_3'].append(field)
            elif any(keyword in str(value).lower() for keyword in ['sect9.4', '9.4', 'alien', 'document']):
                patterns['section_9_4'].append(field)
            else:
                # Default categorization based on field position/type
                if 'TextField11[17]' in name or 'TextField11[18]' in name or 'TextField11[19]' in name:
                    patterns['section_9_3'].append(field)
                elif 'TextField11[8]' in name or 'TextField11[9]' in name:
                    patterns['section_9_4'].append(field)
                else:
                    patterns['section_9_2'].append(field)
        else:
            patterns['unknown'].append(field)
    
    return patterns

def print_field_analysis(patterns):
    """Print detailed field analysis"""
    print('🔍 SECTION 9 FIELD ANALYSIS')
    print('=' * 60)
    
    total_fields = sum(len(fields) for fields in patterns.values())
    print(f'📊 TOTAL FIELDS: {total_fields}')
    print(f'📊 EXPECTED: 78 fields')
    print()
    
    for section, fields in patterns.items():
        print(f'📋 {section.upper().replace("_", " ")}: {len(fields)} fields')
        for field in fields:
            field_type = field['type']
            name = field['name']
            value = field.get('value', '')
            
            # Truncate long values for display
            if isinstance(value, str) and len(value) > 50:
                value = value[:47] + '...'
            elif isinstance(value, list):
                value = f'[{len(value)} options]'
            
            print(f'  • {field_type}: {name}')
            print(f'    Value: {value}')
        print()

def identify_missing_fields():
    """Identify fields that might be missing from the TypeScript interface"""
    
    # Current interface field count (from previous analysis)
    current_mapped = 64
    expected_total = 78
    missing_count = expected_total - current_mapped
    
    print(f'⚠️  MISSING FIELDS ANALYSIS')
    print(f'   Current mapped: {current_mapped}')
    print(f'   Expected total: {expected_total}')
    print(f'   Missing: {missing_count} fields')
    print()
    
    # Key missing field patterns identified
    missing_patterns = [
        'Additional date fields (From_Datefield_Name_2[5], [6])',
        'Checkbox fields (#field[50], [51], [53], [55])',
        'Dropdown fields (DropDownList15[1-3])',
        'State fields (School6_State[2])',
        'Text fields (TextField11[17-25])',
        'Radio button fields (RadioButtonList[1] for derived citizenship)',
        'Additional estimation checkboxes',
        'Country citizenship fields',
        'Document type radio buttons'
    ]
    
    print('🔍 LIKELY MISSING FIELD PATTERNS:')
    for i, pattern in enumerate(missing_patterns, 1):
        print(f'   {i}. {pattern}')
    print()

def main():
    # Load reference data
    data = load_section9_data()
    fields = data['fields']
    
    print('🏗️  SECTION 9 REFERENCE DATA AUDIT')
    print('=' * 60)
    print(f'📊 Metadata: {data["metadata"]["totalFields"]} fields')
    print(f'📊 Field Types: {data["statistics"]["fieldTypes"]}')
    print()
    
    # Analyze field patterns
    patterns = analyze_field_patterns(fields)
    
    # Print analysis
    print_field_analysis(patterns)
    
    # Identify missing fields
    identify_missing_fields()
    
    # Generate recommendations
    print('💡 RECOMMENDATIONS:')
    print('   1. Add missing date fields for derived citizenship section')
    print('   2. Add checkbox fields for estimation flags')
    print('   3. Add additional dropdown fields for multiple citizenships')
    print('   4. Add radio button fields for document types')
    print('   5. Update interface to include all 78 fields')
    print('   6. Verify field mappings in createDefaultSection9()')

if __name__ == '__main__':
    main()
