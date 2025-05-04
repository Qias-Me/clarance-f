import React from "react";
import {
  type MilitaryHistoryInfo,
} from "api/interfaces/sections/militaryHistoryInfo";
import {type FormInfo} from "api/interfaces/FormInfo";


type FormProps = {
  data: MilitaryHistoryInfo;
  getDefaultNewItem: (itemType: string) => any;
  onInputChange: (path: string, value: any) => void;
  onAddEntry: (path: string, newItem: any) => void;
  isValidValue: (path: string, value: any) => boolean;
  isReadOnlyField: (fieldName: string) => boolean;
  path: string;
  formInfo: FormInfo;
};

const RenderMilitaryInfo: React.FC<FormProps> = ({
  data,
  isReadOnlyField,
  onInputChange,
  getDefaultNewItem,
  onAddEntry,
  path,
}) => {
  const handleRadioChange =
    (value: boolean, field: string) =>
    (event: React.ChangeEvent<HTMLInputElement>) => {
      if (event.target.checked) {
        onInputChange(`${path}.${field}`, value);
      }
    };

  const handleInputChange =
    (field: string) =>
    (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const { value } = event.target;
      onInputChange(`${path}.${field}`, value);
    };

  const handleCheckboxChange =
    (field: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
      onInputChange(`${path}.${field}`, event.target.checked);
    };

  return (
    <div className="p-4 bg-gray-50 rounded-lg shadow space-y-4">
      <h3 className="text-lg font-semibold">Section 15 - Military History</h3>

      <div className="mt-2 flex space-x-4">
        <label className="inline-flex items-center">
          Have you EVER served in the U.S. Military?
          <input
            type="radio"
            name="everServedInUSMilitary"
            value="yes"
            checked={data.everServedInUSMilitary === true}
            onChange={handleRadioChange(true, "everServedInUSMilitary")}
            className="mr-2"
            disabled={isReadOnlyField("everServedInUSMilitary")}
          />
          YES
        </label>
        <label className="inline-flex items-center">
          <input
            type="radio"
            name="everServedInUSMilitary"
            value="no"
            checked={data.everServedInUSMilitary === false}
            onChange={handleRadioChange(false, "everServedInUSMilitary")}
            className="mr-2"
            disabled={isReadOnlyField("everServedInUSMilitary")}
          />
          NO
        </label>
      </div>

      {data.everServedInUSMilitary && (
        <div className="mt-2 space-y-4">
          {data.section15_1.map((entry, index) => (
            <div key={index} className="space-y-4">
              <h4 className="text-md font-semibold">Entry #{index + 1}</h4>
              <div className="grid grid-cols-2 gap-4">
                {/* Branch of Service */}
                <div>
                  <label>Provide the branch of service you served in.</label>
                  <div>
                    {[
                      "Army",
                      "ArmyNationalGuard",
                      "Navy",
                      "AirForce",
                      "AirNationalGuard",
                      "MarineCorps",
                      "CoastGuard",
                    ].map((branch) => (
                      <label key={branch} className="block">
                        <input
                          type="radio"
                          name={`section15_1[${index}].branch`}
                          value={branch}
                          checked={entry.branch === branch}
                          onChange={handleInputChange(
                            `section15_1[${index}].branch`
                          )}
                          disabled={isReadOnlyField(
                            `section15_1[${index}].branch`
                          )}
                        />
                        {branch}
                      </label>
                    ))}
                  </div>
                </div>

                {/* State of Service */}
                {(entry.branch === "ArmyNationalGuard" ||
                  entry.branch === "AirNationalGuard") && (
                  <div>
                    <label>State of service, if National Guard</label>
                    <input
                      type="text"
                      value={entry.stateOfService || ""}
                      onChange={handleInputChange(
                        `section15_1[${index}].stateOfService`
                      )}
                      disabled={isReadOnlyField(
                        `section15_1[${index}].stateOfService`
                      )}
                    />
                  </div>
                )}

                {/* Status */}
                <div>
                  <label>Provide your status</label>
                  <div>
                    {["ActiveDuty", "ActiveReserve", "InactiveReserve"].map(
                      (status) => (
                        <label key={status} className="block">
                          <input
                            type="radio"
                            name={`section15_1[${index}].status`}
                            value={status}
                            checked={entry.status === status}
                            onChange={handleInputChange(
                              `section15_1[${index}].status`
                            )}
                            disabled={isReadOnlyField(
                              `section15_1[${index}].status`
                            )}
                          />
                          {status}
                        </label>
                      )
                    )}
                  </div>
                </div>

                {/* Officer or Enlisted */}
                <div>
                  <label>Officer or enlisted</label>
                  <div>
                    {["NotApplicable", "Officer", "Enlisted"].map((role) => (
                      <label key={role} className="block">
                        <input
                          type="radio"
                          name={`section15_1[${index}].officerOrEnlisted`}
                          value={role}
                          checked={entry.officerOrEnlisted === role}
                          onChange={handleInputChange(
                            `section15_1[${index}].officerOrEnlisted`
                          )}
                          disabled={isReadOnlyField(
                            `section15_1[${index}].officerOrEnlisted`
                          )}
                        />
                        {role}
                      </label>
                    ))}
                  </div>
                </div>

                {/* Service Number */}
                <div>
                  <label>Provide your service number.</label>
                  <input
                    type="text"
                    value={entry.serviceNumber || ""}
                    onChange={handleInputChange(
                      `section15_1[${index}].serviceNumber`
                    )}
                    disabled={isReadOnlyField(
                      `section15_1[${index}].serviceNumber`
                    )}
                  />
                </div>

                {/* Dates of Service */}
                <div>
                  <label>Provide your dates of service.</label>
                  <input
                    type="text"
                    value={entry.serviceFromDate}
                    onChange={handleInputChange(
                      `section15_1[${index}].serviceFromDate`
                    )}
                    disabled={isReadOnlyField(
                      `section15_1[${index}].serviceFromDate`
                    )}
                    placeholder="From Date (MM/YYYY)"
                  />
                  <input
                    type="text"
                    value={entry.serviceToDate || ""}
                    onChange={handleInputChange(
                      `section15_1[${index}].serviceToDate`
                    )}
                    disabled={isReadOnlyField(
                      `section15_1[${index}].serviceToDate`
                    )}
                    placeholder="To Date (MM/YYYY)"
                  />
                  <label>
                    <input
                      type="checkbox"
                      checked={entry.present}
                      onChange={handleCheckboxChange(
                        `section15_1[${index}].present`
                      )}
                      disabled={isReadOnlyField(
                        `section15_1[${index}].present`
                      )}
                    />
                    Present
                  </label>
                </div>

                {/* Discharge Information */}
                <div>
                  <label>
                    Were you discharged from this instance of U.S. military
                    service?
                    <input
                      type="radio"
                      name={`section15_1[${index}].discharged`}
                      value="yes"
                      checked={entry.discharged === true}
                      onChange={handleRadioChange(
                        true,
                        `section15_1[${index}].discharged`
                      )}
                      disabled={isReadOnlyField(
                        `section15_1[${index}].discharged`
                      )}
                    />
                    YES
                  </label>
                  <label>
                    <input
                      type="radio"
                      name={`section15_1[${index}].discharged`}
                      value="no"
                      checked={entry.discharged === false}
                      onChange={handleRadioChange(
                        false,
                        `section15_1[${index}].discharged`
                      )}
                      disabled={isReadOnlyField(
                        `section15_1[${index}].discharged`
                      )}
                    />
                    NO
                  </label>
                </div>

                {/* Type of Discharge */}
                {entry.discharged && (
                  <div>
                    <label>Provide the type of discharge you received.</label>
                    {[
                      "Honorable",
                      "General",
                      "UnderOtherThanHonorableConditions",
                      "BadConduct",
                      "Dishonorable",
                      "Other",
                    ].map((dischargeType) => (
                      <label key={dischargeType} className="block">
                        <input
                          type="radio"
                          name={`section15_1[${index}].typeOfDischarge`}
                          value={dischargeType}
                          checked={entry.typeOfDischarge === dischargeType}
                          onChange={handleInputChange(
                            `section15_1[${index}].typeOfDischarge`
                          )}
                          disabled={isReadOnlyField(
                            `section15_1[${index}].typeOfDischarge`
                          )}
                        />
                        {dischargeType}
                      </label>
                    ))}
                    {entry.typeOfDischarge === "Other" && (
                      <input
                        type="text"
                        value={entry.dischargeTypeOther || ""}
                        onChange={handleInputChange(
                          `section15_1[${index}].dischargeTypeOther`
                        )}
                        disabled={isReadOnlyField(
                          `section15_1[${index}].dischargeTypeOther`
                        )}
                        placeholder="Provide type"
                      />
                    )}
                  </div>
                )}

                {/* Date of Discharge */}
                {entry.discharged && (
                  <div>
                    <label>Provide the date of discharge listed.</label>
                    <input
                      type="text"
                      value={entry.dischargeDate || ""}
                      onChange={handleInputChange(
                        `section15_1[${index}].dischargeDate`
                      )}
                      disabled={isReadOnlyField(
                        `section15_1[${index}].dischargeDate`
                      )}
                      placeholder="Month/Year"
                    />
                  </div>
                )}

                {/* Reason for Discharge */}
                {entry.discharged && entry.typeOfDischarge !== "Honorable" && (
                  <div>
                    <label>
                      Provide the reason(s) for the discharge, if discharge is
                      other than Honorable
                    </label>
                    <input
                      type="text"
                      value={entry.dischargeReason || ""}
                      onChange={handleInputChange(
                        `section15_1[${index}].dischargeReason`
                      )}
                      disabled={isReadOnlyField(
                        `section15_1[${index}].dischargeReason`
                      )}
                    />
                  </div>
                )}
              </div>
            </div>
          ))}

          {data.section15_1.length < 2 && (
            <button
              type="button"
              onClick={() =>
                onAddEntry(
                  `${path}.section15_1`,
                  getDefaultNewItem("militaryHistoryInfo.section15_1")
                )
              }
              className="px-4 py-2 bg-blue-500 text-white rounded"
            >
              Add Military Service Entry
            </button>
          )}
        </div>
      )}

      <div className="mt-2 flex space-x-4">
        <label className="inline-flex items-center">
          Have you EVER been subject to disciplinary action (court-martial,
          non-judicial punishment, etc.)?
          <input
            type="radio"
            name="disciplinaryProcedure"
            value="yes"
            checked={data.disciplinaryProcedure === true}
            onChange={handleRadioChange(true, "disciplinaryProcedure")}
            className="mr-2"
            disabled={isReadOnlyField("disciplinaryProcedure")}
          />
          YES
        </label>
        <label className="inline-flex items-center">
          <input
            type="radio"
            name="disciplinaryProcedure"
            value="no"
            checked={data.disciplinaryProcedure === false}
            onChange={handleRadioChange(false, "disciplinaryProcedure")}
            className="mr-2"
            disabled={isReadOnlyField("disciplinaryProcedure")}
          />
          NO
        </label>
      </div>

      {data.disciplinaryProcedure && (
        <div className="mt-2 space-y-4">
          {data.section15_2.map((entry, index) => (
            <div key={index} className="space-y-4">
              <h4 className="text-md font-semibold">Entry #{index + 1}</h4>
              <div className="grid grid-cols-2 gap-4">
                {/* Date */}
                <div>
                  <label>Provide the date of the procedure.</label>
                  <input
                    type="text"
                    value={entry.date}
                    onChange={handleInputChange(`section15_2[${index}].date`)}
                    disabled={isReadOnlyField(`section15_2[${index}].date`)}
                    placeholder="Month/Year"
                  />
                  <label>
                    <input
                      type="checkbox"
                      checked={entry.estimatedDate}
                      onChange={handleCheckboxChange(
                        `section15_2[${index}].estimatedDate`
                      )}
                      disabled={isReadOnlyField(
                        `section15_2[${index}].estimatedDate`
                      )}
                    />
                    Estimated
                  </label>
                </div>

                {/* Description of Offense */}
                <div>
                  <label>Provide a description of the offense.</label>
                  <input
                    type="text"
                    value={entry.descriptionOfOffense}
                    onChange={handleInputChange(
                      `section15_2[${index}].descriptionOfOffense`
                    )}
                    disabled={isReadOnlyField(
                      `section15_2[${index}].descriptionOfOffense`
                    )}
                  />
                </div>

                {/* Name of Procedure */}
                <div>
                  <label>Provide the name of the procedure.</label>
                  <input
                    type="text"
                    value={entry.nameOfProcedure}
                    onChange={handleInputChange(
                      `section15_2[${index}].nameOfProcedure`
                    )}
                    disabled={isReadOnlyField(
                      `section15_2[${index}].nameOfProcedure`
                    )}
                  />
                </div>

                {/* Court Description */}
                <div>
                  <label>Provide a description of the court.</label>
                  <input
                    type="text"
                    value={entry.courtDescription}
                    onChange={handleInputChange(
                      `section15_2[${index}].courtDescription`
                    )}
                    disabled={isReadOnlyField(
                      `section15_2[${index}].courtDescription`
                    )}
                  />
                </div>

                {/* Outcome Description */}
                <div>
                  <label>Provide a description of the outcome.</label>
                  <input
                    type="text"
                    value={entry.outcomeDescription}
                    onChange={handleInputChange(
                      `section15_2[${index}].outcomeDescription`
                    )}
                    disabled={isReadOnlyField(
                      `section15_2[${index}].outcomeDescription`
                    )}
                  />
                </div>
              </div>
            </div>
          ))}

          {data.section15_2.length < 2 && (
            <button
              type="button"
              onClick={() =>
                onAddEntry(
                  `${path}.section15_2`,
                  getDefaultNewItem("militaryHistoryInfo.section15_2")
                )
              }
              className="px-4 py-2 bg-blue-500 text-white rounded"
            >
              Add Disciplinary Procedure Entry
            </button>
          )}
        </div>
      )}

      <div className="mt-2 flex space-x-4">
        <label className="inline-flex items-center">
          Have you EVER served in a foreign military, intelligence service,
          diplomatic service, or other defense force?
          <input
            type="radio"
            name="everServedInForeignMilitary"
            value="yes"
            checked={data.everServedInForeignMilitary === true}
            onChange={handleRadioChange(true, "everServedInForeignMilitary")}
            className="mr-2"
            disabled={isReadOnlyField("everServedInForeignMilitary")}
          />
          YES
        </label>
        <label className="inline-flex items-center">
          <input
            type="radio"
            name="everServedInForeignMilitary"
            value="no"
            checked={data.everServedInForeignMilitary === false}
            onChange={handleRadioChange(false, "everServedInForeignMilitary")}
            className="mr-2"
            disabled={isReadOnlyField("everServedInForeignMilitary")}
          />
          NO
        </label>
      </div>

      {data.everServedInForeignMilitary && (
        <div className="mt-2 space-y-4">
          {data.section15_3.map((entry, index) => (
            <div key={index} className="space-y-4">
              <h4 className="text-md font-semibold">Entry #{index + 1}</h4>
              <div className="grid grid-cols-2 gap-4">
                {/* Organization Type */}
                <div>
                  <label>Provide the type of organization you served in.</label>
                  <div>
                    {[
                      "Military",
                      "IntelligenceService",
                      "DiplomaticService",
                      "SecurityForces",
                      "Militia",
                      "OtherDefenseForces",
                      "Other",
                    ].map((organizationType) => (
                      <label key={organizationType} className="block">
                        <input
                          type="radio"
                          name={`section15_3[${index}].organizationType`}
                          value={organizationType}
                          checked={entry.organizationType === organizationType}
                          onChange={handleInputChange(
                            `section15_3[${index}].organizationType`
                          )}
                          disabled={isReadOnlyField(
                            `section15_3[${index}].organizationType`
                          )}
                        />
                        {organizationType}
                      </label>
                    ))}
                  </div>
                  {entry.organizationType === "Other" && (
                    <input
                      type="text"
                      value={entry.organizationTypeOther || ""}
                      onChange={handleInputChange(
                        `section15_3[${index}].organizationTypeOther`
                      )}
                      disabled={isReadOnlyField(
                        `section15_3[${index}].organizationTypeOther`
                      )}
                      placeholder="Provide type"
                    />
                  )}
                </div>

                {/* Organization Name */}
                <div>
                  <label>Provide the name of the organization.</label>
                  <input
                    type="text"
                    value={entry.organizationName}
                    onChange={handleInputChange(
                      `section15_3[${index}].organizationName`
                    )}
                    disabled={isReadOnlyField(
                      `section15_3[${index}].organizationName`
                    )}
                  />
                </div>

                {/* Country */}
                <div>
                  <label>Provide the country of the organization.</label>
                  <input
                    type="text"
                    value={entry.country}
                    onChange={handleInputChange(
                      `section15_3[${index}].country`
                    )}
                    disabled={isReadOnlyField(`section15_3[${index}].country`)}
                  />
                </div>

                {/* Period of Service */}
                <div>
                  <label>Provide your period of service.</label>
                  <input
                    type="text"
                    value={entry.periodOfServiceFrom}
                    onChange={handleInputChange(
                      `section15_3[${index}].periodOfServiceFrom`
                    )}
                    disabled={isReadOnlyField(
                      `section15_3[${index}].periodOfServiceFrom`
                    )}
                    placeholder="From Date (MM/YYYY)"
                  />
                  <input
                    type="text"
                    value={entry.periodOfServiceTo || ""}
                    onChange={handleInputChange(
                      `section15_3[${index}].periodOfServiceTo`
                    )}
                    disabled={isReadOnlyField(
                      `section15_3[${index}].periodOfServiceTo`
                    )}
                    placeholder="To Date (MM/YYYY)"
                  />
                  <label>
                    <input
                      type="checkbox"
                      checked={entry.present}
                      onChange={handleCheckboxChange(
                        `section15_3[${index}].present`
                      )}
                      disabled={isReadOnlyField(
                        `section15_3[${index}].present`
                      )}
                    />
                    Present
                  </label>
                  <label>
                    <input
                      type="checkbox"
                      checked={entry.estimatedPeriodFrom}
                      onChange={handleCheckboxChange(
                        `section15_3[${index}].estimatedPeriodFrom`
                      )}
                      disabled={isReadOnlyField(
                        `section15_3[${index}].estimatedPeriodFrom`
                      )}
                    />
                    Estimated From
                  </label>
                  <label>
                    <input
                      type="checkbox"
                      checked={entry.estimatedPeriodTo}
                      onChange={handleCheckboxChange(
                        `section15_3[${index}].estimatedPeriodTo`
                      )}
                      disabled={isReadOnlyField(
                        `section15_3[${index}].estimatedPeriodTo`
                      )}
                    />
                    Estimated To
                  </label>
                </div>

                {/* Highest Rank */}
                <div>
                  <label>Provide your highest rank.</label>
                  <input
                    type="text"
                    value={entry.highestRank}
                    onChange={handleInputChange(
                      `section15_3[${index}].highestRank`
                    )}
                    disabled={isReadOnlyField(
                      `section15_3[${index}].highestRank`
                    )}
                  />
                </div>

                {/* Department or Office */}
                <div>
                  <label>Provide your department or office.</label>
                  <input
                    type="text"
                    value={entry.departmentOrOffice}
                    onChange={handleInputChange(
                      `section15_3[${index}].departmentOrOffice`
                    )}
                    disabled={isReadOnlyField(
                      `section15_3[${index}].departmentOrOffice`
                    )}
                  />
                </div>

                {/* Association Description */}
                <div>
                  <label>Provide a description of your association.</label>
                  <input
                    type="text"
                    value={entry.associationDescription}
                    onChange={handleInputChange(
                      `section15_3[${index}].associationDescription`
                    )}
                    disabled={isReadOnlyField(
                      `section15_3[${index}].associationDescription`
                    )}
                  />
                </div>

                {/* Reason for Leaving */}
                <div>
                  <label>Provide the reason for leaving.</label>
                  <input
                    type="text"
                    value={entry.reasonForLeaving}
                    onChange={handleInputChange(
                      `section15_3[${index}].reasonForLeaving`
                    )}
                    disabled={isReadOnlyField(
                      `section15_3[${index}].reasonForLeaving`
                    )}
                  />
                </div>

                {/* Maintains Contact */}
                <div>
                  <label>Do you maintain contact?</label>
                  <label>
                    <input
                      type="radio"
                      name={`section15_3[${index}].maintainsContact`}
                      value="yes"
                      checked={entry.maintainsContact === true}
                      onChange={handleRadioChange(
                        true,
                        `section15_3[${index}].maintainsContact`
                      )}
                      disabled={isReadOnlyField(
                        `section15_3[${index}].maintainsContact`
                      )}
                    />
                    YES
                  </label>
                  <label>
                    <input
                      type="radio"
                      name={`section15_3[${index}].maintainsContact`}
                      value="no"
                      checked={entry.maintainsContact === false}
                      onChange={handleRadioChange(
                        false,
                        `section15_3[${index}].maintainsContact`
                      )}
                      disabled={isReadOnlyField(
                        `section15_3[${index}].maintainsContact`
                      )}
                    />
                    NO
                  </label>
                </div>

                {/* Contacts */}
                {entry.maintainsContact && (
                  <div>
                    <h4 className="text-md font-semibold">Contacts</h4>
                    {entry.contacts.map((contact, contactIndex) => {
                        
                        
                        console.log(entry.contacts, "entry.contacts");
                            
                            return(
                      <div key={contactIndex} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          {/* Contact Name */}
                          <div>
                            <label>Contact's Last Name</label>
                            <input
                              type="text"
                              value={contact.lastName}
                              onChange={handleInputChange(
                                `section15_3[${index}].contacts[${contactIndex}].lastName`
                              )}
                              disabled={isReadOnlyField(
                                `section15_3[${index}].contacts[${contactIndex}].lastName`
                              )}
                            />
                            <label>Contact's First Name</label>
                            <input
                              type="text"
                              value={contact.firstName}
                              onChange={handleInputChange(
                                `section15_3[${index}].contacts[${contactIndex}].firstName`
                              )}
                              disabled={isReadOnlyField(
                                `section15_3[${index}].contacts[${contactIndex}].firstName`
                              )}
                            />
                            <label>Contact's Middle Name</label>
                            <input
                              type="text"
                              value={contact.middleName || ""}
                              onChange={handleInputChange(
                                `section15_3[${index}].contacts[${contactIndex}].middleName`
                              )}
                              disabled={isReadOnlyField(
                                `section15_3[${index}].contacts[${contactIndex}].middleName`
                              )}
                            />
                            <label>Contact's Suffix</label>
                            <input
                              type="text"
                              value={contact.suffix || ""}
                              onChange={handleInputChange(
                                `section15_3[${index}].contacts[${contactIndex}].suffix`
                              )}
                              disabled={isReadOnlyField(
                                `section15_3[${index}].contacts[${contactIndex}].suffix`
                              )}
                            />
                          </div>

                          {/* Address */}
                          <div>
                            <label>Street</label>
                            <input
                              type="text"
                              value={contact.address.street}
                              onChange={handleInputChange(
                                `section15_3[${index}].contacts[${contactIndex}].address.street`
                              )}
                              disabled={isReadOnlyField(
                                `section15_3[${index}].contacts[${contactIndex}].address.street`
                              )}
                            />
                            <label>City</label>
                            <input
                              type="text"
                              value={contact.address.city}
                              onChange={handleInputChange(
                                `section15_3[${index}].contacts[${contactIndex}].address.city`
                              )}
                              disabled={isReadOnlyField(
                                `section15_3[${index}].contacts[${contactIndex}].address.city`
                              )}
                            />
                            <label>State</label>
                            <input
                              type="text"
                              value={contact.address.state || ""}
                              onChange={handleInputChange(
                                `section15_3[${index}].contacts[${contactIndex}].address.state`
                              )}
                              disabled={isReadOnlyField(
                                `section15_3[${index}].contacts[${contactIndex}].address.state`
                              )}
                            />
                            <label>Zip Code</label>
                            <input
                              type="text"
                              value={contact.address.zipCode || ""}
                              onChange={handleInputChange(
                                `section15_3[${index}].contacts[${contactIndex}].address.zipCode`
                              )}
                              disabled={isReadOnlyField(
                                `section15_3[${index}].contacts[${contactIndex}].address.zipCode`
                              )}
                            />
                            <label>Country</label>
                            <input
                              type="text"
                              value={contact.address.country}
                              onChange={handleInputChange(
                                `section15_3[${index}].contacts[${contactIndex}].address.country`
                              )}
                              disabled={isReadOnlyField(
                                `section15_3[${index}].contacts[${contactIndex}].address.country`
                              )}
                            />
                          </div>

                          {/* Official Title */}
                          <div>
                            <label>Provide the contact's official title.</label>
                            <input
                              type="text"
                              value={contact.officialTitle}
                              onChange={handleInputChange(
                                `section15_3[${index}].contacts[${contactIndex}].officialTitle`
                              )}
                              disabled={isReadOnlyField(
                                `section15_3[${index}].contacts[${contactIndex}].officialTitle`
                              )}
                            />
                          </div>

                          {/* Frequency of Contact */}
                          <div>
                            <label>Provide the frequency of contact.</label>
                            <input
                              type="text"
                              value={contact.frequencyOfContact}
                              onChange={handleInputChange(
                                `section15_3[${index}].contacts[${contactIndex}].frequencyOfContact`
                              )}
                              disabled={isReadOnlyField(
                                `section15_3[${index}].contacts[${contactIndex}].frequencyOfContact`
                              )}
                            />
                          </div>

                          {/* Association Period */}
                          <div>
                            <label>Provide the period of association.</label>
                            <input
                              type="text"
                              value={contact.associationFrom}
                              onChange={handleInputChange(
                                `section15_3[${index}].contacts[${contactIndex}].associationFrom`
                              )}
                              disabled={isReadOnlyField(
                                `section15_3[${index}].contacts[${contactIndex}].associationFrom`
                              )}
                              placeholder="From Date (MM/YYYY)"
                            />
                            <input
                              type="text"
                              value={contact.associationTo || ""}
                              onChange={handleInputChange(
                                `section15_3[${index}].contacts[${contactIndex}].associationTo`
                              )}
                              disabled={isReadOnlyField(
                                `section15_3[${index}].contacts[${contactIndex}].associationTo`
                              )}
                              placeholder="To Date (MM/YYYY)"
                            />
                            <label>
                              <input
                                type="checkbox"
                                checked={contact.present}
                                onChange={handleCheckboxChange(
                                  `section15_3[${index}].contacts[${contactIndex}].present`
                                )}
                                disabled={isReadOnlyField(
                                  `section15_3[${index}].contacts[${contactIndex}].present`
                                )}
                              />
                              Present
                            </label>
                            <label>
                              <input
                                type="checkbox"
                                checked={contact.estimatedAssociationFrom}
                                onChange={handleCheckboxChange(
                                  `section15_3[${index}].contacts[${contactIndex}].estimatedAssociationFrom`
                                )}
                                disabled={isReadOnlyField(
                                  `section15_3[${index}].contacts[${contactIndex}].estimatedAssociationFrom`
                                )}
                              />
                              Estimated From
                            </label>
                            <label>
                              <input
                                type="checkbox"
                                checked={contact.estimatedAssociationTo}
                                onChange={handleCheckboxChange(
                                  `section15_3[${index}].contacts[${contactIndex}].estimatedAssociationTo`
                                )}
                                disabled={isReadOnlyField(
                                  `section15_3[${index}].contacts[${contactIndex}].estimatedAssociationTo`
                                )}
                              />
                              Estimated To
                            </label>
                          </div>
                        </div>
                      </div>
                    )})}
                    {entry.contacts.length < 2 && (
                      <button
                        type="button"
                        onClick={() => {
                            onAddEntry(
                                `${path}.section15_3[${index}].contacts`,
                                getDefaultNewItem("militaryHistoryInfo.section15_3.contacts")
                              );

                        
                        }}
                        className="px-4 py-2 bg-blue-500 text-white rounded"
                      >
                        Add Contact Entry
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
          {data.section15_3.length < 2 && (
            <button
              type="button"
              onClick={() =>
                onAddEntry(
                  `${path}.section15_3`,
                  getDefaultNewItem("militaryHistoryInfo.section15_3")
                )
              }
              className="px-4 py-2 bg-blue-500 text-white rounded"
            >
              Add Foreign Service Entry
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export { RenderMilitaryInfo };
