import React, { useState } from "react";

const HomePage: React.FC = () => {
  const [description, setDescription] = useState(
    "Welcome to the Stock Prediction Website. This tool uses LSTM neural networks to predict stock price movements based on historical data."
  );

  return (
    <div className="flex flex-col items-center justify-center p-6">
      {/* Description Section */}
      <div className="w-3/4 text-center p-4 bg-gray-100 rounded-xl shadow-md">
        <h1 className="text-2xl font-bold mb-2">Stock Prediction with LSTM</h1>
        <textarea
          className="w-full p-2 border rounded-md resize-none bg-white"
          rows={4}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>

      {/* Neural Network Diagram */}
      <div className="mt-6">
        <img
          src="/lstm-diagram.jpg"
          alt="LSTM Neural Network"
          className="rounded-xl shadow-lg"
          width={600}
        />
      </div>
    </div>
  );
};

export default HomePage;
