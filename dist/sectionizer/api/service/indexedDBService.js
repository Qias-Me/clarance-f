/**
 * Configuration for the IndexedDB database
 */
const DB_CONFIG = {
    name: 'ClaranceFormDB',
    version: 1,
    stores: {
        formData: 'formData',
        metadata: 'metadata',
        sections: 'sections',
        userSettings: 'userSettings'
    }
};
/**
 * IndexedDB service for managing database connections and operations
 */
export class IndexedDBService {
    db = null;
    /**
     * Opens a connection to the IndexedDB database
     * @returns A promise that resolves to the database instance
     */
    async openDatabase() {
        // Check if we're in a browser environment
        if (typeof window === 'undefined' || !window.indexedDB) {
            throw new Error('IndexedDB is not available in this environment');
        }
        if (this.db) {
            return this.db;
        }
        return new Promise((resolve, reject) => {
            const request = window.indexedDB.open(DB_CONFIG.name, DB_CONFIG.version);
            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                this.setupDatabase(db);
            };
            request.onsuccess = (event) => {
                this.db = event.target.result;
                resolve(this.db);
            };
            request.onerror = (event) => {
                console.error('Error opening database:', event.target.error);
                reject(event.target.error);
            };
        });
    }
    /**
     * Sets up the database schema with necessary object stores
     * @param db The database instance to configure
     */
    setupDatabase(db) {
        // Create formData object store (for complete form data)
        if (!db.objectStoreNames.contains(DB_CONFIG.stores.formData)) {
            db.createObjectStore(DB_CONFIG.stores.formData, { keyPath: 'id' });
        }
        // Create sections object store (for individual section data)
        if (!db.objectStoreNames.contains(DB_CONFIG.stores.sections)) {
            const sectionsStore = db.createObjectStore(DB_CONFIG.stores.sections, { keyPath: 'section' });
            sectionsStore.createIndex('timestamp', 'timestamp', { unique: false });
        }
        // Create metadata object store (for application metadata)
        if (!db.objectStoreNames.contains(DB_CONFIG.stores.metadata)) {
            const metaStore = db.createObjectStore(DB_CONFIG.stores.metadata, { keyPath: 'key' });
            // Add version info
            const versionInfo = {
                key: 'dbVersion',
                value: DB_CONFIG.version,
                timestamp: new Date().toISOString()
            };
            metaStore.add(versionInfo);
        }
        // Create userSettings object store (for user preferences)
        if (!db.objectStoreNames.contains(DB_CONFIG.stores.userSettings)) {
            db.createObjectStore(DB_CONFIG.stores.userSettings, { keyPath: 'key' });
        }
    }
    /**
     * Closes the database connection
     */
    closeDatabase() {
        if (this.db) {
            this.db.close();
            this.db = null;
        }
    }
    /**
     * Gets the appropriate object store from a transaction
     * @param storeName The name of the object store to access
     * @param mode The transaction mode ('readonly' or 'readwrite')
     * @returns The requested object store
     */
    async getObjectStore(storeName, mode = 'readonly') {
        const db = await this.openDatabase();
        const transaction = db.transaction(storeName, mode);
        return transaction.objectStore(storeName);
    }
    /**
     * Executes a database operation with error handling
     * @param operation The function containing the database operation
     * @returns A promise that resolves to the operation result
     */
    async executeDbOperation(operation) {
        try {
            return await operation();
        }
        catch (error) {
            console.error('IndexedDB operation failed:', error);
            throw error;
        }
        finally {
            // Don't close the database here - it's often reused
            // Only close when the application no longer needs it
        }
    }
    /**
     * Checks if IndexedDB is available in the current browser
     * @returns True if IndexedDB is available, false otherwise
     */
    isIndexedDBAvailable() {
        return typeof window !== 'undefined' && 'indexedDB' in window;
    }
    /**
     * Deletes the entire database
     * @returns A promise that resolves when the database is deleted
     */
    async deleteDatabase() {
        if (typeof window === 'undefined' || !window.indexedDB) {
            throw new Error('IndexedDB is not available in this environment');
        }
        this.closeDatabase();
        return new Promise((resolve, reject) => {
            const request = window.indexedDB.deleteDatabase(DB_CONFIG.name);
            request.onsuccess = () => resolve();
            request.onerror = (event) => reject(event.target.error);
            request.onblocked = () => {
                console.warn('Database deletion blocked. Close all other tabs with this app open.');
                // Try to resolve anyway after warning
                resolve();
            };
        });
    }
    /**
     * Gets database statistics
     * @returns A promise that resolves to an object with database statistics
     */
    async getDatabaseStats() {
        const db = await this.openDatabase();
        const stats = {};
        // For each object store, count the number of records
        for (const storeName of Array.from(db.objectStoreNames)) {
            const store = db.transaction(storeName).objectStore(storeName);
            // Get count of items in this store
            const countRequest = store.count();
            const count = await new Promise((resolve) => {
                countRequest.onsuccess = () => resolve(countRequest.result);
                countRequest.onerror = () => resolve(0);
            });
            stats[storeName] = count;
        }
        return stats;
    }
}
// Export a singleton instance
export const indexedDBService = new IndexedDBService();
