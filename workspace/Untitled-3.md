Based on reading: C:\Users\Jason\Desktop\AI-Coding\clarance-f\api\sections-references\section-13.json


and the corresponding page in:
C:\Users\Jason\Desktop\AI-Coding\clarance-f\api\PDFphotos


Please optimize and ensure all fields are properly mapped and accounted for in:


I need a script that reads a specific PDF page's content to validate the fields are propelry being set.

This script needs to take in a pdf target, and a page target as parameters to ensure percsie validations and reading. 

it should maintin the same strucutre as the data from section-x.json:

    {
      "id": "11361 0 R",
      "name": "form1[0].section13_5[0].From_Datefield_Name_2[7]",
      "value": "toDate3",
      "page": 33,
      "label": "To Date (month/year)",
      "type": "PDFTextField",
      "rect": {
        "x": 146.25,
        "y": 435.67,
        "width": 72,
        "height": 17.68
      },
      "section": 13,
    },


You may need to add a service here

@c:\Users\Jason\Desktop\AI-Coding\clarance-f/api\service\clientPdfService2.0.ts 

the problem we are circumventing is once the pdf is generated on the cleint side, it needs to be pushed back into the workflow for validation. 

we can either move the pdf from the donwloaded directoy, or we can push the data stright to the service to begin anaylsis


These are the two useful scripts you may need to use in the workflow:
		"pdf-to-images": "node scripts/pdf-to-images-simple.cjs",
		"extract-pdf-fields": "node tests/pdf-page-field-extractor.js"


You will need to use playwright mcp to interact with the application UI and input values. 

After you add the values for X page, you need to generate the pdf, move it to the workspace.......


*NOTE QUESTION: Can you just keep the databflow going or do you need to download the PDF first the process it, or can I keep the data flow going?**


After you add the values for X page, you need to generate the pdf, move it to the workspace.......


add a flag to allow for in memory worflow, or pdf downloading option





You will need to use playwright mcp on localhost:5173 to interact with the application  for section 13 UI and input values.  

After you add the values for page 17, you need to then validate the fields.