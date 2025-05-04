import { useForm } from "../formContext"; // Update this path as necessary

const Section1 = () => {
  const { formData, setFormData } = useForm();

  const updateCitizenshipDetail = (
    index: number,
    field: string,
    value: string | boolean
  ) => {
    const updatedCitizenships = [...formData.duelCitizenshipInfo.citizenships];
    updatedCitizenships[index] = {
      ...updatedCitizenships[index],
      [field]: value,
    };
    setFormData({
      ...formData,
      duelCitizenshipInfo: {
        ...formData.duelCitizenshipInfo,
        citizenships: updatedCitizenships,
      },
    });
  };

  const addCitizenshipDetail = () => {
    const newCitizenship = {
      country: "",
      howCitizenshipAcquired: "",
      citizenshipStart: "",
      isCitizenshipStartEstimated: false,
      citizenshipEnd: "",
      isCitizenshipEndPresent: false,
      isCitizenshipEndEstimated: false,
      isRenounced: false,
      renouncementDetails: "",
      isCitizenshipHeld: false,
      citizenshipExplanation: "",
    };
    setFormData({
      ...formData,
      duelCitizenshipInfo: {
        ...formData.duelCitizenshipInfo,
        citizenships: [
          ...formData.duelCitizenshipInfo.citizenships,
          newCitizenship,
        ],
      },
    });
  };

  return (
    <div>
      {formData.duelCitizenshipInfo.citizenships.map((citizenship, index) => (
        <div key={index}>
          <div>
            <label htmlFor={`countryOfCitizenship-${index}`}>
              Country of Citizenship:
            </label>
            <input
              id={`countryOfCitizenship-${index}`}
              type="text"
              value={citizenship.country || ""}
              onChange={(e) =>
                updateCitizenshipDetail(index, "country", e.target.value)
              }
            />
          </div>
          <div>
            <label htmlFor={`citizenshipAcquisition-${index}`}>
              How did you acquire this citizenship?
            </label>
            <input
              id={`citizenshipAcquisition-${index}`}
              type="text"
              value={citizenship.howCitizenshipAcquired || ""}
              onChange={(e) =>
                updateCitizenshipDetail(
                  index,
                  "howCitizenshipAcquired",
                  e.target.value
                )
              }
            />
          </div>
          <div>
            <label htmlFor={`citizenshipStart-${index}`}>
              Citizenship Start Date:
            </label>
            <input
              id={`citizenshipStart-${index}`}
              type="month"
              value={citizenship.citizenshipStart || ""}
              onChange={(e) =>
                updateCitizenshipDetail(
                  index,
                  "citizenshipStart",
                  e.target.value
                )
              }
            />
          </div>
          {/* Add the rest of the inputs based on the CitizenshipDetail interface */}
          <div>
            <label htmlFor={`isCitizenshipStartEstimated-${index}`}>
              Is the Citizenship Start Date Estimated?
            </label>
            <input
              id={`isCitizenshipStartEstimated-${index}`}
              type="checkbox"
              checked={citizenship.isCitizenshipStartEstimated || false}
              onChange={(e) =>
                updateCitizenshipDetail(
                  index,
                  "isCitizenshipStartEstimated",
                  e.target.checked
                )
              }
            />
          </div>
          <div>
            <label htmlFor={`citizenshipEnd-${index}`}>
              Citizenship End Date:
            </label>
            <input
              id={`citizenshipEnd-${index}`}
              type="month"
              value={citizenship.citizenshipEnd || ""}
              onChange={(e) =>
                updateCitizenshipDetail(index, "citizenshipEnd", e.target.value)
              }
            />
          </div>
          <div>
            <label htmlFor={`isCitizenshipEndEstimated-${index}`}>
              Is the Citizenship End Date Estimated?
            </label>
            <input
              id={`isCitizenshipEndEstimated-${index}`}
              type="checkbox"
              checked={citizenship.isCitizenshipEndEstimated || false}
              onChange={(e) =>
                updateCitizenshipDetail(
                  index,
                  "isCitizenshipEndEstimated",
                  e.target.checked
                )
              }
            />
          </div>
          <div>
            <label htmlFor={`isCitizenshipEndPresent-${index}`}>
              Is the Citizenship Currently Held?
            </label>
            <input
              id={`isCitizenshipEndPresent-${index}`}
              type="checkbox"
              checked={citizenship.isCitizenshipEndPresent || false}
              onChange={(e) =>
                updateCitizenshipDetail(
                  index,
                  "isCitizenshipEndPresent",
                  e.target.checked
                )
              }
            />
          </div>
          <div>
            <label htmlFor={`isRenounced-${index}`}>
              Has the Citizenship Been Renounced?
            </label>
            <input
              id={`isRenounced-${index}`}
              type="checkbox"
              checked={citizenship.isRenounced || false}
              onChange={(e) =>
                updateCitizenshipDetail(index, "isRenounced", e.target.checked)
              }
            />
          </div>
          {citizenship.isRenounced && (
            <div>
              <label htmlFor={`renouncementDetails-${index}`}>
                Renouncement Details:
              </label>
              <input
                id={`renouncementDetails-${index}`}
                type="text"
                value={citizenship.renouncementDetails || ""}
                onChange={(e) =>
                  updateCitizenshipDetail(
                    index,
                    "renouncementDetails",
                    e.target.value
                  )
                }
              />
            </div>
          )}
          <div>
            <label htmlFor={`isCitizenshipHeld-${index}`}>
              Is the Citizenship Still Held?
            </label>
            <input
              id={`isCitizenshipHeld-${index}`}
              type="checkbox"
              checked={citizenship.isCitizenshipHeld || false}
              onChange={(e) =>
                updateCitizenshipDetail(
                  index,
                  "isCitizenshipHeld",
                  e.target.checked
                )
              }
            />
          </div>
          <div>
            <label htmlFor={`citizenshipExplanation-${index}`}>
              Citizenship Explanation (If Applicable):
            </label>
            <textarea
              id={`citizenshipExplanation-${index}`}
              value={citizenship.citizenshipExplanation || ""}
              onChange={(e) =>
                updateCitizenshipDetail(
                  index,
                  "citizenshipExplanation",
                  e.target.value
                )
              }
            />
          </div>
        </div>
      ))}
      {formData.duelCitizenshipInfo.citizenships.length < 2 && (
        <button onClick={addCitizenshipDetail}>Add Another Citizenship</button>
      )}
    </div>
  );
};

export default Section1;
