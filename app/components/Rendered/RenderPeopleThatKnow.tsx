import React from "react";
import { type PeopleThatKnow } from "api/interfaces/sections/peopleThatKnow";
import {type FormInfo} from "api/interfaces/FormInfo";


interface FormProps {
  data: PeopleThatKnow[];
  onInputChange: (path: string, value: any) => void;
  onAddEntry: (path: string, newItem: any) => void;
  onRemoveEntry: (path: string, index: number) => void;
  getDefaultNewItem: (itemType: string) => any;
  isReadOnlyField: (fieldName: string) => boolean;
  path: string;
  formInfo: FormInfo;
}

const RenderPeopleThatKnow: React.FC<FormProps> = ({
  data,
  onInputChange,
  onAddEntry,
  onRemoveEntry,
  getDefaultNewItem,
  isReadOnlyField,
  path,
  formInfo,
}) => {
  const handleInputChange = (path: string, value: any) => {
    console.log(path, value, "path and value");
    onInputChange(path, value);
  };

  return (
    <div className="p-6 bg-gray-50 rounded-lg shadow space-y-4">
      <h3 className="text-lg font-semibold">
        Section 16 - People Who Know You Well
      </h3>
      {data.map((entry, index) => (
        <div
          key={index}
          className="space-y-4 border p-4 rounded-lg  shadow"
        >
          <div className="grid grid-cols-2 gap-4">
            <input
              type="text"
              value={entry.lastName}
              onChange={(e) =>
                handleInputChange(`${path}[${index}].lastName`, e.target.value)
              }
              placeholder="Last Name"
              readOnly={isReadOnlyField("lastName")}
              className="p-2 border rounded w-full"
            />
            <input
              type="text"
              value={entry.firstName}
              onChange={(e) =>
                handleInputChange(`${path}[${index}].firstName`, e.target.value)
              }
              placeholder="First Name"
              readOnly={isReadOnlyField("firstName")}
              className="p-2 border rounded w-full"
            />
            <input
              type="text"
              value={entry.middleName || ""}
              onChange={(e) =>
                handleInputChange(
                  `${path}[${index}].middleName`,
                  e.target.value
                )
              }
              placeholder="Middle Name"
              readOnly={isReadOnlyField("middleName")}
              className="p-2 border rounded w-full"
            />
            <input
              type="text"
              value={entry.suffix || ""}
              onChange={(e) =>
                handleInputChange(`${path}[${index}].suffix`, e.target.value)
              }
              placeholder="Suffix"
              readOnly={isReadOnlyField("suffix")}
              className="p-2 border rounded w-full"
            />
            <input
              type="text"
              value={entry.knownFromDate}
              onChange={(e) =>
                handleInputChange(
                  `${path}[${index}].knownFromDate`,
                  e.target.value
                )
              }
              placeholder="Known From (MM/YYYY)"
              readOnly={isReadOnlyField("knownFromDate")}
              className="p-2 border rounded w-full"
            />
            <input
              type="text"
              value={entry.knownToDate || ""}
              onChange={(e) =>
                handleInputChange(
                  `${path}[${index}].knownToDate`,
                  e.target.value
                )
              }
              placeholder="Known To (MM/YYYY)"
              readOnly={isReadOnlyField("knownToDate")}
              className="p-2 border rounded w-full"
            />
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={entry.present}
                onChange={(e) =>
                  handleInputChange(
                    `${path}[${index}].present`,
                    e.target.checked
                  )
                }
                readOnly={isReadOnlyField("present")}
                className="p-2 border rounded"
              />
              <label>Present</label>
            </div>
            <input
              type="text"
              value={entry.emailAddress || ""}
              onChange={(e) =>
                handleInputChange(
                  `${path}[${index}].emailAddress`,
                  e.target.value
                )
              }
              placeholder="Email Address"
              readOnly={isReadOnlyField("emailAddress")}
              className="p-2 border rounded w-full"
            />
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={entry.emailUnknown}
                onChange={(e) =>
                  handleInputChange(
                    `${path}[${index}].emailUnknown`,
                    e.target.checked
                  )
                }
                readOnly={isReadOnlyField("emailUnknown")}
                className="p-2 border rounded"
              />
              <label>Email Unknown</label>
            </div>
            <input
              type="text"
              value={entry.rankOrTitle || ""}
              onChange={(e) =>
                handleInputChange(
                  `${path}[${index}].rankOrTitle`,
                  e.target.value
                )
              }
              placeholder="Rank or Title"
              readOnly={isReadOnlyField("rankOrTitle")}
              className="p-2 border rounded w-full"
            />
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={entry.rankOrTitleNotApplicable}
                onChange={(e) =>
                  handleInputChange(
                    `${path}[${index}].rankOrTitleNotApplicable`,
                    e.target.checked
                  )
                }
                readOnly={isReadOnlyField("rankOrTitleNotApplicable")}
                className="p-2 border rounded"
              />
              <label>Rank/Title Not Applicable</label>
            </div>
            <input
              type="text"
              value={entry.relationshipToApplicant.other || ""}
              onChange={(e) =>
                handleInputChange(
                  `${path}[${index}].relationshipToApplicant.other`,
                  e.target.value
                )
              }
              placeholder="Relationship to Applicant"
              readOnly={isReadOnlyField("relationshipToApplicant.other")}
              className="p-2 border rounded w-full"
            />
            <input
              type="text"
              value={entry.phoneNumber || ""}
              onChange={(e) =>
                handleInputChange(
                  `${path}[${index}].phoneNumber`,
                  e.target.value
                )
              }
              placeholder="Phone Number"
              readOnly={isReadOnlyField("phoneNumber")}
              className="p-2 border rounded w-full"
            />
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={entry.phoneNumberUnknown}
                onChange={(e) =>
                  handleInputChange(
                    `${path}[${index}].phoneNumberUnknown`,
                    e.target.checked
                  )
                }
                readOnly={isReadOnlyField("phoneNumberUnknown")}
                className="p-2 border rounded"
              />
              <label>Phone Number Unknown</label>
            </div>
            <input
              type="text"
              value={entry.phoneExtension || ""}
              onChange={(e) =>
                handleInputChange(
                  `${path}[${index}].phoneExtension`,
                  e.target.value
                )
              }
              placeholder="Phone Extension"
              readOnly={isReadOnlyField("phoneExtension")}
              className="p-2 border rounded w-full"
            />
            <input
              type="text"
              value={entry.phoneType || ""}
              onChange={(e) =>
                handleInputChange(`${path}[${index}].phoneType`, e.target.value)
              }
              placeholder="Phone Type"
              readOnly={isReadOnlyField("phoneType")}
              className="p-2 border rounded w-full"
            />
            <input
              type="text"
              value={entry.mobileNumber || ""}
              onChange={(e) =>
                handleInputChange(
                  `${path}[${index}].mobileNumber`,
                  e.target.value
                )
              }
              placeholder="Mobile Number"
              readOnly={isReadOnlyField("mobileNumber")}
              className="p-2 border rounded w-full"
            />
            <div className="flex items-center space-x-2">
              <label>Preferred Contact Time:</label>
              <input
                type="checkbox"
                checked={entry.preferredContactTime.day}
                onChange={(e) =>
                  handleInputChange(
                    `${path}[${index}].preferredContactTime.day`,
                    e.target.checked
                  )
                }
                readOnly={isReadOnlyField("preferredContactTime.day")}
                className="p-2 border rounded"
              />
              <label>Day</label>
              <input
                type="checkbox"
                checked={entry.preferredContactTime.night}
                onChange={(e) =>
                  handleInputChange(
                    `${path}[${index}].preferredContactTime.night`,
                    e.target.checked
                  )
                }
                readOnly={isReadOnlyField("preferredContactTime.night")}
                className="p-2 border rounded"
              />
              <label>Night</label>
            </div>
            <input
              type="text"
              value={entry.address.street}
              onChange={(e) =>
                handleInputChange(
                  `${path}[${index}].address.street`,
                  e.target.value
                )
              }
              placeholder="Street Address"
              readOnly={isReadOnlyField("address.street")}
              className="p-2 border rounded w-full"
            />
            <input
              type="text"
              value={entry.address.city}
              onChange={(e) =>
                handleInputChange(
                  `${path}[${index}].address.city`,
                  e.target.value
                )
              }
              placeholder="City"
              readOnly={isReadOnlyField("address.city")}
              className="p-2 border rounded w-full"
            />
            <input
              type="text"
              value={entry.address.state || ""}
              onChange={(e) =>
                handleInputChange(
                  `${path}[${index}].address.state`,
                  e.target.value
                )
              }
              placeholder="State"
              readOnly={isReadOnlyField("address.state")}
              className="p-2 border rounded w-full"
            />
            <input
              type="text"
              value={entry.address.zipCode || ""}
              onChange={(e) =>
                handleInputChange(
                  `${path}[${index}].address.zipCode`,
                  e.target.value
                )
              }
              placeholder="Zip Code"
              readOnly={isReadOnlyField("address.zipCode")}
              className="p-2 border rounded w-full"
            />
            <input
              type="text"
              value={entry.address.country}
              onChange={(e) =>
                handleInputChange(
                  `${path}[${index}].address.country`,
                  e.target.value
                )
              }
              placeholder="Country"
              readOnly={isReadOnlyField("address.country")}
              className="p-2 border rounded w-full"
            />
          </div>
          {data.length > 1 && (
            <button
              onClick={() => onRemoveEntry(path, index)}
              className="mt-2 p-2 bg-red-500 text-white rounded-md shadow"
            >
              Remove Entry
            </button>
          )}
        </div>
      ))}
      {data.length < 3 && (
        <button
          onClick={(e) => {
            e.preventDefault();
            onAddEntry(path, getDefaultNewItem("peopleThatKnow"));
          }}
          className="mt-4 p-2 bg-green-500 text-white rounded-md shadow"
        >
          Add Entry
        </button>
      )}
    </div>
  );
};

export { RenderPeopleThatKnow };
