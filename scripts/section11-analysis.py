#!/usr/bin/env python3
"""
Section 11 Analysis Tool - Quick field coverage analysis
"""

import json
import os
import re
import pandas as pd
from pathlib import Path
from typing import Dict, List, Set, Tuple, Any
from collections import defaultdict

def main():
    """Main analysis function"""
    print("🚀 Starting Section 11 Analysis")
    print("=" * 60)
    
    # Paths
    project_root = Path(__file__).parent.parent
    json_path = project_root / 'api' / 'sections-references' / 'section-11.json'
    ts_interface_path = project_root / 'api' / 'interfaces' / 'sections2.0' / 'section11.ts'
    
    # Load JSON data
    print("📄 Loading section-11.json...")
    with open(json_path, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    print(f"✅ Loaded {len(data['fields'])} fields from section-11.json")
    print(f"📊 Metadata: {data['metadata']['totalFields']} total fields")
    
    # Analyze field patterns
    print("\n🔍 Analyzing field patterns...")
    
    entry_patterns = defaultdict(int)
    field_types = defaultdict(int)
    
    for field in data['fields']:
        field_name = field['name']
        field_type = field['type']
        
        # Count field types
        field_types[field_type] += 1
        
        # Extract entry patterns
        if 'Section11[0]' in field_name:
            entry_patterns['Entry 1 (Section11[0])'] += 1
        elif 'Section11-2[0]' in field_name:
            entry_patterns['Entry 2 (Section11-2[0])'] += 1
        elif 'Section11-3[0]' in field_name:
            entry_patterns['Entry 3 (Section11-3[0])'] += 1
        elif 'Section11-4[0]' in field_name:
            entry_patterns['Entry 4 (Section11-4[0])'] += 1
    
    print("\n📊 ENTRY DISTRIBUTION:")
    for pattern, count in entry_patterns.items():
        print(f"  {pattern}: {count} fields")
    
    print("\n📊 FIELD TYPE DISTRIBUTION:")
    for field_type, count in field_types.items():
        print(f"  {field_type}: {count} fields")
    
    # Analyze TypeScript interface
    print("\n🔧 Analyzing TypeScript interface...")
    
    with open(ts_interface_path, 'r', encoding='utf-8') as f:
        ts_content = f.read()
    
    # Count field name constants
    field_names_pattern = r'SECTION11_FIELD_NAMES\s*=\s*{([^}]+)}'
    field_names_match = re.search(field_names_pattern, ts_content, re.DOTALL)
    
    ts_field_count = 0
    if field_names_match:
        field_names_content = field_names_match.group(1)
        field_paths = re.findall(r'"([^"]*form1\[0\]\.Section11[^"]*)"', field_names_content)
        ts_field_count = len(field_paths)
    
    print(f"✅ TypeScript interface defines {ts_field_count} field constants")
    
    # Summary
    print("\n📋 SUMMARY:")
    print(f"  JSON fields (source of truth): {len(data['fields'])}")
    print(f"  TypeScript field constants: {ts_field_count}")
    print(f"  Coverage gap: {len(data['fields']) - ts_field_count} fields")
    
    # Check if all 4 entries are covered
    print("\n⚠️ CRITICAL FINDINGS:")
    if entry_patterns['Entry 1 (Section11[0])'] > 0:
        print("  ✅ Entry 1 fields found in JSON")
    else:
        print("  ❌ Entry 1 fields missing from JSON")
        
    if entry_patterns['Entry 2 (Section11-2[0])'] > 0:
        print("  ✅ Entry 2 fields found in JSON")
    else:
        print("  ❌ Entry 2 fields missing from JSON")
        
    if entry_patterns['Entry 3 (Section11-3[0])'] > 0:
        print("  ✅ Entry 3 fields found in JSON")
    else:
        print("  ❌ Entry 3 fields missing from JSON")
        
    if entry_patterns['Entry 4 (Section11-4[0])'] > 0:
        print("  ✅ Entry 4 fields found in JSON")
    else:
        print("  ❌ Entry 4 fields missing from JSON")
    
    if ts_field_count < len(data['fields']):
        print(f"  ⚠️ TypeScript interface is missing {len(data['fields']) - ts_field_count} field definitions")
        print("  📝 Need to add field constants for entries 2, 3, and 4")
    
    # Sample field names for each entry
    print("\n📝 SAMPLE FIELD NAMES BY ENTRY:")
    sample_fields = defaultdict(list)
    
    for field in data['fields'][:20]:  # First 20 fields as samples
        field_name = field['name']
        if 'Section11[0]' in field_name:
            sample_fields['Entry 1'].append(field_name)
        elif 'Section11-2[0]' in field_name:
            sample_fields['Entry 2'].append(field_name)
        elif 'Section11-3[0]' in field_name:
            sample_fields['Entry 3'].append(field_name)
        elif 'Section11-4[0]' in field_name:
            sample_fields['Entry 4'].append(field_name)
    
    for entry, fields in sample_fields.items():
        print(f"\n  {entry}:")
        for field in fields[:3]:  # Show first 3 samples
            print(f"    - {field}")
    
    return len(data['fields']) == ts_field_count

if __name__ == "__main__":
    success = main()
    exit(0 if success else 1)
