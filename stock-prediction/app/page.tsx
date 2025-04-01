"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import RightSection from "../components/ui/RightSection";
import Image from "next/image";

const stocks = ["NVDA", "META", "AAPL", "AMZN", "GOOGL"];

export default function StockPrediction() {
  const [selectedStock, setSelectedStock] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showHome, setShowHome] = useState(true); // Controls whether homepage or stock data is shown

  // Filter stocks based on search
  const filteredStocks = stocks.filter((stock) =>
    stock.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex h-screen">
      {/* Left Sidebar */}
      <div className="w-1/4 p-4 border-r bg-gray-100 dark:bg-gray-900">
        <Input
          placeholder="Search stocks..."
          className="mb-4 p-2 w-full"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <ul>
          {filteredStocks.length > 0 ? (
            filteredStocks.map((stock) => (
              <li
                key={stock}
                className="p-2 cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700 rounded-md text-gray-900 dark:text-white"
                onClick={() => {
                  setSelectedStock(stock);
                  setShowHome(false);
                }}
              >
                {stock}
              </li>
            ))
          ) : (
            <li className="text-gray-500">No results found.</li>
          )}
        </ul>
      </div>

      {/* Right Section */}
      <div className="w-3/4 p-4">
        {showHome ? (
          // Homepage View
          <div className="flex flex-col items-center justify-center">
            <div className="bg-black text-white p-6 rounded-lg text-center">
              <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white shadow-md">
                Stock Prediction with LSTM
              </h1>
              <p className="text-lg text-gray-700 dark:text-gray-300">
                Welcome to this website. The Algorithm uses an Recurrent Neural Network, specifically a Long Short Term Memory RNN tp predict whether the closing price on the next day would go up(1) or down(0). We used an LSTM because it captures and understands long term data pretty well. The model has an input layer with 64 neurons, two hidden layers with 32 and 16 neurons each and an output layer.
            
              </p>
              <p className="text-lg text-gray-700 dark:text-gray-300">
                The data we used is the past 25 years of ['Date','Close','Open','High','Low','Volume'] like data and it's preprocessed to find close ratios and trends of the horizons [2,5,60,250,1000] which is 2 days, 1 week, 2 months, 1 year and 4 years. These columns are used to decide whether the close price would go up or down the next day. 
              </p>
            </div>

            {/* Neural Network Diagram */}
            <div className="mt-6">
              <Image
                src="/lstm-diagram.jpeg"
                alt="LSTM Neural Network"
                width={600}
                height={400}
                className="rounded-xl shadow-lg"
              />
            </div>
          </div>
        ) : (
          // Stock Data View
          <div>
            <button
              className="mb-4 p-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
              onClick={() => setShowHome(true)}
            >
              Back to Homepage
            </button>
            <RightSection selectedStock={selectedStock!} />
          </div>
        )}
      </div>
    </div>
  );
}
