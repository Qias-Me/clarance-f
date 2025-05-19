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

  const renderAddress = (address: Address, addressPath: string) => (
    <div>
      <input
        type="text"
        value={address?.street?.value || ""}
        onChange={handleInputChange(`${addressPath}.street`)}
        disabled={isReadOnlyField(`${addressPath}.street`)}
        placeholder="Street"
      />
      <input
        type="text"
        value={address?.city?.value || ""}
        onChange={handleInputChange(`${addressPath}.city`)}
        disabled={isReadOnlyField(`${addressPath}.city`)}
        placeholder="City"
      />
      <input
        type="text"
        value={address?.state?.value || ""}
        onChange={handleInputChange(`${addressPath}.state`)}
        disabled={isReadOnlyField(`${addressPath}.state`)}
        placeholder="State"
      />
      <input
        type="text"
        value={address?.zipCode?.value || ""}
        onChange={handleInputChange(`${addressPath}.zipCode`)}
        disabled={isReadOnlyField(`${addressPath}.zipCode`)}
        placeholder="Zip Code"
      />
      <input
        type="text"
        value={address?.country?.value || ""}
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
        value={telephone?.number?.value || ""}
        onChange={handleInputChange(`${telephonePath}.number`)}
        disabled={isReadOnlyField(`${telephonePath}.number`)}
        placeholder="Phone Number"
      />
      <input
        type="text"
        value={telephone?.extension?.value || ""}
        onChange={handleInputChange(`${telephonePath}.extension`)}
        disabled={isReadOnlyField(`${telephonePath}.extension`)}
        placeholder="Extension"
      />
      <label>
        <input
          type="checkbox"
          checked={telephone?.internationalOrDsn?.value === "Yes"}
          onChange={(e) => 
            onInputChange(
              `${path}.${telephonePath}.internationalOrDsn`, 
              e.target.checked ? "Yes" : "No"
            )
          }
          disabled={isReadOnlyField(`${telephonePath}.internationalOrDsn`)}
        />
        International or DSN
      </label>
      <label>
        <input
          type="checkbox"
          checked={telephone?.day?.value === "Yes"}
          onChange={(e) => 
            onInputChange(
              `${path}.${telephonePath}.day`, 
              e.target.checked ? "Yes" : "No"
            )
          }
          disabled={isReadOnlyField(`${telephonePath}.day`)}
        />
        Day
      </label>
      <label>
        <input
          type="checkbox"
          checked={telephone?.night?.value === "Yes"}
          onChange={(e) => 
            onInputChange(
              `${path}.${telephonePath}.night`, 
              e.target.checked ? "Yes" : "No"
            )
          }
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
          checked={employmentStatus?.fullTime?.value === "Yes"}
          onChange={(e) => 
            onInputChange(
              `${path}.${employmentStatusPath}.fullTime`, 
              e.target.checked ? "Yes" : "No"
            )
          }
          disabled={isReadOnlyField(`${employmentStatusPath}.fullTime`)}
        />
        Full-time
      </label>
      <label>
        <input
          type="checkbox"
          checked={employmentStatus?.partTime?.value === "Yes"}
          onChange={(e) => 
            onInputChange(
              `${path}.${employmentStatusPath}.partTime`, 
              e.target.checked ? "Yes" : "No"
            )
          }
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
          type="radio"
          name={`${workAddressPath}.differentThanEmployer`}
          value="YES"
          checked={physicalWorkAddress?.differentThanEmployer?.value === "YES"}
          onChange={() => onInputChange(`${path}.${workAddressPath}.differentThanEmployer`, "YES")}
          disabled={isReadOnlyField(`${workAddressPath}.differentThanEmployer`)}
        />
        YES
      </label>
      <label>
        <input
          type="radio"
          name={`${workAddressPath}.differentThanEmployer`}
          value="NO (If NO, proceed to (b))"
          checked={physicalWorkAddress?.differentThanEmployer?.value === "NO (If NO, proceed to (b))"}
          onChange={() => onInputChange(`${path}.${workAddressPath}.differentThanEmployer`, "NO (If NO, proceed to (b))")}
          disabled={isReadOnlyField(`${workAddressPath}.differentThanEmployer`)}
        />
        NO (If NO, proceed to (b))
      </label>
      
      {physicalWorkAddress?.differentThanEmployer?.value === "YES" && (
        <>
          {physicalWorkAddress.aLocation && renderAddress(
            physicalWorkAddress.aLocation,
            `${workAddressPath}.aLocation`
          )}
          
          <div>
            <label>
              <input
                type="radio"
                name={`${workAddressPath}.hasApoFpoAddress`}
                value="YES "
                checked={physicalWorkAddress?.hasApoFpoAddress?.value === "YES "}
                onChange={() => onInputChange(`${path}.${workAddressPath}.hasApoFpoAddress`, "YES ")}
                disabled={isReadOnlyField(`${workAddressPath}.hasApoFpoAddress`)}
              />
              YES
            </label>
            <label>
              <input
                type="radio"
                name={`${workAddressPath}.hasApoFpoAddress`}
                value="NO"
                checked={physicalWorkAddress?.hasApoFpoAddress?.value === "NO"}
                onChange={() => onInputChange(`${path}.${workAddressPath}.hasApoFpoAddress`, "NO")}
                disabled={isReadOnlyField(`${workAddressPath}.hasApoFpoAddress`)}
              />
              NO
            </label>
          </div>
          
          {physicalWorkAddress?.hasApoFpoAddress?.value === "YES " && 
            physicalWorkAddress.apoFpoAddress && 
            renderApoFpoAddress(
              physicalWorkAddress.apoFpoAddress,
              `${workAddressPath}.apoFpoAddress`
            )
          }
          
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
      <div>
        <label htmlFor={`${apoFpoPath}.street`}>Street:</label>
        <input
          type="text"
          id={`${apoFpoPath}.street`}
          value={apoFpoAddress?.street?.value || ""}
          onChange={handleInputChange(`${apoFpoPath}.street`)}
          disabled={isReadOnlyField(`${apoFpoPath}.street`)}
          placeholder="Street"
        />
      </div>
      <div>
        <label htmlFor={`${apoFpoPath}.apoOrFpo`}>APO/FPO:</label>
        <input
          type="text"
          id={`${apoFpoPath}.apoOrFpo`}
          value={apoFpoAddress?.apoOrFpo?.value || ""}
          onChange={handleInputChange(`${apoFpoPath}.apoOrFpo`)}
          disabled={isReadOnlyField(`${apoFpoPath}.apoOrFpo`)}
          placeholder="APO or FPO"
        />
      </div>
      <div>
        <label htmlFor={`${apoFpoPath}.apoFpoStateCode`}>State Code:</label>
        <input
          type="text"
          id={`${apoFpoPath}.apoFpoStateCode`}
          value={apoFpoAddress?.apoFpoStateCode?.value || ""}
          onChange={handleInputChange(`${apoFpoPath}.apoFpoStateCode`)}
          disabled={isReadOnlyField(`${apoFpoPath}.apoFpoStateCode`)}
          placeholder="APO/FPO State Code"
        />
      </div>
      <div>
        <label htmlFor={`${apoFpoPath}.zipCode`}>Zip Code:</label>
        <input
          type="text"
          id={`${apoFpoPath}.zipCode`}
          value={apoFpoAddress?.zipCode?.value || ""}
          onChange={handleInputChange(`${apoFpoPath}.zipCode`)}
          disabled={isReadOnlyField(`${apoFpoPath}.zipCode`)}
          placeholder="Zip Code"
        />
      </div>
    </div>
  );

  const renderSelfEmploymentVerifier = (
    verifier: SelfEmploymentVerifier,
    verifierPath: string
  ) => (
    <div>
      <div>
        <label htmlFor={`${verifierPath}.lastName`}>Last Name:</label>
        <input
          type="text"
          id={`${verifierPath}.lastName`}
          value={verifier?.lastName?.value || ""}
          onChange={handleInputChange(`${verifierPath}.lastName`)}
          disabled={isReadOnlyField(`${verifierPath}.lastName`)}
          placeholder="Last Name"
        />
      </div>
      <div>
        <label htmlFor={`${verifierPath}.firstName`}>First Name:</label>
        <input
          type="text"
          id={`${verifierPath}.firstName`}
          value={verifier?.firstName?.value || ""}
          onChange={handleInputChange(`${verifierPath}.firstName`)}
          disabled={isReadOnlyField(`${verifierPath}.firstName`)}
          placeholder="First Name"
        />
      </div>
      
      <h4>Address</h4>
      {renderAddress(verifier.address, `${verifierPath}.address`)}
      
      <h4>Telephone</h4>
      {renderTelephone(verifier.telephone, `${verifierPath}.telephone`)}
      
      <div>
        <label>
          <input
            type="radio"
            name={`${verifierPath}.hasAPOFPOAddress`}
            value="YES "
            checked={verifier?.hasAPOFPOAddress?.value === "YES "}
            onChange={() => onInputChange(`${path}.${verifierPath}.hasAPOFPOAddress`, "YES ")}
            disabled={isReadOnlyField(`${verifierPath}.hasAPOFPOAddress`)}
          />
          YES
        </label>
        <label>
          <input
            type="radio"
            name={`${verifierPath}.hasAPOFPOAddress`}
            value="NO"
            checked={verifier?.hasAPOFPOAddress?.value === "NO"}
            onChange={() => onInputChange(`${path}.${verifierPath}.hasAPOFPOAddress`, "NO")}
            disabled={isReadOnlyField(`${verifierPath}.hasAPOFPOAddress`)}
          />
          NO
        </label>
      </div>
      
      {verifier?.hasAPOFPOAddress?.value === "YES " && 
        verifier.apoFpoAddress && (
          <div>
            <h4>APO/FPO Address</h4>
            {renderApoFpoAddress(
              verifier.apoFpoAddress,
              `${verifierPath}.apoFpoAddress`
            )}
          </div>
        )
      }
    </div>
  );

  return (
    <div className="space-y-4">
      <div>
        <label htmlFor="fromDate">From Date:</label>
        <input
          type="text"
          id="fromDate"
          value={data.fromDate?.date?.value || ""}
          onChange={handleInputChange("fromDate.date")}
          disabled={isReadOnlyField("fromDate.date")}
        />
        <label>
          <input
            type="checkbox"
            checked={data.fromDate?.estimated?.value === "Yes"}
            onChange={(e) =>
              onInputChange(
                `${path}.fromDate.estimated`,
                e.target.checked ? "Yes" : "No"
              )
            }
            disabled={isReadOnlyField("fromDate.estimated")}
          />
          Estimated
        </label>
      </div>
      <div>
        <label htmlFor="toDate">To Date:</label>
        <input
          type="text"
          id="toDate"
          value={data.toDate?.date?.value || ""}
          onChange={handleInputChange("toDate.date")}
          disabled={isReadOnlyField("toDate.date")}
        />
        <label>
          <input
            type="checkbox"
            checked={data.toDate?.present?.value === "Yes"}
            onChange={(e) =>
              onInputChange(
                `${path}.toDate.present`,
                e.target.checked ? "Yes" : "No"
              )
            }
            disabled={isReadOnlyField("toDate.present")}
          />
          Present
        </label>
        <label>
          <input
            type="checkbox"
            checked={data.toDate?.estimated?.value === "Yes"}
            onChange={(e) =>
              onInputChange(
                `${path}.toDate.estimated`,
                e.target.checked ? "Yes" : "No"
              )
            }
            disabled={isReadOnlyField("toDate.estimated")}
          />
          Estimated
        </label>
      </div>

      <div>
        <h4>Employment Status</h4>
        {renderEmploymentStatus(data.employmentStatus, "employmentStatus")}
      </div>

      <div>
        <label htmlFor="positionTitle">Position Title:</label>
        <input
          type="text"
          id="positionTitle"
          value={data.positionTitle?.value || ""}
          onChange={handleInputChange("positionTitle")}
          disabled={isReadOnlyField("positionTitle")}
        />
      </div>

      <div>
        <label htmlFor="employmentName">Employment Name:</label>
        <input
          type="text"
          id="employmentName"
          value={data.employmentName?.value || ""}
          onChange={handleInputChange("employmentName")}
          disabled={isReadOnlyField("employmentName")}
        />
      </div>

      <div>
        <h4>Employment Address</h4>
        {renderAddress(data.employmentAddress, "employmentAddress")}
      </div>

      <div>
        <h4>Telephone</h4>
        {renderTelephone(data.telephone, "telephone")}
      </div>

      <div>
        <h4>Physical Work Address</h4>
        {renderPhysicalWorkAddress(data.physicalWorkAddress, "physicalWorkAddress")}
      </div>

      <div>
        <h4>Self Employment Verifier</h4>
        {renderSelfEmploymentVerifier(
          data.selfEmploymentVerifier,
          "selfEmploymentVerifier"
        )}
      </div>
    </div>
  );
};

export { RenderSection13A3 };
