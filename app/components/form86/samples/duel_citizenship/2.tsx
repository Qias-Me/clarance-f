import { useForm } from "../formContext"; // Correct the path as necessary

const PassportDetailsForm = () => {
  const { formData, setFormData } = useForm();

  const updatePassportDetail = (
    index: number,
    field: string,
    value: string | boolean
  ) => {
    const updatedPassports = [...formData.duelCitizenshipInfo.passports];
    updatedPassports[index] = { ...updatedPassports[index], [field]: value };
    setFormData({
      ...formData,
      duelCitizenshipInfo: {
        ...formData.duelCitizenshipInfo,
        passports: updatedPassports,
      },
    });
  };

  // Corrected: Added the missing addPassportDetail function
  const addPassportDetail = () => {
    const newPassport = {
      passportCity: "",
      passportCountry: "",
      passportLName: "",
      passportFName: "",
      passportMName: "",
      passportSuffix: "",
      passportID: "",
      passportExpiration: "",
      isExpirationEst: false,
      isPassportUsed: false,
      passportUses: [],
      countryIssued: "",
      passportDateIssued: "",
      isPassportDateEst: false,
    };
    setFormData({
      ...formData,
      duelCitizenshipInfo: {
        ...formData.duelCitizenshipInfo,
        passports: [...formData.duelCitizenshipInfo.passports, newPassport],
      },
    });
  };

  const addPassportUseDetail = (passportIndex: number) => {
    const newUse = {
      passportCountry: "",
      fromDate: "",
      toDate: "",
      isFromDateEst: false,
      isToDateEst: false,
      isVisitCurrent: false,
    };
    const updatedPassports = [...formData.duelCitizenshipInfo.passports];
    const passportUses = updatedPassports[passportIndex].passportUses || [];
    if (passportUses.length < 6) {
      // Limit to 6 entries
      updatedPassports[passportIndex].passportUses = [...passportUses, newUse];
      setFormData({
        ...formData,
        duelCitizenshipInfo: {
          ...formData.duelCitizenshipInfo,
          passports: updatedPassports,
        },
      });
    }
  };

  const updatePassportUseDetail = (
    passportIndex: number,
    useIndex: number,
    field: string,
    value: string | boolean
  ) => {
    const updatedPassports = [...formData.duelCitizenshipInfo.passports];
    const passportUses = updatedPassports[passportIndex].passportUses || [];
    passportUses[useIndex] = { ...passportUses[useIndex], [field]: value };
    updatedPassports[passportIndex].passportUses = passportUses;
    setFormData({
      ...formData,
      duelCitizenshipInfo: {
        ...formData.duelCitizenshipInfo,
        passports: updatedPassports,
      },
    });
  };

  return (
    <div>
      {formData.duelCitizenshipInfo.passports?.map((passport, index) => (
        <div key={index}>
          {/* Passport detail fields */}
          <div>
            <label htmlFor={`passportCity-${index}`}>City of Issue:</label>
            <input
              id={`passportCity-${index}`}
              type="text"
              value={passport.passportCity || ""}
              onChange={(e) =>
                updatePassportDetail(index, "passportCity", e.target.value)
              }
            />
          </div>
          <div>
            <label htmlFor={`passportCountry-${index}`}>
              Country of Issue:
            </label>
            <input
              id={`passportCountry-${index}`}
              type="text"
              value={passport.passportCountry || ""}
              onChange={(e) =>
                updatePassportDetail(index, "passportCountry", e.target.value)
              }
            />
          </div>
          <div>
            <label htmlFor={`passportLName-${index}`}>Last Name:</label>
            <input
              id={`passportLName-${index}`}
              type="text"
              value={passport.passportLName || ""}
              onChange={(e) =>
                updatePassportDetail(index, "passportLName", e.target.value)
              }
            />
          </div>
          <div>
            <label htmlFor={`passportFName-${index}`}>First Name:</label>
            <input
              id={`passportFName-${index}`}
              type="text"
              value={passport.passportFName || ""}
              onChange={(e) =>
                updatePassportDetail(index, "passportFName", e.target.value)
              }
            />
          </div>
          {/* Optional fields */}
          <div>
            <label htmlFor={`passportMName-${index}`}>Middle Name:</label>
            <input
              id={`passportMName-${index}`}
              type="text"
              value={passport.passportMName || ""}
              onChange={(e) =>
                updatePassportDetail(index, "passportMName", e.target.value)
              }
            />
          </div>
          <div>
            <label htmlFor={`passportSuffix-${index}`}>Suffix:</label>
            <input
              id={`passportSuffix-${index}`}
              type="text"
              value={passport.passportSuffix || ""}
              onChange={(e) =>
                updatePassportDetail(index, "passportSuffix", e.target.value)
              }
            />
          </div>
          <div>
            <label htmlFor={`passportID-${index}`}>Passport ID:</label>
            <input
              id={`passportID-${index}`}
              type="text"
              value={passport.passportID || ""}
              onChange={(e) =>
                updatePassportDetail(index, "passportID", e.target.value)
              }
            />
          </div>
          <div>
            <label htmlFor={`passportExpiration-${index}`}>
              Expiration Date:
            </label>
            <input
              id={`passportExpiration-${index}`}
              type="date"
              value={passport.passportExpiration || ""}
              onChange={(e) =>
                updatePassportDetail(
                  index,
                  "passportExpiration",
                  e.target.value
                )
              }
            />
          </div>
          <div>
            <label htmlFor={`isExpirationEst-${index}`}>
              Is Expiration Date Estimated?
            </label>
            <input
              id={`isExpirationEst-${index}`}
              type="checkbox"
              checked={passport.isExpirationEst || false}
              onChange={(e) =>
                updatePassportDetail(index, "isExpirationEst", e.target.checked)
              }
            />
          </div>
          <div>
            <label htmlFor={`isPassportUsed-${index}`}>
              Has the Passport Been Used?
            </label>
            <input
              id={`isPassportUsed-${index}`}
              type="checkbox"
              checked={passport.isPassportUsed || false}
              onChange={(e) =>
                updatePassportDetail(index, "isPassportUsed", e.target.checked)
              }
            />
          </div>
          {/* Add all other passport fields similarly */}
          {/* Conditional rendering for when the passport has been used */}
          {passport.isPassportUsed && (
            <>
              {passport.passportUses?.map((use, useIndex) => (
                <div key={`use-${useIndex}`}>
                  <div>
                    <label htmlFor={`passportUseCountry-${index}-${useIndex}`}>
                      Country Visited:
                    </label>
                    <input
                      id={`passportUseCountry-${index}-${useIndex}`}
                      type="text"
                      value={use.passportCountry}
                      onChange={(e) =>
                        updatePassportUseDetail(
                          index,
                          useIndex,
                          "passportCountry",
                          e.target.value
                        )
                      }
                    />
                  </div>
                  <div>
                    <label htmlFor={`fromDate-${index}-${useIndex}`}>
                      From Date:
                    </label>
                    <input
                      id={`fromDate-${index}-${useIndex}`}
                      type="month"
                      value={use.fromDate}
                      onChange={(e) =>
                        updatePassportUseDetail(
                          index,
                          useIndex,
                          "fromDate",
                          e.target.value
                        )
                      }
                    />
                    <label>
                      <input
                        type="checkbox"
                        checked={use.isFromDateEst || false}
                        onChange={(e) =>
                          updatePassportUseDetail(
                            index,
                            useIndex,
                            "isFromDateEst",
                            e.target.checked
                          )
                        }
                      />
                      Est.
                    </label>
                  </div>
                  <div>
                    <label htmlFor={`toDate-${index}-${useIndex}`}>
                      To Date:
                    </label>
                    <input
                      id={`toDate-${index}-${useIndex}`}
                      type="month"
                      value={use.toDate || ""}
                      onChange={(e) =>
                        updatePassportUseDetail(
                          index,
                          useIndex,
                          "toDate",
                          e.target.value
                        )
                      }
                    />
                    <label>
                      <input
                        type="checkbox"
                        checked={use.isToDateEst || false}
                        onChange={(e) =>
                          updatePassportUseDetail(
                            index,
                            useIndex,
                            "isToDateEst",
                            e.target.checked
                          )
                        }
                      />
                      Est.
                    </label>
                    <label>
                      <input
                        type="checkbox"
                        checked={use.isVisitCurrent || false}
                        onChange={(e) =>
                          updatePassportUseDetail(
                            index,
                            useIndex,
                            "isVisitCurrent",
                            e.target.checked
                          )
                        }
                      />
                      Present
                    </label>
                  </div>
                </div>
              ))}
              {passport.passportUses && passport.passportUses.length < 6 && (
                <button onClick={() => addPassportUseDetail(index)}>
                  Add Travel Detail
                </button>
              )}
            </>
          )}
        </div>
      ))}
      {formData.duelCitizenshipInfo.passports.length < 2 && (
        <button onClick={() => addPassportDetail()}>
          Add Another Passport
        </button>
      )}
    </div>
  );
};

export default PassportDetailsForm;
