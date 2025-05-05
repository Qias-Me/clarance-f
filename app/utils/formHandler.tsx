import React, { useState, useEffect } from "react";
import lodash from "lodash";
import {
  goToStep,
  selectCurrentStep,
  setTotalSteps,
} from "../state/user/formSlice";
import StepperFooter from "../components/form86/samples/stepperFooter";
import { useDispatch, useTypedSelector } from "~/state/hooks/index";

import { RenderBasicInfo } from "../components/Rendered/RenderBasicInfo";
import { RenderBirthInfo } from "../components/Rendered/RenderBirthInfo";
import { RenderAcknowledgementInfo } from "../components/Rendered/RenderAcknowledgementInfo";
import { RenderNames } from "../components/Rendered/RenderNames";
import { RenderPhysicalsInfo } from "~/components/Rendered/RenderPhysicals";
import { RenderContactInfo } from "~/components/Rendered/RenderContactInfo";
import { RenderPassportInfo } from "~/components/Rendered/RenderPassportInfo";
import { RenderCitizenshipInfo } from "~/components/Rendered/RenderCitizenshipInfo";
import { RenderDualCitizenshipInfo } from "~/components/Rendered/RenderDuelCitizenship";
import { RenderResidencyInfo } from "~/components/Rendered/RenderResidencyInfo";
import { RenderSchoolInfo } from "~/components/Rendered/RenderSchoolInfo";
import { RenderEmploymentInfo } from "~/components/Rendered/RenderEmployementInfo";
import { RenderServiceInfo } from "~/components/Rendered/RenderServiceInfo";
import { RenderMilitaryInfo } from "~/components/Rendered/RenderMilitaryInfo";
import { RenderPeopleThatKnow } from "~/components/Rendered/RenderPeopleThatKnow";
import { RenderRelationshipInfo } from "~/components/Rendered/RenderRelationshipInfo";
import { RenderRelativesInfo } from "~/components/Rendered/RenderRelativesInfo";
import { RenderForeignContacts } from "~/components/Rendered/RenderForeignContacts";
import { RenderForeignActivities } from "~/components/Rendered/RenderForeignActivities";
import { RenderMentalHealth } from "~/components/Rendered/RenderMentalHealth";
import { RenderPolice } from "~/components/Rendered/RenderPolice";
import { RenderDrugActivity } from "~/components/Rendered/RenderDrugActivity";
import { RenderAlcoholUse } from "~/components/Rendered/RenderAlcoholUse";
import { RenderInvestigationsInfo } from "~/components/Rendered/RenderInvestigationsInfo";
import { RenderFinances } from "~/components/Rendered/RenderFinances";
import { RenderTechnology } from "~/components/Rendered/RenderTechnology";
import { RenderCivil } from "~/components/Rendered/RenderCivil";
import { RenderAssociation } from "~/components/Rendered/RenderAssociation";
import { RenderSignature } from "~/components/Rendered/RenderSignature";
import { RenderPrintPDF } from "~/components/Rendered/RenderPrintPDF";

import { useEmployee } from "~/state/contexts/new-context";
import { type ApplicantFormValues } from "api/interfaces/formDefinition";
import type { FormInfo } from "api/interfaces/FormInfo";

const { set, get, cloneDeep, merge } = lodash;

interface DynamicFormProps {
  data: ApplicantFormValues;
  onChange: (data: ApplicantFormValues) => void;
  FormInfo: FormInfo;
}

// Define the ordered form sections for consistent step navigation
const ORDERED_FORM_SECTIONS = [
  "personalInfo", // Step 1
  "birthInfo", // Step 2
  "aknowledgementInfo", // Step 3
  "namesInfo", // Step 4
  "physicalAttributes", // Step 5
  "contactInfo", // Step 6
  "passportInfo", // Step 7
  "citizenshipInfo", // Step 8
  "dualCitizenshipInfo", // Step 9
  "residencyInfo", // Step 10
  "schoolInfo", // Step 11
  "employmentInfo", // Step 12
  "serviceInfo", // Step 13
  "militaryHistoryInfo", // Step 14
  "peopleThatKnow", // Step 15
  "relationshipInfo", // Step 16
  "relativesInfo", // Step 17
  "foreignContacts", // Step 18
  "foreignActivities", // Step 19
  "mentalHealth", // Step 20
  "policeRecord", // Step 21
  "drugActivity", // Step 22
  "alcoholUse", // Step 23
  "investigationsInfo", // Step 24
  "finances", // Step 25
  "technology", // Step 26
  "civil", // Step 27
  "association", // Step 28
  "signature", // Step 29
  "print", // Step 30
];

const DynamicForm3: React.FC<DynamicFormProps> = ({
  data,
  onChange,
  FormInfo,
}) => {
  const [formData, setFormData] = useState<ApplicantFormValues | null>(null);
  const [formSections, setFormSections] = useState<string[]>([]);
  const dispatch = useDispatch();
  const currentStep = useTypedSelector(selectCurrentStep);

  const { updateField } = useEmployee();

  // Initialize form data and sections when data is available
  useEffect(() => {
    if (data) {
      setFormData(cloneDeep(data));

      // Filter the ordered sections to only include those that exist in the data
      const availableSections = ORDERED_FORM_SECTIONS.filter(
        (section) => section in data
      );

      setFormSections(availableSections);

      // Update the total steps in the Redux store
      dispatch(setTotalSteps(availableSections.length));

      // Set initial step to 0 if current step is out of range
      if (currentStep >= availableSections.length) {
        dispatch(goToStep(0));
      }
    }
  }, [data, dispatch, currentStep]);

  // If data is not yet loaded, show a loading indicator
  if (!formData) {
    return (
      <div className="animate-pulse flex space-x-4">Loading form data...</div>
    );
  }

  const handleInputChange = (path: string, value: any) => {
    if (!formData) return;

    const updatedFormData = set({ ...formData }, path, value);
    setFormData(updatedFormData);
    onChange(updatedFormData);
    updateField(path, value);
  };

  const isValidValue = (path: string, value: any): boolean => {
    // Reject undefined or null values
    if (value === undefined || value === null) {
      return false;
    }

    // Reject empty strings
    if (typeof value === "string" && value.trim() === "") {
      return false;
    }

    // Specific validation for employee_description to not exceed 255 characters
    if (path.endsWith("employee_description") && value.length > 255) {
      return false;
    }

    // Check for arrays being empty
    if (Array.isArray(value) && value.length === 0) {
      return false;
    }

    // Ensure objects are not empty (excluding arrays)
    if (
      typeof value === "object" &&
      !Array.isArray(value) &&
      Object.keys(value).length === 0
    ) {
      return false;
    }

    return true;
  };

  const handleAddEntry = (path: string, updatedItem: any) => {
    if (!formData) return;

    const updatedFormData = cloneDeep(formData);
    let currentData = get(updatedFormData, path);

    if (Array.isArray(updatedItem)) {
      // Ensure updatedItem is not an array itself
      const itemToPush = Array.isArray(updatedItem)
        ? updatedItem[0]
        : updatedItem;

      // Initialize currentData as an array if it is undefined
      if (!Array.isArray(currentData)) {
        currentData = [];
      }

      // Push the itemToPush into the currentData array
      currentData.push(itemToPush);
      set(updatedFormData, path, currentData);
    } else {
      // If currentData is an object or undefined, set or merge the updatedItem
      const mergedData = merge(currentData || {}, updatedItem);
      set(updatedFormData, path, mergedData);
    }

    setFormData(updatedFormData);
    onChange(updatedFormData);
    updateField(path, updatedItem);
  };

  const handleRemoveEntry = (path: string, index: number) => {
    if (!formData) return;

    const updatedFormData = cloneDeep(formData);
    const list = get(updatedFormData, path, []);

    if (list && Array.isArray(list)) {
      list.splice(index, 1);
      set(updatedFormData, path, list);
      setFormData(updatedFormData);
      updateField(path, list as any); // Type assertion to resolve TypeScript error
      onChange(updatedFormData);
    }
  };

  const getDefaultNewItem = (path: string): any => {
    const templates = {
      names: [
        {
          _id: Math.random(),
          hasNames: false,
          lastName: "",
          firstName: "",
          middleName: "",
          suffix: "",
          nameStarted: "",
          isStartDateEst: false,
          nameEnded: "",
          isNamePresent: false,
          isEndDateEst: false,
          isMaidenName: false,
          reasonChanged: "",
        },
      ],
      residencyInfo: {
        _id: Math.random(),
        residenceStartDate: "",
        isStartDateEst: false,
        residenceEndDate: "",
        isResidenceEndEst: false,
        isResidencePresent: false,
        residenceStatus: "None",
        residenceOtherDetails: "",
        residenceAddress: {
          street: "",
          city: "",
          state: "",
          zip: "",
          country: "",
          hasAPOOrFPO: false,
          APOOrFPODetails: {
            addressUnitOrDutyLocation: "",
            cityOrPostName: "",
            state: "",
            zip: "",
            country: "",
            hadAPOFPOAddress: false,
            APOFPOAddress: "",
            APOOrFPO: "APO",
            APOFPOStateCode: "",
            APOFPOZip: "",
          },
        },
        contact: {
          lastname: "",
          firstname: "",
          middlename: "",
          suffix: "",
          lastContactDate: "",
          isLastContactEst: false,
          relationship: "",
          relationshipOtherDetail: "",
          phone: [
            {
              type: "Evening",
              knowsNumber: false,
              isInternationalOrDSN: false,
              number: "",
              extension: "",
            },
          ],
          email: "",
          contactAddress: {
            street: "",
            city: "",
            state: "",
            zip: "",
            country: "",
            hasAPOOrFPO: false,
            APOOrFPODetails: {
              addressUnitOrDutyLocation: "",
              cityOrPostName: "",
              state: "",
              zip: "",
              country: "",
              hadAPOFPOAddress: false,
              APOFPOAddress: "",
              APOOrFPO: "APO",
              APOFPOStateCode: "",
              APOFPOZip: "",
            },
          },
        },
      },
      physicalAttributes: {
        heightFeet: 0,
        heightInch: 0,
        weight: 0,
        hairColor: "None",
        eyeColor: "None",
      },
      citizenshipInfo: {
        birth: {
          doc_type: "FS240",
          doc_num: "",
          doc_issue_date: "",
          is_issue_date_est: false,
          issue_city: "",
          issued_state: "",
          issued_country: "",
          issued_fname: "",
          issued_lname: "",
          issued_mname: "",
          issued_suffix: "",
          citizenship_num: "",
          certificate_issue_date: "",
          is_certificate_date_est: false,
          certificate_fname: "",
          certificate_lname: "",
          certificate_mname: "",
          certificate_suffix: "",
          is_born_installation: false,
          base_name: "",
        },
        naturalized: {
          us_entry_date: "",
          is_us_entry_date_est: false,
          entry_city: "",
          entry_state: "",
          country_of_citizenship_1: "",
          country_of_citizenship_2: "",
          has_alien_registration: false,
          alien_registration_num: "",
          naturalization_num: "",
          naturalization_issue_date: "",
          is_natural_issue_est: false,
          court_issued_date: "",
          court_street: "",
          court_city: "",
          court_state: "",
          court_zip: "",
          court_issued_fname: "",
          court_issued_lname: "",
          court_issued_mname: "",
          court_issued_suffix: "",
          basis_of_naturalization: "",
          other_basis_detail: "",
        },
        derived: {
          alien_registration_num: "",
          permanent_resident_num: "",
          certificate_of_citizenship_num: "",
          doc_fname: "",
          doc_lname: "",
          doc_mname: "",
          doc_suffix: "",
          doc_issue_date: "",
          is_doc_date_est: false,
          basis_of_citizenship: "other",
          basis_of_citizenship_explanation: "",
        },
        nonCitizen: {
          residence_status: "",
          us_entry_date: "",
          is_entry_date_est: false,
          country_of_citizenship1: "",
          country_of_citizenship2: "",
          entry_city: "",
          entry_state: "",
          alien_registration_num: "",
          expiration_date: "",
          is_expiration_est: false,
          document_issued: "I-94",
          other_doc: "",
          doc_num: "",
          doc_issued_date: "",
          is_doc_date_est: false,
          doc_expire_date: "",
          is_doc_expiration_est: false,
          doc_fname: "",
          doc_lname: "",
          doc_mname: "",
          doc_suffix: "",
        },
      },
      dualCitizenshipInfo: {
        citizenships: {
          _id: Math.random(),
          country: "",
          howCitizenshipAcquired: "",
          citizenshipStart: "",
          isCitizenshipStartEstimated: false,
          citizenshipEnd: "",
          isCitizenshipEndPresent: false,
          isCitizenshipEndEstimated: false,
          isRenounced: false,
          renouncementDetails: "",
          isCitizenshipHeld: false,
          citizenshipExplanation: "",
        },
        passports: {
          _id: Math.random(),
          countryIssued: "",
          passportDateIssued: "",
          isPassportDateEst: false,
          passportCity: "",
          passportCountry: "",
          passportLName: "",
          passportFName: "",
          passportMName: "",
          passportSuffix: "",
          passportNumber: "",
          passportExpiration: "",
          isExpirationEst: false,
          isPassportUsed: false,
          passportUses: [
            {
              _id: Math.random(),
              passportCountry: "",
              fromDate: "",
              toDate: "",
              isFromDateEst: false,
              isToDateEst: false,
              isVisitCurrent: false,
            },
          ],
        },
      },
      contactInfo: {
        contactNumbers: {
          _id: Math.random(),
          numberType: "Home", // Default type, can be changed by the user
          phoneNumber: "",
          phoneExtension: "",
          isUsableDay: false,
          isUsableNight: false,
          internationalOrDSN: false,
        },
      },
      schoolInfo: {
        schoolEntry: {
          _id: Math.random(),
          fromDate: "",
          toDate: "",
          present: false,
          est: false,
          schoolName: "",
          schoolAddress: {
            street: "",
            city: "",
            state: "",
            zipCode: "",
            country: "",
          },
          schoolType: "",
          knownPerson: {
            firstName: "",
            lastName: "",
            address: {
              street: "",
              city: "",
              state: "",
              zipCode: "",
              country: "",
            },
            phoneNumber: {
              type: "Evening",
              knowsNumber: false,
              isInternationalOrDSN: false,
              number: "",
              extension: "",
            },
            email: "",
            unknown: false,
          },
          degreeReceived: true,
          degrees: [
            {
              degreeID: Math.random(),
              type: "",
              dateAwarded: "",
              est: false,
            },
          ],
        },
      },
      employmentInfo: {
        _id: Math.random(),
        employmentActivity: "none",
        section13A1: {
          fromDate: "",
          toDate: "",
          present: false,
          estimated: false,
          employmentStatus: {
            fullTime: false,
            partTime: false,
          },
          dutyStation: "",
          rankOrPosition: "",
          address: {
            street: "",
            city: "",
            state: "",
            zipCode: "",
            country: "",
          },
          telephone: {
            number: "",
            extension: "",
            internationalOrDsn: false,
            day: false,
            night: false,
          },
          apoFpoAddress: {
            physicalLocationData: {
              street: "",
              city: "",
              state: "",
              zipCode: "",
              country: "",
            },
            physicalWorkLocation: {
              street: "",
              city: "",
              state: "",
              zipCode: "",
              country: "",
            },
            apoOrFpo: "",
            apoFpoStateCode: "",
          },
          supervisor: {
            name: "",
            rankOrPosition: "",
            email: "",
            emailUnknown: false,
            phone: {
              number: "",
              extension: "",
              internationalOrDsn: false,
              day: false,
              night: false,
            },
            physicalWorkLocation: {
              street: "",
              city: "",
              state: "",
              zipCode: "",
              country: "",
            },
          },
        },
        section13A2: {
          fromDate: "",
          toDate: "",
          present: false,
          estimated: false,
          employmentStatus: {
            fullTime: false,
            partTime: false,
          },
          positionTitle: "",
          employerName: "",
          employerAddress: {
            street: "",
            city: "",
            state: "",
            zipCode: "",
            country: "",
          },
          telephone: {
            number: "",
            extension: "",
            internationalOrDsn: false,
            day: false,
            night: false,
          },
          additionalPeriods: [
            {
              _id: Math.random(),
              fromDate: "",
              toDate: "",
              estimatedFrom: false,
              estimatedTo: false,
              positionTitle: "",
              supervisor: "",
            },
          ],
          physicalWorkAddress: {
            differentThanEmployer: false,
            address: {
              street: "",
              city: "",
              state: "",
              zipCode: "",
              country: "",
            },
            telephone: {
              number: "",
              extension: "",
              internationalOrDsn: false,
              day: false,
              night: false,
            },
          },
        },
        section13A3: {
          fromDate: "",
          toDate: "",
          present: false,
          estimated: false,
          employmentStatus: {
            fullTime: false,
            partTime: false,
          },
          positionTitle: "",
          employmentName: "",
          employmentAddress: {
            street: "",
            city: "",
            state: "",
            zipCode: "",
            country: "",
          },
          telephone: {
            number: "",
            extension: "",
            internationalOrDsn: false,
            day: false,
            night: false,
          },
          physicalWorkAddress: {
            fullTime: false,
            partTime: false,
          },
          apoFpoAddress: {
            physicalLocationData: {
              street: "",
              city: "",
              state: "",
              zipCode: "",
              country: "",
            },
            physicalWorkLocation: {
              street: "",
              city: "",
              state: "",
              zipCode: "",
              country: "",
            },
            apoOrFpo: "",
            apoFpoStateCode: "",
          },
          selfEmploymentVerifier: {
            lastName: "",
            firstName: "",
            address: {
              street: "",
              city: "",
              state: "",
              zipCode: "",
              country: "",
            },
            telephone: {
              number: "",
              extension: "",
              internationalOrDsn: false,
              day: false,
              night: false,
            },
            apoFpoAddress: {
              physicalLocationData: {
                street: "",
                city: "",
                state: "",
                zipCode: "",
                country: "",
              },
              physicalWorkLocation: {
                street: "",
                city: "",
                state: "",
                zipCode: "",
                country: "",
              },
              apoOrFpo: "",
              apoFpoStateCode: "",
            },
          },
        },
        section13A4: {
          fromDate: "",
          toDate: "",
          present: false,
          estimated: false,
          verifier: {
            lastName: "",
            firstName: "",
            address: {
              street: "",
              city: "",
              state: "",
              zipCode: "",
              country: "",
            },
            telephone: {
              number: "",
              extension: "",
              internationalOrDsn: false,
              day: false,
              night: false,
            },
            apoFpoAddress: {
              physicalLocationData: {
                street: "",
                city: "",
                state: "",
                zipCode: "",
                country: "",
              },
              physicalWorkLocation: {
                street: "",
                city: "",
                state: "",
                zipCode: "",
                country: "",
              },
              apoOrFpo: "",
              apoFpoStateCode: "",
            },
          },
        },
        section13A5: {
          reasonForLeaving: "",
          incidentInLastSevenYears: false,
          incidentDetails: [
            {
              type: "fired", // Default value as an example
              reason: "",
              departureDate: "",
              estimated: false,
            },
          ],
        },
        section13A6: {
          warnedInLastSevenYears: false,
          warningDetails: [
            {
              reason: "",
              date: "",
              estimated: false,
            },
          ],
        },
        section13B: {
          hasFormerFederalEmployment: false,
          employmentEntries: [
            {
              _id: Math.random(),
              fromDate: "",
              toDate: "",
              present: false,
              estimated: false,
              agencyName: "",
              positionTitle: "",
              location: {
                street: "",
                city: "",
                state: "",
                zipCode: "",
                country: "",
              },
            },
          ],
        },
      },
      militaryHistoryInfo: {
        section15_1: [
          {
            branch: "",
            stateOfService: "",
            status: "",
            officerOrEnlisted: "",
            serviceNumber: "",
            serviceFromDate: "",
            serviceToDate: "",
            present: false,
            estimatedFromDate: false,
            estimatedToDate: false,
            discharged: false,
            typeOfDischarge: "",
            dischargeTypeOther: "",
            dischargeDate: "",
            estimatedDischargeDate: false,
            dischargeReason: "",
          },
        ],
        section15_2: [
          {
            date: "",
            estimatedDate: false,
            descriptionOfOffense: "",
            nameOfProcedure: "",
            courtDescription: "",
            outcomeDescription: "",
          },
        ],
        section15_3: [
          {
            organizationType: "",
            organizationTypeOther: "",
            organizationName: "",
            country: "",
            periodOfServiceFrom: "",
            periodOfServiceTo: "",
            present: false,
            estimatedPeriodFrom: false,
            estimatedPeriodTo: false,
            highestRank: "",
            departmentOrOffice: "",
            associationDescription: "",
            reasonForLeaving: "",
            maintainsContact: null,
            contacts: [
              {
                lastName: "",
                firstName: "",
                middleName: "",
                suffix: "",
                address: {
                  street: "",
                  city: "",
                  state: "",
                  zipCode: "",
                  country: "",
                },
                officialTitle: "",
                frequencyOfContact: "",
                associationFrom: "",
                associationTo: "",
                present: false,
                estimatedAssociationFrom: false,
                estimatedAssociationTo: false,
              },
            ],
          },
        ],
      },
      serviceInfo: {
        bornAfter1959: null,
        registeredWithSSS: null,
      },
      peopleThatKnow: [
        {
          _id: Math.random(),
          knownFromDate: "",
          knownToDate: null,
          present: true,
          estimatedFromDate: false,
          estimatedToDate: false,
          lastName: "",
          firstName: "",
          middleName: "",
          suffix: "",
          emailAddress: "",
          emailUnknown: false,
          rankOrTitle: "",
          rankOrTitleNotApplicable: false,
          relationshipToApplicant: {
            neighbor: false,
            workAssociate: false,
            friend: false,
            schoolmate: false,
            other: "",
          },
          phoneNumber: "",
          phoneNumberUnknown: false,
          phoneExtension: "",
          phoneType: "",
          mobileNumber: "",
          preferredContactTime: {
            day: false,
            night: false,
          },
          address: {
            street: "",
            city: "",
            state: "",
            zipCode: "",
            country: "",
          },
        },
      ],
      relationshipInfo: {
        currentStatus: "NeverEntered",
        section17_1: {
          _id: Math.random(),
          fullName: {
            lastName: "",
            firstName: "",
            middleName: "",
            suffix: "",
          },
          placeOfBirth: {
            city: "",
            county: "",
            state: "",
            country: "",
          },
          dateOfBirth: {
            date: "",
            estimated: false,
          },
          citizenship: [
            {
              _id: Math.random(),
              country: "",
            },
          ],
          documentation: {
            type: "Other",
            documentNumber: "",
            documentExpirationDate: {
              date: "",
              estimated: false,
            },
            otherExplanation: "",
          },
          usSocialSecurityNumber: "",
          otherNames: [
            {
              _id: Math.random(),
              lastName: "",
              firstName: "",
              middleName: "",
              suffix: "",
              maidenName: false,
              fromDate: {
                date: "",
                estimated: false,
              },
              toDate: {
                date: "",
                estimated: false,
              },
            },
          ],
          relationshipStatus: "Divorced",
          statusDetails: {
            location: {
              city: "",
              county: "",
              state: "",
              country: "",
            },
            date: {
              date: "",
              estimated: false,
            },
            recordLocation: {
              city: "",
              county: "",
              state: "",
              country: "",
            },
            deceased: false,
            lastKnownAddress: {
              street: "",
              city: "",
              state: "",
              zipCode: "",
              country: "",
            },
          },
        },
        section17_2: [
          {
            _id: Math.random(),
            marriageStatus: "",
            dateOfMarriage: {
              date: "",
              estimated: false,
            },
            placeOfMarriage: {
              city: "",
              county: "",
              state: "",
              country: "",
            },
            spouseName: {
              lastName: "",
              firstName: "",
              middleName: "",
              suffix: "",
            },
            spousePlaceOfBirth: {
              city: "",
              county: "",
              state: "",
              country: "",
            },
            spouseDateOfBirth: {
              date: "",
              estimated: false,
            },
            spouseCitizenship: [
              {
                _id: Math.random(),
                country: "",
              },
            ],
            spouseDocumentation: {
              type: "Other",
              documentNumber: "",
              documentExpirationDate: {
                date: "",
                estimated: false,
              },
              otherExplanation: "",
            },
            spouseUsSocialSecurityNumber: "",
            spouseOtherNames: [
              {
                _id: Math.random(),
                lastName: "",
                firstName: "",
                middleName: "",
                suffix: "",
                maidenName: false,
                fromDate: {
                  date: "",
                  estimated: false,
                },
                toDate: {
                  date: "",
                  estimated: false,
                },
              },
            ],
          },
        ],
        section17_3: {
          _id: Math.random(),
          hasCohabitant: false,
          cohabitants: [
            {
              _id: Math.random(),
              fullName: {
                lastName: "",
                firstName: "",
                middleName: "",
                suffix: "",
              },
              placeOfBirth: {
                city: "",
                county: "",
                state: "",
                country: "",
              },
              dateOfBirth: {
                date: "",
                estimated: false,
              },
              citizenship: [
                {
                  _id: Math.random(),
                  country: "",
                },
              ],
              documentation: {
                type: "Other",
                documentNumber: "",
                documentExpirationDate: {
                  date: "",
                  estimated: false,
                },
                otherExplanation: "",
              },
              usSocialSecurityNumber: "",
              otherNames: [
                {
                  _id: Math.random(),
                  lastName: "",
                  firstName: "",
                  middleName: "",
                  suffix: "",
                  maidenName: false,
                  fromDate: {
                    date: "",
                    estimated: false,
                  },
                  toDate: {
                    date: "",
                    estimated: false,
                  },
                },
              ],
              cohabitationStartDate: {
                date: "",
                estimated: false,
              },
            },
          ],
        },
      },
      relativesInfo: {
        _id: Math.random(),
        relativeTypes: [],
        entries: [
          {
            _id: Math.random(),
            type: "",
            fullName: {
              firstName: "",
              middleName: "",
              lastName: "",
              suffix: "",
            },
            dateOfBirth: "",
            placeOfBirth: {
              city: "",
              state: "",
              country: "",
            },
            countriesOfCitizenship: [],
            isDeceased: false,
            isUSCitizen: false,
            hasForeignAddress: false,
            hasUSAddress: false,
            details: {
              section18_1: {
                ifMother: {
                  lastName: "",
                  firstName: "",
                  middleName: "",
                  suffix: "",
                  sameAsListed: false,
                  iDontKnow: false,
                },
                hasOtherNames: false,
                otherNamesUsed: [
                  {
                    _id: Math.random(),
                    lastName: "",
                    firstName: "",
                    middleName: "",
                    suffix: "",
                    maidenName: false,
                    from: "",
                    to: "",
                    estimatedFrom: false,
                    estimatedTo: false,
                    reasonForChange: "",
                  },
                ],
              },
              section18_2: {
                _id: Math.random(),
                street: "",
                city: "",
                state: "",
                zipCode: "",
                country: "",
                hasAPOFPOAddress: false,
                apofpoAddress: {
                  address: "",
                  apofpoStateCode: "",
                  apofpoZipCode: "",
                },
                dontKnowAPOFPO: false,
              },
              section18_3: {
                citizenshipDocuments: [
                  {
                    type: "FS240or545",
                    documentNumber: "",
                  },
                ],
                courtDetails: {
                  street: "",
                  city: "",
                  state: "",
                  zipCode: "",
                },
              },
              section18_4: {
                usDocumentation: [
                  {
                    type: "I551PermanentResident",
                  },
                ],
                documentNumber: "",
                documentExpirationDate: "",
                firstContactDate: "",
                lastContactDate: "",
                contactMethods: [],
                contactFrequency: {
                  frequency: "Daily",
                  explanation: "",
                },
                currentEmployer: {
                  name: "",
                  address: {
                    street: "",
                    city: "",
                    state: "",
                    zipCode: "",
                    country: "",
                  },
                  unknown: false,
                },
                recentEmployer: {
                  name: "",
                  address: {
                    street: "",
                    city: "",
                    state: "",
                    zipCode: "",
                    country: "",
                  },
                  unknown: false,
                },
                foreignGovernmentAffiliation: {
                  description: "",
                  relatedTo: "Government",
                },
              },
              section18_5: {
                firstContactDate: "",
                lastContactDate: "",
                contactMethods: [],
                contactFrequency: {
                  frequency: "Daily",
                  explanation: "",
                },
                employerDetails: {
                  name: "",
                  address: {
                    street: "",
                    city: "",
                    state: "",
                    zipCode: "",
                    country: "",
                  },
                  unknown: false,
                },
                foreignGovernmentAffiliation: {
                  description: "",
                  relatedTo: "Government",
                },
              },
            },
          },
        ],
      },
      foreignContacts: {
        hasForeignContact: false,
        entries: [
          {
            _id: 1, // Default ID, can be dynamically assigned
            lastName: "",
            firstName: "",
            middleName: null,
            suffix: null,
            approximateFirstContactDate: null,
            approximateLastContactDate: null,
            contactMethods: [],
            contactFrequency: [],
            relationshipNature: [],
            otherNames: [
              {
                lastName: "",
                firstName: "",
                middleName: null,
                suffix: null,
              },
            ],
            citizenships: [
              {
                country: "",
              },
            ],
            dateOfBirth: null,
            placeOfBirth: {
              city: null,
              country: null,
            },
            currentAddress: {
              street: null,
              city: null,
              state: null,
              zipCode: null,
              country: null,
            },
            apoFpoAddress: {
              address: null,
              stateCode: null,
              zipCode: null,
            },
            currentEmployer: {
              name: null,
              address: {
                street: null,
                city: null,
                state: null,
                zipCode: null,
                country: null,
              },
            },
            affiliatedWithForeignGov: null,
            foreignGovAffiliationDetails: null,
          },
        ],
      },
      foreignActivities: {
        _id: Math.random(),
        hasForeignFinancialInterest: false,
        hasForeignInterestOnBehalf: false,
        wantForeignRealEstate: false,
        hasForeignSupport: false,
        providedForeignSupport: false,
        providedForeignAdvice: false,
        familyProvidedForeignAdvice: false,
        offeredForeignJob: false,
        offeredBuisnessVenture: false,
        foreignConferences: false,
        contactForeignGovernment: false,
        sponsoredForeignNational: false,
        foreignPoliticalOffice: false,
        foreignVote: false,
        traveledOutsideUSA: false,
        traveledOutsideUSA_Government: false,
        section20A1: [
          {
            id_: Math.random(),
            ownershipType: [{ _id: Math.random(), type: "" }],
            financialInterestType: "",
            dateAcquired: { date: "", estimated: false },
            howAcquired: "",
            costAtAcquisition: { value: 0, estimated: false },
            currentValue: { value: 0, estimated: false },
            dateControlRelinquished: { date: "", estimated: false },
            disposalExplanation: "",
            hasCoOwners: false,
            coOwners: [
              {
                _id: Math.random(),
                lastName: "",
                firstName: "",
                middleName: "",
                suffix: "",
                address: {
                  street: "",
                  city: "",
                  state: "",
                  zipCode: "",
                  country: "",
                },
                citizenships: [
                  {
                    _id: Math.random(),
                    type: "",
                  },
                ],
                relationship: "",
              },
            ],
          },
        ],
        section20A2: [
          {
            id_: Math.random(),
            ownershipType: [{ type: "" }],
            financialInterestType: "",
            controllerInfo: {
              lastName: "",
              firstName: "",
              middleName: "",
              suffix: "",
              relationship: "",
            },
            dateAcquired: { date: "", estimated: false },
            costAtAcquisition: { value: 0, estimated: false },
            currentValue: { value: 0, estimated: false },
            dateDisposed: { date: "", estimated: false },
            disposalExplanation: "",
            hasCoOwners: false,
            coOwners: [
              {
                _id: Math.random(),
                lastName: "",
                firstName: "",
                middleName: "",
                suffix: "",
                address: {
                  street: "",
                  city: "",
                  state: "",
                  zipCode: "",
                  country: "",
                },
                citizenships: [
                  {
                    _id: Math.random(),
                    type: "",
                  },
                ],
                relationship: "",
              },
            ],
          },
        ],
        section20A3: [
          {
            id_: Math.random(),
            ownershipType: [{ _id: Math.random(), type: "" }],
            realEstateType: "",
            location: {
              street: "",
              city: "",
              state: "",
              zipCode: "",
              country: "",
            },
            dateOfPurchase: { date: "", estimated: false },
            howAcquired: "",
            dateSold: { date: "", estimated: false },
            costAtAcquisition: { value: 0, estimated: false },
            hasCoOwners: true,
            coOwners: [
              {
                _id: Math.random(),
                lastName: "",
                firstName: "",
                middleName: "",
                suffix: "",
                address: {
                  street: "",
                  city: "",
                  state: "",
                  zipCode: "",
                  country: "",
                },
                citizenships: [{ _id: Math.random(), type: "" }],
                relationship: "",
              },
            ],
          },
        ],
        section20A4: [
          {
            id_: Math.random(), // Unique identifier for each entry
            ownershipType: [
              {
                _id: Math.random(),
                type: "", // Default as empty, expected to be one of the specified types later
              },
            ],
            benefitType: {
              _id: Math.random(),
              type: "", // Default as empty, will be one of "Educational", "Medical", etc.
              other: "", // Optional, included but empty by default
            },
            benefitFrequency: {
              type: "", // Default as empty, will be one of "Onetime benefit", "Future benefit", etc.
              other: "", // Optional, included but empty by default
            },
            oneTimeBenefit: {
              dateReceived: {
                date: "", // Default as empty, to be filled in with specific date
                estimated: false, // Sensible default
              },
              countryProviding: "", // Default as empty
              totalValue: {
                value: 0, // Sensible default as 0
                estimated: false, // Sensible default
              },
              reason: "", // Default as empty
              obligatedToForeignCountry: false, // Sensible default
              explanation: "", // Optional, included but empty by default
              frequency: {
                _id: Math.random(),
                type: "", // Default as empty, will be "Annually", "Monthly", etc.
                other: "", // Optional, included but empty by default
              },
            },
            futureBenefit: {
              dateReceived: {
                date: "",
                estimated: false,
              },
              countryProviding: "",
              totalValue: {
                value: 0,
                estimated: false,
              },
              reason: "",
              obligatedToForeignCountry: false,
              explanation: "",
              frequency: {
                _id: Math.random(),
                type: "",
                other: "",
              },
            },
            continuingBenefit: {
              dateReceived: {
                date: "",
                estimated: false,
              },
              countryProviding: "",
              totalValue: {
                value: 0,
                estimated: false,
              },
              reason: "",
              obligatedToForeignCountry: false,
              explanation: "",
              frequency: {
                _id: Math.random(),
                type: "",
                other: "",
              },
            },
          },
        ],
        section20A5: [
          {
            id_: Math.random(),
            lastName: "",
            firstName: "",
            middleName: "",
            suffix: "",
            address: { street: "", city: "", country: "" },
            relationship: "",
            amountProvided: { value: 0, estimated: false },
            citizenships: [{ _id: Math.random(), type: "" }],
            frequency: { type: "", explanation: "" },
          },
        ],
        section20B1: [
          {
            id_: Math.random(),
            description: "",
            individual: {
              lastName: "",
              firstName: "",
              middleName: "",
              suffix: "",
              relationship: "",
            },
            organization: "",
            organizationCountry: "",
            dateFrom: { date: "", estimated: false },
            dateTo: { date: "", estimated: false },
            compensation: "",
          },
        ],
        section20B2: [
          {
            id_: Math.random(),
            lastName: "",
            firstName: "",
            middleName: "",
            suffix: "",
            agency: "",
            country: "",
            dateOfRequest: { date: "", estimated: false },
            circumstances: "",
          },
        ],
        section20B3: [
          {
            id_: Math.random(),
            lastName: "",
            firstName: "",
            middleName: "",
            suffix: "",
            positionDescription: "",
            dateOffered: { date: "", estimated: false },
            accepted: false,
            explanation: "",
            location: { street: "", city: "", country: "" },
          },
        ],
        section20B4: [
          {
            id_: Math.random(),
            lastName: "",
            firstName: "",
            middleName: "",
            suffix: "",
            address: { street: "", city: "", country: "" },
            citizenships: [],
            ventureDescription: "",
            dateFrom: { date: "", estimated: false },
            dateTo: { date: "", estimated: false },
            natureOfAssociation: "",
            positionHeld: "",
            financialSupport: { value: 0, estimated: false },
            compensationDescription: "",
          },
        ],
        section20B5: [
          {
            id_: Math.random(),
            eventDescription: "",
            eventDates: {
              fromDate: { date: "", estimated: false },
              toDate: { date: "", estimated: false },
              present: false,
            },
            purpose: "",
            sponsoringOrganization: "",
            eventLocation: { street: "", city: "", country: "" },
            hasContacts: false,
            subsequentContacts: [
              { _id: Math.random(), contactExplanation: "" },
            ],
          },
        ],
        section20B6: [
          {
            id_: Math.random(),
            individual: {
              lastName: "",
              firstName: "",
              middleName: "",
              suffix: "",
              relationship: "",
            },
            contactLocation: { street: "", city: "", country: "" },
            contactDate: { date: "", estimated: false },
            establishmentType: "",
            foreignRepresentatives: "",
            purposeCircumstances: "",
            hasContact: false,
            subsequentContact: [
              {
                _id: Math.random(),
                purpose: "",
                dateOfMostRecentContact: { date: "", estimated: false },
                plansForFutureContact: "",
              },
            ],
          },
        ],
        section20B7: [
          {
            id_: Math.random(),
            lastName: "",
            firstName: "",
            middleName: "",
            suffix: "",
            dateOfBirth: { date: "", estimated: false },
            placeOfBirth: {
              street: "",
              city: "",
              state: "",
              zipCode: "",
              country: "",
            },
            currentAddress: {
              street: "",
              city: "",
              state: "",
              zipCode: "",
              country: "",
            },
            citizenships: [{ _id: Math.random(), type: "" }],
            sponsoringOrganization: {
              name: "",
              notApplicable: false,
              address: {
                street: "",
                city: "",
                state: "",
                zipCode: "",
                country: "",
              },
            },
            datesOfStay: {
              fromDate: { date: "", estimated: false },
              toDate: { date: "", estimated: false },
              present: false,
            },
            addressDuringStay: {
              street: "",
              city: "",
              state: "",
              zipCode: "",
              country: "",
            },
            purposeOfStay: "",
            purposeOfSponsorship: "",
          },
        ],
        section20B8: [
          {
            id_: Math.random(),
            positionHeld: "",
            datesHeld: {
              fromDate: { date: "", estimated: false },
              toDate: { date: "", estimated: false },
              present: false,
            },
            reasonForActivities: "",
            currentEligibility: "",
            countryInvolved: "",
          },
        ],
        section20B9: [
          {
            id_: Math.random(),
            dateVoted: { date: "", estimated: false },
            countryInvolved: "",
            reasons: "",
            currentEligibility: "",
          },
        ],
        section20C: [
          {
            id_: Math.random(),
            countryVisited: "",
            travelDates: {
              fromDate: { date: "", estimated: false },
              toDate: { date: "", estimated: false },
              present: false,
            },
            numberOfDays: "",
            purposeOfTravel: [],
            questionedOrSearched: false,
            questionedOrSearchedExplanation: "",
            encounterWithPolice: false,
            encounterWithPoliceExplanation: "",
            contactWithForeignIntelligence: false,
            contactWithForeignIntelligenceExplanation: "",
            counterintelligenceIssues: false,
            counterintelligenceIssuesExplanation: "",
            contactExhibitingInterest: false,
            contactExhibitingInterestExplanation: "",
            contactAttemptingToObtainInfo: false,
            contactAttemptingToObtainInfoExplanation: "",
            threatenedOrCoerced: false,
            threatenedOrCoercedExplanation: "",
          },
        ],
      },
      mentalHealth: {
        _id: Math.random(),
        declaredMentallyIncompetent: false,
        consultMentalHealth: false,
        hospitalizedMentalHealth: false,
        beenDiagnosed: false,
        delayedTreatment: false,
        currentlyInTreatment: false,
        substantialAffects: false,
        counseling: false,
        section21A: [
          {
            _id: Math.random(),
            dateOccurred: "",
            estimated: false,
            courtAgency: {
              name: "",
              address: {
                street: "",
                city: "",
                state: "",
                zipCode: "",
                country: "",
              },
            },
            appealed: false,
            appeals: [
              {
                _id: Math.random(),
                courtAgency: {
                  name: "",
                  address: {
                    street: "",
                    city: "",
                    state: "",
                    zipCode: "",
                    country: "",
                  },
                },
                finalDisposition: "",
              },
            ],
          },
        ],
        section21B: [
          {
            _id: Math.random(),
            dateOccurred: "",
            estimated: false,
            courtAgency: {
              name: "",
              address: {
                street: "",
                city: "",
                state: "",
                zipCode: "",
                country: "",
              },
            },
            finalDisposition: "",
            appealed: false,
            appeals: [
              {
                _id: Math.random(),
                courtAgency: {
                  name: "",
                  address: {
                    street: "",
                    city: "",
                    state: "",
                    zipCode: "",
                    country: "",
                  },
                },
                finalDisposition: "",
              },
            ],
          },
        ],
        section21C: [
          {
            voluntary: false,
            explanation: "",
            facility: {
              name: "",
              address: {
                street: "",
                city: "",
                state: "",
                zipCode: "",
                country: "",
              },
            },
            fromDate: "",
            toDate: "",
            present: false,
            estimatedFrom: false,
            estimatedTo: false,
          },
        ],
        section21D: [
          {
            diagnosis: "",
            datesOfDiagnosis: {
              fromDate: "",
              toDate: "",
              present: false,
              estimatedFrom: false,
              estimatedTo: false,
            },
            healthCareProfessional: {
              name: "",
              telephoneNumber: "",
              extension: "",
              day: false,
              night: false,
              internationalOrDsnPhoneNumber: false,
              address: {
                street: "",
                city: "",
                state: "",
                zipCode: "",
                country: "",
              },
            },
            agencyOrFacility: {
              name: "",
              address: {
                street: "",
                city: "",
                state: "",
                zipCode: "",
                country: "",
              },
              telephoneNumber: "",
              extension: "",
              day: false,
              night: false,
              internationalOrDsnPhoneNumber: false,
            },
            counselingEffective: false,
            counselingExplanation: "",
          },
        ],
        section21D1: [
          {
            healthCareProfessional: {
              name: "",
              telephoneNumber: "",
              extension: "",
              day: false,
              night: false,
              internationalOrDsnPhoneNumber: false,
              address: {
                street: "",
                city: "",
                state: "",
                zipCode: "",
                country: "",
              },
            },
          },
        ],
        section21E: [
          {
            fromDate: "",
            toDate: "",
            present: false,
            estimatedFrom: false,
            estimatedTo: false,
            healthCareProfessional: {
              name: "",
              telephoneNumber: "",
              extension: "",
              day: false,
              night: false,
              internationalOrDsnPhoneNumber: false,
              address: {
                street: "",
                city: "",
                state: "",
                zipCode: "",
                country: "",
              },
            },
            agencyOrFacility: {
              name: "",
              address: {
                street: "",
                city: "",
                state: "",
                zipCode: "",
                country: "",
              },
              telephoneNumber: "",
              extension: "",
              day: false,
              night: false,
              internationalOrDsnPhoneNumber: false,
            },
            choseNotToFollow: false,
            explanation: "",
          },
        ],
      },
      policeRecord: {
        _id: Math.random(),
        part1Questions: false,
        part2Questions: false,
        restrainingOrder: false,
        section22_1: [
          {
            dateOfOffense: { date: "", estimated: false },
            description: "",
            involvedDomesticViolence: false,
            involvedFirearms: false,
            involvedAlcoholDrugs: false,
            offenseLocation: {
              city: "",
              county: "",
              state: "",
              zip: "",
              country: "",
            },
            arrestedSummonedCited: false,
            lawEnforcementAgencyName: "",
            lawEnforcementLocation: {
              city: "",
              county: "",
              state: "",
              zip: "",
              country: "",
            },
            chargedConvicted: false,
            courtName: "",
            courtLocation: {
              city: "",
              county: "",
              state: "",
              zip: "",
              country: "",
            },
            charges: [
              {
                _id: Math.random(),
                felonyMisdemeanor: "Felony",
                charge: "",
                outcome: "",
                dateInfo: { date: "", estimated: false },
              },
            ],
            sentenced: false,
            sentenceDescription: "",
            imprisonmentTermExceeding1Year: false,
            imprisonmentLessThan1Year: false,
            imprisonmentDates: {
              from: "",
              to: "",
              estimated: false,
              present: false,
            },
            probationParoleDates: {
              from: "",
              to: "",
              estimated: false,
              present: false,
            },
            awaitingTrial: false,
            awaitingTrialExplanation: "",
          },
        ],
        section22_2: [
          {
            dateOfOffense: { date: "", estimated: false },
            description: "",
            involvedDomesticViolence: false,
            involvedFirearms: false,
            involvedAlcoholDrugs: false,
            courtName: "",
            courtLocation: {
              city: "",
              county: "",
              state: "",
              zip: "",
              country: "",
            },
            charges: [
              {
                _id: Math.random(),
                felonyMisdemeanor: "Felony",
                charge: "",
                outcome: "",
                dateInfo: { date: "", estimated: false },
              },
            ],
            sentenced: false,
            sentenceDescription: "",
            imprisonmentTermExceeding1Year: false,
            imprisonmentLessThan1Year: false,
            imprisonmentDates: [
              { from: "", to: "", estimated: false, present: false },
            ],
            probationParoleDates: [
              { from: "", to: "", estimated: false, present: false },
            ],
            awaitingTrial: false,
            awaitingTrialExplanation: "",
          },
        ],
        section22_3: [
          {
            hasRestrainingOrder: false,
            orders: [
              {
                explanation: "",
                dateIssued: { date: "", estimated: false },
                courtAgencyName: "",
                courtAgencyLocation: {
                  city: "",
                  county: "",
                  state: "",
                  zip: "",
                  country: "",
                },
              },
            ],
          },
        ],
      },
      drugActivity: {
        _id: Math.random(),
        hasUsed: false,
        hasInvolvement: false,
        illegalWhileProcessing: false,
        usedWhilePublicSaftey: false,
        usedNotPerscribed: false,
        suggestedCounsoling: false,
        voluntaryCounsoling: false,
        section23_1: [
          {
            typeOfDrug: [
              {
                _id: Math.random(),
                type: "",
              },
            ],
            otherDrugExplanation: "",
            firstUse: {
              date: "",
              estimated: false,
            },
            mostRecentUse: {
              date: "",
              estimated: false,
            },
            natureOfUseFrequencyTimes: "",
            useWhileEmployedInPublicSafety: false,
            useWhilePossessingSecurityClearance: false,
            intendToUseInFuture: false,
            futureUseExplanation: "",
          },
        ],
        section23_2: [
          {
            typeOfDrug: [],
            otherDrugExplanation: "",
            firstInvolvement: {
              date: "",
              estimated: false,
            },
            mostRecentInvolvement: {
              date: "",
              estimated: false,
            },
            natureAndFrequencyOfActivity: "",
            reasonsForActivity: "",
            involvementWhileEmployedInPublicSafety: false,
            involvementWhilePossessingSecurityClearance: false,
            intendToEngageInFuture: false,
            futureEngagementExplanation: "",
          },
        ],
        section23_3: [
          {
            descriptionOfInvolvement: "",
            dateRange: {
              from: "",
              to: "",
              estimated: false,
              present: false,
            },
            numberOfTimesInvolved: "",
          },
        ],
        section23_4: [
          {
            descriptionOfInvolvement: "",
            dateRange: {
              from: "",
              to: "",
              estimated: false,
              present: false,
            },
            numberOfTimesInvolved: "",
          },
        ],
        section23_5: [
          {
            nameOfPrescriptionDrug: "",
            dateRange: {
              from: "",
              to: "",
              estimated: false,
              present: false,
            },
            reasonsForMisuse: "",
            involvementWhileEmployedInPublicSafety: false,
            involvementWhilePossessingSecurityClearance: false,
          },
        ],
        section23_6: [
          {
            orderedBy: [{ _id: Math.random(), type: "" }],
            orderedExplanation: "",
            receivedTreatment: false,
            noTreatmentExplanation: "",
            typeOfDrug: [{ _id: Math.random(), type: "" }],
            otherDrugExplanation: "",
            treatmentProviderName: {
              firstName: "",
              lastName: "",
            },
            treatmentProviderAddress: {
              street: "",
              city: "",
              state: "",
              zipCode: "",
              country: "",
            },
            treatmentProviderPhone: {
              number: "",
              international: false,
              timeOfDay: "Day",
            },
            dateRange: {
              from: "",
              to: "",
              estimated: false,
              present: false,
            },
            successfullyCompleted: false,
            completionExplanation: "",
          },
        ],
        section23_7: [
          {
            typeOfDrug: [
              {
                _id: Math.random(),
                type: "",
              },
            ],
            otherDrugExplanation: "",
            treatmentProviderName: {
              firstName: "",
              lastName: "",
            },
            treatmentProviderAddress: {
              street: "",
              city: "",
              state: "",
              zipCode: "",
              country: "",
            },
            treatmentProviderPhone: {
              number: "",
              international: false,
              timeOfDay: "Day",
            },
            dateRange: {
              from: "",
              to: "",
              estimated: false,
              present: false,
            },
            successfullyCompleted: false,
            completionExplanation: "",
          },
        ],
      },
      alcoholUse: {
        _id: Math.random(),
        negativeImpact: false,
        suggestedCounseling: false,
        voluntaryCounseling: false,
        additionalCounseling: false,
        section24_1: [
          {
            id_: Math.random(),
            negativeImpactDate: {
              date: "",
              estimated: false,
            },
            datesOfInvolvement: {
              from: "",
              to: "",
              estimated: false,
              present: false,
            },
            circumstances: "",
            negativeImpact: "",
          },
        ],
        section24_2: [
          {
            _id: Math.random(),
            orderedBy: [{ _id: Math.random(), type: "" }],
            actionTaken: false,
            noActionExplanation: "",
            actionDetails: {
              dateRange: {
                from: {
                  date: "",
                  estimated: false,
                },
                to: {
                  date: "",
                  estimated: false,
                },
                present: false,
              },
              providerName: "",
              providerAddress: {
                street: "",
                city: "",
                state: "",
                zipCode: "",
                country: "",
              },
              providerPhone: "",
              phoneExtension: "",
              internationalPhone: false,
              phoneDayNight: "Day",
              treatmentCompletion: false,
              completionExplanation: "",
            },
          },
        ],
        section24_3: [
          {
            _id: Math.random(),
            dateRange: {
              from: "",
              to: "",
              estimated: false,
              present: false,
            },
            providerName: "",
            providerAddress: {
              city: "",
              county: "",
              state: "",
              zip: "",
              country: "",
            },
            providerPhone: "",
            phoneExtension: "",
            internationalPhone: false,
            phoneDayNight: "Day",
            treatmentCompletion: false,
            completionExplanation: "",
          },
        ],
        section24_4: [
          {
            _id: Math.random(),
            counselorName: "",
            counselorAddress: {
              city: "",
              county: "",
              state: "",
              zip: "",
              country: "",
            },
            agencyName: "",
            agencyAddress: {
              city: "",
              county: "",
              state: "",
              zip: "",
              country: "",
            },
            dateRange: {
              from: "",
              to: "",
              estimated: false,
              present: false,
            },
            treatmentCompletion: false,
            completionExplanation: "",
          },
        ],
      },
      investigationsInfo: {
        _id: Math.random(),
        governmentInvestigated: false,
        revocation: false,
        debarred: false,
        section25_1: [
          {
            investigatingAgency: [{ _id: Math.random(), agency: "" }],
            otherAgency: "",
            issuedAgency: "",
            investigationCompletionDate: "",
            clearanceEligibilityDate: "",
            levelOfClearance: [{ _id: Math.random(), level: "" }],
          },
        ],
        section25_2: [
          {
            denialDate: "",
            agency: "",
            explanation: "",
          },
        ],
        section25_3: [
          {
            debarmentDate: "",
            agency: "",
            explanation: "",
          },
        ],
      },
      finances: {
        _id: Math.random(),
        filedBankruptcy: false,
        gamblingProblem: false,
        missedTaxes: false,
        companyViolation: false,
        counseling: false,
        delinquent: false,
        reposessions: false,
        section26_1: [
          {
            _id: Math.random(),
            bankruptcyPetitionType: [
              {
                _id: Math.random(),
                type: "",
              },
            ],
            courtDocketNumber: "",
            dateFiled: { date: "", estimated: false },
            dateDischarged: { date: "", estimated: false },
            amountInvolved: { amount: 0, estimated: false },
            debtRecordedUnder: {
              lastName: "",
              firstName: "",
              middleName: "",
              suffix: "",
            },
            courtName: "",
            courtAddress: {
              street: "",
              city: "",
              state: "",
              zipCode: "",
              country: "",
            },
            chapter13Details: {
              trusteeName: "",
              trusteeAddress: {
                street: "",
                city: "",
                state: "",
                zipCode: "",
                country: "",
              },
            },
            dischargedOfAllDebts: false,
            dischargeExplanation: "",
          },
        ],
        section26_2: [
          {
            _id: Math.random(),
            financialProblemsDueToGambling: false,
            dateRange: {
              from: { date: "", estimated: false },
              to: { date: "", estimated: false },
              present: false,
            },
            gamblingLosses: { amount: 0, estimated: false },
            descriptionOfFinancialProblems: "",
            actionsTaken: "",
          },
        ],
        section26_3: [
          {
            _id: Math.random(),
            failedToFileOrPay: [
              {
                _id: Math.random(),
                type: "File",
              },
            ],
            yearFailed: { date: "", estimated: false },
            failureReason: "",
            agencyName: "",
            taxType: "",
            amount: { amount: 0, estimated: false },
            dateSatisfied: { date: "", estimated: false },
            actionsTaken: "",
          },
        ],
        section26_4: [
          {
            _id: Math.random(),
            agencyOrCompanyName: "",
            agencyOrCompanyAddress: {
              street: "",
              city: "",
              state: "",
              zipCode: "",
              country: "",
            },
            counselingWarningDisciplinaryDate: { date: "", estimated: false },
            counselingWarningDisciplinaryReason: "",
            violationAmount: { amount: 0, estimated: false },
            rectifyingActions: "",
          },
        ],
        section26_5: [
          {
            _id: Math.random(),
            explanation: "",
            creditCounselingOrganizationName: "",
            creditCounselingOrganizationPhoneNumber: {
              number: "",
              extension: "",
              isInternationalOrDSN: false,
              timeOfDay: "Day",
            },
            creditCounselingOrganizationLocation: {
              street: "",
              city: "",
              state: "",
              zipCode: "",
              country: "",
            },
            counselingActions: "",
          },
        ],
        section26_6: [
          {
            _id: Math.random(),
            agencyName: "",
            doesInclude: true,
            financialIssueTypes: [
              {
                _id: Math.random(),
                type: "",
              },
            ],
            loanAccountNumbers: "",
            propertyInvolved: "",
            amount: { amount: 0, estimated: false },
            issueReason: "",
            currentStatus: "",
            issueDate: { date: "", estimated: false },
            resolutionDate: { date: "", estimated: false },
            courtName: "",
            courtAddress: {
              street: "",
              city: "",
              state: "",
              zipCode: "",
              country: "",
            },
            actionsTaken: "",
          },
        ],
        section26_7: [
          {
            _id: Math.random(),
            agencyName: "",
            doesInclude: true,
            financialIssueTypes: [
              {
                _id: Math.random(),
                type: "",
              },
            ],
            loanAccountNumbers: "",
            propertyInvolved: "",
            amount: { amount: 0, estimated: false },
            issueReason: "",
            currentStatus: "",
            issueDate: { date: "", estimated: false },
            resolutionDate: { date: "", estimated: false },
            courtName: "",
            courtAddress: {
              street: "",
              city: "",
              state: "",
              zipCode: "",
              country: "",
            },
            actionsTaken: "",
          },
        ],
      },
      technology: {
        _id: Math.random(),
        illegalAccess: false,
        illegalModification: false,
        unauthorizedUse: false,
        section27_1: [
          {
            _id: Math.random(),

            incidentDate: { date: "", estimated: true },
            description: "",
            location: {
              street: "",
              city: "",
              state: "",
              zipCode: "",
              country: "",
            },
            actionDescription: "",
          },
        ],
        section27_2: [
          {
            _id: Math.random(),
            incidentDate: { date: "", estimated: false },
            description: "",
            location: {
              street: "",
              city: "",
              state: "",
              zipCode: "",
              country: "",
            },
            actionDescription: "",
          },
        ],
        section27_3: [
          {
            _id: Math.random(),
            incidentDate: { date: "", estimated: false },
            description: "",
            location: {
              street: "",
              city: "",
              state: "",
              zipCode: "",
              country: "",
            },
            actionDescription: "",
          },
        ],
      },
      civil: {
        _id: Math.random(),
        civilCourt: false,
        section28_1: [
          {
            dateOfAction: {
              date: "",
              estimated: false,
            },
            courtName: "",
            courtAddress: {
              street: "",
              city: "",
              state: "",
              zipCode: "",
              country: "",
            },
            description: "",
            principalParties: [
              {
                _id: Math.random(),
                name: "",
              },
            ],
          },
        ],
      },
      association: {
        _id: Math.random(),
        terrorismMember: false,
        actsOfTerrorism: false,
        overthrowByForce: false,
        dedicatedViolent: false,
        advocatesViolence: false,
        engagedInOverthrow: false,
        terrorismAssociate: false,
        section29_1: [
          {
            activityDescription: "",
            dateRange: {
              from: {
                date: "",
                estimated: false,
              },
              to: {
                date: "",
                estimated: false,
              },
              present: false,
            },
          },
        ],
        section29_2: [
          {
            organizationName: "",
            organizationAddress: {
              street: "",
              city: "",
              state: "",
              zipCode: "",
              country: "",
            },
            involvementDateRange: {
              from: {
                date: "",
                estimated: false,
              },
              to: {
                date: "",
                estimated: false,
              },
              present: false,
            },
            positionsHeld: "",
            contributions: "",
            natureOfInvolvement: "",
          },
        ],
        section29_3: [
          {
            reasonsForAdvocacy: "",
            dateRange: {
              from: {
                date: "",
                estimated: false,
              },
              to: {
                date: "",
                estimated: false,
              },
              present: false,
            },
          },
        ],
        section29_4: [
          {
            organizationName: "",
            organizationAddress: {
              street: "",
              city: "",
              state: "",
              zipCode: "",
              country: "",
            },
            involvementDateRange: {
              from: {
                date: "",
                estimated: false,
              },
              to: {
                date: "",
                estimated: false,
              },
              present: false,
            },
            positionsHeld: "",
            contributions: "",
            natureOfInvolvement: "",
          },
        ],
        section29_5: [
          {
            organizationName: "",
            organizationAddress: {
              street: "",
              city: "",
              state: "",
              zipCode: "",
              country: "",
            },
            involvementDateRange: {
              from: {
                date: "",
                estimated: false,
              },
              to: {
                date: "",
                estimated: false,
              },
              present: false,
            },
            positionsHeld: "",
            contributions: "",
            natureOfInvolvement: "",
          },
        ],
        section29_6: [
          {
            activityDescription: "",
            dateRange: {
              from: {
                date: "",
                estimated: false,
              },
              to: {
                date: "",
                estimated: false,
              },
              present: false,
            },
          },
        ],
        section29_7: [
          {
            explanation: "",
          },
        ],
      },
      signature: {
        _id: Math.random(),
        information: false,
        medical: false,
        credit: false,
        section30_1: [
          {
            _id: 0,
            fullName: "",
            dateSigned: "",
            otherNamesUsed: "",
            address: {
              street: "",
              city: "",
              state: "",
              zipCode: "",
              country: "",
            },
            telephoneNumber: "",
          },
        ],
        section30_2: [
          {
            _id: 0,
            fullName: "",
            dateSigned: "",
            otherNamesUsed: "",
            address: {
              street: "",
              city: "",
              state: "",
              zipCode: "",
              country: "",
            },
            telephoneNumber: "",
          },
        ],
        section30_3: [
          {
            _id: 0,
            fullName: "",
            dateSigned: "",
          },
        ],
      },
    };

    return templates[path as keyof typeof templates] || {};
  };

  const isReadOnlyField = (key: string) => {
    return key.endsWith("_id") || key === "createdAt" || key === "updatedAt";
  };

  const renderField = (key: string, value: any, path: string) => {
    if (!value || !formData) return null;

    const props = {
      data: value,
      onInputChange: handleInputChange,
      onAddEntry: handleAddEntry,
      onRemoveEntry: handleRemoveEntry,
      isValidValue: isValidValue,
      getDefaultNewItem: getDefaultNewItem,
      isReadOnlyField: isReadOnlyField,
      path: path,
      formInfo: FormInfo,
    };

    // Ensure applicantID exists
    const employeeId = formData.personalInfo?.applicantID;
    if (!employeeId) {
      return null;
    }

    switch (key) {
      case "personalInfo":
        return <RenderBasicInfo key={path} {...props} />;
      case "birthInfo":
        return <RenderBirthInfo key={path} {...props} />;
      case "aknowledgementInfo":
        return <RenderAcknowledgementInfo key={path} {...props} />;
      case "namesInfo":
        return <RenderNames key={path} {...props} />;
      case "physicalAttributes":
        return <RenderPhysicalsInfo key={path} {...props} />;
      case "contactInfo":
        return <RenderContactInfo key={path} {...props} />;
      case "passportInfo":
        return <RenderPassportInfo key={path} {...props} />;

      //   case "citizenshipInfo":
      //     return <RenderCitizenshipInfo  key={path} {...props} />;
      //   case "dualCitizenshipInfo":
      //     return <RenderDualCitizenshipInfo  key={path} {...props} />;
      //   case "residencyInfo":
      //     return <RenderResidencyInfo  key={path} {...props} />;
      //   case "schoolInfo":
      //     return <RenderSchoolInfo  key={path} {...props} />;
      //   case "employmentInfo":
      //     return <RenderEmploymentInfo  key={path} {...props} />;
      //   case "serviceInfo":
      //     return <RenderServiceInfo  key={path} {...props} />;
      //   case "militaryHistoryInfo":
      //     return <RenderMilitaryInfo  key={path} {...props} />;
      //   case "peopleThatKnow":
      //     return <RenderPeopleThatKnow  key={path} {...props} />;
      //   case "relationshipInfo":
      //     return <RenderRelationshipInfo  key={path} {...props} />;
      //   case "relativesInfo":
      //     return <RenderRelativesInfo  key={path} {...props} />;
      //   case "foreignContacts":
      //     return <RenderForeignContacts  key={path} {...props} />;
      //   case "foreignActivities":
      //     return <RenderForeignActivities  key={path} {...props} />;
      //   case "mentalHealth":
      //     return <RenderMentalHealth  key={path} {...props} />;
      //   case "policeRecord":
      //     return <RenderPolice  key={path} {...props} />;
      //   case "drugActivity":
      //     return <RenderDrugActivity  key={path} {...props} />;
      //   case "alcoholUse":
      //     return <RenderAlcoholUse  key={path} {...props} />;
      //   case "investigationsInfo":
      //     return <RenderInvestigationsInfo  key={path} {...props} />;
      //   case "finances":
      //     return <RenderFinances  key={path} {...props} />;
      //   case "technology":
      //     return <RenderTechnology  key={path} {...props} />;
      //   case "civil":
      //     return <RenderCivil  key={path} {...props} />;
      //   case "association":
      //     return <RenderAssociation  key={path} {...props} />;
      case "print":
        return <RenderPrintPDF key={path} {...props} />;
      default:
        return (
          <div key={path} className="text-gray-500 p-4">
            No data available for this section
          </div>
        );
    }
  };

  const handleStepChange = (step: number) => {
    dispatch(goToStep(step));
  };

  // Only render form when formData and currentStep are valid
  if (
    !formData ||
    formSections.length === 0 ||
    currentStep >= formSections.length
  ) {
    return (
      <div className="text-gray-500 p-4">Loading form or invalid step...</div>
    );
  }

  // For debugging - logs the current step and section
  console.log(
    `Rendering step ${currentStep} - Section: ${formSections[currentStep]}`
  );

  return (
    <>
      {renderField(
        formSections[currentStep],
        formData[formSections[currentStep] as keyof typeof formData],
        formSections[currentStep]
      )}
      <StepperFooter
        onStepChange={handleStepChange}
        totalSteps={formSections.length}
      />
    </>
  );
};

export default DynamicForm3;
