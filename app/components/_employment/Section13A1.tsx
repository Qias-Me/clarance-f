import {
  type Address,
  type ApoFpoAddress,
  type EmploymentStatus,
  type Section13A1,
  type Supervisor13A1,
  type Telephone,
} from "api/interfaces/sections/employmentInfo";
import React from "react";

interface Section13A1Props {
  data: Section13A1;
  onInputChange: (path: string, value: any) => void;
  path: string;
  isReadOnlyField: (fieldName: string) => boolean;
}

const RenderSection13A1: React.FC<Section13A1Props> = ({
  data,
  onInputChange,
  path,
  isReadOnlyField,
}) => {
  const handleInputChange =
    (fieldPath: string) =>
    (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      console.log(path, fieldPath, event.target.value, "inCompoenent")
      onInputChange(`${path}.${fieldPath}`, event.target.value);
    };

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
        <label htmlFor="employmentStatus">Employment Status:</label>
        <div>
          <label>
            <input
              type="checkbox"
              checked={data.employmentStatus?.fullTime?.value === "Yes"}
              onChange={(e) =>
                onInputChange(
                  `${path}.employmentStatus.fullTime`,
                  e.target.checked ? "Yes" : "No"
                )
              }
              disabled={isReadOnlyField("employmentStatus.fullTime")}
            />
            Full Time
          </label>
          <label>
            <input
              type="checkbox"
              checked={data.employmentStatus?.partTime?.value === "Yes"}
              onChange={(e) =>
                onInputChange(
                  `${path}.employmentStatus.partTime`,
                  e.target.checked ? "Yes" : "No"
                )
              }
              disabled={isReadOnlyField("employmentStatus.partTime")}
            />
            Part Time
          </label>
        </div>
      </div>
      <div>
        <label htmlFor="dutyStation">Duty Station:</label>
        <input
          type="text"
          id="dutyStation"
          value={data.dutyStation?.value || ""}
          onChange={handleInputChange("dutyStation")}
          disabled={isReadOnlyField("dutyStation")}
        />
      </div>
      <div>
        <label htmlFor="rankOrPosition">Rank/Position:</label>
        <input
          type="text"
          id="rankOrPosition"
          value={data.rankOrPosition?.value || ""}
          onChange={handleInputChange("rankOrPosition")}
          disabled={isReadOnlyField("rankOrPosition")}
        />
      </div>
      {/* Address section */}
      <div className="address-section">
        <h4>Address</h4>
        <div>
          <label htmlFor="address.street">Street:</label>
          <input
            type="text"
            id="address.street"
            value={data.address?.street?.value || ""}
            onChange={handleInputChange("address.street")}
            disabled={isReadOnlyField("address.street")}
          />
        </div>
        <div>
          <label htmlFor="address.city">City:</label>
          <input
            type="text"
            id="address.city"
            value={data.address?.city?.value || ""}
            onChange={handleInputChange("address.city")}
            disabled={isReadOnlyField("address.city")}
          />
        </div>
        <div>
          <label htmlFor="address.state">State:</label>
          <input
            type="text"
            id="address.state"
            value={data.address?.state?.value || ""}
            onChange={handleInputChange("address.state")}
            disabled={isReadOnlyField("address.state")}
          />
        </div>
        <div>
          <label htmlFor="address.zipCode">Zip Code:</label>
          <input
            type="text"
            id="address.zipCode"
            value={data.address?.zipCode?.value || ""}
            onChange={handleInputChange("address.zipCode")}
            disabled={isReadOnlyField("address.zipCode")}
          />
        </div>
        <div>
          <label htmlFor="address.country">Country:</label>
          <input
            type="text"
            id="address.country"
            value={data.address?.country?.value || ""}
            onChange={handleInputChange("address.country")}
            disabled={isReadOnlyField("address.country")}
          />
        </div>
      </div>

      {/* Telephone section */}
      <div className="telephone-section">
        <h4>Telephone</h4>
        <div>
          <label htmlFor="telephone.number">Number:</label>
          <input
            type="text"
            id="telephone.number"
            value={data.telephone?.number?.value || ""}
            onChange={handleInputChange("telephone.number")}
            disabled={isReadOnlyField("telephone.number")}
          />
        </div>
        <div>
          <label htmlFor="telephone.extension">Extension:</label>
          <input
            type="text"
            id="telephone.extension"
            value={data.telephone?.extension?.value || ""}
            onChange={handleInputChange("telephone.extension")}
            disabled={isReadOnlyField("telephone.extension")}
          />
        </div>
        <div>
          <label>
            <input
              type="checkbox"
              checked={data.telephone?.internationalOrDsn?.value === "Yes"}
              onChange={(e) =>
                onInputChange(
                  `${path}.telephone.internationalOrDsn`,
                  e.target.checked ? "Yes" : "No"
                )
              }
              disabled={isReadOnlyField("telephone.internationalOrDsn")}
            />
            International/DSN
          </label>
        </div>
        <div>
          <label>
            <input
              type="checkbox"
              checked={data.telephone?.day?.value === "Yes"}
              onChange={(e) =>
                onInputChange(
                  `${path}.telephone.day`,
                  e.target.checked ? "Yes" : "No"
                )
              }
              disabled={isReadOnlyField("telephone.day")}
            />
            Day
          </label>
          <label>
            <input
              type="checkbox"
              checked={data.telephone?.night?.value === "Yes"}
              onChange={(e) =>
                onInputChange(
                  `${path}.telephone.night`,
                  e.target.checked ? "Yes" : "No"
                )
              }
              disabled={isReadOnlyField("telephone.night")}
            />
            Night
          </label>
        </div>
      </div>

      {/* APO/FPO Address section */}
      <div>
        <label>
          <input
            type="radio"
            name="hasAPOFPOAddress"
            value="YES "
            checked={data.hasAPOFPOAddress?.value === "YES "}
            onChange={handleInputChange("hasAPOFPOAddress")}
            disabled={isReadOnlyField("hasAPOFPOAddress")}
          />
          YES
        </label>
        <label>
          <input
            type="radio"
            name="hasAPOFPOAddress"
            value="NO (If NO, proceed to (b))"
            checked={data.hasAPOFPOAddress?.value === "NO (If NO, proceed to (b))"}
            onChange={handleInputChange("hasAPOFPOAddress")}
            disabled={isReadOnlyField("hasAPOFPOAddress")}
          />
          NO (If NO, proceed to (b))
        </label>
      </div>

      {data.hasAPOFPOAddress?.value === "YES " && (
        <div className="apo-fpo-section">
          <h4>APO/FPO Address</h4>
          <div>
            <label htmlFor="apoFPOAddress.street">Street:</label>
            <input
              type="text"
              id="apoFPOAddress.street"
              value={data.apoFPOAddress?.street?.value || ""}
              onChange={handleInputChange("apoFPOAddress.street")}
              disabled={isReadOnlyField("apoFPOAddress.street")}
            />
          </div>
          <div>
            <label htmlFor="apoFPOAddress.apoOrFpo">APO/FPO:</label>
            <input
              type="text"
              id="apoFPOAddress.apoOrFpo"
              value={data.apoFPOAddress?.apoOrFpo?.value || ""}
              onChange={handleInputChange("apoFPOAddress.apoOrFpo")}
              disabled={isReadOnlyField("apoFPOAddress.apoOrFpo")}
            />
          </div>
          <div>
            <label htmlFor="apoFPOAddress.apoFpoStateCode">State Code:</label>
            <input
              type="text"
              id="apoFPOAddress.apoFpoStateCode"
              value={data.apoFPOAddress?.apoFpoStateCode?.value || ""}
              onChange={handleInputChange("apoFPOAddress.apoFpoStateCode")}
              disabled={isReadOnlyField("apoFPOAddress.apoFpoStateCode")}
            />
          </div>
          <div>
            <label htmlFor="apoFPOAddress.zipCode">Zip Code:</label>
            <input
              type="text"
              id="apoFPOAddress.zipCode"
              value={data.apoFPOAddress?.zipCode?.value || ""}
              onChange={handleInputChange("apoFPOAddress.zipCode")}
              disabled={isReadOnlyField("apoFPOAddress.zipCode")}
            />
          </div>
        </div>
      )}

      {/* Supervisor section */}
      <div className="supervisor-section">
        <h4>Supervisor</h4>
        <div>
          <label htmlFor="supervisor.name">Name:</label>
          <input
            type="text"
            id="supervisor.name"
            value={data.supervisor?.name?.value || ""}
            onChange={handleInputChange("supervisor.name")}
            disabled={isReadOnlyField("supervisor.name")}
          />
        </div>
        <div>
          <label htmlFor="supervisor.rankOrPosition">Rank/Position:</label>
          <input
            type="text"
            id="supervisor.rankOrPosition"
            value={data.supervisor?.rankOrPosition?.value || ""}
            onChange={handleInputChange("supervisor.rankOrPosition")}
            disabled={isReadOnlyField("supervisor.rankOrPosition")}
          />
        </div>
        <div>
          <label htmlFor="supervisor.email">Email:</label>
          <input
            type="email"
            id="supervisor.email"
            value={data.supervisor?.email?.value || ""}
            onChange={handleInputChange("supervisor.email")}
            disabled={isReadOnlyField("supervisor.email")}
          />
          <label>
            <input
              type="checkbox"
              checked={data.supervisor?.emailUnknown?.value === "Yes"}
              onChange={(e) =>
                onInputChange(
                  `${path}.supervisor.emailUnknown`,
                  e.target.checked ? "Yes" : "No"
                )
              }
              disabled={isReadOnlyField("supervisor.emailUnknown")}
            />
            Email Unknown
          </label>
        </div>
        
        {/* Supervisor Phone Fields */}
        <div className="supervisor-phone">
          <h5>Phone</h5>
          <div>
            <label htmlFor="supervisor.phone.number">Number:</label>
            <input
              type="text"
              id="supervisor.phone.number"
              value={data.supervisor?.phone?.number?.value || ""}
              onChange={handleInputChange("supervisor.phone.number")}
              disabled={isReadOnlyField("supervisor.phone.number")}
            />
          </div>
          <div>
            <label htmlFor="supervisor.phone.extension">Extension:</label>
            <input
              type="text"
              id="supervisor.phone.extension"
              value={data.supervisor?.phone?.extension?.value || ""}
              onChange={handleInputChange("supervisor.phone.extension")}
              disabled={isReadOnlyField("supervisor.phone.extension")}
            />
          </div>
          <div>
            <label>
              <input
                type="checkbox"
                checked={data.supervisor?.phone?.internationalOrDsn?.value === "Yes"}
                onChange={(e) =>
                  onInputChange(
                    `${path}.supervisor.phone.internationalOrDsn`,
                    e.target.checked ? "Yes" : "No"
                  )
                }
                disabled={isReadOnlyField("supervisor.phone.internationalOrDsn")}
              />
              International/DSN
            </label>
          </div>
          <div>
            <label>
              <input
                type="checkbox"
                checked={data.supervisor?.phone?.day?.value === "Yes"}
                onChange={(e) =>
                  onInputChange(
                    `${path}.supervisor.phone.day`,
                    e.target.checked ? "Yes" : "No"
                  )
                }
                disabled={isReadOnlyField("supervisor.phone.day")}
              />
              Day
            </label>
            <label>
              <input
                type="checkbox"
                checked={data.supervisor?.phone?.night?.value === "Yes"}
                onChange={(e) =>
                  onInputChange(
                    `${path}.supervisor.phone.night`,
                    e.target.checked ? "Yes" : "No"
                  )
                }
                disabled={isReadOnlyField("supervisor.phone.night")}
              />
              Night
            </label>
          </div>
        </div>
        
        {/* Supervisor Physical Work Location Fields */}
        <div className="supervisor-location">
          <h5>Physical Work Location</h5>
          <div>
            <label htmlFor="supervisor.physicalWorkLocation.street">Street:</label>
            <input
              type="text"
              id="supervisor.physicalWorkLocation.street"
              value={data.supervisor?.physicalWorkLocation?.street?.value || ""}
              onChange={handleInputChange("supervisor.physicalWorkLocation.street")}
              disabled={isReadOnlyField("supervisor.physicalWorkLocation.street")}
            />
          </div>
          <div>
            <label htmlFor="supervisor.physicalWorkLocation.city">City:</label>
            <input
              type="text"
              id="supervisor.physicalWorkLocation.city"
              value={data.supervisor?.physicalWorkLocation?.city?.value || ""}
              onChange={handleInputChange("supervisor.physicalWorkLocation.city")}
              disabled={isReadOnlyField("supervisor.physicalWorkLocation.city")}
            />
          </div>
          <div>
            <label htmlFor="supervisor.physicalWorkLocation.state">State:</label>
            <input
              type="text"
              id="supervisor.physicalWorkLocation.state"
              value={data.supervisor?.physicalWorkLocation?.state?.value || ""}
              onChange={handleInputChange("supervisor.physicalWorkLocation.state")}
              disabled={isReadOnlyField("supervisor.physicalWorkLocation.state")}
            />
          </div>
          <div>
            <label htmlFor="supervisor.physicalWorkLocation.zipCode">Zip Code:</label>
            <input
              type="text"
              id="supervisor.physicalWorkLocation.zipCode"
              value={data.supervisor?.physicalWorkLocation?.zipCode?.value || ""}
              onChange={handleInputChange("supervisor.physicalWorkLocation.zipCode")}
              disabled={isReadOnlyField("supervisor.physicalWorkLocation.zipCode")}
            />
          </div>
          <div>
            <label htmlFor="supervisor.physicalWorkLocation.country">Country:</label>
            <input
              type="text"
              id="supervisor.physicalWorkLocation.country"
              value={data.supervisor?.physicalWorkLocation?.country?.value || ""}
              onChange={handleInputChange("supervisor.physicalWorkLocation.country")}
              disabled={isReadOnlyField("supervisor.physicalWorkLocation.country")}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export { RenderSection13A1 };
