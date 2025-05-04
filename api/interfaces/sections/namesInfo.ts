import {type Field } from "../formDefinition";

interface NamesInfo {
    hasNames: Field<"YES" | "NO">;
    names?: ApplicantNames[];
  }

  interface DateInfo {
    date: Field<string>;
    estimated: Field<"YES" | "NO">;
    isPresent?: Field<"YES" | "NO">;
  }
  
  interface ApplicantNames {
    _id: number;
    lastName: Field<string>;
    firstName: Field<string>;
    middleName: Field<string>;
    suffix: Field<string>;
    startDate: DateInfo;
    endDate: DateInfo;
    isMaidenName: Field<"YES" | "NO">;
    reasonChanged: Field<string>;
  }


  export type { NamesInfo, ApplicantNames };  
  