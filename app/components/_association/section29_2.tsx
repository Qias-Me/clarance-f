import React from "react";
// import { Section29_2 } from "api_v2/interfaces/association"; // Temporarily commented out

// Temporary mock interface
interface Section29_2 {
  activityDescription?: string;
  dateRange?: {
    from: { date: string; estimated: boolean };
    to: { date: string; estimated: boolean };
    present: boolean;
  };
}

interface Section29_2Props {
  data: Section29_2[];
  onInputChange: (path: string, value: any) => void;
  onRemoveEntry: (path: string, index: number) => void;
  onAddEntry: (path: string, newItem: Section29_2) => void;
  path: string;
  isReadOnlyField: (fieldName: string) => boolean;
  getDefaultNewItem: (itemType: string) => any;
}

const RenderSection29_2: React.FC<Section29_2Props> = ({
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
      onInputChange(`${path}.section29_2[${index}].${fieldPath}`, value);
    };

  const renderEntry = (item: Section29_2, index: number) => (
    <div key={index} className="space-y-4 p-4 border rounded-lg">
      <h3>Entry #{index + 1}</h3>

      <div>
        <label htmlFor={`organizationName-${index}`}>Organization Name</label>
        <input
          type="text"
          id={`organizationName-${index}`}
          value={item.organizationName}
          onChange={handleInputChange(index, "organizationName")}
          readOnly={isReadOnlyField(`section29_2[${index}].organizationName`)}
        />
      </div>

      <div>
        <label htmlFor={`street-${index}`}>Street</label>
        <input
          type="text"
          id={`street-${index}`}
          value={item.organizationAddress.street}
          onChange={handleInputChange(index, "organizationAddress.street")}
          readOnly={isReadOnlyField(`section29_2[${index}].organizationAddress.street`)}
        />
        <label htmlFor={`city-${index}`}>City</label>
        <input
          type="text"
          id={`city-${index}`}
          value={item.organizationAddress.city}
          onChange={handleInputChange(index, "organizationAddress.city")}
          readOnly={isReadOnlyField(`section29_2[${index}].organizationAddress.city`)}
        />
        <label htmlFor={`state-${index}`}>State</label>
        <input
          type="text"
          id={`state-${index}`}
          value={item.organizationAddress.state}
          onChange={handleInputChange(index, "organizationAddress.state")}
          readOnly={isReadOnlyField(`section29_2[${index}].organizationAddress.state`)}
        />
        <label htmlFor={`zipCode-${index}`}>Zip Code</label>
        <input
          type="text"
          id={`zipCode-${index}`}
          value={item.organizationAddress.zipCode}
          onChange={handleInputChange(index, "organizationAddress.zipCode")}
          readOnly={isReadOnlyField(`section29_2[${index}].organizationAddress.zipCode`)}
        />
        <label htmlFor={`country-${index}`}>Country</label>
        <input
          type="text"
          id={`country-${index}`}
          value={item.organizationAddress.country}
          onChange={handleInputChange(index, "organizationAddress.country")}
          readOnly={isReadOnlyField(`section29_2[${index}].organizationAddress.country`)}
        />
      </div>

      <div>
        <label htmlFor={`from-date-${index}`}>From Date</label>
        <input
          type="date"
          id={`from-date-${index}`}
          value={item.involvementDateRange.from.date}
          onChange={handleInputChange(index, "involvementDateRange.from.date")}
          readOnly={isReadOnlyField(`section29_2[${index}].involvementDateRange.from.date`)}
        />
        <label htmlFor={`from-estimated-${index}`}>Estimated</label>
        <input
          type="checkbox"
          id={`from-estimated-${index}`}
          checked={item.involvementDateRange.from.estimated}
          onChange={handleInputChange(index, "involvementDateRange.from.estimated")}
          readOnly={isReadOnlyField(`section29_2[${index}].involvementDateRange.from.estimated`)}
        />
      </div>

      <div>
        <label htmlFor={`to-date-${index}`}>To Date</label>
        <input
          type="date"
          id={`to-date-${index}`}
          value={item.involvementDateRange.to.date}
          onChange={handleInputChange(index, "involvementDateRange.to.date")}
          readOnly={isReadOnlyField(`section29_2[${index}].involvementDateRange.to.date`)}
        />
        <label htmlFor={`to-estimated-${index}`}>Estimated</label>
        <input
          type="checkbox"
          id={`to-estimated-${index}`}
          checked={item.involvementDateRange.to.estimated}
          onChange={handleInputChange(index, "involvementDateRange.to.estimated")}
          readOnly={isReadOnlyField(`section29_2[${index}].involvementDateRange.to.estimated`)}
        />
        <label htmlFor={`present-${index}`}>Present</label>
        <input
          type="checkbox"
          id={`present-${index}`}
          checked={item.involvementDateRange.present}
          onChange={handleInputChange(index, "involvementDateRange.present")}
          readOnly={isReadOnlyField(`section29_2[${index}].involvementDateRange.present`)}
        />
      </div>

      <div>
        <label htmlFor={`positionsHeld-${index}`}>Positions Held</label>
        <input
          type="text"
          id={`positionsHeld-${index}`}
          value={item.positionsHeld}
          onChange={handleInputChange(index, "positionsHeld")}
          readOnly={isReadOnlyField(`section29_2[${index}].positionsHeld`)}
        />
      </div>

      <div>
        <label htmlFor={`contributions-${index}`}>Contributions</label>
        <textarea
          id={`contributions-${index}`}
          value={item.contributions}
          onChange={handleInputChange(index, "contributions")}
          readOnly={isReadOnlyField(`section29_2[${index}].contributions`)}
        />
      </div>

      <div>
        <label htmlFor={`natureOfInvolvement-${index}`}>Nature of Involvement</label>
        <textarea
          id={`natureOfInvolvement-${index}`}
          value={item.natureOfInvolvement}
          onChange={handleInputChange(index, "natureOfInvolvement")}
          readOnly={isReadOnlyField(`section29_2[${index}].natureOfInvolvement`)}
        />
      </div>

      <button
        onClick={(event) => {
          event.preventDefault();
          onRemoveEntry(`${path}.section29_2`, index);
        }}
        disabled={isReadOnlyField(`section29_2[${index}].remove`)}
      >
        Remove Entry
      </button>
    </div>
  );

  return (
    <div className="space-y-4">
      <h2>Section 29.2</h2>
      {data.map((item, index) => renderEntry(item, index))}
      <button
        onClick={(event) => {
          event.preventDefault();
          onAddEntry(
            `${path}.section29_2`,
            getDefaultNewItem(`${path}.section29_2`)
          );
        }}
      >
        Add Entry
      </button>
    </div>
  );
};

export { RenderSection29_2 };
