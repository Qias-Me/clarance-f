import React from "react";
import { Section24_3 } from "api_v2/interfaces/alcoholUse";

interface Section24_3Props {
  data: Section24_3[];
  onInputChange: (path: string, value: any) => void;
  onRemoveEntry: (path: string, index: number) => void;
  onAddEntry: (path: string, newItem: Section24_3) => void;
  path: string;
  isReadOnlyField: (fieldName: string) => boolean;
  getDefaultNewItem: (itemType: string) => any;
}

const RenderSection24_3: React.FC<Section24_3Props> = ({
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
    (
      event: React.ChangeEvent<
        HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
      >
    ) => {
      const value =
        event.target.type === "checkbox"
          ? event.target.checked
          : event.target.value;
      onInputChange(`${path}.section24_3[${index}].${fieldPath}`, value);
    };

  const renderEntry = (item: Section24_3, index: number) => (
    <div key={index} className="space-y-4 p-4 border rounded-lg">
      <h3>Entry #{index + 1}</h3>

      <div>
        <label>
          Date From:
          <input
            type="date"
            value={item.dateRange.from}
            onChange={handleInputChange(index, "dateRange.from")}
            readOnly={isReadOnlyField(`${path}.section24_3[${index}].dateRange.from`)}
          />
        </label>
      </div>

      <div>
        <label>
          Date To:
          <input
            type="date"
            value={item.dateRange.to}
            onChange={handleInputChange(index, "dateRange.to")}
            readOnly={isReadOnlyField(`${path}.section24_3[${index}].dateRange.to`)}
          />
        </label>
      </div>

      <div>
        <label>
          Estimated:
          <input
            type="checkbox"
            checked={item.dateRange.estimated}
            onChange={handleInputChange(index, "dateRange.estimated")}
            readOnly={isReadOnlyField(`${path}.section24_3[${index}].dateRange.estimated`)}
          />
        </label>
      </div>

      <div>
        <label>
          Present:
          <input
            type="checkbox"
            checked={item.dateRange.present}
            onChange={handleInputChange(index, "dateRange.present")}
            readOnly={isReadOnlyField(`${path}.section24_3[${index}].dateRange.present`)}
          />
        </label>
      </div>

      <div>
        <label>
          Provider Name:
          <input
            type="text"
            value={item.providerName}
            onChange={handleInputChange(index, "providerName")}
            readOnly={isReadOnlyField(`${path}.section24_3[${index}].providerName`)}
          />
        </label>
      </div>

      <div>
        <label>
          Provider City:
          <input
            type="text"
            value={item.providerAddress.city}
            onChange={handleInputChange(index, "providerAddress.city")}
            readOnly={isReadOnlyField(`${path}.section24_3[${index}].providerAddress.city`)}
          />
        </label>
      </div>

      <div>
        <label>
          Provider County:
          <input
            type="text"
            value={item.providerAddress.county}
            onChange={handleInputChange(index, "providerAddress.county")}
            readOnly={isReadOnlyField(`${path}.section24_3[${index}].providerAddress.county`)}
          />
        </label>
      </div>

      <div>
        <label>
          Provider State:
          <input
            type="text"
            value={item.providerAddress.state}
            onChange={handleInputChange(index, "providerAddress.state")}
            readOnly={isReadOnlyField(`${path}.section24_3[${index}].providerAddress.state`)}
          />
        </label>
      </div>

      <div>
        <label>
          Provider ZIP:
          <input
            type="text"
            value={item.providerAddress.zip}
            onChange={handleInputChange(index, "providerAddress.zip")}
            readOnly={isReadOnlyField(`${path}.section24_3[${index}].providerAddress.zip`)}
          />
        </label>
      </div>

      <div>
        <label>
          Provider Country:
          <input
            type="text"
            value={item.providerAddress.country}
            onChange={handleInputChange(index, "providerAddress.country")}
            readOnly={isReadOnlyField(`${path}.section24_3[${index}].providerAddress.country`)}
          />
        </label>
      </div>

      <div>
        <label>
          Provider Phone:
          <input
            type="text"
            value={item.providerPhone}
            onChange={handleInputChange(index, "providerPhone")}
            readOnly={isReadOnlyField(`${path}.section24_3[${index}].providerPhone`)}
          />
        </label>
      </div>

      <div>
        <label>
          Phone Extension:
          <input
            type="text"
            value={item.phoneExtension}
            onChange={handleInputChange(index, "phoneExtension")}
            readOnly={isReadOnlyField(`${path}.section24_3[${index}].phoneExtension`)}
          />
        </label>
      </div>

      <div>
        <label>
          International Phone:
          <input
            type="checkbox"
            checked={item.internationalPhone}
            onChange={handleInputChange(index, "internationalPhone")}
            readOnly={isReadOnlyField(`${path}.section24_3[${index}].internationalPhone`)}
          />
        </label>
      </div>

      <div>
        <label>
          Phone Day/Night:
          <select
            value={item.phoneDayNight}
            onChange={handleInputChange(index, "phoneDayNight")}
            readOnly={isReadOnlyField(`${path}.section24_3[${index}].phoneDayNight`)}
          >
            <option value="Day">Day</option>
            <option value="Night">Night</option>
          </select>
        </label>
      </div>

      <div>
        <label>
          Treatment Completion:
          <input
            type="checkbox"
            checked={item.treatmentCompletion}
            onChange={handleInputChange(index, "treatmentCompletion")}
            readOnly={isReadOnlyField(`${path}.section24_3[${index}].treatmentCompletion`)}
          />
        </label>
      </div>

      <div>
        <label>
          Completion Explanation:
          <textarea
            value={item.completionExplanation}
            onChange={handleInputChange(index, "completionExplanation")}
            readOnly={isReadOnlyField(`${path}.section24_3[${index}].completionExplanation`)}
          />
        </label>
      </div>

      <button
        onClick={(event) => {
          event.preventDefault();
          onRemoveEntry(`${path}.section24_3`, index);
        }}
        disabled={isReadOnlyField(`${path}.section24_3[${index}]`)}
      >
        Remove Entry
      </button>
    </div>
  );

  return (
    <div className="space-y-4">
      <h2>Section 24.3</h2>
      {data.map((item, index) => renderEntry(item, index))}
      <button
        onClick={(event) => {
          event.preventDefault();
          onAddEntry(
            `${path}.section24_3`,
            getDefaultNewItem(`${path}.section24_3`)
          );
        }}
      >
        Add Entry
      </button>
    </div>
  );
};

export { RenderSection24_3 };
