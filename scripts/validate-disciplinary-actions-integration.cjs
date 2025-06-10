#!/usr/bin/env node
/**
 * Phase 8: Validate Disciplinary Actions (13A.6) Integration
 * Test that all 213 Disciplinary Actions fields are properly integrated
 */

const fs = require('fs');
const path = require('path');

function main() {
    console.log('🔍 VALIDATING DISCIPLINARY ACTIONS (13A.6) INTEGRATION');
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
        
        // Count Disciplinary Actions mappings
        const disciplinaryActionsMappings = [];
        const lines = mappingContent2.split('\n');
        
        for (const line of lines) {
            if (line.includes('section13.disciplinaryActions.entries[0]') && line.includes(':')) {
                const cleanLine = line.trim();
                if (cleanLine.endsWith(',')) {
                    disciplinaryActionsMappings.push(cleanLine.slice(0, -1)); // Remove trailing comma
                } else {
                    disciplinaryActionsMappings.push(cleanLine);
                }
            }
        }
        
        console.log(`📊 DISCIPLINARY ACTIONS INTEGRATION VALIDATION:`);
        console.log(`   Total Disciplinary Actions mappings found: ${disciplinaryActionsMappings.length}`);
        
        // Validate mapping structure
        const validMappings = [];
        const invalidMappings = [];
        
        for (const mapping of disciplinaryActionsMappings) {
            const mappingMatch = mapping.match(/^\s*'([^']+)':\s*'([^']+)'\s*$/);
            
            if (mappingMatch) {
                const logicalPath = mappingMatch[1];
                const pdfField = mappingMatch[2];
                
                // Validate logical path structure
                if (logicalPath.startsWith('section13.disciplinaryActions.entries[0].') && 
                    logicalPath.endsWith('.value')) {
                    
                    // Validate PDF field structure (should be section13_4 since disciplinary actions are part of unemployment)
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
        const mainQuestionFields = Object.keys(fieldTypes).filter(f => f.startsWith('hasDisciplinaryActions')).length;
        const reasonFields = Object.keys(fieldTypes).filter(f => f.includes('reason') || f.includes('Reason')).length;
        const dateFields = Object.keys(fieldTypes).filter(f => f.includes('date') || f.includes('Date')).length;
        const additionalFields = Object.keys(fieldTypes).filter(f => f.startsWith('additional')).length;
        const chargesFields = Object.keys(fieldTypes).filter(f => f.includes('charges') || f.includes('Charges')).length;
        const statusFields = Object.keys(fieldTypes).filter(f => f.includes('status') || f.includes('Status')).length;
        
        console.log(`   Main question fields: ${mainQuestionFields}`);
        console.log(`   Reason fields: ${reasonFields}`);
        console.log(`   Date fields: ${dateFields}`);
        console.log(`   Additional fields: ${additionalFields}`);
        console.log(`   Charges/allegations fields: ${chargesFields}`);
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
        const expectedFieldCount = 213;
        
        console.log(`\n✅ FIELD COUNT VALIDATION:`);
        console.log(`   Expected Disciplinary Actions fields: ${expectedFieldCount}`);
        console.log(`   Found Disciplinary Actions fields: ${disciplinaryActionsMappings.length}`);
        console.log(`   Valid mappings: ${validMappings.length}`);
        console.log(`   Coverage: ${((validMappings.length / expectedFieldCount) * 100).toFixed(1)}%`);
        
        // Check for key field patterns
        const keyPatterns = [
            'hasDisciplinaryActions',
            'reasonForUnsatisfactory',
            'chargesOrAllegations',
            'reasonForQuitting',
            'reasonForBeingFired',
            'dateFired',
            'dateQuit',
            'additionalReason',
            'additionalDate',
            'additionalStatus'
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
        console.log(`   Total Disciplinary Actions mappings: ${disciplinaryActionsMappings.length}`);
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
            console.log(`\n🎉 Disciplinary Actions (13A.6) integration is fully validated and ready!`);
            console.log(`   All 213 fields are properly mapped and accessible through the TypeScript interface.`);
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
