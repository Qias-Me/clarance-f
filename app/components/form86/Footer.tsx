// StepperFooter.tsx
import React from 'react';

interface StepperFooterProps {
  currentStep: number;
  totalSteps: number;
  nextStep?: () => void; // Optional if using direct functions
  prevStep?: () => void; // Optional if using direct functions
  onChangeStep: (step: number) => void; // Keep for direct step changes
}

const StepperFooter: React.FC<StepperFooterProps> = ({
  currentStep,
  totalSteps,
  nextStep,
  prevStep,
  onChangeStep,
}) => {
  const progressPercentage = ((currentStep / totalSteps) * 100).toFixed(0);

  return (
    <footer className="footer footer-expand-lg text-light fixed-bottom bg-dark footer-dark py-3 flex justify-between">
      <button onClick={prevStep || (() => onChangeStep(currentStep - 1))} disabled={currentStep === 1} className="btn btn-secondary">Back</button>
      <span>{progressPercentage}% Complete</span>
      <button onClick={nextStep || (() => onChangeStep(currentStep + 1))} disabled={currentStep === totalSteps} className="btn btn-primary">Next</button>
    </footer>
  );
};

export default StepperFooter;
