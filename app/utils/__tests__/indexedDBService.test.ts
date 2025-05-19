/**
 * Tests for the IndexedDB service
 * 
 * These tests validate that the IndexedDB service correctly stores and retrieves form data.
 * Uses a mock IndexedDB implementation for testing.
 */

import {
  saveFormSection,
  getFormSection,
  getAllFormSections,
  removeFormSection,
  clearAllFormData
} from '../indexedDBService';

// Mock IndexedDB implementation
const mockIDBStore = {
  get: jest.fn(),
  put: jest.fn(),
  delete: jest.fn(),
  clear: jest.fn(),
  getAll: jest.fn()
};

const mockIDBTransaction = {
  objectStore: jest.fn().mockReturnValue(mockIDBStore),
  oncomplete: null
};

const mockIDBDatabase = {
  transaction: jest.fn().mockReturnValue(mockIDBTransaction),
  close: jest.fn()
};

// Mock some request results
const mockSuccessEvent = { target: { result: { data: { field: 'value' } } } };
const mockEmptyEvent = { target: { result: null } };
const mockMultipleResults = { 
  target: { 
    result: [
      { sectionKey: 'section1', data: { field1: 'value1' } },
      { sectionKey: 'section2', data: { field2: 'value2' } }
    ] 
  } 
};

// Mock the indexedDB open function
global.indexedDB = {
  open: jest.fn().mockReturnValue({
    result: mockIDBDatabase,
    onupgradeneeded: null,
    onsuccess: null,
    onerror: null
  })
} as any;

// Helper to trigger success handlers
const triggerSuccess = (request: any, event = {}) => {
  request.onsuccess && request.onsuccess(event);
  mockIDBTransaction.oncomplete && mockIDBTransaction.oncomplete();
};

describe('IndexedDB Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  describe('saveFormSection', () => {
    it('should save form section data to IndexedDB', async () => {
      // Set up mocks
      mockIDBStore.put.mockImplementation((data) => {
        const request = {};
        setTimeout(() => triggerSuccess(request), 0);
        return request;
      });
      
      // Call the function
      const result = await saveFormSection('testSection', { test: 'data' });
      
      // Check that it saved correctly
      expect(result).toBe(true);
      expect(mockIDBStore.put).toHaveBeenCalledTimes(1);
      expect(mockIDBStore.put.mock.calls[0][0]).toMatchObject({
        sectionKey: 'testSection',
        data: { test: 'data' }
      });
    });
  });
  
  describe('getFormSection', () => {
    it('should retrieve form section data from IndexedDB', async () => {
      // Set up mocks
      mockIDBStore.get.mockImplementation(() => {
        const request = {};
        setTimeout(() => triggerSuccess(request, mockSuccessEvent), 0);
        return request;
      });
      
      // Call the function
      const result = await getFormSection('testSection');
      
      // Check that it retrieved correctly
      expect(result).toEqual({ field: 'value' });
      expect(mockIDBStore.get).toHaveBeenCalledTimes(1);
      expect(mockIDBStore.get).toHaveBeenCalledWith('testSection');
    });
    
    it('should return null if section does not exist', async () => {
      // Set up mocks
      mockIDBStore.get.mockImplementation(() => {
        const request = {};
        setTimeout(() => triggerSuccess(request, mockEmptyEvent), 0);
        return request;
      });
      
      // Call the function
      const result = await getFormSection('nonExistentSection');
      
      // Check that it handles missing data correctly
      expect(result).toBeNull();
    });
  });
  
  describe('getAllFormSections', () => {
    it('should retrieve all form sections from IndexedDB', async () => {
      // Set up mocks
      mockIDBStore.getAll.mockImplementation(() => {
        const request = {};
        setTimeout(() => triggerSuccess(request, mockMultipleResults), 0);
        return request;
      });
      
      // Call the function
      const result = await getAllFormSections();
      
      // Check that it retrieved all sections correctly
      expect(result).toEqual({
        section1: { field1: 'value1' },
        section2: { field2: 'value2' }
      });
      expect(mockIDBStore.getAll).toHaveBeenCalledTimes(1);
    });
    
    it('should return null if no sections exist', async () => {
      // Set up mocks
      mockIDBStore.getAll.mockImplementation(() => {
        const request = {};
        setTimeout(() => triggerSuccess(request, { target: { result: [] } }), 0);
        return request;
      });
      
      // Call the function
      const result = await getAllFormSections();
      
      // Check that it handles no data correctly
      expect(result).toBeNull();
    });
  });
  
  describe('removeFormSection', () => {
    it('should remove a form section from IndexedDB', async () => {
      // Set up mocks
      mockIDBStore.delete.mockImplementation(() => {
        const request = {};
        setTimeout(() => triggerSuccess(request), 0);
        return request;
      });
      
      // Call the function
      const result = await removeFormSection('testSection');
      
      // Check that it deleted correctly
      expect(result).toBe(true);
      expect(mockIDBStore.delete).toHaveBeenCalledTimes(1);
      expect(mockIDBStore.delete).toHaveBeenCalledWith('testSection');
    });
  });
  
  describe('clearAllFormData', () => {
    it('should clear all form data from IndexedDB', async () => {
      // Set up mocks
      mockIDBStore.clear.mockImplementation(() => {
        const request = {};
        setTimeout(() => triggerSuccess(request), 0);
        return request;
      });
      
      // Call the function
      const result = await clearAllFormData();
      
      // Check that it cleared correctly
      expect(result).toBe(true);
      expect(mockIDBStore.clear).toHaveBeenCalledTimes(1);
    });
  });
}); 