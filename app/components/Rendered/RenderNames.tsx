import {
  type ApplicantNames,
  type NamesInfo,
} from "../../../api/interfaces/sections/namesInfo";
import { namesInfo as namesInfoContext } from "../../../app/state/contexts/sections/namesInfo";

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
  const handleHasNamesChange = (checked: boolean) => {
    const currentNames = [];
    const nextIndex = currentNames.length;

    if (
      namesInfoContext &&
      namesInfoContext.names &&
      nextIndex < namesInfoContext.names.length
    ) {
      // If we have a predefined name for this index, add it
      currentNames.push(namesInfoContext.names[nextIndex]);
      // Replace the entire names array
      onInputChange(`${path}.names`, currentNames);
    }

    onInputChange(`${path}.hasNames.value`, checked ? "YES" : "NO");

    if (checked && (!data.names || data.names.length === 0)) {
      // Get default names from context or fallback to template
      const templateNames = getDefaultNewItem("names");
      onAddEntry(`${path}.names`, templateNames);
    }
  };

  const hasMaxNames = data.names && data.names.length >= 4;

  const handleAddName = () => {
    // When adding a new name, we need to find the right template and add it to the existing names
    if (!data.names || data.names.length === 0) {
      // Get the current length and use it to determine which pre-defined name to add next
      const currentNames = [];
      const nextIndex = currentNames.length;

      if (
        namesInfoContext &&
        namesInfoContext.names &&
        nextIndex < namesInfoContext.names.length
      ) {
        // If we have a predefined name for this index, add it
        currentNames.push(namesInfoContext.names[nextIndex]);
        // Replace the entire names array
        onInputChange(`${path}.names`, currentNames);
      }
    } else {
      // Get the current length and use it to determine which pre-defined name to add next
      const currentNames = [...data.names];
      const nextIndex = currentNames.length;

      if (
        namesInfoContext &&
        namesInfoContext.names &&
        nextIndex < namesInfoContext.names.length
      ) {
        // If we have a predefined name for this index, add it
        currentNames.push(namesInfoContext.names[nextIndex]);
        // Replace the entire names array
        onInputChange(`${path}.names`, currentNames);
      }
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
            checked={data.hasNames.value === "YES"}
            onChange={(e) => handleHasNamesChange(e.target.checked)}
            className="form-checkbox h-5 w-5 text-blue-600"
          />
        </label>
      </div>
      {data.hasNames && (
        <div className="space-y-6">
          {data.names?.map((name: ApplicantNames, index: number) => (
            <div key={index} className="p-6  shadow-md rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-6 gap-6 items-start">
                {/** Text Inputs with more padding and subtle shadow */}
                <input
                  type="text"
                  value={name.firstName.value}
                  onChange={(e) =>
                    onInputChange(
                      `${path}.names[${index}].firstName.value`,
                      e.target.value
                    )
                  }
                  placeholder="First Name"
                  className="col-span-2 p-3 border border-gray-300 rounded shadow-sm"
                  readOnly={isReadOnlyField("firstName")}
                />
                <input
                  type="text"
                  value={name.lastName.value}
                  onChange={(e) =>
                    onInputChange(
                      `${path}.names[${index}].lastName.value`,
                      e.target.value
                    )
                  }
                  placeholder="Last Name"
                  className="col-span-2 p-3 border border-gray-300 rounded shadow-sm"
                  readOnly={isReadOnlyField("lastName")}
                />
                <input
                  type="text"
                  value={name.middleName.value}
                  onChange={(e) =>
                    onInputChange(
                      `${path}.names[${index}].middleName.value`,
                      e.target.value
                    )
                  }
                  placeholder="Middle Name"
                  className="col-span-2 p-3 border border-gray-300 rounded shadow-sm"
                  readOnly={isReadOnlyField("middleName")}
                />
                <input
                  type="text"
                  value={name.suffix.value}
                  onChange={(e) =>
                    onInputChange(
                      `${path}.names[${index}].suffix.value`,
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
                    checked={name.endDate.isPresent?.value === "YES"}
                    onChange={(e) =>
                      onInputChange(
                        `${path}.names[${index}].endDate.isPresent.value`,
                        e.target.checked ? "YES" : "NO"
                      )
                    }
                    className="form-checkbox h-4 w-4 text-blue-600 align-middle"
                  />
                  <label className="text-gray-700">Present</label>
                </div>
                <div className="md:col-span-1 flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={name.startDate.estimated?.value === "YES"}
                    onChange={(e) =>
                      onInputChange(
                        `${path}.names[${index}].startDate.estimated.value`,
                        e.target.checked ? "YES" : "NO"
                      )
                    }
                    className="form-checkbox h-4 w-4 text-blue-600 align-middle"
                  />
                  <label className="text-gray-700">Est.</label>
                </div>
                <div className="md:col-span-1 flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={name.endDate.estimated?.value === "YES"}
                    onChange={(e) =>
                      onInputChange(
                        `${path}.names[${index}].endDate.estimated.value`,
                        e.target.checked ? "YES" : "NO"
                      )
                    }
                    className="form-checkbox h-4 w-4 text-blue-600 align-middle"
                  />
                  <label className="text-gray-700">Est.</label>
                </div>
                <div className="md:col-span-1 flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={name.isMaidenName.value === "YES"}
                    onChange={(e) =>
                      onInputChange(
                        `${path}.names[${index}].isMaidenName.value`,
                        e.target.checked ? "YES" : "NO"
                      )
                    }
                    className="form-checkbox h-4 w-4 text-blue-600 align-middle"
                  />
                  <label className="text-gray-700">Maiden Name</label>
                </div>

                <input
                  type="text"
                  value={name.reasonChanged.value}
                  onChange={(e) =>
                    onInputChange(
                      `${path}.names[${index}].reasonChanged.value`,
                      e.target.value
                    )
                  }
                  placeholder="Reason for Change"
                  className="md:col-span-3 p-3 border border-gray-300 rounded shadow-sm"
                  readOnly={isReadOnlyField("reasonChanged.value")}
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

      {data.hasNames && !hasMaxNames && (
        <button
          type="button"
          onClick={handleAddName}
          className="py-1 px-3 bg-green-500 text-white rounded hover:bg-green-600 transition duration-150 mt-2"
        >
          Add New Name
        </button>
      )}

      {data.hasNames && hasMaxNames && (
        <div className="text-sm text-gray-600 italic mt-2">
          Maximum of 4 names reached
        </div>
      )}
    </div>
  );
};

export { RenderNames };
