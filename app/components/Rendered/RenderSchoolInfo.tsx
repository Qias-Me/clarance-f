import React from "react";
import FormInfo from "api_v2/interfaces/FormInfo";
import {
  SchoolInfo
} from "api_v2/interfaces/schoolInfo";

interface FormProps {
  data: SchoolInfo;
  onInputChange: (path: string, value: any) => void;
  onAddEntry: (path: string, newItem: any) => void;
  onRemoveEntry: (path: string, index: number) => void;
  isValidValue: (path: string, value: any) => boolean;
  getDefaultNewItem: (itemType: string) => any;
  isReadOnlyField: (fieldName: string) => boolean;
  path: string;
  formInfo: FormInfo;
  actionType?: string;
}

const RenderSchoolInfo: React.FC<FormProps> = ({
  data,
  onInputChange,
  onAddEntry,
  onRemoveEntry,
  isValidValue,
  getDefaultNewItem,
  isReadOnlyField,
  path,
  formInfo,
}) => {
  const schoolInfo = data as SchoolInfo;

  return (
    <div className="p-4 bg-gray-50 rounded-lg shadow space-y-4">
      <h3 className="text-lg font-semibold">
        Section 12 - Where You Went to School
      </h3>

      <div className="flex items-center">
        <label htmlFor="hasAttendedSchool-yes" className="mr-2">
          Have you attended any schools in the last 10 years?
        </label>
        <div>
          <input
            type="radio"
            id="hasAttendedSchool-yes"
            name="hasAttendedSchool"
            value="yes"
            checked={schoolInfo.hasAttendedSchool === true}
            onChange={() => onInputChange(`${path}.hasAttendedSchool`, true)}
            className="mr-1"
          />
          <label htmlFor="hasAttendedSchool-yes" className="mr-2">
            Yes
          </label>
          <input
            type="radio"
            id="hasAttendedSchool-no"
            name="hasAttendedSchool"
            value="no"
            checked={schoolInfo.hasAttendedSchool === false}
            onChange={() => onInputChange(`${path}.hasAttendedSchool`, false)}
            className="mr-1"
          />
          <label htmlFor="hasAttendedSchool-no" className="mr-2">
            No
          </label>
        </div>
      </div>

      <div className="flex items-center">
        <label htmlFor="hasReceivedDegree-yes" className="mr-2">
          Have you received a degree or diploma more than 10 years ago?
        </label>
        <div>
          <input
            type="radio"
            id="hasReceivedDegree-yes"
            name="hasReceivedDegree"
            value="yes"
            checked={schoolInfo.hasReceivedDegree === true}
            onChange={() => onInputChange(`${path}.hasReceivedDegree`, true)}
            className="mr-1"
          />
          <label htmlFor="hasReceivedDegree-yes" className="mr-2">
            Yes
          </label>
          <input
            type="radio"
            id="hasReceivedDegree-no"
            name="hasReceivedDegree"
            value="no"
            checked={schoolInfo.hasReceivedDegree === false}
            onChange={() => onInputChange(`${path}.hasReceivedDegree`, false)}
            className="mr-1"
          />
          <label htmlFor="hasReceivedDegree-no" className="mr-2">
            No
          </label>
        </div>
        <span>(If NO to 12(a) and 12(b), proceed to Section 13A)</span>
      </div>

      {schoolInfo.schoolEntry.map((entry, index) => (
        <div key={index} className="border p-2 rounded-lg shadow space-y-2">
          <div className="flex items-center">
            <label className="mr-2" htmlFor={`schoolName-${index}`}>
              School Name:
            </label>
            <input
              type="text"
              id={`schoolName-${index}`}
              value={entry.schoolName}
              onChange={(e) =>
                onInputChange(
                  `${path}.schoolEntry[${index}].schoolName`,
                  e.target.value
                )
              }
              className="border rounded p-1"
              readOnly={isReadOnlyField(
                `${path}.schoolEntry[${index}].schoolName`
              )}
            />
          </div>
          <div className="flex items-center">
            <label className="mr-2" htmlFor={`fromDate-${index}`}>
              From Date:
            </label>
            <input
              type="date"
              id={`fromDate-${index}`}
              value={entry.fromDate}
              onChange={(e) =>
                onInputChange(
                  `${path}.schoolEntry[${index}].fromDate`,
                  e.target.value
                )
              }
              className="border rounded p-1"
              readOnly={isReadOnlyField(
                `${path}.schoolEntry[${index}].fromDate`
              )}
            />
          </div>
          <div className="flex items-center">
            <label className="mr-2" htmlFor={`toDate-${index}`}>
              To Date:
            </label>
            <input
              type="date"
              id={`toDate-${index}`}
              value={entry.toDate}
              onChange={(e) =>
                onInputChange(
                  `${path}.schoolEntry[${index}].toDate`,
                  e.target.value
                )
              }
              className="border rounded p-1"
              readOnly={isReadOnlyField(`${path}.schoolEntry[${index}].toDate`)}
            />
          </div>
          <div className="flex items-center">
            <label className="mr-2" htmlFor={`present-${index}`}>
              Present:
            </label>
            <input
              type="checkbox"
              id={`present-${index}`}
              checked={entry.present}
              onChange={(e) =>
                onInputChange(
                  `${path}.schoolEntry[${index}].present`,
                  e.target.checked
                )
              }
              className="mr-2"
              readOnly={isReadOnlyField(
                `${path}.schoolEntry[${index}].present`
              )}
            />
          </div>
          <div className="flex items-center">
            <label className="mr-2" htmlFor={`schoolType-${index}`}>
              School Type:
            </label>
            <input
              type="text"
              id={`schoolType-${index}`}
              value={entry.schoolType}
              onChange={(e) =>
                onInputChange(
                  `${path}.schoolEntry[${index}].schoolType`,
                  e.target.value
                )
              }
              className="border rounded p-1"
              readOnly={isReadOnlyField(
                `${path}.schoolEntry[${index}].schoolType`
              )}
            />
          </div>
          <div className="flex items-center">
            <label className="mr-2" htmlFor={`degreeReceived-${index}`}>
              Degree Received:
            </label>
            <input
              type="checkbox"
              id={`degreeReceived-${index}`}
              checked={entry.degreeReceived}
              onChange={(e) =>
                onInputChange(
                  `${path}.schoolEntry[${index}].degreeReceived`,
                  e.target.checked
                )
              }
              className="mr-2"
              readOnly={isReadOnlyField(
                `${path}.schoolEntry[${index}].degreeReceived`
              )}
            />
          </div>

          <div className="flex flex-col">
            <p className="mr-2">Degrees:</p>
            {entry.degrees.map((degree, degreeIndex) => (
              <div
                key={degreeIndex}
                className="flex flex-col border p-2 rounded-lg shadow space-y-2"
              >
                <div className="flex items-center">
                  <label
                    className="mr-2"
                    htmlFor={`degreeType-${index}-${degreeIndex}`}
                  >
                    Degree Type:
                  </label>
                  <input
                    type="text"
                    id={`degreeType-${index}-${degreeIndex}`}
                    value={degree.type}
                    onChange={(e) =>
                      onInputChange(
                        `${path}.schoolEntry[${index}].degrees[${degreeIndex}].type`,
                        e.target.value
                      )
                    }
                    className="border rounded p-1"
                    readOnly={isReadOnlyField(
                      `${path}.schoolEntry[${index}].degrees[${degreeIndex}].type`
                    )}
                  />
                </div>
                <div className="flex items-center">
                  <label
                    className="mr-2"
                    htmlFor={`degreeDateAwarded-${index}-${degreeIndex}`}
                  >
                    Date Awarded:
                  </label>
                  <input
                    type="date"
                    id={`degreeDateAwarded-${index}-${degreeIndex}`}
                    value={degree.dateAwarded}
                    onChange={(e) =>
                      onInputChange(
                        `${path}.schoolEntry[${index}].degrees[${degreeIndex}].dateAwarded`,
                        e.target.value
                      )
                    }
                    className="border rounded p-1"
                    readOnly={isReadOnlyField(
                      `${path}.schoolEntry[${index}].degrees[${degreeIndex}].dateAwarded`
                    )}
                  />
                </div>
                <div className="flex items-center">
                  <label
                    className="mr-2"
                    htmlFor={`degreeEst-${index}-${degreeIndex}`}
                  >
                    Est:
                  </label>
                  <input
                    type="checkbox"
                    id={`degreeEst-${index}-${degreeIndex}`}
                    checked={degree.est}
                    onChange={(e) =>
                      onInputChange(
                        `${path}.schoolEntry[${index}].degrees[${degreeIndex}].est`,
                        e.target.checked
                      )
                    }
                    className="mr-2"
                    readOnly={isReadOnlyField(
                      `${path}.schoolEntry[${index}].degrees[${degreeIndex}].est`
                    )}
                  />
                </div>
                {entry.degrees.length < 2 && (
                  <button
                    onClick={(event) => {
                      console.log(path, "path");
                      event.preventDefault();
                      onAddEntry(
                        `${path}.schoolEntry[${index}].degrees`,
                        getDefaultNewItem(`schoolInfo.schoolEntry.degrees`)
                      );
                    }}
                    className="mt-4 p-2 bg-green-500 text-white rounded-md shadow"
                  >
                    Add Entry
                  </button>
                )}
              </div>
            ))}
          </div>

          <button
            onClick={() => onRemoveEntry(`${path}.schoolEntry`, index)}
            className="mt-2 p-2 bg-red-500 text-white rounded-md shadow"
          >
            Remove Entry
          </button>
        </div>
      ))}

      {(data.schoolEntry.length > 4 ||
        schoolInfo.hasAttendedSchool ||
        schoolInfo.hasReceivedDegree) && (
        <button
          onClick={(event) => {
            event.preventDefault();
            onAddEntry(
              `${path}.schoolEntry`,
              getDefaultNewItem(`schoolInfo.schoolEntry`)
            );
          }}
          className="mt-4 p-2 bg-green-500 text-white rounded-md shadow"
        >
          Add Entry
        </button>
      )}
    </div>
  );
};

export { RenderSchoolInfo };
