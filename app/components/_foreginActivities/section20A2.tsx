import { OwnershipType, Section20A2 } from "api_v2/interfaces/foreignActivities";
import React from "react";

interface Section20A2Props {
  data: Section20A2[];
  onInputChange: (path: string, value: any) => void;
  onRemoveEntry: (path: string, index: number) => void;
  onAddEntry: (path: string, newItem: Section20A2) => void;
  path: string;
  isReadOnlyField: (fieldName: string) => boolean;
  getDefaultNewItem: (itemType: string) => any;
}

const RenderSection20A2: React.FC<Section20A2Props> = ({
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

  // Ensure all entries have a valid specify array when component renders
  const initializeSpecify = (specify: OwnershipType[]) =>
    Array.isArray(specify) ? specify : [];

  const handleCheckboxChange =
    (fieldPath: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
      onInputChange(`${path}.${fieldPath}`, event.target.checked);
    };

  const handleRemoveEntry = (index: number) => {
    onRemoveEntry(`${path}.section20A2`, index);
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
    onInputChange(`${path}.section20A2[${index}].ownershipType`, updatedSpecify);
  };

  return (
    <div className="space-y-4">
      <h2>Section 20A.2</h2>
      {data.map((item, index) => {
        const specifyArray = initializeSpecify(item.ownershipType);

        return (
          <div key={index} className="space-y-2 border-b pb-4">
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
                      `${path}.section20A2[${index}].ownershipType`
                    )}
                  />
                  <label htmlFor={`specify_${index}_${type}`}>{type}</label>
                </div>
              ))}
            </div>

            <div>
              <label htmlFor={`financialInterestType_${index}`}>
                Financial Interest Type:
              </label>
              <input
                id={`financialInterestType_${index}`}
                type="text"
                value={item.financialInterestType}
                onChange={handleInputChange(
                  `section20A2[${index}].financialInterestType`
                )}
                readOnly={isReadOnlyField(`financialInterestType.${index}`)}
              />
            </div>

            <div>
              <label htmlFor={`controllerInfo_${index}`}>
                Controller Info:
              </label>
              <input
                id={`controllerInfo_${index}`}
                type="text"
                value={item.controllerInfo?.lastName || ""}
                onChange={handleInputChange(
                  `section20A2[${index}].controllerInfo.lastName`
                )}
                readOnly={isReadOnlyField(`controllerInfo.${index}.lastName`)}
              />
            </div>
            <div>
              <label htmlFor={`controllerInfo_firstName_${index}`}>
                First Name:
              </label>
              <input
                id={`controllerInfo_firstName_${index}`}
                type="text"
                value={item.controllerInfo?.firstName || ""}
                onChange={handleInputChange(
                  `section20A2[${index}].controllerInfo.firstName`
                )}
                readOnly={isReadOnlyField(`controllerInfo.${index}.firstName`)}
              />
            </div>
            <div>
              <label htmlFor={`controllerInfo_middleName_${index}`}>
                Middle Name:
              </label>
              <input
                id={`controllerInfo_middleName_${index}`}
                type="text"
                value={item.controllerInfo?.middleName || ""}
                onChange={handleInputChange(
                  `section20A2[${index}].controllerInfo.middleName`
                )}
                readOnly={isReadOnlyField(`controllerInfo.${index}.middleName`)}
              />
            </div>
            <div>
              <label htmlFor={`controllerInfo_suffix_${index}`}>Suffix:</label>
              <input
                id={`controllerInfo_suffix_${index}`}
                type="text"
                value={item.controllerInfo?.suffix || ""}
                onChange={handleInputChange(
                  `section20A2[${index}].controllerInfo.suffix`
                )}
                readOnly={isReadOnlyField(`controllerInfo.${index}.suffix`)}
              />
            </div>
            <div>
              <label htmlFor={`controllerInfo_relationship_${index}`}>
                Relationship:
              </label>
              <input
                id={`controllerInfo_relationship_${index}`}
                type="text"
                value={item.controllerInfo?.relationship || ""}
                onChange={handleInputChange(
                  `section20A2[${index}].controllerInfo.relationship`
                )}
                readOnly={isReadOnlyField(
                  `controllerInfo.${index}.relationship`
                )}
              />
            </div>

            <div>
              <label htmlFor={`dateAcquired_${index}`}>Date Acquired:</label>
              <input
                id={`dateAcquired_${index}`}
                type="text"
                value={item.dateAcquired?.date || ""}
                onChange={handleInputChange(
                  `section20A2[${index}].dateAcquired.date`
                )}
                readOnly={isReadOnlyField(`dateAcquired.${index}.date`)}
              />
            </div>

            <div>
              <label htmlFor={`costAtAcquisition_${index}`}>
                Cost At Acquisition:
              </label>
              <input
                id={`costAtAcquisition_${index}`}
                type="number"
                value={item.costAtAcquisition?.value || 0}
                onChange={handleInputChange(
                  `section20A2[${index}].costAtAcquisition.value`
                )}
                readOnly={isReadOnlyField(`costAtAcquisition.${index}.value`)}
              />
            </div>

            <div>
              <label htmlFor={`currentValue_${index}`}>Current Value:</label>
              <input
                id={`currentValue_${index}`}
                type="number"
                value={item.currentValue?.value || 0}
                onChange={handleInputChange(
                  `section20A2[${index}].currentValue.value`
                )}
                readOnly={isReadOnlyField(`currentValue.${index}.value`)}
              />
            </div>

            <div>
              <label htmlFor={`dateDisposed_${index}`}>Date Disposed:</label>
              <input
                id={`dateDisposed_${index}`}
                type="text"
                value={item.dateDisposed?.date || ""}
                onChange={handleInputChange(
                  `section20A2[${index}].dateDisposed.date`
                )}
                readOnly={isReadOnlyField(`dateDisposed.${index}.date`)}
              />
            </div>

            <div>
              <label htmlFor={`disposalExplanation_${index}`}>
                Disposal Explanation:
              </label>
              <input
                id={`disposalExplanation_${index}`}
                type="text"
                value={item.disposalExplanation || ""}
                onChange={handleInputChange(
                  `section20A2[${index}].disposalExplanation`
                )}
                readOnly={isReadOnlyField(`disposalExplanation.${index}`)}
              />
            </div>

            <div>
              <label htmlFor={`hasCoOwners_${index}`}>Has Co-Owners:</label>
              <input
                id={`hasCoOwners_${index}`}
                type="checkbox"
                checked={item.hasCoOwners}
                onChange={handleCheckboxChange(
                  `section20A2[${index}].hasCoOwners`
                )}
                readOnly={isReadOnlyField(`hasCoOwners.${index}`)}
              />
            </div>

            {item.hasCoOwners &&
              item.coOwners &&
              item.coOwners.map((coOwner, coIndex) => (
                <div key={coIndex} className="space-y-2 pl-4 border-l">
                  <div>
                    <label htmlFor={`coOwner_lastName_${index}_${coIndex}`}>
                      Co-Owner Last Name:
                    </label>
                    <input
                      id={`coOwner_lastName_${index}_${coIndex}`}
                      type="text"
                      value={coOwner.lastName}
                      onChange={handleInputChange(
                        `section20A2[${index}].coOwners[${coIndex}].lastName`
                      )}
                      readOnly={isReadOnlyField(
                        `coOwners.${index}.${coIndex}.lastName`
                      )}
                    />
                  </div>
                  <div>
                    <label htmlFor={`coOwner_firstName_${index}_${coIndex}`}>
                      Co-Owner First Name:
                    </label>
                    <input
                      id={`coOwner_firstName_${index}_${coIndex}`}
                      type="text"
                      value={coOwner.firstName}
                      onChange={handleInputChange(
                        `section20A2[${index}].coOwners[${coIndex}].firstName`
                      )}
                      readOnly={isReadOnlyField(
                        `coOwners.${index}.${coIndex}.firstName`
                      )}
                    />
                  </div>
                  <div>
                    <label htmlFor={`coOwner_middleName_${index}_${coIndex}`}>
                      Co-Owner Middle Name:
                    </label>
                    <input
                      id={`coOwner_middleName_${index}_${coIndex}`}
                      type="text"
                      value={coOwner.middleName}
                      onChange={handleInputChange(
                        `section20A2[${index}].coOwners[${coIndex}].middleName`
                      )}
                      readOnly={isReadOnlyField(
                        `coOwners.${index}.${coIndex}.middleName`
                      )}
                    />
                  </div>
                  <div>
                    <label htmlFor={`coOwner_suffix_${index}_${coIndex}`}>
                      Co-Owner Suffix:
                    </label>
                    <input
                      id={`coOwner_suffix_${index}_${coIndex}`}
                      type="text"
                      value={coOwner.suffix}
                      onChange={handleInputChange(
                        `section20A2[${index}].coOwners[${coIndex}].suffix`
                      )}
                      readOnly={isReadOnlyField(
                        `coOwners.${index}.${coIndex}.suffix`
                      )}
                    />
                  </div>
                  <div>
                    <label
                      htmlFor={`coOwner_address_${index}_${coIndex}_street`}
                    >
                      Co-Owner Street:
                    </label>
                    <input
                      id={`coOwner_address_${index}_${coIndex}_street`}
                      type="text"
                      value={coOwner.address.street}
                      onChange={handleInputChange(
                        `section20A2[${index}].coOwners[${coIndex}].address.street`
                      )}
                      readOnly={isReadOnlyField(
                        `coOwners.${index}.${coIndex}.address.street`
                      )}
                    />
                  </div>
                  <div>
                    <label htmlFor={`coOwner_address_${index}_${coIndex}_city`}>
                      Co-Owner City:
                    </label>
                    <input
                      id={`coOwner_address_${index}_${coIndex}_city`}
                      type="text"
                      value={coOwner.address.city}
                      onChange={handleInputChange(
                        `section20A2[${index}].coOwners[${coIndex}].address.city`
                      )}
                      readOnly={isReadOnlyField(
                        `coOwners.${index}.${coIndex}.address.city`
                      )}
                    />
                  </div>
                  <div>
                    <label
                      htmlFor={`coOwner_address_${index}_${coIndex}_state`}
                    >
                      Co-Owner State:
                    </label>
                    <input
                      id={`coOwner_address_${index}_${coIndex}_state`}
                      type="text"
                      value={coOwner.address.state}
                      onChange={handleInputChange(
                        `section20A2[${index}].coOwners[${coIndex}].address.state`
                      )}
                      readOnly={isReadOnlyField(
                        `coOwners.${index}.${coIndex}.address.state`
                      )}
                    />
                  </div>
                  <div>
                    <label
                      htmlFor={`coOwner_address_${index}_${coIndex}_zipCode`}
                    >
                      Co-Owner Zip Code:
                    </label>
                    <input
                      id={`coOwner_address_${index}_${coIndex}_zipCode`}
                      type="text"
                      value={coOwner.address.zipCode}
                      onChange={handleInputChange(
                        `section20A2[${index}].coOwners[${coIndex}].address.zipCode`
                      )}
                      readOnly={isReadOnlyField(
                        `coOwners.${index}.${coIndex}.address.zipCode`
                      )}
                    />
                  </div>
                  <div>
                    <label
                      htmlFor={`coOwner_address_${index}_${coIndex}_country`}
                    >
                      Co-Owner Country:
                    </label>
                    <input
                      id={`coOwner_address_${index}_${coIndex}_country`}
                      type="text"
                      value={coOwner.address.country}
                      onChange={handleInputChange(
                        `section20A2[${index}].coOwners[${coIndex}].address.country`
                      )}
                      readOnly={isReadOnlyField(
                        `coOwners.${index}.${coIndex}.address.country`
                      )}
                    />
                  </div>
                  {coOwner.citizenships.map((citizenship, cIndex) => (
                    <div key={cIndex}>
                      <label
                        htmlFor={`coOwner_citizenship_${index}_${coIndex}_${cIndex}`}
                      >
                        Citizenship Type:
                      </label>
                      <input
                        id={`coOwner_citizenship_${index}_${coIndex}_${cIndex}`}
                        type="text"
                        value={citizenship.type}
                        onChange={handleInputChange(
                          `section20A2[${index}].coOwners[${coIndex}].citizenships[${cIndex}].type`
                        )}
                        readOnly={isReadOnlyField(
                          `coOwners.${index}.${coIndex}.citizenships.${cIndex}.type`
                        )}
                      />
                    </div>
                  ))}
                </div>
              ))}

            <div>
              <label htmlFor={`includeInReport_${index}`}>
                Include in Report:
              </label>
              <input
                id={`includeInReport_${index}`}
                type="checkbox"
                checked={item.includeInReport || false}
                onChange={handleCheckboxChange(
                  `section20A2[${index}].includeInReport`
                )}
                readOnly={isReadOnlyField(`includeInReport.${index}`)}
              />
            </div>

            <button
              onClick={() => handleRemoveEntry(index)}
              disabled={isReadOnlyField(`remove_${index}`)}
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
            `${path}.section20A2`,
            getDefaultNewItem(`${path}.section20A2`)
          );
        }}
      >
        Add Entry
      </button>
    </div>
  );
};

export { RenderSection20A2 };
