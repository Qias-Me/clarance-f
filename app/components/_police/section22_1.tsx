
import React from "react";
import { type Section22_1 } from "api/interfaces/sections/policeRecord";

interface Section22_1Props {
  data: Section22_1[];
  onInputChange: (path: string, value: any) => void;
  onRemoveEntry: (path: string, index: number) => void;
  onAddEntry: (path: string, newItem: Section22_1) => void;
  path: string;
  isReadOnlyField: (fieldName: string) => boolean;
  getDefaultNewItem: (itemType: string) => any;
}

const RenderSection22_1: React.FC<Section22_1Props> = ({
  data,
  onInputChange,
  onRemoveEntry,
  onAddEntry,
  getDefaultNewItem,
  path,
  isReadOnlyField,
}) => {
  const handleInputChange =
    (fieldPath: string) =>
    (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      onInputChange(`${path}.${fieldPath}`, event.target.value);
    };

  const handleCheckboxChange =
    (fieldPath: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
      onInputChange(`${path}.${fieldPath}`, event.target.checked);
    };

  const handleAddSubsequentCharge = (index: number) => {
    const newCharge = {
      _id: Math.random(),
      felonyMisdemeanor: "",
      charge: "",
      outcome: "",
      dateInfo: {
        date: "",
        estimated: false,
      },
    };
    const newPath = `${path}.section22_1[${index}].charges`;
    const updatedContacts = [...data[index].charges, newCharge];
    onInputChange(newPath, updatedContacts);
  };

  const handleRemoveSubsequentCharge = (
    index: number,
    contactIndex: number
  ) => {
    const newPath = `${path}.section22_1[${index}].charges`;
    const updatedContacts = data[index].charges.filter(
      (_, i) => i !== contactIndex
    );
    onInputChange(newPath, updatedContacts);
  };

  const renderEntry = (item: Section22_1, index: number) => (
    <div key={index} className="space-y-4 p-4 border rounded-lg">
      <h3>Entry #{index + 1}</h3>

      <label htmlFor={`dateOfOffense-date-${index}`}>Date of Offense</label>
      <input
        id={`dateOfOffense-date-${index}`}
        type="date"
        value={item.dateOfOffense.date}
        onChange={handleInputChange(`section22_1[${index}].dateOfOffense.date`)}
        disabled={isReadOnlyField(`section22_1[${index}].dateOfOffense.date`)}
      />

      <label htmlFor={`description-${index}`}>Description</label>
      <input
        id={`description-${index}`}
        type="text"
        value={item.description}
        onChange={handleInputChange(`section22_1[${index}].description`)}
        disabled={isReadOnlyField(`section22_1[${index}].description`)}
      />

      <label htmlFor={`involvedDomesticViolence-${index}`}>
        Involved Domestic Violence
      </label>
      <input
        id={`involvedDomesticViolence-${index}`}
        type="checkbox"
        checked={item.involvedDomesticViolence}
        onChange={handleCheckboxChange(
          `section22_1[${index}].involvedDomesticViolence`
        )}
        disabled={isReadOnlyField(
          `section22_1[${index}].involvedDomesticViolence`
        )}
      />

      <label htmlFor={`involvedFirearms-${index}`}>Involved Firearms</label>
      <input
        id={`involvedFirearms-${index}`}
        type="checkbox"
        checked={item.involvedFirearms}
        onChange={handleCheckboxChange(
          `section22_1[${index}].involvedFirearms`
        )}
        disabled={isReadOnlyField(`section22_1[${index}].involvedFirearms`)}
      />

      <label htmlFor={`involvedAlcoholDrugs-${index}`}>
        Involved Alcohol/Drugs
      </label>
      <input
        id={`involvedAlcoholDrugs-${index}`}
        type="checkbox"
        checked={item.involvedAlcoholDrugs}
        onChange={handleCheckboxChange(
          `section22_1[${index}].involvedAlcoholDrugs`
        )}
        disabled={isReadOnlyField(`section22_1[${index}].involvedAlcoholDrugs`)}
      />

      <label htmlFor={`offenseLocation-city-${index}`}>
        Offense Location City
      </label>
      <input
        id={`offenseLocation-city-${index}`}
        type="text"
        value={item.offenseLocation.city}
        onChange={handleInputChange(
          `section22_1[${index}].offenseLocation.city`
        )}
        disabled={isReadOnlyField(`section22_1[${index}].offenseLocation.city`)}
      />

      <label htmlFor={`offenseLocation-county-${index}`}>
        Offense Location County
      </label>
      <input
        id={`offenseLocation-county-${index}`}
        type="text"
        value={item.offenseLocation.county}
        onChange={handleInputChange(
          `section22_1[${index}].offenseLocation.county`
        )}
        disabled={isReadOnlyField(
          `section22_1[${index}].offenseLocation.county`
        )}
      />

      <label htmlFor={`offenseLocation-state-${index}`}>
        Offense Location State
      </label>
      <input
        id={`offenseLocation-state-${index}`}
        type="text"
        value={item.offenseLocation.state}
        onChange={handleInputChange(
          `section22_1[${index}].offenseLocation.state`
        )}
        disabled={isReadOnlyField(
          `section22_1[${index}].offenseLocation.state`
        )}
      />

      <label htmlFor={`offenseLocation-zip-${index}`}>
        Offense Location Zip
      </label>
      <input
        id={`offenseLocation-zip-${index}`}
        type="text"
        value={item.offenseLocation.zip}
        onChange={handleInputChange(
          `section22_1[${index}].offenseLocation.zip`
        )}
        disabled={isReadOnlyField(`section22_1[${index}].offenseLocation.zip`)}
      />

      <label htmlFor={`offenseLocation-country-${index}`}>
        Offense Location Country
      </label>
      <input
        id={`offenseLocation-country-${index}`}
        type="text"
        value={item.offenseLocation.country}
        onChange={handleInputChange(
          `section22_1[${index}].offenseLocation.country`
        )}
        disabled={isReadOnlyField(
          `section22_1[${index}].offenseLocation.country`
        )}
      />

      <label htmlFor={`arrestedSummonedCited-${index}`}>
        Arrested/Summoned/Cited
      </label>
      <input
        id={`arrestedSummonedCited-${index}`}
        type="checkbox"
        checked={item.arrestedSummonedCited}
        onChange={handleCheckboxChange(
          `section22_1[${index}].arrestedSummonedCited`
        )}
        disabled={isReadOnlyField(
          `section22_1[${index}].arrestedSummonedCited`
        )}
      />

      {item.arrestedSummonedCited && (
        <>
          <label htmlFor={`lawEnforcementAgencyName-${index}`}>
            Law Enforcement Agency Name
          </label>
          <input
            id={`lawEnforcementAgencyName-${index}`}
            type="text"
            value={item.lawEnforcementAgencyName}
            onChange={handleInputChange(
              `section22_1[${index}].lawEnforcementAgencyName`
            )}
            disabled={isReadOnlyField(
              `section22_1[${index}].lawEnforcementAgencyName`
            )}
          />

          <label htmlFor={`lawEnforcementLocation-city-${index}`}>
            Arrest Location City
          </label>
          <input
            id={`lawEnforcementLocation-city-${index}`}
            type="text"
            value={item.lawEnforcementLocation.city}
            onChange={handleInputChange(
              `section22_1[${index}].lawEnforcementLocation.city`
            )}
            disabled={isReadOnlyField(
              `section22_1[${index}].lawEnforcementLocation.city`
            )}
          />

          <label htmlFor={`lawEnforcementLocation-county-${index}`}>
            Arrest Location County
          </label>
          <input
            id={`lawEnforcementLocation-county-${index}`}
            type="text"
            value={item.lawEnforcementLocation.county}
            onChange={handleInputChange(
              `section22_1[${index}].lawEnforcementLocation.county`
            )}
            disabled={isReadOnlyField(
              `section22_1[${index}].lawEnforcementLocation.county`
            )}
          />

          <label htmlFor={`lawEnforcementLocation-state-${index}`}>
            Arrest Location State
          </label>
          <input
            id={`lawEnforcementLocation-state-${index}`}
            type="text"
            value={item.lawEnforcementLocation.state}
            onChange={handleInputChange(
              `section22_1[${index}].lawEnforcementLocation.state`
            )}
            disabled={isReadOnlyField(
              `section22_1[${index}].lawEnforcementLocation.state`
            )}
          />

          <label htmlFor={`lawEnforcementLocation-zip-${index}`}>
            Arrest Location Zip
          </label>
          <input
            id={`lawEnforcementLocation-zip-${index}`}
            type="text"
            value={item.lawEnforcementLocation.zip}
            onChange={handleInputChange(
              `section22_1[${index}].lawEnforcementLocation.zip`
            )}
            disabled={isReadOnlyField(
              `section22_1[${index}].lawEnforcementLocation.zip`
            )}
          />

          <label htmlFor={`lawEnforcementLocation-country-${index}`}>
            Arrest Location Country
          </label>
          <input
            id={`lawEnforcementLocation-country-${index}`}
            type="text"
            value={item.lawEnforcementLocation.country}
            onChange={handleInputChange(
              `section22_1[${index}].lawEnforcementLocation.country`
            )}
            disabled={isReadOnlyField(
              `section22_1[${index}].lawEnforcementLocation.country`
            )}
          />
        </>
      )}

      <label htmlFor={`chargedConvicted-${index}`}>Charged/Convicted</label>
      <input
        id={`chargedConvicted-${index}`}
        type="checkbox"
        checked={item.chargedConvicted}
        onChange={handleCheckboxChange(
          `section22_1[${index}].chargedConvicted`
        )}
        disabled={isReadOnlyField(`section22_1[${index}].chargedConvicted`)}
      />

      {item.chargedConvicted && (
        <>
          <label htmlFor={`courtName-${index}`}>Court Name</label>
          <input
            id={`courtName-${index}`}
            type="text"
            value={item.courtName}
            onChange={handleInputChange(`section22_1[${index}].courtName`)}
            disabled={isReadOnlyField(`section22_1[${index}].courtName`)}
          />

          {/* Location Fields */}
          <label htmlFor={`city-${index}`}>City</label>
          <input
            id={`city-${index}`}
            type="text"
            value={item.courtLocation.city}
            onChange={handleInputChange(
              `section22_1[${index}].courtLocation.city`
            )}
            disabled={isReadOnlyField(
              `section22_1[${index}].courtLocation.city`
            )}
          />

          <label htmlFor={`county-${index}`}>County</label>
          <input
            id={`county-${index}`}
            type="text"
            value={item.courtLocation.county}
            onChange={handleInputChange(
              `section22_1[${index}].courtLocation.county`
            )}
            disabled={isReadOnlyField(
              `section22_1[${index}].courtLocation.county`
            )}
          />

          <label htmlFor={`state-${index}`}>State</label>
          <input
            id={`state-${index}`}
            type="text"
            value={item.courtLocation.state}
            onChange={handleInputChange(
              `section22_1[${index}].courtLocation.state`
            )}
            disabled={isReadOnlyField(
              `section22_1[${index}].courtLocation.state`
            )}
          />

          <label htmlFor={`zip-${index}`}>Zip</label>
          <input
            id={`zip-${index}`}
            type="text"
            value={item.courtLocation.zip}
            onChange={handleInputChange(
              `section22_1[${index}].courtLocation.zip`
            )}
            disabled={isReadOnlyField(
              `section22_1[${index}].courtLocation.zip`
            )}
          />

          <label htmlFor={`country-${index}`}>Country</label>
          <input
            id={`country-${index}`}
            type="text"
            value={item.courtLocation.country}
            onChange={handleInputChange(
              `section22_1[${index}].courtLocation.country`
            )}
            disabled={isReadOnlyField(
              `section22_1[${index}].courtLocation.country`
            )}
          />

          {item.charges.map((charge, chargeIndex) => (
            <div key={charge._id}>
              {/* Existing fields here */}
              <label htmlFor={`felonyMisdemeanor-${index}-${chargeIndex}`}>
                Felony/Misdemeanor
              </label>
              <select
                id={`felonyMisdemeanor-${index}-${chargeIndex}`}
                value={charge.felonyMisdemeanor}
                onChange={handleInputChange(
                  `section22_1[${index}].charges[${chargeIndex}].felonyMisdemeanor`
                )}
                disabled={isReadOnlyField(
                  `section22_1[${index}].charges[${chargeIndex}].felonyMisdemeanor`
                )}
              >
                <option value="Felony">Felony</option>
                <option value="Misdemeanor">Misdemeanor</option>
              </select>
              {/* Other fields here */}
              <label htmlFor={`date-${index}-${chargeIndex}`}>Date</label>
              <input
                id={`date-${index}-${chargeIndex}`}
                type="date"
                value={charge.dateInfo.date}
                onChange={handleInputChange(
                  `section22_1[${index}].charges[${chargeIndex}].dateInfo.date`
                )}
                disabled={isReadOnlyField(
                  `section22_1[${index}].charges[${chargeIndex}].dateInfo.date`
                )}
              />
              <label htmlFor={`dateEstimated-${index}-${chargeIndex}`}>
                Estimated
              </label>
              <input
                id={`dateEstimated-${index}-${chargeIndex}`}
                type="checkbox"
                checked={charge.dateInfo.estimated}
                onChange={handleCheckboxChange(
                  `section22_1[${index}].charges[${chargeIndex}].dateInfo.estimated`
                )}
                disabled={isReadOnlyField(
                  `section22_1[${index}].charges[${chargeIndex}].dateInfo.estimated`
                )}
              />
              <button
                type="button"
                onClick={() => handleRemoveSubsequentCharge(index, chargeIndex)}
              >
                Remove Charge
              </button>
            </div>
          ))}
          <button
            onClick={(event) => {
              event.preventDefault();
              handleAddSubsequentCharge(index);
            }}
          >
            Add Entry
          </button>
        </>
      )}

      <label htmlFor={`sentenced-${index}`}>Sentenced</label>
      <input
        id={`sentenced-${index}`}
        type="checkbox"
        checked={item.sentenced}
        onChange={handleCheckboxChange(`section22_1[${index}].sentenced`)}
        disabled={isReadOnlyField(`section22_1[${index}].sentenced`)}
      />

      {item.sentenced && (
        <>
          <label htmlFor={`sentenceDescription-${index}`}>
            Sentence Description
          </label>
          <input
            id={`sentenceDescription-${index}`}
            type="text"
            value={item.sentenceDescription}
            onChange={handleInputChange(
              `section22_1[${index}].sentenceDescription`
            )}
            disabled={isReadOnlyField(
              `section22_1[${index}].sentenceDescription`
            )}
          />

          <label htmlFor={`imprisonmentTermExceeding1Year-${index}`}>
            Imprisonment Term Exceeding 1 Year
          </label>
          <input
            id={`imprisonmentTermExceeding1Year-${index}`}
            type="checkbox"
            checked={item.imprisonmentTermExceeding1Year}
            onChange={handleCheckboxChange(
              `section22_1[${index}].imprisonmentTermExceeding1Year`
            )}
            disabled={isReadOnlyField(
              `section22_1[${index}].imprisonmentTermExceeding1Year`
            )}
          />

          <label htmlFor={`imprisonmentLessThan1Year-${index}`}>
            Imprisonment Less Than 1 Year
          </label>
          <input
            id={`imprisonmentLessThan1Year-${index}`}
            type="checkbox"
            checked={item.imprisonmentLessThan1Year}
            onChange={handleCheckboxChange(
              `section22_1[${index}].imprisonmentLessThan1Year`
            )}
            disabled={isReadOnlyField(
              `section22_1[${index}].imprisonmentLessThan1Year`
            )}
          />

          {/* Imprisonment Dates */}
          <label htmlFor={`imprisonmentFrom-${index}`}>Imprisonment From</label>
          <input
            id={`imprisonmentFrom-${index}`}
            type="date"
            value={item.imprisonmentDates.from}
            onChange={handleInputChange(
              `section22_1[${index}].imprisonmentDates.from`
            )}
            disabled={isReadOnlyField(
              `section22_1[${index}].imprisonmentDates.from`
            )}
          />

          <label htmlFor={`imprisonmentTo-${index}`}>Imprisonment To</label>
          <input
            id={`imprisonmentTo-${index}`}
            type="date"
            value={item.imprisonmentDates.to}
            onChange={handleInputChange(
              `section22_1[${index}].imprisonmentDates.to`
            )}
            disabled={isReadOnlyField(
              `section22_1[${index}].imprisonmentDates.to`
            )}
          />

          <label htmlFor={`imprisonmentEstimated-${index}`}>
            Imprisonment Estimated
          </label>
          <input
            id={`imprisonmentEstimated-${index}`}
            type="checkbox"
            checked={item.imprisonmentDates.estimated}
            onChange={handleCheckboxChange(
              `section22_1[${index}].imprisonmentDates.estimated`
            )}
            disabled={isReadOnlyField(
              `section22_1[${index}].imprisonmentDates.estimated`
            )}
          />

          <label htmlFor={`imprisonmentPresent-${index}`}>
            Imprisonment Present
          </label>
          <input
            id={`imprisonmentPresent-${index}`}
            type="checkbox"
            checked={item.imprisonmentDates.present}
            onChange={handleCheckboxChange(
              `section22_1[${index}].imprisonmentDates.present`
            )}
            disabled={isReadOnlyField(
              `section22_1[${index}].imprisonmentDates.present`
            )}
          />

          {/* Probation/Parole Dates */}
          <label htmlFor={`probationParoleFrom-${index}`}>
            Probation/Parole From
          </label>
          <input
            id={`probationParoleFrom-${index}`}
            type="date"
            value={item.probationParoleDates.from}
            onChange={handleInputChange(
              `section22_1[${index}].probationParoleDates.from`
            )}
            disabled={isReadOnlyField(
              `section22_1[${index}].probationParoleDates.from`
            )}
          />

          <label htmlFor={`probationParoleTo-${index}`}>
            Probation/Parole To
          </label>
          <input
            id={`probationParoleTo-${index}`}
            type="date"
            value={item.probationParoleDates.to}
            onChange={handleInputChange(
              `section22_1[${index}].probationParoleDates.to`
            )}
            disabled={isReadOnlyField(
              `section22_1[${index}].probationParoleDates.to`
            )}
          />

          <label htmlFor={`probationParoleEstimated-${index}`}>
            Probation/Parole Estimated
          </label>
          <input
            id={`probationParoleEstimated-${index}`}
            type="checkbox"
            checked={item.probationParoleDates.estimated}
            onChange={handleCheckboxChange(
              `section22_1[${index}].probationParoleDates.estimated`
            )}
            disabled={isReadOnlyField(
              `section22_1[${index}].probationParoleDates.estimated`
            )}
          />

          <label htmlFor={`probationParolePresent-${index}`}>
            Probation/Parole Present
          </label>
          <input
            id={`probationParolePresent-${index}`}
            type="checkbox"
            checked={item.probationParoleDates.present}
            onChange={handleCheckboxChange(
              `section22_1[${index}].probationParoleDates.present`
            )}
            disabled={isReadOnlyField(
              `section22_1[${index}].probationParoleDates.present`
            )}
          />

          <label htmlFor={`awaitingTrial-${index}`}>Awaiting Trial</label>
          <input
            id={`awaitingTrial-${index}`}
            type="checkbox"
            checked={item.awaitingTrial}
            onChange={handleCheckboxChange(
              `section22_1[${index}].awaitingTrial`
            )}
            disabled={isReadOnlyField(`section22_1[${index}].awaitingTrial`)}
          />

          <label htmlFor={`awaitingTrialExplanation-${index}`}>
            Awaiting Trial Explanation
          </label>
          <input
            id={`awaitingTrialExplanation-${index}`}
            type="text"
            value={item.awaitingTrialExplanation}
            onChange={handleInputChange(
              `section22_1[${index}].awaitingTrialExplanation`
            )}
            disabled={isReadOnlyField(
              `section22_1[${index}].awaitingTrialExplanation`
            )}
          />
        </>
      )}

      <label htmlFor={`awaitingTrial-${index}`}>Awaiting Trial</label>
      <input
        id={`awaitingTrial-${index}`}
        type="checkbox"
        checked={item.awaitingTrial}
        onChange={handleCheckboxChange(`section22_1[${index}].awaitingTrial`)}
        disabled={isReadOnlyField(`section22_1[${index}].awaitingTrial`)}
      />

      {item.awaitingTrial && (
        <>
          <label htmlFor={`awaitingTrialExplanation-${index}`}>
            Awaiting Trial Explanation
          </label>
          <input
            id={`awaitingTrialExplanation-${index}`}
            type="text"
            value={item.awaitingTrialExplanation}
            onChange={handleInputChange(
              `section22_1[${index}].awaitingTrialExplanation`
            )}
            disabled={isReadOnlyField(
              `section22_1[${index}].awaitingTrialExplanation`
            )}
          />
        </>
      )}

      <button
        onClick={(event) => {
          event.preventDefault();
          onRemoveEntry(`${path}.section22_1`, index);
        }}
        disabled={isReadOnlyField(`section22_1[${index}]`)}
      >
        Remove Entry
      </button>
    </div>
  );

  return (
    <div className="space-y-4">
      <h2>Section 22.1</h2>
      {data.map(renderEntry)}

      <button
        onClick={(event) => {
          event.preventDefault();
          onAddEntry(
            `${path}.section22_1`,
            getDefaultNewItem(`${path}.section22_1`)
          );
        }}
      >
        Add Entry
      </button>
    </div>
  );
};

export { RenderSection22_1 };
