import React from "react";
import FormInfo from "api_v2/interfaces/FormInfo";
import { PoliceRecord } from "api_v2/interfaces/policeRecord";

import { RenderSection22_1 } from "../_police/section22_1";
import { RenderSection22_2 } from "../_police/section22_2";
import { RenderSection22_3 } from "../_police/section22_3";

interface FormProps {
  data: PoliceRecord;
  onInputChange: (path: string, value: any) => void;
  onAddEntry: (path: string, newItem: any) => void;
  onRemoveEntry: (path: string, index: number) => void;
  getDefaultNewItem: (itemType: string) => any;
  isReadOnlyField: (fieldName: string) => boolean;
  path: string;
  formInfo: FormInfo;
}

const RenderPolice: React.FC<FormProps> = ({
  data,
  onInputChange,
  onAddEntry,
  onRemoveEntry,
  getDefaultNewItem,
  isReadOnlyField,
  path,
  formInfo,
}) => {
  interface DetailsListProps {
    details: string[];
  }

  const DetailsList: React.FC<DetailsListProps> = ({ details }) => (
    <ul className="list-disc list-inside">
      {details.map((detail, index) => (
        <li key={index}>{detail}</li>
      ))}
    </ul>
  );

  const handleInputChange = (path: string, value: any) => {
    console.log(path, value, "path and value");
    onInputChange(path, value);

    if (value === true) {
      handleSectionAdd(path);
    }
  };

  const handleSectionAdd = (path: string) => {
    const sectionMap: { [key: string]: string } = {
      part1Questions: "section22_1",
      part2Questions: "section22_2",
      restrainingOrder: "section22_3",
    };

    const field = path.split(".").pop();
    if (field && sectionMap[field]) {
      const section = sectionMap[field];
      if (!data[section]) {
        onAddEntry(
          `policeRecord.${section}`,
          getDefaultNewItem(`policeRecord.${section}`)
        );
      }
    }
  };

  const renderBooleanInput = (
    label: string,
    value: boolean,
    onChange: (value: boolean) => void
  ) => (
    <div className="flex items-center space-x-4">
      <span>{label}</span>
      <div>
        <input
          type="radio"
          id={`${label}-yes`}
          name={label}
          value="true"
          checked={value === true}
          onChange={() => onChange(true)}
        />
        <label htmlFor={`${label}-yes`}>Yes</label>
      </div>
      <div>
        <input
          type="radio"
          id={`${label}-no`}
          name={label}
          value="false"
          checked={value === false}
          onChange={() => onChange(false)}
        />
        <label htmlFor={`${label}-no`}>No</label>
      </div>
    </div>
  );

  const renderSection = (section) => {
    const sectionComponents = {
      section22_1: RenderSection22_1,
      section22_2: RenderSection22_2,
      section22_3: RenderSection22_3,
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
      <h3 className="text-lg font-semibold">Section 22 - Police Record</h3>

      {renderBooleanInput(
        "Section 22.1 Have any of the following happened?",
        data.part1Questions,
        (value) => handleInputChange(`${path}.part1Questions`, value)
      )}

      <DetailsList
        details={[
          'In the last seven (7) years have you been issued a summons, citation, or ticket to appear in court in a criminal proceeding against you? (Do not check if all the citations involved traffic infractions where the fine was less than $300 and did not include alcohol or drugs)',
          'In the last seven (7) years have you been arrested by any police officer, sheriff, marshal or any other type of law enforcement official?',
          'In the last seven (7) years have you been charged with, convicted of, or sentenced for a crime in any court? (Include all qualifying charges, convictions or sentences in any Federal, state, local, military, or non-U.S. court, even if previously listed on this form).',
          'In the last seven (7) years have you been or are you currently on probation or parole?',
          'Are you currently on trial or awaiting a trial on criminal charges?'
        ]}
      />
      {data.part1Questions && renderSection("section22_1")}

      {renderBooleanInput(
        "Section 22.2 Have any of the following happened?",
        data.part2Questions,
        (value) => handleInputChange(`${path}.part2Questions`, value)
      )}
          <DetailsList
        details={[
          'Have you EVER been convicted in any court of the United States of a crime, sentenced to imprisonment for a term exceeding 1 year for that crime, and incarcerated as a result of that sentence for not less than 1 year? (Include all qualifying convictions in Federal, state, local, or military court, even if previously listed on this form)',
          'Have you EVER been charged with any felony offense? (Include those under the Uniform Code of Military Justice and non-military/civilian felony offenses)',
          'Have you EVER been convicted of an offense involving domestic violence or a crime of violence (such as battery or assault) against your child, dependent, cohabitant, spouse or legally recognized civil union/domestic partner, former spouse or legally recognized civil union/domestic partner, or someone with whom you share a child in common?',
          'Have you EVER been charged with an offense involving firearms or explosives?',
          'Have you EVER been charged with an offense involving alcohol or drugs?'
        ]}
      />
      {data.part2Questions && renderSection("section22_2")}

      {renderBooleanInput(
        "Section 22.3 Is there currently a domestic violence protective order or restraining order issued against you?",
        data.restrainingOrder,
        (value) => handleInputChange(`${path}.restrainingOrder`, value)
      )}
      {data.restrainingOrder && renderSection("section22_3")}
    </div>
  );
};

export { RenderPolice };
