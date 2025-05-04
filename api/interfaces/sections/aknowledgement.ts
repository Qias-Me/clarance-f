import {type Field } from "../formDefinition";

interface AknowledgeInfo {
  aknowledge: Field<"YES" | "NO">;
  ssn?: Field<string>;
  notApplicable: Field<"Yes" | "No">;
  pageSSN: PageSSN[]

}

interface PageSSN {
  ssn: Field<string>;
}

export type { AknowledgeInfo };
