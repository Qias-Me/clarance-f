import React, { useCallback, memo, useEffect } from "react";
import { type FormInfo } from "api/interfaces/FormInfo";
import { type SchoolInfo } from "api/interfaces/sections/schoolInfo";
import { StateOptions, CountryOptions } from "api/enums/enums";

interface FormProps {
  data: SchoolInfo;
  onInputChange: (path: string, value: any) => void;
  onAddEntry: (path: string, newItem: any) => void;
  onRemoveEntry: (path: string, index: number) => void;
  isValidValue: (path: string, value: any) => boolean;
  getDefaultNewItem: (itemType: string) => any;
  isReadOnlyField: (fieldName: string) => boolean;
  path: string;
  formInfo: FormInfo;
  actionType?: string;
}

const RenderSchoolInfo: React.FC<FormProps> = ({
  data,
  onInputChange,
  onAddEntry,
  onRemoveEntry,
  isValidValue,
  getDefaultNewItem,
  isReadOnlyField,
  path,
  formInfo,
}) => {
  const schoolInfo = data;

  // Initialize schoolEntry array when either question is answered YES
  useEffect(() => {
    const hasAttendedSchool = schoolInfo.hasAttendedSchool?.value === "YES";
    const hasReceivedDegree = schoolInfo.hasReceivedDegree?.value === "YES";
    
    // If either question is YES but we don't have schoolEntry array
    if ((hasAttendedSchool || hasReceivedDegree) && (!schoolInfo.schoolEntry || !Array.isArray(schoolInfo.schoolEntry) || schoolInfo.schoolEntry.length === 0)) {
      console.log("Initializing schoolEntry array because one of the questions is YES");
      
      // Create first entry
      const newSchoolEntry = getDefaultNewItem("schoolInfo.schoolEntry");
      newSchoolEntry._id = 1;
      
      // Ensure degrees array is initialized
      if (!newSchoolEntry.degrees) {
        newSchoolEntry.degrees = [];
      }
      
      // Ensure phoneNumber structure is fully initialized
      if (!newSchoolEntry.knownPerson) {
        newSchoolEntry.knownPerson = {};
      }
      
      if (!newSchoolEntry.knownPerson.phoneNumber) {
        newSchoolEntry.knownPerson.phoneNumber = { _id: Date.now() };
      }
      
      if (!newSchoolEntry.knownPerson.phoneNumber.number) {
        newSchoolEntry.knownPerson.phoneNumber.number = { value: "" };
      }
      
      if (!newSchoolEntry.knownPerson.phoneNumber.extension) {
        newSchoolEntry.knownPerson.phoneNumber.extension = { value: "" };
      }
      
      // Initialize other required phoneNumber properties
      if (!newSchoolEntry.knownPerson.phoneNumber.dontKnowNumber) {
        newSchoolEntry.knownPerson.phoneNumber.dontKnowNumber = { value: "No" };
      }
      
      if (!newSchoolEntry.knownPerson.phoneNumber.isInternationalOrDSN) {
        newSchoolEntry.knownPerson.phoneNumber.isInternationalOrDSN = { value: "No" };
      }
      
      if (!newSchoolEntry.knownPerson.phoneNumber.day) {
        newSchoolEntry.knownPerson.phoneNumber.day = { value: "No" };
      }
      
      if (!newSchoolEntry.knownPerson.phoneNumber.night) {
        newSchoolEntry.knownPerson.phoneNumber.night = { value: "No" };
      }
      
      // Initialize email properties
      if (!newSchoolEntry.knownPerson.email) {
        newSchoolEntry.knownPerson.email = { value: "" };
      }
      
      if (!newSchoolEntry.knownPerson.dontKnowEmail) {
        newSchoolEntry.knownPerson.dontKnowEmail = { value: "No" };
      }
      
      // Initialize the schoolEntry array with the first entry
      onInputChange(`${path}.schoolEntry`, [newSchoolEntry]);
    }
  }, [schoolInfo.hasAttendedSchool?.value, schoolInfo.hasReceivedDegree?.value]);

  // Handle the radio button changes to make sure state updates correctly
  const handleHasAttendedSchoolChange = (value: "YES" | "NO") => {
    console.log("Changing hasAttendedSchool to:", value);
    onInputChange(`${path}.hasAttendedSchool.value`, value);
    
    // If changing to NO and the other question is also NO, clear the schoolEntry array
    if (value === "NO" && schoolInfo.hasReceivedDegree?.value !== "YES") {
      console.log("Both questions are NO, clearing schoolEntry array");
      onInputChange(`${path}.schoolEntry`, []);
    }
  };

  const handleHasReceivedDegreeChange = (value: "YES" | "NO (If NO to 12(a) and 12(b), proceed to Section 13A)") => {
    console.log("Changing hasReceivedDegree to:", value);
    onInputChange(`${path}.hasReceivedDegree.value`, value);
    
    // If changing to NO and the other question is also NO, clear the schoolEntry array
    if (value === "NO (If NO to 12(a) and 12(b), proceed to Section 13A)" && schoolInfo.hasAttendedSchool?.value !== "YES") {
      console.log("Both questions are NO, clearing schoolEntry array");
      onInputChange(`${path}.schoolEntry`, []);
    }
  };

  // Handle add degree entry
  const handleAddDegree = useCallback((schoolIndex: number) => {
    // Get a new degree with a unique ID
    const newDegree = getDefaultNewItem("schoolInfo.schoolEntry.degrees");
    
    // Generate a unique ID for the new degree
    const existingDegrees = Array.isArray(schoolInfo.schoolEntry?.[schoolIndex]?.degrees) 
      ? schoolInfo.schoolEntry[schoolIndex].degrees 
      : [];
    
    // Initialize with a safe default if empty array or no degrees
    const degreesIds = existingDegrees.map(d => d._id || 0);
    const maxId = degreesIds.length > 0 ? Math.max(...degreesIds) : 0;
    newDegree._id = maxId + 1;
    
    // Ensure all Degree interface properties are properly initialized
    if (!newDegree.type) {
      newDegree.type = { value: "" };
    }
    
    if (!newDegree.dateAwarded) {
      newDegree.dateAwarded = { value: "" };
    }
    
    if (!newDegree.est) {
      newDegree.est = { value: "No" };
    }
    
    if (!newDegree.otherDegree) {
      newDegree.otherDegree = { value: "" };
    }
    
    console.log("Adding degree:", newDegree);
    onAddEntry(`${path}.schoolEntry[${schoolIndex}].degrees`, newDegree);
  }, [getDefaultNewItem, onAddEntry, path, schoolInfo.schoolEntry]);

  // Handle add school entry
  const handleAddSchoolEntry = useCallback(() => {
    // Get a new school entry with a unique ID
    const newSchoolEntry = getDefaultNewItem("schoolInfo.schoolEntry");
    
    // Generate a unique ID for the new school entry
    // Safely handle when schoolEntry is not an array
    const existingEntries = Array.isArray(schoolInfo.schoolEntry) ? schoolInfo.schoolEntry : [];
    
    // Initialize with a safe default if empty array
    const entryIds = existingEntries.map(e => e._id || 0);
    const maxId = entryIds.length > 0 ? Math.max(...entryIds) : 0;
    newSchoolEntry._id = maxId + 1;
    
    // Ensure degrees array is initialized
    if (!newSchoolEntry.degrees) {
      newSchoolEntry.degrees = [];
    }
    
    // Ensure phoneNumber structure is fully initialized
    if (!newSchoolEntry.knownPerson) {
      newSchoolEntry.knownPerson = {};
    }
    
    if (!newSchoolEntry.knownPerson.phoneNumber) {
      newSchoolEntry.knownPerson.phoneNumber = { _id: Date.now() };
    }
    
    if (!newSchoolEntry.knownPerson.phoneNumber.number) {
      newSchoolEntry.knownPerson.phoneNumber.number = { value: "" };
    }
    
    if (!newSchoolEntry.knownPerson.phoneNumber.extension) {
      newSchoolEntry.knownPerson.phoneNumber.extension = { value: "" };
    }
    
    // Initialize other required phoneNumber properties
    if (!newSchoolEntry.knownPerson.phoneNumber.dontKnowNumber) {
      newSchoolEntry.knownPerson.phoneNumber.dontKnowNumber = { value: "No" };
    }
    
    if (!newSchoolEntry.knownPerson.phoneNumber.isInternationalOrDSN) {
      newSchoolEntry.knownPerson.phoneNumber.isInternationalOrDSN = { value: "No" };
    }
    
    if (!newSchoolEntry.knownPerson.phoneNumber.day) {
      newSchoolEntry.knownPerson.phoneNumber.day = { value: "No" };
    }
    
    if (!newSchoolEntry.knownPerson.phoneNumber.night) {
      newSchoolEntry.knownPerson.phoneNumber.night = { value: "No" };
    }
    
    // Initialize email properties
    if (!newSchoolEntry.knownPerson.email) {
      newSchoolEntry.knownPerson.email = { value: "" };
    }
    
    if (!newSchoolEntry.knownPerson.dontKnowEmail) {
      newSchoolEntry.knownPerson.dontKnowEmail = { value: "No" };
    }
    
    console.log("Adding school entry:", newSchoolEntry);
    onAddEntry(`${path}.schoolEntry`, newSchoolEntry);
  }, [getDefaultNewItem, onAddEntry, path, schoolInfo.schoolEntry]);

  // Handle remove school entry without confirmation
  const handleRemoveSchoolEntry = useCallback((index: number) => {
    console.log("Removing school entry at index:", index);
    onRemoveEntry(`${path}.schoolEntry`, index);
  }, [onRemoveEntry, path]);

  // Handle remove degree without confirmation
  const handleRemoveDegree = useCallback((schoolIndex: number, degreeIndex: number) => {
    console.log("Removing degree at index:", degreeIndex, "from school at index:", schoolIndex);
    onRemoveEntry(`${path}.schoolEntry[${schoolIndex}].degrees`, degreeIndex);
  }, [onRemoveEntry, path]);

  // Debug output to track the state
  useEffect(() => {
    console.log("Current state:", {
      hasAttendedSchool: schoolInfo.hasAttendedSchool?.value,
      hasReceivedDegree: schoolInfo.hasReceivedDegree?.value,
      schoolEntryLength: Array.isArray(schoolInfo.schoolEntry) ? schoolInfo.schoolEntry.length : 0,
      showSchoolEntries: (schoolInfo.hasAttendedSchool?.value === "YES" || schoolInfo.hasReceivedDegree?.value === "YES")
    });
  }, [schoolInfo.hasAttendedSchool?.value, schoolInfo.hasReceivedDegree?.value, schoolInfo.schoolEntry]);

  // Calculate if school entries should be shown
  const showSchoolEntries = (schoolInfo.hasAttendedSchool?.value === "YES" || schoolInfo.hasReceivedDegree?.value === "YES");

  return (
    <div className="p-4 bg-gray-50 rounded-lg shadow space-y-4">
      <h3 className="text-lg font-semibold mb-4">
        SECTION 12 - Where You Went to School
      </h3>

      {/* Main Questions */}
      <div className="mb-6 p-4 bg-white rounded-md shadow-sm">
        <div className="flex flex-col mb-4">
          <label htmlFor="hasAttendedSchool" className="font-medium text-gray-700 mb-2">
          Have you attended any schools in the last 10 years?
        </label>
          <div className="flex items-center space-x-4">
            <label className="inline-flex items-center">
          <input
            type="radio"
            name="hasAttendedSchool"
                checked={schoolInfo.hasAttendedSchool?.value === "YES"}
                onChange={() => handleHasAttendedSchoolChange("YES")}
                className="mr-2"
              />
              <span>Yes</span>
          </label>
            <label className="inline-flex items-center">
          <input
            type="radio"
            name="hasAttendedSchool"
                checked={schoolInfo.hasAttendedSchool?.value === "NO"}
                onChange={() => handleHasAttendedSchoolChange("NO")}
                className="mr-2"
              />
              <span>No</span>
          </label>
        </div>
      </div>

        <div className="flex flex-col mb-2">
          <label htmlFor="hasReceivedDegree" className="font-medium text-gray-700 mb-2">
          Have you received a degree or diploma more than 10 years ago?
        </label>
          <div className="flex items-center space-x-4">
            <label className="inline-flex items-center">
          <input
            type="radio"
            name="hasReceivedDegree"
                checked={schoolInfo.hasReceivedDegree?.value === "YES"}
                onChange={() => handleHasReceivedDegreeChange("YES")}
                className="mr-2"
              />
              <span>Yes</span>
          </label>
            <label className="inline-flex items-center">
          <input
            type="radio"
            name="hasReceivedDegree"
                checked={schoolInfo.hasReceivedDegree?.value === "NO (If NO to 12(a) and 12(b), proceed to Section 13A)"}
                onChange={() => handleHasReceivedDegreeChange("NO (If NO to 12(a) and 12(b), proceed to Section 13A)")}
                className="mr-2"
              />
              <span>No</span>
          </label>
          </div>
          <p className="mt-1 text-sm text-gray-500">(If NO to both questions, proceed to Section 13A)</p>
        </div>
      </div>

      {/* School Entries - Only show if either question is YES */}
      {showSchoolEntries && schoolInfo.schoolEntry && Array.isArray(schoolInfo.schoolEntry) && schoolInfo.schoolEntry.map((school, index) => (
        <div key={`school-${school._id || index}`} className="p-6 bg-white border border-gray-200 rounded-lg shadow-md mb-6">
          <div className="flex justify-between items-center mb-5">
            <h4 className="text-xl font-semibold text-gray-800">School Entry #{index + 1}</h4>
            {index > 0 && (
              <button
                type="button"
                onClick={() => handleRemoveSchoolEntry(index)}
                className="px-3 py-1.5 bg-red-500 text-white text-sm rounded-md hover:bg-red-600 transition duration-150"
              >
                Remove
              </button>
            )}
          </div>

          {/* School Name */}
          <div className="mb-5">
            <label htmlFor={`schoolName-${index}`} className="block font-medium text-gray-700 mb-2">
              School Name
            </label>
            <input
              type="text"
              id={`schoolName-${index}`}
              value={school.schoolName.value}
              onChange={(e) => onInputChange(`${path}.schoolEntry[${index}].schoolName.value`, e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Dates */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-5">
            <div>
              <label htmlFor={`fromDate-${index}`} className="block font-medium text-gray-700 mb-2">
                From Date (MM/YYYY)
              </label>
              <div className="flex items-center">
                <input
                  type="text"
                  id={`fromDate-${index}`}
                  value={school.fromDate.value}
                  onChange={(e) => onInputChange(`${path}.schoolEntry[${index}].fromDate.value`, e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  placeholder="MM/YYYY"
                  pattern="(0[1-9]|1[0-2])\/[0-9]{4}"
                  title="Please enter date in MM/YYYY format (e.g., 05/2020)"
                />
                <div className="ml-2">
                  <label className="inline-flex items-center">
                    <input
                      type="checkbox"
                      checked={school.fromEst.value === "Yes"}
                      onChange={(e) => onInputChange(`${path}.schoolEntry[${index}].fromEst.value`, e.target.checked ? "Yes" : "No")}
                      className="mr-1.5 h-4 w-4"
                    />
                    <span className="text-sm text-gray-600">Est.</span>
                  </label>
                </div>
              </div>
            </div>
            
            <div>
              <label htmlFor={`toDate-${index}`} className="block font-medium text-gray-700 mb-2">
                To Date (MM/YYYY)
              </label>
          <div className="flex items-center">
                <input
                  type="text"
                  id={`toDate-${index}`}
                  value={school.toDate.value}
                  onChange={(e) => onInputChange(`${path}.schoolEntry[${index}].toDate.value`, e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  placeholder="MM/YYYY"
                  pattern="(0[1-9]|1[0-2])\/[0-9]{4}"
                  title="Please enter date in MM/YYYY format (e.g., 05/2020)"
                  disabled={school.present.value === "Yes"}
                />
                <div className="ml-2 flex space-x-3">
                  <label className="inline-flex items-center">
                    <input
                      type="checkbox"
                      checked={school.toEst.value === "Yes"}
                      onChange={(e) => onInputChange(`${path}.schoolEntry[${index}].toEst.value`, e.target.checked ? "Yes" : "No")}
                      className="mr-1.5 h-4 w-4"
                      disabled={school.present.value === "Yes"}
                    />
                    <span className="text-sm text-gray-600">Est.</span>
            </label>
                  <label className="inline-flex items-center">
            <input
                      type="checkbox"
                      checked={school.present.value === "Yes"}
                      onChange={(e) => onInputChange(`${path}.schoolEntry[${index}].present.value`, e.target.checked ? "Yes" : "No")}
                      className="mr-1.5 h-4 w-4"
                    />
                    <span className="text-sm text-gray-600">Present</span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* School Address */}
          <div className="mb-5">
            <h5 className="font-medium text-gray-700 mb-3">School Address</h5>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor={`street-${index}`} className="block text-sm text-gray-700 mb-1">
                  Street
            </label>
            <input
                  type="text"
                  id={`street-${index}`}
                  value={school.schoolAddress.street.value}
                  onChange={(e) => onInputChange(`${path}.schoolEntry[${index}].schoolAddress.street.value`, e.target.value)}
                  className="w-full p-2.5 border border-gray-300 rounded-md shadow-sm"
            />
          </div>
              <div>
                <label htmlFor={`city-${index}`} className="block text-sm text-gray-700 mb-1">
                  City
            </label>
            <input
                  type="text"
                  id={`city-${index}`}
                  value={school.schoolAddress.city.value}
                  onChange={(e) => onInputChange(`${path}.schoolEntry[${index}].schoolAddress.city.value`, e.target.value)}
                  className="w-full p-2.5 border border-gray-300 rounded-md shadow-sm"
            />
          </div>
              <div>
                <label htmlFor={`state-${index}`} className="block text-sm text-gray-700 mb-1">
                  State
                </label>
                <select
                  id={`state-${index}`}
                  value={school.schoolAddress.state.value}
                  onChange={(e) => onInputChange(`${path}.schoolEntry[${index}].schoolAddress.state.value`, e.target.value)}
                  className="w-full p-2.5 border border-gray-300 rounded-md shadow-sm"
                >
                  <option value="">Select State</option>
                  {Object.entries(StateOptions).map(([key, value]) => (
                    <option key={key} value={value}>
                      {value}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor={`zipCode-${index}`} className="block text-sm text-gray-700 mb-1">
                  Zip Code
            </label>
            <input
              type="text"
                  id={`zipCode-${index}`}
                  value={school.schoolAddress.zipCode.value}
                  onChange={(e) => onInputChange(`${path}.schoolEntry[${index}].schoolAddress.zipCode.value`, e.target.value)}
                  className="w-full p-2.5 border border-gray-300 rounded-md shadow-sm"
                />
              </div>
              <div>
                <label htmlFor={`country-${index}`} className="block text-sm text-gray-700 mb-1">
                  Country
                </label>
                <select
                  id={`country-${index}`}
                  value={school.schoolAddress.country.value}
                  onChange={(e) => onInputChange(`${path}.schoolEntry[${index}].schoolAddress.country.value`, e.target.value)}
                  className="w-full p-2.5 border border-gray-300 rounded-md shadow-sm"
                >
                  <option value="">Select Country</option>
                  {Object.entries(CountryOptions).map(([key, value]) => (
                    <option key={key} value={value}>
                      {value}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* School Type */}
          <div className="mb-5">
            <label htmlFor={`schoolType-${index}`} className="block font-medium text-gray-700 mb-2">
              School Type
            </label>
            <select
              id={`schoolType-${index}`}
              value={school.schoolType.value}
              onChange={(e) => onInputChange(`${path}.schoolEntry[${index}].schoolType.value`, e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-md shadow-sm"
            >
              <option value="">Select School Type</option>
              <option value="High School">High School</option>
              <option value="College/University/Military College">College/University/Military College</option>
              <option value="Vocational/Technical/Trade School">Vocational/Technical/Trade School</option>
              <option value="Correspondence/Distance/Extension/Online School">Correspondence/Distance/Extension/Online School</option>
              <option value="Other">Other</option>
            </select>
          </div>

          {/* Known Person */}
          <div className="mb-5 p-4 border border-gray-200 rounded-md bg-gray-50">
            <h5 className="font-medium text-gray-700 mb-3">Person Who Knew You</h5>
            
            <div className="mb-3">
              <label className="inline-flex items-center">
            <input
              type="checkbox"
                  checked={school.knownPerson.dontKnowName.value === "Yes"}
                  onChange={(e) => onInputChange(`${path}.schoolEntry[${index}].knownPerson.dontKnowName.value`, e.target.checked ? "Yes" : "No")}
                  className="mr-2 h-4 w-4"
                />
                <span className="text-sm">I don't know the name of anyone who knew me at this school</span>
              </label>
            </div>

            {school.knownPerson.dontKnowName.value !== "Yes" && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label htmlFor={`firstName-${index}`} className="block text-sm text-gray-700 mb-1">
                      First Name
                    </label>
                    <input
                      type="text"
                      id={`firstName-${index}`}
                      value={school.knownPerson.firstName.value}
                      onChange={(e) => onInputChange(`${path}.schoolEntry[${index}].knownPerson.firstName.value`, e.target.value)}
                      className="w-full p-2.5 border border-gray-300 rounded-md shadow-sm"
                    />
                  </div>
                  <div>
                    <label htmlFor={`lastName-${index}`} className="block text-sm text-gray-700 mb-1">
                      Last Name
                    </label>
                    <input
                      type="text"
                      id={`lastName-${index}`}
                      value={school.knownPerson.lastName.value}
                      onChange={(e) => onInputChange(`${path}.schoolEntry[${index}].knownPerson.lastName.value`, e.target.value)}
                      className="w-full p-2.5 border border-gray-300 rounded-md shadow-sm"
                    />
                  </div>
          </div>

                {/* Known Person Address */}
                <div className="mb-4">
                  <h6 className="text-sm font-medium text-gray-700 mb-2">Address</h6>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor={`kpStreet-${index}`} className="block text-xs text-gray-700 mb-1">
                        Street
                      </label>
                      <input
                        type="text"
                        id={`kpStreet-${index}`}
                        value={school.knownPerson.address.street.value}
                        onChange={(e) => onInputChange(`${path}.schoolEntry[${index}].knownPerson.address.street.value`, e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-md shadow-sm"
                      />
                    </div>
                    <div>
                      <label htmlFor={`kpCity-${index}`} className="block text-xs text-gray-700 mb-1">
                        City
                      </label>
                      <input
                        type="text"
                        id={`kpCity-${index}`}
                        value={school.knownPerson.address.city.value}
                        onChange={(e) => onInputChange(`${path}.schoolEntry[${index}].knownPerson.address.city.value`, e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-md shadow-sm"
                      />
                    </div>
                    <div>
                      <label htmlFor={`kpState-${index}`} className="block text-xs text-gray-700 mb-1">
                        State
                      </label>
                      <select
                        id={`kpState-${index}`}
                        value={school.knownPerson.address.state.value}
                        onChange={(e) => onInputChange(`${path}.schoolEntry[${index}].knownPerson.address.state.value`, e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-md shadow-sm"
                      >
                        <option value="">Select State</option>
                        {Object.entries(StateOptions).map(([key, value]) => (
                          <option key={key} value={value}>
                            {value}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label htmlFor={`kpZipCode-${index}`} className="block text-xs text-gray-700 mb-1">
                        Zip Code
                      </label>
                      <input
                        type="text"
                        id={`kpZipCode-${index}`}
                        value={school.knownPerson.address.zipCode.value}
                        onChange={(e) => onInputChange(`${path}.schoolEntry[${index}].knownPerson.address.zipCode.value`, e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-md shadow-sm"
                      />
                    </div>
                    <div>
                      <label htmlFor={`kpCountry-${index}`} className="block text-xs text-gray-700 mb-1">
                        Country
                      </label>
                      <select
                        id={`kpCountry-${index}`}
                        value={school.knownPerson.address.country.value}
                        onChange={(e) => onInputChange(`${path}.schoolEntry[${index}].knownPerson.address.country.value`, e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-md shadow-sm"
                      >
                        <option value="">Select Country</option>
                        {Object.entries(CountryOptions).map(([key, value]) => (
                          <option key={key} value={value}>
                            {value}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Phone */}
                <div className="mb-4">
                  <h6 className="text-sm font-medium text-gray-700 mb-2">Phone</h6>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor={`phoneNumber-${index}`} className="block text-sm text-gray-700 mb-1">
                        Phone Number
                      </label>
                      <input
                        type="text"
                        id={`phoneNumber-${index}`}
                        value={school.knownPerson?.phoneNumber?.number?.value || ""}
                        onChange={(e) => onInputChange(`${path}.schoolEntry[${index}].knownPerson.phoneNumber.number.value`, e.target.value)}
                        className="w-full p-2 border rounded-md"
                        disabled={school.knownPerson?.phoneNumber?.dontKnowNumber?.value === "Yes"}
                      />
                    </div>
                    <div>
                      <label htmlFor={`phoneExt-${index}`} className="block text-sm text-gray-700 mb-1">
                        Extension
                  </label>
                  <input
                    type="text"
                        id={`phoneExt-${index}`}
                        value={school.knownPerson?.phoneNumber?.extension?.value || ""}
                        onChange={(e) => onInputChange(`${path}.schoolEntry[${index}].knownPerson.phoneNumber.extension.value`, e.target.value)}
                        className="w-full p-2 border rounded-md"
                        disabled={school.knownPerson?.phoneNumber?.dontKnowNumber?.value === "Yes"}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 mt-2">
                    <div>
                      <label className="inline-flex items-center">
                        <input
                          type="checkbox"
                          checked={school.knownPerson?.phoneNumber?.dontKnowNumber?.value === "Yes"}
                          onChange={(e) => onInputChange(`${path}.schoolEntry[${index}].knownPerson.phoneNumber.dontKnowNumber.value`, e.target.checked ? "Yes" : "No")}
                          className="mr-2"
                        />
                        <span className="text-sm">I don't know the phone number</span>
                      </label>
                    </div>
                    <div>
                      <label className="inline-flex items-center">
                        <input
                          type="checkbox"
                          checked={school.knownPerson?.phoneNumber?.isInternationalOrDSN?.value === "Yes"}
                          onChange={(e) => onInputChange(`${path}.schoolEntry[${index}].knownPerson.phoneNumber.isInternationalOrDSN.value`, e.target.checked ? "Yes" : "No")}
                          className="mr-2"
                        />
                        <span className="text-sm">International or DSN</span>
                      </label>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 mt-2">
                    <div>
                      <label className="inline-flex items-center">
                        <input
                          type="checkbox"
                          checked={school.knownPerson?.phoneNumber?.day?.value === "Yes"}
                          onChange={(e) => onInputChange(`${path}.schoolEntry[${index}].knownPerson.phoneNumber.day.value`, e.target.checked ? "Yes" : "No")}
                          className="mr-2"
                        />
                        <span className="text-sm">Day</span>
                      </label>
                    </div>
                    <div>
                      <label className="inline-flex items-center">
                        <input
                          type="checkbox"
                          checked={school.knownPerson?.phoneNumber?.night?.value === "Yes"}
                          onChange={(e) => onInputChange(`${path}.schoolEntry[${index}].knownPerson.phoneNumber.night.value`, e.target.checked ? "Yes" : "No")}
                          className="mr-2"
                        />
                        <span className="text-sm">Night</span>
                      </label>
                    </div>
                  </div>
                </div>

                {/* Email */}
                <div className="mb-4">
                  <div className="flex justify-between items-end">
                    <label htmlFor={`email-${index}`} className="block text-sm text-gray-700 mb-1">
                      Email
                    </label>
                    <label className="inline-flex items-center">
                      <input
                        type="checkbox"
                        checked={school.knownPerson?.dontKnowEmail?.value === "Yes"}
                        onChange={(e) => onInputChange(`${path}.schoolEntry[${index}].knownPerson.dontKnowEmail.value`, e.target.checked ? "Yes" : "No")}
                        className="mr-1.5 h-4 w-4"
                      />
                      <span className="text-xs text-gray-700">I don't know the email</span>
                  </label>
                  </div>
                  <input
                    type="email"
                    id={`email-${index}`}
                    value={school.knownPerson?.email?.value || ""}
                    onChange={(e) => onInputChange(`${path}.schoolEntry[${index}].knownPerson.email.value`, e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md shadow-sm"
                    disabled={school.knownPerson?.dontKnowEmail?.value === "Yes"}
                  />
                </div>
              </>
            )}
          </div>

          {/* Degree Info */}
          <div className="mb-4">
            <div className="mb-3">
              <label className="block font-medium text-gray-700 mb-2">Did you receive a degree?</label>
              <div className="flex items-center space-x-4">
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    name={`degreeReceived-${index}`}
                    checked={school.degreeReceived.value === "YES"}
                    onChange={() => onInputChange(`${path}.schoolEntry[${index}].degreeReceived.value`, "YES")}
                    className="mr-2"
                  />
                  <span>Yes</span>
                  </label>
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    name={`degreeReceived-${index}`}
                    checked={school.degreeReceived.value === "NO"}
                    onChange={() => onInputChange(`${path}.schoolEntry[${index}].degreeReceived.value`, "NO")}
                    className="mr-2"
                  />
                  <span>No</span>
                </label>
              </div>
                </div>

            {school.degreeReceived.value === "YES" && (
              <div className="mt-4">
                <h5 className="font-medium text-gray-700 mb-3">Degrees</h5>
                {Array.isArray(school.degrees) && school.degrees.map((degree, degreeIndex) => (
                  <div key={`degree-${school._id}-${degreeIndex}-${degree._id || ''}`} className="p-4 border border-gray-200 rounded-md mb-4 bg-white">
                    <div className="flex justify-between items-center mb-3">
                      <h6 className="text-sm font-semibold text-gray-700">Degree #{degreeIndex + 1}</h6>
                      {degreeIndex > 0 && (
                  <button
                          type="button"
                          onClick={() => handleRemoveDegree(index, degreeIndex)}
                          className="px-2 py-1 bg-red-500 text-white text-xs rounded-md hover:bg-red-600 transition duration-150"
                        >
                          Remove
                  </button>
                )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor={`degreeType-${index}-${degreeIndex}`} className="block text-sm text-gray-700 mb-1">
                          Degree Type
                        </label>
                        <select
                          id={`degreeType-${index}-${degreeIndex}`}
                          value={degree.type?.value || ""}
                          onChange={(e) => onInputChange(`${path}.schoolEntry[${index}].degrees[${degreeIndex}].type.value`, e.target.value)}
                          className="w-full p-2.5 border border-gray-300 rounded-md shadow-sm"
                        >
                          <option value="">Select Degree Type</option>
                          <option value="High School Diploma">High School Diploma</option>
                          <option value="Associate's">Associate's</option>
                          <option value="Bachelor's">Bachelor's</option>
                          <option value="Master's">Master's</option>
                          <option value="Doctorate">Doctorate</option>
                          <option value="Professional Degree (e.g. MD, DVM, JD)">Professional Degree (e.g. MD, DVM, JD)</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>

                      {degree.type?.value === "Other" && (
                        <div>
                          <label htmlFor={`otherDegree-${index}-${degreeIndex}`} className="block text-sm text-gray-700 mb-1">
                            Specify Other Degree
                          </label>
                          <input
                            type="text"
                            id={`otherDegree-${index}-${degreeIndex}`}
                            value={degree.otherDegree?.value || ""}
                            onChange={(e) => onInputChange(`${path}.schoolEntry[${index}].degrees[${degreeIndex}].otherDegree.value`, e.target.value)}
                            className="w-full p-2.5 border border-gray-300 rounded-md shadow-sm"
                          />
                        </div>
                      )}

                      <div>
                        <label htmlFor={`dateAwarded-${index}-${degreeIndex}`} className="block text-sm text-gray-700 mb-1">
                          Date Awarded (MM/YYYY)
                        </label>
                        <div className="flex items-center">
                          <input
                            type="text"
                            id={`dateAwarded-${index}-${degreeIndex}`}
                            value={degree.dateAwarded?.value || ""}
                            onChange={(e) => onInputChange(`${path}.schoolEntry[${index}].degrees[${degreeIndex}].dateAwarded.value`, e.target.value)}
                            className="w-full p-2.5 border border-gray-300 rounded-md shadow-sm"
                            placeholder="MM/YYYY"
                            pattern="(0[1-9]|1[0-2])\/[0-9]{4}"
                            title="Please enter date in MM/YYYY format (e.g., 05/2020)"
                          />
                          <div className="ml-2">
                            <label className="inline-flex items-center">
                              <input
                                type="checkbox"
                                checked={degree.est?.value === "Yes"}
                                onChange={(e) => onInputChange(`${path}.schoolEntry[${index}].degrees[${degreeIndex}].est.value`, e.target.checked ? "Yes" : "No")}
                                className="mr-1.5 h-4 w-4"
                              />
                              <span className="text-xs text-gray-600">Est.</span>
                            </label>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

// Use memo to optimize rendering performance
const MemoizedRenderSchoolInfo = memo(RenderSchoolInfo);

export { MemoizedRenderSchoolInfo as RenderSchoolInfo };