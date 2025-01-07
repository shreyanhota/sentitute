import React, { useState } from "react";
import CodeBlock from "./CodeBlock";
import PlotDisplay from "./PlotDisplay";
import { useEffect } from 'react';
import { io } from 'socket.io-client';
import { Line } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, LineElement, PointElement, Title, Tooltip, Legend } from "chart.js";

ChartJS.register(
    CategoryScale,
    LinearScale,
    LineElement,
    PointElement,
    Title,
    Tooltip,
    Legend
  );

// TrainingControls Component: Used to get batchSize and epochSize inputs
const TrainingControls = ({ onTrain }) => {
  const [batchSize, setBatchSize] = useState(32);
  const [epochSize, setEpochSize] = useState(10);

  const handleTrain = () => {
    onTrain(batchSize, epochSize); // Trigger training with the input values
  };

  return (
    <div className="mt-4">
      <div className="mb-4">
        <label className="block mb-2 text-sm font-medium">Batch Size:</label>
        <input
          type="number"
          value={batchSize}
          onChange={(e) => setBatchSize(Number(e.target.value))}
          className="w-full p-2 border rounded-md"
        />
      </div>
      <div className="mb-4">
        <label className="block mb-2 text-sm font-medium">Epoch Size:</label>
        <input
          type="number"
          value={epochSize}
          onChange={(e) => setEpochSize(Number(e.target.value))}
          className="w-full p-2 border rounded-md"
        />
      </div>
      <button
        onClick={handleTrain}
        className="px-4 py-2 bg-blue text-white rounded-md"
      >
        Train Model
      </button>
    </div>
  );
};

// TrainingModel Component: Handles model training, progress, and results
const TrainingModel = () => {
  const [trainingStatus, setTrainingStatus] = useState(null);
  const [accuracy, setAccuracy] = useState(null);
  const [progress, setProgress] = useState(0);
  const [modelMetrics, setModelMetrics] = useState(null);
  // const [imageUrl, setImageUrl] = useState(null);
  const [trainAccuracy, setTrainAccuracy] = useState([]);
  const [valAccuracy, setValAccuracy] = useState([]);
  const [labels, setLabels] = useState([]);

  const socket = io("http://localhost:5000"); // Connect to Flask server using Socket.IO

  useEffect(() => {
    socket.on("progress", (data) => {
      setProgress(data.progress);
    });

    socket.on("plot_data", (data) => {
        const { train_accuracy, val_accuracy } = data;
              // Update the chart data
      setTrainAccuracy(train_accuracy);
      setValAccuracy(val_accuracy);
      setLabels(train_accuracy.map((_, index) => `Epoch ${index + 1}`));

    socket.on("model_metrics", (metrics) => {
        setModelMetrics(metrics);
      });

    // socket.on('training_complete', (data) => {
    //     setImageUrl(data.image_url);
    //     console.log('Training Complete:', data);
      });

    return () => {
      socket.off("progress");
      socket.off('plot_data');
    };
  }, []);

  const data = {
    labels: labels,
    datasets: [
      {
        label: "Training Accuracy",
        data: trainAccuracy,
        borderColor: "rgba(75,192,192,1)",
        backgroundColor: "rgba(75,192,192,0.2)",
        fill: true,
      },
      {
        label: "Validation Accuracy",
        data: valAccuracy,
        borderColor: "rgba(153,102,255,1)",
        backgroundColor: "rgba(153,102,255,0.2)",
        fill: true,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: { title: { display: true, text: "Epochs" } },
      y: { title: { display: true, text: "Accuracy" } },
    },
  };


  const startTraining = async (batchSize, epochSize) => {
    setTrainingStatus("Training started...");
    setProgress(0);
    setAccuracy(null);
    setModelMetrics(null);

    // Send training parameters to Flask backend
    const response = await fetch("http://localhost:5000/start_training", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ batch_size: batchSize, epochs: epochSize }),
    });

    if (response.ok) {
      setTrainingStatus("Training in progress...");
    } else {
      setTrainingStatus("Failed to start training.");
    }
  };

  return (
    <div>
      <TrainingControls onTrain={startTraining} />
      {trainingStatus && <p className="mt-4">{trainingStatus}</p>}
      {progress > 0 && progress < 100 && (
        <div className="mt-4">
          <p>Training Progress: {progress}%</p>
        </div>
      )}
      {accuracy && <p className="text-green">Accuracy: {accuracy}%</p>}
      {modelMetrics && (
        <div className="mt-4">
          <p>Final Accuracy: {modelMetrics.accuracy}</p>
          <p>Final Loss: {modelMetrics.loss}</p>
        </div>
      )}

      <div style={{ height: "400px", width: "100%" }}>
      <Line data={data} options={options} />
    </div>
    </div>
  );
};

// StepContent Component: Contains all steps, including training and visualization
const StepContent = ({ currentStep, nextStep, previousStep, steps }) => {
  const [textInput, setTextInput] = useState("");
  const [sentiment_percentage, setSentimentResult] = useState(null);

  const analyzeSentiment = async () => {
    try {
      const response = await fetch("http://localhost:5000/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: textInput }),
      });
      if (response.ok) {
        const data = await response.json();
        setSentimentResult(data.sentiment_percentage);
      } else {
        setSentimentResult("Error analyzing sentiment.");
      }
    } catch (error) {
      console.error("Error:", error);
      setSentimentResult("Failed to connect to the server.");
    }
  };


  const content = [
    {
      title: "Data Preprocessing",
      description: "The following code preprocesses the dataset:",
      code: `# Python code for data preprocessing
import numpy as np
from datasets import load_dataset
...
train_sentences, train_labels = dataset_to_numpy_binary(train_data)`,
    },
    {
      title: "Training Model",
      description: "Adjust hyperparameters and train the model.",
      component: <TrainingModel />,
    },
    {
      title: "Evaluation",
      description: "View metrics and plots for model evaluation.",
      component: <PlotDisplay />,
    },
    {
      title: "Analyze Text",
      description: "Enter a text below to analyze its sentiment:",
      component: (
        <div className="mt-4">
          <textarea
            className="w-full p-4 border rounded-md"
            placeholder="Enter text..."
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
          />
          <button
            className="mt-2 px-4 py-2 bg-green text-white rounded-md"
            onClick={analyzeSentiment}
          >
            Analyze
          </button>
          {sentiment_percentage && (
            <div className="mt-4 p-2 border rounded-md">
              Sentiment: {sentiment_percentage}
            </div>
          )}
        </div>
      ),
    },
  ];

  const step = content[currentStep - 1];

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">{step.title}</h2>
      <p className="mb-4">{step.description}</p>
      {step.code && <CodeBlock code={step.code} />}
      {step.component && step.component}
      <div className="mt-8 flex justify-between">
        <button
          onClick={previousStep}
          disabled={currentStep === 1}
          className={`px-4 py-2 bg-gray rounded-md ${currentStep === 1 ? "cursor-not-allowed" : ""}`}
        >
          Previous
        </button>
        <button
          onClick={nextStep}
          className="px-4 py-2 bg-blue text-white rounded-md"
        >
          {currentStep === steps.length ? "Finish" : "Next"}
        </button>
      </div>
    </div>
  );
};

export default StepContent;
