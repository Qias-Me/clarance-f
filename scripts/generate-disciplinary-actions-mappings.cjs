#!/usr/bin/env node
/**
 * Phase 8: Generate Disciplinary Actions (13A.6) Field Mappings
 * Generate TypeScript field mappings for Disciplinary Actions fields
 */

const fs = require('fs');
const path = require('path');

function generateLogicalFieldName(pdfFieldName, index) {
    // Handle main status fields
    if (pdfFieldName.includes('RadioButtonList[2]')) {
        return 'hasDisciplinaryActions';
    }
    
    // Handle reason fields in area[1]
    if (pdfFieldName.includes('#area[1].#field[24]')) return 'reasonForUnsatisfactory';
    if (pdfFieldName.includes('#area[1].#field[25]')) return 'chargesOrAllegations';
    if (pdfFieldName.includes('#area[1].#field[26]')) return 'reasonForQuitting';
    if (pdfFieldName.includes('#area[1].#field[27]')) return 'reasonForBeingFired';
    
    // Handle date fields for termination
    if (pdfFieldName.includes('From_Datefield_Name_2[2]')) return 'dateFired';
    if (pdfFieldName.includes('From_Datefield_Name_2[3]')) return 'dateQuit';
    if (pdfFieldName.includes('From_Datefield_Name_2[4]')) return 'dateLeftMutual';
    if (pdfFieldName.includes('From_Datefield_Name_2[5]')) return 'dateLeft';
    
    // Handle additional disciplinary fields in area[2]
    if (pdfFieldName.includes('#area[2].#field[36]')) return 'additionalReason2';
    if (pdfFieldName.includes('#area[2].#field[37]')) return 'additionalReason1';
    if (pdfFieldName.includes('#area[2].#field[38]')) return 'additionalStatus';
    if (pdfFieldName.includes('#area[2].From_Datefield_Name_2[6]')) return 'additionalDate1';
    if (pdfFieldName.includes('#area[2].From_Datefield_Name_2[7]')) return 'additionalDate2';
    if (pdfFieldName.includes('#area[2].#field[41]')) return 'additionalField1';
    
    // Handle other disciplinary fields
    if (pdfFieldName.includes('#field[28]')) return 'dateEstimated';
    if (pdfFieldName.includes('#field[31]')) return 'mutualDateEstimated';
    if (pdfFieldName.includes('#field[33]')) return 'leftDateEstimated';
    if (pdfFieldName.includes('#field[35]')) return 'leftDatePresent';
    if (pdfFieldName.includes('#field[42]')) return 'additionalReason4';
    if (pdfFieldName.includes('#field[43]')) return 'additionalReason3';
    if (pdfFieldName.includes('#field[44]')) return 'additionalField2';
    if (pdfFieldName.includes('From_Datefield_Name_2[8]')) return 'additionalDate3';
    if (pdfFieldName.includes('From_Datefield_Name_2[9]')) return 'additionalDate4';
    if (pdfFieldName.includes('#field[47]')) return 'additionalField3';
    
    // Handle area[0] fields
    if (pdfFieldName.includes('#area[0].#field[20]')) return 'incidentType1';
    if (pdfFieldName.includes('#area[0].#field[21]')) return 'incidentType2';
    if (pdfFieldName.includes('#area[0].#field[22]')) return 'incidentType3';
    if (pdfFieldName.includes('#area[0].#field[23]')) return 'incidentType4';
    
    // Fallback to generic field naming based on patterns
    const areaMatch = pdfFieldName.match(/#area\[(\d+)\]/);
    const fieldMatch = pdfFieldName.match(/#field\[(\d+)\]/);
    const dateMatch = pdfFieldName.match(/From_Datefield_Name_2\[(\d+)\]/);
    const radioMatch = pdfFieldName.match(/RadioButtonList\[(\d+)\]/);
    const sectionMatch = pdfFieldName.match(/section13_4\[(\d+)\]/);
    
    if (areaMatch && fieldMatch) {
        return `area${areaMatch[1]}Field${fieldMatch[1]}`;
    }
    
    if (dateMatch) {
        return `dateField${dateMatch[1]}`;
    }
    
    if (radioMatch) {
        return `radioField${radioMatch[1]}`;
    }
    
    if (fieldMatch) {
        return `field${fieldMatch[1]}`;
    }
    
    if (sectionMatch) {
        return `section${sectionMatch[1]}Field${index}`;
    }
    
    return `disciplinaryField${index}`;
}

function main() {
    console.log('🔧 GENERATING DISCIPLINARY ACTIONS (13A.6) FIELD MAPPINGS');
    console.log('='.repeat(60));
    
    try {
        // Read the extracted field data
        const fieldsPath = path.join(__dirname, 'disciplinary-actions-fields.json');
        const fieldsData = JSON.parse(fs.readFileSync(fieldsPath, 'utf8'));
        
        console.log(`📊 Processing ${fieldsData.totalFields} Disciplinary Actions fields`);
        
        // Generate mappings
        const mappings = [];
        const seenLogicalNames = new Set();
        
        fieldsData.fields.forEach((field, index) => {
            const logicalName = generateLogicalFieldName(field.name, index);
            const logicalPath = `section13.disciplinaryActions.entries[0].${logicalName}.value`;
            
            // Handle duplicate logical names by adding suffix
            let finalLogicalName = logicalName;
            let suffix = 1;
            while (seenLogicalNames.has(finalLogicalName)) {
                finalLogicalName = `${logicalName}${suffix}`;
                suffix++;
            }
            seenLogicalNames.add(finalLogicalName);
            
            const finalLogicalPath = `section13.disciplinaryActions.entries[0].${finalLogicalName}.value`;
            
            mappings.push({
                logicalPath: finalLogicalPath,
                pdfField: field.name,
                fieldType: determineFieldType(field.name, field.type),
                description: generateFieldDescription(field.name, field.value, field.label, field.type)
            });
        });
        
        console.log(`✅ Generated ${mappings.length} field mappings`);
        
        // Generate TypeScript mapping code
        const tsCode = generateTypeScriptMappings(mappings);
        
        // Save the mappings
        const outputPath = path.join(__dirname, 'disciplinary-actions-mappings.ts');
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
        
        console.log(`\n✅ Disciplinary Actions field mapping generation complete!`);
        
    } catch (error) {
        console.error(`❌ Error: ${error.message}`);
        process.exit(1);
    }
}

function determineFieldType(pdfFieldName, pdfType) {
    if (pdfFieldName.includes('RadioButtonList')) return 'radio';
    if (pdfFieldName.includes('From_Datefield_Name_2')) return 'date';
    if (pdfFieldName.includes('#field')) {
        if (pdfType === 'PDFCheckBox') return 'checkbox';
        if (pdfType === 'PDFTextField') return 'text';
        return 'field';
    }
    return 'unknown';
}

function generateFieldDescription(pdfFieldName, value, label, type) {
    if (pdfFieldName.includes('RadioButtonList[2]')) {
        return 'Main disciplinary actions question';
    }
    
    if (pdfFieldName.includes('#area[1].#field[24]')) {
        return 'Reason for unsatisfactory performance';
    }
    if (pdfFieldName.includes('#area[1].#field[25]')) {
        return 'Charges or allegations details';
    }
    if (pdfFieldName.includes('#area[1].#field[26]')) {
        return 'Reason for quitting employment';
    }
    if (pdfFieldName.includes('#area[1].#field[27]')) {
        return 'Reason for being fired';
    }
    
    if (pdfFieldName.includes('From_Datefield_Name_2[2]')) {
        return 'Date when fired from employment';
    }
    if (pdfFieldName.includes('From_Datefield_Name_2[3]')) {
        return 'Date when quit employment';
    }
    if (pdfFieldName.includes('From_Datefield_Name_2[4]')) {
        return 'Date left by mutual agreement';
    }
    if (pdfFieldName.includes('From_Datefield_Name_2[5]')) {
        return 'Date left employment';
    }
    
    if (pdfFieldName.includes('#area[2]')) {
        if (pdfFieldName.includes('#field[36]') || pdfFieldName.includes('#field[37]')) {
            return 'Additional disciplinary reason';
        }
        if (pdfFieldName.includes('From_Datefield_Name_2')) {
            return 'Additional disciplinary date';
        }
        return 'Additional disciplinary field';
    }
    
    if (pdfFieldName.includes('#area[0]')) {
        return 'Incident type selection';
    }
    
    if (label) {
        return `Disciplinary field: ${label}`;
    }
    
    if (value && typeof value === 'string' && value.length > 0 && value !== 'true') {
        return `Disciplinary field: ${value}`;
    }
    
    return 'Disciplinary actions field';
}

function generateTypeScriptMappings(mappings) {
    const mappingEntries = mappings.map(mapping => 
        `  '${mapping.logicalPath}': '${mapping.pdfField}'`
    ).join(',\n');
    
    const fieldTypeCounts = mappings.reduce((acc, mapping) => {
        acc[mapping.fieldType] = (acc[mapping.fieldType] || 0) + 1;
        return acc;
    }, {});
    
    return `// Disciplinary Actions (13A.6) Field Mappings
// Generated automatically - do not edit manually
// Total fields: ${mappings.length}

export const DISCIPLINARY_ACTIONS_MAPPINGS = {
${mappingEntries}
} as const;

// Field type summary:
// ${Object.entries(fieldTypeCounts).map(([type, count]) => `${type}: ${count}`).join(', ')}
`;
}

if (require.main === module) {
    main();
}
