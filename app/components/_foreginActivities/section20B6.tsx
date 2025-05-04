import { type Section20B6 } from "api/interfaces/sections/foreignActivities";
import React from "react";

interface Section20B6Props {
  data: Section20B6[];
  onInputChange: (path: string, value: any) => void;
  onRemoveEntry: (path: string, index: number) => void;
  onAddEntry: (path: string, newItem: Section20B6) => void;
  path: string;
  isReadOnlyField: (fieldName: string) => boolean;
  getDefaultNewItem: (itemType: string) => any;
}

const RenderSection20B6: React.FC<Section20B6Props> = ({
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
      onInputChange(
        `${path}.section20B6[${index}].${fieldPath}`,
        event.target.value
      );
    };

  const handleCheckboxChange =
    (index: number, fieldPath: string) =>
    (event: React.ChangeEvent<HTMLInputElement>) => {
      onInputChange(
        `${path}.section20B6[${index}].${fieldPath}`,
        event.target.checked
      );
    };

  const handleAddSubsequentContact = (index: number) => {
    const newContact = {
      _id: Math.random(),
      purpose: "",
      dateOfMostRecentContact: { date: "", estimated: false },
      plansForFutureContact: "",
    };
    const newPath = `${path}.section20B6[${index}].subsequentContact`;
    const updatedContacts = [...data[index].subsequentContact, newContact];
    onInputChange(newPath, updatedContacts);
  };

  const handleRemoveSubsequentContact = (
    index: number,
    contactIndex: number
  ) => {
    const newPath = `${path}.section20B6[${index}].subsequentContact`;
    const updatedContacts = data[index].subsequentContact.filter(
      (_, i) => i !== contactIndex
    );
    onInputChange(newPath, updatedContacts);
  };

  return (
    <div className="space-y-4">
      {data.map((item, index) => (
        <div key={index} className="border p-4 space-y-2">
          <button
            type="button"
            onClick={() => onRemoveEntry(`${path}.section20B6`, index)}
          >
            Remove Entry
          </button>
          <div>
            <label htmlFor={`${path}.section20B6[${index}].id_`}>ID:</label>
            <input
              id={`${path}.section20B6[${index}].id_`}
              type="number"
              value={item.id_}
              onChange={handleInputChange(index, "id_")}
              readOnly={isReadOnlyField("id_")}
            />
          </div>
          <div>
            <label
              htmlFor={`${path}.section20B6[${index}].individual.lastName`}
            >
              Last Name:
            </label>
            <input
              id={`${path}.section20B6[${index}].individual.lastName`}
              type="text"
              value={item.individual.lastName}
              onChange={handleInputChange(index, "individual.lastName")}
              readOnly={isReadOnlyField("individual.lastName")}
            />
          </div>
          <div>
            <label
              htmlFor={`${path}.section20B6[${index}].individual.firstName`}
            >
              First Name:
            </label>
            <input
              id={`${path}.section20B6[${index}].individual.firstName`}
              type="text"
              value={item.individual.firstName}
              onChange={handleInputChange(index, "individual.firstName")}
              readOnly={isReadOnlyField("individual.firstName")}
            />
          </div>
          <div>
            <label
              htmlFor={`${path}.section20B6[${index}].individual.middleName`}
            >
              Middle Name:
            </label>
            <input
              id={`${path}.section20B6[${index}].individual.middleName`}
              type="text"
              value={item.individual.middleName || ""}
              onChange={handleInputChange(index, "individual.middleName")}
              readOnly={isReadOnlyField("individual.middleName")}
            />
          </div>
          <div>
            <label htmlFor={`${path}.section20B6[${index}].individual.suffix`}>
              Suffix:
            </label>
            <input
              id={`${path}.section20B6[${index}].individual.suffix`}
              type="text"
              value={item.individual.suffix || ""}
              onChange={handleInputChange(index, "individual.suffix")}
              readOnly={isReadOnlyField("individual.suffix")}
            />
          </div>
          <div>
            <label
              htmlFor={`${path}.section20B6[${index}].individual.relationship`}
            >
              Relationship:
            </label>
            <input
              id={`${path}.section20B6[${index}].individual.relationship`}
              type="text"
              value={item.individual.relationship}
              onChange={handleInputChange(index, "individual.relationship")}
              readOnly={isReadOnlyField("individual.relationship")}
            />
          </div>
          <div>
            <label
              htmlFor={`${path}.section20B6[${index}].contactLocation.street`}
            >
              Contact Location - Street:
            </label>
            <input
              id={`${path}.section20B6[${index}].contactLocation.street`}
              type="text"
              value={item.contactLocation.street}
              onChange={handleInputChange(index, "contactLocation.street")}
              readOnly={isReadOnlyField("contactLocation.street")}
            />
            <label
              htmlFor={`${path}.section20B6[${index}].contactLocation.city`}
            >
              Contact Location - City:
            </label>
            <input
              id={`${path}.section20B6[${index}].contactLocation.city`}
              type="text"
              value={item.contactLocation.city}
              onChange={handleInputChange(index, "contactLocation.city")}
              readOnly={isReadOnlyField("contactLocation.city")}
            />
            <label
              htmlFor={`${path}.section20B6[${index}].contactLocation.state`}
            >
              Contact Location - State:
            </label>
            <input
              id={`${path}.section20B6[${index}].contactLocation.state`}
              type="text"
              value={item.contactLocation.state}
              onChange={handleInputChange(index, "contactLocation.state")}
              readOnly={isReadOnlyField("contactLocation.state")}
            />
            <label
              htmlFor={`${path}.section20B6[${index}].contactLocation.zipCode`}
            >
              Contact Location - Zip Code:
            </label>
            <input
              id={`${path}.section20B6[${index}].contactLocation.zipCode`}
              type="text"
              value={item.contactLocation.zipCode}
              onChange={handleInputChange(index, "contactLocation.zipCode")}
              readOnly={isReadOnlyField("contactLocation.zipCode")}
            />
            <label
              htmlFor={`${path}.section20B6[${index}].contactLocation.country`}
            >
              Contact Location - Country:
            </label>
            <input
              id={`${path}.section20B6[${index}].contactLocation.country`}
              type="text"
              value={item.contactLocation.country}
              onChange={handleInputChange(index, "contactLocation.country")}
              readOnly={isReadOnlyField("contactLocation.country")}
            />
          </div>
          <div>
            <label htmlFor={`${path}.section20B6[${index}].contactDate.date`}>
              Contact Date:
            </label>
            <input
              id={`${path}.section20B6[${index}].contactDate.date`}
              type="text"
              value={item.contactDate.date}
              onChange={handleInputChange(index, "contactDate.date")}
              readOnly={isReadOnlyField("contactDate.date")}
            />
            <label
              htmlFor={`${path}.section20B6[${index}].contactDate.estimated`}
            >
              Estimated:
            </label>
            <input
              id={`${path}.section20B6[${index}].contactDate.estimated`}
              type="checkbox"
              checked={item.contactDate.estimated}
              onChange={(e) =>
                handleCheckboxChange(index, "contactDate.estimated")(e as any)
              }
              readOnly={isReadOnlyField("contactDate.estimated")}
            />
          </div>
          <div>
            <label htmlFor={`${path}.section20B6[${index}].establishmentType`}>
              Establishment Type:
            </label>
            <input
              id={`${path}.section20B6[${index}].establishmentType`}
              type="text"
              value={item.establishmentType}
              onChange={handleInputChange(index, "establishmentType")}
              readOnly={isReadOnlyField("establishmentType")}
            />
          </div>
          <div>
            <label
              htmlFor={`${path}.section20B6[${index}].foreignRepresentatives`}
            >
              Foreign Representatives:
            </label>
            <input
              id={`${path}.section20B6[${index}].foreignRepresentatives`}
              type="text"
              value={item.foreignRepresentatives}
              onChange={handleInputChange(index, "foreignRepresentatives")}
              readOnly={isReadOnlyField("foreignRepresentatives")}
            />
          </div>
          <div>
            <label
              htmlFor={`${path}.section20B6[${index}].purposeCircumstances`}
            >
              Purpose/Circumstances:
            </label>
            <input
              id={`${path}.section20B6[${index}].purposeCircumstances`}
              type="text"
              value={item.purposeCircumstances}
              onChange={handleInputChange(index, "purposeCircumstances")}
              readOnly={isReadOnlyField("purposeCircumstances")}
            />
          </div>
          {item.subsequentContact && (
            <>
              {item.subsequentContact.map((contact, contactIndex) => (
                <div key={contact._id}>
                  <div>
                    <label
                      htmlFor={`${path}.section20B6[${index}].subsequentContact[${contactIndex}].purpose`}
                    >
                      Subsequent Contact Purpose:
                    </label>
                    <input
                      id={`${path}.section20B6[${index}].subsequentContact[${contactIndex}].purpose`}
                      type="text"
                      value={contact.purpose}
                      onChange={handleInputChange(
                        index,
                        `subsequentContact[${contactIndex}].purpose`
                      )}
                      readOnly={isReadOnlyField(
                        `subsequentContact[${contactIndex}].purpose`
                      )}
                    />
                  </div>
                  <div>
                    <label
                      htmlFor={`${path}.section20B6[${index}].subsequentContact[${contactIndex}].dateOfMostRecentContact.date`}
                    >
                      Date of Most Recent Contact:
                    </label>
                    <input
                      id={`${path}.section20B6[${index}].subsequentContact[${contactIndex}].dateOfMostRecentContact.date`}
                      type="text"
                      value={contact.dateOfMostRecentContact.date}
                      onChange={handleInputChange(
                        index,
                        `subsequentContact[${contactIndex}].dateOfMostRecentContact.date`
                      )}
                      readOnly={isReadOnlyField(
                        `subsequentContact[${contactIndex}].dateOfMostRecentContact.date`
                      )}
                    />
                    <label
                      htmlFor={`${path}.section20B6[${index}].subsequentContact[${contactIndex}].dateOfMostRecentContact.estimated`}
                    >
                      Estimated:
                    </label>
                    <input
                      id={`${path}.section20B6[${index}].subsequentContact[${contactIndex}].dateOfMostRecentContact.estimated`}
                      type="checkbox"
                      checked={contact.dateOfMostRecentContact.estimated}
                      onChange={(e) =>
                        handleCheckboxChange(
                          index,
                          `subsequentContact[${contactIndex}].dateOfMostRecentContact.estimated`
                        )(e as any)
                      }
                      readOnly={isReadOnlyField(
                        `subsequentContact[${contactIndex}].dateOfMostRecentContact.estimated`
                      )}
                    />
                  </div>
                  <div>
                    <label
                      htmlFor={`${path}.section20B6[${index}].subsequentContact[${contactIndex}].plansForFutureContact`}
                    >
                      Plans for Future Contact:
                    </label>
                    <input
                      id={`${path}.section20B6[${index}].subsequentContact[${contactIndex}].plansForFutureContact`}
                      type="text"
                      value={contact.plansForFutureContact}
                      onChange={handleInputChange(
                        index,
                        `subsequentContact[${contactIndex}].plansForFutureContact`
                      )}
                      readOnly={isReadOnlyField(
                        `subsequentContact[${contactIndex}].plansForFutureContact`
                      )}
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      handleRemoveSubsequentContact(index, contactIndex)
                    }
                  >
                    Remove Contact
                  </button>
                </div>
              ))}

              {item.subsequentContact.length < 4 && (
                <button
                  type="button"
                  onClick={() => handleAddSubsequentContact(index)}
                >
                  Add Subsequent Contact
                </button>
              )}
            </>
          )}
        </div>
      ))}
      <button
        onClick={(event) => {
          event.preventDefault();
          onAddEntry(
            `${path}.section20B6`,
            getDefaultNewItem(`${path}.section20B6`)
          );
        }}
      >
        Add Entry
      </button>
    </div>
  );
};

export { RenderSection20B6 };
