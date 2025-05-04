import { Section20B5 } from "api_v2/interfaces/foreignActivities";
import React from "react";

interface Section20B5Props {
  data: Section20B5[];
  onInputChange: (path: string, value: any) => void;
  onRemoveEntry: (path: string, index: number) => void;
  onAddEntry: (path: string, newItem: Section20B5) => void;
  path: string;
  isReadOnlyField: (fieldName: string) => boolean;
  getDefaultNewItem: (itemType: string) => any;
}

const RenderSection20B5: React.FC<Section20B5Props> = ({
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
        `${path}.section20B5[${index}].${fieldPath}`,
        event.target.value
      );
    };

  const handleCheckboxChange =
    (index: number, fieldPath: string) =>
    (event: React.ChangeEvent<HTMLInputElement>) => {
      onInputChange(
        `${path}.section20B5[${index}].${fieldPath}`,
        event.target.checked
      );
    };

  const handleRadioChange =
    (index: number, fieldPath: string) =>
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const value = event.target.value === "yes";
      onInputChange(`${path}.section20B5[${index}].${fieldPath}`, value);
    };

  const handleAddSubsequentContact = (index: number) => {
    const newContact = {
      _id: Math.random(),
      contactExplanation: "",
    };
    const newPath = `${path}.section20B5[${index}].subsequentContacts`;
    const updatedContacts = [...data[index].subsequentContacts, newContact];
    onInputChange(newPath, updatedContacts);
  };

  const handleRemoveSubsequentContact = (index: number, contactIndex: number) => {
    const newPath = `${path}.section20B5[${index}].subsequentContacts`;
    const updatedContacts = data[index].subsequentContacts.filter(
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
            onClick={() => onRemoveEntry(`${path}.section20B5`, index)}
          >
            Remove Entry
          </button>
          <div>
            <label htmlFor={`${path}.section20B5[${index}].id_`}>ID:</label>
            <input
              id={`${path}.section20B5[${index}].id_`}
              type="number"
              value={item.id_}
              onChange={handleInputChange(index, "id_")}
              readOnly={isReadOnlyField("id_")}
            />
          </div>
          <div>
            <label htmlFor={`${path}.section20B5[${index}].eventDescription`}>
              Event Description:
            </label>
            <input
              id={`${path}.section20B5[${index}].eventDescription`}
              type="text"
              value={item.eventDescription}
              onChange={handleInputChange(index, "eventDescription")}
              readOnly={isReadOnlyField("eventDescription")}
            />
          </div>
          <div>
            <label
              htmlFor={`${path}.section20B5[${index}].eventDates.fromDate.date`}
            >
              Event Date From:
            </label>
            <input
              id={`${path}.section20B5[${index}].eventDates.fromDate.date`}
              type="text"
              value={item.eventDates.fromDate.date}
              onChange={handleInputChange(index, "eventDates.fromDate.date")}
              readOnly={isReadOnlyField("eventDates.fromDate.date")}
            />
            <label
              htmlFor={`${path}.section20B5[${index}].eventDates.fromDate.estimated`}
            >
              Estimated:
            </label>
            <input
              id={`${path}.section20B5[${index}].eventDates.fromDate.estimated`}
              type="checkbox"
              checked={item.eventDates.fromDate.estimated}
              onChange={(e) =>
                handleCheckboxChange(
                  index,
                  "eventDates.fromDate.estimated"
                )(e as any)
              }
              readOnly={isReadOnlyField("eventDates.fromDate.estimated")}
            />
          </div>
          <div>
            <label
              htmlFor={`${path}.section20B5[${index}].eventDates.toDate.date`}
            >
              Event Date To:
            </label>
            <input
              id={`${path}.section20B5[${index}].eventDates.toDate.date`}
              type="text"
              value={item.eventDates.toDate.date}
              onChange={handleInputChange(index, "eventDates.toDate.date")}
              readOnly={isReadOnlyField("eventDates.toDate.date")}
            />
            <label
              htmlFor={`${path}.section20B5[${index}].eventDates.toDate.estimated`}
            >
              Estimated:
            </label>
            <input
              id={`${path}.section20B5[${index}].eventDates.toDate.estimated`}
              type="checkbox"
              checked={item.eventDates.toDate.estimated}
              onChange={(e) =>
                handleCheckboxChange(
                  index,
                  "eventDates.toDate.estimated"
                )(e as any)
              }
              readOnly={isReadOnlyField("eventDates.toDate.estimated")}
            />
          </div>
          <div>
            <label htmlFor={`${path}.section20B5[${index}].eventDates.present`}>
              Present:
            </label>
            <input
              id={`${path}.section20B5[${index}].eventDates.present`}
              type="checkbox"
              checked={item.eventDates.present}
              onChange={(e) =>
                handleCheckboxChange(index, "eventDates.present")(e as any)
              }
              readOnly={isReadOnlyField("eventDates.present")}
            />
          </div>
          <div>
            <label htmlFor={`${path}.section20B5[${index}].purpose`}>
              Purpose:
            </label>
            <input
              id={`${path}.section20B5[${index}].purpose`}
              type="text"
              value={item.purpose}
              onChange={handleInputChange(index, "purpose")}
              readOnly={isReadOnlyField("purpose")}
            />
          </div>
          <div>
            <label
              htmlFor={`${path}.section20B5[${index}].sponsoringOrganization`}
            >
              Sponsoring Organization:
            </label>
            <input
              id={`${path}.section20B5[${index}].sponsoringOrganization`}
              type="text"
              value={item.sponsoringOrganization}
              onChange={handleInputChange(index, "sponsoringOrganization")}
              readOnly={isReadOnlyField("sponsoringOrganization")}
            />
          </div>
          <div>
            <label
              htmlFor={`${path}.section20B5[${index}].eventLocation.street`}
            >
              Event Location - Street:
            </label>
            <input
              id={`${path}.section20B5[${index}].eventLocation.street`}
              type="text"
              value={item.eventLocation.street}
              onChange={handleInputChange(index, "eventLocation.street")}
              readOnly={isReadOnlyField("eventLocation.street")}
            />
            <label htmlFor={`${path}.section20B5[${index}].eventLocation.city`}>
              Event Location - City:
            </label>
            <input
              id={`${path}.section20B5[${index}].eventLocation.city`}
              type="text"
              value={item.eventLocation.city}
              onChange={handleInputChange(index, "eventLocation.city")}
              readOnly={isReadOnlyField("eventLocation.city")}
            />
            <label
              htmlFor={`${path}.section20B5[${index}].eventLocation.state`}
            >
              Event Location - State:
            </label>
            <input
              id={`${path}.section20B5[${index}].eventLocation.state`}
              type="text"
              value={item.eventLocation.state}
              onChange={handleInputChange(index, "eventLocation.state")}
              readOnly={isReadOnlyField("eventLocation.state")}
            />
            <label
              htmlFor={`${path}.section20B5[${index}].eventLocation.zipCode`}
            >
              Event Location - Zip Code:
            </label>
            <input
              id={`${path}.section20B5[${index}].eventLocation.zipCode`}
              type="text"
              value={item.eventLocation.zipCode}
              onChange={handleInputChange(index, "eventLocation.zipCode")}
              readOnly={isReadOnlyField("eventLocation.zipCode")}
            />
            <label
              htmlFor={`${path}.section20B5[${index}].eventLocation.country`}
            >
              Event Location - Country:
            </label>
            <input
              id={`${path}.section20B5[${index}].eventLocation.country`}
              type="text"
              value={item.eventLocation.country}
              onChange={handleInputChange(index, "eventLocation.country")}
              readOnly={isReadOnlyField("eventLocation.country")}
            />
          </div>
          <div>
            <label>Subsequent contact?</label>
            <input
              type="radio"
              name={`${path}.section20B5[${index}].hasContacts`}
              value="yes"
              checked={item.hasContacts === true}
              onChange={handleRadioChange(index, "hasContacts")}
              readOnly={isReadOnlyField("hasContacts")}
            />
            Yes
            <input
              type="radio"
              name={`${path}.section20B5[${index}].hasContacts`}
              value="no"
              checked={item.hasContacts === false}
              onChange={handleRadioChange(index, "hasContacts")}
              readOnly={isReadOnlyField("hasContacts")}
            />
            No
          </div>
          {item.hasContacts &&
            item.subsequentContacts &&
            item.subsequentContacts.map((contact, contactIndex) => (
              <div key={contact._id}>
                <label
                  htmlFor={`${path}.section20B5[${index}].subsequentContacts[${contactIndex}].contactExplanation`}
                >
                  Subsequent Contact Explanation:
                </label>
                <input
                  id={`${path}.section20B5[${index}].subsequentContacts[${contactIndex}].contactExplanation`}
                  type="text"
                  value={contact.contactExplanation}
                  onChange={handleInputChange(
                    index,
                    `subsequentContacts[${contactIndex}].contactExplanation`
                  )}
                  readOnly={isReadOnlyField(
                    `subsequentContacts[${contactIndex}].contactExplanation`
                  )}
                />
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
          {item.hasContacts && item.subsequentContacts.length < 4 && (
            <button
              type="button"
              onClick={() => handleAddSubsequentContact(index)}
            >
              Add Subsequent Contact
            </button>
          )}
        </div>
      ))}
      <button
        onClick={(event) => {
          event.preventDefault();
          onAddEntry(
            `${path}.section20B5`,
            getDefaultNewItem(`${path}.section20B5`)
          );
        }}
      >
        Add Entry
      </button>
    </div>
  );
};

export { RenderSection20B5 };