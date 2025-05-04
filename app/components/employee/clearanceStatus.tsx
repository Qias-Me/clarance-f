import React from "react";
import { ClearanceType } from "api_v2/interfaces/employee";

interface ClearanceStatusMapping {
  [key: string]: {
    bgColor: string;
    label: string;
  };
}

const clearanceMapping: ClearanceStatusMapping = {
  "Secret Clearance": {
    bgColor: "bg-green-500",
    label: "Secret",
  },
  "Top Secret": {
    bgColor: "bg-red-500",
    label: "Top Secret",
  },
  "Completed Form 86": {
    bgColor: "bg-yellow-500",
    label: "Form 86 Completed",
  },
  "No Clearance": {
    bgColor: "bg-gray-400",
    label: "None",
  },
};

const ClearanceComponent: React.FC<{ clearance: ClearanceType[] }> = ({
  clearance,
}) => {
  if (!clearance || clearance.length === 0) {
    return null;
  }

  return (
    <div>
      
      {clearance.map((status, index) => {
        const clearanceDetail = clearanceMapping[status.clearance_name];
        if (!clearanceDetail) {
          return null;
        }
        return (
          <div key={index} className="flex items-center space-x-2">
            <span
              className={`inline-block w-4 h-4 ${clearanceDetail.bgColor} rounded-full`}
            ></span>
            <p className="text-sm font-medium">{status.clearance_name}</p>
            <p className="text-xs md:text-sm text-gray-600">
              {status.clearance_status_name}
            </p>
          </div>
        );
      })}
    </div>
  );
};

export default ClearanceComponent;
