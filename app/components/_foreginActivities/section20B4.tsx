import { Section20B4 } from "api_v2/interfaces/foreignActivities";
import React from "react";

interface Section20B4Props {
  data: Section20B4[];
  onInputChange: (path: string, value: any) => void;
  onRemoveEntry: (path: string, index: number) => void;
  onAddEntry: (path: string, newItem: Section20B4) => void;
  path: string;
  isReadOnlyField: (fieldName: string) => boolean;
  getDefaultNewItem: (itemType: string) => any;
}

const RenderSection20B4: React.FC<Section20B4Props> = ({
  data,
  onInputChange,
  onRemoveEntry,
  onAddEntry,
  path,
  isReadOnlyField,
  getDefaultNewItem,
}) => {
  const handleInputChange =
    (index: number, fieldPath: string) =>
    (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      onInputChange(`${path}[${index}].${fieldPath}`, event.target.value);
    };

  const handleCheckboxChange =
    (index: number, fieldPath: string) =>
    (event: React.ChangeEvent<HTMLInputElement>) => {
      onInputChange(`${path}[${index}].${fieldPath}`, event.target.checked);
    };

  return (
    <div className="space-y-4">
      {data.map((item, index) => (
        <div key={index} className="border p-4 space-y-2">
          <button
            type="button"
            onClick={() => onRemoveEntry(`${path}.section20B4`, index)}
          >
            Remove Entry
          </button>
          <div>
            <label htmlFor={`${path}[${index}].id_`}>ID:</label>
            <input
              id={`${path}[${index}].id_`}
              type="number"
              value={item.id_}
              onChange={handleInputChange(index, "id_")}
              readOnly={isReadOnlyField("id_")}
            />
          </div>
          <div>
            <label htmlFor={`${path}[${index}].lastName`}>Last Name:</label>
            <input
              id={`${path}[${index}].lastName`}
              type="text"
              value={item.lastName}
              onChange={handleInputChange(index, "lastName")}
              readOnly={isReadOnlyField("lastName")}
            />
          </div>
          <div>
            <label htmlFor={`${path}[${index}].firstName`}>First Name:</label>
            <input
              id={`${path}[${index}].firstName`}
              type="text"
              value={item.firstName}
              onChange={handleInputChange(index, "firstName")}
              readOnly={isReadOnlyField("firstName")}
            />
          </div>
          <div>
            <label htmlFor={`${path}[${index}].middleName`}>Middle Name:</label>
            <input
              id={`${path}[${index}].middleName`}
              type="text"
              value={item.middleName}
              onChange={handleInputChange(index, "middleName")}
              readOnly={isReadOnlyField("middleName")}
            />
          </div>
          <div>
            <label htmlFor={`${path}[${index}].suffix`}>Suffix:</label>
            <input
              id={`${path}[${index}].suffix`}
              type="text"
              value={item.suffix}
              onChange={handleInputChange(index, "suffix")}
              readOnly={isReadOnlyField("suffix")}
            />
          </div>
          <div>
            <label htmlFor={`${path}[${index}].address.street`}>
              Address - Street:
            </label>
            <input
              id={`${path}[${index}].address.street`}
              type="text"
              value={item.address.street}
              onChange={handleInputChange(index, "address.street")}
              readOnly={isReadOnlyField("address.street")}
            />
            <label htmlFor={`${path}[${index}].address.city`}>
              Address - City:
            </label>
            <input
              id={`${path}[${index}].address.city`}
              type="text"
              value={item.address.city}
              onChange={handleInputChange(index, "address.city")}
              readOnly={isReadOnlyField("address.city")}
            />
            <label htmlFor={`${path}[${index}].address.state`}>
              Address - State:
            </label>
            <input
              id={`${path}[${index}].address.state`}
              type="text"
              value={item.address.state}
              onChange={handleInputChange(index, "address.state")}
              readOnly={isReadOnlyField("address.state")}
            />
            <label htmlFor={`${path}[${index}].address.zipCode`}>
              Address - Zip Code:
            </label>
            <input
              id={`${path}[${index}].address.zipCode`}
              type="text"
              value={item.address.zipCode}
              onChange={handleInputChange(index, "address.zipCode")}
              readOnly={isReadOnlyField("address.zipCode")}
            />
            <label htmlFor={`${path}[${index}].address.country`}>
              Address - Country:
            </label>
            <input
              id={`${path}[${index}].address.country`}
              type="text"
              value={item.address.country}
              onChange={handleInputChange(index, "address.country")}
              readOnly={isReadOnlyField("address.country")}
            />
          </div>
          <div>
            <label htmlFor={`${path}[${index}].ventureDescription`}>
              Venture Description:
            </label>
            <input
              id={`${path}[${index}].ventureDescription`}
              type="text"
              value={item.ventureDescription}
              onChange={handleInputChange(index, "ventureDescription")}
              readOnly={isReadOnlyField("ventureDescription")}
            />
          </div>
          <div>
            <label htmlFor={`${path}[${index}].dateFrom.date`}>
              Date From:
            </label>
            <input
              id={`${path}[${index}].dateFrom.date`}
              type="text"
              value={item.dateFrom.date}
              onChange={handleInputChange(index, "dateFrom.date")}
              readOnly={isReadOnlyField("dateFrom.date")}
            />
            <label htmlFor={`${path}[${index}].dateFrom.estimated`}>
              Estimated:
            </label>
            <input
              id={`${path}[${index}].dateFrom.estimated`}
              type="checkbox"
              checked={item.dateFrom.estimated}
              onChange={(e) =>
                handleCheckboxChange(index, "dateFrom.estimated")(e as any)
              }
              readOnly={isReadOnlyField("dateFrom.estimated")}
            />
          </div>
          <div>
            <label htmlFor={`${path}[${index}].dateTo.date`}>Date To:</label>
            <input
              id={`${path}[${index}].dateTo.date`}
              type="text"
              value={item.dateTo.date}
              onChange={handleInputChange(index, "dateTo.date")}
              readOnly={isReadOnlyField("dateTo.date")}
            />
            <label htmlFor={`${path}[${index}].dateTo.estimated`}>
              Estimated:
            </label>
            <input
              id={`${path}[${index}].dateTo.estimated`}
              type="checkbox"
              checked={item.dateTo.estimated}
              onChange={(e) =>
                handleCheckboxChange(index, "dateTo.estimated")(e as any)
              }
              readOnly={isReadOnlyField("dateTo.estimated")}
            />
          </div>
          <div>
            <label htmlFor={`${path}[${index}].natureOfAssociation`}>
              Nature of Association:
            </label>
            <input
              id={`${path}[${index}].natureOfAssociation`}
              type="text"
              value={item.natureOfAssociation}
              onChange={handleInputChange(index, "natureOfAssociation")}
              readOnly={isReadOnlyField("natureOfAssociation")}
            />
          </div>
          <div>
            <label htmlFor={`${path}[${index}].positionHeld`}>
              Position Held:
            </label>
            <input
              id={`${path}[${index}].positionHeld`}
              type="text"
              value={item.positionHeld}
              onChange={handleInputChange(index, "positionHeld")}
              readOnly={isReadOnlyField("positionHeld")}
            />
          </div>
          <div>
            <label htmlFor={`${path}[${index}].financialSupport.value`}>
              Financial Support:
            </label>
            <input
              id={`${path}[${index}].financialSupport.value`}
              type="number"
              value={item.financialSupport.value}
              onChange={handleInputChange(index, "financialSupport.value")}
              readOnly={isReadOnlyField("financialSupport.value")}
            />
            <label htmlFor={`${path}[${index}].financialSupport.estimated`}>
              Estimated:
            </label>
            <input
              id={`${path}[${index}].financialSupport.estimated`}
              type="checkbox"
              checked={item.financialSupport.estimated}
              onChange={(e) =>
                handleCheckboxChange(
                  index,
                  "financialSupport.estimated"
                )(e as any)
              }
              readOnly={isReadOnlyField("financialSupport.estimated")}
            />
          </div>
          <div>
            <label htmlFor={`${path}[${index}].compensationDescription`}>
              Compensation Description:
            </label>
            <input
              id={`${path}[${index}].compensationDescription`}
              type="text"
              value={item.compensationDescription}
              onChange={handleInputChange(index, "compensationDescription")}
              readOnly={isReadOnlyField("compensationDescription")}
            />
          </div>
          <div>
            <label htmlFor={`${path}[${index}].citizenships`}>
              Citizenships:
            </label>
            {item.citizenships.map((citizenship, citizenshipIndex) => (
              <input
                key={citizenshipIndex}
                id={`${path}[${index}].citizenships[${citizenshipIndex}].type`}
                type="text"
                value={citizenship.type}
                onChange={handleInputChange(
                  index,
                  `citizenships[${citizenshipIndex}].type`
                )}
                readOnly={isReadOnlyField(
                  `citizenships[${citizenshipIndex}].type`
                )}
              />
            ))}
          </div>
        </div>
      ))}
      <button
        onClick={(event) => {
          event.preventDefault();
          onAddEntry(
            `${path}.section20B4`,
            getDefaultNewItem(`${path}.section20B4`)
          );
        }}
      >
        Add Entry
      </button>
    </div>
  );
};

export { RenderSection20B4 };
