#!/usr/bin/env python3
"""
Phase 4: Integrate Non-Federal Employment (13A.2) Field Mappings
Extract 13A.2 mappings from generated mappings and integrate into SECTION13_FIELD_MAPPINGS
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
    
    print('🔧 INTEGRATING NON-FEDERAL EMPLOYMENT (13A.2) FIELD MAPPINGS')
    print('=' * 60)
    
    # Extract Non-Federal Employment mappings
    non_federal_mappings = []
    non_federal_additional_mappings = []
    
    # Find all lines with nonFederalEmployment mappings
    lines = content.split('\n')
    for line in lines:
        if 'section13.nonFederalEmployment.entries[0]' in line and ':' in line:
            # Clean up the line and extract the mapping
            clean_line = line.strip()
            if clean_line.endswith(','):
                clean_line = clean_line[:-1]  # Remove trailing comma
            non_federal_mappings.append(clean_line)
        elif 'section13.nonFederalEmploymentAdditional.entries[0]' in line and ':' in line:
            # Additional non-federal employment mappings
            clean_line = line.strip()
            if clean_line.endswith(','):
                clean_line = clean_line[:-1]  # Remove trailing comma
            non_federal_additional_mappings.append(clean_line)
    
    print(f'📊 EXTRACTED NON-FEDERAL EMPLOYMENT MAPPINGS:')
    print(f'   Main Non-Federal Employment mappings: {len(non_federal_mappings)}')
    print(f'   Additional Non-Federal Employment mappings: {len(non_federal_additional_mappings)}')
    print(f'   Total Non-Federal Employment mappings: {len(non_federal_mappings) + len(non_federal_additional_mappings)}')
    
    # Show sample mappings
    print(f'\n📋 SAMPLE MAIN NON-FEDERAL EMPLOYMENT MAPPINGS:')
    for i, mapping in enumerate(non_federal_mappings[:10]):
        print(f'   {i+1}. {mapping}')
    
    if len(non_federal_mappings) > 10:
        print(f'   ... and {len(non_federal_mappings) - 10} more main mappings')
    
    if non_federal_additional_mappings:
        print(f'\n📋 SAMPLE ADDITIONAL NON-FEDERAL EMPLOYMENT MAPPINGS:')
        for i, mapping in enumerate(non_federal_additional_mappings[:5]):
            print(f'   {i+1}. {mapping}')
        
        if len(non_federal_additional_mappings) > 5:
            print(f'   ... and {len(non_federal_additional_mappings) - 5} more additional mappings')
    
    # Generate the TypeScript code for integration
    print(f'\n🔧 GENERATING INTEGRATION CODE...')
    
    # Create the Non-Federal Employment section for SECTION13_FIELD_MAPPINGS
    integration_code = []
    integration_code.append('  // Non-Federal Employment (13A.2) - Main section field mappings')
    
    for mapping in non_federal_mappings:
        integration_code.append(f'  {mapping},')
    
    if non_federal_additional_mappings:
        integration_code.append('')
        integration_code.append('  // Non-Federal Employment (13A.2) - Additional section field mappings')
        for mapping in non_federal_additional_mappings:
            integration_code.append(f'  {mapping},')
    
    # Save the integration code
    output_path = os.path.join(script_dir, 'non-federal-employment-mappings-integration.ts')
    try:
        with open(output_path, 'w', encoding='utf-8') as f:
            f.write('// Non-Federal Employment (13A.2) field mappings for integration\n')
            f.write('// Add these to SECTION13_FIELD_MAPPINGS in section13-field-mapping.ts\n\n')
            f.write('\n'.join(integration_code))
            f.write('\n\n')
            f.write(f'// Total Non-Federal Employment mappings: {len(non_federal_mappings) + len(non_federal_additional_mappings)}\n')
            f.write(f'// Main section mappings: {len(non_federal_mappings)}\n')
            f.write(f'// Additional section mappings: {len(non_federal_additional_mappings)}\n')
        
        print(f'✅ Integration code saved to: {output_path}')
    except Exception as e:
        print(f'⚠️  Could not save integration code: {e}')
    
    # Analyze the field coverage
    print(f'\n📊 NON-FEDERAL EMPLOYMENT FIELD ANALYSIS:')
    
    all_mappings = non_federal_mappings + non_federal_additional_mappings
    field_types = {
        'employerName': 0,
        'positionTitle': 0,
        'supervisorName': 0,
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
        'dutyPhone': 0,
        'dutyCountry': 0,
        'fromDate': 0,
        'toDate': 0,
        'employmentType': 0,
        'hasAdditionalInfo': 0,
        'isCurrentEmployment': 0,
        'extension': 0,
        'reasonForLeaving': 0,
        'additionalInfo': 0,
        'countryCode': 0,
        'textField': 0,  # Generic text fields
        'radioButton': 0,  # Generic radio buttons
        'dateField': 0,  # Generic date fields
        'state': 0,  # Generic state fields
        'dropdown': 0,  # Generic dropdown fields
        'phone': 0,  # Generic phone fields
        'field': 0,  # Generic fields
        'table': 0  # Table fields
    }
    
    # Count field types
    for mapping in all_mappings:
        for field_type in field_types.keys():
            if field_type in mapping and field_type not in ['field', 'textField', 'radioButton', 'dateField', 'state', 'dropdown', 'phone', 'table']:
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
            elif 'table' in mapping and field_type == 'table':
                field_types[field_type] += 1
    
    print(f'📋 FIELD TYPE COVERAGE:')
    for field_type, count in field_types.items():
        if count > 0:
            print(f'   {field_type}: {count} fields')
    
    # Validate against expected Non-Federal Employment fields
    expected_non_federal_fields = [
        'employerName', 'positionTitle', 'supervisorName', 'supervisorTitle',
        'employerStreet', 'employerCity', 'employerState', 'employerZip',
        'employerPhone', 'dutyStreet', 'dutyCity', 'dutyState', 'dutyZip',
        'fromDate', 'toDate', 'employmentType', 'reasonForLeaving'
    ]
    
    print(f'\n✅ VALIDATION RESULTS:')
    missing_fields = []
    present_fields = []
    for expected_field in expected_non_federal_fields:
        if field_types.get(expected_field, 0) > 0:
            present_fields.append(expected_field)
        else:
            missing_fields.append(expected_field)
    
    if missing_fields:
        print(f'⚠️  Missing expected fields: {", ".join(missing_fields)}')
    else:
        print(f'✅ All expected Non-Federal Employment fields are mapped!')
    
    print(f'\n🎯 SUMMARY:')
    print(f'   Non-Federal Employment mappings extracted: {len(all_mappings)}')
    print(f'   Main section mappings: {len(non_federal_mappings)}')
    print(f'   Additional section mappings: {len(non_federal_additional_mappings)}')
    print(f'   Expected core fields covered: {len(present_fields)}/{len(expected_non_federal_fields)}')
    print(f'   Additional fields (variants/generic): {len(all_mappings) - len(present_fields)}')
    print(f'   Ready for integration: {"✅ YES" if len(missing_fields) == 0 else "⚠️ REVIEW NEEDED"}')

if __name__ == '__main__':
    main()
