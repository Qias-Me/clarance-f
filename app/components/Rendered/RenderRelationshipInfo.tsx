import React from "react";
import FormInfo from "api_v2/interfaces/FormInfo";
import { RelationshipInfo } from "api_v2/interfaces/relationshipInfo";
import pkg from "lodash";
import { RenderSection17_1 } from "../_relationship/Section17_1";
import { RenderSection17_2 } from "../_relationship/Section17_2";
import { RenderSection17_3 } from "../_relationship/Section17_3";

interface FormProps {
  data: RelationshipInfo;
  onInputChange: (path: string, value: any) => void;
  onAddEntry: (path: string, newItem: any) => void;
  onRemoveEntry: (path: string, index: number) => void;
  getDefaultNewItem: (itemType: string) => any;
  isReadOnlyField: (fieldName: string) => boolean;
  path: string;
  formInfo: FormInfo;
}

const RenderRelationshipInfo: React.FC<FormProps> = ({
  data,
  onInputChange,
  onAddEntry,
  onRemoveEntry,
  getDefaultNewItem,
  isReadOnlyField,
  path,
}) => {
  const { cloneDeep } = pkg;

  const handleInputChange = (path: string, value: any) => {
    console.log(path, value, "path and value");
    onInputChange(path, value);
  };


  const handleStatusChange = (value: string) => {
    const currentEntryPath = `${path}`;
    onInputChange(`${currentEntryPath}.currentStatus`, value);
  
    const necessarySections = getSectionsBasedOnStatus(value);
    console.log(necessarySections, "necessarySections");
  
    // Get a deep copy of the current entry to avoid mutating state directly
    const updatedEntry = cloneDeep(data);
  
    // Identify and remove unnecessary sections
    Object.keys(updatedEntry).forEach((key) => {
      if (key.startsWith("section17") && !necessarySections.includes(key)) {
        delete updatedEntry[key];
      }
    });
  
    // Add new or missing necessary sections
    necessarySections.forEach((section) => {
      if (!Object.prototype.hasOwnProperty.call(updatedEntry, section)) {
        const newItem = getDefaultNewItem(`relationshipInfo.${section}`);
        updatedEntry[section] = newItem;
      }
    });
  
    // Update the state with the modified entry
    onInputChange(path, updatedEntry);
  };
  


  const getSectionsBasedOnStatus = (status: string) => {
    switch (status) {
      case "NeverEntered":
        return ["section17_3"];
      case "CurrentlyIn":
        return ["section17_1", "section17_3"];
      case "Separated":
        return ["section17_1", "section17_3"];
      case "Annulled":
        return ["section17_2", "section17_3"];
      case "Divorced":
        return ["section17_2", "section17_3"];
      case "Widowed":
        return ["section17_2", "section17_3"];
      default:
        return [];
    }
  };

  return (
    <div className="p-4 bg-gray-50 rounded-lg shadow space-y-4">
      <h3 className="text-lg font-semibold">
        Section 17 - Marital/Relationship Status
      </h3>
      <div className="space-y-2">
        <div className="flex flex-col space-y-4">
          <label htmlFor={`currentStatus`} className="mr-2">
            Provide your current marital/relationship status with regard to
            civil marriage, legally recognized civil union, or legally
            recognized domestic partnership:
          </label>
          <div className="flex flex-col space-y-2">
            <label>
              <input
                type="radio"
                name="currentStatus"
                value="NeverEntered"
                checked={data.currentStatus === "NeverEntered"}
                onChange={(e) => handleStatusChange(e.target.value)}
                disabled={isReadOnlyField(`${path}.currentStatus`)}
              />
              Never entered in a civil marriage, legally recognized civil union,
              or legally recognized domestic partnership (Complete 17.3)
            </label>
            <label>
              <input
                type="radio"
                name="currentStatus"
                value="CurrentlyIn"
                checked={data.currentStatus === "CurrentlyIn"}
                onChange={(e) => handleStatusChange(e.target.value)}
                disabled={isReadOnlyField(`${path}.currentStatus`)}
              />
              Currently in a civil marriage, legally recognized civil union, or
              legally recognized domestic partnership (Complete 17.1 and 17.3)
            </label>
            <label>
              <input
                type="radio"
                name="currentStatus"
                value="Separated"
                checked={data.currentStatus === "Separated"}
                onChange={(e) => handleStatusChange(e.target.value)}
                disabled={isReadOnlyField(`${path}.currentStatus`)}
              />
              Separated (Complete 17.1 and 17.3)
            </label>
            <label>
              <input
                type="radio"
                name="currentStatus"
                value="Annulled"
                checked={data.currentStatus === "Annulled"}
                onChange={(e) => handleStatusChange(e.target.value)}
                disabled={isReadOnlyField(`${path}.currentStatus`)}
              />
              Annulled (Complete 17.2 and 17.3)
            </label>
            <label>
              <input
                type="radio"
                name="currentStatus"
                value="Divorced"
                checked={data.currentStatus === "Divorced"}
                onChange={(e) => handleStatusChange(e.target.value)}
                disabled={isReadOnlyField(`${path}.currentStatus`)}
              />
              Divorced/Dissolved (Complete 17.2 and 17.3)
            </label>
            <label>
              <input
                type="radio"
                name="currentStatus"
                value="Widowed"
                checked={data.currentStatus === "Widowed"}
                onChange={(e) => handleStatusChange(e.target.value)}
                disabled={isReadOnlyField(`${path}.currentStatus`)}
              />
              Widowed (Complete 17.2 and 17.3)
            </label>
          </div>
        </div>
      </div>

      {data.section17_1 && (
        <RenderSection17_1
        onRemoveEntry={onRemoveEntry}
        onAddEntry={onAddEntry}
          data={data.section17_1}
          onInputChange={(path, value) => {
            handleInputChange(path, value);
          }}
          path={`${path}.section17_1`}
          getDefaultNewItem={getDefaultNewItem}
          isReadOnlyField={isReadOnlyField}
        />
      )}

      {data.section17_2 && (
        <RenderSection17_2
          data={data.section17_2}
          onInputChange={(path, value) => {
            handleInputChange(path, value);
          }}
          path={`${path}.section17_2`}
          isReadOnlyField={isReadOnlyField}
        />
      )}

      {data.section17_3 && (
        <RenderSection17_3
          data={data.section17_3}
          onInputChange={(path, value) => {
            handleInputChange(path, value);
          }}
          path={`${path}.section17_3`}
          isReadOnlyField={isReadOnlyField}
        />
      )}
    </div>
  );
};

export { RenderRelationshipInfo };
