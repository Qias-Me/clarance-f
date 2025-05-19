import React, { useState } from "react";
import {type FormInfo} from "api/interfaces/FormInfo";

import { 
  type EmploymentInfo, 
  type Section13A1,
  type Section13A2,
  type Section13A3,
  type Section13A4,
  type Section13A5,
  type Section13A6,
  type Section13B,
  type Section13C
} from "api/interfaces/sections/employmentInfo";
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
  data: EmploymentInfo[] | EmploymentInfo;
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

  // Ensure data is an array - convert if it's a single object
  const employmentData = Array.isArray(data) ? data : (data ? [data] : []);

  const handleInputChange = (path: string, value: any) => {
    console.log(path, value, "path and value");
    onInputChange(path, value);
    checkSection13ACompletion(employmentData);
  };

  const handleActivityChange = (index: number, value: string) => {
    const currentEntryPath = `${path}[${index}]`;
    onInputChange(`${currentEntryPath}.section13A[0].employmentActivity.value`, value);

    const necessarySections = getSectionsBasedOnActivity(value);
    console.log(necessarySections, "necessarySections");

    // Get a shallow copy of the current entry
    const updatedEntry = { ...employmentData[index] };
    const section13A = updatedEntry.section13A?.[0] || { _id: 1 };

    // Identify and add necessary sections
    necessarySections.forEach((sectionKey) => {
      if (sectionKey === "section13A1" && !section13A.section13A1) {
        const newItem = getDefaultNewItem(`employmentInfo.section13A.section13A1`);
        if (!updatedEntry.section13A) {
          updatedEntry.section13A = [{ _id: 1 }];
        }
        section13A.section13A1 = newItem;
      } else if (sectionKey === "section13A2" && !section13A.section13A2) {
        const newItem = getDefaultNewItem(`employmentInfo.section13A.section13A2`);
        if (!updatedEntry.section13A) {
          updatedEntry.section13A = [{ _id: 1 }];
        }
        section13A.section13A2 = newItem;
      } else if (sectionKey === "section13A3" && !section13A.section13A3) {
        const newItem = getDefaultNewItem(`employmentInfo.section13A.section13A3`);
        if (!updatedEntry.section13A) {
          updatedEntry.section13A = [{ _id: 1 }];
        }
        section13A.section13A3 = newItem;
      } else if (sectionKey === "section13A4" && !section13A.section13A4) {
        const newItem = getDefaultNewItem(`employmentInfo.section13A.section13A4`);
        if (!updatedEntry.section13A) {
          updatedEntry.section13A = [{ _id: 1 }];
        }
        section13A.section13A4 = newItem;
      } else if (sectionKey === "section13A5" && !section13A.section13A5) {
        const newItem = getDefaultNewItem(`employmentInfo.section13A.section13A5`);
        if (!updatedEntry.section13A) {
          updatedEntry.section13A = [{ _id: 1 }];
        }
        section13A.section13A5 = newItem;
      } else if (sectionKey === "section13A6" && !section13A.section13A6) {
        const newItem = getDefaultNewItem(`employmentInfo.section13A.section13A6`);
        if (!updatedEntry.section13A) {
          updatedEntry.section13A = [{ _id: 1 }];
        }
        section13A.section13A6 = newItem;
      }
    });

    // Update the state with the modified entry
    updatedEntry.section13A = [section13A];
    const updatedData = cloneDeep(employmentData);
    updatedData[index] = updatedEntry;
    onInputChange(path, updatedData);
    checkSection13ACompletion(updatedData);
  };

  const checkSection13ACompletion = (data: EmploymentInfo[]) => {
    if (!Array.isArray(data) || data.length === 0) {
      setIsSection13AComplete(false);
      return;
    }
    
    const allSectionsCompleted = data.every((entry) => {
      if (!entry.section13A?.[0]?.employmentActivity?.value) return false;
      
      const necessarySections = getSectionsBasedOnActivity(entry.section13A[0].employmentActivity.value);
      const section13A = entry.section13A?.[0] || {};
      
      return necessarySections.every((sectionKey) => {
        if (sectionKey === "section13A1") return !!section13A.section13A1;
        if (sectionKey === "section13A2") return !!section13A.section13A2;
        if (sectionKey === "section13A3") return !!section13A.section13A3;
        if (sectionKey === "section13A4") return !!section13A.section13A4;
        if (sectionKey === "section13A5") return !!section13A.section13A5;
        if (sectionKey === "section13A6") return !!section13A.section13A6;
        return false;
      });
    });
    setIsSection13AComplete(allSectionsCompleted);
  };

  const getSectionsBasedOnActivity = (activity: string) => {
    if (!activity) return [];
    
    if (activity.includes("military") || activity.includes("Guard") || activity.includes("Corps")) {
      return ["section13A1", "section13A5", "section13A6"];
    } else if (activity.includes("Federal") || activity.includes("State") || activity.includes("Contractor") || 
              activity.includes("Non-government") || activity.includes("Other")) {
      return ["section13A2", "section13A5", "section13A6"];
    } else if (activity.includes("Self")) {
      return ["section13A3", "section13A5", "section13A6"];
    } else if (activity.includes("Unemployment")) {
      return ["section13A4"];
    }
    return [];
  };

  // Default empty objects for section13B and section13C
  const defaultSection13B: Section13B = {
    hasFormerFederalEmployment: {
      value: "NO (If NO, proceed to Section 13C)",
      id: "17090",
      type: "PDFRadioGroup",
      label: "Has Former Federal Employment"
    },
    employmentEntries: []
  };

  const defaultSection13C: Section13C = {
    employmentRecordIssues: {
      value: "NO (If NO, proceed to Section 14)",
      id: "17092",
      type: "PDFRadioGroup",
      label: "Employment Record Issues"
    },
    employmentRecord: {
      fired: { value: "No", id: "0", type: "PDFCheckBox", label: "Fired" },
      quitAfterToldWouldBeFired: { value: "No", id: "0", type: "PDFCheckBox", label: "Quit After Told Would Be Fired" },
      leftByMutualAgreementMisconduct: { value: "No", id: "0", type: "PDFCheckBox", label: "Left By Mutual Agreement Misconduct" },
      leftByMutualAgreementPerformance: { value: "No", id: "0", type: "PDFCheckBox", label: "Left By Mutual Agreement Performance" },
      writtenWarning: { value: "No", id: "0", type: "PDFCheckBox", label: "Written Warning" }
    }
  };

  // Initialize employment data if empty
  if (employmentData.length === 0) {
    return (
      <div className="p-4 bg-gray-50 rounded-lg shadow space-y-4">
        <h3 className="text-lg font-semibold">
          Section 13A - Employment Activities
        </h3>
        <div className="p-4 bg-white rounded-lg border shadow-sm">
          <p className="text-gray-500 mb-4">No employment history entries found. Click the button below to add an employment entry.</p>
          <button
            onClick={(e) => {
              e.preventDefault();
              const newItem = getDefaultNewItem("employmentInfo");
              onAddEntry(path, newItem);
            }}
            className="p-2 bg-blue-500 text-white rounded-md shadow hover:bg-blue-600"
          >
            Add Employment Entry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 bg-gray-50 rounded-lg shadow space-y-4">
      <h3 className="text-lg font-semibold">
        Section 13A - Employment Activities
      </h3>
      {employmentData.map((entry, index) => (
        <div key={index} className="space-y-2">
          <div className="flex items-center space-x-4">
            <label htmlFor={`employmentActivity-${index}`} className="mr-2">
              Select your employment activity:
            </label>
            <select
              id={`employmentActivity-${index}`}
              value={entry.section13A?.[0]?.employmentActivity?.value || ""}
              onChange={(e) => {
                e.preventDefault();
                handleActivityChange(index, e.target.value);
              }}
              disabled={isReadOnlyField(`${path}[${index}].section13A[0].employmentActivity`)}
              className="p-2 border rounded"
            >
              <option value="" disabled>
                Select an activity
              </option>
              <option value="Active military duty station (Complete 13A.1, 13A.5 and 13A.6)">
                Active military duty station
              </option>
              <option value="  National Guard/Reserve (Complete 13A.1, 13A.5 and 13A.6)">
                National Guard/Reserve
              </option>
              <option value="USPHS Commissioned Corps (Complete 13A.1, 13A.5 and 13A.6)">
                USPHS Commissioned Corps
              </option>
              <option value="  Other Federal employment (Complete 13A.2, 13A.5 and 13A.6)">
                Other Federal employment
              </option>
              <option value="State Government (Non-Federal employment) (Complete 13A.2, 13A.5 and 13A.6) | Self-employment (Complete 13A.3, 13A.5 and 13A.6)">State Government</option>
              <option value="Non-government employment (excluding selfemployment) (Complete 13A.2, 13A.5 and 13A.6)">
                Non-government employment
              </option>
              <option value="Self-employment (Complete 13A.3, 13A.5 and 13A.6)">Self-employment</option>
              <option value=" Unemployment (Complete 13A.4) Federal Contractor (Complete 13A.2, 13A.5 and 13A.6)">Unemployment</option>
              <option value="Federal Contractor (Complete 13A.2, 13A.5 and 13A.6)">Federal Contractor</option>
              <option value="Other (Provide explanation and complete 13A.2, 13A.5 and 13A.6)">Other</option>
            </select>
          </div>

          {entry.section13A?.[0]?.section13A1 && (
            <RenderSection13A1
              data={entry.section13A[0].section13A1}
              onInputChange={(path, value) => {
                handleInputChange(path, value);
              }}
              path={`${path}[${index}].section13A[0].section13A1`}
              isReadOnlyField={isReadOnlyField}
            />
          )}
          {entry.section13A?.[0]?.section13A2 && (
            <RenderSection13A2
              data={entry.section13A[0].section13A2}
              onInputChange={(path, value) => {
                handleInputChange(path, value);
              }}
              onRemoveEntry={onRemoveEntry}
              onAddEntry={onAddEntry}
              getDefaultNewItem={getDefaultNewItem}
              path={`${path}[${index}].section13A[0].section13A2`}
              isReadOnlyField={isReadOnlyField}
            />
          )}
          {entry.section13A?.[0]?.section13A3 && (
            <RenderSection13A3
              data={entry.section13A[0].section13A3}
              onInputChange={(path, value) => {
                handleInputChange(path, value);
              }}
              path={`${path}[${index}].section13A[0].section13A3`}
              isReadOnlyField={isReadOnlyField}
            />
          )}
          {entry.section13A?.[0]?.section13A4 && (
            <RenderSection13A4
              data={entry.section13A[0].section13A4}
              onInputChange={(path, value) => {
                handleInputChange(path, value);
              }}
              path={`${path}[${index}].section13A[0].section13A4`}
              isReadOnlyField={isReadOnlyField}
            />
          )}
          {entry.section13A?.[0]?.section13A5 && (
            <RenderSection13A5
              data={entry.section13A[0].section13A5}
              onInputChange={(path, value) => {
                handleInputChange(path, value);
              }}
              path={`${path}[${index}].section13A[0].section13A5`}
              isReadOnlyField={isReadOnlyField}
            />
          )}
          {entry.section13A?.[0]?.section13A6 && (
            <RenderSection13A6
              data={entry.section13A[0].section13A6}
              onInputChange={(path, value) => {
                handleInputChange(path, value);
              }}
              path={`${path}[${index}].section13A[0].section13A6`}
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
        className="mt-4 p-2 bg-green-500 text-white rounded-md shadow hover:bg-green-600"
      >
        Add Entry
      </button>

      {isSection13AComplete && (
        <>
          {employmentData.map((entry, index) => (
            <div key={`section-13b-${index}`} className="space-y-2">
              <RenderSection13B
                data={entry.section13B || defaultSection13B}
                onInputChange={(path, value) => {
                  handleInputChange(path, value);
                }}
                path={`${path}[${index}].section13B`}
                isReadOnlyField={isReadOnlyField}
                onAddEntry={onAddEntry} 
                getDefaultNewItem={getDefaultNewItem} 
              />
              <RenderSection13C
                data={entry.section13C || defaultSection13C}
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
