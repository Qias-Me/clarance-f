#!/usr/bin/env python3
"""
Generate Complete Section 13 Field Mapping for All 1,086 Fields
Creates TypeScript interface mappings for every PDF form field
"""

import json
import os
from collections import defaultdict

def load_reference_data():
    """Load the section-13.json reference data"""
    script_dir = os.path.dirname(os.path.abspath(__file__))
    json_path = os.path.join(script_dir, '..', 'api', 'sections-references', 'section-13.json')
    
    with open(json_path, 'r') as f:
        return json.load(f)

def generate_field_mappings(data):
    """Generate comprehensive field mappings for all 1,086 fields"""
    fields_array = data['fields']
    
    mappings = {
        'TEXT_FIELDS': {},
        'CHECKBOX_FIELDS': {},
        'RADIO_FIELDS': {},
        'DROPDOWN_FIELDS': {},
        'STRING_VALUES': {}
    }
    
    # Process each field
    for i, field in enumerate(fields_array):
        field_type = field.get('type', 'unknown')
        field_name = field.get('name', f'field_{i}')
        field_value = field.get('value')
        field_id = field.get('id', '')
        unique_id = field.get('uniqueId', '')
        
        # Generate a clean mapping key
        mapping_key = generate_mapping_key(field_name, i)
        
        # Categorize by field type
        if field_type == 'PDFTextField':
            mappings['TEXT_FIELDS'][mapping_key] = field_name
        elif field_type == 'PDFCheckBox':
            mappings['CHECKBOX_FIELDS'][mapping_key] = field_name
        elif field_type == 'PDFRadioGroup':
            mappings['RADIO_FIELDS'][mapping_key] = field_name
        elif field_type == 'PDFDropdown':
            mappings['DROPDOWN_FIELDS'][mapping_key] = field_name
        
        # Add string values
        if isinstance(field_value, str):
            value_key = generate_value_key(field_value)
            mappings['STRING_VALUES'][value_key] = field_value
    
    return mappings

def generate_mapping_key(field_name, index):
    """Generate a clean TypeScript-compatible mapping key"""
    # Replace special characters and make it TypeScript-friendly
    key = field_name.replace('form1[0].', '').replace('[', '_').replace(']', '').replace('.', '_').replace('#', 'FIELD_').replace('-', '_')
    
    # Make it uppercase and add index for uniqueness
    key = key.upper()
    
    # Ensure uniqueness
    return f"{key}_{index}"

def generate_value_key(value):
    """Generate a clean key for string values"""
    # Handle special characters in values
    key = value.replace('.', '_').replace(' ', '_').replace('(', '').replace(')', '').replace(',', '').replace('#', 'NUM')
    
    # Remove non-alphanumeric characters except underscores
    import re
    key = re.sub(r'[^a-zA-Z0-9_]', '', key)
    
    # Make it uppercase
    return key.upper()

def generate_typescript_mappings(mappings):
    """Generate TypeScript mapping code"""
    
    typescript_code = """
// ============================================================================
// COMPLETE SECTION 13 FIELD MAPPINGS (All 1,086 Fields)
// ============================================================================

/**
 * Complete field mappings for Section 13 - ALL 1,086 PDF form fields
 * Generated automatically from section-13.json reference data
 */
export const SECTION13_COMPLETE_FIELD_MAPPINGS = {

  // ============================================================================
  // TEXT FIELDS (PDFTextField)
  // ============================================================================
  TEXT_FIELDS: {
"""
    
    # Add text fields
    for key, value in sorted(mappings['TEXT_FIELDS'].items()):
        typescript_code += f"    '{key}': '{value}',\n"
    
    typescript_code += """  },

  // ============================================================================
  // CHECKBOX FIELDS (PDFCheckBox)
  // ============================================================================
  CHECKBOX_FIELDS: {
"""
    
    # Add checkbox fields
    for key, value in sorted(mappings['CHECKBOX_FIELDS'].items()):
        typescript_code += f"    '{key}': '{value}',\n"
    
    typescript_code += """  },

  // ============================================================================
  // RADIO BUTTON FIELDS (PDFRadioGroup)
  // ============================================================================
  RADIO_FIELDS: {
"""
    
    # Add radio fields
    for key, value in sorted(mappings['RADIO_FIELDS'].items()):
        typescript_code += f"    '{key}': '{value}',\n"
    
    typescript_code += """  },

  // ============================================================================
  // DROPDOWN FIELDS (PDFDropdown)
  // ============================================================================
  DROPDOWN_FIELDS: {
"""
    
    # Add dropdown fields
    for key, value in sorted(mappings['DROPDOWN_FIELDS'].items()):
        typescript_code += f"    '{key}': '{value}',\n"
    
    typescript_code += """  },

  // ============================================================================
  // STRING VALUES (Field Values)
  // ============================================================================
  STRING_VALUES: {
"""
    
    # Add string values
    for key, value in sorted(mappings['STRING_VALUES'].items()):
        typescript_code += f"    '{key}': '{value}',\n"
    
    typescript_code += """  }
} as const;

/**
 * Field count verification
 */
export const SECTION13_FIELD_COUNTS = {
  TEXT_FIELDS: """ + str(len(mappings['TEXT_FIELDS'])) + """,
  CHECKBOX_FIELDS: """ + str(len(mappings['CHECKBOX_FIELDS'])) + """,
  RADIO_FIELDS: """ + str(len(mappings['RADIO_FIELDS'])) + """,
  DROPDOWN_FIELDS: """ + str(len(mappings['DROPDOWN_FIELDS'])) + """,
  STRING_VALUES: """ + str(len(mappings['STRING_VALUES'])) + """,
  TOTAL_FIELDS: """ + str(len(mappings['TEXT_FIELDS']) + len(mappings['CHECKBOX_FIELDS']) + len(mappings['RADIO_FIELDS']) + len(mappings['DROPDOWN_FIELDS'])) + """
} as const;
"""
    
    return typescript_code

def main():
    print('🔧 GENERATING COMPLETE SECTION 13 FIELD MAPPINGS')
    print('=' * 60)
    
    # Load data
    data = load_reference_data()
    
    # Generate mappings
    mappings = generate_field_mappings(data)
    
    print(f'📊 GENERATED MAPPINGS:')
    print(f'   Text fields: {len(mappings["TEXT_FIELDS"])}')
    print(f'   Checkbox fields: {len(mappings["CHECKBOX_FIELDS"])}')
    print(f'   Radio fields: {len(mappings["RADIO_FIELDS"])}')
    print(f'   Dropdown fields: {len(mappings["DROPDOWN_FIELDS"])}')
    print(f'   String values: {len(mappings["STRING_VALUES"])}')
    
    total_fields = len(mappings['TEXT_FIELDS']) + len(mappings['CHECKBOX_FIELDS']) + len(mappings['RADIO_FIELDS']) + len(mappings['DROPDOWN_FIELDS'])
    print(f'   TOTAL FIELDS: {total_fields}/1086')
    
    # Generate TypeScript code
    typescript_code = generate_typescript_mappings(mappings)
    
    # Save to file
    output_path = 'api/interfaces/sections2.0/section13-complete-mappings.ts'
    with open(output_path, 'w') as f:
        f.write(typescript_code)
    
    print(f'\\n✅ COMPLETE MAPPINGS GENERATED!')
    print(f'   Output file: {output_path}')
    print(f'   Coverage: {total_fields}/1086 ({total_fields/1086*100:.1f}%)')
    
    if total_fields == 1086:
        print('🎉 PERFECT! All 1,086 fields mapped!')
    else:
        print(f'⚠️  Missing {1086 - total_fields} fields')
    
    return mappings

if __name__ == '__main__':
    main()
