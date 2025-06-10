#!/usr/bin/env python3
"""
Examine actual field patterns to understand section mapping
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
    
    # Extract field names
    fields = [f['name'] for f in data['fields'] if 'name' in f and isinstance(f['name'], str)]
    
    print('🔍 ACTUAL FIELD PATTERN EXAMINATION')
    print('=' * 60)
    
    # Group fields by exact pattern
    patterns = {}
    for field in fields:
        if 'section13_1-2' in field:
            patterns.setdefault('section13_1-2', []).append(field)
        elif 'section13_1' in field:
            patterns.setdefault('section13_1', []).append(field)
        elif 'section13_2-2' in field:
            patterns.setdefault('section13_2-2', []).append(field)
        elif 'section13_2' in field:
            patterns.setdefault('section13_2', []).append(field)
        elif 'section13_3-2' in field:
            patterns.setdefault('section13_3-2', []).append(field)
        elif 'section13_3' in field:
            patterns.setdefault('section13_3', []).append(field)
        elif 'section13_4' in field:
            patterns.setdefault('section13_4', []).append(field)
        elif 'section13_5' in field:
            patterns.setdefault('section13_5', []).append(field)
        else:
            patterns.setdefault('other', []).append(field)
    
    print(f'📊 FIELD COUNT BY PATTERN:')
    total = 0
    for pattern in sorted(patterns.keys()):
        count = len(patterns[pattern])
        print(f'   {pattern}: {count} fields')
        total += count
    print(f'   TOTAL: {total} fields')
    
    print(f'\n🔍 SAMPLE FIELDS BY PATTERN:')
    for pattern in sorted(patterns.keys()):
        field_list = patterns[pattern]
        print(f'\n📋 {pattern} ({len(field_list)} fields):')
        for i, field in enumerate(sorted(field_list)[:5]):
            print(f'   {i+1}. {field}')
        if len(field_list) > 5:
            print(f'   ... and {len(field_list) - 5} more')
    
    # Try to understand what these patterns mean
    print(f'\n🤔 PATTERN ANALYSIS:')
    print(f'   section13_1 vs section13_1-2: What\'s the difference?')
    print(f'   section13_2 vs section13_2-2: Different entry types?')
    print(f'   section13_3 vs section13_3-2: Multiple forms?')
    
    # Look for clues in field names
    print(f'\n🔍 FIELD NAME CLUES:')
    if 'section13_1' in patterns and 'section13_1-2' in patterns:
        print(f'   section13_1 sample: {sorted(patterns["section13_1"])[0] if patterns["section13_1"] else "None"}')
        print(f'   section13_1-2 sample: {sorted(patterns["section13_1-2"])[0] if patterns["section13_1-2"] else "None"}')
    
    if 'section13_2' in patterns and 'section13_2-2' in patterns:
        print(f'   section13_2 sample: {sorted(patterns["section13_2"])[0] if patterns["section13_2"] else "None"}')
        print(f'   section13_2-2 sample: {sorted(patterns["section13_2-2"])[0] if patterns["section13_2-2"] else "None"}')

if __name__ == '__main__':
    main()
