import { SchoolInfo } from "api/interfaces/sections/schoolInfo";

// schoolInfo covers section 12

export const schoolInfo: SchoolInfo = {
    hasAttendedSchool: {
      value: "YES",
      id: "17183",
      type: "PDFRadioGroup",
    },
    hasReceivedDegree: {
      value: "YES",
      id: "17184",
      type: "PDFRadioGroup",
    },
    schoolEntry: [
      {
        _id: 1,
        fromDate: {
          value: "13fromDate",
          id: "10095",
          type: "PDFTextField",
        },
        fromEst: {
          value: "Yes",
          id: "10094",
          type: "PDFCheckBox",
        },
        toDate: {
          value: "13ToDate",
          id: "10056",
          type: "PDFTextField",
        },
        present: {
          value: "Yes",
          id: "10093",
          type: "PDFCheckBox",
        },
        toEst: {
          value: "Yes",
          id: "10092",
          type: "PDFCheckBox",
        },
        schoolName: {
          value: "13NameOfSchool",
          id: "10079",
          type: "PDFTextField",
        },
        schoolAddress: {
          street: {
            value: "13SchoolAddress",
            id: "10085",
            type: "PDFTextField",
          },
          city: {
            value: "schoolCity",
            id: "10084",
            type: "PDFTextField",
          },
          state: {
            value: "AS",
            id: "10083",
            type: "PDFDropdown",
          },
          zipCode: {
            value: "schoolZip",
            id: "10080",
            type: "PDFTextField",
          },
          country: {
            value: "Andorra",
            id: "10082",
            type: "PDFDropdown",
          },
        },
        schoolType: {
          value: "High School",
          id: "17185",
          type: "PDFRadioGroup",
        },
        knownPerson: {
          dontKnowName: {
            value: "Yes",
            id: "10076",
            type: "PDFCheckBox",
          },
          firstName: {
            value: "knownPersonFirstName",
            id: "10077",
            type: "PDFTextField",
          },
          lastName: {
            value: "knownPersonLastName",
            id: "10078",
            type: "PDFTextField",
          },
          address: {
            street: {
              value: "knownPersonStreet",
              id: "10075",
              type: "PDFTextField",
            },
            city: {
              value: "knownPersonCity",
              id: "10074",
              type: "PDFTextField",
            },
            state: {
              value: "CA",
              id: "10073",
              type: "PDFDropdown",
            },
            zipCode: {
              value: "knownPersonZ",
              id: "10071",
              type: "PDFTextField",
            },
            country: {
              value: "Antigua and Barbuda",
              id: "10072",
              type: "PDFDropdown",
            },
          },
          phoneNumber: {
            _id: 1,
            dontKnowNumber: {
              value: "Yes",
              id: "10067",
              type: "PDFCheckBox",
            },
            isInternationalOrDSN: {
              value: "Yes",
              id: "10068",
              type: "PDFCheckBox",
            },
            number: {
              value: "phone1",
              id: "10070",
              type: "PDFTextField",
            },
            extension: {
              value: "1",
              id: "10069",
              type: "PDFTextField",
            },
            day: {
              value: "Yes",
              id: "10036",
              type: "PDFCheckBox",
            },
            night: {
              value: "Yes",
              id: "10035",
              type: "PDFCheckBox",
            }
          },
          email: {
            value: "email",
            id: "10066",
            type: "PDFTextField",
          },
          dontKnowEmail: {
            value: "Yes",
            id: "10065",
            type: "PDFCheckBox",
          },
        },
        degreeReceived: {
          value: "YES",
          id: "17186",
          type: "PDFRadioGroup",
        },
        degrees: [
          {
            _id: 1,
            type: {
              value: "Associate's",
              id: "10064",
              type: "PDFDropdown",
            },
            dateAwarded: {
              value: "dateawarded1",
              id: "10062",
              type: "PDFTextField",
            },
            est: {
              value: "Yes",
              id: "10061",
              type: "PDFCheckBox",
            },
            otherDegree: {
              value: "OtherDegree2",
              id: "10063",
              type: "PDFTextField",
            }
          },
          {
            _id: 2,
            type: {
              value: "Master's",
              id: "10060",
              type: "PDFDropdown",
            },
            dateAwarded: {
              value: "OtherDiploma2",
              id: "10058",
              type: "PDFTextField",
            },
            est: {
              value: "Yes",
              id: "10057",
              type: "PDFCheckBox",
            },
            otherDegree: {
              value: "OtherDegree2",
              id: "10059",
              type: "PDFTextField",
            }
          },
        ],
      },
      {
        _id: 2,
        fromDate: {
          value: "e2fromDate",
          id: "10055",
          type: "PDFTextField",
        },
        toDate: {
          value: "e2toDate",
          id: "10037",
          type: "PDFTextField",
        },
        present: {
          value: "Yes",
          id: "10052",
          type: "PDFCheckBox",
        },
        fromEst: {
          value: "Yes",
          id: "10054",
          type: "PDFCheckBox",
        },
        toEst: {
          value: "Yes",
          id: "10053",
          type: "PDFCheckBox",
        },
        schoolName: {
          value: "e2SchoolName",
          id: "10041",
          type: "PDFTextField",
        },
        schoolAddress: {
          street: {
            value: "e2Street",
            id: "10047",
            type: "PDFTextField",
          },
          city: {
            value: "e2City",
            id: "10046",
            type: "PDFTextField",
          },
          state: {
            value: "AR",
            id: "10045",
            type: "PDFDropdown",
          },
          zipCode: {
            value: "e2Zip",
            id: "10042",
            type: "PDFTextField",
          },
          country: {
            value: "Albania",
            id: "10044",
            type: "PDFDropdown",
          },
        },
        schoolType: {
          value: "High School",
          id: "17188",
          type: "PDFRadioGroup",
        },
        knownPerson: {
          dontKnowName: {
            value: "Yes",
            id: "10038",
            type: "PDFCheckBox",
          },
          firstName: {
            value: "e2KnownPersonFName",
            id: "10039",
            type: "PDFTextField",
          },
          lastName: {
            value: "e2KnownPersonLName",
            id: "10040",
            type: "PDFTextField",
          },
          address: {
            street: {
              value: "e2KnownPersonStreet",
              id: "10133",
              type: "PDFTextField",
            },
            city: {
              value: "e2KnownPersonCity",
              id: "10132",
              type: "PDFTextField",
            },
            state: {
              value: "AR",
              id: "10131",
              type: "PDFDropdown",
            },
            zipCode: {
              value: "e2KnownPerso",
              id: "10129",
              type: "PDFTextField",
            },
            country: {
              value: "Anguilla",
              id: "10130",
              type: "PDFDropdown",
            },
          },
          phoneNumber: {
            _id: Math.random(),
            dontKnowNumber: {
              value: "Yes",
              id: "10142",
              type: "PDFCheckBox",
            },
            isInternationalOrDSN: {
              value: "Yes",
              id: "10141",
              type: "PDFCheckBox",
            },
            day: {
              value: "Yes",
              id: "10138",
              type: "PDFCheckBox",
            },
            night: {
              value: "Yes",
              id: "10137",
              type: "PDFCheckBox",
            },
            number: {
              value: "e2Phone1",
              id: "10140",
              type: "PDFTextField",
            },
            extension: {
              value: "2",
              id: "10139",
              type: "PDFTextField",
            }
          },
          email: {
            value: "e2Email",
            id: "10128",
            type: "PDFTextField",
          },
          dontKnowEmail: {
            value: "Yes",
            id: "10065",
            type: "PDFCheckBox",
          },
        },
        degreeReceived: {
          value: "NO",
          id: "17174",
          type: "PDFRadioGroup",
        },
        degrees: [
          {
            _id: 1,
            type: {
              value: "Associate's",
              id: "10126",
              type: "PDFDropdown",
            },
            dateAwarded: {
              value: "e2DateAwarded1",
              id: "10124",
              type: "PDFTextField",
            },
            est: {
              value: "Yes",
              id: "10123",
              type: "PDFCheckBox",
            },
            otherDegree: {
              value: "e2OtherDiploma1",
              id: "10125",
              type: "PDFTextField",
            },
          },
          {
            _id: 2,
            type: {
              value: "Professional Degree (e.g. MD, DVM, JD)",
              id: "10122",
              type: "PDFDropdown",
            },
            dateAwarded: {
              value: "e2DateAwarded2",
              id: "10120",
              type: "PDFTextField",
            },
            est: {
              value: "Yes",
              id: "10119",
              type: "PDFCheckBox",
            },
            otherDegree: {
              value: "e2OtherDiploma2",
              id: "10121",
              type: "PDFTextField",
            },
          }
        ],
      },
      {
        _id: 3,
        fromDate: {
          value: "e3FromDate",
          id: "10118",
          type: "PDFTextField",
        },
        toDate: {
          value: "e3ToDate",
          id: "10149",
          type: "PDFTextField",
        },
        present: {
          value: "Yes",
          id: "10115",
          type: "PDFCheckBox",
        },
        fromEst: {
          value: "Yes",
          id: "10117",
          type: "PDFCheckBox",
        },
        toEst: {
          value: "Yes",
          id: "10116",
          type: "PDFCheckBox",
        },
        schoolName: {
          value: "e3SchoolName",
          id: "10102",
          type: "PDFTextField",
        },
        schoolAddress: {
          street: {
            value: "e3SchooStreer",
            id: "10108",
            type: "PDFTextField",
          },
          city: {
            value: "e3City",
            id: "10107",
            type: "PDFTextField",
          },
          state: {
            value: "AR",
            id: "10106",
            type: "PDFDropdown",
          },
          zipCode: {
            value: "e3Zip",
            id: "10103",
            type: "PDFTextField",
          },
          country: {
            value: "Albania",
            id: "10105",
            type: "PDFDropdown",
          },
        },
        schoolType: {
          value: "High School",
          id: "17176",
          type: "PDFRadioGroup",
        },
        knownPerson: {
          dontKnowName: {
            value: "Yes",
            id: "10165",
            type: "PDFCheckBox",
          },
          firstName: {
            value: "e3KnownPersonFName",
            id: "10166",
            type: "PDFTextField",
          },
          lastName: {
            value: "e3KnownPersonLName",
            id: "10101",
            type: "PDFTextField",
          },
          address: {
            street: {
              value: "e3KnownPersonStreet",
              id: "10164",
              type: "PDFTextField",
            },
            city: {
              value: "e3KnownPersonCity",
              id: "10163",
              type: "PDFTextField",
            },
            state: {
              value: "AS",
              id: "10162",
              type: "PDFDropdown",
            },
            zipCode: {
              value: "e3KnownPerso",
              id: "10160",
              type: "PDFTextField",
            },
            country: {
              value: "Angola",
              id: "10161",
              type: "PDFDropdown",
            },
          },
          phoneNumber: {
            _id: 1,
            dontKnowNumber: {
              value: "Yes",
              id: "10148",
              type: "PDFCheckBox",
            },
            isInternationalOrDSN: {
              value: "Yes",
              id: "10147",
              type: "PDFCheckBox",
            },
            number: {
              value: "e3Phone",
              id: "10146",
              type: "PDFTextField",
            },
            extension: {
              value: "3",
              id: "10145",
              type: "PDFTextField",
            },
            day: {
              value: "Yes",
              id: "10144",
              type: "PDFCheckBox",
            },
            night: {
              value: "Yes",
              id: "10143",
              type: "PDFCheckBox",
            },
          },
          email: {
            value: "email",
            id: "10159",
            type: "PDFTextField",
          },
          dontKnowEmail: {
            value: "Yes",
            id: "10158",
            type: "PDFCheckBox",
          },
        },
        degreeReceived: {
          value: "NO",
          id: "17177",
          type: "PDFRadioGroup",
        },
        degrees: [
          {
            _id: 1,
            type: {
              value: "Associate's",
              id: "10157",
              type: "PDFDropdown",
            },
            dateAwarded: {
              value: "e2DateAwarded1",
              id: "10155",
              type: "PDFTextField",
            },
            est: {
              value: "Yes",
              id: "10154",
              type: "PDFCheckBox",
            },
            otherDegree: {
              value: "e3Other1",
              id: "10156",
              type: "PDFTextField",
            },
          },
          {
            _id: 2,
            type: {
              value: "Associate's",
              id: "10153",
              type: "PDFDropdown",
            },
            dateAwarded: {
              value: "e2DateAwarded2",
              id: "10151",
              type: "PDFTextField",
            },
            est: {
              value: "Yes",
              id: "10150",
              type: "PDFCheckBox",
            },
            otherDegree: {
              value: "e3Other2",
              id: "10152",
              type: "PDFTextField",
            },
          }
        ],
      },
      {
        _id: 4,
        fromDate: {
          value: "e4FromDate",
          id: "10208",
          type: "PDFTextField",
        },
        toDate: {
          value: "e4ToDate",
          id: "10173",
          type: "PDFTextField",
        },
        present: {
          value: "Yes",
          id: "10206",
          type: "PDFCheckBox",
        },
        fromEst: {
          value: "Yes",
          id: "10207",
          type: "PDFCheckBox",
        },
        toEst: {
          value: "Yes",
          id: "10205",
          type: "PDFCheckBox",
        },
        schoolName: {
          value: "e4Schoolname",
          id: "10192",
          type: "PDFTextField",
        },
        schoolAddress: {
          street: {
            value: "e4Street",
            id: "10198",
            type: "PDFTextField",
          },
          city: {
            value: "e4City",
            id: "10197",
            type: "PDFTextField",
          },
          state: {
            value: "AR",
            id: "10196",
            type: "PDFDropdown",
          },
          zipCode: {
            value: "e4Zip",
            id: "10193",
            type: "PDFTextField",
          },
          country: {
            value: "Anguilla",
            id: "10195",
            type: "PDFDropdown",
          },
        },
        schoolType: {
          value: "High School",
          id: "17169",
          type: "PDFRadioGroup",
        },
        knownPerson: {
          dontKnowName: {
            value: "Yes",
            id: "10189",
            type: "PDFCheckBox",
          },
          firstName: {
            value: "e4KnownPersonFName",
            id: "10190",
            type: "PDFTextField",
          },
          lastName: {
            value: "e4KnownPersonLName",
            id: "10191",
            type: "PDFTextField",
          },
          address: {
            street: {
              value: "e4KnownPersonStreet",
              id: "10188",
              type: "PDFTextField",
            },
            city: {
              value: "e4KnownPersonCity",
              id: "10187",
              type: "PDFTextField",
            },
            state: {
              value: "AS",
              id: "10186",
              type: "PDFDropdown",
            },
            zipCode: {
              value: "e4KnownPerso",
              id: "10184",
              type: "PDFTextField",
            },
            country: {
              value: "Argentina",
              id: "10185",
              type: "PDFDropdown",
            },
          },
          phoneNumber: {
            _id: 1,
            dontKnowNumber: {
              value: "Yes",
              id: "10182",
              type: "PDFCheckBox",
            },
            isInternationalOrDSN: {
              value: "Yes",
              id: "10172",
              type: "PDFCheckBox",
            },
            number: {
              value: "e4Phone1",
              id: "10170",
              type: "PDFTextField",
            },
            extension: {
              value: "4",
              id: "10169",
              type: "PDFTextField",
            },
            day: {
              value: "Yes",
              id: "10168",
              type: "PDFCheckBox",
            },
            night: {
              value: "Yes",
              id: "10167",
              type: "PDFCheckBox",
            },
          },
          email: {
            value: "e4KnownPersonEmail",
            id: "10183",
            type: "PDFTextField",
          },
          dontKnowEmail: {
            value: "Yes",
            id: "10171",
            type: "PDFCheckBox",
          },
        },
        degreeReceived: {
          value: "YES",
          id: "17170",
          type: "PDFRadioGroup",
        },
        degrees: [
          {
            _id:1,
            type: {
              value: "Associate's",
              id: "10181",
              type: "PDFDropdown",
            },
            dateAwarded: {
              value: "DateAwarded1",
              id: "10179",
              type: "PDFTextField",
            },
            est: {
              value: "Yes",
              id: "10178",
              type: "PDFCheckBox",
            },
            otherDegree: {
              value: "OtherDiploma1",
              id: "10180",
              type: "PDFTextField",
            },
          },
          {
            _id: 1,
            type: {
              value: "Doctorate",
              id: "10177",
              type: "PDFDropdown",
            },
            dateAwarded: {
              value: "DateAwarded2",
              id: "10175",
              type: "PDFTextField",
            },
            est: {
              value: "Yes",
              id: "10174",
              type: "PDFCheckBox",
            },
            otherDegree: {
              value: "OtherDiploma2",
              id: "10176",
              type: "PDFTextField",
            },
          }
        ],
      }

    ],
  };
