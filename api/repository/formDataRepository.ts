import type { ApplicantFormValues } from "../interfaces/formDefinition";
import { indexedDBService } from "../service/indexedDBService";

/**
 * Repository for handling form data persistence using IndexedDB
 */
class DynamicRepository {
  private static readonly FORM_STORE = 'formData';
  private static readonly SECTIONS_STORE = 'sections';
  
  /**
   * Saves complete form data or a specific section to IndexedDB
   * @param section The section identifier
   * @param data The form data to save
   * @returns A promise that resolves to true on success
   */
  async saveFormData(
    section: string,
    data: ApplicantFormValues
  ): Promise<boolean> {
    return indexedDBService.executeDbOperation(async () => {
      // Store in the sections store for individual access
      const sectionsStore = await indexedDBService.getObjectStore(
        DynamicRepository.SECTIONS_STORE, 
        'readwrite'
      );
      
      const sectionRecord = {
        section,
        data,
        timestamp: new Date().toISOString()
      };
      
      return new Promise<boolean>((resolve, reject) => {
        const request = sectionsStore.put(sectionRecord);
        request.onsuccess = () => resolve(true);
        request.onerror = (event) => reject((event.target as IDBRequest).error);
      });
    });
  }

  /**
   * Retrieves form data for a specific section from IndexedDB
   * @param section The section identifier
   * @returns A promise that resolves to the section data or null if not found
   */
  async getFormData(section: string): Promise<ApplicantFormValues | null> {
    return indexedDBService.executeDbOperation(async () => {
      const sectionsStore = await indexedDBService.getObjectStore(
        DynamicRepository.SECTIONS_STORE
      );
      
      return new Promise<ApplicantFormValues | null>((resolve, reject) => {
        const request = sectionsStore.get(section);
        request.onsuccess = () => {
          const record = request.result;
          resolve(record ? record.data : null);
        };
        request.onerror = (event) => reject((event.target as IDBRequest).error);
      });
    });
  }
  
  /**
   * Retrieves all form sections data from IndexedDB
   * @returns A promise that resolves to an object with all section data
   */
  async getAllFormData(): Promise<Record<string, ApplicantFormValues> | null> {
    return indexedDBService.executeDbOperation(async () => {
      const sectionsStore = await indexedDBService.getObjectStore(
        DynamicRepository.SECTIONS_STORE
      );
      
      return new Promise<Record<string, ApplicantFormValues> | null>((resolve, reject) => {
        const request = sectionsStore.getAll();
        request.onsuccess = () => {
          const records = request.result;
          if (records && records.length > 0) {
            const result: Record<string, ApplicantFormValues> = {};
            records.forEach((record: any) => {
              result[record.section] = record.data;
            });
            resolve(result);
          } else {
            resolve(null);
          }
        };
        request.onerror = (event) => reject((event.target as IDBRequest).error);
      });
    });
  }

  /**
   * Deletes form data for a specific section from IndexedDB
   * @param section The section identifier
   * @returns A promise that resolves to true on success
   */
  async deleteFormData(section: string): Promise<boolean> {
    return indexedDBService.executeDbOperation(async () => {
      const sectionsStore = await indexedDBService.getObjectStore(
        DynamicRepository.SECTIONS_STORE, 
        'readwrite'
      );
      
      return new Promise<boolean>((resolve, reject) => {
        const request = sectionsStore.delete(section);
        request.onsuccess = () => resolve(true);
        request.onerror = (event) => reject((event.target as IDBRequest).error);
      });
    });
  }

  /**
   * Deletes the entire database, removing all form data
   * @returns A promise that resolves when the database is deleted
   */
  async deleteDatabase(): Promise<void> {
    return indexedDBService.deleteDatabase();
  }
}

export default DynamicRepository;
