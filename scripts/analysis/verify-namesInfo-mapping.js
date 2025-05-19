import fs from 'fs';

// Load NamesInfo context
function loadNamesInfoContext() {
  try {
    const contextPath = 'app/state/contexts/sections/namesInfo.tsx';
    const content = fs.readFileSync(contextPath, 'utf8');
    console.log(`Successfully loaded ${contextPath}`);
    return content;
  } catch (error) {
    console.error('Error loading NamesInfo context:', error);
    return null;
  }
}

// Load section 5 fields
function loadSection5Fields() {
  try {
    const fieldsPath = 'scripts/analysis/section5-fields.json';
    const content = fs.readFileSync(fieldsPath, 'utf8');
    console.log(`Successfully loaded ${fieldsPath}`);
    return JSON.parse(content);
  } catch (error) {
    console.error('Error loading section 5 fields:', error);
    return null;
  }
}

// Extract field IDs from context
function extractIdsFromContext(contextContent) {
  const idRegex = /id:\s*['"]([\w\d]+)['"]/g;
  const matches = [...contextContent.matchAll(idRegex)];
  return matches.map(match => match[1]);
}

// Verify field IDs in context against section 5 fields
function verifyFieldIds(contextIds, section5Fields) {
  // Get all IDs from section 5 fields (remove "0 R" suffix)
  const section5Ids = section5Fields.map(field => field.id.replace(' 0 R', ''));
  
  // Check which context IDs are present in section 5
  const matchedIds = contextIds.filter(id => section5Ids.includes(id));
  const unmatchedIds = contextIds.filter(id => !section5Ids.includes(id));
  
  // Check which section 5 IDs are not in context
  const missingIds = section5Ids.filter(id => !contextIds.includes(id));
  
  return {
    total: {
      context: contextIds.length,
      section5: section5Ids.length
    },
    matched: {
      count: matchedIds.length,
      ids: matchedIds
    },
    unmatched: {
      count: unmatchedIds.length,
      ids: unmatchedIds
    },
    missing: {
      count: missingIds.length,
      ids: missingIds
    }
  };
}

// Verify hasNames field implementation
function verifyHasNamesField(contextContent, section5Fields) {
  // Check if hasNames is declared in the context
  const hasNamesRegex = /hasNames:\s*{\s*value:\s*['"]([^'"]+)['"]/;
  const hasNamesMatch = contextContent.match(hasNamesRegex);
  
  // Check if hasNames field ID is correct
  const hasNamesIdRegex = /hasNames:\s*{[^}]*id:\s*['"]([\w\d]+)['"]/s;
  const hasNamesIdMatch = contextContent.match(hasNamesIdRegex);
  
  // Find the corresponding field in section 5
  const radioButtonFields = section5Fields.filter(
    field => field.type === 'PDFRadioGroup'
  );
  
  return {
    isDeclared: !!hasNamesMatch,
    defaultValue: hasNamesMatch ? hasNamesMatch[1] : null,
    fieldId: hasNamesIdMatch ? hasNamesIdMatch[1] : null,
    expectedFieldIds: radioButtonFields.map(field => field.id.replace(' 0 R', '')),
    isIdCorrect: radioButtonFields.some(
      field => field.id.replace(' 0 R', '') === (hasNamesIdMatch ? hasNamesIdMatch[1] : null)
    )
  };
}

// Verify dynamic entries structure
function verifyDynamicEntriesStructure(contextContent) {
  // Check if names array is declared
  const namesArrayRegex = /names:\s*\[/;
  const namesArrayMatch = contextContent.match(namesArrayRegex);
  
  // Count number of entries (_id: X)
  const entryIdRegex = /_id:\s*(\d+)/g;
  const entryIdMatches = [...contextContent.matchAll(entryIdRegex)];
  const entryIds = entryIdMatches.map(match => parseInt(match[1]));
  
  // Check if entries have consistent structure
  const entryFieldsRegex = /{(?:\s*_id:\s*\d+,\s*([^}]*))}/gs;
  const entryMatches = [...contextContent.matchAll(entryFieldsRegex)];
  
  // Extract field names from first entry
  let firstEntryFields = [];
  if (entryMatches.length > 0) {
    const firstEntry = entryMatches[0][1];
    const fieldRegex = /(\w+):\s*{/g;
    const fieldMatches = [...firstEntry.matchAll(fieldRegex)];
    firstEntryFields = fieldMatches.map(match => match[1]);
  }
  
  // Check if all entries have the same fields
  const allEntriesHaveConsistentStructure = entryMatches.every(match => {
    const entryContent = match[1];
    return firstEntryFields.every(field => {
      const fieldRegex = new RegExp(`${field}:\\s*{`, 'g');
      return fieldRegex.test(entryContent);
    });
  });
  
  return {
    hasNamesArray: !!namesArrayMatch,
    entryCount: entryIds.length,
    entryIds,
    fieldsPerEntry: firstEntryFields,
    hasConsistentStructure: allEntriesHaveConsistentStructure
  };
}

// Main execution
try {
  console.log("Verifying NamesInfo context mapping...");
  
  // Load data
  const contextContent = loadNamesInfoContext();
  const section5Fields = loadSection5Fields();
  
  if (!contextContent || !section5Fields) {
    console.error("Failed to load required data");
    process.exit(1);
  }
  
  // Extract field IDs from context
  const contextIds = extractIdsFromContext(contextContent);
  console.log(`Found ${contextIds.length} field IDs in context`);
  
  // Verify field IDs
  console.log("\nVerifying field IDs...");
  const fieldIdVerification = verifyFieldIds(contextIds, section5Fields);
  console.log(`Total IDs - Context: ${fieldIdVerification.total.context}, Section 5: ${fieldIdVerification.total.section5}`);
  console.log(`Matched IDs: ${fieldIdVerification.matched.count}`);
  
  if (fieldIdVerification.unmatched.count > 0) {
    console.log(`WARNING: ${fieldIdVerification.unmatched.count} context IDs not found in section 5:`);
    console.log(fieldIdVerification.unmatched.ids);
  }
  
  if (fieldIdVerification.missing.count > 0) {
    console.log(`WARNING: ${fieldIdVerification.missing.count} section 5 IDs missing from context:`);
    console.log(fieldIdVerification.missing.ids);
  }
  
  // Verify hasNames field
  console.log("\nVerifying hasNames field...");
  const hasNamesVerification = verifyHasNamesField(contextContent, section5Fields);
  console.log(`hasNames declared: ${hasNamesVerification.isDeclared}`);
  console.log(`hasNames default value: ${hasNamesVerification.defaultValue}`);
  console.log(`hasNames field ID: ${hasNamesVerification.fieldId}`);
  console.log(`Expected field ID(s): ${hasNamesVerification.expectedFieldIds.join(', ')}`);
  console.log(`Field ID is correct: ${hasNamesVerification.isIdCorrect}`);
  
  // Verify dynamic entries structure
  console.log("\nVerifying dynamic entries structure...");
  const dynamicStructureVerification = verifyDynamicEntriesStructure(contextContent);
  console.log(`Names array declared: ${dynamicStructureVerification.hasNamesArray}`);
  console.log(`Number of entries: ${dynamicStructureVerification.entryCount}`);
  console.log(`Entry IDs: ${dynamicStructureVerification.entryIds.join(', ')}`);
  console.log(`Fields per entry: ${dynamicStructureVerification.fieldsPerEntry.length}`);
  console.log(`Entry field names: ${dynamicStructureVerification.fieldsPerEntry.join(', ')}`);
  console.log(`Entries have consistent structure: ${dynamicStructureVerification.hasConsistentStructure}`);
  
  // Final assessment
  console.log("\nFinal assessment:");
  if (
    fieldIdVerification.matched.count > 0 &&
    fieldIdVerification.missing.count === 0 &&
    hasNamesVerification.isDeclared &&
    hasNamesVerification.isIdCorrect &&
    dynamicStructureVerification.hasNamesArray &&
    dynamicStructureVerification.entryCount >= 1 &&
    dynamicStructureVerification.hasConsistentStructure
  ) {
    console.log("✅ SUCCESS: NamesInfo context is correctly mapped to section 5 and supports dynamic entries!");
  } else {
    console.log("⚠️ WARNING: NamesInfo context mapping has some issues that should be addressed.");
    
    // List specific issues
    if (fieldIdVerification.missing.count > 0) {
      console.log(`  - ${fieldIdVerification.missing.count} section 5 field IDs are missing from context`);
    }
    if (!hasNamesVerification.isDeclared) {
      console.log("  - hasNames field is not properly declared in context");
    }
    if (!hasNamesVerification.isIdCorrect) {
      console.log("  - hasNames field ID does not match any PDFRadioGroup in section 5");
    }
    if (!dynamicStructureVerification.hasNamesArray) {
      console.log("  - names array is not properly declared in context");
    }
    if (dynamicStructureVerification.entryCount < 1) {
      console.log("  - context does not contain any name entries");
    }
    if (!dynamicStructureVerification.hasConsistentStructure) {
      console.log("  - name entries do not have a consistent structure");
    }
  }
  
  // Save verification results
  const resultData = {
    fieldIdVerification,
    hasNamesVerification,
    dynamicStructureVerification,
    timestamp: new Date().toISOString()
  };
  
  fs.writeFileSync('scripts/analysis/namesInfo-verification.json', JSON.stringify(resultData, null, 2));
  console.log("\nVerification results saved to scripts/analysis/namesInfo-verification.json");
  
} catch (error) {
  console.error("Error during verification:", error);
} 