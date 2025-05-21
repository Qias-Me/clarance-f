// import { FullEmployee } from "api/interfaces/employee";
import pkg from "lodash";
import { Utils } from "../commonUtils";

export class FormUtils {
  // Handle input changes with improved typings
  static handleInputChange = (
    formData: any, 
    setFormData: (data: any) => void, 
    onChange?: (data: any) => void, 
    updateField?: (path: string, value: any) => void
  ) => Utils.createInputChangeHandler(formData, setFormData, onChange, updateField);

  // Re-export isValidValue from the common Utils
  static isValidValue = Utils.isValidValue;

  // Re-export handlers with backward compatibility
  static handleAddEntry = (
    formData: any, 
    setFormData: (data: any) => void, 
    onChange: (data: any) => void, 
    updateField: (path: string, value: any) => void
  ) => Utils.createAddEntryHandler(formData, setFormData, onChange, updateField);

  static handleRemoveEntry = (
    formData: any, 
    setFormData: (data: any) => void, 
    onChange: (data: any) => void, 
    updateField: (path: string, value: any) => void
  ) => Utils.createRemoveEntryHandler(formData, setFormData, onChange, updateField);

  // Keep the template implementation here since it's forms-specific
  static getDefaultNewItem = (path: string): any => {
    const { cloneDeep } = pkg;
    const templates = {
      locations: {
        location_type_id: 2,
        _city: "",
        _state: "",
        _country: "",
      },
      certifications: {
        _name: "",
        _description: "",
        certification_date: new Date().toISOString(),
        logo: { _url: "", _alt: "", _title: "" },
        titles: [{ _description: "" }],
      },
      experiences: {
        job_title: "",
        company: "",
        startDate: new Date().toISOString(),
        endDate: new Date().toISOString(),
        duties: [{ _description: "" }],
      },
      skills: {
        skill_name: "",
        subskills: [{ subskill_name: "", years: 0 }],
      },
      clearances: {
        clearance_status_id: 1,
        _name: "",
        _description: "",
        clearance_date: new Date().toISOString(),
      },
      educations: {
        _degree: "",
        _institution: "",
        _years: 0,
      },
      subskills: {
        subskill_name: "",
        years: "",
      },
      duties: {
        _description: "",
      },
      titles: {
        _description: "",
      },
    };

    // Check if the path ends with any known nested keys and adjust the key selection accordingly
    const pathSegments = path.split(".");
    const lastSegment = pathSegments.slice(-1)[0];
    const isNestedPath = pathSegments.length > 1;

    if (isNestedPath) {
      // If the path indicates a nested structure, check for known nested fields
      const nestedKeys = ["subskills", "duties", "titles"];
      const match = nestedKeys.find((key) => path.includes(key));
      if (match) {
        return cloneDeep(templates[match as keyof typeof templates]);
      }
    }

    return cloneDeep(templates[lastSegment as keyof typeof templates]) || {};
  };

  // Re-export isReadOnlyField from the common Utils
  static isReadOnlyField = Utils.isReadOnlyField;
}

// For backward compatibility
export default FormUtils;
