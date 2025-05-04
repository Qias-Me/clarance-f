import React from "react";
import { Section23_6 } from "api_v2/interfaces/drugsActivity";

interface Section23_6Props {
  data: Section23_6[];
  onInputChange: (path: string, value: any) => void;
  onRemoveEntry: (path: string, index: number) => void;
  onAddEntry: (path: string, newItem: Section23_6) => void;
  path: string;
  isReadOnlyField: (fieldName: string) => boolean;
  getDefaultNewItem: (itemType: string) => any;
}

const RenderSection23_6: React.FC<Section23_6Props> = ({
  data,
  onInputChange,
  onRemoveEntry,
  onAddEntry,
  getDefaultNewItem,
  path,
  isReadOnlyField,
}) => {
  const handleInputChange =
    (index: number, fieldPath: string) =>
    (
      event: React.ChangeEvent<
        HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
      >
    ) => {
      const value =
        event.target.type === "checkbox"
          ? event.target.checked
          : event.target.value;
      onInputChange(`${path}.section23_6[${index}].${fieldPath}`, value);
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

  const orderedByOptions = [
    "An employer, military commander, or employee assistance program",
    "A medical professional",
    "A mental health professional",
    "A court official / judge",
    "I have not been ordered, advised, or asked to seek",
    "counseling or treatment by any of the above.",
  ];

  const renderDrugTypes = (selectedType: string, index: number) => (
    <div>
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
              `${path}.section23_6[${index}].typeOfDrug[0].type`
            )}
          />
          <label htmlFor={`drugType-${index}-${type}`}>{type}</label>
        </div>
      ))}
    </div>
  );

  const renderOrderedBy = (
    selectedOption: string,
    index: number,
    idx: number
  ) => (
    <div>
      {orderedByOptions.map((option) => (
        <div key={option}>
          <input
            type="radio"
            id={`orderedBy-${index}-${idx}-${option}`}
            name={`orderedBy-${index}-${idx}`}
            value={option}
            checked={selectedOption === option}
            onChange={handleInputChange(index, `orderedBy[${idx}].name`)}
            disabled={isReadOnlyField(
              `${path}.section23_6[${index}].orderedBy[${idx}].name`
            )}
          />
          <label htmlFor={`orderedBy-${index}-${idx}-${option}`}>
            {option}
          </label>
        </div>
      ))}
    </div>
  );

  const renderEntry = (item: Section23_6, index: number) => (
    <div key={index} className="space-y-4 p-4 border rounded-lg">
      <h3>Entry #{index + 1}</h3>

      {item.typeOfDrug && renderDrugTypes(item.typeOfDrug[0]?.type, index)}

      {item.typeOfDrug && item.typeOfDrug[0]?.type === "Other" && (
        <textarea
          value={item.otherDrugExplanation}
          onChange={handleInputChange(index, "otherDrugExplanation")}
          disabled={isReadOnlyField(
            `${path}.section23_6[${index}].otherDrugExplanation`
          )}
          placeholder="Other Drug Explanation"
        />
      )}

      <div>
        {item.orderedBy.map((order, idx) => (
          <div key={idx}>
            <h4>Ordered By #{idx + 1}</h4>
            {renderOrderedBy(order.name, index, idx)}
          </div>
        ))}
      </div>

      <label htmlFor={`orderedExplanation-${index}`}>Ordered Explanation</label>
      <textarea
        id={`orderedExplanation-${index}`}
        value={item.orderedExplanation}
        onChange={handleInputChange(index, "orderedExplanation")}
        disabled={isReadOnlyField(
          `${path}.section23_6[${index}].orderedExplanation`
        )}
      />

      <input
        type="checkbox"
        id={`receivedTreatment-${index}`}
        checked={item.receivedTreatment}
        onChange={handleInputChange(index, "receivedTreatment")}
        disabled={isReadOnlyField(
          `${path}.section23_6[${index}].receivedTreatment`
        )}
      />
      <label htmlFor={`receivedTreatment-${index}`}>Received Treatment</label>

      {item.typeOfDrug &&
        item.typeOfDrug.map((drug, idx) => (
          <div key={idx}>
            <label htmlFor={`typeOfDrug-${index}-${idx}`}>{drug.type}</label>
            <input
              id={`typeOfDrug-${index}-${idx}`}
              type="text"
              value={drug.type}
              onChange={(e) =>
                handleInputChange(index, `typeOfDrug[${idx}].type`)(e)
              }
              disabled={isReadOnlyField(
                `${path}.section23_6[${index}].typeOfDrug[${idx}].type`
              )}
            />
          </div>
        ))}

      {item.receivedTreatment ? (
        <>
          <label htmlFor={`treatmentProviderName-firstName-${index}`}>
            First Name
          </label>
          <input
            id={`treatmentProviderName-firstName-${index}`}
            type="text"
            value={item.treatmentProviderName?.firstName || ""}
            onChange={handleInputChange(
              index,
              "treatmentProviderName.firstName"
            )}
            disabled={isReadOnlyField(
              `${path}.section23_6[${index}].treatmentProviderName.firstName`
            )}
            placeholder="First Name"
          />

          <label htmlFor={`treatmentProviderName-lastName-${index}`}>
            Last Name
          </label>
          <input
            id={`treatmentProviderName-lastName-${index}`}
            type="text"
            value={item.treatmentProviderName?.lastName || ""}
            onChange={handleInputChange(
              index,
              "treatmentProviderName.lastName"
            )}
            disabled={isReadOnlyField(
              `${path}.section23_6[${index}].treatmentProviderName.lastName`
            )}
            placeholder="Last Name"
          />

          <label htmlFor={`treatmentProviderAddress-street-${index}`}>
            Street
          </label>
          <input
            id={`treatmentProviderAddress-street-${index}`}
            type="text"
            value={item.treatmentProviderAddress?.street || ""}
            onChange={handleInputChange(
              index,
              "treatmentProviderAddress.street"
            )}
            disabled={isReadOnlyField(
              `${path}.section23_6[${index}].treatmentProviderAddress.street`
            )}
            placeholder="Street"
          />

          <label htmlFor={`treatmentProviderAddress-city-${index}`}>City</label>
          <input
            id={`treatmentProviderAddress-city-${index}`}
            type="text"
            value={item.treatmentProviderAddress?.city || ""}
            onChange={handleInputChange(index, "treatmentProviderAddress.city")}
            disabled={isReadOnlyField(
              `${path}.section23_6[${index}].treatmentProviderAddress.city`
            )}
            placeholder="City"
          />

          <label htmlFor={`treatmentProviderAddress-state-${index}`}>
            State
          </label>
          <input
            id={`treatmentProviderAddress-state-${index}`}
            type="text"
            value={item.treatmentProviderAddress?.state || ""}
            onChange={handleInputChange(
              index,
              "treatmentProviderAddress.state"
            )}
            disabled={isReadOnlyField(
              `${path}.section23_6[${index}].treatmentProviderAddress.state`
            )}
            placeholder="State"
          />

          <label htmlFor={`treatmentProviderAddress-zipCode-${index}`}>
            Zip Code
          </label>
          <input
            id={`treatmentProviderAddress-zipCode-${index}`}
            type="text"
            value={item.treatmentProviderAddress?.zipCode || ""}
            onChange={handleInputChange(
              index,
              "treatmentProviderAddress.zipCode"
            )}
            disabled={isReadOnlyField(
              `${path}.section23_6[${index}].treatmentProviderAddress.zipCode`
            )}
            placeholder="Zip Code"
          />

          <label htmlFor={`treatmentProviderAddress-country-${index}`}>
            Country
          </label>
          <input
            id={`treatmentProviderAddress-country-${index}`}
            type="text"
            value={item.treatmentProviderAddress?.country || ""}
            onChange={handleInputChange(
              index,
              "treatmentProviderAddress.country"
            )}
            disabled={isReadOnlyField(
              `${path}.section23_6[${index}].treatmentProviderAddress.country`
            )}
            placeholder="Country"
          />

          <label htmlFor={`treatmentProviderPhone-number-${index}`}>
            Phone Number
          </label>
          <input
            id={`treatmentProviderPhone-number-${index}`}
            type="text"
            value={item.treatmentProviderPhone?.number || ""}
            onChange={handleInputChange(index, "treatmentProviderPhone.number")}
            disabled={isReadOnlyField(
              `${path}.section23_6[${index}].treatmentProviderPhone.number`
            )}
            placeholder="Phone Number"
          />

          <input
            type="checkbox"
            id={`treatmentProviderPhone-international-${index}`}
            checked={item.treatmentProviderPhone?.international || false}
            onChange={handleInputChange(
              index,
              "treatmentProviderPhone.international"
            )}
            disabled={isReadOnlyField(
              `${path}.section23_6[${index}].treatmentProviderPhone.international`
            )}
          />
          <label htmlFor={`treatmentProviderPhone-international-${index}`}>
            International
          </label>

          <label htmlFor={`treatmentProviderPhone-timeOfDay-${index}`}>
            Time of Day
          </label>
          <input
            id={`treatmentProviderPhone-timeOfDay-${index}`}
            type="text"
            value={item.treatmentProviderPhone?.timeOfDay || ""}
            onChange={handleInputChange(
              index,
              "treatmentProviderPhone.timeOfDay"
            )}
            disabled={isReadOnlyField(
              `${path}.section23_6[${index}].treatmentProviderPhone.timeOfDay`
            )}
            placeholder="Time of Day"
          />

          <label htmlFor={`dateRange-from-${index}`}>From (Month/Year)</label>
          <input
            id={`dateRange-from-${index}`}
            type="date"
            value={item.dateRange?.from.date || ""}
            onChange={handleInputChange(index, "dateRange.from.date")}
            disabled={isReadOnlyField(
              `${path}.section23_6[${index}].dateRange.from.date`
            )}
          />

          <label htmlFor={`dateRange-from-${index}`}>To (Month/Year)</label>

          <input
            type="checkbox"
            id={`dateRange-estimated-from-${index}`}
            checked={item.dateRange?.from.estimated || false}
            onChange={handleInputChange(index, "dateRange.from.estimated")}
            disabled={isReadOnlyField(
              `${path}.section23_6[${index}].dateRange.from.estimated`
            )}
          />
          <label htmlFor={`dateRange-estimated-from-${index}`}>Estimated</label>

          <label htmlFor={`dateRange-to-${index}`}>To (Month/Year)</label>
          <input
            id={`dateRange-to-${index}`}
            type="date"
            value={item.dateRange?.to.date || ""}
            onChange={handleInputChange(index, "dateRange.to.date")}
            disabled={isReadOnlyField(
              `${path}.section23_6[${index}].dateRange.to.date`
            )}
          />

          <input
            type="checkbox"
            id={`dateRange-estimated-to-${index}`}
            checked={item.dateRange?.to.estimated || false}
            onChange={handleInputChange(index, "dateRange.to.estimated")}
            disabled={isReadOnlyField(
              `${path}.section23_6[${index}].dateRange.to.estimated`
            )}
          />
          <label htmlFor={`dateRange-estimated-${index}`}>Estimated</label>

          <input
            type="checkbox"
            id={`dateRange-present-${index}`}
            checked={item.dateRange?.present || false}
            onChange={handleInputChange(index, "dateRange.present")}
            disabled={isReadOnlyField(
              `${path}.section23_6[${index}].dateRange.present`
            )}
          />
          <label htmlFor={`dateRange-present-${index}`}>Present</label>

          <input
            type="checkbox"
            id={`successfullyCompleted-${index}`}
            checked={item.successfullyCompleted}
            onChange={handleInputChange(index, "successfullyCompleted")}
            disabled={isReadOnlyField(
              `${path}.section23_6[${index}].successfullyCompleted`
            )}
          />
          <label htmlFor={`successfullyCompleted-${index}`}>
            Successfully Completed
          </label>

          <label htmlFor={`completionExplanation-${index}`}>
            Completion Explanation
          </label>
          <textarea
            id={`completionExplanation-${index}`}
            value={item.completionExplanation}
            onChange={handleInputChange(index, "completionExplanation")}
            disabled={isReadOnlyField(
              `${path}.section23_6[${index}].completionExplanation`
            )}
            placeholder="Completion Explanation"
          />
        </>
      ) : (
        <>
          <label htmlFor={`noTreatmentExplanation-${index}`}>
            No Treatment Explanation
          </label>
          <textarea
            id={`noTreatmentExplanation-${index}`}
            value={item.noTreatmentExplanation}
            onChange={handleInputChange(index, "noTreatmentExplanation")}
            disabled={isReadOnlyField(
              `${path}.section23_6[${index}].noTreatmentExplanation`
            )}
          />
        </>
      )}

      <button
        onClick={() => onRemoveEntry(`${path}.section23_6`, index)}
        disabled={isReadOnlyField(`${path}.section23_6[${index}]`)}
      >
        Remove Entry
      </button>
    </div>
  );

  return (
    <div className="space-y-4">
      <h2>Section 23.6</h2>
      {data.map((item, index) => renderEntry(item, index))}
      <button
        onClick={(event) => {
          event.preventDefault();
          onAddEntry(
            `${path}.section23_6`,
            getDefaultNewItem(`${path}.section23_6`)
          );
        }}
      >
        Add Entry
      </button>
    </div>
  );
};

export { RenderSection23_6 };
