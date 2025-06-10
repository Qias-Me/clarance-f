#!/usr/bin/env node
/**
 * Phase 7: Validate Employment Issues (13A.5) Integration
 * Test that all 150 Employment Issues fields are properly integrated
 */

const fs = require('fs');
const path = require('path');

function main() {
    console.log('🔍 VALIDATING EMPLOYMENT ISSUES (13A.5) INTEGRATION');
    console.log('='.repeat(60));
    
    try {
        // Read the field mapping file
        const mappingPath = path.join(__dirname, '..', 'app', 'state', 'contexts', 'sections2.0', 'section13-field-mapping.ts');
        const mappingContent = fs.readFileSync(mappingPath, 'utf8');
        
        // Extract SECTION13_FIELD_MAPPINGS object
        const mappingMatch = mappingContent.match(/export const SECTION13_FIELD_MAPPINGS = \{([\s\S]*?)\} as const;/);
        
        if (!mappingMatch) {
            console.log('❌ Could not find SECTION13_FIELD_MAPPINGS in the file');
            return;
        }
        
        const mappingContent2 = mappingMatch[1];
        
        // Count Employment Issues mappings
        const employmentIssuesMappings = [];
        const lines = mappingContent2.split('\n');
        
        for (const line of lines) {
            if (line.includes('section13.employmentIssues.entries[0]') && line.includes(':')) {
                const cleanLine = line.trim();
                if (cleanLine.endsWith(',')) {
                    employmentIssuesMappings.push(cleanLine.slice(0, -1)); // Remove trailing comma
                } else {
                    employmentIssuesMappings.push(cleanLine);
                }
            }
        }
        
        console.log(`📊 EMPLOYMENT ISSUES INTEGRATION VALIDATION:`);
        console.log(`   Total Employment Issues mappings found: ${employmentIssuesMappings.length}`);
        
        // Validate mapping structure
        const validMappings = [];
        const invalidMappings = [];
        
        for (const mapping of employmentIssuesMappings) {
            const mappingMatch = mapping.match(/^\s*'([^']+)':\s*'([^']+)'\s*$/);
            
            if (mappingMatch) {
                const logicalPath = mappingMatch[1];
                const pdfField = mappingMatch[2];
                
                // Validate logical path structure
                if (logicalPath.startsWith('section13.employmentIssues.entries[0].') && 
                    logicalPath.endsWith('.value')) {
                    
                    // Validate PDF field structure
                    if (pdfField.startsWith('form1[0].section13_5[')) {
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
        const mainQuestionFields = Object.keys(fieldTypes).filter(f => f.startsWith('hasEmploymentIssues')).length;
        const additionalFields = Object.keys(fieldTypes).filter(f => f.startsWith('additional')).length;
        const positionFields = Object.keys(fieldTypes).filter(f => f.includes('positionTitle') || f.includes('agencyName')).length;
        const addressFields = Object.keys(fieldTypes).filter(f => f.includes('street') || f.includes('city') || f.includes('state') || f.includes('country') || f.includes('zip')).length;
        const dateFields = Object.keys(fieldTypes).filter(f => f.includes('Date')).length;
        const statusFields = Object.keys(fieldTypes).filter(f => f.includes('Estimated') || f.includes('Present')).length;
        
        console.log(`   Main question fields: ${mainQuestionFields}`);
        console.log(`   Additional employment fields: ${additionalFields}`);
        console.log(`   Position/Agency fields: ${positionFields}`);
        console.log(`   Address fields: ${addressFields}`);
        console.log(`   Date fields: ${dateFields}`);
        console.log(`   Status fields: ${statusFields}`);
        
        // Show sample mappings
        console.log(`\n📋 SAMPLE VALID MAPPINGS:`);
        for (let i = 0; i < Math.min(10, validMappings.length); i++) {
            const { logicalPath, pdfField } = validMappings[i];
            console.log(`   ${i + 1}. ${logicalPath} -> ${pdfField}`);
        }
        
        if (validMappings.length > 10) {
            console.log(`   ... and ${validMappings.length - 10} more valid mappings`);
        }
        
        // Validate against expected field count
        const expectedFieldCount = 150;
        
        console.log(`\n✅ FIELD COUNT VALIDATION:`);
        console.log(`   Expected Employment Issues fields: ${expectedFieldCount}`);
        console.log(`   Found Employment Issues fields: ${employmentIssuesMappings.length}`);
        console.log(`   Valid mappings: ${validMappings.length}`);
        console.log(`   Coverage: ${((validMappings.length / expectedFieldCount) * 100).toFixed(1)}%`);
        
        // Check for key field patterns
        const keyPatterns = [
            'hasEmploymentIssues',
            'additionalPositionTitle',
            'positionTitle1',
            'agencyName1',
            'street1',
            'city1',
            'state1',
            'country1',
            'zip1',
            'fromDate1',
            'toDate1'
        ];
        
        console.log(`\n🔍 KEY FIELD PATTERN VALIDATION:`);
        const missingPatterns = [];
        const presentPatterns = [];
        
        for (const pattern of keyPatterns) {
            const found = Object.keys(fieldTypes).some(field => field.includes(pattern));
            if (found) {
                presentPatterns.push(pattern);
            } else {
                missingPatterns.push(pattern);
            }
        }
        
        console.log(`   Key patterns present: ${presentPatterns.length}/${keyPatterns.length}`);
        console.log(`   Missing patterns: ${missingPatterns.length}`);
        
        if (missingPatterns.length > 0) {
            console.log(`   Missing: ${missingPatterns.join(', ')}`);
        }
        
        // Final validation summary
        console.log(`\n🎯 INTEGRATION VALIDATION SUMMARY:`);
        console.log(`   Total Employment Issues mappings: ${employmentIssuesMappings.length}`);
        console.log(`   Valid mappings: ${validMappings.length}`);
        console.log(`   Invalid mappings: ${invalidMappings.length}`);
        console.log(`   Expected field count: ${expectedFieldCount}`);
        console.log(`   Coverage: ${((validMappings.length / expectedFieldCount) * 100).toFixed(1)}%`);
        console.log(`   Key patterns covered: ${presentPatterns.length}/${keyPatterns.length}`);
        
        const isFullyValid = invalidMappings.length === 0 && 
                           validMappings.length === expectedFieldCount && 
                           missingPatterns.length === 0;
        
        console.log(`   Integration status: ${isFullyValid ? '✅ FULLY VALIDATED' : '⚠️ ISSUES FOUND'}`);
        
        if (isFullyValid) {
            console.log(`\n🎉 Employment Issues (13A.5) integration is fully validated and ready!`);
            console.log(`   All 150 fields are properly mapped and accessible through the TypeScript interface.`);
        } else {
            console.log(`\n⚠️  Please review and fix the identified issues before proceeding.`);
        }
        
    } catch (error) {
        console.log(`❌ Error validating integration: ${error.message}`);
    }
}

if (require.main === module) {
    main();
}
