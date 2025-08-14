# Section 13 Field Mapping Implementation Guide

## 🎯 Goal: Achieve 100% Field Mapping Coverage

This guide provides a systematic approach to ensure every UI field in Section 13 correctly maps to its corresponding PDF field.

## 📋 Prerequisites

1. Development environment running (`npm run dev`)
2. Access to the PDF template (`public/clean.pdf`)
3. Section 13 reference data (`api/sections-references/section-13.json`)
4. Visual Field Mapping Tool available

## 🔄 Workflow Process

### Step 1: Audit Current Coverage

```bash
# Run the field mapping test
npm run test tests/section13/field-mapping-validation.spec.ts

# Check current coverage in the UI
1. Navigate to http://localhost:5173/tools/field-mapping
2. Select Page 17
3. Click "Run Validation"
4. Note the coverage percentage and unmapped fields
```

### Step 2: Identify Unmapped Fields

Use the Visual Field Mapping Tool to identify gaps:

1. **Enable "Show unmapped only"** checkbox
2. **Document each unmapped field**:
   - UI field path that should exist
   - PDF field name from validation
   - Field type (text, checkbox, date, etc.)

### Step 3: Add Missing Field Mappings

For each unmapped field, add to `section13-field-mapping-enhanced.ts`:

```typescript
// Example: Adding a missing employment status field
{
  uiPath: 'section13.militaryEmployment.entries[{index}].employmentStatus',
  pdfFieldName: 'form1[0].section_13_1-2[0].#field[{33 + index * 10}]',
  fieldType: 'dropdown',
  page: 17,
  dynamicIndex: true,
  validation: { required: true }
}
```

### Step 4: Update UI Components

Ensure the UI has corresponding input fields:

```tsx
// In Section13Component.tsx, add missing fields:
<select
  value={entry.employmentStatus?.value || ''}
  onChange={(e) => handleEmploymentEntryFieldChange(
    'militaryEmployment', 
    entry._id, 
    'employmentStatus', 
    e.target.value
  )}
  className="w-full px-3 py-2 border border-gray-300 rounded-md"
>
  <option value="">Select Status</option>
  <option value="Full-time">Full-time</option>
  <option value="Part-time">Part-time</option>
</select>
```

### Step 5: Validate Mappings

After adding mappings:

1. **Fill out the form** with test data
2. **Click "Validate Inputs"** button
3. **Check validation results**:
   - All expected values should be found
   - Empty fields count should be minimal
   - Coverage should increase

### Step 6: Test with Playwright

Run automated tests to ensure mappings work:

```bash
# Run specific page test
npx playwright test field-mapping-validation.spec.ts --grep "Page 17"

# Run with UI mode for debugging
npx playwright test --ui
```

## 📊 Page-by-Page Checklist

### Page 17 - Employment Overview
- [ ] Main employment questions (hasEmployment, hasGaps)
- [ ] Gap explanation text field
- [ ] Employment type selection
- [ ] Entry 0 fields for each employment type
- [ ] Entry 1-3 fields (dynamic mapping)

### Page 18 - Military Employment Details
- [ ] Duty station information
- [ ] APO/FPO addresses
- [ ] Physical location fields
- [ ] Supervisor contact information

### Page 19-20 - Non-Federal Employment
- [ ] Employer information
- [ ] Multiple employment periods
- [ ] Supervisor details
- [ ] Physical work address

### Page 21-22 - Self-Employment
- [ ] Business information
- [ ] Business address
- [ ] Verifier information
- [ ] Phone contacts

### Page 23-24 - Unemployment
- [ ] Unemployment periods
- [ ] Reference information
- [ ] Reason for unemployment

### Page 25-33 - Additional Sections
- [ ] Federal employment info (13A.5)
- [ ] Employment record issues
- [ ] Disciplinary actions (13A.6)
- [ ] Additional entries

## 🛠️ Troubleshooting

### Common Issues

1. **Field Not Appearing in PDF**
   - Check if PDF field name is correct
   - Verify field exists on the specified page
   - Ensure value transformation is correct

2. **Value Format Mismatch**
   - Dates: Ensure MM/YYYY format
   - Checkboxes: Return boolean values
   - Radio buttons: Match exact option values

3. **Dynamic Entry Issues**
   - Verify index replacement in field names
   - Check arithmetic expressions in mappings
   - Ensure UI creates entries with correct IDs

### Debug Mode

Enable debug logging:

```typescript
// In section13.tsx
const isDebugMode = true; // or add ?debug=true to URL

// In validation
console.log('Expected values:', expectedValues);
console.log('PDF fields found:', validationResult.pageResult.fields);
```

## 📈 Success Metrics

### Target Coverage by Page
- Page 17: 95%+ (some optional fields)
- Pages 18-24: 90%+ (employment details)
- Pages 25-33: 85%+ (additional sections)

### Validation Criteria
- ✅ All required fields have values
- ✅ Date formats are correct (MM/YYYY)
- ✅ Checkboxes properly set
- ✅ No validation errors
- ✅ Expected values match PDF content

## 🚀 Next Steps

1. **Complete Page 17** to 100% coverage
2. **Move to Page 18** only after Page 17 is complete
3. **Document any new patterns** discovered
4. **Update test suite** for each completed page
5. **Run full validation** after each page

## 📝 Notes

- Keep the enhanced field mapping file as the source of truth
- Update this guide with any new patterns or issues discovered
- Coordinate with team on field naming conventions
- Regular commits after each page completion

Remember: **Quality over speed** - ensure each page is 100% mapped before moving to the next!