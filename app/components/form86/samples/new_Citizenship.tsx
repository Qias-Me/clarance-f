import { ChangeEvent } from "react";
import { useForm } from "../samples/formContext"; // Update the import path to where your FormContext is located
import CitizenshipStatusOne from "./citizenship/1";
import CitizenshipStatusTwo from "./citizenship/2";
import CitizenshipStatusThree from "./citizenship/3";
import CitizenshipStatusFour from "./citizenship/4";
// import CitizenshipStatusFour from './citizenship/4';

const CitizenshipInfoComponent = () => {
  const { formData, setFormData } = useForm();

  const handleStatusChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const newStatus = event.target
      .value as typeof formData.citizenshipInfo.citizenship_status_code;

    // Logic to update citizenship status and potentially reset details
    let detailsUpdate;
    if (newStatus === "birth") {
      detailsUpdate = formData.citizenshipInfo.details;
    } else {
      detailsUpdate = undefined; // or suitable defaults for other statuses
    }

    setFormData({
      ...formData,
      citizenshipInfo: {
        ...formData.citizenshipInfo,
        citizenship_status_code: newStatus,
        details: detailsUpdate,
      },
    });
  };

  return (
    <section className="p-5 text-center text-sm-start">
      <div className="container">
        <div>
          <label htmlFor="citizenshipStatus">Citizenship Status:</label>
          <select
            id="citizenshipStatus"
            value={formData.citizenshipInfo.citizenship_status_code}
            onChange={handleStatusChange}
          >
            <option value="none">Select Status</option>
            <option value="citizen">U.S Born</option>
            <option value="birth">U.S. Citizen Born Abroad</option>
            <option value="naturalized">
              I am a naturalized U.S. citizen.
            </option>
            <option value="derived">I am a derived U.S. citizen.</option>
            <option value="nonCitizen">I am not a U.S. citizen.</option>
          </select>
        </div>

        {formData.citizenshipInfo.citizenship_status_code === "birth" && (
          <CitizenshipStatusOne />
        )}
        {formData.citizenshipInfo.citizenship_status_code === "naturalized" && (
          <CitizenshipStatusTwo />
        )}
        {formData.citizenshipInfo.citizenship_status_code === "derived" && (
          <CitizenshipStatusThree />
        )}
        {formData.citizenshipInfo.citizenship_status_code === "nonCitizen" && (
          <CitizenshipStatusFour />
        )}
      </div>
    </section>
  );
};

export default CitizenshipInfoComponent;
