import {type DualCitizenshipInfo } from "api/interfaces/sections/duelCitizenship";

// dualCitizenshipInfo covers section 10

export const dualCitizenshipInfo: DualCitizenshipInfo = {
    heldMultipleCitizenships: {
      value: "NO (If NO, proceed to 10.2)",
      id: "17213",
      type: "PDFRadioGroup",
    },
    hadNonUSPassport: {
      value: "NO (If NO, proceed to Section 11)",
      id: "17218",
      type: "PDFRadioGroup",
    },
    citizenships: [
      {
        _id: 1,
        country: {
          value: "",
          id: "9705",
          type: "PDFDropdown",
        },
        howCitizenshipAcquired: {
          value: "",
          id: "9704",
          type: "PDFTextField",
        },
        citizenshipStart: {
          value: "",
          id: "9703",
          type: "PDFTextField",
        },
        isCitizenshipStartEstimated: {
          value: "Yes",
          id: "9702",
          type: "PDFCheckBox",
        },
        citizenshipEnd: {
          value: "citizenshipEnd",
          id: "9701",
          type: "PDFTextField",
        },
        isCitizenshipEndPresent: {
          value: "Yes",
          id: "9700",
          type: "PDFCheckBox",
        },
        isCitizenshipEndEstimated: {
          value: "Yes",
          id: "9699",
          type: "PDFCheckBox",
        },
        isRenounced: {
          value: "YES",
          id: "17214",
          type: "PDFRadioGroup",
        },
        renouncementDetails: {
          value: "",
          id: "9696",
          type: "PDFTextField",
        },
        isCitizenshipHeld: {
          value: "YES",
          id: "17215",
          type: "PDFRadioGroup",
        },
        citizenshipExplanation: {
          value: "",
          id: "9693",
          type: "PDFTextField",
        },
      },
      {
        _id: 2,
        country: {
          value: "Afghanistan",
          id: "9680",
          type: "PDFDropdown",
        },
        howCitizenshipAcquired: {
          value: "",
          id: "9692",
          type: "PDFTextField",
        },
        citizenshipStart: {
          value: "",
          id: "9691",
          type: "PDFTextField",
        },
        isCitizenshipStartEstimated: {
          value: "No",
          id: "9690",
          type: "PDFCheckBox",
        },
        citizenshipEnd: {
          value: "",
          id: "9689",
          type: "PDFTextField",
        },
        isCitizenshipEndPresent: {
          value: "Yes",
          id: "9688",
          type: "PDFCheckBox",
        },
        isCitizenshipEndEstimated: {
          value: "Yes",
          id: "9687",
          type: "PDFCheckBox",
        },
        isRenounced: {
          value: "YES",
          id: "17216",
          type: "PDFRadioGroup",
        },
        renouncementDetails: {
          value: "",
          id: "9684",
          type: "PDFTextField",
        },
        isCitizenshipHeld: {
          value: "YES",
          id: "17217",
          type: "PDFRadioGroup",
        },
        citizenshipExplanation: {
          value: "",
          id: "9683",
          type: "PDFTextField",
        },
      },
    ],
    passports: [
      {
        _id: 1,
        countryIssued: {
          value: "",
          id: "9677",
          type: "PDFDropdown",
        },
        passportDateIssued: {
          value: "",
          id: "9676",
          type: "PDFTextField",
        },
        isPassportDateEst: {
          value: "Yes",
          id: "9675",
          type: "PDFCheckBox",
        },
        passportCity: {
          value: "",
          id: "9674",
          type: "PDFTextField",
        },
        passportCountry: {
          value: "",
          id: "9673",
          type: "PDFDropdown",
        },
        passportLName: {
          value: "",
          id: "9672",
          type: "PDFTextField",
        },
        passportFName: {
          value: "",
          id: "9671",
          type: "PDFTextField",
        },
        passportMName: {
          value: "",
          id: "9670",
          type: "PDFTextField",
        },
        passportSuffix: {
          value: "",
          id: "9669",
          type: "PDFDropdown",
        },
        passportNumber: {
          value: "",
          id: "9668",
          type: "PDFTextField",
        },
        passportExpiration: {
          value: "",
          id: "9667",
          type: "PDFTextField",
        },
        isExpirationEst: {
          value: "Yes",
          id: "9666",
          type: "PDFCheckBox",
        },
        isPassportUsed: {
          value: "YES",
          id: "17219",
          type: "PDFRadioGroup",
        },
        passportUses: [
          {
            _id: 1,
            passportCountry: {
              value: "Angola",
              id: "9688",
              type: "PDFDropdown",
            },
            fromDate: {
              value: "",
              id: "9662",
              type: "PDFTextField",
            },
            toDate: {
              value: "",
              id: "9660",
              type: "PDFTextField",
            },
            isFromDateEst: {
              value: "Yes",
              id: "9661",
              type: "PDFCheckBox",
            },
            isToDateEst: {
              value: "Yes",
              id: "9659",
              type: "PDFCheckBox",
            },
            isVisitCurrent: {
              value: "Yes",
              id: "9658",
              type: "PDFCheckBox",
            },
          },
          {
            _id: 2,
            passportCountry: {
              value: "China",
              id: "9657",
              type: "PDFDropdown",
            },
            fromDate: {
              value: "",
              id: "9656",
              type: "PDFTextField",
            },
            toDate: {
              value: "",
              id: "9654",
              type: "PDFTextField",
            },
            isFromDateEst: {
              value: "Yes",
              id: "9655",
              type: "PDFCheckBox",
            },
            isToDateEst: {
              value: "Yes",
              id: "9653",
              type: "PDFCheckBox",
            },
            isVisitCurrent: {
              value: "Yes",
              id: "9652",
              type: "PDFCheckBox",
            },
          },
          {
            _id: 3,
            passportCountry: {
              value: "Azerbaijan",
              id: "9651",
              type: "PDFDropdown",
            },
            fromDate: {
              value: "",
              id: "9650",
              type: "PDFTextField",
            },
            toDate: {
              value: "",
              id: "9648",
              type: "PDFTextField",
            },
            isFromDateEst: {
              value: "Yes",
              id: "9649",
              type: "PDFCheckBox",
            },
            isToDateEst: {
              value: "Yes",
              id: "9647",
              type: "PDFCheckBox",
            },
            isVisitCurrent: {
              value: "Yes",
              id: "9646",
              type: "PDFCheckBox",
            },
          },
          {
            _id: 4,
            passportCountry: {
              value: "Chad",
              id: "9645",
              type: "PDFDropdown",
            },
            fromDate: {
              value: "",
              id: "9644",
              type: "PDFTextField",
            },
            toDate: {
              value: "",
              id: "9642",
              type: "PDFTextField",
            },
            isFromDateEst: {
              value: "Yes",
              id: "9643",
              type: "PDFCheckBox",
            },
            isToDateEst: {
              value: "Yes",
              id: "9641",
              type: "PDFCheckBox",
            },
            isVisitCurrent: {
              value: "Yes",
              id: "9634",
              type: "PDFCheckBox",
            },
          },
          {
            _id: 5,
            passportCountry: {
              value: "Fiji",
              id: "9639",
              type: "PDFDropdown",
            },
            fromDate: {
              value: "",
              id: "9638",
              type: "PDFTextField",
            },
            toDate: {
              value: "",
              id: "9636",
              type: "PDFTextField",
            },
            isFromDateEst: {
              value: "Yes",
              id: "9637",
              type: "PDFCheckBox",
            },
            isToDateEst: {
              value: "Yes",
              id: "9635",
              type: "PDFCheckBox",
            },
            isVisitCurrent: {
              value: "Yes",
              id: "9651",
              type: "PDFCheckBox",
            },
          },
          {
            _id: 6,
            passportCountry: {
              value: "Grenada",
              id: "9633",
              type: "PDFDropdown",
            },
            fromDate: {
              value: "",
              id: "9632",
              type: "PDFTextField",
            },
            toDate: {
              value: "",
              id: "9630",
              type: "PDFTextField",
            },
            isFromDateEst: {
              value: "Yes",
              id: "9631",
              type: "PDFCheckBox",
            },
            isToDateEst: {
              value: "Yes",
              id: "9629",
              type: "PDFCheckBox",
            },
            isVisitCurrent: {
              value: "Yes",
              id: "9628",
              type: "PDFCheckBox",
            },
          },
        ],
      },
      {
        _id: 2,
        countryIssued: {
          value: "Aruba",
          id: "9725",
          type: "PDFDropdown",
        },
        passportDateIssued: {
          value: "",
          id: "9724",
          type: "PDFTextField",
        },
        isPassportDateEst: {
          value: "Yes",
          id: "9723",
          type: "PDFCheckBox",
        },
        passportCity: {
          value: "",
          id: "9722",
          type: "PDFTextField",
        },
        passportCountry: {
          value: "",
          id: "9721",
          type: "PDFDropdown",
        },
        passportLName: {
          value: "",
          id: "9720",
          type: "PDFTextField",
        },
        passportFName: {
          value: "",
          id: "9719",
          type: "PDFTextField",
        },
        passportMName: {
          value: "",
          id: "9718",
          type: "PDFTextField",
        },
        passportSuffix: {
          value: "",
          id: "9717",
          type: "PDFDropdown",
        },
        passportNumber: {
          value: "",
          id: "9716",
          type: "PDFTextField",
        },
        passportExpiration: {
          value: "",
          id: "9715",
          type: "PDFTextField",
        },
        isExpirationEst: {
          value: "Yes",
          id: "9714",
          type: "PDFCheckBox",
        },
        isPassportUsed: {
          value: "YES",
          id: "17203",
          type: "PDFRadioGroup",
        },
        passportUses: [
          {
            _id: 1,
            passportCountry: {
              value: "Japan",
              id: "9711",
              type: "PDFDropdown",
            },
            fromDate: {
              value: "",
              id: "9710",
              type: "PDFTextField",
            },
            toDate: {
              value: "",
              id: "9708",
              type: "PDFTextField",
            },
            isFromDateEst: {
              value: "Yes",
              id: "9709",
              type: "PDFCheckBox",
            },
            isToDateEst: {
              value: "Yes",
              id: "9726",
              type: "PDFCheckBox",
            },
            isVisitCurrent: {
              value: "Yes",
              id: "9757",
              type: "PDFCheckBox",
            },
          },
          {
            _id: 2,
            passportCountry: {
              value: "Jamaica",
              id: "9756",
              type: "PDFDropdown",
            },
            fromDate: {
              value: "",
              id: "9755",
              type: "PDFTextField",
            },
            toDate: {
              value: "",
              id: "9753",
              type: "PDFTextField",
            },
            isFromDateEst: {
              value: "Yes",
              id: "9754",
              type: "PDFCheckBox",
            },
            isToDateEst: {
              value: "Yes",
              id: "9758",
              type: "PDFCheckBox",
            },
            isVisitCurrent: {
              value: "Yes",
              id: "9751",
              type: "PDFCheckBox",
            },
          },
          {
            _id: 3,
            passportCountry: {
              value: "Jan Mayen",
              id: "9750",
              type: "PDFDropdown",
            },
            fromDate: {
              value: "",
              id: "9749",
              type: "PDFTextField",
            },
            toDate: {
              value: "",
              id: "9747",
              type: "PDFTextField",
            },
            isFromDateEst: {
              value: "Yes",
              id: "9748",
              type: "PDFCheckBox",
            },
            isToDateEst: {
              value: "Yes",
              id: "9752",
              type: "PDFCheckBox",
            },
            isVisitCurrent: {
              value: "Yes",
              id: "9745",
              type: "PDFCheckBox",
            },
          },
          {
            _id: 4,
            passportCountry: {
              value: "Jersey",
              id: "9744",
              type: "PDFDropdown",
            },
            fromDate: {
              value: "",
              id: "9743",
              type: "PDFTextField",
            },
            toDate: {
              value: "",
              id: "9741",
              type: "PDFTextField",
            },
            isFromDateEst: {
              value: "Yes",
              id: "9742",
              type: "PDFCheckBox",
            },
            isToDateEst: {
              value: "Yes",
              id: "9746",
              type: "PDFCheckBox",
            },
            isVisitCurrent: {
              value: "Yes",
              id: "9739",
              type: "PDFCheckBox",
            },
          },
          {
            _id: 5,
            passportCountry: {
              value: "Juan de Nova Island",
              id: "9738",
              type: "PDFDropdown",
            },
            fromDate: {
              value: "",
              id: "9737",
              type: "PDFTextField",
            },
            toDate: {
              value: "",
              id: "9735",
              type: "PDFTextField",
            },
            isFromDateEst: {
              value: "Yes",
              id: "9736",
              type: "PDFCheckBox",
            },
            isToDateEst: {
              value: "Yes",
              id: "9734",
              type: "PDFCheckBox",
            },
            isVisitCurrent: {
              value: "Yes",
              id: "9733",
              type: "PDFCheckBox",
            },
          },
          {
            _id: 6,
            passportCountry: {
              value: "Jordan",
              id: "9732",
              type: "PDFDropdown",
            },
            fromDate: {
              value: "",
              id: "9731",
              type: "PDFTextField",
            },
            toDate: {
              value: "",
              id: "9729",
              type: "PDFTextField",
            },
            isFromDateEst: {
              value: "Yes",
              id: "9730",
              type: "PDFCheckBox",
            },
            isToDateEst: {
              value: "Yes",
              id: "9728",
              type: "PDFCheckBox",
            },
            isVisitCurrent: {
              value: "Yes",
              id: "9727",
              type: "PDFCheckBox",
            },
          },
        ],
      },
    ],
  };
