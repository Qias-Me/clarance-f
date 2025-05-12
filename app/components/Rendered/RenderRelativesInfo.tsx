import React, { useState, useEffect } from "react";
import { RenderSection18_1 } from "../_relatives/Section18.1";
import { RenderSection18_2 } from "../_relatives/Section18.2";
import { RenderSection18_3 } from "../_relatives/Section18.3";
import { RenderSection18_4 } from "../_relatives/Section18.4";
import { RenderSection18_5 } from "../_relatives/Section18.5";
import pkg from "lodash";
import {
  type RelativeEntry,
  type RelativesInfo,
  type RelativeCheckbox,
  type RelativeType,
  type RelativeDetails,
} from "api/interfaces/sections/relativesInfo";
import { type Field } from "api/interfaces/formDefinition";
import {type FormInfo} from "api/interfaces/FormInfo";
import FormEntryManager, { useFormEntryManager } from "../../utils/forms/FormEntryManager";


interface FormProps {
  data: RelativesInfo;
  onInputChange: (path: string, value: any) => void;
  onAddEntry: (path: string, newItem: any) => void;
  onRemoveEntry: (path: string, index: number) => void;
  getDefaultNewItem: (itemType: string) => any;
  isReadOnlyField: (fieldName: string) => boolean;
  path: string;
  formInfo: FormInfo;
}

const relativeTypesList: RelativeType[] = [
  "Mother",
  "Foster Parent",
  "Sister",
  "Half-Sister",
  "Father",
  "Child",
  "Stepbrother",
  "Father-in-law",
  "Stepmother",
  "Stepchild",
  "Stepsister",
  "Mother-in-law",
  "Stepfather",
  "Brother",
  "Half-Brother",
  "Guardian",
];

// Helper function to check if a string is a valid RelativeType
const isValidRelativeType = (type: string): type is RelativeType => {
  return relativeTypesList.includes(type as RelativeType);
};

// Helper function to safely convert a string to RelativeType
const toRelativeType = (type: string): RelativeType => {
  if (isValidRelativeType(type)) {
    return type as RelativeType;
  }
  console.warn(`Invalid relative type: ${type}, defaulting to "Mother"`);
  return "Mother"; // Default to a safe value
};

const RenderRelativesInfo: React.FC<FormProps> = ({
  data,
  onInputChange,
  onAddEntry,
  onRemoveEntry,
  getDefaultNewItem,
  isReadOnlyField,
  path,
}) => {
  const { cloneDeep } = pkg;
  const [selectedRelativeTypes, setSelectedRelativeTypes] = useState<
    RelativeCheckbox[]
  >(data.relativeTypes || []);
  
  // Use our custom hook to manage entry visibility
  const entryManager = useFormEntryManager({
    maxEntries: 20, // Reasonable limit for relatives
    defaultVisible: true,
    isSectionActive: () => selectedRelativeTypes.length > 0 // Active if any relative types are selected
  });
  
  // Track which entries should be visible
  const [visibleRelatives, setVisibleRelatives] = useState<RelativeEntry[]>([]);
  
  // Initialize the entry manager when component mounts or data changes
  useEffect(() => {
    if (data && data.entries) {
      // Initialize visibility for existing entries
      entryManager.setVisibilityMap({
        [path]: data.entries.map((_, index) => index)
      });
      
      // Update visible relatives
      updateVisibleRelatives();
    }
  }, []);
  
  // Update visible relatives when data.entries or selectedRelativeTypes changes
  useEffect(() => {
    if (data?.entries) {
      updateVisibleRelatives();
    }
  }, [data.entries, selectedRelativeTypes]);
  
  // Update the visible relatives based on visibility state
  const updateVisibleRelatives = () => {
    if (data.entries) {
      // Only show entries that are marked as visible
      const visibleEntries = entryManager.getVisibleEntries(path, data.entries);
      setVisibleRelatives(visibleEntries);
    } else {
      setVisibleRelatives([]);
    }
  };

  const handleInputChange = (fieldPath: string, value: any) => {
    onInputChange(fieldPath, value);
  };
  
  // Create a proper Field object for a RelativeType
  const createTypeField = (type: RelativeType): Field<RelativeType> => {
    return {
      value: type,
      id: `relativeType_${type}`,
      type: "RelativeType",
      label: type
    } as Field<RelativeType>;
  };

  const handleCheckboxChange = (type: RelativeType) => {
    // Check if the type is already selected
    const isSelected = selectedRelativeTypes.some((item) => item.type.value === type);

    // Update selectedRelativeTypes based on whether type was already selected
    let updatedSelectedTypes: RelativeCheckbox[];
    if (isSelected) {
      updatedSelectedTypes = selectedRelativeTypes.filter((item) => item.type.value !== type);
    } else {
      const newRelativeCheckbox: RelativeCheckbox = {
        _id: new Date().getTime(),
        name: type,
        type: createTypeField(type)
      };
      updatedSelectedTypes = [...selectedRelativeTypes, newRelativeCheckbox];
    }

    setSelectedRelativeTypes(updatedSelectedTypes);
    onInputChange(`${path}.relativeTypes`, updatedSelectedTypes);

    // Process only if a new type is being added and it's the first one
    if (!isSelected && updatedSelectedTypes.length === 1) {
      const newEntry = getDefaultNewItem("relativesInfo.entries");
      // Set the type field's value property
      newEntry.type = createTypeField(type);
      onAddEntry(`${path}.entries`, newEntry);
      
      // Make the new entry visible
      entryManager.setVisibilityMap({
        [path]: [0]
      });
      
      // Update visible relatives after state change
      setTimeout(updateVisibleRelatives, 0);
    } else if (isSelected) {
      // If a type is being deselected, update the visibility of related entries
      // Find entries with this type and hide them
      if (data.entries) {
        const indices = data.entries
          .map((entry, idx) => (entry.type.value === type ? idx : -1))
          .filter(idx => idx !== -1);
          
        if (indices.length > 0) {
          // Get current visibility
          const visibleIndices = entryManager.getVisibleIndices(path);
          // Remove the indices of this type
          const updatedVisibility = visibleIndices.filter(idx => !indices.includes(idx));
          
          // Update visibility map
          entryManager.setVisibilityMap({
            [path]: updatedVisibility
          });
          
          // Update visible relatives
          updateVisibleRelatives();
        }
      }
    }
  };


  const handleAddRelative = () => {
    // Only allow adding a relative if there are selected types
    if (selectedRelativeTypes.length === 0) {
      alert("Please select at least one relative type first");
      return;
    }
    
    // Get default relative from template
    const newEntry = getDefaultNewItem("relativesInfo.entries");
    // Set a default type (use the first selected type)
    const relativeType = toRelativeType(selectedRelativeTypes[0].type.value);
    newEntry.type = createTypeField(relativeType);
    
    // Add to the form data
    onAddEntry(`${path}.entries`, newEntry);
    
    // Make the new entry visible
    entryManager.addEntry(path);
    
    // Update visible relatives
    setTimeout(updateVisibleRelatives, 0);
  };
  
  const handleRemoveRelative = (index: number) => {
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
    onRemoveEntry(`${path}.entries`, index);
    
    // Get the updated visible indices after removal
    const updatedVisibleIndices = entryManager.getVisibleIndices(path).filter(
      (i) => i < (data.entries?.length || 0) - 1
    );
    
    // Update visibility map to reflect the removed entry
    entryManager.setVisibilityMap({
      [path]: updatedVisibleIndices
    });
    
    // Update visible relatives immediately to reflect the change
    setTimeout(updateVisibleRelatives, 0);
  };

  const getSectionsBasedOnRelative = (relative: RelativeEntry) => {
    const sections: (keyof RelativeDetails)[] = [];

    if (relative.isDeceased.value === "YES") {
      sections.push("section18_3");
    } else {
      sections.push("section18_1");
      if (relative.isUSCitizen.value === "YES" && relative.hasUSAddress.value === "YES") {
        sections.push("section18_2", "section18_3");
      }
      if (relative.isUSCitizen.value === "NO" && relative.hasUSAddress.value === "YES") {
        sections.push("section18_4");
      }
      if (relative.isUSCitizen.value === "NO" && relative.hasForeignAddress.value === "YES") {
        sections.push("section18_5");
      }
    }

    return sections;
  };

  const handleRelativeChange = (relativeId: number, newType: RelativeType, index: number) => {
    // Find the specific entry using its ID
    const relativeIndex = data.entries.findIndex((entry) => entry._id === relativeId);
    if (relativeIndex === -1) {
      console.error("Relative not found");
      return;
    }
  
    // Get necessary sections based on the new relative type
    const necessarySections = getSectionsBasedOnRelative(data.entries[relativeIndex]);
    
    // Deep clone the entry to modify
    const updatedEntry = cloneDeep(data.entries[relativeIndex]);
    
    // Ensure the type field is properly updated
    updatedEntry.type = createTypeField(newType);
  
    // Remove unnecessary sections
    Object.keys(updatedEntry.details).forEach((key) => {
      if (key.startsWith("section18") && !necessarySections.includes(key as keyof RelativeDetails)) {
        delete updatedEntry.details[key as keyof RelativeDetails];
      }
    });
  
    // Add missing necessary sections with default values
    necessarySections.forEach((section) => {
      if (!updatedEntry.details[section]) {
        updatedEntry.details[section] = getDefaultNewItem(`relativesInfo.entries.details.${section}`);
      }
    });
  
    // Update the global data state and trigger input changes
    onInputChange(`${path}.entries[${index}]`, updatedEntry);
  };
  
  const canAddMoreRelatives = entryManager.canAddMoreEntries(path);
  
  return (
    <div className="p-4 bg-gray-50 rounded-lg shadow space-y-4">
      <h3 className="text-lg font-semibold">Section 17 - Relatives</h3>
      <div className="space-y-2">
        <div className="flex flex-col space-y-4">
          <label htmlFor={`relativeTypes`} className="mr-2">
            Select each type of relative applicable to you, regardless if they
            are living or deceased. (An opportunity will be provided to list
            multiple relatives for each type.) Check all that apply.
          </label>
          {relativeTypesList.map((type) => (
            <div key={type} className="flex items-center space-x-2">
              <input
                type="checkbox"
                id={`relativeType_${type}`}
                name={`relativeType_${type}`}
                value={type}
                checked={selectedRelativeTypes.some(
                  (item) => item.type.value === type
                )}
                onChange={() => handleCheckboxChange(type)}
                disabled={isReadOnlyField(`${path}.relativeTypes`)}
                className="form-checkbox h-5 w-5 text-blue-600"
              />
              <label htmlFor={`relativeType_${type}`} className="text-gray-700">{type}</label>
            </div>
          ))}
        </div>
      </div>

      {visibleRelatives.map((entry) => {
        // Find the actual index in the data array
        const index = data.entries.findIndex((e) => e === entry);
        if (index === -1) return null; // Skip if not found
        
        return (
          <div key={entry._id} className="relative-entry space-y-2 p-4 border border-gray-200 rounded-lg shadow-sm">
            <div className="relative-details space-y-2">
              <div>
                <label htmlFor={`type-${entry._id}`}>
                  <strong>Type:</strong>
                </label>
                <select
                  id={`type-${entry._id}`}
                  value={entry.type.value}
                  onChange={(e) => {
                    // Convert string to RelativeType safely
                    const relativeType = toRelativeType(e.target.value);
                    handleRelativeChange(entry._id, relativeType, index);
                  }}
                  disabled={isReadOnlyField(`${path}.entries[${index}].type`)}
                  className="ml-2 p-2 border border-gray-300 rounded"
                >
                  {selectedRelativeTypes.map((relType) => (
                    <option key={relType._id} value={relType.type.value}>
                      {relType.type.value}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {entry.details.section18_1 && (
              <RenderSection18_1
                data={entry.details.section18_1}
                onInputChange={(fieldPath, value) => {
                  handleInputChange(`${fieldPath}`, value);
                }}
                path={`${path}.entries[${index}].details.section18_1`}
                isReadOnlyField={isReadOnlyField}
              />
            )}
            {entry.details.section18_2 && (
              <RenderSection18_2
                data={entry.details.section18_2}
                onInputChange={(fieldPath, value) => {
                  handleInputChange(`${fieldPath}`, value);
                }}
                path={`${path}.entries[${index}].details.section18_2`}
                isReadOnlyField={isReadOnlyField}
              />
            )}
            {entry.details.section18_3 && (
              <RenderSection18_3
                data={entry.details.section18_3}
                onInputChange={(fieldPath, value) => {
                  handleInputChange(`${fieldPath}`, value);
                }}
                path={`${path}.entries[${index}].details.section18_3`}
                isReadOnlyField={isReadOnlyField}
              />
            )}
            {entry.details.section18_4 && (
              <RenderSection18_4
                data={entry.details.section18_4}
                onInputChange={(fieldPath, value) => {
                  handleInputChange(`${fieldPath}`, value);
                }}
                path={`${path}.entries[${index}].details.section18_4`}
                isReadOnlyField={isReadOnlyField}
              />
            )}
            {entry.details.section18_5 && (
              <RenderSection18_5
                data={entry.details.section18_5}
                onInputChange={(fieldPath, value) => {
                  handleInputChange(`${fieldPath}`, value);
                }}
                path={`${path}.entries[${index}].details.section18_5`}
                isReadOnlyField={isReadOnlyField}
              />
            )}

            <button
              type="button"
              onClick={() => handleRemoveRelative(index)}
              className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition"
              disabled={visibleRelatives.length <= 1 && selectedRelativeTypes.length > 0}
            >
              Remove Relative
            </button>
          </div>
        );
      })}

      {selectedRelativeTypes.length > 0 && canAddMoreRelatives && (
        <button
          type="button"
          onClick={handleAddRelative}
          className="px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
        >
          Add Another Relative
        </button>
      )}
      
      {!canAddMoreRelatives && (
        <div className="text-sm text-gray-600 italic mt-2">
          Maximum number of relatives reached
        </div>
      )}
    </div>
  );
};

export { RenderRelativesInfo };
