# Section 16 Field Mapping Fix

## Problem Summary

Users were experiencing "Field not found in section 16" errors when adding foreign government activities and foreign business activities to the SF-86 form. The issue was caused by incorrect field path references in the factory functions that create entries for section 16.

## Root Cause Analysis

After investigating the code and JSON mappings, we identified two main issues:

1. **Issue with `createDefaultForeignGovernmentActivityEntry`**:
   - The `contactEmail` field was incorrectly referencing `form1[0].Section16_3[0].TextField11[33]`
   - The issue is that `TextField11` only goes up to index `[32]` in `section-16.json`

2. **Issue with `createDefaultForeignBusinessActivityEntry` and other functions**:
   - Multiple fields were incorrectly referencing `form1[0].Section16_2[0]` which doesn't exist
   - In the `section-16.json` file, only `Section16_1` and `Section16_3` are defined

We also discovered that the `createFieldFromReference` function used to map JSON fields creates fallback fields with default values when references aren't found. This explains why the code would compile but then cause runtime errors when trying to actually use these fields.

## Field Structure in section-16.json

Upon analysis, we confirmed:
- Section 16 has 154 total fields:
  - 46 fields in `Section16_1`
  - 108 fields in `Section16_3`
- `Section16_2` **does not exist** in the source JSON

## Fixes Implemented

1. Fixed the `contactEmail` field in `createDefaultForeignGovernmentActivityEntry` to use `TextField11[3]` instead of `TextField11[33]`.

2. Rewrote all factory functions in `section16.ts` to ensure they correctly reference fields that exist in either `Section16_1` or `Section16_3`:
   - `createDefaultForeignGovernmentActivityEntry`
   - `createDefaultForeignBusinessActivityEntry` 
   - `createDefaultForeignOrganizationEntry`
   - `createDefaultForeignPropertyEntry`
   - `createDefaultForeignBusinessTravelEntry`
   - `createDefaultForeignConferenceEntry`
   - `createDefaultForeignGovernmentContactEntry`

3. Created a validation test script (`test-section16-field-mappings.js`) that:
   - Confirms section 16 contains exactly 154 fields
   - Verifies `Section16_2` doesn't exist
   - Validates that all field references in the code actually exist in the JSON
   - Reports field counts by section (46 in `Section16_1`, 108 in `Section16_3`)

## Validation

The test script confirms that all field references now correctly map to existing fields in the section-16.json file. The "Field not found in section 16" errors should no longer occur when users add foreign activities to the form.

## Impact

This fix resolves a critical issue that was preventing users from properly adding and saving foreign government activities and foreign business activities in the SF-86 form. The form's data integrity is now maintained, ensuring proper PDF generation and submission. 