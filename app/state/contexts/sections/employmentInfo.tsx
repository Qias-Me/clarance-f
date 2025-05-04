import { type EmploymentInfo } from "api/interfaces/sections/employmentInfo";

// employmentInfo covers section 13

export const employmentInfo: EmploymentInfo = {
  _id: 1,
  section13A: [
    {
      _id: 1,
      employmentActivity: {
        value:
          "Other (Provide explanation and complete 13A.2, 13A.5 and 13A.6)",
        id: "17167",
        type: "PDFRadioGroup",
      },
      otherExplanation: {
        value: "13OtherExplanation",
        id: "10240",
        type: "PDFTextField",
      },
      section13A1: {
        fromDate: {
          date: {
            value: "13A1StartDate",
            id: "10236",
            type: "PDFTextField",
          },
          estimated: {
            value: "Yes",
            id: "10235",
            type: "PDFCheckBox",
          },
        },
        toDate: {
          date: {
            value: "13A1ToDate",
            id: "10233",
            type: "PDFTextField",
          },
          estimated: {
            value: "Yes",
            id: "10239",
            type: "PDFCheckBox",
          },
          present: {
            value: "Yes",
            id: "10234",
            type: "PDFCheckBox",
          },
        },
        employmentStatus: {
          fullTime: {
            value: "Yes",
            id: "10238",
            type: "PDFCheckBox",
          },
          partTime: {
            value: "Yes",
            id: "10237",
            type: "PDFCheckBox",
          },
        },
        dutyStation: {
          value: "13A1DutyStation",
          id: "10231",
          type: "PDFTextField",
        },
        rankOrPosition: {
          value: "13A1RankTitle",
          id: "10232",
          type: "PDFTextField",
        },
        address: {
          street: {
            value: "13A1DutyStreet",
            id: "10253",
            type: "PDFTextField",
          },
          city: {
            value: "13A1DutyCity",
            id: "10252",
            type: "PDFTextField",
          },
          state: {
            value: "AL",
            id: "10251",
            type: "PDFDropdown",
          },
          zipCode: {
            value: "13A1DutyZip",
            id: "10249",
            type: "PDFTextField",
          },
          country: {
            value: "Afghanistan",
            id: "10250",
            type: "PDFDropdown",
          },
        },
        telephone: {
          number: {
            value: "13A1Phone",
            id: "10247",
            type: "PDFTextField",
          },
          extension: {
            value: "1",
            id: "10246",
            type: "PDFTextField",
          },
          internationalOrDsn: {
            value: "Yes",
            id: "10245",
            type: "PDFCheckBox",
          },
          day: {
            value: "Yes",
            id: "10244",
            type: "PDFCheckBox",
          },
          night: {
            value: "Yes",
            id: "10243",
            type: "PDFCheckBox",
          },
        },
        aLocation: {
          street: {
            value: "13A1SupervisorAddress",
            id: "10220",
            type: "PDFTextField",
          },
          city: {
            value: "13A1SupervisorCity",
            id: "10265",
            type: "PDFTextField",
          },
          state: {
            value: "DC",
            id: "10264",
            type: "PDFDropdown",
          },
          zipCode: {
            value: "13A1Superviso",
            id: "10212",
            type: "PDFTextField",
          },
          country: {
            value: "Argentina",
            id: "10263",
            type: "PDFDropdown",
          },
        },
        hasAPOFPOAddress: {
          value: "YES ",
          id: "17168",
          type: "PDFRadioGroup",
        },
        apoFPOAddress: {
          street: {
            value: "a13A1Street",
            id: "10216",
            type: "PDFTextField",
          },
          zipCode: {
            value: "a13A1Zip",
            id: "10213",
            type: "PDFTextField",
          },
          apoOrFpo: {
            value: "APO",
            id: "10215",
            type: "PDFTextField",
          },
          apoFpoStateCode: {
            value: "APO/FPO Europe",
            id: "10214",
            type: "PDFDropdown",
          },
        },
        supervisor: {
          name: {
            value: "13A1SupervisorName",
            id: "10270",
            type: "PDFTextField",
          },
          rankOrPosition: {
            value: "13A1SupervisorRank",
            id: "10269",
            type: "PDFTextField",
          },
          email: {
            value: "13A1SupervisorEmail",
            id: "10242",
            type: "PDFTextField",
          },
          emailUnknown: {
            value: "Yes",
            id: "10241",
            type: "PDFCheckBox",
          },
          phone: {
            number: {
              value: "13A1SupervisorPhone",
              id: "10268",
              type: "PDFTextField",
            },
            extension: {
              value: "13A1Sup",
              id: "10267",
              type: "PDFTextField",
            },
            internationalOrDsn: {
              value: "Yes",
              id: "10256",
              type: "PDFCheckBox",
            },
            day: {
              value: "Yes",
              id: "10255",
              type: "PDFCheckBox",
            },
            night: {
              value: "Yes",
              id: "10254",
              type: "PDFCheckBox",
            },
          },
          physicalWorkLocation: {
            street: {
              value: "13A1SupervisorAddress",
              id: "10266",
              type: "PDFTextField",
            },
            city: {
              value: "13A1SupervisorCity",
              id: "10265",
              type: "PDFTextField",
            },
            state: {
              value: "DC",
              id: "10264",
              type: "PDFDropdown",
            },
            zipCode: {
              value: "13A1Superviso",
              id: "10262",
              type: "PDFTextField",
            },
            country: {
              value: "Argentina",
              id: "10263",
              type: "PDFDropdown",
            },
          },
          apoFpoAddress: {
            street: {
              value: "a13A1Street",
              id: "10261",
              type: "PDFTextField",
            },
            city: {
              value: "a13A1City",
              id: "10260",
              type: "PDFTextField",
            },
            state: {
              value: "AS",
              id: "10259",
              type: "PDFDropdown",
            },
            zipCode: {
              value: "a13A1Zip",
              id: "10257",
              type: "PDFTextField",
            },
            country: {
              value: "Angola",
              id: "10258",
              type: "PDFDropdown",
            },
          },
        },
      },

      section13A2: {
        fromDate: {
          date: {
            value: "13A2FromDate",
            id: "10272",
            type: "PDFTextField",
          },
          estimated: {
            value: "Yes",
            id: "10273",
            type: "PDFCheckBox",
          },
        },
        toDate: {
          date: {
            value: "13A2ToDate",
            id: "10274",
            type: "PDFTextField",
          },
          estimated: {
            value: "Yes",
            id: "10276",
            type: "PDFCheckBox",
          },
          present: {
            value: "Yes",
            id: "10275",
            type: "PDFCheckBox",
          },
        },
        employmentStatus: {
          fullTime: {
            value: "Yes",
            id: "10280",
            type: "PDFCheckBox",
          },
          partTime: {
            value: "Yes",
            id: "10279",
            type: "PDFCheckBox",
          },
        },
        positionTitle: {
          value: "13A2RecentTitle",
          id: "10277",
          type: "PDFTextField",
        },
        employerName: {
          value: "13A2RecentEmployer",
          id: "10278",
          type: "PDFTextField",
        },
        employerAddress: {
          street: {
            value: "13A2Street",
            id: "10307",
            type: "PDFTextField",
          },
          city: {
            value: "13A2City",
            id: "10306",
            type: "PDFTextField",
          },
          state: {
            value: "CA",
            id: "10305",
            type: "PDFDropdown",
          },
          zipCode: {
            value: "13A2Zip",
            id: "10303",
            type: "PDFTextField",
          },
          country: {
            value: "Afghanistan",
            id: "10304",
            type: "PDFDropdown",
          },
        },
        telephone: {
          number: {
            value: "13A2Phone",
            id: "10297",
            type: "PDFTextField",
          },
          extension: {
            value: "1",
            id: "10296",
            type: "PDFTextField",
          },
          internationalOrDsn: {
            value: "Yes",
            id: "10295",
            type: "PDFCheckBox",
          },
          day: {
            value: "Yes",
            id: "10294",
            type: "PDFCheckBox",
          },
          night: {
            value: "Yes",
            id: "10293",
            type: "PDFCheckBox",
          },
        },
        periodsNotApplicable: {
          value: "Yes",
          id: "10271",
          type: "PDFCheckBox",
        },
        additionalPeriods: [
          {
            _id: 1,
            fromDate: {
              date: {
                value: "13A2FromDate1",
                id: "10363",
                type: "PDFTextField",
              },
              estimated: {
                value: "Yes",
                id: "10362",
                type: "PDFCheckBox",
              },
            },
            toDate: {
              date: {
                value: "13A2ToDate1",
                id: "10361",
                type: "PDFTextField",
              },
              estimated: {
                value: "Yes",
                id: "10360",
                type: "PDFCheckBox",
              },
            },
            positionTitle: {
              value: "PositionTitle1",
              id: "10359",
              type: "PDFTextField",
            },
            supervisor: {
              value: "Supervisor1",
              id: "10358",
              type: "PDFTextField",
            },
          },
          {
            _id: 2,
            fromDate: {
              date: {
                value: "13A2FromDate2",
                id: "10357",
                type: "PDFTextField",
              },
              estimated: {
                value: "Yes",
                id: "10356",
                type: "PDFCheckBox",
              },
            },
            toDate: {
              date: {
                value: "13A2ToDate2",
                id: "10355",
                type: "PDFTextField",
              },
              estimated: {
                value: "Yes",
                id: "10354",
                type: "PDFCheckBox",
              },
            },
            positionTitle: {
              value: "PositionTitle2",
              id: "10353",
              type: "PDFTextField",
            },
            supervisor: {
              value: "Supervisor2",
              id: "10352",
              type: "PDFTextField",
            },
          },
          {
            _id: 3,
            fromDate: {
              date: {
                value: "13A2FromDate3",
                id: "10351",
                type: "PDFTextField",
              },
              estimated: {
                value: "Yes",
                id: "10350",
                type: "PDFCheckBox",
              },
            },
            toDate: {
              date: {
                value: "13A2ToDate3",
                id: "10349",
                type: "PDFTextField",
              },
              estimated: {
                value: "Yes",
                id: "10348",
                type: "PDFCheckBox",
              },
            },
            positionTitle: {
              value: "PositionTitle3",
              id: "10347",
              type: "PDFTextField",
            },
            supervisor: {
              value: "Supervisor3",
              id: "10346",
              type: "PDFTextField",
            },
          },
          {
            _id: 4,
            fromDate: {
              date: {
                value: "13A2FromDate4",
                id: "10345",
                type: "PDFTextField",
              },
              estimated: {
                value: "Yes",
                id: "10344",
                type: "PDFCheckBox",
              },
            },
            toDate: {
              date: {
                value: "13A2ToDate4",
                id: "10343",
                type: "PDFTextField",
              },
              estimated: {
                value: "Yes",
                id: "10342",
                type: "PDFCheckBox",
              },
            },
            positionTitle: {
              value: "PositionTitle4",
              id: "10341",
              type: "PDFTextField",
            },
            supervisor: {
              value: "Supervisor4",
              id: "10340",
              type: "PDFTextField",
            },
          },
        ],
        physicalWorkAddress: {
          differentThanEmployer: {
            value: "YES ",
            id: "17159",
            type: "PDFRadioGroup",
          },
          aLocation: {
            street: {
              value: "a13A2Street",
              id: "10289",
              type: "PDFTextField",
            },
            city: {
              value: "a13A2City",
              id: "10288",
              type: "PDFTextField",
            },
            state: {
              value: "AZ",
              id: "10287",
              type: "PDFDropdown",
            },
            zipCode: {
              value: "a13A2Zip",
              id: "10285",
              type: "PDFTextField",
            },
            country: {
              value: "Antarctica",
              id: "10286",
              type: "PDFDropdown",
            },
          },
          telephone: {
            number: {
              value: "a13A2Phone",
              id: "10292",
              type: "PDFTextField",
            },
            extension: {
              value: "1",
              id: "10291",
              type: "PDFTextField",
            },
            internationalOrDsn: {
              value: "Yes",
              id: "10290",
              type: "PDFCheckBox",
            },
            day: {
              value: "Yes",
              id: "10284",
              type: "PDFCheckBox",
            },
            night: {
              value: "Yes",
              id: "10283",
              type: "PDFCheckBox",
            },
          },
          b1Location: {
            street: {
              value: "a13A2Street",
              id: "10332",
              type: "PDFTextField",
            },
            city: {
              value: "a13A2City",
              id: "10331",
              type: "PDFTextField",
            },
            state: {
              value: "AZ",
              id: "10330",
              type: "PDFDropdown",
            },
            zipCode: {
              value: "a13A2Zip",
              id: "10324",
              type: "PDFTextField",
            },
            country: {
              value: "Antarctica",
              id: "10329",
              type: "PDFDropdown",
            },
          },

          hasApoFpoAddress: {
            value: "YES ",
            id: "17161",
            type: "PDFRadioGroup",
          },
          apoFpoAddress: {
            dutyLocation: {
              value: "a13A1Street",
              id: "10328",
              type: "PDFTextField",
            },

            apoOrFpo: {
              value: "APO",
              id: "10327",
              type: "PDFTextField",
            },
            apoFpoStateCode: {
              value: "APO/FPO Europe",
              id: "10326",
              type: "PDFDropdown",
            },
            zipcode: {
              value: "zipcode",
              id: "10325",
              type: "PDFTextField",
            },
          },
        },
        supervisor: {
          name: {
            value: "13A2SupervisorName",
            id: "10309",
            type: "PDFTextField",
          },
          rankOrPosition: {
            value: "13A2SupervisorTitle",
            id: "10308",
            type: "PDFTextField",
          },
          email: {
            value: "13A2SupervisorEmail",
            id: "10334",
            type: "PDFTextField",
          },
          emailUnknown: {
            value: "Yes",
            id: "10333",
            type: "PDFCheckBox",
          },
          phone: {
            number: {
              value: "13A2SupervisorPhone",
              id: "10339",
              type: "PDFTextField",
            },
            extension: {
              value: "1",
              id: "10338",
              type: "PDFTextField",
            },
            internationalOrDsn: {
              value: "Yes",
              id: "10337",
              type: "PDFCheckBox",
            },
            day: {
              value: "Yes",
              id: "10336",
              type: "PDFCheckBox",
            },
            night: {
              value: "Yes",
              id: "10335",
              type: "PDFCheckBox",
            },
          },
          physicalWorkLocation: {
            street: {
              value: "13A2SupervisorStreet",
              id: "10302",
              type: "PDFTextField",
            },
            city: {
              value: "13A2SupervisorCity",
              id: "10301",
              type: "PDFTextField",
            },
            state: {
              value: "CA",
              id: "10300",
              type: "PDFDropdown",
            },
            zipCode: {
              value: "13A2Supervisor",
              id: "10298",
              type: "PDFTextField",
            },
            country: {
              value: "Bahrain",
              id: "10299",
              type: "PDFDropdown",
            },
          },
          hasAPOFPOAddress: {
            value: "YES ",
            id: "17162",
            type: "PDFRadioGroup",
          },
          apoFPOAddress: {
            dutyLocation: {
              value: "b13A2SupervisorAddress",
              id: "10317",
              type: "PDFTextField",
            },
            apoOrFpo: {
              value: "b13A2SupervisorAPO",
              id: "10316",
              type: "PDFTextField",
            },
            apoFpoStateCode: {
              value: "APO/FPO Pacific",
              id: "10315",
              type: "PDFDropdown",
            },
            zipcode: {
              value: "b13A2SupervisorZip",
              id: "10314",
              type: "PDFTextField",
            },
          },
          aLocation: {
            street: {
              value: "13A2SupervisorStreet",
              id: "10321",
              type: "PDFTextField",
            },
            city: {
              value: "13A2SupervisorCity",
              id: "10320",
              type: "PDFTextField",
            },
            state: {
              value: "CA",
              id: "10319",
              type: "PDFDropdown",
            },
            zipCode: {
              value: "13A2Supervisor",
              id: "10313",
              type: "PDFTextField",
            },
            country: {
              value: "Bahrain",
              id: "10318",
              type: "PDFDropdown",
            },
          },
        },
      },
      section13A3: {
        fromDate: {
          date: { value: "13A3Start", id: "10404", type: "PDFTextField" },
          estimated: { value: "Yes", id: "10405", type: "PDFCheckBox" },
        },
        toDate: {
          date: { value: "13A3To", id: "10406", type: "PDFTextField" },
          estimated: { value: "Yes", id: "10408", type: "PDFCheckBox" },
          present: { value: "Yes", id: "10407", type: "PDFCheckBox" },
        },
        employmentStatus: {
          fullTime: { value: "Yes", id: "10412", type: "PDFCheckBox" },
          partTime: { value: "Yes", id: "10411", type: "PDFCheckBox" },
        },
        positionTitle: {
          value: "13A3PositionTitle",
          id: "10409",
          type: "PDFTextField",
        },
        employmentName: {
          value: "13A3Employment",
          id: "10410",
          type: "PDFTextField",
        },
        employmentAddress: {
          street: { value: "13AStreet", id: "10427", type: "PDFTextField" },
          city: { value: "13A3City", id: "10426", type: "PDFTextField" },
          state: { value: "CT", id: "10425", type: "PDFDropdown" },
          zipCode: { value: "13A3Zip", id: "10423", type: "PDFTextField" },
          country: { value: "Algeria", id: "10424", type: "PDFDropdown" },
        },
        telephone: {
          number: { value: "13A3Phone", id: "10422", type: "PDFTextField" },
          extension: {
            value: "13A3Ext",
            id: "10421",
            type: "PDFTextField",
          },
          internationalOrDsn: {
            value: "Yes",
            id: "10420",
            type: "PDFCheckBox",
          },
          day: { value: "Yes", id: "10419", type: "PDFCheckBox" },
          night: { value: "Yes", id: "10418", type: "PDFCheckBox" },
        },
        physicalWorkAddress: {
          differentThanEmployer: {
            value: "YES",
            id: "17156",
            type: "PDFRadioGroup",
          },
          aLocation: {
            street: {
              value: "a13A3Street",
              id: "10371",
              type: "PDFTextField",
            },
            city: { value: "a13A3City", id: "10370", type: "PDFTextField" },
            state: { value: "CA", id: "10369", type: "PDFDropdown" },
            zipCode: { value: "13aZip", id: "10367", type: "PDFTextField" },
            country: {
              value: "Antarctica",
              id: "10368",
              type: "PDFDropdown",
            },
          },
          telephone: {
            number: {
              value: "a13A3Phone",
              id: "10366",
              type: "PDFTextField",
            },
            extension: {
              value: "a13A3ext",
              id: "10365",
              type: "PDFTextField",
            },
            internationalOrDsn: {
              value: "Yes",
              id: "10364",
              type: "PDFCheckBox",
            },
            day: { value: "Yes", id: "10429", type: "PDFCheckBox" },
            night: { value: "Yes", id: "10428", type: "PDFCheckBox" },
          },
          hasApoFpoAddress: {
            value: "YES ",
            id: "17157",
            type: "PDFRadioGroup",
          },
          b1Location: {
            street: {
              value: "b1_13A3Street",
              id: "10403",
              type: "PDFTextField",
            },
            city: {
              value: "b1_13A3City",
              id: "10402",
              type: "PDFTextField",
            },
            state: { value: "DC", id: "10401", type: "PDFDropdown" },
            zipCode: {
              value: "b1_13A3Zip",
              id: "10395",
              type: "PDFTextField",
            },
            country: { value: "Bahrain", id: "10400", type: "PDFDropdown" },
          },
          apoFpoAddress: {
            dutyLocation: {
              value: "b2_13A3Street",
              id: "10399",
              type: "PDFTextField",
            },
            apoOrFpo: {
              value: "13b2APO",
              id: "10398",
              type: "PDFTextField",
            },
            apoFpoStateCode: {
              value: "APO/FPO Europe",
              id: "10397",
              type: "PDFDropdown",
            },
            zipcode: {
              value: "13b2ZipCod",
              id: "10396",
              type: "PDFTextField",
            },
          },
        },
        selfEmploymentVerifier: {
          lastName: {
            value: "13A3LName",
            id: "10380",
            type: "PDFTextField",
          },
          firstName: {
            value: "13A3FName",
            id: "10379",
            type: "PDFTextField",
          },
          address: {
            street: {
              value: "13A3Street",
              id: "10378",
              type: "PDFTextField",
            },
            city: { value: "13A3City", id: "10377", type: "PDFTextField" },
            state: { value: "CT", id: "10376", type: "PDFDropdown" },
            zipCode: {
              value: "13A3Zip",
              id: "10374",
              type: "PDFTextField",
            },
            country: {
              value: "Argentina",
              id: "10375",
              type: "PDFDropdown",
            },
          },
          telephone: {
            number: {
              value: "13A3phone",
              id: "10417",
              type: "PDFTextField",
            },
            extension: {
              value: "13A3Ext",
              id: "10416",
              type: "PDFTextField",
            },
            internationalOrDsn: {
              value: "Yes",
              id: "10415",
              type: "PDFCheckBox",
            },
            day: { value: "Yes", id: "10414", type: "PDFCheckBox" },
            night: { value: "Yes", id: "10413", type: "PDFCheckBox" },
          },
          aLocation: {
            street: {
              value: "13A3Street",
              id: "10392",
              type: "PDFTextField",
            },
            city: { value: "13A3City", id: "10391", type: "PDFTextField" },
            state: { value: "CT", id: "10390", type: "PDFDropdown" },
            zipCode: {
              value: "13A3Zip",
              id: "10384",
              type: "PDFTextField",
            },
            country: {
              value: "Argentina",
              id: "10389",
              type: "PDFDropdown",
            },
          },
          hasAPOFPOAddress: {
            value: "YES ",
            id: "17158",
            type: "PDFRadioGroup",
          },
          apoFpoAddress: {
            dutyLocation: {
              value: "bb13A3Street",
              id: "10388",
              type: "PDFTextField",
            },
            apoOrFpo: {
              value: "bb13A3APO",
              id: "10387",
              type: "PDFTextField",
            },
            apoFpoStateCode: {
              value: "APO/FPO Pacific",
              id: "10386",
              type: "PDFDropdown",
            },
            zipCode: {
              value: "bb13A3Zip",
              id: "10385",
              type: "PDFTextField",
            },
          },
        },
      },
      section13A4: {
        fromDate: {
          date: {
            value: "13A4FromDate",
            id: "10485",
            type: "PDFTextField",
          },
          estimated: { value: "Yes", id: "10486", type: "PDFCheckBox" },
        },
        toDate: {
          date: { value: "13A4ToDate", id: "10487", type: "PDFTextField" },
          estimated: { value: "Yes", id: "10488", type: "PDFCheckBox" },
          present: { value: "Yes", id: "10489", type: "PDFCheckBox" },
        },
        verifier: {
          lastName: {
            value: "13A4LName",
            id: "10491",
            type: "PDFTextField",
          },
          firstName: {
            value: "13A4FName",
            id: "10490",
            type: "PDFTextField",
          },
          address: {
            street: {
              value: "13A4Street",
              id: "10484",
              type: "PDFTextField",
            },
            city: { value: "13A4City", id: "10483", type: "PDFTextField" },
            state: { value: "AL", id: "10482", type: "PDFDropdown" },
            zipCode: {
              value: "13A4Zip",
              id: "10480",
              type: "PDFTextField",
            },
            country: {
              value: "Antarctica",
              id: "10481",
              type: "PDFDropdown",
            },
          },
          telephone: {
            number: {
              value: "13A4Phone",
              id: "10479",
              type: "PDFTextField",
            },
            extension: {
              value: "13A4Ext",
              id: "10478",
              type: "PDFTextField",
            },
            internationalOrDsn: {
              value: "Yes",
              id: "10477",
              type: "PDFCheckBox",
            },
            day: { value: "Yes", id: "10476", type: "PDFCheckBox" },
            night: { value: "Yes", id: "10475", type: "PDFCheckBox" },
          },
          hasApoFpoAddress: {
            value: "YES ",
            id: "17155",
            type: "PDFRadioGroup",
          },
          aLocation: {
            street: {
              value: "a13A4Street",
              id: "10440",
              type: "PDFTextField",
            },
            city: { value: "a13A4City", id: "10439", type: "PDFTextField" },
            state: { value: "AR", id: "10438", type: "PDFDropdown" },
            zipCode: {
              value: "a13A4Zip",
              id: "10432",
              type: "PDFTextField",
            },
            country: {
              value: "Anguilla",
              id: "10437",
              type: "PDFDropdown",
            },
          },
          apoFpoAddress: {
            dutyLocation: {
              value: "b13A4Street",
              id: "10436",
              type: "PDFTextField",
            },
            apoOrFpo: {
              value: "b13A4APO",
              id: "10435",
              type: "PDFTextField",
            },
            apoFpoStateCode: {
              value: "APO/FPO Pacific",
              id: "10434",
              type: "PDFDropdown",
            },
            zipCode: {
              value: "b13A4Zip",
              id: "10433",
              type: "PDFTextField",
            },
          },
        },
      },
      section13A5: {
        reasonForLeaving: {
          value: "13A5ResonForLEaving",
          id: "10473",
          type: "PDFTextField",
        },
        incidentInLastSevenYears: {
          value: "NO (If NO, proceed to 13A.6)",
          id: "17150",
          type: "PDFRadioGroup",
        },
        incidentDetails: [
          {
            type: {
              value: "Yes",
              id: "10470",
              type: "PDFCheckBox",
            },
            reason: {
              value: "13A5ReasonForBeingFired",
              id: "10463",
              type: "PDFTextField",
            },
            departureDate: {
              value: "13A5DateFired",
              id: "10461",
              type: "PDFTextField",
            },
            estimated: {
              value: "Yes",
              id: "10462",
              type: "PDFCheckBox",
            },
          },
          {
            type: {
              value: "Yes",
              id: "10469",
              type: "PDFCheckBox",
            },
            reason: {
              value: "13A5ReasonForQuitting",
              id: "10464",
              type: "PDFTextField",
            },
            departureDate: {
              value: "13A5DateQuit",
              id: "10460",
              type: "PDFTextField",
            },
            estimated: {
              value: "Yes",
              id: "10459",
              type: "PDFCheckBox",
            },
          },
          {
            type: {
              value: "Yes",
              id: "10468",
              type: "PDFCheckBox",
            },
            reason: {
              value: "13A5ChargesorAllegations",
              id: "10465",
              type: "PDFTextField",
            },
            departureDate: {
              value: "13A5DateLeft",
              id: "10456",
              type: "PDFTextField",
            },
            estimated: {
              value: "Yes",
              id: "10455",
              type: "PDFCheckBox",
            },
          },
          {
            type: {
              value: "Yes",
              id: "10467",
              type: "PDFCheckBox",
            },
            reason: {
              value: "13A5ReasonforUnsatisfactory",
              id: "10466",
              type: "PDFTextField",
            },
            departureDate: {
              value: "13A5DateLeftMutual",
              id: "10458",
              type: "PDFTextField",
            },
            estimated: {
              value: "Yes",
              id: "10457",
              type: "PDFCheckBox",
            },
          },
        ],
      },
      section13A6: {
        warnedInLastSevenYears: {
          value: "YES",
          id: "17154",
          type: "PDFRadioGroup",
        },
        warningDetails: [
          {
            reason: {
              value: "13A6Reason1",
              id: "10453",
              type: "PDFTextField",
            },
            date: {
              date: {
                value: "13A6Date1",
                id: "10451",
                type: "PDFTextField",
              },
              estimated: {
                value: "Yes",
                id: "10452",
                type: "PDFCheckBox",
              },
            },
          },
          {
            reason: {
              value: "13A6Reason2",
              id: "10454",
              type: "PDFTextField",
            },
            date: {
              date: {
                value: "13A6Date2",
                id: "10450",
                type: "PDFTextField",
              },
              estimated: {
                value: "Yes",
                id: "10449",
                type: "PDFCheckBox",
              },
            },
          },
          {
            reason: {
              value: "13A6Reason3",
              id: "10447",
              type: "PDFTextField",
            },
            date: {
              date: {
                value: "13A6Date3",
                id: "10445",
                type: "PDFTextField",
              },
              estimated: {
                value: "Yes",
                id: "10446",
                type: "PDFCheckBox",
              },
            },
          },
          {
            reason: {
              value: "13A6Reason4",
              id: "10448",
              type: "PDFTextField",
            },
            date: {
              date: {
                value: "13A6Date4",
                id: "10444",
                type: "PDFTextField",
              },
              estimated: {
                value: "Yes",
                id: "10443",
                type: "PDFCheckBox",
              },
            },
          },
        ],
      },
    },

    {
      _id: 2,
      employmentActivity: {
        value:
          "Other (Provide explanation and complete 13A.2, 13A.5 and 13A.6)",
        id: "17148",
        type: "PDFRadioGroup",
      },
      otherExplanation: {
        value: "13OtherExplanation",
        id: "10536",
        type: "PDFTextField",
      },
      section13A1: {
        fromDate: {
          date: {
            value: "13A1StartDate",
            id: "10532",
            type: "PDFTextField",
          },
          estimated: {
            value: "Yes",
            id: "10535",
            type: "PDFCheckBox",
          },
        },
        toDate: {
          date: {
            value: "13A1ToDate",
            id: "10529",
            type: "PDFTextField",
          },
          estimated: {
            value: "Yes",
            id: "10534",
            type: "PDFCheckBox",
          },
          present: {
            value: "Yes",
            id: "10533",
            type: "PDFCheckBox",
          },
        },
        employmentStatus: {
          fullTime: {
            value: "Yes",
            id: "10531",
            type: "PDFCheckBox",
          },
          partTime: {
            value: "Yes",
            id: "10530",
            type: "PDFCheckBox",
          },
        },
        dutyStation: {
          value: "13A1DutyStation",
          id: "10527",
          type: "PDFTextField",
        },
        rankOrPosition: {
          value: "13A1RankTitle",
          id: "10528",
          type: "PDFTextField",
        },
        address: {
          street: {
            value: "13A1DutyStreet",
            id: "10549",
            type: "PDFTextField",
          },
          city: {
            value: "13A1DutyCity",
            id: "10548",
            type: "PDFTextField",
          },
          state: {
            value: "AL",
            id: "10547",
            type: "PDFDropdown",
          },
          zipCode: {
            value: "13A1DutyZip",
            id: "10545",
            type: "PDFTextField",
          },
          country: {
            value: "Afghanistan",
            id: "10546",
            type: "PDFDropdown",
          },
        },
        telephone: {
          number: {
            value: "13A1Phone",
            id: "10543",
            type: "PDFTextField",
          },
          extension: {
            value: "1",
            id: "10542",
            type: "PDFTextField",
          },
          internationalOrDsn: {
            value: "Yes",
            id: "10541",
            type: "PDFCheckBox",
          },
          day: {
            value: "Yes",
            id: "10540",
            type: "PDFCheckBox",
          },
          night: {
            value: "Yes",
            id: "10539",
            type: "PDFCheckBox",
          },
        },
        aLocation: {
          street: {
            value: "13A1SupervisorAddress",
            id: "10516",
            type: "PDFTextField",
          },
          city: {
            value: "13A1SupervisorCity",
            id: "10515",
            type: "PDFTextField",
          },
          state: {
            value: "DC",
            id: "10514",
            type: "PDFDropdown",
          },
          zipCode: {
            value: "13A1Superviso",
            id: "10508",
            type: "PDFTextField",
          },
          country: {
            value: "Argentina",
            id: "10513",
            type: "PDFDropdown",
          },
        },
        hasAPOFPOAddress: {
          value: "YES ",
          id: "17149",
          type: "PDFRadioGroup",
        },
        apoFPOAddress: {
          street: {
            value: "10512",
            id: "10512",
            type: "PDFTextField",
          },
          apoOrFpo: {
            value: "APO",
            id: "10511",
            type: "PDFTextField",
          },
          apoFpoStateCode: {
            value: "APO/FPO Europe",
            id: "10510",
            type: "PDFDropdown",
          },
          zipCode: {
            value: "bZip",
            id: "10509",
            type: "PDFTextField",
          },
        },
        supervisor: {
          name: {
            value: "13A1SupervisorName",
            id: "10505",
            type: "PDFTextField",
          },
          rankOrPosition: {
            value: "13A1SupervisorRankTitle",
            id: "10504",
            type: "PDFTextField",
          },
          email: {
            value: "13A1SupervisorEmail",
            id: "10538",
            type: "PDFTextField",
          },
          emailUnknown: {
            value: "Yes",
            id: "10537",
            type: "PDFCheckBox",
          },
          phone: {
            number: {
              value: "13A1SupervisorPhone",
              id: "10503",
              type: "PDFTextField",
            },
            extension: {
              value: "13A1Sup",
              id: "10502",
              type: "PDFTextField",
            },
            internationalOrDsn: {
              value: "Yes",
              id: "10552",
              type: "PDFCheckBox",
            },
            day: {
              value: "Yes",
              id: "10551",
              type: "PDFCheckBox",
            },
            night: {
              value: "Yes",
              id: "10550",
              type: "PDFCheckBox",
            },
          },
          physicalWorkLocation: {
            street: {
              value: "13A1SupervisorAddress",
              id: "10501",
              type: "PDFTextField",
            },
            city: {
              value: "13A1SupervisorCity",
              id: "10500",
              type: "PDFTextField",
            },
            state: {
              value: "DC",
              id: "10499",
              type: "PDFDropdown",
            },
            zipCode: {
              value: "13A1Superviso",
              id: "10497",
              type: "PDFTextField",
            },
            country: {
              value: "Argentina",
              id: "10498",
              type: "PDFDropdown",
            },
          },
          apoFpoAddress: {
            street: {
              value: "a13A1Street",
              id: "10496",
              type: "PDFTextField",
            },
            city: {
              value: "a13A1City",
              id: "10495",
              type: "PDFTextField",
            },
            state: {
              value: "AS",
              id: "10494",
              type: "PDFDropdown",
            },
            zipCode: {
              value: "a13A1Zip",
              id: "10492",
              type: "PDFTextField",
            },
            country: {
              value: "Angola",
              id: "10493",
              type: "PDFDropdown",
            },
          },
        },
      },

      section13A2: {
        fromDate: {
          date: {
            value: "13A2FromDate",
            id: "10613",
            type: "PDFTextField",
          },
          estimated: {
            value: "Yes",
            id: "10614",
            type: "PDFCheckBox",
          },
        },
        toDate: {
          date: {
            value: "13A2ToDate",
            id: "10615",
            type: "PDFTextField",
          },
          estimated: {
            value: "Yes",
            id: "10612",
            type: "PDFCheckBox",
          },
          present: {
            value: "Yes",
            id: "10617",
            type: "PDFCheckBox",
          },
        },
        employmentStatus: {
          fullTime: {
            value: "Yes",
            id: "10620",
            type: "PDFCheckBox",
          },
          partTime: {
            value: "Yes",
            id: "10616",
            type: "PDFCheckBox",
          },
        },
        positionTitle: {
          value: "13A2RecentTitle",
          id: "10618",
          type: "PDFTextField",
        },
        employerName: {
          value: "13A2RecentEmployer",
          id: "10619",
          type: "PDFTextField",
        },
        employerAddress: {
          street: {
            value: "13A2Street",
            id: "10555",
            type: "PDFTextField",
          },
          city: {
            value: "13A2City",
            id: "10554",
            type: "PDFTextField",
          },
          state: {
            value: "AK",
            id: "10553",
            type: "PDFDropdown",
          },
          zipCode: {
            value: "13A2Zip",
            id: "10644",
            type: "PDFTextField",
          },
          country: {
            value: "Afghanistan",
            id: "10645",
            type: "PDFDropdown",
          },
        },
        telephone: {
          number: {
            value: "13A2Phone",
            id: "10638",
            type: "PDFTextField",
          },
          extension: {
            value: "1",
            id: "10637",
            type: "PDFTextField",
          },
          internationalOrDsn: {
            value: "Yes",
            id: "10636",
            type: "PDFCheckBox",
          },
          day: {
            value: "Yes",
            id: "10635",
            type: "PDFCheckBox",
          },
          night: {
            value: "Yes",
            id: "10634",
            type: "PDFCheckBox",
          },
        },
        periodsNotApplicable: {
          value: "Yes",
          id: "10621",
          type: "PDFCheckBox",
        },
        additionalPeriods: [
          {
            _id: 1,
            fromDate: {
              date: {
                value: "13A2FromDate1",
                id: "10611",
                type: "PDFTextField",
              },
              estimated: {
                value: "Yes",
                id: "10610",
                type: "PDFCheckBox",
              },
            },
            toDate: {
              date: {
                value: "13A2ToDate1",
                id: "10609",
                type: "PDFTextField",
              },
              estimated: {
                value: "Yes",
                id: "10608",
                type: "PDFCheckBox",
              },
            },
            positionTitle: {
              value: "PositionTitle1",
              id: "10607",
              type: "PDFTextField",
            },
            supervisor: {
              value: "Supervisor1",
              id: "10606",
              type: "PDFTextField",
            },
          },
          {
            _id: 2,
            fromDate: {
              date: {
                value: "13A2FromDate2",
                id: "10605",
                type: "PDFTextField",
              },
              estimated: {
                value: "Yes",
                id: "10604",
                type: "PDFCheckBox",
              },
            },
            toDate: {
              date: {
                value: "13A2ToDate2",
                id: "10603",
                type: "PDFTextField",
              },
              estimated: {
                value: "Yes",
                id: "10602",
                type: "PDFCheckBox",
              },
            },
            positionTitle: {
              value: "PositionTitle2",
              id: "10601",
              type: "PDFTextField",
            },
            supervisor: {
              value: "Supervisor2",
              id: "10600",
              type: "PDFTextField",
            },
          },
          {
            _id: 3,
            fromDate: {
              date: {
                value: "13A2FromDate3",
                id: "10599",
                type: "PDFTextField",
              },
              estimated: {
                value: "Yes",
                id: "10598",
                type: "PDFCheckBox",
              },
            },
            toDate: {
              date: {
                value: "13A2ToDate3",
                id: "10597",
                type: "PDFTextField",
              },
              estimated: {
                value: "Yes",
                id: "10596",
                type: "PDFCheckBox",
              },
            },
            positionTitle: {
              value: "PositionTitle3",
              id: "10595",
              type: "PDFTextField",
            },
            supervisor: {
              value: "Supervisor3",
              id: "10594",
              type: "PDFTextField",
            },
          },
          {
            _id: 4,
            fromDate: {
              date: {
                value: "13A2FromDate4",
                id: "10593",
                type: "PDFTextField",
              },
              estimated: {
                value: "Yes",
                id: "10592",
                type: "PDFCheckBox",
              },
            },
            toDate: {
              date: {
                value: "13A2ToDate4",
                id: "10591",
                type: "PDFTextField",
              },
              estimated: {
                value: "Yes",
                id: "10590",
                type: "PDFCheckBox",
              },
            },
            positionTitle: {
              value: "PositionTitle4",
              id: "10589",
              type: "PDFTextField",
            },
            supervisor: {
              value: "Supervisor4",
              id: "10588",
              type: "PDFTextField",
            },
          },
        ],
        physicalWorkAddress: {
          differentThanEmployer: {
            value: "NO (If NO, proceed to (b))",
            id: "17140",
            type: "PDFRadioGroup",
          },
          aLocation: {
            street: {
              value: "a13A2Street",
              id: "10630",
              type: "PDFTextField",
            },
            city: {
              value: "a13A2City",
              id: "10629",
              type: "PDFTextField",
            },
            state: {
              value: "AL",
              id: "10628",
              type: "PDFDropdown",
            },
            zipCode: {
              value: "a13A2Zip",
              id: "10626",
              type: "PDFTextField",
            },
            country: {
              value: "Albania",
              id: "10627",
              type: "PDFDropdown",
            },
          },
          telephone: {
            number: {
              value: "a13A2Phone",
              id: "10633",
              type: "PDFTextField",
            },
            extension: {
              value: "1",
              id: "10632",
              type: "PDFTextField",
            },
            internationalOrDsn: {
              value: "Yes",
              id: "10631",
              type: "PDFCheckBox",
            },
            day: {
              value: "Yes",
              id: "10625",
              type: "PDFCheckBox",
            },
            night: {
              value: "Yes",
              id: "10624",
              type: "PDFCheckBox",
            },
          },
          b1Location: {
            street: {
              value: "b1Street",
              id: "10580",
              type: "PDFTextField",
            },
            city: {
              value: "b1City",
              id: "10579",
              type: "PDFTextField",
            },
            state: {
              value: "AK",
              id: "10578",
              type: "PDFDropdown",
            },
            zipCode: {
              value: "b1Zip",
              id: "10572",
              type: "PDFTextField",
            },
            country: {
              value: "Afghanistan",
              id: "10577",
              type: "PDFDropdown",
            },
          },
          apoFpoAddress: {
            street: {
              value: "b2Street",
              id: "10576",
              type: "PDFTextField",
            },

            apoFpoStateCode: {
              value: "b2Zip",
              id: "10574",
              type: "PDFTextField",
            },
            apoOrFpo: {
              value: "b2Zip",
              id: "10575",
              type: "PDFTextField",
            },
            zipCode: {
              value: "b2Zip",
              id: "10573",
              type: "PDFTextField",
            },
          },
          hasApoFpoAddress: {
            value: "NO",
            id: "17142",
            type: "PDFRadioGroup",
          },
        },
        supervisor: {
          name: {
            value: "13A2SupervisorName",
            id: "10557",
            type: "PDFTextField",
          },
          rankOrPosition: {
            value: "13A2SupervisorTitle",
            id: "10556",
            type: "PDFTextField",
          },
          email: {
            value: "13A2SupervisorEmail",
            id: "10582",
            type: "PDFTextField",
          },
          emailUnknown: {
            value: "Yes",
            id: "10581",
            type: "PDFCheckBox",
          },
          phone: {
            number: {
              value: "13A2SupervisorPhone",
              id: "10587",
              type: "PDFTextField",
            },
            extension: {
              value: "1",
              id: "10586",
              type: "PDFTextField",
            },
            internationalOrDsn: {
              value: "Yes",
              id: "10585",
              type: "PDFCheckBox",
            },
            day: {
              value: "Yes",
              id: "10584",
              type: "PDFCheckBox",
            },
            night: {
              value: "Yes",
              id: "10583",
              type: "PDFCheckBox",
            },
          },
          physicalWorkLocation: {
            street: {
              value: "13A2SupervisorStreet",
              id: "10643",
              type: "PDFTextField",
            },
            city: {
              value: "13A2SupervisorCity",
              id: "10642",
              type: "PDFTextField",
            },
            state: {
              value: "CA",
              id: "10641",
              type: "PDFDropdown",
            },
            zipCode: {
              value: "13A2Supervisor",
              id: "10639",
              type: "PDFTextField",
            },
            country: {
              value: "Bahrain",
              id: "10640",
              type: "PDFDropdown",
            },
          },
          hasAPOFPOAddress: {
            value: "YES ",
            id: "17143",
            type: "PDFRadioGroup",
          },
          apoFPOAddress: {
            street: {
              value: "b13A2SupervisorAddress",
              id: "10565",
              type: "PDFTextField",
            },
            apoOrFpo: {
              value: "b13A2SupervisorAPO",
              id: "10564",
              type: "PDFTextField",
            },
            apoFpoStateCode: {
              value: "APO/FPO Pacific",
              id: "10563",
              type: "PDFDropdown",
            },
            zipCode: {
              value: "b13A2SupervisorZip",
              id: "10562",
              type: "PDFTextField",
            },
          },
          aLocation: {
            street: {
              value: "13A2SupervisorStreet",
              id: "10569",
              type: "PDFTextField",
            },
            city: {
              value: "13A2SupervisorCity",
              id: "10568",
              type: "PDFTextField",
            },
            state: {
              value: "CA",
              id: "10567",
              type: "PDFDropdown",
            },
            zipCode: {
              value: "13A2Supervisor",
              id: "10561",
              type: "PDFTextField",
            },
            country: {
              value: "Bahrain",
              id: "10566",
              type: "PDFDropdown",
            },
          },
        },
      },

      section13A3: {
        fromDate: {
          date: {
            value: "FromDate",
            id: "10668",
            type: "PDFTextField",
          },
          estimated: {
            value: "Yes",
            id: "10669",
            type: "PDFCheckBox",
          },
        },
        toDate: {
          date: {
            value: "ToDate",
            id: "10670",
            type: "PDFTextField",
          },
          estimated: {
            value: "Yes",
            id: "10672",
            type: "PDFCheckBox",
          },
          present: {
            value: "Yes",
            id: "10671",
            type: "PDFCheckBox",
          },
        },
        employmentStatus: {
          fullTime: {
            value: "Yes",
            id: "10676",
            type: "PDFCheckBox",
          },
          partTime: {
            value: "Yes",
            id: "10675",
            type: "PDFCheckBox",
          },
        },
        positionTitle: {
          value: "RecentPositionTitle",
          id: "10673",
          type: "PDFTextField",
        },
        employmentName: {
          value: "NameOfEmployment",
          id: "10674",
          type: "PDFTextField",
        },
        employmentAddress: {
          street: {
            value: "EmploymentStreet",
            id: "10691",
            type: "PDFTextField",
          },
          city: {
            value: "EmploymentCity",
            id: "10690",
            type: "PDFTextField",
          },
          state: {
            value: "AK",
            id: "10689",
            type: "PDFDropdown",
          },
          zipCode: {
            value: "EmploymentZip",
            id: "10687",
            type: "PDFTextField",
          },
          country: {
            value: "Afghanistan",
            id: "10688",
            type: "PDFDropdown",
          },
        },
        telephone: {
          number: {
            value: "EmploymentPhone",
            id: "10686",
            type: "PDFTextField",
          },
          extension: {
            value: "EXT",
            id: "10685",
            type: "PDFTextField",
          },
          internationalOrDsn: {
            value: "Yes",
            id: "10684",
            type: "PDFCheckBox",
          },
          day: {
            value: "Yes",
            id: "10683",
            type: "PDFCheckBox",
          },
          night: {
            value: "Yes",
            id: "10682",
            type: "PDFCheckBox",
          },
        },
        physicalWorkAddress: {
          differentThanEmployer: {
            value: "YES",
            id: "17137",
            type: "PDFRadioGroup",
          },
          aLocation: {
            street: {
              value: "aWorkStreet",
              id: "10701",
              type: "PDFTextField",
            },
            city: {
              value: "aWorkCity",
              id: "10700",
              type: "PDFTextField",
            },
            state: {
              value: "AR",
              id: "10699",
              type: "PDFDropdown",
            },
            zipCode: {
              value: "aWorkZip",
              id: "10697",
              type: "PDFTextField",
            },
            country: {
              value: "Albania",
              id: "10698",
              type: "PDFDropdown",
            },
          },
          telephone: {
            number: {
              value: "aWorkPhone",
              id: "10696",
              type: "PDFTextField",
            },
            extension: {
              value: "aEXT",
              id: "10695",
              type: "PDFTextField",
            },
            internationalOrDsn: {
              value: "Yes",
              id: "10694",
              type: "PDFCheckBox",
            },
            day: {
              value: "Yes",
              id: "10693",
              type: "PDFCheckBox",
            },
            night: {
              value: "Yes",
              id: "10692",
              type: "PDFCheckBox",
            },
          },
          hasApoFpoAddress: {
            value: "YES ",
            id: "17138",
            type: "PDFRadioGroup",
          },
          b1Location: {
            street: {
              value: "b1Street",
              id: "10667",
              type: "PDFTextField",
            },
            city: {
              value: "b1City",
              id: "10666",
              type: "PDFTextField",
            },
            state: {
              value: "DC",
              id: "10665",
              type: "PDFDropdown",
            },
            zipCode: {
              value: "b1Zip",
              id: "10620",
              type: "PDFTextField",
            },
            country: {
              value: "Bahrain",
              id: "10664",
              type: "PDFDropdown",
            },
          },
          apoFpoAddress: {
            street: {
              value: "b2Street",
              id: "10663",
              type: "PDFTextField",
            },
            apoOrFpo: {
              value: "b2APO",
              id: "10662",
              type: "PDFTextField",
            },
            apoFpoStateCode: {
              value: "APO/FPO America",
              id: "10661",
              type: "PDFDropdown",
            },
            zipCode: {
              value: "b2Zip",
              id: "10660",
              type: "PDFTextField",
            },
          },
        },
        selfEmploymentVerifier: {
          lastName: {
            value: "VerifyerLastName",
            id: "10710",
            type: "PDFTextField",
          },
          firstName: {
            value: "VerifyerFirstName",
            id: "10709",
            type: "PDFTextField",
          },
          address: {
            street: {
              value: "VerifyerStreet",
              id: "10708",
              type: "PDFTextField",
            },
            city: {
              value: "VeryfierCity",
              id: "10707",
              type: "PDFTextField",
            },
            state: {
              value: "CT",
              id: "10706",
              type: "PDFDropdown",
            },
            zipCode: {
              value: "VeryfierZip",
              id: "10704",
              type: "PDFTextField",
            },
            country: {
              value: "Argentina",
              id: "10705",
              type: "PDFDropdown",
            },
          },
          telephone: {
            number: {
              value: "VeryfierPhone",
              id: "10681",
              type: "PDFTextField",
            },
            extension: {
              value: "VeryfierEX",
              id: "10680",
              type: "PDFTextField",
            },
            internationalOrDsn: {
              value: "Yes",
              id: "10679",
              type: "PDFCheckBox",
            },
            day: {
              value: "Yes",
              id: "10678",
              type: "PDFCheckBox",
            },
            night: {
              value: "Yes",
              id: "10677",
              type: "PDFCheckBox",
            },
          },
          aLocation: {
            street: {
              value: "13A3Street",
              id: "10656",
              type: "PDFTextField",
            },
            city: {
              value: "13A3City",
              id: "10655",
              type: "PDFTextField",
            },
            state: {
              value: "CT",
              id: "10654",
              type: "PDFDropdown",
            },
            zipCode: {
              value: "13A3Zip",
              id: "10648",
              type: "PDFTextField",
            },
            country: {
              value: "Argentina",
              id: "10653",
              type: "PDFDropdown",
            },
          },
          hasAPOFPOAddress: {
            value: "YES ",
            id: "17139",
            type: "PDFRadioGroup",
          },
          apoFpoAddress: {
            street: {
              value: "b2Street",
              id: "10652",
              type: "PDFTextField",
            },
            apoOrFpo: {
              value: "b2APO",
              id: "10651",
              type: "PDFTextField",
            },
            apoFpoStateCode: {
              value: "APO/FPO America",
              id: "10650",
              type: "PDFDropdown",
            },
            zipCode: {
              value: "b2Zip",
              id: "10649",
              type: "PDFTextField",
            },
          },
        },
      },

      section13A4: {
        fromDate: {
          date: {
            value: "13A4FromDate",
            id: "10738",
            type: "PDFTextField",
          },
          estimated: { value: "Yes", id: "10739", type: "PDFCheckBox" },
        },
        toDate: {
          date: { value: "13A4ToDate", id: "10740", type: "PDFTextField" },
          estimated: { value: "Yes", id: "10742", type: "PDFCheckBox" },
          present: { value: "Yes", id: "10741", type: "PDFCheckBox" },
        },
        verifier: {
          lastName: {
            value: "13A4LName",
            id: "10744",
            type: "PDFTextField",
          },
          firstName: {
            value: "13A4FName",
            id: "10743",
            type: "PDFTextField",
          },
          address: {
            street: {
              value: "13A4Street",
              id: "10737",
              type: "PDFTextField",
            },
            city: { value: "13A4City", id: "10736", type: "PDFTextField" },
            state: { value: "AL", id: "10735", type: "PDFDropdown" },
            zipCode: {
              value: "13A4Zip",
              id: "10733",
              type: "PDFTextField",
            },
            country: {
              value: "Antarctica",
              id: "10734",
              type: "PDFDropdown",
            },
          },
          telephone: {
            number: {
              value: "13A4Phone",
              id: "10732",
              type: "PDFTextField",
            },
            extension: {
              value: "13A4Ext",
              id: "10731",
              type: "PDFTextField",
            },
            internationalOrDsn: {
              value: "Yes",
              id: "10730",
              type: "PDFCheckBox",
            },
            day: { value: "Yes", id: "10729", type: "PDFCheckBox" },
            night: { value: "Yes", id: "10728", type: "PDFCheckBox" },
          },
          hasApoFpoAddress: {
            value: "YES ",
            id: "17136",
            type: "PDFRadioGroup",
          },
          aLocation: {
            street: {
              value: "a13A4Street",
              id: "10755",
              type: "PDFTextField",
            },
            city: { value: "a13A4City", id: "10754", type: "PDFTextField" },
            state: { value: "AR", id: "10753", type: "PDFDropdown" },
            zipCode: {
              value: "a13A4Zip",
              id: "10747",
              type: "PDFTextField",
            },
            country: {
              value: "Anguilla",
              id: "10752",
              type: "PDFDropdown",
            },
          },
          apoFpoAddress: {
            dutyLocation: {
              value: "b13A4Street",
              id: "10751",
              type: "PDFTextField",
            },
            apoOrFpo: {
              value: "b13A4APO",
              id: "10750",
              type: "PDFTextField",
            },
            apoFpoStateCode: {
              value: "APO/FPO Pacific",
              id: "10749",
              type: "PDFDropdown",
            },
            zipCode: {
              value: "b13A4Zip",
              id: "10748",
              type: "PDFTextField",
            },
          },
        },
      },

      section13A5: {
        reasonForLeaving: {
          value: "13A5ResonForLEaving",
          id: "10726",
          type: "PDFTextField",
        },
        incidentInLastSevenYears: {
          value: "NO (If NO, proceed to 13A.6)",
          id: "17131",
          type: "PDFRadioGroup",
        },
        incidentDetails: [
          {
            type: {
              value: "Yes",
              id: "10723",
              type: "PDFCheckBox",
            },
            reason: {
              value: "13A5ReasonForBeingFired",
              id: "10716",
              type: "PDFTextField",
            },
            departureDate: {
              value: "13A5DateFired",
              id: "10714",
              type: "PDFTextField",
            },
            estimated: {
              value: "Yes",
              id: "10715",
              type: "PDFCheckBox",
            },
          },
          {
            type: {
              value: "Yes",
              id: "10722",
              type: "PDFCheckBox",
            },
            reason: {
              value: "13A5ReasonForQuitting",
              id: "10717",
              type: "PDFTextField",
            },
            departureDate: {
              value: "13A5DateQuit",
              id: "10713",
              type: "PDFTextField",
            },
            estimated: {
              value: "Yes",
              id: "10712",
              type: "PDFCheckBox",
            },
          },
          {
            type: {
              value: "Yes",
              id: "10721",
              type: "PDFCheckBox",
            },
            reason: {
              value: "13A5ChargesorAllegations",
              id: "10718",
              type: "PDFTextField",
            },
            departureDate: {
              value: "13A5DateLeft",
              id: "10771",
              type: "PDFTextField",
            },
            estimated: {
              value: "Yes",
              id: "10772",
              type: "PDFCheckBox",
            },
          },
          {
            type: {
              value: "Yes",
              id: "10720",
              type: "PDFCheckBox",
            },
            reason: {
              value: "13A5ReasonforUnsatisfactory",
              id: "10719",
              type: "PDFTextField",
            },
            departureDate: {
              value: "13A5DateLeftMutual",
              id: "10773",
              type: "PDFTextField",
            },
            estimated: {
              value: "Yes",
              id: "10770",
              type: "PDFCheckBox",
            },
          },
        ],
      },

      section13A6: {
        warnedInLastSevenYears: {
          value: "YES",
          id: "17135",
          type: "PDFRadioGroup",
        },
        warningDetails: [
          {
            reason: {
              value: "13A6Reason1",
              id: "10768",
              type: "PDFTextField",
            },
            date: {
              date: {
                value: "13A6Date1",
                id: "10766",
                type: "PDFTextField",
              },
              estimated: {
                value: "Yes",
                id: "10767",
                type: "PDFCheckBox",
              },
            },
          },
          {
            reason: {
              value: "13A6Reason2",
              id: "10769",
              type: "PDFTextField",
            },
            date: {
              date: {
                value: "13A6Date2",
                id: "10765",
                type: "PDFTextField",
              },
              estimated: {
                value: "Yes",
                id: "10764",
                type: "PDFCheckBox",
              },
            },
          },
          {
            reason: {
              value: "13A6Reason3",
              id: "10762",
              type: "PDFTextField",
            },
            date: {
              date: {
                value: "13A6Date3",
                id: "10760",
                type: "PDFTextField",
              },
              estimated: {
                value: "Yes",
                id: "10761",
                type: "PDFCheckBox",
              },
            },
          },
          {
            reason: {
              value: "13A6Reason4",
              id: "10763",
              type: "PDFTextField",
            },
            date: {
              date: {
                value: "13A6Date4",
                id: "10759",
                type: "PDFTextField",
              },
              estimated: {
                value: "Yes",
                id: "10758",
                type: "PDFCheckBox",
              },
            },
          },
        ],
      },
    },

    {
      _id: 3,
      employmentActivity: {
        value:
          "Other (Provide explanation and complete 13A.2, 13A.5 and 13A.6)",
        id: "17129",
        type: "PDFRadioGroup",
      },
      otherExplanation: {
        value: "13OtherExplanation",
        id: "10779",
        type: "PDFTextField",
      },
      section13A1: {
        fromDate: {
          date: {
            value: "13A1StartDate",
            id: "10775",
            type: "PDFTextField",
          },
          estimated: {
            value: "Yes",
            id: "10774",
            type: "PDFCheckBox",
          },
        },
        toDate: {
          date: {
            value: "13A1ToDate",
            id: "10833",
            type: "PDFTextField",
          },
          estimated: {
            value: "Yes",
            id: "10778",
            type: "PDFCheckBox",
          },
          present: {
            value: "Yes",
            id: "10834",
            type: "PDFCheckBox",
          },
        },
        employmentStatus: {
          fullTime: {
            value: "Yes",
            id: "10777",
            type: "PDFCheckBox",
          },
          partTime: {
            value: "Yes",
            id: "10776",
            type: "PDFCheckBox",
          },
        },
        dutyStation: {
          value: "13A1DutyStation",
          id: "10831",
          type: "PDFTextField",
        },
        rankOrPosition: {
          value: "13A1RankTitle",
          id: "10832",
          type: "PDFTextField",
        },
        address: {
          street: {
            value: "13A1DutyStreet",
            id: "10792",
            type: "PDFTextField",
          },
          city: {
            value: "13A1DutyCity",
            id: "10791",
            type: "PDFTextField",
          },
          state: {
            value: "AL",
            id: "10790",
            type: "PDFDropdown",
          },
          zipCode: {
            value: "13A1DutyZip",
            id: "10788",
            type: "PDFTextField",
          },
          country: {
            value: "Afghanistan",
            id: "10789",
            type: "PDFDropdown",
          },
        },
        telephone: {
          number: {
            value: "13A1Phone",
            id: "10786",
            type: "PDFTextField",
          },
          extension: {
            value: "1",
            id: "10785",
            type: "PDFTextField",
          },
          internationalOrDsn: {
            value: "Yes",
            id: "10784",
            type: "PDFCheckBox",
          },
          day: {
            value: "Yes",
            id: "10783",
            type: "PDFCheckBox",
          },
          night: {
            value: "Yes",
            id: "10782",
            type: "PDFCheckBox",
          },
        },
        aLocation: {
          street: {
            value: "13A1SupervisorAddress",
            id: "10820",
            type: "PDFTextField",
          },
          city: {
            value: "13A1SupervisorCity",
            id: "10819",
            type: "PDFTextField",
          },
          state: {
            value: "DC",
            id: "10818",
            type: "PDFDropdown",
          },
          zipCode: {
            value: "13A1Superviso",
            id: "10812",
            type: "PDFTextField",
          },
          country: {
            value: "Argentina",
            id: "10817",
            type: "PDFDropdown",
          },
        },
        hasAPOFPOAddress: {
          value: "YES ",
          id: "17130",
          type: "PDFRadioGroup",
        },
        apoFPOAddress: {
          street: {
            value: "Address",
            id: "10816",
            type: "PDFTextField",
          },
          apoOrFpo: {
            value: "APO",
            id: "10815",
            type: "PDFTextField",
          },
          apoFpoStateCode: {
            value: "APO/FPO Europe",
            id: "10814",
            type: "PDFDropdown",
          },
          zipCode: {
            value: "bZip",
            id: "10813",
            type: "PDFTextField",
          },
        },
        supervisor: {
          name: {
            value: "13A1SupervisorName",
            id: "10809",
            type: "PDFTextField",
          },
          rankOrPosition: {
            value: "13A1SupervisorRankTitle",
            id: "10808",
            type: "PDFTextField",
          },
          email: {
            value: "13A1SupervisorEmail",
            id: "10781",
            type: "PDFTextField",
          },
          emailUnknown: {
            value: "Yes",
            id: "10780",
            type: "PDFCheckBox",
          },
          phone: {
            number: {
              value: "13A1SupervisorPhone",
              id: "10807",
              type: "PDFTextField",
            },
            extension: {
              value: "13A1Sup",
              id: "10806",
              type: "PDFTextField",
            },
            internationalOrDsn: {
              value: "Yes",
              id: "10795",
              type: "PDFCheckBox",
            },
            day: {
              value: "Yes",
              id: "10794",
              type: "PDFCheckBox",
            },
            night: {
              value: "Yes",
              id: "10793",
              type: "PDFCheckBox",
            },
          },
          physicalWorkLocation: {
            street: {
              value: "13A1SupervisorAddress",
              id: "10805",
              type: "PDFTextField",
            },
            city: {
              value: "13A1SupervisorCity",
              id: "10804",
              type: "PDFTextField",
            },
            state: {
              value: "DC",
              id: "10803",
              type: "PDFDropdown",
            },
            zipCode: {
              value: "13A1Superviso",
              id: "10801",
              type: "PDFTextField",
            },
            country: {
              value: "Argentina",
              id: "10802",
              type: "PDFDropdown",
            },
          },
          apoFpoAddress: {
            street: {
              value: "a13A1Street",
              id: "10800",
              type: "PDFTextField",
            },
            city: {
              value: "a13A1City",
              id: "10799",
              type: "PDFTextField",
            },
            state: {
              value: "AS",
              id: "10798",
              type: "PDFDropdown",
            },
            zipCode: {
              value: "a13A1Zip",
              id: "10796",
              type: "PDFTextField",
            },
            country: {
              value: "Angola",
              id: "10797",
              type: "PDFDropdown",
            },
          },
        },
      },

      section13A2: {
        fromDate: {
          date: {
            value: "13A2FromDate",
            id: "10920",
            type: "PDFTextField",
          },
          estimated: {
            value: "Yes",
            id: "10921",
            type: "PDFCheckBox",
          },
        },
        toDate: {
          date: {
            value: "13A2ToDate",
            id: "10922",
            type: "PDFTextField",
          },
          estimated: {
            value: "Yes",
            id: "10924",
            type: "PDFCheckBox",
          },
          present: {
            value: "Yes",
            id: "10923",
            type: "PDFCheckBox",
          },
        },
        employmentStatus: {
          fullTime: {
            value: "Yes",
            id: "10835",
            type: "PDFCheckBox",
          },
          partTime: {
            value: "Yes",
            id: "10927",
            type: "PDFCheckBox",
          },
        },
        positionTitle: {
          value: "13A2RecentTitle",
          id: "10925",
          type: "PDFTextField",
        },
        employerName: {
          value: "13A2RecentEmployer",
          id: "10926",
          type: "PDFTextField",
        },
        employerAddress: {
          street: {
            value: "13A2Street",
            id: "10862",
            type: "PDFTextField",
          },
          city: {
            value: "13A2City",
            id: "10861",
            type: "PDFTextField",
          },
          state: {
            value: "AK",
            id: "10860",
            type: "PDFDropdown",
          },
          zipCode: {
            value: "13A2Zip",
            id: "10858",
            type: "PDFTextField",
          },
          country: {
            value: "Afghanistan",
            id: "10859",
            type: "PDFDropdown",
          },
        },
        telephone: {
          number: {
            value: "13A2Phone",
            id: "10852",
            type: "PDFTextField",
          },
          extension: {
            value: "1",
            id: "10851",
            type: "PDFTextField",
          },
          internationalOrDsn: {
            value: "Yes",
            id: "10850",
            type: "PDFCheckBox",
          },
          day: {
            value: "Yes",
            id: "10849",
            type: "PDFCheckBox",
          },
          night: {
            value: "Yes",
            id: "10848",
            type: "PDFCheckBox",
          },
        },
        periodsNotApplicable: {
          value: "Yes",
          id: "10919",
          type: "PDFCheckBox",
        },
        additionalPeriods: [
          {
            _id: 1,
            fromDate: {
              date: {
                value: "13A2FromDate1",
                id: "10918",
                type: "PDFTextField",
              },
              estimated: {
                value: "Yes",
                id: "10917",
                type: "PDFCheckBox",
              },
            },
            toDate: {
              date: {
                value: "13A2ToDate1",
                id: "10916",
                type: "PDFTextField",
              },
              estimated: {
                value: "Yes",
                id: "10915",
                type: "PDFCheckBox",
              },
            },
            positionTitle: {
              value: "PositionTitle1",
              id: "10914",
              type: "PDFTextField",
            },
            supervisor: {
              value: "Supervisor1",
              id: "10913",
              type: "PDFTextField",
            },
          },
          {
            _id: 2,
            fromDate: {
              date: {
                value: "13A2FromDate2",
                id: "10912",
                type: "PDFTextField",
              },
              estimated: {
                value: "Yes",
                id: "10911",
                type: "PDFCheckBox",
              },
            },
            toDate: {
              date: {
                value: "13A2ToDate2",
                id: "10910",
                type: "PDFTextField",
              },
              estimated: {
                value: "Yes",
                id: "10909",
                type: "PDFCheckBox",
              },
            },
            positionTitle: {
              value: "PositionTitle2",
              id: "10908",
              type: "PDFTextField",
            },
            supervisor: {
              value: "Supervisor2",
              id: "10907",
              type: "PDFTextField",
            },
          },
          {
            _id: 3,
            fromDate: {
              date: {
                value: "13A2FromDate3",
                id: "10906",
                type: "PDFTextField",
              },
              estimated: {
                value: "Yes",
                id: "10905",
                type: "PDFCheckBox",
              },
            },
            toDate: {
              date: {
                value: "13A2ToDate3",
                id: "10904",
                type: "PDFTextField",
              },
              estimated: {
                value: "Yes",
                id: "10903",
                type: "PDFCheckBox",
              },
            },
            positionTitle: {
              value: "PositionTitle3",
              id: "10902",
              type: "PDFTextField",
            },
            supervisor: {
              value: "Supervisor3",
              id: "10901",
              type: "PDFTextField",
            },
          },
          {
            _id: 4,
            fromDate: {
              date: {
                value: "13A2FromDate4",
                id: "10900",
                type: "PDFTextField",
              },
              estimated: {
                value: "Yes",
                id: "10899",
                type: "PDFCheckBox",
              },
            },
            toDate: {
              date: {
                value: "13A2ToDate4",
                id: "10898",
                type: "PDFTextField",
              },
              estimated: {
                value: "Yes",
                id: "10897",
                type: "PDFCheckBox",
              },
            },
            positionTitle: {
              value: "PositionTitle4",
              id: "10896",
              type: "PDFTextField",
            },
            supervisor: {
              value: "Supervisor4",
              id: "10895",
              type: "PDFTextField",
            },
          },
        ],
        physicalWorkAddress: {
          differentThanEmployer: {
            value: "NO (If NO, proceed to (b))",
            id: "17121",
            type: "PDFRadioGroup",
          },
          aLocation: {
            street: {
              value: "a13A2Street",
              id: "10844",
              type: "PDFTextField",
            },
            city: {
              value: "a13A2City",
              id: "10843",
              type: "PDFTextField",
            },
            state: {
              value: "AL",
              id: "10842",
              type: "PDFDropdown",
            },
            zipCode: {
              value: "a13A2Zip",
              id: "10840",
              type: "PDFTextField",
            },
            country: {
              value: "Albania",
              id: "10841",
              type: "PDFDropdown",
            },
          },
          telephone: {
            number: {
              value: "a13A2Phone",
              id: "10847",
              type: "PDFTextField",
            },
            extension: {
              value: "1",
              id: "10846",
              type: "PDFTextField",
            },
            internationalOrDsn: {
              value: "Yes",
              id: "10845",
              type: "PDFCheckBox",
            },
            day: {
              value: "Yes",
              id: "10839",
              type: "PDFCheckBox",
            },
            night: {
              value: "Yes",
              id: "10838",
              type: "PDFCheckBox",
            },
          },
          b1Location: {
            street: {
              value: "b1Street",
              id: "10887",
              type: "PDFTextField",
            },
            city: {
              value: "b1City",
              id: "10886",
              type: "PDFTextField",
            },
            state: {
              value: "AK",
              id: "10885",
              type: "PDFDropdown",
            },
            zipCode: {
              value: "b1Zip",
              id: "10879",
              type: "PDFTextField",
            },
            country: {
              value: "Afghanistan",
              id: "10884",
              type: "PDFDropdown",
            },
          },
          apoFpoAddress: {
            street: {
              value: "b2Street",
              id: "10883",
              type: "PDFTextField",
            },
            apoFpoStateCode: {
              value: "b2Zip",
              id: "10881",
              type: "PDFTextField",
            },
            apoOrFpo: {
              value: "b2Zip",
              id: "10882",
              type: "PDFTextField",
            },
            zipCode: {
              value: "b2Zip",
              id: "10880",
              type: "PDFTextField",
            },
          },
          hasApoFpoAddress: {
            value: "NO",
            id: "17123",
            type: "PDFRadioGroup",
          },
        },
        supervisor: {
          name: {
            value: "13A2SupervisorName",
            id: "10864",
            type: "PDFTextField",
          },
          rankOrPosition: {
            value: "13A2SupervisorTitle",
            id: "10863",
            type: "PDFTextField",
          },
          email: {
            value: "13A2SupervisorEmail",
            id: "10889",
            type: "PDFTextField",
          },
          emailUnknown: {
            value: "Yes",
            id: "10888",
            type: "PDFCheckBox",
          },
          phone: {
            number: {
              value: "13A2SupervisorPhone",
              id: "10894",
              type: "PDFTextField",
            },
            extension: {
              value: "1",
              id: "10893",
              type: "PDFTextField",
            },
            internationalOrDsn: {
              value: "Yes",
              id: "10892",
              type: "PDFCheckBox",
            },
            day: {
              value: "Yes",
              id: "10891",
              type: "PDFCheckBox",
            },
            night: {
              value: "Yes",
              id: "10890",
              type: "PDFCheckBox",
            },
          },
          physicalWorkLocation: {
            street: {
              value: "13A2SupervisorStreet",
              id: "10857",
              type: "PDFTextField",
            },
            city: {
              value: "13A2SupervisorCity",
              id: "10856",
              type: "PDFTextField",
            },
            state: {
              value: "CA",
              id: "10855",
              type: "PDFDropdown",
            },
            zipCode: {
              value: "13A2Supervisor",
              id: "10853",
              type: "PDFTextField",
            },
            country: {
              value: "Bahrain",
              id: "10854",
              type: "PDFDropdown",
            },
          },
          hasAPOFPOAddress: {
            value: "NO",
            id: "17124",
            type: "PDFRadioGroup",
          },
          apoFPOAddress: {
            street: {
              value: "b13A2SupervisorAddress",
              id: "10872",
              type: "PDFTextField",
            },
            apoOrFpo: {
              value: "b13A2SupervisorAPO",
              id: "10871",
              type: "PDFTextField",
            },
            apoFpoStateCode: {
              value: "APO/FPO Pacific",
              id: "10870",
              type: "PDFDropdown",
            },
            zipCode: {
              value: "b13A2SupervisorZip",
              id: "10869",
              type: "PDFTextField",
            },
          },
          aLocation: {
            street: {
              value: "13A2SupervisorStreet",
              id: "10876",
              type: "PDFTextField",
            },
            city: {
              value: "13A2SupervisorCity",
              id: "10875",
              type: "PDFTextField",
            },
            state: {
              value: "CA",
              id: "10874",
              type: "PDFDropdown",
            },
            zipCode: {
              value: "13A2Supervisor",
              id: "10868",
              type: "PDFTextField",
            },
            country: {
              value: "Bahrain",
              id: "10873",
              type: "PDFDropdown",
            },
          },
        },
      },

      section13A3: {
        fromDate: {
          date: {
            value: "FromDate",
            id: "10950",
            type: "PDFTextField",
          },
          estimated: {
            value: "Yes",
            id: "10951",
            type: "PDFCheckBox",
          },
        },
        toDate: {
          date: {
            value: "ToDate",
            id: "10952",
            type: "PDFTextField",
          },
          estimated: {
            value: "Yes",
            id: "10954",
            type: "PDFCheckBox",
          },
          present: {
            value: "Yes",
            id: "10953",
            type: "PDFCheckBox",
          },
        },
        employmentStatus: {
          fullTime: {
            value: "Yes",
            id: "10958",
            type: "PDFCheckBox",
          },
          partTime: {
            value: "Yes",
            id: "10957",
            type: "PDFCheckBox",
          },
        },
        positionTitle: {
          value: "RecentPositionTitle",
          id: "10955",
          type: "PDFTextField",
        },
        employmentName: {
          value: "NameOfEmployment",
          id: "10956",
          type: "PDFTextField",
        },
        employmentAddress: {
          street: {
            value: "EmploymentStreet",
            id: "10973",
            type: "PDFTextField",
          },
          city: {
            value: "EmploymentCity",
            id: "10972",
            type: "PDFTextField",
          },
          state: {
            value: "AK",
            id: "10971",
            type: "PDFDropdown",
          },
          zipCode: {
            value: "EmploymentZip",
            id: "10969",
            type: "PDFTextField",
          },
          country: {
            value: "Afghanistan",
            id: "10970",
            type: "PDFDropdown",
          },
        },
        telephone: {
          number: {
            value: "EmploymentPhone",
            id: "10968",
            type: "PDFTextField",
          },
          extension: {
            value: "EXT",
            id: "10967",
            type: "PDFTextField",
          },
          internationalOrDsn: {
            value: "Yes",
            id: "10966",
            type: "PDFCheckBox",
          },
          day: {
            value: "Yes",
            id: "10965",
            type: "PDFCheckBox",
          },
          night: {
            value: "Yes",
            id: "10964",
            type: "PDFCheckBox",
          },
        },
        physicalWorkAddress: {
          differentThanEmployer: {
            value: "NO (If NO, proceed to (b))",
            id: "17118",
            type: "PDFRadioGroup",
          },
          aLocation: {
            street: {
              value: "aWorkStreet",
              id: "10938",
              type: "PDFTextField",
            },
            city: {
              value: "aWorkCity",
              id: "10937",
              type: "PDFTextField",
            },
            state: {
              value: "AR",
              id: "10936",
              type: "PDFDropdown",
            },
            zipCode: {
              value: "aWorkZip",
              id: "10930",
              type: "PDFTextField",
            },
            country: {
              value: "Albania",
              id: "10935",
              type: "PDFDropdown",
            },
          },
          telephone: {
            number: {
              value: "aWorkPhone",
              id: "10963",
              type: "PDFTextField",
            },
            extension: {
              value: "aEXT",
              id: "10962",
              type: "PDFTextField",
            },
            internationalOrDsn: {
              value: "Yes",
              id: "10976",
              type: "PDFCheckBox",
            },
            day: {
              value: "Yes",
              id: "10975",
              type: "PDFCheckBox",
            },
            night: {
              value: "Yes",
              id: "10974",
              type: "PDFCheckBox",
            },
          },
          hasApoFpoAddress: {
            value: "YES ",
            id: "17119",
            type: "PDFRadioGroup",
          },
          b1Location: {
            street: {
              value: "b1Street",
              id: "10949",
              type: "PDFTextField",
            },
            city: {
              value: "b1City",
              id: "10948",
              type: "PDFTextField",
            },
            state: {
              value: "DC",
              id: "10947",
              type: "PDFDropdown",
            },
            zipCode: {
              value: "b1Zip",
              id: "10941",
              type: "PDFTextField",
            },
            country: {
              value: "Bahrain",
              id: "10946",
              type: "PDFDropdown",
            },
          },
          apoFpoAddress: {
            street: {
              value: "b2Street",
              id: "10945",
              type: "PDFTextField",
            },
            apoOrFpo: {
              value: "b2APO",
              id: "10944",
              type: "PDFTextField",
            },
            apoFpoStateCode: {
              value: "APO/FPO America",
              id: "10943",
              type: "PDFDropdown",
            },
            zipCode: {
              value: "b2Zip",
              id: "10942",
              type: "PDFTextField",
            },
          },
        },
        selfEmploymentVerifier: {
          lastName: {
            value: "VerifyerLastName",
            id: "10992",
            type: "PDFTextField",
          },
          firstName: {
            value: "VerifyerFirstName",
            id: "10991",
            type: "PDFTextField",
          },
          address: {
            street: {
              value: "VerifyerStreet",
              id: "10990",
              type: "PDFTextField",
            },
            city: {
              value: "VeryfierCity",
              id: "10989",
              type: "PDFTextField",
            },
            state: {
              value: "CT",
              id: "10988",
              type: "PDFDropdown",
            },
            zipCode: {
              value: "VeryfierZip",
              id: "10986",
              type: "PDFTextField",
            },
            country: {
              value: "Argentina",
              id: "10987",
              type: "PDFDropdown",
            },
          },
          telephone: {
            number: {
              value: "VeryfierPhone",
              id: "10978",
              type: "PDFTextField",
            },
            extension: {
              value: "VeryfierEX",
              id: "10977",
              type: "PDFTextField",
            },
            internationalOrDsn: {
              value: "Yes",
              id: "",
              type: "PDFCheckBox",
            },
            day: {
              value: "Yes",
              id: "",
              type: "PDFCheckBox",
            },
            night: {
              value: "Yes",
              id: "",
              type: "PDFCheckBox",
            },
          },
          aLocation: {
            street: {
              value: "13A3Street",
              id: "10983",
              type: "PDFTextField",
            },
            city: {
              value: "13A3City",
              id: "10982",
              type: "PDFTextField",
            },
            state: {
              value: "CT",
              id: "10981",
              type: "PDFDropdown",
            },
            zipCode: {
              value: "13A3Zip",
              id: "10979",
              type: "PDFTextField",
            },
            country: {
              value: "Argentina",
              id: "10980",
              type: "PDFDropdown",
            },
          },
          hasAPOFPOAddress: {
            value: "NO",
            id: "17120",
            type: "PDFRadioGroup",
          },
          apoFpoAddress: {
            street: {
              value: "b2Street",
              id: "10934",
              type: "PDFTextField",
            },
            apoOrFpo: {
              value: "b2APO",
              id: "10933",
              type: "PDFTextField",
            },
            apoFpoStateCode: {
              value: "APO/FPO America",
              id: "10932",
              type: "PDFDropdown",
            },
            zipCode: {
              value: "b2Zip",
              id: "10931",
              type: "PDFTextField",
            },
          },
        },
      },

      section13A4: {
        fromDate: {
          date: {
            value: "13A4FromDate",
            id: "11048",
            type: "PDFTextField",
          },
          estimated: {
            value: "Yes",
            id: "11049",
            type: "PDFCheckBox",
          },
        },
        toDate: {
          date: {
            value: "13A4ToDate",
            id: "11050",
            type: "PDFTextField",
          },
          estimated: {
            value: "Yes",
            id: "11052",
            type: "PDFCheckBox",
          },
          present: {
            value: "Yes",
            id: "11051",
            type: "PDFCheckBox",
          },
        },
        verifier: {
          lastName: {
            value: "13A4LName",
            id: "11054",
            type: "PDFTextField",
          },
          firstName: {
            value: "13A4FName",
            id: "11053",
            type: "PDFTextField",
          },
          address: {
            street: {
              value: "13A4Street",
              id: "11047",
              type: "PDFTextField",
            },
            city: {
              value: "13A4City",
              id: "11046",
              type: "PDFTextField",
            },
            state: {
              value: "AL",
              id: "11045",
              type: "PDFDropdown",
            },
            zipCode: {
              value: "13A4Zip",
              id: "11043",
              type: "PDFTextField",
            },
            country: {
              value: "Antarctica",
              id: "11044",
              type: "PDFDropdown",
            },
          },
          telephone: {
            number: {
              value: "13A4Phone",
              id: "11042",
              type: "PDFTextField",
            },
            extension: {
              value: "13A4Ext",
              id: "11041",
              type: "PDFTextField",
            },
            internationalOrDsn: {
              value: "Yes",
              id: "11040",
              type: "PDFCheckBox",
            },
            day: {
              value: "Yes",
              id: "11039",
              type: "PDFCheckBox",
            },
            night: {
              value: "Yes",
              id: "11038",
              type: "PDFCheckBox",
            },
          },
          hasApoFpoAddress: {
            value: "YES ",
            id: "17117",
            type: "PDFRadioGroup",
          },
          aLocation: {
            street: {
              value: "a13A4Street",
              id: "11003",
              type: "PDFTextField",
            },
            city: {
              value: "a13A4City",
              id: "11002",
              type: "PDFTextField",
            },
            state: {
              value: "AR",
              id: "11001",
              type: "PDFDropdown",
            },
            zipCode: {
              value: "a13A4Zip",
              id: "10995",
              type: "PDFTextField",
            },
            country: {
              value: "Anguilla",
              id: "11000",
              type: "PDFDropdown",
            },
          },
          apoFpoAddress: {
            dutyLocation: {
              value: "b13A4Street",
              id: "10999",
              type: "PDFTextField",
            },
            apoOrFpo: {
              value: "b13A4APO",
              id: "10998",
              type: "PDFTextField",
            },
            apoFpoStateCode: {
              value: "APO/FPO Pacific",
              id: "10997",
              type: "PDFDropdown",
            },
            zipCode: {
              value: "b13A4Zip",
              id: "10996",
              type: "PDFTextField",
            },
          },
        },
      },

      section13A5: {
        reasonForLeaving: {
          value: "13A5ResonForLEaving",
          id: "11036",
          type: "PDFTextField",
        },
        incidentInLastSevenYears: {
          value: "NO (If NO, proceed to 13A.6)",
          id: "17112",
          type: "PDFRadioGroup",
        },
        incidentDetails: [
          {
            type: {
              value: "Yes",
              id: "11033",
              type: "PDFCheckBox",
            },
            reason: {
              value: "13A5ReasonForBeingFired",
              id: "11026",
              type: "PDFTextField",
            },
            departureDate: {
              value: "13A5DateFired",
              id: "11024",
              type: "PDFTextField",
            },
            estimated: {
              value: "Yes",
              id: "11025",
              type: "PDFCheckBox",
            },
          },
          {
            type: {
              value: "Yes",
              id: "11032",
              type: "PDFCheckBox",
            },
            reason: {
              value: "13A5ReasonForQuitting",
              id: "11027",
              type: "PDFTextField",
            },
            departureDate: {
              value: "13A5DateQuit",
              id: "11023",
              type: "PDFTextField",
            },
            estimated: {
              value: "Yes",
              id: "11022",
              type: "PDFCheckBox",
            },
          },
          {
            type: {
              value: "Yes",
              id: "11031",
              type: "PDFCheckBox",
            },
            reason: {
              value: "13A5ChargesorAllegations",
              id: "11028",
              type: "PDFTextField",
            },
            departureDate: {
              value: "13A5DateLeft",
              id: "11019",
              type: "PDFTextField",
            },
            estimated: {
              value: "Yes",
              id: "11018",
              type: "PDFCheckBox",
            },
          },
          {
            type: {
              value: "Yes",
              id: "11030",
              type: "PDFCheckBox",
            },
            reason: {
              value: "13A5ReasonforUnsatisfactory",
              id: "11029",
              type: "PDFTextField",
            },
            departureDate: {
              value: "13A5DateLeftMutual",
              id: "11021",
              type: "PDFTextField",
            },
            estimated: {
              value: "Yes",
              id: "11020",
              type: "PDFCheckBox",
            },
          },
        ],
      },

      section13A6: {
        warnedInLastSevenYears: {
          value: "YES",
          id: "17116",
          type: "PDFRadioGroup",
        },
        warningDetails: [
          {
            reason: {
              value: "13A6Reason1",
              id: "11016",
              type: "PDFTextField",
            },
            date: {
              date: {
                value: "13A6Date1",
                id: "11014",
                type: "PDFTextField",
              },
              estimated: {
                value: "Yes",
                id: "11015",
                type: "PDFCheckBox",
              },
            },
          },
          {
            reason: {
              value: "13A6Reason2",
              id: "11017",
              type: "PDFTextField",
            },
            date: {
              date: {
                value: "13A6Date2",
                id: "11013",
                type: "PDFTextField",
              },
              estimated: {
                value: "Yes",
                id: "11012",
                type: "PDFCheckBox",
              },
            },
          },
          {
            reason: {
              value: "13A6Reason3",
              id: "11010",
              type: "PDFTextField",
            },
            date: {
              date: {
                value: "13A6Date3",
                id: "11009",
                type: "PDFTextField",
              },
              estimated: {
                value: "Yes",
                id: "11009",
                type: "PDFCheckBox",
              },
            },
          },
          {
            reason: {
              value: "13A6Reason4",
              id: "11011",
              type: "PDFTextField",
            },
            date: {
              date: {
                value: "13A6Date4",
                id: "11007",
                type: "PDFTextField",
              },
              estimated: {
                value: "Yes",
                id: "11006",
                type: "PDFCheckBox",
              },
            },
          },
        ],
      },
    },

    {
      _id: 4,
      employmentActivity: {
        value:
          "Other (Provide explanation and complete 13A.2, 13A.5 and 13A.6)",
        id: "17110",
        type: "PDFRadioGroup",
      },
      otherExplanation: {
        value: "13OtherExplanation",
        id: "11086",
        type: "PDFTextField",
      },

      section13A1: {
        fromDate: {
          date: {
            value: "13A1StartDate",
            id: "11082",
            type: "PDFTextField",
          },
          estimated: {
            value: "Yes",
            id: "11081",
            type: "PDFCheckBox",
          },
        },
        toDate: {
          date: {
            value: "13A1ToDate",
            id: "11079",
            type: "PDFTextField",
          },
          estimated: {
            value: "Yes",
            id: "11085",
            type: "PDFCheckBox",
          },
          present: {
            value: "Yes",
            id: "11080",
            type: "PDFCheckBox",
          },
        },
        employmentStatus: {
          fullTime: {
            value: "Yes",
            id: "11084",
            type: "PDFCheckBox",
          },
          partTime: {
            value: "Yes",
            id: "11083",
            type: "PDFCheckBox",
          },
        },
        dutyStation: {
          value: "13A1DutyStation",
          id: "11077",
          type: "PDFTextField",
        },
        rankOrPosition: {
          value: "13A1RankTitle",
          id: "11078",
          type: "PDFTextField",
        },
        address: {
          street: {
            value: "13A1DutyStreet",
            id: "11099",
            type: "PDFTextField",
          },
          city: {
            value: "13A1DutyCity",
            id: "11098",
            type: "PDFTextField",
          },
          state: {
            value: "AL",
            id: "11097",
            type: "PDFDropdown",
          },
          zipCode: {
            value: "13A1DutyZip",
            id: "11095",
            type: "PDFTextField",
          },
          country: {
            value: "Afghanistan",
            id: "11096",
            type: "PDFDropdown",
          },
        },
        telephone: {
          number: {
            value: "13A1Phone",
            id: "11093",
            type: "PDFTextField",
          },
          extension: {
            value: "1",
            id: "11092",
            type: "PDFTextField",
          },
          internationalOrDsn: {
            value: "Yes",
            id: "11091",
            type: "PDFCheckBox",
          },
          day: {
            value: "Yes",
            id: "11090",
            type: "PDFCheckBox",
          },
          night: {
            value: "Yes",
            id: "11089",
            type: "PDFCheckBox",
          },
        },
        aLocation: {
          street: {
            value: "13A1SupervisorAddress",
            id: "11066",
            type: "PDFTextField",
          },
          city: {
            value: "13A1SupervisorCity",
            id: "11065",
            type: "PDFTextField",
          },
          state: {
            value: "DC",
            id: "11064",
            type: "PDFDropdown",
          },
          zipCode: {
            value: "13A1Superviso",
            id: "11058",
            type: "PDFTextField",
          },
          country: {
            value: "Argentina",
            id: "11063",
            type: "PDFDropdown",
          },
        },
        hasAPOFPOAddress: {
          value: "YES ",
          id: "17111",
          type: "PDFRadioGroup",
        },
        apoFPOAddress: {
          street: {
            value: "10512",
            id: "11062",
            type: "PDFTextField",
          },
          apoOrFpo: {
            value: "APO",
            id: "11061",
            type: "PDFTextField",
          },
          apoFpoStateCode: {
            value: "APO/FPO Europe",
            id: "11060",
            type: "PDFDropdown",
          },
          zipCode: {
            value: "bZip",
            id: "11059",
            type: "PDFTextField",
          },
        },
        supervisor: {
          name: {
            value: "13A1SupervisorName",
            id: "11116",
            type: "PDFTextField",
          },
          rankOrPosition: {
            value: "13A1SupervisorRankTitle",
            id: "11115",
            type: "PDFTextField",
          },
          email: {
            value: "13A1SupervisorEmail",
            id: "11088",
            type: "PDFTextField",
          },
          emailUnknown: {
            value: "Yes",
            id: "11087",
            type: "PDFCheckBox",
          },
          phone: {
            number: {
              value: "13A1SupervisorPhone",
              id: "11114",
              type: "PDFTextField",
            },
            extension: {
              value: "13A1Sup",
              id: "11113",
              type: "PDFTextField",
            },
            internationalOrDsn: {
              value: "Yes",
              id: "11102",
              type: "PDFCheckBox",
            },
            day: {
              value: "Yes",
              id: "11101",
              type: "PDFCheckBox",
            },
            night: {
              value: "Yes",
              id: "11100",
              type: "PDFCheckBox",
            },
          },
          physicalWorkLocation: {
            street: {
              value: "13A1SupervisorAddress",
              id: "11112",
              type: "PDFTextField",
            },
            city: {
              value: "13A1SupervisorCity",
              id: "11111",
              type: "PDFTextField",
            },
            state: {
              value: "DC",
              id: "11110",
              type: "PDFDropdown",
            },
            zipCode: {
              value: "13A1Superviso",
              id: "11108",
              type: "PDFTextField",
            },
            country: {
              value: "Argentina",
              id: "11109",
              type: "PDFDropdown",
            },
          },
          apoFpoAddress: {
            street: {
              value: "a13A1Street",
              id: "11107",
              type: "PDFTextField",
            },
            city: {
              value: "a13A1City",
              id: "11106",
              type: "PDFTextField",
            },
            state: {
              value: "AS",
              id: "11105",
              type: "PDFDropdown",
            },
            zipCode: {
              value: "a13A1Zip",
              id: "11103",
              type: "PDFTextField",
            },
            country: {
              value: "Angola",
              id: "11104",
              type: "PDFDropdown",
            },
          },
        },
      },

      section13A2: {
        fromDate: {
          date: {
            value: "13A2FromDate",
            id: "11171",
            type: "PDFTextField",
          },
          estimated: {
            value: "Yes",
            id: "11172",
            type: "PDFCheckBox",
          },
        },
        toDate: {
          date: {
            value: "13A2ToDate",
            id: "11173",
            type: "PDFTextField",
          },
          estimated: {
            value: "Yes",
            id: "11175",
            type: "PDFCheckBox",
          },
          present: {
            value: "Yes",
            id: "11174",
            type: "PDFCheckBox",
          },
        },
        employmentStatus: {
          fullTime: {
            value: "Yes",
            id: "11179",
            type: "PDFCheckBox",
          },
          partTime: {
            value: "Yes",
            id: "11178",
            type: "PDFCheckBox",
          },
        },
        positionTitle: {
          value: "13A2RecentTitle",
          id: "11176",
          type: "PDFTextField",
        },
        employerName: {
          value: "13A2RecentEmployer",
          id: "11177",
          type: "PDFTextField",
        },
        employerAddress: {
          street: {
            value: "13A2Street",
            id: "11206",
            type: "PDFTextField",
          },
          city: {
            value: "13A2City",
            id: "11205",
            type: "PDFTextField",
          },
          state: {
            value: "AK",
            id: "11204",
            type: "PDFDropdown",
          },
          zipCode: {
            value: "13A2Zip",
            id: "11202",
            type: "PDFTextField",
          },
          country: {
            value: "Afghanistan",
            id: "11203",
            type: "PDFDropdown",
          },
        },
        telephone: {
          number: {
            value: "13A2Phone",
            id: "11196",
            type: "PDFTextField",
          },
          extension: {
            value: "1",
            id: "11195",
            type: "PDFTextField",
          },
          internationalOrDsn: {
            value: "Yes",
            id: "11194",
            type: "PDFCheckBox",
          },
          day: {
            value: "Yes",
            id: "11193",
            type: "PDFCheckBox",
          },
          night: {
            value: "Yes",
            id: "11192",
            type: "PDFCheckBox",
          },
        },
        periodsNotApplicable: {
          value: "Yes",
          id: "11170",
          type: "PDFCheckBox",
        },
        additionalPeriods: [
          {
            _id: 1,
            fromDate: {
              date: {
                value: "13A2FromDate1",
                id: "11169",
                type: "PDFTextField",
              },
              estimated: {
                value: "Yes",
                id: "11168",
                type: "PDFCheckBox",
              },
            },
            toDate: {
              date: {
                value: "13A2ToDate1",
                id: "11167",
                type: "PDFTextField",
              },
              estimated: {
                value: "Yes",
                id: "11166",
                type: "PDFCheckBox",
              },
            },
            positionTitle: {
              value: "PositionTitle1",
              id: "11165",
              type: "PDFTextField",
            },
            supervisor: {
              value: "Supervisor1",
              id: "11164",
              type: "PDFTextField",
            },
          },
          {
            _id: 2,
            fromDate: {
              date: {
                value: "13A2FromDate2",
                id: "11163",
                type: "PDFTextField",
              },
              estimated: {
                value: "Yes",
                id: "11162",
                type: "PDFCheckBox",
              },
            },
            toDate: {
              date: {
                value: "13A2ToDate2",
                id: "11161",
                type: "PDFTextField",
              },
              estimated: {
                value: "Yes",
                id: "11160",
                type: "PDFCheckBox",
              },
            },
            positionTitle: {
              value: "PositionTitle2",
              id: "11159",
              type: "PDFTextField",
            },
            supervisor: {
              value: "Supervisor2",
              id: "11158",
              type: "PDFTextField",
            },
          },
          {
            _id: 3,
            fromDate: {
              date: {
                value: "13A2FromDate3",
                id: "11157",
                type: "PDFTextField",
              },
              estimated: {
                value: "Yes",
                id: "11156",
                type: "PDFCheckBox",
              },
            },
            toDate: {
              date: {
                value: "13A2ToDate3",
                id: "11155",
                type: "PDFTextField",
              },
              estimated: {
                value: "Yes",
                id: "11154",
                type: "PDFCheckBox",
              },
            },
            positionTitle: {
              value: "PositionTitle3",
              id: "11153",
              type: "PDFTextField",
            },
            supervisor: {
              value: "Supervisor3",
              id: "11152",
              type: "PDFTextField",
            },
          },
          {
            _id: 4,
            fromDate: {
              date: {
                value: "13A2FromDate4",
                id: "11151",
                type: "PDFTextField",
              },
              estimated: {
                value: "Yes",
                id: "11150",
                type: "PDFCheckBox",
              },
            },
            toDate: {
              date: {
                value: "13A2ToDate4",
                id: "11149",
                type: "PDFTextField",
              },
              estimated: {
                value: "Yes",
                id: "11148",
                type: "PDFCheckBox",
              },
            },
            positionTitle: {
              value: "PositionTitle4",
              id: "11147",
              type: "PDFTextField",
            },
            supervisor: {
              value: "Supervisor4",
              id: "11146",
              type: "PDFTextField",
            },
          },
        ],
        physicalWorkAddress: {
          differentThanEmployer: {
            value: "NO (If NO, proceed to (b))",
            id: "17102",
            type: "PDFRadioGroup",
          },
          aLocation: {
            street: {
              value: "a13A2Street",
              id: "11188",
              type: "PDFTextField",
            },
            city: {
              value: "a13A2City",
              id: "11187",
              type: "PDFTextField",
            },
            state: {
              value: "AL",
              id: "11186",
              type: "PDFDropdown",
            },
            zipCode: {
              value: "a13A2Zip",
              id: "11184",
              type: "PDFTextField",
            },
            country: {
              value: "Albania",
              id: "11185",
              type: "PDFDropdown",
            },
          },
          telephone: {
            number: {
              value: "a13A2Phone",
              id: "11191",
              type: "PDFTextField",
            },
            extension: {
              value: "1",
              id: "11190",
              type: "PDFTextField",
            },
            internationalOrDsn: {
              value: "Yes",
              id: "11189",
              type: "PDFCheckBox",
            },
            day: {
              value: "Yes",
              id: "11183",
              type: "PDFCheckBox",
            },
            night: {
              value: "Yes",
              id: "11182",
              type: "PDFCheckBox",
            },
          },
          b1Location: {
            street: {
              value: "b1Street",
              id: "11138",
              type: "PDFTextField",
            },
            city: {
              value: "b1City",
              id: "11137",
              type: "PDFTextField",
            },
            state: {
              value: "AK",
              id: "11136",
              type: "PDFDropdown",
            },
            zipCode: {
              value: "b1Zip",
              id: "11130",
              type: "PDFTextField",
            },
            country: {
              value: "Afghanistan",
              id: "11135",
              type: "PDFDropdown",
            },
          },
          apoFpoAddress: {
            street: {
              value: "b2Street",
              id: "11134",
              type: "PDFTextField",
            },
            apoFpoStateCode: {
              value: "b2Zip",
              id: "11132",
              type: "PDFTextField",
            },
            apoOrFpo: {
              value: "b2Zip",
              id: "11133",
              type: "PDFTextField",
            },
            zipCode: {
              value: "b2Zip",
              id: "11131",
              type: "PDFTextField",
            },
          },
          hasApoFpoAddress: {
            value: "NO",
            id: "17104",
            type: "PDFRadioGroup",
          },
        },
        supervisor: {
          name: {
            value: "13A2SupervisorName",
            id: "11208",
            type: "PDFTextField",
          },
          rankOrPosition: {
            value: "13A2SupervisorTitle",
            id: "11207",
            type: "PDFTextField",
          },
          email: {
            value: "13A2SupervisorEmail",
            id: "11140",
            type: "PDFTextField",
          },
          emailUnknown: {
            value: "Yes",
            id: "11139",
            type: "PDFCheckBox",
          },
          phone: {
            number: {
              value: "13A2SupervisorPhone",
              id: "11145",
              type: "PDFTextField",
            },
            extension: {
              value: "1",
              id: "11144",
              type: "PDFTextField",
            },
            internationalOrDsn: {
              value: "Yes",
              id: "11143",
              type: "PDFCheckBox",
            },
            day: {
              value: "Yes",
              id: "11142",
              type: "PDFCheckBox",
            },
            night: {
              value: "Yes",
              id: "11141",
              type: "PDFCheckBox",
            },
          },
          physicalWorkLocation: {
            street: {
              value: "13A2SupervisorStreet",
              id: "11201",
              type: "PDFTextField",
            },
            city: {
              value: "13A2SupervisorCity",
              id: "11200",
              type: "PDFTextField",
            },
            state: {
              value: "CA",
              id: "11199",
              type: "PDFDropdown",
            },
            zipCode: {
              value: "13A2Supervisor",
              id: "11197",
              type: "PDFTextField",
            },
            country: {
              value: "Bahrain",
              id: "11198",
              type: "PDFDropdown",
            },
          },
          hasAPOFPOAddress: {
            value: "YES ",
            id: "17105",
            type: "PDFRadioGroup",
          },
          apoFPOAddress: {
            street: {
              value: "b13A2SupervisorAddress",
              id: "11123",
              type: "PDFTextField",
            },
            apoOrFpo: {
              value: "b13A2SupervisorAPO",
              id: "11122",
              type: "PDFTextField",
            },
            apoFpoStateCode: {
              value: "APO/FPO Pacific",
              id: "11121",
              type: "PDFDropdown",
            },
            zipCode: {
              value: "b13A2SupervisorZip",
              id: "11120",
              type: "PDFTextField",
            },
          },
          aLocation: {
            street: {
              value: "13A2SupervisorStreet",
              id: "11127",
              type: "PDFTextField",
            },
            city: {
              value: "13A2SupervisorCity",
              id: "11126",
              type: "PDFTextField",
            },
            state: {
              value: "CA",
              id: "11125",
              type: "PDFDropdown",
            },
            zipCode: {
              value: "13A2Supervisor",
              id: "11119",
              type: "PDFTextField",
            },
            country: {
              value: "Bahrain",
              id: "11124",
              type: "PDFDropdown",
            },
          },
        },
      },

      section13A3: {
        fromDate: {
          date: {
            value: "FromDate",
            id: "11262",
            type: "PDFTextField",
          },
          estimated: {
            value: "Yes",
            id: "11263",
            type: "PDFCheckBox",
          },
        },
        toDate: {
          date: {
            value: "ToDate",
            id: "11264",
            type: "PDFTextField",
          },
          estimated: {
            value: "Yes",
            id: "11266",
            type: "PDFCheckBox",
          },
          present: {
            value: "Yes",
            id: "11265",
            type: "PDFCheckBox",
          },
        },
        employmentStatus: {
          fullTime: {
            value: "Yes",
            id: "11270",
            type: "PDFCheckBox",
          },
          partTime: {
            value: "Yes",
            id: "11269",
            type: "PDFCheckBox",
          },
        },
        positionTitle: {
          value: "RecentPositionTitle",
          id: "11267",
          type: "PDFTextField",
        },
        employmentName: {
          value: "NameOfEmployment",
          id: "11268",
          type: "PDFTextField",
        },
        employmentAddress: {
          street: {
            value: "EmploymentStreet",
            id: "11219",
            type: "PDFTextField",
          },
          city: {
            value: "EmploymentCity",
            id: "11218",
            type: "PDFTextField",
          },
          state: {
            value: "AK",
            id: "11217",
            type: "PDFDropdown",
          },
          zipCode: {
            value: "EmploymentZip",
            id: "11215",
            type: "PDFTextField",
          },
          country: {
            value: "Afghanistan",
            id: "11216",
            type: "PDFDropdown",
          },
        },
        telephone: {
          number: {
            value: "EmploymentPhone",
            id: "11214",
            type: "PDFTextField",
          },
          extension: {
            value: "EXT",
            id: "11213",
            type: "PDFTextField",
          },
          internationalOrDsn: {
            value: "Yes",
            id: "11212",
            type: "PDFCheckBox",
          },
          day: {
            value: "Yes",
            id: "11211",
            type: "PDFCheckBox",
          },
          night: {
            value: "Yes",
            id: "11210",
            type: "PDFCheckBox",
          },
        },
        physicalWorkAddress: {
          differentThanEmployer: {
            value: "NO (If NO, proceed to (b))",
            id: "17099",
            type: "PDFRadioGroup",
          },
          aLocation: {
            street: {
              value: "aWorkStreet",
              id: "11229",
              type: "PDFTextField",
            },
            city: {
              value: "aWorkCity",
              id: "11228",
              type: "PDFTextField",
            },
            state: {
              value: "AR",
              id: "11227",
              type: "PDFDropdown",
            },
            zipCode: {
              value: "aWorkZip",
              id: "11225",
              type: "PDFTextField",
            },
            country: {
              value: "Albania",
              id: "11226",
              type: "PDFDropdown",
            },
          },
          telephone: {
            number: {
              value: "aWorkPhone",
              id: "11224",
              type: "PDFTextField",
            },
            extension: {
              value: "aEXT",
              id: "11223",
              type: "PDFTextField",
            },
            internationalOrDsn: {
              value: "Yes",
              id: "11222",
              type: "PDFCheckBox",
            },
            day: {
              value: "Yes",
              id: "11221",
              type: "PDFCheckBox",
            },
            night: {
              value: "Yes",
              id: "11220",
              type: "PDFCheckBox",
            },
          },
          hasApoFpoAddress: {
            value: "YES ",
            id: "17100",
            type: "PDFRadioGroup",
          },
          b1Location: {
            street: {
              value: "b1Street",
              id: "11261",
              type: "PDFTextField",
            },
            city: {
              value: "b1City",
              id: "11260",
              type: "PDFTextField",
            },
            state: {
              value: "DC",
              id: "11259",
              type: "PDFDropdown",
            },
            zipCode: {
              value: "b1Zip",
              id: "11253",
              type: "PDFTextField",
            },
            country: {
              value: "Bahrain",
              id: "11258",
              type: "PDFDropdown",
            },
          },
          apoFpoAddress: {
            street: {
              value: "b2Street",
              id: "11257",
              type: "PDFTextField",
            },
            apoOrFpo: {
              value: "b2APO",
              id: "11256",
              type: "PDFTextField",
            },
            apoFpoStateCode: {
              value: "APO/FPO America",
              id: "11255",
              type: "PDFDropdown",
            },
            zipCode: {
              value: "b2Zip",
              id: "11254",
              type: "PDFTextField",
            },
          },
        },
        selfEmploymentVerifier: {
          lastName: {
            value: "VerifyerLastName",
            id: "11238",
            type: "PDFTextField",
          },
          firstName: {
            value: "VerifyerFirstName",
            id: "11237",
            type: "PDFTextField",
          },
          address: {
            street: {
              value: "VerifyerStreet",
              id: "11236",
              type: "PDFTextField",
            },
            city: {
              value: "VeryfierCity",
              id: "11235",
              type: "PDFTextField",
            },
            state: {
              value: "CT",
              id: "11234",
              type: "PDFDropdown",
            },
            zipCode: {
              value: "VeryfierZip",
              id: "11232",
              type: "PDFTextField",
            },
            country: {
              value: "Argentina",
              id: "11233",
              type: "PDFDropdown",
            },
          },
          telephone: {
            number: {
              value: "VeryfierPhone",
              id: "11275",
              type: "PDFTextField",
            },
            extension: {
              value: "VeryfierEX",
              id: "11274",
              type: "PDFTextField",
            },
            internationalOrDsn: {
              value: "Yes",
              id: "11273",
              type: "PDFCheckBox",
            },
            day: {
              value: "Yes",
              id: "11272",
              type: "PDFCheckBox",
            },
            night: {
              value: "Yes",
              id: "11271",
              type: "PDFCheckBox",
            },
          },
          aLocation: {
            street: {
              value: "13A3Street",
              id: "11250",
              type: "PDFTextField",
            },
            city: {
              value: "13A3City",
              id: "11249",
              type: "PDFTextField",
            },
            state: {
              value: "CT",
              id: "11248",
              type: "PDFDropdown",
            },
            zipCode: {
              value: "13A3Zip",
              id: "11242",
              type: "PDFTextField",
            },
            country: {
              value: "Argentina",
              id: "11247",
              type: "PDFDropdown",
            },
          },
          hasAPOFPOAddress: {
            value: "YES ",
            id: "17101",
            type: "PDFRadioGroup",
          },
          apoFpoAddress: {
            street: {
              value: "b2Street",
              id: "11246",
              type: "PDFTextField",
            },
            apoOrFpo: {
              value: "b2APO",
              id: "11245",
              type: "PDFTextField",
            },
            apoFpoStateCode: {
              value: "APO/FPO America",
              id: "11244",
              type: "PDFDropdown",
            },
            zipCode: {
              value: "b2Zip",
              id: "11243",
              type: "PDFTextField",
            },
          },
        },
      },

      section13A4: {
        fromDate: {
          date: {
            value: "13A4FromDate",
            id: "11331",
            type: "PDFTextField",
          },
          estimated: {
            value: "Yes",
            id: "11332",
            type: "PDFCheckBox",
          },
        },
        toDate: {
          date: {
            value: "13A4ToDate",
            id: "11333",
            type: "PDFTextField",
          },
          estimated: {
            value: "Yes",
            id: "11335",
            type: "PDFCheckBox",
          },
          present: {
            value: "Yes",
            id: "11334",
            type: "PDFCheckBox",
          },
        },
        verifier: {
          lastName: {
            value: "13A4LName",
            id: "11337",
            type: "PDFTextField",
          },
          firstName: {
            value: "13A4FName",
            id: "11336",
            type: "PDFTextField",
          },
          address: {
            street: {
              value: "13A4Street",
              id: "11330",
              type: "PDFTextField",
            },
            city: {
              value: "13A4City",
              id: "11329",
              type: "PDFTextField",
            },
            state: {
              value: "AL",
              id: "11328",
              type: "PDFDropdown",
            },
            zipCode: {
              value: "13A4Zip",
              id: "11326",
              type: "PDFTextField",
            },
            country: {
              value: "Antarctica",
              id: "11327",
              type: "PDFDropdown",
            },
          },
          telephone: {
            number: {
              value: "13A4Phone",
              id: "11325",
              type: "PDFTextField",
            },
            extension: {
              value: "13A4Ext",
              id: "11324",
              type: "PDFTextField",
            },
            internationalOrDsn: {
              value: "Yes",
              id: "11323",
              type: "PDFCheckBox",
            },
            day: {
              value: "Yes",
              id: "11322",
              type: "PDFCheckBox",
            },
            night: {
              value: "Yes",
              id: "11321",
              type: "PDFCheckBox",
            },
          },
          hasApoFpoAddress: {
            value: "YES ",
            id: "17098",
            type: "PDFRadioGroup",
          },
          aLocation: {
            street: {
              value: "a13A4Street",
              id: "11286",
              type: "PDFTextField",
            },
            city: {
              value: "a13A4City",
              id: "11285",
              type: "PDFTextField",
            },
            state: {
              value: "AR",
              id: "11284",
              type: "PDFDropdown",
            },
            zipCode: {
              value: "a13A4Zip",
              id: "11278",
              type: "PDFTextField",
            },
            country: {
              value: "Anguilla",
              id: "11283",
              type: "PDFDropdown",
            },
          },
          apoFpoAddress: {
            dutyLocation: {
              value: "b13A4Street",
              id: "11282",
              type: "PDFTextField",
            },
            apoOrFpo: {
              value: "b13A4APO",
              id: "11281",
              type: "PDFTextField",
            },
            apoFpoStateCode: {
              value: "APO/FPO Pacific",
              id: "11280",
              type: "PDFDropdown",
            },
            zipCode: {
              value: "b13A4Zip",
              id: "11279",
              type: "PDFTextField",
            },
          },
        },
      },

      section13A5: {
        reasonForLeaving: {
          value: "13A5ResonForLEaving",
          id: "11319",
          type: "PDFTextField",
        },
        incidentInLastSevenYears: {
          value: "NO (If NO, proceed to 13A.6)",
          id: "17093",
          type: "PDFRadioGroup",
        },
        incidentDetails: [
          {
            type: {
              value: "Yes",
              id: "11316",
              type: "PDFCheckBox",
            },
            reason: {
              value: "13A5ReasonForBeingFired",
              id: "11309",
              type: "PDFTextField",
            },
            departureDate: {
              value: "13A5DateFired",
              id: "11307",
              type: "PDFTextField",
            },
            estimated: {
              value: "Yes",
              id: "11308",
              type: "PDFCheckBox",
            },
          },
          {
            type: {
              value: "Yes",
              id: "11315",
              type: "PDFCheckBox",
            },
            reason: {
              value: "13A5ReasonForQuitting",
              id: "11310",
              type: "PDFTextField",
            },
            departureDate: {
              value: "13A5DateQuit",
              id: "11306",
              type: "PDFTextField",
            },
            estimated: {
              value: "Yes",
              id: "11305",
              type: "PDFCheckBox",
            },
          },
          {
            type: {
              value: "Yes",
              id: "11314",
              type: "PDFCheckBox",
            },
            reason: {
              value: "13A5ChargesorAllegations",
              id: "11311",
              type: "PDFTextField",
            },
            departureDate: {
              value: "13A5DateLeft",
              id: "11302",
              type: "PDFTextField",
            },
            estimated: {
              value: "Yes",
              id: "11303",
              type: "PDFCheckBox",
            },
          },
          {
            type: {
              value: "Yes",
              id: "11313",
              type: "PDFCheckBox",
            },
            reason: {
              value: "13A5ReasonforUnsatisfactory",
              id: "11312",
              type: "PDFTextField",
            },
            departureDate: {
              value: "13A5DateLeftMutual",
              id: "11304",
              type: "PDFTextField",
            },
            estimated: {
              value: "Yes",
              id: "11301",
              type: "PDFCheckBox",
            },
          },
        ],
      },

      section13A6: {
        warnedInLastSevenYears: {
          value: "YES",
          id: "17097",
          type: "PDFRadioGroup",
        },
        warningDetails: [
          {
            reason: {
              value: "13A6Reason1",
              id: "11299",
              type: "PDFTextField",
            },
            date: {
              date: {
                value: "13A6Date1",
                id: "11297",
                type: "PDFTextField",
              },
              estimated: {
                value: "Yes",
                id: "11298",
                type: "PDFCheckBox",
              },
            },
          },
          {
            reason: {
              value: "13A6Reason2",
              id: "11300",
              type: "PDFTextField",
            },
            date: {
              date: {
                value: "13A6Date2",
                id: "11296",
                type: "PDFTextField",
              },
              estimated: {
                value: "Yes",
                id: "11298",
                type: "PDFCheckBox",
              },
            },
          },
          {
            reason: {
              value: "13A6Reason3",
              id: "11293",
              type: "PDFTextField",
            },
            date: {
              date: {
                value: "13A6Date3",
                id: "11291",
                type: "PDFTextField",
              },
              estimated: {
                value: "Yes",
                id: "",
                type: "PDFCheckBox",
              },
            },
          },
          {
            reason: {
              value: "13A6Reason4",
              id: "11294",
              type: "PDFTextField",
            },
            date: {
              date: {
                value: "13A6Date4",
                id: "11290",
                type: "PDFTextField",
              },
              estimated: {
                value: "Yes",
                id: "",
                type: "PDFCheckBox",
              },
            },
          },
        ],
      },
    },
  ],

  section13B: {
    hasFormerFederalEmployment: {
      value: "NO (If NO, proceed to Section 13C)", // Mapped from form1[0].section13_5[0].RadioButtonList[0]
      id: "17090",
      type: "PDFRadioGroup",
    },
    employmentEntries: [
      {
        _id: 1,
        fromDate: {
          value: "fromDate1",
          id: "11387",
          type: "PDFTextField",
        },
        toDate: {
          value: "toDate1",
          id: "11385",
          type: "PDFTextField",
        },
        present: {
          value: "Yes",
          id: "11386",
          type: "PDFCheckBox",
        },
        estimated: {
          value: "Yes",
          id: "11344",
          type: "PDFCheckBox",
        },
        agencyName: {
          value: "agencyName1",
          id: "11340",
          type: "PDFTextField",
        },
        positionTitle: {
          value: "positionTitle1",
          id: "11341",
          type: "PDFTextField",
        },
        location: {
          street: {
            value: "street1",
            id: "11339",
            type: "PDFTextField",
          },
          city: {
            value: "city1",
            id: "11338",
            type: "PDFTextField",
          },
          state: {
            value: "AK",
            id: "11390",
            type: "PDFDropdown",
          },
          zipCode: {
            value: "zip1",
            id: "11388",
            type: "PDFTextField",
          },
          country: {
            value: "Akrotiri Sovereign Base",
            id: "11389",
            type: "PDFDropdown",
          },
        },
      },
      {
        _id: 2,
        fromDate: {
          value: "fromDate2",
          id: "11348",
          type: "PDFTextField",
        },
        toDate: {
          value: "toDate2",
          id: "11346",
          type: "PDFTextField",
        },
        present: {
          value: "Yes",
          id: "11347",
          type: "PDFCheckBox",
        },
        estimated: {
          value: "Yes",
          id: "11383",
          type: "PDFCheckBox",
        },
        agencyName: {
          value: "agencyName2",
          id: "11354",
          type: "PDFTextField",
        },
        positionTitle: {
          value: "positionTitle2",
          id: "11355",
          type: "PDFTextField",
        },
        location: {
          street: {
            value: "street2",
            id: "11353",
            type: "PDFTextField",
          },
          city: {
            value: "city2",
            id: "11352",
            type: "PDFTextField",
          },
          state: {
            value: "AL",
            id: "11351",
            type: "PDFDropdown",
          },
          zipCode: {
            value: "zip2",
            id: "11349",
            type: "PDFTextField",
          },
          country: {
            value: "Anguilla",
            id: "11350",
            type: "PDFDropdown",
          },
        },
      },
      {
        _id: 3,
        fromDate: {
          value: "fromDate3",
          id: "11363",
          type: "PDFTextField",
        },
        toDate: {
          value: "toDate3",
          id: "11361",
          type: "PDFTextField",
        },
        present: {
          value: "Yes",
          id: "11362",
          type: "PDFCheckBox",
        },
        estimated: {
          value: "Yes",
          id: "11371",
          type: "PDFCheckBox",
        },
        agencyName: {
          value: "agencyName3",
          id: "11369",
          type: "PDFTextField",
        },
        positionTitle: {
          value: "positionTitle3",
          id: "11370",
          type: "PDFTextField",
        },
        location: {
          street: {
            value: "street3",
            id: "11368",
            type: "PDFTextField",
          },
          city: {
            value: "city3",
            id: "11367",
            type: "PDFTextField",
          },
          state: {
            value: "AZ",
            id: "11366",
            type: "PDFDropdown",
          },
          zipCode: {
            value: "zip3",
            id: "11364",
            type: "PDFTextField",
          },
          country: {
            value: "Austria",
            id: "11365",
            type: "PDFDropdown",
          },
        },
      },
      {
        _id: 4,
        fromDate: {
          value: "fromDate4",
          id: "11375",
          type: "PDFTextField",
        },
        toDate: {
          value: "toDate4",
          id: "11373",
          type: "PDFTextField",
        },
        present: {
          value: "Yes",
          id: "11374",
          type: "PDFCheckBox",
        },
        estimated: {
          value: "Yes",
          id: "11359",
          type: "PDFCheckBox",
        },
        agencyName: {
          value: "agencyName4",
          id: "11381",
          type: "PDFTextField",
        },
        positionTitle: {
          value: "positionTitle4",
          id: "11382",
          type: "PDFTextField",
        },
        location: {
          street: {
            value: "street4",
            id: "11380",
            type: "PDFTextField",
          },
          city: {
            value: "city4",
            id: "11379",
            type: "PDFTextField",
          },
          state: {
            value: "CT",
            id: "11378",
            type: "PDFDropdown",
          },
          zipCode: {
            value: "zip4",
            id: "11376",
            type: "PDFTextField",
          },
          country: {
            value: "Bolivia",
            id: "11377",
            type: "PDFDropdown",
          },
        },
      },
    ],
  },

  section13C: {
    employmentRecordIssues: {
      value:
        "YES (If YES, you will be required to add an additional employment in Section 13A)",
      id: "17092",
      type: "PDFRadioGroup",
    },
  },
};
