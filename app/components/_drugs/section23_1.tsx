import React from "react";
import { type Section23_1 } from "api/interfaces/sections/drugsActivity";

interface Section23_1Props {
  data: Section23_1[];
  onInputChange: (path: string, value: any) => void;
  onRemoveEntry: (path: string, index: number) => void;
  onAddEntry: (path: string, newItem: Section23_1) => void;
  path: string;
  isReadOnlyField: (fieldName: string) => boolean;
  getDefaultNewItem: (itemType: string) => any;
}

const RenderSection23_1: React.FC<Section23_1Props> = ({
  data,
  onInputChange,
  onRemoveEntry,
  onAddEntry,
  path,
  isReadOnlyField,
  getDefaultNewItem,
}) => {
  const handleInputChange = (index, fieldPath) => (event) => {
    const value =
      event.target.type === "checkbox"
        ? event.target.checked
        : event.target.value;
    onInputChange(`${path}.section23_1[${index}].${fieldPath}`, value);
  };

  const drugTypes = [
    "Cocaine or crack cocaine (Such as rock, freebase, etc.)",
    "THC (Such as marijuana, weed, pot, hashish, etc.)",
    "Ketamine (Such as special K, jet, etc.)",
    "Narcotics (Such as opium, morphine, codeine, heroin, etc.)",
    "Stimulants (Such as amphetamines, speed, crystal meth, ecstasy, etc.)",
    "Depressants (Such as barbiturates, methaqualone, tranquilizers, etc.)",
    "Hallucinogenic (Such as LSD, PCP, mushrooms, etc.)",
    "Steroids (Such as the clear, juice, etc.)",
    "Inhalants (Such as toluene, amyl nitrate, etc.)",
    "Other",
  ];

  const renderDrugTypes = (selectedType, index) => (
    <div>
      {drugTypes.map((type) => (
        <div key={type}>
          <input
            type="radio"
            id={`drugType-${index}-${type}`}
            name={`drugType-${index}`}
            value={type}
            checked={selectedType === type}
            onChange={handleInputChange(index, "typeOfDrug")}
            disabled={isReadOnlyField(
              `${path}.section23_1[${index}].typeOfDrug`
            )}
          />
          <label htmlFor={`drugType-${index}-${type}`}>{type}</label>
        </div>
      ))}
    </div>
  );

  const renderEntry = (item, index) => (
    <div key={index} className="space-y-4 p-4 border rounded-lg">
      <h3>Entry #{index + 1}</h3>
      {renderDrugTypes(item.typeOfDrug, index)}

      {item.typeOfDrug === "Other" && (
        <textarea
          value={item.otherDrugExplanation}
          onChange={handleInputChange(index, "otherDrugExplanation")}
          disabled={isReadOnlyField(
            `${path}.section23_1[${index}].otherDrugExplanation`
          )}
          placeholder="Other Drug Explanation"
        />
      )}

      <label htmlFor={`firstUse-date-${index}`}>First Use (Month/Year)</label>
      <input
        type="text"
        id={`firstUse-date-${index}`}
        value={item.firstUse.date}
        onChange={handleInputChange(index, "firstUse.date")}
        disabled={isReadOnlyField(
          `${path}.section23_1[${index}].firstUse.date`
        )}
        placeholder="First Use (Month/Year)"
      />

      <input
        type="checkbox"
        id={`firstUse-estimated-${index}`}
        checked={item.firstUse.estimated}
        onChange={handleInputChange(index, "firstUse.estimated")}
        disabled={isReadOnlyField(
          `${path}.section23_1[${index}].firstUse.estimated`
        )}
      />
      <label htmlFor={`firstUse-estimated-${index}`}>Estimated</label>

      <label htmlFor={`mostRecentUse-date-${index}`}>
        Most Recent Use (Month/Year)
      </label>
      <input
        type="text"
        id={`mostRecentUse-date-${index}`}
        value={item.mostRecentUse.date}
        onChange={handleInputChange(index, "mostRecentUse.date")}
        disabled={isReadOnlyField(
          `${path}.section23_1[${index}].mostRecentUse.date`
        )}
        placeholder="Most Recent Use (Month/Year)"
      />

      <input
        type="checkbox"
        id={`mostRecentUse-estimated-${index}`}
        checked={item.mostRecentUse.estimated}
        onChange={handleInputChange(index, "mostRecentUse.estimated")}
        disabled={isReadOnlyField(
          `${path}.section23_1[${index}].mostRecentUse.estimated`
        )}
      />
      <label htmlFor={`mostRecentUse-estimated-${index}`}>Estimated</label>

      <label htmlFor={`natureOfUseFrequencyTimes-${index}`}>
        Nature of Use, Frequency, and Number of Times Used
      </label>
      <textarea
        id={`natureOfUseFrequencyTimes-${index}`}
        value={item.natureOfUseFrequencyTimes}
        onChange={handleInputChange(index, "natureOfUseFrequencyTimes")}
        disabled={isReadOnlyField(
          `${path}[${index}].natureOfUseFrequencyTimes`
        )}
        placeholder="Nature of Use, Frequency, and Number of Times Used"
      />

      <input
        type="checkbox"
        id={`useWhileEmployedInPublicSafety-${index}`}
        checked={item.useWhileEmployedInPublicSafety}
        onChange={handleInputChange(index, "useWhileEmployedInPublicSafety")}
        disabled={isReadOnlyField(
          `${path}[${index}].useWhileEmployedInPublicSafety`
        )}
      />
      <label htmlFor={`useWhileEmployedInPublicSafety-${index}`}>
        Use While Employed in Public Safety
      </label>

      <input
        type="checkbox"
        id={`useWhilePossessingSecurityClearance-${index}`}
        checked={item.useWhilePossessingSecurityClearance}
        onChange={handleInputChange(
          index,
          "useWhilePossessingSecurityClearance"
        )}
        disabled={isReadOnlyField(
          `${path}[${index}].useWhilePossessingSecurityClearance`
        )}
      />
      <label htmlFor={`useWhilePossessingSecurityClearance-${index}`}>
        Use While Possessing Security Clearance
      </label>

      <input
        type="checkbox"
        id={`intendToUseInFuture-${index}`}
        checked={item.intendToUseInFuture}
        onChange={handleInputChange(index, "intendToUseInFuture")}
        disabled={isReadOnlyField(`${path}[${index}].intendToUseInFuture`)}
      />
      <label htmlFor={`intendToUseInFuture-${index}`}>
        Intend to Use in Future
      </label>

      <label htmlFor={`futureUseExplanation-${index}`}>
        Explanation of Future Use Intentions
      </label>
      <textarea
        id={`futureUseExplanation-${index}`}
        value={item.futureUseExplanation}
        onChange={handleInputChange(index, "futureUseExplanation")}
        disabled={isReadOnlyField(`${path}[${index}].futureUseExplanation`)}
        placeholder="Explanation of Future Use Intentions"
      />

      <button
        onClick={(event) => {
          event.preventDefault();
          onRemoveEntry(`${path}.section23_1`, index);
        }}
        disabled={isReadOnlyField(`section23_1[${index}].remove`)}
      >
        Remove Entry
      </button>
    </div>
  );

  return (
    <div>
      <h2>Section 23.1</h2>
      {data.map((item, index) => renderEntry(item, index))}
      <button
        onClick={(event) => {
          event.preventDefault();
          onAddEntry(
            `${path}.section23_1`,
            getDefaultNewItem(`${path}.section23_1`)
          );
        }}
      >
        Add Entry
      </button>
    </div>
  );
};

export { RenderSection23_1 };
