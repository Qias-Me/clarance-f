#!/usr/bin/env python3
"""
Verify the actual field pattern for Section 16 based on field indices
"""

import json
import re
from collections import defaultdict

def verify_field_pattern():
    """Verify the field pattern based on indices"""
    
    # Load the JSON file
    with open('api/sections-references/section-16.json', 'r') as f:
        data = json.load(f)
    
    fields = data['fields']
    print(f"Total fields: {len(fields)}")
    
    # Analyze Section16_3 field patterns by index ranges
    section16_3_fields = [f for f in fields if 'Section16_3' in f['name']]
    print(f"Section16_3 fields: {len(section16_3_fields)}")
    
    # Group TextField11 by index ranges
    textfield_pattern = defaultdict(list)
    other_fields = []
    
    for field in section16_3_fields:
        name = field['name']
        
        # Check for TextField11[X] pattern
        textfield_match = re.search(r'TextField11\[(\d+)\]', name)
        if textfield_match:
            index = int(textfield_match.group(1))
            
            # Determine which person based on index range
            if 0 <= index <= 10:
                person = 1
            elif 11 <= index <= 21:
                person = 2
            elif 22 <= index <= 32:
                person = 3
            else:
                person = 0  # Unknown
            
            textfield_pattern[person].append((index, field))
        else:
            other_fields.append(field)
    
    print(f"\nTextField11 distribution:")
    for person in sorted(textfield_pattern.keys()):
        if person == 0:
            print(f"  Unknown person: {len(textfield_pattern[person])} fields")
        else:
            indices = [idx for idx, _ in textfield_pattern[person]]
            print(f"  Person {person}: {len(textfield_pattern[person])} fields (indices {min(indices)}-{max(indices)})")
    
    print(f"  Other Section16_3 fields: {len(other_fields)}")
    
    # Check other field patterns (suffix, p3-t68, etc.)
    print(f"\nOther field patterns:")
    
    # Suffix pattern
    suffix_fields = [f for f in section16_3_fields if 'suffix[' in f['name']]
    suffix_indices = []
    for field in suffix_fields:
        match = re.search(r'suffix\[(\d+)\]', field['name'])
        if match:
            suffix_indices.append(int(match.group(1)))
    print(f"  Suffix fields: {len(suffix_fields)} (indices: {sorted(suffix_indices)})")
    
    # Phone pattern (p3-t68)
    phone_fields = [f for f in section16_3_fields if 'p3-t68[' in f['name']]
    phone_indices = []
    for field in phone_fields:
        match = re.search(r'p3-t68\[(\d+)\]', field['name'])
        if match:
            phone_indices.append(int(match.group(1)))
    print(f"  Phone fields: {len(phone_fields)} (indices: {sorted(phone_indices)})")
    
    # Area-specific fields
    area_fields = [f for f in section16_3_fields if '#area[' in f['name']]
    area_counts = defaultdict(int)
    for field in area_fields:
        match = re.search(r'#area\[(\d+)\]', field['name'])
        if match:
            area_counts[int(match.group(1))] += 1
    print(f"  Area-specific fields:")
    for area in sorted(area_counts.keys()):
        print(f"    Area {area}: {area_counts[area]} fields")
    
    # Calculate total fields per person
    print(f"\n=== CALCULATING FIELDS PER PERSON ===")
    
    # Person-specific TextField11 fields
    person1_textfields = len(textfield_pattern.get(1, []))
    person2_textfields = len(textfield_pattern.get(2, []))
    person3_textfields = len(textfield_pattern.get(3, []))
    
    # Area-specific fields (dates known)
    person1_area = area_counts.get(0, 0)
    person2_area = area_counts.get(1, 0)
    person3_area = area_counts.get(2, 0)
    
    # Shared fields that apply to each person
    # Suffix: 1 per person (indices 0, 1, 2)
    # Phone: 2 per person (indices 0-1, 2-3, 4-5)
    # Other shared fields divided by 3
    
    remaining_fields = len(other_fields) - len(suffix_fields) - len(phone_fields) - sum(area_counts.values())
    shared_per_person = remaining_fields // 3
    
    print(f"Person 1 fields:")
    print(f"  TextField11: {person1_textfields}")
    print(f"  Area-specific: {person1_area}")
    print(f"  Suffix: 1")
    print(f"  Phone: 2")
    print(f"  Other shared: {shared_per_person}")
    person1_total = person1_textfields + person1_area + 1 + 2 + shared_per_person
    print(f"  TOTAL: {person1_total}")
    
    print(f"\nPerson 2 fields:")
    print(f"  TextField11: {person2_textfields}")
    print(f"  Area-specific: {person2_area}")
    print(f"  Suffix: 1")
    print(f"  Phone: 2")
    print(f"  Other shared: {shared_per_person}")
    person2_total = person2_textfields + person2_area + 1 + 2 + shared_per_person
    print(f"  TOTAL: {person2_total}")
    
    print(f"\nPerson 3 fields:")
    print(f"  TextField11: {person3_textfields}")
    print(f"  Area-specific: {person3_area}")
    print(f"  Suffix: 1")
    print(f"  Phone: 2")
    print(f"  Other shared: {shared_per_person}")
    person3_total = person3_textfields + person3_area + 1 + 2 + shared_per_person
    print(f"  TOTAL: {person3_total}")
    
    # Section16_1 (Foreign Organization)
    section16_1_fields = [f for f in fields if 'Section16_1' in f['name']]
    foreign_org_total = len(section16_1_fields)
    print(f"\nForeign Organization (Section16_1): {foreign_org_total}")
    
    # Check if this matches 4 entries × 52 fields
    entries = [foreign_org_total, person1_total, person2_total, person3_total]
    total_calculated = sum(entries)
    avg_per_entry = total_calculated / 4
    
    print(f"\n=== FINAL CALCULATION ===")
    print(f"Entry 1 (Foreign Org): {foreign_org_total} fields")
    print(f"Entry 2 (Person 1): {person1_total} fields")
    print(f"Entry 3 (Person 2): {person2_total} fields")
    print(f"Entry 4 (Person 3): {person3_total} fields")
    print(f"Total: {total_calculated} fields")
    print(f"Average per entry: {avg_per_entry:.1f} fields")
    
    if abs(avg_per_entry - 52) < 5:
        print("✅ This matches the expected ~52 fields per entry!")
    else:
        print("❌ This doesn't match 52 fields per entry")

if __name__ == "__main__":
    verify_field_pattern()
