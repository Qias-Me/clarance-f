import type { ApplicantFormValues } from "../interfaces/formDefinition";
import DynamicRepository from "../repository/formDataRepository";
import { indexedDBService } from "./indexedDBService";
import cloneDeep from "lodash/cloneDeep";
import { debounce } from "lodash";

/**
 * Response interface for service methods
 */
interface UserServiceResponse {
  success: boolean;
  formData?: ApplicantFormValues;
  message: string;
}

/**
 * Change request interface for updating form data
 */
interface FormDataChangeRequest {
  modified?: Record<string, any>;
  added?: Record<string, any[]>;
  deleted?: Record<string, any[]>;
}

/**
 * Type to allow dynamic access to form values
 * This helps with type-safe dynamic property access
 */
type DynamicFormValues = ApplicantFormValues & Record<string, any>;

/**
 * Service for managing form data with persistence through IndexedDB
 */
class DynamicService {
  private dynamicRepo: DynamicRepository;
  private saveDebounceDelay = 500; // milliseconds

  constructor() {
    this.dynamicRepo = new DynamicRepository();
  }

  /**
   * Creates a debounced version of a save operation to prevent excessive writes
   * @param section The section to save
   * @param data The data to save
   * @param callback Optional callback to execute after saving
   * @returns A promise that resolves when the operation is complete
   */
  private debouncedSave = debounce(
    async (
      section: string, 
      data: ApplicantFormValues,
      callback?: (success: boolean) => void
    ): Promise<void> => {
      try {
        await this.dynamicRepo.saveFormData(section, data);
        console.log(`Form data saved successfully for section: ${section}`);
        if (callback) callback(true);
      } catch (error) {
        console.error(`Error saving form data for section ${section}:`, error);
        if (callback) callback(false);
      }
    },
    this.saveDebounceDelay,
    { maxWait: 2000 }
  );

  /**
   * Saves user form data for a specific section with debouncing
   * @param section The section to save
   * @param formData The form data to save
   * @returns A promise that resolves to the operation result
   */
  async saveUserFormData(
    section: string,
    formData: ApplicantFormValues
  ): Promise<UserServiceResponse> {
    try {
      // Make a deep copy to prevent reference issues
      const dataCopy = cloneDeep(formData);
      
      // Start the debounced save operation
      this.debouncedSave(section, dataCopy);
      
      // Return immediately for better UI responsiveness
      return { 
        success: true, 
        message: "Form data save initiated successfully." 
      };
    } catch (error) {
      console.error("Error preparing form data for save:", error);
      return {
        success: false,
        message: "Failed to save form data due to a client-side error.",
      };
    }
  }

  /**
   * Saves user form data for a specific section with immediate execution (no debouncing)
   * @param section The section to save
   * @param formData The form data to save
   * @returns A promise that resolves to the operation result
   */
  async saveUserFormDataImmediate(
    section: string,
    formData: ApplicantFormValues
  ): Promise<UserServiceResponse> {
    try {
      // Make a deep copy to prevent reference issues
      const dataCopy = cloneDeep(formData);
      
      // Cancel any pending debounced saves for this section
      this.debouncedSave.cancel();
      
      // Save immediately
      await this.dynamicRepo.saveFormData(section, dataCopy);
      
      return { 
        success: true, 
        message: "Form data saved successfully." 
      };
    } catch (error) {
      console.error("Error saving form data:", error);
      return {
        success: false,
        message: "Failed to save form data due to a client-side error.",
      };
    }
  }

  /**
   * Loads user form data for a specific section
   * @param key The section key to load
   * @returns A promise that resolves to the operation result with form data if successful
   */
  async loadUserFormData(key: string): Promise<UserServiceResponse> {
    try {
      const formData: ApplicantFormValues | null =
        await this.dynamicRepo.getFormData(key);

      if (formData) {
        console.log("Form data retrieved successfully for section", key);
        return {
          success: true,
          formData,
          message: "Form data retrieved successfully.",
        };
      } else {
        console.log("No data found for section", key);
        return { success: false, message: "No form data found." };
      }
    } catch (error) {
      console.error("Error retrieving form data:", error);
      return {
        success: false,
        message: "Failed to retrieve form data from database.",
      };
    }
  }

  /**
   * Loads all user form data across all sections
   * @returns A promise that resolves to the operation result with all form data if successful
   */
  async loadAllUserFormData(): Promise<UserServiceResponse & { allData?: Record<string, ApplicantFormValues> }> {
    try {
      const allData = await this.dynamicRepo.getAllFormData();

      if (allData) {
        console.log("All form data retrieved successfully");
        return {
          success: true,
          allData,
          message: "All form data retrieved successfully.",
        };
      } else {
        console.log("No form data found");
        return { success: false, message: "No form data found." };
      }
    } catch (error) {
      console.error("Error retrieving all form data:", error);
      return {
        success: false,
        message: "Failed to retrieve form data from database.",
      };
    }
  }

  /**
   * Deletes user form data for a specific section
   * @param section The section to delete
   * @returns A promise that resolves to the operation result
   */
  async deleteUserFormData(section: string): Promise<UserServiceResponse> {
    try {
      await this.dynamicRepo.deleteFormData(section);
      console.log("Form data deleted successfully for section", section);
      return { success: true, message: "Form data deleted successfully." };
    } catch (error) {
      console.error("Error deleting form data:", error);
      return { success: false, message: "Failed to delete form data." };
    }
  }

  /**
   * Updates user form data with granular changes
   * @param section The section to update
   * @param changes The changes to apply (modified, added, deleted)
   * @returns A promise that resolves to the operation result
   */
  async updateUserData(
    section: string,
    changes: FormDataChangeRequest
  ): Promise<UserServiceResponse> {
    try {
      const currentData = await this.dynamicRepo.getFormData(section);

      if (!currentData) {
        return {
          success: false,
          message: "No existing data found for update.",
        };
      }

      // Create a deep copy of the current data to avoid mutations
      // Cast to DynamicFormValues to allow dynamic property access
      const updatedData = cloneDeep(currentData) as DynamicFormValues;

      // Apply modifications
      if (changes.modified) {
        for (const sectionKey in changes.modified) {
          if (Array.isArray(changes.modified[sectionKey])) {
            // Ensure the section array exists in the data
            if (!Array.isArray(updatedData[sectionKey])) {
              updatedData[sectionKey] = [];
            }
            
            changes.modified[sectionKey].forEach((modifiedItem: any) => {
              const index = updatedData[sectionKey].findIndex(
                (item: any) => item._id === modifiedItem._id
              );
              if (index !== -1) {
                console.log(
                  `Updating ${sectionKey} at index ${index}:`,
                  modifiedItem
                );
                updatedData[sectionKey][index] = {
                  ...updatedData[sectionKey][index],
                  ...modifiedItem,
                };
              }
            });
          } else {
            console.log(`Modifying ${sectionKey}:`, changes.modified[sectionKey]);
            updatedData[sectionKey] = {
              ...updatedData[sectionKey],
              ...changes.modified[sectionKey],
            };
          }
        }
      }

      // Handle additions
      if (changes.added) {
        for (const sectionKey in changes.added) {
          if (Array.isArray(changes.added[sectionKey])) {
            console.log(`Adding to ${sectionKey}:`, changes.added[sectionKey]);
            
            // Initialize the array if it doesn't exist
            if (!Array.isArray(updatedData[sectionKey])) {
              updatedData[sectionKey] = [];
            }
            
            updatedData[sectionKey].push(...changes.added[sectionKey]);
          }
        }
      }

      // Handle deletions
      if (changes.deleted) {
        for (const sectionKey in changes.deleted) {
          if (Array.isArray(changes.deleted[sectionKey]) && Array.isArray(updatedData[sectionKey])) {
            console.log(`Deleting from ${sectionKey}:`, changes.deleted[sectionKey]);
            changes.deleted[sectionKey].forEach((deletedItem: any) => {
              updatedData[sectionKey] = updatedData[sectionKey].filter(
                (item: any) => item._id !== deletedItem._id
              );
            });
          }
        }
      }

      // Save the updated data (cast back to ApplicantFormValues)
      await this.dynamicRepo.saveFormData(section, updatedData as ApplicantFormValues);

      return {
        success: true,
        formData: updatedData as ApplicantFormValues,
        message: "Data updated successfully.",
      };
    } catch (error) {
      console.error("Failed to update data in IndexedDB:", error);

      return {
        success: false,
        message: "Failed to update form data due to a client-side error.",
      };
    }
  }

  /**
   * Deletes all form data by removing the database
   * @returns A promise that resolves to the operation result
   */
  async deleteAllFormData(): Promise<UserServiceResponse> {
    try {
      await this.dynamicRepo.deleteDatabase();
      console.log("All form data deleted successfully");
      return { success: true, message: "All form data deleted successfully." };
    } catch (error) {
      console.error("Error deleting all form data:", error);
      return { success: false, message: "Failed to delete form data." };
    }
  }

  /**
   * Gets IndexedDB database statistics
   * @returns A promise that resolves to database statistics
   */
  async getStorageStats(): Promise<{ success: boolean; stats?: Record<string, number>; message: string }> {
    try {
      const stats = await indexedDBService.getDatabaseStats();
      return {
        success: true,
        stats,
        message: "Storage statistics retrieved successfully."
      };
    } catch (error) {
      console.error("Error getting storage statistics:", error);
      return {
        success: false,
        message: "Failed to retrieve storage statistics."
      };
    }
  }
}

export default DynamicService;
