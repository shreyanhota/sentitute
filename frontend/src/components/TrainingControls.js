import React, { useState } from "react";

const TrainingControls = () => {
  const [hyperparams, setHyperparams] = useState({ epochs: 10, batchSize: 64 });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setHyperparams({ ...hyperparams, [name]: value });
  };

  return (
    <div>
      <div className="mb-4">
        <label className="block mb-2">Epochs:</label>
        <input
          type="number"
          name="epochs"
          value={hyperparams.epochs}
          onChange={handleChange}
          className="w-full p-2 border rounded-md"
        />
      </div>
      <div className="mb-4">
        <label className="block mb-2">Batch Size:</label>
        <input
          type="number"
          name="batchSize"
          value={hyperparams.batchSize}
          onChange={handleChange}
          className="w-full p-2 border rounded-md"
        />
      </div>
      <button className="px-4 py-2 bg-blue-500 text-white rounded-md">
        Start Training
      </button>
    </div>
  );
};

export default TrainingControls;
