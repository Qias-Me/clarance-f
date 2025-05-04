import FormInfo from "api_v2/interfaces/forminfo";
import React, { useState } from "react";
import pkg from "lodash";

type FormProps = {
  data: any;
  onInputChange: (path: string, value: any) => void;
  onAddEntry: (path: string, newItem: any) => void;
  onRemoveEntry: (path: string, index: number) => void;
  isValidValue: (path: string, value: any) => boolean;
  getDefaultNewItem: (itemType: string) => any;
  isReadOnlyField: (fieldName: string) => boolean;
  path: string;
  formInfo: FormInfo; // Specify more detailed type if possible
  actionType?: string;
};

const RenderBasicInfo = ({
  data,
  isReadOnlyField,
  onInputChange,
  isValidValue,
  path,
  formInfo,
  actionType,
}: FormProps) => {
  const basicInfo = data as EmployeeType;

  const [descriptionError, setDescriptionError] = useState("");

  const { debounce } = pkg;

  const [logoUrl, setLogoUrl] = useState(basicInfo.image_url);

  const debouncedUpdateLogoUrl = debounce((event) => {
    const url = `/assets/staff/${event.target.value}`;

    if (isValidLocalPath(url)) {
      setLogoUrl(url);
      onInputChange(`${path}.image_url`, url); // Assuming `onInputChange` is designed to handle path updates
    } else {
      setLogoUrl(basicInfo.image_url); // Set a default image URL if the path is invalid
    }
  }, 500);

  // Utility to check if the local path is valid for your assets directory
  const isValidLocalPath = (string: string) => {
    return /^\/assets\/staff\/[^\/]+/.test(string); // Regex to check if the URL follows the expected pattern
  };

  // Initialize logoDefault to an empty string
  let logoDefault = "";

  // Retrieve imageUrl from basicInfo object
  const imageUrl = basicInfo.image_url;

  // Check if imageUrl is defined and not empty
  if (imageUrl) {
    // Extract the full filename from the URL
    logoDefault = imageUrl.split("/").pop() || "";
  }

  return (
    <div className="p-4 bg-gray-50 rounded-lg shadow space-y-4">
      {formInfo.employee_id ? (
        <label className="block">
          Consultant ID:
          <input
            type="text"
            defaultValue={formInfo.employee_id}
            readOnly={isReadOnlyField("employee_id")}
            className="mt-1 p-2 w-full border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition duration-150 ease-in-out"
          />
        </label>
      ) : (
        <div className="text-lg font-semibold">Create employee form</div>
      )}

      <label className="block">
        First Name:
        <input
          type="text"
          defaultValue={basicInfo.first_name || ""}
          onChange={(e) => {
            if (isValidValue(`${path}.first_name`, e.target.value)) {
              onInputChange(`${path}.first_name`, e.target.value);
            }
          }}
          className="mt-1 p-2 w-full border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition duration-150 ease-in-out"
        />
      </label>

      <label className="block">
        Last Name:
        <input
          type="text"
          defaultValue={basicInfo.last_name || ""}
          onChange={(e) => {
            if (isValidValue(`${path}.last_name`, e.target.value)) {
              onInputChange(`${path}.last_name`, e.target.value);
            }
          }}
          className="mt-1 p-2 w-full border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition duration-150 ease-in-out"
        />
      </label>

      <label className="block">
        Position:
        <input
          type="text"
          defaultValue={basicInfo.position || ""}
          onChange={(e) => {
            if (isValidValue(`${path}.position`, e.target.value)) {
              onInputChange(`${path}.position`, e.target.value);
            }
          }}
          className="mt-1 p-2 w-full border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition duration-150 ease-in-out"
        />
      </label>

      <label className="block">
        Email:
        <input
          type="email"
          defaultValue={basicInfo.email || ""}
          onChange={(e) => {
            if (isValidValue(`${path}.email`, e.target.value)) {
              onInputChange(`${path}.email`, e.target.value);
            }
          }}
          className="mt-1 p-2 w-full border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition duration-150 ease-in-out"
        />
      </label>

      <label className="block">
        Description:
        <textarea
          defaultValue={basicInfo.employee_description || ""}
          onChange={(e) => {
            const value = e.target.value;
            if (value.length >= 700) {
              setDescriptionError("Description cannot exceed 700 characters."); // Set error message
            } else {
              setDescriptionError(""); // Clear the error message if under limit
              if (isValidValue(`${path}.employee_description`, value)) {
                onInputChange(`${path}.employee_description`, value);
              }
            }
          }}
          className={`mt-1 p-2 w-full border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition duration-150 ease-in-out ${
            descriptionError ? "border-red-500" : ""
          }`}
          maxLength={700} // HTML attribute to limit characters
        />
        {descriptionError && (
          <p className="text-red-500 text-sm mt-1">{descriptionError}</p>
        )}
      </label>

      <div className="flex flex-row items-center gap-4">
        <input
          type="text"
          name={`${path}.image_url`}
          defaultValue={logoDefault}
          placeholder="Basic Info Logo URL"
          className="p-2 flex border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 transition duration-150 ease-in-out"
          onChange={debouncedUpdateLogoUrl} // Updated to handle the event
        />
        {logoUrl && (
          <div className="flex justify-center items-center w-24 h-24 ml-2">
            <img
              src={logoUrl}
              alt="Basic Info Logo"
              className="max-w-full max-h-full object-contain"
            />
          </div>
        )}
      </div>

      {actionType === "UPDATE" && (
        <>
          <label className="block">
            Created At:
            <input
              type="text"
              defaultValue={basicInfo.createdAt}
              readOnly={true}
              className="mt-1 p-2 w-full border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
            />
          </label>

          <label className="block">
            Updated At:
            <input
              type="text"
              defaultValue={basicInfo.updatedAt}
              readOnly={true}
              className="mt-1 p-2 w-full border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
            />
          </label>
        </>
      )}
    </div>
  );
};

const RenderLocations = ({
  data,
  onInputChange,
  onAddEntry,
  onRemoveEntry,
  isValidValue,
  getDefaultNewItem,
  isReadOnlyField,
  path,
  formInfo,
}: FormProps) => {
  return (
    <div
      key={path}
      className="p-4 bg-gray-100 rounded mb-2 grid grid-cols-1 gap-2"
    >
      <strong className="font-semibold text-gray-800">Locations</strong>
      {data.map((location: LocationType, index: number) => (
        <div
          key={location.location_id}
          className="grid grid-cols-1 md:grid-cols-3 gap-4 p-2"
        >
          <div>
            <label
              htmlFor={`city-${index}`}
              className="block text-sm font-medium text-gray-700"
            >
              City
            </label>
            <input
              id={`city-${index}`}
              type="text"
              name={`${path}[${index}]._city`}
              defaultValue={location._city}
              placeholder="Enter city"
              className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
              onChange={(e) => {
                if (isValidValue(`${path}[${index}]._city`, e.target.value)) {
                  onInputChange(`${path}[${index}]._city`, e.target.value);
                }
              }}
              readOnly={isReadOnlyField("_city")}
            />
          </div>

          <div>
            <label
              htmlFor="state-${index}"
              className="block text-sm font-medium text-gray-700"
            >
              State
            </label>
            <input
              id={`state-${index}`}
              type="text"
              name={`${path}[${index}]._state`}
              defaultValue={location._state || ""}
              placeholder="Enter state"
              className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
              onChange={(e) => {
                if (isValidValue(`${path}[${index}]._state`, e.target.value)) {
                  onInputChange(`${path}[${index}]._state`, e.target.value);
                }
              }}
              readOnly={isReadOnlyField("_state")}
            />
          </div>

          <div>
            <label
              htmlFor={`country-${index}`}
              className="block text-sm font-medium text-gray-700"
            >
              Country
            </label>
            <input
              id={`country-${index}`}
              type="text"
              name={`${path}[${index}]._country`}
              value={location._country}
              placeholder="Enter country"
              className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
              onChange={(e) => {
                if (
                  isValidValue(`${path}[${index}]._country`, e.target.value)
                ) {
                  onInputChange(`${path}[${index}]._country`, e.target.value);
                }
              }}
              readOnly={isReadOnlyField("_country")}
            />
          </div>

          <div className="col-span-1 md:col-span-3 flex justify-between items-end">
            <div className="flex-1">
              <label
                htmlFor={`location-type-${index}`}
                className="block text-sm font-medium text-gray-700"
              >
                Location Type
              </label>
              <select
                id={`location-type-${index}`}
                name={`${path}[${index}].location_type_id`}
                defaultValue={location.location_type_id}
                className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                onChange={(e) => {
                  const value = parseInt(e.target.value, 10);
                  if (
                    isValidValue(`${path}[${index}].location_type_id`, value)
                  ) {
                    onInputChange(`${path}[${index}].location_type_id`, value);
                  }
                }}
              >
                {formInfo.locations.map((type) => (
                  <option
                    key={type.location_type_id}
                    value={type.location_type_id}
                  >
                    {type._description}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="button"
              className="ml-4 py-2 px-4 bg-red-500 text-white rounded hover:bg-red-600 transition duration-150"
              onClick={() => onRemoveEntry(path, index)}
            >
              Remove Location
            </button>
          </div>
        </div>
      ))}
      <button
        type="button"
        className="py-1 px-3 bg-green-500 text-white rounded hover:bg-green-600 transition duration-150 mt-2"
        onClick={() => onAddEntry(path, getDefaultNewItem("locations"))}
      >
        Add new location
      </button>
    </div>
  );
};

const RenderClearances = ({
  data,
  onInputChange,
  onAddEntry,
  onRemoveEntry,
  isValidValue,
  getDefaultNewItem,
  isReadOnlyField,
  path,
  formInfo,
}: FormProps) => {
  return (
    <div
      key={path}
      className="p-4 bg-gray-100 rounded mb-2 grid grid-cols-1 gap-2"
    >
      <strong className="font-semibold text-gray-800">Clearances</strong>
      {data.map((clearance: ClearanceType, index: number) => (
        <div
          key={clearance.clearance_id}
          className="flex flex-col md:flex-row md:space-x-4 space-y-2 md:space-y-0"
        >
          <div className="flex-1">
            <label
              htmlFor={`clearance-status-${index}`}
              className="block text-sm font-medium text-gray-700"
            >
              Clearance Status
            </label>
            <select
              key={clearance.clearance_status_id}
              id={`clearance-status-${index}`}
              name={`${path}[${index}].clearance_status_id`}
              defaultValue={clearance.clearance_status_id}
              className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
              onChange={(e) => {
                const value = parseInt(e.target.value, 10);
                if (
                  isValidValue(`${path}[${index}].clearance_status_id`, value)
                ) {
                  onInputChange(`${path}[${index}].clearance_status_id`, value);
                }
              }}
            >
              {formInfo.clearances.clearanceTypes.map((type) => {
                return (
                  <option
                    key={type.clearance_status_id}
                    value={type.clearance_status_id}
                  >
                    {type.clearance_status_name}
                  </option>
                );
              })}
            </select>
          </div>

          <div className="flex-1">
            <label
              htmlFor={`clearance-name-${index}`}
              className="block text-sm font-medium text-gray-700"
            >
              Clearance Name
            </label>
            <select
              key={clearance.clearance_type_id} // Ensuring key is unique and stable
              id={`clearance-name-${index}`}
              name={`${path}[${index}].clearance_type_id`} // The name should be based on the type ID
              defaultValue={clearance.clearance_type_id} // Setting default value using the clearance_type_id from your state
              className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
              onChange={(e) => {
                const value = parseInt(e.target.value, 10);
                if (
                  isValidValue(`${path}[${index}].clearance_type_id`, value)
                ) {
                  onInputChange(`${path}[${index}].clearance_type_id`, value);
                }
              }}
            >
              {formInfo.clearances.clearanceNames.map((name) => (
                <option
                  key={name.clearance_type_id}
                  value={name.clearance_type_id}
                >
                  {name.clearance_name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex-1">
            <label
              htmlFor="clearance-date-${index}"
              className="block text-sm font-medium text-gray-700"
            >
              Expiration Date
            </label>
            <input
              id={`clearance-date-${index}`}
              type="text"
              name={`${path}[${index}].clearance_date`}
              maxLength={4}
              defaultValue={clearance.clearance_date.toString()}
              placeholder="Year (ex. 2024)"
              className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
              onChange={(e) => {
                const value = e.target.value;
                if (isValidValue(`${path}[${index}].clearance_date`, value)) {
                  onInputChange(`${path}[${index}].clearance_date`, value);
                }
              }}
              readOnly={isReadOnlyField("clearance_date")}
            />
          </div>

          <div className="ml-2 flex items-end ">
            <button
              type="button"
              className="py-2 px-4 bg-red-500 text-white rounded hover:bg-red-600 transition duration-150 ease-in-out"
              onClick={() => onRemoveEntry(path, index)}
            >
              Remove Clearance
            </button>
          </div>
        </div>
      ))}

      <button
        type="button"
        className="py-1 px-3 bg-green-500 text-white rounded hover:bg-green-600 transition duration-150 mt-2"
        onClick={() => onAddEntry(path, getDefaultNewItem("clearances"))}
      >
        Add new clearance
      </button>
    </div>
  );
};

const RenderEducations = ({
  data,
  onInputChange,
  onAddEntry,
  onRemoveEntry,
  isValidValue,
  getDefaultNewItem,
  isReadOnlyField,
  path,
}: FormProps) => {
  const [dateError, setDateError] = useState("");

  return (
    <div
      key={path}
      className="p-4 bg-gray-100 rounded mb-2 grid grid-cols-1 gap-2"
    >
      <strong className="font-semibold text-gray-800">Educations</strong>
      {data.map((education: EducationType, index: number) => (
        <div key={education.education_id} className="flex flex-col space-y-4">
          <div className="flex flex-row space-x-4">
            <div className="flex-1">
              <label
                htmlFor="degree-${index}"
                className="block text-sm font-medium text-gray-700"
              >
                Degree
              </label>
              <input
                id="degree-${index}"
                type="text"
                name="${path}[${index}]._degree"
                defaultValue={education._degree}
                placeholder="Degree"
                className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                onChange={(e) => {
                  if (
                    isValidValue(`${path}[${index}]._degree`, e.target.value)
                  ) {
                    onInputChange(`${path}[${index}]._degree`, e.target.value);
                  }
                }}
                readOnly={isReadOnlyField("_degree")}
              />
            </div>

            <div className="flex-1">
              <label
                htmlFor="grad-year-${index}"
                className="block text-sm font-medium text-gray-700"
              >
                Graduation Year
              </label>
              <input
                id={`grad-year-${index}`}
                type="text"
                name={`${path}[${index}].grad_year`}
                maxLength={4}
                placeholder="YYYY"
                defaultValue={education.grad_year}
                className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                onChange={(e) => {
                  if (
                    isValidValue(`${path}[${index}].grad_year`, e.target.value)
                  ) {
                    onInputChange(
                      `${path}[${index}].grad_year`,
                      e.target.value
                    );
                  }
                }}
                readOnly={isReadOnlyField("grad_year")}
              />
            </div>
          </div>

          <div>
            <label
              htmlFor={`institution-${index}`}
              className="block text-sm font-medium text-gray-700"
            >
              Institution
            </label>
            <input
              id="institution-${index}"
              type="text"
              name="${path}[${index}]._institution"
              defaultValue={education._institution}
              placeholder="Institution Name"
              className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
              onChange={(e) => {
                if (
                  isValidValue(`${path}[${index}]._institution`, e.target.value)
                ) {
                  onInputChange(
                    `${path}[${index}]._institution`,
                    e.target.value
                  );
                }
              }}
              readOnly={isReadOnlyField("_institution")}
            />
          </div>

          <button
            type="button"
            className="py-2 px-4 bg-red-500 text-white rounded hover:bg-red-600 transition duration-150"
            onClick={() => onRemoveEntry(path, index)}
          >
            Remove Education
          </button>
        </div>
      ))}
      <button
        type="button"
        className="py-1 px-3 bg-green-500 text-white rounded hover:bg-green-600 transition duration-150 mt-2"
        onClick={() => onAddEntry(path, getDefaultNewItem("education"))}
      >
        Add new education
      </button>
    </div>
  );
};

const RenderCertifications = ({
  data,
  onInputChange,
  onAddEntry,
  onRemoveEntry,
  isValidValue,
  getDefaultNewItem,
  isReadOnlyField,
  path,
  formInfo,
}: FormProps) => {
  const { debounce } = pkg;

  const [logoUrl, setLogoUrl] = useState(data.certification?.logo._url);
  const [isCurrent, setIsCurrent] = useState(false);

  // const [input, setInput] = useState("");

  return (
    <div
      key={path}
      className="p-4 bg-gray-100 rounded mb-2 grid grid-cols-1 gap-4"
    >
      <strong className="font-semibold text-gray-800 text-lg md:text-lg">
        Certifications
      </strong>
      {data.map((certification: CertificationType, index: number) => {
        const handleLogoChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
          const selectedLogoId = e.target.value;
          const selectedLogo = formInfo.logos.find(
            (logo) => logo.logo_id.toString() === selectedLogoId
          );
          if (selectedLogo) {
            setLogoUrl(selectedLogo._url); // Update logo URL state
            onInputChange(
              `${path}[${index}].logo.logo_id`,
              selectedLogo.logo_id
            );
          }
        };

        // const parseTitles = () => {
        //   const newTitles = input.split(",").map((title) => {
        //     const newItem = getDefaultNewItem("titles");
        //     newItem._description = title.trim();
        //     return newItem;
        //   });

        //   onAddEntry(`${path}[${index}].titles`, newTitles);

        //   setInput("");
        // };

        // Utility to check if the local path is valid
        const isValidLocalPath = (url: string) => {
          return /^\/assets\/brandz\/[^\/]+/.test(url); // Check if the URL follows the expected pattern
        };

        // Update the logo URL state only after the user has stopped typing for 500 milliseconds
        const debouncedUpdateLogoUrl = debounce((event) => {
          const url = `/assets/brandz/${event.target.value}`;

          if (isValidLocalPath(url)) {
            setLogoUrl(url);
            onInputChange(`${path}[${index}].logo._url`, url); // Assuming `onInputChange` is designed to handle path updates
          } else {
            setLogoUrl(certification.logo.logo_id); // Use default image if path is invalid
          }
        }, 500);

        return (
          <div
            key={certification.certification_id}
            className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start p-4  shadow rounded-lg"
          >
            <div className="md:col-span-2">
              <label
                htmlFor={`${path}[${index}]._name`}
                className="block text-sm font-medium text-gray-700"
              >
                Name
              </label>
              <input
                type="text"
                name={`${path}[${index}]._name`}
                defaultValue={certification._name}
                placeholder="Certification Name"
                className="p-1 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                onChange={(e) => {
                  if (isValidValue(`${path}[${index}]._name`, e.target.value)) {
                    onInputChange(`${path}[${index}]._name`, e.target.value);
                  }
                }}
                readOnly={isReadOnlyField("_name")}
              />
            </div>

            <div className="flex-grow space-y-2">
              <label
                htmlFor={`${path}[${index}].logo._url`}
                className="block text-sm font-medium text-gray-700"
              >
                Preview
              </label>
              <select
                name={`${path}[${index}].logo_id`}
                defaultValue={
                  certification.logo.logo_id ? certification.logo.logo_id : 22
                }
                className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                onChange={handleLogoChange}
              >
                {formInfo.logos.map((logo) => (
                  <option key={logo.logo_id} value={logo.logo_id}>
                    {logo._title}
                  </option>
                ))}
              </select>

              {logoUrl && (
                <div className="w-24 h-24 bg-gray-200 rounded overflow-hidden">
                  <img src={logoUrl} className="w-full h-full object-contain" />
                </div>
              )}
            </div>

            <div className="md:col-span-3">
              <label
                htmlFor={`${path}[${index}]._description`}
                className="block text-sm font-medium text-gray-700 mt-4"
              >
                Description
              </label>
              <textarea
                name={`${path}[${index}]._description`}
                defaultValue={certification._description}
                placeholder="Description (Optional)"
                className="p-1 border border-gray-300 rounded focus:outline-none focus:border-blue-500 w-full"
                onChange={(e) => {
                  if (
                    isValidValue(
                      `${path}[${index}]._description`,
                      e.target.value
                    )
                  ) {
                    onInputChange(
                      `${path}[${index}]._description`,
                      e.target.value
                    );
                  }
                }}
                readOnly={isReadOnlyField("_description")}
              />
            </div>

            <div className=" p-4 mt-4 rounded-lg shadow space-y-4 flex flex-col md:col-span-3">
              <strong className="text-sm text-gray-800 font-semibold">
                Titles:
              </strong>

              {certification.titles.map(
                (title: TitleType, titleIndex: number) => (
                  <div
                    key={title.title_id}
                    className="grid grid-cols-4 md:grid-cols-12 gap-4 bg-gray-50 p-3 rounded-lg"
                  >
                    <div className="col-span-4 md:col-span-10 p-2 border border-gray-300 rounded focus:outline-none focus:ring focus:ring-blue-400 transition duration-150 ease-in-out">
                      <label
                        htmlFor={`${path}[${index}].titles[${titleIndex}]._description`}
                        className="block text-sm font-medium text-gray-700"
                      >
                        Certification Title
                      </label>
                      <input
                        type="text"
                        name={`${path}[${index}].titles[${titleIndex}]._description`}
                        defaultValue={title._description}
                        placeholder="Title Description"
                        className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring focus:ring-blue-400 transition duration-150 ease-in-out"
                        onChange={(e) => {
                          if (
                            isValidValue(
                              `${path}[${index}].titles[${titleIndex}]._description`,
                              e.target.value
                            )
                          ) {
                            onInputChange(
                              `${path}[${index}].titles[${titleIndex}]._description`,
                              e.target.value
                            );
                          }
                        }}
                        readOnly={isReadOnlyField("titles._description")}
                      />
                    </div>

                    <button
                      type="button"
                      className="col-span-2 col-start-3 md:col-span-2 py-2 px-3 text-xs bg-red-500 text-white rounded hover:bg-red-700 transition duration-200 ease-in-out"
                      onClick={() =>
                        onRemoveEntry(`${path}[${index}].titles`, titleIndex)
                      }
                    >
                      Remove Title
                    </button>
                  </div>
                )
              )}

              <div className="flex">
                <button
                  type="button"
                  className="py-2 px-3 text-xs bg-blue-500 text-xs bg-blue-500 text-white font-medium rounded hover:bg-blue-600 transition duration-150 self-start"
                  onClick={() =>
                    onAddEntry(
                      `${path}[${index}].titles`,
                      getDefaultNewItem("titles")
                    )
                  }
                >
                  Add Title
                </button>
              </div>

              {/* <div className="flex flex-col space-y-2  p-2 rounded-lg shadow">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Enter titles separated by commas"
                  className="p-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-400 transition duration-150"
                />
                <button
                  type="button"
                  className="py-1 px-2 text-xs bg-blue-500 text-white font-medium rounded hover:bg-blue-600 transition duration-150"
                  onClick={parseTitles}
                >
                  Parse Titles
                </button>
              </div> */}
            </div>

            <button
              type="button"
              className="py-1 px-2 bg-red-500 text-white rounded hover:bg-red-600 transition duration-150"
              onClick={() => onRemoveEntry(path, index)}
            >
              Remove Certification
            </button>
          </div>
        );
      })}
      <button
        type="button"
        className="py-1 px-3 bg-green-500 text-white rounded hover:bg-green-600 transition duration-150 mt-2"
        onClick={() => onAddEntry(path, getDefaultNewItem("certifications"))}
      >
        Add New Certification
      </button>
    </div>
  );
};

const RenderExperiences = ({
  data,
  onInputChange,
  onAddEntry,
  onRemoveEntry,
  isValidValue,
  isReadOnlyField,
  path,
  getDefaultNewItem,
  formInfo,
}: FormProps) => {
  const { debounce } = pkg;

  const [isCurrent, setIsCurrent] = useState(false);
  const [logoUrl, setLogoUrl] = useState("");

  return (
    <div key={path} className="p-4 bg-gray-100 rounded-lg mb-4 shadow-sm">
      <strong className="block font-semibold text-gray-800 text-lg mb-4">
        Experiences
      </strong>
      {data.map((experience: ExperienceType, index: number) => {
        const handleLogoChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
          const selectedLogoId = e.target.value;
          const selectedLogo = formInfo.logos.find(
            (logo) => logo.logo_id.toString() === selectedLogoId
          );
          if (selectedLogo) {
            setLogoUrl(selectedLogo._url); // Update logo URL state
            onInputChange(
              `${path}[${index}].logo.logo_id`,
              selectedLogo.logo_id
            );
          }
        };

        // Helper to format date as YYYY-MM-DD
        const formatDateForInput = (date: Date) => {
          return date.toISOString().slice(0, 10); // Extract 'YYYY-MM-DD' from the ISO string
        };

        // Set default start and end dates
        const defaultStartDate = experience.startDate
          ? formatDateForInput(new Date(experience.startDate))
          : formatDateForInput(new Date());
        const defaultEndDate = experience.endDate
          ? formatDateForInput(new Date(experience.endDate))
          : formatDateForInput(new Date());

        // Handle changes to the "Current" checkbox
        const handleCurrentChange = (
          e: React.ChangeEvent<HTMLInputElement>
        ) => {
          setIsCurrent(e.target.checked);
          onInputChange(
            `${path}[${index}].endDate`,
            e.target.checked ? null : formatDateForInput(new Date())
          );
        };

        return (
          <div
            key={experience.experience_id}
            className="space-y-4 p-4 rounded-lg mb-4  shadow"
          >
            <div className="md:grid md:grid-cols-2 md:gap-4">
              <div className="flex flex-col">
                <label
                  htmlFor={`job-title-${index}`}
                  className="block text-sm font-medium text-gray-700"
                >
                  Job Title
                </label>

                <input
                  id={`job-title-${index}`}
                  type="text"
                  name={`${path}[${index}].job_title`}
                  defaultValue={experience.job_title}
                  placeholder="Job Title"
                  className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                  onChange={(e) =>
                    onInputChange(`${path}[${index}].job_title`, e.target.value)
                  }
                  readOnly={isReadOnlyField(`${path}[${index}].job_title`)}
                />
              </div>

              <div className="flex flex-col">
                <label
                  htmlFor={`company-${index}`}
                  className="block text-sm font-medium text-gray-700"
                >
                  Company
                </label>

                <input
                  id={`company-${index}`}
                  type="text"
                  name={`${path}[${index}].company`}
                  defaultValue={experience.company}
                  placeholder="Company"
                  className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                  onChange={(e) =>
                    onInputChange(`${path}[${index}].company`, e.target.value)
                  }
                  readOnly={isReadOnlyField(`${path}[${index}].company`)}
                />
              </div>
            </div>

            <div className="md:grid md:grid-cols-3 md:gap-4">
              <div className="flex flex-col ">
                <label
                  htmlFor={`start-date-${index}`}
                  className="block text-sm font-medium text-gray-700"
                >
                  Start Date
                </label>
                <input
                  id={`start-date-${index}`}
                  type="date"
                  name={`${path}[${index}].startDate`}
                  value={defaultStartDate}
                  className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                  onChange={(e) =>
                    onInputChange(`${path}[${index}].startDate`, e.target.value)
                  }
                  readOnly={isReadOnlyField(`${path}[${index}].startDate`)}
                />
              </div>

              {!isCurrent && (
                <div className="flex flex-col ">
                  <label
                    htmlFor={`end-date-${index}`}
                    className="block text-sm font-medium text-gray-700"
                  >
                    End Date
                  </label>
                  <input
                    id={`end-date-${index}`}
                    type="date"
                    name={`${path}[${index}].endDate`}
                    value={defaultEndDate}
                    className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                    onChange={(e) =>
                      onInputChange(`${path}[${index}].endDate`, e.target.value)
                    }
                    readOnly={isReadOnlyField(`${path}[${index}].endDate`)}
                  />
                </div>
              )}

              <div className="flex m-4 items-end">
                <label className="relative inline-block w-12 mr-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={isCurrent}
                    onChange={handleCurrentChange}
                    className="opacity-0 absolute w-0 h-0"
                  />
                  <span
                    className={`block overflow-hidden h-6 rounded-full transition duration-300 ease-in-out ${
                      isCurrent ? "bg-blue-500" : "bg-gray-300"
                    }`}
                  >
                    <span
                      className={`absolute left-0 top-0 w-6 h-6 transition-transform transform  rounded-full shadow ${
                        isCurrent ? "translate-x-6" : "translate-x-0"
                      }`}
                      style={{ bottom: "1px" }}
                    ></span>
                  </span>
                </label>
                <span className="text-sm text-gray-600 cursor-pointer select-none">
                  Current
                </span>
              </div>
            </div>

            <div className="flex-grow space-y-2">
              <select
                name={`${path}[${index}].logo_id`}
                defaultValue={
                  experience.logo.logo_id ? experience.logo.logo_id : 22
                }
                className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                onChange={handleLogoChange}
              >
                {formInfo.logos.map((logo) => (
                  <option key={logo.logo_id} value={logo.logo_id}>
                    {logo._title}
                  </option>
                ))}
              </select>

              {logoUrl && (
                <div className="w-24 h-24 bg-gray-200 rounded overflow-hidden">
                  <img src={logoUrl} className="w-full h-full object-contain" />
                </div>
              )}
            </div>

            <div className="space-y-4 p-4 flex flex-col rounded-lg shadow-inner">
              <strong className="text-gray-800 font-semibold">Duties:</strong>
              {experience.duties.map((duty, dutyIndex) => (
                <div
                  key={duty.duty_id}
                  className="grid grid-cols-4 md:grid-cols-12 gap-4 bg-gray-50 p-3 rounded-lg"
                >
                  <div className="col-span-4 md:col-span-10 p-2 border border-gray-300 rounded focus:outline-none focus:ring focus:ring-blue-400 transition duration-150 ease-in-out">
                    <label
                      htmlFor={`duty-description-${index}`}
                      className="block text-sm font-medium text-gray-700"
                    >
                      Job Description
                    </label>
                    <textarea
                      name={`${path}[${index}].duties[${dutyIndex}]._description`}
                      defaultValue={duty._description}
                      placeholder="Duty Description"
                      className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring focus:ring-blue-400 transition duration-150 ease-in-out"
                      onChange={(e) =>
                        onInputChange(
                          `${path}[${index}].duties[${dutyIndex}]._description`,
                          e.target.value
                        )
                      }
                      readOnly={isReadOnlyField("duties._description")}
                    />
                  </div>

                  <button
                    type="button"
                    className="col-span-2 col-start-3 md:col-span-2 py-2 px-3 text-xs bg-red-500 text-white rounded hover:bg-red-700 transition duration-200 ease-in-out"
                    onClick={() =>
                      onRemoveEntry(`${path}[${index}].duties`, dutyIndex)
                    }
                  >
                    Remove Duty
                  </button>
                </div>
              ))}
              <button
                type="button"
                className="py-2 px-3 text-xs bg-blue-500 text-white rounded hover:bg-blue-700 transition duration-200 ease-in-out self-start"
                onClick={() =>
                  onAddEntry(
                    `${path}[${index}].duties`,
                    getDefaultNewItem("duties")
                  )
                }
              >
                Add Duty
              </button>
            </div>

            <button
              type="button"
              className="py-1 px-2 w-full bg-red-500 text-white rounded hover:bg-red-600 transition duration-150"
              onClick={() => onRemoveEntry(path, index)}
            >
              Remove Experience
            </button>
          </div>
        );
      })}
      <button
        type="button"
        className="w-full py-2 px-4 bg-green-500 text-white rounded hover:bg-green-700 transition duration-150 mt-4"
        onClick={() => onAddEntry(path, getDefaultNewItem("experiences"))}
      >
        Add New Experience
      </button>
    </div>
  );
};

const RenderSkills = ({
  data,
  onInputChange,
  onAddEntry,
  onRemoveEntry,
  isValidValue,
  isReadOnlyField,
  path,
  getDefaultNewItem,
}: FormProps) => {


console.log(data)

  return (
    <div
      key={path}
      className="p-4 bg-gray-100 rounded mb-2 grid grid-cols-1 gap-4"
    >
      <strong className="font-semibold text-gray-800">Skills</strong>
      {data.map((skill: SkillType, index: number) => (
        <div key={skill.skill_id} className="flex flex-col space-y-4">
          <label
            htmlFor={`${path}[${index}].skill_name`}
            className="block text-sm font-medium text-gray-700"
          >
            Skill Name
          </label>
          <input
            type="text"
            name={`${path}[${index}].skill_name`}
            defaultValue={skill.skill_name}
            placeholder="Skill Name"
            className="p-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500 focus:ring focus:ring-blue-200 transition duration-150 ease-in-out w-full"
            onChange={(e) => {
              if (
                isValidValue(`${path}[${index}].skill_name`, e.target.value)
              ) {
                onInputChange(`${path}[${index}].skill_name`, e.target.value);
              }
            }}
            readOnly={isReadOnlyField("skill_name")}
          />

          <div className=" p-4 rounded-lg shadow-md flex flex-col">
            <strong className="text-sm text-gray-800 font-semibold">
              Subskills:
            </strong>

            {skill.subskills.map((subskill, subskillIndex) => (
              <div
                key={subskill.subskill_id}
                className="grid grid-cols-12 gap-2 items-center bg-gray-50 p-3 rounded-lg"
              >
                <input
                  type="text"
                  name={`${path}[${index}].subskills[${subskillIndex}].subskill_name`}
                  defaultValue={subskill.subskill_name}
                  placeholder="Subskill Name"
                  className="col-span-8 md:col-span-9 p-2 border border-gray-300 rounded focus:outline-none focus:ring focus:ring-blue-400 transition duration-150 ease-in-out"
                  onChange={(e) => {
                    if (
                      isValidValue(
                        `${path}[${index}].subskills[${subskillIndex}].subskill_name`,
                        e.target.value
                      )
                    ) {
                      onInputChange(
                        `${path}[${index}].subskills[${subskillIndex}].subskill_name`,
                        e.target.value
                      );
                    }
                  }}
                  readOnly={isReadOnlyField("subskill_name")}
                />

                <input
                  type="number"
                  min="0"
                  max="99"
                  name={`${path}[${index}].subskills[${subskillIndex}].years_experience`}
                  defaultValue={subskill.years_experience}
                  placeholder="Years"
                  className="col-span-2 md:col-span-2 p-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500 focus:ring focus:ring-blue-200 transition duration-150 ease-in-out"
                  onChange={(e) => {
                    if (
                      isValidValue(
                        `${path}[${index}].subskills[${subskillIndex}].years_experience`,
                        e.target.value
                      )
                    ) {
                      onInputChange(
                        `${path}[${index}].subskills[${subskillIndex}].years_experience`,
                        parseInt(e.target.value)
                      );
                    }
                  }}
                />

                <button
                  type="button"
                  className="col-span-2 md:col-span-1 py-1 px-2 text-xs bg-red-500 text-white font-medium rounded hover:bg-red-700 transition duration-200 ease-in-out"
                  onClick={() =>
                    onRemoveEntry(`${path}[${index}].subskills`, subskillIndex)
                  }
                >
                  Remove Subskill
                </button>
              </div>
            ))}

            <button
              type="button"
              className="py-2 px-3 text-xs bg-blue-500 text-xs bg-blue-500 text-white font-medium rounded hover:bg-blue-700 transition duration-200 ease-in-out self-start"
              onClick={() =>
                onAddEntry(
                  `${path}[${index}].subskills`,
                  getDefaultNewItem("subskills")
                )
              }
            >
              Add Subskill
            </button>
          </div>

          <button
            type="button"
            className="py-1 px-2 bg-red-500 text-white rounded hover:bg-red-700 transition duration-200 ease-in-out"
            onClick={() => onRemoveEntry(path, index)}
          >
            Remove Skill
          </button>
        </div>
      ))}
      <button
        type="button"
        className="py-1 px-3 bg-green-500 text-white rounded hover:bg-green-600 transition duration-150 mt-2"
        onClick={() => onAddEntry(path, getDefaultNewItem("skills"))}
      >
        Add New Skill
      </button>
    </div>
  );
};

export {
  RenderBasicInfo,
  RenderLocations,
  RenderClearances,
  RenderCertifications,
  RenderEducations,
  RenderExperiences,
  RenderSkills,
};
