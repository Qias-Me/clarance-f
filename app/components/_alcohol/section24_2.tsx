import React from "react";
import { Section24_2 } from "api_v2/interfaces/alcoholUse";

interface Section24_2Props {
  data: Section24_2[];
  onInputChange: (path: string, value: any) => void;
  onRemoveEntry: (path: string, index: number) => void;
  onAddEntry: (path: string, newItem: Section24_2) => void;
  path: string;
  isReadOnlyField: (fieldName: string) => boolean;
  getDefaultNewItem: (itemType: string) => any;
}

const RenderSection24_2: React.FC<Section24_2Props> = ({
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
        HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
      >
    ) => {
      const value =
        event.target.type === "checkbox"
          ? event.target.checked
          : event.target.value;
      onInputChange(`${path}.section24_2[${index}].${fieldPath}`, value);
    };

  const handleRadioChange =
    (index: number, fieldPath: string, value: boolean) => {
      onInputChange(`${path}.section24_2[${index}].${fieldPath}`, value);
    };

  const renderEntry = (item: Section24_2, index: number) => (
    <div key={index} className="space-y-4 p-4 border rounded-lg">
      <h3>Entry #{index + 1}</h3>
      <div>
        <label>Ordered By:</label>
        {item.orderedBy.map((orderedBy, idx) => (
          <div key={idx}>
            <label>
              <input
                type="radio"
                name={`orderedBy_${index}`}
                checked={orderedBy.type === "employer"}
                onChange={() =>
                  handleRadioChange(index, `orderedBy[${idx}].type`, "employer")
                }
                disabled={isReadOnlyField(
                  `${path}.section24_2[${index}].orderedBy[${idx}].type`
                )}
              />
              Employer
            </label>
            <label>
              <input
                type="radio"
                name={`orderedBy_${index}`}
                checked={orderedBy.type === "medicalProfessional"}
                onChange={() =>
                  handleRadioChange(
                    index,
                    `orderedBy[${idx}].type`,
                    "medicalProfessional"
                  )
                }
                disabled={isReadOnlyField(
                  `${path}.section24_2[${index}].orderedBy[${idx}].type`
                )}
              />
              Medical Professional
            </label>
            <label>
              <input
                type="radio"
                name={`orderedBy_${index}`}
                checked={orderedBy.type === "mentalHealthProfessional"}
                onChange={() =>
                  handleRadioChange(
                    index,
                    `orderedBy[${idx}].type`,
                    "mentalHealthProfessional"
                  )
                }
                disabled={isReadOnlyField(
                  `${path}.section24_2[${index}].orderedBy[${idx}].type`
                )}
              />
              Mental Health Professional
            </label>
            <label>
              <input
                type="radio"
                name={`orderedBy_${index}`}
                checked={orderedBy.type === "courtOfficial"}
                onChange={() =>
                  handleRadioChange(
                    index,
                    `orderedBy[${idx}].type`,
                    "courtOfficial"
                  )
                }
                disabled={isReadOnlyField(
                  `${path}.section24_2[${index}].orderedBy[${idx}].type`
                )}
              />
              Court Official
            </label>
            <label>
              <input
                type="radio"
                name={`orderedBy_${index}`}
                checked={orderedBy.type === "other"}
                onChange={() =>
                  handleRadioChange(index, `orderedBy[${idx}].type`, "other")
                }
                disabled={isReadOnlyField(
                  `${path}.section24_2[${index}].orderedBy[${idx}].type`
                )}
              />
              Other
            </label>
            {orderedBy.type === "other" && (
              <div>
                <label htmlFor={`otherExplanation_${index}_${idx}`}>Other Explanation:</label>
                <textarea
                  id={`otherExplanation_${index}_${idx}`}
                  value={orderedBy.otherExplanation}
                  onChange={handleInputChange(
                    index,
                    `orderedBy[${idx}].otherExplanation`
                  )}
                  disabled={isReadOnlyField(
                    `${path}.section24_2[${index}].orderedBy[${idx}].otherExplanation`
                  )}
                />
              </div>
            )}
          </div>
        ))}
      </div>
      <div>
        <label htmlFor={`actionTaken_${index}`}>Action Taken:</label>
        <input
          id={`actionTaken_${index}`}
          type="checkbox"
          checked={item.actionTaken}
          onChange={handleInputChange(index, "actionTaken")}
          disabled={isReadOnlyField(`${path}.section24_2[${index}].actionTaken`)}
        />
      </div>
      {!item.actionTaken && (
        <div>
          <label htmlFor={`noActionExplanation_${index}`}>No Action Explanation:</label>
          <textarea
            id={`noActionExplanation_${index}`}
            value={item.noActionExplanation}
            onChange={handleInputChange(index, "noActionExplanation")}
            disabled={isReadOnlyField(
              `${path}.section24_2[${index}].noActionExplanation`
            )}
          />
        </div>
      )}
      {item.actionTaken && (
        <div>
          <label htmlFor={`providerName_${index}`}>Provider Name:</label>
          <input
            id={`providerName_${index}`}
            type="text"
            value={item.actionDetails.providerName}
            onChange={handleInputChange(
              index,
              "actionDetails.providerName"
            )}
            disabled={isReadOnlyField(
              `${path}.section24_2[${index}].actionDetails.providerName`
            )}
          />
          <div>
            <label htmlFor={`providerPhone_${index}`}>Provider Phone:</label>
            <input
              id={`providerPhone_${index}`}
              type="text"
              value={item.actionDetails.providerPhone}
              onChange={handleInputChange(
                index,
                "actionDetails.providerPhone"
              )}
              disabled={isReadOnlyField(
                `${path}.section24_2[${index}].actionDetails.providerPhone`
              )}
            />
          </div>
          <div>
            <label htmlFor={`phoneExtension_${index}`}>Phone Extension:</label>
            <input
              id={`phoneExtension_${index}`}
              type="text"
              value={item.actionDetails.phoneExtension}
              onChange={handleInputChange(
                index,
                "actionDetails.phoneExtension"
              )}
              disabled={isReadOnlyField(
                `${path}.section24_2[${index}].actionDetails.phoneExtension`
              )}
            />
          </div>
          <div>
            <label>
              <input
                type="checkbox"
                checked={item.actionDetails.internationalPhone}
                onChange={handleInputChange(
                  index,
                  "actionDetails.internationalPhone"
                )}
                disabled={isReadOnlyField(
                  `${path}.section24_2[${index}].actionDetails.internationalPhone`
                )}
              />
              International Phone
            </label>
            <label>
              <input
                type="radio"
                name={`phoneDayNight_${index}`}
                checked={item.actionDetails.phoneDayNight === 'Day'}
                onChange={() =>
                  handleRadioChange(
                    index,
                    "actionDetails.phoneDayNight",
                    'Day'
                  )
                }
                disabled={isReadOnlyField(
                  `${path}.section24_2[${index}].actionDetails.phoneDayNight`
                )}
              />
              Day
            </label>
            <label>
              <input
                type="radio"
                name={`phoneDayNight_${index}`}
                checked={item.actionDetails.phoneDayNight === 'Night'}
                onChange={() =>
                  handleRadioChange(
                    index,
                    "actionDetails.phoneDayNight",
                    'Night'
                  )
                }
                disabled={isReadOnlyField(
                  `${path}.section24_2[${index}].actionDetails.phoneDayNight`
                )}
              />
              Night
            </label>
          </div>
          <div>
            <label htmlFor={`completionExplanation_${index}`}>Completion Explanation:</label>
            <textarea
              id={`completionExplanation_${index}`}
              value={item.actionDetails.completionExplanation}
              onChange={handleInputChange(
                index,
                "actionDetails.completionExplanation"
              )}
              disabled={isReadOnlyField(
                `${path}.section24_2[${index}].actionDetails.completionExplanation`
              )}
            />
          </div>
        </div>
      )}
      <div>
        <label htmlFor={`providerAddress_${index}`}>Provider Address:</label>
        <input
          id={`providerAddress_street_${index}`}
          type="text"
          placeholder="Street"
          value={item.actionDetails.providerAddress.street}
          onChange={handleInputChange(
            index,
            "actionDetails.providerAddress.street"
          )}
          disabled={isReadOnlyField(
            `${path}.section24_2[${index}].actionDetails.providerAddress.street`
          )}
        />
        <input
          id={`providerAddress_city_${index}`}
          type="text"
          placeholder="City"
          value={item.actionDetails.providerAddress.city}
          onChange={handleInputChange(
            index,
            "actionDetails.providerAddress.city"
          )}
          disabled={isReadOnlyField(
            `${path}.section24_2[${index}].actionDetails.providerAddress.city`
          )}
        />
        <input
          id={`providerAddress_state_${index}`}
          type="text"
          placeholder="State"
          value={item.actionDetails.providerAddress.state}
          onChange={handleInputChange(
            index,
            "actionDetails.providerAddress.state"
          )}
          disabled={isReadOnlyField(
            `${path}.section24_2[${index}].actionDetails.providerAddress.state`
          )}
        />
        <input
          id={`providerAddress_zipCode_${index}`}
          type="text"
          placeholder="Zip Code"
          value={item.actionDetails.providerAddress.zipCode}
          onChange={handleInputChange(
            index,
            "actionDetails.providerAddress.zipCode"
          )}
          disabled={isReadOnlyField(
            `${path}.section24_2[${index}].actionDetails.providerAddress.zipCode`
          )}
        />
        <input
          id={`providerAddress_country_${index}`}
          type="text"
          placeholder="Country"
          value={item.actionDetails.providerAddress.country}
          onChange={handleInputChange(
            index,
            "actionDetails.providerAddress.country"
          )}
          disabled={isReadOnlyField(
            `${path}.section24_2[${index}].actionDetails.providerAddress.country`
          )}
        />
      </div>
      <button
        onClick={(event) => {
          event.preventDefault();
          onRemoveEntry(`${path}.section24_2`, index);
        }}
        disabled={isReadOnlyField(`${path}.section24_2[${index}]`)}
      >
        Remove Entry
      </button>
    </div>
  );

  return (
    <div className="space-y-4">
      <h2>Section 24.2</h2>
      {data.map((item, index) => renderEntry(item, index))}
      <button
        onClick={(event) => {
          event.preventDefault();
          onAddEntry(
            `${path}.section24_2`,
            getDefaultNewItem(`${path}.section24_2`)
          );
        }}
      >
        Add Entry
      </button>
    </div>
  );
};

export { RenderSection24_2 };
