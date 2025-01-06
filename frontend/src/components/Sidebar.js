import React from "react";

const Sidebar = ({ steps, currentStep, setCurrentStep }) => {
  return (
    <div className="w-1/4 bg-gray-800 text-white flex flex-col p-4">
      <h2 className="text-lg font-bold mb-4">Steps</h2>
      {steps.map((step, index) => (
        <button
          key={index}
          className={`p-3 rounded-md my-1 ${
            index + 1 === currentStep
              ? "bg-green-500"
              : index + 1 < currentStep
              ? "bg-gray-500"
              : "bg-gray-700 cursor-not-allowed"
          }`}
          onClick={() => {
            if (index + 1 <= currentStep) setCurrentStep(index + 1);
          }}
          disabled={index + 1 > currentStep}
        >
          {index + 1}. {step}
        </button>
      ))}
    </div>
  );
};

export default Sidebar;
