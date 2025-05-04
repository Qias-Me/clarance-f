// PageTemplate.tsx
import React from 'react';
import StepperFooter from './Footer';
import Header from './Header'; // Assuming you have a Header component

interface PageTemplateProps {
  children: React.ReactNode;
  currentStep: number;
  setCurrentStep: (step: number) => void;
  totalSteps?: number;
}

const PageTemplate: React.FC<PageTemplateProps> = ({
  children,
  currentStep,
  setCurrentStep,
  totalSteps = 29,
}) => {
  // Function to increment the current step
  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  // Function to decrement the current step
  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <div className="font-sans">
      <Header /> {/* Small Header */}
      {children}
      <StepperFooter
        currentStep={currentStep}
        totalSteps={totalSteps}
        onChangeStep={setCurrentStep}
        nextStep={nextStep}
        prevStep={prevStep}
      />
    </div>
  );
};

export default PageTemplate;
