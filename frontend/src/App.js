import React, { useState } from "react";
import Sidebar from "./components/Sidebar";
import StepContent from "./components/StepContent";

const App = () => {
  const [currentStep, setCurrentStep] = useState(1);

  const steps = [
    "Data Preprocessing",
    "Training Model",
    "Evaluation",
    "Analyze Text",
  ];

  const nextStep = () => {
    if (currentStep < steps.length) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const previousStep = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  return (
    <div className="super-container">
      <Sidebar steps={steps} currentStep={currentStep} setCurrentStep={setCurrentStep} />
      <div className="step-container">
        <StepContent 
          currentStep={currentStep} 
          nextStep={nextStep}
          previousStep={previousStep}
          steps={steps} />
      </div>
    </div>
  );
};

export default App;
