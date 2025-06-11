import  {type ApplicantFormValues } from "../interfaces/formDefinition2.0";
import DynamicRepository from "../repository/formDataRepository";
import cloneDeep from "lodash/cloneDeep";

interface UserServiceResponse {
  success: boolean;
  formData?: ApplicantFormValues;
  message: string;
  timestamp?: Date;
  size?: number;
}

interface FormDataMetadata {
  lastSaved: Date;
  sections: string[];
  version: string;
  sectionCount: number;
}

class DynamicService {
  private dynamicRepo: DynamicRepository;

  constructor() {
    this.dynamicRepo = new DynamicRepository();
  }

  /**
   * Save complete form data with metadata
   */
  async saveUserFormData(
    section: string,
    formData: ApplicantFormValues
  ): Promise<UserServiceResponse> {
    const isDebugMode = typeof window !== 'undefined' && window.location.search.includes('debug=true');
    
    try {
      const timestamp = new Date();
      const dataSize = JSON.stringify(formData).length;

      if (isDebugMode) {
        console.log(`💾 DynamicService: Saving form data to IndexedDB...`);
        console.log(`   📋 Section: ${section}`);
        console.log(`   📊 Data size: ${dataSize} bytes`);
        console.log(`   🕒 Timestamp: ${timestamp.toISOString()}`);
      }

      // Save main form data
      await this.dynamicRepo.saveFormData(section, formData);

      return { 
        success: true, 
        message: "Form data saved successfully.",
        timestamp,
        size: dataSize
      };
    } catch (error) {
      console.error("❌ DynamicService: Error saving form data:", error);
      return {
        success: false,
        message: `Failed to save form data: ${error}`,
      };
    }
  }

  /**
   * Load complete form data with validation
   */
  async loadUserFormData(key: string): Promise<UserServiceResponse> {
    const isDebugMode = typeof window !== 'undefined' && window.location.search.includes('debug=true');
    
    try {
      if (isDebugMode) {
        console.log(`📂 DynamicService: Loading form data from IndexedDB...`);
        console.log(`   🔑 Key: ${key}`);
      }

      const formData: ApplicantFormValues | null = await this.dynamicRepo.getFormData(key);

      if (formData) {
        const dataSize = JSON.stringify(formData).length;
        const activeSections = Object.keys(formData).filter(k => formData[k as keyof ApplicantFormValues] !== undefined);

        if (isDebugMode) {
          console.log(`✅ DynamicService: Form data loaded successfully`);
          console.log(`   📊 Data size: ${dataSize} bytes`);
          console.log(`   📋 Active sections: ${activeSections.length}`);
          console.log(`   📋 Section list: ${activeSections.join(', ')}`);
        }
        return {
          success: true,
          formData,
          message: "Form data retrieved successfully.",
          size: dataSize
        };
      } else {
        if (isDebugMode) {
          console.log(`📭 DynamicService: No data found for key: ${key}`);
        }
        return { 
          success: false, 
          message: "No form data found." 
        };
      }
    } catch (error) {
      console.error("❌ DynamicService: Error retrieving form data:", error);
      return {
        success: false,
        message: `Failed to retrieve form data: ${error}`,
      };
    }
  }


  /**
   * Update form data with change tracking
   */
  async updateUserData(
    section: string,
    changes: any
  ): Promise<UserServiceResponse> {
    const isDebugMode = typeof window !== 'undefined' && window.location.search.includes('debug=true');
    
    try {
      if (isDebugMode) {
        console.log(`🔄 DynamicService: Updating form data...`);
        console.log(`   📋 Section: ${section}`);
        console.log(`   📊 Changes:`, changes);
      }

      const currentData: ApplicantFormValues | null = await this.dynamicRepo.getFormData(section);

      if (!currentData) {
        if (isDebugMode) {
          console.log(`📭 DynamicService: No existing data found, creating new data`);
        }
        return {
          success: false,
          message: "No existing data found for update.",
        };
      }

      // Create a deep copy of the current data to avoid mutations
      const updatedData = cloneDeep(currentData);

      // Apply modifications
      if (changes.modified) {
        for (const section in changes.modified) {
          if (Array.isArray(changes.modified[section])) {
            changes.modified[section].forEach((modifiedItem: any) => {
              const index = updatedData[section].findIndex(
                (item: any) => item._id === modifiedItem._id
              );
              if (index !== -1) {
                if (isDebugMode) {
                  console.log(`🔄 Updating ${section} at index ${index}:`, modifiedItem);
                }
                updatedData[section][index] = {
                  ...updatedData[section][index],
                  ...modifiedItem,
                };
              }
            });
          } else {
            if (isDebugMode) {
              console.log(`🔄 Modifying ${section}:`, changes.modified[section]);
            }
            updatedData[section] = {
              ...updatedData[section],
              ...changes.modified[section],
            };
          }
        }
      }

      // Handle additions
      if (changes.added) {
        for (const section in changes.added) {
          if (Array.isArray(changes.added[section])) {
            if (isDebugMode) {
              console.log(`➕ Adding to ${section}:`, changes.added[section]);
            }
            updatedData[section].push(...changes.added[section]);
          }
        }
      }

      // Handle deletions
      if (changes.deleted) {
        for (const section in changes.deleted) {
          if (Array.isArray(changes.deleted[section])) {
            if (isDebugMode) {
              console.log(`🗑️ Deleting from ${section}:`, changes.deleted[section]);
            }
            changes.deleted[section].forEach((deletedItem: any) => {
              updatedData[section] = updatedData[section].filter(
                (item: any) => item._id !== deletedItem._id
              );
            });
          }
        }
      }

      // Save the updated data
      await this.dynamicRepo.saveFormData(section, updatedData);

      if (isDebugMode) {
        console.log(`✅ DynamicService: Data updated successfully`);
      }

      return {
        success: true,
        formData: updatedData,
        message: "Data updated successfully.",
        timestamp: new Date()
      };
    } catch (error) {
      console.error("❌ DynamicService: Failed to update data:", error);
      return {
        success: false,
        message: `Failed to update form data: ${error}`,
      };
    }
  }

  /**
   * Delete all form data
   */
  async deleteFormData(): Promise<UserServiceResponse> {
    const isDebugMode = typeof window !== 'undefined' && window.location.search.includes('debug=true');
    
    try {
      if (isDebugMode) {
        console.log(`🗑️ DynamicService: Deleting all form data...`);
      }

      await this.dynamicRepo.deleteDatabase();

      if (isDebugMode) {
        console.log(`✅ DynamicService: All form data deleted successfully`);
      }

      return { 
        success: true, 
        message: "Form data deleted successfully.",
        timestamp: new Date()
      };
    } catch (error) {
      console.error("❌ DynamicService: Error deleting form data:", error);
      return { 
        success: false, 
        message: `Failed to delete form data: ${error}` 
      };
    }
  }

 
}
export default DynamicService;
