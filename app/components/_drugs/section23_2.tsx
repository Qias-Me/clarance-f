import React from "react";
import { type Section23_2 } from "api/interfaces/sections/drugsActivity";

interface Section23_2Props {
  data: Section23_2[];
  onInputChange: (path: string, value: any) => void;
  onRemoveEntry: (path: string, index: number) => void;
  onAddEntry: (path: string, newItem: Section23_2) => void;
  path: string;
  isReadOnlyField: (fieldName: string) => boolean;
  getDefaultNewItem: (itemType: string) => any;
}

const RenderSection23_2: React.FC<Section23_2Props> = ({
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
    onInputChange(`${path}.section23_2[${index}].${fieldPath}`, value);
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
              `${path}.section23_2[${index}].typeOfDrug`
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
            `${path}.section23_2[${index}].otherDrugExplanation`
          )}
          placeholder="Other Drug Explanation"
        />
      )}

      <label htmlFor={`firstInvolvement-date-${index}`}>
        First Involvement (Month/Year)
      </label>
      <input
        id={`firstInvolvement-date-${index}`}
        type="date"
        value={item.firstInvolvement.date}
        onChange={handleInputChange(index, "firstInvolvement.date")}
        disabled={isReadOnlyField(
          `${path}.section23_2[${index}].firstInvolvement.date`
        )}
      />
      <input
        type="checkbox"
        id={`firstInvolvement-estimated-${index}`}
        checked={item.firstInvolvement.estimated}
        onChange={handleInputChange(index, "firstInvolvement.estimated")}
        disabled={isReadOnlyField(
          `${path}.section23_2[${index}].firstInvolvement.estimated`
        )}
      />
      <label htmlFor={`firstInvolvement-estimated-${index}`}>Estimated</label>

      <label htmlFor={`mostRecentInvolvement-date-${index}`}>
        Most Recent Involvement (Month/Year)
      </label>
      <input
        id={`mostRecentInvolvement-date-${index}`}
        type="date"
        value={item.mostRecentInvolvement.date}
        onChange={handleInputChange(index, "mostRecentInvolvement.date")}
        disabled={isReadOnlyField(
          `${path}.section23_2[${index}].mostRecentInvolvement.date`
        )}
      />
      <input
        type="checkbox"
        id={`mostRecentInvolvement-estimated-${index}`}
        checked={item.mostRecentInvolvement.estimated}
        onChange={handleInputChange(index, "mostRecentInvolvement.estimated")}
        disabled={isReadOnlyField(
          `${path}.section23_2[${index}].mostRecentInvolvement.estimated`
        )}
      />
      <label htmlFor={`mostRecentInvolvement-estimated-${index}`}>
        Estimated
      </label>

      <label htmlFor={`natureAndFrequencyOfActivity-${index}`}>
        Nature and Frequency of Activity
      </label>
      <textarea
        id={`natureAndFrequencyOfActivity-${index}`}
        value={item.natureAndFrequencyOfActivity}
        onChange={handleInputChange(index, "natureAndFrequencyOfActivity")}
        disabled={isReadOnlyField(
          `${path}.section23_2[${index}].natureAndFrequencyOfActivity`
        )}
        placeholder="Nature and Frequency of Activity"
      />

      <label htmlFor={`reasonsForActivity-${index}`}>
        Reasons for Activity
      </label>
      <textarea
        id={`reasonsForActivity-${index}`}
        value={item.reasonsForActivity}
        onChange={handleInputChange(index, "reasonsForActivity")}
        disabled={isReadOnlyField(
          `${path}.section23_2[${index}].reasonsForActivity`
        )}
        placeholder="Reasons for Activity"
      />

      <input
        type="checkbox"
        id={`involvementWhileEmployedInPublicSafety-${index}`}
        checked={item.involvementWhileEmployedInPublicSafety}
        onChange={handleInputChange(
          index,
          "involvementWhileEmployedInPublicSafety"
        )}
        disabled={isReadOnlyField(
          `${path}.section23_2[${index}].involvementWhileEmployedInPublicSafety`
        )}
      />
      <label htmlFor={`involvementWhileEmployedInPublicSafety-${index}`}>
        Involvement While Employed in Public Safety
      </label>

      <input
        type="checkbox"
        id={`involvementWhilePossessingSecurityClearance-${index}`}
        checked={item.involvementWhilePossessingSecurityClearance}
        onChange={handleInputChange(
          index,
          "involvementWhilePossessingSecurityClearance"
        )}
        disabled={isReadOnlyField(
          `${path}.section23_2[${index}].involvementWhilePossessingSecurityClearance`
        )}
      />
      <label htmlFor={`involvementWhilePossessingSecurityClearance-${index}`}>
        Involvement While Possessing Security Clearance
      </label>

      <input
        type="checkbox"
        id={`intendToEngageInFuture-${index}`}
        checked={item.intendToEngageInFuture}
        onChange={handleInputChange(index, "intendToEngageInFuture")}
        disabled={isReadOnlyField(
          `${path}.section23_2[${index}].intendToEngageInFuture`
        )}
      />
      <label htmlFor={`intendToEngageInFuture-${index}`}>
        Intend to Engage in Future
      </label>

      <label htmlFor={`futureEngagementExplanation-${index}`}>
        Explanation of Future Engagement Intentions
      </label>
      <textarea
        id={`futureEngagementExplanation-${index}`}
        value={item.futureEngagementExplanation}
        onChange={handleInputChange(index, "futureEngagementExplanation")}
        disabled={isReadOnlyField(
          `${path}.section23_2[${index}].futureEngagementExplanation`
        )}
        placeholder="Explanation of Future Engagement Intentions"
      />

      <button
        onClick={(event) => {
          event.preventDefault();
          onRemoveEntry(`${path}.section23_2`, index);
        }}
        disabled={isReadOnlyField(`section23_2[${index}].remove`)}
      >
        Remove Entry
      </button>
    </div>
  );

  return (
    <div>
      <h2>Section 23.2</h2>
      {data.map((item, index) => renderEntry(item, index))}
      <button
        onClick={(event) => {
          event.preventDefault();
          onAddEntry(
            `${path}.section23_2`,
            getDefaultNewItem(`${path}.section23_2`)
          );
        }}
      >
        Add Entry
      </button>
    </div>
  );
};

export { RenderSection23_2 };
