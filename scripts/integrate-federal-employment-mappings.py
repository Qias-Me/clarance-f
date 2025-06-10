#!/usr/bin/env python3
"""
Phase 3: Integrate Federal Employment (13A.1) Field Mappings
Extract 13A.1 mappings from generated mappings and integrate into SECTION13_FIELD_MAPPINGS
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
    
    print('🔧 INTEGRATING FEDERAL EMPLOYMENT (13A.1) FIELD MAPPINGS')
    print('=' * 60)
    
    # Extract Federal Employment mappings
    federal_employment_mappings = []
    
    # Find all lines with federalEmployment mappings
    lines = content.split('\n')
    for line in lines:
        if 'section13.federalEmployment.entries[0]' in line and ':' in line:
            # Clean up the line and extract the mapping
            clean_line = line.strip()
            if clean_line.endswith(','):
                clean_line = clean_line[:-1]  # Remove trailing comma
            federal_employment_mappings.append(clean_line)
    
    print(f'📊 EXTRACTED FEDERAL EMPLOYMENT MAPPINGS:')
    print(f'   Total Federal Employment mappings found: {len(federal_employment_mappings)}')
    
    # Show sample mappings
    print(f'\n📋 SAMPLE FEDERAL EMPLOYMENT MAPPINGS:')
    for i, mapping in enumerate(federal_employment_mappings[:10]):
        print(f'   {i+1}. {mapping}')
    
    if len(federal_employment_mappings) > 10:
        print(f'   ... and {len(federal_employment_mappings) - 10} more mappings')
    
    # Generate the TypeScript code for integration
    print(f'\n🔧 GENERATING INTEGRATION CODE...')
    
    # Create the Federal Employment section for SECTION13_FIELD_MAPPINGS
    integration_code = []
    integration_code.append('  // Federal Employment (13A.1) - Complete field mappings')
    
    for mapping in federal_employment_mappings:
        integration_code.append(f'  {mapping},')
    
    # Save the integration code
    output_path = os.path.join(script_dir, 'federal-employment-mappings-integration.ts')
    try:
        with open(output_path, 'w', encoding='utf-8') as f:
            f.write('// Federal Employment (13A.1) field mappings for integration\n')
            f.write('// Add these to SECTION13_FIELD_MAPPINGS in section13-field-mapping.ts\n\n')
            f.write('\n'.join(integration_code))
            f.write('\n\n')
            f.write(f'// Total Federal Employment mappings: {len(federal_employment_mappings)}\n')
        
        print(f'✅ Integration code saved to: {output_path}')
    except Exception as e:
        print(f'⚠️  Could not save integration code: {e}')
    
    # Analyze the field coverage
    print(f'\n📊 FEDERAL EMPLOYMENT FIELD ANALYSIS:')
    
    field_types = {
        'supervisorName': 0,
        'supervisorRank': 0,
        'supervisorTitle': 0,
        'supervisorAddress': 0,
        'supervisorCity': 0,
        'supervisorState': 0,
        'supervisorZip': 0,
        'supervisorPhone': 0,
        'supervisorEmail': 0,
        'employerStreet': 0,
        'employerCity': 0,
        'employerState': 0,
        'employerZip': 0,
        'employerPhone': 0,
        'employerCountry': 0,
        'dutyStreet': 0,
        'dutyCity': 0,
        'dutyState': 0,
        'dutyZip': 0,
        'dutyStation': 0,
        'dutyCountry': 0,
        'fromDate': 0,
        'toDate': 0,
        'rankTitle': 0,
        'employmentType': 0,
        'hasAdditionalInfo': 0,
        'extension': 0,
        'otherExplanation': 0,
        'checkbox': 0,
        'countryCode': 0,
        'field': 0  # Generic fields
    }
    
    # Count field types
    for mapping in federal_employment_mappings:
        for field_type in field_types.keys():
            if field_type in mapping and field_type != 'field':
                field_types[field_type] += 1
            elif '.field' in mapping and field_type == 'field':
                field_types[field_type] += 1
    
    print(f'📋 FIELD TYPE COVERAGE:')
    for field_type, count in field_types.items():
        if count > 0:
            print(f'   {field_type}: {count} fields')
    
    # Validate against expected Federal Employment fields
    expected_federal_fields = [
        'supervisorName', 'supervisorRank', 'supervisorTitle', 'supervisorAddress',
        'supervisorCity', 'supervisorState', 'supervisorZip', 'supervisorPhone',
        'supervisorEmail', 'employerStreet', 'employerCity', 'employerState',
        'employerZip', 'employerPhone', 'dutyStreet', 'dutyCity', 'dutyState',
        'dutyZip', 'dutyStation', 'fromDate', 'toDate', 'rankTitle',
        'employmentType', 'extension', 'otherExplanation'
    ]
    
    print(f'\n✅ VALIDATION RESULTS:')
    missing_fields = []
    for expected_field in expected_federal_fields:
        if field_types.get(expected_field, 0) == 0:
            missing_fields.append(expected_field)
    
    if missing_fields:
        print(f'⚠️  Missing expected fields: {", ".join(missing_fields)}')
    else:
        print(f'✅ All expected Federal Employment fields are mapped!')
    
    print(f'\n🎯 SUMMARY:')
    print(f'   Federal Employment mappings extracted: {len(federal_employment_mappings)}')
    print(f'   Expected core fields covered: {len(expected_federal_fields) - len(missing_fields)}/{len(expected_federal_fields)}')
    print(f'   Additional fields (variants/generic): {len(federal_employment_mappings) - (len(expected_federal_fields) - len(missing_fields))}')
    print(f'   Ready for integration: {"✅ YES" if len(missing_fields) == 0 else "⚠️ REVIEW NEEDED"}')

if __name__ == '__main__':
    main()
