import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
  useCallback,
} from "react";
import { ApplicantFormValues } from "../../../api/interfaces/formDefinition";
import DynamicService from "../../../api/service/dynamicService";
import defaultFormData from "./updatedModel";
import cloneDeep from "lodash/cloneDeep";
import isEqual from "lodash/isEqual";
import set from "lodash/set";

interface EmployeeContextType {
  data: ApplicantFormValues;
  loadEmployee: () => Promise<void>;
  resetForm: () => void;
  isLoading: boolean;
  updateField: (path: string, value: string) => void; // Updates fileds in form all fields are string.
  getChanges: () => any; // returns a model of {added: {}, modified: {}, deleted: {}} with changes inside according to each delta
}

const EmployeeContext = createContext<EmployeeContextType | undefined>(
  undefined
);

export const useEmployee = () => {
  const context = useContext(EmployeeContext);
  if (!context) {
    throw new Error("useEmployee must be used within an EmployeeProvider");
  }
  return context;
};

interface EmployeeProviderProps {
  children: ReactNode;
}

export const EmployeeProvider: React.FC<EmployeeProviderProps> = ({
  children,
}) => {
  const [initialData, setInitialData] =
    useState<ApplicantFormValues>(defaultFormData);
  const [updatedData, setUpdatedData] =
    useState<ApplicantFormValues>(defaultFormData);

  // console.log(
  //   initialData.employmentInfo,
  //   "initialData.employmentInfo"
  // );
  // console.log(
  //   updatedData.employmentInfo,
  //   "updatedData.employmentInfo"
  // );

  const [isLoading, setLoading] = useState(true); // Manage loading state

  const resetForm = () => {
    setUpdatedData(defaultFormData); // Reset to default form data
  };

  const loadEmployee = useCallback(async () => {
    const dynamicService = new DynamicService();
    const employee = await dynamicService.loadUserFormData("applicantData");

    if (initialData === defaultFormData && employee.formData) {
      console.log(employee, "employee");

      setInitialData(employee.formData);
      setUpdatedData(employee.formData);
    }
    setLoading(false);
  }, [initialData]); // Fix: Add an empty array as the second argument

  useEffect(() => {
    loadEmployee();
  }, [loadEmployee]);

  const updateField = (path: string, value: any) => {
    setUpdatedData((prev) => {
      const updated = cloneDeep(prev); // Deep clone the previous state
      set(updated, path, value);
      return updated;
    });
  };

  const getChanges =
    () =>
    (initialData: ApplicantFormValues, updatedData: ApplicantFormValues) => {
      const changes: {
        added: any;
        modified: any;
        deleted: any;
      } = {
        added: {},
        modified: {},
        deleted: {},
      };

      const compareObjectsForModifications = (base: any, updated: any): any => {
        const modified: any = {};
        const keysToAlwaysInclude: string[] = []; // Add more keys as needed

        if (!base || !updated) return modified; // Ensure base and updated are not undefined or null

        Object.keys(updated).forEach((key: string) => {
          if (
            !isEqual(base[key]?.value, updated[key]?.value) ||
            keysToAlwaysInclude.includes(key)
          ) {
            modified[key] = updated[key];
          }
        });

        return modified;
      };

      const compareArrays = (
        base: any[],
        updated: any[],
        idKey: string,
        arrayName: string
      ) => {
        const baseMap = new Map(base.map((item: any) => [item[idKey], item]));
        const updatedMap = new Map<string, any>();
        const newEntries: any[] = [];

        updated.forEach((item: any) => {
          if (item[idKey] !== undefined) {
            updatedMap.set(item[idKey], item);
          } else {
            newEntries.push(item);
          }
        });

        const added: any[] = [];
        const modified: any[] = [];
        const deleted: any[] = [];

        // Identify added and modified entries
        for (const [id, updatedItem] of updatedMap.entries()) {
          if (!baseMap.has(id)) {
            added.push(updatedItem); // Entire new entry is added
          } else {
            const baseItem = baseMap.get(id);
            const modifications = compareObjectsForModifications(
              baseItem,
              updatedItem
            );
            if (Object.keys(modifications).length > 0) {
              modified.push(modifications); // Only modified fields are included in modified
            }
          }
        }

        // Identify new entries (shouldn't filter out any fields)
        newEntries.forEach((item) => {
          added.push(item);
        });

        // Identify deleted entries
        for (const [id, baseItem] of baseMap.entries()) {
          if (!updatedMap.has(id)) {
            deleted.push(baseItem);
          }
        }

        if (added.length > 0) {
          changes.added[arrayName] = added;
        }
        if (modified.length > 0) {
          changes.modified[arrayName] = modified;
        }
        if (deleted.length > 0) {
          changes.deleted[arrayName] = deleted;
        }
      };

      // Define all array fields in the form
      const arrayFields: (keyof ApplicantFormValues)[] = [
        "residencyInfo",
        "schoolInfo",
        "employmentInfo",
        "peopleThatKnow",
      ];

      // Special case handling for initially empty arrays
      arrayFields.forEach((field) => {
        if (
          Array.isArray(initialData[field]) &&
          Array.isArray(updatedData[field])
        ) {
          if (
            initialData[field].length === 0 &&
            updatedData[field].length > 0
          ) {
            changes.added[field] = updatedData[field];
          } else {
            compareArrays(
              initialData[field] as any[], // Type assertion
              updatedData[field] as any[], // Type assertion
              "_id", // Ensure that each array type has a consistent id key
              field
            );
          }
        }
      });

      const fields: (keyof ApplicantFormValues)[] = [
        "personalInfo",
        "birthInfo",
        "contactInfo",
        "citizenshipInfo",
        "dualCitizenshipInfo",
        "physicalAttributes",
        "namesInfo",
        "aknowledgementInfo",
        "passportInfo",
        "serviceInfo",
        "militaryHistoryInfo",
        "relativesInfo",
        "relationshipInfo",
        "foreignContacts",
        "foreignActivities",
        "mentalHealth",
        "policeRecord",
        "drugActivity",
        "alcoholUse",
        "investigationsInfo",
        "finances",
        "technology",
        "civil",
        "association",
        "signature",
      ];

      fields.forEach((field) => {
        const modifications = compareObjectsForModifications(
          initialData[field],
          updatedData[field]
        );
        if (Object.keys(modifications).length > 0) {
          changes.modified[field] = modifications;
        }
      });

      return changes;
    };

  return (
    <EmployeeContext.Provider
      value={{
        data: updatedData,
        loadEmployee,
        isLoading,
        updateField,
        resetForm,
        getChanges,
      }}
    >
      {children}
    </EmployeeContext.Provider>
  );
};
