#!/usr/bin/env node

import fs from 'fs';
import path from 'path';

console.log("🔍 Extracting unclassified fields from categorized-fields.json...");

// Function to analyze fields and extract unclassified ones
function extractUnknownFields(inputFile, outputFile) {
  try {
    // Read the categorized fields
    console.log(`📖 Reading: ${inputFile}`);
    const data = fs.readFileSync(inputFile, 'utf8');
    const fields = JSON.parse(data);

    console.log(`📊 Total fields: ${fields.length}`);

    // Find unclassified fields (section 0 or undefined/null section)
    const unknownFields = fields.filter(field => {
      const section = field.section;
      return section === 0 || section === null || section === undefined;
    });

    console.log(`🔍 Found ${unknownFields.length} unclassified fields`);

    // Create detailed analysis of unknown fields
    const analysis = {
      summary: {
        totalFields: fields.length,
        unknownFields: unknownFields.length,
        percentage: ((unknownFields.length / fields.length) * 100).toFixed(2),
        extractedAt: new Date().toISOString()
      },
      fields: unknownFields.map(field => ({
        name: field.name,
        value: field.value,
        label: field.label,
        page: field.page,
        section: field.section,
        confidence: field.confidence,
        isExplicitlyDetected: field.isExplicitlyDetected,
        wasMovedByHealing: field.wasMovedByHealing,
        // Add analysis of why it might be unclassified
        analysis: analyzeUnknownField(field)
      }))
    };

    // Write to output file
    console.log(`💾 Writing unknown fields to: ${outputFile}`);
    fs.writeFileSync(outputFile, JSON.stringify(analysis, null, 2));

    // Also create a simple list for easy viewing
    const simpleList = unknownFields.map(field => field.name).sort();
    const simpleListFile = outputFile.replace('.json', '-simple.txt');
    fs.writeFileSync(simpleListFile, simpleList.join('\n'));

    console.log(`✅ Analysis complete!`);
    console.log(`   📄 Detailed analysis: ${outputFile}`);
    console.log(`   📄 Simple list: ${simpleListFile}`);
    console.log(`   📊 ${unknownFields.length} unclassified fields (${analysis.summary.percentage}%)`);

    // Show some examples
    if (unknownFields.length > 0) {
      console.log(`\n📋 Examples of unclassified fields:`);
      unknownFields.slice(0, 10).forEach((field, index) => {
        console.log(`   ${index + 1}. ${field.name} (page: ${field.page || 'unknown'})`);
        if (field.value) {
          console.log(`      Value: "${field.value}"`);
        }
        if (field.label) {
          console.log(`      Label: "${field.label}"`);
        }
      });

      if (unknownFields.length > 10) {
        console.log(`   ... and ${unknownFields.length - 10} more`);
      }
    }

    return analysis;

  } catch (error) {
    console.error("❌ Error:", error.message);
    throw error;
  }
}

// Function to analyze why a field might be unclassified
function analyzeUnknownField(field) {
  const analysis = {
    patterns: [],
    possibleReasons: [],
    suggestions: []
  };

  const fieldName = field.name || "";
  const fieldValue = field.value || "";
  const fieldLabel = field.label || "";

  // Check for common patterns
  if (fieldName.includes('#subform')) {
    analysis.patterns.push('#subform field');
    analysis.possibleReasons.push('Enhanced #subform categorization may not be running');
  }

  if (fieldName.includes('Section')) {
    const sectionMatch = fieldName.match(/Section(\d+)/i);
    if (sectionMatch) {
      analysis.patterns.push(`Section ${sectionMatch[1]} reference`);
      analysis.possibleReasons.push('Explicit section detection may have failed');
    }
  }

  if (fieldName.includes('TextField') || fieldName.includes('CheckBox') || fieldName.includes('DropDownList')) {
    analysis.patterns.push('Standard form field');
    analysis.possibleReasons.push('Pattern matching may not cover this field type');
  }

  if (!field.page || field.page === 0) {
    analysis.possibleReasons.push('No page information available for page-based categorization');
  }

  // Check for potential section keywords in value/label
  const combinedText = `${fieldValue} ${fieldLabel}`.toLowerCase();
  const keywordMatches = [];

  if (/\b(name|first|last|middle)\b/.test(combinedText)) keywordMatches.push('Section 1 (Name)');
  if (/\b(birth|dob)\b/.test(combinedText)) keywordMatches.push('Section 2/3 (Birth)');
  if (/\b(ssn|social security)\b/.test(combinedText)) keywordMatches.push('Section 4 (SSN)');
  if (/\b(address|residence|lived)\b/.test(combinedText)) keywordMatches.push('Section 11 (Residence)');
  if (/\b(school|education|college)\b/.test(combinedText)) keywordMatches.push('Section 12 (Education)');
  if (/\b(employment|employer|job|work)\b/.test(combinedText)) keywordMatches.push('Section 13 (Employment)');
  if (/\b(relative|family|father|mother)\b/.test(combinedText)) keywordMatches.push('Section 18 (Relatives)');

  if (keywordMatches.length > 0) {
    analysis.suggestions = keywordMatches;
  }

  return analysis;
}

// Main execution - use the latest test results
const inputFile = 'output/test45/categorized-fields.json';
const outputFile = 'unknown.json';

if (!fs.existsSync(inputFile)) {
  console.error(`❌ Input file not found: ${inputFile}`);
  console.log('Available test directories:');
  const outputDir = 'output';
  if (fs.existsSync(outputDir)) {
    const dirs = fs.readdirSync(outputDir).filter(item =>
      fs.statSync(path.join(outputDir, item)).isDirectory()
    );
    dirs.forEach(dir => {
      const fieldsFile = path.join(outputDir, dir, 'categorized-fields.json');
      if (fs.existsSync(fieldsFile)) {
        console.log(`   ✅ ${fieldsFile}`);
      }
    });
  }
  process.exit(1);
}

try {
  const analysis = extractUnknownFields(inputFile, outputFile);
  console.log("\n🎯 Extraction completed successfully!");
} catch (error) {
  console.error("❌ Failed to extract unknown fields:", error.message);
  process.exit(1);
}
