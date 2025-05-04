import { type NamesInfo } from "../../../api/interfaces/sections/namesInfo";

interface FormProps {
  data: NamesInfo;
  onInputChange: (path: string, value: any) => void;
  onAddEntry: (path: string, newItem: any) => void;
  onRemoveEntry: (path: string, index: number) => void;
  isValidValue: (path: string, value: any) => boolean;
  getDefaultNewItem: (itemType: string) => any;
  isReadOnlyField: (fieldName: string) => boolean;
  path: string;
}

const RenderNames = ({
  data,
  onInputChange,
  onAddEntry,
  onRemoveEntry,
  isValidValue,
  getDefaultNewItem,
  isReadOnlyField,
  path,
}: FormProps) => {

  
  const handleHasNamesChange = (checked) => {
    onInputChange(`${path}.hasNames`, checked);

    if (checked && data.names.length === 0) {
      onAddEntry(`${path}.names`, getDefaultNewItem("names"));
    }
  };

  return (
    <div className="p-4 bg-gray-100 rounded mb-2 grid grid-cols-1 gap-4">
      <div className="flex justify-between items-center">
        <strong className="font-semibold text-gray-800 text-lg md:text-lg">
         Section 5
        </strong>
        <label className="flex items-center space-x-2">
          <span className="text-sm text-gray-700">Has Names:</span>
          <input
            type="checkbox"
            checked={data.hasNames}
            onChange={(e) => handleHasNamesChange(e.target.checked)}
            className="form-checkbox h-5 w-5 text-blue-600"
          />
        </label>
      </div>
      {data.hasNames && (
        <div className="space-y-6">
          {data.names.map((name, index) => (
            <div key={index} className="p-6  shadow-md rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-6 gap-6 items-start">
                {/** Text Inputs with more padding and subtle shadow */}
                <input
                  type="text"
                  value={name.firstName}
                  onChange={(e) =>
                    onInputChange(
                      `${path}.names[${index}].firstName`,
                      e.target.value
                    )
                  }
                  placeholder="First Name"
                  className="col-span-2 p-3 border border-gray-300 rounded shadow-sm"
                  readOnly={isReadOnlyField("firstName")}
                />
                <input
                  type="text"
                  value={name.lastName}
                  onChange={(e) =>
                    onInputChange(
                      `${path}.names[${index}].lastName`,
                      e.target.value
                    )
                  }
                  placeholder="Last Name"
                  className="col-span-2 p-3 border border-gray-300 rounded shadow-sm"
                  readOnly={isReadOnlyField("lastName")}
                />
                <input
                  type="text"
                  value={name.middleName}
                  onChange={(e) =>
                    onInputChange(
                      `${path}.names[${index}].middleName`,
                      e.target.value
                    )
                  }
                  placeholder="Middle Name"
                  className="col-span-2 p-3 border border-gray-300 rounded shadow-sm"
                  readOnly={isReadOnlyField("middleName")}
                />
                <input
                  type="text"
                  value={name.suffix}
                  onChange={(e) =>
                    onInputChange(
                      `${path}.names[${index}].suffix`,
                      e.target.value
                    )
                  }
                  placeholder="Suffix"
                  className="md:col-span-1 p-3 border border-gray-300 rounded shadow-sm"
                  readOnly={isReadOnlyField("suffix")}
                />

                {/** Redesigned compact checkbox layout */}
                <div className="md:col-span-1 flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={name.isNamePresent}
                    onChange={(e) =>
                      onInputChange(
                        `${path}.names[${index}].isNamePresent`,
                        e.target.checked
                      )
                    }
                    className="form-checkbox h-4 w-4 text-blue-600 align-middle"
                  />
                  <label className="text-gray-700">Present</label>
                </div>
                <div className="md:col-span-1 flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={name.isStartDateEst}
                    onChange={(e) =>
                      onInputChange(
                        `${path}.names[${index}].isStartDateEst`,
                        e.target.checked
                      )
                    }
                    className="form-checkbox h-4 w-4 text-blue-600 align-middle"
                  />
                  <label className="text-gray-700">Est.</label>
                </div>
                <div className="md:col-span-1 flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={name.isEndDateEst}
                    onChange={(e) =>
                      onInputChange(
                        `${path}.names[${index}].isEndDateEst`,
                        e.target.checked
                      )
                    }
                    className="form-checkbox h-4 w-4 text-blue-600 align-middle"
                  />
                  <label className="text-gray-700">Est.</label>
                </div>
                <div className="md:col-span-1 flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={name.isMaidenName}
                    onChange={(e) =>
                      onInputChange(
                        `${path}.names[${index}].isMaidenName`,
                        e.target.checked
                      )
                    }
                    className="form-checkbox h-4 w-4 text-blue-600 align-middle"
                  />
                  <label className="text-gray-700">Maiden Name</label>
                </div>

                <input
                  type="text"
                  value={name.reasonChanged}
                  onChange={(e) =>
                    onInputChange(
                      `${path}.names[${index}].reasonChanged`,
                      e.target.value
                    )
                  }
                  placeholder="Reason for Change"
                  className="md:col-span-3 p-3 border border-gray-300 rounded shadow-sm"
                  readOnly={isReadOnlyField("reasonChanged")}
                />
              </div>
              <button
                type="button"
                onClick={() => onRemoveEntry(`${path}.names`, index)}
                className="mt-4 py-2 px-4 bg-red-500 text-white rounded hover:bg-red-700 transition duration-150"
              >
                Remove Name
              </button>
            </div>
          ))}
        </div>
      )}

      {data.hasNames && (
        <button
          type="button"
          onClick={() =>
            onAddEntry(`${path}.names`, getDefaultNewItem("names"))
          }
          className="py-1 px-3 bg-green-500 text-white rounded hover:bg-green-600 transition duration-150 mt-2"
        >
          Add New Name
        </button>
      )}
    </div>
  );
};

export { RenderNames };
