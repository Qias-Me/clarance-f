#!/usr/bin/env node
/**
 * Phase 7: Generate Employment Issues (13A.5) Field Mappings
 * Generate TypeScript field mappings for Employment Issues fields
 */

const fs = require('fs');
const path = require('path');

function generateLogicalFieldName(pdfFieldName, index) {
    // Handle main question fields
    if (pdfFieldName.includes('RadioButtonList[0]')) {
        return 'hasEmploymentIssues';
    }
    if (pdfFieldName.includes('RadioButtonList[1]')) {
        return 'hasEmploymentIssues'; // Same logical field, different option
    }
    
    // Handle area-specific fields (additional employment entries)
    if (pdfFieldName.includes('#area[1]')) {
        if (pdfFieldName.includes('p3-t68[0]')) return 'additionalPositionTitle';
        if (pdfFieldName.includes('p3-t68[1]')) return 'additionalAgencyName';
        if (pdfFieldName.includes('TextField11[0]')) return 'additionalStreet';
        if (pdfFieldName.includes('TextField11[1]')) return 'additionalCity';
        if (pdfFieldName.includes('TextField11[2]')) return 'additionalZip';
        if (pdfFieldName.includes('School6_State[0]')) return 'additionalState';
        if (pdfFieldName.includes('DropDownList2[0]')) return 'additionalCountry';
        if (pdfFieldName.includes('From_Datefield_Name_2[0]')) return 'additionalFromDate';
        if (pdfFieldName.includes('From_Datefield_Name_2[1]')) return 'additionalToDate';
        if (pdfFieldName.includes('#field[10]')) return 'additionalFromDateEstimated';
        if (pdfFieldName.includes('#field[12]')) return 'additionalToDatePresent';
        if (pdfFieldName.includes('#field[13]')) return 'additionalToDateEstimated';
    }
    
    // Handle direct employment issue fields
    if (pdfFieldName.includes('p3-t68[2]')) return 'positionTitle1';
    if (pdfFieldName.includes('p3-t68[3]')) return 'agencyName1';
    if (pdfFieldName.includes('p3-t68[4]')) return 'positionTitle2';
    if (pdfFieldName.includes('p3-t68[5]')) return 'agencyName2';
    if (pdfFieldName.includes('p3-t68[6]')) return 'positionTitle3';
    if (pdfFieldName.includes('p3-t68[7]')) return 'agencyName3';
    
    // Handle text fields for addresses
    if (pdfFieldName.includes('TextField11[3]')) return 'street1';
    if (pdfFieldName.includes('TextField11[4]')) return 'city1';
    if (pdfFieldName.includes('TextField11[5]')) return 'zip1';
    if (pdfFieldName.includes('TextField11[6]')) return 'street2';
    if (pdfFieldName.includes('TextField11[7]')) return 'city2';
    if (pdfFieldName.includes('TextField11[8]')) return 'zip2';
    if (pdfFieldName.includes('TextField11[9]')) return 'street3';
    if (pdfFieldName.includes('TextField11[10]')) return 'city3';
    if (pdfFieldName.includes('TextField11[11]')) return 'zip3';
    
    // Handle state dropdowns
    if (pdfFieldName.includes('School6_State[1]')) return 'state1';
    if (pdfFieldName.includes('School6_State[2]')) return 'state2';
    if (pdfFieldName.includes('School6_State[3]')) return 'state3';
    
    // Handle country dropdowns
    if (pdfFieldName.includes('DropDownList2[1]')) return 'country1';
    if (pdfFieldName.includes('DropDownList2[2]')) return 'country2';
    if (pdfFieldName.includes('DropDownList2[3]')) return 'country3';
    
    // Handle date fields
    if (pdfFieldName.includes('From_Datefield_Name_2[2]')) return 'fromDate1';
    if (pdfFieldName.includes('From_Datefield_Name_2[3]')) return 'toDate1';
    if (pdfFieldName.includes('From_Datefield_Name_2[4]')) return 'fromDate2';
    if (pdfFieldName.includes('From_Datefield_Name_2[5]')) return 'toDate2';
    if (pdfFieldName.includes('From_Datefield_Name_2[6]')) return 'fromDate3';
    if (pdfFieldName.includes('From_Datefield_Name_2[7]')) return 'toDate3';
    
    // Handle generic status fields
    if (pdfFieldName.includes('#field[22]')) return 'fromDate1Estimated';
    if (pdfFieldName.includes('#field[24]')) return 'toDate1Present';
    if (pdfFieldName.includes('#field[25]')) return 'toDate1Estimated';
    if (pdfFieldName.includes('#field[34]')) return 'fromDate2Estimated';
    if (pdfFieldName.includes('#field[36]')) return 'toDate2Present';
    if (pdfFieldName.includes('#field[37]')) return 'toDate2Estimated';
    if (pdfFieldName.includes('#field[46]')) return 'fromDate3Estimated';
    if (pdfFieldName.includes('#field[48]')) return 'toDate3Present';
    if (pdfFieldName.includes('#field[49]')) return 'toDate3Estimated';
    
    // Fallback to generic field naming
    const fieldMatch = pdfFieldName.match(/#field\[(\d+)\]/);
    if (fieldMatch) {
        return `field${fieldMatch[1]}`;
    }
    
    const textFieldMatch = pdfFieldName.match(/TextField11\[(\d+)\]/);
    if (textFieldMatch) {
        return `textField${textFieldMatch[1]}`;
    }
    
    const dateFieldMatch = pdfFieldName.match(/From_Datefield_Name_2\[(\d+)\]/);
    if (dateFieldMatch) {
        return `dateField${dateFieldMatch[1]}`;
    }
    
    const stateFieldMatch = pdfFieldName.match(/School6_State\[(\d+)\]/);
    if (stateFieldMatch) {
        return `stateField${stateFieldMatch[1]}`;
    }
    
    const countryFieldMatch = pdfFieldName.match(/DropDownList2\[(\d+)\]/);
    if (countryFieldMatch) {
        return `countryField${countryFieldMatch[1]}`;
    }
    
    const positionFieldMatch = pdfFieldName.match(/p3-t68\[(\d+)\]/);
    if (positionFieldMatch) {
        return `positionField${positionFieldMatch[1]}`;
    }
    
    return `employmentIssuesField${index}`;
}

function main() {
    console.log('🔧 GENERATING EMPLOYMENT ISSUES (13A.5) FIELD MAPPINGS');
    console.log('='.repeat(60));
    
    try {
        // Read the extracted field data
        const fieldsPath = path.join(__dirname, 'employment-issues-fields.json');
        const fieldsData = JSON.parse(fs.readFileSync(fieldsPath, 'utf8'));
        
        console.log(`📊 Processing ${fieldsData.totalFields} Employment Issues fields`);
        
        // Generate mappings
        const mappings = [];
        const seenLogicalNames = new Set();
        
        fieldsData.fields.forEach((field, index) => {
            const logicalName = generateLogicalFieldName(field.name, index);
            const logicalPath = `section13.employmentIssues.entries[0].${logicalName}.value`;
            
            // Handle duplicate logical names by adding suffix
            let finalLogicalName = logicalName;
            let suffix = 1;
            while (seenLogicalNames.has(finalLogicalName)) {
                finalLogicalName = `${logicalName}${suffix}`;
                suffix++;
            }
            seenLogicalNames.add(finalLogicalName);
            
            const finalLogicalPath = `section13.employmentIssues.entries[0].${finalLogicalName}.value`;
            
            mappings.push({
                logicalPath: finalLogicalPath,
                pdfField: field.name,
                fieldType: determineFieldType(field.name),
                description: generateFieldDescription(field.name, field.value, field.label)
            });
        });
        
        console.log(`✅ Generated ${mappings.length} field mappings`);
        
        // Generate TypeScript mapping code
        const tsCode = generateTypeScriptMappings(mappings);
        
        // Save the mappings
        const outputPath = path.join(__dirname, 'employment-issues-mappings.ts');
        fs.writeFileSync(outputPath, tsCode);
        
        console.log(`💾 Saved TypeScript mappings to: ${outputPath}`);
        
        // Generate summary
        const fieldTypeCounts = {};
        mappings.forEach(mapping => {
            fieldTypeCounts[mapping.fieldType] = (fieldTypeCounts[mapping.fieldType] || 0) + 1;
        });
        
        console.log(`\n📊 MAPPING SUMMARY:`);
        Object.entries(fieldTypeCounts).forEach(([type, count]) => {
            console.log(`   ${type}: ${count} fields`);
        });
        
        console.log(`\n✅ Employment Issues field mapping generation complete!`);
        
    } catch (error) {
        console.error(`❌ Error: ${error.message}`);
        process.exit(1);
    }
}

function determineFieldType(pdfFieldName) {
    if (pdfFieldName.includes('RadioButtonList')) return 'radio';
    if (pdfFieldName.includes('TextField11')) return 'text';
    if (pdfFieldName.includes('p3-t68')) return 'text';
    if (pdfFieldName.includes('School6_State')) return 'dropdown';
    if (pdfFieldName.includes('DropDownList2')) return 'dropdown';
    if (pdfFieldName.includes('From_Datefield_Name_2')) return 'date';
    if (pdfFieldName.includes('#field')) return 'checkbox';
    return 'unknown';
}

function generateFieldDescription(pdfFieldName, value, label) {
    if (pdfFieldName.includes('RadioButtonList')) {
        return `Employment issues question - ${value || label || 'Main question'}`;
    }
    if (pdfFieldName.includes('p3-t68')) {
        if (pdfFieldName.includes('[0]') || pdfFieldName.includes('[2]') || pdfFieldName.includes('[4]') || pdfFieldName.includes('[6]')) {
            return 'Position title for employment issue';
        }
        return 'Agency/Company name for employment issue';
    }
    if (pdfFieldName.includes('TextField11')) {
        if (pdfFieldName.includes('street') || value === 'street1' || value === 'street2' || value === 'street3' || value === 'street4') {
            return 'Street address for employment issue';
        }
        if (pdfFieldName.includes('city') || value === 'city1' || value === 'city2' || value === 'city3' || value === 'city4') {
            return 'City for employment issue';
        }
        if (pdfFieldName.includes('zip') || value === 'zip1' || value === 'zip2' || value === 'zip3' || value === 'zip4') {
            return 'ZIP code for employment issue';
        }
        return 'Text field for employment issue';
    }
    if (pdfFieldName.includes('School6_State')) return 'State selection for employment issue';
    if (pdfFieldName.includes('DropDownList2')) return 'Country selection for employment issue';
    if (pdfFieldName.includes('From_Datefield_Name_2')) {
        if (pdfFieldName.includes('fromDate') || value === 'fromDate1' || value === 'fromDate2' || value === 'fromDate3' || value === 'fromDate4') {
            return 'Employment issue start date';
        }
        return 'Employment issue end date';
    }
    if (pdfFieldName.includes('#field')) {
        if (label === 'Present') return 'Employment issue current status';
        return 'Employment issue status field';
    }
    return 'Employment issue field';
}

function generateTypeScriptMappings(mappings) {
    const mappingEntries = mappings.map(mapping => 
        `  '${mapping.logicalPath}': '${mapping.pdfField}'`
    ).join(',\n');
    
    return `// Employment Issues (13A.5) Field Mappings
// Generated automatically - do not edit manually
// Total fields: ${mappings.length}

export const EMPLOYMENT_ISSUES_MAPPINGS = {
${mappingEntries}
} as const;

// Field type summary:
${mappings.reduce((acc, mapping) => {
    acc[mapping.fieldType] = (acc[mapping.fieldType] || 0) + 1;
    return acc;
}, {})}
`;
}

if (require.main === module) {
    main();
}
