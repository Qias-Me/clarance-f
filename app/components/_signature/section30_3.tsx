import React from "react";
import { type Section30_3 } from "api/interfaces/sections/signature";

interface Section30_3Props {
  data: Section30_3[];
  onInputChange: (path: string, value: any) => void;
  onRemoveEntry: (path: string, index: number) => void;
  onAddEntry: (path: string, newItem: Section30_3) => void;
  path: string;
  isReadOnlyField: (fieldName: string) => boolean;
  getDefaultNewItem: (itemType: string) => any;
}

const RenderSection30_3: React.FC<Section30_3Props> = ({
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
      onInputChange(`${path}.section30_3[${index}].${fieldPath}`, value);
    };

  const renderEntry = (item: Section30_3, index: number) => (
    <div key={index} className="space-y-4 p-4 border rounded-lg">
      <div>
        <label htmlFor={`section30_3-fullName-${index}`}>Full Name</label>
        <input
          id={`section30_3-fullName-${index}`}
          type="text"
          value={item.fullName}
          onChange={handleInputChange(index, "fullName")}
          readOnly={isReadOnlyField("fullName")}
        />
      </div>
      <div>
        <label htmlFor={`section30_3-dateSigned-${index}`}>Date Signed</label>
        <input
          id={`section30_3-dateSigned-${index}`}
          type="text"
          value={item.dateSigned}
          onChange={handleInputChange(index, "dateSigned")}
          readOnly={isReadOnlyField("dateSigned")}
        />
      </div>
    </div>
  );

  return (
    <div className="space-y-4">
      <h2>Section 30.3</h2>
      {data.map((item, index) => renderEntry(item, index))}
    </div>
  );
};

export { RenderSection30_3 };
