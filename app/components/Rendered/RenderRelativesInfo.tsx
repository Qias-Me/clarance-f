import React, { useState, useEffect, useMemo } from "react";
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
  type Countries,
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

// Helper function to check if a value is a valid RelativeType
const isValidRelativeType = (value: string): boolean => {
  const validTypes = [
    "Mother", "Foster Parent", "Sister", "Half-Sister",
    "Father", "Child", "Stepbrother", "Father-in-law",
    "Stepmother", "Stepchild", "Stepsister", "Mother-in-law",
    "Stepfather", "Brother", "Half-Brother", "Guardian"
  ];
  return validTypes.includes(value);
};

// Helper function to safely convert a string to RelativeType
const toRelativeType = (type: string): RelativeType => {
  if (isValidRelativeType(type)) {
    return type as RelativeType;
  }
  console.warn(`Invalid relative type: ${type}, defaulting to "Mother"`);
  return "Mother"; // Default to a safe value
};

// Helper to get necessary sections based on relative type
const getSectionsBasedOnRelative = (
  relative: RelativeEntry
): (keyof RelativeDetails)[] => {
  const type = relative.type.value;
  const baseSections: (keyof RelativeDetails)[] = ["section18_1"];

  switch (type) {
    case "Mother":
    case "Father":
    case "Stepmother":
    case "Stepfather":
    case "Foster Parent":
    case "Guardian":
      return [...baseSections, "section18_2", "section18_3"];
    case "Child":
    case "Stepchild":
      return [...baseSections, "section18_4"];
    case "Brother":
    case "Sister":
    case "Stepbrother":
    case "Stepsister":
    case "Half-Brother":
    case "Half-Sister":
      return [...baseSections, "section18_2", "section18_5"];
    case "Father-in-law":
    case "Mother-in-law":
      return [...baseSections, "section18_2"];
    default:
      return baseSections;
  }
};

// Helper function to safely access Field values
const getFieldValue = (field?: Field<any>): string => {
  return field && typeof field === 'object' && 'value' in field ? `${field.value}` : '';
};

const RenderRelativesInfo: React.FC<FormProps> = ({
  data,
  onInputChange,
  onAddEntry,
  onRemoveEntry,
  getDefaultNewItem,
  isReadOnlyField,
  path,
  formInfo
}) => {
  const { cloneDeep } = pkg;
  
  // Track selected relative types with state
  const [selectedRelativeTypes, setSelectedRelativeTypes] = useState<RelativeCheckbox[]>(
    data.relativeTypes?.filter(rt => rt.type.value === "Yes") || []
  );
  
  // Track expanded/collapsed state for each entry
  const [expandedEntries, setExpandedEntries] = useState<Record<number, boolean>>({});
  
  // Enhanced state tracking for visible relatives
  const [visibleRelatives, setVisibleRelatives] = useState<RelativeEntry[]>([]);
  
  // Track if we're currently in edit mode for a relative
  const [editingRelativeId, setEditingRelativeId] = useState<number | null>(null);
  
  // Initialize expanded state for entries
  useEffect(() => {
    if (data?.entries?.length) {
      const initialExpanded: Record<number, boolean> = {};
      data.entries.forEach(entry => {
        initialExpanded[entry._id] = true; // Default to expanded
      });
      setExpandedEntries(initialExpanded);
    }
  }, []);
  
  // Group relative checkboxes by category for better organization
  const relativeTypeCategories = useMemo(() => {
    const categories = {
      parents: ["Mother", "Father", "Stepmother", "Stepfather", "Foster Parent"],
      children: ["Child", "Stepchild"],
      siblings: ["Brother", "Sister", "Stepbrother", "Stepsister", "Half-Brother", "Half-Sister"],
      inlaws: ["Father-in-law", "Mother-in-law"],
      other: ["Guardian"]
    };
    
    // Put each checkbox in its category
    return Object.entries(categories).map(([category, types]) => ({
      category,
      types: data.relativeTypes?.filter(rt => types.includes(rt.name)) || []
    }));
  }, [data.relativeTypes]);
  
  // Use enhanced form entry manager with improved configurations for relatives
  const entryManager = useFormEntryManager({
    maxEntries: 50, // Increased limit for large families
    defaultVisible: true,
    isSectionActive: () => selectedRelativeTypes.length > 0, // Active if any relative types are selected
    subsectionConfigs: [
      {
        parentSectionPath: 'relativesInfo',
        subsectionId: '18.1',
        entriesPath: 'relativesInfo.entries',
        hasFlag: 'relativesInfo.hasEntries'
      },
      {
        parentSectionPath: 'relativesInfo',
        subsectionId: '18.2',
        entriesPath: 'relativesInfo.entries',
        hasFlag: 'relativesInfo.hasEntries'
      },
      {
        parentSectionPath: 'relativesInfo',
        subsectionId: '18.3',
        entriesPath: 'relativesInfo.entries',
        hasFlag: 'relativesInfo.hasEntries'
      },
      {
        parentSectionPath: 'relativesInfo',
        subsectionId: '18.4',
        entriesPath: 'relativesInfo.entries',
        hasFlag: 'relativesInfo.hasEntries'
      },
      {
        parentSectionPath: 'relativesInfo',
        subsectionId: '18.5',
        entriesPath: 'relativesInfo.entries',
        hasFlag: 'relativesInfo.hasEntries'
      }
    ]
  });
  
  // Initialize the entry manager when component mounts or data changes
  useEffect(() => {
    if (data?.entries?.length) {
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
  
  // Helper to toggle expanded state for an entry
  const toggleExpanded = (entryId: number) => {
    setExpandedEntries(prev => ({
      ...prev,
      [entryId]: !prev[entryId]
    }));
  };
  
  // Update the visible relatives based on visibility state with improved handling
  const updateVisibleRelatives = () => {
    if (data.entries) {
      // Only show entries that are marked as visible in the entry manager
      const visibleEntries = entryManager.getVisibleEntries(path, data.entries);
      setVisibleRelatives(visibleEntries);
      
      // Initialize expanded state for any new entries
      visibleEntries.forEach(entry => {
        if (expandedEntries[entry._id] === undefined) {
          setExpandedEntries(prev => ({
            ...prev,
            [entry._id]: true // Default new entries to expanded
          }));
        }
      });
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

  // Enhanced checkbox handling with improved UX
  const handleCheckboxChange = (type: RelativeType) => {
    // Check if the type is already selected
    const isSelected = selectedRelativeTypes.some((item) => item.type.value === type);

    // Get the checkbox entry from the data
    const checkbox = data.relativeTypes.find(rt => rt.name === type);
    if (!checkbox) return;
    
    // Toggle the checkbox value
    const updatedCheckbox = {
      ...checkbox,
      type: {
        ...checkbox.type,
        value: isSelected ? "No" : "Yes"
      }
    };
    
    // Update in the form data
    const updatedRelativeTypes = data.relativeTypes.map(rt => 
      rt.name === type ? updatedCheckbox : rt
    );
    
    // Update the selected types state for the component
    const newSelectedTypes = updatedRelativeTypes.filter(rt => rt.type.value === "Yes");
    setSelectedRelativeTypes(newSelectedTypes);
    
    // Update the form state
    onInputChange(`${path}.relativeTypes`, updatedRelativeTypes);

    // If this is the first type being added, automatically add an entry
    if (!isSelected && newSelectedTypes.length === 1) {
      const newEntry = getDefaultNewItem("relativesInfo.entries");
      // Set the type field to match the selected relative type
      newEntry.type = createTypeField(type);
      onAddEntry(`${path}.entries`, newEntry);
      
      // Make the new entry visible in the entry manager
      entryManager.setVisibilityMap({
        [path]: [0]
      });
      
      // Update visible relatives to include the new entry
      setTimeout(updateVisibleRelatives, 0);
    } 
    // If a type is being deselected, update entries of this type
    else if (isSelected) {
      // Find entries with this type
      if (data.entries) {
        const indices = data.entries
          .map((entry, idx) => (entry.type.value === type ? idx : -1))
          .filter(idx => idx !== -1);
          
        if (indices.length > 0) {
          // Prompt user if they want to remove these entries
          if (confirm(`Remove ${indices.length} ${type} entries?`)) {
            // Remove entries of this type
            indices.sort((a, b) => b - a); // Sort in descending order to remove from end first
            indices.forEach(idx => {
              onRemoveEntry(`${path}.entries`, idx);
            });
            
            // Update visibility map without these entries
            const visibleIndices = entryManager.getVisibleIndices(path);
            const updatedVisibility = visibleIndices.filter(idx => !indices.includes(idx));
            
            entryManager.setVisibilityMap({
              [path]: updatedVisibility
            });
            
            updateVisibleRelatives();
          } else {
            // User cancelled - revert the checkbox change
            const revertedCheckbox = {
              ...checkbox,
              type: {
                ...checkbox.type,
                value: "Yes"
              }
            };
            
            const revertedTypes = data.relativeTypes.map(rt => 
              rt.name === type ? revertedCheckbox : rt
            );
            
            onInputChange(`${path}.relativeTypes`, revertedTypes);
            setSelectedRelativeTypes(newSelectedTypes.concat([checkbox]));
          }
        }
      }
    }
  };

  // Enhanced functionality for adding relatives
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
    
    // Ensure all necessary sections based on type
    const necessarySections = getSectionsBasedOnRelative(newEntry);
    necessarySections.forEach(section => {
      if (!newEntry.details[section]) {
        newEntry.details[section] = getDefaultNewItem(`relativesInfo.entries.details.${section}`);
      }
    });
    
    // Add to the form data
    onAddEntry(`${path}.entries`, newEntry);
    
    // Make the new entry visible using the entry manager
    entryManager.addEntry(path);
    
    // Update visible relatives
    setTimeout(updateVisibleRelatives, 0);
  };
  
  // Enhanced removal with better safety checks
  const handleRemoveRelative = (index: number) => {
    const relative = data.entries[index];
    if (!relative) return;
    
    // Confirm deletion with the user
    if (!confirm(`Are you sure you want to remove this ${relative.type.value}?`)) {
      return;
    }
    
    // Hide the entry and remove it from the data
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
    
    // Update visible relatives
    setTimeout(updateVisibleRelatives, 0);
    
    // Clear editing state if removing the entry being edited
    if (editingRelativeId === relative._id) {
      setEditingRelativeId(null);
    }
  };
  
  // Handle changing a relative's type
  const handleRelativeChange = (relativeId: number, newType: RelativeType, index: number) => {
    // Find the specific entry using its ID
    const relativeIndex = data.entries.findIndex((entry) => entry._id === relativeId);
    if (relativeIndex === -1) {
      console.error("Relative not found");
      return;
    }
  
    // Get necessary sections based on the new relative type
    const necessarySections = getSectionsBasedOnRelative({
      ...data.entries[relativeIndex],
      type: createTypeField(newType)
    });
    
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
  
    // Update the global data state
    onInputChange(`${path}.entries[${index}]`, updatedEntry);
  };
  
  // Toggle edit mode for a relative
  const toggleEditMode = (relativeId: number) => {
    setEditingRelativeId(editingRelativeId === relativeId ? null : relativeId);
  };
  
  // Check if we can add more relatives
  const canAddMoreRelatives = entryManager.canAddMoreEntries(path);

  // Get the set of types that have been selected
  const selectedTypeNames = selectedRelativeTypes.map(rt => rt.name);

  return (
    <div className="space-y-6">
      <div className="bg-blue-50 p-6 rounded-lg shadow-md">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">Relatives Information</h3>
        
        {/* Relative Type Selection with improved UI */}
        <div className="mb-6">
          <h4 className="text-lg font-medium text-gray-700 mb-2">Select Relative Types</h4>
          <p className="text-sm text-gray-600 mb-4">
            Select each type of relative applicable to you, regardless if they are living or deceased.
          </p>
          
          {/* Organized relative type categories */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {relativeTypeCategories.map(category => (
              <div key={category.category} className="bg-white p-4 rounded-lg shadow-sm">
                <h5 className="font-medium text-gray-700 capitalize mb-2">{category.category}</h5>
                <div className="space-y-2">
                  {category.types.map(relType => {
                    const isSelected = relType.type.value === "Yes";
                    return (
                      <div key={relType._id} className="flex items-center">
                        <div 
                          className={`flex items-center p-2 rounded-md w-full transition-colors
                            ${isSelected ? 'bg-blue-50 border border-blue-200' : 'hover:bg-gray-50'}`}
                        >
                          <input
                            type="checkbox"
                            id={`rel-type-${relType._id}`}
                            checked={isSelected}
                            onChange={() => handleCheckboxChange(relType.name as RelativeType)}
                            className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                          />
                          <label 
                            htmlFor={`rel-type-${relType._id}`}
                            className={`ml-2 text-sm ${isSelected ? 'text-blue-700 font-medium' : 'text-gray-700'}`}
                          >
                            {relType.name}
                          </label>
                          {isSelected && (
                            <span className="ml-auto text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded-full">
                              {data.entries.filter(e => e.type.value === relType.name).length || 0}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Relatives List */}
        <div className="mt-8">
          <div className="flex justify-between items-center mb-4">
            <h4 className="text-lg font-medium text-gray-700">Your Relatives</h4>
            <button
              type="button"
              onClick={handleAddRelative}
              disabled={!canAddMoreRelatives || selectedRelativeTypes.length === 0}
              className={`px-4 py-2 rounded-md text-sm font-medium text-white 
                ${canAddMoreRelatives && selectedRelativeTypes.length > 0 
                  ? 'bg-blue-600 hover:bg-blue-700' 
                  : 'bg-gray-400 cursor-not-allowed'}`}
            >
              Add Relative
            </button>
          </div>
          
          {selectedRelativeTypes.length === 0 && (
            <div className="bg-yellow-50 p-4 rounded-md border border-yellow-200">
              <p className="text-yellow-700">
                Please select at least one relative type above to begin adding relatives.
              </p>
            </div>
          )}
          
          {selectedRelativeTypes.length > 0 && visibleRelatives.length === 0 && (
            <div className="bg-yellow-50 p-4 rounded-md border border-yellow-200">
              <p className="text-yellow-700">
                No relatives added yet. Click "Add Relative" to start adding your relatives.
              </p>
            </div>
          )}
          
          {/* Relative Entries */}
          <div className="space-y-4 mt-2">
            {visibleRelatives.map((entry) => {
              // Find the actual index in the data array
              const index = data.entries.findIndex((e) => e === entry);
              if (index === -1) return null; // Skip if not found
              
              const isEditing = editingRelativeId === entry._id;
              const isExpanded = expandedEntries[entry._id] ?? true;
              
              return (
                <div 
                  key={entry._id} 
                  className="relative-entry border border-gray-200 rounded-lg shadow-sm overflow-hidden"
                >
                  {/* Enhanced header with type and actions */}
                  <div className="bg-gray-50 px-4 py-3 flex justify-between items-center border-b border-gray-200">
                    <div className="flex items-center space-x-3">
                      <span className="text-gray-700 font-medium">
                        {entry.type.value}
                      </span>
                      {entry.fullName && (
                        <span className="text-gray-600">
                          ({getFieldValue(entry.fullName.firstName)} {getFieldValue(entry.fullName.lastName)})
                        </span>
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        type="button"
                        onClick={() => toggleExpanded(entry._id)}
                        className="p-1.5 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100"
                        aria-label={isExpanded ? "Collapse" : "Expand"}
                        title={isExpanded ? "Collapse" : "Expand"}
                      >
                        {isExpanded ? (
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
                          </svg>
                        ) : (
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={() => toggleEditMode(entry._id)}
                        className="p-1.5 text-blue-500 hover:text-blue-700 rounded-full hover:bg-blue-50"
                        aria-label="Edit"
                        title="Edit relative"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                        </svg>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRemoveRelative(index)}
                        className="p-1.5 text-red-500 hover:text-red-700 rounded-full hover:bg-red-50"
                        aria-label="Remove"
                        title="Remove relative"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </div>
                  </div>
                  
                  {/* Collapsible entry content */}
                  {isExpanded && (
                    <div className="p-4 bg-white">
                      {/* Type Selection (only in edit mode) */}
                      {isEditing && (
                        <div className="mb-6 p-4 bg-blue-50 rounded-md">
                          <h5 className="font-medium text-gray-700 mb-2">Change Relative Type</h5>
                          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                            {selectedRelativeTypes.map(relType => (
                              <div key={relType._id} className="flex items-center">
                                <input
                                  type="radio"
                                  id={`rel-type-change-${relType._id}-${entry._id}`}
                                  name={`rel-type-change-${entry._id}`}
                                  checked={entry.type.value === relType.name}
                                  onChange={() => handleRelativeChange(
                                    entry._id, 
                                    toRelativeType(relType.name), 
                                    index
                                  )}
                                  className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                                />
                                <label 
                                  htmlFor={`rel-type-change-${relType._id}-${entry._id}`}
                                  className="ml-2 text-sm text-gray-700"
                                >
                                  {relType.name}
                                </label>
                              </div>
                            ))}
                          </div>
                          <div className="mt-2 text-right">
                            <button
                              type="button"
                              onClick={() => toggleEditMode(entry._id)}
                              className="px-3 py-1 text-sm font-medium text-gray-700 bg-gray-200 hover:bg-gray-300 rounded"
                            >
                              Done
                            </button>
                          </div>
                        </div>
                      )}
                      
                      {/* Basic Information */}
                      <div className="mb-4">
                        <h5 className="font-medium text-gray-700 mb-2">Basic Information</h5>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              First Name <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="text"
                              value={getFieldValue(entry.fullName?.firstName)}
                              onChange={e => handleInputChange(
                                `${path}.entries[${index}].fullName.firstName`, 
                                { ...entry.fullName.firstName, value: e.target.value }
                              )}
                              disabled={isReadOnlyField(`${path}.entries[${index}].fullName.firstName`)}
                              className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Last Name <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="text"
                              value={getFieldValue(entry.fullName?.lastName)}
                              onChange={e => handleInputChange(
                                `${path}.entries[${index}].fullName.lastName`, 
                                { ...entry.fullName.lastName, value: e.target.value }
                              )}
                              disabled={isReadOnlyField(`${path}.entries[${index}].fullName.lastName`)}
                              className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Middle Name
                            </label>
                            <input
                              type="text"
                              value={getFieldValue(entry.fullName?.middleName)}
                              onChange={e => handleInputChange(
                                `${path}.entries[${index}].fullName.middleName`, 
                                { ...entry.fullName.middleName, value: e.target.value }
                              )}
                              disabled={isReadOnlyField(`${path}.entries[${index}].fullName.middleName`)}
                              className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Suffix
                            </label>
                            <input
                              type="text"
                              value={getFieldValue(entry.fullName?.suffix)}
                              onChange={e => handleInputChange(
                                `${path}.entries[${index}].fullName.suffix`, 
                                { ...entry.fullName.suffix, value: e.target.value }
                              )}
                              disabled={isReadOnlyField(`${path}.entries[${index}].fullName.suffix`)}
                              className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Flags with improved UI */}
                      <div className="mb-4 mt-4">
                        <h5 className="font-medium text-gray-700 mb-2">Status Information</h5>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="flex items-center space-x-2 bg-gray-50 p-3 rounded-md">
                            <input
                              type="checkbox"
                              id={`isDeceased-${entry._id}`}
                              checked={entry.isDeceased?.value === "YES"}
                              onChange={(e) => handleInputChange(
                                `${path}.entries[${index}].isDeceased.value`, 
                                e.target.checked ? "YES" : "NO"
                              )}
                              disabled={isReadOnlyField(`${path}.entries[${index}].isDeceased`)}
                              className="h-5 w-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                            />
                            <label htmlFor={`isDeceased-${entry._id}`} className="text-sm font-medium text-gray-700">
                              Deceased
                            </label>
                          </div>
                          
                          <div className="flex items-center space-x-2 bg-gray-50 p-3 rounded-md">
                            <input
                              type="checkbox"
                              id={`isUSCitizen-${entry._id}`}
                              checked={entry.isUSCitizen?.value === "YES"}
                              onChange={(e) => handleInputChange(
                                `${path}.entries[${index}].isUSCitizen.value`, 
                                e.target.checked ? "YES" : "NO"
                              )}
                              disabled={isReadOnlyField(`${path}.entries[${index}].isUSCitizen`)}
                              className="h-5 w-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                            />
                            <label htmlFor={`isUSCitizen-${entry._id}`} className="text-sm font-medium text-gray-700">
                              U.S. Citizen
                            </label>
                          </div>
                          
                          <div className="flex items-center space-x-2 bg-gray-50 p-3 rounded-md">
                            <input
                              type="checkbox"
                              id={`hasUSAddress-${entry._id}`}
                              checked={entry.hasUSAddress?.value === "YES"}
                              onChange={(e) => handleInputChange(
                                `${path}.entries[${index}].hasUSAddress.value`, 
                                e.target.checked ? "YES" : "NO"
                              )}
                              disabled={isReadOnlyField(`${path}.entries[${index}].hasUSAddress`)}
                              className="h-5 w-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                            />
                            <label htmlFor={`hasUSAddress-${entry._id}`} className="text-sm font-medium text-gray-700">
                              Has U.S. Address
                            </label>
                          </div>
                          
                          <div className="flex items-center space-x-2 bg-gray-50 p-3 rounded-md">
                            <input
                              type="checkbox"
                              id={`hasForeignAddress-${entry._id}`}
                              checked={entry.hasForeignAddress?.value === "YES"}
                              onChange={(e) => handleInputChange(
                                `${path}.entries[${index}].hasForeignAddress.value`, 
                                e.target.checked ? "YES" : "NO"
                              )}
                              disabled={isReadOnlyField(`${path}.entries[${index}].hasForeignAddress`)}
                              className="h-5 w-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                            />
                            <label htmlFor={`hasForeignAddress-${entry._id}`} className="text-sm font-medium text-gray-700">
                              Has Foreign Address
                            </label>
                          </div>
                        </div>
                      </div>

                      {/* Dynamic section rendering based on relative type */}
                      {entry.details.section18_1 && (
                        <div className="mt-4 p-4 border border-gray-200 rounded-md">
                          <h5 className="font-medium text-gray-700 mb-3">Parent Information</h5>
                          <RenderSection18_1
                            data={entry.details.section18_1}
                            onInputChange={handleInputChange}
                            path={`${path}.entries[${index}].details.section18_1`}
                            isReadOnlyField={isReadOnlyField}
                          />
                        </div>
                      )}
                      
                      {entry.details.section18_2 && (
                        <div className="mt-4 p-4 border border-gray-200 rounded-md">
                          <h5 className="font-medium text-gray-700 mb-3">Address Information</h5>
                          <RenderSection18_2
                            data={entry.details.section18_2}
                            onInputChange={handleInputChange}
                            path={`${path}.entries[${index}].details.section18_2`}
                            isReadOnlyField={isReadOnlyField}
                          />
                        </div>
                      )}
                      
                      {entry.details.section18_3 && (
                        <div className="mt-4 p-4 border border-gray-200 rounded-md">
                          <h5 className="font-medium text-gray-700 mb-3">Citizenship Information</h5>
                          <RenderSection18_3
                            data={entry.details.section18_3}
                            onInputChange={handleInputChange}
                            path={`${path}.entries[${index}].details.section18_3`}
                            isReadOnlyField={isReadOnlyField}
                          />
                        </div>
                      )}
                      
                      {entry.details.section18_4 && (
                        <div className="mt-4 p-4 border border-gray-200 rounded-md">
                          <h5 className="font-medium text-gray-700 mb-3">US Documentation</h5>
                          <RenderSection18_4
                            data={entry.details.section18_4}
                            onInputChange={handleInputChange}
                            path={`${path}.entries[${index}].details.section18_4`}
                            isReadOnlyField={isReadOnlyField}
                          />
                        </div>
                      )}
                      
                      {entry.details.section18_5 && (
                        <div className="mt-4 p-4 border border-gray-200 rounded-md">
                          <h5 className="font-medium text-gray-700 mb-3">Contact Information</h5>
                          <RenderSection18_5
                            data={entry.details.section18_5}
                            onInputChange={handleInputChange}
                            path={`${path}.entries[${index}].details.section18_5`}
                            isReadOnlyField={isReadOnlyField}
                          />
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export { RenderRelativesInfo };
