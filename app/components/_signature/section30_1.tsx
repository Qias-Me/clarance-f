import React from "react";
import { Section30_1 } from "api_v2/interfaces/signature";

interface Section30_1Props {
  data: Section30_1[];
  onInputChange: (path: string, value: any) => void;
  onRemoveEntry: (path: string, index: number) => void;
  onAddEntry: (path: string, newItem: Section30_1) => void;
  path: string;
  isReadOnlyField: (fieldName: string) => boolean;
  getDefaultNewItem: (itemType: string) => any;
}

const RenderSection30_1: React.FC<Section30_1Props> = ({
  data,
  onInputChange,
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
      onInputChange(`${path}.section30_1[${index}].${fieldPath}`, value);
    };

  const renderEntry = (item: Section30_1, index: number) => (
    <div key={index} className="space-y-4 p-4 border rounded-lg">
      <div>
        <label htmlFor={`section30_1-fullName-${index}`}>Full Name</label>
        <input
          id={`section30_1-fullName-${index}`}
          type="text"
          value={item.fullName}
          onChange={handleInputChange(index, "fullName")}
          readOnly={isReadOnlyField("fullName")}
        />
      </div>
      <div>
        <label htmlFor={`section30_1-dateSigned-${index}`}>Date Signed</label>
        <input
          id={`section30_1-dateSigned-${index}`}
          type="text"
          value={item.dateSigned}
          onChange={handleInputChange(index, "dateSigned")}
          readOnly={isReadOnlyField("dateSigned")}
        />
      </div>
      <div>
        <label htmlFor={`section30_1-otherNamesUsed-${index}`}>Other Names Used</label>
        <input
          id={`section30_1-otherNamesUsed-${index}`}
          type="text"
          value={item.otherNamesUsed}
          onChange={handleInputChange(index, "otherNamesUsed")}
          readOnly={isReadOnlyField("otherNamesUsed")}
        />
      </div>
      <div>
        <label htmlFor={`section30_1-address-street-${index}`}>Street Address</label>
        <input
          id={`section30_1-address-street-${index}`}
          type="text"
          value={item.address.street}
          onChange={handleInputChange(index, "address.street")}
          readOnly={isReadOnlyField("address.street")}
        />
      </div>
      <div>
        <label htmlFor={`section30_1-address-city-${index}`}>City</label>
        <input
          id={`section30_1-address-city-${index}`}
          type="text"
          value={item.address.city}
          onChange={handleInputChange(index, "address.city")}
          readOnly={isReadOnlyField("address.city")}
        />
      </div>
      <div>
        <label htmlFor={`section30_1-address-state-${index}`}>State</label>
        <input
          id={`section30_1-address-state-${index}`}
          type="text"
          value={item.address.state}
          onChange={handleInputChange(index, "address.state")}
          readOnly={isReadOnlyField("address.state")}
        />
      </div>
      <div>
        <label htmlFor={`section30_1-address-zipCode-${index}`}>Zip Code</label>
        <input
          id={`section30_1-address-zipCode-${index}`}
          type="text"
          value={item.address.zipCode}
          onChange={handleInputChange(index, "address.zipCode")}
          readOnly={isReadOnlyField("address.zipCode")}
        />
      </div>
      <div>
        <label htmlFor={`section30_1-address-country-${index}`}>Country</label>
        <input
          id={`section30_1-address-country-${index}`}
          type="text"
          value={item.address.country}
          onChange={handleInputChange(index, "address.country")}
          readOnly={isReadOnlyField("address.country")}
        />
      </div>
      <div>
        <label htmlFor={`section30_1-telephoneNumber-${index}`}>Telephone Number</label>
        <input
          id={`section30_1-telephoneNumber-${index}`}
          type="text"
          value={item.telephoneNumber}
          onChange={handleInputChange(index, "telephoneNumber")}
          readOnly={isReadOnlyField("telephoneNumber")}
        />
      </div>
 
    </div>
  );

  return (
    <div className="space-y-4">
      <h2>Section 30.1</h2>
      {data.map((item, index) => renderEntry(item, index))}

    </div>
  );
};

export { RenderSection30_1 };
