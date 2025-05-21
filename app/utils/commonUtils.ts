/**
 * Common Utilities Module
 * 
 * This module provides a consolidated set of utility functions for common operations
 * across the application.
 */

import pkg from "lodash";

/**
 * General utility functions for the application
 */
export class Utils {
  /**
   * Formats a date to YYYY-MM-DD format for input fields
   * @param date Date or date string to format
   * @returns Formatted date string
   */
  static formatDateToInputValue(date: Date | string): string {
    if (typeof date === "string") return date; // Assume already in YYYY-MM-DD format
    return date.toISOString().split("T")[0];
  }

  /**
   * Generates a UUID using the crypto API
   * @returns A random UUID
   */
  static generateUUID(): string {
    return ([1e7] as any + (-1e3 as any) + (-4e3) + (-8e3) + (-1e11)).replace(/[018]/g, c =>
      (parseInt(c, 16) ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> parseInt(c, 16) / 4).toString(16)
    );
  }

  /**
   * Determines if a field is read-only based on naming convention
   * @param key Field name to check
   * @returns True if the field should be read-only
   */
  static isReadOnlyField(key: string): boolean {
    return key.endsWith("_id") || key === "createdAt" || key === "updatedAt";
  }

  /**
   * Checks if a value is valid (not empty)
   * @param path Path to the field (for context)
   * @param value Value to check
   * @returns True if the value is considered valid
   */
  static isValidValue(path: string, value: any): boolean {
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
  }

  /**
   * Creates a higher-order function for handling input changes in forms
   */
  static createInputChangeHandler(formData: any, setFormData: Function, onChange?: Function, updateField?: Function) {
    return (path: string, value: any) => {
      const { set, cloneDeep } = pkg;
      const updatedFormData = cloneDeep(formData);
      set(updatedFormData, path, value);
      
      setFormData(updatedFormData);
      if (onChange) {
        onChange(updatedFormData);
      }
      if (updateField) {
        updateField(path, value);
      }
    };
  }

  /**
   * Creates a higher-order function for adding entries to arrays in forms
   */
  static createAddEntryHandler(formData: any, setFormData: Function, onChange: Function, updateField: Function) {
    return (path: string, defaultItem: any) => {
      const { set, cloneDeep, get } = pkg;
      const updatedFormData = cloneDeep(formData);
      const list = get(updatedFormData, path, []);
      list.push(defaultItem);
      set(updatedFormData, path, list);
      setFormData(updatedFormData);
      onChange(updatedFormData);
      updateField(path, list);
    };
  }

  /**
   * Creates a higher-order function for removing entries from arrays in forms
   */
  static createRemoveEntryHandler(formData: any, setFormData: Function, onChange: Function, updateField: Function) {
    return (path: string, index: number) => {
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
  }
}

/**
 * Utility for safely interacting with localStorage
 */
export class StorageUtils {
  /**
   * Checks if localStorage is available in the current environment
   * @returns True if localStorage is available
   */
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

  /**
   * Safely gets an item from localStorage
   * @param key The key to retrieve
   * @returns The stored value or null if not found
   */
  static getItem(key: string): string | null {
    if (StorageUtils.isAvailable()) {
      return window.localStorage.getItem(key);
    }
    return null;
  }

  /**
   * Safely sets an item in localStorage
   * @param key The key to set
   * @param value The value to store
   */
  static setItem(key: string, value: string): void {
    if (StorageUtils.isAvailable()) {
      window.localStorage.setItem(key, value);
    }
  }

  /**
   * Safely removes an item from localStorage
   * @param key The key to remove
   */
  static removeItem(key: string): void {
    if (StorageUtils.isAvailable()) {
      window.localStorage.removeItem(key);
    }
  }

  /**
   * Gets an object from localStorage with JSON parsing
   * @param key The key to retrieve
   * @returns The parsed object or null
   */
  static getObject<T>(key: string): T | null {
    const json = StorageUtils.getItem(key);
    if (json) {
      try {
        return JSON.parse(json) as T;
      } catch (e) {
        console.error(`Failed to parse stored JSON for key ${key}:`, e);
      }
    }
    return null;
  }

  /**
   * Sets an object in localStorage with JSON stringification
   * @param key The key to set
   * @param value The object to store
   */
  static setObject<T>(key: string, value: T): void {
    try {
      const json = JSON.stringify(value);
      StorageUtils.setItem(key, json);
    } catch (e) {
      console.error(`Failed to stringify object for key ${key}:`, e);
    }
  }
}

// Export a consolidated utility object for backward compatibility
export default {
  ...Utils,
  storage: StorageUtils
}; 