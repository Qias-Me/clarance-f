import type { ApplicantFormValues } from "../interfaces/formDefinition2.0";

class DynamicRepository {
  private dbName: string;
  private storeName: string;

  constructor() {
    this.dbName = "UserFormDB";
    this.storeName = "FormData";
  }

  async openDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, 1);
      request.onerror = (event) =>
        reject((event.target as IDBOpenDBRequest).error);
      request.onsuccess = (event) =>
        resolve((event.target as IDBOpenDBRequest).result);
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(this.storeName)) {
          db.createObjectStore(this.storeName, { keyPath: "section" });
        }
      };
    });
  }

  async saveFormData(
    section: string,
    data: ApplicantFormValues
  ): Promise<boolean> {
    const db = await this.openDB();
    const transaction = db.transaction(["FormData"], "readwrite");
    const store = transaction.objectStore("FormData");
    return new Promise((resolve, reject) => {
      const request = store.put({ section, data });
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(true);
    });
  }

  async getFormData(section: string): Promise<ApplicantFormValues | null> {
    const db = await this.openDB();
    const transaction = db.transaction(["FormData"], "readonly");
    const store = transaction.objectStore("FormData");
    return new Promise((resolve, reject) => {
      const request = store.get(section);
      request.onerror = () => reject(request.error);
      request.onsuccess = () =>
        resolve(request.result ? request.result.data : null);
    });
  }

  async deleteDatabase(): Promise<boolean> {
    return new Promise((resolve, reject) => {
      if (!window.indexedDB) {
        return reject(
          new Error(
            "Your browser doesn't support a stable version of IndexedDB."
          )
        );
      }

      const request = indexedDB.deleteDatabase(this.dbName);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(true);
      request.onblocked = () =>
        reject(
          new Error(
            "Database deletion blocked. Close all tabs or windows that have this database open."
          )
        );
    });
  }
  
}

export default DynamicRepository;
