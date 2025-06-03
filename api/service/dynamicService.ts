import  {type ApplicantFormValues } from "../interfaces/formDefinition";
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
  private readonly FORM_DATA_KEY = 'complete-form';
  private readonly METADATA_KEY = 'form-metadata';
  private readonly SECTION_PREFIX = 'section-';

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

      // Save metadata
      const metadata: FormDataMetadata = {
        lastSaved: timestamp,
        sections: Object.keys(formData).filter(key => formData[key as keyof ApplicantFormValues] !== undefined),
        version: '2.0',
        sectionCount: Object.keys(formData).length
      };
      await this.dynamicRepo.saveFormData(this.METADATA_KEY, metadata as any);

      if (isDebugMode) {
        console.log(`✅ DynamicService: Form data saved successfully`);
        console.log(`   📊 Sections saved: ${metadata.sections.length}`);
        console.log(`   📋 Section list: ${metadata.sections.join(', ')}`);
      }

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

        // Load and validate metadata
        try {
          const metadata = await this.dynamicRepo.getFormData(this.METADATA_KEY) as FormDataMetadata | null;
          if (metadata && isDebugMode) {
            console.log(`   📊 Metadata: Last saved ${metadata.lastSaved}, Version ${metadata.version}`);
          }
        } catch (metaError) {
          console.warn("⚠️ DynamicService: Could not load metadata:", metaError);
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
   * Save individual section data
   */
  async saveSectionData(sectionId: string, sectionData: any): Promise<UserServiceResponse> {
    const key = `${this.SECTION_PREFIX}${sectionId}`;
    const isDebugMode = typeof window !== 'undefined' && window.location.search.includes('debug=true');
    
    try {
      const timestamp = new Date();
      const dataSize = JSON.stringify(sectionData).length;

      if (isDebugMode) {
        console.log(`💾 DynamicService: Saving section data...`);
        console.log(`   📋 Section: ${sectionId}`);
        console.log(`   🔑 Key: ${key}`);
        console.log(`   📊 Data size: ${dataSize} bytes`);
      }

      await this.dynamicRepo.saveFormData(key, sectionData);

      if (isDebugMode) {
        console.log(`✅ DynamicService: Section data saved successfully`);
      }

      return {
        success: true,
        message: `Section ${sectionId} saved successfully.`,
        timestamp,
        size: dataSize
      };
    } catch (error) {
      console.error(`❌ DynamicService: Error saving section ${sectionId}:`, error);
      return {
        success: false,
        message: `Failed to save section ${sectionId}: ${error}`,
      };
    }
  }

  /**
   * Load individual section data
   */
  async loadSectionData(sectionId: string): Promise<UserServiceResponse> {
    const key = `${this.SECTION_PREFIX}${sectionId}`;
    const isDebugMode = typeof window !== 'undefined' && window.location.search.includes('debug=true');
    
    try {
      if (isDebugMode) {
        console.log(`📂 DynamicService: Loading section data...`);
        console.log(`   📋 Section: ${sectionId}`);
        console.log(`   🔑 Key: ${key}`);
      }

      const sectionData = await this.dynamicRepo.getFormData(key);

      if (sectionData) {
        const dataSize = JSON.stringify(sectionData).length;

        if (isDebugMode) {
          console.log(`✅ DynamicService: Section data loaded successfully`);
          console.log(`   📊 Data size: ${dataSize} bytes`);
        }

        return {
          success: true,
          formData: sectionData,
          message: `Section ${sectionId} retrieved successfully.`,
          size: dataSize
        };
      } else {
        if (isDebugMode) {
          console.log(`📭 DynamicService: No data found for section: ${sectionId}`);
        }
        return {
          success: false,
          message: `No data found for section ${sectionId}.`
        };
      }
    } catch (error) {
      console.error(`❌ DynamicService: Error loading section ${sectionId}:`, error);
      return {
        success: false,
        message: `Failed to load section ${sectionId}: ${error}`,
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

  /**
   * Get form data statistics
   */
  async getFormDataStats(): Promise<{
    totalSize: number;
    sectionCount: number;
    lastSaved?: Date;
    sections: string[];
  }> {
    try {
      const formData = await this.dynamicRepo.getFormData(this.FORM_DATA_KEY);
      const metadata = await this.dynamicRepo.getFormData(this.METADATA_KEY) as FormDataMetadata | null;

      if (formData) {
        const totalSize = JSON.stringify(formData).length;
        const sections = Object.keys(formData).filter(key => formData[key as keyof ApplicantFormValues] !== undefined);

        return {
          totalSize,
          sectionCount: sections.length,
          lastSaved: metadata?.lastSaved,
          sections
        };
      }

      return {
        totalSize: 0,
        sectionCount: 0,
        sections: []
      };
    } catch (error) {
      console.error("Error getting form data stats:", error);
      return {
        totalSize: 0,
        sectionCount: 0,
        sections: []
      };
    }
  }

  /**
   * Check if form data exists
   */
  async hasFormData(): Promise<boolean> {
    try {
      const formData = await this.dynamicRepo.getFormData(this.FORM_DATA_KEY);
      return formData !== null && formData !== undefined;
    } catch (error) {
      console.error("Error checking form data existence:", error);
      return false;
    }
  }
}

export default DynamicService;
