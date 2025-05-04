import  {type ApplicantFormValues } from "../interfaces/formDefinition";
import DynamicRepository from "../repository/formDataRepository";
import cloneDeep from "lodash/cloneDeep";

interface UserServiceResponse {
  success: boolean;
  formData?: ApplicantFormValues;
  message: string;
}

class DynamicService {
  private dynamicRepo: DynamicRepository;

  constructor() {
    this.dynamicRepo = new DynamicRepository();
  }

  async saveUserFormData(
    section: string,
    formData: ApplicantFormValues
  ): Promise<UserServiceResponse> {
    try {
      await this.dynamicRepo.saveFormData(section, formData); // Ensure saveFormData can handle Partial<ApplicantFormValues>
      console.log("Form data saved successfully for section", section);
      return { success: true, message: "Form data saved successfully." };
    } catch (error) {
      console.error("Error saving form data:", error);
      return {
        success: false,
        message: "Failed to save form data due to a client-side error.",
      };
    }
  }

  async loadUserFormData(key: string): Promise<UserServiceResponse> {
    try {
      const formData: ApplicantFormValues | null =
        await this.dynamicRepo.getFormData(key);

      // console.log(formData, "formData")

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

  // async deleteUserFormData(section: string): Promise<UserServiceResponse> {
  //   try {
  //     await this.dynamicRepo.deleteFormData(section);
  //     console.log("Form data deleted successfully for section", section);
  //     return { success: true, message: "Form data deleted successfully." };
  //   } catch (error) {
  //     console.error("Error deleting form data:", error);
  //     return { success: false, message: "Failed to delete form data." };
  //   }
  // }

  async updateUserData(
    section: string,
    changes: any
  ): Promise<UserServiceResponse> {
    try {
      const currentData: ApplicantFormValues | null =
        await this.dynamicRepo.getFormData(section);

      if (!currentData) {
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
                console.log(
                  `Updating ${section} at index ${index}:`,
                  modifiedItem
                );
                updatedData[section][index] = {
                  ...updatedData[section][index],
                  ...modifiedItem,
                };
              }
            });
          } else {
            console.log(`Modifying ${section}:`, changes.modified[section]);
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
            console.log(`Adding to ${section}:`, changes.added[section]);
            updatedData[section].push(...changes.added[section]);
          }
        }
      }

      // Handle deletions
      if (changes.deleted) {
        for (const section in changes.deleted) {
          if (Array.isArray(changes.deleted[section])) {
            console.log(`Deleting from ${section}:`, changes.deleted[section]);
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

      return {
        success: true,
        formData: updatedData,
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

  async deleteFormData(): Promise<UserServiceResponse> {
    try {
      await this.dynamicRepo.deleteDatabase();
      console.log("Form data deleted successfully");
      return { success: true, message: "Form data deleted successfully." };
    } catch (error) {
      console.error("Error deleting form data:", error);
      return { success: false, message: "Failed to delete form data." };
    }
  }
}

export default DynamicService;
