"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { loadCSV } from "@/lib/utils";

interface StockData {
  Date: string;
  Close: string; // Ensure this matches your CSV data structure
}

interface RightSectionProps {
  selectedStock: string | null;
}

const RightSection: React.FC<RightSectionProps> = ({ selectedStock }) => {
  const [stockData, setStockData] = useState<StockData[]>([]);
  const [recommendation, setRecommendation] = useState<string>("");

  useEffect(() => {
    const fetchStockData = async () => {
      if (!selectedStock) return;

      try {
        const data: StockData[] = await loadCSV(selectedStock);
        console.log("Fetched data:", data); // Debugging log

        if (Array.isArray(data) && data.length > 0) {
          console.log("Valid data received:", data);
          setStockData([...data]);
          generateRecommendation(data);
        } else {
          console.warn("No valid data available.");
          setStockData([]);
          setRecommendation("No data available");
        }
      } catch (error) {
        console.error("Error loading stock data:", error);
        setStockData([]);
        setRecommendation("Error loading data");
      }
    };

    fetchStockData();
  }, [selectedStock]);

  const generateRecommendation = (data: StockData[]) => {
    if (data.length < 2) {
      setRecommendation("Not enough data");
      return;
    }

    const lastClose = parseFloat(data[data.length - 1]?.Close ?? "0");
    const prevClose = parseFloat(data[data.length - 2]?.Close ?? "0");

    setRecommendation(lastClose > prevClose ? "Sell 🚀" : "Buy 📉");
  };

  return (
    <Card className="p-4">
      <CardContent className="p-4">
        <h2 className="text-xl font-bold mb-4">Historical Data for {selectedStock ?? "N/A"}</h2>

        {/* Stock Price Chart */}
        <div className="w-full h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={stockData}>
              <XAxis 
                dataKey="Date" 
                tick={{ fill: "gray" }} 
                tickFormatter={(date: string | number) => {
                  const parsedDate = new Date(date);
                  return !isNaN(parsedDate.getTime()) ? parsedDate.getFullYear() : "";
                }} 
                tickLine={false} 
                 // Show only start & end abels
                angle={45} 
                textAnchor="middle" 
                dy={9} // Moves labels further below
              />
              <YAxis domain={["auto", "auto"]} tick={{ fill: "gray" }} />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const stockPoint = payload[0].payload;
                    const date = stockPoint.Price ? new Date(stockPoint.Price).toLocaleDateString() : "N/A"; 
                    const close = Number(stockPoint.Close ?? 0).toFixed(2);

                    return (
                      <div style={{ background: "#fff", padding: "5px", borderRadius: "5px" }}>
                        <p style={{ color: "#333" }}>{`Date: ${date}`}</p>
                        <p style={{ color: "#82ca9d" }}>{`Close: ${close}`}</p>
                      </div>
                    );
                  }
                  return null;
                }}
              />

              <Line type="monotone" dataKey="Close" stroke="#82ca9d" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Buy/Sell Recommendation */}
        <div className="mt-4 p-4 rounded-lg bg-gray-200 dark:bg-gray-800 text-center">
          <h3 className="text-lg font-semibold text-gray-700 dark:text-white">Recommendation</h3>
          <p className="text-2xl font-bold text-gray-900 dark:text-yellow-400">{recommendation}</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default RightSection;
