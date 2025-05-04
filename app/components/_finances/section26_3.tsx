import React from "react";
import type { Section26_3 } from "api/interfaces/sections/finances";

interface Section26_3Props {
  data: Section26_3[];
  onInputChange: (path: string, value: any) => void;
  onRemoveEntry: (path: string, index: number) => void;
  onAddEntry: (path: string, newItem: Section26_3) => void;
  path: string;
  isReadOnlyField: (fieldName: string) => boolean;
  getDefaultNewItem: (itemType: string) => any;
}

const RenderSection26_3: React.FC<Section26_3Props> = ({
  data,
  onInputChange,
  onRemoveEntry,
  onAddEntry,
  getDefaultNewItem,
  path,
  isReadOnlyField,
}) => {
  const formatValue = (value: string) => {
    // Convert the value to a number and format it to 2 decimal places, or return an empty string if not a number.
    const numberValue = parseFloat(value);
    return isNaN(numberValue) ? "" : numberValue.toFixed(2);
  };

  const handleBlur = (index: number, fieldPath: string) => (event: React.FocusEvent<HTMLInputElement>) => {
    const value = event.target.value;
    const formattedValue = formatValue(value) || "0.00";
    onInputChange(`${path}.section26_3[${index}].${fieldPath}`, formattedValue);
  };

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
      onInputChange(`${path}.section26_3[${index}].${fieldPath}`, value);
    };

  const renderEntry = (item: Section26_3, index: number) => (
    <div key={index} className="space-y-4 p-4 border rounded-lg">
      <h3>Entry #{index + 1}</h3>

      <label>
        Failed To File Or Pay
        {item.failedToFileOrPay.map((ftfop, ftfopIndex) => (
          <div key={ftfopIndex}>
            <select
              value={ftfop.type}
              onChange={handleInputChange(index, `failedToFileOrPay[${ftfopIndex}].type`)}
              readOnly={isReadOnlyField(`section26_3[${index}].failedToFileOrPay[${ftfopIndex}].type`)}
            >
              <option value="File">File</option>
              <option value="Pay">Pay</option>
              <option value="Both">Both</option>
            </select>
          </div>
        ))}
      </label>

      <label>
        Year Failed
        <input
          type="text"
          value={item.yearFailed.date}
          onChange={handleInputChange(index, "yearFailed.date")}
          readOnly={isReadOnlyField(`section26_3[${index}].yearFailed.date`)}
        />
        <input
          type="checkbox"
          checked={item.yearFailed.estimated}
          onChange={handleInputChange(index, "yearFailed.estimated")}
          readOnly={isReadOnlyField(`section26_3[${index}].yearFailed.estimated`)}
        />
        Estimated
      </label>

      <label>
        Failure Reason
        <input
          type="text"
          value={item.failureReason}
          onChange={handleInputChange(index, "failureReason")}
          readOnly={isReadOnlyField(`section26_3[${index}].failureReason`)}
        />
      </label>

      <label>
        Agency Name
        <input
          type="text"
          value={item.agencyName}
          onChange={handleInputChange(index, "agencyName")}
          readOnly={isReadOnlyField(`section26_3[${index}].agencyName`)}
        />
      </label>

      <label>
        Tax Type
        <input
          type="text"
          value={item.taxType}
          onChange={handleInputChange(index, "taxType")}
          readOnly={isReadOnlyField(`section26_3[${index}].taxType`)}
        />
      </label>

      <label>
        Amount
        <input
          type="number"
          value={item.amount.amount}
          onChange={handleInputChange(index, "amount.amount")}
          onBlur={handleBlur(index, "amount.amount")}
          readOnly={isReadOnlyField(`section26_3[${index}].amount.amount`)}
        />
        <input
          type="checkbox"
          checked={item.amount.estimated}
          onChange={handleInputChange(index, "amount.estimated")}
          readOnly={isReadOnlyField(`section26_3[${index}].amount.estimated`)}
        />
        Estimated
      </label>

      <label>
        Date Satisfied
        <input
          type="text"
          value={item.dateSatisfied.date}
          onChange={handleInputChange(index, "dateSatisfied.date")}
          readOnly={isReadOnlyField(`section26_3[${index}].dateSatisfied.date`)}
        />
        <input
          type="checkbox"
          checked={item.dateSatisfied.estimated}
          onChange={handleInputChange(index, "dateSatisfied.estimated")}
          readOnly={isReadOnlyField(`section26_3[${index}].dateSatisfied.estimated`)}
        />
        Estimated
      </label>

      <label>
        Actions Taken
        <textarea
          value={item.actionsTaken}
          onChange={handleInputChange(index, "actionsTaken")}
          readOnly={isReadOnlyField(`section26_3[${index}].actionsTaken`)}
        />
      </label>

      <button
        onClick={(event) => {
          event.preventDefault();
          onRemoveEntry(`${path}.section26_3`, index);
        }}
        disabled={isReadOnlyField(`section26_3[${index}].remove`)}
      >
        Remove Entry
      </button>
    </div>
  );

  return (
    <div className="space-y-4">
      <h2>Section 26.3</h2>
      {data.map((item, index) => renderEntry(item, index))}
      <button
        onClick={(event) => {
          event.preventDefault();
          onAddEntry(
            `${path}.section26_3`,
            getDefaultNewItem(`${path}.section26_3`)
          );
        }}
      >
        Add Entry
      </button>
    </div>
  );
};

export { RenderSection26_3 };
