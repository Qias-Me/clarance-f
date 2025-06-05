# Section 17_2 Complete Field Mapping - Former Spouse

Based on systematic analysis of `api/sections-references/section-17.json` using field labels and values.

## **Section17_2 Field Categories (~60 fields)**

### **1. Former Spouse Main Name Fields (Section17_2[0])**
- `form1[0].Section17_2[0].TextField11[1]` - **"Last name"** (Label: "17.2 Complete the following if you selected divorced/dissolved, annulled, or widowed...Last name")
- `form1[0].Section17_2[0].TextField11[2]` - **"First name"**
- `form1[0].Section17_2[0].TextField11[0]` - **"Middle name"**  
- `form1[0].Section17_2[0].suffix[0]` - **"Suffix"**

### **2. Former Spouse Personal Information**
- `form1[0].Section17_2[0].From_Datefield_Name_2[0]` - **"Provide the date of birth. (Month/Day/Year)"**
- `form1[0].Section17_2[0].#field[9]` - **"Estimate"** (birth date estimate)
- **NO SSN FIELD EXISTS** (Confirmed: Former spouses do not have SSN fields in the PDF)

### **3. Former Spouse Place of Birth**
- `form1[0].Section17_2[0].#area[4].TextField11[3]` - **"Provide the place of birth. City"**
- `form1[0].Section17_2[0].#area[4].School6_State[0]` - **"State"**
- `form1[0].Section17_2[0].#area[4].DropDownList15[0]` - **"Country"**
- `form1[0].Section17_2[0].#area[4].TextField11[4]` - **Additional place of birth field**

### **4. Former Spouse Citizenship**
- `form1[0].Section17_2[0].DropDownList12[0]` - **"Provide the country(ies) of citizenship. Country #1"**
- `form1[0].Section17_2[0].DropDownList12[1]` - **Country #2 citizenship**
- `form1[0].Section17_2[0].#field[2]` - **"Estimate"** (citizenship estimate)

### **5. Marriage and Divorce Information**
- `form1[0].Section17_2[0].From_Datefield_Name_2[2]` - **"Provide the date your civil marriage, civil union, or domestic partnership was legally recognized. (Month/Day/Year)"**
- `form1[0].Section17_2[0].From_Datefield_Name_2[1]` - **"Provide the date divorced/dissolved, annulled or widowed. (Month/Day/Year)"**
- `form1[0].Section17_2[0].#field[26]` - **"Estimate"** (marriage date estimate)
- `form1[0].Section17_2[0].#field[27]` - **"I don't know"** (marriage date unknown)
- `form1[0].Section17_2[0].#field[23]` - **"Estimate"** (divorce date estimate)

### **6. Former Spouse Contact Information**
- `form1[0].Section17_2[0].p3-t68[0]` - **"Provide telephone number"**

### **7. Marriage/Divorce Location Information**
- `form1[0].Section17_2[0].#area[5].TextField11[5]` - **Marriage location city**
- `form1[0].Section17_2[0].#area[5].School6_State[1]` - **Marriage location state**
- `form1[0].Section17_2[0].#area[5].DropDownList16[0]` - **Marriage location country**

### **8. Former Spouse Address Information**
- `form1[0].Section17_2[0].RadioButtonList[1]` - **Address question radio button**
- `form1[0].Section17_2[0].#area[6].Address_Full_short_line[0].#area[0].TextField11[0]` - **Address street**
- `form1[0].Section17_2[0].#area[6].Address_Full_short_line[0].TextField11[1]` - **Address city**
- `form1[0].Section17_2[0].#area[6].Address_Full_short_line[0].#area[0].School6_State[0]` - **Address state**
- `form1[0].Section17_2[0].#area[6].Address_Full_short_line[0].#area[0].DropDownList17[0]` - **Address country**

### **9. Additional Location Information**
- `form1[0].Section17_2[0].#area[7].TextField11[6]` - **Additional location city**
- `form1[0].Section17_2[0].#area[7].TextField11[7]` - **Additional location field**
- `form1[0].Section17_2[0].#area[7].School6_State[2]` - **Additional location state**
- `form1[0].Section17_2[0].#area[7].DropDownList18[0]` - **Additional location country**
- `form1[0].Section17_2[0].#area[7].TextField11[8]` - **Additional location zip code**

### **10. Status and Control Fields**
- `form1[0].Section17_2[0].RadioButtonList[0]` - **Main status radio button** (Options: "YES", "NO (If NO, complete (a))", "I don't know")

## **Section17_2_2 Field Categories (~60 fields) - Former Spouse #2**

**IMPORTANT**: Section17_2_2[0] has identical field structure to Section17_2[0] but for a second former spouse.

### **Key Fields for Former Spouse #2:**
- `form1[0].Section17_2_2[0].TextField11[1]` - **"Last name"**
- `form1[0].Section17_2_2[0].TextField11[2]` - **"First name"**
- `form1[0].Section17_2_2[0].TextField11[0]` - **"Middle name"**
- `form1[0].Section17_2_2[0].From_Datefield_Name_2[0]` - **"Provide the date of birth. (Month/Day/Year)"**
- `form1[0].Section17_2_2[0].DropDownList12[0]` - **"Provide the country(ies) of citizenship. Country #1"**

## **Key Field Mapping Insights:**

### **Name Field Pattern for Former Spouses:**
- **Former Spouse #1**: TextField11[0]=middle, TextField11[1]=last, TextField11[2]=first
- **Former Spouse #2**: TextField11[0]=middle, TextField11[1]=last, TextField11[2]=first (same pattern)

### **Critical Differences from Current Spouse:**
- **NO SSN FIELDS** for former spouses (confirmed by label analysis)
- **Simplified structure** - no extended contact sections like Section17_1_2
- **Divorce-specific fields** for divorce/annulment/widowed dates
- **Marriage location fields** separate from personal birth location

### **Multi-Entry Support:**
- **Section17_2[0]**: Former spouse #1 (all fields)
- **Section17_2_2[0]**: Former spouse #2 (identical structure)

### **Complex Address Structure:**
- Uses nested `#area[6].Address_Full_short_line[0].#area[0]` pattern
- Supports multiple address types and locations
- Different from current spouse address structure

This represents approximately **120+ fields total** for former spouse information across both Section17_2[0] and Section17_2_2[0] subsections. 