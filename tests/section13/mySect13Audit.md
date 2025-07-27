- When a employment type option is selected, automcatally render the corresponding subsections the relate to the input.

- The entry structure needs to resember the foems strucutre... there can be up to 4 entries, but a singler entriy should be strucutred in a way that doesnt break the timeline. So the beginning of the first entry begins with the user selects an employement type, which triggered the conditional subsection. There can only be 1 index for the corrsponding subsection entries. If another "entry" is needed, it will need a corresponding emplyment type.

ONLY RENDER THE SUBSECTIONS BASED ON THE EMPLOYMENT TYPE and label them accordingly..13A.1 - 13A.6 descriptions.

example:
1st Entry
"Select your employment type" answer triggeres a conditional corresponding subsection. Once those subsections are filled. the first entry is complete.

2nd Entry
"Select your employment type" answer triggeres a conditional corresponding subsection. Once those subsections are filled. the second entry is complete.

etc...through the 4th entry as that is the max.


- there seems to be an infinite loop in the console about:
  console.log(`🔄 Section13: Creating field for logical path: ${logicalPath} -> PDF field: ${pdfFieldName}`); in section13.tsx

  Please correct this to only render/trigger on specific actions such as inital mount, and dependent/relevant input changes.

  - in IntegratedValidationService the expected values need to come from the submitted formdata values that is located in SF86FormProvider. The expected values are the same values that were submitted into the pdf Beofre the pdf was submitted. The assumption is that the values in the UI are being saved properly to the formData. If they are no that is the first place the must be corrected and deeply analyzed to ensure the values at least make it that far. If the values do not make it to the formData context the assumtpion is they will not be in the pdfBytes so the will not be in the PDF, thus PDF not valid.


- `clearValidationData` need to access the filesystem and delete the data in:
C:\Users\Jason\Desktop\AI-Coding\clarance-f\api\PDFoutput
C:\Users\Jason\Desktop\AI-Coding\clarance-f\api\PDFphotos

(Ensure a standardized way to delete files from the filesystem, maybe through an API request, so that the data is properly cleaned for this validation iteration)

Consider a cloudflare function route `C:\Users\Jason\Desktop\AI-Coding\clarance-f\app\routes\api\pdf-validation-tools`

Your best bet would be to do a fetch request with an action flag such as "clearPDF", "clearJSON" and the action can read those flags and handle them gracefully.




- 