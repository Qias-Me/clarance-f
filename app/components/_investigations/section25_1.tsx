import React from "react";
import { Section25_1 } from "api_v2/interfaces/InvestigationsInfo";

interface Section25_1Props {
  data: Section25_1[];
  onInputChange: (path: string, value: any) => void;
  onRemoveEntry: (path: string, index: number) => void;
  onAddEntry: (path: string, newItem: Section25_1) => void;
  path: string;
  isReadOnlyField: (fieldName: string) => boolean;
  getDefaultNewItem: (itemType: string) => any;
}

const RenderSection25_1: React.FC<Section25_1Props> = ({
  data,
  onInputChange,
  onRemoveEntry,
  onAddEntry,
  getDefaultNewItem,
  path,
  isReadOnlyField,
}) => {
  const investigatingAgencies = [
    "U.S. Department of Defense",
    "U.S. Department of State",
    "U.S. Office of Personnel Management",
    "Federal Bureau of Investigation",
    "U.S. Department of Treasury",
    "U.S. Department of Homeland Security",
    "Foreign government",
    "I don't know",
    "Other",
  ];

  const levelsOfClearance = [
    "None",
    "Confidential",
    "Secret",
    "Top Secret",
    "Sensitive Compartmented Information (SCI)",
    "Q",
    "L",
    "I don't know",
    "Other",
    "Issued by foreign country",
  ];

  const handleInputChange =
    (index: number, fieldPath: string) =>
    (
      event: React.ChangeEvent<
        HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
      >
    ) => {
      const value =
        event.target.type === "checkbox"
          ? event.target.checked
          : event.target.value;
      onInputChange(`${path}.section25_1[${index}].${fieldPath}`, value);
    };

  const renderInvestigatingAgencies = (
    selectedAgency: string,
    index: number
  ) => (
    <div>
      {investigatingAgencies.map((agency) => (
        <div key={agency}>
          <input
            type="radio"
            id={`investigatingAgency-${index}-${agency}`}
            name={`investigatingAgency-${index}`}
            value={agency}
            checked={selectedAgency === agency}
            onChange={handleInputChange(index, "investigatingAgency[0].agency")}
            disabled={isReadOnlyField(
              `${path}.section25_1[${index}].investigatingAgency[0].agency`
            )}
          />
          <label htmlFor={`investigatingAgency-${index}-${agency}`}>
            {agency}
          </label>
        </div>
      ))}
    </div>
  );

  const renderLevelsOfClearance = (selectedLevel: string, index: number) => (
    <div>
      {levelsOfClearance.map((level) => (
        <div key={level}>
          <input
            type="radio"
            id={`levelOfClearance-${index}-${level}`}
            name={`levelOfClearance-${index}`}
            value={level}
            checked={selectedLevel === level}
            onChange={handleInputChange(index, "levelOfClearance[0].level")}
            disabled={isReadOnlyField(
              `${path}.section25_1[${index}].levelOfClearance[0].level`
            )}
          />
          <label htmlFor={`levelOfClearance-${index}-${level}`}>{level}</label>
        </div>
      ))}
    </div>
  );

  const renderEntry = (item: Section25_1, index: number) => {
    const selectedAgency = item.investigatingAgency[0].agency;
    const selectedLevel = item.levelOfClearance[0].level;

    return (
      <div key={index} className="space-y-4 p-4 border rounded-lg">
        <h3>Entry #{index + 1}</h3>

        <div>
          <label>Investigating Agency</label>
          {renderInvestigatingAgencies(selectedAgency, index)}
        </div>

        {selectedAgency === "Other" && (
          <div>
            <label htmlFor={`otherAgency_${index}`}>Other Agency</label>
            <input
              type="text"
              id={`otherAgency_${index}`}
              value={item.otherAgency}
              onChange={handleInputChange(index, "otherAgency")}
              disabled={isReadOnlyField(
                `${path}.section25_1[${index}].otherAgency`
              )}
            />
          </div>
        )}

        {selectedAgency === "U.S. Department of Treasury" && (
          <div>
            <label htmlFor={`treasuryAgency_${index}`}>Treasury Bureau</label>
            <input
              type="text"
              id={`treasuryAgency_${index}`}
              value={item.otherAgency}
              onChange={handleInputChange(index, "otherAgency")}
              disabled={isReadOnlyField(
                `${path}.section25_1[${index}].otherAgency`
              )}
            />
          </div>
        )}

        {selectedAgency === "Foreign government" && (
          <div>
            <label htmlFor={`foreignGovernment_${index}`}>
              Name of Government
            </label>
            <input
              type="text"
              id={`foreignGovernment_${index}`}
              value={item.otherAgency}
              onChange={handleInputChange(index, "otherAgency")}
              disabled={isReadOnlyField(
                `${path}.section25_1[${index}].otherAgency`
              )}
            />
          </div>
        )}

        <div>
          <label htmlFor={`issuedAgency_${index}`}>Issued Agency</label>
          <input
            type="text"
            id={`issuedAgency_${index}`}
            value={item.issuedAgency}
            onChange={handleInputChange(index, "issuedAgency")}
            disabled={isReadOnlyField(
              `${path}.section25_1[${index}].issuedAgency`
            )}
          />
        </div>

        <div>
          <label htmlFor={`investigationCompletionDate_${index}`}>
            Investigation Completion Date
          </label>
          <input
            type="text"
            id={`investigationCompletionDate_${index}`}
            value={item.investigationCompletionDate}
            onChange={handleInputChange(index, "investigationCompletionDate")}
            disabled={isReadOnlyField(
              `${path}.section25_1[${index}].investigationCompletionDate`
            )}
          />
        </div>

        <div>
          <label htmlFor={`clearanceEligibilityDate_${index}`}>
            Clearance Eligibility Date
          </label>
          <input
            type="text"
            id={`clearanceEligibilityDate_${index}`}
            value={item.clearanceEligibilityDate}
            onChange={handleInputChange(index, "clearanceEligibilityDate")}
            disabled={isReadOnlyField(
              `${path}.section25_1[${index}].clearanceEligibilityDate`
            )}
          />
        </div>

        <div>
          <label>Level Of Clearance</label>
          {renderLevelsOfClearance(selectedLevel, index)}
        </div>

        {selectedLevel === "Other" && (
          <div>
            <label htmlFor={`otherLevel_${index}`}>Other Level</label>
            <input
              type="text"
              id={`otherLevel_${index}`}
              value={item.levelOfClearance[0].explanation}
              onChange={handleInputChange(
                index,
                "levelOfClearance[0].explanation"
              )}
              disabled={isReadOnlyField(
                `${path}.section25_1[${index}].levelOfClearance[0].explanation`
              )}
            />
          </div>
        )}

        <button
          onClick={(event) => {
            event.preventDefault();
            onRemoveEntry(`${path}.section25_1`, index);
          }}
          disabled={isReadOnlyField(`section25_1[${index}].remove`)}
        >
          Remove Entry
        </button>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <h2>Section 25.1</h2>
      {data.map((item, index) => renderEntry(item, index))}
      <button
        onClick={(event) => {
          event.preventDefault();
          onAddEntry(
            `${path}.section25_1`,
            getDefaultNewItem(`${path}.section25_1`)
          );
        }}
      >
        Add Entry
      </button>
    </div>
  );
};

export { RenderSection25_1 };
