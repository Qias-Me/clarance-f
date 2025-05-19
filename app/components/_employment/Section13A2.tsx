import React from "react";
import {
  type Section13A2,
  type EmploymentStatus,
  type Telephone,
  type AdditionalPeriod,
  type PhysicalWorkAddress,
  type Address,
} from "api/interfaces/sections/employmentInfo";

interface Section13A2Props {
  onAddEntry: (path: string, newItem: any) => void;
  getDefaultNewItem: (itemType: string) => any;
  data: Section13A2;
  onInputChange: (path: string, value: any) => void;
  path: string;
  isReadOnlyField: (fieldName: string) => boolean;
  onRemoveEntry: (path: string, index: number) => void;
}

const RenderSection13A2: React.FC<Section13A2Props> = ({
  data,
  onInputChange,
  onAddEntry,
  onRemoveEntry,
  getDefaultNewItem,
  path,
  isReadOnlyField,
}) => {
  const handleInputChange =
    (fieldPath: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
      onInputChange(`${path}.${fieldPath}`, event.target.value);
    };

  const handleCheckboxChange =
    (fieldPath: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
      onInputChange(`${path}.${fieldPath}`, event.target.checked);
    };

  // Function to handle removing a period
  const handleRemovePeriod = (index: number) => {

    onRemoveEntry(`${path}.additionalPeriods`, index);
  };

  const renderAddress = (address: Address | undefined, addressPath: string) => {
    if (!address) {
      console.warn(`Address at ${addressPath} is undefined`);
      return null;
    }
    
    return (
      <div>
        <input
          type="text"
          value={address.street?.value || ""}
          onChange={handleInputChange(`${addressPath}.street.value`)}
          disabled={isReadOnlyField(`${addressPath}.street`)}
          placeholder="Street"
        />
        <input
          type="text"
          value={address.city?.value || ""}
          onChange={handleInputChange(`${addressPath}.city.value`)}
          disabled={isReadOnlyField(`${addressPath}.city`)}
          placeholder="City"
        />
        <input
          type="text"
          value={address.state?.value || ""}
          onChange={handleInputChange(`${addressPath}.state.value`)}
          disabled={isReadOnlyField(`${addressPath}.state`)}
          placeholder="State"
        />
        <input
          type="text"
          value={address.zipCode?.value || ""}
          onChange={handleInputChange(`${addressPath}.zipCode.value`)}
          disabled={isReadOnlyField(`${addressPath}.zipCode`)}
          placeholder="Zip Code"
        />
        <input
          type="text"
          value={address.country?.value || ""}
          onChange={handleInputChange(`${addressPath}.country.value`)}
          disabled={isReadOnlyField(`${addressPath}.country`)}
          placeholder="Country"
        />
      </div>
    );
  };

  const renderTelephone = (telephone: Telephone | undefined, telephonePath: string) => {
    if (!telephone) {
      console.warn(`Telephone at ${telephonePath} is undefined`);
      return null;
    }
    
    return (
      <div>
        <input
          type="text"
          value={telephone.number?.value || ""}
          onChange={handleInputChange(`${telephonePath}.number.value`)}
          disabled={isReadOnlyField(`${telephonePath}.number`)}
          placeholder="Phone Number"
        />
        <input
          type="text"
          value={telephone.extension?.value || ""}
          onChange={handleInputChange(`${telephonePath}.extension.value`)}
          disabled={isReadOnlyField(`${telephonePath}.extension`)}
          placeholder="Extension"
        />
        <label>
          <input
            type="checkbox"
            checked={telephone.internationalOrDsn?.value === "Yes"}
            onChange={handleCheckboxChange(`${telephonePath}.internationalOrDsn.value`)}
            disabled={isReadOnlyField(`${telephonePath}.internationalOrDsn`)}
          />
          International or DSN
        </label>
        <label>
          <input
            type="checkbox"
            checked={telephone.day?.value === "Yes"}
            onChange={handleCheckboxChange(`${telephonePath}.day.value`)}
            disabled={isReadOnlyField(`${telephonePath}.day`)}
          />
          Day
        </label>
        <label>
          <input
            type="checkbox"
            checked={telephone.night?.value === "Yes"}
            onChange={handleCheckboxChange(`${telephonePath}.night.value`)}
            disabled={isReadOnlyField(`${telephonePath}.night`)}
          />
          Night
        </label>
      </div>
    );
  };

  const renderAdditionalPeriods = (
    additionalPeriods: AdditionalPeriod[] | undefined,
    periodsPath: string
  ) => {
    if (!additionalPeriods || !Array.isArray(additionalPeriods)) {
      console.warn(`AdditionalPeriods at ${periodsPath} is undefined or not an array`);
      return null;
    }
    
    return (
      <div>
        {additionalPeriods.map((period, index) => (
          <div key={index} className="space-y-2">
            <input
              type="text"
              value={period.fromDate?.date?.value || ""}
              onChange={handleInputChange(`${periodsPath}[${index}].fromDate.date.value`)}
              disabled={isReadOnlyField(`${periodsPath}[${index}].fromDate.date`)}
              placeholder="From Date"
            />
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={period.fromDate?.estimated?.value === "Yes"}
                onChange={handleCheckboxChange(
                  `${periodsPath}[${index}].fromDate.estimated.value`
                )}
                disabled={isReadOnlyField(
                  `${periodsPath}[${index}].fromDate.estimated`
                )}
                className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="ml-2 text-sm font-medium text-gray-700">Est.</span>
            </label>
            <input
              type="text"
              value={period.toDate?.date?.value || ""}
              onChange={handleInputChange(`${periodsPath}[${index}].toDate.date.value`)}
              disabled={isReadOnlyField(`${periodsPath}[${index}].toDate.date`)}
              placeholder="To Date"
            />
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={period.toDate?.estimated?.value === "Yes"}
                onChange={handleCheckboxChange(
                  `${periodsPath}[${index}].toDate.estimated.value`
                )}
                disabled={isReadOnlyField(
                  `${periodsPath}[${index}].toDate.estimated`
                )}
                className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="ml-2 text-sm font-medium text-gray-700">Est.</span>
            </label>
            <input
              type="text"
              value={period.positionTitle?.value || ""}
              onChange={handleInputChange(
                `${periodsPath}[${index}].positionTitle.value`
              )}
              disabled={isReadOnlyField(`${periodsPath}[${index}].positionTitle`)}
              placeholder="Position Title"
            />
            <input
              type="text"
              value={period.supervisor?.value || ""}
              onChange={handleInputChange(`${periodsPath}[${index}].supervisor.value`)}
              disabled={isReadOnlyField(`${periodsPath}[${index}].supervisor`)}
              placeholder="Supervisor"
            />
            <button
              type="button"
              onClick={() => handleRemovePeriod(index)}
              className="col-span-2 p-2 border rounded text-red-600"
            >
              Remove Additional Period
            </button>
          </div>
        ))}
        {additionalPeriods.length < 4 && (
          <button
            onClick={(e) => {
              e.preventDefault();
              onAddEntry(
                `${path}.additionalPeriods`,
                getDefaultNewItem("employmentInfo.section13A2.additionalPeriods")
              );
            }}
            className="mt-4 p-2 bg-green-500 text-white rounded-md shadow"
          >
            Add Additional Period
          </button>
        )}
      </div>
    );
  };

  const renderEmploymentStatus = (
    employmentStatus: EmploymentStatus | undefined,
    employmentStatusPath: string
  ) => {
    if (!employmentStatus) {
      console.warn(`EmploymentStatus at ${employmentStatusPath} is undefined`);
      return null;
    }
    
    return (
      <div>
        <label>
          <input
            type="checkbox"
            checked={employmentStatus.fullTime?.value === "Yes"}
            onChange={handleCheckboxChange(`${employmentStatusPath}.fullTime.value`)}
            disabled={isReadOnlyField(`${employmentStatusPath}.fullTime`)}
          />
          Full-time
        </label>
        <label>
          <input
            type="checkbox"
            checked={employmentStatus.partTime?.value === "Yes"}
            onChange={handleCheckboxChange(`${employmentStatusPath}.partTime.value`)}
            disabled={isReadOnlyField(`${employmentStatusPath}.partTime`)}
          />
          Part-time
        </label>
      </div>
    );
  };

  const renderPhysicalWorkAddress = (
    physicalWorkAddress: PhysicalWorkAddress | undefined,
    workAddressPath: string
  ) => {
    if (!physicalWorkAddress) {
      console.warn(`PhysicalWorkAddress at ${workAddressPath} is undefined`);
      return null;
    }
    
    return (
      <div>
        <label>
          <input
            type="checkbox"
            checked={physicalWorkAddress.differentThanEmployer?.value === "YES"}
            onChange={handleCheckboxChange(
              `${workAddressPath}.differentThanEmployer.value`
            )}
            disabled={isReadOnlyField(`${workAddressPath}.differentThanEmployer`)}
          />
          Is your physical work address different than your employer&apos;s
          address?
        </label>
        {physicalWorkAddress.differentThanEmployer?.value === "YES" && (
          <>
            {renderAddress(
              physicalWorkAddress.aLocation,
              `${workAddressPath}.aLocation`
            )}
            {renderTelephone(
              physicalWorkAddress.telephone,
              `${workAddressPath}.telephone`
            )}
          </>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <div>
        <label htmlFor="fromDate">From Date:</label>
        <input
          type="text"
          id="fromDate"
          value={data.fromDate?.date?.value || ""}
          onChange={handleInputChange("fromDate.date.value")}
          disabled={isReadOnlyField("fromDate.date")}
        />
      </div>
      <div>
        <label htmlFor="toDate">To Date:</label>
        <input
          type="text"
          id="toDate"
          value={data.toDate?.date?.value || ""}
          onChange={handleInputChange("toDate.date.value")}
          disabled={isReadOnlyField("toDate.date")}
        />
        <label>
          <input
            type="checkbox"
            checked={data.toDate?.present?.value === "Yes"}
            onChange={handleCheckboxChange("toDate.present.value")}
            disabled={isReadOnlyField("toDate.present")}
          />
          Present
        </label>
        <label>
          <input
            type="checkbox"
            checked={data.toDate?.estimated?.value === "Yes"}
            onChange={handleCheckboxChange("toDate.estimated.value")}
            disabled={isReadOnlyField("toDate.estimated")}
          />
          Estimated
        </label>
      </div>
      {renderEmploymentStatus(data.employmentStatus, "employmentStatus")}
      <div>
        <label htmlFor="positionTitle">Position Title:</label>
        <input
          type="text"
          id="positionTitle"
          value={data.positionTitle?.value || ""}
          onChange={handleInputChange("positionTitle.value")}
          disabled={isReadOnlyField("positionTitle")}
        />
      </div>
      <div>
        <label htmlFor="employerName">Employer Name:</label>
        <input
          type="text"
          id="employerName"
          value={data.employerName?.value || ""}
          onChange={handleInputChange("employerName.value")}
          disabled={isReadOnlyField("employerName")}
        />
      </div>
      {renderAddress(data.employerAddress, "employerAddress")}
      {renderTelephone(data.telephone, "telephone")}

      {renderAdditionalPeriods(data.additionalPeriods, "additionalPeriods")}

      {renderPhysicalWorkAddress(
        data.physicalWorkAddress,
        "physicalWorkAddress"
      )}
    </div>
  );
};

export { RenderSection13A2 };
