import { type Field } from "api/interfaces/formDefinition";

interface PersonalInfo {
    applicantID?: string;
    lastName: Field<string>;
    firstName: Field<string>;
    middleName: Field<string>;
    suffix: Field<string>;
  }

  export type { PersonalInfo };