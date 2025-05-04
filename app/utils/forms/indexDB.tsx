import { type ApplicantFormValues } from "api/interfaces/formDefinition";


const dbName = "UserFormDB";
const storeName = "FormData";

// Open or create an IndexedDB database and object store
function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(dbName, 1);
    request.onerror = (event) => reject((event.target as IDBOpenDBRequest).error);
    request.onsuccess = (event) => resolve((event.target as IDBOpenDBRequest).result);
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(storeName)) {
        db.createObjectStore(storeName, { keyPath: "key" });
      }
    };
  });
}

// Save or update form data in the IndexedDB store
async function saveFormData(section: string, data: ApplicantFormValues): Promise<boolean> {
  const db = await openDB();
  const transaction = db.transaction([storeName], "readwrite");
  const store = transaction.objectStore(storeName);
  return new Promise((resolve, reject) => {
    const request = store.put({ section, data });
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(true);
  });
}

// Retrieve form data from the IndexedDB store
async function getFormData(section: string): Promise<ApplicantFormValues | null> {
  const db = await openDB();
  const transaction = db.transaction([storeName], "readonly");
  const store = transaction.objectStore(storeName);
  return new Promise((resolve, reject) => {
    const request = store.get(section);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result ? request.result.data : null);
  });
}

// Delete form data from the IndexedDB store
async function deleteFormData(section: string): Promise<boolean> {
  const db = await openDB();
  const transaction = db.transaction([storeName], "readwrite");
  const store = transaction.objectStore(storeName);
  return new Promise((resolve, reject) => {
    const request = store.delete(section);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(true);
  });
}

export { openDB, saveFormData, getFormData, deleteFormData };
