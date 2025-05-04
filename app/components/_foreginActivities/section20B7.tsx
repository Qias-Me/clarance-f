import { type Section20B7 } from "api/interfaces/sections/foreignActivities";
import React from "react";

interface Section20B7Props {
  data: Section20B7[];
  onInputChange: (path: string, value: any) => void;
  onRemoveEntry: (path: string, index: number) => void;
  onAddEntry: (path: string, newItem: Section20B7) => void;
  path: string;
  isReadOnlyField: (fieldName: string) => boolean;
  getDefaultNewItem: (itemType: string) => Section20B7;
}

const RenderSection20B7: React.FC<Section20B7Props> = ({
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
        `${path}.section20B7[${index}].${fieldPath}`,
        event.target.value
      );
    };

  const handleCheckboxChange =
    (index: number, fieldPath: string) =>
    (event: React.ChangeEvent<HTMLInputElement>) => {
      onInputChange(
        `${path}.section20B7[${index}].${fieldPath}`,
        event.target.checked
      );
    };

  return (
    <div className="space-y-4">
      {data.map((item, index) => (
        <div key={index} className="border p-4 space-y-2">
          <button
            type="button"
            onClick={() => onRemoveEntry(`${path}.section20B7`, index)}
          >
            Remove Entry
          </button>
          <div>
            <label htmlFor={`${path}.section20B7[${index}].id_`}>ID:</label>
            <input
              id={`${path}.section20B7[${index}].id_`}
              type="number"
              value={item.id_}
              onChange={handleInputChange(index, "id_")}
              readOnly={isReadOnlyField("id_")}
            />
          </div>
          <div>
            <label htmlFor={`${path}.section20B7[${index}].lastName`}>
              Last Name:
            </label>
            <input
              id={`${path}.section20B7[${index}].lastName`}
              type="text"
              value={item.lastName}
              onChange={handleInputChange(index, "lastName")}
              readOnly={isReadOnlyField("lastName")}
            />
          </div>
          <div>
            <label htmlFor={`${path}.section20B7[${index}].firstName`}>
              First Name:
            </label>
            <input
              id={`${path}.section20B7[${index}].firstName`}
              type="text"
              value={item.firstName}
              onChange={handleInputChange(index, "firstName")}
              readOnly={isReadOnlyField("firstName")}
            />
          </div>
          <div>
            <label htmlFor={`${path}.section20B7[${index}].middleName`}>
              Middle Name:
            </label>
            <input
              id={`${path}.section20B7[${index}].middleName`}
              type="text"
              value={item.middleName}
              onChange={handleInputChange(index, "middleName")}
              readOnly={isReadOnlyField("middleName")}
            />
          </div>
          <div>
            <label htmlFor={`${path}.section20B7[${index}].suffix`}>
              Suffix:
            </label>
            <input
              id={`${path}.section20B7[${index}].suffix`}
              type="text"
              value={item.suffix}
              onChange={handleInputChange(index, "suffix")}
              readOnly={isReadOnlyField("suffix")}
            />
          </div>
          <div>
            <label htmlFor={`${path}.section20B7[${index}].dateOfBirth.date`}>
              Date of Birth:
            </label>
            <input
              id={`${path}.section20B7[${index}].dateOfBirth.date`}
              type="text"
              value={item.dateOfBirth.date}
              onChange={handleInputChange(index, "dateOfBirth.date")}
              readOnly={isReadOnlyField("dateOfBirth.date")}
            />
            <label
              htmlFor={`${path}.section20B7[${index}].dateOfBirth.estimated`}
            >
              Estimated:
            </label>
            <input
              id={`${path}.section20B7[${index}].dateOfBirth.estimated`}
              type="checkbox"
              checked={item.dateOfBirth.estimated}
              onChange={(e) =>
                handleCheckboxChange(index, "dateOfBirth.estimated")(e as any)
              }
              readOnly={isReadOnlyField("dateOfBirth.estimated")}
            />
          </div>
          <div>
            <label htmlFor={`${path}.section20B7[${index}].placeOfBirth.city`}>
              Place of Birth - City:
            </label>
            <input
              id={`${path}.section20B7[${index}].placeOfBirth.city`}
              type="text"
              value={item.placeOfBirth.city}
              onChange={handleInputChange(index, "placeOfBirth.city")}
              readOnly={isReadOnlyField("placeOfBirth.city")}
            />
            <label htmlFor={`${path}.section20B7[${index}].placeOfBirth.state`}>
              Place of Birth - State:
            </label>
            <input
              id={`${path}.section20B7[${index}].placeOfBirth.state`}
              type="text"
              value={item.placeOfBirth.state}
              onChange={handleInputChange(index, "placeOfBirth.state")}
              readOnly={isReadOnlyField("placeOfBirth.state")}
            />
            <label htmlFor={`${path}.section20B7[${index}].placeOfBirth.zipCode`}>
              Place of Birth - Zip Code:
            </label>
            <input
              id={`${path}.section20B7[${index}].placeOfBirth.zipCode`}
              type="text"
              value={item.placeOfBirth.zipCode}
              onChange={handleInputChange(index, "placeOfBirth.zipCode")}
              readOnly={isReadOnlyField("placeOfBirth.zipCode")}
            />
            <label htmlFor={`${path}.section20B7[${index}].placeOfBirth.country`}>
              Place of Birth - Country:
            </label>
            <input
              id={`${path}.section20B7[${index}].placeOfBirth.country`}
              type="text"
              value={item.placeOfBirth.country}
              onChange={handleInputChange(index, "placeOfBirth.country")}
              readOnly={isReadOnlyField("placeOfBirth.country")}
            />
          </div>
          <div>
            <label htmlFor={`${path}.section20B7[${index}].currentAddress.street`}>
              Current Address - Street:
            </label>
            <input
              id={`${path}.section20B7[${index}].currentAddress.street`}
              type="text"
              value={item.currentAddress.street}
              onChange={handleInputChange(index, "currentAddress.street")}
              readOnly={isReadOnlyField("currentAddress.street")}
            />
            <label htmlFor={`${path}.section20B7[${index}].currentAddress.city`}>
              Current Address - City:
            </label>
            <input
              id={`${path}.section20B7[${index}].currentAddress.city`}
              type="text"
              value={item.currentAddress.city}
              onChange={handleInputChange(index, "currentAddress.city")}
              readOnly={isReadOnlyField("currentAddress.city")}
            />
            <label htmlFor={`${path}.section20B7[${index}].currentAddress.state`}>
              Current Address - State:
            </label>
            <input
              id={`${path}.section20B7[${index}].currentAddress.state`}
              type="text"
              value={item.currentAddress.state}
              onChange={handleInputChange(index, "currentAddress.state")}
              readOnly={isReadOnlyField("currentAddress.state")}
            />
            <label htmlFor={`${path}.section20B7[${index}].currentAddress.zipCode`}>
              Current Address - Zip Code:
            </label>
            <input
              id={`${path}.section20B7[${index}].currentAddress.zipCode`}
              type="text"
              value={item.currentAddress.zipCode}
              onChange={handleInputChange(index, "currentAddress.zipCode")}
              readOnly={isReadOnlyField("currentAddress.zipCode")}
            />
            <label htmlFor={`${path}.section20B7[${index}].currentAddress.country`}>
              Current Address - Country:
            </label>
            <input
              id={`${path}.section20B7[${index}].currentAddress.country`}
              type="text"
              value={item.currentAddress.country}
              onChange={handleInputChange(index, "currentAddress.country")}
              readOnly={isReadOnlyField("currentAddress.country")}
            />
          </div>
          <div>
            <label>Citizenships:</label>
            {item.citizenships.map((citizenship, i) => (
              <div key={i}>
                <input
                  id={`${path}.section20B7[${index}].citizenships[${i}].type`}
                  type="text"
                  value={citizenship.type}
                  onChange={handleInputChange(index, `citizenships[${i}].type`)}
                  readOnly={isReadOnlyField(`citizenships[${i}].type`)}
                />
              </div>
            ))}
          </div>
          <div>
            <label htmlFor={`${path}.section20B7[${index}].sponsoringOrganization.notApplicable`}>
              Not Applicable:
            </label>
            <input
              id={`${path}.section20B7[${index}].sponsoringOrganization.notApplicable`}
              type="checkbox"
              checked={item.sponsoringOrganization.notApplicable}
              onChange={(e) =>
                handleCheckboxChange(index, "sponsoringOrganization.notApplicable")(e as any)
              }
              readOnly={isReadOnlyField("sponsoringOrganization.notApplicable")}
            />
          </div>
          {!item.sponsoringOrganization.notApplicable && (
            <>
              <div>
                <label htmlFor={`${path}.section20B7[${index}].sponsoringOrganization.name`}>
                  Sponsoring Organization:
                </label>
                <input
                  id={`${path}.section20B7[${index}].sponsoringOrganization.name`}
                  type="text"
                  value={item.sponsoringOrganization.name}
                  onChange={handleInputChange(index, "sponsoringOrganization.name")}
                  readOnly={isReadOnlyField("sponsoringOrganization.name")}
                />
              </div>
              <div>
                <label htmlFor={`${path}.section20B7[${index}].sponsoringOrganization.address.street`}>
                  Organization Address - Street:
                </label>
                <input
                  id={`${path}.section20B7[${index}].sponsoringOrganization.address.street`}
                  type="text"
                  value={item.sponsoringOrganization.address.street}
                  onChange={handleInputChange(index, "sponsoringOrganization.address.street")}
                  readOnly={isReadOnlyField("sponsoringOrganization.address.street")}
                />
                <label htmlFor={`${path}.section20B7[${index}].sponsoringOrganization.address.city`}>
                  Organization Address - City:
                </label>
                <input
                  id={`${path}.section20B7[${index}].sponsoringOrganization.address.city`}
                  type="text"
                  value={item.sponsoringOrganization.address.city}
                  onChange={handleInputChange(index, "sponsoringOrganization.address.city")}
                  readOnly={isReadOnlyField("sponsoringOrganization.address.city")}
                />
                <label htmlFor={`${path}.section20B7[${index}].sponsoringOrganization.address.state`}>
                  Organization Address - State:
                </label>
                <input
                  id={`${path}.section20B7[${index}].sponsoringOrganization.address.state`}
                  type="text"
                  value={item.sponsoringOrganization.address.state}
                  onChange={handleInputChange(index, "sponsoringOrganization.address.state")}
                  readOnly={isReadOnlyField("sponsoringOrganization.address.state")}
                />
                <label htmlFor={`${path}.section20B7[${index}].sponsoringOrganization.address.zipCode`}>
                  Organization Address - Zip Code:
                </label>
                <input
                  id={`${path}.section20B7[${index}].sponsoringOrganization.address.zipCode`}
                  type="text"
                  value={item.sponsoringOrganization.address.zipCode}
                  onChange={handleInputChange(index, "sponsoringOrganization.address.zipCode")}
                  readOnly={isReadOnlyField("sponsoringOrganization.address.zipCode")}
                />
                <label htmlFor={`${path}.section20B7[${index}].sponsoringOrganization.address.country`}>
                  Organization Address - Country:
                </label>
                <input
                  id={`${path}.section20B7[${index}].sponsoringOrganization.address.country`}
                  type="text"
                  value={item.sponsoringOrganization.address.country}
                  onChange={handleInputChange(index, "sponsoringOrganization.address.country")}
                  readOnly={isReadOnlyField("sponsoringOrganization.address.country")}
                />
              </div>
            </>
          )}
          <div>
            <label htmlFor={`${path}.section20B7[${index}].datesOfStay.fromDate.date`}>
              Dates of Stay From:
            </label>
            <input
              id={`${path}.section20B7[${index}].datesOfStay.fromDate.date`}
              type="text"
              value={item.datesOfStay.fromDate.date}
              onChange={handleInputChange(index, "datesOfStay.fromDate.date")}
              readOnly={isReadOnlyField("datesOfStay.fromDate.date")}
            />
            <label htmlFor={`${path}.section20B7[${index}].datesOfStay.fromDate.estimated`}>
              Estimated:
            </label>
            <input
              id={`${path}.section20B7[${index}].datesOfStay.fromDate.estimated`}
              type="checkbox"
              checked={item.datesOfStay.fromDate.estimated}
              onChange={(e) =>
                handleCheckboxChange(index, "datesOfStay.fromDate.estimated")(e as any)
              }
              readOnly={isReadOnlyField("datesOfStay.fromDate.estimated")}
            />
          </div>
          <div>
            <label htmlFor={`${path}.section20B7[${index}].datesOfStay.toDate.date`}>
              Dates of Stay To:
            </label>
            <input
              id={`${path}.section20B7[${index}].datesOfStay.toDate.date`}
              type="text"
              value={item.datesOfStay.toDate.date}
              onChange={handleInputChange(index, "datesOfStay.toDate.date")}
              readOnly={isReadOnlyField("datesOfStay.toDate.date")}
            />
            <label htmlFor={`${path}.section20B7[${index}].datesOfStay.toDate.estimated`}>
              Estimated:
            </label>
            <input
              id={`${path}.section20B7[${index}].datesOfStay.toDate.estimated`}
              type="checkbox"
              checked={item.datesOfStay.toDate.estimated}
              onChange={(e) =>
                handleCheckboxChange(index, "datesOfStay.toDate.estimated")(e as any)
              }
              readOnly={isReadOnlyField("datesOfStay.toDate.estimated")}
            />
          </div>
          <div>
            <label htmlFor={`${path}.section20B7[${index}].datesOfStay.present`}>
              Present:
            </label>
            <input
              id={`${path}.section20B7[${index}].datesOfStay.present`}
              type="checkbox"
              checked={item.datesOfStay.present}
              onChange={(e) => handleCheckboxChange(index, "datesOfStay.present")(e as any)}
              readOnly={isReadOnlyField("datesOfStay.present")}
            />
          </div>
          <div>
            <label htmlFor={`${path}.section20B7[${index}].addressDuringStay.street`}>
              Address During Stay - Street:
            </label>
            <input
              id={`${path}.section20B7[${index}].addressDuringStay.street`}
              type="text"
              value={item.addressDuringStay.street}
              onChange={handleInputChange(index, "addressDuringStay.street")}
              readOnly={isReadOnlyField("addressDuringStay.street")}
            />
            <label htmlFor={`${path}.section20B7[${index}].addressDuringStay.city`}>
              Address During Stay - City:
            </label>
            <input
              id={`${path}.section20B7[${index}].addressDuringStay.city`}
              type="text"
              value={item.addressDuringStay.city}
              onChange={handleInputChange(index, "addressDuringStay.city")}
              readOnly={isReadOnlyField("addressDuringStay.city")}
            />
            <label htmlFor={`${path}.section20B7[${index}].addressDuringStay.state`}>
              Address During Stay - State:
            </label>
            <input
              id={`${path}.section20B7[${index}].addressDuringStay.state`}
              type="text"
              value={item.addressDuringStay.state}
              onChange={handleInputChange(index, "addressDuringStay.state")}
              readOnly={isReadOnlyField("addressDuringStay.state")}
            />
            <label htmlFor={`${path}.section20B7[${index}].addressDuringStay.zipCode`}>
              Address During Stay - Zip Code:
            </label>
            <input
              id={`${path}.section20B7[${index}].addressDuringStay.zipCode`}
              type="text"
              value={item.addressDuringStay.zipCode}
              onChange={handleInputChange(index, "addressDuringStay.zipCode")}
              readOnly={isReadOnlyField("addressDuringStay.zipCode")}
            />
            <label htmlFor={`${path}.section20B7[${index}].addressDuringStay.country`}>
              Address During Stay - Country:
            </label>
            <input
              id={`${path}.section20B7[${index}].addressDuringStay.country`}
              type="text"
              value={item.addressDuringStay.country}
              onChange={handleInputChange(index, "addressDuringStay.country")}
              readOnly={isReadOnlyField("addressDuringStay.country")}
            />
          </div>
          <div>
            <label htmlFor={`${path}.section20B7[${index}].purposeOfStay`}>
              Purpose of Stay:
            </label>
            <input
              id={`${path}.section20B7[${index}].purposeOfStay`}
              type="text"
              value={item.purposeOfStay}
              onChange={handleInputChange(index, "purposeOfStay")}
              readOnly={isReadOnlyField("purposeOfStay")}
            />
          </div>
          <div>
            <label htmlFor={`${path}.section20B7[${index}].purposeOfSponsorship`}>
              Purpose of Sponsorship:
            </label>
            <input
              id={`${path}.section20B7[${index}].purposeOfSponsorship`}
              type="text"
              value={item.purposeOfSponsorship}
              onChange={handleInputChange(index, "purposeOfSponsorship")}
              readOnly={isReadOnlyField("purposeOfSponsorship")}
            />
          </div>
        </div>
      ))}
      <button
        onClick={(event) => {
          event.preventDefault();
          onAddEntry(
            `${path}.section20B7`,
            getDefaultNewItem(`${path}.section20B7`)
          );
        }}
      >
        Add Entry
      </button>
    </div>
  );
};

export { RenderSection20B7 };
