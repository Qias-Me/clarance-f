import React from "react";
import { type Section23_5 } from "api/interfaces/sections/drugsActivity";

interface Section23_5Props {
  data: Section23_5[];
  onInputChange: (path: string, value: any) => void;
  onRemoveEntry: (path: string, index: number) => void;
  onAddEntry: (path: string, newItem: Section23_5) => void;
  path: string;
  isReadOnlyField: (fieldName: string) => boolean;
  getDefaultNewItem: (itemType: string) => any;
}

const RenderSection23_5: React.FC<Section23_5Props> = ({
  data,
  onInputChange,
  onRemoveEntry,
  onAddEntry,
  getDefaultNewItem,
  path,
  isReadOnlyField,
}) => {
  const handleInputChange =
    (index: number, fieldPath: string) =>
    (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
      const value =
        event.target.type === "checkbox"
          ? event.target.checked
          : event.target.value;
      onInputChange(`${path}.section23_5[${index}].${fieldPath}`, value);
    };

  const renderEntry = (item: Section23_5, index: number) => (
    <div key={index} className="space-y-4 p-4 border rounded-lg">
      <h3>Entry #{index + 1}</h3>

      <label htmlFor={`nameOfPrescriptionDrug-${index}`}>
        Name of Prescription Drug
      </label>
      <input
        id={`nameOfPrescriptionDrug-${index}`}
        type="text"
        value={item.nameOfPrescriptionDrug}
        onChange={handleInputChange(index, "nameOfPrescriptionDrug")}
        disabled={isReadOnlyField(`${path}.section23_5[${index}].nameOfPrescriptionDrug`)}
        placeholder="Name of Prescription Drug"
      />

      <label htmlFor={`dateRange-from-${index}`}>From (Month/Year)</label>
      <input
        id={`dateRange-from-${index}`}
        type="date"
        value={item.dateRange.from}
        onChange={handleInputChange(index, "dateRange.from")}
        disabled={isReadOnlyField(`${path}.section23_5[${index}].dateRange.from`)}
      />
      
      <label htmlFor={`dateRange-to-${index}`}>To (Month/Year)</label>
      <input
        id={`dateRange-to-${index}`}
        type="date"
        value={item.dateRange.to}
        onChange={handleInputChange(index, "dateRange.to")}
        disabled={isReadOnlyField(`${path}.section23_5[${index}].dateRange.to`)}
      />

      <input
        type="checkbox"
        id={`dateRange-estimated-${index}`}
        checked={item.dateRange.estimated}
        onChange={handleInputChange(index, "dateRange.estimated")}
        disabled={isReadOnlyField(`${path}.section23_5[${index}].dateRange.estimated`)}
      />
      <label htmlFor={`dateRange-estimated-${index}`}>Estimated</label>

      <input
        type="checkbox"
        id={`dateRange-present-${index}`}
        checked={item.dateRange.present}
        onChange={handleInputChange(index, "dateRange.present")}
        disabled={isReadOnlyField(`${path}.section23_5[${index}].dateRange.present`)}
      />
      <label htmlFor={`dateRange-present-${index}`}>Present</label>

      <label htmlFor={`reasonsForMisuse-${index}`}>Reasons for Misuse</label>
      <textarea
        id={`reasonsForMisuse-${index}`}
        value={item.reasonsForMisuse}
        onChange={handleInputChange(index, "reasonsForMisuse")}
        disabled={isReadOnlyField(`${path}.section23_5[${index}].reasonsForMisuse`)}
        placeholder="Reasons for Misuse"
      />

      <input
        type="checkbox"
        id={`involvementWhileEmployedInPublicSafety-${index}`}
        checked={item.involvementWhileEmployedInPublicSafety}
        onChange={handleInputChange(index, "involvementWhileEmployedInPublicSafety")}
        disabled={isReadOnlyField(`${path}.section23_5[${index}].involvementWhileEmployedInPublicSafety`)}
      />
      <label htmlFor={`involvementWhileEmployedInPublicSafety-${index}`}>
        Involvement While Employed in Public Safety
      </label>

      <input
        type="checkbox"
        id={`involvementWhilePossessingSecurityClearance-${index}`}
        checked={item.involvementWhilePossessingSecurityClearance}
        onChange={handleInputChange(index, "involvementWhilePossessingSecurityClearance")}
        disabled={isReadOnlyField(`${path}.section23_5[${index}].involvementWhilePossessingSecurityClearance`)}
      />
      <label htmlFor={`involvementWhilePossessingSecurityClearance-${index}`}>
        Involvement While Possessing Security Clearance
      </label>

      <button
        onClick={(event) => {
          event.preventDefault();
          onRemoveEntry(`${path}.section23_5`, index);
        }}
        disabled={isReadOnlyField(`${path}.section23_5[${index}]`)}
      >
        Remove Entry
      </button>
    </div>
  );

  return (
    <div className="space-y-4">
      <h2>Section 23.5</h2>
      {data.map((item, index) => renderEntry(item, index))}
      <button
        onClick={(event) => {
          event.preventDefault();
          onAddEntry(
            `${path}.section23_5`,
            getDefaultNewItem(`${path}.section23_5`)
          );
        }}
      >
        Add Entry
      </button>
    </div>
  );
};

export { RenderSection23_5 };
