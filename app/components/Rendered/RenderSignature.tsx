import React, { useState } from "react";
import {type FormInfo} from "api/interfaces/FormInfo";

import { type Signature } from "api/interfaces/sections/signature";

import { RenderSection30_1 } from "../_signature/section30_1";
import { RenderSection30_2 } from "../_signature/section30_2";
import { RenderSection30_3 } from "../_signature/section30_3";

interface FormProps {
  data: Signature;
  onInputChange: (path: string, value: any) => void;
  onAddEntry: (path: string, newItem: any) => void;
  onRemoveEntry: (path: string, index: number) => void;
  getDefaultNewItem: (itemType: string) => any;
  isReadOnlyField: (fieldName: string) => boolean;
  path: string;
  formInfo: FormInfo;
}

const RenderSignature: React.FC<FormProps> = ({
  data,
  onInputChange,
  onAddEntry,
  onRemoveEntry,
  getDefaultNewItem,
  isReadOnlyField,
  path,
}) => {
  const handleInputChange = (path: string, value: any) => {
    onInputChange(path, value);

    if (value === true) {
      handleSectionAdd(path);
    } else if (value === false) {
      handleSectionRemove(path);
      handleSectionAdd(path); // Add the default entry after clearing
    }
  };

  interface DetailedDropdownProps {
    label: string;
    initialShowDetails: boolean;
    details: React.ReactNode[];
    onChange: (value: boolean) => void;
  }

  const DetailsList: React.FC<{ details: React.ReactNode[] }> = ({
    details,
  }) => (
    <div className="ml-6 space-y-2">
      {details.map((detail, index) => (
        <div key={index}>{detail}</div>
      ))}
    </div>
  );

  const DetailedDropdown: React.FC<DetailedDropdownProps> = ({
    label,
    initialShowDetails,
    details,
    onChange,
  }) => {
    const [showDetails, setShowDetails] = useState(initialShowDetails);
    const [isExpanded, setIsExpanded] = useState(false);

    const handleInputChange = (value: boolean) => {
      setShowDetails(value);
      onChange(value);
    };

    const toggleDetails = () => {
      setIsExpanded(!isExpanded);
    };

    return (
      <div className="flex flex-col space-y-4 p-4  shadow-md rounded-lg">
        <div className="flex items-center space-x-4">
          <button
            onClick={toggleDetails}
            aria-label="Toggle Details"
            className="bg-gray-200 p-2 rounded-full hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 transition duration-150 ease-in-out"
          >
            <span className="text-xl">{isExpanded ? "▲" : "▼"}</span>
          </button>
          <span className="">{label}</span>
        </div>
        <div className="flex items-center space-x-4 mt-2">
          <div>
            <input
              type="radio"
              id={`${label}-yes`}
              name={label}
              value="true"
              checked={showDetails === true}
              onChange={() => handleInputChange(true)}
            />
            <label htmlFor={`${label}-yes`} className="ml-2 cursor-pointer">
              Yes
            </label>
          </div>
          <div>
            <input
              type="radio"
              id={`${label}-no`}
              name={label}
              value="false"
              checked={showDetails === false}
              onChange={() => handleInputChange(false)}
            />
            <label htmlFor={`${label}-no`} className="ml-2 cursor-pointer">
              No
            </label>
          </div>
        </div>
        {isExpanded && <DetailsList details={details} />}
      </div>
    );
  };

  const medical = [
    <h3 key="title">FAIR CREDIT REPORTING DISCLOSURE AND AUTHORIZATION</h3>,
    <h2 key="disclosure-title">Disclosure</h2>,
    <p key="disclosure-content">
      One or more reports from consumer reporting agencies may be obtained for
      employment purposes pursuant to the Fair Credit Reporting Act, codified at
      15 U.S.C. § 1681 et seq.
    </p>,
    <h2 key="purpose-title">Purpose</h2>,
    <p key="purpose-content">
      The Federal government requires information from one or more consumer
      reporting agencies in order to obtain information in connection with a
      background investigation, reinvestigation, or ongoing evaluation (i.e.
      continuous evaluation) of eligibility for access to classified
      information, or when applicable, eligibility to hold a national security
      sensitive position. The information obtained may be disclosed to other
      Federal agencies for the above purposes in fulfillment of official
      responsibilities to the extent that such disclosure is permitted by law.
      Information from the consumer report will not be used in violation of any
      applicable Federal or state equal employment opportunity law or
      regulation.
    </p>,
    <h2 key="authorization-title">Authorization</h2>,
    <p key="authorization-content">
      I hereby authorize any investigator, special agent, or other duly
      accredited representative of the authorized Federal agency conducting my
      initial background investigation, reinvestigation, or ongoing evaluation
      (i.e. continuous evaluation) of my eligibility for access to classified
      information, or when applicable, eligibility to hold a national security
      sensitive position to request, and any consumer reporting agency to
      provide, such reports for purposes described above. Note: If you have a
      security freeze on your consumer or credit report file, we will not be
      able to access the information necessary to complete your investigation,
      which can adversely affect your eligibility for a national security
      position. To avoid such delays, you should expeditiously respond to any
      requests made to release the credit freeze for the purposes as described
      above.
    </p>,
    <p key="authorization-note">
      Photocopies of this authorization with my signature are valid. This
      authorization shall remain in effect so long as I occupy a national
      security sensitive position or require eligibility for access to
      classified information.
    </p>,
  ];

  const information = [
    <h2 key="info-title">AUTHORIZATION FOR RELEASE OF INFORMATION</h2>,
    <p key="info-usa">UNITED STATES OF AMERICA</p>,
    <p key="info-read">
      Carefully read this authorization to release information about you, then
      sign and date it in ink.
    </p>,
    <p key="info-content-1">
      I Authorize any investigator, special agent, or other duly accredited
      representative of the authorized Federal agency conducting my background
      investigation, reinvestigation, or ongoing evaluation (i.e. continuous
      evaluation) of my eligibility for access to classified information or,
      when applicable, eligibility to hold a national security sensitive
      position to obtain any information relating to my activities from
      individuals, schools, residential management agents, employers, criminal
      justice agencies, credit bureaus, consumer reporting agencies, collection
      agencies, retail business establishments, or other sources of information.
      This information may include, but is not limited to current and historic
      academic, residential, achievement, performance, attendance, disciplinary,
      employment, criminal, financial, and credit information, and publicly
      available social media information. I authorize the Federal agency
      conducting my investigation, reinvestigation, or ongoing evaluation (i.e.
      continuous evaluation) of eligibility to disclose the record of
      investigation or ongoing evaluation to the requesting agency for the
      purpose of making a determination of suitability, or initial or continued
      eligibility for a national security position or eligibility for access to
      classified information.
    </p>,
    <p key="info-content-2">
      I Understand that, for these purposes, publicly available social media
      information includes any electronic social media information that has been
      published or broadcast for public consumption, is available on request to
      the public, is accessible on-line to the public, is available to the
      public by subscription or purchase, or is otherwise lawfully accessible to
      the public. I further understand that this authorization does not require
      me to provide passwords; log into a private account; or take any action
      that would disclose non-publicly available social media information.
    </p>,
    <p key="info-content-3">
      I Authorize the Social Security Administration (SSA) to verify my Social
      Security Number (to match my name, Social Security Number, and date of
      birth with information in SSA records and provide the results of the
      match) to the United States Office of Personnel Management (OPM) or other
      Federal agency requesting or conducting my investigation for the purposes
      outlined above. I authorize SSA to provide explanatory information to OPM,
      or to the other Federal agency requesting or conducting my investigation,
      in the event of a discrepancy.
    </p>,
    <p key="info-content-4">
      I Understand that, for financial or lending institutions, medical
      institutions, hospitals, health care professionals, and other sources of
      information, separate specific releases may be needed, and I may be
      contacted for such releases at a later date.
    </p>,
    <p key="info-content-5">
      I Authorize any investigator, special agent, or other duly accredited
      representative of the OPM, the Federal Bureau of Investigation, the
      Department of Defense, the Department of Homeland Security, the Office of
      the Director of National Intelligence, the Department of State, and any
      other authorized Federal agency, to request criminal record information
      about me from criminal justice agencies for the purpose of determining my
      eligibility for assignment to, or retention in, a national security
      position, in accordance with 5 U.S.C. 9101. I understand that I may
      request a copy of such records as may be available to me under the law.
    </p>,
    <p key="info-content-6">
      I Authorize custodians of records and other sources of information
      pertaining to me to release such information upon request of the
      investigator, special agent, or other duly accredited representative of
      any Federal agency authorized above regardless of any previous agreement
      to the contrary.
    </p>,
    <p key="info-content-7">
      I Understand that the information released by records custodians and
      sources of information is for official use by the Federal Government only
      for the purposes provided in this Standard Form 86, and that it may be
      disclosed by the Government only as authorized by law.
    </p>,
    <p key="info-content-8">
      I Authorize the information to be used to conduct officially sanctioned
      and approved personnel security-related studies and analyses, which will
      be maintained in accordance with the Privacy Act.
    </p>,
    <p key="info-signature">
      Photocopies of this authorization with my signature are valid. This
      authorization shall remain in effect so long as I occupy a national
      security sensitive position or require eligibility for access to
      classified information.
    </p>,
  ];

  const credit = [
    <h2 key="credit-title">
      FAIR CREDIT REPORTING DISCLOSURE AND AUTHORIZATION
    </h2>,
    <h2 key="credit-disclosure-title">Disclosure</h2>,
    <p key="credit-disclosure-content">
      One or more reports from consumer reporting agencies may be obtained for
      employment purposes pursuant to the Fair Credit Reporting Act, codified at
      15 U.S.C. § 1681 et seq.
    </p>,
    <h2 key="credit-purpose-title">Purpose</h2>,
    <p key="credit-purpose-content">
      The Federal government requires information from one or more consumer
      reporting agencies in order to obtain information in connection with a
      background investigation, reinvestigation, or ongoing evaluation (i.e.
      continuous evaluation) of eligibility for access to classified
      information, or when applicable, eligibility to hold a national security
      sensitive position. The information obtained may be disclosed to other
      Federal agencies for the above purposes in fulfillment of official
      responsibilities to the extent that such disclosure is permitted by law.
      Information from the consumer report will not be used in violation of any
      applicable Federal or state equal employment opportunity law or
      regulation.
    </p>,
    <h2 key="credit-authorization-title">Authorization</h2>,
    <p key="credit-authorization-content">
      I hereby authorize any investigator, special agent, or other duly
      accredited representative of the authorized Federal agency conducting my
      initial background investigation, reinvestigation, or ongoing evaluation
      (i.e. continuous evaluation) of my eligibility for access to classified
      information, or when applicable, eligibility to hold a national security
      sensitive position to request, and any consumer reporting agency to
      provide, such reports for purposes described above. Note: If you have a
      security freeze on your consumer or credit report file, we will not be
      able to access the information necessary to complete your investigation,
      which can adversely affect your eligibility for a national security
      position. To avoid such delays, you should expeditiously respond to any
      requests made to release the credit freeze for the purposes as described
      above.
    </p>,
    <p key="credit-authorization-note">
      Photocopies of this authorization with my signature are valid. This
      authorization shall remain in effect so long as I occupy a national
      security sensitive position or require eligibility for access to
      classified information.
    </p>,
  ];

  const handleSectionAdd = (path: string) => {
    const sectionMap: { [key: string]: string } = {
      information: "section30_1",
      medical: "section30_2",
      credit: "section30_3",
    };

    const field = path.split(".").pop();
    if (field && sectionMap[field]) {
      const section = sectionMap[field];
      if (!data[section] || data[section].length === 0) {
        onAddEntry(
          `signature.${section}`,
          getDefaultNewItem(`signature.${section}`)
        );
      }
    }
  };

  const handleSectionRemove = (path: string) => {
    const sectionMap: { [key: string]: string } = {
      information: "section30_1",
      medical: "section30_2",
      credit: "section30_3",
    };

    const field = path.split(".").pop();
    if (field && sectionMap[field]) {
      const section = sectionMap[field];
      onInputChange(`signature.${section}`, []);
    }
  };

  const renderBooleanInput = (
    label: string,
    value: boolean,
    onChange: (value: boolean) => void
  ) => (
    <div className="flex flex-col space-y-2 p-4  shadow-md rounded-lg">
      <span className="">{label}</span>
      <div className="flex items-center space-x-4 mt-2">
        <div>
          <input
            type="radio"
            id={`${label}-yes`}
            name={label}
            value="true"
            checked={value === true}
            onChange={() => onChange(true)}
            className="mr-2"
          />
          <label htmlFor={`${label}-yes`} className="cursor-pointer">
            Yes
          </label>
        </div>
        <div>
          <input
            type="radio"
            id={`${label}-no`}
            name={label}
            value="false"
            checked={value === false}
            onChange={() => onChange(false)}
            className="mr-2"
          />
          <label htmlFor={`${label}-no`} className="cursor-pointer">
            No
          </label>
        </div>
      </div>
    </div>
  );

  const renderSection = (section) => {
    const sectionComponents = {
      section30_1: RenderSection30_1,
      section30_2: RenderSection30_2,
      section30_3: RenderSection30_3,
    };

    const SectionComponent = sectionComponents[section];
    const sectionData = data[section];

    if (!SectionComponent || !sectionData) {
      return null;
    }

    return (
      <SectionComponent
        data={sectionData}
        onInputChange={(path, value) => handleInputChange(path, value)}
        path={`${path}`}
        isReadOnlyField={isReadOnlyField}
        onAddEntry={onAddEntry}
        onRemoveEntry={onRemoveEntry}
        getDefaultNewItem={getDefaultNewItem}
      />
    );
  };

  return (
    <div className="p-4 bg-gray-50 rounded-lg shadow space-y-4">
      <h3 className="text-lg font-semibold">
        Section 30 - Use of Information Civil Systems
      </h3>

      <DetailedDropdown
        label="Have you read this authorization to release information about you?"
        initialShowDetails={data.information}
        details={information}
        onChange={(value) => handleInputChange(`${path}.information`, value)}
      />

      {data.information && renderSection("section30_1")}

      <DetailedDropdown
        label="You answered 'Yes' to Section 21 of the Standard Form 86 (SF-86), Have you read this authorization to release information about you?"
        initialShowDetails={data.medical}
        details={medical}
        onChange={(value) => handleInputChange(`${path}.medical`, value)}
      />

      {data.medical && renderSection("section30_2")}

      <DetailedDropdown
        label="Have you read this authorization to release classified information?"
        initialShowDetails={data.credit}
        details={credit}
        onChange={(value) => handleInputChange(`${path}.credit`, value)}
      />

      {data.credit && renderSection("section30_3")}
    </div>
  );
};

export { RenderSignature };
