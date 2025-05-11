import {
  type ContactInfo,
} from "api/interfaces/sections/contact"; // Ensure the path and exports are correct

interface FormProps {
  data: ContactInfo;
  onInputChange: (path: string, value: any) => void;
  onAddEntry: (path: string, newItem: any) => void; // Adds a new item
  onRemoveEntry: (path: string, index: number) => void; // Removes an item
  getDefaultNewItem: (itemType: string) => any;
  isReadOnlyField: (fieldName: string) => boolean;
  path: string;
}

const RenderContactInfo = ({
  data,
  onInputChange,
  onAddEntry,
  onRemoveEntry,
  getDefaultNewItem,
  isReadOnlyField,
  path,
}: FormProps) => {
  // Initialize with one contact number if none exist
  if (!data.contactNumbers || data.contactNumbers.length === 0) {
    // Add default first contact entry
    const defaultContact = getDefaultNewItem("contactInfo.contactNumbers");
    onAddEntry(`${path}.contactNumbers`, defaultContact);
  }

  // Check if we've reached the maximum allowed contacts (3)
  const hasMaxContacts = data.contactNumbers && data.contactNumbers.length >= 3;

  return (
    <div className="p-4 bg-gray-100 rounded mb-2 grid grid-cols-1 gap-4">
      <h3 className="font-semibold text-gray-800 text-lg">
        Section 7 - Your Contact Information
      </h3>

      {/* Home and Work Email Addresses */}
      <div className="grid grid-cols-2 gap-4">
        <label className="block">
          Home e-mail address:
          <input
            type="email"
            defaultValue={data.homeEmail.value || ""}
            onChange={(e) => onInputChange(`${path}.homeEmail.value`, e.target.value)}
            className="mt-1 p-2 w-full border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
            readOnly={isReadOnlyField(`${path}.homeEmail.value`)}
          />
        </label>
        <label className="block">
          Work e-mail address:
          <input
            type="email"
            defaultValue={data.workEmail.value || ""}
            onChange={(e) => onInputChange(`${path}.workEmail.value`, e.target.value)}
            className="mt-1 p-2 w-full border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
            readOnly={isReadOnlyField(`${path}.workEmail.value`)}
          />
        </label>
      </div>

      {/* Contact Numbers */}
      {data.contactNumbers && data.contactNumbers.map((contact, index) => (
        <div key={index} className="p-4 border border-gray-200 rounded-lg shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="block col-span-1">
              {contact.numberType.value} telephone number:
              <input
                type="tel"
                defaultValue={contact.phoneNumber.value || ""}
                onChange={(e) =>
                  onInputChange(
                    `${path}.contactNumbers[${index}].phoneNumber.value`,
                    e.target.value
                  )
                }
                className="mt-1 p-2 w-full border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
                readOnly={isReadOnlyField(
                  `${path}.contactNumbers[${index}].phoneNumber.value`
                )}
              />
            </label>
            <label className="block col-span-1">
              Extension:
              <input
                type="text"
                defaultValue={contact.extension.value || ""}
                onChange={(e) =>
                  onInputChange(
                    `${path}.contactNumbers[${index}].extension.value`,
                    e.target.value
                  )
                }
                className="mt-1 p-2 w-full border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
                readOnly={isReadOnlyField(
                  `${path}.contactNumbers[${index}].extension.value`
                )}
              />
            </label>
            <div className="col-span-1 md:col-span-2 grid grid-cols-2 gap-4">
              <label className="inline-flex items-center">
                <input
                  type="checkbox"
                  defaultChecked={contact.isUsableDay.value === "YES"}
                  onChange={(e) =>
                    onInputChange(
                      `${path}.contactNumbers[${index}].isUsableDay.value`,
                      e.target.checked ? "YES" : "NO"
                    )
                  }
                  className="form-checkbox h-5 w-5 text-blue-600"
                />
                <span className="ml-2">Usable Day</span>
              </label>
              <label className="inline-flex items-center">
                <input
                  type="checkbox"
                  defaultChecked={contact.isUsableNight.value === "YES"}
                  onChange={(e) =>
                    onInputChange(
                      `${path}.contactNumbers[${index}].isUsableNight.value`,
                      e.target.checked ? "YES" : "NO"
                    )
                  }
                  className="form-checkbox h-5 w-5 text-blue-600"
                />
                <span className="ml-2">Usable Night</span>
              </label>
            </div>
            <button
              type="button"
              onClick={() => onRemoveEntry(`${path}.contactNumbers`, index)}
              className="py-2 px-4 bg-red-500 text-white rounded hover:bg-red-700 transition duration-150"
              disabled={data.contactNumbers.length <= 1}
            >
              Remove Contact
            </button>
          </div>
        </div>
      ))}

      {/* Add New Contact button - only show if under max limit */}
      {!hasMaxContacts && (
        <button
          type="button"
          onClick={() => onAddEntry(
            `${path}.contactNumbers`,
            getDefaultNewItem("contactInfo.contactNumbers")
          )}
          className="py-2 px-4 bg-green-500 text-white rounded hover:bg-green-600 transition duration-150"
        >
          Add New Contact
        </button>
      )}

      {hasMaxContacts && (
        <div className="text-sm text-gray-600 italic">
          Maximum of 3 contact numbers reached
        </div>
      )}
    </div>
  );
};

export { RenderContactInfo };
