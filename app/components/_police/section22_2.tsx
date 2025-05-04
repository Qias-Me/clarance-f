import React from "react";
import { Section22_2 } from "api_v2/interfaces/policeRecord";

interface Section22_2Props {
  data: Section22_2[];
  onInputChange: (path: string, value: any) => void;
  onRemoveEntry: (path: string, index: number) => void;
  onAddEntry: (path: string, newItem: Section22_2) => void;
  path: string;
  isReadOnlyField: (fieldName: string) => boolean;
  getDefaultNewItem: (itemType: string) => any;
}

const RenderSection22_2: React.FC<Section22_2Props> = ({
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
      const newPath = `${path}.section22_2[${index}].charges`;
      const updatedContacts = [...data[index].charges, newCharge];
      onInputChange(newPath, updatedContacts);
    };
  
    const handleRemoveSubsequentCharge = (
      index: number,
      contactIndex: number
    ) => {
      const newPath = `${path}.section22_2[${index}].charges`;
      const updatedContacts = data[index].charges.filter(
        (_, i) => i !== contactIndex
      );
      onInputChange(newPath, updatedContacts);
    };

  const renderEntry = (item: Section22_2, index: number) => (
    <div key={index} className="space-y-4 p-4 border rounded-lg">
      <h3>Entry #{index + 1}</h3>
      <label>
        Date of Offense:
        <input
          type="date"
          value={item.dateOfOffense.date}
          onChange={handleInputChange(`section22_2[${index}].dateOfOffense.date`)}
          disabled={isReadOnlyField(`section22_2[${index}].dateOfOffense.date`)}
        />
      </label>
      <label>
        Estimated:
        <input
          type="checkbox"
          checked={item.dateOfOffense.estimated}
          onChange={handleCheckboxChange(`section22_2[${index}].dateOfOffense.estimated`)}
          disabled={isReadOnlyField(`section22_2[${index}].dateOfOffense.estimated`)}
        />
      </label>
      <label>
        Description:
        <input
          type="text"
          value={item.description}
          onChange={handleInputChange(`section22_2[${index}].description`)}
          disabled={isReadOnlyField(`section22_2[${index}].description`)}
        />
      </label>
      <label>
        Involved Domestic Violence:
        <input
          type="checkbox"
          checked={item.involvedDomesticViolence}
          onChange={handleCheckboxChange(`section22_2[${index}].involvedDomesticViolence`)}
          disabled={isReadOnlyField(`section22_2[${index}].involvedDomesticViolence`)}
        />
      </label>
      <label>
        Involved Firearms:
        <input
          type="checkbox"
          checked={item.involvedFirearms}
          onChange={handleCheckboxChange(`section22_2[${index}].involvedFirearms`)}
          disabled={isReadOnlyField(`section22_2[${index}].involvedFirearms`)}
        />
      </label>
      <label>
        Involved Alcohol/Drugs:
        <input
          type="checkbox"
          checked={item.involvedAlcoholDrugs}
          onChange={handleCheckboxChange(`section22_2[${index}].involvedAlcoholDrugs`)}
          disabled={isReadOnlyField(`section22_2[${index}].involvedAlcoholDrugs`)}
        />
      </label>
      <label>
        Court Name:
        <input
          type="text"
          value={item.courtName}
          onChange={handleInputChange(`section22_2[${index}].courtName`)}
          disabled={isReadOnlyField(`section22_2[${index}].courtName`)}
        />
      </label>
      <label>
        Court Location - City:
        <input
          type="text"
          value={item.courtLocation.city}
          onChange={handleInputChange(`section22_2[${index}].courtLocation.city`)}
          disabled={isReadOnlyField(`section22_2[${index}].courtLocation.city`)}
        />
      </label>
      <label>
        Court Location - County:
        <input
          type="text"
          value={item.courtLocation.county}
          onChange={handleInputChange(`section22_2[${index}].courtLocation.county`)}
          disabled={isReadOnlyField(`section22_2[${index}].courtLocation.county`)}
        />
      </label>
      <label>
        Court Location - State:
        <input
          type="text"
          value={item.courtLocation.state}
          onChange={handleInputChange(`section22_2[${index}].courtLocation.state`)}
          disabled={isReadOnlyField(`section22_2[${index}].courtLocation.state`)}
        />
      </label>
      <label>
        Court Location - ZIP:
        <input
          type="text"
          value={item.courtLocation.zip}
          onChange={handleInputChange(`section22_2[${index}].courtLocation.zip`)}
          disabled={isReadOnlyField(`section22_2[${index}].courtLocation.zip`)}
        />
      </label>
      <label>
        Court Location - Country:
        <input
          type="text"
          value={item.courtLocation.country}
          onChange={handleInputChange(`section22_2[${index}].courtLocation.country`)}
          disabled={isReadOnlyField(`section22_2[${index}].courtLocation.country`)}
        />
      </label>


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
                  `section22_2[${index}].charges[${chargeIndex}].felonyMisdemeanor`
                )}
                disabled={isReadOnlyField(
                  `section22_2[${index}].charges[${chargeIndex}].felonyMisdemeanor`
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
                  `section22_2[${index}].charges[${chargeIndex}].dateInfo.date`
                )}
                disabled={isReadOnlyField(
                  `section22_2[${index}].charges[${chargeIndex}].dateInfo.date`
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
                  `section22_2[${index}].charges[${chargeIndex}].dateInfo.estimated`
                )}
                disabled={isReadOnlyField(
                  `section22_2[${index}].charges[${chargeIndex}].dateInfo.estimated`
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

      <label>
        Sentenced:
        <input
          type="checkbox"
          checked={item.sentenced}
          onChange={handleCheckboxChange(`section22_2[${index}].sentenced`)}
          disabled={isReadOnlyField(`section22_2[${index}].sentenced`)}
        />
      </label>

      {item.sentenced ? (
        <div className="sentenced-fields">
          <label>
            Sentence Description:
            <input
              type="text"
              value={item.sentenceDescription}
              onChange={handleInputChange(`section22_2[${index}].sentenceDescription`)}
              disabled={isReadOnlyField(`section22_2[${index}].sentenceDescription`)}
            />
          </label>
          <label>
            Imprisonment Term Exceeding 1 Year:
            <input
              type="checkbox"
              checked={item.imprisonmentTermExceeding1Year}
              onChange={handleCheckboxChange(`section22_2[${index}].imprisonmentTermExceeding1Year`)}
              disabled={isReadOnlyField(`section22_2[${index}].imprisonmentTermExceeding1Year`)}
            />
          </label>
          <label>
            Imprisonment Less Than 1 Year:
            <input
              type="checkbox"
              checked={item.imprisonmentLessThan1Year}
              onChange={handleCheckboxChange(`section22_2[${index}].imprisonmentLessThan1Year`)}
              disabled={isReadOnlyField(`section22_2[${index}].imprisonmentLessThan1Year`)}
            />
          </label>
          <label>
            Imprisonment Dates From:
            <input
              type="date"
              value={item.imprisonmentDates.from}
              onChange={handleInputChange(`section22_2[${index}].imprisonmentDates.from`)}
              disabled={isReadOnlyField(`section22_2[${index}].imprisonmentDates.from`)}
            />
          </label>
          <label>
            Imprisonment Dates To:
            <input
              type="date"
              value={item.imprisonmentDates.to}
              onChange={handleInputChange(`section22_2[${index}].imprisonmentDates.to`)}
              disabled={isReadOnlyField(`section22_2[${index}].imprisonmentDates.to`)}
            />
          </label>
          <label>
            Imprisonment Dates Estimated:
            <input
              type="checkbox"
              checked={item.imprisonmentDates.estimated}
              onChange={handleCheckboxChange(`section22_2[${index}].imprisonmentDates.estimated`)}
              disabled={isReadOnlyField(`section22_2[${index}].imprisonmentDates.estimated`)}
            />
          </label>
          <label>
            Imprisonment Dates Present:
            <input
              type="checkbox"
              checked={item.imprisonmentDates.present}
              onChange={handleCheckboxChange(`section22_2[${index}].imprisonmentDates.present`)}
              disabled={isReadOnlyField(`section22_2[${index}].imprisonmentDates.present`)}
            />
          </label>
          <label>
            Probation/Parole Dates From:
            <input
              type="date"
              value={item.probationParoleDates.from}
              onChange={handleInputChange(`section22_2[${index}].probationParoleDates.from`)}
              disabled={isReadOnlyField(`section22_2[${index}].probationParoleDates.from`)}
            />
          </label>
          <label>
            Probation/Parole Dates To:
            <input
              type="date"
              value={item.probationParoleDates.to}
              onChange={handleInputChange(`section22_2[${index}].probationParoleDates.to`)}
              disabled={isReadOnlyField(`section22_2[${index}].probationParoleDates.to`)}
            />
          </label>
          <label>
            Probation/Parole Dates Estimated:
            <input
              type="checkbox"
              checked={item.probationParoleDates.estimated}
              onChange={handleCheckboxChange(`section22_2[${index}].probationParoleDates.estimated`)}
              disabled={isReadOnlyField(`section22_2[${index}].probationParoleDates.estimated`)}
            />
          </label>
          <label>
            Probation/Parole Dates Present:
            <input
              type="checkbox"
              checked={item.probationParoleDates.present}
              onChange={handleCheckboxChange(`section22_2[${index}].probationParoleDates.present`)}
              disabled={isReadOnlyField(`section22_2[${index}].probationParoleDates.present`)}
            />
          </label>
        </div>
      ) : (
        <div className="awaiting-trial-fields">
          <label>
            Awaiting Trial:
            <input
              type="checkbox"
              checked={item.awaitingTrial}
              onChange={handleCheckboxChange(`section22_2[${index}].awaitingTrial`)}
              disabled={isReadOnlyField(`section22_2[${index}].awaitingTrial`)}
            />
          </label>
          <label>
            Awaiting Trial Explanation:
            <input
              type="text"
              value={item.awaitingTrialExplanation}
              onChange={handleInputChange(`section22_2[${index}].awaitingTrialExplanation`)}
              disabled={isReadOnlyField(`section22_2[${index}].awaitingTrialExplanation`)}
            />
          </label>
        </div>
      )}

      <button
        onClick={(event) => {
          event.preventDefault();
          onRemoveEntry(`${path}.section22_2`, index);
        }}
        disabled={isReadOnlyField(`section22_2[${index}]`)}
      >
        Remove Entry
      </button>
    </div>
  );

  return (
    <div className="space-y-4">
      <h2>Section 22.2</h2>
      {data.map((item, index) => renderEntry(item, index))}
      <button
        onClick={(event) => {
          event.preventDefault();
          onAddEntry(`${path}.section22_2`, getDefaultNewItem(`${path}.section22_2`));
        }}
      >
        Add Entry
      </button>
    </div>
  );
};

export { RenderSection22_2 };
