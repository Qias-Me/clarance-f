import {type Field } from "../formDefinition";


interface DualCitizenshipInfo {
    heldMultipleCitizenships: Field<"YES" | "NO (If NO, proceed to 10.2)">;
    citizenships?: CitizenshipDetail[];
    hadNonUSPassport: Field<"YES" | "NO (If NO, proceed to Section 11)">;
    passports?: PassportDetail[];
  }

  
  interface CitizenshipDetail {
    _id: number;
    country: Field<string>;
    howCitizenshipAcquired: Field<string>;
    citizenshipStart: Field<string>;
    isCitizenshipStartEstimated: Field<"Yes" | "No">;
    citizenshipEnd?: Field<string>;
    isCitizenshipEndPresent: Field<"Yes" | "No">;
    isCitizenshipEndEstimated?: Field<"Yes" | "No">;
    isRenounced: Field<"YES" | "NO">;
    renouncementDetails?: Field<string>;
    isCitizenshipHeld: Field<"YES" | "NO">;
    citizenshipExplanation?: Field<string>;
  }
  

  interface PassportDetail {
    _id: number;
    countryIssued: Field<string>;
    passportDateIssued: Field<string>;
    isPassportDateEst: Field<"Yes" | "No">;
    passportCity: Field<string>;
    passportCountry: Field<string>;
    passportLName: Field<string>;
    passportFName: Field<string>;
    passportMName: Field<string>;
    passportSuffix: Field<string>;
    passportNumber: Field<string>;
    passportExpiration: Field<string>;
    isExpirationEst: Field<"Yes" | "No">;
    isPassportUsed: Field<"YES" | "NO">;
    passportUses?: PassportUseDetail[];
  }
  
  interface PassportUseDetail {
    _id: number;
    passportCountry: Field<string>;
    fromDate: Field<string>;
    isFromDateEst: Field<"Yes" | "No">;
    toDate: Field<string>;
    isVisitCurrent: Field<"Yes" | "No">;
    isToDateEst: Field<"Yes" | "No">;
  }

  

  export type { DualCitizenshipInfo, CitizenshipDetail, PassportDetail, PassportUseDetail }; 