import Header from "../Header";
// import FormSectionThree from "./new_SSN";
// import FormSectionTwo from "./new_Birth";
// import FormSectionFour from "./new_Alias";
// import FormSectionFive from "./new_Contact";
import StepperFooter from "./stepperFooter";
import GetStarted from "../form/GetStarted";
import { useFormContext } from "../lastTry/Formcontext";
// import FormSectionSix from "./new_Attributes";
// import FormSectionSeven from "./new_Citizenship";
// import FormSectionEight from "./new_DuelCitizen";
import PersonalInfo from "../lastTry/sections/PersonalSection";
import AknowledgementInfo from "../lastTry/sections/AknowledgeSection";
import BirthInfo from "../lastTry/sections/BirthSection";
import Names from "../lastTry/sections/NamesSection"
const PageTemplate = () => {
  const { currentStep } = useFormContext();

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 0:
        return <GetStarted />;
      case 1:
        return <PersonalInfo sectionId={"personalInfo"} />;
      case 2:
        return <BirthInfo sectionId={"birthInfo"} />;
      case 3:
        return <Names sectionId={"names"} />;
      case 4:
        return <PersonalInfo sectionId={"physicalAttributes"} />;
      case 5:
        return <PersonalInfo sectionId={"contactInfo"} />;
      case 6:
        return <PersonalInfo sectionId={"citizenshipInfo"} />;
      case 7:
        return <PersonalInfo sectionId={"duelCitizenshipInfo"} />;
      case 8:
        return <PersonalInfo sectionId={"residencyInfo"} />;
      case 9:
        return <PersonalInfo sectionId={"names"} />;
      case 10:
        return <PersonalInfo sectionId={"passportInfo"} />;

      // case 6:
      //   return <PersonalInfo sectionId={"passportInfo"} />;
      // case 1:
      //   return <FormSectionOne key={currentStep} />;
      // case 2:
      //   return <FormSectionTwo key={currentStep} />;
      // case 3:
      //   return <FormSectionThree key={currentStep} />;
      // case 4:
      //   return <FormSectionFour key={currentStep} />;
      // case 5:
      //   return <FormSectionFive key={currentStep} />;
      // case 6:
      //   return <FormSectionSix key={currentStep} />;
      // case 7:
      //   return <FormSectionSeven key={currentStep} />;
      // case 8:
      //   return <FormSectionEight key={currentStep} />;
      case 29:
        return <AknowledgementInfo sectionId={"aknowledgementInfo"} />;

      default:
        return <div key="unknown">Unknown Step</div>;
    }
  };

  return (
    <div className="flex flex-col justify-between min-h-screen font-sans">
      <Header />
      <div className="flex-grow flex items-center justify-center">
        {renderCurrentStep()}
      </div>
      <StepperFooter />
    </div>
  );
};

export default PageTemplate;
