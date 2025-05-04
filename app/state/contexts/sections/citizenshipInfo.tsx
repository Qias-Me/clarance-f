import { type CitizenshipInfo } from "api/interfaces/sections/citizenship";

// citizenshipInfo covers section 9

export const citizenshipInfo: CitizenshipInfo = {
    citizenship_status_code: {
      value:
        "I am a U.S. citizen or national by birth in the U.S. or U.S. territory/commonwealth. (Proceed to Section 10)   ",
      id: "17233",
      type: "PDFRadioGroup",
    },
    section9_1: {
      doc_type: {
        value: "Other (Provide explanation)",
        id: "17235",
        type: "PDFRadioGroup",
      },
      other_doc: {
        value: "OtherExplain9.1",
        id: "9539",
        type: "PDFTextField",
      },
      doc_num: {
        value: "DocumentNumber9.1",
        id: "9538",
        type: "PDFTextField",
      },
      doc_issue_date: {
        value: "DateIssued9.1",
        id: "9522",
        type: "PDFTextField",
      },
      is_issue_date_est: {
        value: "Yes",
        id: "9521",
        type: "PDFCheckBox",
      },
      issue_city: {
        value: "City9.1",
        id: "9535",
        type: "PDFTextField",
      },
      issued_state: {
        value: "DC",
        id: "9536",
        type: "PDFDropdown",
      },
      issued_country: {
        value: "Angola",
        id: "9537",
        type: "PDFDropdown",
      },
      issued_fname: {
        value: "9.1FirstName",
        id: "9532",
        type: "PDFTextField",
      },
      issued_lname: {
        value: "9.1LastName",
        id: "9533",
        type: "PDFTextField",
      },
      issued_mname: {
        value: "9.1MiddleName",
        id: "9534",
        type: "PDFTextField",
      },
      issued_suffix: {
        value: "III",
        id: "9531",
        type: "PDFDropdown",
      },
      citizenship_num: {
        value: "CertificateNumber9.1",
        id: "9520",
        type: "PDFTextField",
      },
      certificate_issue_date: {
        value: "DateCertificateIssued9.1",
        id: "9519",
        type: "PDFTextField",
      },
      is_certificate_date_est: {
        value: "Yes",
        id: "9518",
        type: "PDFCheckBox",
      },
      certificate_fname: {
        value: "CertificateLFName",
        id: "9528",
        type: "PDFTextField",
      },
      certificate_lname: {
        value: "CertificateLName",
        id: "9529",
        type: "PDFTextField",
      },
      certificate_mname: {
        value: "CertificateMName",
        id: "9530",
        type: "PDFTextField",
      },
      certificate_suffix: {
        value: "V",
        id: "9527",
        type: "PDFDropdown",
      },
      is_born_installation: {
        value: "YES",
        id: "17234",
        type: "PDFRadioGroup",
      },
      base_name: {
        value: "Military Installation Base",
        id: "9556",
        type: "PDFTextField",
      },
    },
    section9_2: {
      us_entry_date: {
        value: "9.2DateOfEntry",
        id: "9591",
        type: "PDFTextField",
      },
      is_us_entry_date_est: {
        value: "Yes",
        id: "9590",
        type: "PDFCheckBox",
      },
      entry_city: {
        value: "9.2CityEntry",
        id: "9588",
        type: "PDFTextField",
      },
      entry_state: {
        value: "AZ",
        id: "9589",
        type: "PDFDropdown",
      },
      country_of_citizenship_1: {
        value: "Algeria",
        id: "9587",
        type: "PDFDropdown",
      },
      country_of_citizenship_2: {
        value: "Albania",
        id: "9583",
        type: "PDFDropdown",
      },
      has_alien_registration: {
        value: "YES",
        id: "17230",
        type: "PDFRadioGroup",
      },
      alien_registration_num: {
        value: "9.2AlienRegistrationNumber",
        id: "9586",
        type: "PDFTextField",
      },
      naturalization_num: {
        value: "9.2NaturalizationCertificateNumber",
        id: "9616",
        type: "PDFTextField",
      },
      naturalization_issue_date: {
        value: "9.3DateIssued",
        id: "9603",
        type: "PDFTextField",
      },
      is_natural_issue_est: {
        value: "Yes",
        id: "9617",
        type: "PDFCheckBox",
      },
      court_name: {
        value: "9.2NaturalizationCourt",
        id: "9592",
        type: "PDFTextField",
      },
      court_issued_date: {
        value: "9.2NaturalizationDate",
        id: "9618",
        type: "PDFTextField",
      },
      court_street: {
        value: "9.2NaturalizationStreet",
        id: "9620",
        type: "PDFTextField",
      },
      court_city: {
        value: "9.2NaturalizationCity",
        id: "9625",
        type: "PDFTextField",
      },
      court_state: {
        value: "CA",
        id: "9626",
        type: "PDFDropdown",
      },
      court_zip: {
        value: "9.2Zip",
        id: "9619",
        type: "PDFTextField",
      },
      court_issued_fname: {
        value: "9.2NaturalizationFName",
        id: "9623",
        type: "PDFTextField",
      },
      court_issued_lname: {
        value: "9.2NaturalizationLName",
        id: "9624",
        type: "PDFTextField",
      },
      court_issued_mname: {
        value: "9.2NaturalizationMName",
        id: "9622",
        type: "PDFTextField",
      },
      court_issued_suffix: {
        value: "IV",
        id: "9621",
        type: "PDFDropdown",
      },
      is_other: {
        value: "Yes",
        id: "9600",
        type: "PDFCheckBox",
      },
      is_basedOn_naturalization: {
        value: "Yes",
        id: "9599",
        type: "PDFCheckBox",
      },
      other_basis_detail: {
        value: "9.2NaturalizationOtherExplaination",
        id: "9614",
        type: "PDFTextField",
      },
    },
    section9_3: {
      alien_registration_num: {
        value: "9.3AlienNumber",
        id: "9578",
        type: "PDFTextField",
      },
      permanent_resident_num: {
        value: "9.3ResidentCard",
        id: "9577",
        type: "PDFTextField",
      },
      certificate_of_citizenship_num: {
        value: "9.3CertificateNumber",
        id: "9576",
        type: "PDFTextField",
      },
      doc_fname: {
        value: "9.3FirstName",
        id: "9573",
        type: "PDFTextField",
      },
      doc_lname: {
        value: "9.3LastName",
        id: "9574",
        type: "PDFTextField",
      },
      doc_mname: {
        value: "9.3MiddleName",
        id: "9575",
        type: "PDFTextField",
      },
      doc_suffix: {
        value: "VII",
        id: "9572",
        type: "PDFDropdown",
      },
      doc_issue_date: {
        value: "9.3DateIssued",
        id: "9568",
        type: "PDFTextField",
      },
      is_doc_date_est: {
        value: "Yes",
        id: "9567",
        type: "PDFCheckBox",
      },
      is_other: {
        value: "Yes",
        id: "9570",
        type: "PDFCheckBox",
      },
      is_basedOn_naturalization: {
        value: "Yes",
        id: "9569",
        type: "PDFCheckBox",
      },
      basis_of_citizenship_explanation: {
        value: "9.3OtherExplaination",
        id: "9571",
        type: "PDFTextField",
      },
    },
    section9_4: {
      residence_status: {
        value: "9.4ResidenceStatus",
        id: "9611",
        type: "PDFTextField",
      },
      us_entry_date: {
        value: "9.4DateOfEntry",
        id: "9613",
        type: "PDFTextField",
      },
      is_entry_date_est: {
        value: "Yes",
        id: "9612",
        type: "PDFCheckBox",
      },
      country_of_citizenship1: {
        value: "Antigua and Barbuda",
        id: "9580",
        type: "PDFDropdown",
      },
      country_of_citizenship2: {
        value: "Argentina",
        id: "9579",
        type: "PDFDropdown",
      },
      entry_city: {
        value: "9.4City",
        id: "9581",
        type: "PDFTextField",
      },
      entry_state: {
        value: "IA",
        id: "9582",
        type: "PDFDropdown",
      },
      alien_registration_num: {
        value: "9.4AlienRegistrationNumb",
        id: "9608",
        type: "PDFTextField",
      },
      expiration_date: {
        value: "9.4Expiration(I-766)",
        id: "9566",
        type: "PDFTextField",
      },
      is_expiration_est: {
        value: "Yes",
        id: "9569",
        type: "PDFCheckBox",
      },
      document_issued: {
        value: "5",
        id: "17229",
        type: "PDFRadioGroup",
      },
      other_doc: {
        value: "9.4Explaination",
        id: "9593",
        type: "PDFTextField",
      },
      doc_num: {
        value: "9.4DocumentNumber",
        id: "9602",
        type: "PDFTextField",
      },
      doc_issued_date: {
        value: "9.4DocumentIssued",
        id: "9610",
        type: "PDFTextField",
      },
      is_doc_date_est: {
        value: "Yes",
        id: "9601",
        type: "PDFCheckBox",
      },
      doc_expire_date: {
        value: "9.4DocumentExpeiration",
        id: "9603",
        type: "PDFTextField",
      },
      is_doc_expiration_est: {
        value: "Yes",
        id: "9609",
        type: "PDFCheckBox",
      },
      doc_fname: {
        value: "9.4DocumentFName",
        id: "9605",
        type: "PDFTextField",
      },
      doc_lname: {
        value: "9.4DocumentLName",
        id: "9606",
        type: "PDFTextField",
      },
      doc_mname: {
        value: "9.4DocumentMName",
        id: "9607",
        type: "PDFTextField",
      },
      doc_suffix: {
        value: "VIII",
        id: "9604",
        type: "PDFDropdown",
      },
    },
  };
