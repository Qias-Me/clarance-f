import type { CourtActionEntry } from "api/interfaces/sections2.0/section28";
import React, { useState, useEffect } from "react";
import { useSection28 } from "~/state/contexts/sections2.0/section28";
import { useSF86Form } from "~/state/contexts/SF86FormContext";

interface Section28ComponentProps {
  onValidationChange?: (isValid: boolean) => void;
  onNext?: () => void;
}

const Section28Component: React.FC<Section28ComponentProps> = ({
  onValidationChange,
  onNext
}) => {
  const {
    sectionData,
    updateHasCourtActions,
    addCourtAction,
    updateCourtAction,
    removeCourtAction,
    validateSection
  } = useSection28();

  // SF86 Form Context for data persistence
  const sf86Form = useSF86Form();

  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [isValid, setIsValid] = useState(false);

  // Validate section data and provide feedback
  useEffect(() => {
    const validationResult = validateSection();
    setIsValid(validationResult.isValid);

    // Convert ValidationError[] to Record<string, string>
    const errorRecord: Record<string, string> = {};
    if (validationResult.errors) {
      validationResult.errors.forEach(error => {
        errorRecord[error.field] = error.message;
      });
    }
    setValidationErrors(errorRecord);

    if (onValidationChange) {
      onValidationChange(validationResult.isValid);
    }
  }, [sectionData, validateSection, onValidationChange]);

  // Handle form submission with data persistence (following Section 1 gold standard pattern)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = validateSection();
    setIsValid(result.isValid);
    onValidationChange?.(result.isValid);

    if (result.isValid) {
      try {
        // Update the central form context with Section 28 data
        sf86Form.updateSectionData('section28', sectionData);

        // Save the form data to persistence layer
        await sf86Form.saveForm();

        console.log('✅ Section 28 data saved successfully:', sectionData);

        // Proceed to next section if callback provided
        if (onNext) {
          onNext();
        }
      } catch (error) {
        console.error('❌ Failed to save Section 28 data:', error);
      }
    }
  };

  // Handle court action type change
  const handleHasCourtActionsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value as "YES" | "NO (If NO, proceed to Section 29)";
    updateHasCourtActions(value);
  };

  // Handle adding a new court action entry
  const handleAddCourtAction = () => {
    addCourtAction();
  };

  // Handle updating a court action entry
  const handleCourtActionChange = (id: string, field: keyof CourtActionEntry, value: string) => {
    const courtAction = sectionData.section28.courtActionEntries.find(entry => entry._id.toString() === id);

    if (courtAction) {
      const updatedEntry = { ...courtAction };

      // Handle nested field updates
      if (field === 'courtName' || field === 'natureOfAction' || field === 'resultsDescription' || field === 'principalParties') {
        (updatedEntry[field] as any).value = value;
      } else if (field === 'actionDate') {
        updatedEntry.dateOfAction.date.value = value;
      } else if (field === 'partyType') {
        // Handle party type or other special fields
        (updatedEntry as any)[field] = value;
      }

      updateCourtAction(id, updatedEntry);
    }
  };

  // Handle court address field updates
  const handleCourtAddressChange = (id: string, addressField: string, value: string) => {
    const courtAction = sectionData.section28.courtActionEntries.find(entry => entry._id.toString() === id);

    if (courtAction) {
      const updatedEntry = { ...courtAction };
      (updatedEntry.courtAddress as any)[addressField].value = value;
      updateCourtAction(id, updatedEntry);
    }
  };

  // Handle removing a court action entry
  const handleRemoveCourtAction = (id: string) => {
    removeCourtAction(id);
  };

  return (
    <div className="bg-white shadow-md rounded-lg p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">
        Section 28: Involvement in Non-Criminal Court Actions
      </h2>

      <div className="mb-8 p-4 bg-blue-50 rounded-md">
        <p className="text-sm text-blue-800">
          In the last {" "}
          <span className="font-semibold">seven (7) years</span>, have you been a party to any
          public record civil court action not listed elsewhere on this form?
        </p>
      </div>

      <form onSubmit={handleSubmit}>

      {/* Court Actions Radio Selection */}
      <div className="mb-6">
        <div className="flex items-center space-x-6">
          <label className="inline-flex items-center">
            <input
              type="radio"
              name="hasCourtActions"
              value="YES"
              checked={sectionData.section28.hasCourtActions.value === "YES"}
              onChange={handleHasCourtActionsChange}
              className="form-radio h-5 w-5 text-blue-600"
            />
            <span className="ml-2 text-gray-700">Yes</span>
          </label>

          <label className="inline-flex items-center">
            <input
              type="radio"
              name="hasCourtActions"
              value="NO (If NO, proceed to Section 29)"
              checked={sectionData.section28.hasCourtActions.value === "NO (If NO, proceed to Section 29)"}
              onChange={handleHasCourtActionsChange}
              className="form-radio h-5 w-5 text-blue-600"
            />
            <span className="ml-2 text-gray-700">No</span>
          </label>
        </div>
        {validationErrors.hasCourtActions && (
          <p className="text-red-500 text-sm mt-1">{validationErrors.hasCourtActions}</p>
        )}
      </div>

      {/* Court Actions Details (conditional) */}
      {sectionData.section28.hasCourtActions.value === "YES" && (
        <div className="mt-6">
          <h3 className="text-lg font-medium text-gray-800 mb-4">
            Provide details about each civil action
          </h3>

          {sectionData.section28.courtActionEntries.length > 0 ? (
            <div className="space-y-8">
              {sectionData.section28.courtActionEntries.map((action, index) => (
                <div
                  key={action._id}
                  className="p-4 border border-gray-200 rounded-md bg-gray-50"
                >
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="text-md font-medium">Court Action #{index + 1}</h4>
                    <button
                      type="button"
                      onClick={() => handleRemoveCourtAction(action._id.toString())}
                      className="text-red-500 hover:text-red-700"
                    >
                      Remove
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Court Name */}
                    <div className="col-span-2 md:col-span-1">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Court Name
                      </label>
                      <input
                        type="text"
                        value={action.courtName.value}
                        onChange={(e) => handleCourtActionChange(action._id.toString(), "courtName", e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-md"
                      />
                      {validationErrors[`courtName-${action._id}`] && (
                        <p className="text-red-500 text-sm mt-1">
                          {validationErrors[`courtName-${action._id}`]}
                        </p>
                      )}
                    </div>

                    {/* Court Location */}
                    <div className="col-span-2 md:col-span-1">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Court Address - Street
                      </label>
                      <input
                        type="text"
                        value={action.courtAddress.street.value}
                        onChange={(e) => handleCourtAddressChange(action._id.toString(), "street", e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-md"
                      />
                      {validationErrors[`courtLocation-${action._id}`] && (
                        <p className="text-red-500 text-sm mt-1">
                          {validationErrors[`courtLocation-${action._id}`]}
                        </p>
                      )}
                    </div>

                    {/* Court City */}
                    <div className="col-span-2 md:col-span-1">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        City
                      </label>
                      <input
                        type="text"
                        value={action.courtAddress.city.value}
                        onChange={(e) => handleCourtAddressChange(action._id.toString(), "city", e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-md"
                      />
                    </div>

                    {/* Court Country */}
                    <div className="col-span-2 md:col-span-1">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Country
                      </label>
                      <input
                        type="text"
                        value={action.courtAddress.country.value}
                        onChange={(e) => handleCourtAddressChange(action._id.toString(), "country", e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-md"
                      />
                    </div>

                    {/* Action Date */}
                    <div className="col-span-2 md:col-span-1">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Date of Action (MM/YYYY)
                      </label>
                      <input
                        type="text"
                        placeholder="MM/YYYY"
                        value={action.dateOfAction.date.value}
                        onChange={(e) => handleCourtActionChange(action._id.toString(), "actionDate", e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-md"
                      />
                      {validationErrors[`actionDate-${action._id}`] && (
                        <p className="text-red-500 text-sm mt-1">
                          {validationErrors[`actionDate-${action._id}`]}
                        </p>
                      )}
                    </div>

                    {/* Principal Parties */}
                    <div className="col-span-2 md:col-span-1">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Principal Parties
                      </label>
                      <input
                        type="text"
                        value={action.principalParties.value}
                        onChange={(e) => handleCourtActionChange(action._id.toString(), "principalParties", e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-md"
                      />
                    </div>

                    {/* Nature of Action */}
                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nature of Action
                      </label>
                      <textarea
                        value={action.natureOfAction.value}
                        onChange={(e) => handleCourtActionChange(action._id.toString(), "natureOfAction", e.target.value)}
                        rows={2}
                        className="w-full p-2 border border-gray-300 rounded-md"
                      />
                      {validationErrors[`natureOfAction-${action._id}`] && (
                        <p className="text-red-500 text-sm mt-1">
                          {validationErrors[`natureOfAction-${action._id}`]}
                        </p>
                      )}
                    </div>

                    {/* Result of Action */}
                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Result of Action
                      </label>
                      <textarea
                        value={action.resultsDescription.value}
                        onChange={(e) => handleCourtActionChange(action._id.toString(), "resultsDescription", e.target.value)}
                        rows={2}
                        className="w-full p-2 border border-gray-300 rounded-md"
                      />
                      {validationErrors[`resultOfAction-${action._id}`] && (
                        <p className="text-red-500 text-sm mt-1">
                          {validationErrors[`resultOfAction-${action._id}`]}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 italic">No court actions added yet.</p>
          )}

          <button
            type="button"
            onClick={handleAddCourtAction}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
          >
            + Add Court Action
          </button>
        </div>
      )}

        {/* Submit Button */}
        <div className="mt-8 flex justify-between items-center">
          <button
            type="submit"
            disabled={!isValid}
            className={`px-6 py-3 rounded-md font-medium transition-colors ${
              isValid
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            Submit & Continue
          </button>

          {!isValid && (
            <span className="text-sm text-gray-500">
              Please complete all required fields to continue
            </span>
          )}
        </div>

        {/* Validation Status */}
        {Object.keys(validationErrors).length > 0 && (
          <div className="mt-6 p-3 bg-red-50 text-red-700 rounded-md">
            <p className="font-medium">Please correct the following errors:</p>
            <ul className="list-disc list-inside text-sm mt-2">
              {Object.values(validationErrors).map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </div>
        )}
      </form>
    </div>
  );
};

export default Section28Component;