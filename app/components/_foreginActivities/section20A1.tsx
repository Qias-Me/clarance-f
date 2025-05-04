import {
  OwnershipType,
  Section20A1,
  SpecifyType,
} from "api_v2/interfaces/foreignActivities";
import React from "react";

interface Section20A1Props {
  data: Section20A1[];
  onInputChange: (path: string, value: any) => void;
  onRemoveEntry: (path: string, index: number) => void;
  onAddEntry: (path: string, newItem: Section20A1) => void;
  path: string;
  isReadOnlyField: (fieldName: string) => boolean;
  getDefaultNewItem: (itemType: string) => any;
}

const RenderSection20A1: React.FC<Section20A1Props> = ({
  data,
  onInputChange,
  onRemoveEntry,
  onAddEntry,
  getDefaultNewItem,
  path,
  isReadOnlyField,
}) => {
  // Ensure all entries have a valid specify array when component renders
  const initializeSpecify = (specify: OwnershipType[]) =>
    Array.isArray(specify) ? specify : [];

  const handleInputChange =
    (fieldPath: string) =>
    (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      onInputChange(`${path}.${fieldPath}`, event.target.value);
    };

  const handleCheckboxChange =
    (fieldPath: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
      onInputChange(`${path}.${fieldPath}`, event.target.checked);
    };

  // Handle checkbox changes
  const handleTypeCheckboxChange = (
    index: number,
    type: OwnershipType["type"]
  ) => {
    const entry = data[index];
    const specifyArray = initializeSpecify(entry.ownershipType);

    // Check if the type is already selected
    const isSelected = specifyArray.some((spec) => spec.type === type);

    // Update specify array based on whether type was already selected
    const updatedSpecify = isSelected
      ? specifyArray.filter((spec) => spec.type !== type)
      : [...specifyArray, { _id: new Date().getTime(), type }];

    // Update the entry specify field in your data state
    onInputChange(
      `${path}.section20A1[${index}].ownershipType`,
      updatedSpecify
    );
  };

  return (
    <div className="space-y-4">
      <h2>Section 20A.1</h2>
      {data.map((item, index) => {
        const specifyArray = initializeSpecify(item.ownershipType);

        return (
          <div key={index}>
            <div>
              <label>ID: </label>
              <p>{item.id_}</p>
            </div>
            <label>Specify Type</label>
            <div>
              {[
                "Yourself",
                "Spouse or legally recognized civil union/domestic partner",
                "Cohabitant",
                "Dependent children",
              ].map((type) => (
                <div key={type}>
                  <input
                    type="checkbox"
                    id={`specify_${index}_${type}`}
                    name={`specify_${index}_${type}`}
                    value={type}
                    checked={specifyArray.some((spec) => spec.type === type)}
                    onChange={() =>
                      handleTypeCheckboxChange(
                        index,
                        type as OwnershipType["type"]
                      )
                    }
                    disabled={isReadOnlyField(
                      `${path}.section20A1[${index}].ownershipType`
                    )}
                  />
                  <label htmlFor={`specify_${index}_${type}`}>{type}</label>
                </div>
              ))}
            </div>

            <div>
              <label>Financial Interest Type: </label>
              <input
                type="text"
                value={item.financialInterestType}
                onChange={handleInputChange(
                  `section20A1[${index}].financialInterestType`
                )}
                readOnly={isReadOnlyField(
                  `section20A1[${index}].financialInterestType`
                )}
              />
            </div>
            <div>
              <label>Date Acquired: </label>
              <input
                type="date"
                value={item.dateAcquired.date}
                onChange={handleInputChange(
                  `section20A1[${index}].dateAcquired.date`
                )}
                readOnly={isReadOnlyField(
                  `section20A1[${index}].dateAcquired.date`
                )}
              />
            </div>
            <div>
              <label>How Acquired: </label>
              <input
                type="text"
                value={item.howAcquired}
                onChange={handleInputChange(
                  `section20A1[${index}].howAcquired`
                )}
                readOnly={isReadOnlyField(`section20A1[${index}].howAcquired`)}
              />
            </div>
            <div>
              <label>Cost at Acquisition: </label>
              <input
                type="number"
                value={item.costAtAcquisition.value}
                onChange={handleInputChange(
                  `section20A1[${index}].costAtAcquisition.value`
                )}
                readOnly={isReadOnlyField(
                  `section20A1[${index}].costAtAcquisition.value`
                )}
              />
            </div>
            <div>
              <label>Current Value: </label>
              <input
                type="number"
                value={item.currentValue.value}
                onChange={handleInputChange(
                  `section20A1[${index}].currentValue.value`
                )}
                readOnly={isReadOnlyField(
                  `section20A1[${index}].currentValue.value`
                )}
              />
            </div>
            <div>
              <label>Date Control Relinquished: </label>
              <input
                type="date"
                value={item.dateControlRelinquished.date}
                onChange={handleInputChange(
                  `section20A1[${index}].dateControlRelinquished.date`
                )}
                readOnly={isReadOnlyField(
                  `section20A1[${index}].dateControlRelinquished.date`
                )}
              />
            </div>
            <div>
              <label>Disposal Explanation: </label>
              <input
                type="text"
                value={item.disposalExplanation}
                onChange={handleInputChange(
                  `section20A1[${index}].disposalExplanation`
                )}
                readOnly={isReadOnlyField(
                  `section20A1[${index}].disposalExplanation`
                )}
              />
            </div>
            <div>
              <label>Has Co-Owners: </label>
              <input
                type="checkbox"
                checked={item.hasCoOwners}
                onChange={handleCheckboxChange(
                  `section20A1[${index}].hasCoOwners`
                )}
                readOnly={isReadOnlyField(`section20A1[${index}].hasCoOwners`)}
              />
            </div>
            {item.hasCoOwners &&
              item.coOwners &&
              item.coOwners.map((coOwner, coIdx) => (
                <div key={coIdx} className="ml-4">
                  <h4>Co-Owner {coIdx + 1}</h4>
                  <div>
                    <label>Last Name: </label>
                    <input
                      type="text"
                      value={coOwner.lastName}
                      onChange={handleInputChange(
                        `section20A1[${index}].coOwners[${coIdx}].lastName`
                      )}
                      readOnly={isReadOnlyField(
                        `section20A1[${index}].coOwners[${coIdx}].lastName`
                      )}
                    />
                  </div>
                  <div>
                    <label>First Name: </label>
                    <input
                      type="text"
                      value={coOwner.firstName}
                      onChange={handleInputChange(
                        `section20A1[${index}].coOwners[${coIdx}].firstName`
                      )}
                      readOnly={isReadOnlyField(
                        `section20A1[${index}].coOwners[${coIdx}].firstName`
                      )}
                    />
                  </div>
                  <div>
                    <label>Middle Name: </label>
                    <input
                      type="text"
                      value={coOwner.middleName}
                      onChange={handleInputChange(
                        `section20A1[${index}].coOwners[${coIdx}].middleName`
                      )}
                      readOnly={isReadOnlyField(
                        `section20A1[${index}].coOwners[${coIdx}].middleName`
                      )}
                    />
                  </div>
                  <div>
                    <label>Suffix: </label>
                    <input
                      type="text"
                      value={coOwner.suffix}
                      onChange={handleInputChange(
                        `section20A1[${index}].coOwners[${coIdx}].suffix`
                      )}
                      readOnly={isReadOnlyField(
                        `section20A1[${index}].coOwners[${coIdx}].suffix`
                      )}
                    />
                  </div>
                  <div>
                    <label>Address: </label>
                    <input
                      type="text"
                      value={coOwner.address.street}
                      onChange={handleInputChange(
                        `section20A1[${index}].coOwners[${coIdx}].address.street`
                      )}
                      readOnly={isReadOnlyField(
                        `section20A1[${index}].coOwners[${coIdx}].address.street`
                      )}
                    />
                    <input
                      type="text"
                      value={coOwner.address.city}
                      onChange={handleInputChange(
                        `section20A1[${index}].coOwners[${coIdx}].address.city`
                      )}
                      readOnly={isReadOnlyField(
                        `section20A1[${index}].coOwners[${coIdx}].address.city`
                      )}
                    />
                    <input
                      type="text"
                      value={coOwner.address.state}
                      onChange={handleInputChange(
                        `section20A1[${index}].coOwners[${coIdx}].address.state`
                      )}
                      readOnly={isReadOnlyField(
                        `section20A1[${index}].coOwners[${coIdx}].address.state`
                      )}
                    />
                    <input
                      type="text"
                      value={coOwner.address.zipCode}
                      onChange={handleInputChange(
                        `section20A1[${index}].coOwners[${coIdx}].address.zipCode`
                      )}
                      readOnly={isReadOnlyField(
                        `section20A1[${index}].coOwners[${coIdx}].address.zipCode`
                      )}
                    />
                    <input
                      type="text"
                      value={coOwner.address.country}
                      onChange={handleInputChange(
                        `section20A1[${index}].coOwners[${coIdx}].address.country`
                      )}
                      readOnly={isReadOnlyField(
                        `section20A1[${index}].coOwners[${coIdx}].address.country`
                      )}
                    />
                  </div>
                  <div>
                    <label>Citizenships: </label>
                    {coOwner.citizenships.map((citizenship, cIdx) => (
                      <span key={cIdx}>{citizenship.type}</span>
                    ))}
                  </div>
                  <div>
                    <label>Relationship: </label>
                    <input
                      type="text"
                      value={coOwner.relationship}
                      onChange={handleInputChange(
                        `section20A1[${index}].coOwners[${coIdx}].relationship`
                      )}
                      readOnly={isReadOnlyField(
                        `section20A1[${index}].coOwners[${coIdx}].relationship`
                      )}
                    />
                  </div>
                </div>
              ))}
            <button
              onClick={(event) => {
                event.preventDefault();
                onRemoveEntry(`${path}.section20A1`, index);
              }}
              disabled={isReadOnlyField(`section20A1[${index}].remove`)}
            >
              Remove Entry
            </button>
          </div>
        );
      })}
      <button
        onClick={(event) => {
          event.preventDefault();
          onAddEntry(
            `${path}.section20A1`,
            getDefaultNewItem(`${path}.section20A1`)
          );
        }}
      >
        Add Entry
      </button>
    </div>
  );
};

export { RenderSection20A1 };
