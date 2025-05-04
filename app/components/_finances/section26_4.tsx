import React from "react";
import { Section26_4 } from "api_v2/interfaces/finances";

interface Section26_4Props {
  data: Section26_4[];
  onInputChange: (path: string, value: any) => void;
  onRemoveEntry: (path: string, index: number) => void;
  onAddEntry: (path: string, newItem: Section26_4) => void;
  path: string;
  isReadOnlyField: (fieldName: string) => boolean;
  getDefaultNewItem: (itemType: string) => any;
}

const RenderSection26_4: React.FC<Section26_4Props> = ({
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
      onInputChange(`${path}.section26_4[${index}].${fieldPath}`, value);
    };

  const renderEntry = (item: Section26_4, index: number) => (
    <div key={item._id} className="space-y-4 p-4 border rounded-lg">
      <h3>Entry #{index + 1}</h3>

      <label>
        Agency or Company Name
        <input
          type="text"
          value={item.agencyOrCompanyName}
          onChange={handleInputChange(index, "agencyOrCompanyName")}
          readOnly={isReadOnlyField(`section26_4[${index}].agencyOrCompanyName`)}
        />
      </label>

      <label>
        Street
        <input
          type="text"
          value={item.agencyOrCompanyAddress.street}
          onChange={handleInputChange(index, "agencyOrCompanyAddress.street")}
          readOnly={isReadOnlyField(`section26_4[${index}].agencyOrCompanyAddress.street`)}
        />
      </label>
      <label>
        City
        <input
          type="text"
          value={item.agencyOrCompanyAddress.city}
          onChange={handleInputChange(index, "agencyOrCompanyAddress.city")}
          readOnly={isReadOnlyField(`section26_4[${index}].agencyOrCompanyAddress.city`)}
        />
      </label>
      <label>
        State
        <input
          type="text"
          value={item.agencyOrCompanyAddress.state}
          onChange={handleInputChange(index, "agencyOrCompanyAddress.state")}
          readOnly={isReadOnlyField(`section26_4[${index}].agencyOrCompanyAddress.state`)}
        />
      </label>
      <label>
        Zip Code
        <input
          type="text"
          value={item.agencyOrCompanyAddress.zipCode}
          onChange={handleInputChange(index, "agencyOrCompanyAddress.zipCode")}
          readOnly={isReadOnlyField(`section26_4[${index}].agencyOrCompanyAddress.zipCode`)}
        />
      </label>
      <label>
        Country
        <input
          type="text"
          value={item.agencyOrCompanyAddress.country}
          onChange={handleInputChange(index, "agencyOrCompanyAddress.country")}
          readOnly={isReadOnlyField(`section26_4[${index}].agencyOrCompanyAddress.country`)}
        />
      </label>

      <label>
        Counseling Warning Disciplinary Date
        <input
          type="text"
          value={item.counselingWarningDisciplinaryDate.date}
          onChange={handleInputChange(index, "counselingWarningDisciplinaryDate.date")}
          readOnly={isReadOnlyField(`section26_4[${index}].counselingWarningDisciplinaryDate.date`)}
        />
      </label>
      <label>
        Estimated
        <input
          type="checkbox"
          checked={item.counselingWarningDisciplinaryDate.estimated}
          onChange={handleInputChange(index, "counselingWarningDisciplinaryDate.estimated")}
          readOnly={isReadOnlyField(`section26_4[${index}].counselingWarningDisciplinaryDate.estimated`)}
        />
      </label>

      <label>
        Counseling Warning Disciplinary Reason
        <input
          type="text"
          value={item.counselingWarningDisciplinaryReason}
          onChange={handleInputChange(index, "counselingWarningDisciplinaryReason")}
          readOnly={isReadOnlyField(`section26_4[${index}].counselingWarningDisciplinaryReason`)}
        />
      </label>

      <label>
        Violation Amount
        <input
          type="number"
          value={item.violationAmount.amount}
          onChange={handleInputChange(index, "violationAmount.amount")}
          readOnly={isReadOnlyField(`section26_4[${index}].violationAmount.amount`)}
        />
      </label>
      <label>
        Estimated
        <input
          type="checkbox"
          checked={item.violationAmount.estimated}
          onChange={handleInputChange(index, "violationAmount.estimated")}
          readOnly={isReadOnlyField(`section26_4[${index}].violationAmount.estimated`)}
        />
      </label>

      <label>
        Rectifying Actions
        <input
          type="text"
          value={item.rectifyingActions}
          onChange={handleInputChange(index, "rectifyingActions")}
          readOnly={isReadOnlyField(`section26_4[${index}].rectifyingActions`)}
        />
      </label>

      <button
        onClick={(event) => {
          event.preventDefault();
          onRemoveEntry(`${path}.section26_4`, index);
        }}
        disabled={isReadOnlyField(`section26_4[${index}].remove`)}
      >
        Remove Entry
      </button>
    </div>
  );

  return (
    <div className="space-y-4">
      <h2>Section 26.4</h2>
      {data.map((item, index) => renderEntry(item, index))}
      <button
        onClick={(event) => {
          event.preventDefault();
          onAddEntry(
            `${path}.section26_4`,
            getDefaultNewItem("Section26_4")
          );
        }}
      >
        Add Entry
      </button>
    </div>
  );
};

export { RenderSection26_4 };
