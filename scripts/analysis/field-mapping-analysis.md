# Field Hierarchy Analysis

## Structure Overview

The `field-hierarchy.json` file is a large (2.43 MB) JSON file that contains field definitions for all sections of the form. The file has the following structure:

```json
{
  "5": {
    "fieldsByValuePattern": {
      "section5": {
        "pattern": "section5",
        "confidence": 0.8,
        "fieldsByRegex": {
          "form1_0": {
            "regex": "form1_0",
            "confidence": 0.5,
            "fields": [
              {
                "name": "form1[0].Sections1-6[0].section5[0].TextField11[0]",
                "id": "9502 0 R",
                "label": "Middle Name",
                "value": "sect5middleName#1",
                "type": "PDFTextField",
                "section": 5,
                "sectionName": "Other Names Used",
                "confidence": 0.98
              },
              // more fields...
            ]
          }
        }
      }
    }
  },
  // more pages...
}
```

## Key Findings

1. **Structure**: The file is organized by page numbers, with fields nested under `fieldsByValuePattern` → `fieldsByRegex` → `fields` arrays.

2. **Total Fields**: 6,197 fields across all sections.

3. **Field Types**:
   - PDFTextField
   - PDFRadioGroup
   - PDFDropdown
   - PDFCheckBox

4. **ID Pattern**: All field IDs follow the pattern `XXXX 0 R` (e.g., `9502 0 R`).

5. **ID to Context Key Transformation**:
   - In the JSON file: `9502 0 R`
   - In the context: `9502` (the `0 R` suffix is removed)
   - At runtime: The `0 R` suffix is added back

6. **Section Organization**: The form is divided into 30 sections, each corresponding to specific components and context keys.

## Section to Component Mapping

| Section | Section Name | Component | Context Key |
|---------|--------------|-----------|------------|
| 1 | Full Name | RenderPersonalInfo | personalInfo |
| 2 | Date of Birth | RenderBirthInfo | birthInfo |
| 3 | Place of Birth | RenderAcknowledgementInfo | aknowledgementInfo |
| 4 | Social Security Number | RenderPhysicalsInfo | physicalAttributes |
| 5 | Other Names Used | RenderNames | namesInfo |
| 6 | Your Identifying Information | RenderContactInfo | contactInfo |
| 7 | Your Contact Information | RenderPassportInfo | passportInfo |
| 8 | U.S. Passport Information | RenderCitizenshipInfo | citizenshipInfo |
| 9 | Citizenship | RenderDualCitizenshipInfo | dualCitizenshipInfo |
| 10 | Dual/Multiple Citizenship & Foreign Passport Info | RenderResidencyInfo | residencyInfo |
| 11 | Where You Have Lived | RenderSchoolInfo | schoolInfo |
| 12 | Where you went to School | RenderEmploymentInfo | employmentInfo |
| 13 | Employment Acitivites | RenderServiceInfo | serviceInfo |
| 14 | Selective Service | RenderMilitaryInfo | militaryHistoryInfo |
| 15 | Military History | RenderPeopleThatKnow | peopleThatKnow |
| 16 | People Who Know You Well | RenderRelationshipInfo | relationshipInfo |
| 17 | Maritial/Relationship Status | RenderRelativesInfo | relativesInfo |
| 18 | Relatives | RenderForeignContacts | foreignContacts |
| 19 | Foreign Contacts | RenderForeignActivities | foreignActivities |
| 20 | Foreign Business, Activities, Government Contacts | RenderMentalHealth | mentalHealth |
| 21 | Psycological and Emotional Health | RenderPolice | policeRecord |
| 22 | Police Record | RenderDrugActivity | drugActivity |
| 23 | Illegal Use of Drugs and Drug Activity | RenderAlcoholUse | alcoholUse |
| 24 | Use of Alcohol | RenderInvestigationsInfo | investigationsInfo |
| 25 | Investigations and Clearance | RenderFinances | finances |
| 26 | Financial Record | RenderTechnology | technology |
| 27 | Use of Information Technology Systems | RenderCivil | civil |
| 28 | Involvement in Non-Criminal Court Actions | RenderAssociation | association |
| 29 | Association Record | RenderSignature | signature |
| 30 | Continuation Space | RenderPrintPDF | print |

## Section 5 Example (Other Names Used)

Section 5 contains fields for "Other Names Used" and is rendered by the `RenderNames` component. The context key for this section is `namesInfo`.

Sample fields:
- `9502 0 R`: Middle Name (TextField)
- `9501 0 R`: First Name (TextField)
- `9500 0 R`: Last Name (TextField)
- `9499 0 R`: Reason for Change (TextField)
- `9498 0 R`: Start Date (TextField)
- `9497 0 R`: End Date (TextField)
- `17240 0 R`: Is Maiden Name (RadioGroup)
- `9494 0 R`: Suffix (Dropdown)
- `9493 0 R`: Estimate Start Date (CheckBox)
- `9492 0 R`: Estimate End Date (CheckBox)
- `9491 0 R`: Present (CheckBox)

## Dynamic Entry Management

The current implementation has the following issues:

1. Sections like "Other Names Used" (Section 5) show all entries by default, even though users may not need all of them.

2. The context keys in `app/state/contexts/sections/namesInfo.tsx` contain data for all possible entries (e.g., 4 other names), but the UI should only render entries that are actually needed.

3. The current approach loads all available entries from the context, but we need to implement a mechanism to dynamically show/hide entries based on user actions (Add/Remove buttons).

## Next Steps

1. Create a utility function to manage the visibility of entries while maintaining the context structure.

2. Update the `RenderNames` component to use this utility for managing which entries to display.

3. Extend this approach to all components that handle multiple entries.

4. Ensure the field IDs are correctly mapped between context and form fields. 