import { type Field } from "api/interfaces/formDefinition";


interface DateInfo {
    date: Field<string>;
    estimated: Field<"YES" | "NO">;
}

interface Location {
    city: Field<string>;
    county: Field<string>;
    state: Field<string>;
    zip: Field<string>;
    country: Field<string>;
}

interface Charge {
    _id: number;
    felonyMisdemeanor: Field<'Felony' | 'Misdemeanor'>;
    charge: Field<string>;
    outcome: Field<string>;
    dateInfo: DateInfo;
}

interface DateRange {
    from: Field<string>;
    to: Field<string>;
    estimated: Field<"YES" | "NO">;
    present: Field<"YES" | "NO">;
}

interface Section22_1 {
    dateOfOffense: DateInfo;
    description: Field<string>;
    involvedDomesticViolence: Field<"YES" | "NO">;
    involvedFirearms: Field<"YES" | "NO">;
    involvedAlcoholDrugs: Field<"YES" | "NO">;
    offenseLocation: Location;
    arrestedSummonedCited: Field<"YES" | "NO">; // (If NO, proceed to (c))
    lawEnforcementAgencyName: Field<string>;
    lawEnforcementLocation: Location;
    chargedConvicted: Field<"YES" | "NO">; // If YES, complete (c.1))
    courtName: Field<string>;
    courtLocation: Location;
    charges: Charge[];
    sentenced: Field<"YES" | "NO">; // (If YES, complete (d.1)) (If NO, complete (d.2))
    sentenceDescription: Field<string>;
    imprisonmentTermExceeding1Year: Field<"YES" | "NO">;
    imprisonmentLessThan1Year: Field<"YES" | "NO">;
    imprisonmentDates: DateRange;
    probationParoleDates: DateRange;
    awaitingTrial: Field<"YES" | "NO">;
    awaitingTrialExplanation: Field<string>;
}

interface Section22_2 {
    dateOfOffense: DateInfo;
    description: Field<string>;
    involvedDomesticViolence: Field<"YES" | "NO">;
    involvedFirearms: Field<"YES" | "NO">;
    involvedAlcoholDrugs: Field<"YES" | "NO">;
    courtName: Field<string>;
    courtLocation: Location;
    charges: Charge[];
    sentenced: Field<"YES" | "NO">; // (If YES, complete (b.1)) (If NO, complete (b.2))
    sentenceDescription: Field<string>;
    imprisonmentTermExceeding1Year: Field<"YES" | "NO">;
    imprisonmentLessThan1Year: Field<"YES" | "NO">;
    imprisonmentDates: DateRange;
    probationParoleDates: DateRange;
    awaitingTrial: Field<"YES" | "NO">;
    awaitingTrialExplanation: Field<string>;
}

interface OrderInfo {
    explanation: Field<string>;
    dateIssued: DateInfo;
    courtAgencyName: Field<string>;
    courtAgencyLocation: Location;
}

interface Section22_3 {
    hasRestrainingOrder: Field<"YES" | "NO">;
    orders: OrderInfo[];
}

interface PoliceRecord {
    _id: number;
    part1Questions: Field<"YES" | "NO">;
    part2Questions: Field<"YES" | "NO">;
    restrainingOrder: Field<"YES" | "NO">;
    section22_1?: Section22_1[];
    section22_2?: Section22_2[];
    section22_3?: Section22_3[];
}

export type { PoliceRecord, Section22_1, Section22_2, Section22_3, Charge, DateRange, Location, DateInfo, OrderInfo };
