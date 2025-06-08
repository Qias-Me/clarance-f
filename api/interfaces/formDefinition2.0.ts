import type { Print } from "~/state/contexts/sections/print";
import type { AknowledgeInfo } from "./sections/aknowledgement";
import type { PersonalInfo } from "./sections/personalInfo";
import type { Signature } from "./sections/signature";

// Import all Section 2.0 interfaces
import type { Section1 } from "./sections2.0/section1";
import type { Section2 } from "./sections2.0/section2";
import type { Section3 } from "./sections2.0/section3";
import type { Section4 } from "./sections2.0/section4";
import type { Section5 } from "./sections2.0/section5";
import type { Section6 } from "./sections2.0/section6";
import type { Section7 } from "./sections2.0/section7";
import type { Section8 } from "./sections2.0/section8";
import type { Section9 } from "./sections2.0/section9";
import type { Section10 } from "./sections2.0/section10";
import type { Section11 } from "./sections2.0/section11";
import type { Section12 } from "./sections2.0/section12";
import type { Section13 } from "./sections2.0/section13";
import type { Section17 } from "./sections2.0/section17";
import type { Section20 } from "./sections2.0/section20";
import type { Section21 } from "./sections2.0/section21";
import type { Section22 } from "./sections2.0/section22";
import type { Section23 } from "./sections2.0/section23";
import type { Section24 } from "./sections2.0/section24";
import type { Section25 } from "./sections2.0/section25";
import type { Section27 } from "./sections2.0/section27";
import type { Section28 } from "./sections2.0/section28";
import type { Section14 } from "./sections2.0/section14";
import type { Section15 } from "./sections2.0/section15";
import type { Section16 } from "./sections2.0/section16";
import type { Section29 } from "./sections2.0/section29";
import type { Section19 } from "./sections2.0/section19";
import type { Section18 } from "./sections2.0/Section18";
import type { Section26 } from "./sections2.0/section26";
import type { Section30 } from "./sections2.0/section30";


/**
 * Field interface for PDF form field mapping
 * Complete interface with all PDF field properties for validation and mapping
 * Includes standardized field ID format with 4-digit numeric IDs and full field paths
 */
interface Field<T> {
  value: T;
  id: string; // 4-digit numeric field ID (e.g., "9513")
  name: string; // Full field path (e.g., "form1[0].Sections7-9[0].TextField11[13]")
  type: string;
  label: string;
  rect?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

/**
 * Extended Field interface that includes options for dropdown fields
 */
interface FieldWithOptions<T> extends Field<T> {
  options: readonly string[];
}


/**
 * Complete ApplicantFormValues interface with all 30 SF-86 sections
 */
interface ApplicantFormValues {
  // Sections 1-30 (SF-86 Form Structure)
  section1?: Section1;
  section2?: Section2;
  section3?: Section3;
  section4?: Section4;
  section5?: Section5;
  section6?: Section6;
  section7?: Section7;
  section8?: Section8;
  section9?: Section9;
  section10?: Section10;
  section11?: Section11;
  section12?: Section12;
  section13?: Section13;
  section14?: Section14;
  section15?: Section15;
  section16?: Section16;
  section17?: Section17;
  section18?: Section18;
  section19?: Section19;
  section20?: Section20;
  section21?: Section21;
  section22?: Section22;
  section23?: Section23;
  section24?: Section24;
  section25?: Section25;
  section26?: Section26;
  section27?: Section27;
  section28?: Section28;
  section29?: Section29;
  section30?: Section30;
  print?: Print;
}

export type { Field, FieldWithOptions, ApplicantFormValues };
