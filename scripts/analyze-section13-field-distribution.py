#!/usr/bin/env python3
"""
Phase 1: Analyze Section 13 Field Distribution
Analyze the 1,086 fields in section-13.json to understand patterns, subsections, and create mapping strategy
"""

import json
import os
import re
from collections import defaultdict, Counter

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
    
    print('🔍 SECTION 13 FIELD DISTRIBUTION ANALYSIS')
    print('=' * 60)
    
    # Extract field names
    field_names = []
    if 'fields' in data and isinstance(data['fields'], list):
        for field in data['fields']:
            if isinstance(field, dict) and 'name' in field and isinstance(field['name'], str):
                field_names.append(field['name'])
    
    print(f'📊 Total unique field names: {len(field_names)}')
    print(f'📊 Expected: 1086 fields')
    
    # Analyze field patterns
    print(f'\n🔍 FIELD PATTERN ANALYSIS:')
    
    # Group by section patterns
    section_patterns = defaultdict(list)
    for field_name in field_names:
        # Extract section pattern (e.g., section_13_1-2, section13_2, etc.)
        if 'section' in field_name:
            # Match patterns like section_13_1-2, section13_2, section13_3, etc.
            section_match = re.search(r'section[_]?13[_-]?(\d+(?:-\d+)?)', field_name)
            if section_match:
                section_key = f"section13_{section_match.group(1)}"
                section_patterns[section_key].append(field_name)
            else:
                section_patterns['other_section'].append(field_name)
        else:
            section_patterns['no_section'].append(field_name)
    
    print(f'📋 SECTION DISTRIBUTION:')
    total_categorized = 0
    for section, fields in sorted(section_patterns.items()):
        print(f'   {section}: {len(fields)} fields')
        total_categorized += len(fields)
    
    # Analyze field types
    print(f'\n🔍 FIELD TYPE ANALYSIS:')
    field_types = Counter()
    for field_name in field_names:
        if 'TextField' in field_name:
            field_types['TextField'] += 1
        elif 'RadioButtonList' in field_name:
            field_types['RadioButtonList'] += 1
        elif 'CheckBox' in field_name:
            field_types['CheckBox'] += 1
        elif 'DropDownList' in field_name:
            field_types['DropDownList'] += 1
        elif 'State' in field_name:
            field_types['State'] += 1
        else:
            field_types['Other'] += 1
    
    print(f'📋 FIELD TYPE DISTRIBUTION:')
    for field_type, count in field_types.most_common():
        print(f'   {field_type}: {count} fields')
    
    # Analyze subsection patterns for mapping strategy
    print(f'\n🔍 SUBSECTION MAPPING STRATEGY:')
    
    subsection_mapping = {
        'section13_1-2': '13A.1 Federal Employment',
        'section13_2': '13A.2 Non-Federal Employment', 
        'section13_3': '13A.3 Self-Employment',
        'section13_4': '13A.4 Unemployment',
        'section13_5': '13A.5 Employment Issues',
        'section13_6': '13A.6 Disciplinary Actions'
    }
    
    print(f'📋 RECOMMENDED MAPPING PHASES:')
    phase_num = 3  # Starting from Phase 3 (after analysis and generator)
    for section_key, description in subsection_mapping.items():
        field_count = len(section_patterns.get(section_key, []))
        if field_count > 0:
            print(f'   Phase {phase_num}: {description} - {field_count} fields')
            phase_num += 1
    
    # Show sample fields for each major section
    print(f'\n🔍 SAMPLE FIELDS BY SECTION:')
    for section_key, description in subsection_mapping.items():
        fields = section_patterns.get(section_key, [])
        if fields:
            print(f'\n📋 {description} ({section_key}):')
            # Show first 5 fields as examples
            for i, field in enumerate(sorted(fields)[:5]):
                print(f'   {i+1}. {field}')
            if len(fields) > 5:
                print(f'   ... and {len(fields) - 5} more fields')
    
    # Generate mapping strategy report
    print(f'\n🎯 MAPPING STRATEGY SUMMARY:')
    print(f'   Total fields to map: {len(field_names)}')
    print(f'   Currently mapped: ~20 fields (~1.8%)')
    print(f'   Remaining to map: ~{len(field_names) - 20} fields')
    print(f'   Recommended approach: Incremental by subsection')
    print(f'   Estimated phases needed: {len([s for s in subsection_mapping.keys() if section_patterns.get(s)])}')
    
    # Save detailed analysis to file
    output_path = os.path.join(script_dir, 'section13-field-analysis-report.json')
    analysis_report = {
        'total_fields': len(field_names),
        'section_distribution': {k: len(v) for k, v in section_patterns.items()},
        'field_type_distribution': dict(field_types),
        'subsection_mapping': subsection_mapping,
        'sample_fields_by_section': {k: sorted(v)[:10] for k, v in section_patterns.items() if v}
    }
    
    try:
        with open(output_path, 'w', encoding='utf-8') as f:
            json.dump(analysis_report, f, indent=2)
        print(f'\n✅ Detailed analysis saved to: {output_path}')
    except Exception as e:
        print(f'⚠️  Could not save analysis report: {e}')

if __name__ == '__main__':
    main()
