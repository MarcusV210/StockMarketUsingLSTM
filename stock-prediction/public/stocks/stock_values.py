import requests
import datetime
import numpy as np
import pandas as pd
import joblib
from tensorflow.keras.models import load_model
import json
from prediction.py import preprocess


tickers = ['AAPL','AMZN','GOOGL','META','NVDA']

def load_scaler_json(filename):
    with open(filename, "r") as f:
        scaler_params = json.load(f)
    
    scaler = MinMaxScaler()
    scaler.min_ = np.array(scaler_params["min"])
    scaler.scale_ = np.array(scaler_params["scale"])
    return scaler

# Polygon.io API Key
API_KEY = "wsCRP7chP4TUzSqfD3ifSTgdTxzVGbMF"

# List of tickers and corresponding models/scalers


# Get yesterday's date (handle weekends)
yesterday = datetime.datetime.today() - datetime.timedelta(days=1)
while yesterday.weekday() >= 5:  # If it's Saturday (5) or Sunday (6), go back further
    yesterday -= datetime.timedelta(days=1)
yesterday_str = yesterday.strftime("%Y-%m-%d")

# Function to fetch and preprocess stock data
def fetch_and_preprocess_stock_data(ticker):
    url = f"https://api.polygon.io/v2/aggs/ticker/{ticker}/range/1/day/{yesterday_str}/{yesterday_str}?adjusted=true&apiKey={API_KEY}"
    
    response = requests.get(url)
    data = response.json()
    
    if "results" in data and data["results"]:
        stock_data = data["results"][0]  # Extract OHLCV data
        ohlcv = [[
            stock_data["o"],  # Open
            stock_data["h"],  # High
            stock_data["l"],  # Low
            stock_data["c"],  # Close
            stock_data["v"]   # Volume
        ]]
    else:
        raise ValueError(f"Invalid data received for {ticker}")

    # Convert to DataFrame and scale
    df = pd.DataFrame(ohlcv, columns=["Open", "High", "Low", "Close", "Volume"])
    df_scaled = scalers[ticker].transform(df)  # Use the specific company's scaler

    # Reshape for LSTM (batch_size=1, time_steps=1, features=5)
    return df_scaled



#Update dataset.
def update_dataset(ticker, data):
    df = pd.read_csv(f"{ticker}.csv")  # Load existing dataset
    new_data = data
    
    # Append yesterday's data
    new_entry = pd.DataFrame([new_data], columns=["Open", "High", "Low", "Close", "Volume"])
    df = pd.concat([df, new_entry], ignore_index=True)

    # Save updated dataset
    preprocess(df)

    df.to_csv(f"{ticker}.csv", index=False)

    return df


# Loop through each stock, preprocess.
for ticker in tickers:
    try:
        X_input = fetch_and_preprocess_stock_data(ticker)
        update_dataset(ticker, X_input)

        # update_dataset(ticker, X_input)
    except Exception as e:
        print(f"Error: {e}")




