import { useFormContext } from "../lastTry/Formcontext";

const StepperControls = () => {
  const { currentStep, goToNextStep, goToPrevStep } = useFormContext();

  return (
    <div>
      {currentStep > 1 && <button onClick={goToPrevStep}>Previous</button>}
      <button onClick={goToNextStep}>Next</button>
    </div>
  );
};

export default StepperControls;
