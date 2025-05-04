import React from "react";
import { useForm } from "./formContext"; // Ensure the correct import path
import { ApplicantContactNumber } from "api_v2/interfaces/form3";

const ContactDetailsForm = () => {
  const { formData, setFormData } = useForm();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Handling input change for emails and checkboxes within contactInfo directly
    const { name, value, type, checked } = e.target;
    const finalValue = type === "checkbox" ? checked : value;

    setFormData({
      ...formData,
      contactInfo: {
        ...formData.contactInfo,
        [name]: finalValue,
      },
    });
  };

  const updateContactNumbers = (
    index: number,
    field: keyof ApplicantContactNumber,
    value: string | boolean
  ) => {
    // Updating nested contactNumbers within contactInfo
    const updatedContactNumbers = formData.contactInfo.contactNumbers.map(
      (contact, idx) =>
        idx === index ? { ...contact, [field]: value } : contact
    );

    setFormData({
      ...formData,
      contactInfo: {
        ...formData.contactInfo,
        contactNumbers: updatedContactNumbers,
      },
    });
  };

  const handleAddContactNumber = () => {
    // Adding a new contact number, ensuring not more than 3
    if (formData.contactInfo.contactNumbers.length < 3) {
      const newContactNumber: ApplicantContactNumber = {
        numberType: "Cell",
        phoneNumber: "",
        phoneExtension: "",
        isUsableDay: false,
        isUsableNight: false,
      };

      setFormData({
        ...formData,
        contactInfo: {
          ...formData.contactInfo,
          contactNumbers: [
            ...formData.contactInfo.contactNumbers,
            newContactNumber,
          ],
        },
      });
    }
  };

  return (
    <section>
      <div className="container">
        <p>Provide your contact information</p>

        {/* Email inputs */}
        <input
          type="text"
          name="homeEmail"
          value={formData.contactInfo.homeEmail || ""}
          onChange={handleInputChange}
          placeholder="Home Email"
        />
        <input
          type="text"
          name="workEmail"
          value={formData.contactInfo.workEmail || ""}
          onChange={handleInputChange}
          placeholder="Work Email"
        />

        {/* Dynamically rendered contact numbers */}
        {formData.contactInfo.contactNumbers.map((number, index) => (
          <div key={index}>
            
            {/* Select dropdown for numberType */}
            <select
              name="numberType"
              value={number.numberType || ""}
              onChange={(e) =>
                updateContactNumbers(index, "numberType", e.target.value)
              }
            >
              <option value="">Select Number Type</option>
              <option value="Home">Home</option>
              <option value="Work">Work</option>
              <option value="Cell">Cell</option>
            </select>

            {/* Phone number and extension inputs */}
            <input
              type="text"
              placeholder="Phone Number"
              value={number.phoneNumber || ""}
              onChange={(e) =>
                updateContactNumbers(index, "phoneNumber", e.target.value)
              }
            />
            <input
              type="text"
              placeholder="Extension"
              value={number.phoneExtension || ""}
              onChange={(e) =>
                updateContactNumbers(index, "phoneExtension", e.target.value)
              }
            />

            {/* Checkboxes for isUsableDay and isUsableNight */}
            <label>
              <input
                type="checkbox"
                checked={number.isUsableDay || false}
                onChange={(e) =>
                  updateContactNumbers(index, "isUsableDay", e.target.checked)
                }
              />
              Usable in Day
            </label>
            <label>
              <input
                type="checkbox"
                checked={number.isUsableNight || false}
                onChange={(e) =>
                  updateContactNumbers(index, "isUsableNight", e.target.checked)
                }
              />
              Usable at Night
            </label>
          </div>
        ))}

        {/* Button to add another contact number, if fewer than 3 */}
        {formData.contactInfo.contactNumbers.length < 3 && (
          <button type="button" onClick={handleAddContactNumber}>
            Add Another Contact Number
          </button>
        )}
      </div>
    </section>
  );
};

export default ContactDetailsForm;
