import React from "react";
import { type Section13A6, type WarningDetails } from "api/interfaces/sections/employmentInfo";


interface Section13A6Props {
  data: Section13A6;
  onInputChange: (path: string, value: any) => void;
  path: string;
  isReadOnlyField: (fieldName: string) => boolean;
}

const RenderSection13A6: React.FC<Section13A6Props> = ({ data, onInputChange, path, isReadOnlyField }) => {

  const handleInputChange = (fieldPath: string) => (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    onInputChange(`${path}.${fieldPath}`, event.target.value);
  };

  const renderWarningDetails = (warningDetails: WarningDetails[], detailsPath: string) => (
    <div className="space-y-4 border p-3 rounded bg-gray-50 mt-3">
      <h4 className="font-medium text-gray-700">Warning Details</h4>
      {warningDetails.map((detail, index) => (
        <div key={index} className="space-y-3 border-b pb-4 mb-4">
          <div>
            <label htmlFor={`reason-${index}`} className="block font-medium mb-1">Reason:</label>
            <input
              type="text"
              id={`reason-${index}`}
              value={detail.reason?.value || ""}
              onChange={handleInputChange(`${detailsPath}[${index}].reason`)}
              disabled={isReadOnlyField(`${detailsPath}[${index}].reason`)}
              placeholder="Reason for warning"
              className="w-full p-2 border rounded"
            />
          </div>
          <div>
            <label htmlFor={`date-${index}`} className="block font-medium mb-1">Warning Date:</label>
            <div className="flex flex-wrap items-center space-x-3">
              <input
                type="text"
                id={`date-${index}`}
                value={detail.date?.date?.value || ""}
                onChange={handleInputChange(`${detailsPath}[${index}].date.date`)}
                disabled={isReadOnlyField(`${detailsPath}[${index}].date.date`)}
                placeholder="MM/DD/YYYY"
                className="p-2 border rounded"
              />
              <div className="flex items-center space-x-4 mt-2">
                <label className="inline-flex items-center">
                  <input
                    type="checkbox"
                    checked={detail.date?.estimated?.value === "Yes"}
                    onChange={(e) =>
                      onInputChange(
                        `${path}.${detailsPath}[${index}].date.estimated`,
                        e.target.checked ? "Yes" : "No"
                      )
                    }
                    disabled={isReadOnlyField(`${detailsPath}[${index}].date.estimated`)}
                    className="mr-2"
                  />
                  Estimated
                </label>
                {detail.date?.present !== undefined && (
                  <label className="inline-flex items-center">
                    <input
                      type="checkbox"
                      checked={detail.date?.present?.value === "Yes"}
                      onChange={(e) =>
                        onInputChange(
                          `${path}.${detailsPath}[${index}].date.present`,
                          e.target.checked ? "Yes" : "No"
                        )
                      }
                      disabled={isReadOnlyField(`${detailsPath}[${index}].date.present`)}
                      className="mr-2"
                    />
                    Present
                  </label>
                )}
              </div>
            </div>
          </div>
        </div>
      ))}
      
      {warningDetails.length > 0 && warningDetails.length < 5 && (
        <div className="text-right">
          <button 
            onClick={() => {
              // This would need proper implementation with getDefaultNewItem and onAddEntry
              // Placeholder for potential future enhancement
              console.log("Add warning detail button clicked");
            }}
            className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
            type="button"
          >
            Add Another Warning
          </button>
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-5 p-4 bg-white rounded-lg shadow">
      <h3 className="text-lg font-semibold">Section 13A.6 - Employment Warnings</h3>
      
      <div className="space-y-2">
        <label className="block font-medium">Have you been warned, reprimanded, or disciplined in the last seven years?</label>
        <div className="space-x-4 mt-1">
          <label className="inline-flex items-center">
            <input
              type="radio"
              name="warnedInLastSevenYears"
              value="YES"
              checked={data.warnedInLastSevenYears?.value === "YES"}
              onChange={() => onInputChange(`${path}.warnedInLastSevenYears`, "YES")}
              disabled={isReadOnlyField("warnedInLastSevenYears")}
              className="mr-2"
            />
            YES
          </label>
          <label className="inline-flex items-center">
            <input
              type="radio"
              name="warnedInLastSevenYears"
              value="NO "
              checked={data.warnedInLastSevenYears?.value === "NO "}
              onChange={() => onInputChange(`${path}.warnedInLastSevenYears`, "NO ")}
              disabled={isReadOnlyField("warnedInLastSevenYears")}
              className="mr-2"
            />
            NO
          </label>
        </div>
      </div>
      
      {data.warnedInLastSevenYears?.value === "YES" && data.warningDetails && 
        renderWarningDetails(data.warningDetails, "warningDetails")}
    </div>
  );
};

export { RenderSection13A6 };
