#!/usr/bin/env node
/**
 * Phase 3: Validate Federal Employment (13A.1) Field Mappings
 * Test that the integrated Federal Employment mappings work correctly
 */

const fs = require('fs');
const path = require('path');

// Import the field mapping module
const mappingPath = path.join(__dirname, '..', 'app', 'state', 'contexts', 'sections2.0', 'section13-field-mapping.ts');

function main() {
    console.log('🔍 VALIDATING FEDERAL EMPLOYMENT (13A.1) FIELD MAPPINGS');
    console.log('='.repeat(60));
    
    try {
        // Read the field mapping file
        const mappingContent = fs.readFileSync(mappingPath, 'utf8');
        
        // Extract SECTION13_FIELD_MAPPINGS object
        const mappingMatch = mappingContent.match(/export const SECTION13_FIELD_MAPPINGS = \{([\s\S]*?)\} as const;/);
        
        if (!mappingMatch) {
            console.log('❌ Could not find SECTION13_FIELD_MAPPINGS in the file');
            return;
        }
        
        const mappingContent2 = mappingMatch[1];
        
        // Count Federal Employment mappings
        const federalEmploymentMappings = [];
        const lines = mappingContent2.split('\n');
        
        for (const line of lines) {
            if (line.includes('section13.federalEmployment.entries[0]') && line.includes(':')) {
                const cleanLine = line.trim();
                if (cleanLine.endsWith(',')) {
                    federalEmploymentMappings.push(cleanLine.slice(0, -1)); // Remove trailing comma
                } else {
                    federalEmploymentMappings.push(cleanLine);
                }
            }
        }
        
        console.log(`📊 FEDERAL EMPLOYMENT MAPPING VALIDATION:`);
        console.log(`   Total Federal Employment mappings found: ${federalEmploymentMappings.length}`);
        
        // Validate mapping structure
        const validMappings = [];
        const invalidMappings = [];
        
        for (const mapping of federalEmploymentMappings) {
            // Check if mapping has correct structure: 'logical.path': 'pdf.field'
            const mappingMatch = mapping.match(/^\s*'([^']+)':\s*'([^']+)'\s*$/);
            
            if (mappingMatch) {
                const logicalPath = mappingMatch[1];
                const pdfField = mappingMatch[2];
                
                // Validate logical path structure
                if (logicalPath.startsWith('section13.federalEmployment.entries[0].') && 
                    logicalPath.endsWith('.value')) {
                    
                    // Validate PDF field structure
                    if (pdfField.startsWith('form1[0].section_13_1-2[0].')) {
                        validMappings.push({ logicalPath, pdfField });
                    } else {
                        invalidMappings.push({ mapping, issue: 'Invalid PDF field pattern' });
                    }
                } else {
                    invalidMappings.push({ mapping, issue: 'Invalid logical path pattern' });
                }
            } else {
                invalidMappings.push({ mapping, issue: 'Invalid mapping syntax' });
            }
        }
        
        console.log(`   Valid mappings: ${validMappings.length}`);
        console.log(`   Invalid mappings: ${invalidMappings.length}`);
        
        if (invalidMappings.length > 0) {
            console.log(`\n⚠️  INVALID MAPPINGS FOUND:`);
            for (const invalid of invalidMappings.slice(0, 5)) {
                console.log(`   ${invalid.issue}: ${invalid.mapping}`);
            }
        }
        
        // Analyze field types
        console.log(`\n📋 FIELD TYPE ANALYSIS:`);
        const fieldTypes = {};
        
        for (const { logicalPath } of validMappings) {
            // Extract field name from logical path
            const fieldMatch = logicalPath.match(/\.([^.]+)\.value$/);
            if (fieldMatch) {
                const fieldName = fieldMatch[1];
                fieldTypes[fieldName] = (fieldTypes[fieldName] || 0) + 1;
            }
        }
        
        // Group by category
        const supervisorFields = Object.keys(fieldTypes).filter(f => f.startsWith('supervisor')).length;
        const employerFields = Object.keys(fieldTypes).filter(f => f.startsWith('employer')).length;
        const dutyFields = Object.keys(fieldTypes).filter(f => f.startsWith('duty')).length;
        const dateFields = Object.keys(fieldTypes).filter(f => f.includes('Date')).length;
        const genericFields = Object.keys(fieldTypes).filter(f => f.startsWith('field')).length;
        const otherFields = Object.keys(fieldTypes).length - supervisorFields - employerFields - dutyFields - dateFields - genericFields;
        
        console.log(`   Supervisor fields: ${supervisorFields}`);
        console.log(`   Employer fields: ${employerFields}`);
        console.log(`   Duty station fields: ${dutyFields}`);
        console.log(`   Date fields: ${dateFields}`);
        console.log(`   Generic fields: ${genericFields}`);
        console.log(`   Other fields: ${otherFields}`);
        
        // Show sample mappings
        console.log(`\n📋 SAMPLE VALID MAPPINGS:`);
        for (let i = 0; i < Math.min(10, validMappings.length); i++) {
            const { logicalPath, pdfField } = validMappings[i];
            console.log(`   ${i + 1}. ${logicalPath} -> ${pdfField}`);
        }
        
        if (validMappings.length > 10) {
            console.log(`   ... and ${validMappings.length - 10} more valid mappings`);
        }
        
        // Validate against expected fields
        const expectedFields = [
            'supervisorName', 'supervisorRank', 'supervisorTitle', 'supervisorAddress',
            'supervisorCity', 'supervisorState', 'supervisorZip', 'supervisorPhone',
            'supervisorEmail', 'employerStreet', 'employerCity', 'employerState',
            'employerZip', 'employerPhone', 'dutyStreet', 'dutyCity', 'dutyState',
            'dutyZip', 'dutyStation', 'fromDate', 'toDate', 'rankTitle',
            'employmentType', 'extension', 'otherExplanation'
        ];
        
        console.log(`\n✅ EXPECTED FIELD VALIDATION:`);
        const missingFields = [];
        const presentFields = [];
        
        for (const expectedField of expectedFields) {
            if (fieldTypes[expectedField]) {
                presentFields.push(expectedField);
            } else {
                missingFields.push(expectedField);
            }
        }
        
        console.log(`   Expected fields present: ${presentFields.length}/${expectedFields.length}`);
        console.log(`   Missing expected fields: ${missingFields.length}`);
        
        if (missingFields.length > 0) {
            console.log(`   Missing: ${missingFields.join(', ')}`);
        }
        
        // Final validation summary
        console.log(`\n🎯 VALIDATION SUMMARY:`);
        console.log(`   Total Federal Employment mappings: ${federalEmploymentMappings.length}`);
        console.log(`   Valid mappings: ${validMappings.length}`);
        console.log(`   Invalid mappings: ${invalidMappings.length}`);
        console.log(`   Expected core fields covered: ${presentFields.length}/${expectedFields.length}`);
        console.log(`   Validation status: ${invalidMappings.length === 0 && missingFields.length === 0 ? '✅ PASSED' : '⚠️ ISSUES FOUND'}`);
        
        if (invalidMappings.length === 0 && missingFields.length === 0) {
            console.log(`\n🎉 Federal Employment (13A.1) field mappings are fully validated and ready!`);
        } else {
            console.log(`\n⚠️  Please review and fix the identified issues before proceeding.`);
        }
        
    } catch (error) {
        console.log(`❌ Error validating mappings: ${error.message}`);
    }
}

if (require.main === module) {
    main();
}
