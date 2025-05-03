// import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
// import { PersonalInformationProvider, usePersonalInformation } from './PersonalInformationContext';
// import { DateAndPlaceOfBirthProvider, useDateAndPlaceOfBirth } from './DateAndPlaceOfBirthContext';
// import { SSNProvider, useSSN } from './SSNContext';
// import { OtherNamesProvider, useOtherNames } from './OtherNamesContext';
// import { CurrentAddressProvider, useCurrentAddress } from './CurrentAddressContext';
// import { ContactInformationProvider, useContactInformation } from './ContactInformationContext';
// import { USPassportProvider, useUSPassport } from './USPassportContext';
// import { CitizenshipProvider, useCitizenship } from './CitizenshipContext';
// import { DualCitizenshipProvider, useDualCitizenship } from './DualCitizenshipContext';
// import { AlienRegistrationProvider, useAlienRegistration } from './AlienRegistrationContext';
// import { PeopleWhoKnowYouProvider, usePeopleWhoKnowYou } from './PeopleWhoKnowYouContext';
// import { ResidenceProvider, useResidence } from './ResidenceContext';
// import { EducationProvider, useEducation } from './EducationContext';
// import { EmploymentProvider, useEmployment } from './EmploymentContext';
// import { EmploymentActivitiesProvider, useEmploymentActivities } from './EmploymentActivitiesContext';
// import { SelectiveServiceProvider, useSelectiveService } from './SelectiveServiceContext';
// import { MilitaryHistoryProvider, useMilitaryHistory } from './MilitaryHistoryContext';
// import { ForeignContactsProvider, useForeignContacts } from './ForeignContactsContext';
// import { ForeignActivitiesProvider, useForeignActivities } from './ForeignActivitiesContext';
// import { ForeignBusinessProvider, useForeignBusiness } from './ForeignBusinessContext';
// import { MentalHealthProvider, useMentalHealth } from './MentalHealthContext';
// import { AlcoholProvider, useAlcohol } from './AlcoholContext';
// import { DrugsUseProvider, useDrugsUse } from './DrugsUseContext';
// import { FinancialRecordProvider, useFinancialRecord } from './FinancialRecordContext';
// import { CivilCourtRecordProvider, useCivilCourtRecord } from './CivilCourtRecordContext';
// import { InvestigativeHistoryProvider, useInvestigativeHistory } from './InvestigativeHistoryContext';
// import { PublicRecordProvider, usePublicRecord } from './PublicRecordContext';
// import { AssociationProvider, useAssociation } from './AssociationContext';
// import { SignatureAndCertificationProvider, useSignatureAndCertification } from './SignatureAndCertificationContext';

// // Master form context type
// interface SF86FormContextType {
//   currentSection: number;
//   setCurrentSection: (section: number) => void;
//   goToNextSection: () => void;
//   goToPrevSection: () => void;
//   isFormComplete: boolean;
//   checkFormCompletion: () => void;
//   saveForm: () => Promise<boolean>;
//   loadForm: () => Promise<boolean>;
//   validateCurrentSection: () => boolean;
// }

// // Create context
// const SF86FormContext = createContext<SF86FormContextType | undefined>(undefined);

// // Provider component
// export const SF86FormProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
//   const [currentSection, setCurrentSection] = useState<number>(1);
//   const [isFormComplete, setFormComplete] = useState<boolean>(false);
  
//   // References to section-specific contexts would be used here
//   // This is a placeholder showing the pattern, but actual implementation would need to use the generated hooks
  
//   // Navigation functions
//   const goToNextSection = () => {
//     if (currentSection < 29) {
//       setCurrentSection(prev => prev + 1);
//     }
//   };
  
//   const goToPrevSection = () => {
//     if (currentSection > 1) {
//       setCurrentSection(prev => prev - 1);
//     }
//   };
  
//   // Check form completion status
//   const checkFormCompletion = () => {
//     // Logic to check completion status of all sections
//     // This would use the isComplete state from all section contexts
//     setFormComplete(false); // Placeholder
//   };
  
//   // Save form data (placeholder)
//   const saveForm = async (): Promise<boolean> => {
//     try {
//       // Logic to save all section data
//       console.log('Saving form data...');
//       return true;
//     } catch (error) {
//       console.error('Error saving form:', error);
//       return false;
//     }
//   };
  
//   // Load form data (placeholder)
//   const loadForm = async (): Promise<boolean> => {
//     try {
//       // Logic to load all section data
//       console.log('Loading form data...');
//       return true;
//     } catch (error) {
//       console.error('Error loading form:', error);
//       return false;
//     }
//   };
  
//   // Validate current section
//   const validateCurrentSection = (): boolean => {
//     // This would call the validate() function of the current section context
//     return true; // Placeholder
//   };
  
//   useEffect(() => {
//     // Check form completion whenever current section changes
//     checkFormCompletion();
//   }, [currentSection]);
  
//   return (
//     <SF86FormContext.Provider value={{
//       currentSection,
//       setCurrentSection,
//       goToNextSection,
//       goToPrevSection,
//       isFormComplete,
//       checkFormCompletion,
//       saveForm,
//       loadForm,
//       validateCurrentSection
//     }}>
//       {/* Wrap with all section providers */}
//       <PersonalInformationProvider>
//       <DateAndPlaceOfBirthProvider>
//       <SSNProvider>
//       <OtherNamesProvider>
//       <CurrentAddressProvider>
//       <ContactInformationProvider>
//       <USPassportProvider>
//       <CitizenshipProvider>
//       <DualCitizenshipProvider>
//       <AlienRegistrationProvider>
//       <PeopleWhoKnowYouProvider>
//       <ResidenceProvider>
//       <EducationProvider>
//       <EmploymentProvider>
//       <EmploymentActivitiesProvider>
//       <SelectiveServiceProvider>
//       <MilitaryHistoryProvider>
//       <ForeignContactsProvider>
//       <ForeignActivitiesProvider>
//       <ForeignBusinessProvider>
//       <MentalHealthProvider>
//       <AlcoholProvider>
//       <DrugsUseProvider>
//       <FinancialRecordProvider>
//       <CivilCourtRecordProvider>
//       <InvestigativeHistoryProvider>
//       <PublicRecordProvider>
//       <AssociationProvider>
//       <SignatureAndCertificationProvider>
//       {children}
//       </SignatureAndCertificationProvider>
//       </AssociationProvider>
//       </PublicRecordProvider>
//       </InvestigativeHistoryProvider>
//       </CivilCourtRecordProvider>
//       </FinancialRecordProvider>
//       </DrugsUseProvider>
//       </AlcoholProvider>
//       </MentalHealthProvider>
//       </ForeignBusinessProvider>
//       </ForeignActivitiesProvider>
//       </ForeignContactsProvider>
//       </MilitaryHistoryProvider>
//       </SelectiveServiceProvider>
//       </EmploymentActivitiesProvider>
//       </EmploymentProvider>
//       </EducationProvider>
//       </ResidenceProvider>
//       </PeopleWhoKnowYouProvider>
//       </AlienRegistrationProvider>
//       </DualCitizenshipProvider>
//       </CitizenshipProvider>
//       </USPassportProvider>
//       </ContactInformationProvider>
//       </CurrentAddressProvider>
//       </OtherNamesProvider>
//       </SSNProvider>
//       </DateAndPlaceOfBirthProvider>
//       </PersonalInformationProvider>
//     </SF86FormContext.Provider>
//   );
// };

// // Custom hook
// export const useSF86Form = (): SF86FormContextType => {
//   const context = useContext(SF86FormContext);
  
//   if (context === undefined) {
//     throw new Error('useSF86Form must be used within a SF86FormProvider');
//   }
  
//   return context;
// };
