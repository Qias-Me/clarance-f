import { useState, useEffect } from 'react';
import {
  type ContactInfo,
  type ContactNumber
} from "api/interfaces/sections/contact"; // Ensure the path and exports are correct
import FormEntryManager, { useFormEntryManager } from "../../utils/forms/FormEntryManager";
import { contactInfo as contactInfoContext } from "../../state/contexts/sections/contactInfo";
import { get } from 'lodash';

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
    <div className="p-4 bg-gray-100 rounded mb-2 grid grid-cols-1 gap-4">
      <h3 className="font-semibold text-gray-800 text-lg">
        Section 7 - Your Contact Information
      </h3>

      {/* Home and Work Email Addresses */}
      <div className="grid grid-cols-2 gap-4">
        <label className="block">
          Home e-mail address:
          <input
            type="email"
            value={data.homeEmail?.value || ""}
            onChange={(e) => onInputChange(`${path}.homeEmail.value`, e.target.value)}
            className="mt-1 p-2 w-full border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
            readOnly={isReadOnlyField(`${path}.homeEmail.value`)}
          />
        </label>
        <label className="block">
          Work e-mail address:
          <input
            type="email"
            value={data.workEmail?.value || ""}
            onChange={(e) => onInputChange(`${path}.workEmail.value`, e.target.value)}
            className="mt-1 p-2 w-full border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
            readOnly={isReadOnlyField(`${path}.workEmail.value`)}
          />
        </label>
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
        
        return (
          <div key={contact._id} className="p-4 border border-gray-200 rounded-lg shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="col-span-2 font-medium text-gray-700">
                {contactTypeLabel} Number
              </div>
            <label className="block col-span-1">
                Phone number:
              <input
                type="tel"
                  value={contact.phoneNumber?.value || ""}
                onChange={(e) =>
                  onInputChange(
                    `${path}.contactNumbers[${index}].phoneNumber.value`,
                    e.target.value
                  )
                }
                className="mt-1 p-2 w-full border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
                readOnly={isReadOnlyField(
                  `${path}.contactNumbers[${index}].phoneNumber.value`
                )}
              />
            </label>
            <label className="block col-span-1">
              Extension:
              <input
                type="text"
                  value={contact.extension?.value || ""}
                onChange={(e) =>
                  onInputChange(
                    `${path}.contactNumbers[${index}].extension.value`,
                    e.target.value
                  )
                }
                className="mt-1 p-2 w-full border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
                readOnly={isReadOnlyField(
                  `${path}.contactNumbers[${index}].extension.value`
                )}
              />
            </label>
      
            <div className="col-span-1 md:col-span-2 grid grid-cols-2 gap-4">
              <label className="inline-flex items-center">
                <input
                  type="checkbox"
                    checked={contact.isUsableDay?.value === "YES"}
                  onChange={(e) =>
                    onInputChange(
                      `${path}.contactNumbers[${index}].isUsableDay.value`,
                      e.target.checked ? "YES" : "NO"
                    )
                  }
                  className="form-checkbox h-5 w-5 text-blue-600"
                />
                <span className="ml-2">Usable Day</span>
              </label>
              <label className="inline-flex items-center">
                <input
                  type="checkbox"
                    checked={contact.isUsableNight?.value === "YES"}
                  onChange={(e) =>
                    onInputChange(
                      `${path}.contactNumbers[${index}].isUsableNight.value`,
                      e.target.checked ? "YES" : "NO"
                    )
                  }
                  className="form-checkbox h-5 w-5 text-blue-600"
                />
                <span className="ml-2">Usable Night</span>
              </label>
            </div>
              {/* Only show international/DSN checkbox if available in the contact */}
              {contact.internationalOrDSN && (
                <div className="col-span-1 md:col-span-2">
                  <label className="inline-flex items-center">
                    <input
                      type="checkbox"
                      checked={contact.internationalOrDSN?.value === "YES"}
                      onChange={(e) =>
                        onInputChange(
                          `${path}.contactNumbers[${index}].internationalOrDSN.value`,
                          e.target.checked ? "YES" : "NO"
                        )
                      }
                      className="form-checkbox h-5 w-5 text-blue-600"
                    />
                    <span className="ml-2">International or DSN</span>
                  </label>
                </div>
              )}
            <button
              type="button"
                onClick={() => handleRemoveContact(index)}
                className={`py-2 px-4 ${isRemovable ? 'bg-red-500 hover:bg-red-700' : 'bg-gray-400 cursor-not-allowed'} text-white rounded transition duration-150`}
                disabled={!isRemovable}
                title={!isRemovable && visibleContacts.length > 1 ? "Contact numbers must be removed in reverse order (last added, first removed)" : ""}
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
          className="py-2 px-4 bg-green-500 text-white rounded hover:bg-green-600 transition duration-150"
        >
          Add New Contact
        </button>
      )}

      {/* Show "Add First Contact" button when all contacts have been removed */}
      {visibleContacts.length === 0 && (
        <button
          type="button"
          onClick={handleAddContact}
          className="py-2 px-4 bg-green-500 text-white rounded hover:bg-green-600 transition duration-150"
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
  );
};

export { RenderContactInfo };
