import { type Field } from "api/interfaces/formDefinition";


interface ForeignContacts {
    _id: number;
    hasForeignContact: Field<"YES" | "NO">; // null to represent unanswered state
    entries?: ContactEntry[];
  }
  
  interface ContactEntry {
    _id: number;
    lastName: Field<string>;
    firstName: Field<string>;
    middleName: Field<string>;
    suffix: Field<string>;
    approximateFirstContactDate: Field<string>; // Format: "MM/YYYY"
    approximateLastContactDate: Field<string>; // Format: "MM/YYYY"
    contactMethods: ContactMethod[];
    contactFrequency: ContactFrequency[];
    relationshipNature: RelationshipNature[];
    otherNames: NameAlias[];
    citizenships: Citizenship[];
    dateOfBirth: Field<string>; // Format: "MM/DD/YYYY"
    placeOfBirth: PlaceOfBirth;
    currentAddress: Address;
    apoFpoAddress: APOFPOAddress;
    currentEmployer: Employer;
    affiliatedWithForeignGov: Field<"YES" | "NO">;
    foreignGovAffiliationDetails: Field<string>;
  }
  
  type ContactMethod = Field<'In Person' | 'Telephone' | 'Electronic' | 'Written Correspondence' | 'Other'>;
  type ContactFrequency = Field<'Daily' | 'Weekly' | 'Monthly' | 'Quarterly' | 'Annually' | 'Other'>;
  type RelationshipNature = Field<'Professional or Business' | 'Personal' | 'Obligation' | 'Other'>;
  
  interface NameAlias {
    lastName: Field<string>;
    firstName: Field<string>;
    middleName: Field<string>;
    suffix: Field<string>;
  }
  
  interface Citizenship {
    _id: number;
    country: Field<string>;
  }
  
  interface PlaceOfBirth {
    city: Field<string>;
    country: Field<string>;
  }
  
  interface Address {
    street: Field<string>;
    city: Field<string>;
    state: Field<string>;
    zipCode: Field<string>;
    country: Field<string>;
  }
  
  interface APOFPOAddress {
    address: Field<string>;
    stateCode: Field<string>;
    zipCode: Field<string>;
  }
  
  interface Employer {
    name: Field<string>;
    address: Address;
  }

  
  export type { ForeignContacts, ContactEntry, ContactMethod, ContactFrequency, RelationshipNature, NameAlias, Citizenship, PlaceOfBirth, Address, APOFPOAddress, Employer}