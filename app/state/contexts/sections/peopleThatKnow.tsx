import {type PeopleThatKnow } from "api/interfaces/sections/peopleThatKnow";

// peopleThatKnow covers section 16

export const peopleThatKnow: PeopleThatKnow[] = [
    {
      _id: 1,
      knownFromDate: {
        value: "fromDate",
        id: "11612",
        type: "PDFTextField",
      },
      knownToDate: {
        value: "toDate",
        id: "11610",
        type: "PDFTextField",
      },
      present: {
        value: "Yes",
        id: "11609",
        type: "PDFCheckBox",
      },
      estimatedFromDate: {
        value: "Yes",
        id: "11608",
        type: "PDFCheckBox",
      },
      estimatedToDate: {
        value: "Yes",
        id: "11611",
        type: "PDFCheckBox",
      },
      lastName: {
        value: "Lastname",
        id: "11618",
        type: "PDFTextField",
      },
      firstName: {
        value: "FirstName",
        id: "11619",
        type: "PDFTextField",
      },
      middleName: {
        value: "MiddleName",
        id: "11620",
        type: "PDFTextField",
      },
      suffix: {
        value: "III",
        id: "11616",
        type: "PDFDropdown",
      },
      emailAddress: {
        value: "Email",
        id: "11617",
        type: "PDFTextField",
      },
      emailUnknown: {
        value: "Yes",
        id: "11593",
        type: "PDFCheckBox",
      },
      rankOrTitle: {
        value: "rank",
        id: "11598",
        type: "PDFTextField",
      },
      rankOrTitleNotApplicable: {
        value: "Yes",
        id: "11594",
        type: "PDFCheckBox",
      },
      relationshipToApplicant: {
        neighbor: {
          value: "Yes",
          id: "11596",
          type: "PDFCheckBox",
        },
        workAssociate: {
          value: "Yes",
          id: "11592",
          type: "PDFCheckBox",
        },
        friend: {
          value: "Yes",
          id: "11597",
          type: "PDFCheckBox",
        },
        schoolmate: {
          value: "Yes",
          id: "11600",
          type: "PDFCheckBox",
        },
        other: {
          value: "Yes",
          id: "11599",
          type: "PDFCheckBox",
        },
        otherExplain: {
          value: "OtherExplain",
          id: "11595",
          type: "PDFCheckBox",
        },
      },
      telePhone: {
        number: {
          value: "telephone",
          id: "11615",
          type: "PDFTextField",
        },
        numberUnknown: {
          value: "Yes",
          id: "11601",
          type: "PDFCheckBox",
        },
        internationalOrDsn: {
          value: "Yes",
          id: "11614",
          type: "PDFCheckBox",
        },
        extension: {
          value: "ext",
          id: "11613",
          type: "PDFTextField",
        },
        day: {
          value: "Yes",
          id: "11700",
          type: "PDFCheckBox",
        },
        night: {
          value: "Yes",
          id: "11621",
          type: "PDFCheckBox",
        },
      },
      mobilePhone: {
        number: {
          value: "cell",
          id: "11602",
          type: "PDFTextField",
        },
        numberUnknown: {
          value: "Yes",
          id: "11699",
          type: "PDFCheckBox",
        },
        internationalOrDsn: {
          value: "Yes",
          id: "11697",
          type: "PDFCheckBox",
        },
        extension: {
          value: "ext",
          id: "11696",
          type: "PDFTextField",
        },
        day: {
          value: "Yes",
          id: "11698",
          type: "PDFCheckBox",
        },
        night: {
          value: "Yes",
          id: "11695",
          type: "PDFCheckBox",
        },
      },
      address: {
        street: {
          value: "street",
          id: "11606",
          type: "PDFTextField",
        },
        city: {
          value: "city",
          id: "11607",
          type: "PDFTextField",
        },
        state: {
          value: "CA",
          id: "11605",
          type: "PDFDropdown",
        },
        zipCode: {
          value: "zip",
          id: "11603",
          type: "PDFTextField",
        },
        country: {
          value: "Angola",
          id: "11604",
          type: "PDFDropdown",
        },
      },
    },
    {
      _id: 2,
      knownFromDate: {
        value: "fromDateE2",
        id: "11685",
        type: "PDFTextField",
      },
      knownToDate: {
        value: "toDateE2",
        id: "11683",
        type: "PDFTextField",
      },
      present: {
        value: "Yes",
        id: "11684",
        type: "PDFPDFCheckBox",
      },
      estimatedFromDate: {
        value: "Yes",
        id: "11681",
        type: "PDFPDFCheckBox",
      },
      estimatedToDate: {
        value: "Yes",
        id: "11682",
        type: "PDFPDFCheckBox",
      },
      lastName: {
        value: "LnameE2",
        id: "11691",
        type: "PDFTextField",
      },
      firstName: {
        value: "FnameE2",
        id: "11692",
        type: "PDFTextField",
      },
      middleName: {
        value: "MnameE2",
        id: "11693",
        type: "PDFTextField",
      },
      suffix: {
        value: "VIII",
        id: "11689",
        type: "PDFDropdown",
      },
      emailAddress: {
        value: "emailE2",
        id: "11690",
        type: "PDFTextField",
      },
      emailUnknown: {
        value: "Yes",
        id: "11669",
        type: "PDFPDFCheckBox",
      },
      rankOrTitle: {
        value: "RankE2",
        id: "11673",
        type: "PDFTextField",
      },
      rankOrTitleNotApplicable: {
        value: "Yes",
        id: "11694",
        type: "PDFPDFCheckBox",
      },
      relationshipToApplicant: {
        neighbor: {
          value: "Yes",
          id: "11671",
          type: "PDFPDFCheckBox",
        },
        workAssociate: {
          value: "Yes",
          id: "11675",
          type: "PDFPDFCheckBox",
        },
        friend: {
          value: "Yes",
          id: "11672",
          type: "PDFPDFCheckBox",
        },
        schoolmate: {
          value: "Yes",
          id: "11674",
          type: "PDFPDFCheckBox",
        },
        other: {
          value: "Yes",
          id: "11626",
          type: "PDFPDFCheckBox",
        },
        otherExplain: {
          value: "OtherExplainE2",
          id: "11625",
          type: "PDFPDFCheckBox",
        },
      },
      telePhone: {
        number: {
          value: "telenumbeE2",
          id: "11688",
          type: "PDFTextField",
        },
        numberUnknown: {
          value: "Yes",
          id: "11668",
          type: "PDFPDFCheckBox",
        },
        extension: {
          value: "teleExtE",
          id: "11686",
          type: "PDFTextField",
        },
        internationalOrDsn: {
          value: "Yes",
          id: "11687",
          type: "PDFPDFCheckBox",
        },

        day: {
          value: "Yes",
          id: "11670",
          type: "PDFPDFCheckBox",
        },
        night: {
          value: "Yes",
          id: "11667",
          type: "PDFPDFCheckBox",
        },
      },
      mobilePhone: {
        number: {
          value: "mobilee2",
          id: "11676",
          type: "PDFTextField",
        },
        numberUnknown: {
          value: "Yes",
          id: "11665",
          type: "PDFPDFCheckBox",
        },
        extension: {
          value: "teleExtE",
          id: "11663",
          type: "PDFTextField",
        },
        internationalOrDsn: {
          value: "Yes",
          id: "11664",
          type: "PDFPDFCheckBox",
        },

        day: {
          value: "Yes",
          id: "11662",
          type: "PDFPDFCheckBox",
        },
        night: {
          value: "Yes",
          id: "11666",
          type: "PDFPDFCheckBox",
        },
      },
      address: {
        street: {
          value: "streetE2",
          id: "11679",
          type: "PDFTextField",
        },
        city: {
          value: "cityE2",
          id: "11680",
          type: "PDFTextField",
        },
        state: {
          value: "DC",
          id: "11678",
          type: "PDFDropdown",
        },
        zipCode: {
          value: "zipE2",
          id: "11677",
          type: "PDFTextField",
        },
        country: {
          value: "Bangladesh",
          id: "11644",
          type: "PDFDropdown",
        },
      },
    },
    {
      _id: 3,
      knownFromDate: {
        value: "fromDatE3",
        id: "11652",
        type: "PDFTextField",
      },
      knownToDate: {
        value: "toDateE3",
        id: "11650",
        type: "PDFTextField",
      },
      present: {
        value: "Yes",
        id: "11651",
        type: "PDFPDFCheckBox",
      },
      estimatedFromDate: {
        value: "Yes",
        id: "11648",
        type: "PDFPDFCheckBox",
      },
      estimatedToDate: {
        value: "Yes",
        id: "11649",
        type: "PDFPDFCheckBox",
      },
      lastName: {
        value: "LNameE3",
        id: "11658",
        type: "PDFTextField",
      },
      firstName: {
        value: "FnameE3",
        id: "11659",
        type: "PDFTextField",
      },
      middleName: {
        value: "MNameE3",
        id: "11660",
        type: "PDFTextField",
      },
      suffix: {
        value: "IX",
        id: "11656",
        type: "PDFDropdown",
      },
      emailAddress: {
        value: "emailE3",
        id: "11657",
        type: "PDFTextField",
      },
      emailUnknown: {
        value: "Yes",
        id: "11635",
        type: "PDFPDFCheckBox",
      },
      rankOrTitle: {
        value: "RankE3",
        id: "11639",
        type: "PDFTextField",
      },
      rankOrTitleNotApplicable: {
        value: "Yes",
        id: "11636",
        type: "PDFPDFCheckBox",
      },
      relationshipToApplicant: {
        neighbor: {
          value: "Yes",
          id: "11637",
          type: "PDFPDFCheckBox",
        },
        workAssociate: {
          value: "Yes",
          id: "11634",
          type: "PDFPDFCheckBox",
        },
        friend: {
          value: "Yes",
          id: "11638",
          type: "PDFPDFCheckBox",
        },
        schoolmate: {
          value: "Yes",
          id: "11640",
          type: "PDFPDFCheckBox",
        },
        other: {
          value: "Yes",
          id: "11624",
          type: "PDFPDFCheckBox",
        },
        otherExplain: {
          value: "OtherExampleE3",
          id: "11623",
          type: "PDFPDFCheckBox",
        },
      },
      telePhone: {
        number: {
          value: "telenumberE3",
          id: "11655",
          type: "PDFTextField",
        },
        numberUnknown: {
          value: "Yes",
          id: "11661",
          type: "PDFPDFCheckBox",
        },
        extension: {
          value: "teleExtE",
          id: "11653",
          type: "PDFTextField",
        },
        internationalOrDsn: {
          value: "Yes",
          id: "11654",
          type: "PDFPDFCheckBox",
        },

        day: {
          value: "Yes",
          id: "11641",
          type: "PDFPDFCheckBox",
        },
        night: {
          value: "Yes",
          id: "11633",
          type: "PDFPDFCheckBox",
        },
      },
      mobilePhone: {
        number: {
          value: "mobilenumberE3",
          id: "11642",
          type: "PDFTextField",
        },
        numberUnknown: {
          value: "Yes",
          id: "11630",
          type: "PDFPDFCheckBox",
        },
        extension: {
          value: "teleExtE",
          id: "11629",
          type: "PDFTextField",
        },
        internationalOrDsn: {
          value: "Yes",
          id: "11628",
          type: "PDFPDFCheckBox",
        },

        day: {
          value: "Yes",
          id: "11632",
          type: "PDFPDFCheckBox",
        },
        night: {
          value: "Yes",
          id: "11631",
          type: "PDFPDFCheckBox",
        },
      },

      address: {
        street: {
          value: "streetE3",
          id: "11646",
          type: "PDFTextField",
        },
        city: {
          value: "cityE3",
          id: "11647",
          type: "PDFTextField",
        },
        state: {
          value: "CT",
          id: "11645",
          type: "PDFDropdown",
        },
        zipCode: {
          value: "ZipE3",
          id: "11643",
          type: "PDFTextField",
        },
        country: {
          value: "Bangladesh",
          id: "11644",
          type: "PDFDropdown",
        },
      },
    },
  ];
