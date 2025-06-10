#!/usr/bin/env node
/**
 * Phase 5: Validate Self-Employment (13A.3) Field Mappings
 * Test that the integrated Self-Employment mappings work correctly
 */

const fs = require('fs');
const path = require('path');

// Import the field mapping module
const mappingPath = path.join(__dirname, '..', 'app', 'state', 'contexts', 'sections2.0', 'section13-field-mapping.ts');

function main() {
    console.log('🔍 VALIDATING SELF-EMPLOYMENT (13A.3) FIELD MAPPINGS');
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
        
        // Count Self-Employment mappings
        const selfEmploymentMappings = [];
        const selfEmploymentAdditionalMappings = [];
        const lines = mappingContent2.split('\n');
        
        for (const line of lines) {
            if (line.includes('section13.selfEmployment.entries[0]') && line.includes(':')) {
                const cleanLine = line.trim();
                if (cleanLine.endsWith(',')) {
                    selfEmploymentMappings.push(cleanLine.slice(0, -1)); // Remove trailing comma
                } else {
                    selfEmploymentMappings.push(cleanLine);
                }
            } else if (line.includes('section13.selfEmploymentAdditional.entries[0]') && line.includes(':')) {
                const cleanLine = line.trim();
                if (cleanLine.endsWith(',')) {
                    selfEmploymentAdditionalMappings.push(cleanLine.slice(0, -1)); // Remove trailing comma
                } else {
                    selfEmploymentAdditionalMappings.push(cleanLine);
                }
            }
        }
        
        const totalSelfEmploymentMappings = selfEmploymentMappings.length + selfEmploymentAdditionalMappings.length;
        
        console.log(`📊 SELF-EMPLOYMENT MAPPING VALIDATION:`);
        console.log(`   Main Self-Employment mappings found: ${selfEmploymentMappings.length}`);
        console.log(`   Additional Self-Employment mappings found: ${selfEmploymentAdditionalMappings.length}`);
        console.log(`   Total Self-Employment mappings found: ${totalSelfEmploymentMappings}`);
        
        // Validate mapping structure
        const validMainMappings = [];
        const validAdditionalMappings = [];
        const invalidMappings = [];
        
        // Validate main mappings
        for (const mapping of selfEmploymentMappings) {
            const mappingMatch = mapping.match(/^\s*'([^']+)':\s*'([^']+)'\s*$/);
            
            if (mappingMatch) {
                const logicalPath = mappingMatch[1];
                const pdfField = mappingMatch[2];
                
                // Validate logical path structure
                if (logicalPath.startsWith('section13.selfEmployment.entries[0].') && 
                    logicalPath.endsWith('.value')) {
                    
                    // Validate PDF field structure
                    if (pdfField.startsWith('form1[0].section13_3[2].')) {
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
        for (const mapping of selfEmploymentAdditionalMappings) {
            const mappingMatch = mapping.match(/^\s*'([^']+)':\s*'([^']+)'\s*$/);
            
            if (mappingMatch) {
                const logicalPath = mappingMatch[1];
                const pdfField = mappingMatch[2];
                
                // Validate logical path structure
                if (logicalPath.startsWith('section13.selfEmploymentAdditional.entries[0].') && 
                    logicalPath.endsWith('.value')) {
                    
                    // Validate PDF field structure
                    if (pdfField.startsWith('form1[0].section13_3-2[0].')) {
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
        const businessFields = Object.keys(fieldTypes).filter(f => f.startsWith('business')).length;
        const dateFields = Object.keys(fieldTypes).filter(f => f.includes('Date') || f.includes('dateField')).length;
        const textFields = Object.keys(fieldTypes).filter(f => f.startsWith('textField')).length;
        const genericFields = Object.keys(fieldTypes).filter(f => f.startsWith('field')).length;
        const phoneFields = Object.keys(fieldTypes).filter(f => f.includes('phone') || f.includes('Phone')).length;
        const stateFields = Object.keys(fieldTypes).filter(f => f.includes('state') || f.includes('State')).length;
        const radioFields = Object.keys(fieldTypes).filter(f => f.includes('radioButton') || f.includes('Radio')).length;
        const dropdownFields = Object.keys(fieldTypes).filter(f => f.includes('dropdown') || f.includes('Dropdown')).length;
        const otherFields = Object.keys(fieldTypes).length - businessFields - dateFields - textFields - genericFields - phoneFields - stateFields - radioFields - dropdownFields;
        
        console.log(`   Business fields: ${businessFields}`);
        console.log(`   Date fields: ${dateFields}`);
        console.log(`   Text fields: ${textFields}`);
        console.log(`   Phone fields: ${phoneFields}`);
        console.log(`   State fields: ${stateFields}`);
        console.log(`   Radio button fields: ${radioFields}`);
        console.log(`   Dropdown fields: ${dropdownFields}`);
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
        const expectedSelfEmploymentFields = [
            'businessName', 'businessType', 'businessDescription', 'businessStreet',
            'businessCity', 'businessState', 'businessZip', 'businessPhone',
            'businessEmail', 'fromDate', 'toDate', 'hasEmployees', 'isCurrentBusiness'
        ];
        
        console.log(`\n✅ EXPECTED FIELD VALIDATION:`);
        const missingFields = [];
        const presentFields = [];
        
        for (const expectedField of expectedSelfEmploymentFields) {
            if (fieldTypes[expectedField]) {
                presentFields.push(expectedField);
            } else {
                missingFields.push(expectedField);
            }
        }
        
        console.log(`   Expected fields present: ${presentFields.length}/${expectedSelfEmploymentFields.length}`);
        console.log(`   Missing expected fields: ${missingFields.length}`);
        
        if (missingFields.length > 0) {
            console.log(`   Missing: ${missingFields.join(', ')}`);
        }
        
        // Final validation summary
        console.log(`\n🎯 VALIDATION SUMMARY:`);
        console.log(`   Total Self-Employment mappings: ${totalSelfEmploymentMappings}`);
        console.log(`   Main section mappings: ${validMainMappings.length}`);
        console.log(`   Additional section mappings: ${validAdditionalMappings.length}`);
        console.log(`   Valid mappings: ${totalValidMappings}`);
        console.log(`   Invalid mappings: ${invalidMappings.length}`);
        console.log(`   Expected core fields covered: ${presentFields.length}/${expectedSelfEmploymentFields.length}`);
        console.log(`   Validation status: ${invalidMappings.length === 0 && missingFields.length === 0 ? '✅ PASSED' : '⚠️ ISSUES FOUND'}`);
        
        if (invalidMappings.length === 0 && missingFields.length === 0) {
            console.log(`\n🎉 Self-Employment (13A.3) field mappings are fully validated and ready!`);
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
