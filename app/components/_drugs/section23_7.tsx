import React from "react";
import { Section23_7 } from "api_v2/interfaces/drugsActivity";

interface Section23_7Props {
  data: Section23_7[];
  onInputChange: (path: string, value: any) => void;
  onRemoveEntry: (path: string, index: number) => void;
  onAddEntry: (path: string, newItem: Section23_7) => void;
  path: string;
  isReadOnlyField: (fieldName: string) => boolean;
  getDefaultNewItem: (itemType: string) => any;
}

const RenderSection23_7: React.FC<Section23_7Props> = ({
  data,
  onInputChange,
  onRemoveEntry,
  onAddEntry,
  getDefaultNewItem,
  path,
  isReadOnlyField,
}) => {
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

  const renderDrugTypes = (selectedType: string, index: number) => (
    <div>
      <label htmlFor={`nameOfSubstance-${index}`}>Name of Substance</label>
      {drugTypes.map((type) => (
  

          <div key={type}>
            <input
              type="radio"
              id={`drugType-${index}-${type}`}
              name={`drugType-${index}`}
              value={type}
              checked={selectedType === type}
              onChange={handleInputChange(index, "typeOfDrug[0].type")}
              disabled={isReadOnlyField(
                `${path}.section23_7[${index}].typeOfDrug[0].type`
              )}
            />
            <label htmlFor={`drugType-${index}-${type}`}>{type}</label>
          </div>
      
      ))}
    </div>
  );

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
      onInputChange(`${path}.section23_7[${index}].${fieldPath}`, value);
    };

  const renderEntry = (item: Section23_7, index: number) => (
    <div key={index} className="space-y-4 p-4 border rounded-lg">
      <h3>Entry #{index + 1}</h3>

      {item.typeOfDrug && renderDrugTypes(item.typeOfDrug[0]?.type, index)}

      <label htmlFor={`dateRange-from-${index}`}>From (Month/Year)</label>
      <input
        id={`dateRange-from-${index}`}
        type="date"
        value={item.dateRange.from}
        onChange={handleInputChange(index, "dateRange.from")}
        disabled={isReadOnlyField(
          `${path}.section23_7[${index}].dateRange.from`
        )}
      />

      <label htmlFor={`dateRange-to-${index}`}>To (Month/Year)</label>
      <input
        id={`dateRange-to-${index}`}
        type="date"
        value={item.dateRange.to}
        onChange={handleInputChange(index, "dateRange.to")}
        disabled={isReadOnlyField(`${path}.section23_7[${index}].dateRange.to`)}
      />

      <input
        type="checkbox"
        id={`dateRange-estimated-${index}`}
        checked={item.dateRange.estimated}
        onChange={handleInputChange(index, "dateRange.estimated")}
        disabled={isReadOnlyField(
          `${path}.section23_7[${index}].dateRange.estimated`
        )}
      />
      <label htmlFor={`dateRange-estimated-${index}`}>Estimated</label>

      <input
        type="checkbox"
        id={`dateRange-present-${index}`}
        checked={item.dateRange.present}
        onChange={handleInputChange(index, "dateRange.present")}
        disabled={isReadOnlyField(
          `${path}.section23_7[${index}].dateRange.present`
        )}
      />
      <label htmlFor={`dateRange-present-${index}`}>Present</label>

      <label htmlFor={`frequencyOfUse-${index}`}>Frequency of Use</label>
      <input
        id={`frequencyOfUse-${index}`}
        type="text"
        value={item.frequencyOfUse}
        onChange={handleInputChange(index, "frequencyOfUse")}
        disabled={isReadOnlyField(
          `${path}.section23_7[${index}].frequencyOfUse`
        )}
        placeholder="Frequency of Use"
      />

      <input
        type="checkbox"
        id={`useWhileEmployedInPublicSafety-${index}`}
        checked={item.useWhileEmployedInPublicSafety}
        onChange={handleInputChange(index, "useWhileEmployedInPublicSafety")}
        disabled={isReadOnlyField(
          `${path}.section23_7[${index}].useWhileEmployedInPublicSafety`
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
          `${path}.section23_7[${index}].useWhilePossessingSecurityClearance`
        )}
      />
      <label htmlFor={`useWhilePossessingSecurityClearance-${index}`}>
        Use While Possessing Security Clearance
      </label>

      <button
        onClick={(event) => {
          event.preventDefault();
          onRemoveEntry(`${path}.section23_7`, index);
        }}
        disabled={isReadOnlyField(`${path}.section23_7[${index}]`)}
      >
        Remove Entry
      </button>
    </div>
  );

  return (
    <div className="space-y-4">
      <h2>Section 23.7</h2>
      {data.map((item, index) => renderEntry(item, index))}
      <button
        onClick={(event) => {
          event.preventDefault();
          onAddEntry(
            `${path}.section23_7`,
            getDefaultNewItem(`${path}.section23_7`)
          );
        }}
      >
        Add Entry
      </button>
    </div>
  );
};

export { RenderSection23_7 };
