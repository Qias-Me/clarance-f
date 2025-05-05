import {
  PDFCheckBox,
  PDFDocument,
  PDFDropdown,
  PDFName,
  PDFRadioGroup,
  PDFString,
  PDFTextField,
  PDFNumber,
  PDFArray,
} from "pdf-lib";
import type { ApplicantFormValues } from "../interfaces/formDefinition";

// Define the OPM form URL
const SF86_PDF_URL = "https://www.opm.gov/forms/pdf_fill/sf86/";

// Add a simple in-memory PDF storage
const PDF_STORAGE = new Map<string, Uint8Array>();

interface UserServiceResponse {
  success: boolean;
  formData?: ApplicantFormValues;
  message: string;
  resultPdf?: Uint8Array;
  pdfId?: string; // Add PDF ID reference
}

// Interface for the extracted metadata
interface FieldMetadata {
  name: string;
  id: string;
  type: string;
  label?: string;
  value?: string | string[] | boolean; // Added boolean for checkbox values
  maxLength?: number;
  options?: string[];
  required?: boolean; // If pdf-lib supports this directly
  page?: number;     // Add page number property
}

export class PdfService {

    //Simple Methods

  async mapFilledValuesfrom_PDF(pdfDoc: PDFDocument) {
    const form = pdfDoc.getForm();
  
    return form.getFields().reduce((acc, field) => {
      const type = field.constructor.name;
      const value =
        field instanceof PDFTextField
          ? field.getText()
          : field instanceof PDFDropdown
          ? field.getSelected()
          : field instanceof PDFCheckBox
          ? field.isChecked()
            ? "Yes"
            : undefined
          : field instanceof PDFRadioGroup
          ? field.getSelected()
          : undefined;
          
  
      if (value && (!Array.isArray(value) || value.length > 0)) {
        acc.push({
          name: field.getName(),
          id: field.ref.tag.toString(),
          label: field.acroField.dict.get(PDFName.of("TU"))?.toString(),
          type,
          value,
        });
      }
      return acc;
    }, [] as any[]);
  }
  
  async mapFormValuesToJsonData(json: any[], formValues: ApplicantFormValues) {
    const idValueMap = new Map<string, string>();
  
    const flattenFormValues = (data: any) => {
      Object.values(data).forEach((val: any) => {
        if (val && typeof val === "object") {
          if (val.id && "value" in val) {
            idValueMap.set(`${val.id} 0 R`, val.value);
          } else {
            flattenFormValues(val);
          }
        }
      });
    };
  
    flattenFormValues(formValues);
  
    json.forEach((item) => {
      if (idValueMap.has(item.id)) item.value = idValueMap.get(item.id);
    });
  
    return json;
  }
  

  async mapFormFields(pdfDoc: PDFDocument) {
    const form = pdfDoc.getForm();
    const fields = form.getFields();

    const fieldData = fields.map((field) => {
      const name = field.getName();
      const type = field.constructor.name;
      const id = field.ref.tag.toString(); // Extract only the sequence of consecutive numbers
      let value: string | string[] | undefined = undefined;
      if (field instanceof PDFTextField) {
        value = field.getText();
      } else if (field instanceof PDFDropdown) {
        value = field.getSelected();
      } else if (field instanceof PDFCheckBox) {
        value = field.isChecked() ? "Yes" : "No";
      } else if (field instanceof PDFRadioGroup) {
        value = field.getSelected();
      }

      let label: string | undefined = undefined;

      const dict = field.acroField.dict;
      const tuRaw = dict.get(PDFName.of("TU"));
      if (tuRaw instanceof PDFString) {
          label = tuRaw.decodeText();
      }
      
      return {
        name,
        id,
        type,
        value,
        label
      };
    });

    return fieldData;
  }

  async setFieldValue(field: any, value: string) {
    if (field instanceof PDFTextField) field.setText(value);
    else if (field instanceof PDFDropdown || field instanceof PDFRadioGroup)
      field.select(value);
    else if (field instanceof PDFCheckBox)
      value.toLowerCase() === "yes" ? field.check() : field.uncheck();
  }


  //Advanced Methods

async applyValues_toPDF(formData: ApplicantFormValues): Promise<UserServiceResponse> {
  try {
    // Fetch the PDF from the OPM website instead of reading from filesystem
    const response = await fetch(SF86_PDF_URL);
    if (!response.ok) {
      throw new Error(`Failed to fetch PDF: ${response.status} ${response.statusText}`);
    }
    
    const pdfBytes = await response.arrayBuffer();
    const pdfDoc = await PDFDocument.load(pdfBytes);

    const fieldMapping = await this.mapFormFields(pdfDoc);
    const finalForm = await this.mapFormValuesToJsonData(fieldMapping, formData);

    const appliedFields = finalForm.filter(field => {
      // Skip fields with no value
      if (!field.value) return false;
      
      // Skip empty arrays
      if (Array.isArray(field.value) && field.value.length === 0) return false;
      
      // Skip "No", "NO", or empty string values
      if (field.value === "No" || field.value === "NO" || field.value === "") return false;
      
      // Include all other values
      return true;
    });
    
    const form = pdfDoc.getForm();
    const fieldMap = new Map(form.getFields().map((f) => [f.getName(), f]));

    await Promise.all(
      finalForm.map(async ({ name, value }) => {
        if (value && fieldMap.has(name)) {
          await this.setFieldValue(fieldMap.get(name), value as string);
        }
      })
    );

    const modifiedPdfBytes = await pdfDoc.save();
    
    // Generate a unique ID for this PDF
    const pdfId = Date.now().toString() + '-' + Math.random().toString(36).substring(2, 15);
    
    // Store the PDF in memory instead of returning the large buffer
    const resultPdf = new Uint8Array(modifiedPdfBytes);
    PDF_STORAGE.set(pdfId, resultPdf);
    
    // Clean up old PDFs (keep only the 10 most recent)
    if (PDF_STORAGE.size > 10) {
      const oldestKey = PDF_STORAGE.keys().next().value;
      if (oldestKey) {
        PDF_STORAGE.delete(oldestKey);
      }
    }

    return { 
      success: true, 
      formData, 
      pdfId, // Return the ID instead of the PDF data
      message: "PDF filled successfully. Use the pdfId to retrieve the PDF." 
    };
  } catch (error) {
    return { success: false, message: `Error processing PDF: ${error}` };
  }
}

// Add a method to retrieve PDF by ID
async getPdfById(id: string | undefined): Promise<Uint8Array | null> {
  if (!id) return null;
  return PDF_STORAGE.get(id as string) || null;
}

async generateJSON_fromPDF(
    formData: ApplicantFormValues
  ): Promise<UserServiceResponse> {
    try {
      // Fetch the PDF from the OPM website
      const response = await fetch(SF86_PDF_URL);
      if (!response.ok) {
        throw new Error(`Failed to fetch PDF: ${response.status} ${response.statusText}`);
      }
      
      const pdfBytes = await response.arrayBuffer();
      console.log("PDF loaded from URL.");

      const pdfDoc = await PDFDocument.load(pdfBytes);
      console.log("PDF document loaded.");

      const fieldMapping = await this.mapFilledValuesfrom_PDF(pdfDoc);
      console.log("Form fields mapped. v1");

      // Return the data instead of writing to file
      const completedFields = fieldMapping;

      console.log("Form values mapped to memory.");
      console.log("PDF fields processed.");

      return {
        success: true,
        formData,
        message: "PDF processed successfully with field data extracted.",
      };
    } catch (error) {
      console.error(`Error processing PDF: ${error}`);
      return {
        success: false,
        message: `Error processing PDF: ${error}`,
      };
    }
  }

  async showAllFormFields(
    formData: ApplicantFormValues
  ): Promise<UserServiceResponse> {
    try {
      // Fetch the PDF from the OPM website
      const response = await fetch(SF86_PDF_URL);
      if (!response.ok) {
        throw new Error(`Failed to fetch PDF: ${response.status} ${response.statusText}`);
      }
      
      const pdfBytes = await response.arrayBuffer();
      console.log("PDF loaded from URL.");

      const pdfDoc = await PDFDocument.load(pdfBytes);
      console.log("PDF document loaded.");

      const fieldMapping = await this.mapFormFields(pdfDoc);
      console.log("Form fields mapped.");

      // Return the data instead of writing to file
      const allFields = fieldMapping;

      console.log("Form values mapped to memory.");

      return {
        success: true,
        formData,
        message: "Fields Mapped successfully.",
      };
    } catch (error) {
      console.error(`Error processing PDF: ${error}`);
      return {
        success: false,
        message: `Error processing PDF: ${error}`,
      };
    }
  }




}


