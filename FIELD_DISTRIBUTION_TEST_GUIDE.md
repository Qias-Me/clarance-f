# Field Distribution Test Guide

This guide explains how to test and validate the capacity-aware field categorization improvements for the SF-86 form sectionizer.

## Overview

The improvements implement page-based categorization logic specifically for `form1[0].#subform` fields to achieve exact field count alignment. The goal is to reduce over-allocation in sections 11, 12, 18, and especially section 20 while maintaining the total field count of 6,197.

## Expected Improvements

### Before (Current Issue)
- **Total fields**: 6,197 ✅ (correct)
- **Expected total across all sections**: 5,523
- **Over-allocation**: +674 fields distributed as:
  - Section 11: +70 over expected (expected: 252)
  - Section 12: +22 over expected (expected: 150)
  - Section 18: +1 over expected (expected: 964)
  - Section 20: +581 over expected (expected: 83)

### After (Target Results)
- **Total fields**: 6,197 ✅ (maintained)
- **Reduced over-allocation** in target sections:
  - Section 11: < +70 over expected
  - Section 12: < +22 over expected
  - Section 18: < +1 over expected
  - Section 20: < +581 over expected

## How to Run Tests

### Option 1: Quick Test (Recommended)
```bash
node test-field-distribution.js
```

### Option 2: Direct Test Script
```bash
npx tsx src/sectionizer/test-field-distribution.ts
```

### Option 3: Manual Testing
```bash
# Run the main sectionizer with logging
npm run sectionize

# Check the output for field distribution statistics
# Look for capacity-aware categorization logs
```

## Test Results Interpretation

### Success Criteria
The test will show **✅ PASS** for each criterion if:

1. **Total field count maintained**: Exactly 6,197 fields
2. **Section 11 improvement**: Over-allocation reduced from +70
3. **Section 12 improvement**: Over-allocation reduced from +22
4. **Section 18 improvement**: Over-allocation reduced from +1
5. **Section 20 improvement**: Over-allocation reduced from +581

### Test Output Sections

#### 📈 Overall Statistics
- Shows total field count and comparison to expected
- Verifies the 6,197 field count is maintained

#### ⚠️ Over-Allocated Sections
- Lists sections with more than 110% of expected fields
- Shows current vs expected counts and percentage over-allocation
- **Target**: Fewer sections in this list, especially 11, 12, 18, 20

#### 📉 Under-Allocated Sections
- Lists sections with less than 90% of expected fields
- Shows redistribution opportunities
- **Expected**: Some sections may become under-allocated as fields are redistributed

#### 🎯 Target Section Improvements
- Specific metrics for the four problem sections
- Shows exact reduction in over-allocation
- **Goal**: All values should be lower than the original over-allocation

## Key Features Being Tested

### 1. Capacity-Aware Page Analysis
- Enhanced confidence scoring for proximity-based matches
- Capacity boosts for under-allocated sections (+0.1 to +0.15)
- Capacity penalties for over-allocated sections (-0.2)

### 2. Intelligent Fallback Logic
- Lower confidence threshold (0.3 → 0.2) for better assignment rates
- Capacity-aware redirection when page-based section is over-allocated
- Smart adjacent section selection based on capacity status

### 3. Real-Time Capacity Tracking
- Dynamic capacity information during field processing
- Over/under-allocation detection with 110%/90% thresholds
- Integration with main categorization loop

### 4. Enhanced #subform Processing
- Page-based categorization using `sectionPageRanges` mapping
- Spatial analysis for field positioning
- Content validation for Section 20 assignments

## Troubleshooting

### Test Fails to Run
```bash
# Install dependencies
npm install

# Ensure TypeScript execution is available
npm install -g tsx
```

### Unexpected Results
1. Check that the SF-86 PDF file exists at the expected path
2. Verify that all imports are correctly resolved
3. Review console logs for capacity-aware categorization messages
4. Check for any error messages during field extraction

### Performance Issues
- The test processes all 6,197 fields with capacity analysis
- Expected runtime: 30-60 seconds depending on system performance
- Large amounts of console logging are normal during testing

## Implementation Details

### Files Modified
- `src/sectionizer/utils/field-clusterer.ts`: Enhanced categorization logic
- `src/sectionizer/engine.ts`: Main engine integration
- `src/sectionizer/test-field-distribution.ts`: Test script
- `test-field-distribution.js`: Test runner

### Key Functions
- `createSectionCapacityInfo()`: Tracks current field distribution
- `categorizeSubformField()`: Enhanced with capacity awareness
- `analyzeSubformByPage()`: Improved confidence scoring
- `combineSubformAnalyses()`: Capacity-aware assignment logic

## Expected Log Messages

During testing, you should see log messages like:
```
🔍 ENHANCED SUBFORM CATEGORIZATION: form1[0].#subform[123].field
📍 PAGE ANALYSIS: Analyzing page 45
🎯 CAPACITY BOOST: Section 15 is under-allocated, boosting confidence to 0.95
⚠️ CAPACITY CHECK: Page-based Section 20 is over-allocated, looking for alternatives
✅ SUBFORM CATEGORIZED: form1[0].#subform[123].field → Section 15 (0.85) - Page 45 falls within Section 15 range (40-50)
```

These messages indicate that the capacity-aware logic is working correctly.
