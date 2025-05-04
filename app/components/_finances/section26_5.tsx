import React from "react";
import { Section26_5 } from "api_v2/interfaces/finances";

interface Section26_5Props {
  data: Section26_5[];
  onInputChange: (path: string, value: any) => void;
  onRemoveEntry: (path: string, index: number) => void;
  onAddEntry: (path: string, newItem: Section26_5) => void;
  path: string;
  isReadOnlyField: (fieldName: string) => boolean;
  getDefaultNewItem: (itemType: string) => any;
}

const RenderSection26_5: React.FC<Section26_5Props> = ({
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
      onInputChange(`${path}.section26_5[${index}].${fieldPath}`, value);
    };

  const renderEntry = (item: Section26_5, index: number) => (
    <div key={index} className="space-y-4 p-4 border rounded-lg">
      <h3>Entry #{index + 1}</h3>

      <label>
        Explanation
        <textarea
          value={item.explanation}
          onChange={handleInputChange(index, "explanation")}
          readOnly={isReadOnlyField(`section26_5[${index}].explanation`)}
        />
      </label>

      <label>
        Credit Counseling Organization Name
        <input
          type="text"
          value={item.creditCounselingOrganizationName}
          onChange={handleInputChange(index, "creditCounselingOrganizationName")}
          readOnly={isReadOnlyField(`section26_5[${index}].creditCounselingOrganizationName`)}
        />
      </label>

      <label>
        Credit Counseling Organization Phone Number
        <input
          type="text"
          value={item.creditCounselingOrganizationPhoneNumber.number}
          onChange={handleInputChange(index, "creditCounselingOrganizationPhoneNumber.number")}
          readOnly={isReadOnlyField(`section26_5[${index}].creditCounselingOrganizationPhoneNumber.number`)}
          placeholder="Phone Number"
        />
        <input
          type="text"
          value={item.creditCounselingOrganizationPhoneNumber.extension}
          onChange={handleInputChange(index, "creditCounselingOrganizationPhoneNumber.extension")}
          readOnly={isReadOnlyField(`section26_5[${index}].creditCounselingOrganizationPhoneNumber.extension`)}
          placeholder="Extension"
        />
        <input
          type="checkbox"
          checked={item.creditCounselingOrganizationPhoneNumber.isInternationalOrDSN}
          onChange={handleInputChange(index, "creditCounselingOrganizationPhoneNumber.isInternationalOrDSN")}
          readOnly={isReadOnlyField(`section26_5[${index}].creditCounselingOrganizationPhoneNumber.isInternationalOrDSN`)}
        />
        International or DSN
        <select
          value={item.creditCounselingOrganizationPhoneNumber.timeOfDay}
          onChange={handleInputChange(index, "creditCounselingOrganizationPhoneNumber.timeOfDay")}
          readOnly={isReadOnlyField(`section26_5[${index}].creditCounselingOrganizationPhoneNumber.timeOfDay`)}
        >
          <option value="Day">Day</option>
          <option value="Night">Night</option>
        </select>
      </label>

      <label>
        Credit Counseling Organization Location - Street
        <input
          type="text"
          value={item.creditCounselingOrganizationLocation.street}
          onChange={handleInputChange(index, "creditCounselingOrganizationLocation.street")}
          readOnly={isReadOnlyField(`section26_5[${index}].creditCounselingOrganizationLocation.street`)}
          placeholder="Street"
        />
      </label>

      <label>
        Credit Counseling Organization Location - City
        <input
          type="text"
          value={item.creditCounselingOrganizationLocation.city}
          onChange={handleInputChange(index, "creditCounselingOrganizationLocation.city")}
          readOnly={isReadOnlyField(`section26_5[${index}].creditCounselingOrganizationLocation.city`)}
          placeholder="City"
        />
      </label>

      <label>
        Credit Counseling Organization Location - State
        <input
          type="text"
          value={item.creditCounselingOrganizationLocation.state}
          onChange={handleInputChange(index, "creditCounselingOrganizationLocation.state")}
          readOnly={isReadOnlyField(`section26_5[${index}].creditCounselingOrganizationLocation.state`)}
          placeholder="State"
        />
      </label>

      <label>
        Credit Counseling Organization Location - Zip Code
        <input
          type="text"
          value={item.creditCounselingOrganizationLocation.zipCode}
          onChange={handleInputChange(index, "creditCounselingOrganizationLocation.zipCode")}
          readOnly={isReadOnlyField(`section26_5[${index}].creditCounselingOrganizationLocation.zipCode`)}
          placeholder="Zip Code"
        />
      </label>

      <label>
        Credit Counseling Organization Location - Country
        <input
          type="text"
          value={item.creditCounselingOrganizationLocation.country}
          onChange={handleInputChange(index, "creditCounselingOrganizationLocation.country")}
          readOnly={isReadOnlyField(`section26_5[${index}].creditCounselingOrganizationLocation.country`)}
          placeholder="Country"
        />
      </label>

      <label>
        Counseling Actions
        <textarea
          value={item.counselingActions}
          onChange={handleInputChange(index, "counselingActions")}
          readOnly={isReadOnlyField(`section26_5[${index}].counselingActions`)}
        />
      </label>

      <button
        onClick={(event) => {
          event.preventDefault();
          onRemoveEntry(`${path}.section26_5`, index);
        }}
        disabled={isReadOnlyField(`section26_5[${index}].remove`)}
      >
        Remove Entry
      </button>
    </div>
  );

  return (
    <div className="space-y-4">
      <h2>Section 26.5</h2>
      {data.map((item, index) => renderEntry(item, index))}
      <button
        onClick={(event) => {
          event.preventDefault();
          onAddEntry(
            `${path}.section26_5`,
            getDefaultNewItem(`${path}.section26_5`)
          );
        }}
      >
        Add Entry
      </button>
    </div>
  );
};

export { RenderSection26_5 };
