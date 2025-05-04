import React from "react";
import {type FormInfo} from "api/interfaces/FormInfo";

import {
  type ForeignContacts,
  type ContactEntry,
  type NameAlias,
  type Citizenship
} from "api/interfaces/sections/foreignContacts";

type FormProps = {
  data: ForeignContacts;
  getDefaultNewItem: (itemType: string) => any;
  onInputChange: (path: string, value: any) => void;
  onAddEntry: (path: string, newItem: any) => void;
  isValidValue: (path: string, value: any) => boolean;
  isReadOnlyField: (fieldName: string) => boolean;
  path: string;
  formInfo: FormInfo;
};

const RenderForeignContacts: React.FC<FormProps> = ({
  data,
  isReadOnlyField,
  onInputChange,
  path,
}) => {
  const handleRadioChange =
    (value: boolean, field: string) =>
    (event: React.ChangeEvent<HTMLInputElement>) => {
      if (event.target.checked) {
        onInputChange(`${path}.${field}`, value);
      }
    };

  const handleInputChange =
    (field: string) =>
    (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const { value } = event.target;
      onInputChange(`${path}.${field}`, value);
    };

  const handleCheckboxChange =
    (field: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
      onInputChange(`${path}.${field}`, event.target.checked);
    };

  const renderContactEntry = (entry: ContactEntry, index: number) => {
    const entryPath = `${path}.entries[${index}]`;

    return (
      <div key={entry._id} className="space-y-2 border-b pb-4 mb-4">
        <h4 className="font-semibold">Entry #{index + 1}</h4>

        <div>
          <label htmlFor={`lastName-${entry._id}`}>Last Name</label>
          <input
            id={`lastName-${entry._id}`}
            type="text"
            value={entry.lastName}
            onChange={handleInputChange(`${entryPath}.lastName`)}
            disabled={isReadOnlyField(`${entryPath}.lastName`)}
            className="mt-1 block w-full"
          />
        </div>
        <div>
          <label htmlFor={`firstName-${entry._id}`}>First Name</label>
          <input
            id={`firstName-${entry._id}`}
            type="text"
            value={entry.firstName}
            onChange={handleInputChange(`${entryPath}.firstName`)}
            disabled={isReadOnlyField(`${entryPath}.firstName`)}
            className="mt-1 block w-full"
          />
        </div>
        <div>
          <label htmlFor={`middleName-${entry._id}`}>Middle Name</label>
          <input
            id={`middleName-${entry._id}`}
            type="text"
            value={entry.middleName || ""}
            onChange={handleInputChange(`${entryPath}.middleName`)}
            disabled={isReadOnlyField(`${entryPath}.middleName`)}
            className="mt-1 block w-full"
          />
        </div>
        <div>
          <label htmlFor={`suffix-${entry._id}`}>Suffix</label>
          <input
            id={`suffix-${entry._id}`}
            type="text"
            value={entry.suffix || ""}
            onChange={handleInputChange(`${entryPath}.suffix`)}
            disabled={isReadOnlyField(`${entryPath}.suffix`)}
            className="mt-1 block w-full"
          />
        </div>
        <div>
          <label htmlFor={`approximateFirstContactDate-${entry._id}`}>
            Approximate Date of First Contact
          </label>
          <input
            id={`approximateFirstContactDate-${entry._id}`}
            type="text"
            value={entry.approximateFirstContactDate || ""}
            onChange={handleInputChange(
              `${entryPath}.approximateFirstContactDate`
            )}
            disabled={isReadOnlyField(
              `${entryPath}.approximateFirstContactDate`
            )}
            className="mt-1 block w-full"
          />
        </div>
        <div>
          <label htmlFor={`approximateLastContactDate-${entry._id}`}>
            Approximate Date of Last Contact
          </label>
          <input
            id={`approximateLastContactDate-${entry._id}`}
            type="text"
            value={entry.approximateLastContactDate || ""}
            onChange={handleInputChange(
              `${entryPath}.approximateLastContactDate`
            )}
            disabled={isReadOnlyField(
              `${entryPath}.approximateLastContactDate`
            )}
            className="mt-1 block w-full"
          />
        </div>
        <div>
          <label>Contact Methods</label>
          {[
            "InPerson",
            "Telephone",
            "Electronic",
            "WrittenCorrespondence",
            "Other",
          ].map((method) => (
            <label key={method} className="inline-flex items-center">
              <input
                type="checkbox"
                checked={entry.contactMethods.includes(method as any)}
                onChange={handleCheckboxChange(
                  `${entryPath}.contactMethods.${method}`
                )}
                disabled={isReadOnlyField(
                  `${entryPath}.contactMethods.${method}`
                )}
                className="mr-2"
              />
              {method}
            </label>
          ))}
        </div>
        <div>
          <label>Contact Frequency</label>
          {["Daily", "Weekly", "Monthly", "Quarterly", "Annually", "Other"].map(
            (frequency) => (
              <label key={frequency} className="inline-flex items-center">
                <input
                  type="checkbox"
                  checked={entry.contactFrequency.includes(frequency as any)}
                  onChange={handleCheckboxChange(
                    `${entryPath}.contactFrequency.${frequency}`
                  )}
                  disabled={isReadOnlyField(
                    `${entryPath}.contactFrequency.${frequency}`
                  )}
                  className="mr-2"
                />
                {frequency}
              </label>
            )
          )}
        </div>
        <div>
          <label>Nature of Relationship</label>
          {["ProfessionalOrBusiness", "Personal", "Obligation", "Other"].map(
            (nature) => (
              <label key={nature} className="inline-flex items-center">
                <input
                  type="checkbox"
                  checked={entry.relationshipNature.includes(nature as any)}
                  onChange={handleCheckboxChange(
                    `${entryPath}.relationshipNature.${nature}`
                  )}
                  disabled={isReadOnlyField(
                    `${entryPath}.relationshipNature.${nature}`
                  )}
                  className="mr-2"
                />
                {nature}
              </label>
            )
          )}
        </div>
        <div>
          <label>Other Names or Nicknames</label>
          {entry.otherNames.map((name: NameAlias, nameIndex: number) => (
            <div key={nameIndex} className="flex space-x-2">
              <input
                id={`otherLastName-${entry._id}-${nameIndex}`}
                type="text"
                value={name.lastName}
                onChange={handleInputChange(
                  `${entryPath}.otherNames[${nameIndex}].lastName`
                )}
                disabled={isReadOnlyField(
                  `${entryPath}.otherNames[${nameIndex}].lastName`
                )}
                className="mt-1 block w-full"
                placeholder="Last Name"
              />
              <label
                htmlFor={`otherLastName-${entry._id}-${nameIndex}`}
                className="sr-only"
              >
                Last Name
              </label>

              <input
                id={`otherFirstName-${entry._id}-${nameIndex}`}
                type="text"
                value={name.firstName}
                onChange={handleInputChange(
                  `${entryPath}.otherNames[${nameIndex}].firstName`
                )}
                disabled={isReadOnlyField(
                  `${entryPath}.otherNames[${nameIndex}].firstName`
                )}
                className="mt-1 block w-full"
                placeholder="First Name"
              />
              <label
                htmlFor={`otherFirstName-${entry._id}-${nameIndex}`}
                className="sr-only"
              >
                First Name
              </label>

              <input
                id={`otherMiddleName-${entry._id}-${nameIndex}`}
                type="text"
                value={name.middleName || ""}
                onChange={handleInputChange(
                  `${entryPath}.otherNames[${nameIndex}].middleName`
                )}
                disabled={isReadOnlyField(
                  `${entryPath}.otherNames[${nameIndex}].middleName`
                )}
                className="mt-1 block w-full"
                placeholder="Middle Name"
              />
              <label
                htmlFor={`otherMiddleName-${entry._id}-${nameIndex}`}
                className="sr-only"
              >
                Middle Name
              </label>

              <input
                id={`otherSuffix-${entry._id}-${nameIndex}`}
                type="text"
                value={name.suffix || ""}
                onChange={handleInputChange(
                  `${entryPath}.otherNames[${nameIndex}].suffix`
                )}
                disabled={isReadOnlyField(
                  `${entryPath}.otherNames[${nameIndex}].suffix`
                )}
                className="mt-1 block w-full"
                placeholder="Suffix"
              />
              <label
                htmlFor={`otherSuffix-${entry._id}-${nameIndex}`}
                className="sr-only"
              >
                Suffix
              </label>
            </div>
          ))}
        </div>
        <div>
          <label htmlFor={`citizenship-${entry._id}`}>Citizenship</label>
          {entry.citizenships.map(
            (citizenship: Citizenship, citizenshipIndex: number) => (
              <input
                key={citizenshipIndex}
                id={`citizenship-${entry._id}-${citizenshipIndex}`}
                type="text"
                value={citizenship.country}
                onChange={handleInputChange(
                  `${entryPath}.citizenships[${citizenshipIndex}].country`
                )}
                disabled={isReadOnlyField(
                  `${entryPath}.citizenships[${citizenshipIndex}].country`
                )}
                className="mt-1 block w-full"
                placeholder="Country"
              />
            )
          )}
        </div>
        <div>
          <label htmlFor={`dateOfBirth-${entry._id}`}>Date of Birth</label>
          <input
            id={`dateOfBirth-${entry._id}`}
            type="text"
            value={entry.dateOfBirth || ""}
            onChange={handleInputChange(`${entryPath}.dateOfBirth`)}
            disabled={isReadOnlyField(`${entryPath}.dateOfBirth`)}
            className="mt-1 block w-full"
          />
        </div>
        <div>
          <label htmlFor={`placeOfBirthCity-${entry._id}`}>
            Place of Birth
          </label>
          <input
            id={`placeOfBirthCity-${entry._id}`}
            type="text"
            value={entry.placeOfBirth.city || ""}
            onChange={handleInputChange(`${entryPath}.placeOfBirth.city`)}
            disabled={isReadOnlyField(`${entryPath}.placeOfBirth.city`)}
            className="mt-1 block w-full"
            placeholder="City"
          />
          <input
            id={`placeOfBirthCountry-${entry._id}`}
            type="text"
            value={entry.placeOfBirth.country || ""}
            onChange={handleInputChange(`${entryPath}.placeOfBirth.country`)}
            disabled={isReadOnlyField(`${entryPath}.placeOfBirth.country`)}
            className="mt-1 block w-full"
            placeholder="Country"
          />
        </div>
        <div>
          <label htmlFor={`currentAddressStreet-${entry._id}`}>
            Current Address
          </label>
          <input
            id={`currentAddressStreet-${entry._id}`}
            type="text"
            value={entry.currentAddress?.street || ""}
            onChange={handleInputChange(`${entryPath}.currentAddress.street`)}
            disabled={isReadOnlyField(`${entryPath}.currentAddress.street`)}
            className="mt-1 block w-full"
            placeholder="Street"
          />
          <input
            id={`currentAddressCity-${entry._id}`}
            type="text"
            value={entry.currentAddress?.city || ""}
            onChange={handleInputChange(`${entryPath}.currentAddress.city`)}
            disabled={isReadOnlyField(`${entryPath}.currentAddress.city`)}
            className="mt-1 block w-full"
            placeholder="City"
          />
          <input
            id={`currentAddressState-${entry._id}`}
            type="text"
            value={entry.currentAddress?.state || ""}
            onChange={handleInputChange(`${entryPath}.currentAddress.state`)}
            disabled={isReadOnlyField(`${entryPath}.currentAddress.state`)}
            className="mt-1 block w-full"
            placeholder="State"
          />
          <input
            id={`currentAddressZipCode-${entry._id}`}
            type="text"
            value={entry.currentAddress?.zipCode || ""}
            onChange={handleInputChange(`${entryPath}.currentAddress.zipCode`)}
            disabled={isReadOnlyField(`${entryPath}.currentAddress.zipCode`)}
            className="mt-1 block w-full"
            placeholder="Zip Code"
          />
          <input
            id={`currentAddressCountry-${entry._id}`}
            type="text"
            value={entry.currentAddress?.country || ""}
            onChange={handleInputChange(`${entryPath}.currentAddress.country`)}
            disabled={isReadOnlyField(`${entryPath}.currentAddress.country`)}
            className="mt-1 block w-full"
            placeholder="Country"
          />
        </div>
        <div>
          <label htmlFor={`apoFpoAddress-${entry._id}`}>APO/FPO Address</label>
          <input
            id={`apoFpoAddress-${entry._id}`}
            type="text"
            value={entry.apoFpoAddress?.address || ""}
            onChange={handleInputChange(`${entryPath}.apoFpoAddress.address`)}
            disabled={isReadOnlyField(`${entryPath}.apoFpoAddress.address`)}
            className="mt-1 block w-full"
            placeholder="Address"
          />
          <input
            id={`apoFpoStateCode-${entry._id}`}
            type="text"
            value={entry.apoFpoAddress?.stateCode || ""}
            onChange={handleInputChange(`${entryPath}.apoFpoAddress.stateCode`)}
            disabled={isReadOnlyField(`${entryPath}.apoFpoAddress.stateCode`)}
            className="mt-1 block w-full"
            placeholder="State Code"
          />
          <input
            id={`apoFpoZipCode-${entry._id}`}
            type="text"
            value={entry.apoFpoAddress?.zipCode || ""}
            onChange={handleInputChange(`${entryPath}.apoFpoAddress.zipCode`)}
            disabled={isReadOnlyField(`${entryPath}.apoFpoAddress.zipCode`)}
            className="mt-1 block w-full"
            placeholder="Zip Code"
          />
        </div>
        <div>
          <label htmlFor={`currentEmployer-${entry._id}`}>
            Current Employer
          </label>
          <input
            id={`currentEmployer-${entry._id}`}
            type="text"
            value={entry.currentEmployer?.name || ""}
            onChange={handleInputChange(`${entryPath}.currentEmployer.name`)}
            disabled={isReadOnlyField(`${entryPath}.currentEmployer.name`)}
            className="mt-1 block w-full"
            placeholder="Employer Name"
          />
          <div>
            <label htmlFor={`employerAddressStreet-${entry._id}`}>
              Employer Address
            </label>
            <input
              id={`employerAddressStreet-${entry._id}`}
              type="text"
              value={entry.currentEmployer?.address?.street || ""}
              onChange={handleInputChange(
                `${entryPath}.currentEmployer.address.street`
              )}
              disabled={isReadOnlyField(
                `${entryPath}.currentEmployer.address.street`
              )}
              className="mt-1 block w-full"
              placeholder="Street"
            />
            <input
              id={`employerAddressCity-${entry._id}`}
              type="text"
              value={entry.currentEmployer?.address?.city || ""}
              onChange={handleInputChange(
                `${entryPath}.currentEmployer.address.city`
              )}
              disabled={isReadOnlyField(
                `${entryPath}.currentEmployer.address.city`
              )}
              className="mt-1 block w-full"
              placeholder="City"
            />
            <input
              id={`employerAddressState-${entry._id}`}
              type="text"
              value={entry.currentEmployer?.address?.state || ""}
              onChange={handleInputChange(
                `${entryPath}.currentEmployer.address.state`
              )}
              disabled={isReadOnlyField(
                `${entryPath}.currentEmployer.address.state`
              )}
              className="mt-1 block w-full"
              placeholder="State"
            />
            <input
              id={`employerAddressZipCode-${entry._id}`}
              type="text"
              value={entry.currentEmployer?.address?.zipCode || ""}
              onChange={handleInputChange(
                `${entryPath}.currentEmployer.address.zipCode`
              )}
              disabled={isReadOnlyField(
                `${entryPath}.currentEmployer.address.zipCode`
              )}
              className="mt-1 block w-full"
              placeholder="Zip Code"
            />
            <input
              id={`employerAddressCountry-${entry._id}`}
              type="text"
              value={entry.currentEmployer?.address?.country || ""}
              onChange={handleInputChange(
                `${entryPath}.currentEmployer.address.country`
              )}
              disabled={isReadOnlyField(
                `${entryPath}.currentEmployer.address.country`
              )}
              className="mt-1 block w-full"
              placeholder="Country"
            />
          </div>
        </div>
        <div>
          <label>Affiliated with Foreign Government?</label>
          <label className="inline-flex items-center">
            <input
              id={`affiliatedYes-${entry._id}`}
              type="radio"
              value="yes"
              checked={entry.affiliatedWithForeignGov === true}
              onChange={handleRadioChange(
                true,
                `${entryPath}.affiliatedWithForeignGov`
              )}
              disabled={isReadOnlyField(
                `${entryPath}.affiliatedWithForeignGov`
              )}
              className="mr-2"
            />
            <label htmlFor={`affiliatedYes-${entry._id}`}>YES</label>
          </label>
          <label className="inline-flex items-center">
            <input
              id={`affiliatedNo-${entry._id}`}
              type="radio"
              value="no"
              checked={entry.affiliatedWithForeignGov === false}
              onChange={handleRadioChange(
                false,
                `${entryPath}.affiliatedWithForeignGov`
              )}
              disabled={isReadOnlyField(
                `${entryPath}.affiliatedWithForeignGov`
              )}
              className="mr-2"
            />
            <label htmlFor={`affiliatedNo-${entry._id}`}>NO</label>
          </label>
        </div>
        {entry.affiliatedWithForeignGov && (
          <div>
            <label htmlFor={`foreignGovAffiliationDetails-${entry._id}`}>
              Affiliation Details
            </label>
            <input
              id={`foreignGovAffiliationDetails-${entry._id}`}
              type="text"
              value={entry.foreignGovAffiliationDetails || ""}
              onChange={handleInputChange(
                `${entryPath}.foreignGovAffiliationDetails`
              )}
              disabled={isReadOnlyField(
                `${entryPath}.foreignGovAffiliationDetails`
              )}
              className="mt-1 block w-full"
            />
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="p-4 bg-gray-50 rounded-lg shadow space-y-4">
      <h3 className="text-lg font-semibold">Section 19 - Foreign Contacts</h3>

      <div className="mt-2 flex space-x-4">
        <label className="inline-flex items-center">
          Do you have, or have you had, close and/or continuing contact with a
          foreign national within the last seven (7) years with whom you, or
          your spouse, or legally recognized civil union/domestic partner, or
          cohabitant are bound by affection, influence, common interests, and/or
          obligation? Include associates as well as relatives, not previously
          listed in Section 18.
          <input
            id="hasForeignContactYes"
            type="radio"
            name="hasForeignContact"
            value="yes"
            checked={data.hasForeignContact === true}
            onChange={handleRadioChange(true, "hasForeignContact")}
            className="mr-2"
            disabled={isReadOnlyField("hasForeignContact")}
          />
          <label htmlFor="hasForeignContactYes">YES</label>
        </label>
        <label className="inline-flex items-center">
          <input
            id="hasForeignContactNo"
            type="radio"
            name="hasForeignContact"
            value="no"
            checked={data.hasForeignContact === false}
            onChange={handleRadioChange(false, "hasForeignContact")}
            className="mr-2"
            disabled={isReadOnlyField("hasForeignContact")}
          />
          <label htmlFor="hasForeignContactNo">NO</label>
        </label>
      </div>

      {data.entries && data.entries.length > 0 && (
        <div className="mt-2 space-y-4">
          {data.entries.map((entry, index) => renderContactEntry(entry, index))}
        </div>
      )}
    </div>
  );
};

export { RenderForeignContacts };
