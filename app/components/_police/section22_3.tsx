import React from "react";
import { Section22_3 } from "api_v2/interfaces/policeRecord";

interface Section22_3Props {
  data: Section22_3[];
  onInputChange: (path: string, value: any) => void;
  onRemoveEntry: (path: string, index: number) => void;
  onAddEntry: (path: string, newItem: Section22_3) => void;
  path: string;
  isReadOnlyField: (fieldName: string) => boolean;
  getDefaultNewItem: (itemType: string) => any;
}

const RenderSection22_3: React.FC<Section22_3Props> = ({
  data,
  onInputChange,
  onRemoveEntry,
  onAddEntry,
  getDefaultNewItem,
  path,
  isReadOnlyField,
}) => {
  const handleInputChange =
    (fieldPath: string) =>
    (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      onInputChange(`${path}.${fieldPath}`, event.target.value);
    };

  const handleCheckboxChange =
    (fieldPath: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
      onInputChange(`${path}.${fieldPath}`, event.target.checked);
    };

  const renderOrder = (order: OrderInfo, index: number, entryIndex: number) => (
    <div key={index} className="order-entry space-y-2">
      <label>
        Explanation:
        <input
          type="text"
          value={order.explanation}
          onChange={handleInputChange(`section22_3[${entryIndex}].orders[${index}].explanation`)}
          disabled={isReadOnlyField(`section22_3[${entryIndex}].orders[${index}].explanation`)}
        />
      </label>
      <label>
        Date Issued:
        <input
          type="date"
          value={order.dateIssued.date}
          onChange={handleInputChange(`section22_3[${entryIndex}].orders[${index}].dateIssued.date`)}
          disabled={isReadOnlyField(`section22_3[${entryIndex}].orders[${index}].dateIssued.date`)}
        />
      </label>
      <label>
        Estimated:
        <input
          type="checkbox"
          checked={order.dateIssued.estimated}
          onChange={handleCheckboxChange(`section22_3[${entryIndex}].orders[${index}].dateIssued.estimated`)}
          disabled={isReadOnlyField(`section22_3[${entryIndex}].orders[${index}].dateIssued.estimated`)}
        />
      </label>
      <label>
        Court/Agency Name:
        <input
          type="text"
          value={order.courtAgencyName}
          onChange={handleInputChange(`section22_3[${entryIndex}].orders[${index}].courtAgencyName`)}
          disabled={isReadOnlyField(`section22_3[${entryIndex}].orders[${index}].courtAgencyName`)}
        />
      </label>
      <label>
        Court/Agency Location - City:
        <input
          type="text"
          value={order.courtAgencyLocation.city}
          onChange={handleInputChange(`section22_3[${entryIndex}].orders[${index}].courtAgencyLocation.city`)}
          disabled={isReadOnlyField(`section22_3[${entryIndex}].orders[${index}].courtAgencyLocation.city`)}
        />
      </label>
      <label>
        Court/Agency Location - County:
        <input
          type="text"
          value={order.courtAgencyLocation.county}
          onChange={handleInputChange(`section22_3[${entryIndex}].orders[${index}].courtAgencyLocation.county`)}
          disabled={isReadOnlyField(`section22_3[${entryIndex}].orders[${index}].courtAgencyLocation.county`)}
        />
      </label>
      <label>
        Court/Agency Location - State:
        <input
          type="text"
          value={order.courtAgencyLocation.state}
          onChange={handleInputChange(`section22_3[${entryIndex}].orders[${index}].courtAgencyLocation.state`)}
          disabled={isReadOnlyField(`section22_3[${entryIndex}].orders[${index}].courtAgencyLocation.state`)}
        />
      </label>
      <label>
        Court/Agency Location - ZIP:
        <input
          type="text"
          value={order.courtAgencyLocation.zip}
          onChange={handleInputChange(`section22_3[${entryIndex}].orders[${index}].courtAgencyLocation.zip`)}
          disabled={isReadOnlyField(`section22_3[${entryIndex}].orders[${index}].courtAgencyLocation.zip`)}
        />
      </label>
      <label>
        Court/Agency Location - Country:
        <input
          type="text"
          value={order.courtAgencyLocation.country}
          onChange={handleInputChange(`section22_3[${entryIndex}].orders[${index}].courtAgencyLocation.country`)}
          disabled={isReadOnlyField(`section22_3[${entryIndex}].orders[${index}].courtAgencyLocation.country`)}
        />
      </label>
    </div>
  );

  const renderEntry = (item: Section22_3, index: number) => (
    <div key={index} className="space-y-4 p-4 border rounded-lg">
      <h3>Entry #{index + 1}</h3>


      {item.orders.map((order, orderIndex) => renderOrder(order, orderIndex, index))}

      <button
        onClick={(event) => {
          event.preventDefault();
          onRemoveEntry(`${path}.section22_3`, index);
        }}
        disabled={isReadOnlyField(`section22_3[${index}]`)}
      >
        Remove Entry
      </button>
    </div>
  );

  return (
    <div className="space-y-4">
      <h2>Section 22.3</h2>
      {data.map((item, index) => renderEntry(item, index))}
      <button
        onClick={(event) => {
          event.preventDefault();
          onAddEntry(`${path}.section22_3`, getDefaultNewItem(`${path}.section22_3`));
        }}
      >
        Add Entry
      </button>
    </div>
  );
};

export { RenderSection22_3 };
