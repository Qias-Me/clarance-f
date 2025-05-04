import React from "react";
import { Section26_2 } from "api_v2/interfaces/finances";

interface Section26_2Props {
  data: Section26_2[];
  onInputChange: (path: string, value: any) => void;
  onRemoveEntry: (path: string, index: number) => void;
  onAddEntry: (path: string, newItem: Section26_2) => void;
  path: string;
  isReadOnlyField: (fieldName: string) => boolean;
  getDefaultNewItem: (itemType: string) => any;
}

const RenderSection26_2: React.FC<Section26_2Props> = ({
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
    onInputChange(`${path}.section26_2[${index}].${fieldPath}`, formattedValue);
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
      onInputChange(`${path}.section26_2[${index}].${fieldPath}`, value);
    };

  const renderEntry = (item: Section26_2, index: number) => (
    <div key={index} className="space-y-4 p-4 border rounded-lg">
      <h3>Entry #{index + 1}</h3>

      <label>
        Financial Problems Due to Gambling
        <input
          type="checkbox"
          checked={item.financialProblemsDueToGambling}
          onChange={handleInputChange(index, "financialProblemsDueToGambling")}
          readOnly={isReadOnlyField(`section26_2[${index}].financialProblemsDueToGambling`)}
        />
      </label>

      <label>
        Date Range From
        <input
          type="text"
          value={item.dateRange.from.date}
          onChange={handleInputChange(index, "dateRange.from.date")}
          readOnly={isReadOnlyField(`section26_2[${index}].dateRange.from.date`)}
        />
        <input
          type="checkbox"
          checked={item.dateRange.from.estimated}
          onChange={handleInputChange(index, "dateRange.from.estimated")}
          readOnly={isReadOnlyField(`section26_2[${index}].dateRange.from.estimated`)}
        />
        Estimated
      </label>

      <label>
        Date Range To
        <input
          type="text"
          value={item.dateRange.to.date}
          onChange={handleInputChange(index, "dateRange.to.date")}
          readOnly={isReadOnlyField(`section26_2[${index}].dateRange.to.date`)}
        />
        <input
          type="checkbox"
          checked={item.dateRange.to.estimated}
          onChange={handleInputChange(index, "dateRange.to.estimated")}
          readOnly={isReadOnlyField(`section26_2[${index}].dateRange.to.estimated`)}
        />
        Estimated
      </label>

      <label>
        Present
        <input
          type="checkbox"
          checked={item.dateRange.present}
          onChange={handleInputChange(index, "dateRange.present")}
          readOnly={isReadOnlyField(`section26_2[${index}].dateRange.present`)}
        />
      </label>

      <label>
        Gambling Losses
        <input
          type="number"
          value={item.gamblingLosses.amount}
          onChange={handleInputChange(index, "gamblingLosses.amount")}
          onBlur={handleBlur(index, "gamblingLosses.amount")}
          readOnly={isReadOnlyField(`section26_2[${index}].gamblingLosses.amount`)}
        />
        <input
          type="checkbox"
          checked={item.gamblingLosses.estimated}
          onChange={handleInputChange(index, "gamblingLosses.estimated")}
          readOnly={isReadOnlyField(`section26_2[${index}].gamblingLosses.estimated`)}
        />
        Estimated
      </label>

      <label>
        Description of Financial Problems
        <textarea
          value={item.descriptionOfFinancialProblems}
          onChange={handleInputChange(index, "descriptionOfFinancialProblems")}
          readOnly={isReadOnlyField(`section26_2[${index}].descriptionOfFinancialProblems`)}
        />
      </label>

      <label>
        Actions Taken
        <textarea
          value={item.actionsTaken}
          onChange={handleInputChange(index, "actionsTaken")}
          readOnly={isReadOnlyField(`section26_2[${index}].actionsTaken`)}
        />
      </label>

      <button
        onClick={(event) => {
          event.preventDefault();
          onRemoveEntry(`${path}.section26_2`, index);
        }}
        disabled={isReadOnlyField(`section26_2[${index}].remove`)}
      >
        Remove Entry
      </button>
    </div>
  );

  return (
    <div className="space-y-4">
      <h2>Section 26.2</h2>
      {data.map((item, index) => renderEntry(item, index))}
      <button
        onClick={(event) => {
          event.preventDefault();
          onAddEntry(
            `${path}.section26_2`,
            getDefaultNewItem(`${path}.section26_2`)
          );
        }}
      >
        Add Entry
      </button>
    </div>
  );
};

export { RenderSection26_2 };
