import { useState, useEffect } from 'react';
import {
  type ContactInfo,
  type ContactNumber
} from "api/interfaces/sections/contact"; // Ensure the path and exports are correct
import FormEntryManager, { useFormEntryManager } from "../../utils/forms/FormEntryManager";
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
    maxEntries: 3, // Maximum of 3 contact numbers
    defaultVisible: true,
    isSectionActive: () => true // Always active
  });
  
  // Track which entries should be visible
  const [visibleContacts, setVisibleContacts] = useState<ContactNumber[]>([]);
  
  // Initialize the entry manager when component mounts or data changes
  useEffect(() => {
    if (data) {
      // Ensure contactNumbers is always an array
      const contactNumbers = Array.isArray(data.contactNumbers) ? data.contactNumbers : [];
      
      // Initialize visibility for existing entries
      if (contactNumbers.length > 0) {
        entryManager.setVisibilityMap({
          [path]: contactNumbers.map((_, index) => index)
        });
      } else {
        // If no contact numbers exist, create one and make it visible
        const defaultContact = getDefaultNewItem(`contactInfo.contactNumbers`);
        onAddEntry(`${path}.contactNumbers`, defaultContact);
        
        // Make the new entry visible
        entryManager.setVisibilityMap({
          [path]: [0]
        });
      }
      
      // Update visible contacts
      updateVisibleContacts();
    }
  }, []);
  
  // Update visible contacts when data.contactNumbers changes
  useEffect(() => {
    if (data && data.contactNumbers) {
      updateVisibleContacts();
    }
  }, [data.contactNumbers]);
  
  // Update the visible contacts based on visibility state
  const updateVisibleContacts = () => {
    if (data.contactNumbers) {
      // Only show entries that are marked as visible
      const entries = entryManager.getVisibleEntries(path, data.contactNumbers);
      setVisibleContacts(entries);
    } else {
      setVisibleContacts([]);
    }
  };
  
  const handleAddContact = () => {
    // Get default contact from template
    const newContact = getDefaultNewItem(`contactInfo.contactNumbers`);
    
    // Add to the form data via onAddEntry
    onAddEntry(`${path}.contactNumbers`, newContact);
    
    // Make the new entry visible - will handle by the next useEffect
    entryManager.addEntry(path);
    
    // Update visible contacts immediately (don't wait for useEffect)
    setTimeout(updateVisibleContacts, 0);
  };
  
  const handleRemoveContact = (index: number) => {
    // Get current visible indices
    const visibleIndices = entryManager.getVisibleIndices(path);
    
    // Check if the index being removed is the last visible entry (highest index)
    if (visibleIndices.length > 0) {
      const highestVisibleIndex = Math.max(...visibleIndices);
      
      // Only allow removing the highest index (last added entry)
      if (index !== highestVisibleIndex) {
        alert("Entries must be removed in reverse order of addition (last in, first out)");
        return;
      }
    }
    
    // Hide the entry and also remove it from the data
    entryManager.removeEntry(path, index);
    onRemoveEntry(`${path}.contactNumbers`, index);
    
    // Get the updated visible indices after removal
    const updatedVisibleIndices = entryManager.getVisibleIndices(path).filter(
      (i) => i < (data.contactNumbers?.length || 0) - 1
    );
    
    // Update visibility map to reflect the removed entry
    entryManager.setVisibilityMap({
      [path]: updatedVisibleIndices
    });
    
    // Update visible contacts immediately to reflect the change
    setTimeout(updateVisibleContacts, 0);
  };
  
  // Check if we've reached the maximum allowed contacts (3)
  const canAddMoreContacts = entryManager.canAddMoreEntries(path);
  
  // Helper function to check if a contact can be removed (must be the last added entry)
  const canRemoveContact = (index: number): boolean => {
    if (visibleContacts.length <= 1) return false; // Can't remove if it's the only contact
    
    const visibleIndices = entryManager.getVisibleIndices(path);
    if (visibleIndices.length === 0) return false;
    
    // Can only remove if it's the highest visible index (last added)
    return index === Math.max(...visibleIndices);
  };

  return (
    <div className="p-4 bg-gray-100 rounded mb-2 grid grid-cols-1 gap-4">
      <h3 className="font-semibold text-gray-800 text-lg">
        Section 6 - Your Contact Information
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
      {visibleContacts.map((contact: ContactNumber, visibleIndex: number) => {
        // Find the actual index in the data array
        const index = data.contactNumbers.findIndex((c) => c === contact);
        if (index === -1) return null; // Skip if not found
        
        // Determine if this contact can be removed based on LIFO rules
        const isRemovable = canRemoveContact(index);
        
        return (
          <div key={contact._id || index} className="p-4 border border-gray-200 rounded-lg shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label className="block col-span-1">
                {contact.numberType?.value || "Phone"} telephone number:
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
              <label className="block col-span-1">
                Number Type:
                <select
                  value={contact.numberType?.value || "Home"}
                  onChange={(e) =>
                    onInputChange(
                      `${path}.contactNumbers[${index}].numberType.value`,
                      e.target.value
                    )
                  }
                  className="mt-1 p-2 w-full border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
                  disabled={isReadOnlyField(
                    `${path}.contactNumbers[${index}].numberType.value`
                  )}
                >
                  <option value="Home">Home</option>
                  <option value="DSN">DSN</option>
                  <option value="International">International</option>
                </select>
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
      {canAddMoreContacts && visibleContacts.length > 0 && (
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

      {!canAddMoreContacts && (
        <div className="text-sm text-gray-600 italic">
          Maximum of 3 contact numbers reached
        </div>
      )}
    </div>
  );
};

export { RenderContactInfo };
