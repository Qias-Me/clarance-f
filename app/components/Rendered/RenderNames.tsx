import { useState, useEffect } from 'react';
import {
  type ApplicantNames,
  type NamesInfo,
} from "../../../api/interfaces/sections/namesInfo";
import { namesInfo as namesInfoContext } from "../../../app/state/contexts/sections/namesInfo";
import { SuffixOptions } from "api/enums/enums";
import FormEntryManager, { useFormEntryManager } from "../../utils/forms/FormEntryManager";

interface FormProps {
  data: NamesInfo;
  onInputChange: (path: string, value: any) => void;
  onAddEntry: (path: string, newItem: any) => void;
  onRemoveEntry: (path: string, index: number) => void;
  isValidValue: (path: string, value: any) => boolean;
  getDefaultNewItem: (itemType: string) => any;
  isReadOnlyField: (fieldName: string) => boolean;
  path: string;
}

const RenderNames = ({
  data,
  onInputChange,
  onAddEntry,
  onRemoveEntry,
  isValidValue,
  getDefaultNewItem,
  isReadOnlyField,
  path,
}: FormProps) => {
  // Use FormEntryManager to track which entries are active/visible
  const {
    addEntry,
    removeEntry,
    getVisibleEntries,
    isEntryVisible,
    getVisibleCount,
    toggleSection,
    canAddMoreEntries,
    setVisibilityMap
  } = useFormEntryManager({
    maxEntries: 4, // Maximum of 4 names as defined in context
    defaultVisible: true,
    isSectionActive: () => data?.hasNames?.value === "YES"
  });
  
  // State to track active name entries
  const [activeNames, setActiveNames] = useState<ApplicantNames[]>([]);
  
  // Update active names when data or visibility changes
  useEffect(() => {
    if (!data || !data.names) {
      setActiveNames([]);
      return;
    }

    if (data.hasNames?.value === "YES" && Array.isArray(data.names)) {
      // Get only the entries that should be visible based on FormEntryManager
      const visible = getVisibleEntries(`${path}.names`, data.names);
      setActiveNames(visible);
    } else {
      setActiveNames([]);
    }
  }, [data, data?.names, data?.hasNames?.value, getVisibleEntries, path]);
  
  // Initialize visibility when component mounts or hasNames changes
  useEffect(() => {
    if (!data) return;
    
    const hasNames = data.hasNames?.value === "YES";
    
    if (hasNames) {
      if (Array.isArray(data.names) && data.names.length > 0) {
        // Initialize visibility map to show all existing entries
        const indices = Array.from({ length: data.names.length }, (_, i) => i);
        setVisibilityMap({
          [`${path}.names`]: indices
        });
      } else {
        // Create first entry if needed
        initializeFirstEntry();
      }
    } else {
      // If hasNames is NO, hide all entries but keep the data
      setVisibilityMap({
        [`${path}.names`]: []
      });
    }
  }, [data?.hasNames?.value, setVisibilityMap, path]);

  // Helper to create the first entry from template
  const initializeFirstEntry = () => {
    if (!namesInfoContext || !namesInfoContext.names || namesInfoContext.names.length === 0) {
      console.warn("No name templates available in context");
      return;
    }

    // Create a deep copy of the first name template from context
    const firstNameEntry = JSON.parse(JSON.stringify(namesInfoContext.names[0]));
    
    // Clear all values while keeping IDs
    Object.keys(firstNameEntry).forEach(key => {
      const k = key as keyof ApplicantNames;
      if (k !== '_id' && typeof firstNameEntry[k] === 'object' && firstNameEntry[k] !== null) {
        if ('value' in (firstNameEntry[k] as any)) {
          (firstNameEntry[k] as any).value = '';
        } else if (k === 'startDate' || k === 'endDate') {
          if (firstNameEntry[k]?.date) {
            firstNameEntry[k].date.value = '';
          }
          if (firstNameEntry[k]?.estimated) {
            firstNameEntry[k].estimated.value = 'NO';
          }
          if (firstNameEntry[k]?.isPresent) {
            firstNameEntry[k].isPresent.value = 'NO';
          }
        }
      }
    });
    
    // Update the form data with the new entry
    onInputChange(`${path}.names`, [firstNameEntry]);
    
    // Make the first entry visible
    setVisibilityMap({
      [`${path}.names`]: [0]
    });
  };

  // Handle the "Do you have other names?" toggle
  const handleHasNamesChange = (checked: boolean) => {
    // Update the form data
    onInputChange(`${path}.hasNames.value`, checked ? "YES" : "NO");
    
    // Toggle the section visibility using FormEntryManager
    toggleSection(`${path}.names`, checked, data);
    
    if (checked && (!Array.isArray(data.names) || data.names.length === 0)) {
      // Create the first entry when activating the section
      initializeFirstEntry();
    }
  };

  // Handle adding a new name entry
  const handleAddName = () => {
    // Make sure data.names is initialized as an array
    if (!Array.isArray(data.names)) {
      onInputChange(`${path}.names`, []);
      return; // Return early and let the effect handle initialization
    }
    
    // Check if we've reached the maximum number of entries
    if (!canAddMoreEntries(`${path}.names`)) {
      console.warn(`Maximum number of names reached (${namesInfoContext?.names?.length || 4})`);
      return;
    }
    
    // Find which context template to use next based on _id values
    const existingIds = new Set(data.names.map(name => name._id));
    
    // Find first unused template from context
    if (!namesInfoContext || !namesInfoContext.names) {
      console.warn("No name templates available in context");
      return;
    }

    const nextNameTemplate = namesInfoContext.names.find(contextName => 
      !existingIds.has(contextName._id)
    );
    
    if (!nextNameTemplate) {
      console.warn("No more name templates available in context");
      return;
    }
    
    // Create a deep copy of the template (preserves exact structure with IDs)
    const newName = JSON.parse(JSON.stringify(nextNameTemplate));
    
    // Clear values but keep field IDs
    Object.keys(newName).forEach(key => {
      const k = key as keyof ApplicantNames;
      if (k !== '_id' && typeof newName[k] === 'object' && newName[k] !== null) {
        if ('value' in (newName[k] as any)) {
          (newName[k] as any).value = '';
        } else if (k === 'startDate' || k === 'endDate') {
          if (newName[k]?.date) {
            newName[k].date.value = '';
          }
          if (newName[k]?.estimated) {
            newName[k].estimated.value = 'NO';
          }
          if (newName[k]?.isPresent) {
            newName[k].isPresent.value = 'NO';
          }
        }
      }
    });
    
    // Add the new name to the array
    const updatedNames = [...data.names, newName].sort((a, b) => 
      (a._id as number) - (b._id as number)
    );
    
    // Update the form data
    onInputChange(`${path}.names`, updatedNames);
    
    // Find the index of the new entry in the sorted array
    const newIndex = updatedNames.findIndex(entry => entry._id === newName._id);
    
    // Add the entry to visible entries
    addEntry(`${path}.names`);
    
    // Make sure all entries are visible after adding
    const indices = Array.from({ length: updatedNames.length }, (_, i) => i);
    setVisibilityMap({
      [`${path}.names`]: indices
    });
  };

  // Check if an entry can be removed
  const canRemoveEntry = (index: number): boolean => {
    // If there's only one entry and hasNames is YES, don't allow removal
    if (data.hasNames?.value === "YES" && activeNames.length <= 1) {
      return false;
    }
    
    // Otherwise, allow removal
    return true;
  };
  
  // Handle removing a name entry
  const handleRemoveName = (index: number) => {
    if (!canRemoveEntry(index)) {
      return;
    }
    
    // If this is the last entry and hasNames is YES,
    // just reset it instead of removing it
    if (data.hasNames?.value === "YES" && activeNames.length === 1) {
      // Toggle hasNames to NO instead of removing the last entry
      handleHasNamesChange(false);
      return;
    }
    
    // Find the actual index in the full data.names array
    if (!Array.isArray(data.names)) {
      console.warn("Names array is not initialized");
      return;
    }

    const actualIndex = data.names.findIndex(name => 
      name._id === activeNames[index]._id
    );
    
    if (actualIndex === -1) {
      console.warn("Failed to find entry index for removal");
      return;
    }
    
    // Remove the entry from visible entries using FormEntryManager
    removeEntry(`${path}.names`, actualIndex);
    
    // Also remove it from the data array
    onRemoveEntry(`${path}.names`, actualIndex);
  };

  // Handle the "Present" checkbox for end date
  const handlePresentChange = (index: number, checked: boolean) => {
    // Find the actual index in the full names array
    if (!Array.isArray(data.names)) {
      console.warn("Names array is not initialized");
      return;
    }

    const actualIndex = data.names.findIndex(name => 
      name._id === activeNames[index]._id
    );
    
    if (actualIndex === -1) {
      console.warn("Failed to find entry index for updating present status");
      return;
    }
    
    // Update the isPresent field
    onInputChange(`${path}.names[${actualIndex}].endDate.isPresent.value`, checked ? "YES" : "NO");
    
    // Clear the end date if "Present" is checked
    if (checked) {
      onInputChange(`${path}.names[${actualIndex}].endDate.date.value`, "");
    }
  };

  // Get a label for the name entry (for display and aria-label)
  const getNameEntryLabel = (name: ApplicantNames): string => {
    if (name.firstName?.value || name.lastName?.value) {
      return `${name.firstName?.value || ''} ${name.lastName?.value || ''}`.trim();
    }
    return `Name #${name._id}`;
  };

  return (
    <div className="p-4 border rounded-lg mb-6">
      <h2 className="text-xl font-bold mb-4">Other Names Used</h2>
      
      {/* YES/NO Radio buttons for "Do you have other names?" */}
      <div className="mb-4">
        <fieldset>
          <legend className="font-semibold mb-2">
            Have you used any other names? Include maiden name, previous married names, aliases, or nicknames.
          </legend>
          
          <div className="flex space-x-4">
            <label className="flex items-center">
              <input
                type="radio"
                className="form-radio mr-2"
                checked={data.hasNames?.value === "YES"}
                onChange={() => handleHasNamesChange(true)}
              />
              Yes
            </label>
            
            <label className="flex items-center">
              <input
                type="radio"
                className="form-radio mr-2"
                checked={data.hasNames?.value === "NO"}
                onChange={() => handleHasNamesChange(false)}
              />
              No
            </label>
          </div>
        </fieldset>
      </div>
      
      {/* Only show name entries if hasNames is YES */}
      {data.hasNames?.value === "YES" && (
        <div className="space-y-8 mt-4">
          {/* Render only the active/visible name entries */}
          {activeNames.map((name, index) => (
            <div key={name._id} className="border p-4 rounded-lg bg-gray-50">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">
                  {getNameEntryLabel(name) || `Name Entry ${index + 1}`}
                </h3>
                
                {/* Show remove button if there are multiple entries or if this isn't required */}
                {canRemoveEntry(index) && (
                  <button
                    type="button"
                    className="text-red-600 hover:text-red-800"
                    onClick={() => handleRemoveName(index)}
                    aria-label={`Remove ${getNameEntryLabel(name)}`}
                  >
                    Remove
                  </button>
                )}
              </div>
              
              {/* Find the actual index in the full names array */}
              {(() => {
                if (!data || !data.names) {
                  return <div>No names data available</div>;
                }
                
                const actualIndex = data.names.findIndex(n => n._id === name._id);
                
                return (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* First Name */}
                    <div>
                      <label htmlFor={`firstName-${name._id}`} className="block text-sm font-medium mb-1">
                        First Name
                      </label>
                      <input
                        id={`firstName-${name._id}`}
                        type="text"
                        className="w-full p-2 border rounded"
                        value={name.firstName?.value || ''}
                        onChange={(e) => onInputChange(`${path}.names[${actualIndex}].firstName.value`, e.target.value)}
                        readOnly={isReadOnlyField(`${path}.names[${actualIndex}].firstName.value`)}
                      />
                    </div>
                    
                    {/* Middle Name */}
                    <div>
                      <label htmlFor={`middleName-${name._id}`} className="block text-sm font-medium mb-1">
                        Middle Name
                      </label>
                      <input
                        id={`middleName-${name._id}`}
                        type="text"
                        className="w-full p-2 border rounded"
                        value={name.middleName?.value || ''}
                        onChange={(e) => onInputChange(`${path}.names[${actualIndex}].middleName.value`, e.target.value)}
                        readOnly={isReadOnlyField(`${path}.names[${actualIndex}].middleName.value`)}
                      />
                    </div>
                    
                    {/* Last Name */}
                    <div>
                      <label htmlFor={`lastName-${name._id}`} className="block text-sm font-medium mb-1">
                        Last Name
                      </label>
                      <input
                        id={`lastName-${name._id}`}
                        type="text"
                        className="w-full p-2 border rounded"
                        value={name.lastName?.value || ''}
                        onChange={(e) => onInputChange(`${path}.names[${actualIndex}].lastName.value`, e.target.value)}
                        readOnly={isReadOnlyField(`${path}.names[${actualIndex}].lastName.value`)}
                      />
                    </div>
                    
                    {/* Suffix */}
                    <div>
                      <label htmlFor={`suffix-${name._id}`} className="block text-sm font-medium mb-1">
                        Suffix
                      </label>
                      <select
                        id={`suffix-${name._id}`}
                        className="w-full p-2 border rounded"
                        value={name.suffix?.value || ''}
                        onChange={(e) => onInputChange(`${path}.names[${actualIndex}].suffix.value`, e.target.value)}
                        disabled={isReadOnlyField(`${path}.names[${actualIndex}].suffix.value`)}
                      >
                        <option value="">Select Suffix</option>
                        {Object.values(SuffixOptions).map((suffix) => (
                          <option key={suffix} value={suffix}>
                            {suffix}
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    {/* Start Date */}
                    <div className="col-span-1 md:col-span-2">
                      <fieldset className="border p-3 rounded">
                        <legend className="text-sm font-medium px-2">From Date (MM/YYYY)</legend>
                        
                        <div className="flex items-center">
                          <input
                            type="text"
                            className="w-full p-2 border rounded"
                            placeholder="MM/YYYY"
                            value={name.startDate?.date?.value || ''}
                            onChange={(e) => onInputChange(`${path}.names[${actualIndex}].startDate.date.value`, e.target.value)}
                            readOnly={isReadOnlyField(`${path}.names[${actualIndex}].startDate.date.value`)}
                            aria-label="Start date (MM/YYYY)"
                          />
                          
                          <label className="ml-4 flex items-center">
                            <input
                              type="checkbox"
                              className="form-checkbox mr-2"
                              checked={name.startDate?.estimated?.value === "YES"}
                              onChange={(e) => onInputChange(`${path}.names[${actualIndex}].startDate.estimated.value`, e.target.checked ? "YES" : "NO")}
                              disabled={isReadOnlyField(`${path}.names[${actualIndex}].startDate.estimated.value`)}
                            />
                            Estimated
                          </label>
                        </div>
                      </fieldset>
                    </div>
                    
                    {/* End Date */}
                    <div className="col-span-1 md:col-span-2">
                      <fieldset className="border p-3 rounded">
                        <legend className="text-sm font-medium px-2">To Date (MM/YYYY)</legend>
                        
                        <div className="flex items-center">
                          <input
                            type="text"
                            className="w-full p-2 border rounded"
                            placeholder="MM/YYYY"
                            value={name.endDate?.date?.value || ''}
                            onChange={(e) => onInputChange(`${path}.names[${actualIndex}].endDate.date.value`, e.target.value)}
                            readOnly={isReadOnlyField(`${path}.names[${actualIndex}].endDate.date.value`) || name.endDate?.isPresent?.value === "YES"}
                            disabled={name.endDate?.isPresent?.value === "YES"}
                          />
                          
                          <label className="ml-4 flex items-center">
                            <input
                              type="checkbox"
                              className="form-checkbox mr-2"
                              checked={name.endDate?.estimated?.value === "YES"}
                              onChange={(e) => onInputChange(`${path}.names[${actualIndex}].endDate.estimated.value`, e.target.checked ? "YES" : "NO")}
                              disabled={isReadOnlyField(`${path}.names[${actualIndex}].endDate.estimated.value`) || name.endDate?.isPresent?.value === "YES"}
                            />
                            Estimated
                          </label>
                          
                          <label className="ml-4 flex items-center">
                            <input
                              type="checkbox"
                              className="form-checkbox mr-2"
                              checked={name.endDate?.isPresent?.value === "YES"}
                              onChange={(e) => handlePresentChange(index, e.target.checked)}
                              disabled={isReadOnlyField(`${path}.names[${actualIndex}].endDate.isPresent.value`)}
                            />
                            Present
                          </label>
                        </div>
                      </fieldset>
                    </div>
                    
                    {/* Maiden Name Radio Buttons */}
                    <div className="col-span-1 md:col-span-2">
                      <fieldset>
                        <legend className="text-sm font-medium mb-1">
                          Is this your maiden name?
                        </legend>
                        
                        <div className="flex space-x-4">
                          <label className="flex items-center">
                            <input
                              type="radio"
                              className="form-radio mr-2"
                              checked={name.isMaidenName?.value === "YES"}
                              onChange={() => onInputChange(`${path}.names[${actualIndex}].isMaidenName.value`, "YES")}
                              disabled={isReadOnlyField(`${path}.names[${actualIndex}].isMaidenName.value`)}
                            />
                            Yes
                          </label>
                          
                          <label className="flex items-center">
                            <input
                              type="radio"
                              className="form-radio mr-2"
                              checked={name.isMaidenName?.value === "NO"}
                              onChange={() => onInputChange(`${path}.names[${actualIndex}].isMaidenName.value`, "NO")}
                              disabled={isReadOnlyField(`${path}.names[${actualIndex}].isMaidenName.value`)}
                            />
                            No
                          </label>
                        </div>
                      </fieldset>
                    </div>
                    
                    {/* Reason for Name Change */}
                    <div className="col-span-1 md:col-span-2">
                      <label htmlFor={`reasonChanged-${name._id}`} className="block text-sm font-medium mb-1">
                        Reason for Name Change
                      </label>
                      <textarea
                        id={`reasonChanged-${name._id}`}
                        className="w-full p-2 border rounded"
                        rows={3}
                        value={name.reasonChanged?.value || ''}
                        onChange={(e) => onInputChange(`${path}.names[${actualIndex}].reasonChanged.value`, e.target.value)}
                        readOnly={isReadOnlyField(`${path}.names[${actualIndex}].reasonChanged.value`)}
                      />
                    </div>
                  </div>
                );
              })()}
            </div>
          ))}
          
          {/* Add button - only show if we haven't reached the maximum number of entries */}
          {canAddMoreEntries(`${path}.names`) && (
            <button
              type="button"
              className="mt-4 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded"
              onClick={handleAddName}
            >
              Add Another Name
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export { RenderNames }  ;
