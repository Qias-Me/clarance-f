import { IncidentDetails, Section13A5 } from "api_v2/interfaces/employmentInfo";
import React from "react";

interface Section13A5Props {
  data: Section13A5;
  onInputChange: (path: string, value: any) => void;
  path: string;
  isReadOnlyField: (fieldName: string) => boolean;
}

const RenderSection13A5: React.FC<Section13A5Props> = ({ data, onInputChange, path, isReadOnlyField }) => {

  const handleInputChange = (fieldPath: string) => (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    onInputChange(`${path}.${fieldPath}`, event.target.value);
  };

  const handleCheckboxChange = (fieldPath: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
    onInputChange(`${path}.${fieldPath}`, event.target.checked);
  };

  const renderIncidentDetails = (incidentDetails: IncidentDetails[], detailsPath: string) => (
    <div>
      {incidentDetails.map((detail, index) => (
        <div key={index} className="space-y-2">
          <div>
            <label htmlFor={`incidentType-${index}`}>Incident Type:</label>
            <select
              id={`incidentType-${index}`}
              value={detail.type}
              onChange={handleInputChange(`${detailsPath}[${index}].type`)}
              disabled={isReadOnlyField(`${detailsPath}[${index}].type`)}
            >
              <option value="fired">Fired</option>
              <option value="quit">Quit</option>
              <option value="mutualAgreementMisconduct">Mutual Agreement (Misconduct)</option>
              <option value="mutualAgreementUnsatisfactory">Mutual Agreement (Unsatisfactory)</option>
            </select>
          </div>
          <div>
            <label htmlFor={`reason-${index}`}>Reason:</label>
            <input
              type="text"
              id={`reason-${index}`}
              value={detail.reason}
              onChange={handleInputChange(`${detailsPath}[${index}].reason`)}
              disabled={isReadOnlyField(`${detailsPath}[${index}].reason`)}
              placeholder="Reason"
            />
          </div>
          <div>
            <label htmlFor={`departureDate-${index}`}>Departure Date:</label>
            <input
              type="text"
              id={`departureDate-${index}`}
              value={detail.departureDate}
              onChange={handleInputChange(`${detailsPath}[${index}].departureDate`)}
              disabled={isReadOnlyField(`${detailsPath}[${index}].departureDate`)}
              placeholder="Departure Date"
            />
            <label>
              <input
                type="checkbox"
                checked={detail.estimated}
                onChange={handleCheckboxChange(`${detailsPath}[${index}].estimated`)}
                disabled={isReadOnlyField(`${detailsPath}[${index}].estimated`)}
              />
              Estimated
            </label>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="space-y-4">
      <div>
        <label htmlFor="reasonForLeaving">Reason for Leaving:</label>
        <input
          type="text"
          id="reasonForLeaving"
          value={data.reasonForLeaving}
          onChange={handleInputChange("reasonForLeaving")}
          disabled={isReadOnlyField("reasonForLeaving")}
        />
      </div>
      <div>
        <label>
          <input
            type="checkbox"
            checked={data.incidentInLastSevenYears}
            onChange={handleCheckboxChange("incidentInLastSevenYears")}
            disabled={isReadOnlyField("incidentInLastSevenYears")}
          />
          Have you had any incidents in the last seven years?
        </label>
      </div>
      {data.incidentInLastSevenYears && renderIncidentDetails(data.incidentDetails || [], "incidentDetails")}
    </div>
  );
};

export { RenderSection13A5 };
