// DualCitizenship.tsx
import { ChangeEvent } from "react";
import { useForm } from "./formContext"; // Adjust the import path to where your FormContext is located
import Section1 from "./duel_citizenship/1";
import { DualCitizenshipFormData } from "api_v2/interfaces/DuelCitizenship";
import Section2 from "./duel_citizenship/2";

const DualCitizenship = () => {
  const { formData, setFormData } = useForm(); // Use generic to ensure type safety

  const updateForm = (field: keyof DualCitizenshipFormData, value: boolean) => {
    const updatedFormData = {
      ...formData,
      duelCitizenshipInfo: {
        ...formData.duelCitizenshipInfo,
        [field]: value,
      },
    };

    setFormData(updatedFormData);
  };

  const handleCheckboxChange =
    (field: keyof DualCitizenshipFormData) =>
    (event: ChangeEvent<HTMLInputElement>) => {
      updateForm(field, event.target.checked);
    };

  return (
    <div>
      <div>
        <label>
          <input
            type="checkbox"
            checked={formData.duelCitizenshipInfo.heldMultipleCitizenships}
            onChange={handleCheckboxChange("heldMultipleCitizenships")}
          />
          Do you now or have you EVER held dual/multiple citizenships?
        </label>
      </div>

      {formData.duelCitizenshipInfo.heldMultipleCitizenships && <Section1 />}

      <div>
        <label>
          <input
            type="checkbox"
            checked={formData.duelCitizenshipInfo.hadNonUSPassport}
            onChange={handleCheckboxChange("hadNonUSPassport")}
          />
          Have you EVER been issued a passport (or identity card for travel) by
          a country other than the U.S.?
        </label>
      </div>

      {formData.duelCitizenshipInfo.hadNonUSPassport && <Section2 />}

    </div>
  );
};

export default DualCitizenship;
