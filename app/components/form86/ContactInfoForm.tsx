import React, { useEffect, useState } from 'react';
import { useContactInfo, ContactInfoActionType } from '../../state/contexts/sections/contactInfoContext';
import { 
  validateEmail, 
  validatePhoneNumber, 
  formatPhoneNumber, 
  detectPhoneFormat,
  getEmailFieldAccessibilityProps,
  getPhoneFieldAccessibilityProps,
  PhoneFormat
} from '../../utils/contactHandlers';
import type { ContactNumber } from 'api/interfaces/sections/contact';

interface ContactInfoFormProps {
  onSave?: () => void;
  readOnly?: boolean;
}

const ContactInfoForm: React.FC<ContactInfoFormProps> = ({ 
  onSave, 
  readOnly = false 
}) => {
  const { state, dispatch } = useContactInfo();
  
  // Local validation state
  const [errors, setErrors] = useState({
    homeEmail: '',
    workEmail: '',
    contactNumbers: {} as Record<number, Record<string, string>>
  });
  
  // Initialize phone number errors structure
  useEffect(() => {
    const phoneErrors: Record<number, Record<string, string>> = {};
    state.contactNumbers.forEach(number => {
      phoneErrors[number._id] = { phoneNumber: '' };
    });
    setErrors(prev => ({ ...prev, contactNumbers: phoneErrors }));
  }, [state.contactNumbers.length]);
  
  // Handle email input changes
  const handleEmailChange = (type: 'home' | 'work', value: string) => {
    // Update the context
    dispatch({
      type: type === 'home' ? ContactInfoActionType.SET_HOME_EMAIL : ContactInfoActionType.SET_WORK_EMAIL,
      payload: value
    });
    
    // Validate and update errors
    const validation = validateEmail(value);
    if (!validation.isValid) {
      setErrors(prev => ({
        ...prev,
        [type === 'home' ? 'homeEmail' : 'workEmail']: validation.errorMessage || 'Invalid email format'
      }));
    } else {
      setErrors(prev => ({
        ...prev,
        [type === 'home' ? 'homeEmail' : 'workEmail']: ''
      }));
    }
  };
  
  // Handle phone number changes
  const handlePhoneChange = (id: number, value: string) => {
    // Detect format for validation
    const format = detectPhoneFormat(value);
    
    // Format the value
    const formattedValue = formatPhoneNumber(value, format);
    
    // Update the context (with nested field update)
    dispatch({
      type: ContactInfoActionType.UPDATE_CONTACT_NUMBER,
      payload: {
        id,
        field: 'phoneNumber',
        subfield: 'value',
        value: formattedValue
      }
    });
    
    // Validate and update errors
    const validation = validatePhoneNumber(value, format);
    if (!validation.isValid) {
      setErrors(prev => ({
        ...prev,
        contactNumbers: {
          ...prev.contactNumbers,
          [id]: {
            ...prev.contactNumbers[id],
            phoneNumber: validation.errorMessage || 'Invalid phone number'
          }
        }
      }));
    } else {
      setErrors(prev => ({
        ...prev,
        contactNumbers: {
          ...prev.contactNumbers,
          [id]: {
            ...prev.contactNumbers[id],
            phoneNumber: ''
          }
        }
      }));
    }
  };
  
  // Handle extension changes
  const handleExtensionChange = (id: number, value: string) => {
    dispatch({
      type: ContactInfoActionType.UPDATE_CONTACT_NUMBER,
      payload: {
        id,
        field: 'extension',
        subfield: 'value',
        value
      }
    });
  };
  
  // Handle checkbox changes for phone usability and international flags
  const handleCheckboxChange = (
    id: number, 
    field: 'isUsableDay' | 'isUsableNight' | 'internationalOrDSN', 
    checked: boolean
  ) => {
    dispatch({
      type: ContactInfoActionType.UPDATE_CONTACT_NUMBER,
      payload: {
        id,
        field,
        subfield: 'value',
        value: checked ? 'YES' : 'NO'
      }
    });
  };
  
  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate all fields
    let isValid = true;
    
    // Validate emails
    const homeEmailValidation = validateEmail(state.homeEmail.value);
    const workEmailValidation = validateEmail(state.workEmail.value);
    
    // Validate phone numbers
    const phoneValidations = state.contactNumbers.map(number => {
      return validatePhoneNumber(
        number.phoneNumber.value, 
        detectPhoneFormat(number.phoneNumber.value)
      );
    });
    
    // Update errors state based on validations
    const newErrors = {
      homeEmail: homeEmailValidation.isValid ? '' : (homeEmailValidation.errorMessage || 'Invalid email'),
      workEmail: workEmailValidation.isValid ? '' : (workEmailValidation.errorMessage || 'Invalid email'),
      contactNumbers: { ...errors.contactNumbers }
    };
    
    // Update phone error messages
    state.contactNumbers.forEach((number, index) => {
      const validation = phoneValidations[index];
      if (!validation.isValid) {
        newErrors.contactNumbers[number._id] = {
          ...newErrors.contactNumbers[number._id],
          phoneNumber: validation.errorMessage || 'Invalid phone number'
        };
        isValid = false;
      } else {
        newErrors.contactNumbers[number._id] = {
          ...newErrors.contactNumbers[number._id],
          phoneNumber: ''
        };
      }
    });
    
    setErrors(newErrors);
    
    // Check if any error exists
    if (!isValid || newErrors.homeEmail || newErrors.workEmail) {
      return;
    }
    
    // Call onSave callback if provided
    if (onSave) {
      onSave();
    }
  };
  
  // Find a specific contact number by its label type
  const getContactNumberById = (id: number): ContactNumber | undefined => {
    return state.contactNumbers.find(number => number._id === id);
  };
  
  // Get contact numbers sorted by ID
  const getSortedContactNumbers = (): ContactNumber[] => {
    return [...state.contactNumbers].sort((a, b) => a._id - b._id);
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-6" aria-labelledby="contact-info-heading">
      <h2 id="contact-info-heading" className="text-xl font-semibold mb-4">Contact Information</h2>
      
      {/* Email addresses section */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Email Addresses</h3>
        
        {/* Home email */}
        <div className="space-y-2">
          <label htmlFor="home-email" className="block text-sm font-medium">
            Home Email Address
          </label>
          <input
            id="home-email"
            type="email"
            value={state.homeEmail.value}
            onChange={(e) => handleEmailChange('home', e.target.value)}
            disabled={readOnly}
            className={`block w-full px-3 py-2 border rounded-md shadow-sm ${
              errors.homeEmail ? 'border-red-500' : 'border-gray-300'
            } focus:outline-none focus:ring-indigo-500 focus:border-indigo-500`}
            {...getEmailFieldAccessibilityProps(!!errors.homeEmail, errors.homeEmail)}
          />
          {errors.homeEmail && (
            <p id="email-error" className="mt-1 text-sm text-red-600">
              {errors.homeEmail}
            </p>
          )}
        </div>
        
        {/* Work email */}
        <div className="space-y-2">
          <label htmlFor="work-email" className="block text-sm font-medium">
            Work Email Address
          </label>
          <input
            id="work-email"
            type="email"
            value={state.workEmail.value}
            onChange={(e) => handleEmailChange('work', e.target.value)}
            disabled={readOnly}
            className={`block w-full px-3 py-2 border rounded-md shadow-sm ${
              errors.workEmail ? 'border-red-500' : 'border-gray-300'
            } focus:outline-none focus:ring-indigo-500 focus:border-indigo-500`}
            {...getEmailFieldAccessibilityProps(!!errors.workEmail, errors.workEmail)}
          />
          {errors.workEmail && (
            <p id="email-error" className="mt-1 text-sm text-red-600">
              {errors.workEmail}
            </p>
          )}
        </div>
      </div>
      
      {/* Phone numbers section */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Phone Numbers</h3>
        
        {/* Render each contact number */}
        {getSortedContactNumbers().map((contactNumber) => {
          const phoneErrors = errors.contactNumbers[contactNumber._id] || {};
          const phoneType = contactNumber._id === 1 ? 'Home' : 
                          contactNumber._id === 2 ? 'Work' : 'Mobile/Cell';
          
          return (
            <div key={contactNumber._id} className="border p-4 rounded-md space-y-4">
              <h4 className="font-medium">{phoneType} Phone</h4>
              
              {/* Phone number field */}
              <div className="space-y-2">
                <label htmlFor={`phone-${contactNumber._id}`} className="block text-sm font-medium">
                  {phoneType} Phone Number
                </label>
                <input
                  id={`phone-${contactNumber._id}`}
                  type="tel"
                  value={contactNumber.phoneNumber.value}
                  onChange={(e) => handlePhoneChange(contactNumber._id, e.target.value)}
                  disabled={readOnly}
                  className={`block w-full px-3 py-2 border rounded-md shadow-sm ${
                    phoneErrors.phoneNumber ? 'border-red-500' : 'border-gray-300'
                  } focus:outline-none focus:ring-indigo-500 focus:border-indigo-500`}
                  {...getPhoneFieldAccessibilityProps(!!phoneErrors.phoneNumber, phoneErrors.phoneNumber)}
                />
                {phoneErrors.phoneNumber && (
                  <p id="phone-error" className="mt-1 text-sm text-red-600">
                    {phoneErrors.phoneNumber}
                  </p>
                )}
              </div>
              
              {/* Extension field */}
              <div className="space-y-2">
                <label htmlFor={`extension-${contactNumber._id}`} className="block text-sm font-medium">
                  Extension
                </label>
                <input
                  id={`extension-${contactNumber._id}`}
                  type="text"
                  value={contactNumber.extension.value}
                  onChange={(e) => handleExtensionChange(contactNumber._id, e.target.value)}
                  disabled={readOnly}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              
              {/* Usability checkboxes */}
              <div className="flex space-x-4">
                <div className="flex items-center">
                  <input
                    id={`day-${contactNumber._id}`}
                    type="checkbox"
                    checked={contactNumber.isUsableDay.value === 'YES'}
                    onChange={(e) => handleCheckboxChange(contactNumber._id, 'isUsableDay', e.target.checked)}
                    disabled={readOnly}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <label htmlFor={`day-${contactNumber._id}`} className="ml-2 block text-sm text-gray-700">
                    Usable During Day
                  </label>
                </div>
                
                <div className="flex items-center">
                  <input
                    id={`night-${contactNumber._id}`}
                    type="checkbox"
                    checked={contactNumber.isUsableNight.value === 'YES'}
                    onChange={(e) => handleCheckboxChange(contactNumber._id, 'isUsableNight', e.target.checked)}
                    disabled={readOnly}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <label htmlFor={`night-${contactNumber._id}`} className="ml-2 block text-sm text-gray-700">
                    Usable During Night
                  </label>
                </div>
              </div>
              
              {/* International/DSN checkbox */}
              <div className="flex items-center">
                <input
                  id={`international-${contactNumber._id}`}
                  type="checkbox"
                  checked={contactNumber.internationalOrDSN.value === 'YES'}
                  onChange={(e) => handleCheckboxChange(contactNumber._id, 'internationalOrDSN', e.target.checked)}
                  disabled={readOnly}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <label htmlFor={`international-${contactNumber._id}`} className="ml-2 block text-sm text-gray-700">
                  International or DSN Phone Number
                </label>
              </div>
            </div>
          );
        })}
      </div>
      
      {/* Submit button */}
      {!readOnly && (
        <div className="flex justify-end">
          <button
            type="submit"
            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Save Contact Information
          </button>
        </div>
      )}
    </form>
  );
};

export default ContactInfoForm; 