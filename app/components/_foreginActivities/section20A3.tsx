import {
  OwnershipType,
  Section20A3,
} from "api_v2/interfaces/foreignActivities";
import React from "react";

interface Section20A3Props {
  data: Section20A3[];
  onInputChange: (path: string, value: any) => void;
  onRemoveEntry: (path: string, index: number) => void;
  onAddEntry: (path: string, newItem: Section20A3) => void;
  path: string;
  isReadOnlyField: (fieldName: string) => boolean;
  getDefaultNewItem: (itemType: string) => any;
}

const RenderSection20A3: React.FC<Section20A3Props> = ({
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
      console.log(path, fieldPath, event.target.value, "inComponent");
      onInputChange(`${path}.${fieldPath}`, event.target.value);
    };

  const handleRemoveEntry = (index: number) => {
    onRemoveEntry(`${path}.section20A3`, index);
  };

  // Ensure all entries have a valid specify array when component renders
  const initializeSpecify = (specify: OwnershipType[]) =>
    Array.isArray(specify) ? specify : [];

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
      `${path}.section20A3[${index}].ownershipType`,
      updatedSpecify
    );
  };

  return (
    <div className="space-y-4">
      {data.map((entry, index) => {
        const specifyArray = initializeSpecify(entry.ownershipType);

        return (
          <div key={entry.id_}>
            <div>
              <label htmlFor={`${path}.section20A3[${index}].id_`}>ID:</label>
              <input
                id={`${path}.section20A3[${index}].id_`}
                type="number"
                value={entry.id_}
                onChange={handleInputChange(`section20A3[${index}].id_`)}
                readOnly={isReadOnlyField(`section20A3[${index}].id_`)}
              />
            </div>

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
                      `${path}.section20A3[${index}].ownershipType`
                    )}
                  />
                  <label htmlFor={`specify_${index}_${type}`}>{type}</label>
                </div>
              ))}
            </div>
            <div>
              <label htmlFor={`${path}.section20A3[${index}].realEstateType`}>
                Real Estate Type:
              </label>
              <input
                id={`${path}.section20A3[${index}].realEstateType`}
                type="text"
                value={entry.realEstateType}
                onChange={handleInputChange(
                  `section20A3[${index}].realEstateType`
                )}
                readOnly={isReadOnlyField(
                  `section20A3[${index}].realEstateType`
                )}
              />
            </div>
            <div>
              <label htmlFor={`${path}.section20A3[${index}].howAcquired`}>
                How Acquired:
              </label>
              <input
                id={`${path}.section20A3[${index}].howAcquired`}
                type="text"
                value={entry.howAcquired}
                onChange={handleInputChange(
                  `section20A3[${index}].howAcquired`
                )}
                readOnly={isReadOnlyField(`section20A3[${index}].howAcquired`)}
              />
            </div>
            <div>
              <label
                htmlFor={`${path}.section20A3[${index}].dateOfPurchase.date`}
              >
                Date of Purchase:
              </label>
              <input
                id={`${path}.section20A3[${index}].dateOfPurchase.date`}
                type="text"
                value={entry.dateOfPurchase.date}
                onChange={handleInputChange(
                  `section20A3[${index}].dateOfPurchase.date`
                )}
                readOnly={isReadOnlyField(
                  `section20A3[${index}].dateOfPurchase.date`
                )}
              />
              <label
                htmlFor={`${path}.section20A3[${index}].dateOfPurchase.estimated`}
              >
                Estimated:
              </label>
              <input
                id={`${path}.section20A3[${index}].dateOfPurchase.estimated`}
                type="checkbox"
                checked={entry.dateOfPurchase.estimated}
                onChange={(e) =>
                  handleInputChange(
                    `section20A3[${index}].dateOfPurchase.estimated`
                  )(e as any)
                }
                readOnly={isReadOnlyField(
                  `section20A3[${index}].dateOfPurchase.estimated`
                )}
              />
            </div>
            <div>
              <label htmlFor={`${path}.section20A3[${index}].dateSold.date`}>
                Date Sold:
              </label>
              <input
                id={`${path}.section20A3[${index}].dateSold.date`}
                type="text"
                value={entry.dateSold.date}
                onChange={handleInputChange(
                  `section20A3[${index}].dateSold.date`
                )}
                readOnly={isReadOnlyField(
                  `section20A3[${index}].dateSold.date`
                )}
              />
              <label
                htmlFor={`${path}.section20A3[${index}].dateSold.estimated`}
              >
                Estimated:
              </label>
              <input
                id={`${path}.section20A3[${index}].dateSold.estimated`}
                type="checkbox"
                checked={entry.dateSold.estimated}
                onChange={(e) =>
                  handleInputChange(`section20A3[${index}].dateSold.estimated`)(
                    e as any
                  )
                }
                readOnly={isReadOnlyField(
                  `section20A3[${index}].dateSold.estimated`
                )}
              />
            </div>
            <div>
              <label
                htmlFor={`${path}.section20A3[${index}].costAtAcquisition.value`}
              >
                Cost at Acquisition:
              </label>
              <input
                id={`${path}.section20A3[${index}].costAtAcquisition.value`}
                type="number"
                value={entry.costAtAcquisition.value}
                onChange={handleInputChange(
                  `section20A3[${index}].costAtAcquisition.value`
                )}
                readOnly={isReadOnlyField(
                  `section20A3[${index}].costAtAcquisition.value`
                )}
              />
              <label
                htmlFor={`${path}.section20A3[${index}].costAtAcquisition.estimated`}
              >
                Estimated:
              </label>
              <input
                id={`${path}.section20A3[${index}].costAtAcquisition.estimated`}
                type="checkbox"
                checked={entry.costAtAcquisition.estimated}
                onChange={(e) =>
                  handleInputChange(
                    `section20A3[${index}].costAtAcquisition.estimated`
                  )(e as any)
                }
                readOnly={isReadOnlyField(
                  `section20A3[${index}].costAtAcquisition.estimated`
                )}
              />
            </div>
            <div>
              <label htmlFor={`${path}.section20A3[${index}].location.street`}>
                Location - Street:
              </label>
              <input
                id={`${path}.section20A3[${index}].location.street`}
                type="text"
                value={entry.location.street}
                onChange={handleInputChange(
                  `section20A3[${index}].location.street`
                )}
                readOnly={isReadOnlyField(
                  `section20A3[${index}].location.street`
                )}
              />
              <label htmlFor={`${path}.section20A3[${index}].location.city`}>
                Location - City:
              </label>
              <input
                id={`${path}.section20A3[${index}].location.city`}
                type="text"
                value={entry.location.city}
                onChange={handleInputChange(
                  `section20A3[${index}].location.city`
                )}
                readOnly={isReadOnlyField(
                  `section20A3[${index}].location.city`
                )}
              />
              <label htmlFor={`${path}.section20A3[${index}].location.state`}>
                Location - State:
              </label>
              <input
                id={`${path}.section20A3[${index}].location.state`}
                type="text"
                value={entry.location.state}
                onChange={handleInputChange(
                  `section20A3[${index}].location.state`
                )}
                readOnly={isReadOnlyField(
                  `section20A3[${index}].location.state`
                )}
              />
              <label htmlFor={`${path}.section20A3[${index}].location.zipCode`}>
                Location - Zip Code:
              </label>
              <input
                id={`${path}.section20A3[${index}].location.zipCode`}
                type="text"
                value={entry.location.zipCode}
                onChange={handleInputChange(
                  `section20A3[${index}].location.zipCode`
                )}
                readOnly={isReadOnlyField(
                  `section20A3[${index}].location.zipCode`
                )}
              />
              <label htmlFor={`${path}.section20A3[${index}].location.country`}>
                Location - Country:
              </label>
              <input
                id={`${path}.section20A3[${index}].location.country`}
                type="text"
                value={entry.location.country}
                onChange={handleInputChange(
                  `section20A3[${index}].location.country`
                )}
                readOnly={isReadOnlyField(
                  `section20A3[${index}].location.country`
                )}
              />
            </div>
            <div>
              <label htmlFor={`${path}.section20A3[${index}].hasCoOwners`}>
                Has Co-Owners:
              </label>
              <input
                id={`${path}.section20A3[${index}].hasCoOwners`}
                type="checkbox"
                checked={entry.hasCoOwners}
                onChange={(e) =>
                  handleInputChange(`section20A3[${index}].hasCoOwners`)(
                    e as any
                  )
                }
                readOnly={isReadOnlyField(`section20A3[${index}].hasCoOwners`)}
              />
            </div>
            {entry.hasCoOwners &&
              entry.coOwners &&
              entry.coOwners.map((coOwner, coIndex) => (
                <div key={coOwner._id}>
                  <div>
                    <label
                      htmlFor={`${path}.section20A3[${index}].coOwners[${coIndex}].firstName`}
                    >
                      Co-Owner First Name:
                    </label>
                    <input
                      id={`${path}.section20A3[${index}].coOwners[${coIndex}].firstName`}
                      type="text"
                      value={coOwner.firstName}
                      onChange={handleInputChange(
                        `section20A3[${index}].coOwners[${coIndex}].firstName`
                      )}
                      readOnly={isReadOnlyField(
                        `section20A3[${index}].coOwners[${coIndex}].firstName`
                      )}
                    />
                  </div>
                  <div>
                    <label
                      htmlFor={`${path}.section20A3[${index}].coOwners[${coIndex}].lastName`}
                    >
                      Co-Owner Last Name:
                    </label>
                    <input
                      id={`${path}.section20A3[${index}].coOwners[${coIndex}].lastName`}
                      type="text"
                      value={coOwner.lastName}
                      onChange={handleInputChange(
                        `section20A3[${index}].coOwners[${coIndex}].lastName`
                      )}
                      readOnly={isReadOnlyField(
                        `section20A3[${index}].coOwners[${coIndex}].lastName`
                      )}
                    />
                  </div>
                  <div>
                    <label
                      htmlFor={`${path}.section20A3[${index}].coOwners[${coIndex}].address.street`}
                    >
                      Co-Owner Address - Street:
                    </label>
                    <input
                      id={`${path}.section20A3[${index}].coOwners[${coIndex}].address.street`}
                      type="text"
                      value={coOwner.address.street}
                      onChange={handleInputChange(
                        `section20A3[${index}].coOwners[${coIndex}].address.street`
                      )}
                      readOnly={isReadOnlyField(
                        `section20A3[${index}].coOwners[${coIndex}].address.street`
                      )}
                    />
                    <label
                      htmlFor={`${path}.section20A3[${index}].coOwners[${coIndex}].address.city`}
                    >
                      Co-Owner Address - City:
                    </label>
                    <input
                      id={`${path}.section20A3[${index}].coOwners[${coIndex}].address.city`}
                      type="text"
                      value={coOwner.address.city}
                      onChange={handleInputChange(
                        `section20A3[${index}].coOwners[${coIndex}].address.city`
                      )}
                      readOnly={isReadOnlyField(
                        `section20A3[${index}].coOwners[${coIndex}].address.city`
                      )}
                    />
                    <label
                      htmlFor={`${path}.section20A3[${index}].coOwners[${coIndex}].address.state`}
                    >
                      Co-Owner Address - State:
                    </label>
                    <input
                      id={`${path}.section20A3[${index}].coOwners[${coIndex}].address.state`}
                      type="text"
                      value={coOwner.address.state}
                      onChange={handleInputChange(
                        `section20A3[${index}].coOwners[${coIndex}].address.state`
                      )}
                      readOnly={isReadOnlyField(
                        `section20A3[${index}].coOwners[${coIndex}].address.state`
                      )}
                    />
                    <label
                      htmlFor={`${path}.section20A3[${index}].coOwners[${coIndex}].address.zipCode`}
                    >
                      Co-Owner Address - Zip Code:
                    </label>
                    <input
                      id={`${path}.section20A3[${index}].coOwners[${coIndex}].address.zipCode`}
                      type="text"
                      value={coOwner.address.zipCode}
                      onChange={handleInputChange(
                        `section20A3[${index}].coOwners[${coIndex}].address.zipCode`
                      )}
                      readOnly={isReadOnlyField(
                        `section20A3[${index}].coOwners[${coIndex}].address.zipCode`
                      )}
                    />
                    <label
                      htmlFor={`${path}.section20A3[${index}].coOwners[${coIndex}].address.country`}
                    >
                      Co-Owner Address - Country:
                    </label>
                    <input
                      id={`${path}.section20A3[${index}].coOwners[${coIndex}].address.country`}
                      type="text"
                      value={coOwner.address.country}
                      onChange={handleInputChange(
                        `section20A3[${index}].coOwners[${coIndex}].address.country`
                      )}
                      readOnly={isReadOnlyField(
                        `section20A3[${index}].coOwners[${coIndex}].address.country`
                      )}
                    />
                  </div>
                  <div>
                    <label
                      htmlFor={`${path}.section20A3[${index}].coOwners[${coIndex}].relationship`}
                    >
                      Relationship:
                    </label>
                    <input
                      id={`${path}.section20A3[${index}].coOwners[${coIndex}].relationship`}
                      type="text"
                      value={coOwner.relationship}
                      onChange={handleInputChange(
                        `section20A3[${index}].coOwners[${coIndex}].relationship`
                      )}
                      readOnly={isReadOnlyField(
                        `section20A3[${index}].coOwners[${coIndex}].relationship`
                      )}
                    />
                  </div>

                  {coOwner.citizenships.map((citizenship, citizenIndex) => (
                    <div key={citizenship._id}>
                      <label
                        htmlFor={`${path}.section20A3[${index}].coOwners[${coIndex}].citizenships[${citizenIndex}].type`}
                      >
                        Citizenships:
                      </label>
                      <input
                        id={`${path}.section20A3[${index}].coOwners[${coIndex}].citizenships[${citizenIndex}].type`}
                        type="text"
                        value={citizenship.type}
                        onChange={handleInputChange(
                          `section20A3[${index}].coOwners[${coIndex}].citizenships[${citizenIndex}].type`
                        )}
                        readOnly={isReadOnlyField(
                          `section20A3[${index}].coOwners[${coIndex}].citizenships[${citizenIndex}].type`
                        )}
                      />
                    </div>
                  ))}
                </div>
              ))}
            <button type="button" onClick={() => handleRemoveEntry(index)}>
              Remove Entry
            </button>
          </div>
        );
      })}

      <button
        onClick={(event) => {
          event.preventDefault();
          onAddEntry(
            `${path}.section20A3`,
            getDefaultNewItem(`${path}.section20A3`)
          );
        }}
      >
        Add Entry
      </button>
    </div>
  );
};

export { RenderSection20A3 };
