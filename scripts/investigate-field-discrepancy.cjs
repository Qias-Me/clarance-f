#!/usr/bin/env node
/**
 * Investigate Field Count Discrepancy
 * Understand why we're seeing different field counts and what the true scope is
 */

const fs = require('fs');
const path = require('path');

function main() {
    console.log('🔍 INVESTIGATING FIELD COUNT DISCREPANCY');
    console.log('='.repeat(60));
    
    try {
        // Read the section-13.json file
        const jsonPath = path.join(__dirname, '..', 'api', 'sections-references', 'section-13.json');
        const jsonData = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
        
        // Extract all fields with detailed analysis
        const allFields = [];
        const uniqueFieldNames = new Set();
        
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
                        uniqueFieldNames.add(value);
                    }
                    
                    extractFields(value, newPath);
                }
            }
        }
        
        extractFields(jsonData);
        
        console.log(`📊 DETAILED FIELD ANALYSIS:`);
        console.log(`   Total field entries in JSON: ${allFields.length}`);
        console.log(`   Unique field names: ${uniqueFieldNames.size}`);
        console.log(`   Duplication factor: ${(allFields.length / uniqueFieldNames.size).toFixed(1)}x`);
        
        // Analyze duplicates
        const fieldCounts = {};
        for (const field of allFields) {
            fieldCounts[field.name] = (fieldCounts[field.name] || 0) + 1;
        }
        
        const duplicatedFields = Object.entries(fieldCounts).filter(([name, count]) => count > 1);
        console.log(`   Fields with duplicates: ${duplicatedFields.length}`);
        
        // Show top duplicated fields
        console.log(`\n🔍 TOP DUPLICATED FIELDS:`);
        const sortedDuplicates = duplicatedFields.sort(([,a], [,b]) => b - a).slice(0, 10);
        for (const [name, count] of sortedDuplicates) {
            console.log(`   ${count}x: ${name}`);
        }
        
        // Read current mappings and count them properly
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
        
        console.log(`\n📊 MAPPING ANALYSIS:`);
        console.log(`   Mapped unique field names: ${mappedFields.size}`);
        console.log(`   Unmapped unique field names: ${uniqueFieldNames.size - mappedFields.size}`);
        console.log(`   Coverage (unique fields): ${((mappedFields.size / uniqueFieldNames.size) * 100).toFixed(1)}%`);
        
        // Count our known mappings by section
        console.log(`\n📋 KNOWN MAPPING COUNTS BY SECTION:`);
        const knownMappings = {
            'Federal Employment (13A.1)': 50,
            'Non-Federal Employment (13A.2)': 155,
            'Self-Employment (13A.3)': 119,
            'Unemployment (13A.4)': 67,
            'Employment Issues (13A.5)': 150,
            'Disciplinary Actions (13A.6)': 213
        };
        
        let totalKnownMappings = 0;
        for (const [section, count] of Object.entries(knownMappings)) {
            console.log(`   ${section}: ${count} fields`);
            totalKnownMappings += count;
        }
        console.log(`   Total known mappings: ${totalKnownMappings}`);
        
        // Analyze unique fields by section pattern
        console.log(`\n📊 UNIQUE FIELDS BY SECTION PATTERN:`);
        const uniqueBySection = {};
        
        for (const fieldName of uniqueFieldNames) {
            const sectionMatch = fieldName.match(/section13_(\d+)/);
            if (sectionMatch) {
                const sectionNum = sectionMatch[1];
                if (!uniqueBySection[sectionNum]) {
                    uniqueBySection[sectionNum] = new Set();
                }
                uniqueBySection[sectionNum].add(fieldName);
            }
        }
        
        Object.entries(uniqueBySection).forEach(([section, fieldSet]) => {
            console.log(`   Section 13.${section}: ${fieldSet.size} unique fields`);
        });
        
        // Check if we're missing any major sections
        console.log(`\n🔍 SECTION COVERAGE ANALYSIS:`);
        const mappedBySection = {};
        
        for (const fieldName of mappedFields) {
            const sectionMatch = fieldName.match(/section13_(\d+)/);
            if (sectionMatch) {
                const sectionNum = sectionMatch[1];
                if (!mappedBySection[sectionNum]) {
                    mappedBySection[sectionNum] = new Set();
                }
                mappedBySection[sectionNum].add(fieldName);
            }
        }
        
        Object.entries(uniqueBySection).forEach(([section, fieldSet]) => {
            const mappedCount = mappedBySection[section] ? mappedBySection[section].size : 0;
            const coverage = ((mappedCount / fieldSet.size) * 100).toFixed(1);
            console.log(`   Section 13.${section}: ${mappedCount}/${fieldSet.size} mapped (${coverage}%)`);
        });
        
        // Identify truly unmapped unique fields
        const unmappedUniqueFields = [];
        for (const fieldName of uniqueFieldNames) {
            if (!mappedFields.has(fieldName)) {
                unmappedUniqueFields.push(fieldName);
            }
        }
        
        console.log(`\n🎯 TRUE SCOPE ANALYSIS:`);
        console.log(`   Total unique fields: ${uniqueFieldNames.size}`);
        console.log(`   Mapped unique fields: ${mappedFields.size}`);
        console.log(`   Unmapped unique fields: ${unmappedUniqueFields.length}`);
        console.log(`   True coverage: ${((mappedFields.size / uniqueFieldNames.size) * 100).toFixed(1)}%`);
        
        // Show sample unmapped unique fields
        if (unmappedUniqueFields.length > 0) {
            console.log(`\n🔍 SAMPLE UNMAPPED UNIQUE FIELDS:`);
            for (let i = 0; i < Math.min(15, unmappedUniqueFields.length); i++) {
                console.log(`   ${i + 1}. ${unmappedUniqueFields[i]}`);
            }
            
            if (unmappedUniqueFields.length > 15) {
                console.log(`   ... and ${unmappedUniqueFields.length - 15} more unmapped unique fields`);
            }
        }
        
        // Final assessment
        console.log(`\n🎯 PROJECT SCOPE CLARIFICATION:`);
        console.log(`   Original estimate: 1,086 fields`);
        console.log(`   Actual unique fields: ${uniqueFieldNames.size}`);
        console.log(`   Total JSON entries: ${allFields.length} (includes duplicates)`);
        console.log(`   Current progress: ${mappedFields.size}/${uniqueFieldNames.size} unique fields mapped`);
        console.log(`   Remaining work: ${unmappedUniqueFields.length} unique fields to map`);
        
        if (unmappedUniqueFields.length === 0) {
            console.log(`\n🎉 PERFECT! 100% unique field coverage achieved!`);
        } else {
            console.log(`\n📋 Next steps: Map the remaining ${unmappedUniqueFields.length} unique fields`);
        }
        
    } catch (error) {
        console.error(`❌ Error: ${error.message}`);
        process.exit(1);
    }
}

if (require.main === module) {
    main();
}
