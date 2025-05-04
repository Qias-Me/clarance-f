class LocalStorageUtil {
    // Check if localStorage is available
    static isAvailable(): boolean {
      try {
        const testKey = "__test__";
        window.localStorage.setItem(testKey, testKey);
        window.localStorage.removeItem(testKey);
        return true;
      } catch (e) {
        return false;
      }
    }
  
    // Safely get an item from localStorage
    static getItem(key: string): string | null {
      if (LocalStorageUtil.isAvailable()) {
        return window.localStorage.getItem(key);
      }
      return null;
    }
  
    // Safely set an item in localStorage
    static setItem(key: string, value: string): void {
      if (LocalStorageUtil.isAvailable()) {
        window.localStorage.setItem(key, value);
      }
    }
  
    // Safely remove an item from localStorage
    static removeItem(key: string): void {
      if (LocalStorageUtil.isAvailable()) {
        window.localStorage.removeItem(key);
      }
    }
  }
  
  export {LocalStorageUtil}