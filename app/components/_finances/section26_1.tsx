import React from "react";
import { Section26_1 } from "api_v2/interfaces/finances";

interface Section26_1Props {
  data: Section26_1[];
  onInputChange: (path: string, value: any) => void;
  onRemoveEntry: (path: string, index: number) => void;
  onAddEntry: (path: string, newItem: Section26_1) => void;
  path: string;
  isReadOnlyField: (fieldName: string) => boolean;
  getDefaultNewItem: (itemType: string) => any;
}

const RenderSection26_1: React.FC<Section26_1Props> = ({
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

  const handleBlur =
    (index: number, fieldPath: string) =>
    (event: React.FocusEvent<HTMLInputElement>) => {
      const value = event.target.value;
      const formattedValue = formatValue(value) || "0.00";
      onInputChange(
        `${path}.section26_1[${index}].${fieldPath}`,
        formattedValue
      );
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
      onInputChange(`${path}.section26_1[${index}].${fieldPath}`, value);
    };

  const renderEntry = (item: Section26_1, index: number) => (
    <div key={index} className="space-y-4 p-4 border rounded-lg">
      <h3>Entry #{index + 1}</h3>

      <label>
        Court Docket Number
        <input
          type="text"
          value={item.courtDocketNumber}
          onChange={handleInputChange(index, "courtDocketNumber")}
          readOnly={isReadOnlyField(`section26_1[${index}].courtDocketNumber`)}
        />
      </label>

      <label>
        Date Filed
        <input
          type="text"
          value={item.dateFiled.date}
          onChange={handleInputChange(index, "dateFiled.date")}
          readOnly={isReadOnlyField(`section26_1[${index}].dateFiled.date`)}
        />
        <input
          type="checkbox"
          checked={item.dateFiled.estimated}
          onChange={handleInputChange(index, "dateFiled.estimated")}
          readOnly={isReadOnlyField(
            `section26_1[${index}].dateFiled.estimated`
          )}
        />
        Estimated
      </label>

      <label>
        Date Discharged
        <input
          type="text"
          value={item.dateDischarged.date}
          onChange={handleInputChange(index, "dateDischarged.date")}
          readOnly={isReadOnlyField(
            `section26_1[${index}].dateDischarged.date`
          )}
        />
        <input
          type="checkbox"
          checked={item.dateDischarged.estimated}
          onChange={handleInputChange(index, "dateDischarged.estimated")}
          readOnly={isReadOnlyField(
            `section26_1[${index}].dateDischarged.estimated`
          )}
        />
        Estimated
      </label>

      <label>
        Amount Involved
        <input
          type="number"
          value={item.amountInvolved.amount}
          onChange={handleInputChange(index, "amountInvolved.amount")}
          onBlur={handleBlur(index, "amountInvolved.amount")}
          readOnly={isReadOnlyField(
            `section26_1[${index}].amountInvolved.amount`
          )}
        />
        <input
          type="checkbox"
          checked={item.amountInvolved.estimated}
          onChange={handleInputChange(index, "amountInvolved.estimated")}
          readOnly={isReadOnlyField(
            `section26_1[${index}].amountInvolved.estimated`
          )}
        />
        Estimated
      </label>

      <label>
        Debt Recorded Under
        <input
          type="text"
          value={item.debtRecordedUnder.lastName}
          onChange={handleInputChange(index, "debtRecordedUnder.lastName")}
          readOnly={isReadOnlyField(
            `section26_1[${index}].debtRecordedUnder.lastName`
          )}
          placeholder="Last Name"
        />
        <input
          type="text"
          value={item.debtRecordedUnder.firstName}
          onChange={handleInputChange(index, "debtRecordedUnder.firstName")}
          readOnly={isReadOnlyField(
            `section26_1[${index}].debtRecordedUnder.firstName`
          )}
          placeholder="First Name"
        />
        <input
          type="text"
          value={item.debtRecordedUnder.middleName}
          onChange={handleInputChange(index, "debtRecordedUnder.middleName")}
          readOnly={isReadOnlyField(
            `section26_1[${index}].debtRecordedUnder.middleName`
          )}
          placeholder="Middle Name"
        />
        <input
          type="text"
          value={item.debtRecordedUnder.suffix}
          onChange={handleInputChange(index, "debtRecordedUnder.suffix")}
          readOnly={isReadOnlyField(
            `section26_1[${index}].debtRecordedUnder.suffix`
          )}
          placeholder="Suffix"
        />
      </label>

      <label>
        Court Name
        <input
          type="text"
          value={item.courtName}
          onChange={handleInputChange(index, "courtName")}
          readOnly={isReadOnlyField(`section26_1[${index}].courtName`)}
        />
      </label>

      <label>
        Court Address
        <input
          type="text"
          value={item.courtAddress.street}
          onChange={handleInputChange(index, "courtAddress.street")}
          readOnly={isReadOnlyField(
            `section26_1[${index}].courtAddress.street`
          )}
          placeholder="Street"
        />
        <input
          type="text"
          value={item.courtAddress.city}
          onChange={handleInputChange(index, "courtAddress.city")}
          readOnly={isReadOnlyField(`section26_1[${index}].courtAddress.city`)}
          placeholder="City"
        />
        <input
          type="text"
          value={item.courtAddress.state}
          onChange={handleInputChange(index, "courtAddress.state")}
          readOnly={isReadOnlyField(`section26_1[${index}].courtAddress.state`)}
          placeholder="State"
        />
        <input
          type="text"
          value={item.courtAddress.zipCode}
          onChange={handleInputChange(index, "courtAddress.zipCode")}
          readOnly={isReadOnlyField(
            `section26_1[${index}].courtAddress.zipCode`
          )}
          placeholder="Zip Code"
        />
        <input
          type="text"
          value={item.courtAddress.country}
          onChange={handleInputChange(index, "courtAddress.country")}
          readOnly={isReadOnlyField(
            `section26_1[${index}].courtAddress.country`
          )}
          placeholder="Country"
        />
      </label>

      <label>
        Discharged Of All Debts
        <input
          type="checkbox"
          checked={item.dischargedOfAllDebts}
          onChange={handleInputChange(index, "dischargedOfAllDebts")}
          readOnly={isReadOnlyField(
            `section26_1[${index}].dischargedOfAllDebts`
          )}
        />
      </label>

      <label>
        Discharge Explanation
        <textarea
          value={item.dischargeExplanation}
          onChange={handleInputChange(index, "dischargeExplanation")}
          readOnly={isReadOnlyField(
            `section26_1[${index}].dischargeExplanation`
          )}
        />
      </label>

      <button
        onClick={(event) => {
          event.preventDefault();
          onRemoveEntry(`${path}.section26_1`, index);
        }}
        disabled={isReadOnlyField(`section26_1[${index}].remove`)}
      >
        Remove Entry
      </button>
    </div>
  );

  return (
    <div className="space-y-4">
      <h2>Section 26.1</h2>
      {data.map((item, index) => renderEntry(item, index))}
      <button
        onClick={(event) => {
          event.preventDefault();
          onAddEntry(
            `${path}.section26_1`,
            getDefaultNewItem(`${path}.section26_1`)
          );
        }}
      >
        Add Entry
      </button>
    </div>
  );
};

export { RenderSection26_1 };
