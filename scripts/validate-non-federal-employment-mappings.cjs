#!/usr/bin/env node
/**
 * Phase 4: Validate Non-Federal Employment (13A.2) Field Mappings
 * Test that the integrated Non-Federal Employment mappings work correctly
 */

const fs = require('fs');
const path = require('path');

// Import the field mapping module
const mappingPath = path.join(__dirname, '..', 'app', 'state', 'contexts', 'sections2.0', 'section13-field-mapping.ts');

function main() {
    console.log('🔍 VALIDATING NON-FEDERAL EMPLOYMENT (13A.2) FIELD MAPPINGS');
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
        
        // Count Non-Federal Employment mappings
        const nonFederalMappings = [];
        const nonFederalAdditionalMappings = [];
        const lines = mappingContent2.split('\n');
        
        for (const line of lines) {
            if (line.includes('section13.nonFederalEmployment.entries[0]') && line.includes(':')) {
                const cleanLine = line.trim();
                if (cleanLine.endsWith(',')) {
                    nonFederalMappings.push(cleanLine.slice(0, -1)); // Remove trailing comma
                } else {
                    nonFederalMappings.push(cleanLine);
                }
            } else if (line.includes('section13.nonFederalEmploymentAdditional.entries[0]') && line.includes(':')) {
                const cleanLine = line.trim();
                if (cleanLine.endsWith(',')) {
                    nonFederalAdditionalMappings.push(cleanLine.slice(0, -1)); // Remove trailing comma
                } else {
                    nonFederalAdditionalMappings.push(cleanLine);
                }
            }
        }
        
        const totalNonFederalMappings = nonFederalMappings.length + nonFederalAdditionalMappings.length;
        
        console.log(`📊 NON-FEDERAL EMPLOYMENT MAPPING VALIDATION:`);
        console.log(`   Main Non-Federal Employment mappings found: ${nonFederalMappings.length}`);
        console.log(`   Additional Non-Federal Employment mappings found: ${nonFederalAdditionalMappings.length}`);
        console.log(`   Total Non-Federal Employment mappings found: ${totalNonFederalMappings}`);
        
        // Validate mapping structure
        const validMainMappings = [];
        const validAdditionalMappings = [];
        const invalidMappings = [];
        
        // Validate main mappings
        for (const mapping of nonFederalMappings) {
            const mappingMatch = mapping.match(/^\s*'([^']+)':\s*'([^']+)'\s*$/);
            
            if (mappingMatch) {
                const logicalPath = mappingMatch[1];
                const pdfField = mappingMatch[2];
                
                // Validate logical path structure
                if (logicalPath.startsWith('section13.nonFederalEmployment.entries[0].') && 
                    logicalPath.endsWith('.value')) {
                    
                    // Validate PDF field structure
                    if (pdfField.startsWith('form1[0].section13_2[2].')) {
                        validMainMappings.push({ logicalPath, pdfField });
                    } else {
                        invalidMappings.push({ mapping, issue: 'Invalid main PDF field pattern' });
                    }
                } else {
                    invalidMappings.push({ mapping, issue: 'Invalid main logical path pattern' });
                }
            } else {
                invalidMappings.push({ mapping, issue: 'Invalid main mapping syntax' });
            }
        }
        
        // Validate additional mappings
        for (const mapping of nonFederalAdditionalMappings) {
            const mappingMatch = mapping.match(/^\s*'([^']+)':\s*'([^']+)'\s*$/);
            
            if (mappingMatch) {
                const logicalPath = mappingMatch[1];
                const pdfField = mappingMatch[2];
                
                // Validate logical path structure
                if (logicalPath.startsWith('section13.nonFederalEmploymentAdditional.entries[0].') && 
                    logicalPath.endsWith('.value')) {
                    
                    // Validate PDF field structure
                    if (pdfField.startsWith('form1[0].section13_2-2[0].')) {
                        validAdditionalMappings.push({ logicalPath, pdfField });
                    } else {
                        invalidMappings.push({ mapping, issue: 'Invalid additional PDF field pattern' });
                    }
                } else {
                    invalidMappings.push({ mapping, issue: 'Invalid additional logical path pattern' });
                }
            } else {
                invalidMappings.push({ mapping, issue: 'Invalid additional mapping syntax' });
            }
        }
        
        const totalValidMappings = validMainMappings.length + validAdditionalMappings.length;
        
        console.log(`   Valid main mappings: ${validMainMappings.length}`);
        console.log(`   Valid additional mappings: ${validAdditionalMappings.length}`);
        console.log(`   Total valid mappings: ${totalValidMappings}`);
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
        
        const allValidMappings = [...validMainMappings, ...validAdditionalMappings];
        for (const { logicalPath } of allValidMappings) {
            // Extract field name from logical path
            const fieldMatch = logicalPath.match(/\.([^.]+)\.value$/);
            if (fieldMatch) {
                const fieldName = fieldMatch[1];
                fieldTypes[fieldName] = (fieldTypes[fieldName] || 0) + 1;
            }
        }
        
        // Group by category
        const employerFields = Object.keys(fieldTypes).filter(f => f.startsWith('employer')).length;
        const supervisorFields = Object.keys(fieldTypes).filter(f => f.startsWith('supervisor')).length;
        const dutyFields = Object.keys(fieldTypes).filter(f => f.startsWith('duty')).length;
        const dateFields = Object.keys(fieldTypes).filter(f => f.includes('Date') || f.includes('dateField')).length;
        const textFields = Object.keys(fieldTypes).filter(f => f.startsWith('textField')).length;
        const genericFields = Object.keys(fieldTypes).filter(f => f.startsWith('field')).length;
        const tableFields = Object.keys(fieldTypes).filter(f => f.includes('table')).length;
        const phoneFields = Object.keys(fieldTypes).filter(f => f.includes('phone') || f.includes('Phone')).length;
        const stateFields = Object.keys(fieldTypes).filter(f => f.includes('state') || f.includes('State')).length;
        const otherFields = Object.keys(fieldTypes).length - employerFields - supervisorFields - dutyFields - dateFields - textFields - genericFields - tableFields - phoneFields - stateFields;
        
        console.log(`   Employer fields: ${employerFields}`);
        console.log(`   Supervisor fields: ${supervisorFields}`);
        console.log(`   Duty station fields: ${dutyFields}`);
        console.log(`   Date fields: ${dateFields}`);
        console.log(`   Text fields: ${textFields}`);
        console.log(`   Phone fields: ${phoneFields}`);
        console.log(`   State fields: ${stateFields}`);
        console.log(`   Table fields: ${tableFields}`);
        console.log(`   Generic fields: ${genericFields}`);
        console.log(`   Other fields: ${otherFields}`);
        
        // Show sample mappings
        console.log(`\n📋 SAMPLE VALID MAIN MAPPINGS:`);
        for (let i = 0; i < Math.min(5, validMainMappings.length); i++) {
            const { logicalPath, pdfField } = validMainMappings[i];
            console.log(`   ${i + 1}. ${logicalPath} -> ${pdfField}`);
        }
        
        if (validAdditionalMappings.length > 0) {
            console.log(`\n📋 SAMPLE VALID ADDITIONAL MAPPINGS:`);
            for (let i = 0; i < Math.min(5, validAdditionalMappings.length); i++) {
                const { logicalPath, pdfField } = validAdditionalMappings[i];
                console.log(`   ${i + 1}. ${logicalPath} -> ${pdfField}`);
            }
        }
        
        // Validate against expected fields
        const expectedNonFederalFields = [
            'employerName', 'positionTitle', 'supervisorName', 'supervisorTitle',
            'employerStreet', 'employerCity', 'employerState', 'employerZip',
            'employerPhone', 'dutyStreet', 'dutyCity', 'dutyState', 'dutyZip',
            'fromDate', 'toDate', 'employmentType', 'reasonForLeaving'
        ];
        
        console.log(`\n✅ EXPECTED FIELD VALIDATION:`);
        const missingFields = [];
        const presentFields = [];
        
        for (const expectedField of expectedNonFederalFields) {
            if (fieldTypes[expectedField]) {
                presentFields.push(expectedField);
            } else {
                missingFields.push(expectedField);
            }
        }
        
        console.log(`   Expected fields present: ${presentFields.length}/${expectedNonFederalFields.length}`);
        console.log(`   Missing expected fields: ${missingFields.length}`);
        
        if (missingFields.length > 0) {
            console.log(`   Missing: ${missingFields.join(', ')}`);
        }
        
        // Final validation summary
        console.log(`\n🎯 VALIDATION SUMMARY:`);
        console.log(`   Total Non-Federal Employment mappings: ${totalNonFederalMappings}`);
        console.log(`   Main section mappings: ${validMainMappings.length}`);
        console.log(`   Additional section mappings: ${validAdditionalMappings.length}`);
        console.log(`   Valid mappings: ${totalValidMappings}`);
        console.log(`   Invalid mappings: ${invalidMappings.length}`);
        console.log(`   Expected core fields covered: ${presentFields.length}/${expectedNonFederalFields.length}`);
        console.log(`   Validation status: ${invalidMappings.length === 0 && missingFields.length === 0 ? '✅ PASSED' : '⚠️ ISSUES FOUND'}`);
        
        if (invalidMappings.length === 0 && missingFields.length === 0) {
            console.log(`\n🎉 Non-Federal Employment (13A.2) field mappings are fully validated and ready!`);
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
