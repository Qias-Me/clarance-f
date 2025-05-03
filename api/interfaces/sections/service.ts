import { Field } from "../formDefinition";

interface ServiceInfo {
  bornAfter1959: Field<"YES" | "NO (Proceed to Section 15)">; // null to represent unanswered state
  registeredWithSSS: Field<"Yes" | "No" | "1">; // null to represent unanswered state
  explanations?: {
    [key in "Yes" | "No" | "I don't know"]?: Field<string>; // Dynamic mapping of explanations based on the registeredWithSSS value.
  };
}

export type { ServiceInfo };
