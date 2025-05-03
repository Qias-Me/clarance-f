import { Field } from "api/interfaces/formDefinition";


interface Technology {
    _id: number;
    illegalAccess: Field<"YES" | "NO">; // (If NO, proceed to 27.2)
    illegalModification: Field<"YES" | "NO">; // (If NO, proceed to 27.3)
    unauthorizedUse: Field<"YES" | "NO">; // (If NO, proceed to 27.4)
    section27_1?: Section27_1[];
    section27_2?: Section27_2[];
    section27_3?: Section27_3[];
  }
  
  interface DateInfo {
    date: Field<string>;
    estimated: Field<"YES" | "NO">;
  }
  
  interface DateRange {
    from: DateInfo;
    to: DateInfo;
    present: Field<"YES" | "NO">;
  }
  
  interface Address {
    street: Field<string>;
    city: Field<string>;
    state: Field<string>;
    zipCode: Field<string>;
    country: Field<string>;
  }
  
  interface Section27_1 {
    _id: number;
    incidentDate: DateInfo;
    description: Field<string>;
    location: Address;
    actionDescription: Field<string>;
  }
  
  interface Section27_2 {
    _id: number;
    incidentDate: DateInfo;
    description: Field<string>;
    location: Address;
    actionDescription: Field<string>;
  }
  
  interface Section27_3 {
    _id: number;
    incidentDate: DateInfo;
    description: Field<string>;
    location: Address;
    actionDescription: Field<string>;
  }

  export type { Technology, DateInfo, DateRange, Address, Section27_1, Section27_2, Section27_3 };