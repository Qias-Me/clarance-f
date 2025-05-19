import { type Section13C } from "api/interfaces/sections/employmentInfo";
import React from "react";

interface Section13CProps {
  data: Section13C;
  onInputChange: (path: string, value: any) => void;
  path: string;
  isReadOnlyField: (fieldName: string) => boolean;
}

const RenderSection13C: React.FC<Section13CProps> = ({
  data,
  onInputChange,
  path,
  isReadOnlyField,
}) => {
  return (
    <div className="p-4 bg-white rounded-lg shadow space-y-5">
      <h3 className="text-lg font-semibold">
        Section 13C - Employment Record
      </h3>

      <div className="space-y-3">
        <label className="block font-medium">
          Have any of the following happened to you in the last seven (7) years
          at employment activities that you have not previously listed?
        </label>
        <ul className="mt-2 space-y-1 pl-4 list-disc text-gray-700">
          <li>Fired from a job?</li>
          <li>Quit a job after being told you would be fired?</li>
          <li>
            Left a job by mutual agreement following charges or allegations of misconduct?
          </li>
          <li>
            Left a job by mutual agreement following notice of unsatisfactory performance?
          </li>
          <li>
            Received a written warning, been officially reprimanded, suspended, or disciplined for misconduct in the workplace, such as violation of a security policy?
          </li>
        </ul>

        <div className="mt-3 space-x-4">
          <label className="inline-flex items-center">
            <input
              type="radio"
              name="employmentRecordIssues"
              value="YES (If YES, you will be required to add an additional employment in Section 13A)"
              checked={data.employmentRecordIssues?.value === "YES (If YES, you will be required to add an additional employment in Section 13A)"}
              onChange={() => onInputChange(`${path}.employmentRecordIssues`, "YES (If YES, you will be required to add an additional employment in Section 13A)")}
              className="mr-2"
              disabled={isReadOnlyField('employmentRecordIssues')}
            />
            <span>YES</span>
            <span className="text-sm text-gray-600 ml-1">(If YES, you will be required to add an additional employment in Section 13A)</span>
          </label>
        </div>
        <div className="space-x-4">
          <label className="inline-flex items-center">
            <input
              type="radio"
              name="employmentRecordIssues"
              value="NO (If NO, proceed to Section 14)"
              checked={data.employmentRecordIssues?.value === "NO (If NO, proceed to Section 14)"}
              onChange={() => onInputChange(`${path}.employmentRecordIssues`, "NO (If NO, proceed to Section 14)")}
              className="mr-2"
              disabled={isReadOnlyField('employmentRecordIssues')}
            />
            <span>NO</span>
            <span className="text-sm text-gray-600 ml-1">(If NO, proceed to Section 14)</span>
          </label>
        </div>
      </div>
      
      {data.employmentRecordIssues?.value === "YES (If YES, you will be required to add an additional employment in Section 13A)" && (
        <div className="mt-4 space-y-4 border p-4 rounded bg-gray-50">
          <h4 className="font-medium text-gray-800">Employment Record Issues</h4>
          <p className="text-sm text-gray-600 mb-3">
            Check all that apply. For each issue, you will need to provide additional details in Section 13A.
          </p>
          <div className="space-y-3">
            <div>
              <label className="flex items-center hover:bg-gray-100 p-2 rounded transition-colors">
                <input
                  type="checkbox"
                  checked={data.employmentRecord?.fired?.value === "Yes"}
                  onChange={(e) => onInputChange(`${path}.employmentRecord.fired`, e.target.checked ? "Yes" : "No")}
                  className="mr-3 h-5 w-5"
                  disabled={isReadOnlyField('employmentRecord.fired')}
                />
                <span>Fired from a job</span>
              </label>
            </div>
            <div>
              <label className="flex items-center hover:bg-gray-100 p-2 rounded transition-colors">
                <input
                  type="checkbox"
                  checked={data.employmentRecord?.quitAfterToldWouldBeFired?.value === "Yes"}
                  onChange={(e) => onInputChange(`${path}.employmentRecord.quitAfterToldWouldBeFired`, e.target.checked ? "Yes" : "No")}
                  className="mr-3 h-5 w-5"
                  disabled={isReadOnlyField('employmentRecord.quitAfterToldWouldBeFired')}
                />
                <span>Quit a job after being told you would be fired</span>
              </label>
            </div>
            <div>
              <label className="flex items-center hover:bg-gray-100 p-2 rounded transition-colors">
                <input
                  type="checkbox"
                  checked={data.employmentRecord?.leftByMutualAgreementMisconduct?.value === "Yes"}
                  onChange={(e) => onInputChange(`${path}.employmentRecord.leftByMutualAgreementMisconduct`, e.target.checked ? "Yes" : "No")}
                  className="mr-3 h-5 w-5"
                  disabled={isReadOnlyField('employmentRecord.leftByMutualAgreementMisconduct')}
                />
                <span>Left a job by mutual agreement following charges or allegations of misconduct</span>
              </label>
            </div>
            <div>
              <label className="flex items-center hover:bg-gray-100 p-2 rounded transition-colors">
                <input
                  type="checkbox"
                  checked={data.employmentRecord?.leftByMutualAgreementPerformance?.value === "Yes"}
                  onChange={(e) => onInputChange(`${path}.employmentRecord.leftByMutualAgreementPerformance`, e.target.checked ? "Yes" : "No")}
                  className="mr-3 h-5 w-5"
                  disabled={isReadOnlyField('employmentRecord.leftByMutualAgreementPerformance')}
                />
                <span>Left a job by mutual agreement following notice of unsatisfactory performance</span>
              </label>
            </div>
            <div>
              <label className="flex items-center hover:bg-gray-100 p-2 rounded transition-colors">
                <input
                  type="checkbox"
                  checked={data.employmentRecord?.writtenWarning?.value === "Yes"}
                  onChange={(e) => onInputChange(`${path}.employmentRecord.writtenWarning`, e.target.checked ? "Yes" : "No")}
                  className="mr-3 h-5 w-5"
                  disabled={isReadOnlyField('employmentRecord.writtenWarning')}
                />
                <span>Received a written warning, been officially reprimanded, suspended, or disciplined for misconduct</span>
              </label>
            </div>
          </div>
          
          <div className="mt-4 bg-blue-50 p-3 rounded border border-blue-200">
            <p className="text-sm text-blue-800">
              <strong>Important:</strong> After completing this section, you must add details about the relevant employment in Section 13A.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export { RenderSection13C };
