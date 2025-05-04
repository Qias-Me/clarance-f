import React, { useState } from "react";
import lodash from "lodash";
import { goToStep, selectCurrentStep } from "../state/user/formSlice";
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
import {RenderPrintPDF} from "~/components/Rendered/RenderPrintPDF";

import { useEmployee } from "~/state/contexts/new-context";
import { type ApplicantFormValues } from "api/interfaces/formDefinition";
import type { FormInfo } from "api/interfaces/FormInfo";

const { set, get, cloneDeep, merge } = lodash;

interface DynamicFormProps {
  data: ApplicantFormValues;
  onChange: (data: ApplicantFormValues) => void;
  FormInfo: FormInfo;
}

const DynamicForm3: React.FC<DynamicFormProps> = ({
  data,
  onChange,
  FormInfo,
}) => {
  const [formData, setFormData] = useState<ApplicantFormValues>(
    cloneDeep(data)
  );
  const dispatch = useDispatch();
  const currentStep = useTypedSelector(selectCurrentStep);

  const { updateField } = useEmployee();

  const formSections = Object.keys(formData);

  const handleInputChange = (path: string, value: any) => {
    // console.log("Before update:", { ...formData.employmentInfo });
    const updatedFormData = set({ ...formData }, path, value);
    // console.log("After update:", updatedFormData.employmentInfo);
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
    const updatedFormData = cloneDeep(formData);
    let currentData = get(updatedFormData, path);

    console.log(`Path: ${path}`);
    console.log(`Current Data before push: ${JSON.stringify(currentData)}`);
    console.log(`Updated Item to be added: ${JSON.stringify(updatedItem)}`);

    if (Array.isArray(updatedItem)) {
      console.log("THIS IS AN ARRAY");

      // Ensure updatedItem is not an array itself
      const itemToPush = Array.isArray(updatedItem)
        ? updatedItem[0]
        : updatedItem;

      console.log(`Item to be pushed: ${JSON.stringify(itemToPush)}`);

      // Initialize currentData as an array if it is undefined
      if (!Array.isArray(currentData)) {
        currentData = [];
      }

      // Push the itemToPush into the currentData array
      currentData.push(itemToPush);
      set(updatedFormData, path, currentData);

      console.log(`Current Data after push: ${JSON.stringify(currentData)}`);
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
    const updatedFormData = cloneDeep(formData);
    const list = get(updatedFormData, path, []);

    console.log(list, "LIST");
    console.log(path, "path");

    console.log(updatedFormData.foreignActivities.section20A1, "HELP");
    if (list && Array.isArray(list)) {
      list.splice(index, 1);
      set(updatedFormData, path, list);
      setFormData(updatedFormData);
      updateField(path, list);
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
            telephoneNumber: ""
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
            telephoneNumber: ""
          },
        ],
        section30_3: [
          {
            _id: 0,
            fullName: "",
            dateSigned: ""
          },
        ],
      },
    };

    console.log(`Path: ${path}`);

    const pathSegments = path.split(".");
    const lastSegment = pathSegments.slice(-1)[0];
    const isNestedPath = pathSegments.length > 1;

    console.log(`Path segments: ${pathSegments}`);
    console.log(`Last segment: ${lastSegment}`);
    console.log(`Is nested path: ${isNestedPath}`);

    const nestedTemplates = {
      dualCitizenshipInfo: ["citizenships", "passports", "passportUses"],
      residencyInfo: ["residenceAddress", "contact"],
      contactInfo: ["contactNumbers"],
      schoolInfo: ["degrees", "schoolEntry"],
      employmentInfo: [
        "section13A1",
        "section13A2",
        "section13A3",
        "section13A4",
        "section13A5",
        "section13A6",
        "additionalPeriods",
        "section13B",
        "section13C",
        "employmentEntries",
        "contacts",
      ],
      militaryHistoryInfo: ["section15_1", "section15_2", "section15_3"],
      relationshipInfo: ["section17_1", "otherNames"],
      relativesInfo: ["entries", "section18_1", "section18_2", "section18_3"],
      foreignContacts: ["entries", "otherNames", "citizenships"],
      foreignActivities: [
        "section20A1",
        "section20A2",
        "section20A3",
        "section20A4",
        "section20A5",
        "section20B1",
        "section20B2",
        "section20B3",
        "section20B4",
        "section20B5",
        "section20B6",
        "section20B7",
        "section20B8",
        "section20B9",
        "section20C",
        "coOwners",
        "ownershipType",
        "subsequentContacts",
      ],
      mentalHealth: [
        "section21A",
        "section21B",
        "section21C",
        "section21D",
        "section21D1",
        "section21E",
      ],
      policeRecord: [
        "section22A",
        "section22B",
        "section22C",
        "section22D",
        "charges",
      ],
      drugActivity: [
        "section23_1",
        "section23_2",
        "section23_3",
        "section23_4",
      ],
      alcoholUse: ["section24_1", "section24_2", "section24_3", "section24_4"],
      investigationsInfo: ["section25_1", "section25_2", "section25_3"],
      finances: [
        "section26_1",
        "section26_2",
        "section26_3",
        "section26_4",
        "section26_5",
        "section26_6",
        "section26_7",
      ],
      technology: ["section27_1", "section27_2", "section27_3"],
      civil: ["section28_1"],
      association: [
        "section29_1",
        "section29_2",
        "section29_3",
        "section29_4",
        "section29_5",
        "section29_6",
        "section29_7",
      ],
    };

    const findNestedTemplate = (pathSegments, templates) => {
      let currentTemplate = templates;
      console.log(`Initial template: ${JSON.stringify(currentTemplate)}`);
      for (const segment of pathSegments) {
        console.log(`Current segment: ${segment}`);
        if (Array.isArray(currentTemplate)) {
          console.log(`Current template is array, selecting first element.`);
          currentTemplate = currentTemplate[0];
        }
        if (currentTemplate[segment]) {
          console.log(`Found segment in template: ${segment}`);
          currentTemplate = currentTemplate[segment];
        } else {
          console.log(`Segment not found, checking nested templates.`);
          // Handle the case where the segment is part of nested templates
          for (const [templateKey, nestedKeys] of Object.entries(
            nestedTemplates
          )) {
            if (
              pathSegments.includes(templateKey) &&
              nestedKeys.includes(segment)
            ) {
              console.log(`Nested template key matched: ${templateKey}`);
              currentTemplate = currentTemplate[templateKey];
            }
          }
        }
        console.log(`Updated template: ${JSON.stringify(currentTemplate)}`);
      }
      return cloneDeep(currentTemplate);
    };

    if (isNestedPath) {
      const nestedTemplate = findNestedTemplate(pathSegments, templates);
      if (nestedTemplate) {
        console.log(`Nested template found: ${JSON.stringify(nestedTemplate)}`);
        return nestedTemplate;
      } else {
        console.log(`No nested template found for path: ${path}`);
      }
    }

    console.log(
      isNestedPath,
      lastSegment,
      path,
      templates[lastSegment as keyof typeof templates],
      "LOG TESTING"
    );

    if (path === "employmentInfo") {
      return {
        _id: templates.employmentInfo._id,
        employmentActivity: templates.employmentInfo.employmentActivity,
      };
    }

    if (path.startsWith("citizenshipInfo.")) {
      const citizenshipType = pathSegments[1];
      console.log(`Citizenship type: ${citizenshipType}`);
      const citizenshipTemplate = templates.citizenshipInfo[citizenshipType];
      if (citizenshipTemplate) {
        // console.log(
        //   `Citizenship template found: ${JSON.stringify(citizenshipTemplate)}`
        // );
        return cloneDeep(citizenshipTemplate);
      } else {
        console.error(
          `No template found for citizenship type: ${citizenshipType}`
        );
        return {};
      }
    }

    const defaultItem = cloneDeep(templates[lastSegment]);
    console.log(`Default item: ${JSON.stringify(defaultItem)}`);

    if (Object.keys(defaultItem).length === 0) {
      console.error(`No template found for path: ${path}`);
    }

    return defaultItem;
  };

  const isReadOnlyField = (key: string) => {
    return key.endsWith("_id") || key === "createdAt" || key === "updatedAt";
  };

  const renderField = (key: string, value: any, path: string) => {
    if (!value) return null;

    const props = {
      key: path,
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

    const employeeId = data.personalInfo.applicantID;

    if (!employeeId) {
      return null;
    }

    // console.log("Rendering field for key:", key, "with data:", value);

    switch (key) {
      case "personalInfo":
        return <RenderBasicInfo {...props} />;
      case "birthInfo":
        return <RenderBirthInfo {...props} />;
      case "namesInfo":
        return <RenderNames {...props} />;
      case "aknowledgementInfo":
        return <RenderAcknowledgementInfo {...props} />;
      case "physicalAttributes":
        return <RenderPhysicalsInfo {...props} />;
      case "contactInfo":
        return <RenderContactInfo {...props} />;
      case "passportInfo":
        return <RenderPassportInfo {...props} />;
      // case "citizenshipInfo":
      //   return <RenderCitizenshipInfo {...props} />;
      // case "dualCitizenshipInfo":
      //   return <RenderDualCitizenshipInfo {...props} />;
      // case "residencyInfo":
      //   return <RenderResidencyInfo {...props} />;
      // case "schoolInfo":
      //   return <RenderSchoolInfo {...props} />;
      // case "employmentInfo":
      //   return <RenderEmploymentInfo {...props} />;
      // case "serviceInfo":
      //   return <RenderServiceInfo {...props} />;
      // case "militaryHistoryInfo":
      //   return <RenderMilitaryInfo {...props} />;
      // case "peopleThatKnow":
      //   return <RenderPeopleThatKnow {...props} />;
      // case "relationshipInfo":
      //   return <RenderRelationshipInfo {...props} />;
      // case "relativesInfo":
      //   return <RenderRelativesInfo {...props} />;
      // case "foreignContacts":
      //   return <RenderForeignContacts {...props} />;
      // case "foreignActivities":
      //   return <RenderForeignActivities {...props} />;
      // case "mentalHealth":
      //   return <RenderMentalHealth {...props} />;
      // case "policeRecord":
      //   return <RenderPolice {...props} />;
      // case "drugActivity":
      //   return <RenderDrugActivity {...props} />;
      // case "alcoholUse":
      //   return <RenderAlcoholUse {...props} />;
      // case "investigationsInfo":
      //   return <RenderInvestigationsInfo {...props} />;
      // case "finances":
      //   return <RenderFinances {...props} />;
      // case "technology":
      //   return <RenderTechnology {...props} />;
      // case "civil":
      //   return <RenderCivil {...props} />;
      // case "association":
      //   return <RenderAssociation {...props} />;
      // case "signature":
      //   return <RenderSignature {...props} />;
      case "print":
        return <RenderPrintPDF {...props} />;



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

  return (
    <>
      {formData &&
        formSections.length > currentStep &&
        renderField(
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
