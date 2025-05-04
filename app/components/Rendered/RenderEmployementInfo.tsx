import React, { useState } from "react";
import {type FormInfo} from "api/interfaces/FormInfo";

import { type EmploymentInfo } from "api/interfaces/sections/employmentInfo";
import { RenderSection13A1 } from "../_employment/Section13A1";
import { RenderSection13A4 } from "../_employment/Section13A4";
import { RenderSection13A5 } from "../_employment/Section13A5";
import { RenderSection13A6 } from "../_employment/Section13A6";
import { RenderSection13A3 } from "../_employment/Section13A3";
import { RenderSection13B } from "../_employment/Section13B";
import { RenderSection13C } from "../_employment/Section13C";
import pkg from "lodash";
import { RenderSection13A2 } from "../_employment/Section13A2";

interface FormProps {
  data: EmploymentInfo[];
  onInputChange: (path: string, value: any) => void;
  onAddEntry: (path: string, newItem: any) => void;
  onRemoveEntry: (path: string, index: number) => void;
  getDefaultNewItem: (itemType: string) => any;
  isReadOnlyField: (fieldName: string) => boolean;
  path: string;
  formInfo: FormInfo;
}

const RenderEmploymentInfo: React.FC<FormProps> = ({
  data,
  onInputChange,
  onAddEntry,
  onRemoveEntry,
  getDefaultNewItem,
  isReadOnlyField,
  path,
  formInfo,
}) => {
  const { cloneDeep } = pkg;
  const [isSection13AComplete, setIsSection13AComplete] = useState(false);

  const handleInputChange = (path: string, value: any) => {
    console.log(path, value, "path and value");
    onInputChange(path, value);
    checkSection13ACompletion(data);
  };

  const handleActivityChange = (index: number, value: string) => {
    const currentEntryPath = `${path}[${index}]`;
    onInputChange(`${currentEntryPath}.employmentActivity`, value);

    const necessarySections = getSectionsBasedOnActivity(value);
    console.log(necessarySections, "necessarySections");

    // Get a shallow copy of the current entry
    const updatedEntry = { ...data[index] };

    // Identify and remove unnecessary sections
    Object.keys(updatedEntry).forEach((key) => {
      if (key.startsWith("section13A") && !necessarySections.includes(key)) {
        delete updatedEntry[key];
      }
    });

    // Add new or missing necessary sections
    necessarySections.forEach((section) => {
      if (!Object.prototype.hasOwnProperty.call(updatedEntry, section)) {
        const newItem = getDefaultNewItem(`employmentInfo.${section}`);
        updatedEntry[section] = newItem;
      }
    });

    // Update the state with the modified entry
    const updatedData = cloneDeep(data);
    updatedData[index] = updatedEntry;
    onInputChange(path, updatedData);
    checkSection13ACompletion(updatedData);
  };


  const checkSection13ACompletion = (data: EmploymentInfo[]) => {
    const allSectionsCompleted = data.every((entry) => {
      const necessarySections = getSectionsBasedOnActivity(entry.employmentActivity);
      return necessarySections.every((section) => {
        const sectionData = entry[section as keyof EmploymentInfo];
        return sectionData && Object.values(sectionData).every(value => value !== null && value !== '');
      });
    });
    setIsSection13AComplete(allSectionsCompleted);
  };

  const getSectionsBasedOnActivity = (activity: string) => {
    switch (activity) {
      case "activeMilitaryDutyStation":
      case "nationalGuardReserve":
      case "usphsCommissionedCorps":
        return ["section13A1", "section13A5", "section13A6"];
      case "otherFederalEmployment":
      case "stateGovernment":
      case "federalContractor":
      case "nonGovernmentEmployment":
      case "other":
        return ["section13A2", "section13A5", "section13A6"];
      case "selfEmployment":
        return ["section13A3", "section13A5", "section13A6"];
      case "unemployment":
        return ["section13A4"];
      default:
        return [];
    }
  };

  return (
    <div className="p-4 bg-gray-50 rounded-lg shadow space-y-4">
      <h3 className="text-lg font-semibold">
        Section 13A - Employment Activities
      </h3>
      {data.map((entry, index) => (
        <div key={index} className="space-y-2">
          <div className="flex items-center space-x-4">
            <label htmlFor={`employmentActivity-${index}`} className="mr-2">
              Select your employment activity:
            </label>
            <select
              id={`employmentActivity-${index}`}
              value={entry.employmentActivity || ""}
              onChange={(e) => {
                e.preventDefault();
                handleActivityChange(index, e.target.value);
              }}
              disabled={isReadOnlyField(`${path}[${index}].employmentActivity`)}
              className="p-2 border rounded"
            >
              <option value="none" disabled>
                Select an activity
              </option>
              <option value="activeMilitaryDutyStation">
                Active military duty station
              </option>
              <option value="nationalGuardReserve">
                National Guard/Reserve
              </option>
              <option value="usphsCommissionedCorps">
                USPHS Commissioned Corps
              </option>
              <option value="otherFederalEmployment">
                Other Federal employment
              </option>
              <option value="stateGovernment">State Government</option>
              <option value="nonGovernmentEmployment">
                Non-government employment
              </option>
              <option value="selfEmployment">Self-employment</option>
              <option value="unemployment">Unemployment</option>
              <option value="federalContractor">Federal Contractor</option>
            </select>
          </div>

          {entry.section13A1 && (
            <RenderSection13A1
              data={entry.section13A1}
              onInputChange={(path, value) => {
                handleInputChange(path, value);
              }}
              
              path={`${path}[${index}]`}
              isReadOnlyField={isReadOnlyField}
            />
          )}
          {entry.section13A2 && (
            <RenderSection13A2
              data={entry.section13A2}
              onInputChange={(path, value) => {
                handleInputChange(path, value);
              }}
              onRemoveEntry={onRemoveEntry}
              onAddEntry={onAddEntry}
              getDefaultNewItem={getDefaultNewItem}
              path={`${path}[${index}].section13A2`}
              isReadOnlyField={isReadOnlyField}
            />
          )}
          {entry.section13A3 && (
            <RenderSection13A3
              data={entry.section13A3}
              onInputChange={(path, value) => {
                handleInputChange(path, value);
              }}
              path={`${path}[${index}].section13A3`}
              isReadOnlyField={isReadOnlyField}
            />
          )}
          {entry.section13A4 && (
            <RenderSection13A4
              data={entry.section13A4}
              onInputChange={(path, value) => {
                handleInputChange(path, value);
              }}
              path={`${path}[${index}].section13A4`}
              isReadOnlyField={isReadOnlyField}
            />
          )}
          {entry.section13A5 && (
            <RenderSection13A5
              data={entry.section13A5}
              onInputChange={(path, value) => {
                handleInputChange(path, value);
              }}
              path={`${path}[${index}].section13A5`}
              isReadOnlyField={isReadOnlyField}
            />
          )}
          {entry.section13A6 && (
            <RenderSection13A6
              data={entry.section13A6}
              onInputChange={(path, value) => {
                handleInputChange(path, value);
              }}
              path={`${path}[${index}].section13A6`}
              isReadOnlyField={isReadOnlyField}
            />
          )}
        </div>
      ))}
      <button
        onClick={(e) => {
          e.preventDefault();
          onAddEntry(path, getDefaultNewItem("employmentInfo"));
        }}
        className="mt-4 p-2 bg-green-500 text-white rounded-md shadow"
      >
        Add Entry
      </button>

      {isSection13AComplete && (
        <>
          {data.map((entry, index) => (
            <div key={index} className="space-y-2">
              <RenderSection13B
                data={entry.section13B}
                onInputChange={(path, value) => {
                  handleInputChange(path, value);
                }}
                path={`${path}[${index}].section13B`}
                isReadOnlyField={isReadOnlyField}
                onAddEntry={onAddEntry} 
                getDefaultNewItem={getDefaultNewItem} 
              />
              <RenderSection13C
                data={entry.section13C}
                onInputChange={(path, value) => {
                  handleInputChange(path, value);
                }}
                path={`${path}[${index}].section13C`}
                isReadOnlyField={isReadOnlyField}
              />
            </div>
          ))}
        </>
      )}
    </div>
  );
};

export { RenderEmploymentInfo };
