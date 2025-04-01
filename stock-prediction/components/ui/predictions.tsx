import React, { useEffect, useState } from "react";
import axios from "axios";

const Predictions = () => {
    const [predictions, setPredictions] = useState(null);

    useEffect(() => {
        axios.get("http://127.0.0.1:5000/predictions")
            .then(response => setPredictions(response.data))
            .catch(error => console.error("Error fetching predictions:", error));
    }, []);

    return (
        <div>
            <h2>Tomorrow's Stock Predictions</h2>
            {predictions ? (
                <div>
                    <p><strong>Date:</strong> {predictions.date}</p>
                    <ul>
                        {Object.entries(predictions.predictions).map(([stock, price]) => (
                            <li key={stock}>{stock}: {typeof price === "number" ? price.toFixed(2) : "N/A"}</li>
                        ))}
                    </ul>
                </div>
            ) : (   
                <p>Loading predictions...</p>
            )}
        </div>
    );
};

export default Predictions;
