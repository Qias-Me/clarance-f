#!/usr/bin/env node
/**
 * Phase 6: Validate Unemployment (13A.4) Field Mappings
 * Test that the integrated Unemployment mappings work correctly
 */

const fs = require('fs');
const path = require('path');

// Import the field mapping module
const mappingPath = path.join(__dirname, '..', 'app', 'state', 'contexts', 'sections2.0', 'section13-field-mapping.ts');

function main() {
    console.log('🔍 VALIDATING UNEMPLOYMENT (13A.4) FIELD MAPPINGS');
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
        
        // Count Unemployment mappings
        const unemploymentMappings = [];
        const lines = mappingContent2.split('\n');
        
        for (const line of lines) {
            if (line.includes('section13.unemployment.entries[0]') && line.includes(':')) {
                const cleanLine = line.trim();
                if (cleanLine.endsWith(',')) {
                    unemploymentMappings.push(cleanLine.slice(0, -1)); // Remove trailing comma
                } else {
                    unemploymentMappings.push(cleanLine);
                }
            }
        }
        
        console.log(`📊 UNEMPLOYMENT MAPPING VALIDATION:`);
        console.log(`   Total Unemployment mappings found: ${unemploymentMappings.length}`);
        
        // Validate mapping structure
        const validMappings = [];
        const invalidMappings = [];
        
        for (const mapping of unemploymentMappings) {
            const mappingMatch = mapping.match(/^\s*'([^']+)':\s*'([^']+)'\s*$/);
            
            if (mappingMatch) {
                const logicalPath = mappingMatch[1];
                const pdfField = mappingMatch[2];
                
                // Validate logical path structure
                if (logicalPath.startsWith('section13.unemployment.entries[0].') && 
                    logicalPath.endsWith('.value')) {
                    
                    // Validate PDF field structure
                    if (pdfField.startsWith('form1[0].section13_4[')) {
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
        const referenceFields = Object.keys(fieldTypes).filter(f => f.startsWith('reference')).length;
        const dateFields = Object.keys(fieldTypes).filter(f => f.includes('Date')).length;
        const benefitsFields = Object.keys(fieldTypes).filter(f => f.includes('benefits') || f.includes('Benefits')).length;
        const unemploymentFields = Object.keys(fieldTypes).filter(f => f.includes('unemployment') || f.includes('Unemployment')).length;
        const statusFields = Object.keys(fieldTypes).filter(f => f.includes('has') || f.includes('is') || f.includes('received')).length;
        const nameFields = Object.keys(fieldTypes).filter(f => f.includes('Name') || f.includes('firstName') || f.includes('lastName')).length;
        const genericFields = Object.keys(fieldTypes).filter(f => f.startsWith('field')).length;
        const phoneFields = Object.keys(fieldTypes).filter(f => f.includes('phone') || f.includes('Phone')).length;
        const otherFields = Object.keys(fieldTypes).length - referenceFields - dateFields - benefitsFields - unemploymentFields - statusFields - nameFields - genericFields - phoneFields;
        
        console.log(`   Reference fields: ${referenceFields}`);
        console.log(`   Date fields: ${dateFields}`);
        console.log(`   Benefits fields: ${benefitsFields}`);
        console.log(`   Unemployment fields: ${unemploymentFields}`);
        console.log(`   Status fields: ${statusFields}`);
        console.log(`   Name fields: ${nameFields}`);
        console.log(`   Phone fields: ${phoneFields}`);
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
        const expectedUnemploymentFields = [
            'firstName', 'lastName', 'referenceStreet', 'referenceCity',
            'referenceState', 'referenceZip', 'referencePhone', 'fromDate',
            'toDate', 'hasReference', 'receivedBenefits'
        ];
        
        console.log(`\n✅ EXPECTED FIELD VALIDATION:`);
        const missingFields = [];
        const presentFields = [];
        
        for (const expectedField of expectedUnemploymentFields) {
            if (fieldTypes[expectedField]) {
                presentFields.push(expectedField);
            } else {
                missingFields.push(expectedField);
            }
        }
        
        console.log(`   Expected fields present: ${presentFields.length}/${expectedUnemploymentFields.length}`);
        console.log(`   Missing expected fields: ${missingFields.length}`);
        
        if (missingFields.length > 0) {
            console.log(`   Missing: ${missingFields.join(', ')}`);
        }
        
        // Final validation summary
        console.log(`\n🎯 VALIDATION SUMMARY:`);
        console.log(`   Total Unemployment mappings: ${unemploymentMappings.length}`);
        console.log(`   Valid mappings: ${validMappings.length}`);
        console.log(`   Invalid mappings: ${invalidMappings.length}`);
        console.log(`   Expected core fields covered: ${presentFields.length}/${expectedUnemploymentFields.length}`);
        console.log(`   Validation status: ${invalidMappings.length === 0 && missingFields.length === 0 ? '✅ PASSED' : '⚠️ ISSUES FOUND'}`);
        
        if (invalidMappings.length === 0 && missingFields.length === 0) {
            console.log(`\n🎉 Unemployment (13A.4) field mappings are fully validated and ready!`);
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
