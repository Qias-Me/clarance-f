import React from "react";
import {
  type Section13A3,
  type EmploymentStatus,
  type Address,
  type Telephone,
  type PhysicalWorkAddress,
  type ApoFpoAddress,
  type SelfEmploymentVerifier,
} from "api/interfaces/sections/employmentInfo";

interface Section13A3Props {
  data: Section13A3;
  onInputChange: (path: string, value: any) => void;
  path: string;
  isReadOnlyField: (fieldName: string) => boolean;
}

const RenderSection13A3: React.FC<Section13A3Props> = ({
  data,
  onInputChange,
  path,
  isReadOnlyField,
}) => {
  const handleInputChange =
    (fieldPath: string) =>
    (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      onInputChange(`${path}.${fieldPath}`, event.target.value);
    };

  const handleCheckboxChange =
    (fieldPath: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
      onInputChange(`${path}.${fieldPath}`, event.target.checked);
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

  const renderApoFpoAddress = (
    apoFpoAddress: ApoFpoAddress,
    apoFpoPath: string
  ) => (
    <div>
      {renderAddress(
        apoFpoAddress.physicalLocationData,
        `${apoFpoPath}.physicalLocationData`
      )}
      {renderAddress(
        apoFpoAddress.physicalWorkLocation,
        `${apoFpoPath}.physicalWorkLocation`
      )}
      <input
        type="text"
        value={apoFpoAddress.apoOrFpo}
        onChange={handleInputChange(`${apoFpoPath}.apoOrFpo`)}
        disabled={isReadOnlyField(`${apoFpoPath}.apoOrFpo`)}
        placeholder="APO or FPO"
      />
      <input
        type="text"
        value={apoFpoAddress.apoFpoStateCode}
        onChange={handleInputChange(`${apoFpoPath}.apoFpoStateCode`)}
        disabled={isReadOnlyField(`${apoFpoPath}.apoFpoStateCode`)}
        placeholder="APO/FPO State Code"
      />
    </div>
  );

  const renderSelfEmploymentVerifier = (
    verifier: SelfEmploymentVerifier,
    verifierPath: string
  ) => (
    <div>
      <input
        type="text"
        value={verifier.lastName}
        onChange={handleInputChange(`${verifierPath}.lastName`)}
        disabled={isReadOnlyField(`${verifierPath}.lastName`)}
        placeholder="Last Name"
      />
      <input
        type="text"
        value={verifier.firstName}
        onChange={handleInputChange(`${verifierPath}.firstName`)}
        disabled={isReadOnlyField(`${verifierPath}.firstName`)}
        placeholder="First Name"
      />
      {renderAddress(verifier.address, `${verifierPath}.address`)}
      {renderTelephone(verifier.telephone, `${verifierPath}.telephone`)}
      {renderApoFpoAddress(
        verifier.apoFpoAddress,
        `${verifierPath}.apoFpoAddress`
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
        <label htmlFor="employmentName">Employment Name:</label>
        <input
          type="text"
          id="employmentName"
          value={data.employmentName}
          onChange={handleInputChange("employmentName")}
          disabled={isReadOnlyField("employmentName")}
        />
      </div>
      {renderAddress(data.employmentAddress, "employmentAddress")}
      {renderTelephone(data.telephone, "telephone")}
      {renderPhysicalWorkAddress(
        data.physicalWorkAddress,
        "physicalWorkAddress"
      )}
      {renderApoFpoAddress(data.apoFpoAddress, "apoFpoAddress")}
      {renderSelfEmploymentVerifier(
        data.selfEmploymentVerifier,
        "selfEmploymentVerifier"
      )}
    </div>
  );
};

export { RenderSection13A3 };
