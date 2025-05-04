import React, { useState } from "react";
import { ApplicantNames } from "api_v2/interfaces/form2";

interface PersonalDetailsFormProps {
  updatePersonalInfo: (info: Partial<{ otherNames: ApplicantNames[] }>) => void;
}

const Alias: React.FC<PersonalDetailsFormProps> = ({ updatePersonalInfo }) => {
  const [otherNames, setOtherNames] = useState<ApplicantNames[]>([]);

  const handleAliasChange = (
    index: number,
    field: keyof ApplicantNames,
    value: string | boolean
  ) => {
    const updatedOtherNames = otherNames.map((name, idx) => {
      if (idx === index) {
        return { ...name, [field]: value };
      }
      return name;
    });
    setOtherNames(updatedOtherNames);
  };

  const handleAddAlias = () => {
    if (otherNames.length < 4) {
      const newAlias: ApplicantNames = {
        nameID: Date.now(), // Temporary ID, adjust according to your ID generation logic
        applicantID: 0, // Placeholder, adjust as necessary
        lastName: "",
        firstName: "",
        middleName: "",
        suffix: "",
        nameStarted: "",
        isStartDateEst: false,
        nameEnded: "",
        isNamePresent: false,
        isEndDateEst: false,
        isMaidenName: false,
        reasonChanged: "",
      };
      setOtherNames([...otherNames, newAlias]);
    }
  };

  return (
    <section>
      <div className="container">
        {otherNames.map((alias, index) => (
          <fieldset
            key={index}
            style={{
              marginBottom: "20px",
              border: "1px solid #ccc",
              padding: "10px",
            }}
          >
            <legend>Alias #{index + 1}</legend>
            {Object.entries(alias).map(
              ([key, value]) =>
                key !== "nameID" &&
                key !== "applicantID" && (
                  <div key={key}>
                    <label htmlFor={`${key}-${index}`}>
                      {key.replace(/([A-Z])/g, " $1").trim()}
                    </label>
                    <input
                      id={`${key}-${index}`}
                      type={
                        key.includes("Date") || key.includes("is")
                          ? "date"
                          : "text"
                      }
                      value={typeof value === "string" ? value : ""}
                      checked={typeof value === "boolean" ? value : undefined}
                      onChange={(e) =>
                        handleAliasChange(
                          index,
                          key as keyof ApplicantNames,
                          e.target.type === "checkbox"
                            ? e.target.checked
                            : e.target.value
                        )
                      }
                    />
                  </div>
                )
            )}
          </fieldset>
        ))}
        {otherNames.length < 4 && (
          <button type="button" onClick={handleAddAlias}>
            Add Another Alias
          </button>
        )}
      </div>
    </section>
  );
};

export default Alias;
