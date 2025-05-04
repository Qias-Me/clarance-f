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
import {type FormInfo} from "api/interfaces/FormInfo";


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

  const handleInputChange = (fieldPath: string, value: any) => {
    onInputChange(fieldPath, value);
  };
  

  const handleCheckboxChange = (type: RelativeType) => {
    // Check if the type is already selected
    const isSelected = selectedRelativeTypes.some((item) => item.type === type);

    // Update selectedRelativeTypes based on whether type was already selected
    const updatedSelectedTypes = isSelected
      ? selectedRelativeTypes.filter((item) => item.type !== type)
      : [...selectedRelativeTypes, { _id: new Date().getTime(), type }];

    setSelectedRelativeTypes(updatedSelectedTypes);
    onInputChange(`${path}.relativeTypes`, updatedSelectedTypes);

    // Process only if a new type is being added and it's the first one
    if (!isSelected && updatedSelectedTypes.length === 1) {
      const newEntry = getDefaultNewItem("relativesInfo.entries");
      newEntry.type = type;
      onAddEntry(`${path}.entries`, newEntry);
    } else {
      // Handle existing entries: either find and update or do nothing
      const existingEntryIndex = data.entries.findIndex(
        (entry) => entry.type === type
      );
      if (existingEntryIndex !== -1) {
        handleRelativeChange(
          data.entries[existingEntryIndex]._id,
          type,
          existingEntryIndex
        );
      }
    }
  };


  const handleAddRelative = () => {
    const newEntry = getDefaultNewItem("relativesInfo.entries");
    onAddEntry(`${path}.entries`, newEntry);
  };

  const getSectionsBasedOnRelative = (relative: RelativeEntry) => {
    const sections: (keyof RelativeDetails)[] = [];

    if (relative.isDeceased) {
      sections.push("section18_3");
    } else {
      sections.push("section18_1");
      if (relative.isUSCitizen && relative.hasUSAddress) {
        sections.push("section18_2", "section18_3");
      }
      if (!relative.isUSCitizen && relative.hasUSAddress) {
        sections.push("section18_4");
      }
      if (!relative.isUSCitizen && relative.hasForeignAddress) {
        sections.push("section18_5");
      }
    }

    return sections;
  };

  const handleRelativeChange = (relativeId: number, newType: string, index: number) => {
    // Find the specific entry using its ID
    const relativeIndex = data.entries.findIndex((entry) => entry._id === relativeId);
    if (relativeIndex === -1) {
      console.error("Relative not found");
      return;
    }
  
    // Update the type of the relative entry
    data.entries[relativeIndex].type = newType;
  
    // Get necessary sections based on the new relative type
    const necessarySections = getSectionsBasedOnRelative(data.entries[relativeIndex]);
    
    // Deep clone the entry to modify
    const updatedEntry = cloneDeep(data.entries[relativeIndex]);
  
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
    data.entries[relativeIndex] = updatedEntry; // Assuming direct mutation is safe here, use a setter if not
    onInputChange(`${path}.entries[${index}]`, updatedEntry);
    handleInputChange(`${path}.entries[${index}].type`, newType);
  
    console.log(`Updated sections for type '${newType}':`, necessarySections);
  };
  
  
  console.log(data, "Data in RenderRelativesInfo");
  return (
    <div className="p-4 bg-gray-50 rounded-lg shadow space-y-4">
      <h3 className="text-lg font-semibold">Section 18 - Relatives</h3>
      <div className="space-y-2">
        <div className="flex flex-col space-y-4">
          <label htmlFor={`relativeTypes`} className="mr-2">
            Select each type of relative applicable to you, regardless if they
            are living or deceased. (An opportunity will be provided to list
            multiple relatives for each type.) Check all that apply.
          </label>
          {relativeTypesList.map((type) => (
            <div key={type}>
              <input
                type="checkbox"
                id={`relativeType_${type}`}
                name={`relativeType_${type}`}
                value={type}
                checked={selectedRelativeTypes.some(
                  (item) => item.type === type
                )}
                onChange={() => handleCheckboxChange(type)}
                disabled={isReadOnlyField(`${path}.relativeTypes`)}
              />
              <label htmlFor={`relativeType_${type}`}>{type}</label>
            </div>
          ))}
        </div>
      </div>

      {data.entries.map((entry, index) => (
        <div key={entry._id} className="relative-entry space-y-2">
          <h3 className="text-lg font-semibold">Section 18 - Relatives</h3>
          <div className="space-y-2">
            <div className="relative-details space-y-2">
              <div>
                <label htmlFor={`type-${entry._id}`}>
                  <strong>Type:</strong>
                </label>
                <select
                  id={`type-${entry._id}`}
                  value={entry.type}
                  onChange={(e) => {
                    handleRelativeChange(entry._id, e.target.value, index);
                  }}
                  disabled={isReadOnlyField(`${path}.entries[${index}].type`)}
                >
                  {data.relativeTypes.map((relType) => (
                    <option key={relType._id} value={relType.type}>
                      {relType.type}
                    </option>
                  ))}
                </select>
              </div>
              <div>{/* Additional fields here */}</div>
            </div>
          </div>

          {entry.details.section18_1 && (
            <RenderSection18_1
              data={entry.details.section18_1}
              onInputChange={(path, value) => {
                handleInputChange(`${path}`, value);
              }}
              path={`${path}.entries[${index}].details.section18_1`}
              isReadOnlyField={isReadOnlyField}
            />
          )}
          {entry.details.section18_2 && (
            <RenderSection18_2
              data={entry.details.section18_2}
              onInputChange={(path, value) => {
                handleInputChange(`${path}`, value);
              }}
              path={`${path}.entries[${index}].details.section18_2`}
              isReadOnlyField={isReadOnlyField}
            />
          )}
          {entry.details.section18_3 && (
            <RenderSection18_3
              data={entry.details.section18_3}
              onInputChange={(path, value) => {
                handleInputChange(`${path}`, value);
              }}
              path={`${path}.entries[${index}].details.section18_3`}
              isReadOnlyField={isReadOnlyField}
            />
          )}
          {entry.details.section18_4 && (
            <RenderSection18_4
              data={entry.details.section18_4}
              onInputChange={(path, value) => {
                handleInputChange(`${path}`, value);
              }}
              path={`${path}.entries[${index}].details.section18_4`}
              isReadOnlyField={isReadOnlyField}
            />
          )}
          {entry.details.section18_5 && (
            <RenderSection18_5
              data={entry.details.section18_5}
              onInputChange={(path, value) => {
                handleInputChange(`${path}`, value);
              }}
              path={`${path}.entries[${index}].details.section18_5`}
              isReadOnlyField={isReadOnlyField}
            />
          )}
        </div>
      ))}

      <button
        type="button"
        onClick={handleAddRelative}
        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        Add Relative
      </button>
    </div>
  );
};

export { RenderRelativesInfo };
