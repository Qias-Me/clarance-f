import { type Field } from "api/interfaces/formDefinition";


interface Civil {
    _id: number;
    civilCourt: Field<"YES" | "NO">; // (If NO, proceed to 26.2)
    section28_1?: Section28_1[];
  }
  
  interface Section28_1 {
    dateOfAction: DateInfo;
    courtName: Field<string>;
    courtAddress: Address;
    details:Field<string>;  
    description: Field<string>;
    principalParties: PrincipalParties[];
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

  interface PrincipalParties {
    _id: number;
    name: Field<string>;
  }
  
  export type { Civil, Section28_1, DateInfo, DateRange, Address };
  