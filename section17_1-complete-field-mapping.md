# Section 17_1 Complete Field Mapping - Current Spouse

Based on systematic analysis of `api/sections-references/section-17.json` using field labels and values.

## **Section17_1 Field Categories (80+ fields)**

### **1. Marriage/Relationship Status & Date**
- `form1[0].Section17_1[0].From_Datefield_Name_2[0]` - **"Provide date when you entered into your civil marriage, civil union, or domestic partnership"**

### **2. Current Spouse Main Name Fields**
- `form1[0].Section17_1[0].TextField11[7]` - **"Last name"** (PRIMARY name)
- `form1[0].Section17_1[0].TextField11[8]` - **"First name"** (PRIMARY name)  
- `form1[0].Section17_1[0].TextField11[6]` - **"Middle name"** (PRIMARY name)
- `form1[0].Section17_1[0].suffix[2]` - **"Suffix"** (PRIMARY name)

### **3. Current Spouse Other Names Used (Section17_1 #1)**
- `form1[0].Section17_1[0].TextField11[2]` - **"Provide other names used by your spouse...#1. Last name"**
- `form1[0].Section17_1[0].TextField11[1]` - **"First name"** (other name #1)
- `form1[0].Section17_1[0].TextField11[0]` - **"Middle name"** (other name #1)
- `form1[0].Section17_1[0].suffix[0]` - **"Suffix"** (other name #1)
- `form1[0].Section17_1[0].#area[0].From_Datefield_Name_2[1]` - **"Time name used. From (month/year)"**
- `form1[0].Section17_1[0].#area[0].To_Datefield_Name_2[0]` - **"Time name used. To (month/year)"**
- `form1[0].Section17_1[0].#field[10]` - **"Est."** (from date estimate)
- `form1[0].Section17_1[0].#field[11]` - **"Estimate"** (to date estimate)
- `form1[0].Section17_1[0].#field[12]` - **"Present"** (to date present)
- `form1[0].Section17_1[0].RadioButtonList[0]` - **Radio button for other names section**

### **4. Current Spouse Other Names Used (Section17_1 #2)**  
- `form1[0].Section17_1[0].TextField11[3]` - **"Middle name"** (other name #2)
- `form1[0].Section17_1[0].TextField11[4]` - **"First name"** (other name #2)
- `form1[0].Section17_1[0].TextField11[5]` - **"Last name"** (other name #2)
- `form1[0].Section17_1[0].suffix[1]` - **"Suffix"** (other name #2)
- `form1[0].Section17_1[0].#area[1].*` - Time used fields for name #2
- `form1[0].Section17_1[0].#area[2].*` - Additional name fields and dates

### **5. Current Spouse Personal Information**
- `form1[0].Section17_1[0].From_Datefield_Name_2[3]` - **"Provide date of birth. (Month/Day/Year)"**
- `form1[0].Section17_1[0].#field[33]` - **"Estimate"** (birth date estimate)
- `form1[0].Section17_1[0].TextField11[9]` - **"Provide U.S. Social Security Number"**
- `form1[0].Section17_1[0].#field[43]` - **"Not applicable"** (SSN not applicable)

### **6. Current Spouse Place of Birth**
- `form1[0].Section17_1[0].#area[3].TextField11[12]` - **"Provide place of birth. City"**
- `form1[0].Section17_1[0].#area[3].TextField11[13]` - **"County"**
- `form1[0].Section17_1[0].#area[3].School6_State[0]` - **"State"**
- `form1[0].Section17_1[0].#area[3].DropDownList12[1]` - **"Country"**

### **7. Current Spouse Citizenship**
- `form1[0].Section17_1[0].DropDownList12[0]` - **"Provide country(ies) of citizenship. Country #1"**

### **8. Current Spouse Documentation**
- `form1[0].Section17_1[0].TextField11[10]` - **"Provide document number"**
- `form1[0].Section17_1[0].TextField11[11]` - **"Provide explanation"**
- Various checkbox fields for document types:
  - `form1[0].Section17_1[0].#field[35]` - **"DS 1350"**
  - `form1[0].Section17_1[0].#field[36]` - **"Naturalized: Alien Registration..."**
  - `form1[0].Section17_1[0].#field[37]` - **"I-766 Employment Authorization"**

## **Section17_1_2 Field Categories (50+ fields) - Extended Current Spouse Info**

### **1. Current Spouse Contact Information (Section17_1_2)**
- `form1[0].Section17_1_2[0].#area[1].p3-t68[0]` - **"Provide telephone number"**
- `form1[0].Section17_1_2[0].#area[1].TextField11[5]` - **"Extension"**
- `form1[0].Section17_1_2[0].#area[1].p3-t68[1]` - **"Provide email address"**
- `form1[0].Section17_1_2[0].#area[1].#field[15]` - **"Use my current telephone number"**
- `form1[0].Section17_1_2[0].#area[1].#field[16]` - **"International or DSN phone number"**

### **2. Current Spouse Address (Section17_1_2)**
- `form1[0].Section17_1_2[0].#area[2].TextField11[6]` - **"Provide current address...Street"**
- `form1[0].Section17_1_2[0].#area[2].TextField11[7]` - **"City"**
- `form1[0].Section17_1_2[0].#area[2].School6_State[2]` - **"State"**

## **Key Field Mapping Insights:**

### **Name Field Pattern:**
- **Current Spouse PRIMARY name**: TextField11[6]=middle, TextField11[7]=last, TextField11[8]=first
- **Current Spouse OTHER name #1**: TextField11[0]=middle, TextField11[1]=first, TextField11[2]=last  
- **Current Spouse OTHER name #2**: TextField11[3]=middle, TextField11[4]=first, TextField11[5]=last

### **Critical Fields:**
- **SSN**: TextField11[9] (EXISTS for current spouse)
- **Birth Date**: From_Datefield_Name_2[3] 
- **Marriage Date**: From_Datefield_Name_2[0]
- **Primary Phone**: Section17_1_2[0].#area[1].p3-t68[0]
- **Primary Address**: Section17_1_2[0].#area[2] fields

### **Multi-Section Structure:**
- **Section17_1[0]**: Main spouse personal info, names, birth, documentation
- **Section17_1_2[0]**: Extended contact info, addresses, phone numbers

This represents approximately **130+ fields total** for current spouse information across both subsections. 