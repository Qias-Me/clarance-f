#!/usr/bin/env node
/**
 * Phase 7: Extract Employment Issues (13A.5) Fields
 * Extract and analyze all section13_5 fields from the JSON data
 */

const fs = require('fs');
const path = require('path');

function main() {
    console.log('🔍 EXTRACTING EMPLOYMENT ISSUES (13A.5) FIELDS');
    console.log('='.repeat(60));
    
    try {
        // Read the section-13.json file
        const jsonPath = path.join(__dirname, '..', 'api', 'sections-references', 'section-13.json');
        const jsonData = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
        
        // Extract all section13_5 fields
        const employmentIssuesFields = [];
        
        function extractFields(obj, currentPath = '') {
            if (Array.isArray(obj)) {
                obj.forEach((item, index) => {
                    extractFields(item, `${currentPath}[${index}]`);
                });
            } else if (obj && typeof obj === 'object') {
                for (const [key, value] of Object.entries(obj)) {
                    const newPath = currentPath ? `${currentPath}.${key}` : key;
                    
                    if (key === 'name' && typeof value === 'string' && value.includes('section13_5')) {
                        // Found a section13_5 field
                        employmentIssuesFields.push(obj);
                    }
                    
                    extractFields(value, newPath);
                }
            }
        }
        
        extractFields(jsonData);
        
        console.log(`📊 Found ${employmentIssuesFields.length} Employment Issues fields`);
        
        // Analyze field patterns
        const fieldPatterns = {};
        const fieldTypes = {};
        const uniqueFields = new Set();
        
        employmentIssuesFields.forEach(field => {
            const name = field.name;
            uniqueFields.add(name);
            
            // Extract pattern type
            if (name.includes('RadioButtonList')) {
                fieldTypes.radioButton = (fieldTypes.radioButton || 0) + 1;
            } else if (name.includes('TextField11')) {
                fieldTypes.textField = (fieldTypes.textField || 0) + 1;
            } else if (name.includes('p3-t68')) {
                fieldTypes.positionTitle = (fieldTypes.positionTitle || 0) + 1;
            } else if (name.includes('School6_State')) {
                fieldTypes.stateDropdown = (fieldTypes.stateDropdown || 0) + 1;
            } else if (name.includes('DropDownList2')) {
                fieldTypes.countryDropdown = (fieldTypes.countryDropdown || 0) + 1;
            } else if (name.includes('From_Datefield_Name_2')) {
                fieldTypes.dateField = (fieldTypes.dateField || 0) + 1;
            } else if (name.includes('#field')) {
                fieldTypes.genericField = (fieldTypes.genericField || 0) + 1;
            } else if (name.includes('#area')) {
                fieldTypes.areaField = (fieldTypes.areaField || 0) + 1;
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
        
        const mainQuestionFields = employmentIssuesFields.filter(f => 
            f.name.includes('RadioButtonList') && !f.name.includes('#area')
        );
        
        const areaFields = employmentIssuesFields.filter(f => 
            f.name.includes('#area[1]')
        );
        
        const directFields = employmentIssuesFields.filter(f => 
            !f.name.includes('#area') && !f.name.includes('RadioButtonList')
        );
        
        console.log(`   Main question fields: ${mainQuestionFields.length}`);
        console.log(`   Area-specific fields: ${areaFields.length}`);
        console.log(`   Direct fields: ${directFields.length}`);
        
        // Sample fields for each category
        console.log(`\n📋 SAMPLE FIELDS BY CATEGORY:`);
        
        console.log(`\n   Main Question Fields:`);
        mainQuestionFields.slice(0, 3).forEach(field => {
            console.log(`     ${field.name} = "${field.value || field.label || 'N/A'}"`);
        });
        
        console.log(`\n   Area-Specific Fields:`);
        areaFields.slice(0, 5).forEach(field => {
            console.log(`     ${field.name} = "${field.value || field.label || 'N/A'}"`);
        });
        
        console.log(`\n   Direct Fields:`);
        directFields.slice(0, 5).forEach(field => {
            console.log(`     ${field.name} = "${field.value || field.label || 'N/A'}"`);
        });
        
        // Save extracted fields for mapping generation
        const outputData = {
            totalFields: employmentIssuesFields.length,
            uniqueFields: uniqueFields.size,
            fieldTypes,
            fieldPatterns,
            fields: employmentIssuesFields.map(field => ({
                name: field.name,
                value: field.value,
                label: field.label,
                page: field.page,
                uniqueId: field.uniqueId
            }))
        };
        
        const outputPath = path.join(__dirname, 'employment-issues-fields.json');
        fs.writeFileSync(outputPath, JSON.stringify(outputData, null, 2));
        
        console.log(`\n💾 Saved field data to: ${outputPath}`);
        console.log(`\n✅ Employment Issues field extraction complete!`);
        console.log(`   Total fields: ${employmentIssuesFields.length}`);
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
