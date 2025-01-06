import React from "react";

const PlotDisplay = () => {
  return (
    <div>
      <button className="px-4 py-2 bg-blue-500 text-white rounded-md">
        Show Accuracy Plot
      </button>
      <button className="px-4 py-2 bg-blue-500 text-white rounded-md ml-2">
        Show Precision/Recall Plot
      </button>
    </div>
  );
};

export default PlotDisplay;
