import { type Section20B1 } from "api/interfaces/sections/foreignActivities";
import React from "react";

interface Section20B1Props {
  data: Section20B1[];
  onInputChange: (path: string, value: any) => void;
  onRemoveEntry: (path: string, index: number) => void;
  onAddEntry: (path: string, newItem: Section20B1) => void;
  path: string;
  isReadOnlyField: (fieldName: string) => boolean;
  getDefaultNewItem: (itemType: string) => any;
}

const RenderSection20B1: React.FC<Section20B1Props> = ({
  data,
  onInputChange,
  path,
  isReadOnlyField,
  onAddEntry,
  onRemoveEntry,
  getDefaultNewItem,
}) => {
  const handleInputChange =
    (index: number, fieldPath: string) =>
    (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      onInputChange(
        `${path}.section20B1[${index}].${fieldPath}`,
        event.target.value
      );
    };

  const handleCheckboxChange =
    (index: number, fieldPath: string) =>
    (event: React.ChangeEvent<HTMLInputElement>) => {
      onInputChange(
        `${path}.section20B1[${index}].${fieldPath}`,
        event.target.checked
      );
    };

  return (
    <div className="space-y-4">
      {data.map((item, index) => (
        <div key={index} className="border p-4 space-y-2">
          <button
            type="button"
            onClick={() => onRemoveEntry(`${path}.section20B1`, index)}
          >
            Remove Entry
          </button>
          <div>
            <label htmlFor={`${path}.section20B1[${index}].id_`}>ID:</label>
            <input
              id={`${path}.section20B1[${index}].id_`}
              type="number"
              value={item.id_}
              onChange={handleInputChange(index, "id_")}
              readOnly={isReadOnlyField("id_")}
            />
          </div>
          <div>
            <label htmlFor={`${path}.section20B1[${index}].description`}>
              Description:
            </label>
            <input
              id={`${path}.section20B1[${index}].description`}
              type="text"
              value={item.description}
              onChange={handleInputChange(index, "description")}
              readOnly={isReadOnlyField("description")}
            />
          </div>
          <div>
            <label
              htmlFor={`${path}.section20B1[${index}].individual.lastName`}
            >
              Individual Last Name:
            </label>
            <input
              id={`${path}.section20B1[${index}].individual.lastName`}
              type="text"
              value={item.individual.lastName}
              onChange={handleInputChange(index, "individual.lastName")}
              readOnly={isReadOnlyField("individual.lastName")}
            />
          </div>
          <div>
            <label
              htmlFor={`${path}.section20B1[${index}].individual.firstName`}
            >
              Individual First Name:
            </label>
            <input
              id={`${path}.section20B1[${index}].individual.firstName`}
              type="text"
              value={item.individual.firstName}
              onChange={handleInputChange(index, "individual.firstName")}
              readOnly={isReadOnlyField("individual.firstName")}
            />
          </div>
          <div>
            <label
              htmlFor={`${path}.section20B1[${index}].individual.middleName`}
            >
              Individual Middle Name:
            </label>
            <input
              id={`${path}.section20B1[${index}].individual.middleName`}
              type="text"
              value={item.individual.middleName || ""}
              onChange={handleInputChange(index, "individual.middleName")}
              readOnly={isReadOnlyField("individual.middleName")}
            />
          </div>
          <div>
            <label htmlFor={`${path}.section20B1[${index}].individual.suffix`}>
              Individual Suffix:
            </label>
            <input
              id={`${path}.section20B1[${index}].individual.suffix`}
              type="text"
              value={item.individual.suffix || ""}
              onChange={handleInputChange(index, "individual.suffix")}
              readOnly={isReadOnlyField("individual.suffix")}
            />
          </div>
          <div>
            <label
              htmlFor={`${path}.section20B1[${index}].individual.relationship`}
            >
              Individual Relationship:
            </label>
            <input
              id={`${path}.section20B1[${index}].individual.relationship`}
              type="text"
              value={item.individual.relationship}
              onChange={handleInputChange(index, "individual.relationship")}
              readOnly={isReadOnlyField("individual.relationship")}
            />
          </div>
          <div>
            <label htmlFor={`${path}.section20B1[${index}].organization`}>
              Organization:
            </label>
            <input
              id={`${path}.section20B1[${index}].organization`}
              type="text"
              value={item.organization}
              onChange={handleInputChange(index, "organization")}
              readOnly={isReadOnlyField("organization")}
            />
          </div>
          <div>
            <label
              htmlFor={`${path}.section20B1[${index}].organizationCountry`}
            >
              Organization Country:
            </label>
            <input
              id={`${path}.section20B1[${index}].organizationCountry`}
              type="text"
              value={item.organizationCountry}
              onChange={handleInputChange(index, "organizationCountry")}
              readOnly={isReadOnlyField("organizationCountry")}
            />
          </div>
          <div>
            <label htmlFor={`${path}.section20B1[${index}].dateFrom.date`}>
              Date From:
            </label>
            <input
              id={`${path}.section20B1[${index}].dateFrom.date`}
              type="text"
              value={item.dateFrom.date}
              onChange={handleInputChange(index, "dateFrom.date")}
              readOnly={isReadOnlyField("dateFrom.date")}
            />
            <label htmlFor={`${path}.section20B1[${index}].dateFrom.estimated`}>
              Estimated:
            </label>
            <input
              id={`${path}.section20B1[${index}].dateFrom.estimated`}
              type="checkbox"
              checked={item.dateFrom.estimated}
              onChange={(e) =>
                handleCheckboxChange(index, "dateFrom.estimated")(e as any)
              }
              readOnly={isReadOnlyField("dateFrom.estimated")}
            />
          </div>
          <div>
            <label htmlFor={`${path}.section20B1[${index}].dateTo.date`}>
              Date To:
            </label>
            <input
              id={`${path}.section20B1[${index}].dateTo.date`}
              type="text"
              value={item.dateTo.date}
              onChange={handleInputChange(index, "dateTo.date")}
              readOnly={isReadOnlyField("dateTo.date")}
            />
            <label htmlFor={`${path}.section20B1[${index}].dateTo.estimated`}>
              Estimated:
            </label>
            <input
              id={`${path}.section20B1[${index}].dateTo.estimated`}
              type="checkbox"
              checked={item.dateTo.estimated}
              onChange={(e) =>
                handleCheckboxChange(index, "dateTo.estimated")(e as any)
              }
              readOnly={isReadOnlyField("dateTo.estimated")}
            />
          </div>
          <div>
            <label htmlFor={`${path}.section20B1[${index}].compensation`}>
              Compensation:
            </label>
            <input
              id={`${path}.section20B1[${index}].compensation`}
              type="text"
              value={item.compensation || ""}
              onChange={handleInputChange(index, "compensation")}
              readOnly={isReadOnlyField("compensation")}
            />
          </div>
        </div>
      ))}
      <button
        onClick={(event) => {
          event.preventDefault();
          onAddEntry(
            `${path}.section20B1`,
            getDefaultNewItem(`${path}.section20B1`)
          );
        }}
      >
        Add Entry
      </button>
    </div>
  );
};

export { RenderSection20B1 };
