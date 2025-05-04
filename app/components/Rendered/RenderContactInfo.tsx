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
            defaultValue={data.homeEmail || ""}
            onChange={(e) => onInputChange(`${path}.homeEmail`, e.target.value)}
            className="mt-1 p-2 w-full border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
            readOnly={isReadOnlyField(`${path}.homeEmail`)}
          />
        </label>
        <label className="block">
          Work e-mail address:
          <input
            type="email"
            defaultValue={data.workEmail || ""}
            onChange={(e) => onInputChange(`${path}.workEmail`, e.target.value)}
            className="mt-1 p-2 w-full border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
            readOnly={isReadOnlyField(`${path}.workEmail`)}
          />
        </label>
      </div>

      {/* Contact Numbers */}
      {data.contactNumbers.map((contact, index) => (
        
        <div key={index} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label className="block col-span-1">
            {contact.numberType} telephone number:
            <input
              type="tel"
              defaultValue={contact.phoneNumber || ""}
              onChange={(e) =>
                onInputChange(
                  `${path}.contactNumbers[${index}].phoneNumber`,
                  e.target.value
                )
              }
              className="mt-1 p-2 w-full border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
              readOnly={isReadOnlyField(
                `${path}.contactNumbers[${index}].phoneNumber`
              )}
            />
          </label>
          <label className="block col-span-1">
            Extension:
            <input
              type="text"
              defaultValue={contact.phoneExtension || ""}
              onChange={(e) =>
                onInputChange(
                  `${path}.contactNumbers[${index}].phoneExtension`,
                  e.target.value
                )
              }
              className="mt-1 p-2 w-full border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
              readOnly={isReadOnlyField(
                `${path}.contactNumbers[${index}].phoneExtension`
              )}
            />
          </label>
          <div className="col-span-1 md:col-span-2 grid grid-cols-2 gap-4">
            <label className="inline-flex items-center">
              <input
                type="checkbox"
                defaultChecked={contact.isUsableDay}
                onChange={(e) =>
                  onInputChange(
                    `${path}.contactNumbers[${index}].isUsableDay`,
                    e.target.checked
                  )
                }
                className="form-checkbox h-5 w-5 text-blue-600"
              />
              <span className="ml-2">Usable Day</span>
            </label>
            <label className="inline-flex items-center">
              <input
                type="checkbox"
                defaultChecked={contact.isUsableNight}
                onChange={(e) =>
                  onInputChange(
                    `${path}.contactNumbers[${index}].isUsableNight`,
                    e.target.checked
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
          >
            Remove Contact
          </button>

          <button
            type="button"
            onClick={(event) =>{
              event.preventDefault();
              onAddEntry(
                `${path}.contactNumbers`,
                getDefaultNewItem("contactInfo.contactNumbers")
              )
            }}
            className="py-2 px-4 bg-green-500 text-white rounded hover:bg-green-600 transition duration-150"
          >
            Add New Contact
          </button>
        </div>
      ))}
    </div>
  );
};

export { RenderContactInfo };
