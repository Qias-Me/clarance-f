import { Section20C } from "api_v2/interfaces/foreignActivities";
import React from "react";

interface Section20CProps {
  data: Section20C[];
  onInputChange: (path: string, value: any) => void;
  onRemoveEntry: (path: string, index: number) => void;
  onAddEntry: (path: string, newItem: Section20C) => void;
  path: string;
  isReadOnlyField: (fieldName: string) => boolean;
  getDefaultNewItem: (itemType: string) => Section20C;
}

const RenderSection20C: React.FC<Section20CProps> = ({
  data,
  onInputChange,
  onRemoveEntry,
  onAddEntry,
  path,
  isReadOnlyField,
  getDefaultNewItem,
}) => {
  const handleInputChange =
    (index: number, fieldPath: string) =>
    (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      onInputChange(
        `${path}.section20C[${index}].${fieldPath}`,
        event.target.value
      );
    };

  const handleCheckboxChange =
    (index: number, fieldPath: string) =>
    (event: React.ChangeEvent<HTMLInputElement>) => {
      onInputChange(
        `${path}.section20C[${index}].${fieldPath}`,
        event.target.checked
      );
    };

  const handleTypeCheckboxChange = (
    index: number,
    type: any,
    field: string
  ) => {
    const entry = data[index];
    const specifyArray = initializeSpecify(entry[field]);

    // Check if the type is already selected
    const isSelected = specifyArray.some(
      (spec) =>
        spec.type === type || spec.option === type || spec.reason === type
    );

    // Update specify array based on whether type was already selected
    const updatedSpecify = isSelected
      ? specifyArray.filter(
          (spec) =>
            spec.type !== type && spec.option !== type && spec.reason !== type
        )
      : [
          ...specifyArray,
          { _id: new Date().getTime(), type, option: type, reason: type },
        ];

    // Update the entry specify field in your data state
    onInputChange(`${path}.section20C[${index}].${field}`, updatedSpecify);
  };

  // Ensure all entries have a valid specify array when component renders
  const initializeSpecify = (specify: any[]) =>
    Array.isArray(specify) ? specify : [];

  return (
    <div className="space-y-4">
      {data.map((item, index) => {
        const specifyDayzArray = initializeSpecify(item.numberOfDays);
        const specifyPurposeArray = initializeSpecify(item.purposeOfTravel);

        return (
          <div key={index} className="border p-4 space-y-2">
            <button
              type="button"
              onClick={() => onRemoveEntry(`${path}.section20C`, index)}
            >
              Remove Entry
            </button>
            <div>
              <label htmlFor={`${path}.section20C[${index}].id_`}>ID:</label>
              <input
                id={`${path}.section20C[${index}].id_`}
                type="number"
                value={item.id_}
                onChange={handleInputChange(index, "id_")}
                readOnly={isReadOnlyField("id_")}
              />
            </div>
            <div>
              <label htmlFor={`${path}.section20C[${index}].countryVisited`}>
                Country Visited:
              </label>
              <input
                id={`${path}.section20C[${index}].countryVisited`}
                type="text"
                value={item.countryVisited}
                onChange={handleInputChange(index, "countryVisited")}
                readOnly={isReadOnlyField("countryVisited")}
              />
            </div>
            <div>
              <label
                htmlFor={`${path}.section20C[${index}].travelDates.fromDate.date`}
              >
                Travel Dates From:
              </label>
              <input
                id={`${path}.section20C[${index}].travelDates.fromDate.date`}
                type="text"
                value={item.travelDates.fromDate.date}
                onChange={handleInputChange(index, "travelDates.fromDate.date")}
                readOnly={isReadOnlyField("travelDates.fromDate.date")}
              />
              <label
                htmlFor={`${path}.section20C[${index}].travelDates.fromDate.estimated`}
              >
                Estimated:
              </label>
              <input
                id={`${path}.section20C[${index}].travelDates.fromDate.estimated`}
                type="checkbox"
                checked={item.travelDates.fromDate.estimated}
                onChange={(e) =>
                  handleCheckboxChange(
                    index,
                    "travelDates.fromDate.estimated"
                  )(e as any)
                }
                readOnly={isReadOnlyField("travelDates.fromDate.estimated")}
              />
            </div>
            <div>
              <label
                htmlFor={`${path}.section20C[${index}].travelDates.toDate.date`}
              >
                Travel Dates To:
              </label>
              <input
                id={`${path}.section20C[${index}].travelDates.toDate.date`}
                type="text"
                value={item.travelDates.toDate.date}
                onChange={handleInputChange(index, "travelDates.toDate.date")}
                readOnly={isReadOnlyField("travelDates.toDate.date")}
              />
              <label
                htmlFor={`${path}.section20C[${index}].travelDates.toDate.estimated`}
              >
                Estimated:
              </label>
              <input
                id={`${path}.section20C[${index}].travelDates.toDate.estimated`}
                type="checkbox"
                checked={item.travelDates.toDate.estimated}
                onChange={(e) =>
                  handleCheckboxChange(
                    index,
                    "travelDates.toDate.estimated"
                  )(e as any)
                }
                readOnly={isReadOnlyField("travelDates.toDate.estimated")}
              />
            </div>
            <div>
              <label
                htmlFor={`${path}.section20C[${index}].travelDates.present`}
              >
                Present:
              </label>
              <input
                id={`${path}.section20C[${index}].travelDates.present`}
                type="checkbox"
                checked={item.travelDates.present}
                onChange={(e) =>
                  handleCheckboxChange(index, "travelDates.present")(e as any)
                }
                readOnly={isReadOnlyField("travelDates.present")}
              />
            </div>

            <div>
              <label htmlFor={`${path}.section20C[${index}].numberOfDays`}>
                Number of Days:
              </label>
              {[
                "1-5",
                "6-10",
                "11-20",
                "21-30",
                "More than 30",
                "Many short trips",
              ].map((day, dayIndex) => (
                <div key={dayIndex}>
                  <input
                    type="checkbox"
                    id={`specify_${index}_${day}`}
                    name={`specify_${index}_${day}`}
                    value={day}
                    checked={specifyDayzArray.some(
                      (spec) => spec.option === day
                    )}
                    onChange={() =>
                      handleTypeCheckboxChange(index, day, "numberOfDays")
                    }
                    disabled={isReadOnlyField(
                      `${path}.section20C[${index}].numberOfDays`
                    )}
                  />
                  <label htmlFor={`specify_${index}_${day}`}>{day}</label>
                </div>
              ))}
            </div>
            <div>
              <label htmlFor={`${path}.section20C[${index}].purposeOfTravel`}>
                Purpose of Travel:
              </label>
              {[
                "Visit family or friends",
                "Trade shows, conferences, and seminars",
                "Education Tourism",
                "Volunteer activities",
                "Business/Professional conference",
                "Other",
              ].map((purposeType, purposeIndex) => (
                <div key={purposeIndex}>
                  <input
                    type="checkbox"
                    id={`specify_${index}_${purposeType}`}
                    name={`specify_${index}_${purposeType}`}
                    value={purposeType}
                    checked={specifyPurposeArray.some(
                      (spec) => spec.reason === purposeType
                    )}
                    onChange={() =>
                      handleTypeCheckboxChange(
                        index,
                        purposeType,
                        "purposeOfTravel"
                      )
                    }
                    disabled={isReadOnlyField(
                      `${path}.section20C[${index}].purposeOfTravel`
                    )}
                  />
                  <label htmlFor={`specify_${index}_${purposeType}`}>
                    {purposeType}
                  </label>
                </div>
              ))}
            </div>

            <div>
              <label
                htmlFor={`${path}.section20C[${index}].questionedOrSearched`}
              >
                Questioned or Searched:
              </label>
              <input
                id={`${path}.section20C[${index}].questionedOrSearched`}
                type="checkbox"
                checked={item.questionedOrSearched}
                onChange={(e) =>
                  handleCheckboxChange(index, "questionedOrSearched")(e as any)
                }
                readOnly={isReadOnlyField("questionedOrSearched")}
              />
              {item.questionedOrSearched && (
                <div>
                  <label
                    htmlFor={`${path}.section20C[${index}].questionedOrSearchedExplanation`}
                  >
                    Explanation:
                  </label>
                  <input
                    id={`${path}.section20C[${index}].questionedOrSearchedExplanation`}
                    type="text"
                    value={item.questionedOrSearchedExplanation}
                    onChange={handleInputChange(
                      index,
                      "questionedOrSearchedExplanation"
                    )}
                    readOnly={isReadOnlyField(
                      "questionedOrSearchedExplanation"
                    )}
                  />
                </div>
              )}
            </div>
            <div>
              <label
                htmlFor={`${path}.section20C[${index}].encounterWithPolice`}
              >
                Encounter with Police:
              </label>
              <input
                id={`${path}.section20C[${index}].encounterWithPolice`}
                type="checkbox"
                checked={item.encounterWithPolice}
                onChange={(e) =>
                  handleCheckboxChange(index, "encounterWithPolice")(e as any)
                }
                readOnly={isReadOnlyField("encounterWithPolice")}
              />
              {item.encounterWithPolice && (
                <div>
                  <label
                    htmlFor={`${path}.section20C[${index}].encounterWithPoliceExplanation`}
                  >
                    Explanation:
                  </label>
                  <input
                    id={`${path}.section20C[${index}].encounterWithPoliceExplanation`}
                    type="text"
                    value={item.encounterWithPoliceExplanation}
                    onChange={handleInputChange(
                      index,
                      "encounterWithPoliceExplanation"
                    )}
                    readOnly={isReadOnlyField("encounterWithPoliceExplanation")}
                  />
                </div>
              )}
            </div>
            <div>
              <label
                htmlFor={`${path}.section20C[${index}].contactWithForeignIntelligence`}
              >
                Contact with Foreign Intelligence:
              </label>
              <input
                id={`${path}.section20C[${index}].contactWithForeignIntelligence`}
                type="checkbox"
                checked={item.contactWithForeignIntelligence}
                onChange={(e) =>
                  handleCheckboxChange(
                    index,
                    "contactWithForeignIntelligence"
                  )(e as any)
                }
                readOnly={isReadOnlyField("contactWithForeignIntelligence")}
              />
              {item.contactWithForeignIntelligence && (
                <div>
                  <label
                    htmlFor={`${path}.section20C[${index}].contactWithForeignIntelligenceExplanation`}
                  >
                    Explanation:
                  </label>
                  <input
                    id={`${path}.section20C[${index}].contactWithForeignIntelligenceExplanation`}
                    type="text"
                    value={item.contactWithForeignIntelligenceExplanation}
                    onChange={handleInputChange(
                      index,
                      "contactWithForeignIntelligenceExplanation"
                    )}
                    readOnly={isReadOnlyField(
                      "contactWithForeignIntelligenceExplanation"
                    )}
                  />
                </div>
              )}
            </div>
            <div>
              <label
                htmlFor={`${path}.section20C[${index}].counterintelligenceIssues`}
              >
                Counterintelligence Issues:
              </label>
              <input
                id={`${path}.section20C[${index}].counterintelligenceIssues`}
                type="checkbox"
                checked={item.counterintelligenceIssues}
                onChange={(e) =>
                  handleCheckboxChange(
                    index,
                    "counterintelligenceIssues"
                  )(e as any)
                }
                readOnly={isReadOnlyField("counterintelligenceIssues")}
              />
              {item.counterintelligenceIssues && (
                <div>
                  <label
                    htmlFor={`${path}.section20C[${index}].counterintelligenceIssuesExplanation`}
                  >
                    Explanation:
                  </label>
                  <input
                    id={`${path}.section20C[${index}].counterintelligenceIssuesExplanation`}
                    type="text"
                    value={item.counterintelligenceIssuesExplanation}
                    onChange={handleInputChange(
                      index,
                      "counterintelligenceIssuesExplanation"
                    )}
                    readOnly={isReadOnlyField(
                      "counterintelligenceIssuesExplanation"
                    )}
                  />
                </div>
              )}
            </div>
            <div>
              <label
                htmlFor={`${path}.section20C[${index}].contactExhibitingInterest`}
              >
                Contact Exhibiting Interest:
              </label>
              <input
                id={`${path}.section20C[${index}].contactExhibitingInterest`}
                type="checkbox"
                checked={item.contactExhibitingInterest}
                onChange={(e) =>
                  handleCheckboxChange(
                    index,
                    "contactExhibitingInterest"
                  )(e as any)
                }
                readOnly={isReadOnlyField("contactExhibitingInterest")}
              />
              {item.contactExhibitingInterest && (
                <div>
                  <label
                    htmlFor={`${path}.section20C[${index}].contactExhibitingInterestExplanation`}
                  >
                    Explanation:
                  </label>
                  <input
                    id={`${path}.section20C[${index}].contactExhibitingInterestExplanation`}
                    type="text"
                    value={item.contactExhibitingInterestExplanation}
                    onChange={handleInputChange(
                      index,
                      "contactExhibitingInterestExplanation"
                    )}
                    readOnly={isReadOnlyField(
                      "contactExhibitingInterestExplanation"
                    )}
                  />
                </div>
              )}
            </div>
            <div>
              <label
                htmlFor={`${path}.section20C[${index}].contactAttemptingToObtainInfo`}
              >
                Contact Attempting to Obtain Info:
              </label>
              <input
                id={`${path}.section20C[${index}].contactAttemptingToObtainInfo`}
                type="checkbox"
                checked={item.contactAttemptingToObtainInfo}
                onChange={(e) =>
                  handleCheckboxChange(
                    index,
                    "contactAttemptingToObtainInfo"
                  )(e as any)
                }
                readOnly={isReadOnlyField("contactAttemptingToObtainInfo")}
              />
              {item.contactAttemptingToObtainInfo && (
                <div>
                  <label
                    htmlFor={`${path}.section20C[${index}].contactAttemptingToObtainInfoExplanation`}
                  >
                    Explanation:
                  </label>
                  <input
                    id={`${path}.section20C[${index}].contactAttemptingToObtainInfoExplanation`}
                    type="text"
                    value={item.contactAttemptingToObtainInfoExplanation}
                    onChange={handleInputChange(
                      index,
                      "contactAttemptingToObtainInfoExplanation"
                    )}
                    readOnly={isReadOnlyField(
                      "contactAttemptingToObtainInfoExplanation"
                    )}
                  />
                </div>
              )}
            </div>
            <div>
              <label
                htmlFor={`${path}.section20C[${index}].threatenedOrCoerced`}
              >
                Threatened or Coerced:
              </label>
              <input
                id={`${path}.section20C[${index}].threatenedOrCoerced`}
                type="checkbox"
                checked={item.threatenedOrCoerced}
                onChange={(e) =>
                  handleCheckboxChange(index, "threatenedOrCoerced")(e as any)
                }
                readOnly={isReadOnlyField("threatenedOrCoerced")}
              />
              {item.threatenedOrCoerced && (
                <div>
                  <label
                    htmlFor={`${path}.section20C[${index}].threatenedOrCoercedExplanation`}
                  >
                    Explanation:
                  </label>
                  <input
                    id={`${path}.section20C[${index}].threatenedOrCoercedExplanation`}
                    type="text"
                    value={item.threatenedOrCoercedExplanation}
                    onChange={handleInputChange(
                      index,
                      "threatenedOrCoercedExplanation"
                    )}
                    readOnly={isReadOnlyField("threatenedOrCoercedExplanation")}
                  />
                </div>
              )}
            </div>
          </div>
        );
      })}
      <button
        onClick={(event) => {
          event.preventDefault();
          onAddEntry(
            `${path}.section20C`,
            getDefaultNewItem(`${path}.section20C`)
          );
        }}
      >
        Add Entry
      </button>
    </div>
  );
};

export { RenderSection20C };
