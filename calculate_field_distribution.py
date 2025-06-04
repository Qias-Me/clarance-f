#!/usr/bin/env python3
"""
Calculate exact field distribution for Section 16 to understand 4 entries pattern
"""

import json
import re
from collections import defaultdict

def calculate_field_distribution():
    """Calculate exact field distribution"""
    
    # Load the JSON file
    with open('api/sections-references/section-16.json', 'r') as f:
        data = json.load(f)
    
    fields = data['fields']
    print(f"Total fields: {len(fields)}")
    
    # Separate Section16_1 and Section16_3
    section16_1_fields = []
    section16_3_fields = []
    
    for field in fields:
        name = field['name']
        if 'Section16_1' in name:
            section16_1_fields.append(field)
        elif 'Section16_3' in name:
            section16_3_fields.append(field)
    
    print(f"Section16_1 fields: {len(section16_1_fields)}")
    print(f"Section16_3 fields: {len(section16_3_fields)}")
    
    # Analyze Section16_3 field distribution
    section16_3_by_area = defaultdict(list)
    section16_3_shared = []
    
    for field in section16_3_fields:
        name = field['name']
        area_match = re.search(r'#area\[(\d+)\]', name)
        if area_match:
            area = int(area_match.group(1))
            section16_3_by_area[area].append(field)
        else:
            section16_3_shared.append(field)
    
    print(f"\nSection16_3 breakdown:")
    print(f"  Shared fields (no area): {len(section16_3_shared)}")
    for area in sorted(section16_3_by_area.keys()):
        print(f"  Area {area}: {len(section16_3_by_area[area])} fields")
    
    # Calculate if shared fields should be distributed among areas
    total_area_fields = sum(len(fields) for fields in section16_3_by_area.values())
    shared_fields_count = len(section16_3_shared)
    
    print(f"\nTotal area-specific fields: {total_area_fields}")
    print(f"Total shared fields: {shared_fields_count}")
    
    # If we assume shared fields are replicated for each person
    num_people = len(section16_3_by_area)  # Should be 3
    if num_people > 0:
        shared_per_person = shared_fields_count // num_people
        remaining_shared = shared_fields_count % num_people
        
        print(f"\nIf shared fields are distributed among {num_people} people:")
        print(f"  Shared fields per person: {shared_per_person}")
        print(f"  Remaining shared fields: {remaining_shared}")
        
        # Calculate total fields per person
        for area in sorted(section16_3_by_area.keys()):
            area_specific = len(section16_3_by_area[area])
            total_for_person = area_specific + shared_per_person
            print(f"  Person {area + 1}: {area_specific} area-specific + {shared_per_person} shared = {total_for_person} fields")
    
    # Check the 4 entries × 52 fields hypothesis
    print(f"\n=== TESTING 4 ENTRIES × 52 FIELDS HYPOTHESIS ===")
    
    # Entry 1: Section16_1 (Foreign Organization)
    entry1_fields = len(section16_1_fields)
    
    # Entries 2-4: Section16_3 people
    if num_people == 3:
        # Distribute shared fields equally
        shared_per_person = shared_fields_count // 3
        
        entry2_fields = len(section16_3_by_area.get(0, [])) + shared_per_person
        entry3_fields = len(section16_3_by_area.get(1, [])) + shared_per_person  
        entry4_fields = len(section16_3_by_area.get(2, [])) + shared_per_person
        
        print(f"Entry 1 (Foreign Org): {entry1_fields} fields")
        print(f"Entry 2 (Person 1): {entry2_fields} fields")
        print(f"Entry 3 (Person 2): {entry3_fields} fields")
        print(f"Entry 4 (Person 3): {entry4_fields} fields")
        
        total_calculated = entry1_fields + entry2_fields + entry3_fields + entry4_fields
        print(f"Total calculated: {total_calculated}")
        print(f"Actual total: {len(fields)}")
        
        # Check if close to 52 each
        entries = [entry1_fields, entry2_fields, entry3_fields, entry4_fields]
        avg_fields = sum(entries) / len(entries)
        print(f"Average fields per entry: {avg_fields:.1f}")
        
        if abs(avg_fields - 52) < 10:
            print("✅ Close to 52 fields per entry!")
        else:
            print("❌ Not close to 52 fields per entry")
            
        # Show variance
        for i, count in enumerate(entries, 1):
            diff = count - 52
            print(f"  Entry {i}: {count} fields ({diff:+d} from 52)")
    
    # Show some example shared fields
    print(f"\n=== EXAMPLE SHARED FIELDS (Section16_3) ===")
    for i, field in enumerate(section16_3_shared[:10]):
        print(f"{field['name']} - {field.get('label', 'No label')[:50]}...")

if __name__ == "__main__":
    calculate_field_distribution()
