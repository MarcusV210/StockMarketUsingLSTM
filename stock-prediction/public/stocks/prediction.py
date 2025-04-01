import pandas as pd
import numpy as np
import seaborn as sns
import matplotlib.pyplot as plt
import datetime
from sklearn.metrics import precision_score, accuracy_score
from sklearn.preprocessing import MinMaxScaler
import tensorflow as tf
from tensorflow import keras
from tensorflow.keras import layers
import joblib
import json
import re
from flask import Flask, jsonify


def clean_filename(name):
    """Removes invalid characters from filenames."""
    return re.sub(r'[^\w\-_]', '', name)

def save_scaler_json(scaler, filename):

    filename = clean_filename(filename)

    scaler_params = {
        "min": scaler.min_.tolist(),  # Convert numpy array to list
        "scale": scaler.scale_.tolist()
    }
    with open(filename, "w") as f:
        json.dump(scaler_params, f)

def preprocess(dataframe):
    dataframe['Date'] = dataframe['Date'].apply(pd.to_datetime) #Converting object to date
    dataframe.index = dataframe['Date'] #index as date
    dataframe.drop('Date', inplace = True, axis = 1) #Removing date column

    day = datetime.datetime(2010, 1, 3) # the start value
    dataframe = dataframe.loc[day:]

    dataframe['Tomorrow'] = dataframe['Close'].shift(-1)
    dataframe['Target'] = (dataframe['Tomorrow'] > dataframe['Close']).astype(int) #finding the target

    horizons = [2,5,60,250,1000] #2 days, 5 days, 2 months, 1 year, 4 years
    new_predictors = []

    for horizon in horizons:
        rolling_averages = dataframe.rolling(horizon).mean()
        
        ratio_column = f"Close_Ratio_{horizon}"
        dataframe[ratio_column] = dataframe["Close"] / rolling_averages["Close"]
        
        trend_column = f"Trend_{horizon}"
        dataframe[trend_column] = dataframe.shift(1).rolling(horizon).sum()["Target"]
        
        new_predictors += [ratio_column, trend_column] 

    dataframe.dropna(inplace = True)

    scaler = MinMaxScaler()

    dataframe_scaled = dataframe.copy()

    features = list(dataframe_scaled.columns)
    features.remove('Target')

    dataframe_scaled[features] = scaler.fit_transform(dataframe_scaled[features])
    # save_scaler_json(scaler,f"{dataframe}.json")

    return dataframe_scaled, features

def data_split(dataframe):
    q_80 = int(len(dataframe) * 0.8)
    q_90 = int(len(dataframe) * 0.9)

    train, validation, test = dataframe.iloc[:q_80], dataframe.iloc[q_80:q_90], dataframe.iloc[q_90:]

    # Separate features and target correctly
    X_train = train.drop(columns=['Target']).values
    y_train = train['Target'].values

    X_validation = validation.drop(columns=['Target']).values
    y_validation = validation['Target'].values

    X_test = test.drop(columns=['Target']).values
    y_test = test['Target'].values

    # Reshape for LSTM
    LSTM_train = X_train.reshape((X_train.shape[0], 1, X_train.shape[1]))
    LSTM_validation = X_validation.reshape((X_validation.shape[0], 1, X_validation.shape[1]))
    LSTM_test = X_test.reshape((X_test.shape[0], 1, X_test.shape[1]))

    return LSTM_train, y_train, LSTM_validation, y_validation, LSTM_test, y_test

def create_LSTM(l_train, l_validation, l_test, y_train, y_validation, y_test):
    LSTM = keras.Sequential([
        layers.LSTM(64, return_sequences=True, input_shape=(l_train.shape[1], l_train.shape[2])), #64, input layer
        layers.LSTM(32), #32 neurons, hidden layer 1
        layers.Dense(16, activation="relu"), #16 neurons, hidden layer 2
        layers.Dense(1, activation="sigmoid") #1 neuron, output layer, sigmoid for classification
    ])

    LSTM.compile(optimizer="adam", loss="binary_crossentropy", metrics=["accuracy"])
    LSTM.fit(l_train, y_train, epochs=100, batch_size=32, validation_data=(l_validation, y_validation))
    LSTM_test_loss, LSTM_test_acc = LSTM.evaluate(l_test, y_test)

    preds = LSTM.predict(l_test)

    return LSTM, LSTM_test_loss, LSTM_test_acc, preds

def train_model(dataframe):
    dataframe_scaled, features = preprocess(dataframe)
    LSTM_train, y_train, LSTM_validation, y_validation, LSTM_test, y_test = data_split(dataframe_scaled)
    model, loss, acc, predicted_value = create_LSTM(LSTM_train, LSTM_validation, LSTM_test, y_train, y_validation, y_test)

    print(f"The loss is {loss} and the accuracy is {acc}")
    print("Predicted value is", predicted_value)

    return model, loss, acc, predicted_value



files = ["D:/VS_Code/ReactJS/stock-prediction/public/stocks/AAPL.csv",
         "D:/VS_Code/ReactJS/stock-prediction/public/stocks/AMZN.csv",
         "D:/VS_Code/ReactJS/stock-prediction/public/stocks/GOOGL.csv",
         "D:/VS_Code/ReactJS/stock-prediction/public/stocks/META.csv",
         "D:/VS_Code/ReactJS/stock-prediction/public/stocks/NVDA.csv"]
prediction = {}
for i in files:
    df = pd.read_csv(i)

    LSTM, loss, acc, predicted_test = train_model(df)
    print(predicted_test.shape)
    tomorrow_prediction = predicted_test[-1, 0]

    prediction[i] = tomorrow_prediction

    # LSTM.save(f"{i}.h5")

for i in prediction:
    val = prediction[i]
    if(val > 0.5):
        prediction[i] = 1
    else:
        prediction[i] = 0

app = Flask(__name__)

@app.route('/predictions', methods=['GET'])
def get_predictions(preds):
    return jsonify(preds)

preds = get_predictions(prediction)
