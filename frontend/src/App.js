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

  const [theme, setTheme] = useState("light");

  const toggleThemeDark = () => {
    setTheme("dark");
    document.body.className = "dark";
    };
  

  const toggleThemeLight = () => {
    setTheme("light");
    document.body.className = "light";
  };

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
    <div className={`app-container ${theme}`}>
      <header className="header">
        <button className="theme-toggle-light" onClick={toggleThemeLight}>
          {"Light Mode"}
        </button>
        <button className="theme-toggle-dark" onClick={toggleThemeDark}>
          {"Dark Mode"}
        </button>
      </header>
      <div className="super-container">
        <Sidebar
          steps={steps}
          currentStep={currentStep}
          setCurrentStep={setCurrentStep}
        />
        <div className="step-container">
          <StepContent
            currentStep={currentStep}
            nextStep={nextStep}
            previousStep={previousStep}
            steps={steps}
          />
        </div>
      </div>
    </div>
  );
};

export default App;
