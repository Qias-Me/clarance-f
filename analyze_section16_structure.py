#!/usr/bin/env python3
"""
Analyze Section 16 structure to understand the 4 entries with 52 fields each pattern
"""

import json
import re
from collections import defaultdict

def analyze_section16_structure():
    """Analyze the actual structure of Section 16"""
    
    # Load the JSON file
    with open('api/sections-references/section-16.json', 'r') as f:
        data = json.load(f)
    
    fields = data['fields']
    print(f"Total fields: {len(fields)}")
    print(f"Expected: 4 entries × 52 fields = 208 fields")
    print(f"But we have: {len(fields)} fields")
    print()
    
    # Group by section and area
    section_groups = defaultdict(lambda: defaultdict(list))
    
    for field in fields:
        name = field['name']
        
        # Extract section (Section16_1 or Section16_3)
        section_match = re.search(r'Section16_(\d+)', name)
        if section_match:
            section = f"Section16_{section_match.group(1)}"
            
            # Extract area if present
            area_match = re.search(r'#area\[(\d+)\]', name)
            if area_match:
                area = f"area_{area_match.group(1)}"
            else:
                area = "no_area"
            
            section_groups[section][area].append(field)
    
    print("=== SECTION BREAKDOWN ===")
    total_counted = 0
    for section, areas in sorted(section_groups.items()):
        section_total = 0
        print(f"\n{section}:")
        for area, area_fields in sorted(areas.items()):
            print(f"  {area}: {len(area_fields)} fields")
            section_total += len(area_fields)
            total_counted += len(area_fields)
        print(f"  TOTAL for {section}: {section_total} fields")
    
    print(f"\nTOTAL COUNTED: {total_counted}")
    print()
    
    # Look for patterns that might indicate 4 entries
    print("=== LOOKING FOR 4-ENTRY PATTERN ===")
    
    # Check if Section16_1 + Section16_3 areas = 4 entries
    section16_1_count = len(section_groups.get('Section16_1', {}).get('no_area', []))
    section16_3_areas = len(section_groups.get('Section16_3', {}))
    
    print(f"Section16_1 (no areas): {section16_1_count} fields")
    print(f"Section16_3 areas: {section16_3_areas} areas")
    print(f"Total logical entries: 1 (Section16_1) + {section16_3_areas} (Section16_3 areas) = {1 + section16_3_areas}")
    
    if 1 + section16_3_areas == 4:
        print("✅ FOUND THE PATTERN!")
        print("4 entries = 1 Section16_1 entry + 3 Section16_3 entries (areas 0,1,2)")
        
        # Calculate fields per entry
        s16_1_fields = section16_1_count
        s16_3_area_fields = []
        for i in range(3):
            area_key = f"area_{i}"
            area_fields = len(section_groups.get('Section16_3', {}).get(area_key, []))
            s16_3_area_fields.append(area_fields)
        
        s16_3_no_area_fields = len(section_groups.get('Section16_3', {}).get('no_area', []))
        
        print(f"\nFIELD DISTRIBUTION:")
        print(f"Entry 1 (Section16_1): {s16_1_fields} fields")
        print(f"Entry 2 (Section16_3 area[0]): {s16_3_area_fields[0]} fields")
        print(f"Entry 3 (Section16_3 area[1]): {s16_3_area_fields[1]} fields") 
        print(f"Entry 4 (Section16_3 area[2]): {s16_3_area_fields[2]} fields")
        print(f"Section16_3 shared (no area): {s16_3_no_area_fields} fields")
        
        # Check if this matches 52 fields per entry
        total_s16_3 = sum(s16_3_area_fields) + s16_3_no_area_fields
        avg_per_entry = (s16_1_fields + total_s16_3) / 4
        print(f"\nAverage fields per entry: {avg_per_entry:.1f}")
        
        if abs(avg_per_entry - 52) < 10:  # Allow some variance
            print("✅ This roughly matches the expected 52 fields per entry!")
        else:
            print("❌ This doesn't match 52 fields per entry")
    
    # Show some example fields from each group
    print("\n=== EXAMPLE FIELDS ===")
    for section, areas in sorted(section_groups.items()):
        print(f"\n{section}:")
        for area, area_fields in sorted(areas.items()):
            print(f"  {area} (first 3 fields):")
            for field in area_fields[:3]:
                print(f"    {field['name']} - {field.get('label', 'No label')}")

if __name__ == "__main__":
    analyze_section16_structure()
