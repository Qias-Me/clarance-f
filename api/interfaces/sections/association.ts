import { type Field } from "api/interfaces/formDefinition";


interface Association {
    _id: number;
    terrorismMember: Field<"YES" | "(If NO, proceed to 29.2)">
    actsOfTerrorism: Field<"YES" | "(If NO, proceed to 29.3)">
    overthrowByForce: Field<"YES" | "(If NO, proceed to 29.4)">
    dedicatedViolent: Field<"YES" | "(If NO, proceed to 29.5)">
    advocatesViolence: Field<"YES" | "(If NO, proceed to 29.6)">
    engagedInOverthrow: Field<"YES" | "(If NO, proceed to 29.7)">
    terrorismAssociate: Field<"YES" | "NO">;
    section29_1?: Section29_1[];
    section29_2?: Section29_2[];
    section29_3?: Section29_3[];
    section29_4?: Section29_4[];
    section29_5?: Section29_5[];
    section29_6?: Section29_6[];
    section29_7?: Section29_7[];
  }
  
  interface Section29_1 {
    activityDescription: Field<string>;
    dateRange: DateRange;
  }
  
  interface Section29_2 {
    organizationName: Field<string>;
    organizationAddress: Address;
    involvementDateRange: DateRange;
    positionsHeld: Field<string>;
    contributions: Field<string>;
    natureOfInvolvement: Field<string>;
  }
  
  interface Section29_3 {
    reasonsForAdvocacy: Field<string>;
    dateRange: DateRange;
  }
  
  interface Section29_4 {
    organizationName: Field<string>;
    organizationAddress: Address;
    involvementDateRange: DateRange;
    positionsHeld: Field<string>;
    contributions: Field<string>;
    natureOfInvolvement: Field<string>;
  }
  
  interface Section29_5 {
    organizationName: Field<string>;
    organizationAddress: Address;
    involvementDateRange: DateRange;
    positionsHeld: Field<string>;
    contributions: Field<string>;
    natureOfInvolvement: Field<string>;
  }
  
  interface Section29_6 {
    activityDescription: Field<string>;
    dateRange: DateRange;
  }
  
  interface Section29_7 {
    explanation: Field<string>;
  }
  
  interface DateRange {
    from: DateInfo;
    to: DateInfo;
    present: Field<"YES" | "NO">;
  }
  
  interface DateInfo {
    date: Field<string>;
    estimated: Field<"YES" | "NO">;
  }
  
  interface Address {
    street: Field<string>;
    city: Field<string>;
    state: Field<string>;
    zipCode: Field<string>;
    country: Field<string>;
  }
  
  export type {
    Association,
    Section29_1,
    Section29_2,
    Section29_3,
    Section29_4,
    Section29_5,
    Section29_6,
    Section29_7,
    DateRange,
    DateInfo,
    Address
  };
  