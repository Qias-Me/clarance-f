/**
 * Section 26: Financial Record
 *
 * TypeScript interface definitions for SF-86 Section 26 (Financial Record) data structure.
 * Based on the established Field<T> interface patterns and PDF field ID mappings from section-26.json.
 * 
 * This section covers financial issues including bankruptcy, liens, judgments, garnishments,
 * delinquent taxes, credit counseling, foreclosures, repossessions, debt collections, and other
 * financial problems that may affect an individual's ability to safeguard classified information.
 * 
 * The section includes subsections for:
 * - 26.1: Bankruptcy filings (Chapter 7, 11, 13, etc.)
 * - 26.2: Gambling-related financial problems
 * - 26.3: Tax delinquencies and failures to file
 * - 26.4: Employment credit card violations
 * - 26.5: Credit counseling services
 * - 26.6: Judgments, liens, alimony/child support, federal debt
 * - 26.7: Foreclosures, repossessions, collections, defaults, evictions, garnishments, delinquencies
 */

import type { Field } from '../formDefinition2.0';
import { createFieldFromReference } from '../../utils/sections-references-loader';

// ============================================================================
// SHARED TYPE DEFINITIONS
// ============================================================================

/**
 * US States and territories for address fields
 */
export type USState = 
  | "AL" | "AK" | "AZ" | "AR" | "CA" | "CO" | "CT" | "DE" | "FL" | "GA"
  | "HI" | "ID" | "IL" | "IN" | "IA" | "KS" | "KY" | "LA" | "ME" | "MD"
  | "MA" | "MI" | "MN" | "MS" | "MO" | "MT" | "NE" | "NV" | "NH" | "NJ"
  | "NM" | "NY" | "NC" | "ND" | "OH" | "OK" | "OR" | "PA" | "RI" | "SC"
  | "SD" | "TN" | "TX" | "UT" | "VT" | "VA" | "WA" | "WV" | "WI" | "WY"
  | "DC" | "PR" | "VI" | "GU" | "AS" | "MP";

/**
 * Country options for international addresses
 */
export type Country = string; // ISO country codes or country names

/**
 * Date information with estimation flag
 */
export interface DateInfo {
  date: Field<string>;
  estimated: Field<boolean>;
  dontKnow?: Field<boolean>;
}

/**
 * Address structure used across multiple sections
 */
export interface Address {
  street: Field<string>;
  city: Field<string>;
  state: Field<USState>;
  zipCode: Field<string>;
  county?: Field<string>;
  country: Field<Country>;
}

/**
 * Amount field with currency formatting
 */
export interface AmountField {
  amount: Field<string>;
  currency: Field<"USD" | "OTHER">;
  otherCurrency?: Field<string>;
}

// ============================================================================
// BANKRUPTCY INTERFACES (26.1)
// ============================================================================

/**
 * Bankruptcy chapter types
 */
export type BankruptcyChapter = 
  | "CHAPTER_7"
  | "CHAPTER_11" 
  | "CHAPTER_12"
  | "CHAPTER_13"
  | "OTHER";

/**
 * Bankruptcy filing entry
 */
export interface BankruptcyEntry {
  _id: number;
  
  // Bankruptcy details
  bankruptcyChapter: {
    chapter: Field<BankruptcyChapter>;
    otherChapterDescription: Field<string>; // Only if chapter is OTHER
  };
  
  // Filing information
  filingDate: DateInfo;
  docketNumber: Field<string>;
  
  // Court information
  court: {
    courtName: Field<string>;
    address: Address;
  };
  
  // Financial amounts
  totalAmount: AmountField;
  
  // Discharge information
  dischargeDate: DateInfo;
  isCurrentlyInBankruptcy: Field<"YES" | "NO">;
  
  // Explanation
  explanation: Field<string>;
}

/**
 * Bankruptcy subsection (26.1)
 */
export interface BankruptcySubsection {
  hasBankruptcyFilings: Field<"YES" | "NO">;
  entries: BankruptcyEntry[];
  entriesCount: number;
}

// ============================================================================
// GAMBLING INTERFACES (26.2)
// ============================================================================

/**
 * Gambling-related financial problems entry
 */
export interface GamblingEntry {
  _id: number;
  
  // Gambling details
  gamblingType: Field<string>; // Type of gambling (casino, online, sports betting, etc.)
  timeframe: {
    startDate: DateInfo;
    endDate: DateInfo;
    isOngoing: Field<"YES" | "NO">;
  };
  
  // Financial impact
  financialLoss: AmountField;
  
  // Treatment or counseling
  receivedTreatment: Field<"YES" | "NO">;
  treatmentDetails: {
    provider: Field<string>;
    address: Address;
    treatmentDates: {
      startDate: DateInfo;
      endDate: DateInfo;
    };
  };
  
  // Current status
  currentStatus: Field<string>;
  explanation: Field<string>;
}

/**
 * Gambling subsection (26.2)
 */
export interface GamblingSubsection {
  hasGamblingProblems: Field<"YES" | "NO">;
  entries: GamblingEntry[];
  entriesCount: number;
}

// ============================================================================
// TAX INTERFACES (26.3)
// ============================================================================

/**
 * Tax authority types
 */
export type TaxAuthority = 
  | "FEDERAL"
  | "STATE"
  | "LOCAL"
  | "OTHER";

/**
 * Tax delinquency entry
 */
export interface TaxDelinquencyEntry {
  _id: number;
  
  // Tax authority
  taxAuthority: {
    type: Field<TaxAuthority>;
    authorityName: Field<string>; // Specific agency name
    otherAuthorityDescription: Field<string>; // Only if type is OTHER
  };
  
  // Tax period information
  taxYears: Field<string>; // e.g., "2018, 2019, 2020"
  
  // Delinquency details
  delinquencyType: Field<"FAILED_TO_FILE" | "FAILED_TO_PAY" | "BOTH">;
  amountOwed: AmountField;
  
  // Resolution information
  isResolved: Field<"YES" | "NO" | "PARTIALLY">;
  resolutionDate: DateInfo;
  resolutionMethod: Field<string>; // Payment plan, settlement, etc.
  
  // Current status
  currentStatus: Field<string>;
  explanation: Field<string>;
}

/**
 * Tax delinquency subsection (26.3)
 */
export interface TaxDelinquencySubsection {
  hasTaxDelinquencies: Field<"YES" | "NO">;
  entries: TaxDelinquencyEntry[];
  entriesCount: number;
}

// ============================================================================
// CREDIT CARD VIOLATIONS INTERFACES (26.4)
// ============================================================================

/**
 * Employment credit card violation entry
 */
export interface CreditCardViolationEntry {
  _id: number;
  
  // Employer information
  employer: {
    name: Field<string>;
    address: Address;
  };
  
  // Violation details
  violationDate: DateInfo;
  violationType: Field<"MISUSE" | "UNAUTHORIZED_USE" | "FAILURE_TO_PAY" | "OTHER">;
  otherViolationDescription: Field<string>; // Only if type is OTHER
  
  // Disciplinary action
  disciplinaryAction: Field<string>; // Warning, suspension, termination, etc.
  
  // Financial impact
  amountInvolved: AmountField;
  
  // Resolution
  wasRepaid: Field<"YES" | "NO">;
  repaymentDate: DateInfo;
  
  explanation: Field<string>;
}

/**
 * Credit card violations subsection (26.4)
 */
export interface CreditCardViolationSubsection {
  hasCreditCardViolations: Field<"YES" | "NO">;
  entries: CreditCardViolationEntry[];
  entriesCount: number;
}

// ============================================================================
// CREDIT COUNSELING INTERFACES (26.5)
// ============================================================================

/**
 * Credit counseling entry
 */
export interface CreditCounselingEntry {
  _id: number;
  
  // Counseling service details
  serviceProvider: {
    name: Field<string>;
    address: Address;
    phoneNumber: Field<string>;
  };
  
  // Counseling period
  counselingDates: {
    startDate: DateInfo;
    endDate: DateInfo;
    isOngoing: Field<"YES" | "NO">;
  };
  
  // Service type
  serviceType: Field<"DEBT_MANAGEMENT" | "BUDGET_COUNSELING" | "BANKRUPTCY_COUNSELING" | "OTHER">;
  otherServiceDescription: Field<string>; // Only if type is OTHER
  
  // Outcome
  wasSuccessful: Field<"YES" | "NO" | "PARTIALLY">;
  currentStatus: Field<string>;
  
  explanation: Field<string>;
}

/**
 * Credit counseling subsection (26.5)
 */
export interface CreditCounselingSubsection {
  isUtilizingCreditCounseling: Field<"YES" | "NO">;
  entries: CreditCounselingEntry[];
  entriesCount: number;
}

// ============================================================================
// FINANCIAL OBLIGATIONS INTERFACES (26.6)
// ============================================================================

/**
 * Alimony/Child Support entry
 */
export interface AlimonyChildSupportEntry {
  _id: number;
  
  // Court information
  court: {
    courtName: Field<string>;
    address: Address;
  };
  
  // Support details
  supportType: Field<"ALIMONY" | "CHILD_SUPPORT" | "BOTH">;
  monthlyAmount: AmountField;
  
  // Delinquency information
  delinquencyStartDate: DateInfo;
  delinquencyEndDate: DateInfo;
  totalDelinquentAmount: AmountField;
  
  // Current status
  isCurrent: Field<"YES" | "NO">;
  currentStatus: Field<string>;
  
  explanation: Field<string>;
}

/**
 * Judgment entry
 */
export interface JudgmentEntry {
  _id: number;
  
  // Court information
  court: {
    courtName: Field<string>;
    address: Address;
    caseNumber: Field<string>;
  };
  
  // Judgment details
  judgmentDate: DateInfo;
  judgmentAmount: AmountField;
  creditorName: Field<string>;
  
  // Nature of judgment
  judgmentType: Field<string>; // Credit card debt, personal loan, etc.
  
  // Satisfaction status
  isSatisfied: Field<"YES" | "NO" | "PARTIALLY">;
  satisfactionDate: DateInfo;
  amountPaid: AmountField;
  
  explanation: Field<string>;
}

/**
 * Lien entry
 */
export interface LienEntry {
  _id: number;
  
  // Lien details
  lienType: Field<"TAX_LIEN" | "MECHANIC_LIEN" | "JUDGMENT_LIEN" | "OTHER">;
  otherLienDescription: Field<string>; // Only if type is OTHER
  
  // Property information
  propertyDescription: Field<string>;
  propertyAddress: Address;
  
  // Lien holder
  lienHolder: {
    name: Field<string>;
    address: Address;
  };
  
  // Financial details
  lienAmount: AmountField;
  lienDate: DateInfo;
  
  // Release status
  isReleased: Field<"YES" | "NO">;
  releaseDate: DateInfo;
  
  explanation: Field<string>;
}

/**
 * Federal debt entry
 */
export interface FederalDebtEntry {
  _id: number;
  
  // Debt details
  debtType: Field<string>; // Student loan, tax debt, etc.
  creditorAgency: Field<string>; // IRS, Dept of Education, etc.
  
  // Financial information
  originalAmount: AmountField;
  currentBalance: AmountField;
  
  // Delinquency information
  delinquencyStartDate: DateInfo;
  monthsDelinquent: Field<number>;
  
  // Resolution efforts
  hasPaymentPlan: Field<"YES" | "NO">;
  paymentPlanDetails: Field<string>;
  
  // Current status
  currentStatus: Field<string>;
  
  explanation: Field<string>;
}

/**
 * Financial obligations subsection (26.6)
 */
export interface FinancialObligationsSubsection {
  // 26.6.1 - Alimony/Child Support
  hasAlimonyChildSupportDelinquencies: Field<"YES" | "NO">;
  alimonyChildSupportEntries: AlimonyChildSupportEntry[];
  
  // 26.6.2 - Judgments
  hasJudgments: Field<"YES" | "NO">;
  judgmentEntries: JudgmentEntry[];
  
  // 26.6.3 - Liens
  hasLiens: Field<"YES" | "NO">;
  lienEntries: LienEntry[];
  
  // 26.6.4 - Federal Debt
  hasFederalDebt: Field<"YES" | "NO">;
  federalDebtEntries: FederalDebtEntry[];
  
  totalEntriesCount: number;
}

// ============================================================================
// FINANCIAL PROBLEMS INTERFACES (26.7)
// ============================================================================

/**
 * Foreclosure/Repossession entry
 */
export interface ForeclosureRepossessionEntry {
  _id: number;
  
  // Property/Item details
  propertyType: Field<"REAL_ESTATE" | "VEHICLE" | "OTHER">;
  propertyDescription: Field<string>;
  propertyValue: AmountField;
  
  // Financial institution
  creditor: {
    name: Field<string>;
    address: Address;
  };
  
  // Action details
  actionType: Field<"FORECLOSURE" | "REPOSSESSION">;
  actionDate: DateInfo;
  wasVoluntary: Field<"YES" | "NO">;
  
  // Deficiency information
  hasDeficiencyBalance: Field<"YES" | "NO">;
  deficiencyAmount: AmountField;
  
  explanation: Field<string>;
}

/**
 * Default entry
 */
export interface DefaultEntry {
  _id: number;
  
  // Loan details
  loanType: Field<string>; // Mortgage, auto loan, personal loan, etc.
  creditorName: Field<string>;
  originalAmount: AmountField;
  
  // Default information
  defaultDate: DateInfo;
  defaultAmount: AmountField;
  
  // Resolution
  isResolved: Field<"YES" | "NO">;
  resolutionDate: DateInfo;
  resolutionMethod: Field<string>;
  
  explanation: Field<string>;
}

/**
 * Collection entry
 */
export interface CollectionEntry {
  _id: number;
  
  // Original creditor
  originalCreditor: Field<string>;
  
  // Collection agency
  collectionAgency: {
    name: Field<string>;
    address: Address;
  };
  
  // Debt details
  debtType: Field<string>;
  originalAmount: AmountField;
  collectionAmount: AmountField;
  collectionDate: DateInfo;
  
  // Resolution
  isResolved: Field<"YES" | "NO">;
  resolutionDate: DateInfo;
  amountPaid: AmountField;
  
  explanation: Field<string>;
}

/**
 * Suspended/Cancelled Account entry
 */
export interface SuspendedAccountEntry {
  _id: number;
  
  // Account details
  accountType: Field<"CREDIT_CARD" | "LINE_OF_CREDIT" | "OTHER">;
  creditorName: Field<string>;
  accountNumber: Field<string>; // Last 4 digits only
  
  // Action details
  actionType: Field<"SUSPENDED" | "CHARGED_OFF" | "CANCELLED">;
  actionDate: DateInfo;
  reasonForAction: Field<string>;
  
  // Financial details
  balanceAtAction: AmountField;
  currentBalance: AmountField;
  
  explanation: Field<string>;
}

/**
 * Eviction entry
 */
export interface EvictionEntry {
  _id: number;
  
  // Property details
  propertyAddress: Address;
  landlord: {
    name: Field<string>;
    address: Address;
  };
  
  // Eviction details
  evictionDate: DateInfo;
  reasonForEviction: Field<string>;
  amountOwed: AmountField;
  
  // Court information
  court: {
    courtName: Field<string>;
    address: Address;
    caseNumber: Field<string>;
  };
  
  explanation: Field<string>;
}

/**
 * Garnishment entry
 */
export interface GarnishmentEntry {
  _id: number;
  
  // Garnishment details
  garnishmentType: Field<"WAGE" | "BANK" | "OTHER">;
  creditorName: Field<string>;
  garnishmentAmount: AmountField;
  
  // Timeline
  garnishmentStartDate: DateInfo;
  garnishmentEndDate: DateInfo;
  isActive: Field<"YES" | "NO">;
  
  // Court information
  court: {
    courtName: Field<string>;
    address: Address;
    caseNumber: Field<string>;
  };
  
  explanation: Field<string>;
}

/**
 * Delinquency entry (120+ days)
 */
export interface DelinquencyEntry {
  _id: number;
  
  // Debt details
  creditorName: Field<string>;
  debtType: Field<string>;
  originalAmount: AmountField;
  currentBalance: AmountField;
  
  // Delinquency information
  delinquencyStartDate: DateInfo;
  daysDelinquent: Field<number>;
  
  // Current status
  isCurrentlyDelinquent: Field<"YES" | "NO">;
  lastPaymentDate: DateInfo;
  
  // Resolution efforts
  hasPaymentPlan: Field<"YES" | "NO">;
  paymentPlanDetails: Field<string>;
  
  explanation: Field<string>;
}

/**
 * Financial problems subsection (26.7)
 */
export interface FinancialProblemsSubsection {
  // 26.7.1 - Foreclosures/Repossessions
  hasForeclosuresRepossessions: Field<"YES" | "NO">;
  foreclosureRepossessionEntries: ForeclosureRepossessionEntry[];
  
  // 26.7.2 - Defaults
  hasDefaults: Field<"YES" | "NO">;
  defaultEntries: DefaultEntry[];
  
  // 26.7.3 - Collections
  hasCollections: Field<"YES" | "NO">;
  collectionEntries: CollectionEntry[];
  
  // 26.7.4 - Suspended/Cancelled Accounts
  hasSuspendedAccounts: Field<"YES" | "NO">;
  suspendedAccountEntries: SuspendedAccountEntry[];
  
  // 26.7.5 - Evictions
  hasEvictions: Field<"YES" | "NO">;
  evictionEntries: EvictionEntry[];
  
  // 26.7.6 - Garnishments
  hasGarnishments: Field<"YES" | "NO">;
  garnishmentEntries: GarnishmentEntry[];
  
  // 26.7.7 - Past Delinquencies (120+ days)
  hasPastDelinquencies: Field<"YES" | "NO">;
  pastDelinquencyEntries: DelinquencyEntry[];
  
  // 26.7.8 - Current Delinquencies (120+ days)
  hasCurrentDelinquencies: Field<"YES" | "NO">;
  currentDelinquencyEntries: DelinquencyEntry[];
  
  totalEntriesCount: number;
}

// ============================================================================
// MAIN SECTION INTERFACE
// ============================================================================

/**
 * Section 26 subsection keys
 */
export type Section26SubsectionKey = 
  | 'bankruptcy'
  | 'gambling'
  | 'taxDelinquency'
  | 'creditCardViolations'
  | 'creditCounseling'
  | 'financialObligations'
  | 'financialProblems';

/**
 * Section 26 entry types for unified handling
 */
export type Section26EntryType = 
  | BankruptcyEntry
  | GamblingEntry
  | TaxDelinquencyEntry
  | CreditCardViolationEntry
  | CreditCounselingEntry
  | AlimonyChildSupportEntry
  | JudgmentEntry
  | LienEntry
  | FederalDebtEntry
  | ForeclosureRepossessionEntry
  | DefaultEntry
  | CollectionEntry
  | SuspendedAccountEntry
  | EvictionEntry
  | GarnishmentEntry
  | DelinquencyEntry;

/**
 * Main Section 26 interface
 */
export interface Section26 {
  _id: number;
  section26: {
    // 26.1 - Bankruptcy
    bankruptcy: BankruptcySubsection;
    
    // 26.2 - Gambling
    gambling: GamblingSubsection;
    
    // 26.3 - Tax Delinquency
    taxDelinquency: TaxDelinquencySubsection;
    
    // 26.4 - Credit Card Violations
    creditCardViolations: CreditCardViolationSubsection;
    
    // 26.5 - Credit Counseling
    creditCounseling: CreditCounselingSubsection;
    
    // 26.6 - Financial Obligations
    financialObligations: FinancialObligationsSubsection;
    
    // 26.7 - Financial Problems
    financialProblems: FinancialProblemsSubsection;
  };
}

// ============================================================================
// VALIDATION INTERFACES
// ============================================================================

/**
 * Section 26 validation context
 */
export interface Section26ValidationContext {
  currentDate: Date;
  rules: {
    timeframeYears: number; // Typically 7 years for financial issues
    requiresCourtInformation: boolean;
    requiresAmountDetails: boolean;
    requiresResolutionStatus: boolean;
    allowsEstimatedDates: boolean;
    maxDescriptionLength: number;
    requiresExplanationForUnresolved: boolean;
    requiresCurrentStatusUpdate: boolean;
  };
}

/**
 * Financial validation result
 */
export interface FinancialValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  missingRequiredFields: string[];
  dateRangeIssues: string[];
  inconsistencies: string[];
  amountValidationIssues: string[];
}

/**
 * Section 26 field update structure
 */
export interface Section26FieldUpdate {
  subsectionKey: Section26SubsectionKey;
  entryIndex?: number;
  fieldPath: string;
  newValue: any;
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Create a standardized field with Section 26 naming
 */
const createField = <T>(id: string, value: T, name?: string, type = "PDFTextField", label = ""): Field<T> => ({
  id,
  name: name || id,
  value,
  type,
  label,
  rect: {
    x: 0,
    y: 0,
    width: 0,
    height: 0
  }
});

/**
 * Create default date info
 */
const createDefaultDateInfo = (idPrefix: string): DateInfo => ({
  date: createField(`${idPrefix}_date`, "", `${idPrefix}[date]`, "PDFTextField", "Date"),
  estimated: createField(`${idPrefix}_estimated`, false, `${idPrefix}[estimated]`, "PDFCheckBox", "Estimated")
});

/**
 * Create default address
 */
const createDefaultAddress = (idPrefix: string): Address => ({
  street: createField(`${idPrefix}_street`, "", `${idPrefix}[street]`, "PDFTextField", "Street Address"),
  city: createField(`${idPrefix}_city`, "", `${idPrefix}[city]`, "PDFTextField", "City"),
  state: createField<USState>(`${idPrefix}_state`, "AL", `${idPrefix}[state]`, "PDFDropDown", "State"),
  zipCode: createField(`${idPrefix}_zipcode`, "", `${idPrefix}[zipCode]`, "PDFTextField", "Zip Code"),
  country: createField(`${idPrefix}_country`, "United States", `${idPrefix}[country]`, "PDFDropDown", "Country")
});

/**
 * Create default amount field
 */
const createDefaultAmountField = (idPrefix: string): AmountField => ({
  amount: createField(`${idPrefix}_amount`, "", `${idPrefix}[amount]`, "PDFTextField", "Amount"),
  currency: createField<"USD" | "OTHER">(`${idPrefix}_currency`, "USD", `${idPrefix}[currency]`, "PDFDropDown", "Currency")
});

// ============================================================================
// DEFAULT CREATORS
// ============================================================================

/**
 * Create default bankruptcy entry
 */
export const createDefaultBankruptcyEntry = (): BankruptcyEntry => ({
  _id: Date.now(),
  bankruptcyChapter: {
    chapter: createField<BankruptcyChapter>("bankruptcy_chapter", "CHAPTER_7"),
    otherChapterDescription: createField("bankruptcy_other_chapter", "")
  },
  filingDate: createDefaultDateInfo("bankruptcy_filing_date"),
  docketNumber: createField("bankruptcy_docket", ""),
  court: {
    courtName: createField("bankruptcy_court_name", ""),
    address: createDefaultAddress("bankruptcy_court_address")
  },
  totalAmount: createDefaultAmountField("bankruptcy_amount"),
  dischargeDate: createDefaultDateInfo("bankruptcy_discharge_date"),
  isCurrentlyInBankruptcy: createField<"YES" | "NO">("bankruptcy_current", "NO"),
  explanation: createField("bankruptcy_explanation", "")
});

/**
 * Create default Section 26
 */
export const createDefaultSection26 = (): Section26 => ({
  _id: Date.now(),
  section26: {
    bankruptcy: {
      hasBankruptcyFilings: createField<"YES" | "NO">("has_bankruptcy", "NO"),
      entries: [],
      entriesCount: 0
    },
    gambling: {
      hasGamblingProblems: createField<"YES" | "NO">("has_gambling", "NO"),
      entries: [],
      entriesCount: 0
    },
    taxDelinquency: {
      hasTaxDelinquencies: createField<"YES" | "NO">("has_tax_delinquency", "NO"),
      entries: [],
      entriesCount: 0
    },
    creditCardViolations: {
      hasCreditCardViolations: createField<"YES" | "NO">("has_credit_violations", "NO"),
      entries: [],
      entriesCount: 0
    },
    creditCounseling: {
      isUtilizingCreditCounseling: createField<"YES" | "NO">("has_credit_counseling", "NO"),
      entries: [],
      entriesCount: 0
    },
    financialObligations: {
      hasAlimonyChildSupportDelinquencies: createField<"YES" | "NO">("has_alimony_child_support", "NO"),
      alimonyChildSupportEntries: [],
      hasJudgments: createField<"YES" | "NO">("has_judgments", "NO"),
      judgmentEntries: [],
      hasLiens: createField<"YES" | "NO">("has_liens", "NO"),
      lienEntries: [],
      hasFederalDebt: createField<"YES" | "NO">("has_federal_debt", "NO"),
      federalDebtEntries: [],
      totalEntriesCount: 0
    },
    financialProblems: {
      hasForeclosuresRepossessions: createField<"YES" | "NO">("has_foreclosures", "NO"),
      foreclosureRepossessionEntries: [],
      hasDefaults: createField<"YES" | "NO">("has_defaults", "NO"),
      defaultEntries: [],
      hasCollections: createField<"YES" | "NO">("has_collections", "NO"),
      collectionEntries: [],
      hasSuspendedAccounts: createField<"YES" | "NO">("has_suspended_accounts", "NO"),
      suspendedAccountEntries: [],
      hasEvictions: createField<"YES" | "NO">("has_evictions", "NO"),
      evictionEntries: [],
      hasGarnishments: createField<"YES" | "NO">("has_garnishments", "NO"),
      garnishmentEntries: [],
      hasPastDelinquencies: createField<"YES" | "NO">("has_past_delinquencies", "NO"),
      pastDelinquencyEntries: [],
      hasCurrentDelinquencies: createField<"YES" | "NO">("has_current_delinquencies", "NO"),
      currentDelinquencyEntries: [],
      totalEntriesCount: 0
    }
  }
});

// ============================================================================
// VALIDATION FUNCTIONS
// ============================================================================

/**
 * Validate Section 26 data
 */
export const validateSection26 = (
  data: Section26,
  context: Section26ValidationContext
): FinancialValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];
  const missingRequiredFields: string[] = [];
  const dateRangeIssues: string[] = [];
  const inconsistencies: string[] = [];
  const amountValidationIssues: string[] = [];

  // Validate bankruptcy entries
  if (data.section26.bankruptcy.hasBankruptcyFilings.value === "YES") {
    if (data.section26.bankruptcy.entries.length === 0) {
      errors.push("Bankruptcy entries are required when bankruptcy filings are indicated");
    }
    
    data.section26.bankruptcy.entries.forEach((entry, index) => {
      if (!entry.docketNumber.value) {
        missingRequiredFields.push(`Bankruptcy entry ${index + 1}: Docket number is required`);
      }
      if (!entry.court.courtName.value) {
        missingRequiredFields.push(`Bankruptcy entry ${index + 1}: Court name is required`);
      }
    });
  }

  // Validate date ranges
  const cutoffDate = new Date();
  cutoffDate.setFullYear(cutoffDate.getFullYear() - context.rules.timeframeYears);

  // Additional validation logic would go here...

  return {
    isValid: errors.length === 0 && missingRequiredFields.length === 0,
    errors,
    warnings,
    missingRequiredFields,
    dateRangeIssues,
    inconsistencies,
    amountValidationIssues
  };
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Check if any financial issues are reported
 */
export const hasAnyFinancialIssues = (data: Section26): boolean => {
  const section = data.section26;
  return (
    section.bankruptcy.hasBankruptcyFilings.value === "YES" ||
    section.gambling.hasGamblingProblems.value === "YES" ||
    section.taxDelinquency.hasTaxDelinquencies.value === "YES" ||
    section.creditCardViolations.hasCreditCardViolations.value === "YES" ||
    section.creditCounseling.isUtilizingCreditCounseling.value === "YES" ||
    section.financialObligations.hasAlimonyChildSupportDelinquencies.value === "YES" ||
    section.financialObligations.hasJudgments.value === "YES" ||
    section.financialObligations.hasLiens.value === "YES" ||
    section.financialObligations.hasFederalDebt.value === "YES" ||
    section.financialProblems.hasForeclosuresRepossessions.value === "YES" ||
    section.financialProblems.hasDefaults.value === "YES" ||
    section.financialProblems.hasCollections.value === "YES" ||
    section.financialProblems.hasSuspendedAccounts.value === "YES" ||
    section.financialProblems.hasEvictions.value === "YES" ||
    section.financialProblems.hasGarnishments.value === "YES" ||
    section.financialProblems.hasPastDelinquencies.value === "YES" ||
    section.financialProblems.hasCurrentDelinquencies.value === "YES"
  );
};

/**
 * Get total entry count across all subsections
 */
export const getTotalEntryCount = (data: Section26): number => {
  const section = data.section26;
  return (
    section.bankruptcy.entriesCount +
    section.gambling.entriesCount +
    section.taxDelinquency.entriesCount +
    section.creditCardViolations.entriesCount +
    section.creditCounseling.entriesCount +
    section.financialObligations.totalEntriesCount +
    section.financialProblems.totalEntriesCount
  );
};

/**
 * Get financial summary
 */
export const getFinancialSummary = (data: Section26) => {
  return {
    hasAnyIssues: hasAnyFinancialIssues(data),
    totalEntries: getTotalEntryCount(data),
    subsectionSummary: {
      bankruptcy: data.section26.bankruptcy.entriesCount,
      gambling: data.section26.gambling.entriesCount,
      taxDelinquency: data.section26.taxDelinquency.entriesCount,
      creditCardViolations: data.section26.creditCardViolations.entriesCount,
      creditCounseling: data.section26.creditCounseling.entriesCount,
      financialObligations: data.section26.financialObligations.totalEntriesCount,
      financialProblems: data.section26.financialProblems.totalEntriesCount
    }
  };
}; 