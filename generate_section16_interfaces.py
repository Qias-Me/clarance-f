#!/usr/bin/env python3
"""
Section 16 Complete Interface Generator
Generates TypeScript interfaces for all 154 fields in Section 16
"""

import json
import re
from collections import defaultdict

def generate_section16_interfaces():
    """Generate complete TypeScript interfaces for Section 16"""
    
    # Load the JSON file
    with open('api/sections-references/section-16.json', 'r') as f:
        data = json.load(f)
    
    fields = data['fields']
    
    # Categorize fields by section and purpose
    section16_1_fields = {}
    section16_3_fields = {}
    
    for field in fields:
        name = field['name']
        label = field.get('label', '')
        field_type = field.get('type', '')
        
        field_info = {
            'name': name,
            'label': label,
            'type': field_type,
            'page': field.get('page', 0)
        }
        
        if 'Section16_1' in name:
            section16_1_fields[name] = field_info
        elif 'Section16_3' in name:
            section16_3_fields[name] = field_info
    
    # Generate Section16_1 interface (Foreign Organization Contacts)
    print("// ============================================================================")
    print("// SECTION 16_1: FOREIGN ORGANIZATION CONTACT INFORMATION")
    print("// ============================================================================")
    print()
    print("export interface ForeignOrganizationContactEntry {")
    
    # Analyze Section16_1 fields and group them logically
    s16_1_groups = analyze_section16_1_fields(section16_1_fields)
    generate_section16_1_interface(s16_1_groups)
    
    print("}")
    print()
    
    # Generate Section16_3 interface (People Who Know You Well)
    print("// ============================================================================")
    print("// SECTION 16_3: PEOPLE WHO KNOW YOU WELL")
    print("// ============================================================================")
    print()
    print("export interface PersonWhoKnowsYouEntry {")
    
    # Analyze Section16_3 fields and group them logically
    s16_3_groups = analyze_section16_3_fields(section16_3_fields)
    generate_section16_3_interface(s16_3_groups)
    
    print("}")
    print()
    
    # Generate main Section16 interface
    print("// ============================================================================")
    print("// MAIN SECTION 16 INTERFACE")
    print("// ============================================================================")
    print()
    print("export interface Section16 {")
    print("  section16: {")
    print("    foreignOrganizationContacts: ForeignOrganizationContactEntry[];")
    print("    peopleWhoKnowYou: PersonWhoKnowsYouEntry[];")
    print("  };")
    print("}")
    print()
    
    # Generate field ID mappings
    print("// ============================================================================")
    print("// FIELD ID MAPPINGS")
    print("// ============================================================================")
    print()
    print("export const SECTION16_FIELD_IDS = {")
    print("  // Section16_1 Fields")
    for name in sorted(section16_1_fields.keys()):
        safe_name = convert_to_safe_property_name(name)
        print(f"  {safe_name}: '{name}',")
    print()
    print("  // Section16_3 Fields")
    for name in sorted(section16_3_fields.keys()):
        safe_name = convert_to_safe_property_name(name)
        print(f"  {safe_name}: '{name}',")
    print("};")

def analyze_section16_1_fields(fields):
    """Analyze Section16_1 fields and group them logically"""
    groups = {
        'organization': [],
        'service_details': [],
        'contact1': [],
        'contact2': [],
        'dates': [],
        'other': []
    }
    
    for name, field in fields.items():
        label = field['label'].lower()
        
        if 'organization' in label or 'TextField11[0]' in name:
            groups['organization'].append((name, field))
        elif 'contact #1' in label or '#area[2]' in name:
            groups['contact1'].append((name, field))
        elif 'contact #2' in label or '#area[5]' in name:
            groups['contact2'].append((name, field))
        elif 'date' in label or 'From_Datefield' in name:
            groups['dates'].append((name, field))
        elif 'position' in label or 'rank' in label or 'division' in label:
            groups['service_details'].append((name, field))
        else:
            groups['other'].append((name, field))
    
    return groups

def analyze_section16_3_fields(fields):
    """Analyze Section16_3 fields and group them logically"""
    groups = {
        'person1': [],
        'person2': [],
        'person3': [],
        'shared': []
    }
    
    for name, field in fields.items():
        label = field['label'].lower()
        
        if '#area[0]' in name or 'entry #1' in label:
            groups['person1'].append((name, field))
        elif '#area[1]' in name or 'entry #2' in label:
            groups['person2'].append((name, field))
        elif '#area[2]' in name or 'entry #3' in label:
            groups['person3'].append((name, field))
        else:
            groups['shared'].append((name, field))
    
    return groups

def generate_section16_1_interface(groups):
    """Generate TypeScript interface for Section16_1"""
    
    # Organization info
    print("  // Organization Information")
    print("  organizationName: Field<string>;")
    print("  organizationCountry: Field<string>;")
    print("  positionHeld: Field<string>;")
    print("  divisionDepartment: Field<string>;")
    print()
    
    # Service period
    print("  // Service Period")
    print("  serviceFromDate: Field<string>;")
    print("  serviceToDate: Field<string>;")
    print("  serviceFromEstimate: Field<boolean>;")
    print("  serviceToEstimate: Field<boolean>;")
    print("  isPresent: Field<boolean>;")
    print("  reasonForLeaving: Field<string>;")
    print("  circumstancesDescription: Field<string>;")
    print()
    
    # Contact 1
    print("  // Contact #1")
    print("  contact1FirstName: Field<string>;")
    print("  contact1MiddleName: Field<string>;")
    print("  contact1LastName: Field<string>;")
    print("  contact1Suffix: Field<string>;")
    print("  contact1Title: Field<string>;")
    print("  contact1Frequency: Field<string>;")
    print("  contact1Address: {")
    print("    street: Field<string>;")
    print("    city: Field<string>;")
    print("    state: Field<string>;")
    print("    country: Field<string>;")
    print("    zipCode: Field<string>;")
    print("  };")
    print("  contact1AssociationFromDate: Field<string>;")
    print("  contact1AssociationToDate: Field<string>;")
    print("  contact1FromEstimate: Field<boolean>;")
    print("  contact1ToEstimate: Field<boolean>;")
    print("  contact1IsPresent: Field<boolean>;")
    print()
    
    # Contact 2
    print("  // Contact #2")
    print("  contact2FirstName: Field<string>;")
    print("  contact2MiddleName: Field<string>;")
    print("  contact2LastName: Field<string>;")
    print("  contact2Suffix: Field<string>;")
    print("  contact2Title: Field<string>;")
    print("  contact2Frequency: Field<string>;")
    print("  contact2Address: {")
    print("    street: Field<string>;")
    print("    city: Field<string>;")
    print("    state: Field<string>;")
    print("    country: Field<string>;")
    print("    zipCode: Field<string>;")
    print("  };")
    print("  contact2AssociationFromDate: Field<string>;")
    print("  contact2AssociationToDate: Field<string>;")
    print("  contact2FromEstimate: Field<boolean>;")
    print("  contact2ToEstimate: Field<boolean>;")
    print("  contact2IsPresent: Field<boolean>;")

def generate_section16_3_interface(groups):
    """Generate TypeScript interface for Section16_3"""
    
    print("  // Personal Information")
    print("  firstName: Field<string>;")
    print("  middleName: Field<string>;")
    print("  lastName: Field<string>;")
    print("  suffix: Field<string>;")
    print()
    
    print("  // Dates Known")
    print("  datesKnownFrom: Field<string>;")
    print("  datesKnownTo: Field<string>;")
    print("  datesKnownFromEstimate: Field<boolean>;")
    print("  datesKnownToEstimate: Field<boolean>;")
    print("  datesKnownIsPresent: Field<boolean>;")
    print()
    
    print("  // Address")
    print("  address: {")
    print("    street: Field<string>;")
    print("    city: Field<string>;")
    print("    state: Field<string>;")
    print("    country: Field<string>;")
    print("    zipCode: Field<string>;")
    print("  };")
    print()
    
    print("  // Contact Information")
    print("  phoneNumber: Field<string>;")
    print("  mobileNumber: Field<string>;")
    print("  phoneExtension: Field<string>;")
    print("  emailAddress: Field<string>;")
    print("  phoneDay: Field<boolean>;")
    print("  phoneNight: Field<boolean>;")
    print("  phoneInternational: Field<boolean>;")
    print("  phoneDontKnow: Field<boolean>;")
    print()
    
    print("  // Professional Information")
    print("  rankTitle: Field<string>;")
    print("  rankTitleNotApplicable: Field<boolean>;")
    print("  rankTitleDontKnow: Field<boolean>;")
    print()
    
    print("  // Relationship")
    print("  relationshipFriend: Field<boolean>;")
    print("  relationshipNeighbor: Field<boolean>;")
    print("  relationshipSchoolmate: Field<boolean>;")
    print("  relationshipWorkAssociate: Field<boolean>;")
    print("  relationshipOther: Field<boolean>;")
    print("  relationshipOtherExplanation: Field<string>;")

def convert_to_safe_property_name(field_name):
    """Convert PDF field name to safe TypeScript property name"""
    # Remove form1[0]. prefix and replace special characters
    safe_name = field_name.replace('form1[0].', '')
    safe_name = re.sub(r'[^a-zA-Z0-9_]', '_', safe_name)
    safe_name = re.sub(r'_+', '_', safe_name)
    safe_name = safe_name.strip('_')
    return safe_name

if __name__ == "__main__":
    generate_section16_interfaces()
