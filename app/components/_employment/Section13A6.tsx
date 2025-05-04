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

  const handleCheckboxChange = (fieldPath: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
    onInputChange(`${path}.${fieldPath}`, event.target.checked);
  };

  const renderWarningDetails = (warningDetails: WarningDetails[], detailsPath: string) => (
    <div>
      {warningDetails.map((detail, index) => (
        <div key={index} className="space-y-2">
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
            <label htmlFor={`date-${index}`}>Date:</label>
            <input
              type="text"
              id={`date-${index}`}
              value={detail.date}
              onChange={handleInputChange(`${detailsPath}[${index}].date`)}
              disabled={isReadOnlyField(`${detailsPath}[${index}].date`)}
              placeholder="Date"
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
        <label>
          <input
            type="checkbox"
            checked={data.warnedInLastSevenYears}
            onChange={handleCheckboxChange("warnedInLastSevenYears")}
            disabled={isReadOnlyField("warnedInLastSevenYears")}
          />
          Have you been warned in the last seven years?
        </label>
      </div>
      {data.warnedInLastSevenYears && renderWarningDetails(data.warningDetails || [], "warningDetails")}
    </div>
  );
};

export { RenderSection13A6 };
