import React from "react";

const Sidebar = ({ steps, currentStep, setCurrentStep }) => {
  return (
    <div className="sidebar">
      {/* <h2 className="sidebar-title">Steps</h2> */}
      {steps.map((step, index) => (
        <button
          key={index}
          className={`step-button step-${index + 1} ${index + 1 === currentStep ? "active" : index + 1 < currentStep ? "completed" : "disabled"}`}
          onClick={() => {
            if (index + 1 <= currentStep) setCurrentStep(index + 1);
          }}
          disabled={index + 1 > currentStep}
        >
          {step}
        </button>
      ))}
    </div>
  );
};

export default Sidebar;
