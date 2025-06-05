# Section 17_3 Complete Field Mapping - Cohabitant

Based on systematic analysis of `api/sections-references/section-17.json` using field labels and values.

## **Section17_3 Field Categories (~80 fields)**

### **1. Cohabitant #1 Main Name Fields (Section17_3[0])**
- `form1[0].Section17_3[0].TextField11[7]` - **"Last name"** (Label: "Complete the following if you presently reside with a cohabitant. Entry #1. Provide the cohabitant full name. Last name")
- `form1[0].Section17_3[0].TextField11[8]` - **"First name"**
- `form1[0].Section17_3[0].TextField11[6]` - **"Middle name"**
- `form1[0].Section17_3[0].suffix[2]` - **"Suffix"**

### **2. Cohabitant #1 Other Names Used (Multiple Sets)**

#### **Other Names Set #1:**
- `form1[0].Section17_3[0].TextField11[2]` - **"Last name"** (Label: "Provide other names used by your cohabitant...#1. Last name")
- `form1[0].Section17_3[0].TextField11[1]` - **"First name"** (other name #1)
- `form1[0].Section17_3[0].TextField11[0]` - **"Middle name"** (other name #1)
- `form1[0].Section17_3[0].suffix[0]` - **"Suffix"** (other name #1)
- `form1[0].Section17_3[0].#area[0].From_Datefield_Name_2[0]` - **"Time name used. From (month/year)"**
- `form1[0].Section17_3[0].#area[0].To_Datefield_Name_2[0]` - **"Time name used. To (month/year)"**

#### **Other Names Set #2:**
- `form1[0].Section17_3[0].TextField11[5]` - **"Last name"** (other name #2)
- `form1[0].Section17_3[0].TextField11[4]` - **"First name"** (other name #2) 
- `form1[0].Section17_3[0].TextField11[3]` - **"Middle name"** (other name #2)
- `form1[0].Section17_3[0].suffix[1]` - **"Suffix"** (other name #2)
- `form1[0].Section17_3[0].#area[1].From_Datefield_Name_2[1]` - **Time used from date**
- `form1[0].Section17_3[0].#area[1].To_Datefield_Name_2[1]` - **Time used to date**

#### **Other Names Set #3:**
- `form1[0].Section17_3[0].TextField11[12]` - **"Last name"** (other name #3)
- `form1[0].Section17_3[0].TextField11[11]` - **"First name"** (other name #3)
- `form1[0].Section17_3[0].TextField11[10]` - **"Middle name"** (other name #3)
- `form1[0].Section17_3[0].suffix[3]` - **"Suffix"** (other name #3)
- `form1[0].Section17_3[0].#area[3].From_Datefield_Name_2[4]` - **Time used from date**
- `form1[0].Section17_3[0].#area[3].To_Datefield_Name_2[2]` - **Time used to date**

#### **Other Names Set #4:**
- `form1[0].Section17_3[0].TextField11[15]` - **"Last name"** (other name #4)
- `form1[0].Section17_3[0].TextField11[14]` - **"First name"** (other name #4)
- `form1[0].Section17_3[0].TextField11[13]` - **"Middle name"** (other name #4)
- `form1[0].Section17_3[0].suffix[4]` - **"Suffix"** (other name #4)
- `form1[0].Section17_3[0].#area[4].From_Datefield_Name_2[5]` - **Time used from date**
- `form1[0].Section17_3[0].#area[4].To_Datefield_Name_2[3]` - **Time used to date**

### **3. Cohabitant #1 Personal Information**
- `form1[0].Section17_3[0].From_Datefield_Name_2[3]` - **"Provide the date of birth. Date (Month/Day/Year)"**
- `form1[0].Section17_3[0].#field[27]` - **"Estimate"** (birth date estimate)
- `form1[0].Section17_3[0].TextField11[16]` - **"Provide your cohabitant's U.S. Social Security Number"** ✅ **SSN EXISTS**

### **4. Cohabitant #1 Place of Birth**
- `form1[0].Section17_3[0].#area[2].TextField11[9]` - **"Provide the place of birth. City"**
- `form1[0].Section17_3[0].#area[2].School6_State[0]` - **"State"**
- `form1[0].Section17_3[0].#area[2].DropDownList22[0]` - **"Country (Required)"**

### **5. Cohabitant #1 Citizenship**
- `form1[0].Section17_3[0].DropDownList12[0]` - **Citizenship country #1**
- `form1[0].Section17_3[0].DropDownList12[1]` - **Citizenship country #2**
- `form1[0].Section17_3[0].From_Datefield_Name_2[2]` - **Citizenship date field**

### **6. Cohabitant #1 Documentation**
- `form1[0].Section17_3[0].TextField11[17]` - **"Provide document number"**
- `form1[0].Section17_3[0].From_Datefield_Name_2[6]` - **"Provide document expiration date, if applicable. (Month/Day/Year)"**
- `form1[0].Section17_3[0].TextField11[18]` - **Additional documentation field**
- Various checkbox fields for document types:
  - `form1[0].Section17_3[0].#field[53]` - **"Not applicable"**
  - `form1[0].Section17_3[0].#field[54]` - **"Certificate of Naturalization (N550 or N570)"**
  - `form1[0].Section17_3[0].#field[57]` - **"DS 1350"**
  - `form1[0].Section17_3[0].#field[58]` - **"Naturalized: Alien Registration..."**
  - `form1[0].Section17_3[0].#field[59]` - **"I-766 Employment Authorization"**
  - `form1[0].Section17_3[0].#field[60]` - **"Not a U.S. Citizen: I-551 Permanent Resident"**

### **7. Status and Control Fields**
- `form1[0].Section17_3[0].RadioButtonList[0]` - **Primary cohabitant status radio**
- `form1[0].Section17_3[0].RadioButtonList[1]` - **Other names status radio**
- `form1[0].Section17_3[0].RadioButtonList[2]` - **Additional status radio**
- `form1[0].Section17_3[0].RadioButtonList[3]` - **Additional status radio**
- `form1[0].Section17_3[0].RadioButtonList[4]` - **Additional status radio**

## **Section17_3_2 Field Categories (~80 fields) - Cohabitant #2**

**IMPORTANT**: Section17_3_2[0] has identical field structure to Section17_3[0] but for a second cohabitant.

### **Key Fields for Cohabitant #2:**
- `form1[0].Section17_3_2[0].TextField11[7]` - **"Last name"** (main name)
- `form1[0].Section17_3_2[0].TextField11[8]` - **"First name"** (main name)
- `form1[0].Section17_3_2[0].TextField11[6]` - **"Middle name"** (main name)
- `form1[0].Section17_3_2[0].suffix[2]` - **"Suffix"** (main name)
- `form1[0].Section17_3_2[0].From_Datefield_Name_2[3]` - **"Provide the date of birth"**
- `form1[0].Section17_3_2[0].TextField11[16]` - **"Provide your cohabitant's U.S. Social Security Number"** ✅ **SSN EXISTS**

## **Key Field Mapping Insights:**

### **Name Field Pattern for Cohabitants:**
- **Primary Cohabitant name**: TextField11[6]=middle, TextField11[7]=last, TextField11[8]=first
- **Other name #1**: TextField11[0]=middle, TextField11[1]=first, TextField11[2]=last
- **Other name #2**: TextField11[3]=middle, TextField11[4]=first, TextField11[5]=last  
- **Other name #3**: TextField11[10]=middle, TextField11[11]=first, TextField11[12]=last
- **Other name #4**: TextField11[13]=middle, TextField11[14]=first, TextField11[15]=last

### **Critical Similarities to Current Spouse:**
- **SSN FIELDS EXIST** for cohabitants (TextField11[16])
- **Complex documentation structure** similar to current spouse
- **Multiple other names supported** (4 sets vs 2 for current spouse)
- **Primary name uses same field pattern** as current spouse (TextField11[6-8])

### **Multi-Entry Support:**
- **Section17_3[0]**: Cohabitant #1 (all fields and multiple other names)
- **Section17_3_2[0]**: Cohabitant #2 (identical structure)

### **Complex Other Names Structure:**
- **4 different sets** of other names per cohabitant
- Each set has its own date range and suffix
- More extensive than current spouse (2 sets) or former spouse (none)

This represents approximately **160+ fields total** for cohabitant information across both Section17_3[0] and Section17_3_2[0] subsections. 