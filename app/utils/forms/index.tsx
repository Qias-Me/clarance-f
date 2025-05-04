// import { FullEmployee } from "api/interfaces/employee";
import pkg from "lodash";

export default class Utils {
  // static flattenFormData(formData: FormData, allowedFields: string[]) {
  //   const { set } = pkg;
  //   const result = {};
  //   for (const [key, value] of formData.entries()) {
  //     // Convert indices to property paths
  //     const path = key.replace(/\[(\w+)\]/g, ".$1");

  //     // Check if the path starts with any of the allowed fields
  //     const isAllowed = allowedFields.some((field) => path.startsWith(field));
  //     if (!isAllowed) {
  //       continue; // Skip adding fields not listed in allowedFields
  //     }

  //     set(result, path, value);
  //   }

  //   return result;
  // }

  // static extractUpdatesFromFormData(formData: FormData): Partial<FullEmployee> {
  //   const { set } = pkg;
  //   const updates: Partial<FullEmployee> = {};

  //   formData.forEach((value, key) => {
  //     // Attempt to parse JSON values for complex data, fall back to direct assignment
  //     try {
  //       // Check if the value is a JSON string (for nested objects/arrays)
  //       if (
  //         typeof value === "string" &&
  //         (value.startsWith("{") || value.startsWith("["))
  //       ) {
  //         set(updates, key, JSON.parse(value));
  //       } else {
  //         set(updates, key, value);
  //       }
  //     } catch (e) {
  //       // Not a JSON string, use the value directly
  //       set(updates, key, value);
  //     }
  //   });

  //   return updates;
  // }
 static handleInputChange = (formData, setFormData, onChange, updateField) => (path, value) => {
    const { set, cloneDeep } = pkg;
    const updatedFormData = cloneDeep(formData);  // Cloning to ensure immutability
    set(updatedFormData, path, value);  // Use lodash's set to handle nested paths
    
    setFormData(updatedFormData);  // Update state with new object
    if (onChange) {
      onChange(updatedFormData);  // Callback for any additional actions
    }
    if (updateField) {
      updateField(path, value);  // Callback for any field-specific updates
    }
  };
  
  static isValidValue = (path, value) => {
    if (typeof value === "string" && value.trim() === "") return false;
    if (value === null) return false;
    if (Array.isArray(value) && value.length === 0) return false;
    if (
      typeof value === "object" &&
      !Array.isArray(value) &&
      Object.keys(value).length === 0
    )
      return false;
    return true;
  };

  static handleAddEntry = (formData, setFormData, onChange, updateField) => (path, defaultItem) => {
      const { set, cloneDeep, get } = pkg;
      const updatedFormData = cloneDeep(formData);
      const list = get(updatedFormData, path, [defaultItem]);
      list.push(defaultItem);
      set(updatedFormData, path, list);
      setFormData(updatedFormData);
      onChange(updatedFormData);
      updateField(path, list);
    };

  static handleRemoveEntry = (formData:string[], setFormData, onChange, updateField) => (path: string, index: number) => {
      const { set, cloneDeep, get } = pkg;
      const updatedFormData = cloneDeep(formData);
      const list = get(updatedFormData, path, []);
      if (list && Array.isArray(list)) {
        list.splice(index, 1);
        set(updatedFormData, path, list);
        setFormData(updatedFormData);
        onChange(updatedFormData);
        updateField(path, list);
      }
    };

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

  static isReadOnlyField = (key: string) => {
    return key.endsWith("_id") || key === "createdAt" || key === "updatedAt";
  };
}
