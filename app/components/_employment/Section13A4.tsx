import React from "react";
import {
  type Section13A4,
  type Verifier,
  type ApoFpoAddress,
  type Address,
  type Telephone,
} from "api/interfaces/sections/employmentInfo";

interface Section13A4Props {
  data: Section13A4;
  onInputChange: (path: string, value: any) => void;
  path: string;
  isReadOnlyField: (fieldName: string) => boolean;
}

const RenderSection13A4: React.FC<Section13A4Props> = ({
  data,
  onInputChange,
  path,
  isReadOnlyField,
}) => {
  const handleCheckboxChange =
    (fieldPath: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
      onInputChange(`${path}.${fieldPath}`, event.target.checked);
    };

  const handleInputChange =
    (fieldPath: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
      onInputChange(`${path}.${fieldPath}`, event.target.value);
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
          checked={telephone.internationalOrDsn || false}
          onChange={handleCheckboxChange(`${telephonePath}.internationalOrDsn`)}
          disabled={isReadOnlyField(`${telephonePath}.internationalOrDsn`)}
        />
        International or DSN
      </label>
      <label>
        <input
          type="checkbox"
          checked={telephone.day || false}
          onChange={handleCheckboxChange(`${telephonePath}.day`)}
          disabled={isReadOnlyField(`${telephonePath}.day`)}
        />
        Day
      </label>
      <label>
        <input
          type="checkbox"
          checked={telephone.night || false}
          onChange={handleCheckboxChange(`${telephonePath}.night`)}
          disabled={isReadOnlyField(`${telephonePath}.night`)}
        />
        Night
      </label>
    </div>
  );

  const renderVerifier = (verifier: Verifier, verifierPath: string) => (
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
      <label>
        <input
          type="checkbox"
          checked={verifier.hasApoAddress || false}
          onChange={handleCheckboxChange(`${verifierPath}.hasApoAddress`)}
          disabled={isReadOnlyField(`${verifierPath}.hasApoAddress`)}
        />
        Has APO/FPO Address
      </label>
      {verifier.hasApoAddress &&
        renderApoFpoAddress(
          verifier.apoFpoAddress,
          `${verifierPath}.apoFpoAddress`
        )}
    </div>
  );

  const renderApoFpoAddress = (
    apoFpoAddress?: ApoFpoAddress,
    apoFpoPath?: string
  ) => {
    if (!apoFpoAddress || !apoFpoPath) {
      return null;
    }

    return (
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
  };

  return (
    <div className="space-y-4">
      <div>
        <label htmlFor="fromDate">From Date:</label>
        <input
          type="text"
          id="fromDate"
          value={data.fromDate}
          onChange={handleInputChange(`fromDate`)}
          disabled={isReadOnlyField("fromDate")}
        />
      </div>
      <div>
        <label htmlFor="toDate">To Date:</label>
        <input
          type="text"
          id="toDate"
          value={data.toDate}
          onChange={handleInputChange(`toDate`)}
          disabled={isReadOnlyField("toDate")}
        />
        <label>
          <input
            type="checkbox"
            checked={data.present || false}
            onChange={handleCheckboxChange(`present`)}
            disabled={isReadOnlyField("present")}
          />
          Present
        </label>
        <label>
          <input
            type="checkbox"
            checked={data.estimated || false}
            onChange={handleCheckboxChange(`estimated`)}
            disabled={isReadOnlyField("estimated")}
          />
          Estimated
        </label>
      </div>
      {renderVerifier(data.verifier, "verifier")}
    </div>
  );
};

export { RenderSection13A4 };
