I need you to go to localhost:5173

add data to fields to section 13

Processed the data in memeory and ensure the fields are being applied to the PDF correctly

Consider these scripts:

		"pdf-to-images": "node scripts/pdf-to-images.js",
		"extract-pdf-fields": "node tests/pdf-page-field-extractor.js",
		"clear-data": "node scripts/clear-data.js"

        But you will need to use playwright mcp to interact wit the application to add the fields through the UI


        remember I wanted to continue processing the data in memmory instead of downloading the pdf