import React, { useState, useRef } from "react";
import type { ApplicantFormValues } from "api/interfaces/formDefinition";
import { useNavigate } from "react-router";

interface RenderPrintPDFProps {
  data: ApplicantFormValues;
  actionData?: any;
  onInputChange?: (path: string, value: any) => void;
  onAddEntry?: (path: string, value: any) => void;
  onRemoveEntry?: (path: string, index: number) => void;
  isValidValue?: (path: string, value: any) => boolean;
  getDefaultNewItem?: (path: string) => any;
  isReadOnlyField?: (key: string) => boolean;
  path?: string;
}

const RenderPrintPDF: React.FC<RenderPrintPDFProps> = ({
  data,
  actionData,
}) => {
  const navigate = useNavigate();
  
  const handlePrintClick = () => {
    if (!data?.personalInfo?.applicantID) {
      console.error("No employee ID found");
      return;
    }

    const employeeId = data.personalInfo.applicantID;
    // Navigate to the print route with the employee ID
    navigate(`/print/${employeeId}`);
  };

  return (
    <div className="p-4 sm:p-6 bg-white shadow-sm rounded-lg">
      <div>
        <div className="col-span-3 grid grid-cols-1 gap-6 sm:grid-cols-3">
          <div className="col-span-3">
            <h2 className="text-xl font-bold mb-4">
              Form Completion and Review
            </h2>
            <p className="text-gray-700 mb-4">
              You have completed the electronic questionnaire for background
              investigations. Please review the information you've provided for
              accuracy and completeness. Once you're satisfied, you can generate
              a PDF document by clicking the button below.
            </p>
          </div>

          <div className="col-span-3">
            <button
              type="button"
              onClick={handlePrintClick}
              className="px-6 py-3 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 transition duration-150 ease-in-out"
            >
              Generate PDF
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export { RenderPrintPDF };
