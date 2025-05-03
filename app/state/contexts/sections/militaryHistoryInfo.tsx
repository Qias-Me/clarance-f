import { MilitaryHistoryInfo } from "api/interfaces/sections/militaryHistoryInfo";

// militaryHistoryInfo covers section 15

export const militaryHistoryInfo: MilitaryHistoryInfo = {
    everServedInUSMilitary: {
      value: "NO (If NO, proceed to Section 15.2) ",
      id: "17088",
      type: "PDFRadioGroup",
    },
    disciplinaryProcedure: {
      value: "NO (If NO, proceed to Section 15.3) ",
      id: "17060",
      type: "PDFRadioGroup",
    },
    everServedInForeignMilitary: {
      value: "NO (If NO, proceed to Section 16)",
      id: "17050",
      type: "PDFRadioGroup",
    },

    section15_1: [
      {
        _id: 1,
        branch: { value: "5", id: "17087", type: "PDFRadioGroup" },
        stateOfService: { value: "TX", id: "11394", type: "PDFDropdown" },
        status: { value: "3", id: "17081", type: "PDFRadioGroup" },
        officerOrEnlisted: {
          value: "3",
          id: "17085",
          type: "PDFRadioGroup",
        },
        serviceNumber: {
          value: "serviceNumber",
          id: "11461",
          type: "PDFTextField",
        },
        serviceFromDate: {
          value: "fromDate",
          id: "11466",
          type: "PDFTextField",
        },
        serviceToDate: { value: "toDate", id: "11464", type: "PDFTextField" },
        present: { value: "Yes", id: "11463", type: "PDFCheckBox" },
        estimatedFromDate: {
          value: "Yes",
          id: "11465",
          type: "PDFCheckBox",
        },
        estimatedToDate: { value: "Yes", id: "11462", type: "PDFCheckBox" },
        discharged: { value: "YES", id: "17084", type: "PDFRadioGroup" },
        typeOfDischarge: { value: "4", id: "17083", type: "PDFRadioGroup" },
        dischargeTypeOther: {
          value: "Other",
          id: "11450",
          type: "PDFTextField",
        },
        dischargeDate: { value: "date", id: "11452", type: "PDFTextField" },
        estimatedDischargeDate: {
          value: "Yes",
          id: "11451",
          type: "PDFCheckBox",
        },
        dischargeReason: { value: "dischargeReadon", id: "11449", type: "PDFTextField" },
      },
      {
        _id: 2,
        branch: {
          value: "5",
          id: "17080", // Updated from JSON
          type: "PDFRadioGroup",
        },
        stateOfService: {
          value: "AS", // Changed from "TX" to "AS" to match the JSON value
          id: "11436", // Updated from JSON
          type: "PDFDropdown",
        },
        status: {
          value: "3",
          id: "17078", // Updated from JSON
          type: "PDFRadioGroup",
        },
        officerOrEnlisted: {
          value: "3",
          id: "17085", // Updated from JSON to match the "status" field
          type: "PDFRadioGroup",
        },
        serviceNumber: {
          value: "serviceNmber", // Fixed the value to match JSON spelling
          id: "11427", // Updated from JSON
          type: "PDFTextField",
        },
        serviceFromDate: {
          value: "fromDate",
          id: "11432", // Updated from JSON
          type: "PDFTextField",
        },
        serviceToDate: {
          value: "ToDate",
          id: "11430", // Updated from JSON
          type: "PDFTextField",
        },
        present: {
          value: "Yes",
          id: "11431", // Updated from JSON
          type: "PDFCheckBox",
        },
        estimatedFromDate: {
          value: "Yes",
          id: "11429", // Updated from JSON
          type: "PDFCheckBox",
        },
        estimatedToDate: {
          value: "Yes",
          id: "11428", // Updated from JSON
          type: "PDFCheckBox",
        },
        discharged: {
          value: "NO ", // Fixed the value to remove extra space
          id: "17077", // Updated from JSON
          type: "PDFRadioGroup",
        },
        typeOfDischarge: {
          value: "4",
          id: "17076", // Updated from JSON
          type: "PDFRadioGroup",
        },
        dischargeTypeOther: {
          value: "otherExpalin", // Fixed the spelling to match the JSON
          id: "11416", // Updated from JSON
          type: "PDFTextField",
        },
        dischargeDate: {
          value: "dischargeDate",
          id: "11418", // Updated from JSON
          type: "PDFTextField",
        },
        estimatedDischargeDate: {
          value: "Yes",
          id: "11417", // Updated from JSON
          type: "PDFCheckBox",
        },
        dischargeReason: {
          value: "reasonsForDischarge",
          id: "11415", // Updated from JSON
          type: "PDFTextField",
        },
      }

    ],

    section15_2: [
      {
        _id: 1,
        date: {
          value: "DateOfCourt1",
          id: "11477", // Matched from JSON
          type: "PDFTextField"
        },
        estimatedDate: {
          value: "Yes",
          id: "11478", // Matched from JSON
          type: "PDFCheckBox"
        },
        descriptionOfOffense: {
          value: "OffencesCharged1",
          id: "11476", // Matched from JSON
          type: "PDFTextField"
        },
        nameOfProcedure: {
          value: "DisplinaryProcedure1", // Updated to match the JSON value
          id: "11475", // Matched from JSON
          type: "PDFTextField"
        },
        courtDescription: {
          value: "CourtCharged1", // Updated to match the JSON value
          id: "11474", // Matched from JSON
          type: "PDFTextField"
        },
        outcomeDescription: {
          value: "FinalOutcome1", // Updated to match the JSON value
          id: "11473", // Matched from JSON
          type: "PDFTextField"
        },
      },
      {
        _id: 2,
        date: {
          value: "DateOfCourt2",
          id: "11471", // Matched from JSON
          type: "PDFTextField"
        },
        estimatedDate: {
          value: "Yes",
          id: "11472", // Matched from JSON
          type: "PDFCheckBox"
        },
        descriptionOfOffense: {
          value: "OffencesCharged2",
          id: "11470", // Matched from JSON
          type: "PDFTextField"
        },
        nameOfProcedure: {
          value: "DisplinaryProcedure2", // Updated to match the JSON value
          id: "11469", // Matched from JSON
          type: "PDFTextField"
        },
        courtDescription: {
          value: "CourtCharged2", // Updated to match the JSON value
          id: "11468", // Matched from JSON
          type: "PDFTextField"
        },
        outcomeDescription: {
          value: "FinalOutcome2", // Updated to match the JSON value
          id: "11467", // Matched from JSON
          type: "PDFTextField"
        },
      },
    ],

    section15_3: [
      {
        _id: 1,
        organizationType: {
          value: "7",
          id: "17051", // Matched from JSON
          type: "PDFRadioGroup",
        },
        organizationTypeOther: {
          value: "Non-Profit", // Added random value
          id: "11494", // Matched from JSON for "OtherExpalin"
          type: "PDFTextField",
        },
        organizationName: {
          value: "NameOfORg",
          id: "11534", // Matched from JSON
          type: "PDFTextField",
        },
        country: {
          value: "United States", // Added random value
          id: "11533", // Matched from JSON for "Andorra"
          type: "PDFDropdown",
        },
        periodOfServiceFrom: {
          value: "2020-01-01",
          id: "11483", // Matched from JSON
          type: "PDFTextField",
        },
        periodOfServiceTo: {
          value: "2023-01-01",
          id: "11537", // Matched from JSON
          type: "PDFTextField",
        },
        present: {
          value: "Yes",
          id: "11536", // Matched from JSON
          type: "PDFCheckBox",
        },
        estimatedPeriodFrom: {
          value: "Yes",
          id: "11482", // Matched from JSON
          type: "PDFCheckBox",
        },
        estimatedPeriodTo: {
          value: "Yes",
          id: "11535", // Matched from JSON
          type: "PDFCheckBox",
        },
        highestRank: {
          value: "Manager", // Added random value
          id: "11532", // Matched from JSON for "hihestRank"
          type: "PDFTextField",
        },
        departmentOrOffice: {
          value: "Human Resources", // Added random value
          id: "11531", // Matched from JSON for "Division"
          type: "PDFTextField",
        },
        associationDescription: {
          value: "Team Collaboration", // Added random value
          id: "11529", // Matched from JSON for "DescriotionofCircumstances"
          type: "PDFTextField",
        },
        reasonForLeaving: {
          value: "Personal Reasons", // Added random value
          id: "11530", // Matched from JSON for "DescriptionOfReason"
          type: "PDFTextField",
        },
        maintainsContact: {
          value: "YES",
          id: "17054", // Matched from JSON
          type: "PDFRadioGroup",
        },
        contacts: [
          {
            _id: 1,
            lastName: {
              value: "Doe", // Added random value
              id: "11522", // Matched from JSON for "Contact1LastName"
              type: "PDFTextField",
            },
            firstName: {
              value: "John", // Added random value
              id: "11521", // Matched from JSON for "Contact1FirstName"
              type: "PDFTextField",
            },
            middleName: {
              value: "Michael", // Added random value
              id: "11523", // Matched from JSON for "Contact1MiddleName"
              type: "PDFTextField",
            },
            suffix: {
              value: "Jr.", // Added random value
              id: "11520", // Matched from JSON for "III"
              type: "PDFDropdown",
            },
            address: {
              street: {
                value: "123 Main St", // Added random value
                id: "11528", // Matched from JSON for "Contact1Street"
                type: "PDFTextField",
              },
              city: {
                value: "Anytown", // Added random value
                id: "11527", // Matched from JSON for "Contact1City"
                type: "PDFTextField",
              },
              state: {
                value: "CA", // Added random value
                id: "11526", // Matched from JSON for "CA"
                type: "PDFDropdown",
              },
              zipCode: {
                value: "90210", // Added random value
                id: "11524", // Matched from JSON for "Contact1Zip"
                type: "PDFTextField",
              },
              country: {
                value: "USA", // Added random value
                id: "11525", // Matched from JSON for "Andorra"
                type: "PDFDropdown",
              },
            },
            officialTitle: {
              value: "CEO", // Added random value
              id: "11511", // Matched from JSON for "Contact1OfficalTitle"
              type: "PDFTextField",
            },
            frequencyOfContact: {
              value: "Monthly", // Added random value
              id: "11512", // Matched from JSON for "Contact1FrequencyContact"
              type: "PDFTextField",
            },
            associationFrom: {
              value: "2019-01-01", // Added random value
              id: "11519", // Matched from JSON for "Contact1From"
              type: "PDFTextField",
            },
            associationTo: {
              value: "2021-01-01", // Added random value
              id: "11517", // Matched from JSON for "Contact1ToDa"
              type: "PDFTextField",
            },
            present: {
              value: "Yes",
              id: "11515", // Matched from JSON
              type: "PDFCheckBox",
            },
            estimatedAssociationFrom: {
              value: "Yes",
              id: "11518", // Matched from JSON
              type: "PDFCheckBox",
            },
            estimatedAssociationTo: {
              value: "Yes",
              id: "11498", // Matched from JSON
              type: "PDFCheckBox",
            },
          },
          {
            _id: 2,
            lastName: {
              value: "Smith", // Added random value
              id: "11504", // Matched from JSON for "Contact2LastName"
              type: "PDFTextField",
            },
            firstName: {
              value: "Jane", // Added random value
              id: "11503", // Matched from JSON for "Contact2FirstName"
              type: "PDFTextField",
            },
            middleName: {
              value: "Elizabeth", // Added random value
              id: "11505", // Matched from JSON for "Contact2MiddleName"
              type: "PDFTextField",
            },
            suffix: {
              value: "Sr.", // Added random value
              id: "11502", // Matched from JSON for "VI"
              type: "PDFDropdown",
            },
            address: {
              street: {
                value: "456 Elm St", // Added random value
                id: "11510", // Matched from JSON for "Contact2Street"
                type: "PDFTextField",
              },
              city: {
                value: "Somecity", // Added random value
                id: "11509", // Matched from JSON for "Contact2City"
                type: "PDFTextField",
              },
              state: {
                value: "AZ", // Added random value
                id: "11508", // Matched from JSON for "AZ"
                type: "PDFDropdown",
              },
              zipCode: {
                value: "85001", // Added random value
                id: "11506", // Matched from JSON for "Contact2Zip"
                type: "PDFTextField",
              },
              country: {
                value: "Afghanistan", // Added random value
                id: "11507", // Matched from JSON for "Afghanistan"
                type: "PDFDropdown",
              },
            },
            officialTitle: {
              value: "COO", // Added random value
              id: "11496", // Matched from JSON for "Contact2OfficialTitle"
              type: "PDFTextField",
            },
            frequencyOfContact: {
              value: "Weekly", // Added random value
              id: "11495", // Matched from JSON for "Contact2FrequencyContact"
              type: "PDFTextField",
            },
            associationFrom: {
              value: "2018-06-01", // Added random value
              id: "11501", // Matched from JSON for "Contact2From"
              type: "PDFTextField",
            },
            associationTo: {
              value: "2020-06-01", // Added random value
              id: "11499", // Matched from JSON for "Contact2ToDa"
              type: "PDFTextField",
            },
            present: {
              value: "Yes",
              id: "11500", // Matched from JSON
              type: "PDFCheckBox",
            },
            estimatedAssociationFrom: {
              value: "Yes",
              id: "11500", // Matched from JSON (same as `present`)
              type: "PDFCheckBox",
            },
            estimatedAssociationTo: {
              value: "Yes",
              id: "11497", // Matched from JSON
              type: "PDFCheckBox",
            },
          },
        ],
      },

      {
        _id: 2,
        organizationType: {
          value: "7",
          id: "17042",
          type: "PDFRadioGroup",
        },
        organizationTypeOther: {
          value: "",
          id: "11578",
          type: "PDFTextField",
        },
        organizationName: {
          value: "",
          id: "11578",
          type: "PDFTextField",
        },
        country: {
          value: "",
          id: "11577",
          type: "PDFDropdown",
        },
        periodOfServiceFrom: {
          value: "fromDate",
          id: "11583",
          type: "PDFTextField",
        },
        periodOfServiceTo: {
          value: "",
          id: "11581",
          type: "PDFTextField",
        },
        present: {
          value: "Yes",
          id: "11579",
          type: "PDFCheckBox",
        },
        estimatedPeriodFrom: {
          value: "Yes",
          id: "11582",
          type: "PDFCheckBox",
        },
        estimatedPeriodTo: {
          value: "Yes",
          id: "11580",
          type: "PDFCheckBox",
        },
        highestRank: {
          value: "",
          id: "11576",
          type: "PDFTextField",
        },
        departmentOrOffice: {
          value: "",
          id: "11575",
          type: "PDFTextField",
        },
        associationDescription: {
          value: "",
          id: "11574",
          type: "PDFTextField",
        },
        reasonForLeaving: {
          value: "",
          id: "11573",
          type: "PDFTextField",
        },
        maintainsContact: {
          value: "YES",
          id: "17045",
          type: "PDFRadioGroup",
        },
        contacts: [
          {
            _id: 1,
            lastName: {
              value: "",
              id: "11566",
              type: "PDFTextField",
            },
            firstName: {
              value: "",
              id: "11565",
              type: "PDFTextField",
            },
            middleName: {
              value: "",
              id: "11567",
              type: "PDFTextField",
            },
            suffix: {
              value: "",
              id: "11564",
              type: "PDFDropdown",
            },
            address: {
              street: {
                value: "",
                id: "11572",
                type: "PDFTextField",
              },
              city: {
                value: "",
                id: "11571",
                type: "PDFTextField",
              },
              state: {
                value: "",
                id: "11570",
                type: "PDFDropdown",
              },
              zipCode: {
                value: "",
                id: "11568",
                type: "PDFTextField",
              },
              country: {
                value: "",
                id: "11569",
                type: "PDFDropdown",
              },
            },
            officialTitle: {
              value: "",
              id: "11555",
              type: "PDFTextField",
            },
            frequencyOfContact: {
              value: "",
              id: "11556",
              type: "PDFTextField",
            },
            associationFrom: {
              value: "",
              id: "11563",
              type: "PDFTextField",
            },
            associationTo: {
              value: "",
              id: "11561",
              type: "PDFTextField",
            },
            present: {
              value: "Yes",
              id: "11560",
              type: "PDFCheckBox",
            },
            estimatedAssociationFrom: {
              value: "Yes",
              id: "11562",
              type: "PDFCheckBox",
            },
            estimatedAssociationTo: {
              value: "Yes",
              id: "11559",
              type: "PDFCheckBox",
            },
          },
        ],
      },
    ],
  };
