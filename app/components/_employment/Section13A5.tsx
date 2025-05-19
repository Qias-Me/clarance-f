import { type IncidentDetails, type Section13A5 } from "api/interfaces/sections/employmentInfo";
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

  const renderIncidentDetails = (incidentDetails: IncidentDetails[], detailsPath: string) => (
    <div className="space-y-4 border p-3 rounded bg-gray-50">
      <h4 className="font-medium text-gray-700">Incident Details</h4>
      {incidentDetails.map((detail, index) => (
        <div key={index} className="space-y-3 border-b pb-4 mb-4">
          <div>
            <label className="block font-medium mb-1">Incident Type:</label>
            <div className="space-x-4">
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  name={`incidentType-${index}`}
                  value="Yes"
                  checked={detail.type?.value === "Yes"}
                  onChange={() => 
                    onInputChange(
                      `${path}.${detailsPath}[${index}].type`, 
                      "Yes"
                    )
                  }
                  disabled={isReadOnlyField(`${detailsPath}[${index}].type`)}
                  className="mr-2"
                />
                Yes
              </label>
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  name={`incidentType-${index}`}
                  value="No"
                  checked={detail.type?.value === "No"}
                  onChange={() => 
                    onInputChange(
                      `${path}.${detailsPath}[${index}].type`, 
                      "No"
                    )
                  }
                  disabled={isReadOnlyField(`${detailsPath}[${index}].type`)}
                  className="mr-2"
                />
                No
              </label>
            </div>
          </div>
          <div>
            <label htmlFor={`reason-${index}`} className="block font-medium mb-1">Reason:</label>
            <input
              type="text"
              id={`reason-${index}`}
              value={detail.reason?.value || ""}
              onChange={handleInputChange(`${detailsPath}[${index}].reason`)}
              disabled={isReadOnlyField(`${detailsPath}[${index}].reason`)}
              placeholder="Reason"
              className="w-full p-2 border rounded"
            />
          </div>
          <div>
            <label htmlFor={`departureDate-${index}`} className="block font-medium mb-1">Departure Date:</label>
            <div className="flex flex-wrap items-center space-x-3">
              <input
                type="text"
                id={`departureDate-${index}`}
                value={detail.departureDate?.value || ""}
                onChange={handleInputChange(`${detailsPath}[${index}].departureDate`)}
                disabled={isReadOnlyField(`${detailsPath}[${index}].departureDate`)}
                placeholder="MM/DD/YYYY"
                className="p-2 border rounded"
              />
              <label className="inline-flex items-center mt-2">
                <input
                  type="checkbox"
                  checked={detail.estimated?.value === "Yes"}
                  onChange={(e) =>
                    onInputChange(
                      `${path}.${detailsPath}[${index}].estimated`,
                      e.target.checked ? "Yes" : "No"
                    )
                  }
                  disabled={isReadOnlyField(`${detailsPath}[${index}].estimated`)}
                  className="mr-2"
                />
                Estimated
              </label>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="space-y-5 p-4 bg-white rounded-lg shadow">
      <h3 className="text-lg font-semibold">Section 13A.5 - Employment Incident Details</h3>
      
      <div className="space-y-2">
        <label htmlFor="reasonForLeaving" className="block font-medium">Reason for Leaving:</label>
        <input
          type="text"
          id="reasonForLeaving"
          value={data.reasonForLeaving?.value || ""}
          onChange={handleInputChange("reasonForLeaving")}
          disabled={isReadOnlyField("reasonForLeaving")}
          className="w-full p-2 border rounded"
        />
      </div>
      
      <div className="space-y-2">
        <label className="block font-medium">Have you had any incidents in the last seven years?</label>
        <div className="space-x-4 mt-1">
          <label className="inline-flex items-center">
            <input
              type="radio"
              name="incidentInLastSevenYears"
              value="YES "
              checked={data.incidentInLastSevenYears?.value === "YES "}
              onChange={() => onInputChange(`${path}.incidentInLastSevenYears`, "YES ")}
              disabled={isReadOnlyField("incidentInLastSevenYears")}
              className="mr-2"
            />
            YES
          </label>
          <label className="inline-flex items-center">
            <input
              type="radio"
              name="incidentInLastSevenYears"
              value="NO (If NO, proceed to 13A.6)"
              checked={data.incidentInLastSevenYears?.value === "NO (If NO, proceed to 13A.6)"}
              onChange={() => onInputChange(`${path}.incidentInLastSevenYears`, "NO (If NO, proceed to 13A.6)")}
              disabled={isReadOnlyField("incidentInLastSevenYears")}
              className="mr-2"
            />
            NO (If NO, proceed to 13A.6)
          </label>
        </div>
      </div>
      
      {data.incidentInLastSevenYears?.value === "YES " && data.incidentDetails && 
        renderIncidentDetails(data.incidentDetails, "incidentDetails")}
    </div>
  );
};

export { RenderSection13A5 };
