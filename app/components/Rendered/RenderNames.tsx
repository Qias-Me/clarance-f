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
    maxEntries: 4, // Maximum of 4 names
    defaultVisible: true,
    isSectionActive: () => data.hasNames?.value === "YES"
  });
  
  // Track which entries should be visible
  const [visibleNames, setVisibleNames] = useState<ApplicantNames[]>([]);
  
  // Initialize the entry manager when component mounts or data changes
  useEffect(() => {
    if (data) {
      // Initialize entries based on current data
      const hasNames = data.hasNames?.value === "YES";
      
      if (hasNames) {
        // If data.names exists and has entries, initialize visibility for those entries
        if (data.names && data.names.length > 0) {
          // Set up visibility for existing entries
          entryManager.setVisibilityMap({
            [path]: data.names.map((_, index) => index)
          });
        } else {
          // If has names but no entries yet, create one from context and make it visible
          if (namesInfoContext && namesInfoContext.names && namesInfoContext.names.length > 0) {
            // Add the first name from context
            onAddEntry(`${path}.names`, namesInfoContext.names[0]);
            
            // Make the first entry visible
            entryManager.setVisibilityMap({
              [path]: [0]
            });
          }
        }
      } else {
        // Clear visibility if section is not active
        entryManager.setVisibilityMap({
          [path]: []
        });
      }
      
      // Update visible names
      updateVisibleNames();
    }
  }, [data.hasNames?.value]);
  
  // Update visible names when data.names changes
  useEffect(() => {
    if (data && data.names) {
      updateVisibleNames();
    }
  }, [data.names]);
  
  // Update the visible names based on visibility state
  const updateVisibleNames = () => {
    if (data.names && data.hasNames?.value === "YES") {
      // Only show entries that are marked as visible
      const visibleEntries = entryManager.getVisibleEntries(path, data.names);
      setVisibleNames(visibleEntries);
    } else {
      setVisibleNames([]);
    }
  };

  const handleHasNamesChange = (checked: boolean) => {
    // Update the form data
    onInputChange(`${path}.hasNames.value`, checked ? "YES" : "NO");

    // If toggling to YES and no names exist, add the first name from context
    if (checked) {
      if (!data.names || data.names.length === 0) {
        if (namesInfoContext && namesInfoContext.names && namesInfoContext.names.length > 0) {
          // Add the first name from context
          onAddEntry(`${path}.names`, namesInfoContext.names[0]);
          
          // Make the first entry visible
          entryManager.setVisibilityMap({
            [path]: [0]
          });
        }
      } else {
        // If names already exist, make them all visible
        entryManager.setVisibilityMap({
          [path]: data.names.map((_, i) => i)
        });
      }
    } 
    // If toggling to NO, hide all entries but keep the data
    else {
      // Hide all entries
      entryManager.setVisibilityMap({
        [path]: []
      });
    }
    
    // Update visible names after state change
    updateVisibleNames();
  };

  const handleAddName = () => {
    if (!namesInfoContext || !namesInfoContext.names) return;
    
    // Get the default name from context or template
    const newName = getDefaultNewItem(`namesInfo.names`);
    
    // Add to the form data
    onAddEntry(`${path}.names`, newName);
    
    // Make the new entry visible
    entryManager.addEntry(path);
    
    // Update visible names immediately
    setTimeout(updateVisibleNames, 0);
  };
  
  const handleRemoveName = (index: number) => {
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
    onRemoveEntry(`${path}.names`, index);
    
    // Get the updated visible indices after removal
    const updatedVisibleIndices = entryManager.getVisibleIndices(path).filter(
      (i) => i < (data.names?.length || 0) - 1
    );
    
    // Update visibility map to reflect the removed entry
    entryManager.setVisibilityMap({
      [path]: updatedVisibleIndices
    });
    
    // Update visible names immediately to reflect the change
    setTimeout(updateVisibleNames, 0);
  };

  // Check if we have reached the maximum number of names
  const hasMaxNames = !entryManager.canAddMoreEntries(path);

  // Helper function to check if an entry can be removed (must be the last added entry)
  const canRemoveEntry = (index: number): boolean => {
    if (visibleNames.length <= 1) return false; // Can't remove if it's the only entry
    
    const visibleIndices = entryManager.getVisibleIndices(path);
    if (visibleIndices.length === 0) return false;
    
    // Can only remove if it's the highest visible index (last added)
    return index === Math.max(...visibleIndices);
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
          {visibleNames.map((name: ApplicantNames, visibleIndex: number) => {
            // Find the actual index in the data array
            const actualIndex = data.names?.findIndex((n) => n === name) ?? visibleIndex;
            if (actualIndex === -1) return null; // Skip if not found
            
            // Determine if this entry can be removed based on LIFO rules
            const isRemovable = canRemoveEntry(actualIndex);
            
            return (
              <div key={actualIndex} className="p-6 shadow-md rounded-lg">
                <div className="grid grid-cols-1 md:grid-cols-6 gap-6 items-start">
                  {/** Text Inputs with more padding and subtle shadow */}
                  <input
                    type="text"
                    value={name.firstName.value}
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
                    value={name.lastName.value}
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
                    value={name.middleName.value}
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
                    value={name.suffix.value}
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

                  {/** Redesigned compact checkbox layout */}
                  <div className="md:col-span-1 flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={name.endDate.isPresent?.value === "YES"}
                      onChange={(e) =>
                        onInputChange(
                          `${path}.names[${actualIndex}].endDate.isPresent.value`,
                          e.target.checked ? "YES" : "NO"
                        )
                      }
                      className="form-checkbox h-4 w-4 text-blue-600 align-middle"
                    />
                    <label className="text-gray-700">Present</label>
                  </div>

                  <div className="md:col-span-1 flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={name.isMaidenName.value === "YES"}
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

                  <input
                    type="text"
                    value={name.reasonChanged.value}
                    onChange={(e) =>
                      onInputChange(
                        `${path}.names[${actualIndex}].reasonChanged.value`,
                        e.target.value
                      )
                    }
                    placeholder="Reason for Change"
                    className="md:col-span-3 p-3 border border-gray-300 rounded shadow-sm"
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
          Maximum of 4 names reached
        </div>
      )}
    </div>
  );
};

export { RenderNames };
