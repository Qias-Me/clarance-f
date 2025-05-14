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
  // Use our custom hook to manage entry visibility
  const entryManager = useFormEntryManager({
    maxEntries: 4, // Maximum of 4 names as defined in context
    defaultVisible: true,
    isSectionActive: () => data.hasNames?.value === "YES"
  });
  
  // Track which entries should be visible
  const [visibleNames, setVisibleNames] = useState<ApplicantNames[]>([]);
  
  // Update the visible names based on visibility state
  const updateVisibleNames = () => {
    if (!data) {
      setVisibleNames([]);
      return;
    }
    
    if (data.hasNames?.value === "YES" && Array.isArray(data.names)) {
      // Get entries that are marked as visible
      const visibleEntries = entryManager.getVisibleEntries(path, data.names);
      setVisibleNames(visibleEntries);
    } else {
      setVisibleNames([]);
    }
  };
  
  // Initialize names array if it doesn't exist
  useEffect(() => {
    if (data && data.hasNames?.value === "YES" && !Array.isArray(data.names)) {
      onInputChange(`${path}.names`, []);
    }
  }, [data, data?.hasNames?.value, onInputChange, path]);
  
  // Initialize the entry manager when component mounts or hasNames changes
  useEffect(() => {
    if (!data) return;
    
    const hasNames = data.hasNames?.value === "YES";
    
    if (hasNames) {
      if (Array.isArray(data.names) && data.names.length > 0) {
        // Get indices of all existing names to show them
        const indices = Array.from({ length: data.names.length }, (_, i) => i);
        entryManager.setVisibilityMap({
          [path]: indices
        });
      } else if (!Array.isArray(data.names) || data.names.length === 0) {
        // If no names exist yet, create the first one from context
        if (namesInfoContext && namesInfoContext.names && namesInfoContext.names.length > 0) {
          // Create a deep copy of the first name template from context
          // This preserves the correct field IDs for PDF mapping
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
          
          // Set the new entry as the only item in the names array
          onInputChange(`${path}.names`, [firstNameEntry]);
          
          // Make only the first entry visible
          entryManager.setVisibilityMap({
            [path]: [0]
          });
        }
      }
    } else {
      // If hasNames is NO, hide all entries but keep the data
      entryManager.setVisibilityMap({
        [path]: []
      });
    }
    
    // Update visible names after initialization
    updateVisibleNames();
  }, [data?.hasNames?.value]);
  
  // Update visible names when data.names changes
  useEffect(() => {
    if (data) {
      updateVisibleNames();
    }
  }, [data?.names]);

  const handleHasNamesChange = (checked: boolean) => {
    // Update the form data
    onInputChange(`${path}.hasNames.value`, checked ? "YES" : "NO");

    if (checked) {
      // If toggling to YES
      if (!Array.isArray(data.names) || data.names.length === 0) {
        // Create first entry from context if none exists
        if (namesInfoContext && namesInfoContext.names && namesInfoContext.names.length > 0) {
          // Use the first template from context
          const firstNameEntry = JSON.parse(JSON.stringify(namesInfoContext.names[0]));
          
          // Clear values but keep IDs
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
          
          // Create names array with the first entry
          onInputChange(`${path}.names`, [firstNameEntry]);
          
          // Make only the first entry visible
          entryManager.setVisibilityMap({
            [path]: [0]
          });
        }
      } else if (Array.isArray(data.names) && data.names.length > 0) {
        // If names already exist, show all of them
        const indices = Array.from({ length: data.names.length }, (_, i) => i);
        entryManager.setVisibilityMap({
          [path]: indices
        });
      }
    } else {
      // If toggling to NO, hide all entries but keep the data
      entryManager.setVisibilityMap({
        [path]: []
      });
    }
  };

  const handleAddName = () => {
    // Make sure data.names is initialized as an array
    if (!Array.isArray(data.names)) {
      onInputChange(`${path}.names`, []);
      return; // Return early and let the effect handle initialization
    }
    
    // We can only have up to 4 names as defined in the context
    if (!namesInfoContext || !namesInfoContext.names || data.names.length >= namesInfoContext.names.length) {
      console.warn(`Maximum number of names reached (${namesInfoContext?.names?.length || 4})`);
      return;
    }
    
    // Find which context template to use next based on _id values
    // The context has entries with _id values 1, 2, 3, 4
    const existingIds = new Set(data.names.map(name => name._id));
    
    // Find first unused template from context
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
    
    // Add the new name to the array (sort by _id to ensure correct order)
    const updatedNames = [...data.names, newName].sort((a, b) => 
      (a._id as number) - (b._id as number)
    );
    
    // Update the form data
    onInputChange(`${path}.names`, updatedNames);
    
    // Update visibility to show all entries - find the new index after sorting
    const indices = Array.from({ length: updatedNames.length }, (_, i) => i);
    entryManager.setVisibilityMap({
      [path]: indices
    });
  };
  
  const handleRemoveName = (index: number) => {
    // Make sure data.names is an array
    if (!Array.isArray(data.names) || index < 0 || index >= data.names.length) {
      return;
    }
    
    // Can only remove the highest _id (last added entry)
    if (data.names.length > 1) {
      const ids = data.names.map(name => name._id as number);
      const maxId = Math.max(...ids);
      const currentId = data.names[index]._id as number;
      
      if (currentId !== maxId) {
        alert("Entries must be removed in reverse order of addition (last in, first out)");
        return;
      }
    }
    
    // Create a copy of the names array
    const updatedNames = [...data.names];
    
    // Remove the item from the array
    updatedNames.splice(index, 1);
    
    // Update the form data
    onInputChange(`${path}.names`, updatedNames);
    
    // Update the visibility map to show all remaining entries
    const indices = Array.from({ length: updatedNames.length }, (_, i) => i);
    entryManager.setVisibilityMap({
      [path]: indices
    });
  };

  // Check if we have reached the maximum number of names
  const hasMaxNames = Array.isArray(data.names) && 
                     namesInfoContext && 
                     namesInfoContext.names && 
                     data.names.length >= namesInfoContext.names.length;

  // Helper function to check if an entry can be removed
  const canRemoveEntry = (index: number): boolean => {
    if (!Array.isArray(data.names) || data.names.length <= 1) {
      return false; // Can't remove if it's the only entry
    }
    
    // Can only remove the entry with the highest _id
    const ids = data.names.map(name => name._id as number);
    const maxId = Math.max(...ids);
    const currentId = data.names[index]._id as number;
    
    return currentId === maxId;
  };

  // Handle when "Present" checkbox is toggled for an end date
  const handlePresentChange = (index: number, checked: boolean) => {
    // Update the checkbox value
    onInputChange(
      `${path}.names[${index}].endDate.isPresent.value`,
      checked ? "YES" : "NO"
    );
    
    // If "Present" is checked, disable the end date field
    if (checked) {
      onInputChange(
        `${path}.names[${index}].endDate.date.value`,
        "Present"
      );
    } else {
      // If unchecked, clear the "Present" text
      onInputChange(
        `${path}.names[${index}].endDate.date.value`,
        ""
      );
    }
  };
  
  // Get a label for the name entry based on the template's _id
  const getNameEntryLabel = (name: ApplicantNames): string => {
    const id = name._id as number;
    
    // Labels corresponding to the specific context entries
    const labels = {
      1: "First Alternative Name",
      2: "Second Alternative Name",
      3: "Third Alternative Name",
      4: "Fourth Alternative Name"
    };
    
    return labels[id as keyof typeof labels] || `Name #${id}`;
  };

  return (
    <div className="p-4 bg-gray-100 rounded mb-2 grid grid-cols-1 gap-4">
      <div className="flex justify-between items-center">
        <strong className="font-semibold text-gray-800 text-lg md:text-lg">
          Section 5
        </strong>
        <label className="flex items-center space-x-2">
          <span className="text-sm text-gray-700">Has Names:</span>
          <input
            type="checkbox"
            checked={data.hasNames?.value === "YES"}
            onChange={(e) => handleHasNamesChange(e.target.checked)}
            className="form-checkbox h-5 w-5 text-blue-600"
          />
        </label>
      </div>
      
      {data.hasNames?.value === "YES" && (
        <div className="space-y-6">
          {Array.isArray(visibleNames) && visibleNames.map((name: ApplicantNames, visibleIndex: number) => {
            // Find the actual index in the data array by matching _id
            const actualIndex = Array.isArray(data.names) 
              ? data.names.findIndex((n) => n && name && n._id === name._id) 
              : -1;
              
            if (actualIndex === -1) return null; // Skip if not found
            
            // Determine if this entry can be removed based on _id rules
            const isRemovable = canRemoveEntry(actualIndex);
            
            // Check if "Present" is checked for end date
            const isPresentChecked = name.endDate?.isPresent?.value === "YES";
            
            // Get name entry label based on _id
            const nameEntryLabel = getNameEntryLabel(name);
            
            return (
              <div key={name._id} className="p-6 shadow-md rounded-lg">
                <div className="mb-3 text-lg font-medium text-gray-700">
                  {nameEntryLabel}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-6 gap-6 items-start">
                  {/** Text Inputs with more padding and subtle shadow */}
                  <input
                    type="text"
                    value={name.firstName?.value || ""}
                    onChange={(e) =>
                      onInputChange(
                        `${path}.names[${actualIndex}].firstName.value`,
                        e.target.value
                      )
                    }
                    placeholder="First Name"
                    className="col-span-2 p-3 border border-gray-300 rounded shadow-sm"
                    readOnly={isReadOnlyField("firstName")}
                  />
                  <input
                    type="text"
                    value={name.lastName?.value || ""}
                    onChange={(e) =>
                      onInputChange(
                        `${path}.names[${actualIndex}].lastName.value`,
                        e.target.value
                      )
                    }
                    placeholder="Last Name"
                    className="col-span-2 p-3 border border-gray-300 rounded shadow-sm"
                    readOnly={isReadOnlyField("lastName")}
                  />
                  <input
                    type="text"
                    value={name.middleName?.value || ""}
                    onChange={(e) =>
                      onInputChange(
                        `${path}.names[${actualIndex}].middleName.value`,
                        e.target.value
                      )
                    }
                    placeholder="Middle Name"
                    className="col-span-2 p-3 border border-gray-300 rounded shadow-sm"
                    readOnly={isReadOnlyField("middleName")}
                  />
                  <select
                    value={name.suffix?.value || ""}
                    onChange={(e) =>
                      onInputChange(
                        `${path}.names[${actualIndex}].suffix.value`,
                        e.target.value
                      )
                    }
                    className="md:col-span-1 p-3 border border-gray-300 rounded shadow-sm"
                    disabled={isReadOnlyField("suffix")}
                  >
                    <option value="">Select a suffix</option>
                    {Object.entries(SuffixOptions).map(([key, value]) => (
                      <option key={key} value={value}>
                        {value}
                      </option>
                    ))}
                  </select>

                  {/* Date fields */}
                  <div className="md:col-span-3 space-y-2">
                    <div className="flex flex-col">
                      <label className="text-sm text-gray-600 mb-1">From Date (mm/yyyy)</label>
                      <div className="flex items-center space-x-2">
                        <input
                          type="text"
                          value={name.startDate?.date?.value || ""}
                          onChange={(e) =>
                            onInputChange(
                              `${path}.names[${actualIndex}].startDate.date.value`,
                              e.target.value
                            )
                          }
                          placeholder="mm/yyyy"
                          className="flex-1 p-2 border border-gray-300 rounded shadow-sm"
                          readOnly={isReadOnlyField("startDate.date")}
                        />
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            checked={name.startDate?.estimated?.value === "YES"}
                            onChange={(e) =>
                              onInputChange(
                                `${path}.names[${actualIndex}].startDate.estimated.value`,
                                e.target.checked ? "YES" : "NO"
                              )
                            }
                            className="form-checkbox h-4 w-4 text-blue-600"
                          />
                          <label className="ml-1 text-xs text-gray-600">Estimated</label>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex flex-col">
                      <label className="text-sm text-gray-600 mb-1">To Date (mm/yyyy)</label>
                      <div className="flex items-center space-x-2">
                        <input
                          type="text"
                          value={name.endDate?.date?.value || ""}
                          onChange={(e) =>
                            onInputChange(
                              `${path}.names[${actualIndex}].endDate.date.value`,
                              e.target.value
                            )
                          }
                          placeholder="mm/yyyy"
                          className="flex-1 p-2 border border-gray-300 rounded shadow-sm"
                          readOnly={isPresentChecked || isReadOnlyField("endDate.date")}
                        />
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            checked={name.endDate?.estimated?.value === "YES"}
                            onChange={(e) =>
                              onInputChange(
                                `${path}.names[${actualIndex}].endDate.estimated.value`,
                                e.target.checked ? "YES" : "NO"
                              )
                            }
                            className="form-checkbox h-4 w-4 text-blue-600"
                            disabled={isPresentChecked}
                          />
                          <label className="ml-1 text-xs text-gray-600">Est.</label>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Checkboxes */}
                  <div className="md:col-span-2 space-y-4">
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={name.endDate?.isPresent?.value === "YES"}
                        onChange={(e) => handlePresentChange(actualIndex, e.target.checked)}
                        className="form-checkbox h-4 w-4 text-blue-600 align-middle"
                      />
                      <label className="text-gray-700">Present</label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={name.isMaidenName?.value === "YES"}
                        onChange={(e) =>
                          onInputChange(
                            `${path}.names[${actualIndex}].isMaidenName.value`,
                            e.target.checked ? "YES" : "NO"
                          )
                        }
                        className="form-checkbox h-4 w-4 text-blue-600 align-middle"
                      />
                      <label className="text-gray-700">Maiden Name</label>
                    </div>
                  </div>

                  <input
                    type="text"
                    value={name.reasonChanged?.value || ""}
                    onChange={(e) =>
                      onInputChange(
                        `${path}.names[${actualIndex}].reasonChanged.value`,
                        e.target.value
                      )
                    }
                    placeholder="Reason for Change"
                    className="md:col-span-6 p-3 border border-gray-300 rounded shadow-sm"
                    readOnly={isReadOnlyField("reasonChanged.value")}
                  />
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveName(actualIndex)}
                  className={`mt-4 py-2 px-4 ${isRemovable ? 'bg-red-500 hover:bg-red-700' : 'bg-gray-400 cursor-not-allowed'} text-white rounded transition duration-150`}
                  disabled={!isRemovable}
                  title={!isRemovable && visibleNames.length > 1 ? "Entries must be removed in reverse order (last added, first removed)" : ""}
                >
                  Remove Name
                </button>
                {!isRemovable && visibleNames.length > 1 && (
                  <div className="text-xs text-gray-500 italic mt-1">
                    Entries must be removed in reverse order (last added, first removed)
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {data.hasNames?.value === "YES" && !hasMaxNames && visibleNames.length > 0 && (
        <button
          type="button"
          onClick={handleAddName}
          className="py-1 px-3 bg-green-500 text-white rounded hover:bg-green-600 transition duration-150 mt-2"
        >
          Add New Name
        </button>
      )}

      {data.hasNames?.value === "YES" && !visibleNames.length && (
        <button
          type="button"
          onClick={handleAddName}
          className="py-1 px-3 bg-green-500 text-white rounded hover:bg-green-600 transition duration-150 mt-2"
        >
          Add First Name
        </button>
      )}

      {data.hasNames?.value === "YES" && hasMaxNames && (
        <div className="text-sm text-gray-600 italic mt-2">
          Maximum of {namesInfoContext?.names?.length || 4} names reached
        </div>
      )}
    </div>
  );
};

export { RenderNames };
