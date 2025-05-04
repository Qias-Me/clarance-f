import { Section13C } from "api_v2/interfaces/employmentInfo";
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
  const handleRadioChange =
    (value: boolean) => (event: React.ChangeEvent<HTMLInputElement>) => {
      if (event.target.checked) {
        onInputChange(`${path}.employmentRecordIssues`, value);
      }
    };

  return (
    <div className="p-4 bg-gray-100 rounded-lg shadow space-y-4">
      <div className="p-4 bg-gray-50 rounded-lg shadow space-y-4">
        <h3 className="text-lg font-semibold">
          Section 13C - Employment Record
        </h3>

        <label className="block">
          Have any of the following happened to you in the last seven (7) years
          at employment activities that you have not previously listed?
        </label>
        <ul className="mt-2 space-y-1">
          <li>- Fired from a job?</li>
          <li>- Quit a job after being told you would be fired?</li>
          <li>
            - Left a job by mutual agreement following charges or allegations of misconduct?
          </li>
          <li>
            - Left a job by mutual agreement following notice of unsatisfactory performance?
          </li>
          <li>
            - Received a written warning, been officially reprimanded, suspended, or disciplined for misconduct in the workplace, such as violation of a security policy?
          </li>
        </ul>

        <div className="mt-2 flex space-x-4">
          <label className="inline-flex items-center">
            <input
              type="radio"
              name="employmentRecordIssues"
              value="yes"
              checked={data.employmentRecordIssues === true}
              onChange={handleRadioChange(true)}
              className="mr-2"
              disabled={isReadOnlyField('employmentRecordIssues')}
            />
            YES
          </label>
          <label className="inline-flex items-center">
            <input
              type="radio"
              name="employmentRecordIssues"
              value="no"
              checked={data.employmentRecordIssues === false}
              onChange={handleRadioChange(false)}
              className="mr-2"
              disabled={isReadOnlyField('employmentRecordIssues')}
            />
            NO
          </label>
        </div>
      </div>
    </div>
  );
};

export { RenderSection13C };
