import { useDispatch, useSelector } from "react-redux";
import {
  goToStep,
  selectCurrentStep,
} from "../../../state/user/formSlice"; // Ensure the correct import paths

interface StepperFooterProps {
  onStepChange?: (step: number) => void; // This now supports directly setting the step
  totalSteps: number; // Total number of steps in the stepper
}

const StepperFooter: React.FC<StepperFooterProps> = ({ onStepChange, totalSteps }: StepperFooterProps) => {
  const dispatch = useDispatch();
  const currentStep = useSelector(selectCurrentStep);

  const handleNext = () => {
    const nextStep = currentStep + 1;
    if (onStepChange) {
      onStepChange(nextStep);
    } else if (nextStep < totalSteps) {
      dispatch(goToStep(nextStep));
    }
  };

  const handlePrev = () => {
    const prevStep = currentStep - 1;
    if (onStepChange) {
      onStepChange(prevStep);
    } else if (prevStep >= 0) {
      dispatch(goToStep(prevStep));
    }
  };
  
  const handleStepSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const step = parseInt(e.target.value, 10);
    if (onStepChange) {
      onStepChange(step);
    } else {
      dispatch(goToStep(step)); // Implement this action in your redux slice
    }
  };

  return (
    <footer className="flex justify-between items-center p-4 bg-gray-100">
    <button
      onClick={handlePrev}
      disabled={currentStep === 0}
      className={`px-4 py-2 text-white font-semibold rounded-md transition-all duration-150 ${
        currentStep === 0 ? "bg-gray-400 cursor-not-allowed" : "bg-blue-500 hover:bg-blue-600 focus:ring-2 focus:ring-blue-300 focus:outline-none"
      }`}
    >
      Back
    </button>
    <select
      onChange={handleStepSelect}
      value={currentStep}
      className="form-select rounded-md"
    >
      {Array.from({ length: totalSteps }, (_, i) => (
        <option key={i} value={i}>
          Step {i + 1}
        </option>
      ))}
    </select>
    <span>
      Step {currentStep + 1} of {totalSteps}
    </span>
    <button
      onClick={handleNext}
      disabled={currentStep === totalSteps - 1}
      className={`px-4 py-2 text-white font-semibold rounded-md transition-all duration-150 ${
        currentStep === totalSteps - 1 ? "bg-gray-400 cursor-not-allowed" : "bg-green-500 hover:bg-green-600 focus:ring-2 focus:ring-green-300 focus:outline-none"
      }`}
    >
      Next
    </button>
  </footer>
  );
};

export default StepperFooter;
