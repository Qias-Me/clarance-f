import { useState, useEffect } from 'react';
import {
  type ContactInfo,
  type ContactNumber
} from "api/interfaces/sections/contact"; // Ensure the path and exports are correct
import FormEntryManager, { useFormEntryManager } from "../../utils/forms/FormEntryManager";
import { contactInfo as contactInfoContext } from "../../state/contexts/sections/contactInfo";
import { get } from 'lodash';
import { mapFieldsToContactInfo, mapContactInfoToFields } from "../../utils/forms/contactMappingUtil";
import { useContactInfo, ContactInfoActionType } from "../../state/contexts/sections/contactInfoContext";
import ErrorBoundary from "../ErrorBoundary";
import FormErrorMessage from "../FormErrorMessage";
import { 
  validateContactInfo, 
  getFieldError, 
  hasFieldError, 
  getFieldAccessibilityProps,
  type ValidationError 
} from "../../utils/validation/contactValidation";

interface FormProps {
  data: ContactInfo;
  onInputChange: (path: string, value: any) => void; // Handles changes for the values from all keys in ApplicationFormValues
  onAddEntry: (path: string, newItem: any) => void; // Adds a new item
  onRemoveEntry: (path: string, index: number) => void; // Removes an item
  getDefaultNewItem: (itemType: string) => any;
  isReadOnlyField: (fieldName: string) => boolean;
  path: string;
}

const RenderContactInfo = ({
  data,
  onInputChange,
  onAddEntry,
  onRemoveEntry,
  getDefaultNewItem,
  isReadOnlyField,
  path,
}: FormProps) => {
  // Access the ContactInfo context
  const contactContext = useContactInfo();
  
  // State for validation errors
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
  
  // Use our custom hook to manage entry visibility
  const entryManager = useFormEntryManager({
    maxEntries: 3, // Maximum of 3 contact numbers as defined in context
    defaultVisible: true,
    isSectionActive: () => true // Always active
  });
  
  // Track which entries should be visible
  const [visibleContacts, setVisibleContacts] = useState<ContactNumber[]>([]);
  
  // Update the visible contacts based on visibility state
  const updateVisibleContacts = () => {
    if (data && Array.isArray(data.contactNumbers)) {
      // Get entries that are marked as visible
      const entries = entryManager.getVisibleEntries(path, data.contactNumbers);
      setVisibleContacts(entries);
    } else {
      setVisibleContacts([]);
    }
  };
  
  // Ensure data structure is properly initialized
  useEffect(() => {
    // Initialize contactNumbers array if it doesn't exist
    if (!data.contactNumbers) {
      // Create an empty array in the data structure
      onInputChange(`${path}.contactNumbers`, []);
    }
  }, [data, onInputChange, path]);
  
  // Initialize the entry manager when component mounts or data changes
  useEffect(() => {
    if (!data) return;
    
    // Ensure contactNumbers is always an array
    const contactNumbers = Array.isArray(data.contactNumbers) ? data.contactNumbers : [];

    if (contactNumbers.length > 0) {
      // Show all existing entries
      const indices = Array.from({ length: contactNumbers.length }, (_, i) => i);
      entryManager.setVisibilityMap({
        [path]: indices
      });
    } else {
      // If no contact numbers exist, create the first one from context
      if (contactInfoContext && contactInfoContext.contactNumbers && contactInfoContext.contactNumbers.length > 0) {
        // Create a deep copy of the first contact template from context
        // This preserves the correct field IDs for PDF mapping
        const firstContact = JSON.parse(JSON.stringify(contactInfoContext.contactNumbers[0]));
        
        // Clear all values while keeping IDs
        Object.keys(firstContact).forEach(key => {
          const k = key as keyof ContactNumber;
          if (k !== '_id' && typeof firstContact[k] === 'object' && firstContact[k] !== null) {
            if ('value' in (firstContact[k] as any)) {
              (firstContact[k] as any).value = '';
            }
          }
        });
        
        // Set the new entry as the only item in the contactNumbers array
        onInputChange(`${path}.contactNumbers`, [firstContact]);
        
        // Make only the first entry visible
        entryManager.setVisibilityMap({
          [path]: [0]
        });
      }
    }
    
    // Update visible contacts after initialization
    updateVisibleContacts();
  }, []);
  
  // Update visible contacts when data.contactNumbers changes
  useEffect(() => {
    if (data) {
      updateVisibleContacts();
    }
  }, [data?.contactNumbers]);
  
  // Sync form data with context on initial render and when form data changes
  useEffect(() => {
    // Dispatch action to update context with current form data
    if (data && contactContext) {
      // Only update context if data exists and context is initialized
      contactContext.dispatch({
        type: ContactInfoActionType.IMPORT_CONTACT_INFO,
        payload: data
      });
    }
  }, [data, contactContext]);
  
  // Validate data when it changes
  useEffect(() => {
    if (data) {
      const validation = validateContactInfo(data);
      setValidationErrors(validation.errors);
    }
  }, [data]);
  
  const handleAddContact = () => {
    // Ensure contactNumbers exists and is an array
    if (!Array.isArray(data.contactNumbers)) {
      onInputChange(`${path}.contactNumbers`, []);
      return; // Return early and let the effect handle initialization
    }
    
    // We can only have up to 3 contacts as defined in the context
    if (!contactInfoContext || !contactInfoContext.contactNumbers || 
        data.contactNumbers.length >= contactInfoContext.contactNumbers.length) {
      console.warn(`Maximum number of contacts reached (${contactInfoContext?.contactNumbers?.length || 3})`);
      return;
    }
    
    // Find which context template to use next based on _id values
    // The context has entries with _id values 1, 2, 3
    const existingIds = new Set(data.contactNumbers.map(contact => contact._id));
    
    // Find first unused template from context
    const nextContactTemplate = contactInfoContext.contactNumbers.find(contextContact => 
      !existingIds.has(contextContact._id)
    );
    
    if (!nextContactTemplate) {
      console.warn("No more contact templates available in context");
      return;
    }
    
    // Create a deep copy of the template (preserves exact structure with IDs)
    const newContact = JSON.parse(JSON.stringify(nextContactTemplate));
    
    // Clear values but keep field IDs
    Object.keys(newContact).forEach(key => {
      const k = key as keyof ContactNumber;
      if (k !== '_id' && typeof newContact[k] === 'object' && newContact[k] !== null) {
        if ('value' in (newContact[k] as any)) {
          (newContact[k] as any).value = '';
        }
      }
    });
    
    // Add the new contact to the array (sort by _id to ensure correct order)
    const updatedContacts = [...data.contactNumbers, newContact].sort((a, b) => 
      (a._id as number) - (b._id as number)
    );
    
    // Update the form data
    onInputChange(`${path}.contactNumbers`, updatedContacts);
    
    // Update visibility to show all entries
    const indices = Array.from({ length: updatedContacts.length }, (_, i) => i);
    entryManager.setVisibilityMap({
      [path]: indices
    });
    
    // Announce to screen readers
    const contactTypes = {
      1: "Home",
      2: "Work",
      3: "Mobile"
    };
    const contactType = contactTypes[newContact._id as keyof typeof contactTypes] || "New";
    
    // Use ARIA live region for announcement
    const announcer = document.getElementById('contact-announcer');
    if (announcer) {
      announcer.textContent = `${contactType} telephone number added`;
    }
  };
  
  const handleRemoveContact = (index: number) => {
    // Make sure contactNumbers is an array
    if (!Array.isArray(data.contactNumbers) || index < 0 || index >= data.contactNumbers.length) {
      return;
    }
    
    // Can only remove the highest _id (last added entry)
    if (data.contactNumbers.length > 1) {
      const ids = data.contactNumbers.map(contact => contact._id as number);
      const maxId = Math.max(...ids);
      const currentId = data.contactNumbers[index]._id as number;
      
      if (currentId !== maxId) {
        alert("Entries must be removed in reverse order of addition (last in, first out)");
        return;
      }
    }
    
    // Store contact type for announcement
    const contactToRemove = data.contactNumbers[index];
    const contactTypes = {
      1: "Home",
      2: "Work",
      3: "Mobile"
    };
    const contactType = contactTypes[contactToRemove._id as keyof typeof contactTypes] || "";
    
    // Create a copy of the contactNumbers array
    const updatedContacts = [...data.contactNumbers];
    
    // Remove the item from the array
    updatedContacts.splice(index, 1);
    
    // Update the form data
    onInputChange(`${path}.contactNumbers`, updatedContacts);
    
    // Update the visibility map to show all remaining entries
    const indices = Array.from({ length: updatedContacts.length }, (_, i) => i);
    entryManager.setVisibilityMap({
      [path]: indices
    });
    
    // Announce removal to screen readers
    const announcer = document.getElementById('contact-announcer');
    if (announcer) {
      announcer.textContent = `${contactType} telephone number removed`;
    }
  };
  
  // Check if we have reached the maximum number of contacts
  const hasMaxContacts = Array.isArray(data.contactNumbers) && 
                        contactInfoContext && 
                        contactInfoContext.contactNumbers && 
                        data.contactNumbers.length >= contactInfoContext.contactNumbers.length;
  
  // Helper function to check if a contact can be removed
  const canRemoveContact = (index: number): boolean => {
    if (!Array.isArray(data.contactNumbers) || data.contactNumbers.length <= 1) {
      return false; // Can't remove if it's the only entry
    }
    
    // Can only remove the entry with the highest _id
    const ids = data.contactNumbers.map(contact => contact._id as number);
    const maxId = Math.max(...ids);
    const currentId = data.contactNumbers[index]._id as number;
    
    return currentId === maxId;
  };
  
  // Get a label for the contact entry based on the template's _id
  const getContactTypeLabel = (contact: ContactNumber): string => {
    const id = contact._id as number;
    
    // Labels corresponding to the specific context entries
    const labels = {
      1: "Home Telephone",
      2: "Work Telephone",
      3: "Mobile/Cell Telephone"
    };
    
    return labels[id as keyof typeof labels] || `Telephone #${id}`;
  };

  return (
    <ErrorBoundary
      fallback={
        <div className="p-4 bg-red-50 border border-red-300 rounded-lg">
          <h3 className="font-semibold text-red-800">Error in Contact Information Form</h3>
          <p className="text-red-700">
            There was a problem loading the contact information section. 
            Please try refreshing the page or contact support.
          </p>
        </div>
      }
    >
      {/* ARIA live region for dynamic announcements */}
      <div id="contact-announcer" className="sr-only" aria-live="polite"></div>
      
      <div 
        className="p-4 bg-gray-100 rounded mb-2 grid grid-cols-1 gap-4"
        role="region" 
        aria-labelledby="contact-heading"
      >
        <h3 id="contact-heading" className="font-semibold text-gray-800 text-lg">
          Section 7 - Your Contact Information
        </h3>

        {/* Home and Work Email Addresses */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="homeEmail" className="block">
              Home e-mail address:
            </label>
            <input
              id="homeEmail"
              type="email"
              value={data.homeEmail?.value || ""}
              onChange={(e) => onInputChange(`${path}.homeEmail.value`, e.target.value)}
              className={`mt-1 p-2 w-full border ${hasFieldError(validationErrors, 'homeEmail') ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-400'} rounded-md focus:ring-2 focus:border-transparent`}
              readOnly={isReadOnlyField(`${path}.homeEmail.value`)}
              {...getFieldAccessibilityProps(validationErrors, 'homeEmail', 'homeEmail-error')}
            />
            <FormErrorMessage 
              id="homeEmail-error"
              message={getFieldError(validationErrors, 'homeEmail')}
              visible={hasFieldError(validationErrors, 'homeEmail')}
            />
          </div>
          
          <div>
            <label htmlFor="workEmail" className="block">
              Work e-mail address:
            </label>
            <input
              id="workEmail"
              type="email"
              value={data.workEmail?.value || ""}
              onChange={(e) => onInputChange(`${path}.workEmail.value`, e.target.value)}
              className={`mt-1 p-2 w-full border ${hasFieldError(validationErrors, 'workEmail') ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-400'} rounded-md focus:ring-2 focus:border-transparent`}
              readOnly={isReadOnlyField(`${path}.workEmail.value`)}
              {...getFieldAccessibilityProps(validationErrors, 'workEmail', 'workEmail-error')}
            />
            <FormErrorMessage 
              id="workEmail-error"
              message={getFieldError(validationErrors, 'workEmail')}
              visible={hasFieldError(validationErrors, 'workEmail')}
            />
          </div>
        </div>

        {/* Contact Numbers */}
        {Array.isArray(visibleContacts) && visibleContacts.map((contact: ContactNumber, visibleIndex: number) => {
          // Find the actual index in the data array by matching _id
          const index = Array.isArray(data.contactNumbers) 
            ? data.contactNumbers.findIndex((c) => c && contact && c._id === contact._id)
            : -1;
          
          if (index === -1) return null; // Skip if not found
          
          // Determine if this contact can be removed based on _id rules
          const isRemovable = canRemoveContact(index);
          
          // Get the appropriate contact type label based on _id
          const contactTypeLabel = getContactTypeLabel(contact);
          const contactId = `contact-${contact._id}`;
          
          return (
            <div 
              key={contact._id} 
              className="p-4 border border-gray-200 rounded-lg shadow-sm"
              role="group"
              aria-labelledby={`${contactId}-heading`}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div id={`${contactId}-heading`} className="col-span-2 font-medium text-gray-700">
                  {contactTypeLabel} Number
                </div>
                
                <div>
                  <label htmlFor={`${contactId}-phone`} className="block">
                    Phone number:
                  </label>
                  <input
                    id={`${contactId}-phone`}
                    type="tel"
                    value={contact.phoneNumber?.value || ""}
                    onChange={(e) =>
                      onInputChange(
                        `${path}.contactNumbers[${index}].phoneNumber.value`,
                        e.target.value
                      )
                    }
                    className={`mt-1 p-2 w-full border ${hasFieldError(validationErrors, `contactNumbers[${index}].phoneNumber`) ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-400'} rounded-md focus:ring-2 focus:border-transparent`}
                    readOnly={isReadOnlyField(
                      `${path}.contactNumbers[${index}].phoneNumber.value`
                    )}
                    {...getFieldAccessibilityProps(
                      validationErrors, 
                      `contactNumbers[${index}].phoneNumber`, 
                      `${contactId}-phone-error`
                    )}
                  />
                  <FormErrorMessage 
                    id={`${contactId}-phone-error`}
                    message={getFieldError(validationErrors, `contactNumbers[${index}].phoneNumber`)}
                    visible={hasFieldError(validationErrors, `contactNumbers[${index}].phoneNumber`)}
                  />
                </div>
                
                <div>
                  <label htmlFor={`${contactId}-extension`} className="block">
                    Extension:
                  </label>
                  <input
                    id={`${contactId}-extension`}
                    type="text"
                    value={contact.extension?.value || ""}
                    onChange={(e) =>
                      onInputChange(
                        `${path}.contactNumbers[${index}].extension.value`,
                        e.target.value
                      )
                    }
                    className="mt-1 p-2 w-full border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
                    readOnly={isReadOnlyField(
                      `${path}.contactNumbers[${index}].extension.value`
                    )}
                  />
                </div>
          
                <div className="col-span-1 md:col-span-2 grid grid-cols-2 gap-4">
                  <div className="inline-flex items-center">
                    <input
                      id={`${contactId}-usable-day`}
                      type="checkbox"
                      checked={contact.isUsableDay?.value === "YES"}
                      onChange={(e) =>
                        onInputChange(
                          `${path}.contactNumbers[${index}].isUsableDay.value`,
                          e.target.checked ? "YES" : "NO"
                        )
                      }
                      className="form-checkbox h-5 w-5 text-blue-600 border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                      {...getFieldAccessibilityProps(
                        validationErrors, 
                        `contactNumbers[${index}].isUsableDay`, 
                        `${contactId}-usable-day-error`
                      )}
                    />
                    <label htmlFor={`${contactId}-usable-day`} className="ml-2">
                      Usable Day
                    </label>
                  </div>
                  <div className="inline-flex items-center">
                    <input
                      id={`${contactId}-usable-night`}
                      type="checkbox"
                      checked={contact.isUsableNight?.value === "YES"}
                      onChange={(e) =>
                        onInputChange(
                          `${path}.contactNumbers[${index}].isUsableNight.value`,
                          e.target.checked ? "YES" : "NO"
                        )
                      }
                      className="form-checkbox h-5 w-5 text-blue-600 border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <label htmlFor={`${contactId}-usable-night`} className="ml-2">
                      Usable Night
                    </label>
                  </div>
                </div>
                
                {/* Error message for required day or night selection */}
                {hasFieldError(validationErrors, `contactNumbers[${index}].isUsableDay`) && (
                  <div className="col-span-2">
                    <FormErrorMessage 
                      id={`${contactId}-usable-day-error`}
                      message={getFieldError(validationErrors, `contactNumbers[${index}].isUsableDay`)}
                      visible={true}
                    />
                  </div>
                )}
                
                {/* Only show international/DSN checkbox if available in the contact */}
                {contact.internationalOrDSN && (
                  <div className="col-span-1 md:col-span-2">
                    <div className="inline-flex items-center">
                      <input
                        id={`${contactId}-international`}
                        type="checkbox"
                        checked={contact.internationalOrDSN?.value === "YES"}
                        onChange={(e) =>
                          onInputChange(
                            `${path}.contactNumbers[${index}].internationalOrDSN.value`,
                            e.target.checked ? "YES" : "NO"
                          )
                        }
                        className="form-checkbox h-5 w-5 text-blue-600 border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                      />
                      <label htmlFor={`${contactId}-international`} className="ml-2">
                        International or DSN
                      </label>
                    </div>
                  </div>
                )}
              
                <button
                  type="button"
                  onClick={() => handleRemoveContact(index)}
                  className={`py-2 px-4 ${isRemovable ? 'bg-red-500 hover:bg-red-700' : 'bg-gray-400 cursor-not-allowed'} text-white rounded transition duration-150`}
                  disabled={!isRemovable}
                  title={!isRemovable && visibleContacts.length > 1 ? "Contact numbers must be removed in reverse order (last added, first removed)" : ""}
                  aria-label={`Remove ${contactTypeLabel} Number`}
                >
                  Remove Contact
                </button>
                
                {!isRemovable && visibleContacts.length > 1 && (
                  <div className="text-xs text-gray-500 italic mt-1">
                    Contact numbers must be removed in reverse order
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* Add New Contact button - only show if under max limit */}
        {!hasMaxContacts && visibleContacts.length > 0 && (
          <button
            type="button"
            onClick={handleAddContact}
            className="py-2 px-4 bg-green-500 text-white rounded hover:bg-green-600 transition duration-150 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
            aria-label="Add New Contact Number"
          >
            Add New Contact
          </button>
        )}

        {/* Show "Add First Contact" button when all contacts have been removed */}
        {visibleContacts.length === 0 && (
          <button
            type="button"
            onClick={handleAddContact}
            className="py-2 px-4 bg-green-500 text-white rounded hover:bg-green-600 transition duration-150 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
            aria-label="Add First Contact Number"
          >
            Add First Contact
          </button>
        )}

        {hasMaxContacts && (
          <div className="text-sm text-gray-600 italic">
            Maximum of {contactInfoContext?.contactNumbers?.length || 3} contact numbers reached
          </div>
        )}
      </div>
    </ErrorBoundary>
  );
};

export { RenderContactInfo };
