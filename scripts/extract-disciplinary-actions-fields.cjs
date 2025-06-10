#!/usr/bin/env node
/**
 * Phase 8: Extract Disciplinary Actions (13A.6) Fields
 * Extract and analyze all disciplinary action fields from the JSON data
 * These are actually part of section13_4 (Unemployment) but relate to employment termination
 */

const fs = require('fs');
const path = require('path');

function main() {
    console.log('🔍 EXTRACTING DISCIPLINARY ACTIONS (13A.6) FIELDS');
    console.log('='.repeat(60));
    
    try {
        // Read the section-13.json file
        const jsonPath = path.join(__dirname, '..', 'api', 'sections-references', 'section-13.json');
        const jsonData = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
        
        // Extract all disciplinary action related fields
        const disciplinaryFields = [];
        
        function extractFields(obj, currentPath = '') {
            if (Array.isArray(obj)) {
                obj.forEach((item, index) => {
                    extractFields(item, `${currentPath}[${index}]`);
                });
            } else if (obj && typeof obj === 'object') {
                for (const [key, value] of Object.entries(obj)) {
                    const newPath = currentPath ? `${currentPath}.${key}` : key;
                    
                    if (key === 'name' && typeof value === 'string') {
                        // Look for disciplinary action related fields
                        const isDisciplinaryField = 
                            // Fields related to being fired, quitting, termination
                            (value.includes('section13_4') && (
                                value.includes('#area[1].#field[26]') || // Reason for quitting
                                value.includes('#area[1].#field[27]') || // Reason for being fired
                                value.includes('From_Datefield_Name_2[2]') || // Date fired
                                value.includes('From_Datefield_Name_2[3]') || // Date quit
                                value.includes('#area[1].#field[24]') || // Reason for unsatisfactory
                                value.includes('#area[1].#field[25]') || // Charges or allegations
                                value.includes('#area[2].#field[36]') || // Additional reasons
                                value.includes('#area[2].#field[37]') || // Additional reasons
                                value.includes('#area[2].#field[38]') || // Additional status
                                value.includes('#area[2].From_Datefield_Name_2[6]') || // Additional dates
                                value.includes('#area[2].From_Datefield_Name_2[7]') || // Additional dates
                                value.includes('#area[2].#field[41]') || // Additional field
                                value.includes('#field[42]') || // Additional reasons
                                value.includes('#field[43]') || // Additional reasons
                                value.includes('#field[44]') || // Additional field
                                value.includes('From_Datefield_Name_2[8]') || // Additional dates
                                value.includes('From_Datefield_Name_2[9]') || // Additional dates
                                value.includes('#field[47]') // Additional field
                            )) ||
                            // RadioButtonList[2] which is often related to disciplinary actions
                            (value.includes('section13_4') && value.includes('RadioButtonList[2]'));
                        
                        if (isDisciplinaryField) {
                            disciplinaryFields.push(obj);
                        }
                    }
                    
                    extractFields(value, newPath);
                }
            }
        }
        
        extractFields(jsonData);
        
        console.log(`📊 Found ${disciplinaryFields.length} Disciplinary Action fields`);
        
        // Analyze field patterns
        const fieldPatterns = {};
        const fieldTypes = {};
        const uniqueFields = new Set();
        
        disciplinaryFields.forEach(field => {
            const name = field.name;
            uniqueFields.add(name);
            
            // Extract pattern type
            if (name.includes('RadioButtonList')) {
                fieldTypes.radioButton = (fieldTypes.radioButton || 0) + 1;
            } else if (name.includes('From_Datefield_Name_2')) {
                fieldTypes.dateField = (fieldTypes.dateField || 0) + 1;
            } else if (name.includes('#field')) {
                fieldTypes.genericField = (fieldTypes.genericField || 0) + 1;
            } else {
                fieldTypes.other = (fieldTypes.other || 0) + 1;
            }
            
            // Extract base pattern
            const basePattern = name.replace(/\[\d+\]/g, '[N]');
            fieldPatterns[basePattern] = (fieldPatterns[basePattern] || 0) + 1;
        });
        
        console.log(`📋 Unique field names: ${uniqueFields.size}`);
        
        console.log(`\n📊 FIELD TYPE ANALYSIS:`);
        Object.entries(fieldTypes).forEach(([type, count]) => {
            console.log(`   ${type}: ${count} fields`);
        });
        
        console.log(`\n🔍 TOP FIELD PATTERNS:`);
        const sortedPatterns = Object.entries(fieldPatterns)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 15);
        
        sortedPatterns.forEach(([pattern, count]) => {
            console.log(`   ${count}x: ${pattern}`);
        });
        
        // Analyze field structure for logical grouping
        console.log(`\n🏗️ FIELD STRUCTURE ANALYSIS:`);
        
        const reasonFields = disciplinaryFields.filter(f => 
            f.name.includes('#field[26]') || f.name.includes('#field[27]') || 
            f.name.includes('#field[24]') || f.name.includes('#field[25]')
        );
        
        const dateFields = disciplinaryFields.filter(f => 
            f.name.includes('From_Datefield_Name_2')
        );
        
        const additionalFields = disciplinaryFields.filter(f => 
            f.name.includes('#area[2]')
        );
        
        const statusFields = disciplinaryFields.filter(f => 
            f.name.includes('RadioButtonList[2]')
        );
        
        console.log(`   Reason fields: ${reasonFields.length}`);
        console.log(`   Date fields: ${dateFields.length}`);
        console.log(`   Additional fields: ${additionalFields.length}`);
        console.log(`   Status fields: ${statusFields.length}`);
        
        // Sample fields for each category
        console.log(`\n📋 SAMPLE FIELDS BY CATEGORY:`);
        
        console.log(`\n   Reason Fields:`);
        reasonFields.slice(0, 3).forEach(field => {
            console.log(`     ${field.name} = "${field.value || field.label || 'N/A'}"`);
        });
        
        console.log(`\n   Date Fields:`);
        dateFields.slice(0, 3).forEach(field => {
            console.log(`     ${field.name} = "${field.value || field.label || 'N/A'}"`);
        });
        
        console.log(`\n   Additional Fields:`);
        additionalFields.slice(0, 3).forEach(field => {
            console.log(`     ${field.name} = "${field.value || field.label || 'N/A'}"`);
        });
        
        console.log(`\n   Status Fields:`);
        statusFields.slice(0, 3).forEach(field => {
            console.log(`     ${field.name} = "${field.value || field.label || 'N/A'}"`);
        });
        
        // Save extracted fields for mapping generation
        const outputData = {
            totalFields: disciplinaryFields.length,
            uniqueFields: uniqueFields.size,
            fieldTypes,
            fieldPatterns,
            fields: disciplinaryFields.map(field => ({
                name: field.name,
                value: field.value,
                label: field.label,
                page: field.page,
                uniqueId: field.uniqueId,
                type: field.type
            }))
        };
        
        const outputPath = path.join(__dirname, 'disciplinary-actions-fields.json');
        fs.writeFileSync(outputPath, JSON.stringify(outputData, null, 2));
        
        console.log(`\n💾 Saved field data to: ${outputPath}`);
        console.log(`\n✅ Disciplinary Actions field extraction complete!`);
        console.log(`   Total fields: ${disciplinaryFields.length}`);
        console.log(`   Unique fields: ${uniqueFields.size}`);
        console.log(`   Ready for mapping generation`);
        
    } catch (error) {
        console.error(`❌ Error: ${error.message}`);
        process.exit(1);
    }
}

if (require.main === module) {
    main();
}
