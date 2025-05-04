import {
  type Address,
  type ApoFpoAddress,
  type EmploymentStatus,
  type Section13A1,
  type Supervisor,
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
            onChange={(e) =>
              onInputChange(
                `${path}.present`,
                e.target.checked
              )
            }
            disabled={isReadOnlyField("present")}
          />
          Present
        </label>
        <label>
          <input
            type="checkbox"
            checked={data.estimated}
            onChange={(e) =>
              onInputChange(
                `${path}.estimated`,
                e.target.checked
              )
            }
            disabled={isReadOnlyField("estimated")}
          />
          Estimated
        </label>
      </div>
      <div>
        <label htmlFor="dutyStation">Duty Station:</label>
        <input
          type="text"
          id="dutyStation"
          value={data.dutyStation}
          onChange={handleInputChange("dutyStation")}
          disabled={isReadOnlyField("dutyStation")}
        />
      </div>
      <div>
        <label htmlFor="rankOrPosition">Rank/Position:</label>
        <input
          type="text"
          id="rankOrPosition"
          value={data.rankOrPosition}
          onChange={handleInputChange("rankOrPosition")}
          disabled={isReadOnlyField("rankOrPosition")}
        />
      </div>
      {/* Add other fields as necessary */}
    </div>
  );
};

export { RenderSection13A1 };
