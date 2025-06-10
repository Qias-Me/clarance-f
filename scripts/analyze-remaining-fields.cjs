#!/usr/bin/env node
/**
 * Phase 9: Analyze Remaining Fields and Validate Coverage
 * Identify any unmapped fields and validate 100% coverage
 */

const fs = require('fs');
const path = require('path');

function main() {
    console.log('🔍 ANALYZING REMAINING FIELDS AND VALIDATING COVERAGE');
    console.log('='.repeat(60));
    
    try {
        // Read the section-13.json file to get all available fields
        const jsonPath = path.join(__dirname, '..', 'api', 'sections-references', 'section-13.json');
        const jsonData = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
        
        // Extract all fields from the JSON
        const allFields = [];
        
        function extractFields(obj, currentPath = '') {
            if (Array.isArray(obj)) {
                obj.forEach((item, index) => {
                    extractFields(item, `${currentPath}[${index}]`);
                });
            } else if (obj && typeof obj === 'object') {
                for (const [key, value] of Object.entries(obj)) {
                    const newPath = currentPath ? `${currentPath}.${key}` : key;
                    
                    if (key === 'name' && typeof value === 'string' && value.includes('section13')) {
                        allFields.push({
                            name: value,
                            value: obj.value,
                            label: obj.label,
                            page: obj.page,
                            uniqueId: obj.uniqueId,
                            type: obj.type
                        });
                    }
                    
                    extractFields(value, newPath);
                }
            }
        }
        
        extractFields(jsonData);
        
        console.log(`📊 TOTAL FIELDS ANALYSIS:`);
        console.log(`   Total fields in section-13.json: ${allFields.length}`);
        
        // Read the current field mapping file to see what's already mapped
        const mappingPath = path.join(__dirname, '..', 'app', 'state', 'contexts', 'sections2.0', 'section13-field-mapping.ts');
        const mappingContent = fs.readFileSync(mappingPath, 'utf8');
        
        // Extract all mapped PDF field names
        const mappedFields = new Set();
        const mappingMatch = mappingContent.match(/export const SECTION13_FIELD_MAPPINGS = \{([\s\S]*?)\} as const;/);
        
        if (mappingMatch) {
            const mappingContent2 = mappingMatch[1];
            const lines = mappingContent2.split('\n');
            
            for (const line of lines) {
                if (line.includes(':') && line.includes("'form1[0].section13")) {
                    const pdfFieldMatch = line.match(/'(form1\[0\]\.section13[^']+)'/);
                    if (pdfFieldMatch) {
                        mappedFields.add(pdfFieldMatch[1]);
                    }
                }
            }
        }
        
        console.log(`   Currently mapped fields: ${mappedFields.size}`);
        
        // Identify unmapped fields
        const unmappedFields = [];
        const mappedFieldsList = [];
        
        for (const field of allFields) {
            if (mappedFields.has(field.name)) {
                mappedFieldsList.push(field);
            } else {
                unmappedFields.push(field);
            }
        }
        
        console.log(`   Unmapped fields: ${unmappedFields.length}`);
        console.log(`   Coverage: ${((mappedFields.size / allFields.length) * 100).toFixed(1)}%`);
        
        // Analyze unmapped fields by section
        console.log(`\n📋 UNMAPPED FIELDS BY SECTION:`);
        const unmappedBySection = {};
        
        for (const field of unmappedFields) {
            const sectionMatch = field.name.match(/section13_(\d+)/);
            if (sectionMatch) {
                const sectionNum = sectionMatch[1];
                if (!unmappedBySection[sectionNum]) {
                    unmappedBySection[sectionNum] = [];
                }
                unmappedBySection[sectionNum].push(field);
            }
        }
        
        Object.entries(unmappedBySection).forEach(([section, fields]) => {
            console.log(`   Section 13.${section}: ${fields.length} unmapped fields`);
        });
        
        // Analyze mapped fields by section
        console.log(`\n📊 MAPPED FIELDS BY SECTION:`);
        const mappedBySection = {};
        
        for (const field of mappedFieldsList) {
            const sectionMatch = field.name.match(/section13_(\d+)/);
            if (sectionMatch) {
                const sectionNum = sectionMatch[1];
                if (!mappedBySection[sectionNum]) {
                    mappedBySection[sectionNum] = [];
                }
                mappedBySection[sectionNum].push(field);
            }
        }
        
        Object.entries(mappedBySection).forEach(([section, fields]) => {
            console.log(`   Section 13.${section}: ${fields.length} mapped fields`);
        });
        
        // Show sample unmapped fields
        if (unmappedFields.length > 0) {
            console.log(`\n🔍 SAMPLE UNMAPPED FIELDS:`);
            for (let i = 0; i < Math.min(20, unmappedFields.length); i++) {
                const field = unmappedFields[i];
                console.log(`   ${i + 1}. ${field.name} (${field.type || 'unknown'}) - "${field.value || field.label || 'N/A'}"`);
            }
            
            if (unmappedFields.length > 20) {
                console.log(`   ... and ${unmappedFields.length - 20} more unmapped fields`);
            }
        }
        
        // Analyze field patterns in unmapped fields
        if (unmappedFields.length > 0) {
            console.log(`\n🔍 UNMAPPED FIELD PATTERNS:`);
            const patterns = {};
            
            for (const field of unmappedFields) {
                const basePattern = field.name.replace(/\[\d+\]/g, '[N]');
                patterns[basePattern] = (patterns[basePattern] || 0) + 1;
            }
            
            const sortedPatterns = Object.entries(patterns)
                .sort(([,a], [,b]) => b - a)
                .slice(0, 10);
            
            sortedPatterns.forEach(([pattern, count]) => {
                console.log(`   ${count}x: ${pattern}`);
            });
        }
        
        // Save unmapped fields for further analysis
        if (unmappedFields.length > 0) {
            const outputData = {
                totalFields: allFields.length,
                mappedFields: mappedFields.size,
                unmappedFields: unmappedFields.length,
                coverage: ((mappedFields.size / allFields.length) * 100).toFixed(1),
                unmappedBySection,
                mappedBySection,
                unmappedFieldsList: unmappedFields
            };
            
            const outputPath = path.join(__dirname, 'remaining-fields-analysis.json');
            fs.writeFileSync(outputPath, JSON.stringify(outputData, null, 2));
            
            console.log(`\n💾 Saved unmapped fields analysis to: ${outputPath}`);
        }
        
        // Final summary
        console.log(`\n🎯 COVERAGE ANALYSIS SUMMARY:`);
        console.log(`   Total fields in Section 13: ${allFields.length}`);
        console.log(`   Currently mapped: ${mappedFields.size}`);
        console.log(`   Remaining unmapped: ${unmappedFields.length}`);
        console.log(`   Current coverage: ${((mappedFields.size / allFields.length) * 100).toFixed(1)}%`);
        
        if (unmappedFields.length === 0) {
            console.log(`\n🎉 PERFECT! 100% field coverage achieved!`);
            console.log(`   All ${allFields.length} fields are properly mapped.`);
        } else {
            console.log(`\n⚠️  ${unmappedFields.length} fields still need to be mapped to achieve 100% coverage.`);
            console.log(`   Next step: Map the remaining fields to complete the project.`);
        }
        
    } catch (error) {
        console.error(`❌ Error: ${error.message}`);
        process.exit(1);
    }
}

if (require.main === module) {
    main();
}
