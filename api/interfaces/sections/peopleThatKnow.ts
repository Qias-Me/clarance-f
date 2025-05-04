import {type Field } from "../formDefinition";

  
  interface PeopleThatKnow {
    _id: number;
    knownFromDate: Field<string>; // Assuming format 'MM/YYYY'
    knownToDate: Field<string> | null; // null if still known
    present: Field<"Yes" | "No">; // true if still known
    estimatedFromDate: Field<"Yes" | "No">;
    estimatedToDate: Field<"Yes" | "No">;
    lastName: Field<string>;
    firstName: Field<string>;
    middleName?: Field<string>; // Optional
    suffix?: Field<string>; // Optional
    emailAddress?: Field<string>; // Optional
    emailUnknown: Field<"Yes" | "No">; // true if email is unknown
    rankOrTitle?: Field<string>; // Optional
    rankOrTitleNotApplicable: Field<"Yes" | "No">; // true if rank/title is not applicable
    relationshipToApplicant: {
      neighbor: Field<"Yes" | "No">;
      workAssociate: Field<"Yes" | "No">;
      friend: Field<"Yes" | "No">;
      schoolmate: Field<"Yes" | "No">;
      other: Field<"Yes"| "No">; // Optional, explanation for other relationship
      otherExplain?: Field<string>; // Optional, explanation for other relationship

    };
    telePhone: Telephone;
    mobilePhone: Telephone;
   
    address: Address;
  }
  
  interface Telephone {
    numberUnknown: Field<"Yes" | "No">; // true if phone Field<number> is unknown
    number: Field<string>;
    extension?: Field<string>;
    internationalOrDsn: Field<"Yes" | "No">;
    day: Field<"Yes" | "No">;
    night: Field<"Yes" | "No">;
  }
  
  interface Address {
    street: Field<string>;
    city: Field<string>;
    state?: Field<string>; // Optional, if applicable
    zipCode?: Field<string>; // Optional, if applicable
    country: Field<string>;
  }
  
  export type {PeopleThatKnow}