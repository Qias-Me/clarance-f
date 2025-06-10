#!/usr/bin/env python3
"""
Phase 6: Integrate Unemployment (13A.4) Field Mappings
Extract 13A.4 mappings from generated mappings and integrate into SECTION13_FIELD_MAPPINGS
"""

import json
import os
import re

def main():
    # Load the generated mappings
    script_dir = os.path.dirname(os.path.abspath(__file__))
    generated_mappings_path = os.path.join(script_dir, 'generated-field-mappings.ts')
    
    try:
        with open(generated_mappings_path, 'r', encoding='utf-8') as f:
            content = f.read()
    except Exception as e:
        print(f"❌ Error loading generated mappings: {e}")
        return
    
    print('🔧 INTEGRATING UNEMPLOYMENT (13A.4) FIELD MAPPINGS')
    print('=' * 60)
    
    # Extract Unemployment mappings
    unemployment_mappings = []
    unemployment_additional_mappings = []
    
    # Find all lines with unemployment mappings
    lines = content.split('\n')
    for line in lines:
        if 'section13.unemployment.entries[0]' in line and ':' in line:
            # Clean up the line and extract the mapping
            clean_line = line.strip()
            if clean_line.endswith(','):
                clean_line = clean_line[:-1]  # Remove trailing comma
            unemployment_mappings.append(clean_line)
        elif 'section13.unemploymentAdditional.entries[0]' in line and ':' in line:
            # Additional unemployment mappings
            clean_line = line.strip()
            if clean_line.endswith(','):
                clean_line = clean_line[:-1]  # Remove trailing comma
            unemployment_additional_mappings.append(clean_line)
    
    print(f'📊 EXTRACTED UNEMPLOYMENT MAPPINGS:')
    print(f'   Main Unemployment mappings: {len(unemployment_mappings)}')
    print(f'   Additional Unemployment mappings: {len(unemployment_additional_mappings)}')
    print(f'   Total Unemployment mappings: {len(unemployment_mappings) + len(unemployment_additional_mappings)}')
    
    # Show sample mappings
    print(f'\n📋 SAMPLE MAIN UNEMPLOYMENT MAPPINGS:')
    for i, mapping in enumerate(unemployment_mappings[:10]):
        print(f'   {i+1}. {mapping}')
    
    if len(unemployment_mappings) > 10:
        print(f'   ... and {len(unemployment_mappings) - 10} more main mappings')
    
    if unemployment_additional_mappings:
        print(f'\n📋 SAMPLE ADDITIONAL UNEMPLOYMENT MAPPINGS:')
        for i, mapping in enumerate(unemployment_additional_mappings[:5]):
            print(f'   {i+1}. {mapping}')
        
        if len(unemployment_additional_mappings) > 5:
            print(f'   ... and {len(unemployment_additional_mappings) - 5} more additional mappings')
    
    # Generate the TypeScript code for integration
    print(f'\n🔧 GENERATING INTEGRATION CODE...')
    
    # Create the Unemployment section for SECTION13_FIELD_MAPPINGS
    integration_code = []
    integration_code.append('  // Unemployment (13A.4) - Main section field mappings')
    
    for mapping in unemployment_mappings:
        integration_code.append(f'  {mapping},')
    
    if unemployment_additional_mappings:
        integration_code.append('')
        integration_code.append('  // Unemployment (13A.4) - Additional section field mappings')
        for mapping in unemployment_additional_mappings:
            integration_code.append(f'  {mapping},')
    
    # Save the integration code
    output_path = os.path.join(script_dir, 'unemployment-mappings-integration.ts')
    try:
        with open(output_path, 'w', encoding='utf-8') as f:
            f.write('// Unemployment (13A.4) field mappings for integration\n')
            f.write('// Add these to SECTION13_FIELD_MAPPINGS in section13-field-mapping.ts\n\n')
            f.write('\n'.join(integration_code))
            f.write('\n\n')
            f.write(f'// Total Unemployment mappings: {len(unemployment_mappings) + len(unemployment_additional_mappings)}\n')
            f.write(f'// Main section mappings: {len(unemployment_mappings)}\n')
            f.write(f'// Additional section mappings: {len(unemployment_additional_mappings)}\n')
        
        print(f'✅ Integration code saved to: {output_path}')
    except Exception as e:
        print(f'⚠️  Could not save integration code: {e}')
    
    # Analyze the field coverage
    print(f'\n📊 UNEMPLOYMENT FIELD ANALYSIS:')
    
    all_mappings = unemployment_mappings + unemployment_additional_mappings
    field_types = {
        'firstName': 0,
        'lastName': 0,
        'referenceStreet': 0,
        'referenceCity': 0,
        'referenceState': 0,
        'referenceZip': 0,
        'referencePhone': 0,
        'referenceEmail': 0,
        'referenceAddress': 0,
        'referenceCountry': 0,
        'fromDate': 0,
        'toDate': 0,
        'unemploymentStartDate': 0,
        'unemploymentEndDate': 0,
        'benefitsStartDate': 0,
        'benefitsEndDate': 0,
        'hasReference': 0,
        'receivedBenefits': 0,
        'isCurrentlyUnemployed': 0,
        'additionalInfo': 0,
        'countryCode': 0,
        'textField': 0,  # Generic text fields
        'radioButton': 0,  # Generic radio buttons
        'dateField': 0,  # Generic date fields
        'state': 0,  # Generic state fields
        'dropdown': 0,  # Generic dropdown fields
        'phone': 0,  # Generic phone fields
        'field': 0,  # Generic fields
        'area': 0  # Area fields
    }
    
    # Count field types
    for mapping in all_mappings:
        for field_type in field_types.keys():
            if field_type in mapping and field_type not in ['field', 'textField', 'radioButton', 'dateField', 'state', 'dropdown', 'phone', 'area']:
                field_types[field_type] += 1
            elif '.textField' in mapping and field_type == 'textField':
                field_types[field_type] += 1
            elif '.radioButton' in mapping and field_type == 'radioButton':
                field_types[field_type] += 1
            elif '.dateField' in mapping and field_type == 'dateField':
                field_types[field_type] += 1
            elif '.state' in mapping and field_type == 'state':
                field_types[field_type] += 1
            elif '.dropdown' in mapping and field_type == 'dropdown':
                field_types[field_type] += 1
            elif '.phone' in mapping and field_type == 'phone':
                field_types[field_type] += 1
            elif '.field' in mapping and field_type == 'field':
                field_types[field_type] += 1
            elif 'area' in mapping and field_type == 'area':
                field_types[field_type] += 1
    
    print(f'📋 FIELD TYPE COVERAGE:')
    for field_type, count in field_types.items():
        if count > 0:
            print(f'   {field_type}: {count} fields')
    
    # Validate against expected Unemployment fields
    expected_unemployment_fields = [
        'firstName', 'lastName', 'referenceStreet', 'referenceCity',
        'referenceState', 'referenceZip', 'referencePhone', 'fromDate',
        'toDate', 'hasReference', 'receivedBenefits'
    ]
    
    print(f'\n✅ VALIDATION RESULTS:')
    missing_fields = []
    present_fields = []
    for expected_field in expected_unemployment_fields:
        if field_types.get(expected_field, 0) > 0:
            present_fields.append(expected_field)
        else:
            missing_fields.append(expected_field)
    
    if missing_fields:
        print(f'⚠️  Missing expected fields: {", ".join(missing_fields)}')
    else:
        print(f'✅ All expected Unemployment fields are mapped!')
    
    print(f'\n🎯 SUMMARY:')
    print(f'   Unemployment mappings extracted: {len(all_mappings)}')
    print(f'   Main section mappings: {len(unemployment_mappings)}')
    print(f'   Additional section mappings: {len(unemployment_additional_mappings)}')
    print(f'   Expected core fields covered: {len(present_fields)}/{len(expected_unemployment_fields)}')
    print(f'   Additional fields (variants/generic): {len(all_mappings) - len(present_fields)}')
    print(f'   Ready for integration: {"✅ YES" if len(missing_fields) == 0 else "⚠️ REVIEW NEEDED"}')

if __name__ == '__main__':
    main()
