/**
 * Demo component for showing form persistence with IndexedDB
 * 
 * This component demonstrates how form data is automatically persisted to IndexedDB
 * and can be manually saved/loaded using the useFormPersistence hook.
 */

import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { updateField } from '../../state/form/formActions';
import { useFormPersistence } from '../../state/hooks/useFormPersistence';
import type { RootState } from '../../state/store';

const FormPersistenceDemo: React.FC = () => {
  const dispatch = useDispatch();
  const [message, setMessage] = useState<string>('');
  const [showMessage, setShowMessage] = useState<boolean>(false);
  
  // Get the form persistence hooks
  const { saveSection, loadSection, clearAllData, isSupported } = useFormPersistence();
  
  // Get the demo form data from Redux store
  const demoFormData = useSelector((state: RootState) => 
    state.form.sections.demoForm || {});
  
  // Initialize form data if it doesn't exist
  useEffect(() => {
    if (!demoFormData.name) {
      dispatch({
        type: 'form/initializeSection',
        payload: {
          sectionPath: 'demoForm',
          data: {
            name: '',
            email: '',
            message: '',
            agree: false
          }
        }
      });
    }
  }, [demoFormData, dispatch]);
  
  // Helper to show temporary messages
  const showTemporaryMessage = (msg: string) => {
    setMessage(msg);
    setShowMessage(true);
    setTimeout(() => setShowMessage(false), 3000);
  };
  
  // Handle field changes - these will be automatically saved by middleware
  const handleChange = (field: string, value: any) => {
    dispatch(updateField({
      sectionPath: 'demoForm',
      fieldPath: field,
      value
    }));
  };
  
  // Handle manual save button click
  const handleManualSave = async () => {
    const result = await saveSection('demoForm', demoFormData);
    if (result) {
      showTemporaryMessage('Form data manually saved to IndexedDB!');
    } else {
      showTemporaryMessage('Failed to save form data');
    }
  };
  
  // Handle manual load button click
  const handleManualLoad = async () => {
    const data = await loadSection('demoForm');
    if (data) {
      showTemporaryMessage('Form data loaded from IndexedDB!');
    } else {
      showTemporaryMessage('No saved data found');
    }
  };
  
  // Handle clear data button click
  const handleClearData = async () => {
    const result = await clearAllData();
    if (result) {
      showTemporaryMessage('All form data cleared from IndexedDB!');
    } else {
      showTemporaryMessage('Failed to clear form data');
    }
  };
  
  // Show notice if IndexedDB is not supported
  if (!isSupported()) {
    return (
      <div className="p-4 bg-red-100 border border-red-300 rounded-md">
        <h2 className="text-lg font-bold text-red-600">Storage Not Supported</h2>
        <p>Your browser does not support IndexedDB, which is required for form persistence.</p>
      </div>
    );
  }
  
  return (
    <div className="p-6 bg-white border rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4">Form Persistence Demo</h2>
      <p className="mb-4 text-gray-600">
        This form demonstrates IndexedDB persistence. Form data is automatically saved as you type,
        and will persist across page refreshes.
      </p>
      
      {/* Message banner */}
      {showMessage && (
        <div className="p-3 bg-green-100 text-green-700 rounded-md mb-4">
          {message}
        </div>
      )}
      
      {/* Demo form */}
      <form className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium mb-1">Name</label>
          <input
            id="name"
            type="text"
            className="w-full p-2 border rounded"
            value={demoFormData.name || ''}
            onChange={(e) => handleChange('name', e.target.value)}
          />
        </div>
        
        <div>
          <label htmlFor="email" className="block text-sm font-medium mb-1">Email</label>
          <input
            id="email"
            type="email"
            className="w-full p-2 border rounded"
            value={demoFormData.email || ''}
            onChange={(e) => handleChange('email', e.target.value)}
          />
        </div>
        
        <div>
          <label htmlFor="message" className="block text-sm font-medium mb-1">Message</label>
          <textarea
            id="message"
            className="w-full p-2 border rounded"
            rows={3}
            value={demoFormData.message || ''}
            onChange={(e) => handleChange('message', e.target.value)}
          />
        </div>
        
        <div className="flex items-center">
          <input
            id="agree"
            type="checkbox"
            className="mr-2"
            checked={demoFormData.agree || false}
            onChange={(e) => handleChange('agree', e.target.checked)}
          />
          <label htmlFor="agree" className="text-sm">
            I agree to the terms and conditions
          </label>
        </div>
      </form>
      
      {/* Manual persistence buttons */}
      <div className="flex space-x-4 mt-6">
        <button
          type="button"
          onClick={handleManualSave}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Manual Save
        </button>
        
        <button
          type="button"
          onClick={handleManualLoad}
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
        >
          Manual Load
        </button>
        
        <button
          type="button"
          onClick={handleClearData}
          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Clear Saved Data
        </button>
      </div>
      
      <div className="mt-4 text-sm text-gray-500">
        <p>Note: Form data is automatically saved as you type. Manual save/load is for demonstration purposes.</p>
        <p>Try refreshing the page - your form data should persist!</p>
      </div>
    </div>
  );
};

export default FormPersistenceDemo; 