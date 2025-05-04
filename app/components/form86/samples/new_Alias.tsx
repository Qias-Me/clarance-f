import { useState } from "react";
import { useForm } from "./formContext"; // Adjust the import path as needed
import { ApplicantNames } from "api_v2/interfaces/form3"; // Ensure the correct path
import Utils from "../../../utils/utils"; // Ensure the correct path

const AliasForm = () => {
  const { formData, setFormData, goToNextStep } = useForm();
  const [hasAliases, setHasAliases] = useState<boolean | null>(null);

  const handleAliasChange = (
    index: number,
    field: keyof ApplicantNames,
    value: string | boolean
  ) => {
    const updatedAliases = formData.names.map((alias, i) =>
      i === index ? { ...alias, [field]: value } : alias
    );

    setFormData({ ...formData, names: updatedAliases });
  };

  const handleAddAlias = () => {
    const newAlias: ApplicantNames = {
      _id: Date.now(), // Adjust as needed
      applicantID: formData.personalInfo.applicantID,
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

    setFormData({
      ...formData,
      names: [...formData.names, newAlias],
    });
  };

  const handleNoAliases = () => {
    setHasAliases(false);
    goToNextStep();
  };

  return (
    <section>
      <div className="container">
        {hasAliases === null && (
          <>
            <h3>Do you have any aliases?</h3>
            <button onClick={() => setHasAliases(true)}>Yes</button>
            <button onClick={handleNoAliases}>No</button>
          </>
        )}

        {hasAliases && (
          <>
            {formData.names.map((alias, index) => (
              <div key={index} style={{ marginBottom: "20px" }}>
                <h3>Alias #{index + 1}</h3>
                <input
                  type="text"
                  placeholder="First Name"
                  value={alias.firstName}
                  onChange={(e) =>
                    handleAliasChange(index, "firstName", e.target.value)
                  }
                />
                <input
                  type="text"
                  placeholder="Middle Name"
                  value={alias.middleName}
                  onChange={(e) =>
                    handleAliasChange(index, "middleName", e.target.value)
                  }
                />
                <input
                  type="text"
                  placeholder="Last Name"
                  value={alias.lastName}
                  onChange={(e) =>
                    handleAliasChange(index, "lastName", e.target.value)
                  }
                />
                <input
                  type="text"
                  placeholder="Suffix"
                  value={alias.suffix}
                  onChange={(e) =>
                    handleAliasChange(index, "suffix", e.target.value)
                  }
                />
                <input
                  type="date"
                  value={Utils.formatDateToInputValue(alias.nameStarted)}
                  onChange={(e) =>
                    handleAliasChange(index, "nameStarted", e.target.value)
                  }
                />
                <input
                  type="date"
                  value={Utils.formatDateToInputValue(alias.nameEnded)}
                  onChange={(e) =>
                    handleAliasChange(index, "nameEnded", e.target.value)
                  }
                />
                <div>
                  <input
                    type="checkbox"
                    checked={alias.isStartDateEst}
                    onChange={(e) =>
                      handleAliasChange(
                        index,
                        "isStartDateEst",
                        e.target.checked
                      )
                    }
                  />
                  Start Date Estimated?
                </div>
                <div>
                  <input
                    type="checkbox"
                    checked={alias.isEndDateEst}
                    onChange={(e) =>
                      handleAliasChange(index, "isEndDateEst", e.target.checked)
                    }
                  />
                  End Date Estimated?
                </div>
                <div>
                  <input
                    type="checkbox"
                    checked={alias.isNamePresent}
                    onChange={(e) =>
                      handleAliasChange(
                        index,
                        "isNamePresent",
                        e.target.checked
                      )
                    }
                  />
                  Name Currently Used?
                </div>
                <div>
                  <input
                    type="checkbox"
                    checked={alias.isMaidenName}
                    onChange={(e) =>
                      handleAliasChange(index, "isMaidenName", e.target.checked)
                    }
                  />
                  Is Maiden Name?
                </div>
                <input
                  type="text"
                  placeholder="Reason for Name Change"
                  value={alias.reasonChanged}
                  onChange={(e) =>
                    handleAliasChange(index, "reasonChanged", e.target.value)
                  }
                />
              </div>
            ))}

            {formData.names.length < 4 && (
              <button
                onClick={handleAddAlias}
                disabled={formData.names.length >= 4}
              >
                Add Another Alias
              </button>
            )}
          </>
        )}

        {hasAliases === false && <p>No aliases added.</p>}
      </div>
    </section>
  );
};

export default AliasForm;
