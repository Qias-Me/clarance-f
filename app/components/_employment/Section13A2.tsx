import React from "react";
import {
  Section13A2,
  EmploymentStatus,
  Telephone,
  AdditionalPeriod,
  PhysicalWorkAddress,
  Address,
} from "api_v2/interfaces/employmentInfo";

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

  const renderAddress = (address: Address, addressPath: string) => (
    <div>
      <input
        type="text"
        value={address.street}
        onChange={handleInputChange(`${addressPath}.street`)}
        disabled={isReadOnlyField(`${addressPath}.street`)}
        placeholder="Street"
      />
      <input
        type="text"
        value={address.city}
        onChange={handleInputChange(`${addressPath}.city`)}
        disabled={isReadOnlyField(`${addressPath}.city`)}
        placeholder="City"
      />
      <input
        type="text"
        value={address.state}
        onChange={handleInputChange(`${addressPath}.state`)}
        disabled={isReadOnlyField(`${addressPath}.state`)}
        placeholder="State"
      />
      <input
        type="text"
        value={address.zipCode}
        onChange={handleInputChange(`${addressPath}.zipCode`)}
        disabled={isReadOnlyField(`${addressPath}.zipCode`)}
        placeholder="Zip Code"
      />
      <input
        type="text"
        value={address.country}
        onChange={handleInputChange(`${addressPath}.country`)}
        disabled={isReadOnlyField(`${addressPath}.country`)}
        placeholder="Country"
      />
    </div>
  );

  const renderTelephone = (telephone: Telephone, telephonePath: string) => (
    <div>
      <input
        type="text"
        value={telephone.number}
        onChange={handleInputChange(`${telephonePath}.number`)}
        disabled={isReadOnlyField(`${telephonePath}.number`)}
        placeholder="Phone Number"
      />
      <input
        type="text"
        value={telephone.extension}
        onChange={handleInputChange(`${telephonePath}.extension`)}
        disabled={isReadOnlyField(`${telephonePath}.extension`)}
        placeholder="Extension"
      />
      <label>
        <input
          type="checkbox"
          checked={telephone.internationalOrDsn}
          onChange={handleCheckboxChange(`${telephonePath}.internationalOrDsn`)}
          disabled={isReadOnlyField(`${telephonePath}.internationalOrDsn`)}
        />
        International or DSN
      </label>
      <label>
        <input
          type="checkbox"
          checked={telephone.day}
          onChange={handleCheckboxChange(`${telephonePath}.day`)}
          disabled={isReadOnlyField(`${telephonePath}.day`)}
        />
        Day
      </label>
      <label>
        <input
          type="checkbox"
          checked={telephone.night}
          onChange={handleCheckboxChange(`${telephonePath}.night`)}
          disabled={isReadOnlyField(`${telephonePath}.night`)}
        />
        Night
      </label>
    </div>
  );

  const renderAdditionalPeriods = (
    additionalPeriods: AdditionalPeriod[],
    periodsPath: string
  ) => (
    <div>
      {additionalPeriods.map((period, index) => (
        <div key={index} className="space-y-2">
          <input
            type="text"
            value={period.fromDate}
            onChange={handleInputChange(`${periodsPath}[${index}].fromDate`)}
            disabled={isReadOnlyField(`${periodsPath}[${index}].fromDate`)}
            placeholder="From Date"
          />
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={period.estimatedFrom}
              onChange={handleCheckboxChange(
                `${periodsPath}[${index}].estimatedFromDate`
              )}
              disabled={isReadOnlyField(
                `${periodsPath}[${index}].estimatedFromDate`
              )}
              className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <span className="ml-2 text-sm font-medium text-gray-700">Est.</span>
          </label>
          <input
            type="text"
            value={period.toDate}
            onChange={handleInputChange(`${periodsPath}[${index}].toDate`)}
            disabled={isReadOnlyField(`${periodsPath}[${index}].toDate`)}
            placeholder="To Date"
          />
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={period.estimatedTo}
              onChange={handleCheckboxChange(
                `${periodsPath}[${index}].estimatedToDate`
              )}
              disabled={isReadOnlyField(
                `${periodsPath}[${index}].estimatedToDate`
              )}
              className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <span className="ml-2 text-sm font-medium text-gray-700">Est.</span>
          </label>
          <input
            type="text"
            value={period.positionTitle}
            onChange={handleInputChange(
              `${periodsPath}[${index}].positionTitle`
            )}
            disabled={isReadOnlyField(`${periodsPath}[${index}].positionTitle`)}
            placeholder="Position Title"
          />
          <input
            type="text"
            value={period.supervisor}
            onChange={handleInputChange(`${periodsPath}[${index}].supervisor`)}
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

  const renderEmploymentStatus = (
    employmentStatus: EmploymentStatus,
    employmentStatusPath: string
  ) => (
    <div>
      <label>
        <input
          type="checkbox"
          checked={employmentStatus.fullTime}
          onChange={handleCheckboxChange(`${employmentStatusPath}.fullTime`)}
          disabled={isReadOnlyField(`${employmentStatusPath}.fullTime`)}
        />
        Full-time
      </label>
      <label>
        <input
          type="checkbox"
          checked={employmentStatus.partTime}
          onChange={handleCheckboxChange(`${employmentStatusPath}.partTime`)}
          disabled={isReadOnlyField(`${employmentStatusPath}.partTime`)}
        />
        Part-time
      </label>
    </div>
  );

  const renderPhysicalWorkAddress = (
    physicalWorkAddress: PhysicalWorkAddress,
    workAddressPath: string
  ) => (
    <div>
      <label>
        <input
          type="checkbox"
          checked={physicalWorkAddress.differentThanEmployer}
          onChange={handleCheckboxChange(
            `${workAddressPath}.differentThanEmployer`
          )}
          disabled={isReadOnlyField(`${workAddressPath}.differentThanEmployer`)}
        />
        Is your physical work address different than your employer&apos;s
        address?
      </label>
      {physicalWorkAddress.differentThanEmployer && (
        <>
          {renderAddress(
            physicalWorkAddress.address,
            `${workAddressPath}.address`
          )}
          {renderTelephone(
            physicalWorkAddress.telephone,
            `${workAddressPath}.telephone`
          )}
        </>
      )}
    </div>
  );

  return (
    <div className="space-y-4">
      <div>
        <label htmlFor="fromDate">From Date:</label>
        <input
          type="text"
          id="fromDate"
          value={data.fromDate}
          onChange={handleInputChange("fromDate")}
          disabled={isReadOnlyField("fromDate")}
        />
      </div>
      <div>
        <label htmlFor="toDate">To Date:</label>
        <input
          type="text"
          id="toDate"
          value={data.toDate}
          onChange={handleInputChange("toDate")}
          disabled={isReadOnlyField("toDate")}
        />
        <label>
          <input
            type="checkbox"
            checked={data.present}
            onChange={handleCheckboxChange("present")}
            disabled={isReadOnlyField("present")}
          />
          Present
        </label>
        <label>
          <input
            type="checkbox"
            checked={data.estimated}
            onChange={handleCheckboxChange("estimated")}
            disabled={isReadOnlyField("estimated")}
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
          value={data.positionTitle}
          onChange={handleInputChange("positionTitle")}
          disabled={isReadOnlyField("positionTitle")}
        />
      </div>
      <div>
        <label htmlFor="employerName">Employer Name:</label>
        <input
          type="text"
          id="employerName"
          value={data.employerName}
          onChange={handleInputChange("employerName")}
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
