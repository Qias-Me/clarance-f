# Section 28 & Section 30 Manual Testing Guide

## 🎯 **TESTING OBJECTIVES**

This guide provides step-by-step instructions to manually test the fixes for Section 28 and Section 30 data persistence issues.

## 🚨 **BUGS THAT WERE FIXED**

### **Bug 1: Section 28 Field Mapping Errors**
- **Problem**: `Field not found in section 28: #field[12]` errors
- **Root Cause**: Duplicate `estimatedDate` field in interface
- **Fix**: Removed duplicate field, updated entry creation functions

### **Bug 2: Section 30 Date Formatting Issues**  
- **Problem**: Field "16262" receiving "2025-06-27" (10 chars) but maxLength=5
- **Root Cause**: Dates sent in YYYY-MM-DD format instead of MM/DD
- **Fix**: Enhanced date formatter with maxLength support

### **Bug 3: Test Data Population Not Working**
- **Problem**: `populateTestData` was just a placeholder
- **Root Cause**: No actual test data implementation
- **Fix**: Implemented comprehensive test data for both sections

## 📋 **MANUAL TESTING STEPS**

### **Step 1: Navigate to Form**
1. Open browser to `http://localhost:5173/startForm`
2. Wait for form to load completely
3. Verify you see the "🧪 Populate Test Data" button

### **Step 2: Test Data Population**
1. **Click**: "🧪 Populate Test Data" button
2. **Open**: Browser console (F12)
3. **Verify Console Output**:
   ```
   🧪 Starting comprehensive test data population...
   📝 Populating Section 1...
   📝 Populating Section 2...
   📝 Populating Section 3...
   📝 Populating Section 28 (Court Actions)...
   ✅ Section 28 test data populated successfully
   📝 Populating Section 30 (Continuation Sheets)...
   ✅ Section 30 test data populated successfully
   🔧 Section 30 dates formatted as MM/DD/YYYY to prevent field length errors
   ✅ Test data populated successfully!
   📊 Registered sections: [list should include section28, section30]
   ```

### **Step 3: Test Section 28 Field Mapping**
1. **After** populating test data
2. **Click**: "🖥️ Generate PDF (Server)" button
3. **Check Terminal/Console** for:
   - ✅ **NO** `Field not found in section 28: #field[12]` errors
   - ✅ Section 28 court action fields being processed
   - ✅ Field IDs like those for court name, nature of action, etc.

### **Step 4: Test Section 30 Date Formatting**
1. **After** populating test data
2. **Click**: "🖥️ Generate PDF (Server)" button  
3. **Check Terminal/Console** for:
   - ✅ **NO** `maxLength=5` truncation errors for field "16262"
   - ✅ Dates formatted as MM/DD/YYYY or MM/DD
   - ✅ ZIP codes (like "90210") in field "16262", not dates

### **Step 5: Verify PDF Generation Integration**
1. **After** populating test data
2. **Click**: "🖥️ Generate PDF (Server)" button
3. **Check Terminal** for:
   - ✅ Section 28 data being processed
   - ✅ Section 30 data being processed
   - ✅ Higher field count (should increase from ~85 to ~649 fields)
   - ✅ PDF generation success message

## 🔍 **EXPECTED RESULTS**

### **✅ BEFORE FIXES (BROKEN BEHAVIOR)**
```
❌ Field not found in section 28: #field[12]
❌ Field "16262" value "2025-06-27" (10 chars) exceeds maxLength=5
❌ Test data populated successfully! (but no actual data)
❌ Section 28 and Section 30 missing from PDF generation logs
```

### **✅ AFTER FIXES (WORKING BEHAVIOR)**
```
✅ Section 28 test data populated successfully
✅ Section 30 test data populated successfully  
✅ Section 28 court action fields processed correctly
✅ Section 30 dates formatted as MM/DD/YYYY
✅ Field "16262" receives ZIP code "90210", not dates
✅ PDF generation includes both Section 28 and Section 30 data
✅ Field count increases from ~85 to ~649 after test data population
```

## 🚨 **TROUBLESHOOTING**

### **If Section 28 Errors Still Occur:**
1. Check `api/interfaces/sections2.0/section28.ts` for duplicate `estimatedDate` field
2. Verify `createDefaultCourtActionEntry` uses proper field IDs
3. Check console for field mapping errors

### **If Section 30 Date Issues Persist:**
1. Verify `SECTION30_FIELD_TRANSFORMERS.formatDate` is being used
2. Check that dates are formatted as MM/DD for 5-character fields
3. Look for maxLength validation errors in console

### **If Test Data Population Fails:**
1. Check `app/utils/testDataPopulator.ts` implementation
2. Verify SF86FormContext has registered sections
3. Check console for context registration errors

## 📊 **SUCCESS METRICS**

- ✅ **0** Section 28 field mapping errors
- ✅ **0** Section 30 date truncation errors  
- ✅ **2** sections (28, 30) appearing in PDF generation logs
- ✅ **~649** total fields after test data population
- ✅ **100%** test data population success rate

## 🎉 **COMPLETION CRITERIA**

The fixes are successful when:
1. Test data populates without errors
2. Section 28 court actions appear in PDF generation
3. Section 30 continuation sheets appear in PDF generation
4. No field mapping or date formatting errors occur
5. Field count increases significantly after test data population

---

**Note**: If any of these tests fail, check the console/terminal logs for specific error messages and refer to the troubleshooting section above.
